/**
 * Meeca never drawn inside a wall (5-M, 2026-11-01). Her body is 38 px wide (engine.ts, half 19), but her painted frames reach further:
 * standing, her front arm and belly are drawn 34 px ahead of her middle, so flush against room 5's far wall (the bank face) she was drawn
 * half into the dirt. Changing her body width would move every collision of the stage, so only her drawing moves: where a frame would
 * reach into a wall face beside her, it is drawn that much away from it (engine.ts meecaOff, eased), and never more than the frame
 * reaches past her body.
 */
import { MEECA_FRAMES, MEECA_STAND_H } from './meecaStandardData.ts';
import { NIGHT_ART } from './meecaNightData.ts';
import { MEECA_MOODS, MEECA_UNITS } from './jennifurSprite.ts';
import { blockBeside } from './physics.ts';

/** her body's half width (engine.ts, the solid-block walls) */
export const MEECA_BODY_HALF = 19;
const K = MEECA_UNITS / MEECA_STAND_H;
/** at most this (the longest reach, the jump's arms, 59 px, less her half width) */
const MAX_SHIFT = 42;

/** the idle mood's frames: she cycles through them standing still, so one reach for all (no drift back and forth as she blinks) */
const IDLE = new Set(MEECA_MOODS.idle.steps.map((s) => s[0] as string));

const REACH = new Map<string, Map<string, { front: number; back: number }>>();
/** how far a frame reaches ahead of her middle (the way she faces) and behind it, world px (worked out once a frame, then kept) */
export function meecaReach(sheet: string, name: string): { front: number; back: number } {
  let m = REACH.get(sheet);
  if (!m) REACH.set(sheet, (m = new Map()));
  let r = m.get(name);
  if (!r) m.set(name, (r = reachOf(sheet, name)));
  return r;
}

function reachOf(sheet: string, name: string): { front: number; back: number } {
  if (sheet === 'std') {
    const names = IDLE.has(name) ? [...IDLE] : [name];
    let front = 0;
    let back = 0;
    for (const n of names) {
      const f = MEECA_FRAMES[n];
      if (!f) continue;
      front = Math.max(front, (f.w - f.ax) * K * f.s);
      back = Math.max(back, f.ax * K * f.s);
    }
    return { front, back };
  }
  if (sheet === 'night') {
    const f = (NIGHT_ART as Record<string, { w: number; ax: number; k: number }>)[name];
    if (f) return { front: (f.w - f.ax) * f.k, back: f.ax * f.k };
  }
  return { front: MEECA_BODY_HALF, back: MEECA_BODY_HALF };
}

type Block = { x: number; y: number; width: number; height: number; type: string; broken?: boolean };

/**
 * How far to draw her sideways (world px, + right) so a frame reaching `front`/`back` from her middle at (x, feetY), facing `facing`,
 * is not drawn inside a wall face beside her: the walls are the solid blocks she bumps into (engine.ts), beside her at her feet's height.
 */
export function meecaFaceShift(x: number, feetY: number, height: number, facing: number, reach: { front: number; back: number }, platforms: readonly Block[]): number {
  const right = facing >= 0 ? reach.front : reach.back;
  const left = facing >= 0 ? reach.back : reach.front;
  let dx = 0;
  for (const b of platforms) {
    if (b.broken || b.type !== 'solid' || b.height < 50 || !blockBeside(feetY, height, b)) continue;
    // a face to her right (she is left of the block, her body clear of it) that her frame reaches into
    if (x < b.x && x + MEECA_BODY_HALF <= b.x + 1 && x + right > b.x) dx = Math.min(dx, b.x - (x + right));
    // and one to her left
    const r = b.x + b.width;
    if (x > r && x - MEECA_BODY_HALF >= r - 1 && x - left < r) dx = Math.max(dx, r - (x - left));
  }
  return Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, dx));
}
