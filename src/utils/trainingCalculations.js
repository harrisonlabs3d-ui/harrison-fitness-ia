import { EXERCISES_BY_ID, STAT_GROUPS, statGroup } from '../data/exercises'
import { addDays, parseISO, todayISO } from './dateUtils'

const r1 = (x) => Math.round(x * 10) / 10
const done = (s) => s.completed && !s.skipped

// ---------- rutinas ----------
export const routineSets = (r) => r.exercises.reduce((a, e) => a + Number(e.sets), 0)
export const routineDuration = (r) => Math.round(r.exercises.reduce((a, e) => a + (e.sets * (40 + e.restSeconds)) / 60, 0) + r.exercises.length * 1.5)
export const routineGroups = (r) => [...new Set(r.exercises.map((e) => EXERCISES_BY_ID[e.exerciseId]?.muscleGroup).filter(Boolean))]
export const finalizeRoutine = (r) => ({ ...r, exercises: r.exercises.map((e, i) => ({ ...e, order: i + 1 })), muscleGroups: routineGroups(r), estimatedDuration: routineDuration(r) })

// La rutina de hoy es la siguiente en la rotación después de la última sesión real.
export function nextRoutine(routines, realSessions) {
  if (!routines.length) return null
  const sorted = [...routines].sort((a, b) => a.day - b.day)
  const last = [...realSessions].sort((a, b) => (a.date < b.date ? 1 : -1)).find((s) => s.routineId && sorted.some((r) => r.id === s.routineId))
  if (!last) return sorted[0]
  return sorted[(sorted.findIndex((r) => r.id === last.routineId) + 1) % sorted.length]
}

// ---------- volumen ----------
export const setVolume = (s) => (done(s) ? (Number(s.weight) || 0) * (Number(s.reps) || 0) : 0)
export const exerciseVolume = (ex) => ex.sets.reduce((a, s) => a + setVolume(s), 0)
export const sessionVolume = (s) => s.exercises.reduce((a, e) => a + exerciseVolume(e), 0)
export const sessionSets = (s) => s.exercises.reduce((a, e) => a + e.sets.filter(done).length, 0)
export const estimated1RM = (w, reps) => (w > 0 ? r1(w * (1 + reps / 30)) : 0) // Epley, solo orientativo
export const fmtKg = (n) => Math.round(n).toLocaleString('es-PE')

// ---------- semanas (lunes a domingo, calendario local) ----------
export const weekStart = (iso) => addDays(iso, -((parseISO(iso).getDay() + 6) % 7))
export const lastWeekStarts = (n, end = todayISO()) => Array.from({ length: n }, (_, i) => addDays(weekStart(end), -7 * (n - 1 - i)))
export const sessionsInWeek = (sessions, start) => sessions.filter((s) => s.date >= start && s.date <= addDays(start, 6))
export function weekSummary(sessions, start) {
  const list = sessionsInWeek(sessions, start)
  return { count: list.length, sets: list.reduce((a, s) => a + sessionSets(s), 0), volume: list.reduce((a, s) => a + sessionVolume(s), 0) }
}
export function setsByGroup(sessions) {
  const out = Object.fromEntries(STAT_GROUPS.map((g) => [g, 0]))
  sessions.forEach((s) => s.exercises.forEach((e) => { const g = statGroup(e.muscleGroup || EXERCISES_BY_ID[e.exerciseId]?.muscleGroup); if (g in out) out[g] += e.sets.filter(done).length }))
  return out
}
export function volumeByGroup(sessions) {
  const out = Object.fromEntries(STAT_GROUPS.map((g) => [g, 0]))
  sessions.forEach((s) => s.exercises.forEach((e) => { const g = statGroup(e.muscleGroup || EXERCISES_BY_ID[e.exerciseId]?.muscleGroup); if (g in out) out[g] += exerciseVolume(e) }))
  return out
}

// ---------- historial y progresión ----------
const byRecent = (a, b) => (a.date === b.date ? (b.endedAt || 0) - (a.endedAt || 0) : a.date < b.date ? 1 : -1)
export function exerciseHistory(sessions, exerciseId) {
  return [...sessions].sort(byRecent).map((s) => ({ date: s.date, session: s, ex: s.exercises.find((e) => e.exerciseId === exerciseId) }))
    .filter((x) => x.ex && x.ex.sets.some(done)).map((x) => ({ date: x.date, sets: x.ex.sets.filter(done) }))
}
export const lastPerformance = (sessions, exerciseId) => exerciseHistory(sessions, exerciseId)[0] || null

// Doble progresión: sube el peso al completar el rango superior con esfuerzo razonable (RIR <= 2).
export function progressionSuggestion(cfg, history, equipment = 'mancuernas') {
  const [last, prev] = history
  if (!last) return null
  const sets = last.sets
  const w = Math.max(...sets.map((s) => Number(s.weight) || 0))
  const full = sets.length >= cfg.sets
  const allMax = full && sets.every((s) => s.reps >= cfg.repsMax)
  const effortOk = sets.every((s) => (s.rir != null ? s.rir <= 2 : s.rpe != null ? s.rpe >= 8 : true))
  const vol = (a) => a.reduce((x, s) => x + (Number(s.weight) || 0) * s.reps, 0)
  const dropped = prev && vol(prev.sets) > 0 && vol(sets) < 0.8 * vol(prev.sets)
  if (allMax && effortOk) {
    if (w === 0) return { type: 'increase', weight: 0, nextWeight: null, message: 'Sugerencia: sumar repeticiones o añadir lastre en la próxima sesión.' }
    const next = r1(w + (equipment === 'gimnasio' ? 2.5 : 2))
    return { type: 'increase', weight: w, nextWeight: next, message: `Sugerencia: aumentar ligeramente la carga en la próxima sesión y volver a ${cfg.repsMin} repeticiones.` }
  }
  if (dropped) return { type: 'reduce', weight: w, nextWeight: null, message: 'Considerar reducir carga o revisar recuperación.' }
  if (sets.some((s) => s.reps < cfg.repsMin)) return { type: 'maintain', weight: w, nextWeight: null, message: 'Mantener carga.' }
  if (!full) return { type: 'maintain', weight: w, nextWeight: null, message: 'Mantener carga y completar todas las series programadas.' }
  return { type: 'progress', weight: w, nextWeight: null, message: `Mantén ${w} kg y busca sumar repeticiones hasta ${cfg.repsMax} en todas las series.` }
}

// ---------- récords personales (comparados con sesiones anteriores) ----------
export const PR_LABEL = { peso: 'Mayor peso', reps: 'Más repeticiones con la misma carga', volumen: 'Mejor volumen', e1rm: 'Mejor rendimiento estimado' }
export function detectPRs(prevSessions, exercises) {
  const prs = []
  exercises.forEach((ex) => {
    if (!ex.exerciseId) return
    const cur = ex.sets.filter(done)
    const hist = exerciseHistory(prevSessions, ex.exerciseId)
    if (!cur.length || !hist.length) return // la primera vez no se considera récord
    const prior = hist.flatMap((h) => h.sets)
    const types = []
    const maxW = Math.max(...prior.map((s) => Number(s.weight) || 0))
    if (Math.max(...cur.map((s) => Number(s.weight) || 0)) > maxW) types.push('peso')
    if (cur.some((s) => { const same = prior.filter((p) => p.weight === s.weight); return same.length && s.reps > Math.max(...same.map((p) => p.reps)) })) types.push('reps')
    if (exerciseVolume({ sets: cur }) > Math.max(...hist.map((h) => exerciseVolume({ sets: h.sets })))) types.push('volumen')
    if (Math.max(...cur.map((s) => estimated1RM(s.weight, s.reps))) > Math.max(...prior.map((s) => estimated1RM(s.weight, s.reps)))) types.push('e1rm')
    if (types.length) { const top = [...cur].sort((a, b) => b.weight - a.weight || b.reps - a.reps)[0]; prs.push({ exerciseId: ex.exerciseId, name: ex.name, types, detail: `${top.weight} kg × ${top.reps}` }) }
  })
  return prs
}

// ---------- recuperación e insights (solo con datos registrados) ----------
export function recoveryInfo(sessions, today = todayISO()) {
  const days = (iso) => Math.round((parseISO(today) - parseISO(iso)) / 864e5)
  const sorted = [...sessions].sort(byRecent)
  const last = sorted[0]
  const lines = []
  if (last) lines.push(`Han pasado ${days(last.date)} días desde tu última sesión (${last.routineName}).`)
  STAT_GROUPS.forEach((g) => {
    const s = sorted.find((x) => x.exercises.some((e) => statGroup(e.muscleGroup || EXERCISES_BY_ID[e.exerciseId]?.muscleGroup) === g && e.sets.some(done)))
    if (s) lines.push(`Han pasado ${days(s.date)} días desde tu última sesión de ${g.toLowerCase()}.`)
  })
  const w = weekStart(today), cur = weekSummary(sessions, w), prev = weekSummary(sessions, addDays(w, -7))
  lines.push(`Esta semana llevas ${cur.count} sesiones y ${fmtKg(cur.volume)} kg de volumen; la anterior fueron ${prev.count} sesiones y ${fmtKg(prev.volume)} kg.`)
  return lines
}
// Punto único para reemplazar por una IA real en una fase futura.
export function generateTrainingInsight({ sessions, routines, target = 4, today = todayISO() }) {
  const out = []
  const next = nextRoutine(routines, sessions)
  if (next) out.push(`Hoy toca ${next.name.toLowerCase()}.`)
  const w = weekStart(today), cur = weekSummary(sessions, w), prev = weekSummary(sessions, addDays(w, -7))
  out.push(`Has completado ${cur.count} de ${target} entrenamientos esta semana.`)
  if (prev.volume > 0 && cur.volume > 0) { const p = Math.round(((cur.volume - prev.volume) / prev.volume) * 100); out.push(`Tu volumen de esta semana (hasta hoy) es ${Math.abs(p)}% ${p >= 0 ? 'mayor' : 'menor'} que el de la semana anterior completa.`) }
  return out
}

// ---------- sesión activa ----------
export function buildActiveSession(routine) {
  return {
    id: `s-${Date.now()}`, routineId: routine.id, routineName: routine.name, startedAt: Date.now(), cur: 0,
    exercises: routine.exercises.map((c) => ({
      exerciseId: c.exerciseId, name: EXERCISES_BY_ID[c.exerciseId]?.name || c.exerciseId, muscleGroup: EXERCISES_BY_ID[c.exerciseId]?.muscleGroup,
      cfg: { sets: c.sets, repsMin: c.repsMin, repsMax: c.repsMax, restSeconds: c.restSeconds, targetRIR: c.targetRIR },
      sets: Array.from({ length: c.sets }, (_, i) => ({ setNumber: i + 1, weight: null, reps: null, rir: null, rpe: null, completed: false, skipped: false, timestamp: null })),
    })),
  }
}
export function finishSession(active, today = todayISO()) {
  const endedAt = Date.now()
  const exercises = active.exercises.map((e) => ({ exerciseId: e.exerciseId, name: e.name, muscleGroup: e.muscleGroup, sets: e.sets.filter(done) })).filter((e) => e.sets.length)
  return { id: active.id, type: 'real', date: today, routineId: active.routineId, routineName: active.routineName, startedAt: active.startedAt, endedAt, durationMin: Math.max(1, Math.round((endedAt - active.startedAt) / 60000)), exercises, prs: [] }
}
