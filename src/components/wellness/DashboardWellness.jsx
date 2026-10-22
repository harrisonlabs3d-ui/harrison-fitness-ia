import { Card, Btn, Badge } from '../ui'
import { useMinuteClock } from '../../hooks/useClock'
import { useScheduleData } from '../../hooks/useSchedule'
import { useWellness } from '../../hooks/useWellness'
import { generateDailySchedule } from '../../utils/scheduleCalculations'

// Resumen breve en el Dashboard; el detalle está en la página Bienestar.
export default function DashboardWellness({ d, setD, t, go }) {
  const now = useMinuteClock(), sd = useScheduleData(d, t, now), W = useWellness(d, setD, t, now)
  const supp = generateDailySchedule(sd, sd.today).filter((e) => e.type === 'supplement'), done = supp.filter((e) => e.status === 'completed').length
  const dismissed = d.wellnessSettings.dismissed, review = W.insights.items.filter((o) => o.type === 'attention' && (o.source === 'demo' || !dismissed[o.id])).length
  return (
    <Card title="Bienestar">
      {(W.src.isDemo || W.mode === 'demo') && <Badge kind="demo" />}
      <p className="text-sm text-slate-200" data-dash-supp>{supp.length ? `💊 Suplementos de hoy: ${done} / ${supp.length}` : '💊 Sin tomas de suplementos planificadas hoy'}</p>
      <p className="text-sm text-slate-200" data-dash-review>{review ? `🔎 ${review} observación(es) por revisar` : '🔎 Sin observaciones por revisar'}</p>
      <Btn variant="ghost" className="mt-3" onClick={() => go('wel')}>Abrir Bienestar</Btn>
    </Card>
  )
}
