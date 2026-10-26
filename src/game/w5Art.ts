/**
 * w5Art — World 5's painted pieces (Orchid Sanctuary concept art, approved by Matt 2026-10-26: tools/art/w5/props.py), and the
 * council's garden behind the Queen's fight and her tea.
 *
 * The pieces (w5PropsData.ts lists them all, grouped): the tea table for two with its card, the soft armchairs that tug, the teapot
 * (its sleepy steam is the game's to draw: steamPuff below), cups and the tiny cakes (cakeIcon for a pickup), Meeca's trunks with
 * blank bark (the words are the game's: drawCarving below), ferns, the closing orchids open, half and closed, the hanging rows and the
 * pink bell, silk threads, the bridge and the sheet, the lace doilies, the visitors' wrapped chairs, cocoons wrapped and torn, the exit
 * totem lit and dark, and the lace pennant checkpoint. Every draw does nothing (returns false) until the atlas has loaded, so callers
 * keep a stand-in for that moment. The sheet is a World 5 sheet: it is let go when play moves to another world (atlasLoader.ts), and
 * stagePreload.ts decodes it before a hand-built World 5 stage starts ('w5-props' in stageSheets.ts).
 */
import { trackAtlas } from './atlasLoader.ts';
import { W5_FRAMES } from './w5PropsData.ts';

export type W5Piece = keyof typeof W5_FRAMES;

/** the sheet's address */
export const W5_PROPS_URL = new URL('../assets/props/w5-props.webp', import.meta.url).href;
let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(im, W5_PROPS_URL, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; });
}

/** whether the World 5 pieces have loaded (starts the load) */
export function w5ArtReady(): boolean {
  load();
  return ready && !!img;
}

/** a piece's drawn height at width w */
export function w5Height(n: W5Piece, w: number): number {
  const f = W5_FRAMES[n];
  return (w * f.h) / f.w;
}

/** a piece's drawn width at height h */
export function w5Width(n: W5Piece, h: number): number {
  const f = W5_FRAMES[n];
  return (h * f.w) / f.h;
}

/**
 * Draw a piece `w` wide with its bottom middle at (x, bottom), turned `rot` radians about that point, mirrored with `flip`.
 * Returns false (and draws nothing) before the atlas has loaded.
 */
export function drawW5(ctx: CanvasRenderingContext2D, n: W5Piece, x: number, bottom: number, w: number, opts: { flip?: boolean; rot?: number; alpha?: number } = {}): boolean {
  if (!w5ArtReady()) return false;
  const f = W5_FRAMES[n];
  const h = (w * f.h) / f.w;
  ctx.save();
  ctx.translate(x, bottom);
  if (opts.rot) ctx.rotate(opts.rot);
  if (opts.flip) ctx.scale(-1, 1);
  if (opts.alpha !== undefined) ctx.globalAlpha *= opts.alpha;
  ctx.drawImage(img!, f.x, f.y, f.w, f.h, -w / 2, -h, w, h);
  ctx.restore();
  return true;
}

/** draw a piece stretched to fill the box (x, y, w, h): a silk thread or bridge spanning a gap, a doily ledge. False until loaded. */
export function drawW5Box(ctx: CanvasRenderingContext2D, n: W5Piece, x: number, y: number, w: number, h: number, flip = false): boolean {
  if (!w5ArtReady()) return false;
  const f = W5_FRAMES[n];
  if (flip) {
    ctx.save();
    ctx.translate(x + w, y);
    ctx.scale(-1, 1);
    ctx.drawImage(img!, f.x, f.y, f.w, f.h, 0, 0, w, h);
    ctx.restore();
  } else ctx.drawImage(img!, f.x, f.y, f.w, f.h, x, y, w, h);
  return true;
}

/**
 * The closing orchid's look at `open` (1 open, 0 shut): open, half or closed, whichever is nearest, with a little squash and spring as
 * it passes from one to the next (two different shapes crossfaded read as a ghost). Bottom middle at (x, bottom), `w` wide (the half
 * bloom and the closed bud are drawn narrower, as painted). `take`: 1 or 2, the second open and half blooms.
 */
export function drawW5Orchid(ctx: CanvasRenderingContext2D, x: number, bottom: number, w: number, open: number, take: 1 | 2 = 1): boolean {
  if (!w5ArtReady()) return false;
  const k = Math.max(0, Math.min(1, open));
  const n: W5Piece = k > 0.66 ? (take === 2 ? 'orchidOpen2' : 'orchidOpen') : k > 0.33 ? (take === 2 ? 'orchidHalf2' : 'orchidHalf') : 'orchidClosed';
  const ww = n === 'orchidClosed' ? w * 0.55 : k > 0.66 ? w : w * 0.75;
  // (how near the next change it is: 0 at a change, 1 well away from one)
  const edge = Math.min(Math.abs(k - 0.66), Math.abs(k - 0.33)) / 0.12;
  const squash = 1 - 0.08 * Math.max(0, 1 - Math.min(1, edge));
  ctx.save();
  ctx.translate(x, bottom);
  ctx.scale(2 - squash, squash);
  drawW5(ctx, n, 0, 0, ww);
  ctx.restore();
  return true;
}

/**
 * The sleepy steam from a warm teapot (DON'T DRINK): soft pale puffs rising and spreading from the spout at (x, y), `k` 0 to 1 how
 * strong the puff is now (the hazard's own rhythm), `t` the game time in seconds. Plain circles, no picture: it draws at once.
 */
export function steamPuff(ctx: CanvasRenderingContext2D, x: number, y: number, k: number, t: number, scale = 1, strong = 0): void {
  if (k <= 0.01) return;
  ctx.save();
  // (`strong` 0..1: the hazard's puff, thicker and edged in a sleepy lilac so it reads against the pale gold garden at a glance)
  const body = 0.42 + 0.36 * strong;
  for (let i = 0; i < 6; i++) {
    const age = (t * 0.55 + i / 6) % 1;
    const r = (6 + age * 22) * scale;
    const px = x + Math.sin(age * 5 + i * 1.7) * 9 * scale + age * 10 * scale;
    const py = y - age * 70 * scale;
    ctx.globalAlpha = k * body * (1 - age) * Math.min(1, age * 6);
    ctx.fillStyle = strong > 0 ? (i % 2 ? '#ead8ff' : '#f8dcf4') : i % 2 ? '#f6ecff' : '#ffe8f2';
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
    if (strong > 0) {
      ctx.strokeStyle = `rgba(130, 92, 190, ${0.55 * strong})`;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
  }
  ctx.restore();
}

/** where each trunk's blank bark is, as shares of its picture (x0, y0, x1, y1): Meeca's words go in this box */
export const CARVE_BOX: Partial<Record<W5Piece, readonly [number, number, number, number]>> = {
  trunkTall: [0.22, 0.32, 0.78, 0.78],
  trunkShort: [0.2, 0.3, 0.82, 0.78],
  trunkA: [0.24, 0.3, 0.8, 0.82],
  trunkB: [0.2, 0.32, 0.8, 0.72],
  trunkC: [0.2, 0.3, 0.8, 0.72],
};

/**
 * Meeca's scratched letters: each one a few strokes on a 4 x 6 grid (x right, y down), the way a hairpin draws them, so the words
 * are crisp at any size and need no font. Letters it lacks are left as a gap.
 */
const GLYPHS: Record<string, number[][]> = {
  A: [[0, 6, 2, 0, 4, 6], [0.8, 3.8, 3.2, 3.8]],
  B: [[0, 6, 0, 0, 3, 0, 3.6, 1.4, 3, 2.8, 0, 2.9], [3, 2.9, 4, 4.4, 3, 6, 0, 6]],
  C: [[4, 0.6, 2.6, 0, 0.8, 0.6, 0, 3, 0.8, 5.4, 2.6, 6, 4, 5.4]],
  D: [[0, 0, 0, 6, 2.4, 6, 4, 4.4, 4, 1.6, 2.4, 0, 0, 0]],
  E: [[4, 0, 0, 0, 0, 6, 4, 6], [0, 3, 3, 3]],
  F: [[4, 0, 0, 0, 0, 6], [0, 3, 3, 3]],
  G: [[4, 0.6, 2.6, 0, 0.8, 0.6, 0, 3, 0.8, 5.4, 2.6, 6, 4, 5, 4, 3.4, 2.4, 3.4]],
  H: [[0, 0, 0, 6], [4, 0, 4, 6], [0, 3, 4, 3]],
  I: [[2, 0, 2, 6], [0.8, 0, 3.2, 0], [0.8, 6, 3.2, 6]],
  J: [[4, 0, 4, 4.6, 3, 6, 1, 6, 0, 4.8]],
  K: [[0, 0, 0, 6], [4, 0, 0, 3.4], [1.4, 2.6, 4, 6]],
  L: [[0, 0, 0, 6, 4, 6]],
  M: [[0, 6, 0, 0, 2, 3.4, 4, 0, 4, 6]],
  N: [[0, 6, 0, 0, 4, 6, 4, 0]],
  O: [[2, 0, 0.4, 1, 0, 3, 0.4, 5, 2, 6, 3.6, 5, 4, 3, 3.6, 1, 2, 0]],
  P: [[0, 6, 0, 0, 3, 0, 4, 1.5, 3, 3, 0, 3]],
  Q: [[2, 0, 0.4, 1, 0, 3, 0.4, 5, 2, 6, 3.6, 5, 4, 3, 3.6, 1, 2, 0], [2.6, 4.4, 4.2, 6.4]],
  R: [[0, 6, 0, 0, 3, 0, 4, 1.5, 3, 3, 0, 3], [1.8, 3, 4, 6]],
  S: [[4, 0.8, 2.6, 0, 1, 0.2, 0.2, 1.4, 1, 2.6, 3, 3.4, 3.8, 4.6, 3, 5.8, 1.4, 6, 0, 5.2]],
  T: [[0, 0, 4, 0], [2, 0, 2, 6]],
  U: [[0, 0, 0, 4.6, 1, 6, 3, 6, 4, 4.6, 4, 0]],
  V: [[0, 0, 2, 6, 4, 0]],
  W: [[0, 0, 0.9, 6, 2, 2.6, 3.1, 6, 4, 0]],
  X: [[0, 0, 4, 6], [4, 0, 0, 6]],
  Y: [[0, 0, 2, 3, 4, 0], [2, 3, 2, 6]],
  Z: [[0, 0, 4, 0, 0, 6, 4, 6]],
  '0': [[2, 0, 0.4, 1, 0, 3, 0.4, 5, 2, 6, 3.6, 5, 4, 3, 3.6, 1, 2, 0]],
  '1': [[0.8, 1.2, 2, 0, 2, 6], [0.8, 6, 3.2, 6]],
  '2': [[0, 1.2, 1.4, 0, 3, 0.2, 3.8, 1.6, 0, 6, 4, 6]],
  '3': [[0, 0.6, 2.8, 0, 3.6, 1.4, 2, 2.9, 3.8, 4.4, 2.8, 6, 0, 5.4]],
  '4': [[3, 6, 3, 0, 0, 4, 4, 4]],
  '5': [[4, 0, 0.4, 0, 0, 2.8, 2.8, 2.6, 4, 4.2, 2.8, 6, 0, 5.4]],
  '6': [[3.6, 0, 1, 1.4, 0, 4, 1, 6, 3, 6, 4, 4.4, 3, 3, 0.4, 3.4]],
  '7': [[0, 0, 4, 0, 1.4, 6]],
  '8': [[2, 3, 0.4, 1.6, 2, 0, 3.6, 1.6, 2, 3, 0, 4.6, 2, 6, 4, 4.6, 2, 3]],
  '9': [[3.6, 2.6, 2, 3.2, 0.4, 2, 1, 0.2, 3, 0, 4, 1.6, 3.4, 4.6, 1.6, 6]],
  '.': [[1.7, 5.6, 2.3, 6, 1.9, 6.2, 1.7, 5.6]],
  ',': [[2.2, 5.4, 2.2, 6.2, 1.4, 7]],
  "'": [[2, 0, 1.8, 1.8]],
  '!': [[2, 0, 2, 4.2], [2, 5.6, 2.1, 6.1]],
  '?': [[0.2, 1.2, 1.6, 0, 3.4, 0.2, 3.8, 1.6, 2, 3, 2, 4.4], [2, 5.6, 2.1, 6.1]],
  '-': [[0.6, 3.2, 3.4, 3.1]],
  '/': [[4, 0, 0, 6]],
};

/** a steady little shake per stroke point, the same every frame (so the letters do not shimmer) */
const shake = (i: number, k: number) => Math.sin(i * 12.9898 + k * 78.233) * 43758.5453 % 1;

/**
 * Scratch `text` with its middle at (cx, cy), letters `size` tall: dark strokes with a pale rim under them, as if cut into the bark.
 * A dot at the end of a word sits on the line, an apostrophe high. Shaky by `wobble` (a share of the letter's height); `weight` thickens
 * the strokes (1 as cut; more for a groove read from across a phone).
 */
export function drawScratch(ctx: CanvasRenderingContext2D, text: string, cx: number, cy: number, size: number, wobble = 0.05, ink = '#2a1a10', weight = 1): void {
  const u = size / 6;
  const adv = (c: string) => (c === ' ' ? 3 : c === '.' || c === ',' || c === "'" || c === '!' ? 2.6 : 5.4);
  const chars = [...text.toUpperCase()];
  const width = chars.reduce((a, c) => a + adv(c), 0) - 1.4;
  let gx = -width / 2;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let pass = 0; pass < 2; pass++) {
    gx = -width / 2;
    ctx.strokeStyle = pass === 0 ? 'rgba(255,230,190,0.4)' : ink;
    ctx.lineWidth = Math.max(1.2, size * (pass === 0 ? 0.15 : 0.12) * weight);
    chars.forEach((c, ci) => {
      const strokes = GLYPHS[c];
      if (strokes) {
        strokes.forEach((st, si) => {
          ctx.beginPath();
          for (let k = 0; k < st.length; k += 2) {
            const n = ci * 31 + si * 7 + k;
            const px = cx + (gx + st[k] + shake(n, 1) * wobble * 6) * u + (pass === 0 ? size * 0.03 : 0);
            const py = cy + (st[k + 1] - 3 + shake(n, 2) * wobble * 6) * u + (pass === 0 ? size * 0.04 : 0);
            if (k === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
        });
      }
      gx += adv(c);
    });
  }
  ctx.restore();
}

/**
 * Meeca's words scratched into a trunk drawn with drawW5 (same x, bottom, w): shaky hairpin letters fitted to the trunk's blank bark.
 * `lines`: the words, a line each (["POKEY.", "DON'T", "SIT.", "M."]). False until loaded.
 */
export function drawCarving(ctx: CanvasRenderingContext2D, n: W5Piece, x: number, bottom: number, w: number, lines: readonly string[], flip = false): boolean {
  const box = CARVE_BOX[n];
  if (!box || !w5ArtReady()) return false;
  const h = w5Height(n, w);
  const x0 = x - w / 2 + (flip ? 1 - box[2] : box[0]) * w;
  const bw = (box[2] - box[0]) * w;
  const y0 = bottom - h + box[1] * h;
  const bh = (box[3] - box[1]) * h;
  // (a letter is 6 tall and about 5.4 across with its gap)
  const longest = Math.max(...lines.map((l) => l.length), 1);
  const size = Math.min(bh / (lines.length * 1.45), (bw / (longest * 5.4)) * 6, bh / 2);
  const lead = size * 1.45;
  const top = y0 + (bh - lines.length * lead) / 2 + lead / 2;
  lines.forEach((l, i) => {
    ctx.save();
    // (each line a little off true: scratched with a hairpin, not printed)
    ctx.translate(x0 + bw / 2 + Math.sin(i * 2.1) * size * 0.12, top + i * lead);
    ctx.rotate(Math.sin(i * 1.3 + 0.4) * 0.06);
    drawScratch(ctx, l, 0, 0, size);
    ctx.restore();
  });
  return true;
}

// ---- the council's garden (5-10, and the intro and tea scene)

export type W5ArenaTake = 'table' | 'webs';
/** the two paintings: the long lace table with Iron-Claw's head chair (the fight), the grand court under the web canopy (the tea) */
export const W5_ARENA_URL: Record<W5ArenaTake, string> = {
  table: new URL('../assets/backdrops/w5arena-table.webp', import.meta.url).href,
  webs: new URL('../assets/backdrops/w5arena-webs.webp', import.meta.url).href,
};
/**
 * Where each painting's floor is (the paved or earth floor a creature stands on, as a share of the picture's height from the top) and
 * the part of the picture to keep in view when the screen is narrower than the painting (a share of its width: the table's middle).
 */
export const W5_ARENA_FIT: Record<W5ArenaTake, { floor: number; focus: number; sky: [number, number, number]; ground: string }> = {
  // (sky: the painting's lilac haze, measured off it, for the sky over an upright screen; ground: its floor's colour, under a short one)
  table: { floor: 0.84, focus: 0.6, sky: [229, 205, 249], ground: '#7f7281' },
  webs: { floor: 0.84, focus: 0.62, sky: [185, 162, 220], ground: '#4c4865' },
};
const arena: Partial<Record<W5ArenaTake, { img: HTMLImageElement; ready: boolean }>> = {};
/** the arena painting if it has loaded (starts the load); a World 5 sheet like the props, let go with the world */
export function w5ArenaPicture(take: W5ArenaTake): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  let a = arena[take];
  if (!a) {
    const im = new Image();
    const entry = { img: im, ready: false };
    arena[take] = entry;
    a = entry;
    trackAtlas(im, W5_ARENA_URL[take], () => { entry.ready = true; }, () => { delete arena[take]; }, () => { delete arena[take]; });
  }
  return a.ready ? a.img : null;
}

/**
 * The arena painting covering the view (vw x vh), its floor on the game's floor at screen height `floorY`, drifting a little against
 * the camera (`camX`, the camera's left edge in world units). Upright, the painting is cropped to its focus (the table); sideways it
 * fills the width. False (nothing drawn) before it has loaded.
 */
export function drawW5Arena(ctx: CanvasRenderingContext2D, take: W5ArenaTake, vw: number, vh: number, floorY: number, camX = 0): boolean {
  const pic = w5ArenaPicture(take);
  if (!pic) return false;
  const iw = pic.naturalWidth, ih = pic.naturalHeight;
  const fit = W5_ARENA_FIT[take];
  // big enough to cover the width (with a margin to drift in) and to put the floor line on the game's floor; upright (a screen far
  // narrower than the painting) no more than about two and a half screens across, so the table still reads, with the sky above
  const s = Math.max((vw * 1.12) / iw, Math.min((floorY + 6) / (fit.floor * ih), (vw * 2.4) / iw));
  const dw = iw * s, dh = ih * s;
  const top = Math.round(floorY - fit.floor * dh);
  const spare = dw - vw;
  const drift = Math.sin(camX * 0.0006) * Math.min(spare * 0.25, 40);
  const left = Math.max(-spare, Math.min(0, vw / 2 - fit.focus * dw + drift));
  if (top > 0) {
    // the sky above it: the painting's own sky colour, and the painting's top melting into it
    ctx.fillStyle = arenaSky(take);
    ctx.fillRect(0, 0, vw, top + 2);
  }
  ctx.drawImage(pic, left, top, dw, dh);
  if (top > 0) {
    const fade = dh * 0.3;
    const g = ctx.createLinearGradient(0, top + 2, 0, top + fade);
    g.addColorStop(0, arenaSky(take));
    g.addColorStop(0.35, arenaSky(take, 0.72));
    g.addColorStop(1, arenaSky(take, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, top - 1, vw, fade + 1);
  }
  // below the painting's bottom (a tall view): its floor's colour carries on down, the painting's last rows melting into it
  const bottom = top + dh;
  if (bottom < vh) {
    const fade = dh * 0.08;
    const g = ctx.createLinearGradient(0, bottom - fade, 0, bottom);
    g.addColorStop(0, fit.ground + '00');
    g.addColorStop(1, fit.ground);
    ctx.fillStyle = g;
    ctx.fillRect(0, bottom - fade, vw, fade);
    ctx.fillStyle = fit.ground;
    ctx.fillRect(0, bottom - 1, vw, vh - bottom + 2);
  }
  return true;
}

/** the painting's sky colour at opacity `a` */
function arenaSky(take: W5ArenaTake, a = 1): string {
  const c = W5_ARENA_FIT[take].sky;
  return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
}
