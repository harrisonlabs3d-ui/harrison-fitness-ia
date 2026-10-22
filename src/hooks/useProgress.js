import { useMemo } from 'react'
import { buildProgressData, rangeBounds } from '../utils/progressCalculations'
import { todayISO } from '../utils/dateUtils'

// Los datos derivados se calculan siempre desde lo almacenado; no se guardan.
export function useProgress(d, t, range = 'all') {
  const today = todayISO()
  const data = useMemo(() => buildProgressData(d, t, today), [d.realProgress, d.demo, d.photos, d.meals, d.water, d.sessions, d.trainingDemo, d.profile, t.kcal, t.prot, today]) // eslint-disable-line
  const b = useMemo(() => rangeBounds(range, data), [range, data])
  return { data, b }
}
