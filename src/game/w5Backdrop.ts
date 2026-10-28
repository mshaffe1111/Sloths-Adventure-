/**
 * w5Backdrop — which painted backdrop each World 5 stage plays in (Matt, 2026-10-26). The light goes down through the world as the
 * orchids close: a lovely golden afternoon at 5-1 to 5-3, dusk with the orchids half shut at 5-4 to 5-6 (and Meeca's bonus stage),
 * misty violet twilight at 5-7 to 5-9. Twilight is still a lit sky: World 8 is the night world, so World 5's own stages never read as
 * night. Meeca's stage (5-M, "On the March North", the first of the world: her escape, weeks before Pokey comes) is the one night:
 * Matt's night camp painting behind World 5's middle and near strips graded to moonlight (tools/art/w5puzzle/night.py, `w5night`).
 * Each mood has two takes, and the takes alternate stage to stage (odd stages take A, even stages take B, so no two stages in a row
 * look the same, across a change of mood too).
 *
 * The strips are src/assets/backdrops/<stem>-<far|mid|near>.webp (tools/art/w5/backdrops.py). Gold take A is the plain `w5` set, the
 * world's face on the map, the title screen and the stories. paintedBackdrops.ts asks this file for the stage being played.
 *
 * 5-10, the Queen's garden fight, is played in front of the council's long table (w5Art.ts drawW5Arena, the `table` painting); the
 * intro and tea scene use the `webs` painting. As plain strips (a stage that draws no arena) it falls back on twilight.
 *
 * Pure: no pictures here, so the tests can check every stage.
 */
export type W5Mood = 'gold' | 'dusk' | 'twilight' | 'night';

/** the strip set of each mood's two takes (A, B) */
export const W5_BACKDROPS: Record<Exclude<W5Mood, 'night'>, readonly [string, string]> = {
  gold: ['w5', 'w5gold2'],
  dusk: ['w5dusk1', 'w5dusk2'],
  twilight: ['w5twi1', 'w5twi2'],
};

/** the stage's number in World 5 (1 to 10), 0 for one outside the ten (Meeca's stage), or null for a stage of another world */
function stageNo(stageId: string): number | null {
  if (!stageId.startsWith('5-')) return null;
  const n = Number(stageId.slice(2));
  return Number.isInteger(n) && n >= 1 && n <= 10 ? n : 0;
}

/** a World 5 stage's light; null for a stage of another world */
export function w5Mood(stageId: string): W5Mood | null {
  const n = stageNo(stageId);
  if (n === null) return null;
  if (n === 0) return 'night'; // Meeca's stage, the night she got away (5-M)
  return n <= 3 ? 'gold' : n <= 6 ? 'dusk' : 'twilight';
}

/** the strip set a World 5 stage plays in ('w5', 'w5gold2', 'w5dusk1', ...); null for a stage of another world */
export function w5BackdropStem(stageId: string): string | null {
  const mood = w5Mood(stageId);
  if (!mood) return null;
  if (mood === 'night') return W5_NIGHT;
  const n = stageNo(stageId)!;
  return W5_BACKDROPS[mood][(n - 1) % 2];
}

/** Meeca's night (5-M): one set, no second take */
export const W5_NIGHT = 'w5night';

/** every World 5 strip set of the world's own stages (the night set is W5_NIGHT) */
export const W5_STEMS: readonly string[] = Object.values(W5_BACKDROPS).flat();
