/**
 * invCut — a cut piece from ANY world drawn as a platform (Platform.cut = the piece's catalog id, exactly as its world's inventory has it,
 * src/game/art/inventory/w<N>.json `id`). World 1's own cut atlas keeps its path (w1CutArt.ts W1_CUT: a name there is drawn there and
 * never comes here); every other cut is read through the inventory: the row's picture (`file`, shipped by a folder line in
 * invDressArt.ts), its rect on that picture (`frame`, or the whole picture), and its footing (`walk_y`, `walk_x0`..`walk_x1`, in the
 * piece's own pixels).
 *
 * Drawn the way World 1's cut stones and planks are (w1CutArt.ts cutBox): its stand span IS the platform's width, so he never stands on
 * air beside the art, and its footing line is the platform's top. One even scale both ways (k = width / stand span): never stretched.
 *
 * The gate (invCutBreaches, run on every listed stage by invCut.test.ts) refuses a cut by name: an id that is neither a World 1 cut nor
 * in its world's inventory, a piece with no footing measured, one out of scale with Pokey (scale_ok false), one waiting on a fix, a made
 * thing in World 1, a frame with no rect, or a picture the build does not ship. A refused cut is never drawn (and never drawn blank:
 * the gate fails first).
 *
 * Drawing (PERFORMANCE-RULES §1, §2): before the first frame the stage's cuts are resolved against its world's inventory and each picture
 * is asked for (stageReady.ts readyBuiltStage -> readyInvCuts), so it loads and decodes under the title card through atlasLoader (the
 * loader World 1's cut sheet uses). A frame pays one drawImage per piece in view (sheetBake.ts drawSheet), one Map get a platform, no
 * allocation. Pictures only: nothing here touches play.
 */
import { trackAtlas } from '../atlasLoader.ts';
import { drawSheet } from '../sheetBake.ts';
import type { Platform } from '../types.ts';
import { drawCutArt, isW1Cut } from '../w1CutArt.ts';
import { frameRect } from './invDress.ts';
import { invDressFolders, invDressUrl } from './invDressArt.ts';
import { loadInventory, standable, usable, type ArtRow, type Inventory } from './inventory.ts';

export { isW1Cut };

/** why the inventory row `r` (asked for by id `id` in world `world`) cannot be drawn as a platform's cut piece, or undefined when it can */
function refusal(id: string, r: ArtRow | undefined, world: number): string | undefined {
  if (!r) return `cut '${id}' is neither a World 1 cut (w1CutArt.ts W1_CUT) nor in any row of World ${world}'s inventory (src/game/art/inventory/w${world}.json): name it by its catalog id, in a world it fits`;
  if (world === 1 && r.made_thing) return `cut '${id}' is a made thing: never World 1 art (Matt 11-11)`;
  if (!usable(r)) return `cut '${id}' is waiting on a fix (${r.status})`;
  if (!standable(r)) return `cut '${id}' has no footing to stand on (layer '${r.layer}', walk_y ${r.walk_y}, walk_x ${r.walk_x0}..${r.walk_x1}): only a platform, step or soft landing with its walk line measured is drawn as a platform`;
  if (r.walk_x1! - r.walk_x0! <= 0) return `cut '${id}' has an empty stand span (walk_x ${r.walk_x0}..${r.walk_x1})`;
  if (r.scale_ok === false) return `cut '${id}' is out of scale with Pokey: drawn ${r.pokey_scale} of his height, outside its layer '${r.layer}' range (R-165.107)`;
  if (frameRect(r) === undefined) return `cut '${id}' is a frame with no rect on its sheet (${r.frame})`;
  if (!invDressUrl(r.file)) return `cut '${id}': its picture ${r.file} is not in the build (src/game/art/invDressArt.ts ships ${invDressFolders().join(', ')})`;
  return undefined;
}

/** the platforms whose cut this module draws (a cut that is not World 1's) */
const invCuts = (platforms: readonly Pick<Platform, 'cut'>[]): string[] => {
  const out = new Set<string>();
  for (const p of platforms) if (p.cut && !isW1Cut(p.cut)) out.add(p.cut);
  return [...out];
};

/**
 * Every way a stage's cut pieces break the rule, by name (the gate): `inv` is the stage's world's inventory (loadInventory(world)).
 * World 1's own cuts are w1CutArt's and are not judged here.
 */
export function invCutBreaches(platforms: readonly Pick<Platform, 'id' | 'x' | 'cut'>[], inv: Inventory, world: number): string[] {
  const out: string[] = [];
  for (const p of platforms) {
    if (!p.cut || isW1Cut(p.cut)) continue;
    const why = refusal(p.cut, inv.byId(p.cut), world);
    if (why) out.push(`platform ${p.id} at x ${Math.round(p.x)}: ${why}`);
  }
  return out;
}

/** a resolved piece: its picture (loaded through atlasLoader, let go with its world and reloaded if the phone takes it back), rect, footing */
export interface CutPiece {
  url: string;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  /** footing, in the piece's own pixels: the walk line's y and its x span */
  fy: number;
  fx0: number;
  fx1: number;
  img: HTMLImageElement | null;
  ready: boolean;
}

/** where a piece is drawn for a platform (game px): its stand span the platform's width, its walk line on the platform's top */
export function invCutBox(p: Pick<Platform, 'x' | 'y' | 'width'>, c: Pick<CutPiece, 'sw' | 'sh' | 'fy' | 'fx0' | 'fx1'>): { x: number; y: number; w: number; h: number; k: number } {
  const k = p.width / Math.max(1, c.fx1 - c.fx0);
  return { x: p.x - c.fx0 * k, y: p.y - c.fy * k, w: c.sw * k, h: c.sh * k, k };
}

/** by catalog id: a piece, 'no' (the gate refuses it: never drawn) or 'asking' (its world's inventory is on its way) */
const pieces = new Map<string, CutPiece | 'no' | 'asking'>();
let resolvedCount = 0;
/** how many pieces have been resolved against an inventory (invCut.test.ts reads it: once a piece, never a frame or a platform) */
export const invCutResolves = (): number => resolvedCount;
/** the resolved piece for a cut id (undefined: not asked for yet, or refused, or on its way) */
export function invCutPiece(id: string): CutPiece | undefined {
  const p = pieces.get(id);
  return p && p !== 'no' && p !== 'asking' ? p : undefined;
}

function load(p: CutPiece): void {
  if (p.img || typeof Image === 'undefined') return;
  const im = new Image();
  p.img = im;
  trackAtlas(im, p.url, () => { p.ready = true; }, () => { p.img = null; }, () => { p.img = null; p.ready = false; });
}

function resolve(id: string, inv: Inventory, world: number): void {
  const r = inv.byId(id);
  if (refusal(id, r, world) || !r) { pieces.set(id, 'no'); return; }
  const rect = frameRect(r) ?? { x: 0, y: 0, w: r.w, h: r.h };
  const p: CutPiece = { url: invDressUrl(r.file)!, sx: rect.x, sy: rect.y, sw: rect.w, sh: rect.h, fy: r.walk_y!, fx0: r.walk_x0!, fx1: r.walk_x1!, img: null, ready: false };
  pieces.set(id, p);
  resolvedCount++;
  load(p);
}

/**
 * The stage's cut pieces (other than World 1's) resolved against its world's inventory, each picture asked for (stageReady.ts calls it
 * before the first frame, so the pictures load under the title card). Never throws: a world with no inventory file draws no such piece.
 */
export async function readyInvCuts(platforms: readonly Pick<Platform, 'cut'>[] | undefined, world: number): Promise<void> {
  if (!platforms?.length) return;
  const ids = invCuts(platforms);
  if (!ids.length) return;
  // (a piece resolved on an earlier visit whose picture was let go with its world: asked for again now, not on a frame of play)
  for (const id of ids) { const p = pieces.get(id); if (p && p !== 'no' && p !== 'asking') load(p); }
  const want = ids.filter((id) => { const p = pieces.get(id); return p === undefined || p === 'asking'; });
  if (!want.length) return;
  for (const id of want) pieces.set(id, 'asking');
  try {
    const inv = await loadInventory(world);
    for (const id of want) if (pieces.get(id) === 'asking') resolve(id, inv, world);
  } catch {
    for (const id of want) if (pieces.get(id) === 'asking') pieces.delete(id);
  }
}

/** a platform's cut piece drawn, when it is one this module resolved and its picture is in; false otherwise (drawn by nothing else) */
export function drawInvCut(ctx: CanvasRenderingContext2D, p: Platform): boolean {
  const c = p.cut ? pieces.get(p.cut) : undefined;
  if (!c || c === 'no' || c === 'asking') return false;
  if (!c.img) load(c);
  if (!c.ready || !c.img) return false;
  const b = invCutBox(p, c);
  drawSheet(ctx, c.img, c.sx, c.sy, c.sw, c.sh, b.x, b.y, b.w, b.h);
  return true;
}

/** TEST-ONLY: forget every resolved piece (a test that plants cuts starts clean) */
export function resetInvCut(): void {
  pieces.clear();
  resolvedCount = 0;
}

/** a platform's cut piece, whichever world's (protoArt.ts paintedPlatforms' cut pass): World 1's atlas first, as before; else the inventory's */
export function drawPlatformCut(ctx: CanvasRenderingContext2D, p: Platform): boolean {
  return drawCutArt(ctx, p) || drawInvCut(ctx, p);
}
