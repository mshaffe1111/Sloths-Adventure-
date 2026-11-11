/**
 * AUDIT-B measuring tool (2026-11-11, the Area-B engine audit; not game code): one jump flown in the real engine at 30 fps in a bare
 * world (realPlay.ts RealPlay.bare), the way reference/specs/reach.md flew its table (t-designer-reach). A "flick" is Jump held 220 ms
 * (inputEngine MIN_TOUCH_JUMP_HOLD_MS): 7 frames here (233 ms, the generous side). Proved against reach.md §2 in flight.selftest.test.ts.
 */
import '../../headlessDom.ts';
import { RealPlay } from '../../realPlay.ts';
import { setDifficulty } from '../../difficulty.ts';
import { withPlaySeed } from '../../testlink1_1.ts';
import { PHYS } from '../../physics.ts';
import { PROVEN_SEEDS } from '../provenSeeds.ts';
import type { Platform } from '../../types.ts';

export type Setting = 'normal' | 'easy';
const plays = new Map<Setting, RealPlay>();
function play(setting: Setting): RealPlay {
  let r = plays.get(setting);
  if (!r) {
    setDifficulty(setting);
    r = withPlaySeed(PROVEN_SEEDS['1-1'].seeds[0], () => new RealPlay('1-1', 1));
    setDifficulty('normal');
    plays.set(setting, r);
  }
  return r;
}
const FLOOR = 2000;
const LIP = 5000;
export interface Jump { rise: number; gap: number; thin: boolean; landW?: number }
export interface Flown { ok: boolean; x: number; y: number }
/**
 * one flight: a full-speed run, the press `before` px short of the lip (his centre), Jump held `holdFrames` frames, an optional second
 * press `second` frames after the first (a double: also held holdFrames); true when he ends standing on the far piece
 */
export function flyJump(setting: Setting, j: Jump, before: number, holdFrames = 7, second?: number): Flown {
  const r = play(setting);
  const farTop = FLOOR - j.rise;
  const far: Platform = { id: 2, x: LIP + j.gap, y: farTop, width: j.landW ?? 400, height: j.thin ? 24 : 600, type: 'solid', ...(j.thin ? { style: 'branch' } : {}) } as Platform;
  r.bare([{ id: 1, x: LIP - 6000, y: FLOOR, width: 6000, height: 600, type: 'solid' } as Platform, far]);
  // (reach.md's own start, sims/flight.ts Rig.start: standing at the spot, already at full run)
  r.stand(LIP - before, FLOOR);
  Object.assign(r.p, { vx: PHYS.maxRun, facing: 1 });
  for (let i = 0; i < 150; i++) {
    const held = i < holdFrames || (second !== undefined && i >= second && i < second + holdFrames);
    const press = i === 0 || i === second;
    r.frame({ right: true, ...(press ? { press: true } : held ? { jump: true } : {}) });
    const p = r.p;
    if (i > 3 && p.grounded) return { ok: r.standingOn === 2, x: p.x, y: p.y };
    if (p.y > FLOOR + 400) return { ok: false, x: p.x, y: p.y };
  }
  return { ok: false, x: r.p.x, y: r.p.y };
}
/** the furthest short of the lip (px, 1 px steps from `from` down to 0) a single flick still lands the jump; -1: from nowhere */
export function flickWindow(setting: Setting, j: Jump, from = 120): number {
  for (let d = from; d >= 0; d -= 1) if (flyJump(setting, j, d).ok) return d;
  return -1;
}
/** the widest level-or-raised gap (px) a single flick from `before` px lands, 1 px steps */
export function widest(setting: Setting, rise: number, thin: boolean, before: number, lo = 20, hi = 320): number {
  let best = -1;
  for (let g = lo; g <= hi; g++) if (flyJump(setting, { rise, gap: g, thin }, before).ok) best = g;
  return best;
}
