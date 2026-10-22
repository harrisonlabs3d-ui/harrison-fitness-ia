import { useState } from 'react'
import { Card, Btn } from '../components/ui'
import ConfirmDialog from '../components/ConfirmDialog'
import SessionRunner from '../components/training/SessionRunner'
import WorkoutSummary from '../components/training/WorkoutSummary'
import RoutineEditor from '../components/training/RoutineEditor'
import RoutineGenerator from '../components/training/RoutineGenerator'
import TrainingHistory from '../components/training/TrainingHistory'
import TrainingStats from '../components/training/TrainingStats'
import { DemoTag } from '../components/training/parts'
import { useTraining } from '../hooks/useTraining'
import { EXERCISES_BY_ID } from '../data/exercises'
import { todayISO } from '../utils/dateUtils'
import { weekStart, weekSummary, recoveryInfo, generateTrainingInsight, routineSets, fmtKg } from '../utils/trainingCalculations'

const TABS = [['hoy', 'Hoy'], ['rut', 'Rutinas'], ['hist', 'Historial'], ['stats', 'Estadísticas']]

export default function Workout({ d, setD }) {
  const tr = useTraining(d, setD)
  const [tab, setTab] = useState('hoy')
  const [summary, setSummary] = useState(null)
  const [edit, setEdit] = useState(null)
  const [del, setDel] = useState(null)
  const [genAsk, setGenAsk] = useState(null)
  const [pickId, setPickId] = useState('')

  if (summary) return <WorkoutSummary result={summary} onClose={() => setSummary(null)} onHistory={() => { setSummary(null); setTab('hist') }} />
  if (tr.active) {
    return <SessionRunner session={tr.active} real={tr.real} equipment={tr.equipment} settings={tr.settings} setSettings={tr.setSettings} patchActive={tr.patchActive}
      onFinish={() => { const r = tr.finish(); if (r) setSummary(r) }} onDiscard={tr.discard} />
  }
  const routine = tr.routines.find((r) => r.id === pickId) || tr.next
  const week = weekSummary(tr.sessions, weekStart(todayISO()))
  const insights = generateTrainingInsight({ sessions: tr.sessions, routines: tr.routines, target: tr.target })
  const nextDay = Math.max(0, ...tr.routines.map((r) => r.day)) + 1
  const prof = d.profile

  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold text-white">Entrenamiento</h1><p className="text-slate-400">Entrena, registra y progresa.</p></div>
      <div role="tablist" aria-label="Secciones de entrenamiento" className="flex gap-2 overflow-x-auto">{TABS.map(([id, l]) => <Btn key={id} role="tab" aria-selected={tab === id} variant={tab === id ? 'primary' : 'ghost'} onClick={() => setTab(id)}>{l}</Btn>)}</div>

      {tab === 'hoy' && (
        <>
          {routine ? (
            <Card>
              <p className="text-xs font-semibold tracking-wide text-blue-300">HOY</p>
              <h2 className="text-2xl font-bold text-white">{routine.name}</h2>
              <p className="text-slate-300">{routine.estimatedDuration} min · {routine.exercises.length} ejercicios · {routineSets(routine)} series</p>
              <ul className="mt-2 space-y-0.5 text-sm text-slate-400">{routine.exercises.map((e) => <li key={e.exerciseId + e.order}>{EXERCISES_BY_ID[e.exerciseId]?.name} · {e.sets} × {e.repsMin}–{e.repsMax}</li>)}</ul>
              <label className="mt-3 block text-sm text-slate-400">Cambiar rutina de hoy
                <select value={routine.id} onChange={(e) => setPickId(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-base text-white">{tr.routines.map((r) => <option key={r.id} value={r.id}>Día {r.day} · {r.name}</option>)}</select></label>
              <Btn className="mt-3 min-h-14 w-full text-lg" onClick={() => tr.start(routine.id)}>COMENZAR ENTRENAMIENTO</Btn>
            </Card>
          ) : <Card><p className="text-slate-400">No tienes rutinas. Crea una en la pestaña Rutinas.</p></Card>}
          <Card title="Esta semana">
            <DemoTag show={tr.isDemo} />
            <div className="grid grid-cols-3 gap-2 text-sm"><span>Entrenamientos<br /><b className="text-xl text-white">{week.count} / {tr.target}</b></span><span>Series<br /><b className="text-xl text-white">{week.sets}</b></span><span>Volumen<br /><b className="text-xl text-white">{fmtKg(week.volume)} kg</b></span></div>
          </Card>
          <Card title="Resumen automático (sin IA)">{insights.map((t) => <p key={t} className="text-sm text-slate-300">• {t}</p>)}<p className="mt-1 text-xs text-slate-500">Calculado con tus registros; una IA real llegará en una fase futura.</p></Card>
          <Card title="Recuperación"><DemoTag show={tr.isDemo} />{recoveryInfo(tr.sessions).map((t) => <p key={t} className="text-sm text-slate-300">{t}</p>)}<p className="mt-1 text-xs text-slate-500">Solo describe tus datos registrados; no mide la recuperación.</p></Card>
        </>
      )}

      {tab === 'rut' && (
        <>
          <Card title="Mis rutinas">
            {tr.routines.length === 0 && <p className="text-sm text-slate-400">No hay rutinas todavía.</p>}
            {[...tr.routines].sort((a, b) => a.day - b.day).map((r) => (
              <div key={r.id} className="border-t border-slate-800 py-3 first:border-0">
                <p className="text-white">Día {r.day} · {r.name}</p>
                <p className="text-xs text-slate-400">{r.muscleGroups.join(', ')} · {r.exercises.length} ejercicios · {routineSets(r)} series · ~{r.estimatedDuration} min</p>
                <div className="mt-2 flex flex-wrap gap-2"><Btn className="min-h-10 px-3 py-1 text-sm" onClick={() => tr.start(r.id)}>Entrenar</Btn><Btn variant="ghost" className="min-h-10 px-3 py-1 text-sm" onClick={() => setEdit(r)}>Editar</Btn><Btn variant="ghost" className="min-h-10 px-3 py-1 text-sm text-red-400" onClick={() => setDel(r)}>Eliminar</Btn></div>
              </div>
            ))}
            <Btn variant="ghost" className="mt-2 min-h-11" onClick={() => setEdit('new')}>+ Nueva rutina</Btn>
          </Card>
          <RoutineGenerator defaults={{ objective: { recomposicion: 'recomposicion', ganancia: 'hipertrofia', mantenimiento: 'mantenimiento', perdida: 'recomposicion' }[prof.objetivo] || 'recomposicion', days: Math.min(5, Math.max(2, Number(prof.diasSemana) || 4)), equipment: prof.equipamiento || 'mancuernas' }} onUse={setGenAsk} />
        </>
      )}
      {tab === 'hist' && <TrainingHistory sessions={tr.sessions} isDemo={tr.isDemo} />}
      {tab === 'stats' && <TrainingStats sessions={tr.sessions} isDemo={tr.isDemo} />}

      {edit && <RoutineEditor routine={edit === 'new' ? null : edit} nextDay={nextDay} onClose={() => setEdit(null)} onSave={(r) => { tr.saveRoutine(r); setEdit(null) }} />}
      {del && <ConfirmDialog text={`¿Eliminar la rutina "${del.name}"? Tu historial de sesiones no se borra.`} confirmLabel="Eliminar" onCancel={() => setDel(null)} onConfirm={() => { tr.deleteRoutine(del.id); setDel(null) }} />}
      {genAsk && <ConfirmDialog text="Esto reemplazará tus rutinas actuales por las generadas. Tu historial no se borra. ¿Continuar?" confirmLabel="Reemplazar" onCancel={() => setGenAsk(null)} onConfirm={() => { tr.replaceRoutines(genAsk); setGenAsk(null); setPickId('') }} />}
    </div>
  )
}
