// Punto único para conectar una API real en la Fase 6. Hoy devuelve una respuesta simulada.
export async function askHarrisonIA(prompt) {
  await new Promise((r) => setTimeout(r, 400))
  return `Con "${prompt}" puedo ayudarte a preparar una comida alta en proteína. La IA completa estará disponible en una próxima versión.`
}
