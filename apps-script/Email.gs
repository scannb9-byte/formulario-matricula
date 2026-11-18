/**
 * Email.gs → Correo de confirmación al apoderado (sin PDF; la ficha la imprime el liceo)
 */

function enviarComprobante_(r) {
  const para = String(r.correoApoderadoTitular || '').trim();
  if (!emailValido_(para)) throw new Error('Correo del apoderado titular inválido o vacío.');

  const cuota = MailApp.getRemainingDailyQuota();
  if (cuota < 1) throw new Error('Se alcanzó la cuota diaria de correos de Google. Se enviará luego con "reenviarPendientes".');

  const cc = [];
  if (CONFIG.EMAIL_COPIA_ESTUDIANTE && emailValido_(r.correoEstudiante) && r.correoEstudiante !== para) cc.push(r.correoEstudiante);
  if (CONFIG.EMAIL_COPIA_SUPLENTE && emailValido_(r.correoApoderadoSuplente) && r.correoApoderadoSuplente !== para && cc.indexOf(r.correoApoderadoSuplente) < 0) cc.push(r.correoApoderadoSuplente);

  const adjuntos = [];
  (CONFIG.ADJUNTOS_DRIVE_IDS || []).forEach(id => {
    try { adjuntos.push(DriveApp.getFileById(id).getBlob()); } catch (e) { Logger.log('Adjunto ' + id + ': ' + e); }
  });

  const nombreEst = [r.nombres, r.apellidoPaterno, r.apellidoMaterno].join(' ');
  const asunto = 'Confirmación Pre-Matrícula ' + CONFIG.ANIO + ' · ' + nombreEst + ' · Liceo CAG';
  const fecha = Utilities.formatDate(new Date(), CONFIG.ZONA_HORARIA, 'dd/MM/yyyy HH:mm');
  const curso = etiquetaOpcion_('curso', r.curso);

  const fila = (k, v) => '<tr><td style="padding:7px 12px;color:#5b6474;font-size:13px;width:42%;border-bottom:1px solid #eef0f5;">' + k + '</td>'
    + '<td style="padding:7px 12px;color:#111827;font-size:13px;font-weight:600;border-bottom:1px solid #eef0f5;">' + esc_(v) + '</td></tr>';

  const html =
    '<div style="background:#f3f5fa;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;">'
    + '<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e3e7ef;">'
    + '<tr><td style="background:#13306b;padding:22px 24px;text-align:center;">'
    + (CONFIG.URL_SITIO ? '<img src="' + CONFIG.URL_SITIO + '/img/logo.png" width="72" height="72" alt="Logo" style="display:block;margin:0 auto 10px;">' : '')
    + '<div style="color:#ffffff;font-size:18px;font-weight:bold;">Pre-Matrícula ' + CONFIG.ANIO + ' recibida</div>'
    + '<div style="color:#c9d5f0;font-size:13px;margin-top:4px;">Liceo Bicentenario Politécnico "Cesáreo Aguirre Goyenechea"</div>'
    + '</td></tr>'
    + '<tr><td style="padding:24px;">'
    + '<p style="font-size:15px;color:#111827;margin:0 0 12px;">Estimado/a <b>' + esc_(r.nombreApoderadoTitular || 'Apoderado/a') + '</b>:</p>'
    + '<p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 18px;">Hemos recibido correctamente la solicitud de pre-matrícula. '
    + 'La ficha de matrícula será impresa por el liceo y deberá firmarla el día de la matrícula presencial.</p>'
    + '<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eef0f5;border-radius:8px;">'
    + fila('N° de pre-matrícula', r.numRegistro) + fila('Estudiante', nombreEst) + fila('RUN', r.run)
    + fila('Curso ' + CONFIG.ANIO, curso) + (r.especialidad && claveOpcion_(r.especialidad) !== 'NO APLICA' ? fila('Especialidad', r.especialidad) : '')
    + fila('Fecha de registro', fecha)
    + '</table>'
    + '<h3 style="font-size:15px;color:#13306b;margin:24px 0 8px;">Próximos pasos</h3>'
    + '<ol style="font-size:14px;color:#374151;line-height:1.7;padding-left:20px;margin:0;">'
    + '<li>Recibirá una notificación con la fecha y hora para completar la matrícula de forma presencial.</li>'
    + '<li>Debe presentar los siguientes documentos:<ul style="margin:6px 0;">'
    + '<li>Certificado de nacimiento original</li><li>Certificados de estudios (8° Básico, 1°, 2°, 3° y 4° Medio según corresponda)</li>'
    + '<li>Fotografía tamaño 3 x 3,5 cm</li><li>Fotocopia de cédula de identidad (estudiante y apoderado titular)</li>'
    + '<li>Cartola del Registro Social de Hogares</li></ul></li>'
    + '</ol>'
    + '</td></tr>'
    + '<tr><td style="background:#f8f9fc;padding:16px 24px;font-size:12px;color:#6b7280;text-align:center;line-height:1.5;">'
    + 'Este es un correo automático del sistema de Pre-Matrícula ' + CONFIG.ANIO + '. Por favor, no responda a este mensaje.<br>'
    + esc_(CONFIG.LEMA) + '</td></tr>'
    + '</table></div>';

  const texto = 'CONFIRMACIÓN DE PRE-MATRÍCULA ' + CONFIG.ANIO + '\n'
    + 'Liceo Bicentenario Politécnico "Cesáreo Aguirre Goyenechea"\n\n'
    + 'Estimado/a ' + (r.nombreApoderadoTitular || 'Apoderado/a') + ',\n\n'
    + 'Hemos recibido la solicitud de pre-matrícula:\n'
    + '- N° de pre-matrícula: ' + r.numRegistro + '\n- Estudiante: ' + nombreEst + '\n- RUN: ' + r.run + '\n- Curso: ' + curso + '\n'
    + (r.especialidad && claveOpcion_(r.especialidad) !== 'NO APLICA' ? '- Especialidad: ' + r.especialidad + '\n' : '')
    + '\nLa ficha de matrícula será impresa por el liceo y deberá firmarla en la matrícula presencial.\n';

  const opciones = { name: CONFIG.EMAIL_REMITENTE, htmlBody: html };
  if (adjuntos.length) opciones.attachments = adjuntos;
  if (cc.length) opciones.cc = cc.join(',');
  if (CONFIG.EMAIL_RESPONDER_A) opciones.replyTo = CONFIG.EMAIL_RESPONDER_A;

  MailApp.sendEmail(para, asunto, texto, opciones);
}

/**
 * Reintenta los correos que quedaron pendientes (por ejemplo, por cuota diaria agotada).
 * Se puede ejecutar a mano o con el disparador diario (instalarDisparadorDiario).
 */
function reenviarPendientes() {
  const sh = hojaRegistros_();
  const n = sh.getLastRow();
  if (n < 2) return;
  const datos = sh.getRange(2, 1, n - 1, COLUMNAS.length).getValues();
  const cEmail = COLUMNAS.indexOf('emailEnviado');
  let enviados = 0;
  for (let i = 0; i < datos.length; i++) {
    if (datos[i][cEmail] !== 'Pendiente') continue;
    if (MailApp.getRemainingDailyQuota() < 2) break;
    const r = filaAObjeto_(datos[i]);
    try {
      enviarComprobante_(r);
      sh.getRange(i + 2, cEmail + 1).setValue('Sí');
      enviados++;
    } catch (e) { Logger.log('N° ' + r.numRegistro + ': ' + e); }
  }
  Logger.log('Correos reenviados: ' + enviados);
}
