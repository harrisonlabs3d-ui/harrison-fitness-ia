import { Card } from '../ui'

// Solo muestra 🔥 si la racha realmente existe. Definición visible y transparente.
export default function HabitStreak({ current, best, min, demo }) {
  return (
    <Card title="Racha">
      {current > 0 ? <p className="text-2xl font-bold text-white">🔥 {current} {current === 1 ? 'día' : 'días'}</p> : <p className="text-sm text-slate-300">Aún no tienes una racha activa.</p>}
      <p className="text-sm text-slate-300">Racha actual: <b className="text-white">{current} {current === 1 ? 'día' : 'días'}</b> · Mejor racha: <b className="text-white">{best} {best === 1 ? 'día' : 'días'}</b>{demo && ' (DEMO)'}</p>
      <p className="mt-1 text-xs text-slate-500">Racha = días consecutivos con al menos {min}% de tus hábitos aplicables completados. Un día sin registro no cuenta.</p>
    </Card>
  )
}
