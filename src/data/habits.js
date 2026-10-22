export const HABITS = [
  { id: 'water', label: 'Agua', icon: '💧' },
  { id: 'protein', label: 'Proteína', icon: '🍗' },
  { id: 'training', label: 'Entrenamiento', icon: '🏋️' },
  { id: 'sleep', label: 'Sueño', icon: '😴' },
  { id: 'nutrition', label: 'Nutrición', icon: '🍽️' },
  { id: 'activity', label: 'Actividad', icon: '🚶' },
]
export const CHECK_LABEL = { water: 'Tomar agua', protein: 'Cumplir proteína', training: 'Entrenamiento', sleep: 'Registrar sueño', nutrition: 'Registrar alimentación', activity: 'Registrar pasos' }
// Días de entrenamiento por defecto según los días por semana del perfil (0 = domingo … 6 = sábado).
export const DEFAULT_TRAINING_DAYS = { 2: [1, 4], 3: [1, 3, 5], 4: [1, 2, 4, 6], 5: [1, 2, 3, 5, 6], 6: [1, 2, 3, 4, 5, 6] }
export const WEEKDAYS = [['L', 1], ['M', 2], ['X', 3], ['J', 4], ['V', 5], ['S', 6], ['D', 0]]
const REMINDER_TIME = { water: '10:00', protein: '16:00', training: '18:00', sleep: '21:30', nutrition: '13:00', activity: '17:00' }

// Estructura preparada para recordatorios (Fase 6). No se envían notificaciones.
export const defaultReminders = () => HABITS.map((h) => ({ habitId: h.id, enabled: false, time: REMINDER_TIME[h.id] }))
export const defaultHabitSettings = () => ({ sleepGoalH: 8, stepsGoal: 8000, streakMin: 70, nutritionPct: 80, trainingDays: null, reminders: defaultReminders() })
export const mergeHabitSettings = (s = {}) => ({ ...defaultHabitSettings(), ...s, reminders: defaultReminders().map((r) => ({ ...r, ...(s.reminders || []).find((x) => x.habitId === r.habitId) })) })
// customHabits: estructura para hábitos propios, p. ej. { id, name, icon, enabled }. checks[fecha][id] = true.
export const emptyHabits = () => ({ customHabits: [], checks: {} })
export const ACTIVITY_TYPES = ['Caminata', 'Pasos', 'Actividad libre']
