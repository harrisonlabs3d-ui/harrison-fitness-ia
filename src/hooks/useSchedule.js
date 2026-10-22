import { useMemo } from 'react'
import { buildScheduleData, createReminder, updateReminder, deleteReminder, toggleReminder, rescheduleEvent, setEventState } from '../utils/scheduleCalculations'
import { SUGGESTED_REMINDERS } from '../data/schedule'
import { addIntake } from '../utils/supplementCalculations'

export function useScheduleData(d, t, now) {
  return useMemo(() => buildScheduleData(d, t, now), [d.water, d.meals, d.sessions, d.sleep, d.activity, d.habits, d.habitSettings, d.habitDemo, d.demo, d.trainingDemo, d.profile, d.scheduleSettings, d.reminders, d.scheduleExceptions, d.scheduleDemo, d.routines, d.realProgress, d.photos, d.supplements, d.supplementLogs, d.supplementDemo, d.wellnessSettings, t.agua, t.prot, t.kcal, now]) // eslint-disable-line
}
// La agenda no duplica datos: lee comidas, agua, sesiones y hábitos de sus módulos. Solo se guardan ajustes, recordatorios y excepciones.
export function useSchedule(d, setD, t, now) {
  const sd = useScheduleData(d, t, now)
  const set = (k, fn) => setD((p) => ({ ...p, [k]: fn(p[k]) }))
  return {
    sd,
    addWater: (date, n) => setD((p) => ({ ...p, water: { ...p.water, [date]: Math.max(0, (p.water[date] || 0) + n) } })),
    saveSettings: (s) => setD((p) => ({ ...p, scheduleSettings: s })),
    saveProfileTimes: (despertar, dormir) => setD((p) => ({ ...p, profile: { ...p.profile, despertar, dormir } })),
    setWaterGoal: (ml) => setD((p) => ({ ...p, settings: { ...p.settings, targets: { ...p.settings.targets, agua: ml } } })),
    addReminder: (data) => set('reminders', (l) => createReminder(l, data)),
    editReminder: (id, patch) => set('reminders', (l) => updateReminder(l, id, patch)),
    removeReminder: (id) => set('reminders', (l) => deleteReminder(l, id)),
    flipReminder: (id) => set('reminders', (l) => toggleReminder(l, id)),
    acceptDefaults: () => setD((p) => ({ ...p, reminders: [...p.reminders, ...SUGGESTED_REMINDERS.map((r, i) => ({ id: `rem-def-${Date.now()}-${i}`, enabled: true, priority: 'normal', source: 'default', linkedHabitId: null, linkedMealId: null, linkedWorkoutId: null, ...r }))], scheduleSettings: { ...p.scheduleSettings, defaultsAccepted: true } })),
    duplicateReminder: (id) => setD((p) => { const r = p.reminders.find((x) => x.id === id); return r ? { ...p, reminders: [...p.reminders, { ...r, id: `rem-${Date.now()}`, title: `${r.title} (copia)`, source: 'custom' }] } : p }),
    // Registro de consumo sin duplicados (mismo producto, fecha y minuto). El inventario y los gastos se calculan desde estos registros.
    logIntake: (entry) => setD((p) => { const r = addIntake(p.supplementLogs, entry); return r.added ? { ...p, supplementLogs: r.logs } : p }),
    reschedule: (a) => set('scheduleExceptions', (l) => rescheduleEvent(l, a)),
    setState: (a) => set('scheduleExceptions', (l) => setEventState(l, a)),
    patchNotif: (patch) => setD((p) => ({ ...p, notificationSettings: { ...p.notificationSettings, ...patch } })),
    setCategory: (k, v) => setD((p) => ({ ...p, scheduleSettings: { ...p.scheduleSettings, categories: { ...p.scheduleSettings.categories, [k]: v } } })),
  }
}
