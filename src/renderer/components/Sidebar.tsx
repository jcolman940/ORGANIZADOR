export type View = 'calendar' | 'tasks' | 'board' | 'settings'

const MAIN: { view: View; label: string }[] = [
  { view: 'calendar', label: 'Calendario' },
  { view: 'tasks', label: 'Tareas' },
  { view: 'board', label: 'Tablero' }
]

export function Sidebar({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  const item = (v: View, label: string, extra = '') => (
    <button
      key={v}
      className={`nav-item ${extra}`}
      aria-current={view === v ? 'page' : undefined}
      onClick={() => onChange(v)}
    >
      {label}
    </button>
  )
  return (
    <nav className="sidebar">
      <p className="sidebar-title">Organizador</p>
      {MAIN.map(m => item(m.view, m.label))}
      {item('settings', 'Ajustes', 'nav-bottom')}
    </nav>
  )
}
