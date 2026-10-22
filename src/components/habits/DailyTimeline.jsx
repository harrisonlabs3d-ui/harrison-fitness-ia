import { Card } from '../ui'
import { MEAL_TYPES } from '../../data/foods'
import { fmtTime } from '../../utils/nutritionCalculations'
import { toMin } from '../../utils/habitCalculations'

// Se arma con el horario ya configurado (perfil y comidas); no lo modifica. Cada evento tiene id para futuros recordatorios.
export default function DailyTimeline({ profile, mealsToday, now = new Date(), mealTimes = {} }) {
  const ev = [
    { id: 'wake', time: profile.despertar || '05:00', icon: '☀️', label: 'Inicio del día' },
    ...MEAL_TYPES.map((m) => ({ id: m.id, time: mealTimes[m.id] || m.time, icon: m.icon, label: m.label, meal: true, done: mealsToday.some((x) => x.mealType === m.id) })),
    { id: 'snack-light', time: '19:00', icon: '🥤', label: 'Snack ligero (opcional)' },
    { id: 'sleep', time: profile.dormir || '22:15', icon: '😴', label: 'Dormir' },
  ].sort((a, b) => toMin(a.time) - toMin(b.time))
  const cur = now.getHours() * 60 + now.getMinutes(), nextId = ev.find((e) => toMin(e.time) > cur)?.id
  return (
    <Card title="Mi día">
      <ol className="space-y-2">
        {ev.map((e) => (
          <li key={e.id} data-event={e.id} className={`flex items-center gap-3 rounded-lg p-2 ${e.id === nextId ? 'bg-blue-500/10 ring-1 ring-blue-500/40' : ''}`}>
            <span className="w-16 text-sm text-slate-400">{fmtTime(e.time)}</span><span>{e.icon}</span><span className="flex-1 text-sm text-white">{e.label}</span>
            {e.meal && <span className={`text-xs ${e.done ? 'text-emerald-300' : 'text-slate-500'}`}>{e.done ? '✓ registrada' : ''}</span>}{e.id === nextId && <span className="text-xs text-blue-300">siguiente</span>}
          </li>
        ))}
      </ol>
    </Card>
  )
}
