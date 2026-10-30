/**
 * Painted castles for the story. The Highland Fortress in the World 10 story pictures used to be four flat towers drawn in code; these are
 * painted moonlit castles (from the castle sheet, upscaled and cleaned) that fill the picture behind the actors.
 *
 * Each painting is drawn at the picture's height and centred on its castle, with feathered side edges over a dark, blurred copy of
 * itself that fills any extra width (the story picture is 16:9 on a phone and wider on a desktop). Both layers are built once when
 * the image has loaded. A switch like the other painted art: `?castles=classic` brings the drawn fortress back, which is also what
 * shows until the image has loaded (draw returns false).
 */
import { trackAtlas } from './atlasLoader.ts';

export const DEFAULT_SPRITE_CASTLES = true;

/** the castle the Highland Fortress is, unless a picture asks for another */
export const FORTRESS_CASTLE = 6;

/** the castles shipped: where the castle stands across the painting (0-1) */
export const CASTLES: Record<number, { name: string; x: number }> = {
  5: { name: "Midnight's Grim", x: 0.4 },
  6: { name: 'Peak of Peril', x: 0.66 },
  7: { name: 'Overgrown Tower', x: 0.62 },
};

let enabled: boolean | null = null;
function isEnabled(): boolean {
  if (enabled !== null) return enabled;
  let v = DEFAULT_SPRITE_CASTLES;
  try {
    const q = new URLSearchParams(location.search).get('castles');
    if (q === 'sprite') v = true;
    else if (q === 'classic') v = false;
    else if (localStorage.getItem('sloth_castles') === 'classic') v = false;
  } catch {
    /* no window or storage: keep the default */
  }
  enabled = v;
  return v;
}

interface Built { fg: HTMLCanvasElement; bg: HTMLCanvasElement; w: number; h: number }
const built: Record<number, Built | undefined> = {};
const loading: Record<number, boolean | undefined> = {};

const urls: Record<number, string> = {
  5: new URL('../assets/story/castle5.webp', import.meta.url).href,
  6: new URL('../assets/story/castle6.webp', import.meta.url).href,
  7: new URL('../assets/story/castle7.webp', import.meta.url).href,
};

function build(img: HTMLImageElement): Built {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  // the sharp layer: the painting with its side and bottom edges feathered away
  const fg = document.createElement('canvas');
  fg.width = w;
  fg.height = h;
  const g = fg.getContext('2d')!;
  g.drawImage(img, 0, 0);
  g.globalCompositeOperation = 'destination-in';
  const hx = g.createLinearGradient(0, 0, w, 0);
  hx.addColorStop(0, 'rgba(0,0,0,0)');
  hx.addColorStop(0.14, 'rgba(0,0,0,1)');
  hx.addColorStop(0.86, 'rgba(0,0,0,1)');
  hx.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = hx;
  g.fillRect(0, 0, w, h);
  const vy = g.createLinearGradient(0, 0, 0, h);
  vy.addColorStop(0, 'rgba(0,0,0,0)');
  vy.addColorStop(0.12, 'rgba(0,0,0,1)');
  vy.addColorStop(0.9, 'rgba(0,0,0,1)');
  vy.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = vy;
  g.fillRect(0, 0, w, h);
  // the filler: a small, blurred, darkened copy stretched over the whole picture
  const bg = document.createElement('canvas');
  bg.width = 192;
  bg.height = 108;
  const b = bg.getContext('2d')!;
  try { b.filter = 'blur(5px)'; } catch { /* no ctx.filter: the small size alone softens it */ }
  const cover = Math.max(bg.width / w, bg.height / h);
  b.drawImage(img, (bg.width - w * cover) / 2, (bg.height - h * cover) / 2, w * cover, h * cover);
  b.filter = 'none';
  b.fillStyle = 'rgba(6, 8, 20, 0.35)';
  b.fillRect(0, 0, bg.width, bg.height);
  return { fg, bg, w, h };
}

function load(n: number) {
  if (loading[n] || typeof Image === 'undefined' || !urls[n]) return;
  loading[n] = true;
  const img = new Image();
  trackAtlas(img, urls[n], () => { built[n] = build(img); }, () => { loading[n] = false; });
}

/** true when the painted castles are on (starts loading the one asked for) */
export function castlePainted(n: number): boolean {
  if (!isEnabled()) return false;
  load(n);
  return !!built[n];
}

/**
 * paints castle `n` over a w x h picture, and `top` more above it upright (it overscans the bottom so a lifted picture never shows a gap). `t` drifts it very slowly.
 * Returns false when the painted castle is off or not loaded yet.
 */
export function drawCastleBackdrop(ctx: CanvasRenderingContext2D, n: number, w: number, h: number, t: number, top = 0): boolean {
  if (!castlePainted(n)) return false;
  const b = built[n]!;
  const info = CASTLES[n] ?? { name: '', x: 0.5 };
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  // the filler covers everything, with room for the camera's zoom and lift
  ctx.drawImage(b.bg, -w * 0.5, -h * 0.3 - top, w * 2, h * 1.8 + top);
  // the painting: the picture's height (upright, with the room above it: `top`, storyArt.ts drawStoryScene, or its top edge showed as a
  // hard line across the sky), castle centred at 0.64 of the width, with a slow push
  const sc = (top > 0 ? (h * 1.02 + top) * 1.02 : h * 0.95) / b.h * (1 + 0.012 * Math.sin(t * 0.12));
  const dw = b.w * sc;
  const dh = b.h * sc;
  const x0 = w * 0.64 - info.x * dw + Math.sin(t * 0.09) * 6;
  ctx.drawImage(b.fg, x0, h * 1.02 - dh, dw, dh);
  ctx.restore();
  return true;
}
