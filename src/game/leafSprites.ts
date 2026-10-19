/**
 * Painted falling leaves for the backdrop weather (Worlds 1 and 7). The old leaves were little coloured ellipses that spun; these are
 * painted leaves cut from the leaf sheets: small green and warm autumn ones that fall, and a few big monstera / banana / palm leaves
 * that drift slowly past. A switch like the other painted art: `?leaves=classic` brings the ellipses back, and the ellipses are
 * also what shows until the atlas has loaded (draw returns false).
 */
import { trackAtlas } from './atlasLoader.ts';
import { LEAF_FRAMES, type LeafFrame } from './leafAtlasData.ts';

export const DEFAULT_SPRITE_LEAVES = true;

type SetName = 'green' | 'warm' | 'big';
const BY_SET: Record<SetName, string[]> = { green: [], warm: [], big: [] };
for (const [k, f] of Object.entries(LEAF_FRAMES)) BY_SET[f.set].push(k);

/** how the falling leaves of a world are mixed (shares add up to 1), and how many of the 30 motes are big drifters */
const MIX: Record<number, { green: number; warm: number; big: number }> = {
  1: { green: 0.8, warm: 0.1, big: 0.1 },
  7: { green: 0.26, warm: 0.66, big: 0.08 },
};

let enabled: boolean | null = null;
function isEnabled(): boolean {
  if (enabled !== null) return enabled;
  let v = DEFAULT_SPRITE_LEAVES;
  try {
    const q = new URLSearchParams(location.search).get('leaves');
    if (q === 'sprite') v = true;
    else if (q === 'classic') v = false;
    else if (localStorage.getItem('sloth_leaves') === 'classic') v = false;
  } catch {
    /* no window or storage: keep the default */
  }
  enabled = v;
  return v;
}

let atlas: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (atlas || typeof Image === 'undefined') return;
  const img = new Image();
  atlas = img;
  trackAtlas(img, new URL('../assets/flora/leaves-atlas.webp', import.meta.url).href, () => { ready = true; }, () => { atlas = null; });
}

/** which leaf a mote is (stable for the mote), given its random number c */
export function leafFor(world: number, c: number): { key: string; big: boolean } {
  const mix = MIX[world] ?? MIX[1];
  const u = (c % 1000) / 1000;
  const set: SetName = u < mix.big ? 'big' : u < mix.big + mix.warm ? 'warm' : 'green';
  const list = BY_SET[set].length ? BY_SET[set] : BY_SET.green;
  return { key: list[Math.floor(c / 7) % list.length], big: set === 'big' };
}

/**
 * draws mote `m` at (x, y): a leaf that tumbles (spins slowly while flipping over as it falls).
 * `vs` is the view scale (vh / 720). Returns false when painted leaves are off or not loaded yet.
 */
export function drawPaintedLeaf(
  ctx: CanvasRenderingContext2D, world: number, m: { s: number; p: number; c: number }, x: number, y: number, time: number, vs: number, alpha: number,
): boolean {
  if (!isEnabled()) return false;
  load();
  if (!ready || !atlas) return false;
  const { key, big } = leafFor(world, m.c);
  const f: LeafFrame | undefined = LEAF_FRAMES[key];
  if (!f) return false;
  const size = (big ? 24 + m.s * 14 : 10 + m.s * 8) * vs;
  const k = size / Math.max(f.w, f.h);
  const flip = 0.4 + 0.6 * Math.abs(Math.cos(time * (big ? 0.5 : 0.9) * m.s + m.p));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(time * 0.7 * m.s + m.p) * 0.9 + m.p);
  ctx.scale(flip, 1);
  ctx.globalAlpha = alpha * (big ? 0.88 : 0.95);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(atlas, f.x, f.y, f.w, f.h, (-f.w * k) / 2, (-f.h * k) / 2, f.w * k, f.h * k);
  ctx.restore();
  return true;
}
