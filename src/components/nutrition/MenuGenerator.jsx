import { useState } from 'react'
import { Card, Btn, Field, Select } from '../ui'
import { FOODS, FOODS_BY_ID, MEAL_TYPES } from '../../data/foods'
import { generateMenu } from '../../utils/menuGenerator'
import { calculateFoodMacros, calculateDailyTotals, buildEntry } from '../../utils/nutritionCalculations'

const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const macrosOf = (items) => calculateDailyTotals(items.map((i) => calculateFoodMacros(FOODS_BY_ID[i.foodId], i.quantity || 0, i.unit)))

export default function MenuGenerator({ t, avail, setAvail, date, onAdd }) {
  const [kcal, setKcal] = useState(String(t.kcal))
  const [prot, setProt] = useState(String(t.prot))
  const [n, setN] = useState('5')
  const [q, setQ] = useState('')
  const [menu, setMenu] = useState(null)
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')

  const toggle = (id) => setAvail(avail.includes(id) ? avail.filter((x) => x !== id) : [...avail, id])
  const gen = () => {
    setOk('')
    if (!avail.length) return setErr('Elige al menos un alimento.')
    if (!(Number(kcal) > 0) || !(Number(prot) >= 0)) return setErr('Revisa las calorías y la proteína objetivo.')
    setErr(''); setMenu(generateMenu({ foodIds: avail, kcal: Number(kcal), protein: Number(prot), meals: Number(n) }))
  }
  const setQty = (mi, ii, v) => setMenu(menu.map((m, a) => (a !== mi ? m : { ...m, items: m.items.map((it, b) => (b !== ii ? it : { ...it, quantity: v === '' ? '' : Number(v) })) })))
  const toEntries = (m) => m.items.filter((i) => Number(i.quantity) > 0).map((i) => { const f = FOODS_BY_ID[i.foodId]; return buildEntry({ food: f, quantity: i.quantity, unit: i.unit, mealType: m.mealType, date, macros: calculateFoodMacros(f, i.quantity, i.unit) }) })
  const total = menu ? macrosOf(menu.flatMap((m) => m.items)) : null
  const list = FOODS.filter((f) => !q || norm(f.name).includes(norm(q)))

  return (
    <Card title="Generar menú">
      <div className="grid grid-cols-3 gap-3">
        <Field label="Calorías" type="number" value={kcal} onChange={(e) => setKcal(e.target.value)} />
        <Field label="Proteína (g)" type="number" value={prot} onChange={(e) => setProt(e.target.value)} />
        <Select label="Comidas" value={n} onChange={(e) => setN(e.target.value)}><option>3</option><option>4</option><option>5</option></Select>
      </div>
      <p className="mt-4 text-sm font-semibold text-white">¿Qué alimentos tienes?</p>
      <input type="search" aria-label="Buscar alimentos disponibles" placeholder="Buscar alimento…" value={q} onChange={(e) => setQ(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-base text-white" />
      <div className="mt-2 flex max-h-40 flex-wrap gap-2 overflow-y-auto">
        {list.map((f) => <Btn key={f.id} variant={avail.includes(f.id) ? 'primary' : 'ghost'} aria-pressed={avail.includes(f.id)} className="px-3 py-1 text-sm" onClick={() => toggle(f.id)}>{avail.includes(f.id) ? '☑ ' : ''}{f.name.split(' (')[0]}</Btn>)}
      </div>
      <p className="mt-1 text-xs text-slate-500">{avail.length} seleccionados</p>
      {err && <p role="alert" className="mt-2 text-sm text-red-400">{err}</p>}
      <Btn className="mt-3 min-h-11" onClick={gen}>Generar menú</Btn>
      {menu && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-slate-400">Propuesta aproximada y editable: cambia las cantidades y los macros se recalculan.</p>
          {menu.map((m, mi) => { const mm = macrosOf(m.items), meal = MEAL_TYPES.find((x) => x.id === m.mealType); return (
            <div key={m.mealType} className="rounded-lg border border-slate-800 p-3">
              <p className="font-semibold text-white">{meal.icon} {meal.label}</p>
              {m.items.map((it, ii) => (
                <div key={it.foodId} className="mt-2 flex items-center gap-2 text-sm">
                  <span className="flex-1">{FOODS_BY_ID[it.foodId].name.split(' (')[0]}</span>
                  <input aria-label={`Cantidad de ${FOODS_BY_ID[it.foodId].name}`} type="number" value={it.quantity} onChange={(e) => setQty(mi, ii, e.target.value)} className="w-20 rounded-lg border border-slate-700 bg-slate-950 p-2 text-white" />
                  <span className="w-14 text-slate-400">{it.unit}</span>
                </div>
              ))}
              <p className="mt-2 text-xs text-slate-400">{mm.calories} kcal · P {mm.protein} · C {mm.carbs} · G {mm.fat}</p>
              <Btn variant="ghost" className="mt-2 px-3 py-1 text-sm" onClick={() => { onAdd(toEntries(m)); setOk(`${meal.label} agregado al día.`) }}>Agregar esta comida</Btn>
            </div>) })}
          <p className="rounded-lg bg-slate-950 p-3 text-sm text-slate-300">Total: <b className="text-white">{total.calories} kcal</b> · P {total.protein} g · C {total.carbs} g · G {total.fat} g <span className="text-slate-500">(objetivo {kcal} kcal · {prot} g proteína)</span></p>
          <Btn className="min-h-11" onClick={() => { onAdd(menu.flatMap(toEntries)); setOk('Menú completo agregado al día.') }}>Agregar todo al día</Btn>
          {ok && <p className="text-sm text-emerald-400" aria-live="polite">{ok}</p>}
        </div>
      )}
    </Card>
  )
}
