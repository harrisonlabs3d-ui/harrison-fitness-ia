import { Card, Badge, Stat, Empty } from '../ui'
import ProgressChart from './ProgressChart'
import { calculateNutritionAdherence, getMetricSeries } from '../../utils/progressCalculations'

export default function NutritionProgress({ data, b }) {
  if (!data.meals.length) return <Card title="Nutrición"><Empty text="Registra tu primera comida." /></Card>
  const n = calculateNutritionAdherence(data, b)
  const cal = getMetricSeries(data, 'calories', b), pro = getMetricSeries(data, 'protein', b)
  return (
    <Card title="Progreso de nutrición">
      {data.demo.nutrition && <Badge kind="demo" />}
      {n.daysLogged ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Promedio de calorías" value={`${n.avgCalories} kcal`} sub={`Objetivo ${data.targets.kcal}`} /><Stat label="Promedio de proteína" value={`${n.avgProtein} g`} sub={`${n.proteinDiff >= 0 ? '+' : ''}${n.proteinDiff} g vs objetivo ${data.targets.prot}`} />
            <Stat label="Días registrados" value={`${n.daysLogged} / ${n.totalDays}`} /><Stat label="Días con proteína en el objetivo" value={n.daysProteinGoal} />
          </div>
          <p className="mt-4 text-sm font-semibold text-white">Calorías por día</p><ProgressChart series={cal} label="Calorías por día" />
          <p className="mt-4 text-sm font-semibold text-white">Proteína diaria</p><ProgressChart series={pro} label="Proteína diaria" color="#60a5fa" />
          <p className="mt-2 text-xs text-slate-500">Los días sin registro no cuentan como cumplidos ni se dibujan como cero.</p>
        </>
      ) : <p className="text-sm text-slate-400">Sin registros de nutrición en este rango.</p>}
    </Card>
  )
}
