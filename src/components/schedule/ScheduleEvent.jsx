import { useState } from 'react'
import { motion } from 'framer-motion'
import { Btn, Badge } from '../ui'
import { STATUS_LABEL, shiftTime, isValidTime } from '../../utils/scheduleCalculations'

const TONE = { pending: 'bg-slate-800 text-slate-300', next: 'bg-blue-500/20 text-blue-300', in_progress: 'bg-emerald-500/20 text-emerald-300', completed: 'bg-emerald-500/10 text-emerald-300', skipped: 'bg-slate-800 text-slate-400', not_applicable: 'bg-slate-800 text-slate-500' }
export default function ScheduleEvent({ ev, primary, open, onToggle, onReschedule, onState, onResetTime, snoozeMin = 10 }) {
  const [custom, setCustom] = useState('')
  const [err, setErr] = useState('')
  const p = primary(ev), done = ev.status === 'completed' || ev.status === 'skipped'
  const go = (t) => { if (!isValidTime(t)) return setErr('Elige una hora válida.'); setErr(''); onReschedule(ev, t); setCustom('') }
  return (
    <motion.li layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} data-event-id={ev.id} data-status={ev.status}
      className={`rounded-xl border p-3 ${ev.status === 'in_progress' ? 'border-emerald-500/50 bg-emerald-500/5' : ev.status === 'next' ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-800 bg-slate-900'} ${done ? 'opacity-80' : ''}`}>
      <div className="flex items-start gap-3">
        <p className="w-14 shrink-0 text-lg font-bold text-white" data-field="time">{ev.time}</p>
        <div className="min-w-0 flex-1">
          <p className={`text-white ${ev.status === 'skipped' ? 'line-through' : ''}`}>{ev.icon} {ev.title} {ev.status === 'completed' && <span aria-label="Completado">✓</span>} {ev.demo && <Badge kind="demo" />}</p>
          {ev.description && <p className="text-sm text-slate-400">{ev.description}</p>}
          {ev.rescheduled && <p className="text-xs text-amber-300">Reprogramado solo hoy (original {ev.originalTime})</p>}
        </div>
        <span className={`shrink-0 rounded px-2 py-0.5 text-xs ${TONE[ev.status]}`}>{STATUS_LABEL[ev.status]}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {p && <Btn className="min-h-11" onClick={p.run}>{p.label}</Btn>}
        <Btn variant="ghost" className="min-h-11" aria-expanded={open} onClick={onToggle}>Opciones</Btn>
      </div>
      {open && (
        <div className="mt-3 space-y-2 rounded-lg bg-slate-950 p-3 text-sm">
          <p className="text-slate-300">Reprogramar solo hoy (no cambia tu horario permanente)</p>
          <div className="flex flex-wrap gap-2">
            {!done && <Btn variant="ghost" className="min-h-10 px-3 py-1" onClick={() => go(shiftTime(ev.time, snoozeMin))}>Posponer {snoozeMin} min</Btn>}
            {[-60, 60].map((m) => <Btn key={m} variant="ghost" className="min-h-10 px-3 py-1" onClick={() => go(shiftTime(ev.time, m))}>{shiftTime(ev.time, m)}</Btn>)}
            <input type="time" aria-label={`Hora personalizada para ${ev.title}`} value={custom} onChange={(e) => setCustom(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-white" />
            <Btn className="min-h-10 px-3 py-1" onClick={() => go(custom)}>Mover</Btn>
          </div>
          {err && <p role="alert" className="text-red-400">{err}</p>}
          <div className="flex flex-wrap gap-2">
            {ev.rescheduled && <Btn variant="ghost" className="min-h-10 px-3 py-1" onClick={() => onResetTime(ev)}>Volver al horario original</Btn>}
            {ev.status === 'skipped' ? <Btn variant="ghost" className="min-h-10 px-3 py-1" onClick={() => onState(ev, null)}>Deshacer omitir</Btn> : !done && <Btn variant="ghost" className="min-h-10 px-3 py-1" onClick={() => onState(ev, 'skipped')}>Omitir hoy</Btn>}
            {ev.manualState === 'completed' && <Btn variant="ghost" className="min-h-10 px-3 py-1" onClick={() => onState(ev, null)}>Deshacer completado</Btn>}
            {!done && !ev.auto && !ev.noManual && <Btn variant="ghost" className="min-h-10 px-3 py-1" onClick={() => onState(ev, 'completed')}>Marcar completado</Btn>}
          </div>
        </div>
      )}
    </motion.li>
  )
}
