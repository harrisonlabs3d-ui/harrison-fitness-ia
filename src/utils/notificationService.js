// Abstracción de canales. Hoy: in-app y Browser Notification (solo con la app abierta).
// Futuro: push, email, WhatsApp (no implementados).
const listeners = new Set()
export const CHANNELS = ['in-app', 'browser']
export const onInApp = (fn) => { listeners.add(fn); return () => listeners.delete(fn) }
export const browserSupported = () => typeof window !== 'undefined' && 'Notification' in window
export const browserPermission = () => (browserSupported() ? window.Notification.permission : 'unsupported')
// Nunca se llama sola: solo al pulsar "Activar notificaciones".
export async function requestBrowserPermission() {
  if (!browserSupported()) return 'unsupported'
  try { return await window.Notification.requestPermission() } catch { return 'denied' }
}
export function notify({ title, body, tag }, { inApp = true, browser = false } = {}) {
  if (inApp) listeners.forEach((f) => f({ title, body, tag, at: Date.now() }))
  if (browser && browserPermission() === 'granted') { try { new window.Notification(title, { body, tag }) } catch { /* sin soporte */ } }
}
