# Organizador: calendario, tareas y tablero

Fecha: 2026-10-25
Estado: listo para aprobación

## Para qué es

Es una app personal de escritorio para Windows que usa una sola persona en una sola compu. Junta tres cosas que hoy el usuario lleva de memoria:

1. **Calendario**, para anotar fechas importantes, sobre todo parciales.
2. **Tareas recurrentes del trabajo**, por ejemplo las precargas diarias de videos e imágenes en las "granjas" (servidores). Cada tarea es una serie de pasos que mezclan comandos, scripts y manejo de archivos. El usuario necesita la lista de pasos "hasta que se los acuerde" y una forma de tildar lo que ya hizo.
3. **Tablero kanban** para pendientes de una sola vez que le asignan en el trabajo.

La app se abre sola al iniciar Windows y muestra el calendario.

Éxito: el usuario la usa todos los días en el trabajo en lugar de acordarse de memoria, y configura sus tareas y pasos sin tocar código.

## Objetivos

- Ver el mes actual, navegar entre meses y anotar eventos en un día.
- Definir tareas con pasos configurables. Cada paso tiene un texto y, opcionalmente, un comando o ruta que se copia con un clic.
- Tildar pasos y ver el progreso de cada tarea ("2 de 4").
- Configurar cada cuánto se repite una tarea.
- Llevar pendientes sueltos en un tablero de tres columnas.
- Abrir automáticamente al iniciar Windows.

## Fuera de alcance por ahora

Se puede sumar más adelante:

- Notificaciones o avisos de eventos próximos.
- Sincronización, cuentas, nube o uso desde el celular.
- Ejecutar los comandos desde la app. La app solo los muestra y los copia.
- Pasos, fechas límite o etiquetas en las tarjetas del tablero.

## Anti-objetivos

La app fracasa aunque "funcione" si:

- Configurar una tarea o un paso exige editar un archivo o código.
- Copiar un comando no copia exactamente el texto, por ejemplo si se pierden barras invertidas, comillas o espacios.
- Se pierden datos al cerrar la app o reiniciar la compu.
- Abrirla al iniciar Windows es lento o molesto.

## Restricciones

- Windows 11. Un solo usuario. Funciona sin internet.
- El usuario confirmó que la compu permite instalar un `.exe` y que los programas arranquen con Windows, así que se usa instalador.
- Los datos se guardan solo en la compu del usuario.
- El diseño visual sigue el archivo de Figma "Calendario Organizador" (fileKey `kStWVTiaoYaGv9F8jafbG2`, frame `calendario`, nodo `3:3`).

## Decisiones del usuario

- **Tecnología**: Electron, aceptada con la propuesta "Electron + datos en un archivo local + instalador .exe".
- **Navegación**: panel lateral con tres secciones, **Calendario**, **Tareas** y **Tablero**. Al abrir se muestra Calendario.
- **Tareas**:
  - Al hacer clic en el título se despliegan o pliegan sus pasos.
  - Cada paso tiene una casilla para tildar.
  - Cada paso puede tener un bloque de comando o ruta con botón de copiar.
  - Se muestra el progreso "N de M" y se marca en verde cuando la tarea está completa.
  - La repetición es configurable por tarea. No todas son diarias.
  - Las casillas de las tareas recurrentes se reinician solas en cada nueva aparición.
- **Tablero**: tarjetas con título y descripción opcional, en tres columnas (Por hacer, En curso, Hecho), y se mueven arrastrando.
- **Notificaciones**: ninguna por ahora.

## Decisiones de Claude (a revisar)

- **Opciones de repetición** (definidas por el usuario: "de lunes a viernes, un día específico o una fecha específica", modificable por tarea):
  - **Días de la semana**: el usuario elige cualquier combinación de días. "Todos los días", "lunes a viernes" y "solo los martes" son casos de esta misma opción. Para los primeros dos hay accesos rápidos.
  - **Fecha específica**: la tarea aparece solo ese día. Se interpretó como fecha única, no como "el 5 de cada mes", y está pendiente de confirmar.
  - La pantalla Tareas muestra solo las tareas que corresponden al día de hoy.
- **Reinicio diario**: el estado de las casillas se guarda por fecha. Una tarea de hoy arranca sin tildar aunque ayer se haya completado. No se guarda historial visible.
- **Eventos del calendario**: cada evento tiene título y tipo. Los tipos son Parcial (rojo), Entrega (azul) y Recordatorio (ámbar), igual que las variantes de la lección 4 de Figma. La hora es opcional.
  - Para crear un evento se hace clic en un día y se abre un formulario chico.
  - Para editarlo o borrarlo se hace clic sobre el evento.
  - Si un día tiene más eventos de los que entran, se muestra "+N más".
- **Edición de tareas**: con el ícono de lápiz se abre un editor con nombre, repetición y lista de pasos. Los pasos se pueden agregar, borrar y reordenar, y cada uno tiene un texto y un comando opcional. Una tarea se puede eliminar.
- **Hoy**: la celda del día actual lleva borde azul `#2563EB` de 2 px, como en el diseño.
- **Inicio con Windows**: activado por defecto, con un interruptor para desactivarlo en un apartado de ajustes simple.
- **Ventana**: una sola instancia. Si ya está abierta, se trae al frente. El tamaño inicial es de 1280×800 y se puede redimensionar.
- **Almacenamiento**: un archivo JSON en la carpeta de datos de la app (`%APPDATA%`). Se escribe de forma segura (archivo temporal y después renombrado) para no corromperlo si se corta la luz.

- **Cambio de día**: el día se reinicia a medianoche, hora local. Una tarea que quedó sin terminar ayer no se arrastra ni se marca como atrasada: hoy arranca de cero. Si la app está abierta al pasar la medianoche, la vista se actualiza sola.
- **Ver todas las tareas**: la pantalla Tareas muestra las de hoy por defecto. Un selector "Hoy / Todas" permite ver y editar también las que no corresponden al día.
- **Comandos de varias líneas**: el bloque de comando acepta texto multilínea. Se copia exacto, sin modificar barras, comillas, espacios ni saltos de línea. Se muestra en fuente monoespaciada y respeta los saltos de línea. Cada paso tiene como mucho un bloque. No hay variables como `{fecha}`: si un comando cambia, el usuario lo edita a mano (decisión del usuario).
- **Cerrar la ventana**: cierra la app. No hay ícono en la bandeja del sistema.

## Referencia visual

Diseño ya revisado en Figma: no hace falta volver a consultarlo.

- Ventana de 1280×800. Sidebar de 220 px con fondo `#1F2937`, padding 24 y gap 8. Título "Organizador" de 20 px en bold blanco. Ítems de navegación de 14 px con padding 8/12 y radio 6; el activo lleva fondo `#374151`.
- Contenido con fondo `#F9FAFB` y padding 40. Título del mes de 28 px en bold `#111827`. Gap de 24 entre el título y el bloque del mes.
- Encabezados de los días (Lun a Dom, la semana empieza el lunes) de 12 px `#6B7280`, con gap 8 respecto de la grilla.
- Grilla de 7 columnas con gap 8 y filas que llenan el alto disponible.
- Celda: fondo blanco, borde de 1 px `#E5E7EB`, radio 8, padding 8 y gap 4. Número de 14 px `#111827`. Los días de otros meses van en `#9CA3AF`. Hoy lleva borde de 2 px `#2563EB`.
- Evento: 12 px, peso medium, padding 2/6, radio 4, ancho completo y texto truncado con "…". Colores por tipo:
  - Parcial: fondo `#FEE2E2`, texto `#B91C1C`.
  - Entrega: fondo `#DBEAFE`, texto `#1D4ED8`.
  - Recordatorio: fondo `#FEF3C7`, texto `#B45309`.

## Qué queda a criterio del implementador

- Framework de interfaz (por ejemplo React o JS plano), herramienta de build y empaquetado del instalador.
- Estructura interna del archivo de datos, siempre que admita migraciones simples.
- Diseño de las pantallas de Tareas y Tablero, que no existen en Figma. Deben respetar el estilo del calendario: sidebar `#1F2937`, sección activa `#374151`, fondo de contenido `#F9FAFB`, tarjetas blancas con borde `#E5E7EB` y radio 8.
- Pruebas automáticas para la lógica de repetición, el reinicio diario y la persistencia.
