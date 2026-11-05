/**
 * The engine pieces' art (src/game/pieces/): one small sheet, src/assets/pieces/pieces.webp, packed by tools/art/pieces/pack.py from
 * painted cells that were packed and never drawn (reference/engine/unused-art/IN-GAME-UNUSED.md): World 4's slung log, World 2's crates
 * and waterline, World 3's counterweight, cracks, bats and stalactites, World 1's root gates and knot blocks. 1024 px wide, about 3.6 MB decoded.
 *
 * Every draw returns false until the sheet has loaded; nothing is ever drawn in its place (a stage that lays a piece asks for the sheet
 * before it starts: pieceSheets in pieces.ts, stageSheets.ts 'pieces').
 */
import { trackAtlas } from '../atlasLoader.ts';

/** the sheet's cells (copied from src/assets/pieces/pieces.json, the packer's list; pieces.test.ts holds them equal) */
export const PIECE_FRAMES = {
  'root-gate-open': { x: 0, y: 0, w: 177, h: 300 },
  'root-gate-shut': { x: 181, y: 0, w: 177, h: 299 },
  'bat-asleep': { x: 362, y: 0, w: 195, h: 210 },
  'bat-flap1': { x: 561, y: 0, w: 192, h: 210 },
  'bat-flap2': { x: 757, y: 0, w: 183, h: 210 },
  'slung-log': { x: 0, y: 304, w: 487, h: 186 },
  'stalactite-fall': { x: 491, y: 304, w: 140, h: 178 },
  'stalactite-shards': { x: 635, y: 304, w: 271, h: 165 },
  'bat-stir': { x: 0, y: 494, w: 210, h: 164 },
  'crack-cracking': { x: 214, y: 494, w: 398, h: 152 },
  'crate-down': { x: 616, y: 494, w: 171, h: 151 },
  'crack-whole': { x: 0, y: 662, w: 400, h: 151 },
  'knot-a': { x: 404, y: 662, w: 180, h: 139 },
  'crate-up': { x: 588, y: 662, w: 163, h: 136 },
  'knot-b': { x: 755, y: 662, w: 161, h: 119 },
  'counterweight': { x: 0, y: 817, w: 198, h: 109 },
  'waterline': { x: 202, y: 817, w: 501, h: 61 },
} as const;
export type PieceCell = keyof typeof PIECE_FRAMES;

export const PIECES_URL = new URL('../../assets/pieces/pieces.webp', import.meta.url).href;
let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(im, PIECES_URL, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; });
}
/** whether the sheet has loaded (starts the load) */
export function piecesReady(): boolean {
  load();
  return ready && !!img;
}

/** cell `n` filling the box (x, y, w, h); `flip` mirrors it. False while the sheet loads */
export function blitPiece(ctx: CanvasRenderingContext2D, n: PieceCell, x: number, y: number, w: number, h: number, flip = false): boolean {
  if (!piecesReady()) return false;
  const f = PIECE_FRAMES[n];
  if (!flip) {
    ctx.drawImage(img!, f.x, f.y, f.w, f.h, x, y, w, h);
    return true;
  }
  ctx.save();
  ctx.translate(x + w, y);
  ctx.scale(-1, 1);
  ctx.drawImage(img!, f.x, f.y, f.w, f.h, 0, 0, w, h);
  ctx.restore();
  return true;
}
