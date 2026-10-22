import { motion } from 'framer-motion'
import { Card } from '../ui'
import { calculateRemainingMacros, calculateMacroPercentage } from '../../utils/nutritionCalculations'

const r1 = (x) => Math.round(x * 10) / 10
function Row({ label, value, target, unit, strong }) {
  const pct = calculateMacroPercentage(value, target)
  return (
    <div>
      <div className="flex justify-between text-sm"><span>{label}</span><span className="text-slate-300">{value} / {target} {unit} · {pct}%</span></div>
      <div className="mt-1 h-2 rounded bg-slate-800" role="progressbar" aria-label={label} aria-valuenow={Math.min(100, Math.round(pct))} aria-valuemin={0} aria-valuemax={100}>
        <motion.div className={`h-2 rounded ${strong ? 'bg-blue-400' : 'bg-blue-600'}`} animate={{ width: Math.min(100, pct) + '%' }} />
      </div>
      {value > target && <p className="text-xs text-amber-300">{r1(value - target)} {unit} sobre el objetivo</p>}
    </div>
  )
}
export default function MacroSummary({ totals, t }) {
  const rem = calculateRemainingMacros(totals, t)
  const left = (v, u) => (v >= 0 ? `${v} ${u}` : `+${-v} ${u} sobre el objetivo`)
  return (
    <Card title="Resumen del día">
      <div className="space-y-3">
        <div className="rounded-lg border border-blue-500/40 bg-blue-500/10 p-3">
          <p className="text-xs font-semibold tracking-wide text-blue-300">PROTEÍNA</p>
          <p className="text-3xl font-bold text-white">{totals.protein} <span className="text-base font-normal text-slate-300">/ {t.prot} g</span></p>
          <p className="mb-2 text-sm text-blue-200">{rem.protein >= 0 ? `${rem.protein} g restantes` : `+${-rem.protein} g sobre el objetivo`}</p>
          <Row label="Proteína" value={totals.protein} target={t.prot} unit="g" strong />
        </div>
        <Row label="Calorías" value={totals.calories} target={t.kcal} unit="kcal" />
        <Row label="Carbohidratos" value={totals.carbs} target={t.carb} unit="g" />
        <Row label="Grasas" value={totals.fat} target={t.fat} unit="g" />
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-950 p-3 text-sm">
          <p className="col-span-2 text-xs font-semibold tracking-wide text-slate-400">CALORÍAS RESTANTES · <span className="text-white">{left(rem.calories, 'kcal')}</span></p>
          <span>Proteína restante<br /><b>{left(rem.protein, 'g')}</b></span>
          <span>Carbohidratos restantes<br /><b>{left(rem.carbs, 'g')}</b></span>
          <span>Grasas restantes<br /><b>{left(rem.fat, 'g')}</b></span>
        </div>
      </div>
    </Card>
  )
}
