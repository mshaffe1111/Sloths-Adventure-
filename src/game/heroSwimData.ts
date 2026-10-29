/**
 * Pokey's swim frames in src/assets/hero/pokey-swim.webp (written by tools/art/w6/swim/pack.py from
 * reference/animation-sheets/pokey-swim/meta.json: do not edit by hand). Each move: the frame size, the anchor (ax the middle of
 * his torso, ay the waterline, or the middle of his body underwater), fps, whether it loops, and each frame's top-left in the atlas.
 * The sheet is at the standard hero's scale (his standing height is 200 px).
 */
export interface SwimMove { w: number; h: number; ax: number; ay: number; fps: number; loop: boolean; at: Array<[number, number]> }
export type SwimMoveName = 'surf' | 'tread' | 'under' | 'first';
export const SWIM_MOVES: Record<SwimMoveName, SwimMove> = {
  surf: { w: 344, h: 140, ax: 180.1, ay: 77.6, fps: 8, loop: true, at: [[0, 0], [346, 0], [692, 0], [1038, 0], [1384, 0], [1730, 0], [2076, 0], [2422, 0]] },
  tread: { w: 120, h: 211, ax: 54.2, ay: 100.3, fps: 6, loop: true, at: [[0, 142], [122, 142], [244, 142], [366, 142], [488, 142], [610, 142]] },
  under: { w: 361, h: 140, ax: 175.4, ay: 69.9, fps: 8, loop: true, at: [[0, 355], [363, 355], [726, 355], [1089, 355], [1452, 355], [1815, 355], [2178, 355], [2541, 355]] },
  first: { w: 251, h: 246, ax: 117.8, ay: 144.4, fps: 6, loop: false, at: [[0, 497], [253, 497], [506, 497], [759, 497], [1012, 497], [1265, 497]] },
};
