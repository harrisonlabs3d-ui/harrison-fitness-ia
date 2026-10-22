import { fmtFull } from '../../utils/formatters'

export default function PhotoComparison({ a, b }) {
  const [first, second] = a.date <= b.date ? [a, b] : [b, a]
  return (
    <div aria-label="Comparación de fotos">
      <p className="mb-2 text-center text-sm text-slate-300">{fmtFull(first.date)} | {fmtFull(second.date)}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[first, second].map((p, i) => (
          <figure key={p.id}>
            <img src={p.image} alt={`Foto ${i ? 'B' : 'A'} · ${p.category} · ${fmtFull(p.date)}`} className="w-full rounded-lg" />
            <figcaption className="mt-1 text-center text-xs text-slate-400">Foto {i ? 'B' : 'A'} · {fmtFull(p.date)}{p.type === 'demo' ? ' · DEMO' : ''}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
