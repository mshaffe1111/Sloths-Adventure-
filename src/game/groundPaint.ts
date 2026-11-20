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
import { canvasLost } from './canvasLost.ts';

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
 * How far inside its frame a soil fill is sampled, in sheet pixels. The sheets are lossy WebP, and a fill packed against a darker piece
 * (the lip strip under fills 2 and 3 in every world, a neighbour's edge in Worlds 6 and 9) takes that piece's dark into its last 1-3
 * rows: World 1's fill 2 falls from 60 to 36 over its last three rows. Laid edge to edge every 600 units, those rows drew a dark hairline
 * along every soil row and column (R-165.146: under a raised bank at World 1's floor line; R-165.129: across 1-1's earth pillars at
 * y 1200). The fills' edge strips are shared (any fill's last rows match any other's, 1.6 apart against 7 mid-tile), so leaving out 3
 * rows a side drops about 1.8 units of soil at a join, and nothing shows.
 */
export const FILL_INSET = 3;
/** the part of a soil fill a tile is drawn from (its frame, FILL_INSET in from every edge) */
export function fillSrc(f: { x: number; y: number; w: number; h: number }): [number, number, number, number] {
  return [f.x + FILL_INSET, f.y + FILL_INSET, f.w - 2 * FILL_INSET, f.h - 2 * FILL_INSET];
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
const DEPTH_STRIP = 16;

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
    const [sx, sy, sw, sh] = fillSrc(g.fills[cell.v % g.fills.length]);
    // (a hair over a tile, so no gap shows between two at any zoom)
    ctx.drawImage(img, sx, sy, sw, sh, cell.x, cell.y, SOIL_TILE + 0.6, SOIL_TILE + 0.6);
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
  // (strips where the line runs level are one band: over a flat bank that is one gradient, as before)
  let run = -1, rt = 0, rb = 0;
  for (let x = Math.floor(x0 / DEPTH_STRIP) * DEPTH_STRIP; x < x1; x += DEPTH_STRIP) {
    const [vt, vb] = depthAt(x + DEPTH_STRIP / 2).map(Math.round);
    if (run >= 0 && (vt !== rt || vb !== rb)) depthBand(ctx, g.deep, Math.max(x0, run), x, top, bottom, rb, rt);
    if (run < 0 || vt !== rt || vb !== rb) { run = x; rt = vt; rb = vb; }
  }
  if (run >= 0) depthBand(ctx, g.deep, Math.max(x0, run), x1, top, bottom, rb, rt);
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
    // (clear of the soil row packed above it, each row drawn where the whole frame put it: lipSrc)
    const [sx, sy, sw, sh] = lipSrc(l);
    const k = h / l.h;
    ctx.drawImage(img, sx, sy, sw, sh, x, top + (sy - l.y) * k, LIP_W + 0.6, sh * k);
  }
  return true;
}

/**
 * How far inside its frame a lip is sampled at its top and bottom, in sheet pixels. Lips 0 and 1 are packed right under the soil fills,
 * and the sheet row above them is opaque soil in every world: drawn to the frame's top edge, the filter pulled that row in, and every
 * bank's lip laid a one-row line of soil at alpha ~95 straight across the backdrop, 30-40 units above the ground (R-165.243: the lead's
 * 1-1 and 1-7 stills, every World 1 stage). A lip's top rows are clear in Worlds 1-5, 9 and 10 (its ink starts 4-30 rows down) and hold
 * only the cut tips of a few blades in 6-8; its bottom rows are clear in all ten. Four rows is the pull at a quarter size, where the
 * filter reads two half-size texels past the edge. The sides are not cut: the lips share their ends, so the piece beside one in the
 * sheet is its own continuation, and a cut would show at every repeat.
 */
export const LIP_INSET = 4;
/** the part of a lip a repeat is drawn from (its frame, LIP_INSET in from its top and bottom, its full width) */
export function lipSrc(l: { x: number; y: number; w: number; h: number }): [number, number, number, number] {
  return [l.x, l.y + LIP_INSET, l.w, l.h - 2 * LIP_INSET];
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

/**
 * How the bank end's rock is made solid (ENG-24h, R-165.323 2c), in sheet pixels of the 384 x 576 piece. The sheet's piece keeps only a
 * rim along its face (tools/art/hfground/pack.py: 70 px, fading over 50 more and blurred, and its last 120 rows faded out), so the bank's
 * soil showed THROUGH the rock: the stones and the river bed's band ran on across the face line (the lead's spots, 2-2 pondFar and 2-4
 * catch). The paint under that fade is whole (the column is painted to its foot), so the rock is laid solid from its face in to
 * END_SOLID.rim, handing over to the soil in END_SOLID.feather (about the old fade's middle, so the rock reads as wide as before), and
 * solid down to its last END_SOLID.foot rows, which fade into the soil carrying the face on below it.
 */
export const END_SOLID = { rim: 95, feather: 16, foot: 36, erode: 5, smooth: 4 };

/**
 * The bank end piece's alpha made solid over its rock (END_SOLID), from its own alpha (`a`, w x h, row by row): per row, the rock's face
 * is the right edge of its body (alpha over half the row's highest, a run at least 2 * erode + 1 wide, so a hanging root does not set it;
 * its median over 2 * smooth + 1 rows), and every pixel within rim + feather of it, from the row's first painted pixel out, is raised, never
 * lowered (a clear one there is a crack in the rock: endSolid paints it). Pure, so groundEnd.test.ts checks it on a made-up piece.
 */
export function solidEndAlpha(a: Uint8ClampedArray | number[], w: number, h: number, s = END_SOLID): Uint8ClampedArray {
  const out = new Uint8ClampedArray(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i];
  const raw = new Float64Array(h).fill(-1);
  for (let y = 0; y < h; y++) {
    let mx = 0;
    for (let x = 0; x < w; x++) mx = Math.max(mx, a[y * w + x]);
    if (mx < 8) continue;
    const t = mx / 2;
    let run = 0;
    for (let x = 0; x < w; x++) {
      run = a[y * w + x] >= t ? run + 1 : 0;
      if (run >= 2 * s.erode + 1) raw[y] = x;
    }
  }
  for (let y = 0; y < h; y++) {
    if (raw[y] < 0) continue;
    const near: number[] = [];
    for (let k = Math.max(0, y - s.smooth); k <= Math.min(h - 1, y + s.smooth); k++) if (raw[k] >= 0) near.push(raw[k]);
    near.sort((p, q) => p - q);
    const edge = near[near.length >> 1];
    const foot = Math.max(0, Math.min(1, (h - 1 - y) / s.foot));
    // (a clear pixel is raised only between painted ones in its row, a crack in the rock (World 9's columns): endSolid paints it)
    let first = -1;
    for (let x = 0; x <= Math.min(w - 1, edge); x++) if (a[y * w + x]) { first = x; break; }
    if (first < 0) continue;
    for (let x = first; x <= Math.min(w - 1, edge); x++) {
      const i = y * w + x;
      const keep = Math.max(0, Math.min(1, 1 - (edge - x - s.rim) / s.feather)) * foot;
      out[i] = Math.max(a[i], Math.round(255 * keep));
    }
  }
  return out;
}

const solidEnds = new Map<string, HTMLCanvasElement | null>();
/**
 * The end piece with its rock solid (solidEndAlpha), baked once per world's piece; null where the page cannot read the sheet back (then
 * the sheet's own piece is drawn). Baked again when the phone has taken the copy back (canvasLost.ts, LESSONS D6).
 */
function endSolid(img: HTMLImageElement, e: GroundSheet['end'], w: number): HTMLCanvasElement | null {
  const key = `${w}:${e.x},${e.y}`;
  const had = solidEnds.get(key);
  if (had && !canvasLost(had, 'bank end')) return had;
  if (had === null) return null;
  let c: HTMLCanvasElement | null = null;
  try {
    c = document.createElement('canvas');
    c.width = e.w;
    c.height = e.h;
    const g = c.getContext('2d', { willReadFrequently: true })!;
    g.drawImage(img, e.x, e.y, e.w, e.h, 0, 0, e.w, e.h);
    const d = g.getImageData(0, 0, e.w, e.h);
    const al = new Uint8ClampedArray(e.w * e.h);
    for (let i = 0; i < al.length; i++) al[i] = d.data[i * 4 + 3];
    const solid = solidEndAlpha(al, e.w, e.h);
    const px = d.data, W = e.w;
    // (a crack made solid takes the darker of the paint either side of it in its row)
    const near = (i: number, step: number, lim: number) => { for (let j = i + step; j !== lim; j += step) if (al[j]) return j; return -1; };
    for (let i = 0; i < al.length; i++) {
      if (!al[i] && solid[i]) {
        const r0 = i - (i % W), l = near(i, -1, r0 - 1), r = near(i, 1, r0 + W);
        const sum = (j: number) => (j < 0 ? 1e9 : px[j * 4] + px[j * 4 + 1] + px[j * 4 + 2]);
        const j = sum(l) <= sum(r) ? l : r;
        if (j >= 0) for (let c = 0; c < 3; c++) px[i * 4 + c] = px[j * 4 + c];
        else solid[i] = 0;
      }
      px[i * 4 + 3] = solid[i];
    }
    g.putImageData(d, 0, 0);
  } catch {
    c = null;
  }
  solidEnds.set(key, c);
  return c;
}

const cutEnds = new Map<string, HTMLCanvasElement | null>();
/** which solid piece each step's copy was cut from (a solid piece baked again means its steps are cut again) */
const cutFrom = new WeakMap<HTMLCanvasElement, HTMLCanvasElement | null>();
/**
 * The end piece faded out toward `cut` units below its top (a step down to a lower bank: the lower bank's lip takes over there). Baked
 * once per world and cut (to 8 units), so a step's end has no hard line where it stops. Made from the solid piece (endSolid) where there
 * is one; baked again when either copy is taken back (LESSONS D6).
 */
function endFaded(img: HTMLImageElement, e: GroundSheet['end'], w: number, cut: number, fade = 46): HTMLCanvasElement | null {
  const key = `${w}:${e.x},${e.y}:${Math.round(cut / 8)}:${fade}`;
  const src = endSolid(img, e, w);
  const had = cutEnds.get(key);
  if (had && !canvasLost(had, 'bank end step') && (cutFrom.get(had) ?? null) === src) return had;
  if (had === null) return null;
  let c: HTMLCanvasElement | null = null;
  try {
    c = document.createElement('canvas');
    c.width = e.w;
    c.height = e.h;
    const g = c.getContext('2d')!;
    if (src) g.drawImage(src, 0, 0);
    else g.drawImage(img, e.x, e.y, e.w, e.h, 0, 0, e.w, e.h);
    cutFrom.set(c, src);
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
  const solid = faded ? null : endSolid(s.img, e, w);
  if (faded) ctx.drawImage(faded, -e.cx * ew, top, ew, END_H);
  else if (solid) ctx.drawImage(solid, -e.cx * ew, top, ew, END_H);
  else ctx.drawImage(s.img, e.x, e.y, e.w, e.h, -e.cx * ew, top, ew, END_H);
  ctx.restore();
  return true;
}
