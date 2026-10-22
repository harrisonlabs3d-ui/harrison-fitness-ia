import { addDays, parseISO, toISODate } from './dateUtils'
import { MEAL_TYPES } from '../data/foods'
import { buildHabitData, getDayHabits, toMin, earliestHabitDate } from './habitCalculations'
import { buildProgressData, daysBetween } from './progressCalculations'
import { nextRoutine } from './trainingCalculations'
import { TYPE_ICON, DAY_NAMES, WEEK_ORDER, ALL_DAYS } from '../data/schedule'
import { supplementSource, scheduledTimes, logsOn, isWeekend } from './supplementCalculations'
import { CAT_ICON, isPrescribed, defaultWellnessSettings } from '../data/supplements'

export const hhmm = (min) => { const m = ((Math.round(min) % 1440) + 1440) % 1440; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}` }
export const isValidTime = (s) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s || '')
const PRI = { low: 0, normal: 1, high: 2, critical: 3 }
export const STATUS_LABEL = { pending: 'Pendiente', next: 'Próximo', in_progress: 'En curso', completed: 'Completado', skipped: 'Omitido', not_applicable: 'No aplicable' }
const OPEN = ['pending', 'next', 'in_progress']
export const nowMinutes = (now) => now.getHours() * 60 + now.getMinutes()

// ---------- datos de entrada (todo con hora local del dispositivo) ----------
export function buildScheduleData(d, t, now = new Date()) {
  const today = toISODate(now), hd = buildHabitData(d, t, today), pd = buildProgressData(d, t, today)
  return {
    today, now, hd, pd, demo: hd.demo, settings: d.scheduleSettings, profile: d.profile, targets: t, routines: d.routines, nextRoutine: nextRoutine(d.routines, d.sessions),
    reminders: [...d.reminders, ...(hd.demo ? d.scheduleDemo.reminders : [])], exceptions: [...d.scheduleExceptions, ...(hd.demo ? d.scheduleDemo.exceptions : [])],
    habitReminders: d.habitSettings.reminders, notif: d.notificationSettings,
    supp: supplementSource(d), wellness: d.wellnessSettings || defaultWellnessSettings(),
  }
}

const round5 = (m) => Math.round(m / 5) * 5
const lastBefore = (list, date) => list.filter((x) => x.date < date).map((x) => x.date).sort().pop() || null

// ---------- generador de agenda ----------
export function generateDailySchedule(sd, date) {
  const s = sd.settings, hd = sd.hd, cat = s.categories, wd = parseISO(date).getDay(), events = []
  const wk = isWeekend(date), wv = sd.wellness.weekend, off = sd.wellness.off
  const wake = (wk && wv.wake) || sd.profile.despertar || '05:00', sleepT = (wk && wv.sleep) || sd.profile.dormir || '22:15'
  const mealTime = (id, fallback) => (wk && wv.mealTimes[id]) || s.mealTimes[id] || fallback
  const push = (e) => events.push({ date, priority: 'normal', source: 'system', auto: false, windowMin: 30, status: 'pending', ...e })
  const dayH = getDayHabits(hd, date), habit = (id) => dayH.habits.find((h) => h.id === id)

  push({ id: 'wake', type: 'wake', title: 'Comenzar el día', icon: '☀️', time: wake, priority: 'low', windowMin: 15, passive: true })
  if (cat.meals) {
    MEAL_TYPES.forEach((m) => push({ id: `meal:${m.id}`, type: 'meal', title: m.label, icon: m.icon, time: mealTime(m.id, m.time), mealType: m.id, linkedMealId: m.id, windowMin: 45, auto: (hd.mealsBy[date] || []).some((x) => x.mealType === m.id) }))
    if (s.extraSnack.enabled) push({ id: 'meal:extra', type: 'meal', title: 'Snack', icon: '🥤', time: (wk && wv.mealTimes.extra) || s.extraSnack.time, windowMin: 45, description: 'Snack adicional' })
  }
  if (cat.water && s.water.enabled) {
    const goal = hd.goals.waterMl, amount = s.water.amountMl, n = Math.max(1, Math.ceil(goal / amount))
    const start = toMin(s.water.start || hhmm(toMin(wake) + 5)), end = toMin(s.water.end), total = hd.water[date] || 0
    for (let i = 0; i < n; i++) {
      const ml = Math.min(amount, goal - i * amount)
      push({ id: `water:${i}`, type: 'water', icon: '💧', title: 'Hidratación', description: `${ml} ml de agua`, amountMl: ml, time: hhmm(n === 1 || end <= start ? start : round5(start + (i * (end - start)) / (n - 1))), priority: 'low', linkedHabitId: 'water', auto: total >= Math.min(goal, (i + 1) * amount) })
    }
  }
  const sess = hd.sessBy[date] || [], scheduled = hd.trainingDays.includes(wd)
  if (cat.workout && (scheduled || sess.length)) {
    const r = sess[0] ? sd.routines.find((x) => x.id === sess[0].routineId) : sd.nextRoutine, dur = r?.estimatedDuration ?? sess[0]?.durationMin ?? 60
    push({ id: 'workout', type: 'workout', icon: '🏋️', title: 'Entrenamiento', description: `Rutina: ${sess[0]?.routineName || r?.name || 'Entrenamiento'} · ${dur} min`, durationMin: dur, time: (wk && wv.trainingTime) || s.trainingTime, priority: 'high', windowMin: dur, auto: sess.length > 0, linkedWorkoutId: r?.id ?? null })
  }
  if (cat.sleep) push({ id: 'sleep', type: 'sleep', icon: '😴', title: 'Dormir', description: 'Hora de dormir', time: sleepT, priority: 'high', windowMin: 60, auto: !!hd.sleepBy[addDays(date, 1)] })
  if (cat.habits) {
    push({ id: 'habit:sleep', type: 'habit', icon: '😴', title: 'Registrar sueño', description: 'Hábito de sueño', time: hhmm(toMin(wake) + 15), linkedHabitId: 'sleep', auto: !!hd.sleepBy[date] })
    push({ id: 'habit:activity', type: 'habit', icon: '🚶', title: 'Registrar pasos', description: 'Hábito de actividad', time: s.activityTime, linkedHabitId: 'activity', auto: !!hd.actBy[date] })
    sd.habitReminders.filter((r) => r.enabled).forEach((r) => { const h = habit(r.habitId); if (h) push({ id: `habit-rem:${r.habitId}`, type: 'habit', icon: h.icon, title: `Hábito: ${h.label}`, time: r.time, linkedHabitId: r.habitId, auto: h.status === 'completed' }) })
  }
  if (cat.progress && wd === s.progress.day) {
    // Con datos reales, los registros DEMO de progreso/fotos nunca cuentan para decidir si toca registrar.
    const p = sd.pd, keep = (flag, list) => (sd.demo || !flag ? list : [])
    const items = [['weight', 'Registrar peso', '⚖️', keep(p.demo.weight, p.weights)], ['waist', 'Registrar cintura', '📏', keep(p.demo.weight, p.waists)], ['photo', 'Tomar foto de progreso', '📸', keep(p.demo.photos, p.photos).map((x) => ({ date: x.date }))]]
    items.forEach(([k, title, icon, list], i) => {
      const cfg = s.progress[k], has = list.some((x) => x.date === date), prev = lastBefore(list, date)
      if (cfg.enabled && (has || !prev || daysBetween(prev, date) >= cfg.everyDays)) push({ id: `progress:${k}`, type: 'progress', icon, title, time: hhmm(toMin(s.progress.time) + i * 5), auto: has })
    })
  }
  sd.reminders.forEach((r) => { if (r.enabled && r.days.includes(wd)) push({ id: `rem:${r.id}`, type: r.type, icon: TYPE_ICON[r.type] || '🔔', title: r.title, description: r.description, message: r.message || '', time: (wk && r.weekendTime) || r.time, priority: r.priority || 'normal', source: r.source || 'custom', reminderId: r.id, demo: !!r.demo, linkedHabitId: r.linkedHabitId, linkedMealId: r.linkedMealId, linkedWorkoutId: r.linkedWorkoutId }) })

  if (cat.supplements !== false) {
    sd.supp.products.forEach((p) => scheduledTimes(p, date).forEach((time, i) => {
      const rx = isPrescribed(p.category), amount = `${p.servingsPerIntake || 1} ${p.servingUnit || 'porción'}`
      const desc = [amount, p.brand, rx && p.prescription?.instruction ? `Pauta indicada: ${p.prescription.instruction.slice(0, 80)}` : ''].filter(Boolean).join(' · ')
      push({ id: `supp:${p.id}:${i}`, type: 'supplement', icon: CAT_ICON[p.category] || '💊', title: p.name, description: desc, time, productId: p.id, servings: Number(p.servingsPerIntake) || 1, slot: i, windowMin: 60, priority: rx ? 'high' : 'normal', prescribed: rx, noManual: true, source: 'supplement', demo: sd.supp.isDemo, auto: logsOn(sd.supp.logs, p.id, date).length > i })
    }))
  }
  // Ítems de la rutina que el usuario desactivó en Bienestar.
  for (let i = events.length - 1; i >= 0; i--) if (off.includes(events[i].id)) events.splice(i, 1)

  // Excepciones de ese día (no cambian el horario permanente).
  const nowMin = nowMinutes(sd.now)
  events.forEach((e) => {
    const ex = sd.exceptions.filter((x) => x.date === date && x.eventId === e.id)
    const rs = [...ex].reverse().find((x) => x.status === 'rescheduled')
    if (rs) { e.originalTime = rs.originalTime; e.time = rs.newTime; e.rescheduled = true }
    const st = [...ex].reverse().find((x) => x.status === 'skipped' || x.status === 'completed')
    const passive = e.passive && (date < sd.today || (date === sd.today && nowMin >= toMin(e.time)))
    e.status = st?.status === 'skipped' ? 'skipped' : e.auto || st?.status === 'completed' || passive ? 'completed' : 'pending'
    e.manualState = st?.status || null
  })
  events.sort((a, b) => toMin(a.time) - toMin(b.time) || PRI[b.priority] - PRI[a.priority])
  if (date === sd.today) {
    const open = events.filter((e) => e.status === 'pending')
    const cur = [...open].reverse().find((e) => toMin(e.time) <= nowMin && nowMin - toMin(e.time) <= e.windowMin)
    if (cur) cur.status = 'in_progress'
    const next = events.find((e) => e.status === 'pending' && toMin(e.time) > nowMin)
    if (next) next.status = 'next'
  }
  return events
}
export const getDayMeta = (sd, date) => ({ restDay: !(sd.hd.trainingDays.includes(parseISO(date).getDay()) || (sd.hd.sessBy[date] || []).length) })

export const getCurrentEvent = (events) => events.find((e) => e.status === 'in_progress') || null
export const getNextEvent = (events) => events.find((e) => e.status === 'next') || null
export const getPendingEvents = (events) => events.filter((e) => OPEN.includes(e.status))
// Siempre hay un "próximo": si hoy no queda nada, el primero de mañana.
export function getNextEventAcross(sd) {
  const today = generateDailySchedule(sd, sd.today), n = getNextEvent(today)
  if (n) return n
  return generateDailySchedule(sd, addDays(sd.today, 1)).find((e) => e.status !== 'skipped') || null
}
export const calculateTimeUntilEvent = (ev, now) => { const [y, m, d] = ev.date.split('-').map(Number), [h, mi] = ev.time.split(':').map(Number); return Math.max(0, Math.round((new Date(y, m - 1, d, h, mi, 0, 0) - now) / 1000)) }
export const formatCountdown = (sec) => `${String(Math.floor(sec / 3600)).padStart(2, '0')}:${String(Math.floor((sec % 3600) / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`
export const formatRelative = (sec) => { const m = Math.floor(sec / 60); return m < 1 ? 'Faltan menos de 1 minuto' : m < 60 ? `Faltan ${m} ${m === 1 ? 'minuto' : 'minutos'}` : `Faltan ${Math.floor(m / 60)} h ${m % 60} min` }

// ---------- conflictos ----------
export function detectScheduleConflicts(events) {
  const ev = events.filter((e) => !['water', 'wake'].includes(e.type) && OPEN.includes(e.status)), out = []
  for (let i = 0; i < ev.length; i++) for (let j = i + 1; j < ev.length; j++) {
    const a = ev[i], b = ev[j]
    if (a.time === b.time) { out.push({ kind: 'same-time', a, b, message: 'Hay dos actividades programadas a la misma hora.' }); continue }
    ;[[a, b], [b, a]].forEach(([w, o]) => {
      if (w.type !== 'workout' || !w.durationMin) return
      const s = toMin(w.time), e = s + w.durationMin, m = toMin(o.time)
      if (m > s && m < e) out.push({ kind: 'overlap', a: w, b: o, message: `El entrenamiento (${w.time}–${hhmm(e)}, ${w.durationMin} min) podría solaparse con ${o.title} (${o.time}).` })
    })
  }
  return out
}

// ---------- semana, resúmenes ----------
export const isMain = (e) => e.type !== 'water' && e.status !== 'not_applicable'
export function getWeeklySchedule(sd, start) {
  return WEEK_ORDER.map((wd, i) => { const date = addDays(start, i), ev = generateDailySchedule(sd, date).filter(isMain); return { date, name: DAY_NAMES[wd], count: ev.length, done: ev.filter((e) => e.status === 'completed').length, restDay: getDayMeta(sd, date).restDay } })
}
export function generateDailySummary(sd, date) {
  const ev = generateDailySchedule(sd, date).filter(isMain), done = ev.filter((e) => e.status === 'completed').length, skipped = ev.filter((e) => e.status === 'skipped').length
  return { total: ev.length, completed: done, skipped, pending: ev.length - done - skipped, consistency: getDayHabits(sd.hd, date).consistency, hasHabitData: !!earliestHabitDate(sd.hd) }
}
export function generateTomorrowSummary(sd) {
  const date = addDays(sd.today, 1), ev = generateDailySchedule(sd, date), w = ev.find((e) => e.type === 'workout')
  return { date, workout: !!w, workoutName: w?.description || null, meals: ev.filter((e) => e.type === 'meal').length, reminders: ev.filter((e) => e.reminderId).length, weight: ev.some((e) => e.id === 'progress:weight'), photo: ev.some((e) => e.id === 'progress:photo') }
}
// Solo lo que falta de verdad; resume el agua en una línea y las comidas en la más reciente sin registrar. Máximo 3 en la UI.
export function getPendingToday(sd, events) {
  const nowMin = nowMinutes(sd.now), items = []
  const meals = events.filter((e) => e.mealType && OPEN.includes(e.status) && toMin(e.time) <= nowMin)
  if (meals.length) { const m = meals[meals.length - 1]; items.push({ id: m.id, icon: m.icon, text: `Registrar ${m.title.toLowerCase()}`, at: toMin(m.time), late: true }) }
  const w = events.filter((e) => e.type === 'water' && OPEN.includes(e.status))
  if (w.length) items.push({ id: 'water', icon: '💧', text: `${Math.max(0, sd.hd.goals.waterMl - (sd.hd.water[sd.today] || 0))} ml de agua`, at: toMin(w[0].time), late: toMin(w[0].time) <= nowMin })
  events.filter((e) => ['workout', 'progress', 'habit', 'supplement'].includes(e.type) && OPEN.includes(e.status)).forEach((e) => items.push({ id: e.id, icon: e.icon, text: e.title === 'Entrenamiento' ? 'Entrenamiento' : e.title, at: toMin(e.time), late: toMin(e.time) <= nowMin }))
  return items.sort((a, b) => Number(b.late) - Number(a.late) || a.at - b.at)
}

// ---------- recordatorios (puras) ----------
export const createReminder = (list, data) => [...list, { id: `rem-${Date.now()}`, enabled: true, days: ALL_DAYS, priority: 'normal', source: 'custom', type: 'personalizado', description: '', linkedHabitId: null, linkedMealId: null, linkedWorkoutId: null, ...data }]
export const updateReminder = (list, id, patch) => list.map((r) => (r.id === id ? { ...r, ...patch } : r))
export const deleteReminder = (list, id) => list.filter((r) => r.id !== id)
export const toggleReminder = (list, id) => list.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
export function validateReminder(list, r, editingId) {
  const e = {}
  if (!r.title?.trim()) e.title = 'Escribe un título.'
  if (!isValidTime(r.time)) e.time = 'Elige una hora válida.'
  if (!r.days?.length) e.days = 'Elige al menos un día.'
  if (r.weekendTime && !isValidTime(r.weekendTime)) e.weekendTime = 'Elige una hora válida para el fin de semana.'
  if ((r.message || '').length > 160) e.message = 'El mensaje es demasiado largo (máx. 160 caracteres).'
  if (!e.title && !e.time && !e.days && list.some((x) => x.id !== editingId && x.title.trim().toLowerCase() === r.title.trim().toLowerCase() && x.time === r.time && x.days.some((d) => r.days.includes(d)))) e.title = 'Ya existe un recordatorio igual (mismo título, hora y día).'
  return e
}
export function rescheduleEvent(exceptions, { date, eventId, originalTime, newTime }) {
  const rest = exceptions.filter((x) => !(x.date === date && x.eventId === eventId && x.status === 'rescheduled'))
  return newTime === originalTime ? rest : [...rest, { id: `ex-${Date.now()}-${eventId}`, date, eventId, originalTime, newTime, status: 'rescheduled' }]
}
export function setEventState(exceptions, { date, eventId, status }) {
  const rest = exceptions.filter((x) => !(x.date === date && x.eventId === eventId && (x.status === 'skipped' || x.status === 'completed')))
  return status ? [...rest, { id: `ex-${Date.now()}-${eventId}-${status}`, date, eventId, originalTime: null, newTime: null, status }] : rest
}
export const shiftTime = (time, deltaMin) => hhmm(toMin(time) + deltaMin)

// ---------- avisos ----------
export const isPaused = (n, now) => n.pause.all || (n.pause.until != null && now.getTime() < n.pause.until)
export function getNotificationCandidates(sd) {
  const out = [], s = sd.settings, d = sd.today, at = (time, off = 0) => { const [y, m, dd] = d.split('-').map(Number); return new Date(y, m - 1, dd, ...time.split(':').map(Number)).getTime() - off * 60000 }
  generateDailySchedule(sd, d).filter((e) => OPEN.includes(e.status) || (e.type === 'wake' && e.status !== 'skipped')).forEach((e) => {
    const body = e.message ? e.message : e.type === 'wake' ? 'Es hora de comenzar el día.' : e.type === 'supplement' ? (e.prescribed ? `Recordatorio de tu pauta registrada: ${e.title}.` : `Es hora de registrar ${e.title}.`) : e.type === 'water' ? `Te faltan ${Math.max(0, sd.hd.goals.waterMl - (sd.hd.water[d] || 0))} ml de agua.` : e.mealType ? `Es hora de registrar tu ${e.title.toLowerCase()}.` : e.type === 'workout' ? 'Es hora de tu entrenamiento.' : e.type === 'sleep' ? 'Es hora de dormir.' : e.type === 'progress' ? `Es hora de ${e.title.toLowerCase()}.` : e.description || e.title
    out.push({ key: `${d}:${e.id}:now:${e.time}`, eventId: e.id, title: `${e.icon} ${e.title}`, body, at: at(e.time) })
    if (e.type === 'workout') out.push({ key: `${d}:${e.id}:lead:${e.time}`, eventId: e.id, title: `${e.icon} ${e.title}`, body: `Tu entrenamiento comienza en ${s.workoutLeadMin} minutos.`, at: at(e.time, s.workoutLeadMin) })
    if (e.type === 'sleep' && !sd.wellness.off.includes('sleepprep')) out.push({ key: `${d}:${e.id}:adv:${e.time}`, eventId: e.id, title: `${e.icon} ${e.title}`, body: 'Tu hora de dormir se acerca.', at: at(e.time, s.sleepAdvanceMin) })
  })
  return out
}
export function getDueNotifications(sd, fired, graceSec = 120) {
  const t = sd.now.getTime()
  return getNotificationCandidates(sd).filter((c) => t >= c.at && t - c.at <= graceSec * 1000 && !fired[c.key])
}
// Avisos contextuales (no son alarmas): se muestran en la agenda según los datos de hoy.
export function getContextualReminders(sd, events) {
  const out = [], nowMin = nowMinutes(sd.now), h = getDayHabits(sd.hd, sd.today).habits.find((x) => x.id === 'protein')
  const rem = Math.round(h.goal - h.value)
  if (rem > 0 && events.some((e) => e.mealType && OPEN.includes(e.status) && toMin(e.time) > nowMin)) out.push({ id: 'protein', icon: '🍗', text: `Te faltan ${rem} g de proteína para alcanzar tu objetivo.` })
  const sl = events.find((e) => e.id === 'sleep')
  if (sl && OPEN.includes(sl.status) && toMin(sl.time) - nowMin <= sd.settings.sleepAdvanceMin && toMin(sl.time) - nowMin > 0) out.push({ id: 'sleep', icon: '😴', text: 'Tu hora de dormir se acerca.' })
  const wk = events.find((e) => e.id === 'workout')
  if (wk && OPEN.includes(wk.status) && toMin(wk.time) - nowMin <= sd.settings.workoutLeadMin && toMin(wk.time) - nowMin > 0) out.push({ id: 'workout', icon: '🏋️', text: `Tu entrenamiento comienza en ${toMin(wk.time) - nowMin} minutos.` })
  return out
}
// Contexto estructurado para la futura IA.
export function getScheduleContext(sd) {
  const today = generateDailySchedule(sd, sd.today), tm = generateDailySchedule(sd, addDays(sd.today, 1))
  return { currentTime: hhmm(nowMinutes(sd.now)), currentEvent: getCurrentEvent(today), nextEvent: getNextEvent(today), pendingEvents: getPendingEvents(today), completedEvents: today.filter((e) => e.status === 'completed'), todaySchedule: today, tomorrowSchedule: tm, conflicts: detectScheduleConflicts(today) }
}
export { addDays, toISODate }
