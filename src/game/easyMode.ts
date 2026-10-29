/**
 * Easy (difficulty.ts): the same stage, made gentler after it is built. The layout and the story stay the same, so a stage on Easy is
 * still the stage the player will meet on Normal, only kinder:
 *   - a far jump over a drop gets a stepping stone, so every gap on the way is a single jump (a vine or a rope over a gap stays the
 *     way across: the swing's sweet spot is wider on Easy instead, physics.ts setTimedSwing);
 *   - about half the animals go (the first of each kind stays, so the stage still shows what it teaches), and a goal of beating
 *     animals asks for fewer to match; the snake ring drops half as many;
 *   - every flag has a heart beside it, and a long stretch with no flag gets one.
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
import { EASY_FLOOR, goalHave } from './goals.ts';
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
  const fullRes = validateStage(stage, { frozen, inspect: (g) => (full = g) });
  validateStage(stage, { frozen, hold: EASY_HOLD, inspect: (g) => (held = g) });
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
    if (room >= 0 && side !== 0 && widenable(B)) {
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
    stage.enemies = stage.enemies.filter((e) => keep.has(e));
    const ring = stage.proto?.ring;
    if (ring) ring.waves = ring.waves.map((w) => w.filter((_, i) => i % 2 === 0));
    if ((kind === 'purge' || kind === 'gauntlet') && before > 0) {
      // (the gentler fight goal, 0.6 of Easy's, and never under 60% of the animals Easy keeps: LV-6)
      const have = goalHave(stage as never) ?? 0;
      const target = Math.min(have, Math.max(Math.round(stage.config.targetCount * 0.6), Math.ceil(have * EASY_FLOOR - 1e-9)));
      stage.config = { ...stage.config, targetCount: Math.max(1, target) };
    }
    for (const e of stage.enemies) e.attackCooldown = Math.max(e.attackCooldown, 0) * 1.5;
  } else if ((kind === 'purge' || kind === 'gauntlet') && stage.enemies.length) {
    // (gen2 laid a fight's animals for its Easy bar, budget.quota.check (0.6 of the designed goal): never more is asked)
    const target = Math.max(1, Math.min(stage.config.targetCount, stage.gen2!.budget.quota.check, stage.enemies.length));
    stage.config = { ...stage.config, targetCount: target };
  }
  if (gen2) {
    const ring = stage.proto?.ring;
    if (ring) ring.waves = ring.waves.map((w) => w.filter((_, i) => i % 2 === 0));
  }
  // flags, and a heart at every flag
  let cid = Math.max(0, ...stage.collectibles.map((c) => c.id)) + 1;
  const next = () => cid++;
  const cps = (stage.checkpoints ??= []);
  if (!climb && !chase) {
    const reach = new Set(reached ?? validateStage(stage).reachableIds);
    const marks = [stage.spawnX, ...cps.map((c) => c.x), stage.exitTotemX].sort((a, b) => a - b);
    for (let i = 0; i + 1 < marks.length; i++) {
      const [x0, x1] = [marks[i], marks[i + 1]];
      if (x1 - x0 < FLAG_EVERY) continue;
      const want = (x0 + x1) / 2;
      // a wide still ledge near the middle that he can reach, with no animal close
      let best: Platform | null = null;
      for (const p of stage.platforms) {
        if (!still(p) || p.type !== 'solid' || p.width < 180 || !reach.has(p.id)) continue;
        const cx = p.x + p.width / 2;
        if (cx < x0 + 400 || cx > x1 - 400 || animalNear(stage, cx, p.y)) continue;
        if ((stage.zones ?? []).some((z) => cx > z.x0 - 40 && cx < z.x1 + 40 && p.y > z.top - 40 && p.y < z.bottom + 40)) continue;
        if (!best || Math.abs(cx - want) < Math.abs(best.x + best.width / 2 - want)) best = p;
      }
      if (best) cps.push({ x: Math.round(best.x + best.width / 2), y: best.y, reached: false });
    }
    cps.sort((a, b) => a.x - b.x);
  }
  for (const cp of cps) heartBy(stage, cp, next);
  return stage;
}
