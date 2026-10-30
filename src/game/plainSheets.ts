/**
 * plainSheets — the sheets a module loads as a plain picture, not through atlasLoader.ts (Pokey's moving clips, heroClips.ts; the keepsake
 * pickups, pickupSprites.ts): loaded and decoded here by their address, which the browser shares with the module's own copy, and each
 * drawn once (a few pixels, 1:1) before a stage's first frame, as atlasLoader.ts warmSheets does for the rest. Kept for the session:
 * every stage shows them, and the modules keep their own copies anyway.
 *
 * Pokey's clips are 17 sheets, 76 MB decoded: loaded as each stage started and decoded on their first draw, in the middle of play (the
 * first kick, the first teeter at a ledge).
 */
import { HERO_CLIPS } from './heroClipsData.ts';
import { heroClipsEnabled } from './heroClips.ts';

// (no bundler under the test runner: no pickups there)
let PICKUPS: string[] = [];
try {
  PICKUPS = Object.values(import.meta.glob('../assets/pickups/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>);
} catch {
  PICKUPS = [];
}

/** the addresses of the sheets these keys load as plain pictures ('hero-clips', 'pickups': stageManifest.ts ALWAYS) */
export function plainUrls(keys: readonly string[]): string[] {
  const out: string[] = [];
  if (keys.includes('hero-clips') && heroClipsEnabled() && typeof document !== 'undefined') {
    for (const n of Object.keys(HERO_CLIPS)) out.push(new URL(`../assets/hero/clips/${n}.webp`, import.meta.url).href);
  }
  if (keys.includes('pickups')) out.push(...PICKUPS);
  return out;
}

interface Plain {
  img: HTMLImageElement;
  done: Promise<void>;
  ok: boolean;
  warm: boolean;
}
const plain = new Map<string, Plain>();

/** load and decode these (once each); resolves when all have, or failed */
export function loadPlain(urls: readonly string[]): Promise<void> {
  if (typeof Image === 'undefined') return Promise.resolve();
  return Promise.all(urls.map(loadOne)).then(() => {});
}
function loadOne(url: string): Promise<void> {
  const hit = plain.get(url);
  if (hit) return hit.done;
  const img = new Image();
  const entry: Plain = { img, done: Promise.resolve(), ok: false, warm: false };
  entry.done = new Promise<void>((res) => {
    img.onload = () => {
      const fin = () => {
        entry.ok = true;
        res();
      };
      if (typeof img.decode === 'function') img.decode().then(fin, fin);
      else fin();
    };
    // (a failed fetch: the next stage tries again, and the module draws its stand-in meanwhile, as before)
    img.onerror = () => {
      plain.delete(url);
      res();
    };
  });
  img.src = url;
  plain.set(url, entry);
  return entry.done;
}

/** draw each of these that has loaded once, a few pixels at its own size, into a corner of `ctx` (only the first time); how many */
export function warmPlain(urls: readonly string[], ctx: CanvasRenderingContext2D): number {
  let n = 0;
  for (const u of urls) {
    const e = plain.get(u);
    if (!e || !e.ok || e.warm) continue;
    const w = Math.min(4, e.img.naturalWidth || 4), h = Math.min(4, e.img.naturalHeight || 4);
    try {
      ctx.drawImage(e.img, 0, 0, w, h, 0, 0, w, h);
      ctx.clearRect(0, 0, w, h);
      e.warm = true;
      n++;
    } catch {
      /* not drawable: play draws it as before */
    }
  }
  return n;
}
