/**
 * A thin warm-cream rim of light around Pokey, so his brown fur never melts into brown trunks, soil and wood.
 * It is drawn once per frame into a small cached canvas: the frame's silhouette is stamped in a few rings around it
 * (no canvas filters, which older phones lack), then the painted frame is drawn on top.
 * A switch while it is being judged: `?rim=1` for a session, or `localStorage.sloth_rim = '1'`; off by default.
 */
export const DEFAULT_RIM = false;

let on: boolean | null = null;
export function rimOn(): boolean {
  if (on !== null) return on;
  let q: string | null = null;
  let s: string | null = null;
  try {
    q = new URLSearchParams(window.location.search).get('rim');
    s = window.localStorage.getItem('sloth_rim');
  } catch {
    /* no window */
  }
  on = q === '1' ? true : q === '0' ? false : s === '1' ? true : s === '0' ? false : DEFAULT_RIM;
  return on;
}

export interface RimFrame {
  x: number;
  y: number;
  w: number;
  h: number;
}

const cache = new Map<string, HTMLCanvasElement | null>();
const RING_STAMPS = 14;

/** the rim picture for one frame: `r` sheet pixels wide; draw it `pad` sheet pixels up and left of the frame, beneath the frame */
export function rimFor(key: string, src: CanvasImageSource, f: RimFrame, r: number, colour = '#fff0c4'): { img: HTMLCanvasElement; pad: number } | null {
  const pad = r + 2;
  const hit = cache.get(key);
  if (hit !== undefined) return hit ? { img: hit, pad } : null;
  let out: HTMLCanvasElement | null = null;
  try {
    const W = Math.ceil(f.w + pad * 2);
    const H = Math.ceil(f.h + pad * 2);
    const sil = document.createElement('canvas');
    sil.width = W;
    sil.height = H;
    const sx = sil.getContext('2d');
    if (!sx) throw new Error('no canvas');
    sx.drawImage(src, f.x, f.y, f.w, f.h, pad, pad, f.w, f.h);
    sx.globalCompositeOperation = 'source-in';
    sx.fillStyle = colour;
    sx.fillRect(0, 0, W, H);
    out = document.createElement('canvas');
    out.width = W;
    out.height = H;
    const ox = out.getContext('2d');
    if (!ox) throw new Error('no canvas');
    // outer glow first (faint, wide), then the crisp rim, so the rim reads as a line and the glow as air around it
    const rings: Array<[number, number]> = [
      [r, 0.22],
      [r * 0.78, 0.35],
      [r * 0.5, 0.9],
      [r * 0.26, 1],
    ];
    for (const [rad, a] of rings) {
      ox.globalAlpha = a;
      for (let i = 0; i < RING_STAMPS; i++) {
        const t = (i / RING_STAMPS) * Math.PI * 2;
        ox.drawImage(sil, Math.cos(t) * rad, Math.sin(t) * rad);
      }
    }
    ox.globalAlpha = 1;
    ox.drawImage(sil, 0, 0);
  } catch {
    out = null;
  }
  cache.set(key, out);
  return out ? { img: out, pad } : null;
}
