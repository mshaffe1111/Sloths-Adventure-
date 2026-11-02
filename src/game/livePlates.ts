/**
 * Moving story backdrops (test): the parts of a plate that move (fire, fireflies, rain, mist), cut from a Wan clip of the plate by the live-plate
 * cutter (src/assets/story/live/<plate>.webp, livePlateData.ts), drawn over the still painting so it stays sharp. Neighbouring frames are blended,
 * so 8 frames a second looks smooth, and the end blends into the start, so it loops.
 *
 * On with the same switch as Pokey's new clips (heroClips.ts): on since 2026-10-24, `?clips=0` turns both off.
 *
 * A sheet is kept at 8 MB decoded or less (tools/art/hfstory/livecut.py), and only KEEP sheets are held at once (the plate showing and the next one), and a story that
 * closes lets them all go (memory audit, 2026-10-25: all thirteen came to 278 MB, kept for good).
 */
import { LIVE_PLATES } from './livePlateData.ts';
import { heroClipsEnabled } from './heroClips.ts';
import { learned } from './frameGovernor.ts';

const imgs = new Map<string, HTMLImageElement>();
const KEEP = 2;
function sheet(key: string): HTMLImageElement | null {
  if (!LIVE_PLATES[key] || typeof Image === 'undefined') return null;
  let im = imgs.get(key);
  if (im) {
    // most recently used goes to the end, so the oldest is the one let go
    imgs.delete(key);
    imgs.set(key, im);
  } else {
    im = new Image();
    im.src = new URL(`../assets/story/live/${key}.webp`, import.meta.url).href;
    imgs.set(key, im);
    for (const k of imgs.keys()) {
      if (imgs.size <= KEEP) break;
      imgs.delete(k);
    }
  }
  return im.complete && im.naturalWidth > 0 ? im : null;
}

/** let go of every sheet (a story has closed) */
export function releaseLivePlates() {
  imgs.clear();
}

/** start loading the moving parts of the plates a cutscene will show */
export function preloadLivePlates(keys: Array<string | undefined>) {
  if (!heroClipsEnabled()) return;
  for (const k of keys) if (k) sheet(k);
}

/** the frame pair to show at time t and how far between them (pure, for the tests) */
export function liveFrameAt(n: number, fps: number, t: number): { a: number; b: number; u: number } {
  const f = (((t * fps) % n) + n) % n;
  const a = Math.floor(f);
  return { a, b: (a + 1) % n, u: f - a };
}

/**
 * draws the moving parts over a plate that was drawn at (px, py) with scale s (plate pixels to screen). Returns false when the plate has no clip,
 * the switch is off or the sheet is still loading (the still painting alone is then right).
 */
export function drawLivePlate(ctx: CanvasRenderingContext2D, key: string, px: number, py: number, s: number, t: number): boolean {
  const L = LIVE_PLATES[key];
  // (a phone the frame governor has stepped down shows the still painting: the moving parts are the first thing to go)
  if (!L || !heroClipsEnabled() || learned.quality > 0) return false;
  const im = sheet(key);
  if (!im) return false;
  const { a, b, u } = liveFrameAt(L.n, L.fps, t);
  const dx = px + L.x * s;
  const dy = py + L.y * s;
  const dw = L.pw * s;
  const dh = L.ph * s;
  const at = (i: number) => [(i % L.cols) * L.w, Math.floor(i / L.cols) * L.h] as const;
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  const [ax, ay] = at(a);
  ctx.drawImage(im, ax, ay, L.w, L.h, dx, dy, dw, dh);
  if (u > 0.02) {
    const [bx, by] = at(b);
    ctx.globalAlpha *= u;
    ctx.drawImage(im, bx, by, L.w, L.h, dx, dy, dw, dh);
  }
  ctx.restore();
  return true;
}
