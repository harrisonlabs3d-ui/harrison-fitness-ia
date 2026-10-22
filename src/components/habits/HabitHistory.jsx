import { useState } from 'react'
import { Card, Btn, Badge, Empty } from '../ui'
import { addDays, parseISO, toISODate, fmtShort } from '../../utils/dateUtils'
import { weekStart } from '../../utils/trainingCalculations'
import { computeDays, calculateWeeklyConsistency, summarizeDays, earliestHabitDate } from '../../utils/habitCalculations'

const DOT = { high: 'text-emerald-400', partial: 'text-amber-300', none: 'text-slate-500', future: 'text-transparent' }
export default function HabitHistory({ hd, streak, onPick }) {
  const [mode, setMode] = useState('day')
  const rows = [], first = earliestHabitDate(hd)
  if (mode === 'day') computeDays(hd, addDays(hd.today, -13), hd.today).reverse().forEach((x) => rows.push({ key: x.date, label: fmtShort(x.date), s: { completed: x.completed, applicable: x.applicable.length, consistency: x.consistency }, state: x.state, onClick: () => onPick(x.date) }))
  if (mode === 'week') for (let i = 0; i < 8; i++) { const w = calculateWeeklyConsistency(hd, addDays(weekStart(hd.today), -7 * i)); rows.push({ key: w.start, label: `Semana del ${fmtShort(w.start)}`, s: w, extra: `${w.activeDays}/7 días activos`, state: w.consistency == null ? 'none' : w.consistency >= hd.streakMin ? 'high' : w.activeDays ? 'partial' : 'none' }) }
  if (mode === 'month') for (let i = 0; i < 3; i++) { const t = parseISO(hd.today), st = new Date(t.getFullYear(), t.getMonth() - i, 1), en = new Date(t.getFullYear(), t.getMonth() - i + 1, 0), to = toISODate(en) > hd.today ? hd.today : toISODate(en), sm = summarizeDays(computeDays(hd, toISODate(st), to), first); rows.push({ key: toISODate(st), label: st.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' }), s: sm, extra: `${sm.daysWithData} días con datos`, state: sm.consistency == null || !sm.daysWithData ? 'none' : sm.consistency >= hd.streakMin ? 'high' : 'partial' }) }
  return (
    <Card title="Historial de hábitos">
      {hd.demo && <Badge kind="demo" />}
      <p className="mb-2 text-sm text-slate-300">Racha actual: <b className="text-white">{streak.current} días</b> · Mejor racha: <b className="text-white">{streak.best} días</b></p>
      <div className="mb-2 flex gap-2" role="group" aria-label="Periodo">{[['day', 'Día'], ['week', 'Semana'], ['month', 'Mes']].map(([id, l]) => <Btn key={id} variant={mode === id ? 'primary' : 'ghost'} aria-pressed={mode === id} className="min-h-10 px-4 py-1" onClick={() => setMode(id)}>{l}</Btn>)}</div>
      {!rows.length && <Empty text="Sin datos todavía." />}
      {rows.map((r) => (
        <button key={r.key} disabled={!r.onClick} onClick={r.onClick} className="flex w-full items-center justify-between gap-2 border-t border-slate-800 py-2 text-left text-sm first:border-0">
          <span className="capitalize text-white"><span className={DOT[r.state]}>●</span> {r.label}</span>
          <span className="text-right text-slate-300">{r.s.consistency == null ? 'Sin datos' : `${r.s.consistency}%`} · {r.s.completed}/{r.s.applicable}{r.extra ? ` · ${r.extra}` : ''}</span>
        </button>
      ))}
    </Card>
  )
}
