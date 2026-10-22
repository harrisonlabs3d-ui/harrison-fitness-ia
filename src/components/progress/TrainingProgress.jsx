import { useState } from 'react'
import { Card, Badge, Stat, Empty, Select, Bar } from '../ui'
import ProgressChart from './ProgressChart'
import { PRBadge } from '../training/parts'
import { trainingStats, calculateTrainingAdherence, getMetricSeries, exerciseOptions, strengthProgression, personalRecords, fmtKg } from '../../utils/progressCalculations'
import { fmtShort } from '../../utils/dateUtils'

export default function TrainingProgress({ data, b }) {
  const [ex, setEx] = useState('')
  if (!data.sessions.length) return <Card title="Entrenamiento"><Empty text="Completa tu primer entrenamiento." /></Card>
  const st = trainingStats(data, b), ad = calculateTrainingAdherence(data, b), opts = exerciseOptions(data)
  const cur = opts.some((o) => o.id === ex) ? ex : opts[0]?.id
  const prog = cur ? strengthProgression(data, cur, b) : []
  const records = personalRecords(data)
  const vol = getMetricSeries(data, 'volume', b)
  return (
    <Card title="Progreso de entrenamiento">
      {data.demo.training && <Badge kind="demo" />}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat label="Completados" value={`${ad.completed} / ${ad.scheduled}`} sub="vs programados" /><Stat label="Frecuencia semanal" value={`${ad.perWeek}`} /><Stat label="Series" value={st.sets} /><Stat label="Volumen" value={`${fmtKg(st.volume)} kg`} /><Stat label="PR" value={st.prCount} />
      </div>
      <div className="mt-3"><Bar label="Consistencia de entrenamiento" value={Math.min(100, ad.pct)} max={100} unit="%" /><p className="mt-1 text-sm text-slate-300">Consistencia de entrenamiento: <b className="text-white">{ad.pct}%</b> <span className="text-slate-500">(sesiones completadas ÷ programadas por tu perfil)</span></p></div>
      <p className="mt-4 text-sm font-semibold text-white">Volumen semanal</p>
      {vol.points.some((p) => p.v > 0) ? <ProgressChart series={vol} label="Volumen semanal" /> : <p className="text-sm text-slate-400">Sin sesiones en este rango.</p>}
      <p className="mt-4 text-sm font-semibold text-white">Progresión de fuerza</p>
      <Select label="Ejercicio" value={cur} onChange={(e) => setEx(e.target.value)}>{opts.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</Select>
      {prog.length ? <><div className="mt-2 text-sm text-slate-300">{prog.map((r, i) => <p key={r.date}>Semana {i + 1} ({fmtShort(r.date)}): <b className="text-white">{r.weight} kg × {r.reps}</b></p>)}</div>
        <ProgressChart series={{ points: prog.map((r) => ({ date: r.date, v: r.weight })), unit: 'kg', kind: 'line' }} label="Progresión de fuerza" color="#60a5fa" /></> : <p className="mt-2 text-sm text-slate-400">Sin registros de este ejercicio en el rango.</p>}
      <p className="mt-4 text-sm font-semibold text-white">Récords</p>
      {records.length ? records.slice(0, 6).map((r) => <p key={r.exerciseId} className="text-sm text-slate-300">{r.name} · <b className="text-white">{r.detail}</b> <PRBadge types={r.types} /></p>) : <p className="text-sm text-slate-400">Aún no se han registrado récords personales.</p>}
    </Card>
  )
}
