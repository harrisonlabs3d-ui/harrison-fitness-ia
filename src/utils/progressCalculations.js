import { addDays, parseISO, todayISO, toISODate } from './dateUtils'
import { weekStart, sessionSets, sessionVolume, fmtKg } from './trainingCalculations'
import { calculateDailyTotals } from './nutritionCalculations'
import { nutritionSource } from '../hooks/useNutrition'
import { trainingSource } from '../hooks/useTraining'
import { EXERCISES_BY_ID } from '../data/exercises'

const r1 = (x) => Math.round(x * 10) / 10
export const fmtDelta = (x, unit) => (x == null ? '—' : `${x > 0 ? '+' : ''}${r1(x)}${unit ? ` ${unit}` : ''}`)
export const daysBetween = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 864e5)
const byDate = (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)

// ---------- datos de entrada (el DEMO solo se usa cuando no hay datos reales y siempre va marcado) ----------
export function buildProgressData(d, t, today = todayISO()) {
  const wDemo = d.realProgress.length === 0 && d.demo.active && d.demo.progress.length > 0
  const recs = wDemo ? d.demo.progress : d.realProgress
  const series = (k) => recs.filter((r) => Number(r[k]) > 0).map((r) => ({ date: r.date, value: Number(r[k]) })).sort(byDate)
  const nut = nutritionSource(d), tr = trainingSource(d)
  const pDemo = d.photos.length === 0 && d.demo.active && d.demo.photos.length > 0
  return {
    today, weights: series('weight'), waists: series('waist'), sessions: tr.sessions, meals: nut.meals, photos: pDemo ? d.demo.photos : d.photos,
    demo: { weight: wDemo, training: tr.isDemo, nutrition: nut.isDemo, photos: pDemo },
    targets: { kcal: t.kcal, prot: t.prot }, goal: Number(d.profile.pesoMeta) || null, trainingTarget: Number(d.profile.diasSemana) || 4,
  }
}

// ---------- rango ----------
export function earliestDate(data) {
  const all = [...data.weights, ...data.waists, ...data.sessions, ...data.meals, ...data.photos].map((x) => x.date).sort()
  return all[0] || data.today
}
export function rangeBounds(range, data) {
  if (range === 'all') { const from = earliestDate(data); return { from, to: data.today, days: Math.max(7, daysBetween(from, data.today) + 1), all: true } }
  const n = Number(range)
  return { from: addDays(data.today, -(n - 1)), to: data.today, days: n }
}
const inR = (date, b) => date >= b.from && date <= b.to
const dateList = (b) => { const n = Math.min(120, daysBetween(b.from, b.to) + 1); return Array.from({ length: n }, (_, i) => addDays(b.to, -(n - 1 - i))) }

// ---------- peso, cintura y meta ----------
export function calculateChange(series) {
  if (!series.length) return null
  const first = series[0], last = series[series.length - 1]
  return { initial: first.value, current: last.value, count: series.length, change: series.length > 1 ? r1(last.value - first.value) : null, firstDate: first.date, lastDate: last.date }
}
export const calculateWeightChange = (data) => calculateChange(data.weights)
export const calculateWaistChange = (data) => calculateChange(data.waists)

// (inicial - actual) / (inicial - objetivo) × 100, limitado visualmente entre 0 y 100.
export function calculateGoalProgress(initial, current, target) {
  if (initial == null || current == null || !(target > 0)) return null
  const raw = initial === target ? (current === target ? 100 : 0) : ((initial - current) / (initial - target)) * 100
  const reached = initial === target ? current === target : initial > target ? current <= target : current >= target
  return { initial, current, target, pct: Math.round(Math.max(0, Math.min(100, raw))), raw: r1(raw), reached, remaining: reached ? 0 : r1(Math.abs(current - target)), exceededBy: reached ? r1(Math.abs(current - target)) : 0 }
}

// ---------- entrenamiento ----------
export function calculateTrainingAdherence(data, b) {
  const list = data.sessions.filter((s) => inR(s.date, b))
  const scheduled = Math.max(1, Math.round((data.trainingTarget * b.days) / 7))
  return { completed: list.length, scheduled, pct: Math.round((list.length / scheduled) * 100), perWeek: r1(list.length / (b.days / 7)) }
}
export function trainingStats(data, b) {
  const list = data.sessions.filter((s) => inR(s.date, b))
  return { count: list.length, sets: list.reduce((a, s) => a + sessionSets(s), 0), volume: list.reduce((a, s) => a + sessionVolume(s), 0), prCount: list.reduce((a, s) => a + (s.prs?.length || 0), 0) }
}
const weekStarts = (b) => { const out = []; for (let w = weekStart(b.from); w <= b.to; w = addDays(w, 7)) out.push(w); return out.slice(-12) }
export function weeklySeries(data, b, kind) {
  return weekStarts(b).map((w) => {
    const list = data.sessions.filter((s) => s.date >= w && s.date <= addDays(w, 6) && inR(s.date, b))
    return { date: w, v: kind === 'volume' ? Math.round(list.reduce((a, s) => a + sessionVolume(s), 0)) : list.length }
  })
}
export const exerciseOptions = (data) => {
  const ids = [...new Set(data.sessions.flatMap((s) => s.exercises.map((e) => e.exerciseId).filter(Boolean)))]
  return ids.map((id) => ({ id, name: EXERCISES_BY_ID[id]?.name || id }))
}
// Mejor serie (mayor peso y luego repeticiones) de cada semana para un ejercicio.
export function strengthProgression(data, exerciseId, b) {
  const rows = []
  weekStarts(b).forEach((w) => {
    const sets = data.sessions.filter((s) => s.date >= w && s.date <= addDays(w, 6) && inR(s.date, b)).flatMap((s) => s.exercises.filter((e) => e.exerciseId === exerciseId).flatMap((e) => e.sets))
    if (sets.length) { const best = [...sets].sort((x, y) => y.weight - x.weight || y.reps - x.reps)[0]; rows.push({ date: w, weight: best.weight, reps: best.reps }) }
  })
  return rows
}
// Solo los PR que Entrenamiento registró en cada sesión; nunca se inventan.
export function personalRecords(data) {
  const map = {}
  ;[...data.sessions].sort(byDate).forEach((s) => (s.prs || []).forEach((p) => { map[p.exerciseId] = { ...p, date: s.date } }))
  return Object.values(map).sort((a, b) => (a.date < b.date ? 1 : -1))
}

// ---------- nutrición ----------
export function nutritionDays(data, b) {
  return dateList(b).map((date) => { const list = data.meals.filter((m) => m.date === date); return { date, logged: list.length > 0, ...calculateDailyTotals(list) } })
}
export function calculateNutritionAdherence(data, b) {
  const days = nutritionDays(data, b), logged = days.filter((x) => x.logged)
  const avg = (k) => (logged.length ? Math.round(logged.reduce((a, x) => a + x[k], 0) / logged.length) : null)
  const avgProtein = avg('protein')
  return { days, totalDays: days.length, daysLogged: logged.length, daysProteinGoal: logged.filter((x) => x.protein >= data.targets.prot).length, avgCalories: avg('calories'), avgProtein, proteinDiff: avgProtein == null ? null : avgProtein - data.targets.prot }
}

// ---------- resúmenes por periodo ----------
export function calculateWeeklySummary(data, start) {
  const end = addDays(start, 6), inW = (x) => x.date >= start && x.date <= end
  const change = (series) => {
    const wk = series.filter(inW)
    if (!wk.length) return { value: null, change: null }
    const last = wk[wk.length - 1], prior = series.filter((x) => x.date < start).pop(), base = prior || (wk.length > 1 ? wk[0] : null)
    return { value: last.value, change: base ? r1(last.value - base.value) : null }
  }
  const sess = data.sessions.filter(inW)
  const nut = calculateNutritionAdherence(data, { from: start, to: end })
  return { start, end, weight: change(data.weights), waist: change(data.waists), sessions: sess.length, target: data.trainingTarget, volume: sess.reduce((a, s) => a + sessionVolume(s), 0), avgProtein: nut.avgProtein, avgCalories: nut.avgCalories, daysLogged: nut.daysLogged, photos: data.photos.filter(inW).length }
}
export function compareWeeks(cur, prev) {
  const diff = (a, b) => (a != null && b != null ? r1(a - b) : null)
  return { weight: diff(cur.weight.value, prev.weight.value), waist: diff(cur.waist.value, prev.waist.value), sessions: cur.sessions || prev.sessions ? cur.sessions - prev.sessions : null, protein: diff(cur.avgProtein, prev.avgProtein) }
}
export function calculateMonthlySummary(data, today = data.today) {
  const start = `${today.slice(0, 8)}01`, [y, m] = today.split('-').map(Number), next = toISODate(new Date(y, m, 1))
  const inM = (x) => x.date >= start && x.date < next
  const ch = (series) => { const l = series.filter(inM); return l.length ? { initial: l[0].value, current: l[l.length - 1].value, change: l.length > 1 ? r1(l[l.length - 1].value - l[0].value) : null } : null }
  const sess = data.sessions.filter(inM)
  const nut = calculateNutritionAdherence(data, { from: start, to: today })
  return { start, label: parseISO(start).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' }), weight: ch(data.weights), waist: ch(data.waists), sessions: sess.length, volume: sess.reduce((a, s) => a + sessionVolume(s), 0), avgProtein: nut.avgProtein, avgCalories: nut.avgCalories }
}

// ---------- línea de tiempo ----------
export function getProgressTimeline(data, b) {
  const map = {}
  const at = (date) => map[date] || (map[date] = { date, weight: null, waist: null, photos: 0, sessions: [], tags: [] })
  data.weights.forEach((w) => { at(w.date).weight = w.value })
  data.waists.forEach((w) => { at(w.date).waist = w.value })
  data.photos.forEach((p) => { at(p.date).photos += 1 })
  data.sessions.forEach((s) => at(s.date).sessions.push(s.routineName))
  const firstDate = (list) => list.map((x) => x.date).sort()[0]
  const tag = (date, text) => { if (date) at(date).tags.push(text) }
  tag(firstDate([...data.weights, ...data.waists]), 'Inicio'); tag(firstDate(data.photos), 'Foto inicial')
  tag(firstDate(data.sessions), 'Primer entrenamiento'); tag(firstDate(data.meals), 'Primer registro nutricional')
  return Object.values(map).sort(byDate).filter((e) => inR(e.date, b))
}

// ---------- series para gráficos ----------
export function getMetricSeries(data, metric, b) {
  const pts = (list) => list.filter((x) => inR(x.date, b)).map((x) => ({ date: x.date, v: x.value }))
  const nut = () => calculateNutritionAdherence(data, b).days.filter((x) => x.logged)
  switch (metric) {
    case 'weight': return { points: pts(data.weights), unit: 'kg', kind: 'line', trend: true, empty: 'Registra tu primer peso.', demo: data.demo.weight }
    case 'waist': return { points: pts(data.waists), unit: 'cm', kind: 'line', trend: true, empty: 'Registra tu primera medida.', demo: data.demo.weight }
    case 'sessions': return { points: data.sessions.length ? weeklySeries(data, b, 'count') : [], unit: 'sesiones', kind: 'bar', empty: 'Completa tu primer entrenamiento.', demo: data.demo.training }
    case 'volume': return { points: data.sessions.length ? weeklySeries(data, b, 'volume') : [], unit: 'kg', kind: 'bar', empty: 'Completa tu primer entrenamiento.', demo: data.demo.training }
    case 'protein': return { points: nut().map((x) => ({ date: x.date, v: Math.round(x.protein) })), unit: 'g', kind: 'bar', target: data.targets.prot, empty: 'Registra tu primera comida.', demo: data.demo.nutrition }
    default: return { points: nut().map((x) => ({ date: x.date, v: Math.round(x.calories) })), unit: 'kcal', kind: 'bar', target: data.targets.kcal, empty: 'Registra tu primera comida.', demo: data.demo.nutrition }
  }
}
export function trendValues(points) {
  if (points.length < 3) return null
  const x0 = points[0].date, xs = points.map((p) => daysBetween(x0, p.date)), n = points.length
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = points.reduce((a, p) => a + p.v, 0) / n
  const den = xs.reduce((a, x) => a + (x - mx) ** 2, 0)
  if (!den) return null
  const slope = xs.reduce((a, x, i) => a + (x - mx) * (points[i].v - my), 0) / den
  return xs.map((x) => r1(my + slope * (x - mx)))
}

// ---------- confianza, insights y contexto ----------
export function dataConfidence(data) {
  const s = data.weights.length >= data.waists.length ? data.weights : data.waists
  if (s.length < 2) return 'insufficient'
  return s.length >= 4 && daysBetween(s[0].date, s[s.length - 1].date) >= 21 ? 'consolidated' : 'trend'
}
export const CONFIDENCE = { insufficient: 'Datos insuficientes', trend: 'Tendencia observable', consolidated: 'Historial consolidado' }

// Mensajes descriptivos, solo con datos REALES (los módulos en DEMO no generan insights) y sin lenguaje médico.
export function generateProgressInsight(data) {
  const out = [], t = data.today
  if (!data.demo.weight) {
    const w = calculateWeightChange(data), c = calculateWaistChange(data)
    if (w && w.count >= 2) out.push(w.change < 0 ? `Tu peso registrado ha disminuido ${Math.abs(w.change)} kg desde el primer registro.` : w.change > 0 ? `Tu peso registrado ha aumentado ${w.change} kg desde el primer registro.` : 'Tu peso registrado es igual al del primer registro.')
    if (c && c.count >= 2) out.push(c.change < 0 ? `Tu cintura registrada ha disminuido ${Math.abs(c.change)} cm.` : c.change > 0 ? `Tu cintura registrada ha aumentado ${c.change} cm.` : 'Tu cintura registrada es igual a la del primer registro.')
  }
  if (!data.demo.training) {
    const wk = calculateWeeklySummary(data, weekStart(t))
    if (wk.sessions > 0) out.push(`Esta semana completaste ${wk.sessions} ${wk.sessions === 1 ? 'sesión' : 'sesiones'}.`)
  }
  if (!data.demo.nutrition) {
    const n = calculateNutritionAdherence(data, { from: addDays(t, -6), to: t })
    if (n.avgProtein != null) out.push(`Tu promedio de proteína fue de ${n.avgProtein} g frente a un objetivo de ${data.targets.prot} g (últimos 7 días, ${n.daysLogged} con registro).`)
  }
  if (!data.demo.photos && data.photos.length) out.push(`Tienes ${data.photos.length} ${data.photos.length === 1 ? 'foto registrada' : 'fotos registradas'}.`)
  return out
}
export function generateProgressSummary(data) {
  const parts = []
  if (!data.demo.training) { const n = calculateWeeklySummary(data, weekStart(data.today)).sessions; if (n > 0) parts.push(`has registrado ${n} ${n === 1 ? 'entrenamiento' : 'entrenamientos'} esta semana`) }
  const w = !data.demo.weight && calculateWeightChange(data)
  if (w) parts.push(`tu peso actual registrado es de ${w.current} kg`)
  return parts.length ? `${parts.join(' y ').replace(/^./, (c) => c.toUpperCase())}.` : ''
}

export function getProgressReportData(data, b) {
  const w = calculateWeightChange(data), c = calculateWaistChange(data), wk = calculateWeeklySummary(data, weekStart(data.today))
  return {
    generatedFor: data.today, range: b, demo: data.demo, confidence: dataConfidence(data),
    weight: w, waist: c, goal: calculateGoalProgress(w?.initial, w?.current, data.goal),
    training: { ...trainingStats(data, b), adherence: calculateTrainingAdherence(data, b), records: personalRecords(data) },
    nutrition: (({ days, ...rest }) => ({ ...rest, days: days.filter((x) => x.logged) }))(calculateNutritionAdherence(data, b)),
    week: wk, previousWeek: compareWeeks(wk, calculateWeeklySummary(data, addDays(weekStart(data.today), -7))), month: calculateMonthlySummary(data),
    timeline: getProgressTimeline(data, b), insights: generateProgressInsight(data), photoCount: data.photos.length,
  }
}
// Contexto para la futura fase de hábitos: solo datos reales (null si el módulo está en DEMO).
export function getCurrentProgressContext(data) {
  const real = (flag, v) => (flag ? null : v)
  const w = real(data.demo.weight, calculateWeightChange(data)), c = real(data.demo.weight, calculateWaistChange(data))
  const wk = calculateWeeklySummary(data, weekStart(data.today)), n = calculateNutritionAdherence(data, { from: addDays(data.today, -6), to: data.today })
  return {
    currentWeight: w?.current ?? null, initialWeight: w?.initial ?? null, weightChange: w?.change ?? null, currentWaist: c?.current ?? null, waistChange: c?.change ?? null,
    trainingFrequency: real(data.demo.training, wk.sessions), trainingVolume: real(data.demo.training, wk.volume), nutritionAverage: real(data.demo.nutrition, n.avgCalories), proteinAverage: real(data.demo.nutrition, n.avgProtein),
    photoCount: real(data.demo.photos, data.photos.length), goalProgress: w ? calculateGoalProgress(w.initial, w.current, data.goal)?.pct ?? null : null,
  }
}
export { fmtKg }
