// Acción principal de cada evento de la agenda (compartida por "Agenda" y "Mi día" para no duplicar lógica).
export const nowHHMM = (d = new Date()) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

export function makePrimary({ S, tr, go, date }) {
  return (ev) => {
    if (ev.status === 'completed' || ev.status === 'skipped') return null
    if (ev.type === 'supplement') return ev.demo ? null : { label: 'Registrar toma', run: () => S.logIntake({ productId: ev.productId, date, time: nowHHMM(), servings: ev.servings }) }
    if (ev.type === 'water') return { label: `Registrar ${ev.amountMl} ml`, run: () => S.addWater(date, ev.amountMl) }
    if (ev.type === 'workout') return { label: 'Comenzar entrenamiento', run: () => { if (!tr.active && ev.linkedWorkoutId) tr.start(ev.linkedWorkoutId); go('wo') } }
    if (ev.mealType) return { label: 'Registrar comida', run: () => go('nut') }
    if (ev.type === 'habit') return { label: 'Registrar', run: () => go('hab') }
    if (ev.type === 'progress') return { label: 'Registrar', run: () => go('prog') }
    if (ev.type === 'wake') return null
    return { label: 'Marcar hecho', run: () => S.setState({ date, eventId: ev.id, status: 'completed' }) }
  }
}
