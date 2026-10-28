/**
 * Easy (difficulty.ts): the same stage, made gentler after it is built. The layout and the story stay the same, so a stage on Easy is
 * still the stage the player will meet on Normal, only kinder:
 *   - a far jump over a drop gets a stepping stone, so every gap on the way is a single jump (a vine or a rope over a gap stays the
 *     way across: the swing's sweet spot is wider on Easy instead, physics.ts setTimedSwing);
 *   - about half the animals go (the first of each kind stays, so the stage still shows what it teaches), and a goal of beating
 *     animals asks for fewer to match; the snake ring drops half as many;
 *   - every flag has a heart beside it, and a long stretch with no flag gets one.
 * Boss fights, the chase along the long branch and the climbs are left as they are.
 */
import type { GeneratedStage } from './stageGenerator.ts';
import type { Collectible, Enemy, Platform } from './types.ts';
import { jumpOK, PICKUP_APART, SAFE_APPROACH, validateStage } from './levelCheck.ts';
import type { ProtoExtras } from './protoStage.ts';

/** a drop is this deep (or has no floor at all) before a far jump over it gets a stone */
const DROP = 260;
/** the stepping stone */
const STONE_W = 84;
const STONE_H = 22;
/** the longest run (px) with no flag before Easy adds one */
const FLAG_EVERY = 1800;

type Stage = GeneratedStage & { proto?: ProtoExtras };

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

/** a heart beside a flag, on the flag's own ledge and clear of everything, unless one is already close */
function heartBy(stage: Stage, cp: { x: number; y: number }, next: () => number) {
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
  // Easy keeps the stage's own lower bar (goals.ts raised Normal's to its share of what the stage holds)
  if (stage.easyGoal !== undefined) stage.config = { ...stage.config, targetCount: stage.easyGoal };

  // far jumps
  if (!climb && !chase) stage.platforms.push(...easyStones(stage));

  // fewer animals, and a beat-the-animals goal that asks for fewer
  const keep = easyKeep(stage.enemies);
  const before = stage.enemies.length;
  stage.enemies = stage.enemies.filter((e) => keep.has(e));
  if ((kind === 'purge' || kind === 'gauntlet') && before > 0) {
    const target = Math.max(1, Math.min(stage.enemies.length, Math.round(stage.config.targetCount * 0.6)));
    stage.config = { ...stage.config, targetCount: target };
  }
  for (const e of stage.enemies) e.attackCooldown = Math.max(e.attackCooldown, 0) * 1.5;
  const ring = stage.proto?.ring;
  if (ring) ring.waves = ring.waves.map((w) => w.filter((_, i) => i % 2 === 0));

  // flags, and a heart at every flag
  let cid = Math.max(0, ...stage.collectibles.map((c) => c.id)) + 1;
  const next = () => cid++;
  const cps = (stage.checkpoints ??= []);
  if (!climb && !chase) {
    const reach = new Set(validateStage(stage).reachableIds);
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
