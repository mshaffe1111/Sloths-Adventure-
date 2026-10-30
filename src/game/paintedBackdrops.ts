/**
 * paintedBackdrops — the stage backgrounds painted as strips (made in Gemini from prompts written against each world's chapter),
 * used in place of the drawn layers when a world has them:
 *   far   the sky and the far distance, opaque, scrolls slowest
 *   mid   the middle distance (crags, trees, landmarks) cut out of a flat magenta, so the far strip shows through
 *   near  the low foreground just behind the ground, cut out the same way
 * Each strip is prepared by scripts/backdrop-strip.py (side panels cropped, the key colour cut out, the ends crossfaded into each other
 * by scripts/strip-seamless.py) and is repeated side by side, unflipped. Decoded, a world's strips take about 20 MB (36 MB for the wide worlds 8 and 9).
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
 *
 * A stage waits for its strips before it starts (stagePreload.ts readyToStart, up to BACKDROP_WAIT_MS), and a strip set or canopy that
 * still comes in late fades in over FADE_IN_MS from the stand-in sky instead of popping in (polish report VI-3, `at` below).
 */
// (under the test runner there is no bundler and so no glob, the call throws, and no world is painted: the drawn layers are what get
// tested. The bundler replaces the call itself, so it must stay a plain call for it to be found.)
let FILES: Record<string, string> = {};
try {
  FILES = import.meta.glob('../assets/backdrops/w*-*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
} catch {
  FILES = {};
}
/** each strip at a sixth of its size (tools/art/backdroplo/make.py): a few KB, decoded long before the strips, shown in their place
 * until they arrive, so a stage never opens on a flat sky (lead, 2026-10-29: the river stage played its first seconds on a flat colour) */
let LO: Record<string, string> = {};
try {
  LO = import.meta.glob('../assets/backdrops-lo/w*-*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
} catch {
  LO = {};
}

import { FAR_ONLY, stageBackdropStem } from './stageBackdrops.ts';

export interface PaintedSet {
  far: HTMLImageElement;
  mid: HTMLImageElement;
  /** the near strip is optional: a world can run on its far and middle strips while its near one is being remade */
  near: HTMLImageElement | null;
  /** the painted sky above the far strip (<stem>-sky.webp, tools/art/hfbatch/skygpu.py), seen only upright, where the strips are drawn
   * at the size sideways uses and the view runs taller than the far strip (scenery.ts drawStrip) */
  sky: HTMLImageElement | null;
  /** when it finished decoding (performance.now()): the scenery fades a set in over FADE_IN_MS from then */
  at: number;
}

/** how long a stage waits for its backdrop before it starts anyway (polish report VI-3: 2.5 s; the other sheets wait 900 ms) */
export const BACKDROP_WAIT_MS = 2500;
/** a set or canopy that arrives once its picture is already on screen fades in over this long instead of popping in */
export const FADE_IN_MS = 280;
const now = (): number => (typeof performance !== 'undefined' ? performance.now() : Date.now());

type Part = keyof PaintedSet;
const PARTS: Part[] = ['far', 'mid', 'near', 'sky'];

function urlFor(stem: string, part: Part, lo = false): string | null {
  const files = lo ? LO : FILES;
  const dir = lo ? 'backdrops-lo' : 'backdrops';
  const own = files[`../assets/${dir}/${stem}-${part}.webp`];
  if (own || part === 'sky') return own ?? null; // (the sky goes with its own far strip, never borrowed)
  // a far-only set (Worlds 1-4 through the day, stageBackdrops.ts) borrows its world's middle and near strips
  if (part !== 'far' && FAR_ONLY.includes(stem)) return files[`../assets/${dir}/w${worldOf(stem)}-${part}.webp`] ?? null;
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

/**
 * The worlds whose strips stay decoded at once: the one being played and one more (the map or a story showing another world). This
 * counts worlds, not sets (VI-3: World 5's dusk and twilight sets each counted as a world, so the next stage's set pushed out the one
 * on screen); a world keeps at most SETS_PER_WORLD of its sets, the stage's and the one before or after it.
 */
export const KEEP_WORLDS = 2;
export const SETS_PER_WORLD = 2;
const ready = new Map<string, PaintedSet>();
const loading = new Set<string>();
const failed = new Set<string>();
const listeners = new Set<(world: number) => void>();
/** the calls waiting for a set to finish decoding (or fail) */
const settled = new Map<string, (() => void)[]>();
function settle(stem: string) {
  const w = settled.get(stem);
  settled.delete(stem);
  w?.forEach((fn) => fn());
}

export function onPaintedReady(fn: (world: number) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** the small stand-ins (LO), by set: decoded ones, ones on their way, ones that failed, and the calls waiting for them */
const loReady = new Map<string, PaintedSet>();
const loLoading = new Set<string>();
const loFailed = new Set<string>();
const loSettled = new Map<string, (() => void)[]>();

function loadLo(stem: string) {
  if (loReady.has(stem) || loLoading.has(stem) || loFailed.has(stem) || typeof Image === 'undefined') return;
  const parts = PARTS.filter((p) => !!urlFor(stem, p, true));
  if (!parts.includes('far') || !parts.includes('mid')) {
    loFailed.add(stem);
    return;
  }
  loLoading.add(stem);
  const imgs = parts.map((p) => {
    const im = new Image();
    im.decoding = 'async';
    // (ahead of the big sheets the stage asks for at the same moment)
    (im as HTMLImageElement & { fetchPriority?: string }).fetchPriority = 'high';
    im.src = urlFor(stem, p, true)!;
    return im;
  });
  Promise.all(imgs.map((im) => (im.decode ? im.decode() : new Promise<void>((res, rej) => { im.onload = () => res(); im.onerror = rej; }))))
    .then(() => {
      const at = (p: Part) => imgs[parts.indexOf(p)] ?? null;
      loReady.set(stem, { far: at('far')!, mid: at('mid')!, near: at('near'), sky: at('sky'), at: now() });
      // (a few sets at most: the oldest go)
      for (const k of [...loReady.keys()]) if (loReady.size > 4 && k !== stem) loReady.delete(k);
      // (the scenery swaps its flat stand-in for these, unless the strips themselves beat them to it)
      if (!ready.has(stem)) listeners.forEach((fn) => fn(worldOf(stem)));
    })
    .catch(() => loFailed.add(stem))
    .finally(() => {
      loLoading.delete(stem);
      const w = loSettled.get(stem);
      loSettled.delete(stem);
      w?.forEach((fn) => fn());
    });
}

/** the small painted stand-ins for the set a world shows now, once decoded (null before, or when it has none) */
export function standInFor(world: number): PaintedSet | null {
  if (!hasPainted(world)) return null;
  return loReady.get(stemFor(world)) ?? null;
}

/** resolves once a stage's small stand-ins have decoded (or failed, or there are none): the stage never starts before them */
export function standInReady(world: number, stageId: string): Promise<void> {
  if (!hasPainted(world) || typeof Image === 'undefined') return Promise.resolve();
  const stem = backdropStem(world, stageId);
  loadLo(stem);
  if (loReady.has(stem) || loFailed.has(stem) || !loLoading.has(stem)) return Promise.resolve();
  return new Promise<void>((res) => loSettled.set(stem, [...(loSettled.get(stem) ?? []), res]));
}

function loadSet(stem: string) {
  // (the stand-ins first: a few KB, so they are on screen long before the strips)
  loadLo(stem);
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
      ready.set(stem, { far: at('far')!, mid: at('mid')!, near: at('near'), sky: at('sky'), at: now() });
      listeners.forEach((fn) => fn(world));
      trim(stem);
    })
    .catch(() => {
      // a strip that will not load leaves the drawn layers in place for good
      failed.add(stem);
    })
    .finally(() => {
      loading.delete(stem);
      settle(stem);
    });
}

/**
 * Start decoding the strips a stage will play in, without showing them yet (stagePreload.ts, behind the map or the stage-cleared
 * card), so the stage does not open on a plain sky while they decode.
 */
export function preloadBackdrop(world: number, stageId: string): void {
  void backdropReady(world, stageId);
}

/** this stage is played high in the trees (1-8's long branch, the ascents), so its world's canopy strips are part of its backdrop */
export const stageUsesCanopy = (cfg: { id: string; objectiveType?: string }): boolean => cfg.id === '1-8' || cfg.objectiveType === 'ascent';

/**
 * Start decoding the strips a stage plays in (and its canopy strips when `canopy`), resolving once they are all decoded, or have failed
 * (the drawn layers stand in), or at once for a world with no painted strips. The stage waits on this before it starts (VI-3).
 */
export function backdropReady(world: number, stageId: string, canopy = false): Promise<void> {
  if (!hasPainted(world) || typeof Image === 'undefined') return Promise.resolve();
  const stem = backdropStem(world, stageId);
  loadSet(stem);
  const set = ready.has(stem) || failed.has(stem) ? Promise.resolve() : new Promise<void>((res) => settled.set(stem, [...(settled.get(stem) ?? []), res]));
  if (!canopy || !ownMid(stem)) return set;
  return set.then(() => loadCanopy(world, stem));
}

/**
 * Which decoded sets to let go: `order` is the sets from used longest ago to most recently, `keep` is never dropped. Only the
 * KEEP_WORLDS worlds used last stay, each with at most SETS_PER_WORLD sets (its oldest go first).
 */
export function setsToDrop(order: readonly string[], keep: string, keepWorlds = KEEP_WORLDS, perWorld = SETS_PER_WORLD): string[] {
  // (the set just decoded counts as the one used last)
  const left = order.includes(keep) ? [...order.filter((k) => k !== keep), keep] : [...order];
  const drop: string[] = [];
  for (const k of [...left]) {
    if (k === keep) continue;
    const worlds: number[] = [];
    for (const q of left) {
      const i = worlds.indexOf(worldOf(q));
      if (i >= 0) worlds.splice(i, 1);
      worlds.push(worldOf(q));
    }
    const w = worldOf(k);
    const oldWorld = worlds.indexOf(w) < worlds.length - keepWorlds;
    const extraSet = left.filter((q) => worldOf(q) === w).length > perWorld;
    if (!oldWorld && !extraSet) continue;
    left.splice(left.indexOf(k), 1);
    drop.push(k);
  }
  return drop;
}

/** drop the sets setsToDrop names (the Map keeps the order of use); `keep`, the one just decoded, is never dropped */
function trim(keep: string) {
  for (const k of setsToDrop([...ready.keys()], keep)) {
    ready.delete(k);
    loReady.delete(k);
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
  /** when it finished decoding (the scenery fades it in over FADE_IN_MS) */
  at: number;
}
const canopyReady = new Map<number, CanopySet>();
const canopyLoading = new Map<number, Promise<void>>();
const canopyFailed = new Set<number>();
const canopyUrl = (world: number, part: 'mid' | 'near') => FILES[`../assets/backdrops/w${world}c-${part}.webp`] ?? null;

/** the canopy strips for a world if it has them and they are decoded; otherwise null (and they start loading) */
export function canopyFor(world: number): CanopySet | null {
  const hit = canopyReady.get(world);
  if (hit) return hit;
  void loadCanopy(world);
  return null;
}

/** start decoding a world's canopy strips (they go with the world's own middle strip); resolves when they are in, or will not come */
function loadCanopy(world: number, stem = stemFor(world)): Promise<void> {
  if (canopyReady.has(world)) return Promise.resolve();
  // the canopy strips go with the world's own middle strip: none for a world whose strips were dropped, or a set with its own middle
  if (!ready.has(stem) || !ownMid(stem)) return Promise.resolve();
  const mu = canopyUrl(world, 'mid'), nu = canopyUrl(world, 'near');
  if (!mu || !nu || canopyFailed.has(world) || typeof Image === 'undefined') return Promise.resolve();
  const going = canopyLoading.get(world);
  if (going) return going;
  const mid = new Image();
  const near = new Image();
  mid.decoding = 'async';
  near.decoding = 'async';
  mid.src = mu;
  near.src = nu;
  const p = Promise.all([mid, near].map((im) => (im.decode ? im.decode() : new Promise<void>((res, rej) => { im.onload = () => res(); im.onerror = rej; }))))
    .then(() => { if ([...ready.keys()].some((q) => worldOf(q) === world && ownMid(q))) canopyReady.set(world, { mid, near, at: now() }); })
    .catch(() => { canopyFailed.add(world); /* the ground strips stay */ })
    .finally(() => canopyLoading.delete(world));
  canopyLoading.set(world, p);
  return p;
}

// ---- the reveal: another world's strips seen from the top of a climb (6-8 Stilt Climb: the first sight of the ruins, World 7, at dusk)

const reveals = new Map<string, PaintedSet>();
const revealLoading = new Set<string>();
/**
 * The strips a stage reveals at its top (`far`, `mid`, `near`: strip stems, e.g. 'w7dusk-far'), decoded on their own (not one of the
 * KEEP_WORLDS sets: they are drawn over the world's own only near the top). Null until they have decoded; the first call starts them.
 */
export function revealSet(parts: { far: string; mid: string; near: string }): PaintedSet | null {
  const key = `${parts.far}|${parts.mid}|${parts.near}`;
  const hit = reveals.get(key);
  if (hit) return hit;
  if (revealLoading.has(key) || typeof Image === 'undefined') return null;
  const urls = [parts.far, parts.mid, parts.near].map((n) => FILES[`../assets/backdrops/${n}.webp`]);
  if (urls.some((u) => !u)) return null;
  // (and the far strip's own painted sky, for the upright view, when it has one)
  const skyUrl = FILES[`../assets/backdrops/${parts.far.replace(/-far$/, '-sky')}.webp`];
  if (skyUrl) urls.push(skyUrl);
  revealLoading.add(key);
  const imgs = urls.map((u) => {
    const im = new Image();
    im.decoding = 'async';
    im.src = u!;
    return im;
  });
  Promise.all(imgs.map((im) => (im.decode ? im.decode() : new Promise<void>((res, rej) => { im.onload = () => res(); im.onerror = rej; }))))
    .then(() => reveals.set(key, { far: imgs[0], mid: imgs[1], near: imgs[2], sky: imgs[3] ?? null, at: typeof performance !== 'undefined' ? performance.now() : 0 }))
    .catch(() => { /* no reveal: the world's own strips stay */ })
    .finally(() => revealLoading.delete(key));
  return null;
}
