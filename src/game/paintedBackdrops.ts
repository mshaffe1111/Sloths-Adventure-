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
 *
 * A world can paint different stages in different light (World 5: gold, dusk and twilight, two takes each, w5Backdrop.ts): the engine
 * names the stage being played (setBackdropStage) and the world's strips are that stage's set. Each set counts as one of the
 * KEEP_WORLDS kept decoded. Away from a stage (the map, the title, a story) a world shows the set the last stage used, or its plain
 * w<N>-* set.
 */
// (under the test runner there is no bundler and so no glob, the call throws, and no world is painted: the drawn layers are what get
// tested. The bundler replaces the call itself, so it must stay a plain call for it to be found.)
let FILES: Record<string, string> = {};
try {
  FILES = import.meta.glob('../assets/backdrops/w*-*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
} catch {
  FILES = {};
}

import { FAR_ONLY, stageBackdropStem } from './stageBackdrops.ts';

export interface PaintedSet {
  far: HTMLImageElement;
  mid: HTMLImageElement;
  /** the near strip is optional: a world can run on its far and middle strips while its near one is being remade */
  near: HTMLImageElement | null;
}

type Part = keyof PaintedSet;
const PARTS: Part[] = ['far', 'mid', 'near'];

function urlFor(stem: string, part: Part): string | null {
  const own = FILES[`../assets/backdrops/${stem}-${part}.webp`];
  if (own) return own;
  // a far-only set (Worlds 1-4 through the day, stageBackdrops.ts) borrows its world's middle and near strips
  if (part !== 'far' && FAR_ONLY.includes(stem)) return FILES[`../assets/backdrops/w${worldOf(stem)}-${part}.webp`] ?? null;
  return null;
}

/** the strip set a stage plays in: its world's own (w<N>), or the stage's own light (World 5's moods, Worlds 1-4 through the day) */
export function backdropStem(world: number, stageId: string | null): string {
  const own = stageId ? stageBackdropStem(stageId) : null;
  return own && worldOf(own) === world && urlFor(own, 'far') && urlFor(own, 'mid') ? own : `w${world}`;
}

/** a set that draws its world's own middle strip (its own set, or a far-only one), so the world's canopy strips go with it */
const ownMid = (stem: string): boolean => stem === `w${worldOf(stem)}` || FAR_ONLY.includes(stem);

let stage: string | null = null;
/** the stem each world shows now: the last stage played in it picks it */
const shown = new Map<number, string>();
const stemFor = (world: number): string => shown.get(world) ?? `w${world}`;
function worldOf(stem: string): number {
  return Number(/^w(\d+)/.exec(stem)?.[1] ?? 0);
}

/**
 * A stage is starting (the engine, as it builds the stage): its world shows that stage's strips from now on. When that changes the
 * set, the listeners are told, so the scenery lets go of the old set and the new one loads (the stage's preload has usually started it).
 */
export function setBackdropStage(stageId: string | null): void {
  stage = stageId;
  const world = Number(/^(\d+)-/.exec(stageId ?? '')?.[1] ?? 0);
  if (!world) return;
  const stem = backdropStem(world, stageId);
  if (stemFor(world) === stem) return;
  shown.set(world, stem);
  listeners.forEach((fn) => fn(world));
}

/** the stage last named by setBackdropStage (for the tests) */
export const backdropStage = (): string | null => stage;

/** the strip set a world shows now (for the tests and the preview) */
export const shownStem = (world: number): string => stemFor(world);

/** this world has all three painted strips */
export function hasPainted(world: number): boolean {
  return !!urlFor(`w${world}`, 'far') && !!urlFor(`w${world}`, 'mid');
}

/** the worlds whose strips stay decoded at once: the one being played and one more (the map or a story showing another world) */
export const KEEP_WORLDS = 2;
const ready = new Map<string, PaintedSet>();
const loading = new Set<string>();
const failed = new Set<string>();
const listeners = new Set<(world: number) => void>();

export function onPaintedReady(fn: (world: number) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function loadSet(stem: string) {
  if (ready.has(stem) || loading.has(stem) || failed.has(stem) || typeof Image === 'undefined') return;
  const world = worldOf(stem);
  loading.add(stem);
  const parts = PARTS.filter((p) => !!urlFor(stem, p));
  const imgs = parts.map((p) => {
    const im = new Image();
    im.decoding = 'async';
    im.src = urlFor(stem, p)!;
    return im;
  });
  Promise.all(imgs.map((im) => (im.decode ? im.decode() : new Promise<void>((res, rej) => { im.onload = () => res(); im.onerror = rej; }))))
    .then(() => {
      const at = (p: Part) => imgs[parts.indexOf(p)] ?? null;
      ready.set(stem, { far: at('far')!, mid: at('mid')!, near: at('near') });
      listeners.forEach((fn) => fn(world));
      trim(stem);
    })
    .catch(() => {
      // a strip that will not load leaves the drawn layers in place for good
      failed.add(stem);
    })
    .finally(() => loading.delete(stem));
}

/**
 * Start decoding the strips a stage will play in, without showing them yet (stagePreload.ts, behind the map or the stage-cleared
 * card), so the stage does not open on a plain sky while they decode.
 */
export function preloadBackdrop(world: number, stageId: string): void {
  if (hasPainted(world)) loadSet(backdropStem(world, stageId));
}

/** drop the sets used longest ago (the Map keeps the order of use) until only KEEP_WORLDS are left; `keep` is never dropped */
function trim(keep: string) {
  for (const k of [...ready.keys()]) {
    if (ready.size <= KEEP_WORLDS) break;
    if (k === keep) continue;
    ready.delete(k);
    const w = worldOf(k);
    if (ownMid(k) && ![...ready.keys()].some((q) => worldOf(q) === w && ownMid(q))) canopyReady.delete(w);
    listeners.forEach((fn) => fn(w));
  }
}

/**
 * The painted strips for a world if they are decoded; otherwise null, and they start loading unless `load` is false (a map thumbnail
 * is baked before any strip could arrive, so it must not pull a whole world's strips in just to throw them away).
 */
export function paintedFor(world: number, load = true): PaintedSet | null {
  if (!hasPainted(world)) return null;
  const stem = stemFor(world);
  const hit = ready.get(stem);
  if (hit) {
    // most recently used goes to the end, so the oldest is the one trim() drops
    ready.delete(stem);
    ready.set(stem, hit);
    return hit;
  }
  if (load) loadSet(stem);
  return null;
}

/** the decoded strips a world shows now, without loading them or counting as a use */
export const peekPainted = (world: number): PaintedSet | null => ready.get(stemFor(world)) ?? null;

/** the worlds whose strips are decoded right now (for the tests and the memory check) */
export const decodedWorlds = (): number[] => [...new Set([...ready.keys()].map(worldOf))];

/** the strip sets decoded right now ('w4', 'w5dusk1', ...) */
export const decodedSets = (): string[] => [...ready.keys()];

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
  // the canopy strips go with the world's own middle strip: none for a world whose strips were dropped, or a set with its own middle
  const stem = stemFor(world);
  if (!ready.has(stem) || !ownMid(stem)) return null;
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
    .then(() => { if (ready.has(stemFor(world)) && ownMid(stemFor(world))) canopyReady.set(world, { mid, near }); })
    .catch(() => { canopyFailed.add(world); /* the ground strips stay */ })
    .finally(() => canopyLoading.delete(world));
  return null;
}
