/**
 * Codigo.gs → Página web, utilidades, validación y registro de pre-matrículas
 */

// ============================================================
// API JSON (la usa el sitio publicado en GitHub Pages)
// ------------------------------------------------------------
// El navegador envía un POST con cuerpo JSON en texto plano:
//   { "accion": "obtenerRegistros", "token": "...", ... }
// Se usa text/plain para que el navegador no haga la consulta previa CORS
// (Apps Script no la admite). La respuesta siempre es JSON.
// ============================================================
const ACCIONES = {
  ping:              r => ({ ok: true, formularioAbierto: CONFIG.FORMULARIO_ABIERTO, anio: CONFIG.ANIO }),
  enviarFormulario:  r => enviarFormulario(r.datos),
  iniciarSesion:     r => iniciarSesion(r.usuario, r.password),
  cerrarSesion:      r => cerrarSesion(r.token),
  sesionActual:      r => sesionActual(r.token),
  cambiarMiPassword: r => cambiarMiPassword(r.token, r.actual, r.nueva),
  listarUsuarios:    r => listarUsuarios(r.token),
  guardarUsuario:    r => guardarUsuario(r.token, r.usuario),
  eliminarUsuario:   r => eliminarUsuario(r.token, r.usuario),
  obtenerRegistros:  r => obtenerRegistros(r.token),
  actualizarRegistro:r => actualizarRegistro(r.token, r.num, r.datos),
  cambiarEstado:     r => cambiarEstado(r.token, r.num, r.estado, r.nroMatricula),
  asignarCurso:      r => asignarCurso(r.token, r.nums, r.letra),
  eliminarRegistro:  r => eliminarRegistro(r.token, r.num),
  reenviarCorreo:    r => reenviarCorreo(r.token, r.num)
};

function doPost(e) {
  const tipo = (e && e.postData && e.postData.type) || '';
  // Compatibilidad: formulario externo antiguo que enviaba campos de formulario
  if (tipo.indexOf('application/x-www-form-urlencoded') >= 0 || tipo.indexOf('multipart/') >= 0) return doPostAntiguo_(e);

  let req;
  try { req = JSON.parse((e && e.postData && e.postData.contents) || '{}'); }
  catch (err) { return json_({ ok: false, mensaje: 'Solicitud inválida.' }); }

  const fn = ACCIONES[req && req.accion];
  if (!fn) return json_({ ok: false, mensaje: 'Acción desconocida.' });
  try {
    return json_(fn(req));
  } catch (err) {
    return json_(errorApi_(err));
  }
}

/** Si alguien abre la URL /exec en el navegador, lo envía al sitio. */
function doGet(e) {
  if (e && e.parameter && e.parameter.accion === 'ping') return json_(ACCIONES.ping({}));
  const url = CONFIG.URL_SITIO;
  const destino = url + ((e && e.parameter && e.parameter.p) ? '/?p=' + encodeURIComponent(e.parameter.p) : '/');
  const html = url
    ? '<script>window.top.location.replace(' + JSON.stringify(destino) + ');</script><p style="font-family:Arial">Redirigiendo a <a target="_top" href="' + destino + '">' + destino + '</a>…</p>'
    : '<p style="font-family:Arial">API de Pre-Matrícula ' + CONFIG.ANIO + ' funcionando. Configure URL_SITIO en Config.gs.</p>';
  return HtmlService.createHtmlOutput(html).setTitle('Pre-Matrícula ' + CONFIG.ANIO);
}

function doPostAntiguo_(e) {
  try {
    const data = {};
    if (e && e.parameter) Object.keys(e.parameter).forEach(k => data[k] = e.parameter[k]);
    if (data.sexo && !data.genero) data.genero = data.sexo; // nombre antiguo del campo
    return json_(registrarPreMatricula_(data));
  } catch (err) {
    return json_({ ok: false, mensaje: String(err.message || err) });
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// UTILIDADES DE HOJA
// ============================================================
let SS_CACHE_ = null, HOJA_REG_CACHE_ = null;
function ss_() {
  if (!SS_CACHE_) SS_CACHE_ = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  return SS_CACHE_;
}

function hojaRegistros_() {
  if (HOJA_REG_CACHE_) return HOJA_REG_CACHE_;
  const ss = ss_();
  let sh = ss.getSheetByName(CONFIG.HOJA_REGISTROS);
  if (!sh) sh = ss.insertSheet(CONFIG.HOJA_REGISTROS);
  if (sh.getLastRow() === 0) crearEncabezados_(sh, COLUMNAS, '#1f4fa3');
  HOJA_REG_CACHE_ = sh;
  return sh;
}

/** Escapa texto para HTML (correos). */
function esc_(s) {
  return String(s === null || s === undefined ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Texto visible de una opción del formulario (ej: '1°' → '1° Medio'). */
function etiquetaOpcion_(key, valor) {
  const c = camposFormulario_().filter(x => x.key === key)[0];
  if (!c || !c.options) return valor;
  const o = c.options.filter(x => (typeof x === 'string' ? x : x.v) === valor)[0];
  return o ? (typeof o === 'string' ? o : o.t) : valor;
}

function crearEncabezados_(sh, headers, color) {
  sh.getRange(1, 1, 1, headers.length).setValues([headers])
    .setFontWeight('bold').setBackground(color || '#1f4fa3').setFontColor('#ffffff')
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  sh.setFrozenRows(1);
}

function fmtFecha_(v, patron) {
  if (v === '' || v === null || v === undefined) return '';
  if (Object.prototype.toString.call(v) === '[object Date]') {
    if (isNaN(v.getTime())) return '';
    return Utilities.formatDate(v, CONFIG.ZONA_HORARIA, patron || 'yyyy-MM-dd');
  }
  return String(v);
}

/** Convierte una fila de la hoja en un objeto plano (todo como texto). */
function filaAObjeto_(fila) {
  const o = {};
  COLUMNAS.forEach((k, i) => {
    let v = fila[i];
    if (k === 'timestamp' || k === 'fechaModificacion') v = fmtFecha_(v, 'dd/MM/yyyy HH:mm');
    else if (k === 'fechaMatricula' || k === 'fechaNacimiento') v = fmtFecha_(v, 'yyyy-MM-dd');
    else if (Object.prototype.toString.call(v) === '[object Date]') v = fmtFecha_(v);
    else v = (v === null || v === undefined) ? '' : String(v);
    o[k] = v;
  });
  if (!o.estado) o.estado = 'Pendiente';
  return o;
}

function fechaDesdeISO_(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
  if (!m) return '';
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0);
}

function ahora_() {
  return new Date();
}

function hoyISO_() {
  return Utilities.formatDate(new Date(), CONFIG.ZONA_HORARIA, 'yyyy-MM-dd');
}

/** Busca la fila (1-based) de un numRegistro. Devuelve -1 si no existe. */
function filaDeRegistro_(sh, num) {
  const n = sh.getLastRow();
  if (n < 2) return -1;
  const vals = sh.getRange(2, 2, n - 1, 1).getValues();
  for (let i = 0; i < vals.length; i++) {
    if (String(vals[i][0]) === String(num)) return i + 2;
  }
  return -1;
}

function bitacora_(usuario, accion, detalle) {
  try {
    const ss = ss_();
    let sh = ss.getSheetByName(CONFIG.HOJA_BITACORA);
    if (!sh) { sh = ss.insertSheet(CONFIG.HOJA_BITACORA); crearEncabezados_(sh, ['fecha', 'usuario', 'accion', 'detalle'], '#5b6b8c'); }
    sh.appendRow([new Date(), usuario || 'público', accion, detalle || '']);
  } catch (e) { Logger.log('Bitácora: ' + e); }
}

// ============================================================
// VALIDACIONES
// ============================================================
/** Valida RUT chileno (módulo 11). Devuelve el RUT normalizado "12345678-K" o null. */
function normalizarRut_(rut) {
  let s = String(rut || '').toUpperCase().replace(/[^0-9K]/g, '');
  if (s.length < 8 || s.length > 9) return null;
  const cuerpo = s.slice(0, -1), dv = s.slice(-1);
  if (!/^\d+$/.test(cuerpo)) return null;
  let suma = 0, mul = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const r = 11 - (suma % 11);
  const dvc = r === 11 ? '0' : r === 10 ? 'K' : String(r);
  return dvc === dv ? Number(cuerpo) + '-' + dv : null;
}

function emailValido_(s) {
  return /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(String(s || '').trim());
}

/** Teléfono chileno: acepta 9XXXXXXXX, 569XXXXXXXX, +56 9 ..., fijos de 9 dígitos. Devuelve "+56 9 1234 5678". */
function normalizarFono_(s) {
  let d = String(s || '').replace(/\D/g, '');
  if (d.length === 11 && d.indexOf('56') === 0) d = d.slice(2);
  if (d.length === 8) d = '9' + d; // celulares antiguos sin el 9
  if (d.length !== 9) return null;
  return '+56 ' + d[0] + ' ' + d.slice(1, 5) + ' ' + d.slice(5);
}

function calcularEdad_(iso) {
  const f = fechaDesdeISO_(iso);
  if (!f) return null;
  const hoy = new Date();
  let e = hoy.getFullYear() - f.getFullYear();
  const m = hoy.getMonth() - f.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < f.getDate())) e--;
  return e;
}

function capitalizar_(s) {
  return String(s || '').trim().replace(/\s+/g, ' ').toLowerCase()
    .replace(/(^|[\s\-'])([a-záéíóúñü])/g, (m, a, b) => a + b.toUpperCase());
}

/**
 * Valida y limpia los datos según el esquema.
 * Devuelve { ok, errores: {campo: mensaje}, datos }
 */
function validarDatos_(entrada) {
  const errores = {};
  const d = {};
  const campos = camposFormulario_();

  campos.forEach(c => {
    let v = entrada[c.key];
    v = (v === null || v === undefined) ? '' : String(v).trim().replace(/\s+/g, c.type === 'textarea' ? ' ' : ' ');
    d[c.key] = v;
  });

  // Fecha de registro y edad: siempre las calcula el sistema
  if (!d.fechaMatricula || !fechaDesdeISO_(d.fechaMatricula)) d.fechaMatricula = hoyISO_();

  // Especialidad según curso
  const conEsp = CONFIG.CURSOS_CON_ESPECIALIDAD.indexOf(d.curso) >= 0;
  if (!conEsp) d.especialidad = 'No Aplica';

  campos.forEach(c => {
    const v = d[c.key];
    if (c.key === 'edad') return;
    if (c.especialidad && !conEsp) return;
    if (!v) { if (c.req) errores[c.key] = 'Campo obligatorio'; return; }

    if (c.options) {
      const vals = c.options.map(o => typeof o === 'string' ? o : o.v);
      if (vals.indexOf(v) < 0) errores[c.key] = 'Seleccione una opción válida';
    }
    if (c.nombre && !/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .\-]{2,80}$/.test(v)) errores[c.key] = 'Solo letras (mínimo 2)';
    else if (c.nombre) d[c.key] = capitalizar_(v);

    switch (c.type) {
      case 'rut': {
        const r = normalizarRut_(v);
        if (!r) errores[c.key] = 'RUN inválido (revise el dígito verificador)'; else d[c.key] = r;
        break;
      }
      case 'email':
        if (!emailValido_(v)) errores[c.key] = 'Correo electrónico inválido'; else d[c.key] = v.toLowerCase();
        break;
      case 'tel': {
        const f = normalizarFono_(v);
        if (!f) errores[c.key] = 'Teléfono inválido (9 dígitos, ej: 9 1234 5678)'; else d[c.key] = f;
        break;
      }
      case 'number': {
        const n = Number(v);
        if (!/^\d+$/.test(v) || (c.min !== undefined && n < c.min) || (c.max !== undefined && n > c.max))
          errores[c.key] = 'Número entre ' + c.min + ' y ' + c.max;
        break;
      }
      case 'date':
        if (!fechaDesdeISO_(v)) errores[c.key] = 'Fecha inválida';
        break;
    }
    if (v.length > 500) errores[c.key] = 'Texto demasiado largo';
  });

  // Fecha de nacimiento y edad
  if (d.fechaNacimiento && !errores.fechaNacimiento) {
    const edad = calcularEdad_(d.fechaNacimiento);
    if (edad === null || fechaDesdeISO_(d.fechaNacimiento) > new Date()) errores.fechaNacimiento = 'La fecha no puede ser futura';
    else if (edad < CONFIG.EDAD_MIN || edad > CONFIG.EDAD_MAX) errores.fechaNacimiento = 'La edad calculada (' + edad + ') debe estar entre ' + CONFIG.EDAD_MIN + ' y ' + CONFIG.EDAD_MAX + ' años';
    else d.edad = String(edad);
  }

  // Coherencia familiar
  if (!errores.lugarQueOcupa && d.lugarQueOcupa && d.totalHijos && Number(d.lugarQueOcupa) > Number(d.totalHijos))
    errores.lugarQueOcupa = 'No puede ser mayor que el total de hijos';

  // Correos distintos entre estudiante y titular no es obligatorio, pero sí que no estén vacíos (ya validado)
  return { ok: Object.keys(errores).length === 0, errores: errores, datos: d };
}

function filaDesdeDatos_(d, extra) {
  return COLUMNAS.map(k => {
    if (extra && Object.prototype.hasOwnProperty.call(extra, k)) return extra[k];
    if (k === 'fechaMatricula' || k === 'fechaNacimiento') return fechaDesdeISO_(d[k]);
    if (k === 'edad' || k === 'totalHijos' || k === 'lugarQueOcupa' || k === 'personasEnCasa') return d[k] === '' ? '' : Number(d[k]);
    return d[k] === undefined ? '' : d[k];
  });
}

// ============================================================
// REGISTRO PÚBLICO
// ============================================================
function enviarFormulario(datos) {
  try {
    if (datos && datos.website) return { ok: false, mensaje: 'Solicitud rechazada.' }; // trampa anti-bots
    return registrarPreMatricula_(datos || {});
  } catch (err) {
    Logger.log(err && err.stack);
    return { ok: false, mensaje: 'Ocurrió un error al guardar. Intente nuevamente en unos minutos. (' + (err.message || err) + ')' };
  }
}

/**
 * Guarda la pre-matrícula y envía un correo de confirmación SIN PDF (rápido).
 * Todo se escribe en una sola operación sobre la hoja.
 */
function registrarPreMatricula_(entrada) {
  if (!CONFIG.FORMULARIO_ABIERTO) return { ok: false, mensaje: 'El proceso de pre-matrícula se encuentra cerrado.' };

  const v = validarDatos_(entrada);
  if (!v.ok) return { ok: false, mensaje: 'Revise los campos marcados.', errores: v.errores };
  const d = v.datos;

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  let num;
  try {
    const sh = hojaRegistros_();
    const ultima = sh.getLastRow();

    // Lee N° y RUN de una vez (dos columnas) para revisar duplicados y calcular el siguiente número
    let nums = [], runs = [];
    if (ultima > 1) {
      nums = sh.getRange(2, 2, ultima - 1, 1).getValues();
      runs = sh.getRange(2, COLUMNAS.indexOf('run') + 1, ultima - 1, 1).getValues();
    }
    if (CONFIG.BLOQUEAR_RUN_DUPLICADO) {
      for (let i = 0; i < runs.length; i++) {
        if (runs[i][0] && normalizarRut_(runs[i][0]) === d.run) {
          return {
            ok: false, errores: { run: 'Este RUN ya tiene una pre-matrícula' },
            mensaje: 'Ya existe una pre-matrícula para el RUN ' + d.run + ' (registro N° ' + nums[i][0] + '). Si necesita corregir datos, comuníquese con el liceo.'
          };
        }
      }
    }

    const props = PropertiesService.getScriptProperties();
    const clave = 'ULTIMO_NUM_' + CONFIG.HOJA_REGISTROS;
    let max = Number(props.getProperty(clave) || 0); // evita reutilizar números de registros eliminados
    nums.forEach(r => { const x = parseInt(r[0], 10); if (!isNaN(x) && x > max) max = x; });
    num = max + 1;
    props.setProperty(clave, String(num));

    const valores = filaDesdeDatos_(d, {
      timestamp: new Date(), numRegistro: num, estado: 'Pendiente', nroMatricula: '',
      emailEnviado: CONFIG.EMAIL_HABILITADO ? 'Pendiente' : 'No', fechaModificacion: '', modificadoPor: '', letra: ''
    });
    const fila = ultima + 1;
    sh.getRange(fila, 1, 1, valores.length).setValues([valores]);
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }

  const reg = Object.assign({}, d, { numRegistro: String(num) });

  // Correo de confirmación (sin PDF)
  let emailEnviado = false, avisoEmail = '';
  if (CONFIG.EMAIL_HABILITADO) {
    try {
      enviarComprobante_(reg);
      emailEnviado = true;
      marcarEmail_(num, 'Sí');
    } catch (e) {
      avisoEmail = String(e.message || e);
      Logger.log('Email: ' + avisoEmail);
    }
  }

  bitacora_('público', 'Nueva pre-matrícula', 'N° ' + num + ' · ' + d.run);

  return {
    ok: true,
    numRegistro: num,
    nombre: d.nombres + ' ' + d.apellidoPaterno + ' ' + d.apellidoMaterno,
    correo: d.correoApoderadoTitular,
    emailEnviado: emailEnviado,
    avisoEmail: avisoEmail
  };
}

function marcarEmail_(num, valor) {
  const sh = hojaRegistros_();
  const fila = filaDeRegistro_(sh, num);
  if (fila > 0) sh.getRange(fila, COLUMNAS.indexOf('emailEnviado') + 1).setValue(valor);
}
