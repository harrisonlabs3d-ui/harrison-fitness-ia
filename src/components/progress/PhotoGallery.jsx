import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, Btn, Empty } from '../ui'
import ConfirmDialog from '../ConfirmDialog'
import PhotoUploadModal from './PhotoUploadModal'
import PhotoComparison from './PhotoComparison'
import { CATEGORIES } from '../../utils/photoStorage'
import { fmtFull } from '../../utils/formatters'

export default function PhotoGallery({ photos, onAdd, onRemove }) {
  const [filter, setFilter] = useState('Todas')
  const [open, setOpen] = useState(false)
  const [del, setDel] = useState(null)
  const [compare, setCompare] = useState(false)
  const [sel, setSel] = useState([])
  const list = [...photos].sort((a, b) => (a.date < b.date ? 1 : -1)).filter((p) => filter === 'Todas' || p.category === filter)
  const chosen = sel.map((id) => photos.find((p) => p.id === id)).filter(Boolean)

  const click = (p) => { if (compare) setSel((s) => (s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id].slice(-2))) }
  const toggleCompare = () => { setCompare(!compare); setSel([]) }

  return (
    <>
      <Card title="📸 Mis fotos">
        <p className="text-sm text-slate-400">Registra tus cambios físicos a lo largo del tiempo.</p>
        <Btn className="mt-3" onClick={() => setOpen(true)}>+ Agregar foto</Btn>
        <p className="mt-2 text-xs text-slate-500">Tus fotos se almacenan localmente en este dispositivo en esta versión.</p>
      </Card>
      <Card title="Mi evolución">
        <div className="flex flex-wrap gap-2">
          {['Todas', ...CATEGORIES].map((c) => <Btn key={c} variant={filter === c ? 'primary' : 'ghost'} aria-pressed={filter === c} className="px-3 py-1 text-sm" onClick={() => setFilter(c)}>{c}</Btn>)}
          <Btn variant={compare ? 'primary' : 'ghost'} aria-pressed={compare} className="px-3 py-1 text-sm" onClick={toggleCompare}>Comparar</Btn>
        </div>
        {compare && <p className="mt-2 text-sm text-slate-400">Toca dos fotos para compararlas ({sel.length}/2).</p>}
        {compare && chosen.length === 2 && <div className="mt-3"><PhotoComparison a={chosen[0]} b={chosen[1]} /></div>}
        {list.length === 0 ? <Empty text="No tienes fotos todavía." action="Agregar foto" onAction={() => setOpen(true)} /> : (
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {list.map((p) => (
              <motion.figure key={p.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ y: -2 }}
                className={`overflow-hidden rounded-lg border bg-slate-950 ${sel.includes(p.id) ? 'border-blue-400' : 'border-slate-800'}`}>
                <button type="button" onClick={() => click(p)} className="relative block w-full" aria-label={`${p.category} ${fmtFull(p.date)}${compare ? ', seleccionar para comparar' : ''}`}>
                  <img src={p.image} alt={`${p.category} · ${fmtFull(p.date)}`} className="aspect-[3/4] w-full object-cover" />
                  {p.type === 'demo' && <span className="absolute left-1 top-1 rounded bg-amber-500 px-1.5 text-xs font-bold text-black">DEMO</span>}
                </button>
                <figcaption className="space-y-0.5 p-2 text-xs">
                  <p className="text-white">{fmtFull(p.date)} · {p.category}</p>
                  {p.note && <p className="text-slate-400">{p.note}</p>}
                  <button className="pt-1 text-red-400" onClick={() => setDel(p)}>Eliminar</button>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        )}
      </Card>
      {open && <PhotoUploadModal onClose={() => setOpen(false)} onSave={(ph) => { const ok = onAdd(ph); if (ok) setOpen(false); return ok }} />}
      {del && <ConfirmDialog text="¿Seguro que quieres eliminar esta fotografía?" confirmLabel="Eliminar" onCancel={() => setDel(null)} onConfirm={() => { onRemove(del); setSel((s) => s.filter((x) => x !== del.id)); setDel(null) }} />}
    </>
  )
}
