import type { BossEntity, PlayerState } from './types.ts';
import { drawPaintedCardBoss } from './bossArt.ts';
import { renderScenery, renderOverlay, withBakeScale } from './scenery.ts';
import { drawHeroSloth, drawGirlfriendDaisy, drawBossEntity } from './vectorArt.ts';
import { drawJennifurSprite } from './jennifurSprite.ts';
import { drawMilo } from './miloVariants.ts';
import type { StoryScene, SceneActor } from './story.ts';
import { drawCastleBackdrop, FORTRESS_CASTLE } from './castleSprites.ts';

export const SCENE_W = 960;
export const SCENE_H = 540;

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

function makeBoss(angry: boolean, beaten: boolean): BossEntity {
  return {
    id: 1, type: 'boss', x: 0, y: -17, vx: 0, vy: 0, width: 60, height: 60, hp: 10, maxHp: 10,
    facing: 1, patrolMinX: 0, patrolMaxX: 0, attackCooldown: 0, telegraphTimer: 0,
    isAttacking: angry, animTimer: 0, hitFlashTimer: 0, defeated: beaten, koTimer: 0,
    behaviorTimer: 0, phase: 1, phaseMax: 3, specialAttackTimer: 0, shieldActive: false,
    dialogueIntro: '', dialogueDefeat: '',
  } as unknown as BossEntity;
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

function drawBranch(ctx: CanvasRenderingContext2D, y: number, w: number, h: number) {
  const bark = ctx.createLinearGradient(0, y, 0, h);
  bark.addColorStop(0, '#8a5a2b');
  bark.addColorStop(0.5, '#5e3a1a');
  bark.addColorStop(1, '#2f1c0c');
  ctx.fillStyle = bark;
  ctx.beginPath();
  ctx.moveTo(-20, y + 6);
  ctx.quadraticCurveTo(w * 0.5, y - 8, w + 20, y + 4);
  ctx.lineTo(w + 20, h + 10);
  ctx.lineTo(-20, h + 10);
  ctx.closePath();
  ctx.fill();
  // bark grooves
  ctx.strokeStyle = 'rgba(30, 16, 6, 0.45)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 9; i++) {
    const x = (i / 9) * w + 20;
    ctx.beginPath();
    ctx.moveTo(x, y + 22);
    ctx.quadraticCurveTo(x + 18, y + 50, x - 6, y + 90);
    ctx.stroke();
  }
  // moss cap
  const mg = ctx.createLinearGradient(0, y - 10, 0, y + 26);
  mg.addColorStop(0, '#9be35a');
  mg.addColorStop(1, '#3f9a3a');
  ctx.fillStyle = mg;
  ctx.beginPath();
  ctx.moveTo(-20, y + 8);
  ctx.quadraticCurveTo(w * 0.5, y - 10, w + 20, y + 6);
  for (let x = w + 20; x >= -20; x -= 26) {
    ctx.quadraticCurveTo(x - 13, y + 30 + ((x / 26) % 2) * 8, x - 26, y + 14);
  }
  ctx.closePath();
  ctx.fill();
  // tiny flowers
  [[0.12, 1], [0.34, 0], [0.62, 1], [0.86, 0]].forEach(([fx, k]) => {
    ctx.fillStyle = k ? '#ff9a3c' : '#ff6b8e';
    ctx.beginPath();
    ctx.arc(fx * w, y - 2 + Math.sin(fx * 9) * 3, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffe36a';
    ctx.beginPath();
    ctx.arc(fx * w, y - 2 + Math.sin(fx * 9) * 3, 1.6, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawBloom(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, t: number) {
  ctx.save();
  ctx.translate(x, y);
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

function drawMood(ctx: CanvasRenderingContext2D, mood: StoryScene['mood'], w: number, h: number, t: number) {
  switch (mood) {
    case 'storm': {
      ctx.fillStyle = 'rgba(22, 14, 56, 0.55)';
      ctx.fillRect(0, 0, w, h);
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

function drawActor(ctx: CanvasRenderingContext2D, a: SceneActor, w: number, h: number, t: number) {
  const feetY = (a.y ?? 0.8) * h;
  const x = a.x * w;
  const s = (a.scale ?? 1) * 3.0;
  ctx.save();
  ctx.translate(x, feetY);
  switch (a.kind) {
    case 'milo': {
      ctx.scale(s, s);
      if (a.facing === -1) ctx.scale(-1, 1);
      const p = makePlayer(a.pose, 1);
      if (a.pose === 'happy') {
        p.y = -Math.abs(Math.sin(t * 5)) * 5;
      }
      drawHeroSloth(ctx, p, t);
      break;
    }
    case 'thornbark': {
      // the corrupted guardian; once freed he is the gentle Jungle Guardian again
      ctx.scale(s * 1.3, s * 1.3);
      if (a.facing === -1) ctx.scale(-1, 1);
      const p = makePlayer(a.angry ? 'punch' : 'idle', 1);
      drawMilo(ctx, a.beaten ? 5 : 7, p, t);
      break;
    }
    case 'daisy':
    case 'daisy_wave': {
      ctx.scale(s, s);
      if (a.facing === -1) ctx.scale(-1, 1);
      if (!drawJennifurSprite(ctx, a.mood ?? (a.kind === 'daisy_wave' ? 'cheer' : 'happy'), t)) drawGirlfriendDaisy(ctx, 0, 0, t, a.kind === 'daisy_wave');
      break;
    }
    case 'boss': {
      ctx.scale(s * 0.62, s * 0.62);
      if (a.facing === -1) ctx.scale(-1, 1);
      const b = makeBoss(!!a.angry, !!a.beaten);
      if (a.beaten) {
        ctx.rotate(-0.1);
        ctx.globalAlpha = 0.92;
      }
      // a painted boss shows its painted self on the card (feet on the ground line, drawn at the same size as the vector one)
      const paintedCard = (c: CanvasRenderingContext2D) => {
        c.translate(0, 24);
        c.scale(1.3, 1.3);
        return drawPaintedCardBoss(c, a.world ?? 1, !!a.angry, !!a.beaten);
      };
      if (a.silhouette) {
        drawSilhouette(ctx, (c) => {
          c.save();
          const ok = paintedCard(c);
          c.restore();
          if (!ok) drawBossEntity(c, b, t, a.world ?? 1);
        });
      } else {
        ctx.save();
        const ok = paintedCard(ctx);
        ctx.restore();
        if (!ok) drawBossEntity(ctx, b, t, a.world ?? 1);
      }
      if (a.beaten) {
        ctx.globalAlpha = 1;
        ctx.font = '26px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💫', -10, -105 + Math.sin(t * 3) * 3);
        ctx.fillText('⭐', 24, -92 + Math.cos(t * 3) * 3);
      }
      break;
    }
    case 'bloom':
      drawBloom(ctx, 0, 0, (a.scale ?? 1) * 1.6, t);
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

function drawSetPiece(ctx: CanvasRenderingContext2D, world: number, mood: StoryScene['mood'], w: number, h: number, t: number, castle?: number) {
  ctx.save();
  switch (world) {
    case 10: {
      // the painted castle fills the picture when it is loaded; the drawn storm clouds and fortress are the fallback and the classic look
      if (drawCastleBackdrop(ctx, castle ?? FORTRESS_CASTLE, w, h, t)) {
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
      // giant orchid-draped spider webs
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 1.6;
      [[0.04, 0], [0.96, 0]].forEach(([cx, cy], k) => {
        const ox = cx * w;
        const oy = cy * h;
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
      // Emerald Canopy: warm sun shafts
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
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = mood === 'storm' || mood === 'night' ? 0.22 : 0.34;
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

/** the backdrops are the stages' own scenery, baked at a lower resolution than play (it is only ever seen through a soft finish) */
const STORY_BAKE = 0.55;

/**
 * Draw one story picture into a w x h scene space (the canvas is expected to be scaled to it). `lift` raises the
 * whole picture by that fraction of the height, so a dialogue bar over the bottom of the screen hides scenery
 * instead of the characters' feet.
 */
export function drawStoryScene(ctx: CanvasRenderingContext2D, scene: StoryScene, t: number, w = SCENE_W, h = SCENE_H, lift = 0) {
  ctx.save();
  ctx.clearRect(0, 0, w, h);
  ctx.translate(0, -lift * h);
  // camera: close-up zoom with a slow push-in
  const z = (scene.zoom ?? 1) * (1 + 0.04 * Math.min(t / 9, 1));
  const fx = Math.min(w - w / (2 * z), Math.max(w / (2 * z), (scene.focusX ?? 0.5) * w));
  const fy = Math.min(h - h / (2 * z), Math.max(h / (2 * z), (scene.focusY ?? 0.62) * h));
  ctx.translate(w / 2, h / 2);
  ctx.scale(z, z);
  ctx.translate(-fx, -fy);
  // the sky and hills drift slowly behind the actors
  const camX = (scene.camX ?? 400) + t * 9;
  withBakeScale(STORY_BAKE, () => renderScenery(ctx, scene.world, camX, 0, w, h * (1 + lift) + 4, t, true));
  drawSetPiece(ctx, scene.world, scene.mood, w, h, t, scene.castle);

  if (scene.lineup) {
    for (let i = 0; i < 10; i++) {
      const row = i < 5 ? 0 : 1;
      const col = i % 5;
      const bx = (0.14 + col * 0.18 + (row ? 0.09 : 0)) * w;
      const by = (row ? 0.78 : 0.52) * h;
      ctx.save();
      ctx.translate(bx, by);
      const ls = row ? 1.0 : 0.8;
      ctx.scale(ls, ls);
      if (i % 5 > 1) ctx.scale(-1, 1);
      drawSilhouette(ctx, (c) => drawBossEntity(c, makeBoss(false, false), t, i + 1), 0.9, i === 9 ? '#2a0a14' : '#0b1024');
      ctx.restore();
    }
  } else {
    drawBranch(ctx, h * 0.8, w, h);
    scene.actors.forEach((a) => drawActor(ctx, a, w, h, t));
  }

  drawParticles(ctx, scene.particles, w, h, t);
  drawMood(ctx, scene.mood, w, h, t);
  withBakeScale(STORY_BAKE, () => renderOverlay(ctx, scene.world, camX, w, h * (1 + lift) + 4, t, true));
  ctx.restore();
  ctx.save();
  paintFinish(ctx, w, h, scene.mood);
  // cinematic vignette
  const vg = ctx.createRadialGradient(w / 2, h / 2, h * 0.45, w / 2, h / 2, w * 0.7);
  vg.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vg.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}
