export default function RecipeCard({ recipe, fav, onOpen, onFav }) {
  return (
    <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950">
      <button className="min-h-14 flex-1 p-3 text-left" onClick={onOpen}>
        <span className="block text-white">{recipe.name}</span>
        <span className="text-xs text-slate-400">{recipe.category} · {recipe.prepTime} min · {recipe.calories} kcal · P {recipe.protein} g</span>
      </button>
      <button aria-label={`Favorito ${recipe.name}`} aria-pressed={fav} className="px-3 py-3 text-lg" onClick={onFav}>{fav ? '⭐' : '☆'}</button>
    </div>
  )
}
