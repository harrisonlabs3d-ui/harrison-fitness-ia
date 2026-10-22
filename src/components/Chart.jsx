import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { fmtDate } from '../utils/formatters'

export default function Chart({ data, unit, color = '#3b82f6' }) {
  const rows = data.map((r) => ({ date: fmtDate(r.date), v: r.v }))
  const vals = rows.map((r) => r.v)
  return (
    <div className="h-52 w-full" role="img" aria-label={`Gráfico de evolución en ${unit}`}>
      <ResponsiveContainer>
        <LineChart data={rows} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="#1e293b" />
          <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} domain={[Math.floor(Math.min(...vals) - 1), Math.ceil(Math.max(...vals) + 1)]} />
          <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} formatter={(v) => [`${v} ${unit}`]} />
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
