/**
 * w10DropArt — World 10's drop gate (GRAB-BAG D: a 'bolt' zone with look 'portcullis'): the gatehouse over the wall-walk, Matt's portcullis
 * in its stone arch (props-made/w10a 'portcullis-up', the gate raised into the wall: drawn behind Pokey), and the gate's bars (the
 * 'portcullis-down' painting's own bars with the dark between them cut away, w10/dropgate.webp: drawn in front of him), which shudder as
 * it warns and slam down while it is down. Both return false until their sheet has loaded.
 */
import { trackAtlas } from './atlasLoader.ts';
import { drawW10Piece } from './w10PuzzleArt.ts';
import type { Zone, ZoneState } from './zones.ts';

const BARS_URL = new URL('../assets/w10/dropgate.webp', import.meta.url).href;
export const W10_DROP_URLS: readonly string[] = [BARS_URL];
/** the gatehouse's drawn height over the walk (world px) and its painting's frame (w10a 'portcullis-*': 374 x 434) */
export const GATE_H = 240;
const FRAME = { w: 374, h: 434 };
/** the doorway in the painting (where the bars run), in its px */
const OPENING = { x0: 66, x1: 308, y0: 52, y1: 434 };

let bars: HTMLImageElement | null = null;
let barsReady = false;
function barsImg(): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  if (!bars) {
    const im = new Image();
    bars = im;
    trackAtlas(im, BARS_URL, () => (barsReady = true), () => (bars = null), () => ((bars = null), (barsReady = false)));
  }
  return barsReady ? bars : null;
}
export const w10DropReady = (): boolean => !!barsImg();

/** how far down the gate is, 0 (up in the wall) .. 1 (on the walk), and its shudder (px) */
function dropOf(st: ZoneState, t: number): { down: number; shake: number } {
  if (st.phase === 'warn') return { down: 0.04 + 0.04 * st.u, shake: (1 + 2 * st.u) * Math.sin(t * 46) };
  if (st.phase === 'active') return { down: Math.min(1, st.strength * 1.6), shake: 0 };
  return { down: 0, shake: 0 };
}

/** the gatehouse, behind him (the arch, the dark doorway, the gate's spikes just showing under its lintel) */
export function drawW10Gatehouse(ctx: CanvasRenderingContext2D, z: Zone): boolean {
  return drawW10Piece(ctx, 'portcullis-up', (z.x0 + z.x1) / 2, z.baseY + 6, GATE_H);
}

/** the bars, in front of him: up in the wall at rest, shuddering as it warns, down while it is down */
export function drawW10DropBars(ctx: CanvasRenderingContext2D, z: Zone, st: ZoneState, t: number): boolean {
  const img = barsImg();
  if (!img) return false;
  const s = GATE_H / FRAME.h;
  const cx = (z.x0 + z.x1) / 2;
  const left = cx - (FRAME.w / 2) * s + OPENING.x0 * s;
  const top = z.baseY + 6 - GATE_H + OPENING.y0 * s;
  const w = (OPENING.x1 - OPENING.x0) * s;
  const h = (OPENING.y1 - OPENING.y0) * s;
  const { down, shake } = dropOf(st, t);
  // (raised, all but the spike tips is in the wall above the doorway: clipped to the doorway, the bars slide out of its top)
  const y = top - (1 - down) * h * 0.92 + shake;
  if (y + h < top + 2) return true;
  ctx.save();
  ctx.beginPath();
  ctx.rect(left - 2, top, w + 4, h);
  ctx.clip();
  ctx.drawImage(img, left, y, w, h);
  ctx.restore();
  return true;
}
