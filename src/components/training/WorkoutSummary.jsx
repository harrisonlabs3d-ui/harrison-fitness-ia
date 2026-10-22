import { Card, Btn } from '../ui'
import { PRBadge } from './parts'
import { sessionVolume, sessionSets, fmtKg, PR_LABEL } from '../../utils/trainingCalculations'

export default function WorkoutSummary({ result, onClose, onHistory }) {
  const { session: s, compare, allDone } = result
  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs font-semibold tracking-wide text-emerald-300">ENTRENAMIENTO COMPLETADO</p>
        <h1 className="text-2xl font-bold text-white">{s.routineName}</h1>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <span>Duración<br /><b className="text-xl text-white">{s.durationMin} min</b></span>
          <span>Ejercicios<br /><b className="text-xl text-white">{s.exercises.length}</b></span>
          <span>Series<br /><b className="text-xl text-white">{sessionSets(s)}</b></span>
          <span>Volumen<br /><b className="text-xl text-white">{fmtKg(sessionVolume(s))} kg</b></span>
        </div>
        <p className="mt-3 text-sm text-slate-300">PR: <b className="text-white">{s.prs.length}</b></p>
      </Card>
      <Card title="Tu progreso">
        <p className="text-sm text-slate-200">{allDone ? 'Completaste todas las series programadas.' : 'Registraste las series completadas; las demás quedaron sin hacer.'}</p>
        {compare && <p className="mt-1 text-sm text-slate-200">Volumen: {compare.pct >= 0 ? '+' : ''}{compare.pct}% respecto a la sesión anterior de esta rutina ({compare.date}).</p>}
        {!compare && <p className="mt-1 text-sm text-slate-400">Aún no hay una sesión anterior de esta rutina para comparar.</p>}
      </Card>
      {s.prs.length > 0 && <Card title="🏆 Nuevo récord">{s.prs.map((p) => <div key={p.exerciseId} className="border-t border-slate-800 py-2 first:border-0"><p className="text-white">{p.name} <PRBadge types={p.types} /></p><p className="text-sm text-slate-300">{p.detail} · {p.types.map((t) => PR_LABEL[t]).join(', ')}</p></div>)}</Card>}
      <div className="flex gap-2"><Btn className="min-h-12" onClick={onHistory}>Ver historial</Btn><Btn variant="ghost" className="min-h-12" onClick={onClose}>Cerrar</Btn></div>
    </div>
  )
}
