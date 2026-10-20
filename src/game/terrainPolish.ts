/**
 * terrainPolish — the ground's share of the polish pass (see polish.ts; same switch, off by default).
 *
 *  - grass that bends in the wind: the baked blade strip is filled in rows, each slid a little, more at the tips
 *  - light and shade on the soil: mottling, depth, an end-light on ledges, dappled sun through the canopy on the surface
 *  - exposed roots that creep across the surface
 *
 * Everything is world-anchored (a platform and its neighbours agree on where a dapple or a root is) and seeded per stage.
 */
import { rng, rgba, mixToHex, lighten, darken } from './artKit.ts';
import { gustAt, polishTier, type Rig } from './polish.ts';
import type { Platform } from './types.ts';
import type { Look } from './scenery.ts';

const SEG = 120;
const BANDS = [1, 0.72, 0.45, 0.2]; // sway weight of the four 8px rows above the lip, top first

/** the grass cap strip (72px tall, starting 30px above the platform top), with its blade rows swaying */
export function fillCapWindy(ctx: CanvasRenderingContext2D, cap: CanvasPattern, base: DOMMatrix, x: number, y: number, w: number, vl: number, vr: number, time: number, rig: Rig) {
  const top = y - 30;
  // the part below the lip does not move
  cap.setTransform(base);
  ctx.fillStyle = cap;
  ctx.fillRect(x, top + 32, w, 40);
  const A = rig.wind.amp * 0.85 * rig.terrain.lean * gustAt(rig, time);
  const x0 = Math.max(x, vl);
  const x1 = Math.min(x + w, vr);
  for (let sx = Math.floor(x0 / SEG) * SEG; sx < x1; sx += SEG) {
    const a = Math.max(x, sx);
    const b = Math.min(x + w, sx + SEG);
    if (b <= a) continue;
    for (let k = 0; k < BANDS.length; k++) {
      const dx = (Math.sin(time * rig.wind.spd * 1.35 + sx * 0.012 + k * 0.4 + rig.wind.phase) + 0.25 * Math.sin(time * 3.3 + sx * 0.05 + k)) * A * BANDS[k];
      cap.setTransform(new DOMMatrix().translate(dx, 0).multiply(base));
      ctx.fillRect(a, top + k * 8, b - a, 8 + (k === 3 ? 0.5 : 0.5));
    }
  }
  cap.setTransform(base);
}

/** how far a tuft or flower leans this instant (a shear about its base, so taller things move more) */
export function windShear(rig: Rig, time: number, px: number): number {
  return (Math.sin(time * rig.wind.spd * 1.35 + px * 0.012 + rig.wind.phase) * 0.07 + Math.sin(time * 3.1 + px * 0.04) * 0.012) * rig.terrain.lean * gustAt(rig, time);
}

/**
 * light and shade over a platform body. `clip` re-makes the body's outline path (the caller knows its shape).
 */
export function lightBody(ctx: CanvasRenderingContext2D, rig: Rig, look: Look, p: Platform, depth: number, clip: () => void, vl: number, vr: number, time: number) {
  const x = p.x;
  const y = p.y;
  const w = p.width;
  const isGround = p.height >= 50;
  ctx.save();
  clip();
  ctx.clip();
  const x0 = Math.max(x, vl);
  const x1 = Math.min(x + w, vr);
  const T = rig.terrain;

  // large soft mottling, so the earth is not one even tone
  const r = rng(Math.floor(T.mottle) + (isGround ? 0 : p.id * 7));
  const span = isGround ? 340 : 120;
  const cells = Math.ceil(w / span);
  for (let i = 0; i < cells; i++) {
    const cx = x + (i + r()) * span;
    const cy = y + 30 + r() * Math.min(depth - 30, isGround ? 260 : 60);
    const rad = 70 + r() * 110;
    const dark = r() > 0.45;
    if (cx + rad < x0 || cx - rad > x1) continue;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
    g.addColorStop(0, dark ? rgba(look.ground.dirtDark, 0.27) : rgba(lighten(look.ground.dirt, 0.25), 0.18));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
  }

  // depth: the earth goes cool and dark the further it sinks from the light
  const dg = ctx.createLinearGradient(0, y + 60, 0, y + Math.min(depth, isGround ? 440 : 200));
  dg.addColorStop(0, rgba(T.deep, 0));
  dg.addColorStop(1, rgba(T.deep, isGround ? 0.34 : 0.4));
  ctx.fillStyle = dg;
  ctx.fillRect(x0, y + 60, x1 - x0, depth);

  // sun-side edge catches the light, far side falls into shade (matters on ledges and island ends)
  const lit = rig.lx > 0 ? x + w : x;
  const eg = ctx.createLinearGradient(lit, 0, lit + (rig.lx > 0 ? -22 : 22), 0);
  eg.addColorStop(0, rgba(rig.rim, 0.3));
  eg.addColorStop(1, rgba(rig.rim, 0));
  ctx.fillStyle = eg;
  ctx.fillRect(x, y, w, depth);
  const sd = rig.lx > 0 ? x : x + w;
  const sg = ctx.createLinearGradient(sd, 0, sd + (rig.lx > 0 ? 30 : -30), 0);
  sg.addColorStop(0, 'rgba(6,4,16,0.32)');
  sg.addColorStop(1, 'rgba(6,4,16,0)');
  ctx.fillStyle = sg;
  ctx.fillRect(x, y, w, depth);

  // a thin bright lip where the grass meets the soil, so the surface reads as lit from above
  ctx.fillStyle = rgba(rig.rim, 0.2);
  ctx.fillRect(x0, y + 5, x1 - x0, 2);
  ctx.restore();
}

/** soft patches of sun falling through the canopy onto the surface, drifting with the leaves above */
export function dapples(ctx: CanvasRenderingContext2D, rig: Rig, p: Platform, vl: number, vr: number, time: number) {
  const T = rig.terrain;
  if (T.dapple < 0.05 || polishTier() >= 1) return;
  const x0 = Math.max(p.x, vl);
  const x1 = Math.min(p.x + p.width, vr);
  const step = 170;
  ctx.save();
  ctx.beginPath();
  ctx.rect(p.x, p.y - 26, p.width, 110);
  ctx.clip();
  for (let sx = Math.floor((x0 - 100) / step) * step; sx < x1 + 100; sx += step) {
    const r = rng(Math.floor(sx / step) * 977 + Math.floor(T.mottle));
    if (r() > 0.5 * T.dapple + 0.25) continue;
    const drift = Math.sin(time * 0.22 + r() * 6.28) * 38;
    const cx = sx + r() * step + drift;
    const rx = 36 + r() * 56;
    const pulse = 0.55 + 0.45 * Math.sin(time * (0.5 + r() * 0.5) + r() * 6.28);
    const cy = p.y + 4 + r() * 10;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, 0.2);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, rgba(T.dappleCol, 0.46 * pulse));
    g.addColorStop(0.6, rgba(T.dappleCol, 0.2 * pulse));
    g.addColorStop(1, rgba(T.dappleCol, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

/**
 * gnarled roots weaving in and out of the soil just under the grass lip. Drawn before the grass strip, so the blades
 * and drips cover their tops and they look grown into the ground rather than laid on it.
 */
export function surfaceRoots(ctx: CanvasRenderingContext2D, rig: Rig, look: Look, p: Platform, vl: number, vr: number) {
  const kind = look.ground.kind;
  const mul = kind === 'ash' ? 0 : kind === 'stone' ? 0.25 : kind === 'sand' ? 0.5 : 1;
  const want = rig.terrain.roots * mul;
  if (want < 0.12 || p.width < 160) return;
  const r = rng(Math.abs(p.id) * 733 + Math.floor(rig.terrain.mottle) + 17);
  const n = Math.min(5, Math.floor((p.width / 520) * want + r() * 0.8));
  const bark = look.trunk;
  const wood = mixToHex(bark[1], look.ground.dirtDark, 0.25);
  const hi = lighten(bark[0], 0.2);
  for (let i = 0; i < n; i++) {
    const rx = p.x + 40 + r() * (p.width - 80);
    const dir = r() < 0.5 ? -1 : 1;
    const len = 34 + r() * 46;
    const y = p.y + 14 + r() * 8;
    if (rx + len < vl || rx - len > vr) continue;
    const thick = 4.5 + r() * 2.5;
    const path = () => {
      ctx.beginPath();
      ctx.moveTo(rx - dir * 6, y - 8);
      ctx.bezierCurveTo(rx - dir * 2, y + 6, rx + dir * len * 0.3, y + 12, rx + dir * len * 0.55, y + 5);
      ctx.bezierCurveTo(rx + dir * len * 0.78, y - 1, rx + dir * len * 0.92, y + 8, rx + dir * len, y + 18);
    };
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    path();
    ctx.strokeStyle = rgba(look.ground.outline, 0.7);
    ctx.lineWidth = thick + 3;
    ctx.stroke();
    path();
    ctx.strokeStyle = wood;
    ctx.lineWidth = thick;
    ctx.stroke();
    ctx.translate(rig.lx * 1.2, -1.3);
    path();
    ctx.strokeStyle = rgba(hi, 0.65);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
    // fine rootlets trailing off it into the dark
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = rgba(look.ground.outline, 0.55);
    ctx.lineWidth = 1.6;
    for (let k = 0; k < 3; k++) {
      const sx = rx + dir * len * (0.2 + k * 0.28);
      const sy = y + 6;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(sx + dir * 4, sy + 10, sx + dir * (2 + r() * 9), sy + 18 + r() * 12);
      ctx.stroke();
    }
    ctx.restore();
  }
}

/**
 * a live fringe of grass blades along the surface: the baked strip cannot move, these can. Three tones, three fills.
 */
export function liveBlades(ctx: CanvasRenderingContext2D, rig: Rig, look: Look, p: Platform, vl: number, vr: number, time: number, windy: boolean) {
  if (look.ground.kind === 'ash' || look.ground.kind === 'stone') return;
  const x0 = Math.max(p.x + 6, vl);
  const x1 = Math.min(p.x + p.width - 6, vr);
  if (x1 <= x0) return;
  const cols = [darken(look.ground.cap, 0.15), look.ground.cap, lighten(look.ground.capHi, 0.15)];
  const step = 11;
  const first = Math.floor(x0 / step);
  const last = Math.ceil(x1 / step);
  const paths = [new Path2D(), new Path2D(), new Path2D()];
  for (let i = first; i < last; i++) {
    const r = rng(i * 7919 + Math.floor(rig.terrain.mottle) + 3);
    const bx = i * step + r() * step;
    if (bx < p.x + 6 || bx > p.x + p.width - 6) continue;
    const h = 11 + r() * 15;
    const lean = (r() - 0.5) * h * 0.7;
    const sh = windy ? windShearAt(rig, time, bx) * h * 1.1 : 0;
    const ci = r() < 0.35 ? 0 : r() < 0.6 ? 1 : 2;
    const pa = paths[ci];
    const y = p.y + 2;
    const w = 1.9 + r() * 1.1;
    pa.moveTo(bx - w, y);
    pa.quadraticCurveTo(bx - w * 0.4 + lean * 0.35 + sh * 0.3, y - h * 0.55, bx + lean + sh, y - h);
    pa.quadraticCurveTo(bx + w * 0.4 + lean * 0.4 + sh * 0.3, y - h * 0.5, bx + w, y);
    pa.closePath();
  }
  for (let c = 0; c < 3; c++) {
    ctx.fillStyle = cols[c];
    ctx.fill(paths[c]);
  }
}

function windShearAt(rig: Rig, time: number, px: number): number {
  return (Math.sin(time * rig.wind.spd * 1.35 + px * 0.012 + rig.wind.phase) * 0.9 + Math.sin(time * 3.1 + px * 0.04) * 0.15) * rig.terrain.lean * gustAt(rig, time);
}

/** quartz and mica twinkling in the soil: a few sparse glints that catch the light as it shifts */
export function soilGlints(ctx: CanvasRenderingContext2D, rig: Rig, p: Platform, depth: number, vl: number, vr: number, time: number) {
  if (rig.terrain.glint < 0.2 || polishTier() >= 1) return;
  const x0 = Math.max(p.x, vl);
  const x1 = Math.min(p.x + p.width, vr);
  const step = 48;
  ctx.save();
  ctx.fillStyle = rig.rim;
  for (let sx = Math.floor(x0 / step) * step; sx < x1; sx += step) {
    const r = rng(Math.floor(sx / step) * 31337 + Math.floor(rig.terrain.mottle) + (p.height >= 50 ? 0 : p.id));
    if (r() > rig.terrain.glint * 0.7) continue;
    const gx = sx + r() * step;
    const gy = p.y + 36 + r() * Math.min(depth - 50, 200);
    const tw = Math.pow(Math.max(0, Math.sin(time * (0.7 + r() * 1.2) + r() * 6.28)), 6);
    if (tw < 0.05) continue;
    ctx.globalAlpha = tw * 0.9;
    const s = 1.2 + r() * 1.4;
    ctx.fillRect(gx - s, gy - 0.5, s * 2, 1);
    ctx.fillRect(gx - 0.5, gy - s, 1, s * 2);
  }
  ctx.restore();
}

/** a soft shadow under a rock or tuft sitting on the surface, thrown away from the light */
export function restShadow(ctx: CanvasRenderingContext2D, rig: Rig, x: number, y: number, rx: number) {
  ctx.save();
  ctx.translate(x - rig.lx * rx * 0.35, y);
  ctx.scale(1, 0.22);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx * 1.3);
  g.addColorStop(0, rgba(rig.shadow, 0.5));
  g.addColorStop(1, rgba(rig.shadow, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, rx * 1.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
