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
 *      the obstacles (Sheet 1's barriers, beams, crates and broken ends; World 7's statue), petals;
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
  crumble: U('crumble.webp'),
};
type Key = keyof typeof URLS;
/** every piece by name: its sheet and its box */
const PIECE: Record<string, [Key, number, number, number, number]> = {
  statue: ['w7c', 0, 0, 253, 468],
  // (the way out: the middle of the art helper's painting, where the daylight is)
  end: ['end', 200, 160, 624, 600],
};
for (let i = 0; i < 4; i++) PIECE[`crumble${i}`] = ['crumble', i * 386, 0, 382, 296];
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
  if (a && b) piece(ctx, n, a[0], a[1], b[0] - a[0], b[1] - a[1], flip);
}

const exposure = (sim: SlideSim) => Math.max(0, Math.min(1, (sim.clock - 0.35) / 1.0));

export function drawSlide(ctx: CanvasRenderingContext2D, sim: SlideSim, W: number, H: number, dpr: number, say: { text: string; t: number } | null) {
  const c = sim.c;
  const sc = sceneOf(sim);
  const v = view(sim, W, H);
  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = '#05080b';
  ctx.fillRect(0, 0, W, H);
  const farZ = Math.min(sim.z + SLIDE.far, c.length + 4);
  const gaps = sim.sorted.filter((o) => o.kind === 'gap' && o.z + o.len > v.camZ && o.z < farZ);
  const inGap = (z: number) => gaps.some((o) => z > o.z && z < o.z + o.len);
  const step = H > 700 || W > 700 ? 2 : 1.5;

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
  // the cave's rock and roof, far back in the dark
  const rock = img('rock'), roof = img('roof');
  if (rock) {
    for (const side of [-1, 1]) {
      const X = side * CAVE_X;
      const xFar = v.cx + (X - v.camX) * (v.f / (farZ - v.camZ));
      for (let x = side < 0 ? 0 : W; side < 0 ? x < xFar : x > xFar; x += -side * step) {
        const s = (x - v.cx) / (X - v.camX);
        if (s <= 0) continue;
        const dz = v.f / s;
        if (dz < 0.3) continue;
        const z = v.camZ + dz;
        let u = ((((z / ROCK_PANEL) % 1) + 1) % 1) * rock.width;
        if (side > 0) u = rock.width - 2 - u;
        const top = v.hy + (v.camY - CAVE_ROOF) * s, bot = v.hy + (v.camY - ROCK_LOW) * s;
        ctx.globalAlpha = fadeIn(dz);
        ctx.drawImage(rock, Math.max(0, Math.min(rock.width - 1.5, u)), 0, 1.5, rock.height, x - (side < 0 ? 0 : step), top, step + 0.6, bot - top);
      }
    }
  }
  if (roof) {
    const up = CAVE_ROOF - v.camY;
    const yFar = v.hy - (up * v.f) / (farZ - v.camZ);
    for (let y = 0; y < yFar; y += step) {
      const dz = (up * v.f) / (v.hy - y), dz2 = (up * v.f) / (v.hy - y - step);
      const z = v.camZ + dz, s = v.f / dz;
      const tv = ((((z / ROOF_TILE) % 1) + 1) % 1) * roof.height;
      const th = Math.min(Math.max(1, ((dz2 - dz) / ROOF_TILE) * roof.height), roof.height - tv);
      ctx.globalAlpha = fadeIn(dz);
      ctx.drawImage(roof, 0, tv, roof.width, th, v.cx + (-CAVE_X - v.camX) * s, y, 2 * CAVE_X * s, step + 0.6);
    }
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
  // 1c. the three troughs, row by row from the bottom of the screen (Matt's trough piece, a lane each; plain and mossy mixed)
  {
    const cave = img('flume-cave');
    if (cave) {
      const bedB = PIECE.bed, mossB = PIECE.bedMoss;
      const yFar = v.hy + (v.camY * v.f) / (farZ - v.camZ);
      for (let y = H; y > yFar; y -= step) {
        const dz = (v.camY * v.f) / (y - v.hy), dz2 = (v.camY * v.f) / (y - step - v.hy);
        const z = v.camZ + dz;
        if (inGap(z) || z > c.length + 2) continue;
        const s = v.f / dz;
        const tile = Math.floor(z / TROUGH_LEN);
        // (the trough piece is drawn looking down it: its top row is the far end, so a tile is read from its foot up)
        const t = 1 - (((z / TROUGH_LEN) % 1) + 1) % 1;
        const tf = Math.max(0.002, (dz2 - dz) / TROUGH_LEN);
        ctx.globalAlpha = fadeIn(dz);
        for (let l = 0; l < 3; l++) {
          const b = hash(tile * 3.1 + l) < 0.3 ? mossB : bedB;
          const sy = b[2] + Math.min(b[4] - 1, t * b[4]);
          const sh = Math.max(1, Math.min(b[4] * tf, b[2] + b[4] - sy));
          const x0 = v.cx + ((l - 1) * SLIDE.lane - SLIDE.lane / 2 - v.camX) * s;
          ctx.drawImage(cave, b[1], sy, b[3], sh, x0, y - step, SLIDE.lane * s + 0.6, step + 0.6);
        }
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
  c.petals.forEach((p, i) => {
    if (sim.petalsGot.has(i) || p.z < sim.z - 0.3 || p.z > farZ) return;
    things.push({ z: p.z, draw: () => drawPetal(ctx, v, p.x, p.y + 0.1 * Math.sin(sim.clock * 4 + p.z), p.z, sim.clock) });
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
  const lw = Math.ceil(W / 2), lh = Math.ceil(H / 2);
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
      const r = (l.r * p[2]) / 2;
      g.globalAlpha = Math.min(1, l.i * flick * ex);
      g.drawImage(spr, p[0] / 2 - r, p[1] / 2 - r, r * 2, r * 2);
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
  ctx.globalAlpha = fadeIn(dz) * (p.kind === 'rib' || p.kind === 'mouth' ? 1 : nearFade(dz));
  if (p.kind === 'rib') {
    // a rib of the cave (Sheet 4): its two walls framing the flume and its ceiling layer overhead (fading as it passes over him)
    ctx.globalAlpha *= Math.min(1, Math.max(0, (dz - 3.5) / 2.5));
    const wH = CAVE_ROOF - ROCK_LOW * 0.4;
    const wl = wH * aspect('wallL'), wr = wH * aspect('wallR');
    const l0 = P(v, -CAVE_X - wl * 0.35, CAVE_ROOF, p.z), l1 = P(v, -CAVE_X + wl * 0.65, CAVE_ROOF - wH, p.z);
    if (l0 && l1) piece(ctx, 'wallL', l0[0], l0[1], l1[0] - l0[0], l1[1] - l0[1]);
    const r0 = P(v, CAVE_X - wr * 0.65, CAVE_ROOF, p.z), r1 = P(v, CAVE_X + wr * 0.35, CAVE_ROOF - wH, p.z);
    if (r0 && r1) piece(ctx, 'wallR', r0[0], r0[1], r1[0] - r0[0], r1[1] - r0[1]);
    const cw = 2 * CAVE_X + 1.2, ch = cw / aspect('ceiling');
    const c0 = P(v, -cw / 2, CAVE_ROOF + 0.3, p.z), c1 = P(v, cw / 2, CAVE_ROOF + 0.3 - ch * 0.55, p.z);
    if (c0 && c1) piece(ctx, 'ceiling', c0[0], c0[1], c1[0] - c0[0], c1[1] - c0[1], false, 0, 0.55);
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
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = fadeIn(p.z - v.camZ) * ex;
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

function drawPetal(ctx: CanvasRenderingContext2D, v: View, x: number, y: number, z: number, t: number) {
  const q = P(v, x, y, z);
  if (!q) return;
  const r = Math.max(1.5, q[2] * 0.15);
  ctx.globalAlpha = fadeIn(z - v.camZ);
  ctx.fillStyle = '#f472b6';
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 + t;
    ctx.beginPath();
    ctx.arc(q[0] + Math.cos(a) * r * 0.6, q[1] + Math.sin(a) * r * 0.6, r * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#fde68a';
  ctx.beginPath();
  ctx.arc(q[0], q[1], r * 0.35, 0, Math.PI * 2);
  ctx.fill();
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

/** which of Matt's poses (Sheet 5) Pokey is in */
function pose(sim: SlideSim): { n: string; tilt: number } {
  if (sim.safeT > SLIDE.safe - 0.5 && sim.hits + sim.stumbles > 0) return { n: 'hurt', tilt: 0 };
  if (!sim.grounded) return { n: 'jump', tilt: 0 };
  if (sim.ducking) return { n: 'duck', tilt: 0 };
  if (sim.lean > 0.4) return { n: 'leanR', tilt: 0.06 };
  // (no lean left is painted right yet: the lead has asked Matt for a re-do; the grip pose tipped left stands in)
  if (sim.lean < -0.4) return { n: 'grip', tilt: -0.16 };
  return { n: Math.floor(sim.clock * 4) % 2 ? 'grip2' : 'grip', tilt: 0 };
}

function drawPokey(ctx: CanvasRenderingContext2D, v: View, sim: SlideSim, sc: Scene, ex: number) {
  const body = P(v, sim.x, sim.y, sim.z);
  if (!body) return;
  if (sim.safeT > 0 && sim.safeT < SLIDE.safe - 0.5 && Math.floor(sim.clock * 10) % 2 === 0) return;
  const { n, tilt } = pose(sim);
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
  ctx.rotate(tilt + (n === 'grip' || n === 'grip2' ? sim.lean * 0.04 : 0));
  ctx.drawImage(pk, 0, 0, dw, dh, -dw / 2, -dh, dw, dh);
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

/** the crumbling floor (world px, the engine's own transform): whole, cracked, breaking, then falling away into the dark */
export function drawCrumble(ctx: CanvasRenderingContext2D, at: { x0: number; x1: number; top: number }, phase: string, t: number, crackS: number, fallS: number) {
  const w = at.x1 - at.x0;
  const h = w / aspect('crumble0');
  let frame = 0, drop = 0;
  if (phase === 'crack') frame = t < crackS * 0.45 ? 0 : 1;
  else {
    frame = t < fallS * 0.3 ? 2 : 3;
    drop = 900 * t * t;
  }
  ctx.save();
  ctx.globalAlpha = phase === 'fall' ? Math.max(0, 1 - t / fallS) : 1;
  // (a little shake as it goes)
  const jx = phase === 'crack' ? Math.sin(t * 60) * 2 * (t / crackS) : 0;
  piece(ctx, `crumble${frame}`, at.x0 + jx, at.top - h * 0.18 + drop, w, h);
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
