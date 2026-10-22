import { useState } from 'react'
import { Card, Btn, Badge } from '../ui'
import { parseISO, toISODate, addDays } from '../../utils/dateUtils'
import { weekStart } from '../../utils/trainingCalculations'
import { generateDailySchedule, getWeeklySchedule, isMain } from '../../utils/scheduleCalculations'

export function WeeklySchedule({ sd, selected, onSelect }) {
  const w = getWeeklySchedule(sd, weekStart(selected || sd.today))
  return (
    <Card title="Esta semana">
      {sd.demo && <Badge kind="demo" />}
      <ul className="space-y-1">{w.map((x) => (
        <li key={x.date}><button onClick={() => onSelect(x.date)} aria-pressed={selected === x.date} className={`flex min-h-12 w-full items-center justify-between rounded-lg px-3 text-left ${selected === x.date ? 'bg-blue-600/30' : 'bg-slate-950'} ${x.date === sd.today ? 'ring-1 ring-blue-400' : ''}`}>
          <span className="text-white">{x.name} <span className="text-xs text-slate-500">{x.date.slice(8)}/{x.date.slice(5, 7)}</span></span>
          <span className="text-sm text-slate-300" data-week-day={x.name}>{x.count} eventos{x.restDay ? ' · descanso' : ''}</span></button></li>))}</ul>
    </Card>
  )
}
export default function ScheduleCalendar({ sd, selected, onSelect }) {
  const [month, setMonth] = useState(() => { const d = parseISO(selected || sd.today); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const lead = (month.getDay() + 6) % 7, n = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const days = Array.from({ length: n }, (_, i) => toISODate(new Date(month.getFullYear(), month.getMonth(), i + 1)))
  const shift = (k) => setMonth(new Date(month.getFullYear(), month.getMonth() + k, 1))
  return (
    <Card title="Calendario">
      <div className="mb-2 flex items-center justify-between"><Btn variant="ghost" aria-label="Mes anterior" className="min-h-10" onClick={() => shift(-1)}>←</Btn><p className="font-semibold capitalize text-white">{month.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}</p><Btn variant="ghost" aria-label="Mes siguiente" className="min-h-10" onClick={() => shift(1)}>→</Btn></div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400">{['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((x) => <span key={x}>{x}</span>)}</div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {[...Array(lead).fill(null), ...days].map((dt, i) => dt ? (
          <button key={dt} aria-pressed={selected === dt} aria-label={`${dt}: ${generateDailySchedule(sd, dt).filter(isMain).length} eventos`} onClick={() => onSelect(dt)}
            className={`flex min-h-11 flex-col items-center justify-center rounded-lg text-sm ${selected === dt ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-200'} ${dt === sd.today ? 'ring-1 ring-blue-400' : ''}`}>{Number(dt.slice(8))}<span className="text-[10px] leading-none text-slate-400">{generateDailySchedule(sd, dt).filter(isMain).length}</span></button>
        ) : <span key={`b${i}`} />)}
      </div>
    </Card>
  )
}
export { addDays }
