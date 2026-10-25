# Organizador: plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** construir una app de escritorio para Windows con tres secciones: Calendario con eventos, Tareas recurrentes con pasos tildables y Tablero kanban. Los datos se guardan en un archivo local y la app arranca con Windows.

**Architecture:** la app es Electron con tres capas:

- **main** (`src/main`): crea la ventana, resuelve la instancia única y el arranque con Windows, y guarda los datos en JSON de forma atómica.
- **preload** (`src/preload`): expone una API mínima por `contextBridge`.
- **renderer** (`src/renderer`): la interfaz en React.

La lógica pura (fechas, repetición, grilla del mes y operaciones sobre los datos) vive en `src/shared` y se testea con Vitest sin Electron.

**Tech Stack:**

- Electron, electron-vite, React 18, TypeScript y Vitest.
- `@testing-library/react` sobre jsdom para los componentes.
- electron-builder, que genera un instalador NSIS.
- Ninguna dependencia de terceros para drag & drop: se usa la API nativa HTML5.

**Spec:** `docs/superpowers/specs/2026-10-25-organizador-design.md`

## Global Constraints

- Windows 11, un usuario, sin internet. Los datos se guardan solo en `app.getPath('userData')/data.json`.
- La interfaz está en español, con estos textos exactos:
  - Secciones: "Calendario", "Tareas", "Tablero".
  - Columnas del tablero: "Por hacer", "En curso", "Hecho".
  - Tipos de evento: "Parcial", "Entrega", "Recordatorio".
- La semana empieza el lunes. Los encabezados son "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom".
- Todas las fechas se manejan como claves locales `YYYY-MM-DD`. Nunca se usa `toISOString()` para obtener el día, porque en UTC-3 cambia de fecha a la noche.
- Colores y medidas: los de la sección "Referencia visual" del spec, centralizados como variables CSS en `src/renderer/styles.css`.
- La ventana inicial mide 1280×800 y se puede redimensionar. Corre una sola instancia, y al cerrar la ventana se cierra la app (no hay bandeja del sistema).
- El texto de los comandos se copia byte a byte, sin `trim` ni normalizar saltos de línea.
- Cada tarea es un commit. El repo se inicializa en la Task 1.

## Review Focus

1. **Comando con `\`, comillas, espacios al final y varias líneas con CRLF.** Se tiene que copiar exactamente igual. Test en la Task 6 (`copia el comando exacto`).
2. **`data.json` corrupto o ilegible.** La app arranca con datos vacíos, renombra el archivo dañado a `data.corrupt-<timestamp>.json` y no lo pisa. Test en la Task 3.
3. **Borrar o editar un paso que estaba tildado hoy.** El progreso cuenta solo los pasos que existen: nunca "3 de 2". Test en la Task 4 (`progress ignora pasos borrados`).
4. **Uso de noche, a las 22:30 o 23:59 hora local.** `dateKey` devuelve el día local, no el UTC. Test en la Task 2.
5. **Mes que necesita 6 filas (noviembre de 2026 empieza en domingo).** La grilla muestra todos los días del mes. Test en la Task 2.

---

### Task 1: Esqueleto del proyecto

**Files:**
- Create: `package.json`, `electron.vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `tsconfig.web.json`, `vitest.config.ts`, `.gitignore`
- Create: `src/main/index.ts`, `src/preload/index.ts`, `src/renderer/index.html`, `src/renderer/main.tsx`, `src/renderer/App.tsx`
- Test: `tests/smoke.test.ts`

**Interfaces:**
- Produces:
  - Scripts de npm: `dev` (`electron-vite dev`), `build` (`electron-vite build`), `test` (`vitest run`) y `dist` (`electron-vite build && electron-builder --win`).
  - Alias `@shared` → `src/shared`, configurado en Vite, Vitest y tsconfig.

- [ ] **Step 1:** ejecutar `git init` y crear el `.gitignore` con `node_modules/`, `out/` y `dist/`.
- [ ] **Step 2:** instalar las versiones estables actuales.
  - Dependencias de desarrollo: `electron`, `electron-vite`, `electron-builder`, `vite`, `@vitejs/plugin-react`, `typescript`, `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@types/react` y `@types/react-dom`.
  - Dependencias: `react` y `react-dom`.
- [ ] **Step 3:** escribir `tests/smoke.test.ts` con `expect(1 + 1).toBe(2)`. Configurar Vitest con `environment: 'jsdom'` para `tests/renderer/**` y `node` para el resto (con `environmentMatchGlobs` o con una línea `// @vitest-environment` por archivo).
- [ ] **Step 4:** ejecutar `npm test`. Esperado: 1 test PASS.
- [ ] **Step 5:** crear el `main` mínimo y verificar que arranca.
  - `BrowserWindow` de 1280×800, título "Organizador", `contextIsolation: true`, `nodeIntegration: false` y el preload configurado.
  - `App.tsx` renderiza `<h1>Organizador</h1>`.
  - Verificar con `npm run dev`: se abre la ventana con ese texto.
- [ ] **Step 6:** commit `chore: esqueleto Electron + React + Vitest`.

---

### Task 2: Modelo de datos y fechas

**Files:**
- Create: `src/shared/types.ts`, `src/shared/dates.ts`, `src/shared/recurrence.ts`
- Test: `tests/shared/dates.test.ts`, `tests/shared/recurrence.test.ts`

**Interfaces:**
- Produces, en `types.ts`:
```ts
export type EventType = 'parcial' | 'entrega' | 'recordatorio'
export interface CalendarEvent { id: string; date: string; title: string; type: EventType; time?: string } // date 'YYYY-MM-DD', time 'HH:MM'
export type Recurrence = { kind: 'weekdays'; days: number[] } | { kind: 'date'; date: string } // days: 0=Lun … 6=Dom
export interface Step { id: string; text: string; command?: string }
export interface Task { id: string; name: string; recurrence: Recurrence; steps: Step[] }
export type Column = 'todo' | 'doing' | 'done'
export interface BoardCard { id: string; title: string; description?: string; column: Column }
export interface AppData { version: 1; events: CalendarEvent[]; tasks: Task[]; checks: Record<string, Record<string, string[]>>; board: BoardCard[] }
// checks[dateKey][taskId] = ids de pasos tildados ese día
export const emptyData: AppData
```
- Produces, en `dates.ts`:
  - `dateKey(d: Date): string`, con la fecha local.
  - `fromKey(k: string): Date`, que devuelve la fecha a las 00:00 locales.
  - `weekdayMon0(d: Date): number`, con lunes = 0.
  - `monthGrid(year: number, month0: number): { key: string; day: number; inMonth: boolean }[]`. Devuelve semanas completas de lunes a domingo, con `filas = ceil((offset + díasDelMes) / 7)`.
  - `msUntilNextMidnight(now: Date): number`.
- Produces, en `recurrence.ts`:
  - `isDueOn(r: Recurrence, key: string): boolean`.
  - `WEEKDAYS_ALL = [0,1,2,3,4,5,6]`.
  - `WEEKDAYS_WORK = [0,1,2,3,4]`.

- [ ] **Step 1: tests que fallan.**
  - `dateKey(new Date(2026, 9, 25, 22, 30))` → `'2026-10-25'`.
  - `dateKey(new Date(2026, 9, 25, 23, 59))` → `'2026-10-25'`.
  - `weekdayMon0(new Date(2026, 9, 1))` → `3`, porque es jueves.
  - `monthGrid(2026, 9)`:
    - Tiene largo 35.
    - El primer elemento es `{ key: '2026-09-28', day: 28, inMonth: false }`.
    - El elemento `[3]` es `{ key: '2026-10-01', day: 1, inMonth: true }`.
    - El último es `{ key: '2026-11-01', inMonth: false }`.
  - `monthGrid(2026, 10)`:
    - Tiene largo 42.
    - El elemento `[6].key` es `'2026-11-01'`.
    - Hay exactamente 30 elementos con `inMonth` en `true`.
  - `msUntilNextMidnight(new Date(2026, 9, 25, 23, 59, 0))` → `60000`.
  - `isDueOn({ kind: 'weekdays', days: WEEKDAYS_WORK }, ...)`:
    - Con `'2026-10-23'` (viernes) → `true`.
    - Con `'2026-10-24'` (sábado) → `false`.
  - `isDueOn({ kind: 'weekdays', days: [1] }, '2026-10-27')` → `true`, porque es martes.
  - `isDueOn({ kind: 'date', date: '2026-11-03' }, ...)`:
    - Con `'2026-11-03'` → `true`.
    - Con `'2026-11-10'` → `false`.
- [ ] **Step 2:** ejecutar `npm test`. Esperado: FAIL porque los módulos no existen.
- [ ] **Step 3:** implementar los tres archivos. Para `dateKey` usar `getFullYear`, `getMonth` y `getDate` con padding.
- [ ] **Step 4:** ejecutar `npm test`. Esperado: PASS.
- [ ] **Step 5:** commit `feat: modelo de datos, fechas y repetición`.

---

### Task 3: Persistencia en main + API de preload

**Files:**
- Create: `src/main/storage.ts`, `src/main/ipc.ts`, `src/renderer/env.d.ts`
- Modify: `src/main/index.ts`, `src/preload/index.ts`
- Test: `tests/main/storage.test.ts`

**Interfaces:**
- Consumes: `AppData`, `emptyData` y `dateKey` de la Task 2.
- Produces, en `storage.ts`:
  - `loadData(file: string, today: string): Promise<{ data: AppData; firstRun: boolean }>`.
  - `saveData(file: string, data: AppData): Promise<void>`.
- Produces, en preload: `window.api` con estas funciones:
  - `load(): Promise<AppData>`
  - `save(data: AppData): Promise<void>`
  - `getAutoStart(): Promise<boolean>`
  - `setAutoStart(on: boolean): Promise<void>`

  Los tipos se declaran en `src/renderer/env.d.ts`. Los canales IPC son `data:load`, `data:save`, `autostart:get` y `autostart:set`.

- [ ] **Step 1: tests que fallan.** Usan un directorio temporal de `fs.mkdtemp`.
  - **No existe el archivo:** `loadData` devuelve `{ data: emptyData, firstRun: true }`.
  - **Guardar y recargar:** `saveData` seguido de `loadData` devuelve los mismos `events`, `tasks` y `board`, y `firstRun: false`.
  - **Escritura atómica:** después de `saveData` no queda ningún `*.tmp` en el directorio.
  - **Archivo corrupto:** si `data.json` contiene `{nope`, `loadData` devuelve `emptyData` y en el directorio aparece un archivo `data.corrupt-*.json` con el contenido original.
  - **Poda de checks:** si `checks` tiene `'2026-10-20'` y `'2026-10-25'` y `today = '2026-10-25'`, después de cargar queda solo la clave `'2026-10-25'`.
  - **Campos faltantes:** si al archivo le falta `board`, se carga con `board: []`. Es una migración por defaults y deja `version: 1`.
- [ ] **Step 2:** ejecutar `npm test -- storage`. Esperado: FAIL.
- [ ] **Step 3:** implementar `storage.ts`.
  - `saveData` escribe `file + '.tmp'` y después hace `fs.rename` sobre `file`.
  - `loadData` hace `JSON.parse` dentro de `try`. Si falla, ejecuta `rename` al nombre `.corrupt-<Date.now()>.json`.
- [ ] **Step 4:** ejecutar `npm test`. Esperado: PASS.
- [ ] **Step 5:** conectar el IPC.
  - `ipc.ts` registra los handlers con `file = path.join(app.getPath('userData'), 'data.json')`.
  - Para `autostart:get` y `autostart:set` usa `app.getLoginItemSettings().openAtLogin` y `app.setLoginItemSettings({ openAtLogin })`.
  - Si `firstRun && app.isPackaged`, ejecuta `setLoginItemSettings({ openAtLogin: true })`.
  - El preload expone `window.api` con `ipcRenderer.invoke`.
- [ ] **Step 6:** verificar.
  - Ejecutar `npm run dev`. En la consola del renderer, `await window.api.load()` devuelve un objeto con `version: 1`.
  - Ejecutar `npm run build`. Esperado: compila sin errores de tipos.
- [ ] **Step 7:** commit `feat: persistencia JSON atómica e IPC`.

---

### Task 4: Operaciones sobre los datos + hook de estado

**Files:**
- Create: `src/shared/ops.ts`, `src/renderer/state/useAppData.ts`, `src/renderer/state/useToday.ts`
- Test: `tests/shared/ops.test.ts`

**Interfaces:**
- Consumes: los tipos y `isDueOn` de la Task 2, y `window.api` de la Task 3.
- Produces, en `ops.ts`: funciones puras que no mutan la entrada y devuelven un `AppData` nuevo.
  - `newId(): string`, que usa `crypto.randomUUID()`.
  - `upsertEvent(d, e: CalendarEvent)` y `deleteEvent(d, id)`.
  - `eventsOn(d, key): CalendarEvent[]`, ordenados por `time`, con los que no tienen hora al final.
  - `upsertTask(d, t: Task)` y `deleteTask(d, id)`. Borrar una tarea también limpia sus checks.
  - `tasksDueOn(d, key): Task[]`.
  - `toggleStep(d, key, taskId, stepId)`.
  - `progress(d, key, task): { done: number; total: number }`.
  - `upsertCard(d, c: BoardCard)`, `deleteCard(d, id)` y `moveCard(d, id, column: Column)`. `moveCard` deja la tarjeta al final de la columna destino.
- Produces, en `useAppData.ts`: `useAppData(): { data: AppData | null; update: (fn: (d: AppData) => AppData) => void }`.
  - Carga con `window.api.load()` al montar.
  - `update` aplica `fn` y guarda con debounce de 300 ms.
  - Antes de cerrar, en `beforeunload`, hace un `save` inmediato.
- Produces, en `useToday.ts`: `useToday(): string`.
  - Devuelve el `dateKey` de hoy.
  - Se actualiza solo a la medianoche con `setTimeout(msUntilNextMidnight)`.

- [ ] **Step 1: tests que fallan.**
  - **`toggleStep` dos veces:** deja `checks[key][taskId]` sin ese paso.
  - **`progress` con 4 pasos y 1 tildado:** devuelve `{ done: 1, total: 4 }`.
  - **`progress ignora pasos borrados`:** se tildan los pasos `a` y `b`, después `upsertTask` elimina `b`, y `progress` devuelve `{ done: 1, total: 1 }`.
  - **El progreso es por día:** se tilda el paso con key `'2026-10-24'`, y `progress` con `'2026-10-25'` devuelve `done: 0`.
  - **`tasksDueOn`:** con una tarea L-V y otra de fecha `'2026-10-25'`, en `'2026-10-25'` (domingo) devuelve solo la de fecha.
  - **`moveCard`:** con `todo` = `[A, B]`, mover `A` a `doing` cambia su columna, y `board` mantiene a `B` antes que a `A`.
  - **`deleteTask`:** también elimina `checks[*][taskId]`.
  - **`eventsOn`:** con eventos a las `'14:00'`, sin hora y a las `'09:00'`, el orden es 09:00, 14:00 y sin hora.
- [ ] **Step 2:** ejecutar `npm test -- ops`. Esperado: FAIL.
- [ ] **Step 3:** implementar `ops.ts`, `useAppData.ts` y `useToday.ts`.
- [ ] **Step 4:** ejecutar `npm test`. Esperado: PASS.
- [ ] **Step 5:** commit `feat: operaciones de datos y hooks de estado`.

---

### Task 5: Shell de la app y navegación

**Files:**
- Create: `src/renderer/styles.css`, `src/renderer/components/Sidebar.tsx`
- Modify: `src/renderer/App.tsx`, `src/renderer/main.tsx`
- Test: `tests/renderer/App.test.tsx`

**Interfaces:**
- Consumes: `useAppData` de la Task 4.
- Produces:
  - `type View = 'calendar' | 'tasks' | 'board' | 'settings'`.
  - `<Sidebar view={View} onChange={(v: View) => void} />`.
  - Las variables CSS de `styles.css`, según la "Referencia visual" del spec:
    - `--sidebar-bg:#1F2937`
    - `--nav-active:#374151`
    - `--content-bg:#F9FAFB`
    - `--text:#111827`
    - `--muted:#6B7280`
    - `--other-month:#9CA3AF`
    - `--border:#E5E7EB`
    - `--today:#2563EB`
    - Pares de evento: `--parcial-bg:#FEE2E2` y `--parcial-fg:#B91C1C`, `--entrega-bg:#DBEAFE` y `--entrega-fg:#1D4ED8`, `--recordatorio-bg:#FEF3C7` y `--recordatorio-fg:#B45309`.

- [ ] **Step 1: test que falla.** Con `window.api` mockeado:
  - Al renderizar `App`, el botón "Calendario" tiene `aria-current="page"`.
  - Al hacer clic en "Tareas", ese botón pasa a tener `aria-current`.
  - El sidebar muestra "Organizador", "Calendario", "Tareas", "Tablero" y un botón "Ajustes" abajo de todo.
- [ ] **Step 2:** ejecutar `npm test -- App`. Esperado: FAIL.
- [ ] **Step 3:** implementar.
  - Layout de grid: sidebar de 220 px y contenido con padding 40.
  - La vista inicial es `'calendar'`.
  - Mientras `data` sea `null` se muestra "Cargando…".
- [ ] **Step 4:** ejecutar `npm test`. Esperado: PASS. Revisar con `npm run dev` que el sidebar coincide con el diseño.
- [ ] **Step 5:** commit `feat: shell y navegación lateral`.

---

### Task 6: Vista Calendario y eventos

**Files:**
- Create: `src/renderer/views/CalendarView.tsx`, `src/renderer/components/EventDialog.tsx`, `src/renderer/components/EventChip.tsx`
- Test: `tests/renderer/CalendarView.test.tsx`

**Interfaces:**
- Consumes:
  - `monthGrid` y `dateKey` de la Task 2.
  - `eventsOn`, `upsertEvent`, `deleteEvent` y `newId` de la Task 4.
  - `useToday` de la Task 4.
- Produces: `<CalendarView data={AppData} update={...} today={string} />`.

- [ ] **Step 1: tests que fallan.** Con `today = '2026-10-16'`:
  - **Título del mes:** se muestra "Octubre 2026". El nombre del mes se escribe con mayúscula inicial, a partir de un array propio de meses en español.
  - **Navegación:** los botones "Mes anterior" y "Mes siguiente" (`aria-label`) cambian el título a "Septiembre 2026" y "Noviembre 2026".
  - **Hoy:** la celda `data-key="2026-10-16"` tiene la clase `today`.
  - **Crear evento:**
    1. Al hacer clic en la celda del 22 se abre un diálogo con los campos "Título", "Tipo" (Parcial, Entrega, Recordatorio) y "Hora (opcional)".
    2. Se escribe "Parcial Análisis", se elige Parcial y se guarda.
    3. La celda muestra un chip con ese texto y la clase `parcial`.
  - **Editar evento:** al hacer clic en el chip se abre el diálogo con los datos cargados. "Eliminar" quita el evento.
  - **Desborde:** con 4 eventos en un día y un máximo de 3 visibles, se ve el texto "+1 más". Al hacer clic se abre la lista completa del día en el diálogo.
- [ ] **Step 2:** ejecutar `npm test -- CalendarView`. Esperado: FAIL.
- [ ] **Step 3:** implementar.
  - **Grilla:** CSS grid de 7 columnas con gap 8 y filas `1fr` que llenan el alto.
  - **Celda:** borde de 1 px, radio 8, padding 8 y gap 4.
  - **Hoy:** borde de 2 px con `var(--today)`.
  - **Chips:** 12 px, peso 500, padding 2/6, radio 4, `text-overflow: ellipsis`.
  - **Diálogo:** se implementa con `<dialog>` nativo.
  - **Clics:** el clic en un chip no se propaga a la celda (`stopPropagation`).
- [ ] **Step 4:** ejecutar `npm test`. Esperado: PASS. Comparar visualmente con `npm run dev` contra la "Referencia visual".
- [ ] **Step 5:** commit `feat: vista calendario con eventos`.

---

### Task 7: Vista Tareas (lista, pasos, progreso y copiar)

**Files:**
- Create: `src/renderer/views/TasksView.tsx`, `src/renderer/components/TaskCard.tsx`, `src/renderer/components/CopyBlock.tsx`
- Test: `tests/renderer/TasksView.test.tsx`

**Interfaces:**
- Consumes:
  - `tasksDueOn`, `toggleStep` y `progress` de la Task 4.
  - `useToday` de la Task 4.
- Produces:
  - `<TasksView data update today onEdit={(taskId: string | null) => void} />`. Con `null` se crea una tarea nueva, y la Task 8 abre el editor.
  - `<CopyBlock text={string} />`.

- [ ] **Step 1: tests que fallan.**
  - **Selector "Hoy / Todas":**
    - En "Hoy", con `today = '2026-10-25'` (domingo), una tarea L-V no aparece y una de fecha `'2026-10-25'` sí.
    - En "Todas" aparecen las dos.
  - **Desplegar y plegar:** las tareas arrancan plegadas. Al hacer clic en el título se ven los pasos, y al volver a hacer clic se ocultan.
  - **Tildar:** al tildar un paso, el contador pasa de "0 de 2" a "1 de 2". Con todos tildados, el contador tiene la clase `complete`.
  - **`copia el comando exacto`:**
    - El comando es `'C:\\precargas\\entrada  "x y"\r\npython conv.py  '`.
    - Al hacer clic en "Copiar comando", `navigator.clipboard.writeText` (mockeado) recibe exactamente ese string.
    - El botón muestra "Copiado" durante 1,5 s.
  - **Comando multilínea:** el bloque se renderiza en `<pre>` y conserva los saltos de línea.
  - **Estado vacío:** sin tareas para hoy se muestra "No hay tareas para hoy" y un botón "Nueva tarea".
- [ ] **Step 2:** ejecutar `npm test -- TasksView`. Esperado: FAIL.
- [ ] **Step 3:** implementar.
  - Diseño: tarjetas blancas con borde y radio 8.
  - Encabezado de la tarea: chevron, nombre, progreso "N de M" y un botón lápiz con `aria-label="Editar tarea"`.
  - `<pre>` en fuente monoespaciada.
  - En "Todas", las tareas que no tocan hoy se muestran sin casillas y con la leyenda de su repetición, por ejemplo "Lun a Vie" o "3/11/2026".
- [ ] **Step 4:** ejecutar `npm test`. Esperado: PASS.
- [ ] **Step 5:** commit `feat: vista de tareas con pasos y copiar comando`.

---

### Task 8: Editor de tareas

**Files:**
- Create: `src/renderer/components/TaskEditor.tsx`
- Modify: `src/renderer/App.tsx`, que muestra el editor cuando `onEdit` lo pide
- Test: `tests/renderer/TaskEditor.test.tsx`

**Interfaces:**
- Consumes:
  - `upsertTask`, `deleteTask` y `newId` de la Task 4.
  - `WEEKDAYS_ALL` y `WEEKDAYS_WORK` de la Task 2.
- Produces: `<TaskEditor task={Task | null} onSave={(t: Task) => void} onDelete={(id: string) => void} onClose={() => void} />`.

- [ ] **Step 1: tests que fallan.**
  - **Valores por defecto de una tarea nueva:** "Nombre" vacío, repetición "Días de la semana" con Lun a Vie tildados y ningún paso.
  - **Botones rápidos:** "Todos los días" tilda los 7 días y "Lun a Vie" tilda 0 a 4.
  - **Fecha específica:** al elegir "Fecha específica" aparece un `<input type="date">`. Guardar produce `recurrence: { kind: 'date', date: 'YYYY-MM-DD' }`.
  - **Pasos:**
    - "Agregar paso" suma una fila con "Texto" y un textarea "Comando (opcional)".
    - Los botones "Subir", "Bajar" y "Borrar paso" reordenan y eliminan pasos.
    - Un comando vacío se guarda como `command: undefined`.
  - **Validación:**
    - Guardar sin nombre muestra "Escribí un nombre" y no llama a `onSave`.
    - Con "Días de la semana" y ningún día tildado muestra "Elegí al menos un día".
    - Con "Fecha específica" y la fecha vacía muestra "Elegí una fecha".
  - **Eliminar:** "Eliminar tarea" pide confirmación con `window.confirm` y llama a `onDelete`.
- [ ] **Step 2:** ejecutar `npm test -- TaskEditor`. Esperado: FAIL.
- [ ] **Step 3:** implementar. El editor es un panel modal con `<dialog>`, y el textarea del comando usa fuente monoespaciada y no recorta el texto.
- [ ] **Step 4:** ejecutar `npm test`. Esperado: PASS.
- [ ] **Step 5:** commit `feat: editor de tareas con repetición y pasos`.

---

### Task 9: Tablero kanban

**Files:**
- Create: `src/renderer/views/BoardView.tsx`, `src/renderer/components/CardDialog.tsx`
- Test: `tests/renderer/BoardView.test.tsx`

**Interfaces:**
- Consumes: `upsertCard`, `deleteCard`, `moveCard` y `newId` de la Task 4.
- Produces: `<BoardView data update />`.

- [ ] **Step 1: tests que fallan.**
  - **Columnas:** se muestran "Por hacer", "En curso" y "Hecho", cada una con su contador.
  - **Crear tarjeta:** "Nueva tarjeta" en "Por hacer" abre un diálogo con "Título" y "Descripción (opcional)". Al guardar, la tarjeta aparece en "Por hacer".
  - **Mover con drag & drop:** se simula `dragStart` en la tarjeta y `drop` en la columna "En curso", con un `dataTransfer` que lleva el id. La tarjeta pasa a "En curso".
  - **Mover sin mouse:** cada tarjeta tiene el botón "Mover a…" con las otras dos columnas. Es una alternativa accesible y además facilita testear.
  - **Editar y eliminar:** al hacer clic en la tarjeta se abre el diálogo para editar. "Eliminar" pide confirmación y la quita.
  - **Validación:** guardar sin título muestra "Escribí un título".
- [ ] **Step 2:** ejecutar `npm test -- BoardView`. Esperado: FAIL.
- [ ] **Step 3:** implementar con la API nativa: `draggable`, `onDragStart` con `dataTransfer.setData('text/plain', id)`, `onDragOver` con `preventDefault` y `onDrop` llamando a `moveCard`. La descripción se muestra truncada a 3 líneas.
- [ ] **Step 4:** ejecutar `npm test`. Esperado: PASS.
- [ ] **Step 5:** commit `feat: tablero kanban`.

---

### Task 10: Ajustes, instancia única e instalador

**Files:**
- Create: `src/renderer/views/SettingsView.tsx`, `electron-builder.yml`, `build/icon.ico`
- Modify: `src/main/index.ts`
- Test: `tests/renderer/SettingsView.test.tsx`

**Interfaces:**
- Consumes: `window.api.getAutoStart` y `window.api.setAutoStart` de la Task 3.

- [ ] **Step 1: test que falla.** Con `getAutoStart` mockeado para devolver `true`:
  - El interruptor "Abrir al iniciar Windows" aparece activado.
  - Al hacer clic se llama a `setAutoStart(false)`.
- [ ] **Step 2:** ejecutar `npm test -- SettingsView`. Esperado: FAIL.
- [ ] **Step 3:** implementar `SettingsView` y conectarlo a la vista `'settings'`.
- [ ] **Step 4:** ejecutar `npm test`. Esperado: PASS.
- [ ] **Step 5:** configurar la instancia única en `main`.
  - Llamar a `app.requestSingleInstanceLock()`. Si devuelve `false`, ejecutar `app.quit()`.
  - En el evento `second-instance`, restaurar la ventana si está minimizada y darle foco con `focus()`.
  - Con `window-all-closed`, ejecutar `app.quit()`.
- [ ] **Step 6:** configurar el instalador en `electron-builder.yml`.
  - `appId: com.julian.organizador`
  - `productName: Organizador`
  - `win.target: nsis`
  - `nsis: { oneClick: false, perMachine: false, allowToChangeInstallationDirectory: true }`
  - Icono en `build/icon.ico`. Puede ser un ícono simple de calendario de 256×256.
- [ ] **Step 7:** verificar de punta a punta.
  1. Ejecutar `npm run dist`. Esperado: `dist/Organizador Setup <versión>.exe`.
  2. Instalar la app y abrirla. Abre en Calendario.
  3. Crear un evento, una tarea con un paso con comando y una tarjeta.
  4. Cerrar y volver a abrir: todo sigue ahí.
  5. Abrir la app dos veces: aparece una sola ventana.
  6. En Ajustes, el interruptor de inicio está activado.
  7. Reiniciar sesión de Windows: la app se abre sola.
- [ ] **Step 8:** commit `feat: ajustes, instancia única e instalador`.
