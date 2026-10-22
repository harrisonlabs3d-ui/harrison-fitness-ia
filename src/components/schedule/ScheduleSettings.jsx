import { useState } from 'react'
import { Card, Btn, Field, Select } from '../ui'
import { MEAL_TYPES } from '../../data/foods'
import { DAY_NAMES, WEEK_ORDER } from '../../data/schedule'
import { isValidTime } from '../../utils/scheduleCalculations'
import { toMin } from '../../utils/habitCalculations'

export default function ScheduleSettings({ settings: s, profile, targets, S }) {
  const [f, setF] = useState({ wake: profile.despertar, sleep: profile.dormir, meals: { ...s.mealTimes }, extraOn: s.extraSnack.enabled, extra: s.extraSnack.time, train: s.trainingTime, lead: String(s.workoutLeadMin), waterMl: String(targets.agua), amount: String(s.water.amountMl), wStart: s.water.start || '', wEnd: s.water.end, adv: String(s.sleepAdvanceMin), act: s.activityTime, pDay: String(s.progress.day), pTime: s.progress.time, wEvery: String(s.progress.weight.everyDays), cEvery: String(s.progress.waist.everyDays), phEvery: String(s.progress.photo.everyDays) })
  const [err, setErr] = useState('')
  const [ok, setOk] = useState(false)
  const set = (k, v) => { setOk(false); setF({ ...f, [k]: v }) }
  const save = () => {
    const times = [f.wake, f.sleep, f.extra, f.train, f.wEnd, f.act, f.pTime, ...Object.values(f.meals)]
    if (times.some((t) => !isValidTime(t)) || (f.wStart && !isValidTime(f.wStart))) return setErr('Revisa las horas: todas deben ser válidas.')
    const ml = Number(f.waterMl)
    if (!(ml >= 500 && ml <= 10000)) return setErr('El objetivo de agua debe estar entre 500 y 10000 ml.')
    if (toMin(f.wEnd) <= toMin(f.wStart || '00:00')) return setErr('El horario de agua debe terminar después de empezar.')
    const ev = [f.wEvery, f.cEvery, f.phEvery].map(Number)
    if (ev.some((n) => !Number.isInteger(n) || n < 1 || n > 60)) return setErr('Las frecuencias de progreso deben ser de 1 a 60 días.')
    setErr('')
    S.saveProfileTimes(f.wake, f.sleep); S.setWaterGoal(ml)
    S.saveSettings({ ...s, mealTimes: f.meals, extraSnack: { enabled: f.extraOn, time: f.extra }, trainingTime: f.train, workoutLeadMin: Number(f.lead), water: { ...s.water, amountMl: Number(f.amount), start: f.wStart || null, end: f.wEnd }, sleepAdvanceMin: Number(f.adv), activityTime: f.act, progress: { ...s.progress, day: Number(f.pDay), time: f.pTime, weight: { ...s.progress.weight, everyDays: ev[0] }, waist: { ...s.progress.waist, everyDays: ev[1] }, photo: { ...s.progress.photo, everyDays: ev[2] } } })
    setOk(true)
  }
  return (
    <Card title="Configuración de agenda">
      <p className="mb-3 text-sm text-slate-400">Tu horario solo cambia cuando pulsas “Guardar configuración”. Despertar y dormir son los mismos del Perfil.</p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Hora de despertar" type="time" value={f.wake} onChange={(e) => set('wake', e.target.value)} />
        <Field label="Hora de dormir" type="time" value={f.sleep} onChange={(e) => set('sleep', e.target.value)} />
        {MEAL_TYPES.map((m) => <Field key={m.id} label={`${m.label} (hora)`} type="time" value={f.meals[m.id]} onChange={(e) => set('meals', { ...f.meals, [m.id]: e.target.value })} />)}
        <Field label="Snack adicional (hora)" type="time" value={f.extra} onChange={(e) => set('extra', e.target.value)} />
        <Field label="Hora de entrenamiento" type="time" value={f.train} onChange={(e) => set('train', e.target.value)} />
        <Select label="Aviso antes del entreno" value={f.lead} onChange={(e) => set('lead', e.target.value)}>{[15, 30, 60].map((n) => <option key={n} value={n}>{n} min antes</option>)}</Select>
        <Field label="Objetivo de agua (ml)" type="number" value={f.waterMl} onChange={(e) => set('waterMl', e.target.value)} />
        <Select label="Cantidad por recordatorio de agua" value={f.amount} onChange={(e) => set('amount', e.target.value)}>{[250, 500, 750].map((n) => <option key={n} value={n}>{n} ml</option>)}</Select>
        <Field label="Agua desde (vacío = al despertar)" type="time" value={f.wStart} onChange={(e) => set('wStart', e.target.value)} />
        <Field label="Agua hasta" type="time" value={f.wEnd} onChange={(e) => set('wEnd', e.target.value)} />
        <Select label="Aviso de hora de dormir" value={f.adv} onChange={(e) => set('adv', e.target.value)}>{[15, 30, 60].map((n) => <option key={n} value={n}>{n} min antes</option>)}</Select>
        <Field label="Registrar pasos (hora)" type="time" value={f.act} onChange={(e) => set('act', e.target.value)} />
        <Select label="Día de pesaje y fotos" value={f.pDay} onChange={(e) => set('pDay', e.target.value)}>{WEEK_ORDER.map((d) => <option key={d} value={d}>{DAY_NAMES[d]}</option>)}</Select>
        <Field label="Hora de registro de progreso" type="time" value={f.pTime} onChange={(e) => set('pTime', e.target.value)} />
        <Field label="Peso cada (días)" type="number" value={f.wEvery} onChange={(e) => set('wEvery', e.target.value)} />
        <Field label="Cintura cada (días)" type="number" value={f.cEvery} onChange={(e) => set('cEvery', e.target.value)} />
        <Field label="Foto cada (días)" type="number" value={f.phEvery} onChange={(e) => set('phEvery', e.target.value)} />
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={f.extraOn} onChange={(e) => set('extraOn', e.target.checked)} className="h-5 w-5" /> Incluir el snack adicional en la agenda</label>
      {err && <p role="alert" className="mt-2 text-sm text-red-400">{err}</p>}
      <Btn className="mt-3 min-h-11" onClick={save}>Guardar configuración</Btn>
      {ok && <p className="mt-2 text-sm text-emerald-400" aria-live="polite">Configuración guardada.</p>}
    </Card>
  )
}
