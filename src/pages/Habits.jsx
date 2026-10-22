import { useState } from 'react'
import { Card, Btn, Badge } from '../components/ui'
import HabitCard from '../components/habits/HabitCard'
import HabitChecklist from '../components/habits/HabitChecklist'
import HabitInsight, { Priorities, NextAction } from '../components/habits/HabitInsight'
import HabitStreak from '../components/habits/HabitStreak'
import WeekConsistency from '../components/habits/WeekConsistency'
import HabitCalendar, { DayDetail } from '../components/habits/HabitCalendar'
import SleepTracker from '../components/habits/SleepTracker'
import ActivityTracker from '../components/habits/ActivityTracker'
import DailyTimeline from '../components/habits/DailyTimeline'
import HabitStats from '../components/habits/HabitStats'
import HabitHistory from '../components/habits/HabitHistory'
import HabitSettings from '../components/habits/HabitSettings'
import { useHabits } from '../hooks/useHabits'
import { addDays, fmtLong } from '../utils/dateUtils'
import { weekStart } from '../utils/trainingCalculations'
import { getDayHabits, calculateStreaks, calculateWeeklyConsistency, getPendingHabits, getNextAction, generateHabitInsight, habitStats } from '../utils/habitCalculations'

const TABS = [['hoy', 'Hoy'], ['cal', 'Calendario'], ['hist', 'Historial'], ['stats', 'Estadísticas'], ['aj', 'Ajustes']]
const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })

export default function Habits({ d, setD, t, go }) {
  const H = useHabits(d, setD, t), { hd, today } = H
  const [tab, setTab] = useState('hoy')
  const [date, setDate] = useState(today)
  const [sel, setSel] = useState(today)
  const [range, setRange] = useState(30)
  const now = new Date()
  const isToday = date === today
  const day = getDayHabits(hd, date), st = calculateStreaks(hd), by = (id) => day.habits.find((h) => h.id === id)
  const pending = getPendingHabits(day), next = getNextAction(day, hd, now)

  const action = (h) => {
    if (h.id === 'water') return [250, 500].map((n) => <Btn key={n} className="min-h-11" onClick={() => H.addWater(date, n)}>+{n} ml</Btn>)
    if (h.id === 'protein' || h.id === 'nutrition') return <Btn variant="ghost" className="min-h-11" onClick={() => go('nut')}>Registrar comida</Btn>
    if (h.id === 'training') return h.applicable ? <Btn variant="ghost" className="min-h-11" onClick={() => go('wo')}>Ir a entrenar</Btn> : null
    if (h.id === 'sleep') return <Btn variant="ghost" className="min-h-11" onClick={() => scrollTo('sleep-tracker')}>{h.record ? 'Editar sueño' : 'Registrar sueño'}</Btn>
    if (h.id === 'activity') return <Btn variant="ghost" className="min-h-11" onClick={() => scrollTo('activity-tracker')}>{h.record ? 'Editar pasos' : 'Registrar pasos'}</Btn>
    return null
  }

  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold text-white">Hábitos</h1><p className="text-slate-400">¿Estás cumpliendo hoy las acciones que te acercan a tu objetivo?</p></div>
      <div role="tablist" aria-label="Secciones de hábitos" className="flex gap-2 overflow-x-auto">{TABS.map(([id, l]) => <Btn key={id} role="tab" aria-selected={tab === id} variant={tab === id ? 'primary' : 'ghost'} onClick={() => setTab(id)}>{l}</Btn>)}</div>
      {hd.demo && <p className="text-xs text-amber-400"><Badge kind="demo" /> Estás viendo hábitos de demostración. Al registrar tu primer dato real, el modo demo se oculta y no cuenta en tus rachas.</p>}

      {tab === 'hoy' && (
        <>
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-2">
            <Btn variant="ghost" aria-label="Día anterior" className="min-h-11" onClick={() => setDate(addDays(date, -1))}>←</Btn>
            <div className="text-center"><p className="font-semibold capitalize text-white">{isToday ? `Hoy, ${fmtLong(date)}` : fmtLong(date)}</p>{!isToday && <button className="text-xs text-blue-300" onClick={() => setDate(today)}>Ir a hoy</button>}</div>
            <Btn variant="ghost" aria-label="Día siguiente" className="min-h-11" disabled={date >= today} onClick={() => setDate(addDays(date, 1))}>→</Btn>
          </div>
          <Card title={isToday ? 'Hábitos de hoy' : 'Hábitos del día'}>
            <p className="text-3xl font-bold text-white" aria-live="polite">{day.completed} / {day.applicable.length} <span className="text-lg text-slate-300">{day.consistency}%</span></p>
            <p className="text-sm text-slate-300">{isToday ? 'Consistencia de hoy' : 'Consistencia del día'}: <b className="text-white">{day.consistency}%</b> <span className="text-slate-500">(hábitos completados ÷ hábitos aplicables × 100)</span></p>
            {!by('training').applicable && <p className="mt-1 text-xs text-slate-500">☾ Día de descanso: el entrenamiento no cuenta como pendiente.</p>}
          </Card>
          {isToday && <NextAction next={next} demo={hd.demo} />}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{day.habits.map((h) => <HabitCard key={h.id} h={h}>{action(h)}</HabitCard>)}</div>
          {isToday && <Priorities pending={pending} done={day.applicable.length > 0 && day.completed === day.applicable.length} />}
          <HabitChecklist day={day} demo={hd.demo} title={isToday ? 'Checklist de hoy' : 'Checklist del día'} />
          {isToday && <HabitInsight insights={generateHabitInsight(day, hd, now)} />}
          {st.current > 0 && <HabitStreak current={st.current} best={st.best} min={hd.streakMin} demo={hd.demo} />}
          {st.current === 0 && <HabitStreak current={0} best={st.best} min={hd.streakMin} demo={hd.demo} />}
          <WeekConsistency w={calculateWeeklyConsistency(hd, weekStart(date))} demo={hd.demo} />
          <SleepTracker date={date} record={hd.sleepBy[date]?.type === 'real' ? hd.sleepBy[date] : undefined} profile={d.profile} onSave={H.saveSleep} onRemove={H.removeSleep} />
          <ActivityTracker date={date} record={hd.actBy[date]?.type === 'real' ? hd.actBy[date] : undefined} onSave={H.saveActivity} onRemove={H.removeActivity} />
          {isToday && <DailyTimeline profile={d.profile} mealsToday={hd.mealsBy[today] || []} now={now} mealTimes={d.scheduleSettings.mealTimes} />}
        </>
      )}
      {tab === 'cal' && <HabitCalendar hd={hd} selected={sel} onSelect={setSel} />}
      {tab === 'hist' && <HabitHistory hd={hd} streak={st} onPick={(dt) => { setDate(dt); setTab('hoy') }} />}
      {tab === 'stats' && (<>
        <div className="flex gap-2" role="group" aria-label="Rango">{[7, 30, 90].map((n) => <Btn key={n} variant={range === n ? 'primary' : 'ghost'} aria-pressed={range === n} className="min-h-10 px-3 py-1 text-sm" onClick={() => setRange(n)}>{n} días</Btn>)}</div>
        <HabitStats s={habitStats(hd, range)} hd={hd} />
      </>)}
      {tab === 'aj' && <HabitSettings hd={hd} settings={d.habitSettings} targets={t} onPatch={H.patchSettings} onWaterGoal={H.setWaterGoal} />}
    </div>
  )
}
