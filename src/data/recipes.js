import { calculateRecipeMacros } from '../utils/nutritionCalculations'

// Catálogo base de ejemplo (type: 'demo'): económicas, altas en proteína, ingredientes comunes en Perú.
// [id, nombre, descripción, categoría, minutos, ingredientes [foodId, cantidad, unidad], pasos]
const R = [
  ['pollo-arroz-verduras', 'Pollo con arroz y verduras', 'Plato completo y simple para el almuerzo.', 'Almuerzo', 25, [['pollo', 150, 'g'], ['arroz-blanco', 200, 'g'], ['zanahoria', 60, 'g'], ['brocoli', 80, 'g'], ['aceite-oliva', 5, 'ml']], ['Sazona y cocina el pollo a la plancha.', 'Saltea las verduras con el aceite.', 'Sirve con el arroz.']],
  ['tortilla-huevo-avena', 'Tortilla de huevo y avena', 'Desayuno rápido con avena y huevo.', 'Desayuno', 10, [['huevo', 3, 'unidad'], ['avena', 40, 'g'], ['tomate', 50, 'g'], ['aceite-oliva', 5, 'ml']], ['Bate los huevos con la avena.', 'Cocina en sartén con el aceite.', 'Acompaña con tomate.']],
  ['avena-platano-yogur', 'Avena con plátano y yogur', 'Sin cocina, lista en minutos.', 'Desayuno', 5, [['avena', 50, 'g'], ['platano', 1, 'unidad'], ['yogur', 150, 'g']], ['Mezcla la avena con el yogur.', 'Agrega el plátano en rodajas.']],
  ['pollo-camote', 'Pollo con camote', 'Combinación clásica de carbohidrato y proteína.', 'Almuerzo', 30, [['pollo', 150, 'g'], ['camote', 200, 'g'], ['tomate', 60, 'g'], ['lechuga', 50, 'g']], ['Sancocha el camote.', 'Cocina el pollo a la plancha.', 'Sirve con ensalada.']],
  ['atun-arroz', 'Atún con arroz', 'Opción económica y sin complicaciones.', 'Almuerzo', 10, [['atun', 120, 'g'], ['arroz-blanco', 180, 'g'], ['tomate', 80, 'g']], ['Calienta el arroz.', 'Mezcla el atún escurrido con tomate.', 'Sirve junto.']],
  ['lentejas-huevo', 'Lentejas con huevo', 'Menestra con arroz y huevo.', 'Almuerzo', 30, [['lentejas', 250, 'g'], ['huevo', 2, 'unidad'], ['arroz-blanco', 100, 'g']], ['Calienta las lentejas cocidas.', 'Prepara los huevos fritos o sancochados.', 'Sirve con arroz.']],
  ['quinua-pollo', 'Quinua con pollo', 'Quinua cocida con pollo y zanahoria.', 'Almuerzo', 25, [['quinua', 200, 'g'], ['pollo', 120, 'g'], ['zanahoria', 60, 'g']], ['Cocina la quinua.', 'Saltea el pollo con la zanahoria.', 'Mezcla y sirve.']],
  ['ensalada-pollo', 'Ensalada de pollo', 'Ligera y alta en proteína.', 'Cena', 15, [['pollo', 150, 'g'], ['lechuga', 80, 'g'], ['tomate', 80, 'g'], ['palta', 50, 'g'], ['aceite-oliva', 5, 'ml']], ['Desmenuza el pollo cocido.', 'Corta las verduras y la palta.', 'Mezcla con el aceite.']],
  ['tortilla-atun', 'Tortilla de atún', 'Cena rápida con huevo y atún.', 'Cena', 10, [['huevo', 2, 'unidad'], ['atun', 80, 'g'], ['cebolla', 30, 'g'], ['aceite-oliva', 5, 'ml']], ['Bate los huevos y mezcla con el atún.', 'Cocina con la cebolla y el aceite.']],
  ['arroz-pollo-sencillo', 'Arroz con pollo (versión sencilla)', 'Versión ligera del clásico.', 'Almuerzo', 35, [['arroz-blanco', 200, 'g'], ['pollo', 150, 'g'], ['zanahoria', 40, 'g'], ['maiz', 40, 'g']], ['Cocina el pollo en trozos.', 'Agrega el arroz cocido y las verduras.', 'Mezcla a fuego bajo.']],
  ['fideos-atun', 'Fideos con atún', 'Pasta económica con tomate y atún.', 'Almuerzo', 20, [['fideos', 200, 'g'], ['atun', 100, 'g'], ['tomate', 100, 'g']], ['Cocina los fideos.', 'Prepara una salsa con tomate y atún.', 'Mezcla.']],
  ['papa-huevo-ensalada', 'Papa con huevo y ensalada', 'Cena sencilla y saciante.', 'Cena', 20, [['papa', 250, 'g'], ['huevo', 2, 'unidad'], ['tomate', 80, 'g'], ['lechuga', 40, 'g']], ['Sancocha la papa y los huevos.', 'Sirve con la ensalada.']],
  ['frejoles-arroz-huevo', 'Frejoles con arroz y huevo', 'Menestra peruana básica.', 'Almuerzo', 30, [['frejoles', 200, 'g'], ['arroz-blanco', 150, 'g'], ['huevo', 1, 'unidad']], ['Calienta los frejoles.', 'Sirve con arroz y huevo frito.']],
  ['batido-avena-platano', 'Batido de avena y plátano', 'Desayuno o snack para llevar.', 'Snack', 5, [['leche', 250, 'ml'], ['avena', 40, 'g'], ['platano', 1, 'unidad'], ['mantequilla-mani', 10, 'g']], ['Licúa todo hasta que quede suave.']],
  ['pan-huevo-palta', 'Pan con huevo y palta', 'Desayuno clásico peruano.', 'Desayuno', 10, [['pan-integral', 2, 'unidad'], ['huevo', 2, 'unidad'], ['palta', 50, 'g']], ['Cocina los huevos.', 'Unta la palta en el pan.', 'Arma el sándwich.']],
  ['yogur-griego-fruta', 'Yogur griego con fruta y maní', 'Snack alto en proteína.', 'Snack', 5, [['yogur-griego', 200, 'g'], ['papaya', 100, 'g'], ['mani', 15, 'g'], ['miel', 5, 'g']], ['Sirve el yogur con papaya picada.', 'Agrega maní y miel.']],
  ['sudado-pescado', 'Sudado de pescado con arroz', 'Pescado al vapor con tomate y cebolla.', 'Cena', 25, [['pescado', 180, 'g'], ['arroz-blanco', 150, 'g'], ['tomate', 80, 'g'], ['cebolla', 40, 'g']], ['Sofríe cebolla y tomate.', 'Agrega el pescado y tapa hasta cocer.', 'Sirve con arroz.']],
  ['saltado-res', 'Saltado de res con arroz', 'Saltado casero con poco aceite.', 'Almuerzo', 25, [['carne-res', 150, 'g'], ['arroz-blanco', 180, 'g'], ['cebolla', 50, 'g'], ['tomate', 80, 'g'], ['aceite-oliva', 5, 'ml']], ['Saltea la carne a fuego alto.', 'Agrega cebolla y tomate.', 'Sirve con arroz.']],
  ['garbanzos-pollo', 'Garbanzos con pollo', 'Guiso rápido con legumbre.', 'Almuerzo', 25, [['garbanzos', 180, 'g'], ['pollo', 120, 'g'], ['tomate', 60, 'g']], ['Cocina el pollo con el tomate.', 'Agrega los garbanzos y calienta.']],
  ['manzana-mantequilla-mani', 'Manzana con mantequilla de maní', 'Snack de dos ingredientes.', 'Snack', 3, [['manzana', 1, 'unidad'], ['mantequilla-mani', 20, 'g']], ['Corta la manzana en gajos.', 'Acompaña con la mantequilla de maní.']],
]
export const RECIPE_MEAL = { Desayuno: 'desayuno', Almuerzo: 'almuerzo', Cena: 'cena', Snack: 'snack1' }
export const RECIPES = R.map(([id, name, description, category, prepTime, ing, instructions]) => {
  const ingredients = ing.map(([foodId, quantity, unit]) => ({ foodId, quantity, unit }))
  return { id, name, description, category, prepTime, ingredients, instructions, type: 'demo', ...calculateRecipeMacros(ingredients) }
})
