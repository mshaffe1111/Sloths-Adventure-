/**
 * invDress — ANY inventory piece placed as dressing by a stage's data (ENG-DR, the lead's ruling 8:19 PM 11-14: "a stage's data places any
 * inventory piece as dressing, hung by its top or standing, at its inventory scale"; Matt 11-11, CLAUDE.md "Inventory first" and "To scale
 * with Pokey", R-165.104 and R-165.107). Any stage, any world: a row names the piece by its catalog id and says where it goes; nothing
 * else. Its size is the inventory's own: drawn `pokey_scale` x Pokey's drawn height tall (the file's pokey_units, 89.1:
 * heroSprite.ts HERO_UNITS x HERO_SPRITE_SCALE), its width by its picture's shape. A row cannot size a piece: a piece that reads wrong
 * at its scale is the catalog's to fix, never the stage's.
 *
 * The gate (invDressBreaches, run on every listed stage by invDress.test.ts) refuses a row by name: an id its world's inventory lacks,
 * a piece out of scale with Pokey (the catalog's scale_ok false), one with no fixed size, one waiting on a fix, a made thing in World 1,
 * or a picture the build does not ship (invDressArt.ts).
 *
 * Drawing (PERFORMANCE-RULES §1, §2): before the first frame the stage's rows are resolved against its world's inventory and each
 * picture is asked for (stageReady.ts readyBuiltStage -> readyInvDress), so it loads and decodes under the title card (atlasLoader's
 * pendingSheets is waited for there). A frame pays one drawImage per piece in view (sheetBake.ts drawSheet), with no allocation and no
 * per-frame lookup but one Map get a row. A row the gate refuses is never drawn. Pictures only: nothing here touches play.
 */
import { trackAtlas } from '../atlasLoader.ts';
import { drawSheet } from '../sheetBake.ts';
import { loadInventory, usable, type ArtRow, type Inventory } from './inventory.ts';
import { invDressFolders, invDressUrl } from './invDressArt.ts';

/** one inventory piece set in a stage as dressing (world data: proto.invDress, written by a stage's finish) */
export interface InvDress {
  /** the piece's catalog id, exactly as its world's inventory has it (src/game/art/inventory/w<N>.json `id`, e.g. 'hf18/hf18-palm-crown') */
  inv: string;
  /** its middle's x (world px) */
  x: number;
  /** hung: its top's y (it hangs by its top); standing: its foot's y (it stands on the ground there) */
  y: number;
  hang: boolean;
  /** 'behind': behind the play layer, drawn before the platforms, the vines, the pickups and Pokey (nothing covers where he acts, D10) */
  layer: 'behind';
}

/** the layers a row may ask for */
export const INV_DRESS_LAYERS: ReadonlySet<string> = new Set(['behind']);

/** a catalog frame's rect on its sheet ('name (x,y wxh)'), or null for a whole picture; undefined when the frame gives no rect */
export function frameRect(r: Pick<ArtRow, 'frame' | 'w' | 'h'>): { x: number; y: number; w: number; h: number } | null | undefined {
  if (r.frame === null) return null;
  const m = /\((\d+),(\d+) (\d+)x(\d+)\)\s*$/.exec(r.frame);
  return m ? { x: Number(m[1]), y: Number(m[2]), w: Number(m[3]), h: Number(m[4]) } : undefined;
}

/** a piece's drawn size (world px), from the inventory's scale against Pokey's drawn height; null when it has no fixed height */
export function invDressSize(r: Pick<ArtRow, 'pokey_scale' | 'w' | 'h'>, pokeyUnits: number): { w: number; h: number } | null {
  if (r.pokey_scale === null || !(r.pokey_scale > 0) || !(r.w > 0) || !(r.h > 0) || !(pokeyUnits > 0)) return null;
  const h = r.pokey_scale * pokeyUnits;
  return { w: (h * r.w) / r.h, h };
}

/** why the inventory row `r` (asked for by id `id` in world `world`) cannot be placed as dressing, or undefined when it can */
function refusal(id: string, r: ArtRow | undefined, inv: Inventory, world: number): string | undefined {
  if (!r) return `'${id}' is in no row of World ${world}'s inventory (src/game/art/inventory/w${world}.json): name it by its catalog id, in a world it fits`;
  if (world === 1 && r.made_thing) return `'${id}' is a made thing: never World 1 art (Matt 11-11)`;
  if (!usable(r)) return `'${id}' is waiting on a fix (${r.status})`;
  if (r.scale_ok === false) return `'${id}' is out of scale with Pokey: drawn ${r.pokey_scale} of his height, outside its layer '${r.layer}' range (R-165.107)`;
  if (!invDressSize(r, inv.pokeyUnits)) return `'${id}' has no fixed size against Pokey (pokey_scale ${r.pokey_scale}: drawn to fit, tiled, or not level art)`;
  if (frameRect(r) === undefined) return `'${id}' is a frame with no rect on its sheet (${r.frame})`;
  if (!invDressUrl(r.file)) return `'${id}': its picture ${r.file} is not in the build (src/game/art/invDressArt.ts ships ${invDressFolders().join(', ')})`;
  return undefined;
}

/**
 * Every way a stage's dressing rows break the rule, by name (the gate): `inv` is the stage's world's inventory (loadInventory(world)).
 * A row's id its world's inventory lacks, a piece the catalog has out of scale with Pokey, one with no fixed size, a layer not offered.
 */
export function invDressBreaches(rows: readonly InvDress[], inv: Inventory, world: number): string[] {
  const out: string[] = [];
  for (const d of rows) {
    const at = `dressing at x ${Math.round(d.x)}`;
    if (!Number.isFinite(d.x) || !Number.isFinite(d.y)) out.push(`${at}: '${d.inv}' has no place (x ${d.x}, y ${d.y})`);
    if (!INV_DRESS_LAYERS.has(d.layer)) out.push(`${at}: '${d.inv}' asks for layer '${d.layer}' (offered: ${[...INV_DRESS_LAYERS].join(', ')})`);
    const why = refusal(d.inv, inv.byId(d.inv), inv, world);
    if (why) out.push(`${at}: ${why}`);
  }
  return out;
}

/** a resolved piece: its picture (loaded through atlasLoader, let go with its world and reloaded if the phone takes it back) and size */
interface Piece {
  url: string;
  /** its rect on its picture */
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  /** drawn size (world px) */
  w: number;
  h: number;
  img: HTMLImageElement | null;
  ready: boolean;
}
/** by catalog id: a piece, 'no' (the gate refuses it: never drawn) or 'asking' (its world's inventory is on its way) */
const pieces = new Map<string, Piece | 'no' | 'asking'>();
let resolvedCount = 0;
/** how many rows have been resolved against an inventory (a test reads it: once a piece, never a frame) */
export const invDressResolves = (): number => resolvedCount;

function load(p: Piece): void {
  if (p.img || typeof Image === 'undefined') return;
  const im = new Image();
  p.img = im;
  trackAtlas(im, p.url, () => { p.ready = true; }, () => { p.img = null; }, () => { p.img = null; p.ready = false; });
}

function resolve(id: string, inv: Inventory, world: number): void {
  const r = inv.byId(id);
  if (refusal(id, r, inv, world) || !r) { pieces.set(id, 'no'); return; }
  const size = invDressSize(r, inv.pokeyUnits)!;
  const rect = frameRect(r) ?? { x: 0, y: 0, w: r.w, h: r.h };
  const p: Piece = { url: invDressUrl(r.file)!, sx: rect.x, sy: rect.y, sw: rect.w, sh: rect.h, w: size.w, h: size.h, img: null, ready: false };
  pieces.set(id, p);
  resolvedCount++;
  load(p);
}

/**
 * The stage's rows resolved against its world's inventory, each picture asked for (stageReady.ts calls it before the first frame, so
 * the pictures load under the title card). Never throws: a world with no inventory file draws no dressing.
 */
export async function readyInvDress(rows: readonly InvDress[] | undefined, world: number): Promise<void> {
  if (!rows?.length) return;
  const want = [...new Set(rows.map((d) => d.inv))].filter((id) => { const p = pieces.get(id); return p === undefined || p === 'asking'; });
  if (!want.length) return;
  for (const id of want) pieces.set(id, 'asking');
  try {
    const inv = await loadInventory(world);
    for (const id of want) if (pieces.get(id) === 'asking') resolve(id, inv, world);
  } catch {
    for (const id of want) if (pieces.get(id) === 'asking') pieces.delete(id);
  }
}

/** the rows on `layer` in view; a piece not resolved yet asks for its world's inventory (a stage made without stageReady) and draws later */
export function drawInvDress(ctx: CanvasRenderingContext2D, rows: readonly InvDress[], view: { x0: number; x1: number; y0: number; y1: number }, world: number, layer: InvDress['layer']): void {
  let ask = false;
  for (let i = 0; i < rows.length; i++) {
    const d = rows[i];
    if (d.layer !== layer) continue;
    const p = pieces.get(d.inv);
    if (p === undefined) { ask = true; continue; }
    if (p === 'no' || p === 'asking') continue;
    if (!p.img) load(p);
    if (!p.ready || !p.img) continue;
    const top = d.hang ? d.y : d.y - p.h;
    const x0 = d.x - p.w / 2;
    if (x0 > view.x1 + 20 || x0 + p.w < view.x0 - 20 || top > view.y1 + 20 || top + p.h < view.y0 - 20) continue;
    drawSheet(ctx, p.img, p.sx, p.sy, p.sw, p.sh, x0, top, p.w, p.h);
  }
  if (ask) void readyInvDress(rows, world);
}

/** TEST-ONLY: forget every resolved piece (a test that plants rows starts clean) */
export function resetInvDress(): void {
  pieces.clear();
  resolvedCount = 0;
}
