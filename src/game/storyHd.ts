/**
 * The story's own paintings of Pokey, Meeca and Dot (2026-10-29, Matt: the story's figures were the soft first concept art next to the
 * game): every frame a story shows of them, repainted on their character models on Hugging Face at HD times the old frame's size
 * (tools/art/storyart). Each set is a few pages (src/assets/story/hd/<set>-<n>.webp) and a table (storyHdData_<set>.ts); a frame is its
 * old rect times HD, grown by `m` px all round, so the old anchors (feet, head) still say where it hangs. The pages load with a story and
 * are let go when it closes (they are only ever drawn in a story).
 */
import { trackAtlas } from './atlasLoader.ts';

export interface HdFrame { p: number; x: number; y: number; w: number; h: number; m: number }
export interface HdSet { hd: number; pages: number; frames: Record<string, HdFrame> }

// (under the test runner there is no bundler and so no glob: the call throws and there are no pictures, as paintedBackdrops.ts)
let files: Record<string, string> = {};
try {
  files = import.meta.glob('../assets/story/hd/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
} catch {
  files = {};
}
const imgs = new Map<string, HTMLImageElement | null>();
const ready = new Set<string>();

function page(set: string, i: number): HTMLImageElement | null {
  const key = `${set}-${i}`;
  if (!imgs.has(key)) {
    const url = files[`../assets/story/hd/${key}.webp`];
    if (!url || typeof Image === 'undefined') return null;
    const img = new Image();
    imgs.set(key, img);
    trackAtlas(img, url, () => { ready.add(key); }, () => { imgs.delete(key); ready.delete(key); });
  }
  return ready.has(key) ? imgs.get(key) ?? null : null;
}

/** start fetching every page of a set (cheap to call again) */
export function warmHd(set: string, s: HdSet) {
  for (let i = 0; i < s.pages; i++) page(set, i);
}
/** every page of the set has loaded */
export function hdReady(set: string, s: HdSet): boolean {
  let ok = true;
  for (let i = 0; i < s.pages; i++) ok = !!page(set, i) && ok;
  return ok;
}
/** the loaded page a frame is on, or null */
export function hdPage(set: string, f: HdFrame): HTMLImageElement | null {
  return page(set, f.p);
}
/** the page a frame is on if it has already loaded, else null: never starts a load (for code also run in play, where these pages must
 *  not be fetched: paintedBoss.ts) */
export function hdLoaded(set: string, f: HdFrame): HTMLImageElement | null {
  const key = `${set}-${f.p}`;
  return ready.has(key) ? imgs.get(key) ?? null : null;
}
/** a story has closed: let the pages go (they load again, from the offline cache, for the next one) */
export function releaseHd() {
  imgs.clear();
  ready.clear();
}
