/**
 * Drawing for the boss fights: the pose a boss strikes for each part of a move (so every wind-up reads at a glance),
 * and everything its attacks throw into the arena.
 */
import type { BossEntity } from './types.ts';
import { drawGritBit } from './w4Grit.ts';
import type { BossHazard } from './bossAI.ts';
import type { BossDef, MoveDef } from './bossAI.ts';
import { EASY_OPEN_MUL, openLeft, opensSoon, weakOpen, weakRect } from './bossAI.ts';
import { isEasy } from './difficulty.ts';
import { drawBossEntity } from './vectorArt.ts';
import { withHurtFlash } from './hurtFlash.ts';
import { demoPlayer, drawMilo } from './miloVariants.ts';
import { queenSprite } from './queenSprite.ts';
import type { PaintedBoss } from './paintedBoss.ts';
import { venomRig } from './venomRig.ts';
import { crocSprite } from './crocSprite.ts';
import { prowlerSprite } from './prowlerSprite.ts';
import { monarchSprite } from './monarchSprite.ts';
import { reaverSprite } from './reaverSprite.ts';
import { sovereignSprite } from './sovereignSprite.ts';
import { drakeSprite } from './drakeSprite.ts';
import { ironclawSprite } from './ironclawSprite.ts';
import { golemSprite } from './golemSprite.ts';
import { thornbarkSprite } from './thornbarkSprite.ts';
import { drawW4 } from './w4Art.ts';
import { drawSkyPush } from './sovereignArt.ts';
import { FONT_UI } from './fonts.ts';
import { drawFx, drawFxRun } from './bossFx.ts';

/** the bosses that have a painted version */
const PAINTED: Record<number, PaintedBoss> = { 1: venomRig, 2: crocSprite, 3: prowlerSprite, 4: sovereignSprite, 5: queenSprite, 6: reaverSprite, 7: golemSprite, 8: monarchSprite, 9: drakeSprite, 10: ironclawSprite };

/** the poses the painted bosses strike on the story cards: calm, angry (while it speaks its threat) and beaten */
const CARD_POSES: Record<number, [string, string, string]> = {
  1: ['idle', 'threat', 'dead'],
  2: ['idle', 'roar', 'defeated'],
  3: ['idle', 'alert', 'dead'],
  4: ['glide', 'alert', 'dead'],
  5: ['idle', 'screech', 'dead'],
  6: ['idle', 'roar', 'deadheap'],
  7: ['march1', 'roar', 'defeat2'],
  8: ['fl_1', 'screech', 'deadcollapse'],
  9: ['idle', 'enrage', 'petrified'],
  10: ['idle', 'roar', 'fallen'],
};

/** draws the painted version of a boss for a story card (feet at the origin, facing right); false if this world has none or it is still loading */
export function drawPaintedCardBoss(ctx: CanvasRenderingContext2D, world: number, angry: boolean, beaten: boolean): boolean {
  const painted = PAINTED[world];
  const poses = CARD_POSES[world];
  if (!painted || !poses) return false;
  return painted.still(ctx, beaten ? poses[2] : angry ? poses[1] : poses[0]);
}

/** one named painted frame of a world's boss, feet at the origin, facing right (for the cutscenes' own poses); false when there is none or it is loading */
export function drawPaintedBossFrame(ctx: CanvasRenderingContext2D, world: number, frame: string): boolean {
  const painted = PAINTED[world];
  return painted ? painted.still(ctx, frame) : false;
}

/** distance from the picture's origin down to the shadow ellipse the boss drawings carry */
const ART_FEET = 25.5;

const ease = (u: number) => u * u * (3 - 2 * u);
const clamp01 = (u: number) => Math.max(0, Math.min(1, u));

interface PoseXf {
  /** scale about the feet */
  sx: number;
  sy: number;
  /** lean in radians (positive leans toward the way the boss faces) */
  lean: number;
  /** offset in world px (forward is positive) */
  dx: number;
  dy: number;
}

function poseFor(b: BossEntity, m: MoveDef | null, time: number): PoseXf {
  const br = b.ai;
  const xf: PoseXf = { sx: 1, sy: 1, lean: 0, dx: 0, dy: 0 };
  if (!br) return xf;
  const t = br.t;
  switch (br.state) {
    case 'roar': {
      const u = clamp01(t / br.hold);
      const pump = Math.sin(u * Math.PI);
      xf.sy = 1 + 0.12 * pump;
      xf.sx = 1 - 0.04 * pump;
      xf.dx = Math.sin(time * 60) * 2 * pump;
      break;
    }
    case 'idle': {
      xf.sy = 1 + Math.sin(time * 3) * 0.015;
      break;
    }
    case 'tell': {
      if (!m) break;
      const u = ease(clamp01(t / m.tell));
      const shake = Math.sin(time * 70) * 1.6 * u;
      switch (m.pose) {
        case 'leap':
        case 'charge':
          xf.sy = 1 - 0.26 * u;
          xf.sx = 1 + 0.16 * u;
          xf.lean = -0.12 * u;
          xf.dx = -8 * u + shake;
          break;
        case 'slam':
          xf.sy = 1 + 0.14 * u;
          xf.sx = 1 - 0.05 * u;
          xf.dy = -6 * u;
          xf.lean = -0.08 * u;
          xf.dx = shake;
          break;
        case 'lunge':
        case 'bite':
          xf.sx = 1 - 0.1 * u;
          xf.lean = -0.14 * u;
          xf.dx = -14 * u + shake;
          break;
        case 'whip':
          xf.lean = 0.1 * u;
          xf.sy = 1 - 0.06 * u;
          xf.dx = shake;
          break;
        case 'spit':
          xf.lean = -0.18 * u;
          xf.sy = 1 + 0.06 * u;
          xf.dx = shake * 0.6;
          break;
        case 'fly':
          xf.sy = 1 - 0.1 * u + Math.sin(time * 26) * 0.05;
          xf.sx = 1 + 0.08 * u;
          break;
        case 'fade':
          xf.sy = 1 - 0.2 * u;
          xf.sx = 1 + 0.1 * u;
          break;
        case 'roar':
          xf.sy = 1 + 0.12 * u;
          xf.sx = 1 - 0.04 * u;
          xf.dx = shake * 1.4;
          break;
        default:
          xf.dx = shake;
      }
      break;
    }
    case 'act': {
      if (!m) break;
      const u = clamp01(t / Math.max(0.01, m.act));
      switch (m.pose) {
        case 'lunge':
        case 'bite':
          xf.sx = 1.22;
          xf.sy = 0.92;
          xf.lean = 0.16;
          break;
        case 'charge':
          xf.lean = 0.2;
          xf.sx = 1.12;
          xf.sy = 0.9;
          xf.dy = Math.sin(time * 40) * 1.5;
          break;
        case 'leap':
          // stretched on the way up and down, squashed at the top
          xf.sy = 1.1 - 0.12 * Math.sin(u * Math.PI);
          xf.sx = 0.94 + 0.08 * Math.sin(u * Math.PI);
          xf.lean = (u - 0.5) * 0.3;
          break;
        case 'slam':
          xf.sy = 0.84 + 0.16 * u;
          xf.sx = 1.14 - 0.14 * u;
          break;
        case 'whip':
          xf.lean = Math.sin(u * Math.PI * 3) * 0.14;
          xf.sx = 1.06;
          break;
        case 'spit':
          xf.lean = 0.16 * (1 - u);
          xf.sx = 1.08;
          break;
        case 'fly':
          xf.sy = 0.94 + Math.sin(time * 28) * 0.07;
          xf.lean = 0.2;
          break;
        case 'fade':
          xf.sx = 1.18;
          xf.lean = 0.14;
          break;
        case 'roar':
          xf.sy = 1.1;
          xf.dx = Math.sin(time * 60) * 2;
          break;
        default:
          break;
      }
      break;
    }
    case 'rec': {
      // winded: head down and breathing hard
      xf.sy = 0.95 + Math.sin(time * 9) * 0.02;
      xf.sx = 1.03;
      xf.lean = 0.04;
      break;
    }
    case 'stun': {
      xf.lean = 0.22 + Math.sin(time * 5) * 0.04;
      xf.sy = 0.92;
      xf.sx = 1.05;
      break;
    }
    case 'dying': {
      const u = clamp01(t / 1.6);
      xf.lean = 0.5 * ease(u);
      xf.sy = 1 - 0.2 * u;
      xf.dx = Math.sin(time * 50) * 3 * (1 - u);
      break;
    }
  }
  return xf;
}

/** the boss itself, posed for what it is doing, standing on `floor` */
/** the drawn boss (while the painted one loads), with the shared white flash when hit (hurtFlash.ts, AN-6): it is drawn 1.5x round its middle */
function drawFallbackBoss(ctx: CanvasRenderingContext2D, b: BossEntity, time: number, world: number) {
  withHurtFlash(ctx, b.hitFlashTimer > 0, b.x - 280, b.y - 300, 560, 420, (c) => drawBossEntity(c, b, time, world));
}

export function drawBossFighter(ctx: CanvasRenderingContext2D, b: BossEntity, def: BossDef, time: number, world: number, floor: number) {
  const br = b.ai;
  if (!br) {
    drawFallbackBoss(ctx, b, time, world);
    return;
  }
  const m = br.move ? def.moves[br.move] ?? null : null;
  const air = br.air;
  const feetY = floor - air;
  const xf = poseFor(b, m, time);
  const painted = PAINTED[world];
  if (painted && (painted as { rig?: boolean }).rig && painted.active()) {
    // a rigged boss poses itself (its head can be far from its body): no squash or lean of the whole
    xf.sx = 1;
    xf.sy = 1;
    xf.lean = 0;
    xf.dx = 0;
    xf.dy = 0;
  } else if (painted?.active()) {
    // the painted boss is already posed for each part of a move: keep only a little of the squash, lean and shake
    xf.sx = 1 + (xf.sx - 1) * 0.35;
    xf.sy = 1 + (xf.sy - 1) * 0.35;
    xf.lean *= 0.3;
  }
  const dir = b.facing;
  let alpha = br.alpha;
  // (a guardian with an ending of its own is beaten, not killed: it stays, at rest)
  if (br.state === 'dying' && !def.ending) alpha *= 1 - clamp01((br.t - 1.0) / 0.6);

  // shadow stays on the ground however high a flyer is
  const sh = Math.max(0.35, 1 - air / 380);
  ctx.save();
  ctx.globalAlpha = 0.38 * sh * alpha;
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.ellipse(b.x, floor - 2, (def.w * 0.5 + 10) * sh, 8 * sh, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // wind-up aura on the floor and around the body: red means "this one is coming, do not poke it"
  if (br.state === 'tell' && m) {
    const u = clamp01(br.t / m.tell);
    ctx.save();
    ctx.globalAlpha = (0.16 + 0.22 * u) * (0.75 + 0.25 * Math.sin(time * 30));
    const r = def.h * 0.75 + 20 * u;
    const g = ctx.createRadialGradient(b.x, feetY - def.h * 0.5, 4, b.x, feetY - def.h * 0.5, r);
    g.addColorStop(0, '#fecaca');
    g.addColorStop(0.55, '#ef4444');
    g.addColorStop(1, 'rgba(239,68,68,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(b.x, feetY - def.h * 0.5, r * 1.15, r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.globalAlpha = Math.max(0, alpha);
  // pose about the feet
  ctx.translate(b.x + xf.dx * dir, feetY + xf.dy);
  ctx.rotate(xf.lean * dir);
  ctx.scale(xf.sx, xf.sy);
  ctx.translate(-b.x, -feetY);
  if (def.puppet) {
    // the painted guardian when his atlas is loaded; the Pokey-rig puppet until then
    if (!thornbarkSprite.draw(ctx, b, def, time, feetY)) drawPuppet(ctx, b, def, m, time, feetY);
  } else if (painted?.draw(ctx, b, def, time, feetY)) {
    // painted boss
  } else {
    const art: BossEntity = { ...b, y: feetY - ART_FEET + def.artDy };
    drawFallbackBoss(ctx, art, time, world);
  }
  ctx.restore();

  drawWeakPoint(ctx, b, def, time, floor);

  // dizzy stars
  if (br.state === 'stun') {
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const a = time * 4 + (i * Math.PI * 2) / 3;
      const sx = b.x + Math.cos(a) * 26;
      const sy = feetY - def.h - 6 + Math.sin(a) * 7;
      drawStar(ctx, sx, sy, 6, '#fde047');
    }
    ctx.restore();
  }
}

/** Thornbark is drawn with the same sloth rig as Pokey (the evil variant), posed from what the brain is doing */
const puppetMemory = new WeakMap<BossEntity, { x: number; t: number; vx: number; walk: number }>();

function drawPuppet(ctx: CanvasRenderingContext2D, b: BossEntity, def: BossDef, m: MoveDef | null, time: number, feetY: number) {
  const br = b.ai!;
  let mem = puppetMemory.get(b);
  if (!mem) {
    mem = { x: b.x, t: time, vx: 0, walk: 0 };
    puppetMemory.set(b, mem);
  }
  const dt = Math.max(0.001, Math.min(0.1, time - mem.t));
  mem.vx += ((b.x - mem.x) / dt - mem.vx) * Math.min(1, dt * 12);
  mem.walk += Math.abs(mem.vx) * dt * 0.075;
  mem.x = b.x;
  mem.t = time;

  const air = br.air;
  const p = demoPlayer({
    x: b.x,
    y: feetY,
    facing: b.facing,
    vx: mem.vx,
    vy: 0,
    grounded: air < 3,
    walkCycle: mem.walk,
    invincibleTimer: b.hitFlashTimer > 0 ? 0.2 : 0,
  });
  const tellU = br.state === 'tell' && m ? clamp01(br.t / m.tell) : 0;
  const actU = br.state === 'act' && m ? clamp01(br.t / Math.max(0.01, m.act)) : 0;
  const pose = m?.pose;
  if (br.state === 'tell' && pose) {
    if (pose === 'leap' || pose === 'charge' || pose === 'slam') p.ducking = true;
    else if (pose === 'lunge' || pose === 'bite' || pose === 'spit') {
      p.punching = true;
      p.swingCock = tellU;
      p.swingReach = 0;
    }
  } else if (br.state === 'act' && pose) {
    if (pose === 'lunge' || pose === 'spit') {
      p.punching = true;
      p.swingCock = 0;
      p.swingReach = pose === 'lunge' ? 1 : 0.7;
    } else if (pose === 'bite') {
      p.punching = true;
      p.swingCock = 0;
      p.swingReach = Math.abs(Math.sin(br.t * 17));
    } else if (pose === 'slam') {
      p.punching = true;
      p.punchType = 'mega';
      p.swingCock = 0;
      p.swingReach = 1;
    } else if (pose === 'charge') {
      p.punching = true;
      p.swingCock = 0;
      p.swingReach = 0.9;
      p.vx = b.facing * 300;
    } else if (pose === 'leap') {
      p.grounded = false;
      p.vy = actU < 0.5 ? -300 : 300;
    }
  } else if (br.state === 'stun') {
    p.ducking = true;
  } else if (br.state === 'roar') {
    p.punching = true;
    p.punchType = 'mega';
    p.swingCock = 0.6;
    p.swingReach = 0;
  }
  if (air >= 3) p.grounded = false;
  ctx.save();
  ctx.translate(b.x, feetY);
  ctx.scale(1.75, 1.75);
  ctx.translate(-b.x, -feetY);
  drawMilo(ctx, 7, p, time);
  ctx.restore();
  void def;
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

// ───────────────────────────── hazards ─────────────────────────────

export function drawHazards(ctx: CanvasRenderingContext2D, list: BossHazard[], time: number) {
  for (const h of list) {
    ctx.save();
    switch (h.kind) {
      case 'mark':
        drawMarker(ctx, h, time, 1);
        break;
      case 'column':
        if (h.warn > 0) drawMarker(ctx, h, time, 0.7);
        else drawColumn(ctx, h, time);
        break;
      case 'drop':
        if (h.warn > 0) {
          drawMarker(ctx, h, time, 0.8);
          if (h.look === 'rock') drawGrit(ctx, h, time);
        } else drawDrop(ctx, h, time);
        break;
      case 'push':
        drawSkyPush(ctx, h, time);
        break;
      case 'puddle':
        drawPuddle(ctx, h, time);
        break;
      case 'strip':
        drawStrip(ctx, h, time);
        break;
      case 'glob':
        drawGlob(ctx, h, time);
        break;
      case 'web':
        drawWebShot(ctx, h, time);
        break;
      case 'shock':
        drawShock(ctx, h, time);
        break;
      case 'wave':
        drawWave(ctx, h, time);
        break;
      case 'beam':
        drawBeam(ctx, h, time);
        break;
      case 'bolt':
        drawBolt(ctx, h, time);
        break;
    }
    ctx.restore();
  }
}

/** grit trickling down over the spot a stone is about to fall on (World 4's warning), thickening as it comes: the painted chips and
 *  pebbles (w4Grit.ts), each spinning, its own size, fading in at the top and out at the floor */
function drawGrit(ctx: CanvasRenderingContext2D, h: BossHazard, time: number) {
  const u = 1 - h.warn / Math.max(0.01, h.warnMax || 1);
  const top = h.floorY - 520;
  const span = 520;
  const n = 6 + Math.round(12 * u);
  ctx.save();
  ctx.globalAlpha = 0.7 + 0.3 * u;
  for (let k = 0; k < n; k++) {
    const gx = h.x - 14 + ((k * 7 + h.seed) % 28) + Math.sin(k * 2.3 + h.seed) * 3;
    const gy = top + ((time * 380 + k * (span / n) + h.seed * 3) % span);
    const end = Math.min(1, (gy - top) / 60, (h.floorY - gy) / 30);
    if (end <= 0) continue;
    drawGritBit(ctx, ((k * 0.137 + h.seed * 0.0711) % 1), gx, gy, 6 + (k % 3) * 2.5, time * (k % 2 ? 6 : -5) + k, end);
  }
  ctx.restore();
}

/**
 * A pulsing mark on the floor: something lands or erupts here very soon. Every boss uses the same painted marker (bossFx.ts): the
 * cracked ring of glowing earth on the ground, filling in brighter as the moment comes, and the painted "lands here" arrow bobbing over
 * it; a locked mark adds the two "get out" arrows pointing off it both ways and GET OFF! over it. A column or a drop also lights the
 * space above the mark with a soft red glow (a code touch) so the whole danger zone reads.
 */
function drawMarker(ctx: CanvasRenderingContext2D, h: BossHazard, time: number, strength: number) {
  const total = Math.max(0.01, h.warnMax || 1);
  const u = h.warn > 0 ? 1 - h.warn / total : 1;
  const fl = h.floorY;
  const rw = Math.max(40, h.w) * 0.75;
  const pulse = 0.6 + 0.4 * Math.sin(time * (14 + u * 22));

  // the danger zone itself: a red glow that fills in as the moment gets closer
  if (h.kind === 'column' || h.kind === 'drop') {
    const zh = h.kind === 'column' ? h.h : 340;
    const zw = Math.max(34, h.w);
    const g = ctx.createLinearGradient(0, fl - zh, 0, fl);
    g.addColorStop(0, 'rgba(239,68,68,0)');
    g.addColorStop(1, 'rgba(239,68,68,1)');
    ctx.globalAlpha = (0.18 + 0.32 * u) * strength * (0.85 + 0.15 * pulse);
    ctx.fillStyle = g;
    ctx.fillRect(h.x - zw / 2, fl - zh, zw, zh);
  }

  // the painted ring on the ground: it swells a little and brightens as the moment comes
  const ringW = rw * 2.5 * (1.12 - 0.12 * u);
  ctx.globalAlpha = (0.55 + 0.45 * u) * strength * (h.kind === 'mark' ? 0.8 + 0.2 * pulse : 0.88 + 0.12 * pulse);
  if (!drawFx(ctx, 'warnRing', h.x, fl - 2, ringW, { h: Math.max(18, ringW * 0.2) })) {
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.ellipse(h.x, fl - 3, rw, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // a locked mark says so: the painted arrows out of it both ways and GET OFF! over it (a mark that follows him has none)
  if (h.kind === 'mark' && h.locked) {
    ctx.globalAlpha = strength * (0.8 + 0.2 * pulse);
    for (const d of [-1, 1]) drawFx(ctx, 'warnArrow', h.x + d * (rw * 1.25 + 26 + 5 * pulse), fl - 16, 46, { flipX: d < 0 });
    ctx.globalAlpha = strength;
    ctx.font = `800 22px ${FONT_UI}`;
    ctx.textAlign = 'center';
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#7f1d1d';
    ctx.strokeText('GET OFF!', h.x, fl - 52);
    ctx.fillStyle = '#fee2e2';
    ctx.fillText('GET OFF!', h.x, fl - 52);
    return;
  }
  // the painted arrow over it, bobbing down at where it lands or erupts
  ctx.globalAlpha = strength * Math.min(1, 0.35 + u);
  drawFx(ctx, 'warnDown', h.x, fl - 30 - 6 * Math.abs(Math.sin(time * 6)), 26, { ay: 1 });
}

function drawColumn(ctx: CanvasRenderingContext2D, h: BossHazard, time: number) {
  const age = h.maxLife - h.life;
  if (h.look === 'shards') {
    // stone bursting off a rock pillar where she slammed into it (4-10)
    const u = clamp01(age / Math.max(0.05, h.maxLife));
    const pieces = ['shardA', 'shardB', 'shardC', 'shardD'] as const;
    for (let k = 0; k < 10; k++) {
      const a = -Math.PI * (0.1 + 0.8 * ((k * 0.37 + h.seed) % 1));
      const r = 30 + u * (90 + (k % 3) * 40);
      const x = h.x + Math.cos(a) * r * (h.w / 150);
      const y = h.floorY - h.h * 0.55 + Math.sin(a) * r * 0.8 + u * u * 60;
      if (!drawW4(ctx, pieces[k % 4], x, y, 22, { rot: u * (k - 5), alpha: 1 - u * 0.6 })) {
        ctx.fillStyle = k % 2 ? '#a8a29e' : '#57534e';
        ctx.globalAlpha = 1 - u * 0.6;
        ctx.fillRect(x - 6, y - 6, 12, 12);
      }
    }
    return;
  }
  const rise = ease(clamp01(age / Math.min(0.14, h.maxLife * 0.4)));
  const fade = clamp01(h.life / Math.min(0.2, h.maxLife * 0.5));
  const H = h.h * rise;
  const x = h.x;
  const fl = h.floorY;
  ctx.globalAlpha = fade;
  switch (h.look) {
    case 'tail': {
      // a thick scaly tail bursting up, curling at the tip
      ctx.fillStyle = h.color2;
      ctx.beginPath();
      ctx.moveTo(x - 24, fl);
      ctx.quadraticCurveTo(x - 20, fl - H * 0.7, x - 5 + Math.sin(time * 18) * 4, fl - H);
      ctx.quadraticCurveTo(x + 12, fl - H - 6, x + 14, fl - H + 12);
      ctx.quadraticCurveTo(x + 22, fl - H * 0.6, x + 24, fl);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = h.color;
      ctx.beginPath();
      ctx.moveTo(x - 17, fl);
      ctx.quadraticCurveTo(x - 13, fl - H * 0.7, x - 3, fl - H * 0.96);
      ctx.quadraticCurveTo(x + 8, fl - H * 0.7, x + 17, fl);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = h.color2;
      ctx.lineWidth = 2;
      for (let i = 1; i < 6; i++) {
        const yy = fl - (H * i) / 6;
        ctx.beginPath();
        ctx.moveTo(x - 14 + i, yy);
        ctx.lineTo(x + 14 - i, yy);
        ctx.stroke();
      }
      break;
    }
    case 'lava': {
      const g = ctx.createLinearGradient(0, fl - H, 0, fl);
      g.addColorStop(0, '#fde68a');
      g.addColorStop(0.35, h.color);
      g.addColorStop(1, h.color2);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x - 26, fl);
      for (let i = 0; i <= 6; i++) {
        const yy = fl - (H * i) / 6;
        const wob = Math.sin(time * 22 + i * 1.7) * 5;
        ctx.lineTo(x - 22 + i * 1.5 + wob, yy);
      }
      ctx.lineTo(x, fl - H - 8);
      for (let i = 6; i >= 0; i--) {
        const yy = fl - (H * i) / 6;
        const wob = Math.sin(time * 22 + i * 2.3 + 1) * 5;
        ctx.lineTo(x + 22 - i * 1.5 + wob, yy);
      }
      ctx.lineTo(x + 26, fl);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'web': {
      // the painted splat of web the strands rise out of
      drawFx(ctx, 'webSplat', x, fl + 1, 76, { ay: 0.75, alpha: fade });
      ctx.strokeStyle = h.color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = fade * 0.9;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(x + i * 6, fl);
        ctx.lineTo(x + i * 11 + Math.sin(time * 3 + i) * 2, fl - H);
        ctx.stroke();
      }
      ctx.lineWidth = 1.6;
      for (let k = 1; k < 7; k++) {
        const yy = fl - (H * k) / 7;
        ctx.beginPath();
        ctx.moveTo(x - 24, yy);
        ctx.quadraticCurveTo(x, yy + 7, x + 24, yy);
        ctx.stroke();
      }
      break;
    }
    case 'thorn': {
      // a thicket of thorns bursting out of the ground
      for (let i = -2; i <= 2; i++) {
        const hh = H * (1 - Math.abs(i) * 0.18);
        const cx = x + i * 11;
        ctx.fillStyle = h.color2;
        ctx.beginPath();
        ctx.moveTo(cx - 8, fl);
        ctx.quadraticCurveTo(cx - 5 + i * 2, fl - hh * 0.6, cx + i * 3, fl - hh);
        ctx.quadraticCurveTo(cx + 5 + i * 2, fl - hh * 0.6, cx + 8, fl);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = h.color;
        ctx.beginPath();
        ctx.moveTo(cx - 4, fl);
        ctx.quadraticCurveTo(cx - 2 + i * 2, fl - hh * 0.6, cx + i * 3, fl - hh * 0.95);
        ctx.quadraticCurveTo(cx + 1 + i * 2, fl - hh * 0.6, cx + 3, fl);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case 'rock': {
      ctx.fillStyle = h.color2;
      for (let i = -1; i <= 1; i++) {
        const hh = H * (i === 0 ? 1 : 0.72);
        const cx = x + i * 16;
        ctx.beginPath();
        ctx.moveTo(cx - 12, fl);
        ctx.lineTo(cx - 5, fl - hh);
        ctx.lineTo(cx + 3, fl - hh * 0.92);
        ctx.lineTo(cx + 12, fl);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = h.color;
      ctx.beginPath();
      ctx.moveTo(x - 9, fl);
      ctx.lineTo(x - 3, fl - H);
      ctx.lineTo(x + 2, fl - H * 0.92);
      ctx.lineTo(x + 8, fl);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'lightning': {
      // a bolt out of the roof that forks as it comes down, a hot white core in a violet glow, and a flash where it lands
      const top = fl - 560;
      const path = (jit: number) => {
        ctx.beginPath();
        ctx.moveTo(x + jit * 0.3, top);
        const n = 9;
        for (let i = 1; i <= n; i++) {
          const yy = top + ((fl - top) * i) / n;
          const wob = i === n ? 0 : Math.sin(h.seed * 11 + i * 2.3 + Math.floor(time * 18) * 1.7) * (14 + jit);
          ctx.lineTo(x + wob, yy);
        }
      };
      ctx.lineJoin = 'round';
      ctx.strokeStyle = h.color2;
      ctx.globalAlpha = fade * 0.45;
      ctx.lineWidth = 30;
      path(4);
      ctx.stroke();
      ctx.globalAlpha = fade;
      ctx.strokeStyle = h.color;
      ctx.lineWidth = 11;
      path(4);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4.2;
      path(4);
      ctx.stroke();
      ctx.fillStyle = 'rgba(233, 213, 255, 0.6)';
      ctx.beginPath();
      ctx.ellipse(x, fl - 4, 56 * rise, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'crystal': {
      // a cluster of glowing blue crystals thrusting out of the floor: a tall middle spire and shorter ones to each side
      const spire = (cx: number, hh: number, half: number, lean: number) => {
        const g = ctx.createLinearGradient(cx - half, 0, cx + half, 0);
        g.addColorStop(0, h.color2);
        g.addColorStop(0.55, h.color);
        g.addColorStop(1, '#e0f7ff');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(cx - half, fl);
        ctx.lineTo(cx - half * 0.7 + lean, fl - hh * 0.78);
        ctx.lineTo(cx + lean, fl - hh);
        ctx.lineTo(cx + half * 0.72 + lean, fl - hh * 0.74);
        ctx.lineTo(cx + half, fl);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(224, 247, 255, 0.85)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(cx - half * 0.2, fl);
        ctx.lineTo(cx + lean * 0.8, fl - hh * 0.92);
        ctx.stroke();
      };
      spire(x - 20, H * 0.62, 13, -6);
      spire(x + 21, H * 0.7, 13, 7);
      spire(x, H, 17, 2);
      ctx.fillStyle = 'rgba(147, 220, 255, 0.35)';
      ctx.beginPath();
      ctx.ellipse(x, fl - 4, 40, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    default: {
      const g = ctx.createLinearGradient(x - 24, 0, x + 24, 0);
      g.addColorStop(0, h.color2);
      g.addColorStop(0.5, h.color);
      g.addColorStop(1, h.color2);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x - 26, fl);
      ctx.quadraticCurveTo(x - 20, fl - H * 0.8, x, fl - H);
      ctx.quadraticCurveTo(x + 20, fl - H * 0.8, x + 26, fl);
      ctx.closePath();
      ctx.fill();
    }
  }
}

/**
 * A small roost bat, seen from the side and facing +x: a furred body, a pointed head with ears and a hot red eye, and a scalloped wing
 * (with a second, darker one behind it) that beats with `flap` (-1..1). `s` is its size (the length of the body).
 */
function drawMiniBat(ctx: CanvasRenderingContext2D, flap: number, s: number, c1: string, c2: string) {
  const wing = (alpha: number, len: number, fill: string) => {
    const sx = -s * 0.02;
    const sy = -s * 0.1;
    const tx = sx + Math.cos(alpha) * len;
    const ty = sy + Math.sin(alpha) * len;
    const rx = -s * 0.36;
    const ry = s * 0.06;
    // two scallops on the trailing edge between the tip and the hip
    const m1x = tx * 0.55 + rx * 0.45 + Math.cos(alpha + 0.5) * len * 0.12;
    const m1y = ty * 0.55 + ry * 0.45 + Math.sin(alpha + 0.5) * len * 0.12;
    ctx.fillStyle = fill;
    ctx.strokeStyle = '#05030c';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo((sx + tx) / 2 + Math.cos(alpha - 1.4) * len * 0.1, (sy + ty) / 2 + Math.sin(alpha - 1.4) * len * 0.1, tx, ty);
    ctx.quadraticCurveTo(tx * 0.8 + rx * 0.2, ty * 0.8 + ry * 0.2 + len * 0.08, m1x, m1y);
    ctx.quadraticCurveTo(m1x * 0.6 + rx * 0.4, m1y * 0.6 + ry * 0.4 + len * 0.08, rx, ry);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };
  const alpha = Math.PI + 0.95 * flap;
  wing(alpha + 0.35, s * 0.8, '#1c0f3a');
  ctx.fillStyle = c1;
  ctx.strokeStyle = '#05030c';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.4, s * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(s * 0.38, -s * 0.05, s * 0.17, s * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(s * 0.32, -s * 0.16);
  ctx.lineTo(s * 0.35, -s * 0.36);
  ctx.lineTo(s * 0.43, -s * 0.17);
  ctx.moveTo(s * 0.42, -s * 0.16);
  ctx.lineTo(s * 0.49, -s * 0.33);
  ctx.lineTo(s * 0.52, -s * 0.13);
  ctx.fill();
  ctx.fillStyle = '#ff4d5e';
  ctx.beginPath();
  ctx.arc(s * 0.45, -s * 0.08, s * 0.04, 0, Math.PI * 2);
  ctx.fill();
  wing(alpha, s * 0.95, c2);
}

function drawDrop(ctx: CanvasRenderingContext2D, h: BossHazard, time: number) {
  const s = h.w;
  // a stone from a broken pillar (4-10): World 4's painted rock, tumbling
  if (h.look === 'rock' && drawW4(ctx, (Math.round(h.seed) % 2) ? 'rockMoss' : 'rock', h.x, h.y + s * 0.55, s * 1.25, { rot: time * 5 + h.seed })) return;
  ctx.translate(h.x, h.y);
  // a faint ground shadow so you can see where it is going to land
  ctx.save();
  ctx.translate(-h.x, -h.y);
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.ellipse(h.x, h.floorY - 3, s * 0.6, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (h.look === 'spike') {
    ctx.fillStyle = h.color2;
    ctx.beginPath();
    ctx.moveTo(-s * 0.5, -s * 0.5);
    ctx.lineTo(s * 0.5, -s * 0.5);
    ctx.lineTo(0, s * 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = h.color;
    ctx.beginPath();
    ctx.moveTo(-s * 0.3, -s * 0.5);
    ctx.lineTo(s * 0.05, -s * 0.5);
    ctx.lineTo(-s * 0.02, s * 0.55);
    ctx.closePath();
    ctx.fill();
  } else if (h.look === 'bat') {
    // a roost bat folding its wings and dropping head first
    ctx.rotate(Math.PI * 0.5);
    drawMiniBat(ctx, Math.sin(time * 26 + h.seed) * 0.35 - 0.45, s * 1.6, h.color2, h.color);
  } else if (h.look === 'cocoon' && drawFx(ctx, 'cocoon', 0, 0, s * 1.15, { ay: 0.55 })) {
    // the painted cocoon on its thread
    ctx.strokeStyle = 'rgba(226, 232, 248, 0.7)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, -s * 1.2);
    ctx.lineTo(0, -s * 9);
    ctx.stroke();
  } else if (h.look === 'cocoon') {
    // (the sheet is still loading: a cocoon drawn in code for the moment)
    ctx.strokeStyle = 'rgba(226, 232, 248, 0.7)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.9);
    ctx.lineTo(0, -s * 9);
    ctx.stroke();
    const g = ctx.createLinearGradient(-s * 0.5, 0, s * 0.5, 0);
    g.addColorStop(0, '#6b7280');
    g.addColorStop(0.45, '#e5e7eb');
    g.addColorStop(1, '#4b5563');
    ctx.fillStyle = g;
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.5, s * 0.82, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(17, 24, 39, 0.5)';
    ctx.lineWidth = 1.4;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.ellipse(0, i * s * 0.28, s * 0.5 * Math.sqrt(1 - (i * 0.34) ** 2), 3, 0, 0, Math.PI);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(30, 20, 28, 0.35)';
    ctx.beginPath();
    ctx.ellipse(s * 0.05, s * 0.1, s * 0.22, s * 0.34, 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.rotate(time * 3 + h.seed);
    ctx.fillStyle = h.color2;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const r = s * (0.5 + 0.1 * Math.sin(h.seed + i * 2.1));
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = h.color;
    ctx.beginPath();
    ctx.arc(-s * 0.12, -s * 0.12, s * 0.28, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPuddle(ctx: CanvasRenderingContext2D, h: BossHazard, time: number) {
  const fade = clamp01(h.life / 0.8);
  const grow = ease(clamp01((h.maxLife - h.life) / 0.2));
  ctx.globalAlpha = 0.85 * fade;
  const fl = h.floorY;
  const w = h.w * 0.5 * grow;
  ctx.fillStyle = h.color2;
  ctx.beginPath();
  ctx.ellipse(h.x, fl - 3, w, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = h.color;
  ctx.beginPath();
  ctx.ellipse(h.x, fl - 4, w * 0.82, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // bubbles
  ctx.fillStyle = h.look === 'lava' ? '#fde68a' : '#ecfccb';
  for (let i = 0; i < 3; i++) {
    const ph = (time * 1.4 + i * 0.37 + h.seed) % 1;
    ctx.globalAlpha = 0.7 * fade * (1 - ph);
    ctx.beginPath();
    ctx.arc(h.x + (i - 1) * w * 0.45, fl - 6 - ph * 10, 2 + i * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGlob(ctx: CanvasRenderingContext2D, h: BossHazard, time: number) {
  const r = h.w * 0.5;
  const sq = 1 + Math.min(0.25, Math.abs(h.vy) / 2400);
  ctx.translate(h.x, h.y);
  ctx.rotate(Math.atan2(h.vy, h.vx) * 0.3);
  ctx.fillStyle = h.color2;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.15 * sq, r * 0.95 / sq, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = h.color;
  ctx.beginPath();
  ctx.ellipse(-1, -1, r * 0.85 * sq, r * 0.7 / sq, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.65)';
  ctx.beginPath();
  ctx.arc(-r * 0.35, -r * 0.35, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
  // drips
  ctx.fillStyle = h.color;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.arc(-h.vx * 0.012, -h.vy * 0.012 + Math.sin(time * 20) * 1.5, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawWebShot(ctx: CanvasRenderingContext2D, h: BossHazard, time: number) {
  const r = h.w * 0.5;
  // the painted silk ball, turning as it flies
  if (drawFx(ctx, 'silkBall', h.x, h.y, r * 2.4, { rot: time * 6 })) return;
  ctx.translate(h.x, h.y);
  ctx.rotate(time * 6);
  ctx.strokeStyle = h.color;
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * r * 1.2, Math.sin(a) * r * 1.2);
    ctx.stroke();
  }
  for (const k of [0.45, 0.85]) {
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const rr = r * 1.2 * k;
      if (i === 0) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
      else ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(248,250,252,.35)';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
  ctx.fill();
}

function drawShock(ctx: CanvasRenderingContext2D, h: BossHazard, time: number) {
  const fl = h.floorY;
  const hh = h.h;
  const fade = clamp01(h.life / 0.5);
  ctx.globalAlpha = fade;
  ctx.translate(h.x, fl);
  ctx.scale(h.dir, 1);
  // a rolling lump of the ground, leaning into its direction of travel
  ctx.fillStyle = h.color2;
  ctx.beginPath();
  ctx.moveTo(-h.w * 0.6, 0);
  ctx.quadraticCurveTo(-h.w * 0.1, -hh * 0.5, h.w * 0.35, -hh * 1.0);
  ctx.quadraticCurveTo(h.w * 0.55, -hh * 0.4, h.w * 0.6, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = h.color;
  ctx.beginPath();
  ctx.moveTo(-h.w * 0.4, 0);
  ctx.quadraticCurveTo(-h.w * 0.05, -hh * 0.4, h.w * 0.3, -hh * 0.85);
  ctx.quadraticCurveTo(h.w * 0.42, -hh * 0.35, h.w * 0.45, 0);
  ctx.closePath();
  ctx.fill();
  // dust behind it
  ctx.fillStyle = 'rgba(255,255,255,.35)';
  for (let i = 0; i < 3; i++) {
    const ph = (time * 3 + i * 0.33) % 1;
    ctx.globalAlpha = fade * (1 - ph) * 0.6;
    ctx.beginPath();
    ctx.arc(-h.w * 0.5 - ph * 30, -4 - ph * 12, 3 + ph * 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawWave(ctx: CanvasRenderingContext2D, h: BossHazard, time: number) {
  const fade = clamp01(h.life / 0.5);
  // the painted ones: Crocus Rex's breaking wave of mud, the Tarantula Queen's ripple of silk, rolling the way they run
  if (h.look === 'mud' || h.look === 'silk') {
    const w = h.look === 'mud' ? h.h * 1.5 : h.w * 2.2;
    const wob = 1 + 0.04 * Math.sin(time * 18);
    if (drawFx(ctx, h.look === 'mud' ? 'mudWave' : 'silkRipple', h.x, h.floorY + 2, w * wob, { ay: 1, flipX: h.dir < 0, alpha: fade })) return;
  }
  ctx.translate(h.x, h.y);
  ctx.scale(h.dir, 1);
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const k = 1 - i * 0.22;
    ctx.globalAlpha = fade * (0.95 - i * 0.28);
    ctx.strokeStyle = i === 0 ? '#ffffff' : h.color;
    ctx.lineWidth = 4 - i;
    ctx.beginPath();
    ctx.arc(-i * 11 - 4, 0, h.h * 0.5 * k + Math.sin(time * 18 + i) * 1.2, -Math.PI * 0.42, Math.PI * 0.42);
    ctx.stroke();
  }
  ctx.globalAlpha = fade * 0.25;
  ctx.fillStyle = h.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, h.w * 0.5, h.h * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawBeam(ctx: CanvasRenderingContext2D, h: BossHazard, time: number) {
  const age = h.maxLife - h.life;
  const grow = ease(clamp01(age / 0.1));
  const fade = clamp01(h.life / 0.15);
  const len = h.w * grow;
  const x0 = h.ox ?? h.x - (h.dir * h.w) / 2;
  ctx.globalAlpha = fade;
  ctx.translate(x0, h.y);
  ctx.scale(h.dir, 1);
  const th = h.h;
  if (h.look === 'fire') {
    const g = ctx.createLinearGradient(0, 0, len, 0);
    g.addColorStop(0, '#fff7ed');
    g.addColorStop(0.3, h.color);
    g.addColorStop(1, 'rgba(220,38,38,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -th * 0.2);
    const n = 9;
    for (let i = 0; i <= n; i++) {
      const x = (len * i) / n;
      const spread = th * (0.25 + 0.5 * (i / n));
      ctx.lineTo(x, -spread + Math.sin(time * 28 + i * 1.7) * 4);
    }
    for (let i = n; i >= 0; i--) {
      const x = (len * i) / n;
      const spread = th * (0.25 + 0.5 * (i / n));
      ctx.lineTo(x, spread + Math.sin(time * 28 + i * 2.1 + 1) * 4);
    }
    ctx.closePath();
    ctx.fill();
  } else if (h.look === 'vine') {
    ctx.lineCap = 'round';
    ctx.strokeStyle = h.color2;
    ctx.lineWidth = 12;
    ctx.beginPath();
    for (let i = 0; i <= 16; i++) {
      const x = (len * i) / 16;
      const y = Math.sin(time * 30 + i * 0.9) * 4;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.strokeStyle = h.color;
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.fillStyle = '#c4b5fd';
    for (let i = 1; i < 8; i++) {
      const x = (len * i) / 8;
      ctx.beginPath();
      ctx.moveTo(x - 4, -6);
      ctx.lineTo(x, -15);
      ctx.lineTo(x + 4, -6);
      ctx.closePath();
      ctx.fill();
    }
  } else if (h.look === 'venom' && drawFx(ctx, 'venomJet', 0, 0, Math.max(40, len), { ax: 0, h: th * 1.3 })) {
    // the Queen's painted venom jet, sprayed out to its full length
  } else if (h.look === 'jab') {
    // the painted spear is already in the picture: just a pale streak so the reach of the thrust reads
    const g = ctx.createLinearGradient(0, 0, len, 0);
    g.addColorStop(0, 'rgba(200, 240, 255, 0)');
    g.addColorStop(0.7, 'rgba(200, 240, 255, 0.5)');
    g.addColorStop(1, 'rgba(255, 255, 255, 0.85)');
    ctx.strokeStyle = g;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(len, 0);
    ctx.stroke();
  } else if (h.look === 'tongue') {
    ctx.strokeStyle = h.color2;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(len, 0);
    ctx.stroke();
    ctx.strokeStyle = h.color;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(len, 0);
    ctx.stroke();
    ctx.fillStyle = h.color;
    ctx.beginPath();
    ctx.arc(len, 0, 14, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // laser
    const g = ctx.createLinearGradient(0, -th / 2, 0, th / 2);
    g.addColorStop(0, 'rgba(253,224,71,0)');
    g.addColorStop(0.5, '#fffbeb');
    g.addColorStop(1, 'rgba(253,224,71,0)');
    ctx.fillStyle = h.color;
    ctx.globalAlpha = fade * 0.5;
    ctx.fillRect(0, -th / 2, len, th);
    ctx.globalAlpha = fade;
    ctx.fillStyle = g;
    ctx.fillRect(0, -th / 2, len, th);
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = fade * (0.7 + 0.3 * Math.sin(time * 50));
    ctx.fillRect(0, -3, len, 6);
  }
}

function drawBolt(ctx: CanvasRenderingContext2D, h: BossHazard, time: number) {
  ctx.translate(h.x, h.y);
  const ang = Math.atan2(h.vy, h.vx);
  ctx.rotate(ang);
  if (h.look === 'club') {
    // the general's spiked club, tumbling end over end
    ctx.rotate(-ang + time * 16 * (h.vx >= 0 ? 1 : -1));
    ctx.fillStyle = '#6b4a2f';
    ctx.beginPath();
    ctx.moveTo(-22, -3);
    ctx.lineTo(8, -3);
    ctx.lineTo(24, -9);
    ctx.lineTo(24, 9);
    ctx.lineTo(8, 3);
    ctx.lineTo(-22, 3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#2b1b10';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = h.color;
    for (const [sx, sy] of [[12, -9], [18, -11], [18, 11], [12, 9], [22, 0]]) {
      ctx.beginPath();
      ctx.moveTo(sx - 2.5, sy > 0 ? sy - 2 : sy + 2);
      ctx.lineTo(sx, sy + (sy > 0 ? 4 : sy < 0 ? -4 : 0));
      ctx.lineTo(sx + 2.5, sy > 0 ? sy - 2 : sy + 2);
      ctx.closePath();
      ctx.fill();
    }
  } else if (h.look === 'spear') {
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-h.w * 0.9, 0);
    ctx.lineTo(h.w * 0.3, 0);
    ctx.stroke();
    ctx.fillStyle = h.color;
    ctx.beginPath();
    ctx.moveTo(h.w * 0.3, -6);
    ctx.lineTo(h.w * 0.75, 0);
    ctx.lineTo(h.w * 0.3, 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = h.color2;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (h.look === 'thorn') {
    ctx.fillStyle = h.color2;
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(-10, -5);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-10, 5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = h.color;
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(-2, -2.4);
    ctx.lineTo(-2, 2.4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c4b5fd';
    ctx.beginPath();
    ctx.arc(13, 0, 1.8, 0, Math.PI * 2);
    ctx.fill();
  } else if (h.look === 'bat') {
    // a roost bat in a flock, beating its wings; it flies sideways, so it is never drawn upside down
    if (Math.abs(ang) > Math.PI / 2) ctx.scale(1, -1);
    drawMiniBat(ctx, Math.sin(time * 22 + h.id * 1.7), 58, '#3b1a78', h.color);
  } else if (h.look === 'feather' && drawFx(ctx, 'feather', 0, 0, 34)) {
    // the Sky Sovereign's painted feather dart
  } else if (h.look === 'feather') {
    ctx.fillStyle = h.color2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = h.color;
    ctx.beginPath();
    ctx.ellipse(1, 0, 10, 2.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.lineTo(12, 0);
    ctx.stroke();
  } else {
    ctx.fillStyle = h.color2;
    ctx.beginPath();
    ctx.ellipse(0, 0, h.w * 0.5, h.h * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = h.color;
    ctx.beginPath();
    ctx.ellipse(1, 0, h.w * 0.36, h.h * 0.32, Math.sin(time * 20) * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * A giant's weak point. While the head is covered it is only a faint ember, so you learn where it is; in the opening after an attack
 * (and while the boss is stunned) it blazes: a pulsing ring with a cross-hair, the signal to jump up and strike.
 */
function drawWeakPoint(ctx: CanvasRenderingContext2D, b: BossEntity, def: BossDef, time: number, floor: number) {
  const r = weakRect(b, def, floor);
  const br = b.ai;
  if (!r || !br || br.state === 'dying' || b.defeated) return;
  const open = weakOpen(b, def);
  if (def.weakAt) {
    // a head that comes down to be hit: only the painted gold ring round it while it is open (the head itself says where; no ember up high)
    if (!open) return;
    const pulse = 0.5 + 0.5 * Math.sin(time * 9);
    const rw = (r.w * 0.58 + 6 * pulse) * 2.3;
    drawFx(ctx, 'weakRing', r.x + r.w / 2, r.y + r.h * 0.55, rw, { h: (r.h * 0.62 + 4 * pulse) * 2.3, alpha: 0.85 + 0.15 * pulse });
    return;
  }
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  const rad = Math.min(r.w, r.h) * 0.5;
  ctx.save();
  if (!open) {
    // the last moments of an attack that ends in an opening: the ember swells in a slow, dim pulse of the boss's own colour (not yet!).
    // Only the opening itself is bright gold with the white ring and cross, with the chime and NOW!, so a spot that can't be hurt
    // never looks like one that can (2026-10-26, QA: punches thrown at the warm-up glow)
    const soon = opensSoon(b, def);
    ctx.globalAlpha = soon ? 0.32 + 0.16 * Math.sin(time * 7) : 0.28 + 0.1 * Math.sin(time * 3);
    ctx.fillStyle = def.color;
    ctx.beginPath();
    ctx.arc(cx, cy, rad * (soon ? 0.34 + 0.04 * Math.sin(time * 7) : 0.22), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  // the last half second of the opening it flickers: time to get clear
  if (def.openCue && openLeft(b, def, isEasy() && def.openCue ? EASY_OPEN_MUL : 1) < 0.5 && Math.sin(time * 40) < -0.2) {
    ctx.restore();
    return;
  }
  const pulse = 0.5 + 0.5 * Math.sin(time * 14);
  const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, rad * 1.5);
  g.addColorStop(0, 'rgba(255,255,255,0.95)');
  g.addColorStop(0.35, 'rgba(253,224,71,0.7)');
  g.addColorStop(1, 'rgba(251,146,60,0)');
  ctx.globalAlpha = 0.75 + 0.25 * pulse;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, rad * 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // the painted gold target ring (boss-fx.webp 'weakRing'), breathing and turning slowly
  const d = rad * 2.6 * (0.9 + 0.1 * pulse);
  drawFx(ctx, 'weakRing', cx, cy, d, { rot: time * 0.8 });
  ctx.restore();
}

/** a piranha caught in a leap: grey back, red belly, a mouth of teeth. Drawn at the origin facing right */
/** the river flooding in along the floor from the arena edge: a rippling warning first, then dark water full of leaping piranhas */
function drawFlood(ctx: CanvasRenderingContext2D, h: BossHazard, time: number) {
  const fl = h.floorY;
  const dir = h.dir || 1;
  const edge = h.ox ?? h.x;
  const full = h.growTo ?? h.w;
  if (h.warn > 0) {
    // the warning: rings spread and the mud darkens along where the water is going to reach
    const u = 1 - h.warn / Math.max(0.01, h.warnMax);
    const pulse = 0.55 + 0.45 * Math.sin(time * (8 + u * 16));
    const g = ctx.createLinearGradient(edge, 0, edge + dir * full, 0);
    g.addColorStop(0, h.color);
    g.addColorStop(1, 'rgba(63,143,134,0)');
    ctx.globalAlpha = (0.3 + 0.4 * u) * pulse;
    ctx.fillStyle = g;
    ctx.fillRect(Math.min(edge, edge + dir * full), fl - 10, full, 10);
    ctx.globalAlpha = 0.6 * u;
    ctx.strokeStyle = '#99f6e4';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const px = edge + dir * (full * ((i + 0.5) / 4));
      const r = ((time * 1.4 + i * 0.3) % 1) * 22;
      ctx.beginPath();
      ctx.ellipse(px, fl - 3, r, r * 0.22, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    return;
  }
  const x0 = Math.min(edge, edge + dir * h.w);
  ctx.globalAlpha = 1;
  // the painted river water (a strip, mirrored copy to copy so the joins match), sliding a little as it laps
  drawFxRun(ctx, 'flood', x0, x0 + h.w, fl + 2, 30, { ay: 1, offset: Math.sin(time * 1.3) * 10 + time * 14 });
  // the piranhas, each leaping in turn
  const n = Math.max(1, Math.floor(h.w / 70));
  for (let i = 0; i < n; i++) {
    const per = 1.5 + ((i * 37 + Math.floor(h.seed * 10)) % 7) * 0.12;
    const ph = (time / per + i * 0.37 + h.seed) % 1;
    if (ph > 0.38) continue;
    const u = ph / 0.38;
    const px = x0 + (h.w * (i + 0.5 + Math.sin(h.seed * 9 + i) * 0.25)) / n;
    const py = fl - 14 - Math.sin(u * Math.PI) * (13 + (i % 3) * 5);
    const ang = -Math.cos(u * Math.PI) * 0.9 * -dir;
    drawFx(ctx, 'piranha', px, py, 36, { flipX: dir < 0, rot: -ang });
    // the splash where it goes in and comes out
    if (u < 0.14 || u > 0.86) drawFx(ctx, 'splash', px, fl - 12, 30, { ay: 1, alpha: 0.9 });
  }
}

/** a thunderhead rolling in along the floor from the arena edge: gathering and flickering first, then a dark bank of cloud that crackles */
function drawStorm(ctx: CanvasRenderingContext2D, h: BossHazard, time: number) {
  const fl = h.floorY;
  const dir = h.dir || 1;
  const edge = h.ox ?? h.x;
  const full = h.growTo ?? h.w;
  // a painted thundercloud (three different ones, taken in turn), centred on (cx, cy), r its half-height
  const cloud = (cx: number, cy: number, r: number, a: number, k: number) => {
    drawFx(ctx, `storm${((k % 3) + 3) % 3}`, cx, cy, r * 3.4, { alpha: a });
  };
  if (h.warn > 0) {
    // the warning: a violet haze thickens along where the storm is going to reach, with now and then a flicker
    const u = 1 - h.warn / Math.max(0.01, h.warnMax);
    const pulse = 0.55 + 0.45 * Math.sin(time * (8 + u * 16));
    const g = ctx.createLinearGradient(edge, 0, edge + dir * full, 0);
    g.addColorStop(0, h.color);
    g.addColorStop(1, 'rgba(70,50,130,0)');
    ctx.globalAlpha = (0.3 + 0.4 * u) * pulse;
    ctx.fillStyle = g;
    ctx.fillRect(Math.min(edge, edge + dir * full), fl - 12, full, 12);
    ctx.globalAlpha = 1;
    for (let i = 0; i < 3; i++) cloud(edge + dir * (full * (0.2 + i * 0.3)), fl - 14, 16 + 8 * u, 0.4 * u, i);
    return;
  }
  const x0 = Math.min(edge, edge + dir * h.w);
  ctx.globalAlpha = 1;
  const n = Math.max(2, Math.floor(h.w / 34));
  for (let i = 0; i < n; i++) {
    const cx = x0 + (h.w * (i + 0.5)) / n;
    cloud(cx, fl - 14 + Math.sin(time * 2 + i * 1.7 + h.seed * 7) * 2.4, 17 + (i % 3) * 3, 1, i);
  }
  // lightning forking down from the bank (the painted bolt), flickering at a different rate along its length
  const nb = Math.max(1, Math.floor(h.w / 90));
  for (let i = 0; i < nb; i++) {
    const ph = (time * (1.7 + (i % 3) * 0.4) + i * 0.37 + h.seed) % 1;
    if (ph > 0.22) continue;
    const bx = x0 + (h.w * (i + 0.5 + Math.sin(h.seed * 9 + i) * 0.25)) / nb;
    drawFx(ctx, 'bolt', bx, fl - 1, 16, { ay: 1, h: 34, alpha: 1 - ph / 0.22, flipX: i % 2 === 1 });
  }
}

/** a burning palisade creeping in from the arena edge: a haze of heat first, then a row of charred stakes with flames licking up them */
function drawBlaze(ctx: CanvasRenderingContext2D, h: BossHazard, time: number) {
  const fl = h.floorY;
  const dir = h.dir || 1;
  const edge = h.ox ?? h.x;
  const full = h.growTo ?? h.w;
  if (h.warn > 0) {
    const u = 1 - h.warn / Math.max(0.01, h.warnMax);
    const pulse = 0.55 + 0.45 * Math.sin(time * (8 + u * 16));
    const g = ctx.createLinearGradient(edge, 0, edge + dir * full, 0);
    g.addColorStop(0, h.color);
    g.addColorStop(1, 'rgba(127,29,29,0)');
    ctx.globalAlpha = (0.3 + 0.4 * u) * pulse;
    ctx.fillStyle = g;
    ctx.fillRect(Math.min(edge, edge + dir * full), fl - 14, full, 14);
    ctx.globalAlpha = 1;
    return;
  }
  const x0 = Math.min(edge, edge + dir * h.w);
  // the glow on the floor under it
  const gl = ctx.createLinearGradient(0, fl - 70, 0, fl);
  gl.addColorStop(0, 'rgba(251,146,60,0)');
  gl.addColorStop(1, 'rgba(251,146,60,0.45)');
  ctx.fillStyle = gl;
  ctx.fillRect(x0, fl - 70, h.w, 70);
  // charred stakes
  const n = Math.max(2, Math.floor(h.w / 24));
  for (let i = 0; i < n; i++) {
    const cx = x0 + (h.w * (i + 0.5)) / n;
    const hh = 34 + ((i * 37 + Math.floor(h.seed * 10)) % 5) * 5;
    ctx.fillStyle = '#1c0c08';
    ctx.beginPath();
    ctx.moveTo(cx - 5, fl);
    ctx.lineTo(cx - 5, fl - hh);
    ctx.lineTo(cx, fl - hh - 9);
    ctx.lineTo(cx + 5, fl - hh);
    ctx.lineTo(cx + 5, fl);
    ctx.closePath();
    ctx.fill();
  }
  // flames, three tongues to a stake, flickering at their own rates
  for (let i = 0; i < n; i++) {
    const cx = x0 + (h.w * (i + 0.5)) / n;
    for (let j = 0; j < 2; j++) {
      const f = 0.75 + 0.25 * Math.sin(time * (9 + j * 4) + i * 1.9 + j);
      const fh = (30 + ((i + j) % 3) * 10) * f;
      const fx = cx + (j - 0.5) * 9;
      ctx.fillStyle = j ? '#f97316' : '#dc2626';
      ctx.beginPath();
      ctx.moveTo(fx - 7, fl - 6);
      ctx.quadraticCurveTo(fx - 8, fl - fh * 0.6, fx + Math.sin(time * 7 + i) * 2, fl - fh - 18);
      ctx.quadraticCurveTo(fx + 8, fl - fh * 0.6, fx + 7, fl - 6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fde68a';
      ctx.beginPath();
      ctx.ellipse(fx, fl - 12, 3, fh * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** lava (or anything else) that rises along the floor from the arena edge: a glowing crack first, then a bubbling pool that grows */
function drawStrip(ctx: CanvasRenderingContext2D, h: BossHazard, time: number) {
  if (h.look === 'flood') return drawFlood(ctx, h, time);
  if (h.look === 'storm') return drawStorm(ctx, h, time);
  if (h.look === 'blaze') return drawBlaze(ctx, h, time);
  const fl = h.floorY;
  const dir = h.dir || 1;
  const edge = h.ox ?? h.x;
  const full = h.growTo ?? h.w;
  if (h.warn > 0) {
    // the warning: the floor glows red along where the lava is going to reach
    const u = 1 - h.warn / Math.max(0.01, h.warnMax);
    const pulse = 0.55 + 0.45 * Math.sin(time * (10 + u * 18));
    ctx.globalAlpha = (0.25 + 0.4 * u) * pulse;
    const g = ctx.createLinearGradient(edge, 0, edge + dir * full, 0);
    g.addColorStop(0, h.color);
    g.addColorStop(1, h.look === 'venom' ? 'rgba(163,230,53,0)' : 'rgba(239,68,68,0)');
    ctx.fillStyle = g;
    ctx.fillRect(Math.min(edge, edge + dir * full), fl - 12, full, 12);
    return;
  }
  const x0 = Math.min(edge, edge + dir * h.w);
  ctx.globalAlpha = 1;
  ctx.fillStyle = h.color2;
  ctx.fillRect(x0, fl - 16, h.w, 16);
  const g = ctx.createLinearGradient(0, fl - 16, 0, fl);
  g.addColorStop(0, h.look === 'venom' ? '#ecfccb' : '#fde68a');
  g.addColorStop(0.45, h.color);
  g.addColorStop(1, h.color2);
  ctx.fillStyle = g;
  ctx.fillRect(x0, fl - 15, h.w, 15);
  // a heat glow above it and bubbles that pop
  ctx.globalAlpha = 0.35 + 0.1 * Math.sin(time * 5);
  const glow = ctx.createLinearGradient(0, fl - 70, 0, fl - 15);
  const gl = h.look === 'venom' ? '163,230,53' : '251,146,60';
  glow.addColorStop(0, `rgba(${gl},0)`);
  glow.addColorStop(1, `rgba(${gl},0.8)`);
  ctx.fillStyle = glow;
  ctx.fillRect(x0, fl - 70, h.w, 55);
  ctx.fillStyle = '#fef3c7';
  for (let i = 0; i < Math.max(2, Math.floor(h.w / 38)); i++) {
    const ph = (time * 1.3 + i * 0.41 + h.seed) % 1;
    ctx.globalAlpha = 0.8 * (1 - ph);
    ctx.beginPath();
    ctx.arc(x0 + ((i + 0.5) * h.w) / Math.max(2, Math.floor(h.w / 38)), fl - 8 - ph * 22, 2.5 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }
}
