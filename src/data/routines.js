import { EXERCISES_BY_ID } from './exercises'
import { finalizeRoutine } from '../utils/trainingCalculations'

export const configFor = (exerciseId, order, over = {}) => {
  const e = EXERCISES_BY_ID[exerciseId]
  return { exerciseId, order, sets: e.defaultSets, repsMin: e.defaultReps[0], repsMax: e.defaultReps[1], restSeconds: e.defaultRest, targetRIR: 2, ...over }
}
const mk = (id, name, day, ids) => finalizeRoutine({ id, name, day, exercises: ids.map((x, i) => configFor(x, i + 1)) })

// Plan inicial de 4 días (editable). No está atado a días fijos de la semana: la rutina "de hoy" es la que sigue en la rotación.
export const defaultRoutines = () => [
  mk('r-pecho-triceps', 'Pecho + Tríceps', 1, ['press-banca-mancuernas', 'press-inclinado-mancuernas', 'aperturas-mancuernas', 'press-cerrado-mancuernas', 'extension-sobre-cabeza', 'patada-triceps']),
  mk('r-espalda-biceps', 'Espalda + Bíceps', 2, ['remo-mancuerna', 'remo-dos-mancuernas', 'pullover-mancuerna', 'curl-mancuernas', 'curl-martillo', 'curl-concentrado']),
  mk('r-piernas-core', 'Piernas + Core', 3, ['sentadilla-goblet', 'peso-muerto-rumano', 'zancadas', 'hip-thrust', 'elevacion-pantorrillas', 'plancha']),
  mk('r-hombros-brazos', 'Hombros + Brazos', 4, ['press-militar-mancuernas', 'elevaciones-laterales', 'pajaros-reverse-fly', 'curl-alternado', 'patada-triceps', 'encogimientos-hombros']),
]
