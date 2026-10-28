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
  const entry: Held | null = forget ? { img, forget, gone: false, url } : null;
  if (entry) held.add(entry);
  const sheet: Sheet = { img, ready: false, warm: false, waiters: [] };
  sheets.set(url, sheet);
  const name = url.split('/').pop()?.split('?')[0] ?? '';
  // (sheets load the first time something draws with them: asked for in the middle of a stage, that thing is a stand-in, or nothing,
  // until the sheet arrives; the control test notes it, once per sheet per stage, as a likely flicker)
  if (recorder.on) recorder.blank(name, 'wait');
  const ready = () => {
    if (entry?.gone) return;
    perfNote(`sheet ready: ${url.split('/').pop()} (${Math.round(performance.now() - t0)} ms to load and decode)`);
    // (the control test notes each sheet as it arrives, so a stall can be matched to the picture that caused it)
    lastSheet.name = name;
    lastSheet.at = performance.now();
    if (recorder.on) recorder.event('sheet', `${lastSheet.name} ${Math.round(performance.now() - t0)}ms`);
    sheet.ready = true;
    settle(sheet);
    onReady();
  };
  img.onload = () => {
    if (typeof img.decode === 'function') img.decode().then(ready, ready);
    else ready();
  };
  img.onerror = () => {
    if (entry) held.delete(entry);
    dropSheet(url, sheet);
    if (entry?.gone) return;
    if (recorder.on) recorder.blank(name, 'fail');
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
  url: string;
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
    const sh = sheets.get(h.url);
    if (sh?.img === h.img) dropSheet(h.url, sh);
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

/**
 * Every sheet asked for (by its address), so a stage about to start can wait for the ones it needs and have them decoded and drawn
 * once before play begins (stagePreload.ts), or, for one that arrives during play, the frame it arrives (sheetWarm.ts). A browser
 * may put off the real decode, and handing the picture to the graphics, until the first time it is drawn: on a phone that first draw
 * of a 10 to 20 MB sheet was a 376 to 472 ms freeze right as a stage began (QA's control-test logs, 2026-10-26: 'stall ... after
 * w3-props', 'after w4-props').
 */
interface Sheet {
  img: HTMLImageElement;
  ready: boolean;
  /** drawn once already (warmSheets) */
  warm: boolean;
  waiters: (() => void)[];
}
const sheets = new Map<string, Sheet>();
function settle(s: Sheet) {
  const w = s.waiters;
  s.waiters = [];
  for (const f of w) f();
}
function dropSheet(url: string, s: Sheet) {
  if (sheets.get(url) === s) sheets.delete(url);
  settle(s);
}

/** whether the sheet at this address has been drawn once already (warmSheets) */
export const sheetWarm = (url: string): boolean => !!sheets.get(url)?.warm;

/** whether the sheet at this address has loaded and decoded */
export const sheetReady = (url: string): boolean => !!sheets.get(url)?.ready;

/**
 * Resolves once each of these sheets has loaded and decoded, failed, or was never asked for (its module did not start it), or after
 * `ms`, whichever is first. Resolves with how many were ready.
 */
export function whenSheetsReady(urls: readonly string[], ms: number): Promise<number> {
  return new Promise((resolve) => {
    let left = 0;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve(urls.filter(sheetReady).length);
    };
    const timer = setTimeout(finish, ms);
    for (const u of urls) {
      const s = sheets.get(u);
      if (!s || s.ready) continue;
      left++;
      s.waiters.push(() => {
        if (--left <= 0) finish();
      });
    }
    if (left === 0) finish();
  });
}

/**
 * Draw each of these sheets that is ready once, at its own size, into a corner of `ctx` (then clear that corner): the browser decodes it
 * in full and hands it to the graphics now, behind a menu, instead of on the first frame of play. Only the first time for each sheet.
 * Returns how many were drawn (at most `max`).
 */
export function warmSheets(urls: readonly string[], ctx: CanvasRenderingContext2D | null, max = Infinity): number {
  if (!ctx) return 0;
  let n = 0;
  for (const u of urls) {
    if (n >= max) break;
    const s = sheets.get(u);
    if (!s || !s.ready || s.warm) continue;
    const w = Math.min(4, s.img.naturalWidth || 4), h = Math.min(4, s.img.naturalHeight || 4);
    try {
      // (1:1, a few pixels: a scaled-down draw could be served from a smaller decode, and the full-size one would still wait for play)
      ctx.drawImage(s.img, 0, 0, w, h, 0, 0, w, h);
      ctx.clearRect(0, 0, w, h);
      s.warm = true;
      n++;
    } catch {
      /* not drawable yet: play draws it as before */
    }
  }
  return n;
}
