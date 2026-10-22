import { useState, useEffect } from 'react'

// Un único intervalo por consumidor, con limpieza al desmontar.
export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const i = setInterval(() => setNow(new Date()), ms); return () => clearInterval(i) }, [ms])
  return now
}
// Cambia solo cuando cambia el minuto o el día (para no recalcular la agenda cada segundo).
export function useMinuteClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const i = setInterval(() => setNow((p) => { const n = new Date(); return n.getMinutes() !== p.getMinutes() || n.getDate() !== p.getDate() ? n : p }), 1000)
    return () => clearInterval(i)
  }, [])
  return now
}
