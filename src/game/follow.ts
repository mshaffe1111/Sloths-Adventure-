/**
 * follow — the little ones that follow Pokey home (2-3 "Walk Them Home", reference/design/2-3.md "follow.ts: the engine packet's contract").
 *
 * Freed from their cages, the little ones walk HIS path behind him, slower than he runs: the trail is his feet each frame while he walks
 * or hops off the ground (arclength s). A climb, a grab, a ride or a fall is a WAIT: the trail ends at the last ground he stood on and the
 * line stops short of it until he is back on that ground (or lower), so a little one never climbs, rides or falls. Each one chases the one
 * ahead (the first chases him) along the trail, at most `pace` px/s and never closer than `gap`. Over splash-back water a little one keeps
 * its place on the trail and is drawn at the surface, paddling. None of them is ever hurt or costs a heart (level.md rule 4).
 *
 * The watcher (World 2's heron) reads THEM, never him: its look sweeps its whole stretch in world x (not the view: upright the tail of the
 * line is off screen), and a little one in its sight that moves, or stands outside cover, is spooked: it scampers back to the stretch's
 * start and waits, hiding, until he walks back within `rejoin` px; then it runs to the end of the line. A lost heart re-forms the whole
 * line bunched behind him where he comes back (the last flag); so does a splash-back.
 *
 * Pure: no engine, no canvas. The engine steps it (engine.ts updateFollow) and draws it; the tests are follow.test.ts (the planted toys).
 */
import { watcherSees } from './stillness.ts';
import { WATCH, type WatchState, type WatchZone } from './watcher.ts';

/** a stage's followers (a world row: World 2's W2_FOLLOW, gen2/worlds/w2.ts; Designer numbers from 2-3.md) */
export interface FollowRow {
  /** how fast the little ones walk (px/s), each setting */
  pace: { normal: number; easy: number };
  /** how close one walks behind the one ahead, feet to feet (px) */
  gap: number;
  /** how fast a spooked one runs back to its stretch's start (px/s) */
  scamper: number;
  /** how close he must come to a spooked one for it to run back to the line (px) */
  rejoin: number;
  /** a little one is home once it is this close before the exit (px): the families wait on the jetty in front of the door */
  home: number;
}

/** a point of his trail: his feet, how far along the trail (s), and whether the line waits here (a climb's foot, a ride's bank) */
export interface TrailPt {
  x: number;
  y: number;
  s: number;
  wait?: boolean;
  /** he was in the air here (a hop off his own ground): a ground point is where the line may stand */
  air?: boolean;
}

export interface Trail {
  pts: TrailPt[];
  /** his place along the trail (the newest point's s) */
  s: number;
  /** he is climbing, riding, grabbing or falling: the newest ground point is a WAIT */
  held: boolean;
}

export type FollowKind = 'duck' | 'otter' | 'capy';
export type FollowState = 'join' | 'follow' | 'spooked' | 'home';

export interface Follower {
  kind: FollowKind;
  /** its place along his trail (follow) */
  s: number;
  x: number;
  y: number;
  /** it moved this step (the watcher sees movement, in cover too) */
  moved: boolean;
  state: FollowState;
  /** over splash-back water this step: drawn at the surface, paddling */
  paddle?: boolean;
  /** join: where it lands under its cage, before it walks to the end of the line */
  land?: { x: number; y: number };
  /** spooked: the x it runs back to (its stretch's start), and whether it is there yet */
  backX?: number;
  back?: boolean;
  /**
   * spooked: its place in the line (trail s) when the look saw it, kept for the ones behind it until the look is over (unkeep): without
   * it the one behind closes the gap under the same look and is seen moving too, one spook spooking the whole line (follow.test.ts toy 4)
   */
  slot?: number;
  /** which way it faces (+1 right) */
  facing: 1 | -1;
}

/** what record() is told he is doing this frame */
export type TrailMode = 'walk' | 'hold';

/** how much higher than a WAIT he may land and still be "back on that ground" (px): a climb that ends on a higher ledge keeps them waiting */
export const SAME_GROUND = 12;
/** a freed one drops from its cage this fast (px/s) */
export const DROP_SPEED = 420;

export function newTrail(x: number, y: number): Trail {
  return { pts: [{ x, y, s: 0 }], s: 0, held: false };
}

/**
 * Add his feet to the trail. `walk`: on the ground, or in the air from his own ground jump (the line hops where he hopped). `hold`: a climb,
 * grab, ride or fall: the last GROUND point becomes a WAIT (a hop that ended on a vine is cut back to where he took off) and nothing more is
 * added until he stands again on that ground or lower.
 */
export function record(t: Trail, p: { x: number; y: number; grounded: boolean }, mode: TrailMode): void {
  if (mode === 'hold') {
    if (t.held) return;
    let i = t.pts.length - 1;
    while (i > 0 && t.pts[i].air) i--;
    if (i < t.pts.length - 1) t.pts.length = i + 1;
    t.pts[i].wait = true;
    t.s = t.pts[i].s;
    t.held = true;
    return;
  }
  const l = t.pts[t.pts.length - 1];
  if (t.held) {
    // (back on the ground: the foot's ground or below; until then the line stays at the foot)
    if (!p.grounded || p.y < l.y - SAME_GROUND) return;
    l.wait = false;
    t.held = false;
  }
  const d = Math.hypot(p.x - l.x, p.y - l.y);
  if (d < 0.5) {
    if (!p.grounded) l.air = true;
    else delete l.air;
    return;
  }
  t.s += d;
  t.pts.push({ x: p.x, y: p.y, s: t.s, ...(p.grounded ? {} : { air: true }) });
}

/** the point of the trail at s (clamped to its ends) */
export function trailAt(t: Trail, s: number): { x: number; y: number } {
  const p = t.pts;
  if (s <= p[0].s) return { x: p[0].x, y: p[0].y };
  const z = p[p.length - 1];
  if (s >= z.s) return { x: z.x, y: z.y };
  let lo = 0;
  let hi = p.length - 1;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (p[m].s <= s) lo = m;
    else hi = m;
  }
  const a = p[lo];
  const b = p[hi];
  const k = b.s > a.s ? (s - a.s) / (b.s - a.s) : 0;
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
}

/** the farthest along the trail the line may go: the WAIT while he holds, else his own place */
export const trailCap = (t: Trail): number => (t.held ? t.pts[t.pts.length - 1].s : t.s);

/**
 * The hop the trail is in at s: from its take-off (the last ground point before it) to its landing (the first ground point after it;
 * Infinity while he is still in the air). Null on the ground.
 */
export function airSpan(t: Trail, s: number): { from: number; to: number } | null {
  const p = t.pts;
  if (p.length < 2) return null;
  let lo = 0;
  let hi = p.length - 1;
  if (s >= p[hi].s) lo = hi;
  else {
    while (hi - lo > 1) {
      const m = (lo + hi) >> 1;
      if (p[m].s <= s) lo = m;
      else hi = m;
    }
  }
  const a = p[lo];
  const b = p[lo + 1];
  const inAir = a.air || (!!b?.air && s > a.s);
  if (!inAir) return null;
  let i = lo;
  while (i > 0 && p[i].air) i--;
  let j = a.air ? lo : lo + 1;
  while (j < p.length && p[j].air) j++;
  return { from: p[i].s, to: j < p.length ? p[j].s : Infinity };
}

/** the height of his path where it last crossed x (the ground he walked there), or null where it never did */
export function trailYAt(t: Trail, x: number): number | null {
  const p = t.pts;
  for (let i = p.length - 1; i > 0; i--) {
    const a = p[i - 1];
    const b = p[i];
    if ((a.x - x) * (b.x - x) > 0) continue;
    const k = b.x !== a.x ? (x - a.x) / (b.x - a.x) : 0;
    return a.y + (b.y - a.y) * k;
  }
  return null;
}

/** the water surface under a little one at (x, y), where that is splash-back water and nothing stands there; null: on ground or in the air */
export type SurfaceAt = (x: number, y: number) => number | null;

/**
 * Step the line: each little one that follows chases the one ahead (the first chases him) along the trail, at most `pace` px/s, never
 * closer than `gap`, never past a WAIT. A freed one drops from its cage, then goes straight to the end of the line; a spooked one runs
 * straight back at `scamper` to its stretch's start and waits there. `surf`: the splash-back water under a point (it paddles there).
 */
export function stepLine(t: Trail, line: Follower[], pace: number, gap: number, dt: number, surf?: SurfaceAt, scamper = 300): void {
  let lead = t.s;
  const cap = trailCap(t);
  for (const f of line) {
    const x0 = f.x;
    const y0 = f.y;
    if (f.state === 'follow') {
      const target = Math.min(lead - gap, cap - (t.held ? gap : 0));
      const step = pace * dt;
      let ns = f.s + Math.max(0, Math.min(step, target - f.s));
      const mid = airSpan(t, f.s);
      if (mid && f.s > mid.from + 0.01) {
        // (in the middle of a hop it finishes the hop at its pace: a little one never stands in the air)
        ns = Math.min(f.s + step, mid.to, t.s);
      } else {
        // (and it never starts a hop it would have to stop inside: it waits at the take-off)
        const sp = airSpan(t, ns);
        if (sp && ns < sp.to - 0.01 && ns - f.s < step - 1e-6) ns = Math.max(f.s, sp.from);
      }
      f.s = ns;
      const q = trailAt(t, f.s);
      f.x = q.x;
      f.y = q.y;
      lead = Math.min(lead, f.s);
    } else if (f.state === 'join') {
      if (f.land && f.y < f.land.y - 0.5) {
        // (the drop from its cage)
        f.y = Math.min(f.land.y, f.y + DROP_SPEED * dt);
        f.x += (f.land.x - f.x) * Math.min(1, dt * 8);
      } else {
        f.land = undefined;
        const s = Math.max(0, Math.min(lead - gap, cap - (t.held ? gap : 0)));
        const q = trailAt(t, s);
        const d = Math.hypot(q.x - f.x, q.y - f.y);
        const step = pace * dt;
        if (d <= step) {
          f.x = q.x;
          f.y = q.y;
          f.s = s;
          f.state = 'follow';
          lead = s;
        } else {
          f.x += ((q.x - f.x) / d) * step;
          f.y += ((q.y - f.y) / d) * step;
        }
      }
    } else if (f.state === 'spooked' && f.slot !== undefined) {
      // (its place is kept for the ones behind it while the look lasts)
      lead = Math.min(lead, f.slot);
    }
    if (f.state === 'spooked' && !f.back) {
      // (straight back over the ground to its stretch's start, not back through his trail: he may have doubled back since)
      const to = f.backX ?? f.x;
      const d = to - f.x;
      const step = scamper * dt;
      if (Math.abs(d) <= step) {
        f.x = to;
        f.back = true;
      } else f.x += Math.sign(d) * step;
      // (over the ground he walked there)
      f.y = trailYAt(t, f.x) ?? f.y;
    }
    f.moved = Math.abs(f.x - x0) + Math.abs(f.y - y0) > 0.05;
    if (Math.abs(f.x - x0) > 0.05) f.facing = f.x > x0 ? 1 : -1;
    // (over splash-back water it keeps its place on the trail and swims at the surface, whatever height his hop took him there)
    const w = surf && f.state !== 'home' ? surf(f.x, f.y) : null;
    f.paddle = w !== null && w !== undefined;
    if (f.paddle) f.y = w!;
  }
}

/** a freed little one: it drops from its cage at `from` to `land` (the ground or water under the cage), then walks to the end of the line */
export function join(line: Follower[], kind: FollowKind, from: { x: number; y: number }, land: { x: number; y: number }): Follower {
  const f: Follower = { kind, s: 0, x: from.x, y: from.y, moved: true, state: 'join', land: { ...land }, facing: 1 };
  line.push(f);
  return f;
}

/** the heron saw it: it runs back to `setbackX` (its stretch's start) and waits there, hiding */
export function spook(f: Follower, setbackX: number): void {
  if (f.state !== 'follow') return;
  f.state = 'spooked';
  f.backX = setbackX;
  f.back = false;
  f.slot = f.s;
}

/** the look is over: the places kept for spooked ones are given up, and the ones behind them close up */
export function unkeep(line: Follower[]): void {
  for (const f of line) f.slot = undefined;
}

/**
 * he walked back to a spooked one hiding where it ran to (within `reach` px): it runs to the end of the line. True when it rejoined.
 * (Only once it is there: one spooked beside him still runs back first, so the look's setback is never undone where it happened.)
 */
export function rejoin(line: Follower[], f: Follower, heX: number, reach: number): boolean {
  if (f.state !== 'spooked' || !f.back || Math.abs(heX - f.x) > reach) return false;
  f.state = 'join';
  f.land = undefined;
  f.back = undefined;
  f.backX = undefined;
  f.slot = undefined;
  // (the end of the line: it falls in behind the others)
  const i = line.indexOf(f);
  if (i >= 0) line.splice(i, 1);
  line.push(f);
  return true;
}

/**
 * Re-form the line bunched behind him at `at` (a lost heart's flag, a splash-back): a fresh trail back from where he stands, facing
 * `dir`, and every little one not yet home on it in order, spooked and joining ones too. Returns the new trail.
 */
export function regroup(line: Follower[], at: { x: number; y: number }, gap: number, dir: 1 | -1 = 1): Trail {
  const n = line.filter((f) => f.state !== 'home').length;
  const back = gap * (n + 2);
  const t = newTrail(at.x - dir * back, at.y);
  record(t, { x: at.x, y: at.y, grounded: true }, 'walk');
  let k = 0;
  for (const f of line) {
    if (f.state === 'home') continue;
    k++;
    f.state = 'follow';
    f.s = t.s - gap * k;
    const q = trailAt(t, f.s);
    f.x = q.x;
    f.y = q.y;
    f.land = undefined;
    f.backX = undefined;
    f.back = undefined;
    f.slot = undefined;
    f.moved = false;
    f.paddle = false;
    f.facing = dir;
  }
  return t;
}

/** every little one following him that has reached `homeX` is home (it stays with its family). Returns how many are home now */
export function home(line: Follower[], homeX: number, dir: 1 | -1 = 1): number {
  for (const f of line) if (f.state === 'follow' && (f.x - homeX) * dir >= 0) f.state = 'home';
  return line.filter((f) => f.state === 'home').length;
}

/** how many of the line are home */
export const homeCount = (line: readonly Follower[]): number => line.filter((f) => f.state === 'home').length;

// ───────────────────────────── the watcher reads the line ─────────────────────────────

/**
 * Where a line-reading watcher's look is during a pass (world x): it sweeps its WHOLE stretch, from 160 px beyond one end to 160 px
 * beyond the other over the pass (2-3.md: x0 - 160 to x1 + 160), whatever the camera shows. (watcher.ts shadowX crosses the view.)
 */
export function zoneLookX(s: Pick<WatchState, 't' | 'dur' | 'phase' | 'dir'>, z: Pick<WatchZone, 'x0' | 'x1' | 'pass'>): number {
  const u = Math.min(1, s.t / (s.phase === 'pass' ? s.dur : (z.pass ?? WATCH.pass)));
  const from = s.dir === 1 ? z.x0 - 160 : z.x1 + 160;
  const to = s.dir === 1 ? z.x1 + 160 : z.x0 - 160;
  return from + (to - from) * u;
}

/** a cover a little one hides in: a reed clump standing on the ground (its bottom on the surface y) */
export interface LineCover {
  x: number;
  w: number;
  y: number;
  hanging?: boolean;
  secret?: boolean;
}

/** is this little one inside a reed clump (10 px inside its ends, standing at its foot)? The same rule as his hide (stillness.ts inCover) */
export function lineInCover(covers: readonly LineCover[], f: Pick<Follower, 'x' | 'y' | 'paddle'>): boolean {
  if (f.paddle) return false;
  for (const c of covers) {
    if (c.secret || c.hanging) continue;
    if (f.x < c.x + 10 || f.x > c.x + c.w - 10) continue;
    if (Math.abs(f.y - c.y) < 10) return true;
  }
  return false;
}

/**
 * The little ones the look sees this step (stillness.ts watcherSees with seesStill: one in its sight that moves, or stands still outside
 * cover). Only little ones that follow him; one already spooked, joining or home is not read. Never him.
 */
export function lineSeen(lookX: number, line: readonly Follower[], covers: readonly LineCover[], sight: number = WATCH.sight): Follower[] {
  return line.filter((f) => f.state === 'follow' && watcherSees({ seesStill: true }, Math.abs(lookX - f.x) < sight, !f.moved, lineInCover(covers, f)));
}
