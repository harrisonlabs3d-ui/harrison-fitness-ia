import { useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { Card, Select, Empty } from '../ui'
import { DemoTag } from './parts'
import { EXERCISES_BY_ID } from '../../data/exercises'
import { lastWeekStarts, weekSummary, setsByGroup, exerciseHistory, sessionsInWeek } from '../../utils/trainingCalculations'
import { fmtShort, addDays, todayISO } from '../../utils/dateUtils'

const tip = { contentStyle: { background: '#0f172a', border: '1px solid #334155' } }
function TrainingChart({ data, kind = 'bar', unit, label }) {
  const C = kind === 'bar' ? BarChart : LineChart
  return (
    <div className="h-48 w-full" role="img" aria-label={label}>
      <ResponsiveContainer><C data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid stroke="#1e293b" /><XAxis dataKey="name" stroke="#64748b" fontSize={11} /><YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
        <Tooltip {...tip} formatter={(v) => [`${v} ${unit}`]} />
        {kind === 'bar' ? <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} /> : <Line type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={2.5} dot={{ r: 3 }} />}
      </C></ResponsiveContainer>
    </div>
  )
}
export default function TrainingStats({ sessions, isDemo }) {
  const weeks = lastWeekStarts(4)
  const wk = weeks.map((w) => ({ name: fmtShort(w), ...weekSummary(sessions, w) }))
  const used = [...new Set(sessions.flatMap((s) => s.exercises.map((e) => e.exerciseId).filter(Boolean)))]
  const [exId, setExId] = useState('')
  const cur = exId && used.includes(exId) ? exId : used[0]
  const evo = cur ? [...exerciseHistory(sessions, cur)].reverse().map((h) => ({ name: fmtShort(h.date), value: Math.max(...h.sets.map((s) => Number(s.weight) || 0)) })) : []
  const g = setsByGroup(sessions.filter((s) => s.date >= addDays(todayISO(), -27)))
  if (!sessions.length) return <Card title="Estadísticas"><Empty text="Registra entrenamientos para ver tus estadísticas." /></Card>
  return (
    <div className="space-y-4">
      {isDemo && <DemoTag show />}
      <Card title="Volumen semanal (kg)"><TrainingChart label="Volumen por semana" unit="kg" data={wk.map((w) => ({ name: w.name, value: Math.round(w.volume) }))} /></Card>
      <Card title="Frecuencia (entrenamientos por semana)"><TrainingChart label="Entrenamientos por semana" unit="sesiones" data={wk.map((w) => ({ name: w.name, value: w.count }))} /></Card>
      <Card title="Evolución de un ejercicio (peso máximo)">
        <Select label="Ejercicio" value={cur} onChange={(e) => setExId(e.target.value)}>{used.map((id) => <option key={id} value={id}>{EXERCISES_BY_ID[id]?.name || id}</option>)}</Select>
        <div className="mt-2"><TrainingChart kind="line" label="Evolución del ejercicio" unit="kg" data={evo} /></div>
      </Card>
      <Card title="Series por grupo muscular (últimas 4 semanas)"><TrainingChart label="Series por grupo" unit="series" data={Object.entries(g).map(([name, value]) => ({ name, value }))} /></Card>
      <p className="text-xs text-slate-500">{sessionsInWeek(sessions, weeks[3]).length} sesiones esta semana. Los gráficos usan solo sesiones registradas.</p>
    </div>
  )
}
