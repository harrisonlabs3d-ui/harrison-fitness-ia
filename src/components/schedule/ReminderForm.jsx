import { useState } from 'react'
import { Btn, Field, Select } from '../ui'
import { REMINDER_TYPES, WEEK_ORDER, ALL_DAYS } from '../../data/schedule'
import { validateReminder } from '../../utils/scheduleCalculations'

const L = { 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S', 0: 'D' }
const NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
export default function ReminderForm({ reminder, list, onSave, onClose }) {
  const [f, setF] = useState({ title: reminder?.title || '', description: reminder?.description || '', message: reminder?.message || '', time: reminder?.time || '', weekendTime: reminder?.weekendTime || '', days: reminder?.days || ALL_DAYS, type: reminder?.type || 'personalizado', enabled: reminder?.enabled ?? true, priority: reminder?.priority || 'normal' })
  const [err, setErr] = useState({})
  const toggle = (d) => setF({ ...f, days: f.days.includes(d) ? f.days.filter((x) => x !== d) : [...f.days, d].sort() })
  const save = () => { const e = validateReminder(list, f, reminder?.id); setErr(e); if (!Object.keys(e).length) onSave({ ...f, title: f.title.trim(), message: f.message.trim(), weekendTime: f.weekendTime || '' }) }
  return (
    <div role="dialog" aria-modal="true" aria-label={reminder ? 'Editar recordatorio' : 'Nuevo recordatorio'} className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-2 md:items-center">
      <div className="max-h-[92vh] w-full max-w-md space-y-3 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-4">
        <h2 className="text-lg font-semibold text-white">{reminder ? 'Editar recordatorio' : 'Nuevo recordatorio'}</h2>
        <Field label="Título" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} error={err.title} />
        <Field label="Descripción (opcional)" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        <Field label="Mensaje del aviso (opcional)" value={f.message} maxLength={160} placeholder="Texto que verás en la notificación" onChange={(e) => setF({ ...f, message: e.target.value })} error={err.message} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Hora (lun–vie)" type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} error={err.time} />
          <Select label="Tipo" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>{REMINDER_TYPES.map(([id, l]) => <option key={id} value={id}>{l}</option>)}</Select>
        </div>
        <Field label="Hora distinta en sábado y domingo (opcional)" type="time" value={f.weekendTime} onChange={(e) => setF({ ...f, weekendTime: e.target.value })} error={err.weekendTime} />
        <div><p className="text-sm text-slate-400">Repetir</p>
          <div className="mt-1 flex gap-2" role="group" aria-label="Días">{WEEK_ORDER.map((d) => <Btn key={d} variant={f.days.includes(d) ? 'primary' : 'ghost'} aria-pressed={f.days.includes(d)} aria-label={NAMES[d]} className="min-h-11 flex-1 px-0" onClick={() => toggle(d)}>{L[d]}</Btn>)}</div>
          <div className="mt-2 flex gap-2"><Btn variant="ghost" className="min-h-10 px-3 py-1 text-sm" onClick={() => setF({ ...f, days: ALL_DAYS })}>Todos los días</Btn></div>
          {err.days && <p role="alert" className="text-sm text-red-400">{err.days}</p>}</div>
        <Select label="Prioridad" value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value })}><option value="low">Baja</option><option value="normal">Normal</option><option value="high">Alta</option><option value="critical">Crítica (solo si es realmente importante)</option></Select>
        <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={f.enabled} onChange={(e) => setF({ ...f, enabled: e.target.checked })} className="h-5 w-5" /> Activo</label>
        <div className="flex gap-2"><Btn className="min-h-11" onClick={save}>Guardar recordatorio</Btn><Btn variant="ghost" className="min-h-11" onClick={onClose}>Cancelar</Btn></div>
      </div>
    </div>
  )
}
