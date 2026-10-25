# Calendario + Organizador de tareas

App personal de escritorio para Windows, hecha con Electron, React y TypeScript. Diseño: docs/superpowers/specs/2026-10-25-organizador-design.md.

## Objetivo

Una sola app con dos secciones:

1. **Calendario básico**: anotar eventos importantes, sobre todo fechas de parciales.
2. **Organizador de tareas del trabajo**: lista de tareas (algunas diarias). Al hacer clic en una tarea se despliega una serie de pasos. Varios pasos incluyen código o comandos para copiar, así que los bloques de código tienen que verse bien y poder copiarse fácil.

Requisito: la app se abre sola al iniciar Windows.

## Tareas de ejemplo (diarias)

- Script cinturón celular
- Script para pasar de las granjas a capturas clasificadas cargar
- Precargar ambos en el sistema
- Precargar radar
- Controlar granjas

Los pasos de cada tarea todavía no están definidos; hay que pedírselos al usuario.

## Forma de trabajo

- **Primero el diseño en Figma, después el código.** El proyecto también sirve para que el usuario aprenda Figma, así que conviene explicar qué se hace en Figma y por qué, no solo hacerlo.
- Figma se conecta con el plugin oficial `figma@claude-plugins-official` (instalado a nivel de usuario). El servidor MCP de Figma necesita autorización OAuth con la cuenta del usuario.
- Cuenta de Figma: plan Starter (gratuito), asiento "View". La documentación de Figma limita el MCP a unas pocas llamadas por mes para ese plan, así que las llamadas al MCP se usan con cuidado: el usuario diseña a mano con guía y el MCP se reserva para revisar el diseño y pasarlo a código. Límites: https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/
- El usuario escribe en español rioplatense; responder en español.

## Comandos

- `npm run dev`: abre la app en modo desarrollo. Usa la carpeta de datos `%APPDATA%\Organizador-dev`, separada de la real.
- `npm test`: corre los tests (Vitest).
- `npm run typecheck`: chequeo de tipos.
- `npm run dist`: genera el instalador en `dist/Organizador Setup <versión>.exe`.

## Arquitectura

- `src/shared`: lógica pura (fechas, repetición, operaciones sobre los datos), testeada sin Electron.
- `src/main`: ventana, guardado en `%APPDATA%\Organizador\data.json` (cola, fsync y rename atómico), flush antes de cerrar, arranque con Windows.
- `src/renderer`: interfaz en React. Los estilos y colores del diseño de Figma están en `styles.css`.

## Pendiente

- Pantallas de Tareas y Tablero en Figma (se programaron sin diseño, siguiendo el estilo del calendario).
- Notificaciones de eventos próximos.
