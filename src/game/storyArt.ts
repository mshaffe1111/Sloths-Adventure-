import type { PlayerState } from './types.ts';
import { drawPaintedCardBoss, drawPaintedBossFrame } from './bossArt.ts';
import { POKEY, drawPokeyFace, VISEMES, warmStoryHero } from './heroStory.ts';
import { cameraAt, drawFx, flashAt, poseAt, shakeAt } from './storyShots.ts';
import { devScale, renderScenery, renderOverlay, withBakeScale } from './scenery.ts';
import { drawHeroSloth, drawGirlfriendDaisy } from './vectorArt.ts';
import { MEECA, warmStoryMeeca } from './jennifurSprite.ts';
import { releaseHd } from './storyHd.ts';
import { actorDx, footing, followScroll, GROUNDED, groundOf, shadowFor, showActor, type StoryCharacter } from './storyActors.ts';
import { thornbarkSprite } from './thornbarkSprite.ts';
import { drawMilo } from './miloVariants.ts';
import type { StoryScene, SceneActor, ScenePhoto, BloomStage } from './story.ts';
import { drawCastleBackdrop, FORTRESS_CASTLE } from './castleSprites.ts';
import { drawDotStoryFrame, poseFrame, warmStoryDot } from './dotSprite.ts';
import { leaveStoryGuardians, warmStoryGuardians } from './storyGuard.ts';
import { FLICKER_CLIPS } from './flickerClips.ts';
import { FLICKER_ANIM_FPS, FLICKER_ANIM_H, FLICKER_ANIM_UP } from './flickerAnimData.ts';
import { SOLDIER_CLIPS } from './soldierClips.ts';
import { SOLDIER_ANIM, SOLDIER_ANIM_UP, SOLDIER_SEQ } from './soldierAnimData.ts';
import { photoUrl } from './photos.ts';
import { plateImage, preloadPlates, releasePlates } from './plates.ts';
import { drawLivePlate, preloadLivePlates, releaseLivePlates } from './livePlates.ts';
import { CEL_HD, CEL_K, CELS, drawCel, releaseCels, warmCels } from './storyCels.ts';
import { capStoryZoom, liftForFeet } from './storyFrame.ts';
import { GROUND_LINE, groundImage } from './storyGround.ts';
import { isPlate, PLATES } from './plateData.ts';
import { FONT_READ } from './fonts.ts';
import { CARD_H, CARD_SAFE_H, CARD_SAFE_W, CARD_W, cardUrl } from './endCards.ts';

export const SCENE_W = 960;
export const SCENE_H = 540;
/** a plate's scene part (its bottom) as a share of its width: the old 1024 x 572 plates */
export const PLATE_BASE = 572 / 1024;


function makePlayer(pose: SceneActor['pose'], facing: 1 | -1): PlayerState {
  return {
    x: 0, y: 0, vx: 0, vy: 0, width: 44, height: 48, facing, grounded: true, climbing: false,
    ducking: pose === 'duck', punching: pose === 'punch', punchTimer: pose === 'punch' ? 0.1 : 0,
    punchType: 'normal', kicking: false, kickTimer: 0, attackType: pose === 'punch' ? 'punch' : 'none',
    jumpsLeft: 2, isDoubleJumping: false, somersaultAngle: 0, megaCharge: 0, hp: 5, maxHp: 5,
    fruitsCollected: 0, relicsFound: 0, crittersRescued: 0, enemiesDefeated: 0, invincibleTimer: 0,
    walkCycle: 0, squashX: 1, squashY: 1, targetScaleX: 1, targetScaleY: 1,
  };
}



let silCanvas: HTMLCanvasElement | null = null;
/** Draw something as a flat dark silhouette (works regardless of nested ctx.filter calls). */
function drawSilhouette(
  ctx: CanvasRenderingContext2D,
  draw: (c: CanvasRenderingContext2D) => void,
  alpha = 0.88,
  color = '#0b1024'
) {
  if (typeof document === 'undefined') return;
  if (!silCanvas) {
    silCanvas = document.createElement('canvas');
    silCanvas.width = 700;
    silCanvas.height = 560;
  }
  const o = silCanvas.getContext('2d')!;
  o.clearRect(0, 0, 700, 560);
  o.save();
  o.translate(350, 420);
  draw(o);
  o.restore();
  o.globalCompositeOperation = 'source-atop';
  o.fillStyle = color;
  o.fillRect(0, 0, 700, 560);
  o.globalCompositeOperation = 'source-over';
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(silCanvas, -350, -420);
  ctx.restore();
}

/**
 * The painted ground under the figures in a picture over a world's backdrop (storyGround.ts): the world's strip laid along the ground
 * line at the scene's scale, repeated (every other copy turned over) as far as the camera travels, `scroll` px. While the strip is still
 * on its way, a soft dark band stands in for it so nobody stands in the air.
 */
function drawGround(ctx: CanvasRenderingContext2D, scene: StoryScene, y: number, w: number, h: number, scroll: number, lift: number) {
  const bottom = h * (1 + lift) + 8;
  const im = groundImage(scene.world);
  if (!im) {
    const g = ctx.createLinearGradient(0, y - 6, 0, bottom);
    g.addColorStop(0, 'rgba(20, 26, 16, 0)');
    g.addColorStop(0.08, 'rgba(20, 26, 16, 0.85)');
    g.addColorStop(1, 'rgba(10, 14, 8, 1)');
    ctx.fillStyle = g;
    ctx.fillRect(-20, y - 6, w + 40, bottom - y + 6);
    return;
  }
  const line = GROUND_LINE[scene.world] ?? 0.3;
  // (the strip's part under its walk line reaches the bottom of the view with room to spare; never shrunk below a third of its size)
  const k = Math.max(h / 3 / im.naturalHeight, (bottom - y) / ((1 - line) * im.naturalHeight));
  const tw = im.naturalWidth * k;
  const th = im.naturalHeight * k;
  const top = y - line * th;
  const off = ((scroll % (2 * tw)) + 2 * tw) % (2 * tw);
  for (let i = -1; i * tw - off < w + 20; i++) {
    const x = i * tw - off;
    if (x + tw < -20) continue;
    ctx.save();
    if (i & 1) {
      ctx.translate(x + tw, top);
      ctx.scale(-1, 1);
      ctx.drawImage(im, 0, 0, tw + 1, th);
    } else {
      ctx.drawImage(im, x, top, tw + 1, th);
    }
    ctx.restore();
  }
}

/** the painted Heartbloom, in the four stages of its life (the sheet's bud, bloom, epic bloom and ultimate state) */
const BLOOM_URLS: Record<BloomStage, string> = {
  bud: new URL('../assets/flora/heartbloom-bud.webp', import.meta.url).href,
  bloom: new URL('../assets/flora/heartbloom-bloom.webp', import.meta.url).href,
  epic: new URL('../assets/flora/heartbloom-epic.webp', import.meta.url).href,
  ultimate: new URL('../assets/flora/heartbloom-ultimate.webp', import.meta.url).href,
};
const bloomImgs = new Map<BloomStage, HTMLImageElement>();
function bloomImage(stage: BloomStage): HTMLImageElement | null {
  let im = bloomImgs.get(stage);
  if (!im) {
    if (typeof Image === 'undefined') return null;
    im = new Image();
    im.src = BLOOM_URLS[stage];
    bloomImgs.set(stage, im);
  }
  return im.complete && im.naturalWidth > 0 ? im : null;
}
if (typeof Image !== 'undefined') (Object.keys(BLOOM_URLS) as BloomStage[]).forEach((k) => bloomImage(k));

/** the Heartbloom painted from the concept sheet: it glows, breathes a little, and stands in a tuft of leaves */
function drawPaintedBloom(ctx: CanvasRenderingContext2D, im: HTMLImageElement, stage: BloomStage, s: number, t: number) {
  const pulse = 0.85 + Math.sin(t * 2.2) * 0.15;
  const wid = 120 * s * (stage === 'epic' ? 1.15 : 1);
  const hei = wid * (im.naturalHeight / im.naturalWidth);
  const glow = stage === 'bud' ? 0.35 : stage === 'bloom' ? 0.6 : 0.9;
  const gl = ctx.createRadialGradient(0, -hei * 0.5, 4, 0, -hei * 0.5, wid * 0.95 * pulse);
  gl.addColorStop(0, `rgba(255, 225, 140, ${glow})`);
  gl.addColorStop(1, 'rgba(255, 225, 140, 0)');
  ctx.fillStyle = gl;
  ctx.beginPath();
  ctx.arc(0, -hei * 0.5, wid * 0.95 * pulse, 0, Math.PI * 2);
  ctx.fill();
  // a tuft of leaves hides the flat base of the cutout
  ctx.fillStyle = '#3f9a45';
  ctx.strokeStyle = '#256b30';
  ctx.lineWidth = 2;
  [-1, 1].forEach((d) => {
    ctx.beginPath();
    ctx.moveTo(d * wid * 0.08, 2);
    ctx.quadraticCurveTo(d * wid * 0.38, -hei * 0.2, d * wid * 0.52, -hei * 0.03);
    ctx.quadraticCurveTo(d * wid * 0.3, hei * 0.04, d * wid * 0.08, 2);
    ctx.fill();
    ctx.stroke();
  });
  const breathe = 1 + Math.sin(t * 1.6) * 0.012;
  ctx.save();
  ctx.translate(0, hei * 0.06);
  ctx.scale(breathe, breathe);
  ctx.drawImage(im, -wid / 2, -hei, wid, hei);
  ctx.restore();
}

function drawBloom(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, t: number, stage: BloomStage = 'bloom') {
  ctx.save();
  ctx.translate(x, y);
  const painted = bloomImage(stage);
  if (painted) {
    drawPaintedBloom(ctx, painted, stage, s, t);
    ctx.restore();
    return;
  }
  ctx.scale(s, s);
  const pulse = 0.85 + Math.sin(t * 2.2) * 0.15;
  const gl = ctx.createRadialGradient(0, -34, 4, 0, -34, 90 * pulse);
  gl.addColorStop(0, 'rgba(255, 225, 140, 0.8)');
  gl.addColorStop(1, 'rgba(255, 225, 140, 0)');
  ctx.fillStyle = gl;
  ctx.beginPath();
  ctx.arc(0, -34, 90 * pulse, 0, Math.PI * 2);
  ctx.fill();
  // stem + leaves
  ctx.strokeStyle = '#2f9a3c';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-4, -16, 0, -30);
  ctx.stroke();
  ctx.fillStyle = '#4cc04a';
  [-1, 1].forEach((d) => {
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.quadraticCurveTo(d * 22, -22, d * 28, -6);
    ctx.quadraticCurveTo(d * 12, -4, 0, -8);
    ctx.fill();
  });
  // petals
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + t * 0.2;
    ctx.save();
    ctx.translate(0, -34);
    ctx.rotate(a);
    const pg = ctx.createLinearGradient(0, 0, 0, -26);
    pg.addColorStop(0, '#ffe9a8');
    pg.addColorStop(1, i % 2 ? '#ff7aa8' : '#ff9ac0');
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.ellipse(0, -15, 8, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#ffd23a';
  ctx.beginPath();
  ctx.arc(0, -34, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-2.5, -37, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawParticles(ctx: CanvasRenderingContext2D, kind: StoryScene['particles'], w: number, h: number, t: number) {
  if (!kind || kind === 'none') return;
  const n = kind === 'rain' ? 110 : 34;
  for (let i = 0; i < n; i++) {
    const seed = i * 9.31;
    const fx = (Math.sin(seed) * 0.5 + 0.5);
    const sp = 0.4 + ((i * 37) % 10) / 12;
    if (kind === 'rain') {
      const x = ((fx * w * 1.2 + t * 180) % (w + 80)) - 40;
      const y = ((t * 620 * sp + i * 83) % (h + 40)) - 20;
      ctx.strokeStyle = 'rgba(200, 215, 255, 0.45)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 7, y + 20);
      ctx.stroke();
    } else if (kind === 'petals') {
      const x = (fx * w + Math.sin(t * 1.2 + seed) * 40 + t * 22 * sp) % w;
      const y = ((t * 38 * sp + i * 51) % (h + 40)) - 20;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(t * 1.4 + seed);
      ctx.fillStyle = i % 3 ? 'rgba(255, 150, 190, 0.9)' : 'rgba(255, 220, 230, 0.9)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 6, 3.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (kind === 'embers') {
      const x = (fx * w + Math.sin(t + seed) * 20) % w;
      const y = h - ((t * 50 * sp + i * 61) % (h + 20));
      ctx.fillStyle = `rgba(255, ${120 + (i % 5) * 20}, 40, 0.8)`;
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const x = fx * w;
      const y = ((Math.cos(seed) * 0.5 + 0.5) * h * 0.8 + Math.sin(t * sp + seed) * 14);
      const a = 0.35 + 0.5 * Math.abs(Math.sin(t * 1.6 * sp + seed));
      ctx.fillStyle = `rgba(255, 250, 190, ${a})`;
      ctx.beginPath();
      ctx.arc(x, y, 2 + a * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawMood(ctx: CanvasRenderingContext2D, mood: StoryScene['mood'], w: number, h: number, t: number, moonlit = false) {
  switch (mood) {
    case 'storm': {
      if (moonlit) {
        // (a painted storm plate is dark already: a light veil and the moon through the clouds, so it reads as a moonlit storm, not murk
        // (Matt's audit, 2026-10-30: the singing-storm memory was all murk under the wash))
        ctx.fillStyle = 'rgba(22, 20, 60, 0.16)';
        ctx.fillRect(0, 0, w, h);
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const mg = ctx.createRadialGradient(w * 0.72, h * 0.12, 10, w * 0.72, h * 0.12, Math.max(w, h) * 0.75);
        mg.addColorStop(0, 'rgba(200, 214, 255, 0.5)');
        mg.addColorStop(0.45, 'rgba(120, 140, 200, 0.18)');
        mg.addColorStop(1, 'rgba(60, 70, 120, 0)');
        ctx.fillStyle = mg;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      } else {
        ctx.fillStyle = 'rgba(22, 14, 56, 0.55)';
        ctx.fillRect(0, 0, w, h);
      }
      const phase = (t % 5) / 5;
      if (phase < 0.06) {
        ctx.fillStyle = `rgba(230, 235, 255, ${0.55 * (1 - phase / 0.06)})`;
        ctx.fillRect(0, 0, w, h);
      }
      break;
    }
    case 'dusk': {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(120, 50, 140, 0.35)');
      g.addColorStop(1, 'rgba(255, 140, 60, 0.35)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      break;
    }
    case 'night': {
      ctx.fillStyle = 'rgba(10, 18, 70, 0.5)';
      ctx.fillRect(0, 0, w, h);
      break;
    }
    case 'glow': {
      const g = ctx.createRadialGradient(w / 2, h * 0.45, 20, w / 2, h * 0.45, w * 0.7);
      g.addColorStop(0, 'rgba(255, 240, 180, 0.35)');
      g.addColorStop(1, 'rgba(255, 200, 120, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      break;
    }
    default:
      break;
  }
}

// ───────────── the ground and the people on it ─────────────

/** feet stand this many px down into the moss of the branch (its top edge is the ground line), so they read as standing in it, not on its lip */
const SINK = 5;

/** where the drawers below put contact shadows: the picture itself while the figures go to their own layer (drawFigures) */
let shadowCtx: CanvasRenderingContext2D | null = null;
/** the floor's colour under the shadows of this picture (ST-2: tinted from the ground, not one cool grey) */
let shadowRgb = '14, 20, 30';

/**
 * A contact shadow on the ground line under something `bodyW` wide and `bodyH` tall (px) that is `lift` px off the ground (ST-2): a tight
 * dark core where the feet press down and a soft broad pool around it, both in the floor's own darkest colour.
 */
function drawContactShadow(ctx: CanvasRenderingContext2D, x: number, y: number, bodyW: number, bodyH: number, lift: number) {
  const c = shadowCtx ?? ctx;
  const sh = shadowFor(bodyW, bodyH, lift);
  const k = sh.alpha / 0.55;
  c.save();
  if (shadowCtx && shadowCtx !== ctx) c.setTransform(ctx.getTransform());
  c.translate(x, y + sh.ry * 0.25);
  for (const [rx, ry, a] of [[sh.rx * 1.35, sh.ry * 1.5, 0.25 * k], [sh.rx * 0.8, sh.rx * 0.12, 0.6 * k]] as const) {
    c.save();
    c.scale(1, ry / rx);
    const g = c.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, `rgba(${shadowRgb}, ${a})`);
    g.addColorStop(0.55, `rgba(${shadowRgb}, ${a * 0.7})`);
    g.addColorStop(1, `rgba(${shadowRgb}, 0)`);
    c.fillStyle = g;
    c.beginPath();
    c.arc(0, 0, rx, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }
  c.restore();
}

/** how each kind of scene lights its figures (ST-2): a rim on the side the light comes from, a little of the scene's colour over them */
const LIGHT: Record<StoryScene['mood'], { rim: string; rimA: number; tint: string; tintA: number; shade: string }> = {
  day: { rim: '255, 236, 190', rimA: 0.42, tint: '255, 214, 150', tintA: 0.06, shade: '28, 34, 14' },
  dusk: { rim: '255, 172, 96', rimA: 0.55, tint: '150, 70, 110', tintA: 0.1, shade: '40, 18, 30' },
  night: { rim: '150, 190, 255', rimA: 0.45, tint: '30, 44, 110', tintA: 0.16, shade: '6, 8, 22' },
  storm: { rim: '178, 204, 255', rimA: 0.5, tint: '40, 50, 96', tintA: 0.14, shade: '8, 10, 24' },
  glow: { rim: '255, 226, 160', rimA: 0.5, tint: '255, 200, 140', tintA: 0.08, shade: '40, 24, 14' },
};

let figCanvas: HTMLCanvasElement | null = null;
let rimCanvas: HTMLCanvasElement | null = null;
function layer(cv: HTMLCanvasElement | null, w: number, h: number): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const c = cv ?? document.createElement('canvas');
  if (c.width !== w || c.height !== h) {
    c.width = w;
    c.height = h;
  }
  return c;
}

/**
 * The figures of a picture, lit by it (ST-2): drawn on a layer of their own with the picture's camera, then a little of the scene's colour
 * laid over them and a rim of its light along the edges that face the light (upper left, or `light` of the scene: the lamp, the window),
 * then put down on the picture. Their contact shadows go straight onto the picture, under them.
 */
function drawFigures(ctx: CanvasRenderingContext2D, scene: StoryScene, draw: (c: CanvasRenderingContext2D) => void) {
  const cv = ctx.canvas as HTMLCanvasElement;
  const fig = (figCanvas = layer(figCanvas, cv.width, cv.height));
  const rim = (rimCanvas = layer(rimCanvas, cv.width, cv.height));
  const L = LIGHT[scene.mood] ?? LIGHT.day;
  shadowRgb = L.shade;
  const g = fig?.getContext('2d');
  const r = rim?.getContext('2d');
  if (!fig || !rim || !g || !r) {
    draw(ctx);
    return;
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, fig.width, fig.height);
  g.setTransform(ctx.getTransform());
  g.globalAlpha = ctx.globalAlpha;
  shadowCtx = ctx;
  try {
    draw(g);
  } finally {
    shadowCtx = null;
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1;
  // the rim: the figures, less themselves moved away from the light, in the light's colour
  const dir = scene.light ?? (scene.plate && isPlate(scene.plate) ? PLATES[scene.plate].light : undefined);
  const lx = dir?.[0] ?? -0.7;
  const ly = dir?.[1] ?? -0.7;
  const d = Math.max(2, Math.round(cv.height / 300));
  r.setTransform(1, 0, 0, 1, 0, 0);
  r.globalCompositeOperation = 'copy';
  r.drawImage(fig, 0, 0);
  r.globalCompositeOperation = 'source-in';
  r.fillStyle = `rgb(${L.rim})`;
  r.fillRect(0, 0, rim.width, rim.height);
  r.globalCompositeOperation = 'destination-out';
  r.drawImage(fig, -lx * d, -ly * d);
  r.globalCompositeOperation = 'source-over';
  // the scene's colour over the figures, only where they are
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = `rgba(${L.tint}, ${L.tintA})`;
  g.fillRect(0, 0, fig.width, fig.height);
  g.globalAlpha = L.rimA;
  g.globalCompositeOperation = 'lighter';
  g.drawImage(rim, 0, 0);
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(fig, 0, 0);
  ctx.restore();
}

/** a few soft puffs of dust where a runner's foot has just come down (drawn behind the legs): `age` is seconds since the footfall, `size` about a foot's length in px */
function drawDust(ctx: CanvasRenderingContext2D, x: number, y: number, age: number, dir: number, size: number, seed: number) {
  const u = age / 0.55;
  if (u < 0 || u > 1) return;
  ctx.save();
  for (let i = 0; i < 3; i++) {
    const r = size * (0.32 + 0.16 * i) * (0.55 + u * 0.95);
    const px = x - dir * size * (0.15 + 0.5 * i) * (0.4 + u) + Math.sin(seed * 7.3 + i * 2.1) * size * 0.1;
    const py = y - r * 0.35 - u * size * (0.25 + 0.2 * i);
    const g = ctx.createRadialGradient(px, py, 0, px, py, r);
    const a = 0.44 * (1 - u) * (1 - i * 0.15);
    g.addColorStop(0, `rgba(222, 205, 170, ${a})`);
    g.addColorStop(0.6, `rgba(222, 205, 170, ${a * 0.55})`);
    g.addColorStop(1, 'rgba(222, 205, 170, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** the moods a face portrait can speak with: the mouth shapes of the dialogue sheet, a few a second, in no regular order */
const MOUTH = [0, 1, 2, 1, 0, 2, 0, 1, 2, 2, 1, 0];

/**
 * Pokey or Meeca in a story picture, standing on the picture's ground line (or hovering above it, with the shadow on it), doing what their mood, their moves and their pose
 * timeline say (storyActors.ts showActor). False when the painted art is not there (still loading, or switched off): the caller then draws the plain vector figure.
 */
function drawCharacter(ctx: CanvasRenderingContext2D, a: SceneActor, ch: StoryCharacter, w: number, h: number, t: number, ground: number, scroll: number, defaultMood: string): boolean {
  if (!ch.ready()) return false;
  const foot = footing(a, ground);
  const pose = a.seq && a.seq.length ? poseAt(a.seq, t) : null;
  const sc = (a.scale ?? 1) * (pose?.sc ?? 1);
  const s = sc * 3;
  const show = showActor(ch, a, t, w, defaultMood);
  const x = (a.x + show.dx) * w - scroll;
  const feetY = (foot.y + (pose?.dy ?? 0)) * h + (foot.hover ? 0 : SINK);
  const groundY = ground * h + SINK;
  const bodyH = ch.units * s;
  const liftPx = Math.max(0, groundY - feetY) + show.lift * bodyH;
  drawContactShadow(ctx, x, groundY, bodyH * 0.5, bodyH, liftPx);
  // a footfall on a run raises a little dust, left where the foot came down
  const gspec = show.gait ? ch.gaits[show.gait.name] : undefined;
  if (show.gait && gspec?.dust && show.gait.step > 0) {
    const top = gspec.frames.reduce((m, f) => Math.max(m, f.fx ?? 0), -1e9);
    const px = ch.k * s;
    const fall = x + show.facing * (top - show.gait.phase * show.gait.stride) * px;
    drawDust(ctx, fall, groundY, show.gait.phase * show.gait.seconds, show.facing, bodyH * 0.17, show.gait.step);
  }
  ctx.save();
  ctx.translate(x, feetY);
  ctx.rotate((pose?.rot ?? 0) * show.facing);
  if (show.facing === -1) ctx.scale(-1, 1);
  ctx.scale(s, s);
  ctx.translate(show.gait ? show.gait.shift * ch.k : 0, -show.lift * ch.units);
  if (show.rot) ctx.rotate(show.rot);
  if (show.sy !== 1) ctx.scale(1, show.sy);
  const ok = ch.draw(ctx, show.frame, show.anchor, show.facing === -1);
  ctx.restore();
  return ok;
}

/** Pokey's face, big, its chin on the ground line (the body is out of the picture), breathing a little; the mouth moves when he is talking */
function drawPortrait(ctx: CanvasRenderingContext2D, a: SceneActor, w: number, h: number, t: number, ground: number, scroll: number): boolean {
  const pose = a.seq && a.seq.length ? poseAt(a.seq, t) : null;
  const foot = footing(a, ground);
  const x = (a.x + (pose?.dx ?? 0)) * w - scroll;
  const feetY = (foot.y + (pose?.dy ?? 0)) * h;
  const face = a.facing === -1 ? -1 : 1;
  let name = pose?.frame || 'face_calm';
  if (a.mood === 'talk' && (name === 'face_calm' || name === 'face_neutral')) name = VISEMES[MOUTH[Math.floor(t * 8.5) % MOUTH.length]];
  const size = 330 * (a.scale ?? 1) * (pose?.sc ?? 1);
  ctx.save();
  ctx.translate(x, feetY);
  ctx.rotate((pose?.rot ?? 0) * face);
  if (face === -1) ctx.scale(-1, 1);
  ctx.translate(0, Math.sin(t * 2.4) * 2);
  const ok = drawPokeyFace(ctx, name, -size / 2, -size, size);
  ctx.restore();
  return ok;
}

/** a painted boss on a timeline of its own frames (storyShots.ts); false when the painted art is not there */
function drawBossPerformer(ctx: CanvasRenderingContext2D, a: SceneActor, w: number, h: number, t: number, ground: number, scroll: number): boolean {
  if (!a.seq || !a.seq.length) return false;
  const pose = poseAt(a.seq, t);
  const foot = footing(a, ground);
  const feetY = (foot.y + pose.dy) * h + (foot.hover ? 0 : SINK);
  const x = (a.x + pose.dx) * w - scroll;
  const s = (a.scale ?? 1) * 3.0 * pose.sc;
  const face = (a.facing === -1 ? -1 : 1) * (pose.flip ? -1 : 1);
  ctx.save();
  ctx.translate(x, feetY);
  ctx.rotate(pose.rot * face);
  if (face === -1) ctx.scale(-1, 1);
  ctx.scale(s * 0.62, s * 0.62);
  ctx.translate(0, 24);
  ctx.scale(1.3, 1.3);
  const drawn = drawPaintedBossFrame(ctx, a.world ?? 1, pose.frame);
  ctx.restore();
  return drawn;
}

// ───────────── remembered scenes and photographs ─────────────

const photoImgs = new Map<string, HTMLImageElement>();
function photoImage(key: string): HTMLImageElement | null {
  let im = photoImgs.get(key);
  if (!im) {
    const url = photoUrl(key);
    if (!url || typeof Image === 'undefined') return null;
    im = new Image();
    im.src = url;
    photoImgs.set(key, im);
  }
  return im.complete && im.naturalWidth > 0 ? im : null;
}

/** start loading the photographs a cutscene will show, so the first one is not late */
export function preloadScenePhotos(keys: Array<string | undefined>) {
  for (const k of keys) if (k) photoImage(k);
}

/**
 * start loading the whole-picture backdrops (plates) the next panels will show: `keys` the plates of the panels coming up, the first
 * one next. Only the next one's moving parts are started (two of those sheets are held at once: the one showing and the next).
 */
export function preloadScenePlates(keys: Array<string | undefined>) {
  preloadPlates(keys);
  preloadLivePlates(keys.filter(Boolean).slice(0, 1));
}

// ───────────── the ending cards (S-7) ─────────────

const cardImgs = new Map<string, { im: HTMLImageElement; soft?: HTMLCanvasElement }>();
function cardImage(key: string) {
  let c = cardImgs.get(key);
  if (!c) {
    const url = cardUrl(key);
    if (!url || typeof Image === 'undefined') return null;
    const im = new Image();
    im.src = url;
    c = { im };
    cardImgs.set(key, c);
  }
  return c.im.complete && c.im.naturalWidth > 0 ? c : null;
}

/** start loading the ending cards the next panels will show */
export function preloadSceneCards(keys: Array<string | undefined>) {
  for (const k of keys) if (k) cardImage(k);
}

/**
 * an ending card over the whole picture, in the room above the words: as big as it goes without losing any of its middle 1440 x 880,
 * the rest of the screen the same painting, soft and dark (shrunk to a few pixels and stretched back: a blur for nothing, every frame)
 */
function drawEndCard(ctx: CanvasRenderingContext2D, key: string, w: number, vh: number, feetMax: number, t: number) {
  ctx.fillStyle = '#0b0906';
  ctx.fillRect(0, 0, w, vh);
  const c = cardImage(key);
  if (!c) return;
  const fade = Math.min(1, t / 0.6);
  if (!c.soft && typeof document !== 'undefined') {
    const soft = document.createElement('canvas');
    soft.width = 48;
    soft.height = 27;
    soft.getContext('2d')?.drawImage(c.im, 0, 0, 48, 27);
    c.soft = soft;
  }
  const room = vh * Math.min(1, feetMax);
  ctx.save();
  ctx.globalAlpha = fade;
  if (c.soft) {
    const bs = Math.max(w / CARD_W, vh / CARD_H);
    ctx.drawImage(c.soft, (w - CARD_W * bs) / 2, (vh - CARD_H * bs) / 2, CARD_W * bs, CARD_H * bs);
    ctx.fillStyle = 'rgba(8, 6, 4, 0.55)';
    ctx.fillRect(0, 0, w, vh);
  }
  const s = Math.min(Math.max(w / CARD_W, room / CARD_H), w / CARD_SAFE_W, room / CARD_SAFE_H) * (1 + 0.03 * Math.min(t / 9, 1));
  const cw = CARD_W * s;
  const ch = CARD_H * s;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = 30;
  // (upright there is room to spare: the card sits a little low, clear of the buttons along the top)
  const slack = room - ch;
  ctx.drawImage(c.im, (w - cw) / 2, slack > 0 ? slack * 0.62 : slack / 2, cw, ch);
  ctx.restore();
}

/** a story has closed: let go of its plates, their moving parts and its photographs (they load again, from the offline cache, if it is played again) */
export function releaseStoryArt() {
  releasePlates();
  releaseLivePlates();
  releaseHd();
  leaveStoryGuardians();
  releaseCels();
  photoImgs.clear();
  cardImgs.clear();
}

/** a story is opening: start fetching its cast's paintings (Pokey, Meeca and Dot's story pages, the story cels) */
export function warmStoryCast() {
  warmStoryGuardians();
  warmStoryHero();
  warmStoryMeeca();
  warmStoryDot();
  warmCels();
}

/** a plate fills the picture (cover), the painting's own floor under the actors; until it has loaded the picture is a dark ground, never another world's scenery */
/**
 * A plate's picture: its bottom 1024:572 is the scene (where the ground and every shot were framed), and a repainted plate goes on
 * upward past it (PLATE_BASE), so an upright phone's room above the scene (`top`) shows more of the same painting.
 */
/** where this frame's plate lies in the scene (drawPlate), for the figures pinned to it */
let plateMap: { ox: number; iw: number; bh: number } | null = null;
/** a pinned figure on a plate: its x and y (shares of the plate's scene) to the scene's own shares */
function pin(a: SceneActor, w: number, h: number): SceneActor {
  if (!a.pinned || !plateMap) return a;
  return { ...a, x: (plateMap.ox + a.x * plateMap.iw) / w, y: a.y === undefined ? a.y : (a.y * plateMap.bh) / h };
}

function drawPlate(ctx: CanvasRenderingContext2D, key: string, w: number, h: number, lift: number, t = 0, top = 0) {
  const im = plateImage(key);
  const hh = h * (1 + lift) + 4;
  if (!im) {
    ctx.fillStyle = '#0a0f18';
    ctx.fillRect(0, -top, w, hh + top);
    return;
  }
  const bh = im.naturalWidth * PLATE_BASE;
  const ext = im.naturalHeight - bh;
  const s = Math.max(w / im.naturalWidth, hh / bh, ext > 0 ? 0 : (hh + top) / bh);
  const iw = im.naturalWidth * s;
  const ox = (w - iw) / 2;
  const oy = -ext * s;
  plateMap = { ox, iw, bh: bh * s };
  ctx.drawImage(im, ox, oy, iw, im.naturalHeight * s);
  // the parts of the painting that move (livePlates.ts, test): fire, fireflies, rain, mist (painted over the scene part)
  drawLivePlate(ctx, key, ox, 0, (s * im.naturalWidth) / 1024, t);
}

/** the look of a memory: colour drained and warmed, the edges melting into old paper, a faint projector flicker */
function drawMemoryWash(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  ctx.save();
  ctx.globalCompositeOperation = 'saturation';
  ctx.fillStyle = 'hsl(32, 36%, 50%)';
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = '#ffcf7a';
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  // (an old photograph's paper edge, round the picture whatever its shape: upright it is taller than wide)
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.36, w / 2, h / 2, Math.hypot(w, h) * 0.5);
  g.addColorStop(0, 'rgba(250, 232, 190, 0)');
  g.addColorStop(0.68, 'rgba(250, 232, 190, 0.34)');
  g.addColorStop(1, 'rgba(238, 210, 156, 0.92)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 0.035 + 0.03 * Math.sin(t * 7.3);
  ctx.fillStyle = '#fff3d0';
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/** an old photograph held up in front of the picture: the scene dims, the card settles in and drifts closer */
function drawPhotoCard(ctx: CanvasRenderingContext2D, ph: ScenePhoto, w: number, h: number, t: number) {
  const fade = Math.min(1, t / 0.6);
  ctx.save();
  ctx.fillStyle = `rgba(10, 7, 4, ${0.66 * fade})`;
  ctx.fillRect(0, 0, w, h);
  const im = photoImage(ph.key);
  const pw = w * (ph.size ?? 0.46);
  const ph_ = im ? pw * (im.naturalHeight / im.naturalWidth) : pw / 2.1;
  const padX = 16;
  const padTop = 16;
  const padBot = ph.caption ? 54 : 22;
  const cw = pw + padX * 2;
  const chh = ph_ + padTop + padBot;
  const settle = 1 - Math.pow(1 - fade, 3);
  const drift = 1 + 0.05 * Math.min(t / 9, 1);
  ctx.translate(w / 2, h * 0.4 + (1 - settle) * 26);
  ctx.rotate(ph.tilt ?? -0.025);
  ctx.scale(drift * (0.96 + 0.04 * settle), drift * (0.96 + 0.04 * settle));
  ctx.globalAlpha = fade;
  // the card, with a soft shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = '#f2ead6';
  ctx.fillRect(-cw / 2, -chh / 2, cw, chh);
  ctx.shadowColor = 'transparent';
  if (im) {
    ctx.drawImage(im, -pw / 2, -chh / 2 + padTop, pw, ph_);
  } else {
    ctx.fillStyle = '#bcb5a3';
    ctx.fillRect(-pw / 2, -chh / 2 + padTop, pw, ph_);
  }
  // a faint edge where the print has yellowed, then the caption in ink
  ctx.strokeStyle = 'rgba(90, 64, 30, 0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(-pw / 2, -chh / 2 + padTop, pw, ph_);
  if (ph.caption) {
    ctx.fillStyle = '#3b2f22';
    ctx.font = `italic 24px ${FONT_READ}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ph.caption, 0, chh / 2 - padBot / 2 + 2);
  }
  ctx.restore();
}

/** a little four-point glint (Dot's cheer, the stars round his head when he is dizzy) */
function glint(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, alpha: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#fff3b0';
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const rad = i % 2 ? r * 0.28 : r;
    const ang = (i * Math.PI) / 4;
    ctx.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Dot, painted from the redone sheets: he hovers (a four-frame flap, a bob and a slow figure-of-eight drift) or holds one of the reaction poses
 * (`D:yelp`, `D:cheer`... see DotPose). The old backdrop hummingbird stands in while the picture loads.
 */
function drawDot(ctx: CanvasRenderingContext2D, a: SceneActor, w: number, h: number, t: number, scroll = 0) {
  const pose = a.dotPose ?? 'hover';
  const hover = pose === 'hover';
  const drift = hover ? 7 : 3;
  const x = a.x * w + Math.sin(t * 1.7) * drift - scroll;
  const y = (a.y ?? 0.45) * h + Math.sin(t * 3.1) * (hover ? 6 : 3);
  const sc = a.scale ?? 1;
  const face = a.facing === -1 ? -1 : 1;
  if (drawDotStoryFrame(ctx, poseFrame(pose, t), x, y, 0.95 * sc, face, hover ? 0.05 + Math.sin(t * 1.3) * 0.04 : 0)) {
    if (pose === 'dizzy') {
      for (let i = 0; i < 3; i++) {
        const ang = t * 3 + (i * Math.PI * 2) / 3;
        glint(ctx, x + Math.cos(ang) * 46 * sc, y - 52 * sc + Math.sin(ang) * 11 * sc, 9 * sc, 0.9);
      }
    } else if (pose === 'cheer') {
      for (let i = 0; i < 3; i++) {
        const ph = (t * 1.6 + i / 3) % 1;
        glint(ctx, x + (i - 1) * 52 * sc, y - (46 + ph * 26) * sc, (7 + 5 * Math.sin(ph * Math.PI)) * sc, Math.sin(ph * Math.PI));
      }
    }
  }
  // (until her story paintings have loaded she is not drawn: no stand-in bird)
}

/** a soldier's height in scene units at scale 1: a head taller than Pokey, as he was in the garden */
const SOLDIER_H = 270;
/** one of the General's soldiers: his painted clip (idle loops back and forth, a turn plays once and holds), feet on the ground line */
function drawSoldierActor(ctx: CanvasRenderingContext2D, a: SceneActor, w: number, h: number, t: number, ground: number, scroll: number) {
  if (!SOLDIER_CLIPS.ready()) return;
  const clip = a.clip ?? 'idle_a';
  const seq = SOLDIER_SEQ[clip] ?? SOLDIER_SEQ.idle_a;
  const first = SOLDIER_ANIM[seq[0]];
  if (!first) return;
  const foot = footing(a, ground);
  const x = a.x * w - scroll;
  const y = foot.y * h + SINK;
  const k = ((SOLDIER_H * (a.scale ?? 1)) / first.h) * SOLDIER_ANIM_UP;
  const name = clip.startsWith('idle') || clip.startsWith('march') ? SOLDIER_CLIPS.ping(clip, t, 10) : SOLDIER_CLIPS.at(clip, Math.min(1, t / 1.2));
  drawContactShadow(ctx, x, ground * h + SINK, first.w * (k / SOLDIER_ANIM_UP) * 0.6, SOLDIER_H, 0);
  ctx.save();
  ctx.translate(x, y);
  // (his clips face right: mirrored to face left)
  if (a.facing === -1) ctx.scale(-1, 1);
  SOLDIER_CLIPS.draw(ctx, name, k);
  ctx.restore();
}

/** Flicker's height in scene units at scale 1 (a firefly: well under Dot's size) */
const FLICKER_H = 44;
/** the light's stutter, a second and a half around: when it is dark (his tell: he is not telling the whole truth) */
const STUTTER: readonly [number, number][] = [[0.0, 0.07], [0.14, 0.2], [0.62, 0.7], [0.76, 0.8]];
export function flickerLit(t: number, stutter: boolean): number {
  if (!stutter) return 1;
  const p = (t % 1.5) / 1.5;
  return STUTTER.some(([a, b]) => p >= a && p < b) ? 0.12 : 1;
}

function lightGlow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a: number) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(226, 255, 160, ${0.6 * a})`);
  g.addColorStop(0.4, `rgba(200, 255, 140, ${0.22 * a})`);
  g.addColorStop(1, 'rgba(200, 255, 140, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Flicker: his painted clip hovering in place, the warm halo of his light around him (stuttering when `stutter` is set) */
function drawFlickerActor(ctx: CanvasRenderingContext2D, a: SceneActor, w: number, h: number, t: number, scroll = 0) {
  const sc = a.scale ?? 1;
  const x = a.x * w + Math.sin(t * 1.3 + a.x * 5) * 4 * sc - scroll;
  const y = (a.y ?? 0.5) * h + Math.sin(t * 2.6) * 4 * sc;
  const face = a.facing === -1 ? -1 : 1;
  const lit = flickerLit(t, !!a.stutter);
  const clip = a.clip ?? 'blink';
  const glowR = (clip === 'glow' ? 120 : clip === 'doze' ? 60 : 92) * sc;
  lightGlow(ctx, x - face * 8 * sc, y + 6 * sc, glowR, (clip === 'doze' ? 0.45 : 0.8) * lit);
  ctx.save();
  ctx.globalAlpha *= 0.82 + 0.18 * lit;
  let drew = false;
  if (FLICKER_CLIPS.ready()) {
    ctx.translate(x, y);
    // (his clips face right: mirrored to face left)
    ctx.scale(face, 1);
    drew = FLICKER_CLIPS.draw(ctx, FLICKER_CLIPS.ping(clip, t, FLICKER_ANIM_FPS), (FLICKER_H * sc / FLICKER_ANIM_H) * FLICKER_ANIM_UP);
  }
  ctx.restore();
  if (!drew) {
    ctx.fillStyle = '#6b4320';
    ctx.beginPath();
    ctx.arc(x, y, 9 * sc, 0, Math.PI * 2);
    ctx.fill();
  }
  // the bright point of his tail
  lightGlow(ctx, x - face * 10 * sc, y + 8 * sc, 18 * sc, lit);
}

/**
 * A figure painted on Matt's story sheets (storyCels.ts): the frame the pose timeline names, its feet on the ground line (hovering when placed above it), a contact shadow,
 * a slow breath. Nothing is drawn while its atlas is still loading, which the draw itself starts.
 */
/** how tall (scene units) the melting bottom of the tallest bust in the picture is, over every frame it plays (0: no bust) */
function bustBand(scene: StoryScene): number {
  let m = 0;
  for (const a of scene.actors) {
    if (a.kind !== 'cel' || !a.seq) continue;
    for (const key of a.seq) {
      for (const f of Array.isArray(key.frame) ? key.frame : key.frame ? [key.frame] : []) {
        const c = CELS[f];
        if (c?.c === 'b') m = Math.max(m, (0.2 * (c.h - 2 * c.m) * CEL_K * (a.scale ?? 1) * (key.sc ?? 1)) / CEL_HD);
      }
    }
  }
  return m;
}

function drawCelActor(ctx: CanvasRenderingContext2D, a: SceneActor, w: number, h: number, t: number, ground: number, scroll: number) {
  if (!a.seq || !a.seq.length) return;
  const pose = poseAt(a.seq, t);
  const c = CELS[pose.frame];
  if (!c) return;
  const foot = footing(a, ground);
  const x = (a.x + pose.dx) * w - scroll;
  const feetY = (foot.y + pose.dy) * h + (foot.hover ? 0 : SINK);
  const groundY = ground * h + SINK;
  const k = CEL_K * (a.scale ?? 1) * pose.sc;
  const face = (a.facing === -1 ? -1 : 1) * (pose.flip ? -1 : 1) as 1 | -1;
  const bust = c.c === 'b';
  // (the frame's own size, in px of the old sheets: the page holds it CEL_HD times bigger, grown by m)
  const ow = (c.w - 2 * c.m) / CEL_HD;
  const oh = (c.h - 2 * c.m) / CEL_HD;
  if (c.c !== 'raw' && !bust) drawContactShadow(ctx, x, groundY, ow * k * 0.6, oh * k, Math.max(0, groundY - feetY));
  ctx.save();
  ctx.translate(x, feetY);
  ctx.rotate(pose.rot * face);
  // a face bust breathes a little
  if (bust) ctx.translate(0, Math.sin(t * 2.4) * 2);
  else if (c.c !== 'raw') ctx.scale(1, 1 + Math.sin(t * 1.9 + (a.x * 7)) * 0.006);
  if (pose.under && pose.mix !== undefined && CELS[pose.under]) {
    // a dissolve: the old frame stays whole underneath while the new one comes up over it
    drawCel(ctx, pose.under, 0, 0, k, face);
    drawCel(ctx, pose.frame, 0, 0, k, face, pose.mix);
  } else drawCel(ctx, pose.frame, 0, 0, k, face);
  ctx.restore();
}

function drawActor(ctx: CanvasRenderingContext2D, a: SceneActor, w: number, h: number, t: number, ground: number, scroll: number) {
  if (a.kind === 'dot') { drawDot(ctx, a, w, h, t, scroll); return; }
  if (a.kind === 'flicker') { drawFlickerActor(ctx, a, w, h, t, scroll); return; }
  if (a.kind === 'soldier') { drawSoldierActor(ctx, a, w, h, t, ground, scroll); return; }
  if (a.kind === 'cel') { drawCelActor(ctx, a, w, h, t, ground, scroll); return; }
  // Pokey and Meeca: the painted characters, one engine (moods, moves, ground, shadow)
  if (a.kind === 'milo' && a.portrait) { drawPortrait(ctx, a, w, h, t, ground, scroll); return; }
  // (only their paintings: until those have loaded the picture goes without them, never the old drawn stand-ins)
  if (a.kind === 'milo') { drawCharacter(ctx, a, POKEY, w, h, t, ground, scroll, 'idle'); return; }
  if (a.kind === 'daisy' || a.kind === 'daisy_wave') { drawCharacter(ctx, a, MEECA, w, h, t, ground, scroll, a.kind === 'daisy_wave' ? 'scaredwave' : 'happy'); return; }
  if (a.kind === 'boss' && a.seq && drawBossPerformer(ctx, a, w, h, t, ground, scroll)) return;
  const foot = footing(a, ground);
  const dx = actorDx(a, t, w);
  const feetY = foot.y * h + (foot.hover || !GROUNDED.has(a.kind) ? 0 : SINK);
  const x = (a.x + dx) * w - scroll;
  const s = (a.scale ?? 1) * 3.0;
  const face = a.facing === -1 ? -1 : 1;
  ctx.save();
  ctx.translate(x, feetY);
  switch (a.kind) {
    case 'thornbark': {
      // the corrupted guardian; once freed he is the gentle Jungle Guardian again
      if (face === -1) ctx.scale(-1, 1);
      ctx.save();
      ctx.scale(s * 0.62, s * 0.62);
      // the painted sloth warlord: roaring while the thorns have him, resting on his club once he is free
      const shown = thornbarkSprite.still(ctx, a.beaten ? 'rest' : a.angry ? 'roar' : 'march1');
      ctx.restore();
      if (!shown) {
        ctx.scale(s * 1.3, s * 1.3);
        const p = makePlayer(a.angry ? 'punch' : 'idle', 1);
        drawMilo(ctx, a.beaten ? 5 : 7, p, t);
      }
      break;
    }
    case 'boss': {
      ctx.scale(s * 0.62, s * 0.62);
      if (face === -1) ctx.scale(-1, 1);
      if (a.beaten && a.world !== 10) {
        ctx.rotate(-0.1);
        ctx.globalAlpha = 0.92;
      }
      // a painted boss shows its painted self on the card (feet on the ground line, drawn at the same size as the vector one)
      const paintedCard = (c: CanvasRenderingContext2D) => {
        c.translate(0, 24);
        c.scale(1.3, 1.3);
        // the General in a story is the grieving grandfather in his greatcoat (the story cels), not the stage's war-look sprite; his cards
        // were painted from that sprite's frames, at its scale (0.72 world units to its pixel)
        if (a.world === 10) return drawCel(c, `gn.card_${a.beaten ? 'fallen' : a.angry ? 'roar' : 'idle'}`, 0, 0, 0.72, 1);
        return drawPaintedCardBoss(c, a.world ?? 1, !!a.angry, !!a.beaten);
      };
      // (only the painted guardian, never the old drawn stand-in: on a slow phone that showed the General as a tin robot; until the
      // painting has loaded the picture goes without him)
      if (a.silhouette) {
        drawSilhouette(ctx, (c) => {
          c.save();
          paintedCard(c);
          c.restore();
        });
      } else {
        ctx.save();
        paintedCard(ctx);
        ctx.restore();
      }
      if (a.beaten && a.world !== 10) {
        ctx.globalAlpha = 1;
        // two dizzy sparkles over the beaten guardian (not over the General: his fall in the courtyard is no joke): drawn four-point stars, gold with a darker rim
        for (const [sx, sy, sr] of [[-10, -105 + Math.sin(t * 3) * 3, 11], [24, -92 + Math.cos(t * 3) * 3, 9]] as const) {
          ctx.beginPath();
          for (let k = 0; k < 8; k++) {
            const rr = k % 2 === 0 ? sr : sr * 0.38;
            const ang = (k * Math.PI) / 4 - Math.PI / 2;
            if (k === 0) ctx.moveTo(sx + Math.cos(ang) * rr, sy + Math.sin(ang) * rr);
            else ctx.lineTo(sx + Math.cos(ang) * rr, sy + Math.sin(ang) * rr);
          }
          ctx.closePath();
          ctx.fillStyle = '#fde047';
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 2;
          ctx.lineJoin = 'round';
          ctx.fill();
          ctx.stroke();
        }
      }
      break;
    }
    case 'bloom':
      drawBloom(ctx, 0, 0, (a.scale ?? 1) * 1.6, t, a.stage);
      break;
  }
  ctx.restore();
}


function bolt(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, seed: number) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  let cx = x;
  let cy = y;
  for (let i = 0; i < 7; i++) {
    cx += Math.sin(seed * 3 + i * 1.7) * 26;
    cy += len / 7;
    ctx.lineTo(cx, cy);
  }
  ctx.stroke();
}

function drawFortress(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, warm: boolean) {
  const baseY = h * 0.8;
  const tower = (x: number, tw: number, th: number, roof: boolean) => {
    const g = ctx.createLinearGradient(0, baseY - th, 0, baseY);
    g.addColorStop(0, warm ? '#8c7a8f' : '#3a3f58');
    g.addColorStop(1, warm ? '#4f4458' : '#1b1e30');
    ctx.fillStyle = g;
    ctx.fillRect(x, baseY - th, tw, th);
    // crenellations
    for (let i = 0; i < tw; i += tw / 5) {
      ctx.fillRect(x + i, baseY - th - 9, tw / 9, 9);
    }
    if (roof) {
      ctx.fillStyle = warm ? '#7a3a4a' : '#2a1626';
      ctx.beginPath();
      ctx.moveTo(x - 6, baseY - th);
      ctx.lineTo(x + tw / 2, baseY - th - tw * 0.9);
      ctx.lineTo(x + tw + 6, baseY - th);
      ctx.closePath();
      ctx.fill();
      // banner
      ctx.strokeStyle = '#7a7f98';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + tw / 2, baseY - th - tw * 0.9);
      ctx.lineTo(x + tw / 2, baseY - th - tw * 0.9 - 24);
      ctx.stroke();
      ctx.fillStyle = '#c1272d';
      const fl = Math.sin(t * 4 + x) * 3;
      ctx.beginPath();
      ctx.moveTo(x + tw / 2, baseY - th - tw * 0.9 - 24);
      ctx.lineTo(x + tw / 2 + 24, baseY - th - tw * 0.9 - 19 + fl);
      ctx.lineTo(x + tw / 2, baseY - th - tw * 0.9 - 12);
      ctx.fill();
    }
    // glowing windows
    ctx.fillStyle = warm ? 'rgba(255, 220, 150, 0.9)' : 'rgba(255, 170, 70, 0.95)';
    for (let r = 0; r < Math.floor(th / 60); r++) {
      ctx.fillRect(x + tw / 2 - 4, baseY - th + 24 + r * 54, 8, 16);
    }
  };
  tower(w * 0.58, 90, 250, true);
  tower(w * 0.7, 120, 330, true);
  tower(w * 0.84, 80, 220, true);
  ctx.fillStyle = warm ? '#5c5066' : '#23263a';
  ctx.fillRect(w * 0.6, baseY - 120, w * 0.3, 120);
  // gate
  ctx.fillStyle = '#0c0c16';
  ctx.beginPath();
  ctx.moveTo(w * 0.72, baseY);
  ctx.lineTo(w * 0.72, baseY - 56);
  ctx.quadraticCurveTo(w * 0.745, baseY - 86, w * 0.77, baseY - 56);
  ctx.lineTo(w * 0.77, baseY);
  ctx.fill();
}

function drawSetPiece(ctx: CanvasRenderingContext2D, world: number, mood: StoryScene['mood'], w: number, h: number, t: number, castle?: number, top = 0) {
  ctx.save();
  switch (world) {
    case 10: {
      // the painted castle fills the picture when it is loaded; the drawn storm clouds and fortress are the fallback and the classic look
      if (drawCastleBackdrop(ctx, castle ?? FORTRESS_CASTLE, w, h, t, top)) {
        if (mood === 'storm') {
          const ph = (t % 5) / 5;
          if (ph < 0.1) {
            ctx.strokeStyle = `rgba(235, 240, 255, ${1 - ph * 10})`;
            ctx.lineWidth = 4;
            bolt(ctx, w * 0.62, 0, h * 0.55, Math.floor(t / 5));
          }
        }
        break;
      }
      // storm clouds + fortress + lightning
      const cg = ctx.createLinearGradient(0, 0, 0, h * 0.5);
      cg.addColorStop(0, mood === 'glow' ? 'rgba(255, 190, 150, 0.7)' : 'rgba(25, 20, 50, 0.9)');
      cg.addColorStop(1, 'rgba(25, 20, 50, 0)');
      ctx.fillStyle = cg;
      ctx.fillRect(0, 0, w, h * 0.5);
      for (let i = 0; i < 9; i++) {
        ctx.fillStyle = mood === 'glow' ? 'rgba(255, 215, 200, 0.55)' : 'rgba(35, 28, 66, 0.85)';
        ctx.beginPath();
        ctx.ellipse((i / 8) * w + Math.sin(t * 0.3 + i) * 12, 40 + (i % 3) * 34, 130, 46, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      drawFortress(ctx, w, h, t, mood === 'glow');
      if (mood === 'storm') {
        const ph = (t % 5) / 5;
        if (ph < 0.1) {
          ctx.strokeStyle = `rgba(235, 240, 255, ${1 - ph * 10})`;
          ctx.lineWidth = 4;
          bolt(ctx, w * 0.62, 0, h * 0.55, Math.floor(t / 5));
        }
      }
      break;
    }
    case 7: {
      // ancient temple gate with a glowing rune
      const gx = w * 0.68;
      const gy = h * 0.8;
      ctx.fillStyle = '#6b7a69';
      ctx.fillRect(gx - 150, gy - 280, 56, 280);
      ctx.fillRect(gx + 94, gy - 280, 56, 280);
      ctx.fillRect(gx - 170, gy - 310, 340, 40);
      ctx.fillStyle = '#4e5c4e';
      ctx.fillRect(gx - 90, gy - 240, 180, 240);
      const gl = 0.55 + Math.sin(t * 2.4) * 0.25;
      const rg = ctx.createRadialGradient(gx, gy - 130, 4, gx, gy - 130, 110);
      rg.addColorStop(0, `rgba(255, 190, 90, ${gl})`);
      rg.addColorStop(1, 'rgba(255, 190, 90, 0)');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(gx, gy - 130, 110, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 220, 140, ${0.6 + gl * 0.4})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(gx, gy - 130, 30, 0, Math.PI * 2);
      ctx.moveTo(gx - 44, gy - 130);
      ctx.lineTo(gx + 44, gy - 130);
      ctx.moveTo(gx, gy - 174);
      ctx.lineTo(gx, gy - 86);
      ctx.stroke();
      ctx.fillStyle = 'rgba(100, 190, 80, 0.85)';
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.ellipse(gx - 160 + i * 64, gy - 308, 30, 10, 0, Math.PI, 0);
        ctx.fill();
      }
      break;
    }
    case 8: {
      // huge moon
      const mx = w * 0.78;
      const my = h * 0.2;
      const mg = ctx.createRadialGradient(mx, my, 20, mx, my, 220);
      mg.addColorStop(0, 'rgba(230, 235, 255, 0.55)');
      mg.addColorStop(1, 'rgba(230, 235, 255, 0)');
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.arc(mx, my, 220, 0, Math.PI * 2);
      ctx.fill();
      const md = ctx.createRadialGradient(mx - 14, my - 14, 6, mx, my, 70);
      md.addColorStop(0, '#fffff0');
      md.addColorStop(1, '#cfd6ee');
      ctx.fillStyle = md;
      ctx.beginPath();
      ctx.arc(mx, my, 66, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(150, 160, 200, 0.35)';
      [[-20, -8, 12], [14, 16, 9], [8, -26, 7]].forEach(([dx, dy, r]) => {
        ctx.beginPath();
        ctx.arc(mx + dx, my + dy, r, 0, Math.PI * 2);
        ctx.fill();
      });
      for (let i = 0; i < 26; i++) {
        const fx = ((Math.sin(i * 12.9) * 0.5 + 0.5) * w + Math.sin(t * 0.6 + i) * 18) % w;
        const fy = h * 0.25 + (Math.cos(i * 7.7) * 0.5 + 0.5) * h * 0.5;
        const a = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.3 + i));
        ctx.fillStyle = `rgba(210, 255, 120, ${a})`;
        ctx.shadowColor = '#d2ff78';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(fx, fy, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 9: {
      // volcano + lava glow
      const vx = w * 0.72;
      ctx.fillStyle = '#2a1410';
      ctx.beginPath();
      ctx.moveTo(vx - 260, h * 0.8);
      ctx.lineTo(vx - 50, h * 0.3);
      ctx.lineTo(vx + 50, h * 0.3);
      ctx.lineTo(vx + 260, h * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ff7a1e';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      [[-30, 0, -80, 0.7], [20, 0, 60, 0.75], [0, 0, -10, 0.78]].forEach(([a, , c, e]) => {
        ctx.beginPath();
        ctx.moveTo(vx + a, h * 0.31);
        ctx.quadraticCurveTo(vx + (a + c) / 2, h * 0.5, vx + c * 1.6, h * e);
        ctx.stroke();
      });
      const lg = ctx.createRadialGradient(vx, h * 0.3, 10, vx, h * 0.3, 220);
      lg.addColorStop(0, 'rgba(255, 160, 40, 0.7)');
      lg.addColorStop(1, 'rgba(255, 90, 20, 0)');
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.arc(vx, h * 0.3, 220, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = `rgba(60, 40, 40, ${0.5 - i * 0.06})`;
        ctx.beginPath();
        ctx.arc(vx + Math.sin(t + i) * 20, h * 0.28 - i * 30 - (t * 10) % 30, 26 + i * 8, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 4: {
      // great waterfall
      const wx = w * 0.7;
      const wg = ctx.createLinearGradient(0, 0, 0, h * 0.8);
      wg.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      wg.addColorStop(1, 'rgba(200, 235, 255, 0.55)');
      ctx.fillStyle = wg;
      ctx.beginPath();
      ctx.moveTo(wx - 70, 0);
      ctx.lineTo(wx + 70, 0);
      ctx.lineTo(wx + 100, h * 0.8);
      ctx.lineTo(wx - 100, h * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 9; i++) {
        const sx = wx - 60 + i * 15;
        const off = (t * 220 + i * 70) % 160;
        ctx.beginPath();
        ctx.moveTo(sx, off);
        ctx.lineTo(sx + 2, off + 90);
        ctx.stroke();
      }
      const mist = ctx.createRadialGradient(wx, h * 0.8, 10, wx, h * 0.8, 200);
      mist.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      mist.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = mist;
      ctx.fillRect(wx - 220, h * 0.5, 440, h * 0.4);
      break;
    }
    case 5: {
      // giant orchid-draped spider webs (hung from the top of the view: upright, the old top is mid-screen, and its straight strand showed)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 1.6;
      [[0.04, 0], [0.96, 0]].forEach(([cx, cy], k) => {
        const ox = cx * w;
        const oy = cy * h - top;
        const dir = k ? -1 : 1;
        for (let r = 1; r <= 6; r++) {
          ctx.beginPath();
          ctx.arc(ox, oy, r * 70, dir > 0 ? 0 : Math.PI / 2, dir > 0 ? Math.PI / 2 : Math.PI);
          ctx.stroke();
        }
        for (let a = 0; a <= 6; a++) {
          const ang = (a / 6) * (Math.PI / 2) + (dir > 0 ? 0 : Math.PI / 2);
          ctx.beginPath();
          ctx.moveTo(ox, oy);
          ctx.lineTo(ox + Math.cos(ang) * 420, oy + Math.sin(ang) * 420);
          ctx.stroke();
        }
        ctx.fillStyle = 'rgba(200, 240, 255, 0.85)';
        for (let d = 0; d < 7; d++) {
          ctx.beginPath();
          ctx.arc(ox + dir * (60 + d * 48), oy + 30 + (d % 3) * 40, 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      break;
    }
    case 6: {
      // hanging mangrove roots + still water
      ctx.strokeStyle = '#3b2a1a';
      ctx.lineCap = 'round';
      for (let i = 0; i < 26; i++) {
        const rx = (i / 25) * w;
        const len = 80 + ((i * 53) % 140);
        ctx.lineWidth = 3 + (i % 3) * 1.5;
        ctx.beginPath();
        ctx.moveTo(rx, 0);
        ctx.quadraticCurveTo(rx + Math.sin(t * 0.8 + i) * 8, len * 0.5, rx + Math.sin(i) * 10, len);
        ctx.stroke();
      }
      const wg = ctx.createLinearGradient(0, h * 0.66, 0, h * 0.8);
      wg.addColorStop(0, 'rgba(70, 120, 90, 0.0)');
      wg.addColorStop(1, 'rgba(70, 120, 90, 0.6)');
      ctx.fillStyle = wg;
      ctx.fillRect(0, h * 0.66, w, h * 0.14);
      break;
    }
    case 3: {
      // limestone sinkhole cave: stalagmites rising from the floor and glowworm threads hanging from the roof
      const floorY = h * 0.8;
      [[0.06, 120, 46], [0.16, 70, 30], [0.84, 150, 52], [0.95, 90, 34], [0.58, 46, 22]].forEach(([px, ph, pw]) => {
        const x = (px as number) * w;
        const hh = ph as number;
        const ww = pw as number;
        const g = ctx.createLinearGradient(x - ww, 0, x + ww, 0);
        g.addColorStop(0, '#6f8c8a');
        g.addColorStop(1, '#1d3a40');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x - ww, floorY + 8);
        ctx.quadraticCurveTo(x - ww * 0.35, floorY - hh * 0.6, x, floorY - hh);
        ctx.quadraticCurveTo(x + ww * 0.35, floorY - hh * 0.6, x + ww, floorY + 8);
        ctx.fill();
      });
      for (let i = 0; i < 30; i++) {
        const x = ((i * 0.6180339) % 1) * w;
        const len = 40 + ((i * 67) % 150);
        ctx.strokeStyle = 'rgba(190, 240, 230, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, len);
        ctx.stroke();
        for (let y = 12 + (i % 5); y < len; y += 10 + (i % 4) * 3) {
          const tw = 0.5 + 0.5 * Math.sin(t * 1.4 + i * 1.7 + y * 0.2);
          const gg = ctx.createRadialGradient(x, y, 0, x, y, 7);
          gg.addColorStop(0, `rgba(125, 255, 224, ${0.35 + 0.4 * tw})`);
          gg.addColorStop(1, 'rgba(125, 255, 224, 0)');
          ctx.fillStyle = gg;
          ctx.fillRect(x - 7, y - 7, 14, 14);
        }
      }
      break;
    }
    case 2: {
      // river with stepping stones
      const wg = ctx.createLinearGradient(0, h * 0.58, 0, h * 0.8);
      wg.addColorStop(0, 'rgba(120, 225, 235, 0.5)');
      wg.addColorStop(1, 'rgba(30, 150, 190, 0.7)');
      ctx.fillStyle = wg;
      ctx.fillRect(0, h * 0.58, w, h * 0.22);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 12; i++) {
        const rx = (i / 12) * w + ((t * 24 + i * 40) % 80);
        ctx.beginPath();
        ctx.ellipse(rx % w, h * 0.62 + (i % 4) * 14, 26, 4, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = '#7d8a85';
      [[0.08, 24], [0.4, 18], [0.58, 28], [0.92, 20]].forEach(([sx, sr]) => {
        ctx.beginPath();
        ctx.ellipse(sx * w, h * 0.74, sr * 1.7, sr, 0, Math.PI, 0);
        ctx.fill();
      });
      break;
    }
    default: {
      // Emerald Canopy: warm sun shafts (from the top of the view, upright too)
      ctx.translate(0, -top);
      h += top;
      for (let i = 0; i < 4; i++) {
        const sx = w * (0.15 + i * 0.22);
        const g = ctx.createLinearGradient(sx, 0, sx + 80, h);
        g.addColorStop(0, 'rgba(255, 245, 190, 0.28)');
        g.addColorStop(1, 'rgba(255, 245, 190, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx + 60, 0);
        ctx.lineTo(sx + 200, h);
        ctx.lineTo(sx + 60, h);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
  }
  ctx.restore();
}

let grainCanvas: HTMLCanvasElement | null = null;
function getGrain(): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  if (!grainCanvas) {
    grainCanvas = document.createElement('canvas');
    grainCanvas.width = 256;
    grainCanvas.height = 256;
    const g = grainCanvas.getContext('2d')!;
    const img = g.createImageData(256, 256);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 110 + Math.floor(Math.random() * 90);
      img.data[i] = v;
      img.data[i + 1] = v - 6;
      img.data[i + 2] = v - 18;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }
  return grainCanvas;
}

/** the frame, shrunk, for a cheap soft glow (a blurred copy without paying for ctx.filter every frame) */
let glowCanvas: HTMLCanvasElement | null = null;

/** Storybook "painted" finish: soft bloom, warm grade, paper grain and vignette. */
function paintFinish(ctx: CanvasRenderingContext2D, w: number, h: number, mood: StoryScene['mood']) {
  const cv = ctx.canvas;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (typeof document !== 'undefined') {
    if (!glowCanvas) glowCanvas = document.createElement('canvas');
    const gw = Math.max(8, Math.round(cv.width / 6));
    const gh = Math.max(8, Math.round(cv.height / 6));
    if (glowCanvas.width !== gw || glowCanvas.height !== gh) {
      glowCanvas.width = gw;
      glowCanvas.height = gh;
    }
    const g = glowCanvas.getContext('2d')!;
    g.globalCompositeOperation = 'copy';
    g.drawImage(cv, 0, 0, gw, gh);
    // only the highlights glow (ST-1: a 0.34 bloom of the whole picture washed every scene out): the small copy multiplied by itself,
    // twice over, is its brightness to the fourth, so mid-tones fall away (0.5 to 0.06) and the lights stay (0.9 to 0.66)
    g.globalCompositeOperation = 'multiply';
    g.drawImage(glowCanvas, 0, 0);
    g.drawImage(glowCanvas, 0, 0);
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = mood === 'storm' || mood === 'night' ? 0.15 : 0.2;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(glowCanvas, 0, 0, cv.width, cv.height);
  }
  ctx.restore();
  ctx.save();
  ctx.filter = 'none';
  // warm grade
  const grade = ctx.createLinearGradient(0, 0, 0, h);
  grade.addColorStop(0, 'rgba(255, 210, 160, 0.08)');
  grade.addColorStop(1, 'rgba(90, 40, 90, 0.12)');
  ctx.fillStyle = grade;
  ctx.fillRect(0, 0, w, h);
  // paper grain
  const grain = getGrain();
  if (grain) {
    const pat = ctx.createPattern(grain, 'repeat');
    if (pat) {
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, w, h);
    }
  }
  ctx.restore();
}

/** the set piece (the trees, the castle) goes by at a slower speed than the branch; tiles are laid side by side, every other one turned over so the seams match */
function drawSetPieceScrolled(ctx: CanvasRenderingContext2D, world: number, mood: StoryScene['mood'], w: number, h: number, t: number, castle: number | undefined, scroll: number, top = 0) {
  if (Math.abs(scroll) < 0.5) {
    drawSetPiece(ctx, world, mood, w, h, t, castle, top);
    return;
  }
  const shift = scroll * 0.4;
  const i0 = Math.floor(shift / w);
  for (let i = i0; i <= i0 + 1; i++) {
    ctx.save();
    ctx.translate(i * w - shift, 0);
    if (i & 1) {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.beginPath();
    ctx.rect(0, -top, w, h + top);
    ctx.clip();
    drawSetPiece(ctx, world, mood, w, h, t, castle, top);
    ctx.restore();
  }
}

/** the ten guardians as silhouettes: the front row on the branch, the back row on a misty ledge behind it, each with its shadow */
function drawLineup(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, ground: number) {
  const back = h * (ground - 0.28);
  // the far ledge the back row stands on: a band of mist that fades into the picture above and below
  const mist = ctx.createLinearGradient(0, back - h * 0.06, 0, back + h * 0.1);
  mist.addColorStop(0, 'rgba(40, 48, 72, 0)');
  mist.addColorStop(0.4, 'rgba(40, 48, 72, 0.38)');
  mist.addColorStop(1, 'rgba(40, 48, 72, 0)');
  ctx.fillStyle = mist;
  ctx.fillRect(0, back - h * 0.06, w, h * 0.16);
  for (let i = 0; i < 10; i++) {
    const row = i < 5 ? 0 : 1;
    const col = i % 5;
    const bx = (0.14 + col * 0.18 + (row ? 0.09 : 0)) * w;
    const by = row ? h * ground - h * 0.02 : back;
    const ls = row ? 1.0 : 0.8;
    drawContactShadow(ctx, bx, by, 150 * ls, 150 * ls, 0);
    ctx.save();
    ctx.translate(bx, by);
    ctx.scale(ls, ls);
    if (i % 5 > 1) ctx.scale(-1, 1);
    drawSilhouette(ctx, (c) => {
      c.translate(0, 24);
      c.scale(1.3, 1.3);
      if (i === 9) drawCel(c, 'gn.card_idle', 0, 0, 0.72, 1);
      else drawPaintedCardBoss(c, i + 1, false, false);
    }, 0.9, i === 9 ? '#2a0a14' : '#0b1024');
    ctx.restore();
  }
}

/** the backdrops are the stages' own scenery, baked at a lower resolution than play (it is only ever seen through a soft finish) */
const STORY_BAKE = 0.55;

/**
 * Draw one story picture into a w x h scene space (the canvas is expected to be scaled to it). `lift` raises the
 * whole picture by at least that fraction of the height, and more if need be so the ground sits above `feetMax` of
 * the view: a dialogue bar over the bottom of the screen hides scenery instead of the characters' feet. `top` is the room an upright
 * phone shows above the scene (scene units above y = 0, the canvas already moved down by it): the plates are painted tall enough to
 * fill it and the backdrops are laid over the whole height, so the picture fills the screen instead of a band across its middle.
 */
export function drawStoryScene(ctx: CanvasRenderingContext2D, scene: StoryScene, t: number, w = SCENE_W, h = SCENE_H, lift = 0, feetMax = 1, top = 0) {
  ctx.save();
  const vh = h + top;
  ctx.clearRect(0, -top, w, vh);
  // camera: close-up zoom with a slow push-in
  const cam = scene.camera ? cameraAt(scene.camera, t) : null;
  const big = scene.actors.reduce((m, a) => Math.max(m, a.scale ?? 1), 1);
  const z = capStoryZoom(cam ? cam.zoom : (scene.zoom ?? 1) * (1 + 0.04 * Math.min(t / 9, 1)), devScale(ctx), big);
  const fx = Math.min(w - w / (2 * z), Math.max(w / (2 * z), (cam ? cam.fx : scene.focusX ?? 0.5) * w));
  // (upright the view is taller than the scene: it stands on the scene's bottom edge and the room above shows the painting's top)
  const fy = Math.min(h - vh / (2 * z), Math.max(-top + vh / (2 * z), (cam ? cam.fy : scene.focusY ?? 0.62) * h));
  // (the feet: where the ground lands in the view through this camera, raised clear of the words box; but a figure painted cut off
  // below the chest, a bust, melts away over its bottom fifth, and that melt must stay behind the box, not stand see-through over the
  // picture: then the ground goes as far under the box top as the melt is tall)
  const band = feetMax < 0.9 ? bustBand(scene) : 0;
  lift = liftForFeet((groundOf(scene) * h - fy) * z + vh / 2, vh, band ? feetMax + 0.06 + (band * z) / vh : feetMax, lift);
  ctx.translate(0, -lift * vh);
  const [shx, shy] = shakeAt(scene.fx, t);
  ctx.translate(shx, shy);
  ctx.translate(w / 2, -top + vh / 2);
  ctx.scale(z, z);
  ctx.translate(-fx, -fy);
  // the camera follows an actor that travels: the world goes by at the speed it walks (sky and hills at their own, slower, speeds)
  const ground = groundOf(scene);
  const scroll = followScroll(scene.follow, scene.actors, t, w);
  // the sky and hills drift slowly behind the actors
  const camX = (scene.camX ?? 400) + t * 9 + scroll;
  const plated = !!scene.plate;
  plateMap = null;
  if (plated) {
    drawPlate(ctx, scene.plate as string, w, h, lift, t, top);
  } else {
    ctx.save();
    ctx.translate(0, -top);
    withBakeScale(STORY_BAKE, () => renderScenery(ctx, scene.world, camX, 0, w, vh * (1 + lift) + 4, t, true));
    ctx.restore();
    drawSetPieceScrolled(ctx, scene.world, scene.mood, w, h, t, scene.castle, scroll, top);
  }

  if (scene.lineup) {
    drawGround(ctx, scene, h * ground, w, h, scroll, lift);
    drawLineup(ctx, w, h, t, ground);
  } else {
    if (!plated) drawGround(ctx, scene, h * ground, w, h, scroll, lift);
    drawFigures(ctx, scene, (c) => scene.actors.forEach((a) => drawActor(c, pin(a, w, h), w, h, t, ground, scroll)));
  }

  drawFx(ctx, scene.fx, t, w, h);
  ctx.save();
  ctx.translate(0, -top);
  drawParticles(ctx, scene.particles, w, vh, t);
  drawMood(ctx, scene.mood, w, vh, t, !!scene.plate && isPlate(scene.plate));
  if (!plated) withBakeScale(STORY_BAKE, () => renderOverlay(ctx, scene.world, camX, w, vh * (1 + lift) + 4, t, true));
  ctx.restore();
  ctx.restore();
  ctx.save();
  ctx.translate(0, -top);
  if (scene.memory) drawMemoryWash(ctx, w, vh, t);
  if (scene.photo) drawPhotoCard(ctx, scene.photo, w, vh, t);
  if (scene.card) drawEndCard(ctx, scene.card, w, vh, feetMax, t);
  paintFinish(ctx, w, vh, scene.mood);
  // cinematic vignette
  const vg = ctx.createRadialGradient(w / 2, vh / 2, Math.min(w, vh) * 0.45, w / 2, vh / 2, Math.max(w, vh) * 0.7);
  vg.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vg.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, vh);
  const fl = flashAt(scene.fx, t);
  if (fl > 0) {
    ctx.fillStyle = `rgba(255,250,235,${fl})`;
    ctx.fillRect(0, 0, w, vh);
  }
  ctx.restore();
}
