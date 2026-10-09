/**
 * rooms/science/daily.js — make today's (or the n-th endless) puzzle for a game,
 * and never come back empty-handed.
 *
 * A game's maker is seeded by the day ("2026-10-02") or the endless count
 * ("endless-7"). A few seeds give a maker nothing it can prove has one answer.
 * Then the next seeds are tried in a fixed order ("endless-7~1", "~2", ...),
 * so a reload still shows the same puzzle. If every try fails, a puzzle from
 * the level's checked bank stands in, picked by the same seed.
 */

import { hash } from '../../modules/logicrng.js';

export const TRIES = 24;

/** { puzzle, chapterId } for this game, level and day, or null if even the bank fails. */
export async function makeDaily(mod, level, iso) {
  for (let i = 0; i < TRIES; i++) {
    let made = null;
    try { made = await mod.dailyPuzzle(level, i ? `${iso}~${i}` : iso); } catch (err) { console.error(err); }
    if (made && made.puzzle) return { ...made, puzzle: { ...made.puzzle, id: `daily-${iso}` } };
  }
  try {
    const bank = await mod.bank(level);
    const all = bank.chapters.flatMap((c) => c.puzzles.map((p) => ({ p, chapterId: c.id })));
    const pick = all[hash(mod.id, 'daily-fallback', level, iso) % all.length];
    return { puzzle: { ...pick.p, id: `daily-${iso}`, teach: false }, chapterId: pick.chapterId };
  } catch (err) {
    console.error(err);
    return null;
  }
}
