import { perfNote } from './perfLog.ts';
import { recorder } from './playRecorder.ts';

/** the last picture sheet to finish loading, and when (performance.now()): the control test names it on a stall that follows */
export const lastSheet = { name: '', at: 0 };

/**
 * Loads a painted sprite atlas. The picture is decoded before the sprite counts as ready, so the first draw
 * never stalls on a big decode, and a failed fetch is retried a few seconds later instead of leaving the
 * creature as vector art for the whole session.
 */
export function trackAtlas(img: HTMLImageElement, url: string, onReady: () => void, onFail: () => void, forget?: () => void): void {
  const t0 = typeof performance !== 'undefined' ? performance.now() : 0;
  const entry: Held | null = forget ? { img, forget, gone: false } : null;
  if (entry) held.add(entry);
  const ready = () => {
    if (entry?.gone) return;
    perfNote(`sheet ready: ${url.split('/').pop()} (${Math.round(performance.now() - t0)} ms to load and decode)`);
    // (the control test notes each sheet as it arrives, so a stall can be matched to the picture that caused it)
    lastSheet.name = url.split('/').pop()?.split('?')[0] ?? '';
    lastSheet.at = performance.now();
    if (recorder.on) recorder.event('sheet', `${lastSheet.name} ${Math.round(performance.now() - t0)}ms`);
    onReady();
  };
  img.onload = () => {
    if (typeof img.decode === 'function') img.decode().then(ready, ready);
    else ready();
  };
  img.onerror = () => {
    if (entry) held.delete(entry);
    if (entry?.gone) return;
    setTimeout(onFail, 4000);
  };
  img.src = url;
}

/**
 * Sheets that belong to one world (its kit, props, lair, creatures, boss). Decoded, a sheet is width x height x 4 bytes (a 2048 px
 * sheet is 10 to 20 MB, the Prowler's is 46 MB), and a module that keeps its sheet forever keeps every world a session has visited:
 * over a gigabyte by the end of the game, which gets the page reloaded on a phone. A module that passes `forget` to trackAtlas has its
 * sheet let go when play moves to another world: `forget` must drop every reference the module keeps to the picture (and anything
 * built from it) and reset it to "not loaded", so the next draw that asks for it loads it again (from the offline cache), drawing the
 * stand-in meanwhile as it does while loading.
 */
interface Held {
  img: HTMLImageElement;
  forget: () => void;
  /** let go: a load still under way must not mark the module ready again */
  gone: boolean;
}
const held = new Set<Held>();
let heldWorld = 0;

/** let go of every world sheet (the pictures are freed once nothing else holds them) */
export function releaseWorldArt(): number {
  let n = 0;
  for (const h of held) {
    h.gone = true;
    h.img.onload = null;
    h.img.onerror = null;
    try {
      h.forget();
    } catch {
      /* a module that fails to reset just keeps its sheet */
    }
    n++;
  }
  held.clear();
  if (n) perfNote(`let go of ${n} sheets from the last world`);
  return n;
}

/** a stage is starting in `world`: when that is a different world from the last one, the old world's sheets are let go */
export function enterWorld(world: number) {
  if (heldWorld && world !== heldWorld) releaseWorldArt();
  heldWorld = world;
}

/** how many world sheets are held (for the tests) */
export const heldSheets = (): number => held.size;
