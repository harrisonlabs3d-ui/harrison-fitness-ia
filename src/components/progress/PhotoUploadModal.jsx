import { useState } from 'react'
import { motion } from 'framer-motion'
import { Btn, Field, Select } from '../ui'
import { CATEGORIES, validatePhoto, compressImage } from '../../utils/photoStorage'
import { todayISO } from '../../utils/formatters'

export default function PhotoUploadModal({ onSave, onClose }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [date, setDate] = useState(todayISO())
  const [category, setCategory] = useState('Frente')
  const [note, setNote] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const pick = (e) => {
    const f = e.target.files?.[0]
    setFile(f || null); setErr('')
    setPreview(f && f.type.startsWith('image/') ? URL.createObjectURL(f) : '')
  }
  const save = async () => {
    const v = validatePhoto({ file, date, note })
    if (v) return setErr(v)
    setBusy(true)
    try {
      const image = await compressImage(file)
      const ok = onSave({ id: `photo-${Date.now()}`, type: 'real', image, date, category, note: note.trim(), createdAt: Date.now() })
      if (!ok) setErr('No hay espacio suficiente en este navegador. Elimina alguna foto e inténtalo otra vez.')
    } catch (e) { setErr(e.message) }
    setBusy(false)
  }
  return (
    <div role="dialog" aria-modal="true" aria-label="Agregar foto" className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 md:items-center">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-h-[90vh] w-full max-w-md space-y-3 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-4">
        <h2 className="text-lg font-semibold text-white">Agregar foto</h2>
        <label className="block text-sm text-slate-400">Foto (JPG, PNG o WEBP)
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} className="mt-1 block w-full text-sm text-slate-300" />
        </label>
        {preview && <img src={preview} alt="Vista previa" className="mx-auto max-h-48 rounded-lg" />}
        <Field label="Fecha" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Select label="Tipo de foto" value={category} onChange={(e) => setCategory(e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select>
        <Field label="Nota (opcional)" value={note} maxLength={160} placeholder="Ej.: Inicio del programa" onChange={(e) => setNote(e.target.value)} />
        {err && <p role="alert" className="text-sm text-red-400">{err}</p>}
        <div className="flex gap-2"><Btn onClick={save} disabled={busy}>{busy ? 'Guardando…' : 'Guardar foto'}</Btn><Btn variant="ghost" onClick={onClose}>Cancelar</Btn></div>
      </motion.div>
    </div>
  )
}
