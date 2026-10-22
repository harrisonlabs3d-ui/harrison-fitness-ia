import { defaultProfile } from './demoData'
import { freshDemo, noDemo } from './demoProgress'
import { defaultRoutines } from './routines'
import { freshTrainingDemo, noTrainingDemo } from './demoTraining'
import { defaultHabitSettings, emptyHabits } from './habits'
import { freshHabitDemo, noHabitDemo } from './demoHabits'
import { defaultWellnessSettings, noSupplementDemo, freshSupplementDemo } from './supplements'
import { defaultScheduleSettings, defaultNotificationSettings, freshScheduleDemo, noScheduleDemo } from './schedule'

// Datos REALES del usuario. type: 'real' en cada registro facilita migrar a Supabase.
export const emptyData = () => ({
  profile: { ...defaultProfile }, realProgress: [], photos: [], meals: [], water: {}, sessions: [],
  settings: { targets: {} }, demo: noDemo(),
  favorites: { foods: [], recipes: [] }, foodHistory: [], recipes: [],
  routines: defaultRoutines(), customExercises: [], trainingSettings: { restSeconds: 90, useRPE: false, active: null }, trainingDemo: noTrainingDemo(),
  progressSettings: { range: 'all', metric: 'weight', filter: 'all' },
  habits: emptyHabits(), sleep: [], activity: [], habitSettings: defaultHabitSettings(), habitDemo: noHabitDemo(),
  scheduleSettings: defaultScheduleSettings(), reminders: [], scheduleExceptions: [], notificationSettings: defaultNotificationSettings(), scheduleDemo: noScheduleDemo(),
  supplements: [], supplementLogs: [], supplementDemo: noSupplementDemo(), wellnessSettings: defaultWellnessSettings(),
})
export const firstRunData = () => ({ ...emptyData(), demo: freshDemo(), trainingDemo: freshTrainingDemo(), habitDemo: freshHabitDemo(), scheduleDemo: freshScheduleDemo(), supplementDemo: freshSupplementDemo() })
