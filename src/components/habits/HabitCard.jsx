import { motion } from 'framer-motion'
import { habitText, STATUS_LABEL, STATUS_GLYPH } from '../../utils/habitCalculations'

const TONE = { completed: 'bg-emerald-500/15 text-emerald-300', in_progress: 'bg-blue-500/15 text-blue-300', pending: 'bg-slate-700/60 text-slate-300', not_recorded: 'bg-slate-800 text-slate-400', rest: 'bg-slate-800 text-slate-300', future: 'bg-slate-800 text-slate-500' }
// Tarjeta de un hábito: estado, progreso y acción (children). No existe el estado "fallido".
export default function HabitCard({ h, compact, children }) {
  const pct = Math.round(h.progress * 100), showBar = h.applicable && h.id !== 'training'
  return (
    <motion.div layout className={`rounded-xl border bg-slate-900 p-3 ${h.status === 'completed' ? 'border-emerald-500/40' : 'border-slate-800'}`} aria-label={`${h.label}: ${STATUS_LABEL[h.status] || ''}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold tracking-wide text-white">{h.icon} {h.label.toUpperCase()}</p>
        <motion.span key={h.status} initial={{ scale: 0.85 }} animate={{ scale: 1 }} className={`rounded px-2 py-0.5 text-xs ${TONE[h.status]}`}>{STATUS_GLYPH[h.status]} {STATUS_LABEL[h.status]}</motion.span>
      </div>
      <p className={`mt-1 font-bold text-white ${compact ? 'text-base' : 'text-xl'}`}>{habitText(h)}</p>
      {showBar && (
        <div className="mt-2 flex items-center gap-2">
          <div className="h-2 flex-1 rounded bg-slate-800" role="progressbar" aria-label={`Progreso de ${h.label}`} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><motion.div className="h-2 rounded bg-blue-500" animate={{ width: `${pct}%` }} /></div>
          <span className="w-10 text-right text-xs text-slate-400">{pct}%</span>
        </div>
      )}
      {children && <div className="mt-3 flex flex-wrap gap-2">{children}</div>}
    </motion.div>
  )
}
