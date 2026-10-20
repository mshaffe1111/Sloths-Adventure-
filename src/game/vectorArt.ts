import { drawSanctuaryDoor } from './sanctuaryDoor.ts';
import type { PlayerState, Enemy, BossEntity, Collectible } from './types.ts';
import { hexRgb, mixc, softBlob, glossEye } from './drawKit';
import { drawMilo } from './miloVariants.ts';
import { drawHeroSprite } from './heroSprite.ts';
import { drawTreeSnake, drawHarpyEagle, drawOcelot, drawHazardEntity } from './creatures.ts';
import { drawBloom, type Bloom } from './flora.ts';
import { drawFlowerSprite } from './flowerSprites.ts';
import { drawPlantSprite, plantsPainted } from './plantSprites.ts';
import { rng, tone } from './artKit.ts';
import { drawHushFern, drawKeepersBell } from './findArt.ts';
import { leaf } from './rainforest.ts';
import { drawGiantBat } from './bossBat.ts';

export { drawTreeSnake, drawHarpyEagle, drawOcelot, drawHazardEntity };

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

/** Pokey. The design lives in miloVariants.ts (variant 4, the Explorer). */
export function drawHeroSloth(ctx: CanvasRenderingContext2D, p: PlayerState, time: number) {
  if (drawHeroSprite(ctx, p, time)) return;
  drawMilo(ctx, 4, p, time);
}

// ---------------------------------------------------------------
// Soft-shaded storybook creature kit (glossy eyes, no heavy outlines)
// ---------------------------------------------------------------
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
  // The animal rigs measure motion from position, so tell them where the boss really is (mirrored when it faces left).
  const fake: Enemy = { ...boss, x: 0, y: 0, facing: 1, isAttacking: angry, wx: boss.x * boss.facing, wy: boss.y, rigKey: 'b' };
  const crownOf = (x: number, y: number, sz: number) => (c: CanvasRenderingContext2D) => {
    c.save();
    c.filter = 'none';
    drawCrown(c, x, y, sz);
    c.restore();
  };

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
      drawTreeSnake(ctx, { ...fake, rigScale: 2.025, headDeco: crownOf(1, -14, 0.9) }, time);
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
      drawOcelot(ctx, { ...fake, rigScale: 2.025 }, time);
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
      drawHarpyEagle(ctx, { ...fake, rigScale: 2.1, swoopPhase: angry ? 'swoop' : 'patrol', headDeco: crownOf(10, -46, 0.9) }, time);
      ctx.restore();
      break;
    }
    case 5: {
      // Tarantula Queen
      ctx.save();
      ctx.scale(2.0, 2.0);
      ctx.translate(0, -2);
      drawHazardEntity(ctx, { ...fake, rigScale: 3, type: 'spider', noThread: true } as Enemy, time);
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
      drawHazardEntity(ctx, { ...fake, rigScale: 3.45, type: 'frog', headDeco: crownOf(9, -19, 0.5) }, time);
      ctx.restore();
      untint();
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
      // Night-Wing Monarch: a giant fruit bat with a crown
      if (hit) ctx.filter = 'brightness(2.2)';
      ctx.save();
      ctx.scale(1.25, 1.25);
      drawGiantBat(ctx, time, angry);
      ctx.restore();
      if (hit) ctx.filter = 'none';
      break;
    }
    case 9: {
      // Magma Drake: fiery wyrm with horns and little wings
      const hornsDeco = (c: CanvasRenderingContext2D) => {
        c.save();
        c.filter = 'none';
        c.fillStyle = '#ffe9b0';
        [[-2, -11, -8, -25], [8, -12, 12, -26]].forEach(([x1, y1, x2, y2]) => {
          c.beginPath();
          c.moveTo(x1 - 3, y1);
          c.quadraticCurveTo(x1, y1 - 6, x2, y2);
          c.quadraticCurveTo(x1 + 4, y1 - 4, x1 + 3, y1);
          c.fill();
        });
        c.restore();
      };
      tint('hue-rotate(-105deg) saturate(1.3) brightness(1.05)');
      ctx.save();
      ctx.translate(0, 2);
      ctx.scale(1.35, 1.35);
      drawTreeSnake(ctx, { ...fake, rigScale: 2.025, headDeco: hornsDeco }, time);
      ctx.restore();
      untint();
      // wings
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
 * Meeca - the sloth's girlfriend: same soft storybook sloth style, rosier fur,
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
/** the hidden Thorn Gate: a ring of thorny vines around a violet glow */
function drawThornGate(ctx: CanvasRenderingContext2D, time: number) {
  const pulse = 0.65 + 0.35 * Math.sin(time * 3);
  const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 44);
  glow.addColorStop(0, `rgba(196, 181, 253, ${0.75 * pulse})`);
  glow.addColorStop(0.6, `rgba(124, 58, 237, ${0.35 * pulse})`);
  glow.addColorStop(1, 'rgba(124, 58, 237, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 44, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineCap = 'round';
  for (let k = 0; k < 2; k++) {
    ctx.strokeStyle = k === 0 ? '#14532d' : '#4ade80';
    ctx.lineWidth = k === 0 ? 6 : 3;
    ctx.beginPath();
    for (let i = 0; i <= 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      const r = 23 + Math.sin(a * 5 + time * 1.5) * 3.5;
      const x = Math.cos(a) * r * 0.82;
      const y = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.fillStyle = '#c4b5fd';
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.3;
    const x = Math.cos(a) * 23 * 0.82;
    const y = Math.sin(a) * 23;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0, -3);
    ctx.lineTo(9, 0);
    ctx.lineTo(0, 3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

export function drawCollectible(
  ctx: CanvasRenderingContext2D,
  item: Collectible,
  time: number,
  world = 1,
  mini = 1
) {
  if (item.collected) return;

  ctx.save();
  ctx.translate(item.x, item.y);
  const bobY = Math.sin(time * 4 + item.bobPhase) * 4;
  ctx.translate(0, bobY);
  if (item.type !== 'exit_totem' && item.type !== 'cage' && item.type !== 'thorn_gate' && item.type !== 'find') {
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
    case 'thorn_gate': {
      drawThornGate(ctx, time);
      break;
    }
    case 'find': {
      // they stand on the ground: no bobbing
      ctx.translate(0, -bobY);
      if (item.hidden) drawHushFern(ctx, item, time);
      else drawKeepersBell(ctx, item, time);
      break;
    }
    case 'flower':
    case 'fruit': {
      // a glowing bloom; the species rotates through the collection so no two pickups in a row look alike
      const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 24);
      glow.addColorStop(0, 'rgba(255, 236, 170, 0.6)');
      glow.addColorStop(1, 'rgba(255, 236, 170, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fill();
      // the painted flower when it is on and loaded (the vector bloom below is the fallback and the classic look)
      if (item.type === 'flower' && drawFlowerSprite(ctx, world, mini, item.id, Math.sin(time * 2 + item.bobPhase) * 0.07)) break;
      const species: Array<[Bloom, string, string]> = [
        ['hibiscus', '#f2455e', '#ffd23a'],
        ['orchid', '#f07ad8', '#ffe26a'],
        ['plumeria', '#fff4e8', '#ffb43a'],
        ['passion', '#b46aff', '#ffffff'],
        ['hibiscus', '#ff8a2a', '#ffe26a'],
        ['daisy', '#ffe66a', '#ff8a2a'],
      ];
      const [kind, c1, c2] = species[Math.abs(item.id) % species.length];
      drawBloom(ctx, kind, 0, 0, 13, c1, c2, Math.sin(time * 2) * 0.12, rng(item.id * 17 + 3));
      break;
    }

    case 'leaf': {
      // the painted foliage plant when it is on and loaded (the vector leaf below is the fallback and the classic look)
      if (plantsPainted()) {
        const pg = ctx.createRadialGradient(0, 0, 2, 0, 0, 24);
        pg.addColorStop(0, 'rgba(210, 255, 160, 0.5)');
        pg.addColorStop(1, 'rgba(210, 255, 160, 0)');
        ctx.save();
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      if (drawPlantSprite(ctx, world, mini, item.id, Math.sin(time * 2 + item.bobPhase) * 0.06)) break;
      // a lit, pointed leaf with golden veins and a gentle sway
      ctx.save();
      ctx.rotate(-0.9 + Math.sin(time * 2) * 0.06);
      const glow = ctx.createRadialGradient(0, -10, 2, 0, -10, 26);
      glow.addColorStop(0, 'rgba(200, 255, 140, 0.5)');
      glow.addColorStop(1, 'rgba(200, 255, 140, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, -10, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.rotate(Math.PI / 2);
      ctx.translate(-20, 0);
      leaf(ctx, 0, 0, 40, 15, 0, tone('#42c04a'), 0.12, true);
      ctx.strokeStyle = 'rgba(255, 244, 170, 0.9)';
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(20, 2, 38, 4);
      ctx.stroke();
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
      // the sanctuary door stands still (it must not bob with the pickups); see sanctuaryDoor.ts
      ctx.translate(0, -bobY);
      drawSanctuaryDoor(ctx, time, !!item.isLocked);
      break;
    }
  }

  ctx.restore();
}
