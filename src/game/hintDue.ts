/**
 * hintDue: whether a stage's one-time hint (StageHint, protoStage.ts) is due for Pokey where he is now: the engine's own rule (engine.ts
 * says the due lines each frame), kept in one place so a check that walks a stage (gen2 pipeline tipReach) sees what the game does.
 * Due when he is at or past its `x`, left of its `beforeX` (a line said walking left, or one about something he has gone by), low enough
 * for its `belowY` (and standing), high enough for its `aboveY`, and with his feet (y + height) inside its height `band`.
 * Allocation-free: the engine asks it for every hint, every frame.
 */
import type { StageHint } from './protoStage.ts';

export function hintDue(h: Pick<StageHint, 'x' | 'beforeX' | 'belowY' | 'aboveY' | 'band'>, x: number, y: number, feet: number, grounded: boolean): boolean {
  if (x < h.x) return false;
  if (h.beforeX !== undefined && x > h.beforeX) return false;
  if (h.belowY !== undefined && (y < h.belowY || !grounded)) return false;
  if (h.aboveY !== undefined && y > h.aboveY) return false;
  if (h.band !== undefined && (feet < h.band[0] || feet > h.band[1])) return false;
  return true;
}
