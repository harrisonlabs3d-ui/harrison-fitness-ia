import { Card, Stat, Badge, Empty } from '../ui'
import ProgressChart from '../progress/ProgressChart'
import { fmtDuration, fmtL, weeklyTrainingSeries } from '../../utils/habitCalculations'

export default function HabitStats({ s, hd }) {
  if (!s.daysWithData) return <Card title="Estadísticas de hábitos"><Empty text="Registra tus primeros hábitos para ver estadísticas." /></Card>
  const withData = s.days.filter((x) => x.hasData)
  const hab = (x, id) => x.habits.find((h) => h.id === id)
  const waterPts = s.days.filter((x) => hab(x, 'water').value > 0).map((x) => ({ date: x.date, v: Math.round(hab(x, 'water').value) }))
  const sleepPts = s.days.filter((x) => hab(x, 'sleep').record).map((x) => ({ date: x.date, v: Math.round(hab(x, 'sleep').value / 6) / 10 }))
  return (
    <div className="space-y-4">
      <Card title="Estadísticas de hábitos">
        {hd.demo && <Badge kind="demo" />}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Consistencia promedio" value={`${s.avgConsistency}%`} sub={`${s.daysWithData} días con datos`} /><Stat label="Racha actual" value={`${s.current} días`} /><Stat label="Mejor racha" value={`${s.best} días`} />
          <Stat label="Agua promedio" value={s.avgWater == null ? '—' : `${fmtL(s.avgWater)} L`} /><Stat label="Proteína promedio" value={s.avgProtein == null ? '—' : `${Math.round(s.avgProtein)} g`} /><Stat label="Entrenamientos completados" value={s.trainings} />
          <Stat label="Días con nutrición registrada" value={s.nutritionDays} /><Stat label="Sueño promedio" value={s.avgSleep == null ? '—' : fmtDuration(Math.round(s.avgSleep))} /><Stat label="Pasos promedio" value={s.avgSteps == null ? '—' : Math.round(s.avgSteps).toLocaleString('es-PE')} />
        </div>
        <p className="mt-2 text-xs text-slate-500">Los promedios usan solo los días con registro; los días sin datos no cuentan como cero.</p>
      </Card>
      <Card title="Consistencia por día"><ProgressChart label="Consistencia por día" series={{ points: withData.map((x) => ({ date: x.date, v: x.consistency })), unit: '%', kind: 'bar', target: hd.streakMin }} /></Card>
      <Card title="Agua por día">{waterPts.length ? <ProgressChart label="Agua por día" series={{ points: waterPts, unit: 'ml', kind: 'bar', target: hd.goals.waterMl }} color="#60a5fa" /> : <Empty text="Sin registros de agua." />}</Card>
      <Card title="Sueño por día">{sleepPts.length ? <ProgressChart label="Sueño por día" series={{ points: sleepPts, unit: 'h', kind: 'bar', target: hd.goals.sleepMin / 60 }} color="#818cf8" /> : <Empty text="Sin registros de sueño." />}</Card>
      <Card title="Entrenamientos por semana"><ProgressChart label="Entrenamientos por semana" series={{ points: weeklyTrainingSeries(s.days), unit: 'sesiones', kind: 'bar' }} /></Card>
    </div>
  )
}
