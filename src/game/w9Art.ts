/**
 * w9Art — World 9's painted hazards and scenery (Hugging Face img2img from World 9's own kit, 2026-10-29: tools/art/w9/, the cuts in
 * w9ArtData.ts), replacing the code-drawn look (STAGE-RULES §4: what hurts Pokey is painted):
 *   the lava       the molten strip (crust plates riding a bright surface, the rock rim behind it) repeated along a chasm's lava line,
 *                  drifting slowly and breathing up and down, its deep below in the take's own red; heat haze wisps rise off it
 *   the geysers    the vent rock quiet, the same rock glowing with its steam as the warning (the rock shivers harder as it comes), and
 *                  the burst's three painted frames (leaving the vent, the full fountain, falling back) as the column rises and falls
 *   the scenery    Matt's World 9 set dressing (props-made w9c and its second look w9c-b: the young ohia, the smoke crack, the obsidian
 *                  spire, the charred log, the ash fern) along the basalt, and the hiding places of 9-4 (an obsidian spire, an ash fern)
 * Each draw returns false until its sheet has loaded, and the caller draws the old shapes meanwhile.
 */
import { trackAtlas } from './atlasLoader.ts';
import { KIT_FRAMES } from './kitAtlasData.ts';
import { kitUrl } from './protoArt.ts';
import type { Platform } from './types.ts';
import { W9_HAZARD_FRAMES, W9_LAVA_DEEP, W9_SCENERY_FRAMES } from './w9ArtData.ts';
import type { Zone, ZoneState } from './zones.ts';

const HAZARDS_URL = new URL('../assets/w9/hazards.webp', import.meta.url).href;
const SCENERY_URLS = {
  'w9c': new URL('../assets/w6to10/props-made/w9c.webp', import.meta.url).href,
  'w9c-b': new URL('../assets/w6to10/props-made/w9c-b.webp', import.meta.url).href,
} as const;
type SceneSheet = keyof typeof SCENERY_URLS;
export const W9_ART_URLS: readonly string[] = [HAZARDS_URL, ...Object.values(SCENERY_URLS)];

type Frame = { x: number; y: number; w: number; h: number; ax?: number; ay?: number };
const HZ = W9_HAZARD_FRAMES as Record<string, Frame | undefined>;
const SC = W9_SCENERY_FRAMES as unknown as Record<SceneSheet, Record<string, Frame>>;

const imgs = new Map<string, HTMLImageElement>();
const ready = new Set<string>();
function load(url: string): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  let im = imgs.get(url);
  if (!im) {
    im = new Image();
    imgs.set(url, im);
    trackAtlas(
      im,
      url,
      () => void ready.add(url),
      () => void imgs.delete(url),
      () => {
        imgs.delete(url);
        ready.delete(url);
      },
    );
  }
  return ready.has(url) ? im : null;
}
/** whether World 9's sheets have loaded (starts the loads) */
export function w9ArtReady(): boolean {
  return W9_ART_URLS.map((u) => load(u)).every(Boolean);
}

const hash01 = (x: number, salt: number) => {
  const s = Math.sin(x * 12.9898 + salt * 78.233) * 43758.5453;
  return s - Math.floor(s);
};

function blit(ctx: CanvasRenderingContext2D, im: HTMLImageElement, f: Frame, x: number, y: number, w: number, h: number) {
  ctx.drawImage(im, f.x, f.y, f.w, f.h, x, y, w, h);
}

// ───────────────────────────── the lava ─────────────────────────────

/** one repeat of the strip in world px (the take at half size: native pixels, never upscaled), and where its surface line sits in it */
const LAVA_TILE = 688;
const LAVA_SURFACE = 0.25;
/** a haze wisp every this many px along the lava, each on its own slow rise */
const HAZE_EVERY = 300;

/** the lava between x0 and x1, its surface at `surfaceY`, down to `bottom` (a chasm's lava line: the engine's water line in World 9) */
export function drawLava(ctx: CanvasRenderingContext2D, x0: number, x1: number, surfaceY: number, bottom: number, t: number): boolean {
  const im = load(HAZARDS_URL);
  const f = HZ.lava;
  if (!im || !f) return false;
  const th = (LAVA_TILE * f.h) / f.w;
  // (it breathes: a slow swell up and down, and drifts along)
  const top = surfaceY - th * LAVA_SURFACE + Math.sin(t * 0.9) * 2.5;
  const shift = (((t * 14) % LAVA_TILE) + LAVA_TILE) % LAVA_TILE;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x0, top - 4, x1 - x0, bottom - top + 4);
  ctx.clip();
  const g = ctx.createLinearGradient(0, top + th * 0.9, 0, Math.max(top + th, bottom));
  g.addColorStop(0, `rgb(${W9_LAVA_DEEP.join(',')})`);
  g.addColorStop(1, `rgb(${Math.round(W9_LAVA_DEEP[0] * 0.45)},${Math.round(W9_LAVA_DEEP[1] * 0.4)},${Math.round(W9_LAVA_DEEP[2] * 0.6)})`);
  ctx.fillStyle = g;
  ctx.fillRect(x0, top + th * 0.9, x1 - x0, Math.max(0, bottom - (top + th * 0.9)));
  for (let x = Math.floor((x0 - shift) / LAVA_TILE) * LAVA_TILE + shift; x < x1; x += LAVA_TILE - 1) blit(ctx, im, f, x, top, LAVA_TILE, th);
  ctx.restore();
  // heat haze rising off it (the painted wisps, each fading in and out on its own clock)
  for (let x = Math.floor(x0 / HAZE_EVERY) * HAZE_EVERY; x < x1 + HAZE_EVERY; x += HAZE_EVERY) {
    const k = Math.floor(hash01(x, 3) * 6);
    const hf = HZ[`haze${k}`];
    if (!hf) break;
    const per = 4 + 2 * hash01(x, 4);
    const u = (((t + hash01(x, 5) * per) % per) + per) % per / per;
    const w = 46 + 18 * hash01(x, 6);
    const h = (w * hf.h) / hf.w;
    const hx = x + 120 * hash01(x, 7);
    if (hx < x0 - w || hx > x1 + w) continue;
    ctx.save();
    ctx.globalAlpha = 0.55 * Math.sin(Math.PI * u);
    // (mirrored by its spot half the time, and swaying as it rises: six wisps never read as one repeated)
    ctx.translate(hx + 10 * Math.sin(t * 0.7 + x), 0);
    if (hash01(x, 8) < 0.5) ctx.scale(-1, 1);
    blit(ctx, im, hf, -w / 2, surfaceY - h - 40 * u, w, h);
    ctx.restore();
  }
  return true;
}

// ───────────────────────────── the geysers ─────────────────────────────

/** the vent rock is drawn this many times the column's width, its foot sunk this far into the ground (px) */
const VENT_K = 1.7;
const VENT_SINK = 10;

/** the vent: quiet, or glowing and steaming as its warning (a rumble that shivers it harder as the burst comes) */
export function drawW9Vent(ctx: CanvasRenderingContext2D, z: Zone, st: ZoneState, t: number): boolean {
  const im = load(HAZARDS_URL);
  const fv = HZ.vent, fw = HZ.warn;
  if (!im || !fv || !fw) return false;
  const cx = (z.x0 + z.x1) / 2;
  // (a chasm's vent is a smaller rock: its floor is narrow)
  const w = Math.min((z.x1 - z.x0) * VENT_K, z.baseY - z.top < 150 ? 100 : 999);
  const hv = (w * fv.h) / fv.w;
  const shiver = st.phase === 'warn' ? Math.sin(t * 60) * 2.2 * st.u : 0;
  ctx.save();
  blit(ctx, im, fv, cx - w / 2 + shiver, z.baseY - hv + VENT_SINK, w, hv);
  // (the glowing rock and its steam fade in over the warning, and stay while it bursts)
  const glow = st.phase === 'warn' ? Math.min(1, st.u * 1.4) : st.phase === 'active' ? 1 : 0;
  if (glow > 0) {
    const hw = (w * fw.h) / fw.w;
    ctx.globalAlpha = glow;
    blit(ctx, im, fw, cx - w / 2 + shiver, z.baseY - hw + VENT_SINK, w, hw);
  }
  ctx.restore();
  return true;
}

/** the burst: the painted fountain's three frames as the column rises, stands and falls back, sized to the column it burns */
export function drawW9Eruption(ctx: CanvasRenderingContext2D, z: Zone, st: ZoneState, _t: number): boolean {
  const im = load(HAZARDS_URL);
  const frames = [HZ.burst0, HZ.burst1, HZ.burst2];
  if (!im || frames.some((f) => !f)) return false;
  if (st.phase !== 'active') return true;
  const f = st.u < 0.18 ? frames[0]! : st.u < 0.75 ? frames[1]! : frames[2]!;
  const full = z.baseY - z.top;
  const rise = Math.min(1, st.strength * 1.25);
  const h = full * (f === frames[0] ? 0.5 : rise) + 20;
  const w = (h * f.w) / f.h;
  const cx = (z.x0 + z.x1) / 2;
  blit(ctx, im, f, cx - w / 2, z.baseY - h + 6, w, h);
  return true;
}

// ───────────────────────────── the scenery and the hiding places ─────────────────────────────

export interface W9SceneryItem {
  n: string;
  x: number;
  b: number;
  w: number;
  flip?: boolean;
}

/** one piece of set dressing standing on `b` at `x`, `w` wide, in one of the two looks (the roll of its spot picks which) */
function drawPiece(ctx: CanvasRenderingContext2D, n: string, x: number, b: number, w: number, flip: boolean, alpha = 1): boolean {
  const sheet: SceneSheet = hash01(x, 31) < 0.5 ? 'w9c' : 'w9c-b';
  const im = load(SCENERY_URLS[sheet]);
  const f = SC[sheet][n];
  if (!im || !f) return false;
  const h = (w * f.h) / f.w;
  const ax = ((f.ax ?? f.w / 2) / f.w) * w;
  ctx.save();
  if (alpha < 1) ctx.globalAlpha = alpha;
  ctx.translate(x, b + 4);
  if (flip) ctx.scale(-1, 1);
  blit(ctx, im, f, -ax, -h, w, h);
  ctx.restore();
  return true;
}

/** the set dressing in view (behind the basalt's front lip: drawn before the platforms) */
export function drawW9Scenery(ctx: CanvasRenderingContext2D, items: readonly W9SceneryItem[] | undefined, x0: number, x1: number): void {
  for (const it of items ?? []) {
    if (it.x + it.w < x0 - 100 || it.x - it.w > x1 + 100) continue;
    drawPiece(ctx, it.n, it.x, it.b, it.w, !!it.flip);
  }
}

/** a hiding place drawn as its painted piece (an obsidian spire, an ash fern), see-through enough with him inside it */
export function drawW9Bush(ctx: CanvasRenderingContext2D, b: { x: number; w: number; y: number; look?: string }, inside: boolean, rustle: number, t: number): boolean {
  if (!b.look) return false;
  const lean = Math.sin(t * 22) * 0.04 * rustle;
  ctx.save();
  ctx.translate(b.x + b.w / 2, b.y);
  ctx.transform(1, 0, lean, 1, 0, 0);
  const ok = drawPiece(ctx, b.look, 0, -4, b.w * 1.1, false, inside ? 0.62 : 1);
  ctx.restore();
  return ok;
}

// ───────────────────────────── the cracked basalt ─────────────────────────────

/**
 * A crumbling tile in World 9 (Platform.art 'basalt'): the kit's cracked slab with its glowing seams at rest (a kid sees it will break
 * before he steps on it), shivering harder as its hold runs out, and in its last third split in two (the kit's broken halves) drifting
 * apart. Drawn a little wider than the tile, its top on the tile's top.
 */
export function drawW9Crumble(ctx: CanvasRenderingContext2D, p: Platform, t: number): boolean {
  const im = load(kitUrl(9));
  const K = KIT_FRAMES[9];
  const cr = K?.branchCreak, sl = K?.snapL, sr = K?.snapR;
  if (!im || !cr || !sl || !sr) return false;
  const prog = p.fragileTimer === undefined || !p.crumbleAfter ? 0 : Math.max(0, Math.min(1, 1 - p.fragileTimer / p.crumbleAfter));
  const w = p.width * 1.18;
  const x = p.x - (w - p.width) / 2;
  ctx.save();
  if (prog > 0) ctx.translate(Math.sin(t * 70) * 2.2 * prog, Math.sin(t * 83) * 1.2 * prog);
  if (prog < 0.66) {
    blit(ctx, im, cr, x, p.y - 4, w, (w * cr.h) / cr.w);
  } else {
    const k = (prog - 0.66) / 0.34;
    const hw = w / 2;
    blit(ctx, im, sl, x - 6 * k, p.y - 4 + 3 * k, hw, (hw * sl.h) / sl.w);
    blit(ctx, im, sr, x + hw + 6 * k, p.y - 4 + 5 * k, hw, (hw * sr.h) / sr.w);
  }
  ctx.restore();
  return true;
}
