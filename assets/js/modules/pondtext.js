/**
 * pondtext.js — every word Hippo Pond says, in English and Spanish.
 *
 * The things in the pond are named here (item.<id>), with their Spanish
 * article, so "the log" is "el tronco" and "the apple" is "la manzana" and a
 * sentence never has to guess. Numbers are written the way each language
 * writes them: 0.6 in English, 0,6 in Spanish.
 *
 * The one phrase every explanation leans on is "light for its size" / "heavy
 * for its size" ("ligero para su tamaño"): the research on children's ideas
 * about floating (research-hippo.md) is that weight alone is the wrong idea
 * and heaviness for size is the right one, so the game never says "light
 * things float".
 */

import { lookup } from './logictext.js';

export const POND_TEXT = {
  en: {
    'ch.e1': 'Float or sink?',
    'ch.e1.idea': 'A huge log and a tiny coin. Guess, then splash!',
    'ch.e2': 'The water twin',
    'ch.e2.idea': 'Weigh each thing against the same amount of water.',
    'ch.e3': 'Same stuff, any size',
    'ch.e3.idea': 'A giant one or a tiny one: does size change anything?',
    'ch.m1': 'Make it float',
    'ch.m1.idea': 'One change works. Which one?',
    'ch.m2': 'Cube rafts',
    'ch.m2.idea': 'Count the cubes, read the weight, decide.',
    'ch.m3': 'How low does it float?',
    'ch.m3.idea': 'How many rows of the raft go under the water?',
    'ch.h1': 'Heaviness for size',
    'ch.h1.idea': 'Every card has a number. Compare it with the liquid.',
    'ch.h2': 'The honey jar',
    'ch.h2.idea': 'Oil, water and honey in layers. Where does each block stop?',
    'ch.h3': 'The iceberg question',
    'ch.h3.idea': 'How much of a floating block is hidden under the surface?',

    'tile.tray': 'Float or sink',
    'tile.same': 'Same stuff',
    'tile.fix': 'Make it float',
    'tile.cubes': 'Cube rafts',
    'tile.depth': 'How low',
    'tile.layers': 'Layers',
    'tile.frac': 'How much is under',

    'ask.tray': 'Will each one float or sink? Choose for every one, then press Splash!',
    'ask.twin': 'Each thing is on a balance with its water twin: the same amount of water. Is it lighter or heavier than its twin?',
    'ask.num': 'Each card shows how heavy the thing is for its size. {Liq} is {l}. Will each one float or sink?',
    'ask.same': 'We tested this one. Now look at the others: they are made of exactly the same stuff.',
    'ask.fixFloat': '{It} sinks. Which change will make it float?',
    'ask.fixSink': '{It} floats. Which change will make it sink?',
    'ask.cubes': 'Each cube of water weighs 1. Will each raft float or sink?',
    'ask.depth': 'This raft floats. How many rows of cubes go under the water?',
    'ask.layers': 'Oil, water and honey sit in layers. Where will each block stop?',
    'ask.frac': 'This block is {d} for its size. {Liq} is {l}. How much of the block is under?',

    floats: 'Floats',
    sinks: 'Sinks',
    splash: 'Splash!',
    drop: 'Drop them in!',
    pickAll: 'Choose for every one first.',
    pickOne: 'Choose one first.',
    tested: 'Tested: it {v}',
    floatsV: 'floats',
    sinksV: 'sinks',
    twinLabel: 'water twin',
    twinHint: 'Water twin',
    twinShow: 'Put {it} on the balance with its water twin.',
    twinHeavier: '{It} is heavier than its water twin.',
    twinLighter: '{It} is lighter than its water twin.',
    weighs: 'weighs {w}',
    raftTag: 'Raft {n}: weighs {w}',
    raft: 'Raft {n}: {c} cubes, weighs {w}',
    rows: '{n} rows',
    row1: '1 row',
    block: 'Block {n}: {d}',
    hintCubes: 'Count the cubes in this raft. That is what its water twin weighs. Is the raft lighter or heavier?',
    hintDepth: 'The raft weighs {w}. Each row of {k} cubes pushes away {k} of water. How many rows make {w}?',
    hintLayers: 'Compare {d} with oil ({oil}), water ({water}) and honey ({honey}). It sinks through every liquid lighter than it.',
    hintFrac: 'Divide the block by the liquid: {d} ÷ {l}.',
    hintFix: 'Changing the size or the colour never changes floating. What changes how heavy it is for its size?',
    hintSame: 'It is the same stuff. Does the size change how heavy it is for its size?',

    'layer.0': 'On top of the oil',
    'layer.1': 'Between oil and water',
    'layer.2': 'Between water and honey',
    'layer.3': 'On the bottom',

    'liq.water': 'Water',
    'liq.salty': 'Very salty water',
    'liq.oil': 'Cooking oil',
    'liq.honey': 'Honey',
    'short.oil': 'Oil', 'short.water': 'Water', 'short.honey': 'Honey',

    'size.1': 'tiny', 'size.2': 'small', 'size.3': 'middle-sized', 'size.4': 'big', 'size.5': 'huge',

    'fix.boat': 'Press it into a boat shape',
    'fix.salt': 'Stir lots of salt into the water',
    'fix.honey': 'Use honey instead of water',
    'fix.float': 'Tie a big float to it',
    'fix.stone': 'Tie a heavy stone to it',
    'fix.half': 'Cut it in half',
    'fix.bigger': 'Use a bigger one',
    'fix.smaller': 'Use a smaller one',
    'fix.paint': 'Paint it a new colour',
    'fix.upside': 'Turn it upside down',

    'why.fix.boat': 'A boat shape is hollow, so it pushes away much more water than a ball does. The same stuff is now light for its size.',
    'why.fix.salt': 'Salt makes the water heavier for its size. Now {it} is lighter than the same amount of salty water.',
    'why.fix.honey': 'Honey is much heavier for its size than water, so {it} floats on it.',
    'why.fix.float': 'The float is very light for its size. Together they are lighter than the same amount of water.',
    'why.fix.stone': 'The stone is very heavy for its size. Together they are heavier than the same amount of water.',
    'why.fix.never': 'Cutting it, painting it, turning it or using another size does not change how heavy it is for its size. So it still does the same thing.',

    right: '✓ {It} {v}, just as you said.',
    still: '{It} still {v}.',
    worked: 'It worked! {It} {v}.',
    surprise: 'Surprise! {It} {v}.',
    'why.float': 'It is light for its size.',
    'why.sink': 'It is heavy for its size.',
    'why.floatBig': 'It is big and heavy, but it is light for its size. So it floats.',
    'why.sinkSmall': 'It is small and light, but it is heavy for its size. So it sinks.',
    'why.twinFloat': 'It is lighter than its water twin, so it floats.',
    'why.twinSink': 'It is heavier than its water twin, so it sinks.',
    'why.num': '{d} is {cmp} than {l}, so it {v}.',
    less: 'less', more: 'more',
    'why.same': 'Every piece of the same stuff is just as heavy for its size, whatever its size. So they all {v}.',
    'why.cubeFloat': 'This raft fills {c} cubes of water, so its water twin weighs {c}. It weighs {w}, less than {c}, so it floats.',
    'why.cubeSink': 'This raft fills {c} cubes of water, so its water twin weighs {c}. It weighs {w}, more than {c}, so it sinks.',
    'why.depth': 'A floater sinks until the water it pushes away weighs as much as it does. It weighs {w}, and each row pushes away {k}. So {r} under.',
    'why.layer': 'Block {n} ({d}) sinks through every liquid lighter than it for its size and stops on the first one that is heavier: {where}.',
    'why.frac': 'The part under is the block divided by the liquid: {d} ÷ {l} = {f}.',
    'why.ice': 'Ice is about 0.9 of water for its size, so about 9 parts in 10 are under. That is why most of an iceberg is hidden!',
    'why.idea.e1': 'Floating is not about being heavy or light. It is about being heavy or light for your size.',
    'why.idea.hippo': 'The hippo is heavy for its size too: it cannot float, so it walks and bounces along the bottom of the river.',

    'item.log': 'log',
    'item.ship': 'steel ship',
    'item.pumpkin': 'pumpkin',
    'item.watermelon': 'watermelon',
    'item.bowling8': 'light bowling ball',
    'item.basketball': 'basketball',
    'item.tennis': 'tennis ball',
    'item.pingpong': 'ping-pong ball',
    'item.ice': 'block of ice',
    'item.candle': 'candle',
    'item.butter': 'stick of butter',
    'item.pencil': 'pencil',
    'item.apple': 'apple',
    'item.orange': 'orange',
    'item.banana': 'banana',
    'item.corn': 'corn cob',
    'item.pepper': 'bell pepper',
    'item.coin': 'coin',
    'item.key': 'key',
    'item.spoon': 'metal spoon',
    'item.rock': 'rock',
    'item.bone': 'bone',
    'item.anchor': 'anchor',
    'item.bowling16': 'heavy bowling ball',
    'item.hippo': 'hippo',
    'item.clay': 'ball of clay',
    'item.potato': 'potato',
    'item.grape': 'grape',
    'item.egg': 'fresh egg',
    'item.carrot': 'carrot',
    'item.kiwi': 'kiwi',
    'fact.ship': 'A steel ship is hollow and full of air, so the whole ship is light for its size.',
    'fact.pumpkin': 'Giant pumpkins float so well that people hollow them out and paddle them like boats!',
    'fact.bowling8': 'A light bowling ball floats, but a heavy one the same size sinks!',
    'fact.tennis': 'A tennis ball weighs as much as about 23 small coins, and it still floats.',
    'fact.ice': 'Water gets lighter for its size when it freezes. That is why ice floats.',
    'fact.apple': 'An apple is full of tiny air spaces, and they help it float.',
    'fact.orange': 'Its peel is full of tiny air pockets. Peel it, and the orange sinks!',
    'fact.corn': 'A whole cob floats, but one kernel on its own sinks!',
    'fact.pepper': 'A whole pepper is hollow and floats. A slice of it sinks!',
    'fact.hippo': 'Hippos cannot float. They walk and bounce along the bottom of the river.',
    'fact.egg': 'Stir lots of salt into the water and a fresh egg floats. (An old egg can float even in plain water.)',
    hintNum: 'Compare {d} with the liquid: {l}. Which number is bigger?',
    'miss.salt': 'Salt makes water heavier for its size, but only up to about 1.2. {It} is heavier for its size than even the saltiest water.',
    'miss.honey': 'Honey is about 1.4 for its size. {It} is heavier for its size than that, so it sinks even in honey.',
    'miss.sinkSalt': 'Salty water is heavier for its size than plain water, so {it} floats even more easily.',
    'miss.sinkHoney': 'Honey is much heavier for its size than water, so {it} floats even more easily.',
    'rec.title': 'Pond notes',
    'rec.lede': 'Every thing you have dropped in the pond, and what it did.'
  },
  es: {
    'ch.e1': '¿Flota o se hunde?',
    'ch.e1.idea': 'Un tronco enorme y una moneda diminuta. Adivina y ¡al agua!',
    'ch.e2': 'El gemelo de agua',
    'ch.e2.idea': 'Pesa cada cosa contra la misma cantidad de agua.',
    'ch.e3': 'Lo mismo, de cualquier tamaño',
    'ch.e3.idea': 'Uno gigante o uno diminuto: ¿cambia algo el tamaño?',
    'ch.m1': 'Haz que flote',
    'ch.m1.idea': 'Un cambio funciona. ¿Cuál?',
    'ch.m2': 'Balsas de cubos',
    'ch.m2.idea': 'Cuenta los cubos, lee el peso y decide.',
    'ch.m3': '¿Cuánto se hunde?',
    'ch.m3.idea': '¿Cuántas filas de la balsa quedan bajo el agua?',
    'ch.h1': 'Pesado para su tamaño',
    'ch.h1.idea': 'Cada tarjeta tiene un número. Compáralo con el del líquido.',
    'ch.h2': 'El frasco de miel',
    'ch.h2.idea': 'Aceite, agua y miel en capas. ¿Dónde se queda cada bloque?',
    'ch.h3': 'La pregunta del iceberg',
    'ch.h3.idea': '¿Cuánto de un bloque que flota queda escondido bajo la superficie?',

    'tile.tray': 'Flota o se hunde',
    'tile.same': 'Lo mismo',
    'tile.fix': 'Haz que flote',
    'tile.cubes': 'Balsas de cubos',
    'tile.depth': 'Cuánto se hunde',
    'tile.layers': 'Capas',
    'tile.frac': 'Cuánto queda abajo',

    'ask.tray': '¿Cada cosa flotará o se hundirá? Elige para todas y pulsa ¡Al agua!',
    'ask.twin': 'Cada cosa está en una balanza con su gemelo de agua: la misma cantidad de agua. ¿Pesa menos o más que su gemelo?',
    'ask.num': 'Cada tarjeta muestra lo pesada que es la cosa para su tamaño. {Liq}: {l}. ¿Cada una flotará o se hundirá?',
    'ask.same': 'Ya probamos esta. Ahora mira las otras: están hechas exactamente de lo mismo.',
    'ask.fixFloat': '{It} se hunde. ¿Qué cambio hará que flote?',
    'ask.fixSink': '{It} flota. ¿Qué cambio hará que se hunda?',
    'ask.cubes': 'Cada cubo de agua pesa 1. ¿Cada balsa flotará o se hundirá?',
    'ask.depth': 'Esta balsa flota. ¿Cuántas filas de cubos quedan bajo el agua?',
    'ask.layers': 'El aceite, el agua y la miel forman capas. ¿Dónde se quedará cada bloque?',
    'ask.frac': 'Este bloque es {d} para su tamaño. {Liq}: {l}. ¿Cuánto del bloque queda abajo?',

    floats: 'Flota',
    sinks: 'Se hunde',
    splash: '¡Al agua!',
    drop: '¡Échalos!',
    pickAll: 'Primero elige para todas.',
    pickOne: 'Primero elige una.',
    tested: 'Probado: {v}',
    floatsV: 'flota',
    sinksV: 'se hunde',
    twinLabel: 'gemelo de agua',
    twinHint: 'Gemelo de agua',
    twinShow: 'Pon {it} en la balanza con su gemelo de agua.',
    twinHeavier: '{It} pesa más que su gemelo de agua.',
    twinLighter: '{It} pesa menos que su gemelo de agua.',
    weighs: 'pesa {w}',
    raftTag: 'Balsa {n}: pesa {w}',
    raft: 'Balsa {n}: {c} cubos, pesa {w}',
    rows: '{n} filas',
    row1: '1 fila',
    block: 'Bloque {n}: {d}',
    hintCubes: 'Cuenta los cubos de esta balsa. Eso pesa su gemelo de agua. ¿La balsa pesa menos o más?',
    hintDepth: 'La balsa pesa {w}. Cada fila de {k} cubos aparta {k} de agua. ¿Cuántas filas hacen {w}?',
    hintLayers: 'Compara {d} con el aceite ({oil}), el agua ({water}) y la miel ({honey}). Se hunde en cada líquido más ligero que él.',
    hintFrac: 'Divide el bloque entre el líquido: {d} ÷ {l}.',
    hintFix: 'Cambiar el tamaño o el color nunca cambia si flota. ¿Qué cambia lo pesado que es para su tamaño?',
    hintSame: 'Es lo mismo. ¿El tamaño cambia lo pesado que es para su tamaño?',

    'layer.0': 'Encima del aceite',
    'layer.1': 'Entre el aceite y el agua',
    'layer.2': 'Entre el agua y la miel',
    'layer.3': 'En el fondo',

    'liq.water': 'El agua',
    'liq.salty': 'El agua muy salada',
    'liq.oil': 'El aceite de cocina',
    'liq.honey': 'La miel',
    'short.oil': 'Aceite', 'short.water': 'Agua', 'short.honey': 'Miel',

    'size.1': 'diminuto', 'size.2': 'pequeño', 'size.3': 'mediano', 'size.4': 'grande', 'size.5': 'enorme',

    'fix.boat': 'Darle forma de barco',
    'fix.salt': 'Echar mucha sal al agua y remover',
    'fix.honey': 'Usar miel en vez de agua',
    'fix.float': 'Atarle un flotador grande',
    'fix.stone': 'Atarle una piedra pesada',
    'fix.half': 'Cortar por la mitad',
    'fix.bigger': 'Usar un tamaño más grande',
    'fix.smaller': 'Usar un tamaño más pequeño',
    'fix.paint': 'Pintar de otro color',
    'fix.upside': 'Dar la vuelta',

    'why.fix.boat': 'La forma de barco es hueca, así que aparta mucha más agua que una bola. El mismo material ahora pesa poco para su tamaño.',
    'why.fix.salt': 'La sal hace que el agua sea más pesada para su tamaño. Ahora {it} pesa menos que la misma cantidad de agua salada.',
    'why.fix.honey': 'La miel es mucho más pesada para su tamaño que el agua, así que {it} flota en ella.',
    'why.fix.float': 'El flotador es muy ligero para su tamaño. Juntos pesan menos que la misma cantidad de agua.',
    'why.fix.stone': 'La piedra es muy pesada para su tamaño. Juntos pesan más que la misma cantidad de agua.',
    'why.fix.never': 'Cortarlo, pintarlo, darle la vuelta o usar otro tamaño no cambia lo pesado que es para su tamaño. Así que sigue haciendo lo mismo.',

    right: '✓ {It} {v}, como dijiste.',
    still: '{It} todavía {v}.',
    worked: '¡Funcionó! {It} {v}.',
    surprise: '¡Sorpresa! {It} {v}.',
    'why.float': 'Pesa poco para su tamaño.',
    'why.sink': 'Pesa mucho para su tamaño.',
    'why.floatBig': 'Es grande y pesa mucho, pero pesa poco para su tamaño. Por eso flota.',
    'why.sinkSmall': 'Ocupa poco espacio y pesa poco, pero pesa mucho para su tamaño. Por eso se hunde.',
    'why.twinFloat': 'Pesa menos que su gemelo de agua, por eso flota.',
    'why.twinSink': 'Pesa más que su gemelo de agua, por eso se hunde.',
    'why.num': '{d} es {cmp} que {l}, por eso {v}.',
    less: 'menos', more: 'más',
    'why.same': 'Cada trozo del mismo material es igual de pesado para su tamaño, sea del tamaño que sea. Por eso todos {v}.',
    'why.cubeFloat': 'Esta balsa ocupa {c} cubos de agua, así que su gemelo de agua pesa {c}. Pesa {w}, menos que {c}, por eso flota.',
    'why.cubeSink': 'Esta balsa ocupa {c} cubos de agua, así que su gemelo de agua pesa {c}. Pesa {w}, más que {c}, por eso se hunde.',
    'why.depth': 'Lo que flota se hunde hasta que el agua que aparta pesa lo mismo que él. Pesa {w}, y cada fila aparta {k}. Así que quedan {r} abajo.',
    'why.layer': 'El bloque {n} ({d}) se hunde en cada líquido más ligero que él para su tamaño y se queda en el primero que es más pesado: {where}.',
    'why.frac': 'La parte de abajo es el bloque dividido entre el líquido: {d} ÷ {l} = {f}.',
    'why.ice': 'El hielo es como 0,9 del agua para su tamaño, así que unas 9 partes de cada 10 quedan abajo. ¡Por eso casi todo el iceberg está escondido!',
    'why.idea.e1': 'Flotar no depende de ser pesado o ligero. Depende de ser pesado o ligero para tu tamaño.',
    'why.idea.hippo': 'El hipopótamo también es pesado para su tamaño: no puede flotar, así que camina y da saltitos por el fondo del río.',

    'item.log': 'el tronco',
    'item.ship': 'el barco de acero',
    'item.pumpkin': 'la calabaza',
    'item.watermelon': 'la sandía',
    'item.bowling8': 'la bola de boliche ligera',
    'item.basketball': 'la pelota de básquetbol',
    'item.tennis': 'la pelota de tenis',
    'item.pingpong': 'la pelota de ping-pong',
    'item.ice': 'el bloque de hielo',
    'item.candle': 'la vela',
    'item.butter': 'la barra de mantequilla',
    'item.pencil': 'el lápiz',
    'item.apple': 'la manzana',
    'item.orange': 'la naranja',
    'item.banana': 'el plátano',
    'item.corn': 'la mazorca de maíz',
    'item.pepper': 'el pimiento',
    'item.coin': 'la moneda',
    'item.key': 'la llave',
    'item.spoon': 'la cuchara de metal',
    'item.rock': 'la piedra',
    'item.bone': 'el hueso',
    'item.anchor': 'el ancla',
    'item.bowling16': 'la bola de boliche pesada',
    'item.hippo': 'el hipopótamo',
    'item.clay': 'la bola de plastilina',
    'item.potato': 'la papa',
    'item.grape': 'la uva',
    'item.egg': 'el huevo fresco',
    'item.carrot': 'la zanahoria',
    'item.kiwi': 'el kiwi',
    'fact.ship': 'Un barco de acero es hueco y está lleno de aire, así que todo el barco es ligero para su tamaño.',
    'fact.pumpkin': '¡Las calabazas gigantes flotan tan bien que la gente las vacía y rema en ellas como en un bote!',
    'fact.bowling8': 'Una bola de boliche ligera flota, ¡pero una pesada del mismo tamaño se hunde!',
    'fact.tennis': 'Una pelota de tenis pesa como unas 23 monedas pequeñas, y aun así flota.',
    'fact.ice': 'El agua se vuelve más ligera para su tamaño al congelarse. Por eso el hielo flota.',
    'fact.apple': 'Una manzana está llena de espacios diminutos con aire, y eso la ayuda a flotar.',
    'fact.orange': 'Su cáscara está llena de bolsitas de aire. ¡Pélala y la naranja se hunde!',
    'fact.corn': 'Una mazorca entera flota, ¡pero un solo grano se hunde!',
    'fact.pepper': 'Un pimiento entero es hueco y flota. ¡Una rodaja se hunde!',
    'fact.hippo': 'Los hipopótamos no pueden flotar. Caminan y dan saltitos por el fondo del río.',
    'fact.egg': 'Echa mucha sal al agua y un huevo fresco flota. (Un huevo viejo puede flotar hasta en agua sola.)',
    hintNum: 'Compara {d} con el líquido: {l}. ¿Qué número es mayor?',
    'miss.salt': 'La sal hace el agua más pesada para su tamaño, pero solo hasta 1,2 más o menos. {It} pesa más para su tamaño que el agua más salada.',
    'miss.honey': 'La miel es como 1,4 para su tamaño. {It} pesa más que eso para su tamaño, así que se hunde hasta en la miel.',
    'miss.sinkSalt': 'El agua salada es más pesada para su tamaño que el agua sola, así que {it} flota todavía mejor.',
    'miss.sinkHoney': 'La miel es mucho más pesada para su tamaño que el agua, así que {it} flota todavía mejor.',
    'rec.title': 'Notas de la charca',
    'rec.lede': 'Todo lo que has echado a la charca, y lo que hizo.'
  }
};

export const pt = (key, lang, vars) => lookup(POND_TEXT, key, lang, vars);

const cap1 = (x) => x.charAt(0).toUpperCase() + x.slice(1);

/* English names are bare ("log"); Spanish ones carry their article
   ("el tronco"), which also says whether a word that follows is -o or -a. */
const esParts = (id) => {
  const full = POND_TEXT.es[`item.${id}`] || id;
  const [art, ...rest] = full.split(' ');
  return { art, noun: rest.join(' ') };
};

/** "the log" / "el tronco"; `cap` capitalises it. */
export function theItem(id, L, cap = false) {
  const text = L === 'es' ? POND_TEXT.es[`item.${id}`] : `the ${POND_TEXT.en[`item.${id}`]}`;
  return cap ? cap1(text) : text;
}

/** "a huge log" / "un tronco enorme": one of a size, for the "same stuff" cards. */
export function sizedName(id, size, L, cap = false) {
  let text;
  if (L === 'es') {
    const { art, noun } = esParts(id);
    const fem = art === 'la';
    let adj = POND_TEXT.es[`size.${size}`];
    if (fem) adj = adj.replace(/o$/, 'a');
    text = `${fem ? 'una' : 'un'} ${noun} ${adj}`;
  } else {
    const adj = POND_TEXT.en[`size.${size}`];
    text = `${/^[aeiou]/.test(adj) ? 'an' : 'a'} ${adj} ${POND_TEXT.en[`item.${id}`]}`;
  }
  return cap ? cap1(text) : text;
}

/** A heaviness in hundredths as each language writes it: 0.6 / 0,6, 1.0 / 1,0, 0.92 / 0,92. */
export function fmtNum(d, L) {
  const text = (d / 100).toFixed(d % 10 === 0 ? 1 : 2);
  return L === 'es' ? text.replace('.', ',') : text;
}

/** A fraction as a child writes it: 3/4. */
export const fmtFrac = (f) => `${f[0]}/${f[1]}`;

export default { POND_TEXT, pt, theItem, sizedName, fmtNum, fmtFrac };
