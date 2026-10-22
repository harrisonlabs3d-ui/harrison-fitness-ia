import { Card, Badge, Stat } from '../ui'
import { fmtDelta, fmtKg } from '../../utils/progressCalculations'

const val = (v, u) => (v == null ? 'Sin registro' : `${v} ${u}`)
export function WeeklySummary({ cur, cmp, demo }) {
  const rows = [['Peso', cmp.weight, 'kg'], ['Cintura', cmp.waist, 'cm'], ['Entrenamiento', cmp.sessions, cmp.sessions === 1 || cmp.sessions === -1 ? 'sesión' : 'sesiones'], ['Proteína (promedio)', cmp.protein, 'g']].filter((r) => r[1] != null)
  return (
    <Card title="Esta semana">
      {(demo.weight || demo.training || demo.nutrition) && <Badge kind="demo" />}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Peso" value={val(cur.weight.value, 'kg')} sub={cur.weight.change != null ? `Cambio: ${fmtDelta(cur.weight.change, 'kg')}` : ''} />
        <Stat label="Cintura" value={val(cur.waist.value, 'cm')} sub={cur.waist.change != null ? `Cambio: ${fmtDelta(cur.waist.change, 'cm')}` : ''} />
        <Stat label="Entrenamientos" value={`${cur.sessions} / ${cur.target}`} />
        <Stat label="Proteína" value={val(cur.avgProtein, 'g promedio')} />
        <Stat label="Calorías" value={val(cur.avgCalories, 'kcal promedio')} />
        <Stat label="Fotos" value={cur.photos} />
      </div>
      <p className="mt-4 text-sm font-semibold text-white">Esta semana vs semana anterior</p>
      {rows.length ? rows.map(([l, v, u]) => <p key={l} className="text-sm text-slate-300">{l}: <b className="text-white">{fmtDelta(v, u)}</b></p>) : <p className="text-sm text-slate-400">Aún no hay datos en ambas semanas para comparar.</p>}
    </Card>
  )
}
export function MonthlySummary({ m }) {
  const pair = (x, u) => (x ? (<><Stat label="Inicial del mes" value={`${x.initial} ${u}`} /><Stat label="Actual" value={`${x.current} ${u}`} /><Stat label="Cambio" value={x.change == null ? '—' : fmtDelta(x.change, u)} /></>) : <p className="col-span-3 text-sm text-slate-400">Sin registros este mes.</p>)
  return (
    <Card title="Este mes">
      <p className="-mt-2 mb-2 text-sm capitalize text-slate-400">{m.label}</p>
      <p className="text-xs font-semibold tracking-wide text-slate-400">PESO</p><div className="mb-2 grid grid-cols-3 gap-2">{pair(m.weight, 'kg')}</div>
      <p className="text-xs font-semibold tracking-wide text-slate-400">CINTURA</p><div className="mb-2 grid grid-cols-3 gap-2">{pair(m.waist, 'cm')}</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><Stat label="Entrenamientos" value={m.sessions} /><Stat label="Volumen" value={`${fmtKg(m.volume)} kg`} /><Stat label="Proteína (promedio)" value={val(m.avgProtein, 'g')} /><Stat label="Calorías (promedio)" value={val(m.avgCalories, 'kcal')} /></div>
    </Card>
  )
}
