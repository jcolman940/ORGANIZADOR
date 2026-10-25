# Organizador

App de escritorio para Windows que junta en un solo lugar un calendario, tus tareas recurrentes y un tablero de pendientes. Se abre sola al prender la compu y guarda todo en tu equipo, sin cuentas ni internet.

## Qué podés hacer

- **Calendario**: vista mensual para anotar parciales, entregas y recordatorios, cada tipo con su color. El día de hoy aparece resaltado.
- **Tareas**: tareas que se repiten todos los días, algunos días de la semana o en una fecha puntual.
  - Cada tarea se despliega en una lista de pasos con casillas para tildar, y el progreso se ve a simple vista ("2 de 4").
  - Los pasos pueden tener un comando o una ruta que se copia exacta con un clic.
  - Las casillas se reinician solas cada día.
- **Tablero**: pendientes de una sola vez en tres columnas (Por hacer, En curso y Hecho). Las tarjetas se mueven arrastrándolas.
- **Arranque con Windows**: viene activado y se puede desactivar en Ajustes.

## Instalación

1. Descargá `Organizador-Setup-<versión>.exe` desde la [última versión](https://github.com/jcolman940/ORGANIZADOR/releases/latest).
2. Ejecutalo. Como el instalador no está firmado digitalmente, Windows puede mostrar **"Windows protegió su PC"**. Tocá **Más información** y después **Ejecutar de todas formas**.
3. Seguí el asistente. No hace falta ser administrador.

Tus datos quedan en `%APPDATA%\Organizador\data.json`. Para pasarlos a otra compu, copiá ese archivo.

## Desarrollo

Requisitos: [Node.js](https://nodejs.org/) 24 o superior y Windows.

```bash
npm install
npm run dev        # abre la app en modo desarrollo (con datos aparte, en %APPDATA%\Organizador-dev)
npm test           # corre los tests
npm run typecheck  # chequeo de tipos
npm run dist       # genera el instalador en dist/
```

Hecha con Electron, React y TypeScript. Los tests usan Vitest y Testing Library, y el instalador se genera con electron-builder.

| Carpeta | Contenido |
|---|---|
| `src/shared` | Lógica pura: fechas, repetición de tareas y operaciones sobre los datos |
| `src/main` | Proceso principal de Electron: ventana, guardado en disco y arranque con Windows |
| `src/preload` | Puente seguro entre la interfaz y el proceso principal |
| `src/renderer` | Interfaz en React |
| `tests` | Tests de todo lo anterior |
| `docs` | Documento de diseño y plan de implementación |
