export const ACTIVIDAD = { sedentario: 1.2, ligero: 1.375, moderado: 1.55, activo: 1.725, muy_activo: 1.9 }
export const OBJETIVO = { mantenimiento: 0, perdida: -0.2, recomposicion: -0.1, ganancia: 0.1 }

export const imc = (peso, estaturaCm) => (peso > 0 && estaturaCm > 0 ? peso / (estaturaCm / 100) ** 2 : 0)

// Estimación orientativa (Mifflin-St Jeor x actividad + ajuste por objetivo). No es prescripción médica.
export function autoTargets(p) {
  const bmr = 10 * p.peso + 6.25 * p.estatura - 5 * p.edad + (p.sexo === 'm' ? 5 : -161)
  const kcal = Math.round((bmr * ACTIVIDAD[p.actividad] * (1 + OBJETIVO[p.objetivo])) / 10) * 10
  const prot = Math.round(p.peso * 1.9)
  const fat = Math.round(p.peso * 0.75)
  const carb = Math.max(0, Math.round((kcal - prot * 4 - fat * 9) / 4))
  return { kcal, prot, carb, fat, agua: 2500 }
}
// Los objetivos manuales (Perfil) siempre tienen prioridad sobre el cálculo automático.
export function getTargets(p, manual = {}) {
  const t = autoTargets(p)
  ;['kcal', 'prot', 'carb', 'fat', 'agua'].forEach((k) => { if (Number(manual?.[k]) > 0) t[k] = Number(manual[k]) })
  return t
}
export const goalPct = (inicio, actual, meta) =>
  inicio === meta ? 100 : Math.max(0, Math.min(100, ((inicio - actual) / (inicio - meta)) * 100))
