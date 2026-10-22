import { useState } from 'react'
import { Card, Btn } from '../ui'
import RecipeCard from './RecipeCard'
import RecipeModal from './RecipeModal'
import { RECIPES } from '../../data/recipes'

export default function Recipes({ favorites, custom, date, onFav, onAdd }) {
  const [cat, setCat] = useState('Todas')
  const [open, setOpen] = useState(null)
  const all = [...RECIPES, ...custom]
  const list = all.filter((r) => (cat === 'Todas' ? true : cat === '⭐ Favoritas' ? favorites.recipes.includes(r.id) : r.category === cat))
  return (
    <Card title="Recetas">
      <p className="mb-2 text-xs text-slate-500">Recetas de ejemplo económicas y altas en proteína. Valores aproximados.</p>
      <div className="mb-3 flex gap-2 overflow-x-auto">{['Todas', '⭐ Favoritas', 'Desayuno', 'Almuerzo', 'Cena', 'Snack'].map((c) => <Btn key={c} variant={cat === c ? 'primary' : 'ghost'} aria-pressed={cat === c} className="whitespace-nowrap px-3 py-1 text-sm" onClick={() => setCat(c)}>{c}</Btn>)}</div>
      <div className="space-y-2">
        {list.length === 0 && <p className="py-4 text-center text-sm text-slate-400">No hay recetas en este filtro.</p>}
        {list.map((r) => <RecipeCard key={r.id} recipe={r} fav={favorites.recipes.includes(r.id)} onOpen={() => setOpen(r)} onFav={() => onFav(r.id)} />)}
      </div>
      {open && <RecipeModal key={open.id} recipe={open} fav={favorites.recipes.includes(open.id)} date={date} onFav={() => onFav(open.id)} onAdd={onAdd} onClose={() => setOpen(null)} />}
    </Card>
  )
}
