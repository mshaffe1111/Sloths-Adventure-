/**
 * paintedBackdrops — the stage backgrounds painted as strips (made in Gemini from prompts written against each world's chapter),
 * used in place of the drawn layers when a world has them:
 *   far   the sky and the far distance, opaque, scrolls slowest
 *   mid   the middle distance (crags, trees, landmarks) cut out of a flat magenta, so the far strip shows through
 *   near  the low foreground just behind the ground, cut out the same way
 * Each strip is prepared by scripts/backdrop-strip.py (side panels cropped, the key colour cut out) and is repeated mirrored every other
 * time, so it needs no seam. Decoded, a world's strips take about 20 MB (36 MB for the wide worlds 8 and 9).
 *
 * Loading is lazy and asynchronous. Until a world's three strips have decoded, the drawn layers stand in; when they are ready,
 * the listeners are told so the scenery can rebuild. Only the last KEEP_WORLDS worlds used stay decoded (memory audit, 2026-10-25:
 * keeping every world a session visits was over 200 MB): an older world is dropped, the listeners are told the same way so the scenery
 * lets go of its strips too, and it loads again (from the offline cache) if it comes back.
 */
// (under the test runner there is no bundler and so no glob, the call throws, and no world is painted: the drawn layers are what get
// tested. The bundler replaces the call itself, so it must stay a plain call for it to be found.)
let FILES: Record<string, string> = {};
try {
  FILES = import.meta.glob('../assets/backdrops/w*-*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
} catch {
  FILES = {};
}

export interface PaintedSet {
  far: HTMLImageElement;
  mid: HTMLImageElement;
  /** the near strip is optional: a world can run on its far and middle strips while its near one is being remade */
  near: HTMLImageElement | null;
}

type Part = keyof PaintedSet;
const PARTS: Part[] = ['far', 'mid', 'near'];

function urlFor(world: number, part: Part): string | null {
  return FILES[`../assets/backdrops/w${world}-${part}.webp`] ?? null;
}

/** this world has all three painted strips */
export function hasPainted(world: number): boolean {
  return !!urlFor(world, 'far') && !!urlFor(world, 'mid');
}

/** the worlds whose strips stay decoded at once: the one being played and one more (the map or a story showing another world) */
export const KEEP_WORLDS = 2;
const ready = new Map<number, PaintedSet>();
const loading = new Set<number>();
const failed = new Set<number>();
const listeners = new Set<(world: number) => void>();

export function onPaintedReady(fn: (world: number) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function loadWorld(world: number) {
  if (loading.has(world) || failed.has(world) || typeof Image === 'undefined') return;
  loading.add(world);
  const parts = PARTS.filter((p) => !!urlFor(world, p));
  const imgs = parts.map((p) => {
    const im = new Image();
    im.decoding = 'async';
    im.src = urlFor(world, p)!;
    return im;
  });
  Promise.all(imgs.map((im) => (im.decode ? im.decode() : new Promise<void>((res, rej) => { im.onload = () => res(); im.onerror = rej; }))))
    .then(() => {
      const at = (p: Part) => imgs[parts.indexOf(p)] ?? null;
      ready.set(world, { far: at('far')!, mid: at('mid')!, near: at('near') });
      listeners.forEach((fn) => fn(world));
      trim(world);
    })
    .catch(() => {
      // a strip that will not load leaves the drawn layers in place for good
      failed.add(world);
    })
    .finally(() => loading.delete(world));
}

/** drop the worlds used longest ago (the Map keeps the order of use) until only KEEP_WORLDS are left; `keep` is never dropped */
function trim(keep: number) {
  for (const w of [...ready.keys()]) {
    if (ready.size <= KEEP_WORLDS) break;
    if (w === keep) continue;
    ready.delete(w);
    canopyReady.delete(w);
    listeners.forEach((fn) => fn(w));
  }
}

/**
 * The painted strips for a world if they are decoded; otherwise null, and they start loading unless `load` is false (a map thumbnail
 * is baked before any strip could arrive, so it must not pull a whole world's strips in just to throw them away).
 */
export function paintedFor(world: number, load = true): PaintedSet | null {
  if (!hasPainted(world)) return null;
  const hit = ready.get(world);
  if (hit) {
    // most recently used goes to the end, so the oldest is the one trim() drops
    ready.delete(world);
    ready.set(world, hit);
    return hit;
  }
  if (load) loadWorld(world);
  return null;
}

/** the decoded strips for a world, without loading them or counting as a use */
export const peekPainted = (world: number): PaintedSet | null => ready.get(world) ?? null;

/** the worlds whose strips are decoded right now (for the tests and the memory check) */
export const decodedWorlds = (): number[] => [...ready.keys()];

// ---- the canopy strips: the same world seen from high in the trees (Matt, 2026-10-24: 1-8's chase on the long branch, and the top of
// 1-4's climb). Only the middle and near strips change; the far strip (sky and treetops) is already the view from up high.

export interface CanopySet {
  mid: HTMLImageElement;
  near: HTMLImageElement;
}
const canopyReady = new Map<number, CanopySet>();
const canopyLoading = new Set<number>();
const canopyFailed = new Set<number>();
const canopyUrl = (world: number, part: 'mid' | 'near') => FILES[`../assets/backdrops/w${world}c-${part}.webp`] ?? null;

/** the canopy strips for a world if it has them and they are decoded; otherwise null (and they start loading) */
export function canopyFor(world: number): CanopySet | null {
  const hit = canopyReady.get(world);
  if (hit) return hit;
  // the canopy strips go with the world's own: none for a world whose strips were dropped
  if (!ready.has(world)) return null;
  const mu = canopyUrl(world, 'mid'), nu = canopyUrl(world, 'near');
  if (!mu || !nu || canopyLoading.has(world) || canopyFailed.has(world) || typeof Image === 'undefined') return null;
  canopyLoading.add(world);
  const mid = new Image();
  const near = new Image();
  mid.decoding = 'async';
  near.decoding = 'async';
  mid.src = mu;
  near.src = nu;
  Promise.all([mid, near].map((im) => (im.decode ? im.decode() : new Promise<void>((res, rej) => { im.onload = () => res(); im.onerror = rej; }))))
    .then(() => { if (ready.has(world)) canopyReady.set(world, { mid, near }); })
    .catch(() => { canopyFailed.add(world); /* the ground strips stay */ })
    .finally(() => canopyLoading.delete(world));
  return null;
}
