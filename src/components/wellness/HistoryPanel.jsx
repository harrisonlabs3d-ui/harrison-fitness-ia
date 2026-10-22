import { useState } from 'react'
import { Card, Btn, Badge } from '../ui'
import { complianceHistory } from '../../utils/wellnessCalculations'
import { fmtFull } from '../../utils/formatters'
import { CAT_ICON } from '../../data/supplements'

export default function HistoryPanel({ sd, W }) {
  const [n, setN] = useState(14)
  const h = complianceHistory(sd, n), { products, logs, isDemo } = W.src
  const recent = [...logs].sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1)).slice(0, 15)
  return (
    <div className="space-y-4">
      <Card title="Cumplimiento de tu rutina">
        {sd.demo && <p className="mb-2 text-xs text-amber-400"><Badge kind="demo" /> Historial calculado con datos de demostración.</p>}
        <div className="mb-3 flex gap-2" role="group" aria-label="Rango del historial">{[7, 14, 30].map((x) => <Btn key={x} variant={n === x ? 'primary' : 'ghost'} aria-pressed={n === x} className="min-h-10 px-3 py-1 text-sm" onClick={() => setN(x)}>{x} días</Btn>)}</div>
        {h.pct == null ? <p className="text-sm text-slate-400">Aún no hay días anteriores con actividades registradas.</p> : <p className="text-sm text-slate-300" data-compliance>Completaste <b className="text-white">{h.completed}</b> de <b className="text-white">{h.total}</b> actividades ({h.pct} %){h.skipped ? ` · ${h.skipped} omitidas` : ''}{h.postponed ? ` · ${h.postponed} pospuestas/reprogramadas` : ''}.</p>}
        <ul className="mt-3 divide-y divide-slate-800">
          {[...h.rows].reverse().map((r) => (
            <li key={r.date} className="py-2 text-sm" data-hist-row={r.date}>
              <div className="flex justify-between text-slate-200"><span>{fmtFull(r.date)}</span><span>{r.total ? (r.pct != null ? `${r.pct} %` : 'hoy') : '—'}</span></div>
              {r.total > 0 && <>
                <div className="mt-1 h-2 rounded bg-slate-800"><div className="h-2 rounded bg-emerald-500" style={{ width: `${r.total ? (r.completed / r.total) * 100 : 0}%` }} /></div>
                <p className="mt-1 text-xs text-slate-400">✓ {r.completed} · omitidas {r.skipped} · sin registrar {r.unlogged}{r.pending ? ` · pendientes ${r.pending}` : ''}{r.postponed ? ` · pospuestas ${r.postponed}` : ''}</p></>}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-slate-500">Se calcula con tu configuración actual de la agenda (no guarda una copia de la configuración de cada día) y solo cuenta días desde tu primer registro. Lo no registrado en días pasados aparece como «sin registrar».</p>
      </Card>
      <Card title="Últimas tomas registradas">
        {isDemo && <p className="mb-2 text-xs text-amber-400"><Badge kind="demo" /> Tomas de demostración.</p>}
        {!recent.length ? <p className="text-sm text-slate-400">Aún no hay tomas registradas.</p> : recent.map((l) => { const p = products.find((x) => x.id === l.productId); return <p key={l.id} className="flex justify-between border-t border-slate-800 py-1 text-sm text-slate-300 first:border-0"><span>{p ? `${CAT_ICON[p.category]} ${p.name}` : 'Producto eliminado'}</span><span className="text-slate-400">{fmtFull(l.date)} {l.time}</span></p> })}
      </Card>
    </div>
  )
}
