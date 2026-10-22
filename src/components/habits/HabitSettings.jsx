import { useState } from 'react'
import { Card, Btn, Field } from '../ui'
import { WEEKDAYS, HABITS } from '../../data/habits'

export default function HabitSettings({ hd, settings, targets, onPatch, onWaterGoal }) {
  const [f, setF] = useState({ water: String(targets.agua), sleep: String(settings.sleepGoalH), steps: String(settings.stepsGoal), min: String(settings.streakMin), pct: String(settings.nutritionPct) })
  const [err, setErr] = useState('')
  const [ok, setOk] = useState(false)
  const save = () => {
    const w = Number(f.water), s = Number(f.sleep), st = Number(f.steps), m = Number(f.min), p = Number(f.pct)
    if (!(w >= 500 && w <= 10000)) return setErr('El agua debe estar entre 500 y 10000 ml.')
    if (!(s >= 3 && s <= 14)) return setErr('El objetivo de sueño debe estar entre 3 y 14 horas.')
    if (!Number.isInteger(st) || st < 1000 || st > 50000) return setErr('Los pasos deben estar entre 1000 y 50000.')
    if (!(m >= 10 && m <= 100)) return setErr('El mínimo de la racha debe estar entre 10% y 100%.')
    if (!(p >= 30 && p <= 100)) return setErr('El porcentaje de nutrición debe estar entre 30% y 100%.')
    setErr(''); onWaterGoal(w); onPatch({ sleepGoalH: s, stepsGoal: st, streakMin: m, nutritionPct: p }); setOk(true)
  }
  const toggleDay = (n) => { const cur = hd.trainingDays, next = cur.includes(n) ? cur.filter((x) => x !== n) : [...cur, n].sort(); onPatch({ trainingDays: next }) }
  return (
    <div className="space-y-4">
      <Card title="Objetivos de hábitos">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Agua (ml)" type="number" value={f.water} onChange={(e) => { setOk(false); setF({ ...f, water: e.target.value }) }} />
          <Field label="Sueño (horas)" type="number" step="0.5" value={f.sleep} onChange={(e) => { setOk(false); setF({ ...f, sleep: e.target.value }) }} />
          <Field label="Pasos diarios" type="number" value={f.steps} onChange={(e) => { setOk(false); setF({ ...f, steps: e.target.value }) }} />
          <Field label="Mínimo para racha (%)" type="number" value={f.min} onChange={(e) => { setOk(false); setF({ ...f, min: e.target.value }) }} />
          <Field label="Nutrición completa desde (% de kcal)" type="number" value={f.pct} onChange={(e) => { setOk(false); setF({ ...f, pct: e.target.value }) }} />
        </div>
        <p className="mt-2 text-sm text-slate-300">Proteína: <b className="text-white">{targets.prot} g</b> y calorías: <b className="text-white">{targets.kcal} kcal</b> vienen del Motor Nutricional (se cambian en Perfil). El agua se comparte con Nutrición.</p>
        {err && <p role="alert" className="mt-2 text-sm text-red-400">{err}</p>}
        <Btn className="mt-3 min-h-11" onClick={save}>Guardar objetivos</Btn>
        {ok && <p className="mt-2 text-sm text-emerald-400" aria-live="polite">Objetivos guardados.</p>}
      </Card>
      <Card title="Días de entrenamiento">
        <div className="flex gap-2" role="group" aria-label="Días de entrenamiento">{WEEKDAYS.map(([l, n]) => <Btn key={n} variant={hd.trainingDays.includes(n) ? 'primary' : 'ghost'} aria-pressed={hd.trainingDays.includes(n)} aria-label={`Entrenar ${['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][n]}`} className="min-h-11 flex-1 px-0" onClick={() => toggleDay(n)}>{l}</Btn>)}</div>
        <p className="mt-2 text-xs text-slate-500">Los días sin entrenamiento programado son de descanso y no cuentan como hábito pendiente. {settings.trainingDays ? '' : 'Ahora se calculan con los días por semana de tu Perfil.'}</p>
        {settings.trainingDays && <Btn variant="ghost" className="mt-2" onClick={() => onPatch({ trainingDays: null })}>Volver a usar los días del Perfil</Btn>}
      </Card>
      <Card title="Recordatorios (próxima fase)">
        <p className="text-sm text-slate-400">La estructura ya está lista ({HABITS.length} hábitos con hora y estado), pero no se envían notificaciones todavía.</p>
      </Card>
    </div>
  )
}
