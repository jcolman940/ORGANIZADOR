import { useEffect, useState } from 'react'

/** Muestra un comando tal cual y lo copia sin tocar un solo carácter. */
export function CopyBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(id)
  }, [copied])

  return (
    <div className="copy-block">
      <pre>{text}</pre>
      <button
        className="btn copy-btn"
        onClick={async () => {
          await navigator.clipboard.writeText(text)
          setCopied(true)
        }}
      >
        {copied ? 'Copiado' : 'Copiar comando'}
      </button>
    </div>
  )
}
