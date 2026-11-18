/**
 * wheel26 — 2-6's water wheel flown on the real engine (DESIGN-26-28, level.md rule 24). Pokey is engine.ts at 30 fps (realPlay.ts) with the
 * game's own InputEngine on it (an 80 ms tap, R-165.284; never FakeInput's one-frame press). No wheel exists in src/ (grep 11-18), so the
 * wheel is written here the way wheel.ts would plug in: a StagePiece (stagePiece.types.ts) that, each fixed step, puts every bucket where the
 * wheel's turn says and moves whoever stands in one by the bucket's own (dx, dy), as pieces/ridePiece.ts does for a ride. The engine steps
 * pieces before its carry read (engine.ts:1832-1835, 1887), so a jump out of a bucket keeps its sideways speed by the one carry rule
 * (ride.ts RIDE.keep). Buckets stay level (a gondola on the rim).
 *
 * The wheel: axle (cx, cy), rim R, N buckets W wide, rim speed V px/s; bucket i at angle phi = V t / R + 2 pi i / N from the bottom, turning so
 * the bottom moves RIGHT (up the right side, over the top moving LEFT, down the left side). Bucket floor = (cx + R sin phi, cy + R cos phi).
 * The jetty he boards from stands on the RIGHT, its top DROP px above the wheel's bottom floor (the bucket rises past its lip); the street he
 * steps off onto stands on the LEFT, its top DROP px under the top floor (the bucket comes down past its lip). Both lips sit where the bucket's
 * near edge meets them at their own height (outside the sweep above that height). Under the wheel: the pond (a floor at the bottom + 160 px).
 *
 * Reads (each over every start frame of one bucket period, so every phase of the wheel):
 *   board  : from standing on the jetty 30 px from its lip, a TAP HOP toward the wheel (left held) / a WALK off the lip: share of start
 *            frames that end standing in a bucket, the longest run of good frames (his window, s), and where the misses land.
 *   ride   : standing in a bucket from the bottom, he stays in it all the way round (both settings).
 *   stepoff: in a bucket from the bottom, he holds LEFT (walk) / taps a hop left from frame t0: the frames that land him on the street;
 *            doing nothing rides round again (never a fall).
 *   throw  : a held jump left from a bucket at the top vs the same jump from a stand on still ground: the gap each clears at the same height.
 * (Everything sits at x > 0: the bare world's left wall stands at x = 0, realPlay.ts bare.)
 * Run (from a checkout of origin/main): npx tsx reference/specs/sims/wheel26.ts [normal|easy] > reference/specs/sims/out/wheel26-<setting>.txt
 */
import { RealPlay, DT } from '../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
import { InputEngine } from '../../../src/game/inputEngine.ts';
import type { Platform } from '../../../src/game/types.ts';
import type { PieceHost } from '../../../src/game/stagePiece.types.ts';

const setting = (process.argv[2] ?? 'normal') as 'normal' | 'easy';
setDifficulty(setting);
const r = new RealPlay('2-6', 1);
const inp = new InputEngine();
inp.source = 'pad';
r.e.input = inp;

interface Wheel { cx: number; cy: number; R: number; N: number; W: number; V: number }
const DROP = 28; // the bucket's floor passes a lip DROP px under it (river.ts LOG_DROP: a log's step down from the bank)
const BUCKET_ID = 100;
const BOARD_DROP = 70; // px: the deepest a clean board lands under the jetty's top (a hop down, never a fall)
const JETTY = 1, STREET = 2, POND = 3, FAR = 4;

const bucketAt = (w: Wheel, i: number, t: number) => {
  const phi = (w.V / w.R) * t + (2 * Math.PI * i) / w.N;
  return { x: w.cx + w.R * Math.sin(phi) - w.W / 2, y: w.cy + w.R * Math.cos(phi), phi };
};

class WheelPiece {
  readonly kind = 'wheel';
  readonly layers = [] as const;
  constructor(private w: Wheel, private buckets: Platform[]) {}
  step(_dt: number, host: PieceHost) {
    const p = host.player;
    this.buckets.forEach((b, i) => {
      const at = bucketAt(this.w, i, host.t);
      const dx = at.x - b.x, dy = at.y - b.y;
      b.x = at.x; b.y = at.y;
      if (p.grounded && host.standingOnId === b.id) (p.x += dx), (p.y += dy);
    });
  }
  respawn(host: PieceHost) { this.step(0, host); }
  hurts() { return null; }
  draw() {}
}

/** the jetty's and the street's lips: where the bucket's near edge meets a floor DROP px from the bottom / top */
const lips = (w: Wheel) => {
  const off = Math.sqrt(2 * w.R * DROP - DROP * DROP); // the floor's x from the axle when it is DROP px off the bottom / top
  return { jettyX: w.cx + off + w.W / 2, jettyY: w.cy + w.R - DROP, streetX: w.cx - off - w.W / 2, streetY: w.cy - w.R + DROP };
};

let STREET_UP = 0; // >0: the street stands STREET_UP px ABOVE the top bucket's floor, its lip in over the top (reached by a jump off the top)
let STREET_IN = false; // the street's lip reaches in over the wheel's top (STREET_IN_X px left of the axle): the buckets pass behind it
const STREET_IN_X = 20;
function world(w: Wheel, extra: Platform[] = []) {
  const L = lips(w);
  if (STREET_IN || STREET_UP) L.streetX = w.cx - STREET_IN_X;
  if (STREET_UP) L.streetY = w.cy - w.R - STREET_UP;
  const pl: Platform[] = [
    { id: JETTY, x: L.jettyX, y: L.jettyY, width: 2000, height: 20, type: 'solid' } as Platform,
    { id: STREET, x: L.streetX - 2000, y: L.streetY, width: 2000, height: 20, type: 'solid' } as Platform,
    { id: POND, x: w.cx - 3000, y: w.cy + w.R + 160, width: 6000, height: 200, type: 'solid' } as Platform,
    ...extra,
  ];
  const buckets: Platform[] = [];
  for (let i = 0; i < w.N; i++) buckets.push({ id: BUCKET_ID + i, x: 0, y: 0, width: w.W, height: 16, type: 'moving' } as Platform);
  r.bare([...pl, ...buckets]);
  const piece = new WheelPiece(w, buckets);
  (r.e as unknown as { pieces: unknown[] }).pieces = [piece];
  inp.clearAll();
  r.e.input = inp;
  return { L, buckets, piece };
}

const setT = (t: number) => { (r.e as unknown as { gameTime: number }).gameTime = t; };
const inBucket = () => r.p.grounded && r.standingOn >= BUCKET_ID;
const period = (w: Wheel) => (2 * Math.PI * w.R) / (w.N * w.V);

/** run frames until a predicate or a limit */
function frames(n: number, each?: (k: number) => boolean | void) {
  for (let k = 0; k < n; k++) { r.e.update(DT); if (each && each(k)) return k; }
  return n;
}

/** BOARD: start at time t0 standing on the jetty 30 px from its lip; tap hop left (or walk left); the result after 2.5 s */
function board(w: Wheel, t0: number, how: 'tap' | 'walk' | 'stand') {
  const { L } = world(w);
  setT(t0);
  r.stand(L.jettyX + 30, L.jettyY);
  frames(1);
  if (how === 'tap') { inp.triggerTouchMove('left'); inp.triggerTouchUp(0, 80); frames(2); inp.releaseTouchUp(); }
  if (how === 'walk') inp.triggerTouchMove('left');
  let got = -1;
  frames(75, () => { if (r.p.grounded && r.standingOn !== JETTY) { got = r.standingOn; return true; } });
  const drop = r.p.y - L.jettyY;
  inp.triggerTouchMove('none');
  // a clean board lands in a bucket no deeper than a hop down (BOARD_DROP); deeper is a fall into a bucket lower on the rising side
  return got >= BUCKET_ID ? (drop <= BOARD_DROP ? 'bucket' : 'bucket-deep') : got === POND ? 'pond' : got === -1 ? 'jetty' : `id${got}`;
}

/** put him in bucket 0 at the bottom (t where bucket 0's phi = 0) */
function seat(w: Wheel) {
  const { L, buckets } = world(w);
  setT(0);
  frames(1);
  const b = buckets[0];
  r.stand(b.x + w.W / 2, b.y);
  frames(2);
  return { L, buckets };
}

/** RIDE: does he stay in a bucket a whole turn and more, doing nothing? */
function ride(w: Wheel) {
  seat(w);
  const turn = (2 * Math.PI * w.R) / w.V;
  let off = -1;
  frames(Math.round((turn * 1.3) / DT), (k) => { if (!inBucket() && r.p.grounded) { off = k; return true; } });
  return { turn, off, where: off < 0 ? 'stayed in' : r.standingOn };
}

/** STEP OFF: seated at the bottom; from frame k0 hold LEFT (walk) or tap a hop left; where he ends up */
function stepoff(w: Wheel, k0: number, how: 'walk' | 'tap') {
  seat(w);
  frames(k0);
  if (!inBucket()) return 'fell before';
  inp.triggerTouchMove('left');
  if (how === 'tap') { inp.triggerTouchUp(0, 80); frames(2); inp.releaseTouchUp(); }
  let got = -1;
  frames(90, () => { if (r.p.grounded && !inBucket()) { got = r.standingOn; return true; } });
  inp.triggerTouchMove('none');
  return got === STREET ? 'street' : got === POND ? 'pond' : got === -1 ? 'bucket' : `id${got}`;
}

/** JUMP OFF THE TOP: seated at the bottom; at frame k0 a held jump with left held; lands on the street above? */
function jumpoff(w: Wheel, k0: number) {
  seat(w);
  frames(k0);
  if (!inBucket()) return 'fell before';
  inp.triggerTouchMove('left'); inp.triggerTouchUp(0, 500);
  let got = -1, rel = false;
  frames(90, () => {
    if (!rel && r.p.vy > 0) { inp.releaseTouchUp(); rel = true; }
    if (r.p.grounded && r.standingOn !== -1 && (r.standingOn !== 100 || r.p.vy === 0) && rel) { got = r.standingOn; return true; }
  });
  inp.triggerTouchMove('none');
  return got === STREET ? 'street' : got === POND ? 'pond' : got >= BUCKET_ID ? 'bucket' : `id${got}`;
}

/** a held jump left (jump held to the top, left held all the way) from a stand; returns the x travelled when his feet come back down
 *  through the take-off height (the gap a jump from here clears, level) and through 60 px under it: flown over open air (no street) */
function heldJumpFrom(standOnBucket: boolean, w?: Wheel) {
  if (standOnBucket && w) {
    const { buckets } = world(w);
    r.e.platforms.splice(0, r.e.platforms.length, ...r.e.platforms.filter((q: Platform) => q.id !== STREET && q.id !== JETTY));
    setT(0); frames(1);
    r.stand(buckets[0].x + w.W / 2, buckets[0].y); frames(2);
    frames(Math.round((Math.PI * w.R) / w.V / DT) - 3); // ride to the top (bucket 0 at phi = pi)
  } else {
    r.bare([{ id: 9, x: 3000, y: 800, width: 60, height: 20, type: 'solid' } as Platform, { id: POND, x: 0, y: 1400, width: 16000, height: 200, type: 'solid' } as Platform]);
    (r.e as unknown as { pieces: unknown[] }).pieces = [];
    inp.clearAll(); r.e.input = inp;
    r.stand(3030, 800); frames(3);
  }
  const x0 = r.p.x, y0 = r.p.y, inB = inBucket();
  inp.triggerTouchMove('left'); inp.triggerTouchUp(0, 500);
  frames(1);
  const carried = (r.e as unknown as { carryVx: number }).carryVx;
  let level = NaN, low = NaN, rel = false, py = r.p.y, px = r.p.x;
  for (let k = 0; k < 120; k++) {
    r.e.update(DT);
    if (!rel && r.p.vy > 0) { inp.releaseTouchUp(); rel = true; }
    const cross = (h: number) => Math.round(x0 - (px + ((r.p.x - px) * (h - py)) / (r.p.y - py)));
    if (r.p.vy > 0 && Number.isNaN(level) && py < y0 && r.p.y >= y0) level = cross(y0);
    if (r.p.vy > 0 && Number.isNaN(low) && py < y0 + 60 && r.p.y >= y0 + 60) { low = cross(y0 + 60); break; }
    py = r.p.y; px = r.p.x;
  }
  inp.triggerTouchMove('none');
  return { inB, carried: Math.round(carried), level, low };
}

const runs = (good: boolean[], dt: number) => {
  let best = 0, cur = 0;
  // wrap-around: the frames are one bucket period
  const g = [...good, ...good];
  for (const ok of g) { cur = ok ? cur + 1 : 0; best = Math.max(best, Math.min(cur, good.length)); }
  return +(best * dt).toFixed(2);
};

const WHEELS: Array<{ name: string; w: Wheel }> = [];
const easy = setting === 'easy';
for (const R of [160, 180, 200]) for (const V of easy ? [50, 60] : [60, 70, 80]) for (const N of [5, 6])
  WHEELS.push({ name: `R${R} V${V} N${N}`, w: { cx: 4000, cy: 2000, R, N, W: 120, V } });

console.log(`wheel26 ${setting}: DROP ${DROP}, bucket 120 px, the jetty right / the street left; times are s of one bucket period`);
console.log('wheel | turn s | bucket every s | lift px | board tap: share, window | board walk: share, window | stand on jetty | ride | step off walk: share of a turn, window | step off tap | street IN over the top: step off walk, its falls | misses land (edge street) | deep boards (of both)');
for (const { name, w } of WHEELS.filter((x) => !process.env.WHEEL || x.name === process.env.WHEEL)) {
  const P = period(w);
  const n = Math.round(P / DT);
  const tap: string[] = [], walk: string[] = [];
  for (let k = 0; k < n; k++) { tap.push(board(w, k * DT, 'tap')); walk.push(board(w, k * DT, 'walk')); }
  const standRes = board(w, 0, 'stand');
  const share = (a: string[]) => Math.round((100 * a.filter((s) => s === 'bucket').length) / a.length);
  const turnFrames = Math.round((2 * Math.PI * w.R) / w.V / DT);
  const so: string[] = [], sot: string[] = [];
  for (let k = 0; k < turnFrames; k += 1) { so.push(stepoff(w, k, 'walk')); sot.push(stepoff(w, k, 'tap')); }
  STREET_IN = true;
  const si: string[] = [];
  for (let k = 0; k < turnFrames; k += 1) si.push(stepoff(w, k, 'walk'));
  STREET_IN = false;
  const rd = ride(w);
  const miss = [...tap, ...walk, ...so, ...sot].filter((s) => s !== 'bucket' && s !== 'street' && s !== 'jetty' && s !== 'bucket-deep');
  const deep = [...tap, ...walk].filter((s) => s === 'bucket-deep').length;
  const missTally = Object.entries(miss.reduce<Record<string, number>>((m, s) => ((m[s] = (m[s] ?? 0) + 1), m), {})).map(([k, v]) => `${k} ${v}`).join(', ') || 'none';
  const sShare = (a: string[]) => `${Math.round((100 * a.filter((s) => s === 'street').length) / a.length)}%, ${runs(a.map((s) => s === 'street').slice(), DT)} s`;
  const L = lips(w);
  console.log(`${name} | ${((2 * Math.PI * w.R) / w.V).toFixed(1)} | ${P.toFixed(2)} | ${Math.round(L.jettyY - L.streetY)} | ${share(tap)}%, ${runs(tap.map((s) => s === 'bucket'), DT)} | ${share(walk)}%, ${runs(walk.map((s) => s === 'bucket'), DT)} | ${standRes} | ${rd.where}${rd.off >= 0 ? ' @' + (rd.off * DT).toFixed(1) + 's' : ''} | ${sShare(so)} | ${sShare(sot)} | ${sShare(si)}, pond ${si.filter((x) => x === 'pond').length} | ${missTally} | ${deep}`);
}

console.log('\njump off the top: the street H px above the top bucket floor, its lip 20 px left of the axle; a held jump, left held, from frame k of a turn');
for (const H of [40, 60, 80]) for (const name of ['R180 V70 N6', 'R180 V60 N6', 'R160 V60 N6', 'R180 V50 N6']) {
  const found = WHEELS.find((x) => x.name === name);
  if (!found) continue;
  STREET_UP = H;
  const res: string[] = [];
  const turnFrames = Math.round((2 * Math.PI * found.w.R) / found.w.V / DT);
  for (let k = 0; k < turnFrames; k++) res.push(jumpoff(found.w, k));
  STREET_UP = 0;
  const ok = res.map((x) => x === 'street');
  console.log(`H ${H}, ${name}: lands on the street ${Math.round((100 * ok.filter(Boolean).length) / ok.length)}% of a turn, longest window ${runs(ok, DT)} s; falls to the pond ${res.filter((x) => x === 'pond').length} frames`);
}
console.log('\nthrow: a held jump LEFT, left held all the way: from a stand on still ground vs from a bucket at the top (carried at V)');
const ground = heldJumpFrom(false);
console.log(`still ground: carried ${ground.carried} px/s; clears ${ground.level} px level, ${ground.low} px to a landing 60 px lower`);
for (const V of easy ? [50, 60] : [60, 70, 80]) {
  const w: Wheel = { cx: 4000, cy: 2000, R: 180, N: 6, W: 120, V };
  const b = heldJumpFrom(true, w);
  console.log(`bucket at the top (in it: ${b.inB}), V ${V}: carried ${b.carried} px/s; clears ${b.level} px level, ${b.low} px to 60 px lower`);
}
