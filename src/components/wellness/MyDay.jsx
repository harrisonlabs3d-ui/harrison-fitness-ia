import { useState } from 'react'
import { Card, Btn, Bar, Badge } from '../ui'
import ScheduleTimeline from '../schedule/ScheduleTimeline'
import { generateDailySchedule, getNextEventAcross, isMain, getContextualReminders } from '../../utils/scheduleCalculations'
import { makePrimary } from '../../utils/scheduleActions'
import { fmtLong } from '../../utils/dateUtils'

const FILTERS = [['all', 'Todo'], ['pending', 'Pendientes'], ['done', 'Completados']]
const isOpen = (e) => e.status === 'pending' || e.status === 'next' || e.status === 'in_progress'

export default function MyDay({ sd, S, tr, go, today }) {
  const [filter, setFilter] = useState('all')
  const [openId, setOpenId] = useState(null)
  const [ml, setMl] = useState('')
  const [err, setErr] = useState('')
  const events = generateDailySchedule(sd, today), main = events.filter(isMain)
  const done = main.filter((e) => e.status === 'completed').length, skipped = main.filter((e) => e.status === 'skipped').length
  const primary = makePrimary({ S, tr, go, date: today })
  const shown = events.filter((e) => (filter === 'all' ? true : filter === 'pending' ? isOpen(e) : e.status === 'completed' || e.status === 'skipped'))
  const supp = events.filter((e) => e.type === 'supplement' && isOpen(e)), next = getNextEventAcross(sd)
  const water = sd.hd.water[today] || 0, goal = sd.hd.goals.waterMl
  const addCustom = () => {
    const n = Number(ml)
    if (!Number.isInteger(n) || n < 1 || n > 5000) return setErr('Escribe una cantidad entera de 1 a 5000 ml.')
    setErr(''); S.addWater(today, n); setMl('')
  }
  return (
    <div className="space-y-4">
      <div><p className="font-semibold capitalize text-white">{fmtLong(today)}</p>
        <p className="text-sm text-slate-300" aria-live="polite" data-day-progress>{done} de {main.length} actividades completadas{skipped ? ` · ${skipped} omitidas` : ''}.</p>
        {sd.demo && <p className="text-xs text-amber-400"><Badge kind="demo" /> Mi día incluye datos de demostración hasta que registres tu primer dato real.</p>}
        {next && <p className="text-sm text-slate-400">Próximo: {next.icon} {next.title} · {next.time}{next.date !== today ? ' (mañana)' : ''}</p>}</div>

      <Card title="Acciones rápidas">
        <p className="text-xs text-slate-500">Registran en los mismos módulos de siempre (agua, suplementos, nutrición, entrenamiento), sin duplicar.</p>
        <div className="mt-2 space-y-3">
          <div><Bar label="💧 Agua de hoy" value={water} max={goal} unit=" ml" />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {[250, 500].map((n) => <Btn key={n} className="min-h-11" onClick={() => S.addWater(today, n)}>+{n} ml</Btn>)}
              <input type="number" inputMode="numeric" min="1" max="5000" aria-label="Otra cantidad de agua en ml" placeholder="ml" value={ml} onChange={(e) => setMl(e.target.value)} className="w-24 rounded-lg border border-slate-700 bg-slate-950 p-2 text-white" />
              <Btn variant="ghost" className="min-h-11" onClick={addCustom}>Agregar</Btn>
            </div>
            {err && <p role="alert" className="text-sm text-red-400">{err}</p>}</div>
          <div><p className="text-sm text-slate-300">💊 Suplementos pendientes hoy</p>
            {!supp.length ? <p className="text-sm text-slate-500">No tienes tomas pendientes.</p> : <div className="mt-1 flex flex-wrap gap-2">{supp.map((e) => (e.demo ? <span key={e.id} className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-300">{e.time} {e.title} <Badge kind="demo" /></span> : <Btn key={e.id} variant="ghost" className="min-h-11" onClick={primary(e).run}>{e.time} · {e.title}</Btn>))}</div>}</div>
          <div className="flex flex-wrap gap-2"><Btn variant="ghost" className="min-h-11" onClick={() => go('nut')}>🍽️ Registrar comida</Btn><Btn variant="ghost" className="min-h-11" onClick={() => go('wo')}>🏋️ Entrenamiento</Btn></div>
        </div>
      </Card>

      {getContextualReminders(sd, events).map((c) => <p key={c.id} className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-slate-100">{c.icon} {c.text}</p>)}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtro de actividades">{FILTERS.map(([id, l]) => <Btn key={id} variant={filter === id ? 'primary' : 'ghost'} aria-pressed={filter === id} className="min-h-10 px-3 py-1 text-sm" onClick={() => setFilter(id)}>{l}</Btn>)}</div>
      {shown.length ? <ScheduleTimeline snoozeMin={sd.wellness.snoozeMin} events={shown} primary={primary} openId={openId} setOpenId={setOpenId} flex={false}
        onReschedule={(ev, newTime) => { S.reschedule({ date: today, eventId: ev.id, originalTime: ev.originalTime || ev.time, newTime }); setOpenId(null) }}
        onState={(ev, status) => S.setState({ date: today, eventId: ev.id, status })} onResetTime={(ev) => S.reschedule({ date: today, eventId: ev.id, originalTime: ev.originalTime, newTime: ev.originalTime })} />
        : <p className="text-sm text-slate-400">No hay actividades en esta vista.</p>}
      <p className="text-xs text-slate-500">Posponer, omitir o reprogramar valen solo para hoy y quedan en tu historial. Para cambiar tu horario permanente usa la pestaña Recordatorios.</p>
    </div>
  )
}
