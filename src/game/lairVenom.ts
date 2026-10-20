/**
 * Venom Fang's lair: the Hollow. The world-1 jungle seen from inside a colossal strangler fig, so the fight happens in a green
 * twilight with a round opening in the canopy far above letting gold light fall in shafts, fireflies and spores drifting,
 * a mossy root-floor with glowing mushrooms, a clutch of jade eggs and a shed skin, giant trunks with hanging vines outside the
 * fence and a leaf canopy over the top of the view.
 *
 * Same three layers as the Drake's lair (see lairArt.ts): back (screen space), world, front (screen space), plus the objects pass in
 * lairVenomObjects.ts. This lair owns its whole scene: the engine does not draw the world's parallax or the world's trees, vines and
 * ledges for it. It is drawn in code, so it needs no new painting.
 */
import type { LairArena, LairView } from './lairArt.ts';

/** a tiny repeatable random so set pieces do not jitter from frame to frame */
function rand(i: number): number {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

const GLOW = '#bef264';
const GOLD = '#fde68a';

/**
 * 1. the whole backdrop, opaque: this lair does not borrow the world's scenery. Inside a hollow strangler fig: a deep green
 * wall of woven roots, a round opening in the canopy far above with gold light shafts, great buttress arches, hanging glow-pods,
 * distant mushrooms and a ground mist, with fireflies through all of it.
 */
export function drawVenomBack(ctx: CanvasRenderingContext2D, v: LairView, a: LairArena, time: number, bossX: number) {
  ctx.save();
  const W = v.vw;
  const H = v.vh;
  const floorY = a.floor - v.y;

  // the room: green-black at the sides and bottom, teal-lit toward the opening
  const base = ctx.createLinearGradient(0, 0, 0, H);
  base.addColorStop(0, '#0e3a2a');
  base.addColorStop(0.3, '#0a2a1b');
  base.addColorStop(0.65, '#071a10');
  base.addColorStop(1, '#030b06');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  // the opening in the canopy and the sky it lets in
  const ox = W * 0.5 + Math.sin(time * 0.12) * 14;
  const oy = Math.max(10, H * 0.02);
  const orad = Math.min(W, H) * 0.3;
  const sky = ctx.createRadialGradient(ox, oy, 4, ox, oy, orad * 2.8);
  sky.addColorStop(0, 'rgba(255, 246, 205, 1)');
  sky.addColorStop(0.16, 'rgba(236, 252, 160, 0.7)');
  sky.addColorStop(0.5, 'rgba(120, 200, 90, 0.22)');
  sky.addColorStop(1, 'rgba(60, 140, 70, 0)');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // far wall: a cage of woven roots, drifting slowly against the camera
  const span = W + 500;
  const weave = (count: number, par: number, wMin: number, wMax: number, col: string, hi: string, alpha: number) => {
    ctx.lineCap = 'round';
    for (let i = 0; i < count; i++) {
      const bx = ((((i + rand(i + par * 100) * 0.7) / count) * span - v.x * par) % span + span) % span - 250;
      const wd = wMin + rand(i + 4 + par * 50) * (wMax - wMin);
      const sw1 = (rand(i + 7) - 0.5) * 120;
      const sw2 = (rand(i + 8) - 0.5) * 120;
      const draw = (lw: number, c: string, dx: number) => {
        ctx.strokeStyle = c;
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.moveTo(bx + dx, -20);
        ctx.bezierCurveTo(bx + sw1 + dx, H * 0.3, bx + sw2 + dx, H * 0.62, bx + (rand(i + 1) - 0.5) * 60 + dx, floorY + 10);
        ctx.stroke();
      };
      ctx.globalAlpha = alpha;
      draw(wd, col, 0);
      ctx.globalAlpha = alpha * 0.55;
      draw(Math.max(2, wd * 0.18), hi, -wd * 0.25);
    }
    ctx.globalAlpha = 1;
  };
  weave(22, 0.14, 10, 30, '#0a2012', '#2f6a2a', 0.8);
  // the cross-roots between them, so it reads as woven and not as bars
  ctx.strokeStyle = 'rgba(6, 22, 12, 0.75)';
  ctx.lineWidth = 6;
  for (let i = 0; i < 14; i++) {
    const bx = ((((i * 0.0713 + rand(i + 60)) % 1) * span - v.x * 0.14) % span + span) % span - 250;
    const by = H * (0.1 + rand(i + 61) * 0.6);
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.bezierCurveTo(bx + 60, by + 20 * (rand(i) - 0.5), bx + 120, by + 40 * (rand(i + 3) - 0.5), bx + 190, by + 26);
    ctx.stroke();
  }

  // light shafts from the opening (added on top of the roots, so the roots cut them)
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 6; i++) {
    const sx = ox + (i - 2.5) * 70 + Math.sin(time * 0.25 + i) * 26;
    ctx.globalAlpha = 0.07 + 0.04 * Math.sin(time * 0.7 + i * 2);
    const gr = ctx.createLinearGradient(sx, oy, sx + (i - 2.5) * 50, H * 0.95);
    gr.addColorStop(0, 'rgba(255, 240, 170, 0.95)');
    gr.addColorStop(1, 'rgba(255, 240, 170, 0)');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(sx - 24, oy);
    ctx.lineTo(sx + 24, oy);
    ctx.lineTo(sx + (i - 2.5) * 90 + 120, H * 0.95);
    ctx.lineTo(sx + (i - 2.5) * 90 - 50, H * 0.95);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;

  // the fig's great buttress roots: tall dark arches, nearer than the weave
  const mid = (a.left + a.right) / 2;
  const cx = (mid - v.x) * 0.5 + W * 0.3;
  const baseY = floorY + 30;
  const h = Math.max(460, H * 1.0);
  for (let i = -3; i <= 3; i++) {
    const ax = cx + i * Math.max(300, W * 0.34);
    const w = 150 + rand(i + 20) * 60;
    const g = ctx.createLinearGradient(ax - w, 0, ax + w, 0);
    g.addColorStop(0, '#040d07');
    g.addColorStop(0.5, '#10230f');
    g.addColorStop(1, '#040d07');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(ax - w * 1.5, baseY);
    ctx.bezierCurveTo(ax - w * 0.6, baseY - h * 0.55, ax - w * 0.25, baseY - h * 0.9, ax - w * 0.12, baseY - h);
    ctx.lineTo(ax + w * 0.12, baseY - h);
    ctx.bezierCurveTo(ax + w * 0.25, baseY - h * 0.9, ax + w * 0.6, baseY - h * 0.55, ax + w * 1.5, baseY);
    ctx.closePath();
    ctx.fill();
    // a faint lit edge on the side facing the opening
    ctx.strokeStyle = 'rgba(190, 242, 100, 0.12)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ax + w * 0.12, baseY - h);
    ctx.bezierCurveTo(ax + w * 0.25, baseY - h * 0.9, ax + w * 0.6, baseY - h * 0.55, ax + w * 1.5, baseY);
    ctx.stroke();
  }

  // glow-pods hanging on cables from the canopy, swaying: the lair's lamps
  for (let i = 0; i < 9; i++) {
    const px = ((((i + 0.3 + rand(i + 40) * 0.5) / 9) * (W + 300) - v.x * 0.55) % (W + 300) + (W + 300)) % (W + 300) - 150;
    const len = H * (0.18 + rand(i + 41) * 0.42);
    const sw = Math.sin(time * 0.7 + i * 1.9) * 7;
    const glow = 0.55 + 0.45 * Math.sin(time * 1.6 + i * 2.3);
    ctx.strokeStyle = 'rgba(8, 24, 10, 0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px, -10);
    ctx.quadraticCurveTo(px + sw * 0.4, len * 0.5, px + sw, len);
    ctx.stroke();
    const pr = 9 + rand(i + 42) * 7;
    const g = ctx.createRadialGradient(px + sw, len + pr, 1, px + sw, len + pr, pr * 4.5);
    g.addColorStop(0, `rgba(190, 242, 100, ${0.45 * glow})`);
    g.addColorStop(1, 'rgba(190, 242, 100, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(px + sw - pr * 5, len + pr - pr * 5, pr * 10, pr * 10);
    const pg = ctx.createRadialGradient(px + sw - 2, len + pr - 3, 1, px + sw, len + pr, pr * 1.3);
    pg.addColorStop(0, '#f7fee7');
    pg.addColorStop(0.5, `rgba(190, 242, 100, ${0.7 + glow * 0.3})`);
    pg.addColorStop(1, '#3f6212');
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.ellipse(px + sw, len + pr, pr * 0.85, pr * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // far mushrooms standing on the distant floor, and a mist lying on it
  for (let i = 0; i < 12; i++) {
    const mx = ((((i + rand(i + 80) * 0.8) / 12) * (W + 400) - v.x * 0.7) % (W + 400) + (W + 400)) % (W + 400) - 200;
    const mh = 40 + rand(i + 81) * 70;
    const mr = 22 + rand(i + 82) * 24;
    ctx.fillStyle = '#0a1c10';
    ctx.fillRect(mx - 4, floorY - mh, 8, mh + 4);
    const glow = 0.5 + 0.5 * Math.sin(time * 1.2 + i * 1.3);
    ctx.fillStyle = `rgba(80, 160, 90, ${0.28 + glow * 0.18})`;
    ctx.beginPath();
    ctx.ellipse(mx, floorY - mh, mr, mr * 0.55, 0, Math.PI, 0);
    ctx.fill();
  }
  const mist = ctx.createLinearGradient(0, floorY - 150, 0, floorY + 20);
  mist.addColorStop(0, 'rgba(150, 220, 140, 0)');
  mist.addColorStop(1, `rgba(150, 220, 140, ${0.2 + 0.05 * Math.sin(time * 0.5)})`);
  ctx.fillStyle = mist;
  ctx.fillRect(0, floorY - 150, W, 170);

  // a green glow around the boss, so a huge dark shape does not vanish into the roots
  ctx.globalAlpha = 0.2;
  const bx = bossX - v.x;
  const hg = ctx.createRadialGradient(bx, floorY - 110, 20, bx, floorY - 110, 430);
  hg.addColorStop(0, 'rgba(163, 230, 53, 0.9)');
  hg.addColorStop(1, 'rgba(163, 230, 53, 0)');
  ctx.fillStyle = hg;
  ctx.fillRect(0, 0, W, H);

  // fireflies and spores drifting through the whole view
  for (let i = 0; i < 38; i++) {
    const ph = (time * (0.03 + rand(i) * 0.05) + rand(i + 50)) % 1;
    const ex = (rand(i + 9) * W * 1.1 + Math.sin(time * 0.6 + i) * 30 + W) % W;
    const ey = H * (0.95 - ph * 0.9) + Math.sin(time * 0.9 + i * 2) * 10;
    const tw = 0.5 + 0.5 * Math.sin(time * (1.5 + rand(i + 3)) + i);
    ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.85 * tw;
    ctx.fillStyle = i % 4 === 0 ? GOLD : GLOW;
    const r = 1.6 + rand(i + 3) * 2.4;
    ctx.beginPath();
    ctx.arc(ex, ey, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha *= 0.3;
    ctx.beginPath();
    ctx.arc(ex, ey, r * 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** 2. in the world: the root floor, glowing mushrooms, the egg nest and shed skin, giant trunks outside the fence */
export function drawVenomWorld(ctx: CanvasRenderingContext2D, a: LairArena, view: LairView, time: number) {
  const f = a.floor;
  const x0 = view.x - 40;
  const x1 = view.x + view.vw + 40;

  // the nest on the far right: a ring of woven vine round a clutch of pale jade, speckled eggs. A shed skin hangs over a root on the left
  ctx.save();
  const ex = a.right - 40;
  if (ex > x0 && ex < x1 + 400) {
    ctx.fillStyle = '#1a2a0e';
    ctx.beginPath();
    ctx.ellipse(ex, f - 6, 150, 20, 0, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#3f5a1c';
    ctx.lineWidth = 4;
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.ellipse(ex, f - 6, 150 - i * 3, 20 - i * 1.2, 0, Math.PI, 0);
      ctx.stroke();
    }
    for (let i = 0; i < 5; i++) {
      const gx = ex - 90 + i * 44 + (rand(i) - 0.5) * 12;
      const gy = f - 14 - (i % 2) * 8;
      const glow = 0.5 + 0.4 * Math.sin(time * 1.4 + i * 1.3);
      const eg = ctx.createRadialGradient(gx - 6, gy - 9, 3, gx, gy, 25);
      eg.addColorStop(0, '#f7fee7');
      eg.addColorStop(0.45, `rgba(190, 242, 100, ${0.55 + glow * 0.35})`);
      eg.addColorStop(1, '#3f6212');
      ctx.fillStyle = eg;
      ctx.beginPath();
      ctx.ellipse(gx, gy, 17, 23, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.4)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = 'rgba(54, 83, 20, .55)';
      for (let s = 0; s < 4; s++) {
        ctx.beginPath();
        ctx.arc(gx + (rand(i * 7 + s) - 0.5) * 20, gy + (rand(i * 5 + s + 2) - 0.5) * 30, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  const bx = a.left + 80;
  if (bx > x0 - 200 && bx < x1) {
    // a root arching over the floor, and a long pale skin draped across it
    ctx.strokeStyle = '#3b2a14';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(bx - 30, f - 6);
    ctx.bezierCurveTo(bx + 10, f - 80, bx + 90, f - 80, bx + 130, f - 6);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(226, 232, 200, .8)';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(bx - 10, f - 62);
    ctx.bezierCurveTo(bx + 20, f - 40, bx + 60, f - 96, bx + 100, f - 56);
    ctx.bezierCurveTo(bx + 120, f - 30, bx + 110, f - 14, bx + 150, f - 8);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(148, 163, 120, .65)';
    ctx.lineWidth = 2;
    for (let k = 0; k < 9; k++) {
      const t = k / 8;
      ctx.beginPath();
      ctx.moveTo(bx - 4 + t * 150, f - 58 + Math.sin(t * 6) * 22 - 5);
      ctx.lineTo(bx - 4 + t * 150, f - 58 + Math.sin(t * 6) * 22 + 5);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/** 3. over everything: a dark green vignette and the leaf canopy with vines hanging from it */
export function drawVenomFront(ctx: CanvasRenderingContext2D, v: LairView, time: number) {
  ctx.save();
  const vg = ctx.createRadialGradient(v.vw / 2, v.vh * 0.62, Math.min(v.vw, v.vh) * 0.35, v.vw / 2, v.vh * 0.62, Math.max(v.vw, v.vh) * 0.75);
  vg.addColorStop(0, 'rgba(2, 10, 5, 0)');
  vg.addColorStop(1, 'rgba(2, 10, 5, 0.6)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, v.vw, v.vh);

  // the canopy: dark leaf fans along the top edge, rim-lit from the opening, and vines swaying from it
  const cy = Math.min(v.vh * 0.2, 150);
  const cg = ctx.createLinearGradient(0, 0, 0, cy + 40);
  cg.addColorStop(0, 'rgba(3, 14, 6, 0.9)');
  cg.addColorStop(0.7, 'rgba(3, 14, 6, 0.45)');
  cg.addColorStop(1, 'rgba(3, 14, 6, 0)');
  ctx.fillStyle = cg;
  ctx.fillRect(0, 0, v.vw, cy + 40);
  for (let i = 0; i < 11; i++) {
    const lx = (i + rand(i + 1) * 0.6) * (v.vw / 10);
    const len = 40 + rand(i + 5) * 60;
    const sway = Math.sin(time * 0.8 + i) * 4;
    ctx.fillStyle = 'rgba(4, 18, 8, 0.96)';
    for (const [dx, ang] of [[0, 0], [-26, -0.5], [26, 0.5]] as const) {
      ctx.save();
      ctx.translate(lx + dx, -6);
      ctx.rotate(ang + sway * 0.01);
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.quadraticCurveTo(0, len * 1.1, 0, len);
      ctx.quadraticCurveTo(0, len * 1.1, 16, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle = `rgba(190, 242, 100, ${0.22 + 0.1 * Math.sin(time * 1.5 + i)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lx - 14, len * 0.15);
    ctx.lineTo(lx + 14, len * 0.15);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(8, 28, 10, 0.9)';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  for (let i = 0; i < 7; i++) {
    const vx = (i + 0.4 + rand(i + 12) * 0.4) * (v.vw / 7);
    const len = 70 + rand(i + 30) * 110;
    ctx.beginPath();
    ctx.moveTo(vx, 0);
    ctx.bezierCurveTo(vx + Math.sin(time * 0.9 + i) * 9, len * 0.4, vx - Math.sin(time * 0.7 + i) * 9, len * 0.7, vx + Math.sin(time * 0.8 + i * 2) * 7, len);
    ctx.stroke();
  }
  ctx.restore();
}
