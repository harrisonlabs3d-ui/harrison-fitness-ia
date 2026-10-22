import { Card, Badge } from '../ui'
import { motion } from 'framer-motion'

export function Priorities({ pending, done }) {
  return (
    <Card title="¿Qué me falta hoy?">
      {pending.length ? <><p className="text-sm text-slate-300">Te falta:</p><ol className="mt-1 list-decimal space-y-1 pl-5 text-white">{pending.slice(0, 3).map((p) => <li key={p.id}>{p.icon} {p.text}</li>)}</ol></> : <p className="text-sm text-emerald-300">{done ? 'No te falta nada por hoy.' : 'Sin pendientes por ahora.'}</p>}
    </Card>
  )
}
export function NextAction({ next, demo }) {
  return (
    <div className="rounded-xl border border-blue-500/40 bg-blue-500/10 p-3">
      <p className="text-xs font-semibold tracking-wide text-blue-300">SIGUIENTE {demo && <Badge kind="demo" />}</p>
      <p className="text-lg font-bold text-white">{next ? `${next.icon} ${next.label}` : '🎉 Completaste tus hábitos de hoy'}</p>
    </div>
  )
}
export default function HabitInsight({ insights }) {
  if (!insights.length) return null
  return <Card title="Recordatorios del día">{insights.map((t) => <motion.p key={t} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-slate-200">• {t}</motion.p>)}<p className="mt-1 text-xs text-slate-500">Mensajes basados en tus registros; no son consejos médicos.</p></Card>
  }
