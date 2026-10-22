import { useState } from 'react'
import { Card, Btn } from '../ui'
import { browserSupported, browserPermission, requestBrowserPermission, notify } from '../../utils/notificationService'
import { isPaused } from '../../utils/scheduleCalculations'

const secure = () => typeof window === 'undefined' || window.isSecureContext !== false
// Estado del permiso + cómo habilitarlo. El permiso SOLO se pide al pulsar "Activar notificaciones".
export function permissionInfo(perm, enabled) {
  if (perm === 'unsupported') return { label: 'No compatible', help: 'Este navegador no admite notificaciones. Los avisos seguirán apareciendo dentro de la app.' }
  if (!secure()) return { label: 'No disponible (conexión no segura)', help: 'Las notificaciones del navegador exigen HTTPS (o localhost). Abre la app desde una dirección segura.' }
  if (perm === 'denied') return { label: 'Bloqueadas por el navegador', help: 'Para habilitarlas: pulsa el candado (o el icono de ajustes) junto a la dirección, abre «Notificaciones», elige «Permitir» y recarga la página.' }
  if (perm === 'granted') return { label: enabled ? 'Activadas' : 'Permiso concedido, desactivadas en la app', help: enabled ? 'Recibirás avisos del sistema mientras la app esté abierta.' : 'Pulsa «Activar notificaciones» para usarlas.' }
  return { label: 'Sin solicitar', help: 'Pulsa «Activar notificaciones» y acepta el aviso del navegador.' }
}

export default function NotificationSettings({ notif, S, now }) {
  const [msg, setMsg] = useState('')
  const perm = browserPermission(), paused = isPaused(notif, now), info = permissionInfo(perm, notif.browser && perm === 'granted')
  const activate = async () => {
    if (!secure() && perm !== 'unsupported') { S.patchNotif({ browser: false }); return setMsg('Las notificaciones del navegador exigen HTTPS (o localhost).') }
    const r = await requestBrowserPermission()
    if (r === 'granted') { S.patchNotif({ browser: true }); setMsg('Notificaciones del navegador activadas. Solo funcionan mientras la app esté abierta.') }
    else if (r === 'unsupported') setMsg('Tu navegador no admite notificaciones.')
    else { S.patchNotif({ browser: false }); setMsg(r === 'denied' ? 'El permiso fue denegado. Puedes cambiarlo en los ajustes del navegador (ver instrucciones arriba).' : 'No respondiste a la solicitud, así que no se activó nada.') }
  }
  const test = () => {
    const browserOk = notif.browser && perm === 'granted'
    notify({ title: '🔔 Aviso de prueba', body: 'Así se verán tus recordatorios.', tag: 'test' }, { inApp: notif.inApp, browser: notif.browser })
    setMsg(browserOk ? 'Aviso de prueba enviado (app y navegador).' : notif.inApp ? 'Aviso de prueba mostrado dentro de la app. El del navegador no está activo.' : 'Los avisos en la app y del navegador están desactivados: no se mostró nada.')
  }
  const pause = (ms) => S.patchNotif({ pause: { all: false, until: Date.now() + ms } })
  return (
    <Card title="Avisos y notificaciones">
      <p className="text-sm text-slate-300">Avisos dentro de la app: <b className="text-white">{notif.inApp ? 'activados' : 'desactivados'}</b>.</p>
      <p className="text-sm text-slate-300" data-perm={perm}>Notificaciones del navegador: <b className="text-white">{info.label}</b>.</p>
      <p className="mt-1 text-sm text-slate-400">{info.help}</p>
      <p className="mt-1 text-xs text-slate-500">Los avisos solo suenan mientras la aplicación está abierta: no hay service worker ni servidor de notificaciones, así que con el navegador o la pestaña cerrados no llegará ninguno. En pestañas en segundo plano el navegador puede retrasarlos un minuto o más. Se usa la hora local de este dispositivo.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Btn variant="ghost" className="min-h-11" aria-pressed={notif.inApp} onClick={() => S.patchNotif({ inApp: !notif.inApp })}>{notif.inApp ? 'Desactivar avisos en la app' : 'Activar avisos en la app'}</Btn>
        {notif.browser ? <Btn variant="ghost" className="min-h-11" onClick={() => { S.patchNotif({ browser: false }); setMsg('Notificaciones del navegador desactivadas en la app.') }}>Desactivar notificaciones del navegador</Btn> : <Btn className="min-h-11" onClick={activate}>Activar notificaciones</Btn>}
        <Btn variant="ghost" className="min-h-11" onClick={test}>Probar aviso</Btn>
      </div>
      {msg && <p className="mt-2 text-sm text-slate-300" aria-live="polite">{msg}</p>}
      <p className="mt-4 text-sm font-semibold text-white">Pausa de recordatorios</p>
      <p className="text-sm text-slate-300" aria-live="polite">{notif.pause.all ? 'Todos los avisos están en pausa.' : paused ? `En pausa hasta las ${new Date(notif.pause.until).toTimeString().slice(0, 5)}.` : 'Los avisos están activos.'}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Btn variant="ghost" className="min-h-11" onClick={() => S.patchNotif({ pause: { all: true, until: null } })}>Pausar todos</Btn>
        <Btn variant="ghost" className="min-h-11" onClick={() => pause(3600e3)}>Pausar 1 hora</Btn>
        <Btn variant="ghost" className="min-h-11" onClick={() => pause(4 * 3600e3)}>Pausar 4 horas</Btn>
        {paused && <Btn className="min-h-11" onClick={() => S.patchNotif({ pause: { all: false, until: null } })}>Reactivar</Btn>}
      </div>
      <p className="mt-2 text-xs text-slate-500">La pausa solo silencia los avisos; tu agenda sigue visible.</p>
    </Card>
  )
}
