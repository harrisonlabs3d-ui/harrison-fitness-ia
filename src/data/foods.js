export const FOOD_NOTE = 'Valores nutricionales referenciales y aproximados. Podrán reemplazarse por una fuente más completa.'
export const CATEGORIES = ['Proteínas', 'Carbohidratos', 'Frutas', 'Verduras', 'Legumbres', 'Lácteos', 'Grasas', 'Otros']
export const MEAL_TYPES = [
  { id: 'desayuno', label: 'Desayuno', icon: '🍳', time: '05:00' },
  { id: 'snack1', label: 'Snack 1', icon: '🥗', time: '09:00' },
  { id: 'almuerzo', label: 'Almuerzo', icon: '🍛', time: '13:00' },
  { id: 'snack2', label: 'Snack 2', icon: '🥪', time: '16:30' },
  { id: 'cena', label: 'Cena', icon: '🍽️', time: '21:00' },
]
export const UNITS = ['g', 'ml', 'unidad', 'porción']

// [id, nombre, categoría, unidad base, tamaño de referencia, kcal, proteína, carbos, grasa, extra]
// Los valores son por `servingSize` de la unidad base (100 g / 100 ml / 1 unidad).
// extra.portion = cantidad de una "porción" (en unidad base); extra.unitSize = gramos de una "unidad".
const F = [
  ['pollo', 'Pollo (cocido)', 'Proteínas', 'g', 100, 165, 31, 0, 3.6, { portion: 150 }],
  ['pechuga-pollo', 'Pechuga de pollo (cruda)', 'Proteínas', 'g', 100, 120, 22.5, 0, 2.6, { portion: 150 }],
  ['huevo', 'Huevo', 'Proteínas', 'unidad', 1, 72, 6.3, 0.4, 4.8, { portion: 2 }],
  ['clara-huevo', 'Claras de huevo', 'Proteínas', 'g', 100, 52, 11, 0.7, 0.2, { portion: 100, unitSize: 33 }],
  ['atun', 'Atún (en agua)', 'Proteínas', 'g', 100, 116, 26, 0, 1, { portion: 120 }],
  ['bonito', 'Bonito', 'Proteínas', 'g', 100, 168, 25, 0, 7, { portion: 150 }],
  ['sardina', 'Sardina', 'Proteínas', 'g', 100, 208, 25, 0, 11, { portion: 100 }],
  ['pescado', 'Pescado blanco', 'Proteínas', 'g', 100, 120, 22, 0, 3, { portion: 150 }],
  ['carne-res', 'Carne de res (magra)', 'Proteínas', 'g', 100, 250, 26, 0, 15, { portion: 150 }],
  ['carne-molida', 'Carne molida (cocida)', 'Proteínas', 'g', 100, 272, 25, 0, 19, { portion: 120 }],
  ['pavo', 'Pavo', 'Proteínas', 'g', 100, 135, 30, 0, 1, { portion: 150 }],
  ['arroz-blanco', 'Arroz blanco (cocido)', 'Carbohidratos', 'g', 100, 130, 2.7, 28, 0.3, { portion: 200 }],
  ['arroz-integral', 'Arroz integral (cocido)', 'Carbohidratos', 'g', 100, 123, 2.7, 26, 1, { portion: 200 }],
  ['papa', 'Papa (cocida)', 'Carbohidratos', 'g', 100, 87, 1.9, 20, 0.1, { portion: 200, unitSize: 120 }],
  ['camote', 'Camote (cocido)', 'Carbohidratos', 'g', 100, 90, 2, 21, 0.1, { portion: 200 }],
  ['yuca', 'Yuca (cocida)', 'Carbohidratos', 'g', 100, 160, 1.4, 38, 0.3, { portion: 150 }],
  ['avena', 'Avena (hojuelas)', 'Carbohidratos', 'g', 100, 389, 17, 66, 7, { portion: 40 }],
  ['quinua', 'Quinua (cocida)', 'Carbohidratos', 'g', 100, 120, 4.4, 21, 1.9, { portion: 150 }],
  ['pan-integral', 'Pan integral', 'Carbohidratos', 'g', 100, 250, 10, 43, 4, { portion: 60, unitSize: 30 }],
  ['pan-frances', 'Pan francés', 'Carbohidratos', 'g', 100, 270, 9, 55, 1.5, { portion: 40, unitSize: 40 }],
  ['fideos', 'Fideos (cocidos)', 'Carbohidratos', 'g', 100, 158, 5.8, 31, 0.9, { portion: 200 }],
  ['maiz', 'Maíz choclo (cocido)', 'Carbohidratos', 'g', 100, 96, 3.4, 21, 1.5, { portion: 100 }],
  ['lentejas', 'Lentejas (cocidas)', 'Legumbres', 'g', 100, 116, 9, 20, 0.4, { portion: 200 }],
  ['frejoles', 'Frejoles (cocidos)', 'Legumbres', 'g', 100, 127, 8.7, 23, 0.5, { portion: 200 }],
  ['garbanzos', 'Garbanzos (cocidos)', 'Legumbres', 'g', 100, 164, 8.9, 27, 2.6, { portion: 150 }],
  ['platano', 'Plátano', 'Frutas', 'g', 100, 89, 1.1, 23, 0.3, { portion: 120, unitSize: 120 }],
  ['manzana', 'Manzana', 'Frutas', 'g', 100, 52, 0.3, 14, 0.2, { portion: 180, unitSize: 180 }],
  ['papaya', 'Papaya', 'Frutas', 'g', 100, 43, 0.5, 11, 0.3, { portion: 200 }],
  ['naranja', 'Naranja', 'Frutas', 'g', 100, 47, 0.9, 12, 0.1, { portion: 150, unitSize: 150 }],
  ['mandarina', 'Mandarina', 'Frutas', 'g', 100, 53, 0.8, 13, 0.3, { portion: 80, unitSize: 80 }],
  ['pina', 'Piña', 'Frutas', 'g', 100, 50, 0.5, 13, 0.1, { portion: 150 }],
  ['mango', 'Mango', 'Frutas', 'g', 100, 60, 0.8, 15, 0.4, { portion: 150 }],
  ['palta', 'Palta', 'Frutas', 'g', 100, 160, 2, 9, 15, { portion: 50, unitSize: 150 }],
  ['tomate', 'Tomate', 'Verduras', 'g', 100, 18, 0.9, 3.9, 0.2, { portion: 100 }],
  ['lechuga', 'Lechuga', 'Verduras', 'g', 100, 15, 1.4, 2.9, 0.2, { portion: 50 }],
  ['zanahoria', 'Zanahoria', 'Verduras', 'g', 100, 41, 0.9, 10, 0.2, { portion: 80 }],
  ['brocoli', 'Brócoli (cocido)', 'Verduras', 'g', 100, 34, 2.8, 7, 0.4, { portion: 100 }],
  ['cebolla', 'Cebolla', 'Verduras', 'g', 100, 40, 1.1, 9, 0.1, { portion: 50 }],
  ['leche', 'Leche entera', 'Lácteos', 'ml', 100, 61, 3.2, 4.8, 3.3, { portion: 250 }],
  ['yogur', 'Yogur natural', 'Lácteos', 'g', 100, 61, 3.5, 4.7, 3.3, { portion: 150 }],
  ['yogur-griego', 'Yogur griego', 'Lácteos', 'g', 100, 97, 9, 3.9, 5, { portion: 150 }],
  ['queso-fresco', 'Queso fresco', 'Lácteos', 'g', 100, 264, 18, 3, 20, { portion: 50 }],
  ['aceite-oliva', 'Aceite de oliva', 'Grasas', 'ml', 100, 810, 0, 0, 92, { portion: 10 }],
  ['mani', 'Maní', 'Grasas', 'g', 100, 567, 26, 16, 49, { portion: 30 }],
  ['almendras', 'Almendras', 'Grasas', 'g', 100, 579, 21, 22, 50, { portion: 30 }],
  ['mantequilla-mani', 'Mantequilla de maní', 'Grasas', 'g', 100, 588, 25, 20, 50, { portion: 20 }],
  ['whey', 'Proteína whey (polvo)', 'Otros', 'g', 100, 400, 80, 8, 6, { portion: 30 }],
  ['miel', 'Miel', 'Otros', 'g', 100, 304, 0.3, 82, 0, { portion: 10 }],
]
export const FOODS = F.map(([id, name, category, unit, servingSize, calories, protein, carbs, fat, x = {}]) =>
  ({ id, name, category, unit, servingSize, calories, protein, carbs, fat, portion: servingSize, ...x }))
export const FOODS_BY_ID = Object.fromEntries(FOODS.map((f) => [f.id, f]))
