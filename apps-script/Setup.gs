/**
 * Setup.gs → Ejecutar UNA VEZ desde el editor: configurarSistema()
 */

function configurarSistema() {
  const ss = ss_();
  const sh = hojaRegistros_();

  // 0) Revisa que las columnas existentes estén en el orden que espera el sistema (si no, no toca nada)
  verificarColumnas_(sh);

  // 0b) Quita las reglas de validación antiguas de las columnas del sistema
  //     (se vuelven a crear más abajo, en la columna correcta: estado y letra)
  sh.getRange(2, 1, Math.max(sh.getMaxRows() - 1, 1), COLUMNAS.length).clearDataValidations();

  // 1) Encabezados: renombra "sexo" → "genero" y agrega las columnas nuevas
  crearEncabezados_(sh, COLUMNAS, '#1f4fa3');

  // 2) numRegistro: reemplaza las fórmulas =ROW()-1 por valores fijos
  //    (así eliminar una fila no cambia el número de los demás registros)
  const n = sh.getLastRow();
  if (n > 1) {
    const rango = sh.getRange(2, 2, n - 1, 1);
    const vals = rango.getValues();
    const fijos = vals.map((r, i) => [r[0] === '' ? '' : (parseInt(r[0], 10) || i + 1)]);
    rango.setValues(fijos);

    // estado vacío → Pendiente ; emailEnviado vacío → Sí (registros antiguos ya recibieron correo)
    const cEst = COLUMNAS.indexOf('estado') + 1, cMail = COLUMNAS.indexOf('emailEnviado') + 1;
    const est = sh.getRange(2, cEst, n - 1, 1).getValues();
    const mail = sh.getRange(2, cMail, n - 1, 1).getValues();
    sh.getRange(2, cEst, n - 1, 1).setValues(est.map((r, i) => [r[0] || (fijos[i][0] !== '' ? 'Pendiente' : '')]));
    sh.getRange(2, cMail, n - 1, 1).setValues(mail.map((r, i) => [r[0] || (fijos[i][0] !== '' ? 'Sí' : '')]));
  }

  // 2b) Versión 3: datos existentes a MAYÚSCULAS y opciones nuevas
  const convertidos = migrarDatosV3_(sh);
  if (convertidos) Logger.log('🔠 Registros convertidos a mayúsculas / opciones nuevas: ' + convertidos);

  // 3) Listas desplegables (estado y letra) y formato de fechas en columnas completas
  const filasMax = Math.max(sh.getMaxRows() - 1, 1);
  const regla = SpreadsheetApp.newDataValidation().requireValueInList(ESTADOS, true).setAllowInvalid(false).build();
  sh.getRange(2, COLUMNAS.indexOf('estado') + 1, filasMax, 1).setDataValidation(regla);
  const reglaLetra = SpreadsheetApp.newDataValidation().requireValueInList(CONFIG.LETRAS, true).setAllowInvalid(false).build();
  sh.getRange(2, COLUMNAS.indexOf('letra') + 1, filasMax, 1).setDataValidation(reglaLetra);
  sh.getRange(2, 1, filasMax, 1).setNumberFormat('dd/mm/yyyy hh:mm:ss');
  sh.getRange(2, COLUMNAS.indexOf('fechaMatricula') + 1, filasMax, 1).setNumberFormat('dd/mm/yyyy');
  sh.getRange(2, COLUMNAS.indexOf('fechaNacimiento') + 1, filasMax, 1).setNumberFormat('dd/mm/yyyy');
  sh.getRange(2, COLUMNAS.indexOf('fechaModificacion') + 1, filasMax, 1).setNumberFormat('dd/mm/yyyy hh:mm');
  sh.autoResizeColumns(1, COLUMNAS.length);

  // 4) Hojas auxiliares
  hojaUsuarios_();
  const claveAdmin = crearAdminInicialSiFalta_();
  if (!ss.getSheetByName(CONFIG.HOJA_ELIMINADOS)) crearEncabezados_(ss.insertSheet(CONFIG.HOJA_ELIMINADOS), ['eliminadoEl', 'eliminadoPor'].concat(COLUMNAS), '#b42318');
  if (!ss.getSheetByName(CONFIG.HOJA_BITACORA)) crearEncabezados_(ss.insertSheet(CONFIG.HOJA_BITACORA), ['fecha', 'usuario', 'accion', 'detalle'], '#5b6b8c');

  // Protege la hoja de usuarios (contiene hashes de contraseñas)
  try {
    const p = ss.getSheetByName(CONFIG.HOJA_USUARIOS).protect().setDescription('Usuarios del sistema');
    p.removeEditors(p.getEditors());
    if (p.canDomainEdit()) p.setDomainEdit(false);
  } catch (e) { Logger.log('Protección: ' + e); }

  Logger.log('✅ Sistema configurado.');
  if (claveAdmin) Logger.log('👤 Usuario inicial: ' + CONFIG.ADMIN_INICIAL_USUARIO + '  ·  Contraseña: ' + claveAdmin + '  (anótela; se pedirá cambiarla)');
  else Logger.log('👤 Ya existen usuarios: se mantienen sus contraseñas.');
  Logger.log('📧 Cuota de correos disponible hoy: ' + MailApp.getRemainingDailyQuota());
}

/** Crea un disparador diario (08:00) que reintenta los correos pendientes. */
function instalarDisparadorDiario() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'reenviarPendientes').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('reenviarPendientes').timeBased().everyDays(1).atHour(8).create();
  Logger.log('✅ Disparador diario instalado.');
}

/**
 * Deja los registros existentes con el formato de la versión 3 (se puede ejecutar varias veces):
 *  - Textos y opciones en MAYÚSCULAS (salvo correos, fechas y columnas internas).
 *  - Domicilio "Cedido" / "Allegado" → "OTROS".
 *  - Profesión de padre/madre vacía → "NO APLICA".
 *  - "alumnoAntiguo" según la escuela de procedencia.
 */
function migrarDatosV3_(sh) {
  const n = sh.getLastRow();
  if (n < 2) return 0;
  const sinTocar = ['timestamp', 'numRegistro', 'fechaMatricula', 'fechaNacimiento', 'edad', 'totalHijos', 'lugarQueOcupa',
    'personasEnCasa', 'correoEstudiante', 'correoApoderadoTitular', 'correoApoderadoSuplente', 'estado', 'nroMatricula',
    'emailEnviado', 'fechaModificacion', 'modificadoPor'];
  const rango = sh.getRange(2, 1, n - 1, COLUMNAS.length);
  const filas = rango.getValues();
  const col = k => COLUMNAS.indexOf(k);
  const liceo = claveOpcion_(CONFIG.NOMBRE_LICEO_PROCEDENCIA);
  let cambiados = 0;
  filas.forEach(f => {
    if (f[1] === '' || f[1] === null) return;
    const antes = JSON.stringify(f);
    COLUMNAS.forEach((k, i) => {
      if (sinTocar.indexOf(k) >= 0 || typeof f[i] !== 'string') return;
      f[i] = f[i].toUpperCase();
    });
    const dom = claveOpcion_(f[col('tipoDomicilio')]);
    if (dom === 'CEDIDO' || dom === 'ALLEGADO') f[col('tipoDomicilio')] = 'OTROS';
    if (!f[col('profesionPadre')]) f[col('profesionPadre')] = 'NO APLICA';
    if (!f[col('profesionMadre')]) f[col('profesionMadre')] = 'NO APLICA';
    if (!f[col('alumnoAntiguo')]) {
      const proc = claveOpcion_(f[col('procedenciaEscuela')]);
      f[col('alumnoAntiguo')] = (proc === liceo || proc.indexOf('CESAREO AGUIRRE') >= 0) ? 'SÍ' : 'NO';
    }
    if (JSON.stringify(f) !== antes) cambiados++;
  });
  if (cambiados) rango.setValues(filas);
  return cambiados;
}

/** Letra de columna de la hoja (1 → A, 27 → AA). */
function letraColumna_(n) {
  let s = '';
  while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
  return s;
}

/**
 * Comprueba que cada encabezado existente esté en la columna que espera el sistema.
 * Si alguien insertó, movió o borró columnas, se detiene con un mensaje claro y sin modificar datos.
 */
function verificarColumnas_(sh) {
  const ancho = Math.max(sh.getLastColumn(), 1);
  const cab = sh.getRange(1, 1, 1, ancho).getValues()[0].map(x => String(x).trim());
  const problemas = [];
  cab.forEach((h, i) => {
    if (!h) return;
    const k = h === 'sexo' ? 'genero' : h;
    const j = COLUMNAS.indexOf(k);
    if (j >= 0 && j !== i) problemas.push('• "' + h + '" está en la columna ' + letraColumna_(i + 1) + ' y debería estar en ' + letraColumna_(j + 1));
    else if (j < 0 && i < COLUMNAS.length) problemas.push('• La columna ' + letraColumna_(i + 1) + ' tiene "' + h + '", pero el sistema usa esa columna para "' + COLUMNAS[i] + '"');
  });
  if (problemas.length) {
    throw new Error('El orden de las columnas de la hoja "' + CONFIG.HOJA_REGISTROS + '" no coincide con el sistema. NO se modificó ningún dato.\n'
      + problemas.slice(0, 12).join('\n') + (problemas.length > 12 ? '\n… y ' + (problemas.length - 12) + ' más' : '')
      + '\nEjecute diagnosticarColumnas() para ver el detalle completo.');
  }
}

/** Muestra en el registro de ejecución cada columna de la hoja y lo que espera el sistema. Solo lee. */
function diagnosticarColumnas() {
  const sh = hojaRegistros_();
  const ancho = Math.max(sh.getLastColumn(), COLUMNAS.length);
  const cab = sh.getRange(1, 1, 1, ancho).getValues()[0];
  const filasMax = Math.max(sh.getMaxRows() - 1, 1);
  const ultima = sh.getLastRow();
  const ejemplo = ultima > 1 ? sh.getRange(ultima, 1, 1, ancho).getValues()[0] : [];
  const lineas = [];
  for (let i = 0; i < ancho; i++) {
    const regla = sh.getRange(2, i + 1).getDataValidation();
    const ok = String(cab[i]).trim() === (COLUMNAS[i] || '') ? '✅' : '❌';
    lineas.push(ok + ' ' + letraColumna_(i + 1) + ': hoja="' + cab[i] + '" · sistema="' + (COLUMNAS[i] || '(ninguna)') + '"'
      + ' · último registro="' + String(ejemplo[i] === undefined ? '' : ejemplo[i]).slice(0, 40) + '"'
      + (regla ? ' · lista desplegable: ' + regla.getCriteriaValues()[0] : ''));
  }
  Logger.log('Filas de datos: ' + (sh.getLastRow() - 1) + ' · Filas totales: ' + (filasMax + 1) + '\n' + lineas.join('\n'));
}

/** Crea el administrador inicial con una contraseña al azar si la hoja Usuarios está vacía. */
function crearAdminInicialSiFalta_() {
  const sh = hojaUsuarios_();
  if (sh.getLastRow() >= 2) return '';
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
  let clave = '';
  for (let i = 0; i < 8; i++) clave += letras[Math.floor(Math.random() * letras.length)];
  clave += Math.floor(10 + Math.random() * 90);
  const salt = Utilities.getUuid();
  sh.appendRow([CONFIG.ADMIN_INICIAL_USUARIO, 'Administrador', '', 'admin', true, hashPassword_(clave, salt), salt, true, new Date(), '']);
  return clave;
}

/** Si olvidó la clave de admin: ejecute esta función y use la nueva clave que aparece en el registro. */
function restablecerAdmin() {
  const u = leerUsuarios_().filter(x => x.usuario === CONFIG.ADMIN_INICIAL_USUARIO)[0];
  if (!u) { Logger.log('No existe el usuario ' + CONFIG.ADMIN_INICIAL_USUARIO); return; }
  const clave = 'Liceo' + Math.floor(100000 + Math.random() * 900000);
  const salt = Utilities.getUuid();
  hojaUsuarios_().getRange(u._fila, COLS_USUARIOS.indexOf('activo') + 1, 1, 4).setValues([[true, hashPassword_(clave, salt), salt, true]]);
  Logger.log('🔑 Nueva contraseña de ' + u.usuario + ': ' + clave + ' (se pedirá cambiarla)');
}

/** Envía un correo de confirmación de prueba a su propia cuenta. */
function probarCorreo() {
  const destino = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail();
  const prueba = {
    numRegistro: '999', fechaMatricula: hoyISO_(), curso: '3°', cursoGestionPasada: '2 D', especialidad: 'Electricidad',
    apellidoPaterno: 'Pérez', apellidoMaterno: 'González', nombres: 'Juan Carlos', run: '12345678-5', genero: 'Masculino',
    fechaNacimiento: '2009-03-04', edad: '17', lugarNacimiento: 'Calama', pais: 'Chile', nacionalidad: 'Chilena',
    religion: 'Católica', etnia: 'Ninguna', celularEstudiante: '+56 9 1234 5678', correoEstudiante: '',
    domicilioEstudiante: 'Tarapacá 2165, Calama', nombreApoderadoTitular: 'María González Rojas',
    correoApoderadoTitular: destino, fonoApoderadoTitular: '+56 9 8765 4321',
    nombreApoderadoSuplente: 'Pedro Pérez Soto', correoApoderadoSuplente: 'suplente@ejemplo.cl', fonoApoderadoSuplente: '+56 9 1111 2222',
    profesionPadre: 'Técnico eléctrico', profesionMadre: 'Comerciante', profesionApoderado: 'Comerciante',
    personaConQuienVive: 'Ambos padres', totalHijos: '2', lugarQueOcupa: '1', personasEnCasa: '4', tipoDomicilio: 'Propio',
    situacionEconomica: 'Media($501.000 - $700.000)', subsidioUnicoFamiliar: 'No', beneficioJunaeb: 'Sí', chileSolidario: 'No',
    becaIndigena: 'No', cuidadosEspeciales: '', medicamentosContraindicados: '', atencionSalud: 'FONASA',
    contactoEmergencia: 'María González', telefonoEmergencia: '+56 9 8765 4321', procedenciaEscuela: 'Escuela Básica Calama', cursoRepetido: ''
  };
  enviarComprobante_(prueba);
  Logger.log('✅ Correo de prueba enviado a ' + destino);
}
