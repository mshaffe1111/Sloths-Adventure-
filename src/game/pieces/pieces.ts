/**
 * The engine pieces (the lead's list, 11-05: the slung log, bobbing crates, the counterweight, the root gate, the secret tunnel, the
 * sleeping bat and the falling stalactites): one place the engine calls for all of them, so engine.ts carries three one-line hooks and
 * nothing piece-specific.
 *
 *   - stepPieces: each frame, in the engine's moving-platform loop (engine.ts "Moving platforms"): moves a piece that moves and says how
 *     far, so the rider is carried as the lift carries him;
 *   - drawPieces: each frame, with the stage's other painted set pieces (after the ground and the boughs, before Pokey);
 *   - pieceSheets: the sheets a stage's pieces draw from, so the stage asks for them before it starts (stageSheets.ts).
 */
import type { Platform } from '../types.ts';
import { blitPiece, piecesReady } from './pieceArt.ts';
import { LOG_CELL, logScale, slingRopes, stepSling } from './sling.ts';
import { drawRopeAlong, warmRopeKit } from '../ropeArt.ts';

const still = { dx: 0, dy: 0 };
/** move piece `p` to where it is at game time t; how far it moved (0, 0 for a piece that does not move) */
export function stepPiece(p: Platform, t: number): { dx: number; dy: number } {
  if (p.sling) return stepSling(p, t);
  return still;
}
/** whether the engine's moving-platform loop leaves this platform to stepPiece */
export const isPiece = (p: Platform) => !!p.sling;

/** the sheets a stage's pieces draw from (stagePreload.ts keys) */
export function pieceSheets(platforms: readonly Platform[]): string[] {
  return platforms.some(isPiece) ? ['pieces', 'rope'] : [];
}
/** start loading what the pieces draw with (the engine asks as a stage starts) */
export function warmPieces(platforms: readonly Platform[]): void {
  if (!platforms.some(isPiece)) return;
  piecesReady();
  warmRopeKit();
}

interface View { x0: number; x1: number; y0: number; y1: number }
const seen = (x0: number, x1: number, y0: number, y1: number, v: View) => x1 > v.x0 - 60 && x0 < v.x1 + 60 && y1 > v.y0 - 60 && y0 < v.y1 + 60;

/** the rope's points, kept from frame to frame (PERFORMANCE-RULES §3.1) */
const rope: Array<[number, number]> = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]];

/** every piece on screen, in its painted art (nothing is drawn in its place while the sheet loads) */
export function drawPieces(ctx: CanvasRenderingContext2D, platforms: readonly Platform[], v: View): void {
  for (const p of platforms) {
    if (p.broken || !p.sling) continue;
    const s = p.sling;
    const k = logScale(p.width);
    const dw = LOG_CELL.w * k, dh = LOG_CELL.h * k;
    const dx = p.x - LOG_CELL.left * k, dy = p.y - LOG_CELL.top * k;
    if (!seen(Math.min(dx, s.restX - 20), Math.max(dx + dw, s.restX + p.width + 20), s.tieY - 20, dy + dh, v)) continue;
    // the two ropes, from the bough down to the stubs the painted log's own ropes leave its cell by (a hair into the cell, no seam),
    // looped over the bough's top
    const thick = LOG_CELL.ropeW * k;
    for (const r of slingRopes(p, s)) {
      rope[0][0] = r.ex; rope[0][1] = r.ey + 2 * k;
      rope[1][0] = r.tx; rope[1][1] = r.ty - thick * 0.2;
      // (the loop over the bough: up its near side, over the top, and a short tail down the far side)
      rope[2][0] = r.tx + thick * 0.9; rope[2][1] = r.ty - thick * 0.7;
      rope[3][0] = r.tx + thick * 1.6; rope[3][1] = r.ty + thick * 0.4;
      drawRopeAlong(ctx, ROPE4, thick);
    }
    blitPiece(ctx, 'slung-log', dx, dy, dw, dh);
  }
}
const ROPE4 = { length: 4, 0: rope[0], 1: rope[1], 2: rope[2], 3: rope[3] } as ArrayLike<readonly [number, number]>;
