#!/usr/bin/env node
/**
 * Check the Curio Trivia bank.
 *
 * Every question is read against the writing rules in
 * docs/research/trivia/PLAN.md: its shape, both languages, no negatives in the
 * stem, nothing that goes out of date, stems short enough for the age, a "why"
 * that teaches, an emoji on every Easy choice, Spanish punctuation and accents.
 * Then the round builder is run against the shipped bank to prove it can draw
 * a round at every level, in every category, in both languages.
 *
 *   node tools/triviacheck.mjs                 check everything
 *   node tools/triviacheck.mjs --write         also rewrite the manifest counts
 *   node tools/triviacheck.mjs --file space.json [--file ...]
 *                                              check only these files (for a
 *                                              writer working on one batch)
 */

import fs from 'node:fs';
import path from 'node:path';

const DIR = 'data/fun/trivia';
const MANIFEST = path.join(DIR, 'manifest.json');
const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const ONLY = args.flatMap((a, i) => (a === '--file' ? [args[i + 1]] : []));
/* --candidate <path>: read the one --file from this path instead (the merge
   tool checks its temporary file before it replaces the real one).
   --strict-stems: with --file, load every other topic's stems too, and make a
   stem that another file already asks an error rather than a warning. */
const CANDIDATE = args.includes('--candidate') ? args[args.indexOf('--candidate') + 1] : null;
const STRICT_STEMS = args.includes('--strict-stems');
if (CANDIDATE && ONLY.length !== 1) {
  console.error('--candidate needs exactly one --file');
  process.exit(2);
}

const { buildRound, makeChoices, eligible, fold, LEVEL_IDS } =
  await import('../assets/js/modules/trivia.js');

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));

/* ---- the rules ---- */

const ONE_LANG_OK = new Set(['words', 'puzzles']);
const STEM_WORDS = { easy: [4, 9], medium: [5, 15], hard: [3, 25] };
const NOMINAL_MIN = { easy: 5, medium: 8, hard: 0 };
const WHY_WORDS = [12, 25];
const SEED_MIN = 3;
const SHIP_GATE = 30;
const PHYSICS_FLOOR = {
  'forces and motion': 12, energy: 10, 'light and sound': 10,
  'electricity and magnets': 8, 'the universe': 10
};

/* \b only knows ASCII, so "Inglés" would never match it. Unicode-aware edges. */
const wb = (src, flags = 'i') => new RegExp(`(?<![\\p{L}\\p{N}])(?:${src})(?![\\p{L}\\p{N}])`, `${flags}u`);
const NEGATIVE = {
  en: wb('not|except|never'),
  es: wb('no es|excepto|nunca')
};
const ABOVE = /^(all|none) of the above$|^(todas|ninguna) de las anteriores$/i;
const DATED = {
  en: wb('currently|today|this year|newest|latest|most recent|records?|tallest building|largest population|presidents?|champions?'),
  es: wb('actualmente|hoy en día|este año|más reciente|récords?|presidentes?|presidenta|campeón|campeona')
};
const OUT_OF_SCOPE = {
  en: wb("guns?|rifles?|pistols?|bombs?|murder\\w*|suicide|casualt(?:y|ies)|gore|bloody|ugly|stupid|dumb|bible|koran|quran|coca-cola|pepsi|mcdonald'?s|nike|adidas|disney|nintendo|playstation|iphone"),
  es: wb('pistolas?|rifles?|bombas?|asesin\\p{L}*|suicidio|víctimas mortales|feos?|feas?|tontos?|tontas?|estúpid\\p{L}*|biblia|corán|coca-cola|pepsi|nike|adidas|disney|nintendo|playstation|iphone')
};
const TF = { en: ['True', 'False'], es: ['Cierto', 'Falso'] };
const LOWER_ES = new RegExp(`(?<![\\p{L}])(?:Enero|Febrero|Marzo|Abril|Mayo|Junio|Julio|Agosto|Septiembre|Octubre|Noviembre|Diciembre|Lunes|Martes|Miércoles|Jueves|Viernes|Sábado|Domingo|Primavera|Verano|Otoño|Invierno|Español|Inglés|Francés|Alemán|Portugués|Italiano|Chino|Japonés|Mexicano|Mexicana|Mexicanos|Colombiano|Colombiana|Argentino|Peruano|Chileno|Cubano|Estadounidense|Canadiense|Brasileño|Brasileña|Egipcio|Egipcios|Romano|Romanos|Griego|Griegos)(?![\\p{L}])`, 'gu');
const UNACCENTED = /¿\s*(que|cual|cuales|como|donde|cuanto|cuanta|cuantos|cuantas|cuando|quien|quienes|por que)(?![\p{L}])/iu;

const words = (s) => String(s || '').trim().split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
const graphemes = (s) => [...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(s)].length;
const BAD_EMOJI = /[\u{1F3FB}-\u{1F3FF}\u{1F1E6}-\u{1F1FF}♀♂]/u;
const IS_EMOJI = /\p{Extended_Pictographic}|\p{Regional_Indicator}|[#*0-9]️?⃣/u;

function checkEmoji(where, e) {
  if (typeof e !== 'string' || !e) { err(`${where}: missing emoji`); return; }
  if (graphemes(e) !== 1 || !IS_EMOJI.test(e)) err(`${where}: "${e}" is not exactly one emoji`);
  if (BAD_EMOJI.test(e)) err(`${where}: "${e}" carries a flag, skin-tone or gender sign`);
}

/* A Spanish month or language is lowercase except where a sentence starts. */
function checkSpanishCase(where, s) {
  for (const m of String(s).matchAll(LOWER_ES)) {
    const before = s.slice(0, m.index).trim();
    if (before === '' || /[.!?¿¡:"«“]$/.test(before)) continue;
    err(`${where}: "${m[0]}" should be lowercase in Spanish`);
  }
}

/* ---- load the files ---- */

const onDisk = fs.readdirSync(DIR).filter((f) => f.endsWith('.json') && f !== 'manifest.json');
const named = new Set(manifest.categories.map((c) => c.file));
if (!ONLY.length) {
  for (const f of onDisk) if (!named.has(f)) err(`${f} is on disk but not in the manifest`);
}
if (!Array.isArray(manifest.levels) || manifest.levels.map((l) => l.id).join() !== LEVEL_IDS.join()) {
  err('manifest levels must be easy, medium, hard in that order');
}

const pool = {};
const allIds = new Map();
const stemsByLevel = new Map();   // folded stem -> [where, level, category]
const table = [];
let shortStems = 0;

if (ONLY.length && STRICT_STEMS) {
  for (const cat of manifest.categories.filter((c) => !ONLY.includes(c.file))) {
    const other = JSON.parse(fs.readFileSync(path.join(DIR, cat.file), 'utf8'));
    for (const q of other.questions || []) {
      const langs = !q.lang || q.lang === 'both' ? ['en', 'es'] : [q.lang];
      for (const l of langs) {
        const k = `${l}:${fold(q.q && q.q[l])}`;
        if (!stemsByLevel.has(k)) stemsByLevel.set(k, { id: q.id, level: q.level, cat: cat.id });
      }
    }
  }
}

for (const cat of manifest.categories) {
  if (ONLY.length && !ONLY.includes(cat.file)) continue;
  for (const k of ['id', 'emoji', 'name', 'es', 'file']) {
    if (!cat[k]) err(`manifest: category ${cat.id || '?'} has no ${k}`);
  }
  const file = CANDIDATE || path.join(DIR, cat.file);
  if (!fs.existsSync(file)) { err(`${cat.file}: named in the manifest but missing`); continue; }
  let data;
  try { data = JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { err(`${cat.file}: not valid JSON (${e.message})`); continue; }
  if (data.category !== cat.id) err(`${cat.file}: category is "${data.category}", expected "${cat.id}"`);
  if (!data.attribution || !data.attribution.facts) err(`${cat.file}: no attribution recorded`);
  const qs = Array.isArray(data.questions) ? data.questions : [];
  if (!qs.length) err(`${cat.file}: no questions`);
  pool[cat.id] = qs;

  const fileStems = new Map();
  for (const [i, q] of qs.entries()) {
    const where = `${cat.file}: ${q.id || `question ${i + 1}`}`;
    const e = (m) => err(`${where}: ${m}`);

    /* shape */
    if (!LEVEL_IDS.includes(q.level)) { e(`level "${q.level}" is not easy, medium or hard`); continue; }
    const idRe = new RegExp(`^${cat.id}-${q.level}-\\d{3,}$`);
    if (!idRe.test(q.id || '')) e(`id must look like ${cat.id}-${q.level}-001`);
    if (allIds.has(q.id)) e(`id also used in ${allIds.get(q.id)}`);
    allIds.set(q.id, cat.file);
    if (!['mc', 'tf'].includes(q.type)) e(`type "${q.type}" is not mc or tf`);
    const lang = q.lang || 'both';
    if (!['both', 'en', 'es'].includes(lang)) e(`lang "${q.lang}" is not both, en or es`);
    if (lang !== 'both' && !ONE_LANG_OK.has(cat.id)) e('only words and puzzles may be one language');
    const langs = lang === 'both' ? ['en', 'es'] : [lang];
    const absent = lang === 'both' ? [] : [lang === 'en' ? 'es' : 'en'];

    const hasText = (obj, name) => {
      if (!obj || typeof obj !== 'object') { e(`${name} is missing`); return false; }
      let ok = true;
      for (const l of langs) {
        if (typeof obj[l] !== 'string' || !obj[l].trim()) { e(`${name}.${l} is missing`); ok = false; }
      }
      for (const l of absent) if (obj[l] !== undefined) e(`${name}.${l} must not exist on a ${lang}-only question`);
      return ok;
    };
    if (!hasText(q.q, 'q') || !hasText(q.why, 'why')) continue;
    if (!Array.isArray(q.choices)) { e('choices missing'); continue; }
    q.choices.forEach((c, n) => hasText(c, `choice ${n + 1}`));
    if (q.emoji !== undefined) checkEmoji(`${where}: question`, q.emoji);

    /* choices */
    if (q.type === 'tf') {
      if (q.level === 'easy') e('true/false is never used at Easy');
      if (q.choices.length !== 2) e('a true/false question has exactly two choices');
      for (const l of langs) {
        if (q.choices.map((c) => c[l]).join() !== TF[l].join()) e(`true/false choices must be ${TF[l].join(', ')} in that order`);
      }
    } else {
      const [lo, hi] = [3, 4];
      if (q.choices.length < lo || q.choices.length > hi) e(`${q.choices.length} choices; want ${q.level === 'easy' ? 3 : 4}`);
      if (q.level !== 'easy' && q.choices.length === 3) warn(`${where}: three choices at ${q.level}; four is the rule`);
      if (q.level === 'easy' && q.choices.length === 4) warn(`${where}: four choices at Easy; the last distractor will be dropped`);
    }
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.choices.length) e('answer index out of range');
    for (const l of langs) {
      const folded = q.choices.map((c) => fold(c[l]));
      if (new Set(folded).size !== folded.length) e(`two choices read the same in ${l}`);
      for (const c of q.choices) if (ABOVE.test(String(c[l]).trim())) e(`"${c[l]}" is not allowed as a choice`);
    }
    if (q.level === 'easy') {
      q.choices.forEach((c, n) => checkEmoji(`${where}: choice ${n + 1}`, c.emoji));
      const ans = q.choices[q.answer];
      if (ans && q.choices.some((c, n) => n !== q.answer && c.emoji === ans.emoji)) {
        e('the answer shares its emoji with a distractor');
      }
    } else {
      q.choices.forEach((c, n) => { if (c.emoji !== undefined) checkEmoji(`${where}: choice ${n + 1}`, c.emoji); });
    }

    /* the stem */
    const main = langs.includes('en') ? 'en' : 'es';
    const n = words(q.q[main]);
    const [minW, maxW] = STEM_WORDS[q.level];
    if (n > maxW) e(`stem is ${n} words; ${q.level} allows ${maxW}`);
    if (n < minW) e(`stem is ${n} words; ${q.level} needs at least ${minW}`);
    if (n < NOMINAL_MIN[q.level]) shortStems += 1;
    for (const l of langs) {
      const stem = q.q[l];
      if (NEGATIVE[l].test(stem)) e(`no negatives in the stem (${l}): "${stem}"`);
      if (q.level === 'easy' && /\d/.test(stem)) e(`Easy stems spell numbers out (${l}): "${stem}"`);
      for (const part of [stem, q.why[l]]) {
        const d = part.match(DATED[l]);
        if (d) e(`time-sensitive word "${d[0]}" (${l})`);
        for (const y of part.match(/\b(20[1-9]\d)\b/g) || []) {
          const isAnswer = cat.id === 'history' && String(text0(q, l)).includes(y);
          if (Number(y) >= 2015 && !isAnswer) e(`the year ${y} will date this question`);
        }
      }
      for (const part of [stem, q.why[l], ...q.choices.map((c) => c[l])]) {
        const o = String(part).match(OUT_OF_SCOPE[l]);
        if (o) e(`out-of-scope word "${o[0]}" (${l})`);
      }
    }
    if (cat.id === 'why') {
      if (langs.includes('en') && !/^Why\b/.test(q.q.en)) e('every Why Is That? stem starts with "Why"');
      if (langs.includes('es') && !/^¿Por qué(?![\p{L}\p{N}])/u.test(q.q.es)) e('every ¿Por qué pasa eso? stem starts with "¿Por qué"');
    }

    /* Spanish */
    if (langs.includes('es')) {
      const s = q.q.es.trim();
      if (s.endsWith('?') && !s.includes('¿')) e(`Spanish question needs ¿: "${s}"`);
      if (s.endsWith('!') && !s.includes('¡')) e(`Spanish exclamation needs ¡: "${s}"`);
      if (UNACCENTED.test(s)) e(`question word needs its accent: "${s}"`);
      checkSpanishCase(`${where}: q.es`, s);
      checkSpanishCase(`${where}: why.es`, q.why.es);
      if (wb('vosotros|usted').test(`${s} ${q.why.es}`)) e('use tú and ustedes, never usted or vosotros');
    }

    /* why */
    for (const l of langs) {
      const w = words(q.why[l]);
      if (w < WHY_WORDS[0] || w > WHY_WORDS[1]) e(`why (${l}) is ${w} words; want ${WHY_WORDS[0]} to ${WHY_WORDS[1]}`);
    }

    if (typeof q.topic !== 'string' || !q.topic.trim() || q.topic !== q.topic.toLowerCase()) e('topic must be a short lowercase tag');
    if (typeof q.source !== 'string' || !/^https:\/\/\S+$/.test(q.source)) e('source must be one https URL');

    /* duplicate stems */
    for (const l of langs) {
      const k = `${l}:${fold(q.q[l])}`;
      if (fileStems.has(k)) e(`same stem as ${fileStems.get(k)}`);
      fileStems.set(k, q.id);
      const seenAt = stemsByLevel.get(k);
      if (seenAt && seenAt.cat !== cat.id && STRICT_STEMS) {
        e(`same stem as ${seenAt.id} in ${seenAt.cat}.json`);
      } else if (seenAt && seenAt.cat !== cat.id) {
        warn(`${where}: same stem as ${seenAt.id} in another file${cat.id === 'general' || seenAt.cat === 'general' ? ' (General Knowledge should not repeat)' : ''}`);
      } else if (seenAt && seenAt.level !== q.level) {
        warn(`${where}: same stem as ${seenAt.id} at another level; ask it differently`);
      }
      if (!seenAt) stemsByLevel.set(k, { id: q.id, level: q.level, cat: cat.id });
    }
  }

  /* per level */
  const row = { cat: cat.id, counts: {} };
  for (const level of LEVEL_IDS) {
    const at = qs.filter((q) => q.level === level);
    row.counts[level] = at.length;
    const tf = at.filter((q) => q.type === 'tf').length;
    if (tf > Math.max(1, Math.floor(at.length * 0.15))) err(`${cat.file}: ${tf} true/false at ${level}, more than 15%`);
    const pools = ONE_LANG_OK.has(cat.id) && at.some((q) => q.lang && q.lang !== 'both')
      ? { en: eligible(at, { level, lang: 'en' }).length, es: eligible(at, { level, lang: 'es' }).length }
      : { all: at.length };
    for (const [name, size] of Object.entries(pools)) {
      const label = name === 'all' ? '' : ` (${name})`;
      if (size < SEED_MIN) err(`${cat.file}: ${size} ${level} questions${label}; a round needs at least ${SEED_MIN}`);
      else if (size < SHIP_GATE) warnings.push(`__gate__${cat.id}`);
    }
    const topics = {};
    at.forEach((q) => { topics[q.topic] = (topics[q.topic] || 0) + 1; });
    const top = Object.entries(topics).sort((a, b) => b[1] - a[1]);
    if (at.length >= 8 && top[0] && top[0][1] > at.length / 4) {
      warn(`${cat.file}: "${top[0][0]}" is ${top[0][1]} of ${at.length} ${level} questions (over a quarter)`);
    }
    if (cat.id === 'physics' && at.length >= 60) {
      for (const [t, min] of Object.entries(PHYSICS_FLOOR)) {
        if ((topics[t] || 0) < min) err(`physics.json: ${level} has ${topics[t] || 0} "${t}", needs ${min}`);
      }
    }
    row[level] = { tf, en: at.filter((q) => q.lang === 'en').length, es: at.filter((q) => q.lang === 'es').length, top: top.slice(0, 3).map((t) => t[0]) };
  }
  table.push(row);

  /* manifest counts */
  if (!ONLY.length) {
    const want = row.counts;
    const have = cat.counts || {};
    const same = LEVEL_IDS.every((l) => have[l] === want[l]);
    if (!same) {
      if (WRITE) cat.counts = want;
      else err(`manifest counts for ${cat.id} are ${JSON.stringify(have)}, files say ${JSON.stringify(want)} (run with --write)`);
    }
  }
}

function text0(q, l) { return q.choices[q.answer] ? q.choices[q.answer][l] : ''; }

/* ---- the round builder against the real bank ---- */

const cats = Object.keys(pool);
let rounds = 0;
for (const level of LEVEL_IDS) {
  for (const lang of ['en', 'es']) {
    for (const category of [...cats, ...(ONLY.length ? [] : ['mixed'])]) {
      const setup = { level, lang, category, count: 15 };
      const avail = (category === 'mixed' ? cats : [category])
        .reduce((n, c) => n + eligible(pool[c], setup).length, 0);
      const round = buildRound(pool, setup, {});
      rounds += 1;
      const ids = round.map((x) => x.question.id);
      if (round.length !== Math.min(15, avail)) err(`round ${category}/${level}/${lang}: ${round.length} questions from ${avail}`);
      if (new Set(ids).size !== ids.length) err(`round ${category}/${level}/${lang} repeats a question`);
      if (round.some((x) => !eligible([x.question], setup).length)) err(`round ${category}/${level}/${lang} drew a question it should not`);
      if (category === 'mixed') {
        for (let i = 1; i < round.length; i += 1) {
          if (round[i].category === round[i - 1].category) err(`mixed ${level}/${lang}: ${round[i].category} twice in a row`);
        }
      }
    }
  }
}
for (const [c, qs] of Object.entries(pool)) {
  for (const q of qs) {
    if (!LEVEL_IDS.includes(q.level) || !Array.isArray(q.choices)) continue;
    const ch = makeChoices(q, q.level);
    if (q.level === 'easy' && q.type === 'mc' && ch.length !== 3) err(`${c}: ${q.id} gives ${ch.length} choices at Easy`);
    if (!ch.some((x) => x.index === q.answer)) err(`${c}: ${q.id} lost its answer`);
    for (const l of ['en', 'es']) {
      const t = ch.map((x) => x[l]).filter(Boolean).map(fold);
      if (new Set(t).size !== t.length) err(`${c}: ${q.id} shows two identical choices in ${l}`);
    }
  }
}

/* ---- report ---- */

if (WRITE && !ONLY.length && !errors.some((m) => !m.startsWith('manifest counts'))) {
  fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log('manifest counts written');
}

const pad = (s, n) => String(s).padEnd(n);
console.log(`${pad('category', 11)} ${pad('easy', 5)} ${pad('medium', 7)} ${pad('hard', 5)} tf  en/es  top topics (hard)`);
let grand = 0;
for (const r of table) {
  const total = LEVEL_IDS.reduce((n, l) => n + r.counts[l], 0);
  grand += total;
  const tf = LEVEL_IDS.reduce((n, l) => n + r[l].tf, 0);
  const one = LEVEL_IDS.reduce((n, l) => n + r[l].en, 0) + '/' + LEVEL_IDS.reduce((n, l) => n + r[l].es, 0);
  console.log(`${pad(r.cat, 11)} ${pad(r.counts.easy, 5)} ${pad(r.counts.medium, 7)} ${pad(r.counts.hard, 5)} ${pad(tf, 3)} ${pad(one, 6)} ${r.hard.top.join(', ')}`);
}
console.log(`${grand} questions in ${table.length} files; ${rounds} test rounds built`);
const gate = new Set(warnings.filter((m) => m.startsWith('__gate__')).map((m) => m.slice(8)));
const realWarnings = warnings.filter((m) => !m.startsWith('__gate__'));
if (gate.size) console.log(`${gate.size} categories are still under the ship gate of ${SHIP_GATE} per level`);
if (shortStems) console.log(`${shortStems} stems are shorter than the plan's nominal minimum (fine for a short question)`);

if (realWarnings.length) {
  console.log(`\nwarnings (${realWarnings.length}):`);
  realWarnings.slice(0, 40).forEach((m) => console.log(`  ! ${m}`));
}
if (errors.length) {
  console.log(`\nERRORS (${errors.length}):`);
  errors.slice(0, 60).forEach((m) => console.log(`  x ${m}`));
  process.exit(1);
}
console.log('\nNo errors.');
