/**
 * Auth.gs → Usuarios, contraseñas, sesiones y permisos
 *
 * Hoja "Usuarios":  usuario | nombre | email | rol | activo | hash | salt | debeCambiar | creado | ultimoAcceso
 */
const COLS_USUARIOS = ['usuario', 'nombre', 'email', 'rol', 'activo', 'hash', 'salt', 'debeCambiar', 'creado', 'ultimoAcceso'];

function hojaUsuarios_() {
  const ss = ss_();
  let sh = ss.getSheetByName(CONFIG.HOJA_USUARIOS);
  if (!sh) {
    sh = ss.insertSheet(CONFIG.HOJA_USUARIOS);
    crearEncabezados_(sh, COLS_USUARIOS, '#13306b');
  }
  return sh;
}

function hashPassword_(password, salt) {
  let h = String(salt) + '|' + String(password);
  for (let i = 0; i < 300; i++) {
    h = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, h + salt, Utilities.Charset.UTF_8));
  }
  return h;
}

function leerUsuarios_() {
  const sh = hojaUsuarios_();
  const n = sh.getLastRow();
  if (n < 2) return [];
  return sh.getRange(2, 1, n - 1, COLS_USUARIOS.length).getValues().map((r, i) => {
    const u = { _fila: i + 2 };
    COLS_USUARIOS.forEach((k, j) => u[k] = r[j]);
    u.usuario = String(u.usuario).trim().toLowerCase();
    u.activo = u.activo === true || String(u.activo).toUpperCase() === 'TRUE';
    u.debeCambiar = u.debeCambiar === true || String(u.debeCambiar).toUpperCase() === 'TRUE';
    return u;
  });
}

function validarPasswordNueva_(p) {
  p = String(p || '');
  if (p.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
  if (!/[A-Za-z]/.test(p) || !/\d/.test(p)) return 'La contraseña debe incluir letras y números';
  return null;
}

// ------------------------------------------------------------
// Sesiones (CacheService)
// ------------------------------------------------------------
function crearSesion_(u) {
  const token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
  const ses = { usuario: u.usuario, nombre: u.nombre || u.usuario, rol: u.rol, debeCambiar: !!u.debeCambiar };
  CacheService.getScriptCache().put('ses_' + token, JSON.stringify(ses), Math.min(21600, CONFIG.SESION_HORAS * 3600));
  return token;
}

/** Valida el token y opcionalmente un permiso. Lanza error si no corresponde. */
function requerir_(token, permiso) {
  if (!token) throw new Error('SESION_EXPIRADA');
  const cache = CacheService.getScriptCache();
  const raw = cache.get('ses_' + token);
  if (!raw) throw new Error('SESION_EXPIRADA');
  const ses = JSON.parse(raw);
  cache.put('ses_' + token, raw, Math.min(21600, CONFIG.SESION_HORAS * 3600)); // renueva
  const rol = ROLES[ses.rol];
  if (!rol) throw new Error('Rol inválido');
  if (permiso && ses.debeCambiar) throw new Error('Debe cambiar su contraseña antes de continuar.');
  if (permiso && !rol[permiso]) throw new Error('No tiene permiso para esta acción.');
  ses.permisos = rol;
  return ses;
}

function infoSesion_(ses) {
  const r = ROLES[ses.rol] || {};
  return {
    usuario: ses.usuario, nombre: ses.nombre, rol: ses.rol, rolNombre: r.nombre,
    permisos: { ver: !!r.ver, editar: !!r.editar, eliminar: !!r.eliminar, usuarios: !!r.usuarios },
    debeCambiar: !!ses.debeCambiar
  };
}

// ------------------------------------------------------------
// API pública (google.script.run)
// ------------------------------------------------------------
function iniciarSesion(usuario, password) {
  usuario = String(usuario || '').trim().toLowerCase();
  if (!usuario || !password) return { ok: false, mensaje: 'Ingrese usuario y contraseña.' };

  const cache = CacheService.getScriptCache();
  const kInt = 'int_' + usuario;
  const intentos = Number(cache.get(kInt) || 0);
  if (intentos >= CONFIG.INTENTOS_MAX_LOGIN)
    return { ok: false, mensaje: 'Usuario bloqueado temporalmente por intentos fallidos. Intente en ' + CONFIG.BLOQUEO_MINUTOS + ' minutos.' };

  const u = leerUsuarios_().filter(x => x.usuario === usuario)[0];
  if (!u || !u.activo || hashPassword_(password, u.salt) !== u.hash) {
    cache.put(kInt, String(intentos + 1), CONFIG.BLOQUEO_MINUTOS * 60);
    Utilities.sleep(600);
    return { ok: false, mensaje: 'Usuario o contraseña incorrectos.' };
  }
  cache.remove(kInt);
  hojaUsuarios_().getRange(u._fila, COLS_USUARIOS.indexOf('ultimoAcceso') + 1).setValue(new Date());
  const token = crearSesion_(u);
  bitacora_(u.usuario, 'Inicio de sesión', '');
  return { ok: true, token: token, sesion: infoSesion_(requerir_(token)) };
}

function cerrarSesion(token) {
  if (token) CacheService.getScriptCache().remove('ses_' + token);
  return { ok: true };
}

function sesionActual(token) {
  try { return { ok: true, sesion: infoSesion_(requerir_(token)) }; }
  catch (e) { return { ok: false }; }
}

function cambiarMiPassword(token, actual, nueva) {
  try {
    const ses = requerir_(token);
    const err = validarPasswordNueva_(nueva);
    if (err) return { ok: false, mensaje: err };
    const u = leerUsuarios_().filter(x => x.usuario === ses.usuario)[0];
    if (!u || hashPassword_(actual, u.salt) !== u.hash) return { ok: false, mensaje: 'La contraseña actual no es correcta.' };
    if (actual === nueva) return { ok: false, mensaje: 'La nueva contraseña debe ser distinta a la actual.' };
    const salt = Utilities.getUuid();
    const sh = hojaUsuarios_();
    sh.getRange(u._fila, COLS_USUARIOS.indexOf('hash') + 1, 1, 3).setValues([[hashPassword_(nueva, salt), salt, false]]);
    // actualiza la sesión
    const raw = JSON.parse(CacheService.getScriptCache().get('ses_' + token));
    raw.debeCambiar = false;
    CacheService.getScriptCache().put('ses_' + token, JSON.stringify(raw), Math.min(21600, CONFIG.SESION_HORAS * 3600));
    bitacora_(ses.usuario, 'Cambio de contraseña', '');
    return { ok: true };
  } catch (e) { return errorApi_(e); }
}

// ------------------------------------------------------------
// Administración de usuarios (solo rol admin)
// ------------------------------------------------------------
function listarUsuarios(token) {
  try {
    requerir_(token, 'usuarios');
    return {
      ok: true,
      usuarios: leerUsuarios_().map(u => ({
        usuario: u.usuario, nombre: String(u.nombre || ''), email: String(u.email || ''), rol: u.rol,
        rolNombre: (ROLES[u.rol] || {}).nombre || u.rol, activo: u.activo, debeCambiar: u.debeCambiar,
        ultimoAcceso: fmtFecha_(u.ultimoAcceso, 'dd/MM/yyyy HH:mm')
      }))
    };
  } catch (e) { return errorApi_(e); }
}

/** Crea o actualiza un usuario. u = {usuario, nombre, email, rol, activo, password?, nuevo:bool} */
function guardarUsuario(token, u) {
  try {
    const ses = requerir_(token, 'usuarios');
    const usuario = String(u.usuario || '').trim().toLowerCase();
    if (!/^[a-z0-9._\-]{3,30}$/.test(usuario)) return { ok: false, mensaje: 'Usuario: 3 a 30 caracteres (letras, números, punto, guion).' };
    if (!ROLES[u.rol]) return { ok: false, mensaje: 'Seleccione un rol válido.' };
    if (!String(u.nombre || '').trim()) return { ok: false, mensaje: 'Ingrese el nombre.' };
    if (u.email && !emailValido_(u.email)) return { ok: false, mensaje: 'Correo inválido.' };

    const lista = leerUsuarios_();
    const existente = lista.filter(x => x.usuario === usuario)[0];
    const sh = hojaUsuarios_();

    if (u.nuevo) {
      if (existente) return { ok: false, mensaje: 'Ese nombre de usuario ya existe.' };
      const err = validarPasswordNueva_(u.password);
      if (err) return { ok: false, mensaje: err };
      const salt = Utilities.getUuid();
      sh.appendRow([usuario, String(u.nombre).trim(), String(u.email || '').trim(), u.rol, u.activo !== false,
        hashPassword_(u.password, salt), salt, true, new Date(), '']);
      bitacora_(ses.usuario, 'Crear usuario', usuario + ' (' + u.rol + ')');
      return { ok: true };
    }

    if (!existente) return { ok: false, mensaje: 'Usuario no encontrado.' };
    // No dejar el sistema sin administradores activos
    const quedanAdmins = lista.filter(x => x.usuario !== usuario && x.rol === 'admin' && x.activo).length;
    if (existente.rol === 'admin' && (u.rol !== 'admin' || u.activo === false) && quedanAdmins === 0)
      return { ok: false, mensaje: 'Debe existir al menos un administrador activo.' };

    sh.getRange(existente._fila, 2, 1, 4).setValues([[String(u.nombre).trim(), String(u.email || '').trim(), u.rol, u.activo !== false]]);
    if (u.password) {
      const err = validarPasswordNueva_(u.password);
      if (err) return { ok: false, mensaje: err };
      const salt = Utilities.getUuid();
      sh.getRange(existente._fila, COLS_USUARIOS.indexOf('hash') + 1, 1, 3).setValues([[hashPassword_(u.password, salt), salt, true]]);
    }
    bitacora_(ses.usuario, 'Editar usuario', usuario + ' → ' + u.rol + (u.activo === false ? ' (inactivo)' : '') + (u.password ? ' · clave restablecida' : ''));
    return { ok: true };
  } catch (e) { return errorApi_(e); }
}

function eliminarUsuario(token, usuario) {
  try {
    const ses = requerir_(token, 'usuarios');
    usuario = String(usuario || '').toLowerCase();
    if (usuario === ses.usuario) return { ok: false, mensaje: 'No puede eliminar su propio usuario.' };
    const lista = leerUsuarios_();
    const u = lista.filter(x => x.usuario === usuario)[0];
    if (!u) return { ok: false, mensaje: 'Usuario no encontrado.' };
    if (u.rol === 'admin' && lista.filter(x => x.rol === 'admin' && x.activo && x.usuario !== usuario).length === 0)
      return { ok: false, mensaje: 'Debe existir al menos un administrador activo.' };
    hojaUsuarios_().deleteRow(u._fila);
    bitacora_(ses.usuario, 'Eliminar usuario', usuario);
    return { ok: true };
  } catch (e) { return errorApi_(e); }
}

function errorApi_(e) {
  const m = String((e && e.message) || e);
  if (m === 'SESION_EXPIRADA') return { ok: false, sesionExpirada: true, mensaje: 'Su sesión expiró. Ingrese nuevamente.' };
  Logger.log(e && e.stack);
  return { ok: false, mensaje: m };
}
