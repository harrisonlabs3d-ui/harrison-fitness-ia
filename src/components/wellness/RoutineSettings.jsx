import { useState } from 'react'
import { Card, Btn } from '../ui'
import { isValidTime } from '../../utils/scheduleCalculations'

const MEALS = [['desayuno', 'Desayuno', '🍳'], ['snack1', 'Snack de media mañana', '🥗'], ['almuerzo', 'Almuerzo', '🍛'], ['snack2', 'Snack de la tarde', '🥪'], ['cena', 'Cena', '🍽️']]
function Switch({ on, label, onClick }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onClick} className={`h-8 w-14 shrink-0 rounded-full p-1 transition ${on ? 'bg-blue-600' : 'bg-slate-700'}`}><span className={`block h-6 w-6 rounded-full bg-white transition ${on ? 'translate-x-6' : ''}`} /></button>
}
const T = ({ label, value, onChange }) => <input type="time" aria-label={label} value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-28 rounded-lg border border-slate-700 bg-slate-950 p-2 text-white" />

function Row({ id, icon, label, children, weekend, enabled, onToggle }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-slate-800 py-3 first:border-0" data-routine={id}>
      <span aria-hidden="true">{icon}</span>
      <p className="min-w-0 flex-1 text-white">{label}</p>
      {children}{weekend}
      <Switch on={enabled} label={`${enabled ? 'Desactivar' : 'Activar'} ${label}`} onClick={onToggle} />
    </div>
  )
}
const Wk = ({ label, value, onChange }) => <div className="text-xs text-slate-400">Fin de sem.<br /><T label={`${label} (sábado y domingo)`} value={value} onChange={onChange} /></div>

// Rutina diaria: hora de lunes a viernes, hora opcional de sábado y domingo, y activar/desactivar cada aviso.
// Reutiliza los ajustes existentes de la agenda y el perfil; nada se guarda hasta pulsar "Guardar rutina".
export default function RoutineSettings({ d, setD, W, S }) {
  const ss = d.scheduleSettings, wk = d.wellnessSettings.weekend, off = d.wellnessSettings.off
  const init = () => ({ wake: d.profile.despertar || '05:00', sleep: d.profile.dormir || '22:15', training: ss.trainingTime, meals: { ...ss.mealTimes }, extra: ss.extraSnack.time, adv: String(ss.sleepAdvanceMin), waterAmount: String(ss.water.amountMl), waterEnd: ss.water.end || '21:00', wk: { wake: wk.wake || '', sleep: wk.sleep || '', trainingTime: wk.trainingTime || '', mealTimes: { ...wk.mealTimes } } })
  const [f, setF] = useState(init)
  const [err, setErr] = useState('')
  const [ok, setOk] = useState(false)
  const edit = (patch) => { setOk(false); setF({ ...f, ...patch }) }
  const wkEdit = (patch) => edit({ wk: { ...f.wk, ...patch } })
  const on = (id) => !off.includes(id)

  const save = () => {
    const times = [f.wake, f.sleep, f.training, f.extra, f.waterEnd, ...Object.values(f.meals)], opt = [f.wk.wake, f.wk.sleep, f.wk.trainingTime, ...Object.values(f.wk.mealTimes)].filter(Boolean)
    if (![...times, ...opt].every(isValidTime)) return setErr('Revisa los horarios: hay alguno vacío o no válido.')
    const adv = Number(f.adv), amount = Number(f.waterAmount)
    if (!Number.isInteger(adv) || adv < 0 || adv > 180) return setErr('El aviso previo para dormir debe ser de 0 a 180 minutos.')
    if (!Number.isInteger(amount) || amount < 50 || amount > 2000) return setErr('La cantidad de agua por aviso debe ser de 50 a 2000 ml.')
    setErr('')
    const mealTimes = Object.fromEntries(Object.entries(f.wk.mealTimes).filter(([, v]) => v))
    setD((p) => ({ ...p,
      profile: { ...p.profile, despertar: f.wake, dormir: f.sleep },
      scheduleSettings: { ...p.scheduleSettings, mealTimes: f.meals, trainingTime: f.training, extraSnack: { ...p.scheduleSettings.extraSnack, time: f.extra }, sleepAdvanceMin: adv, water: { ...p.scheduleSettings.water, amountMl: amount, end: f.waterEnd } },
      wellnessSettings: { ...p.wellnessSettings, weekend: { wake: f.wk.wake, sleep: f.wk.sleep, trainingTime: f.wk.trainingTime, mealTimes } } }))
    setOk(true)
  }
  const tg = (id) => ({ enabled: on(id), onToggle: () => W.setOff(id, on(id)) })
  return (
    <Card title="Rutina diaria">
      <p className="text-sm text-slate-400">Cada fila es un aviso de tu agenda. La hora de arriba rige de lunes a viernes; la de «Fin de sem.» (opcional) rige sábado y domingo. Son horarios personales, no prescripciones: adáptalos a tus responsabilidades.</p>
      <div className="mt-2">
        <Row id="wake" {...tg('wake')} icon="☀️" label="Hora de levantarse" weekend={<Wk label="Levantarse" value={f.wk.wake} onChange={(v) => wkEdit({ wake: v })} />}><T label="Hora de levantarse (lunes a viernes)" value={f.wake} onChange={(v) => edit({ wake: v })} /></Row>
        <Row id="water" enabled={ss.water.enabled} onToggle={() => S.saveSettings({ ...ss, water: { ...ss.water, enabled: !ss.water.enabled } })} icon="💧" label="Recordatorios de agua"><div className="flex items-center gap-2 text-xs text-slate-400"><input type="number" min="50" max="2000" step="50" aria-label="Agua por aviso (ml)" value={f.waterAmount} onChange={(e) => edit({ waterAmount: e.target.value })} className="w-20 rounded-lg border border-slate-700 bg-slate-950 p-2 text-white" />ml hasta<T label="Último aviso de agua" value={f.waterEnd} onChange={(v) => edit({ waterEnd: v })} /></div></Row>
        {MEALS.map(([id, label, icon]) => <Row key={id} id={`meal:${id}`} {...tg(`meal:${id}`)} icon={icon} label={label} weekend={<Wk label={label} value={f.wk.mealTimes[id]} onChange={(v) => wkEdit({ mealTimes: { ...f.wk.mealTimes, [id]: v } })} />}><T label={`${label} (lunes a viernes)`} value={f.meals[id]} onChange={(v) => edit({ meals: { ...f.meals, [id]: v } })} /></Row>)}
        {ss.extraSnack.enabled && <Row id="meal:extra" {...tg('meal:extra')} icon="🥤" label="Snack adicional" weekend={<Wk label="Snack adicional" value={f.wk.mealTimes.extra} onChange={(v) => wkEdit({ mealTimes: { ...f.wk.mealTimes, extra: v } })} />}><T label="Snack adicional (lunes a viernes)" value={f.extra} onChange={(v) => edit({ extra: v })} /></Row>}
        <Row id="workout" {...tg('workout')} icon="🏋️" label="Entrenamiento (días programados)" weekend={<Wk label="Entrenamiento" value={f.wk.trainingTime} onChange={(v) => wkEdit({ trainingTime: v })} />}><T label="Entrenamiento (lunes a viernes)" value={f.training} onChange={(v) => edit({ training: v })} /></Row>
        <Row id="sleepprep" {...tg('sleepprep')} icon="🌙" label="Preparación para dormir (minutos antes)"><input type="number" min="0" max="180" step="5" aria-label="Minutos de aviso antes de dormir" value={f.adv} onChange={(e) => edit({ adv: e.target.value })} className="w-20 rounded-lg border border-slate-700 bg-slate-950 p-2 text-white" /></Row>
        <Row id="sleep" {...tg('sleep')} icon="😴" label="Hora de acostarse" weekend={<Wk label="Acostarse" value={f.wk.sleep} onChange={(v) => wkEdit({ sleep: v })} />}><T label="Hora de acostarse (lunes a viernes)" value={f.sleep} onChange={(v) => edit({ sleep: v })} /></Row>
      </div>
      {err && <p role="alert" className="mt-2 text-sm text-red-400">{err}</p>}
      <div className="mt-3 flex items-center gap-3"><Btn className="min-h-11" onClick={save}>Guardar rutina</Btn>{ok && <span className="text-sm text-emerald-400" aria-live="polite">Rutina guardada.</span>}</div>
      <p className="mt-2 text-xs text-slate-500">Los interruptores se aplican al instante. La hora de despertar y dormir se comparte con tu Perfil. Los snacks y comidas se completan al registrarlos en Nutrición.</p>
    </Card>
  )
}
