import { FOODS_BY_ID, MEAL_TYPES } from '../data/foods'

const r1 = (x) => Math.round(x * 10) / 10
const KEYS = ['calories', 'protein', 'carbs', 'fat']

// Factor respecto al tamaño de referencia del alimento (p. ej. 150 g / 100 g = 1.5).
function factor(food, quantity, unit) {
  if (unit === food.unit) return quantity / food.servingSize
  if (unit === 'porción') return (quantity * food.portion) / food.servingSize
  if (unit === 'unidad') return (quantity * (food.unitSize ?? food.portion)) / food.servingSize
  return quantity / food.servingSize // g ↔ ml se toma 1:1 (aproximación)
}
export const unitOptions = (food) => [food.unit, 'porción', ...(food.unit !== 'unidad' && food.unitSize ? ['unidad'] : [])]

export function calculateFoodMacros(food, quantity, unit = food.unit) {
  const k = factor(food, Number(quantity), unit)
  return Object.fromEntries(KEYS.map((m) => [m, r1(food[m] * k)]))
}
export const calculateDailyTotals = (entries) =>
  Object.fromEntries(KEYS.map((m) => [m, r1(entries.reduce((a, e) => a + (Number(e[m]) || 0), 0))]))

// targets usa las claves del Perfil: kcal, prot, carb, fat. Un valor negativo = por encima del objetivo.
export const calculateRemainingMacros = (totals, t) => ({
  calories: r1(t.kcal - totals.calories), protein: r1(t.prot - totals.protein),
  carbs: r1(t.carb - totals.carbs), fat: r1(t.fat - totals.fat),
})
export const calculateMacroPercentage = (value, target) => (target > 0 ? r1((value / target) * 100) : 0)
export const calculateCaloriesFromMacros = (protein, carbs, fat) => r1(protein * 4 + carbs * 4 + fat * 9)

export function calculateWeeklyAverage(entries, dates, proteinTarget) {
  const days = dates.map((date) => {
    const list = entries.filter((e) => e.date === date)
    return { date, n: list.length, ...calculateDailyTotals(list) }
  })
  const logged = days.filter((d) => d.n > 0)
  const avg = (k) => (logged.length ? Math.round(logged.reduce((a, d) => a + d[k], 0) / logged.length) : 0)
  return { days, avgCalories: avg('calories'), avgProtein: avg('protein'), daysLogged: logged.length, totalDays: dates.length, daysProteinGoal: logged.filter((d) => d.protein >= proteinTarget).length }
}
export const calculateRecipeMacros = (ingredients) =>
  calculateDailyTotals(ingredients.map((i) => calculateFoodMacros(FOODS_BY_ID[i.foodId], i.quantity, i.unit)))

export const newId = () => `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
export function buildEntry({ food, name, quantity, unit, mealType, date, macros, type = 'real' }) {
  return { id: newId(), type, date, mealType, foodId: food ? food.id : null, foodName: food ? food.name : name, quantity: Number(quantity), unit, ...macros, createdAt: Date.now() }
}
// Base para la futura lista de compras: ingredientes agregados de un conjunto de registros.
export function getIngredientsUsed(entries) {
  const map = {}
  entries.forEach((e) => { const k = `${e.foodId || e.foodName}|${e.unit}`; map[k] = map[k] || { foodId: e.foodId, name: e.foodName, unit: e.unit, quantity: 0 }; map[k].quantity += e.quantity })
  return Object.values(map)
}
export const fmtTime = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}` }
export function getNextMeal(now = new Date(), times = {}) {
  const cur = now.getHours() * 60 + now.getMinutes()
  const at = (t) => times[t.id] || t.time
  const next = MEAL_TYPES.find((t) => { const [h, m] = at(t).split(':').map(Number); return h * 60 + m > cur })
  return next ? { ...next, time: at(next), tomorrow: false } : { ...MEAL_TYPES[0], time: at(MEAL_TYPES[0]), tomorrow: true }
}
