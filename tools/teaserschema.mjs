/**
 * What a Math Brain Teaser must be. One set of rules, used by both
 * tools/teaserscheck.mjs (the whole bank) and tools/teasersmerge.mjs (a batch,
 * before anything is written), so the merge tool cannot let in a teaser the
 * checker would then refuse.
 */

const { evaluate } = await import('../assets/js/modules/teasers.js');

export const LEVELS = {
  easy: { name: { en: 'Easy', es: 'Fácil' }, ages: '6–8', choices: 3 },
  medium: { name: { en: 'Medium', es: 'Medio' }, ages: '8–10', choices: 4 },
  hard: { name: { en: 'Hard', es: 'Difícil' }, ages: '10–13', choices: 4 }
};

/* Who, if anyone, owns the puzzle. `modern-original` is recorded so it can be
   named, and refused: those are replaced, not shipped. */
export const RIGHTS = ['public-domain', 'traditional'];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export const fold = (s) => String(s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** Every number written in a piece of text, "1,000" read as 1000. */
export const numbersIn = (s) => (String(s || '').replace(/(\d)[,\s](\d{3})\b/g, '$1$2')
  .match(/-?\d+(\.\d+)?/g) || []).map(Number);

/* Every number the English tile says, the Spanish tile says too. Not the
   other way round: Spanish names coins by value, so "3 quarters" is rightly
   "3 de 25 centavos". */
const keepsNumbers = (en, es) => {
  const have = numbersIn(es);
  return numbersIn(en).every((v) => have.includes(v));
};

/**
 * The problems with one teaser, as a list of sentences; empty means fine.
 * `level` is the file it belongs to; `withId` is false for a batch not yet
 * given ids.
 */
export function problems(x, level, { withId = true } = {}) {
  const out = [];
  const bad = (m) => out.push(m);
  if (!x || typeof x !== 'object') return ['not an object'];
  if (!LEVELS[level]) return [`no level called "${level}"`];

  if (withId && !new RegExp(`^${level}-\\d{3}$`).test(x.id || '')) bad(`id must be ${level}-NNN`);
  if (x.level !== level) bad(`level says "${x.level}" but it belongs in ${level}`);
  if (!['number', 'trick', 'logic'].includes(x.kind)) bad('kind must be number, trick or logic');
  if (!/^https:\/\/\S+$/.test(x.source || '')) bad('no source link');
  if (!x.sourceName) bad('no sourceName');

  /* Rights, and the evidence for them. alsoFound is evidence that a riddle
     is everyone's, not a link a child follows, so plain http counts. */
  if (x.rights === 'modern-original') bad('rights: modern-original; replace it with a public-domain or traditional teaser');
  else if (!RIGHTS.includes(x.rights)) bad(`rights must be ${RIGHTS.join(' or ')}`);
  if (!x.origin) bad('no origin (the book, the puzzle, or "folk riddle")');
  const basic = /basic exercise|math fact/i.test(x.origin || '');
  if (x.rights === 'traditional' && !basic) {
    /* Two other sites, not two pages of one site and not the source again:
       a riddle only one publisher prints may well be that publisher's own. */
    const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return null; } };
    const others = new Set((Array.isArray(x.alsoFound) ? x.alsoFound : [])
      .filter((u) => /^https?:\/\//.test(u)).map(host).filter(Boolean));
    others.delete(host(x.source));
    if (others.size < 2) bad('traditional needs two other sites it was found on (alsoFound), apart from the source');
  }

  /* The human review: answer solved independently, and wording read for a
     second meaning. Dates, so a later reader knows how old the check is. */
  if (!DATE.test(x.qa?.solved || '')) bad('qa.solved: the date the answer was worked out independently');
  if (!DATE.test(x.qa?.checked || '')) bad('qa.checked: the date the wording was read for ambiguity');

  for (const lang of ['en', 'es']) {
    if (!x.q?.[lang]) bad(`no ${lang} question`);
    if (!x.why?.[lang]) bad(`no ${lang} why`);
    if (x.hint && !x.hint[lang]) bad(`hint has no ${lang}`);
  }

  const choices = Array.isArray(x.choices) ? x.choices : [];
  const want = LEVELS[level].choices;
  if (choices.length !== want) bad(`${choices.length} choices, ${level} needs ${want}`);
  if (choices.some((c) => !c || !c.en || !c.es)) bad('a choice is missing a language');
  /* Compared with their signs kept: "555 − 55" and "5555 − 5" are different
     answers even though they share every digit. */
  const plain = choices.map((c) => String(c?.en).toLowerCase().replace(/\s+/g, ' ').trim());
  if (new Set(plain).size !== plain.length) bad('two choices say the same thing');
  /* A number dropped or changed in translation makes the right answer wrong
     in one language only, so every tile is compared. */
  choices.forEach((c, k) => {
    if (c?.en && c?.es && !keepsNumbers(c.en, c.es)) bad(`choice ${k}: "${c.es}" does not say every number in "${c.en}"`);
  });
  if (!Number.isInteger(x.answer) || x.answer < 0 || x.answer >= choices.length) {
    bad(`answer ${x.answer} is not one of the choices`);
    return out;
  }

  if (x.kind === 'number') {
    const v = evaluate(x.check);
    if (typeof x.value !== 'number' || !Number.isFinite(x.value)) bad('no numeric value');
    else if (!Number.isFinite(v)) bad(`check "${x.check}" does not work out`);
    else if (Math.abs(v - x.value) > 1e-9) bad(`check "${x.check}" is ${v}, not ${x.value}`);
    if (typeof x.value === 'number' && !numbersIn(choices[x.answer].en).includes(x.value)) {
      bad(`the right choice "${choices[x.answer].en}" does not say ${x.value}`);
    }
  }
  return out;
}
