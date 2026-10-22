import { EXERCISES, EXERCISES_BY_ID } from '../data/exercises'
import { configFor } from '../data/routines'
import { finalizeRoutine } from './trainingCalculations'

const SPLITS = {
  2: [['Cuerpo completo A', ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Core']], ['Cuerpo completo B', ['Piernas', 'Espalda', 'Pecho', 'Tríceps', 'Bíceps', 'Core']]],
  3: [['Empuje: Pecho + Hombros + Tríceps', ['Pecho', 'Hombros', 'Tríceps']], ['Tirón: Espalda + Bíceps', ['Espalda', 'Bíceps']], ['Piernas + Core', ['Piernas', 'Core']]],
  4: [['Pecho + Tríceps', ['Pecho', 'Tríceps']], ['Espalda + Bíceps', ['Espalda', 'Bíceps']], ['Piernas + Core', ['Piernas', 'Core']], ['Hombros + Brazos', ['Hombros', 'Bíceps', 'Tríceps']]],
}
SPLITS[5] = [...SPLITS[4], ['Cuerpo completo + Core', ['Piernas', 'Espalda', 'Pecho', 'Core']]]
const PARAMS = {
  recomposicion: { sets: 3, min: 8, max: 12, rest: 75, rir: 2 },
  hipertrofia: { sets: 3, min: 8, max: 12, rest: 90, rir: 1 },
  fuerza: { sets: 4, min: 4, max: 6, rest: 150, rir: 2 },
  mantenimiento: { sets: 2, min: 8, max: 12, rest: 60, rir: 3 },
}
const ALLOWED = { mancuernas: ['mancuernas', 'peso corporal'], 'peso corporal': ['peso corporal'], gimnasio: ['gimnasio', 'mancuernas', 'peso corporal'] }
const COUNT = { 30: 4, 45: 6, 60: 7 }

// Generador local basado en reglas (sin IA). Omite grupos sin ejercicios disponibles para el equipamiento elegido.
export function generateRoutines({ objective, days, equipment, duration }) {
  const p = PARAMS[objective] || PARAMS.recomposicion
  const allowed = ALLOWED[equipment] || ALLOWED.mancuernas
  const split = SPLITS[days] || SPLITS[4]
  const notes = []
  const routines = split.map(([name, groups], di) => {
    const total = COUNT[duration] || 6
    const gs = groups.slice(0, total)
    const base = Math.floor(total / gs.length), extra = total % gs.length
    const ids = []
    gs.forEach((g, gi) => {
      const pool = EXERCISES.filter((e) => e.muscleGroup === g && allowed.includes(e.equipment)).sort((a, b) => Number(b.compound) - Number(a.compound))
      if (!pool.length) { notes.push(`Sin ejercicios de ${g.toLowerCase()} para ${equipment}.`); return }
      const n = Math.min(pool.length, base + (gi < extra ? 1 : 0))
      for (let k = 0; k < n; k++) { const e = pool[(k + di) % pool.length]; if (!ids.includes(e.id)) ids.push(e.id) }
    })
    const exercises = ids.map((id, i) => {
      const e = EXERCISES_BY_ID[id], strength = objective === 'fuerza' && e.compound
      const timed = e.repUnit === 's'
      return configFor(id, i + 1, { sets: p.sets === 4 && !strength ? 3 : p.sets, repsMin: timed ? e.defaultReps[0] : strength ? p.min : Math.max(p.min, objective === 'fuerza' ? 8 : p.min), repsMax: timed ? e.defaultReps[1] : strength ? p.max : objective === 'fuerza' ? 12 : p.max, restSeconds: strength ? p.rest : Math.min(p.rest, e.defaultRest), targetRIR: p.rir })
    })
    return finalizeRoutine({ id: `r-gen-${Date.now()}-${di}`, name, day: di + 1, exercises })
  }).filter((r) => r.exercises.length)
  return { routines, notes: [...new Set(notes)] }
}
