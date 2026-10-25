import { useState } from 'react'
import { deleteTask, upsertTask } from '@shared/ops'
import { Sidebar, type View } from './components/Sidebar'
import { TaskEditor } from './components/TaskEditor'
import { useAppData } from './state/useAppData'
import { useToday } from './state/useToday'
import { CalendarView } from './views/CalendarView'
import { TasksView } from './views/TasksView'

export function App() {
  const { data, update } = useAppData()
  const today = useToday()
  const [view, setView] = useState<View>('calendar')
  // undefined = editor cerrado; null = tarea nueva; string = id de la tarea a editar
  const [editing, setEditing] = useState<string | null | undefined>(undefined)

  return (
    <div className="app">
      <Sidebar view={view} onChange={setView} />
      <main className="content">
        {!data ? (
          <p>Cargando…</p>
        ) : view === 'calendar' ? (
          <CalendarView data={data} update={update} today={today} />
        ) : view === 'tasks' ? (
          <TasksView data={data} update={update} today={today} onEdit={setEditing} />
        ) : null}
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
