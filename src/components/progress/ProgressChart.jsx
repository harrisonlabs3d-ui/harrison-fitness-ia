import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts'
import { trendValues } from '../../utils/progressCalculations'
import { fmtShort } from '../../utils/dateUtils'

// Gráfico de una métrica. Solo dibuja puntos registrados (no interpola) y la tendencia solo con 3+ puntos.
export default function ProgressChart({ series, label, color = '#3b82f6' }) {
  const { points, unit, kind, target, trend } = series
  const tv = trend ? trendValues(points) : null
  const rows = points.map((p, i) => ({ label: fmtShort(p.date), v: p.v, trend: tv ? tv[i] : undefined }))
  const vals = points.map((p) => p.v)
  const domain = kind === 'bar' ? [0, Math.ceil(Math.max(...vals, target || 0) * 1.1)] : [Math.floor(Math.min(...vals) - 1), Math.ceil(Math.max(...vals) + 1)]
  return (
    <div>
      <div className="h-52 w-full" role="img" aria-label={label}>
        <ResponsiveContainer>
          <ComposedChart data={rows} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid stroke="#1e293b" />
            <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} domain={domain} allowDecimals={false} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} formatter={(v, n) => [`${v} ${unit}`, n === 'trend' ? 'Tendencia' : 'Registro']} />
            {kind === 'bar' ? <Bar dataKey="v" fill={color} radius={[4, 4, 0, 0]} /> : <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2.5} dot={{ r: 3 }} />}
            {tv && <Line type="linear" dataKey="trend" stroke="#94a3b8" strokeDasharray="5 5" dot={false} strokeWidth={1.5} />}
            {target != null && <ReferenceLine y={target} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: `Objetivo ${target}`, fill: '#f59e0b', fontSize: 11, position: 'insideTopRight' }} />}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {trend && !tv && <p className="mt-1 text-xs text-slate-500">La línea de tendencia aparece con 3 o más registros.</p>}
    </div>
  )
}
