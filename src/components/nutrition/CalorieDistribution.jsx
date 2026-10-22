import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, Empty } from '../ui'
import { MEAL_TYPES } from '../../data/foods'
import { calculateDailyTotals } from '../../utils/nutritionCalculations'

const COLORS = ['#3b82f6', '#60a5fa', '#1d4ed8', '#93c5fd', '#64748b']
export default function CalorieDistribution({ entries }) {
  const data = MEAL_TYPES.map((m) => ({ name: m.label, value: calculateDailyTotals(entries.filter((e) => e.mealType === m.id)).calories })).filter((x) => x.value > 0)
  return (
    <Card title="Distribución de calorías">
      {data.length === 0 ? <Empty text="Registra alimentos para ver la distribución." /> : (
        <div className="flex flex-wrap items-center gap-4">
          <div className="h-40 w-40" role="img" aria-label="Gráfico circular de calorías por comida">
            <ResponsiveContainer><PieChart><Pie data={data} dataKey="value" innerRadius={35} outerRadius={70} stroke="none">{data.map((x, i) => <Cell key={x.name} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} formatter={(v) => [`${v} kcal`]} /></PieChart></ResponsiveContainer>
          </div>
          <ul className="space-y-1 text-sm">{data.map((x, i) => <li key={x.name}><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />{x.name}: {x.value} kcal</li>)}</ul>
        </div>
      )}
    </Card>
  )
}
