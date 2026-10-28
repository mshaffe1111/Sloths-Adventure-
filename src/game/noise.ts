/**
 * noise — the puzzle kit's distraction (phase 2a, 2026-10-28): a thrown thing that lands (a stone, a pebble, an acorn) or a bell that is
 * rung makes a noise where it is, and the watchers near it turn toward it, or go to it, for a while: a safe moment to slip past.
 *
 * Who listens (each reads `heard` for its own spot, and does what it does with the noise for `NOISE.dur` seconds):
 *   - the eagle watch (watcher.ts): during a pass its shadow goes to the noise and circles there (`lureShadow`), so it sees nobody
 *     away from it;
 *   - a sleeping thorn vine (thornVine.ts): it turns toward the noise and sees nothing else while it listens (`vineSees`);
 *   - World 2's snapping turtles and the royal turtle guards (predatorAI.ts): they walk to the noise along their ground and watch it,
 *     noticing nobody;
 *   - World 5's silk spiders, later: the same `heard` at the spider's spot.
 *
 * Pure: no canvas, no engine. The kit makes the noises (puzzlePlay.ts), the engine hands each watcher the one it hears.
 */

export const NOISE = {
  /** how far a noise carries (px, either way along the stage) */
  hear: 520,
  /** and how far up and down */
  hearY: 360,
  /** how long the watchers listen to it (s) */
  dur: 4.5,
  /** a bell's ring carries further than a stone landing */
  bellHear: 680,
} as const;

export interface Noise {
  x: number;
  y: number;
  /** game time it was made */
  t: number;
  /** how far it carries (px) */
  r: number;
  /** what made it (for the sound and Dot's line) */
  from: 'land' | 'bell';
}

/** is a noise still being listened to at time t */
export const fresh = (n: Noise, t: number): boolean => t >= n.t && t - n.t < NOISE.dur;

/** the newest noise a watcher at (x, y) hears at time t, or null */
export function heard(noises: readonly Noise[], x: number, y: number, t: number): Noise | null {
  let best: Noise | null = null;
  for (const n of noises) {
    if (!fresh(n, t) || Math.abs(n.x - x) > n.r || Math.abs(n.y - y) > NOISE.hearY) continue;
    if (!best || n.t > best.t) best = n;
  }
  return best;
}

/** drop the noises nobody listens to any more */
export function prune(noises: Noise[], t: number): void {
  for (let i = noises.length - 1; i >= 0; i--) if (!fresh(noises[i], t)) noises.splice(i, 1);
}
