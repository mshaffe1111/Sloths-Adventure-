/**
 * The painted hop rocks' looks (R-165.338, ENG-ROCK 11-20): a world's rocks are not one stamped boulder. Each world names its rock
 * pictures here by their inventory ids (src/game/art/inventory; World 2's list is the world data's W2_ART.rock, rockLooks.test.ts): the
 * kit's own boulder first (`<sheet>#boulder` on the world's kit sheet), then any other painted rock its inventory holds. A world with no
 * list draws its kit's boulder alone. (Every kit's 'stump' cell is the boulder again, W2-W10: it is not a second rock.)
 *
 * Each painted rock takes one picture, plain or mirrored, by a hash of its platform id, walking the stage left to right: never the same
 * picture as the rock before it where the world has more than one, and a world with one picture turns its mirror rock by rock, so no
 * two rocks side by side look alike. protoArt.ts drawRockArt draws the look; engine.ts assigns them as the stage starts.
 *
 * Footing: every picture is drawn as wide as the kit boulder (the collider stays 50 px) with its seat (the mean top of its middle 40%,
 * as a share of its height, measured from the sheet: ROCK_SEAT) where the kit boulder's seat lies, so Pokey stands on each the same.
 */
import type { Platform } from './types.ts';
import W2_NEW from '../assets/w1to4art/w2-new.json';

/** a rock the painted layer draws (drawProtoScene: a 50-unit moss stone, or art 'rock'): the drawn ground leaves it alone (terrain.ts),
 *  or it drew a code earth body under the painted boulder, three gradients a stone a frame (the mixer's 1-5 n4 fork, drawcheck) */
export const isPaintedRock = (p: Platform) => (p.height === 50 && p.style === 'moss_stone') || p.art === 'rock';

/** the kit boulder of whatever world is drawing (its own kit, or World 1's) */
export const KIT_BOULDER = 'kit#boulder';

/** each world's rock pictures, by inventory id; the first is the world's kit boulder (world data: W2_ART.rock holds World 2's) */
export const ROCK_FRAMES: Readonly<Record<number, readonly string[]>> = {
  2: ['w2#boulder', 'w2-new#stone-a', 'w2-new#stone-b'],
};
/** a world's rock pictures (its kit boulder alone where it has no list) */
export const rockFramesOf = (w: number): readonly string[] => ROCK_FRAMES[w] ?? [KIT_BOULDER];

/** the sheets beyond the kit a rock picture is cut from: the address and the cutter's own cells */
export const ROCK_SHEETS: Readonly<Record<string, { url: string; frames: Record<string, { x: number; y: number; w: number; h: number }> }>> = {
  'w2-new': { url: new URL('../assets/w1to4art/w2-new.webp', import.meta.url).href, frames: W2_NEW },
};
/** the sheet a rock picture is on beyond the kit (undefined: the kit's own boulder) */
export function rockSheet(id: string): { url: string; f: { x: number; y: number; w: number; h: number } } | undefined {
  const [sheet, frame] = id.split('#');
  const s = ROCK_SHEETS[sheet];
  const f = s?.frames[frame];
  return s && f ? { url: s.url, f } : undefined;
}
/** the sheets beyond the kit a world's rocks are drawn from (stageSheets.ts asks for them with the kit: 'rocks:<w>') */
export const rockSheetUrls = (w: number): string[] => [...new Set(rockFramesOf(w).map((id) => rockSheet(id)?.url).filter((u): u is string => !!u))];

/**
 * Each picture's seat: the mean top row of its middle 40% of columns (30% to 70% across), as a share of its height (alpha over 128),
 * measured from the sheets 11-20 (reference/qa-reports/ENG-ROCK/REPORT.md has the script). A picture with none is seated as the boulder.
 */
export const ROCK_SEAT: Readonly<Record<string, number>> = {
  'w2#boulder': 0.0342,
  'w2-new#stone-a': 0.0535,
  'w2-new#stone-b': 0.0519,
};

/** one rock's look: which of its world's pictures, and mirrored or not */
export interface RockLook { frame: number; flip: boolean }

/** a well-mixed 32-bit hash of a platform id (neighbouring ids land far apart) */
function mix(id: number): number {
  let h = Math.imul(id | 0, 0x9e3779b1);
  h ^= h >>> 15;
  h = Math.imul(h, 0x85ebca77);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae3d);
  h ^= h >>> 16;
  return h >>> 0;
}

/**
 * The look of every painted rock among `plats`, for a world with `n` rock pictures: by its id's hash, walking left to right, never the
 * same look as the rock before it (another picture where there are two or more; the other mirror where there is one).
 */
export function assignRockLooks(plats: readonly Platform[], n: number): Map<number, RockLook> {
  const out = new Map<number, RockLook>();
  const rocks = plats.filter(isPaintedRock).sort((a, b) => a.x - b.x || a.id - b.id);
  let prev: RockLook | null = null;
  for (const p of rocks) {
    const h = mix(p.id);
    let frame = n > 1 ? h % n : 0;
    if (prev && n > 1 && frame === prev.frame) frame = (frame + 1 + ((h >>> 8) % (n - 1))) % n;
    const flip = n > 1 || !prev ? ((h >>> 4) & 1) === 1 : !prev.flip;
    const look: RockLook = { frame, flip };
    out.set(p.id, look);
    prev = look;
  }
  return out;
}
