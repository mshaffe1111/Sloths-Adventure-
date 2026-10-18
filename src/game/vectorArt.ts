import type { PlayerState, Enemy, BossEntity, Collectible } from './types.ts';
import { drawMilo } from './miloVariants.ts';

/**
 * Ultra-Upgraded Procedural Vector Character & Entity Renderer
 * Features rich multi-tone textures, martial arts hero bandana with trailing flutter ribbons,
 * glossy anime eyes, detailed anatomy, and expressive enemy personalities.
 */

// Helper to draw a rich glossy eye with dual specular catchlights & iris gradient
function drawGlossyEye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  pupilDx: number = 0,
  pupilDy: number = 0,
  isBlinking: boolean = false
) {
  if (isBlinking) {
    ctx.strokeStyle = '#2b1d0c';
    ctx.lineWidth = Math.max(2.2, radius * 0.4);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(x, y + radius * 0.2, radius * 0.9, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
    return;
  }

  // Sclera / eye background
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Dark Amber-Brown Iris
  const irisRadius = radius * 0.82;
  const irisX = x + pupilDx * radius * 0.25;
  const irisY = y + pupilDy * radius * 0.25;

  const grad = ctx.createRadialGradient(
    irisX, irisY, irisRadius * 0.15,
    irisX, irisY, irisRadius
  );
  grad.addColorStop(0, '#92400e');
  grad.addColorStop(0.35, '#78350f');
  grad.addColorStop(0.85, '#291404');
  grad.addColorStop(1, '#0c0a09');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(irisX, irisY, irisRadius, 0, Math.PI * 2);
  ctx.fill();

  // Pupil
  ctx.fillStyle = '#050302';
  ctx.beginPath();
  ctx.arc(irisX, irisY, irisRadius * 0.55, 0, Math.PI * 2);
  ctx.fill();

  // Primary Big Catchlight (glossy shine)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(irisX - irisRadius * 0.35, irisY - irisRadius * 0.35, irisRadius * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Secondary Small Catchlight
  ctx.beginPath();
  ctx.arc(irisX + irisRadius * 0.35, irisY + irisRadius * 0.3, irisRadius * 0.2, 0, Math.PI * 2);
  ctx.fill();
}

// ---------------------------------------------------------------
// Hero sloth design kit (storybook style: soft outline, big face)
// ---------------------------------------------------------------
const SLOTH = {
  base: '#c19460',
  light: '#e6c795',
  dark: '#9a6c3e',
  deep: '#6a4426',
  line: '#4a2e18',
  cream: '#f4e3c8',
  creamShade: '#e3c79b',
  claw: '#fff3dc',
  blush: 'rgba(255, 138, 128, 0.5)',
  patch: '#d9a35c',
  ribbon: '#e23a3f',
  ribbonDark: '#a9242b',
};

/** Filled ellipse with the soft dark-brown outline used by every body part. */
function furBlob(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  rot: number,
  fill: string | CanvasGradient,
  lineW: number = 1.8
) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = lineW;
  ctx.strokeStyle = SLOTH.line;
  ctx.stroke();
}

/** Round-ended arm/leg: outline pass first, fur pass on top. */
function furLimb(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  cx: number,
  cy: number,
  x2: number,
  y2: number,
  w: number,
  fill: string
) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(cx, cy, x2, y2);
  ctx.strokeStyle = SLOTH.line;
  ctx.lineWidth = w + 3.6;
  ctx.stroke();
  ctx.strokeStyle = fill;
  ctx.lineWidth = w;
  ctx.stroke();
}

/** Three curved ivory claws fanning out from (x, y) along direction `dir` (radians). */
function slothClaws(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: number,
  len: number,
  glow: boolean = false
) {
  ctx.lineCap = 'round';
  for (let i = -1; i <= 1; i++) {
    const a = dir + i * 0.4;
    const tipX = x + Math.cos(a) * len;
    const tipY = y + Math.sin(a) * len;
    const cxp = x + Math.cos(a + 0.28) * len * 0.62;
    const cyp = y + Math.sin(a + 0.28) * len * 0.62;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(cxp, cyp, tipX, tipY);
    ctx.strokeStyle = glow ? '#b45309' : SLOTH.line;
    ctx.lineWidth = 3.8;
    ctx.stroke();
    ctx.strokeStyle = glow ? '#fef08a' : SLOTH.claw;
    ctx.lineWidth = 2.2;
    ctx.stroke();
  }
}

/** Little fur points poking out along part of an ellipse outline (drawn before the shape so the outline overlaps their base). */
function furSpikes(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  fromDeg: number,
  toDeg: number,
  n: number,
  len: number,
  fill: string
) {
  ctx.fillStyle = fill;
  ctx.strokeStyle = SLOTH.line;
  ctx.lineWidth = 1.5;
  ctx.lineJoin = 'round';
  for (let i = 0; i < n; i++) {
    const a = ((fromDeg + ((toDeg - fromDeg) * i) / Math.max(1, n - 1)) * Math.PI) / 180;
    const px = cx + Math.cos(a) * rx;
    const py = cy + Math.sin(a) * ry;
    const nx = Math.cos(a);
    const ny = Math.sin(a);
    const tx = -ny;
    const ty = nx;
    const w = len * 0.95;
    // soft curved tuft whose tip flicks downward
    const tipX = px + nx * len + 0.0;
    const tipY = py + ny * len + len * 0.6;
    ctx.beginPath();
    ctx.moveTo(px - tx * w - nx * 2, py - ty * w - ny * 2);
    ctx.quadraticCurveTo(px + nx * len * 0.9 - tx * w * 0.3, py + ny * len * 0.9 - ty * w * 0.3, tipX, tipY);
    ctx.quadraticCurveTo(px + nx * len * 0.5 + tx * w * 0.9, py + ny * len * 0.5 + ty * w * 0.9, px + tx * w - nx * 2, py + ty * w - ny * 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

/** Big glossy chibi eye: dark iris, large catchlight, small lower catchlight. */
function drawChibiEye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  lookX: number,
  lookY: number,
  blink: boolean,
  hurt: boolean
) {
  if (hurt) {
    ctx.strokeStyle = SLOTH.line;
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x - rx * 0.6, y - ry * 0.7);
    ctx.lineTo(x + rx * 0.5, y);
    ctx.lineTo(x - rx * 0.6, y + ry * 0.7);
    ctx.stroke();
    return;
  }
  if (blink) {
    ctx.strokeStyle = '#2a170b';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(x, y - ry * 0.1, rx * 0.8, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    return;
  }
  const ex = x + lookX * rx * 0.18;
  const ey = y + lookY * ry * 0.18;
  const g = ctx.createRadialGradient(ex, ey, rx * 0.15, ex, ey, rx);
  g.addColorStop(0, '#4a2c14');
  g.addColorStop(0.6, '#24130a');
  g.addColorStop(1, '#0e0703');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(ex, ey, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(ex - rx * 0.32, ey - ry * 0.34, rx * 0.36, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ex + rx * 0.38, ey + ry * 0.4, rx * 0.17, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * The sloth's face. Origin = centre of the head (about 20px radius).
 * 'side' is a three-quarter view looking toward +x; 'front' looks at the camera.
 */
function drawSlothHead(
  ctx: CanvasRenderingContext2D,
  mode: 'side' | 'front',
  o: { blink: boolean; hurt: boolean; lookX: number; lookY: number; fierce: boolean; time: number }
) {
  const { blink, hurt, lookX, lookY, fierce } = o;

  // (sloth ears are hidden in the fur)

  // head fur (front view is a wide, round sloth head)
  const hrx = mode === 'front' ? 24 : 21.5;
  const hry = mode === 'front' ? 20.5 : 19.5;
  if (mode === 'front') {
    furSpikes(ctx, 0, 0, hrx, hry, 150, 195, 3, 4.5, SLOTH.base); // left cheek fluff
    furSpikes(ctx, 0, 0, hrx, hry, -15, 30, 3, 4.5, SLOTH.base); // right cheek fluff
  }
  const hg = ctx.createRadialGradient(-5, -8, 3, 0, 0, 25);
  hg.addColorStop(0, SLOTH.light);
  hg.addColorStop(0.7, SLOTH.base);
  hg.addColorStop(1, SLOTH.dark);
  furBlob(ctx, 0, 0, hrx, hry, 0, hg, 2);

  // fluffy tufts
  ctx.fillStyle = SLOTH.base;
  ctx.strokeStyle = SLOTH.line;
  ctx.lineWidth = 1.4;
  const tufts: Array<[number, number, number]> =
    mode === 'side'
      ? [[-14, -15, 4.6], [-6, -19, 5], [3, -20, 5], [12, -17, 4.4], [-20, -5, 4], [-19, 6, 4.4]]
      : [];
  tufts.forEach(([tx, ty, tr]) => {
    ctx.beginPath();
    ctx.arc(tx, ty, tr, 0, Math.PI * 2);
    ctx.fill();
  });
  // re-cover the inner half of the tufts so only the fluffy rim shows
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.ellipse(0, 0, hrx - 1.7, hry - 1.7, 0, 0, Math.PI * 2);
  ctx.fill();

  // lower-face shading + crown highlight
  ctx.fillStyle = 'rgba(80, 45, 20, 0.22)';
  ctx.beginPath();
  ctx.ellipse(0, 12, 17, 6, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 232, 170, 0.45)';
  ctx.beginPath();
  ctx.ellipse(-2, -14, 11, 3.6, -0.1, 0, Math.PI * 2);
  ctx.fill();

  if (mode === 'side') {
    // cream face mask pushed toward the facing side
    ctx.fillStyle = SLOTH.cream;
    ctx.beginPath();
    ctx.ellipse(6.5, 2.5, 15, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    // eye patches
    ctx.fillStyle = SLOTH.patch;
    ctx.beginPath();
    ctx.ellipse(3, -1, 7.6, 7.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(15.5, -1, 5.6, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // eyes (near eye bigger than far eye)
    drawChibiEye(ctx, 3, -1, 4.5, 5, lookX, lookY, blink, hurt);
    drawChibiEye(ctx, 15.6, -1, 3.6, 4.2, lookX, lookY, blink, hurt);
    if (fierce && !hurt) {
      ctx.strokeStyle = SLOTH.line;
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-3, -9.5);
      ctx.lineTo(8, -6.8);
      ctx.moveTo(20.5, -9);
      ctx.lineTo(11.5, -6.6);
      ctx.stroke();
    }
    // muzzle + nose
    ctx.fillStyle = '#1e1008';
    ctx.beginPath();
    ctx.ellipse(18.6, 5.4, 3.8, 3.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(17.6, 4.3, 1.1, 0, Math.PI * 2);
    ctx.fill();
    // smile
    ctx.strokeStyle = '#5a3a22';
    ctx.lineWidth = 1.9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (fierce) {
      ctx.ellipse(18.4, 11.2, 3.4, 2.4, 0, 0, Math.PI);
      ctx.fillStyle = '#7a2a2a';
      ctx.fill();
    } else {
      ctx.moveTo(13, 10.6);
      ctx.quadraticCurveTo(18.6, 15, 23.2, 10);
    }
    ctx.stroke();
    // blush
    ctx.fillStyle = SLOTH.blush;
    ctx.beginPath();
    ctx.ellipse(8, 9.6, 3.8, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.save();
    ctx.translate(lookX * 2.2, 0);
    // big cream mask
    const mg = ctx.createRadialGradient(0, 0, 3, 0, 3, 21);
    mg.addColorStop(0, '#fff6df');
    mg.addColorStop(1, SLOTH.cream);
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.ellipse(0, 2.5, 20.5, 15.8, 0, 0, Math.PI * 2);
    ctx.fill();
    // soft slanted eye patches
    ctx.fillStyle = SLOTH.patch;
    [-1, 1].forEach((d) => {
      ctx.beginPath();
      ctx.ellipse(d * 9.6, -0.5, 7.4, 8.4, d * 0.4, 0, Math.PI * 2);
      ctx.fill();
    });
    drawChibiEye(ctx, -9.6, -1.2, 3.7, 4.3, lookX, lookY, blink, hurt);
    drawChibiEye(ctx, 9.6, -1.2, 3.7, 4.3, lookX, lookY, blink, hurt);
    if (fierce && !hurt) {
      ctx.strokeStyle = SLOTH.line;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-14, -8.5);
      ctx.lineTo(-6, -6);
      ctx.moveTo(14, -8.5);
      ctx.lineTo(6, -6);
      ctx.stroke();
    }
    // nose
    ctx.fillStyle = '#1e1008';
    ctx.beginPath();
    ctx.ellipse(0, 6.4, 4.8, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(-1.6, 5.3, 1.1, 0, Math.PI * 2);
    ctx.fill();
    // smile
    ctx.strokeStyle = '#5a3a22';
    ctx.lineWidth = 1.9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (fierce) {
      ctx.ellipse(0, 11.5, 3.6, 2.4, 0, 0, Math.PI);
      ctx.fillStyle = '#7a2a2a';
      ctx.fill();
    } else {
      ctx.moveTo(-6.5, 10.6);
      ctx.quadraticCurveTo(0, 15.4, 6.5, 10.6);
    }
    ctx.stroke();
    ctx.fillStyle = SLOTH.blush;
    ctx.beginPath();
    ctx.ellipse(-14.5, 9, 3.2, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(14.5, 9, 3.2, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/** Slomatt. The design lives in miloVariants.ts (variant 4, the Explorer). */
export function drawHeroSloth(ctx: CanvasRenderingContext2D, p: PlayerState, time: number) {
  drawMilo(ctx, 4, p, time);
}

// ---------------------------------------------------------------
// Soft-shaded storybook creature kit (glossy eyes, no heavy outlines)
// ---------------------------------------------------------------
const hexRgb = (h: string): [number, number, number] => {
  if (h.startsWith('rgb')) {
    const m = h.match(/\d+/g) || ['0', '0', '0'];
    return [Number(m[0]), Number(m[1]), Number(m[2])];
  }
  const f = h.replace('#', '');
  const v = f.length === 3 ? f.split('').map((c) => c + c).join('') : f;
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
};
/** Mix two #hex colours (t=0 -> a, t=1 -> b). */
const mixc = (a: string, b: string, t: number): string => {
  const A = hexRgb(a);
  const B = hexRgb(b);
  return `rgb(${Math.round(A[0] + (B[0] - A[0]) * t)}, ${Math.round(A[1] + (B[1] - A[1]) * t)}, ${Math.round(A[2] + (B[2] - A[2]) * t)})`;
};

/** Soft volumetric blob: lit from the upper-left, rimmed with a thin darker edge. */
function softBlob(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  rot: number,
  base: string,
  rim: number = 0.42
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const g = ctx.createRadialGradient(-rx * 0.35, -ry * 0.4, Math.min(rx, ry) * 0.1, 0, 0, Math.max(rx, ry) * 1.05);
  g.addColorStop(0, mixc(base, '#ffffff', 0.4));
  g.addColorStop(0.45, base);
  g.addColorStop(1, mixc(base, '#2a1408', 0.38));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  if (rim > 0) {
    ctx.strokeStyle = mixc(base, '#2a1408', rim);
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

/** Big glassy eye: coloured iris ring, dark pupil, large catchlight, tiny bounce light. */
function glossEye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  iris: string,
  o: { sclera?: boolean; ring?: string; lookX?: number; lookY?: number; lash?: boolean } = {}
) {
  const lx = (o.lookX ?? 0.4) * r * 0.2;
  const ly = (o.lookY ?? 0) * r * 0.2;
  if (o.sclera) {
    ctx.fillStyle = '#fbfbf4';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(60, 40, 20, 0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  const ir = o.sclera ? r * 0.72 : r;
  const g = ctx.createRadialGradient(x + lx, y + ly, ir * 0.15, x + lx, y + ly, ir);
  g.addColorStop(0, mixc(iris, '#000000', 0.55));
  g.addColorStop(0.6, iris);
  g.addColorStop(1, o.ring ?? mixc(iris, '#ffffff', 0.35));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x + lx, y + ly, ir, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#120a06';
  ctx.beginPath();
  ctx.arc(x + lx, y + ly, ir * 0.58, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x + lx - ir * 0.3, y + ly - ir * 0.32, ir * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + lx + ir * 0.32, y + ly + ir * 0.34, ir * 0.14, 0, Math.PI * 2);
  ctx.fill();
  if (o.lash) {
    ctx.strokeStyle = '#1a0e08';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(x, y, r + 0.6, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  }
}

/**
 * Emerald Tree Snake - glossy toy-like green snake: huge round head, big eyes,
 * pale belly, long pink tongue. Rears up from a coil to strike.
 */
export function drawTreeSnake(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  time: number
) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.scale(enemy.facing, 1);
  if (enemy.hitFlashTimer > 0) ctx.filter = 'brightness(2.2)';

  const isCoiled = enemy.isAttacking;
  const ph = time * 5 + enemy.id;
  const C = { dark: '#2f9a2c', base: '#52c53f', light: '#9be873', belly: '#e4f7a6' };

  ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 11, 26, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  const pts: Array<[number, number]> = [];
  let hx: number;
  let hy: number;
  if (isCoiled) {
    const N = 30;
    for (let i = 0; i <= N; i++) {
      const a = Math.PI * 0.8 + (i / N) * Math.PI * 3.2;
      const k = i / N;
      pts.push([-3 + Math.cos(a) * (19 - k * 7), 4 + Math.sin(a) * (8.5 - k * 2.5)]);
    }
    const [lx, ly] = pts[pts.length - 1];
    for (let j = 1; j <= 10; j++) {
      const t = j / 10;
      pts.push([lx + Math.sin(t * Math.PI) * -5 + 7 * t + Math.sin(ph + t * 3) * 1.5, ly - t * 28]);
    }
    [hx, hy] = pts[pts.length - 1];
  } else {
    const N = 24;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      pts.push([-26 + 50 * t, -2 + Math.sin(t * Math.PI * 2.2 + ph) * 4.5 * (0.35 + t * 0.65) - t * 4]);
    }
    [hx, hy] = pts[pts.length - 1];
  }
  const wAt = (i: number) => 17 * (0.38 + 0.62 * Math.min(1, (i / pts.length) * 1.7));
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const pass = (scale: number, color: string, shift: number, alpha: number = 1) => {
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    for (let i = 1; i < pts.length; i++) {
      ctx.lineWidth = wAt(i) * scale;
      ctx.beginPath();
      ctx.moveTo(pts[i - 1][0], pts[i - 1][1] + shift);
      ctx.lineTo(pts[i][0], pts[i][1] + shift);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };
  pass(1.06, C.dark, 0.6);
  pass(0.9, C.base, -0.4);
  pass(0.42, C.belly, 3.2, 0.95);
  pass(0.26, C.light, -4.2, 0.85);
  // soft scale blotches
  ctx.fillStyle = 'rgba(30, 120, 40, 0.28)';
  for (let i = 3; i < pts.length - 3; i += 3) {
    ctx.beginPath();
    ctx.ellipse(pts[i][0], pts[i][1] - 2, wAt(i) * 0.22, wAt(i) * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // head: big and round
  const hg = ctx.createRadialGradient(hx - 3, hy - 7, 2, hx + 2, hy, 19);
  hg.addColorStop(0, C.light);
  hg.addColorStop(0.5, C.base);
  hg.addColorStop(1, C.dark);
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.ellipse(hx + 4, hy, 15.5, 13, 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.belly;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.ellipse(hx + 11, hy + 5.5, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  glossEye(ctx, hx - 0.5, hy - 4.5, 5.6, '#1a1008', { sclera: true, lookX: 0.8 });
  glossEye(ctx, hx + 10.5, hy - 5, 6.1, '#1a1008', { sclera: true, lookX: 0.9 });
  ctx.fillStyle = '#237a22';
  ctx.beginPath();
  ctx.arc(hx + 17, hy + 0.5, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 140, 140, 0.45)';
  ctx.beginPath();
  ctx.ellipse(hx - 3.5, hy + 4.5, 3.2, 2.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1f6a22';
  ctx.lineWidth = 1.7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (isCoiled) {
    ctx.fillStyle = '#e4506a';
    ctx.ellipse(hx + 13, hy + 6, 6, 3.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(hx + 9.5, hy + 3.6);
    ctx.lineTo(hx + 11, hy + 7);
    ctx.lineTo(hx + 12.5, hy + 3.6);
    ctx.fill();
  } else {
    ctx.moveTo(hx + 6, hy + 5.5);
    ctx.quadraticCurveTo(hx + 12.5, hy + 9.5, hx + 18, hy + 5);
    ctx.stroke();
  }
  // long flicking tongue
  const tl = 9 + Math.max(0, Math.sin(time * 7 + enemy.id)) * 9;
  ctx.strokeStyle = '#ff5c86';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(hx + 18, hy + 5.5);
  ctx.quadraticCurveTo(hx + 18 + tl * 0.6, hy + 9, hx + 18 + tl, hy + 7.5);
  ctx.stroke();
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(hx + 18 + tl, hy + 7.5);
  ctx.lineTo(hx + 21 + tl, hy + 5);
  ctx.moveTo(hx + 18 + tl, hy + 7.5);
  ctx.lineTo(hx + 21 + tl, hy + 10);
  ctx.stroke();

  if (enemy.telegraphTimer > 0) {
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(hx + 4, hy, 26, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Harpy Eagle - fluffy baby-eagle look: scalloped brown feathers, cream bib,
 * spiky cream crest, huge blue-ringed eyes, blue-grey wings, orange feet.
 */
export function drawHarpyEagle(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  time: number
) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.scale(enemy.facing, 1);
  if (enemy.hitFlashTimer > 0) ctx.filter = 'brightness(2.4)';

  const wingFlap = Math.sin(time * 10 + enemy.id);
  const isSwooping = enemy.swoopPhase === 'swoop' || enemy.isAttacking;
  const isHovering = enemy.swoopPhase === 'hover';
  const isTelegraphing = enemy.swoopPhase === 'telegraph' || enemy.telegraphTimer > 0;
  if (isSwooping) ctx.rotate(0.38);
  else if (isHovering) ctx.rotate(Math.sin(time * 6) * 0.1);

  const BR = '#8d5b2b';
  const TAN = '#d4a05a';
  const CREAM = '#f7e8c4';
  const BLUE = '#6f89ac';

  if (isHovering) {
    ctx.save();
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -6, 40, 0, Math.PI * 2);
    ctx.stroke();
    for (let s = 0; s < 3; s++) {
      const a = time * 5 + (s * Math.PI * 2) / 3;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('✨', 16 + Math.cos(a) * 22, -16 + Math.sin(a) * 12);
    }
    ctx.restore();
  }

  const flapY = isHovering ? Math.sin(time * 14) * 8 : isSwooping ? 6 : wingFlap * 14;
  const wing = (sx: number, sy: number, base: number, scale: number, tone: number) => {
    // long blue-grey primaries fanning out behind the shoulder
    for (let k = 0; k < 5; k++) {
      const a = base - k * 0.2 + wingFlap * 0.1;
      const len = (22 - k * 1.5) * scale;
      softBlob(ctx, sx + Math.cos(a) * len * 0.8, sy + Math.sin(a) * len * 0.8 + flapY * 0.3, len, 6.4 * scale, a, mixc(BLUE, '#2e4466', tone + k * 0.07));
    }
    // tan covert feathers on the shoulder
    for (let k = 0; k < 3; k++) {
      softBlob(ctx, sx - 1 + k * 4, sy + 1 - k * 2.5 + flapY * 0.25, 8, 5.4, base + 0.3, mixc(TAN, '#8d5b2b', 0.1 + k * 0.1));
    }
  };

  wing(-4, -8 + flapY * 0.2, -2.6, 1, 0.25);
  // tail feathers
  softBlob(ctx, -22, 14, 14, 5.6, 0.55, '#6b4423');
  softBlob(ctx, -26, 20, 12, 4.8, 0.8, '#7a5128');

  // body with scalloped feather rows
  softBlob(ctx, 2, 3, 19, 22, 0.12, BR);
  const scallop = (x: number, y: number, r: number, c: string) => {
    const g = ctx.createLinearGradient(0, y - r, 0, y + r);
    g.addColorStop(0, mixc(c, '#ffffff', 0.22));
    g.addColorStop(1, mixc(c, '#2a1408', 0.3));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI);
    ctx.quadraticCurveTo(x, y - r * 1.1, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = mixc(c, '#2a1408', 0.5);
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0.1, Math.PI - 0.1);
    ctx.stroke();
    ctx.globalAlpha = 1;
  };
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      scallop(-7 + col * 9 + (row % 2) * 4.5, 4 + row * 5.5, 5.4, mixc(TAN, BR, 0.3 + row * 0.12));
    }
  }
  // cream bib
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3 - (row === 2 ? 1 : 0); col++) {
      scallop(4 + col * 8 + (row % 2) * 4 - 2, -3 + row * 6, 5.6, mixc(CREAM, '#cdb48a', 0.1 + row * 0.1));
    }
  }
  // feet
  [-4, 9].forEach((tx) => {
    const ty = isSwooping ? 24 : 21;
    softBlob(ctx, tx, ty, 5, 4, 0, '#f39a2a');
    for (let t = -1; t <= 1; t++) softBlob(ctx, tx + t * 4.4 + 1, ty + 5.5, 2.3, 4, t * 0.3, '#f7b448', 0.2);
  });

  // front wing, slightly raised
  wing(4, -5 + flapY * 0.15, -1.8, 0.9, 0.05);

  // spiky cream crest
  const blade = (bx: number, by: number, tx: number, ty: number, w: number, c: string) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(bx - w, by);
    ctx.quadraticCurveTo((bx + tx) / 2 - w * 0.6, (by + ty) / 2, tx, ty);
    ctx.quadraticCurveTo((bx + tx) / 2 + w * 0.8, (by + ty) / 2 + 2, bx + w, by);
    ctx.closePath();
    ctx.fill();
  };
  blade(6, -24, -10, -46, 4, '#f1d28f');
  blade(10, -27, 0, -50, 4.5, CREAM);
  blade(15, -28, 12, -52, 4.5, '#f1d28f');
  blade(20, -26, 24, -48, 4, CREAM);
  blade(2, -20, -14, -38, 3.5, TAN);

  // head
  softBlob(ctx, 15, -15, 17, 15.5, 0, '#c99556');
  softBlob(ctx, 13, -7, 12, 7.5, 0, CREAM, 0.15);
  glossEye(ctx, 20.5, -16, 8.2, '#3a2412', { ring: '#8ec9ee', lookX: 0.9, lash: true });
  if (isSwooping || isTelegraphing) {
    ctx.strokeStyle = '#3a2412';
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(11, -27);
    ctx.lineTo(27, -21);
    ctx.stroke();
  }
  // beak
  const bg = ctx.createLinearGradient(26, -18, 36, -2);
  bg.addColorStop(0, '#ffd84a');
  bg.addColorStop(1, '#e8a61a');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.moveTo(28, -17);
  ctx.quadraticCurveTo(43, -14, 38, -2);
  ctx.quadraticCurveTo(33, -7, 27, -8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(120, 70, 10, 0.5)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = '#7a4a12';
  ctx.beginPath();
  ctx.arc(31, -13, 1.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.beginPath();
  ctx.ellipse(34, -13, 3.5, 1.3, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 140, 140, 0.45)';
  ctx.beginPath();
  ctx.ellipse(10, -6, 3.4, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();

  if (isTelegraphing) {
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.95)';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(16, -56, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', 16, -56);
  }
  ctx.restore();
}

/**
 * Ocelot - fluffy kitten look: huge brown eyes, striped forehead and cheeks,
 * pink-lined ears, white muzzle and paws, ringed tail with a black tip.
 */
export function drawOcelot(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  time: number
) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.scale(enemy.facing, 1);
  if (enemy.hitFlashTimer > 0) ctx.filter = 'brightness(2.2)';

  const run = Math.sin(time * 12 + enemy.id);
  const tail = Math.sin(time * 5 + enemy.id) * 0.3;
  const bounce = Math.abs(run) * -1.6;
  const GOLD = '#dba444';
  const CREAM = '#fff3d4';
  const DARK = '#2b1a10';

  ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 13, 28, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // tail: golden with dark rings and black tip
  const T = { x0: -20, y0: -6, cx: -42, cy: -6 + tail * 8, x1: -38, y1: -32 + tail * 14 };
  const tp = (t: number): [number, number] => {
    const u = 1 - t;
    return [u * u * T.x0 + 2 * u * t * T.cx + t * t * T.x1, u * u * T.y0 + 2 * u * t * T.cy + t * t * T.y1];
  };
  ctx.lineCap = 'round';
  for (let i = 0; i < 16; i++) {
    const [ax, ay] = tp(i / 16);
    const [bx, by] = tp((i + 1) / 16);
    ctx.strokeStyle = i >= 13 ? DARK : i % 4 === 2 ? '#5a3418' : GOLD;
    ctx.lineWidth = 9.5;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
  }

  // back legs + white paws
  softBlob(ctx, -15 + run * 5, 8 + Math.max(0, run) * -3, 7, 8.5, 0, '#c98f2f');
  softBlob(ctx, -15 + run * 5, 14.5 + Math.max(0, run) * -3, 7.6, 3.8, 0, '#ffffff', 0.25);

  ctx.save();
  ctx.translate(0, bounce);
  // body
  softBlob(ctx, 0, -6, 25, 17, 0.04, GOLD);
  softBlob(ctx, 3, -1, 16, 9.5, 0, CREAM, 0.12);
  // dark rosettes and stripes
  ctx.fillStyle = DARK;
  [[-14, -12], [-5, -15], [6, -13], [-10, -4], [-19, -4]].forEach(([sx, sy]) => {
    ctx.beginPath();
    ctx.ellipse(sx, sy, 4.4, 2.8, 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#b97a22';
    ctx.beginPath();
    ctx.ellipse(sx, sy, 1.8, 1.1, 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = DARK;
  });
  // front legs + paws
  softBlob(ctx, 13 - run * 5, 9 + Math.max(0, -run) * -3, 7, 9, 0, GOLD);
  softBlob(ctx, 13 - run * 5, 15.5 + Math.max(0, -run) * -3, 7.8, 3.9, 0, '#ffffff', 0.25);

  // ears: dark back, white fur tuft, pink inside
  [[10, -30], [30, -30]].forEach(([ex, ey], i) => {
    softBlob(ctx, ex, ey, 7.5, 8.6, i ? 0.25 : -0.25, DARK, 0.1);
    softBlob(ctx, ex + (i ? -0.5 : 0.5), ey + 1, 4.6, 5.8, i ? 0.25 : -0.25, '#f4a3b4', 0.1);
    softBlob(ctx, ex + (i ? -2 : 2), ey + 0.5, 2.4, 4.6, 0, '#ffffff', 0.1);
  });
  // head (big, round)
  softBlob(ctx, 20, -17, 19, 16, 0, GOLD);
  softBlob(ctx, 20, -10, 14.5, 8.4, 0, CREAM, 0.1);
  // forehead + cheek stripes
  ctx.strokeStyle = DARK;
  ctx.lineCap = 'round';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  [[15, -31, 16, -26], [20, -32, 20, -25], [25, -31, 24, -26]].forEach(([x1, y1, x2, y2]) => {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  });
  ctx.stroke();
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(3, -14);
  ctx.quadraticCurveTo(9, -11, 11, -7);
  ctx.moveTo(3, -9);
  ctx.quadraticCurveTo(8, -7, 10, -3);
  ctx.moveTo(38, -14);
  ctx.quadraticCurveTo(33, -11, 31, -7);
  ctx.stroke();
  // huge eyes
  glossEye(ctx, 13.5, -19, 7.4, '#6b3f1c', { ring: '#b07a3a', lookX: 0.6 });
  glossEye(ctx, 28.5, -19, 6.8, '#6b3f1c', { ring: '#b07a3a', lookX: 0.8 });
  // eyeliner
  ctx.strokeStyle = DARK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(13.5, -19, 8, Math.PI * 1.05, Math.PI * 1.85);
  ctx.arc(28.5, -19, 7.4, Math.PI * 1.15, Math.PI * 1.95);
  ctx.stroke();
  // nose + W mouth + whisker dots
  ctx.fillStyle = '#ff7a98';
  ctx.beginPath();
  ctx.ellipse(21.5, -11.4, 3.6, 2.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#6b3f1c';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(21.5, -9);
  ctx.lineTo(21.5, -7);
  ctx.moveTo(15, -6.5);
  ctx.quadraticCurveTo(18.5, -3, 21.5, -7);
  ctx.quadraticCurveTo(24.5, -3, 28, -6.5);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 150, 150, 0.5)';
  ctx.beginPath();
  ctx.ellipse(8, -8, 3, 2, 0, 0, Math.PI * 2);
  ctx.ellipse(34, -8, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

/**
 * Hazards: poison-dart frog (glossy cobalt with black spots) and a cute fuzzy canopy spider.
 */
export function drawHazardEntity(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  time: number
) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.scale(enemy.facing, 1);

  if (enemy.type === 'frog') {
    const hop = Math.sin(time * 8 + enemy.id);
    ctx.translate(0, hop * 3);
    const B = '#2a8cf0';
    ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 14 - hop * 3, 18, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // back legs
    softBlob(ctx, -12, 8, 9, 6, -0.3, mixc(B, '#0a3a8a', 0.25));
    softBlob(ctx, -17, 12.5, 6.5, 2.8, 0, '#5db6ff', 0.2);
    // body
    softBlob(ctx, 0, 0, 18, 14, 0, B);
    softBlob(ctx, 3, 5, 12, 7, 0, '#a8dcff', 0.1);
    ctx.fillStyle = '#10243e';
    [[-6, -5, 3.3], [3, -7, 2.8], [-10, 2, 2.6], [8, -1, 2.2]].forEach(([sx, sy, sr]) => {
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    });
    // throat sac pulse
    const pulse = (Math.sin(time * 6) + 1) * 1.2;
    softBlob(ctx, 14, 5, 5 + pulse, 4 + pulse, 0, '#c9e8ff', 0.1);
    // bulging eyes
    softBlob(ctx, 5, -11, 7.4, 7, 0, B);
    softBlob(ctx, 15, -10, 6.6, 6.4, 0, B);
    glossEye(ctx, 6, -11.5, 5.2, '#e9a31a', { ring: '#ffd04a', lookX: 0.9, sclera: false });
    glossEye(ctx, 15.5, -10.5, 4.8, '#e9a31a', { ring: '#ffd04a', lookX: 0.9 });
    ctx.strokeStyle = '#10243e';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(8, 1);
    ctx.quadraticCurveTo(16, 6, 22, 1);
    ctx.stroke();
    // front foot
    softBlob(ctx, 12, 12, 5.4, 3.2, 0, '#5db6ff', 0.2);
  } else if (enemy.type === 'spider') {
    const bob = Math.sin(time * 3 + enemy.id) * 1.5;
    if (!(enemy as unknown as { noThread?: boolean }).noThread) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, -70);
      ctx.lineTo(0, -12 + bob);
      ctx.stroke();
    }
    const O = '#f2812a';
    // eight curvy legs
    ctx.strokeStyle = '#6b3a1a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    [-1, 1].forEach((side) => {
      for (let leg = 0; leg < 4; leg++) {
        const wave = Math.sin(time * 6 + leg + (side > 0 ? 1.5 : 0)) * 2.5;
        const oy = -4 + leg * 3.2;
        ctx.beginPath();
        ctx.moveTo(side * 6, oy + bob);
        ctx.quadraticCurveTo(side * (17 + leg * 1.2), oy - 9 + wave + bob, side * (24 + leg * 1.5), oy + 8 + leg * 2 + wave + bob);
        ctx.stroke();
      }
    });
    // fuzzy abdomen with cute spots
    softBlob(ctx, 0, 4 + bob, 15, 13.5, 0, O);
    ctx.fillStyle = '#ffd7a8';
    [[-5, 0], [5, 0], [0, 6], [-8, 7], [8, 7]].forEach(([sx, sy]) => {
      ctx.beginPath();
      ctx.arc(sx, sy + bob, 2.4, 0, Math.PI * 2);
      ctx.fill();
    });
    // head
    softBlob(ctx, 0, -7 + bob, 11, 9, 0, '#8a4a22');
    glossEye(ctx, -4.4, -8 + bob, 4.6, '#1a1008', { sclera: true, lookX: 0 });
    glossEye(ctx, 4.4, -8 + bob, 4.6, '#1a1008', { sclera: true, lookX: 0 });
    ctx.strokeStyle = '#3a1a0a';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-3, -1 + bob);
    ctx.quadraticCurveTo(0, 2 + bob, 3, -1 + bob);
    ctx.stroke();
    ctx.fillStyle = '#ffd7a8';
    ctx.beginPath();
    ctx.moveTo(-2.6, -0.4 + bob);
    ctx.lineTo(-1.6, 3 + bob);
    ctx.lineTo(-0.6, -0.2 + bob);
    ctx.moveTo(2.6, -0.4 + bob);
    ctx.lineTo(1.6, 3 + bob);
    ctx.lineTo(0.6, -0.2 + bob);
    ctx.fill();
  }

  ctx.restore();
}

/** Little golden crown marking a boss / royal creature. */
function drawCrown(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const g = ctx.createLinearGradient(0, -12, 0, 4);
  g.addColorStop(0, '#fff2a0');
  g.addColorStop(1, '#e8a31a');
  ctx.fillStyle = g;
  ctx.strokeStyle = 'rgba(120, 70, 10, 0.6)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-10, 4);
  ctx.lineTo(-11, -9);
  ctx.lineTo(-5, -3);
  ctx.lineTo(0, -12);
  ctx.lineTo(5, -3);
  ctx.lineTo(11, -9);
  ctx.lineTo(10, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ef4466';
  ctx.beginPath();
  ctx.arc(0, -1, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4aa8ff';
  ctx.beginPath();
  ctx.arc(-6, 0, 1.5, 0, Math.PI * 2);
  ctx.arc(6, 0, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Stage bosses: each of the 10 worlds gets its own soft-shaded villain.
 * Several reuse the animal rigs (recoloured, crowned, scaled up); the croc, golem and gorilla are bespoke.
 */
export function drawBossEntity(
  ctx: CanvasRenderingContext2D,
  boss: BossEntity,
  time: number,
  worldId: number = 1
) {
  ctx.save();
  ctx.translate(boss.x, boss.y);
  ctx.scale(boss.facing * 1.5, 1.5);
  const hit = boss.hitFlashTimer > 0;
  const breath = Math.sin(time * 3) * 2;
  const angry = boss.telegraphTimer > 0 || boss.isAttacking;
  const fake: Enemy = { ...boss, x: 0, y: 0, facing: 1, isAttacking: angry };

  ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 17, 38, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  const tint = (f: string) => {
    ctx.save();
    ctx.filter = f;
  };
  const untint = () => ctx.restore();

  switch (worldId) {
    case 1: {
      // Venom Fang: emerald boa monarch
      ctx.save();
      ctx.translate(0, 2);
      ctx.scale(1.35, 1.35);
      drawTreeSnake(ctx, { ...fake, isAttacking: true }, time);
      drawCrown(ctx, 21, -43, 0.9);
      ctx.restore();
      break;
    }
    case 2: {
      // Crocus Rex: river crocodile king
      if (hit) ctx.filter = 'brightness(2.4)';
      ctx.save();
      ctx.scale(0.78, 0.78);
      ctx.translate(0, 8);
      const G = '#5e9d3c';
      const tail: Array<[number, number]> = [];
      for (let i = 0; i <= 14; i++) {
        const t = i / 14;
        tail.push([-26 - t * 40, 4 - Math.sin(t * Math.PI * 1.4 + time * 3) * 7 * t - t * 2]);
      }
      ctx.lineCap = 'round';
      for (let i = 1; i < tail.length; i++) {
        ctx.strokeStyle = mixc(G, '#2c5a1c', 0.2);
        ctx.lineWidth = 22 * (1 - i / 17);
        ctx.beginPath();
        ctx.moveTo(tail[i - 1][0], tail[i - 1][1]);
        ctx.lineTo(tail[i][0], tail[i][1]);
        ctx.stroke();
      }
      softBlob(ctx, 0, -2, 38, 19, 0, G);
      softBlob(ctx, 2, 6, 30, 9, 0, '#eee8a8', 0.1);
      // dorsal ridges
      ctx.fillStyle = '#3f7a28';
      for (let i = -4; i <= 4; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 8 - 4, -15);
        ctx.lineTo(i * 8, -23);
        ctx.lineTo(i * 8 + 4, -15);
        ctx.fill();
      }
      // legs
      softBlob(ctx, -20, 13, 10, 7, 0, mixc(G, '#2c5a1c', 0.2));
      softBlob(ctx, 20, 13, 10, 7, 0, G);
      ctx.fillStyle = '#fff6dc';
      [-24, -20, -16, 16, 20, 24].forEach((cx) => {
        ctx.beginPath();
        ctx.arc(cx, 19, 1.8, 0, Math.PI * 2);
        ctx.fill();
      });
      // big head with open jaws when attacking
      const jaw = angry ? 9 : 3;
      softBlob(ctx, 40, 6 + jaw * 0.6, 22, 7, 0.05, mixc(G, '#2c5a1c', 0.1));
      softBlob(ctx, 40, -5 - jaw * 0.3, 24, 11, -0.04, G);
      if (angry) {
        ctx.fillStyle = '#d94a5a';
        ctx.beginPath();
        ctx.ellipse(46, 1, 15, 4.5 + jaw * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#fffdf2';
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(34 + i * 5.4, -1 - jaw * 0.2);
        ctx.lineTo(36.6 + i * 5.4, 4 + jaw * 0.1);
        ctx.lineTo(39.2 + i * 5.4, -1 - jaw * 0.2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(35 + i * 5.4, 3 + jaw * 0.5);
        ctx.lineTo(37.6 + i * 5.4, -2 + jaw * 0.3);
        ctx.lineTo(40.2 + i * 5.4, 3 + jaw * 0.5);
        ctx.fill();
      }
      ctx.fillStyle = '#2c5a1c';
      ctx.beginPath();
      ctx.arc(60, -8, 1.8, 0, Math.PI * 2);
      ctx.fill();
      softBlob(ctx, 30, -17, 8, 7, 0, G);
      softBlob(ctx, 44, -16, 7, 6.4, 0, G);
      glossEye(ctx, 30.5, -17, 5.8, '#e8c020', { ring: '#fff09a', lookX: 0.9 });
      glossEye(ctx, 44.5, -16, 5.2, '#e8c020', { ring: '#fff09a', lookX: 0.9 });
      drawCrown(ctx, 34, -28, 1.0);
      ctx.restore();
      break;
    }
    case 3: {
      // Shadow Prowler: night jaguar
      tint('brightness(0.5) saturate(1.3) hue-rotate(250deg)');
      ctx.save();
      ctx.scale(1.35, 1.35);
      ctx.translate(-4, 2);
      drawOcelot(ctx, fake, time);
      ctx.restore();
      untint();
      // glowing eyes overlay
      ctx.fillStyle = 'rgba(255, 90, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(14, -36, 2.6, 0, Math.PI * 2);
      ctx.arc(34, -36, 2.4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 4: {
      // Sky Sovereign: harpy eagle matriarch
      ctx.save();
      ctx.scale(1.4, 1.4);
      ctx.translate(-2, 8);
      drawHarpyEagle(ctx, { ...fake, swoopPhase: angry ? 'swoop' : 'patrol' }, time);
      drawCrown(ctx, 10, -46, 0.9);
      ctx.restore();
      break;
    }
    case 5: {
      // Tarantula Queen
      ctx.save();
      ctx.scale(2.0, 2.0);
      ctx.translate(0, -2);
      drawHazardEntity(ctx, { ...fake, type: 'spider', noThread: true } as Enemy, time);
      drawCrown(ctx, 0, -22, 0.8);
      ctx.restore();
      break;
    }
    case 6: {
      // Bog Behemoth: swamp toad
      tint('hue-rotate(-95deg) saturate(0.85) brightness(0.85)');
      ctx.save();
      ctx.scale(2.3, 2.3);
      ctx.translate(-2, 0);
      drawHazardEntity(ctx, { ...fake, type: 'frog' }, time);
      ctx.restore();
      untint();
      drawCrown(ctx, 8, -38, 1.0);
      break;
    }
    case 7: {
      // Stone Idol Golem
      if (hit) ctx.filter = 'brightness(2.2)';
      const ST = '#8c929c';
      softBlob(ctx, -12, 12, 11, 9, 0, mixc(ST, '#444', 0.2));
      softBlob(ctx, 12, 12, 11, 9, 0, mixc(ST, '#444', 0.2));
      softBlob(ctx, 0, -12 + breath, 25, 26, 0, ST);
      softBlob(ctx, 0, -20 + breath, 14, 12, 0, mixc(ST, '#ffffff', 0.15), 0.2);
      // glowing rune
      const pulse = 0.6 + Math.sin(time * 4) * 0.3;
      ctx.fillStyle = `rgba(255, 150, 40, ${pulse})`;
      ctx.beginPath();
      ctx.arc(0, -16 + breath, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffd98a';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, -16 + breath, 7, 0, Math.PI * 2);
      ctx.moveTo(-4, -16 + breath);
      ctx.lineTo(4, -16 + breath);
      ctx.moveTo(0, -20 + breath);
      ctx.lineTo(0, -12 + breath);
      ctx.stroke();
      // cracks and moss
      ctx.strokeStyle = 'rgba(40, 40, 50, 0.55)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-14, -4);
      ctx.lineTo(-8, 2);
      ctx.lineTo(-11, 8);
      ctx.moveTo(14, -30);
      ctx.lineTo(9, -24);
      ctx.stroke();
      ctx.fillStyle = 'rgba(110, 190, 80, 0.85)';
      [[-16, -34, 7], [-6, -38, 5], [14, -35, 6]].forEach(([mx, my, mr]) => {
        ctx.beginPath();
        ctx.ellipse(mx, my + breath, mr, mr * 0.6, 0, Math.PI, 0);
        ctx.fill();
      });
      // head
      softBlob(ctx, 4, -46 + breath, 16, 14, 0, mixc(ST, '#ffffff', 0.08));
      ctx.fillStyle = '#5a5f68';
      ctx.beginPath();
      ctx.roundRect(-8, -54 + breath, 26, 6, 3);
      ctx.fill();
      ctx.fillStyle = angry ? '#ff5a2a' : '#ffb23a';
      ctx.shadowColor = '#ff8a2a';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.ellipse(0, -44 + breath, 3.6, 4.4, 0, 0, Math.PI * 2);
      ctx.ellipse(12, -44 + breath, 3.6, 4.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#3a3e46';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-1, -36 + breath);
      ctx.lineTo(13, -36 + breath);
      ctx.stroke();
      // gold headdress
      ctx.fillStyle = '#e8a31a';
      ctx.beginPath();
      ctx.moveTo(-6, -58 + breath);
      ctx.lineTo(4, -70 + breath);
      ctx.lineTo(14, -58 + breath);
      ctx.fill();
      // fists
      softBlob(ctx, -30, -6 + breath, 12, 14, 0.1, ST);
      softBlob(ctx, 30, -4 + breath + (angry ? -8 : 0), 14, 15, -0.1, ST);
      ctx.fillStyle = '#e8a31a';
      ctx.fillRect(22, -12 + breath + (angry ? -8 : 0), 16, 4);
      break;
    }
    case 8: {
      // Night-Wing Monarch
      tint('brightness(0.6) saturate(1.5) hue-rotate(235deg)');
      ctx.save();
      ctx.scale(1.4, 1.4);
      ctx.translate(-2, 8);
      drawHarpyEagle(ctx, { ...fake, swoopPhase: angry ? 'swoop' : 'patrol' }, time);
      ctx.restore();
      untint();
      ctx.fillStyle = 'rgba(190, 120, 255, 0.95)';
      ctx.shadowColor = '#c080ff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(30, -26, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      drawCrown(ctx, 12, -48, 0.9);
      break;
    }
    case 9: {
      // Magma Drake: fiery wyrm with horns and little wings
      tint('hue-rotate(-105deg) saturate(1.3) brightness(1.05)');
      ctx.save();
      ctx.translate(0, 2);
      ctx.scale(1.35, 1.35);
      drawTreeSnake(ctx, { ...fake, isAttacking: true }, time);
      ctx.restore();
      untint();
      // horns and wings
      ctx.fillStyle = '#ffe9b0';
      [[22, -48, 16, -60], [34, -48, 38, -60]].forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath();
        ctx.moveTo(x1 - 3, y1);
        ctx.quadraticCurveTo(x1, y1 - 6, x2, y2);
        ctx.quadraticCurveTo(x1 + 4, y1 - 4, x1 + 3, y1);
        ctx.fill();
      });
      const wf = Math.sin(time * 6) * 6;
      ctx.fillStyle = '#b8381a';
      ctx.beginPath();
      ctx.moveTo(6, -22);
      ctx.quadraticCurveTo(-18, -44 - wf, -26, -20);
      ctx.quadraticCurveTo(-10, -26, -2, -14);
      ctx.fill();
      if (angry) {
        const f = ctx.createRadialGradient(54, -28, 2, 54, -28, 22);
        f.addColorStop(0, 'rgba(255, 240, 150, 0.95)');
        f.addColorStop(1, 'rgba(255, 90, 20, 0)');
        ctx.fillStyle = f;
        ctx.beginPath();
        ctx.arc(54, -28, 22, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    default: {
      // Fortress General Iron-Claw: armoured gorilla
      if (hit) ctx.filter = 'brightness(2.2)';
      const FUR = '#566073';
      // cape
      ctx.fillStyle = '#b3262e';
      ctx.beginPath();
      ctx.moveTo(-16, -30);
      ctx.quadraticCurveTo(-42, 0, -34, 22);
      ctx.lineTo(10, 24);
      ctx.lineTo(14, -30);
      ctx.fill();
      softBlob(ctx, -11, 12, 11, 9, 0, mixc(FUR, '#000', 0.2));
      softBlob(ctx, 11, 12, 11, 9, 0, mixc(FUR, '#000', 0.2));
      softBlob(ctx, -22, -8 + breath, 11, 22, 0.25, FUR);
      softBlob(ctx, 0, -12 + breath, 26, 27, 0, FUR);
      softBlob(ctx, 2, -8 + breath, 17, 17, 0, '#9d9484', 0.15);
      // gold breastplate
      const gp = ctx.createLinearGradient(0, -26, 0, -2);
      gp.addColorStop(0, '#ffe58a');
      gp.addColorStop(1, '#d99a1a');
      ctx.fillStyle = gp;
      ctx.strokeStyle = 'rgba(120, 70, 10, 0.7)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.roundRect(-13, -26 + breath, 28, 22, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#b3262e';
      ctx.beginPath();
      ctx.arc(1, -15 + breath, 4, 0, Math.PI * 2);
      ctx.fill();
      // head with steel helmet
      softBlob(ctx, 5, -43 + breath, 17, 15, 0, FUR);
      softBlob(ctx, 8, -39 + breath, 12, 9.5, 0, '#cdb89c', 0.12);
      const hg = ctx.createLinearGradient(0, -62, 0, -46);
      hg.addColorStop(0, '#e6ecf3');
      hg.addColorStop(1, '#7b8794');
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(5, -48 + breath, 16.5, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#b3262e';
      ctx.beginPath();
      ctx.moveTo(5, -64 + breath);
      ctx.quadraticCurveTo(-4, -76 + breath, -12, -66 + breath);
      ctx.quadraticCurveTo(-2, -66 + breath, 5, -60 + breath);
      ctx.fill();
      glossEye(ctx, 6, -41 + breath, 4.4, '#ff8a2a', { ring: '#ffd27a', lookX: 0.9 });
      glossEye(ctx, 15, -41 + breath, 4.0, '#ff8a2a', { ring: '#ffd27a', lookX: 0.9 });
      ctx.strokeStyle = '#2a2f3a';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, -47 + breath);
      ctx.lineTo(10, -44 + breath);
      ctx.moveTo(21, -47 + breath);
      ctx.lineTo(14, -44 + breath);
      ctx.stroke();
      ctx.fillStyle = '#1c1c24';
      ctx.beginPath();
      ctx.ellipse(11, -35 + breath, 5, 3.4, 0, 0, Math.PI * 2);
      ctx.fill();
      // iron claw fist
      const fx = 26 + (angry ? 6 : 0);
      softBlob(ctx, fx - 6, -14 + breath, 9, 14, 0.4, FUR);
      softBlob(ctx, fx, -6 + breath, 14, 13, 0, '#8b97a6');
      ctx.fillStyle = '#e6ecf3';
      ctx.strokeStyle = '#3b4452';
      ctx.lineWidth = 1.2;
      [-6, 0, 6].forEach((o) => {
        ctx.beginPath();
        ctx.moveTo(fx + 10, -8 + breath + o);
        ctx.lineTo(fx + 25, -9 + breath + o * 1.4);
        ctx.lineTo(fx + 10, -4 + breath + o);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });
      break;
    }
  }

  if (boss.telegraphTimer > 0) {
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.95)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, -14, 62, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Jennifur - the sloth's girlfriend: same soft storybook sloth style, rosier fur,
 * long lashes and her signature pink hibiscus.
 */
export function drawGirlfriendDaisy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  isRescued: boolean
) {
  ctx.save();
  ctx.translate(x, y);
  const bob = Math.sin(time * 4) * 1.6;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 22, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.filter = 'saturate(1.15) brightness(1.14) hue-rotate(-12deg)';
  // feet
  [-9, 9].forEach((fx) => {
    furBlob(ctx, fx, -4.5, 8, 5.2, 0, SLOTH.dark, 1.7);
    slothClaws(ctx, fx - 0.5, -3.2, Math.PI / 2, 4.6);
  });
  // body
  const bg = ctx.createLinearGradient(-17, 0, 17, 0);
  bg.addColorStop(0, SLOTH.base);
  bg.addColorStop(0.5, SLOTH.light);
  bg.addColorStop(1, SLOTH.base);
  furBlob(ctx, 0, -21 + bob * 0.5, 18.5, 20, 0, bg, 2);
  const tg = ctx.createRadialGradient(0, -19, 2, 0, -19, 14);
  tg.addColorStop(0, '#fbe3b0');
  tg.addColorStop(1, '#efc78a');
  ctx.fillStyle = tg;
  ctx.beginPath();
  ctx.ellipse(0, -19 + bob * 0.5, 10.5, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  // leafy grass skirt
  for (let k = -3; k <= 3; k++) {
    ctx.save();
    ctx.translate(k * 4.6, -10);
    ctx.rotate(k * 0.12);
    softBlob(ctx, 0, 4, 3.6, 8, 0, k % 2 ? '#5cc65a' : '#86dd5e', 0.3);
    ctx.restore();
  }
  // arms
  const waveArm = isRescued ? Math.sin(time * 10) * 0.5 : 0;
  furLimb(ctx, -15, -30, -25, -20, -22, -11, 10.4, SLOTH.dark);
  slothClaws(ctx, -22, -10, Math.PI / 2, 6);
  if (isRescued) {
    furLimb(ctx, 15, -30, 28, -42 + waveArm * 14, 24, -54 + waveArm * 18, 10.4, SLOTH.base);
    slothClaws(ctx, 24, -56 + waveArm * 18, -Math.PI / 2, 6);
  } else {
    furLimb(ctx, 15, -30, 25, -20, 22, -11, 10.4, SLOTH.base);
    slothClaws(ctx, 22, -10, Math.PI / 2, 6);
  }
  // head
  ctx.save();
  ctx.translate(0, -45 + bob);
  ctx.scale(0.92, 0.92);
  drawSlothHead(ctx, 'front', { blink: false, hurt: false, lookX: 0, lookY: 0, fierce: false, time });
  // lashes
  ctx.strokeStyle = '#2b1608';
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.lineWidth = 2.2;
  ctx.moveTo(-14, -6);
  ctx.lineTo(-19, -13);
  ctx.moveTo(-15.5, -3.5);
  ctx.lineTo(-21.5, -8);
  ctx.moveTo(-16, -1);
  ctx.lineTo(-22, -2.5);
  ctx.moveTo(14, -6);
  ctx.lineTo(19, -13);
  ctx.moveTo(15.5, -3.5);
  ctx.lineTo(21.5, -8);
  ctx.moveTo(16, -1);
  ctx.lineTo(22, -2.5);
  ctx.stroke();
  // rosy cheeks
  ctx.fillStyle = 'rgba(255, 100, 140, 0.5)';
  ctx.beginPath();
  ctx.ellipse(-14, 7, 4.6, 3, 0, 0, Math.PI * 2);
  ctx.ellipse(14, 7, 4.6, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  // pink hibiscus
  ctx.translate(14, -19);
  ctx.scale(1.35, 1.35);
  for (let p = 0; p < 5; p++) {
    const a = (p / 5) * Math.PI * 2 - Math.PI / 2;
    softBlob(ctx, Math.cos(a) * 5.4, Math.sin(a) * 5.4, 5, 4, a, '#f4456a', 0.3);
  }
  ctx.fillStyle = '#ffe36a';
  ctx.beginPath();
  ctx.arc(0, 0, 2.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.restore();

  if (isRescued) {
    ctx.fillStyle = '#ec4899';
    ctx.font = '18px sans-serif';
    ctx.fillText('❤️', -9, -72 + Math.sin(time * 5) * 4);
  }
  ctx.restore();
}

/**
 * Procedural Vector Renderer for Collectibles
 */
export function drawCollectible(
  ctx: CanvasRenderingContext2D,
  item: Collectible,
  time: number
) {
  if (item.collected) return;

  ctx.save();
  ctx.translate(item.x, item.y);
  const bobY = Math.sin(time * 4 + item.bobPhase) * 4;
  ctx.translate(0, bobY);
  if (item.type !== 'exit_totem' && item.type !== 'cage') {
    const big = item.type === 'relic' ? 1.25 : 1.4;
    ctx.scale(big, big);
    // soft sparkle ring so pickups pop against the foliage
    const ring = ctx.createRadialGradient(0, 0, 8, 0, 0, 26);
    ring.addColorStop(0, 'rgba(255, 255, 235, 0.0)');
    ring.addColorStop(0.7, 'rgba(255, 255, 235, 0.28)');
    ring.addColorStop(1, 'rgba(255, 255, 235, 0)');
    ctx.fillStyle = ring;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fill();
  }

  switch (item.type) {
    case 'flower':
    case 'fruit': {
      const isHibiscus = item.botanicalVariant === 'hibiscus';
      const c1 = isHibiscus ? '#f2455e' : '#e85cc0';
      const spin = Math.sin(time * 2) * 0.12;
      const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 22);
      glow.addColorStop(0, 'rgba(255, 230, 150, 0.55)');
      glow.addColorStop(1, 'rgba(255, 230, 150, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2 + spin;
        softBlob(ctx, Math.cos(a) * 8, Math.sin(a) * 8, 8.4, 6.6, a, c1, 0.3);
      }
      softBlob(ctx, 0, 0, 5.4, 5.4, 0, '#ffd23a', 0.2);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-1.6, -1.8, 1.7, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'leaf': {
      ctx.save();
      ctx.rotate(0.2 + Math.sin(time * 2) * 0.06);
      const lg = ctx.createLinearGradient(-14, -18, 14, 18);
      lg.addColorStop(0, '#b6f07a');
      lg.addColorStop(0.5, '#4cc04a');
      lg.addColorStop(1, '#238a3c');
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.bezierCurveTo(18, -14, 18, 8, 0, 20);
      ctx.bezierCurveTo(-18, 8, -18, -14, 0, -20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 210, 0.8)';
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, -17);
      ctx.lineTo(0, 17);
      for (let k = -10; k <= 8; k += 6) {
        ctx.moveTo(0, k);
        ctx.lineTo(8, k - 5);
        ctx.moveTo(0, k);
        ctx.lineTo(-8, k - 5);
      }
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.ellipse(-6, -8, 3, 6, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }

    case 'relic': {
      const glow = ctx.createRadialGradient(0, -2, 4, 0, -2, 30);
      glow.addColorStop(0, 'rgba(255, 220, 110, 0.6)');
      glow.addColorStop(1, 'rgba(255, 220, 110, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, -2, 30, 0, Math.PI * 2);
      ctx.fill();
      // stone base
      softBlob(ctx, 0, 14, 14, 5, 0, '#9a9fa8', 0.3);
      // golden idol body + head
      softBlob(ctx, 0, 4, 11, 13, 0, '#e8a31a', 0.4);
      softBlob(ctx, 0, -10, 13, 11.5, 0, '#f6c442', 0.4);
      // headdress spikes
      ctx.fillStyle = '#ffdf6a';
      [-9, -3, 3, 9].forEach((hx, k) => {
        ctx.beginPath();
        ctx.moveTo(hx - 3, -18);
        ctx.lineTo(hx + (k - 1.5) * 1.2, -27 + Math.abs(k - 1.5) * 2);
        ctx.lineTo(hx + 3, -18);
        ctx.fill();
      });
      // arms + belly gem
      softBlob(ctx, -11, 4, 3.6, 8, 0.2, '#d8920f', 0.3);
      softBlob(ctx, 11, 4, 3.6, 8, -0.2, '#d8920f', 0.3);
      ctx.fillStyle = '#4fd3e8';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(4, 5);
      ctx.lineTo(0, 10);
      ctx.lineTo(-4, 5);
      ctx.closePath();
      ctx.fill();
      glossEye(ctx, -5, -10, 4.2, '#e8344a', { sclera: true, ring: '#ffe9b0', lookY: 0.2 });
      glossEye(ctx, 5, -10, 4.2, '#e8344a', { sclera: true, ring: '#ffe9b0', lookY: 0.2 });
      ctx.fillStyle = '#7a4a10';
      ctx.beginPath();
      ctx.roundRect(-5, -3.5, 10, 3.4, 1.7);
      ctx.fill();
      const ga = time * 2.5;
      ctx.strokeStyle = 'rgba(255, 250, 200, 0.85)';
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(Math.cos(ga) * 18, -2 + Math.sin(ga) * 18);
      ctx.lineTo(-Math.cos(ga) * 18, -2 - Math.sin(ga) * 18);
      ctx.stroke();
      break;
    }

    case 'cage': {
      const wob = Math.sin(time * 6) * 1.2;
      // cute caged fuzzball
      softBlob(ctx, 0, 6, 12, 11, 0, '#b985f0', 0.4);
      softBlob(ctx, -8, -6, 4.5, 5, 0, '#b985f0', 0.4);
      softBlob(ctx, 8, -6, 4.5, 5, 0, '#b985f0', 0.4);
      glossEye(ctx, -4.4, 4 + wob * 0.2, 4.2, '#4a2a1a', { lookY: 0.2 });
      glossEye(ctx, 4.4, 4 + wob * 0.2, 4.2, '#4a2a1a', { lookY: 0.2 });
      ctx.fillStyle = '#f4a0b8';
      ctx.beginPath();
      ctx.ellipse(0, 9, 1.8, 1.2, 0, 0, Math.PI * 2);
      ctx.fill();
      // bamboo bars
      ctx.lineCap = 'round';
      const bar = (x1: number, y1: number, x2: number, y2: number) => {
        ctx.strokeStyle = '#7a8a2a';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.strokeStyle = '#d4d870';
        ctx.lineWidth = 3.4;
        ctx.beginPath();
        ctx.moveTo(x1 - 0.6, y1);
        ctx.lineTo(x2 - 0.6, y2);
        ctx.stroke();
      };
      [-19, -9.5, 0, 9.5, 19].forEach((bx) => bar(bx, -21, bx, 21));
      bar(-21, -20, 21, -20);
      bar(-21, 20, 21, 20);
      if ((item.cageHp ?? 2) > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#c0284a';
        ctx.lineWidth = 3;
        ctx.font = 'bold 12px sans-serif';
        ctx.strokeText(`HP: ${item.cageHp}`, -16, -27);
        ctx.fillText(`HP: ${item.cageHp}`, -16, -27);
      }
      break;
    }

    case 'heart': {
      const pulse = Math.sin(time * 5 + item.bobPhase) * 0.1 + 0.92;
      ctx.save();
      ctx.scale(pulse, pulse);
      const glow = ctx.createRadialGradient(0, 0, 3, 0, 0, 22);
      glow.addColorStop(0, 'rgba(255, 140, 170, 0.5)');
      glow.addColorStop(1, 'rgba(255, 140, 170, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();
      const hg = ctx.createRadialGradient(-4, -6, 2, 0, 0, 16);
      hg.addColorStop(0, '#ff8aa0');
      hg.addColorStop(0.55, '#ee3358');
      hg.addColorStop(1, '#b8183c');
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.moveTo(0, 13);
      ctx.bezierCurveTo(-18, 2, -15, -13, -6.5, -12);
      ctx.bezierCurveTo(-2, -11.5, 0, -8, 0, -6);
      ctx.bezierCurveTo(0, -8, 2, -11.5, 6.5, -12);
      ctx.bezierCurveTo(15, -13, 18, 2, 0, 13);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.ellipse(-7, -7, 3.4, 2, -0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }

    case 'super_heart': {
      const pulse = Math.sin(time * 6 + item.bobPhase) * 0.12 + 0.92;
      ctx.save();
      ctx.scale(pulse, pulse);
      const halo = ctx.createRadialGradient(0, 0, 4, 0, 0, 30);
      halo.addColorStop(0, 'rgba(255, 220, 90, 0.7)');
      halo.addColorStop(1, 'rgba(255, 200, 40, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 6; i++) {
        const pa = (i * Math.PI) / 3 + time * 1.5;
        softBlob(ctx, Math.cos(pa) * 13, Math.sin(pa) * 13, 6, 9, pa + Math.PI / 2, '#ffd23a', 0.35);
      }
      const hg = ctx.createRadialGradient(-4, -6, 2, 0, 0, 18);
      hg.addColorStop(0, '#ff7a92');
      hg.addColorStop(0.55, '#e0183e');
      hg.addColorStop(1, '#9c0f30');
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.moveTo(0, 15);
      ctx.bezierCurveTo(-20, 3, -17, -14, -7, -13);
      ctx.bezierCurveTo(-2, -12.5, 0, -9, 0, -7);
      ctx.bezierCurveTo(0, -9, 2, -12.5, 7, -13);
      ctx.bezierCurveTo(17, -14, 20, 3, 0, 15);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.ellipse(-8, -8, 3.8, 2.2, -0.6, 0, Math.PI * 2);
      ctx.fill();
      drawCrown(ctx, 0, -17, 0.7);
      ctx.restore();
      break;
    }

    case 'powerup_speed': {
      const pulse = Math.sin(time * 8 + item.bobPhase) * 0.08 + 0.95;
      ctx.save();
      ctx.scale(pulse, pulse);
      const gl = ctx.createRadialGradient(0, 0, 4, 0, 0, 26);
      gl.addColorStop(0, 'rgba(80, 240, 180, 0.6)');
      gl.addColorStop(1, 'rgba(80, 240, 180, 0)');
      ctx.fillStyle = gl;
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(170, 255, 220, 0.9)';
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 0, 19, time * 8, time * 8 + Math.PI * 0.8);
      ctx.stroke();
      for (let i = 0; i < 4; i++) {
        const pa = (i * Math.PI) / 2 + time * 2;
        softBlob(ctx, Math.cos(pa) * 8.5, Math.sin(pa) * 8.5, 9, 5, pa, '#22c993', 0.35);
      }
      softBlob(ctx, 0, 0, 7, 7, 0, '#fff6a8', 0.25);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(-2, -6);
      ctx.lineTo(3, -0.5);
      ctx.lineTo(0, 0);
      ctx.lineTo(2, 6);
      ctx.lineTo(-3, 0.5);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;
    }

    case 'powerup_invincible': {
      const pulse = Math.sin(time * 9 + item.bobPhase) * 0.1 + 0.95;
      ctx.save();
      ctx.scale(pulse, pulse);
      const gl = ctx.createRadialGradient(0, 0, 4, 0, 0, 28);
      gl.addColorStop(0, 'rgba(255, 220, 80, 0.7)');
      gl.addColorStop(1, 'rgba(255, 200, 40, 0)');
      ctx.fillStyle = gl;
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.fill();
      const rot = time * 1.6;
      for (let i = 0; i < 8; i++) {
        const pa = (i * Math.PI) / 4 + rot;
        softBlob(ctx, Math.cos(pa) * 11, Math.sin(pa) * 11, 7, 3.4, pa, i % 2 ? '#ffb02e' : '#ffd84a', 0.35);
      }
      softBlob(ctx, 0, 0, 8.5, 8.5, 0, '#fff3b0', 0.3);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      for (let k = 0; k < 10; k++) {
        const r = k % 2 ? 2.8 : 6.2;
        const a = (k / 10) * Math.PI * 2 - Math.PI / 2;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;
    }

    case 'powerup_magnet': {
      const pulse = Math.sin(time * 6 + item.bobPhase) * 0.08 + 0.95;
      ctx.save();
      ctx.scale(pulse, pulse);
      const gl = ctx.createRadialGradient(0, 0, 4, 0, 0, 26);
      gl.addColorStop(0, 'rgba(110, 190, 255, 0.6)');
      gl.addColorStop(1, 'rgba(110, 190, 255, 0)');
      ctx.fillStyle = gl;
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(160, 220, 255, 0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 20, 9, time * 3, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 5; i++) {
        const pa = (i * Math.PI * 2) / 5 + time * 1.5;
        softBlob(ctx, Math.cos(pa) * 8, Math.sin(pa) * 8, 8, 5, pa, '#8a7cf0', 0.35);
      }
      softBlob(ctx, 0, 0, 6, 6, 0, '#38d8f0', 0.3);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-1.8, -2, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }

    case 'exit_totem': {
      // Magnificent Ancient Sacred Victory Portal & Shrine
      const isLocked = item.isLocked;
      const pulse = Math.sin(time * 3) * 0.15 + 0.85;

      if (!isLocked) {
        // 1. Radiant Golden-Emerald God-Ray Column (When Unlocked)
        const grad = ctx.createLinearGradient(0, -180, 0, 30);
        grad.addColorStop(0, 'rgba(52, 211, 153, 0)');
        grad.addColorStop(0.5, `rgba(52, 211, 153, ${0.35 * pulse})`);
        grad.addColorStop(1, `rgba(251, 191, 36, ${0.5 * pulse})`);
        ctx.fillStyle = grad;
        ctx.fillRect(-45, -180, 90, 210);

        // 2. Swirling Central Portal Vortex
        const swirl = time * 3.2;
        ctx.strokeStyle = `rgba(52, 211, 153, ${0.9 * pulse})`;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.ellipse(0, -25, 26, 44, swirl * 0.2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(6, 78, 59, 0.75)';
        ctx.beginPath();
        ctx.ellipse(0, -25, 20, 38, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner glowing core
        ctx.fillStyle = '#34d399';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.ellipse(0, -25, 10, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        // Sealed Portal Background (Dormant Dark Stone)
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.beginPath();
        ctx.ellipse(0, -25, 20, 38, 0, 0, Math.PI * 2);
        ctx.fill();

        // Entangled Thorny Rainforest Vines Sealing the Entrance
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-25, -45);
        ctx.lineTo(25, -5);
        ctx.moveTo(25, -45);
        ctx.lineTo(-25, -5);
        ctx.stroke();

        // Glowing Ancient Aztec Jade Padlock Seal
        ctx.fillStyle = '#ca8a04';
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, -25, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Keyhole
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.arc(0, -27, 2.5, 0, Math.PI * 2);
        ctx.rect(-1.5, -26, 3, 5);
        ctx.fill();
      }

      // 3. Ancient Stone Shrine Pillars
      // Left Pillar
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2.5;
      ctx.fillRect(-38, -90, 16, 110);
      ctx.strokeRect(-38, -90, 16, 110);
      // Right Pillar
      ctx.fillRect(22, -90, 16, 110);
      ctx.strokeRect(22, -90, 16, 110);

      // Carved Glowing Jade Runes on pillars
      ctx.fillStyle = isLocked ? '#94a3b8' : '#34d399';
      [-75, -55, -35, -15].forEach((ry, i) => {
        const runeGlow = isLocked ? 0.4 : Math.sin(time * 4 + i) * 0.3 + 0.7;
        ctx.globalAlpha = runeGlow;
        ctx.fillRect(-35, ry, 10, 4);
        ctx.fillRect(25, ry, 10, 4);
      });
      ctx.globalAlpha = 1.0;

      // 4. Carved Temple Lintel / Overhead Arch
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = isLocked ? '#64748b' : '#eab308';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-46, -112, 92, 24, 6);
      ctx.fill();
      ctx.stroke();

      // Golden Sun Emblem on Lintel
      ctx.fillStyle = isLocked ? '#71717a' : '#fde047';
      ctx.beginPath();
      ctx.arc(0, -100, 7, 0, Math.PI * 2);
      ctx.fill();

      // Badge Text
      ctx.fillStyle = isLocked ? '#f87171' : '#fef08a';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isLocked ? 'SEALED' : 'SANCTUARY', 0, -100);

      // 5. Indicator Above Portal
      const bounceY = Math.sin(time * 5) * 6;
      if (isLocked) {
        ctx.fillStyle = '#fca5a5';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('🔒 [COMPLETE MISSION]', 0, -125 + bounceY);
      } else {
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('✨ TOUCH TO CLEAR ➔', 0, -125 + bounceY);

        // Fluttering Checkered Victory Ribbons
        ctx.fillStyle = '#ef4444';
        const flutterL = Math.sin(time * 6) * 5;
        ctx.beginPath();
        ctx.moveTo(-38, -90);
        ctx.lineTo(-52 + flutterL, -75);
        ctx.lineTo(-38, -65);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#3b82f6';
        const flutterR = Math.sin(time * 6 + 1) * 5;
        ctx.beginPath();
        ctx.moveTo(38, -90);
        ctx.lineTo(52 + flutterR, -75);
        ctx.lineTo(38, -65);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
  }

  ctx.restore();
}
