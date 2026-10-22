import { useState } from 'react'
import { Btn } from '../components/ui'
import MyDay from '../components/wellness/MyDay'
import SupplementsPanel from '../components/wellness/SupplementsPanel'
import InsightsPanel from '../components/wellness/InsightsPanel'
import RoutineSettings from '../components/wellness/RoutineSettings'
import RestPanel from '../components/wellness/RestPanel'
import HistoryPanel from '../components/wellness/HistoryPanel'
import ReminderList from '../components/schedule/ReminderList'
import NotificationSettings from '../components/schedule/NotificationSettings'
import { useSchedule } from '../hooks/useSchedule'
import { useWellness } from '../hooks/useWellness'
import { useTraining } from '../hooks/useTraining'
import { useMinuteClock } from '../hooks/useClock'

const TABS = [['dia', 'Mi día'], ['supp', 'Suplementación'], ['ana', 'Análisis'], ['rec', 'Recordatorios'], ['hab', 'Hábitos y descanso'], ['hist', 'Historial']]

// Bienestar: suplementación, análisis por reglas, rutina diaria y recordatorios. Todo se apoya en la agenda, los hábitos y los módulos existentes.
export default function Wellness({ d, setD, t, go }) {
  const now = useMinuteClock()
  const S = useSchedule(d, setD, t, now), { sd } = S
  const W = useWellness(d, setD, t, now)
  const tr = useTraining(d, setD)
  const [tab, setTab] = useState('dia')
  const today = sd.today
  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold text-white">Bienestar</h1><p className="text-slate-400">Tu rutina diaria, tus suplementos y lo que dicen tus registros.</p></div>
      <div role="tablist" aria-label="Secciones de bienestar" className="flex gap-2 overflow-x-auto pb-1">{TABS.map(([id, l]) => <Btn key={id} role="tab" aria-selected={tab === id} variant={tab === id ? 'primary' : 'ghost'} className="shrink-0" onClick={() => setTab(id)}>{l}</Btn>)}</div>
      {tab === 'dia' && <MyDay sd={sd} S={S} tr={tr} go={go} today={today} />}
      {tab === 'supp' && <SupplementsPanel W={W} S={S} today={today} />}
      {tab === 'ana' && <InsightsPanel W={W} today={today} />}
      {tab === 'rec' && (<><RoutineSettings d={d} setD={setD} W={W} S={S} /><ReminderList reminders={sd.reminders} settings={sd.settings} S={S} /><NotificationSettings notif={d.notificationSettings} S={S} now={now} />
        <label className="flex items-center gap-2 text-sm text-slate-300">Minutos al pulsar «Posponer»<input type="number" min="1" max="120" value={d.wellnessSettings.snoozeMin} onChange={(e) => { const v = Number(e.target.value); if (Number.isInteger(v) && v >= 1 && v <= 120) W.patchWellness({ snoozeMin: v }) }} className="w-20 rounded-lg border border-slate-700 bg-slate-950 p-2 text-white" /></label></>)}
      {tab === 'hab' && <RestPanel d={d} setD={setD} t={t} sd={sd} W={W} today={today} />}
      {tab === 'hist' && <HistoryPanel sd={sd} W={W} />}
      <p className="text-xs text-slate-500">Tus datos se guardan solo en este navegador y no se sincronizan automáticamente entre dispositivos. Esta sección no da consejo médico ni sustituye a un profesional de la salud.</p>
    </div>
  )
}
