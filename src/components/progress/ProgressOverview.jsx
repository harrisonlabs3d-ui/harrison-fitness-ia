import { Card, Badge, Stat } from '../ui'
import { fmtDelta, fmtKg, CONFIDENCE } from '../../utils/progressCalculations'
import { fmtFull } from '../../utils/formatters'

const Demo = ({ on }) => (on ? <Badge kind="demo" /> : null)
const Hint = ({ children }) => <p className="text-sm text-slate-400">{children}</p>

export default function ProgressOverview({ w, c, tr, nut, demo, conf, insights }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card title="⚖️ Peso"><Demo on={demo.weight} />
          {w ? <div className="grid grid-cols-3 gap-2"><Stat label="Peso inicial" value={`${w.initial} kg`} sub={fmtFull(w.firstDate)} /><Stat label="Peso actual" value={`${w.current} kg`} sub={fmtFull(w.lastDate)} /><Stat label="Cambio" value={w.change == null ? '—' : fmtDelta(w.change, 'kg')} sub={w.change == null ? '1 registro' : ''} /></div> : <Hint>Registra tu primer peso.</Hint>}
        </Card>
        <Card title="📏 Cintura"><Demo on={demo.weight} />
          {c ? <div className="grid grid-cols-3 gap-2"><Stat label="Medida inicial" value={`${c.initial} cm`} /><Stat label="Medida actual" value={`${c.current} cm`} /><Stat label="Cambio" value={c.change == null ? '—' : fmtDelta(c.change, 'cm')} sub={c.change == null ? '1 registro' : ''} /></div> : <Hint>Registra tu primera medida.</Hint>}
        </Card>
        <Card title="🏋️ Entrenamiento"><Demo on={demo.training} />
          {tr.count ? <div className="grid grid-cols-2 gap-2"><Stat label="Sesiones completadas" value={tr.count} /><Stat label="Volumen total" value={`${fmtKg(tr.volume)} kg`} /></div> : <Hint>Completa tu primer entrenamiento.</Hint>}
        </Card>
        <Card title="🍽️ Nutrición"><Demo on={demo.nutrition} />
          {nut.daysLogged ? <div className="grid grid-cols-2 gap-2"><Stat label="Promedio de calorías" value={`${nut.avgCalories} kcal`} /><Stat label="Promedio de proteína" value={`${nut.avgProtein} g`} /></div> : <Hint>Registra tu primera comida.</Hint>}
        </Card>
      </div>
      <Card title="Resumen de tu progreso">
        <p className="mb-2 text-xs text-slate-400">Calidad del análisis: <b className="text-white">{CONFIDENCE[conf]}</b>. Indica cuántos datos hay, no certeza médica.</p>
        {conf === 'insufficient' && <div className="mb-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200"><b>NECESITAMOS MÁS DATOS.</b> Registra al menos 2 mediciones de peso para comparar evolución.</div>}
        {insights.length ? insights.map((t) => <p key={t} className="text-sm text-slate-200">• {t}</p>) : <p className="text-sm text-slate-400">Cuando registres datos reales, aquí verás un resumen descriptivo.</p>}
        <p className="mt-2 text-xs text-slate-500">Mensajes descriptivos generados localmente con tus registros reales.</p>
      </Card>
    </div>
  )
}
