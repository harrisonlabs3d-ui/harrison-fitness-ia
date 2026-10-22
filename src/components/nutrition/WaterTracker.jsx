import { Card, Btn, Bar } from '../ui'

export default function WaterTracker({ ml, goal, onAdd }) {
  const L = (v) => (v / 1000).toFixed(2).replace(/\.?0+$/, '')
  return (
    <Card title="💧 Agua">
      <Bar label="Agua" value={ml} max={goal} unit=" L" fmt={L} />
      <div className="mt-3 grid grid-cols-4 gap-2">
        {[250, 500, 750, 1000].map((n) => <Btn key={n} className="min-h-11 px-1" onClick={() => onAdd(n)}>+{n === 1000 ? '1 L' : n + ' ml'}</Btn>)}
      </div>
      <button className="mt-2 py-2 text-sm text-slate-400" onClick={() => onAdd(-250)}>Restar 250 ml</button>
    </Card>
  )
}
