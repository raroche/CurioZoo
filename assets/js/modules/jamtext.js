/**
 * jamtext.js — Zoo Traffic Jam's words, in English and Spanish.
 *
 * Every cart carries an animal, so it has a name a child can say: "the lion
 * cart", "the giraffe truck". The keeper's van is the one to get out.
 * tools/logiccheck.mjs holds the two languages to the same keys and {slots}.
 */

import { lookup } from './logictext.js';

export const JAM_TEXT = {
  en: {
    ask: "The keeper's van is stuck in a full parking lot. Slide the carts out of its way so it can drive out of the gate.",
    how: 'Tap a cart, then tap a dot to slide it there. Carts only slide the long way, and never jump. One slide is one move, however far it goes.',
    moves: 'Moves: {n}',
    fewest: 'Fewest possible: {n}',
    gate: 'Gate',
    van: "the keeper's van",
    cart: 'the {animal} cart',
    truck: 'the {animal} truck',
    rock: 'a rock',
    pick: 'Tap {name} again to let go, or tap a dot to slide it.',
    stuck: '{name} cannot slide: something is in the way at both ends.',
    slideTo: 'Slide {name} to column {c}, row {r}',
    carLabel: '{name}, {dir}, from column {c1} row {r1} to column {c2} row {r2}',
    dirH: 'slides left and right',
    dirV: 'slides up and down',
    restart: 'Start again',
    answer: 'Show the answer',
    answerShown: 'Watch: the van gets out in {n} moves. Next time, try it yourself first!',
    'hint.look': 'Look at the gate row: which carts stand between the van and the gate? Each of them must get out of that row.',
    'hint.next': 'Move {name} first.',
    'hint.did': 'There: {name} moved. Press Hint again for the next move.',
    'hint.solved': 'The way is clear: slide the van to the gate!',
    right: 'The van is out! The animals get their breakfast.',
    'why.fewest': 'The fewest moves for this lot is {min}. You used {n}.',
    'why.again': 'Play it again for ★★★: it can be done in {min}.',
    'why.twice': 'A cart had to move more than once: first to make room, then to get out of the way.',
    'why.back': 'The van had to back up first, away from the gate, to let another cart through.',
    'why.plan': 'Before you slide, ask: what has to move first so this one can move? That is planning backwards.',
    'tile.puzzle': 'Parking puzzle',
    'ch.e1': 'First Jam', 'ch.e1.idea': 'A small lot. Find the cart that blocks the van.',
    'ch.e2': 'The Big Lot', 'ch.e2.idea': 'More carts: some must move before others can.',
    'ch.e3': 'Trucks', 'ch.e3.idea': 'Long trucks take three squares. Make room for them.',
    'ch.m1': 'Busy Morning', 'ch.m1.idea': 'Plan two or three slides ahead.',
    'ch.m2': 'Rocks', 'ch.m2.idea': 'Rocks never move. Work around them.',
    'ch.m3': 'Rush', 'ch.m3.idea': 'Long jams where carts must move more than once.',
    'ch.h1': 'Gridlock', 'ch.h1.idea': 'Almost every cart is in the way of another.',
    'ch.h2': 'Rock Garden', 'ch.h2.idea': 'Deep jams with rocks to plan around.',
    'ch.h3': 'Master Keeper', 'ch.h3.idea': 'The longest jams in the zoo.',
    'lot.title': 'Your parking lots',
    'lot.lede': 'Every lot you clear gets a parking star. Clear one in the fewest moves for a gold sign.',
    'lot.count': '{n} of {t} cleared',
    'lot.gold': '{n} in the fewest moves'
  },
  es: {
    ask: 'La furgoneta del cuidador está atrapada en un aparcamiento lleno. Desliza los carritos para que pueda salir por la puerta.',
    how: 'Toca un carrito y luego toca un punto para deslizarlo hasta ahí. Los carritos solo se deslizan a lo largo y nunca saltan. Cada deslizamiento es un movimiento, llegue lo lejos que llegue.',
    moves: 'Movimientos: {n}',
    fewest: 'Lo mínimo posible: {n}',
    gate: 'Puerta',
    van: 'la furgoneta del cuidador',
    cart: 'el carrito {animal}',
    truck: 'el camión {animal}',
    rock: 'una roca',
    pick: 'Toca otra vez {name} para soltarlo, o toca un punto para deslizarlo.',
    stuck: '{name} no se puede deslizar: tiene algo delante por los dos lados.',
    slideTo: 'Desliza {name} a la columna {c}, fila {r}',
    carLabel: '{name}, {dir}, de la columna {c1} fila {r1} a la columna {c2} fila {r2}',
    dirH: 'se desliza a izquierda y derecha',
    dirV: 'se desliza arriba y abajo',
    restart: 'Empezar de nuevo',
    answer: 'Ver la respuesta',
    answerShown: 'Mira: la furgoneta sale en {n} movimientos. ¡La próxima vez, inténtalo tú primero!',
    'hint.look': 'Mira la fila de la puerta: ¿qué carritos hay entre la furgoneta y la puerta? Cada uno tiene que salir de esa fila.',
    'hint.next': 'Mueve primero {name}.',
    'hint.did': 'Listo: {name} se movió. Pulsa Pista otra vez para el siguiente movimiento.',
    'hint.solved': '¡El camino está libre: lleva la furgoneta hasta la puerta!',
    right: '¡La furgoneta salió! Los animales tendrán su desayuno.',
    'why.fewest': 'Lo mínimo para este aparcamiento son {min} movimientos. Tú usaste {n}.',
    'why.again': 'Juega otra vez para ★★★: se puede hacer en {min}.',
    'why.twice': 'Un carrito tuvo que moverse más de una vez: primero para hacer sitio y luego para quitarse de en medio.',
    'why.back': 'La furgoneta tuvo que retroceder primero, alejándose de la puerta, para dejar pasar a otro carrito.',
    'why.plan': 'Antes de deslizar, pregúntate: ¿qué tiene que moverse primero para que este pueda moverse? Eso es planear hacia atrás.',
    'tile.puzzle': 'Acertijo de aparcamiento',
    'ch.e1': 'Primer atasco', 'ch.e1.idea': 'Un aparcamiento pequeño. Encuentra el carrito que tapa la furgoneta.',
    'ch.e2': 'El gran aparcamiento', 'ch.e2.idea': 'Más carritos: algunos se tienen que mover antes que otros.',
    'ch.e3': 'Camiones', 'ch.e3.idea': 'Los camiones largos ocupan tres casillas. Hazles sitio.',
    'ch.m1': 'Mañana ajetreada', 'ch.m1.idea': 'Planea dos o tres deslizamientos por adelantado.',
    'ch.m2': 'Rocas', 'ch.m2.idea': 'Las rocas no se mueven nunca. Rodéalas.',
    'ch.m3': 'Hora punta', 'ch.m3.idea': 'Atascos largos donde los carritos se mueven más de una vez.',
    'ch.h1': 'Embotellamiento', 'ch.h1.idea': 'Casi todos los carritos estorban a otro.',
    'ch.h2': 'Jardín de rocas', 'ch.h2.idea': 'Atascos profundos con rocas que rodear.',
    'ch.h3': 'Cuidador experto', 'ch.h3.idea': 'Los atascos más largos del zoo.',
    'lot.title': 'Tus aparcamientos',
    'lot.lede': 'Cada aparcamiento que despejas gana una estrella. Despéjalo en lo mínimo posible para ganar un cartel dorado.',
    'lot.count': '{n} de {t} despejados',
    'lot.gold': '{n} en lo mínimo posible'
  }
};

export const jt = (key, lang, vars) => lookup(JAM_TEXT, key, lang, vars);

/**
 * A cart's name: "the lion cart" / "el carrito del león", "the giraffe
 * truck" / "el camión de la jirafa". Car 0 is the keeper's van.
 */
export function carName(i, len, animal, L, cap = false) {
  let t;
  if (i === 0) t = jt('van', L);
  else {
    const of = L === 'es' ? `${animal.es.art === 'la' ? 'de la' : 'del'} ${animal.es.n}` : animal.en;
    t = jt(len === 3 ? 'truck' : 'cart', L, { animal: of });
  }
  return cap ? t.charAt(0).toUpperCase() + t.slice(1) : t;
}

export default { JAM_TEXT, jt, carName };
