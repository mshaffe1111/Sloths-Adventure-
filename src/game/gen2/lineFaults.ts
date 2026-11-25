/**
 * gen2/lineFaults — the builder's check on a stage whose little ones follow him home (2-3 "Walk Them Home", proto.follow; next to
 * stillLay.ts stillFaults, which still holds its watched stretches to his own rules). What is unfair to THE LINE, in words (none: it may
 * be laid). The numbers are 2-3.md's (`LINE_RULE`, from its flights, reference/specs/sims/follow23.ts):
 *   - a reed clump too narrow to hold the bunched line (Normal < 260 px, Easy < 340);
 *   - open ground between clumps (or from a watched stretch's end to its clump) too wide for the line to cross between looks: dry mud
 *     over 500 px (350 under two herons, and on Easy), a watched pond over 360 px (his hops make their path 1.3 x as long);
 *   - two herons over one crossing whose longest safe time to leave is under 2.0 s: FLOWN with the game's own line and herons
 *     (followPlay.ts), never a formula, so the check calls the code the screen calls (LESSONS: a gate must call the same code);
 *   - a climb whose top lets him off onto other ground, or whose foot has no ground `rejoin` px on (the line waits at the foot and
 *     rejoins him on the ground it waited on: a climb that carries him on strands them), and any swing or ride (they never swing or ride);
 *   - a cage whose little one drops into nothing or deep water (it must land on ground or splash-back water), or past the exit.
 * Pure: no engine, no canvas.
 */
import { FollowPlay } from '../followPlay.ts';
import { PHYS } from '../physics.ts';
import { WATCH, type Bush, type WatchZone } from '../watcher.ts';
import { lineInCover, type FollowRow } from '../follow.ts';
import type { Collectible, Platform, Rope, Vine } from '../types.ts';

/** 2-3.md's numbers for the line (Designer numbers, from the flights) */
export const LINE_RULE = {
  /** the narrowest reed clump that holds the bunched line (px) */
  hide: { normal: 260, easy: 340 },
  /** the widest open mud between clumps (px): one heron; two herons over it; on Easy */
  open: { normal: 500, twoHerons: 350, easy: 350 },
  /** the widest watched pond between a bank and an isle (px), both settings */
  pond: 360,
  /** under two herons, the shortest longest-safe-time to leave a clump (s) */
  window: 2.0,
  /**
   * the calibrated child (R-165.363; ENG-CAGE-b's trace of the child bot on 2-3, the bot matched to the testers on 1-1, BOTS.md): his pace
   * on open ground (px/s: steer p50 120 ms, gap p50 630 ms), how long he stands at a face before he hops it (s: his stop reaction counts
   * only his pushes, P13), and the rise that is a face (px). The line's tail is the row's gap x the little ones he leads there.
   */
  child: { pace: 40, face: 3, rise: 12 },
} as const;

/** what lineFaults reads of a laid stage */
export interface LineStage {
  platforms: readonly Platform[];
  vines?: readonly Vine[];
  ropes?: readonly Rope[];
  collectibles: readonly Collectible[];
  exitTotemX: number;
  bushes?: readonly Bush[];
  watch?: readonly WatchZone[];
  /** splash-back water (a teaching river's or pool's span and surface) and deep water, by span */
  safeWater?: ReadonlyArray<{ x0: number; x1: number; y: number }>;
  deepWater?: ReadonlyArray<{ x0: number; x1: number; y: number }>;
  /** +1: the stage runs to the right */
  dir?: 1 | -1;
}

const R = (n: number) => Math.round(n);

/** the top of the still ground under x at or below y (null: none) */
function groundUnder(platforms: readonly Platform[], x: number, y: number): number | null {
  let best = Infinity;
  for (const pl of platforms) if (pl.type === 'solid' && !pl.pad && x >= pl.x && x <= pl.x + pl.width && pl.y >= y - 4) best = Math.min(best, pl.y);
  return best === Infinity ? null : best;
}

/**
 * The longest time (s) he may leave clump A for clump B over one cycle of the herons and have every little one reach B unseen: the game's
 * own line (FollowPlay) behind a runner at his full run, the herons at their shortest calm (the hardest roll), leave times every 0.1 s.
 */
export function safeWindow(row: FollowRow, easy: boolean, A: Bush, B: Bush, zones: readonly WatchZone[], platforms: readonly Platform[], safeWater: LineStage['safeWater'] = [], n = 5): number {
  const calm = Math.max(...zones.map((z) => z.calm[0]));
  const cycle = calm + Math.max(...zones.map((z) => z.warn ?? WATCH.warn)) + Math.max(...zones.map((z) => z.pass ?? WATCH.pass));
  const settle = cycle * 2;
  const dt = 1 / 30;
  const y = A.y;
  const safe: boolean[] = [];
  for (let L = 0; L < cycle - 1e-6; L += 0.1) {
    const fp = new FollowPlay(row, easy, { exitX: 1e9, zones, covers: [A, B], platforms, safeWater: safeWater ?? [] }, { x: A.x - 400, y });
    // (him walked in to the far end of clump A, the line bunched behind him inside it)
    const at = A.x + A.w - 30;
    fp.step(dt, { x: A.x - 400, y, vy: 0, grounded: true }, undefined, () => 0);
    for (let x = A.x - 400 + 120; x < at; x += 120) fp.step(dt, { x, y, vy: 0, grounded: true }, undefined, () => 0);
    fp.step(dt, { x: at, y, vy: 0, grounded: true }, undefined, () => 0);
    for (let i = 0; i < n; i++) fp.free('duck', { x: at - row.gap * (i + 1), y }, { x: at - row.gap * (i + 1), y });
    let x = at;
    let seen = false;
    const stop = B.x + B.w - 30;
    const end = settle + L + 12;
    for (let t = 0; t < end && !seen; t += dt) {
      if (t >= settle + L && x < stop) x = Math.min(stop, x + PHYS.maxRun * dt);
      const ev = fp.step(dt, { x, y, vy: 0, grounded: true }, undefined, () => 0);
      // (before he leaves, a look over the bunched line in A is not this crossing's: the line waits in the reeds, still)
      if (ev.spooked.length && t >= settle + L) seen = true;
      if (x >= stop && fp.line.every((f) => f.state === 'follow' && !f.moved && f.x > B.x + 10 && f.x < B.x + B.w - 10)) break;
    }
    safe.push(!seen && fp.line.every((f) => f.state === 'follow' && f.x > B.x + 10));
  }
  let best = 0;
  let run = 0;
  for (const ok of [...safe, ...safe]) {
    run = ok ? run + 1 : 0;
    best = Math.max(best, Math.min(run, safe.length));
  }
  return best * 0.1;
}

/** the top of the highest still ground over x (null: none): the surface he walks on */
function topAt(platforms: readonly Platform[], x: number): number | null {
  let best = Infinity;
  for (const pl of platforms) if (pl.type === 'solid' && !pl.pad && x >= pl.x && x <= pl.x + pl.width) best = Math.min(best, pl.y);
  return best === Infinity ? null : best;
}

/** the faces (a rise of more than LINE_RULE.child.rise px in his travel) between a and b: where each one stands */
export function facesOn(platforms: readonly Platform[], a: number, b: number, dir: 1 | -1 = 1): number[] {
  const out: number[] = [];
  const step = 4;
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  let prev = topAt(platforms, dir === 1 ? lo : hi);
  for (let i = 1; lo + i * step <= hi; i++) {
    const x = dir === 1 ? lo + i * step : hi - i * step;
    const y = topAt(platforms, x);
    if (prev !== null && y !== null && prev - y > LINE_RULE.child.rise) out.push(Math.round(x));
    prev = y;
  }
  return out;
}

/**
 * R-165.363: the calibrated child leads the line over one watched stretch (its herons, its reeds), FLOWN with the game's own line and herons
 * (followPlay.ts) at the herons' shortest calm: he walks in at LINE_RULE.child.pace, stands LINE_RULE.child.face s at each face before he
 * hops it, waits at each clump's far end until a look has come and gone (the careful child: he leaves as a look ends, the herons all calm),
 * and goes; at a screech or a look he freezes wherever the whole line is hidden (in the reeds, still), else he hurries on. A little one seen on the way is the fault: the stretch's open ground plus the line's tail does not fit the look-free window at
 * his pace. Returns where (null: he brings them all through).
 */
export function childCross(row: FollowRow, easy: boolean, zones: readonly WatchZone[], covers: readonly Bush[], platforms: readonly Platform[], safeWater: LineStage['safeWater'], n: number, dir: 1 | -1 = 1, joins: readonly number[] = [], wetAt: (x: number) => boolean = () => false): { x: number; t: number } | null {
  const C = LINE_RULE.child;
  const x0 = Math.min(...zones.map((z) => z.x0));
  const x1 = Math.max(...zones.map((z) => z.x1));
  const startX = dir === 1 ? x0 - 400 : x1 + 400;
  const endX = dir === 1 ? x1 + row.gap * (n + joins.length) + 60 : x0 - row.gap * (n + joins.length) - 60;
  const yAt = (x: number) => topAt(platforms, x) ?? topAt(platforms, startX) ?? 0;
  const fp = new FollowPlay(row, easy, { exitX: dir * 1e9, dir, zones, covers, platforms, safeWater: safeWater ?? [] }, { x: startX, y: yAt(startX) });
  const dt = 1 / 30;
  const zero = () => 0;
  const hero = (x: number) => ({ x, y: yAt(x), vy: 0, grounded: true });
  // (the line bunched behind him before the stretch)
  fp.step(dt, hero(startX), undefined, zero);
  for (let i = 0; i < n; i++) fp.free('duck', { x: startX - dir * row.gap * (i + 1), y: yAt(startX) }, { x: startX - dir * row.gap * (i + 1), y: yAt(startX) });
  for (let i = 0; i < 30; i++) fp.step(dt, hero(startX), undefined, zero);
  // (where he waits: each clump's far end, 30 px in)
  const stops = covers.filter((b) => (dir === 1 ? b.x + b.w > x0 && b.x < x1 : b.x < x1 && b.x + b.w > x0)).map((b) => (dir === 1 ? b.x + b.w - 30 : b.x + 30)).sort((a, b) => (a - b) * dir);
  // (a face out of the water is a hop off a pad, not a face he stands at)
  const faces = new Set(facesOn(platforms, x0 - 400, x1 + 400, dir).filter((f) => !wetAt(f - dir * 8)));
  const join = [...joins].sort((a, b) => (a - b) * dir);
  let x = startX;
  let stall = 0;
  let waiting = false;
  let sawLook = false;
  let next = 0;
  const looking = () => fp.herons.some((h) => h.s.phase !== 'calm');
  // (the whole line hidden: each little one in a clump, or off the watched stretch)
  const hidden = () => fp.line.every((f) => f.x < x0 || f.x > x1 || lineInCover(covers, f));
  for (let t = 0; t < 240; t += dt) {
    if (waiting) {
      if (looking()) sawLook = true;
      else if (sawLook) waiting = false;
    }
    // (at a screech or a look he freezes where the line is hidden, as the game teaches: the heron sees movement in the reeds too)
    const freeze = !waiting && looking() && hidden();
    if (!waiting && !freeze) {
      if (stall > 0) stall -= dt;
      else {
        // (over water he hops pad to bank at his run, the path 1.3 x as long: LINE_RULE.pond's flight)
        const nx = x + dir * (wetAt(x) ? PHYS.maxRun / 1.3 : C.pace) * dt;
        // (a face in the next step: he stands at it, then hops it)
        const hit = [...faces].find((f) => (f - x) * dir > 0 && (f - nx) * dir <= 0);
        if (hit !== undefined) {
          faces.delete(hit);
          stall = C.face;
          x = hit - dir;
        } else x = nx;
        // (a cage he reaches: its little one joins the line behind him)
        while (join.length && (x - join[0]) * dir >= 0) {
          const at = join.shift()!;
          fp.free('duck', { x: at, y: yAt(at) - 40 }, { x: at, y: yAt(at) });
        }
        if (next < stops.length && (x - stops[next]) * dir >= 0) {
          x = stops[next];
          next++;
          waiting = true;
          sawLook = false;
        }
      }
    }
    const ev = fp.step(dt, hero(x), undefined, zero);
    // (where HE is when a little one is seen: the spooked one is already set back)
    if (ev.spooked.length) return { x: Math.round(x), t: Math.round(t * 10) / 10 };
    if ((x - endX) * dir >= 0) return null;
  }
  return { x: Math.round(x), t: 240 };
}

/** what is unfair to the little ones in a laid stage, in words (none: it may be laid) */
export function lineFaults(st: LineStage, row: FollowRow, easy = false): string[] {
  const out: string[] = [];
  const dir = st.dir ?? 1;
  const bushes = (st.bushes ?? []).filter((b) => !b.secret && !b.hanging).sort((a, b) => a.x - b.x);
  const zones = st.watch ?? [];
  const wet = (a: number, b: number) => (st.safeWater ?? []).some((w) => w.x0 < b && w.x1 > a) || (st.deepWater ?? []).some((w) => w.x0 < b && w.x1 > a);
  const minHide = easy ? LINE_RULE.hide.easy : LINE_RULE.hide.normal;
  for (const z of zones) {
    const name = `watch ${R(z.x0)}-${R(z.x1)}`;
    const inside = bushes.filter((b) => b.x + b.w > z.x0 && b.x < z.x1);
    for (const b of inside) if (b.w < minHide) out.push(`${name}: the reeds at ${R(b.x)} are ${R(b.w)} px, under the ${minHide} px that hold the bunched line`);
    // (the herons over each crossing: every stretch that overlaps it)
    const over = (a: number, b: number) => zones.filter((q) => q.x0 < b && q.x1 > a);
    const edges: Array<[string, number, number, Bush | null, Bush | null]> = [];
    // (the open ground between the clumps' edges, as the design's flights measure G)
    if (inside.length) {
      edges.push(['its start', z.x0, inside[0].x, null, inside[0]]);
      for (let i = 1; i < inside.length; i++) edges.push([`the reeds at ${R(inside[i - 1].x)}`, inside[i - 1].x + inside[i - 1].w, inside[i].x, inside[i - 1], inside[i]]);
      const last = inside[inside.length - 1];
      edges.push([`the reeds at ${R(last.x)}`, last.x + last.w, z.x1, last, null]);
    } else out.push(`${name}: no reeds for the little ones to hide in`);
    for (const [from, a, b, A, B] of edges) {
      if (b <= a) continue;
      const herons = over(a, b).length;
      const pond = wet(a, b);
      const max = pond ? LINE_RULE.pond : easy ? LINE_RULE.open.easy : herons >= 2 ? LINE_RULE.open.twoHerons : LINE_RULE.open.normal;
      if (b - a > max + 1e-6) out.push(`${name}: ${R(b - a)} px of open ${pond ? 'pond' : 'mud'} from ${from}, more than the line crosses between looks (${max} px${herons >= 2 ? ', two herons' : ''})`);
      if (herons >= 2 && A && B && zones.indexOf(z) === zones.indexOf(over(a, b)[0])) {
        const w = safeWindow(row, easy, A, B, over(a, b), st.platforms, st.safeWater);
        if (w < LINE_RULE.window - 1e-6) out.push(`${name}: under two herons the longest safe time to leave the reeds at ${R(A.x)} is ${w.toFixed(1)} s, under ${LINE_RULE.window} s`);
      }
    }
  }
  // R-165.363: no face on watched mud (the child stands at it ~3 s in the open), and the calibrated child brings the line over each
  // watched stretch (its herons together) without a little one seen: flown, both settings (Easy's first looks only warn, the game's rule)
  for (const z of zones) {
    const inside = bushes.filter((b) => b.x + b.w > z.x0 && b.x < z.x1);
    for (const f of facesOn(st.platforms, z.x0, z.x1, dir)) {
      if (inside.some((b) => f >= b.x && f <= b.x + b.w) || wet(f - 2, f + 2)) continue;
      out.push(`watch ${R(z.x0)}-${R(z.x1)}: a face at ${f} on the watched mud (the child stands at it ${LINE_RULE.child.face} s in the open)`);
    }
  }
  const groups: WatchZone[][] = [];
  for (const z of [...zones].sort((a, b) => a.x0 - b.x0)) {
    const g = groups.find((q) => q.some((o) => o.x0 < z.x1 && o.x1 > z.x0));
    if (g) g.push(z);
    else groups.push([z]);
  }
  const cages = st.collectibles.filter((c) => c.type === 'cage');
  for (const g of groups) {
    const gx0 = Math.min(...g.map((z) => z.x0));
    const gx1 = Math.max(...g.map((z) => z.x1));
    // (the little ones he leads in: every cage before the stretch's approach; a cage on it joins the line as he reaches it)
    const before = (c: Collectible) => (dir === 1 ? c.x < gx0 - 400 : c.x > gx1 + 400);
    const on = (c: Collectible) => !before(c) && (dir === 1 ? c.x < gx1 : c.x > gx0);
    const n = Math.max(1, cages.filter(before).length);
    const joins = cages.filter(on).map((c) => c.x);
    const covers = bushes.filter((b) => b.x + b.w > gx0 - 400 && b.x < gx1 + 400);
    const miss = childCross(row, easy, g, covers, st.platforms, st.safeWater, n, dir, joins, (x) => wet(x - 1, x + 1));
    if (miss) out.push(`watch ${R(gx0)}-${R(gx1)}: the calibrated child (${LINE_RULE.child.pace} px/s, ${LINE_RULE.child.face} s at a face, ${n}${joins.length ? `+${joins.length}` : ''} behind him) loses a little one with him at ${miss.x} (${miss.t} s in): its open mud and the line's tail do not fit the look-free window`);
  }
  // climbs, swings, rides: the line never climbs, swings or rides; it waits at the foot and rejoins him on that ground
  for (const v of st.vines ?? []) {
    if (v.isSwingingVine || v.vineType === 'swing_liana') {
      out.push(`the swing at ${R(v.x)}: the little ones never swing (it carries him to other ground)`);
      continue;
    }
    const foot = groundUnder(st.platforms, v.x, v.bottomY);
    if (foot === null || foot - v.bottomY > 140) {
      out.push(`the climb at ${R(v.x)}: no ground at its foot for the line to wait on`);
      continue;
    }
    const off = st.platforms.find((pl) => pl.type === 'solid' && Math.abs(pl.y - foot) > 12 && pl.y >= v.topY - 40 && pl.y <= foot - 60 && pl.x <= v.x + 90 && pl.x + pl.width >= v.x - 90);
    if (off) out.push(`the climb at ${R(v.x)}: its top lets him off onto other ground (the piece at ${R(off.x)}, ${R(foot - off.y)} px up), where the line cannot follow`);
    const on = groundUnder(st.platforms, v.x + dir * row.rejoin, foot - 1);
    if (on === null || Math.abs(on - foot) > 12) out.push(`the climb at ${R(v.x)}: no ground ${row.rejoin} px on from its foot for him to come down to the line`);
  }
  for (const r of st.ropes ?? []) if (Math.abs(r.g0 - r.g1) > 12 || groundUnder(st.platforms, (r.x0 + r.x1) / 2, r.y) === null) out.push(`the rope ${R(r.x0)}-${R(r.x1)}: it carries him over a gap the line cannot cross`);
  for (const pl of st.platforms) if (pl.type === 'drift' || (pl.type === 'moving' && !pl.pad) || pl.ride) out.push(`the ride at ${R(pl.x)}: the little ones never ride`);
  // cages: each little one drops onto ground or splash-back water, before the exit
  for (const c of st.collectibles) {
    if (c.type !== 'cage') continue;
    if ((c.x - st.exitTotemX) * dir > 0) out.push(`the cage at ${R(c.x)}: past the exit, so its little one can never be brought home`);
    const g = groundUnder(st.platforms, c.x, c.y + 26);
    const w = (st.safeWater ?? []).find((q) => c.x >= q.x0 && c.x <= q.x1 && q.y >= c.y);
    const deep = (st.deepWater ?? []).find((q) => c.x >= q.x0 && c.x <= q.x1 && q.y >= c.y);
    const land = Math.min(g ?? Infinity, w?.y ?? Infinity, deep?.y ?? Infinity);
    if (land === Infinity) out.push(`the cage at ${R(c.x)}: its little one drops into nothing`);
    else if (deep && deep.y <= land) out.push(`the cage at ${R(c.x)}: its little one drops into deep water`);
  }
  // (a crossing two herons watch is reported once)
  return [...new Set(out)];
}
