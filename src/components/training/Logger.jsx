import { useState, useEffect, useRef } from 'react'
import { Btn } from '../ui'

const big = 'w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-center text-3xl font-bold text-white'
function Stepper({ label, value, onChange, step, inputMode }) {
  const bump = (n) => onChange(String(Math.max(0, Math.round(((Number(value) || 0) + n) * 10) / 10)))
  return (
    <div>
      <label className="block text-center text-sm text-slate-400" htmlFor={`f-${label}`}>{label}</label>
      <div className="mt-1 flex items-center gap-2">
        <Btn variant="ghost" aria-label={`Menos ${label}`} className="min-h-14 w-14 text-2xl" onClick={() => bump(-step)}>−</Btn>
        <input id={`f-${label}`} className={big} type="number" inputMode={inputMode} value={value} onChange={(e) => onChange(e.target.value)} />
        <Btn variant="ghost" aria-label={`Más ${label}`} className="min-h-14 w-14 text-2xl" onClick={() => bump(step)}>+</Btn>
      </div>
    </div>
  )
}

export function SetLogger({ init, useRPE, setUseRPE, repLabel, onComplete, onSkip }) {
  const [w, setW] = useState(init.weight ?? '')
  const [r, setR] = useState(init.reps ?? '')
  const [eff, setEff] = useState('')
  const [err, setErr] = useState('')
  const submit = () => {
    const weight = Number(w), reps = Number(r)
    if (w === '' || !(weight >= 0)) return setErr('El peso debe ser 0 o más.')
    if (r === '' || !Number.isInteger(reps) || reps <= 0) return setErr('Las repeticiones deben ser un número entero mayor que 0.')
    if (eff !== '' && (useRPE ? !(Number(eff) >= 1 && Number(eff) <= 10) : !(Number(eff) >= 0 && Number(eff) <= 5))) return setErr(useRPE ? 'El RPE va de 1 a 10.' : 'El RIR va de 0 a 5.')
    setErr('')
    onComplete({ weight, reps, rir: !useRPE && eff !== '' ? Number(eff) : null, rpe: useRPE && eff !== '' ? Number(eff) : null })
  }
  const opts = useRPE ? [6, 7, 8, 9, 10] : [0, 1, 2, 3, 4, 5]
  return (
    <div className="space-y-4">
      <Stepper label="Peso (kg)" value={w} onChange={setW} step={1} inputMode="decimal" />
      <Stepper label={repLabel} value={r} onChange={setR} step={1} inputMode="numeric" />
      <div>
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>{useRPE ? 'RPE (opcional)' : 'RIR (opcional)'}</span>
          <button className="py-1 text-blue-300" onClick={() => { setUseRPE(!useRPE); setEff('') }}>Usar {useRPE ? 'RIR' : 'RPE'}</button>
        </div>
        <div className="mt-1 flex gap-2" role="group" aria-label={useRPE ? 'RPE' : 'RIR'}>
          {opts.map((o) => <Btn key={o} variant={String(o) === String(eff) ? 'primary' : 'ghost'} aria-pressed={String(o) === String(eff)} className="min-h-12 flex-1 px-0 text-lg" onClick={() => setEff(String(o) === String(eff) ? '' : String(o))}>{o}</Btn>)}
        </div>
      </div>
      {err && <p role="alert" className="text-sm text-red-400">{err}</p>}
      <Btn className="min-h-16 w-full text-xl" onClick={submit}>COMPLETAR SERIE</Btn>
      <Btn variant="ghost" className="min-h-12 w-full" onClick={onSkip}>Omitir serie</Btn>
    </div>
  )
}

const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
// Temporizador real (basado en la hora del sistema). runKey cambia → arranca una cuenta nueva.
export function RestTimer({ seconds, runKey, onChangeSeconds }) {
  const [left, setLeft] = useState(0)
  const [on, setOn] = useState(false)
  const end = useRef(0)
  useEffect(() => { if (!runKey) return; end.current = Date.now() + seconds * 1000; setLeft(seconds); setOn(true) }, [runKey]) // eslint-disable-line
  useEffect(() => {
    if (!on) return
    const i = setInterval(() => { const l = Math.max(0, Math.round((end.current - Date.now()) / 1000)); setLeft(l); if (l === 0) { setOn(false); try { navigator.vibrate?.(200) } catch { /* sin vibración */ } } }, 250)
    return () => clearInterval(i)
  }, [on])
  const resume = () => { end.current = Date.now() + left * 1000; setOn(true) }
  const skip = () => { setOn(false); setLeft(0) }
  const idle = !on && left === 0
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-xs font-semibold tracking-wide text-slate-400">DESCANSO</p>
      <p className={`text-5xl font-bold ${on ? 'text-blue-300' : 'text-white'}`} aria-label={`Descanso ${mmss(left)}`} data-testid="rest-time">{mmss(idle ? seconds : left)}</p>
      <div className="mt-3 flex gap-2">
        {on ? <Btn variant="ghost" className="min-h-11" onClick={() => setOn(false)}>Pausar</Btn> : !idle && <Btn className="min-h-11" onClick={resume}>Reanudar</Btn>}
        <Btn variant="ghost" className="min-h-11" onClick={skip}>Saltar</Btn>
      </div>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Duración del descanso">
        {[30, 60, 90, 120, 180].map((n) => <Btn key={n} variant={seconds === n ? 'primary' : 'ghost'} aria-pressed={seconds === n} className="min-h-10 px-3 py-1 text-sm" onClick={() => onChangeSeconds(n)}>{n} s</Btn>)}
      </div>
    </div>
  )
}
