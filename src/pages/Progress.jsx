import { Card, Btn, Select, Empty, Badge } from '../components/ui'
import MeasurementForm from '../components/progress/MeasurementForm'
import ProgressOverview from '../components/progress/ProgressOverview'
import ProgressChart from '../components/progress/ProgressChart'
import { WeightProgress, WaistProgress } from '../components/progress/MetricProgress'
import GoalProgress from '../components/progress/GoalProgress'
import { WeeklySummary, MonthlySummary } from '../components/progress/PeriodSummaries'
import TrainingProgress from '../components/progress/TrainingProgress'
import NutritionProgress from '../components/progress/NutritionProgress'
import ProgressTimeline from '../components/progress/ProgressTimeline'
import EvolutionPhotos from '../components/progress/EvolutionPhotos'
import PhotoGallery from '../components/progress/PhotoGallery'
import { useProgress } from '../hooks/useProgress'
import { addDays } from '../utils/dateUtils'
import { weekStart } from '../utils/trainingCalculations'
import {
  calculateWeightChange, calculateWaistChange, calculateGoalProgress, trainingStats, calculateNutritionAdherence, calculateWeeklySummary, compareWeeks,
  calculateMonthlySummary, getProgressTimeline, getMetricSeries, dataConfidence, generateProgressInsight,
} from '../utils/progressCalculations'

const RANGES = [['7', '7 días'], ['30', '30 días'], ['90', '90 días'], ['all', 'Todo']]
const FILTERS = [['all', 'Todos'], ['peso', 'Peso'], ['medidas', 'Medidas'], ['entreno', 'Entrenamiento'], ['nutricion', 'Nutrición'], ['fotos', 'Fotos']]
const METRICS = [['weight', 'Peso'], ['waist', 'Cintura'], ['sessions', 'Entrenamiento (sesiones por semana)'], ['volume', 'Volumen semanal'], ['protein', 'Proteína'], ['calories', 'Calorías']]

export default function Progress({ d, setD, t, addPhoto, removePhoto }) {
  const { range, metric, filter } = d.progressSettings
  const set = (patch) => setD((p) => ({ ...p, progressSettings: { ...p.progressSettings, ...patch } }))
  const { data, b } = useProgress(d, t, range)
  const show = (k) => filter === 'all' || filter === k
  const w = calculateWeightChange(data), c = calculateWaistChange(data)
  const goal = w ? calculateGoalProgress(w.initial, w.current, data.goal) : null
  const wk = calculateWeeklySummary(data, weekStart(data.today))
  const prevWk = calculateWeeklySummary(data, addDays(weekStart(data.today), -7))
  const main = getMetricSeries(data, metric, b)
  const anyData = data.weights.length || data.sessions.length || data.meals.length || data.photos.length

  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold text-white">Mi progreso</h1><p className="text-slate-400">Observa cómo evolucionas con el tiempo.</p></div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Rango de fechas">{RANGES.map(([id, l]) => <Btn key={id} variant={range === id ? 'primary' : 'ghost'} aria-pressed={range === id} className="min-h-10 px-3 py-1 text-sm" onClick={() => set({ range: id })}>{l}</Btn>)}</div>
        <div className="flex gap-2 overflow-x-auto" role="group" aria-label="Filtro de datos">{FILTERS.map(([id, l]) => <Btn key={id} variant={filter === id ? 'primary' : 'ghost'} aria-pressed={filter === id} className="min-h-10 whitespace-nowrap px-3 py-1 text-sm" onClick={() => set({ filter: id })}>{l}</Btn>)}</div>
        <p className="text-xs text-slate-500">El rango se aplica a gráficos, promedios y línea de tiempo. Inicial, actual y meta usan todo tu historial.</p>
      </div>

      <ProgressOverview w={w} c={c} tr={trainingStats(data, b)} nut={calculateNutritionAdherence(data, b)} demo={data.demo} conf={dataConfidence(data)} insights={generateProgressInsight(data)} />
      <MeasurementForm d={d} setD={setD} />

      {!anyData && <Card><Empty text="Aún no hay datos para analizar. Registra tu primer peso, medida, comida, entrenamiento o foto." /></Card>}

      {filter === 'all' && (
        <Card title="Gráfico principal">
          {main.demo && <Badge kind="demo" />}
          <Select label="Métrica" value={metric} onChange={(e) => set({ metric: e.target.value })}>{METRICS.map(([id, l]) => <option key={id} value={id}>{l}</option>)}</Select>
          <div className="mt-2">{main.points.length ? <ProgressChart series={main} label={`Gráfico de ${metric}`} /> : <Empty text={main.empty} />}</div>
        </Card>
      )}
      {show('peso') && <><WeightProgress ch={w} series={getMetricSeries(data, 'weight', b)} demo={data.demo.weight} /><GoalProgress goal={goal} demo={data.demo.weight} /></>}
      {show('medidas') && <WaistProgress ch={c} series={getMetricSeries(data, 'waist', b)} demo={data.demo.weight} />}
      {filter === 'all' && <><WeeklySummary cur={wk} cmp={compareWeeks(wk, prevWk)} demo={data.demo} /><MonthlySummary m={calculateMonthlySummary(data)} /></>}
      {show('entreno') && <TrainingProgress data={data} b={b} />}
      {show('nutricion') && <NutritionProgress data={data} b={b} />}
      {filter === 'all' && <ProgressTimeline events={getProgressTimeline(data, b)} demo={data.demo.weight || data.demo.training || data.demo.nutrition || data.demo.photos} />}
      {show('fotos') && <><EvolutionPhotos data={data} /><PhotoGallery photos={[...d.photos, ...(d.demo.active ? d.demo.photos : [])]} onAdd={addPhoto} onRemove={removePhoto} /></>}
    </div>
  )
}
