/**
 * w4Normal — World 4 a little sharper on Normal (LV-2; Matt approved the numbers 2026-10-29): World 4's Normal band sat under World 3's
 * (tools/inspect bands.ts, BAND_GATE), its stages costing an adult first-timer no lives. Normal only (stageGenerator.ts generateStage;
 * Easy keeps every number as it is), and never at a stage's first of a kind (its first watched stretch, its first gust, its first rock:
 * those keep the numbers they are taught with):
 *   - the Sovereign: her screech-to-sweep warning 2.0 -> 1.6 s (QA: 1.4 caught testers running), her sweep 2.6 -> 2.2 s, and the calm
 *     between her passes x0.8 (the dive after she sees him, and each stretch's harmless first pass, unchanged);
 *   - the gusts: x1.25 as strong (at most the level check's 160 px/s), their quiet spell x0.8 but never under 2.1 s (the check wants
 *     more than 2), their warning unchanged; put back on a stage where the check then loses a place he could reach (4-4's chains);
 *   - the falling rocks: x0.8 the time between rocks from the same drop points, their shadow (or grit) warning unchanged, so every rock
 *     is still warned (Matt's rule); never closer than its warning, its fall, its shatter and a second's quiet;
 *   - taught moves together (LV-2, the lead's option A, 2026-10-29), in the second half of a stage only: a gust across real jumps (4-2,
 *     where gusts are taught) and rocks over landing ledges (4-8; rocks are taught in 4-1, and a stage's first rock cannot hurt until
 *     its shadow has shown: w4Play.ts rockWarned). Each is kept only if the level check loses nothing and finds nothing new.
 */
import type { GeneratedStage } from './stageGenerator.ts';
import type { ProtoExtras } from './protoStage.ts';
import { ROCK } from './rockfall.ts';
import { validateStage } from './levelCheck.ts';
import { jumpEdges, type JumpEdge } from './stageMetrics.ts';
import type { RockDrop } from './rockfall.ts';
import type { Zone } from './zones.ts';

/** (a gust stays within the level check's 160 px/s and keeps more than its 2 s of quiet: levelCheck.ts zones) */
export const W4_NORMAL = { warn: 1.6, pass: 2.2, calm: 0.8, gust: 1.25, gustMax: 160, quiet: 0.8, quietMin: 2.1, rocks: 0.8 } as const;

/** the stages that get taught moves together on Normal, and how many of each (option A: World 4's first two) */
export const W4_PAIRS: Record<string, { gusts?: number; rocks?: number }> = { '4-2': { gusts: 3 }, '4-8': { rocks: 3 } };

/** the jumps of the stage's second half worth pairing: a real gap onto a landing at least `land` px wide, spaced 1200 px apart */
function pairJumps(stage: GeneratedStage, n: number, land: number, ok: (j: JumpEdge) => boolean): JumpEdge[] {
  const half = (stage.spawnX + stage.exitTotemX) / 2;
  const out: JumpEdge[] = [];
  for (const j of jumpEdges(stage).filter((j) => j.dir === 1 && j.gap >= 60 && j.to.width >= land && j.takeoffX > half && j.landX < stage.exitTotemX - 500).sort((a, b) => a.takeoffX - b.takeoffX)) {
    if (out.length >= n) break;
    if (out.some((o) => Math.abs(o.takeoffX - j.takeoffX) < 1200) || !ok(j)) continue;
    out.push(j);
  }
  return out;
}

/** keep an addition only if the level check loses no place he could reach and finds nothing new */
function keepIf(stage: GeneratedStage, add: () => void, undo: () => void) {
  const v0 = validateStage(stage);
  add();
  const v = validateStage(stage);
  const r = new Set(v.reachableIds);
  if (v.errors.length > v0.errors.length || v0.reachableIds.some((id) => !r.has(id))) undo();
}

function pairMoves<T extends GeneratedStage & { proto?: ProtoExtras }>(stage: T) {
  const want = W4_PAIRS[stage.config.id];
  if (!want) return;
  if (want.gusts) {
    const zones = (stage.zones ??= []);
    const free = (x0: number, x1: number) => !zones.some((z) => z.x0 < x1 + 200 && z.x1 > x0 - 200);
    for (const [i, j] of pairJumps(stage, want.gusts, 60, (j) => j.gap < 150 && free(j.takeoffX - 140, j.landX + 140)).entries()) {
      const y = Math.max(j.from.y, j.to.y);
      // (only over a plain jump: the level check allows no wind over a gap wider than one, levelCheck.ts zones)
      // (blowing against him if the level check allows it, the hop needing its full flick while it blows; else with him, carrying him
      // toward the far edge of a small landing: either way easy in the quiet)
      for (const dir of [-1, 1] as const) {
        const z: Zone = { kind: 'wind', x0: Math.round(j.takeoffX - 140), x1: Math.round(j.landX + 140), top: Math.round(y - 460), bottom: Math.round(y), baseY: Math.round(y), dir, period: 6.1, warn: 1.1, active: 2.2, force: 120, offset: Math.round((i * 2.3) % 6.1 * 10) / 10 };
        let kept = true;
        keepIf(stage, () => zones.push(z), () => { zones.splice(zones.indexOf(z), 1); kept = false; });
        if (kept) break;
      }
    }
  }
  if (want.rocks && stage.proto?.w4) {
    const rocks = (stage.proto.w4.rocks ??= []);
    const clearAbove = (x: number, y: number) => !stage.platforms.some((q) => !q.broken && q.x < x + 40 && q.x + q.width > x - 40 && q.y < y - 10 && q.y > y - 480);
    for (const [i, j] of pairJumps(stage, want.rocks, 100, (j) => clearAbove(j.landX + Math.min(70, j.to.width / 2), j.to.y)).entries()) {
      const r: RockDrop = { x: Math.round(j.landX + Math.min(70, j.to.width / 2)), top: Math.round(j.to.y - 470), land: Math.round(j.to.y), every: 5 + (i % 3) * 0.3, warn: 1.4, offset: Math.round((i * 1.7) % 5 * 10) / 10 };
      keepIf(stage, () => rocks.push(r), () => rocks.splice(rocks.indexOf(r), 1));
    }
  }
}

export function w4Normal<T extends GeneratedStage & { proto?: ProtoExtras }>(stage: T): T {
  const c = stage.config;
  if (c.worldIndex !== 4 || c.objectiveType === 'boss_lair' || c.secret) return stage;
  const K = W4_NORMAL;
  // (the taught moves together first: then the numbers below sharpen them with the rest)
  pairMoves(stage);
  // the Sovereign's stretches, after the first
  const watch = [...(stage.proto?.watch ?? [])].sort((a, b) => a.x0 - b.x0);
  for (const z of watch.slice(1)) {
    z.warn = K.warn;
    z.pass = K.pass;
    z.calm = [Math.round(z.calm[0] * K.calm * 10) / 10, Math.round(z.calm[1] * K.calm * 10) / 10];
  }
  // the gusts, after the first (put back if the level check then loses a place he could reach, or finds something new to say)
  const gusts = (stage.zones ?? []).filter((z) => z.kind === 'wind').sort((a, b) => a.x0 - b.x0).slice(1);
  if (gusts.length) {
    const v0 = validateStage(stage);
    const was = gusts.map((z) => [z.force, z.period] as const);
    for (const z of gusts) {
      const quiet = z.period - z.warn - z.active;
      z.force = Math.min(K.gustMax, Math.max(z.force, Math.round(z.force * K.gust)));
      z.period = Math.round((Math.max(Math.min(quiet, K.quietMin), quiet * K.quiet) + z.warn + z.active) * 10) / 10;
    }
    const v = validateStage(stage);
    const r = new Set(v.reachableIds);
    if (v.errors.length > v0.errors.length || v0.reachableIds.some((id) => !r.has(id))) gusts.forEach((z, i) => ([z.force, z.period] = was[i]));
  }
  // the rocks, after the first
  const rocks = [...(stage.proto?.w4?.rocks ?? [])].sort((a, b) => a.x - b.x);
  for (const r of rocks.slice(1)) {
    const least = r.warn + (r.land - r.top) / ROCK.speed + ROCK.shatter + 1;
    r.every = Math.round(Math.max(least, r.every * K.rocks) * 10) / 10;
  }
  return stage;
}
