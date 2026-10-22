import { Card, Empty } from '../ui'
import { calculateWeeklyAverage, calculateDailyTotals } from '../../utils/nutritionCalculations'
import { lastDays, fmtShort } from '../../utils/dateUtils'

export default function NutritionHistory({ entries, t, onPick }) {
  const w = calculateWeeklyAverage(entries, lastDays(7), t.prot)
  const dates = [...new Set(entries.map((e) => e.date))].sort().reverse().slice(0, 30)
  return (
    <div className="space-y-4">
      <Card title="Resumen semanal (últimos 7 días)">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <span>Calorías · promedio<br /><b className="text-xl text-white">{w.avgCalories} kcal</b></span>
          <span>Proteína · promedio<br /><b className="text-xl text-white">{w.avgProtein} g</b></span>
          <span>Días registrados<br /><b className="text-xl text-white">{w.daysLogged} / {w.totalDays}</b></span>
          <span>Días con proteína en el objetivo<br /><b className="text-xl text-white">{w.daysProteinGoal}</b></span>
        </div>
        <p className="mt-2 text-xs text-slate-500">Los promedios usan solo los días con registros. Es una métrica de registro, no una calificación.</p>
      </Card>
      <Card title="Historial nutricional">
        {dates.length === 0 && <Empty text="No tienes registros todavía." />}
        {dates.map((dt) => { const s = calculateDailyTotals(entries.filter((e) => e.date === dt)); return (
          <button key={dt} onClick={() => onPick(dt)} className="flex w-full items-center justify-between border-t border-slate-800 py-3 text-left text-sm first:border-0">
            <span className="text-white">{fmtShort(dt)}</span><span className="text-slate-300">{Math.round(s.calories)} kcal · {Math.round(s.protein)} g proteína</span>
          </button>) })}
      </Card>
    </div>
  )
}
