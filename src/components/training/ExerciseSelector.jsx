import { useState } from 'react'
import { Btn } from '../ui'
import { EXERCISES, MUSCLE_GROUPS } from '../../data/exercises'

const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
export function ExerciseCard({ e, onPick }) {
  return (
    <button className="min-h-14 w-full border-t border-slate-800 py-2 text-left" onClick={() => onPick(e)}>
      <span className="block text-white">{e.name}</span>
      <span className="text-xs text-slate-400">{e.muscleGroup} · {e.equipment} · {e.difficulty}</span>
    </button>
  )
}
export default function ExerciseSelector({ onPick, onClose }) {
  const [q, setQ] = useState('')
  const [g, setG] = useState('Todos')
  const list = EXERCISES.filter((e) => (g === 'Todos' || e.muscleGroup === g) && (!q || norm(e.name).includes(norm(q))))
  return (
    <div role="dialog" aria-modal="true" aria-label="Elegir ejercicio" className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-2 md:items-center">
      <div className="max-h-[90vh] w-full max-w-md space-y-3 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-4">
        <h2 className="text-lg font-semibold text-white">Agregar ejercicio</h2>
        <input type="search" autoFocus aria-label="Buscar ejercicio" placeholder="Buscar ejercicio…" value={q} onChange={(e) => setQ(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-base text-white" />
        <div className="flex gap-2 overflow-x-auto">{['Todos', ...MUSCLE_GROUPS].map((x) => <Btn key={x} variant={g === x ? 'primary' : 'ghost'} aria-pressed={g === x} className="whitespace-nowrap px-3 py-1 text-sm" onClick={() => setG(x)}>{x}</Btn>)}</div>
        <div className="max-h-[45vh] overflow-y-auto">{list.map((e) => <ExerciseCard key={e.id} e={e} onPick={onPick} />)}{!list.length && <p className="py-4 text-center text-sm text-slate-400">Sin resultados.</p>}</div>
        <Btn variant="ghost" onClick={onClose}>Cerrar</Btn>
      </div>
    </div>
  )
}
