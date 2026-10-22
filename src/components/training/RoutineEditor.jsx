import { useState } from 'react'
import { Btn, Field } from '../ui'
import ExerciseSelector from './ExerciseSelector'
import { EXERCISES_BY_ID } from '../../data/exercises'
import { configFor } from '../../data/routines'
import { finalizeRoutine, routineDuration, routineSets } from '../../utils/trainingCalculations'

const num = (v) => (v === '' ? NaN : Number(v))
export default function RoutineEditor({ routine, nextDay, onSave, onClose }) {
  const [name, setName] = useState(routine?.name || '')
  const [day, setDay] = useState(String(routine?.day || nextDay))
  const [ex, setEx] = useState(routine?.exercises || [])
  const [pick, setPick] = useState(false)
  const [err, setErr] = useState('')
  const set = (i, k, v) => setEx(ex.map((e, j) => (j === i ? { ...e, [k]: v } : e)))
  const move = (i, d) => { const j = i + d; if (j < 0 || j >= ex.length) return; const a = [...ex]; [a[i], a[j]] = [a[j], a[i]]; setEx(a) }
  const save = () => {
    if (!name.trim()) return setErr('Escribe un nombre para la rutina.')
    if (!ex.length) return setErr('Agrega al menos un ejercicio.')
    for (const e of ex) {
      if (!(num(e.sets) >= 1) || !Number.isInteger(num(e.sets))) return setErr('Las series deben ser un entero mayor que 0.')
      if (!(num(e.repsMin) >= 1) || !(num(e.repsMax) >= num(e.repsMin))) return setErr('Las repeticiones deben ser mayores que 0 y el máximo no puede ser menor que el mínimo.')
      if (!(num(e.targetRIR) >= 0 && num(e.targetRIR) <= 5)) return setErr('El RIR objetivo va de 0 a 5.')
    }
    onSave(finalizeRoutine({ id: routine?.id || `r-${Date.now()}`, name: name.trim(), day: Number(day) || nextDay, exercises: ex.map((e) => ({ ...e, sets: +e.sets, repsMin: +e.repsMin, repsMax: +e.repsMax, restSeconds: +e.restSeconds, targetRIR: +e.targetRIR })) }))
  }
  const tmp = { exercises: ex.map((e) => ({ ...e, sets: +e.sets || 0, restSeconds: +e.restSeconds || 0 })) }
  const nf = 'w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white'
  return (
    <div role="dialog" aria-modal="true" aria-label="Editar rutina" className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-2 md:items-center">
      <div className="max-h-[92vh] w-full max-w-lg space-y-3 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-4">
        <h2 className="text-lg font-semibold text-white">{routine ? 'Editar rutina' : 'Nueva rutina'}</h2>
        <div className="grid grid-cols-3 gap-3"><div className="col-span-2"><Field label="Nombre" value={name} onChange={(e) => setName(e.target.value)} /></div><Field label="Orden / día" type="number" value={day} onChange={(e) => setDay(e.target.value)} /></div>
        {ex.map((e, i) => (
          <div key={e.exerciseId + i} className="rounded-lg border border-slate-800 p-3">
            <div className="flex items-center justify-between gap-2"><p className="text-white">{i + 1}. {EXERCISES_BY_ID[e.exerciseId]?.name}</p>
              <div className="flex shrink-0"><button aria-label="Subir" className="px-2 py-1" onClick={() => move(i, -1)}>↑</button><button aria-label="Bajar" className="px-2 py-1" onClick={() => move(i, 1)}>↓</button><button aria-label={`Quitar ${EXERCISES_BY_ID[e.exerciseId]?.name}`} className="px-2 py-1 text-red-400" onClick={() => setEx(ex.filter((_, j) => j !== i))}>✕</button></div></div>
            <div className="mt-2 grid grid-cols-5 gap-2 text-xs text-slate-400">
              <label>Series<input aria-label={`Series ${i + 1}`} className={nf} type="number" value={e.sets} onChange={(v) => set(i, 'sets', v.target.value)} /></label>
              <label>Rep mín<input aria-label={`Repeticiones mínimas ${i + 1}`} className={nf} type="number" value={e.repsMin} onChange={(v) => set(i, 'repsMin', v.target.value)} /></label>
              <label>Rep máx<input aria-label={`Repeticiones máximas ${i + 1}`} className={nf} type="number" value={e.repsMax} onChange={(v) => set(i, 'repsMax', v.target.value)} /></label>
              <label>Desc.<select aria-label={`Descanso ${i + 1}`} className={nf} value={e.restSeconds} onChange={(v) => set(i, 'restSeconds', v.target.value)}>{[30, 45, 60, 75, 90, 120, 150, 180].map((n) => <option key={n} value={n}>{n} s</option>)}</select></label>
              <label>RIR<input aria-label={`RIR objetivo ${i + 1}`} className={nf} type="number" value={e.targetRIR} onChange={(v) => set(i, 'targetRIR', v.target.value)} /></label>
            </div>
          </div>
        ))}
        <Btn variant="ghost" className="min-h-11" onClick={() => setPick(true)}>+ Agregar ejercicio</Btn>
        <p className="text-sm text-slate-400">{ex.length} ejercicios · {routineSets(tmp)} series · ~{routineDuration(tmp)} min</p>
        {err && <p role="alert" className="text-sm text-red-400">{err}</p>}
        <div className="flex gap-2"><Btn className="min-h-11" onClick={save}>Guardar rutina</Btn><Btn variant="ghost" className="min-h-11" onClick={onClose}>Cancelar</Btn></div>
      </div>
      {pick && <ExerciseSelector onClose={() => setPick(false)} onPick={(e) => { setEx([...ex, configFor(e.id, ex.length + 1)]); setPick(false) }} />}
    </div>
  )
}
