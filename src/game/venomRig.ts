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
import { drawFx, drawFxRun } from './bossFx.ts';
import { VENOM2_FRAMES, VENOM2_PX, type VenomFrame } from './venom2AtlasData.ts';
import { VENOM_FRAMES } from './venomAtlasData.ts';
import { NECK, VF, coilCut, coilTop, venomPose, type CoilPose, type HeadPose } from './venomFang.ts';
import { withHurtFlash } from './hurtFlash.ts';

const URL_ATLAS = new URL('../assets/enemies/venom2-atlas.webp', import.meta.url).href;
const K = VF.S / VENOM2_PX;

/** his painted body, a tile that repeats along the neck (Hugging Face img2img of his own colours, tools/art/hfbosses/venomcut.py) */
const URL_BODY = new URL('../assets/enemies/venom-body.webp', import.meta.url).href;

let atlas: HTMLImageElement | null = null;
let ready = false;
let body: HTMLImageElement | null = null;
let bodyReady = false;
function load() {
  if (typeof Image === 'undefined') return;
  if (!atlas) {
    const img = new Image();
    atlas = img;
    trackAtlas(img, URL_ATLAS, () => { ready = true; }, () => { atlas = null; }, () => { atlas = null; ready = false; });
  }
  if (!body) {
    const img = new Image();
    body = img;
    trackAtlas(img, URL_BODY, () => { bodyReady = true; }, () => { body = null; }, () => { body = null; bodyReady = false; });
  }
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
 * The neck: his painted body tile laid along the spine (local points) in short slices, so it bends with the spine and its scales run on
 * along the length; belly to the right of the way it runs. A plain two-tone tube stands in for the moment the tile is still loading.
 */
function neck(ctx: CanvasRenderingContext2D, raw: Array<[number, number]>, cap: CanvasLineCap = 'round') {
  if (raw.length < 2) return;
  const pts = resample(raw, 6);
  const W = NECK;
  if (bodyReady && body) {
    const im = body;
    const th = W + 6;
    const k = th / im.naturalHeight;
    const tileLen = im.naturalWidth * k;
    let u = 0;
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1];
      const [bx, by] = pts[i];
      const len = Math.hypot(bx - ax, by - ay);
      if (len < 0.01) continue;
      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(Math.atan2(by - ay, bx - ax));
      let done = 0;
      while (done < len - 0.001) {
        const at = (u + done) % tileLen;
        const part = Math.min(len - done, tileLen - at);
        // (a hair of overlap into the next slice, so the outside of a bend shows no gap)
        ctx.drawImage(im, at / k, 0, part / k, im.naturalHeight, done, -th / 2, part + 2, th);
        done += part;
      }
      ctx.restore();
      u += len;
    }
    return;
  }
  ctx.save();
  ctx.lineCap = cap;
  ctx.lineJoin = 'round';
  stroke(ctx, pts, W + 4, COL.line);
  stroke(ctx, pts, W, COL.back);
  stroke(ctx, offset(pts, W * 0.3), W * 0.4, COL.belly);
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

/**
 * The warning: where the head will sweep (local, from x0 to x1), with the shared painted marker pieces (bossFx.ts): a low glow over the
 * floor (a code touch), the painted scratch trail along it and the painted arrows racing the way the head will go.
 */
function warnLine(ctx: CanvasRenderingContext2D, x0: number, x1: number, u: number, time: number) {
  const a = (0.45 + 0.45 * u) * (0.75 + 0.25 * Math.sin(time * 22));
  ctx.save();
  ctx.globalAlpha = a;
  const g = ctx.createLinearGradient(0, -30, 0, 4);
  g.addColorStop(0, 'rgba(250,204,21,0)');
  g.addColorStop(1, 'rgba(254,200,90,0.6)');
  ctx.fillStyle = g;
  ctx.fillRect(Math.min(x0, x1), -30, Math.abs(x1 - x0), 34);
  drawFxRun(ctx, 'dashTrail', Math.min(x0, x1), Math.max(x0, x1), -3, 20);
  const dir = Math.sign(x1 - x0) || 1;
  const step = 110;
  const shift = ((time * 260) % step) * dir;
  ctx.globalAlpha = Math.min(1, a + 0.2);
  for (let x = x0 + shift; dir > 0 ? x < x1 : x > x1; x += step * dir) drawFx(ctx, 'warnArrow', x, -20, 40, { flipX: dir < 0 });
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
  // (a hit: the head flashes white, the shared hurt flash: hurtFlash.ts, AN-6)
  const hf = VENOM2_FRAMES['head_' + head];
  withHurtFlash(ctx, flash, jx - hf.ax * K, jy - hf.ay * K * squash, hf.w * K, hf.h * K * squash, (c) => piece(c, hf, jx, jy, squash));
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

/**
 * His body along the floor in a lunge (AN-7: it was a stiff straight tube): humps rising off the floor in a wave that runs back from the
 * head as he slides, settling to the ground at both ends so the joins at the coil and the head never move. Drawing only: the boxes that
 * hurt are venomFang.ts's and do not change.
 */
function slither(pts: Array<[number, number]>, head: HeadPose, time: number): Array<[number, number]> {
  if (head !== 'strike' && head !== 'dazed') return pts;
  const floorY = -NECK / 2;
  const first = pts.findIndex(([, y]) => Math.abs(y - floorY) < 3);
  if (first < 0 || first >= pts.length - 2) return pts;
  const x0 = pts[first][0];
  const x1 = pts[pts.length - 1][0];
  const span = x1 - x0;
  if (Math.abs(span) < 60) return pts;
  const amp = head === 'strike' ? 16 : 7;
  const out = pts.slice(0, first);
  // (resampled finely so the humps are round, not a few kinks)
  const n = Math.max(8, Math.ceil(Math.abs(span) / 12));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = x0 + span * t;
    const env = Math.sin(Math.PI * t);
    const wave = Math.sin(t * Math.PI * 2 * Math.max(1, Math.abs(span) / 260) + time * 9) ** 2;
    out.push([x, floorY - amp * env * wave]);
  }
  return out;
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
    const spine = slither(p.spine.map(([x, y]) => toLocal(x, y)), p.head, time);
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
