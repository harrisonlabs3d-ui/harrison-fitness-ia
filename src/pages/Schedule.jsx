import { useState } from 'react'
import { Card, Btn, Badge } from '../components/ui'
import ScheduleTimeline from '../components/schedule/ScheduleTimeline'
import ScheduleConflict from '../components/schedule/ScheduleConflict'
import { CurrentEvent, NextEvent } from '../components/schedule/NowNext'
import ReminderList from '../components/schedule/ReminderList'
import ScheduleCalendar, { WeeklySchedule } from '../components/schedule/ScheduleCalendar'
import { DailySummary, TomorrowSummary } from '../components/schedule/DailySummary'
import ScheduleSettings from '../components/schedule/ScheduleSettings'
import NotificationSettings from '../components/schedule/NotificationSettings'
import { useSchedule } from '../hooks/useSchedule'
import { useTraining } from '../hooks/useTraining'
import { useMinuteClock } from '../hooks/useClock'
import { makePrimary } from '../utils/scheduleActions'
import { addDays, fmtLong } from '../utils/dateUtils'
import { generateDailySchedule, getDayMeta, getCurrentEvent, getNextEventAcross, detectScheduleConflicts, generateDailySummary, generateTomorrowSummary, getContextualReminders, getPendingToday } from '../utils/scheduleCalculations'

const TABS = [['hoy', 'Hoy'], ['sem', 'Semana'], ['cal', 'Calendario'], ['rec', 'Recordatorios'], ['aj', 'Ajustes']]

export default function Schedule({ d, setD, t, go }) {
  const now = useMinuteClock()
  const S = useSchedule(d, setD, t, now), { sd } = S
  const tr = useTraining(d, setD)
  const [tab, setTab] = useState('hoy')
  const [date, setDate] = useState(sd.today)
  const [openId, setOpenId] = useState(null)
  const [flex, setFlex] = useState(false)
  const isToday = date === sd.today
  const events = generateDailySchedule(sd, date), meta = getDayMeta(sd, date), conflicts = detectScheduleConflicts(events)

  const primary = makePrimary({ S, tr, go, date })
  const timeline = (
    <>
      {meta.restDay && <div className="mx-auto max-w-xl rounded-xl border border-slate-700 bg-slate-900 p-3 text-center text-white">😴 DÍA DE DESCANSO <span className="block text-xs text-slate-400">No hay entrenamiento programado.</span></div>}
      <ScheduleTimeline snoozeMin={d.wellnessSettings.snoozeMin} events={events} primary={primary} openId={openId} setOpenId={setOpenId} flex={flex && isToday}
        onReschedule={(ev, newTime) => { S.reschedule({ date, eventId: ev.id, originalTime: ev.originalTime || ev.time, newTime }); setOpenId(null) }}
        onState={(ev, status) => S.setState({ date, eventId: ev.id, status })} onResetTime={(ev) => S.reschedule({ date, eventId: ev.id, originalTime: ev.originalTime, newTime: ev.originalTime })} />
    </>
  )

  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold text-white">Mi agenda</h1><p className="text-slate-400">¿Qué tengo que hacer ahora y qué viene después?</p></div>
      <div role="tablist" aria-label="Secciones de agenda" className="flex gap-2 overflow-x-auto">{TABS.map(([id, l]) => <Btn key={id} role="tab" aria-selected={tab === id} variant={tab === id ? 'primary' : 'ghost'} onClick={() => { setTab(id); if (id === 'hoy') setDate(sd.today) }}>{l}</Btn>)}</div>
      {sd.demo && <p className="text-xs text-amber-400"><Badge kind="demo" /> La agenda usa datos de demostración (y recordatorios de ejemplo) hasta que registres tu primer dato real.</p>}

      {tab === 'hoy' && (<>
        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-2">
          <Btn variant="ghost" aria-label="Día anterior" className="min-h-11" onClick={() => setDate(addDays(date, -1))}>←</Btn>
          <div className="text-center"><p className="font-semibold capitalize text-white">{isToday ? `Hoy, ${fmtLong(date)}` : fmtLong(date)}</p>{!isToday && <button className="text-xs text-blue-300" onClick={() => setDate(sd.today)}>Ir a hoy</button>}</div>
          <Btn variant="ghost" aria-label="Día siguiente" className="min-h-11" onClick={() => setDate(addDays(date, 1))}>→</Btn>
        </div>
        {isToday && <>
          <CurrentEvent ev={getCurrentEvent(events)} now={now} primary={primary} />
          <NextEvent ev={getNextEventAcross(sd)} tomorrow={getNextEventAcross(sd)?.date !== sd.today} />
          {getContextualReminders(sd, events).map((c) => <p key={c.id} className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-slate-100" data-contextual={c.id}>{c.icon} {c.text}</p>)}
        </>}
        <ScheduleConflict conflicts={conflicts} onFix={(e) => { setOpenId(e.id); document.querySelector(`[data-event-id="${e.id}"]`)?.scrollIntoView({ block: 'center' }) }} />
        {isToday && <div className="flex flex-wrap items-center gap-2"><Btn variant={flex ? 'primary' : 'ghost'} aria-pressed={flex} className="min-h-11" onClick={() => setFlex(!flex)}>HOY NO PUEDO SEGUIR MI HORARIO</Btn>{flex && <p className="text-xs text-slate-400">Reprograma u omite lo que necesites; los cambios valen solo para hoy.</p>}</div>}
        {isToday && <Card title="Pendiente hoy">{getPendingToday(sd, events).slice(0, 3).map((p) => <p key={p.id} className="text-white">{p.icon} {p.text}</p>)}{!getPendingToday(sd, events).length && <p className="text-sm text-emerald-300">No te queda nada pendiente por ahora.</p>}</Card>}
        <h2 className="text-lg font-semibold text-white">{isToday ? 'Hoy' : 'Agenda del día'}</h2>
        {timeline}
        {isToday && <><DailySummary s={generateDailySummary(sd, sd.today)} demo={sd.demo} /><TomorrowSummary s={generateTomorrowSummary(sd)} /></>}
      </>)}
      {tab === 'sem' && (<><WeeklySchedule sd={sd} selected={date} onSelect={setDate} /><h2 className="text-lg font-semibold capitalize text-white">{fmtLong(date)}</h2>{timeline}</>)}
      {tab === 'cal' && (<><ScheduleCalendar sd={sd} selected={date} onSelect={setDate} /><h2 className="text-lg font-semibold capitalize text-white">{fmtLong(date)}</h2>{timeline}</>)}
      {tab === 'rec' && <ReminderList reminders={sd.reminders} settings={sd.settings} S={S} />}
      {tab === 'aj' && (<><ScheduleSettings settings={d.scheduleSettings} profile={d.profile} targets={t} S={S} /><NotificationSettings notif={d.notificationSettings} S={S} now={now} /></>)}
    </div>
  )
}
