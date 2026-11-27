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
  "version": 7,
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
  "liceoProcedencia": "LICEO BICENTENARIO POLITÉCNICO CESÁREO AGUIRRE GOYENECHEA",
  "estados": [
    "Pendiente",
    "Matriculado",
    "Retirado"
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
                "t": "1° MEDIO"
              },
              {
                "v": "2°",
                "t": "2° MEDIO"
              },
              {
                "v": "3°",
                "t": "3° MEDIO"
              },
              {
                "v": "4°",
                "t": "4° MEDIO"
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
                "t": "8° BÁSICO"
              },
              {
                "v": "1 A",
                "t": "1° MEDIO A"
              },
              {
                "v": "1 B",
                "t": "1° MEDIO B"
              },
              {
                "v": "1 C",
                "t": "1° MEDIO C"
              },
              {
                "v": "1 D",
                "t": "1° MEDIO D"
              },
              {
                "v": "1 E",
                "t": "1° MEDIO E"
              },
              {
                "v": "1 F",
                "t": "1° MEDIO F"
              },
              {
                "v": "1 G",
                "t": "1° MEDIO G"
              },
              {
                "v": "1 H",
                "t": "1° MEDIO H"
              },
              {
                "v": "2 A",
                "t": "2° MEDIO A"
              },
              {
                "v": "2 B",
                "t": "2° MEDIO B"
              },
              {
                "v": "2 C",
                "t": "2° MEDIO C"
              },
              {
                "v": "2 D",
                "t": "2° MEDIO D"
              },
              {
                "v": "2 E",
                "t": "2° MEDIO E"
              },
              {
                "v": "2 F",
                "t": "2° MEDIO F"
              },
              {
                "v": "2 G",
                "t": "2° MEDIO G"
              },
              {
                "v": "2 H",
                "t": "2° MEDIO H"
              },
              {
                "v": "3 A",
                "t": "3° MEDIO A"
              },
              {
                "v": "3 B",
                "t": "3° MEDIO B"
              },
              {
                "v": "3 C",
                "t": "3° MEDIO C"
              },
              {
                "v": "3 D",
                "t": "3° MEDIO D"
              },
              {
                "v": "3 E",
                "t": "3° MEDIO E"
              },
              {
                "v": "3 F",
                "t": "3° MEDIO F"
              },
              {
                "v": "3 G",
                "t": "3° MEDIO G"
              },
              {
                "v": "4 A",
                "t": "4° MEDIO A"
              },
              {
                "v": "4 B",
                "t": "4° MEDIO B"
              },
              {
                "v": "4 C",
                "t": "4° MEDIO C"
              },
              {
                "v": "4 D",
                "t": "4° MEDIO D"
              },
              {
                "v": "4 E",
                "t": "4° MEDIO E"
              },
              {
                "v": "4 F",
                "t": "4° MEDIO F"
              },
              {
                "v": "4 G",
                "t": "4° MEDIO G"
              },
              {
                "v": "4 H",
                "t": "4° MEDIO H"
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
              "ELECTRICIDAD",
              "MECÁNICA INDUSTRIAL",
              "CONSTRUCCIONES METÁLICAS",
              "MECÁNICA AUTOMOTRIZ",
              "SERVICIOS DE HOTELERÍA"
            ],
            "help": "Solo para 3° y 4° Medio. En 1° y 2° queda \"NO APLICA\"."
          },
          {
            "key": "asignaturaElectiva",
            "label": "Asignatura (3° y 4° Medio)",
            "type": "radio",
            "req": true,
            "cond": "electivo",
            "options": [
              "RELIGIÓN",
              "EDUCACIÓN FÍSICA"
            ],
            "help": "En 3° y 4° Medio se elige entre Religión y Educación Física."
          },
          {
            "key": "religion",
            "label": "Religión",
            "type": "select",
            "req": true,
            "bloq": "religion",
            "options": [
              "CATÓLICA",
              "EVANGÉLICA"
            ]
          }
        ]
      },
      {
        "titulo": "Procedencia del Estudiante",
        "campos": [
          {
            "key": "alumnoAntiguo",
            "label": "Soy alumno antiguo del Liceo Bicentenario Politécnico Cesáreo Aguirre Goyenechea",
            "type": "checkbox",
            "full": true
          },
          {
            "key": "escuelaCalama",
            "label": "Escuela de procedencia (Calama)",
            "type": "select",
            "req": true,
            "full": true,
            "cond": "escuelaCalama",
            "virtual": true,
            "options": [
              "COLEGIO ADVENTISTA DE CALAMA",
              "COLEGIO CALAMA",
              "COLEGIO ECOLÓGICO MONTESSORI",
              "COLEGIO EVANGÉLICO EJÉRCITO DE SALVACIÓN CATHERINE BOOTH",
              "COLEGIO JUAN PABLO II",
              "COLEGIO LEONARDO DA VINCI",
              "COLEGIO LICANCABUR",
              "COLEGIO LOESS SCHOOL",
              "COLEGIO NUESTRA SEÑORA DE AYQUINA",
              "COLEGIO PADRE ALBERTO HURTADO",
              "COLEGIO RÍO LOA",
              "COLEGIO SAN IGNACIO",
              "COLEGIO SAN NICOLÁS",
              "ESCUELA 21 DE MAYO",
              "ESCUELA ANDRÉS BELLO",
              "ESCUELA CLAUDIO ARRAU",
              "ESCUELA EMILIO SOTOMAYOR",
              "ESCUELA JOHN F. KENNEDY",
              "ESCUELA KAMAC MAYU",
              "ESCUELA PEDRO VERGARA KELLER",
              "ESCUELA PRESIDENTE BALMACEDA",
              "ESCUELA PUKARA",
              "ESCUELA REPÚBLICA DE BOLIVIA",
              "ESCUELA REPÚBLICA DE CHILE",
              "ESCUELA REPÚBLICA DE FRANCIA",
              "ESCUELA REPÚBLICA DE GRECIA",
              "ESCUELA SAN FRANCISCO",
              "ESCUELA SAN JOSÉ",
              "ESCUELA SEÑORA DE LA CANDELARIA",
              "ESCUELA VADO DE TOPATER",
              "ESCUELA VALENTÍN LETELIER",
              "INSTITUTO OBISPO SILVA LEZAETA",
              "OTROS"
            ],
            "help": "Si su escuela no aparece, elija OTROS."
          },
          {
            "key": "procedenciaEscuela",
            "label": "Escuela / colegio de procedencia",
            "type": "text",
            "req": true,
            "full": true,
            "cond": "procedencia"
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
            "label": "RUN o IPE (RUT provisorio)",
            "type": "rut",
            "req": true,
            "placeholder": "12345678-9",
            "help": "Sin puntos y con guion. Acepta RUT provisorio (IPE), ej: 100844317-K."
          },
          {
            "key": "genero",
            "label": "¿Con qué género te identificas?",
            "type": "select",
            "req": true,
            "options": [
              "MASCULINO",
              "FEMENINO",
              "OTRO"
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
            "def": "CHILE"
          },
          {
            "key": "nacionalidad",
            "label": "Nacionalidad",
            "type": "text",
            "req": true,
            "def": "CHILENA"
          },
          {
            "key": "etnia",
            "label": "Pueblo originario / Etnia",
            "type": "select",
            "req": true,
            "options": [
              "NINGUNA",
              "MAPUCHE",
              "AYMARA",
              "QUECHUA",
              "ATACAMEÑO (LICKANANTAY)",
              "DIAGUITA",
              "COLLA",
              "RAPA NUI",
              "OTRA"
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
          },
          {
            "key": "areaDomicilio",
            "label": "Ubicación del domicilio",
            "type": "radio",
            "req": true,
            "full": true,
            "options": [
              "DENTRO DEL ÁREA URBANA",
              "FUERA DEL ÁREA URBANA"
            ],
            "help": "Fuera del área urbana: sector rural, pueblos o localidades fuera de la ciudad."
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
            "key": "runApoderadoTitular",
            "label": "RUN del apoderado titular",
            "type": "rut",
            "req": true,
            "placeholder": "12345678-9",
            "help": "Sin puntos y con guion."
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
          },
          {
            "key": "profesionApoderado",
            "label": "Profesión u oficio del apoderado",
            "type": "text",
            "full": true
          }
        ]
      },
      {
        "titulo": "Apoderado Suplente",
        "copiar": {
          "id": "copiarSuplente",
          "label": "Mismos datos del apoderado titular",
          "pares": [
            [
              "nombreApoderadoTitular",
              "nombreApoderadoSuplente"
            ],
            [
              "runApoderadoTitular",
              "runApoderadoSuplente"
            ],
            [
              "correoApoderadoTitular",
              "correoApoderadoSuplente"
            ],
            [
              "fonoApoderadoTitular",
              "fonoApoderadoSuplente"
            ]
          ]
        },
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
            "key": "runApoderadoSuplente",
            "label": "RUN del apoderado suplente",
            "type": "rut",
            "req": true,
            "placeholder": "12345678-9",
            "help": "Sin puntos y con guion."
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
            "placeholder": "NO APLICA",
            "help": "Opcional. Si lo deja en blanco queda \"NO APLICA\"."
          },
          {
            "key": "profesionMadre",
            "label": "Profesión u oficio de la madre",
            "type": "text",
            "placeholder": "NO APLICA",
            "help": "Opcional. Si lo deja en blanco queda \"NO APLICA\"."
          },
          {
            "key": "personaConQuienVive",
            "label": "Persona con quien vive",
            "type": "select",
            "req": true,
            "options": [
              "AMBOS PADRES",
              "MADRE",
              "PADRE",
              "ABUELOS",
              "OTRO FAMILIAR",
              "OTRO"
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
              "PROPIO",
              "ARRENDADO",
              "OTROS"
            ]
          },
          {
            "key": "situacionEconomica",
            "label": "Situación económica (ingreso familiar)",
            "type": "select",
            "req": true,
            "full": true,
            "options": [
              "ALTA(+ $900.000)",
              "MEDIA-ALTA($701.000 - $900.000)",
              "MEDIA($501.000 - $700.000)",
              "MEDIA-BAJA($301.000 - $500.000)",
              "BAJA(- $300.000)"
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
              "SÍ",
              "NO"
            ]
          },
          {
            "key": "beneficioJunaeb",
            "label": "¿Beneficio JUNAEB?",
            "type": "select",
            "req": true,
            "options": [
              "SÍ",
              "NO"
            ]
          },
          {
            "key": "chileSolidario",
            "label": "¿Chile Solidario?",
            "type": "select",
            "req": true,
            "options": [
              "SÍ",
              "NO"
            ]
          },
          {
            "key": "becaIndigena",
            "label": "¿Beca Indígena?",
            "type": "select",
            "req": true,
            "options": [
              "SÍ",
              "NO"
            ]
          },
          {
            "key": "pie",
            "label": "¿Pertenece al PIE (Programa de Integración Escolar)?",
            "type": "select",
            "req": true,
            "options": [
              "SÍ",
              "NO"
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
              "OTRO"
            ]
          },
          {
            "key": "tramoFonasa",
            "label": "Tramo FONASA",
            "type": "select",
            "req": true,
            "cond": "fonasa",
            "options": [
              {
                "v": "A",
                "t": "TRAMO A"
              },
              {
                "v": "B",
                "t": "TRAMO B"
              },
              {
                "v": "C",
                "t": "TRAMO C"
              },
              {
                "v": "D",
                "t": "TRAMO D"
              }
            ],
            "help": "Puede consultarlo en fonasa.gob.cl o en el certificado de afiliación."
          },
          {
            "key": "isapre",
            "label": "Isapre",
            "type": "select",
            "req": true,
            "cond": "isapre",
            "options": [
              "BANMÉDICA",
              "COLMENA",
              "CONSALUD",
              "CRUZBLANCA",
              "ESENCIAL",
              "NUEVA MASVIDA",
              "VIDA TRES",
              "CRUZ DEL NORTE",
              "FUNDACIÓN (BANCOESTADO)",
              "ISALUD",
              "OTROS"
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
        "copiar": {
          "id": "copiarEmergencia",
          "label": "Usar datos del apoderado titular (nombre y teléfono)",
          "pares": [
            [
              "nombreApoderadoTitular",
              "contactoEmergencia"
            ],
            [
              "fonoApoderadoTitular",
              "telefonoEmergencia"
            ]
          ]
        },
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
      }
    ]
  }
];
