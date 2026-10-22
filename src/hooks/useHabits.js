import { useMemo } from 'react'
import { buildHabitData } from '../utils/habitCalculations'
import { todayISO } from '../utils/dateUtils'

// Los hábitos no duplican datos: leen agua, comidas y sesiones de sus módulos; solo sueño y actividad se guardan aquí.
export function useHabits(d, setD, t) {
  const today = todayISO()
  const hd = useMemo(() => buildHabitData(d, t, today), [d.water, d.meals, d.sessions, d.sleep, d.activity, d.habits, d.habitSettings, d.habitDemo, d.demo, d.trainingDemo, d.profile, t.agua, t.prot, t.kcal, today]) // eslint-disable-line
  const patchSettings = (patch) => setD((p) => ({ ...p, habitSettings: { ...p.habitSettings, ...patch } }))
  return {
    hd, today, patchSettings,
    addWater: (date, n) => setD((p) => ({ ...p, water: { ...p.water, [date]: Math.max(0, (p.water[date] || 0) + n) } })),
    saveSleep: (rec) => setD((p) => ({ ...p, sleep: [...p.sleep.filter((x) => x.date !== rec.date), rec] })),
    removeSleep: (date) => setD((p) => ({ ...p, sleep: p.sleep.filter((x) => x.date !== date) })),
    saveActivity: (rec) => setD((p) => ({ ...p, activity: [...p.activity.filter((x) => x.date !== rec.date), rec] })),
    removeActivity: (date) => setD((p) => ({ ...p, activity: p.activity.filter((x) => x.date !== date) })),
    setWaterGoal: (ml) => setD((p) => ({ ...p, settings: { ...p.settings, targets: { ...p.settings.targets, agua: ml } } })),
  }
}
