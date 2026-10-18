import type { WorldInfo, Camera, Platform, Vine, TreeStructure } from './types.ts';

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  const f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.padEnd(6, '0');
  return [parseInt(f.slice(0, 2), 16), parseInt(f.slice(2, 4), 16), parseInt(f.slice(4, 6), 16)];
};
/** Blend two #hex colours (t=0 -> a, t=1 -> b). Non-hex input is returned unchanged. */
const mix = (a: string, b: string, t: number): string => {
  if (!a.startsWith('#') || !b.startsWith('#')) return a;
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return `rgb(${Math.round(A[0] + (B[0] - A[0]) * t)}, ${Math.round(A[1] + (B[1] - A[1]) * t)}, ${Math.round(A[2] + (B[2] - A[2]) * t)})`;
};
/** One leaf/frond with a curved spine, tapered body, midrib and side veins. */
function drawFrond(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  len: number,
  ang: number,
  droop: number,
  maxW: number,
  fill: string
) {
  const ex = x + Math.cos(ang) * len;
  const ey = y + Math.sin(ang) * len + droop;
  const cx = x + Math.cos(ang) * len * 0.6;
  const cy = y + Math.sin(ang) * len * 0.6;
  const N = 9;
  const up: Array<[number, number]> = [];
  const dn: Array<[number, number]> = [];
  const mid: Array<[number, number, number, number]> = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const u = 1 - t;
    const px = u * u * x + 2 * u * t * cx + t * t * ex;
    const py = u * u * y + 2 * u * t * cy + t * t * ey;
    const dx = 2 * u * (cx - x) + 2 * t * (ex - cx);
    const dy = 2 * u * (cy - y) + 2 * t * (ey - cy);
    const dl = Math.hypot(dx, dy) || 1;
    const nx = -dy / dl;
    const ny = dx / dl;
    const w = Math.pow(Math.sin(Math.PI * Math.min(1, t * 0.92 + 0.04)), 0.7) * maxW;
    up.push([px + nx * w, py + ny * w]);
    dn.push([px - nx * w, py - ny * w]);
    mid.push([px, py, nx * w, ny * w]);
  }
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(up[0][0], up[0][1]);
  for (let i = 1; i <= N; i++) ctx.lineTo(up[i][0], up[i][1]);
  for (let i = N; i >= 0; i--) ctx.lineTo(dn[i][0], dn[i][1]);
  ctx.closePath();
  ctx.fill();
  // midrib + side veins for texture
  ctx.strokeStyle = 'rgba(255, 255, 220, 0.28)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(mid[0][0], mid[0][1]);
  for (let i = 1; i <= N; i++) ctx.lineTo(mid[i][0], mid[i][1]);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 255, 220, 0.14)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 2; i < N; i += 2) {
    const [px, py, wx, wy] = mid[i];
    const [qx, qy] = mid[i + 1];
    const tx = (qx - px) * 0.7;
    const ty = (qy - py) * 0.7;
    ctx.moveTo(px, py);
    ctx.lineTo(px + wx * 0.9 + tx, py + wy * 0.9 + ty);
    ctx.moveTo(px, py);
    ctx.lineTo(px - wx * 0.9 + tx, py - wy * 0.9 + ty);
  }
  ctx.stroke();
}

/** Fan of fronds radiating from a point: a rainforest palm / banana-leaf crown. */
function frondCluster(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  fill: string,
  shade: string,
  phase: number
) {
  const n = 9;
  // shaded back layer first for depth
  for (let i = 0; i < n; i++) {
    const a = -Math.PI * (0.04 + (i / (n - 1)) * 0.92) + Math.sin(phase + i) * 0.04;
    drawFrond(ctx, cx, cy + 4, size * (0.9 + (i % 3) * 0.1), a, size * 0.22, size * 0.17, shade);
  }
  for (let i = 0; i < n; i++) {
    const a = -Math.PI * (0.07 + (i / (n - 1)) * 0.86) + Math.sin(phase * 1.3 + i) * 0.05;
    drawFrond(ctx, cx, cy, size * (0.75 + ((i + 1) % 3) * 0.1), a, size * 0.18, size * 0.15, fill);
  }
  // drooping side leaves
  drawFrond(ctx, cx, cy, size * 0.8, 0.25 + Math.sin(phase) * 0.05, size * 0.3, size * 0.16, fill);
  drawFrond(ctx, cx, cy, size * 0.8, Math.PI - 0.25 - Math.sin(phase) * 0.05, size * 0.3, size * 0.16, fill);
}

/** How strongly each world is bathed in golden sunset light. */
const WORLD_WARMTH: Record<number, number> = { 1: 0.8, 2: 0.6, 3: 0.2, 4: 0.5, 5: 0.6, 6: 0.3, 7: 0.45, 8: 0.4, 9: 0.7, 10: 0.15 };

export class BackgroundEngine {
  private ambientSpores: { x: number; y: number; speed: number; size: number; phase: number }[] = [];
  private butterflies: { x: number; y: number; speedX: number; speedY: number; color: string; phase: number }[] = [];
  private birds: { x: number; y: number; speed: number; wingPhase: number; color: string; beakColor: string }[] = [];

  constructor() {
    // Generate pre-seeded floating atmospheric spores / pollen motes
    for (let i = 0; i < 45; i++) {
      this.ambientSpores.push({
        x: Math.random() * 2400,
        y: Math.random() * 1200,
        speed: 12 + Math.random() * 28,
        size: 1.5 + Math.random() * 2.8,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Pre-seeded tropical butterflies (blue morphos, golden swallowtails, emeralds)
    const butterflyColors = ['#38bdf8', '#facc15', '#4ade80', '#fb923c', '#e879f9'];
    for (let i = 0; i < 10; i++) {
      this.butterflies.push({
        x: Math.random() * 2800,
        y: 100 + Math.random() * 500,
        speedX: 24 + Math.random() * 36,
        speedY: 8 + Math.random() * 18,
        color: butterflyColors[i % butterflyColors.length],
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Background flying tropical toucans / macaws
    const birdColors = [
      { body: '#09090b', beak: '#facc15' },
      { body: '#ef4444', beak: '#fde047' },
      { body: '#0284c7', beak: '#fbbf24' },
    ];
    for (let i = 0; i < 4; i++) {
      this.birds.push({
        x: Math.random() * 2400,
        y: 60 + Math.random() * 200,
        speed: 40 + Math.random() * 30,
        wingPhase: Math.random() * Math.PI * 2,
        color: birdColors[i % birdColors.length].body,
        beakColor: birdColors[i % birdColors.length].beak,
      });
    }
  }

  /**
   * Render Multi-Layer Parallax Rainforest Background
   */
  public renderBackground(
    ctx: CanvasRenderingContext2D,
    world: WorldInfo,
    camera: Camera,
    time: number
  ) {
    const { viewportWidth: vw, viewportHeight: vh } = camera;
    const pal = world.palette;

    // --- 1. Rainforest Sky Gradient with Canopy Mist ---
    const warmth = WORLD_WARMTH[world.id] ?? 0.5;
    const skyGrad = ctx.createLinearGradient(0, 0, 0, vh);
    skyGrad.addColorStop(0, pal.skyTop);
    skyGrad.addColorStop(0.7, pal.skyBottom);
    skyGrad.addColorStop(1, mix(pal.skyBottom, '#ff9f5a', warmth * 0.85));
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, vw, vh);

    // Warm storybook sunset glow low on the horizon
    const sunX = vw * 0.6;
    const sunY = vh * 0.3;
    const glow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, vw * 0.7);
    glow.addColorStop(0, `rgba(255, 236, 170, ${0.25 + warmth * 0.6})`);
    glow.addColorStop(0.35, `rgba(255, 150, 70, ${0.12 + warmth * 0.45})`);
    glow.addColorStop(1, 'rgba(255, 150, 90, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, vw, vh);
    [150, 104].forEach((r, ri) => {
      ctx.fillStyle = `rgba(255, 224, 140, ${0.1 + warmth * (ri ? 0.16 : 0.1)})`;
      ctx.beginPath();
      ctx.arc(sunX, sunY, r + Math.sin(time * 0.8 + ri) * 3, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = 'rgba(255, 246, 205, 0.95)';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 58, 0, Math.PI * 2);
    ctx.fill();

    // --- 2. Distant Misty Rainforest Mountain Ridges (Parallax 0.04) ---
    ctx.save();
    const p0Offset = (camera.x * 0.04) % 1000;
    // soft warm clouds drifting very slowly
    ctx.fillStyle = `rgba(255, 244, 220, ${0.35 + warmth * 0.2})`;
    for (let c = 0; c < 5; c++) {
      const cx = (((c * 330 + time * 6 - camera.x * 0.02) % (vw + 400)) + (vw + 400)) % (vw + 400) - 200;
      const cy = vh * (0.12 + (c % 3) * 0.09);
      ctx.beginPath();
      ctx.ellipse(cx, cy, 70, 16, 0, 0, Math.PI * 2);
      ctx.ellipse(cx - 38, cy + 4, 44, 12, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 40, cy + 5, 48, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // far, hazy ridge
    ctx.fillStyle = mix(pal.distantMountain, pal.skyBottom, 0.6);
    ctx.beginPath();
    ctx.moveTo(0, vh);
    for (let x = -1000; x < vw + 1000; x += 160) {
      const ridgeY = vh * 0.36 + Math.sin((x + p0Offset * 0.6) * 0.0035 + 1.3) * 55 + Math.cos((x + p0Offset) * 0.008) * 25;
      ctx.lineTo(x - p0Offset * 0.6, ridgeY);
    }
    ctx.lineTo(vw, vh);
    ctx.closePath();
    ctx.fill();
    // nearer ridge, tinted toward the sky for atmospheric depth
    ctx.fillStyle = mix(pal.distantMountain, pal.skyBottom, 0.3);
    ctx.beginPath();
    ctx.moveTo(0, vh);
    for (let x = -1000; x < vw + 1000; x += 180) {
      const ridgeY = vh * 0.42 + Math.sin((x + p0Offset) * 0.004) * 65 + Math.cos((x + p0Offset) * 0.01) * 35;
      ctx.lineTo(x - p0Offset, ridgeY);
    }
    ctx.lineTo(vw, vh);
    ctx.closePath();
    ctx.fill();

    // Bold peaked green mountains (storybook silhouettes with sunlit ridges)
    [{ par: 0.03, base: 0.5, h: 0.3, mixT: 0.55 }, { par: 0.06, base: 0.58, h: 0.24, mixT: 0.3 }].forEach((M, mi) => {
      const mo = (camera.x * M.par) % 900;
      ctx.fillStyle = mix(pal.distantMountain, mi ? pal.canopyMid : pal.skyBottom, M.mixT);
      ctx.beginPath();
      ctx.moveTo(-200, vh);
      for (let x = -900; x < vw + 900; x += 300) {
        const k = Math.floor((x + mo) / 300);
        const peak = vh * (M.base - M.h * (0.55 + 0.45 * Math.abs(Math.sin(k * 2.3 + mi))));
        ctx.lineTo(x - (mo % 300) + 40, vh * M.base + 10);
        ctx.quadraticCurveTo(x - (mo % 300) + 110, peak + 60, x - (mo % 300) + 150, peak);
        ctx.quadraticCurveTo(x - (mo % 300) + 200, peak + 70, x - (mo % 300) + 260, vh * M.base + 10);
      }
      ctx.lineTo(vw + 900, vh);
      ctx.closePath();
      ctx.fill();
    });

    // Distant mountain mist layer
    const mountainMist = ctx.createLinearGradient(0, vh * 0.45, 0, vh * 0.7);
    mountainMist.addColorStop(0, 'rgba(255, 255, 255, 0)');
    mountainMist.addColorStop(1, 'rgba(255, 190, 120, 0.3)');
    ctx.fillStyle = mountainMist;
    ctx.fillRect(0, vh * 0.45, vw, vh * 0.25);
    ctx.restore();

    // --- 3. Mid-Distant Rainforest Canopy & Rushing Waterfalls (Parallax 0.12) ---
    ctx.save();
    const p1Offset = (camera.x * 0.12) % 800;
    ctx.fillStyle = pal.canopyFar;
    ctx.beginPath();
    ctx.moveTo(0, vh);
    for (let x = -800; x < vw + 800; x += 120) {
      const treeTopY = vh * 0.58 + Math.sin((x + p1Offset) * 0.009) * 45;
      // Multi-arced tree crowns
      ctx.arc(x - p1Offset, treeTopY, 65, Math.PI, 0, false);
    }
    ctx.lineTo(vw, vh);
    ctx.closePath();
    ctx.fill();

    // Cascading Rainforest Waterfalls (in river, mist, and canopy stages)
    const wfPositions = [280, 850, 1500];
    wfPositions.forEach((baseWfX) => {
      const wfX = ((baseWfX - p1Offset) % (vw + 500) + (vw + 500)) % (vw + 500) - 100;
      // White churning water stream
      const wfGrad = ctx.createLinearGradient(0, vh * 0.48, 0, vh * 0.95);
      wfGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      wfGrad.addColorStop(1, 'rgba(190, 235, 245, 0.25)');
      ctx.fillStyle = wfGrad;
      ctx.beginPath();
      ctx.moveTo(wfX - 9, vh * 0.48);
      ctx.lineTo(wfX + 9, vh * 0.48);
      ctx.quadraticCurveTo(wfX + 16, vh * 0.75, wfX + 20, vh * 0.95);
      ctx.lineTo(wfX - 20, vh * 0.95);
      ctx.quadraticCurveTo(wfX - 16, vh * 0.75, wfX - 9, vh * 0.48);
      ctx.fill();
      // Rock lip the water spills over
      ctx.fillStyle = 'rgba(120, 78, 50, 0.7)';
      ctx.beginPath();
      ctx.ellipse(wfX, vh * 0.48, 22, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Billowing mist cloud at waterfall base
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      const mistBob = Math.sin(time * 3 + baseWfX) * 6;
      ctx.beginPath();
      ctx.arc(wfX, vh * 0.92 + mistBob, 45, 0, Math.PI * 2);
      ctx.arc(wfX - 25, vh * 0.94 + mistBob, 35, 0, Math.PI * 2);
      ctx.arc(wfX + 25, vh * 0.94 + mistBob, 35, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // --- 3a. Very faint far trunks, thick with mist, for deep perspective ---
    ctx.save();
    const farSpacing = 120;
    const farOff = (camera.x * 0.09) % farSpacing;
    ctx.fillStyle = mix(pal.trunkColor, pal.skyBottom, 0.72);
    for (let fx = -farOff - 40; fx < vw + 120; fx += farSpacing) {
      const fs = Math.floor((camera.x * 0.09 + fx) / farSpacing);
      const fw = 7 + (Math.abs(fs * 7) % 7);
      ctx.fillRect(fx + Math.sin(fs * 1.9) * 24, vh * (0.22 + (Math.abs(fs * 5) % 4) * 0.03), fw, vh);
    }
    ctx.restore();

    // --- 3b. Mid-distance trees of varied species, faded into warm mist ---
    ctx.save();
    const midSpacing = 235;
    const midOff = (camera.x * 0.16) % midSpacing;
    for (let mx = -midOff - 60; mx < vw + 220; mx += midSpacing) {
      const seed = Math.floor((camera.x * 0.16 + mx) / midSpacing);
      const kind = Math.abs(seed) % 3; // 0 palm, 1 broadleaf, 2 strangler fig
      const w = 20 + (Math.abs(seed * 13) % 16);
      const lean = Math.sin(seed * 2.1) * 14;
      const trunkCol = mix(pal.trunkColor, pal.skyBottom, 0.5);
      const leafLight = mix(pal.foliageColor, pal.skyBottom, 0.3);
      const leafDark = mix(pal.foliageColor, pal.skyBottom, 0.08);
      ctx.fillStyle = trunkCol;
      ctx.strokeStyle = 'rgba(74, 46, 24, 0.25)';
      if (kind === 0) {
        // tall slim palm with ring marks and a big frond crown
        const topX = mx + lean * 2;
        ctx.beginPath();
        ctx.moveTo(mx - w * 0.28, vh);
        ctx.quadraticCurveTo(mx - w * 0.2 + lean, vh * 0.55, topX - w * 0.2, vh * 0.2);
        ctx.lineTo(topX + w * 0.2, vh * 0.2);
        ctx.quadraticCurveTo(mx + w * 0.3 + lean, vh * 0.55, mx + w * 0.34, vh);
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 1.6;
        for (let ry = vh * 0.28; ry < vh * 0.95; ry += 17) {
          ctx.beginPath();
          ctx.moveTo(topX - w * 0.2 - (ry / vh) * 3, ry);
          ctx.lineTo(topX + w * 0.2 + (ry / vh) * 3, ry);
          ctx.stroke();
        }
        frondCluster(ctx, topX, vh * 0.2, 76, leafLight, leafDark, time * 0.5 + seed);
      } else if (kind === 1) {
        // broadleaf tree: straight trunk, two crowns
        ctx.beginPath();
        ctx.moveTo(mx - w * 0.4 + lean, vh * 0.18);
        ctx.lineTo(mx + w * 0.4 + lean, vh * 0.18);
        ctx.lineTo(mx + w * 0.62, vh);
        ctx.lineTo(mx - w * 0.62, vh);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 235, 200, 0.18)';
        ctx.fillRect(mx - w * 0.3 + lean * 0.6, vh * 0.2, w * 0.14, vh * 0.75);
        frondCluster(ctx, mx + lean, vh * 0.2, 60, leafLight, leafDark, time * 0.5 + seed);
        frondCluster(ctx, mx + lean - 46, vh * 0.3, 42, leafLight, leafDark, time * 0.4 + seed * 2);
      } else {
        // strangler fig: wide crown with dangling aerial roots
        ctx.beginPath();
        ctx.moveTo(mx - w * 0.6 + lean, vh * 0.2);
        ctx.lineTo(mx + w * 0.6 + lean, vh * 0.2);
        ctx.lineTo(mx + w * 0.75, vh);
        ctx.lineTo(mx - w * 0.75, vh);
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = mix(pal.trunkColor, pal.skyBottom, 0.38);
        for (let r = -3; r <= 3; r++) {
          ctx.beginPath();
          ctx.moveTo(mx + r * 17 + lean, vh * 0.24);
          ctx.quadraticCurveTo(mx + r * 20 + Math.sin(time * 0.7 + r) * 5, vh * 0.6, mx + r * 12, vh * 0.98);
          ctx.stroke();
        }
        frondCluster(ctx, mx + lean, vh * 0.2, 70, leafLight, leafDark, time * 0.5 + seed);
        frondCluster(ctx, mx + lean + 58, vh * 0.26, 46, leafLight, leafDark, time * 0.45 + seed * 3);
      }
    }
    ctx.restore();
    // warm mist between depth layers
    ctx.fillStyle = `rgba(255, 224, 180, ${0.05 + warmth * 0.05})`;
    ctx.fillRect(0, 0, vw, vh);

    // --- 4. Massive Ancient Rainforest Trees (Kapok & Ceiba Trunks) (Parallax 0.28) ---
    ctx.save();
    const treeSpacing = 420;
    const treeOffset = (camera.x * 0.28) % treeSpacing;
    const startX = -treeOffset - 100;

    for (let tx = startX; tx < vw + 300; tx += treeSpacing) {
      const treeSeed = Math.floor((camera.x * 0.28 + tx) / treeSpacing);
      const trunkWidth = 55 + (Math.abs(treeSeed * 17) % 25);
      const trunkHeight = vh * 0.85;
      const bkind = Math.abs(treeSeed) % 3; // 0 kapok, 1 royal palm, 2 banyan fig
      if (bkind === 1) {
        // Royal palm: smooth tall column, ringed, huge crown, coconuts
        const lean = Math.sin(treeSeed * 1.7) * 26;
        const g = ctx.createLinearGradient(tx - trunkWidth * 0.4, 0, tx + trunkWidth * 0.4, 0);
        g.addColorStop(0, mix(pal.trunkColor, '#d6b88a', 0.55));
        g.addColorStop(0.5, mix(pal.trunkColor, '#d6b88a', 0.3));
        g.addColorStop(1, mix(pal.trunkColor, '#3e2616', 0.2));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(tx - trunkWidth * 0.55, vh);
        ctx.quadraticCurveTo(tx - trunkWidth * 0.3 + lean, vh * 0.55, tx + lean - trunkWidth * 0.26, vh * 0.17);
        ctx.lineTo(tx + lean + trunkWidth * 0.26, vh * 0.17);
        ctx.quadraticCurveTo(tx + trunkWidth * 0.34 + lean, vh * 0.55, tx + trunkWidth * 0.6, vh);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(74, 46, 24, 0.35)';
        ctx.lineWidth = 2;
        for (let ry = vh * 0.24; ry < vh * 0.97; ry += 20) {
          const k = (ry - vh * 0.17) / (vh * 0.83);
          ctx.beginPath();
          ctx.moveTo(tx + lean * (1 - k) - trunkWidth * (0.26 + 0.3 * k), ry);
          ctx.lineTo(tx + lean * (1 - k) + trunkWidth * (0.26 + 0.34 * k), ry);
          ctx.stroke();
        }
        ctx.fillStyle = '#7a4a22';
        [-10, 0, 10].forEach((o) => {
          ctx.beginPath();
          ctx.arc(tx + lean + o, vh * 0.2 + Math.abs(o) * 0.3, 7, 0, Math.PI * 2);
          ctx.fill();
        });
        frondCluster(ctx, tx + lean, vh * 0.17, 150, pal.foliageColor, mix(pal.foliageColor, '#0c3b24', 0.45), time * 0.5 + tx * 0.01);
        continue;
      }
      if (bkind === 2) {
        // Banyan / strangler fig: broad trunk, curtain of aerial roots, wide layered crown
        ctx.fillStyle = mix(pal.foliageColor, '#0c3b24', 0.5);
        ctx.beginPath();
        for (let l = 0; l < 9; l++) {
          const a = (l / 9) * Math.PI * 2;
          ctx.arc(tx + Math.cos(a) * trunkWidth * 2.4, vh * 0.24 + Math.sin(a) * 30, 62, 0, Math.PI * 2);
        }
        ctx.fill();
        const bg2 = ctx.createLinearGradient(tx - trunkWidth, 0, tx + trunkWidth, 0);
        bg2.addColorStop(0, mix(pal.trunkColor, '#d6b88a', 0.3));
        bg2.addColorStop(0.5, pal.trunkColor);
        bg2.addColorStop(1, mix(pal.trunkColor, '#3e2616', 0.3));
        ctx.fillStyle = bg2;
        ctx.beginPath();
        ctx.moveTo(tx - trunkWidth * 0.7, vh * 0.2);
        ctx.lineTo(tx + trunkWidth * 0.7, vh * 0.2);
        ctx.lineTo(tx + trunkWidth * 0.95, vh);
        ctx.lineTo(tx - trunkWidth * 0.95, vh);
        ctx.closePath();
        ctx.fill();
        for (let r = -4; r <= 4; r++) {
          const rx0 = tx + r * trunkWidth * 0.5;
          const sway = Math.sin(time * 0.8 + r) * 4;
          ctx.strokeStyle = 'rgba(74, 46, 24, 0.9)';
          ctx.lineWidth = 7 - Math.abs(r) * 0.6;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(rx0, vh * 0.26);
          ctx.quadraticCurveTo(rx0 + r * 10 + sway, vh * 0.6, rx0 + r * 5, vh);
          ctx.stroke();
          ctx.strokeStyle = mix(pal.trunkColor, '#d6b88a', 0.35);
          ctx.lineWidth = 3;
          ctx.stroke();
        }
        [-2.4, 0, 2.4].forEach((m) => frondCluster(ctx, tx + trunkWidth * m, vh * 0.2, 96, pal.foliageColor, mix(pal.foliageColor, '#0c3b24', 0.45), time * 0.5 + m));
        continue;
      }

      // Deep rich ancient bark gradient
      const barkGrad = ctx.createLinearGradient(tx - trunkWidth * 0.5, 0, tx + trunkWidth * 0.5, 0);
      barkGrad.addColorStop(0, '#6b4a30');
      barkGrad.addColorStop(0.3, pal.trunkColor);
      barkGrad.addColorStop(0.7, '#6a4426');
      barkGrad.addColorStop(1, '#4a3020');
      ctx.fillStyle = barkGrad;

      // Trunk with flared buttress roots at bottom
      ctx.beginPath();
      ctx.moveTo(tx - trunkWidth * 0.4, vh * 0.15);
      ctx.lineTo(tx + trunkWidth * 0.4, vh * 0.15);
      ctx.lineTo(tx + trunkWidth * 0.5, vh * 0.7);
      ctx.quadraticCurveTo(tx + trunkWidth * 0.62, vh * 0.94, tx + trunkWidth * 1.05, vh);
      ctx.lineTo(tx - trunkWidth * 1.05, vh);
      ctx.quadraticCurveTo(tx - trunkWidth * 0.62, vh * 0.94, tx - trunkWidth * 0.5, vh * 0.7);
      ctx.closePath();
      ctx.fill();
      // sunlit edge + bark grooves
      ctx.fillStyle = 'rgba(255, 214, 150, 0.22)';
      ctx.beginPath();
      ctx.moveTo(tx - trunkWidth * 0.36, vh * 0.15);
      ctx.lineTo(tx - trunkWidth * 0.14, vh * 0.15);
      ctx.lineTo(tx - trunkWidth * 0.2, vh * 0.95);
      ctx.lineTo(tx - trunkWidth * 0.46, vh * 0.95);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(74, 46, 24, 0.3)';
      ctx.lineWidth = 2;
      [0.1, 0.3].forEach((o) => {
        ctx.beginPath();
        ctx.moveTo(tx + trunkWidth * o, vh * 0.2);
        ctx.quadraticCurveTo(tx + trunkWidth * (o + 0.08), vh * 0.5, tx + trunkWidth * o * 1.2, vh * 0.92);
        ctx.stroke();
      });

      // Giant sprawling diagonal canopy branches
      ctx.fillStyle = pal.trunkColor;
      ctx.beginPath();
      // Left high branch
      ctx.moveTo(tx - trunkWidth * 0.35, vh * 0.35);
      ctx.quadraticCurveTo(tx - trunkWidth * 1.8, vh * 0.28, tx - trunkWidth * 2.8, vh * 0.18);
      ctx.lineTo(tx - trunkWidth * 2.8, vh * 0.24);
      ctx.quadraticCurveTo(tx - trunkWidth * 1.6, vh * 0.34, tx - trunkWidth * 0.35, vh * 0.42);
      // Right high branch
      ctx.moveTo(tx + trunkWidth * 0.35, vh * 0.4);
      ctx.quadraticCurveTo(tx + trunkWidth * 1.8, vh * 0.32, tx + trunkWidth * 2.8, vh * 0.22);
      ctx.lineTo(tx + trunkWidth * 2.8, vh * 0.28);
      ctx.quadraticCurveTo(tx + trunkWidth * 1.6, vh * 0.38, tx + trunkWidth * 0.35, vh * 0.47);
      ctx.fill();

      // Lush foliage crowns on branches (Fan palms & Monstera crowns)
      ctx.fillStyle = pal.foliageColor;
      [-2.4, 0, 2.4].forEach((sideMult) => {
        const leafClusterX = tx + trunkWidth * sideMult;
        const leafClusterY = vh * 0.22;
        ctx.beginPath();
        for (let lobe = 0; lobe < 7; lobe++) {
          const a = (lobe / 7) * Math.PI * 2;
          ctx.arc(leafClusterX + Math.cos(a) * 42, leafClusterY + Math.sin(a) * 28, 34, 0, Math.PI * 2);
        }
        ctx.arc(leafClusterX, leafClusterY, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = mix(pal.foliageColor, '#0c3b24', 0.35);
        ctx.beginPath();
        ctx.ellipse(leafClusterX, leafClusterY + 30, 52, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        frondCluster(ctx, leafClusterX, leafClusterY + 6, 64, pal.foliageColor, mix(pal.foliageColor, '#0c3b24', 0.4), time * 0.6 + tx * 0.01);
        ctx.fillStyle = mix(pal.foliageHighlight, '#ffe9a0', 0.3);
        ctx.beginPath();
        ctx.arc(leafClusterX - 14, leafClusterY - 16, 16, 0, Math.PI * 2);
        ctx.arc(leafClusterX + 12, leafClusterY - 22, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pal.foliageColor;
      });

      // Hanging moss / aerial strangler roots draped down from branches
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 3;
      for (let r = -2; r <= 2; r++) {
        const rootX = tx + r * 22;
        const rootLen = 80 + Math.sin(rootX) * 40;
        ctx.beginPath();
        ctx.moveTo(rootX, vh * 0.28);
        ctx.quadraticCurveTo(rootX + Math.sin(time + r) * 10, vh * 0.28 + rootLen * 0.5, rootX + Math.sin(time * 1.5 + r) * 15, vh * 0.28 + rootLen);
        ctx.stroke();
      }

      // Wild blooming pink orchids clinging to tree bark
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(tx - trunkWidth * 0.35, vh * 0.55, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(tx - trunkWidth * 0.35, vh * 0.55, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Hanging lianas dripping from the high canopy
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 0; i < 10; i++) {
      const lx = (((i * 163 - camera.x * 0.34) % (vw + 300)) + (vw + 300)) % (vw + 300) - 100;
      const len = 90 + ((i * 53) % 150);
      const sway = Math.sin(time * 0.9 + i) * 8;
      ctx.strokeStyle = '#1f6a3a';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(lx, -10);
      ctx.quadraticCurveTo(lx + sway * 0.5, len * 0.5, lx + sway, len);
      ctx.stroke();
      ctx.fillStyle = i % 2 ? '#34b25a' : '#22934a';
      for (let k = 1; k <= 4; k++) {
        const t = k / 5;
        const ly = len * t;
        const lxx = lx + sway * t * t + (k % 2 ? 6 : -6);
        ctx.beginPath();
        ctx.ellipse(lxx, ly, 7, 3.6, k % 2 ? 0.7 : -0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // Giant leaves and heliconia hanging in from the canopy (rainforest signature plants)
    ctx.save();
    for (let i = 0; i < 6; i++) {
      const gx = (((i * 281 - camera.x * 0.5) % (vw + 500)) + (vw + 500)) % (vw + 500) - 150;
      const sw = Math.sin(time * 0.7 + i) * 0.05;
      const gl = 130 + ((i * 47) % 70);
      drawFrond(ctx, gx, -8, gl, Math.PI / 2 + 0.32 + sw, 18, 26, mix(pal.foliageColor, '#0c3b24', 0.45));
      drawFrond(ctx, gx + 6, -8, gl * 0.8, Math.PI / 2 - 0.34 - sw, 14, 22, mix(pal.foliageColor, '#0c3b24', 0.25));
    }
    for (let i = 0; i < 4; i++) {
      const hx = (((i * 397 + 120 - camera.x * 0.42) % (vw + 500)) + (vw + 500)) % (vw + 500) - 150;
      const hl = 80 + ((i * 29) % 50);
      ctx.strokeStyle = '#2a7a3c';
      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(hx, -6);
      ctx.quadraticCurveTo(hx + 18, hl * 0.5, hx + 8 + Math.sin(time + i) * 4, hl);
      ctx.stroke();
      // heliconia bracts: alternating red/orange claws with yellow tips
      for (let b = 0; b < 5; b++) {
        const by = hl * (0.3 + b * 0.15);
        const bx = hx + 8 + Math.sin(by * 0.07) * 8 + (b % 2 ? 6 : -6);
        ctx.fillStyle = b % 2 ? '#e8452c' : '#f26a2e';
        ctx.beginPath();
        ctx.moveTo(bx - 7, by);
        ctx.quadraticCurveTo(bx + (b % 2 ? 11 : -11), by + 8, bx + (b % 2 ? 4 : -4), by + 20);
        ctx.quadraticCurveTo(bx + (b % 2 ? -3 : 3), by + 8, bx + 7, by);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffd34a';
        ctx.beginPath();
        ctx.arc(bx + (b % 2 ? 4 : -4), by + 19, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // Warm mist pooling at ground level for depth
    const groundMist = ctx.createLinearGradient(0, vh * 0.6, 0, vh);
    groundMist.addColorStop(0, 'rgba(255, 200, 140, 0)');
    groundMist.addColorStop(1, 'rgba(255, 190, 130, 0.35)');
    ctx.fillStyle = groundMist;
    ctx.fillRect(0, vh * 0.6, vw, vh * 0.4);

    // Lush bush bands fill the space below the walkway (two parallax layers)
    [
      { par: 0.5, base: vh * 0.86, amp: 22, step: 64, rad: 44, top: mix(pal.canopyFar, '#2f6b3a', 0.35), bot: mix(pal.canopyFar, '#1c3b2a', 0.55) },
      { par: 0.7, base: vh * 0.95, amp: 26, step: 78, rad: 54, top: mix(pal.canopyMid, '#3d8a44', 0.3), bot: mix(pal.canopyMid, '#1f4a2e', 0.5) },
    ].forEach((L) => {
      const off = (camera.x * L.par) % (L.step * 7);
      const g = ctx.createLinearGradient(0, L.base - L.rad, 0, vh);
      g.addColorStop(0, L.top);
      g.addColorStop(1, L.bot);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(-L.step * 2, vh);
      for (let x = -L.step * 2; x < vw + L.step * 2; x += L.step) {
        const k = Math.floor((x + off) / L.step);
        const r = L.rad + ((k * 37) % 17);
        const y = L.base + Math.sin(k * 1.7) * L.amp;
        ctx.arc(x - (off % L.step), y, r, Math.PI, 0, false);
      }
      ctx.lineTo(vw + L.step * 2, vh);
      ctx.closePath();
      ctx.fill();
      // mossy boulders and fiery bird-of-paradise blooms for fun colour
      for (let x = -L.step; x < vw + L.step; x += L.step * 2.3) {
        const k = Math.floor((x + off) / (L.step * 2.3));
        const y = L.base + Math.sin(Math.floor((x + off) / L.step) * 1.7) * L.amp - L.rad * 0.2;
        if (k % 3 === 0) {
          ctx.fillStyle = '#8a6a55';
          ctx.strokeStyle = 'rgba(58, 32, 16, 0.7)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(x, y + 14, 34, 20, 0, Math.PI, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = 'rgba(120, 190, 90, 0.7)';
          ctx.beginPath();
          ctx.ellipse(x - 6, y - 2, 20, 6, 0, Math.PI, 0);
          ctx.fill();
        } else if (k % 3 === 1) {
          const sway = Math.sin(time * 1.4 + k) * 2;
          ctx.strokeStyle = '#2a7a3c';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x, y + 30);
          ctx.lineTo(x + sway, y - 12);
          ctx.stroke();
          for (let pt = 0; pt < 5; pt++) {
            const a = -Math.PI / 2 + (pt - 2) * 0.42;
            ctx.fillStyle = pt % 2 ? '#ff7a1a' : '#ffb21a';
            ctx.beginPath();
            ctx.moveTo(x + sway, y - 12);
            ctx.quadraticCurveTo(x + sway + Math.cos(a - 0.3) * 14, y - 12 + Math.sin(a - 0.3) * 14, x + sway + Math.cos(a) * 26, y - 12 + Math.sin(a) * 26);
            ctx.quadraticCurveTo(x + sway + Math.cos(a + 0.3) * 14, y - 12 + Math.sin(a + 0.3) * 14, x + sway, y - 12);
            ctx.fill();
          }
        }
      }
      // fern & broad-leaf fronds sprouting along the ridge for rainforest texture
      for (let x = -L.step; x < vw + L.step; x += L.step * 0.55) {
        const k = Math.floor((x + off) / (L.step * 0.55));
        const y = L.base + Math.sin(Math.floor((x + off) / L.step) * 1.7) * L.amp - L.rad * 0.55;
        const col = k % 2 ? L.top : mix(L.top, '#9be36a', 0.25);
        for (let f = 0; f < 4; f++) {
          const a = -Math.PI * (0.18 + f * 0.21) + Math.sin(time * 0.8 + k + f) * 0.03;
          drawFrond(ctx, x, y + 12, L.rad * 0.95, a, 10, 7.5, col);
        }
      }
    });

    // --- 5. Volumetric Rainforest God-Rays cutting through dense leaves ---
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.75;
    const numBeams = 6;
    for (let b = 0; b < numBeams; b++) {
      const beamX = ((b * 260 + time * 10 - camera.x * 0.08) % (vw + 400)) - 200;
      const beamWidth = 65 + Math.sin(time * 1.2 + b) * 16;

      const beamGrad = ctx.createLinearGradient(beamX, 0, beamX + 180, vh);
      beamGrad.addColorStop(0, pal.sunbeamColor);
      beamGrad.addColorStop(0.5, pal.sunbeamColor);
      beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(beamX, -40);
      ctx.lineTo(beamX + beamWidth, -40);
      ctx.lineTo(beamX + beamWidth + 240, vh + 40);
      ctx.lineTo(beamX + 180, vh + 40);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Deep canopy shadow at the screen edges, golden light from the sun side
    const edge = ctx.createRadialGradient(vw * 0.55, vh * 0.45, vh * 0.35, vw * 0.55, vh * 0.45, vw * 0.8);
    edge.addColorStop(0, 'rgba(6, 40, 24, 0)');
    edge.addColorStop(1, 'rgba(6, 40, 24, 0.26)');
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, vw, vh);
    const sunWash = ctx.createLinearGradient(vw, 0, vw * 0.3, vh * 0.6);
    sunWash.addColorStop(0, `rgba(255, 214, 120, ${0.18 + warmth * 0.18})`);
    sunWash.addColorStop(1, 'rgba(255, 214, 120, 0)');
    ctx.fillStyle = sunWash;
    ctx.fillRect(0, 0, vw, vh);

    // --- 6. Flying Background Birds (Toucans & Macaws) ---
    ctx.save();
    this.birds.forEach((bird) => {
      const bx = ((bird.x + time * bird.speed - camera.x * 0.2) % (vw + 300) + (vw + 300)) % (vw + 300) - 100;
      const by = bird.y + Math.sin(time * 2 + bird.wingPhase) * 16;
      const wingFlap = Math.sin(time * 12 + bird.wingPhase);

      ctx.save();
      ctx.translate(bx, by);
      // Bird body
      ctx.fillStyle = bird.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Wing
      ctx.beginPath();
      ctx.ellipse(-2, wingFlap * 6, 7, 3, -0.3 * wingFlap, 0, Math.PI * 2);
      ctx.fill();
      // Toucan Beak
      ctx.fillStyle = bird.beakColor;
      ctx.beginPath();
      ctx.moveTo(8, -2);
      ctx.lineTo(16, 1);
      ctx.lineTo(8, 3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
    ctx.restore();

    // --- 7. Floating Jungle Pollen / Glow Spores ---
    ctx.save();
    ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
    this.ambientSpores.forEach((spore) => {
      const sx = ((spore.x - camera.x * 0.2 + Math.sin(time + spore.phase) * 28) % vw + vw) % vw;
      const sy = ((spore.y + time * spore.speed) % vh + vh) % vh;
      ctx.beginPath();
      ctx.arc(sx, sy, spore.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // --- 8. Fluttering Tropical Butterflies (Blue Morphos, Swallowtails) ---
    ctx.save();
    this.butterflies.forEach((b) => {
      const bx = ((b.x + time * b.speedX - camera.x * 0.35) % (vw + 200) + (vw + 200)) % (vw + 200) - 100;
      const by = b.y + Math.sin(time * 3 + b.phase) * 20;
      const flap = Math.sin(time * 16 + b.phase);

      ctx.save();
      ctx.translate(bx, by);
      ctx.fillStyle = b.color;

      // Left wing
      ctx.beginPath();
      ctx.ellipse(-5, 0, 9, 6 * Math.abs(flap), 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Right wing
      ctx.beginPath();
      ctx.ellipse(5, 0, 9, 6 * Math.abs(flap), -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(0, 0, 1.8, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    ctx.restore();
  }

  /**
   * Render in-world ancient rainforest trees, platforms, branches, and swinging/climbing vines
   */
  public renderPlatformsAndVines(
    ctx: CanvasRenderingContext2D,
    world: WorldInfo,
    platforms: Platform[],
    vines: Vine[],
    trees: TreeStructure[] = [],
    camera: Camera,
    time: number
  ) {
    const pal = world.palette;

    // --- 0. Render Majestic In-World Ancient Rainforest Trees ---
    trees.forEach((tree) => {
      if (tree.x + tree.canopyRadius < camera.x - 120 || tree.x - tree.canopyRadius > camera.x + camera.viewportWidth + 120) return;

      ctx.save();

      const treeKind = Math.abs(tree.id) % 4; // 0 kapok, 1 palm, 2 banyan, 3 umbrella tree
      if (treeKind === 0) {
      // Deep Ancient Organic Bark Gradient
      const trunkGrad = ctx.createLinearGradient(
        tree.x - tree.trunkWidth * 0.5, 0,
        tree.x + tree.trunkWidth * 0.5, 0
      );
      trunkGrad.addColorStop(0, '#5a3a22');
      trunkGrad.addColorStop(0.2, '#7a5232');
      trunkGrad.addColorStop(0.5, pal.trunkColor);
      trunkGrad.addColorStop(0.8, '#6a4426');
      trunkGrad.addColorStop(1, '#46301f');
      ctx.fillStyle = trunkGrad;

      // Massive Tree Trunk with Flared Buttress Roots
      ctx.beginPath();
      ctx.moveTo(tree.x - tree.trunkWidth * 0.45, tree.topY);
      ctx.lineTo(tree.x + tree.trunkWidth * 0.45, tree.topY);
      ctx.lineTo(tree.x + tree.trunkWidth * 0.55, tree.groundY - 90);
      // Right buttress flare
      ctx.quadraticCurveTo(tree.x + tree.trunkWidth * 0.75, tree.groundY - 22, tree.x + tree.trunkWidth * 1.15, tree.groundY);
      ctx.lineTo(tree.x - tree.trunkWidth * 1.15, tree.groundY);
      // Left buttress flare
      ctx.quadraticCurveTo(tree.x - tree.trunkWidth * 0.75, tree.groundY - 22, tree.x - tree.trunkWidth * 0.55, tree.groundY - 90);
      ctx.closePath();
      ctx.fill();

      // Organic Bark Ridges & Striations
      ctx.strokeStyle = 'rgba(74, 46, 24, 0.42)';
      ctx.lineWidth = 2.8;
      [-0.24, 0, 0.24].forEach((offset) => {
        const rx = tree.x + tree.trunkWidth * offset;
        ctx.beginPath();
        ctx.moveTo(rx, tree.topY + 30);
        ctx.bezierCurveTo(
          rx + 8, tree.topY + 180,
          rx - 8, tree.topY + 320,
          rx + offset * 25, tree.groundY - 15
        );
        ctx.stroke();
      });

      // Sunlit edge, growth rings and a knot for bark texture
      ctx.fillStyle = 'rgba(255, 214, 150, 0.2)';
      ctx.fillRect(tree.x - tree.trunkWidth * 0.42, tree.topY + 30, tree.trunkWidth * 0.16, tree.groundY - tree.topY - 120);
      ctx.strokeStyle = 'rgba(74, 46, 24, 0.22)';
      ctx.lineWidth = 2;
      for (let ry = tree.topY + 60; ry < tree.groundY - 100; ry += 56) {
        ctx.beginPath();
        ctx.moveTo(tree.x - tree.trunkWidth * 0.45, ry);
        ctx.quadraticCurveTo(tree.x, ry + 8, tree.x + tree.trunkWidth * 0.45, ry);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(74, 46, 24, 0.5)';
      ctx.beginPath();
      ctx.ellipse(tree.x + tree.trunkWidth * 0.14, tree.topY + (tree.groundY - tree.topY) * 0.42, 5.5, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 214, 150, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Moss & Lichen Patches Clinging to Bark
      ctx.fillStyle = 'rgba(34, 197, 94, 0.45)';
      [0.25, 0.52, 0.78].forEach((t) => {
        const my = tree.topY + (tree.groundY - tree.topY) * t;
        ctx.beginPath();
        ctx.ellipse(tree.x - tree.trunkWidth * 0.22, my, 12, 28, 0.15, 0, Math.PI * 2);
        ctx.fill();
      });

      // Sprawling Canopy Branches Extending Out from Trunk
      ctx.fillStyle = pal.trunkColor;
      // Left sprawling bough
      ctx.beginPath();
      ctx.moveTo(tree.x - tree.trunkWidth * 0.4, tree.topY + 70);
      ctx.quadraticCurveTo(tree.x - tree.canopyRadius * 0.85, tree.topY + 50, tree.x - tree.canopyRadius * 1.25, tree.topY + 22);
      ctx.lineTo(tree.x - tree.canopyRadius * 1.25, tree.topY + 38);
      ctx.quadraticCurveTo(tree.x - tree.canopyRadius * 0.75, tree.topY + 72, tree.x - tree.trunkWidth * 0.35, tree.topY + 92);
      ctx.closePath();
      ctx.fill();

      // Right sprawling bough
      ctx.beginPath();
      ctx.moveTo(tree.x + tree.trunkWidth * 0.4, tree.topY + 80);
      ctx.quadraticCurveTo(tree.x + tree.canopyRadius * 0.85, tree.topY + 60, tree.x + tree.canopyRadius * 1.25, tree.topY + 30);
      ctx.lineTo(tree.x + tree.canopyRadius * 1.25, tree.topY + 46);
      ctx.quadraticCurveTo(tree.x + tree.canopyRadius * 0.75, tree.topY + 82, tree.x + tree.trunkWidth * 0.35, tree.topY + 102);
      ctx.closePath();
      ctx.fill();

      // Lush Rainforest Canopy Foliage Umbrella Crown
      const crownY = tree.topY + 10;
      const crownShade = mix(pal.foliageColor, '#0c3b24', 0.4);
      const crownLobes = (cx: number, cy: number, r: number, fill: string) => {
        ctx.fillStyle = fill;
        ctx.beginPath();
        for (let l = 0; l < 7; l++) {
          const a = (l / 7) * Math.PI * 2;
          ctx.arc(cx + Math.cos(a) * r * 0.62, cy + Math.sin(a) * r * 0.42, r * 0.5, 0, Math.PI * 2);
        }
        ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2);
        ctx.fill();
      };
      [-1.1, -0.5, 0, 0.5, 1.1].forEach((mult) => {
        const cx = tree.x + mult * tree.canopyRadius * 0.65;
        const cy = crownY + Math.abs(mult) * 14;
        crownLobes(cx, cy + 10, 72, crownShade);
        crownLobes(cx, cy, 70, pal.foliageColor);
      });
      // Sunlit highlight layer (golden-tinted)
      const sunLeaf = mix(pal.foliageHighlight, '#ffe9a0', 0.3);
      [-0.8, 0, 0.8].forEach((mult) => {
        crownLobes(tree.x + mult * tree.canopyRadius * 0.55 - 6, crownY - 16, 44, sunLeaf);
      });
      [-1.1, -0.5, 0, 0.5, 1.1].forEach((mult, mi) => {
        frondCluster(ctx, tree.x + mult * tree.canopyRadius * 0.65, crownY + Math.abs(mult) * 14 + 6, 78, pal.foliageColor, crownShade, time * 0.6 + mi);
      });

      // Hanging Spanish Moss / Bromeliads on Branches
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 2.4;
      [-70, -35, 35, 70].forEach((ox) => {
        ctx.beginPath();
        ctx.moveTo(tree.x + ox, crownY + 45);
        ctx.quadraticCurveTo(tree.x + ox + 6, crownY + 85, tree.x + ox - 3, crownY + 115);
        ctx.stroke();
      });

      // Wild Blooming Orchids on Tree Crookes
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(tree.x - tree.trunkWidth * 0.35, tree.topY + 110, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(tree.x - tree.trunkWidth * 0.35, tree.topY + 110, 3, 0, Math.PI * 2);
      ctx.fill();

      } else {
        const tx0 = tree.x;
        const tw = tree.trunkWidth;
        const crownCol = pal.foliageColor;
        const shadeCol = mix(pal.foliageColor, '#0c3b24', 0.45);
        const bark = (c1: number, c2: number) => {
          const g = ctx.createLinearGradient(tx0 - tw, 0, tx0 + tw, 0);
          g.addColorStop(0, mix(pal.trunkColor, '#d6b88a', c1));
          g.addColorStop(0.55, mix(pal.trunkColor, '#d6b88a', c2));
          g.addColorStop(1, mix(pal.trunkColor, '#3e2616', 0.3));
          return g;
        };
        if (treeKind === 1) {
          // Palm: ringed slender column with a big frond crown and coconuts
          const lean = Math.sin(tree.id * 1.3) * 22;
          ctx.fillStyle = bark(0.5, 0.3);
          ctx.strokeStyle = 'rgba(58, 32, 16, 0.85)';
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(tx0 - tw * 0.6, tree.groundY);
          ctx.quadraticCurveTo(tx0 - tw * 0.32 + lean, (tree.groundY + tree.topY) / 2, tx0 + lean - tw * 0.26, tree.topY + 40);
          ctx.lineTo(tx0 + lean + tw * 0.26, tree.topY + 40);
          ctx.quadraticCurveTo(tx0 + tw * 0.36 + lean, (tree.groundY + tree.topY) / 2, tx0 + tw * 0.66, tree.groundY);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.strokeStyle = 'rgba(74, 46, 24, 0.35)';
          ctx.lineWidth = 2;
          for (let ry = tree.topY + 70; ry < tree.groundY - 10; ry += 22) {
            const k = (ry - tree.topY) / (tree.groundY - tree.topY);
            ctx.beginPath();
            ctx.moveTo(tx0 + lean * (1 - k) - tw * (0.26 + 0.34 * k), ry);
            ctx.lineTo(tx0 + lean * (1 - k) + tw * (0.26 + 0.36 * k), ry);
            ctx.stroke();
          }
          ctx.fillStyle = '#7a4a22';
          [-9, 0, 9].forEach((o) => {
            ctx.beginPath();
            ctx.arc(tx0 + lean + o, tree.topY + 52 + Math.abs(o) * 0.4, 6.5, 0, Math.PI * 2);
            ctx.fill();
          });
          frondCluster(ctx, tx0 + lean, tree.topY + 40, tree.canopyRadius * 1.3 + 30, crownCol, shadeCol, time * 0.6 + tree.id);
        } else if (treeKind === 2) {
          // Banyan: wide crown held up by many aerial root columns
          ctx.fillStyle = shadeCol;
          ctx.beginPath();
          for (let l = 0; l < 9; l++) {
            const a = (l / 9) * Math.PI * 2;
            ctx.arc(tx0 + Math.cos(a) * tree.canopyRadius * 0.9, tree.topY + 60 + Math.sin(a) * 34, 56, 0, Math.PI * 2);
          }
          ctx.fill();
          ctx.fillStyle = bark(0.3, 0.1);
          ctx.strokeStyle = 'rgba(58, 32, 16, 0.85)';
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.roundRect(tx0 - tw * 0.55, tree.topY + 70, tw * 1.1, tree.groundY - tree.topY - 70, 8);
          ctx.fill();
          ctx.stroke();
          for (let r = -3; r <= 3; r++) {
            if (r === 0) continue;
            const rx0 = tx0 + r * tw * 0.55;
            ctx.strokeStyle = 'rgba(58, 32, 16, 0.9)';
            ctx.lineWidth = 8 - Math.abs(r);
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(rx0 * 0.6 + tx0 * 0.4, tree.topY + 100);
            ctx.quadraticCurveTo(rx0 + Math.sin(time * 0.8 + r) * 4, tree.groundY - 140, rx0 + r * 4, tree.groundY);
            ctx.stroke();
            ctx.strokeStyle = mix(pal.trunkColor, '#d6b88a', 0.35);
            ctx.lineWidth = 3.4;
            ctx.stroke();
          }
          [-1, 0, 1].forEach((m, mi) => frondCluster(ctx, tx0 + m * tree.canopyRadius * 0.75, tree.topY + 62 + Math.abs(m) * 12, 92, crownCol, shadeCol, time * 0.6 + mi));
        } else {
          // Umbrella (cecropia) tree: candelabra branches with big star-shaped leaves
          ctx.fillStyle = bark(0.45, 0.35);
          ctx.strokeStyle = 'rgba(58, 32, 16, 0.85)';
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(tx0 - tw * 0.5, tree.groundY);
          ctx.lineTo(tx0 - tw * 0.22, tree.topY + 110);
          ctx.lineTo(tx0 + tw * 0.22, tree.topY + 110);
          ctx.lineTo(tx0 + tw * 0.5, tree.groundY);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          const tops: Array<[number, number]> = [[-tree.canopyRadius * 0.7, tree.topY + 40], [0, tree.topY + 10], [tree.canopyRadius * 0.7, tree.topY + 46]];
          tops.forEach(([ox, oy], ti) => {
            ctx.strokeStyle = 'rgba(58, 32, 16, 0.9)';
            ctx.lineWidth = tw * 0.18 + 3;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(tx0, tree.topY + 115);
            ctx.quadraticCurveTo(tx0 + ox * 0.3, tree.topY + 90, tx0 + ox, oy + 18);
            ctx.stroke();
            ctx.strokeStyle = mix(pal.trunkColor, '#d6b88a', 0.4);
            ctx.lineWidth = tw * 0.18;
            ctx.stroke();
            for (let k = 0; k < 8; k++) {
              const a = (k / 8) * Math.PI * 2 + Math.sin(time * 0.6 + ti) * 0.05;
              drawFrond(ctx, tx0 + ox, oy, 54, a, Math.sin(a) > 0 ? 18 : -6, 17, k % 2 ? crownCol : mix(crownCol, '#9be36a', 0.3));
            }
            ctx.fillStyle = '#7ab64a';
            ctx.beginPath();
            ctx.arc(tx0 + ox, oy, 6, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      }

      // IF Tree Has Climbing Vine: Render the thick twisting climbing liana on trunk with footholds
      if (tree.hasClimbVine) {
        // Main climbing rope winding up the trunk
        ctx.strokeStyle = '#166534';
        ctx.lineWidth = 8.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tree.x, tree.groundY - 15);
        for (let vy = tree.groundY - 15; vy >= tree.topY + 30; vy -= 40) {
          const waveX = tree.x + Math.sin(vy * 0.05) * 12;
          ctx.lineTo(waveX, vy);
        }
        ctx.stroke();

        // Inner glowing fibrous core
        ctx.strokeStyle = '#86efac';
        ctx.lineWidth = 3.0;
        ctx.stroke();

        // Glowing Emerald Leaf Steps / Footholds along the trunk
        for (let vy = tree.groundY - 45; vy >= tree.topY + 50; vy -= 55) {
          const waveX = tree.x + Math.sin(vy * 0.05) * 12;
          const leafSide = Math.floor(vy / 55) % 2 === 0 ? 1 : -1;
          
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.ellipse(waveX + leafSide * 10, vy, 11, 6, leafSide * 0.4, 0, Math.PI * 2);
          ctx.fill();

          // Subtle glowing beacon
          ctx.fillStyle = 'rgba(254, 240, 138, 0.75)';
          ctx.beginPath();
          ctx.arc(waveX, vy, 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    });

    // --- 1. Render Vines (Swinging Lianas & Tree Vines) ---
    vines.forEach((v) => {
      if (v.x < camera.x - 120 || v.x > camera.x + camera.viewportWidth + 120) return;

      const vineLength = v.bottomY - v.topY;
      const isSwinging = v.isSwingingVine && v.swingAngle !== undefined;
      const angle = isSwinging ? (v.swingAngle || 0) : Math.sin(time * v.swaySpeed + v.swayPhase) * 0.12;

      ctx.save();

      // Anchor point at tree branch above
      ctx.fillStyle = '#166534';
      ctx.beginPath();
      ctx.arc(v.x, v.topY, 7, 0, Math.PI * 2);
      ctx.fill();

      // Vine Rope with natural dynamic bending curve
      const tipX = v.x + Math.sin(angle) * vineLength;
      const tipY = v.topY + Math.cos(angle) * vineLength;
      const midX = (v.x + tipX) * 0.5 + Math.sin(angle * 0.5) * 14;
      const midY = (v.topY + tipY) * 0.5;

      ctx.lineCap = 'round';
      ctx.strokeStyle = '#0f4a27';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(v.x, v.topY);
      ctx.quadraticCurveTo(midX, midY, tipX, tipY);
      ctx.stroke();
      ctx.strokeStyle = '#2f9a4a';
      ctx.lineWidth = 7;
      ctx.stroke();

      // Inner lighter fibrous core
      ctx.strokeStyle = '#86efac';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Tropical Leaves sprouting along the vine
      const numLeaves = 6;
      for (let i = 1; i <= numLeaves; i++) {
        const t = i / (numLeaves + 1);
        const lx = v.x + (tipX - v.x) * t;
        const ly = v.topY + (tipY - v.topY) * t;
        const leafSide = i % 2 === 0 ? 1 : -1;

        ctx.fillStyle = i % 3 === 0 ? '#4ade80' : '#22c55e';
        ctx.strokeStyle = '#0f4a27';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(lx + leafSide * 10, ly, 10, 5, angle + leafSide * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      // little blossom at the tip
      ctx.fillStyle = pal.flowerColor;
      for (let pt = 0; pt < 5; pt++) {
        const pa = (pt / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(tipX + Math.cos(pa) * 4.2, tipY + Math.sin(pa) * 4.2, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(tipX, tipY, 2.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // --- 2. Render Platforms (Gnarled Ancient Branches, Mossy Logs, Bouncy Mushrooms) ---
    const orderedPlatforms = [...platforms].sort((a, b) => (a.type === 'bouncy' ? 0 : 1) - (b.type === 'bouncy' ? 0 : 1));
    orderedPlatforms.forEach((p) => {
      if (p.x + p.width < camera.x - 50 || p.x > camera.x + camera.viewportWidth + 50) return;
      if (p.broken) return;

      ctx.save();

      if (p.type === 'fragile') {
        // Fragile rotting branch with tremor shake
        const shake = p.fragileTimer && p.fragileTimer > 0 ? (Math.random() - 0.5) * 5 : 0;
        ctx.translate(shake, shake);

        // Weathered rotten hollow wood
        ctx.fillStyle = '#d9a25a';
        ctx.strokeStyle = 'rgba(58, 32, 16, 0.85)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.width, p.height, 5);
        ctx.fill();
        ctx.stroke();

        // Cracks and peeling bark
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x + p.width * 0.28, p.y + 2);
        ctx.lineTo(p.x + p.width * 0.35, p.y + p.height - 4);
        ctx.moveTo(p.x + p.width * 0.72, p.y + 3);
        ctx.lineTo(p.x + p.width * 0.65, p.y + p.height - 2);
        ctx.stroke();
      } else if (p.type === 'bouncy') {
        // Giant mushroom with a real stalk growing up from below (drawn first, so ground covers its base)
        {
          const sx = p.x + p.width * 0.5;
          const topY = p.y + p.height * 0.5;
          const botY = camera.y + camera.viewportHeight + 60;
          const sw = p.width * 0.3;
          const sg = ctx.createLinearGradient(sx - sw, 0, sx + sw, 0);
          sg.addColorStop(0, '#f6e3b8');
          sg.addColorStop(0.55, '#fff3d6');
          sg.addColorStop(1, '#dcc08e');
          ctx.fillStyle = sg;
          ctx.strokeStyle = 'rgba(58, 32, 16, 0.85)';
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(sx - sw * 0.8, topY);
          ctx.quadraticCurveTo(sx - sw * 0.7, (topY + botY) * 0.5, sx - sw * 1.7, botY);
          ctx.lineTo(sx + sw * 1.7, botY);
          ctx.quadraticCurveTo(sx + sw * 0.7, (topY + botY) * 0.5, sx + sw * 0.8, topY);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.strokeStyle = 'rgba(160, 120, 70, 0.35)';
          ctx.lineWidth = 1.6;
          for (let gy = topY + 18; gy < botY; gy += 34) {
            ctx.beginPath();
            ctx.moveTo(sx - sw * 0.6, gy);
            ctx.quadraticCurveTo(sx, gy + 6, sx + sw * 0.6, gy);
            ctx.stroke();
          }
          // skirt ring under the cap
          ctx.fillStyle = '#f0d9a6';
          ctx.strokeStyle = 'rgba(58, 32, 16, 0.85)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(sx, topY + 8, sw * 1.25, 6, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        const bounceScale = Math.sin(time * 3) * 0.06 + 1;
        ctx.save();
        ctx.translate(p.x + p.width * 0.5, p.y + p.height * 0.5);
        ctx.scale(1, bounceScale);

        // Fungal Stalk
        ctx.fillStyle = '#fef3c7';
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-p.width * 0.25, 0, p.width * 0.5, p.height * 0.55, 4);
        ctx.fill();
        ctx.stroke();

        // Vibrant Red Mushroom Cap with 3D gradient
        const capGrad = ctx.createRadialGradient(-p.width * 0.1, -p.height * 0.4, 2, 0, 0, p.width * 0.52);
        capGrad.addColorStop(0, '#f87171');
        capGrad.addColorStop(0.65, '#dc2626');
        capGrad.addColorStop(1, '#991b1b');
        ctx.fillStyle = capGrad;
        ctx.beginPath();
        ctx.arc(0, 0, p.width * 0.5, Math.PI, 0, false);
        ctx.closePath();
        ctx.fill();

        // White spore polka dots
        ctx.fillStyle = '#ffffff';
        [-p.width * 0.25, 0, p.width * 0.25].forEach((dotX, idx) => {
          ctx.beginPath();
          ctx.arc(dotX, -p.height * (idx === 1 ? 0.35 : 0.18), p.width * 0.08, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      } else {
        // Gnarled Ancient Rainforest Branch / Moss-Covered Giant Bough
        const isGroundFloor = p.height >= 50;

        // Warm storybook earth with a soft outline
        const edge = mix(pal.trunkColor, '#c58a54', 0.4);
        const deep = mix(pal.trunkColor, '#3e2616', 0.45);
        const branchGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
        branchGrad.addColorStop(0, edge);
        branchGrad.addColorStop(0.5, mix(pal.trunkColor, '#8a5a36', 0.3));
        branchGrad.addColorStop(1, deep);
        ctx.fillStyle = branchGrad;
        ctx.strokeStyle = 'rgba(58, 32, 16, 0.85)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.width, p.height, isGroundFloor ? 10 : Math.min(p.height / 2, 14));
        ctx.fill();
        ctx.stroke();

        // Wood grain / pebbles so it never reads as a flat slab
        ctx.strokeStyle = 'rgba(58, 32, 16, 0.28)';
        ctx.lineWidth = 2;
        for (let gx = p.x + 24; gx < p.x + p.width - 20; gx += isGroundFloor ? 70 : 48) {
          const gy = p.y + 12 + ((gx * 7) % Math.max(8, p.height - 22));
          ctx.beginPath();
          ctx.moveTo(gx, gy);
          ctx.quadraticCurveTo(gx + 14, gy - 4, gx + 28, gy);
          ctx.stroke();
        }

        if (!isGroundFloor) {
          // Branches read as real logs: bark stripes + cut end rings
          ctx.strokeStyle = 'rgba(58, 32, 16, 0.32)';
          ctx.lineWidth = 1.8;
          [0.38, 0.68].forEach((fy) => {
            ctx.beginPath();
            ctx.moveTo(p.x + 14, p.y + p.height * fy);
            for (let bx = p.x + 14; bx < p.x + p.width - 14; bx += 22) {
              ctx.quadraticCurveTo(bx + 11, p.y + p.height * fy + (bx % 2 ? 2.5 : -2.5), bx + 22, p.y + p.height * fy);
            }
            ctx.stroke();
          });
          [p.x + 2, p.x + p.width - 2].forEach((ex, ei) => {
            ctx.fillStyle = mix(pal.trunkColor, '#f0c98f', 0.55);
            ctx.strokeStyle = 'rgba(58, 32, 16, 0.85)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(ex, p.y + p.height / 2, 5.5, p.height / 2 - 1.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.strokeStyle = 'rgba(120, 72, 36, 0.7)';
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.ellipse(ex, p.y + p.height / 2, 2.8, Math.max(2, p.height / 2 - 5), 0, 0, Math.PI * 2);
            ctx.stroke();
            if (ei === 1) {
              ctx.beginPath();
              ctx.arc(ex, p.y + p.height / 2, 0.9, 0, Math.PI * 2);
              ctx.stroke();
            }
          });
        } else {
          // Ground cliffs: rock strata and embedded stones
          ctx.strokeStyle = 'rgba(58, 32, 16, 0.26)';
          ctx.lineWidth = 2.2;
          [0.48, 0.76].forEach((fy) => {
            ctx.beginPath();
            ctx.moveTo(p.x + 8, p.y + p.height * fy);
            for (let bx = p.x + 8; bx < p.x + p.width - 8; bx += 40) {
              ctx.quadraticCurveTo(bx + 20, p.y + p.height * fy + (bx % 3 ? 3 : -3), bx + 40, p.y + p.height * fy);
            }
            ctx.stroke();
          });
          for (let rx = p.x + 40; rx < p.x + p.width - 30; rx += 83) {
            const h = ((Math.floor(rx) * 17) % 61) / 61;
            ctx.fillStyle = 'rgba(214, 196, 168, 0.7)';
            ctx.strokeStyle = 'rgba(58, 32, 16, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.ellipse(rx, p.y + 20 + h * Math.max(4, p.height - 40), 8 + h * 5, 5 + h * 3, h, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
        }

        // soil speckles: pebbles and sun-bleached grit
        for (let dx = p.x + 10; dx < p.x + p.width - 10; dx += 17) {
          const h = ((Math.abs(Math.floor(dx)) * 31) % 97) / 97;
          const dy = p.y + 9 + h * Math.max(2, p.height - 16);
          ctx.fillStyle = h > 0.5 ? 'rgba(255, 225, 170, 0.3)' : 'rgba(58, 32, 16, 0.32)';
          ctx.beginPath();
          ctx.arc(dx, dy, 1.3 + h * 1.6, 0, Math.PI * 2);
          ctx.fill();
        }

        // Scalloped moss cap
        const mossCol = mix(pal.foliageColor, '#4fb04a', 0.35);
        ctx.fillStyle = mossCol;
        ctx.strokeStyle = 'rgba(20, 70, 36, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x - 3, p.y + 6);
        ctx.lineTo(p.x - 3, p.y - 2);
        for (let mx = p.x; mx < p.x + p.width + 6; mx += 14) {
          ctx.quadraticCurveTo(mx + 7, p.y - 11, Math.min(mx + 14, p.x + p.width + 3), p.y - 1);
        }
        ctx.lineTo(p.x + p.width + 3, p.y + 6);
        for (let mx = p.x + p.width + 3; mx > p.x - 3; mx -= 18) {
          ctx.quadraticCurveTo(mx - 9, p.y + 14, Math.max(mx - 18, p.x - 3), p.y + 6);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // sunlit highlight along the moss
        ctx.strokeStyle = pal.foliageHighlight;
        ctx.globalAlpha = 0.7;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x + 8, p.y - 3);
        ctx.lineTo(p.x + p.width - 8, p.y - 3);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // tiny toadstools for charm
        for (let mxp = p.x + 60; mxp < p.x + p.width - 40; mxp += isGroundFloor ? 190 : 260) {
          const h = (Math.floor(mxp) * 13) % 5;
          const mxx = mxp + h * 6;
          ctx.fillStyle = '#fff3d6';
          ctx.strokeStyle = 'rgba(58, 32, 16, 0.8)';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.roundRect(mxx - 2, p.y - 9, 4, 8, 1.5);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = h % 2 ? '#e8452c' : '#f29a2e';
          ctx.beginPath();
          ctx.arc(mxx, p.y - 9, 6, Math.PI, 0, false);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(mxx - 2, p.y - 12, 1.1, 0, Math.PI * 2);
          ctx.arc(mxx + 2.4, p.y - 11, 0.9, 0, Math.PI * 2);
          ctx.fill();
        }

        // Leaf tufts along the top edge
        ctx.fillStyle = pal.foliageHighlight;
        for (let gx = p.x + 14; gx < p.x + p.width - 10; gx += 30) {
          ctx.beginPath();
          ctx.moveTo(gx, p.y - 6);
          ctx.quadraticCurveTo(gx + 2, p.y - 16, gx + 9, p.y - 18);
          ctx.quadraticCurveTo(gx + 7, p.y - 10, gx + 8, p.y - 6);
          ctx.closePath();
          ctx.fill();
        }

        // Little roots dangling beneath so platforms feel like grown-in branches
        ctx.fillStyle = deep;
        ctx.strokeStyle = 'rgba(58, 32, 16, 0.85)';
        ctx.lineWidth = 1.6;
        for (let rx = p.x + 28; rx < p.x + p.width - 20; rx += isGroundFloor ? 90 : 64) {
          const rl = 8 + ((rx * 13) % 9);
          ctx.beginPath();
          ctx.moveTo(rx - 5, p.y + p.height - 2);
          ctx.quadraticCurveTo(rx - 1, p.y + p.height + rl * 0.6, rx + 2, p.y + p.height + rl);
          ctx.quadraticCurveTo(rx + 3, p.y + p.height + rl * 0.5, rx + 5, p.y + p.height - 2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        // Hanging lianas / tropical vine festoons draped underneath
        if (!isGroundFloor) {
          ctx.strokeStyle = '#15803d';
          ctx.lineWidth = 2.5;
          const numVines = Math.floor(p.width / 45);
          for (let v = 0; v < numVines; v++) {
            const vx1 = p.x + 12 + v * 44;
            const vx2 = vx1 + 36;
            const drop = 14 + (v % 2 === 0 ? 12 : 5);
            ctx.beginPath();
            ctx.moveTo(vx1, p.y + p.height - 2);
            ctx.quadraticCurveTo((vx1 + vx2) * 0.5, p.y + p.height + drop, vx2, p.y + p.height - 2);
            ctx.stroke();

            // Hanging Monstera leaflet
            const hx = (vx1 + vx2) * 0.5;
            const hyy = p.y + p.height + drop;
            ctx.fillStyle = '#22c55e';
            [-0.9, 0, 0.9].forEach((la) => {
              ctx.beginPath();
              ctx.ellipse(hx + la * 5, hyy + 4 - Math.abs(la) * 2, 4.5, 8, la * 0.5, 0, Math.PI * 2);
              ctx.fill();
            });
            if (v % 3 === 1) {
              ctx.fillStyle = pal.flowerColor;
              ctx.beginPath();
              ctx.arc(hx, hyy + 10, 3.6, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // Blooming Tropical Jungle Wildflowers (Hibiscus & Orchids)
        const flowerStep = isGroundFloor ? 120 : 160;
        for (let fx = p.x + 35; fx < p.x + p.width - 25; fx += flowerStep) {
          ctx.fillStyle = pal.flowerColor;
          for (let pt = 0; pt < 5; pt++) {
            const pa = (pt / 5) * Math.PI * 2 - Math.PI / 2;
            ctx.beginPath();
            ctx.arc(fx + Math.cos(pa) * 4.6, p.y - 9 + Math.sin(pa) * 4.6, 3.6, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(fx, p.y - 9, 2.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    });
  }

  /**
   * Foreground framing canopy leaves (Parallax 1.25)
   */
  public renderForeground(
    ctx: CanvasRenderingContext2D,
    world: WorldInfo,
    camera: Camera,
    _time: number
  ) {
    const { viewportWidth: vw, viewportHeight: vh } = camera;
    const t = _time;
    ctx.save();
    const leaf = (x: number, y: number, len: number, ang: number, w: number, col: string) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang);
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(len * 0.5, -w, len, 0);
      ctx.quadraticCurveTo(len * 0.5, w, 0, 0);
      ctx.fill();
      ctx.restore();
    };
    // Big dark silhouette leaves framing the screen (against the glowing backdrop)
    [[0, 0, 1], [vw, 0, -1]].forEach(([cx, cy, dir]) => {
      for (let k = 0; k < 7; k++) {
        const sway = Math.sin(t * 0.8 + k + cx) * 0.035;
        const a = dir > 0 ? 0.18 + k * 0.2 + sway : Math.PI - (0.18 + k * 0.2) + sway;
        leaf(cx, cy, 190 + k * 34, a, 34 + k * 3, k % 2 ? '#0b2f2a' : '#0f3d33');
        // light vein
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(a);
        ctx.strokeStyle = 'rgba(160, 230, 120, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(190 + k * 34, 0);
        ctx.stroke();
        ctx.restore();
      }
    });
    // Bottom corner ferns
    [[0, vh, 1], [vw, vh, -1]].forEach(([cx, cy, dir]) => {
      for (let k = 0; k < 4; k++) {
        const sway = Math.sin(t * 0.9 + k * 1.3 + cx) * 0.05;
        leaf(cx, cy, 110 + k * 24, dir > 0 ? -0.3 - k * 0.3 + sway : Math.PI + 0.3 + k * 0.3 + sway, 20 + k * 3, k % 2 ? '#14442f' : '#1d6a40');
      }
    });
    ctx.restore();
  }
}

export const backgroundEngine = new BackgroundEngine();
