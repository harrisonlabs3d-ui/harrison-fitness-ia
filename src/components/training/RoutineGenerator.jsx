import { useState } from 'react'
import { Card, Btn, Select } from '../ui'
import { generateRoutines } from '../../utils/routineGenerator'
import { EXERCISES_BY_ID } from '../../data/exercises'

export default function RoutineGenerator({ defaults, onUse }) {
  const [f, setF] = useState({ objective: defaults.objective, days: String(defaults.days), equipment: defaults.equipment, duration: '45' })
  const [res, setRes] = useState(null)
  const s = (k) => (e) => setF({ ...f, [k]: e.target.value })
  return (
    <Card title="Generar rutina">
      <div className="grid grid-cols-2 gap-3">
        <Select label="Objetivo" value={f.objective} onChange={s('objective')}><option value="recomposicion">Recomposición</option><option value="hipertrofia">Hipertrofia</option><option value="fuerza">Fuerza</option><option value="mantenimiento">Mantenimiento</option></Select>
        <Select label="Días por semana" value={f.days} onChange={s('days')}>{[2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}</Select>
        <Select label="Equipamiento" value={f.equipment} onChange={s('equipment')}><option value="mancuernas">Mancuernas</option><option value="peso corporal">Peso corporal</option><option value="gimnasio">Gimnasio</option></Select>
        <Select label="Duración" value={f.duration} onChange={s('duration')}>{[30, 45, 60].map((n) => <option key={n} value={n}>{n} min</option>)}</Select>
      </div>
      <Btn className="mt-3 min-h-11" onClick={() => setRes(generateRoutines({ ...f, days: +f.days, duration: +f.duration }))}>Generar rutina</Btn>
      {res && (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-slate-400">Propuesta basada en reglas simples (sin IA). Puedes editarla después de guardarla.</p>
          {res.routines.map((r) => <div key={r.id} className="rounded-lg border border-slate-800 p-3 text-sm"><p className="font-semibold text-white">Día {r.day} · {r.name} <span className="font-normal text-slate-400">· {r.exercises.length} ejercicios · ~{r.estimatedDuration} min</span></p><p className="text-slate-300">{r.exercises.map((e) => EXERCISES_BY_ID[e.exerciseId].name).join(' · ')}</p></div>)}
          {res.notes.map((n) => <p key={n} className="text-xs text-amber-300">{n}</p>)}
          <Btn className="min-h-11" onClick={() => onUse(res.routines)}>Usar como mis rutinas</Btn>
        </div>
      )}
    </Card>
  )
}
