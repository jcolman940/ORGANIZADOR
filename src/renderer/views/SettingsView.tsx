import { useEffect, useState } from 'react'

export function SettingsView() {
  const [autoStart, setAutoStart] = useState<boolean | null>(null)

  useEffect(() => {
    window.api.getAutoStart().then(setAutoStart)
  }, [])

  return (
    <>
      <header className="month-header">
        <h1 className="view-title">Ajustes</h1>
      </header>
      <section className="card settings">
        <div className="setting">
          <input
            id="autostart"
            type="checkbox"
            aria-describedby="autostart-help"
            disabled={autoStart === null}
            checked={autoStart ?? false}
            onChange={e => {
              const on = e.target.checked
              setAutoStart(on)
              void window.api.setAutoStart(on)
            }}
          />
          <div>
            <label htmlFor="autostart">Abrir al iniciar Windows</label>
            <small id="autostart-help">La app se abre sola en el calendario cuando prendés la compu.</small>
          </div>
        </div>
      </section>
    </>
  )
}
