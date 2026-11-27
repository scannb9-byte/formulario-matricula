'use strict';
/* ============================================================
 *  Pre-Matrícula · lógica del cliente (sitio en GitHub Pages)
 *  Los datos viven en Google Sheets; Apps Script funciona como API (js/config.js).
 * ============================================================ */

// ---------- Íconos ----------
const IC = {
  doc:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
  lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  key:'<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.3-9.3M16 7l3 3M14 9l2 2"/>',
  salir:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  grafico:'<path d="M3 3v18h18"/><path d="M7 15h4M7 11h9M7 7h6"/>',
  lista:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  clip:'<path d="m21.4 11.1-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5"/>',
  escudo:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  ojo:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  izq:'<path d="m15 18-6-6 6-6"/>', der:'<path d="m9 18 6-6-6-6"/>',
  enviar:'<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  descargar:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  mas:'<path d="M12 5v14M5 12h14"/>',
  usuarios:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  lupa:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  refrescar:'<path d="M21 12a9 9 0 1 1-2.6-6.4L21 8"/><path d="M21 3v5h-5"/>',
  impresora:'<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  tabla:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
  editar:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  basura:'<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
  correo:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>',
  pdf:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>',
  filtro:'<path d="M22 3H2l8 9.46V19l4 2v-8.54z"/>',
  alerta:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>'
};
function icon(n){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(IC[n]||'')+'</svg>';}
function pintarIconos(root){(root||document).querySelectorAll('[data-i]').forEach(el=>{if(!el.dataset.ok){el.innerHTML=icon(el.dataset.i);el.dataset.ok='1';}});}

// ---------- Utilidades ----------
const $=(s,r)=>(r||document).querySelector(s);
const $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
const store={
  get(k,ses){try{return (ses?sessionStorage:localStorage).getItem(k);}catch(e){return null;}},
  set(k,v,ses){try{(ses?sessionStorage:localStorage).setItem(k,v);}catch(e){}},
  del(k,ses){try{(ses?sessionStorage:localStorage).removeItem(k);}catch(e){}}
};
const S={token:null,sesion:null,registros:[],stats:null,filtrados:[],orden:{k:'numRegistro',dir:-1},pagina:1,porPagina:25,urlPlanilla:'',sel:new Set()};

// Fecha de hoy en Chile (yyyy-mm-dd)
CFG.hoy=(function(){try{return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Santiago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}catch(e){return new Date().toISOString().slice(0,10);}})();
CFG.formularioAbierto=true;

// ---------- API (Apps Script) ----------
// Nombres de los parámetros de cada acción, en el mismo orden en que se llaman abajo.
const API_ARGS={
  ping:[],verificarRun:['run'],enviarFormulario:['datos'],iniciarSesion:['usuario','password'],cerrarSesion:['token'],sesionActual:['token'],
  cambiarMiPassword:['token','actual','nueva'],listarUsuarios:['token'],guardarUsuario:['token','usuario'],eliminarUsuario:['token','usuario'],
  obtenerRegistros:['token'],actualizarRegistro:['token','num','datos'],cambiarEstado:['token','num','estado','nroMatricula'],
  asignarCurso:['token','nums','letra'],eliminarRegistro:['token','num'],reenviarCorreo:['token','num']
};
function api(accion){
  const args=Array.prototype.slice.call(arguments,1),cuerpo={accion:accion};
  (API_ARGS[accion]||[]).forEach((k,i)=>cuerpo[k]=args[i]);
  // text/plain evita la consulta previa CORS (Apps Script no la responde)
  return fetch(API_URL,{method:'POST',body:JSON.stringify(cuerpo),headers:{'Content-Type':'text/plain;charset=utf-8'},redirect:'follow'})
    .catch(()=>{throw new Error('No se pudo conectar con el servidor. Revise su conexión a internet e intente nuevamente.');})
    .then(r=>{if(!r.ok)throw new Error('El servidor respondió con un error ('+r.status+'). Intente nuevamente.');return r.json();})
    .then(r=>{if(r&&r.sesionExpirada){sesionExpirada();throw new Error(r.mensaje);}return r;});
}
function cargando(on,txt){$('#cargando').classList.toggle('oculto',!on);$('#cargando-txt').textContent=txt||'Cargando…';}
function toast(msg,tipo){
  const t=document.createElement('div');t.className='toast '+(tipo||'');
  t.innerHTML='<span data-i="'+(tipo==='err'?'alerta':tipo==='ok'?'check':'info')+'"></span><div>'+esc(msg)+'</div>';
  pintarIconos(t);$('#toasts').appendChild(t);setTimeout(()=>t.remove(),tipo==='err'?7000:4200);
}
function errorRed(e){cargando(false);toast((e&&e.message)||'Error de conexión. Intente nuevamente.','err');}

// ---------- Vistas ----------
function mostrarVista(id){
  $$('.vista').forEach(v=>v.classList.toggle('oculto',v.id!==id));
  $('#menu-usuario').classList.add('oculto');
  window.scrollTo({top:0,behavior:'instant'});
}
function irInicio(){mostrarVista(S.token?'v-panel':'v-inicio');}
function irLogin(){if(S.token){mostrarVista('v-panel');return;}mostrarVista('v-login');setTimeout(()=>$('#lg-usuario').focus(),50);}
function irFormulario(){mostrarVista('v-form');}
function toggleMenu(ev){ev.stopPropagation();$('#menu-usuario').classList.toggle('oculto');}
document.addEventListener('click',()=>$('#menu-usuario').classList.add('oculto'));
function verPass(id){const i=document.getElementById(id);i.type=i.type==='password'?'text':'password';}

// ============================================================
//  MOTOR DE FORMULARIO (compartido por el formulario público y el editor)
// ============================================================
const CAMPOS=[];ESQUEMA.forEach(p=>p.secciones.forEach(s=>s.campos.forEach(c=>CAMPOS.push(c))));
const CAMPO={};CAMPOS.forEach(c=>CAMPO[c.key]=c);
function opciones(c){return (c.options||[]).map(o=>typeof o==='string'?{v:o,t:o}:o);}
function etiqueta(c,v){const o=opciones(c).filter(x=>x.v===v)[0];return o?o.t:v;}
function sumarAnios(iso,n){const d=new Date(iso+'T12:00:00');d.setFullYear(d.getFullYear()+n);return d.toISOString().slice(0,10);}

function normRut(v){
  // RUN (7-8 dígitos) o IPE / RUT provisorio escolar (9 dígitos, ej: 100844317-K)
  const s=String(v||'').toUpperCase().replace(/[^0-9K]/g,'');
  if(s.length<8||s.length>10)return null;
  const cuerpo=s.slice(0,-1),dv=s.slice(-1);
  if(!/^\d+$/.test(cuerpo))return null;
  let suma=0,m=2;for(let i=cuerpo.length-1;i>=0;i--){suma+=Number(cuerpo[i])*m;m=m===7?2:m+1;}
  const r=11-(suma%11);const d=r===11?'0':r===10?'K':String(r);
  return d===dv?Number(cuerpo)+'-'+dv:null;
}
function normFono(v){let d=String(v||'').replace(/\D/g,'');if(d.length===11&&d.indexOf('56')===0)d=d.slice(2);if(d.length===8)d='9'+d;if(d.length!==9)return null;return '+56 '+d[0]+' '+d.slice(1,5)+' '+d.slice(5);}
function emailOk(v){return /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(String(v||'').trim());}
function edadDe(iso){if(!/^\d{4}-\d{2}-\d{2}$/.test(iso||''))return null;const f=new Date(iso+'T12:00:00'),h=new Date();let e=h.getFullYear()-f.getFullYear();const m=h.getMonth()-f.getMonth();if(m<0||(m===0&&h.getDate()<f.getDate()))e--;return e;}
function mayus(s){return String(s==null?'':s).replace(/\s+/g,' ').trim().toUpperCase();}
function claveOp(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/\s+/g,' ').trim();}
function esNoAplica(v){return !v||claveOp(v)==='NO APLICA';}
function conEspecialidad(curso){return CFG.cursosConEspecialidad.indexOf(curso)>=0;}
/** Misma regla que campoVisible_ en Config.gs. */
function campoVisible(c,d){
  switch(c.cond){
    case 'fonasa':return d.atencionSalud==='FONASA';
    case 'isapre':return d.atencionSalud==='ISAPRE';
    case 'escuelaCalama':return d.curso==='1°'&&d.alumnoAntiguo!=='SÍ';
    case 'procedencia':return !(d.curso==='1°'&&d.alumnoAntiguo!=='SÍ');
    case 'electivo':return conEspecialidad(d.curso);
  }
  return true;
}
/** Misma regla que campoBloqueado_ en Config.gs: en 3° y 4° la religión solo se elige si la asignatura es RELIGIÓN. */
function campoBloqueado(c,d){
  if(c.bloq==='religion')return conEspecialidad(d.curso)&&d.asignaturaElectiva!=='RELIGIÓN';
  return false;
}

/** Devuelve '' si es válido o el mensaje de error. */
function validarValor(c,v,ctx){
  v=String(v==null?'':v).trim();
  if(c.key==='edad'||c.type==='checkbox')return '';
  if(c.especialidad&&!ctx.conEsp)return '';
  if(c.cond&&ctx.d&&!campoVisible(c,ctx.d))return '';
  if(c.bloq&&ctx.d&&campoBloqueado(c,ctx.d))return '';
  if(!v)return c.req?'Este campo es obligatorio':'';
  if(c.options&&!opciones(c).some(o=>claveOp(o.v)===claveOp(v)))return 'Seleccione una opción válida';
  if(c.nombre&&!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .\-]{2,80}$/.test(v))return 'Solo letras (mínimo 2)';
  switch(c.type){
    case 'rut':if(!normRut(v))return 'RUN inválido: revise el número y el dígito verificador';break;
    case 'email':if(!emailOk(v))return 'Ingrese un correo válido (ej: nombre@gmail.com)';break;
    case 'tel':if(!normFono(v))return 'Teléfono inválido: 9 dígitos (ej: 9 1234 5678)';break;
    case 'number':{const n=Number(v);if(!/^\d+$/.test(v)||(c.min!=null&&n<c.min)||(c.max!=null&&n>c.max))return 'Ingrese un número entre '+c.min+' y '+c.max;break;}
    case 'date':{
      if(!/^\d{4}-\d{2}-\d{2}$/.test(v))return 'Fecha inválida';
      if(c.nacimiento){
        if(v>CFG.hoy)return 'La fecha no puede ser futura';
        const e=edadDe(v);if(e<CFG.edadMin||e>CFG.edadMax)return 'La edad ('+e+' años) debe estar entre '+CFG.edadMin+' y '+CFG.edadMax;
      }
      break;}
  }
  if(c.key==='lugarQueOcupa'&&ctx.totalHijos&&Number(v)>Number(ctx.totalHijos))return 'No puede ser mayor que el total de hijos ('+ctx.totalHijos+')';
  return '';
}

function htmlCampo(c,pre){
  const id=pre+c.key,req=c.req?'<span class="req">*</span>':'';
  const ph=c.placeholder?' placeholder="'+esc(c.placeholder)+'"':'';
  const ro=c.readonly?' readonly tabindex="-1"':'';
  let ctrl;
  if(c.type==='checkbox'){
    return '<div class="campo campo-check'+(c.full?' full':'')+'" data-k="'+c.key+'"><label class="check destacado"><input type="checkbox" id="'+id+'" name="'+c.key+'"> '+esc(c.label)+'</label>'+
      '<span class="msg-error"></span>'+(c.help?'<span class="ayuda">'+esc(c.help)+'</span>':'')+'</div>';
  }
  if(c.type==='radio'){
    // Valor en un campo oculto (id/name del campo); los botones solo lo actualizan
    ctrl='<input type="hidden" id="'+id+'" name="'+c.key+'" data-radio="1"><div class="radios" role="radiogroup">'+
      opciones(c).map((o,i)=>'<label class="radio"><input type="radio" name="'+id+'__r" value="'+esc(o.v)+'" onchange="var h=document.getElementById(\''+id+'\');h.value=this.value;h.dispatchEvent(new Event(\'change\',{bubbles:true}))"><span>'+esc(o.t)+'</span></label>').join('')+'</div>';
  }else if(c.type==='select'){
    ctrl='<select class="control" id="'+id+'" name="'+c.key+'"><option value="">Seleccione…</option>'+opciones(c).map(o=>'<option value="'+esc(o.v)+'">'+esc(o.t)+'</option>').join('')+'</select>';
  }else if(c.type==='textarea'){
    ctrl='<textarea class="control" id="'+id+'" name="'+c.key+'" maxlength="500" autocapitalize="characters"'+ph+'></textarea>';
  }else{
    const tipo={email:'email',tel:'tel',date:'date',number:'number'}[c.type]||'text';
    let extra='';
    if(c.type==='tel')extra+=' inputmode="tel" maxlength="16"';
    if(c.type==='number')extra+=' inputmode="numeric"'+(c.min!=null?' min="'+c.min+'"':'')+(c.max!=null?' max="'+c.max+'"':'');
    if(c.type==='rut')extra+=' autocapitalize="characters" maxlength="12" spellcheck="false"';
    if(c.type==='email')extra+=' autocapitalize="none" spellcheck="false" maxlength="120"';
    if(c.type==='text')extra+=' maxlength="150" autocapitalize="characters"';
    if(c.nacimiento)extra+=' min="'+sumarAnios(CFG.hoy,-(CFG.edadMax+1))+'" max="'+sumarAnios(CFG.hoy,-CFG.edadMin)+'"';
    ctrl='<input class="control" id="'+id+'" name="'+c.key+'" type="'+tipo+'"'+extra+ph+ro+'>';
  }
  return '<div class="campo'+(c.full?' full':'')+'" data-k="'+c.key+'"><label for="'+id+'">'+esc(c.label)+req+'</label>'+ctrl+
    '<span class="msg-error"></span>'+(c.help?'<span class="ayuda">'+esc(c.help)+'</span>':'')+'</div>';
}
function htmlSeccion(s,pre){
  return '<div class="seccion"><div class="seccion-tit"><h3>'+esc(s.titulo)+'</h3>'+
    (s.copiar?'<label class="check"><input type="checkbox" class="copiar" id="'+pre+s.copiar.id+'"> '+esc(s.copiar.label)+'</label>':'')+
    '</div><div class="grid">'+s.campos.map(c=>htmlCampo(c,pre)).join('')+'</div></div>';
}

/** Controlador de un formulario renderizado con prefijo `pre` dentro de `raiz`. */
function Formulario(raiz,pre){
  const F=this;
  F.el=k=>document.getElementById(pre+k);
  F.get=k=>{const e=F.el(k);if(!e)return '';if(e.type==='checkbox')return e.checked?'SÍ':'NO';return String(e.value||'').trim();};
  F.set=(k,v)=>{const e=F.el(k);if(!e)return;
    if(e.type==='checkbox'){e.checked=claveOp(v)==='SI';return;}
    if(e.dataset.radio){const r=Array.from(raiz.querySelectorAll('input[name="'+e.id+'__r"]')).filter(x=>claveOp(x.value)===claveOp(v))[0];
      raiz.querySelectorAll('input[name="'+e.id+'__r"]').forEach(x=>x.checked=x===r);e.value=r?r.value:'';return;}
    if(e.tagName==='SELECT'&&v){ // acepta valores antiguos escritos de otra forma (ej: "Femenino" → "FEMENINO")
      const o=Array.from(e.options).filter(x=>x.value&&claveOp(x.value)===claveOp(v))[0];
      if(o)v=o.value;else{const n=document.createElement('option');n.value=v;n.textContent=v+' (valor anterior)';e.appendChild(n);}
    }
    e.value=v==null?'':v;};
  F.crudos=()=>{const d={};CAMPOS.forEach(c=>d[c.key]=F.get(c.key));return d;};
  F.ctx=()=>({conEsp:conEspecialidad(F.get('curso')),totalHijos:F.get('totalHijos'),d:F.crudos()});
  F.marcar=(k,msg)=>{const w=raiz.querySelector('.campo[data-k="'+k+'"]');if(!w)return;w.classList.toggle('error',!!msg);w.classList.toggle('ok',!msg&&!!F.get(k));w.querySelector('.msg-error').textContent=msg||'';};
  F.validar=keys=>{const ctx=F.ctx();let primero=null;
    keys.forEach(k=>{const c=CAMPO[k];if(!c)return;const m=validarValor(c,F.get(k),ctx);F.marcar(k,m);if(m&&!primero)primero=k;});
    return primero;};
  /** Datos listos para enviar: MAYÚSCULAS, valores por defecto y campos que no corresponden vacíos. */
  F.datos=()=>{const d={};
    CAMPOS.forEach(c=>{let v=F.get(c.key);if(c.type!=='email'&&c.type!=='checkbox')v=mayus(v);d[c.key]=v;});
    if(!conEspecialidad(d.curso))d.especialidad='NO APLICA';
    if(d.run&&normRut(d.run))d.run=normRut(d.run);
    if(!d.profesionPadre)d.profesionPadre='NO APLICA';
    if(!d.profesionMadre)d.profesionMadre='NO APLICA';
    CAMPOS.forEach(c=>{if(c.cond&&!campoVisible(c,d)&&!c.virtual)d[c.key]='';});
    CAMPOS.forEach(c=>{if(c.bloq&&campoBloqueado(c,d))d[c.key]=d.asignaturaElectiva==='EDUCACIÓN FÍSICA'?'NO APLICA':'';});
    if(d.alumnoAntiguo==='SÍ')d.procedenciaEscuela=CFG.liceoProcedencia;
    else if(campoVisible(CAMPO.escuelaCalama,d))d.procedenciaEscuela=d.escuelaCalama;
    return d;};
  F.cargar=d=>{
    CAMPOS.forEach(c=>{if(d[c.key]!==undefined)F.set(c.key,(c.especialidad&&esNoAplica(d[c.key]))?'':d[c.key]);});
    // Escuela de la lista (1° Medio, alumno nuevo) a partir de la procedencia guardada
    if(d.escuelaCalama===undefined&&d.procedenciaEscuela){const o=opciones(CAMPO.escuelaCalama).filter(x=>claveOp(x.v)===claveOp(d.procedenciaEscuela))[0];F.set('escuelaCalama',o?o.v:'');}
    F.actualizarEspecialidad();F.actualizarVisibles();};
  /** Muestra u oculta los campos condicionales (tramo FONASA, isapre, escuela de procedencia). */
  F.actualizarVisibles=()=>{
    const d=F.crudos();
    CAMPOS.forEach(c=>{if(!c.cond)return;const w=raiz.querySelector('.campo[data-k="'+c.key+'"]');if(!w)return;
      const vis=campoVisible(c,d);w.classList.toggle('oculto',!vis);if(!vis){w.classList.remove('error');w.querySelector('.msg-error').textContent='';}});
    // Religión: habilitada en 1° y 2°; en 3° y 4° solo si la asignatura es RELIGIÓN
    const rel=F.el('religion');
    if(rel){
      const bloq=campoBloqueado(CAMPO.religion,d),ph=rel.options[0];
      rel.disabled=bloq;rel.classList.toggle('fijo',bloq);
      if(bloq){rel.value='';F.marcar('religion','');ph.textContent=d.asignaturaElectiva==='EDUCACIÓN FÍSICA'?'NO APLICA (EDUCACIÓN FÍSICA)':'Primero elija la asignatura';}
      else ph.textContent='Seleccione…';
    }
    const p=F.el('procedenciaEscuela');
    if(p){
      const antiguo=d.alumnoAntiguo==='SÍ';
      if(antiguo){p.value=CFG.liceoProcedencia;F.marcar('procedenciaEscuela','');}
      else if(p.readOnly&&p.value===CFG.liceoProcedencia)p.value='';
      p.readOnly=antiguo;p.classList.toggle('fijo',antiguo);
    }
  };
  F.actualizarEspecialidad=()=>{
    const ok=conEspecialidad(F.get('curso'));const w=raiz.querySelector('.campo[data-k="especialidad"]');
    if(w)w.classList.toggle('oculto',!ok);
    let aviso=raiz.querySelector('.aviso-esp');
    if(!aviso&&w){aviso=document.createElement('div');aviso.className='campo aviso-esp';aviso.innerHTML='<label>Especialidad</label><div class="control" style="display:flex;align-items:center;background:#f6f8fb;color:#3c4659">NO APLICA</div><span class="ayuda">1° y 2° Medio no eligen especialidad.</span>';w.parentNode.insertBefore(aviso,w.nextSibling);}
    if(aviso)aviso.classList.toggle('oculto',ok||!F.get('curso'));
    if(!ok)F.set('especialidad','');
  };
  F.actualizarEdad=()=>{const e=edadDe(F.get('fechaNacimiento'));F.set('edad',e==null||e<0?'':e);};

  // --- Comportamientos ---
  raiz.addEventListener('change',ev=>{
    const k=ev.target.name;if(!k||!CAMPO[k])return;
    if(k==='curso'){F.actualizarEspecialidad();F.marcar('especialidad','');}
    if(k==='curso'||k==='atencionSalud'||k==='alumnoAntiguo'||k==='asignaturaElectiva')F.actualizarVisibles();
    if(CAMPO[k].type==='checkbox')return;
    if(k==='fechaNacimiento')F.actualizarEdad();
    if(raiz.querySelector('.campo[data-k="'+k+'"]').classList.contains('error')||ev.target.value)F.marcar(k,validarValor(CAMPO[k],F.get(k),F.ctx()));
  });
  raiz.addEventListener('focusout',ev=>{
    const k=ev.target.name,c=CAMPO[k];if(!c)return;let v=F.get(k);
    if(v){
      if(c.type==='rut'&&normRut(v))F.set(k,normRut(v));
      if(c.type==='tel'&&normFono(v))F.set(k,normFono(v));
      if(c.type==='email')F.set(k,v.toLowerCase());
      if(c.type==='text'||c.type==='textarea')F.set(k,mayus(v));
    }
    if(F.get(k)||c.req&&raiz.querySelector('.campo[data-k="'+k+'"]').classList.contains('error'))F.marcar(k,validarValor(c,F.get(k),F.ctx()));
  });
  raiz.addEventListener('input',ev=>{
    const c=CAMPO[ev.target.name];if(!c)return;
    if(c.type==='rut')ev.target.value=ev.target.value.toUpperCase().replace(/[^0-9K\-.]/g,'');
    if(c.type==='tel')ev.target.value=ev.target.value.replace(/[^0-9+ ]/g,'');
    const w=raiz.querySelector('.campo[data-k="'+c.key+'"]');
    if(w&&w.classList.contains('error')){const m=validarValor(c,F.get(c.key),F.ctx());if(!m)F.marcar(c.key,'');}
    if(F.sincronizar)F.sincronizar();
  });
  // Casillas "usar datos del apoderado titular" (suplente y contacto de emergencia)
  const copias=[];
  ESQUEMA.forEach(p=>p.secciones.forEach(s=>{if(!s.copiar)return;const cb=document.getElementById(pre+s.copiar.id);if(cb)copias.push({cb:cb,pares:s.copiar.pares});}));
  F.sincronizar=()=>copias.forEach(x=>{if(!x.cb.checked)return;x.pares.forEach(p=>{F.set(p[1],mayusSi(p[1],F.get(p[0])));if(F.get(p[1]))F.marcar(p[1],'');});});
  function mayusSi(k,v){return CAMPO[k]&&CAMPO[k].type==='text'?mayus(v):v;}
  copias.forEach(x=>x.cb.addEventListener('change',()=>{x.pares.forEach(p=>{const e=F.el(p[1]);e.readOnly=x.cb.checked;e.classList.toggle('fijo',x.cb.checked);});F.sincronizar();}));
}

// ============================================================
//  FORMULARIO PÚBLICO (asistente por pasos)
// ============================================================
let FP=null,pasoActual=0;
const N_PASOS=ESQUEMA.length+1; // + revisión

function construirFormularioPublico(){
  const cont=$('#pasos');let html='';
  ESQUEMA.forEach((p,i)=>{html+='<div class="paso oculto" data-paso="'+i+'">'+p.secciones.map(s=>htmlSeccion(s,'f-')).join('')+'</div>';});
  html+='<div class="paso oculto" data-paso="'+ESQUEMA.length+'"><div class="seccion"><div class="seccion-tit"><h3>Revise y confirme</h3></div>'+
    '<div class="aviso info" style="margin-bottom:16px"><span data-i="info"></span><div>Revise que los datos estén correctos. Al enviar, llegará un correo de confirmación al apoderado titular.</div></div>'+
    '<div class="resumen" id="resumen"></div>'+
    '<label class="check" style="margin-top:20px"><input type="checkbox" id="declaro"> Declaro que la información entregada es verídica y autorizo su uso para el proceso de matrícula del liceo.</label>'+
    '<div class="campo" data-k="declaro"><span class="msg-error" id="declaro-err">Debe aceptar la declaración para enviar.</span></div></div></div>';
  cont.innerHTML=html;
  // Stepper
  const pasos=ESQUEMA.map(p=>p.paso).concat(['Revisión']);
  $('#stepper').innerHTML=pasos.map((t,i)=>'<button type="button" class="step" data-s="'+i+'" onclick="irPaso('+i+',true)"><div class="bar"></div><div class="lbl"><span class="num">'+(i+1)+'</span>'+esc(t)+'</div></button>').join('');
  FP=new Formulario($('#form-matricula'),'f-');
  // RUN: avisa apenas se escribe si ya tiene pre-matrícula (sin esperar al último paso)
  FP.el('run').addEventListener('change',()=>{if(normRut(FP.get('run')))verificarRunServidor();});
  $('#form-matricula').addEventListener('submit',enviarFormulario);
  $('#form-matricula').addEventListener('input',guardarBorrador);
  $('#form-matricula').addEventListener('change',guardarBorrador);
  pintarIconos(cont);
  nuevoFormulario(true);
}

function valoresPorDefecto(){
  CAMPOS.forEach(c=>FP.set(c.key,c.def||''));
  FP.set('fechaMatricula',CFG.hoy);
  $$('#form-matricula .campo').forEach(w=>{w.classList.remove('error','ok');});
  $$('#form-matricula input.copiar').forEach(cp=>{cp.checked=false;cp.dispatchEvent(new Event('change'));});
  const dc=$('#declaro');if(dc)dc.checked=false;
  FP.actualizarEspecialidad();FP.actualizarVisibles();
}

function nuevoFormulario(inicial){
  valoresPorDefecto();
  let borrador=null;try{borrador=JSON.parse(store.get('pm_borrador',true)||'null');}catch(e){}
  if(inicial&&borrador&&borrador.datos){
    FP.cargar(borrador.datos);FP.set('fechaMatricula',CFG.hoy);FP.actualizarEdad();
    irPaso(Math.min(borrador.paso||0,ESQUEMA.length-1));
    $('#guardado').textContent='Se recuperó la información que había ingresado.';
  }else{
    store.del('pm_borrador',true);irPaso(0);$('#guardado').textContent='';
  }
  if(!inicial)mostrarVista('v-form');
}

let tBorrador=null;
function guardarBorrador(){
  clearTimeout(tBorrador);
  tBorrador=setTimeout(()=>{store.set('pm_borrador',JSON.stringify({datos:FP.datos(),paso:pasoActual}),true);$('#guardado').textContent='Avance guardado en este navegador';},500);
}

function camposDelPaso(i){const ks=[];if(ESQUEMA[i])ESQUEMA[i].secciones.forEach(s=>s.campos.forEach(c=>ks.push(c.key)));return ks;}

function irPaso(i,desdeStepper){
  if(desdeStepper&&i>pasoActual){ // no saltar pasos sin validar
    for(let k=pasoActual;k<i;k++){const e=FP.validar(camposDelPaso(k));if(e){mostrarPaso(k);enfocar(e);toast('Complete los campos obligatorios de este paso.','err');return;}
      const rc=RUN_CACHE[normRut(FP.get('run'))];if(camposDelPaso(k).indexOf('run')>=0&&rc&&rc.existe){mostrarPaso(k);marcarRun(rc);enfocar('run');return;}}
  }
  mostrarPaso(i);
}
function mostrarPaso(i){
  pasoActual=i;
  $$('#pasos .paso').forEach(p=>p.classList.toggle('oculto',Number(p.dataset.paso)!==i));
  $$('#stepper .step').forEach(s=>{const n=Number(s.dataset.s);s.classList.toggle('activo',n===i);s.classList.toggle('hecho',n<i);});
  const titulo=i<ESQUEMA.length?ESQUEMA[i].paso:'Revisión';
  $('#paso-movil').innerHTML='Paso <b>'+(i+1)+'</b> de '+N_PASOS+' · <b>'+esc(titulo)+'</b>';
  $('#progreso').style.width=((i+1)/N_PASOS*100)+'%';
  $('#btn-ant').style.visibility=i===0?'hidden':'visible';
  $('#btn-sig').classList.toggle('oculto',i===ESQUEMA.length);
  $('#btn-enviar').classList.toggle('oculto',i!==ESQUEMA.length);
  if(i===ESQUEMA.length)construirResumen();
  const top=$('#v-form .form-wrap').getBoundingClientRect().top+window.scrollY-80;
  if(window.scrollY>top)window.scrollTo({top:top,behavior:'smooth'});
}
function enfocar(k){const e=FP.el(k);if(e){e.focus({preventScroll:true});e.scrollIntoView({behavior:'smooth',block:'center'});}}
// ---------- Verificación inmediata en el servidor (RUN ya registrado) ----------
const RUN_CACHE={};   // run normalizado → {existe, mensaje}
function verificarRunServidor(){
  const run=normRut(FP.get('run'));
  if(!run)return Promise.resolve(true);                    // el formato ya lo valida el navegador
  if(RUN_CACHE[run])return Promise.resolve(marcarRun(RUN_CACHE[run]));
  return api('verificarRun',run).then(r=>{
    if(!r||!r.ok)return true;                              // si el servidor no responde bien, se revisa al enviar
    RUN_CACHE[run]={existe:!!r.existe,mensaje:r.mensaje||''};
    return marcarRun(RUN_CACHE[run]);
  }).catch(()=>true);                                      // sin conexión: no bloquea, se revisa al enviar
}
function marcarRun(x){
  if(x.existe){FP.marcar('run','Este RUN ya tiene una pre-matrícula');toast(x.mensaje||'Este RUN ya tiene una pre-matrícula registrada.','err');return false;}
  return true;
}
let validandoPaso=false;
function pasoSiguiente(){
  if(validandoPaso)return;
  const e=FP.validar(camposDelPaso(pasoActual));
  if(e){enfocar(e);toast('Revise los campos marcados en rojo.','err');return;}
  const conRun=camposDelPaso(pasoActual).indexOf('run')>=0;
  if(!conRun){mostrarPaso(pasoActual+1);guardarBorrador();return;}
  const b=$('#btn-sig'),txt=b.innerHTML;
  validandoPaso=true;b.disabled=true;b.innerHTML='Verificando RUN…';
  verificarRunServidor().then(ok=>{
    validandoPaso=false;b.disabled=false;b.innerHTML=txt;
    if(!ok){enfocar('run');return;}
    mostrarPaso(pasoActual+1);guardarBorrador();
  });
}
function pasoAnterior(){if(pasoActual>0)mostrarPaso(pasoActual-1);}

function htmlResumen(d,conEditar){
  return ESQUEMA.map((p,i)=>p.secciones.map(s=>{
    const filas=s.campos.filter(c=>!c.virtual&&(!c.cond||campoVisible(c,d))).map(c=>{
      let v=d[c.key];if(c.especialidad&&!conEspecialidad(d.curso))v='NO APLICA';
      if(c.options)v=etiqueta(c,v);if(c.type==='date')v=fechaCL(v);
      return '<dt>'+esc(c.label)+'</dt><dd>'+(v?esc(v):'<span style="color:#98a2b3;font-weight:400">—</span>')+'</dd>';
    }).join('');
    return '<div class="bloque"><h4>'+esc(s.titulo)+(conEditar?'<button type="button" class="btn btn-ghost btn-sm" onclick="mostrarPaso('+i+')"><span data-i="editar"></span>Editar</button>':'')+'</h4><dl>'+filas+'</dl></div>';
  }).join('')).join('');
}
function fechaCL(v){const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(v||'');return m?m[3]+'-'+m[2]+'-'+m[1]:(v||'');}
function construirResumen(){$('#resumen').innerHTML=htmlResumen(FP.datos(),true);pintarIconos($('#resumen'));}

function enviarFormulario(ev){
  ev.preventDefault();
  for(let i=0;i<ESQUEMA.length;i++){const e=FP.validar(camposDelPaso(i));if(e){mostrarPaso(i);enfocar(e);toast('Hay campos pendientes en el paso "'+ESQUEMA[i].paso+'".','err');return;}}
  const dw=$('.campo[data-k="declaro"]');
  if(!$('#declaro').checked){dw.classList.add('error');return;}dw.classList.remove('error');
  const datos=FP.datos();datos.website=$('#website').value;
  $('#btn-enviar').disabled=true;cargando(true,'Enviando pre-matrícula…');
  api('enviarFormulario',datos).then(r=>{
    cargando(false);$('#btn-enviar').disabled=false;
    if(!r.ok){
      if(r.errores){
        Object.keys(r.errores).forEach(k=>FP.marcar(k,r.errores[k]));
        for(let i=0;i<ESQUEMA.length;i++){const k=camposDelPaso(i).filter(x=>r.errores[x])[0];if(k){mostrarPaso(i);enfocar(k);break;}}
      }
      toast(r.mensaje||'No se pudo enviar.','err');return;
    }
    store.del('pm_borrador',true);
    $('#ex-num').textContent=r.numRegistro;
    $('#ex-nombre').textContent=r.nombre;
    const ae=$('#ex-email');
    if(r.emailEnviado){ae.className='aviso ok';ae.innerHTML='<span data-i="correo"></span><div>Enviamos la confirmación a <b>'+esc(r.correo)+'</b>. Revise también la carpeta de spam.</div>';}
    else{ae.className='aviso warn';ae.innerHTML='<span data-i="alerta"></span><div>Su pre-matrícula quedó registrada correctamente, pero el correo de confirmación no pudo enviarse ahora. El liceo reintentará el envío. Anote su N° de pre-matrícula.</div>';}
    pintarIconos(ae);
    mostrarVista('v-exito');
  }).catch(e=>{$('#btn-enviar').disabled=false;errorRed(e);});
}

// ---------- Archivos / impresión ----------
function descargarTexto(texto,nombre,mime){
  const url=URL.createObjectURL(new Blob([texto],{type:mime}));
  const a=document.createElement('a');a.href=url;a.download=nombre;a.target='_blank';document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),120000);
}
function imprimirHTML(html){
  const viejo=document.getElementById('frame-imp');if(viejo)viejo.remove();
  const fr=document.createElement('iframe');fr.id='frame-imp';
  fr.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
  document.body.appendChild(fr);
  const d=fr.contentWindow.document;d.open();d.write(html);d.close();
  const imprimir=()=>{try{fr.contentWindow.focus();fr.contentWindow.print();}catch(e){const w=window.open('','_blank');if(w){w.document.write(html);w.document.close();setTimeout(()=>w.print(),600);}}};
  const imgs=Array.from(d.images).filter(i=>!i.complete);
  if(!imgs.length)setTimeout(imprimir,250);
  else{let n=imgs.length;imgs.forEach(i=>i.onload=i.onerror=()=>{if(--n===0)setTimeout(imprimir,150);});}
}

// ============================================================
//  SESIÓN
// ============================================================
function login(ev){
  ev.preventDefault();
  const u=$('#lg-usuario').value.trim(),p=$('#lg-pass').value;
  const err=$('#lg-error');err.classList.add('oculto');
  if(!u||!p){err.textContent='Ingrese usuario y contraseña.';err.classList.remove('oculto');return;}
  cargando(true,'Verificando…');
  api('iniciarSesion',u,p).then(r=>{
    cargando(false);
    if(!r.ok){err.textContent=r.mensaje;err.classList.remove('oculto');return;}
    $('#lg-pass').value='';
    S.token=r.token;store.set('pm_token',r.token,true);
    entrarPanel(r.sesion);
  }).catch(errorRed);
}
function entrarPanel(ses){
  S.sesion=ses;
  $('#acciones-publicas').classList.add('oculto');$('#acciones-privadas').classList.remove('oculto');
  $('#chip-nombre').textContent=ses.nombre;$('#chip-rol').textContent=ses.rolNombre;
  $('#chip-av').textContent=(ses.nombre||ses.usuario).split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase();
  $('#tab-usuarios').classList.toggle('oculto',!ses.permisos.usuarios);
  mostrarVista('v-panel');
  if(ses.debeCambiar){modalPassword(true);return;}
  cargarPanel();
}
function logout(){
  api('cerrarSesion',S.token).catch(()=>{});
  salirLocal();toast('Sesión cerrada.','ok');
}
function salirLocal(){
  S.token=null;S.sesion=null;S.registros=[];S.sel.clear();store.del('pm_token',true);
  $('#acciones-publicas').classList.remove('oculto');$('#acciones-privadas').classList.add('oculto');
  cerrarModal(true);mostrarVista('v-inicio');
}
function sesionExpirada(){salirLocal();toast('Su sesión expiró. Ingrese nuevamente.','err');irLogin();}

// ============================================================
//  MODALES
// ============================================================
let modalFijo=false;
function abrirModal(o){
  modalFijo=!!o.fijo;
  $('#modal-raiz').innerHTML='<div class="modal-fondo" onclick="if(event.target===this)cerrarModal()"><div class="modal'+(o.ancho?' ancho':'')+'" role="dialog" aria-modal="true">'+
    '<div class="modal-cab"><h3>'+o.titulo+'</h3>'+(o.fijo?'':'<button class="btn-ico" onclick="cerrarModal()" aria-label="Cerrar"><span data-i="x"></span></button>')+'</div>'+
    '<div class="modal-cuerpo">'+o.cuerpo+'</div>'+(o.pie?'<div class="modal-pie">'+o.pie+'</div>':'')+'</div></div>';
  document.body.style.overflow='hidden';pintarIconos($('#modal-raiz'));
  return $('#modal-raiz .modal');
}
function cerrarModal(forzar){if(modalFijo&&!forzar)return;$('#modal-raiz').innerHTML='';document.body.style.overflow='';modalFijo=false;}
document.addEventListener('keydown',e=>{if(e.key==='Escape')cerrarModal();});
function confirmar(titulo,texto,botonTxt,peligro){
  return new Promise(res=>{
    abrirModal({titulo:esc(titulo),cuerpo:'<p>'+texto+'</p>',pie:'<button class="btn btn-sec" id="cf-no">Cancelar</button><button class="btn '+(peligro?'btn-peligro':'btn-pri')+'" id="cf-si">'+esc(botonTxt)+'</button>'});
    $('#cf-no').onclick=()=>{cerrarModal();res(false);};$('#cf-si').onclick=()=>{cerrarModal();res(true);};
  });
}

function modalPassword(forzado){
  abrirModal({titulo:forzado?'Cree su nueva contraseña':'Cambiar contraseña',fijo:forzado,
    cuerpo:(forzado?'<div class="aviso warn" style="margin-bottom:16px"><span data-i="key"></span><div>Por seguridad, debe cambiar la contraseña asignada antes de continuar.</div></div>':'')+
      '<div class="campo" style="margin-bottom:12px"><label>Contraseña actual</label><input class="control" type="password" id="pw-a" autocomplete="current-password"></div>'+
      '<div class="campo" style="margin-bottom:12px"><label>Nueva contraseña</label><input class="control" type="password" id="pw-n" autocomplete="new-password"><span class="ayuda">Mínimo 8 caracteres, con letras y números.</span></div>'+
      '<div class="campo"><label>Repita la nueva contraseña</label><input class="control" type="password" id="pw-r" autocomplete="new-password"></div>'+
      '<div class="aviso err oculto" id="pw-err" style="margin-top:14px"></div>',
    pie:(forzado?'<button class="btn btn-sec" onclick="logout()">Cerrar sesión</button>':'<button class="btn btn-sec" onclick="cerrarModal()">Cancelar</button>')+'<button class="btn btn-pri" id="pw-ok"><span data-i="check"></span>Guardar</button>'});
  pintarIconos($('#modal-raiz'));
  $('#pw-ok').onclick=()=>{
    const a=$('#pw-a').value,n=$('#pw-n').value,r=$('#pw-r').value,er=$('#pw-err');
    const fallo=m=>{er.textContent=m;er.classList.remove('oculto');};
    if(!a||!n)return fallo('Complete todos los campos.');
    if(n.length<8||!/[A-Za-z]/.test(n)||!/\d/.test(n))return fallo('La nueva contraseña debe tener al menos 8 caracteres, con letras y números.');
    if(n!==r)return fallo('Las contraseñas nuevas no coinciden.');
    cargando(true,'Guardando…');
    api('cambiarMiPassword',S.token,a,n).then(res=>{
      cargando(false);if(!res.ok)return fallo(res.mensaje);
      S.sesion.debeCambiar=false;cerrarModal(true);toast('Contraseña actualizada.','ok');if(forzado)cargarPanel();
    }).catch(errorRed);
  };
}

// ============================================================
//  PANEL · REGISTROS
// ============================================================
function cambiarTab(btn){
  $$('#tabs .tab').forEach(t=>t.classList.toggle('activo',t===btn));
  $$('.tab-pane').forEach(p=>p.classList.toggle('oculto',p.id!==btn.dataset.tab));
  if(btn.dataset.tab==='t-usuarios')cargarUsuarios();
  if(btn.dataset.tab==='t-estad')renderEstadisticas();
}
function puede(p){return S.sesion&&S.sesion.permisos&&S.sesion.permisos[p];}

/** Agrega campos calculados que usa la tabla. */
function enriquecer(r){
  r.nombre=[r.apellidoPaterno,r.apellidoMaterno].join(' ')+', '+r.nombres;
  r.apoderado=r.nombreApoderadoTitular;r.correo=r.correoApoderadoTitular;r.fono=r.fonoApoderadoTitular;
  if(!r.estado)r.estado='Pendiente';
  r.cursoLetra=(r.curso||'')+(r.letra||'');
  return r;
}
function desdeFila(columnas,f){const o={};columnas.forEach((k,i)=>o[k]=f[i]==null?'':String(f[i]));return enriquecer(o);}

function cargarPanel(){
  cargando(true,'Cargando registros…');
  api('obtenerRegistros',S.token).then(r=>{
    cargando(false);if(!r.ok)return toast(r.mensaje,'err');
    COLUMNAS_REG=r.columnas;S.registros=r.filas.map(f=>desdeFila(r.columnas,f));S.urlPlanilla=r.urlPlanilla;
    const vivos=new Set(S.registros.map(x=>x.numRegistro));S.sel.forEach(n=>{if(!vivos.has(n))S.sel.delete(n);});
    const bp=$('#btn-planilla');bp.classList.toggle('oculto',!r.urlPlanilla);if(r.urlPlanilla)bp.href=r.urlPlanilla;
    $('#panel-sub').textContent='Gestión de fichas '+CFG.anio+' · actualizado '+new Date().toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'});
    calcularStats();filtrar(true);avisoVersion();
  }).catch(errorRed);
}
function calcularStats(){
  const hoy=CFG.hoy.split('-').reverse().join('/');
  const s={total:S.registros.length,hoy:0,porCurso:{},porCursoLetra:{},porEspecialidad:{},porEstado:{},emailPendiente:0,sinLetra:0};
  S.registros.forEach(r=>{
    if(r.timestamp.indexOf(hoy)===0)s.hoy++;
    s.porCurso[r.curso||'—']=(s.porCurso[r.curso||'—']||0)+1;
    if(r.letra){const k=r.curso+'|'+r.letra;s.porCursoLetra[k]=(s.porCursoLetra[k]||0)+1;}
    else if(r.estado!=='Retirado')s.sinLetra++;
    if(!esNoAplica(r.especialidad))s.porEspecialidad[r.especialidad]=(s.porEspecialidad[r.especialidad]||0)+1;
    s.porEstado[r.estado]=(s.porEstado[r.estado]||0)+1;
    if(r.emailEnviado!=='Sí')s.emailPendiente++;
  });
  S.stats=s;pintarStats();
  if(typeof renderEstadisticas==='function')renderEstadisticas();
}
function pintarStats(){
  const s=S.stats,e=s.porEstado||{};
  const tarjetas=[['Total pre-matrículas',s.total,'azul'],['Recibidas hoy',s.hoy,'oro'],['Pendientes',e.Pendiente||0,'gris'],['Matriculados',e.Matriculado||0,'verde'],['Sin letra asignada',s.sinLetra,'gris'],['Correos pendientes',s.emailPendiente,'rojo']];
  $('#stats').innerHTML=tarjetas.map(t=>'<div class="card stat '+t[2]+'"><div class="k">'+t[0]+'</div><div class="v">'+t[1]+'</div></div>').join('');
  const barras=(obj,orden,etq,clic)=>{const ks=(orden||Object.keys(obj)).filter(k=>obj[k]);const max=Math.max(1,...ks.map(k=>obj[k]));
    return ks.length?ks.map(k=>'<div class="barra-fila'+(clic?' clic':'')+'"'+(clic?' onclick="'+clic(k)+'" title="Ver estos registros"':'')+'><span>'+esc(etq?etq(k):k)+'</span><div class="pista"><div class="rel" style="width:'+(obj[k]/max*100)+'%"></div></div><span class="num">'+obj[k]+'</span></div>').join(''):'<div class="sub" style="color:var(--muted)">Sin datos</div>';};
  const cursos=opciones(CAMPO.curso).map(o=>o.v);
  $('#dist-curso').innerHTML=barras(s.porCurso,cursos,k=>etiqueta(CAMPO.curso,k),k=>"filtroRapido('"+k+"','')");
  const ordenLetra=[];cursos.forEach(c=>CFG.letras.forEach(l=>ordenLetra.push(c+'|'+l)));
  $('#dist-letra').innerHTML=Object.keys(s.porCursoLetra).length?barras(s.porCursoLetra,ordenLetra,k=>{const p=k.split('|');return etiqueta(CAMPO.curso,p[0])+' '+p[1];},k=>{const p=k.split('|');return "filtroRapido('"+p[0]+"','"+p[1]+"')";})
    :'<div class="sub" style="color:var(--muted);font-size:14px">Aún no se asignan letras. Use la columna <b>Curso</b> de la tabla o seleccione varios registros y presione <b>Asignar letra</b>.</div>';
  $('#dist-esp').innerHTML=barras(s.porEspecialidad,null);
}
function filtroRapido(curso,letra){
  $('#flt-curso').value=curso;$('#flt-letra').value=letra;$('#flt-buscar').value='';$('#flt-esp').value='';$('#flt-estado').value='';
  filtrar();$('.toolbar').scrollIntoView({behavior:'smooth',block:'start'});
}
function llenarFiltros(){
  $('#flt-curso').innerHTML='<option value="">Todos los cursos</option>'+opciones(CAMPO.curso).map(o=>'<option value="'+esc(o.v)+'">'+esc(o.t)+'</option>').join('');
  $('#flt-letra').innerHTML='<option value="">Todas las letras</option><option value="-">Sin letra</option>'+CFG.letras.map(l=>'<option value="'+l+'">Letra '+l+'</option>').join('');
  $('#flt-esp').innerHTML='<option value="">Todas las especialidades</option>'+opciones(CAMPO.especialidad).concat([{v:'NO APLICA',t:'NO APLICA'}]).map(o=>'<option value="'+esc(o.v)+'">'+esc(o.t)+'</option>').join('');
  $('#flt-estado').innerHTML='<option value="">Todos los estados</option>'+CFG.estados.map(e=>'<option>'+esc(e)+'</option>').join('');
  $('#sel-letra').innerHTML='<option value="">Elegir letra…</option>'+CFG.letras.map(l=>'<option value="'+l+'">Letra '+l+'</option>').join('')+'<option value="-">Quitar letra</option>';
  $$('.tabla th[data-o]').forEach(th=>th.addEventListener('click',()=>{const k=th.dataset.o;S.orden=S.orden.k===k?{k:k,dir:-S.orden.dir}:{k:k,dir:1};filtrar(true);}));
}
function sinTildes(s){return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();}
function filtrar(mantenerPagina){
  const q=sinTildes($('#flt-buscar').value.trim()),qr=q.replace(/[^0-9k]/g,'');
  const fc=$('#flt-curso').value,fl=$('#flt-letra').value,fe=$('#flt-esp').value,fs=$('#flt-estado').value;
  S.filtrados=S.registros.filter(r=>{
    if(fc&&r.curso!==fc)return false;if(fe&&r.especialidad!==fe)return false;if(fs&&r.estado!==fs)return false;
    if(fl==='-'&&r.letra)return false;if(fl&&fl!=='-'&&r.letra!==fl)return false;
    if(!q)return true;
    return sinTildes(r.nombre+' '+r.apoderado+' '+r.correo+' '+r.numRegistro+' '+r.nroMatricula).indexOf(q)>=0||(qr.length>=4&&sinTildes(r.run).replace(/[^0-9k]/g,'').indexOf(qr)>=0);
  });
  const k=S.orden.k,d=S.orden.dir;
  S.filtrados.sort((a,b)=>{let x=a[k],y=b[k];if(k==='numRegistro'){x=+x;y=+y;}else{x=sinTildes(x);y=sinTildes(y);}return (x>y?1:x<y?-1:0)*d;});
  $$('.tabla th[data-o]').forEach(th=>{th.textContent=th.textContent.replace(/ [▲▼]$/,'');if(th.dataset.o===k)th.textContent+=d>0?' ▲':' ▼';});
  if(!mantenerPagina)S.pagina=1;
  pintarTabla();
}
function selectLetra(r){
  return '<select class="control letra-sel'+(r.letra?' con':'')+'" title="Letra del curso" onchange="cambiarLetraRapido(\''+esc(r.numRegistro)+'\',this)"><option value="">—</option>'+
    CFG.letras.map(l=>'<option'+(l===r.letra?' selected':'')+'>'+l+'</option>').join('')+'</select>';
}
function pintarTabla(){
  const tot=S.filtrados.length,pp=S.porPagina,paginas=Math.max(1,Math.ceil(tot/pp));
  if(S.pagina>paginas)S.pagina=paginas;
  const ini=(S.pagina-1)*pp,filas=S.filtrados.slice(ini,ini+pp);
  if(!filas.length){$('#tbody').innerHTML='<tr><td colspan="9" class="vacio">'+(S.registros.length?'No hay resultados para los filtros aplicados.':'Aún no hay pre-matrículas registradas.')+'</td></tr>';}
  else $('#tbody').innerHTML=filas.map(r=>{
    const estado=puede('editar')
      ?'<select class="control estado-sel b-'+esc(r.estado)+'" onchange="cambiarEstadoRapido(\''+esc(r.numRegistro)+'\',this)">'+CFG.estados.map(e=>'<option'+(e===r.estado?' selected':'')+'>'+esc(e)+'</option>').join('')+'</select>'
      :'<span class="badge b-'+esc(r.estado)+'">'+esc(r.estado)+'</span>';
    const mail=r.emailEnviado==='Sí'?'<span class="badge b-si">Enviado</span>':'<span class="badge b-no">'+esc(r.emailEnviado||'No')+'</span>';
    const n=esc(r.numRegistro);
    const curso=puede('editar')
      ?'<div class="curso-celda"><span>'+esc(etiqueta(CAMPO.curso,r.curso))+'</span>'+selectLetra(r)+'</div>'
      :'<b>'+esc(cursoTexto(r))+'</b>';
    let acc='<button class="btn-ico" title="Ver ficha" onclick="verRegistro(\''+n+'\')"><span data-i="ojo"></span></button>';
    if(puede('editar'))acc+='<button class="btn-ico" title="Editar" onclick="editarRegistro(\''+n+'\')"><span data-i="editar"></span></button>';
    acc+='<button class="btn-ico" title="Imprimir ficha (anverso y reverso)" onclick="imprimirFicha(\''+n+'\')"><span data-i="impresora"></span></button>';
    acc+='<button class="btn-ico" title="Descargar PDF" onclick="descargarPdf(\''+n+'\')"><span data-i="pdf"></span></button>';
    if(puede('editar'))acc+='<button class="btn-ico" title="Reenviar correo de confirmación" onclick="reenviar(\''+n+'\')"><span data-i="correo"></span></button>';
    if(puede('eliminar'))acc+='<button class="btn-ico rojo" title="Eliminar" onclick="eliminarRegistro(\''+n+'\')"><span data-i="basura"></span></button>';
    return '<tr'+(S.sel.has(r.numRegistro)?' class="sel"':'')+'><td class="col-sel"><input type="checkbox" aria-label="Seleccionar N° '+n+'"'+(S.sel.has(r.numRegistro)?' checked':'')+' onchange="seleccionar(\''+n+'\',this.checked)"></td>'+
      '<td data-l="N°"><div><b>'+n+'</b>'+(r.nroMatricula?'<div class="nro-mat" title="N° de matrícula">'+esc(r.nroMatricula)+'</div>':'')+'</div></td>'+
      '<td class="td-nom"><div class="nom">'+esc(r.nombre)+'</div><div class="sub">'+esc(r.run)+' · '+esc(r.timestamp)+'</div></td>'+
      '<td data-l="Curso" class="nw"><div>'+curso+'<div class="sub">Antes: '+esc(r.cursoGestionPasada)+'</div></div></td>'+
      '<td data-l="Especialidad">'+esc(r.especialidad)+'</td>'+
      '<td data-l="Apoderado"><div>'+esc(r.apoderado)+'<div class="sub">'+esc(r.fono)+'</div></div></td>'+
      '<td data-l="Estado">'+estado+'</td><td data-l="Correo">'+mail+'</td>'+
      '<td data-l="Acciones"><div class="acc">'+acc+'</div></td></tr>';
  }).join('');
  pintarIconos($('#tbody'));
  $('#pg-info').textContent=tot?('Mostrando '+(ini+1)+'–'+Math.min(ini+pp,tot)+' de '+tot+(tot!==S.registros.length?' (filtrados de '+S.registros.length+')':'')):'0 registros';
  let b='<button class="btn btn-sec btn-sm" '+(S.pagina<=1?'disabled':'')+' onclick="S.pagina--;pintarTabla()"><span data-i="izq"></span></button>';
  b+='<span style="align-self:center;padding:0 6px">Página '+S.pagina+' de '+paginas+'</span>';
  b+='<button class="btn btn-sec btn-sm" '+(S.pagina>=paginas?'disabled':'')+' onclick="S.pagina++;pintarTabla()"><span data-i="der"></span></button>';
  $('#pg-btns').innerHTML=b;pintarIconos($('#pg-btns'));
  pintarSeleccion();
}

function avisoVersion(){
  const p=$('#v-panel');if(!S.versionDistinta||!p||$('#aviso-version'))return;
  const d=document.createElement('div');d.id='aviso-version';d.className='aviso err';d.style.margin='0 0 14px';
  d.innerHTML='<span data-i="alerta"></span><div><b>Versiones distintas.</b> '+esc(S.versionDistinta)+'</div>';
  const w=p.querySelector('.panel-wrap')||p.firstElementChild;w.insertBefore(d,w.firstChild);pintarIconos(d);
}
function regLocal(n){return S.registros.filter(r=>r.numRegistro===String(n))[0];}

// ---------- Selección múltiple ----------
function seleccionar(n,on){if(on)S.sel.add(String(n));else S.sel.delete(String(n));pintarTabla();}
function seleccionarTodos(on){if(on)S.filtrados.forEach(r=>S.sel.add(r.numRegistro));else S.filtrados.forEach(r=>S.sel.delete(r.numRegistro));pintarTabla();}
function limpiarSeleccion(){S.sel.clear();pintarTabla();}
function seleccionados(){return S.registros.filter(r=>S.sel.has(r.numRegistro)).sort((a,b)=>sinTildes(a.apellidoPaterno+a.apellidoMaterno+a.nombres)>sinTildes(b.apellidoPaterno+b.apellidoMaterno+b.nombres)?1:-1);}
function pintarSeleccion(){
  const n=S.sel.size,bar=$('#barra-sel');
  bar.classList.toggle('oculto',!n);
  $('#sel-info').textContent=n+(n===1?' registro seleccionado':' registros seleccionados');
  $('#sel-letra-grupo').classList.toggle('oculto',!puede('editar'));
  const st=$('#sel-todos');const enFiltro=S.filtrados.filter(r=>S.sel.has(r.numRegistro)).length;
  st.checked=S.filtrados.length>0&&enFiltro===S.filtrados.length;st.indeterminate=enFiltro>0&&enFiltro<S.filtrados.length;
  pintarIconos(bar);
}

// ---------- Letra del curso ----------
function aplicarLetraLocal(nums,letra,res){
  nums.forEach(n=>{const r=regLocal(n);if(r){r.letra=letra;r.fechaModificacion=res.fechaModificacion||r.fechaModificacion;r.modificadoPor=res.modificadoPor||r.modificadoPor;enriquecer(r);}});
  calcularStats();filtrar(true);
}
function cambiarLetraRapido(n,sel){
  const r=regLocal(n),anterior=r.letra||'',nueva=sel.value;
  sel.disabled=true;
  api('asignarCurso',S.token,[n],nueva).then(res=>{
    sel.disabled=false;
    if(!res.ok){sel.value=anterior;return toast(res.mensaje,'err');}
    aplicarLetraLocal([n],nueva,res);
    toast('N° '+n+' → '+(nueva?etiqueta(CAMPO.curso,r.curso)+' '+nueva:'sin letra'),'ok');
  }).catch(e=>{sel.disabled=false;sel.value=anterior;errorRed(e);});
}
function asignarLetraSeleccion(){
  const v=$('#sel-letra').value;if(!v)return toast('Elija la letra que desea asignar.','err');
  const letra=v==='-'?'':v,regs=seleccionados(),nums=regs.map(r=>r.numRegistro);
  const cursos=Array.from(new Set(regs.map(r=>etiqueta(CAMPO.curso,r.curso))));
  const aviso=cursos.length>1?'<br><br><span style="color:var(--rojo);font-size:14px">Atención: la selección incluye distintos cursos ('+esc(cursos.join(', '))+'). Cada uno conservará su curso y recibirá la letra '+esc(letra)+'.</span>':'';
  confirmar('Asignar letra',(letra?'¿Asignar la <b>letra '+esc(letra)+'</b>':'¿Quitar la letra')+' a <b>'+nums.length+'</b> registro'+(nums.length===1?'':'s')+'?'+aviso,letra?'Asignar':'Quitar letra').then(si=>{
    if(!si)return;cargando(true,'Guardando…');
    api('asignarCurso',S.token,nums,letra).then(res=>{
      cargando(false);if(!res.ok)return toast(res.mensaje,'err');
      aplicarLetraLocal(nums,letra,res);$('#sel-letra').value='';
      toast(res.cambiados+' registro'+(res.cambiados===1?'':'s')+' actualizado'+(res.cambiados===1?'':'s')+'.','ok');
    }).catch(errorRed);
  });
}

function cambiarEstadoRapido(n,sel){
  const r=regLocal(n),anterior=r.estado,nuevo=sel.value;
  sel.className='control estado-sel b-'+nuevo;
  api('cambiarEstado',S.token,n,nuevo,r.nroMatricula).then(res=>{
    if(!res.ok){sel.value=anterior;sel.className='control estado-sel b-'+anterior;return toast(res.mensaje,'err');}
    const nroNuevo=res.nroMatricula&&res.nroMatricula!==r.nroMatricula;
    r.estado=nuevo;r.nroMatricula=res.nroMatricula||'';r.fechaModificacion=res.fechaModificacion||'';r.modificadoPor=res.modificadoPor||'';calcularStats();
    if(nroNuevo)pintarTabla();
    toast('Registro N° '+n+' → '+nuevo+(nroNuevo?' · N° de matrícula '+res.nroMatricula:''),'ok');
  }).catch(e=>{sel.value=anterior;sel.className='control estado-sel b-'+anterior;errorRed(e);});
}

function verRegistro(n){
  const d=regLocal(n);if(!d)return toast('Registro no encontrado. Actualice el panel.','err');
  const info='<div class="aviso info" style="margin-bottom:16px;flex-wrap:wrap"><span data-i="info"></span><div>Recibida el <b>'+esc(d.timestamp)+'</b> · Curso: <b>'+esc(cursoTexto(d))+'</b> · Estado: <span class="badge b-'+esc(d.estado)+'">'+esc(d.estado)+'</span>'+
    (d.nroMatricula?' · N° Matrícula: <b>'+esc(d.nroMatricula)+'</b>':'')+
    (d.aporteBoleta||d.aporteMonto?' · Aporte voluntario: <b>'+(d.aporteMonto?'$'+Number(d.aporteMonto).toLocaleString('es-CL'):'')+(d.aporteBoleta?' (boleta N° '+esc(d.aporteBoleta)+')':'')+'</b>':'')+' · Correo: <b>'+esc(d.emailEnviado||'No')+'</b>'+
    (d.modificadoPor?'<br><span style="font-size:13px">Última modificación: '+esc(d.fechaModificacion)+' por '+esc(d.modificadoPor)+'</span>':'')+'</div></div>';
  abrirModal({titulo:'Pre-matrícula N° '+esc(d.numRegistro)+' · '+esc(d.nombres+' '+d.apellidoPaterno),ancho:true,
    cuerpo:info+'<div class="resumen">'+htmlResumen(d,false)+'</div>',
    pie:'<button class="btn btn-sec" onclick="imprimirFicha(\''+esc(n)+'\')"><span data-i="impresora"></span>Imprimir</button>'+
      '<button class="btn btn-sec" onclick="descargarPdf(\''+esc(n)+'\')"><span data-i="pdf"></span>PDF</button>'+
      (puede('editar')?'<button class="btn btn-pri" onclick="editarRegistro(\''+esc(n)+'\')"><span data-i="editar"></span>Editar</button>':'')});
}

function editarRegistro(n){
  const d=regLocal(n);if(!d)return toast('Registro no encontrado. Actualice el panel.','err');
  const internos='<div class="seccion"><div class="seccion-tit"><h3>Datos internos del liceo</h3></div><div class="grid">'+
    '<div class="campo"><label for="e-letra">Letra del curso</label><select class="control" id="e-letra"><option value="">Sin letra</option>'+CFG.letras.map(l=>'<option'+(l===d.letra?' selected':'')+'>'+l+'</option>').join('')+'</select><span class="ayuda">Ej: 1° Medio <b>A</b>. El curso (1°, 2°…) se cambia más abajo.</span></div>'+
    '<div class="campo"><label for="e-estado">Estado</label><select class="control" id="e-estado">'+CFG.estados.map(e=>'<option'+(e===d.estado?' selected':'')+'>'+esc(e)+'</option>').join('')+'</select></div>'+
    '<div class="campo"><label for="e-nroMatricula">N° de matrícula</label><input class="control" id="e-nroMatricula" maxlength="20" value="'+esc(d.nroMatricula)+'" placeholder="Se asigna al marcar Matriculado"><span class="ayuda">Se asigna solo (ej: '+CFG.anio+'-0001) al cambiar el estado a <b>Matriculado</b>. Puede corregirlo aquí.</span></div>'+
    '<div class="campo"><label for="e-aporteBoleta">Aporte voluntario · N° de boleta</label><input class="control" id="e-aporteBoleta" maxlength="20" value="'+esc(d.aporteBoleta)+'" placeholder="Ej: 10234"><span class="msg-error"></span></div>'+
    '<div class="campo"><label for="e-aporteMonto">Aporte voluntario · Monto ($)</label><input class="control" id="e-aporteMonto" inputmode="numeric" maxlength="12" value="'+esc(d.aporteMonto)+'" placeholder="Ej: 25000"><span class="msg-error"></span><span class="ayuda">Solo números, sin puntos. Déjelo en blanco si no hubo aporte.</span></div>'+
    '</div></div>';
  abrirModal({titulo:'Editar pre-matrícula N° '+esc(d.numRegistro),ancho:true,
    cuerpo:'<form id="form-editar" novalidate>'+internos+ESQUEMA.map(p=>p.secciones.map(s=>htmlSeccion(s,'e-')).join('')).join('')+'<div class="aviso err oculto" id="ed-err" style="margin-top:16px"></div></form>',
    pie:'<button class="btn btn-sec" onclick="cerrarModal()">Cancelar</button><button class="btn btn-pri" id="ed-ok"><span data-i="check"></span>Guardar cambios</button>'});
  const FE=new Formulario($('#form-editar'),'e-');
  FE.cargar(d);FE.el('fechaMatricula').readOnly=true;
  $('#ed-ok').onclick=()=>{
    const e=FE.validar(CAMPOS.map(c=>c.key));
    if(e){const el=FE.el(e);el.scrollIntoView({behavior:'smooth',block:'center'});el.focus({preventScroll:true});toast('Revise los campos marcados.','err');return;}
    const datos=FE.datos();datos.estado=$('#e-estado').value;datos.nroMatricula=$('#e-nroMatricula').value.trim();datos.letra=$('#e-letra').value;
    datos.aporteBoleta=$('#e-aporteBoleta').value.trim();datos.aporteMonto=$('#e-aporteMonto').value.replace(/[$.\s]/g,'').trim();
    cargando(true,'Guardando…');
    api('actualizarRegistro',S.token,n,datos).then(res=>{
      cargando(false);
      if(!res.ok){if(res.errores)Object.keys(res.errores).forEach(k=>FE.marcar(k,res.errores[k]));const er=$('#ed-err');er.textContent=res.mensaje;er.classList.remove('oculto');return;}
      const nuevo=desdeFila(COLUMNAS_REG,res.registro),i=S.registros.indexOf(d);
      if(i>=0)S.registros[i]=nuevo;
      cerrarModal();toast('Registro N° '+n+' actualizado.'+(nuevo.nroMatricula&&nuevo.nroMatricula!==d.nroMatricula?' N° de matrícula: '+nuevo.nroMatricula:''),'ok');calcularStats();filtrar(true);
    }).catch(errorRed);
  };
}

function eliminarRegistro(n){
  const r=regLocal(n);
  confirmar('Eliminar pre-matrícula','¿Eliminar el registro <b>N° '+esc(n)+'</b> de <b>'+esc(r?r.nombre:'')+'</b>?<br><br><span style="color:var(--muted);font-size:14px">El registro se moverá a la hoja "Eliminados" de la planilla (papelera) y quedará anotado en la bitácora.</span>','Eliminar',true).then(si=>{
    if(!si)return;cargando(true,'Eliminando…');
    api('eliminarRegistro',S.token,n).then(res=>{
      cargando(false);if(!res.ok)return toast(res.mensaje,'err');
      S.registros=S.registros.filter(x=>x.numRegistro!==String(n));S.sel.delete(String(n));
      toast('Registro eliminado.','ok');calcularStats();filtrar(true);
    }).catch(errorRed);
  });
}

// ---------- Impresión y PDF (en el navegador, sin esperar al servidor) ----------
function imprimirFicha(n){
  if(!n){imprimirHTML(documentoFichas([{}],'impresion'));return;}
  const r=regLocal(n);if(!r)return toast('Registro no encontrado.','err');
  imprimirHTML(documentoFichas([r],'impresion'));
}
function descargarPdf(n){
  const r=regLocal(n);if(!r)return toast('Registro no encontrado.','err');
  generarPdf([r]);
}
function generarPdf(regs){
  cargando(true,regs.length>1?'Generando PDF con '+regs.length+' fichas…':'Generando PDF…');
  setTimeout(()=>descargarFichasPDF(regs).then(()=>cargando(false)).catch(errorRed),30);
}
const MAX_PDF=40,MAX_IMPRESION=300;
function imprimirSeleccion(){
  const regs=seleccionados();if(!regs.length)return;
  if(regs.length>MAX_IMPRESION)return toast('Seleccione como máximo '+MAX_IMPRESION+' registros para imprimir de una vez.','err');
  imprimirHTML(documentoFichas(regs,'impresion'));
}
function pdfSeleccion(){
  const regs=seleccionados();if(!regs.length)return;
  if(regs.length>MAX_PDF)return toast('El PDF admite hasta '+MAX_PDF+' fichas a la vez. Para más, use "Imprimir fichas" y elija "Guardar como PDF".','err');
  generarPdf(regs);
}
function tituloFiltros(){
  const fc=$('#flt-curso').value,fl=$('#flt-letra').value,fe=$('#flt-esp').value,fs=$('#flt-estado').value;
  let t='Nómina';
  if(fc)t+=' '+etiqueta(CAMPO.curso,fc)+(fl&&fl!=='-'?' '+fl:'');else if(fl&&fl!=='-')t+=' letra '+fl;
  if(fl==='-')t+=' sin letra asignada';
  if(fe)t+=' · '+fe;if(fs)t+=' · '+fs;
  return t+' '+CFG.anio;
}
function imprimirNomina(){
  if(!S.filtrados.length)return toast('No hay registros para imprimir con los filtros actuales.','err');
  const regs=S.filtrados.slice().sort((a,b)=>{
    const x=(a.curso||'')+(a.letra||'~')+sinTildes(a.apellidoPaterno+' '+a.apellidoMaterno+' '+a.nombres),y=(b.curso||'')+(b.letra||'~')+sinTildes(b.apellidoPaterno+' '+b.apellidoMaterno+' '+b.nombres);
    return x>y?1:x<y?-1:0;});
  imprimirHTML(documentoNomina(regs,tituloFiltros()));
}
function reenviar(n){
  const r=regLocal(n);
  confirmar('Reenviar correo','Se enviará el correo de confirmación a <b>'+esc(r?r.correo:'')+'</b>.','Enviar').then(si=>{
    if(!si)return;cargando(true,'Enviando correo…');
    api('reenviarCorreo',S.token,n).then(res=>{cargando(false);if(!res.ok)return toast(res.mensaje,'err');if(r)r.emailEnviado='Sí';calcularStats();pintarTabla();toast('Correo enviado a '+res.correo,'ok');}).catch(errorRed);
  });
}
/** Exporta a CSV (Excel) los registros filtrados, con la letra del curso. */
function exportar(){
  const regs=S.filtrados.length?S.filtrados:S.registros;
  if(!regs.length)return toast('No hay registros para exportar.','err');
  const cols=COLUMNAS_REG.concat(['cursoCompleto']);
  const filas=[cols].concat(regs.map(r=>COLUMNAS_REG.map(k=>r[k]).concat([cursoTexto(r)])));
  const csv='﻿'+filas.map(f=>f.map(v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"').join(';')).join('\r\n');
  descargarTexto(csv,'prematriculas_'+CFG.anio+(regs.length!==S.registros.length?'_filtrado':'')+'.csv','text/csv;charset=utf-8');
  toast('Exportados '+regs.length+' registros.','ok');
}

// ============================================================
//  PANEL · USUARIOS
// ============================================================
const DESC_ROLES={admin:'Todo, incluida la administración de usuarios y roles.',editor_eliminar:'Ver, imprimir, editar y eliminar registros.',editor:'Ver, imprimir y editar registros. No puede eliminar.',lectura:'Solo ver, imprimir y descargar fichas.'};
let USUARIOS=[];
function cargarUsuarios(){
  $('#roles-info').innerHTML=CFG.roles.map(r=>'<div class="card"><b>'+esc(r.t)+'</b>'+esc(DESC_ROLES[r.v]||'')+'</div>').join('');
  cargando(true);
  api('listarUsuarios',S.token).then(r=>{
    cargando(false);if(!r.ok)return toast(r.mensaje,'err');
    USUARIOS=r.usuarios;
    $('#tbody-usuarios').innerHTML=USUARIOS.map((u,i)=>'<tr>'+
      '<td class="td-nom"><div class="nom">'+esc(u.nombre)+'</div><div class="sub">@'+esc(u.usuario)+(u.debeCambiar?' · debe cambiar clave':'')+'</div></td>'+
      '<td data-l="Rol"><span class="badge b-si" style="background:var(--azul-50);color:var(--azul)">'+esc(u.rolNombre)+'</span></td>'+
      '<td data-l="Correo">'+esc(u.email||'—')+'</td>'+
      '<td data-l="Estado">'+(u.activo?'<span class="badge b-si">Activo</span>':'<span class="badge b-Anulado">Inactivo</span>')+'</td>'+
      '<td data-l="Último acceso">'+esc(u.ultimoAcceso||'—')+'</td>'+
      '<td data-l="Acciones"><div class="acc"><button class="btn-ico" title="Editar" onclick="modalUsuario('+i+')"><span data-i="editar"></span></button>'+
      (u.usuario!==S.sesion.usuario?'<button class="btn-ico rojo" title="Eliminar" onclick="borrarUsuario('+i+')"><span data-i="basura"></span></button>':'')+'</div></td></tr>').join('');
    pintarIconos($('#tbody-usuarios'));
  }).catch(errorRed);
}
function generarClave(){const c='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';let s='';for(let i=0;i<10;i++)s+=c[Math.floor(Math.random()*c.length)];return s.replace(/^(.{8})/,'$1')+Math.floor(Math.random()*10);}
function modalUsuario(i){
  const u=i==null?null:USUARIOS[i],nuevo=!u;
  abrirModal({titulo:nuevo?'Nuevo usuario':'Editar usuario',
    cuerpo:'<div class="grid">'+
      '<div class="campo"><label>Usuario <span class="req">*</span></label><input class="control" id="u-usuario" autocapitalize="none" value="'+esc(u?u.usuario:'')+'"'+(nuevo?'':' readonly')+' placeholder="ej: jperez"></div>'+
      '<div class="campo"><label>Nombre completo <span class="req">*</span></label><input class="control" id="u-nombre" value="'+esc(u?u.nombre:'')+'"></div>'+
      '<div class="campo"><label>Correo</label><input class="control" id="u-email" type="email" value="'+esc(u?u.email:'')+'"></div>'+
      '<div class="campo"><label>Rol <span class="req">*</span></label><select class="control" id="u-rol">'+CFG.roles.map(r=>'<option value="'+r.v+'"'+(u&&u.rol===r.v?' selected':(!u&&r.v==='lectura'?' selected':''))+'>'+esc(r.t)+'</option>').join('')+'</select><span class="ayuda" id="u-rol-desc"></span></div>'+
      '<div class="campo full"><label>'+(nuevo?'Contraseña inicial <span class="req">*</span>':'Restablecer contraseña (opcional)')+'</label>'+
        '<div style="display:flex;gap:8px"><input class="control" id="u-pass" type="text" autocomplete="off" placeholder="'+(nuevo?'':'Dejar en blanco para no cambiarla')+'"><button type="button" class="btn btn-sec" onclick="$(\'#u-pass\').value=generarClave()">Generar</button></div>'+
        '<span class="ayuda">Mínimo 8 caracteres con letras y números. El usuario deberá cambiarla al ingresar.</span></div>'+
      '<label class="check full"><input type="checkbox" id="u-activo"'+(!u||u.activo?' checked':'')+'> Usuario activo (puede ingresar)</label>'+
      '</div><div class="aviso err oculto" id="u-err" style="margin-top:14px"></div>',
    pie:'<button class="btn btn-sec" onclick="cerrarModal()">Cancelar</button><button class="btn btn-pri" id="u-ok"><span data-i="check"></span>Guardar</button>'});
  const desc=()=>$('#u-rol-desc').textContent=DESC_ROLES[$('#u-rol').value]||'';desc();$('#u-rol').onchange=desc;
  $('#u-ok').onclick=()=>{
    const datos={nuevo:nuevo,usuario:$('#u-usuario').value.trim(),nombre:$('#u-nombre').value.trim(),email:$('#u-email').value.trim(),rol:$('#u-rol').value,activo:$('#u-activo').checked,password:$('#u-pass').value};
    const er=$('#u-err');
    cargando(true,'Guardando…');
    api('guardarUsuario',S.token,datos).then(res=>{
      cargando(false);if(!res.ok){er.textContent=res.mensaje;er.classList.remove('oculto');return;}
      cerrarModal();toast('Usuario guardado.'+(datos.password?' Comparta la contraseña de forma segura.':''),'ok');cargarUsuarios();
    }).catch(errorRed);
  };
}
function borrarUsuario(i){
  const u=USUARIOS[i];
  confirmar('Eliminar usuario','¿Eliminar al usuario <b>@'+esc(u.usuario)+'</b> ('+esc(u.nombre)+')? Si solo desea quitarle el acceso, puede marcarlo como inactivo.','Eliminar',true).then(si=>{
    if(!si)return;cargando(true);
    api('eliminarUsuario',S.token,u.usuario).then(r=>{cargando(false);if(!r.ok)return toast(r.mensaje,'err');toast('Usuario eliminado.','ok');cargarUsuarios();}).catch(errorRed);
  });
}

// ============================================================
//  INICIO
// ============================================================
// Columnas de la hoja (mismo orden que COLUMNAS en Config.gs); se actualiza con la respuesta del servidor.
let COLUMNAS_REG=['timestamp','numRegistro','fechaMatricula','curso','cursoGestionPasada','especialidad','apellidoPaterno','apellidoMaterno','nombres','run','genero','fechaNacimiento','edad','lugarNacimiento','pais','nacionalidad','religion','etnia','celularEstudiante','correoEstudiante','domicilioEstudiante','nombreApoderadoTitular','correoApoderadoTitular','fonoApoderadoTitular','nombreApoderadoSuplente','correoApoderadoSuplente','fonoApoderadoSuplente','profesionPadre','profesionMadre','profesionApoderado','personaConQuienVive','totalHijos','lugarQueOcupa','personasEnCasa','tipoDomicilio','situacionEconomica','subsidioUnicoFamiliar','beneficioJunaeb','chileSolidario','becaIndigena','cuidadosEspeciales','medicamentosContraindicados','atencionSalud','contactoEmergencia','telefonoEmergencia','procedenciaEscuela','cursoRepetido','estado','nroMatricula','emailEnviado','fechaModificacion','modificadoPor','letra','tramoFonasa','isapre','alumnoAntiguo'];
const VISTA_INICIAL=(new URLSearchParams(location.search).get('p')||'').toLowerCase();

(function iniciar(){
  $$('.anio').forEach(e=>e.textContent=CFG.anio);
  pintarIconos();
  $('#form-login').addEventListener('submit',login);
  construirFormularioPublico();
  llenarFiltros();
  if(/PEGUE_AQUI/.test(API_URL))toast('Falta configurar la URL de Apps Script en js/config.js','err');
  // "Despierta" Apps Script mientras la persona lee/llena (la primera llamada del día es la más lenta)
  api('ping').then(r=>{
    if(r&&r.version!==CFG.version){
      S.versionDistinta='Apps Script tiene la versión '+(r.version||'anterior a la 7')+' y el sitio la '+CFG.version+'. Reemplace los archivos de Apps Script y publique una nueva versión de la implementación; de lo contrario algunos datos no se guardarán.';
      console.warn('[Pre-Matrícula] '+S.versionDistinta);avisoVersion();
    }
    if(r&&r.formularioAbierto===false){CFG.formularioAbierto=false;$('#form-abierto').classList.add('oculto');$('#form-cerrado').classList.remove('oculto');}
  }).catch(()=>{});
  const t=store.get('pm_token',true);
  if(VISTA_INICIAL==='form')mostrarVista('v-form');
  else if(VISTA_INICIAL==='login')mostrarVista('v-login');
  if(t){
    api('sesionActual',t).then(r=>{if(r.ok){S.token=t;if(VISTA_INICIAL==='form'){S.sesion=r.sesion;entrarPanelSilencioso(r.sesion);}else entrarPanel(r.sesion);}else store.del('pm_token',true);}).catch(()=>{});
  }
})();
function entrarPanelSilencioso(ses){
  $('#acciones-publicas').classList.add('oculto');$('#acciones-privadas').classList.remove('oculto');
  $('#chip-nombre').textContent=ses.nombre;$('#chip-rol').textContent=ses.rolNombre;
  $('#chip-av').textContent=(ses.nombre||ses.usuario).split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase();
  $('#tab-usuarios').classList.toggle('oculto',!ses.permisos.usuarios);
}
