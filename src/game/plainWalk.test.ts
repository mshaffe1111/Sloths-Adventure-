/**
 * World 5's movement rules, in every hand-built world (QA 2026-10-28, build 39fc3db: waist-high steps and dips stopped a plain walk dead
 * in 1-7 and 1-9, and only a lifted up-and-over flick or a run-in held jump got out; in 1-9 the upright Matt bot fell back into the same
 * dip three times). Played in the real engine (realPlay.ts) the way one thumb plays on a phone: it steers to the face, lifts, and flicks
 * straight up, so the flick has no steering in it (a flick leans 20-40 degrees either way by chance: also leaning away from the step).
 *
 *   1. Every step one plain jump climbs (STEP_UP: 20-96 px over the floor in front of it) is climbed by that one flick.
 *   2. Every dip (a floor lower than the ground, not over water and not in a puzzle room) is left with single flicks only, one a step:
 *      no dip needs a double jump or a perfect one.
 * Three layout rolls of each stage (STAGE-RULES.md: a fix that holds on seed 1 only is not a fix).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { G } from './protoStage.ts';
import { STEP_UP } from './engine.ts';
import type { Platform } from './types.ts';

const STAGES = (process.env.PLAIN_STAGES ?? '1-1,1-2,1-3,1-5,1-6,1-7,1-9,2-1,2-2,2-3,2-5,2-7,2-8,2-9').split(',');
const SEEDS = [1, 2, 3];

/** a thumb on the glass: the touch jump help (jumpHelp.ts) is the game's own */
function touchPlay(id: string, seed: number): RealPlay {
  const sim = new RealPlay(id, seed);
  (sim.input as unknown as { source: string }).source = 'gesture';
  return sim;
}

const solidish = (q: Platform) => q.type === 'solid' && !q.broken && !q.lily;

interface Face { x: number; floorY: number; top: number; rise: number }
/** faces he meets going right: a block whose left side rises from the floor just in front of it */
function facesOf(plats: Platform[]): Face[] {
  const out: Face[] = [];
  for (const q of plats) {
    if (!solidish(q) || q.height < 50) continue;
    let floor: Platform | null = null;
    for (const f of plats) {
      if (f === q || f.broken || f.type === 'drift' || f.type === 'moving') continue;
      if (f.x > q.x - 10 || f.x + f.width < q.x - 10) continue;
      if (f.y <= q.y) {
        floor = null;
        break;
      }
      if (!floor || f.y < floor.y) floor = f;
    }
    if (!floor || floor.width < 60) continue;
    const rise = floor.y - q.y;
    if (rise >= STEP_UP.min && rise <= STEP_UP.max) out.push({ x: q.x, floorY: floor.y, top: q.y, rise });
  }
  return out;
}

/** steer right up to the face, lift, one straight flick (leaning `lean` by chance): on top of it after? */
function flickUp(sim: RealPlay, f: Face, lean: -1 | 0): boolean {
  sim.stand(f.x - 70, f.floorY);
  sim.p.facing = 1;
  let hold = 0;
  let flicked = false;
  for (let i = 0; i < 30 * 3; i++) {
    const p = sim.p;
    let press = false;
    if (!flicked && p.grounded && p.x + 19 >= f.x - 3) {
      press = true;
      flicked = true;
      hold = 7;
      (sim.input.state as unknown as { jumpLean: number }).jumpLean = lean;
    }
    sim.frame({ right: !flicked, press, jump: hold > 0 });
    hold--;
    // (a vine or trunk over the step caught him on the way up: that is a way up too)
    if (sim.p.climbing || sim.p.isVineSwinging || sim.p.hanging) return true;
    // (on top of it; or, for a flick that leaned away, up on a step behind him: the help takes the lean first, as in World 5)
    if (flicked && hold < 0 && sim.p.grounded) return lean ? sim.p.y <= f.floorY - STEP_UP.min : sim.p.y <= f.top + 1 && sim.p.x > f.x;
  }
  return false;
}

/** low floors (dips): under the ground, open on top, not water's stepping stones (a river over them) and not a puzzle room's floor */
function dipsOf(sim: RealPlay): Platform[] {
  const st = sim.stage;
  const rooms = (st.kit?.rooms ?? []).map((r) => {
    const xs = [r.left, r.right].map((a) => {
      const q = sim.platforms.find((p) => p.id === a.on);
      return q ? q.x + q.width * a.at : NaN;
    });
    return [Math.min(...xs) - 200, Math.max(...xs) + 200];
  });
  const wet = (x0: number, x1: number) => (st.rivers ?? []).some((r) => r.x1 > x0 && r.x0 < x1);
  return sim.platforms.filter((q) => solidish(q) && q.y > G + 30 && q.y <= G + 220 && q.width >= 40 && !wet(q.x, q.x + q.width)
    && !rooms.some(([a, b]) => q.x + q.width > a && q.x < b)
    && !sim.platforms.some((o) => o !== q && solidish(o) && o.y < q.y && o.y + o.height > q.y - 4 && o.x <= q.x + 20 && o.x + o.width >= q.x + 20));
}

/** dropped into a dip, a one-thumb player heads right, flicking straight up at each face: out with single flicks? (-1: never) */
function leaveDip(sim: RealPlay, d: Platform): number {
  sim.stand(d.x + 20, d.y);
  sim.p.facing = 1;
  let flicks = 0, hold = 0, rest = 0, lastX = sim.p.x, still = 0;
  for (let i = 0; i < 30 * 12; i++) {
    const p = sim.p;
    if (p.climbing || p.isVineSwinging || p.hanging) return flicks;
    const face = sim.platforms.some((q) => solidish(q) && q.height >= 20 && q.x - (p.x + 19) >= -3 && q.x - (p.x + 19) < 8 && q.y < p.y - 6 && q.y + q.height > p.y - 4);
    still = Math.abs(p.x - lastX) < 0.5 && p.grounded ? still + 1 : 0;
    lastX = p.x;
    let press = false;
    if (p.grounded && hold <= -3 && (face || still > 6) && rest-- <= 0) {
      press = true;
      hold = 7;
      rest = 3;
      flicks++;
    }
    sim.frame({ right: p.grounded && !face && hold <= 0, press, jump: hold > 0 });
    hold--;
    if (sim.died) return -1;
    if (sim.p.grounded && sim.p.y <= Math.min(d.y - 20, G + 2) && sim.p.x > d.x + d.width + 30) return flicks;
    if (flicks > 6) break;
  }
  return -1;
}

test('one-jump steps: a straight flick with the thumb lifted climbs every one (leaning either way), in Worlds 1 and 2, three rolls', () => {
  const bad: string[] = [];
  let n = 0;
  for (const id of STAGES) {
    for (const seed of SEEDS) {
      const sim = touchPlay(id, seed);
      for (const f of facesOf(sim.platforms)) {
        n++;
        for (const lean of [0, -1] as const) if (!flickUp(sim, f, lean)) bad.push(`${id} seed ${seed}: the ${f.rise} px step at x ${Math.round(f.x)}${lean ? ', the flick leaning away' : ''}`);
      }
    }
  }
  assert.ok(n > 300, `${n} steps`);
  assert.deepEqual(bad, []);
});

test('dips: every one is left with single flicks (no double or perfect jump needed), in Worlds 1 and 2, three rolls', () => {
  const bad: string[] = [];
  let n = 0;
  for (const id of STAGES) {
    for (const seed of SEEDS) {
      const sim = touchPlay(id, seed);
      for (const d of dipsOf(sim)) {
        n++;
        const flicks = leaveDip(sim, d);
        if (flicks < 0 || flicks > 3) bad.push(`${id} seed ${seed}: the dip at x ${Math.round(d.x)}..${Math.round(d.x + d.width)}, ${flicks < 0 ? 'never out' : `${flicks} flicks`}`);
      }
    }
  }
  assert.ok(n > 100, `${n} dips`);
  assert.deepEqual(bad, []);
});
