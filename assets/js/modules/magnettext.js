/**
 * magnettext.js — every word Magnet Meerkats says, in English and Spanish.
 *
 * The "why" lines follow research-circuits-magnets.md section 10, and the
 * Spanish words section 11 (imán, polo norte y sur, se atraen y se repelen,
 * said here as "se abrazan" and "se empujan"). Things carry their Spanish
 * article. The Spanish is a draft owed a native read.
 */

import { lookup } from './logictext.js';

export const MAGNET_TEXT = {
  en: {
    'ch.e1': 'Hug or push?',
    'ch.e1.idea': 'Two magnet ends meet. Will they hug or push?',
    'ch.e2': 'Meerkat line',
    'ch.e2.idea': 'Turn the magnets so everyone in the line hugs.',
    'ch.e3': 'Does it stick?',
    'ch.e3.idea': 'Which things will the magnet pick up?',
    'ch.m1': 'Side by side',
    'ch.m1.idea': 'Lying side by side, which way should they point?',
    'ch.m2': 'Through the wall',
    'ch.m2.idea': 'Which magnet can drag the clip through the layers?',
    'ch.m3': 'Floating rings',
    'ch.m3.idea': 'Turn the rings so the tower floats just right.',
    'ch.h1': 'Hug and push',
    'ch.h1.idea': 'Some pairs hug and some push. Make the card come true.',
    'ch.h2': 'Which is the magnet?',
    'ch.h2.idea': 'Only a magnet can push. Find the real magnets.',
    'ch.h3': 'Compass clues',
    'ch.h3.idea': 'A compass needle follows a magnet’s pull.',

    'tile.pair': 'Hug or push', 'tile.huddle': 'Meerkat huddle', 'tile.stick': 'Does it stick', 'tile.reach': 'Through the wall',
    'tile.tower': 'Floating rings', 'tile.which': 'Which is the magnet', 'tile.compass': 'Compass',

    'ask.pair': 'Each gap has two magnet ends facing each other. Will they hug or push?',
    'ask.huddle': 'Tap a magnet to turn it round. Make every pair do what its badge says. Pinned 📌 magnets stay put.',
    'ask.huddleKey': '♥ means hug. ↔ means push.',
    'ask.stick': 'The meerkat swings a magnet over the tray. Which things will stick to it?',
    'ask.reach': 'Each magnet sits on top of {layers}, with a paper clip underneath. Which magnet can drag its clip along?',
    'ask.tower': 'Tap a ring to turn it over. Make the tower match the picture: floating gaps and touching rings. The bottom ring is glued.',
    'ask.which': 'These bars look the same. Some may be magnets, some plain iron, and some not magnetic at all. Read the cards. What is each bar?',
    'ask.needle': 'Which way will the compass needle’s N end point?',
    'ask.find': 'A magnet is hidden in the box. The compass needle points like this. Which end of the magnet is N?',

    hug: '♥ Hug', push: '↔ Push', yes: '🧲 Sticks', no: 'Doesn’t stick',
    'type.magnet': '🧲 Magnet', 'type.iron': 'Plain iron', 'type.plain': 'Not magnetic',
    'arrow.0': '⬆️ Up', 'arrow.1': '➡️ Right', 'arrow.2': '⬇️ Down', 'arrow.3': '⬅️ Left',
    'dir.0': 'up', 'dir.1': 'to the right', 'dir.2': 'down', 'dir.3': 'to the left',
    'end.0': '★ end', 'end.1': '◆ end', 'theEnd.0': 'the ★ end', 'theEnd.1': 'the ◆ end',
    gapN: 'Gap {n}', barN: 'Bar {x}', magnetN: 'Magnet {n}', ringN: 'Ring {n}',
    'card.pull': 'pull together', 'card.push': 'push apart', 'card.nothing': 'nothing happens',
    cardLine: '{a} {ea} meets {b} {eb}: {res}.',
    'endmark.0': '● end', 'endmark.1': '○ end',
    float: 'floats', touch: 'touches', 'goal.float': 'Floating gap', 'goal.touch': 'Touching',
    glued: 'glued', pinned: 'pinned', steel: 'steel bowl', crate: 'wooden crate',
    hidden: 'hidden magnet',
    'layer.paper': 'paper', 'layer.wood': 'wood', 'layer.water': 'water', 'layer.glass': 'glass', 'layer.plastic': 'plastic',
    layersN: '{n} layers', layers1: '1 layer', layersOf: '{nn} of {what}', stepsN: '{n} steps', steps1: '1 step',
    and: 'and',
    go: 'Test!',
    pickAll: 'Choose for every one first.',

    right: '✓ {res}, just as you said.',
    surprise: 'Surprise! {res}.',
    'res.gap.hug': 'Gap {n}: they hug', 'res.gap.push': 'Gap {n}: they push apart',
    'res.yes': '{It} sticks', 'res.no': '{It} doesn’t stick',
    'res.reach': 'Magnet {n} drags its clip',
    'res.which.magnet': 'Bar {x} is a magnet', 'res.which.iron': 'Bar {x} is plain iron', 'res.which.plain': 'Bar {x} is not magnetic (it is aluminium)',
    'res.needle': 'The needle points {dir}', 'res.find': 'The N end is {end}',
    matched: 'Every pair does what the card says!',
    towerMatched: 'The tower matches the picture!',
    notYet: 'Not yet: {n} surprised you. Look for 🤯.',
    pairsN: '{n} pairs', pairs1: '1 pair', gapsN: '{n} gaps', gaps1: '1 gap',
    tryMore: 'Turn some and test again.',

    'why.unlike': 'Different ends pull together: N meets S, so they hug.',
    'why.likeN': 'Same ends push apart: N meets N, so they push.',
    'why.likeS': 'Same ends push apart: S meets S, so they push.',
    'why.end': 'End to end, magnets hug when they point the same way.',
    'why.side': 'Side by side, magnets hug when they point opposite ways.',
    'why.steel': 'A steel bowl hugs either end. Steel turns into a little magnet for a while, so it is always pulled and never pushes.',
    'why.sticks': 'Magnets pull iron and steel.',
    'why.metalNo': 'It is a metal, but magnets don’t pull it. Not every metal sticks.',
    'why.notMetal': 'It is not iron or steel, so the magnet doesn’t pull it.',
    'why.reach': 'The pull goes right through {layers}. This magnet reaches {ss}, and the clip is {dd} away.',
    'why.size': 'Bigger doesn’t mean stronger. Count the ⚡, not the size.',
    'why.float': 'Same faces push, so the ring floats.',
    'why.touch': 'Different faces pull, so the rings touch.',
    'why.towerWeight': 'The lower gaps are smaller: they hold up more rings.',
    'why.magnet': 'It pushed another bar away, and only a magnet can push a magnet.',
    'why.iron': 'Both ends of a magnet pulled it. Iron is pulled by either end and never pushes.',
    'why.plain': 'Nothing pulled it or pushed it, so it is not magnetic.',
    'why.endSpot': 'Beyond an end, the needle lines up with the magnet: away from its N end, towards its S end.',
    'why.sideSpot': 'Beside the middle, the needle points the other way: towards the magnet’s S end.',
    'why.paint': 'The colours on a magnet are just paint. N and S tell you the ends.',
    'why.earth': 'Close to a magnet, the magnet’s pull on the needle is much stronger than the Earth’s.',
    safety: 'For grown-ups: tiny strong magnets are not toys for little ones. Swallowing them is very dangerous.',

    hintPair: 'Look at the two ends that face each other. Same letters push. Different letters hug.',
    hintHuddle: 'Start next to a pinned magnet 📌. End to end, a hug means pointing the same way. Side by side, a hug means pointing opposite ways.',
    hintHuddleMixed: 'A push is the other way round: end to end, point opposite ways; side by side, point the same way. Steel always hugs.',
    hintPlace: 'One magnet is now turned the right way and pinned.',
    hintStick: 'Magnets pull iron and steel. Being a metal is not enough.',
    hintReach: 'Count the layers. Then count each magnet’s ⚡. Size doesn’t matter.',
    hintTower: 'Start at the bottom. A floating gap needs the same faces meeting: N on N, or S on S.',
    hintTowerPlace: 'One ring is now turned the right way.',
    hintWhich: 'A push proves both bars are magnets. Iron is pulled by both ends of a magnet.',
    hintCompass: 'Outside a magnet, the pull goes from its N end round to its S end. The needle’s N end follows it.',

    't.clip': 'steel paper clip', 't.nail': 'iron nail', 't.steelcan': 'steel food can', 't.foil': 'aluminium foil',
    't.alcan': 'aluminium can', 't.copperwire': 'copper wire', 't.copperpipe': 'copper pipe', 't.gold': 'gold bar',
    't.silver': 'silver bar', 't.wood': 'wooden block', 't.pencil': 'pencil', 't.paper': 'sheet of paper', 't.sock': 'sock',
    't.balloon': 'rubber balloon', 't.grapes': 'bunch of grapes', 't.cup': 'plastic cup', 't.crayon': 'wax crayon'
  },
  es: {
    'ch.e1': '¿Abrazo o empujón?',
    'ch.e1.idea': 'Se juntan dos extremos de imán. ¿Se abrazan o se empujan?',
    'ch.e2': 'Fila de suricatas',
    'ch.e2.idea': 'Gira los imanes para que todos en la fila se abracen.',
    'ch.e3': '¿Se pega?',
    'ch.e3.idea': '¿Qué cosas levantará el imán?',
    'ch.m1': 'Lado a lado',
    'ch.m1.idea': 'Acostados lado a lado, ¿hacia dónde deben apuntar?',
    'ch.m2': 'A través de la pared',
    'ch.m2.idea': '¿Qué imán puede arrastrar el clip a través de las capas?',
    'ch.m3': 'Anillos flotantes',
    'ch.m3.idea': 'Gira los anillos para que la torre flote justo así.',
    'ch.h1': 'Abrazos y empujones',
    'ch.h1.idea': 'Unos pares se abrazan y otros se empujan. Haz que la tarjeta se cumpla.',
    'ch.h2': '¿Cuál es el imán?',
    'ch.h2.idea': 'Solo un imán puede empujar. Encuentra los imanes de verdad.',
    'ch.h3': 'Pistas de brújula',
    'ch.h3.idea': 'La aguja de una brújula sigue la fuerza del imán.',

    'tile.pair': 'Abrazo o empujón', 'tile.huddle': 'Abrazo de suricatas', 'tile.stick': '¿Se pega?', 'tile.reach': 'A través de la pared',
    'tile.tower': 'Anillos flotantes', 'tile.which': '¿Cuál es el imán?', 'tile.compass': 'Brújula',

    'ask.pair': 'En cada hueco se miran dos extremos de imán. ¿Se abrazan o se empujan?',
    'ask.huddle': 'Toca un imán para darle la vuelta. Haz que cada par haga lo que dice su insignia. Los imanes con chincheta 📌 no se mueven.',
    'ask.huddleKey': '♥ es abrazo. ↔ es empujón.',
    'ask.stick': 'La suricata pasa un imán sobre la bandeja. ¿Qué cosas se le pegarán?',
    'ask.reach': 'Cada imán está encima de {layers}, con un clip debajo. ¿Qué imán puede arrastrar su clip?',
    'ask.tower': 'Toca un anillo para darle la vuelta. Haz que la torre sea igual al dibujo: huecos flotantes y anillos que se tocan. El anillo de abajo está pegado.',
    'ask.which': 'Estas barras parecen iguales. Algunas pueden ser imanes, otras hierro común y otras nada magnéticas. Lee las tarjetas. ¿Qué es cada barra?',
    'ask.needle': '¿Hacia dónde apuntará la N de la aguja de la brújula?',
    'ask.find': 'Hay un imán escondido en la caja. La aguja de la brújula apunta así. ¿Qué extremo del imán es la N?',

    hug: '♥ Abrazo', push: '↔ Empujón', yes: '🧲 Se pega', no: 'No se pega',
    'type.magnet': '🧲 Imán', 'type.iron': 'Hierro común', 'type.plain': 'No magnético',
    'arrow.0': '⬆️ Arriba', 'arrow.1': '➡️ Derecha', 'arrow.2': '⬇️ Abajo', 'arrow.3': '⬅️ Izquierda',
    'dir.0': 'hacia arriba', 'dir.1': 'hacia la derecha', 'dir.2': 'hacia abajo', 'dir.3': 'hacia la izquierda',
    'end.0': 'Extremo ★', 'end.1': 'Extremo ◆', 'theEnd.0': 'el extremo ★', 'theEnd.1': 'el extremo ◆',
    gapN: 'Hueco {n}', barN: 'Barra {x}', magnetN: 'Imán {n}', ringN: 'Anillo {n}',
    'card.pull': 'se atraen', 'card.push': 'se empujan', 'card.nothing': 'no pasa nada',
    cardLine: '{a} {ea} toca {b} {eb}: {res}.',
    'endmark.0': 'extremo ●', 'endmark.1': 'extremo ○',
    float: 'flota', touch: 'toca', 'goal.float': 'Hueco flotante', 'goal.touch': 'Se tocan',
    glued: 'pegado', pinned: 'con chincheta', steel: 'tazón de acero', crate: 'caja de madera',
    hidden: 'imán escondido',
    'layer.paper': 'papel', 'layer.wood': 'madera', 'layer.water': 'agua', 'layer.glass': 'vidrio', 'layer.plastic': 'plástico',
    layersN: '{n} capas', layers1: '1 capa', layersOf: '{nn} de {what}', stepsN: '{n} pasos', steps1: '1 paso',
    and: 'y',
    go: '¡Prueba!',
    pickAll: 'Primero elige para cada uno.',

    right: '✓ {res}, como dijiste.',
    surprise: '¡Sorpresa! {res}.',
    'res.gap.hug': 'Hueco {n}: se abrazan', 'res.gap.push': 'Hueco {n}: se empujan',
    'res.yes': '{It} se pega', 'res.no': '{It} no se pega',
    'res.reach': 'El imán {n} arrastra su clip',
    'res.which.magnet': 'La barra {x} es un imán', 'res.which.iron': 'La barra {x} es hierro común', 'res.which.plain': 'La barra {x} no es magnética (es de aluminio)',
    'res.needle': 'La aguja apunta {dir}', 'res.find': 'La N es {end}',
    matched: '¡Cada par hace lo que dice la tarjeta!',
    towerMatched: '¡La torre es igual al dibujo!',
    notYet: 'Todavía no: {n} te sorprendieron. Busca 🤯.',
    pairsN: '{n} pares', pairs1: '1 par', gapsN: '{n} huecos', gaps1: '1 hueco',
    tryMore: 'Gira algunos y vuelve a probar.',

    'why.unlike': 'Los extremos distintos se atraen: la N toca la S, así que se abrazan.',
    'why.likeN': 'Los extremos iguales se empujan: la N toca la N, así que se empujan.',
    'why.likeS': 'Los extremos iguales se empujan: la S toca la S, así que se empujan.',
    'why.end': 'Punta con punta, los imanes se abrazan cuando apuntan hacia el mismo lado.',
    'why.side': 'Lado a lado, los imanes se abrazan cuando apuntan hacia lados opuestos.',
    'why.steel': 'Un tazón de acero abraza cualquier extremo. El acero se vuelve un imancito por un rato, así que siempre es atraído y nunca empuja.',
    'why.sticks': 'Los imanes atraen el hierro y el acero.',
    'why.metalNo': 'Es un metal, pero los imanes no atraen ese metal. No todos los metales se pegan.',
    'why.notMetal': 'No es de hierro ni de acero, así que el imán no lo atrae.',
    'why.reach': 'La fuerza pasa a través de {layers}. Este imán llega a {ss}, y el clip está a {dd}.',
    'why.size': 'Más grande no quiere decir más fuerte. Cuenta los ⚡, no el tamaño.',
    'why.float': 'Las caras iguales se empujan, así que el anillo flota.',
    'why.touch': 'Las caras distintas se atraen, así que los anillos se tocan.',
    'why.towerWeight': 'Los huecos de abajo son más pequeños: sostienen más anillos.',
    'why.magnet': 'Empujó a otra barra, y solo un imán puede empujar a un imán.',
    'why.iron': 'Los dos extremos de un imán la atrajeron. El hierro es atraído por cualquier extremo y nunca empuja.',
    'why.plain': 'Nada la atrajo ni la empujó, así que no es magnética.',
    'why.endSpot': 'Más allá de un extremo, la aguja se alinea con el imán: se aleja de su N y apunta hacia su S.',
    'why.sideSpot': 'Junto al centro, la aguja apunta al revés: hacia la S del imán.',
    'why.paint': 'Los colores de un imán son solo pintura. La N y la S te dicen los extremos.',
    'why.earth': 'Cerca de un imán, la fuerza del imán sobre la aguja es mucho más fuerte que la de la Tierra.',
    safety: 'Para adultos: los imanes pequeños y fuertes no son juguetes para los más chicos. Tragarlos es muy peligroso.',

    hintPair: 'Mira los dos extremos que se miran. Letras iguales se empujan. Letras distintas se abrazan.',
    hintHuddle: 'Empieza junto a un imán con chincheta 📌. Punta con punta, abrazo es apuntar hacia el mismo lado. Lado a lado, abrazo es apuntar hacia lados opuestos.',
    hintHuddleMixed: 'Un empujón es al revés: punta con punta, apuntan a lados opuestos; lado a lado, al mismo lado. El acero siempre abraza.',
    hintPlace: 'Ahora un imán está girado bien y tiene chincheta.',
    hintStick: 'Los imanes atraen el hierro y el acero. Ser de metal no basta.',
    hintReach: 'Cuenta las capas. Luego cuenta los ⚡ de cada imán. El tamaño no importa.',
    hintTower: 'Empieza por abajo. Un hueco flotante necesita caras iguales: N con N, o S con S.',
    hintTowerPlace: 'Ahora un anillo está girado bien.',
    hintWhich: 'Un empujón prueba que las dos barras son imanes. El hierro es atraído por los dos extremos de un imán.',
    hintCompass: 'Fuera de un imán, la fuerza va de su N hasta su S. La N de la aguja la sigue.',

    't.clip': 'el clip de acero', 't.nail': 'el clavo de hierro', 't.steelcan': 'la lata de acero', 't.foil': 'el papel de aluminio',
    't.alcan': 'la lata de aluminio', 't.copperwire': 'el cable de cobre', 't.copperpipe': 'el tubo de cobre', 't.gold': 'el lingote de oro',
    't.silver': 'el lingote de plata', 't.wood': 'el bloque de madera', 't.pencil': 'el lápiz', 't.paper': 'la hoja de papel', 't.sock': 'el calcetín',
    't.balloon': 'el globo de goma', 't.grapes': 'el racimo de uvas', 't.cup': 'el vaso de plástico', 't.crayon': 'el crayón de cera'
  }
};

export const mt = (key, lang, vars) => lookup(MAGNET_TEXT, key, lang, vars);

const cap1 = (x) => x.charAt(0).toUpperCase() + x.slice(1);

/** A thing's name: "the steel paper clip", "el clip de acero"; bare for a label. */
export function thingName(id, L, { cap = false, bare = false } = {}) {
  const name = MAGNET_TEXT[L === 'es' ? 'es' : 'en'][`t.${id}`];
  let text = L === 'es' ? name : `the ${name}`;
  if (bare) text = L === 'es' ? name.replace(/^(el|la) /, '') : name;
  return cap ? cap1(text) : text;
}

/** "paper, wood and water". */
export function listOf(items, L) {
  if (items.length < 2) return items.join('');
  return `${items.slice(0, -1).join(', ')} ${mt('and', L)} ${items[items.length - 1]}`;
}

const plural = (one, many) => (n, L) => mt(n === 1 ? one : many, L, { n });
export const layersN = plural('layers1', 'layersN');
export const stepsN = plural('steps1', 'stepsN');
export const pairsN = plural('pairs1', 'pairsN');
export const gapsN = plural('gaps1', 'gapsN');

export default { MAGNET_TEXT, mt, thingName, listOf, layersN, stepsN, pairsN, gapsN };
