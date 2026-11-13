/**
 * dressArt — the stage dressing for Worlds 1, 2 and 5 (hf-art-ground, 2026-10-29; polish report VI-17): one small sheet
 * (props/dress.webp, dressAtlasData.ts) of the pieces artDress.ts dressSets lays out: bank sets at the ends of the banks, hanging moss
 * and orchids under the ledges, clutter along the long floors. Pictures only, behind Pokey. Loaded with the stage ('dress' in
 * stageSheets.ts) and let go with its world (atlasLoader.ts); nothing draws until it is in.
 */
import { trackAtlas } from './atlasLoader.ts';
import { DRESS_FRAMES, type DressName } from './dressAtlasData.ts';
import { DRESS_NEW_FRAMES, DRESS_NEW_URLS, type DressNewName } from './dressNewData.ts';
import { drawSheet } from './sheetBake.ts';
import type { Platform } from './types.ts';

export const DRESS_URL = new URL('../assets/props/dress.webp', import.meta.url).href;
let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(im, DRESS_URL, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; });
}
/** whether the dressing sheet has loaded (starts the load) */
export function dressReady(): boolean {
  load();
  return ready && !!img;
}

/**
 * hf-props (2026-10-31): Worlds 1-7's new dressing, one small sheet per world (dressNewData.ts, src/assets/props/dressnew-w<N>.webp),
 * loaded with the stage ('dress:<N>' in stageSheets.ts) and drawn by the same call as the first sheet's pieces.
 */
export type AnyDress = DressName | DressNewName | OneName;
type Frame = { x: number; y: number; w: number; h: number; units: number; hang?: boolean; world?: number; one?: OneName; sink?: number };
const frameOf = (n: AnyDress): Frame => ((DRESS_FRAMES as Record<string, Frame>)[n] ?? (DRESS_NEW_FRAMES as Record<string, Frame>)[n] ?? ONE_FRAMES[n as OneName]);

/**
 * ART's one-picture pieces (11-13, the inventory's hf1113/w15-*: src/game/art/inventory/w1.json), each its own small file, loaded the first
 * time a stage draws it. Sized against Pokey (his drawn 89.1, the inventory's pokey_scale): `units` its width, from its row's
 * pokey_scale x 89.1 x w / h; `sink`, how far its picture runs under the ground it stands on (the root tunnel's earth slab under its floor,
 * the row's walk_y). dressArt.test.ts holds every size equal to its inventory row.
 */
export const ONE_DRESS = {
  'w15-leafsign-up': { url: new URL('../assets/w1-1113/w15-leafsign-up.webp', import.meta.url).href, w: 172, h: 210, scale: 0.79 },
  'w15-leafsign-down': { url: new URL('../assets/w1-1113/w15-leafsign-down.webp', import.meta.url).href, w: 113, h: 210, scale: 0.79 },
  'w15-leafsign-right': { url: new URL('../assets/w1-1113/w15-leafsign-right.webp', import.meta.url).href, w: 240, h: 210, scale: 0.79 },
  'w15-mark-right': { url: new URL('../assets/w1-1113/w15-mark-right.webp', import.meta.url).href, w: 114, h: 132, scale: 0.49 },
  'w15-mark-up': { url: new URL('../assets/w1-1113/w15-mark-up.webp', import.meta.url).href, w: 114, h: 132, scale: 0.49 },
  'w15-leafcurtain': { url: new URL('../assets/w1-1113/w15-leafcurtain.webp', import.meta.url).href, w: 632, h: 450, scale: 1.68, hang: true },
  'w15-roottunnel': { url: new URL('../assets/w1-1113/w15-roottunnel.webp', import.meta.url).href, w: 839, h: 540, scale: 2.02, walkY: 460 },
} as const satisfies Record<string, { url: string; w: number; h: number; scale: number; hang?: true; walkY?: number }>;
export type OneName = keyof typeof ONE_DRESS;
/** her mark's middle, px over the ground it is cut at (marching height: her chest, a sloth her size; the pickup glows there) */
export const MARK_RISE = 48;
/** the bark patch for her arrow (Collectible.arrow) */
export const markPatch = (arrow: 'up' | 'on' | undefined): OneName => (arrow === 'up' ? 'w15-mark-up' : 'w15-mark-right');
/** his drawn standing height (heroSprite.ts; the inventory's pokey_units): a piece's pokey_scale is a share of it */
const POKEY_H = 89.1;
const ONE_FRAMES = Object.fromEntries(Object.entries(ONE_DRESS).map(([n, d]) => {
  const h = d.scale * POKEY_H;
  return [n, { x: 0, y: 0, w: d.w, h: d.h, units: (h * d.w) / d.h, one: n as OneName, ...('hang' in d ? { hang: true } : {}), ...('walkY' in d ? { sink: (h * (d.h - d.walkY)) / d.h } : {}) }];
})) as Record<OneName, Frame>;
const oneImgs = new Map<OneName, HTMLImageElement>();
const oneReady = new Set<OneName>();
/** whether a one-picture piece has loaded (starts the load; the phone taking it back reloads it: atlasLoader.ts) */
function oneLoaded(n: OneName): HTMLImageElement | null {
  if (!oneImgs.has(n) && typeof Image !== 'undefined') {
    const im = new Image();
    oneImgs.set(n, im);
    trackAtlas(im, ONE_DRESS[n].url, () => { oneReady.add(n); }, () => { oneImgs.delete(n); }, () => { oneImgs.delete(n); oneReady.delete(n); });
  }
  return oneReady.has(n) ? oneImgs.get(n) ?? null : null;
}
const newImgs = new Map<number, HTMLImageElement>();
const newReady = new Set<number>();
/** the address of a world's new dressing sheet (none for a world without one) */
export function dressNewUrl(world: number): string | undefined {
  return DRESS_NEW_URLS[world];
}
/** whether a world's new dressing sheet has loaded (starts the load) */
export function dressNewReady(world: number): boolean {
  const url = DRESS_NEW_URLS[world];
  if (!url) return false;
  if (!newImgs.has(world) && typeof Image !== 'undefined') {
    const im = new Image();
    newImgs.set(world, im);
    trackAtlas(im, url, () => { newReady.add(world); }, () => { newImgs.delete(world); }, () => { newImgs.delete(world); newReady.delete(world); });
  }
  return newReady.has(world) && newImgs.has(world);
}

/** one piece set in a stage: `x` its middle; `b` the ground under its foot, or for a hanging piece the underside it hangs from */
export interface DressPiece {
  n: AnyDress;
  x: number;
  b: number;
  flip?: boolean;
  alpha?: number;
}

/** a piece's size in the game (world units) */
export function dressSize(n: AnyDress): { w: number; h: number } {
  const f = frameOf(n);
  return { w: f.units, h: (f.units * f.h) / f.w };
}

/** one of ART's one-picture pieces at its size, its middle at (cx, cy); false until its picture is in */
export function drawOne(ctx: CanvasRenderingContext2D, n: OneName, cx: number, cy: number): boolean {
  const im = oneLoaded(n);
  if (!im) return false;
  const { w, h } = dressSize(n);
  drawSheet(ctx, im, 0, 0, ONE_DRESS[n].w, ONE_DRESS[n].h, cx - w / 2, cy - h / 2, w, h);
  return true;
}

/** the dressing in view; nothing until the sheet has loaded */
export function drawDress(ctx: CanvasRenderingContext2D, items: readonly DressPiece[], view: { x0: number; x1: number; y0: number; y1: number }) {
  if (!items.length) return;
  // (the first sheet is asked for only by a stage that has its pieces: Worlds 3, 4, 6 and 7 use only their new sheets)
  let old: boolean | undefined;
  for (const d of items) {
    const f = frameOf(d.n);
    // (a piece of a world's new sheet waits for that sheet; the first sheet's for the first)
    const sheet = f.one ? oneLoaded(f.one) : f.world ? (dressNewReady(f.world) ? newImgs.get(f.world)! : null) : (old ??= dressReady()) ? img! : null;
    if (!sheet) continue;
    const { w, h } = dressSize(d.n);
    const top = f.hang ? d.b : d.b - h + (f.sink ?? 0);
    if (d.x + w < view.x0 - 20 || d.x - w > view.x1 + 20 || top > view.y1 + 20 || top + h < view.y0 - 20) continue;
    ctx.save();
    ctx.translate(d.x, top);
    if (d.flip) ctx.scale(-1, 1);
    if (d.alpha !== undefined) ctx.globalAlpha *= d.alpha;
    drawSheet(ctx, sheet, f.x, f.y, f.w, f.h, -w / 2, 0, w, h);
    ctx.restore();
  }
}

/** how far a leaf-sign stands from a flag (px, middle to middle): the flag's pole and its heart beside it, then the sign */
export const SIGN_FLAG_GAP = 80;
/**
 * No leaf-sign stands on a flag (the Easy still, 11-13: a flag and its heart covered the exit's second sign). The flag pass lays flags on
 * any bank after the props, so a sign a flag came down beside steps aside along its own bank, to whichever side of the flag keeps it
 * on that bank and clear of every flag; with no such spot it stays (the test names it). World 1's finish runs it, and Easy's pass again
 * after its own flags (easyMode.ts easyStage). Returns the stage.
 */
export function signsClearOfFlags<T extends { platforms: readonly Platform[]; checkpoints?: ReadonlyArray<{ x: number; y: number }>; proto?: { dress?: DressPiece[] }; dress?: DressPiece[] }>(st: T): T {
  const flags = st.checkpoints ?? [];
  const all = st.proto?.dress ?? st.dress ?? [];
  for (const d of all) {
    if (!String(d.n).startsWith('w15-leafsign')) continue;
    const on = st.platforms.find((q) => q.type !== 'fragile' && q.y === d.b && d.x >= q.x && d.x <= q.x + q.width);
    const near = (x: number) => flags.find((f) => Math.abs(f.x - x) < SIGN_FLAG_GAP && Math.abs(f.y - d.b) <= 80);
    // (nor onto another sign of the bank: beat 1's two stand side by side)
    const signed = (x: number) => all.some((o) => o !== d && String(o.n).startsWith('w15-leafsign') && o.b === d.b && Math.abs(o.x - x) < 70);
    const f = near(d.x);
    if (!f || !on) continue;
    const w = 50;
    const to = [f.x + SIGN_FLAG_GAP, f.x - SIGN_FLAG_GAP].find((x) => x - w / 2 >= on.x && x + w / 2 <= on.x + on.width && !near(x) && !signed(x));
    if (to !== undefined) d.x = Math.round(to);
  }
  return st;
}
