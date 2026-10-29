/**
 * Crocus Rex's lair, part two: everything the hero touches, in the Mire's own style.
 *   - the floor is a cut-away of the river bank: wet mud with puddles that hold the moon, claw prints, reeds, and under it layers of clay,
 *     silt and gravel going down into dark river water
 *   - the ledges are stilt boardwalks: planks on posts driven into the mud, with rope lashings, a lantern or a crate
 *   - the moving ledge is a log slung on two ropes from the dark above, swinging side to side
 *   - the wall trunks are mangroves on arching prop roots, hung with moss; the climb vine is a rope ladder; the swing liana is a hemp
 *     rope swing with a wooden toggle
 *
 * Nothing here changes a box: every shape sits on the platform's own rectangle (top edge = p.y).
 */
import type { Platform, TreeStructure, Vine } from './types.ts';
import { drawLairRope, drawLairRopeLine } from './ropeArt.ts';

interface Cam {
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
}

function rand(i: number): number {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

const RIM = 'rgba(186, 230, 253, 0.55)';

// ───────────────────────────── the bank ─────────────────────────────

function drawMudBank(ctx: CanvasRenderingContext2D, p: Platform, cam: Cam, time: number) {
  const x0 = Math.max(p.x, cam.x - 160);
  const x1 = Math.min(p.x + p.width, cam.x + cam.viewportWidth + 160);
  if (x1 <= x0) return;
  const top = p.y;
  const bottom = cam.y + cam.viewportHeight + 60;
  const wob = (x: number, k: number) => Math.sin(x * 0.021 + k) * 3 + Math.sin(x * 0.057 + k * 2.1) * 2;

  // one wavy-edged band, fixed to the world
  const band = (y0: number, y1: number, k0: number, k1: number, fill: string | CanvasGradient) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(x0, y0 + wob(x0, k0));
    for (let x = x0; x <= x1 + 12; x += 12) ctx.lineTo(Math.min(x, x1), y0 + wob(x, k0));
    for (let x = x1; x >= x0 - 12; x -= 12) ctx.lineTo(Math.max(x, x0), y1 + wob(x, k1));
    ctx.closePath();
    ctx.fill();
  };

  const mud = ctx.createLinearGradient(0, top, 0, top + 50);
  mud.addColorStop(0, '#5b4838');
  mud.addColorStop(1, '#2f2419');
  band(top + 4, top + 50, 0, 1, mud);
  const clay = ctx.createLinearGradient(0, top + 46, 0, top + 92);
  clay.addColorStop(0, '#6a4f3a');
  clay.addColorStop(1, '#4a3829');
  band(top + 46, top + 92, 1, 2, clay);
  const silt = ctx.createLinearGradient(0, top + 88, 0, top + 130);
  silt.addColorStop(0, '#6f7b78');
  silt.addColorStop(1, '#3c4d52');
  band(top + 88, top + 130, 2, 3, silt);

  // the river under the bank
  const wy = top + 126;
  const water = ctx.createLinearGradient(0, wy, 0, Math.max(bottom, wy + 120));
  water.addColorStop(0, '#0f4a68');
  water.addColorStop(0.35, '#082d47');
  water.addColorStop(1, '#030a16');
  ctx.fillStyle = water;
  ctx.beginPath();
  ctx.moveTo(x0, bottom);
  ctx.lineTo(x0, wy + wob(x0, 3) + Math.sin(x0 * 0.03 + time * 1.5) * 2);
  for (let x = x0; x <= x1 + 12; x += 12) ctx.lineTo(Math.min(x, x1), wy + wob(x, 3) + Math.sin(Math.min(x, x1) * 0.03 + time * 1.5) * 2);
  ctx.lineTo(x1, bottom);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(186, 230, 253, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = x0; x <= x1; x += 12) {
    const y = wy + wob(x, 3) + Math.sin(x * 0.03 + time * 1.5) * 2;
    if (x === x0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // speckle of grit and pebbles in the layers, fixed to the world; weed fronds and a slow fish in the water
  const cell = 70;
  for (let cx = Math.floor(x0 / cell) - 1; cx <= Math.ceil(x1 / cell) + 1; cx++) {
    const sd = cx * 11 + 3;
    for (let k = 0; k < 3; k++) {
      const px = cx * cell + rand(sd + k) * cell;
      const py = top + 54 + rand(sd + k + 5) * 70;
      ctx.fillStyle = k === 0 ? 'rgba(190, 180, 160, 0.5)' : 'rgba(20, 14, 8, 0.4)';
      ctx.beginPath();
      ctx.ellipse(px, py, 3 + rand(sd + k + 9) * 5, 2 + rand(sd + k + 3) * 3, rand(sd + k) * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    // a crack in the mud
    ctx.strokeStyle = 'rgba(15, 10, 6, 0.5)';
    ctx.lineWidth = 1.6;
    const kx = cx * cell + rand(sd + 20) * cell;
    ctx.beginPath();
    ctx.moveTo(kx, top + 8);
    ctx.lineTo(kx + 6, top + 20);
    ctx.lineTo(kx - 2, top + 34);
    ctx.stroke();
    // weed
    const wx = cx * cell + rand(sd + 30) * cell;
    ctx.strokeStyle = 'rgba(30, 110, 90, 0.55)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(wx, bottom);
    ctx.bezierCurveTo(wx + Math.sin(time + cx) * 8, wy + 90, wx - Math.sin(time * 0.8 + cx) * 8, wy + 50, wx + Math.sin(time * 1.2 + cx) * 6, wy + 22 + rand(sd + 31) * 20);
    ctx.stroke();
  }

  // the wet top: a sheen, puddles holding the moon, claw prints, reed tufts, shells
  ctx.fillStyle = '#7a6552';
  ctx.fillRect(x0, top - 1, x1 - x0, 5);
  ctx.strokeStyle = RIM;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x0, top - 1);
  ctx.lineTo(x1, top - 1);
  ctx.stroke();
  for (let x = Math.floor(x0 / 130) * 130; x < x1; x += 130) {
    const sd = Math.floor(x / 130);
    const px = x + 30 + rand(sd + 40) * 70;
    const pw = 22 + rand(sd + 41) * 26;
    ctx.fillStyle = 'rgba(147, 197, 235, 0.55)';
    ctx.beginPath();
    ctx.ellipse(px, top + 1, pw, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.5)';
    ctx.lineWidth = 1;
    const rr = ((time * 0.7 + rand(sd + 42)) % 1) * pw;
    ctx.beginPath();
    ctx.ellipse(px, top + 1, rr, rr * 0.14, 0, 0, Math.PI * 2);
    ctx.stroke();
    // three-toed claw print
    const cx2 = px + pw + 22;
    ctx.strokeStyle = 'rgba(18, 12, 8, 0.65)';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    for (const dx of [-5, 0, 5]) {
      ctx.beginPath();
      ctx.moveTo(cx2, top + 3);
      ctx.lineTo(cx2 + dx * 1.2, top - 3);
      ctx.stroke();
    }
  }
  for (let x = Math.floor(x0 / 46) * 46; x < x1; x += 46) {
    const sd = Math.floor(x / 46);
    if (rand(sd + 60) < 0.45) continue;
    const rh = 12 + rand(sd + 61) * 22;
    const sw = Math.sin(time * 1.3 + sd) * 2.4;
    ctx.strokeStyle = rand(sd + 62) < 0.5 ? '#1c4a3a' : '#123628';
    ctx.lineWidth = 2.2;
    for (const d of [-1, 0, 1]) {
      ctx.beginPath();
      ctx.moveTo(x + 6 + d * 3, top);
      ctx.quadraticCurveTo(x + 6 + d * 6 + sw, top - rh * 0.6, x + 6 + d * 11 + sw * 1.4, top - rh);
      ctx.stroke();
    }
  }
}

// ───────────────────────────── boardwalks on stilts ─────────────────────────────

function drawPost(ctx: CanvasRenderingContext2D, x: number, y0: number, y1: number, seed: number) {
  const w = 13;
  const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
  g.addColorStop(0, '#2a2014');
  g.addColorStop(0.7, '#4a3a28');
  g.addColorStop(1, '#6a7a82');
  ctx.fillStyle = g;
  ctx.fillRect(x - w / 2, y0, w, y1 - y0);
  ctx.strokeStyle = '#0a0705';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - w / 2, y0, w, y1 - y0);
  ctx.strokeStyle = 'rgba(8, 5, 3, 0.45)';
  ctx.lineWidth = 1.4;
  for (let y = y0 + 12; y < y1; y += 18) {
    const jx = (rand(seed + y) - 0.5) * 3;
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y + jx);
    ctx.lineTo(x + w / 2, y - jx);
    ctx.stroke();
  }
  // a rope lashing, and the green-brown stain where the river reaches the post
  ctx.strokeStyle = '#bda878';
  ctx.lineWidth = 3;
  for (const y of [y0 + 14, y0 + 20]) {
    ctx.beginPath();
    ctx.moveTo(x - w / 2 - 1, y);
    ctx.lineTo(x + w / 2 + 1, y + 3);
    ctx.stroke();
  }
  const stain = ctx.createLinearGradient(0, y1 - 40, 0, y1);
  stain.addColorStop(0, 'rgba(20, 60, 50, 0)');
  stain.addColorStop(1, 'rgba(20, 60, 50, 0.6)');
  ctx.fillStyle = stain;
  ctx.fillRect(x - w / 2, y1 - 40, w, 40);
  ctx.strokeStyle = RIM;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x + w / 2 - 1, y0);
  ctx.lineTo(x + w / 2 - 1, y1);
  ctx.stroke();
}

function drawBoardwalk(ctx: CanvasRenderingContext2D, p: Platform, groundY: number, time: number) {
  const w = p.width;
  const seed = p.id * 17;
  // posts under the deck, down into the mud, with a cross-brace between the outer pair when they are tall
  const posts = w > 200 ? [14, w / 2, w - 14] : [14, w - 14];
  const tall = groundY - (p.y + p.height) > 50;
  if (tall) {
    ctx.strokeStyle = '#2a2014';
    ctx.lineWidth = 7;
    ctx.beginPath();
    const yb = groundY - 8;
    const yt = p.y + p.height + 16;
    ctx.moveTo(p.x + posts[0], yb);
    ctx.lineTo(p.x + posts[posts.length - 1], yt);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.18)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }
  for (let i = 0; i < posts.length; i++) drawPost(ctx, p.x + posts[i], p.y + 8, groundY + 6, seed + i);
  // a splash of mud where each post goes in
  ctx.fillStyle = '#3a2d20';
  for (const px of posts) {
    ctx.beginPath();
    ctx.ellipse(p.x + px, groundY + 1, 13, 4, 0, Math.PI, 0);
    ctx.fill();
  }

  // the stringer beam under the planks
  ctx.fillStyle = '#2d2215';
  ctx.fillRect(p.x - 4, p.y + 9, w + 8, p.height - 9);
  ctx.strokeStyle = '#0a0705';
  ctx.lineWidth = 2.4;
  ctx.strokeRect(p.x - 4, p.y + 9, w + 8, p.height - 9);
  ctx.strokeStyle = 'rgba(186, 230, 253, 0.25)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(p.x - 3, p.y + p.height - 1);
  ctx.lineTo(p.x + w + 3, p.y + p.height - 1);
  ctx.stroke();

  // the planks: uneven, with gaps, a split end or two and nail heads
  const cols = ['#6b5238', '#5a4430', '#7a5e40', '#4d3a28'];
  let x = p.x - 2;
  let i = 0;
  while (x < p.x + w + 2) {
    const pw = Math.min(14 + rand(seed + i) * 14, p.x + w + 2 - x);
    ctx.fillStyle = cols[Math.floor(rand(seed + i + 3) * cols.length)];
    ctx.fillRect(x, p.y, pw - 1.5, 10);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.fillRect(x, p.y, pw - 1.5, 2);
    ctx.fillStyle = 'rgba(8, 5, 3, 0.7)';
    ctx.fillRect(x + 2, p.y + 4, 1.8, 1.8);
    ctx.fillRect(x + pw - 5, p.y + 4, 1.8, 1.8);
    x += pw;
    i++;
  }
  ctx.strokeStyle = '#0a0705';
  ctx.lineWidth = 2;
  ctx.strokeRect(p.x - 2, p.y, w + 4, 10);
  ctx.strokeStyle = RIM;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(p.x - 2, p.y);
  ctx.lineTo(p.x + w + 2, p.y);
  ctx.stroke();

  // a trailing moss tuft and a rope end hanging over the edge
  ctx.strokeStyle = 'rgba(40, 90, 70, 0.8)';
  ctx.lineWidth = 3;
  for (let k = 0; k < 3; k++) {
    const mx = p.x + 10 + rand(seed + k + 30) * (w - 20);
    ctx.beginPath();
    ctx.moveTo(mx, p.y + p.height);
    ctx.quadraticCurveTo(mx + Math.sin(time + k) * 3, p.y + p.height + 12, mx + Math.sin(time * 1.2 + k) * 4, p.y + p.height + 22);
    ctx.stroke();
  }

  // the dressing: a lantern on a hook on the wide ones, a crate and a coil of rope on the others
  if (w >= 150) {
    const lx = p.x + w - 24;
    ctx.strokeStyle = '#2a2014';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(lx, p.y);
    ctx.lineTo(lx, p.y - 46);
    ctx.quadraticCurveTo(lx - 10, p.y - 54, lx - 18, p.y - 46);
    ctx.stroke();
    const fl = 0.8 + 0.2 * Math.sin(time * 9 + p.id) + 0.1 * Math.sin(time * 23 + p.id * 3);
    const lg = ctx.createRadialGradient(lx - 18, p.y - 36, 2, lx - 18, p.y - 36, 74);
    lg.addColorStop(0, `rgba(253, 224, 120, ${0.5 * fl})`);
    lg.addColorStop(1, 'rgba(253, 190, 80, 0)');
    ctx.fillStyle = lg;
    ctx.fillRect(lx - 92, p.y - 110, 150, 150);
    ctx.fillStyle = '#1c1409';
    ctx.fillRect(lx - 25, p.y - 44, 14, 3);
    ctx.fillRect(lx - 25, p.y - 24, 14, 3);
    ctx.fillStyle = `rgba(255, 226, 130, ${0.8 + 0.2 * fl})`;
    ctx.strokeStyle = '#1c1409';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(lx - 24, p.y - 42, 12, 18, 2);
    ctx.fill();
    ctx.stroke();
  } else {
    const cx = p.x + w * 0.62;
    ctx.fillStyle = '#6b5238';
    ctx.strokeStyle = '#0a0705';
    ctx.lineWidth = 2;
    ctx.fillRect(cx, p.y - 24, 26, 24);
    ctx.strokeRect(cx, p.y - 24, 26, 24);
    ctx.strokeStyle = '#3a2c1c';
    ctx.beginPath();
    ctx.moveTo(cx, p.y - 24);
    ctx.lineTo(cx + 26, p.y);
    ctx.moveTo(cx + 26, p.y - 24);
    ctx.lineTo(cx, p.y);
    ctx.stroke();
  }
}

// ───────────────────────────── the swinging log ─────────────────────────────

function drawHangingLog(ctx: CanvasRenderingContext2D, p: Platform, cam: Cam, time: number) {
  const top = cam.y - 30;
  const ax = (p.baseX ?? p.x) + p.width / 2;
  // two ropes, meeting high above, so the log swings like a pendulum
  ctx.lineCap = 'round';
  for (const [dx, ex] of [[16, -26], [p.width - 16, 26]] as const) drawLairRopeLine(ctx, p.x + dx, p.y + 4, ax + ex, top, 7, null, '#b8a070');
  // the log: a rounded trunk, bark ridges, grain rings on the ends, rope lashings
  const w = p.width;
  const h = p.height;
  const g = ctx.createLinearGradient(0, p.y, 0, p.y + h + 6);
  g.addColorStop(0, '#7b6446');
  g.addColorStop(0.3, '#5c4630');
  g.addColorStop(1, '#2a1f14');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(p.x, p.y, w, h + 2, 12);
  ctx.fill();
  ctx.strokeStyle = '#0a0705';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(8, 5, 3, 0.45)';
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 4; i++) {
    const y = p.y + 6 + i * 6;
    ctx.beginPath();
    ctx.moveTo(p.x + 14, y);
    for (let x = p.x + 14; x < p.x + w - 14; x += 16) ctx.lineTo(x + 8, y + (rand(p.id * 3 + x) - 0.5) * 3);
    ctx.stroke();
  }
  for (const ex of [p.x + 3, p.x + w - 3]) {
    ctx.fillStyle = '#c9a97a';
    ctx.beginPath();
    ctx.ellipse(ex, p.y + h / 2 + 1, 6, h / 2 - 1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#6b4e2c';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(ex, p.y + h / 2 + 1, 3.2, h / 4, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = '#bda878';
  ctx.lineWidth = 4;
  for (const dx of [16, w - 16]) {
    ctx.beginPath();
    ctx.moveTo(p.x + dx, p.y - 1);
    ctx.lineTo(p.x + dx, p.y + h + 2);
    ctx.stroke();
  }
  // moss on top, moonlit edge
  ctx.fillStyle = 'rgba(40, 110, 80, 0.85)';
  for (let k = 0; k < 4; k++) {
    const mx = p.x + 30 + rand(p.id + k) * (w - 60);
    ctx.beginPath();
    ctx.ellipse(mx, p.y + 1, 9 + rand(p.id + k + 7) * 8, 3.4, 0, Math.PI, 0);
    ctx.fill();
  }
  ctx.strokeStyle = RIM;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(p.x + 10, p.y + 0.5);
  ctx.lineTo(p.x + w - 10, p.y + 0.5);
  ctx.stroke();
  // drip: water falls from the underside now and then
  const dphase = (time * 0.8 + p.id) % 1;
  ctx.fillStyle = 'rgba(147, 197, 235, 0.7)';
  ctx.beginPath();
  ctx.arc(p.x + w * 0.4, p.y + h + 4 + dphase * 24, 1.8, 0, Math.PI * 2);
  ctx.fill();
}

// ───────────────────────────── trunks ─────────────────────────────

function drawMangroveTrunk(ctx: CanvasRenderingContext2D, t: TreeStructure, cam: Cam, time: number) {
  const top = cam.y - 40;
  const bottom = t.groundY + 4;
  const half = 52;
  ctx.save();
  const g = ctx.createLinearGradient(t.x - half, 0, t.x + half, 0);
  g.addColorStop(0, '#07131d');
  g.addColorStop(0.55, '#102a3a');
  g.addColorStop(0.92, '#2a5670');
  g.addColorStop(1, '#4d8fb0');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(t.x - half * 0.8, top);
  ctx.lineTo(t.x + half * 0.8, top);
  for (let y = top; y <= bottom; y += 40) ctx.lineTo(t.x + half * (0.8 + 0.15 * Math.sin(y * 0.01 + t.id)) + (y > bottom - 120 ? (y - (bottom - 120)) * 0.15 : 0), y);
  ctx.lineTo(t.x + half * 1.15, bottom);
  ctx.lineTo(t.x - half * 1.15, bottom);
  for (let y = bottom; y >= top; y -= 40) ctx.lineTo(t.x - half * (0.8 + 0.15 * Math.sin(y * 0.013 + t.id * 2)) - (y > bottom - 120 ? (y - (bottom - 120)) * 0.15 : 0), y);
  ctx.closePath();
  ctx.fill();
  // bark furrows, knots and wet gleam
  ctx.strokeStyle = 'rgba(2, 8, 14, 0.55)';
  ctx.lineWidth = 3;
  for (let r = 0; r < 6; r++) {
    const rx = t.x - half * 0.7 + r * (half * 0.28);
    ctx.beginPath();
    for (let y = top; y <= bottom; y += 36) ctx.lineTo(rx + Math.sin(y * 0.02 + r + t.id) * 5, y);
    ctx.stroke();
  }
  for (let y = top + 90; y < bottom - 100; y += 170) {
    const sd = Math.floor(y / 170) + t.id * 3;
    ctx.fillStyle = 'rgba(2, 8, 14, 0.7)';
    ctx.beginPath();
    ctx.ellipse(t.x + (rand(sd) - 0.5) * half, y, 9 + rand(sd + 1) * 6, 14 + rand(sd + 2) * 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(186, 230, 253, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(t.x + half * 0.82, top);
  for (let y = top; y <= bottom - 110; y += 40) ctx.lineTo(t.x + half * (0.82 + 0.1 * Math.sin(y * 0.01 + t.id)), y);
  ctx.stroke();
  // moss draped over the trunk at a few heights: soft, swaying strands, not hard shapes
  ctx.lineCap = 'round';
  for (let y = top + 120; y < bottom - 140; y += 190) {
    const sd = Math.floor(y / 190) + t.id * 7;
    for (let m = -4; m <= 4; m++) {
      const mx = t.x + m * 11 + (rand(sd + m) - 0.5) * 6;
      const ml = 30 + rand(sd + m + 10) * 56;
      const sw = Math.sin(time * 0.8 + m + sd) * 4;
      ctx.strokeStyle = `rgba(110, 160, 150, ${0.16 + rand(sd + m + 20) * 0.14})`;
      ctx.lineWidth = 2.6 + rand(sd + m + 30) * 2.4;
      ctx.beginPath();
      ctx.moveTo(mx, y + Math.abs(m) * 2);
      ctx.bezierCurveTo(mx + sw * 0.4, y + ml * 0.35, mx - sw * 0.5, y + ml * 0.7, mx + sw * 1.4, y + ml);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/** the arching prop roots at the foot of a mangrove, drawn after the bank so they stand on it */
function drawPropRoots(ctx: CanvasRenderingContext2D, t: TreeStructure) {
  ctx.save();
  const y = t.groundY;
  ctx.lineCap = 'round';
  for (const side of [-1, 1] as const) {
    for (let r = 0; r < 3; r++) {
      const reach = 70 + r * 48;
      const h = 130 - r * 30;
      ctx.strokeStyle = '#030a10';
      ctx.lineWidth = 16 - r * 3;
      ctx.beginPath();
      ctx.moveTo(t.x + side * (10 + r * 8), y - h - 20);
      ctx.bezierCurveTo(t.x + side * (reach * 0.4), y - h, t.x + side * (reach * 0.9), y - h * 0.5, t.x + side * reach, y + 3);
      ctx.stroke();
      ctx.strokeStyle = '#143348';
      ctx.lineWidth = 11 - r * 2.4;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.28)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(t.x + side * (10 + r * 8) + 3, y - h - 20);
      ctx.bezierCurveTo(t.x + side * (reach * 0.4) + 3, y - h, t.x + side * (reach * 0.9) + 3, y - h * 0.5, t.x + side * reach + 3, y + 1);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// ───────────────────────────── ropes ─────────────────────────────

function ropeCurve(v: Vine, time: number, calm: boolean) {
  const len = v.bottomY - v.topY;
  const swinging = v.isSwingingVine && v.swingAngle !== undefined;
  const ang = swinging ? v.swingAngle || 0 : Math.sin(time * v.swaySpeed + v.swayPhase) * (calm ? 0.02 : 0.1);
  const tipX = v.x + Math.sin(ang) * len;
  const tipY = v.topY + Math.cos(ang) * len;
  const midX = (v.x + tipX) * 0.5 + Math.sin(ang * 0.5) * 12;
  const midY = (v.topY + tipY) * 0.5;
  const at = (u: number) => ({
    x: (1 - u) * (1 - u) * v.x + 2 * (1 - u) * u * midX + u * u * tipX,
    y: (1 - u) * (1 - u) * v.topY + 2 * (1 - u) * u * midY + u * u * tipY,
  });
  return { at, tipX, tipY, len, ang };
}

function trace(ctx: CanvasRenderingContext2D, at: (u: number) => { x: number; y: number }, N: number) {
  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const p = at(i / N);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
}

/** the climb vine: a knotted hemp rope with wooden rungs, so it reads as a ladder up the trunk */
function drawRopeLadder(ctx: CanvasRenderingContext2D, v: Vine, time: number) {
  const { at, len } = ropeCurve(v, time, true);
  const N = Math.max(14, Math.floor(len / 10));
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(253, 230, 138, 0.16)';
  ctx.lineWidth = 24;
  trace(ctx, at, N);
  ctx.stroke();
  drawLairRope(ctx, at, N, 9, null, '#c9b184');
  // rungs
  for (let i = 1; i < N; i += 4) {
    const p = at(i / N);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(Math.sin(time * 1.1 + i) * 0.04);
    ctx.fillStyle = '#6b5238';
    ctx.strokeStyle = '#0a0705';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-17, -3.5, 34, 7, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.fillRect(-14, -3, 28, 1.6);
    ctx.restore();
  }
  ctx.restore();
}

/** the swing: a hemp rope from a cable up in the dark, with a wooden toggle for a handle */
function drawRopeSwing(ctx: CanvasRenderingContext2D, v: Vine, cam: Cam, time: number) {
  const { at, tipX, tipY, len, ang } = ropeCurve(v, time, false);
  const N = Math.max(16, Math.floor(len / 9));
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const topEdge = cam.y - 30;
  drawLairRopeLine(ctx, v.x, v.topY, v.x, topEdge, 8, '#c8b8a0', '#8f7a52');
  // an iron ring where the rope joins the cable
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.arc(v.x, v.topY - 3, 7, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(253, 230, 138, 0.14)';
  ctx.lineWidth = 22;
  trace(ctx, at, N);
  ctx.stroke();
  drawLairRope(ctx, at, N, 10, null, '#c9b184');
  // knots
  ctx.fillStyle = '#b39a68';
  ctx.strokeStyle = '#0a0705';
  ctx.lineWidth = 1.8;
  for (let i = 4; i < N - 2; i += 7) {
    const p = at(i / N);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  // the toggle
  ctx.save();
  ctx.translate(tipX, tipY);
  ctx.rotate(-ang);
  ctx.fillStyle = '#6b5238';
  ctx.strokeStyle = '#0a0705';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.roundRect(-18, 2, 36, 11, 5);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.fillRect(-14, 4, 28, 2);
  ctx.restore();
  ctx.restore();
}

// ───────────────────────────── entry ─────────────────────────────

export function drawCrocObjects(ctx: CanvasRenderingContext2D, platforms: Platform[], vines: Vine[], trees: TreeStructure[], cam: Cam, time: number) {
  const left = cam.x - 200;
  const right = cam.x + cam.viewportWidth + 200;
  const ground = platforms.find((p) => p.height >= 50);
  const groundY = ground ? ground.y : cam.y + cam.viewportHeight;

  for (const t of trees) {
    if (t.x + 130 < left || t.x - 130 > right) continue;
    drawMangroveTrunk(ctx, t, cam, time);
  }
  for (const v of vines) {
    if (v.x < left || v.x > right || v.vineType === 'swing_liana') continue;
    drawRopeLadder(ctx, v, time);
  }
  // the bank, then the boardwalks standing on it
  for (const p of platforms) {
    if (p.height >= 50 && !p.broken) {
      ctx.save();
      drawMudBank(ctx, p, cam, time);
      ctx.restore();
    }
  }
  for (const p of platforms) {
    if (p.height >= 50 || p.broken || p.x + p.width < left - 200 || p.x > right + 200) continue;
    ctx.save();
    if (p.type === 'moving') drawHangingLog(ctx, p, cam, time);
    else drawBoardwalk(ctx, p, groundY, time);
    ctx.restore();
  }
  for (const t of trees) {
    if (t.x + 200 < left || t.x - 200 > right) continue;
    drawPropRoots(ctx, t);
  }
  for (const v of vines) {
    if (v.vineType !== 'swing_liana' || v.x < left || v.x > right) continue;
    drawRopeSwing(ctx, v, cam, time);
  }
}
