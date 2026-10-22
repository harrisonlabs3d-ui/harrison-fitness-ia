import { Card, Badge, Stat, Empty } from '../ui'
import ProgressChart from './ProgressChart'
import { fmtDelta } from '../../utils/progressCalculations'

function Metric({ title, unit, ch, series, demo, color, firstMsg }) {
  return (
    <Card title={title}>
      {demo && <Badge kind="demo" />}
      {ch && <div className="mb-2 grid grid-cols-3 gap-2"><Stat label="Inicial" value={`${ch.initial} ${unit}`} /><Stat label="Actual" value={`${ch.current} ${unit}`} /><Stat label="Cambio" value={ch.change == null ? '—' : fmtDelta(ch.change, unit)} /></div>}
      {ch && ch.count < 2 && <p className="mb-2 text-xs text-slate-400">Registra al menos 2 mediciones para comparar evolución.</p>}
      {series.points.length ? <ProgressChart series={series} label={title} color={color} /> : <Empty text={ch ? 'Sin registros en este rango.' : firstMsg} />}
    </Card>
  )
}
export const WeightProgress = (p) => <Metric title="Evolución del peso" unit="kg" firstMsg="Registra tu primer peso." {...p} />
export const WaistProgress = (p) => <Metric title="Evolución de cintura" unit="cm" color="#60a5fa" firstMsg="Registra tu primera medida." {...p} />
