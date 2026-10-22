import { daysAgo } from '../utils/dateUtils'

// Categorías de producto. Los medicamentos prescritos e inyectables son SOLO registro y recordatorio de una pauta indicada por un profesional.
export const SUPP_CATEGORIES = [
  ['proteina', 'Proteína', '🥛'], ['creatina', 'Creatina', '⚡'], ['vitaminas', 'Vitaminas', '🍊'], ['minerales', 'Minerales', '🪨'],
  ['otros', 'Otros suplementos', '💊'], ['prescrito', 'Medicamento prescrito', '🩺'], ['inyectable', 'Inyectable prescrito', '💉'],
]
export const CAT_LABEL = Object.fromEntries(SUPP_CATEGORIES.map(([id, l]) => [id, l]))
export const CAT_ICON = Object.fromEntries(SUPP_CATEGORIES.map(([id, , i]) => [id, i]))
export const isPrescribed = (cat) => cat === 'prescrito' || cat === 'inyectable'
export const PRESENTATIONS = ['Polvo', 'Cápsulas', 'Tabletas', 'Líquido', 'Gomitas', 'Ampolla / vial', 'Otro']
// Unidad en la que se cuenta el envase y cada toma. Las "porciones" son la unidad de inventario.
export const SERVING_UNITS = ['porción', 'cápsula', 'tableta', 'gomita', 'ml', 'g', 'dosis']
export const FREQUENCIES = [['daily', 'Todos los días'], ['days', 'Días específicos'], ['asNeeded', 'Sin horario fijo (solo registro)']]
export const SUPP_FILTERS = [['active', 'Activos'], ['all', 'Todos'], ['archived', 'Archivados'], ['alerts', 'Con alertas']]

export const emptyProduct = () => ({
  name: '', brand: '', category: 'otros', ingredients: '', presentation: 'Cápsulas', packageSize: '', servingsPerPackage: '', servingUnit: 'porción', servingsPerIntake: '1',
  startDate: '', cost: '', packages: '1', notes: '', infoSource: '',
  schedule: { freq: 'asNeeded', days: [0, 1, 2, 3, 4, 5, 6], times: [], weekendTimes: [] },
  prescription: { professional: '', instruction: '' },
})

// Configuración propia de esta fase. dismissed: observaciones descartadas (id → fecha). off: ítems de la rutina desactivados.
export const defaultWellnessSettings = () => ({
  dismissed: {}, off: [], snoozeMin: 10, analysisDays: 14, lowStockDays: 7, sleepToleranceMin: 30,
  weekend: { wake: '', sleep: '', trainingTime: '', mealTimes: {} },
})
export function mergeWellnessSettings(s = {}) {
  const b = defaultWellnessSettings()
  return { ...b, ...s, dismissed: { ...(s.dismissed || {}) }, off: Array.isArray(s.off) ? s.off : [], weekend: { ...b.weekend, ...s.weekend, mealTimes: { ...(s.weekend?.mealTimes || {}) } } }
}

// ---------- DEMO (nunca se mezcla con lo real; se identifica con type:'demo' y con la etiqueta MODO DEMO) ----------
export function makeSupplementDemo() {
  const products = [
    { id: 'demo-sp1', type: 'demo', demo: true, name: 'Proteína de suero (ejemplo)', brand: 'Marca demo', category: 'proteina', ingredients: 'Proteína de suero de leche (dato de ejemplo)', presentation: 'Polvo', packageSize: '900 g', servingsPerPackage: 30, servingUnit: 'porción', servingsPerIntake: 1, startDate: daysAgo(20), notes: 'Dato de demostración.', infoSource: 'Etiqueta (ejemplo)', archived: false, schedule: { freq: 'daily', days: [0, 1, 2, 3, 4, 5, 6], times: ['17:00'], weekendTimes: [] }, prescription: { professional: '', instruction: '' }, purchases: [{ id: 'demo-pu1', date: daysAgo(20), cost: 120, packages: 1 }] },
    { id: 'demo-sp2', type: 'demo', demo: true, name: 'Vitamina (ejemplo)', brand: 'Marca demo', category: 'vitaminas', ingredients: '', presentation: 'Tabletas', packageSize: '60 tabletas', servingsPerPackage: 60, servingUnit: 'tableta', servingsPerIntake: 1, startDate: daysAgo(10), notes: 'Ejemplo con información incompleta (sin ingredientes).', infoSource: '', archived: false, schedule: { freq: 'days', days: [1, 3, 5], times: ['08:00'], weekendTimes: [] }, prescription: { professional: '', instruction: '' }, purchases: [{ id: 'demo-pu2', date: daysAgo(10), cost: 45, packages: 1 }] },
  ]
  const logs = []
  for (let n = 1; n <= 12; n++) if (n % 4 !== 0) logs.push({ id: `demo-sl${n}`, type: 'demo', productId: 'demo-sp1', date: daysAgo(n), time: '17:05', servings: 1 })
  for (let n = 1; n <= 9; n++) { const wd = new Date(daysAgo(n) + 'T00:00:00').getDay(); if ([1, 3, 5].includes(wd)) logs.push({ id: `demo-sv${n}`, type: 'demo', productId: 'demo-sp2', date: daysAgo(n), time: '08:10', servings: 1 }) }
  return { products, logs }
}
export const freshSupplementDemo = () => makeSupplementDemo()
export const noSupplementDemo = () => ({ products: [], logs: [] })
