/**
 * wheelFlights — a water wheel FLOWN on the real engine (2-6.md, level.md rule 24; ENG-26 NEW 1): Pokey is engine.ts at 30 fps
 * (realPlay.ts) on a bare world of the wheel, its jetty, its street and a floor for the pond under it, with the game's own InputEngine on
 * him (an 80 ms tap, R-165.284) and the real wheel piece (pieces/wheelPiece.ts, started by RealPlay.bare from the buckets' seats) turning
 * it. This is reference/specs/sims/wheel26.ts (DESIGN-26-28's flight) made a tool: what it reads is what the stage's fairness check
 * (wheelLay.ts wheelFaults) holds a row to, through wheelFlights.data.ts (written by tools/engine/wheelflights.ts; wheelFlights.test.ts
 * flies them again and proves the table is the engine's). Read by the checks and the bots, never by the game.
 *
 * Reads (each over every frame of the phase it needs, so every moment of the wheel):
 *   board   from standing on the jetty 30 px from its lip, a TAP HOP toward the wheel / a WALK off the lip: the share of start frames
 *           (over one bucket period) that end standing in a bucket no deeper than a hop down, and the longest run of them (s)
 *   ride    standing in a bucket from the bottom, doing nothing: he stays in it a whole turn and more (or an 'in' street takes him off)
 *   walk    in a bucket, he holds the way on from frame k of a turn: the share of the turn, and the longest run (s), that lands him on the
 *   tap     street (the same with a tap hop the way on)
 *   jump    a held jump the way on from frame k (the 'up' street: only a jump from the top reaches it)
 *   step    the street's own step-off window a turn: the better of walk and tap for an 'edge' or 'in' street, the jump for 'up'
 * A start frame in the wheel's lower half is not flown for walk/tap/jump (the street stands over the top: nothing from there reaches it).
 */
import type { Difficulty } from '../difficulty.ts';
import type { Platform } from '../types.ts';
import { bucketPeriod, turnTime, wheelLips, WHEEL, type StreetKind, type Wheel } from '../wheel.ts';

/** a wheel's layout as flown: its row's numbers, and (a planted fault only) the street moved off its lip by (dx along the way, dy down) */
export interface WheelLayout {
  R: number;
  V: number;
  N: number;
  W?: number;
  street: StreetKind;
  /** an 'up' street: px above the top floor */
  up?: number;
  /** the way he travels (the top moves): -1 (left) unless asked; the flight is the same either way round (wheel.test.ts) */
  way?: 1 | -1;
  /** a planted fault: the street's lip moved this far further on (px) and lower (px) than its row puts it */
  moved?: { dx: number; dy: number };
}

/** a step-off read: the share of a turn's start frames that land him on the street, the longest run of them (s), and where that run starts
 *  and ends as the bucket's angle past the top (rad, in the way he travels: negative before the top; the bot's cue, firsttimer.ts
 *  SKILLS.rideWheel) */
export interface StepRead { share: number; window: number; from?: number; to?: number }

/** what the fairness check reads of a flight (wheelFlights.data.ts rows) */
export type WheelFlownRow = Omit<WheelFlown, 'misses'>;

export interface WheelFlown {
  turn: number;
  period: number;
  lift: number;
  board: { tap: { share: number; window: number }; walk: { share: number; window: number } };
  /** doing nothing from the bottom for 1.3 turns: still in his bucket, set down on an 'in' street, or dropped */
  ride: 'stayed in' | 'street' | 'fell';
  walk: StepRead;
  tap: StepRead;
  jump: StepRead;
  /** the step-off window a turn the fairness check reads (s) */
  step: number;
  /** where every miss (board and step-off) landed */
  misses: Record<string, number>;
}

/** the floor his miss lands on, under the bottom floor (px): the pond (WHEEL.pond) */
const BUCKET_ID = 100;
const JETTY = 1, STREET = 2, POND = 3;
/** the deepest a clean board lands under the jetty's top: a hop down, never a fall into a bucket lower on the rising side */
const BOARD_DROP = 70;

const runs = (good: boolean[], dt: number): number => +(longest(good).n * dt).toFixed(2);
/** the longest run of good frames, wrapping round (the frames are one period): its first frame and its length */
const longest = (good: boolean[]): { k: number; n: number } => {
  let best = { k: 0, n: 0 }, cur = 0;
  const g = [...good, ...good];
  for (let i = 0; i < g.length; i++) {
    cur = g[i] ? cur + 1 : 0;
    const n = Math.min(cur, good.length);
    if (n > best.n) best = { k: (i - n + 1) % good.length, n };
  }
  return best;
};
const shareOf = (a: boolean[]) => Math.round((100 * a.filter(Boolean).length) / a.length);

/** fly one layout on one setting on `stageId`'s RealPlay (about a second of CPU): the bare world replaces the stage's pieces, its own help
 *  (physics.ts ASSIST) stays in the flight; the caller hands in the stage the wheel is for, from world data (as landFlights.ts flyLandFlights) */
export async function flyWheel(L: WheelLayout, setting: Difficulty, stageId: string): Promise<WheelFlown> {
  await import('../headlessDom.ts');
  const { RealPlay, DT } = await import('../realPlay.ts');
  const { setDifficulty } = await import('../difficulty.ts');
  const { InputEngine } = await import('../inputEngine.ts');
  setDifficulty(setting);
  const r = new RealPlay(stageId, 1);
  const inp = new InputEngine();
  inp.source = 'pad';
  const e = r.e as unknown as { input: unknown; gameTime: number; update: (dt: number) => void };
  const W = L.W ?? WHEEL.bucketW;
  // (travelling left, as the flight did: the bare world's left wall stands at x = 0, so everything sits far right of it)
  const w: Wheel = { cx: 4000, cy: 2000, R: L.R, N: L.N, W, V: L.V, way: L.way ?? -1 };
  const lips = wheelLips(w, L.street, L.up ?? 0);
  const streetX = lips.streetX + w.way * (L.moved?.dx ?? 0), streetY = lips.streetY + (L.moved?.dy ?? 0);
  const way = w.way, toward = way < 0 ? 'left' : 'right';
  const world = () => {
    const buckets: Platform[] = [];
    for (let i = 0; i < w.N; i++) buckets.push({ id: BUCKET_ID + i, x: 0, y: 0, width: W, height: WHEEL.bucketH, type: 'moving', wheel: { w, i } });
    const pl: Platform[] = [
      { id: JETTY, x: way < 0 ? lips.jettyX : lips.jettyX - 2000, y: lips.jettyY, width: 2000, height: 20, type: 'solid' },
      { id: STREET, x: way < 0 ? streetX - 2000 : streetX, y: streetY, width: 2000, height: 20, type: 'solid' },
      { id: POND, x: w.cx - 3000, y: w.cy + w.R + WHEEL.pond, width: 6000, height: 200, type: 'solid' },
    ];
    r.bare([...pl, ...buckets]);
    inp.clearAll();
    e.input = inp;
    return buckets;
  };
  const frames = (n: number, each?: () => boolean | void) => {
    for (let k = 0; k < n; k++) {
      e.update(DT);
      if (each && each()) return k;
    }
    return n;
  };
  const inBucket = () => r.p.grounded && r.standingOn >= BUCKET_ID;
  const name = (id: number) => (id === STREET ? 'street' : id === POND ? 'pond' : id === JETTY ? 'jetty' : id >= BUCKET_ID ? 'bucket' : id < 0 ? 'air' : `id${id}`);
  const misses: Record<string, number> = {};
  const miss = (what: string, s: string) => { if (s !== 'bucket' && s !== 'street' && s !== 'jetty') misses[`${what} ${s}`] = (misses[`${what} ${s}`] ?? 0) + 1; };

  // board: from the jetty, 30 px back from its lip, at time t0
  const board = (t0: number, how: 'tap' | 'walk'): string => {
    world();
    e.gameTime = t0;
    r.stand(lips.jettyX - way * 30, lips.jettyY);
    frames(1);
    inp.triggerTouchMove(toward);
    if (how === 'tap') { inp.triggerTouchUp(0, 80); frames(2); inp.releaseTouchUp(); }
    let got = -1;
    frames(75, () => { if (r.p.grounded && r.standingOn !== JETTY) { got = r.standingOn; return true; } });
    const drop = r.p.y - lips.jettyY;
    inp.triggerTouchMove('none');
    const s = got >= BUCKET_ID ? (drop <= BOARD_DROP ? 'bucket' : 'bucket-deep') : name(got);
    miss(`board ${how}`, s);
    return s;
  };
  // seated in bucket 0 at time t0, standing in its middle (as he is after riding there from the bottom, doing nothing)
  const seat = (t0: number) => {
    const buckets = world();
    e.gameTime = t0;
    frames(1);
    const b = buckets[0];
    r.stand(b.x + W / 2, b.y);
    frames(2);
  };
  // step off from a seat at t0: walk (hold the way on), tap (a tap hop the way on), jump (a held jump the way on, let go at its top)
  const stepoff = (t0: number, how: 'walk' | 'tap' | 'jump'): string => {
    seat(t0);
    if (!inBucket()) return 'fell before';
    inp.triggerTouchMove(toward);
    if (how === 'tap') { inp.triggerTouchUp(0, 80); frames(2); inp.releaseTouchUp(); }
    let rel = how !== 'jump';
    if (how === 'jump') inp.triggerTouchUp(0, 500);
    let got = -1;
    frames(90, () => {
      if (!rel && r.p.vy > 0) { inp.releaseTouchUp(); rel = true; }
      if (rel && r.p.grounded && !inBucket()) { got = r.standingOn; return true; }
    });
    inp.triggerTouchMove('none');
    if (!rel) inp.releaseTouchUp();
    const s = got === -1 ? 'bucket' : name(got);
    miss(how, s);
    return s;
  };

  const P = bucketPeriod(w), T = turnTime(w);
  const nP = Math.round(P / DT), nT = Math.round(T / DT);
  const tapB: boolean[] = [], walkB: boolean[] = [];
  for (let k = 0; k < nP; k++) {
    tapB.push(board(k * DT, 'tap') === 'bucket');
    walkB.push(board(k * DT, 'walk') === 'bucket');
  }
  // ride: from the bottom, 1.3 turns doing nothing
  seat(0);
  let rode: WheelFlown['ride'] = 'stayed in';
  frames(Math.round((T * 1.3) / DT), () => {
    if (!inBucket() && r.p.grounded) return ((rode = r.standingOn === STREET ? 'street' : 'fell'), true);
  });
  const upper = (k: number) => {
    const phi = (((w.V / w.R) * k * DT) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    return phi > 0.35 * Math.PI && phi < 1.65 * Math.PI;
  };
  // (a start frame's bucket angle past the top, rad, in the way he travels: negative still rising to the top, positive past it)
  const past = (k: number) => {
    const a = (((w.V / w.R) * k * DT - Math.PI) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
    return +a.toFixed(3);
  };
  const read = (how: 'walk' | 'tap' | 'jump'): StepRead => {
    const ok: boolean[] = [];
    for (let k = 0; k < nT; k++) ok.push(upper(k) ? stepoff(k * DT, how) === 'street' : false);
    const run = longest(ok);
    return { share: shareOf(ok), window: runs(ok, DT), ...(run.n ? { from: past(run.k), to: past(run.k + run.n - 1) } : {}) };
  };
  const none: StepRead = { share: 0, window: 0 };
  const up = L.street === 'up';
  const walk = up ? none : read('walk');
  const tap = up ? none : read('tap');
  const jump = up ? read('jump') : none;
  return {
    turn: +T.toFixed(2),
    period: +P.toFixed(2),
    lift: Math.round(lips.jettyY - streetY),
    board: { tap: { share: shareOf(tapB), window: runs(tapB, DT) }, walk: { share: shareOf(walkB), window: runs(walkB, DT) } },
    ride: rode,
    walk,
    tap,
    jump,
    step: up ? jump.window : Math.max(walk.window, tap.window),
    misses,
  };
}
