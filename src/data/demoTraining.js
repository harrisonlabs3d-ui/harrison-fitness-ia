import { defaultRoutines } from './routines'
import { EXERCISES_BY_ID } from './exercises'
import { addDays, todayISO } from '../utils/dateUtils'
import { weekStart } from '../utils/trainingCalculations'

// Sesiones DEMO de las últimas 4 semanas (lunes, martes, jueves, sábado). Nunca se mezclan con las reales.
const BASE = { 'press-banca-mancuernas': 20, 'press-inclinado-mancuernas': 18, 'aperturas-mancuernas': 10, 'press-cerrado-mancuernas': 16, 'extension-sobre-cabeza': 14, 'patada-triceps': 6, 'remo-mancuerna': 22, 'remo-dos-mancuernas': 16, 'pullover-mancuerna': 16, 'curl-mancuernas': 10, 'curl-martillo': 10, 'curl-concentrado': 8, 'sentadilla-goblet': 24, 'peso-muerto-rumano': 24, zancadas: 12, 'hip-thrust': 30, 'elevacion-pantorrillas': 20, plancha: 0, 'press-militar-mancuernas': 14, 'elevaciones-laterales': 6, 'pajaros-reverse-fly': 6, 'curl-alternado': 10, 'encogimientos-hombros': 22 }

export function makeDemoSessions() {
  const today = todayISO(), ws = weekStart(today), routines = defaultRoutines(), sessions = []
  ;[3, 2, 1, 0].forEach((weeksAgo, wi) => {
    ;[0, 1, 3, 5].forEach((off, ri) => {
      const date = addDays(ws, -7 * weeksAgo + off)
      if (date > today) return
      const r = routines[ri]
      const exercises = r.exercises.map((c) => {
        const e = EXERCISES_BY_ID[c.exerciseId], w0 = BASE[c.exerciseId] ?? 10
        const weight = w0 === 0 ? 0 : w0 + wi * (e.compound ? 2 : 1)
        return { exerciseId: c.exerciseId, name: e.name, muscleGroup: e.muscleGroup, sets: Array.from({ length: c.sets }, (_, s) => ({ setNumber: s + 1, weight, reps: e.repUnit === 's' ? 40 + wi * 5 : Math.max(c.repsMin, Math.min(c.repsMax, 9 + (wi % 3) - s)), rir: 2, rpe: null, completed: true, skipped: false, timestamp: null })) }
      })
      sessions.push({ id: `demo-s-${wi}-${ri}`, type: 'demo', date, routineId: r.id, routineName: r.name, startedAt: null, endedAt: null, durationMin: 44 + wi + ri * 2, exercises, prs: [] })
    })
  })
  return sessions
}
export const freshTrainingDemo = () => ({ sessions: makeDemoSessions() })
export const noTrainingDemo = () => ({ sessions: [] })
