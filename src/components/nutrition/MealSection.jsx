import { motion } from 'framer-motion'
import { Card, Btn } from '../ui'
import { calculateDailyTotals } from '../../utils/nutritionCalculations'

export default function MealSection({ meal, entries, readOnly, onAdd, onEdit, onDelete, onRepeat }) {
  const s = calculateDailyTotals(entries)
  return (
    <Card title={`${meal.icon} ${meal.label}`}>
      <p className="-mt-2 mb-2 text-sm text-slate-400">{s.calories} kcal · {s.protein} g proteína · {s.carbs} g carbs · {s.fat} g grasa</p>
      {entries.length === 0 && <p className="py-2 text-sm text-slate-500">Sin alimentos todavía.</p>}
      {entries.map((e) => (
        <motion.div key={e.id} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between gap-2 border-t border-slate-800 py-2 text-sm">
          <div className="min-w-0">
            <p className="truncate text-white">{e.foodName} · {e.quantity} {e.unit}</p>
            <p className="text-slate-400">{e.calories} kcal · P {e.protein} · C {e.carbs} · G {e.fat}</p>
          </div>
          {!readOnly && <div className="flex shrink-0 gap-1">
            <button className="px-2 py-2 text-blue-300" aria-label={`Editar ${e.foodName}`} onClick={() => onEdit(e)}>Editar</button>
            <button className="px-2 py-2 text-red-400" aria-label={`Eliminar ${e.foodName}`} onClick={() => onDelete(e)}>Eliminar</button>
          </div>}
        </motion.div>
      ))}
      <div className="mt-2 flex flex-wrap gap-2">
        <Btn className="min-h-11 flex-1" onClick={onAdd}>+ Agregar alimento</Btn>
        <Btn variant="ghost" className="min-h-11" onClick={onRepeat}>Repetir de ayer</Btn>
      </div>
    </Card>
  )
}
