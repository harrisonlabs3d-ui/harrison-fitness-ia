import { motion } from 'framer-motion'

export const Card = ({ title, children, className = '' }) => (
  <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`rounded-xl border border-slate-800 bg-slate-900 p-4 ${className}`}>
    {title && <h2 className="mb-3 font-semibold text-white">{title}</h2>}
    {children}
  </motion.section>
)
export const Bar = ({ label, value, max, unit = '', fmt = (v) => Math.round(v) }) => {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div>
      <div className="flex justify-between text-sm"><span>{label}</span><span className="text-slate-400">{fmt(value)} / {fmt(max)}{unit}</span></div>
      <div className="mt-1 h-2 rounded bg-slate-800" role="progressbar" aria-label={label} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <motion.div className="h-2 rounded bg-blue-500" initial={{ width: 0 }} animate={{ width: pct + '%' }} />
      </div>
    </div>
  )
}
const input = 'mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-base text-white'
export const Field = ({ label, error, ...p }) => (
  <label className="block text-sm text-slate-400">{label}
    <input {...p} className={input} />
    {error && <span role="alert" className="text-red-400">{error}</span>}
  </label>
)
export const Select = ({ label, children, ...p }) => (
  <label className="block text-sm text-slate-400">{label}<select {...p} className={input}>{children}</select></label>
)
export const Btn = ({ className = '', variant = 'primary', ...p }) => (
  <button {...p} className={`rounded-lg px-4 py-2 font-medium disabled:opacity-50 ${variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-500' : 'border border-slate-700 text-slate-200 hover:bg-slate-800'} ${className}`} />
)
export const Empty = ({ text, action, onAction }) => (
  <div className="py-6 text-center text-slate-400"><p>{text}</p>{action && <Btn className="mt-3" onClick={onAction}>{action}</Btn>}</div>
)
export const Badge = ({ kind }) => (
  <span className={`rounded px-2 py-0.5 text-xs font-semibold ${kind === 'demo' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>{kind === 'demo' ? 'MODO DEMO · Datos de demostración' : 'REAL'}</span>
)
export const Stat = ({ label, value, sub }) => (
  <div><p className="text-xs text-slate-400">{label}</p><p className="text-lg font-bold text-white">{value}</p>{sub && <p className="text-xs text-slate-500">{sub}</p>}</div>
)
