import { motion } from 'framer-motion'
import { Card, Badge, Stat } from '../ui'

export default function GoalProgress({ goal, demo }) {
  if (!goal) return <Card title="Objetivo de peso"><p className="text-sm text-slate-400">Registra tu primer peso para ver tu progreso hacia la meta.</p></Card>
  return (
    <Card title="Objetivo de peso">
      {demo && <Badge kind="demo" />}
      <div className="grid grid-cols-3 gap-2"><Stat label="Peso actual" value={`${goal.current} kg`} /><Stat label="Meta" value={`${goal.target} kg`} /><Stat label="Restante" value={`${goal.remaining} kg`} /></div>
      <div className="mt-3 h-3 rounded bg-slate-800" role="progressbar" aria-label="Progreso hacia la meta" aria-valuenow={goal.pct} aria-valuemin={0} aria-valuemax={100}><motion.div className="h-3 rounded bg-blue-500" initial={{ width: 0 }} animate={{ width: `${goal.pct}%` }} /></div>
      <p className="mt-1 text-sm text-slate-300">{goal.pct}% del camino desde {goal.initial} kg hacia {goal.target} kg.</p>
      {goal.reached && <p className="text-sm text-emerald-400">Meta alcanzada{goal.exceededBy > 0 ? `: ${goal.exceededBy} kg más allá de la meta` : ''}.</p>}
    </Card>
  )
}
