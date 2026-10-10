# Harrison Fitness IA

Tu entrenamiento. Tu alimentación. Tu progreso.

Motor nutricional v1 (Fase 2) sobre el MVP 1.1 de una app web personal (React + Vite + Tailwind CSS 4 + Lucide + Recharts + Framer Motion). Los datos se guardan en `localStorage` en claves separadas (`harrison_profile`, `harrison_real_progress`, `harrison_photos`, `harrison_nutrition`, `harrison_workouts`, `harrison_settings`, `harrison_demo`); los datos DEMO nunca se mezclan con los reales. Las fotos se reducen a 1024 px (JPEG) y no salen del navegador; no hay backend, autenticación ni IA real todavía.

## Comandos
```
npm install
npm run dev       # desarrollo
npm run build     # build de producción en dist/
npm run preview   # previsualizar el build
```

## Estructura
- `src/pages`: Dashboard, Nutrition, Workout, Progress, Profile
- `src/components`: ui (Card, Bar, Field…) y Chart
- `src/data/demoData.js`: perfil inicial, alimentos referenciales, rutinas y datos demo
- `src/utils`: `calculations` (IMC, calorías, macros), `storage` (saveData/loadData/updateData/clearData), `ia` (punto para conectar la API en la Fase 6)

## Notas
- Calorías y macros son estimaciones orientativas (Mifflin-St Jeor × actividad ± objetivo), no una prescripción médica. Se pueden reemplazar en Perfil.
- Los valores de alimentos son referenciales por 100 g.
- Harrison IA es una respuesta simulada; `src/utils/ia.js` es el único lugar a cambiar para conectar una API.
- Pendiente para próximas fases: base nutricional completa, recetas, Supabase, lista de compras, suplementos y recordatorios.

## Fase 2 — Motor nutricional
- `src/data/foods.js` (49 alimentos, valores referenciales por 100 g / 100 ml / unidad), `recipes.js` (20 recetas de ejemplo), `demoNutrition.js` (comidas y agua DEMO).
- `src/utils/nutritionCalculations.js`: `calculateFoodMacros`, `calculateDailyTotals`, `calculateRemainingMacros`, `calculateMacroPercentage`, `calculateWeeklyAverage`, `calculateRecipeMacros`, `calculateCaloriesFromMacros`, `getIngredientsUsed` (base de la futura lista de compras).
- `src/utils/dateUtils.js`: fechas siempre en el calendario local (no UTC).
- `src/utils/menuGenerator.js`: generador local de menú (sin IA) y detección de alimentos en texto.
- `src/hooks/useNutrition.js`, `useWater.js`: registros, totales y agua de una fecha; muestran el DEMO solo mientras no haya registros reales.
- Claves nuevas: `harrison_favorites`, `harrison_food_history`, `harrison_recipes` (reservada para recetas propias, aún vacía).

## Fase 3 — Entrenamiento inteligente
- `src/data/exercises.js` (biblioteca de ejercicios con campos image/video preparados), `routines.js` (4 rutinas iniciales editables), `demoTraining.js` (4 semanas de sesiones DEMO).
- `src/utils/trainingCalculations.js`: volumen, semanas, doble progresión, récords personales, recuperación descriptiva y `generateTrainingInsight()` (punto único para una IA futura). `routineGenerator.js`: generador local por reglas.
- `src/hooks/useTraining.js`: sesión activa, finalizar y rutinas; el DEMO solo se muestra mientras no haya sesiones reales.
- `src/components/training/`: SessionRunner, SetLogger, RestTimer, WorkoutSummary, RoutineEditor, ExerciseSelector, RoutineGenerator, TrainingHistory, WorkoutCalendar, TrainingStats.
- Claves: `harrison_training` (rutinas), `harrison_sessions`, `harrison_exercises` (reservada para ejercicios propios), `harrison_training_settings` (descanso, RIR/RPE y sesión activa), `harrison_training_demo`. Las sesiones antiguas de `harrison_workouts` se convierten al nuevo formato y la clave vieja se conserva como respaldo.
- Las sugerencias de progresión son orientativas; no son un diagnóstico ni reemplazan a un entrenador.

## Fase 4 — Motor de progreso inteligente
- `src/utils/progressCalculations.js`: `calculateWeightChange`, `calculateWaistChange`, `calculateGoalProgress`, `calculateTrainingAdherence`, `calculateNutritionAdherence`, `calculateWeeklySummary`, `calculateMonthlySummary`, `getProgressTimeline`, `generateProgressInsight`, `getProgressReportData` y `getCurrentProgressContext` (base para el motor de hábitos). Todo se calcula desde los datos guardados; no se almacenan derivados.
- `src/hooks/useProgress.js` arma los datos de entrada: usa DEMO solo en módulos sin datos reales (siempre con la etiqueta MODO DEMO); los insights se generan solo con datos reales.
- `src/components/progress/`: ProgressOverview, WeightProgress/WaistProgress (`MetricProgress`), GoalProgress, WeeklySummary/MonthlySummary, TrainingProgress, NutritionProgress, ProgressTimeline, EvolutionPhotos (comparador), ProgressChart y MeasurementForm.
- Clave nueva: `harrison_progress_settings` (rango, métrica y filtro elegidos). El DEMO se regenera (cintura y ~4 semanas de nutrición) sin tocar datos reales.

## Fase 5 — Motor de hábitos
- `src/utils/habitCalculations.js`: `calculateHabitCompletion`, `calculateDailyConsistency`, `calculateWeeklyConsistency`, `calculateStreak`/`calculateBestStreak`, `getApplicableHabits`, `getPendingHabits`, `generateHabitInsight`, `getNextAction` y `getHabitContext()` (contexto para la futura IA). Todo se deriva de los datos guardados.
- Los hábitos no duplican datos: agua (`harrison_water`), proteína y nutrición (`harrison_nutrition`) y entrenamiento (sesiones reales) se leen de sus módulos; solo sueño (`harrison_sleep`) y actividad (`harrison_activity`) se guardan aquí. Proteína y calorías vienen del Perfil/Nutrición; el agua se comparte con Nutrición.
- Claves: `harrison_habits` (hábitos propios y checks, solo estructura), `harrison_sleep`, `harrison_activity`, `harrison_habit_settings` (sueño 8 h, 8000 pasos, racha 70 %, días de entrenamiento y estructura de recordatorios) y `harrison_habit_demo`.
- Modo estricto REAL/DEMO: el demo solo se muestra si no existe ningún dato real de hábitos y nunca cuenta en consistencia ni rachas reales.
- Reglas: consistencia = hábitos completados ÷ aplicables × 100; el entrenamiento solo aplica en días programados (o con sesión real); racha = días consecutivos con ≥ 70 % y con datos; hoy en curso no la rompe; un día sin registro la corta.
- No hay notificaciones push: `habitSettings.reminders` solo prepara la estructura para la Fase 6.

## Fase 6 — Agenda inteligente y recordatorios
- `src/utils/scheduleCalculations.js`: `generateDailySchedule`, `getCurrentEvent`, `getNextEvent`, `getPendingEvents`, `calculateTimeUntilEvent`, `detectScheduleConflicts`, `getWeeklySchedule`, `generateDailySummary`, `generateTomorrowSummary`, `createReminder`/`updateReminder`/`deleteReminder`/`toggleReminder`, `rescheduleEvent` y `getScheduleContext()` (contexto para la futura IA). La agenda se construye desde Perfil, Nutrición, Entrenamiento, Hábitos y Progreso; no duplica sus datos.
- `src/utils/notificationService.js`: abstracción de canales (in-app y Browser Notification; push, email y WhatsApp quedan para el futuro). El permiso del navegador solo se pide al pulsar "Activar notificaciones". Los avisos solo funcionan con la app abierta.
- Horas siempre en hora local del dispositivo (`dateUtils`). La cuenta regresiva usa un único intervalo y se limpia al desmontar; la agenda se recalcula una vez por minuto.
- Claves: `harrison_schedule_settings`, `harrison_reminders`, `harrison_schedule_exceptions` (reprogramaciones y omisiones de un solo día), `harrison_notification_settings` (pausa y avisos ya mostrados) y `harrison_schedule_demo`.
- Despertar y dormir salen del Perfil; los cambios de horario solo se guardan al pulsar "Guardar configuración".
