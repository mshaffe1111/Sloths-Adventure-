/**
 * waterTeach — water is taught before it can cost a life, on every hand-built stage and the old generator's (LV-8, polish report
 * 2026-10-29: 2-3 drowned the first-timer at 18 s with the tip at 57 s, 3-8 at 19 s with it at 54 s, 5-6 at 4.5 s holding forward from
 * the spawn). The new generator's rule (gen2/pipeline.ts fillSockets water), ported:
 *   - the stage's first deadly water at floor level gets Dot's warning WATER_WARN.lead px before its lip (Matt's words, approved
 *     2026-10-28: HAND_WATER_LINE), gone once he is past it, and the painted warning sign at the edge (waterSign.ts);
 *   - unless the stage already says so there (a line about the water, the river or the logs within the lead before it): then only the sign,
 *     and that line is said at the lead if it came later;
 *   - water that comes before a warning could be read (the first WATER_NEAR px from the spawn: 5-6's floor runs out under its first
 *     raised log) is a teaching pool instead: a splash and back on the bank, no life (as World 2's teaching rivers are), and the warning
 *     goes to the next water.
 * Normal and Easy alike, once a stage (Dot is a guide, not a narrator: STAGE-RULES §1).
 */
import type { GeneratedStage } from './stageGenerator.ts';
import type { Platform } from './types.ts';
import type { ProtoExtras, StageHint } from './protoStage.ts';
import { WATER_WARN } from './gen2/types.ts';

/** Dot's water warning on a hand-built stage (Matt's words, 2026-10-28; gen2 Worlds 6-10 have their own, WATER_LINE) */
export const HAND_WATER_LINE = 'Careful, water! Flick up and over.';
/** water this close to the spawn (px) comes before the warning could be read: it is a teaching pool (5-6's 4.5 s drowning) */
export const WATER_NEAR = 1200;
/** a floor this far above the spawn's is still the floor he walks (px); water narrower than this is not a gap he can fall in */
const FLOOR_RISE = 160;
const MIN_GAP = 40;
/** a line of the stage's own about the water this far before it (px) already warns of it */
const TOLD_BEFORE = 2400;

type Stage = GeneratedStage & { proto?: ProtoExtras };

/** a stretch of floor-level water, and the bank before it */
export interface WaterSpot {
  x0: number;
  x1: number;
  /** the near bank's top (where a teaching pool sets him back down) */
  bankY: number;
  river: boolean;
}

/**
 * The deadly water along the floor, in order: the rivers that cost a life, and the openings in the floor over the stage's water line
 * (no ledge at about the floor's height under them: a plain walk drops in). Floor height is the spawn's.
 */
export function floorWater(stage: Stage): WaterSpot[] {
  const out: WaterSpot[] = [];
  const rivers = stage.rivers ?? [];
  const safe = stage.safeWater ?? [];
  const covered = (x0: number, x1: number) => rivers.some((r) => r.x0 < x1 && r.x1 > x0) || safe.some((s) => s.x0 < x1 && s.x1 > x0);
  const floorY = stage.spawnY ?? 580;
  // (floor: a ledge at about the floor's height, or a bank or block standing up from the ground, however tall)
  const isFloor = (p: Platform) => !p.broken && p.type !== 'drift' && p.type !== 'moving' && !p.chase && (p.y >= floorY - FLOOR_RISE || p.y + p.height >= floorY - 10) && p.y < (stage.waterY ?? Infinity);
  // (the near bank: the floor piece whose end is the lip, its top where the sign stands)
  const bankAt = (x0: number) => {
    let best: Platform | null = null;
    for (const p of stage.platforms) if (isFloor(p) && Math.abs(p.x + p.width - x0) <= 3 && (!best || p.y < best.y)) best = p;
    if (!best) for (const p of stage.platforms) if (isFloor(p) && x0 - 30 >= p.x && x0 - 30 <= p.x + p.width && (!best || p.y < best.y)) best = p;
    return best?.y ?? floorY;
  };
  for (const r of rivers) if (!r.safe && r.x1 - r.x0 >= MIN_GAP) out.push({ x0: r.x0, x1: r.x1, bankY: bankAt(r.x0), river: true });
  const waterY = stage.waterY;
  if (waterY !== undefined) {
    const floor = stage.platforms
      .filter(isFloor)
      .map((p) => [p.x, p.x + p.width] as const)
      .sort((a, b) => a[0] - b[0]);
    let end = -Infinity;
    for (const [a, b] of floor) {
      if (end > -Infinity && a - end >= MIN_GAP && end > stage.spawnX && !covered(end, a)) out.push({ x0: end, x1: a, bankY: bankAt(end), river: false });
      end = Math.max(end, b);
    }
  }
  return out.sort((a, b) => a.x0 - b.x0);
}

/** a stage line that already speaks of the water there */
// (World 3's own: "No moss down there. Jump true!", the stream's soft moss gone and water under the gap)
const SAYS_WATER = /\b(water|river|deep|logs?|splash|swim|pond|stream|creek)\b|\bno moss\b/i;

/** water taught before it costs a life (LV-8); the stage passed in is changed and returned */
export function teachWater<T extends Stage>(stage: T): T {
  const proto = stage.proto;
  // (Worlds 1-5: from World 6 on the new generator warns of its own water, gen2/pipeline.ts)
  if (stage.config.objectiveType === 'boss_lair' || stage.boss || stage.arena || stage.config.worldIndex > 5) return stage;
  // (teaching pools first: they can move the warning on to the next water)
  for (;;) {
    const first = floorWater(stage)[0];
    if (!first || first.x0 - stage.spawnX >= WATER_NEAR) break;
    (stage.safeWater ??= []).push({ x0: Math.round(first.x0), x1: Math.round(first.x1), backX: Math.round(first.x0 - 60), backY: Math.round(first.bankY) });
  }
  const first = floorWater(stage)[0];
  if (!first) return stage;
  const x = Math.round(Math.max(stage.spawnX + 40, first.x0 - WATER_WARN.lead));
  // (the stage's own line about it, up to TOLD_BEFORE px before the lip (3-1 says it 1200+ px ahead), is the warning; said too close to
  // read before the lip (2-1's "Deep water now" 123 px before it), it is said at the lead)
  const said = (proto?.hints ?? []).filter((h) => h.x >= first.x0 - TOLD_BEFORE && h.x <= first.x0 && SAYS_WATER.test(h.text));
  const told = said.length > 0;
  for (const h of said) if (h.x > x) h.x = x;
  const passX = Math.round(first.x1 + 80);
  if (!told && proto) {
    const h: StageHint = { x, text: HAND_WATER_LINE, pad: HAND_WATER_LINE, keys: HAND_WATER_LINE, passX };
    proto.hints.push(h);
  } else if (!told) stage.waterHint = { x, text: HAND_WATER_LINE, passX };
  (stage.waterSigns ??= []).push({ x: Math.round(first.x0 - 40), y: Math.round(first.bankY) });
  return stage;
}
