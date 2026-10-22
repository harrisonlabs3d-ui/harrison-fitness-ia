import { FOODS, FOODS_BY_ID } from '../data/foods'
import { calculateFoodMacros } from './nutritionCalculations'

const PLAN = { 3: ['desayuno', 'almuerzo', 'cena'], 4: ['desayuno', 'snack1', 'almuerzo', 'cena'], 5: ['desayuno', 'snack1', 'almuerzo', 'snack2', 'cena'] }
const SHARE = { desayuno: 0.25, snack1: 0.1, almuerzo: 0.3, snack2: 0.1, cena: 0.25 }
const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const stem = (w) => w.replace(/(es|s)$/, '')

// Detecta alimentos mencionados en texto libre ("hoy solo tengo pollo, arroz y huevos").
export function detectFoods(text) {
  const words = norm(text).split(/[^a-z]+/).filter(Boolean).map(stem)
  const seen = new Set()
  return FOODS.filter((f) => {
    const first = stem(norm(f.name).split(/[ (]/)[0])
    if (!words.includes(first) || seen.has(first)) return false
    seen.add(first); return true
  }).map((f) => f.id)
}

const ROLE = (f) => ({ palta: 'fat', whey: 'dairy', miel: 'fat' })[f.id] || ({ Proteínas: 'protein', Legumbres: 'legume', Carbohidratos: 'carb', Frutas: 'fruit', Verduras: 'veg', Lácteos: 'dairy', Grasas: 'fat' })[f.category] || 'fat'
const isCount = (f) => f.unit === 'unidad' || (f.category === 'Frutas' && f.unitSize)
const per = (f, k) => (isCount(f) ? calculateFoodMacros(f, 1, 'unidad')[k] : f[k] / f.servingSize)
const mk = (f, q) => ({ foodId: f.id, quantity: q, unit: isCount(f) ? 'unidad' : f.unit })
const clampRound = (f, x, lo, hi, step) => (isCount(f) ? Math.max(1, Math.min(hi, Math.round(x || 1))) : Math.max(lo, Math.min(hi, Math.round((x || lo) / step) * step)))
const sumOf = (items, k) => items.reduce((a, i) => a + calculateFoodMacros(FOODS_BY_ID[i.foodId], i.quantity, i.unit)[k], 0)

// Propuesta local, simple y editable (no busca una solución nutricional perfecta).
export function generateMenu({ foodIds, kcal, protein, meals = 5 }) {
  const sel = foodIds.map((i) => FOODS_BY_ID[i]).filter(Boolean)
  const by = (...r) => sel.filter((f) => r.includes(ROLE(f)))
  const P = by('protein', 'legume'), C = by('carb'), Fr = by('fruit'), V = by('veg'), Fa = by('fat'), D = by('dairy')
  const eggs = P.filter((f) => ['huevo', 'clara-huevo'].includes(f.id)), mains = P.filter((f) => !eggs.includes(f))
  const lunchC = C.filter((f) => !['avena', 'pan-integral', 'pan-frances'].includes(f.id)) // avena/pan quedan para el desayuno
  const CL = lunchC.length ? lunchC : C
  const pick = (l, i) => (l.length ? l[i % l.length] : null)
  const prefer = (l, ids) => l.find((f) => ids.includes(f.id)) || l[0] || null
  const slots = PLAN[meals] || PLAN[5], tot = slots.reduce((a, s) => a + SHARE[s], 0)
  let ci = 0
  const out = []
  slots.forEach((slot) => {
    const kT = (kcal * SHARE[slot]) / tot, pT = (protein * SHARE[slot]) / tot
    let fixed = [], prot = [], carb = null, snack = []
    if (slot === 'desayuno') { carb = prefer(C, ['avena', 'pan-integral', 'pan-frances']); if (Fr[0]) fixed.push(Fr[0]); prot = [eggs[0] || D[0] || P[0]].filter(Boolean) }
    else if (slot === 'almuerzo') { prot = [pick(mains, 0) || eggs[0]].filter(Boolean); carb = pick(CL, ci++); if (V[0]) fixed.push(V[0]) }
    else if (slot === 'cena') { prot = [pick(mains, 1), eggs[0]].filter((f, i, a) => f && a.indexOf(f) === i); carb = pick(CL, ci++); if (V[0]) fixed.push(V[0]) }
    else if (slot === 'snack1') snack = [pick(Fr, 0), D[0]].filter(Boolean)
    else snack = [pick(Fr, 1) || pick(D, 1) || pick(Fa, 0)].filter(Boolean)
    if ((slot === 'snack1' || slot === 'snack2') && !snack.length) snack = [pick(Fa, 0) || pick(C, 0)].filter(Boolean)

    let items = []
    if (snack.length) {
      items = snack.map((f) => (f.id === 'whey' ? mk(f, 30) : mk(f, clampRound(f, kT / snack.length / per(f, 'calories'), 30, ROLE(f) === 'fat' ? 30 : 300, ROLE(f) === 'fat' ? 5 : 50))))
    } else {
      items = fixed.map((f) => mk(f, isCount(f) ? 1 : 100))
      const needP = Math.max(0, pT - sumOf(items, 'protein'))
      prot.forEach((f) => { const x = needP / prot.length / per(f, 'protein'); items.push(mk(f, isCount(f) ? clampRound(f, x, 1, 4, 1) : clampRound(f, x, 50, 300, 10))) })
      if (carb) {
        const oats = carb.id === 'avena'
        items.push(mk(carb, clampRound(carb, Math.max(0, kT - sumOf(items, 'calories')) / per(carb, 'calories'), oats ? 30 : 40, oats ? 100 : 350, oats ? 5 : 10)))
      }
    }
    if (items.length) out.push({ mealType: slot, items })
  })
  return out
}
