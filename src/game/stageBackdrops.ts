/**
 * stageBackdrops — Worlds 1-4 go through the day (Matt, 2026-10-28): each world's stages play under a different far backdrop as the
 * world goes on, from Matt's new paintings (tools/art/w1to4/backdrops.py). Only the far strip (the sky and the far distance) changes:
 * the middle and near strips stay the world's own, so the ground and the trees behind it look the same all through a world.
 *
 *   World 1  1-1 to 1-3 sunrise over the canopy, 1-4 to 1-6 the world's own morning, 1-7 to 1-9 the great kapok view
 *   World 2  2-1 to 2-3 the world's own riverbank, 2-4 to 2-6 the rapids, 2-7 to 2-9 the village in the evening
 *   World 3  3-1 to 3-3 the world's own grotto, 3-4 and 3-5 looking up the sinkhole at the moon, 3-6 to 3-9 the glowworm cavern
 *   World 4  4-1 to 4-3 the terraces, 4-4 to 4-6 the world's own cliffs, 4-7 to 4-9 above the mist
 *   World 6  6-1 to 6-3 dawn, 6-4 to 6-6 the world's own, 6-7 to 6-9 dusk (painted with the style model, 2026-10-29)
 *
 * A guardian's lair (stage 10) keeps the world's own set, as do the map, the title and the stories. World 5 has its own light
 * (w5Backdrop.ts). Pure: no pictures here, so the tests can check every stage.
 */
import { w5BackdropStem } from './w5Backdrop.ts';

/** the far strip of each world's stages, by stage number (1-9); a stage not listed plays in the world's own set */
export const FAR_BY_STAGE: Record<number, Record<number, string>> = {
  1: { 1: 'w1sunrise', 2: 'w1sunrise', 3: 'w1sunrise', 7: 'w1kapok', 8: 'w1kapok', 9: 'w1kapok' },
  2: { 4: 'w2rapids', 5: 'w2rapids', 6: 'w2rapids', 7: 'w2evening', 8: 'w2evening', 9: 'w2evening' },
  3: { 4: 'w3sinkhole', 5: 'w3sinkhole', 6: 'w3cavern', 7: 'w3cavern', 8: 'w3cavern', 9: 'w3cavern' },
  4: { 1: 'w4terraces', 2: 'w4terraces', 3: 'w4terraces', 7: 'w4mist', 8: 'w4mist', 9: 'w4mist' },
  // (World 6, 2026-10-29: dawn over the canopy, then dusk; Worlds 7-10 have theirs painted too, src/assets/w6to10/manifest.json, to
  // set in as those worlds are built)
  6: { 1: 'w6dawn', 2: 'w6dawn', 3: 'w6dawn', 7: 'w6dusk', 8: 'w6dusk', 9: 'w6dusk' },
  // (Worlds 7-10, 2026-10-31 hf-backdrops: their painted moods were made on 2026-10-29 and never set in, so every stage of a world
  // played under the same sky; the order follows each world's story light, gen2/worlds/w7.ts and w8.ts)
  7: { 1: 'w7dawn', 2: 'w7dawn', 3: 'w7dawn', 7: 'w7dusk', 8: 'w7dusk', 9: 'w7dusk' },
  8: { 1: 'w8sunset', 2: 'w8sunset', 7: 'w8night', 8: 'w8night', 9: 'w8night' },
  9: { 1: 'w9dawn', 2: 'w9dawn', 3: 'w9dawn', 7: 'w9night', 8: 'w9night', 9: 'w9night' },
  // (w10after, the sky clearing after the storm, waits for 10-7..10-9 until World 10's rain ends with the storm: rain under a clear
  // gold sky read wrong, the lead 2026-10-31)
  10: { 1: 'w10dusk', 2: 'w10dusk', 3: 'w10dusk' },
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
