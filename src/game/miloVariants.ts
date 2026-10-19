import type { PlayerState } from './types.ts';
import { rng } from './artKit.ts';

/**
 * Five candidate designs for Milo, all driven by one shared pose rig so they animate identically
 * and can be swapped into the game without touching physics. Feet sit on y = 0, up is negative,
 * and the sprite faces +x (the caller mirrors it with p.facing).
 *
 * No headbands or bandanas anywhere (Matt's call).
 */

export type MiloVariant = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const MILO_NAMES: Record<MiloVariant, string> = {
  1: 'Storybook',
  2: 'Flat Hero',
  3: 'Plush Chibi',
  4: 'Explorer',
  5: 'Jungle Guardian',
  6: 'Rogue Slugger',
  7: 'Thornbark',
};

const TAU = Math.PI * 2;
type V2 = { x: number; y: number };

// ---------------------------------------------------------------------------
// Looks (proportions + palette)
// ---------------------------------------------------------------------------

interface Pal {
  base: string; light: string; dark: string; deep: string;
  cream: string; creamDark: string; patch: string; nose: string;
  claw: string; clawEdge: string; ol: string; blush: string;
}

interface Look {
  id: MiloVariant;
  /** which hero design this one is built from (evil versions reuse the same shapes) */
  base: MiloVariant;
  evil: boolean;
  shoulder: V2;       // front shoulder (back one mirrors x)
  hip: V2;
  armLen: number; armW: [number, number]; armBend: number;
  legW: number;
  headY: number; headRx: number; headRy: number;
  bodyY: number;
  pal: Pal;
  ol: number;         // outline width, 0 = unoutlined
  claw: { n: number; len: number; w: number; spread: number };
  footRx: number; footRy: number;
}

const PAL1: Pal = {
  base: '#b98a5a', light: '#dfbc8c', dark: '#8a5f38', deep: '#5f3d22',
  cream: '#fbf0da', creamDark: '#ecd5ac', patch: '#6a4026', nose: '#2e1b10',
  claw: '#fff4de', clawEdge: '#b99a72', ol: '#7a5030', blush: 'rgba(255,140,125,0.45)',
};
const PAL2: Pal = {
  base: '#8d5b2d', light: '#b57d43', dark: '#5f3b1a', deep: '#3d2410',
  cream: '#f9e9c6', creamDark: '#e8c98f', patch: '#cf8f38', nose: '#1b1009',
  claw: '#fff1d4', clawEdge: '#2a170a', ol: '#2a170a', blush: 'rgba(255,120,110,0.4)',
};
const PAL3: Pal = {
  base: '#cfa06b', light: '#f4dcae', dark: '#a8763f', deep: '#7c5128',
  cream: '#fff4dc', creamDark: '#f6dfb4', patch: '#8f5d33', nose: '#3a2216',
  claw: '#fff8ea', clawEdge: '#c9ad85', ol: '#9a6a3a', blush: 'rgba(255,128,128,0.65)',
};
const PAL4: Pal = {
  base: '#a8764a', light: '#d2a574', dark: '#7a4f2c', deep: '#51321a',
  cream: '#f8e8c8', creamDark: '#e6c895', patch: '#6d4426', nose: '#24140a',
  claw: '#fff1d6', clawEdge: '#a98355', ol: '#5f3b1f', blush: 'rgba(255,135,120,0.4)',
};
const PAL5: Pal = {
  base: '#7a5236', light: '#a87a52', dark: '#573621', deep: '#35210f',
  cream: '#f3dfb6', creamDark: '#d9b983', patch: '#3f2615', nose: '#160b05',
  claw: '#fff0c8', clawEdge: '#c39a4a', ol: '#2c1a0d', blush: 'rgba(255,150,110,0.3)',
};

const PAL6: Pal = {
  base: '#4b3a4a', light: '#74596f', dark: '#2f2330', deep: '#1a121b',
  cream: '#d9c8a6', creamDark: '#b39f7c', patch: '#4a1a26', nose: '#120a0d',
  claw: '#d5dde8', clawEdge: '#2a2f3a', ol: '#140b14', blush: 'rgba(120,40,60,0.35)',
};
const PAL7: Pal = {
  base: '#4a3340', light: '#79566b', dark: '#2f1f2b', deep: '#1c1119',
  cream: '#cdb89a', creamDark: '#a88f74', patch: '#1d0f16', nose: '#0e0709',
  claw: '#e8d2c0', clawEdge: '#7a3a4a', ol: '#14080e', blush: 'rgba(150,40,70,0.3)',
};

const LOOKS5: Record<1 | 2 | 3 | 4 | 5, Look> = {
  1: {
    id: 1, base: 1, evil: false, shoulder: { x: 14, y: -33 }, hip: { x: 8.5, y: -10 },
    armLen: 27, armW: [10, 7], armBend: 4, legW: 9.5,
    headY: -46, headRx: 20.5, headRy: 17.5, bodyY: -23, pal: PAL1, ol: 0,
    claw: { n: 3, len: 9.5, w: 2.3, spread: 0.3 }, footRx: 8, footRy: 4.8,
  },
  2: {
    id: 2, base: 2, evil: false, shoulder: { x: 16, y: -35 }, hip: { x: 8, y: -10 },
    armLen: 24, armW: [11, 8.5], armBend: 3, legW: 11,
    headY: -47, headRx: 20, headRy: 16.5, bodyY: -23, pal: PAL2, ol: 2.4,
    claw: { n: 3, len: 5.5, w: 2.6, spread: 0.34 }, footRx: 8.5, footRy: 5,
  },
  3: {
    id: 3, base: 3, evil: false, shoulder: { x: 12, y: -19 }, hip: { x: 7, y: -7 },
    armLen: 15, armW: [8.5, 7], armBend: 2.5, legW: 9,
    headY: -40, headRx: 25, headRy: 21.5, bodyY: -14, pal: PAL3, ol: 0,
    claw: { n: 3, len: 4.8, w: 1.8, spread: 0.36 }, footRx: 7.5, footRy: 4.6,
  },
  4: {
    id: 4, base: 4, evil: false, shoulder: { x: 13.5, y: -40 }, hip: { x: 7, y: -13 },
    armLen: 27, armW: [9, 6.5], armBend: 3, legW: 8.6,
    headY: -50, headRx: 17.5, headRy: 15.2, bodyY: -27, pal: PAL4, ol: 1.2,
    claw: { n: 3, len: 7.5, w: 2.1, spread: 0.3 }, footRx: 7.8, footRy: 4.6,
  },
  5: {
    id: 5, base: 5, evil: false, shoulder: { x: 15.5, y: -36 }, hip: { x: 8, y: -11 },
    armLen: 26, armW: [11.5, 7.5], armBend: 3.5, legW: 10,
    headY: -48, headRx: 19, headRy: 16, bodyY: -25, pal: PAL5, ol: 0,
    claw: { n: 3, len: 8, w: 2.2, spread: 0.3 }, footRx: 8.2, footRy: 4.8,
  },
};

const LOOKS: Record<MiloVariant, Look> = {
  ...LOOKS5,
  6: { ...LOOKS5[2], id: 6, base: 2, evil: true, pal: PAL6, armLen: 25, claw: { n: 3, len: 8.5, w: 2.4, spread: 0.3 } },
  7: { ...LOOKS5[5], id: 7, base: 5, evil: true, pal: PAL7, armLen: 27, claw: { n: 3, len: 9.5, w: 2.3, spread: 0.28 } },
};

// ---------------------------------------------------------------------------
// Pose rig
// ---------------------------------------------------------------------------

type Mode = 'stand' | 'run' | 'air' | 'duck' | 'climb' | 'swing' | 'punch' | 'kick';

interface Rig {
  mode: Mode;
  bob: number; lean: number; headTilt: number;
  look: V2; blink: boolean; hurt: boolean; fierce: boolean;
  armF: V2; armB: V2; footF: V2; footB: V2;
  crouch: number; gripY: number; speed: number; airSign: number; reach: number;
  frontal: boolean;
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function armAt(L: Look, side: 1 | -1, th: number, len = L.armLen): V2 {
  return { x: side * L.shoulder.x + Math.sin(th) * len, y: L.shoulder.y + Math.cos(th) * len };
}

function solve(L: Look, p: PlayerState, time: number): Rig {
  const hurt = p.invincibleTimer > 0;
  const blink = !hurt && Math.sin(time * 1.8) > 0.95;
  const speed = clamp(Math.abs(p.vx) / 285, 0, 1.25);
  const running = p.grounded && Math.abs(p.vx) > 10;
  const s = Math.sin(p.walkCycle);
  const c = Math.cos(p.walkCycle);
  const breath = Math.sin(time * 3.2);
  const hx = L.hip.x;

  const base: Rig = {
    mode: 'stand', bob: 0, lean: 0, headTilt: 0, look: { x: 0.6, y: 0 }, blink, hurt, fierce: false,
    armF: armAt(L, 1, 0.1), armB: armAt(L, -1, -0.1),
    footF: { x: hx + 1, y: -L.footRy }, footB: { x: -hx - 1, y: -L.footRy },
    crouch: 0, gripY: L.shoulder.y - L.armLen * 0.92, speed, airSign: 0, reach: 0, frontal: false,
  };
  const r = base;

  if (p.ducking) {
    r.mode = 'duck'; r.crouch = 1; r.bob = 0;
    r.armF = armAt(L, 1, 0.55, L.armLen * 0.7);
    r.armB = armAt(L, -1, -0.55, L.armLen * 0.7);
    r.look = { x: 0.8, y: 0.1 };
    return r;
  }
  if (p.climbing || p.hanging) {
    const cs = Math.sin(time * 8);
    r.mode = 'climb'; r.frontal = true;
    const top = L.shoulder.y - L.armLen * 0.86;
    r.armF = { x: L.shoulder.x + 6, y: top - cs * 7 };
    r.armB = { x: -L.shoulder.x - 6, y: top + cs * 7 };
    r.footF = { x: hx + 1, y: -L.footRy - 2 + cs * 3 };
    r.footB = { x: -hx - 1, y: -L.footRy - 2 - cs * 3 };
    r.look = { x: 0, y: -0.85 };
    r.bob = cs * 0.8;
    return r;
  }
  if (p.isVineSwinging) {
    const sw = Math.sin(time * 6);
    r.mode = 'swing';
    const gy = L.headY - L.headRy - 5;
    r.gripY = gy;
    r.armF = { x: 3.5, y: gy };
    r.armB = { x: -1.5, y: gy - 1 };
    r.footF = { x: hx + 4 + sw * 2, y: -L.footRy - 3 };
    r.footB = { x: -hx + 1 - sw * 2, y: -L.footRy - 5 };
    r.look = { x: 0.7, y: -0.2 };
    return r;
  }

  if (!p.grounded) {
    r.mode = 'air';
    const rising = p.vy < 0;
    r.airSign = rising ? -1 : 1;
    const flutter = Math.sin(time * 18) * 0.12;
    if (p.isDoubleJumping) {
      r.armF = armAt(L, 1, 0.5, L.armLen * 0.55);
      r.armB = armAt(L, -1, -0.5, L.armLen * 0.55);
      r.footF = { x: hx + 3, y: -L.footRy - 5 };
      r.footB = { x: -hx - 3, y: -L.footRy - 5 };
      r.look = { x: 0.6, y: 0 };
    } else if (rising) {
      r.armF = armAt(L, 1, 2.55 + flutter);
      r.armB = armAt(L, -1, -2.6 - flutter);
      r.footF = { x: hx + 4, y: -L.footRy - 5 };
      r.footB = { x: -hx - 2, y: -L.footRy - 7 };
      r.look = { x: 0.6, y: -0.6 };
    } else {
      r.armF = armAt(L, 1, 1.55 + flutter);
      r.armB = armAt(L, -1, -1.55 - flutter);
      r.footF = { x: hx + 2, y: -L.footRy - 1.5 };
      r.footB = { x: -hx - 2, y: -L.footRy - 3.5 };
      r.look = { x: 0.6, y: 0.5 };
    }
    r.lean = clamp(p.vx / 320, -1, 1) * 0.1;
    r.headTilt = rising ? -0.06 : 0.05;
    if (p.kicking) {
      const k = p.swingReach ?? Math.sin(clamp(p.kickTimer / 0.28, 0, 1) * Math.PI);
      const c = p.swingCock ?? 0;
      r.mode = 'kick'; r.reach = k;
      r.footF = { x: hx + 8 + k * 18 - c * 7, y: -12 - k * 8 - c * 9 };
      r.fierce = true;
    }
    if (p.punching) {
      const pr = p.swingReach ?? Math.sin(clamp(p.punchTimer / (p.punchType === 'mega' ? 0.35 : 0.22), 0, 1) * Math.PI);
      const c = p.swingCock ?? 0;
      r.mode = 'punch'; r.reach = pr;
      r.armF = { x: L.shoulder.x + L.armLen * (0.28 - c * 0.38 + pr * 0.42) + pr * (p.punchType === 'mega' ? 24 : 16), y: L.shoulder.y + 2 + c * 3 };
      r.fierce = true;
    }
    return r;
  }

  // grounded
  const lean = clamp(p.vx / 320, -1, 1) * 0.1;
  r.lean = lean;
  if (running) {
    r.mode = 'run';
    const lift = (v: number) => Math.max(0, v) * 5.5;
    r.footF = { x: hx + s * 9, y: -L.footRy - lift(c) };
    r.footB = { x: -hx - s * 9, y: -L.footRy - lift(-c) };
    const v = -s;
    r.armF = armAt(L, 1, v > 0 ? v * 1.0 : v * 0.18 + 0.12);
    r.armB = armAt(L, -1, v > 0 ? -v * 0.6 - 0.2 : -v * 0.55 - 0.2);
    r.bob = Math.abs(Math.sin(p.walkCycle)) * -2.4;
    r.headTilt = lean * 0.5;
  } else {
    r.bob = breath * 0.7;
    r.armF = armAt(L, 1, 0.34 + breath * 0.03);
    r.armB = armAt(L, -1, -0.34 - breath * 0.03);
    r.headTilt = Math.sin(time * 1.3) * 0.035;
    r.look = { x: 0.6 + Math.sin(time * 0.7) * 0.3, y: Math.sin(time * 0.9) * 0.15 };
  }
  if (p.kicking) {
    const k = p.swingReach ?? Math.sin(clamp(p.kickTimer / 0.28, 0, 1) * Math.PI);
    const c = p.swingCock ?? 0;
    r.mode = 'kick'; r.reach = k;
    r.footF = { x: hx + 8 + k * 18 - c * 7, y: -12 - k * 8 - c * 9 };
    r.lean = -0.06 - c * 0.08 + k * 0.04; r.fierce = true;
  }
  if (p.punching) {
    const pr = p.swingReach ?? Math.sin(clamp(p.punchTimer / (p.punchType === 'mega' ? 0.35 : 0.22), 0, 1) * Math.PI);
    const c = p.swingCock ?? 0;
    r.mode = 'punch'; r.reach = pr;
    r.armF = { x: L.shoulder.x + L.armLen * (0.28 - c * 0.38 + pr * 0.42) + pr * (p.punchType === 'mega' ? 24 : 16), y: L.shoulder.y + 2 + c * 3 };
    r.armB = armAt(L, -1, -0.9);
    r.lean = 0.1 + pr * 0.08 - c * 0.14; r.fierce = true;
  }
  return r;
}

// ---------------------------------------------------------------------------
// Drawing primitives
// ---------------------------------------------------------------------------

/** Fluffy closed outline: pointed tufts that sweep downward, joined by short valleys. Seeded, so it never flickers. */
function furPath(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, rot: number, n: number, depth: number, seed: number) {
  const r = rng(seed);
  const m = Math.max(rx, ry);
  const cr = Math.cos(rot), sr = Math.sin(rot);
  const T = (a: number, k: number): V2 => {
    const px = Math.cos(a) * rx * k, py = Math.sin(a) * ry * k;
    return { x: x + px * cr - py * sr, y: y + px * sr + py * cr };
  };
  ctx.beginPath();
  const v0 = T(-0.5 * (TAU / n), 1 - (depth / m) * 0.55);
  ctx.moveTo(v0.x, v0.y);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + (r() - 0.5) * 0.5 * (TAU / n);
    const sweep = Math.sin(a) > -0.2 ? 0.07 : 0.0; // tufts lean toward the ground
    const tip = T(a + sweep * (TAU / n) * 6, 1 + (depth / m) * 1.2 * (0.3 + r() * 1.3));
    const valley = T(a + (0.5 * TAU) / n, 1 - (depth / m) * 0.55);
    ctx.quadraticCurveTo(tip.x, tip.y, valley.x, valley.y);
  }
  ctx.closePath();
  ctx.lineJoin = 'round';
}

function ell(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, rot = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, TAU);
}

function fillStroke(ctx: CanvasRenderingContext2D, fill: string | CanvasGradient, ol: number, olc: string) {
  ctx.fillStyle = fill;
  ctx.fill();
  if (ol > 0) {
    ctx.lineWidth = ol;
    ctx.strokeStyle = olc;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
}

/** short curved hair strokes */
function hair(ctx: CanvasRenderingContext2D, strokes: Array<[number, number, number, number, number?]>, col: string, w: number) {
  ctx.strokeStyle = col;
  ctx.lineWidth = w;
  ctx.lineCap = 'round';
  ctx.beginPath();
  strokes.forEach(([x1, y1, x2, y2, bend = 0]) => {
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo((x1 + x2) / 2 + bend, (y1 + y2) / 2, x2, y2);
  });
  ctx.stroke();
}

/** Round-ended tapered limb with outline, soft light pass and fur strands. */
function limb(
  ctx: CanvasRenderingContext2D, a: V2, b: V2, bend: number, w0: number, w1: number,
  fill: string, light: string, ol: number, olc: string, out: 1 | -1, strand?: string, seed = 1,
) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  let px = dy / len, py = -dx / len;
  if (px * out < 0) { px = -px; py = -py; }
  const cx = (a.x + b.x) / 2 + px * bend, cy = (a.y + b.y) / 2 + py * bend;
  const N = 16;
  const pts: Array<V2 & { r: number }> = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, u = 1 - t;
    pts.push({
      x: u * u * a.x + 2 * u * t * cx + t * t * b.x,
      y: u * u * a.y + 2 * u * t * cy + t * t * b.y,
      r: (w0 + (w1 - w0) * t) / 2,
    });
  }
  const dots = (grow: number, ox = 0, oy = 0, k = 1) => {
    ctx.beginPath();
    pts.forEach((q) => { const rr = q.r * k + grow; ctx.moveTo(q.x + ox + rr, q.y + oy); ctx.arc(q.x + ox, q.y + oy, rr, 0, TAU); });
  };
  if (ol > 0) { dots(ol * 0.5 + 0.2); ctx.fillStyle = olc; ctx.fill(); }
  dots(0); ctx.fillStyle = fill; ctx.fill();
  ctx.save();
  dots(0); ctx.clip();
  dots(0, -0.9 * out, -1, 0.6); ctx.fillStyle = light; ctx.globalAlpha = 0.4; ctx.fill();
  ctx.globalAlpha = 1;
  if (strand) {
    const r = rng(seed);
    ctx.strokeStyle = strand; ctx.lineWidth = 0.8; ctx.lineCap = 'round'; ctx.globalAlpha = 0.4;
    ctx.beginPath();
    for (let i = 2; i < N; i += 2) {
      const q = pts[i], q2 = pts[Math.min(N, i + 1)];
      const ux = q2.x - q.x, uy = q2.y - q.y; const ul = Math.hypot(ux, uy) || 1;
      const sd = r() > 0.5 ? 1 : -1;
      const bx = q.x + px * sd * q.r * 0.7, by = q.y + py * sd * q.r * 0.7;
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + (ux / ul) * 3.4 - px * sd * 1.1, by + (uy / ul) * 3.4 - py * sd * 1.1);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function claws(ctx: CanvasRenderingContext2D, L: Look, x: number, y: number, ang: number, scale = 1) {
  const { n, len, w, spread } = L.claw;
  const pal = L.pal;
  for (let i = 0; i < n; i++) {
    const a = ang + (i - (n - 1) / 2) * spread;
    const ca = Math.cos(a), sa = Math.sin(a);
    const l = len * scale * (i === 1 ? 1 : 0.88);
    const bx = x + ca * 1.2, by = y + sa * 1.2;
    const nx = -sa, ny = ca;
    const tx = bx + ca * l + nx * l * 0.12, ty = by + sa * l + ny * l * 0.12;
    ctx.beginPath();
    ctx.moveTo(bx - nx * w / 2, by - ny * w / 2);
    ctx.quadraticCurveTo(bx + ca * l * 0.6 + nx * l * 0.2 - nx * w * 0.3, by + sa * l * 0.6 + ny * l * 0.2 - ny * w * 0.3, tx, ty);
    ctx.quadraticCurveTo(bx + ca * l * 0.5 + nx * l * 0.06 + nx * w * 0.3, by + sa * l * 0.5 + ny * l * 0.06 + ny * w * 0.3, bx + nx * w / 2, by + ny * w / 2);
    ctx.closePath();
    ctx.fillStyle = pal.claw;
    ctx.fill();
    ctx.lineWidth = L.ol > 0 ? 1.1 : 0.8;
    ctx.strokeStyle = pal.clawEdge;
    ctx.stroke();
  }
}

interface EyeOpts { glowCol?: string; lx: number; ly: number; blink: boolean; hurt: boolean; iris: string; irisDark: string; sclera?: boolean; glow?: boolean; lash?: boolean }

function eye(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, o: EyeOpts) {
  if (o.hurt) {
    ctx.strokeStyle = '#2a170a'; ctx.lineWidth = Math.max(1.6, rx * 0.5); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - rx * 0.9, y - ry * 0.5); ctx.lineTo(x + rx * 0.7, y); ctx.lineTo(x - rx * 0.9, y + ry * 0.5); ctx.stroke();
    return;
  }
  if (o.blink) {
    ctx.strokeStyle = '#2a170a'; ctx.lineWidth = Math.max(1.5, rx * 0.5); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(x, y - ry * 0.2, rx * 0.95, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    return;
  }
  if (o.glow) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, rx * 2.4);
    const gc = o.glowCol ?? '255,196,90';
    g.addColorStop(0, `rgba(${gc},0.5)`); g.addColorStop(1, `rgba(${gc},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rx * 2.4, 0, TAU); ctx.fill();
  }
  if (o.sclera) { ell(ctx, x, y, rx * 1.12, ry * 1.1); ctx.fillStyle = '#fffaf0'; ctx.fill(); }
  const ix = x + o.lx * rx * 0.22, iy = y + o.ly * ry * 0.22;
  const g = ctx.createRadialGradient(ix, iy - ry * 0.2, rx * 0.1, ix, iy, ry * 1.05);
  g.addColorStop(0, o.iris); g.addColorStop(0.55, o.irisDark); g.addColorStop(1, '#0a0503');
  ell(ctx, ix, iy, rx, ry); ctx.fillStyle = g; ctx.fill();
  // lower rim light
  ctx.strokeStyle = 'rgba(255,230,190,0.28)'; ctx.lineWidth = Math.max(0.8, rx * 0.2);
  ctx.beginPath(); ctx.ellipse(ix, iy, rx * 0.78, ry * 0.78, 0, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
  // catchlights
  ctx.fillStyle = '#fff';
  ell(ctx, ix - rx * 0.34, iy - ry * 0.36, rx * 0.34, ry * 0.32); ctx.fill();
  ell(ctx, ix + rx * 0.38, iy + ry * 0.34, rx * 0.16, ry * 0.15); ctx.fill();
}

// ---------------------------------------------------------------------------
// Face (shared by every variant, tuned per variant)
// ---------------------------------------------------------------------------

interface Face {
  edgeN: number; edgeDepth: number; edgeSeed: number; edgeLine: string | null;
  maskRx: number; maskRy: number; maskY: number; maskFur: number;
  patchDx: number; patchY: number; patchRx: number; patchRy: number; patchRot: number; patchCol: string; patchTail: boolean;
  eyeDx: number; eyeY: number; eyeRx: number; eyeRy: number; iris: string; irisDark: string; sclera: boolean; glow: boolean;
  noseY: number; noseW: number; noseH: number; mouthY: number; mouthW: number; blushDx: number; blushY: number;
  brows: boolean; smirk: number;
}

const FACES5: Record<1 | 2 | 3 | 4 | 5, Face> = {
  1: {
    edgeN: 34, edgeDepth: 1.9, edgeSeed: 11, edgeLine: 'rgba(92,56,28,0.38)',
    maskRx: 17.2, maskRy: 13.6, maskY: 2.4, maskFur: 1.4,
    patchDx: 8.2, patchY: -0.8, patchRx: 5.0, patchRy: 6.9, patchRot: 0.34, patchCol: 'rgba(120,76,44,0.82)', patchTail: false,
    eyeDx: 8.0, eyeY: -1.0, eyeRx: 3.3, eyeRy: 3.9, iris: '#7b4a26', irisDark: '#26130a', sclera: false, glow: false,
    noseY: 5.6, noseW: 3.5, noseH: 2.7, mouthY: 9.6, mouthW: 5.2, blushDx: 12.2, blushY: 7.6,
    brows: false, smirk: 0,
  },
  2: {
    edgeN: 14, edgeDepth: 1.6, edgeSeed: 21, edgeLine: null,
    maskRx: 16.6, maskRy: 12.6, maskY: 2.6, maskFur: 0,
    patchDx: 8.6, patchY: -0.6, patchRx: 6.5, patchRy: 6.1, patchRot: 0.28, patchCol: '#d3913a', patchTail: false,
    eyeDx: 8.6, eyeY: -0.6, eyeRx: 3.1, eyeRy: 3.4, iris: '#2b1a10', irisDark: '#0b0603', sclera: false, glow: false,
    noseY: 5.7, noseW: 3.9, noseH: 2.8, mouthY: 9.8, mouthW: 5.6, blushDx: 13.5, blushY: 7.8,
    brows: false, smirk: 0,
  },
  3: {
    edgeN: 40, edgeDepth: 1.9, edgeSeed: 31, edgeLine: 'rgba(120,78,40,0.32)',
    maskRx: 21.2, maskRy: 16.8, maskY: 2.2, maskFur: 1.8,
    patchDx: 10.6, patchY: -0.4, patchRx: 6.6, patchRy: 8.0, patchRot: 0.3, patchCol: 'rgba(143,93,51,0.85)', patchTail: false,
    eyeDx: 10.4, eyeY: -0.2, eyeRx: 5.4, eyeRy: 6.4, iris: '#8a5530', irisDark: '#2a160a', sclera: false, glow: false,
    noseY: 8.0, noseW: 3.0, noseH: 2.3, mouthY: 11.6, mouthW: 4.2, blushDx: 15.6, blushY: 9.0,
    brows: false, smirk: 0,
  },
  4: {
    edgeN: 28, edgeDepth: 1.5, edgeSeed: 41, edgeLine: 'rgba(80,48,24,0.5)',
    maskRx: 14.8, maskRy: 11.6, maskY: 2.2, maskFur: 1.0,
    patchDx: 7.0, patchY: -0.8, patchRx: 4.6, patchRy: 5.6, patchRot: 0.36, patchCol: 'rgba(109,68,38,0.95)', patchTail: true,
    eyeDx: 7.0, eyeY: -0.8, eyeRx: 3.0, eyeRy: 3.5, iris: '#8a5a30', irisDark: '#2a160a', sclera: false, glow: false,
    noseY: 4.8, noseW: 3.1, noseH: 2.4, mouthY: 8.6, mouthW: 5.0, blushDx: 11, blushY: 6.8,
    brows: true, smirk: 1.6,
  },
  5: {
    edgeN: 40, edgeDepth: 2.3, edgeSeed: 51, edgeLine: 'rgba(30,16,6,0.5)',
    maskRx: 15.6, maskRy: 12.2, maskY: 2.4, maskFur: 1.6,
    patchDx: 7.6, patchY: -0.6, patchRx: 4.9, patchRy: 6.4, patchRot: 0.4, patchCol: 'rgba(40,24,12,0.95)', patchTail: true,
    eyeDx: 7.6, eyeY: -0.6, eyeRx: 3.2, eyeRy: 3.8, iris: '#ffc04d', irisDark: '#b8641a', sclera: false, glow: true,
    noseY: 5.2, noseW: 3.3, noseH: 2.5, mouthY: 9.2, mouthW: 4.8, blushDx: 12, blushY: 7.2,
    brows: false, smirk: 0.6,
  },
};

const FACES: Record<MiloVariant, Face> = {
  ...FACES5,
  6: { ...FACES5[2], patchCol: '#3d1420', iris: '#ff6a2e', irisDark: '#a3120a', glow: true, brows: true, smirk: 2.4, edgeSeed: 61 },
  7: { ...FACES5[5], patchCol: 'rgba(20,8,14,0.96)', iris: '#ff4d6a', irisDark: '#8f0a2c', glow: true, brows: true, smirk: 2.2, edgeSeed: 71 },
};

function drawHead(ctx: CanvasRenderingContext2D, L: Look, rig: Rig, time: number) {
  const F = FACES[L.id];
  const pal = L.pal;
  const rx = L.headRx, ry = L.headRy;
  const bold = L.ol >= 2;

  // --- ears / hair behind the head
  if (L.evil && L.base === 5) {
    // curved bark horns
    [-1, 1].forEach((d) => {
      ctx.beginPath();
      ctx.moveTo(d * 6, -ry + 3);
      ctx.bezierCurveTo(d * 11, -ry - 4, d * 17, -ry - 6, d * 21, -ry - 15);
      ctx.bezierCurveTo(d * 14, -ry - 7, d * 9, -ry - 3, d * 13, -ry + 3);
      ctx.closePath();
      const hgr = ctx.createLinearGradient(d * 6, -ry, d * 21, -ry - 15);
      hgr.addColorStop(0, '#3a2430'); hgr.addColorStop(1, '#b89a86');
      ctx.fillStyle = hgr; ctx.fill();
      ctx.strokeStyle = '#120810'; ctx.lineWidth = 1.2; ctx.stroke();
      hair(ctx, [[d * 9, -ry - 1, d * 13, -ry - 5, 0], [d * 12, -ry - 5, d * 16, -ry - 9, 0]], 'rgba(255,255,255,0.18)', 1);
    });
  }

  // --- fur head
  const hg = ctx.createRadialGradient(-rx * 0.28, -ry * 0.5, 2, 0, 0, Math.max(rx, ry) * 1.15);
  hg.addColorStop(0, pal.light); hg.addColorStop(0.62, pal.base); hg.addColorStop(1, pal.dark);
  if (bold) {
    // bold graphic head: smooth ellipse with side tufts
    [-1, 1].forEach((d) => {
      ctx.beginPath();
      ctx.moveTo(d * (rx - 2), -4);
      ctx.lineTo(d * (rx + 4.6), 1);
      ctx.lineTo(d * (rx - 0.5), 4.4);
      ctx.lineTo(d * (rx + 3.2), 8);
      ctx.lineTo(d * (rx - 4), 9.5);
      ctx.closePath();
      fillStroke(ctx, pal.base, L.ol, pal.ol);
    });
    ell(ctx, 0, 0, rx, ry);
    fillStroke(ctx, hg, L.ol, pal.ol);
  } else {
    furPath(ctx, 0, 0, rx, ry, 0, F.edgeN, F.edgeDepth, F.edgeSeed);
    ctx.fillStyle = hg; ctx.fill();
    if (F.edgeLine) { ctx.strokeStyle = F.edgeLine; ctx.lineWidth = 1.1; ctx.stroke(); }
  }

  // crown shading + strands
  ctx.save();
  ell(ctx, 0, 0, rx, ry); ctx.clip();
  ctx.fillStyle = 'rgba(255,236,190,0.35)';
  ell(ctx, -3, -ry + 3, rx * 0.55, 3.6, -0.1); ctx.fill();
  const gr = rng(F.edgeSeed + 9);
  const wx = -2, wy = -ry * 0.5;
  const strands: Array<[number, number, number, number, number]> = [];
  for (let i = 0; i < 13; i++) {
    const a = -Math.PI + 0.25 + (i / 12) * (Math.PI - 0.5) + (gr() - 0.5) * 0.12;
    const r0 = 0.22 + gr() * 0.12, r1 = 0.62 + gr() * 0.22;
    strands.push([wx + Math.cos(a) * rx * r0, wy + Math.sin(a) * ry * r0, wx + Math.cos(a) * rx * r1, wy + Math.sin(a) * ry * r1, Math.cos(a) * 1.2]);
  }
  hair(ctx, strands, 'rgba(70,38,18,0.22)', 1.0);
  ctx.restore();

  // --- face (shifts a touch toward where he looks)
  ctx.save();
  ctx.translate(rig.look.x * 1.8, 0);

  // cream mask
  const mg = ctx.createRadialGradient(0, F.maskY - 2, 2, 0, F.maskY, F.maskRx);
  mg.addColorStop(0, pal.cream); mg.addColorStop(1, pal.creamDark);
  if (F.maskFur > 0) furPath(ctx, 0, F.maskY, F.maskRx, F.maskRy, 0, 34, F.maskFur * 0.7, F.edgeSeed + 3);
  else ell(ctx, 0, F.maskY, F.maskRx, F.maskRy);
  ctx.fillStyle = mg; ctx.fill();
  if (bold) { ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(122,78,30,0.55)'; ctx.stroke(); }

  // eye patches
  [-1, 1].forEach((d) => {
    ell(ctx, d * F.patchDx, F.patchY, F.patchRx, F.patchRy, d * F.patchRot);
    ctx.fillStyle = F.patchCol; ctx.fill();
    if (F.patchTail) {
      ctx.beginPath();
      ctx.moveTo(d * (F.patchDx + F.patchRx * 0.3), F.patchY + F.patchRy * 0.5);
      ctx.quadraticCurveTo(d * (F.patchDx + F.patchRx * 1.1), F.patchY + F.patchRy * 1.0, d * (F.patchDx + F.patchRx * 1.35), F.patchY + F.patchRy * 1.9);
      ctx.quadraticCurveTo(d * (F.patchDx + F.patchRx * 0.5), F.patchY + F.patchRy * 1.35, d * (F.patchDx - F.patchRx * 0.3), F.patchY + F.patchRy * 0.7);
      ctx.closePath(); ctx.fill();
    }
  });

  // eyes
  const eo: EyeOpts = { lx: rig.look.x, ly: rig.look.y, blink: rig.blink, hurt: rig.hurt, iris: F.iris, irisDark: F.irisDark, sclera: F.sclera, glow: F.glow, glowCol: L.evil ? '255,60,60' : undefined };
  [-1, 1].forEach((d) => eye(ctx, d * F.eyeDx, F.eyeY, F.eyeRx, F.eyeRy, eo));

  // brows
  const furrow = (rig.fierce || L.evil) && !rig.hurt;
  if (F.brows || furrow) {
    ctx.strokeStyle = L.base === 5 ? '#2a170a' : pal.deep; ctx.lineWidth = furrow ? 2.1 : 1.7; ctx.lineCap = 'round';
    ctx.beginPath();
    [-1, 1].forEach((d) => {
      const bx = d * F.eyeDx, by = F.eyeY - F.eyeRy - 2.6;
      if (furrow) { ctx.moveTo(bx + d * F.eyeRx * 1.2, by - 1.6); ctx.lineTo(bx - d * F.eyeRx * 0.8, by + 1.2); }
      else { ctx.moveTo(bx - F.eyeRx * 1.0, by + (d < 0 ? 0.8 : 0)); ctx.quadraticCurveTo(bx, by - 1.8, bx + F.eyeRx * 1.1, by + (d < 0 ? -0.4 : 0.8)); }
    });
    ctx.stroke();
  }

  // nose
  ctx.fillStyle = pal.nose;
  ctx.beginPath();
  ctx.moveTo(-F.noseW, F.noseY - F.noseH * 0.3);
  ctx.quadraticCurveTo(0, F.noseY - F.noseH * 1.25, F.noseW, F.noseY - F.noseH * 0.3);
  ctx.quadraticCurveTo(F.noseW * 0.7, F.noseY + F.noseH, 0, F.noseY + F.noseH);
  ctx.quadraticCurveTo(-F.noseW * 0.7, F.noseY + F.noseH, -F.noseW, F.noseY - F.noseH * 0.3);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ell(ctx, -F.noseW * 0.38, F.noseY - F.noseH * 0.45, F.noseW * 0.3, F.noseH * 0.28); ctx.fill();

  // mouth
  ctx.strokeStyle = bold ? pal.ol : '#5a3a22'; ctx.lineWidth = bold ? 1.7 : 1.5; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, F.noseY + F.noseH); ctx.lineTo(0, F.mouthY - 1.4);
  ctx.stroke();
  if (rig.hurt) {
    ell(ctx, 0, F.mouthY + 1.5, 2.3, 2.9); ctx.fillStyle = '#6b2020'; ctx.fill();
  } else if (rig.fierce) {
    ell(ctx, 0, F.mouthY + 0.6, F.mouthW * 0.62, 3.0); ctx.fillStyle = '#7a2a2a'; ctx.fill();
    ctx.strokeStyle = bold ? pal.ol : '#5a3a22'; ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(-F.mouthW, F.mouthY - F.smirk * 0.2);
    ctx.quadraticCurveTo(-F.mouthW * 0.45, F.mouthY + 3.4, 0, F.mouthY - 0.5);
    ctx.quadraticCurveTo(F.mouthW * 0.45, F.mouthY + 3.4, F.mouthW, F.mouthY - F.smirk * 0.9);
    ctx.stroke();
  }

  // cheeks
  ctx.fillStyle = pal.blush;
  [-1, 1].forEach((d) => { ell(ctx, d * F.blushDx, F.blushY, L.base === 3 ? 4.2 : 3.2, L.base === 3 ? 2.8 : 2.1); ctx.fill(); });

  if (L.evil && !rig.hurt) {
    // fangs
    ctx.fillStyle = '#fff6e6'; ctx.strokeStyle = L.pal.ol; ctx.lineWidth = 0.9;
    [-1, 1].forEach((d) => {
      const fx = d * F.mouthW * 0.5, fy = F.mouthY + (rig.fierce ? 0.2 : 1.3);
      ctx.beginPath(); ctx.moveTo(fx - 1.5, fy); ctx.lineTo(fx + 1.5, fy); ctx.lineTo(fx, fy + 3.4); ctx.closePath(); ctx.fill(); ctx.stroke();
    });
  }
  if (L.evil && L.base === 2) {
    // old scar across the left eye
    ctx.strokeStyle = '#e9dcc4'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-13.2, -8.5); ctx.lineTo(-4.2, 6.4); ctx.stroke();
    ctx.strokeStyle = '#7a2a30'; ctx.lineWidth = 0.9; ctx.stroke();
    ctx.strokeStyle = '#e9dcc4'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-11.6, -4.2); ctx.lineTo(-9.2, -5.6); ctx.moveTo(-9.8, -0.4); ctx.lineTo(-7.2, -1.8); ctx.moveTo(-8, 3); ctx.lineTo(-5.6, 1.8); ctx.stroke();
  }

  // variant extras that live on the face
  if (L.base === 5) {
    // glowing forest markings
    const pulse = 0.65 + Math.sin(time * 3) * 0.25;
    ctx.save();
    ctx.shadowColor = L.evil ? 'rgba(255,40,80,0.95)' : 'rgba(80,255,150,0.9)'; ctx.shadowBlur = 6 * pulse;
    ctx.strokeStyle = L.evil ? `rgba(255,70,100,${0.85 * pulse + 0.1})` : `rgba(110,255,170,${0.85 * pulse + 0.1})`; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
    ctx.beginPath();
    [-1, 1].forEach((d) => {
      ctx.moveTo(d * 12.8, 5.2); ctx.quadraticCurveTo(d * 15.4, 8.2, d * 13.4, 11.6);
      ctx.moveTo(d * 10.2, 7.2); ctx.quadraticCurveTo(d * 12.2, 9.4, d * 10.6, 11.6);
    });
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  if (L.base === 3) {
    // little sprout on top that wobbles with the head
    const sw = Math.sin(time * 4) * 2;
    ctx.save();
    ctx.translate(2, -ry + 1.5);
    ctx.strokeStyle = '#3f8f3f'; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 1); ctx.quadraticCurveTo(1 + sw * 0.3, -5, 2 + sw, -8); ctx.stroke();
    [[-1, '#5fd16b'], [1, '#43b455']].forEach(([d, col]) => {
      ctx.save();
      ctx.translate(2 + sw, -8);
      ctx.rotate((d as number) * 0.8 + sw * 0.05);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo((d as number) * 3.8, -6, (d as number) * 7.2, -2.6); ctx.quadraticCurveTo((d as number) * 3.4, 1.6, 0, 0);
      ctx.fillStyle = col as string; ctx.fill();
      ctx.restore();
    });
    ctx.restore();
  }
}

// ---------------------------------------------------------------------------
// Torsos
// ---------------------------------------------------------------------------

function drawTorso(ctx: CanvasRenderingContext2D, L: Look, rig: Rig, time: number) {
  const pal = L.pal;
  const lg = (y0: number, y1: number, ...stops: Array<[number, string]>) => {
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    stops.forEach(([o, c]) => g.addColorStop(o, c));
    return g;
  };

  if (L.base === 1) {
    furPath(ctx, 0, -23, 16.8, 19.5, 0, 24, 2.3, 7);
    ctx.fillStyle = lg(-43, -3, [0, pal.light], [0.45, pal.base], [1, pal.dark]); ctx.fill();
    ctx.strokeStyle = 'rgba(92,56,28,0.35)'; ctx.lineWidth = 1.1; ctx.stroke();
    // belly
    furPath(ctx, 0, -19, 10.8, 13.4, 0, 20, 1.6, 8);
    ctx.fillStyle = lg(-33, -6, [0, '#f1dcb6'], [1, '#dcbf90']); ctx.fill();
    hair(ctx, [[-4, -28, -6, -24, -1], [4, -28, 6, -24, 1], [-5, -20, -7, -16, -1], [5, -20, 7, -16, 1], [-2, -14, -3, -10], [2, -14, 3, -10], [0, -25, 0, -21]], 'rgba(150,105,60,0.34)', 1.1);
    hair(ctx, [[-14, -34, -15, -28, -1.5], [-15.2, -25, -15, -19, -1.5], [14, -34, 15, -28, 1.5], [15.2, -25, 15, -19, 1.5]], 'rgba(90,55,28,0.25)', 1.1);
    return;
  }

  if (L.base === 2) {
    const body = () => {
      ctx.beginPath();
      ctx.moveTo(-12, -42);
      ctx.bezierCurveTo(-18.5, -38, -19.5, -22, -15.5, -10);
      ctx.quadraticCurveTo(-13.5, -4.5, -6, -4.5);
      ctx.lineTo(6, -4.5);
      ctx.quadraticCurveTo(13.5, -4.5, 15.5, -10);
      ctx.bezierCurveTo(19.5, -22, 18.5, -38, 12, -42);
      ctx.closePath();
    };
    body();
    fillStroke(ctx, lg(-42, -4, [0, pal.light], [1, pal.base]), L.ol, pal.ol);
    // cel shadow on the right
    ctx.save(); body(); ctx.clip();
    ctx.fillStyle = 'rgba(45,22,6,0.3)';
    ell(ctx, 16, -24, 9.5, 24); ctx.fill();
    ctx.restore();
    // cream chest with V neck
    ctx.beginPath();
    ctx.moveTo(-8.5, -41);
    ctx.lineTo(-4, -33.5); ctx.lineTo(0, -37); ctx.lineTo(4, -33.5); ctx.lineTo(8.5, -41);
    ctx.bezierCurveTo(14.5, -32, 13.5, -14, 0, -7);
    ctx.bezierCurveTo(-13.5, -14, -14.5, -32, -8.5, -41);
    ctx.closePath();
    fillStroke(ctx, lg(-40, -6, [0, L.evil ? '#d9c6a2' : '#f0c98c'], [1, pal.creamDark]), 1.5, '#8a5a24');
    hair(ctx, [[-5, -27, -8, -19, -1], [0, -25, 0, -16], [5, -27, 8, -19, 1]], 'rgba(160,100,40,0.7)', 1.5);
    return;
  }

  if (L.base === 3) {
    furPath(ctx, 0, -14.5, 13.8, 13.6, 0, 22, 2.1, 17);
    ctx.fillStyle = lg(-29, -1, [0, pal.light], [1, pal.base]); ctx.fill();
    ctx.strokeStyle = 'rgba(120,78,40,0.3)'; ctx.lineWidth = 1; ctx.stroke();
    furPath(ctx, 0, -13, 9, 9.4, 0, 16, 1.3, 18);
    ctx.fillStyle = pal.cream; ctx.fill();
    hair(ctx, [[-3, -18, -4, -12, -1], [3, -18, 4, -12, 1]], 'rgba(190,140,90,0.45)', 1.1);
    return;
  }

  if (L.base === 4) {
    furPath(ctx, 0, -27, 13.8, 20.5, 0, 22, 1.9, 27);
    ctx.fillStyle = lg(-48, -6, [0, pal.light], [0.5, pal.base], [1, pal.dark]); ctx.fill();
    ctx.strokeStyle = 'rgba(80,48,24,0.55)'; ctx.lineWidth = 1.2; ctx.stroke();
    furPath(ctx, 0, -27, 8.4, 12.5, 0, 16, 1.4, 28);
    ctx.fillStyle = lg(-40, -14, [0, '#f1dcb4'], [1, '#dcc08f']); ctx.fill();
    hair(ctx, [[-3, -33, -4, -26, -1], [3, -33, 4, -26, 1], [0, -30, 0, -22]], 'rgba(150,105,60,0.5)', 1.2);
    // satchel strap across the chest + pouch on the hip
    ctx.save();
    ctx.lineCap = 'butt';
    ctx.strokeStyle = '#5f3b1a'; ctx.lineWidth = 6.2;
    ctx.beginPath(); ctx.moveTo(-11, -45); ctx.quadraticCurveTo(0, -31, 11.5, -17); ctx.stroke();
    ctx.strokeStyle = '#a8713a'; ctx.lineWidth = 4.4;
    ctx.beginPath(); ctx.moveTo(-11, -45); ctx.quadraticCurveTo(0, -31, 11.5, -17); ctx.stroke();
    ctx.setLineDash([2.2, 2.6]); ctx.strokeStyle = 'rgba(255,224,170,0.65)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-11, -45); ctx.quadraticCurveTo(0, -31, 11.5, -17); ctx.stroke();
    ctx.restore();
    // pouch
    ctx.beginPath();
    ctx.roundRect(7.5, -20, 13, 11.5, 2.6);
    fillStroke(ctx, '#8a5a2a', 1.3, '#4a2c12');
    ctx.beginPath();
    ctx.moveTo(7.5, -20); ctx.lineTo(20.5, -20); ctx.lineTo(20.5, -15.6); ctx.quadraticCurveTo(14, -12.6, 7.5, -15.6); ctx.closePath();
    fillStroke(ctx, '#b57d43', 1.3, '#4a2c12');
    ell(ctx, 14, -14.4, 1.7, 1.7); ctx.fillStyle = '#f1c64d'; ctx.fill();
    return;
  }

  // 5: Guardian
  furPath(ctx, 0, -25, 15.8, 20.5, 0, 30, 2.9, 57);
  ctx.fillStyle = lg(-46, -4, [0, pal.light], [0.5, pal.base], [1, pal.dark]); ctx.fill();
  // rim light on the lit side
  ctx.save();
  furPath(ctx, 0, -25, 15.8, 20.5, 0, 30, 2.9, 57); ctx.clip();
  ctx.strokeStyle = 'rgba(255,214,130,0.55)'; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.ellipse(1.2, -25.5, 15.8, 20.5, 0, Math.PI * 1.05, Math.PI * 1.62); ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = 'rgba(30,16,6,0.45)'; ctx.lineWidth = 1.1; furPath(ctx, 0, -25, 15.8, 20.5, 0, 30, 2.9, 57); ctx.stroke();
  furPath(ctx, 0, -22, 10, 14, 0, 22, 1.8, 58);
  ctx.fillStyle = lg(-37, -8, [0, '#e0bd86'], [1, '#b98c58']); ctx.fill();
  hair(ctx, [[-5, -31, -7, -23, -1], [0, -29, 0, -20], [5, -31, 7, -23, 1], [-8, -22, -9, -14, -1], [8, -22, 9, -14, 1]], 'rgba(110,70,34,0.5)', 1.3);
  // glowing leaf pendant
  const pulse = 0.7 + Math.sin(time * 3) * 0.25;
  ctx.save();
  ctx.shadowColor = L.evil ? 'rgba(255,40,80,0.95)' : 'rgba(90,255,160,0.95)'; ctx.shadowBlur = 8 * pulse;
  ctx.beginPath();
  ctx.moveTo(0, -31); ctx.quadraticCurveTo(5.4, -26, 0, -19); ctx.quadraticCurveTo(-5.4, -26, 0, -31);
  ctx.fillStyle = L.evil ? `rgba(255,70,100,${0.7 + 0.25 * pulse})` : `rgba(110,255,170,${0.7 + 0.25 * pulse})`; ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(20,90,50,0.9)'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(0, -20.5); ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Back / front accessories
// ---------------------------------------------------------------------------

function drawBack(ctx: CanvasRenderingContext2D, L: Look, rig: Rig, time: number) {
  if (L.base === 4) {
    if (rig.frontal) return;
    // backpack with bedroll
    ctx.beginPath();
    ctx.roundRect(-21, -42, 13, 25, 4);
    fillStroke(ctx, '#5f7d3a', 1.4, '#2f431a');
    ctx.beginPath();
    ctx.roundRect(-21, -42, 13, 9, 4);
    fillStroke(ctx, '#7a9a4a', 1.2, '#2f431a');
    // bedroll on top
    ctx.beginPath();
    ctx.roundRect(-23, -48, 17, 7, 3.4);
    fillStroke(ctx, '#e6c98f', 1.3, '#8a6a30');
    hair(ctx, [[-17, -48, -17, -41.5]], '#b08a48', 1);
    // buckle
    ell(ctx, -14.5, -30, 1.4, 1.4); ctx.fillStyle = '#f1c64d'; ctx.fill();
  }
}

function drawFront(ctx: CanvasRenderingContext2D, L: Look, rig: Rig, time: number) {
  if (L.base === 5) {
    // collar of broad jungle leaves
    const leaf = (x: number, y: number, rot: number, len: number, wid: number, c1: string, c2: string) => {
      ctx.save();
      ctx.translate(x, y); ctx.rotate(rot);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(wid, -len * 0.3, wid * 0.9, -len * 0.8, 0, -len);
      ctx.bezierCurveTo(-wid * 0.9, -len * 0.8, -wid, -len * 0.3, 0, 0);
      const g = ctx.createLinearGradient(-wid, 0, wid, -len);
      g.addColorStop(0, c1); g.addColorStop(1, c2);
      ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = 'rgba(15,70,40,0.55)'; ctx.lineWidth = 0.8; ctx.stroke();
      ctx.strokeStyle = 'rgba(200,255,200,0.5)'; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(0, -1); ctx.lineTo(0, -len * 0.86); ctx.stroke();
      ctx.restore();
    };
    const sway = Math.sin(time * 2.4) * 0.05;
    const cy = L.shoulder.y + 1.5;
    const ev = L.evil;
    const c = ev
      ? [['#4a2a36', '#8a5a52'], ['#3c2230', '#74483f'], ['#52303a', '#94624f']]
      : [['#2f9a55', '#7be39b'], ['#237f46', '#5fcf86'], ['#2a8e4f', '#6bd88f']];
    leaf(-11, cy, -1.9 + sway, 11, 5.2, c[0][0], c[0][1]);
    leaf(11, cy, 1.9 - sway, 11, 5.2, c[0][0], c[0][1]);
    leaf(-6, cy + 2.5, -2.55 - sway, 9, 4.4, c[1][0], c[1][1]);
    leaf(6, cy + 2.5, 2.55 + sway, 9, 4.4, c[1][0], c[1][1]);
    leaf(0, cy + 4, 3.14, 8.5, 4.2, c[2][0], c[2][1]);
    if (ev) {
      // thorns along the collar
      ctx.fillStyle = '#d9c3ae'; ctx.strokeStyle = '#120810'; ctx.lineWidth = 0.8;
      for (const i of [-3, -2, 2, 3]) {
        const tx = i * 5.2, ty = cy + 3 + Math.abs(i) * 0.6;
        ctx.beginPath(); ctx.moveTo(tx - 1.8, ty); ctx.lineTo(tx + 1.8, ty); ctx.lineTo(tx + Math.sign(i) * 2.4, ty - 6); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
    }
    // fireflies
    for (let i = 0; i < 3; i++) {
      const a = time * (1.2 + i * 0.4) + i * 2.1;
      const fx = Math.cos(a) * (24 + i * 3), fy = L.bodyY - 6 + Math.sin(a * 1.3) * 18;
      const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, 4);
      g.addColorStop(0, L.evil ? 'rgba(255,120,150,0.95)' : 'rgba(210,255,170,0.95)'); g.addColorStop(1, L.evil ? 'rgba(255,120,150,0)' : 'rgba(210,255,170,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(fx, fy, 4, 0, TAU); ctx.fill();
    }
  }
}

// ---------------------------------------------------------------------------
// Limbs
// ---------------------------------------------------------------------------

function drawArm(ctx: CanvasRenderingContext2D, L: Look, rig: Rig, side: 1 | -1, back: boolean, time: number) {
  const pal = L.pal;
  const a: V2 = { x: side * L.shoulder.x, y: L.shoulder.y };
  const b = side === 1 ? rig.armF : rig.armB;
  const fill = back ? pal.dark : pal.base;
  const light = back ? pal.base : pal.light;
  const bend = rig.mode === 'swing' ? 6 : rig.mode === 'punch' ? L.armBend * 0.4 : L.armBend;
  limb(ctx, a, b, bend, L.armW[0], L.armW[1], fill, light, L.ol, L.pal.ol, side, L.base === 3 ? undefined : back ? 'rgba(40,20,8,0.55)' : 'rgba(255,235,190,0.55)', 5 + side);

  // wraps / bracers / fur trim
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  if (L.base === 4) {
    // wrist wrap: cream bands
    for (let i = 0; i < 3; i++) {
      const t = 0.74 + i * 0.065;
      const px = a.x + dx * t, py = a.y + dy * t;
      ctx.strokeStyle = i % 2 ? '#d9bd86' : '#f3e2b8'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(px - uy * 3.6, py + ux * 3.6); ctx.lineTo(px + uy * 3.6, py - ux * 3.6); ctx.stroke();
    }
  }
  if (L.base === 5) {
    const pulse = 0.7 + Math.sin(time * 3 + side) * 0.25;
    const px = a.x + dx * 0.68, py = a.y + dy * 0.68;
    ctx.save();
    ctx.translate(px, py); ctx.rotate(Math.atan2(dy, dx) + Math.PI / 2);
    ctx.beginPath(); ctx.roundRect(-4.6, -3, 9.2, 6, 2);
    fillStroke(ctx, '#8a6a2a', 1, '#4a3510');
    ctx.shadowColor = L.evil ? 'rgba(255,40,80,0.9)' : 'rgba(90,255,160,0.9)'; ctx.shadowBlur = 5 * pulse;
    ctx.fillStyle = L.evil ? `rgba(255,80,110,${0.75 + 0.2 * pulse})` : `rgba(120,255,175,${0.75 + 0.2 * pulse})`;
    ctx.beginPath(); ctx.moveTo(0, -2); ctx.quadraticCurveTo(2.6, 0, 0, 2); ctx.quadraticCurveTo(-2.6, 0, 0, -2); ctx.fill();
    ctx.restore();
  }
  if (L.evil && L.base === 2) {
    // steel gauntlet with spikes
    const gx = a.x + dx * 0.72, gy2 = a.y + dy * 0.72;
    ctx.save();
    ctx.translate(gx, gy2); ctx.rotate(Math.atan2(dy, dx) + Math.PI / 2);
    ctx.beginPath(); ctx.roundRect(-5.4, -3.4, 10.8, 7, 2);
    fillStroke(ctx, '#7d8794', 1.5, '#14181f');
    ctx.fillStyle = '#c7d0db';
    [-3, 0, 3].forEach((sx) => { ctx.beginPath(); ctx.moveTo(sx - 1.3, -3.4); ctx.lineTo(sx + 1.3, -3.4); ctx.lineTo(sx, -7.6); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#14181f'; ctx.lineWidth = 0.9; ctx.stroke(); });
    ctx.restore();
  }
  if (L.base === 2) {
    // spiky fur fringe along the underside of the arm
    ctx.fillStyle = back ? pal.deep : pal.dark;
    ctx.strokeStyle = pal.ol; ctx.lineWidth = 1.4; ctx.lineJoin = 'round';
    const nx = -uy * side, ny = ux * side;
    const flip = (nx * side < 0) ? -1 : 1;
    for (let i = 1; i <= 3; i++) {
      const t = 0.3 + i * 0.16;
      const px = a.x + dx * t + nx * flip * L.armW[0] * 0.4, py = a.y + dy * t + ny * flip * L.armW[0] * 0.4;
      ctx.beginPath();
      ctx.moveTo(px - ux * 2.6, py - uy * 2.6);
      ctx.lineTo(px + nx * flip * 4 + ux * 1, py + ny * flip * 4 + uy * 1);
      ctx.lineTo(px + ux * 2.6, py + uy * 2.6);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  }
  // hand
  const hr = L.armW[1] * 0.62 + 1;
  ell(ctx, b.x, b.y, hr, hr * 0.95);
  const handFill = back ? pal.deep : pal.dark;
  if (L.ol > 0) fillStroke(ctx, handFill, L.ol * 0.8, pal.ol); else { ctx.fillStyle = handFill; ctx.fill(); }
  // claws point along the arm direction (or the punch direction)
  const ang = rig.mode === 'punch' && side === 1 ? 0 : Math.atan2(dy, dx);
  claws(ctx, L, b.x + Math.cos(ang) * hr * 0.55, b.y + Math.sin(ang) * hr * 0.55, ang, rig.mode === 'punch' && side === 1 ? 1.2 : 1);
}

function drawLeg(ctx: CanvasRenderingContext2D, L: Look, rig: Rig, side: 1 | -1, back: boolean) {
  const pal = L.pal;
  const a: V2 = { x: side * L.hip.x, y: L.hip.y };
  const b = side === 1 ? rig.footF : rig.footB;
  const fill = back ? pal.dark : pal.base;
  limb(ctx, a, b, 1.5, L.legW, L.legW * 0.86, fill, pal.light, L.ol, pal.ol, side);
  // foot
  const kick = rig.mode === 'kick' && side === 1;
  ctx.save();
  ctx.translate(b.x + (kick ? 3 : 0), b.y);
  if (kick) ctx.rotate(-0.25);
  ell(ctx, 0, 0, L.footRx, L.footRy);
  const ff = back ? pal.deep : pal.dark;
  if (L.ol > 0) fillStroke(ctx, ff, L.ol * 0.85, pal.ol); else { ctx.fillStyle = ff; ctx.fill(); }
  // toe claws
  claws(ctx, L, kick ? L.footRx - 2 : 0, kick ? 0 : L.footRy - 2.6, kick ? 0 : Math.PI / 2, kick ? 1.1 : 0.4);
  ctx.restore();
}


/** Power-up halos and the mega-punch whirlwind, drawn behind the sprite in the already-flipped space. */
export function drawAuras(ctx: CanvasRenderingContext2D, p: PlayerState, time: number) {
  // --- ACTIVE POWER-UP AURAS ---
  if (p.activePowerUp === 'speed') {
    // Neon Emerald Cheetah Speed Wind Stream
    ctx.save();
    const windPhase = time * 14;
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.8)';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    for (let w = 0; w < 3; w++) {
      const wy = -38 + w * 14;
      const wx = -p.facing * (28 + Math.sin(windPhase + w) * 16);
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.lineTo(wx - p.facing * 35, wy + Math.sin(windPhase + w * 2) * 5);
      ctx.stroke();
    }
    // Speed afterimage glow
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.beginPath();
    ctx.arc(0, -25, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (p.activePowerUp === 'invincible') {
    // Dazzling Golden Solar Radiance Aura
    ctx.save();
    const pulse = Math.sin(time * 12) * 0.15 + 0.85;
    const starAngle = time * 4;
    const auraGrad = ctx.createRadialGradient(0, -26, 8, 0, -26, 62 * pulse);
    auraGrad.addColorStop(0, 'rgba(254, 240, 138, 0.8)');
    auraGrad.addColorStop(0.5, 'rgba(250, 204, 21, 0.45)');
    auraGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, -26, 62 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Orbiting Golden Stars
    for (let s = 0; s < 4; s++) {
      const sa = starAngle + (s * Math.PI) / 2;
      const sx = Math.cos(sa) * 44;
      const sy = -26 + Math.sin(sa) * 32;
      ctx.fillStyle = s % 2 === 0 ? '#fde047' : '#ffffff';
      ctx.beginPath();
      ctx.arc(sx, sy, 4.0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  } else if (p.activePowerUp === 'magnet') {
    // Bioluminescent Violet-Cyan Magnetic Rings
    ctx.save();
    const ring1 = (time * 2.5) % 1;
    const ring2 = (time * 2.5 + 0.5) % 1;
    [ring1, ring2].forEach((r) => {
      ctx.strokeStyle = `rgba(56, 189, 248, ${1 - r})`;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.ellipse(0, -26, 25 + r * 35, 18 + r * 25, 0, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.restore();
  }

  // Mega Punch Whirlwind Aura
  if (p.punching && p.punchType === 'mega') {
    ctx.save();
    const auraGrad = ctx.createRadialGradient(0, -25, 10, 0, -25, 75);
    auraGrad.addColorStop(0, 'rgba(250, 204, 21, 0.55)');
    auraGrad.addColorStop(0.5, 'rgba(74, 222, 128, 0.35)');
    auraGrad.addColorStop(1, 'rgba(34, 197, 94, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, -25, 75, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(253, 224, 71, 0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -25, 55, time * 12, time * 12 + Math.PI * 1.2);
    ctx.stroke();
    ctx.restore();
  }
}

// ---------------------------------------------------------------------------
// Public renderer
// ---------------------------------------------------------------------------

export function drawMilo(ctx: CanvasRenderingContext2D, variant: MiloVariant, p: PlayerState, time: number) {
  const L = LOOKS[variant];
  const rig = solve(L, p, time);

  ctx.save();
  ctx.translate(p.x, p.y);

  // The rope ends at the feet in the physics, so the body hangs along the rope: rotate about the feet
  // against the swing angle and the hands land on the rope line.
  if (rig.mode === 'swing') ctx.rotate(-(p.swingAngle ?? 0) * 0.85);

  if (p.grounded && !p.climbing && !p.isVineSwinging) {
    const sc = (1 / p.squashY) * (p.ducking ? 1.3 : 1.05);
    ctx.fillStyle = 'rgba(15,23,42,0.36)';
    ell(ctx, 0, 0, 22 * sc, 5.5 * sc); ctx.fill();
  }

  ctx.scale(p.facing * p.squashX, p.squashY);
  if (p.isDoubleJumping) {
    ctx.translate(0, L.bodyY); ctx.rotate(p.somersaultAngle); ctx.translate(0, -L.bodyY);
  }
  if (rig.hurt && Math.floor(time * 24) % 2 === 0) ctx.globalAlpha = 0.55;
  drawAuras(ctx, p, time);

  ctx.save();
  if (rig.crouch) ctx.scale(1.08, 1 - 0.3 * rig.crouch);
  ctx.translate(0, rig.bob);
  ctx.rotate(rig.lean);

  drawBack(ctx, L, rig, time);
  drawLeg(ctx, L, rig, -1, true);
  drawArm(ctx, L, rig, -1, true, time);
  drawTorso(ctx, L, rig, time);
  drawLeg(ctx, L, rig, 1, false);
  const armOver = rig.mode === 'punch' || rig.mode === 'swing' || rig.mode === 'climb';
  if (!armOver) drawArm(ctx, L, rig, 1, false, time);

  ctx.save();
  ctx.translate(1, L.headY + (rig.crouch ? 4 : 0));
  ctx.rotate(rig.headTilt + rig.lean * 0.4);
  drawHead(ctx, L, rig, time);
  ctx.restore();

  drawFront(ctx, L, rig, time);
  if (armOver) drawArm(ctx, L, rig, 1, false, time);
  ctx.restore();

  ctx.restore();
}

/** Height (feet = 0) where the hands grip a vine in the swing pose. */
export const miloGripY = (v: MiloVariant) => LOOKS[v].headY - LOOKS[v].headRy - 5;

/** A fully-populated PlayerState for the harness and for quick tests. */
export function demoPlayer(over: Partial<PlayerState> = {}): PlayerState {
  return {
    x: 0, y: 0, vx: 0, vy: 0, width: 44, height: 48, facing: 1, grounded: true, climbing: false,
    ducking: false, punching: false, punchTimer: 0, kicking: false, kickTimer: 0, attackType: 'none', punchType: 'normal',
    jumpsLeft: 2, isDoubleJumping: false, somersaultAngle: 0, megaCharge: 0, hp: 5, maxHp: 5, fruitsCollected: 0,
    relicsFound: 0, crittersRescued: 0, enemiesDefeated: 0, invincibleTimer: 0, walkCycle: 0, squashX: 1, squashY: 1,
    targetScaleX: 1, targetScaleY: 1, activePowerUp: null,
    ...over,
  } as PlayerState;
}
