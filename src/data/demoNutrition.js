import { FOODS_BY_ID } from './foods'
import { calculateFoodMacros } from '../utils/nutritionCalculations'
import { daysAgo } from '../utils/dateUtils'

// [mealType, foodId, cantidad, unidad] por día (0 = hoy). Solo DEMO: nunca se mezcla con lo real.
const DAYS = {
  0: [['desayuno', 'avena', 50, 'g'], ['desayuno', 'platano', 1, 'unidad'], ['desayuno', 'huevo', 2, 'unidad'], ['snack1', 'yogur-griego', 150, 'g'], ['almuerzo', 'pollo', 150, 'g'], ['almuerzo', 'arroz-blanco', 200, 'g']],
  1: [['desayuno', 'avena', 60, 'g'], ['desayuno', 'huevo', 3, 'unidad'], ['desayuno', 'platano', 1, 'unidad'], ['snack1', 'yogur', 200, 'g'], ['snack1', 'mani', 15, 'g'], ['almuerzo', 'pollo', 200, 'g'], ['almuerzo', 'arroz-blanco', 250, 'g'], ['almuerzo', 'tomate', 80, 'g'], ['snack2', 'manzana', 1, 'unidad'], ['snack2', 'queso-fresco', 50, 'g'], ['cena', 'pescado', 200, 'g'], ['cena', 'papa', 250, 'g'], ['cena', 'lechuga', 50, 'g']],
  2: [['desayuno', 'pan-integral', 3, 'unidad'], ['desayuno', 'huevo', 3, 'unidad'], ['desayuno', 'palta', 50, 'g'], ['snack1', 'platano', 1, 'unidad'], ['snack1', 'mani', 20, 'g'], ['almuerzo', 'carne-res', 150, 'g'], ['almuerzo', 'arroz-blanco', 250, 'g'], ['almuerzo', 'lentejas', 100, 'g'], ['snack2', 'yogur-griego', 200, 'g'], ['snack2', 'avena', 30, 'g'], ['cena', 'atun', 120, 'g'], ['cena', 'arroz-blanco', 200, 'g'], ['cena', 'huevo', 2, 'unidad']],
  3: [['desayuno', 'avena', 60, 'g'], ['desayuno', 'leche', 250, 'ml'], ['desayuno', 'platano', 1, 'unidad'], ['snack1', 'almendras', 25, 'g'], ['almuerzo', 'pollo', 200, 'g'], ['almuerzo', 'camote', 250, 'g'], ['almuerzo', 'brocoli', 100, 'g'], ['snack2', 'whey', 30, 'g'], ['snack2', 'platano', 1, 'unidad'], ['cena', 'huevo', 3, 'unidad'], ['cena', 'papa', 250, 'g'], ['cena', 'tomate', 80, 'g']],
}
const entry = (n, i, mealType, foodId, quantity, unit) => {
  const food = FOODS_BY_ID[foodId]
  return { id: `demo-n-${n}-${i}`, type: 'demo', date: daysAgo(n), mealType, foodId, foodName: food.name, quantity, unit, ...calculateFoodMacros(food, quantity, unit), createdAt: Date.now() }
}

// ~4 semanas de comidas DEMO (algunos días sin registro a propósito). Solo DEMO: nunca se mezcla con lo real.
export function makeDemoNutrition() {
  const meals = [], water = {}
  for (let n = 0; n <= 27; n++) {
    if (n > 0 && n % 7 === 0) continue
    const list = n <= 3 ? DAYS[n] : DAYS[(n % 3) + 1]
    const k = n <= 3 ? 1 : 0.9 + ((n * 7) % 11) / 50
    list.forEach(([mealType, foodId, quantity, unit], i) => meals.push(entry(n, i, mealType, foodId, unit === 'unidad' ? quantity : Math.round((quantity * k) / 5) * 5, unit)))
    water[daysAgo(n)] = n <= 3 ? [1500, 2500, 2000, 2750][n] : 1500 + ((n * 13) % 12) * 100
  }
  return { meals, water }
}
