import { useState } from 'react'
import { deleteTask, upsertTask } from '@shared/ops'
import { Sidebar, type View } from './components/Sidebar'
import { TaskEditor } from './components/TaskEditor'
import { useAppData } from './state/useAppData'
import { useToday } from './state/useToday'
import { BoardView } from './views/BoardView'
import { CalendarView } from './views/CalendarView'
import { SettingsView } from './views/SettingsView'
import { TasksView } from './views/TasksView'

export function App() {
  const { data, update, saveError, loadError, recoveredFrom, retry } = useAppData()
  const [dismissedRecovery, setDismissedRecovery] = useState(false)
  const today = useToday()
  const [view, setView] = useState<View>('calendar')
  // undefined = editor cerrado; null = tarea nueva; string = id de la tarea a editar
  const [editing, setEditing] = useState<string | null | undefined>(undefined)

  return (
    <div className="app">
      <Sidebar view={view} onChange={setView} />
      <main className="content">
        {saveError ? (
          <p role="alert" className="banner banner-error">
            No se pudo guardar el último cambio. Se vuelve a intentar con tu próximo cambio; no cierres la app hasta que este aviso desaparezca.
          </p>
        ) : null}
        {recoveredFrom && !dismissedRecovery ? (
          <div role="alert" className="banner banner-warning">
            <span>
              Tu archivo de datos estaba dañado y la app arrancó vacía. El original quedó guardado en <code>{recoveredFrom}</code>.
            </span>
            <button className="icon-btn" aria-label="Cerrar aviso" onClick={() => setDismissedRecovery(true)}>
              ✕
            </button>
          </div>
        ) : null}
        {loadError ? (
          <div className="load-error">
            <p>No se pudieron abrir tus datos.</p>
            <button className="btn btn-primary" onClick={retry}>
              Reintentar
            </button>
          </div>
        ) : !data ? (
          <p>Cargando…</p>
        ) : view === 'calendar' ? (
          <CalendarView data={data} update={update} today={today} />
        ) : view === 'tasks' ? (
          <TasksView data={data} update={update} today={today} onEdit={setEditing} />
        ) : view === 'board' ? (
          <BoardView data={data} update={update} />
        ) : (
          <SettingsView />
        )}
      </main>
      {data && editing !== undefined ? (
        <TaskEditor
          key={editing ?? 'new'}
          task={editing ? (data.tasks.find(t => t.id === editing) ?? null) : null}
          onClose={() => setEditing(undefined)}
          onSave={t => {
            update(d => upsertTask(d, t))
            setEditing(undefined)
          }}
          onDelete={id => {
            update(d => deleteTask(d, id))
            setEditing(undefined)
          }}
        />
      ) : null}
    </div>
  )
}
