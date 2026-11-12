/**
 * heroNoise — the noise Pokey makes (GAME-MAP B10), the partner of stillness (stillness.ts): a hard landing, a punch, a break, and the
 * drum. Each is an event with a place, a time and a radius; a sleeper inside the radius wakes. What keeps a sleeper asleep is what
 * makes no event at all: holding still, a soft landing, catching a vine.
 *
 * The drum is the loud tool on purpose: it stuns every awake predator in its radius for a set time (and wakes any sleeper there).
 *
 * The numbers are data (LOUD). A noise carries as the puzzle kit's does (noise.ts: `r` along the stage, NOISE.hearY up and down).
 * Pure (no canvas, no engine).
 */
import { NOISE } from './noise.ts';

export const LOUD = {
  /**
   * a landing: silent when he fell `soft` px or less (over a double jump's rise, so nothing he does on flat ground is loud:
   * heroNoise.test.ts holds that to physics.ts); from there it carries `min` px plus `perPx` for each px further he fell, up to `max`
   */
  landing: { soft: 200, min: 180, perPx: 0.9, max: 560 },
  punch: { r: 240 },
  breaking: { r: 420 },
  /** the drum: how far it carries, and how long it stuns an awake predator (s) */
  drum: { r: 620, stun: 3 },
} as const;

export interface Sound {
  x: number;
  y: number;
  /** game time it was made */
  t: number;
  /** how far it carries (px) */
  r: number;
  from: 'landing' | 'punch' | 'break' | 'drum';
}

/** the noise of a landing after a fall of `fell` px, or null when it was soft */
export function landingNoise(x: number, y: number, t: number, fell: number): Sound | null {
  const L = LOUD.landing;
  return fell > L.soft ? { x, y, t, r: Math.min(L.max, L.min + (fell - L.soft) * L.perPx), from: 'landing' } : null;
}
export const punchNoise = (x: number, y: number, t: number): Sound => ({ x, y, t, r: LOUD.punch.r, from: 'punch' });
export const breakNoise = (x: number, y: number, t: number): Sound => ({ x, y, t, r: LOUD.breaking.r, from: 'break' });
export const drumNoise = (x: number, y: number, t: number): Sound => ({ x, y, t, r: LOUD.drum.r, from: 'drum' });

/** how far he has fallen: the top of his arc since he last stood or held on (y grows downward) */
export interface FallState { top: number | null }
export const newFall = (): FallState => ({ top: null });

/**
 * One fixed step. Returns how far he fell (px) on the frame he lands, else null. Catching a vine ends a fall with no landing, and a
 * fall after letting go is measured from where he held.
 */
export function stepFall(f: FallState, p: { y: number; grounded: boolean; holding: boolean }): number | null {
  if (p.holding) { f.top = p.y; return null; }
  if (!p.grounded) { f.top = f.top === null ? p.y : Math.min(f.top, p.y); return null; }
  const fell = f.top === null ? null : p.y - f.top;
  f.top = null;
  return fell;
}

/** anything that can hear: a sleeper (asleep until a noise reaches it) or an awake predator (which the drum can stun) */
export interface Listener {
  x: number;
  y: number;
  asleep: boolean;
  /** game time its stun ends (0: never stunned) */
  stunUntil: number;
}

/** does the noise reach it? */
export const hears = (n: Sound, who: { x: number; y: number }): boolean => Math.abs(n.x - who.x) <= n.r && Math.abs(n.y - who.y) <= NOISE.hearY;

/** is it stunned at game time t? */
export const stunned = (l: Listener, t: number): boolean => t < l.stunUntil;

/**
 * Let a noise be heard: every sleeper it reaches wakes; the drum also stuns every predator that was already awake there, for
 * LOUD.drum.stun from the beat (a later beat never shortens a stun). Returns the counts, for the sounds and the tell.
 */
export function sound(listeners: readonly Listener[], n: Sound): { woke: number; stunned: number } {
  let woke = 0;
  let hit = 0;
  for (const l of listeners) {
    if (!hears(n, l)) continue;
    if (l.asleep) { l.asleep = false; woke++; } else if (n.from === 'drum') { l.stunUntil = Math.max(l.stunUntil, n.t + LOUD.drum.stun); hit++; }
  }
  return { woke, stunned: hit };
}
