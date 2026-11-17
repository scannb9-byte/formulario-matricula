/**
 * ficha.js → Ficha de matrícula (anverso + reverso) generada en el navegador.
 * Replica el formato oficial de la "FICHA DE MATRÍCULA EDUCACIÓN TÉCNICA PROFESIONAL".
 *
 *  - documentoFichas(regs, 'impresion') → HTML listo para imprimir (hoja oficio 21,6 x 33 cm).
 *    Acepta varios registros: imprime todas las fichas seguidas (cada una con anverso y reverso).
 *  - descargarFichasPDF(regs)            → PDF (oficio) descargado directamente, sin pasar por el servidor.
 *  - documentoNomina(regs, titulo)       → listado imprimible (nómina) de los registros filtrados.
 */
const LOGO_URL = new URL('img/logo.png', document.baseURI).href;

function esc_(s) {
  return String(s === null || s === undefined ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function fechaCL_(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
  return m ? m[3] + '-' + m[2] + '-' + m[1] : String(iso || '');
}
function etiquetaOpcion(key, valor) {
  let c = null;
  ESQUEMA.forEach(p => p.secciones.forEach(s => s.campos.forEach(x => { if (x.key === key) c = x; })));
  if (!c || !c.options) return valor;
  const o = c.options.filter(x => (typeof x === 'string' ? x : x.v) === valor)[0];
  return o ? (typeof o === 'string' ? o : o.t) : valor;
}
/** "1° Medio A" (con la letra asignada por el liceo, si existe). */
function cursoTexto(r) {
  const t = etiquetaOpcion('curso', (r && r.curso) || '');
  return t ? t + (r.letra ? ' ' + r.letra : '') : '';
}
function nombrePdf(regs) {
  if (regs.length !== 1) return 'Fichas_Matricula_' + CFG.anio + '_' + regs.length + '_registros.pdf';
  const r = regs[0];
  const n = [r.apellidoPaterno, r.apellidoMaterno, r.nombres].join('_').replace(/\s+/g, '_').replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9_\-]/g, '');
  return 'Ficha_Matricula_' + CFG.anio + '_' + (r.numRegistro || '') + '_' + n + '.pdf';
}

function fichaPartes_(r, modo) {
  r = r || {};
  const pdf = modo === 'pdf';
  const anio = CFG.anio;
  // Escalas: 'impresion' = hoja oficio (21,6 x 33 cm) · 'pdf' = compacta (cabe en carta)
  const S = pdf
    ? { lab: 5.8, val: 8.4, sec: 8, pad: 2.2, gap: 6, alto: 12, caja: 30, logo: 54, foto: 76, chk: 9, firma: 40, txt: 7.8 }
    : { lab: 6.7, val: 9.7, sec: 9.1, pad: 3.4, gap: 10, alto: 15, caja: 48, logo: 68, foto: 100, chk: 11, firma: 64, txt: 8.9 };
  const NAVY = '#13306b', ORO = '#e9a800', LINEA = '#b8c1d1', GRIS = '#5b6474', SUAVE = '#f3f5f9';
  const F = 'font-family:Arial,Helvetica,sans-serif;';
  const v = k => esc_(r[k] || '');
  const tabla = (inner, extra) => '<table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;table-layout:fixed;' + (extra || '') + '">' + inner + '</table>';
  const cols12 = '<colgroup>' + new Array(13).join('<col style="width:8.333%">') + '</colgroup>';

  /** Celda tipo formulario: etiqueta pequeña arriba y valor abajo. */
  const celda = (label, valor, span, extra) =>
    '<td colspan="' + (span || 1) + '" style="' + F + 'border:0.75pt solid ' + LINEA + ';padding:' + S.pad + 'pt 5pt;vertical-align:top;' + (extra || '') + '">'
    + '<div style="font-size:' + S.lab + 'pt;color:' + GRIS + ';letter-spacing:0.3pt;line-height:1.2;">' + label + '</div>'
    + '<div style="font-size:' + S.val + 'pt;color:#0b1220;line-height:1.25;min-height:' + S.alto + 'pt;padding-top:1pt;">' + (valor || '&nbsp;') + '</div></td>';
  const fila = celdas => '<tr>' + celdas.join('') + '</tr>';
  const grilla = filas => tabla(cols12 + filas.join(''));

  /** Barra de título de sección numerada. */
  const seccion = (n, titulo, extra) => tabla('<tr>'
    + '<td style="' + F + 'width:22pt;background:' + ORO + ';color:' + NAVY + ';font-weight:bold;font-size:' + S.sec + 'pt;text-align:center;padding:' + (S.pad + 0.5) + 'pt 0;">' + n + '</td>'
    + '<td style="' + F + 'background:' + NAVY + ';color:#ffffff;font-weight:bold;font-size:' + S.sec + 'pt;letter-spacing:0.6pt;padding:' + (S.pad + 0.5) + 'pt 8pt;">' + titulo + '</td>'
    + '</tr>', 'margin-top:' + S.gap + 'pt;' + (extra || ''));

  /** Casilla de verificación (marcada o vacía). */
  const chk = (marcada) => pdf
    ? '<span style="font-size:' + (S.chk + 3) + 'pt;line-height:1;">' + (marcada ? '&#9746;' : '&#9744;') + '</span>'
    : '<span style="display:inline-block;width:' + S.chk + 'pt;height:' + S.chk + 'pt;border:1pt solid #1f2937;vertical-align:-1.5pt;text-align:center;font-size:' + (S.chk - 1.5) + 'pt;line-height:' + S.chk + 'pt;font-weight:bold;">' + (marcada ? 'X' : '') + '</span>';
  const siNo = k => {
    const x = r[k];
    if (!x) return chk(false) + '&nbsp;Sí &nbsp;&nbsp;&nbsp;' + chk(false) + '&nbsp;No';
    return chk(x === 'Sí') + '&nbsp;Sí &nbsp;&nbsp;&nbsp;' + chk(x === 'No') + '&nbsp;No';
  };

  const logo = LOGO_URL;
  const nombreCompleto = [v('apellidoPaterno'), v('apellidoMaterno'), v('nombres')].join(' ').trim();

  /** Encabezado institucional (completo en anverso, compacto en reverso). */
  const encabezado = (compacto) => {
    const lg = compacto ? S.logo * 0.62 : S.logo;
    let h = tabla('<tr>'
      + '<td style="width:' + (lg + 10) + 'pt;vertical-align:middle;"><img src="' + logo + '" width="' + lg + '" height="' + lg + '" style="width:' + lg + 'pt;height:' + lg + 'pt;"></td>'
      + '<td style="' + F + 'vertical-align:middle;padding-left:4pt;">'
      + '<div style="font-size:' + (compacto ? S.lab + 0.6 : S.lab + 1.4) + 'pt;color:' + GRIS + ';letter-spacing:1pt;">LICEO BICENTENARIO POLITÉCNICO</div>'
      + '<div style="font-size:' + (compacto ? S.val + 1.5 : S.val + 5) + 'pt;color:' + NAVY + ';font-weight:bold;line-height:1.15;">CESÁREO AGUIRRE GOYENECHEA</div>'
      + (compacto ? '' : '<div style="font-size:' + (S.lab + 1.2) + 'pt;color:' + GRIS + ';margin-top:1pt;">Educación Media Técnico Profesional · Calama</div>')
      + '</td>'
      + '<td style="width:' + (compacto ? 170 : 175) + 'pt;vertical-align:middle;text-align:right;' + F + '">'
      + tabla('<tr><td style="' + F + 'background:' + NAVY + ';color:#fff;text-align:center;padding:' + (compacto ? 3 : 5) + 'pt 6pt;">'
        + '<div style="font-size:' + (compacto ? S.lab + 0.8 : S.lab + 1.6) + 'pt;letter-spacing:1.2pt;">FICHA DE MATRÍCULA' + (compacto ? ' · REVERSO' : '') + '</div>'
        + (compacto ? '' : '<div style="font-size:' + (S.val + 9) + 'pt;font-weight:bold;line-height:1.1;color:#ffffff;">' + anio + '</div>')
        + '</td></tr>'
        + (compacto ? '' : '<tr><td style="' + F + 'background:' + ORO + ';color:' + NAVY + ';text-align:center;font-size:' + (S.lab + 0.8) + 'pt;font-weight:bold;padding:2pt 4pt;letter-spacing:0.5pt;">EDUCACIÓN TÉCNICO PROFESIONAL</td></tr>'))
      + '</td></tr>');
    h += tabla('<tr><td style="height:2.5pt;background:' + ORO + ';font-size:1pt;line-height:1pt;">&nbsp;</td></tr><tr><td style="height:1pt;background:' + NAVY + ';font-size:1pt;line-height:1pt;">&nbsp;</td></tr>', 'margin-top:' + (S.gap * 0.6) + 'pt;');
    return h;
  };

  const pie = (pag) => tabla('<tr>'
    + '<td style="' + F + 'font-size:' + (S.lab + 0.4) + 'pt;color:' + GRIS + ';padding-top:4pt;border-top:0.75pt solid ' + LINEA + ';">'
    + (r.numRegistro ? 'Pre-matrícula N° ' + v('numRegistro') + ' &nbsp;·&nbsp; RUN ' + v('run') : 'Ficha de matrícula ' + anio) + '</td>'
    + '<td style="' + F + 'font-size:' + (S.lab + 0.4) + 'pt;color:' + GRIS + ';padding-top:4pt;border-top:0.75pt solid ' + LINEA + ';text-align:right;">Página ' + pag + ' de 2</td>'
    + '</tr>', 'margin-top:' + S.gap + 'pt;');

  // ============================ ANVERSO ============================
  let a = encabezado(false);

  // Datos de matrícula + foto
  a += tabla(cols12
    + '<tr>' + celda('FECHA DE REGISTRO', esc_(fechaCL_(r.fechaMatricula)), 3) + celda('N° PRE-MATRÍCULA', v('numRegistro'), 3) + celda('N° MATRÍCULA', v('nroMatricula'), 4, 'background:' + SUAVE + ';')
    + '<td colspan="2" rowspan="2" style="' + F + 'border:0.75pt dashed ' + LINEA + ';text-align:center;vertical-align:middle;color:#9aa3b5;font-size:' + S.lab + 'pt;height:' + S.foto + 'pt;">FOTO<br>3 x 3,5 cm</td></tr>'
    + fila([celda('CURSO AÑO ' + (anio - 1), esc_(etiquetaOpcion('cursoGestionPasada', r.cursoGestionPasada || '')), 3), celda('CURSO AÑO ' + anio, '<b>' + esc_(cursoTexto(r)) + '</b>', 3), celda('ESPECIALIDAD', '<b>' + v('especialidad') + '</b>', 4)]),
    'margin-top:' + S.gap + 'pt;');

  a += seccion('1', 'DATOS DEL ESTUDIANTE');
  a += grilla([
    fila([celda('APELLIDO PATERNO', v('apellidoPaterno'), 4), celda('APELLIDO MATERNO', v('apellidoMaterno'), 4), celda('NOMBRES', v('nombres'), 4)]),
    fila([celda('R.U.N.', '<b>' + v('run') + '</b>', 3), celda('FECHA DE NACIMIENTO', esc_(fechaCL_(r.fechaNacimiento)), 3), celda('EDAD', v('edad'), 2), celda('GÉNERO', v('genero'), 4)]),
    fila([celda('LUGAR DE NACIMIENTO (COMUNA)', v('lugarNacimiento'), 4), celda('PAÍS', v('pais'), 4), celda('NACIONALIDAD', v('nacionalidad'), 4)]),
    fila([celda('RELIGIÓN', v('religion'), 4), celda('PUEBLO ORIGINARIO / ETNIA', v('etnia'), 4), celda('CELULAR', v('celularEstudiante'), 4)]),
    fila([celda('CORREO ELECTRÓNICO', v('correoEstudiante'), 5), celda('DOMICILIO', v('domicilioEstudiante'), 7)])
  ]);

  a += seccion('2', 'APODERADOS');
  const tipoAp = t => '<td colspan="2" style="' + F + 'border:0.75pt solid ' + LINEA + ';background:' + SUAVE + ';font-size:' + S.lab + 'pt;font-weight:bold;color:' + NAVY + ';text-align:center;vertical-align:middle;letter-spacing:0.5pt;">' + t + '</td>';
  a += grilla([
    '<tr>' + tipoAp('TITULAR') + celda('NOMBRE COMPLETO', v('nombreApoderadoTitular'), 4) + celda('CORREO ELECTRÓNICO', v('correoApoderadoTitular'), 3) + celda('TELÉFONO', v('fonoApoderadoTitular'), 3) + '</tr>',
    '<tr>' + tipoAp('SUPLENTE') + celda('NOMBRE COMPLETO', v('nombreApoderadoSuplente'), 4) + celda('CORREO ELECTRÓNICO', v('correoApoderadoSuplente'), 3) + celda('TELÉFONO', v('fonoApoderadoSuplente'), 3) + '</tr>'
  ]);

  a += seccion('3', 'INFORMACIÓN FAMILIAR');
  a += grilla([
    fila([celda('PROFESIÓN U OFICIO DEL PADRE', v('profesionPadre'), 4), celda('PROFESIÓN U OFICIO DE LA MADRE', v('profesionMadre'), 4), celda('PROFESIÓN U OFICIO DEL APODERADO', v('profesionApoderado'), 4)]),
    fila([celda('VIVE CON', v('personaConQuienVive'), 3), celda('TOTAL HIJOS EN LA FAMILIA', v('totalHijos'), 3), celda('LUGAR QUE OCUPA', v('lugarQueOcupa'), 3), celda('PERSONAS EN LA CASA', v('personasEnCasa'), 3)]),
    fila([celda('DOMICILIO', v('tipoDomicilio'), 4), celda('SITUACIÓN ECONÓMICA (INGRESO FAMILIAR)', v('situacionEconomica'), 8)])
  ]);

  a += seccion('4', 'BENEFICIOS Y SALUD');
  a += grilla([
    fila([celda('SUBSIDIO ÚNICO FAMILIAR', siNo('subsidioUnicoFamiliar'), 3), celda('BENEFICIO JUNAEB', siNo('beneficioJunaeb'), 3), celda('CHILE SOLIDARIO', siNo('chileSolidario'), 3), celda('BECA INDÍGENA', siNo('becaIndigena'), 3)]),
    fila([celda('CUIDADOS ESPECIALES O ENFERMEDADES', v('cuidadosEspeciales') || (r.numRegistro ? 'No declara' : ''), 5, 'height:' + S.caja + 'pt;'),
          celda('MEDICAMENTOS CONTRAINDICADOS', v('medicamentosContraindicados') || (r.numRegistro ? 'No declara' : ''), 5, 'height:' + S.caja + 'pt;'),
          celda('SISTEMA DE SALUD', '<b>' + v('atencionSalud') + '</b>', 2)])
  ]);

  a += seccion('5', 'CONTACTO DE EMERGENCIA E INFORMACIÓN ACADÉMICA');
  a += grilla([
    fila([celda('EN CASO DE EMERGENCIA LLAMAR A', v('contactoEmergencia'), 7), celda('TELÉFONO DE EMERGENCIA', '<b>' + v('telefonoEmergencia') + '</b>', 5)]),
    fila([celda('ESTABLECIMIENTO DE PROCEDENCIA', v('procedenciaEscuela'), 8), celda('CURSO REPETIDO (SI APLICA)', v('cursoRepetido') || (r.numRegistro ? 'No' : ''), 4)])
  ]);

  a += tabla('<tr><td style="' + F + 'background:' + SUAVE + ';border-left:3pt solid ' + ORO + ';color:' + NAVY + ';font-size:' + S.txt + 'pt;font-style:italic;text-align:center;padding:' + (S.pad + 2) + 'pt 8pt;">' + esc_(CFG.lema) + '</td></tr>', 'margin-top:' + S.gap + 'pt;');
  a += pie(1);

  // ============================ REVERSO ============================
  let b = encabezado(true);
  b += tabla(cols12 + fila([celda('ESTUDIANTE', '<b>' + (nombreCompleto || '&nbsp;') + '</b>', 6), celda('R.U.N.', v('run'), 3), celda('CURSO ' + anio, esc_(cursoTexto(r)) + (r.especialidad && r.especialidad !== 'No Aplica' ? ' · ' + v('especialidad') : ''), 3)]), 'margin-top:' + S.gap + 'pt;');

  const tdT = (html, w, extra) => '<td style="' + F + 'border:0.75pt solid ' + LINEA + ';padding:' + (S.pad + 1.5) + 'pt 6pt;font-size:' + S.val + 'pt;vertical-align:middle;' + (w ? 'width:' + w + ';' : '') + (extra || '') + '">' + html + '</td>';
  const thT = (t, w, extra) => '<td style="' + F + 'background:' + SUAVE + ';border:0.75pt solid ' + LINEA + ';padding:' + S.pad + 'pt 6pt;font-size:' + S.lab + 'pt;font-weight:bold;color:' + NAVY + ';letter-spacing:0.4pt;' + (w ? 'width:' + w + ';' : '') + (extra || '') + '">' + t + '</td>';
  const c = 'text-align:center;';

  b += seccion('6', 'DOCUMENTACIÓN RECEPCIONADA <span style="font-weight:normal;font-size:' + S.lab + 'pt;letter-spacing:0;">(uso exclusivo del liceo)</span>');
  b += tabla('<tr>' + thT('DOCUMENTO', '46%') + thT('SÍ', '9%', c) + thT('NO', '9%', c) + thT('OBSERVACIÓN', '36%') + '</tr>'
    + ['Certificado de nacimiento', 'Fotografía 3 x 3,5 cm', 'Fotocopia cédula de identidad (estudiante y apoderado)', 'Registro Social de Hogares — tramo: ______ %']
      .map(d => '<tr>' + tdT(d) + tdT(chk(false), '', c) + tdT(chk(false), '', c) + tdT('&nbsp;') + '</tr>').join(''));
  b += tabla('<tr>' + tdT('<span style="font-size:' + S.lab + 'pt;font-weight:bold;color:' + NAVY + ';">CERTIFICADOS DE ESTUDIOS</span>', '30%')
    + ['8° Básico', '1° Medio', '2° Medio', '3° Medio', '4° Medio'].map(x => tdT(chk(false) + '&nbsp; ' + x, '14%', 'white-space:nowrap;')).join('') + '</tr>', 'margin-top:-0.75pt;');
  b += tabla('<tr><td style="' + F + 'border:0.75pt solid ' + LINEA + ';padding:' + S.pad + 'pt 6pt;height:' + (S.caja * 1.1) + 'pt;vertical-align:top;font-size:' + S.lab + 'pt;color:' + GRIS + ';">OBSERVACIONES</td></tr>', 'margin-top:-0.75pt;');

  b += seccion('7', 'RECEPCIÓN DE DOCUMENTOS POR PARTE DEL APODERADO');
  b += tabla('<tr>' + tdT(chk(false) + '&nbsp;&nbsp;Manual de Convivencia Escolar', '50%') + tdT(chk(false) + '&nbsp;&nbsp;Reglamento de Evaluación', '50%') + '</tr>'
    + '<tr>' + tdT(chk(false) + '&nbsp;&nbsp;Reglamento de Práctica') + tdT(chk(false) + '&nbsp;&nbsp;Reglamento Postulación Especialidades') + '</tr>');

  const parrafo = (html, extra) => '<p style="' + F + 'font-size:' + S.txt + 'pt;color:#1f2937;line-height:1.45;margin:' + (S.gap * 0.7) + 'pt 0 0 0;text-align:justify;' + (extra || '') + '">' + html + '</p>';
  b += seccion('8', 'AUTORIZACIÓN PARA EL USO DE IMAGEN');
  b += parrafo('Yo, apoderado(a), autorizo de manera voluntaria y expresa el registro de audios, imágenes y videos de mi pupilo(a), para ser utilizados en el proceso de información, difusión y publicidad de las actividades curriculares y extracurriculares que el establecimiento realiza dentro de su ámbito escolar. Asimismo, autorizo que este material pueda ser publicado en materiales impresos, redes sociales, sitios web y otros soportes válidos del establecimiento.');
  b += tabla('<tr><td style="' + F + 'font-size:' + S.val + 'pt;font-weight:bold;padding:' + (S.gap * 0.7) + 'pt 0 0 0;">¿Desea otorgar esta autorización?</td>'
    + '<td style="' + F + 'font-size:' + S.val + 'pt;padding:' + (S.gap * 0.7) + 'pt 0 0 0;width:28%;">' + chk(false) + '&nbsp;&nbsp;<b>Sí, autorizo</b></td>'
    + '<td style="' + F + 'font-size:' + S.val + 'pt;padding:' + (S.gap * 0.7) + 'pt 0 0 0;width:28%;">' + chk(false) + '&nbsp;&nbsp;<b>No, no autorizo</b></td></tr>');

  b += seccion('9', 'DECLARACIÓN Y COMPROMISO DEL APODERADO');
  b += parrafo('Los documentos anteriormente señalados pueden sufrir modificaciones durante el presente periodo escolar, las cuales deberán ser socializadas en el Consejo Escolar y posteriormente publicadas en las páginas web del establecimiento, siendo responsabilidad del apoderado verificar dichas adecuaciones en el portal del Liceo.');
  b += tabla('<tr><td style="' + F + 'background:' + SUAVE + ';border-left:3pt solid ' + NAVY + ';padding:' + (S.pad + 3) + 'pt 10pt;font-size:' + S.txt + 'pt;font-weight:bold;color:' + NAVY + ';text-align:center;line-height:1.45;">'
    + '"LA PERSONA ABAJO FIRMANTE SE COMPROMETE A APOYAR A SU ALUMNO(A) EN EL PROCESO DE APRENDIZAJE OBSERVANDO Y HACIENDO CUMPLIR LA NORMATIVA EXPLICITADA EN EL MANUAL DE CONVIVENCIA ESCOLAR"</td></tr>', 'margin-top:' + S.gap + 'pt;');

  const firma = (t, sub) => '<td style="' + F + 'width:42%;text-align:center;vertical-align:bottom;padding-top:' + S.firma + 'pt;">'
    + '<div style="border-top:1pt solid #111827;padding-top:3pt;font-size:' + S.val + 'pt;font-weight:bold;color:#111827;">' + t + '</div>'
    + '<div style="font-size:' + S.lab + 'pt;color:' + GRIS + ';margin-top:1pt;">' + sub + '</div></td>';
  const sep = '<td style="width:16%;"></td>';
  b += tabla('<tr>' + firma('FIRMA APODERADO(A)', 'Nombre: ' + (r.nombreApoderadoTitular ? v('nombreApoderadoTitular') : '_______________________')) + sep + firma('FIRMA PROFESOR(A)', 'Nombre: _______________________') + '</tr>');
  b += '<div style="' + F + 'font-size:' + S.lab + 'pt;font-weight:bold;color:' + NAVY + ';letter-spacing:0.5pt;padding-top:' + (S.gap * 1.6) + 'pt;">REVISADO POR (UNIDAD DE MATRÍCULA)</div>';
  b += tabla('<tr>' + firma('NOMBRE', '&nbsp;').replace('padding-top:' + S.firma, 'padding-top:' + (S.firma * 0.7)) + sep + firma('FIRMA Y TIMBRE', 'Fecha: ____ / ____ / ' + anio).replace('padding-top:' + S.firma, 'padding-top:' + (S.firma * 0.7)) + '</tr>');

  b += tabla('<tr><td style="' + F + 'border:1pt solid #c8321f;background:#fdf1ef;color:#8a2114;font-size:' + S.txt + 'pt;font-weight:bold;text-align:center;padding:' + (S.pad + 2) + 'pt 8pt;">'
    + 'IMPORTANTE: La ficha de matrícula que no esté firmada por el Apoderado(a) y el Profesor(a) no tiene validez.</td></tr>', 'margin-top:' + (S.gap * 1.6) + 'pt;');
  b += pie(2);

  return { anverso: a, reverso: b };
}

const CSS_FICHA_IMPRESION = '@page{size:8.5in 13in;margin:1cm 1.2cm;} html,body{margin:0;padding:0;background:#fff;} '
  + '.hoja{width:100%;box-sizing:border-box;} .salto{page-break-before:always;break-before:page;} '
  + '*{-webkit-print-color-adjust:exact;print-color-adjust:exact;} '
  + '@media screen{body{background:#e9ecf2;} .hoja{width:8.5in;min-height:13in;margin:16px auto;padding:1cm 1.2cm;background:#fff;box-shadow:0 2px 14px rgba(0,0,0,.18);}}';

/** HTML completo para imprimir una o varias fichas (anverso y reverso cada una). */
function documentoFichas(regs, modo) {
  regs = (regs && regs.length) ? regs : [{}];
  const F = 'font-family:Arial,Helvetica,sans-serif;';
  const hojas = regs.map((r, i) => {
    const p = fichaPartes_(r, modo || 'impresion');
    return '<div class="hoja' + (i ? ' salto' : '') + '">' + p.anverso + '</div>'
      + '<div class="hoja salto">' + p.reverso + '</div>';
  }).join('');
  const titulo = regs.length === 1
    ? 'Ficha de Matrícula ' + CFG.anio + (regs[0].numRegistro ? ' N° ' + esc_(regs[0].numRegistro) : '')
    : 'Fichas de Matrícula ' + CFG.anio + ' (' + regs.length + ')';
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + titulo + '</title>'
    + '<style>' + CSS_FICHA_IMPRESION + '</style></head><body style="' + F + '">' + hojas + '</body></html>';
}

/** Carga html2pdf solo cuando se necesita (la primera vez tarda 1-2 s). */
let html2pdfPromesa_ = null;
function cargarHtml2pdf_() {
  if (window.html2pdf) return Promise.resolve(window.html2pdf);
  if (!html2pdfPromesa_) html2pdfPromesa_ = new Promise((ok, mal) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.2/dist/html2pdf.bundle.min.js';
    s.onload = () => ok(window.html2pdf);
    s.onerror = () => { html2pdfPromesa_ = null; mal(new Error('No se pudo cargar el generador de PDF. Revise su conexión.')); };
    document.head.appendChild(s);
  });
  return html2pdfPromesa_;
}

/** Genera y descarga el PDF (tamaño oficio: anverso y reverso de cada ficha, una hoja por página). */
function descargarFichasPDF(regs) {
  return cargarHtml2pdf_().then(h2p => {
    // Contenedor fuera de pantalla; html2pdf copia cada hoja a su propia capa para dibujarla
    const caja = document.createElement('div');
    caja.style.cssText = 'position:absolute;left:-12000px;top:0;width:8.5in;';
    const F = 'font-family:Arial,Helvetica,sans-serif;';
    const hoja = html => '<div class="hoja-pdf" style="' + F + 'width:8.5in;height:13in;box-sizing:border-box;padding:1cm 1.2cm;overflow:hidden;background:#fff;">' + html + '</div>';
    caja.innerHTML = regs.map(r => { const p = fichaPartes_(r, 'impresion'); return hoja(p.anverso) + hoja(p.reverso); }).join('');
    document.body.appendChild(caja);
    const hojas = Array.from(caja.querySelectorAll('.hoja-pdf'));
    const opciones = {
      margin: 0,
      filename: nombrePdf(regs),
      image: { type: 'jpeg', quality: 0.92 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', scrollX: 0, scrollY: 0 },
      jsPDF: { unit: 'in', format: [8.5, 13], orientation: 'portrait', compress: true }
    };
    // Una página por hoja: se dibuja la primera y se agregan las demás
    let w = h2p().set(opciones).from(hojas[0]).toPdf();
    hojas.slice(1).forEach(h => {
      w = w.get('pdf').then(pdf => { pdf.addPage([8.5, 13], 'portrait'); }).from(h).toContainer().toCanvas().toPdf();
    });
    return w.save().then(() => caja.remove(), e => { caja.remove(); throw e; });
  });
}

/** Nómina imprimible (carta horizontal) de los registros indicados. */
function documentoNomina(regs, titulo) {
  const F = 'font-family:Arial,Helvetica,sans-serif;';
  const filas = regs.map((r, i) => '<tr>'
    + '<td class="c">' + (i + 1) + '</td>'
    + '<td class="c">' + esc_(r.numRegistro) + '</td>'
    + '<td>' + esc_([r.apellidoPaterno, r.apellidoMaterno].join(' ') + ', ' + r.nombres) + '</td>'
    + '<td class="nw">' + esc_(r.run) + '</td>'
    + '<td class="nw"><b>' + esc_(cursoTexto(r)) + '</b></td>'
    + '<td>' + esc_(r.especialidad === 'No Aplica' ? '—' : r.especialidad) + '</td>'
    + '<td>' + esc_(r.nombreApoderadoTitular) + '</td>'
    + '<td class="nw">' + esc_(r.fonoApoderadoTitular) + '</td>'
    + '<td>' + esc_(r.estado) + (r.nroMatricula ? '<br><small>Mat. ' + esc_(r.nroMatricula) + '</small>' : '') + '</td>'
    + '<td class="firma"></td></tr>').join('');
  const hoy = new Date().toLocaleDateString('es-CL');
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + esc_(titulo) + '</title><style>'
    + '@page{size:letter landscape;margin:1.2cm;} body{' + F + 'font-size:10pt;color:#111;margin:0;} '
    + '*{-webkit-print-color-adjust:exact;print-color-adjust:exact;} '
    + '.cab{display:flex;align-items:center;gap:12px;border-bottom:2.5pt solid #e9a800;padding-bottom:8px;margin-bottom:10px;} '
    + '.cab img{width:46px;height:46px;} .cab .t1{font-size:8pt;color:#5b6474;letter-spacing:1px;} .cab .t2{font-size:13pt;font-weight:bold;color:#13306b;} '
    + '.cab .der{margin-left:auto;text-align:right;} .cab .der b{font-size:13pt;color:#13306b;display:block;} '
    + 'table{width:100%;border-collapse:collapse;} th{background:#13306b;color:#fff;font-size:8pt;text-align:left;padding:5px 6px;letter-spacing:.3px;} '
    + 'td{border-bottom:0.75pt solid #c8cfdc;padding:5px 6px;vertical-align:top;font-size:9pt;} tr:nth-child(even) td{background:#f5f7fb;} '
    + '.c{text-align:center;} .nw{white-space:nowrap;} .firma{width:90px;} thead{display:table-header-group;} tr{page-break-inside:avoid;} '
    + '.pie{margin-top:10px;font-size:8pt;color:#5b6474;display:flex;justify-content:space-between;}'
    + '</style></head><body>'
    + '<div class="cab"><img src="' + LOGO_URL + '"><div><div class="t1">LICEO BICENTENARIO POLITÉCNICO</div><div class="t2">CESÁREO AGUIRRE GOYENECHEA</div></div>'
    + '<div class="der"><b>' + esc_(titulo) + '</b><span style="font-size:9pt;color:#5b6474">' + regs.length + ' estudiante' + (regs.length === 1 ? '' : 's') + ' · ' + hoy + '</span></div></div>'
    + '<table><thead><tr><th class="c">#</th><th class="c">N°</th><th>Estudiante</th><th>RUN</th><th>Curso ' + CFG.anio + '</th><th>Especialidad</th><th>Apoderado titular</th><th>Teléfono</th><th>Estado</th><th>Firma</th></tr></thead>'
    + '<tbody>' + (filas || '<tr><td colspan="10" class="c">Sin registros</td></tr>') + '</tbody></table>'
    + '<div class="pie"><span>Pre-Matrícula ' + CFG.anio + '</span><span>Impreso el ' + hoy + '</span></div>'
    + '</body></html>';
}
