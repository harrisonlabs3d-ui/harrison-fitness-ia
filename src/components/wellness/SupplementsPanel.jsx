import { useState } from 'react'
import { Card, Btn, Badge, Empty } from '../ui'
import ConfirmDialog from '../ConfirmDialog'
import ProductForm from './ProductForm'
import ProductDetail from './ProductDetail'
import { CAT_ICON, CAT_LABEL, SUPP_CATEGORIES, SUPP_FILTERS, isPrescribed } from '../../data/supplements'
import { productInventory, isLowStock, missingInfo, expensesByMonth, monthLabel, money, logsOn, scheduleText } from '../../utils/supplementCalculations'
import { nowHHMM } from '../../utils/scheduleActions'

export default function SupplementsPanel({ W, S, today }) {
  const { products, logs, isDemo } = W.src, low = W.insights.ctx.settings.lowStockDays
  const [filter, setFilter] = useState('active')
  const [cat, setCat] = useState('all')
  const [form, setForm] = useState(null)
  const [detail, setDetail] = useState(null)
  const [del, setDel] = useState(null)
  const rows = products.map((p) => { const inv = productInventory(p, logs, today), mi = missingInfo(p), lowStock = isLowStock(inv, low); return { p, inv, mi, lowStock, alert: mi.length > 0 || lowStock } })
  const shown = rows.filter((r) => (filter === 'active' ? !r.p.archived : filter === 'archived' ? r.p.archived : filter === 'alerts' ? r.alert && !r.p.archived : true) && (cat === 'all' || r.p.category === cat))
  const active = rows.filter((r) => !r.p.archived), exp = expensesByMonth(products), thisMonth = exp.find((x) => x.month === today.slice(0, 7))
  const detailRow = detail && rows.find((r) => r.p.id === detail)

  return (
    <div className="space-y-4">
      {isDemo && <p className="text-xs text-amber-400"><Badge kind="demo" /> Estos son productos de ejemplo. Al crear tu primer producto real, el demo se oculta y nunca se mezcla con tus datos.</p>}
      <div className="grid grid-cols-3 gap-3">
        <Card><p className="text-xs text-slate-400">Activos</p><p className="text-2xl font-bold text-white" data-stat="active">{active.length}</p></Card>
        <Card><p className="text-xs text-slate-400">Con alertas</p><p className="text-2xl font-bold text-white" data-stat="alerts">{active.filter((r) => r.alert).length}</p></Card>
        <Card><p className="text-xs text-slate-400">Gasto del mes</p><p className="text-xl font-bold text-white" data-stat="month">{thisMonth ? money(thisMonth.total) : '—'}</p></Card>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Btn className="min-h-11" onClick={() => setForm('new')}>+ Nuevo producto</Btn>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtro de productos">{SUPP_FILTERS.map(([id, l]) => <Btn key={id} variant={filter === id ? 'primary' : 'ghost'} aria-pressed={filter === id} className="min-h-10 px-3 py-1 text-sm" onClick={() => setFilter(id)}>{l}</Btn>)}</div>
        <select aria-label="Categoría" value={cat} onChange={(e) => setCat(e.target.value)} className="min-h-10 rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-white"><option value="all">Todas las categorías</option>{SUPP_CATEGORIES.map(([id, l]) => <option key={id} value={id}>{l}</option>)}</select>
      </div>
      {!products.length && <Card><Empty text="Aún no tienes productos. Registra tus suplementos, vitaminas o una pauta prescrita para llevar su consumo, inventario y gastos." action="Agregar mi primer producto" onAction={() => setForm('new')} /></Card>}
      {products.length > 0 && !shown.length && <p className="text-sm text-slate-400">No hay productos en esta vista.</p>}
      {shown.map(({ p, inv, mi, lowStock }) => {
        const taken = logsOn(logs, p.id, today).length
        return (
          <Card key={p.id}>
            <div data-product={p.id}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0"><p className="font-semibold text-white">{CAT_ICON[p.category]} {p.name} {p.demo && <Badge kind="demo" />} {p.archived && <span className="rounded bg-slate-800 px-1.5 text-xs text-slate-400">archivado</span>}</p>
                  <p className="text-xs text-slate-400">{[p.brand, CAT_LABEL[p.category], p.presentation, p.packageSize].filter(Boolean).join(' · ')}</p></div>
                <p className="shrink-0 text-xs text-slate-400">Hoy: {taken}</p>
              </div>
              <p className="mt-1 text-sm text-slate-300">🕒 {scheduleText(p)}</p>
              <p className="text-sm text-slate-300" data-inventory>{inv.remaining == null ? 'Inventario: sin datos de porciones por envase.' : `Inventario estimado: ${inv.remaining} de ${inv.total} ${p.servingUnit}(s)${inv.daysLeft != null ? ` · ~${inv.daysLeft} días` : ''}`} <span className="text-xs text-slate-500">(estimación)</span></p>
              {isPrescribed(p.category) && <p className="text-xs text-amber-300">Registro de una pauta indicada por un profesional{p.prescription?.professional ? ` (${p.prescription.professional})` : ''}. No modifica la indicación.</p>}
              {lowStock && <p className="mt-1 text-sm text-amber-300" data-alert="stock">⚠️ Próximo a agotarse según el consumo registrado.</p>}
              {mi.length > 0 && <p className="mt-1 text-sm text-slate-400" data-alert="info">ℹ️ Información incompleta: {mi.join(', ')}.</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                {!p.demo && !p.archived && <Btn className="min-h-11" onClick={() => S.logIntake({ productId: p.id, date: today, time: nowHHMM(), servings: Number(p.servingsPerIntake) || 1 })}>Registrar toma</Btn>}
                <Btn variant="ghost" className="min-h-11" onClick={() => setDetail(p.id)}>Detalle</Btn>
                {!p.demo && <Btn variant="ghost" className="min-h-11" onClick={() => setForm(p)}>Editar</Btn>}
                {!p.demo && <Btn variant="ghost" className="min-h-11" onClick={() => W.archiveProduct(p.id, !p.archived)}>{p.archived ? 'Reactivar' : 'Archivar'}</Btn>}
                {!p.demo && <Btn variant="ghost" className="min-h-11 text-red-400" onClick={() => setDel(p)}>Eliminar</Btn>}
              </div>
            </div>
          </Card>
        )
      })}
      <Card title="Gastos por mes">
        {!exp.length ? <p className="text-sm text-slate-400">Sin compras con costo registrado todavía.</p> : exp.map((m) => (
          <div key={m.month} className="border-t border-slate-800 py-2 first:border-0" data-month={m.month}>
            <p className="flex justify-between text-white"><span className="capitalize">{monthLabel(m.month)}</span><b>{money(m.total)}</b></p>
            {Object.entries(m.byProduct).map(([id, v]) => <p key={id} className="flex justify-between text-xs text-slate-400"><span>{products.find((p) => p.id === id)?.name || 'Producto eliminado'}</span><span>{money(v)}</span></p>)}
          </div>
        ))}
        <p className="mt-2 text-xs text-slate-500">Suma de las compras que registras (costo por envase × envases). Moneda: soles (S/).</p>
      </Card>
      {form && <ProductForm product={form === 'new' ? null : form} list={W.src.isDemo ? [] : products} onClose={() => setForm(null)} onSave={(p) => { W.saveProduct(p); setForm(null) }} />}
      {detailRow && <ProductDetail row={detailRow} logs={logs} W={W} S={S} today={today} onClose={() => setDetail(null)} onEdit={() => { setForm(detailRow.p); setDetail(null) }} />}
      {del && <ConfirmDialog text={`¿Eliminar "${del.name}" y todo su historial de consumo y compras? No se puede deshacer. (Si solo quieres dejar de usarlo, archívalo.)`} confirmLabel="Eliminar producto" onCancel={() => setDel(null)} onConfirm={() => { W.deleteProduct(del.id); setDel(null) }} />}
    </div>
  )
}
