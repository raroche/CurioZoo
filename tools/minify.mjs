/**
 * A small, careful CSS minifier for the deploy, so the stylesheet every page
 * waits for is about half the size on the wire, while the files in the
 * repository keep their comments (which explain a great deal).
 *
 * It only does what cannot change a rule's meaning:
 *   - drops comments, without joining what they kept apart;
 *   - turns every run of whitespace into one space, and drops that space
 *     where CSS never needs it: next to { } ; , > and after : and (,
 *     and before );
 *   - drops the ; before a }.
 * Strings are copied exactly. A space before ":" is kept, because there it
 * means something (".a :hover" is not ".a:hover"); so is any space around
 * "+" and "-", which calc() needs.
 *
 * Used by tools/offline.mjs --minify, which minifies before hashing, so the
 * offline copy's hashes are those of the files actually served.
 * tools/tests/minify.test.mjs holds the tricky cases. Node has no CSS
 * parser, so tools/smoke.js (run in a real browser) parses every stylesheet
 * both ways and compares the rules one by one. They are identical, except
 * that four var() fallbacks lose the space after a comma, which a browser
 * keeps as written and which means nothing.
 */

const DROP_AROUND = new Set(['{', '}', ';', ',', '>']);
const DROP_AFTER = new Set([':', '(']);
const DROP_BEFORE = new Set([')']);
/* Would these two characters join into one token with nothing between them?
   Two name characters ("red" "blue"), or a number running into a decimal
   point or a percent sign ("1" ".5", "50" "%"). */
const NAME = /[\w\\-]/;
const joins = (a, b) => (NAME.test(a) && NAME.test(b)) || (/\d/.test(a) && (b === '.' || b === '%')) || (a === '.' && /\d/.test(b));

export function minifyCss(src) {
  let out = '';
  let space = false;
  let i = 0;
  const n = src.length;
  const put = (s) => {
    if (space && out.length) {
      const prev = out[out.length - 1];
      const next = s[0];
      if (!DROP_AROUND.has(prev) && !DROP_AROUND.has(next) && !DROP_AFTER.has(prev) && !DROP_BEFORE.has(next)) out += ' ';
    }
    space = false;
    /* ";}" is "}" */
    if (s === '}' && out.endsWith(';')) out = out.slice(0, -1);
    out += s;
  };
  while (i < n) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '*') {
      // A comment is not whitespace: ".a", an empty comment, ".b" is one
      // element with both classes, not ".b" inside ".a". So it goes without a
      // trace, unless the two sides would then run together into one word or
      // number ("red", comment, "blue"), where an empty comment keeps them
      // apart, exactly as the original did.
      const end = src.indexOf('*/', i + 2);
      i = end < 0 ? n : end + 2;
      if (!space && joins(out[out.length - 1] || '', src[i] || '')) put('/**/');
      continue;
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n && src[j] !== c) j += src[j] === '\\' ? 2 : 1;
      put(src.slice(i, j + 1));
      i = j + 1;
      continue;
    }
    if (c === ' ' || c === '\n' || c === '\t' || c === '\r' || c === '\f') {
      space = true;
      i += 1;
      continue;
    }
    put(c);
    i += 1;
  }
  return out.trim();
}

export default { minifyCss };
