/**
 * w7SlideArt — drawing 7-4's slide from behind Pokey's back (w7Slide.ts): v2, the wooden flume through the dark under the temple
 * (Matt's concept picture, reference/prop-sheets/gemini-batch-2026-10-29/7-4-slide-concept-gemini.jpg, and the lead's lighting brief).
 *
 * How a frame is made (cheap enough for the 30 fps loop):
 *   1. the scene, unlit: the cave's rock and roof and the flume's bed and rails, laid in true perspective one screen row (bed, roof) or
 *      one screen column (rock, rails) at a time; then the pieces far to near, each scaled with its distance (trestles, gantries, torch
 *      posts, lanterns, fungus, statues, roots, the obstacles, petals);
 *   2. the light: a light map (half size) filled with the cave's ambient (#142430), each light added on as a pre-made soft sprite
 *      (warm torches and lanterns with a slow flicker, green and purple fungus, the cool daylight of the way out), then multiplied over
 *      the scene, so nothing shows unless a light is near it and depth goes into darkness;
 *   3. what gives light, painted on top bright: the flames, the lantern glass, the fungus caps, the eyes in the rock, the way out;
 *   4. Pokey, lit by the light where he is (a warm key that sweeps over him as each torch rushes by, a cool rim from the far end), never
 *      darker than POKEY_MIN, with his shadow under him.
 *
 * STAND-INS until Matt's Gemini sheets come (v2/GEMINI-PROMPTS.md): the flume's wood (a plank texture drawn once in code), the posts,
 * gantries, trestles, lanterns and fungus (drawn in code), the gap's broken planks. Painted already: the cave rock and roof, the
 * statues, the rubble, the doorways and root curtains (src/assets/w7slide, Hugging Face; w7c), Pokey (the slide stills).
 */
import { trackAtlas } from './atlasLoader.ts';
import { KINDS, SLIDE, type Obstacle, type SlideSim } from './w7Slide.ts';
import { AMBIENT, CAVE_ROOF, CAVE_X, LIGHT_RGB, POKEY_MIN, RAIL_H, RAIL_X, buildScene, type LightKind, type Scene } from './w7SlideScene.ts';

const U = (n: string) => new URL(`../assets/w7slide/${n}`, import.meta.url).href;
const URLS = {
  rock: U('chute-wall-roots.webp'),
  roof: U('chute-ceiling.webp'),
  end: U('chute-end-light.webp'),
  obs: U('obstacles.webp'),
  pokey: U('pokey-slide-stills.webp'),
  w7c: new URL('../assets/w6to10/props-made/w7c.webp', import.meta.url).href,
};
type Key = keyof typeof URLS;
const PIECE: Record<string, [Key, number, number, number, number]> = {
  lintelA: ['obs', 0, 0, 413, 245],
  lintelB: ['obs', 1327, 0, 418, 250],
  rubbleA: ['obs', 417, 0, 448, 157],
  rubbleB: ['obs', 0, 254, 403, 136],
  roots: ['obs', 0, 510, 457, 392],
  statue: ['w7c', 0, 0, 253, 468],
  column: ['w7c', 487, 0, 457, 237],
  slide: ['pokey', 0, 0, 525, 512],
  leanL: ['pokey', 529, 0, 765, 512],
  jump: ['pokey', 1298, 0, 536, 512],
};
const SLAB = 0.31;

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

// ── canvases made once ──
const canvas = (w: number, h: number): HTMLCanvasElement | null => {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};
let wood: HTMLCanvasElement | null = null;
let rail: HTMLCanvasElement | null = null;
/** the flume's bed (a stand-in until Matt's Sheet 1): six boards along the chute, darker seams at the lane lines, grain, nails */
function woodTex(): HTMLCanvasElement | null {
  if (wood) return wood;
  const c = canvas(384, 512);
  if (!c) return null;
  const g = c.getContext('2d')!;
  const tones = ['#7a5232', '#6e4a2c', '#80573a', '#734d2f', '#7c5434', '#6a462a'];
  for (let i = 0; i < 6; i++) {
    g.fillStyle = tones[i];
    g.fillRect(i * 64, 0, 64, 512);
    g.strokeStyle = 'rgba(40, 24, 12, 0.35)';
    g.lineWidth = 1.5;
    for (let k = 0; k < 6; k++) {
      g.beginPath();
      const x0 = i * 64 + 6 + k * 10;
      for (let y = 0; y <= 512; y += 16) g.lineTo(x0 + Math.sin(y / 40 + i * 2 + k) * 2.5, y);
      g.stroke();
    }
    // a board's end, staggered, with its nails
    const ey = (i * 157) % 512;
    g.fillStyle = 'rgba(30, 18, 8, 0.7)';
    g.fillRect(i * 64, ey, 64, 3);
    g.fillStyle = '#c9b48a';
    g.fillRect(i * 64 + 14, ey + 7, 3, 3);
    g.fillRect(i * 64 + 46, ey + 7, 3, 3);
  }
  // the seams between the boards, darker where the lanes part (1/3 and 2/3)
  for (let i = 1; i < 6; i++) {
    g.fillStyle = i % 2 === 0 ? 'rgba(20, 10, 4, 0.85)' : 'rgba(30, 18, 8, 0.5)';
    g.fillRect(i * 64 - (i % 2 === 0 ? 2 : 1), 0, i % 2 === 0 ? 4 : 2, 512);
  }
  // worn smooth down the middle of each lane
  for (const cx of [64, 192, 320]) {
    const gr = g.createLinearGradient(cx - 40, 0, cx + 40, 0);
    gr.addColorStop(0, 'rgba(255, 220, 170, 0)');
    gr.addColorStop(0.5, 'rgba(255, 220, 170, 0.12)');
    gr.addColorStop(1, 'rgba(255, 220, 170, 0)');
    g.fillStyle = gr;
    g.fillRect(cx - 40, 0, 80, 512);
  }
  wood = c;
  return c;
}
/** the rails' inner face (a stand-in): two boards, a lighter worn top edge */
function railTex(): HTMLCanvasElement | null {
  if (rail) return rail;
  const c = canvas(512, 96);
  if (!c) return null;
  const g = c.getContext('2d')!;
  g.fillStyle = '#5e3f25';
  g.fillRect(0, 0, 512, 96);
  g.fillStyle = '#4f341e';
  g.fillRect(0, 48, 512, 48);
  g.fillStyle = 'rgba(20, 10, 4, 0.8)';
  g.fillRect(0, 46, 512, 3);
  g.fillStyle = '#a07a52';
  g.fillRect(0, 0, 512, 8);
  for (let x = 30; x < 512; x += 128) {
    g.fillStyle = '#c9b48a';
    g.fillRect(x, 20, 3, 3);
    g.fillRect(x, 70, 3, 3);
  }
  rail = c;
  return c;
}
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

/** each course's set pieces and lights, made once */
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
const BED_TILE = 2 * RAIL_X;
const ROCK_PANEL = 3.2;
const ROOF_TILE = 2 * CAVE_X;
const ROCK_LOW = -3.5;

function view(sim: SlideSim, W: number, H: number): View {
  const portrait = H > W;
  const f = portrait ? W * 0.98 : Math.min(W * 0.7, H * 1.1);
  return { W, H, cx: W / 2, hy: H * (portrait ? 0.45 : 0.36), f, camX: sim.x * 0.55, camY: CAM_H + sim.y * 0.3, camZ: sim.z - CAM_BACK };
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
function piece(ctx: CanvasRenderingContext2D, n: string, x: number, y: number, w: number, h: number, flipY = false, srcH = 1): boolean {
  const [k, fx, fy, fw, fh] = PIECE[n];
  const im = img(k);
  if (!im) return false;
  if (flipY) {
    ctx.save();
    ctx.translate(x, y + h);
    ctx.scale(1, -1);
    ctx.drawImage(im, fx, fy, fw, fh, 0, 0, w, h);
    ctx.restore();
  } else ctx.drawImage(im, fx, fy, fw, fh * srcH, x, y, w, h);
  return true;
}

/** how far the light of the drop has come back (0: black, as he falls in; 1 a second later, the first torch blooming ahead) */
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

  // 1a. the cave's rock either side and its roof (painted, row and column at a time)
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
  // the trestles under the flume (stand-in timber), before the bed, which covers their tops
  for (let z = Math.floor((farZ - 0.1) / 4) * 4; z > v.camZ + 0.8; z -= 4) if (!inGap(z)) drawTrestle(ctx, v, z);
  // 1b. the flume's bed, row by row, and its rails, column by column (the gaps left out: the dark shows through)
  const bed = woodTex(), rl = railTex();
  if (bed) {
    const yFar = v.hy + (v.camY * v.f) / (farZ - v.camZ);
    for (let y = H; y > yFar; y -= step) {
      const dz = (v.camY * v.f) / (y - v.hy), dz2 = (v.camY * v.f) / (y - step - v.hy);
      const z = v.camZ + dz;
      if (inGap(z) || z > c.length + 2) continue;
      const s = v.f / dz;
      const tv = ((((z / BED_TILE) % 1) + 1) % 1) * bed.height;
      const th = Math.min(Math.max(1, ((dz2 - dz) / BED_TILE) * bed.height), bed.height - tv);
      ctx.globalAlpha = fadeIn(dz);
      ctx.drawImage(bed, 0, tv, bed.width, th, v.cx + (-RAIL_X - v.camX) * s, y - step, 2 * RAIL_X * s, step + 0.6);
    }
  }
  if (rl) {
    for (const side of [-1, 1]) {
      const X = side * RAIL_X;
      const xFar = v.cx + (X - v.camX) * (v.f / (farZ - v.camZ));
      for (let x = side < 0 ? 0 : W; side < 0 ? x < xFar : x > xFar; x += -side * step) {
        const s = (x - v.cx) / (X - v.camX);
        if (s <= 0) continue;
        const dz = v.f / s;
        if (dz < 0.3) continue;
        const z = v.camZ + dz;
        if (inGap(z) || z > c.length + 2) continue;
        const u = ((((z / 2.6) % 1) + 1) % 1) * (rl.width - 2);
        const top = v.hy + (v.camY - RAIL_H) * s, bot = v.hy + v.camY * s;
        ctx.globalAlpha = fadeIn(dz);
        ctx.drawImage(rl, u, 0, 1.5, rl.height, x - (side < 0 ? 0 : step), top, step + 0.6, bot - top);
      }
    }
  }
  ctx.globalAlpha = 1;
  // 1c. the pieces, far to near
  type Thing = { z: number; draw: () => void };
  const things: Thing[] = [];
  const z0 = v.camZ + 0.8;
  for (const p of sc.props) {
    if (p.z < z0 || p.z > farZ) continue;
    things.push({ z: p.z, draw: () => drawProp(ctx, v, p.kind, p.x, p.y, p.z) });
  }
  // the gaps' far lips (broken planks: a stand-in)
  for (const o of gaps) things.push({ z: o.z + o.len, draw: () => drawLip(ctx, v, o.z + o.len) });
  sim.sorted.forEach((o, i) => {
    if (o.kind === 'gap' || o.z + o.len < z0 || o.z > farZ) return;
    things.push({ z: o.z, draw: () => drawObstacle(ctx, v, o, sim.wasMet(i)) });
  });
  c.petals.forEach((p, i) => {
    if (sim.petalsGot.has(i) || p.z < sim.z - 0.3 || p.z > farZ) return;
    things.push({ z: p.z, draw: () => drawPetal(ctx, v, p.x, p.y + 0.1 * Math.sin(sim.clock * 4 + p.z), p.z, sim.clock) });
  });
  // his contact shadow, in the scene so the light falls on it too
  things.push({ z: sim.z + 0.01, draw: () => {
    const g = P(v, sim.x, 0, sim.z);
    if (!g) return;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(g[0], g[1], g[2] * 0.45 * (1 - Math.min(0.5, sim.y * 0.35)), g[2] * 0.12, 0, 0, Math.PI * 2);
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

  // 3. what gives light, bright on top: the way out, flames, lantern glass, fungus caps, eyes
  {
    const toEnd = c.length - sim.z;
    const end = img('end');
    if (end && toEnd < SLIDE.far + 10) {
      const a = P(v, -RAIL_X * 1.8, 3.2, c.length + 3), b = P(v, RAIL_X * 1.8, -0.4, c.length + 3);
      if (a && b) {
        ctx.globalAlpha = Math.max(0, Math.min(1, 1 - (toEnd - SLIDE.far) / 10)) * ex;
        ctx.drawImage(end, 256, 200, 512, 512, a[0], a[1], b[0] - a[0], b[1] - a[1]);
        ctx.globalAlpha = 1;
      }
    }
  }
  ctx.globalCompositeOperation = 'lighter';
  for (const p of sc.props) {
    if (p.z < z0 || p.z > farZ) continue;
    drawGlow(ctx, v, p.kind, p.x, p.y, p.z, sim.clock, ex);
  }
  ctx.globalCompositeOperation = 'source-over';
  // the speed: streaks out from the middle, faint
  drawStreaks(ctx, v, sim);

  // 4. Pokey, lit where he is
  drawPokey(ctx, v, sim, sc, ex);

  // the screen's edges a little darker
  const vg = ctx.createRadialGradient(v.cx, v.hy + H * 0.12, Math.min(W, H) * 0.3, v.cx, v.hy + H * 0.12, Math.max(W, H) * 0.8);
  vg.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vg.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
  if (say && say.t > 0) {
    const pz = P(v, sim.x, sim.y + 1.25, sim.z);
    if (pz) drawBubble(ctx, say.text, pz[0], pz[1], W, Math.min(1, say.t * 3));
  }
  if (sim.outT >= 0) {
    ctx.fillStyle = `rgba(240, 248, 255, ${Math.min(1, sim.outT / SLIDE.outro)})`;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

function drawTrestle(ctx: CanvasRenderingContext2D, v: View, z: number) {
  const a = P(v, -RAIL_X + 0.2, -0.05, z), b = P(v, -RAIL_X + 0.35, -3.4, z);
  const c2 = P(v, RAIL_X - 0.2, -0.05, z), d = P(v, RAIL_X - 0.35, -3.4, z);
  if (!a || !b || !c2 || !d) return;
  ctx.globalAlpha = fadeIn(z - v.camZ);
  ctx.strokeStyle = '#4a3220';
  ctx.lineWidth = Math.max(1, a[2] * 0.14);
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.moveTo(c2[0], c2[1]);
  ctx.lineTo(d[0], d[1]);
  ctx.lineWidth = Math.max(1, a[2] * 0.08);
  ctx.moveTo(a[0], a[1] + (b[1] - a[1]) * 0.15);
  ctx.lineTo(d[0], d[1] - (d[1] - c2[1]) * 0.3);
  ctx.moveTo(c2[0], c2[1] + (d[1] - c2[1]) * 0.15);
  ctx.lineTo(b[0], b[1] - (b[1] - a[1]) * 0.3);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawProp(ctx: CanvasRenderingContext2D, v: View, kind: string, x: number, y: number, z: number) {
  const p = P(v, x, y, z);
  if (!p) return;
  const s = p[2];
  ctx.globalAlpha = fadeIn(z - v.camZ);
  if (kind === 'post') {
    // a torch on a timber post (stand-in), standing from the dark below up beside the flume
    const t = P(v, x, 1.55, z), bt = P(v, x, -1.2, z);
    if (t && bt) {
      ctx.fillStyle = '#5a3c24';
      ctx.fillRect(t[0] - s * 0.07, t[1], s * 0.14, bt[1] - t[1]);
      ctx.fillStyle = '#3a2616';
      ctx.fillRect(t[0] - s * 0.11, t[1] - s * 0.05, s * 0.22, s * 0.08);
    }
  } else if (kind === 'gantry') {
    // a timber frame over the flume (stand-in): two posts and a beam high overhead
    const l = P(v, -RAIL_X - 0.5, 3.3, z), lb = P(v, -RAIL_X - 0.5, -1.5, z), r = P(v, RAIL_X + 0.5, 3.3, z), rb = P(v, RAIL_X + 0.5, -1.5, z);
    if (l && lb && r && rb) {
      ctx.fillStyle = '#4e3420';
      ctx.fillRect(l[0] - s * 0.09, l[1], s * 0.18, lb[1] - l[1]);
      ctx.fillRect(r[0] - s * 0.09, r[1], s * 0.18, rb[1] - r[1]);
      ctx.fillRect(l[0] - s * 0.15, l[1] - s * 0.05, r[0] - l[0] + s * 0.3, s * 0.2);
    }
  } else if (kind === 'lantern') {
    // a lantern hanging on its rope (stand-in); its glass glows on top (drawGlow)
    const top = P(v, x, y + 0.9, z);
    if (top) {
      ctx.strokeStyle = '#2a1e14';
      ctx.lineWidth = Math.max(1, s * 0.02);
      ctx.beginPath();
      ctx.moveTo(top[0], top[1]);
      ctx.lineTo(p[0], p[1] - s * 0.12);
      ctx.stroke();
    }
    ctx.fillStyle = '#2d241c';
    ctx.fillRect(p[0] - s * 0.1, p[1] - s * 0.14, s * 0.2, s * 0.28);
  } else if (kind === 'fungusG' || kind === 'fungusP') {
    // a few mushrooms (stand-in stems; the caps glow on top)
    ctx.fillStyle = '#cfc6b4';
    for (let k = 0; k < 3; k++) {
      const ox = (k - 1) * s * 0.14, h = s * (0.18 + 0.1 * hash(z * 3 + k));
      ctx.fillRect(p[0] + ox - s * 0.015, p[1] - h, s * 0.03, h);
    }
  } else if (kind === 'statue') {
    const a = P(v, x - 0.35, y + 1.3, z), b = P(v, x + 0.35, y, z);
    if (a && b) piece(ctx, 'statue', a[0], a[1], b[0] - a[0], b[1] - a[1]);
  } else if (kind === 'roots') {
    const a = P(v, x - 0.7, y, z), b = P(v, x + 0.7, y - 1.6, z);
    if (a && b) piece(ctx, 'roots', a[0], a[1], b[0] - a[0], b[1] - a[1], true);
  }
  ctx.globalAlpha = 1;
}

/** the bright parts, added on after the light map: flames, lantern glass, fungus caps, eyes */
function drawGlow(ctx: CanvasRenderingContext2D, v: View, kind: string, x: number, y: number, z: number, t: number, ex: number) {
  const fade = fadeIn(z - v.camZ) * ex;
  if (fade <= 0) return;
  const dot = (px: number, py: number, rx: number, ry: number, inner: string, outer: string) => {
    const g = ctx.createRadialGradient(px, py, 0, px, py, Math.max(rx, ry));
    g.addColorStop(0, inner);
    g.addColorStop(1, outer);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(px, py, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  };
  ctx.globalAlpha = fade;
  if (kind === 'post') {
    const p = P(v, x, 1.72, z);
    if (!p) return;
    const fl = 1 + 0.12 * Math.sin(t * 17 + z);
    dot(p[0], p[1], p[2] * 0.12 * fl, p[2] * 0.24 * fl, 'rgba(255, 240, 190, 1)', 'rgba(255, 120, 30, 0)');
  } else if (kind === 'lantern') {
    const p = P(v, x, y, z);
    if (!p) return;
    dot(p[0], p[1], p[2] * 0.1, p[2] * 0.13, 'rgba(255, 230, 160, 0.95)', 'rgba(255, 150, 60, 0)');
  } else if (kind === 'fungusG' || kind === 'fungusP') {
    const p = P(v, x, y, z);
    if (!p) return;
    const col = kind === 'fungusG' ? ['rgba(190, 255, 190, 0.95)', 'rgba(60, 255, 120, 0)'] : ['rgba(235, 200, 255, 0.95)', 'rgba(170, 80, 255, 0)'];
    for (let k = 0; k < 3; k++) {
      const ox = (k - 1) * p[2] * 0.14, h = p[2] * (0.18 + 0.1 * hash(z * 3 + k));
      dot(p[0] + ox, p[1] - h, p[2] * 0.09, p[2] * 0.05, col[0], col[1]);
    }
  } else if (kind === 'eyes') {
    const p = P(v, x, y, z);
    if (!p) return;
    // pinpoints that light nothing; now and then they blink
    if (Math.sin(t * 0.9 + z * 3) > 0.92) return;
    const e = Math.max(1, p[2] * 0.035);
    for (const dx of [-1, 1]) dot(p[0] + dx * p[2] * 0.06, p[1], e * 1.6, e, 'rgba(255, 240, 120, 1)', 'rgba(255, 200, 40, 0)');
  }
  ctx.globalAlpha = 1;
}

function drawLip(ctx: CanvasRenderingContext2D, v: View, z: number) {
  // the broken far end of the flume past a gap (stand-in): splintered plank ends and the bed's edge
  const a = P(v, -RAIL_X, RAIL_H, z), b = P(v, RAIL_X, -0.5, z);
  if (!a || !b) return;
  ctx.globalAlpha = fadeIn(z - v.camZ);
  const w = b[0] - a[0], top = P(v, 0, 0, z)![1], h = b[1] - top;
  ctx.fillStyle = '#5c3d24';
  ctx.beginPath();
  ctx.moveTo(a[0], top);
  for (let i = 0; i <= 12; i++) ctx.lineTo(a[0] + (w * i) / 12, top + h * (0.55 + 0.45 * hash(z + i)));
  ctx.lineTo(b[0], top);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#8a6440';
  ctx.fillRect(a[0], top - h * 0.06, w, h * 0.12);
  ctx.globalAlpha = 1;
}

function drawObstacle(ctx: CanvasRenderingContext2D, v: View, o: Obstacle, met: boolean) {
  const dz = o.z - v.camZ;
  ctx.globalAlpha = fadeIn(dz);
  const k = KINDS[o.kind];
  const box = (n: string, x0: number, x1: number, y0: number, y1: number, srcH = 1) => {
    const a = P(v, x0, y1, o.z), b = P(v, x1, y0, o.z);
    if (a && b) piece(ctx, n, a[0], a[1], b[0] - a[0], b[1] - a[1], false, srcH);
  };
  if (o.kind === 'head') {
    for (const l of o.lanes) {
      const x = (l - 1) * SLIDE.lane;
      if (o.look === 2) box('roots', x - 0.58, x + 0.58, -0.05, CAVE_ROOF - 0.6);
      else box('statue', x - 0.5, x + 0.5, 0, 1.85);
    }
  } else if (o.kind === 'rubble') {
    box(o.look % 2 ? 'rubbleB' : 'rubbleA', -RAIL_X - 0.15, RAIL_X + 0.15, -0.05, k.low! + 0.12);
  } else if (o.kind === 'column') {
    for (const l of o.lanes) {
      const x = (l - 1) * SLIDE.lane;
      box('column', x - 0.6, x + 0.6, 0, k.low! + 0.05);
    }
  } else if (o.kind === 'beam') {
    const w = 2 * RAIL_X + 0.6;
    const h = (w * 245) / 413;
    const top = k.high! + SLAB * h;
    box(o.look % 2 ? 'lintelB' : 'lintelA', -w / 2, w / 2, 0, top, top / h);
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

/** the light on Pokey where he is: the ambient plus each light near him (r, g, b, 0..1+), never below POKEY_MIN */
export function pokeyLight(sc: Scene, x: number, y: number, z: number): [number, number, number] {
  const c = [...AMBIENT] as [number, number, number];
  for (const l of sc.lights) {
    if (Math.abs(l.z - z) > l.r) continue;
    const d = Math.hypot(l.x - x, l.y - y, l.z - z);
    if (d >= l.r) continue;
    const f = l.i * (1 - d / l.r) ** 2;
    for (let k = 0; k < 3; k++) c[k] += f * LIGHT_RGB[l.kind][k];
  }
  // (a neutral floor of POKEY_MIN, so the cave's teal never turns him blue, and the lights' own colour on top: the warm key as a torch
  // rushes by, the green of the fungus)
  return c.map((k, i) => Math.min(1.05, POKEY_MIN + (1 - POKEY_MIN) * Math.min(1, (k - AMBIENT[i]) * 1.6))) as [number, number, number];
}

function drawPokey(ctx: CanvasRenderingContext2D, v: View, sim: SlideSim, sc: Scene, ex: number) {
  const body = P(v, sim.x, sim.y, sim.z);
  if (!body) return;
  if (sim.safeT > 0 && Math.floor(sim.clock * 10) % 2 === 0) return;
  const air = !sim.grounded;
  const n = air ? 'jump' : sim.lean < -0.4 ? 'leanL' : 'slide';
  const [k, fx, fy, fw, fh] = PIECE[n];
  const im = img(k);
  if (!im) return;
  const tall = 1.0 * body[2];
  const scl = tall / fh;
  const duck = sim.ducking ? 0.6 : 1;
  const dw = Math.ceil(fw * scl * (sim.ducking ? 1.1 : 1)), dh = Math.ceil(fh * scl * duck);
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
  // his light: multiplied over him (warm as he passes a torch, green in the fungus), then a cool rim from the far end along his top
  const [r, gg, b] = pokeyLight(sc, sim.x, 0.6 + sim.y, sim.z).map((c) => Math.round(Math.min(1, c * (0.5 + 0.5 * ex)) * 255));
  g.globalCompositeOperation = 'multiply';
  g.fillStyle = `rgb(${r}, ${gg}, ${b})`;
  g.fillRect(0, 0, dw, dh);
  g.globalCompositeOperation = 'source-atop';
  const rim = g.createLinearGradient(0, 0, 0, dh * 0.35);
  rim.addColorStop(0, 'rgba(170, 210, 255, 0.28)');
  rim.addColorStop(1, 'rgba(170, 210, 255, 0)');
  g.fillStyle = rim;
  g.fillRect(0, 0, dw, dh);
  // (the multiply filled his empty corners too: cut back to his own shape)
  g.globalCompositeOperation = 'destination-in';
  g.drawImage(im, fx, fy, fw, fh, 0, 0, dw, dh);
  g.globalCompositeOperation = 'source-over';
  ctx.save();
  ctx.translate(body[0], body[1] + body[2] * 0.05);
  ctx.rotate(n === 'slide' ? sim.lean * 0.14 : 0);
  // (the lean left's body sits right of its frame's middle; the right lean is the slide pose tipped right: there is none painted yet)
  const ox = n === 'leanL' ? -dw * 0.62 : -dw / 2;
  ctx.drawImage(pk, 0, 0, dw, dh, ox, -dh, dw, dh);
  ctx.restore();
}

function drawStreaks(ctx: CanvasRenderingContext2D, v: View, sim: SlideSim) {
  ctx.save();
  ctx.strokeStyle = 'rgba(200, 220, 255, 0.08)';
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
  ctx.save();
  ctx.globalAlpha = a;
  ctx.font = 'bold 16px Fredoka, sans-serif';
  const w = Math.min(W - 24, ctx.measureText(text).width + 24);
  const h = 32;
  const bx = Math.max(12, Math.min(W - 12 - w, x - w / 2));
  const by = Math.max(12, y - h - 14);
  ctx.fillStyle = 'rgba(255, 251, 235, 0.96)';
  ctx.strokeStyle = 'rgba(68, 44, 24, 0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(bx, by, w, h, 12);
  ctx.moveTo(x - 7, by + h);
  ctx.lineTo(x, by + h + 10);
  ctx.lineTo(x + 7, by + h);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#3f2a17';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, bx + w / 2, by + h / 2 + 1, w - 16);
  ctx.restore();
}
