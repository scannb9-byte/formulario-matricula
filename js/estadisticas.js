/* ============================================================
 *  estadisticas.js → Pestaña "Estadísticas" del panel
 *   - Indicadores y gráficos (barras) calculados en el navegador con los registros ya cargados.
 *   - Reportes imprimibles: nómina por grupo, resumen de una variable e informe general.
 *  No consulta al servidor: usa S.registros (app.js).
 * ============================================================ */

const NAC_CHILE = ['CHILENA', 'CHILENO', 'CHILE'];
const SIN_INFO = 'SIN INFORMAR';

/** Valor normalizado para agrupar. */
function vEst(x) { const s = String(x == null ? '' : x).replace(/\s+/g, ' ').trim().toUpperCase(); return s || SIN_INFO; }
function esChileno(r) { return NAC_CHILE.indexOf(claveOp(r.nacionalidad)) >= 0 || !r.nacionalidad; }

function ordenOpciones(key) { return opciones(CAMPO[key]).map(o => o.t); }

/**
 * Variables disponibles para gráficos y reportes.
 *  val(r)  → texto del grupo (null = el registro no entra en esta variable)
 *  orden   → lista con el orden fijo de los grupos (si no, de mayor a menor)
 */
const DIMENSIONES = [
  { k: 'curso', t: 'Curso ' + CFG.anio, val: r => etiqueta(CAMPO.curso, r.curso) || SIN_INFO, orden: () => ordenOpciones('curso') },
  { k: 'cursoLetra', t: 'Curso y letra', val: r => r.curso ? etiqueta(CAMPO.curso, r.curso) + ' ' + (r.letra || '(SIN LETRA)') : SIN_INFO,
    orden: () => { const o = []; ordenOpciones('curso').forEach(c => { CFG.letras.forEach(l => o.push(c + ' ' + l)); o.push(c + ' (SIN LETRA)'); }); return o; } },
  { k: 'especialidad', t: 'Especialidad (3° y 4°)', val: r => esNoAplica(r.especialidad) ? null : vEst(r.especialidad) },
  { k: 'genero', t: 'Género', val: r => vEst(r.genero) },
  { k: 'edad', t: 'Edad', val: r => r.edad ? r.edad + ' AÑOS' : SIN_INFO,
    orden: () => { const o = []; for (let e = CFG.edadMin; e <= CFG.edadMax; e++) o.push(e + ' AÑOS'); return o; } },
  { k: 'nacionalidad', t: 'Nacionalidad', val: r => esChileno(r) ? 'CHILENA' : vEst(r.nacionalidad), top: 8 },
  { k: 'extranjero', t: 'Chilenos y extranjeros', val: r => esChileno(r) ? 'CHILENOS' : 'EXTRANJEROS', orden: () => ['CHILENOS', 'EXTRANJEROS'] },
  { k: 'pais', t: 'País de nacimiento', val: r => vEst(r.pais), top: 8 },
  { k: 'religion', t: 'Religión', val: r => vEst(r.religion) },
  { k: 'etnia', t: 'Pueblo originario / etnia', val: r => vEst(r.etnia) },
  { k: 'atencionSalud', t: 'Sistema de salud', val: r => vEst(r.atencionSalud), orden: () => ['FONASA', 'ISAPRE', 'OTRO'] },
  { k: 'tramoFonasa', t: 'Tramo FONASA', val: r => r.atencionSalud === 'FONASA' ? (r.tramoFonasa ? 'TRAMO ' + r.tramoFonasa : SIN_INFO) : null,
    orden: () => ['TRAMO A', 'TRAMO B', 'TRAMO C', 'TRAMO D'] },
  { k: 'isapre', t: 'Isapre', val: r => r.atencionSalud === 'ISAPRE' ? vEst(r.isapre) : null },
  { k: 'cuidados', t: 'Cuidados especiales de salud', val: r => r.cuidadosEspeciales ? 'DECLARA' : 'NO DECLARA', orden: () => ['DECLARA', 'NO DECLARA'] },
  { k: 'medicamentos', t: 'Medicamentos contraindicados', val: r => r.medicamentosContraindicados ? 'DECLARA' : 'NO DECLARA', orden: () => ['DECLARA', 'NO DECLARA'] },
  { k: 'beneficioJunaeb', t: 'Beneficio JUNAEB', val: r => vEst(r.beneficioJunaeb), orden: () => ['SÍ', 'NO'] },
  { k: 'subsidioUnicoFamiliar', t: 'Subsidio Único Familiar', val: r => vEst(r.subsidioUnicoFamiliar), orden: () => ['SÍ', 'NO'] },
  { k: 'chileSolidario', t: 'Chile Solidario', val: r => vEst(r.chileSolidario), orden: () => ['SÍ', 'NO'] },
  { k: 'becaIndigena', t: 'Beca Indígena', val: r => vEst(r.becaIndigena), orden: () => ['SÍ', 'NO'] },
  { k: 'situacionEconomica', t: 'Situación económica', val: r => vEst(r.situacionEconomica), orden: () => ordenOpciones('situacionEconomica') },
  { k: 'tipoDomicilio', t: 'Tipo de domicilio', val: r => vEst(r.tipoDomicilio) },
  { k: 'personaConQuienVive', t: 'Vive con', val: r => vEst(r.personaConQuienVive) },
  { k: 'alumnoAntiguo', t: 'Alumnos nuevos y antiguos', val: r => r.alumnoAntiguo === 'SÍ' ? 'ANTIGUOS' : 'NUEVOS', orden: () => ['NUEVOS', 'ANTIGUOS'] },
  { k: 'procedenciaEscuela', t: 'Escuela de procedencia', val: r => vEst(r.procedenciaEscuela), top: 10 },
  { k: 'estado', t: 'Estado de la matrícula', val: r => r.estado || 'Pendiente', orden: () => CFG.estados }
];
const DIM = {}; DIMENSIONES.forEach(d => DIM[d.k] = d);

// Tarjetas de gráficos del tablero (en este orden)
const GRAFICOS = ['extranjero', 'nacionalidad', 'genero', 'edad', 'religion', 'etnia', 'especialidad', 'atencionSalud', 'tramoFonasa',
  'isapre', 'BENEFICIOS', 'situacionEconomica', 'tipoDomicilio', 'personaConQuienVive', 'alumnoAntiguo', 'procedenciaEscuela', 'cuidados', 'cursoLetra'];
const BENEFICIOS = ['beneficioJunaeb', 'subsidioUnicoFamiliar', 'chileSolidario', 'becaIndigena'];

const E = { dim: 'curso', val: '' };

// ---------------- Datos ----------------
/** Registros considerados según los filtros de la pestaña. */
function registrosEst() {
  const c = $('#est-curso').value, l = $('#est-letra').value, e = $('#est-estado').value;
  return S.registros.filter(r => {
    if (c && r.curso !== c) return false;
    if (l === '-' && r.letra) return false;
    if (l && l !== '-' && r.letra !== l) return false;
    if (e === '*') return true;
    if (!e) return r.estado !== 'Anulado';
    return r.estado === e;
  });
}

/** Agrupa: [{g, n, regs}] en el orden de la variable. */
function agrupar(regs, dimK) {
  const d = DIM[dimK], m = new Map();
  regs.forEach(r => {
    const g = d.val(r); if (g == null) return;
    if (!m.has(g)) m.set(g, []);
    m.get(g).push(r);
  });
  let grupos = Array.from(m, ([g, rs]) => ({ g: g, n: rs.length, regs: rs }));
  const fin = g => (g === SIN_INFO || g === 'OTROS' || g === 'OTRO' || g === 'OTRA' || g === 'NINGUNA') ? 1 : 0;
  if (d.orden) {
    const o = d.orden();
    grupos.sort((a, b) => { const ia = o.indexOf(a.g), ib = o.indexOf(b.g); return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib) || b.n - a.n; });
  } else grupos.sort((a, b) => fin(a.g) - fin(b.g) || b.n - a.n || (a.g > b.g ? 1 : -1));
  return grupos;
}

function pct(n, t) { return t ? Math.round(n / t * 1000) / 10 : 0; }
function fmtPct(n, t) { return String(pct(n, t)).replace('.', ',') + '%'; }

// ---------------- Tablero ----------------
function iniciarEstadisticas() {
  if (iniciarEstadisticas.listo) return;
  iniciarEstadisticas.listo = true;
  $('#est-curso').innerHTML = '<option value="">Todos los cursos</option>' + opciones(CAMPO.curso).map(o => '<option value="' + esc(o.v) + '">' + esc(o.t) + '</option>').join('');
  $('#est-letra').innerHTML = '<option value="">Todas las letras</option><option value="-">Sin letra</option>' + CFG.letras.map(l => '<option value="' + l + '">Letra ' + l + '</option>').join('');
  $('#est-estado').innerHTML = '<option value="">Todos menos anulados</option><option value="*">Todos los estados</option>' + CFG.estados.map(e => '<option>' + esc(e) + '</option>').join('');
  $('#rep-dim').innerHTML = DIMENSIONES.map(d => '<option value="' + d.k + '">' + esc(d.t) + '</option>').join('');
  ['#est-curso', '#est-letra', '#est-estado'].forEach(s => $(s).addEventListener('change', renderEstadisticas));
  $('#rep-dim').addEventListener('change', () => { E.dim = $('#rep-dim').value; E.val = ''; pintarSelectorGrupo(); });
  $('#rep-val').addEventListener('change', () => { E.val = $('#rep-val').value; infoReporte(); });
  $$('input[name="rep-tipo"]').forEach(x => x.addEventListener('change', infoReporte));
}

function renderEstadisticas() {
  if (!$('#t-estad') || $('#t-estad').classList.contains('oculto')) return;
  iniciarEstadisticas();
  const regs = registrosEst(), t = regs.length;
  $('#est-total').textContent = t + (t === 1 ? ' estudiante considerado' : ' estudiantes considerados');

  // Indicadores
  const cuenta = f => regs.filter(f).length;
  const kpis = [
    { t: 'Estudiantes', n: t, sub: 'según los filtros', dim: 'curso' },
    { t: 'Extranjeros', n: cuenta(r => !esChileno(r)), dim: 'extranjero', val: 'EXTRANJEROS' },
    { t: 'Pueblo originario', n: cuenta(r => r.etnia && claveOp(r.etnia) !== 'NINGUNA'), dim: 'etnia' },
    { t: 'Alumnos nuevos', n: cuenta(r => r.alumnoAntiguo !== 'SÍ'), dim: 'alumnoAntiguo', val: 'NUEVOS' },
    { t: 'FONASA', n: cuenta(r => r.atencionSalud === 'FONASA'), dim: 'atencionSalud', val: 'FONASA' },
    { t: 'Beneficio JUNAEB', n: cuenta(r => claveOp(r.beneficioJunaeb) === 'SI'), dim: 'beneficioJunaeb', val: 'SÍ' },
    { t: 'Cuidados de salud', n: cuenta(r => !!r.cuidadosEspeciales), dim: 'cuidados', val: 'DECLARA' }
  ];
  $('#est-kpis').innerHTML = kpis.map((k, i) =>
    '<button class="card kpi" onclick="irAReporte(\'' + k.dim + '\',\'' + esc(k.val || '') + '\')" title="Ver reporte">' +
    '<div class="k">' + esc(k.t) + '</div><div class="v">' + k.n + '</div>' +
    '<div class="s">' + (i === 0 ? esc(k.sub) : fmtPct(k.n, t) + ' del total') + '</div></button>').join('');

  // Gráficos
  $('#est-graficos').innerHTML = GRAFICOS.map(k => k === 'BENEFICIOS' ? tarjetaBeneficios(regs) : tarjetaDim(regs, k)).join('');
  pintarIconos($('#est-graficos'));
  pintarSelectorGrupo();
}

function filaBarra(label, n, base, max, onclick, titulo) {
  const w = max ? Math.max(n / max * 100, n ? 1.5 : 0) : 0;
  return '<div class="eb" ' + (onclick ? 'onclick="' + onclick + '" role="button" tabindex="0"' : '') + ' title="' + esc(titulo || (label + ': ' + n + ' (' + fmtPct(n, base) + ')')) + '">' +
    '<span class="eb-t">' + esc(label) + '</span>' +
    '<span class="eb-p"><span class="eb-b" style="width:' + w + '%"></span></span>' +
    '<span class="eb-n">' + n + '</span><span class="eb-pc">' + fmtPct(n, base) + '</span></div>';
}

function tarjetaDim(regs, k) {
  const d = DIM[k];
  let grupos = agrupar(regs, k);
  const base = grupos.reduce((s, g) => s + g.n, 0);
  let filas = grupos;
  if (d.top && grupos.length > d.top + 1) {
    const resto = grupos.slice(d.top);
    filas = grupos.slice(0, d.top).concat([{ g: 'OTROS (' + resto.length + ')', n: resto.reduce((s, g) => s + g.n, 0), otros: true }]);
  }
  const max = Math.max(0, ...filas.map(g => g.n));
  const nota = k === 'tramoFonasa' ? 'Solo estudiantes en FONASA' : k === 'isapre' ? 'Solo estudiantes en ISAPRE' : k === 'especialidad' ? 'Solo 3° y 4° Medio' : '';
  const cuerpo = filas.length
    ? filas.map(g => filaBarra(g.g, g.n, base, max, g.otros ? 'irAReporte(\'' + k + '\',\'\')' : 'irAReporte(\'' + k + '\',' + JSON.stringify(g.g).replace(/"/g, '&quot;') + ')')).join('')
    : '<div class="eb-vacio">Sin datos con los filtros actuales</div>';
  return '<div class="card est-card"><div class="est-cab"><h4>' + esc(d.t) + '</h4>' +
    '<button class="btn-ico" title="Imprimir resumen de ' + esc(d.t) + '" onclick="imprimirResumen(\'' + k + '\')"><span data-i="impresora"></span></button></div>' +
    (nota ? '<div class="est-nota">' + nota + ' · ' + base + ' estudiantes</div>' : '') + cuerpo + '</div>';
}

function tarjetaBeneficios(regs) {
  const t = regs.length;
  const datos = BENEFICIOS.map(k => ({ k: k, t: DIM[k].t, n: regs.filter(r => claveOp(r[k]) === 'SI').length }));
  const max = Math.max(0, ...datos.map(x => x.n));
  return '<div class="card est-card"><div class="est-cab"><h4>Beneficios</h4></div>' +
    '<div class="est-nota">Estudiantes que reciben cada beneficio (de ' + t + ')</div>' +
    datos.map(x => filaBarra(x.t, x.n, t, max, 'irAReporte(\'' + x.k + '\',\'SÍ\')')).join('') + '</div>';
}

// ---------------- Reportes ----------------
function irAReporte(dim, val) {
  E.dim = dim; E.val = val || '';
  $('#rep-dim').value = dim;
  pintarSelectorGrupo();
  if (val) $('input[name="rep-tipo"][value="nomina"]').checked = true;
  infoReporte();
  $('#reportes').scrollIntoView({ behavior: 'smooth', block: 'start' });
  $('#reportes').classList.add('destello'); setTimeout(() => $('#reportes').classList.remove('destello'), 1200);
}

function pintarSelectorGrupo() {
  const grupos = agrupar(registrosEst(), E.dim);
  if (E.val && !grupos.some(g => g.g === E.val)) E.val = '';
  $('#rep-val').innerHTML = '<option value="">Todos los grupos (' + grupos.length + ')</option>' +
    grupos.map(g => '<option value="' + esc(g.g) + '"' + (g.g === E.val ? ' selected' : '') + '>' + esc(g.g) + ' — ' + g.n + '</option>').join('');
  infoReporte();
}

function tipoReporte() { const x = $('input[name="rep-tipo"]:checked'); return x ? x.value : 'nomina'; }

function gruposReporte() {
  let grupos = agrupar(registrosEst(), E.dim);
  if (E.val) grupos = grupos.filter(g => g.g === E.val);
  return grupos;
}

function infoReporte() {
  const tipo = tipoReporte();
  $('#rep-grupo-campo').classList.toggle('oculto', tipo === 'general');
  $('#rep-dim-campo').classList.toggle('oculto', tipo === 'general');
  $('#rep-opc-nomina').classList.toggle('oculto', tipo !== 'nomina');
  let txt;
  if (tipo === 'general') txt = 'Informe con todas las variables para ' + registrosEst().length + ' estudiantes.';
  else {
    const g = gruposReporte(), n = g.reduce((s, x) => s + x.n, 0);
    txt = tipo === 'nomina'
      ? 'Se imprimirán ' + n + ' estudiante' + (n === 1 ? '' : 's') + ' en ' + g.length + ' grupo' + (g.length === 1 ? '' : 's') + '.'
      : 'Resumen de "' + DIM[E.dim].t + '" con ' + g.length + ' grupo' + (g.length === 1 ? '' : 's') + ' (' + n + ' estudiantes).';
  }
  $('#rep-info').textContent = txt;
}

function textoFiltrosEst() {
  const p = [];
  const c = $('#est-curso'), l = $('#est-letra'), e = $('#est-estado');
  p.push(c.value ? c.options[c.selectedIndex].text : 'Todos los cursos');
  if (l.value) p.push(l.options[l.selectedIndex].text);
  p.push(e.options[e.selectedIndex].text);
  return p.join(' · ');
}

/** Encabezado y estilos comunes de los reportes (colores del logo). */
function docReporte(titulo, subtitulo, cuerpo, horizontal) {
  const P = PALETA, hoy = new Date().toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + esc_(titulo) + '</title><style>'
    + '@page{size:letter ' + (horizontal ? 'landscape' : 'portrait') + ';margin:1.3cm 1.2cm;}'
    + 'body{font-family:Arial,Helvetica,sans-serif;color:' + P.texto + ';font-size:9.5pt;margin:0;}'
    + '*{-webkit-print-color-adjust:exact;print-color-adjust:exact;box-sizing:border-box;}'
    + '.cab{display:flex;align-items:center;gap:12px;padding-bottom:9px;border-bottom:2.6pt solid ' + P.azul + ';box-shadow:0 2.2pt 0 ' + P.amarillo + ';margin-bottom:14px;}'
    + '.cab img{width:50px;height:50px;} .t1{font-size:7.4pt;color:' + P.azul + ';letter-spacing:2px;font-weight:600;}'
    + '.t2{font-family:Georgia,serif;font-size:14pt;font-weight:bold;color:' + P.azulOsc + ';}'
    + '.der{margin-left:auto;text-align:right;max-width:55%;} .der b{display:block;font-family:Georgia,serif;font-size:14pt;color:' + P.azul + ';}'
    + '.der span{font-size:8.5pt;color:' + P.gris + ';}'
    + 'h2{font-size:10.5pt;color:' + P.azul + ';letter-spacing:1px;margin:16px 0 6px;padding-bottom:4px;border-bottom:1pt solid ' + P.linea + ';display:flex;justify-content:space-between;align-items:baseline;}'
    + 'h2 small{font-size:8.5pt;color:' + P.gris + ';letter-spacing:0;font-weight:normal;}'
    + 'h2 .num{display:inline-block;background:' + P.amarillo + ';color:' + P.azulOsc + ';border-radius:9px;padding:1px 8px;font-size:8.5pt;margin-right:6px;}'
    + 'table{width:100%;border-collapse:collapse;} thead{display:table-header-group;} tr{page-break-inside:avoid;}'
    + 'th{background:' + P.azul + ';color:#fff;font-size:7.6pt;text-align:left;padding:5px 6px;letter-spacing:.4px;}'
    + 'td{border-bottom:0.75pt solid ' + P.linea + ';padding:4.5px 6px;vertical-align:top;font-size:8.8pt;}'
    + 'tr:nth-child(even) td{background:' + P.azulSuave + ';} .c{text-align:center;} .r{text-align:right;} .nw{white-space:nowrap;} .firma{width:95px;}'
    + '.barra{height:9px;border-radius:0 4px 4px 0;background:' + P.azul + ';} .pista{background:#e6ebf5;border-radius:0 4px 4px 0;}'
    + '.salto{page-break-before:always;break-before:page;} .tot td{font-weight:bold;background:#fff !important;border-top:1.2pt solid ' + P.azul + ';}'
    + '.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:4px 0 6px;}'
    + '.kpi{border:0.75pt solid ' + P.linea + ';border-radius:5px;padding:7px 9px;} .kpi .k{font-size:7pt;color:' + P.gris + ';letter-spacing:.6px;text-transform:uppercase;font-weight:bold;}'
    + '.kpi .v{font-family:Georgia,serif;font-size:17pt;font-weight:bold;color:' + P.azulOsc + ';} .kpi .s{font-size:7.5pt;color:' + P.gris + ';}'
    + '.cols{column-count:2;column-gap:22px;} .bloque{break-inside:avoid;page-break-inside:avoid;margin-bottom:6px;}'
    + '.pie{margin-top:14px;padding-top:6px;border-top:0.75pt solid ' + P.amarillo + ';font-size:7.5pt;color:' + P.gris + ';display:flex;justify-content:space-between;}'
    + '</style></head><body>'
    + '<div class="cab"><img src="' + LOGO_URL + '"><div><div class="t1">LICEO BICENTENARIO POLITÉCNICO</div><div class="t2">Cesáreo Aguirre Goyenechea</div></div>'
    + '<div class="der"><b>' + esc_(titulo) + '</b><span>' + esc_(subtitulo) + '</span></div></div>'
    + cuerpo
    + '<div class="pie"><span>Pre-Matrícula ' + CFG.anio + ' · ' + esc_(textoFiltrosEst()) + '</span><span>Emitido el ' + hoy + (S.sesion ? ' por ' + esc_(S.sesion.nombre || S.sesion.usuario) : '') + '</span></div>'
    + '</body></html>';
}

function tablaResumen(grupos, base, conBarra) {
  const max = Math.max(0, ...grupos.map(g => g.n));
  return '<table><thead><tr><th>Grupo</th><th class="r" style="width:62px">Cantidad</th><th class="r" style="width:52px">%</th>' + (conBarra ? '<th style="width:38%"></th>' : '') + '</tr></thead><tbody>'
    + grupos.map(g => '<tr><td>' + esc_(g.g) + '</td><td class="r">' + g.n + '</td><td class="r">' + fmtPct(g.n, base) + '</td>'
      + (conBarra ? '<td style="vertical-align:middle"><div class="pista"><div class="barra" style="width:' + (max ? g.n / max * 100 : 0) + '%"></div></div></td>' : '') + '</tr>').join('')
    + '<tr class="tot"><td>Total</td><td class="r">' + base + '</td><td class="r">100%</td>' + (conBarra ? '<td></td>' : '') + '</tr></tbody></table>';
}

function ordenAlumnos(a, b) {
  const x = (a.curso || '') + (a.letra || '~') + sinTildes(a.apellidoPaterno + ' ' + a.apellidoMaterno + ' ' + a.nombres);
  const y = (b.curso || '') + (b.letra || '~') + sinTildes(b.apellidoPaterno + ' ' + b.apellidoMaterno + ' ' + b.nombres);
  return x > y ? 1 : x < y ? -1 : 0;
}

/** Columna extra que muestra el detalle de la variable agrupada (cuando aporta información). */
function columnaDetalle(dimK) {
  switch (dimK) {
    case 'cuidados': return { t: 'Cuidados especiales', v: r => r.cuidadosEspeciales };
    case 'medicamentos': return { t: 'Medicamentos contraindicados', v: r => r.medicamentosContraindicados };
    case 'extranjero': case 'nacionalidad': case 'pais': return { t: 'Nacionalidad / país', v: r => [r.nacionalidad, r.pais].filter(Boolean).join(' · ') };
    case 'atencionSalud': case 'tramoFonasa': case 'isapre': return { t: 'Salud', v: r => saludTexto(r) };
    case 'procedenciaEscuela': case 'alumnoAntiguo': return { t: 'Procedencia', v: r => r.procedenciaEscuela };
  }
  return null;
}

function imprimirReporte() {
  const tipo = tipoReporte();
  if (tipo === 'general') return imprimirInformeGeneral();
  if (tipo === 'resumen') return imprimirResumen(E.dim);
  const grupos = gruposReporte();
  if (!grupos.length) return toast('No hay estudiantes para imprimir con estos filtros.', 'err');
  const d = DIM[E.dim], porPagina = $('#rep-salto').checked, firma = $('#rep-firma').checked, det = columnaDetalle(E.dim);
  const total = grupos.reduce((s, g) => s + g.n, 0);
  const cuerpo = grupos.map((g, i) => {
    const regs = g.regs.slice().sort(ordenAlumnos);
    return '<div' + (porPagina && i ? ' class="salto"' : '') + '>'
      + '<h2><span><span class="num">' + g.n + '</span>' + esc_(d.t.toUpperCase()) + ': ' + esc_(g.g) + '</span><small>' + fmtPct(g.n, total) + ' del reporte</small></h2>'
      + '<table><thead><tr><th class="c" style="width:26px">#</th><th class="c" style="width:44px">N°</th><th>Estudiante</th><th>RUN</th><th>Curso</th>'
      + (det ? '<th>' + esc_(det.t) + '</th>' : '') + '<th>Apoderado titular</th><th>Teléfono</th>' + (firma ? '<th class="firma">Firma</th>' : '') + '</tr></thead><tbody>'
      + regs.map((r, j) => '<tr><td class="c">' + (j + 1) + '</td><td class="c">' + esc_(r.numRegistro) + '</td>'
        + '<td>' + esc_([r.apellidoPaterno, r.apellidoMaterno].join(' ') + ', ' + r.nombres) + '</td><td class="nw">' + esc_(r.run) + '</td>'
        + '<td class="nw"><b style="color:' + PALETA.azul + '">' + esc_(cursoTexto(r)) + '</b></td>'
        + (det ? '<td>' + esc_(det.v(r) || '—') + '</td>' : '')
        + '<td>' + esc_(r.nombreApoderadoTitular) + '</td><td class="nw">' + esc_(r.fonoApoderadoTitular) + '</td>' + (firma ? '<td></td>' : '') + '</tr>').join('')
      + '</tbody></table></div>';
  }).join('');
  const titulo = 'Nómina por ' + d.t.toLowerCase() + (E.val ? ': ' + E.val : '');
  imprimirHTML(docReporte(titulo, total + ' estudiantes · ' + grupos.length + ' grupo' + (grupos.length === 1 ? '' : 's'), cuerpo, true));
}

function imprimirResumen(dimK) {
  const d = DIM[dimK], grupos = agrupar(registrosEst(), dimK), base = grupos.reduce((s, g) => s + g.n, 0);
  if (!base) return toast('No hay datos para "' + d.t + '" con estos filtros.', 'err');
  const cuerpo = '<h2><span>' + esc_(d.t.toUpperCase()) + '</span><small>' + base + ' estudiantes</small></h2>' + tablaResumen(grupos, base, true);
  imprimirHTML(docReporte('Resumen: ' + d.t, textoFiltrosEst(), cuerpo, false));
}

function imprimirInformeGeneral() {
  const regs = registrosEst(), t = regs.length;
  if (!t) return toast('No hay estudiantes con estos filtros.', 'err');
  const c = f => regs.filter(f).length;
  const kp = [['Estudiantes', t, ''], ['Extranjeros', c(r => !esChileno(r))], ['Pueblo originario', c(r => r.etnia && claveOp(r.etnia) !== 'NINGUNA')],
    ['Alumnos nuevos', c(r => r.alumnoAntiguo !== 'SÍ')], ['FONASA', c(r => r.atencionSalud === 'FONASA')], ['Beneficio JUNAEB', c(r => claveOp(r.beneficioJunaeb) === 'SI')],
    ['Cuidados de salud', c(r => !!r.cuidadosEspeciales)], ['Matriculados', c(r => r.estado === 'Matriculado')]];
  let cuerpo = '<div class="kpis">' + kp.map(k => '<div class="kpi"><div class="k">' + k[0] + '</div><div class="v">' + k[1] + '</div><div class="s">' + (k[2] === '' ? 'total considerado' : fmtPct(k[1], t)) + '</div></div>').join('') + '</div>';
  const dims = ['curso', 'cursoLetra', 'especialidad', 'genero', 'edad', 'extranjero', 'nacionalidad', 'pais', 'religion', 'etnia', 'atencionSalud', 'tramoFonasa', 'isapre',
    'beneficioJunaeb', 'subsidioUnicoFamiliar', 'chileSolidario', 'becaIndigena', 'situacionEconomica', 'tipoDomicilio', 'personaConQuienVive', 'alumnoAntiguo', 'cuidados', 'medicamentos', 'estado'];
  cuerpo += '<div class="cols">' + dims.map(k => {
    let g = agrupar(regs, k); const base = g.reduce((s, x) => s + x.n, 0);
    if (k === 'cursoLetra') g = g.filter(x => x.n);
    return '<div class="bloque"><h2><span>' + esc_(DIM[k].t.toUpperCase()) + '</span><small>' + base + '</small></h2>' + (base ? tablaResumen(g, base, false) : '<p style="color:#888;font-size:8.5pt">Sin datos</p>') + '</div>';
  }).join('') + '</div>';
  const proc = agrupar(regs, 'procedenciaEscuela'), bp = proc.reduce((s, x) => s + x.n, 0);
  cuerpo += '<div class="salto"></div><h2><span>ESCUELA DE PROCEDENCIA</span><small>' + bp + '</small></h2>' + tablaResumen(proc, bp, true);
  imprimirHTML(docReporte('Informe estadístico ' + CFG.anio, textoFiltrosEst(), cuerpo, false));
}

/** CSV del reporte actual (nómina o resumen). */
function exportarReporte() {
  const tipo = tipoReporte();
  let filas, nombre;
  if (tipo === 'general') {
    const regs = registrosEst();
    filas = [['Variable', 'Grupo', 'Cantidad', '%']];
    DIMENSIONES.forEach(d => { const g = agrupar(regs, d.k), b = g.reduce((s, x) => s + x.n, 0); g.forEach(x => filas.push([d.t, x.g, x.n, fmtPct(x.n, b)])); });
    nombre = 'informe_estadistico_' + CFG.anio + '.csv';
  } else if (tipo === 'resumen') {
    const g = gruposReporte(), b = g.reduce((s, x) => s + x.n, 0);
    filas = [[DIM[E.dim].t, 'Cantidad', '%']].concat(g.map(x => [x.g, x.n, fmtPct(x.n, b)]));
    nombre = 'resumen_' + E.dim + '_' + CFG.anio + '.csv';
  } else {
    const det = columnaDetalle(E.dim);
    filas = [[DIM[E.dim].t, 'N°', 'Apellido paterno', 'Apellido materno', 'Nombres', 'RUN', 'Curso', 'Especialidad'].concat(det ? [det.t] : []).concat(['Apoderado titular', 'Teléfono', 'Correo apoderado', 'Estado', 'N° matrícula'])];
    gruposReporte().forEach(g => g.regs.slice().sort(ordenAlumnos).forEach(r => filas.push([g.g, r.numRegistro, r.apellidoPaterno, r.apellidoMaterno, r.nombres, r.run, cursoTexto(r), r.especialidad]
      .concat(det ? [det.v(r)] : []).concat([r.nombreApoderadoTitular, r.fonoApoderadoTitular, r.correoApoderadoTitular, r.estado, r.nroMatricula]))));
    nombre = 'nomina_' + E.dim + (E.val ? '_' + sinTildes(E.val).replace(/[^a-z0-9]+/g, '_') : '') + '_' + CFG.anio + '.csv';
  }
  if (filas.length < 2) return toast('No hay datos para exportar.', 'err');
  const csv = '﻿' + filas.map(f => f.map(v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"').join(';')).join('\r\n');
  descargarTexto(csv, nombre, 'text/csv;charset=utf-8');
}
