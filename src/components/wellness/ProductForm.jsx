import { useState } from 'react'
import { Btn, Field, Select } from '../ui'
import { SUPP_CATEGORIES, PRESENTATIONS, SERVING_UNITS, FREQUENCIES, emptyProduct, isPrescribed } from '../../data/supplements'
import { WEEK_ORDER } from '../../data/schedule'
import { validateProduct, buildProduct, productToForm } from '../../utils/supplementCalculations'

const L = { 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S', 0: 'D' }
const NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

// Lista editable de horarios (HH:MM). Sin duplicados al guardar.
function TimeList({ label, times, onChange, error }) {
  const [v, setV] = useState('')
  const add = () => { if (v && !times.includes(v)) onChange([...times, v].sort()); setV('') }
  return (
    <div>
      <p className="text-sm text-slate-400">{label}</p>
      <div className="mt-1 flex flex-wrap gap-2">
        {times.map((t) => <span key={t} className="flex items-center gap-1 rounded-lg bg-slate-800 px-2 py-1 text-sm text-white">{t}<button type="button" aria-label={`Quitar horario ${t}`} className="px-1 text-slate-400" onClick={() => onChange(times.filter((x) => x !== t))}>✕</button></span>)}
        {!times.length && <span className="text-sm text-slate-500">Sin horarios</span>}
      </div>
      <div className="mt-2 flex gap-2"><input type="time" aria-label={`${label}: nueva hora`} value={v} onChange={(e) => setV(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-white" /><Btn type="button" variant="ghost" className="min-h-10 px-3 py-1" onClick={add}>Agregar hora</Btn></div>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
    </div>
  )
}

export default function ProductForm({ product, list, onSave, onClose }) {
  const [f, setF] = useState(product ? productToForm(product) : emptyProduct())
  const [err, setErr] = useState({})
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const sch = (patch) => setF({ ...f, schedule: { ...f.schedule, ...patch } })
  const rx = isPrescribed(f.category)
  const toggleDay = (d) => sch({ days: f.schedule.days.includes(d) ? f.schedule.days.filter((x) => x !== d) : [...f.schedule.days, d] })
  const save = () => { const e = validateProduct(f, list, product?.id); setErr(e); if (!Object.keys(e).length) onSave(buildProduct(f, product)) }
  return (
    <div role="dialog" aria-modal="true" aria-label={product ? 'Editar producto' : 'Nuevo producto'} className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-2 md:items-center">
      <div className="max-h-[92vh] w-full max-w-lg space-y-3 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-4">
        <h2 className="text-lg font-semibold text-white">{product ? 'Editar producto' : 'Nuevo producto'}</h2>
        <Select label="Categoría" value={f.category} onChange={set('category')}>{SUPP_CATEGORIES.map(([id, l]) => <option key={id} value={id}>{l}</option>)}</Select>
        {rx && <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2 text-sm text-amber-200">Aquí solo registras y recibes recordatorios de una pauta que te indicó un profesional de la salud. La app no calcula, sugiere ni modifica dosis, y no sustituye su indicación.</p>}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre" value={f.name} onChange={set('name')} error={err.name} />
          <Field label="Marca" value={f.brand} onChange={set('brand')} />
          <Select label="Presentación" value={f.presentation} onChange={set('presentation')}>{PRESENTATIONS.map((p) => <option key={p}>{p}</option>)}</Select>
          <Field label="Tamaño del envase (ej. 900 g)" value={f.packageSize} onChange={set('packageSize')} />
          <Field label="Porciones por envase" type="number" min="1" step="1" value={f.servingsPerPackage} onChange={set('servingsPerPackage')} error={err.servingsPerPackage} />
          <Select label="Unidad de la porción" value={f.servingUnit} onChange={set('servingUnit')}>{SERVING_UNITS.map((p) => <option key={p}>{p}</option>)}</Select>
          <Field label="Porciones por toma" type="number" min="0.5" step="0.5" value={f.servingsPerIntake} onChange={set('servingsPerIntake')} error={err.servingsPerIntake} />
          <Field label="Fecha de inicio" type="date" value={f.startDate} onChange={set('startDate')} error={err.startDate} />
          {!product && <><Field label="Costo por envase (S/)" type="number" min="0" step="0.01" value={f.cost} onChange={set('cost')} error={err.cost} /><Field label="Envases comprados" type="number" min="1" step="1" value={f.packages} onChange={set('packages')} error={err.packages} /></>}
        </div>
        <Field label="Ingredientes / composición" value={f.ingredients} onChange={set('ingredients')} />
        <Field label="Fuente de información (etiqueta, web, profesional…)" value={f.infoSource} onChange={set('infoSource')} />
        {rx && <>
          <Field label="Profesional responsable" value={f.prescription.professional} onChange={(e) => setF({ ...f, prescription: { ...f.prescription, professional: e.target.value } })} />
          <label className="block text-sm text-slate-400">Pauta indicada por el profesional (texto tal como te la dieron)
            <textarea value={f.prescription.instruction} maxLength={400} rows={3} onChange={(e) => setF({ ...f, prescription: { ...f.prescription, instruction: e.target.value } })} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-base text-white" />
            {err.instruction && <span role="alert" className="text-red-400">{err.instruction}</span>}</label>
        </>}
        <label className="block text-sm text-slate-400">Notas
          <textarea value={f.notes} rows={2} onChange={set('notes')} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-base text-white" /></label>

        <div className="space-y-3 rounded-lg border border-slate-800 p-3">
          <p className="font-semibold text-white">Horario personal</p>
          <Select label="Frecuencia" value={f.schedule.freq} onChange={(e) => sch({ freq: e.target.value })}>{FREQUENCIES.map(([id, l]) => <option key={id} value={id}>{l}</option>)}</Select>
          {f.schedule.freq === 'days' && (
            <div><div className="flex gap-2" role="group" aria-label="Días de toma">{WEEK_ORDER.map((d) => <Btn key={d} type="button" variant={f.schedule.days.includes(d) ? 'primary' : 'ghost'} aria-pressed={f.schedule.days.includes(d)} aria-label={NAMES[d]} className="min-h-11 flex-1 px-0" onClick={() => toggleDay(d)}>{L[d]}</Btn>)}</div>
              {err.days && <p role="alert" className="text-sm text-red-400">{err.days}</p>}</div>
          )}
          {f.schedule.freq !== 'asNeeded' && <>
            <TimeList label="Horarios (lunes a viernes)" times={f.schedule.times} onChange={(times) => sch({ times })} error={err.times} />
            <TimeList label="Horarios distintos en sábado y domingo (opcional)" times={f.schedule.weekendTimes} onChange={(weekendTimes) => sch({ weekendTimes })} />
          </>}
          <p className="text-xs text-slate-500">No se asume consumo diario: tú decides la frecuencia y la hora. Sin horario fijo, solo se registra cuando lo marcas.</p>
        </div>
        <div className="flex gap-2"><Btn className="min-h-11" onClick={save}>Guardar producto</Btn><Btn variant="ghost" className="min-h-11" onClick={onClose}>Cancelar</Btn></div>
      </div>
    </div>
  )
}
