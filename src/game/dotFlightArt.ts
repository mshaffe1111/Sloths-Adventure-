/**
 * dotFlightArt — how Dot's netting flight looks (the rules are in dotFlight.ts, the stage in dotFlightStage.ts).
 *
 * Everything is at a hummingbird's size: the painted sunrise behind (five paintings from the Hugging Face run of 2026-10-25, hazed so
 * the play reads in front of them), giant flowers growing up out of the mist, the General's iron netting (drawn: mesh strung between
 * posts and sagging, torn holes, thorns knotted on, with the batch 1 netting pieces where they fit: chain swags, chain hooks, ring
 * anchors, and the framed panels for the pocket floors), the
 * glowing nectar flowers, dew, spider silk, dandelion puffs, the iron thorn strands, gusts with petals, and the light through the
 * folded-letter gap. Her own painted frames (dot-atlas.webp) fly her, scaled up. Every piece comes from dot-props.webp
 * (tools/art/dotstage), and draws nothing until it has loaded.
 */
import { trackAtlas } from './atlasLoader.ts';
import { DOT_PROP_FRAMES } from './dotPropsData.ts';
import { drawDotFrame, flyFrame, warmDot } from './dotSprite.ts';
import { BLOOM, DOT, MIST, TOP, gustState, openingY, type BackName, type DotStage, type Nectar, type NetWall, type Thorn } from './dotFlightStage.ts';
import type { DotFlight } from './dotFlight.ts';

export type DotPiece = keyof typeof DOT_PROP_FRAMES;

let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(im, new URL('../assets/props/dot-props.webp', import.meta.url).href, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; });
}
const BACK_URL: Record<BackName, string> = {
  far1: new URL('../assets/backdrops/dot-far-1.webp', import.meta.url).href,
  far2: new URL('../assets/backdrops/dot-far-2.webp', import.meta.url).href,
  near1: new URL('../assets/backdrops/dot-near-1.webp', import.meta.url).href,
  near3: new URL('../assets/backdrops/dot-near-3.webp', import.meta.url).href,
};
/** the paintings, loaded as World 4's own sheets are (atlasLoader.ts): let go when play moves to another world, fetched again if needed */
const backs = new Map<BackName, { im: HTMLImageElement; ok: boolean }>();
function back(n: BackName): HTMLImageElement | null {
  let b = backs.get(n);
  if (!b) {
    if (typeof Image === 'undefined') return null;
    const im = new Image();
    im.decoding = 'async';
    const entry = { im, ok: false };
    b = entry;
    backs.set(n, entry);
    trackAtlas(im, BACK_URL[n], () => { entry.ok = true; }, () => { backs.delete(n); }, () => { backs.delete(n); });
  }
  return b.ok ? b.im : null;
}

/** start loading her pieces, her frames and the paintings the stage uses */
export function warmDotFlight(st: DotStage) {
  load();
  warmDot();
  for (const [, n] of st.backs) back(n);
}

/**
 * Draw a piece `w` wide with the point (ax, ay) of it (fractions of its size) at (x, y), turned `rot`, mirrored with `flip`.
 * Returns false before the atlas has loaded.
 */
export function drawPiece(ctx: CanvasRenderingContext2D, n: DotPiece, x: number, y: number, w: number, o: { ax?: number; ay?: number; flip?: boolean; rot?: number; alpha?: number; h?: number } = {}): boolean {
  load();
  if (!ready || !img) return false;
  const f = DOT_PROP_FRAMES[n];
  const h = o.h ?? (w * f.h) / f.w;
  ctx.save();
  ctx.translate(x, y);
  if (o.rot) ctx.rotate(o.rot);
  if (o.flip) ctx.scale(-1, 1);
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  ctx.drawImage(img, f.x, f.y, f.w, f.h, -w * (o.ax ?? 0.5), -h * (o.ay ?? 0.5), w, h);
  ctx.restore();
  return true;
}

// ------------------------------------------------------------------------------------------------------------------ effects
interface Bit {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  kind: 'petal' | 'seed' | 'spark' | 'feather' | 'drop';
  rot: number;
  vr: number;
  s: number;
  hue?: string;
}
/** the stage's own little things in the air: petals, dandelion seeds, sparkles, a feather off her tail */
export class DotFx {
  bits: Bit[] = [];
  private gustT = new Map<number, number>();
  add(b: Omit<Bit, 'max' | 'rot' | 'vr'> & { rot?: number; vr?: number }) {
    if (this.bits.length > 260) return;
    this.bits.push({ rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 6, ...b, max: b.life });
  }
  sparkle(x: number, y: number, n = 8, hue = '#fff7c2') {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.4;
      const v = 60 + Math.random() * 90;
      this.add({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.5 + Math.random() * 0.3, kind: 'spark', s: 3 + Math.random() * 2, hue });
    }
  }
  seeds(x: number, y: number) {
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = 30 + Math.random() * 80;
      this.add({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, life: 1.6 + Math.random() * 1.2, kind: 'seed', s: 0.8 + Math.random() * 0.5 });
    }
  }
  feather(x: number, y: number, dir: number) {
    this.add({ x, y, vx: -dir * 50, vy: -30, life: 2.6, kind: 'feather', s: 1, vr: 1.4 });
    for (let i = 0; i < 5; i++) this.add({ x, y, vx: (Math.random() - 0.5) * 140, vy: (Math.random() - 0.7) * 120, life: 0.5, kind: 'spark', s: 3, hue: '#fca5a5' });
  }
  /** petals stream out of the holes before and while a gust blows, the way it blows */
  gusts(st: DotStage, t: number, dt: number, x0: number, x1: number) {
    for (const g of st.gusts) {
      if (g.x1 < x0 - 100 || g.x0 > x1 + 100) continue;
      const s = gustState(g, t);
      if (!s.blowing && s.warn <= 0) continue;
      const rate = s.blowing ? 26 : 10 * s.warn;
      let acc = (this.gustT.get(g.id) ?? 0) + rate * dt;
      while (acc >= 1) {
        acc -= 1;
        const pink = Math.random() < 0.7;
        if (g.wx !== 0) {
          const from = g.wx < 0 ? g.x1 : g.x0;
          this.add({ x: from, y: g.y0 + Math.random() * (g.y1 - g.y0), vx: g.wx * (s.blowing ? 1 : 0.45) * (0.8 + Math.random() * 0.4), vy: (Math.random() - 0.5) * 40, life: 1.3, kind: 'petal', s: 0.8 + Math.random() * 0.5, hue: pink ? '#f9a8d4' : '#fde68a' });
        } else {
          this.add({ x: g.x0 + Math.random() * (g.x1 - g.x0), y: Math.max(TOP, st.height * 0) + TOP + Math.random() * 120, vx: (Math.random() - 0.5) * 30, vy: g.wy * (s.blowing ? 1.1 : 0.4), life: 2.2, kind: 'petal', s: 0.8 + Math.random() * 0.5, hue: pink ? '#f9a8d4' : '#fde68a' });
        }
      }
      this.gustT.set(g.id, acc);
    }
  }
  step(dt: number) {
    for (let i = this.bits.length - 1; i >= 0; i--) {
      const b = this.bits[i];
      b.life -= dt;
      if (b.life <= 0) {
        this.bits.splice(i, 1);
        continue;
      }
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.rot += b.vr * dt;
      if (b.kind === 'seed') {
        b.vx *= 1 - dt * 0.8;
        b.vy += (-14 - b.vy) * dt * 0.8;
      } else if (b.kind === 'feather') {
        b.vy += (28 - b.vy) * dt * 1.2;
        b.vx = Math.sin(b.life * 2.4) * 40;
      } else if (b.kind === 'spark') {
        b.vx *= 1 - dt * 3;
        b.vy *= 1 - dt * 3;
      }
    }
  }
  draw(ctx: CanvasRenderingContext2D) {
    for (const b of this.bits) {
      const a = Math.min(1, b.life / Math.min(0.5, b.max * 0.5));
      ctx.globalAlpha = a;
      if (b.kind === 'petal') {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rot);
        ctx.fillStyle = b.hue ?? '#f9a8d4';
        ctx.beginPath();
        ctx.ellipse(0, 0, 6 * b.s, 3.2 * b.s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (b.kind === 'seed') {
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        const r = 6 * b.s;
        for (let k = 0; k < 5; k++) {
          const ang = b.rot + (k / 5) * Math.PI - Math.PI;
          ctx.moveTo(b.x, b.y);
          ctx.lineTo(b.x + Math.cos(ang) * r, b.y + Math.sin(ang) * r);
        }
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x, b.y + r * 1.3);
        ctx.stroke();
      } else if (b.kind === 'feather') {
        if (!drawPiece(ctx, 'feather', b.x, b.y, 30, { rot: b.rot * 0.3 + 0.6 })) {
          ctx.fillStyle = '#fff';
          ctx.fillRect(b.x - 3, b.y - 8, 6, 16);
        }
      } else {
        ctx.fillStyle = b.hue ?? '#fff7c2';
        const k = b.s * 1.6 * a;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y - k * 1.6);
        ctx.quadraticCurveTo(b.x, b.y, b.x + k * 1.6, b.y);
        ctx.quadraticCurveTo(b.x, b.y, b.x, b.y + k * 1.6);
        ctx.quadraticCurveTo(b.x, b.y, b.x - k * 1.6, b.y);
        ctx.quadraticCurveTo(b.x, b.y, b.x, b.y - k * 1.6);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }
}

// ------------------------------------------------------------------------------------------------------------------ the sky
/** the paintings behind, hazed: each stretch of the stage has its own, crossfading where they meet, and drifting a little with her */
export function drawDotBackdrop(ctx: CanvasRenderingContext2D, st: DotStage, camX: number, camY: number, vw: number, vh: number, t: number) {
  // the sunrise sky, in case a painting has not loaded yet
  const sky = ctx.createLinearGradient(0, 0, 0, vh);
  sky.addColorStop(0, '#fbd38d');
  sky.addColorStop(0.55, '#fde7c4');
  sky.addColorStop(1, '#cfd8dc');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, vw, vh);
  const mid = camX + vw / 2;
  const blend = 500;
  for (let i = 0; i < st.backs.length; i++) {
    const [x0, n] = st.backs[i];
    const x1 = st.backs[i + 1]?.[0] ?? st.width + 2000;
    // how much of this painting shows: all of it inside its stretch, fading out over `blend` px either side of where the next begins
    const a = Math.min(1, Math.max(0, (mid - (x0 - blend)) / blend), Math.max(0, Math.min(1, (x1 + blend - mid) / blend)));
    if (a <= 0) continue;
    const im = back(n);
    if (!im) continue;
    // a painting fills the view with room to spare, and pans across that room as she flies its stretch (and a little with height)
    const s = Math.max(vw / im.width, vh / im.height) * 1.14;
    const w = im.width * s;
    const h = im.height * s;
    const u = Math.max(0, Math.min(1, (mid - x0) / Math.max(1, x1 - x0)));
    const v = Math.max(0, Math.min(1, camY / Math.max(1, DOT_VIEW_SLACK)));
    ctx.globalAlpha = a;
    ctx.drawImage(im, -(w - vw) * u, -(h - vh) * v, w, h);
  }
  ctx.globalAlpha = 1;
  // haze: the paintings sit back behind the netting and the thorns (the near ones are busy, with their own netting in them)
  const hz = ctx.createLinearGradient(0, 0, 0, vh);
  hz.addColorStop(0, 'rgba(255, 236, 205, 0.42)');
  hz.addColorStop(0.6, 'rgba(255, 240, 222, 0.34)');
  hz.addColorStop(1, 'rgba(236, 240, 244, 0.5)');
  ctx.fillStyle = hz;
  ctx.fillRect(0, 0, vw, vh);
  // the low sun's rays, slowly breathing
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 4; k++) {
    const x = vw * (0.15 + k * 0.24) - ((camX * 0.03) % (vw * 0.24));
    const a = 0.05 + 0.03 * Math.sin(t * 0.4 + k * 1.7);
    ctx.fillStyle = `rgba(255, 214, 140, ${a})`;
    ctx.beginPath();
    ctx.moveTo(x, -20);
    ctx.lineTo(x + 70, -20);
    ctx.lineTo(x - vh * 0.35 + 140, vh + 20);
    ctx.lineTo(x - vh * 0.35, vh + 20);
    ctx.fill();
  }
  ctx.restore();
}
/** how far the camera can go up and down (the painting pans that much) */
const DOT_VIEW_SLACK = 460;

// ------------------------------------------------------------------------------------------------------------------ the netting
/*
 * The General's netting is iron mesh strung between posts and sagging between them, not a lattice tower (Matt, 2026-10-25): thin
 * wire knotted into diamonds that droop in the middle, slender posts at its sides with the mesh lashed to them, holes torn into it
 * (the strands snapped and curled back at the rims, ragged, a chain swag along the bottom of each hole), thorns knotted on here and
 * there, the netting overhead hung in scallops from ring anchors, and the batch 1 netting pieces (chain, chain hook, ring) where they
 * fit. Every sag and torn end is drawn inside the iron, never out into a hole, so what she bumps is what she sees (give or take a few
 * pixels by the posts).
 */

/** a steady random from a few numbers (the same strand frays the same way every frame) */
function hash(a: number, b: number, c = 0): number {
  const v = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
  return v - Math.floor(v);
}

const WIRE = 'rgba(30, 27, 40, 0.9)';
const GLINT = 'rgba(184, 180, 204, 0.5)';
/** a mesh diamond's width; its height is a little more */
const CELL = 17;
const ROW = CELL * 0.62;
const HAS_PATH2D = typeof Path2D !== 'undefined';

/** the overhead's mesh, as a pattern (it runs the length of the view): thin wire diamonds with a cold glint and small knots */
let meshPat: CanvasPattern | null = null;
let meshTried = false;
function mesh(ctx: CanvasRenderingContext2D): CanvasPattern | null {
  if (meshPat || meshTried) return meshPat;
  meshTried = true;
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  const S = 30;
  c.width = S;
  c.height = S;
  const g = c.getContext('2d');
  if (!g) return null;
  g.lineCap = 'round';
  const wire = (x0: number, y0: number, x1: number, y1: number) => {
    g.strokeStyle = WIRE;
    g.lineWidth = 2.1;
    g.beginPath();
    g.moveTo(x0, y0);
    g.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + 1.5, x1, y1);
    g.stroke();
    g.strokeStyle = GLINT;
    g.lineWidth = 0.8;
    g.beginPath();
    g.moveTo(x0, y0 - 0.9);
    g.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + 0.6, x1, y1 - 0.9);
    g.stroke();
  };
  wire(-1, -1, S + 1, S + 1);
  wire(S + 1, -1, -1, S + 1);
  g.fillStyle = '#16131c';
  for (const [x, y] of [[S / 2, S / 2], [0, 0], [S, 0], [0, S], [S, S]]) {
    g.beginPath();
    g.arc(x, y, 1.9, 0, Math.PI * 2);
    g.fill();
  }
  meshPat = ctx.createPattern(c, 'repeat');
  return meshPat;
}

function cable(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, w = 7) {
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#17161d';
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(170, 166, 190, 0.7)';
  ctx.lineWidth = w * 0.25;
  ctx.beginPath();
  ctx.moveTo(x0 - 1.5, y0 - 1);
  ctx.lineTo(x1 - 1.5, y1 - 1);
  ctx.stroke();
}

/** a cord along a curve (u 0..1 from x0 to x1) */
function cord(ctx: CanvasRenderingContext2D, x0: number, x1: number, y: (u: number) => number, w: number) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const [style, lw, dy] of [['#1a1721', w, 0], ['rgba(184, 180, 204, 0.55)', w * 0.28, -w * 0.25]] as const) {
    ctx.strokeStyle = style;
    ctx.lineWidth = lw;
    ctx.beginPath();
    for (let k = 0; k <= 10; k++) {
      const u = k / 10;
      const px = x0 + (x1 - x0) * u;
      if (k === 0) ctx.moveTo(px, y(u) + dy);
      else ctx.lineTo(px, y(u) + dy);
    }
    ctx.stroke();
  }
}

/**
 * One stretch of mesh between two sagging edges, `top(u)` and `bot(u)` (u 0..1 across, x0 to x1), clipped to them. `tornTop` and
 * `tornBot` say which edges are the rims of torn holes: there the strands are snapped, ragged, curling back.
 */
function meshRun(
  ctx: CanvasRenderingContext2D,
  x0: number,
  x1: number,
  top: (u: number) => number,
  bot: (u: number) => number,
  o: { sag: number; seed: number; tornTop?: boolean; tornBot?: boolean; back?: number },
) {
  const w = x1 - x0;
  const yA = Math.min(top(0), top(0.5), top(1));
  const yB = Math.max(bot(0), bot(0.5), bot(1));
  if (yB - yA < 2) return;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x0, top(0));
  for (let k = 1; k <= 10; k++) ctx.lineTo(x0 + (w * k) / 10, top(k / 10));
  for (let k = 10; k >= 0; k--) ctx.lineTo(x0 + (w * k) / 10, bot(k / 10));
  ctx.closePath();
  ctx.clip();
  // a faint shade behind the wire, so the mesh reads against the bright sky (the sky shows through it)
  ctx.fillStyle = `rgba(26, 22, 36, ${o.back ?? 0.14})`;
  ctx.fillRect(x0 - 2, yA - 2, w + 4, yB - yA + 4);
  const n = Math.max(2, Math.round(w / CELL));
  const j0 = Math.floor((yA - o.sag) / ROW) - 1;
  const j1 = Math.ceil(yB / ROW) + 1;
  const kx = (i: number, j: number) => x0 + (i / n) * w + (i > 0 && i < n ? (hash(i, j, o.seed) - 0.5) * 2.4 : 0);
  const ky = (i: number, j: number) => j * ROW + o.sag * Math.sin((Math.PI * i) / n) + (hash(j, i, o.seed) - 0.5) * 1.6;
  // near a torn rim (within this of it) strands are snapped more often than not
  const nearTorn = (y: number, u: number) => (o.tornTop && y - top(u) < ROW * 2.2) || (o.tornBot && bot(u) - y < ROW * 2.2);
  const wires = HAS_PATH2D ? new Path2D() : null;
  const knots = HAS_PATH2D ? new Path2D() : null;
  if (!wires || !knots) {
    ctx.restore();
    return;
  }
  for (let j = j0; j <= j1; j++) {
    for (let i = 0; i <= n; i++) {
      if ((i + j) & 1) continue;
      const ax = kx(i, j);
      const ay = ky(i, j);
      for (const dj of [1, -1]) {
        if (i + 1 > n) continue;
        const bx = kx(i + 1, j + dj);
        const by = ky(i + 1, j + dj);
        const my = (ay + by) / 2;
        const u = (i + 0.5) / n;
        const r = hash(i * 3 + (dj > 0 ? 1 : 2), j, o.seed + 9);
        const snap = nearTorn(my, u) ? r < 0.68 : r < 0.035;
        if (snap) {
          // a snapped strand: two short ends, curling back
          const cx = (ax + bx) / 2;
          wires.moveTo(ax, ay);
          wires.quadraticCurveTo(ax + (cx - ax) * 0.7, ay + (my - ay) * 0.2, ax + (cx - ax) * 0.55, my + (r < 0.3 ? 3 : -3));
          wires.moveTo(bx, by);
          wires.quadraticCurveTo(bx + (cx - bx) * 0.7, by + (my - by) * 0.2, bx + (cx - bx) * 0.45, my + (r < 0.3 ? -3 : 3));
          continue;
        }
        wires.moveTo(ax, ay);
        wires.quadraticCurveTo((ax + bx) / 2, my + 1.6, bx, by);
      }
      if (j % 2 === 0) {
        knots.moveTo(ax + 1.8, ay);
        knots.arc(ax, ay, 1.8, 0, Math.PI * 2);
      }
    }
  }
  ctx.lineCap = 'round';
  // the far layer of the net, hanging slack a little behind and below the near one (it is netting, not a grille)
  ctx.translate(CELL * 0.5, ROW * 0.7);
  ctx.strokeStyle = 'rgba(30, 27, 40, 0.32)';
  ctx.lineWidth = 1.4;
  ctx.stroke(wires);
  ctx.translate(-CELL * 0.5, -ROW * 0.7);
  ctx.strokeStyle = WIRE;
  ctx.lineWidth = 2.1;
  ctx.stroke(wires);
  ctx.translate(-0.6, -0.9);
  ctx.strokeStyle = GLINT;
  ctx.lineWidth = 0.75;
  ctx.stroke(wires);
  ctx.translate(0.6, 0.9);
  ctx.fillStyle = '#15121b';
  ctx.fill(knots);
  ctx.restore();
}

/** a slender iron post the mesh is lashed to, with a knob where it stops at a hole */
function post(ctx: CanvasRenderingContext2D, x: number, y0: number, y1: number, cap0: boolean, cap1: boolean, seed: number) {
  if (y1 - y0 < 2) return;
  ctx.lineCap = 'butt';
  ctx.strokeStyle = '#1d1925';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x, y0);
  ctx.lineTo(x, y1);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(196, 186, 206, 0.45)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x - 1.2, y0);
  ctx.lineTo(x - 1.2, y1);
  ctx.stroke();
  // the lashings: a wrap of wire every so often, tying the mesh on
  ctx.strokeStyle = '#2b2635';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  for (let y = Math.ceil((y0 + 20) / 58) * 58 + (seed % 3) * 7; y < y1 - 14; y += 58) {
    ctx.moveTo(x - 4, y - 3);
    ctx.lineTo(x + 4, y + 1);
    ctx.moveTo(x - 4, y + 1);
    ctx.lineTo(x + 4, y + 5);
  }
  ctx.stroke();
  ctx.fillStyle = '#16131c';
  for (const [on, y] of [[cap0, y0], [cap1, y1]] as const) {
    if (!on) continue;
    ctx.beginPath();
    ctx.arc(x, y, 4.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(210, 200, 220, 0.6)';
  for (const [on, y] of [[cap0, y0], [cap1, y1]] as const) {
    if (!on) continue;
    ctx.beginPath();
    ctx.arc(x - 1.4, y - 1.4, 1.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** how far the mesh droops between the posts of a wall this wide */
const sagOf = (w: number) => Math.min(9, w * 0.15);

/** one wall of the General's netting, where its holes are at time t */
function drawWall(ctx: CanvasRenderingContext2D, w: NetWall, t: number, letter: boolean) {
  const holes = w.openings.map((o) => [openingY(o, t), openingY(o, t) + o.h] as const).sort((a, b) => a[0] - b[0]);
  const S = sagOf(w.w);
  const x0 = w.x + 2;
  const x1 = w.x + w.w - 2;
  // the runs of mesh: from the netting overhead (it hangs from there) down into the mist, less its holes
  const runs: Array<{ a: number; b: number; holeAbove: boolean; holeBelow: boolean }> = [];
  let y0 = TOP - 8;
  let above = false;
  for (const [a, b] of [...holes, [MIST + 140, MIST + 140] as const]) {
    if (a > y0) runs.push({ a: y0, b: a, holeAbove: above, holeBelow: a < MIST + 100 });
    y0 = Math.max(y0, b);
    above = b > TOP + 2;
  }
  // the light coming through each hole, behind the mesh
  for (const [a, b] of holes) {
    const cy = (a + b) / 2;
    const gl = ctx.createRadialGradient(w.x + w.w / 2, cy, 2, w.x + w.w / 2, cy, Math.max(30, (b - a) * (letter ? 1.6 : 0.8)));
    gl.addColorStop(0, letter ? 'rgba(255, 250, 220, 0.95)' : 'rgba(255, 236, 170, 0.45)');
    gl.addColorStop(1, 'rgba(255, 236, 170, 0)');
    ctx.fillStyle = gl;
    ctx.fillRect(w.x - 80, a - 60, w.w + 160, b - a + 120);
  }
  for (let r = 0; r < runs.length; r++) {
    const { a, b, holeAbove, holeBelow } = runs[r];
    if (b - a < 20) continue;
    // the top of a run under a hole dips between the posts (the hole's bottom rim); the bottom of a run over a hole hangs down in the
    // middle (its top rim): both into the iron, never out into the hole
    const top = holeAbove ? (u: number) => a + S * Math.sin(Math.PI * u) : () => a;
    const bot = holeBelow ? (u: number) => b - S - 3 + S * Math.sin(Math.PI * u) : () => b;
    meshRun(ctx, x0, x1, top, bot, { sag: S, seed: w.id * 7 + r, tornTop: holeAbove, tornBot: holeBelow });
    post(ctx, x0, top(0), bot(0), holeAbove, holeBelow, w.id + r);
    post(ctx, x1, top(1), bot(1), holeAbove, holeBelow, w.id + r + 1);
    // the bottom rim of a hole: a chain swag between the posts (it droops into the iron below)
    if (holeAbove && !letter) {
      if (!drawPiece(ctx, 'chain', (x0 + x1) / 2, a - 1, x1 - x0 + 14, { ax: 0.5, ay: 0.12, h: 22 + S })) cord(ctx, x0, x1, top, 3);
    }
    // thorns knotted onto the mesh, now and then (well away from the rims: they are the iron's, and the iron only bonks)
    const len = b - a;
    for (let y = a + 70 + hash(w.id, r) * 60; y < b - 60 && y < MIST - 40; y += 170 + hash(w.id, y) * 80) {
      if (len < 150) break;
      const side = hash(y, w.id) < 0.5 ? 0.3 : 0.7;
      drawPiece(ctx, 'thorn', x0 + (x1 - x0) * side, y, 24, { rot: hash(w.id, y, 3) * 6.28, alpha: 0.9 });
    }
  }
  // hung from the netting overhead: a chain hook at each post's head
  drawPiece(ctx, 'chainHook', x0, TOP - 4, 20, { ax: 0.5, ay: 0.85 });
  drawPiece(ctx, 'chainHook', x1, TOP - 4, 20, { ax: 0.5, ay: 0.85, flip: true });
  // the folded-letter gap: painted thorn knots crowd its edges (drawn, never touched: the squeeze is about lining up)
  if (letter) {
    for (const [a, b] of holes) {
      drawPiece(ctx, 'thorn', w.x + w.w / 2, a - 20, 58, { rot: 0.3 });
      drawPiece(ctx, 'thorn', w.x + w.w / 2, b + 20, 58, { rot: -0.5, flip: true });
    }
  }
}

/** the netting overhead hangs in scallops between ring anchors this far apart (its lowest, mid-way, is the ceiling she meets) */
const HANG = 280;
const overSag = (x: number) => {
  const u = (((x % HANG) + HANG) % HANG) / HANG;
  return TOP - 14 + 14 * Math.sin(Math.PI * u);
};

/** the netting overhead, along the whole stage and as far up as the view goes, hung in scallops from ring anchors */
function drawOverhead(ctx: CanvasRenderingContext2D, x0: number, x1: number, yTop: number) {
  const pat = mesh(ctx);
  const top = Math.min(0, yTop) - 20;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x0, top);
  ctx.lineTo(x1, top);
  for (let x = x1; x >= x0 - 10; x -= 14) ctx.lineTo(x, overSag(x));
  ctx.closePath();
  ctx.fillStyle = 'rgba(26, 22, 36, 0.16)';
  ctx.fill();
  if (pat) {
    ctx.clip();
    ctx.fillStyle = pat;
    ctx.fillRect(x0, top, x1 - x0, TOP - top + 4);
  }
  ctx.restore();
  // the cord along its sagging edge, and a ring at every anchor
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const [style, lw, dy] of [['#1a1721', 5, 0], ['rgba(184, 180, 204, 0.55)', 1.4, -1.3]] as const) {
    ctx.strokeStyle = style;
    ctx.lineWidth = lw;
    ctx.beginPath();
    for (let x = x0 - 10; x <= x1 + 14; x += 14) {
      if (x === x0 - 10) ctx.moveTo(x, overSag(x) + dy);
      else ctx.lineTo(x, overSag(x) + dy);
    }
    ctx.stroke();
  }
  for (let x = Math.floor(x0 / HANG) * HANG; x < x1 + HANG; x += HANG) drawPiece(ctx, 'ring', x, TOP - 20, 24, { ay: 0.2 });
}

/** the catch net under the lesson: a sagging hammock of mesh strung between posts that rise out of the mist */
function drawCatchNet(ctx: CanvasRenderingContext2D, p: { x: number; y: number; w: number; h: number }, seed: number) {
  const spans = Math.max(1, Math.round(p.w / 420));
  const sw = p.w / spans;
  for (let k = 0; k < spans; k++) {
    const a = p.x + sw * k;
    const b = a + sw;
    const top = (u: number) => p.y - 6 + 12 * Math.sin(Math.PI * u);
    const bot = (u: number) => p.y + p.h - 4 + 18 * Math.sin(Math.PI * u);
    meshRun(ctx, a, b, top, bot, { sag: 14, seed: seed + k, back: 0.1 });
    cord(ctx, a, b, top, 3.4);
    cord(ctx, a, b, bot, 2.4);
  }
  for (let k = 0; k <= spans; k++) post(ctx, p.x + sw * k, p.y - 10, MIST + 80, true, false, k);
}

/** the mist of the gorge, drifting (and solid below, as far down as the view goes) */
function drawMist(ctx: CanvasRenderingContext2D, x0: number, x1: number, t: number, yBot = MIST + 170) {
  const g = ctx.createLinearGradient(0, MIST - 90, 0, MIST + 80);
  g.addColorStop(0, 'rgba(240, 244, 248, 0)');
  g.addColorStop(0.5, 'rgba(240, 244, 248, 0.75)');
  g.addColorStop(1, 'rgba(236, 240, 246, 0.96)');
  ctx.fillStyle = g;
  ctx.fillRect(x0, MIST - 90, x1 - x0, 170);
  ctx.fillStyle = 'rgba(236, 240, 246, 0.96)';
  ctx.fillRect(x0, MIST + 80, x1 - x0, Math.max(90, yBot - MIST - 60));
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  for (let x = Math.floor(x0 / 180) * 180; x < x1 + 180; x += 180) {
    const wob = Math.sin(t * 0.5 + x * 0.013) * 14;
    ctx.beginPath();
    ctx.ellipse(x + wob, MIST - 10 + Math.sin(x * 0.007) * 10, 130, 26, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** an iron thorn strand: a twisted wire with steel barbs, painted knots of thorns along it */
function drawThorn(ctx: CanvasRenderingContext2D, th: Thorn, t: number) {
  const dx = th.x1 - th.x0;
  const dy = th.y1 - th.y0;
  const L = Math.hypot(dx, dy);
  const ang = Math.atan2(dy, dx);
  ctx.save();
  ctx.translate(th.x0, th.y0);
  ctx.rotate(ang);
  // a faint warm warning glow along it, so it reads against the iron and the sky
  ctx.strokeStyle = 'rgba(255, 90, 90, 0.16)';
  ctx.lineWidth = 18;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(L, 0);
  ctx.stroke();
  // the strand itself: the painted twisted strand, stretched along, or a drawn wire before it loads
  // (the painted strand stands upright in its sheet: turned a quarter to lie along the strand)
  if (!drawPiece(ctx, 'strandHook', L / 2, 0, 16, { h: L + 10, rot: Math.PI / 2 })) cable(ctx, 0, 0, L, 0, 5);
  // steel barbs both sides
  for (let s = 10; s < L - 6; s += 17) {
    const side = Math.floor(s / 17) % 2 ? 1 : -1;
    ctx.fillStyle = '#2a2833';
    ctx.beginPath();
    ctx.moveTo(s - 4, 0);
    ctx.lineTo(s + 1, side * 13);
    ctx.lineTo(s + 5, 0);
    ctx.fill();
    ctx.fillStyle = '#c8ccd6';
    ctx.beginPath();
    ctx.moveTo(s - 1, side * 3);
    ctx.lineTo(s + 1, side * 11);
    ctx.lineTo(s + 2, side * 3);
    ctx.fill();
  }
  // painted knots of thorns now and then
  for (let s = 40; s < L - 20; s += 110) drawPiece(ctx, 'thorn', s, 0, 44, { rot: ((s * 13 + th.id) % 7) * 0.4 });
  ctx.restore();
  void t;
}

/** each flower's glow (its bloom's size and place are the stage's: BLOOM, where she drinks) */
const GLOW: Record<Nectar['kind'], string> = { heli: '255, 190, 90', fuchsia: '255, 140, 200', trumpet: '255, 170, 90', passion: '210, 150, 255', blue: '140, 200, 255' };

/** a nectar flower on its stalk (up out of the mist) or hanging on a vine from the netting overhead; glowing while it holds nectar */
function drawFlower(ctx: CanvasRenderingContext2D, f: Nectar, fl: DotFlight, t: number) {
  const k = { ...BLOOM[f.kind], glow: GLOW[f.kind] };
  const left = (fl.nectar.get(f.id) ?? 0) / DOT.flowerHolds;
  const fr = DOT_PROP_FRAMES[k.piece];
  const h = (k.w * fr.h) / fr.w;
  const top = f.y - h * k.ay;
  const bottom = top + h;
  // the stalk: the painted vine, end to end
  const vx = f.x - k.w * k.ax + k.w * 0.5;
  if (k.hang) {
    for (let y = top + 10; y > TOP - 60; y -= 80) drawPiece(ctx, 'vine', vx + Math.sin(y * 0.02) * 4, y, 64, { ay: 1, flip: Math.floor(y / 80) % 2 === 0 });
  } else {
    for (let y = bottom - 14; y < MIST + 120; y += 80) drawPiece(ctx, 'vine', vx + Math.sin(y * 0.02) * 4, y, 64, { ay: 0, flip: Math.floor(y / 80) % 2 === 0 });
  }
  // the glow: brighter the fuller it is, a slow pulse
  if (left > 0.02) {
    const pulse = 0.75 + 0.25 * Math.sin(t * 3 + f.id);
    const r = 60 + 20 * left;
    const g = ctx.createRadialGradient(f.x, f.y, 4, f.x, f.y, r);
    g.addColorStop(0, `rgba(${k.glow}, ${0.75 * left * pulse})`);
    g.addColorStop(1, `rgba(${k.glow}, 0)`);
    ctx.fillStyle = g;
    ctx.fillRect(f.x - r, f.y - r, r * 2, r * 2);
  }
  const bob = Math.sin(t * 1.3 + f.id) * 2;
  if (left > 0.02) drawPiece(ctx, k.piece, f.x, f.y + bob, k.w, { ax: k.ax, ay: k.ay });
  else {
    drawPiece(ctx, 'drooped', f.x + 10, f.y + 18, k.w * 0.95, { ax: 0.4, ay: 0.4 });
    // filling again: a ring that closes as it comes back
    const at = fl.regrowAt.get(f.id);
    if (at !== undefined) {
      const u = 1 - Math.max(0, at - fl.t) / DOT.regrow;
      ctx.strokeStyle = 'rgba(255, 230, 150, 0.85)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(f.x, f.y - 10, 22, -Math.PI / 2, -Math.PI / 2 + u * Math.PI * 2);
      ctx.stroke();
    }
  }
  // a drop of nectar now and then
  if (left > 0.3 && Math.sin(t * 1.7 + f.id * 2.1) > 0.97) {
    ctx.fillStyle = 'rgba(255, 200, 80, 0.9)';
    ctx.beginPath();
    ctx.arc(f.x, f.y + 14 + ((t * 40) % 20), 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

export interface DotView {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

/** the giant flowers behind the netting: hazy, and drifting slower than the play (they are further away) */
export function drawDotDepth(ctx: CanvasRenderingContext2D, st: DotStage, camX: number, view: DotView) {
  for (const d of st.decor) {
    if (d.k !== 'giant' || !d.piece) continue;
    const x = d.x + camX * (1 - d.depth);
    if (x < view.x0 - d.w || x > view.x1 + d.w) continue;
    drawPiece(ctx, d.piece as DotPiece, x, d.y, d.w, { ax: 0.5, ay: 1, flip: d.flip, alpha: 0.42 });
  }
}

/** the play: netting, panels, flowers, thorns, dew, silk, puffs and the gap's light (in world space) */
export function drawDotWorld(ctx: CanvasRenderingContext2D, fl: DotFlight, view: DotView, t: number) {
  const st = fl.stage;
  const on = (x0: number, x1: number, pad = 120) => x1 > view.x0 - pad && x0 < view.x1 + pad;
  // the light pouring through the folded-letter gap, behind everything
  const L = st.letter;
  if (on(L.x - 900, L.x + 900, 0)) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const pulse = 0.8 + 0.2 * Math.sin(t * 2);
    for (let k = -3; k <= 3; k++) {
      const a = 0.07 * pulse * (1 - Math.abs(k) / 4);
      ctx.fillStyle = `rgba(255, 228, 160, ${a})`;
      ctx.beginPath();
      ctx.moveTo(L.x, L.y - 6);
      ctx.lineTo(L.x - 900, L.y + k * 160 - 80);
      ctx.lineTo(L.x - 900, L.y + k * 160 + 80);
      ctx.lineTo(L.x, L.y + 6);
      ctx.fill();
    }
    const g = ctx.createRadialGradient(L.x + 120, L.y, 10, L.x + 120, L.y, 420);
    g.addColorStop(0, 'rgba(255, 214, 140, 0.32)');
    g.addColorStop(1, 'rgba(255, 214, 140, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(L.x - 300, L.y - 420, 840, 840);
    ctx.restore();
  }
  drawOverhead(ctx, Math.max(0, view.x0 - 60), view.x1 + 60, view.y0);
  // vines up the walls, behind the iron
  for (const d of st.decor) {
    if (d.k !== 'vine' || !on(d.x - 80, d.x + 80)) continue;
    const top = MIST - 260 - ((d.x * 7) % 220);
    for (let y = MIST + 40; y > top; y -= 84) drawPiece(ctx, 'vine', d.x + Math.sin(y * 0.03) * 6, y, d.w * 0.6, { ay: 1, flip: d.flip !== (Math.floor(y / 84) % 2 === 0) });
  }
  for (const f of st.flowers) if (on(f.x - 80, f.x + 80)) drawFlower(ctx, f, fl, t);
  for (const w of st.walls) if (on(w.x, w.x + w.w)) drawWall(ctx, w, fl.t, !!w.letter);
  // the pocket floors: painted framed panels in a row
  for (const p of st.panels) {
    if (!on(p.x, p.x + p.w)) continue;
    if (p.catch) {
      drawCatchNet(ctx, p, p.id);
      continue;
    }
    const n = Math.max(1, Math.round(p.w / (p.h * 1.1)));
    const pw = p.w / n;
    for (let i = 0; i < n; i++) {
      if (!drawPiece(ctx, 'panel', p.x + pw * (i + 0.5), p.y + p.h / 2, pw + 4, { h: p.h + 6 })) {
        ctx.fillStyle = '#24212b';
        ctx.fillRect(p.x + pw * i, p.y, pw, p.h);
      }
    }
  }
  for (const d of st.decor) {
    if (!on(d.x - 60, d.x + 60)) continue;
    if (d.k === 'ring') drawPiece(ctx, 'ring', d.x, d.y - 4, d.w * 0.66, { ay: 0.15 });
    else if (d.k === 'web') drawPiece(ctx, 'silk', d.x, d.y, d.w, { flip: d.flip, alpha: 0.75 });
  }
  for (const th of st.thorns) if (on(Math.min(th.x0, th.x1), Math.max(th.x0, th.x1))) drawThorn(ctx, th, t);
  for (const d of st.dew) {
    if (fl.dewGot.has(d.id) || !on(d.x, d.x, 40)) continue;
    const tw = 0.85 + 0.15 * Math.sin(t * 4 + d.id);
    drawPiece(ctx, 'dew', d.x, d.y + Math.sin(t * 2 + d.id) * 2, 17 * tw);
  }
  for (const s of st.silk) {
    if (fl.silkGot.has(s.id) || !on(s.x, s.x, 60)) continue;
    const sh = 0.75 + 0.25 * Math.sin(t * 3 + s.id);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(s.x, s.y, 2, s.x, s.y, 46);
    g.addColorStop(0, `rgba(230, 240, 255, ${0.6 * sh})`);
    g.addColorStop(1, 'rgba(230, 240, 255, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(s.x - 46, s.y - 46, 92, 92);
    ctx.restore();
    drawPiece(ctx, 'silkWide', s.x, s.y, 62, { alpha: 0.8 + 0.2 * sh });
  }
  for (const p of st.puffs) {
    if (fl.popped.has(p.id) || !on(p.x, p.x, 60)) continue;
    const sway = Math.sin(t * 1.6 + p.id) * 0.12;
    drawPiece(ctx, p.id % 2 ? 'puff' : 'puff2', p.x, p.y, 52 * p.s, { rot: sway, ay: 0.4 });
  }
  // the gusts while they blow: streaks of wind
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  for (const g of st.gusts) {
    if (!on(g.x0, g.x1)) continue;
    const s = gustState(g, fl.t);
    if (!s.blowing) continue;
    ctx.beginPath();
    for (let k = 0; k < 7; k++) {
      if (g.wx !== 0) {
        const y = g.y0 + ((k + 0.5) / 7) * (g.y1 - g.y0);
        const span = g.x1 - g.x0;
        const p = (((fl.t * Math.abs(g.wx) * 1.4 + k * 97) % span) + span) % span;
        const x = g.wx < 0 ? g.x1 - p : g.x0 + p;
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x - Math.sign(g.wx) * 30, y - 6, x - Math.sign(g.wx) * 64, y);
      } else {
        const x = g.x0 + ((k + 0.5) / 7) * (g.x1 - g.x0);
        const span = g.y1 - g.y0;
        const y = g.y0 + ((fl.t * g.wy * 1.6 + k * 131) % span);
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + 5, y - 30, x, y - 64);
      }
    }
    ctx.stroke();
  }
  drawMist(ctx, Math.max(0, view.x0 - 60), view.x1 + 60, t, view.y1 + 20);
}

/** Dot herself, with the note at her feet. `hurt` blinks her after a thorn; `cheer` once she is through the gap */
export function drawDotPlayer(ctx: CanvasRenderingContext2D, fl: DotFlight, t: number, moment = 0) {
  const x = fl.x;
  const y = fl.y;
  // (after a thorn or coming back she can't be hurt for a moment: she pulses dim, never vanishes; QA, 2026-10-25)
  ctx.save();
  if (fl.invuln > 0 && fl.sinceHurt > 0.35) ctx.globalAlpha *= 0.76 + 0.2 * Math.cos(t * 18);
  // the energy left, as a small arc over her head while it is not full
  if (fl.energy < DOT.energy - 1 || fl.sipping >= 0) {
    const u = fl.energy / DOT.energy;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(30, 24, 40, 0.45)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(x, y + 44, 80, -Math.PI * 0.66, -Math.PI * 0.34);
    ctx.stroke();
    ctx.strokeStyle = u < 0.25 ? (Math.floor(t * 4) % 2 ? '#fb7185' : '#fda4af') : fl.sipping >= 0 ? '#fde68a' : '#fbbf24';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y + 44, 80, -Math.PI * 0.66, -Math.PI * 0.66 + Math.PI * 0.32 * u);
    ctx.stroke();
  }
  // which painting: flinching after a thorn, cheering through the gap, otherwise the flap (fast when hovering, slow when tired)
  let frame: string;
  if (fl.sinceHurt < 0.35) frame = 'flinch';
  else if (fl.through) frame = 'cheer';
  else {
    const rate = fl.tired ? 0.5 : fl.hovering ? 2.2 : fl.sinceFlap < 0.25 ? 2.6 : 1.4;
    frame = flyFrame(t * rate);
  }
  const face: -1 | 1 = fl.face;
  // a lean into where she is going, a lift as she flaps, a droop when tired
  const tilt = fl.tired ? 0.25 : Math.max(-0.35, Math.min(0.3, (Math.abs(fl.vx) / DOT.speed) * -0.22 + fl.vy / 1400));
  const k = 0.64;
  // the note: tied with its pink ribbon, under her
  // (in the squeeze through the gap the note is the point of it all: it glows, a little bigger)
  if (moment > 0.05) {
    const g = ctx.createRadialGradient(x, y + 22, 2, x, y + 22, 40);
    g.addColorStop(0, `rgba(255, 236, 180, ${0.8 * moment})`);
    g.addColorStop(1, 'rgba(255, 236, 180, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 40, y - 18, 80, 80);
  }
  drawPiece(ctx, 'letter', x + face * 4, y + 22 + 4 * moment, 28 + 12 * moment, { rot: Math.sin(t * 3) * 0.1 - face * 0.15 });
  if (!drawDotFrame(ctx, frame, x - face * 4, y - 4, k, face, tilt)) {
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.ellipse(x, y, 20, 13, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // a hover buzz: a faint blur ring at the wings
  if (fl.hovering && !fl.waiting && fl.sipping < 0) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(x + face * 6, y - 20, 26 + Math.sin(t * 40) * 3, 9, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * The squeeze through the gap (screen space): the edges of the view close in, warm, while the moment lasts, and the note glows.
 * `u` is how far into the moment (0 = not in it, 1 = fully slowed).
 */
export function drawDotMoment(ctx: CanvasRenderingContext2D, vw: number, vh: number, u: number, flash: number) {
  if (u > 0.01) {
    const g = ctx.createRadialGradient(vw / 2, vh / 2, Math.min(vw, vh) * 0.25, vw / 2, vh / 2, Math.max(vw, vh) * 0.7);
    g.addColorStop(0, 'rgba(60, 30, 10, 0)');
    g.addColorStop(1, `rgba(60, 30, 10, ${0.62 * u})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, vw, vh);
  }
  if (flash > 0.01) {
    ctx.fillStyle = `rgba(255, 246, 220, ${Math.min(0.85, flash)})`;
    ctx.fillRect(0, 0, vw, vh);
  }
}

/** a short screen held sideways (Matt's phone in the Claude app viewer is 489 x 270): her panel is one slim row */
export const dotHudSlim = (cssW: number, cssH: number) => cssH < 330 && cssW > cssH;

/** the slim panel: the nectar bar and the scratch count, one row 22 px tall */
function drawSlimHud(ctx: CanvasRenderingContext2D, fl: DotFlight, t: number, at: { x: number; y: number }) {
  const { x, y } = at;
  const w = 128;
  const h = 22;
  ctx.save();
  ctx.fillStyle = 'rgba(10, 30, 22, 0.62)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 11);
  ctx.fill();
  drawPiece(ctx, 'dew', x + 10, y + h / 2, 9);
  const u = fl.energy / DOT.energy;
  const bw = w - 62;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.beginPath();
  ctx.roundRect(x + 19, y + 7, bw, 8, 4);
  ctx.fill();
  ctx.fillStyle = u < 0.25 ? (Math.floor(t * 4) % 2 ? '#fb7185' : '#fda4af') : fl.sipping >= 0 ? '#fde68a' : '#fbbf24';
  ctx.beginPath();
  ctx.roundRect(x + 19, y + 7, Math.max(3, bw * u), 8, 4);
  ctx.fill();
  // the scratches: a mark and the count
  const sx = x + 19 + bw + 9;
  ctx.strokeStyle = fl.scratches > 0 ? '#fb7185' : 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sx, y + 16);
  ctx.lineTo(sx + 4, y + 6);
  ctx.moveTo(sx + 5, y + 16);
  ctx.lineTo(sx + 9, y + 6);
  ctx.stroke();
  ctx.font = '700 12px Fredoka, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffe4e6';
  ctx.fillText(String(fl.scratches), sx + 13, y + h / 2 + 1);
  ctx.restore();
}

/**
 * Her panel (css px, under the hearts): the nectar bar, the tally of scratches (nine slots, the story's number; past nine it just
 * counts on), and the silk found.
 */
export function drawDotHud(ctx: CanvasRenderingContext2D, fl: DotFlight, cssW: number, cssH: number, t: number, at: { x: number; y: number }) {
  const portrait = cssH > cssW;
  if (dotHudSlim(cssW, cssH)) return drawSlimHud(ctx, fl, t, at);
  const x = at.x;
  const y = at.y;
  const w = portrait ? 150 : 168;
  const h = 50;
  ctx.save();
  ctx.fillStyle = 'rgba(10, 30, 22, 0.62)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
  ctx.fill();
  ctx.stroke();
  // nectar: a drop and a bar
  const u = fl.energy / DOT.energy;
  drawPiece(ctx, 'dew', x + 14, y + 15, 12);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.beginPath();
  ctx.roundRect(x + 26, y + 10, w - 36, 10, 5);
  ctx.fill();
  const low = u < 0.25;
  ctx.fillStyle = low ? (Math.floor(t * 4) % 2 ? '#fb7185' : '#fda4af') : fl.sipping >= 0 ? '#fde68a' : '#fbbf24';
  ctx.beginPath();
  ctx.roundRect(x + 26, y + 10, Math.max(4, (w - 36) * u), 10, 5);
  ctx.fill();
  // scratches: nine little marks
  ctx.font = '600 11px Fredoka, sans-serif';
  ctx.fillStyle = '#d1fae5';
  ctx.textBaseline = 'middle';
  ctx.fillText('Scratches', x + 9, y + 36);
  const tx = x + 66;
  for (let i = 0; i < 9; i++) {
    const got = i < fl.scratches;
    ctx.strokeStyle = got ? '#fb7185' : 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = got ? 2.4 : 1.6;
    ctx.beginPath();
    const sx = tx + i * 7 + (i >= 5 ? 3 : 0);
    ctx.moveTo(sx, y + 42);
    ctx.lineTo(sx + 4, y + 30);
    ctx.stroke();
  }
  if (fl.scratches > 9) {
    ctx.fillStyle = '#fb7185';
    ctx.fillText(`+${fl.scratches - 9}`, tx + 68, y + 36);
  }
  // silk: shown once one is found (it is the secret)
  if (fl.silkGot.size > 0) {
    ctx.fillStyle = 'rgba(10, 30, 22, 0.62)';
    ctx.beginPath();
    ctx.roundRect(x + w + 6, y, 62, h, 14);
    ctx.fill();
    drawPiece(ctx, 'silkWide', x + w + 24, y + 25, 28);
    ctx.font = '700 14px Fredoka, sans-serif';
    ctx.fillStyle = '#e0f2fe';
    ctx.fillText(`${fl.silkGot.size}/${fl.stage.silk.length}`, x + w + 40, y + 26);
  }
  ctx.restore();
}
