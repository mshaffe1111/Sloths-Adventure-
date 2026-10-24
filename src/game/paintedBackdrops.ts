/**
 * paintedBackdrops — the stage backgrounds painted as strips (made in Gemini from prompts written against each world's chapter),
 * used in place of the drawn layers when a world has them:
 *   far   the sky and the far distance, opaque, scrolls slowest
 *   mid   the middle distance (crags, trees, landmarks) cut out of a flat magenta, so the far strip shows through
 *   near  the low foreground just behind the ground, cut out the same way
 * Each strip is prepared by scripts/backdrop-strip.py (side panels cropped, the key colour cut out) and is repeated mirrored every other
 * time, so it needs no seam. It is kept as one decoded image: about 4 MB a world, where the drawn layers took about 75 MB.
 *
 * Loading is lazy and asynchronous. Until a world's three strips have decoded, the drawn layers stand in; when they are ready,
 * the listeners are told so the scenery can rebuild.
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

const ready = new Map<number, PaintedSet>();
const loading = new Set<number>();
const failed = new Set<number>();
const listeners = new Set<(world: number) => void>();

export function onPaintedReady(fn: (world: number) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function load(world: number) {
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
    })
    .catch(() => {
      // a strip that will not load leaves the drawn layers in place for good
      failed.add(world);
    })
    .finally(() => loading.delete(world));
}

/** the painted strips for a world if they are decoded; otherwise null (and they start loading) */
export function paintedFor(world: number): PaintedSet | null {
  if (!hasPainted(world)) return null;
  const hit = ready.get(world);
  if (hit) return hit;
  load(world);
  return null;
}

// ---- the canopy strips: the same world seen from high in the trees (Matt, 2026-10-24: 1-8's chase on the long branch, and the top of
// 1-4's climb). Only the middle and near strips change; the far strip (sky and treetops) is already the view from up high.

export interface CanopySet {
  mid: HTMLImageElement;
  near: HTMLImageElement;
}
const canopyReady = new Map<number, CanopySet>();
const canopyLoading = new Set<number>();
const canopyUrl = (world: number, part: 'mid' | 'near') => FILES[`../assets/backdrops/w${world}c-${part}.webp`] ?? null;

/** the canopy strips for a world if it has them and they are decoded; otherwise null (and they start loading) */
export function canopyFor(world: number): CanopySet | null {
  const hit = canopyReady.get(world);
  if (hit) return hit;
  const mu = canopyUrl(world, 'mid'), nu = canopyUrl(world, 'near');
  if (!mu || !nu || canopyLoading.has(world) || typeof Image === 'undefined') return null;
  canopyLoading.add(world);
  const mid = new Image();
  const near = new Image();
  mid.decoding = 'async';
  near.decoding = 'async';
  mid.src = mu;
  near.src = nu;
  Promise.all([mid, near].map((im) => (im.decode ? im.decode() : new Promise<void>((res, rej) => { im.onload = () => res(); im.onerror = rej; }))))
    .then(() => canopyReady.set(world, { mid, near }))
    .catch(() => { /* the ground strips stay */ });
  return null;
}
