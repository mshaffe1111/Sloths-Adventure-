/**
 * w7SlideArt — drawing 7-4's slide from behind Pokey's back (w7Slide.ts), v2 (Matt, 2026-10-29: the first look was "copy-pasted").
 *
 * The chute is built the classic way (OutRun, Space Harrier), from painted art in true perspective and painted pieces that zoom at the
 * camera, all from the art helper's Hugging Face set (src/assets/w7slide, manifest.json):
 *   - the floor, the walls and the ceiling are the seamless textures laid in perspective one screen row (floor, ceiling) or one screen
 *     column (walls) at a time, so every slab keeps its own edges and shrinks with the distance (no stretched strips);
 *   - beyond the drawn distance, the painted chute running on into the dark (and, near the end, the painted way out into daylight);
 *   - pieces stand in it, scaled with their distance: carved doorways the chute passes through (the lintels), statues on the ledges,
 *     roots hanging from the ceiling, torches; and the obstacles (front views from obstacles.webp, and World 7's statue and column);
 *   - the light: everything fades into the dark with its distance, the torches throw warm light round them, dust hangs in it, and
 *     speed streaks run out from the middle.
 * Code draws only the small touches (the torch flames and their glow, the dust, the streaks, the shadow under him, the petals).
 *
 * The view: a camera a little behind and above him, looking down the chute to its vanishing point. A point (x across, y up, z along)
 * goes to the screen at cx + (x - camX)·f/dz, horizon + (camY - y)·f/dz, with dz its distance ahead of the camera.
 */
import { trackAtlas } from './atlasLoader.ts';
import { KINDS, SLIDE, type Obstacle, type SlideCourse, type SlideSim } from './w7Slide.ts';

const U = (n: string) => new URL(`../assets/w7slide/${n}`, import.meta.url).href;
const URLS = {
  floor: U('chute-floor-3lane.webp'),
  roots: U('chute-wall-roots.webp'),
  glyph: U('chute-wall-glyph.webp'),
  ceiling: U('chute-ceiling.webp'),
  far: U('chute-far-dark.webp'),
  end: U('chute-end-light.webp'),
  obs: U('obstacles.webp'),
  pokey: U('pokey-slide-stills.webp'),
  w7c: new URL('../assets/w6to10/props-made/w7c.webp', import.meta.url).href,
};
type Key = keyof typeof URLS;
/** pieces: which sheet, x, y, w, h (obstacles.webp and pokey-slide-stills.webp frames from the manifest; w7c's from its json) */
const PIECE: Record<string, [Key, number, number, number, number]> = {
  lintelA: ['obs', 0, 0, 413, 245],
  lintelB: ['obs', 1327, 0, 418, 250],
  rubbleA: ['obs', 417, 0, 448, 157],
  rubbleB: ['obs', 0, 254, 403, 136],
  farLip: ['obs', 407, 254, 463, 204],
  head: ['obs', 874, 254, 357, 252],
  pile: ['obs', 1235, 254, 353, 214],
  roots: ['obs', 0, 510, 457, 392],
  statue: ['w7c', 0, 0, 253, 468],
  column: ['w7c', 487, 0, 457, 237],
  slide: ['pokey', 0, 0, 525, 512],
  leanL: ['pokey', 529, 0, 765, 512],
  jump: ['pokey', 1298, 0, 536, 512],
};
/** where a lintel's slab ends, as a share of its height from the top (the rest is its two posts) */
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
/** the floor texture covers the three lanes (its grooves at 1/3 and 2/3) and this much of the chute (m) */
const FLOOR_TILE = 2 * SLIDE.halfW;
/** a wall texture covers the wall's height and this much along the chute (square); the walls swap texture every few panels */
const PANEL = SLIDE.roof;
const CEIL_TILE = 2 * SLIDE.wallX;
/** a doorway (an arch frame) every this many m, a torch every this many, a statue on a ledge, hanging roots */
const ARCH_EVERY = 10;
const TORCH_EVERY = 6;
const STATUE_EVERY = 16;
const ROOTS_EVERY = 7;

function view(sim: SlideSim, W: number, H: number): View {
  const portrait = H > W;
  const f = portrait ? W * 0.98 : Math.min(W * 0.7, H * 1.1);
  return { W, H, cx: W / 2, hy: H * (portrait ? 0.45 : 0.36), f, camX: sim.x * 0.55, camY: CAM_H + sim.y * 0.3, camZ: sim.z - CAM_BACK };
}

/** the screen point of (x, y, z) and its scale (px per m); null behind the camera */
function P(v: View, x: number, y: number, z: number): [number, number, number] | null {
  const dz = z - v.camZ;
  if (dz < 0.3) return null;
  const s = v.f / dz;
  return [v.cx + (x - v.camX) * s, v.hy + (v.camY - y) * s, s];
}

/** how dark a thing at distance dz is (0 near, 1 lost in the dark at the far end) */
function darkAt(dz: number): number {
  return Math.max(0, Math.min(1, (dz - 4) / (SLIDE.far - 4))) ** 0.8;
}
/** how much of a thing shows through the far fade (an obstacle comes up out of the dark) */
const fadeIn = (dz: number) => Math.max(0, Math.min(1, (SLIDE.far - dz) / SLIDE.fade));

/** a piece into a box on the screen (srcH: the share of the source to take from the top, for a doorway sunk into the floor) */
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

/** a cheap repeatable noise in 0..1 for the placing of the decor */
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export function drawSlide(ctx: CanvasRenderingContext2D, sim: SlideSim, W: number, H: number, dpr: number, say: { text: string; t: number } | null) {
  const c = sim.c;
  const v = view(sim, W, H);
  ctx.save();
  // (css px: the engine's own scale holds its world zoom, which the slide does not use)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.fillStyle = '#0b0907';
  ctx.fillRect(0, 0, W, H);
  const farZ = Math.min(sim.z + SLIDE.far, c.length);
  const toEnd = c.length - sim.z;
  const gaps = sim.sorted.filter((o) => o.kind === 'gap' && o.z + o.len > v.camZ && o.z < farZ);
  const inGap = (z: number) => gaps.some((o) => z > o.z && z < o.z + o.len);

  // 1. the far view, in the chute's cross-section at the far distance: the painted chute running on into the dark, and near the end
  // the painted way out (it grows as he comes, since it is the real end of the chute)
  {
    const a = P(v, -SLIDE.wallX, SLIDE.roof, farZ), b = P(v, SLIDE.wallX, 0, farZ);
    if (a && b) {
      const w = b[0] - a[0], h = b[1] - a[1];
      // (the paintings' vanishing point is about (0.5, 0.42): drawn a touch bigger than the cross-section so their own walls carry on ours)
      const k = 1.5;
      const ox = a[0] - (w * (k - 1)) / 2, oy = a[1] - h * (k - 1) * 0.42;
      const far = img('far'), end = img('end');
      const light = Math.max(0, Math.min(1, 1 - (toEnd - SLIDE.far) / 12));
      if (far && light < 1) {
        ctx.globalAlpha = 0.55;
        ctx.drawImage(far, ox, oy, w * k, h * k);
      }
      if (end && light > 0) {
        ctx.globalAlpha = light;
        ctx.drawImage(end, ox, oy, w * k, h * k);
      }
      ctx.globalAlpha = 1;
    }
  }

  // 2. the floor, row by row from the bottom of the screen to the far distance (the lanes' slabs, and the stone ledges either side)
  const floorTex = img('floor');
  const step = H > 700 || W > 700 ? 2 : 1.5;
  if (floorTex) {
    const yFar = v.hy + (v.camY * v.f) / (farZ - v.camZ);
    for (let y = H; y > yFar; y -= step) {
      const dz = (v.camY * v.f) / (y - v.hy);
      const dz2 = (v.camY * v.f) / (y - step - v.hy);
      const z = v.camZ + dz;
      if (inGap(z)) continue;
      const s = v.f / dz;
      const xl = v.cx + (-SLIDE.halfW - v.camX) * s, xr = v.cx + (SLIDE.halfW - v.camX) * s;
      const wl = v.cx + (-SLIDE.wallX - v.camX) * s, wr = v.cx + (SLIDE.wallX - v.camX) * s;
      const tv = ((((z / FLOOR_TILE) % 1) + 1) % 1) * floorTex.height;
      // (a row never reads past the texture's foot: Chrome draws nothing for a source box that runs off the picture)
      const th = Math.min(Math.max(1, ((dz2 - dz) / FLOOR_TILE) * floorTex.height), floorTex.height - tv);
      const lit = 1 - darkAt(dz);
      ctx.globalAlpha = lit;
      ctx.drawImage(floorTex, 0, tv, floorTex.width, th, xl, y - step, xr - xl, step + 0.6);
      // the ledges: the floor's own edge stones, darker
      ctx.globalAlpha = lit * 0.55;
      ctx.drawImage(floorTex, 0, tv, floorTex.width * 0.14, th, wl, y - step, xl - wl, step + 0.6);
      ctx.drawImage(floorTex, floorTex.width * 0.86, tv, floorTex.width * 0.14, th, xr, y - step, wr - xr, step + 0.6);
    }
    ctx.globalAlpha = 1;
  }

  // 3. the ceiling, row by row from the top of the screen down to the far distance
  const ceilTex = img('ceiling');
  if (ceilTex) {
    const up = SLIDE.roof - v.camY;
    const yFar = v.hy - (up * v.f) / (farZ - v.camZ);
    for (let y = 0; y < yFar; y += step) {
      const dz = (up * v.f) / (v.hy - y);
      const dz2 = (up * v.f) / (v.hy - y - step);
      const z = v.camZ + dz;
      const s = v.f / dz;
      const wl = v.cx + (-SLIDE.wallX - v.camX) * s, wr = v.cx + (SLIDE.wallX - v.camX) * s;
      const tv = ((((z / CEIL_TILE) % 1) + 1) % 1) * ceilTex.height;
      const th = Math.min(Math.max(1, ((dz2 - dz) / CEIL_TILE) * ceilTex.height), ceilTex.height - tv);
      ctx.globalAlpha = (1 - darkAt(dz)) * 0.8;
      ctx.drawImage(ceilTex, 0, tv, ceilTex.width, th, wl, y, wr - wl, step + 0.6);
    }
    ctx.globalAlpha = 1;
  }

  // 4. the walls, column by column from the screen's edges in to the far distance (the root wall, now and then the glyph wall)
  const roots = img('roots'), glyph = img('glyph');
  if (roots && glyph) {
    for (const side of [-1, 1]) {
      const X = side * SLIDE.wallX;
      const xFar = v.cx + (X - v.camX) * (v.f / (farZ - v.camZ));
      const near = side < 0 ? 0 : W;
      for (let x = near; side < 0 ? x < xFar : x > xFar; x += -side * step) {
        const s = (x - v.cx) / (X - v.camX);
        if (s <= 0) continue;
        const dz = v.f / s;
        if (dz < 0.3) continue;
        const z = v.camZ + dz;
        const top = v.hy + (v.camY - SLIDE.roof) * s, bot = v.hy + v.camY * s;
        const panel = Math.floor(z / PANEL);
        const tex = hash(Math.floor(panel / 3) * 3.7 + side) < 0.3 ? glyph : roots;
        // (the right wall reads its panels the other way, so the two walls are not the same picture)
        let u = ((((z / PANEL) % 1) + 1) % 1) * tex.width;
        if (side > 0) u = tex.width - 2 - u;
        ctx.globalAlpha = (1 - darkAt(dz)) * 0.92;
        ctx.drawImage(tex, Math.max(0, Math.min(tex.width - 1.5, u)), 0, 1.5, tex.height, x - (side < 0 ? 0 : step), top, step + 0.6, bot - top);
      }
    }
    ctx.globalAlpha = 1;
  }

  // 5. the gaps: the dark under the floor (the floor's rows were left out), and the far lip's broken face
  for (const o of gaps) {
    const a = P(v, -SLIDE.halfW - 0.05, 0.12, o.z + o.len), b = P(v, SLIDE.halfW + 0.05, -1.1, o.z + o.len);
    if (!a || !b) continue;
    ctx.globalAlpha = fadeIn(o.z + o.len - v.camZ);
    piece(ctx, 'farLip', a[0], a[1], b[0] - a[0], b[1] - a[1]);
    ctx.globalAlpha = 1;
  }

  // 6. the torchlight on the walls and the floor (warm, added on), before the pieces stand in front of it
  const torches: Array<{ z: number; side: number }> = [];
  for (let z = Math.ceil(v.camZ / TORCH_EVERY) * TORCH_EVERY; z < farZ; z += TORCH_EVERY) torches.push({ z, side: Math.floor(z / TORCH_EVERY) % 2 ? 1 : -1 });
  ctx.globalCompositeOperation = 'lighter';
  for (const t of torches) {
    const p = P(v, t.side * (SLIDE.wallX - 0.05), 1.9, t.z);
    if (!p) continue;
    const r = p[2] * 2.6;
    const flick = 0.85 + 0.15 * Math.sin(sim.clock * 11 + t.z);
    const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], r);
    g.addColorStop(0, `rgba(255, 170, 80, ${0.42 * flick * (1 - darkAt(t.z - v.camZ) * 0.7)})`);
    g.addColorStop(1, 'rgba(255, 140, 60, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(p[0] - r, p[1] - r, r * 2, r * 2);
  }
  ctx.globalCompositeOperation = 'source-over';

  // 7. the pieces, far to near: doorways, statues on the ledges, hanging roots, torches, obstacles, petals, and Pokey at his place
  type Thing = { z: number; draw: () => void };
  const things: Thing[] = [];
  const z0 = v.camZ + 0.8;
  for (let z = Math.ceil(z0 / ARCH_EVERY) * ARCH_EVERY; z < farZ; z += ARCH_EVERY) {
    things.push({ z, draw: () => {
      const a = P(v, -SLIDE.wallX - 0.12, SLIDE.roof + 0.15, z), b = P(v, SLIDE.wallX + 0.12, 0, z);
      if (!a || !b) return;
      // (fading as it passes over him: up close a doorway is only a blur of its slab)
      ctx.globalAlpha = fadeIn(z - v.camZ) * (1 - darkAt(z - v.camZ) * 0.75) * Math.min(1, Math.max(0, (z - v.camZ - 4.5) / 2.5));
      piece(ctx, Math.floor(z / ARCH_EVERY) % 2 ? 'lintelA' : 'lintelB', a[0], a[1], b[0] - a[0], b[1] - a[1]);
      ctx.globalAlpha = 1;
    } });
  }
  for (let z = Math.ceil(z0 / STATUE_EVERY) * STATUE_EVERY + 5; z < farZ; z += STATUE_EVERY) {
    const side = hash(z) < 0.5 ? -1 : 1;
    const n = hash(z + 9) < 0.6 ? 'statue' : hash(z + 3) < 0.5 ? 'head' : 'pile';
    things.push({ z, draw: () => {
      const cxm = side * (SLIDE.halfW + 0.3), w = n === 'statue' ? 0.55 : 0.7, h = n === 'statue' ? 1.05 : 0.5;
      const a = P(v, cxm - w / 2, h, z), b = P(v, cxm + w / 2, 0, z);
      if (!a || !b) return;
      ctx.globalAlpha = fadeIn(z - v.camZ) * (1 - darkAt(z - v.camZ) * 0.8);
      piece(ctx, n, a[0], a[1], b[0] - a[0], b[1] - a[1]);
      ctx.globalAlpha = 1;
    } });
  }
  for (let z = Math.ceil(z0 / ROOTS_EVERY) * ROOTS_EVERY + 2; z < farZ; z += ROOTS_EVERY) {
    const side = hash(z * 1.3) < 0.5 ? -1 : 1;
    things.push({ z, draw: () => {
      // hanging from the ceiling by the wall, over the ledge (never down in the lanes: they are not an obstacle)
      const cxm = side * (SLIDE.wallX - 0.45);
      const a = P(v, cxm - 0.5, SLIDE.roof, z), b = P(v, cxm + 0.5, SLIDE.roof - 1.1, z);
      if (!a || !b) return;
      ctx.globalAlpha = fadeIn(z - v.camZ) * (1 - darkAt(z - v.camZ) * 0.8);
      piece(ctx, 'roots', a[0], a[1], b[0] - a[0], b[1] - a[1], true);
      ctx.globalAlpha = 1;
    } });
  }
  for (const t of torches) {
    if (t.z < z0) continue;
    things.push({ z: t.z, draw: () => drawTorch(ctx, v, t.z, t.side, sim.clock) });
  }
  sim.sorted.forEach((o, i) => {
    if (o.kind === 'gap' || o.z + o.len < z0 || o.z > farZ) return;
    things.push({ z: o.z, draw: () => drawObstacle(ctx, v, o, sim.wasMet(i)) });
  });
  c.petals.forEach((p, i) => {
    if (sim.petalsGot.has(i) || p.z < sim.z - 0.3 || p.z > farZ) return;
    things.push({ z: p.z, draw: () => drawPetal(ctx, v, p.x, p.y + 0.1 * Math.sin(sim.clock * 4 + p.z), p.z, sim.clock) });
  });
  things.push({ z: sim.z, draw: () => drawPokey(ctx, v, sim) });
  things.sort((a, b) => b.z - a.z);
  for (const t of things) t.draw();

  // 8. dust in the torchlight, and speed streaks running out from the middle
  drawAir(ctx, v, sim);
  // the dark at the screen's edges, a warm middle
  const vg = ctx.createRadialGradient(v.cx, v.hy + H * 0.1, Math.min(W, H) * 0.25, v.cx, v.hy + H * 0.1, Math.max(W, H) * 0.75);
  vg.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vg.addColorStop(1, 'rgba(6, 4, 2, 0.6)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  // his line, in a bubble over him (World 7: Pokey teaches himself; it is his voice, not Dot's banner)
  if (say && say.t > 0) {
    const pz = P(v, sim.x, sim.y + 1.25, sim.z);
    if (pz) drawBubble(ctx, say.text, pz[0], pz[1], W, Math.min(1, say.t * 3));
  }
  // out into the light
  if (sim.outT >= 0) {
    ctx.fillStyle = `rgba(255, 244, 214, ${Math.min(1, sim.outT / SLIDE.outro)})`;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

function drawObstacle(ctx: CanvasRenderingContext2D, v: View, o: Obstacle, met: boolean) {
  const dz = o.z - v.camZ;
  ctx.globalAlpha = fadeIn(dz) * (1 - darkAt(dz) * 0.55);
  const k = KINDS[o.kind];
  const box = (n: string, x0: number, x1: number, y0: number, y1: number, srcH = 1) => {
    const a = P(v, x0, y1, o.z), b = P(v, x1, y0, o.z);
    if (a && b) piece(ctx, n, a[0], a[1], b[0] - a[0], b[1] - a[1], false, srcH);
  };
  if (o.kind === 'head') {
    // one lane each: a statue too tall to jump, or a curtain of roots down to the floor
    for (const l of o.lanes) {
      const x = (l - 1) * SLIDE.lane;
      if (o.look === 2) box('roots', x - 0.58, x + 0.58, -0.05, SLIDE.roof);
      else box('statue', x - 0.5, x + 0.5, 0, 1.85);
    }
  } else if (o.kind === 'rubble') {
    // a wall of rubble right across the chute, wall to wall
    box(o.look % 2 ? 'rubbleB' : 'rubbleA', -SLIDE.wallX + 0.1, SLIDE.wallX - 0.1, -0.05, k.low! + 0.12);
  } else if (o.kind === 'column') {
    for (const l of o.lanes) {
      const x = (l - 1) * SLIDE.lane;
      box('column', x - 0.6, x + 0.6, 0, k.low! + 0.05);
    }
  } else if (o.kind === 'beam') {
    // a fallen doorway sunk in the floor: its slab across the chute at head height, its posts going down into the floor
    const w = 2 * SLIDE.wallX - 0.1;
    const h = (w * 245) / 413;
    const top = k.high! + SLAB * h;
    box(o.look % 2 ? 'lintelB' : 'lintelA', -w / 2, w / 2, 0, top, top / h);
  }
  if (met) {
    ctx.globalAlpha = 0.35 * fadeIn(dz);
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

function drawTorch(ctx: CanvasRenderingContext2D, v: View, z: number, side: number, t: number) {
  // the flame and its bright core (a stand-in sconce: a stroke of iron)
  const p = P(v, side * (SLIDE.wallX - 0.08), 1.9, z);
  if (!p) return;
  const s = p[2];
  ctx.globalAlpha = fadeIn(z - v.camZ);
  ctx.strokeStyle = '#2a2018';
  ctx.lineWidth = Math.max(1, s * 0.06);
  ctx.beginPath();
  ctx.moveTo(p[0], p[1] + s * 0.05);
  ctx.lineTo(p[0] - side * s * 0.12, p[1] + s * 0.3);
  ctx.stroke();
  const fl = 1 + 0.15 * Math.sin(t * 17 + z);
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(p[0], p[1] - s * 0.08, 0, p[0], p[1] - s * 0.08, s * 0.35 * fl);
  g.addColorStop(0, 'rgba(255, 236, 170, 0.95)');
  g.addColorStop(0.4, 'rgba(255, 160, 60, 0.7)');
  g.addColorStop(1, 'rgba(255, 110, 30, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(p[0], p[1] - s * 0.1, s * 0.12 * fl, s * 0.26 * fl, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
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

function drawPokey(ctx: CanvasRenderingContext2D, v: View, sim: SlideSim) {
  const ground = P(v, sim.x, 0, sim.z);
  const body = P(v, sim.x, sim.y, sim.z);
  if (!ground || !body) return;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(ground[0], ground[1], ground[2] * 0.45 * (1 - Math.min(0.5, sim.y * 0.35)), ground[2] * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  if (sim.safeT > 0 && Math.floor(sim.clock * 10) % 2 === 0) return;
  // the painted stills (slide, lean left, jump). There is no right lean yet (a mirror puts his satchel on the wrong side): the slide
  // pose tipped right stands in for it until Matt's sheet comes
  const air = !sim.grounded;
  const n = air ? 'jump' : sim.lean < -0.4 ? 'leanL' : 'slide';
  const [, , , fw, fh] = PIECE[n];
  const tall = 1.0 * body[2];
  const sc = tall / fh;
  const duck = sim.ducking ? 0.6 : 1;
  ctx.save();
  ctx.translate(body[0], body[1] + body[2] * 0.05);
  ctx.rotate(n === 'slide' ? sim.lean * 0.14 : 0);
  ctx.scale(sc * (sim.ducking ? 1.1 : 1), sc * duck);
  // (the lean left's body sits right of its frame's middle: it is drawn so his body stays over his shadow)
  const ox = n === 'leanL' ? -fw * 0.62 : -fw / 2;
  if (!piece(ctx, n, ox, -fh, fw, fh)) {
    ctx.fillStyle = '#8a5a34';
    ctx.beginPath();
    ctx.ellipse(0, -fh / 2, fw / 2.5, fh / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** dust hanging in the air (lit near the torches), and streaks running out from the vanishing point with the speed */
function drawAir(ctx: CanvasRenderingContext2D, v: View, sim: SlideSim) {
  ctx.save();
  for (let i = 0; i < 40; i++) {
    const zz = Math.floor(sim.z / 2) * 2 + (i % 20) * 1.1 - 2 + hash(i) * 1.1;
    const x = (hash(i * 3.1) - 0.5) * 2 * SLIDE.wallX * 0.9 + Math.sin(sim.clock * 0.7 + i) * 0.1;
    const y = 0.3 + hash(i * 7.7) * 2.3 + Math.sin(sim.clock * 0.5 + i * 2) * 0.08;
    const p = P(v, x, y, zz);
    if (!p) continue;
    ctx.fillStyle = `rgba(255, 220, 170, ${0.35 * (1 - darkAt(zz - v.camZ))})`;
    ctx.fillRect(p[0], p[1], Math.max(1, p[2] * 0.02), Math.max(1, p[2] * 0.02));
  }
  ctx.strokeStyle = 'rgba(255, 236, 200, 0.12)';
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
