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
  tread: { w: 126, h: 213, ax: 55.3, ay: 101.7, fps: 6, loop: true, at: [[0, 142], [128, 142], [256, 142], [384, 142], [512, 142], [640, 142]] },
  under: { w: 363, h: 140, ax: 176.0, ay: 69.9, fps: 8, loop: true, at: [[0, 357], [365, 357], [730, 357], [1095, 357], [1460, 357], [1825, 357], [2190, 357], [2555, 357]] },
  first: { w: 251, h: 246, ax: 117.8, ay: 144.4, fps: 6, loop: false, at: [[0, 499], [253, 499], [506, 499], [759, 499], [1012, 499], [1265, 499]] },
};
