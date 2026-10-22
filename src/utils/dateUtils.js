// Todas las fechas usan el calendario LOCAL del usuario (nunca toISOString, que es UTC).
const pad = (n) => String(n).padStart(2, '0')
export const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const todayISO = () => toISODate(new Date())
export const parseISO = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d) }
export const addDays = (iso, n) => { const d = parseISO(iso); d.setDate(d.getDate() + n); return toISODate(d) }
export const daysAgo = (n) => addDays(todayISO(), -n)
export const lastDays = (n, end = todayISO()) => Array.from({ length: n }, (_, i) => addDays(end, -(n - 1 - i)))
export const fmtLong = (iso) => parseISO(iso).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })
export const fmtShort = (iso) => parseISO(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
