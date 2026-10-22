import { useState } from 'react'
import { Card, Btn, Badge } from '../ui'
import ReminderForm from './ReminderForm'
import ConfirmDialog from '../ConfirmDialog'
import { CATEGORIES, TYPE_ICON, WEEK_ORDER, ALL_DAYS } from '../../data/schedule'
import { SUGGESTED_REMINDERS } from '../../data/schedule'

const L = { 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S', 0: 'D' }
const daysText = (d) => (d.length === 7 ? 'Todos los días' : WEEK_ORDER.filter((x) => d.includes(x)).map((x) => L[x]).join(' '))
function Switch({ on, label, onClick }) {
  return <button role="switch" aria-checked={on} aria-label={label} onClick={onClick} className={`h-8 w-14 shrink-0 rounded-full p-1 transition ${on ? 'bg-blue-600' : 'bg-slate-700'}`}><span className={`block h-6 w-6 rounded-full bg-white transition ${on ? 'translate-x-6' : ''}`} /></button>
}
export default function ReminderList({ reminders, settings, S }) {
  const [view, setView] = useState('active')
  const [form, setForm] = useState(null)
  const [del, setDel] = useState(null)
  const [ask, setAsk] = useState(false)
  const real = reminders.filter((r) => !r.demo)
  const sys = CATEGORIES.map(([id, title, description]) => ({ id: `sys:${id}`, key: id, title, description, enabled: settings.categories[id], system: true }))
  const items = [...sys, ...reminders.map((r) => ({ ...r, system: false }))].filter((r) => (view === 'active' ? r.enabled : view === 'off' ? !r.enabled : !r.system))
  return (
    <div className="space-y-4">
      <Card title="Mis recordatorios">
        <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Filtro">{[['active', 'Activos'], ['off', 'Desactivados'], ['custom', 'Personalizados']].map(([id, l]) => <Btn key={id} variant={view === id ? 'primary' : 'ghost'} aria-pressed={view === id} className="min-h-10 px-3 py-1 text-sm" onClick={() => setView(id)}>{l}</Btn>)}</div>
        {items.length === 0 && <p className="py-3 text-sm text-slate-400">No hay recordatorios en esta vista.</p>}
        {items.map((r) => (
          <div key={r.id} data-reminder={r.id} className="flex items-center gap-3 border-t border-slate-800 py-3 first:border-0">
            <div className="min-w-0 flex-1">
              <p className="text-white">{r.system ? '⚙️' : TYPE_ICON[r.type] || '🔔'} {r.title} {r.demo && <Badge kind="demo" />} {r.source === 'default' && <span className="rounded bg-slate-800 px-1.5 text-xs text-slate-400">sugerido</span>}</p>
              <p className="text-xs text-slate-400">{r.system ? r.description : `${r.time}${r.weekendTime ? ` (fin de semana ${r.weekendTime})` : ''} · ${daysText(r.days)}${r.description ? ` · ${r.description}` : ''}${r.message ? ` · «${r.message}»` : ''}`}</p>
              {!r.system && !r.demo && <div className="mt-1 flex gap-3 text-sm"><button className="py-1 text-blue-300" aria-label={`Editar ${r.title}`} onClick={() => setForm(r)}>Editar</button><button className="py-1 text-slate-300" aria-label={`Duplicar ${r.title}`} onClick={() => S.duplicateReminder(r.id)}>Duplicar</button><button className="py-1 text-red-400" aria-label={`Eliminar ${r.title}`} onClick={() => setDel(r)}>Eliminar</button></div>}
            </div>
            {!r.demo && <Switch on={r.enabled} label={`${r.enabled ? 'Desactivar' : 'Activar'} ${r.title}`} onClick={() => (r.system ? S.setCategory(r.key, !r.enabled) : S.flipReminder(r.id))} />}
          </div>
        ))}
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn className="min-h-11" onClick={() => setForm('new')}>+ Nuevo recordatorio</Btn>
          {!settings.defaultsAccepted && <Btn variant="ghost" className="min-h-11" onClick={() => setAsk(true)}>Agregar recordatorios sugeridos</Btn>}
        </div>
      </Card>
      {form && <ReminderForm reminder={form === 'new' ? null : form} list={real} onClose={() => setForm(null)} onSave={(data) => { form === 'new' ? S.addReminder(data) : S.editReminder(form.id, data); setForm(null) }} />}
      {del && <ConfirmDialog text={`¿Eliminar el recordatorio "${del.title}"?`} confirmLabel="Eliminar" onCancel={() => setDel(null)} onConfirm={() => { S.removeReminder(del.id); setDel(null) }} />}
      {ask && <ConfirmDialog text={`Se agregarán ${SUGGESTED_REMINDERS.length} recordatorios sugeridos (${SUGGESTED_REMINDERS.map((r) => r.title).join(', ')}). Puedes editarlos, desactivarlos o eliminarlos. ¿Agregarlos?`} confirmLabel="Agregar" onCancel={() => setAsk(false)} onConfirm={() => { S.acceptDefaults(); setAsk(false) }} />}
    </div>
  )
}
