/**
 * groundPaint — the painted ground under every bank (hf-art-ground, 2026-10-29; polish report VI-8: "the soil is 45% of an upright
 * frame"). Each world's sheet (src/assets/ground/w<N>.webp, groundAtlasData.ts; made on Hugging Face from the world's own kit,
 * tools/art/hfground/) has:
 *   three soil textures, 1024 square, that tile on a brick bond (each row half a tile on) and share their edges, so any one lays next
 *     to any other with no seam: the game hashes between them per tile, and the rows run half a tile on;
 *   a top-lip strip (moss and roots hanging down) that repeats left to right with no seam;
 *   a bank end (the lip rounding over the corner, the face sloping back in) that ends a bank where it drops away, mirrored for a left
 *     end; below it the soil's edge carries on down with a wobble, never a ruled line.
 * Over the soil, two code passes (small touches, STAGE-RULES §4): one large soft darkening, blobs 600-900 units across at up to about
 * 11%, so no two screens of soil are lit alike; and the soil darkening with depth, from the middle of the view to 45% darker by its
 * bottom (anchored to the view, so banks of different heights darken alike).
 * Every draw returns false (draws nothing) until the world's sheet has loaded; stagePreload.ts asks for it with the world's kit.
 */
import { trackAtlas } from './atlasLoader.ts';
import { GROUND_FRAMES, type GroundSheet } from './groundAtlasData.ts';
import { lookHash } from './artRoll.ts';

type C = CanvasRenderingContext2D;

/** a soil tile's size in world units (one tile is wider than an upright phone's view: 440-540 units) */
export const SOIL_TILE = 600;
/** the lip strip's repeat, world units (700, up from 560: the moss band read thin at 22-30 units; 840 began to cover his feet in World 9's stone) */
export const LIP_W = 700;
/** a bank end's height, world units */
export const END_H = 300;
/** how much darker the soil is by the bottom of the view (VI-8: 35-55%) */
export const DEPTH_DARK = 0.45;

const imgs = new Map<number, HTMLImageElement>();
const ready = new Set<number>();

/** whether a world has a painted ground sheet */
export function hasGround(w: number): boolean {
  return !!GROUND_FRAMES[w];
}
/** the address of a world's ground sheet */
export function groundUrl(w: number): string {
  return new URL(`../assets/ground/w${w}.webp`, import.meta.url).href;
}
/** start a world's ground sheet loading; true once it is in */
export function warmGround(w: number): boolean {
  if (!hasGround(w)) return false;
  if (!imgs.has(w) && typeof Image !== 'undefined') {
    const im = new Image();
    imgs.set(w, im);
    trackAtlas(im, groundUrl(w), () => { ready.add(w); }, () => { imgs.delete(w); }, () => { imgs.delete(w); ready.delete(w); });
  }
  return ready.has(w);
}
function sheet(w: number): { img: HTMLImageElement; g: GroundSheet } | null {
  if (!warmGround(w)) return null;
  const img = imgs.get(w);
  return img ? { img, g: GROUND_FRAMES[w] } : null;
}

/**
 * which soil tile (col, row) wears. With four (the clean sweep, G1): (col + 2 row) mod 4, so a tile never matches the one beside it or
 * either of the two above it on the brick bond, and the same tile comes back only four tiles on (2400 units, wider than any screen).
 * With three: hashed.
 */
export function soilVariant(col: number, row: number, n = 3): number {
  if (n >= 4) return (((col + 2 * row) % 4) + 4) % 4;
  return Math.floor(lookHash(col * 7919 + row * 104729, 61) * n) % n;
}
/** the bank end an end at x wears (each world has several: G2), the same for its face and its picture */
function endFrame(g: GroundSheet, x: number): GroundSheet['end'] {
  const es = g.ends ?? [g.end];
  return es[Math.floor(lookHash(Math.round(x), 71) * es.length) % es.length];
}
/**
 * The soil tiles covering x0..x1 by y0..y1, laid from the world's origin in a brick bond: row r's tiles start at r * TILE / 2 (the
 * textures are made periodic on that lattice, so the rows meet with no seam).
 */
export function soilCells(x0: number, x1: number, y0: number, y1: number, tile = SOIL_TILE, n = 3): Array<{ x: number; y: number; v: number }> {
  const out: Array<{ x: number; y: number; v: number }> = [];
  for (let r = Math.floor(y0 / tile); r * tile < y1; r++) {
    const off = (((r % 2) + 2) % 2) * (tile / 2);
    for (let c = Math.floor((x0 - off) / tile); c * tile + off < x1; c++) out.push({ x: c * tile + off, y: r * tile, v: soilVariant(c, r, n) });
  }
  return out;
}

let blobs: HTMLCanvasElement | null | undefined;
/** the darkening pass's picture: a soft, tileable field of dark blobs (value noise on a 4 x 4 lattice, wrapped), its alpha 0..0.11 */
function blobField(): HTMLCanvasElement | null {
  if (blobs !== undefined) return blobs;
  blobs = null;
  try {
    const N = 128, L = 4;
    const c = document.createElement('canvas');
    c.width = c.height = N;
    const g = c.getContext('2d')!;
    const d = g.createImageData(N, N);
    const v = (i: number, j: number) => lookHash(((i % L) + L) % L * 31 + (((j % L) + L) % L) * 977, 83);
    const s = (t: number) => t * t * (3 - 2 * t);
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const fx = (x / N) * L, fy = (y / N) * L;
        const i = Math.floor(fx), j = Math.floor(fy);
        const u = s(fx - i), w = s(fy - j);
        const n = (v(i, j) * (1 - u) + v(i + 1, j) * u) * (1 - w) + (v(i, j + 1) * (1 - u) + v(i + 1, j + 1) * u) * w;
        const k = (y * N + x) * 4;
        d.data[k] = 8; d.data[k + 1] = 5; d.data[k + 2] = 3;
        d.data[k + 3] = Math.round(255 * 0.11 * Math.max(0, Math.min(1, (n - 0.25) / 0.6)));
      }
    }
    g.putImageData(d, 0, 0);
    blobs = c;
  } catch {
    blobs = null;
  }
  return blobs;
}
/** the blob field's repeat in world units: 4 blobs across it, so each is 700-800 units */
const BLOB_PERIOD = 3000;

/**
 * Where the darkening with depth runs at x: the view's top and bottom it is laid out for there ([viewTop, viewBottom]). Given, the
 * darkening is drawn in strips DEPTH_STRIP wide, each laid out for its own x, so it follows one smooth line along the ground: laid out
 * from each bank's own top, a pit's floor (lower) was lighter than the banks either side at the same height, a column of a different
 * shade under every pit (the lead's W3 bands, 2026-10-30).
 */
export type DepthAt = (x: number) => [number, number];
/** the strips the darkening is drawn in when it follows the ground (world units; drawn once, into the ground's squares) */
const DEPTH_STRIP = 8;

/**
 * Paint the world's soil over the box x0..x1 by top..bottom (already clipped by the caller to the bank's shape), with the darkening
 * passes (`shade`, shadeSoil). `viewBottom`: the bottom of the view, where the soil is darkest. Returns false until the sheet has loaded.
 */
export function drawSoil(
  ctx: C, w: number, x0: number, x1: number, top: number, bottom: number, viewBottom: number, viewTop?: number, shade = true, depthAt?: DepthAt,
): boolean {
  const s = sheet(w);
  if (!s) return false;
  if (x1 <= x0 || bottom <= top) return true;
  const { img, g } = s;
  for (const cell of soilCells(x0, x1, top, bottom, SOIL_TILE, g.fills.length)) {
    const f = g.fills[cell.v % g.fills.length];
    // (a hair over a tile, so no gap shows between two at any zoom)
    ctx.drawImage(img, f.x, f.y, f.w, f.h, cell.x, cell.y, SOIL_TILE + 0.6, SOIL_TILE + 0.6);
  }
  if (shade) shadeSoil(ctx, w, x0, x1, top, bottom, viewBottom, viewTop, depthAt);
  return true;
}

/**
 * The darkening passes over soil already drawn (the caller clips to it): the large soft blobs, anchored to the world, and darker with
 * depth by the view. drawProtoScene draws them once over every bank's soil together (G3: drawn per bank, two banks' soils overlapping
 * by a unit were darkened twice, a dark line where they met).
 */
export function shadeSoil(ctx: C, w: number, x0: number, x1: number, top: number, bottom: number, viewBottom: number, viewTop?: number, depthAt?: DepthAt): boolean {
  const s = sheet(w);
  if (!s) return false;
  const { g } = s;
  // the large soft darkening, anchored to the world
  const bf = blobField();
  if (bf) {
    for (let by = Math.floor(top / BLOB_PERIOD) * BLOB_PERIOD; by < bottom; by += BLOB_PERIOD)
      for (let bx = Math.floor(x0 / BLOB_PERIOD) * BLOB_PERIOD; bx < x1; bx += BLOB_PERIOD) ctx.drawImage(bf, bx, by, BLOB_PERIOD, BLOB_PERIOD);
  }
  // darker with depth, by the view: nothing above where he stands (about the middle of the view), DEPTH_DARK by its bottom, so two
  // banks of different heights side by side are darkened alike and meet with no step
  if (!depthAt) {
    depthBand(ctx, g.deep, x0, x1, top, bottom, viewBottom, viewTop ?? viewBottom - 900);
    return true;
  }
  for (let x = Math.floor(x0 / DEPTH_STRIP) * DEPTH_STRIP; x < x1; x += DEPTH_STRIP) {
    const [vt, vb] = depthAt(x + DEPTH_STRIP / 2);
    depthBand(ctx, g.deep, Math.max(x0, x), Math.min(x1, x + DEPTH_STRIP), top, bottom, vb, vt);
  }
  return true;
}

/** the darkening with depth over x0..x1: nothing above the view's middle, DEPTH_DARK by its bottom and below */
function depthBand(ctx: C, deep: GroundSheet['deep'], x0: number, x1: number, top: number, bottom: number, viewBottom: number, vt: number) {
  const y0 = vt + (viewBottom - vt) * 0.5;
  const gr = bottom > y0 && typeof ctx.createLinearGradient === 'function' ? ctx.createLinearGradient(0, y0, 0, viewBottom) : null;
  if (!gr) return;
  gr.addColorStop(0, `rgba(${deep[0]},${deep[1]},${deep[2]},0)`);
  gr.addColorStop(1, `rgba(${deep[0]},${deep[1]},${deep[2]},${DEPTH_DARK})`);
  ctx.fillStyle = gr;
  const a = Math.max(top, y0);
  ctx.fillRect(x0, a, x1 - x0, Math.min(bottom, viewBottom) - a);
  if (bottom > viewBottom) {
    ctx.fillStyle = `rgba(${deep[0]},${deep[1]},${deep[2]},${DEPTH_DARK})`;
    ctx.fillRect(x0, viewBottom, x1 - x0, bottom - viewBottom);
  }
}

/** the top lip along x0..x1 with Pokey's walking line at y (repeats laid from the world's origin, so touching banks run on as one) */
export function drawLip(ctx: C, w: number, x0: number, x1: number, y: number, view?: { x0: number; x1: number }): boolean {
  const s = sheet(w);
  if (!s) return false;
  const { img, g } = s;
  // (several lips sharing their ends, taken in turn: the same one comes back only every third repeat, 2100 units: G1)
  const ls = g.lips ?? [g.lip];
  const f = g.lip;
  const h = (LIP_W * f.h) / f.w;
  const a = Math.max(x0, view ? view.x0 - LIP_W : -Infinity), b = Math.min(x1, view ? view.x1 + LIP_W : Infinity);
  const top = y - f.surf * h;
  for (let x = Math.floor(a / LIP_W) * LIP_W; x < b; x += LIP_W) {
    const l = ls[((Math.round(x / LIP_W) % ls.length) + ls.length) % ls.length];
    ctx.drawImage(img, l.x, l.y, l.w, l.h, x, top, LIP_W + 0.6, h);
  }
  return true;
}

/**
 * The bank end's shape for a right end at x (the walkable end) with the walking line at y: where the face runs at each height, down to
 * `bottom` (below the painted piece the edge carries on down with a wobble). For a left end, mirrored about x.
 */
export function endFace(w: number, x: number, y: number, bottom: number, right: boolean): Array<[number, number]> {
  const g = GROUND_FRAMES[w];
  if (!g) return [[x, y], [x, bottom]];
  const e = endFrame(g, x);
  const k = END_H / e.h;
  const ew = e.w * k;
  const dir = right ? 1 : -1;
  // the piece's own corner (share cx of its width) sits on the end of the walkable top
  const px = (u: number) => x + dir * (u - e.cx) * ew;
  const top = y - e.surf * END_H;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < e.face.length; i++) pts.push([px(e.face[i]), top + (END_H * i) / (e.face.length - 1)]);
  const [lx, ly] = pts[pts.length - 1];
  const seed = Math.round(x);
  for (let yy = ly + 24; yy < bottom + 24; yy += 24) {
    const t = yy - ly;
    const wob = 10 * Math.sin(t / 41 + lookHash(seed, 3) * 6) + 6 * Math.sin(t / 17 + lookHash(seed, 5) * 6) + (lookHash(seed + yy, 9) - 0.5) * 6;
    pts.push([lx + dir * wob, yy]);
  }
  return pts;
}

const cutEnds = new Map<string, HTMLCanvasElement | null>();
/**
 * The end piece faded out toward `cut` units below its top (a step down to a lower bank: the lower bank's lip takes over there). Baked
 * once per world and cut (to 8 units), so a step's end has no hard line where it stops.
 */
function endFaded(img: HTMLImageElement, e: GroundSheet['end'], w: number, cut: number, fade = 46): HTMLCanvasElement | null {
  const key = `${w}:${e.x},${e.y}:${Math.round(cut / 8)}:${fade}`;
  if (cutEnds.has(key)) return cutEnds.get(key)!;
  let c: HTMLCanvasElement | null = null;
  try {
    c = document.createElement('canvas');
    c.width = e.w;
    c.height = e.h;
    const g = c.getContext('2d')!;
    g.drawImage(img, e.x, e.y, e.w, e.h, 0, 0, e.w, e.h);
    g.globalCompositeOperation = 'destination-in';
    const k = e.h / END_H;
    // (fade 0: cut clean, for a short step whose lower bank's lip covers the cut)
    const y1 = Math.max(1, Math.min(e.h, cut * k)), y0 = Math.max(0, y1 - Math.max(0.5, fade * k));
    const gr = g.createLinearGradient(0, y0, 0, y1);
    gr.addColorStop(0, 'rgba(0,0,0,1)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, e.w, e.h);
  } catch {
    c = null;
  }
  cutEnds.set(key, c);
  return c;
}

/**
 * the bank end piece at a right (or, mirrored, left) end x with the walking line at y; `cutAt`: faded out by that height (a step) over
 * `fade` px (0: cut clean, a short step)
 */
export function drawEnd(ctx: C, w: number, x: number, y: number, right: boolean, cutAt?: number, fade?: number): boolean {
  const s = sheet(w);
  if (!s) return false;
  const e = endFrame(s.g, x);
  const k = END_H / e.h;
  const ew = e.w * k;
  const top = y - e.surf * END_H;
  const faded = cutAt !== undefined ? endFaded(s.img, e, w, cutAt - top, fade) : null;
  if (cutAt !== undefined && !faded) return true;
  ctx.save();
  ctx.translate(x, 0);
  if (!right) ctx.scale(-1, 1);
  if (faded) ctx.drawImage(faded, -e.cx * ew, top, ew, END_H);
  else ctx.drawImage(s.img, e.x, e.y, e.w, e.h, -e.cx * ew, top, ew, END_H);
  ctx.restore();
  return true;
}
