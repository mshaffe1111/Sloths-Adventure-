/**
 * The pieces' jump bots, in the REAL engine (realPlay.ts runs engine.ts one 30 fps frame at a time): a bare world of the piece and the
 * banks it joins, and a thumb that crosses it.
 *
 *   - `windowOf`: for every frame of one cycle of the piece, whether a plain jump pressed then (the thumb down `hold` s, steering the way
 *     on while in the air, letting go on landing, as a phone player does) gets him from where he stands onto the target. The share of the
 *     cycle that works, and the longest run of frames that does (the press window, in ms, STAGE-RULES §1b: never under 167 ms Normal /
 *     300 ms Easy).
 *   - `noisy`: the thumb modelled on the first-timer bot's (tools/inspect/firsttimer.ts FT_ADULT / FT_KID, from Matt's Gemini research):
 *     he waits for the piece's cue (the caller's: "the log is coming and near"), reacts a moment late (Normal N(30 ms, 30), Easy
 *     N(90 ms, 65)), holds the jump N(0.20 s, 0.035) / N(0.16 s, 0.08). The share of tries that land (Gemini's floor: the Normal bot
 *     70% in Worlds 1-5, the Easy kid 85%, STAGE-RULES §1b).
 */
import { DT, RealPlay } from '../realPlay.ts';
import { setDifficulty, type Difficulty } from '../difficulty.ts';
import type { Platform } from '../types.ts';

export interface Leg {
  /** where he stands to start (feet), and the platform id he must land on; `on`: he starts riding that piece, `edge` px in from its
   *  end on the way on (the first-timer bot's edgeAim: 22 px Normal, 32 Easy), or at its middle */
  from: { x: number; y: number; on?: number; edge?: number };
  to: number;
  /** the way on: 1 right, -1 left */
  dir: 1 | -1;
}

/** a bare world of these platforms, on this setting (the stage id only gives the engine a stage to start from) */
export function bareWorld(platforms: Platform[], setting: Difficulty): RealPlay {
  setDifficulty(setting);
  const rp = new RealPlay('1-1', 1);
  rp.bare(platforms.map((p) => ({ ...p, ...(p.sling ? { sling: { ...p.sling } } : {}) })));
  return rp;
}

/** one try: at game time `t0` he stands at `from` (riding the piece he is on, if any), presses at `t0 + wait`, holds `hold` s; true if he
 *  ends standing on `to` within 3 s and stays a beat */
export function tryLeg(rp: RealPlay, leg: Leg, t0: number, wait: number, hold: number): boolean {
  rp.t = t0;
  // (every piece where it is at t0: one frame with no input)
  rp.stand(leg.from.x, leg.from.y);
  rp.frame();
  if (leg.from.on !== undefined) {
    const on = rp.platforms.find((p) => p.id === leg.from.on)!;
    const e = leg.from.edge;
    rp.stand(e === undefined ? on.x + on.width / 2 : leg.dir === 1 ? on.x + on.width - e : on.x + e, on.y);
    rp.frame();
  }
  for (let i = 0; i < Math.round(wait / DT); i++) {
    rp.frame();
    if (rp.died) return false;
  }
  let held = 0;
  let airborne = false;
  for (let i = 0; i < 90; i++) {
    const pressing = held < hold;
    rp.frame({ press: i === 0, jump: pressing && i > 0, right: leg.dir === 1 && (!airborne || !rp.p.grounded), left: leg.dir === -1 && (!airborne || !rp.p.grounded) });
    held += DT;
    if (!rp.p.grounded) airborne = true;
    if (rp.died || rp.p.y > 100000) return false;
    if (airborne && rp.p.grounded) {
      if (rp.standingOn !== leg.to) return false;
      // (stays on it a beat: a landing he slides off is no landing)
      for (let j = 0; j < 8; j++) rp.frame();
      return rp.standingOn === leg.to && !rp.died;
    }
  }
  return false;
}

/** the press window over one cycle of `period` s: the share of frames that work, and the longest run (ms) */
export function windowOf(rp: RealPlay, leg: Leg, period: number, hold: number, t0 = 0): { share: number; longestMs: number; ok: boolean[] } {
  const n = Math.round(period / DT);
  const ok: boolean[] = [];
  for (let i = 0; i < n; i++) ok.push(tryLeg(rp, leg, t0, i * DT, hold));
  let best = 0, run = 0;
  // (round the cycle: a run across its end is one run)
  for (let i = 0; i < 2 * n; i++) {
    run = ok[i % n] ? run + 1 : 0;
    best = Math.max(best, Math.min(run, n));
  }
  return { share: ok.filter(Boolean).length / n, longestMs: Math.round(best * DT * 1000), ok };
}

/** seeded random numbers (mulberry32, as the first-timer bot's) */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const gauss = (r: () => number, mu: number, sd: number) => mu + sd * Math.sqrt(-2 * Math.log(Math.max(1e-9, r()))) * Math.cos(2 * Math.PI * r());

/** the first-timer bot's thumbs (FT_ADULT, FT_KID): reaction after the cue, and how long the jump is held (s) */
export const THUMB = { normal: { react: [0.03, 0.03], hold: [0.2, 0.035] }, easy: { react: [0.09, 0.065], hold: [0.16, 0.08] } } as const;

/** `tries` noisy tries at the leg: the cue is the first frame from `t0` on that `cue(rp)` says go; the thumb reacts late and holds as
 *  THUMB has it. The share that land */
export function noisy(rp: RealPlay, leg: Leg, setting: Difficulty, cueAt: (t: number) => number, tries: number, seed: number): number {
  const r = rng(seed);
  const th = THUMB[setting];
  let won = 0;
  for (let k = 0; k < tries; k++) {
    const t0 = r() * 20;
    const go = cueAt(t0);
    const wait = Math.max(0, go - t0 + gauss(r, th.react[0], th.react[1]));
    const hold = Math.max(0.04, gauss(r, th.hold[0], th.hold[1]));
    if (tryLeg(rp, leg, t0, wait, hold)) won++;
  }
  return won / tries;
}

/**
 * One unbroken run over a chain of hops (no resets between them): he stands at `start`, and for each hop waits until `ready(rp, i)` says
 * the next piece is there to go to, reacts a moment late (THUMB), presses, holds, steers the way on in the air and lets go on landing,
 * then must be standing on hop i's target. Returns how many hops he made (all of them: across).
 */
export function chain(rp: RealPlay, start: { x: number; y: number; t0: number }, hops: Array<{ to: number; dir: 1 | -1 }>, ready: (rp: RealPlay, i: number) => boolean, setting: Difficulty, r: () => number, waterY = Infinity): number {
  rp.t = start.t0;
  rp.stand(start.x, start.y);
  rp.frame();
  const th = THUMB[setting];
  for (let i = 0; i < hops.length; i++) {
    const h = hops[i];
    // (first he walks to the edge he will go from, as the first-timer bot does: edgeAim 22 px Normal, 32 Easy)
    const edge = setting === 'easy' ? 32 : 22;
    let n = 0;
    for (;;) {
      const on = rp.platforms.find((p) => p.id === rp.standingOn);
      if (!on || (h.dir === 1 ? rp.p.x >= on.x + on.width - edge : rp.p.x <= on.x + edge)) break;
      rp.frame({ right: h.dir === 1, left: h.dir === -1 });
      if (rp.died || rp.p.y > waterY || ++n > 90) return i;
    }
    rp.frame();
    // (then waits for the cue, up to 12 s, standing still, carried by what he is on)
    n = 0;
    while (!ready(rp, i)) { rp.frame(); if (rp.died || rp.p.y > waterY || ++n > 360) return i; }
    for (let k = 0; k < Math.round(Math.max(0, gauss(r, th.react[0], th.react[1])) / DT); k++) { rp.frame(); if (rp.died) return i; }
    const hold = Math.max(0.04, gauss(r, th.hold[0], th.hold[1]));
    let held = 0, air = false, landed = false;
    for (let f = 0; f < 90; f++) {
      rp.frame({ press: f === 0, jump: f > 0 && held < hold, right: h.dir === 1 && (!air || !rp.p.grounded), left: h.dir === -1 && (!air || !rp.p.grounded) });
      held += DT;
      if (!rp.p.grounded) air = true;
      if (rp.died || rp.p.y > Math.min(100000, waterY)) return i;
      if (air && rp.p.grounded) { landed = true; break; }
    }
    if (!landed || rp.standingOn !== h.to) return i;
    for (let k = 0; k < 4; k++) rp.frame();
    if (rp.standingOn !== h.to || rp.p.y > waterY) return i;
  }
  return hops.length;
}
