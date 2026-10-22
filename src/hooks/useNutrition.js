import { useMemo } from 'react'
import { calculateDailyTotals } from '../utils/nutritionCalculations'

// Regla de fuente: mientras no exista ningún registro real de comida o agua, se muestra el DEMO (etiquetado).
export function nutritionSource(d) {
  const hasReal = d.meals.length > 0 || Object.values(d.water).some((v) => v > 0)
  const isDemo = d.demo.active && !hasReal
  return { isDemo, meals: isDemo ? d.demo.meals : d.meals, water: isDemo ? d.demo.water : d.water }
}
const history = (prev, list) => {
  let h = prev || []
  list.forEach((e) => { if (e.foodId) h = [{ foodId: e.foodId, foodName: e.foodName, quantity: e.quantity, unit: e.unit, at: Date.now() }, ...h.filter((x) => x.foodId !== e.foodId)] })
  return h.slice(0, 12)
}

export function useNutrition(d, setD, date) {
  const src = nutritionSource(d)
  const entries = useMemo(() => src.meals.filter((m) => m.date === date), [src.meals, date])
  const totals = useMemo(() => calculateDailyTotals(entries), [entries])
  return {
    isDemo: src.isDemo, all: src.meals, entries, totals,
    add: (list) => setD((p) => ({ ...p, meals: [...p.meals, ...list], foodHistory: history(p.foodHistory, list) })),
    update: (id, patch) => setD((p) => ({ ...p, meals: p.meals.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
    remove: (id) => setD((p) => ({ ...p, meals: p.meals.filter((m) => m.id !== id) })),
    replaceDay: (toDate, list) => setD((p) => ({ ...p, meals: [...p.meals.filter((m) => m.date !== toDate), ...list] })),
  }
}
