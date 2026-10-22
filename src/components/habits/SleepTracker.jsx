import { useState, useEffect } from 'react'
import { Card, Btn, Field } from '../ui'
import { sleepDuration, validateSleep, fmtDuration } from '../../utils/habitCalculations'
import { fmtFull } from '../../utils/formatters'

export default function SleepTracker({ date, record, profile, onSave, onRemove }) {
  const [f, setF] = useState({ sleepTime: profile.dormir || '22:15', wakeTime: profile.despertar || '04:40', quality: '' })
  const [err, setErr] = useState('')
  useEffect(() => { setErr(''); if (record) setF({ sleepTime: record.sleepTime, wakeTime: record.wakeTime, quality: record.quality ? String(record.quality) : '' }) }, [record?.id, date]) // eslint-disable-line
  const q = f.quality === '' ? null : Number(f.quality)
  const dur = f.sleepTime && f.wakeTime ? sleepDuration(f.sleepTime, f.wakeTime) : 0
  const save = () => {
    const e = validateSleep({ ...f, quality: q })
    if (e) return setErr(e)
    setErr(''); onSave({ id: `real-sl-${date}`, type: 'real', date, sleepTime: f.sleepTime, wakeTime: f.wakeTime, duration: dur, quality: q })
  }
  return (
    <Card title="😴 Sueño" className="scroll-mt-4">
      <div id="sleep-tracker" />
      <p className="-mt-2 mb-2 text-sm text-slate-400">Noche que termina el {fmtFull(date)}.</p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Hora de dormir" type="time" value={f.sleepTime} onChange={(e) => setF({ ...f, sleepTime: e.target.value })} />
        <Field label="Hora de despertar" type="time" value={f.wakeTime} onChange={(e) => setF({ ...f, wakeTime: e.target.value })} />
      </div>
      <p className="mt-2 text-sm text-slate-300" aria-live="polite">Horas dormidas: <b className="text-white">{dur ? fmtDuration(dur) : '—'}</b></p>
      <div className="mt-2"><p className="text-sm text-slate-400">Calidad percibida (opcional, 1–5)</p>
        <div className="mt-1 flex gap-2" role="group" aria-label="Calidad del sueño">{[1, 2, 3, 4, 5].map((n) => <Btn key={n} variant={q === n ? 'primary' : 'ghost'} aria-pressed={q === n} className="min-h-11 flex-1 px-0" onClick={() => setF({ ...f, quality: q === n ? '' : String(n) })}>{n}</Btn>)}</div></div>
      {err && <p role="alert" className="mt-2 text-sm text-red-400">{err}</p>}
      <div className="mt-3 flex gap-2"><Btn className="min-h-11" onClick={save}>{record ? 'Actualizar sueño' : 'Guardar sueño'}</Btn>{record && <Btn variant="ghost" className="min-h-11" onClick={() => onRemove(date)}>Quitar</Btn>}</div>
    </Card>
  )
}
