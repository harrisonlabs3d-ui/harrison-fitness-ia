import { useState } from 'react'
import { Card, Btn, Badge } from '../components/ui'
import ConfirmDialog from '../components/ConfirmDialog'
import MacroSummary from '../components/nutrition/MacroSummary'
import MealSection from '../components/nutrition/MealSection'
import WaterTracker from '../components/nutrition/WaterTracker'
import CalorieDistribution from '../components/nutrition/CalorieDistribution'
import NutritionHistory from '../components/nutrition/NutritionHistory'
import FoodModal from '../components/nutrition/FoodModal'
import MenuGenerator from '../components/nutrition/MenuGenerator'
import Recipes from '../components/nutrition/Recipes'
import { useNutrition } from '../hooks/useNutrition'
import { useWater } from '../hooks/useWater'
import { MEAL_TYPES } from '../data/foods'
import { todayISO, addDays, fmtLong } from '../utils/dateUtils'
import { newId } from '../utils/nutritionCalculations'
import { askHarrisonIA } from '../utils/ia'
import { detectFoods } from '../utils/menuGenerator'

const TABS = [['hoy', 'Hoy'], ['hist', 'Historial'], ['menu', 'Menú'], ['rec', 'Recetas']]

export default function Nutrition({ d, setD, t }) {
  const [date, setDate] = useState(todayISO())
  const [tab, setTab] = useState('hoy')
  const [modal, setModal] = useState(null)
  const [del, setDel] = useState(null)
  const [copyAsk, setCopyAsk] = useState(false)
  const [msg, setMsg] = useState('')
  const [avail, setAvail] = useState(['pollo', 'arroz-blanco', 'huevo', 'avena', 'platano'])
  const [q, setQ] = useState('')
  const [ans, setAns] = useState('')
  const nut = useNutrition(d, setD, date)
  const wat = useWater(d, setD, date)
  const isToday = date === todayISO()
  const prevEntries = nut.all.filter((e) => e.date === addDays(date, -1))
  const clone = (list) => list.map((e) => ({ ...e, id: newId(), type: 'real', date, createdAt: Date.now() }))
  const toggleFav = (kind) => (id) => setD((p) => { const cur = p.favorites[kind]; return { ...p, favorites: { ...p.favorites, [kind]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] } } })

  const save = (e, old) => {
    if (old) nut.update(old.id, { foodName: e.foodName, quantity: e.quantity, unit: e.unit, mealType: e.mealType, calories: e.calories, protein: e.protein, carbs: e.carbs, fat: e.fat })
    else nut.add([e])
    setModal(null)
  }
  const repeat = (mealType) => {
    const list = prevEntries.filter((e) => e.mealType === mealType)
    if (!list.length) return setMsg('No hay registros de esa comida el día anterior.')
    nut.add(clone(list)); setMsg('Comida repetida desde el día anterior.')
  }
  const copyDay = () => {
    if (!prevEntries.length) return setMsg('No hay comidas registradas el día anterior.')
    if (nut.entries.length && !nut.isDemo) return setCopyAsk(true)
    doCopy()
  }
  const doCopy = () => { nut.replaceDay(date, clone(prevEntries)); setCopyAsk(false); setMsg('Día copiado desde el día anterior.') }
  const ask = async () => {
    if (!q.trim()) return setAns('Escribe qué alimentos tienes hoy.')
    const found = detectFoods(q)
    setAns(await askHarrisonIA(q.trim()))
    if (found.length) setAvail(found)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-white">Mi nutrición</h1>
        {nut.isDemo && <Badge kind="demo" />}
      </div>
      <div role="tablist" aria-label="Secciones de nutrición" className="flex gap-2 overflow-x-auto">
        {TABS.map(([id, label]) => <Btn key={id} role="tab" aria-selected={tab === id} variant={tab === id ? 'primary' : 'ghost'} onClick={() => setTab(id)}>{label}</Btn>)}
      </div>
      {nut.isDemo && <p className="text-xs text-amber-400">Estás viendo comidas y agua de demostración. Al registrar tu primera comida o agua real, se ocultan.</p>}
      {msg && <p className="text-sm text-emerald-400" aria-live="polite">{msg}</p>}

      {tab === 'hoy' && (
        <>
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-2">
            <Btn variant="ghost" aria-label="Día anterior" className="min-h-11" onClick={() => setDate(addDays(date, -1))}>←</Btn>
            <div className="text-center"><p className="font-semibold text-white">{isToday ? `Hoy, ${fmtLong(date)}` : fmtLong(date)}</p>{!isToday && <button className="text-xs text-blue-300" onClick={() => setDate(todayISO())}>Ir a hoy</button>}</div>
            <Btn variant="ghost" aria-label="Día siguiente" className="min-h-11" onClick={() => setDate(addDays(date, 1))}>→</Btn>
          </div>
          <MacroSummary totals={nut.totals} t={t} />
          <CalorieDistribution entries={nut.entries} />
          {MEAL_TYPES.map((m) => (
            <MealSection key={m.id} meal={m} entries={nut.entries.filter((e) => e.mealType === m.id)} readOnly={nut.isDemo}
              onAdd={() => setModal({ mode: 'add', meal: m.id })} onEdit={(e) => setModal({ mode: 'edit', entry: e })} onDelete={setDel} onRepeat={() => repeat(m.id)} />
          ))}
          <Btn variant="ghost" className="min-h-11" onClick={copyDay}>Copiar día anterior a esta fecha</Btn>
          <WaterTracker ml={wat.ml} goal={t.agua} onAdd={wat.add} />
        </>
      )}
      {tab === 'hist' && <NutritionHistory entries={nut.all} t={t} onPick={(dt) => { setDate(dt); setTab('hoy') }} />}
      {tab === 'menu' && (
        <>
          <Card title="🤖 Harrison IA">
            <label htmlFor="ia2" className="text-sm text-slate-400">¿Qué necesitas hoy?</label>
            <input id="ia2" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Hoy solo tengo pollo, arroz y huevos." className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-base text-white" />
            <Btn className="mt-3 min-h-11" onClick={ask}>Preguntar</Btn>
            {ans && <p className="mt-3 text-sm text-slate-300" aria-live="polite">{ans} Marqué los alimentos que mencionaste en el generador de abajo.</p>}
          </Card>
          <MenuGenerator key={avail.join(',')} t={t} avail={avail} setAvail={setAvail} date={date} onAdd={(list) => nut.add(list)} />
        </>
      )}
      {tab === 'rec' && <Recipes favorites={d.favorites} custom={d.recipes} date={date} onFav={toggleFav('recipes')} onAdd={(list) => nut.add(list)} />}

      {modal && <FoodModal mode={modal.mode} entry={modal.entry} meal={modal.meal} date={date} favorites={d.favorites} history={d.foodHistory} onSave={save} onClose={() => setModal(null)} onToggleFav={toggleFav('foods')} />}
      {del && <ConfirmDialog text={`¿Eliminar ${del.foodName} (${del.quantity} ${del.unit})?`} confirmLabel="Eliminar" onCancel={() => setDel(null)} onConfirm={() => { nut.remove(del.id); setDel(null) }} />}
      {copyAsk && <ConfirmDialog text="Ya tienes comidas en esta fecha. ¿Sobrescribirlas con las del día anterior?" confirmLabel="Sobrescribir" onCancel={() => setCopyAsk(false)} onConfirm={doCopy} />}
    </div>
  )
}
