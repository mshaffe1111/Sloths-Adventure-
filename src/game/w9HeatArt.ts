/**
 * World 9's heat hazards on the geyser's rhythm (zones.ts Zone `look`, GRAB-BAG.md), in Matt's painted World 9 pieces:
 *   flare     the hot platform of the W9 props sheet (props-made/w9b 'hot-platform') laid on the route: resting, its cracks are dark (the
 *             cool copy, made once from the painted slab); warning, the hot slab bleeds in over it and shivers; flaring, the hazards
 *             sheet's lava fountain spits low off it. (The cool copy is the stand-in for the painted cool frame on the HF list: §6 #1)
 *   lavafall  the hazards sheet's lava fountain poured from above the frame: drips first (a thin trickle, the warning), then the column
 *             down to the ground and a splash where it lands
 */
import type { Zone, ZoneState } from './zones.ts';
import { drawW9Hazard } from './w9Art.ts';

const W9B_URL = new URL('../assets/w6to10/props-made/w9b.webp', import.meta.url).href;
/** props-made/w9b.json 'hot-platform'; laid flush in the route, `top` of its height above the ground line (its top face in the ground, its
 *  front edge down the bank's face), so he walks over it, never into it */
const SLAB = { x: 567, y: 0, w: 434, h: 211, top: 0.19 } as const;

let im: HTMLImageElement | null = null;
let ok = false;
let cool: HTMLCanvasElement | null = null;
function slabImg(): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  if (!im) {
    im = new Image();
    im.onload = () => (ok = true);
    im.src = W9B_URL;
  }
  return ok ? im : null;
}
/** the slab with its lava cracks gone dark: the glowing pixels (hot and saturated) pulled down to cooled rock, once */
function coolSlab(src: HTMLImageElement): HTMLCanvasElement | null {
  if (cool || typeof document === 'undefined') return cool;
  const c = document.createElement('canvas');
  c.width = SLAB.w;
  c.height = SLAB.h;
  const g = c.getContext('2d');
  if (!g) return null;
  g.drawImage(src, SLAB.x, SLAB.y, SLAB.w, SLAB.h, 0, 0, SLAB.w, SLAB.h);
  try {
    const d = g.getImageData(0, 0, SLAB.w, SLAB.h);
    const p = d.data;
    for (let i = 0; i < p.length; i += 4) {
      const r = p[i], gg = p[i + 1], b = p[i + 2];
      const hot = Math.max(0, Math.min(1, (r - b - 40) / 120));
      if (hot <= 0) continue;
      // (toward the slab's own dark basalt, a faint ember left in the deepest cracks)
      const k = hot * 0.86;
      p[i] = r * (1 - k) + 70 * k;
      p[i + 1] = gg * (1 - k) + 42 * k;
      p[i + 2] = b * (1 - k) + 40 * k;
    }
    g.putImageData(d, 0, 0);
  } catch {
    /* a tainted canvas: the hot slab alone */
  }
  cool = c;
  return c;
}

/** the slab where the zone lies, its heat by the zone's phase */
export function drawW9Flare(ctx: CanvasRenderingContext2D, z: Zone, st: ZoneState, t: number): void {
  const src = slabImg();
  if (!src) return;
  const w = z.x1 - z.x0 + 30;
  const h = (SLAB.h * w) / SLAB.w;
  const x = z.x0 - 15;
  const y = z.baseY - SLAB.top * h;
  const heat = st.phase === 'warn' ? Math.min(1, st.u * 1.2) : st.phase === 'active' ? 1 : 0;
  const shiver = st.phase === 'warn' ? Math.sin(t * 55) * 1.8 * st.u : 0;
  const c = coolSlab(src);
  if (c) ctx.drawImage(c, x + shiver, y, w, h);
  if (heat > 0 || !c) {
    ctx.save();
    ctx.globalAlpha = c ? heat : 1;
    ctx.drawImage(src, SLAB.x, SLAB.y, SLAB.w, SLAB.h, x + shiver, y, w, h);
    ctx.restore();
  }
}

/** flaring: low fountains spitting off the slab, across its width */
export function drawW9FlareBurst(ctx: CanvasRenderingContext2D, z: Zone, st: ZoneState): void {
  if (st.phase !== 'active') return;
  const n = Math.max(2, Math.round((z.x1 - z.x0) / 80));
  const frame = st.u < 0.2 ? 'burst0' : st.u < 0.75 ? 'burst1' : 'burst2';
  const full = (z.baseY - z.top) * Math.min(1, st.strength * 1.3) + 10;
  for (let i = 0; i < n; i++) {
    const cx = z.x0 + ((i + 0.5) / n) * (z.x1 - z.x0);
    const h = full * (0.8 + 0.2 * ((i * 7) % 3) / 2);
    const w = h * 0.55;
    drawW9Hazard(ctx, frame, cx - w / 2, z.baseY - h + 6, w, h);
  }
}

/** the lavafall: a trickle as it warns, the poured column while it is active, a splash at its foot */
export function drawW9Lavafall(ctx: CanvasRenderingContext2D, z: Zone, st: ZoneState, t: number): void {
  const cx = (z.x0 + z.x1) / 2;
  const w = z.x1 - z.x0;
  const len = z.baseY - z.top;
  if (st.phase === 'warn') {
    // (drips: a thin poured strand that thickens as it comes)
    const tw = w * (0.32 + 0.3 * st.u);
    ctx.save();
    ctx.globalAlpha = 0.75 + 0.25 * st.u;
    drawW9Hazard(ctx, 'burst2', cx - tw / 2, z.top, tw, len, true);
    ctx.restore();
    return;
  }
  if (st.phase !== 'active') return;
  const frame = Math.floor(t * 10) % 2 ? 'burst1' : 'burst2';
  const cw = w * (1.05 + 0.15 * st.strength);
  drawW9Hazard(ctx, frame, cx - cw / 2, z.top, cw, len, true);
  const sw = w * 2.2;
  drawW9Hazard(ctx, `splash${Math.floor(t * 8) % 3}`, cx - sw / 2, z.baseY - sw * 0.6, sw, sw * 0.6);
}
