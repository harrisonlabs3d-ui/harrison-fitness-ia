import { addDays, parseISO, todayISO, toISODate } from './dateUtils'
import { calculateDailyTotals, getNextMeal } from './nutritionCalculations'
import { weekStart } from './trainingCalculations'
import { HABITS, DEFAULT_TRAINING_DAYS } from '../data/habits'

const r1 = (x) => Math.round(x * 10) / 10
export const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m }
export const fmtDuration = (min) => `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, '0')}m`
export const fmtL = (ml) => (ml / 1000).toFixed(2).replace(/\.?0+$/, '')
export const fmtLongFull = (iso) => parseISO(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()

// ---------- sueño ----------
export const sleepDuration = (sleepTime, wakeTime) => { if (sleepTime === wakeTime) return 0; let d = toMin(wakeTime) - toMin(sleepTime); if (d <= 0) d += 1440; return d }
export function validateSleep({ sleepTime, wakeTime, quality }) {
  if (!sleepTime || !wakeTime) return 'Indica la hora de dormir y la de despertar.'
  const d = sleepDuration(sleepTime, wakeTime)
  if (d < 30 || d > 960) return 'Revisa las horas: la duración debe estar entre 30 minutos y 16 horas.'
  if (quality != null && !(Number.isInteger(quality) && quality >= 1 && quality <= 5)) return 'La calidad va de 1 a 5.'
  return ''
}
export function validateActivity({ steps, activityMinutes }) {
  if (steps === '' || !Number.isInteger(Number(steps)) || Number(steps) < 0) return 'Los pasos deben ser un número entero de 0 o más.'
  if (Number(steps) > 100000) return 'Revisa los pasos: el valor parece demasiado alto.'
  if (activityMinutes !== '' && (!(Number(activityMinutes) >= 0) || Number(activityMinutes) > 1440)) return 'Los minutos deben estar entre 0 y 1440.'
  return ''
}

// ---------- datos de entrada ----------
// Modo estricto: o todo REAL o todo DEMO. El demo solo aparece si no existe ningún dato real de hábitos.
export function habitMode(d) {
  const hasReal = Object.values(d.water).some((v) => v > 0) || d.meals.length || d.sessions.length || d.sleep.length || d.activity.length || Object.keys(d.habits.checks).length
  return !hasReal && d.demo.active && (d.habitDemo.sleep.length || d.habitDemo.activity.length) ? 'demo' : 'real'
}
const group = (list, key = 'date') => list.reduce((m, x) => { (m[x[key]] = m[x[key]] || []).push(x); return m }, {})
export function buildHabitData(d, t, today = todayISO()) {
  const demo = habitMode(d) === 'demo', s = d.habitSettings
  const sleep = demo ? d.habitDemo.sleep : d.sleep, activity = demo ? d.habitDemo.activity : d.activity
  const meals = demo ? d.demo.meals : d.meals, sessions = demo ? d.trainingDemo.sessions : d.sessions
  return {
    mode: demo ? 'demo' : 'real', demo, today, water: demo ? d.demo.water : d.water, meals, sessions, sleep, activity,
    mealsBy: group(meals), sessBy: group(sessions), sleepBy: Object.fromEntries(sleep.map((x) => [x.date, x])), actBy: Object.fromEntries(activity.map((x) => [x.date, x])),
    goals: { waterMl: t.agua, protein: t.prot, kcal: t.kcal, sleepMin: Math.round(s.sleepGoalH * 60), steps: s.stepsGoal }, streakMin: s.streakMin, nutritionPct: s.nutritionPct,
    trainingDays: s.trainingDays ?? DEFAULT_TRAINING_DAYS[Number(d.profile.diasSemana)] ?? DEFAULT_TRAINING_DAYS[4],
    custom: d.habits.customHabits.filter((h) => h.enabled), checks: d.habits.checks, profile: d.profile, mealTimes: d.scheduleSettings?.mealTimes || {},
  }
}
export function earliestHabitDate(hd) {
  const dates = [...Object.entries(hd.water).filter(([, v]) => v > 0).map(([k]) => k), ...hd.meals.map((x) => x.date), ...hd.sessions.map((x) => x.date), ...hd.sleep.map((x) => x.date), ...hd.activity.map((x) => x.date), ...Object.keys(hd.checks)].sort()
  return dates[0] || null
}

// ---------- hábitos de un día ----------
export function getDayHabits(hd, date) {
  const future = date > hd.today, isToday = date === hd.today
  const miss = future ? 'future' : isToday ? 'pending' : 'not_recorded'
  const g = hd.goals
  const mealsOfDay = hd.mealsBy[date] || [], tot = calculateDailyTotals(mealsOfDay)
  const ml = hd.water[date] || 0
  const sess = hd.sessBy[date] || [], scheduled = hd.trainingDays.includes(parseISO(date).getDay())
  const sl = hd.sleepBy[date], act = hd.actBy[date]
  const mins = sl?.duration || 0, steps = act?.steps || 0
  const kcalGoal = g.kcal * (hd.nutritionPct / 100)
  const pick = (done, partial) => (future ? 'future' : done ? 'completed' : partial ? 'in_progress' : miss)
  const base = [
    { id: 'water', value: ml, goal: g.waterMl, unit: 'ml', status: pick(ml >= g.waterMl, ml > 0), progress: Math.min(1, ml / g.waterMl) },
    { id: 'protein', value: tot.protein, goal: g.protein, unit: 'g', status: pick(tot.protein >= g.protein, tot.protein > 0), progress: Math.min(1, tot.protein / g.protein) },
    { id: 'training', value: sess.length, goal: 1, unit: 'sesión', scheduled, applicable: scheduled || sess.length > 0, status: sess.length ? 'completed' : scheduled ? miss : future ? 'future' : 'rest', progress: sess.length ? 1 : 0 },
    { id: 'sleep', value: mins, goal: g.sleepMin, unit: 'min', record: sl, status: pick(mins >= g.sleepMin && !!sl, !!sl), progress: Math.min(1, mins / g.sleepMin) },
    { id: 'nutrition', value: tot.calories, goal: g.kcal, unit: 'kcal', logged: mealsOfDay.length, status: pick(tot.calories >= kcalGoal, mealsOfDay.length > 0), progress: Math.min(1, tot.calories / kcalGoal) },
    { id: 'activity', value: steps, goal: g.steps, unit: 'pasos', record: act, status: pick(steps >= g.steps, steps > 0 || act?.activityMinutes > 0), progress: Math.min(1, steps / g.steps) },
  ].map((h) => ({ applicable: true, ...HABITS.find((x) => x.id === h.id), ...h }))
  hd.custom.forEach((c) => { const done = !!hd.checks[date]?.[c.id]; base.push({ id: c.id, label: c.name, icon: c.icon || '✅', applicable: true, custom: true, value: done ? 1 : 0, goal: 1, unit: '', status: pick(done, false), progress: done ? 1 : 0 }) })
  const applicable = future ? [] : base.filter((h) => h.applicable)
  const completed = applicable.filter((h) => h.status === 'completed').length
  const hasData = !future && base.some((h) => h.status === 'completed' || h.status === 'in_progress')
  const consistency = applicable.length ? Math.round((completed / applicable.length) * 100) : null
  const state = future ? 'future' : !hasData ? 'none' : consistency >= hd.streakMin ? 'high' : 'partial'
  return { date, habits: base, applicable, completed, consistency, hasData, state }
}
export const computeDays = (hd, from, to) => { const out = []; for (let x = from, n = 0; x <= to && n < 800; x = addDays(x, 1), n++) out.push(getDayHabits(hd, x)); return out }
export const calculateHabitCompletion = (h) => ({ status: h.status, pct: Math.round(h.progress * 100) })
export const calculateDailyConsistency = (day) => day.consistency

// ---------- semana, rachas ----------
export function calculateWeeklyConsistency(hd, start) {
  // Solo cuentan los días desde tu primer registro de hábitos (antes de eso no habías empezado).
  const first = earliestHabitDate(hd), days = computeDays(hd, start, addDays(start, 6)), elapsed = first ? days.filter((x) => x.date <= hd.today && x.date >= first) : []
  const completed = elapsed.reduce((a, x) => a + x.completed, 0), applicable = elapsed.reduce((a, x) => a + x.applicable.length, 0)
  const trainOf = (x) => x.habits.find((h) => h.id === 'training')
  return {
    start, days, completed, applicable, consistency: applicable ? Math.round((completed / applicable) * 100) : null,
    activeDays: elapsed.filter((x) => x.hasData).length, trainingDone: days.filter((x) => trainOf(x).status === 'completed').length, trainingScheduled: days.filter((x) => trainOf(x).scheduled).length,
    nutritionDays: elapsed.filter((x) => x.habits.find((h) => h.id === 'nutrition').logged > 0).length,
  }
}
// Un día cuenta para la racha si tiene datos y su consistencia alcanza el mínimo. Los días sin registro la cortan; hoy en curso no la rompe.
export function calculateStreaks(hd) {
  const first = earliestHabitDate(hd)
  if (!first) return { current: 0, best: 0, days: [] }
  const days = computeDays(hd, first, hd.today), q = (x) => x.state === 'high'
  let best = 0, run = 0
  days.forEach((x) => { if (q(x)) { run += 1; best = Math.max(best, run) } else run = 0 })
  let i = days.length - 1
  if (!q(days[i])) i -= 1
  let current = 0
  while (i >= 0 && q(days[i])) { current += 1; i -= 1 }
  return { current, best, days }
}
export const calculateStreak = (hd) => calculateStreaks(hd).current
export const calculateBestStreak = (hd) => calculateStreaks(hd).best
export const getApplicableHabits = (day) => day.applicable
export const summarizeDays = (days, first) => {
  const past = days.filter((x) => x.state !== 'future' && first && x.date >= first)
  const completed = past.reduce((a, x) => a + x.completed, 0), applicable = past.reduce((a, x) => a + x.applicable.length, 0)
  return { completed, applicable, consistency: applicable ? Math.round((completed / applicable) * 100) : null, daysWithData: past.filter((x) => x.hasData).length, days: past.length }
}

// ---------- textos, pendientes, próxima acción, insights ----------
export function habitText(h) {
  switch (h.id) {
    case 'water': return `${fmtL(h.value)} / ${fmtL(h.goal)} L`
    case 'protein': return `${Math.round(h.value)} / ${h.goal} g`
    case 'nutrition': return h.logged ? `${Math.round(h.value)} / ${h.goal} kcal` : 'Sin alimentos registrados'
    case 'sleep': return h.record ? `${fmtDuration(h.value)} / ${fmtDuration(h.goal)}` : 'Sin registro'
    case 'activity': return h.record ? `${h.value.toLocaleString('es-PE')} / ${h.goal.toLocaleString('es-PE')} pasos` : 'Sin registro'
    case 'training': return { completed: 'Completado', pending: 'Programado', not_recorded: 'No registrado', rest: 'Descanso', future: h.scheduled ? 'Programado' : 'Descanso' }[h.status]
    default: return h.status === 'completed' ? 'Hecho' : 'Pendiente'
  }
}
export const STATUS_LABEL = { completed: 'Completado', in_progress: 'En progreso', pending: 'Pendiente', not_recorded: 'No registrado', rest: 'Descanso', future: '' }
export const STATUS_GLYPH = { completed: '✓', in_progress: '◐', pending: '○', not_recorded: '○', rest: '☾', future: '' }

export function getPendingHabits(day) {
  return day.applicable.filter((h) => (h.status === 'pending' || h.status === 'in_progress') && !(h.id === 'sleep' && h.record)).map((h) => {
    const rem = h.goal - h.value
    const text = { water: `${Math.round(rem)} ml de agua`, protein: `${Math.round(rem)} g de proteína`, activity: `${Math.round(rem).toLocaleString('es-PE')} pasos`, training: 'Entrenamiento de hoy', sleep: 'Registrar sueño', nutrition: 'Registrar alimentación' }[h.id] || h.label
    return { id: h.id, icon: h.icon, text, remaining: 1 - h.progress }
  }).sort((a, b) => b.remaining - a.remaining || HABITS.findIndex((x) => x.id === a.id) - HABITS.findIndex((x) => x.id === b.id))
}
export function getNextAction(day, hd, now = new Date()) {
  const hour = now.getHours() + now.getMinutes() / 60, next = getNextMeal(now, hd.mealTimes)
  const scored = getPendingHabits(day).map((p) => {
    let score = p.remaining
    if (p.id === 'training' && hour >= 5 && hour < 20) score += 0.15
    if (p.id === 'training' && hour >= 21) score -= 0.5
    if (p.id === 'water' && hour >= 12 && p.remaining > 0.5) score += 0.1
    if (p.id === 'nutrition' && !next.tomorrow && Math.abs(parseInt(next.time) * 60 + parseInt(next.time.slice(3)) - hour * 60) <= 60) score += 0.1
    return { ...p, score }
  }).sort((a, b) => b.score - a.score)
  const top = scored[0]
  if (!top) return null
  const h = day.habits.find((x) => x.id === top.id), rem = h.goal - h.value
  const label = { water: `Tomar ${rem >= 500 ? 500 : Math.max(50, Math.round(rem / 50) * 50)} ml de agua`, protein: `Sumar ${Math.round(rem)} g de proteína${next.tomorrow ? '' : ` (próxima comida: ${next.label})`}`, training: 'Entrenamiento de hoy', sleep: 'Registrar tu sueño', nutrition: `Registrar ${next.tomorrow ? 'tu alimentación' : next.label}`, activity: `Sumar ${Math.round(rem).toLocaleString('es-PE')} pasos` }[top.id] || h.label
  return { habitId: top.id, icon: top.icon, label }
}
// Mensajes descriptivos y no médicos, basados en los datos del día.
export function generateHabitInsight(day, hd, now = new Date()) {
  const out = [], hour = now.getHours(), by = (id) => day.habits.find((h) => h.id === id)
  const w = by('water'), p = by('protein'), tr = by('training'), sl = by('sleep')
  if (tr.applicable && tr.status === 'completed') out.push('Entrenamiento completado.')
  else if (tr.applicable && tr.scheduled && tr.status === 'pending') out.push('Te falta completar tu entrenamiento.')
  if (w.status !== 'completed') { if (w.progress < 0.5 && hour >= 15) out.push('Tu consumo de agua está por debajo de tu objetivo.'); out.push(`Te faltan ${Math.round(w.goal - w.value)} ml de agua.`) }
  if (p.status !== 'completed') { const rem = Math.round(p.goal - p.value); out.push(rem <= 40 ? `Te faltan ${rem} g de proteína para alcanzar tu objetivo.` : `Te faltan ${rem} g de proteína.`) }
  if (!sl.record && hour < 12) out.push('Te falta registrar el sueño de anoche.')
  if (day.applicable.length && day.completed === day.applicable.length) out.push('Completaste todos tus hábitos de hoy.')
  return out
}
export function getHabitContext(hd, now = new Date()) {
  const day = getDayHabits(hd, hd.today), by = (id) => day.habits.find((h) => h.id === id), pick = (id) => { const h = by(id); return { value: h.value, goal: h.goal, status: h.status } }
  return { date: hd.today, mode: hd.mode, consistency: day.consistency, currentStreak: calculateStreaks(hd).current, water: pick('water'), protein: pick('protein'), workout: { ...pick('training'), scheduled: by('training').scheduled }, sleep: pick('sleep'), activity: pick('activity'), pendingHabits: getPendingHabits(day).map((x) => x.id) }
}

// ---------- estadísticas ----------
export function habitStats(hd, rangeDays) {
  const first = earliestHabitDate(hd)
  const from = first && addDays(hd.today, -(rangeDays - 1)) < first ? first : addDays(hd.today, -(rangeDays - 1))
  const days = first ? computeDays(hd, from, hd.today) : []
  const avg = (arr) => (arr.length ? arr.reduce((a, x) => a + x, 0) / arr.length : null)
  const hab = (day, id) => day.habits.find((h) => h.id === id)
  const withData = days.filter((x) => x.hasData), st = calculateStreaks(hd)
  return {
    days, avgConsistency: withData.length ? Math.round(avg(withData.map((x) => x.consistency))) : null, daysWithData: withData.length, current: st.current, best: st.best,
    avgWater: avg(days.filter((x) => hab(x, 'water').value > 0).map((x) => hab(x, 'water').value)), avgProtein: avg(days.filter((x) => hab(x, 'protein').value > 0).map((x) => hab(x, 'protein').value)),
    trainings: days.filter((x) => hab(x, 'training').status === 'completed').length, nutritionDays: days.filter((x) => hab(x, 'nutrition').logged > 0).length,
    avgSleep: avg(days.filter((x) => hab(x, 'sleep').record).map((x) => hab(x, 'sleep').value)), avgSteps: avg(days.filter((x) => hab(x, 'activity').record).map((x) => hab(x, 'activity').value)),
  }
}
export const weeklyTrainingSeries = (days) => { const m = {}; days.forEach((x) => { if (x.habits.find((h) => h.id === 'training').status === 'completed') { const w = weekStart(x.date); m[w] = (m[w] || 0) + 1 } }); const ws = [...new Set(days.map((x) => weekStart(x.date)))].sort(); return ws.map((w) => ({ date: w, v: m[w] || 0 })) }
export { r1, toISODate }
