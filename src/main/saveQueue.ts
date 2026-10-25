/**
 * Serializa los guardados: nunca corre más de uno a la vez.
 * Si llegan varios mientras uno está en curso, solo se escribe el último.
 */
export function createSaveQueue<T>(save: (value: T) => Promise<void>) {
  let running: Promise<void> | null = null
  let pending: { value: T; waiters: { resolve: () => void; reject: (e: unknown) => void }[] } | null = null

  const run = async () => {
    while (pending) {
      const { value, waiters } = pending
      pending = null
      try {
        await save(value)
        waiters.forEach(w => w.resolve())
      } catch (err) {
        waiters.forEach(w => w.reject(err))
      }
    }
    running = null
  }

  return {
    enqueue(value: T): Promise<void> {
      return new Promise<void>((resolve, reject) => {
        if (pending) {
          pending.value = value
          pending.waiters.push({ resolve, reject })
        } else {
          pending = { value, waiters: [{ resolve, reject }] }
        }
        if (!running) running = run()
      })
    },
    /** Espera a que se escriba todo lo encolado hasta ahora. */
    async flush(): Promise<void> {
      while (running) await running
    }
  }
}
