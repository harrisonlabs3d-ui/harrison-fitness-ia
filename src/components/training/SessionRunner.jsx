import { useState, useEffect } from 'react'
import { Card, Btn } from '../ui'
import ConfirmDialog from '../ConfirmDialog'
import { SetLogger, RestTimer } from './Logger'
import { ProgressionSuggestion, fmtSet } from './parts'
import { EXERCISES_BY_ID } from '../../data/exercises'
import { exerciseHistory, progressionSuggestion, exerciseVolume, sessionVolume, fmtKg } from '../../utils/trainingCalculations'

const open = (s) => !s.completed && !s.skipped
const mmss = (ms) => { const t = Math.floor(ms / 1000); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}` }

export default function SessionRunner({ session, real, equipment, settings, setSettings, patchActive, onFinish, onDiscard }) {
  const [tick, setTick] = useState(Date.now())
  const [runKey, setRunKey] = useState(0)
  const [ask, setAsk] = useState(null)
  useEffect(() => { const i = setInterval(() => setTick(Date.now()), 1000); return () => clearInterval(i) }, [])
  const exs = session.exercises
  const ci = Math.min(session.cur, exs.length - 1)
  const ex = exs[ci], lib = EXERCISES_BY_ID[ex.exerciseId]
  const si = ex.sets.findIndex(open)
  const exDone = (e) => e.sets.every((s) => !open(s))
  const doneCount = exs.filter(exDone).length
  const vol = sessionVolume({ exercises: exs })
  const hist = ex.exerciseId ? exerciseHistory(real, ex.exerciseId) : []
  const sug = progressionSuggestion(ex.cfg, hist, lib?.equipment === 'gimnasio' ? 'gimnasio' : equipment)
  const prevDone = [...ex.sets].reverse().find((s) => s.completed)
  const ref = prevDone || hist[0]?.sets[Math.min(Math.max(si, 0), hist[0].sets.length - 1)] || {}
  const unit = lib?.repUnit || 'reps'

  const go = (n) => patchActive((a) => ({ ...a, cur: Math.max(0, Math.min(a.exercises.length - 1, n)) }))
  const update = (fn) => patchActive((a) => ({ ...a, exercises: a.exercises.map((e, i) => (i === ci ? { ...e, sets: fn(e.sets) } : e)) }))
  const complete = (data) => {
    update((sets) => sets.map((s, i) => (i === si ? { ...s, ...data, completed: true, timestamp: Date.now() } : s)))
    setRunKey((k) => k + 1)
    if (ex.sets.filter(open).length === 1 && ci < exs.length - 1) go(ci + 1)
  }
  const skip = () => { update((sets) => sets.map((s, i) => (i === si ? { ...s, skipped: true } : s))); if (ex.sets.filter(open).length === 1 && ci < exs.length - 1) go(ci + 1) }
  const addSet = () => update((sets) => [...sets, { setNumber: sets.length + 1, weight: null, reps: null, rir: null, rpe: null, completed: false, skipped: false, timestamp: null }])

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start justify-between gap-2">
          <div><p className="text-xs font-semibold tracking-wide text-blue-300">SESIÓN EN PROGRESO</p><h1 className="text-xl font-bold text-white">{session.routineName}</h1></div>
          <p className="text-2xl font-bold text-white" aria-label="Tiempo transcurrido">{mmss(tick - session.startedAt)}</p>
        </div>
        <p className="mt-1 text-sm text-slate-300">{doneCount} / {exs.length} ejercicios · {exs.reduce((a, e) => a + e.sets.filter((s) => s.completed).length, 0)} series · {fmtKg(vol)} kg de volumen</p>
        <div className="mt-2 h-2 rounded bg-slate-800" role="progressbar" aria-label="Progreso de la sesión" aria-valuenow={Math.round((doneCount / exs.length) * 100)} aria-valuemin={0} aria-valuemax={100}><div className="h-2 rounded bg-blue-500 transition-all" style={{ width: `${(doneCount / exs.length) * 100}%` }} /></div>
        <div className="mt-3 flex gap-2 overflow-x-auto" role="tablist" aria-label="Ejercicios">
          {exs.map((e, i) => <Btn key={e.exerciseId + i} role="tab" aria-selected={i === ci} variant={i === ci ? 'primary' : 'ghost'} className="min-h-10 min-w-10 px-3 py-1" onClick={() => go(i)}>{exDone(e) ? '✓' : i + 1}</Btn>)}
        </div>
      </Card>

      <Card title={ex.name.toUpperCase()}>
        <p className="-mt-2 text-sm text-slate-400">{ex.cfg.sets} × {ex.cfg.repsMin}–{ex.cfg.repsMax}{unit === 's' ? ' s' : ''} · descanso {ex.cfg.restSeconds} s · RIR objetivo {ex.cfg.targetRIR}</p>
        {lib?.tips && <p className="mt-1 text-xs text-slate-500">{lib.tips}</p>}
        {hist[0] && <div className="mt-3 rounded-lg bg-slate-950 p-3 text-sm"><p className="text-xs font-semibold tracking-wide text-slate-400">ÚLTIMA VEZ · {hist[0].date}</p>{hist[0].sets.map((s, i) => <p key={i} className="text-slate-200">{fmtSet(s, unit)}</p>)}</div>}
        <div className="mt-3"><ProgressionSuggestion s={sug} /></div>
        <div className="mt-4">
          {si === -1 ? (
            <div className="space-y-3 text-center"><p className="text-lg font-semibold text-emerald-400">✓ Ejercicio completado</p>
              <div className="flex gap-2">{ci < exs.length - 1 && <Btn className="min-h-12 flex-1" onClick={() => go(ci + 1)}>Siguiente ejercicio</Btn>}<Btn variant="ghost" className="min-h-12" onClick={addSet}>+ Serie extra</Btn></div></div>
          ) : (
            <>
              <p className="mb-3 text-lg font-semibold text-white">Serie {si + 1} de {ex.sets.length}</p>
              <SetLogger key={`${ci}-${si}`} init={{ weight: ref.weight, reps: ref.reps }} useRPE={settings.useRPE} setUseRPE={(v) => setSettings({ useRPE: v })} repLabel={unit === 's' ? 'Segundos' : 'Repeticiones'} onComplete={complete} onSkip={skip} />
            </>
          )}
        </div>
        {ex.sets.some((s) => s.completed) && <div className="mt-4 border-t border-slate-800 pt-2 text-sm">{ex.sets.filter((s) => s.completed).map((s) => <p key={s.setNumber} className="text-slate-300">Serie {s.setNumber}: {fmtSet(s, unit)}{s.rir != null ? ` · RIR ${s.rir}` : ''}{s.rpe != null ? ` · RPE ${s.rpe}` : ''}</p>)}<p className="text-slate-500">Volumen del ejercicio: {fmtKg(exerciseVolume(ex))} kg</p></div>}
      </Card>

      <RestTimer seconds={settings.restSeconds || ex.cfg.restSeconds} runKey={runKey} onChangeSeconds={(n) => setSettings({ restSeconds: n })} />
      <div className="flex gap-2"><Btn className="min-h-12 flex-1" onClick={() => setAsk('finish')}>FINALIZAR ENTRENAMIENTO</Btn><Btn variant="ghost" className="min-h-12" onClick={() => setAsk('discard')}>Descartar</Btn></div>
      {ask === 'finish' && <ConfirmDialog text="¿Finalizar el entrenamiento? Se guardarán las series completadas." confirmLabel="Finalizar" onCancel={() => setAsk(null)} onConfirm={() => { setAsk(null); onFinish() }} />}
      {ask === 'discard' && <ConfirmDialog text="¿Descartar esta sesión? No se guardará ninguna serie." confirmLabel="Descartar" onCancel={() => setAsk(null)} onConfirm={() => { setAsk(null); onDiscard() }} />}
    </div>
  )
}
