/**
 * artRoll — which of a world's looks for one job a stage wears (STAGE-RULES.md §4, Matt 2026-10-28: "rotate looks by the roll"). Where
 * Matt painted several props or decor sets for the same job (World 3's ferns, its floor stones, World 2's thrown stones, World 4's far
 * bridge), the layout roll picks among them: a retry of the same roll keeps the look, a fresh roll can change it.
 *
 * The cooldown: a world's stages take turns between two halves of the looks (odd stages one half, even stages the other), and the roll
 * picks within the stage's half. So two stages in a row never wear the same look, whatever each one rolled. With only two looks the
 * halves are one look each: the stages alternate, and the roll does not change it (the cooldown wins).
 *
 * Pure, and it never draws from a stage's own random stream (protoStage.ts `R`): picking a look can't move a platform.
 */

/** a small stable hash of a number (the roll, a room's place), 0..1 */
export function lookHash(n: number, salt = 0): number {
  let h = (Math.imul(Math.floor(n) | 0, 0x9e3779b1) ^ Math.imul(salt + 1, 0x85ebca77)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967296;
}

/**
 * The stage's look among `options` for one job: `stage` its number in the world (1-9), `roll` its layout roll (the seed, or anything
 * that follows it), `salt` tells jobs apart (so two jobs don't always flip together).
 */
export function rollLook<T>(options: readonly T[], stage: number, roll: number, salt = 0): T {
  if (options.length <= 1) return options[0];
  // the two halves, taken in turn by the stage number (the salt turns which look starts in which half)
  const shift = Math.floor(lookHash(salt, 7) * options.length);
  const half = options.map((o, i) => ({ o, i: (i + shift) % options.length })).filter(({ i }) => i % 2 === stage % 2).map(({ o }) => o);
  // (the stage's number goes into the roll's hash too: two stages on the same roll needn't wear the same look)
  return half[Math.floor(lookHash(roll, salt * 131 + stage) * half.length) % half.length];
}
