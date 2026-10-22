import { useState } from 'react'
import { Card, Bar, Btn, Empty, Badge } from '../components/ui'
import Chart from '../components/Chart'
import { imc, goalPct } from '../utils/calculations'
import { byDate, todayISO } from '../utils/formatters'
import { useTraining } from '../hooks/useTraining'
import { useProgress } from '../hooks/useProgress'
import HabitCard from '../components/habits/HabitCard'
import DashboardSchedule from '../components/schedule/DashboardSchedule'
import DashboardWellness from '../components/wellness/DashboardWellness'
import { buildHabitData, getDayHabits, calculateStreaks, getNextAction } from '../utils/habitCalculations'
import { calculateWeightChange, calculateWaistChange, calculateWeeklySummary, calculateNutritionAdherence, generateProgressSummary } from '../utils/progressCalculations'
import { addDays } from '../utils/dateUtils'
import { weekStart, weekSummary, routineSets, fmtKg } from '../utils/trainingCalculations'
import { askHarrisonIA } from '../utils/ia'
import { useNutrition } from '../hooks/useNutrition'
import { useWater } from '../hooks/useWater'
import { getNextMeal, fmtTime } from '../utils/nutritionCalculations'


export const Metric = ({ label, value, sub }) => (
  <Card><p className="text-sm text-slate-400">{label}</p><p className="mt-1 text-2xl font-bold text-white">{value}</p>{sub && <p className="text-xs text-slate-500">{sub}</p>}</Card>
)

export default function Dashboard({ d, setD, t, go, setDay }) {
  const p = d.profile
  const today = todayISO()
  // Peso, cambio y cintura salen SOLO de datos reales; el demo únicamente alimenta el gráfico.
  const real = [...d.realProgress].sort(byDate)
  const demoRows = [...d.demo.progress].sort(byDate)
  const actual = real.length ? real[real.length - 1].weight : p.peso
  const inicio = real.length ? real[0].weight : p.peso
  const cintura = [...real].reverse().find((r) => r.waist)?.waist ?? (p.cintura || null)
  const cambio = actual - inicio
  const nut = useNutrition(d, setD, today)
  const wat = useWater(d, setD, today)
  const next = getNextMeal(new Date(), d.scheduleSettings.mealTimes)
  const tr = useTraining(d, setD)
  const wk = weekSummary(tr.sessions, weekStart(today))
  const { data: pd } = useProgress(d, t)
  const pw = calculateWeightChange(pd), pc = calculateWaistChange(pd), pwk = calculateWeeklySummary(pd, weekStart(today))
  const pn = calculateNutritionAdherence(pd, { from: addDays(today, -6), to: today })
  const psum = generateProgressSummary(pd)
  const hd = buildHabitData(d, t, today), hday = getDayHabits(hd, today), hst = calculateStreaks(hd), hnext = getNextAction(hday, hd, new Date())
  const addWaterToday = (n) => setD((p) => ({ ...p, water: { ...p.water, [today]: (p.water[today] || 0) + n } }))
  const arrow = (x, u) => (x == null ? '' : x < 0 ? `↓ ${Math.abs(x)} ${u}` : x > 0 ? `↑ ${x} ${u}` : 'Sin cambios')
  const [q, setQ] = useState('')
  const [ans, setAns] = useState('')
  const [busy, setBusy] = useState(false)
  const ask = async () => {
    if (!q.trim()) return setAns('Escribe qué alimentos tienes o qué necesitas hoy.')
    setBusy(true); setAns(await askHarrisonIA(q.trim())); setBusy(false)
  }
  const hour = new Date().getHours()
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-white">{hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'}, {p.nombre} 👋</h1>
        <p className="text-slate-400">Vamos a trabajar por tu objetivo de hoy.</p>
        <p className="text-sm text-slate-500">{new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        {d.demo.active && <p className="mt-1 text-xs text-amber-400">Estás viendo datos de demostración. Al registrar tu primer peso real, el gráfico pasará a usar solo tus datos.</p>}
      </header>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label="Peso" value={`${actual} kg`} sub={real.length ? 'Último registro real' : 'Peso registrado'} />
        <Metric label="IMC" value={imc(actual, p.estatura).toFixed(1)} />
        <Metric label="Cintura" value={cintura ? `${cintura} cm` : 'Sin registrar'} />
        <Metric label="Meta" value={`${p.pesoMeta} kg`} />
      </div>
      <DashboardSchedule d={d} t={t} go={go} />
      <DashboardWellness d={d} setD={setD} t={t} go={go} />
      <Card title="Hábitos de hoy">
        {hd.demo && <Badge kind="demo" />}
        <p className="text-3xl font-bold text-white" aria-live="polite">{hday.completed} / {hday.applicable.length} <span className="text-lg text-slate-300">{hday.consistency}%</span></p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {hday.habits.map((h) => <HabitCard key={h.id} compact h={h}>{h.id === 'water' ? <Btn className="min-h-10 px-3 py-1 text-sm" onClick={() => addWaterToday(250)}>+250 ml</Btn> : null}</HabitCard>)}
        </div>
        <div className="mt-3 space-y-2">
          {hst.current > 0 && <p className="text-lg font-bold text-white">🔥 {hst.current} {hst.current === 1 ? 'día' : 'días'} <span className="text-sm font-normal text-slate-400">de racha{hd.demo ? ' (demo)' : ''}</span></p>}
          <div className="rounded-lg border border-blue-500/40 bg-blue-500/10 p-3"><p className="text-xs font-semibold tracking-wide text-blue-300">SIGUIENTE</p><p className="font-bold text-white">{hnext ? `${hnext.icon} ${hnext.label}` : '🎉 Completaste tus hábitos de hoy'}</p></div>
        </div>
        <Btn variant="ghost" className="mt-3" onClick={() => go('hab')}>Ver hábitos</Btn>
      </Card>
      <Card title="Objetivos de hoy">
        <div className="space-y-3">
          {nut.isDemo && <Badge kind="demo" />}
          <Bar label="🔥 Calorías" value={nut.totals.calories} max={t.kcal} unit=" kcal" />
          <Bar label="🥩 Proteína" value={nut.totals.protein} max={t.prot} unit=" g" />
          <Bar label="🍚 Carbohidratos" value={nut.totals.carbs} max={t.carb} unit=" g" />
          <Bar label="🥑 Grasas" value={nut.totals.fat} max={t.fat} unit=" g" />
          <Bar label="💧 Agua" value={wat.ml} max={t.agua} unit=" L" fmt={(v) => (v / 1000).toFixed(1)} />
        </div>
        <Btn variant="ghost" className="mt-3" onClick={() => wat.add(250)}>+ 250 ml de agua</Btn>
        <p className="mt-2 text-xs text-slate-500">Objetivos estimados, no son una prescripción médica. Puedes ajustarlos en Perfil.</p>
      </Card>
      <Card title="Próxima comida">
        <p className="text-lg font-semibold text-white">{next.icon} {next.label}</p>
        <p className="text-sm text-slate-400">{fmtTime(next.time)}{next.tomorrow ? ' · mañana' : ''}</p>
        <Btn variant="ghost" className="mt-3" onClick={() => go('nut')}>Registrar comida</Btn>
      </Card>
      <Card title="Progreso">
        {(pd.demo.weight || pd.demo.training || pd.demo.nutrition) && <Badge kind="demo" />}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <span>Peso<br />{pw ? <><b className="text-xl text-white">{pw.current} kg</b><br /><span className="text-slate-400">{arrow(pw.change, 'kg') || '1 registro'}</span></> : <span className="text-slate-400">Registra tu primer peso.</span>}</span>
          <span>Cintura<br />{pc ? <><b className="text-xl text-white">{pc.current} cm</b><br /><span className="text-slate-400">{arrow(pc.change, 'cm') || '1 registro'}</span></> : <span className="text-slate-400">Registra tu primera medida.</span>}</span>
          <span>Entrenamiento<br /><b className="text-xl text-white">{pwk.sessions} / {pwk.target}</b><br /><span className="text-slate-400">esta semana</span></span>
          <span>Proteína<br />{pn.avgProtein != null ? <><b className="text-xl text-white">{pn.avgProtein} / {t.prot} g</b><br /><span className="text-slate-400">promedio 7 días</span></> : <span className="text-slate-400">Registra tu primera comida.</span>}</span>
        </div>
        <Btn className="mt-3" onClick={() => go('prog')}>Ver progreso completo</Btn>
      </Card>
      <Card title="Resumen de tu progreso"><p className="text-sm text-slate-300">{psum || 'Cuando registres datos reales, aquí verás un resumen de tu progreso.'}</p></Card>
      <Card title="Meta de peso">
        <div className="mb-2 grid grid-cols-4 text-sm"><span>Inicial<br /><b>{inicio} kg</b></span><span>Actual<br /><b>{actual} kg</b></span><span>Meta<br /><b>{p.pesoMeta} kg</b></span><span>Restante<br /><b>{Math.max(0, actual - p.pesoMeta).toFixed(1)} kg</b></span></div>
        <p className="mb-2 text-sm text-slate-400">Cambio: <b className="text-white">{real.length > 1 ? `${cambio > 0 ? '+' : ''}${cambio.toFixed(1)} kg` : 'Sin cambios registrados'}</b></p>
        <Bar label="Progreso" value={goalPct(inicio, actual, p.pesoMeta)} max={100} unit="%" />
      </Card>
      <Card title="Evolución del peso">
        {real.length ? <><Badge kind="real" /><Chart data={real.map((r) => ({ date: r.date, v: r.weight }))} unit="kg" /></>
          : d.demo.active && demoRows.length ? <><Badge kind="demo" /><Chart data={demoRows.map((r) => ({ date: r.date, v: r.weight }))} unit="kg" /></>
          : <Empty text="No tienes registros todavía." action="Registrar ahora" onAction={() => go('prog')} />}
      </Card>
      <Card title="Entrenamiento de hoy">
        {tr.next ? <>
          <p className="text-lg font-semibold text-white">{tr.active ? `En curso: ${tr.active.routineName}` : tr.next.name}</p>
          <p className="text-sm text-slate-400">{tr.next.exercises.length} ejercicios · {routineSets(tr.next)} series · ~{tr.next.estimatedDuration} min</p>
          <Btn className="mt-3" onClick={() => { if (!tr.active) tr.start(tr.next.id); go('wo') }}>{tr.active ? 'Continuar' : 'Comenzar'}</Btn>
        </> : <p className="text-sm text-slate-400">No tienes rutinas todavía.</p>}
      </Card>
      <Card title="Esta semana">
        {tr.isDemo && <Badge kind="demo" />}
        <div className="grid grid-cols-3 gap-2 text-sm"><span>Entrenamientos<br /><b className="text-xl text-white">{wk.count} / {tr.target}</b></span><span>Series<br /><b className="text-xl text-white">{wk.sets}</b></span><span>Volumen<br /><b className="text-xl text-white">{fmtKg(wk.volume)} kg</b></span></div>
      </Card>
      <Card title="🤖 Harrison IA">
        <label className="text-sm text-slate-400" htmlFor="ia">¿Qué necesitas hoy?</label>
        <input id="ia" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ejemplo: hoy solo tengo pollo, arroz y huevos..." className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-base text-white" />
        <Btn className="mt-3" onClick={ask} disabled={busy}>{busy ? 'Pensando…' : 'Preguntar'}</Btn>
        {ans && <p className="mt-3 text-sm text-slate-300" aria-live="polite">{ans}</p>}
      </Card>
    </div>
  )
}
