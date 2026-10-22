import { Card, Badge } from '../ui'
import { CHECK_LABEL } from '../../data/habits'
import { STATUS_GLYPH } from '../../utils/habitCalculations'

export default function HabitChecklist({ day, demo, title = 'Checklist de hoy' }) {
  return (
    <Card title={title}>
      {demo && <Badge kind="demo" />}
      <p className="text-2xl font-bold text-white" aria-live="polite">{day.completed} / {day.applicable.length} <span className="text-base font-normal text-slate-300">COMPLETADOS</span></p>
      <ul className="mt-2 space-y-1">
        {day.habits.map((h) => (
          <li key={h.id} className={`flex items-center gap-2 text-sm ${h.applicable ? 'text-slate-200' : 'text-slate-500'}`}>
            <span aria-hidden="true" className="w-5 text-center">{h.status === 'completed' ? '☑' : h.status === 'in_progress' ? '◐' : h.applicable ? '☐' : '☾'}</span>
            <span>{CHECK_LABEL[h.id] || h.label}{!h.applicable && ' · día de descanso (no aplica)'}</span>
            <span className="sr-only">{STATUS_GLYPH[h.status]}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
