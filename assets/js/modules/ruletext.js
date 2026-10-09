/**
 * ruletext.js — every word Find the Rule says, in English and Spanish.
 *
 * A rule is never stored as prose. ruleSentence() says it from its tree, in
 * the child's language, so the rule a child builds from tiles reads back to
 * them as a sentence while they build it.
 *
 * Spanish conditions describe "una criatura" (feminine): "es pequeña".
 */

import { lookup } from './logictext.js';

/* Per value: a short label (chips, descriptions), the condition, its opposite. */
export const VALUE_WORDS = {
  ears: {
    bear: { en: ['bear', 'is a bear', 'is not a bear'], es: ['oso', 'es un oso', 'no es un oso'] },
    rabbit: { en: ['rabbit', 'is a rabbit', 'is not a rabbit'], es: ['conejo', 'es un conejo', 'no es un conejo'] },
    owl: { en: ['owl', 'is an owl', 'is not an owl'], es: ['búho', 'es un búho', 'no es un búho'] },
    fox: { en: ['fox', 'is a fox', 'is not a fox'], es: ['zorro', 'es un zorro', 'no es un zorro'] },
    cat: { en: ['cat', 'is a cat', 'is not a cat'], es: ['gato', 'es un gato', 'no es un gato'] },
    mouse: { en: ['mouse', 'is a mouse', 'is not a mouse'], es: ['ratón', 'es un ratón', 'no es un ratón'] },
    giraffe: { en: ['giraffe', 'is a giraffe', 'is not a giraffe'], es: ['jirafa', 'es una jirafa', 'no es una jirafa'] },
    frog: { en: ['frog', 'is a frog', 'is not a frog'], es: ['rana', 'es una rana', 'no es una rana'] }
  },
  hat: {
    none: { en: ['no hat', 'wears no hat', 'wears a hat'], es: ['sin sombrero', 'no lleva sombrero', 'lleva sombrero'] },
    cap: { en: ['cap', 'wears a cap', 'does not wear a cap'], es: ['gorra', 'lleva gorra', 'no lleva gorra'] },
    crown: { en: ['crown', 'wears a crown', 'does not wear a crown'], es: ['corona', 'lleva corona', 'no lleva corona'] },
    bow: { en: ['bow', 'wears a bow', 'does not wear a bow'], es: ['lazo', 'lleva lazo', 'no lleva lazo'] }
  },
  pattern: {
    plain: { en: ['plain', 'has no pattern', 'has a pattern'], es: ['liso', 'no tiene dibujo', 'tiene dibujo'] },
    stripes: { en: ['stripes', 'has stripes', 'has no stripes'], es: ['rayas', 'tiene rayas', 'no tiene rayas'] },
    dots: { en: ['dots', 'has dots', 'has no dots'], es: ['puntos', 'tiene puntos', 'no tiene puntos'] },
    checks: { en: ['checks', 'has checks', 'has no checks'], es: ['cuadros', 'tiene cuadros', 'no tiene cuadros'] }
  },
  buttons: {
    1: { en: ['1 button', 'has exactly 1 button', 'does not have exactly 1 button'], es: ['1 botón', 'tiene exactamente 1 botón', 'no tiene exactamente 1 botón'] },
    2: { en: ['2 buttons', 'has exactly 2 buttons', 'does not have exactly 2 buttons'], es: ['2 botones', 'tiene exactamente 2 botones', 'no tiene exactamente 2 botones'] },
    3: { en: ['3 buttons', 'has exactly 3 buttons', 'does not have exactly 3 buttons'], es: ['3 botones', 'tiene exactamente 3 botones', 'no tiene exactamente 3 botones'] }
  },
  size: {
    small: { en: ['small', 'is small', 'is not small'], es: ['pequeña', 'es pequeña', 'no es pequeña'] },
    big: { en: ['big', 'is big', 'is not big'], es: ['grande', 'es grande', 'no es grande'] }
  },
  item: {
    none: { en: ['nothing', 'holds nothing', 'holds something'], es: ['nada', 'no lleva nada en la mano', 'lleva algo en la mano'] },
    balloon: { en: ['balloon', 'holds a balloon', 'does not hold a balloon'], es: ['globo', 'lleva un globo', 'no lleva globo'] },
    flower: { en: ['flower', 'holds a flower', 'does not hold a flower'], es: ['flor', 'lleva una flor', 'no lleva flor'] },
    fish: { en: ['fish', 'holds a fish', 'does not hold a fish'], es: ['pez', 'lleva un pez', 'no lleva pez'] }
  }
};

export const ITEM_EMOJI = { balloon: '🎈', flower: '🌸', fish: '🐟' };

/* What a rule can be "about": the hint that names it. */
const ABOUT = {
  en: { ears: 'what animal it is', hat: 'the hat', pattern: 'the pattern', buttons: 'the buttons', size: 'the size', item: 'what it holds' },
  es: { ears: 'qué animal es', hat: 'el sombrero', pattern: 'el dibujo', buttons: 'los botones', size: 'el tamaño', item: 'lo que lleva en la mano' }
};

/* Pairs: "they have the same hat", "the first has more buttons". */
const PAIR = {
  en: {
    same: { ears: 'they are the same animal', hat: 'they wear the same hat', pattern: 'they have the same pattern',
      buttons: 'they have the same number of buttons', size: 'they are the same size', item: 'they hold the same thing' },
    diff: { ears: 'they are different animals', hat: 'they wear different hats', pattern: 'they have different patterns',
      buttons: 'they have different numbers of buttons', size: 'they are different sizes', item: 'they hold different things' },
    more: 'the first one has more buttons', fewer: 'the first one has fewer buttons',
    bigger: 'the first one is bigger', smaller: 'the first one is smaller'
  },
  es: {
    same: { ears: 'son el mismo animal', hat: 'llevan el mismo sombrero', pattern: 'tienen el mismo dibujo',
      buttons: 'tienen el mismo número de botones', size: 'son del mismo tamaño', item: 'llevan lo mismo en la mano' },
    diff: { ears: 'son animales distintos', hat: 'llevan sombreros distintos', pattern: 'tienen dibujos distintos',
      buttons: 'tienen distinto número de botones', size: 'son de distinto tamaño', item: 'llevan cosas distintas en la mano' },
    more: 'la primera tiene más botones', fewer: 'la primera tiene menos botones',
    bigger: 'la primera es más grande', smaller: 'la primera es más pequeña'
  }
};

const lg = (L) => (L === 'es' ? 'es' : 'en');

export const valueLabel = (a, v, L) => VALUE_WORDS[a][v][lg(L)][0];
export const aboutWord = (a, L) => ABOUT[lg(L)][a];

/** One condition or a whole rule, as a clause with no capital or full stop. */
export function clause(r, L) {
  const l = lg(L);
  switch (r.op) {
    case 'has': return VALUE_WORDS[r.a][r.v][l][1];
    case 'not': return VALUE_WORDS[r.x.a][r.x.v][l][2];
    case 'ge': return l === 'es' ? `tiene ${r.n} botones o más` : `has ${r.n} or more buttons`;
    case 'le': return l === 'es' ? `tiene ${r.n} botones o menos` : `has ${r.n} or fewer buttons`;
    case 'same': case 'diff': return PAIR[l][r.op][r.a];
    case 'more': case 'fewer': case 'bigger': case 'smaller': return PAIR[l][r.op];
    default: {
      const parts = r.args.map((x) => clause(x, L));
      const head = parts.slice(0, -1).join(', ');
      const last = parts[parts.length - 1];
      if (r.op === 'and') return `${head}${parts.length > 2 ? ',' : ''} ${l === 'es' ? 'y' : 'and'} ${last}`;
      if (r.op === 'or') {
        if (parts.length > 2) return l === 'es' ? `${head} o ${last} (o varias)` : `${head}, or ${last} (or more than one)`;
        return l === 'es' ? `${head}, o ${last} (o las dos cosas)` : `${head}, or ${last} (or both)`;
      }
      return l === 'es' ? `${head} o ${last}, pero no las dos cosas` : `${head} or ${last}, but not both`;
    }
  }
}

/** "A creature passes if it wears a crown." */
export function ruleSentence(r, L, pair = false) {
  const l = lg(L);
  const who = pair ? (l === 'es' ? 'Una pareja pasa si' : 'A pair passes if') : (l === 'es' ? 'Una criatura pasa si' : 'A creature passes if it');
  /* English pair clauses carry their own subject ("they", "the first one"). */
  return `${who} ${clause(r, L)}.`;
}

/** Words for one creature: "fox: crown, stripes, 2 buttons". */
export function describe(c, setup, L) {
  const order = ['ears', 'hat', 'pattern', 'buttons', 'size', 'item'];
  const name = valueLabel('ears', c[0], L);
  const rest = order.slice(1).filter((a) => setup[a]).map((a) => valueLabel(a, c[order.indexOf(a)], L));
  return rest.length ? `${name}: ${rest.join(', ')}` : name;
}

export const RULE_TEXT = {
  en: {
    ask: 'Some creatures pass the gate. Some are stopped. What is the secret rule?',
    askPair: 'Creatures come to the gate in pairs. Some pairs pass, some are stopped. What is the secret rule?',
    passed: 'Passed',
    stopped: 'Stopped',
    line: 'Waiting to go',
    lineHelp: 'Tap one, then say what you think will happen.',
    machine: 'Dress-up machine',
    machineHelp: 'Make any creature you like, then say what you think will happen.',
    first: 'First',
    second: 'Second',
    predict: 'Will it pass?',
    predictPair: 'Will this pair pass?',
    sayPass: 'It passes',
    sayStop: 'It is stopped',
    pickOne: 'Pick a creature to test first.',
    already: 'That one has already been to the gate. Look at the shelves.',
    gotRight: 'You were right! It {result}.',
    surprise: 'Surprise! It {result}.',
    resPass: 'passed',
    resStop: 'was stopped',
    brave: 'Brave tester! You said it would be stopped, and it was. Testing what you think will fail is how detectives think.',
    know: 'I know the rule!',
    backToTest: 'Back to testing',
    sortAsk: 'Sort these six. Tap each one: will it pass or be stopped?',
    sortHow: 'Tap a creature once for ✓ {pass}, twice for ✗ {stop}, and a third time to clear it.',
    sortCheck: 'Check my sorting',
    sortFill: 'Sort all six first.',
    sortWrong: 'Not quite. Look at this one: it {result}. It is on the shelf now. Here are six new ones.',
    buildAsk: 'Build the rule. Tap a part, then pick what it says.',
    buildCheck: 'Check my rule',
    buildFill: 'Fill every part of your rule first.',
    yourRule: 'Your rule',
    part: 'Part {n}',
    pickPart: 'pick a part',
    not: 'not',
    addPart: 'Add a part',
    removePart: 'Remove this part',
    'join.and': 'and',
    'join.or': 'or (or both)',
    'join.xor': 'or, not both',
    joinHelp: 'Tap to change how the parts join.',
    atLeast2: '2 or more buttons',
    atMost2: '2 or fewer buttons',
    ruleWrong: 'Interesting! This one breaks your rule: it {result}, but your rule says it {would}. It is on the shelf now.',
    wouldPass: 'would pass',
    wouldStop: 'would be stopped',
    right: 'That is the rule!',
    whyRule: 'The rule: {rule}',
    whyFit: 'Every creature that passed fits it, and no stopped creature does.',
    whyTests: 'You sent {n} creatures to the gate. A very good detective could do it with {par}.',
    whyTests1: 'You sent 1 creature to the gate. A very good detective could do it with {par}.',
    whyNone: 'You did not need a single test!',
    whyBrave: 'You were a brave tester {n} times.',
    whyBrave1: 'You were a brave tester once.',
    'hint.look': 'Look at the passers. What do they all have that the stopped ones do not?',
    'hint.test': 'Test this one. Some of the ideas that still fit say it passes, others say it is stopped.',
    'hint.enough': 'You have seen enough to know! Press "I know the rule!".',
    'hint.about': 'The rule is about {about}.',
    'about.join': ' and ',
    'tile.puzzle': 'Gate puzzle',
    'book.title': 'Rule book',
    'book.lede': 'Every rule you find goes in your book.',
    'book.none': 'Find your first rule and it will be written here.',
    'book.count': '{n} rules found at this level',

    'ch.e1': 'One Thing', 'ch.e1.idea': 'The rule is about one thing, like "wears a crown".',
    'ch.e2': 'This or That', 'ch.e2.idea': 'Two different values can both pass, like "a cap or a crown".',
    'ch.e3': 'Everyone Except', 'ch.e3.idea': 'Everyone passes except some: "does not wear a bow".',
    'ch.e4': 'Count the Buttons', 'ch.e4.idea': 'Rules about how many buttons: "2 or more".',
    'ch.e5': 'Gate Mix', 'ch.e5.idea': 'Every kind of rule so far, mixed up.',
    'ch.m1': 'And', 'ch.m1.idea': 'Two things at once: "wears a crown and has stripes".',
    'ch.m2': 'Or', 'ch.m2.idea': 'Either thing is enough: "wears a crown, or has stripes (or both)".',
    'ch.m3': 'And Not', 'ch.m3.idea': 'One thing, but not another: "wears a crown and has no stripes".',
    'ch.m4': 'Traps', 'ch.m4.idea': 'All the passers share two things. Only one of them matters. Test to find out which!',
    'ch.m5': 'Machine Mix', 'ch.m5.idea': 'Every kind of rule so far, mixed up.',
    'ch.h1': 'Three Parts', 'ch.h1.idea': 'Rules made of three parts.',
    'ch.h2': 'Not Both', 'ch.h2.idea': '"One or the other, but not both."',
    'ch.h3': 'Pairs', 'ch.h3.idea': 'Creatures come in twos. The rule is about how the two compare.',
    'ch.h4': 'Counting Plus', 'ch.h4.idea': 'Button counts joined with another part.',
    'ch.h5': 'Master Detective', 'ch.h5.idea': 'The hardest rules, all mixed up.'
  },
  es: {
    ask: 'Algunas criaturas pasan la puerta. Otras se quedan fuera. ¿Cuál es la regla secreta?',
    askPair: 'Las criaturas llegan a la puerta en parejas. Algunas parejas pasan y otras se quedan fuera. ¿Cuál es la regla secreta?',
    passed: 'Pasaron',
    stopped: 'Se quedaron fuera',
    line: 'Esperando su turno',
    lineHelp: 'Toca una y luego di qué crees que pasará.',
    machine: 'Máquina de disfraces',
    machineHelp: 'Crea la criatura que quieras y luego di qué crees que pasará.',
    first: 'Primera',
    second: 'Segunda',
    predict: '¿Pasará?',
    predictPair: '¿Pasará esta pareja?',
    sayPass: 'Pasa',
    sayStop: 'Se queda fuera',
    pickOne: 'Primero elige una criatura para probar.',
    already: 'Esa ya fue a la puerta. Mira los estantes.',
    gotRight: '¡Acertaste! {result}.',
    surprise: '¡Sorpresa! {result}.',
    resPass: 'Pasó',
    resStop: 'Se quedó fuera',
    brave: '¡Detective valiente! Dijiste que se quedaría fuera, y así fue. Probar lo que crees que fallará es pensar como un detective.',
    know: '¡Ya sé la regla!',
    backToTest: 'Volver a probar',
    sortAsk: 'Ordena estas seis. Toca cada una: ¿pasará o se quedará fuera?',
    sortHow: 'Toca una criatura una vez para ✓ {pass}, dos veces para ✗ {stop} y una tercera vez para borrarla.',
    sortCheck: 'Comprobar mi orden',
    sortFill: 'Primero ordena las seis.',
    sortWrong: 'Casi. Mira esta: {result}. Ahora está en el estante. Aquí tienes seis nuevas.',
    buildAsk: 'Construye la regla. Toca una parte y elige lo que dice.',
    buildCheck: 'Comprobar mi regla',
    buildFill: 'Primero completa todas las partes de tu regla.',
    yourRule: 'Tu regla',
    part: 'Parte {n}',
    pickPart: 'elige una parte',
    not: 'no',
    addPart: 'Añadir una parte',
    removePart: 'Quitar esta parte',
    'join.and': 'y',
    'join.or': 'o (o las dos)',
    'join.xor': 'o, pero no las dos',
    joinHelp: 'Toca para cambiar cómo se unen las partes.',
    atLeast2: '2 botones o más',
    atMost2: '2 botones o menos',
    ruleWrong: '¡Qué interesante! Esta rompe tu regla: {result}, pero tu regla dice que {would}. Ahora está en el estante.',
    wouldPass: 'pasaría',
    wouldStop: 'se quedaría fuera',
    right: '¡Esa es la regla!',
    whyRule: 'La regla: {rule}',
    whyFit: 'Todas las criaturas que pasaron la cumplen, y ninguna de las que se quedaron fuera.',
    whyTests: 'Mandaste {n} criaturas a la puerta. Un detective muy bueno lo lograría con {par}.',
    whyTests1: 'Mandaste 1 criatura a la puerta. Un detective muy bueno lo lograría con {par}.',
    whyNone: '¡No te hizo falta ninguna prueba!',
    whyBrave: 'Fuiste un detective valiente {n} veces.',
    whyBrave1: 'Fuiste un detective valiente una vez.',
    'hint.look': 'Mira las que pasaron. ¿Qué tienen todas que no tengan las que se quedaron fuera?',
    'hint.test': 'Prueba esta. Algunas de las ideas que todavía encajan dicen que pasa, y otras que se queda fuera.',
    'hint.enough': '¡Ya has visto lo suficiente! Pulsa «¡Ya sé la regla!».',
    'hint.about': 'La regla trata sobre {about}.',
    'about.join': ' y ',
    'tile.puzzle': 'Acertijo de la puerta',
    'book.title': 'Libro de reglas',
    'book.lede': 'Cada regla que descubres va a tu libro.',
    'book.none': 'Descubre tu primera regla y se escribirá aquí.',
    'book.count': '{n} reglas descubiertas en este nivel',

    'ch.e1': 'Una cosa', 'ch.e1.idea': 'La regla trata sobre una sola cosa, como «lleva corona».',
    'ch.e2': 'Esto o aquello', 'ch.e2.idea': 'Dos valores distintos pueden pasar, como «gorra o corona».',
    'ch.e3': 'Todos menos', 'ch.e3.idea': 'Pasan todas menos algunas: «no lleva lazo».',
    'ch.e4': 'Cuenta los botones', 'ch.e4.idea': 'Reglas sobre cuántos botones: «2 o más».',
    'ch.e5': 'Mezcla de la puerta', 'ch.e5.idea': 'Todas las reglas anteriores, mezcladas.',
    'ch.m1': 'Y', 'ch.m1.idea': 'Dos cosas a la vez: «lleva corona y tiene rayas».',
    'ch.m2': 'O', 'ch.m2.idea': 'Basta con una: «lleva corona, o tiene rayas (o las dos cosas)».',
    'ch.m3': 'Y no', 'ch.m3.idea': 'Una cosa, pero no otra: «lleva corona y no tiene rayas».',
    'ch.m4': 'Trampas', 'ch.m4.idea': 'Todas las que pasan comparten dos cosas. Solo una importa. ¡Prueba para saber cuál!',
    'ch.m5': 'Mezcla de la máquina', 'ch.m5.idea': 'Todas las reglas anteriores, mezcladas.',
    'ch.h1': 'Tres partes', 'ch.h1.idea': 'Reglas hechas de tres partes.',
    'ch.h2': 'No las dos', 'ch.h2.idea': '«Una cosa o la otra, pero no las dos».',
    'ch.h3': 'Parejas', 'ch.h3.idea': 'Las criaturas llegan de dos en dos. La regla compara a las dos.',
    'ch.h4': 'Contar y más', 'ch.h4.idea': 'Cuentas de botones unidas con otra parte.',
    'ch.h5': 'Detective maestro', 'ch.h5.idea': 'Las reglas más difíciles, todas mezcladas.'
  }
};

export const rt = (key, lang, vars) => lookup(RULE_TEXT, key, lang, vars);

export default { VALUE_WORDS, ITEM_EMOJI, valueLabel, aboutWord, clause, ruleSentence, describe, RULE_TEXT, rt };
