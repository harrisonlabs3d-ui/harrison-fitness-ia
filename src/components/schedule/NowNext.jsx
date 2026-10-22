import { Card, Badge, Btn } from '../ui'
import { useNow } from '../../hooks/useClock'
import { calculateTimeUntilEvent, formatCountdown, formatRelative, hhmm, nowMinutes } from '../../utils/scheduleCalculations'

// Único temporizador de cuenta regresiva (un intervalo, se limpia al desmontar).
export function Countdown({ ev }) {
  const now = useNow(1000), sec = calculateTimeUntilEvent(ev, now)
  return <div><p className="text-3xl font-bold text-white" role="timer" aria-label="Cuenta regresiva" data-testid="countdown">{formatCountdown(sec)}</p><p className="text-sm text-slate-300">{formatRelative(sec)}</p></div>
}
export function CurrentEvent({ ev, now, primary }) {
  const p = ev && primary(ev)
  return (
    <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3" aria-label="Evento actual">
      <p className="text-xs font-semibold tracking-wide text-emerald-300">AHORA</p>
      {ev ? <>
        <p className="text-xl font-bold text-white">{ev.icon} {ev.title.toUpperCase()}</p>
        <p className="text-sm text-slate-200">Son las {hhmm(nowMinutes(now))}. {ev.type === 'water' ? `Próximo objetivo: ${ev.amountMl} ml de agua.` : ev.description || ''}</p>
        {ev.demo && <Badge kind="demo" />}
        {p && <Btn className="mt-2 min-h-11" onClick={p.run}>{p.label}</Btn>}
      </> : <p className="text-sm text-slate-300">Sin evento en curso en este momento.</p>}
    </div>
  )
}
export function NextEvent({ ev, tomorrow }) {
  return (
    <Card title="Próximo">
      {ev ? <><p className="text-xl font-bold text-white">{ev.icon} {ev.title}</p><p className="text-sm text-slate-300">{ev.time}{tomorrow ? ' · mañana' : ''}{ev.description ? ` · ${ev.description}` : ''}</p><div className="mt-2"><Countdown ev={ev} /></div></> : <p className="text-sm text-slate-400">No hay más eventos programados.</p>}
    </Card>
  )
}
