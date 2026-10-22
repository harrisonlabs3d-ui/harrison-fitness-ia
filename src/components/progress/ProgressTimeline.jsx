import { Card, Badge, Empty } from '../ui'
import { fmtFull } from '../../utils/formatters'

export default function ProgressTimeline({ events, demo }) {
  return (
    <Card title="Mi evolución">
      {demo && <Badge kind="demo" />}
      {events.length === 0 && <Empty text="Aún no hay eventos en este rango." />}
      <ol className="mt-2 space-y-3 border-l border-slate-700 pl-4">
        {events.slice(-40).map((e) => (
          <li key={e.date} className="relative">
            <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-blue-500" />
            <p className="text-sm font-semibold text-white">{fmtFull(e.date)} {e.tags.map((t) => <span key={t} className="ml-1 rounded bg-blue-500/20 px-1.5 text-xs font-normal text-blue-300">{t}</span>)}</p>
            <p className="text-sm text-slate-300">
              {[e.weight != null && `${e.weight} kg`, e.waist != null && `${e.waist} cm`, e.photos > 0 && `📸 ${e.photos} ${e.photos === 1 ? 'foto' : 'fotos'}`, e.sessions.length > 0 && `🏋️ ${e.sessions.join(', ')}`].filter(Boolean).join(' · ') || 'Sin otros registros'}
            </p>
          </li>
        ))}
      </ol>
    </Card>
  )
}
