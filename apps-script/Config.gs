/**
 * ============================================================
 *  SISTEMA DE PRE-MATRÍCULA (año configurable en ANIO)
 *  Liceo Bicentenario Politécnico "Cesáreo Aguirre Goyenechea"
 * ------------------------------------------------------------
 *  Config.gs  →  Toda la configuración en un solo lugar
 * ============================================================
 */

const CONFIG = {
  // --- Planilla de Google Sheets ---
  SPREADSHEET_ID: '1RvHuJljtEpndYVKIvUYHixylzP2rQhAwzrhVM2WEHcM',
  HOJA_REGISTROS: 'Matriculas2027',    // hoja de este proceso (la de 2026 queda como historial)
  HOJA_USUARIOS: 'Usuarios',
  HOJA_ELIMINADOS: 'Eliminados',
  HOJA_BITACORA: 'Bitacora',

  // --- Sitio web (GitHub Pages) ---
  // Dirección pública del sitio, SIN barra final. Ej: 'https://scannb9-byte.github.io/formulario-matricula'
  // Se usa para el logo del correo y para redirigir a quien abra la URL /exec directamente.
  URL_SITIO: 'https://scannb9-byte.github.io/formulario-matricula',

  // --- Institución ---
  ANIO: 2027,                          // año de la matrícula: cambia títulos, ficha, correos y 'Curso año anterior'
  LICEO_LINEA1: 'LICEO BICENTENARIO POLITÉCNICO',
  LICEO_LINEA2: '"CESÁREO AGUIRRE GOYENECHEA"',
  LEMA: '"Sólida formación técnica profesional, en un ambiente con responsabilidad ciudadana y valoración de la diversidad"',
  ZONA_HORARIA: 'America/Santiago',

  // --- Correo ---
  EMAIL_HABILITADO: true,             // false = no envía correos
  EMAIL_REMITENTE: 'Liceo Politécnico Cesáreo Aguirre Goyenechea',
  EMAIL_RESPONDER_A: '',              // ej: 'matriculas@liceo.cl' (vacío = sin reply-to)
  EMAIL_COPIA_ESTUDIANTE: true,       // también envía copia al correo del estudiante
  EMAIL_COPIA_SUPLENTE: false,        // también envía copia al apoderado suplente
  // El correo al apoderado ya NO lleva la ficha PDF (la imprime/descarga el personal desde el panel).
  // IDs de archivos PDF en Google Drive que se adjuntan siempre
  // (ej: Manual de Convivencia, Reglamento de Evaluación). Dejar [] si no aplica (más rápido).
  ADJUNTOS_DRIVE_IDS: [],

  // --- Formulario ---
  CURSOS_CON_ESPECIALIDAD: ['3°', '4°'], // 1° y 2° quedan "No Aplica" automáticamente
  EDAD_MIN: 11,
  EDAD_MAX: 25,
  LETRAS: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], // letras que el personal asigna a cada curso (1° Medio A, B, …)
  // N° de matrícula: se asigna solo al cambiar el estado a "Matriculado" (si el registro aún no tiene uno).
  // Formato: AÑO-0001. NRO_MATRICULA_INICIO permite partir desde otro número (ej: 1450 → 2027-1450).
  NRO_MATRICULA_AUTOMATICO: true,
  NRO_MATRICULA_DIGITOS: 4,
  NRO_MATRICULA_INICIO: 1,
  BLOQUEAR_RUN_DUPLICADO: true,       // impide 2 pre-matrículas con el mismo RUN
  FORMULARIO_ABIERTO: true,           // false = cierra el formulario público

  // --- Seguridad ---
  SESION_HORAS: 6,                    // máximo 6 (límite de CacheService)
  INTENTOS_MAX_LOGIN: 5,              // intentos fallidos antes de bloquear
  BLOQUEO_MINUTOS: 15,
  ADMIN_INICIAL_USUARIO: 'admin'      // la contraseña inicial se genera al azar en configurarSistema()
};

/** Roles y permisos. El administrador los asigna desde el panel. */
const ROLES = {
  admin:           { nombre: 'Administrador',          ver: true, editar: true,  eliminar: true,  usuarios: true  },
  editor_eliminar: { nombre: 'Edición y eliminación',  ver: true, editar: true,  eliminar: true,  usuarios: false },
  editor:          { nombre: 'Edición',                ver: true, editar: true,  eliminar: false, usuarios: false },
  lectura:         { nombre: 'Solo lectura',           ver: true, editar: false, eliminar: false, usuarios: false }
};

/** Estados posibles de una pre-matrícula (los cambia el personal). */
const ESTADOS = ['Pendiente', 'Matriculado', 'Anulado'];

/**
 * Columnas de la hoja (el orden A..AU se mantiene igual al sistema anterior
 * para no romper los datos existentes; las columnas AV..AZ se agregaron en 2027 y BA = letra del curso).
 */
const COLUMNAS = [
  'timestamp', 'numRegistro', 'fechaMatricula', 'curso', 'cursoGestionPasada',
  'especialidad', 'apellidoPaterno', 'apellidoMaterno', 'nombres', 'run',
  'genero', 'fechaNacimiento', 'edad', 'lugarNacimiento', 'pais', 'nacionalidad',
  'religion', 'etnia', 'celularEstudiante', 'correoEstudiante', 'domicilioEstudiante',
  'nombreApoderadoTitular', 'correoApoderadoTitular', 'fonoApoderadoTitular',
  'nombreApoderadoSuplente', 'correoApoderadoSuplente', 'fonoApoderadoSuplente',
  'profesionPadre', 'profesionMadre', 'profesionApoderado', 'personaConQuienVive',
  'totalHijos', 'lugarQueOcupa', 'personasEnCasa', 'tipoDomicilio', 'situacionEconomica',
  'subsidioUnicoFamiliar', 'beneficioJunaeb', 'chileSolidario', 'becaIndigena',
  'cuidadosEspeciales', 'medicamentosContraindicados', 'atencionSalud',
  'contactoEmergencia', 'telefonoEmergencia', 'procedenciaEscuela', 'cursoRepetido',
  // --- nuevas ---
  'estado', 'nroMatricula', 'emailEnviado', 'fechaModificacion', 'modificadoPor',
  // --- versión GitHub ---
  'letra'
];

/** Columnas que el personal puede editar además de las del formulario. */
const CAMPOS_INTERNOS = ['estado', 'nroMatricula', 'letra'];

/**
 * ESQUEMA DEL FORMULARIO (validación del servidor).
 * ⚠ El sitio web tiene una copia en js/esquema.js. Si cambia opciones o campos aquí,
 *   haga el mismo cambio allá (y viceversa).
 * type: text | email | tel | date | number | select | textarea | rut
 */
function esquemaFormulario_() {
  const SI_NO = ['Sí', 'No'];
  const cursosPasados = [{ v: '8°', t: '8° Básico' }];
  const letras = { 1: 'ABCDEFGH', 2: 'ABCDEFGH', 3: 'ABCDEFG', 4: 'ABCDEFGH' };
  [1, 2, 3, 4].forEach(n => letras[n].split('').forEach(l => cursosPasados.push({ v: n + ' ' + l, t: n + '° Medio ' + l })));

  return [
    {
      paso: 'Matrícula', icono: 'school', secciones: [{
        titulo: 'Datos de Matrícula',
        campos: [
          { key: 'fechaMatricula', label: 'Fecha de registro', type: 'date', req: true, readonly: true, help: 'Se completa automáticamente.' },
          { key: 'curso', label: 'Curso al que postula (' + CONFIG.ANIO + ')', type: 'select', req: true,
            options: [{ v: '1°', t: '1° Medio' }, { v: '2°', t: '2° Medio' }, { v: '3°', t: '3° Medio' }, { v: '4°', t: '4° Medio' }] },
          { key: 'cursoGestionPasada', label: 'Curso año anterior (' + (CONFIG.ANIO - 1) + ')', type: 'select', req: true, options: cursosPasados },
          { key: 'especialidad', label: 'Especialidad', type: 'select', req: true, especialidad: true,
            options: ['Electricidad', 'Mecánica Industrial', 'Construcciones Metálicas', 'Mecánica Automotriz', 'Servicios de Hotelería'],
            help: 'Solo para 3° y 4° Medio. En 1° y 2° queda "No Aplica".' }
        ]
      }]
    },
    {
      paso: 'Estudiante', icono: 'person', secciones: [{
        titulo: 'Datos del Estudiante',
        campos: [
          { key: 'apellidoPaterno', label: 'Apellido paterno', type: 'text', req: true, nombre: true },
          { key: 'apellidoMaterno', label: 'Apellido materno', type: 'text', req: true, nombre: true },
          { key: 'nombres', label: 'Nombres', type: 'text', req: true, nombre: true },
          { key: 'run', label: 'RUN', type: 'rut', req: true, placeholder: '12345678-9', help: 'Sin puntos y con guion. Se valida el dígito verificador.' },
          { key: 'genero', label: 'Género', type: 'select', req: true, options: ['Masculino', 'Femenino', 'Otro'] },
          { key: 'fechaNacimiento', label: 'Fecha de nacimiento', type: 'date', req: true, nacimiento: true },
          { key: 'edad', label: 'Edad', type: 'number', req: true, readonly: true, help: 'Se calcula automáticamente.' },
          { key: 'lugarNacimiento', label: 'Lugar de nacimiento (comuna)', type: 'text', req: true },
          { key: 'pais', label: 'País', type: 'text', req: true, def: 'Chile' },
          { key: 'nacionalidad', label: 'Nacionalidad', type: 'text', req: true, def: 'Chilena' },
          { key: 'religion', label: 'Religión', type: 'select', req: true, options: ['Católica', 'Evangélica', 'Otra', 'Ninguna'] },
          { key: 'etnia', label: 'Pueblo originario / Etnia', type: 'select', req: true, options: ['Ninguna', 'Mapuche', 'Aymara', 'Quechua', 'Atacameño (Lickanantay)', 'Diaguita', 'Colla', 'Rapa Nui', 'Otra'] },
          { key: 'celularEstudiante', label: 'Celular del estudiante', type: 'tel', req: true, placeholder: '9 1234 5678' },
          { key: 'correoEstudiante', label: 'Correo electrónico del estudiante', type: 'email', req: true },
          { key: 'domicilioEstudiante', label: 'Domicilio del estudiante', type: 'text', req: true, full: true, placeholder: 'Calle, número, población/villa, comuna' }
        ]
      }]
    },
    {
      paso: 'Apoderados', icono: 'family', secciones: [
        {
          titulo: 'Apoderado Titular',
          campos: [
            { key: 'nombreApoderadoTitular', label: 'Nombre completo', type: 'text', req: true, full: true, nombre: true },
            { key: 'correoApoderadoTitular', label: 'Correo electrónico', type: 'email', req: true, help: 'Aquí recibirá la confirmación de la pre-matrícula.' },
            { key: 'fonoApoderadoTitular', label: 'Teléfono', type: 'tel', req: true, placeholder: '9 1234 5678' }
          ]
        },
        {
          titulo: 'Apoderado Suplente', copiarTitular: true,
          campos: [
            { key: 'nombreApoderadoSuplente', label: 'Nombre completo', type: 'text', req: true, full: true, nombre: true },
            { key: 'correoApoderadoSuplente', label: 'Correo electrónico', type: 'email', req: true },
            { key: 'fonoApoderadoSuplente', label: 'Teléfono', type: 'tel', req: true, placeholder: '9 1234 5678' }
          ]
        }
      ]
    },
    {
      paso: 'Familia', icono: 'home', secciones: [{
        titulo: 'Información Familiar',
        campos: [
          { key: 'profesionPadre', label: 'Profesión u oficio del padre', type: 'text', req: true, placeholder: 'Si no aplica, escriba "No aplica"' },
          { key: 'profesionMadre', label: 'Profesión u oficio de la madre', type: 'text', req: true, placeholder: 'Si no aplica, escriba "No aplica"' },
          { key: 'profesionApoderado', label: 'Profesión u oficio del apoderado', type: 'text' },
          { key: 'personaConQuienVive', label: 'Persona con quien vive', type: 'select', req: true, options: ['Ambos padres', 'Madre', 'Padre', 'Abuelos', 'Otro familiar', 'Otro'] },
          { key: 'totalHijos', label: 'Total de hijos en la familia', type: 'number', req: true, min: 1, max: 20 },
          { key: 'lugarQueOcupa', label: 'Lugar que ocupa entre ellos', type: 'number', req: true, min: 1, max: 20 },
          { key: 'personasEnCasa', label: 'N° de personas que habitan en casa', type: 'number', req: true, min: 1, max: 30 },
          { key: 'tipoDomicilio', label: 'Domicilio', type: 'select', req: true, options: ['Propio', 'Arrendado', 'Cedido', 'Allegado'] },
          { key: 'situacionEconomica', label: 'Situación económica (ingreso familiar)', type: 'select', req: true, full: true,
            options: ['Alta(+ $900.000)', 'Media-Alta($701.000 - $900.000)', 'Media($501.000 - $700.000)', 'Media-Baja($301.000 - $500.000)', 'Baja(- $300.000)'] }
        ]
      }]
    },
    {
      paso: 'Salud', icono: 'health', secciones: [{
        titulo: 'Beneficios y Salud',
        campos: [
          { key: 'subsidioUnicoFamiliar', label: '¿Recibe Subsidio Único Familiar?', type: 'select', req: true, options: SI_NO },
          { key: 'beneficioJunaeb', label: '¿Beneficio JUNAEB?', type: 'select', req: true, options: SI_NO },
          { key: 'chileSolidario', label: '¿Chile Solidario?', type: 'select', req: true, options: SI_NO },
          { key: 'becaIndigena', label: '¿Beca Indígena?', type: 'select', req: true, options: SI_NO },
          { key: 'atencionSalud', label: 'Sistema de atención de salud', type: 'select', req: true, options: ['FONASA', 'ISAPRE', 'Otro'] },
          { key: 'cuidadosEspeciales', label: 'Cuidados especiales o enfermedades', type: 'textarea', full: true, placeholder: 'Indique si el estudiante tiene alguna enfermedad o condición especial. Si no tiene, déjelo en blanco.' },
          { key: 'medicamentosContraindicados', label: 'Medicamentos contraindicados', type: 'textarea', full: true, placeholder: 'Indique medicamentos a los que el estudiante sea alérgico. Si no tiene, déjelo en blanco.' }
        ]
      }]
    },
    {
      paso: 'Emergencia', icono: 'phone', secciones: [
        {
          titulo: 'Contacto de Emergencia',
          campos: [
            { key: 'contactoEmergencia', label: 'En caso de emergencia llamar a', type: 'text', req: true, nombre: true },
            { key: 'telefonoEmergencia', label: 'Teléfono de emergencia', type: 'tel', req: true, placeholder: '9 1234 5678' }
          ]
        },
        {
          titulo: 'Información Académica',
          campos: [
            { key: 'procedenciaEscuela', label: 'Escuela / colegio de procedencia', type: 'text', req: true, full: true },
            { key: 'cursoRepetido', label: 'Curso que ha repetido (si aplica)', type: 'text', full: true, placeholder: 'Ej: 1° Medio. Déjelo en blanco si no ha repetido.' }
          ]
        }
      ]
    }
  ];
}

/** Lista plana de campos del formulario. */
function camposFormulario_() {
  const out = [];
  esquemaFormulario_().forEach(p => p.secciones.forEach(s => s.campos.forEach(c => out.push(c))));
  return out;
}
