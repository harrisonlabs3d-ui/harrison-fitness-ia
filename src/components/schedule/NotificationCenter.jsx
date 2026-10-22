import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { onInApp, notify } from '../../utils/notificationService'
import { buildScheduleData, getDueNotifications, isPaused } from '../../utils/scheduleCalculations'

// Motor de avisos: un intervalo de 1 s con los datos más recientes (ref) para no re-renderizar la app. Solo avisos dentro de la app / navegador abierto.
export default function NotificationCenter({ d, setD, t }) {
  const [toasts, setToasts] = useState([])
  const ref = useRef({ d, t })
  const sent = useRef(new Set())
  ref.current = { d, t }
  useEffect(() => onInApp((n) => setToasts((x) => [...x.slice(-2), { ...n, id: `${n.at}-${Math.random()}` }])), [])
  useEffect(() => {
    const tick = () => {
      const { d, t } = ref.current, now = new Date(), ns = d.notificationSettings
      if (isPaused(ns, now)) return
      const sd = buildScheduleData(d, t, now), due = getDueNotifications(sd, ns.fired).filter((n) => !sent.current.has(n.key))
      if (!due.length) return
      const fired = {}
      due.forEach((n) => { sent.current.add(n.key); fired[n.key] = now.getTime(); notify({ title: n.title, body: n.body, tag: n.key }, { inApp: ns.inApp, browser: ns.browser }) })
      setD((p) => ({ ...p, notificationSettings: { ...p.notificationSettings, fired: { ...Object.fromEntries(Object.entries(p.notificationSettings.fired).filter(([k]) => k.startsWith(sd.today))), ...fired } } }))
    }
    tick()
    const i = setInterval(tick, 1000)
    return () => clearInterval(i)
  }, []) // eslint-disable-line
  useEffect(() => { if (!toasts.length) return; const id = setTimeout(() => setToasts((x) => x.slice(1)), 20000); return () => clearTimeout(id) }, [toasts])
  return (
    <div className="pointer-events-none fixed inset-x-2 top-2 z-[70] flex flex-col items-end gap-2 sm:left-auto sm:w-96" aria-live="polite" role="status" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <AnimatePresence>
        {toasts.map((n) => (
          <motion.div key={n.id} initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-blue-500/50 bg-slate-900 p-3 shadow-lg" data-toast>
            <span aria-hidden="true">🔔</span>
            <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-white">{n.title}</p><p className="text-sm text-slate-300">{n.body}</p></div>
            <button aria-label="Cerrar aviso" className="min-h-8 px-2 text-slate-400" onClick={() => setToasts((x) => x.filter((y) => y.id !== n.id))}>✕</button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
