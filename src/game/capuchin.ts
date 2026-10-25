/**
 * capuchin — World 4's cheeky monkeys (the Mist Cascades). Not hunters: they never hurt Pokey, they make trouble. Three jobs:
 *
 *   thief    (4-3) sits on a branch near a petal. When he comes close it grabs the petal and runs off along its path, stopping at each
 *            post to tease him. Catch up while it teases (or punch it) and it drops the petal and scampers away. Lose it and it keeps
 *            the petal in its den at the end of the path, where he can still fetch it: a chase, never a loss.
 *   lookout  (4-5, 4-8) sits watching a stretch. If it sees him out in the open it points and screeches, which calls the Sovereign
 *            (the engine starts her pass). The warning is fair: it stares and its fur bristles first. A fruit that lands near it
 *            (knocked down from a tree) draws it off to eat, and while it eats it sees nothing. Hiding (a bush, behind a fall) is hidden.
 *   guard    (4-9) paces the aerie's ledges. A gust that blows across it knocks it off its feet and it tumbles out of the way, then
 *            climbs back after a while: read the chimes, wait for the wind, walk through.
 *
 * Pure (no canvas, no engine): the stage builder, the engine and the tests agree on what every monkey is doing.
 */

export type CapJob = 'thief' | 'lookout' | 'guard';

export interface Capuchin {
  job: CapJob;
  /** where it sits (world px, its feet) */
  x: number;
  y: number;
  /** thief: the posts it runs to, in order (the last is its den), each with the ground y there */
  path?: Array<{ x: number; y: number }>;
  /** lookout: the stretch it watches (x range); guard: the ledge it paces (x range) */
  x0?: number;
  x1?: number;
}

export const CAP = {
  /** a thief grabs when he comes this close (px) */
  snatch: 150,
  /** how fast it runs (px/s): quicker than his walk, so he catches it at the posts, not on the way */
  run: 260,
  /** seconds it teases at each post before running on */
  tease: 2.2,
  /** he catches it within this distance (px) */
  catch: 46,
  /** lookout: seconds it stares before screeching, once it sees him (time to duck back into a bush) */
  stare: 0.9,
  /** seconds after a screech before it can screech again */
  rest: 4,
  /** a fruit this close draws it (px), and it eats for this long (s) */
  lure: 260,
  eat: 6,
  /** guard: pacing speed, seconds it stays down after a gust, and the gust strength that knocks it over */
  pace: 45,
  down: 5,
  knock: 0.6,
} as const;

export type CapMode = 'sit' | 'flee' | 'tease' | 'dropped' | 'stare' | 'screech' | 'lured' | 'eat' | 'pace' | 'blown';

export interface CapState {
  mode: CapMode;
  x: number;
  y: number;
  /** seconds in this mode */
  t: number;
  /** thief: the post it is running to; carrying the petal */
  post: number;
  carrying: boolean;
  /** lookout: seconds until it may screech again; the fruit it is after */
  cool: number;
  fruit?: { x: number; y: number };
  /** guard: which way it paces */
  dir: 1 | -1;
}

export function newCapuchin(c: Capuchin): CapState {
  return { mode: c.job === 'guard' ? 'pace' : 'sit', x: c.x, y: c.y, t: 0, post: 0, carrying: false, cool: 0, dir: 1 };
}

const go = (s: CapState, mode: CapMode): void => {
  s.mode = mode;
  s.t = 0;
};

// ───────────────────────────── thief ─────────────────────────────

/**
 * One frame of a thief. `px, py` = his middle x and feet y; `punched` = his punch landed on it this frame.
 * Returns `grabbed` the frame it takes the petal and `dropped` the frame it lets go of it (the engine puts the petal back where it fell).
 */
export function stepThief(c: Capuchin, s: CapState, px: number, py: number, punched: boolean, dt: number): { grabbed?: boolean; dropped?: boolean } {
  s.t += dt;
  const path = c.path ?? [];
  const near = Math.hypot(px - s.x, py - s.y);
  if (s.mode === 'sit') {
    if (near < CAP.snatch && path.length) {
      s.carrying = true;
      s.post = 0;
      go(s, 'flee');
      return { grabbed: true };
    }
    return {};
  }
  if (s.mode === 'dropped') return {};
  if (s.carrying && (punched || near < CAP.catch)) {
    s.carrying = false;
    go(s, 'dropped');
    return { dropped: true };
  }
  if (s.mode === 'flee') {
    const to = path[s.post];
    const dx = to.x - s.x;
    const step = CAP.run * dt;
    if (Math.abs(dx) <= step) {
      s.x = to.x;
      s.y = to.y;
      go(s, 'tease');
    } else {
      s.x += Math.sign(dx) * step;
      s.y += (to.y - s.y) * Math.min(1, step / Math.abs(dx));
    }
    return {};
  }
  // teasing at a post: it waits for him, then runs on (and at its den it stays put, holding the petal)
  if (s.mode === 'tease' && s.t >= CAP.tease && s.post < path.length - 1) {
    s.post++;
    go(s, 'flee');
  }
  return {};
}

// ───────────────────────────── lookout ─────────────────────────────

/**
 * One frame of a lookout. `hidden` = he is in a hiding place; `fruits` = fruit lying on the ground now.
 * Returns `screech` the frame it calls the Sovereign, and `ate` with the fruit it finished (the engine removes it).
 */
export function stepLookout(
  c: Capuchin,
  s: CapState,
  px: number,
  hidden: boolean,
  fruits: ReadonlyArray<{ x: number; y: number }>,
  dt: number,
): { screech?: boolean; ate?: { x: number; y: number } } {
  s.t += dt;
  s.cool = Math.max(0, s.cool - dt);
  // a fruit nearby wins over everything but a screech already under way
  if (s.mode !== 'lured' && s.mode !== 'eat' && s.mode !== 'screech') {
    const f = fruits.find((f) => Math.abs(f.x - s.x) < CAP.lure);
    if (f) {
      s.fruit = { x: f.x, y: f.y };
      go(s, 'lured');
    }
  }
  if (s.mode === 'lured' && s.fruit) {
    const dx = s.fruit.x - s.x;
    const step = CAP.run * 0.6 * dt;
    if (Math.abs(dx) <= step) {
      s.x = s.fruit.x;
      go(s, 'eat');
    } else s.x += Math.sign(dx) * step;
    return {};
  }
  if (s.mode === 'eat') {
    if (s.t >= CAP.eat) {
      const ate = s.fruit;
      s.fruit = undefined;
      go(s, 'sit');
      return ate ? { ate } : {};
    }
    return {};
  }
  const sees = !hidden && px >= (c.x0 ?? c.x - 300) && px <= (c.x1 ?? c.x + 300);
  if (s.mode === 'sit') {
    if (sees && s.cool === 0) go(s, 'stare');
    return {};
  }
  if (s.mode === 'stare') {
    if (!sees) go(s, 'sit'); // he got back under cover in time
    else if (s.t >= CAP.stare) {
      go(s, 'screech');
      s.cool = CAP.rest;
      return { screech: true };
    }
    return {};
  }
  if (s.mode === 'screech' && s.t >= 1.2) go(s, 'sit');
  return {};
}

// ───────────────────────────── guard ─────────────────────────────

/** one frame of a guard: `gust` = the wind's strength (0..1) across its ledge, signed by the way it blows */
export function stepGuard(c: Capuchin, s: CapState, gust: number, dt: number): { knocked?: boolean } {
  s.t += dt;
  if (s.mode === 'blown') {
    if (s.t >= CAP.down) {
      s.x = c.x;
      s.y = c.y;
      go(s, 'pace');
    }
    return {};
  }
  if (Math.abs(gust) >= CAP.knock) {
    go(s, 'blown');
    return { knocked: true };
  }
  const x0 = c.x0 ?? c.x - 80;
  const x1 = c.x1 ?? c.x + 80;
  s.x += s.dir * CAP.pace * dt;
  if (s.x > x1) {
    s.x = x1;
    s.dir = -1;
  } else if (s.x < x0) {
    s.x = x0;
    s.dir = 1;
  }
  return {};
}

/** does a monkey block the way? (a guard on its feet does: he cannot walk through it; anything else never does) */
export const capBlocks = (c: Capuchin, s: CapState, px: number): boolean => c.job === 'guard' && s.mode === 'pace' && Math.abs(px - s.x) < 30;
