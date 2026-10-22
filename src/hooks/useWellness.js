import { useMemo } from 'react'
import { supplementSource, buildProduct } from '../utils/supplementCalculations'
import { buildInsightContext, generateInsights, sortInsights, insightMode } from '../utils/insightEngine'

// Los suplementos no duplican datos de otros módulos: agua, comidas, sueño y entrenamientos se leen de sus módulos.
export function useWellness(d, setD, t, now) {
  const src = supplementSource(d)
  const minute = Math.floor(now.getTime() / 60000)
  const insights = useMemo(() => {
    const ctx = buildInsightContext(d, t, now)
    return { ctx, items: sortInsights(generateInsights(ctx)), updatedAt: new Date() }
  }, [d.water, d.meals, d.sessions, d.sleep, d.activity, d.habits, d.habitSettings, d.habitDemo, d.demo, d.trainingDemo, d.profile, d.realProgress, d.supplements, d.supplementLogs, d.supplementDemo, d.wellnessSettings, t.agua, t.prot, t.kcal, Math.floor(minute / 60)]) // eslint-disable-line
  const set = (k, fn) => setD((p) => ({ ...p, [k]: fn(p[k]) }))
  const patchWellness = (patch) => setD((p) => ({ ...p, wellnessSettings: { ...p.wellnessSettings, ...patch } }))
  return {
    src, insights, mode: insightMode(d),
    saveProduct: (product) => set('supplements', (l) => (l.some((x) => x.id === product.id) ? l.map((x) => (x.id === product.id ? product : x)) : [...l, product])),
    buildProduct,
    archiveProduct: (id, archived) => set('supplements', (l) => l.map((x) => (x.id === id ? { ...x, archived } : x))),
    // Eliminar un producto elimina también su historial de consumo (la UI pide confirmación).
    deleteProduct: (id) => setD((p) => ({ ...p, supplements: p.supplements.filter((x) => x.id !== id), supplementLogs: p.supplementLogs.filter((l) => l.productId !== id) })),
    addPurchase: (id, purchase) => set('supplements', (l) => l.map((x) => (x.id === id ? { ...x, purchases: [...x.purchases, { id: `pu-${Date.now()}`, ...purchase }] } : x))),
    removePurchase: (id, purchaseId) => set('supplements', (l) => l.map((x) => (x.id === id ? { ...x, purchases: x.purchases.filter((u) => u.id !== purchaseId) } : x))),
    removeLog: (id) => set('supplementLogs', (l) => l.filter((x) => x.id !== id)),
    patchWellness,
    dismiss: (id, today) => patchWellness({ dismissed: { ...d.wellnessSettings.dismissed, [id]: today } }),
    restoreDismissed: () => patchWellness({ dismissed: {} }),
    setOff: (itemId, off) => patchWellness({ off: off ? [...new Set([...d.wellnessSettings.off, itemId])] : d.wellnessSettings.off.filter((x) => x !== itemId) }),
  }
}
