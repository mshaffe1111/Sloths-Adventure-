/**
 * w7SlideArt — drawing 7-4's slide from behind Pokey's back (w7Slide.ts): the wooden flume through the dark under the temple, in Matt's
 * Gemini sheets (reference/prop-sheets/gemini-batch-2026-10-29/7-4-slide/, cut by tools/art/slide74/cut.py into src/assets/w7slide/
 * flume-*.webp, boxes in w7SlideAtlas.ts), lit by the lead's lighting brief.
 *
 * How a frame is made (cheap enough for the 30 fps loop):
 *   1. the scene, unlit: the cave's rock and roof laid in true perspective one screen column or row at a time (the Hugging Face cave
 *      textures, far back in the dark); the trestles; the flume's three troughs, row by row from Matt's trough piece (a lane each, plain
 *      and mossy boards mixed); then the pieces far to near, each scaled with its distance: the cave ribs and mouths (Sheet 4), torches,
 *      lanterns, fungus, glowworms, eyes, signs, scaffolds, the rope bridge, webs, thorns, roots, stalactites, stalagmites (Sheets 2-3),
 *      the obstacles (Sheet 1's barriers, beams, crates and broken ends; World 7's statue);
 *   2. the light: a half-size light map, the cave's ambient (#142430) plus each light as a soft sprite made once (warm torches and
 *      lanterns with a slow flicker, green and purple fungus, the cool daylight of the way out), multiplied over the scene;
 *   3. what gives light, its painted art again on top at its own brightness: the torches, the lanterns, the fungus, the glowworms; the
 *      eyes as glowing pinpoints; the way out;
 *   4. Pokey (Sheet 5), lit by the light where he is (a warm key that sweeps over him as each torch rushes by, a cool rim from the far
 *      end), never darker than POKEY_MIN, with his shadow under him.
 */
import { trackAtlas } from './atlasLoader.ts';
import { KINDS, SLIDE, type Obstacle, type SlideSim } from './w7Slide.ts';
import { FLUME_SHEETS } from './w7SlideAtlas.ts';
import { drawFlowerSprite, FLOWER_SIZE } from './flowerSprites.ts';
import { AMBIENT, CAVE_ROOF, CAVE_X, GLOWS, HANGS, LIGHT_RGB, POKEY_MIN, RAIL_H, RAIL_X, buildScene, type LightKind, type Prop, type Scene } from './w7SlideScene.ts';

const U = (n: string) => new URL(`../assets/w7slide/${n}`, import.meta.url).href;
const URLS = {
  'flume-cave': U('flume-cave.webp'),
  'flume-props': U('flume-props.webp'),
  'flume-pokey': U('flume-pokey.webp'),
  rock: U('chute-wall-roots.webp'),
  roof: U('chute-ceiling.webp'),
  end: U('chute-end-light.webp'),
  w7c: new URL('../assets/w6to10/props-made/w7c.webp', import.meta.url).href,
};
type Key = keyof typeof URLS;
/** every piece by name: its sheet and its box */
const PIECE: Record<string, [Key, number, number, number, number]> = {
  statue: ['w7c', 0, 0, 253, 468],
  // (the way out: the middle of the art helper's painting, where the daylight is)
  end: ['end', 200, 160, 624, 600],
};
for (const [sheet, frames] of Object.entries(FLUME_SHEETS)) for (const [n, b] of Object.entries(frames)) PIECE[n] = [sheet as Key, b[0], b[1], b[2], b[3]];
/** a piece's width for a height of 1 */
const aspect = (n: string) => PIECE[n][3] / PIECE[n][4];

const imgs: Partial<Record<Key, HTMLImageElement | null>> = {};
const ok = new Set<Key>();
function img(k: Key): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  if (!(k in imgs)) {
    const im = new Image();
    imgs[k] = im;
    trackAtlas(im, URLS[k], () => ok.add(k), () => { imgs[k] = null; });
  }
  return ok.has(k) ? imgs[k]! : null;
}
/**
 * A picture (or a box of one) in halving sizes, made once. A strip far down the flume reads from the size nearest its own size on screen,
 * so far boards and stones stay smooth instead of breaking into a shimmer of pixels (the lead's review, 2026-10-29).
 */
const mipCache = new Map<string, HTMLCanvasElement[]>();
function mipOf(key: string, src: CanvasImageSource, sx: number, sy: number, sw: number, sh: number): HTMLCanvasElement[] {
  const have = mipCache.get(key);
  if (have) return have;
  const levels: HTMLCanvasElement[] = [];
  let w = Math.round(sw), h = Math.round(sh);
  const first = canvas(w, h)!;
  first.getContext('2d')!.drawImage(src, sx, sy, sw, sh, 0, 0, w, h);
  levels.push(first);
  while (w > 8 && h > 8) {
    const prev = levels[levels.length - 1];
    w = Math.max(4, Math.round(w / 2));
    h = Math.max(4, Math.round(h / 2));
    const c = canvas(w, h)!;
    const g = c.getContext('2d')!;
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = 'high';
    g.drawImage(prev, 0, 0, w, h);
    levels.push(c);
  }
  mipCache.set(key, levels);
  // (each size turned into an ImageBitmap as soon as the browser has made it: drawn from a canvas, thousands of strips a frame made the
  // browser stall every few frames; from a bitmap they don't)
  if (typeof createImageBitmap !== 'undefined') {
    levels.forEach((c, i) => {
      createImageBitmap(c).then((bm) => { (levels as unknown as Array<CanvasImageSource & { width: number; height: number }>)[i] = bm; }, () => {});
    });
  }
  return levels;
}
/** the three troughs side by side, a few mixes of plain and mossy (each with its halving sizes), made once Matt's sheet has loaded */
let strips3: HTMLCanvasElement[][] | null = null;
function troughStrips(): HTMLCanvasElement[][] | null {
  if (strips3) return strips3;
  const cave = img('flume-cave');
  if (!cave) return null;
  const mixes = [[0, 0, 0], [0, 1, 0], [1, 0, 0], [0, 0, 1], [0, 1, 1], [1, 0, 1]];
  const bed = PIECE.bed, moss = PIECE.bedMoss;
  const w = bed[3], h = bed[4];
  strips3 = mixes.map((mix, i) => {
    const c = canvas(w * 3, h)!;
    const g = c.getContext('2d')!;
    mix.forEach((mo, l) => {
      const b = mo ? moss : bed;
      // (the right-hand trough mirrored, so the three don't read as one piece three times)
      if (l === 2) {
        g.save();
        g.translate(w * 3, 0);
        g.scale(-1, 1);
        g.drawImage(cave, b[1], b[2], b[3], b[4], 0, 0, w, h);
        g.restore();
      } else g.drawImage(cave, b[1], b[2], b[3], b[4], l * w, 0, w, h);
    });
    return mipOf(`troughs${i}`, c, 0, 0, c.width, c.height);
  });
  return strips3;
}

/** the level for a strip that shrinks its source this much (source px per device px), and that level's scale against the full size */
function pick(levels: HTMLCanvasElement[], shrink: number): { c: HTMLCanvasElement; k: number } {
  const L = Math.min(levels.length - 1, Math.max(0, Math.floor(Math.log2(Math.max(1, shrink)))));
  return { c: levels[L], k: levels[L].width / levels[0].width };
}
/** the same, with the next smaller level and how far toward it this strip is (0-1): the rock and roof blend the two, so where the
 * level changes across the wall there is no straight line (the lead's review of v3, 2026-10-29) */
function pick2(levels: HTMLCanvasElement[], shrink: number): { c: HTMLCanvasElement; k: number; c2: HTMLCanvasElement; k2: number; t: number } {
  const lg = Math.max(0, Math.log2(Math.max(1, shrink)));
  const L = Math.min(levels.length - 1, Math.floor(lg)), L2 = Math.min(levels.length - 1, L + 1);
  return { c: levels[L], k: levels[L].width / levels[0].width, c2: levels[L2], k2: levels[L2].width / levels[0].width, t: L2 > L ? lg - L : 0 };
}

export function warmSlide() {
  for (const k of Object.keys(URLS) as Key[]) img(k);
}

const canvas = (w: number, h: number): HTMLCanvasElement | null => {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};
/** a soft light, one per colour, made once and scaled per light */
const lightSprites = new Map<LightKind, HTMLCanvasElement>();
function lightSprite(k: LightKind): HTMLCanvasElement | null {
  const have = lightSprites.get(k);
  if (have) return have;
  const c = canvas(128, 128);
  if (!c) return null;
  const g = c.getContext('2d')!;
  const [r, gg, b] = LIGHT_RGB[k].map((v) => Math.round(v * 255));
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  // (the scene's falloff: (1 - d/r)² from the middle out)
  for (let i = 0; i <= 8; i++) gr.addColorStop(i / 8, `rgba(${r}, ${gg}, ${b}, ${(1 - i / 8) ** 2})`);
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  lightSprites.set(k, c);
  return c;
}
let lmap: HTMLCanvasElement | null = null;
let pk: HTMLCanvasElement | null = null;
const scenes = new WeakMap<object, Scene>();
function sceneOf(sim: SlideSim): Scene {
  let s = scenes.get(sim.c);
  if (!s) scenes.set(sim.c, (s = buildScene(sim.c)));
  return s;
}

interface View {
  W: number;
  H: number;
  cx: number;
  hy: number;
  f: number;
  camX: number;
  camY: number;
  camZ: number;
}
const CAM_BACK = 4.2;
const CAM_H = 1.7;
/** one trough's piece covers a lane and this much of the flume's length (its own picture's shape) */
const TROUGH_LEN = SLIDE.lane / aspect('bed');
const ROCK_PANEL = 3.2;
const ROOF_TILE = 2 * CAVE_X;
const ROCK_LOW = -3.5;

function view(sim: SlideSim, W: number, H: number): View {
  const portrait = H > W;
  // (upright, a narrower view and a higher horizon, so the flume ahead fills the tall screen instead of a band across its middle; the
  // outer troughs' rails run just off the screen's edges beside him, and the camera follows him across further)
  const f = portrait ? W * 1.32 : Math.min(W * 0.7, H * 1.1);
  const hy = H * (portrait ? 0.36 : 0.36);
  return { W, H, cx: W / 2, hy, f, camX: sim.x * (portrait ? 0.75 : 0.55), camY: CAM_H + sim.y * 0.3, camZ: sim.z - CAM_BACK };
}
function P(v: View, x: number, y: number, z: number): [number, number, number] | null {
  const dz = z - v.camZ;
  if (dz < 0.3) return null;
  const s = v.f / dz;
  return [v.cx + (x - v.camX) * s, v.hy + (v.camY - y) * s, s];
}
const fadeIn = (dz: number) => Math.max(0, Math.min(1, (SLIDE.far - dz) / SLIDE.fade));
/** fills a four-cornered shape (screen points) */
function quadFill(ctx: CanvasRenderingContext2D, q: Array<[number, number, number]>) {
  ctx.beginPath();
  q.forEach((pt, i) => (i ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1])));
  ctx.closePath();
  ctx.fill();
}
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
/**
 * The cave layers (Sheet 4) are painted to straight outer edges (their inner edges are the ragged rock): a copy of each with its straight
 * edges feathered into the dark is made once, so a rib or a mouth far down the flume melts into the dark instead of showing a box.
 * [left, right, top, bottom]: how much of each edge fades (share of the width or height).
 */
const FEATHER: Record<string, [number, number, number, number]> = {
  wallL: [0.35, 0, 0.12, 0.3],
  wallR: [0, 0.35, 0.12, 0.3],
  ceiling: [0.15, 0.15, 0.45, 0],
  mouth: [0.2, 0.2, 0.25, 0.25],
  end: [0.2, 0.2, 0.2, 0.2],
  // (the eyes in the dark: the rock and roots round them fade out, no box edge in the narrow dark)
  eyesHole: [0.2, 0.2, 0.2, 0.2],
  eyesRoots: [0.15, 0.15, 0.15, 0.15],
  eyesThorns: [0.15, 0.15, 0.15, 0.15],
  // (the gaps' broken ends: their dark drop fades into the dark under the flume)
  brokenBack: [0, 0, 0, 0.5],
  brokenFront: [0, 0, 0, 0.5],
};
const feathered = new Map<string, HTMLCanvasElement>();
function featherOf(n: string): HTMLCanvasElement | null {
  const have = feathered.get(n);
  if (have) return have;
  const [k, fx, fy, fw, fh] = PIECE[n];
  const im = img(k);
  const c = im && canvas(fw, fh);
  if (!im || !c) return null;
  const g = c.getContext('2d')!;
  g.drawImage(im, fx, fy, fw, fh, 0, 0, fw, fh);
  g.globalCompositeOperation = 'destination-out';
  const [l, r, t, b] = FEATHER[n];
  const edge = (x0: number, y0: number, x1: number, y1: number, rx: number, ry: number, rw: number, rh: number) => {
    const gr = g.createLinearGradient(x0, y0, x1, y1);
    gr.addColorStop(0, 'rgba(0, 0, 0, 1)');
    gr.addColorStop(1, 'rgba(0, 0, 0, 0)');
    g.fillStyle = gr;
    g.fillRect(rx, ry, rw, rh);
  };
  if (l) edge(0, 0, fw * l, 0, 0, 0, fw * l, fh);
  if (r) edge(fw, 0, fw * (1 - r), 0, fw * (1 - r), 0, fw * r, fh);
  if (t) edge(0, 0, 0, fh * t, 0, 0, fw, fh * t);
  if (b) edge(0, fh, 0, fh * (1 - b), 0, fh * (1 - b), fw, fh * b);
  feathered.set(n, c);
  // (as a bitmap once the browser has made it: drawn from canvases, the cave layers and the troughs together made it stall every few
  // frames sideways)
  if (typeof createImageBitmap !== 'undefined') createImageBitmap(c).then((bm) => feathered.set(n, bm as unknown as HTMLCanvasElement), () => {});
  return c;
}

/** a piece into a box on the screen (srcY0/srcY1: the share of the source to take, top to bottom) */
function piece(ctx: CanvasRenderingContext2D, n: string, x: number, y: number, w: number, h: number, flip = false, srcY0 = 0, srcY1 = 1): boolean {
  const pc = PIECE[n];
  if (!pc) return false;
  let [k, fx, fy, fw, fh] = pc;
  let im: HTMLImageElement | HTMLCanvasElement | null = img(k);
  if (!im) return false;
  if (FEATHER[n]) {
    const f = featherOf(n);
    if (f) {
      im = f;
      fx = 0;
      fy = 0;
    }
  }
  if (flip) {
    ctx.save();
    ctx.translate(x + w, y);
    ctx.scale(-1, 1);
    ctx.drawImage(im, fx, fy + fh * srcY0, fw, fh * (srcY1 - srcY0), 0, 0, w, h);
    ctx.restore();
  } else ctx.drawImage(im, fx, fy + fh * srcY0, fw, fh * (srcY1 - srcY0), x, y, w, h);
  return true;
}
/** a piece standing at (x, y foot, z), h tall (or hanging from y, for HANGS) */
function stand(ctx: CanvasRenderingContext2D, v: View, n: string, x: number, y: number, z: number, h: number, flip = false) {
  const w = h * aspect(n);
  const top = HANGS.has(n) ? y : y + h;
  const a = P(v, x - w / 2, top, z), b = P(v, x + w / 2, top - h, z);
  if (!a || !b) return;
  // (a side piece never grows past about half the screen: it fades out before it gets that big and soft)
  const big = (b[1] - a[1]) / v.H;
  if (big > 0.55) return;
  const keep = ctx.globalAlpha;
  if (big > 0.38) ctx.globalAlpha = keep * (0.55 - big) / 0.17;
  piece(ctx, n, a[0], a[1], b[0] - a[0], b[1] - a[1], flip);
  ctx.globalAlpha = keep;
}

const exposure = (sim: SlideSim) => Math.max(0, Math.min(1, (sim.clock - 0.35) / 1.0));

/**
 * The slide drawn once, offscreen, at one of eight points down the course (`i` 0-7), so every picture's halving sizes, feathered copies
 * and light sprites are made, and turned into bitmaps, before he lands in the flume: the hall, the crack and the fall call it a few
 * frames apart. (Made on first sight instead, the first frames of a new stretch took up to 140 ms at a 4x CPU slow-down.)
 */
let warmCanvas: HTMLCanvasElement | null = null;
export function prewarmSlide(sim: SlideSim, W: number, H: number, dpr: number, i: number): boolean {
  // (only once every picture has loaded: a pass before that would make nothing)
  if ((Object.keys(URLS) as Key[]).some((k) => !img(k))) return false;
  const w = Math.round(W * dpr), h = Math.round(H * dpr);
  if (!warmCanvas || warmCanvas.width !== w || warmCanvas.height !== h) warmCanvas = canvas(w, h);
  if (!warmCanvas) return false;
  const z = sim.z, clock = sim.clock;
  sim.z = (sim.c.length * i) / 8;
  sim.clock = 5;
  try {
    drawSlide(warmCanvas.getContext('2d')!, sim, W, H, dpr, null);
  } finally {
    sim.z = z;
    sim.clock = clock;
  }
  return true;
}

export function drawSlide(ctx: CanvasRenderingContext2D, sim: SlideSim, W: number, H: number, dpr: number, say: { text: string; t: number } | null) {
  const c = sim.c;
  const sc = sceneOf(sim);
  const v = view(sim, W, H);
  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // (smooth, at the default quality: the halving sizes do the work 'high' would, at a fraction of the cost a strip)
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'low';
  ctx.fillStyle = '#05080b';
  ctx.fillRect(0, 0, W, H);
  const farZ = Math.min(sim.z + SLIDE.far, c.length + 4);
  const gaps = sim.sorted.filter((o) => o.kind === 'gap' && o.z + o.len > v.camZ && o.z < farZ);
  const inGap = (z: number) => gaps.some((o) => z > o.z && z < o.z + o.len);
  // (strips get thinner toward the vanishing point, down to one device pixel, where a step would show; near the camera they can be
  // wider, since the picture there is magnified)
  const thin = Math.max(1 / dpr, 0.75);
  const stepBy = (t: number) => Math.max(thin, Math.min(2.2, t * 2.6));
  // (the rock and the roof are clipped to their outlines, so their edges are smooth whatever the strip: wider strips there keep the
  // frame cheap)
  const stepWide = (t: number) => Math.max(2.5, Math.min(6, t * 7));
  const vis = (z: number) => z < c.length + 2;

  // 1a. the way out, far ahead near the end (behind everything; the cool daylight in the light map lights it, and the cave mouth
  // painted at the end frames it)
  if (c.length - sim.z < SLIDE.far + 10) {
    const a = P(v, -CAVE_X * 0.75, 3.4, c.length + 3), b = P(v, CAVE_X * 0.75, -0.6, c.length + 3);
    if (a && b) {
      ctx.globalAlpha = Math.max(0, Math.min(1, 1 - (c.length - sim.z - SLIDE.far) / 10));
      piece(ctx, 'end', a[0], a[1], b[0] - a[0], b[1] - a[1]);
      ctx.globalAlpha = 1;
    }
  }
  // the cave's rock either side and its roof, far back in the dark, read from the picture's size nearest its own on screen so it never
  // shimmers. (The rock's strips run a little past the roof's line and the roof is laid over them: the roof's rows end exactly on the
  // line, so the edge is smooth without a clip, which made the browser stall every few frames.)
  const rock = img('rock'), roof = img('roof');
  if (rock) {
    const mip = mipOf('rock', rock, 0, 0, rock.width, rock.height);
    for (const side of [-1, 1]) {
      const X = side * CAVE_X;
      const xFar = P(v, X, CAVE_ROOF, farZ)![0];
      for (let x = side < 0 ? 0 : W; side < 0 ? x < xFar : x > xFar; ) {
        const st = stepWide(Math.abs(x - xFar) / (W / 2));
        const s = (x - v.cx) / (X - v.camX), s2 = (x - side * st - v.cx) / (X - v.camX);
        x += -side * st;
        if (s <= 0 || s2 <= 0) continue;
        const dz = v.f / s, dz2 = v.f / s2;
        if (dz < 0.3) continue;
        const z = v.camZ + dz;
        const top = v.hy + (v.camY - CAVE_ROOF) * s, bot = v.hy + (v.camY - ROCK_LOW) * s;
        const du = (Math.abs(dz2 - dz) / ROCK_PANEL) * rock.width;
        const m = pick2(mip, Math.max(du / (st * dpr), rock.height / ((bot - top) * dpr)));
        // (the picture's left and right edges don't match, so it repeats mirrored back and forth: a plain repeat showed a straight seam
        // down the wall at every panel)
        const p2 = (((z / ROCK_PANEL) % 2) + 2) % 2, ph = p2 > 1 ? 2 - p2 : p2;
        // (solid strips: half-see-through ones overlapping would show as fine lines; the rock is darkened in one pass below. The next
        // smaller level is laid over at its share, so the change of level is a blend, not an edge.)
        const a0 = fadeIn(dz);
        for (const [lc, lk, la] of [[m.c, m.k, a0], [m.c2, m.k2, a0 * m.t]] as const) {
          if (la < 0.02) continue;
          let u = ph * lc.width;
          if (side > 0) u = lc.width - 1 - u;
          ctx.globalAlpha = la;
          // (the source box kept inside the picture: one that ran past its edge was cropped by the browser, leaving a thin dark gap down
          // the wall at every panel, the straight lines in the lead's review of v3)
          const sw = Math.min(lc.width, Math.max(1, du * lk));
          ctx.drawImage(lc, Math.max(0, Math.min(lc.width - sw, u)), 0, sw, lc.height, x + (side < 0 ? -st : 0), top - 4, st + 0.5, bot - top + 4);
        }
      }
      // the rock darker than its picture (it is far back in the cave): one fill over the wall's shape
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#05080b';
      quadFill(ctx, [P(v, X, CAVE_ROOF + 0.05, v.camZ + 0.5)!, P(v, X, CAVE_ROOF + 0.05, farZ)!, P(v, X, ROCK_LOW, farZ)!, P(v, X, ROCK_LOW, v.camZ + 0.5)!]);
      ctx.globalAlpha = 1;
    }
  }
  if (roof) {
    const mip = mipOf('roof', roof, 0, 0, roof.width, roof.height);
    const up = CAVE_ROOF - v.camY;
    const yFar = v.hy - (up * v.f) / (farZ - v.camZ);
    for (let y = 0; y < yFar; ) {
      const st = Math.max(0.75, stepWide((yFar - y) / v.hy) * 0.6);
      const dz = (up * v.f) / (v.hy - y), dz2 = (up * v.f) / Math.max(0.01, v.hy - y - st);
      const z = v.camZ + dz, s = v.f / dz;
      const m = pick2(mip, Math.max(((dz2 - dz) / ROOF_TILE) * roof.height / (st * dpr), roof.width / (2 * CAVE_X * s * dpr)));
      // (mirrored back and forth too, so the tiles meet on matching edges)
      const p2 = (((z / ROOF_TILE) % 2) + 2) % 2, ph = p2 > 1 ? 2 - p2 : p2;
      const a0 = fadeIn(dz);
      for (const [lc, la] of [[m.c, a0], [m.c2, a0 * m.t]] as const) {
        if (la < 0.02) continue;
        const tv = ph * lc.height;
        const th = Math.min(lc.height, Math.max(1, ((dz2 - dz) / ROOF_TILE) * lc.height));
        ctx.globalAlpha = la;
        ctx.drawImage(lc, 0, Math.min(tv, lc.height - th), lc.width, th, v.cx + (-CAVE_X - v.camX) * s, y, 2 * CAVE_X * s, st + 0.5);
      }
      y += st;
    }
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#05080b';
    quadFill(ctx, [P(v, -CAVE_X, CAVE_ROOF, v.camZ + 0.5)!, P(v, CAVE_X, CAVE_ROOF, v.camZ + 0.5)!, P(v, CAVE_X, CAVE_ROOF, farZ)!, P(v, -CAVE_X, CAVE_ROOF, farZ)!]);
    ctx.globalAlpha = 1;
  }
  ctx.globalAlpha = 1;
  // 1b. the trestles (Sheet 1) under each trough, every few metres, before the troughs that sit on them
  for (let z = Math.floor((farZ - 0.1) / TROUGH_LEN / 2) * TROUGH_LEN * 2; z > v.camZ + 0.8; z -= TROUGH_LEN * 2) {
    if (inGap(z)) continue;
    ctx.globalAlpha = fadeIn(z - v.camZ);
    for (let l = 0; l < 3; l++) {
      const x = (l - 1) * SLIDE.lane;
      const a = P(v, x - SLIDE.lane / 2, 0, z), b = P(v, x + SLIDE.lane / 2, -SLIDE.lane / aspect('trestle'), z);
      if (a && b) piece(ctx, 'trestle', a[0], a[1], b[0] - a[0], b[1] - a[1], l === 2);
    }
  }
  ctx.globalAlpha = 1;
  // 1c. the three troughs, row by row from the bottom of the screen (Matt's trough piece, a lane each; plain and mossy mixed): each row
  // one picture across all three, from a few three-lane strips made once (which lanes are mossy), in halving sizes
  {
    const strips = troughStrips();
    if (strips) {
      const yFar = v.hy + (v.camY * v.f) / (farZ - v.camZ);
      for (let y = H; y > yFar; ) {
        const st = stepBy((y - yFar) / (H - v.hy));
        const dz = (v.camY * v.f) / (y - v.hy), dz2 = (v.camY * v.f) / Math.max(0.01, y - st - v.hy);
        y -= st;
        const z = v.camZ + dz;
        if (inGap(z) || !vis(z)) continue;
        const s = v.f / dz;
        const tile = Math.floor(z / TROUGH_LEN);
        // (the trough piece is drawn looking down it: its top row is the far end, so a tile is read from its foot up)
        const t = 1 - (((z / TROUGH_LEN) % 1) + 1) % 1;
        const tf = Math.max(0.0005, (dz2 - dz) / TROUGH_LEN);
        const mip = strips[Math.floor(hash(tile * 3.1) * strips.length)];
        const m = pick(mip, Math.max((tf * mip[0].height) / (st * dpr), mip[0].width / (3 * SLIDE.lane * s * dpr)));
        const H0 = m.c.height;
        const sy = Math.min(H0 - 1, t * H0);
        const sh = Math.max(0.5, Math.min(H0 * tf, H0 - sy));
        ctx.globalAlpha = fadeIn(dz);
        ctx.drawImage(m.c, 0, sy, m.c.width, sh, v.cx + (-1.5 * SLIDE.lane - v.camX) * s, y, 3 * SLIDE.lane * s + 0.4, st + 0.5);
      }
      ctx.globalAlpha = 1;
    }
  }
  // 1d. the pieces, far to near
  type Thing = { z: number; draw: () => void };
  const things: Thing[] = [];
  const z0 = v.camZ + 0.8;
  for (const p of sc.props) {
    if (p.z < z0 || p.z > farZ) continue;
    things.push({ z: p.z, draw: () => drawProp(ctx, v, p) });
  }
  for (const o of gaps) {
    things.push({ z: o.z, draw: () => drawLips(ctx, v, o.z, 'brokenBack') });
    things.push({ z: o.z + o.len, draw: () => drawLips(ctx, v, o.z + o.len, 'brokenFront') });
  }
  sim.sorted.forEach((o, i) => {
    if (o.kind === 'gap' || o.z + o.len < z0 || o.z > farZ) return;
    things.push({ z: o.z, draw: () => drawObstacle(ctx, v, o, sim.wasMet(i)) });
  });
  things.push({ z: sim.z + 0.01, draw: () => {
    const g = P(v, sim.x, 0, sim.z);
    if (!g) return;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(g[0], g[1], g[2] * 0.42 * (1 - Math.min(0.5, sim.y * 0.35)), g[2] * 0.11, 0, 0, Math.PI * 2);
    ctx.fill();
  } });
  things.sort((a, b) => b.z - a.z);
  for (const t of things) t.draw();

  // 2. the light map, multiplied over the scene
  const ex = exposure(sim);
  // (a third of the screen's size: the light is soft, so a small map loses nothing and costs a ninth)
  const LS = 3;
  const lw = Math.ceil(W / LS), lh = Math.ceil(H / LS);
  if (!lmap) lmap = canvas(lw, lh);
  if (lmap) {
    if (lmap.width !== lw || lmap.height !== lh) {
      lmap.width = lw;
      lmap.height = lh;
    }
    const g = lmap.getContext('2d')!;
    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = 1;
    g.fillStyle = `rgb(${AMBIENT.map((a) => Math.round(a * 255 * ex)).join(',')})`;
    g.fillRect(0, 0, lw, lh);
    g.globalCompositeOperation = 'lighter';
    for (const l of sc.lights) {
      if (l.z + l.r < v.camZ || l.z - l.r > farZ + 4) continue;
      const p = P(v, l.x, l.y, Math.max(l.z, v.camZ + 0.6));
      if (!p) continue;
      const spr = lightSprite(l.kind);
      if (!spr) continue;
      const flick = l.kind === 'torch' || l.kind === 'lantern' ? 0.93 + 0.07 * Math.sin(sim.clock * 6.3 + l.z * 1.7) : 1;
      const r = (l.r * p[2]) / LS;
      g.globalAlpha = Math.min(1, l.i * flick * ex);
      g.drawImage(spr, p[0] / LS - r, p[1] / LS - r, r * 2, r * 2);
    }
    g.globalAlpha = 1;
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(lmap, 0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
  }

  // 3. what gives light, on top at its own brightness: the way out, then the torches, lanterns, fungus and glowworms, the eyes
  for (const p of sc.props) {
    if (p.z < z0 || p.z > farZ) continue;
    if (GLOWS.has(p.kind)) {
      ctx.globalAlpha = fadeIn(p.z - v.camZ) * nearFade(p.z - v.camZ) * ex * (0.82 + 0.08 * Math.sin(sim.clock * 6.3 + p.z * 1.7));
      stand(ctx, v, p.kind, p.x, p.y, p.z, p.h, p.flip);
    } else if (p.kind.startsWith('eyes')) drawEyes(ctx, v, p, sim.clock, ex);
  }
  ctx.globalAlpha = 1;
  // the flowers to pick up: the game's own painted World 7 flowers (flowerSprites.ts), bright, far to near
  for (let i = c.petals.length - 1; i >= 0; i--) {
    const p = c.petals[i];
    if (sim.petalsGot.has(i) || p.z < sim.z - 0.3 || p.z > farZ) continue;
    const q = P(v, p.x, p.y + 0.08 * Math.sin(sim.clock * 4 + p.z), p.z);
    if (!q) continue;
    ctx.save();
    ctx.globalAlpha = fadeIn(p.z - v.camZ) * Math.max(0.35, ex);
    ctx.translate(q[0], q[1]);
    const k = (0.42 * q[2]) / FLOWER_SIZE;
    ctx.scale(k, k);
    drawFlowerSprite(ctx, 7, 4, i, Math.sin(sim.clock * 2 + i) * 0.15);
    ctx.restore();
  }
  drawStreaks(ctx, v, sim);

  // 4. Pokey, lit where he is
  drawPokey(ctx, v, sim, sc, ex);

  const vg = ctx.createRadialGradient(v.cx, v.hy + H * 0.12, Math.min(W, H) * 0.3, v.cx, v.hy + H * 0.12, Math.max(W, H) * 0.8);
  vg.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vg.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
  // his line, in a bubble on the flume just in front of the camera, below him: over his head it would cover the flume ahead, where the
  // next obstacle comes up out of the dark (polish bar: words never cover the hazard); its tail points up at him
  if (say && say.t > 0) {
    const feet = P(v, sim.x, 0, sim.z);
    if (feet) drawBubble(ctx, say.text, feet[0], Math.min(H - 70, feet[1] + 24), W, Math.min(1, say.t * 3));
  }
  if (sim.outT >= 0) {
    ctx.fillStyle = `rgba(240, 248, 255, ${Math.min(1, sim.outT / SLIDE.outro)})`;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

/** a piece right by the camera fades out before it gets huge and soft (the sheets are drawn at about 200 px a piece) */
const nearFade = (dz: number) => Math.min(1, Math.max(0, (dz - 3.2) / 2.3));

function drawProp(ctx: CanvasRenderingContext2D, v: View, p: Prop) {
  const dz = p.z - v.camZ;
  ctx.globalAlpha = fadeIn(dz) * (p.kind === 'rib' || p.kind === 'mouth' || p.kind === 'wallL' || p.kind === 'wallR' ? 1 : nearFade(dz));
  if (p.kind === 'rib' || p.kind === 'wallL' || p.kind === 'wallR') {
    // a rib of the cave (Sheet 4): its two walls framing the flume and its ceiling layer overhead, or one wall on its own; sizes, offsets
    // and mirrors vary from rib to rib (a mirrored right wall is a left wall with other rock), fading as it passes over him
    ctx.globalAlpha *= Math.min(1, Math.max(0, (dz - 3.5) / 2.5));
    const k = p.h / CAVE_ROOF;
    const wH = (CAVE_ROOF - ROCK_LOW * 0.4) * k;
    const top = CAVE_ROOF + (k - 1) * 0.8;
    const wall = (side: -1 | 1) => {
      const n = (side < 0) !== !!p.flip ? 'wallL' : 'wallR';
      const w = wH * aspect(n);
      const X = side * CAVE_X + p.x;
      const a = P(v, side < 0 ? X - w * 0.35 : X - w * 0.65, top, p.z), b = P(v, side < 0 ? X + w * 0.65 : X + w * 0.35, top - wH, p.z);
      if (a && b) piece(ctx, n, a[0], a[1], b[0] - a[0], b[1] - a[1], !!p.flip);
    };
    if (p.kind !== 'wallR') wall(-1);
    if (p.kind !== 'wallL') wall(1);
    if (p.kind === 'rib') {
      const cw = 2 * CAVE_X + 1.2, ch = cw / aspect('ceiling');
      const c0 = P(v, -cw / 2 + p.x, top + 0.3, p.z), c1 = P(v, cw / 2 + p.x, top + 0.3 - ch * 0.55 * k, p.z);
      if (c0 && c1) piece(ctx, 'ceiling', c0[0], c0[1], c1[0] - c0[0], c1[1] - c0[1], !!p.flip, 0, 0.55);
    }
  } else if (p.kind === 'mouth') {
    // a cave mouth (Sheet 4) the flume runs into: its opening is see-through
    ctx.globalAlpha *= Math.min(1, Math.max(0, (dz - 3) / 3));
    const w = 2 * CAVE_X + 3, h = w / aspect('mouth');
    const a = P(v, -w / 2, CAVE_ROOF + 1.2, p.z), b = P(v, w / 2, CAVE_ROOF + 1.2 - h, p.z);
    if (a && b) piece(ctx, 'mouth', a[0], a[1], b[0] - a[0], b[1] - a[1]);
  } else if (p.kind === 'ropeBridge') {
    const w = 2 * CAVE_X;
    const a = P(v, -w / 2, p.y + 0.8, p.z), b = P(v, w / 2, p.y - 0.4, p.z);
    if (a && b) piece(ctx, 'ropeBridge', a[0], a[1], b[0] - a[0], b[1] - a[1]);
  } else stand(ctx, v, p.kind, p.x, p.y, p.z, p.h, p.flip);
  ctx.globalAlpha = 1;
}

/** the eyes in the rock: their piece is lit like the rock round it, and the eyes themselves glow (pinpoints that light nothing) */
const EYES: Record<string, Array<[number, number]>> = {
  eyesHole: [[0.4, 0.5], [0.6, 0.5]],
  eyesRoots: [[0.43, 0.42], [0.57, 0.42], [0.3, 0.72], [0.68, 0.72]],
  eyesThorns: [[0.32, 0.5], [0.68, 0.5]],
};
function drawEyes(ctx: CanvasRenderingContext2D, v: View, p: Prop, t: number, ex: number) {
  if (Math.sin(t * 0.9 + p.z * 3) > 0.93) return; // a blink now and then
  const w = p.h * aspect(p.kind);
  const a = P(v, p.x - w / 2, p.y + p.h, p.z), b = P(v, p.x + w / 2, p.y, p.z);
  if (!a || !b) return;
  // (like every side piece, they fade out close to the camera, before their glow gets big and soft)
  // (eyes are pinpoints: they only show far off, and are gone well before they pass him)
  const near = Math.max(0, Math.min(1, (p.z - v.camZ - 7) / 4)) * Math.max(0, Math.min(1, (0.2 - (b[1] - a[1]) / v.H) / 0.1));
  if (near <= 0) return;
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = fadeIn(p.z - v.camZ) * ex * near;
  const col = p.kind === 'eyesThorns' ? '120, 255, 150' : '255, 230, 110';
  for (const [ex0, ey0] of EYES[p.kind]) {
    const x = a[0] + (b[0] - a[0]) * (p.flip ? 1 - ex0 : ex0), y = a[1] + (b[1] - a[1]) * ey0;
    const r = Math.max(1.5, (b[0] - a[0]) * 0.06);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.2);
    g.addColorStop(0, `rgba(${col}, 1)`);
    g.addColorStop(1, `rgba(${col}, 0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - r * 2.2, y - r * 2.2, r * 4.4, r * 4.4);
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}

/** a gap's lips (Sheet 1): the near end broken off as he comes to it, the far end's splintered planks hanging into the dark */
function drawLips(ctx: CanvasRenderingContext2D, v: View, z: number, n: 'brokenBack' | 'brokenFront') {
  ctx.globalAlpha = fadeIn(z - v.camZ);
  for (let l = 0; l < 3; l++) {
    const x = (l - 1) * SLIDE.lane;
    const h = SLIDE.lane / aspect(n);
    // (the planks' top edge at the flume's floor, the drop below it)
    const top = n === 'brokenFront' ? 0.15 : 0.3;
    const a = P(v, x - SLIDE.lane / 2, top, z), b = P(v, x + SLIDE.lane / 2, top - h, z);
    if (a && b) piece(ctx, n, a[0], a[1], b[0] - a[0], b[1] - a[1], l === 2);
  }
  ctx.globalAlpha = 1;
}

function drawObstacle(ctx: CanvasRenderingContext2D, v: View, o: Obstacle, met: boolean) {
  const dz = o.z - v.camZ;
  ctx.globalAlpha = fadeIn(dz);
  const k = KINDS[o.kind];
  const box = (n: string, x0: number, x1: number, y0: number, y1: number, flip = false, s0 = 0, s1 = 1) => {
    const a = P(v, x0, y1, o.z), b = P(v, x1, y0, o.z);
    if (a && b) piece(ctx, n, a[0], a[1], b[0] - a[0], b[1] - a[1], flip, s0, s1);
  };
  const half = SLIDE.lane / 2;
  if (o.kind === 'head') {
    // one lane each, too tall to jump: World 7's sloth statue, or a tower of Matt's crates (two stacked)
    for (const l of o.lanes) {
      const x = (l - 1) * SLIDE.lane;
      if (o.look === 2) {
        box('crates', x - half, x + half, 0, 0.95, false, 0.15, 1);
        box('crates', x - half * 0.92, x + half * 0.92, 0.85, 1.85, true, 0.15, 0.85);
      } else box('statue', x - 0.5, x + 0.5, 0, 1.85, o.look === 1);
    }
  } else if (o.kind === 'rubble') {
    // Matt's plank barrier, nailed across every trough (its picture's top edge at the height a jump must clear)
    for (let l = 0; l < 3; l++) {
      const x = (l - 1) * SLIDE.lane;
      box('barrier', x - half - 0.02, x + half + 0.02, -0.05, k.low! + 0.1, l === 1, 0.1, 0.95);
    }
  } else if (o.kind === 'column') {
    // crates spilled across two troughs: low enough to jump, or steer to the open one
    for (const l of o.lanes) {
      const x = (l - 1) * SLIDE.lane;
      box('crates', x - half, x + half, -0.05, k.low! + 0.05, l % 2 === 1, 0.12, 1);
    }
  } else if (o.kind === 'beam') {
    // Matt's beam across every trough on its posts: its underside at the height he must duck under
    for (let l = 0; l < 3; l++) {
      const x = (l - 1) * SLIDE.lane;
      box('beam', x - half - 0.03, x + half + 0.03, -0.05, k.high! / 0.73, l === 1);
    }
  }
  if (met) {
    ctx.globalAlpha = 0.3 * fadeIn(dz);
    ctx.fillStyle = '#e7dcc4';
    const p = P(v, 0, 0.5, o.z);
    if (p) {
      ctx.beginPath();
      ctx.arc(p[0], p[1], p[2] * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

/** the light on Pokey where he is (r, g, b, 0..1+): a neutral floor of POKEY_MIN and the lights' own colour on top */
export function pokeyLight(sc: Scene, x: number, y: number, z: number): [number, number, number] {
  const c = [...AMBIENT] as [number, number, number];
  for (const l of sc.lights) {
    if (Math.abs(l.z - z) > l.r) continue;
    const d = Math.hypot(l.x - x, l.y - y, l.z - z);
    if (d >= l.r) continue;
    const f = l.i * (1 - d / l.r) ** 2;
    for (let k = 0; k < 3; k++) c[k] += f * LIGHT_RGB[l.kind][k];
  }
  // (so the cave's teal never turns him blue: the warm key as a torch rushes by, the green of the fungus)
  return c.map((k, i) => Math.min(1.05, POKEY_MIN + (1 - POKEY_MIN) * Math.min(1, (k - AMBIENT[i]) * 1.6))) as [number, number, number];
}

/**
 * Which of Matt's poses (Sheet 5) Pokey is in, how far it tips and how far his weight shifts (share of his width). The lead's set
 * (2026-10-29): 1 and 2 straight and bumped, 4 the lean right, 1 tipped about 10 degrees the lean left (Sheet 5's own lean left has the
 * satchel mirrored), 5 the jump, 6 the duck, 7 flipped the hurt (tipped the other way every other hit), 8 flipped the end.
 */
function pose(sim: SlideSim): { n: string; tilt: number; shift: number } {
  if (sim.outT >= 0) return { n: 'cheer', tilt: 0, shift: 0 };
  if (sim.safeT > SLIDE.safe - 0.5 && sim.hits + sim.stumbles > 0) return { n: 'hurt', tilt: (sim.hits + sim.stumbles) % 2 ? 0.12 : -0.12, shift: 0 };
  if (!sim.grounded) return { n: 'jump', tilt: 0, shift: 0 };
  if (sim.ducking) return { n: 'duck', tilt: 0, shift: 0 };
  if (sim.lean > 0.4) return { n: 'leanR', tilt: 0.05, shift: 0.04 };
  if (sim.lean < -0.4) return { n: 'grip', tilt: -0.17 * Math.min(1, -sim.lean), shift: -0.06 };
  return { n: Math.floor(sim.clock * 4) % 2 ? 'grip2' : 'grip', tilt: 0, shift: 0 };
}

function drawPokey(ctx: CanvasRenderingContext2D, v: View, sim: SlideSim, sc: Scene, ex: number) {
  const body = P(v, sim.x, sim.y, sim.z);
  if (!body) return;
  if (sim.safeT > 0 && sim.safeT < SLIDE.safe - 0.5 && Math.floor(sim.clock * 10) % 2 === 0) return;
  const { n, tilt, shift } = pose(sim);
  const [k, fx, fy, fw, fh] = PIECE[n];
  const im = img(k);
  if (!im) return;
  // (all his poses at one scale: the grip pose is 1.05 m tall)
  const scl = (1.05 * body[2]) / PIECE.grip[4];
  const dw = Math.ceil(fw * scl), dh = Math.ceil(fh * scl);
  if (dw < 2 || dh < 2) return;
  if (!pk) pk = canvas(dw, dh);
  if (!pk) return;
  if (pk.width < dw || pk.height < dh) {
    pk.width = Math.max(pk.width, dw);
    pk.height = Math.max(pk.height, dh);
  }
  const g = pk.getContext('2d')!;
  g.clearRect(0, 0, pk.width, pk.height);
  g.globalCompositeOperation = 'source-over';
  g.drawImage(im, fx, fy, fw, fh, 0, 0, dw, dh);
  const [r, gg, b] = pokeyLight(sc, sim.x, 0.6 + sim.y, sim.z).map((c) => Math.round(Math.min(1, c * (0.5 + 0.5 * ex)) * 255));
  g.globalCompositeOperation = 'multiply';
  g.fillStyle = `rgb(${r}, ${gg}, ${b})`;
  g.fillRect(0, 0, dw, dh);
  g.globalCompositeOperation = 'source-atop';
  const rim = g.createLinearGradient(0, 0, 0, dh * 0.18);
  rim.addColorStop(0, 'rgba(170, 210, 255, 0.12)');
  rim.addColorStop(1, 'rgba(170, 210, 255, 0)');
  g.fillStyle = rim;
  g.fillRect(0, 0, dw, dh);
  g.globalCompositeOperation = 'destination-in';
  g.drawImage(im, fx, fy, fw, fh, 0, 0, dw, dh);
  g.globalCompositeOperation = 'source-over';
  ctx.save();
  ctx.translate(body[0], body[1] + body[2] * 0.06);
  // (tipped about his seat, his weight shifted the way he leans)
  ctx.rotate(tilt);
  ctx.drawImage(pk, 0, 0, dw, dh, -dw / 2 + shift * dw, -dh, dw, dh);
  ctx.restore();
}

function drawStreaks(ctx: CanvasRenderingContext2D, v: View, sim: SlideSim) {
  ctx.save();
  ctx.strokeStyle = 'rgba(200, 220, 255, 0.07)';
  ctx.lineWidth = 1.5;
  const R = Math.hypot(v.W, v.H) * 0.6;
  for (let i = 0; i < 14; i++) {
    const a = hash(i * 5.3) * Math.PI * 2;
    const ph = (sim.clock * (sim.c.speed / 8) * 0.9 + hash(i * 1.7)) % 1;
    const r0 = R * (0.35 + ph * 0.65), r1 = r0 + R * 0.12 * ph;
    ctx.beginPath();
    ctx.moveTo(v.cx + Math.cos(a) * r0, v.hy + Math.sin(a) * r0);
    ctx.lineTo(v.cx + Math.cos(a) * r1, v.hy + Math.sin(a) * r1);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBubble(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, W: number, a: number) {
  // (y: the bubble's top; its tail points up at him)
  ctx.save();
  ctx.globalAlpha = a;
  ctx.font = 'bold 16px Fredoka, sans-serif';
  const w = Math.min(W - 24, ctx.measureText(text).width + 24);
  const h = 32;
  const bx = Math.max(12, Math.min(W - 12 - w, x - w / 2));
  const by = y + 10;
  const tx = Math.max(bx + 16, Math.min(bx + w - 16, x));
  ctx.fillStyle = 'rgba(255, 251, 235, 0.96)';
  ctx.strokeStyle = 'rgba(68, 44, 24, 0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(bx, by, w, h, 12);
  ctx.moveTo(tx - 7, by);
  ctx.lineTo(tx, by - 10);
  ctx.lineTo(tx + 7, by);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#3f2a17';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, bx + w / 2, by + h / 2 + 1, w - 16);
  ctx.restore();
}

// ── the side-on beat (the hall and the crumble: w7SlideRun.ts) ──

/**
 * The dark of the hole the floor falls into (made once): its sides broken and ragged, not straight, narrowing a little as it goes down,
 * a soft rim into the floor either side, and black below.
 */
let holeSprite: HTMLCanvasElement | null = null;
function hole(): HTMLCanvasElement | null {
  if (holeSprite) return holeSprite;
  const W0 = 128, H0 = 256;
  const c = canvas(W0, H0);
  if (!c) return null;
  const g = c.getContext('2d')!;
  const img = g.createImageData(W0, H0);
  // (each side's broken edge: how far in from the sprite's side it sits, row by row, a few bumps of different sizes)
  const edge = (y: number, side: number) =>
    18 + (y / H0) * 10 + Math.sin(y * 0.11 + side * 2) * 5 + Math.sin(y * 0.37 + side * 5) * 2.5 + (hash(Math.floor(y / 9) * 3.1 + side) - 0.5) * 6;
  for (let y = 0; y < H0; y++) {
    const eL = edge(y, 0), eR = edge(y, 1);
    for (let x = 0; x < W0; x++) {
      const d = Math.min(x - eL, W0 - 1 - x - eR); // inside the hole from its broken side
      const sx = Math.max(0, Math.min(1, (d + 8) / 16));
      const sy = Math.max(0, Math.min(1, y / 12)); // a soft lip at the top
      const a = sx * sx * (3 - 2 * sx) * sy * sy * (3 - 2 * sy);
      const i = (y * W0 + x) * 4;
      img.data[i] = 4;
      img.data[i + 1] = 6;
      img.data[i + 2] = 8;
      img.data[i + 3] = Math.round(a * 250);
    }
  }
  g.putImageData(img, 0, 0);
  holeSprite = c;
  return c;
}

/**
 * The break's lines (made once per crumble, in world px from the crumble's left): four jagged seams running down the floor's face from
 * its top, and one along the foot of the top face. They are the cracks while it shakes, then the edges the chunks break along.
 */
const BREAK_T = 64;
type Seam = Array<[number, number]>;
function seams(w: number): { down: Seam[]; foot: Seam } {
  const down: Seam[] = [];
  for (let i = 1; i < 5; i++) {
    const s: Seam = [];
    const base = (w * i) / 5 + (hash(i * 4.7) - 0.5) * w * 0.08;
    for (let k = 0; k <= 6; k++) s.push([base + (hash(i * 13.1 + k * 2.3) - 0.5) * 16 + (k ? 0 : 0), (BREAK_T * k) / 6]);
    down.push(s);
  }
  const foot: Seam = [];
  for (let k = 0; k <= 16; k++) foot.push([(w * k) / 16, BREAK_T * (0.78 + 0.22 * hash(k * 3.9))]);
  return { down, foot };
}
const footAt = (foot: Seam, x: number) => {
  for (let k = 1; k < foot.length; k++) if (x <= foot[k][0]) {
    const [ax, ay] = foot[k - 1], [bx, by] = foot[k];
    return ay + ((by - ay) * (x - ax)) / Math.max(1e-6, bx - ax);
  }
  return foot[foot.length - 1][1];
};
/** a seam drawn as a crack, the first share of it: a dark line with a pale lip on its lower side */
function crackLine(ctx: CanvasRenderingContext2D, ox: number, oy: number, seam: Seam, share: number, wide: number) {
  if (share <= 0) return;
  const n = (seam.length - 1) * Math.min(1, share);
  const path = (dx: number, dy: number) => {
    ctx.beginPath();
    ctx.moveTo(ox + seam[0][0] + dx, oy + seam[0][1] + dy);
    for (let k = 1; k <= Math.ceil(n); k++) {
      const f = Math.min(1, n - (k - 1));
      const [ax, ay] = seam[k - 1], [bx, by] = seam[k];
      ctx.lineTo(ox + ax + (bx - ax) * f + dx, oy + ay + (by - ay) * f + dy);
    }
    ctx.stroke();
  };
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(200, 188, 165, 0.35)';
  ctx.lineWidth = wide * 0.7;
  path(0.8, 1.2);
  ctx.strokeStyle = 'rgba(14, 10, 8, 0.85)';
  ctx.lineWidth = wide;
  path(0, 0);
}

/**
 * The break: the hall's own floor, copied from the screen the frame before it goes (so the chunks are the very floor he stood on, not
 * another picture), cut along the seams into five chunks of its top face, each its own picture with clean edges.
 */
let breakFor = -1;
let chunks: Array<{ c: HTMLCanvasElement; cx: number; cy: number }> = [];
function snapFloor(ctx: CanvasRenderingContext2D, x0: number, top: number, w: number) {
  const m = ctx.getTransform();
  const k = Math.hypot(m.a, m.b);
  const sx = m.a * x0 + m.c * top + m.e, sy = m.b * x0 + m.d * top + m.f;
  const dw = Math.max(1, Math.round(w * k)), dh = Math.max(1, Math.round((BREAK_T + 4) * k));
  const snap = canvas(dw, dh);
  if (!snap) return;
  snap.getContext('2d')!.drawImage(ctx.canvas, sx, sy, dw, dh, 0, 0, dw, dh);
  const { down, foot } = seams(w);
  const edges: Seam[] = [[[0, 0], [0, BREAK_T]], ...down, [[w, 0], [w, BREAK_T]]];
  chunks = [];
  for (let i = 0; i < 5; i++) {
    const c = canvas(dw, dh)!;
    const g = c.getContext('2d')!;
    g.scale(k, k);
    g.beginPath();
    const L = edges[i], R = edges[i + 1];
    g.moveTo(L[0][0], 0);
    g.lineTo(R[0][0], 0);
    for (const [x, y] of R) if (y < footAt(foot, x)) g.lineTo(x, y);
    const xr = R[R.length - 1][0], xl = L[L.length - 1][0];
    for (let q = 0; q <= 8; q++) {
      const x = xr + ((xl - xr) * q) / 8;
      g.lineTo(x, footAt(foot, x));
    }
    for (let j = L.length - 1; j >= 0; j--) if (L[j][1] < footAt(foot, L[j][0])) g.lineTo(L[j][0], L[j][1]);
    g.closePath();
    g.fillStyle = '#000';
    g.fill();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.drawImage(snap, 0, 0);
    // (its broken underside a little darker, so each chunk reads as a slab, not a cut-out)
    g.globalCompositeOperation = 'source-atop';
    const gr = g.createLinearGradient(0, dh * 0.45, 0, dh);
    gr.addColorStop(0, 'rgba(10, 8, 6, 0)');
    gr.addColorStop(1, 'rgba(10, 8, 6, 0.55)');
    g.fillStyle = gr;
    g.fillRect(0, 0, dw, dh);
    chunks.push({ c, cx: (L[0][0] + R[0][0]) / 2, cy: BREAK_T * 0.45 });
  }
}

/**
 * The crumbling floor (world px, the engine's own transform). While he stands on it, the floor is the engine's own and cracks run
 * across it along the seams it will break on, faster as it shakes. When it goes, its top face breaks along them into five chunks (the
 * hall's own floor) that tip and drop into a hole that goes dark below, with small pieces and dust.
 */
export function drawCrumble(ctx: CanvasRenderingContext2D, at: { x0: number; x1: number; top: number }, phase: string, t: number, crackS: number, fallS: number) {
  const w = at.x1 - at.x0 + 40;
  const x0 = at.x0 - 20;
  ctx.save();
  if (phase === 'crack') {
    const k = Math.min(1, t / crackS);
    // the floor as drawn this frame, kept for the break (copied before the cracks go on, so the chunks crack along their edges only)
    snapFloor(ctx, x0, at.top, w);
    breakFor = at.x0;
    const jx = Math.sin(t * 57) * 1.5 * k;
    const { down, foot } = seams(w);
    // the cracks: the middle seams first, then the outer ones, then along the foot of the face
    down.forEach((sm, i) => crackLine(ctx, x0 + jx, at.top, sm, (k - [0.25, 0, 0.1, 0.35][i]) * 2.2, 2.2));
    crackLine(ctx, x0 + jx, at.top, foot, (k - 0.55) * 2.4, 1.8);
    // grit trickling from the cracks
    ctx.fillStyle = 'rgba(120, 108, 90, 0.8)';
    for (let i = 0; i < 10; i++) {
      const gx = x0 + w * (0.1 + 0.8 * hash(i * 3.3)), gt = (t * 1.6 + hash(i)) % 1;
      ctx.globalAlpha = k * (1 - gt);
      ctx.fillRect(gx, at.top + BREAK_T * 0.8 + gt * 90, 2.5, 2.5);
    }
  } else {
    // the hole, dark below, its sides soft into the floor either side
    const h = hole();
    if (h) {
      ctx.globalAlpha = Math.min(1, t / 0.12);
      ctx.drawImage(h, x0 - 30, at.top - 8, w + 60, 900);
    }
    // the top face in its five chunks, each tipping and dropping a moment after the next, darkening as it falls into the hole
    if (breakFor === at.x0 && chunks.length) {
      const kk = chunks[0].c.width / w;
      chunks.forEach((ch, i) => {
        const delay = [0.06, 0.02, 0, 0.03, 0.08][i];
        const tt = Math.max(0, t - delay);
        const drop = 0.5 * 1500 * tt * tt;
        const spin = (i < 2 ? -1 : i > 2 ? 1 : (hash(3.3) - 0.5)) * (0.5 + hash(i * 6.1) * 0.6) * tt * 2.4;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - drop / 380);
        ctx.translate(x0 + ch.cx + (i - 2) * 22 * tt, at.top + ch.cy + drop);
        ctx.rotate(spin);
        ctx.drawImage(ch.c, -ch.cx, -ch.cy, ch.c.width / kk, ch.c.height / kk);
        ctx.restore();
      });
      // small pieces breaking off, falling faster and spinning (bits of the same floor)
      const src = chunks[2].c;
      for (let i = 0; i < 9; i++) {
        const tt = Math.max(0, t - hash(i * 7.1) * 0.15);
        const drop = 0.5 * 1900 * tt * tt;
        const sz = 8 + hash(i * 2.3) * 12;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - drop / 420);
        ctx.translate(x0 + w * (0.05 + 0.9 * hash(i * 5.7)) + (hash(i) - 0.5) * 120 * tt, at.top + BREAK_T * 0.7 + drop);
        ctx.rotate(tt * (6 + i));
        ctx.drawImage(src, src.width * 0.3 + hash(i * 9.1) * src.width * 0.05, src.height * (0.2 + hash(i * 4.4) * 0.4), sz * kk, sz * kk, -sz / 2, -sz / 2, sz, sz);
        ctx.restore();
      }
    }
  }
  // dust: billowing up from the floor as it cracks, a big puff as it goes
  const n = phase === 'crack' ? 8 : 22;
  for (let i = 0; i < n; i++) {
    const life = phase === 'crack' ? ((t * 0.8 + hash(i * 1.9)) % 1) : Math.min(1, t / (0.5 + hash(i) * 0.4));
    const px = x0 + w * hash(i * 3.7) + (hash(i * 6.1) - 0.5) * 140 * life;
    const py = at.top - 6 - life * (40 + hash(i * 8.3) * 90);
    const r = 10 + life * (26 + hash(i * 2.9) * 30);
    const g = ctx.createRadialGradient(px, py, 0, px, py, r);
    const a = (phase === 'crack' ? 0.18 : 0.32) * (1 - life);
    g.addColorStop(0, `rgba(196, 184, 160, ${a})`);
    g.addColorStop(1, 'rgba(196, 184, 160, 0)');
    ctx.globalAlpha = 1;
    ctx.fillStyle = g;
    ctx.fillRect(px - r, py - r, r * 2, r * 2);
  }
  ctx.restore();
}

/** Pokey falling (Matt's Sheet 6): "oh!" as the floor goes, then curled up tight (world px: his feet at x, y) */
export function drawFall(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  const n = t < 0.32 ? 'fallOh' : 'fallCurl';
  const [k, fx, fy, fw, fh] = PIECE[n];
  const im = img(k);
  if (!im) return;
  // (about as tall as his usual drawing: 130 px for the "oh!", the curl smaller, turning as he drops)
  const tall = n === 'fallOh' ? 140 : 100;
  const sc = tall / fh;
  ctx.save();
  ctx.translate(x, y - tall / 2);
  if (n === 'fallCurl') ctx.rotate((t - 0.32) * 5);
  ctx.drawImage(im, fx, fy, fw, fh, (-fw * sc) / 2, (-fh * sc) / 2, fw * sc, fh * sc);
  ctx.restore();
}

/** the temple hall's light (css px): soft shafts of gold daylight falling through the cracked roof, drifting a little (a small touch) */
export function drawHallLight(ctx: CanvasRenderingContext2D, W: number, H: number, at: (x: number, y: number) => [number, number], t: number) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const [wx, k] of [[700, 0], [1500, 1], [2350, 2], [3050, 3]] as const) {
    const [sx] = at(wx, 0);
    if (sx < -W * 0.5 || sx > W * 1.5) continue;
    const sway = Math.sin(t * 0.4 + k) * 0.03;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(255, 214, 140, 0.22)');
    g.addColorStop(0.75, 'rgba(255, 214, 140, 0.06)');
    g.addColorStop(1, 'rgba(255, 214, 140, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(sx - W * 0.03, 0);
    ctx.lineTo(sx + W * 0.04, 0);
    ctx.lineTo(sx + W * (0.16 + sway), H);
    ctx.lineTo(sx + W * (0.04 + sway), H);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}
