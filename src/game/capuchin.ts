/**
 * capuchin — World 4's cheeky monkeys (the Mist Cascades). Not hunters: they never hurt Pokey, they make trouble. Three jobs:
 *
 *   thief    (4-3) sits on a branch near a petal. When he comes close it grabs the petal and runs off along its path, stopping at each
 *            post to tease him. Catch up while it teases (or punch it) and it drops the petal and scampers away. Lose it and it keeps
 *            the petal in its den at the end of the path, where he can still fetch it: a chase, never a loss.
 *   lookout  (4-5, 4-8) sits watching a stretch. If it sees him out in the open it points and screeches, which calls the Sovereign
 *            (the engine starts her pass). The warning is fair: it stares and its fur bristles first. A fruit that lands near it
 *            (knocked down from a tree) draws it off to eat, and while it eats it sees nothing. Hiding (a bush, behind a fall) is hidden.
 *   guard    (4-8, 4-9) paces a ledge. A gust that blows across it knocks it off its feet and it tumbles out of the way, then
 *            climbs back after a while: read the chimes, wait for the wind, walk through. On the aerie's narrow ledges (4-9,
 *            `blowOff`) the gust blows it clean off the ledge, and it is back up in a couple of seconds: be right behind it as the gust
 *            hits.
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
  /**
   * guard (4-9): it paces a narrow ledge over a drop, and a gust blows it clean off: it tumbles down out of sight and climbs back up
   * onto its ledge this many seconds later (BLOW_OFF), much sooner than a 4-8 guard gets back up. So the wind only clears the way for
   * a sloth who is right behind it when the gust hits.
   */
  blowOff?: number;
}

export const CAP = {
  /** a thief grabs when he comes this close (px) */
  snatch: 150,
  /** how fast it runs (px/s): quicker than his walk, so he catches it at the posts, not on the way */
  run: 260,
  /** seconds it teases at each post before running on (long enough to catch it up after a stair: play-testers kept arriving as it left) */
  tease: 3.2,
  /** he catches it by touching it: his middle within this far of its middle sideways (px), his feet within `catchUp` above its feet or
   * `catchDown` below them (so touching it from a jump, or from the step under its post, counts as well) */
  catch: 58,
  catchUp: 90,
  catchDown: 30,
  /** at a post it waits until he is this close (px sideways) before its teasing clock starts */
  wait: 460,
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

/**
 * 4-9: seconds a guard blown off its ledge takes to climb back up. From right behind it the far end of its beat is half a second's
 * run away; from the chimes it is about two seconds, so he has to be close when the gust hits (or set off as the chimes ring)
 */
export const BLOW_OFF = 1.8;

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
  /** guard: the way the gust that knocked it blew (it tumbles that way) */
  fell?: 1 | -1;
}

export function newCapuchin(c: Capuchin): CapState {
  return { mode: c.job === 'guard' ? 'pace' : 'sit', x: c.x, y: c.y, t: 0, post: 0, carrying: false, cool: 0, dir: 1 };
}

const go = (s: CapState, mode: CapMode): void => {
  s.mode = mode;
  s.t = 0;
};

// ───────────────────────────── thief ─────────────────────────────

/** is he touching it? (his middle x and feet y against its middle and feet) */
export const caught = (s: { x: number; y: number }, px: number, py: number): boolean =>
  Math.abs(px - s.x) < CAP.catch && py > s.y - CAP.catchUp && py < s.y + CAP.catchDown;

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
  if (s.carrying && (punched || caught(s, px, py))) {
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
  // teasing at a post: it waits for him to come in sight (its teasing clock only runs while he is within CAP.wait), teases a while,
  // then runs on (and at its den it stays put, holding the petal). So it always stops where he can see it, long enough to catch
  if (s.mode === 'tease' && Math.abs(px - s.x) > CAP.wait) s.t = 0;
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
    if (s.t >= (c.blowOff ?? CAP.down)) {
      s.x = c.x;
      s.y = c.y;
      s.fell = undefined;
      go(s, 'pace');
    }
    return {};
  }
  if (Math.abs(gust) >= CAP.knock) {
    go(s, 'blown');
    s.fell = gust > 0 ? 1 : -1;
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
