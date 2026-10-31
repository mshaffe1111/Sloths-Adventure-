/**
 * World 9's moving logs (gen2 place `raft`, GRAB-BAG.md N1-N3; lift.ts LiftInfo `bob`), drawn in Matt's painted World 9 pieces:
 *   raft    the pumice raft of the W9 props sheet (props-made/w9b 'pumice-raft'), riding the lava's heat draught (the haze frames under it)
 *   log     the charred log of the W9/W10 bridges sheet, longer and slower, the same draught under it
 *   piston  the hex column of the W9 props sheet, its glowing cap the top he stands on, its shaft running down into its well
 *   sink    the cooled ember slab of the W9/W10 bridges sheet, sinking while he stands on it (GRAB-BAG.md N4)
 * Each is drawn where the engine has it now (the platform's y moves with lift.ts liftY); nothing is drawn in code but the draught's fade.
 * Until the sheets load, the platform is drawn as a plain slab so the stage stays playable (and never unseen).
 */
import type { Platform } from './types.ts';
import { drawW9Draught } from './w9Art.ts';
import { W9_BRIDGE_CELLS, W9B_HEX_COLUMN } from './w9SwingArt.ts';

const W9B_URL = new URL('../assets/w6to10/props-made/w9b.webp', import.meta.url).href;
const BRIDGES_URL = new URL('../assets/w6to10/gemini/w9w10-bridges.webp', import.meta.url).href;
export const W9_BOB_URLS: readonly string[] = [W9B_URL, BRIDGES_URL];

/** props-made/w9b.json 'pumice-raft' (its foot's middle is the anchor); the walkable top lies `top` of its height down */
const RAFT = { x: 0, y: 0, w: 426, h: 115, top: 0.2 } as const;
/** the bridges sheet's charred log; its top lies `top` of its height down (under the sprigs) */
const LOG = { ...W9_BRIDGE_CELLS.charredLog, top: 0.3 } as const;
/** the hex column's cap (the glowing top) is the first `cap` px of the cell; the rest is shaft, repeated down the well */
const COLUMN = { ...W9B_HEX_COLUMN, cap: 70 } as const;

const imgs = new Map<string, HTMLImageElement>();
const ok = new Set<string>();
function load(url: string): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  let im = imgs.get(url);
  if (!im) {
    im = new Image();
    im.onload = () => ok.add(url);
    im.src = url;
    imgs.set(url, im);
  }
  return ok.has(url) ? im : null;
}
/** start loading the sheets (a World 9 stage with moving logs calls it as it starts) */
export function loadW9Bobs(): void {
  for (const u of W9_BOB_URLS) load(u);
}
export const w9BobsReady = (): boolean => W9_BOB_URLS.every((u) => ok.has(u));

/** one moving log where it is now; `t` the game time (the draught's shimmer) */
export function drawW9Bob(ctx: CanvasRenderingContext2D, pl: Platform, t: number): void {
  const l = pl.lift;
  if (!l?.bob) return;
  const cx = pl.x + pl.width / 2;
  if (l.bob === 'piston') {
    const im = load(W9B_URL);
    // (the shaft runs from the cap down past where the column rests at its bottom, into the well under the bank's top)
    const s = (pl.width + 16) / COLUMN.w;
    const w = COLUMN.w * s;
    const x = cx - w / 2;
    const foot = l.bottom + 260;
    if (!im) return void slab(ctx, pl, '#3b3a40', foot);
    const capH = COLUMN.cap * s;
    const y0 = pl.y - 6 * s;
    ctx.drawImage(im, COLUMN.x, COLUMN.y, COLUMN.w, COLUMN.cap, x, y0, w, capH);
    const shaftSrc = COLUMN.h - COLUMN.cap - 20;
    const tile = shaftSrc * s;
    for (let y = y0 + capH - 1; y < foot; y += tile - 1) {
      const h = Math.min(tile, foot - y);
      ctx.drawImage(im, COLUMN.x, COLUMN.y + COLUMN.cap, COLUMN.w, h / s, x, y, w, h);
    }
    return;
  }
  if (l.bob === 'sink') {
    // (the ember slab of the bridges sheet, its glowing underside toward the lava; no draught: it rides on nothing but its own weight)
    const imS = load(BRIDGES_URL);
    const c = W9_BRIDGE_CELLS.emberSlab;
    const w = pl.width + 24;
    const h = (c.h * w) / c.w;
    if (!imS) return void slab(ctx, pl, '#3a2a28', pl.y + pl.height);
    ctx.drawImage(imS, c.x, c.y, c.w, c.h, cx - w / 2, pl.y - h * 0.18, w, h);
    return;
  }
  const raft = l.bob === 'raft';
  const cell = raft ? RAFT : LOG;
  const im = load(raft ? W9B_URL : BRIDGES_URL);
  const w = pl.width + (raft ? 34 : 40);
  const h = (cell.h * w) / cell.w;
  const y = pl.y - cell.top * h;
  // (the draught under it: from its bottom stop's underside down into the chasm, so it is there wherever the log is in its ride)
  drawW9Draught(ctx, cx, pl.y + h * 0.5, l.bottom + 260, Math.min(160, w * 0.55), t);
  if (!im) return void slab(ctx, pl, raft ? '#4a4a52' : '#2c2622', pl.y + pl.height);
  ctx.drawImage(im, cell.x, cell.y, cell.w, cell.h, pl.x + pl.width / 2 - w / 2, y, w, h);
}

/** the stand-in while the sheet loads */
function slab(ctx: CanvasRenderingContext2D, pl: Platform, fill: string, bottom: number) {
  ctx.fillStyle = fill;
  ctx.fillRect(pl.x, pl.y, pl.width, Math.max(pl.height, bottom - pl.y));
}
