import { daysAgo } from '../utils/dateUtils'
import { sleepDuration } from '../utils/habitCalculations'
import { ACTIVITY_TYPES } from './habits'

// Sueño y actividad DEMO de 14 días (con días sin registro a propósito). Nunca se mezclan con lo real.
export function makeDemoHabits() {
  const sleep = [], activity = []
  for (let n = 0; n < 14; n++) {
    const date = daysAgo(n)
    if (n !== 5 && n !== 9) { const sleepTime = ['22:00', '22:30', '21:45', '22:15'][n % 4], wakeTime = ['05:00', '04:40', '05:15'][n % 3]; sleep.push({ id: `demo-sl-${n}`, type: 'demo', date, sleepTime, wakeTime, duration: sleepDuration(sleepTime, wakeTime), quality: 3 + (n % 3) }) }
    if (n % 6 !== 2) activity.push({ id: `demo-ac-${n}`, type: 'demo', date, steps: 5200 + ((n * 1237) % 5400), activityMinutes: 20 + (n % 4) * 10, activityType: ACTIVITY_TYPES[n % 3] })
  }
  return { sleep, activity }
}
export const freshHabitDemo = () => makeDemoHabits()
export const noHabitDemo = () => ({ sleep: [], activity: [] })
