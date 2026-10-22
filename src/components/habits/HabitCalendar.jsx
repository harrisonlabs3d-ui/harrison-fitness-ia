import { useState } from 'react'
import { Card, Btn, Badge, Stat } from '../ui'
import { parseISO, toISODate } from '../../utils/dateUtils'
import { computeDays, fmtLongFull, habitText, STATUS_GLYPH, STATUS_LABEL } from '../../utils/habitCalculations'

const DOT = { high: ['text-emerald-400', 'alta consistencia'], partial: ['text-amber-300', 'parcial'], none: ['text-slate-500', 'sin datos'], future: ['text-transparent', ''] }
export function DayDetail({ day, demo }) {
  return (
    <div className="mt-3 border-t border-slate-800 pt-3">
      <p className="text-lg font-bold text-white">{fmtLongFull(day.date)} {demo && <Badge kind="demo" />}</p>
      <p className="text-sm text-slate-300">Consistencia: <b className="text-white">{day.consistency == null ? '—' : `${day.consistency}%`}</b> · {day.completed} / {day.applicable.length} hábitos</p>
      <ul className="mt-2 space-y-1 text-sm">{day.habits.map((h) => <li key={h.id} className="flex justify-between gap-2 text-slate-200"><span>{h.icon} {h.label}</span><span>{habitText(h)} <b aria-label={STATUS_LABEL[h.status]}>{STATUS_GLYPH[h.status]}</b></span></li>)}</ul>
    </div>
  )
}
export default function HabitCalendar({ hd, selected, onSelect }) {
  const [month, setMonth] = useState(() => { const d = parseISO(selected || hd.today); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const first = month, lead = (first.getDay() + 6) % 7, n = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const from = toISODate(first), to = toISODate(new Date(first.getFullYear(), first.getMonth(), n))
  const days = computeDays(hd, from, to), cells = [...Array(lead).fill(null), ...days]
  const sel = days.find((x) => x.date === selected)
  const shift = (k) => setMonth(new Date(first.getFullYear(), first.getMonth() + k, 1))
  return (
    <Card title="Mi calendario">
      {hd.demo && <Badge kind="demo" />}
      <div className="mb-2 flex items-center justify-between"><Btn variant="ghost" aria-label="Mes anterior" className="min-h-10" onClick={() => shift(-1)}>←</Btn><p className="font-semibold capitalize text-white">{first.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}</p><Btn variant="ghost" aria-label="Mes siguiente" className="min-h-10" onClick={() => shift(1)}>→</Btn></div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400">{['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((x) => <span key={x}>{x}</span>)}</div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((x, i) => x ? (
          <button key={x.date} onClick={() => onSelect(x.date)} aria-pressed={selected === x.date} aria-label={`${x.date}: ${DOT[x.state][1] || 'futuro'}`}
            className={`flex min-h-11 flex-col items-center justify-center rounded-lg text-sm ${selected === x.date ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-200'} ${x.date === hd.today ? 'ring-1 ring-blue-400' : ''}`}>
            {Number(x.date.slice(8))}<span className={`text-xs leading-none ${DOT[x.state][0]}`}>●</span>
          </button>) : <span key={`b${i}`} />)}
      </div>
      <p className="mt-2 text-xs text-slate-500"><span className="text-emerald-400">●</span> alta consistencia · <span className="text-amber-300">●</span> parcial · <span className="text-slate-500">●</span> sin datos</p>
      {sel && <DayDetail day={sel} demo={hd.demo} />}
    </Card>
  )
}
