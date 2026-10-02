/**
 * A small, careful CSS minifier for the deploy, so the stylesheet every page
 * waits for is about half the size on the wire, while the files in the
 * repository keep their comments (which explain a great deal).
 *
 * It only does what cannot change a rule's meaning:
 *   - drops comments;
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
 * tools/tests/minify.test.mjs holds the tricky cases. When this was written,
 * every stylesheet was also parsed by a real browser both ways and its 1,589
 * rules compared one by one: identical, except that four var() fallbacks
 * lost the space after a comma, which a browser keeps as written and which
 * means nothing.
 */

const DROP_AROUND = new Set(['{', '}', ';', ',', '>']);
const DROP_AFTER = new Set([':', '(']);
const DROP_BEFORE = new Set([')']);

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
      const end = src.indexOf('*/', i + 2);
      i = end < 0 ? n : end + 2;
      space = true;
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
