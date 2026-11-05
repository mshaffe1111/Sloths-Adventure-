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
import { PIECE_FRAMES, blitPiece, piecesReady } from './pieceArt.ts';
import { LOG_CELL, logScale, slingRopes, stepSling } from './sling.ts';
import { CRATE_CELL, crateState, stepCrate } from './crate.ts';
import { stepSeesaw, type PieceEnv } from './seesaw.ts';
import { GATE, stepGate } from './rootgate.ts';
import { drawWallArt, protoArtReady } from '../protoArt.ts';
import { drawKitArt, kitArtReady, kitSize } from '../puzzleArt.ts';
import { KIT_ART } from '../puzzleAtlasData.ts';
import { SEESAW_PIVOT } from '../puzzlePlay.ts';
import { drawRopeAlong, warmRopeKit } from '../ropeArt.ts';

const still = { dx: 0, dy: 0 };
/** move piece `p` to where it is at game time t; how far it moved (0, 0 for a piece that does not move) */
export function stepPiece(p: Platform, t: number, env: PieceEnv): { dx: number; dy: number; opened?: boolean } {
  if (p.sling) return stepSling(p, t);
  if (p.crate) return stepCrate(p, t);
  if (p.seesaw) return stepSeesaw(p, env);
  if (p.rootgate) return stepGate(p, t, env);
  return still;
}
/** whether the engine's moving-platform loop leaves this platform to stepPiece */
export const isPiece = (p: Platform) => !!p.sling || !!p.crate || !!p.seesaw || !!p.rootgate;

/** the sheets a stage's pieces draw from (stagePreload.ts keys) */
export function pieceSheets(platforms: readonly Platform[]): string[] {
  const out: string[] = [];
  if (platforms.some((p) => p.sling || p.crate || p.rootgate)) out.push('pieces');
  if (platforms.some((p) => p.rootgate)) out.push('kit:1');
  if (platforms.some((p) => p.sling)) out.push('rope');
  if (platforms.some((p) => p.seesaw || p.rootgate)) out.push('kit-pieces');
  return out;
}
/** start loading what the pieces draw with (the engine asks as a stage starts) */
export function warmPieces(platforms: readonly Platform[]): void {
  if (platforms.some((p) => p.sling || p.crate || p.rootgate)) piecesReady();
  if (platforms.some((p) => p.rootgate)) protoArtReady();
  if (platforms.some((p) => p.sling)) warmRopeKit();
  if (platforms.some((p) => p.seesaw || p.rootgate)) kitArtReady();
}

interface View { x0: number; x1: number; y0: number; y1: number }
const seen = (x0: number, x1: number, y0: number, y1: number, v: View) => x1 > v.x0 - 60 && x0 < v.x1 + 60 && y1 > v.y0 - 60 && y0 < v.y1 + 60;

/** the rope's points, kept from frame to frame (PERFORMANCE-RULES §3.1) */
const rope: Array<[number, number]> = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]];

/** every piece on screen, in its painted art (nothing is drawn in its place while the sheet loads) */
export function drawPieces(ctx: CanvasRenderingContext2D, platforms: readonly Platform[], v: View, t = 0): void {
  for (const p of platforms) {
    if (p.crate) { drawCrate(ctx, p, v, t); continue; }
    if (p.seesaw) { if (p.seesaw.side === 0) drawSeesaw(ctx, p, platforms, v); continue; }
    if (p.rootgate) { drawGatePart(ctx, p, v, t); continue; }
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

/**
 * A bobbing crate: World 2's painted crate (crate-up afloat, crate-down tipping), its top on the platform's top; only the part over the
 * water is drawn (a rectangle clip at the surface: what is under reads as under), and World 2's painted foam where it cuts the water.
 */
function drawCrate(ctx: CanvasRenderingContext2D, p: Platform, v: View, t: number): void {
  const c = p.crate!;
  if (!seen(p.x - 30, p.x + p.width + 30, p.y - 30, c.surfaceY + 20, v)) return;
  const { s } = crateState(c, t);
  const cell = s === 'tip' ? CRATE_CELL.down : CRATE_CELL.up;
  const k = p.width / (cell.right - cell.left);
  const dw = cell.w * k, dh = cell.h * k;
  const dx = p.x - cell.left * k, dy = p.y - cell.top * k;
  // (the water line: a hair under the surface, so the foam covers the cut)
  const cut = c.surfaceY + 3;
  if (dy < cut) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(dx - 4, dy - 4, dw + 8, cut - dy + 4);
    ctx.clip();
    blitPiece(ctx, s === 'tip' ? 'crate-down' : 'crate-up', dx, dy, dw, dh, p.id % 2 === 1);
    ctx.restore();
  }
  // the foam where it meets the water: wider and brighter as it goes under or comes up (a splash), calm afloat
  const churn = s === 'afloat' ? 0 : 1;
  const fw = p.width * (1.25 + 0.25 * churn), fh = fw * (PIECE_FRAMES.waterline.h / PIECE_FRAMES.waterline.w);
  if (churn || p.y < c.surfaceY) blitPiece(ctx, 'waterline', p.x + p.width / 2 - fw / 2, c.surfaceY - fh * 0.5, fw, fh);
}

/** a seesaw: the kit's painted plank on its round pivot, by the pivot, stretched to the plank's length (as puzzlePlay.ts drawSeesaw) */
function drawSeesaw(ctx: CanvasRenderingContext2D, p: Platform, platforms: readonly Platform[], v: View): void {
  const s = p.seesaw!;
  const peer = platforms.find((q) => q.id === s.peer);
  if (!peer) return;
  const w = p.width + peer.width;
  if (!seen(s.pivotX - w / 2, s.pivotX + w / 2, s.y - s.rise - 40, s.y + 60, v)) return;
  const n: 'seesawLevel' | 'seesawUpR' | 'seesawUpL' = s.show < -0.5 ? 'seesawUpR' : s.show > 0.5 ? 'seesawUpL' : 'seesawLevel';
  const sz = kitSize(n);
  const k = (w + 24) / sz.w;
  const f = KIT_ART[n];
  drawKitArt(ctx, n, s.pivotX + (f.ax - SEESAW_PIVOT[n]) * f.k * k, s.y + 10, { scale: k });
}

/** the knot block's walkable top in its cell (px of 139: its mossy top, read off the alpha) */
const KNOT_TOP = 5;

/**
 * A root gate's part: the root wall (the kit's painted wall, only the part on screen), the door (the painted root gate: woven shut, then
 * the bare frame, the roots drawing back over GATE.opening s with a shiver), the knot block (World 1's painted knot, sinking a touch once he
 * has stood on it).
 */
function drawGatePart(ctx: CanvasRenderingContext2D, p: Platform, v: View, t: number): void {
  const g = p.rootgate!;
  if (g.role === 'wall') {
    if (!seen(p.x, p.x + p.width, p.y, p.y + p.height, v)) return;
    const top = Math.max(p.y, v.y0 - 60);
    drawWallArt(ctx, p.x - 6, top, p.y + p.height + 14, p.width + 12);
    return;
  }
  if (g.role === 'plate') return;
  if (g.role === 'knot') {
    // the knot block, its mossy top on the plate's top, a hair wider than its box; stood on, it sinks a little (a pressed switch)
    if (!seen(p.x - 20, p.x + p.width + 20, p.y - 20, p.y + p.height, v)) return;
    const f = PIECE_FRAMES['knot-a'];
    const w = p.width * 1.12, h = (w * f.h) / f.w;
    const sink = g.on ? Math.min(1, (t - g.at) / 0.12) * 4 : 0;
    blitPiece(ctx, 'knot-a', p.x + p.width / 2 - w / 2, p.y - KNOT_TOP * (h / f.h) + sink, w, h);
    return;
  }
  // the door: drawn by its height, centred on the doorway, its foot on the floor
  if (!seen(p.x - 20, p.x + p.width + 20, p.y - 20, p.y + p.height, v)) return;
  const f = PIECE_FRAMES['root-gate-shut'];
  const h = GATE.doorH + 26, w = (h * f.w) / f.h;
  const x = p.x + p.width / 2 - w / 2, y = p.y + p.height - h + 6;
  const since = g.on ? t - g.at : -1;
  if (!g.on || since < 0) { blitPiece(ctx, 'root-gate-shut', x, y, w, h); return; }
  const k = Math.min(1, since / GATE.opening);
  blitPiece(ctx, 'root-gate-open', x, y, w, h);
  if (k < 1) {
    // (the woven roots shiver and draw back: the shut picture over the open one, fading, shaking less as it goes)
    const shake = Math.sin(since * 60) * 3 * (1 - k);
    ctx.save();
    ctx.globalAlpha = 1 - k;
    blitPiece(ctx, 'root-gate-shut', x + shake, y - k * 10, w, h);
    ctx.restore();
  }
}
