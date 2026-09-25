/**
 * shuffle.js — a fair shuffle, for any game that needs one.
 *
 * It used to live in capitals.js, and trivia and Discovered or Invented
 * imported it from there. That tied two unrelated games to the capital game:
 * a change there could break them. It lives on its own now, with nothing to
 * import, and capitals.js passes it on so its old callers keep working.
 */

/** Fisher-Yates. Returns a new array; the one passed in is left alone. */
export function shuffle(list, random = Math.random) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default shuffle;
