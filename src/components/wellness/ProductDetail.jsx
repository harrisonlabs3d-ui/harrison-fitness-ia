import { useState } from 'react'
import { Btn, Field, Badge } from '../ui'
import { CAT_ICON, CAT_LABEL, isPrescribed } from '../../data/supplements'
import { money, scheduleText } from '../../utils/supplementCalculations'
import { fmtFull } from '../../utils/formatters'

export default function ProductDetail({ row, logs, W, today, onClose, onEdit }) {
  const { p, inv, mi } = row, real = !p.demo
  const mine = logs.filter((l) => l.productId === p.id).sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1))
  const [pu, setPu] = useState({ date: today, cost: '', packages: '1' })
  const [err, setErr] = useState('')
  const addPurchase = () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(pu.date)) return setErr('Elige la fecha de la compra.')
    if (pu.cost !== '' && !(Number(pu.cost) >= 0)) return setErr('El costo no puede ser negativo.')
    if (!(Number(pu.packages) >= 1) || !Number.isInteger(Number(pu.packages))) return setErr('Indica cuántos envases compraste (entero, 1 o más).')
    setErr(''); W.addPurchase(p.id, { date: pu.date, cost: pu.cost === '' ? null : Number(pu.cost) * Number(pu.packages), packages: Number(pu.packages) }); setPu({ date: today, cost: '', packages: '1' })
  }
  return (
    <div role="dialog" aria-modal="true" aria-label={`Detalle de ${p.name}`} className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-2 md:items-center">
      <div className="max-h-[92vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-4">
        <div className="flex items-start justify-between gap-2"><h2 className="text-lg font-semibold text-white">{CAT_ICON[p.category]} {p.name} {p.demo && <Badge kind="demo" />}</h2><Btn variant="ghost" aria-label="Cerrar" className="min-h-10 px-3 py-1" onClick={onClose}>✕</Btn></div>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
          {[['Categoría', CAT_LABEL[p.category]], ['Marca', p.brand], ['Presentación', p.presentation], ['Envase', p.packageSize], ['Porciones por envase', p.servingsPerPackage], ['Por toma', `${p.servingsPerIntake} ${p.servingUnit}`], ['Inicio', p.startDate && fmtFull(p.startDate)], ['Horario', scheduleText(p)], ['Ingredientes', p.ingredients], ['Fuente de información', p.infoSource], ...(isPrescribed(p.category) ? [['Profesional responsable', p.prescription?.professional], ['Pauta indicada', p.prescription?.instruction]] : []), ['Notas', p.notes]].map(([k, v]) => (
            <div key={k} className="col-span-2 sm:col-span-1"><dt className="text-xs text-slate-500">{k}</dt><dd className="text-slate-200">{v || <span className="text-slate-500">—</span>}</dd></div>
          ))}
        </dl>
        {mi.length > 0 && <p className="text-sm text-slate-400">ℹ️ Falta: {mi.join(', ')}.</p>}
        <div className="rounded-lg bg-slate-950 p-3 text-sm text-slate-300">
          <p className="font-semibold text-white">Inventario (estimación)</p>
          {inv.total == null ? <p>Indica las porciones por envase y registra una compra para estimar el inventario.</p> : <>
            <p>Compradas: {inv.total} · Registradas como consumidas: {Math.round(inv.consumed * 10) / 10} · Restantes: <b className="text-white">{inv.remaining}</b></p>
            <p>{inv.rate ? `Ritmo ${inv.rateKind === 'registrado' ? 'de tus registros (14 días)' : 'según tu horario'}: ${inv.rate} por día${inv.daysLeft != null ? ` → alcanza ~${inv.daysLeft} días (hasta ~${fmtFull(inv.estimatedEnd)})` : ''}.` : 'Sin ritmo de consumo para proyectar la duración.'}</p>
            <p className="text-xs text-slate-500">No sabe si consumiste sin registrar ni si hay envases sin anotar: es una referencia, no una medición.</p></>}
        </div>
        <div>
          <p className="font-semibold text-white">Compras y gasto</p>
          {!(p.purchases || []).length && <p className="text-sm text-slate-400">Sin compras registradas.</p>}
          {(p.purchases || []).map((u) => <p key={u.id} className="flex items-center justify-between border-t border-slate-800 py-1 text-sm text-slate-300 first:border-0"><span>{fmtFull(u.date)} · {u.packages} envase(s) · {u.cost == null ? 'sin costo' : money(u.cost)}</span>{real && <button className="px-2 py-1 text-red-400" aria-label={`Quitar compra del ${u.date}`} onClick={() => W.removePurchase(p.id, u.id)}>Quitar</button>}</p>)}
          {real && <div className="mt-2 grid grid-cols-3 gap-2">
            <Field label="Fecha" type="date" value={pu.date} onChange={(e) => setPu({ ...pu, date: e.target.value })} />
            <Field label="Costo por envase" type="number" min="0" step="0.01" value={pu.cost} onChange={(e) => setPu({ ...pu, cost: e.target.value })} />
            <Field label="Envases" type="number" min="1" step="1" value={pu.packages} onChange={(e) => setPu({ ...pu, packages: e.target.value })} />
            <div className="col-span-3 flex items-center gap-3"><Btn className="min-h-10 px-3 py-1" onClick={addPurchase}>Registrar compra</Btn>{err && <p role="alert" className="text-sm text-red-400">{err}</p>}</div>
          </div>}
        </div>
        <div>
          <p className="font-semibold text-white">Historial de consumo ({mine.length})</p>
          {!mine.length && <p className="text-sm text-slate-400">Aún no hay tomas registradas.</p>}
          {mine.slice(0, 20).map((l) => <p key={l.id} className="flex items-center justify-between border-t border-slate-800 py-1 text-sm text-slate-300 first:border-0"><span>{fmtFull(l.date)} · {l.time} · {l.servings} {p.servingUnit}(s)</span>{real && <button className="px-2 py-1 text-red-400" aria-label={`Quitar toma del ${l.date} ${l.time}`} onClick={() => W.removeLog(l.id)}>Quitar</button>}</p>)}
          {mine.length > 20 && <p className="text-xs text-slate-500">Mostrando las 20 más recientes.</p>}
        </div>
        {real && <Btn variant="ghost" className="min-h-11" onClick={onEdit}>Editar producto</Btn>}
      </div>
    </div>
  )
}
