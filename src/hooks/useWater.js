import { nutritionSource } from './useNutrition'

export function useWater(d, setD, date) {
  const src = nutritionSource(d)
  return {
    ml: src.water[date] || 0, isDemo: src.isDemo,
    add: (n) => setD((p) => ({ ...p, water: { ...p.water, [date]: Math.max(0, (p.water[date] || 0) + n) } })),
  }
}
