/**
 * Easy (difficulty.ts): the same stage, made gentler after it is built. The layout and the story stay the same, so a stage on Easy is
 * still the stage the player will meet on Normal, only kinder:
 *   - a far jump over a drop gets a stepping stone, so every gap on the way is a single jump (a vine or a rope over a gap stays the
 *     way across: the swing's sweet spot is wider on Easy instead, physics.ts setTimedSwing);
 *   - about half the animals go (the first of each kind stays, so the stage still shows what it teaches), and a goal of beating
 *     animals asks for fewer to match; the snake ring drops half as many;
 *   - every flag has a heart beside it, and a long stretch with no flag gets one;
 *   - the rivers' drifting logs run slower (EASY_DRIFT), and land a hop that comes down on a log's end (river.ts DRIFT_CATCH); the bank
 *     across a hop over still water reaches a little toward him (EASY_WATER_LAND).
 * Boss fights, the chase along the long branch and the climbs are left as they are.
 *
 * The new generator's stages (gen2/game.ts) are built for Easy by the pipeline itself (gen2/DESIGN.md B1, B4): its jumps are sized from
 * Easy's margin with wider landings and soft pits, its animals are already Easy's share with the longer tell, and it lays a gauntlet's
 * animals for Easy's lower bar (budget.quota.check, which caps the goal here). So for them this leaves out the stones, the animal cut
 * and the longer tell (nothing is softened twice), and keeps what gen2 does not do: Easy's goal (`easyGoal`), the 70%-hold check, the flags and a heart at every flag.
 */
import type { GeneratedStage } from './stageGenerator.ts';
import type { Collectible, Enemy, Platform } from './types.ts';
import { doubleAllowed, heldMaxGap, jumpOK, PICKUP_APART, SAFE_APPROACH, validateStage, type CheckGraph } from './levelCheck.ts';
import { EASY_HOLD } from './physics.ts';
import { easyGoalFor, goalHave } from './goals.ts';
import { floorWater } from './waterTeach.ts';
import { CLUMP_GAP, isPetal } from './petals.ts';
import type { ProtoExtras } from './protoStage.ts';

/** a drop is this deep (or has no floor at all) before a far jump over it gets a stone */
const DROP = 260;
/** the stepping stone */
const STONE_W = 84;
const STONE_H = 22;
/** the longest run (px) with no flag before Easy adds one */
const FLAG_EVERY = 1800;

type Stage = GeneratedStage & { proto?: ProtoExtras; gen2?: { budget: { difficulty: string; quota: { check: number } } } };

const still = (p: Platform) => !p.broken && p.type !== 'drift' && p.type !== 'moving' && !p.chase && !p.push;

function overlaps(a: { x: number; y: number; width: number; height: number }, b: Platform, pad: number) {
  return a.x < b.x + b.width + pad && a.x + a.width + pad > b.x && a.y < b.y + b.height + pad && a.y + a.height + pad > b.y;
}

/** the stones Easy lays over the far jumps */
export function easyStones(stage: Stage): Platform[] {
  const plats = stage.platforms;
  const statics = plats.filter(still);
  const vineXs = stage.vines.filter((v) => v.isSwingingVine || v.vineType === 'swing_liana').map((v) => v.x);
  const ropes = stage.ropes ?? [];
  const rivers = stage.rivers ?? [];
  let id = Math.max(0, ...plats.map((p) => p.id)) + 1;
  const out: Platform[] = [];
  for (const a of statics) {
    const ax1 = a.x + a.width;
    // the nearest ledge ahead at about the same height
    let b: Platform | null = null;
    for (const c of statics) {
      if (c === a || c.x <= ax1 || c.y < a.y - 150 || c.y > a.y + 200) continue;
      if (!b || c.x < b.x) b = c;
    }
    if (!b) continue;
    const gap = b.x - ax1;
    if (gap < 40 || !jumpOK(a, b, true).ok || jumpOK(a, b, false).ok) continue;
    // already a single-jump way across (another ledge, a log, a moving platform), or a vine or a rope to cross by
    if (plats.some((c) => c !== a && c !== b && !c.broken && jumpOK(a, c, false).ok && jumpOK(c, b, false).ok)) continue;
    if (vineXs.some((x) => x > ax1 - 60 && x < b!.x + 60)) continue;
    if (ropes.some((r) => r.x0 < b!.x && r.x1 > ax1)) continue;
    if (rivers.some((r) => r.x0 < b!.x && r.x1 > ax1)) continue;
    // only where missing it costs something: no floor close under the gap
    const floorTop = Math.max(a.y, b.y);
    const mid = ax1 + gap / 2;
    if (plats.some((c) => c !== a && c !== b && c.x < mid + 40 && c.x + c.width > mid - 40 && c.y > floorTop && c.y < floorTop + DROP)) continue;
    // a stone each jump can reach, clear of everything else
    const tries = [Math.round((a.y + b.y) / 2), Math.max(a.y, b.y), Math.min(a.y, b.y)];
    for (const y of tries) {
      const s: Platform = { id, x: Math.round(mid - STONE_W / 2), y, width: STONE_W, height: STONE_H, type: 'solid', style: a.style ?? b.style };
      if (!jumpOK(a, s, false).ok || !jumpOK(s, b, false).ok) continue;
      if (plats.some((c) => overlaps(s, c, 24)) || out.some((c) => overlaps(s, c, 24))) continue;
      // not tucked under a ledge (a cellar or the ground's underside): a stone there is out of sight and in the way
      if ([...plats, ...out].some((c) => c.x < s.x + s.width + 20 && c.x + c.width > s.x - 20 && c.y < s.y + 80 && c.y > s.y - 170)) continue;
      out.push(s);
      id++;
      break;
    }
  }
  return out;
}

/** a step Easy adds in front of a ledge too high for a ~70% hold (px wide), and a catch ledge's width */
const STEP_W = 72;
const CATCH_W = 90;
interface HoldOut {
  frozen?: ReadonlySet<number>;
  reach?: readonly number[];
}

/**
 * Easy never needs a full-hold jump (Gemini G8, STAGE-RULES §1b: soften the jump, don't remove it). The level check walks the stage
 * twice, with the full jump and with a ~70% hold (levelCheck.ts); every ledge the first reaches and the second does not is softened
 * where it is, from the place he jumps for it: a gap gets a wider landing (the ledge reaches toward him), and a rise too high for the
 * held jump gets a step halfway up in front of it (or, across a gap or onto a ledge over his head, a catch ledge halfway). The jump is
 * still there; only its margin is Easy's. `frozen`: boulders left where they stand; `out.frozen` (walked with none frozen): the
 * boulders the full jump's walk rolls into a fall's slot and the held one's does not, to walk again with those left where they stand
 * (see easyStage), and `out.reach` what the full jump reaches before any softening. Returns how many were softened.
 */
export function easyHoldSoften(stage: Stage, frozen?: ReadonlySet<number>, out?: HoldOut): number {
  const allowDbl = doubleAllowed(stage.config);
  let full: CheckGraph | null = null;
  let held: CheckGraph | null = null;
  // (the reach only: a stage's rooms are walked solved, not solved again, levelCheck CheckOptions.rooms)
  const fullRes = validateStage(stage, { frozen, inspect: (g) => (full = g), rooms: false });
  validateStage(stage, { frozen, hold: EASY_HOLD, inspect: (g) => (held = g), rooms: false });
  const F = full as CheckGraph | null;
  const H = held as CheckGraph | null;
  if (!F || !H) return 0;
  if (out && !frozen) {
    const rolled = stage.platforms.filter((b) => b.push && H.boulderX(b.id) === b.x && F.boulderX(b.id) !== b.x).map((b) => b.id);
    out.frozen = rolled.length ? new Set(rolled) : undefined;
    out.reach = fullRes.reachableIds;
  }
  // where he can stand: everywhere the full jump gets him (so a run of jumps is softened in one go, not one a pass), and the pieces
  // of ground the held walk reached at their own size (it splits a ground around a fall that still pours)
  const fullIds = new Set(F.plats.filter((p) => F.seen.has(F.key(p))).map((p) => p.id));
  const heldPieces = H.plats.filter((p) => H.seen.has(H.key(p)));
  const heldIds = new Set(heldPieces.map((p) => p.id));
  const heldSet = new Set(heldPieces);
  const at = [...stage.platforms.filter((p) => fullIds.has(p.id)), ...heldPieces];
  // (a ledge Easy may widen: plain ground, not a pushed log, a painted piece or a pad)
  const widenable = (p: Platform) => (p.type === 'solid' || p.type === 'fragile') && !p.push && !p.art && !p.lily && !p.crown;
  let id = Math.max(0, ...stage.platforms.map((p) => p.id)) + 1;
  const rivers = stage.rivers ?? [];
  let n = 0;
  for (const B of [...stage.platforms]) {
    if (B.broken || heldIds.has(B.id) || !fullIds.has(B.id) || B.type === 'drift' || B.type === 'moving' || B.push) continue;
    // the place he jumps for it from, where the full jump reaches it and the held one does not
    let best: { A: Platform; gap: number; side: 1 | -1 | 0; room: number; rank: number } | null = null;
    for (const A of at) {
      if (A.id === B.id || A.type === 'drift' || A.type === 'moving' || A.type === 'bouncy' || A.y - B.y > 320 || B.y - A.y > 400) continue;
      const side: 1 | -1 | 0 = B.x >= A.x + A.width - 2 ? 1 : B.x + B.width <= A.x + 2 ? -1 : 0;
      const gap = side === 1 ? B.x - (A.x + A.width) : side === -1 ? A.x - (B.x + B.width) : 0;
      if (gap > 460 || !jumpOK(A, B, allowDbl).ok) continue;
      const room = heldMaxGap(A, B, allowDbl);
      const fromHeld = heldSet.has(A);
      // (from a place the held walk gets him, the held jump reaches it: it needs nothing)
      if (room >= Math.max(0, gap) && fromHeld) {
        best = null;
        break;
      }
      if (room >= Math.max(0, gap)) continue;
      // (soften toward where he comes from: a place the held walk gets him first, else the side toward the stage's start)
      const rank = (fromHeld ? 0 : 10000) + (side === -1 ? 5000 : 0) + gap;
      if (!best || rank < best.rank) best = { A, gap: Math.max(0, gap), side, room, rank };
    }
    if (!best) continue;
    const { A, gap, side, room } = best;
    const others = stage.platforms.filter((q) => q !== B && q.id !== A.id && !q.broken);
    // (never the edge of a bank where a river begins or ends: it grew out over the water, the bank no longer stood where the water stops,
    // and the river check failed on 110 of 200 control-test rolls on Easy, 2026-10-29; a catch ledge below does the job instead)
    const riverEdge = side === 1 ? rivers.some((r) => Math.abs(B.x - r.x1) <= 2) : side === -1 ? rivers.some((r) => Math.abs(B.x + B.width - r.x0) <= 2) : false;
    if (room >= 0 && side !== 0 && widenable(B) && !riverEdge) {
      // a wider landing: the ledge reaches toward him, as far as the held jump needs (and never past the gap)
      const d = Math.min(Math.max(0, gap - 4), Math.ceil(gap - room) + 6);
      // (the strip it grows by must be clear: nothing standing up through its top there)
      const s0 = side === 1 ? B.x - d : B.x + B.width;
      const clash = others.some((q) => q.x < s0 + d && q.x + q.width > s0 && q.y < B.y && q.y + q.height > B.y + 4);
      if (d > 0 && !clash) {
        if (side === 1) B.x -= d;
        B.width += d;
        n++;
        continue;
      }
    }
    const rise = A.y - B.y;
    if (rise <= 0) continue;
    const top = Math.round(A.y - rise / 2);
    let add: Platform;
    if (side !== 0 && gap <= 12) {
      // a step halfway up, on his ground in front of the face
      const sx = side === 1 ? B.x - STEP_W : B.x + B.width;
      add = { id, x: Math.round(sx), y: top, width: STEP_W, height: A.y - top + 10, type: 'solid', style: 'moss_stone' };
      if (others.some((q) => q !== A && overlaps(add, q, -2) && q.y < A.y - 2)) continue;
    } else {
      // a catch ledge halfway up: halfway across a gap, or beside a ledge over his head (on the side he comes from)
      const cx = side === 1 ? A.x + A.width + gap / 2 : side === -1 ? B.x + B.width + gap / 2 : B.x - CATCH_W / 2 - 10;
      add = { id, x: Math.round(cx - CATCH_W / 2), y: top, width: CATCH_W, height: 24, type: 'solid', style: 'branch' };
      if (others.some((q) => q !== A && overlaps(add, q, 6))) {
        if (side !== 0) continue;
        add.x = Math.round(B.x + B.width + 10);
        if (others.some((q) => q !== A && overlaps(add, q, 6))) continue;
      }
    }
    id++;
    stage.platforms.push(add);
    n++;
  }
  return n;
}

/** which animals stay on Easy: the first of each kind, then every other one */
export function easyKeep(enemies: Enemy[]): Set<Enemy> {
  const keep = new Set<Enemy>();
  const seen = new Map<string, number>();
  for (const e of [...enemies].sort((a, b) => a.x - b.x)) {
    const n = seen.get(e.type) ?? 0;
    seen.set(e.type, n + 1);
    if (n === 0 || n % 2 === 0) keep.add(e);
  }
  return keep;
}

/** the ledge a flag stands on */
const under = (stage: Stage, cp: { x: number; y: number }) =>
  stage.platforms.find((p) => cp.x >= p.x && cp.x <= p.x + p.width && Math.abs(p.y - cp.y) < 6);

/** the validator's rule for a safe spot (levelCheck.ts): no animal close by at about the same height */
const animalNear = (stage: Stage, x: number, y: number) =>
  stage.enemies.some((e) => {
    if (Math.abs(e.y - y) >= 400) return false;
    const d = e.type === 'eagle' ? Math.abs(e.x - x) : Math.min(Math.abs(e.x - x), x < e.patrolMinX ? e.patrolMinX - x : x > e.patrolMaxX ? x - e.patrolMaxX : 0);
    return d < (e.type === 'eagle' ? 300 : SAFE_APPROACH) + 20;
  });

/** a heart beside a flag, on the flag's own ledge and clear of everything, unless one is already close (also gen2's Normal hearts) */
export function heartBy(stage: Stage, cp: { x: number; y: number }, next: () => number) {
  if (stage.collectibles.some((c) => (c.type === 'heart' || c.type === 'super_heart') && Math.abs(c.x - cp.x) < 260 && Math.abs(c.y - cp.y) < 260)) return;
  const p = under(stage, cp);
  if (!p) return;
  // on the ledge beside the flag, or a little hop above it when a row of pickups already runs along the ledge
  for (const y of [p.y - 34, p.y - 90]) {
    for (const dx of [70, -70, 120, -120, 40, -40, 160, -160, 20, -20, 0]) {
      const x = cp.x + dx;
      if (x < p.x + 18 || x > p.x + p.width - 18) continue;
      if (stage.platforms.some((q) => x > q.x - 14 && x < q.x + q.width + 14 && y > q.y - 14 && y < q.y + q.height + 14)) continue;
      if (stage.collectibles.some((c) => Math.hypot(c.x - x, c.y - y) < PICKUP_APART + 8)) continue;
      stage.collectibles.push({ id: next(), type: 'heart', x, y, collected: false, bobPhase: (x % 97) / 15 } as Collectible);
      return;
    }
  }
}

/** a flag's ledge: a wide still solid ledge he can reach, with no animal close and out of the spore and wind zones (Easy's and LV-9's) */
function flagLedge(stage: Stage, p: Platform, reach: ReadonlySet<number>, x = p.x + p.width / 2): boolean {
  if (!still(p) || p.type !== 'solid' || p.width < 180 || !reach.has(p.id)) return false;
  return flagSpot(stage, x, p.y);
}
/** no animal close to a flag at (x, y), and out of the zones */
/** a flag's respawn needs a run-up to the water ahead (LV-9, 2026-10-29: a flag 134 px short of 2-5's log river put Easy's first-timer
 *  back in the water again and again, and it beat fewer snappers before the shrine than with no flag there) */
export const FLAG_WATER_RUNUP = 320;
/** (a river stage with no ledge that far from the water takes the best it has, at least this much) */
export const FLAG_WATER_RUNUP_MIN = 200;
const clearOfWater = (stage: Stage, x: number, runup = FLAG_WATER_RUNUP) => !(stage.rivers ?? []).some((r) => x > r.x0 - runup && x < r.x1 + 40);
const flagSpot = (stage: Stage, x: number, y: number) =>
  !animalNear(stage, x, y) && !(stage.zones ?? []).some((z) => x > z.x0 - 40 && x < z.x1 + 40 && y > z.top - 40 && y < z.bottom + 40);

/** the most px between flags on Normal, the start and the shrine counted (LV-9, polish report 2026-10-29: hand-built stages ran to 7-14k) */
export const FLAG_SPAN_MAX = 4000;

/**
 * LV-9: no more than FLAG_SPAN_MAX px between flags on a hand-built stage that runs across (not a climb or a chase). Where a stretch is
 * longer, a flag goes on the safe flat nearest the even split, and again until every stretch is short enough or no flat is left in it.
 * Changes the stage's flags and returns how many it added.
 */
export function capFlagSpans(stage: Stage, max = FLAG_SPAN_MAX, reached?: readonly number[]): number {
  const kind = stage.config.objectiveType;
  if (kind === 'ascent' || kind === 'boss_lair' || stage.boss) return 0;
  // (a chase's branch is whole again at every restart from a flag, chase.ts restartAt: it may hold one)
  const chase = !!stage.proto?.chase;
  const cps = (stage.checkpoints ??= []);
  const marks = () => [stage.spawnX, ...cps.map((c) => c.x), stage.exitTotemX].sort((a, b) => a - b);
  let m = marks();
  if (m.every((x, i) => i === 0 || x - m[i - 1] <= max)) return 0;
  // (reached with the double jump: the early World 1 stages teach it now, hint.1-1.double, while the validator still keeps it from
  // them, levelCheck.ts doubleAllowed, and 1-1 read as unfinishable past its first double-jump wall)
  const reach = new Set(reached ?? validateStage({ ...stage, config: { ...stage.config, miniIndex: Math.max(stage.config.miniIndex, 6) } }, { rooms: false }).reachableIds);
  // (and past where the check stops, the trail's own banks: the check never follows a swing from vine to vine, so a liana chain reads
  // as the end of the stage, STAGE-RULES §6. A bank at the trail's ground level, or a knee on it, never a pit floor or a plank above)
  const byY = new Map<number, number>();
  for (const p of stage.platforms) if (p.height >= 60 && still(p)) byY.set(p.y, (byY.get(p.y) ?? 0) + p.width);
  const trail = [...byY].sort((a, b) => b[1] - a[1])[0]?.[0];
  let frontier = -Infinity;
  for (const p of stage.platforms) if (reach.has(p.id)) frontier = Math.max(frontier, p.x + p.width);
  if (trail !== undefined) for (const p of stage.platforms) if (p.x > frontier && p.y <= trail && p.y >= trail - 25 && p.height >= 60) reach.add(p.id);
  // (World 2's islands are banks of three short pieces, 110-180 px each: a piece of 140 holds a flag)
  const ledges = stage.platforms.filter((p) => (still(p) || (chase && p.chase && !p.broken)) && p.type === 'solid' && p.width >= 140 && reach.has(p.id));
  let added = 0;
  for (let guard = 0; guard < 40; guard++) {
    m = marks();
    let done = true;
    for (let i = 0; i + 1 < m.length; i++) {
      const [x0, x1] = [m[i], m[i + 1]];
      if (x1 - x0 <= max) continue;
      // the even split for the flags this stretch needs; the first of them
      const want = x0 + (x1 - x0) / Math.ceil((x1 - x0) / max);
      let best: Platform | null = null;
      let bestX = 0;
      // (clear of the water by a full run-up if any ledge is; a river stage with none takes the best it has)
      for (const runup of [FLAG_WATER_RUNUP, FLAG_WATER_RUNUP_MIN]) {
        if (best) break;
        for (const p of ledges) {
          // (the spot on the ledge nearest the split, 60 px in from its ends, with no animal close: a long bank can hold a patrol at
          // one end and a safe flag at the other)
          const a = Math.max(p.x + 60, x0 + 400);
          const b = Math.min(p.x + p.width - 60, x1 - 400, x0 + max);
          if (a > b) continue;
          const c = Math.max(a, Math.min(b, want));
          for (let d = 0; d <= b - a; d += 40) {
            const x = [c - d, c + d].find((q) => q >= a && q <= b && flagSpot(stage, q, p.y) && clearOfWater(stage, q, runup));
            if (x === undefined) continue;
            if (!best || Math.abs(x - want) < Math.abs(bestX - want)) {
              best = p;
              bestX = x;
            }
            break;
          }
        }
      }
      if (!best) continue;
      cps.push({ x: Math.round(bestX), y: best.y, reached: false });
      added++;
      done = false;
      break;
    }
    if (done) break;
  }
  cps.sort((a, b) => a.x - b.x);
  return added;
}

/**
 * How fast Easy's rivers run against Normal's (LV-5, polish report 2026-10-29: the kid bot drowned 84-114 times in 2-1 on Easy against
 * 74-87 for the adult on Normal, nearly all hopping onto drifting logs; a slower log is a longer window to hop on and off it).
 */
export const EASY_DRIFT = 0.7;

/** Easy's drifting logs: slow motion (the same spacing), and their rivers' streaks */
export function easyDrift(stage: Stage, k = EASY_DRIFT): void {
  for (const p of stage.platforms) {
    if (p.type !== 'drift' || !p.drift) continue;
    p.drift = { ...p.drift, speed: p.drift.speed * k, offset: p.drift.offset / k };
  }
  for (const r of stage.rivers ?? []) r.speed *= k;
}

/** how far the far bank of a hop over still water reaches toward him on Easy (px), and the least gap it leaves (still a jump) */
export const EASY_WATER_LAND = 24;
// (the least gap left: 40, still a jump; the stage's first water, the one Dot warns of, stays wide enough to see as water: 64, qaW123.test.ts)
const WATER_GAP_MIN = 40;
const FIRST_WATER_MIN = 64;

/**
 * Easy's landings over still water (LV-5, polish report 2026-10-29: the kid bot drowned more on Easy than the adult on Normal in 2-3,
 * 2-7, 2-9, 3-7 and 5-6): the ledge across each floor-level water gap reaches EASY_WATER_LAND px toward him, where it is plain ground or
 * a stone (not a pad, a log, a painted piece) and the strip it grows by is clear. Rivers with drifting logs are slowed instead (easyDrift).
 */
export function easyWaterLandings(stage: Stage): number {
  const waterY = stage.waterY;
  if (waterY === undefined) return 0;
  const floorY = stage.spawnY ?? 580;
  const floor = stage.platforms.filter((p) => !p.broken && p.type !== 'drift' && p.type !== 'moving' && !p.chase && (p.y >= floorY - 160 || p.y + p.height >= floorY - 10) && p.y < waterY);
  const rivers = stage.rivers ?? [];
  // (never a ledge a puzzle room's pieces stand on: they sit at a share along it, and widening it would move them, STAGE-RULES §6)
  const anchored = new Set<number>();
  JSON.stringify(stage.kit ?? null, (k, v) => {
    if ((k === 'on' && typeof v === 'number') || (k === 'ground' && Array.isArray(v))) (Array.isArray(v) ? v : [v]).forEach((i) => anchored.add(i));
    return v;
  });
  // (the stage's first water, the one Dot warns of: waterTeach.ts)
  const first = floorWater(stage)[0];
  const firstWater = (B: Platform) => !!first && !first.river && Math.abs(B.x - first.x1) <= 2;
  let n = 0;
  for (const B of floor) {
    if (B.type !== 'solid' || B.push || B.art || B.lily || B.crown || anchored.has(B.id)) continue;
    // (nor a rope's ledge: a rope joins two ledges at their ends)
    if ((stage.ropes ?? []).some((r) => Math.abs(r.x0 - B.x) < 60 || Math.abs(r.x1 - B.x) < 60)) continue;
    // the ledge he hops from: the nearest floor piece ending before B, over water (no other floor under the gap)
    let A: Platform | null = null;
    for (const q of floor) if (q !== B && q.x + q.width <= B.x + 1 && (!A || q.x + q.width > A.x + A.width)) A = q;
    if (!A) continue;
    const gap = B.x - (A.x + A.width);
    if (gap < WATER_GAP_MIN + 4 || gap > 320) continue;
    if (rivers.some((r) => r.x0 < B.x && r.x1 > A!.x + A!.width)) continue;
    if (floor.some((q) => q !== A && q !== B && q.x < B.x && q.x + q.width > A!.x + A!.width)) continue;
    const d = Math.min(EASY_WATER_LAND, gap - (firstWater(B) ? FIRST_WATER_MIN : WATER_GAP_MIN));
    if (d <= 0) continue;
    const s0 = B.x - d;
    if (stage.platforms.some((q) => q !== B && q.x < B.x && q.x + q.width > s0 && q.y < B.y + 4 && q.y + q.height > B.y - 120)) continue;
    B.x -= d;
    B.width += d;
    n++;
  }
  return n;
}

/** Easy's version of a built stage (the stage passed in is changed and returned) */
export function easyStage(stage: Stage): Stage {
  const kind = stage.config.objectiveType;
  if (kind === 'boss_lair' || stage.boss) return stage;
  const climb = kind === 'ascent';
  const chase = !!stage.proto?.chase;
  // (a gen2 stage is Easy's already, from the pipeline: generateStage(config, 'easy'); its Normal build cannot be made Easy here)
  const gen2 = !!stage.gen2;
  if (gen2 && stage.gen2!.budget.difficulty !== 'easy') throw new Error(`easyStage: ${stage.config.id} is a gen2 stage built for Normal; build it with generateStage(config, 'easy')`);
  // Easy keeps the stage's own lower bar (goals.ts raised Normal's to its share of what the stage holds)
  if (stage.easyGoal !== undefined) stage.config = { ...stage.config, targetCount: stage.easyGoal };
  // (the pieces Easy adds from here on: stones, steps and catch ledges, numbered after the stage's own)
  const firstAdded = Math.max(0, ...stage.platforms.map((p) => p.id)) + 1;

  // (World 2's lily pads 40 px wider on Easy, QA 2026-10-29: a kid's hop that came down past a pad's middle ran on off its far end; the
  // gaps between them shrink to match, and Easy's other ledge widening leaves pads alone)
  // (and its creek stones and reed islands, 2026-10-29, the moss stones standing up out of still water: 30 px wider)
  // (never one that is a river's bank, a reed island or the landing step at the foot of a bank: the river keeps its banks where it ends)
  const bankOf = (p: Platform) => (stage.rivers ?? []).some((r) => Math.abs(p.x - r.x1) <= 2 || Math.abs(p.x + p.width - r.x0) <= 2);
  const creek = (p: Platform) => stage.config.worldIndex === 2 && p.style === 'moss_stone' && p.height === 110 && p.type === 'solid' && !bankOf(p);
  for (const p of stage.platforms) {
    const d = p.lily ? 20 : creek(p) ? 15 : 0;
    if (!d) continue;
    p.x -= d;
    p.width += 2 * d;
  }
  // the rivers run slower (LV-5): every drifting log in slow motion, its spacing kept (speed x EASY_DRIFT, its phase / EASY_DRIFT, so
  // where it is at time t is where Normal's is at EASY_DRIFT x t), and the streaks with it
  if (!gen2) easyDrift(stage);
  // and every hop over still water lands on a wider bank (LV-5; gen2's EASY_LANDING, halved: the jump stays a jump)
  if (!gen2 && !climb && !chase && stage.config.worldIndex <= 5) easyWaterLandings(stage);
  // far jumps
  if (!climb && !chase && !gen2) stage.platforms.push(...easyStones(stage));
  // and no jump that needs a full hold (a hand-built stage; again while it softens something, as one jump can open the way to the
  // next). A boulder only the full jump's walk rolls is also left where it stands: the way up behind it is walked while its fall still
  // pours (4-3), and only the full jump reached it
  // (when the last pass changed nothing, its walk with the full jump is the stage's, for the flags below)
  let reached: readonly number[] | undefined;
  if (stage.proto) {
    for (let i = 0; i < 3; i++) {
      const out: HoldOut = {};
      let n = easyHoldSoften(stage, undefined, out);
      if (out.frozen) n += easyHoldSoften(stage, out.frozen);
      if (!n) {
        reached = out.reach;
        break;
      }
    }
  }

  // fewer animals, and a beat-the-animals goal that asks for fewer (gen2 laid Easy's share already, with the longer tell)
  if (!gen2) {
    const keep = easyKeep(stage.enemies);
    const before = goalHave(stage as never) ?? 0;
    const enemiesBefore = stage.enemies.length;
    stage.enemies = stage.enemies.filter((e) => keep.has(e));
    const ring = stage.proto?.ring;
    if (ring) ring.waves = ring.waves.map((w) => w.filter((_, i) => i % 2 === 0));
    if ((kind === 'purge' || kind === 'gauntlet') && before > 0) {
      // (LV-6: Normal's goal scaled to the animals Easy keeps, then Easy's share of that (65%), never under the goal this fight had
      // before (0.6 of the old Easy goal). Not a share of Easy's goal for the whole stage: that asked 2-5's kids for 16 of the 21
      // snappers Easy keeps)
      const have = goalHave(stage as never) ?? 0;
      const normal = stage.normalGoal ?? stage.config.targetCount;
      // (today's: 0.6 of the old Easy goal when the stage had animals to cut; a fight of guards only, 4-9, kept the old goal whole)
      const old = stage.easyToday ?? stage.config.targetCount;
      const today = enemiesBefore > 0 ? Math.max(1, Math.min(stage.enemies.length, Math.round(old * 0.6))) : old;
      const target = Math.min(have, easyGoalFor(Math.round((normal * have) / before), today));
      stage.config = { ...stage.config, targetCount: Math.max(1, target) };
    }
    for (const e of stage.enemies) e.attackCooldown = Math.max(e.attackCooldown, 0) * 1.5;
  } else if ((kind === 'purge' || kind === 'gauntlet') && stage.enemies.length) {
    // (Easy's goal as goals.ts gen2EasyGoal set it: 65% of the animals it holds, capped at what the kid bot reaches, LV-24; else gen2's
    // own Easy bar, budget.quota.check)
    const target = stage.easyGoal ?? Math.max(1, Math.min(stage.config.targetCount, stage.gen2!.budget.quota.check, stage.enemies.length));
    stage.config = { ...stage.config, targetCount: target };
  }
  if (gen2) {
    const ring = stage.proto?.ring;
    if (ring) ring.waves = ring.waves.map((w) => w.filter((_, i) => i % 2 === 0));
  }

  // a pickup a piece Easy added now stands in sits on its top instead (a step built over a flower, 2026-10-29: 'flower inside platform')
  const lifted = new Set<Collectible>();
  for (const c of stage.collectibles) {
    const q = stage.platforms.find((p) => p.id >= firstAdded && c.x >= p.x && c.x <= p.x + p.width && c.y > p.y + 2 && c.y < p.y + p.height - 2);
    if (q) {
      c.y = q.y - 34;
      lifted.add(c);
    }
  }
  // (a petal lifted onto another's spot goes: no clumps, petals.ts)
  if (lifted.size) {
    const petals = stage.collectibles.filter((c) => isPetal(c, stage));
    const gone = new Set([...lifted].filter((l) => isPetal(l, stage) && petals.some((c) => c !== l && Math.hypot(c.x - l.x, c.y - l.y) < CLUMP_GAP)));
    if (gone.size) stage.collectibles = stage.collectibles.filter((c) => !gone.has(c));
  }

  // flags, and a heart at every flag
  let cid = Math.max(0, ...stage.collectibles.map((c) => c.id)) + 1;
  const next = () => cid++;
  const cps = (stage.checkpoints ??= []);
  if (!climb && !chase) {
    const reach = new Set(reached ?? validateStage(stage, { rooms: false }).reachableIds);
    const marks = [stage.spawnX, ...cps.map((c) => c.x), stage.exitTotemX].sort((a, b) => a - b);
    for (let i = 0; i + 1 < marks.length; i++) {
      const [x0, x1] = [marks[i], marks[i + 1]];
      if (x1 - x0 < FLAG_EVERY) continue;
      const want = (x0 + x1) / 2;
      // a wide still ledge near the middle that he can reach, with no animal close
      let best: Platform | null = null;
      for (const p of stage.platforms) {
        if (!flagLedge(stage, p, reach)) continue;
        const cx = p.x + p.width / 2;
        if (cx < x0 + 400 || cx > x1 - 400) continue;
        if (!best || Math.abs(cx - want) < Math.abs(best.x + best.width / 2 - want)) best = p;
      }
      if (best) cps.push({ x: Math.round(best.x + best.width / 2), y: best.y, reached: false });
    }
    cps.sort((a, b) => a.x - b.x);
  }
  // (no hearts on Meeca's stage: nothing there hurts her, and a heart is only picked up when hurt, so Easy's hearts by the flags just
  // sat there, QA 2026-10-31 "not picked up")
  if (!(stage as Stage & { proto?: { meeca?: unknown } }).proto?.meeca) for (const cp of cps) heartBy(stage, cp, next);
  return stage;
}
