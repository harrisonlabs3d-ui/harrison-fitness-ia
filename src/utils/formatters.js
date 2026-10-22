export { todayISO } from './dateUtils'
export const fmtDate = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
export const num = (v) => (v === '' || v == null ? NaN : Number(v))
export const byDate = (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)
export const fmtFull = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`
