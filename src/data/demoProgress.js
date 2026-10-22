// Datos DEMO: viven en su propia clave y nunca se mezclan con el progreso real.
export const DEMO_WEIGHTS = [99, 98.6, 98.9, 98.2, 97.8, 97.5]
export const DEMO_WAISTS = [104, 103.6, 103.8, 103, 102.6, 102.2]

import { daysAgo } from '../utils/dateUtils'
import { makeDemoNutrition } from './demoNutrition'

const placeholder = (label) =>
  'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><rect width="300" height="400" fill="#0f172a"/><circle cx="150" cy="120" r="42" fill="#1e3a8a"/><rect x="90" y="175" width="120" height="190" rx="40" fill="#1e3a8a"/><text x="150" y="392" fill="#93c5fd" font-family="sans-serif" font-size="18" text-anchor="middle">${label}</text></svg>`)

export const makeDemoProgress = () =>
  DEMO_WEIGHTS.map((weight, i) => ({ id: 'demo-w' + i, type: 'demo', date: daysAgo((5 - i) * 7), weight, waist: DEMO_WAISTS[i] }))

export const makeDemoPhotos = () => [
  { id: 'demo-p1', type: 'demo', image: placeholder('DEMO · inicio'), date: daysAgo(35), category: 'Frente', note: 'Foto de ejemplo', createdAt: Date.now() },
  { id: 'demo-p2', type: 'demo', image: placeholder('DEMO · semana 6'), date: daysAgo(0), category: 'Frente', note: 'Foto de ejemplo', createdAt: Date.now() },
]

export const freshDemo = () => ({ active: true, v: 4, progress: makeDemoProgress(), photos: makeDemoPhotos(), ...makeDemoNutrition() })
export const noDemo = () => ({ active: false, progress: [], photos: [], meals: [], water: {} })
