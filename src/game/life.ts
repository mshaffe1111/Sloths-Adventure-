/**
 * life — the small moving things that make a backdrop feel inhabited: butterflies, distant birds, drifting
 * mist, dust in the light shafts and big leaves swaying in front of the camera. Drawn live (cheaply) over the
 * baked layers; positions come from the clock, so there is no state to keep.
 */
import { rng, tone, rgba, lighten, darken } from './artKit.ts';
import { leaf } from './rainforest.ts';
import { getSceneSeed } from './sceneSeed.ts';
import type { Look } from './scenery.ts';
import { paintSwayCluster } from './envKit.ts';
import { drawPaintedButterfly } from './butterflySprites.ts';
import { drawPaintedBird, renderPaintedFlocks } from './birdSprites.ts';

const fract = (v: number) => v - Math.floor(v);

// ───────────────────────────── butterflies ─────────────────────────────

function butterfly(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, flap: number, ang: number, col: string, accent: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  const open = 0.28 + 0.72 * Math.abs(Math.cos(flap));
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.scale(side * open, 1);
    // upper wing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(s * 0.9, -s * 1.3, s * 1.7, -s * 0.8, s * 1.15, s * 0.05);
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.fill();
    // lower wing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(s * 1.0, s * 0.1, s * 1.1, s * 1.0, s * 0.25, s * 0.85);
    ctx.closePath();
    ctx.fillStyle = accent;
    ctx.fill();
    // spots
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(s * 1.0, -s * 0.45, s * 0.17, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.strokeStyle = '#2a1a10';
  ctx.lineWidth = Math.max(1, s * 0.22);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.35);
  ctx.lineTo(0, s * 0.55);
  ctx.stroke();
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.35);
  ctx.lineTo(-s * 0.3, -s * 0.8);
  ctx.moveTo(0, -s * 0.35);
  ctx.lineTo(s * 0.3, -s * 0.8);
  ctx.stroke();
  ctx.restore();
}

// ───────────────────────────── distant birds ─────────────────────────────

const TAU = Math.PI * 2;

function bird(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, flap: number, col: string) {
  const w = Math.sin(flap) * s * 0.55;
  ctx.strokeStyle = col;
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(1.2, s * 0.14);
  ctx.beginPath();
  ctx.moveTo(x - s, y - w * 0.4);
  ctx.quadraticCurveTo(x - s * 0.5, y - w - s * 0.2, x, y);
  ctx.quadraticCurveTo(x + s * 0.5, y - w - s * 0.2, x + s, y - w * 0.4);
  ctx.stroke();
}

function renderBirds(ctx: CanvasRenderingContext2D, look: Look, world: number, camX: number, vw: number, vh: number, time: number, flocks: number) {
  const col = rgba(darken(look.farCols[0], 0.55), 0.7);
  for (let flock = 0; flock < flocks; flock++) {
    const period = 38 + flock * 17;
    const u = fract((time + flock * 13) / period);
    const x = vw + 80 - u * (vw + 260) - camX * 0.02;
    const baseY = vh * (0.1 + flock * 0.1) + Math.sin(u * 6.28) * 10;
    const n = 3 + flock * 2;
    for (let i = 0; i < n; i++) {
      const dx = i * 26 * (vh / 720) + (i % 2 ? 10 : 0);
      const dy = Math.abs(i - (n - 1) / 2) * 7 * (vh / 720) + (i % 2) * 4;
      bird(ctx, x + dx, baseY + dy, 7 * (vh / 720) + 2, time * 5.2 + i * 0.9 + flock * 2, col);
    }
  }
}

/** an eagle seen from below with its wings held flat in a glide: broad, fingered wingtips and a fanned tail */
function eagle(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, bank: number, col: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(bank * 0.12);
  ctx.fillStyle = col;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.1);
    ctx.bezierCurveTo(side * s * 0.8, -s * 0.5, side * s * 1.6, -s * 0.42, side * s * 2.2, -s * 0.1);
    // splayed primaries
    for (let k = 0; k < 4; k++) ctx.lineTo(side * (s * 2.25 - k * s * 0.17), s * (0.02 + k * 0.1 + 0.07));
    ctx.bezierCurveTo(side * s * 1.5, s * 0.22, side * s * 0.8, s * 0.22, 0, s * 0.22);
    ctx.closePath();
    ctx.fill();
  }
  // body, head and fanned tail
  ctx.beginPath();
  ctx.ellipse(0, s * 0.05, s * 0.2, s * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.46, s * 0.14, s * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-s * 0.2, s * 0.35);
  ctx.lineTo(-s * 0.36, s * 0.85);
  ctx.lineTo(s * 0.36, s * 0.85);
  ctx.lineTo(s * 0.2, s * 0.35);
  ctx.fill();
  ctx.restore();
}

function swift(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, flap: number, col: string) {
  const w = Math.sin(flap) * s * 0.35;
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(x - s * 1.5, y + s * 0.1 - w);
  ctx.quadraticCurveTo(x - s * 0.6, y - s * 0.5 - w, x, y);
  ctx.quadraticCurveTo(x + s * 0.6, y - s * 0.5 - w, x + s * 1.5, y + s * 0.1 - w);
  ctx.quadraticCurveTo(x + s * 0.6, y - s * 0.05, x, y + s * 0.3);
  ctx.quadraticCurveTo(x - s * 0.6, y - s * 0.05, x - s * 1.5, y + s * 0.1 - w);
  ctx.fill();
}

function renderRaptors(ctx: CanvasRenderingContext2D, look: Look, world: number, camX: number, vw: number, vh: number, time: number, n: number, eagles = true) {
  const col = rgba(darken(look.farCols[0], 0.62), 0.82);
  const sc = vh / 720;
  const r = rng(world * 97 + 5 + getSceneSeed() * 1013);
  // eagles ride the updraft in slow, wide arcs
  for (let i = 0; i < n; i++) {
    const period = 70 + r() * 40;
    const u = fract((time + r() * 90) / period);
    const dir = i % 2 ? 1 : -1;
    const x = dir > 0 ? -140 + u * (vw + 280) - camX * 0.02 : vw + 140 - u * (vw + 280) - camX * 0.02;
    const y = vh * (0.09 + r() * 0.18) + Math.sin(u * Math.PI * 3 + i) * 22 * sc;
    const size = 17 * sc * (0.85 + r() * 0.4);
    // (the painted harpy eagles replace these when they are loaded; the rng is still stepped so the swifts fly the same lines)
    if (!eagles) continue;
    ctx.save();
    if (dir < 0) {
      ctx.translate(x, 0);
      ctx.scale(-1, 1);
      ctx.translate(-x, 0);
    }
    eagle(ctx, x, y, size, Math.cos(u * Math.PI * 3 + i), col);
    ctx.restore();
  }
  // swifts stitch fast, low arcs across the spray
  const sw = rgba(darken(look.farCols[0], 0.7), 0.75);
  for (let i = 0; i < n * 3; i++) {
    const period = 11 + r() * 8;
    const u = fract((time + r() * 30) / period);
    const dir = i % 2 ? 1 : -1;
    const x = dir > 0 ? -50 + u * (vw + 100) : vw + 50 - u * (vw + 100);
    const y = vh * (0.28 + r() * 0.3) + Math.sin(u * 20 + i * 3) * 14 * sc;
    swift(ctx, x, y, 5 * sc, time * 14 + i * 2, sw);
  }
}

/** a drifting feather: a quill, a vane that bends over it and a few barbs */
function renderFeathers(ctx: CanvasRenderingContext2D, look: Look, world: number, camX: number, vw: number, vh: number, time: number, n: number) {
  const r = rng(world * 41 + 7 + getSceneSeed() * 1013);
  const sc = vh / 720;
  for (let i = 0; i < n; i++) {
    const sp = 14 + r() * 14;
    const x0 = r() * (vw + 200);
    const x = ((x0 + Math.sin(time * 0.7 + i * 2) * 40 - camX * 0.35 + time * 5) % (vw + 200) + (vw + 200)) % (vw + 200) - 100;
    const y = (((r() * vh + time * sp) % (vh + 60)) + (vh + 60)) % (vh + 60) - 30;
    const len = (14 + r() * 8) * sc;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(time * 1.1 + i * 1.7) * 0.9 + 0.6);
    ctx.fillStyle = i % 3 === 0 ? 'rgba(240,232,214,0.85)' : 'rgba(130,100,70,0.8)';
    ctx.beginPath();
    ctx.moveTo(0, -len);
    ctx.quadraticCurveTo(len * 0.34, -len * 0.3, len * 0.12, len * 0.7);
    ctx.lineTo(0, len);
    ctx.lineTo(-len * 0.08, len * 0.6);
    ctx.quadraticCurveTo(-len * 0.3, -len * 0.3, 0, -len);
    ctx.fill();
    ctx.strokeStyle = 'rgba(60,45,30,0.7)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(0, -len);
    ctx.lineTo(0, len * 1.15);
    ctx.stroke();
    ctx.restore();
  }
}

/** a hummingbird hovering: wings a blur, long bill, a flash of throat colour */
function hummer(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, buzz: number, face: number, body: string, throat: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(face, 1);
  ctx.fillStyle = 'rgba(235,250,255,0.5)';
  const w = 0.5 + 0.5 * Math.abs(Math.sin(buzz));
  for (const k of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(-s * 0.2, -s * 0.5 * w, s * 0.28, s * 0.85, k * 0.5 - 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.8, s * 0.42, -0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-s * 0.6, s * 0.3);
  ctx.lineTo(-s * 1.15, s * 0.75);
  ctx.lineTo(-s * 0.85, s * 0.2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(s * 0.75, -s * 0.35, s * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = throat;
  ctx.beginPath();
  ctx.ellipse(s * 0.62, -s * 0.12, s * 0.2, s * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2a2a2a';
  ctx.lineWidth = Math.max(1, s * 0.1);
  ctx.beginPath();
  ctx.moveTo(s * 1.0, -s * 0.38);
  ctx.lineTo(s * 1.9, -s * 0.2);
  ctx.stroke();
  ctx.restore();
}

function renderHummers(ctx: CanvasRenderingContext2D, look: Look, world: number, camX: number, vw: number, vh: number, time: number, n: number) {
  const r = rng(world * 109 + 11 + getSceneSeed() * 1013);
  const sc = vh / 720;
  for (let i = 0; i < n; i++) {
    const sx = r();
    const sy = 0.3 + r() * 0.35;
    const par = 0.25 + r() * 0.25;
    const span = vw + 200;
    // hover near one spot, then dart to the next
    const phase = time * 0.35 + i * 1.7;
    const hop = Math.floor(phase);
    const f = phase - hop;
    const ease = f < 0.8 ? 0 : (f - 0.8) / 0.2;
    const jump = (k: number) => ((Math.sin(k * 12.9898 + i * 78.233) * 43758.5453) % 1 + 1) % 1;
    const px = jump(hop) + (jump(hop + 1) - jump(hop)) * ease;
    const py = jump(hop + 7) + (jump(hop + 8) - jump(hop + 7)) * ease;
    const x = ((sx * span + px * 140 - camX * par) % span + span) % span - 100;
    const y = vh * sy + py * 70 * sc + Math.sin(time * 9 + i) * 1.6;
    // the painted hummingbird hovers with its own wing beat; the vector one is the fallback
    if (!drawPaintedBird(ctx, 'hummer', x, y, time, sc, 1, i % 2 ? 1 : -1, i * 0.4)) {
      hummer(ctx, x, y, 5.5 * sc, time * 55 + i, i % 2 ? 1 : -1, i % 2 ? '#2fb89a' : '#3a8ad0', i % 2 ? '#e0408a' : '#f0a030');
    }
  }
}

/** a larger coloured bird in level flight: body, two broad wings, a tail and a bill */
function colorBird(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, flap: number, body: string, accent: string, kind: 'heron' | 'parrot' | 'toucan' | 'crow', face: number) {
  const w = Math.sin(flap) * s * 0.7;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(face, 1);
  ctx.fillStyle = body;
  ctx.strokeStyle = body;
  ctx.lineCap = 'round';
  // wings
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.1);
    ctx.quadraticCurveTo(side * s * 0.8, -s * 0.5 - w, side * s * (kind === 'heron' ? 2.0 : 1.5), -s * 0.1 - w * 0.8);
    ctx.quadraticCurveTo(side * s * 0.8, s * 0.1 - w * 0.2, 0, s * 0.25);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.62, s * 0.26, 0, 0, TAU);
  ctx.fill();
  if (kind === 'heron') {
    // an S-curved neck, a long bill and legs trailing behind
    ctx.lineWidth = s * 0.16;
    ctx.beginPath();
    ctx.moveTo(s * 0.5, -s * 0.05);
    ctx.quadraticCurveTo(s * 0.9, -s * 0.5, s * 1.1, -s * 0.15);
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.moveTo(s * 1.1, -s * 0.22);
    ctx.lineTo(s * 1.75, -s * 0.12);
    ctx.lineTo(s * 1.1, -s * 0.06);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = Math.max(1, s * 0.07);
    ctx.beginPath();
    ctx.moveTo(-s * 0.5, s * 0.1);
    ctx.lineTo(-s * 1.7, s * 0.3);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(s * 0.62, -s * 0.08, s * 0.2, 0, TAU);
    ctx.fill();
    ctx.fillStyle = accent;
    if (kind === 'toucan') {
      ctx.beginPath();
      ctx.moveTo(s * 0.72, -s * 0.2);
      ctx.lineTo(s * 1.5, -s * 0.08);
      ctx.lineTo(s * 0.72, s * 0.04);
      ctx.fill();
    } else if (kind === 'parrot') {
      ctx.beginPath();
      ctx.moveTo(s * 0.74, -s * 0.18);
      ctx.quadraticCurveTo(s * 1.05, -s * 0.12, s * 0.9, s * 0.08);
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = s * 0.2;
      ctx.beginPath();
      ctx.moveTo(-s * 0.5, 0);
      ctx.lineTo(-s * 1.9, s * 0.3);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(s * 0.74, -s * 0.14);
      ctx.lineTo(s * 1.15, -s * 0.06);
      ctx.lineTo(s * 0.74, 0);
      ctx.fill();
    }
    if (kind === 'crow') {
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.moveTo(-s * 0.5, -s * 0.05);
      ctx.lineTo(-s * 1.1, s * 0.25);
      ctx.lineTo(-s * 0.9, -s * 0.12);
      ctx.fill();
    }
  }
  ctx.restore();
}

function renderColorBirds(ctx: CanvasRenderingContext2D, look: Look, world: number, camX: number, vw: number, vh: number, time: number, flocks: number, kind: 'heron' | 'parrot' | 'toucan' | 'crow') {
  const sc = vh / 720;
  const pal: Record<string, [string, string]> = {
    heron: ['#e8eef0', '#d8a838'],
    parrot: ['#d8301f', '#2f6ad8'],
    toucan: ['#1c1c24', '#f08a1a'],
    crow: [rgba(darken(look.farCols[0], 0.8), 0.95), '#222'],
  };
  const [body, accent] = pal[kind];
  const r = rng(world * 131 + 17 + getSceneSeed() * 1013);
  for (let f = 0; f < flocks; f++) {
    const period = (kind === 'heron' ? 60 : 34) + r() * 30;
    const dir = f % 2 ? 1 : -1;
    const u = fract((time + r() * 80) / period);
    const n = kind === 'crow' ? 4 : kind === 'heron' ? 1 : 2;
    const baseX = dir > 0 ? -90 + u * (vw + 220) : vw + 90 - u * (vw + 220);
    const baseY = vh * (0.12 + r() * 0.24) + Math.sin(u * 8 + f) * 12 * sc;
    for (let i = 0; i < n; i++) {
      const bx = baseX - dir * i * 34 * sc;
      const by = baseY + i * 10 * sc + Math.sin(time * 1.3 + i) * 3;
      const slow = kind === 'heron' ? 3.2 : kind === 'crow' ? 7 : 8;
      colorBird(ctx, bx, by, (kind === 'crow' ? 8 : kind === 'heron' ? 9 : 7) * sc, time * slow + i * 1.3 + f, body, accent, kind, dir);
    }
  }
}

// ───────────────────────────── dragonflies, moths, bats, fireflies, embers ─────────────────────────────

function dragonfly(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, buzz: number, ang: number, col: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  // wings: two pairs, blurred by the buzz
  const w = 0.55 + 0.45 * Math.abs(Math.sin(buzz));
  ctx.fillStyle = 'rgba(235,250,255,0.55)';
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 0.7;
  for (const side of [-1, 1]) {
    for (const off of [-0.15, 0.4]) {
      ctx.beginPath();
      ctx.ellipse(off * s, side * s * 0.9 * w, s * 0.95, s * 0.26, side * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
  // slender body
  ctx.strokeStyle = col;
  ctx.lineWidth = Math.max(1.4, s * 0.2);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-s * 1.9, 0);
  ctx.lineTo(s * 0.7, 0);
  ctx.stroke();
  ctx.fillStyle = lighten(col, 0.3);
  ctx.beginPath();
  ctx.arc(s * 0.85, 0, s * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function glowFly(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, pulse: number, col: string) {
  const a = 0.25 + 0.75 * pulse;
  const g = ctx.createRadialGradient(x, y, 0, x, y, s * 4.5);
  g.addColorStop(0, rgba(col, 0.9 * a));
  g.addColorStop(0.25, rgba(col, 0.35 * a));
  g.addColorStop(1, rgba(col, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - s * 4.5, y - s * 4.5, s * 9, s * 9);
}

function bat(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, flap: number, col: string) {
  const w = Math.sin(flap);
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.2);
  for (const side of [1, -1]) {
    ctx.moveTo(x, y - s * 0.1);
    ctx.quadraticCurveTo(x + side * s * 0.9, y - s * (0.9 + w * 0.7), x + side * s * 1.7, y - s * (0.2 + w * 0.9));
    ctx.quadraticCurveTo(x + side * s * 1.35, y + s * 0.05, x + side * s * 1.1, y + s * 0.18);
    ctx.quadraticCurveTo(x + side * s * 0.85, y - s * 0.05, x + side * s * 0.55, y + s * 0.25);
    ctx.quadraticCurveTo(x + side * s * 0.3, y, x, y + s * 0.3);
  }
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x, y + s * 0.05, s * 0.22, s * 0.36, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - s * 0.18, y - s * 0.28);
  ctx.lineTo(x - s * 0.1, y - s * 0.55);
  ctx.lineTo(x, y - s * 0.3);
  ctx.lineTo(x + s * 0.1, y - s * 0.55);
  ctx.lineTo(x + s * 0.18, y - s * 0.28);
  ctx.fill();
}

type Fauna = 'butterfly' | 'dragonfly' | 'moth';
export interface LifeKit {
  birds: number; // flocks
  fauna: Fauna;
  nFauna: number;
  bats: number;
  fireflies: number;
  embers: number;
  ash: number;
  gusts: number; // wind-blown leaves
  mist: boolean;
  motes: number;
  /** 'raptor': a few big soaring eagles and darting swifts instead of V-flocks of small birds */
  birdKind?: 'raptor' | 'heron' | 'parrot' | 'toucan' | 'crow';
  /** drifting feathers (an eagle's territory) */
  feathers?: number;
  /** hovering hummingbirds (cloud forest) */
  hummers?: number;
}
export const LIFE: Record<number, LifeKit> = {
  1: { birds: 2, birdKind: 'toucan', fauna: 'butterfly', nFauna: 7, bats: 0, fireflies: 0, embers: 0, ash: 0, gusts: 0, mist: true, motes: 34 },
  2: { birds: 2, birdKind: 'heron', fauna: 'dragonfly', nFauna: 6, bats: 0, fireflies: 0, embers: 0, ash: 0, gusts: 2, mist: true, motes: 24 },
  3: { birds: 0, fauna: 'moth', nFauna: 5, bats: 0, fireflies: 0, embers: 0, ash: 0, gusts: 0, mist: true, motes: 40 },
  4: { birds: 2, birdKind: 'raptor', feathers: 5, hummers: 4, fauna: 'dragonfly', nFauna: 0, bats: 0, fireflies: 0, embers: 0, ash: 0, gusts: 0, mist: true, motes: 20 },
  5: { birds: 0, hummers: 3, fauna: 'butterfly', nFauna: 11, bats: 0, fireflies: 0, embers: 0, ash: 0, gusts: 3, mist: true, motes: 30 },
  6: { birds: 1, birdKind: 'heron', fauna: 'dragonfly', nFauna: 2, bats: 0, fireflies: 22, embers: 0, ash: 0, gusts: 0, mist: true, motes: 18 },
  7: { birds: 2, birdKind: 'parrot', fauna: 'butterfly', nFauna: 3, bats: 0, fireflies: 0, embers: 0, ash: 0, gusts: 2, mist: true, motes: 44 },
  8: { birds: 0, fauna: 'moth', nFauna: 7, bats: 11, fireflies: 8, embers: 0, ash: 0, gusts: 0, mist: true, motes: 36 },
  9: { birds: 0, fauna: 'moth', nFauna: 0, bats: 0, fireflies: 0, embers: 34, ash: 20, gusts: 0, mist: false, motes: 10 },
  10: { birds: 3, birdKind: 'crow', fauna: 'butterfly', nFauna: 0, bats: 0, fireflies: 0, embers: 0, ash: 0, gusts: 9, mist: true, motes: 8 },
};

function renderFauna(ctx: CanvasRenderingContext2D, look: Look, world: number, camX: number, vw: number, vh: number, time: number, kind: Fauna, n: number) {
  const r = rng(world * 41 + 5 + getSceneSeed() * 1013);
  const wings = look.flora.slice(0, 4);
  const sc = vh / 720;
  for (let i = 0; i < n; i++) {
    const seed = r();
    const speed = 7 + r() * 9;
    const par = 0.55 + r() * 0.35;
    const span = vw + 260;
    const bx = ((seed * span + time * speed - camX * par) % span + span) % span - 130;
    const wob = time * (0.7 + r() * 0.6) + seed * 20;
    const yBase = vh * (0.22 + r() * 0.34);
    if (kind === 'dragonfly') {
      // hover, then dart: position eased between hover points
      const t = time * (0.35 + r() * 0.25) + seed * 30;
      const k = Math.floor(t);
      const f = t - k;
      const e = f < 0.7 ? 0 : (f - 0.7) / 0.3;
      const ease = e * e * (3 - 2 * e);
      const h = (n2: number) => fract(Math.sin((k + n2) * 127.1 + i * 311.7) * 43758.5453);
      const px = (h(0) - 0.5) * 160 + ((h(1) - 0.5) * 160 - (h(0) - 0.5) * 160) * ease;
      const py = (h(2) - 0.5) * 50 + ((h(3) - 0.5) * 50 - (h(2) - 0.5) * 50) * ease;
      const x = bx + px;
      const y = yBase + py + Math.sin(time * 40 + i) * 0.7;
      dragonfly(ctx, x, y, 4.2 * sc * 1.5, time * 55 + i, ease > 0 ? Math.atan2(py, px) * 0.2 : Math.sin(wob) * 0.1, i % 2 ? '#2ec4d6' : wings[i % wings.length]);
      continue;
    }
    const x = bx + Math.sin(wob) * 40;
    const y = yBase + Math.sin(wob * 1.7 + i) * vh * 0.04 + Math.sin(time * 9 + i) * 2;
    const dx = Math.cos(wob) * 40 + speed;
    const s = (5.5 + r() * 3.5) * sc * 1.6;
    const ang = Math.atan2(Math.sin(wob * 1.7) * 6, dx) * 0.5;
    if (kind === 'moth') {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      glowFly(ctx, x, y, s * 0.9, 0.55 + 0.45 * Math.sin(time * 2 + i), wings[i % wings.length]);
      ctx.restore();
      butterfly(ctx, x, y, s * 0.75, time * (15 + i) + i, ang, lighten(wings[i % wings.length], 0.35), wings[(i + 1) % wings.length]);
    } else {
      // the painted butterflies (frames face left, so they mirror when flying right and lean into the climb); the vector ones are the fallback
      const variation = 0.85 + ((s / (sc * 1.6) - 5.5) / 3.5) * 0.35;
      const tilt = Math.cos(wob * 1.7 + i) * 0.25 * (dx > 0 ? 1 : -1);
      if (!drawPaintedButterfly(ctx, world, i, x, y, time, sc, variation, dx, tilt)) {
        butterfly(ctx, x, y, s, time * (13 + i) + i, ang, wings[i % wings.length], lighten(wings[(i + 1) % wings.length], 0.2));
      }
    }
  }
}

function renderBats(ctx: CanvasRenderingContext2D, look: Look, world: number, camX: number, vw: number, vh: number, time: number, n: number) {
  const col = rgba(darken(look.farCols[0], 0.8), 0.85);
  const sc = vh / 720;
  const r = rng(world * 59 + 3 + getSceneSeed() * 1013);
  for (let i = 0; i < n; i++) {
    const period = 22 + r() * 18;
    const u = fract((time + r() * 40) / period);
    const dir = i % 2 ? 1 : -1;
    const x = dir > 0 ? -60 + u * (vw + 140) - camX * 0.04 : vw + 60 - u * (vw + 140) - camX * 0.04;
    const y = vh * (0.12 + r() * 0.3) + Math.sin(u * 14 + i) * 18 * sc;
    bat(ctx, x, y, 11 * sc * (0.8 + r() * 0.5), time * 11 + i * 2, col);
  }
}

function renderFireflies(ctx: CanvasRenderingContext2D, look: Look, world: number, camX: number, vw: number, vh: number, time: number, n: number) {
  const r = rng(world * 83 + 11 + getSceneSeed() * 1013);
  const col = look.glow ?? look.rays;
  const sc = vh / 720;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const sx = r();
    const sy = r();
    const par = 0.3 + r() * 0.5;
    const span = vw + 160;
    const x = ((sx * span - camX * par + Math.sin(time * (0.3 + r() * 0.4) + i) * 38) % span + span) % span - 80;
    const y = vh * (0.3 + sy * 0.5) + Math.sin(time * (0.5 + r() * 0.5) + i * 2) * 20;
    const pulse = Math.max(0, Math.sin(time * (1.1 + r() * 0.9) + i * 4));
    glowFly(ctx, x, y, 3.2 * sc * 1.4, pulse * pulse, col);
  }
  ctx.restore();
}

function renderEmbers(ctx: CanvasRenderingContext2D, world: number, camX: number, vw: number, vh: number, time: number, n: number, ash: number) {
  const r = rng(world * 97 + 21 + getSceneSeed() * 1013);
  const sc = vh / 720;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const sx = r();
    const sp = 0.5 + r();
    const life = fract(time * 0.08 * sp + r());
    const span = vw + 200;
    const x = ((sx * span - camX * (0.4 + sp * 0.2) + Math.sin(time * sp + i) * 26 * life) % span + span) % span - 100;
    const y = vh * (1.02 - life * 1.0);
    const a = Math.sin(life * Math.PI);
    const sz = (1.4 + sp * 1.6) * sc * 1.4;
    const g = ctx.createRadialGradient(x, y, 0, x, y, sz * 3);
    g.addColorStop(0, `rgba(255,${170 + ((i * 17) % 60)},70,${0.95 * a})`);
    g.addColorStop(1, 'rgba(255,80,20,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - sz * 3, y - sz * 3, sz * 6, sz * 6);
  }
  ctx.restore();
  // ash flakes drift down and sideways, dark against the glow
  ctx.fillStyle = 'rgba(40,30,30,0.55)';
  for (let i = 0; i < ash; i++) {
    const sx = r();
    const sp = 0.4 + r();
    const life = fract(time * 0.05 * sp + r());
    const span = vw + 200;
    const x = ((sx * span - camX * 0.5 + time * 14 * sp + Math.sin(time * 1.3 + i) * 14) % span + span) % span - 100;
    const y = life * vh * 1.05 - 10;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(time * sp + i);
    ctx.fillRect(-2.2 * sc, -1.2 * sc, 4.4 * sc, 2.4 * sc);
    ctx.restore();
  }
}

const gustTones = new Map<string, ReturnType<typeof tone>>();
function gustTone(c: string) {
  let t = gustTones.get(c);
  if (!t) gustTones.set(c, (t = tone(c)));
  return t;
}

function renderGusts(ctx: CanvasRenderingContext2D, look: Look, world: number, camX: number, vw: number, vh: number, time: number, n: number) {
  const r = rng(world * 71 + 17 + getSceneSeed() * 1013);
  const sc = vh / 720;
  for (let i = 0; i < n; i++) {
    const sp = 70 + r() * 90;
    const span = vw + 300;
    const x = ((r() * span + time * sp - camX * 0.5) % span + span) % span - 150;
    const y = vh * (0.15 + r() * 0.6) + Math.sin(time * 1.6 + i * 2) * 26 * sc;
    const c = look.leaves[i % look.leaves.length];
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(time * (2 + (i % 3)) + i);
    leaf(ctx, 0, 0, 12 * sc * (0.8 + r() * 0.6), 5 * sc, 0, gustTone(c), 0.1, false);
    ctx.restore();
  }
}

// ───────────────────────────── mist and dust ─────────────────────────────

let mistSprite: HTMLCanvasElement | null = null;
let mistKey = '';
function getMist(col: string): HTMLCanvasElement {
  if (mistSprite && mistKey === col) return mistSprite;
  const cv = document.createElement('canvas');
  cv.width = 1024;
  cv.height = 192;
  const c = cv.getContext('2d')!;
  const r = rng(77);
  for (let i = 0; i < 26; i++) {
    const x = r() * 1024;
    const y = 96 + (r() - 0.5) * 70;
    const rad = 70 + r() * 90;
    for (const dx of [0, -1024, 1024]) {
      const g = c.createRadialGradient(x + dx, y, 0, x + dx, y, rad);
      g.addColorStop(0, rgba(col, 0.2));
      g.addColorStop(1, rgba(col, 0));
      c.fillStyle = g;
      c.beginPath();
      c.ellipse(x + dx, y, rad, rad * 0.42, 0, 0, Math.PI * 2);
      c.fill();
    }
  }
  mistSprite = cv;
  mistKey = col;
  return cv;
}

function renderMist(ctx: CanvasRenderingContext2D, look: Look, camX: number, vw: number, vh: number, time: number) {
  const sp = getMist(look.haze);
  const h = vh * 0.34;
  const w = h * (1024 / 192) * 1.25;
  for (let layer = 0; layer < 2; layer++) {
    const drift = time * (6 + layer * 4) + camX * (0.18 + layer * 0.12);
    let x0 = -(drift % w);
    ctx.globalAlpha = 0.7 - layer * 0.25;
    for (let x = x0 - (layer ? w * 0.4 : 0); x < vw; x += w) ctx.drawImage(sp, Math.floor(x), vh * (0.5 + layer * 0.07), Math.ceil(w) + 1, h);
  }
  ctx.globalAlpha = 1;
}

function renderMotes(ctx: CanvasRenderingContext2D, look: Look, world: number, camX: number, vw: number, vh: number, time: number, count: number) {
  const r = rng(world * 313 + 9 + getSceneSeed() * 1013);
  for (let i = 0; i < count; i++) {
    const sx = r();
    const sy = r();
    const sp = 0.4 + r();
    const x = ((sx * (vw + 200) + time * 6 * sp - camX * (0.3 + sp * 0.2)) % (vw + 200) + (vw + 200)) % (vw + 200) - 100;
    const y = ((sy * vh + Math.sin(time * 0.6 * sp + i) * 22 - time * 3 * sp) % vh + vh) % vh;
    const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * (1.2 + sp) + i * 2));
    ctx.fillStyle = rgba(look.rays, 0.55 * tw);
    ctx.beginPath();
    ctx.arc(x, y, (1 + sp * 1.2) * (vh / 720) * 1.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ───────────────────────────── swaying foreground leaves ─────────────────────────────

const leafSprites = new Map<number, HTMLCanvasElement[]>();
function getLeafSprites(look: Look, world: number): HTMLCanvasElement[] {
  let s = leafSprites.get(world);
  if (s) return s;
  s = [];
  const r = rng(world * 733 + 1 + getSceneSeed() * 1013);
  const dark = look.leaves.map((c) => tone(darken(c, 0.32)));
  for (let i = 0; i < 4; i++) {
    const cv = document.createElement('canvas');
    cv.width = 360;
    cv.height = 360;
    const c = cv.getContext('2d')!;
    // a world with its own plants hangs its own things in front of the camera
    if (paintSwayCluster(c, world, look, i, r)) {
      s.push(cv);
      continue;
    }
    // a cluster of big drooping leaves hanging from the top-centre of the sprite
    const n = 3 + (i % 2);
    for (let k = 0; k < n; k++) {
      const a = Math.PI / 2 + (k - (n - 1) / 2) * 0.55 + (r() - 0.5) * 0.2;
      leaf(c, 180, 8, 170 + r() * 60, 46 + r() * 16, a, dark[(r() * dark.length) | 0], (k % 2 ? 1 : -1) * 0.2, true);
    }
    s.push(cv);
  }
  leafSprites.set(world, s);
  return s;
}

function renderSwayLeaves(ctx: CanvasRenderingContext2D, look: Look, world: number, camX: number, vw: number, vh: number, time: number) {
  const sprites = getLeafSprites(look, world);
  const s = vh / 720;
  const span = 760 * s;
  for (let i = 0; i < 5; i++) {
    const sprite = sprites[i % sprites.length];
    const px = (((i * 0.43 + 0.11) * span * 3 - camX * 1.15 * s * 0.9) % (span * 3) + span * 3) % (span * 3) - span * 0.7;
    if (px > vw + 200 * s) continue;
    const sway = Math.sin(time * (0.7 + (i % 3) * 0.17) + i * 1.9) * 0.1 + Math.sin(time * 2.1 + i) * 0.02;
    const k = (0.5 + (i % 3) * 0.08) * s * 1.2;
    ctx.save();
    ctx.translate(px, -6 * s);
    ctx.rotate(sway);
    ctx.globalAlpha = 0.93;
    ctx.drawImage(sprite, -180 * k, 0, 360 * k, 360 * k);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

/** creatures, mist and dust: drawn behind the playfield so they never hide what the player must read */
export function renderLifeBack(ctx: CanvasRenderingContext2D, look: Look, world: number, camX: number, vw: number, vh: number, time: number, lite: boolean) {
  const k = LIFE[world] ?? LIFE[1];
  // painted birds (toucans, macaws, quetzals, harpy eagles, songbirds) take over the kinds they cover once their atlas has loaded;
  // herons and crows have no painted species and stay as they were
  const painted = renderPaintedFlocks(ctx, world, camX, vw, vh, time);
  if (k.birds > 0) {
    if (k.birdKind === 'raptor') renderRaptors(ctx, look, world, camX, vw, vh, time, k.birds, !painted);
    else if (k.birdKind) {
      if (!(painted && (k.birdKind === 'toucan' || k.birdKind === 'parrot'))) renderColorBirds(ctx, look, world, camX, vw, vh, time, k.birds, k.birdKind);
    } else renderBirds(ctx, look, world, camX, vw, vh, time, k.birds);
  }
  if (k.mist && !lite) renderMist(ctx, look, camX, vw, vh, time);
  renderMotes(ctx, look, world, camX, vw, vh, time, k.motes);
  if (k.nFauna > 0) renderFauna(ctx, look, world, camX, vw, vh, time, k.fauna, lite ? Math.ceil(k.nFauna / 2) : k.nFauna);
  if (k.bats > 0) renderBats(ctx, look, world, camX, vw, vh, time, k.bats);
  if (k.fireflies > 0) renderFireflies(ctx, look, world, camX, vw, vh, time, lite ? Math.ceil(k.fireflies / 2) : k.fireflies);
  if (k.embers > 0) renderEmbers(ctx, world, camX, vw, vh, time, lite ? Math.ceil(k.embers / 2) : k.embers, lite ? 6 : k.ash);
  if (k.gusts > 0) renderGusts(ctx, look, world, camX, vw, vh, time, k.gusts);
  if (k.hummers) renderHummers(ctx, look, world, camX, vw, vh, time, lite ? Math.ceil(k.hummers / 2) : k.hummers);
  if (k.feathers) renderFeathers(ctx, look, world, camX, vw, vh, time, lite ? Math.ceil(k.feathers / 2) : k.feathers);
}

/** big leaves swaying in front of the camera at the top edge */
export function renderLifeFront(ctx: CanvasRenderingContext2D, look: Look, world: number, camX: number, vw: number, vh: number, time: number) {
  renderSwayLeaves(ctx, look, world, camX, vw, vh, time);
}
