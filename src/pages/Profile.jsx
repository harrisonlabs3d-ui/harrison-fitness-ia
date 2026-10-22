import { useState } from 'react'
import { Card, Btn, Field, Select } from '../components/ui'
import { getTargets } from '../utils/calculations'
import { num } from '../utils/formatters'
import { emptyData } from '../data/userData'
import { freshDemo, noDemo } from '../data/demoProgress'
import { freshTrainingDemo, noTrainingDemo } from '../data/demoTraining'
import { freshHabitDemo, noHabitDemo } from '../data/demoHabits'
import { freshScheduleDemo, noScheduleDemo } from '../data/schedule'
import { freshSupplementDemo, noSupplementDemo } from '../data/supplements'
import { defaultRoutines } from '../data/routines'
import { clearAll } from '../utils/storage'
import ConfirmDialog from '../components/ConfirmDialog'

export default function Profile({ d, setD }) {
  const [p, setP] = useState({ ...d.profile })
  const [m, setM] = useState({ kcal: '', prot: '', carb: '', fat: '', agua: '', ...d.settings.targets })
  const [err, setErr] = useState({})
  const [ok, setOk] = useState(false)
  const [dlg, setDlg] = useState(null)
  const s = (k) => (e) => { setOk(false); setP({ ...p, [k]: e.target.value }) }
  const auto = getTargets({ ...d.profile }, {})

  const save = () => {
    const e = {}
    if (!p.nombre.trim()) e.nombre = 'Escribe tu nombre.'
    if (!(num(p.edad) >= 14 && num(p.edad) <= 100)) e.edad = 'Ingresa una edad entre 14 y 100.'
    if (!(num(p.estatura) >= 100 && num(p.estatura) <= 250)) e.estatura = 'Ingresa la estatura en cm (100–250).'
    if (!(num(p.peso) > 0)) e.peso = 'El peso debe ser mayor que 0.'
    if (!(num(p.pesoMeta) > 0)) e.pesoMeta = 'La meta debe ser mayor que 0.'
    if (p.cintura !== '' && !(num(p.cintura) > 0)) e.cintura = 'La cintura debe ser mayor que 0.'
    ;['kcal', 'prot', 'carb', 'fat', 'agua'].forEach((k) => { if (m[k] !== '' && !(num(m[k]) > 0)) e[k] = 'Usa un número mayor que 0 o déjalo vacío.' })
    setErr(e)
    if (Object.keys(e).length) return
    const n = { ...p, diasSemana: +p.diasSemana, edad: +p.edad, estatura: +p.estatura, peso: +p.peso, pesoMeta: +p.pesoMeta, cintura: p.cintura === '' ? '' : +p.cintura }
    setD({ ...d, profile: n, settings: { ...d.settings, targets: m } }); setOk(true)
  }
  const reset = { kcal: '', prot: '', carb: '', fat: '', agua: '' }
  const run = () => {
    if (dlg === 'demo') setD({ ...d, demo: freshDemo(), trainingDemo: freshTrainingDemo(), habitDemo: freshHabitDemo(), scheduleDemo: freshScheduleDemo(), supplementDemo: freshSupplementDemo() }) // solo toca el demo
    else if (dlg === 'demoDel') setD({ ...d, demo: noDemo(), trainingDemo: noTrainingDemo(), habitDemo: noHabitDemo(), scheduleDemo: noScheduleDemo(), supplementDemo: noSupplementDemo() })
    else if (dlg === 'trainWipe') setD({ ...d, sessions: [], routines: defaultRoutines(), trainingSettings: { restSeconds: 90, useRPE: false, active: null } })
    else if (dlg === 'wipe') { clearAll(); const e = emptyData(); setD(e); setP({ ...e.profile }); setM(reset) }
    setDlg(null)
  }
  const MSG = {
    demo: ['¿Restablecer los datos de demostración (progreso, fotos, comidas, agua, sesiones, sueño, actividad, recordatorios y suplementos DEMO)? Tus registros reales no se tocarán.', 'Restablecer'],
    demoDel: ['¿Eliminar los datos de demostración (gráfico, fotos, comidas, agua y sesiones DEMO)? Tus registros reales no se tocarán.', 'Eliminar demo'],
    wipe: ['Esta acción eliminará todos tus datos. Esta acción no se puede deshacer.', 'Eliminar todo'],
    trainWipe: ['Esta acción eliminará tus sesiones de entrenamiento y restablecerá las rutinas iniciales. Tu nutrición, progreso, fotos y perfil no se tocan. No se puede deshacer.', 'Eliminar entrenamiento'],
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">Mi perfil</h1>
      <Card title="Datos personales">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre" value={p.nombre} onChange={s('nombre')} error={err.nombre} />
          <Field label="Edad" type="number" value={p.edad} onChange={s('edad')} error={err.edad} />
          <Select label="Sexo" value={p.sexo} onChange={s('sexo')}><option value="m">Hombre</option><option value="f">Mujer</option></Select>
          <Field label="Estatura (cm)" type="number" value={p.estatura} onChange={s('estatura')} error={err.estatura} />
          <Field label="Peso (kg)" type="number" step="0.1" value={p.peso} onChange={s('peso')} error={err.peso} />
          <Field label="Cintura (cm)" type="number" step="0.5" value={p.cintura} onChange={s('cintura')} error={err.cintura} />
          <Field label="Peso objetivo (kg)" type="number" step="0.1" value={p.pesoMeta} onChange={s('pesoMeta')} error={err.pesoMeta} />
          <Select label="Nivel de actividad" value={p.actividad} onChange={s('actividad')}>
            <option value="sedentario">Sedentario</option><option value="ligero">Ligero</option><option value="moderado">Moderado</option><option value="activo">Activo</option><option value="muy_activo">Muy activo</option>
          </Select>
          <Select label="Objetivo" value={p.objetivo} onChange={s('objetivo')}>
            <option value="mantenimiento">Mantenimiento</option><option value="perdida">Pérdida de grasa</option><option value="recomposicion">Recomposición</option><option value="ganancia">Ganancia muscular</option>
          </Select>
          <Field label="Horario de entrenamiento" value={p.horarioEntreno} onChange={s('horarioEntreno')} />
          <Select label="Días de entrenamiento por semana" value={p.diasSemana} onChange={s('diasSemana')}>{[2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}</Select>
          <Select label="Nivel" value={p.nivel} onChange={s('nivel')}><option value="principiante">Principiante</option><option value="intermedio">Intermedio</option><option value="avanzado">Avanzado</option></Select>
          <Select label="Equipamiento principal" value={p.equipamiento} onChange={s('equipamiento')}><option value="mancuernas">Mancuernas</option><option value="peso corporal">Peso corporal</option><option value="gimnasio">Gimnasio</option></Select>
          <Field label="Hora de despertar" type="time" value={p.despertar} onChange={s('despertar')} />
          <Field label="Hora de dormir" type="time" value={p.dormir} onChange={s('dormir')} />
        </div>
      </Card>
      <Card title="Objetivos diarios (manuales)">
        <p className="mb-3 text-sm text-slate-400">Déjalos vacíos para usar la estimación automática ({auto.kcal} kcal, P {auto.prot} g, C {auto.carb} g, G {auto.fat} g). Son cifras orientativas, no una prescripción médica.</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Calorías" type="number" value={m.kcal} onChange={(e) => setM({ ...m, kcal: e.target.value })} error={err.kcal} />
          <Field label="Proteína (g)" type="number" value={m.prot} onChange={(e) => setM({ ...m, prot: e.target.value })} error={err.prot} />
          <Field label="Carbohidratos (g)" type="number" value={m.carb} onChange={(e) => setM({ ...m, carb: e.target.value })} error={err.carb} />
          <Field label="Grasas (g)" type="number" value={m.fat} onChange={(e) => setM({ ...m, fat: e.target.value })} error={err.fat} />
          <Field label="Agua (ml)" type="number" value={m.agua} onChange={(e) => setM({ ...m, agua: e.target.value })} error={err.agua} />
        </div>
      </Card>
      <Btn onClick={save}>Guardar cambios</Btn>
      {ok && <p className="text-sm text-emerald-400" aria-live="polite">Cambios guardados.</p>}
      <Card title="Datos">
        <div className="flex flex-wrap gap-2">
          <Btn variant="ghost" onClick={() => setDlg('demo')}>Restablecer datos demo</Btn>
          <Btn variant="ghost" onClick={() => setDlg('demoDel')}>Eliminar datos demo</Btn>
          <Btn variant="ghost" className="text-red-400" onClick={() => setDlg('trainWipe')}>Borrar datos de entrenamiento</Btn>
          <Btn variant="ghost" className="text-red-400" onClick={() => setDlg('wipe')}>Borrar todos mis datos</Btn>
        </div>
      </Card>
      {dlg && <ConfirmDialog text={MSG[dlg][0]} confirmLabel={MSG[dlg][1]} onCancel={() => setDlg(null)} onConfirm={run} />}
    </div>
  )
}
