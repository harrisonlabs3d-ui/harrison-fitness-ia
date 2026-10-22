import { useState } from 'react'
import { Btn } from '../ui'
import { parseISO, toISODate, addDays, todayISO } from '../../utils/dateUtils'

const HEAD = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
export default function WorkoutCalendar({ dates, selected, onSelect }) {
  const [month, setMonth] = useState(() => { const d = parseISO(selected || todayISO()); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const first = month, lead = (first.getDay() + 6) % 7
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => toISODate(new Date(first.getFullYear(), first.getMonth(), i + 1)))]
  const shift = (n) => setMonth(new Date(first.getFullYear(), first.getMonth() + n, 1))
  const today = todayISO()
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Btn variant="ghost" aria-label="Mes anterior" className="min-h-10" onClick={() => shift(-1)}>←</Btn>
        <p className="font-semibold capitalize text-white">{first.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}</p>
        <Btn variant="ghost" aria-label="Mes siguiente" className="min-h-10" onClick={() => shift(1)}>→</Btn>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400">{HEAD.map((h) => <span key={h}>{h}</span>)}</div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((c, i) => c ? (
          <button key={c} aria-label={`${c}${dates.has(c) ? ', con entrenamiento' : ''}`} aria-pressed={selected === c} onClick={() => onSelect(c)}
            className={`flex min-h-11 flex-col items-center justify-center rounded-lg text-sm ${selected === c ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-200'} ${c === today ? 'ring-1 ring-blue-400' : ''}`}>
            {Number(c.slice(8))}<span className={`text-xs leading-none ${dates.has(c) ? 'text-emerald-400' : 'text-transparent'}`}>●</span>
          </button>) : <span key={`b${i}`} />)}
      </div>
    </div>
  )
}
export { addDays }
