import { useState } from 'react'
import { Card, Empty } from '../ui'
import WorkoutCalendar from './WorkoutCalendar'
import { PRBadge, DemoTag, fmtSet } from './parts'
import { EXERCISES_BY_ID } from '../../data/exercises'
import { sessionSets, sessionVolume, exerciseVolume, fmtKg } from '../../utils/trainingCalculations'
import { fmtShort, fmtLong } from '../../utils/dateUtils'

function Detail({ s }) {
  return (
    <div className="mt-2 space-y-2 rounded-lg bg-slate-950 p-3 text-sm">
      {s.exercises.map((e) => <div key={e.exerciseId + e.name}><p className="text-white">{e.name} <span className="text-slate-500">· {fmtKg(exerciseVolume(e))} kg</span></p><p className="text-slate-300">{e.sets.map((x) => fmtSet(x, EXERCISES_BY_ID[e.exerciseId]?.repUnit)).join(' · ')}</p></div>)}
      {s.prs?.length > 0 && <p className="text-amber-300">🏆 {s.prs.map((p) => p.name).join(', ')}</p>}
    </div>
  )
}
export default function TrainingHistory({ sessions, isDemo }) {
  const [sel, setSel] = useState(null)
  const [open, setOpen] = useState(null)
  const dates = new Set(sessions.map((s) => s.date))
  const list = [...sessions].sort((a, b) => (a.date < b.date ? 1 : -1))
  const onDay = sel ? sessions.filter((s) => s.date === sel) : []
  const Row = ({ s }) => (
    <div className="border-t border-slate-800 py-2 first:border-0">
      <button className="flex w-full items-center justify-between gap-2 text-left" aria-expanded={open === s.id} onClick={() => setOpen(open === s.id ? null : s.id)}>
        <span><span className="block text-white">{fmtShort(s.date)} · {s.routineName} {s.type === 'demo' && <DemoTag show />} {s.prs?.length > 0 && <PRBadge types={s.prs.flatMap((p) => p.types)} />}</span>
          <span className="text-xs text-slate-400">{s.durationMin} min · {sessionSets(s)} series · {fmtKg(sessionVolume(s))} kg</span></span>
        <span className="text-slate-500">{open === s.id ? '▲' : '▼'}</span>
      </button>
      {open === s.id && <Detail s={s} />}
    </div>
  )
  return (
    <div className="space-y-4">
      <Card title="Calendario">
        {isDemo && <DemoTag show />}
        <WorkoutCalendar dates={dates} selected={sel} onSelect={(d) => setSel(d === sel ? null : d)} />
        {sel && <div className="mt-3 border-t border-slate-800 pt-2"><p className="text-sm font-semibold capitalize text-white">{fmtLong(sel)}</p>{onDay.length ? onDay.map((s) => <Row key={s.id} s={s} />) : <p className="text-sm text-slate-400">Sin entrenamiento este día.</p>}</div>}
      </Card>
      <Card title="Historial de entrenamientos">
        {list.length === 0 && <Empty text="No tienes sesiones registradas todavía." />}
        {list.map((s) => <Row key={s.id} s={s} />)}
      </Card>
    </div>
  )
}
