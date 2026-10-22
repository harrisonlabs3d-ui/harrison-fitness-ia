import { Card, Stat, Badge } from '../ui'

const G = { high: ['●', 'text-emerald-400', 'alta consistencia'], partial: ['◐', 'text-amber-300', 'parcial'], none: ['○', 'text-slate-500', 'sin datos'], future: ['○', 'text-slate-700', 'sin datos'] }
const L = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
export default function WeekConsistency({ w, demo, title = 'Consistencia semanal' }) {
  return (
    <Card title={title}>
      {demo && <Badge kind="demo" />}
      <div className="grid grid-cols-7 gap-1 text-center" role="list" aria-label="Consistencia por día">
        {w.days.map((x, i) => <div key={x.date} role="listitem" aria-label={`${L[i]}: ${G[x.state][2]}`}><p className="text-xs text-slate-400">{L[i]}</p><p className={`text-2xl ${G[x.state][1]}`}>{G[x.state][0]}</p></div>)}
      </div>
      <p className="mb-3 text-xs text-slate-500">● alta consistencia · ◐ parcial · ○ sin datos</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Hábitos completados" value={`${w.completed} / ${w.applicable}`} /><Stat label="Consistencia" value={w.consistency == null ? '—' : `${w.consistency}%`} />
        <Stat label="Días activos" value={`${w.activeDays} / 7`} /><Stat label="Entrenamientos" value={`${w.trainingDone} / ${w.trainingScheduled}`} /><Stat label="Días con nutrición registrada" value={`${w.nutritionDays} / 7`} />
      </div>
    </Card>
  )
}
