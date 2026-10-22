import { Card, Stat } from '../ui'
import { fmtLong } from '../../utils/dateUtils'

export function DailySummary({ s, demo }) {
  return (
    <Card title="Resumen de hoy">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><Stat label="Eventos" value={s.total} /><Stat label="Completados" value={s.completed} /><Stat label="Pendientes" value={s.pending} /><Stat label="Consistencia" value={s.consistency == null ? '—' : `${s.consistency}%`} sub={demo ? 'MODO DEMO' : 'de tus hábitos (Fase 5)'} /></div>
      {s.skipped > 0 && <p className="mt-2 text-xs text-slate-500">{s.skipped} omitidos por ti.</p>}
    </Card>
  )
}
export function TomorrowSummary({ s }) {
  return (
    <Card title="Mañana">
      <p className="-mt-2 mb-2 text-sm capitalize text-slate-400">{fmtLong(s.date)}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><Stat label="Entrenamiento" value={s.workout ? 'Sí' : 'No (descanso)'} sub={s.workoutName || ''} /><Stat label="Comidas" value={s.meals} /><Stat label="Recordatorios" value={s.reminders} /><Stat label="Peso" value={s.weight ? 'Corresponde registrar' : 'No corresponde'} /><Stat label="Foto" value={s.photo ? 'Corresponde' : 'No corresponde'} /></div>
    </Card>
  )
}
