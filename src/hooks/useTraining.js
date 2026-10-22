import { useMemo } from 'react'
import { nextRoutine, buildActiveSession, finishSession, detectPRs, sessionVolume } from '../utils/trainingCalculations'

// Igual que en nutrición: el DEMO solo se muestra mientras no exista ninguna sesión real (y siempre etiquetado).
export function trainingSource(d) {
  const isDemo = d.demo.active && d.sessions.length === 0 && d.trainingDemo.sessions.length > 0
  return { isDemo, sessions: isDemo ? d.trainingDemo.sessions : d.sessions }
}

export function useTraining(d, setD) {
  const src = trainingSource(d)
  const active = d.trainingSettings.active
  const next = useMemo(() => nextRoutine(d.routines, d.sessions), [d.routines, d.sessions])
  const setSettings = (patch) => setD((p) => ({ ...p, trainingSettings: { ...p.trainingSettings, ...patch } }))
  return {
    isDemo: src.isDemo, sessions: src.sessions, real: d.sessions, routines: d.routines, settings: d.trainingSettings, active, next,
    target: Number(d.profile.diasSemana) || 4, equipment: d.profile.equipamiento || 'mancuernas',
    setSettings,
    start: (routineId) => { const r = d.routines.find((x) => x.id === routineId); if (r) setSettings({ active: buildActiveSession(r) }) },
    patchActive: (fn) => setD((p) => ({ ...p, trainingSettings: { ...p.trainingSettings, active: p.trainingSettings.active ? fn(p.trainingSettings.active) : null } })),
    discard: () => setSettings({ active: null }),
    // Cierra la sesión: calcula PR y comparación con la sesión anterior de la misma rutina (solo datos reales).
    finish: () => {
      const session = finishSession(active)
      if (!session.exercises.length) { setSettings({ active: null }); return null }
      session.prs = detectPRs(d.sessions, session.exercises)
      const prev = [...d.sessions].filter((s) => s.routineId && s.routineId === session.routineId).sort((a, b) => (a.date < b.date ? 1 : -1))[0]
      const compare = prev && sessionVolume(prev) > 0 ? { pct: Math.round(((sessionVolume(session) - sessionVolume(prev)) / sessionVolume(prev)) * 100), date: prev.date } : null
      const planned = active.exercises.reduce((a, e) => a + e.sets.length, 0)
      const completed = session.exercises.reduce((a, e) => a + e.sets.length, 0)
      setD((p) => ({ ...p, sessions: [session, ...p.sessions], trainingSettings: { ...p.trainingSettings, active: null } }))
      return { session, compare, allDone: completed >= planned }
    },
    saveRoutine: (r) => setD((p) => ({ ...p, routines: p.routines.some((x) => x.id === r.id) ? p.routines.map((x) => (x.id === r.id ? r : x)) : [...p.routines, r] })),
    deleteRoutine: (id) => setD((p) => ({ ...p, routines: p.routines.filter((x) => x.id !== id) })),
    replaceRoutines: (list) => setD((p) => ({ ...p, routines: list })),
  }
}
