# Sistema de Pre-Matrícula 2027 — versión GitHub Pages

Liceo Bicentenario Politécnico "Cesáreo Aguirre Goyenechea"

## Cómo funciona ahora

| Parte | Dónde vive | Qué hace |
|---|---|---|
| Página, formulario, panel, estilos, logo | **GitHub Pages** (este repositorio) | Carga al instante: son archivos estáticos |
| Validación, usuarios, permisos, correo | **Google Apps Script** (carpeta `apps-script/`) | Funciona solo como API: recibe y devuelve datos |
| Base de datos | **Google Sheets** (la misma planilla de siempre) | Hoja `Matriculas2027` + Usuarios, Eliminados y Bitácora |

Por qué es más rápido:

- La página ya no la arma Apps Script cada vez, así que abre de inmediato.
- Enviar el formulario solo guarda la fila y manda un correo corto, sin PDF. Toma 2 a 3 segundos en vez de 15 o más.
- El panel descarga todos los registros **una sola vez**. Buscar, filtrar, ver una ficha, imprimir, sacar el PDF y exportar se hacen en el navegador, sin esperar al servidor.
- Al editar o asignar una letra, solo se guarda ese cambio; no se vuelve a cargar todo.

---

## Instalación (una sola vez)

### 1. Actualizar Apps Script

1. Abra su proyecto en <https://script.google.com>.
2. **Reemplace** el contenido de estos archivos por los de la carpeta `apps-script/`:
   `Config`, `Codigo`, `Auth`, `Panel`, `Email`, `Setup`.
3. **Borre** los archivos que ya no se usan: `Index`, `Estilos`, `App`, `Logo` y `Ficha`.
4. En `Config.gs` revise:
   - `SPREADSHEET_ID`: la misma planilla de siempre (ya viene puesta).
   - `URL_SITIO`: `https://scannb9-byte.github.io/formulario-matricula` (sin barra al final).
5. Seleccione la función **`configurarSistema`** y presione ▶ **Ejecutar**. Esto:
   - agrega la columna nueva **`letra`** al final de la hoja (los datos existentes no se tocan);
   - pone las listas desplegables de *estado* y *letra*, y el formato de las fechas;
   - mantiene los usuarios que ya existen. Si la hoja Usuarios está vacía, crea `admin` con una **contraseña al azar** que aparece en el *Registro de ejecución*. Anótela.
6. **Implementar → Gestionar implementaciones → ✏️ Editar → Versión: Nueva versión → Implementar.**
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
   - La URL `/exec` sigue siendo la misma. Cópiela.

> Si olvidó la contraseña de `admin`, ejecute la función **`restablecerAdmin`**: la nueva clave aparece en el registro.

### 2. Conectar el sitio con Apps Script

Abra `js/config.js` y pegue la URL `/exec`:

```js
const API_URL = 'https://script.google.com/macros/s/XXXXXXXX/exec';
```

### 3. Publicar en GitHub Pages

1. En el repositorio **scannb9-byte/formulario-matricula**: *Add file → Upload files*. Arrastre **todo el contenido** de esta carpeta (`index.html`, `css/`, `js/`, `img/`, `apps-script/`, `README.md`, `.nojekyll`) y confirme con *Commit changes*.
   Si el repositorio ya tenía un `index.html` anterior, este lo reemplaza.
2. *Settings → Pages → Build and deployment*: **Deploy from a branch**, rama `main`, carpeta `/ (root)` → *Save*.
3. Después de 1 o 2 minutos el sitio queda en:
   **https://scannb9-byte.github.io/formulario-matricula/**

Enlaces útiles:

- Portal: `https://scannb9-byte.github.io/formulario-matricula/`
- Formulario directo para apoderados: `…/formulario-matricula/?p=form`
- Acceso del personal: `…/formulario-matricula/?p=login`

Quien abra la URL antigua `/exec` es redirigido automáticamente al sitio nuevo.

---

## Uso del panel

### Asignar la letra del curso (1° Medio A, B, C…)

El apoderado elige solo el nivel (1°, 2°, 3° o 4° Medio). El personal con permiso de **edición** asigna después la letra (**A a la H**):

- **Una a una:** en la columna **Curso** de la tabla, elija la letra en el selector junto al nivel. Se guarda de inmediato.
- **Varias a la vez:**
  1. Filtre, por ejemplo, *1° Medio* y *Sin letra*.
  2. Marque las casillas, o la casilla del encabezado para seleccionar **todos los filtrados**.
  3. En la barra azul elija la letra y presione **Asignar letra**.
- **Desde Editar:** el formulario de edición tiene el campo *Letra del curso*. Ahí también se puede cambiar el **nivel** (por ejemplo, de 1° a 2° Medio).

La tarjeta **Por curso y letra** muestra cuántos estudiantes hay en cada curso (1° Medio A, 1° Medio B…). Al hacer clic en una barra se filtra la tabla. La tarjeta **Sin letra asignada** indica cuántos faltan.

### Imprimir

| Botón | Qué imprime |
|---|---|
| 🖨️ en una fila | Ficha completa de ese estudiante (anverso y reverso, tamaño oficio) |
| **Imprimir fichas** (barra de selección) | Todas las fichas seleccionadas en un solo trabajo de impresión |
| **Imprimir listado** | Nómina de lo que está filtrado (ej. *Nómina 1° Medio B 2027*), con columna para firma |
| **Ficha en blanco** | Ficha vacía para llenar a mano |

Para las fichas, en el diálogo de impresión elija papel **Oficio / Legal 8,5×13**, márgenes **predeterminados**, active **Gráficos de fondo** e **Imprimir a doble cara → voltear por el borde largo**.

### PDF

- **PDF** en una fila: descarga la ficha de ese estudiante en PDF (2 páginas, oficio).
- **PDF** en la barra de selección: un solo PDF con hasta 40 fichas. Para más, use *Imprimir fichas → Guardar como PDF*.

El PDF se genera en el computador de quien lo pide, así que no consume tiempo del servidor.

### Otros

- **Exportar** descarga a Excel (CSV) lo que está filtrado. Incluye la letra y una columna `cursoCompleto` (ej. *1° Medio B*).
- **Actualizar** vuelve a traer los datos de la planilla, por ejemplo para ver lo que otro funcionario cambió.
- El correo al apoderado ahora es solo una **confirmación sin PDF**. El botón ✉️ lo reenvía.

---

## Cambios en el formulario

El formulario está definido en **dos lugares** que deben coincidir:

- `js/esquema.js`: lo que ve el navegador.
- `apps-script/Config.gs` → `esquemaFormulario_()`: lo que valida el servidor.

Si agrega una opción (por ejemplo, una especialidad nueva), agréguela en ambos. Luego suba el archivo a GitHub y publique una nueva versión en Apps Script.

Para abrir o cerrar el formulario público use `FORMULARIO_ABIERTO` en `Config.gs` (y publique una nueva versión). El sitio lo detecta solo.

## Seguridad

- El repositorio es público (GitHub Pages gratuito lo requiere). No contiene contraseñas: solo el ID de la planilla, que sin permisos de Google no da acceso.
- La planilla debe seguir **privada**. Solo Apps Script (que se ejecuta como usted) la lee y la escribe.
- Las contraseñas se guardan cifradas (SHA-256 con sal). Tras 5 intentos fallidos el usuario se bloquea 15 minutos. La sesión dura 6 horas.
- Cada cambio queda anotado en la hoja **Bitacora**. Los registros eliminados se mueven a **Eliminados**.
