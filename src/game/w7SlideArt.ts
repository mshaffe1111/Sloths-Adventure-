/**
 * w7SlideArt — drawing 7-4's slide from behind Pokey's back (w7Slide.ts). MOCK-UP STAND-INS: the chute is flat code-drawn stone with
 * World 7's kit pieces (kits/w7.webp) stood in for the obstacles. Pokey is Matt's sliding-from-behind sheet (pokey-slide-back.webp).
 * The real build swaps every piece for painted art (STAGE-RULES §4; the art list is in reference/prop-sheets/qa-notes/7-4-slide-mockup/).
 *
 * The view: a camera a little behind and above him, looking down the chute to a vanishing point. A point (x across, y up, z along)
 * goes to the screen at cx + (x + bend - camX)·f/dz, horizon + (camY - y)·f/dz, with dz its distance ahead of the camera.
 */
import { trackAtlas } from './atlasLoader.ts';
import { KIT_FRAMES } from './kitAtlasData.ts';
import { bendAt, KINDS, SLIDE, type SlideCourse, type SlideSim } from './w7Slide.ts';

const KIT_URL = new URL('../assets/kits/w7.webp', import.meta.url).href;
const BACK_URL = new URL('../assets/w6to10/slide/pokey-slide-back.webp', import.meta.url).href;
/**
 * Pokey sliding from behind (slomatt/02, Matt's sliding sheet; pokey-slide-back.json): x, y, w, h. Seen from behind, his strap runs from
 * his left shoulder (screen left) to the bag on his right hip (screen right). The straight poses (1, 3, 16) are drawn mirrored and are
 * flipped here. Flipping swaps the satchel's sides, so the right lean (the left lean flipped) has it wrong: a stand-in until Matt's sheet.
 */
const BACK: Record<string, [number, number, number, number]> = {
  slideA: [0, 0, 147, 115],
  slideB: [151, 0, 121, 115],
  leanL: [276, 0, 152, 109],
  leanR: [432, 0, 152, 109],
  launch: [588, 0, 111, 116],
  air: [703, 0, 113, 106],
  land: [820, 0, 127, 107],
  impact: [951, 0, 152, 108],
};
const imgs: Record<string, HTMLImageElement | null> = {};
const ok = new Set<string>();
function img(url: string): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  if (!(url in imgs)) {
    const im = new Image();
    imgs[url] = im;
    trackAtlas(im, url, () => ok.add(url), () => { imgs[url] = null; });
  }
  return ok.has(url) ? imgs[url] : null;
}
export function warmSlide() {
  img(KIT_URL);
  img(BACK_URL);
  for (const p of Object.values(PROPS)) img(p[0]);
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
  bend0: number;
}

const CAM_BACK = 5.5;
const CAM_H = 2.1;

function view(sim: SlideSim, W: number, H: number): View {
  const portrait = H > W;
  // (Pokey stands about a fifth of the screen tall sideways, a seventh upright)
  const f = portrait ? W * 1.05 : Math.min(W * 0.75, H * 1.15);
  return {
    W,
    H,
    cx: W / 2,
    hy: H * (portrait ? 0.44 : 0.3),
    f,
    camX: sim.x * 0.6,
    camY: CAM_H + sim.y * 0.35,
    camZ: sim.z - CAM_BACK,
    bend0: bendAt(sim.c, sim.z),
  };
}

function P(v: View, c: SlideCourse, x: number, y: number, z: number): [number, number, number] | null {
  const dz = z - v.camZ;
  if (dz < 0.35) return null;
  const b = bendAt(c, z) - v.bend0;
  const s = v.f / dz;
  return [v.cx + (x + b - v.camX) * s, v.hy + (v.camY - y) * s, s];
}

/** how much of the far fog is over a thing at distance dz (0 near, 1 at the far end) */
const fogAt = (dz: number) => Math.max(0, Math.min(1, (dz - (SLIDE.far - SLIDE.fade)) / SLIDE.fade));

function quad(ctx: CanvasRenderingContext2D, a: number[], b: number[], c2: number[], d: number[]) {
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.lineTo(c2[0], c2[1]);
  ctx.lineTo(d[0], d[1]);
  ctx.closePath();
  ctx.fill();
}

const mix = (a: [number, number, number], b: [number, number, number], t: number) =>
  `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(a[2] + (b[2] - a[2]) * t)})`;

const DARK: [number, number, number] = [22, 26, 30];
const FLOOR_A: [number, number, number] = [128, 126, 112];
const FLOOR_B: [number, number, number] = [112, 112, 100];
const WALL_A: [number, number, number] = [86, 92, 84];
const WALL_B: [number, number, number] = [74, 80, 74];
const MOSS: [number, number, number] = [92, 118, 68];

/** the kit's wall, clipped into a wall piece (a strip of it per piece, so it runs on along the chute) */
function wallTex(ctx: CanvasRenderingContext2D, q: number[][], seg: number, fog: number) {
  const im = img(KIT_URL);
  const fr = KIT_FRAMES[7]?.wall;
  if (!im || !fr || fog >= 1) return;
  const xs = q.map((p) => p[0]), ys = q.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  if (x1 - x0 < 1 || y1 - y0 < 1) return;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(q[0][0], q[0][1]);
  for (let i = 1; i < 4; i++) ctx.lineTo(q[i][0], q[i][1]);
  ctx.closePath();
  ctx.clip();
  const sw = fr.w / 4, sx = fr.x + (Math.abs(seg) % 4) * sw;
  ctx.globalAlpha = 0.85 * (1 - fog);
  ctx.drawImage(im, sx, fr.y, sw, fr.h, x0, y0, x1 - x0, y1 - y0);
  ctx.restore();
}

/** a kit piece stretched into a box on the screen */
function kit(ctx: CanvasRenderingContext2D, name: string, x: number, y: number, w: number, h: number): boolean {
  const im = img(KIT_URL);
  const fr = KIT_FRAMES[7]?.[name];
  if (!im || !fr) return false;
  ctx.drawImage(im, fr.x, fr.y, fr.w, fr.h, x, y, w, h);
  return true;
}

export function drawSlide(ctx: CanvasRenderingContext2D, sim: SlideSim, W: number, H: number, dpr: number, say: { text: string; t: number } | null) {
  const c = sim.c;
  // (css px: the engine's own scale holds its world zoom, which the slide does not use)
  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const v = view(sim, W, H);
  // the dark of the temple, and the light at the far end of the chute (it grows as the end comes)
  ctx.fillStyle = `rgb(${DARK.join(',')})`;
  ctx.fillRect(0, 0, W, H);
  const left = c.length - sim.z;
  const glow = Math.max(0, Math.min(1, 1 - left / 90));
  const vp = P(v, c, 0, 1.2, sim.z + SLIDE.far) ?? [v.cx, v.hy, 1];
  const g = ctx.createRadialGradient(vp[0], vp[1], 2, vp[0], vp[1], Math.max(W, H) * (0.18 + glow * 0.6));
  g.addColorStop(0, `rgba(255, 226, 150, ${0.35 + glow * 0.6})`);
  g.addColorStop(1, 'rgba(255, 226, 150, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // the chute, far to near: floor tiles, the gaps, the walls
  const step = 1.2;
  const hw = SLIDE.halfW;
  const z0 = Math.floor((v.camZ + 0.4) / step) * step;
  const gaps = sim.sorted.filter((o) => o.kind === 'gap' && o.z + o.len > v.camZ && o.z < sim.z + SLIDE.far);
  for (let z = z0 + Math.ceil(SLIDE.far / step + 2) * step; z >= z0; z -= step) {
    const za = Math.max(z, v.camZ + 0.4), zb = z + step;
    const a1 = P(v, c, -hw, 0, za), a2 = P(v, c, hw, 0, za), b1 = P(v, c, -hw, 0, zb), b2 = P(v, c, hw, 0, zb);
    if (!a1 || !a2 || !b1 || !b2) continue;
    const fog = fogAt(z - v.camZ);
    const odd = Math.floor(z / step) % 2 === 0;
    // the walls: up and a little out, with the moss line at the foot
    const wl1 = P(v, c, -hw - 0.7, 2.8, za), wl2 = P(v, c, -hw - 0.7, 2.8, zb), wr1 = P(v, c, hw + 0.7, 2.8, za), wr2 = P(v, c, hw + 0.7, 2.8, zb);
    if (wl1 && wl2 && wr1 && wr2) {
      ctx.fillStyle = mix(odd ? WALL_A : WALL_B, DARK, fog);
      quad(ctx, a1, b1, wl2, wl1);
      quad(ctx, a2, b2, wr2, wr1);
      // World 7's carved wall with its roots, laid into each wall piece (stand-in: not in perspective), darkened with the distance
      const seg = Math.floor(z / step);
      wallTex(ctx, [a1, b1, wl2, wl1], seg, fog);
      wallTex(ctx, [a2, b2, wr2, wr1], seg + 7, fog);
      // the ceiling: the walls lean in to a flat stone roof (so the chute reads as underground)
      const cl1 = P(v, c, -hw + 0.3, 3.4, za), cl2 = P(v, c, -hw + 0.3, 3.4, zb), cr1 = P(v, c, hw - 0.3, 3.4, za), cr2 = P(v, c, hw - 0.3, 3.4, zb);
      if (cl1 && cl2 && cr1 && cr2) {
        ctx.fillStyle = mix(odd ? [58, 62, 58] : [50, 54, 50], DARK, fog);
        quad(ctx, wl1, wl2, cl2, cl1);
        quad(ctx, wr1, wr2, cr2, cr1);
        ctx.fillStyle = mix(odd ? [44, 46, 44] : [38, 40, 38], DARK, fog);
        quad(ctx, cl1, cl2, cr2, cr1);
      }
      ctx.fillStyle = mix(MOSS, DARK, fog);
      const ml1 = P(v, c, -hw - 0.08, 0.2, za), ml2 = P(v, c, -hw - 0.08, 0.2, zb), mr1 = P(v, c, hw + 0.08, 0.2, za), mr2 = P(v, c, hw + 0.08, 0.2, zb);
      if (ml1 && ml2 && mr1 && mr2) {
        quad(ctx, a1, b1, ml2, ml1);
        quad(ctx, a2, b2, mr2, mr1);
      }
    }
    // the floor (or the dark of a gap)
    const inGap = gaps.some((o) => zb > o.z && za < o.z + o.len);
    if (inGap) {
      ctx.fillStyle = '#07080a';
      quad(ctx, a1, a2, b2, b1);
    } else {
      ctx.fillStyle = mix(odd ? FLOOR_A : FLOOR_B, DARK, fog);
      quad(ctx, a1, a2, b2, b1);
      // the lane grooves worn in the floor
      ctx.strokeStyle = mix([92, 90, 80], DARK, fog);
      ctx.lineWidth = Math.max(1, a1[2] * 0.03);
      for (const lx of [-SLIDE.lane / 2, SLIDE.lane / 2]) {
        const p = P(v, c, lx, 0, za), q = P(v, c, lx, 0, zb);
        if (!p || !q) continue;
        ctx.beginPath();
        ctx.moveTo(p[0], p[1]);
        ctx.lineTo(q[0], q[1]);
        ctx.stroke();
      }
    }
  }
  // the gaps' lips (the near edge's face, so the drop reads)
  for (const o of gaps) {
    const a = P(v, c, -hw, 0, o.z), b = P(v, c, hw, 0, o.z), a2 = P(v, c, -hw, -0.6, o.z), b2 = P(v, c, hw, -0.6, o.z);
    if (!a || !b || !a2 || !b2) continue;
    ctx.fillStyle = mix([60, 58, 52], DARK, fogAt(o.z - v.camZ));
    quad(ctx, a, b, b2, a2);
  }
  // the flags (a pennant on the left wall)
  for (const fz of c.flags) {
    const p = P(v, c, -hw + 0.1, 0, fz), q = P(v, c, -hw + 0.1, 1.6, fz);
    if (!p || !q || fz - v.camZ > SLIDE.far) continue;
    ctx.strokeStyle = '#d6d3c4';
    ctx.lineWidth = Math.max(1, p[2] * 0.05);
    ctx.beginPath();
    ctx.moveTo(p[0], p[1]);
    ctx.lineTo(q[0], q[1]);
    ctx.stroke();
    ctx.fillStyle = fz <= sim.flagZ ? '#facc15' : '#ef4444';
    ctx.beginPath();
    ctx.moveTo(q[0], q[1]);
    ctx.lineTo(q[0] + p[2] * 0.5, q[1] + p[2] * 0.15);
    ctx.lineTo(q[0], q[1] + p[2] * 0.3);
    ctx.fill();
  }

  // things in the chute, far to near; Pokey goes in at his own distance
  type Thing = { z: number; draw: () => void };
  const things: Thing[] = [];
  sim.sorted.forEach((o, i) => {
    if (o.kind === 'gap' || o.z + o.len < v.camZ + 0.5 || o.z > sim.z + SLIDE.far) return;
    things.push({ z: o.z, draw: () => drawObstacle(ctx, v, c, o, sim.wasMet(i)) });
  });
  c.petals.forEach((p, i) => {
    if (sim.petalsGot.has(i) || p.z < v.camZ + 0.5 || p.z > sim.z + SLIDE.far) return;
    things.push({
      z: p.z,
      draw: () => {
        const q = P(v, c, p.x, p.y + 0.12 * Math.sin(sim.clock * 4 + p.z), p.z);
        if (!q) return;
        const r = Math.max(1.5, q[2] * 0.16);
        ctx.globalAlpha = 1 - fogAt(p.z - v.camZ);
        ctx.fillStyle = '#f472b6';
        for (let k = 0; k < 5; k++) {
          const a = (k / 5) * Math.PI * 2 + sim.clock;
          ctx.beginPath();
          ctx.arc(q[0] + Math.cos(a) * r * 0.6, q[1] + Math.sin(a) * r * 0.6, r * 0.55, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.arc(q[0], q[1], r * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      },
    });
  });
  things.push({ z: sim.z, draw: () => drawPokey(ctx, v, c, sim) });
  things.sort((a, b) => b.z - a.z);
  for (const t of things) t.draw();

  // the arch overhead: dark ceiling at the top of the screen (so the chute reads as underground)
  const top = ctx.createLinearGradient(0, 0, 0, v.hy * 0.7);
  top.addColorStop(0, 'rgba(10, 12, 14, 0.95)');
  top.addColorStop(1, 'rgba(10, 12, 14, 0)');
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, W, v.hy * 0.7);

  // his line, in a bubble over him (World 7: Pokey teaches himself; it is his voice, not Dot's banner)
  if (say && say.t > 0) {
    const pz = P(v, c, sim.x, sim.y + 1.15, sim.z);
    if (pz) drawBubble(ctx, say.text, pz[0], pz[1], W, Math.min(1, say.t * 3));
  }
  // the light at the end: it fills the screen as he shoots out
  if (sim.outT >= 0) {
    ctx.fillStyle = `rgba(255, 240, 200, ${Math.min(1, sim.outT / SLIDE.outro)})`;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

/** World 7's painted props (props-made/w7b, w7c: Hugging Face img2img from the kit), stood in for the slide's obstacles */
const W7B_URL = new URL('../assets/w6to10/props-made/w7b.webp', import.meta.url).href;
const W7C_URL = new URL('../assets/w6to10/props-made/w7c.webp', import.meta.url).href;
const PROPS: Record<string, [string, number, number, number, number]> = {
  statue: [W7C_URL, 0, 0, 253, 468],
  urn: [W7C_URL, 257, 0, 226, 386],
  column: [W7C_URL, 487, 0, 457, 237],
  span: [W7B_URL, 0, 0, 480, 61],
  block: [W7B_URL, 0, 346, 291, 204],
};
function prop(ctx: CanvasRenderingContext2D, name: string, x: number, y: number, w: number, h: number): boolean {
  const pr = PROPS[name];
  if (!pr) return false;
  const [url, fx, fy, fw, fh] = pr;
  const im = img(url);
  if (!im) return false;
  ctx.drawImage(im, fx, fy, fw, fh, x, y, w, h);
  return true;
}

function drawObstacle(ctx: CanvasRenderingContext2D, v: View, c: SlideCourse, o: SlideSim['sorted'][number], met: boolean) {
  const lanes = [...o.lanes].sort((a, b) => a - b);
  const xl = (lanes[0] - 1) * SLIDE.lane - SLIDE.lane / 2 + 0.06;
  const xr = (lanes[lanes.length - 1] - 1) * SLIDE.lane + SLIDE.lane / 2 - 0.06;
  const fog = fogAt(o.z - v.camZ);
  ctx.globalAlpha = 1 - fog;
  const k = KINDS[o.kind];
  const box = (name: string, x0: number, x1: number, y0: number, y1: number) => {
    const a = P(v, c, x0, y1, o.z), b = P(v, c, x1, y0, o.z);
    if (!a || !b) return;
    if (!prop(ctx, name, a[0], a[1], b[0] - a[0], b[1] - a[1]) && !kit(ctx, name, a[0], a[1], b[0] - a[0], b[1] - a[1])) {
      ctx.fillStyle = '#6b6b5e';
      ctx.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
    }
  };
  if (o.kind === 'head') {
    // a toppled statue (or an urn) in each lane it fills, as tall as he can never jump
    for (const l of lanes) {
      const x = (l - 1) * SLIDE.lane;
      if (o.look === 2) box('urn', x - 0.42, x + 0.42, 0, 1.45);
      else box('statue', x - 0.42, x + 0.42, 0, 1.55);
    }
  } else if (o.kind === 'column') {
    // a fallen column lying across the lanes it fills, broken in drums (one a lane)
    for (const l of lanes) {
      const x = (l - 1) * SLIDE.lane;
      box('column', x - 0.58, x + 0.58, 0, k.low! + 0.05);
    }
  } else if (o.kind === 'rubble') {
    box('mossStrip', xl, xr, 0, k.low!);
    for (const l of [0, 2]) box('block', (l - 1) * SLIDE.lane - 0.3, (l - 1) * SLIDE.lane + 0.3, 0, k.low! - 0.02);
  } else if (o.kind === 'beam') {
    // a carved lintel at head height on two columns at the walls
    box('trunk', -SLIDE.halfW - 0.05, -SLIDE.halfW + 0.35, 0, k.high! + 0.5);
    box('trunk', SLIDE.halfW - 0.35, SLIDE.halfW + 0.05, 0, k.high! + 0.5);
    box('span', -SLIDE.halfW, SLIDE.halfW, k.high!, k.high! + 0.45);
  }
  if (met) {
    // knocked: a puff of dust
    ctx.globalAlpha = 0.35 * (1 - fog);
    ctx.fillStyle = '#e7e5d8';
    const p = P(v, c, (xl + xr) / 2, 0.5, o.z);
    if (p) {
      ctx.beginPath();
      ctx.arc(p[0], p[1], p[2] * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

function drawPokey(ctx: CanvasRenderingContext2D, v: View, c: SlideCourse, sim: SlideSim) {
  const ground = P(v, c, sim.x, 0, sim.z);
  const body = P(v, c, sim.x, sim.y, sim.z);
  if (!ground || !body) return;
  // his shadow stays on the floor
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(ground[0], ground[1], ground[2] * 0.42 * (1 - Math.min(0.5, sim.y * 0.4)), ground[2] * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  if (sim.safeT > 0 && Math.floor(sim.clock * 10) % 2 === 0) return;
  const air = !sim.grounded;
  const frame = air
    ? sim.vy > 1.8 ? 'launch' : sim.vy > -1.8 ? 'air' : 'land'
    : sim.clock - sim.landedAt < 0.2 ? 'impact'
    : sim.lean < -0.4 ? 'leanL' : sim.lean > 0.4 ? 'leanR' : Math.floor(sim.clock * 4) % 2 ? 'slideA' : 'slideB';
  const [fx, fy, fw, fh] = BACK[frame];
  // (the sheet's poses are about 115 px tall for a seated Pokey about 0.95 m tall)
  const s = (0.95 * body[2]) / 115;
  const squash = sim.ducking ? 0.62 : 1;
  ctx.save();
  ctx.translate(body[0], body[1] + body[2] * 0.06);
  ctx.rotate(sim.lean * 0.08);
  ctx.scale(s * (sim.ducking ? 1.1 : 1), s * squash);
  const im = img(BACK_URL);
  if (im) ctx.drawImage(im, fx, fy, fw, fh, -fw / 2, -fh, fw, fh);
  else {
    ctx.fillStyle = '#7c5a3a';
    ctx.beginPath();
    ctx.ellipse(0, -fh / 2, fw / 2, fh / 2, 0, 0, Math.PI * 2);
    ctx.fill();
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
