import { KEYS } from './storage'

export const CATEGORIES = ['Frente', 'Perfil', 'Espalda', 'Otra']
const TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function validatePhoto({ file, date, note }) {
  if (!file) return 'Selecciona una foto.'
  if (!TYPES.includes(file.type)) return 'Formato no compatible. Usa JPG, PNG o WEBP.'
  if (file.size > 25 * 1024 * 1024) return 'La imagen es demasiado grande (máximo 25 MB).'
  if (!date || Number.isNaN(new Date(date + 'T00:00:00').getTime())) return 'Elige una fecha válida.'
  if ((note || '').length > 140) return 'La nota es demasiado larga (máximo 140 caracteres).'
  return ''
}

// Reduce a 1024 px y JPEG 0.8 para cuidar el límite de localStorage sin perder calidad visible.
export function compressImage(file, max = 1024, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k)
      const x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url); resolve(c.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo leer la imagen.')) }
    img.src = url
  })
}

// Devuelve false si el navegador se quedó sin espacio.
export const savePhotos = (photos) => { try { localStorage.setItem(KEYS.photos, JSON.stringify(photos)); return true } catch { return false } }
