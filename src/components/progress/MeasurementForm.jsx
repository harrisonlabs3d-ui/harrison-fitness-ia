import { useState } from 'react'
import { Card, Btn, Field } from '../ui'
import { todayISO, num } from '../../utils/formatters'

export default function MeasurementForm({ d, setD }) {
  const [f, setF] = useState({ date: todayISO(), peso: '', cintura: '' })
  const [err, setErr] = useState({})
  const save = () => {
    const e = {}
    if (!f.date || Number.isNaN(new Date(f.date + 'T00:00:00').getTime())) e.date = 'Elige una fecha válida.'
    if (!(num(f.peso) > 0)) e.peso = 'El peso debe ser mayor que 0.'
    if (f.cintura !== '' && !(num(f.cintura) > 0)) e.cintura = 'La cintura debe ser mayor que 0.'
    setErr(e)
    if (Object.keys(e).length) return
    const rec = { id: `real-${Date.now()}`, type: 'real', date: f.date, weight: +f.peso, waist: f.cintura === '' ? null : +f.cintura }
    setD({ ...d, realProgress: [...d.realProgress.filter((r) => r.date !== f.date), rec] })
    setF({ ...f, peso: '', cintura: '' })
  }
  return (
    <Card title="Registrar medidas">
      <div className="grid grid-cols-3 gap-3">
        <Field label="Fecha" type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} error={err.date} />
        <Field label="Peso (kg)" type="number" step="0.1" inputMode="decimal" value={f.peso} onChange={(e) => setF({ ...f, peso: e.target.value })} error={err.peso} />
        <Field label="Cintura (cm)" type="number" step="0.5" inputMode="decimal" value={f.cintura} onChange={(e) => setF({ ...f, cintura: e.target.value })} error={err.cintura} />
      </div>
      <Btn className="mt-3" onClick={save}>Registrar</Btn>
    </Card>
  )
}
