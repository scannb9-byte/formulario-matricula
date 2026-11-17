/**
 * Panel.gs → API del panel de administración (requiere sesión)
 *
 * Para que el panel sea rápido, obtenerRegistros() entrega TODOS los registros
 * completos en una sola llamada. Búsquedas, filtros, estadísticas, fichas, PDF,
 * impresión y exportación se hacen en el navegador, sin volver a consultar la hoja.
 */

function leerFilas_() {
  const sh = hojaRegistros_();
  const n = sh.getLastRow();
  if (n < 2) return [];
  return sh.getRange(2, 1, n - 1, COLUMNAS.length).getValues()
    .filter(r => r[1] !== '' && r[1] !== null);
}

function leerTodos_() {
  return leerFilas_().map(filaAObjeto_);
}

/** Todos los registros como arreglos (más livianos que objetos) + datos de sesión. */
function obtenerRegistros(token) {
  try {
    const ses = requerir_(token, 'ver');
    const filas = leerFilas_().map(f => {
      const o = filaAObjeto_(f);
      return COLUMNAS.map(k => o[k]);
    });
    return {
      ok: true, columnas: COLUMNAS, filas: filas, sesion: infoSesion_(ses),
      urlPlanilla: ses.permisos.usuarios ? ss_().getUrl() : ''
    };
  } catch (e) { return errorApi_(e); }
}

function actualizarRegistro(token, num, datos) {
  try {
    const ses = requerir_(token, 'editar');
    datos = datos || {};
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    let registro;
    try {
      const sh = hojaRegistros_();
      const fila = filaDeRegistro_(sh, num);
      if (fila < 0) return { ok: false, mensaje: 'Registro no encontrado.' };
      const filaActual = sh.getRange(fila, 1, 1, COLUMNAS.length).getValues()[0];
      const actual = filaAObjeto_(filaActual);

      const entrada = Object.assign({}, datos, { fechaMatricula: actual.fechaMatricula });
      const v = validarDatos_(entrada);
      if (!v.ok) return { ok: false, mensaje: 'Revise los campos marcados.', errores: v.errores };

      // RUN duplicado en otro registro
      if (CONFIG.BLOQUEAR_RUN_DUPLICADO && normalizarRut_(actual.run) !== v.datos.run) {
        const cRun = COLUMNAS.indexOf('run');
        const otro = leerFilas_().filter(r => String(r[1]) !== String(num) && normalizarRut_(r[cRun]) === v.datos.run)[0];
        if (otro) return { ok: false, errores: { run: 'RUN usado en el registro N° ' + otro[1] }, mensaje: 'El RUN ya existe en otro registro.' };
      }

      const estado = ESTADOS.indexOf(datos.estado) >= 0 ? datos.estado : actual.estado;
      const nroMatricula = nroMatriculaPara_(sh, estado, datos.nroMatricula === undefined ? actual.nroMatricula : datos.nroMatricula);
      const letra = datos.letra === undefined ? actual.letra : (CONFIG.LETRAS.indexOf(datos.letra) >= 0 ? datos.letra : '');
      const valores = filaDesdeDatos_(v.datos, {
        timestamp: filaActual[0], numRegistro: Number(num), estado: estado, nroMatricula: nroMatricula,
        emailEnviado: actual.emailEnviado, fechaModificacion: new Date(), modificadoPor: ses.usuario, letra: letra
      });
      sh.getRange(fila, 1, 1, valores.length).setValues([valores]);
      registro = filaAObjeto_(valores);

      const cambios = COLUMNAS.filter(k => ['timestamp', 'fechaModificacion', 'modificadoPor', 'emailEnviado'].indexOf(k) < 0)
        .filter(k => String(actual[k]) !== String(registro[k]));
      bitacora_(ses.usuario, 'Editar registro', 'N° ' + num + (cambios.length ? ' · ' + cambios.join(', ') : ''));
    } finally { lock.releaseLock(); }
    return { ok: true, registro: COLUMNAS.map(k => registro[k]) };
  } catch (e) { return errorApi_(e); }
}

// ------------------------------------------------------------
// N° de matrícula automático (AÑO-0001)
// ------------------------------------------------------------
/** Siguiente N° de matrícula. Llamar SIEMPRE con el bloqueo (LockService) tomado. */
function siguienteNroMatricula_(sh) {
  const pref = CONFIG.ANIO + '-';
  const props = PropertiesService.getScriptProperties();
  const clave = 'ULTIMO_NRO_MATRICULA_' + CONFIG.ANIO;
  let max = Math.max(Number(props.getProperty(clave) || 0), (CONFIG.NRO_MATRICULA_INICIO || 1) - 1);
  const n = sh.getLastRow();
  if (n > 1) {
    sh.getRange(2, COLUMNAS.indexOf('nroMatricula') + 1, n - 1, 1).getValues().forEach(r => {
      const m = new RegExp('^' + CONFIG.ANIO + '-(\\d+)$').exec(String(r[0]).trim());
      if (m && Number(m[1]) > max) max = Number(m[1]);
    });
  }
  max++;
  props.setProperty(clave, String(max));
  return pref + String(max).padStart(CONFIG.NRO_MATRICULA_DIGITOS || 4, '0');
}

/** Devuelve el N° que corresponde guardar según el estado. */
function nroMatriculaPara_(sh, estado, nroActual) {
  nroActual = String(nroActual || '').trim().slice(0, 20);
  if (nroActual || estado !== 'Matriculado' || !CONFIG.NRO_MATRICULA_AUTOMATICO) return nroActual;
  return siguienteNroMatricula_(sh);
}

/** Cambio rápido de estado / N° de matrícula desde la tabla. */
function cambiarEstado(token, num, estado, nroMatricula) {
  try {
    const ses = requerir_(token, 'editar');
    if (ESTADOS.indexOf(estado) < 0) return { ok: false, mensaje: 'Estado inválido.' };
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    let nro;
    const ahora = new Date();
    try {
      const sh = hojaRegistros_();
      const fila = filaDeRegistro_(sh, num);
      if (fila < 0) return { ok: false, mensaje: 'Registro no encontrado.' };
      const c = COLUMNAS.indexOf('estado') + 1;
      // Se usa el N° guardado en la hoja (no el del navegador) para no pisar uno ya asignado
      const guardado = sh.getRange(fila, c + 1).getValue();
      nro = nroMatriculaPara_(sh, estado, guardado || nroMatricula);
      sh.getRange(fila, c, 1, 2).setValues([[estado, nro]]);
      sh.getRange(fila, COLUMNAS.indexOf('fechaModificacion') + 1, 1, 2).setValues([[ahora, ses.usuario]]);
    } finally { lock.releaseLock(); }
    bitacora_(ses.usuario, 'Cambiar estado', 'N° ' + num + ' → ' + estado + (nro ? ' · Matrícula ' + nro : ''));
    return { ok: true, nroMatricula: nro, fechaModificacion: fmtFecha_(ahora, 'dd/MM/yyyy HH:mm'), modificadoPor: ses.usuario };
  } catch (e) { return errorApi_(e); }
}

/**
 * Asigna la letra del curso (A..H) a uno o varios registros en una sola escritura.
 * letra = '' quita la letra.
 */
function asignarCurso(token, nums, letra) {
  try {
    const ses = requerir_(token, 'editar');
    letra = String(letra || '').trim().toUpperCase();
    if (letra && CONFIG.LETRAS.indexOf(letra) < 0) return { ok: false, mensaje: 'Letra inválida.' };
    nums = (Array.isArray(nums) ? nums : [nums]).map(String);
    if (!nums.length) return { ok: false, mensaje: 'No hay registros seleccionados.' };

    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    const ahora = new Date();
    let cambiados = 0;
    try {
      const sh = hojaRegistros_();
      const n = sh.getLastRow();
      if (n < 2) return { ok: false, mensaje: 'No hay registros.' };
      const numsHoja = sh.getRange(2, 2, n - 1, 1).getValues();
      // fechaModificacion, modificadoPor y letra son columnas contiguas al final
      const c0 = COLUMNAS.indexOf('fechaModificacion') + 1;
      const rango = sh.getRange(2, c0, n - 1, 3);
      const vals = rango.getValues();
      const buscados = {};
      nums.forEach(x => buscados[x] = true);
      for (let i = 0; i < numsHoja.length; i++) {
        if (buscados[String(numsHoja[i][0])]) { vals[i] = [ahora, ses.usuario, letra]; cambiados++; }
      }
      rango.setValues(vals);
    } finally { lock.releaseLock(); }
    bitacora_(ses.usuario, 'Asignar letra', (letra || '(sin letra)') + ' → N° ' + nums.join(', '));
    return { ok: true, cambiados: cambiados, fechaModificacion: fmtFecha_(ahora, 'dd/MM/yyyy HH:mm'), modificadoPor: ses.usuario };
  } catch (e) { return errorApi_(e); }
}

/** Elimina un registro: lo mueve a la hoja "Eliminados" (papelera) y lo borra de la principal. */
function eliminarRegistro(token, num) {
  try {
    const ses = requerir_(token, 'eliminar');
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const ss = ss_();
      const sh = hojaRegistros_();
      const fila = filaDeRegistro_(sh, num);
      if (fila < 0) return { ok: false, mensaje: 'Registro no encontrado.' };
      const valores = sh.getRange(fila, 1, 1, COLUMNAS.length).getValues()[0];
      let pap = ss.getSheetByName(CONFIG.HOJA_ELIMINADOS);
      if (!pap) { pap = ss.insertSheet(CONFIG.HOJA_ELIMINADOS); crearEncabezados_(pap, ['eliminadoEl', 'eliminadoPor'].concat(COLUMNAS), '#b42318'); }
      pap.appendRow([new Date(), ses.usuario].concat(valores));
      sh.deleteRow(fila);
      bitacora_(ses.usuario, 'Eliminar registro', 'N° ' + num + ' · ' + valores[COLUMNAS.indexOf('run')]);
    } finally { lock.releaseLock(); }
    return { ok: true };
  } catch (e) { return errorApi_(e); }
}

/** Reenvía el correo de confirmación (sin PDF) al apoderado titular. */
function reenviarCorreo(token, num) {
  try {
    const ses = requerir_(token, 'editar');
    const sh = hojaRegistros_();
    const fila = filaDeRegistro_(sh, num);
    if (fila < 0) return { ok: false, mensaje: 'Registro no encontrado.' };
    const reg = filaAObjeto_(sh.getRange(fila, 1, 1, COLUMNAS.length).getValues()[0]);
    enviarComprobante_(reg);
    sh.getRange(fila, COLUMNAS.indexOf('emailEnviado') + 1).setValue('Sí');
    bitacora_(ses.usuario, 'Reenviar correo', 'N° ' + num + ' → ' + reg.correoApoderadoTitular);
    return { ok: true, correo: reg.correoApoderadoTitular };
  } catch (e) { return errorApi_(e); }
}
