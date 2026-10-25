import { useState } from 'react'
import { Sidebar, type View } from './components/Sidebar'
import { useAppData } from './state/useAppData'
import { useToday } from './state/useToday'

export function App() {
  const { data } = useAppData()
  const today = useToday()
  const [view, setView] = useState<View>('calendar')

  return (
    <div className="app">
      <Sidebar view={view} onChange={setView} />
      <main className="content" data-today={today}>
        {!data ? <p>Cargando…</p> : null}
      </main>
    </div>
  )
}
