import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Home, Utensils, Dumbbell, TrendingUp, User, ListChecks, CalendarClock, Pill } from 'lucide-react'
import { loadAll, saveKey, KEYS } from './utils/storage'
import { savePhotos } from './utils/photoStorage'
import { getTargets } from './utils/calculations'
import Dashboard from './pages/Dashboard'
import Nutrition from './pages/Nutrition'
import Workout from './pages/Workout'
import Progress from './pages/Progress'
import Habits from './pages/Habits'
import Schedule from './pages/Schedule'
import Wellness from './pages/Wellness'
import NotificationCenter from './components/schedule/NotificationCenter'
import Profile from './pages/Profile'

const NAV = [['dash', 'Inicio', Home], ['nut', 'Nutrición', Utensils], ['wo', 'Entreno', Dumbbell], ['prog', 'Progreso', TrendingUp], ['hab', 'Hábitos', ListChecks], ['sch', 'Agenda', CalendarClock], ['wel', 'Bienestar', Pill], ['perf', 'Perfil', User]]

export default function App() {
  const [d, setD] = useState(loadAll)
  const [page, setPage] = useState('dash')
  const [day, setDay] = useState(0)
  const prev = useRef(d)
  // Cada clave se guarda por separado y solo cuando cambia. Las fotos se guardan al agregarlas/quitarlas.
  useEffect(() => {
    Object.keys(KEYS).forEach((k) => { if (k !== 'photos' && prev.current[k] !== d[k]) saveKey(k, d[k]) })
    if (prev.current.photos !== d.photos && d.photos.length === 0) savePhotos([])
    prev.current = d
  }, [d])
  const addPhoto = (ph) => { const next = [...d.photos, ph]; if (!savePhotos(next)) return false; setD({ ...d, photos: next }); return true }
  const removePhoto = (ph) => {
    if (ph.type === 'demo') return setD({ ...d, demo: { ...d.demo, photos: d.demo.photos.filter((x) => x.id !== ph.id) } })
    const next = d.photos.filter((x) => x.id !== ph.id); savePhotos(next); setD({ ...d, photos: next })
  }
  const t = getTargets(d.profile, d.settings.targets)
  const props = { d, setD, t, go: setPage, day, setDay, addPhoto, removePhoto }
  const View = { dash: Dashboard, nut: Nutrition, wo: Workout, prog: Progress, hab: Habits, sch: Schedule, wel: Wellness, perf: Profile }[page]

  return (
    <div className="min-h-screen md:flex">
      <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-800 bg-slate-950 md:static md:inset-auto md:w-56 md:flex-col md:gap-1 md:border-r md:border-t-0 md:p-3">
        <p className="hidden px-3 py-4 font-bold text-white md:block">Harrison Fitness IA</p>
        {NAV.map(([id, label, Icon]) => (
          <button key={id} onClick={() => setPage(id)} aria-current={page === id ? 'page' : undefined}
            className={`flex min-w-0 flex-1 flex-col items-center gap-1 px-0.5 py-3 text-[10px] md:flex-none md:flex-row md:gap-3 md:rounded-lg md:text-sm ${page === id ? 'text-blue-400 md:bg-slate-900' : 'text-slate-400 hover:text-white'}`}>
            <Icon size={20} aria-hidden="true" />{label}
          </button>
        ))}
      </nav>
      <NotificationCenter d={d} setD={setD} t={t} />
      <main className="mx-auto w-full max-w-3xl p-4 pb-24 md:pb-8">
        <motion.div key={page} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
          <View {...props} />
        </motion.div>
        <p className="mt-8 text-center text-xs text-slate-600">Tu entrenamiento. Tu alimentación. Tu progreso.</p>
      </main>
    </div>
  )
}
