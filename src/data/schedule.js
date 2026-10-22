import { daysAgo } from '../utils/dateUtils'

export const REMINDER_TYPES = [['comida', 'Comida', '🍽️'], ['agua', 'Agua', '💧'], ['entrenamiento', 'Entrenamiento', '🏋️'], ['proteina', 'Proteína', '🍗'], ['sueno', 'Sueño', '😴'], ['habito', 'Hábito', '🔥'], ['progreso', 'Progreso', '📈'], ['despertar', 'Levantarse', '☀️'], ['snack', 'Snack', '🥤'], ['suplemento', 'Suplemento', '💊'], ['personalizado', 'Personalizado', '🔔']]
export const TYPE_ICON = Object.fromEntries(REMINDER_TYPES.map(([id, , i]) => [id, i]))
export const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]
export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]
export const CATEGORIES = [['meals', 'Comidas', 'Horarios de tus 5 comidas (se completan al registrarlas en Nutrición).'], ['water', 'Agua', 'Reparte tu objetivo de agua durante el día.'], ['workout', 'Entrenamiento', 'Solo en días con entrenamiento programado.'], ['sleep', 'Sueño', 'Hora de dormir y aviso previo.'], ['habits', 'Hábitos', 'Registrar sueño y pasos, y recordatorios de hábitos.'], ['progress', 'Progreso', 'Peso, cintura y foto con frecuencia semanal o quincenal.'], ['supplements', 'Suplementos', 'Horarios de tus suplementos y pautas registradas (se crean en Bienestar).']]

// Horario base configurable. Despertar y dormir salen del Perfil; no se modifican en silencio.
export const defaultScheduleSettings = () => ({
  mealTimes: { desayuno: '05:00', snack1: '09:00', almuerzo: '13:00', snack2: '16:30', cena: '21:00' },
  extraSnack: { enabled: true, time: '19:00' }, trainingTime: '20:00', workoutLeadMin: 30,
  water: { enabled: true, amountMl: 500, start: null, end: '21:00' }, sleepAdvanceMin: 30, activityTime: '17:30',
  progress: { day: 1, time: '05:30', weight: { enabled: true, everyDays: 7 }, waist: { enabled: true, everyDays: 7 }, photo: { enabled: true, everyDays: 14 } },
  categories: { meals: true, water: true, workout: true, sleep: true, habits: true, progress: true, supplements: true }, defaultsAccepted: false,
})
export function mergeScheduleSettings(s = {}) {
  const b = defaultScheduleSettings()
  const m = (a, c) => ({ ...a, ...c })
  return { ...b, ...s, mealTimes: m(b.mealTimes, s.mealTimes), extraSnack: m(b.extraSnack, s.extraSnack), water: m(b.water, s.water), categories: m(b.categories, s.categories),
    progress: { ...b.progress, ...s.progress, weight: m(b.progress.weight, s.progress?.weight), waist: m(b.progress.waist, s.progress?.waist), photo: m(b.progress.photo, s.progress?.photo) } }
}
// pause: { all, until (epoch ms) }; fired = avisos ya mostrados (clave fecha:evento:tipo).
export const defaultNotificationSettings = () => ({ inApp: true, browser: false, pause: { all: false, until: null }, fired: {} })
export const mergeNotificationSettings = (s = {}) => ({ ...defaultNotificationSettings(), ...s, pause: { ...defaultNotificationSettings().pause, ...s.pause }, fired: s.fired || {} })

// Recordatorios sugeridos: solo se crean si el usuario los acepta.
export const SUGGESTED_REMINDERS = [
  { title: 'Preparar comida', description: 'Dejar listas las comidas de la semana.', time: '22:00', days: [0], type: 'comida' },
  { title: 'Preparar espacio de entrenamiento', description: 'Mancuernas, toalla y agua.', time: '19:30', days: [1, 2, 4, 6], type: 'entrenamiento' },
  { title: 'Revisión semanal', description: 'Mirar tu progreso y planificar la semana.', time: '21:00', days: [0], type: 'progreso' },
]
// Datos DEMO de esta fase (solo se ven en modo demo y nunca cuentan como reales).
export const freshScheduleDemo = () => ({
  reminders: [
    { id: 'demo-r1', title: 'Preparar comida', description: 'Ejemplo de recordatorio', time: '22:00', days: [0], type: 'personalizado', enabled: true, priority: 'normal', source: 'demo', demo: true },
    { id: 'demo-r2', title: 'Estiramientos', description: 'Ejemplo de recordatorio', time: '18:30', days: ALL_DAYS, type: 'personalizado', enabled: true, priority: 'low', source: 'demo', demo: true },
  ],
  exceptions: [{ id: 'demo-e1', date: daysAgo(1), eventId: 'workout', originalTime: '20:00', newTime: '21:00', status: 'rescheduled' }],
})
export const noScheduleDemo = () => ({ reminders: [], exceptions: [] })
