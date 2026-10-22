import { useState } from 'react'
import { motion } from 'framer-motion'
import { Btn, Field, Select } from '../ui'
import { FOODS, FOODS_BY_ID, CATEGORIES, MEAL_TYPES, UNITS, FOOD_NOTE } from '../../data/foods'
import { calculateFoodMacros, unitOptions, buildEntry } from '../../utils/nutritionCalculations'

const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const CUSTOM = 'custom'
const blankMan = { calories: '', protein: '', carbs: '', fat: '' }

export default function FoodModal({ mode, entry, meal, date, favorites, history, onSave, onClose, onToggleFav }) {
  const editing = mode === 'edit'
  const custom0 = editing && !entry.foodId
  const [fid, setFid] = useState(editing ? entry.foodId || CUSTOM : null)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('Todos')
  const [qty, setQty] = useState(editing ? String(entry.quantity) : '')
  const [unit, setUnit] = useState(editing ? entry.unit : 'g')
  const [mealType, setMealType] = useState(editing ? entry.mealType : meal)
  const [name, setName] = useState(custom0 ? entry.foodName : '')
  const [man, setMan] = useState(custom0 ? { calories: entry.calories, protein: entry.protein, carbs: entry.carbs, fat: entry.fat } : blankMan)
  const [err, setErr] = useState({})
  const [warned, setWarned] = useState(false)
  const food = fid && fid !== CUSTOM ? FOODS_BY_ID[fid] : null

  const pick = (f, quantity, u) => { setFid(f.id); setUnit(u || f.unit); setQty(String(quantity ?? f.portion)); setErr({}); setWarned(false) }
  const list = FOODS.filter((f) => (cat === 'Todos' ? true : cat === '⭐ Favoritos' ? favorites.foods.includes(f.id) : f.category === cat) && (!q || norm(f.name + ' ' + f.category).includes(norm(q))))
  const preview = food && Number(qty) > 0 ? calculateFoodMacros(food, qty, unit) : null

  const save = () => {
    const e = {}, n = Number(qty)
    if (!(n > 0)) e.qty = 'La cantidad debe ser mayor que 0.'
    if (fid === CUSTOM) {
      if (!name.trim()) e.name = 'Escribe un nombre.'
      Object.keys(blankMan).forEach((k) => { if (man[k] === '' || !(Number(man[k]) >= 0)) e[k] = 'Ingresa 0 o más.' })
    }
    setErr(e)
    if (Object.keys(e).length) return
    if ((unit === 'g' || unit === 'ml' ? n > 1500 : n > 20) && !warned) return setWarned(true)
    const macros = food ? calculateFoodMacros(food, n, unit) : Object.fromEntries(Object.keys(blankMan).map((k) => [k, Number(man[k])]))
    onSave(buildEntry({ food, name: name.trim(), quantity: n, unit, mealType, date, macros }), entry)
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={editing ? 'Editar alimento' : 'Agregar alimento'} className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-2 md:items-center">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-h-[92vh] w-full max-w-md space-y-3 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-4">
        <h2 className="text-lg font-semibold text-white">{editing ? 'Editar alimento' : 'Agregar alimento'}</h2>
        {!fid ? (
          <>
            <input autoFocus type="search" aria-label="Buscar alimento" placeholder="Buscar pollo, arroz, huevo..." value={q} onChange={(e) => setQ(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-base text-white" />
            <div className="flex gap-2 overflow-x-auto pb-1">
              {['Todos', '⭐ Favoritos', ...CATEGORIES].map((c) => <Btn key={c} variant={cat === c ? 'primary' : 'ghost'} aria-pressed={cat === c} className="whitespace-nowrap px-3 py-1 text-sm" onClick={() => setCat(c)}>{c}</Btn>)}
            </div>
            {history.length > 0 && !q && cat === 'Todos' && (
              <div><p className="mb-1 text-xs font-semibold tracking-wide text-slate-400">USADOS RECIENTEMENTE</p>
                <div className="flex gap-2 overflow-x-auto">{history.slice(0, 8).map((h) => <Btn key={h.foodId} variant="ghost" className="whitespace-nowrap px-3 py-1 text-sm" onClick={() => pick(FOODS_BY_ID[h.foodId], h.quantity, h.unit)}>{h.foodName.split(' (')[0]}</Btn>)}</div></div>
            )}
            <div className="max-h-[40vh] overflow-y-auto">
              {list.length === 0 && <p className="py-4 text-center text-sm text-slate-400">Sin resultados.</p>}
              {list.map((f) => (
                <div key={f.id} className="flex items-center border-t border-slate-800">
                  <button className="min-h-12 flex-1 py-2 text-left" onClick={() => pick(f)}>
                    <span className="block text-white">{f.name}</span>
                    <span className="text-xs text-slate-400">{f.category} · {f.calories} kcal · P {f.protein} por {f.servingSize} {f.unit}</span>
                  </button>
                  <button aria-label={`Favorito ${f.name}`} aria-pressed={favorites.foods.includes(f.id)} className="px-3 py-3 text-lg" onClick={() => onToggleFav(f.id)}>{favorites.foods.includes(f.id) ? '⭐' : '☆'}</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2"><Btn variant="ghost" onClick={() => { setFid(CUSTOM); setUnit('g') }}>Alimento personalizado</Btn><Btn variant="ghost" onClick={onClose}>Cancelar</Btn></div>
            <p className="text-xs text-slate-500">{FOOD_NOTE}</p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-white">{food ? food.name : 'Alimento personalizado'}</p>
              {!editing && <button className="text-sm text-blue-300" onClick={() => setFid(null)}>Cambiar</button>}
            </div>
            {fid === CUSTOM && <Field label="Nombre" value={name} onChange={(e) => setName(e.target.value)} error={err.name} />}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cantidad" type="number" inputMode="decimal" autoFocus value={qty} onChange={(e) => { setQty(e.target.value); setWarned(false) }} error={err.qty} />
              <Select label="Unidad" value={unit} onChange={(e) => setUnit(e.target.value)}>{(food ? unitOptions(food) : UNITS).map((u) => <option key={u}>{u}</option>)}</Select>
            </div>
            <Select label="Comida" value={mealType} onChange={(e) => setMealType(e.target.value)}>{MEAL_TYPES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}</Select>
            {fid === CUSTOM && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Calorías (total)" type="number" value={man.calories} onChange={(e) => setMan({ ...man, calories: e.target.value })} error={err.calories} />
                <Field label="Proteína (g)" type="number" value={man.protein} onChange={(e) => setMan({ ...man, protein: e.target.value })} error={err.protein} />
                <Field label="Carbohidratos (g)" type="number" value={man.carbs} onChange={(e) => setMan({ ...man, carbs: e.target.value })} error={err.carbs} />
                <Field label="Grasas (g)" type="number" value={man.fat} onChange={(e) => setMan({ ...man, fat: e.target.value })} error={err.fat} />
              </div>
            )}
            {preview && <p className="rounded-lg bg-slate-950 p-3 text-sm text-slate-300" aria-live="polite">{preview.calories} kcal · P {preview.protein} g · C {preview.carbs} g · G {preview.fat} g</p>}
            {warned && <p role="alert" className="text-sm text-amber-300">Es una cantidad muy grande. Pulsa de nuevo para confirmar.</p>}
            <div className="flex gap-2"><Btn className="min-h-11" onClick={save}>{editing ? 'Guardar cambios' : warned ? 'Confirmar y agregar' : 'Agregar'}</Btn><Btn variant="ghost" className="min-h-11" onClick={onClose}>Cancelar</Btn></div>
          </>
        )}
      </motion.div>
    </div>
  )
}
