import { addDays } from './dateUtils'
import { toMin, fmtDuration, getDayHabits, computeDays, earliestHabitDate } from './habitCalculations'
import { generateDailySchedule, isMain } from './scheduleCalculations'
import { isWeekend, supplementAdherence } from './supplementCalculations'

// ---------- horarios de sueño (objetivos personales, NO prescripciones médicas) ----------
// Noche que termina el día `date`: acostarse (día anterior) y levantarse (ese día). Fines de semana = sábado y domingo.
export function sleepTargets(profile, wellness, date) {
  const w = wellness.weekend, prev = addDays(date, -1)
  return { bed: (isWeekend(prev) && w.sleep) || profile.dormir || '22:15', wake: (isWeekend(date) && w.wake) || profile.despertar || '05:00' }
}
const circ = (a, b) => ((toMin(a) - toMin(b) + 720 + 1440) % 1440) - 720 // diferencia con signo en minutos (circular)
export const fmtDiff = (m) => (m === 0 ? 'a la hora' : `${m > 0 ? '+' : '−'}${Math.abs(m)} min`)

export function sleepWeek(hd, profile, wellness, today, n = 7) {
  const tol = wellness.sleepToleranceMin
  return Array.from({ length: n }, (_, i) => addDays(today, -(n - 1 - i))).map((date) => {
    const rec = hd.sleepBy[date] || null, tg = sleepTargets(profile, wellness, date)
    const bedDiff = rec ? circ(rec.sleepTime, tg.bed) : null, wakeDiff = rec ? circ(rec.wakeTime, tg.wake) : null
    return { date, rec, target: tg, bedDiff, wakeDiff, within: rec ? Math.abs(bedDiff) <= tol && Math.abs(wakeDiff) <= tol : null }
  })
}
export function sleepWeekSummary(rows, goalMin) {
  const recs = rows.filter((r) => r.rec), n = recs.length
  return { recorded: n, within: recs.filter((r) => r.within).length, avgMin: n ? Math.round(recs.reduce((a, r) => a + r.rec.duration, 0) / n) : null, goalMin, avgText: n ? fmtDuration(Math.round(recs.reduce((a, r) => a + r.rec.duration, 0) / n)) : null }
}

// ---------- historial de cumplimiento de la rutina ----------
// Se calcula con la configuración ACTUAL de tu agenda (no se guarda una foto de la configuración de cada día).
// Pasado: lo no registrado cuenta como "sin registrar". Hoy: lo pendiente aún no cuenta como omitido.
export function complianceHistory(sd, n = 14) {
  const first = earliestHabitDate(sd.hd) // antes de tu primer registro no cuentan días (aún no habías empezado)
  const rows = Array.from({ length: n }, (_, i) => addDays(sd.today, -(n - 1 - i))).map((date) => {
    const ev = first && date >= first ? generateDailySchedule(sd, date).filter((e) => isMain(e) && e.type !== 'wake') : []
    const completed = ev.filter((e) => e.status === 'completed').length, skipped = ev.filter((e) => e.status === 'skipped').length
    const open = ev.length - completed - skipped, postponed = sd.exceptions.filter((x) => x.date === date && x.status === 'rescheduled').length
    const unlogged = date < sd.today ? open : 0
    return { date, total: ev.length, completed, skipped, unlogged, pending: date === sd.today ? open : 0, postponed, pct: ev.length && date < sd.today ? Math.round((completed / ev.length) * 100) : null }
  })
  const past = rows.filter((r) => r.date < sd.today && r.total)
  const tot = past.reduce((a, r) => a + r.total, 0), done = past.reduce((a, r) => a + r.completed, 0)
  return { rows, pct: tot ? Math.round((done / tot) * 100) : null, completed: done, total: tot, skipped: past.reduce((a, r) => a + r.skipped, 0), postponed: rows.reduce((a, r) => a + r.postponed, 0) }
}

// ---------- panel de hábitos y descanso (todo derivado de registros existentes) ----------
export function habitPanel(sd, hd, supp, today) {
  const day = getDayHabits(hd, today), by = (id) => day.habits.find((h) => h.id === id)
  const events = generateDailySchedule(sd, today).filter(isMain), planned = events.filter((e) => e.type === 'supplement')
  const first = earliestHabitDate(hd), from = addDays(today, -6)
  const week = computeDays(hd, first && first > from ? first : from, today)
  return {
    water: by('water'), nutrition: by('nutrition'), protein: by('protein'), training: by('training'), sleep: by('sleep'),
    meals: { logged: (hd.mealsBy[today] || []).length, slots: events.filter((e) => e.mealType).filter((e) => e.status === 'completed').length, total: events.filter((e) => e.mealType).length },
    reminders: { done: events.filter((e) => e.status === 'completed').length, skipped: events.filter((e) => e.status === 'skipped').length, total: events.length },
    supplements: { done: planned.filter((e) => e.status === 'completed').length, total: planned.length, week: supplementAdherence(supp.products, supp.logs, from, today) },
    week: week.map((x) => ({ date: x.date, v: x.hasData ? x.consistency : null })), weekWithData: week.filter((x) => x.hasData).length,
  }
}
