import { useState } from 'react'
import { Card, Badge, Select, Empty } from '../ui'
import PhotoComparison from './PhotoComparison'
import { fmtFull } from '../../utils/formatters'

export default function EvolutionPhotos({ data }) {
  const list = [...data.photos].sort((a, b) => (a.date < b.date ? -1 : 1))
  const [ia, setIa] = useState('')
  const [ib, setIb] = useState('')
  if (!list.length) return <Card title="Evolución visual"><Empty text="Agrega tu primera foto." /></Card>
  if (list.length < 2) return <Card title="Evolución visual"><p className="text-sm text-slate-400">Agrega una segunda foto para compararlas.</p></Card>
  const a = list.find((p) => p.id === ia) || list[0], b = list.find((p) => p.id === ib) || list[list.length - 1]
  const [first, second] = a.date <= b.date ? [a, b] : [b, a]
  const opt = (p) => <option key={p.id} value={p.id}>{fmtFull(p.date)} · {p.category}{p.type === 'demo' ? ' (DEMO)' : ''}</option>
  const at = (series, date) => series.find((x) => x.date === date)?.value
  const info = (p) => { const w = at(data.weights, p.date), c = at(data.waists, p.date); return `${fmtFull(p.date)} · ${w != null ? `${w} kg` : 'sin peso registrado ese día'} · ${c != null ? `${c} cm` : 'sin cintura registrada ese día'}` }
  return (
    <Card title="Evolución visual · Comparar progreso">
      {data.demo.photos && <Badge kind="demo" />}
      <div className="grid grid-cols-2 gap-3">
        <Select label="Foto inicial" value={a.id} onChange={(e) => setIa(e.target.value)}>{list.map(opt)}</Select>
        <Select label="Foto actual" value={b.id} onChange={(e) => setIb(e.target.value)}>{list.map(opt)}</Select>
      </div>
      <div className="mt-3"><PhotoComparison a={a} b={b} /></div>
      <div className="mt-2 space-y-1 text-sm text-slate-300"><p>Fecha inicial: {info(first)}</p><p>Fecha actual: {info(second)}</p></div>
    </Card>
  )
}
