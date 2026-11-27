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
function sinTildes_(v) { return String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim(); }
function esNoAplica_(v) { return !v || sinTildes_(v) === 'NO APLICA'; }
/** "FONASA · TRAMO B", "ISAPRE · COLMENA" */
function saludTexto(r) {
  const s = String(r.atencionSalud || '');
  if (s === 'FONASA' && r.tramoFonasa) return 'FONASA · TRAMO ' + r.tramoFonasa;
  if (s === 'ISAPRE' && r.isapre) return 'ISAPRE · ' + r.isapre;
  return s;
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

/** Colores tomados del logo del liceo. */
const PALETA = {
  azul: '#1f4296',      // azul del escudo
  azulOsc: '#142c66',   // azul profundo (títulos)
  azulSuave: '#eef2fa', // fondo de apoyo
  amarillo: '#e8d41c',  // amarillo del libro y la antorcha
  amarilloSuave: '#fcf7d6',
  oro: '#b8962a',       // amarillo oscurecido para texto sobre blanco
  rojo: '#d92027',      // rojo de la llama (solo detalles)
  texto: '#1b2236',
  gris: '#5d6b8a',
  linea: '#c9d2e6'
};

function fichaPartes_(r) {
  r = r || {};
  const P = PALETA, anio = CFG.anio;
  const F = 'font-family:Arial,Helvetica,sans-serif;';
  const SERIF = 'font-family:Georgia,Times New Roman,serif;';
  const v = k => esc_(r[k] || '');
  const lleno = !!r.numRegistro;
  const nombreCompleto = [v('apellidoPaterno'), v('apellidoMaterno'), v('nombres')].join(' ').trim();
  const logo = LOGO_URL;

  const tabla = (inner, extra) => '<table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;table-layout:fixed;' + (extra || '') + '">' + inner + '</table>';
  const cols12 = '<colgroup>' + new Array(13).join('<col style="width:8.333%">') + '</colgroup>';

  /** Campo con estilo de formulario: etiqueta pequeña y valor sobre una línea fina. */
  const celda = (label, valor, span, extra) =>
    '<td colspan="' + (span || 1) + '" style="' + F + 'padding:5pt 7pt 3pt 7pt;vertical-align:bottom;border-bottom:0.75pt solid ' + P.linea + ';' + (extra || '') + '">'
    + '<div style="font-size:6.2pt;color:' + P.gris + ';letter-spacing:0.6pt;font-weight:600;text-transform:uppercase;line-height:1.2;">' + label + '</div>'
    + '<div style="font-size:9.6pt;color:' + P.texto + ';line-height:1.3;min-height:13pt;padding-top:1.5pt;">' + (valor || '&nbsp;') + '</div></td>';
  const fila = celdas => '<tr>' + celdas.join('') + '</tr>';
  const grilla = filas => tabla(cols12 + filas.join(''), 'margin-top:2pt;');

  /** Título de sección: número en círculo amarillo y título azul sobre una línea. */
  const seccion = (n, titulo, nota) => tabla('<tr>'
    + '<td style="width:20pt;vertical-align:middle;padding:0;">'
    + '<div style="' + F + 'width:16pt;height:16pt;border-radius:8pt;background:' + P.amarillo + ';color:' + P.azulOsc + ';font-weight:800;font-size:8.5pt;line-height:16pt;text-align:center;">' + n + '</div></td>'
    + '<td style="' + F + 'vertical-align:middle;padding:0 0 0 2pt;border-bottom:1.25pt solid ' + P.azul + ';">'
    + '<span style="font-size:9pt;font-weight:700;color:' + P.azul + ';letter-spacing:1.4pt;">' + titulo + '</span>'
    + (nota ? '<span style="font-size:6.8pt;color:' + P.gris + ';letter-spacing:0.3pt;font-style:italic;">&nbsp;&nbsp;' + nota + '</span>' : '')
    + '</td></tr>', 'margin-top:8pt;');

  /** Casilla de verificación. */
  const chk = marcada => '<span style="display:inline-block;width:9pt;height:9pt;border:1pt solid ' + P.azul + ';border-radius:2pt;vertical-align:-1.5pt;text-align:center;'
    + 'font-size:7pt;line-height:9pt;font-weight:bold;color:#fff;background:' + (marcada ? P.azul : '#fff') + ';">' + (marcada ? 'X' : '') + '</span>';
  const siNo = k => {
    const x = r[k];
    const sn = sinTildes_(x);
    return chk(sn === 'SI') + '&nbsp;SÍ&nbsp;&nbsp;&nbsp;&nbsp;' + chk(sn === 'NO') + '&nbsp;NO';
  };

  /** Cinta de colores del logo bajo el encabezado. */
  const cinta = (margen) => tabla(
    '<tr><td style="height:2.6pt;background:' + P.azul + ';font-size:1pt;line-height:1pt;">&nbsp;</td></tr>'
    + '<tr><td style="height:1.6pt;background:' + P.amarillo + ';font-size:1pt;line-height:1pt;">&nbsp;</td></tr>', 'margin-top:' + margen + 'pt;');

  /** Encabezado institucional. */
  const encabezado = (reverso) => {
    const lg = reverso ? 40 : 66;
    let h = tabla('<tr>'
      + '<td style="width:' + (lg + 12) + 'pt;vertical-align:middle;"><img src="' + logo + '" width="' + lg + '" height="' + lg + '" style="width:' + lg + 'pt;height:' + lg + 'pt;display:block;"></td>'
      + '<td style="' + F + 'vertical-align:middle;">'
      + '<div style="font-size:' + (reverso ? 6.6 : 7.4) + 'pt;color:' + P.azul + ';letter-spacing:2.2pt;font-weight:600;">LICEO BICENTENARIO POLITÉCNICO</div>'
      + '<div style="' + SERIF + 'font-size:' + (reverso ? 12.5 : 17.5) + 'pt;color:' + P.azulOsc + ';font-weight:bold;line-height:1.15;margin-top:1pt;">Cesáreo Aguirre Goyenechea</div>'
      + (reverso ? '' : '<div style="font-size:7.6pt;color:' + P.gris + ';margin-top:2pt;letter-spacing:0.3pt;">Educación Media Técnico Profesional &nbsp;<span style="color:' + P.amarillo + ';">●</span>&nbsp; Calama</div>')
      + '</td>'
      + '<td style="width:' + (reverso ? 150 : 128) + 'pt;vertical-align:middle;text-align:right;' + F + '">'
      + (reverso
        ? '<div style="font-size:7pt;color:' + P.azul + ';letter-spacing:1.6pt;font-weight:700;">FICHA DE MATRÍCULA ' + anio + '</div>'
          + '<div style="font-size:6.6pt;color:' + P.gris + ';letter-spacing:1.2pt;margin-top:2pt;">REVERSO · USO DEL LICEO</div>'
        : '<div style="font-size:7pt;color:' + P.gris + ';letter-spacing:2pt;font-weight:600;">FICHA DE MATRÍCULA</div>'
          + '<div style="' + SERIF + 'font-size:30pt;font-weight:bold;color:' + P.azul + ';line-height:1;margin-top:1pt;">' + anio + '</div>'
          + '<div style="display:inline-block;margin-top:3pt;background:' + P.amarillo + ';color:' + P.azulOsc + ';font-size:6.4pt;font-weight:800;letter-spacing:1pt;padding:2pt 6pt;border-radius:2pt;">TÉCNICO PROFESIONAL</div>')
      + '</td></tr>');
    return h + cinta(reverso ? 6 : 8);
  };

  /** Recuadro destacado (datos clave de la matrícula). */
  const caja = (label, valor, estilo, tam) =>
    '<td style="' + F + 'padding:5pt 8pt;border:0.75pt solid ' + P.linea + ';border-radius:4pt;vertical-align:top;' + (estilo || '') + '">'
    + '<div style="font-size:6.2pt;letter-spacing:0.8pt;font-weight:700;text-transform:uppercase;color:inherit;opacity:0.78;">' + label + '</div>'
    + '<div style="font-size:' + (tam || 11) + 'pt;font-weight:700;line-height:1.25;min-height:14pt;padding-top:1.5pt;">' + (valor || '&nbsp;') + '</div></td>';
  const sep = '<td style="width:6pt;"></td>';

  const pie = (pag) => tabla('<tr>'
    + '<td style="' + F + 'font-size:6.8pt;color:' + P.gris + ';padding-top:5pt;border-top:0.75pt solid ' + P.amarillo + ';width:34%;">'
    + (lleno ? 'Pre-matrícula N° ' + v('numRegistro') + (r.nroMatricula ? ' · Matrícula ' + v('nroMatricula') : '') : 'Ficha de matrícula ' + anio) + '</td>'
    + '<td style="' + F + 'font-size:6.8pt;color:' + P.gris + ';padding-top:5pt;border-top:0.75pt solid ' + P.amarillo + ';text-align:center;">' + (lleno ? 'RUN ' + v('run') : '') + '</td>'
    + '<td style="' + F + 'font-size:6.8pt;color:' + P.gris + ';padding-top:5pt;border-top:0.75pt solid ' + P.amarillo + ';text-align:right;width:34%;">Página ' + pag + ' de 2</td>'
    + '</tr>', 'margin-top:8pt;');

  // ============================ ANVERSO ============================
  let a = encabezado(false);

  const cursoTxt = esc_(cursoTexto(r));
  a += tabla('<colgroup><col style="width:24%"><col style="width:6pt"><col style="width:24%"><col style="width:6pt"><col><col style="width:8pt"><col style="width:76pt"></colgroup>'
    + '<tr>'
    + caja('Fecha de registro', esc_(fechaCL_(r.fechaMatricula)), 'color:' + P.texto + ';', 10.5) + sep
    + caja('N° pre-matrícula', v('numRegistro'), 'color:' + P.texto + ';', 10.5) + sep
    + caja('N° de matrícula', v('nroMatricula'), 'background:' + P.amarilloSuave + ';border:1pt solid ' + P.amarillo + ';color:' + P.azulOsc + ';', 13)
    + '<td></td>'
    + '<td rowspan="3" style="' + F + 'border:1pt dashed ' + P.linea + ';border-radius:4pt;text-align:center;vertical-align:middle;color:#9aa6c0;font-size:6.6pt;letter-spacing:0.6pt;">FOTO<br>3 × 3,5 cm</td>'
    + '</tr><tr><td colspan="6" style="height:6pt;"></td></tr><tr>'
    + caja('Curso año ' + (anio - 1), esc_(etiquetaOpcion('cursoGestionPasada', r.cursoGestionPasada || '')), 'color:' + P.texto + ';', 10.5) + sep
    + caja('Curso ' + anio, cursoTxt, 'background:' + P.azul + ';border:1pt solid ' + P.azul + ';color:#ffffff;', 13) + sep
    + caja('Especialidad', v('especialidad'), 'color:' + P.texto + ';', 10.5)
    + '<td></td></tr>', 'margin-top:12pt;border-collapse:separate;');

  a += seccion('1', 'DATOS DEL ESTUDIANTE');
  a += grilla([
    fila([celda('Apellido paterno', '<b>' + v('apellidoPaterno') + '</b>', 4), celda('Apellido materno', '<b>' + v('apellidoMaterno') + '</b>', 4), celda('Nombres', '<b>' + v('nombres') + '</b>', 4)]),
    fila([celda('R.U.N.', '<b>' + v('run') + '</b>', 3), celda('Fecha de nacimiento', esc_(fechaCL_(r.fechaNacimiento)), 3), celda('Edad', v('edad'), 2), celda('Género', v('genero'), 4)]),
    fila([celda('Lugar de nacimiento (comuna)', v('lugarNacimiento'), 4), celda('País', v('pais'), 4), celda('Nacionalidad', v('nacionalidad'), 4)]),
    fila([celda(r.asignaturaElectiva ? 'Religión / Ed. Física' : 'Religión', esc_(r.asignaturaElectiva === 'EDUCACIÓN FÍSICA' ? 'EDUCACIÓN FÍSICA' : (r.religion || '')), 4), celda('Pueblo originario / etnia', v('etnia'), 4), celda('Celular', v('celularEstudiante'), 4)]),
    fila([celda('Correo electrónico', v('correoEstudiante'), 3), celda('Domicilio', v('domicilioEstudiante'), 5), celda('Ubicación del domicilio', v('areaDomicilio'), 4)])
  ]);

  a += seccion('2', 'APODERADOS');
  const tipoAp = t => '<td colspan="2" style="' + F + 'padding:5pt 4pt 3pt 7pt;vertical-align:bottom;border-bottom:0.75pt solid ' + P.linea + ';">'
    + '<span style="display:inline-block;background:' + P.azulSuave + ';color:' + P.azul + ';font-size:6.6pt;font-weight:800;letter-spacing:1pt;padding:3pt 6pt;border-radius:2pt;">' + t + '</span></td>';
  a += grilla([
    '<tr>' + tipoAp('TITULAR') + celda('Nombre completo', v('nombreApoderadoTitular'), 3) + celda('R.U.N.', v('runApoderadoTitular'), 2) + celda('Correo electrónico', v('correoApoderadoTitular'), 3) + celda('Teléfono', v('fonoApoderadoTitular'), 2) + '</tr>',
    '<tr><td colspan="2" style="border-bottom:0.75pt solid ' + P.linea + ';"></td>' + celda('Profesión u oficio del apoderado titular', v('profesionApoderado'), 10) + '</tr>',
    '<tr>' + tipoAp('SUPLENTE') + celda('Nombre completo', v('nombreApoderadoSuplente'), 3) + celda('R.U.N.', v('runApoderadoSuplente'), 2) + celda('Correo electrónico', v('correoApoderadoSuplente'), 3) + celda('Teléfono', v('fonoApoderadoSuplente'), 2) + '</tr>'
  ]);

  a += seccion('3', 'INFORMACIÓN FAMILIAR');
  a += grilla([
    fila([celda('Profesión u oficio del padre', v('profesionPadre'), 6), celda('Profesión u oficio de la madre', v('profesionMadre'), 6)]),
    fila([celda('Vive con', v('personaConQuienVive'), 3), celda('Total hijos en la familia', v('totalHijos'), 3), celda('Lugar que ocupa', v('lugarQueOcupa'), 3), celda('Personas en la casa', v('personasEnCasa'), 3)]),
    fila([celda('Domicilio', v('tipoDomicilio'), 4), celda('Situación económica (ingreso familiar)', v('situacionEconomica'), 8)])
  ]);

  a += seccion('4', 'BENEFICIOS Y SALUD');
  a += grilla([
    fila([celda('Subsidio Único Familiar', siNo('subsidioUnicoFamiliar'), 3), celda('Beneficio JUNAEB', siNo('beneficioJunaeb'), 2), celda('Chile Solidario', siNo('chileSolidario'), 2), celda('Beca Indígena', siNo('becaIndigena'), 2), celda('PIE (Integración Escolar)', siNo('pie'), 3)]),
    fila([celda('Cuidados especiales o enfermedades', v('cuidadosEspeciales') || (lleno ? 'NO DECLARA' : ''), 5, 'height:28pt;vertical-align:top;'),
          celda('Medicamentos contraindicados', v('medicamentosContraindicados') || (lleno ? 'NO DECLARA' : ''), 5, 'height:28pt;vertical-align:top;'),
          celda('Sistema de salud', '<b>' + esc_(saludTexto(r)) + '</b>', 2, 'vertical-align:top;')])
  ]);

  a += seccion('5', 'EMERGENCIA E INFORMACIÓN ACADÉMICA');
  a += grilla([
    fila([celda('En caso de emergencia llamar a', v('contactoEmergencia'), 7), celda('Teléfono de emergencia', '<b>' + v('telefonoEmergencia') + '</b>', 5)]),
    fila([celda('Establecimiento de procedencia', v('procedenciaEscuela'), 7), celda('Alumno antiguo', lleno ? (r.alumnoAntiguo === 'SÍ' ? '<b>SÍ</b>' : 'NO') : '', 2), celda('Curso repetido (si aplica)', v('cursoRepetido') || (lleno ? 'NO' : ''), 3)])
  ]);

  a += tabla('<tr><td style="' + SERIF + 'color:' + P.azul + ';font-size:9pt;font-style:italic;text-align:center;padding:4pt 30pt;line-height:1.4;">'
    + '<span style="color:' + P.amarillo + ';font-size:12pt;">❝</span> ' + esc_(String(CFG.lema).replace(/^"|"$/g, '')) + ' <span style="color:' + P.amarillo + ';font-size:12pt;">❞</span></td></tr>', 'margin-top:10pt;');
  a += pie(1);

  // Marca de agua con el logo detrás del contenido del anverso
  a = '<div style="position:relative;z-index:0;">'
    + '<img src="' + logo + '" style="position:absolute;z-index:-1;left:50%;top:330pt;width:330pt;height:330pt;margin-left:-165pt;opacity:0.045;">'
    + a + '</div>';

  // ============================ REVERSO ============================
  let b = encabezado(true);
  b += tabla(cols12 + fila([
    celda('Estudiante', '<b>' + (nombreCompleto || '&nbsp;') + '</b>', 5),
    celda('R.U.N.', v('run'), 2),
    celda('Curso ' + anio, '<b style="color:' + P.azul + ';">' + cursoTxt + '</b>' + (!esNoAplica_(r.especialidad) ? ' · ' + v('especialidad') : ''), 3),
    celda('N° matrícula', '<b>' + v('nroMatricula') + '</b>', 2, 'background:' + P.amarilloSuave + ';')
  ]), 'margin-top:8pt;');

  const thT = (t, w, extra) => '<td style="' + F + 'background:' + P.azul + ';color:#fff;padding:4pt 7pt;font-size:6.6pt;font-weight:700;letter-spacing:0.8pt;' + (w ? 'width:' + w + ';' : '') + (extra || '') + '">' + t + '</td>';
  const tdT = (html, w, extra) => '<td style="' + F + 'border-bottom:0.75pt solid ' + P.linea + ';padding:5.5pt 7pt;font-size:9pt;color:' + P.texto + ';vertical-align:middle;' + (w ? 'width:' + w + ';' : '') + (extra || '') + '">' + html + '</td>';
  const c = 'text-align:center;';

  b += seccion('6', 'DOCUMENTACIÓN RECEPCIONADA', 'uso exclusivo del liceo');
  b += tabla('<tr>' + thT('DOCUMENTO', '46%') + thT('SÍ', '9%', c) + thT('NO', '9%', c) + thT('OBSERVACIÓN', '36%') + '</tr>'
    + ['Certificado de nacimiento', 'Fotografía 3 × 3,5 cm', 'Fotocopia cédula de identidad (estudiante y apoderado)', 'Registro Social de Hogares — tramo: ______ %']
      .map((d, i) => '<tr style="background:' + (i % 2 ? P.azulSuave : '#fff') + ';">' + tdT(d) + tdT(chk(false), '', c) + tdT(chk(false), '', c) + tdT('&nbsp;') + '</tr>').join(''), 'margin-top:6pt;');
  b += tabla('<tr>' + tdT('<span style="font-size:6.6pt;font-weight:700;color:' + P.azul + ';letter-spacing:0.8pt;">CERTIFICADOS DE ESTUDIOS</span>', '28%')
    + ['8° Básico', '1° Medio', '2° Medio', '3° Medio', '4° Medio'].map(x => tdT(chk(false) + '&nbsp; ' + x, '14.4%', 'white-space:nowrap;')).join('') + '</tr>');
  // Aporte voluntario (lo registra el personal en el panel)
  const monto = r.aporteMonto ? '$' + Number(r.aporteMonto).toLocaleString('es-CL') : '';
  b += tabla(cols12 + fila([
    '<td colspan="3" style="' + F + 'padding:7pt 7pt 3pt 0;vertical-align:bottom;font-size:6.6pt;font-weight:700;color:' + P.azul + ';letter-spacing:0.8pt;border-bottom:0.75pt solid ' + P.linea + ';">APORTE VOLUNTARIO</td>',
    celda('N° de boleta', '<b>' + v('aporteBoleta') + '</b>', 4), celda('Monto', '<b>' + esc_(monto) + '</b>', 5)]), 'margin-top:4pt;');
  b += tabla('<tr><td style="' + F + 'border:0.75pt solid ' + P.linea + ';border-radius:4pt;padding:5pt 7pt;height:34pt;vertical-align:top;font-size:6.4pt;font-weight:600;letter-spacing:0.6pt;color:' + P.gris + ';">OBSERVACIONES</td></tr>', 'margin-top:7pt;border-collapse:separate;');

  b += seccion('7', 'RECEPCIÓN Y ACEPTACIÓN DE DOCUMENTOS POR PARTE DEL APODERADO');
  b += tabla('<tr>' + tdT(chk(false) + '&nbsp;&nbsp;Manual de Convivencia Escolar', '50%') + tdT(chk(false) + '&nbsp;&nbsp;Reglamento de Evaluación', '50%') + '</tr>'
    + '<tr>' + tdT(chk(false) + '&nbsp;&nbsp;Reglamento de Práctica') + tdT(chk(false) + '&nbsp;&nbsp;Reglamento Postulación Especialidades') + '</tr>', 'margin-top:2pt;');

  const parrafo = (html) => '<p style="' + F + 'font-size:8.4pt;color:#2a3350;line-height:1.55;margin:7pt 0 0 0;text-align:justify;">' + html + '</p>';
  b += seccion('8', 'AUTORIZACIÓN PARA EL USO DE IMAGEN');
  b += parrafo('Yo, apoderado(a), autorizo de manera voluntaria y expresa el registro de audios, imágenes y videos de mi pupilo(a), para ser utilizados en el proceso de información, difusión y publicidad de las actividades curriculares y extracurriculares que el establecimiento realiza dentro de su ámbito escolar. Asimismo, autorizo que este material pueda ser publicado en materiales impresos, redes sociales, sitios web y otros soportes válidos del establecimiento.');
  b += tabla('<tr><td style="' + F + 'font-size:9pt;font-weight:700;color:' + P.azulOsc + ';padding:8pt 0 0 0;">¿Desea otorgar esta autorización?</td>'
    + '<td style="' + F + 'font-size:9pt;padding:8pt 0 0 0;width:26%;">' + chk(false) + '&nbsp;&nbsp;<b>Sí, autorizo</b></td>'
    + '<td style="' + F + 'font-size:9pt;padding:8pt 0 0 0;width:26%;">' + chk(false) + '&nbsp;&nbsp;<b>No autorizo</b></td></tr>');

  b += seccion('9', 'DECLARACIÓN Y COMPROMISO DEL APODERADO');
  b += parrafo('Los documentos anteriormente señalados pueden sufrir modificaciones durante el presente periodo escolar, las cuales deberán ser socializadas en el Consejo Escolar y posteriormente publicadas en las páginas web del establecimiento, siendo responsabilidad del apoderado verificar dichas adecuaciones en el portal del Liceo.');
  b += tabla('<tr><td style="width:3pt;background:' + P.amarillo + ';"></td><td style="' + F + 'background:' + P.azulSuave + ';padding:8pt 14pt;font-size:8.4pt;font-weight:700;color:' + P.azulOsc + ';text-align:center;line-height:1.5;letter-spacing:0.2pt;">'
    + 'La persona abajo firmante se compromete a apoyar a su alumno(a) en el proceso de aprendizaje, observando y haciendo cumplir la normativa explicitada en el Manual de Convivencia Escolar.</td></tr>', 'margin-top:9pt;');

  const firma = (t, sub, alto) => '<td style="' + F + 'width:42%;text-align:center;vertical-align:bottom;padding-top:' + alto + 'pt;">'
    + '<div style="border-top:1pt solid ' + P.azulOsc + ';padding-top:4pt;font-size:8.6pt;font-weight:700;color:' + P.azulOsc + ';letter-spacing:0.8pt;">' + t + '</div>'
    + '<div style="font-size:7pt;color:' + P.gris + ';margin-top:2pt;">' + sub + '</div></td>';
  const hueco = '<td style="width:16%;"></td>';
  b += tabla('<tr>' + firma('FIRMA APODERADO(A)', 'Nombre: ' + (r.nombreApoderadoTitular ? v('nombreApoderadoTitular') : '_______________________'), 46) + hueco + firma('FIRMA PROFESOR(A)', 'Nombre: _______________________', 46) + '</tr>');
  b += '<div style="' + F + 'font-size:6.8pt;font-weight:700;color:' + P.azul + ';letter-spacing:1.4pt;padding-top:12pt;">REVISADO POR · UNIDAD DE MATRÍCULA</div>';
  b += tabla('<tr>' + firma('NOMBRE', '&nbsp;', 32) + hueco + firma('FIRMA Y TIMBRE', 'Fecha: ____ / ____ / ' + anio, 32) + '</tr>');

  b += tabla('<tr><td style="width:3pt;background:' + P.rojo + ';"></td><td style="' + F + 'background:#fdf1f1;color:#8f1a1f;font-size:8.2pt;font-weight:700;text-align:center;padding:7pt 10pt;">'
    + 'IMPORTANTE: La ficha de matrícula que no esté firmada por el Apoderado(a) y el Profesor(a) no tiene validez.</td></tr>', 'margin-top:10pt;');
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
    const p = fichaPartes_(r);
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
    caja.innerHTML = regs.map(r => { const p = fichaPartes_(r); return hoja(p.anverso) + hoja(p.reverso); }).join('');
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
    + '<td class="nw"><b style="color:#1f4296">' + esc_(cursoTexto(r)) + '</b></td>'
    + '<td>' + esc_(esNoAplica_(r.especialidad) ? '—' : r.especialidad) + '</td>'
    + '<td>' + esc_(r.nombreApoderadoTitular) + '</td>'
    + '<td class="nw">' + esc_(r.fonoApoderadoTitular) + '</td>'
    + '<td>' + esc_(r.estado) + (r.nroMatricula ? '<br><small style="color:#142c66;font-weight:bold">' + esc_(r.nroMatricula) + '</small>' : '') + '</td>'
    + '<td class="firma"></td></tr>').join('');
  const hoy = new Date().toLocaleDateString('es-CL');
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + esc_(titulo) + '</title><style>'
    + '@page{size:letter landscape;margin:1.2cm;} body{' + F + 'font-size:10pt;color:#111;margin:0;} '
    + '*{-webkit-print-color-adjust:exact;print-color-adjust:exact;} '
    + '.cab{display:flex;align-items:center;gap:12px;border-bottom:2.5pt solid #e8d41c;box-shadow:0 2.6pt 0 #1f4296;padding-bottom:8px;margin-bottom:10px;} '
    + '.cab img{width:46px;height:46px;} .cab .t1{font-size:7.5pt;color:#1f4296;letter-spacing:2px;font-weight:600;} .cab .t2{font-family:Georgia,serif;font-size:14pt;font-weight:bold;color:#142c66;} '
    + '.cab .der{margin-left:auto;text-align:right;} .cab .der b{font-family:Georgia,serif;font-size:14pt;color:#1f4296;display:block;} '
    + 'table{width:100%;border-collapse:collapse;} th{background:#1f4296;color:#fff;font-size:8pt;text-align:left;padding:5px 6px;letter-spacing:.3px;} '
    + 'td{border-bottom:0.75pt solid #c8cfdc;padding:5px 6px;vertical-align:top;font-size:9pt;} tr:nth-child(even) td{background:#eef2fa;} '
    + '.c{text-align:center;} .nw{white-space:nowrap;} .firma{width:90px;} thead{display:table-header-group;} tr{page-break-inside:avoid;} '
    + '.pie{margin-top:10px;font-size:8pt;color:#5b6474;display:flex;justify-content:space-between;}'
    + '</style></head><body>'
    + '<div class="cab"><img src="' + LOGO_URL + '"><div><div class="t1">LICEO BICENTENARIO POLITÉCNICO</div><div class="t2">Cesáreo Aguirre Goyenechea</div></div>'
    + '<div class="der"><b>' + esc_(titulo) + '</b><span style="font-size:9pt;color:#5b6474">' + regs.length + ' estudiante' + (regs.length === 1 ? '' : 's') + ' · ' + hoy + '</span></div></div>'
    + '<table><thead><tr><th class="c">#</th><th class="c">N°</th><th>Estudiante</th><th>RUN</th><th>Curso ' + CFG.anio + '</th><th>Especialidad</th><th>Apoderado titular</th><th>Teléfono</th><th>Estado</th><th>Firma</th></tr></thead>'
    + '<tbody>' + (filas || '<tr><td colspan="10" class="c">Sin registros</td></tr>') + '</tbody></table>'
    + '<div class="pie"><span>Pre-Matrícula ' + CFG.anio + '</span><span>Impreso el ' + hoy + '</span></div>'
    + '</body></html>';
}
