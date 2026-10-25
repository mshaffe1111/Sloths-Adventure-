/**
 * venomRig — draws the rebuilt Venom Fang (venomFang.ts) from Matt's 2026-10-24 Gemini pieces: a painted coil pile, the neck laid
 * along its spine in thin slices of the body tile (so it can bend up out of the coil and stretch right across the hollow), and a
 * painted head on the end. It stands in for the old painted boss (same PaintedBoss shape), and the story cards still ask it for the
 * old frame names, which it answers with the closest pose.
 */
import type { BossEntity } from './types.ts';
import type { BossDef } from './bossAI.ts';
import type { PaintedBoss } from './paintedBoss.ts';
import { trackAtlas } from './atlasLoader.ts';
import { VENOM2_FRAMES, VENOM2_PX, type VenomFrame } from './venom2AtlasData.ts';
import { VENOM_FRAMES } from './venomAtlasData.ts';
import { NECK, VF, coilCut, coilTop, venomPose, type CoilPose, type HeadPose } from './venomFang.ts';

const URL_ATLAS = new URL('../assets/enemies/venom2-atlas.webp', import.meta.url).href;
const K = VF.S / VENOM2_PX;

let atlas: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (atlas || typeof Image === 'undefined') return;
  const img = new Image();
  atlas = img;
  trackAtlas(img, URL_ATLAS, () => { ready = true; }, () => { atlas = null; }, () => { atlas = null; ready = false; });
}

/** a piece drawn with its anchor at (x, y) of the current frame */
function piece(ctx: CanvasRenderingContext2D, f: VenomFrame, x: number, y: number, sy = 1) {
  ctx.drawImage(atlas!, f.x, f.y, f.w, f.h, x - f.ax * K, y - f.ay * K * sy, f.w * K, f.h * K * sy);
}

/** the body's paint, sampled from the body tile Matt made (the back, its pale markings, the cream belly and the outline) */
const COL = { line: '#1d1210', back: '#4d8a73', backHi: '#5d9c83', mark: '#b4cdb8', belly: '#eed7b4', bellyLo: '#c9ad8e', plate: 'rgba(60,36,24,0.45)' };

/** points offset from the spine along its right-hand side (where the belly is), by d */
function offset(pts: Array<[number, number]>, d: number): Array<[number, number]> {
  return pts.map(([x, y], i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [x - ((b[1] - a[1]) / L) * d, y + ((b[0] - a[0]) / L) * d];
  });
}

function stroke(ctx: CanvasRenderingContext2D, pts: Array<[number, number]>, w: number, col: string) {
  ctx.strokeStyle = col;
  ctx.lineWidth = w;
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
}

/** the spine resampled at even steps, so the belly plates and the markings are evenly spaced however the spine was made */
function resample(pts: Array<[number, number]>, step: number): Array<[number, number]> {
  const out: Array<[number, number]> = [pts[0]];
  let carry = 0;
  for (let i = 0; i + 1 < pts.length; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const L = Math.hypot(x1 - x0, y1 - y0);
    let d = step - carry;
    while (d <= L) {
      out.push([x0 + ((x1 - x0) * d) / L, y0 + ((y1 - y0) * d) / L]);
      d += step;
    }
    carry = L - (d - step);
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/**
 * The neck, painted along the spine (local points) in the body's own colours: so it bends cleanly at any angle (slices of the
 * painted tile fanned out into teeth on the outside of a bend). Belly to the right of the way it runs.
 */
function neck(ctx: CanvasRenderingContext2D, raw: Array<[number, number]>, cap: CanvasLineCap = 'round') {
  if (raw.length < 2) return;
  const pts = resample(raw, 4);
  const W = NECK;
  ctx.save();
  ctx.lineCap = cap;
  ctx.lineJoin = 'round';
  stroke(ctx, pts, W + 4, COL.line);
  stroke(ctx, pts, W, COL.back);
  stroke(ctx, offset(pts, -W * 0.22), W * 0.12, COL.backHi);
  stroke(ctx, offset(pts, W * 0.3), W * 0.4, COL.belly);
  stroke(ctx, offset(pts, W * 0.42), W * 0.14, COL.bellyLo);
  stroke(ctx, offset(pts, W * 0.09), 1.8, 'rgba(29,18,16,0.75)');
  // the belly plates and the pale jagged markings
  const inner = offset(pts, W * 0.1);
  const outer = offset(pts, W * 0.49);
  ctx.strokeStyle = COL.plate;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let i = 2; i < pts.length - 2; i += 3) {
    ctx.moveTo(inner[i][0], inner[i][1]);
    ctx.lineTo(outer[i][0], outer[i][1]);
  }
  ctx.stroke();
  const top = offset(pts, -W * 0.46);
  const mid = offset(pts, -W * 0.12);
  ctx.strokeStyle = COL.mark;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 5; i < pts.length - 6; i += 11) {
    const k = i % 2 ? 1 : 0.7;
    ctx.moveTo(top[i][0], top[i][1]);
    ctx.lineTo(mid[i + 1][0] * k + top[i + 1][0] * (1 - k), mid[i + 1][1] * k + top[i + 1][1] * (1 - k));
    ctx.lineTo(top[i + 3][0], top[i + 3][1]);
  }
  ctx.stroke();
  ctx.restore();
}

/** the spine nudged a little into the coil and into the head, so neither join shows a gap */
function extendSpine(pts: Array<[number, number]>, into: number): Array<[number, number]> {
  if (pts.length < 2) return pts;
  const [ax, ay] = pts[0];
  const [bx, by] = pts[1];
  const la = Math.hypot(bx - ax, by - ay) || 1;
  const [cx, cy] = pts[pts.length - 2];
  const [dx, dy] = pts[pts.length - 1];
  const lb = Math.hypot(dx - cx, dy - cy) || 1;
  return [[ax - ((bx - ax) / la) * 10, ay - ((by - ay) / la) * 10], ...pts, [dx + ((dx - cx) / lb) * into, dy + ((dy - cy) / lb) * into]];
}

/** the warning: a line flashing along the floor where the head will sweep (local, from x0 to x1) */
function warnLine(ctx: CanvasRenderingContext2D, x0: number, x1: number, u: number, time: number) {
  const a = (0.35 + 0.45 * u) * (0.7 + 0.3 * Math.sin(time * 22));
  ctx.save();
  ctx.globalAlpha = a;
  const g = ctx.createLinearGradient(0, -26, 0, 4);
  g.addColorStop(0, 'rgba(250,204,21,0)');
  g.addColorStop(0.6, 'rgba(250,204,21,0.55)');
  g.addColorStop(1, 'rgba(254,240,138,0.95)');
  ctx.fillStyle = g;
  ctx.fillRect(Math.min(x0, x1), -26, Math.abs(x1 - x0), 30);
  // chevrons running the way the head will go
  ctx.fillStyle = '#fef08a';
  const dir = Math.sign(x1 - x0) || 1;
  const step = 70;
  const shift = ((time * 260) % step) * dir;
  for (let x = x0 + shift; dir > 0 ? x < x1 : x > x1; x += step * dir) {
    ctx.beginPath();
    ctx.moveTo(x, -16);
    ctx.lineTo(x + 14 * dir, -8);
    ctx.lineTo(x, 0);
    ctx.lineTo(x + 6 * dir, -8);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/**
 * One pose drawn in the local frame (x forward, y up from the floor at 0). The painted necks are trimmed off the coil and the heads,
 * so the drawn neck goes under both: the part inside the pile is drawn before the coil (it rises out of the ring's hole), the rest
 * after it (in the open air, where the two parts overlap without a seam), and the head is laid over the neck's end.
 */
function drawPose(ctx: CanvasRenderingContext2D, coil: CoilPose, head: HeadPose, spine: Array<[number, number]>, jx: number, jy: number, flash: boolean, squash: number) {
  const pts = extendSpine(spine, 26);
  const top = coilTop(coil) - 6;
  let k = pts.findIndex(([, y]) => y < top);
  if (k < 0) k = pts.length;
  neck(ctx, pts.slice(0, Math.min(pts.length, k + 3)));
  piece(ctx, VENOM2_FRAMES['coil_' + coil], 0, 0);
  if (k < pts.length - 1) neck(ctx, pts.slice(Math.max(0, k - 1)), 'butt');
  if (flash) ctx.filter = 'brightness(1.45)';
  piece(ctx, VENOM2_FRAMES['head_' + head], jx, jy, squash);
  ctx.filter = 'none';
}

/** the old frame names the story cards ask for, as poses of the new pieces */
const STILLS: Record<string, { coil: CoilPose; head: HeadPose }> = {
  idle: { coil: 'calm', head: 'calm' },
  n_idle: { coil: 'calm', head: 'calm' },
  threat: { coil: 'calm', head: 'hiss' },
  enrage: { coil: 'calm', head: 'angry' },
  enrageidle: { coil: 'calm', head: 'angry' },
  n_roar: { coil: 'calm', head: 'snap' },
  hurt: { coil: 'calm', head: 'hurt' },
  deathroar: { coil: 'calm', head: 'snap' },
  dead: { coil: 'slump', head: 'defeated' },
};
/** the story cards were laid out for the old painted frames: draw the new pose at the old size */
const STILL_K = (VENOM_FRAMES.idle.w * 0.95) / (VENOM2_FRAMES.coil_calm.w * K);

function stillSpine(coil: CoilPose, head: HeadPose): { pts: Array<[number, number]>; jx: number; jy: number } {
  const c = coilCut(coil);
  const jx = coil === 'slump' ? c.x + 40 : c.x + 10;
  const jy = coil === 'slump' ? c.y - 30 : -262;
  const f = VENOM2_FRAMES['head_' + head];
  const dx = f.dx ?? 0.35;
  const dy = f.dy ?? -0.94;
  const L = Math.hypot(jx - c.x, jy - c.y) * 0.45 + 10;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const m = 1 - t;
    const p1x = c.x + c.dx * L, p1y = c.y + c.dy * L, p2x = jx - dx * L, p2y = jy - dy * L;
    pts.push([m * m * m * c.x + 3 * m * m * t * p1x + 3 * m * t * t * p2x + t * t * t * jx, m * m * m * c.y + 3 * m * m * t * p1y + 3 * m * t * t * p2y + t * t * t * jy]);
  }
  return { pts, jx, jy };
}

export const venomRig: PaintedBoss & { rig: true } = {
  rig: true,
  active() {
    load();
    return ready;
  },
  still(ctx, name) {
    if (!this.active()) return false;
    const s = STILLS[name] ?? STILLS.idle;
    const sp = stillSpine(s.coil, s.head);
    ctx.save();
    ctx.scale(STILL_K, STILL_K);
    drawPose(ctx, s.coil, s.head, sp.pts, sp.jx, sp.jy, false, 1);
    ctx.restore();
    return true;
  },
  draw(ctx: CanvasRenderingContext2D, b: BossEntity, _def: BossDef, time: number, feetY: number) {
    if (!this.active()) return false;
    const f = b.facing < 0 ? -1 : 1;
    const p = venomPose(b, feetY, time);
    const toLocal = (wx: number, wy: number): [number, number] => [(wx - b.x) * f, wy - feetY];
    const spine = p.spine.map(([x, y]) => toLocal(x, y));
    const [jx, jy] = toLocal(p.jx, p.jy);
    ctx.save();
    ctx.translate(b.x, feetY);
    ctx.scale(f, 1);
    if (p.warn > 0) warnLine(ctx, coilCut('calm').x + 250, (p.warnTo - b.x) * f, p.warn, time);
    const hit = b.hitFlashTimer > 0.02;
    const squash = hit && p.head === 'dazed' ? 0.86 : 1;
    drawPose(ctx, p.coil, p.head, spine, jx, jy, hit, squash);
    ctx.restore();
    return true;
  },
};
