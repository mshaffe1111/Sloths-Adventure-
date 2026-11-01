/**
 * stageBackdrops — Worlds 1-4 go through the day (Matt, 2026-10-28): each world's stages play under a different far backdrop as the
 * world goes on, from Matt's new paintings (tools/art/w1to4/backdrops.py). Only the far strip (the sky and the far distance) changes:
 * the middle and near strips stay the world's own, so the ground and the trees behind it look the same all through a world.
 *
 *   (2026-11-01, hf-backdrops2: every world has three or four painted sets now, alternated so no two neighbouring stages share
 *   one; FAR_BY_STAGE below. Each set carries its own middle and near strips where it has them, so the trees and ground change too.)
 *
 * A guardian's lair (stage 10) keeps the world's own set, as do the map, the title and the stories. World 5 has its own light
 * (w5Backdrop.ts). Pure: no pictures here, so the tests can check every stage.
 */
import { w5BackdropStem } from './w5Backdrop.ts';

/** the far strip of each world's stages, by stage number (1-9); a stage not listed plays in the world's own set */
export const FAR_BY_STAGE: Record<number, Record<number, string>> = {
  // (hf-backdrops2, 2026-11-01: a third or fourth painted set per world, each a full set of its own far, sky, middle and near
  // strips, and the runs split so no two neighbouring stages share a set: Matt, "make things look varied as many places as possible".
  // Each world still follows its story light: its early mood first, its late mood last.)
  1: { 1: 'w1sunrise', 2: 'w1rain', 3: 'w1sunrise', 5: 'w1rain', 7: 'w1kapok', 8: 'w1rain', 9: 'w1kapok' },
  2: { 1: 'w2mist', 3: 'w2mist', 4: 'w2rapids', 6: 'w2rapids', 7: 'w2evening', 8: 'w2rapids', 9: 'w2evening' },
  3: { 2: 'w3crystal', 4: 'w3sinkhole', 5: 'w3crystal', 6: 'w3sinkhole', 7: 'w3cavern', 8: 'w3crystal', 9: 'w3cavern' },
  4: { 1: 'w4terraces', 2: 'w4storm', 3: 'w4terraces', 5: 'w4storm', 7: 'w4mist', 8: 'w4storm', 9: 'w4mist' },
  6: { 1: 'w6dawn', 3: 'w6dawn', 4: 'w6moon', 6: 'w6moon', 7: 'w6dusk', 8: 'w6moon', 9: 'w6dusk' },
  7: { 1: 'w7dawn', 2: 'w7court', 3: 'w7dawn', 5: 'w7court', 7: 'w7dusk', 8: 'w7court', 9: 'w7dusk' },
  8: { 1: 'w8dawn', 2: 'w8sunset', 3: 'w8dawn', 5: 'w8sunset', 7: 'w8night', 8: 'w8dawn', 9: 'w8night' },
  9: { 1: 'w9dawn', 2: 'w9ash', 3: 'w9dawn', 5: 'w9ash', 7: 'w9night', 8: 'w9ash', 9: 'w9night' },
  // (w10after, the sky clearing after the storm, and w10night, the summit under the stars (painted 2026-11-01), wait until World 10's
  // rain ends with the storm: rain under a clear sky read wrong, the lead 2026-10-31)
  10: { 1: 'w10dusk', 3: 'w10dusk', 5: 'w10dusk', 7: 'w10dusk', 9: 'w10dusk' },
};

/** every far-only strip set (it has a far strip of its own, and borrows its world's middle and near strips) */
export const FAR_ONLY: readonly string[] = [...new Set(Object.values(FAR_BY_STAGE).flatMap((m) => Object.values(m)))];

/** the strip set a stage plays in, if it has one of its own ('w1sunrise', 'w5dusk1', ...); null: the world's own */
export function stageBackdropStem(stageId: string): string | null {
  const w5 = w5BackdropStem(stageId);
  if (w5) return w5;
  const m = /^(\d+)-(\d+)$/.exec(stageId);
  if (!m) return null;
  return FAR_BY_STAGE[Number(m[1])]?.[Number(m[2])] ?? null;
}
