/**
 * watcher — the eagle that watches over 1-7 A Very Good Bush (and later stealth stages): hiding, made into a rhythm.
 *
 * Over a watched stretch the eagle circles far off (calm), then comes: a screech and its shadow at the edge of the view (warn), then
 * it sweeps across the sky and its shadow crosses the ground (pass). Anyone the shadow crosses out in the open is seen, and the eagle
 * dives at him: he loses a heart, unless he gets into a bush before it arrives. Crouching inside a bush (or hanging inside a bush
 * that hangs from a rope) is hidden. The calm between passes is long where the stage teaches and shorter later, and every pass is
 * announced, so a player who watches the rhythm is never caught by surprise.
 *
 * Pure: the engine steps it and draws it (engine.ts); the tests check the rhythm and the hiding rule (watcher.test.ts).
 */

/** a bush to hide in: on the ground (its bottom on the surface `y`), or hanging from a rope (`hanging`: its top at `y`) */
export interface Bush {
  x: number;
  w: number;
  y: number;
  /** 'grotto': World 3's fern (w3Art.ts) */
  kind: 'tall' | 'wide' | 'fern' | 'grotto';
  hanging?: boolean;
  /** the bush in front of the hidden hollow: not a hiding place (there is no ground under it) */
  secret?: boolean;
}

/** a watched stretch of the stage, and how long the eagle stays away between passes there (s, rolled in this range) */
export interface WatchZone {
  x0: number;
  x1: number;
  calm: [number, number];
}

export const WATCH = {
  /** from the screech to the sweep: long enough to reach a bush that is near (1.4 s caught most testers running, 2026-10-24) */
  warn: 2.0,
  /** the sweep across the view */
  pass: 2.6,
  /** from being seen to the strike: time to duck into a bush right beside him */
  dive: 0.75,
  /** how close the shadow's middle must come to see him (px either side) */
  sight: 70,
} as const;

export type WatchPhase = 'calm' | 'warn' | 'pass';

export interface WatchState {
  phase: WatchPhase;
  /** seconds into the phase, and how long this phase lasts */
  t: number;
  dur: number;
  /** which way the sweep goes (+1: left to right) */
  dir: 1 | -1;
  /** passes so far */
  passes: number;
  /** seen during this pass (one dive per pass at most), and the dive's clock */
  seen: boolean;
  diveT: number;
}

export function newWatch(): WatchState {
  return { phase: 'calm', t: 0, dur: 3, dir: 1, passes: 0, seen: false, diveT: 0 };
}

/** the zone that watches x, if any */
export function zoneAt(zones: WatchZone[], x: number): WatchZone | undefined {
  return zones.find((z) => x >= z.x0 && x <= z.x1);
}

/**
 * Step the rhythm. `zone`: the zone he is in (none: the eagle stays away, and a pass under way finishes). `roll` gives a number in
 * [0, 1) for the length of the calm. Returns what happened this step, for the sounds and the guide's lines.
 */
export function stepWatch(s: WatchState, dt: number, zone: WatchZone | undefined, roll: () => number): { warned?: boolean; passed?: boolean } {
  s.t += dt;
  if (s.phase === 'calm') {
    // (the first calm of the stage is a whole calm of the zone, not the 3 s a new watch starts with: the eagle came 3 s into 1-7's
    // first bushes, before the hide was taught, QA 2026-10-28)
    if (s.passes === 0 && zone) s.dur = Math.max(s.dur, zone.calm[0]);
    if (!zone) {
      s.t = Math.min(s.t, s.dur * 0.5); // out of the watched stretch the calm waits; stepping back in, half of it is still to come
      return {};
    }
    if (s.t >= s.dur) {
      s.phase = 'warn';
      s.t = 0;
      s.dur = WATCH.warn;
      return { warned: true };
    }
    return {};
  }
  if (s.phase === 'warn' && s.t >= s.dur) {
    s.phase = 'pass';
    s.t = 0;
    s.dur = WATCH.pass;
    s.seen = false;
    s.diveT = 0;
    return {};
  }
  if (s.phase === 'pass') {
    if (s.seen) s.diveT += dt;
    if (s.t >= s.dur && (!s.seen || s.diveT >= WATCH.dive)) {
      s.passes++;
      s.dir = s.dir === 1 ? -1 : 1;
      s.phase = 'calm';
      s.t = 0;
      const [a, b] = zone?.calm ?? [5, 6];
      s.dur = a + (b - a) * roll();
      return { passed: true };
    }
  }
  return {};
}

/**
 * the first pass of a stage is a warning that cannot hurt: if it sees him, it dives and pulls up short (the hide is taught by then, but
 * not yet tried; QA 2026-10-28, 1-7: "It saw you! Slide down in a bush!" came only after the first hit)
 */
export const harmlessPass = (s: WatchState) => s.passes === 0;

/** where the shadow's middle is during a pass (world x): it crosses the view from beyond one edge to beyond the other */
export function shadowX(s: WatchState, camX: number, viewW: number): number {
  const u = Math.min(1, s.t / WATCH.pass);
  const from = s.dir === 1 ? camX - 160 : camX + viewW + 160;
  const to = s.dir === 1 ? camX + viewW + 160 : camX - 160;
  return from + (to - from) * u;
}

export interface HiderRef {
  x: number;
  /** feet */
  y: number;
  ducking: boolean;
  grounded: boolean;
  hanging: boolean;
}

/** is he hidden: crouched inside a bush on the ground, or hanging inside a bush that hangs from a rope? */
export function hidden(bushes: Bush[], p: HiderRef): boolean {
  for (const b of bushes) {
    if (b.secret) continue;
    if (p.x < b.x + 10 || p.x > b.x + b.w - 10) continue;
    if (b.hanging) {
      if (p.hanging && p.y > b.y && p.y < b.y + 150) return true;
    } else if (p.grounded && p.ducking && Math.abs(p.y - b.y) < 10) return true;
  }
  return false;
}

/** does the shadow see him this moment? (only while it sweeps, and only once a pass) */
export function sees(s: WatchState, shadow: number, bushes: Bush[], p: HiderRef): boolean {
  return s.phase === 'pass' && !s.seen && Math.abs(shadow - p.x) < WATCH.sight && !hidden(bushes, p);
}

/**
 * The puzzle kit's noise (noise.ts): during a pass, an eagle that hears a noise in its watched stretch goes to it and circles over it
 * instead of sweeping on, so its shadow sees only whoever stands at the noise. Where its shadow is (world x) at time t.
 */
export function lureShadow(noiseX: number, t: number): number {
  return noiseX + Math.sin(t * 2.4) * 46;
}
