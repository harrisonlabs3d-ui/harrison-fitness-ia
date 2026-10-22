import { Card, Bar, Badge, Empty } from '../ui'
import Chart from '../Chart'
import SleepTracker from '../habits/SleepTracker'
import { useHabits } from '../../hooks/useHabits'
import { habitText, fmtDuration } from '../../utils/habitCalculations'
import { habitPanel, sleepWeek, sleepWeekSummary, fmtDiff } from '../../utils/wellnessCalculations'
import { fmtFull } from '../../utils/formatters'

const dow = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('es-PE', { weekday: 'short' })

export default function RestPanel({ d, setD, t, sd, W, today }) {
  const H = useHabits(d, setD, t), hd = sd.hd
  const P = habitPanel(sd, hd, W.src, today)
  const rows = sleepWeek(hd, d.profile, d.wellnessSettings, today), sum = sleepWeekSummary(rows, hd.goals.sleepMin)
  const wkSeries = P.week.filter((x) => x.v != null)
  const noData = !P.weekWithData && !P.reminders.done && !hd.sleep.length
  return (
    <div className="space-y-4">
      <Card title="Indicadores de hoy">
        {hd.demo && <p className="mb-2 text-xs text-amber-400"><Badge kind="demo" /> Datos de demostración hasta que registres tu primer dato real.</p>}
        {noData && <Empty text="Todavía no hay registros. Aquí verás tu agua, comidas, recordatorios, entrenamientos, suplementos y sueño en cuanto los registres." />}
        <div className="space-y-3" data-panel>
          <Bar label="💧 Agua frente a tu objetivo personal" value={P.water.value} max={P.water.goal} unit=" ml" />
          <p className="text-sm text-slate-300">🍽️ Comidas: <b className="text-white">{P.meals.logged}</b> alimentos registrados · {P.meals.slots} de {P.meals.total} comidas del horario completadas</p>
          <p className="text-sm text-slate-300">🔔 Recordatorios completados: <b className="text-white">{P.reminders.done} / {P.reminders.total}</b>{P.reminders.skipped ? ` (${P.reminders.skipped} omitidos)` : ''}</p>
          <p className="text-sm text-slate-300">🏋️ Entrenamiento: <b className="text-white">{habitText(P.training)}</b></p>
          <p className="text-sm text-slate-300">💊 Suplementos hoy según tu plan: <b className="text-white">{P.supplements.total ? `${P.supplements.done} / ${P.supplements.total}` : 'sin tomas planificadas'}</b>{P.supplements.week.pct != null && <span className="text-slate-400"> · 7 días: {P.supplements.week.taken}/{P.supplements.week.planned} ({P.supplements.week.pct} %)</span>}</p>
          <p className="text-sm text-slate-300">😴 Sueño (noche anterior): <b className="text-white">{habitText(P.sleep)}</b></p>
        </div>
      </Card>

      <Card title="Tendencia semanal de cumplimiento">
        {P.weekWithData >= 3 ? <><Chart data={wkSeries.map((x) => ({ date: x.date, v: x.v }))} unit="%" /><p className="text-xs text-slate-500">Consistencia diaria de tus hábitos (completados ÷ aplicables). Solo días con registros.</p></>
          : <p className="text-sm text-slate-400">Necesitas registros en al menos 3 días para ver la tendencia (hay {P.weekWithData}).</p>}
      </Card>

      <Card title="Horario de sueño">
        <p className="text-sm text-slate-300">Objetivo personal (no es una prescripción): acostarte <b className="text-white">{d.profile.dormir}</b>{d.wellnessSettings.weekend.sleep && ` (fin de semana ${d.wellnessSettings.weekend.sleep})`}, levantarte <b className="text-white">{d.profile.despertar}</b>{d.wellnessSettings.weekend.wake && ` (fin de semana ${d.wellnessSettings.weekend.wake})`}. Cámbialo en Recordatorios → Rutina diaria.</p>
        <label className="mt-2 flex items-center gap-2 text-sm text-slate-300">Meta de horas de sueño
          <input type="number" min="4" max="12" step="0.5" value={d.habitSettings.sleepGoalH} onChange={(e) => { const v = Number(e.target.value); if (v >= 4 && v <= 12) H.patchSettings({ sleepGoalH: v }) }} className="w-20 rounded-lg border border-slate-700 bg-slate-950 p-2 text-white" /></label>
      </Card>

      <SleepTracker date={today} record={hd.sleepBy[today]?.type === 'real' ? hd.sleepBy[today] : undefined} profile={d.profile} onSave={H.saveSleep} onRemove={H.removeSleep} />

      <Card title="Cumplimiento semanal de sueño">
        <p className="text-sm text-slate-300" data-sleep-summary>{sum.recorded ? <>Registraste <b className="text-white">{sum.recorded}</b> de 7 noches · promedio <b className="text-white">{sum.avgText}</b> (meta {fmtDuration(sum.goalMin)}) · dentro de ±{d.wellnessSettings.sleepToleranceMin} min de tu horario: <b className="text-white">{sum.within}</b></> : 'Aún no hay noches registradas en los últimos 7 días.'}</p>
        <ul className="mt-2 divide-y divide-slate-800 text-sm">
          {rows.map((r) => (
            <li key={r.date} className="flex flex-wrap items-center gap-x-3 py-2" data-sleep-row={r.date}>
              <span className="w-20 capitalize text-slate-400">{dow(r.date)} {fmtFull(r.date).slice(0, 5)}</span>
              {r.rec ? <span className="text-slate-200">{r.rec.sleepTime} → {r.rec.wakeTime} · {fmtDuration(r.rec.duration)} <span className="text-slate-500">(dormir {fmtDiff(r.bedDiff)}, despertar {fmtDiff(r.wakeDiff)})</span> {r.within ? '✓' : ''}</span> : <span className="text-slate-500">sin registro</span>}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-slate-500">La duración se calcula con tus horas reales registradas (puede cruzar la medianoche). Las diferencias se comparan con tu horario objetivo de ese día.</p>
      </Card>
    </div>
  )
}
