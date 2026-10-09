/**
 * chainlogic.js — Sun to Lion: who gives food to whom.
 *
 * Every chain starts at the Sun: plants make their own food from sunlight,
 * air and water, and every arrow means "gives food to" (it points at the
 * one who eats). The wrong idea this game is built against is "plants get
 * their food from the soil", so a soil tile is the tempting wrong answer in
 * every plant slot.
 *
 * Every link below is from research-foodchains.md section 1, with its source
 * key. Only OK links are ever shown as true. A wrong answer is always one no
 * source links to its neighbours at all: an animal from a part of the world
 * that never meets this one, or one that cannot eat this kind of food (a
 * plant-eater in a slot that eats animals, a meat-eater in a slot that eats
 * plants). Omnivores are never used as wrong answers. Questions about a web
 * are always about "this picture": lions eat many things, so "if the zebras
 * go, the lion starves" would be false.
 *
 * Pure: no DOM, no Math.random.
 */

import { pickOne, randInt, rngFor, shuffled } from './logicrng.js';

export const LEVELS = ['easy', 'medium', 'hard'];

/* ------------------------------------------------------------------ */
/* The living things                                                   */
/* ------------------------------------------------------------------ */

/* Where each habitat is: two habitats in different regions never share an
   animal, which is what makes a far-away animal a safe wrong answer. */
export const REGION = {
  savanna: 'africa', ocean: 'antarctic', arctic: 'arctic', rainforest: 'samerica', bamboo: 'asia',
  reef: 'tropicsea', forest: 'namerica', desert: 'namerica', prairie: 'namerica', garden: 'namerica'
};

/*   role: producer, plant (eats plants), meat (eats animals), both, recycler
     pure: eats only plants, or only animals, by every source: the only
           animals ever offered as a wrong answer ("a lion never eats grass")
     sort: false for animals that do not fit one role cleanly (the research
           names warthog, squirrel, krill, panda, leafcutter ant)
     also: other regions the same species lives in */
const SP = (id, emoji, eco, role, more = {}) => ({ id, emoji, eco, role, sort: true, ...more });
export const SPECIES = [
  /* African savanna */
  SP('grass', '🌾', 'savanna', 'producer'),
  SP('acacia', '🌳', 'savanna', 'producer'),
  SP('zebra', '🦓', 'savanna', 'plant', { pure: true }),
  SP('gazelle', '🦌', 'savanna', 'plant', { pure: true }),
  SP('giraffe', '🦒', 'savanna', 'plant', { pure: true }),
  SP('elephant', '🐘', 'savanna', 'plant', { pure: true }),
  SP('buffalo', '🐃', 'savanna', 'plant', { pure: true }),
  SP('warthog', '🐗', 'savanna', 'plant', { sort: false }),
  SP('lion', '🦁', 'savanna', 'meat', { pure: true }),
  SP('cheetah', '🐆', 'savanna', 'meat', { pure: true }),
  SP('dungbeetle', '🪲', 'savanna', 'recycler'),
  /* Southern Ocean (Antarctica): penguins, and no polar bears */
  SP('phyto', '🟢', 'ocean', 'producer', { also: ['reef', 'arctic'] }),
  SP('krill', '🦐', 'ocean', 'plant', { sort: false }),
  SP('silverfish', '🐟', 'ocean', 'meat', { pure: true }),
  SP('squid', '🦑', 'ocean', 'meat', { pure: true }),
  SP('adelie', '🐧', 'ocean', 'meat', { pure: true }),
  SP('crabeater', '🦭', 'ocean', 'meat', { fact: true, pure: true }),
  SP('leopardseal', '🦭', 'ocean', 'meat', { pure: true }),
  SP('humpback', '🐋', 'ocean', 'meat', { also: ['arctic', 'reef'] }),
  SP('orca', '🐳', 'ocean', 'meat', { also: ['arctic'], pure: true }),
  /* Arctic: polar bears, and no penguins */
  SP('icealgae', '🟩', 'arctic', 'producer'),
  SP('copepod', '🦐', 'arctic', 'plant', { sort: false }),
  SP('arcticcod', '🐟', 'arctic', 'meat', { pure: true }),
  SP('ringedseal', '🦭', 'arctic', 'meat', { pure: true }),
  SP('polarbear', '🐻‍❄️', 'arctic', 'meat', { fact: true }),
  SP('sedge', '🌱', 'arctic', 'producer'),
  SP('willow', '🌿', 'arctic', 'producer'),
  SP('lemming', '🐹', 'arctic', 'plant'),
  SP('arctichare', '🐇', 'arctic', 'plant', { pure: true }),
  SP('arcticfox', '🦊', 'arctic', 'both'),
  SP('snowyowl', '🦉', 'arctic', 'meat', { pure: true }),
  /* Rainforest (Central and South America) */
  SP('cecropia', '🌳', 'rainforest', 'producer'),
  SP('sloth', '🦥', 'rainforest', 'plant', { pure: true }),
  SP('howler', '🐒', 'rainforest', 'plant'),
  SP('harpy', '🦅', 'rainforest', 'meat', { pure: true }),
  SP('jaguar', '🐆', 'rainforest', 'meat', { pure: true }),
  SP('leafcutter', '🐜', 'rainforest', 'recycler', { sort: false, fact: true }),
  SP('fungus', '🍄', 'rainforest', 'recycler'),
  /* Bamboo forest (China) */
  SP('bamboo', '🎋', 'bamboo', 'producer'),
  SP('panda', '🐼', 'bamboo', 'plant', { sort: false, fact: true }),
  /* Coral reef */
  SP('algae', '🌿', 'reef', 'producer'),
  SP('seagrass', '🌱', 'reef', 'producer'),
  SP('parrotfish', '🐠', 'reef', 'plant'),
  SP('greenturtle', '🐢', 'reef', 'plant'),
  SP('clam', '🐚', 'reef', 'plant', { sort: false }),
  SP('octopus', '🐙', 'reef', 'meat', { pure: true }),
  SP('whitetip', '🦈', 'reef', 'meat', { pure: true }),
  SP('tigershark', '🦈', 'reef', 'meat'),
  SP('crab', '🦀', 'reef', 'recycler'),
  /* Temperate forest (eastern North America) */
  SP('oak', '🌳', 'forest', 'producer'),
  SP('twigs', '🌿', 'forest', 'producer'),
  SP('clover', '☘️', 'forest', 'producer'),
  SP('berries', '🫐', 'forest', 'producer'),
  SP('deer', '🦌', 'forest', 'plant'),
  SP('squirrel', '🐿️', 'forest', 'plant', { sort: false }),
  SP('cottontail', '🐇', 'forest', 'plant', { pure: true }),
  SP('redfox', '🦊', 'forest', 'both'),
  SP('owl', '🦉', 'forest', 'meat', { pure: true }),
  SP('hawk', '🦅', 'forest', 'meat', { pure: true }),
  SP('wolf', '🐺', 'forest', 'meat'),
  SP('blackbear', '🐻', 'forest', 'both'),
  SP('mushroom', '🍄', 'forest', 'recycler'),
  SP('worm', '🪱', 'forest', 'recycler'),
  /* Desert (Sonoran and Mojave) */
  SP('pricklypear', '🌵', 'desert', 'producer'),
  SP('mesquite', '🌳', 'desert', 'producer'),
  SP('desertgrass', '🌼', 'desert', 'producer'),
  SP('jackrabbit', '🐇', 'desert', 'plant', { pure: true }),
  SP('krat', '🐁', 'desert', 'plant'),
  SP('tortoise', '🐢', 'desert', 'plant'),
  SP('grasshopper', '🦗', 'desert', 'plant', { also: ['prairie'] }),
  SP('scorpion', '🦂', 'desert', 'meat', { pure: true }),
  SP('roadrunner', '🐦', 'desert', 'both'),
  SP('rattler', '🐍', 'desert', 'meat', { pure: true }),
  SP('kitfox', '🦊', 'desert', 'meat'),
  SP('deserthawk', '🦅', 'desert', 'meat', { pure: true }),
  /* Prairie */
  SP('prairiegrass', '🌾', 'prairie', 'producer'),
  SP('bison', '🦬', 'prairie', 'plant', { pure: true }),
  SP('meadowlark', '🐦', 'prairie', 'both')
];

export const species = (id) => SPECIES.find((s) => s.id === id) || null;


/* ------------------------------------------------------------------ */
/* The links                                                           */
/* ------------------------------------------------------------------ */

/* [food, eater, status, source key in research-foodchains.md]. OK links are
   shown; LESS and AVOID are true or arguable, so they are never shown as
   true and never used as a wrong answer either. */
const LK = [
  ['grass', 'zebra', 'OK', 'SDZ-zebra'], ['grass', 'gazelle', 'OK', 'ADW-gazelle'], ['acacia', 'gazelle', 'LESS', 'ADW-gazelle'],
  ['acacia', 'giraffe', 'OK', 'SDZ-giraffe'], ['grass', 'elephant', 'OK', 'SDZ-elephant'], ['acacia', 'elephant', 'LESS', 'SDZ-elephant'],
  ['grass', 'buffalo', 'OK', 'ADW-buffalo'], ['grass', 'warthog', 'OK', 'SDZ-warthog'],
  ['zebra', 'lion', 'OK', 'ADW-lion'], ['buffalo', 'lion', 'OK', 'ADW-buffalo'], ['gazelle', 'lion', 'OK', 'ADW-lion'],
  ['warthog', 'lion', 'OK', 'ADW-lion'], ['giraffe', 'lion', 'LESS', 'ADW-lion'], ['elephant', 'lion', 'AVOID', 'SDZ-lion'],
  ['gazelle', 'cheetah', 'OK', 'SDZ-cheetah'], ['warthog', 'cheetah', 'OK', 'SDZ-warthog'], ['zebra', 'cheetah', 'AVOID', '-'],

  ['phyto', 'krill', 'OK', 'ADW-krill'], ['krill', 'adelie', 'OK', 'ADW-adelie'], ['krill', 'silverfish', 'OK', 'ADW-krill'],
  ['krill', 'squid', 'OK', 'ADW-krill'], ['krill', 'crabeater', 'OK', 'ADW-crabeater'], ['krill', 'humpback', 'OK', 'NOAA-humpback'],
  ['krill', 'leopardseal', 'OK', 'ADW-leopardseal'], ['adelie', 'leopardseal', 'OK', 'ADW-leopardseal'],
  ['crabeater', 'orca', 'OK', 'NOAA-orca'], ['squid', 'orca', 'AVOID', '-'], ['leopardseal', 'orca', 'AVOID', 'ADW-leopardseal'],
  ['silverfish', 'adelie', 'AVOID', '-'],

  ['icealgae', 'copepod', 'OK', 'ACOD'], ['phyto', 'copepod', 'OK', 'ACOD'], ['copepod', 'arcticcod', 'OK', 'ACOD'],
  ['arcticcod', 'ringedseal', 'OK', 'ADW-ringedseal'], ['ringedseal', 'polarbear', 'OK', 'SDZ-polarbear'],
  ['sedge', 'lemming', 'OK', 'LEM'], ['willow', 'lemming', 'LESS', 'LEM'], ['lemming', 'arcticfox', 'OK', 'ADW-arcticfox'],
  ['lemming', 'snowyowl', 'OK', 'ADW-snowyowl'], ['willow', 'arctichare', 'OK', 'ADW-arctichare'],
  ['arctichare', 'arcticfox', 'LESS', 'ADW-arctichare'], ['arctichare', 'snowyowl', 'LESS', 'ADW-arctichare'],

  ['cecropia', 'sloth', 'OK', 'ADW-sloth'], ['cecropia', 'howler', 'OK', 'ADW-howler'], ['sloth', 'harpy', 'OK', 'SDZ-harpy'],
  ['howler', 'harpy', 'OK', 'SDZ-harpy'], ['sloth', 'jaguar', 'AVOID', 'ADW-sloth'], ['fungus', 'leafcutter', 'OK', 'LEAF'],

  ['bamboo', 'panda', 'OK', 'SDZ-panda'],

  ['seagrass', 'greenturtle', 'OK', 'NOAA-greenturtle'], ['algae', 'greenturtle', 'OK', 'NOAA-greenturtle'],
  ['algae', 'parrotfish', 'OK', 'ADW-parrotfish'], ['phyto', 'clam', 'OK', 'NOAA-reef'], ['clam', 'octopus', 'OK', 'ADW-octopus'],
  ['parrotfish', 'whitetip', 'OK', 'ADW-whitetip'], ['octopus', 'whitetip', 'OK', 'ADW-whitetip'],
  ['greenturtle', 'tigershark', 'OK', 'ADW-tigershark'], ['crab', 'whitetip', 'OK', 'ADW-whitetip'],

  ['twigs', 'deer', 'OK', 'ADW-deer'], ['oak', 'squirrel', 'OK', 'ADW-squirrel'], ['clover', 'cottontail', 'OK', 'ADW-cottontail'],
  ['cottontail', 'redfox', 'OK', 'ADW-redfox'], ['berries', 'redfox', 'OK', 'ADW-redfox'], ['cottontail', 'owl', 'OK', 'ADW-ghowl'],
  ['squirrel', 'hawk', 'OK', 'ADW-squirrel'], ['deer', 'wolf', 'OK', 'ADW-deer'], ['berries', 'blackbear', 'OK', 'ADW-blackbear'],
  ['oak', 'blackbear', 'OK', 'ADW-blackbear'], ['squirrel', 'redfox', 'LESS', 'ADW-squirrel'], ['cottontail', 'wolf', 'LESS', 'ADW-wolf'],
  ['squirrel', 'owl', 'AVOID', 'ADW-ghowl'], ['deer', 'blackbear', 'AVOID', 'ADW-blackbear'],

  ['desertgrass', 'jackrabbit', 'OK', 'ADW-jackrabbit'], ['pricklypear', 'jackrabbit', 'LESS', 'ADW-jackrabbit'],
  ['jackrabbit', 'kitfox', 'OK', 'ADW-jackrabbit'], ['mesquite', 'krat', 'OK', 'ADW-krat'], ['krat', 'rattler', 'OK', 'ADW-krat'],
  ['rattler', 'deserthawk', 'OK', 'ADW-rattler'], ['desertgrass', 'grasshopper', 'OK', 'WIKI-grasshopper'],
  ['grasshopper', 'scorpion', 'OK', 'SDZ-scorpion'], ['grasshopper', 'roadrunner', 'OK', 'ADW-roadrunner'],
  ['scorpion', 'roadrunner', 'OK', 'ADW-roadrunner'], ['pricklypear', 'roadrunner', 'OK', 'ADW-roadrunner'],
  ['roadrunner', 'deserthawk', 'OK', 'ADW-roadrunner'], ['desertgrass', 'tortoise', 'OK', 'ADW-tortoise'],
  ['rattler', 'roadrunner', 'AVOID', 'ADW-roadrunner'], ['krat', 'kitfox', 'AVOID', '-'],

  ['prairiegrass', 'bison', 'OK', 'ADW-bison'], ['prairiegrass', 'grasshopper', 'OK', 'WIKI-grasshopper'],
  ['grasshopper', 'meadowlark', 'OK', 'MEADOW']
];
export const LINKS = LK.map(([food, eater, status, src]) => ({ food, eater, status, src }));

const linkOf = (food, eater) => LINKS.find((l) => l.food === food && l.eater === eater) || null;
/** A shown, true "gives food to". */
export const ok = (food, eater) => { const l = linkOf(food, eater); return !!l && l.status === 'OK'; };
/** Any link at all, either way round: such a pair is never a wrong answer. */
const touches = (a, b) => !!(linkOf(a, b) || linkOf(b, a));

/* The soil tile: never a producer, always the tempting wrong plant. */
export const SOIL = 'soil';

/* ------------------------------------------------------------------ */
/* Chains                                                              */
/* ------------------------------------------------------------------ */

/** Every chain of OK links from a producer, `len` living things long, in one habitat. */
export function chains(len) {
  const out = [];
  const walk = (path) => {
    if (path.length === len) { out.push(path.slice()); return; }
    const last = path[path.length - 1];
    for (const l of LINKS) {
      if (l.food === last && l.status === 'OK' && !path.includes(l.eater)) {
        path.push(l.eater);
        walk(path);
        path.pop();
      }
    }
  };
  SPECIES.filter((s) => s.role === 'producer').forEach((s) => walk([s.id]));
  return out;
}

/** Is `c` right in slot k of a chain (the Sun is before slot 0)? */
export function fits(nodes, k, c) {
  if (c === SOIL) return false;
  const sp = species(c);
  if (!sp) return false;
  if (k === 0 && sp.role !== 'producer') return false;
  if (k > 0 && !ok(nodes[k - 1], c)) return false;
  if (k < nodes.length - 1 && !ok(c, nodes[k + 1])) return false;
  return true;
}

/**
 * Wrong answers that are surely wrong for slot k: the wrong kind of eater,
 * from animals that eat only plants or only animals (never an omnivore,
 * never a recycler), with no link of any kind to either neighbour. A plant
 * slot always offers the soil, the wrong idea this game is about.
 */
function decoysFor(nodes, k, rng, n = 2) {
  const prev = k > 0 ? nodes[k - 1] : null;
  const next = k < nodes.length - 1 ? nodes[k + 1] : null;
  const emojisUsed = new Set(nodes.map((id) => species(id).emoji));
  const safe = (s) => {
    if (nodes.includes(s.id) || emojisUsed.has(s.emoji)) return false;
    if ((prev && touches(prev, s.id)) || (next && touches(s.id, next))) return false;
    if (k === 0) return s.pure;                                        // an animal in a plant slot
    if (!s.pure) return false;
    const eatsPlants = species(prev).role === 'producer';
    return eatsPlants ? s.role === 'meat' : s.role === 'plant';
  };
  const pool = shuffled(rng, SPECIES.filter(safe).map((s) => s.id));
  /* Prefer animals from the same part of the world. */
  const home = REGION[species(nodes[k]).eco];
  pool.sort((a, b) => (REGION[species(a).eco] === home ? 0 : 1) - (REGION[species(b).eco] === home ? 0 : 1));
  const picks = k === 0 ? [SOIL, ...pool.slice(0, n - 1)] : pool.slice(0, n);
  return picks.length === n ? picks : null;
}

/* ------------------------------------------------------------------ */
/* Webs                                                                */
/* ------------------------------------------------------------------ */

/** A small food web from one habitat: its nodes and the OK links among them. */
function makeWeb(rng, eco, size) {
  const inEco = SPECIES.filter((s) => s.eco === eco || (s.also || []).includes(eco));
  const ids = new Set(inEco.map((s) => s.id));
  const edges = LINKS.filter((l) => l.status === 'OK' && ids.has(l.food) && ids.has(l.eater));
  /* Grow from a top eater downwards so every node is fed in the picture. */
  const tops = shuffled(rng, [...new Set(edges.map((e) => e.eater))].filter((id) => !edges.some((e) => e.food === id)));
  const keep = new Set();
  const addDown = (id) => {
    if (keep.size >= size || keep.has(id)) return;
    keep.add(id);
    for (const e of shuffled(rng, edges.filter((x) => x.eater === id))) addDown(e.food);
  };
  for (const t of tops) { if (keep.size >= size) break; addDown(t); }
  const nodes = [...keep];
  const shown = edges.filter((e) => keep.has(e.food) && keep.has(e.eater));
  /* Every animal shown must have food in the picture, and emoji must differ. */
  const fed = nodes.every((id) => species(id).role === 'producer' || shown.some((e) => e.eater === id));
  if (!fed || new Set(nodes.map((id) => species(id).emoji)).size !== nodes.length) return null;
  return { nodes: nodes.sort(), edges: shown.map((e) => [e.food, e.eater]) };
}

/** Who has nothing left to eat once `gone` is taken away, in this picture. */
export function hungry(web, gone) {
  const out = new Set([gone]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of web.nodes) {
      if (out.has(id) || species(id).role === 'producer') continue;
      const foods = web.edges.filter(([, eater]) => eater === id).map(([food]) => food);
      if (foods.length && foods.every((f) => out.has(f))) { out.add(id); changed = true; }
    }
  }
  out.delete(gone);
  return out;
}

/** How high each node sits: plants 0, and one more than its highest food. */
export function levels(web) {
  const lv = new Map();
  const get = (id, seen = new Set()) => {
    if (lv.has(id)) return lv.get(id);
    if (seen.has(id)) return 0;
    seen.add(id);
    const foods = web.edges.filter(([, e]) => e === id).map(([f]) => f);
    const v = foods.length ? 1 + Math.max(...foods.map((f) => get(f, seen))) : 0;
    lv.set(id, v);
    return v;
  };
  web.nodes.forEach((id) => get(id));
  return lv;
}

/* ------------------------------------------------------------------ */
/* Chapters                                                            */
/* ------------------------------------------------------------------ */

export const CHAPTER_SIZE = 30;
export const TEACH = 2;
export const sizeOf = (ch) => ch.size || CHAPTER_SIZE;

/*   chain   fill the blank slots of a chain
     arrow   one arrow points the wrong way: which?
     web     does X eat Y in this picture?
     hungry  one is taken away: who is hungry, who is fine?
     roles   plant-maker, plant-eater, meat-eater, both, or recycler? */
export const CHAPTERS = {
  easy: [
    { id: 'e1', kind: 'chain', icon: '🦓' },
    { id: 'e2', kind: 'chain', icon: '☀️' },
    { id: 'e3', kind: 'chain', icon: '🦁' }
  ],
  medium: [
    { id: 'm1', kind: 'chain', icon: '🧩' },
    { id: 'm2', kind: 'arrow', icon: '↔️' },
    { id: 'm3', kind: 'chain', icon: '🐧' }
  ],
  hard: [
    { id: 'h1', kind: 'web', icon: '🕸️' },
    { id: 'h2', kind: 'hungry', icon: '🍽️' },
    { id: 'h3', kind: 'roles', icon: '♻️' }
  ]
};

export function chapter(id) {
  for (const level of LEVELS) {
    const c = CHAPTERS[level].find((x) => x.id === id);
    if (c) return { ...c, level };
  }
  return null;
}

const COLD = new Set(['ocean', 'arctic', 'reef']);
const FAMILIAR = new Set(['savanna', 'forest', 'desert', 'prairie', 'bamboo', 'rainforest']);

/** A chain puzzle: a chain, blanks at `blanks`, three choices for each. */
function chainPuzzle(rng, nodes, blanks) {
  const choices = {};
  for (const k of blanks) {
    const wrong = decoysFor(nodes, k, rng);
    if (!wrong) return null;
    choices[k] = shuffled(rng, [nodes[k], ...wrong]);
  }
  return { kind: 'chain', nodes, blanks, choices };
}

const pickChain = (rng, len, test) => {
  const list = chains(len).filter((c) => test(species(c[0]).eco));
  return list.length ? pickOne(rng, list) : null;
};

export function makePuzzle(ch, rng, i = TEACH) {
  const teach = i < TEACH;
  for (let tries = 0; tries < 80; tries++) {
    let p = null;
    switch (ch.id) {
      case 'e1': {
        /* Sun -> plant -> [?]: who eats this plant? */
        const nodes = teach ? (i === 0 ? ['grass', 'zebra'] : ['acacia', 'giraffe']) : pickChain(rng, 2, (e) => FAMILIAR.has(e));
        if (nodes) p = chainPuzzle(rng, nodes, [1]);
        break;
      }
      case 'e2': {
        /* Sun -> [?] -> animal: the plant, never the soil. */
        const nodes = teach ? (i === 0 ? ['acacia', 'giraffe'] : ['bamboo', 'panda']) : pickChain(rng, 2, () => true);
        if (nodes) p = chainPuzzle(rng, nodes, [0]);
        break;
      }
      case 'e3': {
        const nodes = teach ? (i === 0 ? ['grass', 'zebra', 'lion'] : ['grass', 'gazelle', 'cheetah']) : pickChain(rng, 3, (e) => FAMILIAR.has(e));
        if (nodes) p = chainPuzzle(rng, nodes, [2]);
        break;
      }
      case 'm1': {
        /* Two gaps, never side by side. */
        const len = 3 + randInt(rng, 2);
        const nodes = pickChain(rng, len, () => true);
        if (!nodes) break;
        const first = randInt(rng, len);
        const second = pickOne(rng, Array.from({ length: len }, (_, k) => k).filter((k) => Math.abs(k - first) > 1));
        if (second === undefined) break;
        p = chainPuzzle(rng, nodes, [first, second].sort((a, b) => a - b));
        break;
      }
      case 'm2': {
        /* One arrow is backwards. */
        const nodes = teach ? (i === 0 ? ['grass', 'zebra', 'lion'] : ['sedge', 'lemming', 'arcticfox']) : pickChain(rng, 3 + randInt(rng, 2), () => true);
        if (!nodes) break;
        const flip = teach ? (i === 0 ? 1 : 2) : 1 + randInt(rng, nodes.length - 1);
        p = { kind: 'arrow', nodes, flip };
        break;
      }
      case 'm3': {
        /* Sea and ice: krill, cod, seals, sharks. */
        const nodes = teach ? (i === 0 ? ['phyto', 'krill', 'adelie'] : ['phyto', 'krill', 'crabeater', 'orca'])
          : pickChain(rng, 3 + randInt(rng, 2), (e) => COLD.has(e));
        if (!nodes) break;
        const k = teach ? (i === 0 ? 1 : 2) : 1 + randInt(rng, nodes.length - 1);
        p = chainPuzzle(rng, nodes, [k]);
        break;
      }
      case 'h1': {
        /* Does X eat Y, in this picture? One yes and one no. */
        const eco = pickOne(rng, ['savanna', 'forest', 'desert', 'ocean', 'arctic', 'reef']);
        const web = makeWeb(rng, eco, 5 + randInt(rng, 2));
        if (!web) break;
        const lv = levels(web);
        const pairs = [];
        for (const x of web.nodes) for (const y of web.nodes) {
          if (lv.get(x) > lv.get(y) && species(x).role !== 'producer') pairs.push([x, y]);
        }
        const yes = shuffled(rng, pairs.filter(([x, y]) => web.edges.some(([f, e]) => f === y && e === x)));
        /* A "no" must be no anywhere, not only in the picture. */
        const no = shuffled(rng, pairs.filter(([x, y]) => !web.edges.some(([f, e]) => f === y && e === x) && !touches(y, x)));
        if (!yes.length || !no.length) break;
        p = { kind: 'web', web, qs: shuffled(rng, [yes[0], no[0]]) };
        break;
      }
      case 'h2': {
        /* Take one away: who is hungry now? */
        const eco = pickOne(rng, ['savanna', 'forest', 'desert', 'ocean', 'arctic', 'reef']);
        const web = makeWeb(rng, eco, 5 + randInt(rng, 2));
        if (!web) break;
        const gone = pickOne(rng, web.nodes.filter((id) => web.edges.some(([f]) => f === id)));
        const h = hungry(web, gone);
        const animals = web.nodes.filter((id) => id !== gone && species(id).role !== 'producer');
        if (!h.size || h.size === animals.length) break;
        p = { kind: 'hungry', web, gone, ask: animals };
        break;
      }
      case 'h3': {
        /* Sort them: one of each kind where possible. */
        const pool = SPECIES.filter((s) => s.sort);
        const roles = ['producer', 'plant', 'meat', 'both', 'recycler'];
        const picks = shuffled(rng, roles).slice(0, 4).map((r) => pickOne(rng, pool.filter((s) => s.role === r)).id);
        if (new Set(picks.map((id) => species(id).emoji)).size !== picks.length) break;
        p = { kind: 'roles', ask: picks };
        break;
      }
      default: return null;
    }
    if (p && !problems(p).length) return p;
  }
  return null;
}

export const makeAt = (chId, i, ...seed) => makePuzzle(chapter(chId), rngFor('chain', chId, i, ...seed), i);

export function sig(p) {
  switch (p.kind) {
    case 'chain': return `chain|${p.nodes.join('>')}|${p.blanks.map((k) => `${k}:${[...p.choices[k]].sort().join(',')}`).join(';')}`;
    case 'arrow': return `arrow|${p.nodes.join('>')}|${p.flip}`;
    case 'web': return `web|${p.web.nodes.join(',')}|${p.qs.map((q) => q.join('<')).join(';')}`;
    case 'hungry': return `hungry|${p.web.nodes.join(',')}|${p.gone}`;
    case 'roles': return `roles|${[...p.ask].sort().join(',')}`;
    default: return JSON.stringify(p);
  }
}

/* ------------------------------------------------------------------ */
/* Answers and proof                                                   */
/* ------------------------------------------------------------------ */

export function answers(p) {
  switch (p.kind) {
    case 'chain': return p.blanks.map((k) => p.nodes[k]);
    case 'arrow': return [p.flip];
    case 'web': return p.qs.map(([x, y]) => (p.web.edges.some(([f, e]) => f === y && e === x) ? 'yes' : 'no'));
    case 'hungry': { const h = hungry(p.web, p.gone); return p.ask.map((id) => (h.has(id) ? 'hungry' : 'fine')); }
    case 'roles': return p.ask.map((id) => species(id).role);
    default: return [];
  }
}

export const ROLES = ['producer', 'plant', 'meat', 'both', 'recycler'];

export function choices(p) {
  switch (p.kind) {
    case 'chain': return p.blanks.map((k) => p.choices[k]);
    case 'arrow': return [Array.from({ length: p.nodes.length - 1 }, (_, k) => k + 1)];
    case 'web': return p.qs.map(() => ['yes', 'no']);
    case 'hungry': return p.ask.map(() => ['hungry', 'fine']);
    case 'roles': return p.ask.map(() => ROLES);
    default: return [];
  }
}

export function problems(p) {
  const errs = [];
  const err = (m) => errs.push(m);
  switch (p.kind) {
    case 'chain': {
      p.nodes.forEach((id, k) => {
        if (!species(id)) err(`unknown species ${id}`);
        if (k === 0 && species(id) && species(id).role !== 'producer') err('a chain must start with a plant');
        if (k > 0 && !ok(p.nodes[k - 1], id)) err(`${p.nodes[k - 1]} -> ${id} is not a sourced link`);
      });
      for (const k of p.blanks) {
        const good = p.choices[k].filter((c) => fits(p.nodes, k, c));
        if (good.length !== 1 || good[0] !== p.nodes[k]) err(`slot ${k}: ${good.length} choices fit`);
        for (const c of p.choices[k]) {
          if (c === p.nodes[k] || c === SOIL) continue;
          const prev = k > 0 ? p.nodes[k - 1] : null;
          const next = k < p.nodes.length - 1 ? p.nodes[k + 1] : null;
          if ((prev && touches(prev, c)) || (next && touches(c, next))) err(`slot ${k}: wrong answer ${c} has a real link to its neighbour`);
          if (!species(c).pure) err(`slot ${k}: ${c} does not eat only plants or only animals`);
        }
      }
      if (p.blanks.some((k, j) => j && k - p.blanks[j - 1] < 2)) err('two blanks side by side');
      break;
    }
    case 'arrow':
      if (p.flip < 1 || p.flip >= p.nodes.length) err('the backwards arrow is not between two living things');
      p.nodes.forEach((id, k) => { if (k > 0 && !ok(p.nodes[k - 1], id)) err(`${p.nodes[k - 1]} -> ${id} is not a sourced link`); });
      break;
    case 'web':
      for (const [f, e] of p.web.edges) if (!ok(f, e)) err(`${f} -> ${e} is not a sourced link`);
      for (const [x, y] of p.qs) {
        const shown = p.web.edges.some(([f, e]) => f === y && e === x);
        if (!shown && touches(y, x)) err(`"does ${x} eat ${y}" would be no in the picture but is true in the wild`);
      }
      break;
    case 'hungry': {
      for (const [f, e] of p.web.edges) if (!ok(f, e)) err(`${f} -> ${e} is not a sourced link`);
      const h = hungry(p.web, p.gone);
      if (!h.size) err('nobody goes hungry');
      if (!p.ask.some((id) => !h.has(id))) err('everybody goes hungry');
      break;
    }
    case 'roles':
      for (const id of p.ask) if (!species(id) || !species(id).sort) err(`${id} does not sort cleanly`);
      break;
    default: err(`unknown kind ${p.kind}`);
  }
  return errs;
}

/** 3 clean, 2 after one slip or hint, 1 after that; teaching is always 3. */
export function starsFor({ wrong = 0, hints = 0, teach = false } = {}) {
  if (teach) return 3;
  const n = wrong + hints;
  return n === 0 ? 3 : n === 1 ? 2 : 1;
}

export default {
  LEVELS, REGION, SPECIES, species, LINKS, ok, SOIL, chains, fits, hungry, levels, CHAPTER_SIZE, TEACH, sizeOf, CHAPTERS,
  chapter, makePuzzle, makeAt, sig, answers, ROLES, choices, problems, starsFor
};
