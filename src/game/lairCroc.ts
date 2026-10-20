/**
 * Crocus Rex's lair: the Moonlit Mire. A wide river at night from a mud bank: a pale moon low over the far trees with a glittering
 * road across the water, arching mangroves in blue-black, fog lying on the river, pairs of watching eyes out on the water, bats
 * crossing the moon and cold wisp-lights drifting. Everything is moonlit cyan and indigo, with the warm yellow of one lantern, so it
 * shares no colour with the green Hollow or the orange Drake lair.
 *
 * Same layers as the other lairs (lairArt.ts): back (screen space, opaque), world (props: a sunk rowboat, a sign, a pile of old
 * helmets, reeds) and front (screen space: moss, reeds and fog over everything). The stilt boardwalks, mud bank, wall trunks and
 * ropes are in lairCrocObjects.ts.
 */
import type { LairArena, LairView } from './lairArt.ts';

function rand(i: number): number {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

const WISP = '#a5f3fc';

/** 1. the whole backdrop: night sky, moon, far trees, river with moon glitter, mangroves, fog, bats, wisps */
export function drawCrocBack(ctx: CanvasRenderingContext2D, v: LairView, a: LairArena, time: number, bossX: number) {
  ctx.save();
  const W = v.vw;
  const H = v.vh;
  const floorY = a.floor - v.y;
  const horizon = floorY - 118;

  // the sky: ink at the top, deep teal where it meets the far trees
  const sky = ctx.createLinearGradient(0, 0, 0, horizon + 20);
  sky.addColorStop(0, '#040916');
  sky.addColorStop(0.45, '#0a2142');
  sky.addColorStop(0.85, '#135b78');
  sky.addColorStop(1, '#1f7f93');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // stars, twinkling; none near the moon's glare
  const mx = W * 0.7 - v.x * 0.02;
  const my = Math.max(70, horizon * 0.34);
  for (let i = 0; i < 70; i++) {
    const sx = rand(i) * W;
    const sy = rand(i + 100) * horizon * 0.8;
    if (Math.hypot(sx - mx, sy - my) < 110) continue;
    ctx.globalAlpha = (0.25 + 0.6 * rand(i + 50)) * (0.6 + 0.4 * Math.sin(time * (1 + rand(i + 9)) + i));
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(sx, sy, rand(i + 7) < 0.15 ? 2.2 : 1.3, rand(i + 7) < 0.15 ? 2.2 : 1.3);
  }
  ctx.globalAlpha = 1;

  // the moon and its halo
  const halo = ctx.createRadialGradient(mx, my, 10, mx, my, 260);
  halo.addColorStop(0, 'rgba(224, 242, 254, 0.5)');
  halo.addColorStop(0.3, 'rgba(147, 197, 253, 0.18)');
  halo.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, W, H);
  const moon = ctx.createRadialGradient(mx - 14, my - 12, 4, mx, my, 62);
  moon.addColorStop(0, '#ffffff');
  moon.addColorStop(0.7, '#e2eefc');
  moon.addColorStop(1, '#b9d2ee');
  ctx.fillStyle = moon;
  ctx.beginPath();
  ctx.arc(mx, my, 60, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(120, 150, 190, 0.28)';
  for (const [cx, cy, cr] of [[-18, -10, 11], [14, 8, 15], [-6, 24, 8], [26, -20, 7]] as const) {
    ctx.beginPath();
    ctx.arc(mx + cx, my + cy, cr, 0, Math.PI * 2);
    ctx.fill();
  }
  // a thin cloud or two drifting across it
  ctx.fillStyle = 'rgba(15, 42, 80, 0.55)';
  for (let i = 0; i < 3; i++) {
    const cx = ((time * (4 + i * 2) + i * 330) % (W + 500)) - 250;
    const cy = my - 40 + i * 38;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 190 + i * 40, 7 + i * 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // far trees along the horizon: a long ragged line of canopy and a few tall palms
  const treeLine = (par: number, col: string, hMin: number, hMax: number, step: number, seed: number) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(-20, horizon + 30);
    const off = v.x * par;
    for (let x = -20; x <= W + 40; x += step) {
      const wx = Math.floor((x + off) / step);
      const th = hMin + rand(wx + seed) * (hMax - hMin);
      ctx.quadraticCurveTo(x + step * 0.25, horizon - th * 1.05, x + step * 0.5, horizon - th);
      ctx.quadraticCurveTo(x + step * 0.8, horizon - th * 0.85, x + step, horizon - th * 0.3);
    }
    ctx.lineTo(W + 40, horizon + 30);
    ctx.closePath();
    ctx.fill();
  };
  treeLine(0.08, '#0d3550', 22, 70, 58, 3);
  treeLine(0.16, '#082638', 18, 56, 46, 9);
  // two or three palms standing taller than the rest
  ctx.strokeStyle = '#06202f';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) {
    const px = ((((i + 0.3 + rand(i + 33) * 0.5) / 5) * (W + 300) - v.x * 0.12) % (W + 300) + (W + 300)) % (W + 300) - 150;
    const ph = 90 + rand(i + 34) * 60;
    ctx.beginPath();
    ctx.moveTo(px, horizon + 10);
    ctx.quadraticCurveTo(px + 8, horizon - ph * 0.6, px + 2, horizon - ph);
    ctx.stroke();
    for (let f = -2; f <= 2; f++) {
      ctx.beginPath();
      ctx.moveTo(px + 2, horizon - ph);
      ctx.quadraticCurveTo(px + 2 + f * 20, horizon - ph - 20 + Math.abs(f) * 6, px + 2 + f * 36, horizon - ph + 4 + Math.abs(f) * 8);
      ctx.stroke();
    }
  }

  // the river: dark water below the horizon, with the moon's road of glitter and slow ripples
  const rv = ctx.createLinearGradient(0, horizon, 0, floorY + 20);
  rv.addColorStop(0, '#12506a');
  rv.addColorStop(0.5, '#0a2b45');
  rv.addColorStop(1, '#04101f');
  ctx.fillStyle = rv;
  ctx.fillRect(0, horizon, W, H - horizon);
  for (let i = 0; i < 46; i++) {
    const ry = horizon + 4 + rand(i + 200) * (floorY - horizon - 14);
    const depth = (ry - horizon) / Math.max(1, floorY - horizon);
    const spread = 40 + depth * 150;
    const rx = mx + (rand(i + 210) - 0.5) * spread * 2 + Math.sin(time * 0.5 + i) * 6;
    const tw = 0.5 + 0.5 * Math.sin(time * (1.5 + rand(i + 220) * 2) + i);
    ctx.globalAlpha = tw * (0.7 - depth * 0.3);
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(rx, ry, 8 + depth * 22, 1.8 + depth * 1.4);
  }
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = '#9bd3e8';
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 12; i++) {
    const ry = horizon + 14 + ((i * 17 + time * 6) % Math.max(10, floorY - horizon - 30));
    ctx.beginPath();
    for (let x = 0; x <= W; x += 20) ctx.lineTo(x, ry + Math.sin(x * 0.03 + time + i) * 1.6);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // out on the river: pairs of eyes, watching and blinking, with a ripple under each
  for (let i = 0; i < 4; i++) {
    const ex = ((((i + 0.4) / 4) * (W + 200) - v.x * 0.3) % (W + 200) + (W + 200)) % (W + 200) - 100;
    const ey = horizon + 18 + rand(i + 300) * 40;
    const cyc = (time * 0.18 + rand(i + 301)) % 1;
    const open = cyc < 0.82 ? 1 : cyc < 0.86 || cyc > 0.96 ? 0.2 : 0;
    if (open <= 0) continue;
    ctx.fillStyle = `rgba(253, 224, 71, ${0.85 * open})`;
    ctx.shadowColor = '#fde047';
    ctx.shadowBlur = 8;
    for (const d of [-5, 5]) {
      ctx.beginPath();
      ctx.ellipse(ex + d, ey, 2.6, 1.5 * open + 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(160, 220, 235, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(ex, ey + 4, 14, 2.6, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // the mangroves nearer than the far bank: arching prop roots in blue-black, trunks going up into the dark
  const gx = (mid: number) => (mid - v.x) * 0.45 + W * 0.3;
  const cx = gx((a.left + a.right) / 2);
  for (let i = -3; i <= 3; i++) {
    const tx = cx + i * Math.max(280, W * 0.31) + rand(i + 400) * 40;
    const baseY = floorY - 8;
    const th = Math.min(baseY - 20, 330 + rand(i + 401) * 150);
    const tw = 22 + rand(i + 402) * 14;
    ctx.fillStyle = '#04121c';
    ctx.beginPath();
    ctx.moveTo(tx - tw * 0.5, baseY - th);
    ctx.lineTo(tx + tw * 0.5, baseY - th);
    ctx.lineTo(tx + tw * 0.9, baseY - 70);
    ctx.lineTo(tx - tw * 0.9, baseY - 70);
    ctx.closePath();
    ctx.fill();
    // arching prop roots touching the water
    ctx.strokeStyle = '#04121c';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    for (let r = -3; r <= 3; r++) {
      const rx = tx + r * 36;
      ctx.beginPath();
      ctx.moveTo(tx + r * 5, baseY - 90);
      ctx.bezierCurveTo(tx + r * 22, baseY - 130 + Math.abs(r) * 14, rx, baseY - 50, rx + r * 6, baseY);
      ctx.stroke();
    }
    // a faint moon rim on the trunk
    ctx.strokeStyle = 'rgba(165, 220, 245, 0.16)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tx + tw * 0.45, baseY - th);
    ctx.lineTo(tx + tw * 0.85, baseY - 74);
    ctx.stroke();
    // hanging moss
    ctx.strokeStyle = 'rgba(6, 26, 38, 0.9)';
    ctx.lineWidth = 3;
    for (let m = 0; m < 6; m++) {
      const mxx = tx + (m - 2.5) * 14;
      const my2 = baseY - th + 8 + rand(i * 9 + m) * 30;
      const len = 40 + rand(i * 7 + m + 20) * 70;
      const sw = Math.sin(time * 0.8 + m + i) * 5;
      ctx.beginPath();
      ctx.moveTo(mxx, my2);
      ctx.quadraticCurveTo(mxx + sw, my2 + len * 0.5, mxx + sw * 1.4, my2 + len);
      ctx.stroke();
    }
  }

  // fog lying on the river, drifting in two slow layers
  for (let layer = 0; layer < 2; layer++) {
    const fy = floorY - 40 - layer * 52;
    const fg = ctx.createLinearGradient(0, fy - 50, 0, fy + 40);
    fg.addColorStop(0, 'rgba(170, 215, 235, 0)');
    fg.addColorStop(0.55, `rgba(170, 215, 235, ${0.2 - layer * 0.05})`);
    fg.addColorStop(1, 'rgba(170, 215, 235, 0)');
    ctx.fillStyle = fg;
    ctx.fillRect(0, fy - 50, W, 90);
    ctx.fillStyle = `rgba(190, 228, 245, ${0.07 + layer * 0.02})`;
    for (let k = 0; k < 6; k++) {
      const fx = ((time * (7 + layer * 5) + k * 260 + layer * 110) % (W + 500)) - 250;
      ctx.beginPath();
      ctx.ellipse(fx, fy + Math.sin(k + time * 0.2) * 6, 170, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // a cool glow behind the boss so a dark green croc is lit as a shape against the river
  ctx.globalAlpha = 0.2;
  const bx = bossX - v.x;
  const hg = ctx.createRadialGradient(bx, floorY - 70, 20, bx, floorY - 70, 400);
  hg.addColorStop(0, 'rgba(125, 211, 252, 0.9)');
  hg.addColorStop(1, 'rgba(125, 211, 252, 0)');
  ctx.fillStyle = hg;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;

  // bats crossing the moon now and then
  for (let i = 0; i < 3; i++) {
    const cyc = (time * 0.05 + i * 0.37) % 1;
    const bxp = -60 + cyc * (W + 120);
    const byp = my + (i - 1) * 40 + Math.sin(cyc * 16 + i) * 14;
    const flap = Math.sin(time * 14 + i * 2);
    ctx.fillStyle = '#030a14';
    ctx.beginPath();
    ctx.moveTo(bxp, byp);
    ctx.quadraticCurveTo(bxp - 9, byp - 7 - flap * 6, bxp - 17, byp + 2 - flap * 4);
    ctx.quadraticCurveTo(bxp - 9, byp + 1, bxp, byp + 4);
    ctx.quadraticCurveTo(bxp + 9, byp + 1, bxp + 17, byp + 2 - flap * 4);
    ctx.quadraticCurveTo(bxp + 9, byp - 7 - flap * 6, bxp, byp);
    ctx.fill();
  }

  // wisp-lights drifting up through the whole view
  for (let i = 0; i < 26; i++) {
    const ph = (time * (0.025 + rand(i) * 0.04) + rand(i + 50)) % 1;
    const ex = (rand(i + 9) * W * 1.1 + Math.sin(time * 0.5 + i) * 34 + W) % W;
    const ey = H * (0.92 - ph * 0.8) + Math.sin(time * 0.8 + i * 2) * 12;
    ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.8 * (0.5 + 0.5 * Math.sin(time * (1.4 + rand(i + 3)) + i));
    ctx.fillStyle = WISP;
    const r = 1.6 + rand(i + 3) * 2;
    ctx.beginPath();
    ctx.arc(ex, ey, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha *= 0.28;
    ctx.beginPath();
    ctx.arc(ex, ey, r * 3.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** 2. props on the bank: a rowboat sunk in the mud, a sign, a heap of helmets and bones, cattails along the fences */
export function drawCrocWorld(ctx: CanvasRenderingContext2D, a: LairArena, view: LairView, time: number) {
  const f = a.floor;
  const x0 = view.x - 60;
  const x1 = view.x + view.vw + 60;
  const cattail = (x: number, h: number, seed: number) => {
    const sw = Math.sin(time * 1.1 + seed) * 3;
    ctx.strokeStyle = '#0d2a1f';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(x, f - 1);
    ctx.quadraticCurveTo(x + sw, f - h * 0.6, x + sw * 1.6, f - h);
    ctx.stroke();
    ctx.fillStyle = '#5b3a1e';
    ctx.beginPath();
    ctx.roundRect(x + sw * 1.6 - 3, f - h - 20, 6, 22, 3);
    ctx.fill();
    ctx.strokeStyle = '#143a2a';
    ctx.lineWidth = 2;
    for (const d of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(x, f - 1);
      ctx.quadraticCurveTo(x + d * 14 + sw, f - h * 0.5, x + d * 22 + sw, f - h * 0.78);
      ctx.stroke();
    }
  };

  ctx.save();
  // the sunk rowboat by the left fence: a tilted hull with a split plank, half in the mud
  const bx = a.left + 150;
  if (bx > x0 - 200 && bx < x1 + 100) {
    ctx.save();
    ctx.translate(bx, f + 2);
    ctx.rotate(-0.1);
    ctx.fillStyle = '#2a1d12';
    ctx.beginPath();
    ctx.moveTo(-70, -34);
    ctx.quadraticCurveTo(-50, 6, 0, 8);
    ctx.quadraticCurveTo(54, 6, 76, -40);
    ctx.lineTo(64, -42);
    ctx.quadraticCurveTo(44, -8, 0, -8);
    ctx.quadraticCurveTo(-44, -8, -58, -36);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0d0a06';
    ctx.lineWidth = 2.4;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(148, 190, 220, 0.4)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-60, -34);
    ctx.quadraticCurveTo(-40, -4, 0, -6);
    ctx.stroke();
    ctx.strokeStyle = '#0d0a06';
    ctx.lineWidth = 3;
    for (const px of [-30, 0, 30]) {
      ctx.beginPath();
      ctx.moveTo(px, -12);
      ctx.lineTo(px + 2, 4);
      ctx.stroke();
    }
    // a broken oar sticking out
    ctx.strokeStyle = '#3b2a1c';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(30, -10);
    ctx.lineTo(62, -64);
    ctx.stroke();
    ctx.restore();
  }

  // a sign on a leaning post: the croc's own warning
  const sx = a.left + 330;
  if (sx > x0 - 100 && sx < x1 + 100) {
    ctx.save();
    ctx.translate(sx, f);
    ctx.rotate(0.07);
    ctx.fillStyle = '#2a1d12';
    ctx.fillRect(-4, -92, 8, 92);
    ctx.fillStyle = '#5a4128';
    ctx.strokeStyle = '#120c06';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(-46, -100, 92, 44, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NO', 0, -83);
    ctx.fillText('SWIMMING', 0, -66);
    // a bite out of the corner
    ctx.fillStyle = '#04121c';
    ctx.beginPath();
    ctx.arc(46, -100, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // a heap of old helmets and a rusty bucket on the right: the croc's trophies
  const hx = a.right - 140;
  if (hx > x0 - 200 && hx < x1 + 200) {
    for (let i = 0; i < 5; i++) {
      const px = hx - 70 + i * 34 + (rand(i) - 0.5) * 10;
      const py = f - 2 - (i % 2) * 14;
      ctx.fillStyle = i % 2 ? '#6b7280' : '#7c6a4f';
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(px, py - 12, 20, 15, 0, Math.PI, 0);
      ctx.lineTo(px + 22, py);
      ctx.lineTo(px - 22, py);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,.45)';
      ctx.fillRect(px - 9, py - 14, 18, 3);
    }
    ctx.fillStyle = '#e5e7eb';
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    for (const [bx2, by2] of [[-96, 4], [96, 2]] as const) {
      ctx.beginPath();
      ctx.moveTo(hx + bx2 - 14, f - by2);
      ctx.lineTo(hx + bx2 + 14, f - by2 - 7);
      ctx.stroke();
    }
  }

  // cattails clustered at both fences
  for (let i = 0; i < 6; i++) {
    const cxl = a.left + 20 + i * 18 + (rand(i + 5) - 0.5) * 10;
    const cxr = a.right - 20 - i * 18 + (rand(i + 15) - 0.5) * 10;
    if (cxl > x0 && cxl < x1) cattail(cxl, 70 + rand(i) * 60, i);
    if (cxr > x0 && cxr < x1) cattail(cxr, 70 + rand(i + 20) * 60, i + 9);
  }
  ctx.restore();
}

/** 3. over everything: a cold vignette, moss hanging from the top, a row of reeds along the bottom and fog wisps passing in front */
export function drawCrocFront(ctx: CanvasRenderingContext2D, v: LairView, time: number) {
  ctx.save();
  const vg = ctx.createRadialGradient(v.vw / 2, v.vh * 0.55, Math.min(v.vw, v.vh) * 0.38, v.vw / 2, v.vh * 0.55, Math.max(v.vw, v.vh) * 0.78);
  vg.addColorStop(0, 'rgba(2, 8, 20, 0)');
  vg.addColorStop(1, 'rgba(2, 8, 20, 0.6)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, v.vw, v.vh);

  // moss and vines swaying from the top edge
  ctx.lineCap = 'round';
  for (let i = 0; i < 14; i++) {
    const mx = (i + 0.3 + rand(i + 60) * 0.5) * (v.vw / 13.5);
    const len = 50 + rand(i + 61) * 110;
    const sw = Math.sin(time * 0.7 + i * 1.3) * 7;
    ctx.strokeStyle = 'rgba(3, 14, 22, 0.93)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(mx, -6);
    ctx.bezierCurveTo(mx + sw * 0.3, len * 0.35, mx - sw * 0.5, len * 0.7, mx + sw, len);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(165, 220, 245, 0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mx + 2, -6);
    ctx.bezierCurveTo(mx + 2 + sw * 0.3, len * 0.35, mx - sw * 0.5 + 2, len * 0.7, mx + sw + 2, len);
    ctx.stroke();
  }

  // reeds along the bottom edge, nearer than anything
  ctx.fillStyle = 'rgba(2, 10, 14, 0.9)';
  for (let i = 0; i < 26; i++) {
    const rx = (i + rand(i + 70) * 0.8) * (v.vw / 25);
    const rh = 22 + rand(i + 71) * 38;
    const sw = Math.sin(time * 1.2 + i) * 5;
    ctx.beginPath();
    ctx.moveTo(rx - 9, v.vh + 2);
    ctx.quadraticCurveTo(rx - 2 + sw * 0.4, v.vh - rh * 0.55, rx + sw, v.vh - rh);
    ctx.quadraticCurveTo(rx + 4 + sw * 0.4, v.vh - rh * 0.5, rx + 10, v.vh + 2);
    ctx.fill();
  }

  // fog wisps crossing in front, very faint
  ctx.fillStyle = 'rgba(190, 228, 245, 0.05)';
  for (let k = 0; k < 4; k++) {
    const fx = ((time * (12 + k * 4) + k * 340) % (v.vw + 600)) - 300;
    ctx.beginPath();
    ctx.ellipse(fx, v.vh * (0.55 + k * 0.1), 240, 22, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
