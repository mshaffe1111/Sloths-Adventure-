/**
 * eaglet — the eagle nests at the top of 4-6 Above the Mist. A nest of harpy eaglets sleeps on a wide ledge. On its own rhythm one
 * stirs (a warning: a head pops up), then they both look about. Anyone moving near the nest while they look gets a flurry of little
 * wings that blows him back a few steps; standing still while they look, nothing happens, and they doze off again. It never hurts and
 * never costs a life: the only cost is a few steps. (A phone pad has no walk-slowly, so "tiptoe past" is: go while they sleep, freeze
 * while they look. It is World 4's patience again.)
 *
 * Pure (no canvas, no engine): the stage builder, the engine and the tests agree on what a nest is doing.
 */

import { cycle3 } from './clock.ts';

export interface Nest {
  /** the nest's middle, and the ledge surface it sits on */
  x: number;
  y: number;
  /** the stretch of the ledge they can see: his middle within [x0, x1] */
  x0: number;
  x1: number;
  /** seconds from one look to the next, and where in that cycle the stage starts */
  every: number;
  offset: number;
}

export const NEST = {
  /** the warning: one head pops up (s) */
  stir: 1.2,
  /** they look about (s) */
  look: 1.6,
  /** the flurry of wings that blows him back (s), and how fast it pushes him at first (px/s; it eases off) */
  blow: 0.45,
  push: 520,
  /** his feet this far above the ledge (jumping) or a little below it still count as near the nest */
  above: 170,
  below: 30,
} as const;

export type NestPhase = 'sleep' | 'stir' | 'look';

/** what the nest is doing at time t, and how far through that it is (0..1) */
export function nestAt(n: Nest, t: number): { phase: NestPhase; u: number } {
  const sleep = n.every - NEST.stir - NEST.look;
  // the one clock (clock.ts): asleep, stirring (the warning), then looking for the rest of the cycle
  const k = cycle3(t, n.offset, n.every, sleep, NEST.stir);
  return k.index === 0 ? { phase: 'sleep', u: k.into / sleep } : k.index === 1 ? { phase: 'stir', u: k.into / NEST.stir } : { phase: 'look', u: k.into / NEST.look };
}

/** which look this is (so a look blows him back once at most) */
export const nestCycle = (n: Nest, t: number): number => Math.floor((t + n.offset) / n.every);

/** is he where the eaglets can see him? (his middle x, his feet y) */
export function nearNest(n: Nest, px: number, feetY: number): boolean {
  return px >= n.x0 && px <= n.x1 && feetY >= n.y - NEST.above && feetY <= n.y + NEST.below;
}

/** a nest's rhythm leaves time to cross its stretch at a walk while they sleep, with the warning on top */
export function nestFair(n: Nest, run: number): boolean {
  const sleep = n.every - NEST.stir - NEST.look;
  return sleep >= (n.x1 - n.x0) / run + 0.5 && NEST.stir >= 1;
}
