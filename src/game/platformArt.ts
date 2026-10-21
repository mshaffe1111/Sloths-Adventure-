/**
 * platformArt — the front door of the thin-platform painters: which painter and how much room each look needs, and the call
 * the renderer makes (`drawThin`). The painters themselves live in thinArt.ts (branch, log, stone, ruin), shelfArt.ts (leaf,
 * fungus, shard, girder ledges) and spanArt.ts (bridges, fragile planks, rafts, river carriers, bounce plants).
 */
import type { Platform } from './types.ts';
import type { Look } from './scenery.ts';
import { spriteFor, blit, type Painter, type Pad } from './platformSprites.ts';
import type { ThinLook, ThinPlan } from './platformPlan.ts';
import { drawBranch, drawLog, drawStone, drawRuin } from './thinArt.ts';

interface Entry {
  paint: Painter;
  pad: Pad;
  /** thickness the painter wants, as a function of the collision height (default: the height itself) */
  height?: (h: number) => number;
}

const PAINT: Partial<Record<ThinLook, Entry>> = {
  branch: { paint: drawBranch, pad: { x: 26, top: 30, bot: 58 } },
  log: { paint: (a) => drawLog(a), pad: { x: 14, top: 22, bot: 40 }, height: (h) => h + 14 },
  stone: { paint: drawStone, pad: { x: 12, top: 20, bot: 44 } },
  ruin: { paint: drawRuin, pad: { x: 12, top: 18, bot: 48 } },
};

/** register more painters (spanArt and shelfArt add theirs when imported) */
export function registerPainter(look: ThinLook, e: Entry) {
  PAINT[look] = e;
}

export function hasPainter(look: ThinLook): boolean {
  return !!PAINT[look];
}

/** draw a thin platform from its cached sprite; false when this look has no sprite painter (the caller paints it live) */
export function drawThin(ctx: CanvasRenderingContext2D, p: Platform, look: Look, world: number, plan: ThinPlan, dy = 0, dx = 0): boolean {
  const e = PAINT[plan.look];
  if (!e) return false;
  const sp = spriteFor(p, look, world, plan, e.paint, e.pad, e.height?.(p.height));
  blit(ctx, sp, p.x + dx, p.y + dy);
  return true;
}
