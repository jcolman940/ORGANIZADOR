import { useState } from 'react'
import { Sidebar, type View } from './components/Sidebar'
import { useAppData } from './state/useAppData'
import { useToday } from './state/useToday'
import { CalendarView } from './views/CalendarView'

export function App() {
  const { data, update } = useAppData()
  const today = useToday()
  const [view, setView] = useState<View>('calendar')

  return (
    <div className="app">
      <Sidebar view={view} onChange={setView} />
      <main className="content">
        {!data ? (
          <p>Cargando…</p>
        ) : view === 'calendar' ? (
          <CalendarView data={data} update={update} today={today} />
        ) : null}
      </main>
    </div>
  )
}
