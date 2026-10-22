import { useState, useEffect } from 'react'
import { Card, Btn, Field, Select } from '../ui'
import { validateActivity } from '../../utils/habitCalculations'
import { ACTIVITY_TYPES } from '../../data/habits'
import { fmtFull } from '../../utils/formatters'

export default function ActivityTracker({ date, record, onSave, onRemove }) {
  const [f, setF] = useState({ steps: '', minutes: '', type: ACTIVITY_TYPES[0] })
  const [err, setErr] = useState('')
  useEffect(() => { setErr(''); setF(record ? { steps: String(record.steps), minutes: record.activityMinutes ? String(record.activityMinutes) : '', type: record.activityType } : { steps: '', minutes: '', type: ACTIVITY_TYPES[0] }) }, [record?.id, date]) // eslint-disable-line
  const save = () => {
    const e = validateActivity({ steps: f.steps, activityMinutes: f.minutes })
    if (e) return setErr(e)
    setErr(''); onSave({ id: `real-ac-${date}`, type: 'real', date, steps: Number(f.steps), activityMinutes: f.minutes === '' ? 0 : Number(f.minutes), activityType: f.type })
  }
  return (
    <Card title="🚶 Actividad" className="scroll-mt-4">
      <div id="activity-tracker" />
      <p className="-mt-2 mb-2 text-sm text-slate-400">Registro manual del {fmtFull(date)}.</p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Pasos" type="number" inputMode="numeric" value={f.steps} onChange={(e) => setF({ ...f, steps: e.target.value })} />
        <Field label="Minutos de actividad (opcional)" type="number" inputMode="numeric" value={f.minutes} onChange={(e) => setF({ ...f, minutes: e.target.value })} />
      </div>
      <div className="mt-3"><Select label="Tipo" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>{ACTIVITY_TYPES.map((t) => <option key={t}>{t}</option>)}</Select></div>
      {err && <p role="alert" className="mt-2 text-sm text-red-400">{err}</p>}
      <div className="mt-3 flex gap-2"><Btn className="min-h-11" onClick={save}>{record ? 'Actualizar actividad' : 'Guardar actividad'}</Btn>{record && <Btn variant="ghost" className="min-h-11" onClick={() => onRemove(date)}>Quitar</Btn>}</div>
    </Card>
  )
}
