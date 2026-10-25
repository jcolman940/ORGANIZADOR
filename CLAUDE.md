# Calendario + Organizador de tareas

App personal de escritorio para Windows. Todavía no hay código: estamos en la etapa de diseño de la interfaz en Figma.

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
- El stack de la app (Electron, Tauri, etc.) todavía no está decidido.
- El usuario escribe en español rioplatense; responder en español.

## Próximos pasos

1. Verificar que las herramientas MCP de Figma respondan (cuenta autorizada).
2. Crear el archivo de Figma del proyecto y diseñar las pantallas: vista de calendario, lista de tareas y tarea desplegada con pasos y bloques de código.
3. Recién con el diseño aprobado, elegir el stack e implementar, incluido el inicio automático con Windows.
