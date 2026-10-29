/**
 * normalRamp — Normal's climb from World 3 on (LV-2, polish report 2026-10-29; Matt approved Proposal 1 on 2026-10-29, "Yes, W4+W5
 * first"). Normal's difficulty bands went flat and then backwards: Worlds 3, 4 and 5 sat at or under World 2 (tools/inspect bands.ts,
 * BAND_GATE). A pass over a hand-built stage as it is built for Normal (stageGenerator.ts generateStage; Easy never gets it):
 *   a. chosen gaps wider: each single jump the level check finds whose gap is under the world's share of a jump's reach (GAP_SHARE)
 *      moves its landing's near edge back toward that share (every other one, the landing kept 160 px or more), never at the stage's
 *      first water or its first jump of all, never a puzzle room's ledge, a painted or pushed piece, or a ledge with dressing at that edge;
 *   b. half the hearts away from the flags go (every other one, in order along the stage); the hearts at flags stay;
 *   c. a quarter more of the stage's own ground animals, on long flats past the first of their kind, JUMP_CLEAR (120 px) from every
 *      take-off and landing and 200 px from every flag.
 * The level check walks the stage after: anything that loses a place he could reach before is put back (halves, then one by one).
 * Worlds in RAMP_WORLDS only; the set pieces (4-3 Waterfall Steps, 4-7 The Long Drop) keep their shape.
 */
import type { GeneratedStage } from './stageGenerator.ts';
import type { Enemy, Platform } from './types.ts';
import { reachJump } from './physics.ts';
import { validateStage } from './levelCheck.ts';
import { JUMP_CLEAR, jumpEdges } from './stageMetrics.ts';
import { floorWater } from './waterTeach.ts';
import type { ProtoExtras } from './protoStage.ts';

/** the worlds the pass runs in (Matt: World 4 and 5 first; World 3 once they are measured) */
export const RAMP_WORLDS: ReadonlySet<number> = new Set([4, 5]);
/** the share of a single jump's reach a chosen gap is widened to, by world */
export const GAP_SHARE: Record<number, number> = { 3: 0.7, 4: 0.78, 5: 0.82 };
/** the most a gap is widened (px), and the least a landing keeps */
const GAP_MAX = 70;
const LAND_MIN = 160;
/** a heart this close to a flag is the flag's (px) */
const FLAG_HEART = 160;
/** the set pieces that keep their shape */
const SET_PIECES: ReadonlySet<string> = new Set(['4-3', '4-7']);

type Stage = GeneratedStage & { proto?: ProtoExtras };

/** every x of the stage's dressing and pieces (anything in the hand-built extras with an x), to keep a widened edge clear of them */
function dressingXs(stage: Stage): Array<{ x: number; y: number }> {
  const out: Array<{ x: number; y: number }> = [];
  const walk = (v: unknown, depth: number) => {
    if (depth > 3 || !v || typeof v !== 'object') return;
    if (Array.isArray(v)) {
      for (const i of v) walk(i, depth + 1);
      return;
    }
    const o = v as Record<string, unknown>;
    if (typeof o.x === 'number' && (typeof o.y === 'number' || typeof o.b === 'number')) out.push({ x: o.x, y: (o.y ?? o.b) as number });
    else for (const k of Object.keys(o)) if (k !== 'hints' && k !== 'beats') walk(o[k], depth + 1);
  };
  walk(stage.proto, 0);
  return out;
}

/** platforms a puzzle room's pieces stand on (they sit at a share along them: STAGE-RULES §6) */
function anchoredIds(stage: Stage): Set<number> {
  const ids = new Set<number>();
  JSON.stringify(stage.kit ?? null, (k, v) => {
    if ((k === 'on' && typeof v === 'number') || (k === 'ground' && Array.isArray(v))) (Array.isArray(v) ? v : [v]).forEach((i) => ids.add(i));
    return v;
  });
  return ids;
}

type Undo = () => void;

/** a. the chosen gaps, widened; returns how to put each back */
function widenGaps(stage: Stage, share: number): Undo[] {
  const undo: Undo[] = [];
  const anchored = anchoredIds(stage);
  const dressing = dressingXs(stage);
  const first = floorWater(stage)[0];
  const edges = jumpEdges(stage).filter((j) => j.dir === 1).sort((a, b) => a.takeoffX - b.takeoffX);
  const plain = (p: Platform) => p.type === 'solid' && !p.push && !p.art && !p.lily && !p.crown && !p.chase && !anchored.has(p.id);
  let pick = 0;
  for (let i = 1; i < edges.length; i++) {
    const j = edges[i];
    const B = j.to;
    if (!plain(B) || !plain(j.from) || B.width - LAND_MIN < 20) continue;
    // (never the stage's first water, the one Dot warns of)
    if (first && j.takeoffX >= first.x0 - 4 && j.takeoffX <= first.x1 + 4) continue;
    const dy = j.from.y - B.y;
    const reach = reachJump(dy, false);
    if (!(reach > 0) || j.gap >= reach * share) continue;
    // (every other one: the rest keep the stage's rhythm)
    if (pick++ % 2) continue;
    const d = Math.round(Math.min(GAP_MAX, reach * share - j.gap, B.width - LAND_MIN));
    if (d < 12) continue;
    // (no dressing standing on the strip that goes, nor anything else standing on it)
    if (dressing.some((o) => o.x > B.x - 20 && o.x < B.x + d + 40 && Math.abs(o.y - B.y) < 220)) continue;
    if (stage.platforms.some((q) => q !== B && !q.broken && q.x < B.x + d + 10 && q.x + q.width > B.x - 10 && q.y < B.y && q.y > B.y - 140)) continue;
    const [x0, w0] = [B.x, B.width];
    B.x += d;
    B.width -= d;
    // (animals on it keep to what is left of it)
    const moved: Array<[Enemy, number]> = [];
    for (const e of stage.enemies) if (Math.abs(e.y + 14 - B.y) < 60 && e.patrolMinX < B.x + 20 && e.patrolMaxX > x0) { moved.push([e, e.patrolMinX]); e.patrolMinX = B.x + 20; }
    undo.push(() => {
      B.x = x0;
      B.width = w0;
      for (const [e, m] of moved) e.patrolMinX = m;
    });
  }
  return undo;
}

/** b. every other heart away from the flags */
function halveHearts(stage: Stage): Undo[] {
  const flags = stage.checkpoints ?? [];
  const mid = stage.collectibles.filter((c) => c.type === 'heart' && !flags.some((f) => Math.abs(f.x - c.x) < FLAG_HEART && Math.abs(f.y - c.y) < 200)).sort((a, b) => a.x - b.x);
  const gone = new Set(mid.filter((_, i) => i % 2 === 1));
  if (!gone.size) return [];
  const before = stage.collectibles;
  stage.collectibles = before.filter((c) => !gone.has(c));
  return [() => (stage.collectibles = before)];
}

/** c. a quarter more of the stage's own ground animals */
function moreAnimals(stage: Stage): Undo[] {
  const ground = stage.enemies.filter((e) => e.type !== 'eagle' && !e.defeated);
  const n = Math.round(ground.length * 0.25);
  if (!n) return [];
  const anchored = anchoredIds(stage);
  const flags = stage.checkpoints ?? [];
  const jumps = jumpEdges(stage);
  const firstOf = new Map<string, number>();
  for (const e of [...ground].sort((a, b) => a.x - b.x)) if (!firstOf.has(e.type)) firstOf.set(e.type, e.x);
  const surface = (e: Enemy) => stage.platforms.find((p) => !p.broken && e.x >= p.x && e.x <= p.x + p.width && Math.abs(p.y - (e.y + 14)) < 40);
  const kinds = ground.map((e) => ({ e, on: surface(e) })).filter((k) => k.on);
  if (!kinds.length) return [];
  let id = Math.max(0, ...stage.enemies.map((e) => e.id)) + 1;
  const added: Enemy[] = [];
  const flats = stage.platforms
    .filter((p) => p.type === 'solid' && !p.broken && !p.push && !p.chase && p.width >= 600 && !anchored.has(p.id) && p.x > stage.spawnX + 1500 && p.x + p.width < stage.exitTotemX - 400)
    .sort((a, b) => a.x - b.x);
  for (const p of flats) {
    if (added.length >= n) break;
    // (nobody on it yet)
    if ([...stage.enemies, ...added].some((e) => e.x > p.x - 40 && e.x < p.x + p.width + 40 && Math.abs(e.y + 14 - p.y) < 60)) continue;
    // its patrol: clear of every take-off and landing on this piece, and of the flags
    let lo = p.x + 40;
    let hi = p.x + p.width - 40;
    for (const j of jumps) {
      if (j.from === p) hi = Math.min(hi, j.takeoffX - JUMP_CLEAR);
      if (j.to === p) lo = Math.max(lo, j.landX + JUMP_CLEAR);
    }
    for (const f of flags) if (Math.abs(f.y - p.y) < 200 && f.x > lo - 200 && f.x < hi + 200) { if (f.x < (lo + hi) / 2) lo = Math.max(lo, f.x + 200); else hi = Math.min(hi, f.x - 200); }
    if (hi - lo < 160) continue;
    // the kind: the stage's own, past the first of its kind (the stage's first meeting stays the one it was built with)
    const k = kinds.find((k) => (firstOf.get(k.e.type) ?? Infinity) < lo) ?? null;
    if (!k) continue;
    const cx = Math.round((lo + hi) / 2);
    const half = Math.min(110, (hi - lo) / 2);
    added.push({ ...k.e, id: id++, x: cx, y: k.e.y - k.on!.y + p.y, patrolMinX: cx - half, patrolMaxX: cx + half, defeated: false, hitFlashTimer: 0, koTimer: 0, behaviorTimer: 0, isAttacking: false, telegraphTimer: 0 });
  }
  if (!added.length) return [];
  stage.enemies.push(...added);
  return [() => (stage.enemies = stage.enemies.filter((e) => !added.includes(e)))];
}

/** what the pass changed (for the tests and the inspector) */
export interface RampOut {
  gaps: number;
  hearts: number;
  animals: number;
  undone: number;
}

/** Normal's climb: the stage passed in is changed and returned (and `out` says what changed) */
export function normalRamp<T extends Stage>(stage: T, out?: RampOut): T {
  const c = stage.config;
  if (!RAMP_WORLDS.has(c.worldIndex) || c.objectiveType === 'boss_lair' || c.secret || SET_PIECES.has(c.id) || stage.proto?.chase) return stage;
  const share = GAP_SHARE[c.worldIndex] ?? 0.8;
  const v0 = validateStage(stage);
  const reach0 = new Set(v0.reachableIds);
  const errors0 = new Set(v0.errors.map((e) => e.replace(/#\d+ at \([^)]*\)/, '#')));
  const heartsBefore = stage.collectibles.filter((x) => x.type === 'heart').length;
  const enemiesBefore = stage.enemies.length;
  const gapUndo = widenGaps(stage, share);
  const rest = [...halveHearts(stage), ...moreAnimals(stage)];
  // the level check: nothing he could reach before is lost (gaps put back in halves, then one at a time)
  // (and no new complaint of the check's: a pickup out of reach, an animal by a flag)
  const lost = () => {
    const v = validateStage(stage);
    const r = new Set(v.reachableIds);
    for (const id of reach0) if (!r.has(id) && stage.platforms.some((p) => p.id === id)) return true;
    return v.errors.length > v0.errors.length || v.errors.some((e) => !errors0.has(e.replace(/#\d+ at \([^)]*\)/, '#')));
  };
  let undone = 0;
  if (lost()) {
    for (const u of rest.reverse()) u();
    let live = gapUndo;
    // (one at a time, newest first, until nothing is lost)
    while (live.length && lost()) {
      live.pop()!();
      undone++;
    }
  }
  if (out) {
    out.gaps = gapUndo.length - undone;
    out.hearts = heartsBefore - stage.collectibles.filter((x) => x.type === 'heart').length;
    out.animals = stage.enemies.length - enemiesBefore;
    out.undone = undone;
  }
  return stage;
}
