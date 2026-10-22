import { Card, Btn, Badge } from '../ui'
import { Countdown } from './NowNext'
import { useMinuteClock } from '../../hooks/useClock'
import { useScheduleData } from '../../hooks/useSchedule'
import { generateDailySchedule, getNextEventAcross, getPendingToday } from '../../utils/scheduleCalculations'

// Widgets del Dashboard: PRÓXIMO, MI DÍA y PENDIENTE HOY (la agenda se calcula desde los módulos existentes).
export default function DashboardSchedule({ d, t, go }) {
  const now = useMinuteClock(), sd = useScheduleData(d, t, now)
  const events = generateDailySchedule(sd, sd.today), next = getNextEventAcross(sd)
  const mine = events.filter((e) => ['wake', 'meal', 'workout', 'sleep'].includes(e.type))
  const pending = getPendingToday(sd, events).slice(0, 3)
  return (
    <>
      <Card title="Próximo">
        {sd.demo && <Badge kind="demo" />}
        {next ? <><p className="text-xl font-bold text-white">{next.icon} {next.title}</p><p className="text-sm text-slate-300">{next.time}{next.date !== sd.today ? ' · mañana' : ''}</p><div className="mt-2"><Countdown ev={next} /></div></> : <p className="text-sm text-slate-400">No hay eventos próximos.</p>}
        <Btn variant="ghost" className="mt-3" onClick={() => go('sch')}>Ver agenda completa</Btn>
      </Card>
      <Card title="Mi día">
        <ul className="space-y-1">{mine.map((e) => <li key={e.id} data-mine={e.id} className={`flex items-center gap-3 text-sm ${e.status === 'next' ? 'font-semibold text-blue-300' : e.status === 'completed' ? 'text-slate-400' : 'text-slate-200'}`}><span className="w-12 text-slate-400">{e.time}</span><span>{e.icon}</span><span className="flex-1">{e.title}</span>{e.status === 'completed' && <span aria-label="Completado">✓</span>}</li>)}</ul>
        <Btn variant="ghost" className="mt-3" onClick={() => go('sch')}>Ver agenda completa</Btn>
      </Card>
      <Card title="Pendiente hoy">
        {pending.length ? <ul className="space-y-1">{pending.map((p) => <li key={p.id} className="text-white">{p.icon} {p.text}</li>)}</ul> : <p className="text-sm text-emerald-300">No te queda nada pendiente por ahora.</p>}
      </Card>
    </>
  )
}
