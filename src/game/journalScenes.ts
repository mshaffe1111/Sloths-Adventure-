/**
 * journalScenes — the little looping scenes on the pages of Pokey's Journal (movesJournal.ts), drawn with the game's own pieces: the
 * real Pokey (drawHeroDemo, his own animation memory), the painted World 1 kit, the creatures' sprites, the pick-ups, the glide leaf
 * and, for the boss page, Venom Fang's rig doing his sweep.
 *
 * A scene is drawn in game units: a view 300 wide and 187.5 high (the demo box is 16:10), the floor at y = 160, so Pokey is the size he
 * is in a stage relative to everything around him. The component (JournalDemo.tsx) scales it to the box.
 */
import type { Collectible, Enemy, Platform, PlayerState } from './types.ts';
import type { BossEntity } from './types.ts';
import type { DemoId } from './movesJournal.ts';
import { demoPlayer } from './miloVariants.ts';
import { drawHeroDemo } from './heroSprite.ts';
import { drawBankArt, drawBranchArt, drawBushArt, drawKitPiece, drawLogArt, drawSwingLianaArt } from './protoArt.ts';
import { VINE_HANG } from './heroVine.ts';
import { drawRopeAlong } from './ropeArt.ts';
import { HANG_DROP } from './rope.ts';
import { drawGoldSnake } from './goldSnake.ts';
import { drawSnakeSprite } from './snakeSprite.ts';
import { drawTreeSnake, drawHarpyEagle, drawHazardEntity } from './creatures.ts';
import { drawEagleSprite } from './eagleSprite.ts';
import { drawSpiderSprite } from './spiderSprite.ts';
import { drawBoaSprite } from './boaSprite.ts';
import { drawBoa } from './predators.ts';
import { drawCollectible } from './vectorArt.ts';
import { drawGlideLeaf } from './glide.ts';
import { drawGlideSprite } from './leafSprites.ts';
import { venomRig } from './venomRig.ts';
import { newBrain } from './bossAI.ts';
import { trackAtlas } from './atlasLoader.ts';

export const SCENE_W = 300;
export const SCENE_H = 187.5;
const FLOOR = 160;
const TAU = Math.PI * 2;

/** how long each scene runs before it starts again (s) */
export const SCENE_LEN: Record<DemoId, number> = {
  run: 3, jump: 2.6, double: 3, duck: 3.2, gap: 2.8, glide: 3.6,
  punch: 2.4, kick: 2.4, mega: 3, stomp: 2.8, nostomp: 2.4, bird: 3.2, big: 3, boss: 5.2,
  climb: 3.2, swing: 3.2, bounce: 2.2, shimmy: 3.6,
  hide: 4.2, sleepers: 3.4,
  water: 3.2, crumble: 3.2, moving: 4, collapse: 3, drops: 3.4,
  shrine: 3, goals: 3.6, heart: 2.6, power: 2.8, flag: 3, cage: 3.2, finds: 3, ferns: 3.6,
};

// ───────────── the backdrop ─────────────

const BG_URL = new URL('../assets/backdrops/w1c-mid.webp', import.meta.url).href;
let bg: HTMLImageElement | null = null;
let bgReady = false;
function backdrop(ctx: CanvasRenderingContext2D) {
  if (!bg && typeof Image !== 'undefined') {
    bg = new Image();
    trackAtlas(bg, BG_URL, () => { bgReady = true; }, () => { bg = null; });
  }
  const g = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  g.addColorStop(0, '#2f5a3a');
  g.addColorStop(1, '#173323');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  const soft = softBackdrop();
  if (soft) ctx.drawImage(soft, 0, 0, SCENE_W, SCENE_H);
}

/** a slice of the World 1 canopy painting, softened and dimmed so its trunks stay behind the action (made once, then reused) */
let softBg: HTMLCanvasElement | null = null;
function softBackdrop(): HTMLCanvasElement | null {
  if (softBg) return softBg;
  if (!bg || !bgReady || typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 600;
  c.height = 375;
  const x = c.getContext('2d');
  if (!x) return null;
  const iw = bg.naturalWidth;
  const ih = bg.naturalHeight;
  x.filter = 'blur(3px) saturate(0.85)';
  x.drawImage(bg, iw * 0.3, ih * 0.18, iw * 0.42, ih * 0.62, -8, -8, c.width + 16, c.height + 16);
  x.filter = 'none';
  x.fillStyle = 'rgba(10, 30, 18, 0.34)';
  x.fillRect(0, 0, c.width, c.height);
  softBg = c;
  return c;
}

/** the ground, from x0 to x1 (painted moss bank, or a plain earth band until the kit loads) */
function ground(ctx: CanvasRenderingContext2D, x0 = -10, x1 = SCENE_W + 10) {
  ctx.fillStyle = '#3a2a17';
  ctx.fillRect(x0, FLOOR, x1 - x0, SCENE_H - FLOOR);
  const p = { id: 0, x: x0, y: FLOOR, width: x1 - x0, height: 60, type: 'solid' } as Platform;
  if (!drawBankArt(ctx, p, { left: x0 > 0, right: x1 < SCENE_W }, true, SCENE_H)) {
    ctx.fillStyle = '#6aa338';
    ctx.fillRect(x0, FLOOR - 4, x1 - x0, 8);
  }
}

function pit(ctx: CanvasRenderingContext2D, x0: number, x1: number) {
  const g = ctx.createLinearGradient(0, FLOOR, 0, SCENE_H);
  g.addColorStop(0, '#0e1d12');
  g.addColorStop(1, '#050c07');
  ctx.fillStyle = g;
  ctx.fillRect(x0, FLOOR - 2, x1 - x0, SCENE_H - FLOOR + 2);
}

// ───────────── the actors ─────────────

/** Pokey with his feet at (x, y) */
function pokey(ctx: CanvasRenderingContext2D, now: number, x: number, y: number, over: Partial<PlayerState> = {}) {
  const p = demoPlayer({ x, y, ...over });
  drawHeroDemo(ctx, p, now);
}

let eid = 1;
function foe(type: string, x: number, feet: number, w: number, h: number, over: Partial<Enemy> = {}): Enemy {
  return {
    id: eid++, type, x, y: feet - h / 2, vx: 0, vy: 0, width: w, height: h, hp: 1, maxHp: 1, facing: -1, patrolMinX: x - 40, patrolMaxX: x + 40,
    attackCooldown: 1, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0, ...over,
  } as Enemy;
}
function snake(ctx: CanvasRenderingContext2D, now: number, e: Enemy) {
  e.animTimer = now;
  if (!drawGoldSnake(ctx, e, now) && !drawSnakeSprite(ctx, e, now)) drawTreeSnake(ctx, e, now);
}
function eagle(ctx: CanvasRenderingContext2D, now: number, e: Enemy) {
  e.animTimer = now;
  if (!drawEagleSprite(ctx, e, now)) drawHarpyEagle(ctx, e, now);
}

function item(ctx: CanvasRenderingContext2D, now: number, type: Collectible['type'], x: number, y: number, over: Partial<Collectible> = {}) {
  drawCollectible(ctx, { id: 1, type, x, y, collected: false, bobPhase: 0, ...over } as Collectible, now, 1, 1);
}

/** a puff of sparkles at (x, y), for u in 0..1 */
function sparkle(ctx: CanvasRenderingContext2D, x: number, y: number, u: number, color = '#fde68a') {
  if (u <= 0 || u >= 1) return;
  ctx.save();
  ctx.globalAlpha = 1 - u;
  ctx.fillStyle = color;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    const r = 6 + u * 22;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, 2.4 * (1 - u) + 0.8, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** a white star where a blow lands, for u in 0..1 */
function bang(ctx: CanvasRenderingContext2D, x: number, y: number, u: number) {
  if (u <= 0 || u >= 1) return;
  ctx.save();
  ctx.globalAlpha = 1 - u;
  ctx.fillStyle = '#fff7d6';
  ctx.translate(x, y);
  ctx.scale(0.6 + u * 0.8, 0.6 + u * 0.8);
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 4 : 11;
    const a = (i / 10) * TAU;
    if (i) ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    else ctx.moveTo(r, 0);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** a thumb ripple: where the tap goes */
function tapRing(ctx: CanvasRenderingContext2D, x: number, y: number, u: number) {
  if (u <= 0 || u >= 1) return;
  ctx.save();
  ctx.globalAlpha = 1 - u;
  ctx.strokeStyle = '#7ee2a8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x, y, 6 + u * 18, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

// ───────────── motion helpers ─────────────

const clamp01 = (u: number) => Math.max(0, Math.min(1, u));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
/** a jump arc's height (0 at the ends, `h` at the top) for s in 0..1 */
const arc = (s: number, h: number) => 4 * h * clamp01(s) * (1 - clamp01(s));
/** the jump's vertical speed sign, for the pose (rising: negative) */
const vyOf = (s: number) => (s < 0.5 ? -400 : 400);
const run = (t: number, speed = 9) => ({ vx: 285, walkCycle: t * speed });
/** an attack pose for `dur` seconds from `at` */
function swingAt(t: number, at: number, move: 'jab' | 'cross' | 'hook' | 'kick' | 'mega', dur = 0.32): Partial<PlayerState> {
  const u = (t - at) / dur;
  if (u < 0 || u > 1) return {};
  const kick = move === 'kick';
  return { punching: !kick, kicking: kick, punchTimer: dur * (1 - u), kickTimer: dur * (1 - u), attackType: kick ? 'kick' : move === 'mega' ? 'mega' : 'punch', attackMove: move, attackU: u };
}

// ───────────── the scenes ─────────────

/** draw scene `id` at loop time t (s), with `now` the clock the sprites animate by */
export function drawScene(ctx: CanvasRenderingContext2D, id: DemoId, t: number, now: number) {
  backdrop(ctx);
  switch (id) {
    case 'run': {
      ground(ctx);
      pokey(ctx, now, lerp(-30, SCENE_W + 30, t / SCENE_LEN.run), FLOOR, run(t));
      break;
    }
    case 'jump': {
      ground(ctx);
      const x = lerp(-20, SCENE_W + 20, t / SCENE_LEN.jump);
      const s = (t - 0.9) / 0.7;
      const air = s > 0 && s < 1;
      drawKitPiece(ctx, 'stump', 128, FLOOR - 30, 46, 36);
      pokey(ctx, now, x, FLOOR - arc(s, 64), air ? { grounded: false, vy: vyOf(s), vx: 200 } : run(t));
      break;
    }
    case 'double': {
      ground(ctx);
      const x = lerp(-20, SCENE_W + 20, t / SCENE_LEN.double);
      let y = 0;
      let over: Partial<PlayerState> = run(t);
      if (t > 0.7 && t < 1.05) {
        const s = (t - 0.7) / 0.35;
        y = 58 * Math.sin((s * Math.PI) / 2);
        over = { grounded: false, vy: -400, vx: 200 };
      } else if (t >= 1.05 && t < 1.9) {
        const s = (t - 1.05) / 0.85;
        y = 58 * (1 - s) + arc(s, 70);
        const flip = clamp01((t - 1.05) / 0.4);
        over = { grounded: false, vy: s < 0.45 ? -400 : 400, vx: 200, isDoubleJumping: flip < 1, somersaultAngle: flip * TAU };
      }
      pokey(ctx, now, x, FLOOR - y, over);
      const tx = lerp(-20, SCENE_W + 20, 1.05 / SCENE_LEN.double);
      tapRing(ctx, tx, FLOOR - 58 - 26, (t - 1.02) / 0.45);
      break;
    }
    case 'duck': {
      ground(ctx);
      const down = t > 0.7 && t < 2.5;
      pokey(ctx, now, 120, FLOOR, { ducking: down, facing: 1 });
      const bx = lerp(SCENE_W + 40, -60, clamp01((t - 0.9) / 1.4));
      if (t > 0.9 && t < 2.3) eagle(ctx, now, foe('eagle', bx, FLOOR - 26, 54, 30, { swoopPhase: 'swoop', vx: -260, facing: -1 } as Partial<Enemy>));
      break;
    }
    case 'gap': {
      ground(ctx, -10, 120);
      ground(ctx, 185, SCENE_W + 10);
      pit(ctx, 120, 185);
      const x = lerp(-20, SCENE_W + 20, t / SCENE_LEN.gap);
      const s = (x - 95) / 115;
      const air = s > 0 && s < 1;
      pokey(ctx, now, x, FLOOR - arc(s, 52), air ? { grounded: false, vy: vyOf(s), vx: 285 } : run(t));
      break;
    }
    case 'glide': {
      ground(ctx, 200, SCENE_W + 10);
      pit(ctx, -10, 200);
      // a high ledge on the left, the long drop, the far bank
      drawBranchArt(ctx, { id: 0, x: -10, y: 70, width: 90, height: 20, type: 'solid' } as Platform, 'whole', 0);
      let x: number;
      let y: number;
      let over: Partial<PlayerState>;
      let open = 0;
      if (t < 0.7) {
        x = lerp(10, 70, t / 0.7);
        y = 70;
        over = run(t, 6);
      } else if (t < 2.9) {
        const u = (t - 0.7) / 2.2;
        x = lerp(70, 245, u);
        y = lerp(70, FLOOR, u * u * 0.4 + u * 0.6);
        over = { grounded: false, vy: 120, vx: 120 };
        open = clamp01((t - 0.75) / 0.25);
      } else {
        x = 245 + (t - 2.9) * 30;
        y = FLOOR;
        over = { vx: 0 };
      }
      pokey(ctx, now, x, y, over);
      if (open > 0 && !drawGlideSprite(ctx, x, y, open, now, 0.5, 1)) drawGlideLeaf(ctx, x, y, open, now, 0.5, 1);
      break;
    }
    case 'punch':
    case 'kick':
    case 'mega':
    case 'nostomp':
    case 'big': {
      ground(ctx);
      const big = id === 'big';
      const ex = id === 'nostomp' ? 168 : big ? 196 : 216;
      const hits = id === 'punch' ? [0.35, 0.95, 1.55] : id === 'kick' ? [0.5, 1.5] : id === 'mega' ? [1.55] : id === 'big' ? [0.4, 1.2, 2.0] : [0.6];
      const moves: Array<'jab' | 'cross' | 'hook' | 'kick' | 'mega'> =
        id === 'punch' ? ['jab', 'cross', 'hook'] : id === 'kick' ? ['kick', 'kick'] : id === 'mega' ? ['mega'] : id === 'big' ? ['kick', 'hook', 'kick'] : ['jab'];
      let over: Partial<PlayerState> = { facing: 1 };
      hits.forEach((h, i) => (over = { ...over, ...swingAt(t, h, moves[i], id === 'mega' ? 0.42 : 0.32) }));
      if (id === 'mega' && t > 0.2 && t < 1.55) over = { ...over, megaCharge: clamp01((t - 0.2) / 1.2) };
      const lastHit = hits.filter((h) => t >= h + 0.12).pop();
      const flash = lastHit !== undefined && t - (lastHit + 0.12) < 0.14 ? 0.12 : 0;
      const ko = id === 'mega' || id === 'nostomp' ? (t > hits[hits.length - 1] + 0.12 ? t - hits[hits.length - 1] - 0.12 : -1) : -1;
      const enemyX = ex + (ko > 0 ? ko * 160 : 0);
      if (ko < 0 || ko < 0.8) {
        ctx.save();
        if (ko > 0) ctx.globalAlpha = Math.max(0, 1 - ko / 0.8);
        if (id === 'nostomp') {
          const e = foe('spider', enemyX, FLOOR, 34, 22, { hitFlashTimer: flash, facing: -1 });
          if (!drawSpiderSprite(ctx, e, now, 140)) drawHazardEntity(ctx, e, now);
        } else if (big) {
          const e = foe('boa', enemyX, FLOOR, 58, 26, { hp: 3, maxHp: 3, hitFlashTimer: flash, facing: -1 });
          if (!drawBoaSprite(ctx, e, now)) drawBoa(ctx, e, now);
        } else snake(ctx, now, foe('snake', enemyX, FLOOR, 38, 22, { hitFlashTimer: flash }));
        ctx.restore();
      }
      hits.forEach((h) => bang(ctx, 142, FLOOR - 16, (t - h - 0.1) / 0.3));
      pokey(ctx, now, 116, FLOOR, over);
      break;
    }
    case 'stomp': {
      ground(ctx);
      const sx = 190;
      const x = t < 1.3 ? lerp(40, sx, t / 1.3) : lerp(sx, 250, clamp01((t - 1.3) / 0.8));
      let y = 0;
      let over: Partial<PlayerState> = run(t);
      if (t > 0.65 && t < 1.3) {
        const s = (t - 0.65) / 0.65;
        y = s < 0.5 ? arc(s, 70) : lerp(70, 22, (s - 0.5) * 2);
        over = { grounded: false, vy: s < 0.5 ? -400 : 400, vx: 200 };
      } else if (t >= 1.3 && t < 2.1) {
        const s = (t - 1.3) / 0.8;
        y = 22 * (1 - s) + arc(s, 40);
        over = { grounded: false, vy: s < 0.4 ? -400 : 400, vx: 120 };
      }
      const squashed = t >= 1.3;
      if (!squashed || t < 2.2) {
        ctx.save();
        ctx.translate(sx, FLOOR);
        ctx.scale(1, squashed ? 0.35 : 1);
        ctx.translate(-sx, -FLOOR);
        if (squashed) ctx.globalAlpha = Math.max(0, 1 - (t - 1.3) / 0.9);
        snake(ctx, now, foe('snake', sx, FLOOR, 38, 22, { hitFlashTimer: squashed ? 0.1 : 0 }));
        ctx.restore();
      }
      bang(ctx, sx, FLOOR - 24, (t - 1.3) / 0.35);
      pokey(ctx, now, x, FLOOR - y, over);
      break;
    }
    case 'bird': {
      ground(ctx);
      // the eagle circles high, then dives at him: he ducks, it misses
      const u = clamp01((t - 0.4) / 1.8);
      const bx = lerp(SCENE_W + 30, -50, u);
      const by = FLOOR - 30 - 90 * Math.pow(Math.abs(u - 0.55) * 2, 1.6);
      const down = t > 1.0 && t < 2.3;
      pokey(ctx, now, 140, FLOOR, { ducking: down, facing: 1 });
      if (t > 0.4 && t < 2.2) eagle(ctx, now, foe('eagle', bx, by, 54, 30, { swoopPhase: 'swoop', vx: -260, facing: -1 } as Partial<Enemy>));
      break;
    }
    case 'boss': {
      ground(ctx);
      // Venom Fang's real sweep, at half size: rear back, sweep the floor, dazed; Pokey waits on the stump, then drops down and punches
      const K = 0.42;
      const st = t < 1.2 ? 'tell' : t < 1.95 ? 'act' : t < 4.2 ? 'rec' : 'idle';
      const bt = st === 'tell' ? t : st === 'act' ? t - 1.2 : st === 'rec' ? t - 1.95 : t - 4.2;
      const brain = { ...newBrain(), state: st, move: 'sweep', t: bt, d: { reach: 92 / K } } as BossEntity['ai'];
      const hitAt = [2.55, 3.15];
      const flash = hitAt.some((h) => t > h + 0.1 && t < h + 0.26) ? 0.15 : 0;
      const b = { id: 1, type: 'boss', x: 330 / K, y: 0, width: 250, height: 150, facing: -1, phase: 1, hitFlashTimer: flash, ai: brain } as unknown as BossEntity;
      drawKitPiece(ctx, 'stump', 6, FLOOR - 46, 52, 52);
      ctx.save();
      ctx.scale(K, K);
      venomRig.draw(ctx, b, {} as never, now, FLOOR / K);
      ctx.restore();
      let over: Partial<PlayerState> = { facing: 1 };
      let x = 32;
      let y = FLOOR - 44;
      if (t < 0.45) {
        y = FLOOR;
        x = lerp(90, 72, t / 0.45);
        over = { facing: -1 };
      } else if (t < 0.85) {
        const s = (t - 0.45) / 0.4;
        x = lerp(72, 32, s);
        y = lerp(FLOOR, FLOOR - 44, s) - arc(s, 30);
        over = { grounded: false, vy: s < 0.5 ? -400 : 400, facing: -1 };
      } else if (t > 2.0 && t < 2.35) {
        const s = (t - 2.0) / 0.35;
        x = lerp(32, 66, s);
        y = lerp(FLOOR - 44, FLOOR, s) - arc(s, 16);
        over = { grounded: false, vy: s < 0.4 ? -300 : 400, facing: 1 };
      } else if (t >= 2.35 && t < 4.2) {
        x = 66;
        y = FLOOR;
        over = { facing: 1, ...swingAt(t, hitAt[0], 'hook', 0.36), ...swingAt(t, hitAt[1], 'kick', 0.36) };
      } else if (t >= 4.2) {
        x = lerp(66, 90, clamp01((t - 4.2) / 0.6));
        y = FLOOR;
        over = { ...run(t, 5), vx: 80, facing: 1 };
      }
      hitAt.forEach((h) => bang(ctx, 92, FLOOR - 16, (t - h - 0.1) / 0.3));
      pokey(ctx, now, x, y, over);
      break;
    }
    case 'climb': {
      ground(ctx);
      const tx = 150;
      drawKitPiece(ctx, 'trunk', tx - 26, 0, 52, FLOOR + 6);
      const u = clamp01((t - 0.4) / 2.4);
      const y = lerp(FLOOR, 52, u);
      pokey(ctx, now, tx, y, t < 0.4 ? { facing: 1 } : { climbing: true, grounded: false, vy: -80, walkCycle: t * 4, facing: 1 });
      break;
    }
    case 'swing': {
      ground(ctx, -10, 70);
      ground(ctx, 230, SCENE_W + 10);
      pit(ctx, 70, 230);
      const px = 150;
      // his hands this far down the vine, his body hanging below them (heroVine.ts)
      const L = 44;
      const w = (TAU * 2) / SCENE_LEN.swing;
      const a = 0.62 * Math.sin((t / SCENE_LEN.swing) * TAU * 2);
      const omega = 0.62 * Math.cos((t / SCENE_LEN.swing) * TAU * 2) * w;
      if (!drawSwingLianaArt(ctx, { x: px, topY: -6, bottomY: -6 + L + VINE_HANG + 30, id: 1 }, a)) {
        ctx.save();
        ctx.strokeStyle = '#4e6b25';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(px, -6);
        ctx.lineTo(px + Math.sin(a) * (L + VINE_HANG), -6 + Math.cos(a) * (L + VINE_HANG));
        ctx.stroke();
        ctx.restore();
      }
      const feet = L + VINE_HANG;
      pokey(ctx, now, px + Math.sin(a) * feet, -6 + Math.cos(a) * feet, { isVineSwinging: true, grounded: false, swingAngle: a, swingAngularVelocity: omega, facing: 1 });
      break;
    }
    case 'bounce': {
      ground(ctx);
      const mx = 150;
      const capY = FLOOR - 26;
      // the mushroom: a stalk and a red cap with spots, squashed as he lands
      const u = (t % 1.1) / 1.1;
      const squash = u < 0.08 ? 1 - u / 0.08 : 0;
      ctx.save();
      ctx.fillStyle = '#f3e3c3';
      ctx.fillRect(mx - 7, capY, 14, FLOOR - capY);
      ctx.translate(mx, capY + 4);
      ctx.scale(1 + squash * 0.15, 1 - squash * 0.3);
      ctx.fillStyle = '#e2483c';
      ctx.beginPath();
      ctx.ellipse(0, 0, 34, 16, 0, Math.PI, TAU);
      ctx.fill();
      ctx.fillStyle = '#fff';
      for (const [sx, sy, r] of [[-16, -7, 4], [2, -11, 5], [18, -5, 3.5]]) {
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
      const y = capY - arc(u, 56);
      pokey(ctx, now, mx, y, { grounded: false, vy: vyOf(u), vx: 0, facing: 1 });
      break;
    }
    case 'shimmy': {
      ground(ctx, -10, 40);
      ground(ctx, 260, SCENE_W + 10);
      pit(ctx, 40, 260);
      const ry = 38;
      // the painted rope (ropeArt.ts), sagging a little; his paws on it (heroRope.ts hangs him HANG_DROP above his feet)
      const ropeY = (x: number) => ry + 20 * ((x + 10) / (SCENE_W + 20)) * (1 - (x + 10) / (SCENE_W + 20));
      const pts: Array<[number, number]> = [];
      for (let i = 0; i <= 40; i++) {
        const rx = -10 + ((SCENE_W + 20) * i) / 40;
        pts.push([rx, ropeY(rx)]);
      }
      if (!drawRopeAlong(ctx, pts)) {
        ctx.save();
        ctx.strokeStyle = '#9a7656';
        ctx.lineWidth = 6;
        ctx.beginPath();
        pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
        ctx.stroke();
        ctx.restore();
      }
      const x = lerp(30, 270, clamp01((t - 0.3) / 3));
      // (walkCycle grows 0.08 per px crept, as on a real rope: 80 px/s here)
      const moving = t > 0.3 && t < 3.3;
      pokey(ctx, now, x, ropeY(x) + HANG_DROP, { hanging: true, grounded: false, vx: moving ? 80 : 0, walkCycle: Math.max(0, x - 30) * 0.08, facing: 1 });
      break;
    }
    case 'hide': {
      ground(ctx);
      const bush = { x: 120, w: 110, y: FLOOR, kind: 'wide' as const };
      const inside = t > 1.1 && t < 3.6;
      const x = t < 1.1 ? lerp(10, 175, t / 1.1) : t < 3.6 ? 175 : lerp(175, 330, (t - 3.6) / 0.6);
      pokey(ctx, now, x, FLOOR, inside ? { ducking: true, facing: 1 } : run(t));
      ctx.save();
      if (inside) ctx.globalAlpha = 0.62;
      if (!drawBushArt(ctx, bush, inside, 0, now)) {
        ctx.fillStyle = '#3f7a2c';
        ctx.beginPath();
        ctx.ellipse(175, FLOOR - 18, 55, 26, 0, Math.PI, TAU);
        ctx.fill();
      }
      ctx.restore();
      // the eagle's shadow sweeps the ground while he hides
      const u = (t - 1.6) / 1.6;
      if (u > 0 && u < 1) {
        const sx = lerp(SCENE_W + 60, -60, u);
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
        ctx.beginPath();
        ctx.ellipse(sx, FLOOR + 2, 46, 8, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
        eagle(ctx, now, foe('eagle', sx + 30, 22, 54, 30, { swoopPhase: 'patrol', vx: -200, facing: -1 } as Partial<Enemy>));
      }
      break;
    }
    case 'sleepers': {
      ground(ctx);
      const sx = 228;
      const hit = 2.15;
      const x = t < 1.8 ? lerp(30, 152, t / 1.8) : 152;
      const over: Partial<PlayerState> = t < 1.8 ? { ...run(t, 5), vx: 100 } : { facing: 1, ...swingAt(t, hit, 'hook', 0.36) };
      const ko = t - hit - 0.12;
      if (ko < 0.8) {
        ctx.save();
        if (ko > 0) ctx.globalAlpha = Math.max(0, 1 - ko / 0.8);
        snake(ctx, now, foe('snake', sx + Math.max(0, ko) * 120, FLOOR, 38, 22, { asleep: ko < 0, state: ko < 0 ? 'sleep' : undefined, hitFlashTimer: ko > 0 && ko < 0.15 ? 0.1 : 0 } as Partial<Enemy>));
        ctx.restore();
      }
      if (ko < 0) {
        ctx.save();
        ctx.fillStyle = '#e8f5ff';
        ctx.font = '700 12px Fredoka, sans-serif';
        const z = (now * 0.8) % 1;
        ctx.globalAlpha = 1 - z;
        ctx.fillText('z', sx + 12 + z * 10, FLOOR - 26 - z * 18);
        ctx.fillText('Z', sx + 20 + z * 14, FLOOR - 40 - z * 20);
        ctx.restore();
      }
      bang(ctx, sx - 14, FLOOR - 14, (t - hit - 0.1) / 0.3);
      pokey(ctx, now, x, FLOOR, over);
      break;
    }
    case 'water': {
      ground(ctx, -10, 90);
      ground(ctx, 220, SCENE_W + 10);
      const wy = FLOOR + 8;
      const g = ctx.createLinearGradient(0, wy, 0, SCENE_H);
      g.addColorStop(0, '#3b8fb0');
      g.addColorStop(1, '#14445a');
      ctx.fillStyle = g;
      ctx.fillRect(90, wy, 130, SCENE_H - wy);
      ctx.strokeStyle = 'rgba(220, 245, 255, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 90; x <= 220; x += 4) ctx.lineTo(x, wy + Math.sin(x * 0.12 + now * 3) * 1.5);
      ctx.stroke();
      const bob = Math.sin(now * 2.2) * 2;
      const log = { id: 0, x: 128, y: wy - 12 + bob, width: 54, height: 18, type: 'drift' } as Platform;
      if (!drawLogArt(ctx, log, false)) {
        ctx.fillStyle = '#7a5530';
        ctx.fillRect(log.x, log.y, log.width, log.height);
      }
      let x: number;
      let y = FLOOR;
      let over: Partial<PlayerState> = run(t);
      if (t < 0.7) x = lerp(20, 75, t / 0.7);
      else if (t < 1.25) {
        const s = (t - 0.7) / 0.55;
        x = lerp(75, 155, s);
        y = lerp(FLOOR, log.y, s) - arc(s, 34);
        over = { grounded: false, vy: vyOf(s), vx: 200 };
      } else if (t < 1.9) {
        x = 155;
        y = log.y;
        over = { facing: 1 };
      } else if (t < 2.45) {
        const s = (t - 1.9) / 0.55;
        x = lerp(155, 240, s);
        y = lerp(log.y, FLOOR, s) - arc(s, 34);
        over = { grounded: false, vy: vyOf(s), vx: 200 };
      } else x = lerp(240, 320, (t - 2.45) / 0.75);
      pokey(ctx, now, x, y, over);
      break;
    }
    case 'crumble': {
      ground(ctx, -10, 70);
      ground(ctx, 230, SCENE_W + 10);
      pit(ctx, 70, 230);
      const br = { id: 0, x: 70, y: FLOOR, width: 160, height: 20, type: 'fragile' } as Platform;
      const state = t < 0.9 ? 'whole' : t < 1.8 ? 'creak' : 'snapped';
      const shake = state === 'creak' ? Math.sin(now * 60) * 1.2 : 0;
      ctx.save();
      ctx.translate(shake, 0);
      drawBranchArt(ctx, br, state, t - 1.8);
      ctx.restore();
      const x = lerp(-10, 320, t / 2.4);
      if (t < 2.4) pokey(ctx, now, x, FLOOR, run(t));
      break;
    }
    case 'moving': {
      ground(ctx, -10, 60);
      ground(ctx, 240, SCENE_W + 10);
      pit(ctx, 60, 240);
      const u = 0.5 - 0.5 * Math.cos((t / SCENE_LEN.moving) * TAU);
      const lx = lerp(62, 176, u);
      const log = { id: 0, x: lx, y: FLOOR - 4, width: 62, height: 18, type: 'moving' } as Platform;
      if (!drawLogArt(ctx, log, false)) {
        ctx.fillStyle = '#7a5530';
        ctx.fillRect(log.x, log.y, log.width, log.height);
      }
      pokey(ctx, now, lx + 31, FLOOR - 4, { facing: u < 0.5 ? 1 : -1 });
      break;
    }
    case 'collapse': {
      // he runs on the spot near the middle; the branch slides by and breaks away behind him
      pit(ctx, -10, SCENE_W + 10);
      const speed = 120;
      const seg = 60;
      const off = (t * speed) % seg;
      for (let i = -1; i < 7; i++) {
        const x0 = i * seg - off;
        const behind = x0 + seg < 70;
        const since = behind ? (70 - (x0 + seg)) / speed : 0;
        drawBranchArt(ctx, { id: 0, x: x0, y: FLOOR, width: seg, height: 20, type: 'solid' } as Platform, behind ? 'snapped' : x0 < 120 ? 'creak' : 'whole', since);
      }
      pokey(ctx, now, 150, FLOOR, run(t, 11));
      break;
    }
    case 'drops': {
      ground(ctx);
      const snakes = [
        { x: 222, at: 0.2, hit: 1.15 },
        { x: 274, at: 0.55, hit: 2.25 },
      ];
      for (const s of snakes) {
        const fall = clamp01((t - s.at) / 0.55);
        if (t < s.at) continue;
        const ko = t - s.hit - 0.12;
        if (ko > 0.8) continue;
        const y = FLOOR - 220 * (1 - fall * fall);
        ctx.save();
        if (ko > 0) ctx.globalAlpha = Math.max(0, 1 - ko / 0.8);
        snake(ctx, now, foe('snake', s.x + Math.max(0, ko) * 140, y, 38, 22, { hitFlashTimer: ko > 0 && ko < 0.15 ? 0.1 : 0 }));
        ctx.restore();
        bang(ctx, s.x - 30, FLOOR - 14, (t - s.hit - 0.1) / 0.3);
      }
      const x = t < 1.3 ? 150 : lerp(150, 200, clamp01((t - 1.3) / 0.5));
      const over: Partial<PlayerState> = { facing: 1, ...swingAt(t, 1.0, 'jab'), ...swingAt(t, 2.1, 'kick') };
      pokey(ctx, now, x, FLOOR, t > 1.3 && t < 1.8 ? { ...run(t), vx: 150 } : over);
      break;
    }
    case 'shrine': {
      ground(ctx);
      item(ctx, now, 'exit_totem', 238, FLOOR - 2);
      const x = t < 1.4 ? lerp(10, 168, t / 1.4) : 168;
      pokey(ctx, now, x, FLOOR, t < 1.4 ? run(t) : { facing: 1, cheerAt: 1.4 } as Partial<PlayerState>);
      sparkle(ctx, 238, FLOOR - 40, (t - 1.45) / 0.8);
      break;
    }
    case 'goals': {
      ground(ctx);
      const xs = [80, 135, 190, 245];
      const x = lerp(10, 300, clamp01(t / 3.2));
      let got = 0;
      xs.forEach((fx, i) => {
        if (x > fx) {
          got++;
          sparkle(ctx, fx, FLOOR - 26, (x - fx) / 60, '#fbcfe8');
        } else item(ctx, now, 'flower', fx, FLOOR - 26, { botanicalVariant: (['orchid', 'hibiscus', 'lotus', 'orchid'] as const)[i] });
      });
      pokey(ctx, now, x, FLOOR, run(t));
      // the yellow count, as in the stage card
      ctx.save();
      ctx.fillStyle = 'rgba(8, 24, 14, 0.7)';
      ctx.beginPath();
      ctx.roundRect(SCENE_W - 92, 8, 84, 24, 8);
      ctx.fill();
      ctx.fillStyle = '#fcd34d';
      ctx.font = '700 15px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${got} / 4 petals`, SCENE_W - 50, 25);
      ctx.restore();
      break;
    }
    case 'heart':
    case 'power': {
      ground(ctx);
      const ix = 160;
      const fast = id === 'power';
      const x = t < 1.1 ? lerp(10, ix, t / 1.1) : lerp(ix, fast ? 420 : 300, (t - 1.1) / (fast ? 1.0 : 1.5));
      if (x < ix) item(ctx, now, fast ? 'powerup_speed' : 'heart', ix, FLOOR - 26);
      sparkle(ctx, ix, FLOOR - 26, (t - 1.1) / 0.7, fast ? '#6ee7b7' : '#fda4af');
      if (fast && t > 1.1) {
        ctx.save();
        ctx.strokeStyle = 'rgba(110, 231, 183, 0.7)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(x - 30 - i * 6, FLOOR - 12 - i * 9);
          ctx.lineTo(x - 60 - i * 10, FLOOR - 12 - i * 9);
          ctx.stroke();
        }
        ctx.restore();
      }
      if (!fast && t > 1.1 && t < 2.1) {
        ctx.save();
        ctx.globalAlpha = 1 - (t - 1.1);
        ctx.fillStyle = '#fda4af';
        ctx.font = '700 16px Fredoka, sans-serif';
        ctx.fillText('+1', ix - 8, FLOOR - 50 - (t - 1.1) * 20);
        ctx.restore();
      }
      pokey(ctx, now, x, FLOOR, run(t, fast && t > 1.1 ? 16 : 9));
      break;
    }
    case 'flag': {
      ground(ctx);
      const fx = 170;
      const x = lerp(10, 320, t / 2.6);
      const up = clamp01((x - fx) / 40);
      ctx.save();
      ctx.fillStyle = '#5b4325';
      ctx.fillRect(fx - 2, FLOOR - 70, 4, 70);
      ctx.fillStyle = up > 0 ? '#facc15' : '#9ca3af';
      const fy = lerp(FLOOR - 26, FLOOR - 68, up);
      ctx.beginPath();
      ctx.moveTo(fx + 2, fy);
      ctx.lineTo(fx + 30, fy + 8 + Math.sin(now * 8) * 2);
      ctx.lineTo(fx + 2, fy + 18);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      if (up > 0) sparkle(ctx, fx + 16, FLOOR - 60, up * 1.2);
      if (t < 2.6) pokey(ctx, now, x, FLOOR, run(t));
      break;
    }
    case 'cage': {
      ground(ctx);
      const cx = 196;
      const hits = [0.5, 1.1, 1.7];
      const done = hits.filter((h) => t > h + 0.12).length;
      if (done < 3) item(ctx, now, 'cage', cx, FLOOR - 24, { cageHp: 3 - done });
      else sparkle(ctx, cx, FLOOR - 30, (t - 1.82) / 0.9, '#a7f3d0');
      let over: Partial<PlayerState> = { facing: 1 };
      hits.forEach((h, i) => (over = { ...over, ...swingAt(t, h, (['jab', 'cross', 'hook'] as const)[i]) }));
      hits.forEach((h) => bang(ctx, cx - 26, FLOOR - 22, (t - h - 0.1) / 0.3));
      pokey(ctx, now, 146, FLOOR, over);
      break;
    }
    case 'finds': {
      ground(ctx);
      const ledge = { id: 0, x: 140, y: FLOOR - 60, width: 90, height: 20, type: 'solid' } as Platform;
      drawBranchArt(ctx, ledge, 'whole', 0);
      const got = t > 1.35;
      if (!got) item(ctx, now, 'find', 200, ledge.y - 22, { findId: 'w1_note' });
      sparkle(ctx, 200, ledge.y - 24, (t - 1.35) / 0.9, '#fde68a');
      let x = lerp(20, 150, clamp01(t / 0.8));
      let y = FLOOR;
      let over: Partial<PlayerState> = run(t);
      if (t > 0.8 && t < 1.3) {
        const s = (t - 0.8) / 0.5;
        x = lerp(150, 195, s);
        y = lerp(FLOOR, ledge.y, s) - arc(s, 30);
        over = { grounded: false, vy: vyOf(s), vx: 150 };
      } else if (t >= 1.3) {
        x = 195;
        y = ledge.y;
        over = { facing: 1 };
      }
      pokey(ctx, now, x, y, over);
      break;
    }
    case 'ferns': {
      ground(ctx);
      const fern = { x: 170, w: 70, y: FLOOR, kind: 'fern' as const };
      const x = t < 1 ? lerp(20, 160, t) : 160;
      const searching = t > 1.05 && t < 2.6;
      pokey(ctx, now, x, FLOOR, t < 1 ? run(t) : { ducking: searching, facing: 1 });
      if (!drawBushArt(ctx, fern, false, searching ? Math.sin(now * 20) * 0.5 : 0, now)) {
        ctx.fillStyle = '#4f8f36';
        ctx.beginPath();
        ctx.ellipse(205, FLOOR - 14, 34, 18, 0, Math.PI, TAU);
        ctx.fill();
      }
      if (searching) {
        const u = clamp01((t - 1.05) / 1.5);
        ctx.save();
        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(160, FLOOR - 64, 11, 0, TAU);
        ctx.stroke();
        ctx.strokeStyle = '#fcd34d';
        ctx.beginPath();
        ctx.arc(160, FLOOR - 64, 11, -Math.PI / 2, -Math.PI / 2 + u * TAU);
        ctx.stroke();
        ctx.restore();
      }
      if (t > 2.6) {
        const u = (t - 2.6) / 1;
        item(ctx, now, 'find', 205, FLOOR - 30 - u * 30, { findId: 'w1_keepsake' });
        sparkle(ctx, 205, FLOOR - 40 - u * 30, u);
      }
      break;
    }
  }
}
