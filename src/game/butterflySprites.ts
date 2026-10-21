/**
 * Painted butterflies with wings that really beat. The backdrop butterflies used to be two bezier wings squashed in and out; these
 * are eight painted species (morpho, monarch, swallowtail, glider, owl, emerald swallowtail, julia, glasswing), each cut as five wing
 * frames that play in a loop. The four species whose sheets show folded wings get a little wing squash on top, so they still flutter.
 *
 * A switch like the other painted art: `?butterflies=classic` (or `localStorage.sloth_butterflies = 'classic'`) brings the vector
 * butterflies back, and they are also what shows until the atlas has loaded (draw returns false).
 */
import { trackAtlas } from './atlasLoader.ts';
import { BUTTERFLY_FRAMES } from './butterflyAtlasData.ts';

export const DEFAULT_SPRITE_BUTTERFLIES = true;

interface Species {
  /** longest side of the species' biggest frame, in world units at a 720-high view */
  size: number;
  /** the sheet shows folded wings: add a squash so the wings still beat */
  folded?: boolean;
}

export const BUTTERFLY_SPECIES: Record<string, Species> = {
  morpho: { size: 38 },
  monarch: { size: 36 },
  swallow: { size: 40 },
  glider: { size: 34 },
  owl: { size: 30, folded: true },
  emerald: { size: 36, folded: true },
  julia: { size: 28, folded: true },
  glass: { size: 28, folded: true },
};

/**
 * which species fly in which world (the backdrop fauna of W1, W3, W5, W7, W8 and W10 are butterflies). The two night caves (W3, W8)
 * fly the pale glasswing and the dusky owl butterfly where vector moths used to flutter, and the storm keep (W10) a pair of glasswings.
 */
const WORLD_SPECIES: Record<number, string[]> = {
  1: ['morpho', 'monarch', 'swallow', 'julia'],
  3: ['glass', 'owl', 'glass'],
  5: ['glass', 'emerald', 'glider', 'owl'],
  7: ['monarch', 'julia', 'swallow', 'owl'],
  8: ['owl', 'glass', 'glass'],
  10: ['glass', 'morpho'],
};
const DEFAULT_SPECIES = ['monarch', 'morpho', 'swallow', 'julia'];

const FRAMES_PER_CYCLE = 5;
/** wing beats per second */
const BEAT_RATE = 2.6;

let enabled: boolean | null = null;
function isEnabled(): boolean {
  if (enabled !== null) return enabled;
  let v = DEFAULT_SPRITE_BUTTERFLIES;
  try {
    const q = new URLSearchParams(location.search).get('butterflies');
    if (q === 'sprite') v = true;
    else if (q === 'classic') v = false;
    else if (localStorage.getItem('sloth_butterflies') === 'classic') v = false;
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
  trackAtlas(img, new URL('../assets/flora/butterflies-atlas.webp', import.meta.url).href, () => { ready = true; }, () => { atlas = null; });
}

/** the species butterfly number `i` is in a world */
export function butterflySpecies(world: number, i: number): string {
  const list = WORLD_SPECIES[world] ?? DEFAULT_SPECIES;
  return list[Math.abs(i) % list.length];
}

/** the biggest side of any frame of a species, so every frame of it is drawn at the same scale */
const biggest: Record<string, number> = {};
function biggestSide(sp: string): number {
  if (biggest[sp] !== undefined) return biggest[sp];
  let m = 1;
  for (let k = 0; k < FRAMES_PER_CYCLE; k++) {
    const f = BUTTERFLY_FRAMES[`${sp}_${k}`];
    if (f) m = Math.max(m, f.w, f.h);
  }
  biggest[sp] = m;
  return m;
}

/**
 * draws butterfly `i` of a world centred on (x, y). `variation` (about 0.85-1.2) varies the size, `sc` is the view scale (vh / 720),
 * `heading` is the horizontal direction it flies (the frames face left, so it is mirrored when it flies right), `tilt` leans it
 * into the climb. Returns false when painted butterflies are off or not loaded yet.
 */
export function drawPaintedButterfly(
  ctx: CanvasRenderingContext2D, world: number, i: number, x: number, y: number, time: number, sc: number, variation: number, heading: number, tilt: number,
): boolean {
  if (!isEnabled()) return false;
  load();
  if (!ready || !atlas) return false;
  const sp = butterflySpecies(world, i);
  const info = BUTTERFLY_SPECIES[sp];
  const phase = time * BEAT_RATE + i * 0.37;
  const frame = Math.floor((phase - Math.floor(phase)) * FRAMES_PER_CYCLE) % FRAMES_PER_CYCLE;
  const f = BUTTERFLY_FRAMES[`${sp}_${frame}`];
  if (!info || !f) return false;
  const k = ((info.size * 0.8 * sc * variation) / biggestSide(sp));
  const squash = info.folded ? 0.8 + 0.2 * Math.abs(Math.cos(phase * Math.PI)) : 1;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.scale(heading > 0 ? -squash : squash, 1);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(atlas, f.x, f.y, f.w, f.h, (-f.w * k) / 2, (-f.h * k) / 2, f.w * k, f.h * k);
  ctx.restore();
  return true;
}
