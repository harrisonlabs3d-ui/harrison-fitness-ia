import ScheduleEvent from './ScheduleEvent'

export default function ScheduleTimeline({ events, primary, openId, setOpenId, flex, onReschedule, onState, onResetTime, snoozeMin }) {
  return (
    <ol className="mx-auto max-w-xl space-y-2" aria-label="Línea de tiempo del día">
      {events.map((e) => <ScheduleEvent key={e.id} ev={e} primary={primary} open={flex ? e.status !== 'completed' : openId === e.id} onToggle={() => setOpenId(openId === e.id ? null : e.id)} onReschedule={onReschedule} onState={onState} onResetTime={onResetTime} snoozeMin={snoozeMin} />)}
    </ol>
  )
}
