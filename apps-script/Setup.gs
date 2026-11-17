/**
 * Setup.gs → Ejecutar UNA VEZ desde el editor: configurarSistema()
 */

function configurarSistema() {
  const ss = ss_();
  const sh = hojaRegistros_();

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
