/**
 * truthtext.js — every word Truth Island says, in English and Spanish.
 *
 * Two kinds of text:
 *   - TRUTH_TEXT: fixed sentences with {slots} (rules, hints, the "why").
 *   - sentence(): what an animal says, built from its statement tree.
 *
 * The animals' sentences are put together in each language by its own rules,
 * not translated word by word: Spanish needs "u" before a word starting with
 * an o-sound ("o Oso" is "u Oso"), and "or" is always "or both" / "o los dos",
 * because children read a bare "or" as "one or the other but not both".
 * The animals' names are names, with no article: "Zorro es un animal Sol".
 */

import { lookup } from './logictext.js';

export const NAMES = {
  bear: { en: 'Bear', es: 'Oso' },
  rabbit: { en: 'Rabbit', es: 'Conejo' },
  owl: { en: 'Owl', es: 'Búho' },
  fox: { en: 'Fox', es: 'Zorro' },
  cat: { en: 'Cat', es: 'Gato' },
  mouse: { en: 'Mouse', es: 'Ratón' },
  giraffe: { en: 'Giraffe', es: 'Jirafa' },
  frog: { en: 'Frog', es: 'Rana' }
};

export const OBJECT_WORDS = {
  apple: { emoji: '🍎', en: ['apple', 'apples'], es: ['manzana', 'manzanas'] },
  banana: { emoji: '🍌', en: ['banana', 'bananas'], es: ['plátano', 'plátanos'] },
  fish: { emoji: '🐟', en: ['fish', 'fish'], es: ['pez', 'peces'] },
  carrot: { emoji: '🥕', en: ['carrot', 'carrots'], es: ['zanahoria', 'zanahorias'] },
  egg: { emoji: '🥚', en: ['egg', 'eggs'], es: ['huevo', 'huevos'] },
  star: { emoji: '⭐', en: ['star', 'stars'], es: ['estrella', 'estrellas'] },
  shell: { emoji: '🐚', en: ['shell', 'shells'], es: ['concha', 'conchas'] },
  flower: { emoji: '🌸', en: ['flower', 'flowers'], es: ['flor', 'flores'] }
};

export const ITEM_WORDS = {
  balloon: { emoji: '🎈', en: 'balloon', es: 'el globo' },
  kite: { emoji: '🪁', en: 'kite', es: 'la cometa' },
  teddy: { emoji: '🧸', en: 'teddy', es: 'el osito' },
  umbrella: { emoji: '☂️', en: 'umbrella', es: 'el paraguas' },
  gift: { emoji: '🎁', en: 'present', es: 'el regalo' },
  icecream: { emoji: '🍦', en: 'ice cream', es: 'el helado' }
};

const KIND = {
  en: { a: { sun: 'a Sun animal', moon: 'a Moon animal', cloud: 'a Cloud animal' },
        p: { sun: 'Sun animals', moon: 'Moon animals', cloud: 'Cloud animals' },
        name: { sun: 'Sun', moon: 'Moon', cloud: 'Cloud' } },
  es: { a: { sun: 'un animal Sol', moon: 'un animal Luna', cloud: 'un animal Nube' },
        p: { sun: 'animales Sol', moon: 'animales Luna', cloud: 'animales Nube' },
        name: { sun: 'Sol', moon: 'Luna', cloud: 'Nube' } }
};

const NUM = { en: ['no', 'one', 'two', 'three', 'four'], es: ['ninguno', 'uno', 'dos', 'tres', 'cuatro'] };

export const nameOf = (kind, L) => NAMES[kind][L === 'es' ? 'es' : 'en'];
export const kindA = (k, L) => KIND[L === 'es' ? 'es' : 'en'].a[k];
export const kindName = (k, L) => KIND[L === 'es' ? 'es' : 'en'].name[k];

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ------------------------------------------------------------------ */
/* What the animals say                                                */
/* ------------------------------------------------------------------ */

function factClause(f, speaker, cast, L) {
  const es = L === 'es';
  const w = (o, n) => OBJECT_WORDS[o][es ? 'es' : 'en'][n === 1 ? 0 : 1];
  switch (f.t) {
    case 'count':
      if (es) return `hay ${f.n} ${w(f.obj, f.n)}`;
      return f.n === 1 ? `there is 1 ${w(f.obj, 1)}` : `there are ${f.n} ${w(f.obj, f.n)}`;
    case 'none': return es ? `no hay ${w(f.obj, 2)}` : `there are no ${w(f.obj, 2)}`;
    case 'more': return es ? `hay más ${w(f.a, 2)} que ${w(f.b, 2)}` : `there are more ${w(f.a, 2)} than ${w(f.b, 2)}`;
    case 'has': {
      const item = ITEM_WORDS[f.item];
      if (f.who === speaker) return es ? `tengo ${item.es}` : `I have the ${item.en}`;
      const who = nameOf(cast[f.who], L);
      return es ? `${who} tiene ${item.es}` : `${who} has the ${item.en}`;
    }
    default: return '';
  }
}

/** One clause, no capital and no full stop, so clauses can be joined. */
export function clause(s, speaker, cast, L) {
  const es = L === 'es';
  const nm = (i) => nameOf(cast[i], L);
  const N = cast.length;
  switch (s.op) {
    case 'fact': return factClause(s.f, speaker, cast, L);
    case 'is':
      if (s.who === speaker) return es ? `soy ${kindA(s.kind, L)}` : `I am ${kindA(s.kind, L)}`;
      return es ? `${nm(s.who)} es ${kindA(s.kind, L)}` : `${nm(s.who)} is ${kindA(s.kind, L)}`;
    case 'same': case 'diff': {
      const what = s.op === 'same' ? (es ? 'del mismo tipo' : 'the same kind') : (es ? 'de distinto tipo' : 'different kinds');
      if (s.a === speaker || s.b === speaker) {
        const other = nm(s.a === speaker ? s.b : s.a);
        return es ? `${other} y yo somos ${what}` : `${other} and I are ${what}`;
      }
      return es ? `${nm(s.a)} y ${nm(s.b)} son ${what}` : `${nm(s.a)} and ${nm(s.b)} are ${what}`;
    }
    case 'count': {
      const p = KIND[es ? 'es' : 'en'].p[s.kind];
      const a = kindA(s.kind, L);
      const all = s.n === N;
      if (s.cmp === 'eq' && s.n === 0) return es ? `ninguno de nosotros es ${a}` : `none of us is ${a}`;
      if (all && (s.cmp === 'eq' || s.cmp === 'ge')) {
        if (N === 2) return es ? `los dos somos ${p}` : `we are both ${p}`;
        return es ? `todos somos ${p}` : `all of us are ${p}`;
      }
      if (s.cmp === 'eq') {
        if (s.n === 1) return es ? `exactamente uno de nosotros es ${a}` : `exactly one of us is ${a}`;
        return es ? `exactamente ${NUM.es[s.n]} de nosotros son ${p}` : `exactly ${NUM.en[s.n]} of us are ${p}`;
      }
      if (s.n === 1) return es ? `al menos uno de nosotros es ${a}` : `at least one of us is ${a}`;
      return es ? `al menos ${NUM.es[s.n]} de nosotros son ${p}` : `at least ${NUM.en[s.n]} of us are ${p}`;
    }
    case 'and': {
      const [x, y] = s.args.map((t) => clause(t, speaker, cast, L));
      /* A comma, because the parts can hold their own "and": "Cat and I are
         the same kind, and Fox is a Moon animal". "y" becomes "e" before an
         i-sound; none of the names start with one. */
      return es ? `${x}, y ${y}` : `${x}, and ${y}`;
    }
    case 'or': {
      const [x, y] = s.args.map((t) => clause(t, speaker, cast, L));
      if (!es) return `${x}, or ${y} (or both)`;
      const o = /^(o|ho)/i.test(y) ? 'u' : 'o';
      return `${x}, ${o} ${y} (o los dos)`;
    }
    case 'if': {
      const [x, y] = s.args.map((t) => clause(t, speaker, cast, L));
      return es ? `si ${x}, entonces ${y}` : `if ${x}, then ${y}`;
    }
    default: return '';
  }
}

/** What an animal says, as a full sentence. */
export const sentence = (s, speaker, cast, L) => `${cap(clause(s, speaker, cast, L))}.`;

/* ------------------------------------------------------------------ */
/* Fixed sentences                                                     */
/* ------------------------------------------------------------------ */

export const TRUTH_TEXT = {
  en: {
    ask: 'Who is a Sun animal, and who is a Moon animal?',
    askCloud: 'Who is the Sun animal, the Moon animal and the Cloud animal?',
    rules: 'Sun animals always tell the truth. Moon animals always say the opposite of the truth.',
    rulesCloud: 'There is one of each. The Cloud animal can say anything at all.',
    says: '{A} says',
    picture: 'The picture',
    curtain: 'The picture is behind the curtain. Only the animal with the Sun badge saw it.',
    badge: 'Sun badge',
    holds: '{A} is holding the {item}',
    'token.none': 'no token yet',
    tokenFor: '{A}: {k}. Tap to change.',
    pencil: 'Pencil',
    pencilHelp: 'Pencil is on. Tokens you place now only mean "maybe". Each sentence shows ✓ if it would be true and ✗ if it would be false.',
    pencilClear: 'Rub out the pencil',
    wouldTrue: 'would be true',
    wouldFalse: 'would be false',
    mustTrue: 'must be true',
    mustFalse: 'must be false',
    clash: 'Clash! {A} cannot say that.',
    fillAll: 'Give every animal a token first.',
    right: 'You worked them all out!',
    'broke.sun': "If {A} is a Sun animal, {A}'s sentence must be true. With your tokens, it is false.",
    'broke.moon': "If {A} is a Moon animal, {A}'s sentence must be false. With your tokens, it is true.",
    'broke.sunFact': "If {A} is a Sun animal, {A}'s sentence must be true. But the picture shows it is false.",
    'broke.moonFact': "If {A} is a Moon animal, {A}'s sentence must be false. But the picture shows it is true.",
    'broke.kinds': 'There must be exactly one Sun animal, one Moon animal and one Cloud animal.',
    'broke.badge': '{A} wears the Sun badge, so {A} is a Sun animal.',

    /* Hints, level 1 */
    'look.say': "Look at {A}'s sentence.",
    'look.kinds': 'Remember: there is one Sun, one Moon and one Cloud animal.',
    'look.token': '{A} still needs a token.',
    notKind: 'not {k}',
    'look.pencil': 'Try a pencil token on {A}.',
    'look.wrong': "Look at {A}'s token again.",
    'wrong.say': '{A} is not {k}.',
    'do.set': 'Give {A} the {kn} token.',
    'do.not': 'So {A} cannot be {k}.',

    /* The solver's steps, as sentences */
    'step.fact': '{A} says: "{q}" The picture shows that is {tf}. {rule} So {A} {end}.',
    'step.badge': '{S} wears the Sun badge, so everything {S} says is true. That makes {A}\'s sentence {tf}: "{q}" So {A} {end}.',
    'step.check': 'Now we can check {A}\'s sentence: "{q}" It is {tf}, so {A} {end}.',
    'step.known': '{A} is {ka}, so {A}\'s sentence is {tf}: "{q}" That means {B} {end}.',
    'step.self': 'Think about {A} both ways. For a Sun animal, "{q}" would have to be true. For a Moon animal, it would have to be false. Only one way works: {A} {end}.',
    'step.selfx': 'If {A} were {k}, the sentence "{q}" would have to be {tf}, and it cannot be. So {A} {end}.',
    'step.both': 'If {A} is a Sun animal, "{q}" is true. If {A} is a Moon animal, it is false. Both ways, {B} {end}.',
    'step.bothx': 'Whatever {A} is, the sentence "{q}" leaves {B} just one choice: {B} {end}.',
    'step.left': 'There is exactly one Sun, one Moon and one Cloud animal, so {B} {end}.',
    'step.suppose': "Try a pencil {kn} token on {A}. Follow the sentences, and {C}'s sentence breaks. So {A} {end}.",
    'step.supposex': 'Try a pencil {kn} token on {A}. Follow the sentences, and they cannot all fit. So {A} {end}.',
    'step.suppose2': 'Try a pencil {kn} token on {A}. Then try every choice for the others: every way, a sentence breaks. So {A} {end}.',
    'rule.sun': 'Moon animals never say true things.',
    'rule.moon': 'Sun animals never say false things.',
    true: 'true',
    false: 'false',
    'end.is': 'is {k}',
    'end.not': 'cannot be {k}',

    /* Chapters */
    'ch.e1': 'One Animal', 'ch.e1.idea': 'Check what the animal says against the picture.',
    'ch.e2': 'Picture Check', 'ch.e2.idea': 'Two or three animals. Check each one against the picture.',
    'ch.e3': 'Who Said What', 'ch.e3.idea': 'One animal talks about the picture. The other talks about that animal.',
    'ch.e4': 'Chain', 'ch.e4.idea': 'Work out one animal, then the next, then the next.',
    'ch.e5': 'Behind the Curtain', 'ch.e5.idea': 'You cannot see the picture. Trust the animal with the Sun badge.',
    'ch.m1': 'About Me', 'ch.m1.idea': 'Some animals talk about themselves. Could a Sun animal say that? Could a Moon animal?',
    'ch.m2': 'Same or Different', 'ch.m2.idea': '"We are the same kind" is true when both are Sun animals or both are Moon animals.',
    'ch.m3': 'Counting', 'ch.m3.idea': '"Exactly one of us is a Moon animal": count them!',
    'ch.m4': 'Pencil Thinking', 'ch.m4.idea': 'Put a pencil token on, follow the sentences, and see if one breaks.',
    'ch.m5': 'Island Mix', 'ch.m5.idea': 'Everything so far, all mixed up.',
    'ch.h1': 'Four Animals', 'ch.h1.idea': 'Four animals, and at least one pencil idea.',
    'ch.h2': 'And, Or, If', 'ch.h2.idea': '"Or" means one, the other, or both. "If … then" is false only when the first part is true and the second is not.',
    'ch.h3': 'The Cloud Animal', 'ch.h3.idea': 'One Sun, one Moon, and one Cloud animal who can say anything.',
    'ch.h4': 'Two Sentences', 'ch.h4.idea': "Each animal says two things. A Sun animal's are both true. A Moon animal's are both false.",
    'ch.h5': 'Deep Thinking', 'ch.h5.idea': 'Long puzzles that need two pencil ideas.',

    'tile.puzzle': 'Island puzzle',
    'album.title': 'Island album',
    'album.lede': 'Every animal you work out goes in your album. Here is how often you met each one at this level.',
    'album.count': '{s} times a Sun, {m} times a Moon',
    'album.none': 'Not met yet'
  },
  es: {
    ask: '¿Quién es un animal Sol y quién es un animal Luna?',
    askCloud: '¿Quién es el animal Sol, el animal Luna y el animal Nube?',
    rules: 'Los animales Sol siempre dicen la verdad. Los animales Luna siempre dicen lo contrario de la verdad.',
    rulesCloud: 'Hay uno de cada tipo. El animal Nube puede decir cualquier cosa.',
    says: '{A} dice',
    picture: 'El dibujo',
    curtain: 'El dibujo está detrás de la cortina. Solo lo vio el animal con la insignia del Sol.',
    badge: 'Insignia del Sol',
    holds: '{A} tiene {item}',
    'token.none': 'todavía sin ficha',
    tokenFor: '{A}: {k}. Toca para cambiar.',
    pencil: 'Lápiz',
    pencilHelp: 'El lápiz está activado. Las fichas que pongas ahora solo quieren decir «quizás». Cada frase muestra ✓ si sería verdad y ✗ si sería falsa.',
    pencilClear: 'Borrar el lápiz',
    wouldTrue: 'sería verdad',
    wouldFalse: 'sería falsa',
    mustTrue: 'tiene que ser verdad',
    mustFalse: 'tiene que ser falsa',
    clash: '¡Choque! {A} no puede decir eso.',
    fillAll: 'Primero dale una ficha a cada animal.',
    right: '¡Los descubriste a todos!',
    'broke.sun': 'Si {A} es un animal Sol, su frase tiene que ser verdad. Con tus fichas, es falsa.',
    'broke.moon': 'Si {A} es un animal Luna, su frase tiene que ser falsa. Con tus fichas, es verdad.',
    'broke.sunFact': 'Si {A} es un animal Sol, su frase tiene que ser verdad. Pero el dibujo muestra que es falsa.',
    'broke.moonFact': 'Si {A} es un animal Luna, su frase tiene que ser falsa. Pero el dibujo muestra que es verdad.',
    'broke.kinds': 'Tiene que haber exactamente un animal Sol, uno Luna y uno Nube.',
    'broke.badge': '{A} lleva la insignia del Sol, así que {A} es un animal Sol.',

    'look.say': 'Mira la frase de {A}.',
    'look.kinds': 'Recuerda: hay un animal Sol, uno Luna y uno Nube.',
    'look.token': 'A {A} todavía le falta su ficha.',
    notKind: 'no es {k}',
    'look.pencil': 'Prueba una ficha a lápiz en {A}.',
    'look.wrong': 'Vuelve a mirar la ficha de {A}.',
    'wrong.say': '{A} no es {k}.',
    'do.set': 'Dale a {A} la ficha {kn}.',
    'do.not': 'Así que {A} no puede ser {k}.',

    'step.fact': '{A} dice: «{q}» El dibujo muestra que es {tf}. {rule} Así que {A} {end}.',
    'step.badge': '{S} lleva la insignia del Sol, así que todo lo que dice es verdad. Eso hace que la frase de {A} sea {tf}: «{q}» Así que {A} {end}.',
    'step.check': 'Ahora podemos comprobar la frase de {A}: «{q}» Es {tf}, así que {A} {end}.',
    'step.known': '{A} es {ka}, así que su frase es {tf}: «{q}» Eso quiere decir que {B} {end}.',
    'step.self': 'Piensa en {A} de las dos maneras. Si fuera un animal Sol, «{q}» tendría que ser verdad. Si fuera un animal Luna, tendría que ser falsa. Solo una manera funciona: {A} {end}.',
    'step.selfx': 'Si {A} fuera {k}, la frase «{q}» tendría que ser {tf}, y no puede serlo. Así que {A} {end}.',
    'step.both': 'Si {A} es un animal Sol, «{q}» es verdad. Si {A} es un animal Luna, es falsa. De las dos maneras, {B} {end}.',
    'step.bothx': 'Sea lo que sea {A}, la frase «{q}» le deja a {B} una sola opción: {B} {end}.',
    'step.left': 'Hay exactamente un animal Sol, uno Luna y uno Nube, así que {B} {end}.',
    'step.suppose': 'Prueba una ficha {kn} a lápiz en {A}. Sigue las frases y la frase de {C} falla. Así que {A} {end}.',
    'step.supposex': 'Prueba una ficha {kn} a lápiz en {A}. Sigue las frases y no pueden encajar todas. Así que {A} {end}.',
    'step.suppose2': 'Prueba una ficha {kn} a lápiz en {A}. Luego prueba cada opción para los demás: de todas las maneras, alguna frase falla. Así que {A} {end}.',
    'rule.sun': 'Los animales Luna nunca dicen cosas verdaderas.',
    'rule.moon': 'Los animales Sol nunca dicen cosas falsas.',
    true: 'verdad',
    false: 'falsa',
    'end.is': 'es {k}',
    'end.not': 'no puede ser {k}',

    'ch.e1': 'Un animal', 'ch.e1.idea': 'Compara lo que dice el animal con el dibujo.',
    'ch.e2': 'Mira el dibujo', 'ch.e2.idea': 'Dos o tres animales. Compara cada uno con el dibujo.',
    'ch.e3': 'Quién dijo qué', 'ch.e3.idea': 'Un animal habla del dibujo. El otro habla de ese animal.',
    'ch.e4': 'Cadena', 'ch.e4.idea': 'Descubre un animal, luego el siguiente y luego el otro.',
    'ch.e5': 'Detrás de la cortina', 'ch.e5.idea': 'No puedes ver el dibujo. Confía en el animal con la insignia del Sol.',
    'ch.m1': 'Sobre mí', 'ch.m1.idea': 'Algunos animales hablan de sí mismos. ¿Podría decirlo un animal Sol? ¿Y un animal Luna?',
    'ch.m2': 'Igual o distinto', 'ch.m2.idea': '«Somos del mismo tipo» es verdad si los dos son animales Sol o los dos son animales Luna.',
    'ch.m3': 'Contar', 'ch.m3.idea': '«Exactamente uno de nosotros es un animal Luna»: ¡cuéntalos!',
    'ch.m4': 'Pensar con lápiz', 'ch.m4.idea': 'Pon una ficha a lápiz, sigue las frases y mira si alguna falla.',
    'ch.m5': 'Mezcla de la isla', 'ch.m5.idea': 'Todo lo anterior, mezclado.',
    'ch.h1': 'Cuatro animales', 'ch.h1.idea': 'Cuatro animales y al menos una idea a lápiz.',
    'ch.h2': 'Y, o, si', 'ch.h2.idea': '«O» quiere decir uno, el otro o los dos. «Si … entonces» solo es falso cuando la primera parte es verdad y la segunda no.',
    'ch.h3': 'El animal Nube', 'ch.h3.idea': 'Un animal Sol, uno Luna y uno Nube que puede decir cualquier cosa.',
    'ch.h4': 'Dos frases', 'ch.h4.idea': 'Cada animal dice dos cosas. Las de un animal Sol son las dos verdad. Las de un animal Luna son las dos falsas.',
    'ch.h5': 'Pensar a fondo', 'ch.h5.idea': 'Acertijos largos que necesitan dos ideas a lápiz.',

    'tile.puzzle': 'Acertijo de la isla',
    'album.title': 'Álbum de la isla',
    'album.lede': 'Cada animal que descubres va a tu álbum. Así de seguido conociste a cada uno en este nivel.',
    'album.count': '{s} veces Sol, {m} veces Luna',
    'album.none': 'Todavía no lo conoces'
  }
};

export const tt = (key, lang, vars) => lookup(TRUTH_TEXT, key, lang, vars);

export default { NAMES, OBJECT_WORDS, ITEM_WORDS, nameOf, kindA, kindName, clause, sentence, TRUTH_TEXT, tt };
