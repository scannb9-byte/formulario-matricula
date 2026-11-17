/**
 * esquema.js → Formulario y opciones (copia de apps-script/Config.gs).
 * ⚠ Si cambia campos u opciones aquí, haga el mismo cambio en Config.gs (y viceversa):
 *   el servidor vuelve a validar todo con su propia copia.
 */
const CFG = {
  "anio": 2027,
  "liceoLinea1": "LICEO BICENTENARIO POLITÉCNICO",
  "liceoLinea2": "\"CESÁREO AGUIRRE GOYENECHEA\"",
  "lema": "\"Sólida formación técnica profesional, en un ambiente con responsabilidad ciudadana y valoración de la diversidad\"",
  "cursosConEspecialidad": [
    "3°",
    "4°"
  ],
  "edadMin": 11,
  "edadMax": 25,
  "letras": [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H"
  ],
  "estados": [
    "Pendiente",
    "Matriculado",
    "Anulado"
  ],
  "roles": [
    {
      "v": "admin",
      "t": "Administrador"
    },
    {
      "v": "editor_eliminar",
      "t": "Edición y eliminación"
    },
    {
      "v": "editor",
      "t": "Edición"
    },
    {
      "v": "lectura",
      "t": "Solo lectura"
    }
  ]
};

const ESQUEMA = [
  {
    "paso": "Matrícula",
    "icono": "school",
    "secciones": [
      {
        "titulo": "Datos de Matrícula",
        "campos": [
          {
            "key": "fechaMatricula",
            "label": "Fecha de registro",
            "type": "date",
            "req": true,
            "readonly": true,
            "help": "Se completa automáticamente."
          },
          {
            "key": "curso",
            "label": "Curso al que postula (2027)",
            "type": "select",
            "req": true,
            "options": [
              {
                "v": "1°",
                "t": "1° Medio"
              },
              {
                "v": "2°",
                "t": "2° Medio"
              },
              {
                "v": "3°",
                "t": "3° Medio"
              },
              {
                "v": "4°",
                "t": "4° Medio"
              }
            ]
          },
          {
            "key": "cursoGestionPasada",
            "label": "Curso año anterior (2026)",
            "type": "select",
            "req": true,
            "options": [
              {
                "v": "8°",
                "t": "8° Básico"
              },
              {
                "v": "1 A",
                "t": "1° Medio A"
              },
              {
                "v": "1 B",
                "t": "1° Medio B"
              },
              {
                "v": "1 C",
                "t": "1° Medio C"
              },
              {
                "v": "1 D",
                "t": "1° Medio D"
              },
              {
                "v": "1 E",
                "t": "1° Medio E"
              },
              {
                "v": "1 F",
                "t": "1° Medio F"
              },
              {
                "v": "1 G",
                "t": "1° Medio G"
              },
              {
                "v": "1 H",
                "t": "1° Medio H"
              },
              {
                "v": "2 A",
                "t": "2° Medio A"
              },
              {
                "v": "2 B",
                "t": "2° Medio B"
              },
              {
                "v": "2 C",
                "t": "2° Medio C"
              },
              {
                "v": "2 D",
                "t": "2° Medio D"
              },
              {
                "v": "2 E",
                "t": "2° Medio E"
              },
              {
                "v": "2 F",
                "t": "2° Medio F"
              },
              {
                "v": "2 G",
                "t": "2° Medio G"
              },
              {
                "v": "2 H",
                "t": "2° Medio H"
              },
              {
                "v": "3 A",
                "t": "3° Medio A"
              },
              {
                "v": "3 B",
                "t": "3° Medio B"
              },
              {
                "v": "3 C",
                "t": "3° Medio C"
              },
              {
                "v": "3 D",
                "t": "3° Medio D"
              },
              {
                "v": "3 E",
                "t": "3° Medio E"
              },
              {
                "v": "3 F",
                "t": "3° Medio F"
              },
              {
                "v": "3 G",
                "t": "3° Medio G"
              },
              {
                "v": "4 A",
                "t": "4° Medio A"
              },
              {
                "v": "4 B",
                "t": "4° Medio B"
              },
              {
                "v": "4 C",
                "t": "4° Medio C"
              },
              {
                "v": "4 D",
                "t": "4° Medio D"
              },
              {
                "v": "4 E",
                "t": "4° Medio E"
              },
              {
                "v": "4 F",
                "t": "4° Medio F"
              },
              {
                "v": "4 G",
                "t": "4° Medio G"
              },
              {
                "v": "4 H",
                "t": "4° Medio H"
              }
            ]
          },
          {
            "key": "especialidad",
            "label": "Especialidad",
            "type": "select",
            "req": true,
            "especialidad": true,
            "options": [
              "Electricidad",
              "Mecánica Industrial",
              "Construcciones Metálicas",
              "Mecánica Automotriz",
              "Servicios de Hotelería"
            ],
            "help": "Solo para 3° y 4° Medio. En 1° y 2° queda \"No Aplica\"."
          }
        ]
      }
    ]
  },
  {
    "paso": "Estudiante",
    "icono": "person",
    "secciones": [
      {
        "titulo": "Datos del Estudiante",
        "campos": [
          {
            "key": "apellidoPaterno",
            "label": "Apellido paterno",
            "type": "text",
            "req": true,
            "nombre": true
          },
          {
            "key": "apellidoMaterno",
            "label": "Apellido materno",
            "type": "text",
            "req": true,
            "nombre": true
          },
          {
            "key": "nombres",
            "label": "Nombres",
            "type": "text",
            "req": true,
            "nombre": true
          },
          {
            "key": "run",
            "label": "RUN",
            "type": "rut",
            "req": true,
            "placeholder": "12345678-9",
            "help": "Sin puntos y con guion. Se valida el dígito verificador."
          },
          {
            "key": "genero",
            "label": "Género",
            "type": "select",
            "req": true,
            "options": [
              "Masculino",
              "Femenino",
              "Otro"
            ]
          },
          {
            "key": "fechaNacimiento",
            "label": "Fecha de nacimiento",
            "type": "date",
            "req": true,
            "nacimiento": true
          },
          {
            "key": "edad",
            "label": "Edad",
            "type": "number",
            "req": true,
            "readonly": true,
            "help": "Se calcula automáticamente."
          },
          {
            "key": "lugarNacimiento",
            "label": "Lugar de nacimiento (comuna)",
            "type": "text",
            "req": true
          },
          {
            "key": "pais",
            "label": "País",
            "type": "text",
            "req": true,
            "def": "Chile"
          },
          {
            "key": "nacionalidad",
            "label": "Nacionalidad",
            "type": "text",
            "req": true,
            "def": "Chilena"
          },
          {
            "key": "religion",
            "label": "Religión",
            "type": "select",
            "req": true,
            "options": [
              "Católica",
              "Evangélica",
              "Otra",
              "Ninguna"
            ]
          },
          {
            "key": "etnia",
            "label": "Pueblo originario / Etnia",
            "type": "select",
            "req": true,
            "options": [
              "Ninguna",
              "Mapuche",
              "Aymara",
              "Quechua",
              "Atacameño (Lickanantay)",
              "Diaguita",
              "Colla",
              "Rapa Nui",
              "Otra"
            ]
          },
          {
            "key": "celularEstudiante",
            "label": "Celular del estudiante",
            "type": "tel",
            "req": true,
            "placeholder": "9 1234 5678"
          },
          {
            "key": "correoEstudiante",
            "label": "Correo electrónico del estudiante",
            "type": "email",
            "req": true
          },
          {
            "key": "domicilioEstudiante",
            "label": "Domicilio del estudiante",
            "type": "text",
            "req": true,
            "full": true,
            "placeholder": "Calle, número, población/villa, comuna"
          }
        ]
      }
    ]
  },
  {
    "paso": "Apoderados",
    "icono": "family",
    "secciones": [
      {
        "titulo": "Apoderado Titular",
        "campos": [
          {
            "key": "nombreApoderadoTitular",
            "label": "Nombre completo",
            "type": "text",
            "req": true,
            "full": true,
            "nombre": true
          },
          {
            "key": "correoApoderadoTitular",
            "label": "Correo electrónico",
            "type": "email",
            "req": true,
            "help": "Aquí recibirá la confirmación de la pre-matrícula."
          },
          {
            "key": "fonoApoderadoTitular",
            "label": "Teléfono",
            "type": "tel",
            "req": true,
            "placeholder": "9 1234 5678"
          }
        ]
      },
      {
        "titulo": "Apoderado Suplente",
        "copiarTitular": true,
        "campos": [
          {
            "key": "nombreApoderadoSuplente",
            "label": "Nombre completo",
            "type": "text",
            "req": true,
            "full": true,
            "nombre": true
          },
          {
            "key": "correoApoderadoSuplente",
            "label": "Correo electrónico",
            "type": "email",
            "req": true
          },
          {
            "key": "fonoApoderadoSuplente",
            "label": "Teléfono",
            "type": "tel",
            "req": true,
            "placeholder": "9 1234 5678"
          }
        ]
      }
    ]
  },
  {
    "paso": "Familia",
    "icono": "home",
    "secciones": [
      {
        "titulo": "Información Familiar",
        "campos": [
          {
            "key": "profesionPadre",
            "label": "Profesión u oficio del padre",
            "type": "text",
            "req": true,
            "placeholder": "Si no aplica, escriba \"No aplica\""
          },
          {
            "key": "profesionMadre",
            "label": "Profesión u oficio de la madre",
            "type": "text",
            "req": true,
            "placeholder": "Si no aplica, escriba \"No aplica\""
          },
          {
            "key": "profesionApoderado",
            "label": "Profesión u oficio del apoderado",
            "type": "text"
          },
          {
            "key": "personaConQuienVive",
            "label": "Persona con quien vive",
            "type": "select",
            "req": true,
            "options": [
              "Ambos padres",
              "Madre",
              "Padre",
              "Abuelos",
              "Otro familiar",
              "Otro"
            ]
          },
          {
            "key": "totalHijos",
            "label": "Total de hijos en la familia",
            "type": "number",
            "req": true,
            "min": 1,
            "max": 20
          },
          {
            "key": "lugarQueOcupa",
            "label": "Lugar que ocupa entre ellos",
            "type": "number",
            "req": true,
            "min": 1,
            "max": 20
          },
          {
            "key": "personasEnCasa",
            "label": "N° de personas que habitan en casa",
            "type": "number",
            "req": true,
            "min": 1,
            "max": 30
          },
          {
            "key": "tipoDomicilio",
            "label": "Domicilio",
            "type": "select",
            "req": true,
            "options": [
              "Propio",
              "Arrendado",
              "Cedido",
              "Allegado"
            ]
          },
          {
            "key": "situacionEconomica",
            "label": "Situación económica (ingreso familiar)",
            "type": "select",
            "req": true,
            "full": true,
            "options": [
              "Alta(+ $900.000)",
              "Media-Alta($701.000 - $900.000)",
              "Media($501.000 - $700.000)",
              "Media-Baja($301.000 - $500.000)",
              "Baja(- $300.000)"
            ]
          }
        ]
      }
    ]
  },
  {
    "paso": "Salud",
    "icono": "health",
    "secciones": [
      {
        "titulo": "Beneficios y Salud",
        "campos": [
          {
            "key": "subsidioUnicoFamiliar",
            "label": "¿Recibe Subsidio Único Familiar?",
            "type": "select",
            "req": true,
            "options": [
              "Sí",
              "No"
            ]
          },
          {
            "key": "beneficioJunaeb",
            "label": "¿Beneficio JUNAEB?",
            "type": "select",
            "req": true,
            "options": [
              "Sí",
              "No"
            ]
          },
          {
            "key": "chileSolidario",
            "label": "¿Chile Solidario?",
            "type": "select",
            "req": true,
            "options": [
              "Sí",
              "No"
            ]
          },
          {
            "key": "becaIndigena",
            "label": "¿Beca Indígena?",
            "type": "select",
            "req": true,
            "options": [
              "Sí",
              "No"
            ]
          },
          {
            "key": "atencionSalud",
            "label": "Sistema de atención de salud",
            "type": "select",
            "req": true,
            "options": [
              "FONASA",
              "ISAPRE",
              "Otro"
            ]
          },
          {
            "key": "cuidadosEspeciales",
            "label": "Cuidados especiales o enfermedades",
            "type": "textarea",
            "full": true,
            "placeholder": "Indique si el estudiante tiene alguna enfermedad o condición especial. Si no tiene, déjelo en blanco."
          },
          {
            "key": "medicamentosContraindicados",
            "label": "Medicamentos contraindicados",
            "type": "textarea",
            "full": true,
            "placeholder": "Indique medicamentos a los que el estudiante sea alérgico. Si no tiene, déjelo en blanco."
          }
        ]
      }
    ]
  },
  {
    "paso": "Emergencia",
    "icono": "phone",
    "secciones": [
      {
        "titulo": "Contacto de Emergencia",
        "campos": [
          {
            "key": "contactoEmergencia",
            "label": "En caso de emergencia llamar a",
            "type": "text",
            "req": true,
            "nombre": true
          },
          {
            "key": "telefonoEmergencia",
            "label": "Teléfono de emergencia",
            "type": "tel",
            "req": true,
            "placeholder": "9 1234 5678"
          }
        ]
      },
      {
        "titulo": "Información Académica",
        "campos": [
          {
            "key": "procedenciaEscuela",
            "label": "Escuela / colegio de procedencia",
            "type": "text",
            "req": true,
            "full": true
          },
          {
            "key": "cursoRepetido",
            "label": "Curso que ha repetido (si aplica)",
            "type": "text",
            "full": true,
            "placeholder": "Ej: 1° Medio. Déjelo en blanco si no ha repetido."
          }
        ]
      }
    ]
  }
];
