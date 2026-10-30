/**
 * Painted birds for the backdrop. The distant birds used to be coloured shapes (a toucan was an ellipse with an orange wedge); these
 * are twelve painted species with four wing poses each (up, mid-up, mid-down, down) that play as a flap loop: hummingbird, tanager,
 * warbler, bananaquit, scarlet macaw, toco toucan, quetzal, cock-of-the-rock, harpy eagle, keel-billed toucan, Andean cock-of-the-rock
 * and bellbird. Each world flies the ones that fit it (macaws and toucans over the canopy, quetzals and harpy eagles on the cliffs,
 * hummingbirds in the cloud forest).
 *
 * A switch like the other painted art: `?birds=classic` (or `localStorage.sloth_birds = 'classic'`) brings the vector birds back, and
 * they are also what shows until the atlas has loaded (every draw returns false so the caller can fall back).
 */
import { trackAtlas } from './atlasLoader.ts';
import { BIRD_FRAMES } from './birdAtlasData.ts';
import { rng } from './artKit.ts';
import { getSceneSeed } from './sceneSeed.ts';
import { drawSheet } from './sheetBake.ts';

export const DEFAULT_SPRITE_BIRDS = true;

interface BirdSpecies {
  /** longest side of the species' biggest frame, in world units at a 720-high view */
  size: number;
  /** wing beats per second */
  beat: number;
}

export const BIRD_SPECIES: Record<string, BirdSpecies> = {
  hummer: { size: 30, beat: 7 },
  tanager: { size: 32, beat: 3.2 },
  warbler: { size: 30, beat: 3.4 },
  banana: { size: 30, beat: 3.4 },
  macaw: { size: 56, beat: 2.2 },
  toco: { size: 50, beat: 2.0 },
  quetzal: { size: 66, beat: 2.0 },
  rock: { size: 40, beat: 2.8 },
  harpy: { size: 74, beat: 1.1 },
  keel: { size: 48, beat: 2.0 },
  andean: { size: 40, beat: 2.8 },
  bellbird: { size: 42, beat: 2.6 },
};

/**
 * where a bird flying along its own line shows on screen. Its flight is in the world, not on the screen: when the camera scrolls the
 * sky slides past it (slowly, it is far away) instead of it following the camera. The loop is longer than the view, so a bird spends
 * part of its time off screen and the sky is not crowded; the wrap-around always happens out of sight.
 */
export function skyX(flightX: number, camX: number, vw: number): number {
  const L = (vw + 280) * 1.7;
  return ((((flightX + 140 - camX * 0.5) % L) + L) % L) - 140;
}

/** every painted bird is drawn a little smaller than its sheet size, so the backdrop stays calm */
const BIRD_TRIM = 0.78;

/** the flap loop: up, mid-up, mid-down, down, then back up through mid-down and mid-up */
const LOOP = [0, 1, 2, 3, 2, 1];

let enabled: boolean | null = null;
function isEnabled(): boolean {
  if (enabled !== null) return enabled;
  let v = DEFAULT_SPRITE_BIRDS;
  try {
    const q = new URLSearchParams(location.search).get('birds');
    if (q === 'sprite') v = true;
    else if (q === 'classic') v = false;
    else if (localStorage.getItem('sloth_birds') === 'classic') v = false;
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
  trackAtlas(img, new URL('../assets/flora/birds-atlas.webp', import.meta.url).href, () => { ready = true; }, () => { atlas = null; });
}

/** true when the painted birds are on and loaded (starts the load the first time it is asked) */
export function birdsPainted(): boolean {
  if (!isEnabled()) return false;
  load();
  return ready && !!atlas;
}

const biggest: Record<string, number> = {};
function biggestSide(sp: string): number {
  if (biggest[sp] !== undefined) return biggest[sp];
  let m = 1;
  for (let k = 0; k < 4; k++) {
    const f = BIRD_FRAMES[`${sp}_${k}`];
    if (f) m = Math.max(m, f.w, f.h);
  }
  biggest[sp] = m;
  return m;
}

/** which of the four frames a bird is on: `phase` (0-1 within a beat) walks the loop */
export function birdFrame(phase: number): number {
  const u = phase - Math.floor(phase);
  return LOOP[Math.floor(u * LOOP.length) % LOOP.length];
}

/**
 * draws one bird centred on (x, y). `face` is the way it flies (the frames face right, so -1 mirrors it), `size` multiplies the
 * species size, `sc` is the view scale (vh / 720), `offset` staggers the wing beat between birds of a flock. False when off or not loaded.
 */
export function drawPaintedBird(
  ctx: CanvasRenderingContext2D, species: string, x: number, y: number, time: number, sc: number, size: number, face: number, offset: number, tilt = 0,
): boolean {
  if (!birdsPainted() || !atlas) return false;
  const info = BIRD_SPECIES[species];
  if (!info) return false;
  const f = BIRD_FRAMES[`${species}_${birdFrame(time * info.beat + offset)}`];
  if (!f) return false;
  const k = (info.size * BIRD_TRIM * sc * size) / biggestSide(species);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt * face);
  ctx.scale(face < 0 ? -1 : 1, 1);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  drawSheet(ctx, atlas, f.x, f.y, f.w, f.h, (-f.w * k) / 2, (-f.h * k) / 2, f.w * k, f.h * k);
  ctx.restore();
  return true;
}

/** one kind of flock that crosses the sky of a world */
interface Flock {
  /** the species it can be (a flock is one species, picked by flock number) */
  pool: string[];
  flocks: number;
  /** birds per flock */
  n: number;
  /** seconds to cross the screen: [min, max] */
  period: [number, number];
  /** height of the flight line as a share of the view: [min, max] */
  y: [number, number];
  /** size multiplier on the species size */
  size: number;
  /** wing-beat multiplier (soaring birds beat slowly) */
  beat?: number;
}

/**
 * what flies in each world; null worlds keep their old birds (herons in 2 and 6, crows in 10, nothing in the caves and the volcano).
 * A flock is ONE species picked from its pool by the stage's scene seed, so over a few runs every species in a pool shows (before, the
 * pick was the flock number alone and five of the twelve species never flew). The flight lines stay in the upper third of the view,
 * above the lane the hero plays in, so a flock never crosses behind him.
 */
export const PAINTED_FLOCKS: Record<number, Flock[]> = {
  // the canopy: toucans and macaws crossing high, a loose flock of small tanagers lower down
  1: [
    { pool: ['toco', 'macaw', 'keel'], flocks: 1, n: 2, period: [34, 62], y: [0.1, 0.26], size: 1 },
    { pool: ['tanager', 'banana', 'warbler'], flocks: 1, n: 3, period: [26, 44], y: [0.2, 0.34], size: 0.9 },
  ],
  // the river keeps its herons; small birds along the bank
  2: [{ pool: ['banana', 'bellbird', 'warbler'], flocks: 1, n: 3, period: [28, 48], y: [0.2, 0.34], size: 0.9 }],
  // the cliffs: harpy eagles on the updraft and a pair of quetzals
  4: [
    { pool: ['harpy'], flocks: 1, n: 1, period: [70, 110], y: [0.09, 0.27], size: 1, beat: 0.6 },
    { pool: ['quetzal'], flocks: 1, n: 2, period: [40, 60], y: [0.18, 0.34], size: 1 },
  ],
  // the orchid sanctuary: a few small songbirds drift through the flowers (the hummingbirds stay)
  5: [{ pool: ['tanager', 'warbler', 'banana'], flocks: 1, n: 2, period: [34, 58], y: [0.14, 0.32], size: 0.9 }],
  // the blackwater swamp: a keel-billed toucan pair or a bellbird over the herons
  6: [{ pool: ['keel', 'bellbird'], flocks: 1, n: 2, period: [40, 70], y: [0.12, 0.3], size: 0.95 }],
  // the ruins: macaws and cock-of-the-rock
  7: [
    { pool: ['macaw'], flocks: 1, n: 2, period: [34, 62], y: [0.1, 0.28], size: 1 },
    { pool: ['andean', 'rock'], flocks: 1, n: 2, period: [36, 56], y: [0.2, 0.34], size: 1 },
  ],
};

/** which member of a pool a flock is on this stage: the scene seed (and the world and flock) walk the pool, so every species gets its turn */
export function flockSpecies(pool: string[], world: number, flockNo: number, f: number, seed: number): string {
  const h = Math.imul(seed | 0, 2654435761) ^ Math.imul(world + 1, 40503) ^ Math.imul(flockNo + 1, 9973);
  return pool[(((h >>> 7) + f) % pool.length + pool.length) % pool.length];
}

/** draws a world's painted flocks (nothing for the worlds that keep their old birds); false when off or not loaded, so the vector birds draw */
export function renderPaintedFlocks(ctx: CanvasRenderingContext2D, world: number, camX: number, vw: number, vh: number, time: number): boolean {
  const spec = PAINTED_FLOCKS[world];
  if (!spec || !birdsPainted()) return false;
  const sc = vh / 720;
  const r = rng(world * 131 + 29 + getSceneSeed() * 1013);
  let flockNo = 0;
  for (const fl of spec) {
    for (let f = 0; f < fl.flocks; f++, flockNo++) {
      const species = flockSpecies(fl.pool, world, flockNo, f, getSceneSeed());
      const period = fl.period[0] + r() * (fl.period[1] - fl.period[0]);
      const dir = flockNo % 2 ? 1 : -1;
      const u = (((time + r() * 80) / period) % 1 + 1) % 1;
      const baseX = skyX(dir > 0 ? -110 + u * (vw + 260) : vw + 110 - u * (vw + 260), camX, vw);
      const baseY = vh * (fl.y[0] + r() * (fl.y[1] - fl.y[0])) + Math.sin(u * 8 + f) * 12 * sc;
      for (let i = 0; i < fl.n; i++) {
        const info = BIRD_SPECIES[species];
        const gap = (info ? info.size : 40) * BIRD_TRIM * 0.9 * sc * fl.size;
        const x = baseX - dir * i * gap;
        const y = baseY + i * 9 * sc + Math.sin(time * 1.3 + i + f) * 3;
        // lean into the bob of the flight line
        const tilt = Math.cos(u * 8 + f) * 0.06;
        drawPaintedBird(ctx, species, x, y, time * (fl.beat ?? 1), sc, fl.size, dir, i * 0.31 + f * 0.17, tilt);
      }
    }
  }
  return true;
}
