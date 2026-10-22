import { emptyData, firstRunData } from '../data/userData'
import { freshDemo, noDemo } from '../data/demoProgress'
import { makeDemoNutrition } from '../data/demoNutrition'
import { FOODS_BY_ID } from '../data/foods'
import { EXERCISES } from '../data/exercises'
import { defaultProfile } from '../data/demoData'
import { defaultRoutines } from '../data/routines'
import { emptyHabits, mergeHabitSettings } from '../data/habits'
import { freshHabitDemo, noHabitDemo } from '../data/demoHabits'
import { mergeScheduleSettings, mergeNotificationSettings, freshScheduleDemo, noScheduleDemo } from '../data/schedule'
import { freshTrainingDemo, noTrainingDemo } from '../data/demoTraining'
import { mergeWellnessSettings, freshSupplementDemo, noSupplementDemo } from '../data/supplements'

export const KEYS = {
  profile: 'harrison_profile', realProgress: 'harrison_real_progress', photos: 'harrison_photos',
  meals: 'harrison_nutrition', water: 'harrison_water', sessions: 'harrison_sessions',
  routines: 'harrison_training', customExercises: 'harrison_exercises', trainingSettings: 'harrison_training_settings', trainingDemo: 'harrison_training_demo', progressSettings: 'harrison_progress_settings',
  habits: 'harrison_habits', sleep: 'harrison_sleep', activity: 'harrison_activity', habitSettings: 'harrison_habit_settings', habitDemo: 'harrison_habit_demo',
  scheduleSettings: 'harrison_schedule_settings', reminders: 'harrison_reminders', scheduleExceptions: 'harrison_schedule_exceptions', notificationSettings: 'harrison_notification_settings', scheduleDemo: 'harrison_schedule_demo',
  supplements: 'harrison_supplements', supplementLogs: 'harrison_supplement_logs', supplementDemo: 'harrison_supplement_demo', wellnessSettings: 'harrison_wellness_settings',
  settings: 'harrison_settings', demo: 'harrison_demo',
  favorites: 'harrison_favorites', foodHistory: 'harrison_food_history', recipes: 'harrison_recipes',
}
const OLD_WORKOUTS = 'harrison_workouts' // sesiones de la versión 1.x/Fase 2 (formato antiguo); se conserva como respaldo
const LEGACY = 'hfia:v1' // MVP 1.0: una sola clave. Se conserva como respaldo, no se borra.

const read = (k) => { try { const r = localStorage.getItem(k); return r === null ? undefined : JSON.parse(r) } catch { return undefined } }
export const saveKey = (name, value) => { try { localStorage.setItem(KEYS[name], JSON.stringify(value)); return true } catch { return false } }
export const saveAll = (d) => Object.keys(KEYS).forEach((k) => saveKey(k, d[k]))
export const clearAll = () => { try { Object.values(KEYS).forEach((k) => localStorage.removeItem(k)); localStorage.removeItem(LEGACY); localStorage.removeItem(OLD_WORKOUTS) } catch { /* sin acceso */ } }

const MEAL_IDS = { Desayuno: 'desayuno', 'Snack 1': 'snack1', Almuerzo: 'almuerzo', 'Snack 2': 'snack2', Cena: 'cena' }
// Convierte registros de comida de la versión 1.x (slot/kcal/p/c/f) al formato de la Fase 2.
export function normalizeMeal(m) {
  if (m.mealType) return m
  const food = Object.values(FOODS_BY_ID).find((f) => f.name.toLowerCase().startsWith(String(m.name).toLowerCase()))
  return { id: String(m.id), type: 'real', date: m.date, mealType: MEAL_IDS[m.slot] || 'snack1', foodId: food?.id ?? null, foodName: m.name, quantity: m.qty, unit: 'g', calories: m.kcal, protein: m.p, carbs: m.c, fat: m.f, createdAt: Number(m.id) || Date.now() }
}

const nrm = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
// Convierte sesiones antiguas (items con series/reps/kg uniformes) al formato de la Fase 3.
export function normalizeSession(s) {
  if (s.exercises) return s
  return {
    id: String(s.id), type: 'real', date: s.date, routineId: null, routineName: s.routine, startedAt: null, endedAt: null, durationMin: s.minutes, prs: [],
    exercises: (s.items || []).map((i) => {
      const ex = EXERCISES.find((e) => nrm(e.name) === nrm(i.n))
      return { exerciseId: ex?.id ?? null, name: i.n, muscleGroup: ex?.muscleGroup ?? 'Otros', sets: Array.from({ length: Number(i.sets) || 1 }, (_, k) => ({ setNumber: k + 1, weight: Number(i.kg) || 0, reps: Number(i.reps) || 0, rir: null, rpe: null, completed: true, skipped: false, timestamp: null })) }
    }),
  }
}

// Valida lo recuperado de localStorage: descarta registros corruptos en lugar de romper la app.
const validProduct = (p) => p && typeof p.id === 'string' && typeof p.name === 'string' && p.schedule && Array.isArray(p.schedule.times) && Array.isArray(p.schedule.days) && Array.isArray(p.purchases)
const validLog = (l) => l && typeof l.productId === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(l.date || '') && /^\d{2}:\d{2}$/.test(l.time || '')

function normalize(d) {
  const demo = { ...noDemo(), ...d.demo }
  if (demo.active && demo.v !== 4) Object.assign(demo, freshDemo()) // el DEMO se regenera con cintura y 4 semanas de nutrición; lo real no se toca
  if (demo.active && !demo.meals.length && !Object.keys(demo.water).length) Object.assign(demo, makeDemoNutrition())
  return { ...d, profile: { ...defaultProfile, ...d.profile }, sessions: (d.sessions || []).map(normalizeSession), routines: d.routines ?? defaultRoutines(), customExercises: d.customExercises || [], trainingSettings: { restSeconds: 90, useRPE: false, active: null, ...d.trainingSettings }, trainingDemo: { ...noTrainingDemo(), ...d.trainingDemo }, progressSettings: { range: 'all', metric: 'weight', filter: 'all', ...d.progressSettings }, habits: { ...emptyHabits(), ...d.habits }, sleep: d.sleep || [], activity: d.activity || [], habitSettings: mergeHabitSettings(d.habitSettings), habitDemo: { ...noHabitDemo(), ...d.habitDemo }, scheduleSettings: mergeScheduleSettings(d.scheduleSettings), reminders: d.reminders || [], scheduleExceptions: d.scheduleExceptions || [], notificationSettings: mergeNotificationSettings(d.notificationSettings), scheduleDemo: { ...noScheduleDemo(), ...d.scheduleDemo }, supplements: Array.isArray(d.supplements) ? d.supplements.filter(validProduct) : [], supplementLogs: Array.isArray(d.supplementLogs) ? d.supplementLogs.filter(validLog) : [], supplementDemo: { ...noSupplementDemo(), ...d.supplementDemo }, wellnessSettings: mergeWellnessSettings(d.wellnessSettings), demo, meals: d.meals.map(normalizeMeal), favorites: { foods: [], recipes: [], ...d.favorites }, foodHistory: d.foodHistory || [], recipes: d.recipes || [] }
}

function migrateLegacy(old) {
  const base = emptyData()
  return {
    ...base, profile: old.profile,
    realProgress: (old.progress || []).filter((r) => !String(r.id).startsWith('demo'))
      .map((r) => ({ id: String(r.id), type: 'real', date: r.date, weight: r.peso, waist: r.cintura ?? null })),
    meals: old.meals || [], water: old.water || {}, sessions: old.sessions || [],
    settings: old.settings || base.settings, demo: old.demo ? freshDemo() : base.demo, habitDemo: old.demo ? freshHabitDemo() : base.habitDemo, scheduleDemo: old.demo ? freshScheduleDemo() : base.scheduleDemo, supplementDemo: old.demo ? freshSupplementDemo() : base.supplementDemo,
  }
}

export function loadAll() {
  const out = {}
  let any = false
  Object.keys(KEYS).forEach((k) => { const v = read(KEYS[k]); if (v !== undefined) { out[k] = v; any = true } })
  if (any) {
    const missing = Object.keys(KEYS).filter((k) => out[k] === undefined) // claves que aún no existían (se guardan al final)
    if (out.sessions === undefined) { const ow = read(OLD_WORKOUTS); if (Array.isArray(ow)) out.sessions = ow }
    if (out.trainingDemo === undefined && out.demo?.active) out.trainingDemo = freshTrainingDemo()
    if (out.habitDemo === undefined && out.demo?.active) out.habitDemo = freshHabitDemo()
    if (out.scheduleDemo === undefined && out.demo?.active) out.scheduleDemo = freshScheduleDemo()
    if (out.supplementDemo === undefined && out.demo?.active) out.supplementDemo = freshSupplementDemo()
    const d = normalize({ ...emptyData(), ...out })
    if ((out.meals || []).some((m) => !m.mealType)) saveKey('meals', d.meals)
    missing.forEach((k) => saveKey(k, d[k])) // claves nuevas con sus valores iniciales (incluido el demo regenerado)
    if ((out.sessions || []).some((s) => !s.exercises)) saveKey('sessions', d.sessions)
    return d
  }
  const old = read(LEGACY)
  const d = normalize(old && old.profile ? migrateLegacy(old) : firstRunData())
  saveAll(d)
  return d
}
