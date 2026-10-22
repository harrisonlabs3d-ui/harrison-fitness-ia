import { addDays, toISODate } from './dateUtils'
import { buildHabitData, getDayHabits, earliestHabitDate, habitMode, fmtDuration } from './habitCalculations'
import { weekStart } from './trainingCalculations'
import { daysBetween } from './progressCalculations'
import { productInventory, isLowStock, missingInfo, supplementAdherence } from './supplementCalculations'
import { isPrescribed, CAT_LABEL } from '../data/supplements'

// Motor de análisis por REGLAS LOCALES y transparentes. No usa IA externa ni red.
// Cada observación incluye: qué datos la sustentan, el periodo, si son datos reales o estimaciones y la regla aplicada.
// Principios: no diagnostica, no sugiere comprar suplementos, no toca pautas médicas y no afirma causalidad.

export const CAUSALITY_NOTE = 'Es una observación descriptiva de tus registros; dos datos que coinciden no prueban que uno cause al otro.'
export const MIN_LOGGED_DAYS = 4

// Modo del análisis: REAL siempre que exista algún dato real. DEMO solo si no hay nada real y el demo está activo.
export function insightMode(d) {
  return d.demo.active && habitMode(d) === 'demo' && d.supplements.length === 0 ? 'demo' : 'real'
}

export function buildInsightContext(d, t, now = new Date()) {
  const today = toISODate(now), mode = insightMode(d), demo = mode === 'demo'
  // En modo real se fuerza hd real (sin demo) y los suplementos reales; en demo todo sale del demo.
  const hd = buildHabitData(demo ? d : { ...d, demo: { ...d.demo, active: false } }, t, today)
  const wd = d.wellnessSettings.analysisDays, to = addDays(today, -1), from = addDays(to, -(wd - 1))
  const weights = (demo ? d.demo.progress : d.realProgress).filter((r) => Number(r.weight) > 0).map((r) => ({ date: r.date, value: Number(r.weight) })).sort((a, b) => (a.date < b.date ? -1 : 1))
  const products = (demo ? d.supplementDemo.products : d.supplements).filter((p) => !p.archived)
  const logs = demo ? d.supplementDemo.logs : d.supplementLogs
  return { today, now, mode, demo, hd, from, to, days: wd, weights, products, logs, profile: d.profile, targets: t, settings: d.wellnessSettings, sleepGoalMin: hd.goals.sleepMin }
}

const r0 = Math.round
const dayList = (from, to) => { const out = []; for (let x = from; x <= to; x = addDays(x, 1)) out.push(x); return out }
const avg = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : null)

export function generateInsights(ctx) {
  const { hd, from, to, today, settings } = ctx, out = [], first = earliestHabitDate(hd)
  const wk = weekStart(today), period = { from, to, days: ctx.days }
  const days = dayList(from, to).map((date) => getDayHabits(hd, date)).filter((x) => first && x.date >= first)
  const by = (day, id) => day.habits.find((h) => h.id === id)
  const add = (o) => out.push({ source: ctx.mode, period, kind: 'real', ...o, id: `${o.ruleId}${o.productId ? ':' + o.productId : ''}:${wk}` })

  // ---- cobertura general ----
  const withData = days.filter((x) => x.hasData)
  if (withData.length < MIN_LOGGED_DAYS) {
    add({ ruleId: 'cobertura', type: 'insufficient', title: 'Datos insuficientes', message: 'No hay suficiente información para evaluar tus tendencias.', missing: `Registros en al menos ${MIN_LOGGED_DAYS} días del periodo (comidas, agua, entrenamiento o sueño). Tienes ${withData.length}.`, evidence: [`Días con algún registro en el periodo: ${withData.length} de ${days.length}`], rule: `Se necesitan ≥ ${MIN_LOGGED_DAYS} días con registros para comparar contra tus objetivos.` })
  }

  // ---- proteína ----
  const goalP = hd.goals.protein, logged = days.filter((x) => by(x, 'nutrition').logged > 0)
  if (logged.length < MIN_LOGGED_DAYS) {
    if (withData.length >= MIN_LOGGED_DAYS || logged.length > 0) add({ ruleId: 'proteina', type: 'insufficient', title: 'Proteína', message: 'No hay suficiente información para evaluar esta tendencia.', missing: `Registrar tus comidas al menos ${MIN_LOGGED_DAYS} días (hay ${logged.length}).`, evidence: [`Días con comidas registradas: ${logged.length}`], rule: 'Compara la proteína registrada con tu objetivo diario solo en días con comidas registradas.' })
  } else {
    const low = logged.filter((x) => by(x, 'protein').value < goalP * 0.85), mean = avg(logged.map((x) => by(x, 'protein').value))
    const ev = [`${low.length} de ${logged.length} días con registro quedaron por debajo del 85 % de tu objetivo (${goalP} g).`, `Promedio de los días registrados: ${r0(mean)} g.`, `Los días sin registro (${days.length - logged.length}) no se cuentan.`]
    const sp = ctx.products.find((p) => p.category === 'proteina')
    if (sp) { const a = supplementAdherence([sp], ctx.logs, addDays(to, -6), to); if (a.planned) ev.push(`Tu producto registrado "${sp.name}": ${a.taken} de ${a.planned} tomas planificadas en 7 días (dato descriptivo).`) }
    if (low.length >= 3 && low.length / logged.length >= 0.4) add({ ruleId: 'proteina', type: 'attention', title: 'Proteína por debajo de tu objetivo', message: 'Tu registro de proteína estuvo por debajo de tu objetivo en varios días. Revisa primero tus comidas y fuentes de proteína.', evidence: ev, rule: 'Se marca cuando ≥ 3 días y ≥ 40 % de los días registrados quedan bajo el 85 % del objetivo.', note: CAUSALITY_NOTE })
    else add({ ruleId: 'proteina', type: 'ok', title: 'Proteína', message: `Tu proteína registrada se mantuvo cerca de tu objetivo (promedio ${r0(mean)} g de ${goalP} g).`, evidence: ev, rule: 'No se cumple la condición de alerta (≥ 3 días y ≥ 40 % bajo el 85 % del objetivo).' })
  }

  // ---- calorías ----
  if (logged.length >= MIN_LOGGED_DAYS) {
    const kc = avg(logged.map((x) => by(x, 'nutrition').value)), g = hd.goals.kcal, pct = (kc / g) * 100
    if (pct < 80 || pct > 115) add({ ruleId: 'calorias', type: 'info', title: 'Calorías registradas', message: `Tu promedio registrado (${r0(kc)} kcal) está ${pct < 80 ? 'por debajo' : 'por encima'} de tu objetivo (${g} kcal). Verifica que estés registrando todo lo que comes antes de sacar conclusiones.`, evidence: [`Promedio de ${logged.length} días con registro: ${r0(kc)} kcal (${r0(pct)} % del objetivo).`], rule: 'Se muestra cuando el promedio queda fuera del 80–115 % del objetivo.', note: CAUSALITY_NOTE })
  }

  // ---- entrenamiento ----
  const sched = days.filter((x) => by(x, 'training').scheduled)
  if (sched.length >= 3) {
    const done = sched.filter((x) => by(x, 'training').status === 'completed').length
    if (done / sched.length < 0.6) add({ ruleId: 'entrenamiento', type: 'attention', title: 'Entrenamientos pendientes', message: `Completaste ${done} de ${sched.length} entrenamientos programados. Revisa tu planificación, tu descanso y tu constancia antes de cambiar tu suplementación.`, evidence: [`Días programados en el periodo: ${sched.length}; con sesión registrada: ${done}.`], rule: 'Se marca cuando se completa menos del 60 % de los días de entrenamiento programados (mínimo 3).', note: CAUSALITY_NOTE })
  }

  // ---- sueño ----
  const sl = days.filter((x) => by(x, 'sleep').record)
  if (sl.length < MIN_LOGGED_DAYS) {
    if (withData.length >= MIN_LOGGED_DAYS) add({ ruleId: 'sueno', type: 'insufficient', title: 'Sueño', message: 'No hay suficiente información para evaluar esta tendencia.', missing: `Registrar tu hora de dormir y despertar al menos ${MIN_LOGGED_DAYS} noches (hay ${sl.length}).`, evidence: [`Noches registradas: ${sl.length}`], rule: 'Compara la duración registrada con tu meta personal de sueño.' })
  } else {
    const m = avg(sl.map((x) => by(x, 'sleep').value)), goal = ctx.sleepGoalMin
    if (m < goal - 45) add({ ruleId: 'sueno', type: 'attention', title: 'Descanso por debajo de tu meta', message: `Tu sueño registrado promedió ${fmtDuration(r0(m))}, por debajo de tu meta personal de ${fmtDuration(goal)}. Revisa tu horario de descanso. Es un dato orientativo, no un diagnóstico.`, evidence: [`Promedio de ${sl.length} noches registradas: ${fmtDuration(r0(m))}.`, `Meta personal configurada: ${fmtDuration(goal)}.`], rule: 'Se marca cuando el promedio queda más de 45 min por debajo de tu meta.', note: CAUSALITY_NOTE })
  }

  // ---- hidratación ----
  const wd = days.filter((x) => by(x, 'water').value > 0)
  if (wd.length >= MIN_LOGGED_DAYS) {
    const ok = wd.filter((x) => by(x, 'water').progress >= 0.8).length
    if (ok / wd.length < 0.5) add({ ruleId: 'agua', type: 'info', title: 'Hidratación', message: `Alcanzaste al menos el 80 % de tu objetivo personal de agua en ${ok} de ${wd.length} días con registro.`, evidence: [`Objetivo personal: ${hd.goals.waterMl} ml.`, `Días con agua registrada: ${wd.length}.`], rule: 'Se muestra cuando menos de la mitad de los días registrados llega al 80 % del objetivo.' })
  }

  // ---- progreso (peso) ----
  const w28 = ctx.weights.filter((w) => w.date >= addDays(today, -27) && w.date <= today)
  const span = w28.length ? daysBetween(w28[0].date, w28[w28.length - 1].date) : 0
  if (w28.length < 3 || span < 14) {
    add({ ruleId: 'progreso', type: 'insufficient', title: 'Progreso', message: 'No hay suficiente información para evaluar esta tendencia.', missing: `Al menos 3 registros de peso separados por ≥ 14 días en las últimas 4 semanas (tienes ${w28.length} en ${span} días).`, evidence: [`Registros de peso en 28 días: ${w28.length}`], rule: 'La tendencia de peso necesita varios registros repartidos en el tiempo.', period: { from: addDays(today, -27), to: today, days: 28 } })
  } else {
    const a = w28[0], b = w28[w28.length - 1], ch = Math.round((b.value - a.value) * 10) / 10, obj = ctx.profile.objetivo
    const ev = [`Primer registro: ${a.value} kg (${a.date}); último: ${b.value} kg (${b.date}).`, `Registros en el periodo: ${w28.length}.`, `Objetivo declarado en tu perfil: ${obj}.`]
    const p28 = { from: addDays(today, -27), to: today, days: 28 }
    if (Math.abs(ch) < 0.3) add({ ruleId: 'progreso', type: 'attention', title: 'Sin cambios claros en el peso', message: 'Tu progreso no muestra cambios claros en el periodo registrado. Revisa la consistencia de tus datos, alimentación, entrenamiento y descanso antes de cambiar tu suplementación.', evidence: ev, rule: 'Se marca cuando el cambio de peso del periodo es menor a 0,3 kg.', note: CAUSALITY_NOTE, period: p28 })
    else if ((obj === 'perdida' && ch > 0.5) || (obj === 'ganancia' && ch < -0.5)) add({ ruleId: 'progreso', type: 'attention', title: 'Peso distinto a tu objetivo', message: `Tu peso cambió ${ch > 0 ? '+' : ''}${ch} kg, en dirección distinta a tu objetivo. Revisa primero tus registros de alimentación, entrenamiento y descanso.`, evidence: ev, rule: 'Se marca cuando el cambio (> 0,5 kg) va contra el objetivo del perfil.', note: CAUSALITY_NOTE, period: p28 })
    else add({ ruleId: 'progreso', type: 'ok', title: 'Tendencia de peso', message: `Tu peso cambió ${ch > 0 ? '+' : ''}${ch} kg en ${span} días de registros.`, evidence: ev, rule: 'No se cumple ninguna condición de alerta.', period: p28 })
  }

  // ---- productos ----
  ctx.products.forEach((p) => {
    const inv = productInventory(p, ctx.logs, today), mi = missingInfo(p)
    if (mi.length) add({ ruleId: 'info', productId: p.id, type: 'info', title: `Información incompleta: ${p.name}`, message: `Faltan datos de este producto: ${mi.join(', ')}. Complétalos para que el inventario y los gastos sean más fiables.`, evidence: [`Categoría: ${CAT_LABEL[p.category]}.`, `Datos que faltan: ${mi.join(', ')}.`], rule: 'Se revisan campos clave del producto (ingredientes, porciones, fuente, costo; en prescritos, profesional y pauta).', period: null })
    if (inv.remaining != null && isLowStock(inv, settings.lowStockDays)) {
      add({ ruleId: 'stock', productId: p.id, type: 'attention', kind: 'estimate', title: `Inventario: ${p.name}`, message: inv.remaining <= 0 ? `Según tus registros, el inventario estimado de ${p.name} está agotado.` : `${p.name} está próximo a agotarse según el consumo registrado: quedan ~${inv.remaining} ${p.servingUnit}(s)${inv.daysLeft != null ? ` (~${inv.daysLeft} días)` : ''}.`,
        evidence: [`Porciones compradas: ${inv.total}; registradas como consumidas: ${r0(inv.consumed * 10) / 10}.`, inv.rate ? `Ritmo ${inv.rateKind === 'registrado' ? 'calculado de tus registros (14 días)' : 'planificado en tu horario'}: ${inv.rate} por día.` : 'No hay ritmo de consumo para estimar la duración.', 'Es una ESTIMACIÓN: no sabe si compraste más o consumiste sin registrar.'], rule: `Se marca cuando el inventario estimado alcanza para ${settings.lowStockDays} días o menos.`, period: null })
    }
    const a = supplementAdherence([p], ctx.logs, addDays(to, -6), to)
    if (a.planned >= 3 && a.pct < 60) add({ ruleId: 'cumplimiento', productId: p.id, type: 'info', title: `Cumplimiento: ${p.name}`, message: isPrescribed(p.category) ? `Registraste ${a.taken} de ${a.planned} recordatorios de tu pauta en 7 días. Si algo no coincide con lo indicado, consúltalo con el profesional que la prescribió.` : `Registraste ${a.taken} de ${a.planned} tomas planificadas en 7 días. Si el horario no te funciona, puedes ajustarlo.`, evidence: [`Tomas planificadas (7 días): ${a.planned}; registradas: ${a.taken} (${a.pct} %).`], rule: 'Se muestra cuando el cumplimiento de tu propio horario es menor al 60 % (mínimo 3 tomas planificadas).', period: { from: addDays(to, -6), to, days: 7 } })
  })
  return out
}

// Orden: atención → información → datos insuficientes → bien.
const ORDER = { attention: 0, info: 1, insufficient: 2, ok: 3 }
export const sortInsights = (list) => [...list].sort((a, b) => ORDER[a.type] - ORDER[b.type])
