/**
 * crumbleArt — World 7's crumbling ruin tiles drawn from Matt's painted crumble frames (the 7-4 slide's sheet, copied to
 * src/assets/w7/crumble.webp: cracked, breaking, falling; its whole slab is not used), so a tile reads as fragile at a glance
 * (STAGE-RULES §5b item 3: "a kid has to see it will break"):
 *   at rest       the CRACKED slab (never the whole one: every crumbling tile shows its cracks before he steps on it)
 *   stood on      the cracked slab shaking harder as its hold runs out (spanArt shakeOffset), then the BREAKING frame for the last third
 *   broken        the FALLING pieces drop and fade for FALL_S seconds, then nothing until it grows back (regrow.ts)
 * The frames are drawn a tile wide and DRAW_K of that deep (a gentle squash of the painted slab, so the sunken hall under a run of tiles still
 * has the headroom Pokey walks through); the tile's collider is CRUMBLE_H of that (gen2 pipeline), the hanging moss below it is not solid.
 *
 * drawCrumbleTile returns false until the sheet has loaded, and the caller draws the old kit plank and code cracks.
 */
import { trackAtlas } from './atlasLoader.ts';
import { regrowDelay } from './regrow.ts';
import type { Platform } from './types.ts';

export const CRUMBLE_ART_URL = new URL('../assets/w7/crumble.webp', import.meta.url).href;
const FRAMES = {
  cracked: { x: 426, y: 0, w: 300, h: 181 },
  breaking: { x: 794, y: 6, w: 342, h: 230 },
  falling: { x: 1150, y: 40, w: 390, h: 256 },
} as const;
/** how deep a tile is drawn for each px of its width (the painted slab is 181 / 300: squashed to about 0.42) */
const DRAW_K = 46 / 110;
/** how long the falling pieces show after a tile breaks (s) */
const FALL_S = 0.6;

let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(
    im,
    CRUMBLE_ART_URL,
    () => {
      ready = true;
    },
    () => {
      img = null;
    },
    () => {
      img = null;
      ready = false;
    },
  );
}
/** whether the sheet has loaded (starts the load) */
export function crumbleArtReady(): boolean {
  load();
  return ready && !!img;
}

function blit(ctx: CanvasRenderingContext2D, n: keyof typeof FRAMES, x: number, y: number, w: number) {
  const f = FRAMES[n];
  // (one scale for every frame, the cracked slab's: a tile wide, DRAW_K of that deep; the breaking and falling pieces keep their size
  // and their place under the slab's top, centred on the tile)
  const sx = w / FRAMES.cracked.w;
  const sy = (DRAW_K * w) / FRAMES.cracked.h;
  ctx.drawImage(img!, f.x, f.y, f.w, f.h, x - (f.w * sx - w) / 2, y + f.y * sy, f.w * sx, f.h * sy);
}

/**
 * One crumbling tile, painted (at rest, shaking, breaking), or its falling pieces just after it broke. `dx`, `dy` the shake (spanArt
 * shakeOffset). Returns false when the sheet is not loaded yet (or the tile is not a crumbling one).
 */
export function drawCrumbleTile(ctx: CanvasRenderingContext2D, p: Platform, time: number, dx = 0, dy = 0): boolean {
  if (p.crumbleAfter === undefined || !crumbleArtReady()) return false;
  const w = p.width + 6;
  const x = p.x - 3 + dx;
  if (p.broken) {
    const since = p.regrowAt === undefined ? Infinity : time - (p.regrowAt - regrowDelay(p.id));
    if (since < 0 || since > FALL_S) return true;
    const u = since / FALL_S;
    ctx.save();
    ctx.globalAlpha = 1 - u * u;
    blit(ctx, 'falling', x, p.y + 4 + 260 * u * u, w);
    ctx.restore();
    return true;
  }
  const prog = p.fragileTimer === undefined ? 0 : Math.max(0, Math.min(1, 1 - p.fragileTimer / p.crumbleAfter));
  blit(ctx, prog > 0.66 ? 'breaking' : 'cracked', x, p.y - 2 + dy + prog * 3, w);
  return true;
}
