import { addDays, parseISO, todayISO } from './dateUtils'
import { SUPP_CATEGORIES, isPrescribed } from '../data/supplements'

import { WEEK_ORDER } from '../data/schedule'
const DL = { 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S', 0: 'D' }
export const scheduleText = (p) => {
  const s = p.schedule
  if (s.freq === 'asNeeded') return 'Sin horario fijo'
  const days = s.freq === 'daily' ? 'Todos los días' : WEEK_ORDER.filter((x) => s.days.includes(x)).map((x) => DL[x]).join(' ')
  return `${days} · ${s.times.join(', ')}${s.weekendTimes?.length ? ` (fin de semana: ${s.weekendTimes.join(', ')})` : ''}`
}
export const CURRENCY = 'S/'
export const money = (n) => `${CURRENCY} ${(Math.round(n * 100) / 100).toFixed(2)}`
export const isWeekend = (iso) => { const w = parseISO(iso).getDay(); return w === 0 || w === 6 }
const isValidTime = (s) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s || '')
const r1 = (x) => Math.round(x * 10) / 10
const numOrNull = (v) => (v === '' || v == null || Number.isNaN(Number(v)) ? null : Number(v))

// ---------- fuente de datos: REAL, o DEMO solo si no existe ningún producto real ----------
export function supplementSource(d) {
  const hasReal = d.supplements.length > 0
  const isDemo = !hasReal && d.demo.active && d.supplementDemo.products.length > 0
  return { isDemo, products: isDemo ? d.supplementDemo.products : d.supplements, logs: isDemo ? d.supplementDemo.logs : d.supplementLogs }
}

// ---------- horario ----------
export function scheduledTimes(p, date) {
  const s = p.schedule
  if (!s || s.freq === 'asNeeded' || p.archived) return []
  if (p.startDate && date < p.startDate) return []
  if (s.freq === 'days' && !s.days.includes(parseISO(date).getDay())) return []
  return isWeekend(date) && s.weekendTimes?.length ? s.weekendTimes : s.times || []
}

// ---------- validación y construcción ----------
export function validateProduct(f, list, editingId) {
  const e = {}
  if (!f.name.trim()) e.name = 'Escribe el nombre del producto.'
  if (!SUPP_CATEGORIES.some(([id]) => id === f.category)) e.category = 'Elige una categoría.'
  const pos = (k, label, int = false) => { if (f[k] !== '' && f[k] != null) { const n = Number(f[k]); if (!(n > 0) || (int && !Number.isInteger(n))) e[k] = `${label} debe ser ${int ? 'un entero ' : 'un número '}mayor que 0.` } }
  pos('servingsPerPackage', 'Las porciones por envase', true); pos('servingsPerIntake', 'La cantidad por toma')
  if (f.cost !== '' && !(Number(f.cost) >= 0)) e.cost = 'El costo no puede ser negativo.'
  if (f.cost !== '') { const n = Number(f.packages); if (!(n >= 1) || !Number.isInteger(n)) e.packages = 'Indica cuántos envases compraste (1 o más).' }
  if (f.startDate && !/^\d{4}-\d{2}-\d{2}$/.test(f.startDate)) e.startDate = 'Fecha no válida.'
  const s = f.schedule
  if (s.freq !== 'asNeeded') {
    if (!s.times.length) e.times = 'Agrega al menos un horario o elige "Sin horario fijo".'
    else if (![...s.times, ...(s.weekendTimes || [])].every(isValidTime)) e.times = 'Hay un horario no válido.'
    if (s.freq === 'days' && !s.days.length) e.days = 'Elige al menos un día.'
  }
  if (isPrescribed(f.category) && f.prescription.instruction.length > 400) e.instruction = 'La pauta es demasiado larga (máx. 400 caracteres).'
  if (!e.name && list.some((x) => x.id !== editingId && !x.archived && x.name.trim().toLowerCase() === f.name.trim().toLowerCase() && (x.brand || '').trim().toLowerCase() === f.brand.trim().toLowerCase())) e.name = 'Ya tienes un producto activo con ese nombre y marca.'
  return e
}
export function buildProduct(f, existing) {
  const id = existing?.id || `sp-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  const start = f.startDate || existing?.startDate || ''
  const pk = Number(f.packages) >= 1 ? Number(f.packages) : 1
  const first = existing ? existing.purchases : f.cost !== '' || f.servingsPerPackage !== '' ? [{ id: `pu-${Date.now()}`, date: start || todayISO(), cost: f.cost !== '' ? Number(f.cost) * pk : null, packages: pk }] : []
  return {
    id, type: 'real', archived: existing?.archived || false, createdAt: existing?.createdAt || Date.now(),
    name: f.name.trim(), brand: f.brand.trim(), category: f.category, ingredients: f.ingredients.trim(), presentation: f.presentation, packageSize: f.packageSize.trim(),
    servingsPerPackage: numOrNull(f.servingsPerPackage), servingUnit: f.servingUnit, servingsPerIntake: numOrNull(f.servingsPerIntake) ?? 1, startDate: start, notes: f.notes.trim(), infoSource: f.infoSource.trim(),
    schedule: { freq: f.schedule.freq, days: f.schedule.freq === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : [...f.schedule.days].sort(), times: f.schedule.freq === 'asNeeded' ? [] : [...new Set(f.schedule.times)].sort(), weekendTimes: f.schedule.freq === 'asNeeded' ? [] : [...new Set(f.schedule.weekendTimes || [])].sort() },
    prescription: isPrescribed(f.category) ? { professional: f.prescription.professional.trim(), instruction: f.prescription.instruction.trim() } : { professional: '', instruction: '' },
    purchases: first,
  }
}
export const productToForm = (p) => ({
  name: p.name, brand: p.brand || '', category: p.category, ingredients: p.ingredients || '', presentation: p.presentation || 'Otro', packageSize: p.packageSize || '',
  servingsPerPackage: p.servingsPerPackage ?? '', servingUnit: p.servingUnit || 'porción', servingsPerIntake: String(p.servingsPerIntake ?? 1), startDate: p.startDate || '',
  cost: '', packages: '1', notes: p.notes || '', infoSource: p.infoSource || '', schedule: { freq: p.schedule.freq, days: p.schedule.days, times: p.schedule.times, weekendTimes: p.schedule.weekendTimes || [] },
  prescription: { professional: p.prescription?.professional || '', instruction: p.prescription?.instruction || '' },
})

// ---------- inventario estimado ----------
// remaining = porciones compradas − porciones registradas. El ritmo de consumo sale de los registros (últimos 14 días) o, si hay pocos, del horario planificado.
export function productInventory(p, logs, today, windowDays = 14) {
  const mine = logs.filter((l) => l.productId === p.id)
  const per = Number(p.servingsPerPackage) || null
  const pk = (p.purchases || []).reduce((a, x) => a + (Number(x.packages) || 0), 0)
  const total = per && pk ? per * pk : null
  const consumed = mine.reduce((a, l) => a + (Number(l.servings) || 0), 0)
  const remaining = total == null ? null : Math.max(0, r1(total - consumed))
  const from = addDays(today, -(windowDays - 1)), recent = mine.filter((l) => l.date >= from && l.date <= today)
  let rate = null, rateKind = null
  if (recent.length >= 3) {
    const first = recent.map((l) => l.date).sort()[0], span = Math.min(windowDays, Math.round((parseISO(today) - parseISO(first)) / 864e5) + 1)
    rate = recent.reduce((a, l) => a + (Number(l.servings) || 0), 0) / Math.max(1, span); rateKind = 'registrado'
  } else if (p.schedule?.freq && p.schedule.freq !== 'asNeeded' && p.schedule.times?.length) {
    const perWeek = (p.schedule.freq === 'daily' ? 7 : p.schedule.days.length) * p.schedule.times.length
    rate = (perWeek * (Number(p.servingsPerIntake) || 1)) / 7; rateKind = 'planificado'
  }
  const daysLeft = remaining != null && rate ? Math.floor(remaining / rate) : null
  return { total, consumed, remaining, rate: rate ? Math.round(rate * 100) / 100 : null, rateKind, daysLeft, estimatedEnd: daysLeft != null ? addDays(today, daysLeft) : null, packages: pk }
}
export const isLowStock = (inv, lowDays) => inv.remaining != null && (inv.remaining <= 0 || (inv.daysLeft != null && inv.daysLeft <= lowDays))

// ---------- información incompleta ----------
export function missingInfo(p) {
  const m = []
  if (!p.ingredients) m.push('ingredientes')
  if (!p.servingsPerPackage) m.push('porciones por envase')
  if (!p.infoSource) m.push('fuente de información')
  if (!(p.purchases || []).some((x) => x.cost != null)) m.push('costo')
  if (isPrescribed(p.category)) { if (!p.prescription?.professional) m.push('profesional responsable'); if (!p.prescription?.instruction) m.push('pauta indicada') }
  return m
}

// ---------- gastos ----------
export function expensesByMonth(products) {
  const map = {}
  products.forEach((p) => (p.purchases || []).forEach((u) => { if (u.cost == null) return; const m = u.date.slice(0, 7); map[m] = map[m] || { month: m, total: 0, byProduct: {} }; map[m].total += u.cost; map[m].byProduct[p.id] = (map[m].byProduct[p.id] || 0) + u.cost }))
  return Object.values(map).sort((a, b) => (a.month < b.month ? 1 : -1))
}
export const monthLabel = (m) => { const [y, mo] = m.split('-').map(Number); return new Date(y, mo - 1, 1).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' }) }

// ---------- registros de consumo (sin duplicados) ----------
// Un mismo producto no se registra dos veces en el mismo minuto/fecha (doble clic o doble envío).
export function addIntake(logs, { productId, date, time, servings }) {
  if (logs.some((l) => l.productId === productId && l.date === date && l.time === time)) return { logs, added: false }
  return { logs: [...logs, { id: `sl-${Date.now()}-${Math.floor(Math.random() * 1000)}`, type: 'real', productId, date, time, servings }], added: true }
}
export const logsOn = (logs, productId, date) => logs.filter((l) => l.productId === productId && l.date === date)

// ---------- cumplimiento del plan de suplementos ----------
export function supplementAdherence(products, logs, from, to) {
  let planned = 0, taken = 0
  for (let d = from; d <= to; d = addDays(d, 1)) products.forEach((p) => { const n = scheduledTimes(p, d).length; if (!n) return; planned += n; taken += Math.min(n, logsOn(logs, p.id, d).length) })
  return { planned, taken, pct: planned ? Math.round((taken / planned) * 100) : null }
}
