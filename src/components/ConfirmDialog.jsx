import { motion } from 'framer-motion'
import { Btn } from './ui'

export default function ConfirmDialog({ text, confirmLabel, onConfirm, onCancel }) {
  return (
    <div role="alertdialog" aria-modal="true" aria-label={text} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-4">
        <p className="text-white">{text}</p>
        <div className="flex gap-2"><Btn variant="ghost" onClick={onCancel}>Cancelar</Btn><Btn className="bg-red-600 hover:bg-red-500" onClick={onConfirm}>{confirmLabel}</Btn></div>
      </motion.div>
    </div>
  )
}
