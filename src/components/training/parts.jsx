import { Badge } from '../ui'
import { PR_LABEL } from '../../utils/trainingCalculations'

export const PRBadge = ({ types = [] }) => <span className="rounded bg-amber-400/20 px-2 py-0.5 text-xs font-semibold text-amber-300" title={types.map((t) => PR_LABEL[t]).join(', ')}>🏆 PR</span>
export const DemoTag = ({ show }) => (show ? <Badge kind="demo" /> : null)

const TONE = { increase: 'border-emerald-500/40 bg-emerald-500/10', progress: 'border-blue-500/40 bg-blue-500/10', maintain: 'border-slate-600 bg-slate-800/60', reduce: 'border-amber-500/40 bg-amber-500/10' }
export function ProgressionSuggestion({ s }) {
  if (!s) return null
  return (
    <div className={`rounded-lg border p-3 text-sm ${TONE[s.type]}`}>
      <p className="text-xs font-semibold tracking-wide text-slate-300">PROGRESIÓN</p>
      {s.nextWeight != null && <p className="text-lg font-bold text-white">{s.weight} kg → {s.nextWeight} kg sugerido</p>}
      <p className="text-slate-200">{s.message}</p>
      <p className="mt-1 text-xs text-slate-400">Sugerencia de entrenamiento, no un diagnóstico ni un reemplazo de un entrenador.</p>
    </div>
  )
}
export const fmtSet = (s, unit = 'reps') => `${s.weight} kg × ${s.reps}${unit === 's' ? ' s' : ''}`
