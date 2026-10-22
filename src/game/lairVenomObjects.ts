/**
 * Venom Fang's lair, part two: everything the hero touches is drawn here instead of in the world-1 style.
 *   - the floor is a bed of tangled roots under a mossy lip, with veins of glowing fungus in the soil
 *   - the ledges are root cradles that hang from the canopy on cables, with moss on top and glowing beads underneath
 *   - the bounce mushrooms are big jade-teal caps with a pulsing lime rim, so you can always tell where to bounce
 *   - the two wall trunks are braided strangler-fig roots; the climb vine is a glossy jade liana with glowing buds
 *   - the swing liana is a plaited rope with a glowing seed pod at its end, hung from a cable that goes up into the canopy
 *
 * Nothing here changes a box: every shape sits on the platform's own rectangle (top edge = p.y), so what you see is what you land on.
 */
import { glowPic } from './glow.ts';
import type { Platform, TreeStructure, Vine } from './types.ts';

interface Cam {
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
}

const LIME = '#bef264';

/**
 * The lime glow behind a lit thing, as one cached picture. A canvas shadow blur costs a separate blur pass every time it is used, and the lair
 * used it dozens of times a frame (the floor's fungus veins, every bead and cap), which a phone cannot keep up with.
 */
function halo(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a: number) {
  if (a <= 0.01 || r <= 0.5) return;
  const prev = ctx.globalAlpha;
  ctx.globalAlpha = prev * Math.min(1, a);
  ctx.drawImage(glowPic(LIME), x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = prev;
}

function rand(i: number): number {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/** 1 → a lit tuft of fern / grass fronds, used on lips and ledges */
function tuft(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, lean: number, col: string) {
  ctx.fillStyle = col;
  for (let k = -1; k <= 1; k++) {
    ctx.beginPath();
    ctx.moveTo(x + k * 3 - 2, y);
    ctx.quadraticCurveTo(x + k * 4 + lean * 0.5, y - h * 0.6, x + k * 7 + lean, y - h * (k === 0 ? 1 : 0.7));
    ctx.quadraticCurveTo(x + k * 4 + lean * 0.5 + 3, y - h * 0.5, x + k * 3 + 2, y);
    ctx.closePath();
    ctx.fill();
  }
}

/** a small glowing mushroom group on a surface */
function glowShroom(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, time: number, seed: number) {
  const n = 2 + Math.floor(rand(seed) * 2);
  for (let i = 0; i < n; i++) {
    const mx = x + (i - (n - 1) / 2) * 11 * s + (rand(seed + i) - 0.5) * 4;
    const mh = (9 + rand(seed + i * 3) * 10) * s;
    const glow = 0.6 + 0.4 * Math.sin(time * 2 + seed + i);
    ctx.fillStyle = '#e7f5c4';
    ctx.fillRect(mx - 1.5 * s, y - mh, 3 * s, mh);
    halo(ctx, mx, y - mh, (11 + 9 * glow) * s, 0.55 * glow + 0.1);
    ctx.fillStyle = `rgba(190, 242, 100, ${0.6 + glow * 0.35})`;
    ctx.beginPath();
    ctx.ellipse(mx, y - mh, (6 + rand(seed + i + 9) * 3) * s, 4.5 * s, 0, Math.PI, 0);
    ctx.fill();
  }
}

// ───────────────────────────── floor ─────────────────────────────

function drawRootBed(ctx: CanvasRenderingContext2D, p: Platform, cam: Cam, time: number) {
  const x0 = Math.max(p.x, cam.x - 160);
  const x1 = Math.min(p.x + p.width, cam.x + cam.viewportWidth + 160);
  if (x1 <= x0) return;
  const top = p.y;
  const bottom = cam.y + cam.viewportHeight + 60;

  // the soil: warm peat under the lip, going to black
  const g = ctx.createLinearGradient(0, top, 0, Math.max(bottom, top + 200));
  g.addColorStop(0, '#3b2c14');
  g.addColorStop(0.18, '#241a0c');
  g.addColorStop(0.6, '#0f0b06');
  g.addColorStop(1, '#040502');
  ctx.fillStyle = g;
  ctx.fillRect(x0, top + 6, x1 - x0, bottom - top);

  // a tangle of roots through the soil, a pattern fixed to the world so it does not slide when the camera moves
  const cell = 120;
  for (let cx = Math.floor(x0 / cell) - 1; cx <= Math.ceil(x1 / cell) + 1; cx++) {
    for (let row = 0; row < 3; row++) {
      const seed = cx * 7 + row * 31;
      const sx = cx * cell + rand(seed) * cell;
      const sy = top + 22 + row * 52 + rand(seed + 1) * 18;
      if (sy > bottom) continue;
      const dir = rand(seed + 2) < 0.5 ? -1 : 1;
      const len = 90 + rand(seed + 3) * 110;
      const dip = 20 + rand(seed + 4) * 34;
      ctx.lineCap = 'round';
      ctx.strokeStyle = `rgba(8, 6, 2, 0.8)`;
      ctx.lineWidth = 12 - row * 2.5;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(sx + dir * len * 0.3, sy + dip, sx + dir * len * 0.7, sy - dip * 0.6, sx + dir * len, sy + dip * 0.5);
      ctx.stroke();
      ctx.strokeStyle = row === 0 ? '#5a4220' : row === 1 ? '#45331a' : '#2f2312';
      ctx.lineWidth = 8 - row * 2;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(214, 180, 110, 0.22)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx, sy - 2);
      ctx.bezierCurveTo(sx + dir * len * 0.3, sy + dip - 2, sx + dir * len * 0.7, sy - dip * 0.6 - 2, sx + dir * len, sy + dip * 0.5 - 2);
      ctx.stroke();
    }
    // a pale stone or two, and a vein of glowing fungus in the dark
    const sd = cx * 13 + 5;
    ctx.fillStyle = 'rgba(120, 113, 92, 0.55)';
    ctx.beginPath();
    ctx.ellipse(cx * cell + rand(sd) * cell, top + 40 + rand(sd + 1) * 90, 5 + rand(sd + 2) * 6, 3.5 + rand(sd + 3) * 3, rand(sd + 4), 0, Math.PI * 2);
    ctx.fill();
    const pulse = 0.28 + 0.2 * Math.sin(time * 1.3 + cx);
    const vx = cx * cell + rand(sd + 5) * cell;
    const vy = top + 70 + rand(sd + 6) * 120;
    ctx.beginPath();
    ctx.moveTo(vx, vy);
    ctx.bezierCurveTo(vx + 14, vy + 10, vx + 26, vy - 8, vx + 44, vy + 6);
    // the glow is a wider, fainter line under the bright one (no blur pass)
    ctx.strokeStyle = `rgba(190, 242, 100, ${pulse * 0.32})`;
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.strokeStyle = `rgba(190, 242, 100, ${pulse})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // the lip: thick moss, scalloped underneath, bright at its edge
  const lipH = 17;
  const lg = ctx.createLinearGradient(0, top - 2, 0, top + lipH + 8);
  lg.addColorStop(0, '#6f9c20');
  lg.addColorStop(0.4, '#40631a');
  lg.addColorStop(1, '#22360e');
  ctx.fillStyle = lg;
  ctx.beginPath();
  ctx.moveTo(x0, top - 2);
  ctx.lineTo(x1, top - 2);
  const stepX = 22;
  for (let x = Math.ceil(x1 / stepX) * stepX; x >= Math.floor(x0 / stepX) * stepX; x -= stepX) {
    const d = 5 + rand(Math.floor(x / stepX) * 3) * 11;
    ctx.lineTo(x, top + lipH + d * 0.2);
    ctx.quadraticCurveTo(x - stepX / 2, top + lipH + d, x - stepX, top + lipH + d * 0.2);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(214, 255, 140, 0.8)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x0, top - 1);
  ctx.lineTo(x1, top - 1);
  ctx.stroke();

  // plants on top: fern tufts all along, glowing mushrooms in clusters
  for (let x = Math.floor(x0 / 34) * 34; x < x1; x += 34) {
    const sd = Math.floor(x / 34);
    if (rand(sd + 70) < 0.35) continue;
    tuft(ctx, x + rand(sd) * 20, top - 1, 10 + rand(sd + 1) * 14, (rand(sd + 2) - 0.5) * 8 + Math.sin(time * 1.2 + sd) * 2, rand(sd + 3) < 0.5 ? '#4d7c0f' : '#365314');
  }
  for (let x = Math.floor(x0 / 150) * 150; x < x1; x += 150) {
    const sd = Math.floor(x / 150);
    glowShroom(ctx, x + 30 + rand(sd + 9) * 90, top - 2, 1.1, time, sd * 5 + 2);
  }
}

// ───────────────────────────── ledges ─────────────────────────────

function drawCradle(ctx: CanvasRenderingContext2D, p: Platform, cam: Cam, time: number) {
  const topEdge = cam.y - 30;
  const w = p.width;
  const sway = Math.sin(time * 0.8 + p.id) * 1.2;

  // the cables it hangs from, up into the canopy
  const cables = w > 220 ? [0.12, 0.5, 0.88] : [0.18, 0.82];
  ctx.lineCap = 'round';
  for (const u of cables) {
    const cx = p.x + w * u;
    ctx.strokeStyle = '#0a0d05';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(cx, p.y + 4);
    ctx.lineTo(cx + sway, topEdge);
    ctx.stroke();
    ctx.strokeStyle = '#3a4a1c';
    ctx.lineWidth = 4.5;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(190, 242, 100, 0.4)';
    ctx.lineWidth = 1.4;
    ctx.setLineDash([6, 12]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // the cradle: knotted root underneath, thick moss on top
  const bump = (i: number) => 9 + rand(p.id * 11 + i) * 12;
  const n = Math.max(4, Math.round(w / 34));
  ctx.beginPath();
  ctx.moveTo(p.x, p.y + 2);
  ctx.lineTo(p.x + w, p.y + 2);
  ctx.quadraticCurveTo(p.x + w + 8, p.y + 14, p.x + w - 12, p.y + p.height + 3);
  for (let i = n - 1; i >= 0; i--) {
    const bx = p.x + (i / n) * w + w / n / 2;
    const bxPrev = p.x + ((i + 1) / n) * w;
    ctx.quadraticCurveTo((bxPrev + bx) / 2, p.y + p.height + bump(i), bx, p.y + p.height + bump(i) * 0.4);
  }
  ctx.quadraticCurveTo(p.x - 8, p.y + 14, p.x, p.y + 2);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, p.y, 0, p.y + p.height + 20);
  g.addColorStop(0, '#5a8a1a');
  g.addColorStop(0.28, '#4b3818');
  g.addColorStop(1, '#17100a');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = '#080a04';
  ctx.lineWidth = 3;
  ctx.stroke();

  // woven root ribs across the side
  ctx.strokeStyle = 'rgba(8, 6, 2, 0.55)';
  ctx.lineWidth = 2.4;
  for (let i = 0; i < n; i++) {
    const rx = p.x + (i + 0.5) * (w / n);
    ctx.beginPath();
    ctx.moveTo(rx - 8, p.y + 8);
    ctx.quadraticCurveTo(rx + 4, p.y + p.height * 0.7, rx - 4, p.y + p.height + 3);
    ctx.stroke();
  }
  // the moss cap and its lit edge
  ctx.fillStyle = '#6a9a1c';
  ctx.beginPath();
  ctx.moveTo(p.x - 2, p.y + 1);
  ctx.lineTo(p.x + w + 2, p.y + 1);
  ctx.lineTo(p.x + w, p.y + 8);
  for (let x = p.x + w; x >= p.x; x -= 16) ctx.lineTo(x - 8, p.y + 9 + rand(Math.floor(x / 16) + p.id) * 6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(224, 255, 150, 0.9)';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x + w, p.y);
  ctx.stroke();

  // ferns and a mushroom or two on the cap
  for (let x = p.x + 8; x < p.x + w - 6; x += 24) {
    const sd = Math.floor(x / 24) + p.id * 3;
    if (rand(sd) < 0.4) continue;
    tuft(ctx, x, p.y, 8 + rand(sd + 1) * 9, (rand(sd + 2) - 0.5) * 6 + Math.sin(time * 1.4 + sd) * 1.6, '#4d7c0f');
  }
  glowShroom(ctx, p.x + w * (0.3 + rand(p.id) * 0.4), p.y, 0.9, time, p.id * 3);

  // dangling rootlets and bioluminescent beads under it
  ctx.lineWidth = 2;
  for (let i = 0; i < n; i++) {
    const bx = p.x + (i + 0.5) * (w / n) + (rand(p.id + i) - 0.5) * 10;
    const by = p.y + p.height + bump(i) * 0.5;
    const len = 12 + rand(p.id * 5 + i) * 22;
    const s2 = Math.sin(time * 1.6 + i + p.id) * 3;
    ctx.strokeStyle = '#30220f';
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(bx + s2, by + len * 0.6, bx + s2 * 1.4, by + len);
    ctx.stroke();
    if (rand(p.id + i * 9) < 0.5) {
      const glow = 0.5 + 0.5 * Math.sin(time * 2.2 + i * 1.7);
      halo(ctx, bx + s2 * 1.4, by + len + 2, 11, 0.45 + glow * 0.3);
      ctx.fillStyle = `rgba(190, 242, 100, ${0.5 + glow * 0.5})`;
      ctx.beginPath();
      ctx.arc(bx + s2 * 1.4, by + len + 2, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ───────────────────────────── bounce mushrooms ─────────────────────────────

function drawBounceCap(ctx: CanvasRenderingContext2D, p: Platform, cam: Cam, time: number) {
  const cx = p.x + p.width / 2;
  const botY = cam.y + cam.viewportHeight + 60;
  const sw = 12;

  // the stalk, pale and ridged, widening to the ground
  const sg = ctx.createLinearGradient(cx - sw * 2, 0, cx + sw * 2, 0);
  sg.addColorStop(0, '#6f8a45');
  sg.addColorStop(0.45, '#eaf5c8');
  sg.addColorStop(1, '#8aa35a');
  ctx.beginPath();
  ctx.moveTo(cx - sw * 0.8, p.y + 16);
  ctx.quadraticCurveTo(cx - sw * 0.6, (p.y + botY) / 2, cx - sw * 2.1, botY);
  ctx.lineTo(cx + sw * 2.1, botY);
  ctx.quadraticCurveTo(cx + sw * 0.6, (p.y + botY) / 2, cx + sw * 0.8, p.y + 16);
  ctx.closePath();
  ctx.fillStyle = sg;
  ctx.fill();
  ctx.strokeStyle = '#0c1606';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(70, 90, 40, 0.4)';
  ctx.lineWidth = 1.6;
  for (let gy = p.y + 34; gy < botY; gy += 30) {
    ctx.beginPath();
    ctx.moveTo(cx - sw * 0.5, gy);
    ctx.quadraticCurveTo(cx, gy + 5, cx + sw * 0.5, gy);
    ctx.stroke();
  }
  // its skirt ring
  ctx.beginPath();
  ctx.ellipse(cx, p.y + 22, sw * 1.5, 5, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#f1f9d8';
  ctx.fill();
  ctx.stroke();

  // the cap: squashes a little as if breathing
  const squash = 1 + Math.sin(time * 3 + p.id) * 0.06;
  const rad = p.width * 0.68;
  ctx.save();
  ctx.translate(cx, p.y + 22);
  ctx.scale(1, squash);
  // gills underneath
  ctx.fillStyle = '#052624';
  ctx.beginPath();
  ctx.ellipse(0, 1, rad * 0.96, 7, 0, 0, Math.PI);
  ctx.fill();
  ctx.strokeStyle = 'rgba(94, 234, 212, 0.35)';
  ctx.lineWidth = 1.2;
  for (let i = -5; i <= 5; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 2, 0);
    ctx.lineTo(i * rad * 0.17, 6 * (1 - Math.abs(i) / 7));
    ctx.stroke();
  }
  // the dome
  const cg = ctx.createRadialGradient(-rad * 0.3, -20, 3, 0, -6, rad * 1.1);
  cg.addColorStop(0, '#99f6e4');
  cg.addColorStop(0.35, '#14b8a6');
  cg.addColorStop(0.8, '#0f766e');
  cg.addColorStop(1, '#0b4a46');
  ctx.beginPath();
  ctx.moveTo(-rad, 2);
  ctx.quadraticCurveTo(0, -46, rad, 2);
  ctx.quadraticCurveTo(0, 12, -rad, 2);
  ctx.closePath();
  ctx.fillStyle = cg;
  ctx.fill();
  ctx.strokeStyle = '#04201e';
  ctx.lineWidth = 3;
  ctx.stroke();
  // lime-white spots
  ctx.fillStyle = 'rgba(236, 252, 203, 0.92)';
  for (const [sx, sy, sr] of [[-rad * 0.45, -8, 5.5], [-rad * 0.05, -17, 7], [rad * 0.42, -9, 5], [rad * 0.2, -5, 3.2], [-rad * 0.68, -2, 3]] as const) {
    ctx.beginPath();
    ctx.ellipse(sx, sy, sr, sr * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // a pulsing lime rim, so it reads as "bounce here" in the dark
  const glow = 0.55 + 0.45 * Math.sin(time * 2.6 + p.id);
  ctx.beginPath();
  ctx.moveTo(-rad + 2, 1);
  ctx.quadraticCurveTo(0, -45, rad - 2, 1);
  ctx.strokeStyle = `rgba(190, 242, 100, ${(0.5 + glow * 0.4) * 0.3 * glow})`;
  ctx.lineWidth = 3 + 9 * glow;
  ctx.stroke();
  ctx.strokeStyle = `rgba(190, 242, 100, ${0.5 + glow * 0.4})`;
  ctx.lineWidth = 2.6;
  ctx.stroke();
  ctx.restore();
}

// ───────────────────────────── trunks ─────────────────────────────

/** the wall trunk: braided fig roots going up into the canopy */
function drawBraidedTrunk(ctx: CanvasRenderingContext2D, t: TreeStructure, cam: Cam, time: number) {
  const top = cam.y - 40;
  const bottom = t.groundY + 4;
  const half = 50;
  ctx.save();
  // the dark core
  const core = ctx.createLinearGradient(t.x - half, 0, t.x + half, 0);
  core.addColorStop(0, '#080a04');
  core.addColorStop(0.55, '#16140a');
  core.addColorStop(1, '#080a04');
  ctx.fillStyle = core;
  ctx.fillRect(t.x - half * 0.9, top, half * 1.8, bottom - top);

  // four strands plaited round each other
  const cols: Array<[string, string]> = [['#2c2412', '#6d5528'], ['#201a0d', '#54411f'], ['#33291a', '#7a6030'], ['#1a150a', '#463619']];
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const pass of [0, 1]) {
    for (let s = pass; s < 4; s += 2) {
      const ph = s * 1.57 + t.id * 0.9;
      const strand = (dx: number) => {
        ctx.beginPath();
        for (let y = top; y <= bottom; y += 14) {
          const x = t.x + dx + Math.sin(y * 0.0105 + ph) * half * 0.5;
          if (y === top) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      };
      ctx.strokeStyle = '#050603';
      ctx.lineWidth = 34;
      strand(0);
      ctx.strokeStyle = cols[s][0];
      ctx.lineWidth = 29;
      strand(0);
      ctx.strokeStyle = cols[s][1];
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 5;
      strand(-6);
      ctx.globalAlpha = 1;
    }
  }
  // cracks that glow, moss on the shaded side, a bracket fungus now and then
  for (let y = top + 70; y < bottom - 90; y += 110) {
    const sd = Math.floor(y / 110) + t.id * 5;
    const px = t.x + (rand(sd) - 0.5) * half * 1.1;
    ctx.fillStyle = 'rgba(77, 124, 15, 0.5)';
    ctx.beginPath();
    ctx.ellipse(px, y, 13 + rand(sd + 1) * 9, 7, rand(sd + 2) - 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(190, 242, 100, ${0.3 + 0.18 * Math.sin(time * 1.6 + sd)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px - 8, y + 14);
    ctx.quadraticCurveTo(px + 2, y + 4, px + 10, y + 20);
    ctx.stroke();
    if (rand(sd + 3) < 0.55) {
      const side = rand(sd + 4) < 0.5 ? -1 : 1;
      const bx = t.x + side * (half * 0.95);
      ctx.save();
      halo(ctx, bx, y + 30, 22, 0.38);
      ctx.fillStyle = '#9bbf3a';
      ctx.beginPath();
      ctx.ellipse(bx, y + 30, 20, 7, 0, side < 0 ? Math.PI : 0, side < 0 ? 0 : Math.PI, side < 0);
      ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore();
}

/** the flared roots at the foot of the trunk, drawn after the floor so they sit on top of it */
function drawTrunkFoot(ctx: CanvasRenderingContext2D, t: TreeStructure) {
  ctx.save();
  const y = t.groundY;
  for (const side of [-1, 1] as const) {
    const g = ctx.createLinearGradient(t.x, y - 90, t.x + side * 130, y + 8);
    g.addColorStop(0, '#3a2e16');
    g.addColorStop(1, '#120d06');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(t.x + side * 20, y - 120);
    ctx.bezierCurveTo(t.x + side * 44, y - 50, t.x + side * 70, y - 20, t.x + side * 140, y + 4);
    ctx.lineTo(t.x + side * 20, y + 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#050603';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(214, 180, 110, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(t.x + side * 24, y - 100);
    ctx.bezierCurveTo(t.x + side * 46, y - 48, t.x + side * 72, y - 18, t.x + side * 128, y - 2);
    ctx.stroke();
  }
  ctx.restore();
}

// ───────────────────────────── vines ─────────────────────────────

function vineCurve(v: Vine, time: number, calm: boolean) {
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
  return { at, tipX, tipY, len };
}

function drawClimbLiana(ctx: CanvasRenderingContext2D, v: Vine, time: number) {
  const { at, len } = vineCurve(v, time, true);
  const N = Math.max(14, Math.floor(len / 10));
  const trace = () => {
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const p = at(i / N);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
  };
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // a soft light round it, so the way up is plain in the dark
  ctx.strokeStyle = 'rgba(190, 242, 100, 0.2)';
  ctx.lineWidth = 22;
  trace();
  ctx.stroke();
  ctx.strokeStyle = '#06100a';
  ctx.lineWidth = 13;
  trace();
  ctx.stroke();
  ctx.strokeStyle = '#3f7a1c';
  ctx.lineWidth = 9;
  trace();
  ctx.stroke();
  ctx.strokeStyle = '#a3e635';
  ctx.lineWidth = 3;
  ctx.setLineDash([9, 7]);
  trace();
  ctx.stroke();
  ctx.setLineDash([]);
  // leaf pairs and glowing buds
  for (let i = 1; i < N; i += 3) {
    const u = i / N;
    const p = at(u);
    const s = i % 2 === 0 ? 1 : -1;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(s * (0.9 + Math.sin(time * 1.4 + i) * 0.06));
    ctx.fillStyle = i % 6 === 0 ? '#65a30d' : '#4d7c0f';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(14, -9, 26, 0);
    ctx.quadraticCurveTo(14, 9, 0, 0);
    ctx.fill();
    ctx.strokeStyle = 'rgba(6, 16, 8, .8)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();
    if (i % 9 === 1) {
      const glow = 0.5 + 0.5 * Math.sin(time * 2.2 + i);
      halo(ctx, p.x + s * 7, p.y + 4, 8 + 9 * glow, 0.5 * glow + 0.15);
      ctx.fillStyle = `rgba(236, 252, 160, ${0.6 + glow * 0.4})`;
      ctx.beginPath();
      ctx.arc(p.x + s * 7, p.y + 4, 3.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawSwingLiana(ctx: CanvasRenderingContext2D, v: Vine, cam: Cam, time: number) {
  const { at, tipX, tipY, len } = vineCurve(v, time, false);
  const N = Math.max(16, Math.floor(len / 9));
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // the cable it hangs from, up into the canopy, and the knot where it joins
  const topEdge = cam.y - 30;
  ctx.strokeStyle = '#0a0d05';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(v.x, v.topY);
  ctx.lineTo(v.x, topEdge);
  ctx.stroke();
  ctx.strokeStyle = '#3a4a1c';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = '#2b2412';
  ctx.strokeStyle = '#050603';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(v.x, v.topY - 2, 11, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const trace = () => {
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const p = at(i / N);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
  };
  ctx.strokeStyle = 'rgba(190, 242, 100, 0.16)';
  ctx.lineWidth = 20;
  trace();
  ctx.stroke();
  ctx.strokeStyle = '#06100a';
  ctx.lineWidth = 12;
  trace();
  ctx.stroke();
  ctx.strokeStyle = '#4a6a20';
  ctx.lineWidth = 8;
  trace();
  ctx.stroke();
  // a plaited look: two light strands twisting along it
  ctx.strokeStyle = '#bef264';
  ctx.lineWidth = 2.6;
  ctx.setLineDash([8, 9]);
  trace();
  ctx.stroke();
  ctx.strokeStyle = '#1f3a10';
  ctx.lineDashOffset = 8;
  trace();
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;

  // the seed pod at the end: a glowing teardrop with two leaves
  const glow = 0.55 + 0.45 * Math.sin(time * 2.4);
  ctx.save();
  ctx.translate(tipX, tipY);
  ctx.fillStyle = '#4d7c0f';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.quadraticCurveTo(s * 20, -20, s * 28, -4);
    ctx.quadraticCurveTo(s * 14, -2, 0, -6);
    ctx.fill();
  }
  halo(ctx, 0, 10, 20 + 16 * glow, 0.5 * glow + 0.12);
  const pg = ctx.createRadialGradient(-3, 6, 2, 0, 10, 15);
  pg.addColorStop(0, '#f7fee7');
  pg.addColorStop(0.5, `rgba(190, 242, 100, ${0.65 + glow * 0.3})`);
  pg.addColorStop(1, '#3f6212');
  ctx.fillStyle = pg;
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.bezierCurveTo(13, 4, 11, 22, 0, 26);
  ctx.bezierCurveTo(-11, 22, -13, 4, 0, -6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(6, 16, 8, .7)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

// ───────────────────────────── entry ─────────────────────────────

export function drawVenomObjects(ctx: CanvasRenderingContext2D, platforms: Platform[], vines: Vine[], trees: TreeStructure[], cam: Cam, time: number) {
  const left = cam.x - 200;
  const right = cam.x + cam.viewportWidth + 200;

  for (const t of trees) {
    if (t.x + 120 < left || t.x - 120 > right) continue;
    drawBraidedTrunk(ctx, t, cam, time);
  }
  for (const v of vines) {
    if (v.x < left || v.x > right) continue;
    if (v.vineType === 'swing_liana') continue; // after the ledges, so a rope hangs in front of them
    drawClimbLiana(ctx, v, time);
  }
  // mushrooms first, so the floor covers the foot of their stalks
  for (const p of platforms) {
    if (p.type !== 'bouncy' || p.broken || p.x + p.width < left || p.x > right) continue;
    ctx.save();
    drawBounceCap(ctx, p, cam, time);
    ctx.restore();
  }
  for (const p of platforms) {
    if (p.type === 'bouncy' || p.broken) continue;
    if (p.height >= 50) {
      ctx.save();
      drawRootBed(ctx, p, cam, time);
      ctx.restore();
    } else {
      if (p.x + p.width < left || p.x > right) continue;
      ctx.save();
      drawCradle(ctx, p, cam, time);
      ctx.restore();
    }
  }
  for (const t of trees) {
    if (t.x + 160 < left || t.x - 160 > right) continue;
    drawTrunkFoot(ctx, t);
  }
  for (const v of vines) {
    if (v.vineType !== 'swing_liana' || v.x < left || v.x > right) continue;
    drawSwingLiana(ctx, v, cam, time);
  }
}
