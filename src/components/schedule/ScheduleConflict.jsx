import { Btn } from '../ui'

export default function ScheduleConflict({ conflicts, onFix }) {
  if (!conflicts.length) return null
  return (
    <div className="space-y-2" role="alert">
      {conflicts.map((c, i) => (
        <div key={i} className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-3 text-sm">
          <p className="text-amber-200">⚠️ {c.message}</p>
          <p className="text-slate-300">{c.a.icon} {c.a.title} ({c.a.time}) · {c.b.icon} {c.b.title} ({c.b.time})</p>
          <div className="mt-2 flex flex-wrap gap-2">{[c.a, c.b].map((e) => <Btn key={e.id} variant="ghost" className="min-h-10 px-3 py-1" onClick={() => onFix(e)}>Reprogramar {e.title}</Btn>)}</div>
          <p className="mt-1 text-xs text-slate-500">No se cambia ningún horario automáticamente.</p>
        </div>
      ))}
    </div>
  )
}
