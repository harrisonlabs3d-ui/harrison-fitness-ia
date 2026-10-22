import { useState } from 'react'
import { Card, Btn, Badge } from '../ui'
import { fmtFull } from '../../utils/formatters'

const TONE = { attention: 'border-amber-500/50 bg-amber-500/5', info: 'border-blue-500/40 bg-blue-500/5', insufficient: 'border-slate-700 bg-slate-900', ok: 'border-emerald-500/40 bg-emerald-500/5' }
const ICON = { attention: '⚠️', info: 'ℹ️', insufficient: '🔍', ok: '✅' }
const KIND = { real: 'Dato real', estimate: 'Estimación' }

function Item({ o, onDismiss }) {
  const [open, setOpen] = useState(false)
  return (
    <li data-insight={o.id} data-type={o.type} className={`rounded-xl border p-3 ${TONE[o.type]}`}>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {o.source === 'demo' ? <Badge kind="demo" /> : <span className="rounded bg-slate-800 px-2 py-0.5 font-semibold text-slate-300">{KIND[o.kind]}</span>}
        {o.period && <span className="text-slate-400">Periodo: {fmtFull(o.period.from)} – {fmtFull(o.period.to)} ({o.period.days} días)</span>}
      </div>
      <p className="mt-1 font-semibold text-white">{ICON[o.type]} {o.title}</p>
      <p className="text-sm text-slate-200">{o.message}</p>
      {o.missing && <p className="mt-1 text-sm text-slate-400">Qué falta: {o.missing}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        <Btn variant="ghost" className="min-h-10 px-3 py-1 text-sm" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'Ocultar fundamento' : 'Ver fundamento'}</Btn>
        {o.source !== 'demo' && <Btn variant="ghost" className="min-h-10 px-3 py-1 text-sm" onClick={() => onDismiss(o.id)}>Descartar</Btn>}
      </div>
      {open && (
        <div className="mt-2 space-y-1 rounded-lg bg-slate-950 p-3 text-sm text-slate-300">
          <p className="font-semibold text-white">Datos que la sustentan</p>
          <ul className="list-disc pl-5">{o.evidence.map((e, i) => <li key={i}>{e}</li>)}</ul>
          <p><span className="text-slate-500">Regla aplicada:</span> {o.rule}</p>
          {o.note && <p className="text-xs text-slate-500">{o.note}</p>}
        </div>
      )}
    </li>
  )
}

export default function InsightsPanel({ W, today }) {
  const { items, updatedAt, ctx } = W.insights, dismissed = ctx.settings.dismissed
  const visible = items.filter((o) => o.source === 'demo' || !dismissed[o.id]), hidden = items.length - visible.length
  const p = (n) => String(n).padStart(2, '0')
  return (
    <div className="space-y-4">
      <Card title="Análisis inteligente">
        <div className="flex flex-wrap items-center gap-2">{ctx.demo ? <Badge kind="demo" /> : <Badge kind="real" />}<span className="text-xs text-slate-400">Actualizado: {fmtFull(today)} {p(updatedAt.getHours())}:{p(updatedAt.getMinutes())}</span></div>
        <p className="mt-2 text-sm text-slate-300">{ctx.demo ? 'Estás viendo un análisis de DATOS DE DEMOSTRACIÓN. Con tus datos reales, el análisis solo usará tus registros reales.' : 'El análisis usa únicamente tus registros reales (nunca datos demo).'} Periodo base: últimos {ctx.days} días cerrados.</p>
        <p className="mt-1 text-xs text-slate-500">Son reglas locales y transparentes: no hay una IA externa conectada y tus datos no salen de este dispositivo. Son observaciones orientativas: no diagnostican deficiencias ni enfermedades, no recomiendan comprar suplementos y no cambian ninguna pauta médica.</p>
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-300"><label htmlFor="adays">Periodo de análisis</label>
          <select id="adays" value={ctx.days} onChange={(e) => W.patchWellness({ analysisDays: Number(e.target.value) })} className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-white">{[7, 14, 21, 28].map((n) => <option key={n} value={n}>{n} días</option>)}</select></div>
      </Card>
      <ul className="space-y-3" aria-label="Observaciones">{visible.map((o) => <Item key={o.id} o={o} onDismiss={(id) => W.dismiss(id, today)} />)}</ul>
      {!visible.length && <Card><p className="text-sm text-slate-300">No hay observaciones por mostrar.{hidden ? ' Descartaste todas las de esta semana.' : ''}</p></Card>}
      {hidden > 0 && <div className="flex items-center gap-3 text-sm text-slate-400"><span>{hidden} observación(es) descartada(s) (reaparecen la próxima semana si siguen aplicando).</span><Btn variant="ghost" className="min-h-10 px-3 py-1 text-sm" onClick={W.restoreDismissed}>Restaurar</Btn></div>}
    </div>
  )
}
