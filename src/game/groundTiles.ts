/**
 * groundTiles — baked faces for the ground treatments that sit beside the world's own baked soil (soil.ts):
 *
 *   roots     a tangle of bark roots that dive from the cap, gripping stones in packed earth
 *   strata    rock: sedimentary bands, megalith courses, basalt columns or limestone, by world; with a flat stone lip as its cap
 *   overhang  a shadowed recess under a thick shelf of moss, with moss and vines hanging down
 *
 * Each is one tile (TILE_W wide, TILE_H deep, repeating along x) painted once per world and scene seed. It is anchored to the
 * top of the block it fills, so the layers always start right under the cap, and the last stretch fades to the world's deep
 * earth colour, so every treatment (and the plain soil) converges to the same dark at the bottom.
 */
import { rng, rgba, mixToHex, lighten, darken, type RNG } from './artKit.ts';
import type { Look } from './scenery.ts';
import { paletteFor, type Palette } from './platformPalette.ts';
import { getSceneSeed, onSceneSeedChange } from './sceneSeed.ts';
import { glowAt, pebble } from './platformKit.ts';

type C = CanvasRenderingContext2D;
const TAU = Math.PI * 2;

export const TILE_W = 1024;
export const TILE_H = 440;
/** texture pixels per world unit */
export const GRES = 1.25;
/** the soil module bakes its cap strip at 1.5 px per unit; ours must match so that capTransform fits */
const CRES = 1.5;
const CAP_W = 512;
const CAP_H = 72;
/** y of the collision line inside a cap strip */
export const CAP_TOP = 30;

export type Treat = 'roots' | 'strata' | 'overhang';
type StrataFlavor = 'bands' | 'masonry' | 'columns' | 'karst';

const STRATA_FLAVOR: Record<number, StrataFlavor> = {
  1: 'bands', 2: 'bands', 3: 'karst', 4: 'karst', 5: 'bands', 6: 'bands', 7: 'masonry', 8: 'karst', 9: 'columns', 10: 'masonry',
};

const faces = new Map<string, CanvasPattern>();
const caps = new Map<string, CanvasPattern>();
onSceneSeedChange(() => {
  faces.clear();
  caps.clear();
});

/** the colour every face converges to at the bottom */
export const deepOf = (look: Look) => mixToHex(look.ground.dirtDark, look.ground.outline, 0.55);

/** pattern transform that anchors a face tile to the top (y) of a block */
export function faceTransform(y: number): DOMMatrix {
  return new DOMMatrix().translate(0, y).scale(1 / GRES);
}

function tileCanvas(w: number, h: number, res: number): [HTMLCanvasElement, C] {
  const cv = document.createElement('canvas');
  cv.width = Math.round(w * res);
  cv.height = Math.round(h * res);
  const c = cv.getContext('2d')!;
  c.scale(res, res);
  return [cv, c];
}

/** rough relative luminance of a hex colour, 0..1 */
function luma(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
}

const wrapX = (x: number, rad: number, fn: (x: number) => void) => {
  fn(x);
  if (x < rad) fn(x + TILE_W);
  if (x > TILE_W - rad) fn(x - TILE_W);
};
/** periodic wave across the tile: k whole periods */
const per = (x: number, k: number, ph: number) => Math.sin((x / TILE_W) * TAU * k + ph);

/** a cyclic partition of `total` into pieces between lo and hi; returns the cut positions, first one at `start` */
function cyclicCuts(total: number, lo: number, hi: number, r: RNG): number[] {
  const w: number[] = [];
  let sum = 0;
  while (sum < total) {
    const x = lo + r() * (hi - lo);
    w.push(x);
    sum += x;
  }
  const k = total / sum;
  const out: number[] = [];
  let at = r() * lo;
  for (const x of w) {
    out.push(at);
    at += x * k;
  }
  return out;
}

function earthBase(c: C, look: Look, pal: Palette) {
  const g = look.ground;
  const deep = deepOf(look);
  c.fillStyle = (() => {
    const gr = c.createLinearGradient(0, 0, 0, TILE_H);
    gr.addColorStop(0, mixToHex(g.dirt, g.dirtDark, 0.18));
    gr.addColorStop(0.5, mixToHex(g.dirt, g.dirtDark, 0.7));
    gr.addColorStop(1, deep);
    return gr;
  })();
  c.fillRect(0, 0, TILE_W, TILE_H);
  void pal;
}

/** darken the lower part of a tile so that it ends exactly on the deep colour, with a soft shadow right under the cap */
function finish(c: C, look: Look, shade = 0.42) {
  const deep = deepOf(look);
  const gr = c.createLinearGradient(0, 230, 0, TILE_H);
  gr.addColorStop(0, rgba(deep, 0));
  gr.addColorStop(1, rgba(deep, 1));
  c.fillStyle = gr;
  c.fillRect(0, 230, TILE_W, TILE_H - 229);
  const ao = c.createLinearGradient(0, 0, 0, 64);
  ao.addColorStop(0, rgba(look.ground.outline, shade));
  ao.addColorStop(1, rgba(look.ground.outline, 0));
  c.fillStyle = ao;
  c.fillRect(0, 0, TILE_W, 64);
}

function grit(c: C, r: RNG, look: Look, n: number, y0 = 6, y1 = 330) {
  for (let i = 0; i < n; i++) {
    c.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.14)' : rgba(look.ground.outline, 0.26);
    const x = r() * TILE_W;
    const y = y0 + r() * (y1 - y0);
    const s = 0.9 + r() * 1.8;
    wrapX(x, 4, (xx) => {
      c.beginPath();
      c.arc(xx, y, s, 0, TAU);
      c.fill();
    });
  }
}

// ───────────────────────────── roots ─────────────────────────────

interface Pt { x: number; y: number; w: number; a: number }

function rootPath(r: RNG, x0: number, y0: number, len: number, w0: number, ang: number): Pt[] {
  const pts: Pt[] = [];
  let x = x0;
  let y = y0;
  let a = ang;
  const step = 13;
  const n = Math.max(4, Math.round(len / step));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push({ x, y, w: Math.max(2, w0 * Math.pow(1 - t, 0.8) + 1.4), a });
    a += (r() - 0.5) * 0.6;
    a += (Math.PI / 2 - a) * 0.1;
    x += Math.cos(a) * step;
    y += Math.sin(a) * step;
  }
  return pts;
}

function strokeRoot(c: C, pts: Pt[], pal: Palette, ol: string) {
  c.lineCap = 'round';
  c.lineJoin = 'round';
  const seg = (extra: number, col: string, dx = 0, k = 1) => {
    c.strokeStyle = col;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      c.lineWidth = Math.max(1, (b.w + a.w) * 0.5 * k + extra);
      c.beginPath();
      c.moveTo(a.x + dx * a.w, a.y);
      c.lineTo(b.x + dx * b.w, b.y);
      c.stroke();
    }
  };
  seg(4.2, ol);
  seg(0, pal.bark.mid);
  seg(0, rgba(pal.bark.dark, 0.7), 0.22, 0.5);
  seg(0, rgba(pal.bark.light, 0.8), -0.2, 0.34);
  // bark ticks
  c.strokeStyle = rgba(pal.bark.deep, 0.5);
  c.lineWidth = 1;
  for (let i = 1; i < pts.length - 1; i += 2) {
    const p = pts[i];
    if (p.w < 5) break;
    const nx = -Math.sin(p.a);
    const ny = Math.cos(p.a);
    c.beginPath();
    c.moveTo(p.x - nx * p.w * 0.35, p.y - ny * p.w * 0.35);
    c.lineTo(p.x + nx * p.w * 0.35, p.y + ny * p.w * 0.35);
    c.stroke();
  }
}

function paintRoots(look: Look, pal: Palette, world: number): HTMLCanvasElement {
  const [cv, c] = tileCanvas(TILE_W, TILE_H, GRES);
  const r = rng(world * 4001 + getSceneSeed() * 31 + 5);
  const ol = look.ground.outline;
  earthBase(c, look, pal);
  grit(c, r, look, 170);
  // gripped stones
  for (let i = 0; i < 9; i++) {
    const x = r() * TILE_W;
    const y = 40 + r() * 270;
    const s = 12 + r() * 22;
    wrapX(x, s, (xx) => pebble(c, xx, y, s, s * (0.55 + r() * 0.2), pal.stone, ol));
  }
  // thin rootlets
  c.lineCap = 'round';
  for (let i = 0; i < 34; i++) {
    const x = r() * TILE_W;
    const pts = rootPath(r, x, 2, 40 + r() * 90, 1.2, Math.PI / 2 + (r() - 0.5) * 1.2);
    c.strokeStyle = rgba(ol, 0.42);
    c.lineWidth = 1.3;
    wrapX(x, 80, (dx) => {
      c.beginPath();
      pts.forEach((p, k) => (k ? c.lineTo(p.x - x + dx, p.y) : c.moveTo(p.x - x + dx, p.y)));
      c.stroke();
    });
  }
  // the big roots: back to front, with branches under their parent
  const n = 9;
  const roots: Array<{ x: number; pts: Pt[]; kids: Array<{ pts: Pt[] }> }> = [];
  for (let i = 0; i < n; i++) {
    const x = ((i + 0.15 + r() * 0.7) / n) * TILE_W;
    const w0 = 11 + r() * 7;
    const pts = rootPath(r, x, -4, 150 + r() * 190, w0, Math.PI / 2 + (r() - 0.5) * 0.7);
    const kids: Array<{ pts: Pt[] }> = [];
    const nk = 1 + (r() > 0.45 ? 1 : 0);
    for (let k = 0; k < nk; k++) {
      const at = pts[Math.min(pts.length - 2, Math.round(pts.length * (0.25 + r() * 0.3)))];
      const side = k % 2 ? 1 : -1;
      kids.push({ pts: rootPath(r, at.x, at.y, 70 + r() * 90, at.w * 0.55, at.a + side * (0.7 + r() * 0.5)) });
    }
    roots.push({ x, pts, kids });
  }
  // surface roots crawling sideways near the top, then diving
  for (let i = 0; i < 4; i++) {
    const x = r() * TILE_W;
    const dir = r() > 0.5 ? 1 : -1;
    const pts = rootPath(r, x, 2, 110 + r() * 80, 12, dir > 0 ? 0.35 : Math.PI - 0.35);
    roots.push({ x, pts, kids: [] });
  }
  roots.sort((a, b) => a.pts[0].w - b.pts[0].w);
  for (const rt of roots) {
    wrapX(rt.x, 260, (dx) => {
      c.save();
      c.translate(dx - rt.x, 0);
      for (const k of rt.kids) strokeRoot(c, k.pts, pal, ol);
      strokeRoot(c, rt.pts, pal, ol);
      c.restore();
    });
  }
  // glowing rootlets in the dark worlds
  if (pal.glow) {
    for (let i = 0; i < 14; i++) {
      const x = r() * TILE_W;
      const y = 60 + r() * 240;
      wrapX(x, 24, (xx) => glowAt(c, xx, y, 16, pal.glow!, 0.4));
      c.fillStyle = rgba(lighten(pal.glow, 0.5), 0.9);
      wrapX(x, 4, (xx) => {
        c.beginPath();
        c.arc(xx, y, 2.2, 0, TAU);
        c.fill();
      });
    }
  }
  finish(c, look, 0.5);
  return cv;
}

// ───────────────────────────── strata ─────────────────────────────

function chip(c: C, x: number, y: number, w: number, h: number, ol: string) {
  c.strokeStyle = rgba(ol, 0.5);
  c.lineWidth = 1.2;
  c.beginPath();
  c.moveTo(x, y);
  c.lineTo(x + w * 0.4, y + h * 0.5);
  c.lineTo(x + w * 0.2, y + h);
  c.stroke();
}

function mossTuft(c: C, x: number, y: number, w: number, pal: Palette, r: RNG) {
  const m = pal.moss;
  const n = 3 + Math.round(w / 12);
  for (let i = 0; i < n; i++) {
    const px = x + (i / Math.max(1, n - 1)) * w;
    const rr = 3.2 + r() * 3.4;
    c.beginPath();
    c.ellipse(px, y, rr * 1.2, rr, 0, Math.PI, 0);
    c.fillStyle = i % 2 ? m.mid : m.light;
    c.fill();
    c.strokeStyle = rgba(m.deep, 0.7);
    c.lineWidth = 1;
    c.stroke();
  }
}

function glyphAt(c: C, kind: number, cx: number, cy: number, s: number, col: string) {
  c.strokeStyle = col;
  c.lineWidth = 2.2;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  c.beginPath();
  if (kind === 0) {
    // spiral
    for (let t = 0; t < 4.4 * Math.PI; t += 0.3) {
      const rr = (t / (4.4 * Math.PI)) * s;
      const px = cx + Math.cos(t) * rr;
      const py = cy + Math.sin(t) * rr;
      if (t === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    }
  } else if (kind === 1) {
    // stepped key
    c.moveTo(cx - s, cy + s * 0.6);
    c.lineTo(cx - s, cy - s * 0.2);
    c.lineTo(cx - s * 0.3, cy - s * 0.2);
    c.lineTo(cx - s * 0.3, cy - s * 0.8);
    c.lineTo(cx + s * 0.4, cy - s * 0.8);
    c.lineTo(cx + s * 0.4, cy);
    c.lineTo(cx + s, cy);
    c.lineTo(cx + s, cy + s * 0.6);
  } else if (kind === 2) {
    // an eye
    c.moveTo(cx - s, cy);
    c.quadraticCurveTo(cx, cy - s * 0.9, cx + s, cy);
    c.quadraticCurveTo(cx, cy + s * 0.9, cx - s, cy);
    c.moveTo(cx + s * 0.28, cy);
    c.arc(cx, cy, s * 0.28, 0, TAU);
  } else {
    // a cross in a ring
    c.moveTo(cx + s * 0.9, cy);
    c.arc(cx, cy, s * 0.9, 0, TAU);
    c.moveTo(cx - s * 0.9, cy);
    c.lineTo(cx + s * 0.9, cy);
    c.moveTo(cx, cy - s * 0.9);
    c.lineTo(cx, cy + s * 0.9);
  }
  c.stroke();
}

function paintBands(c: C, look: Look, pal: Palette, r: RNG, karst: boolean) {
  const g = look.ground;
  const ol = g.outline;
  // dark worlds (the grotto, the ash lands) get dim rock, so a stretch of strata never glares against their night
  const dark = luma(g.dirt) < 0.3;
  const base = dark ? mixToHex(g.stone, g.dirtDark, 0.42) : karst ? mixToHex(g.stone, '#ffffff', 0.12) : g.stone;
  const ramp = [
    mixToHex(base, g.dirt, 0.42),
    mixToHex(g.dirt, g.dirtDark, 0.25),
    mixToHex(base, g.dirtDark, 0.38),
    mixToHex(base, g.dirt, 0.12),
    mixToHex(g.dirt, g.dirtDark, 0.55),
    mixToHex(base, g.dirtDark, 0.2),
  ];
  const tops: number[] = [0];
  let y = 0;
  const first = 30 + r() * 10;
  y += first;
  tops.push(y);
  while (y < TILE_H + 60) {
    y += 40 + r() * 46;
    tops.push(y);
  }
  const ks = tops.map(() => [2 + Math.floor(r() * 3), 5 + Math.floor(r() * 5), r() * TAU, r() * TAU] as const);
  const yAt = (i: number, x: number) => {
    if (i === 0) return -6;
    const [k1, k2, p1, p2] = ks[i];
    return tops[i] + 5 * per(x, k1, p1) + 2.2 * per(x, k2, p2);
  };
  let last = -1;
  for (let i = 0; i < tops.length - 1; i++) {
    let ci = Math.floor(r() * ramp.length);
    if (ci === last) ci = (ci + 2) % ramp.length;
    last = ci;
    const col = ramp[ci];
    const step = 16;
    c.beginPath();
    for (let x = 0; x <= TILE_W; x += step) (x ? c.lineTo(x, yAt(i, x)) : c.moveTo(x, yAt(i, x)));
    for (let x = TILE_W; x >= 0; x -= step) c.lineTo(x, yAt(i + 1, x));
    c.closePath();
    const gy0 = tops[i];
    const gy1 = tops[i + 1];
    const gr = c.createLinearGradient(0, gy0, 0, gy1);
    gr.addColorStop(0, lighten(col, 0.1));
    gr.addColorStop(1, darken(col, 0.1));
    c.fillStyle = gr;
    c.fill();
    // joints: stacked slabs
    c.save();
    c.clip();
    let jx = r() * 90;
    while (jx < TILE_W + 90) {
      const slant = (r() - 0.5) * 8;
      c.strokeStyle = rgba(ol, 0.5);
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(jx, yAt(i, jx) - 1);
      c.lineTo(jx + slant, yAt(i + 1, jx + slant) + 1);
      c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.12)';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(jx + 1.5, yAt(i, jx) + 1);
      c.lineTo(jx + slant + 1.5, yAt(i + 1, jx + slant) - 1);
      c.stroke();
      jx += 80 + r() * 120;
    }
    // a pebble or fossil now and then
    if (r() > 0.45) {
      const px = r() * TILE_W;
      const py = (gy0 + gy1) / 2 + (r() - 0.5) * 8;
      wrapX(px, 20, (xx) => {
        if (karst) {
          c.beginPath();
          c.ellipse(xx, py, 12 + r() * 14, 6 + r() * 5, 0, 0, TAU);
          c.fillStyle = rgba(ol, 0.55);
          c.fill();
          c.strokeStyle = 'rgba(255,255,255,0.22)';
          c.lineWidth = 1.6;
          c.beginPath();
          c.ellipse(xx, py + 1.4, 12, 6, 0, 0.2, Math.PI - 0.2);
          c.stroke();
        } else {
          pebble(c, xx, py, 7 + r() * 8, 4 + r() * 4, pal.stone, ol);
        }
      });
    }
    c.restore();
    // the bedding plane: dark line, lit line below it, soft shade above the next one
    c.strokeStyle = rgba(ol, 0.62);
    c.lineWidth = 1.8;
    c.beginPath();
    for (let x = 0; x <= TILE_W; x += step) (x ? c.lineTo(x, yAt(i, x)) : c.moveTo(x, yAt(i, x)));
    c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.22)';
    c.lineWidth = 1.5;
    c.beginPath();
    for (let x = 0; x <= TILE_W; x += step) (x ? c.lineTo(x, yAt(i, x) + 2.2) : c.moveTo(x, yAt(i, x) + 2.2));
    c.stroke();
  }
  if (karst) {
    // drip streaks and the odd hollow
    for (let i = 0; i < 26; i++) {
      const x = r() * TILE_W;
      const y0 = 20 + r() * 200;
      const len = 30 + r() * 80;
      c.strokeStyle = 'rgba(255,255,255,0.13)';
      c.lineWidth = 2 + r() * 2;
      c.lineCap = 'round';
      wrapX(x, 6, (xx) => {
        c.beginPath();
        c.moveTo(xx, y0);
        c.lineTo(xx + (r() - 0.5) * 6, y0 + len);
        c.stroke();
      });
    }
  }
}

function paintMasonry(c: C, look: Look, pal: Palette, r: RNG) {
  const g = look.ground;
  const ol = g.outline;
  const courses: number[] = [0];
  let y = 0;
  while (y < TILE_H + 40) {
    y += (courses.length === 1 ? 58 : 66) + r() * 20;
    courses.push(y);
  }
  c.fillStyle = mixToHex(g.stone, g.dirtDark, 0.55);
  c.fillRect(0, 0, TILE_W, TILE_H);
  const tones = [pal.stone.light, pal.stone.mid, mixToHex(pal.stone.mid, pal.stone.light, 0.5), mixToHex(pal.stone.mid, pal.stone.dark, 0.4)];
  for (let ci = 0; ci < courses.length - 1; ci++) {
    const y0 = courses[ci];
    const y1 = courses[ci + 1];
    const cuts = cyclicCuts(TILE_W, 140, 250, r);
    for (let bi = 0; bi < cuts.length; bi++) {
      const x0 = cuts[bi];
      const x1 = bi + 1 < cuts.length ? cuts[bi + 1] : cuts[0] + TILE_W;
      const bw = x1 - x0;
      wrapX(x0, bw, (xx) => {
        const tn = tones[Math.floor(r() * tones.length)];
        c.beginPath();
        c.roundRect(xx + 1.5, y0 + 1.5, bw - 3, y1 - y0 - 3, 6);
        const gr = c.createLinearGradient(0, y0, 0, y1);
        gr.addColorStop(0, lighten(tn, 0.08));
        gr.addColorStop(1, darken(tn, 0.14));
        c.fillStyle = gr;
        c.fill();
        c.save();
        c.clip();
        // bevel: lit top and left, shaded bottom and right
        c.fillStyle = 'rgba(255,255,255,0.22)';
        c.fillRect(xx, y0, bw, 4);
        c.fillStyle = 'rgba(255,255,255,0.1)';
        c.fillRect(xx, y0, 3, y1 - y0);
        c.fillStyle = rgba(ol, 0.3);
        c.fillRect(xx, y1 - 6, bw, 6);
        c.fillRect(xx + bw - 4, y0, 4, y1 - y0);
        const roll = r();
        if (roll < 0.26) {
          // a recessed carved panel
          c.strokeStyle = rgba(ol, 0.32);
          c.lineWidth = 1.6;
          c.strokeRect(xx + 14, y0 + 14, bw - 28, y1 - y0 - 28);
          c.strokeStyle = 'rgba(255,255,255,0.14)';
          c.strokeRect(xx + 15.5, y0 + 15.5, bw - 28, y1 - y0 - 28);
        } else if (roll < 0.42) {
          glyphAt(c, Math.floor(r() * 4), xx + bw / 2, (y0 + y1) / 2 + 2, Math.min(15, (y1 - y0) * 0.22), rgba(ol, 0.4));
        } else if (roll < 0.6) {
          chip(c, xx + bw * (0.2 + r() * 0.5), y0 + 6, 12 + r() * 14, y1 - y0 - 14, ol);
        }
        if (r() < 0.2) mossTuft(c, xx + 6 + r() * (bw * 0.4), y0 + 2, 30 + r() * 50, pal, r);
        c.restore();
        c.strokeStyle = rgba(ol, 0.8);
        c.lineWidth = 2.4;
        c.beginPath();
        c.roundRect(xx + 1.5, y0 + 1.5, bw - 3, y1 - y0 - 3, 6);
        c.stroke();
      });
    }
  }
}

function paintColumns(c: C, look: Look, pal: Palette, r: RNG) {
  const g = look.ground;
  const ol = g.outline;
  c.fillStyle = mixToHex(g.stone, g.dirtDark, 0.5);
  c.fillRect(0, 0, TILE_W, TILE_H);
  const cuts = cyclicCuts(TILE_W, 36, 60, r);
  for (let i = 0; i < cuts.length; i++) {
    const x0 = cuts[i];
    const x1 = i + 1 < cuts.length ? cuts[i + 1] : cuts[0] + TILE_W;
    const cw = x1 - x0;
    const shade = r();
    wrapX(x0, cw, (xx) => {
      const col = mixToHex(pal.stone.mid, pal.stone.dark, shade * 0.5);
      const gr = c.createLinearGradient(xx, 0, xx + cw, 0);
      gr.addColorStop(0, lighten(col, 0.16));
      gr.addColorStop(0.35, col);
      gr.addColorStop(1, darken(col, 0.32));
      c.fillStyle = gr;
      c.fillRect(xx, 0, cw, TILE_H);
      // horizontal fractures
      let fy = 40 + r() * 40;
      while (fy < TILE_H) {
        const tilt = (r() - 0.5) * 6;
        c.strokeStyle = rgba(ol, 0.6);
        c.lineWidth = 1.6;
        c.beginPath();
        c.moveTo(xx, fy);
        c.lineTo(xx + cw, fy + tilt);
        c.stroke();
        c.strokeStyle = 'rgba(255,255,255,0.15)';
        c.lineWidth = 1.2;
        c.beginPath();
        c.moveTo(xx + 1, fy + 2);
        c.lineTo(xx + cw - 1, fy + 2 + tilt);
        c.stroke();
        if (pal.glow && r() < 0.16) {
          glowAt(c, xx + cw / 2, fy + tilt / 2, cw * 0.9, pal.glow, 0.5);
          c.strokeStyle = rgba(lighten(pal.glow, 0.35), 0.95);
          c.lineWidth = 1.8;
          c.beginPath();
          c.moveTo(xx + 3, fy + 0.5);
          c.lineTo(xx + cw - 3, fy + tilt + 0.5);
          c.stroke();
        }
        fy += 52 + r() * 60;
      }
      c.strokeStyle = rgba(ol, 0.85);
      c.lineWidth = 2.4;
      c.beginPath();
      c.moveTo(xx, 0);
      c.lineTo(xx, TILE_H);
      c.stroke();
    });
  }
}

function paintStrata(look: Look, pal: Palette, world: number): HTMLCanvasElement {
  const [cv, c] = tileCanvas(TILE_W, TILE_H, GRES);
  const r = rng(world * 6007 + getSceneSeed() * 17 + 9);
  const flavor = STRATA_FLAVOR[world] ?? 'bands';
  if (flavor === 'masonry') paintMasonry(c, look, pal, r);
  else if (flavor === 'columns') paintColumns(c, look, pal, r);
  else paintBands(c, look, pal, r, flavor === 'karst');
  grit(c, r, look, 60);
  finish(c, look, 0.46);
  return cv;
}

// ───────────────────────────── overhang ─────────────────────────────

function paintOverhang(look: Look, pal: Palette, world: number): HTMLCanvasElement {
  const [cv, c] = tileCanvas(TILE_W, TILE_H, GRES);
  const r = rng(world * 8009 + getSceneSeed() * 23 + 3);
  const g = look.ground;
  const ol = g.outline;
  const m = pal.moss;
  const deep = deepOf(look);
  // the recess: dark right under the shelf, earth below
  const bg = c.createLinearGradient(0, 0, 0, TILE_H);
  bg.addColorStop(0, mixToHex(ol, g.dirtDark, 0.45));
  bg.addColorStop(0.28, mixToHex(g.dirt, g.dirtDark, 0.7));
  bg.addColorStop(1, deep);
  c.fillStyle = bg;
  c.fillRect(0, 0, TILE_W, TILE_H);
  grit(c, r, look, 110, 90, 330);
  // a few stones sunk into the back wall
  for (let i = 0; i < 6; i++) {
    const x = r() * TILE_W;
    const y = 120 + r() * 190;
    const s = 10 + r() * 16;
    wrapX(x, s, (xx) => pebble(c, xx, y, s, s * 0.62, pal.stone, ol));
  }
  // thin hanging roots
  c.lineCap = 'round';
  for (let i = 0; i < 16; i++) {
    const x = r() * TILE_W;
    const len = 50 + r() * 120;
    const dx = (r() - 0.5) * 24;
    c.strokeStyle = rgba(ol, 0.5);
    c.lineWidth = 2 + r() * 1.6;
    wrapX(x, 30, (xx) => {
      c.beginPath();
      c.moveTo(xx, 30);
      c.quadraticCurveTo(xx + dx, 30 + len * 0.5, xx + dx * 0.4, 30 + len);
      c.stroke();
    });
  }
  // the moss shelf: two layers of lobes; the lower layer drips furthest
  const lobeRow = (y0: number, depth: number, lobe: number, col: string, hi: string, outlineA: number) => {
    const cuts = cyclicCuts(TILE_W, lobe * 0.7, lobe * 1.3, r);
    for (let i = 0; i < cuts.length; i++) {
      const x0 = cuts[i];
      const x1 = i + 1 < cuts.length ? cuts[i + 1] : cuts[0] + TILE_W;
      const d = depth * (0.55 + r() * 0.7);
      wrapX(x0, x1 - x0, (xx) => {
        c.beginPath();
        c.moveTo(xx, y0 - 4);
        c.lineTo(xx, y0 + d * 0.5);
        c.quadraticCurveTo(xx + 1, y0 + d, (xx + (x1 - x0) / 2), y0 + d);
        c.quadraticCurveTo(x1 - x0 + xx - 1, y0 + d, x1 - x0 + xx, y0 + d * 0.5);
        c.lineTo(x1 - x0 + xx, y0 - 4);
        c.closePath();
        const gr = c.createLinearGradient(0, y0, 0, y0 + d);
        gr.addColorStop(0, hi);
        gr.addColorStop(0.55, col);
        gr.addColorStop(1, darken(col, 0.25));
        c.fillStyle = gr;
        c.fill();
        c.strokeStyle = rgba(m.deep, outlineA);
        c.lineWidth = 1.5;
        c.lineJoin = 'round';
        c.stroke();
      });
    }
  };
  lobeRow(26, 46, 62, m.dark, m.mid, 0.75);
  lobeRow(14, 34, 48, m.mid, m.light, 0.7);
  // a soft shadow under the shelf
  const sh = c.createLinearGradient(0, 62, 0, 120);
  sh.addColorStop(0, rgba(ol, 0.5));
  sh.addColorStop(1, rgba(ol, 0));
  c.fillStyle = sh;
  c.fillRect(0, 62, TILE_W, 58);
  // curtains: vines and moss strands that hang from the shelf
  const nCurt = 13;
  for (let i = 0; i < nCurt; i++) {
    const x = ((i + 0.2 + r() * 0.6) / nCurt) * TILE_W;
    const len = 26 + r() * 96;
    const dx = (r() - 0.5) * 14;
    const y0 = 52;
    const hang = (xx: number) => {
      for (const [col, lw] of [[ol, 5], [pal.vine.mid, 2.8]] as const) {
        c.strokeStyle = col;
        c.lineWidth = lw;
        c.beginPath();
        c.moveTo(xx, y0);
        c.quadraticCurveTo(xx + dx, y0 + len * 0.5, xx + dx * 0.5, y0 + len);
        c.stroke();
      }
      const ex = xx + dx * 0.5;
      const ey = y0 + len;
      if (pal.glow && i % 2) {
        glowAt(c, ex, ey + 4, 18, pal.glow, 0.5);
        c.beginPath();
        c.arc(ex, ey + 4, 4.2, 0, TAU);
        c.fillStyle = lighten(pal.glow, 0.45);
        c.fill();
        c.strokeStyle = rgba(ol, 0.8);
        c.lineWidth = 1.4;
        c.stroke();
      } else {
        // a clump of moss at the tip
        for (let k = 0; k < 3; k++) {
          c.beginPath();
          c.ellipse(ex + (k - 1) * 4.4, ey + 2 + (k % 2) * 2, 4.8, 6, (k - 1) * 0.3, 0, TAU);
          c.fillStyle = k % 2 ? m.light : m.mid;
          c.fill();
          c.strokeStyle = rgba(m.deep, 0.8);
          c.lineWidth = 1.2;
          c.stroke();
        }
      }
      if (len > 54) {
        for (const s of [-1, 1]) {
          c.save();
          c.translate(xx + dx * 0.3, y0 + len * 0.55);
          c.rotate(s * 0.9);
          c.beginPath();
          c.ellipse(s * 5, 0, 8, 3.2, 0, 0, TAU);
          c.fillStyle = pal.leaf.mid;
          c.fill();
          c.strokeStyle = rgba(ol, 0.75);
          c.lineWidth = 1.2;
          c.stroke();
          c.restore();
        }
      }
    };
    wrapX(x, 30, hang);
  }
  finish(c, look, 0.3);
  return cv;
}

/** the pattern for one treatment of a world's ground (repeats along x only) */
export function groundFace(ctx: CanvasRenderingContext2D, look: Look, world: number, treat: Treat): CanvasPattern {
  const key = `${world}:${getSceneSeed()}:${treat}`;
  const hit = faces.get(key);
  if (hit) return hit;
  const pal = paletteFor(look, world);
  const cv = treat === 'roots' ? paintRoots(look, pal, world) : treat === 'strata' ? paintStrata(look, pal, world) : paintOverhang(look, pal, world);
  const pat = ctx.createPattern(cv, 'repeat-x')!;
  faces.set(key, pat);
  return pat;
}

// ───────────────────────────── the stone lip ─────────────────────────────

/** a flat shelf of rock for a cap, drawn at the same scale and anchor as the soil module's caps (CAP_TOP is the collision line) */
function paintStoneCap(look: Look, pal: Palette, world: number): HTMLCanvasElement {
  const [cv, c] = tileCanvas(CAP_W, CAP_H, CRES);
  const r = rng(world * 9001 + getSceneSeed() * 13 + 1);
  const ol = look.ground.outline;
  const T = CAP_TOP;
  const slabH = 11;
  // the slab
  const gr = c.createLinearGradient(0, T, 0, T + slabH);
  gr.addColorStop(0, pal.stone.hi);
  gr.addColorStop(0.35, pal.stone.light);
  gr.addColorStop(1, pal.stone.mid);
  c.fillStyle = gr;
  c.fillRect(0, T - 0.5, CAP_W, slabH + 0.5);
  // joints between slabs
  const cuts = cyclicCuts(CAP_W, 70, 150, r);
  c.strokeStyle = rgba(ol, 0.6);
  c.lineWidth = 1.5;
  for (const x of cuts) {
    c.beginPath();
    c.moveTo(x, T);
    c.lineTo(x + (r() - 0.5) * 3, T + slabH);
    c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.28)';
    c.beginPath();
    c.moveTo(x + 1.6, T + 1);
    c.lineTo(x + 1.6, T + slabH - 2);
    c.stroke();
    c.strokeStyle = rgba(ol, 0.6);
  }
  // the lower edge of the slab, and the shadow it throws
  c.fillStyle = rgba(ol, 0.55);
  c.fillRect(0, T + slabH - 2, CAP_W, 2.4);
  const sh = c.createLinearGradient(0, T + slabH, 0, T + slabH + 16);
  sh.addColorStop(0, rgba(ol, 0.5));
  sh.addColorStop(1, rgba(ol, 0));
  c.fillStyle = sh;
  c.fillRect(0, T + slabH, CAP_W, 16);
  // cracks
  for (let i = 0; i < 3; i++) {
    const x = r() * CAP_W;
    c.strokeStyle = rgba(ol, 0.4);
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(x, T + 1);
    c.lineTo(x + 2 + r() * 3, T + 5);
    c.lineTo(x - 1, T + slabH);
    c.stroke();
  }
  if (pal.glow && world === 9) {
    for (let i = 0; i < 4; i++) {
      const x = r() * CAP_W;
      c.strokeStyle = rgba(lighten(pal.glow, 0.3), 0.9);
      c.lineWidth = 1.4;
      c.beginPath();
      c.moveTo(x, T + 2);
      c.lineTo(x + 3, T + 6);
      c.lineTo(x - 1, T + slabH - 1);
      c.stroke();
    }
  }
  // moss on the shelf: a few clumps spilling over its lip, and tiny sprouts on top
  const nMoss = 6;
  for (let i = 0; i < nMoss; i++) {
    const x = ((i + 0.2 + r() * 0.6) / nMoss) * CAP_W;
    const w = 16 + r() * 28;
    c.beginPath();
    c.moveTo(x - w / 2, T + 1);
    c.quadraticCurveTo(x - w / 2, T + 9 + r() * 5, x, T + 11 + r() * 8);
    c.quadraticCurveTo(x + w / 2, T + 9 + r() * 5, x + w / 2, T + 1);
    c.closePath();
    c.fillStyle = vg(c, T, T + 18, pal.moss.light, pal.moss.dark);
    c.fill();
    c.strokeStyle = rgba(pal.moss.deep, 0.8);
    c.lineWidth = 1.2;
    c.stroke();
  }
  for (let i = 0; i < 9; i++) {
    const x = r() * CAP_W;
    const h = 4 + r() * 5;
    c.strokeStyle = i % 2 ? pal.moss.light : pal.moss.mid;
    c.lineWidth = 1.6;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x, T + 1);
    c.quadraticCurveTo(x + 1.5, T - h * 0.5, x + (r() - 0.5) * 4, T - h);
    c.stroke();
  }
  return cv;
}

function vg(c: C, y0: number, y1: number, a: string, b: string): CanvasGradient {
  const g = c.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  return g;
}

/** the stone-lip cap pattern; set its transform with capTransform(y - CAP_TOP) of soil.ts */
export function stoneCap(ctx: CanvasRenderingContext2D, look: Look, world: number): CanvasPattern {
  const key = `${world}:${getSceneSeed()}`;
  const hit = caps.get(key);
  if (hit) return hit;
  const pat = ctx.createPattern(paintStoneCap(look, paletteFor(look, world), world), 'repeat-x')!;
  caps.set(key, pat);
  return pat;
}
