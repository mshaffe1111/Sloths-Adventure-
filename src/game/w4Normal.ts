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
 *     is still warned (Matt's rule); never closer than its warning, its fall, its shatter and a second's quiet.
 */
import type { GeneratedStage } from './stageGenerator.ts';
import type { ProtoExtras } from './protoStage.ts';
import { ROCK } from './rockfall.ts';
import { validateStage } from './levelCheck.ts';

/** (a gust stays within the level check's 160 px/s and keeps more than its 2 s of quiet: levelCheck.ts zones) */
export const W4_NORMAL = { warn: 1.6, pass: 2.2, calm: 0.8, gust: 1.25, gustMax: 160, quiet: 0.8, quietMin: 2.1, rocks: 0.8 } as const;

export function w4Normal<T extends GeneratedStage & { proto?: ProtoExtras }>(stage: T): T {
  const c = stage.config;
  if (c.worldIndex !== 4 || c.objectiveType === 'boss_lair' || c.secret) return stage;
  const K = W4_NORMAL;
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
