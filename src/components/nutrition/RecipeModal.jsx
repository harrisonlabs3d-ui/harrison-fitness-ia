import { useState } from 'react'
import { motion } from 'framer-motion'
import { Btn, Select } from '../ui'
import { FOODS_BY_ID, MEAL_TYPES } from '../../data/foods'
import { RECIPE_MEAL } from '../../data/recipes'
import { calculateFoodMacros, calculateRecipeMacros, buildEntry } from '../../utils/nutritionCalculations'

export default function RecipeModal({ recipe, fav, date, onFav, onAdd, onClose }) {
  const [qty, setQty] = useState(recipe.ingredients.map((i) => String(i.quantity)))
  const [meal, setMeal] = useState(RECIPE_MEAL[recipe.category] || 'almuerzo')
  const [ok, setOk] = useState(false)
  const ings = recipe.ingredients.map((i, k) => ({ ...i, quantity: Number(qty[k]) || 0 }))
  const m = calculateRecipeMacros(ings)
  const add = () => {
    onAdd(ings.filter((i) => i.quantity > 0).map((i) => { const f = FOODS_BY_ID[i.foodId]; return buildEntry({ food: f, quantity: i.quantity, unit: i.unit, mealType: meal, date, macros: calculateFoodMacros(f, i.quantity, i.unit) }) }))
    setOk(true)
  }
  return (
    <div role="dialog" aria-modal="true" aria-label={recipe.name} className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-2 md:items-center">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-h-[92vh] w-full max-w-md space-y-3 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-4">
        <div className="flex items-start justify-between gap-2">
          <div><h2 className="text-lg font-semibold text-white">{recipe.name}</h2><p className="text-sm text-slate-400">{recipe.description} · {recipe.prepTime} min · {recipe.category}</p></div>
          <button aria-label="Favorito" aria-pressed={fav} className="p-2 text-2xl" onClick={onFav}>{fav ? '⭐' : '☆'}</button>
        </div>
        <div>{recipe.ingredients.map((i, k) => (
          <div key={i.foodId} className="flex items-center gap-2 py-1 text-sm">
            <span className="flex-1">{FOODS_BY_ID[i.foodId].name.split(' (')[0]}</span>
            <input aria-label={`Cantidad de ${FOODS_BY_ID[i.foodId].name}`} type="number" value={qty[k]} onChange={(e) => setQty(qty.map((x, j) => (j === k ? e.target.value : x)))} className="w-20 rounded-lg border border-slate-700 bg-slate-950 p-2 text-white" />
            <span className="w-14 text-slate-400">{i.unit}</span>
          </div>))}</div>
        <p className="rounded-lg bg-slate-950 p-3 text-sm text-slate-300" aria-live="polite"><b className="text-white">{m.calories} kcal</b> · P {m.protein} g · C {m.carbs} g · G {m.fat} g</p>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-300">{recipe.instructions.map((s) => <li key={s}>{s}</li>)}</ol>
        <Select label="Agregar a" value={meal} onChange={(e) => setMeal(e.target.value)}>{MEAL_TYPES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</Select>
        <div className="flex gap-2"><Btn className="min-h-11" onClick={add}>Agregar al día</Btn><Btn variant="ghost" className="min-h-11" onClick={onClose}>Cerrar</Btn></div>
        {ok && <p className="text-sm text-emerald-400" aria-live="polite">Receta agregada al día seleccionado.</p>}
      </motion.div>
    </div>
  )
}
