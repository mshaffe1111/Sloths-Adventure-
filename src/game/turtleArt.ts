/**
 * The river snapper (World 2's snapping turtle): Matt's painted sheet (drawTurtleSprite, at the end), and these shapes while it loads: a domed shell, a beaked head that
 * pulls back before it snaps, and the shell alone while it hides, slides, or sits dizzy. The origin is the middle of the body, the feet
 * 14 below (predatorAI.ts FEET).
 */
import { TURTLE } from './predatorAI.ts';
import type { Enemy } from './types.ts';
import { trackAtlas } from './atlasLoader.ts';
import { bodyRect } from './fight.ts';
import { TURTLE_FRAMES, TURTLE_WALK_W } from './turtleAtlasData.ts';
import { makeCreatureAnim } from './creatureAnim.ts';
import { TURTLE_ANIM, TURTLE_ANIM_UP, TURTLE_ANIM_URL, TURTLE_SEQ } from './turtleAnimData.ts';

const OL = '#2b2416';
const SHELL = '#5f6b3a';
const SHELL_HI = '#7d8a4c';
const SCUTE = '#4a5530';
const SKIN = '#8a9a5b';
const BELLY = '#d8c98f';

export function drawTurtle(ctx: CanvasRenderingContext2D, e: Enemy, t: number) {
  const st = e.state ?? 'patrol';
  const u = e.stateT ?? 0;
  const hidden = st === 'shell' || st === 'slide' || st === 'dizzy' || (st === 'peek' && u < TURTLE.peek * 0.5);
  ctx.save();
  ctx.translate(e.x, e.y);
  ctx.scale(e.facing, 1);
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = OL;
  ctx.lineJoin = 'round';
  // a sliding shell spins a little and leaves dust lines behind
  if (st === 'slide') {
    ctx.rotate(Math.sin(t * 30) * 0.06);
    ctx.save();
    ctx.scale(e.facing, 1);
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    for (let k = 0; k < 3; k++) {
      const d = -(e.slideDir ?? 1);
      ctx.beginPath();
      ctx.moveTo(d * (30 + k * 6), 4 - k * 6);
      ctx.lineTo(d * (48 + k * 8), 4 - k * 6);
      ctx.stroke();
    }
    ctx.restore();
  }
  const walk = st === 'patrol' ? Math.sin(t * 9) : 0;
  if (!hidden) {
    // legs
    ctx.fillStyle = SKIN;
    for (const [lx, ph] of [[-14, 0], [12, Math.PI]] as const) {
      ctx.beginPath();
      ctx.ellipse(lx + walk * 2 * Math.cos(ph), 9, 6, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    // the head: pulled back in the tell, shot forward in the snap
    const reach = st === 'windup' ? -6 : st === 'snap' ? TURTLE.reach - 14 : st === 'recover' ? 8 : 2;
    const hx = 22 + reach;
    ctx.fillStyle = SKIN;
    ctx.beginPath();
    ctx.moveTo(14, -2);
    ctx.lineTo(hx, -4);
    ctx.lineTo(hx, 4);
    ctx.lineTo(14, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(hx + 4, -1, 8, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // the hooked beak, open as it snaps
    ctx.fillStyle = '#c9b77a';
    ctx.beginPath();
    ctx.moveTo(hx + 9, -3);
    ctx.lineTo(hx + 15, st === 'snap' ? -6 : 0);
    ctx.lineTo(hx + 9, st === 'snap' ? 4 : 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // a cross little eye
    ctx.fillStyle = '#1b140c';
    ctx.beginPath();
    ctx.arc(hx + 5, -3, 1.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx + 2, -6.5);
    ctx.lineTo(hx + 8, -5);
    ctx.stroke();
    // the tail
    ctx.fillStyle = SKIN;
    ctx.beginPath();
    ctx.moveTo(-20, 2);
    ctx.lineTo(-30, 5);
    ctx.lineTo(-20, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  // the shell: a ridged dome over a pale rim
  ctx.fillStyle = BELLY;
  ctx.beginPath();
  ctx.ellipse(0, 7, 23, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  const g = ctx.createLinearGradient(0, -16, 0, 8);
  g.addColorStop(0, SHELL_HI);
  g.addColorStop(1, SHELL);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-23, 6);
  ctx.quadraticCurveTo(-22, -16, 0, -17);
  ctx.quadraticCurveTo(22, -16, 23, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // the ridges of the scutes
  ctx.strokeStyle = SCUTE;
  ctx.lineWidth = 2;
  for (const sx of [-12, 0, 12]) {
    ctx.beginPath();
    ctx.moveTo(sx - 5, -8);
    ctx.lineTo(sx, -13);
    ctx.lineTo(sx + 5, -8);
    ctx.lineTo(sx + 4, 1);
    ctx.lineTo(sx - 4, 1);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
  // dizzy: little stars circling over the shell
  if (st === 'dizzy') {
    ctx.save();
    ctx.fillStyle = '#fde68a';
    for (let k = 0; k < 3; k++) {
      const a = t * 5 + (k * Math.PI * 2) / 3;
      ctx.beginPath();
      ctx.arc(e.x + Math.cos(a) * 16, e.y - 24 + Math.sin(a) * 4, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

// ───────────── Matt's painted snapper (2026-10-24) ─────────────

let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(im, new URL('../assets/enemies/turtle-atlas.webp', import.meta.url).href, () => { ready = true; }, () => { img = null; });
}

/** the moving snapper (2026-10-25): its own poses brought to life with the motion model; the single poses draw while it loads */
const ANIM = makeCreatureAnim(TURTLE_ANIM_URL, TURTLE_ANIM, TURTLE_SEQ, TURTLE_ANIM_UP);

/** the animated frame for this moment, or null to keep the single painted pose (in the shell, sliding, dizzy, the knock-out spin) */
function turtleClip(e: Enemy, t: number): string | null {
  if (!ANIM.ready()) return null;
  const st = e.state ?? 'patrol';
  const u = e.stateT ?? 0;
  if (e.defeated) return e.koLanded ? ANIM.ping('flip', t + e.id, 10) : null;
  if (st === 'windup') return ANIM.at('tell', u / TURTLE.windup);
  if (st === 'snap') return ANIM.at('snap', u / TURTLE.snap);
  if (st === 'recover') return ANIM.at('after', u / TURTLE.recover);
  if (st === 'peek') return ANIM.at('peek', u / TURTLE.peek);
  if (st === 'shell' || st === 'slide' || st === 'dizzy') return null;
  return Math.abs(e.vx) > 3 ? ANIM.loop('walk', t + e.id * 0.3, 14) : ANIM.at('walk', 0);
}

/** world units per atlas pixel: the walking turtle is drawn 66 units across (its 48-unit body plus head and tail) */
const K = 66 / TURTLE_WALK_W;
const WALK = ['walk1', 'walk2', 'walk3', 'walk2'] as const;

/** which painted pose for this moment */
export function turtlePose(e: Enemy, t: number): keyof typeof TURTLE_FRAMES {
  const st = e.state ?? 'patrol';
  const u = e.stateT ?? 0;
  if (e.defeated) return e.koLanded ? (Math.floor(t * 6) % 2 ? 'flip2' : 'flip1') : 'flip1';
  if (st === 'windup') return 'tell';
  if (st === 'snap') return e.id % 2 ? 'snap' : 'bite';
  if (st === 'recover') return 'after';
  if (st === 'shell' || st === 'slide') return 'hide';
  if (st === 'peek') return u < 0.2 ? 'hide' : 'peek';
  if (st === 'dizzy') return 'dizzy';
  if (Math.abs(e.vx) > 3) return WALK[Math.floor(t * 5 + e.id) % WALK.length];
  return 'walk2';
}

/** the painted snapper, or false until the sheet has loaded (the shapes above draw instead) */
export function drawTurtleSprite(ctx: CanvasRenderingContext2D, e: Enemy, t: number): boolean {
  load();
  if (!ready || !img) return false;
  const f = TURTLE_FRAMES[turtlePose(e, t)];
  ctx.save();
  if (e.defeated && e.koLanded) {
    // the knock-out spin ends belly-up already in the painted pose: undo the engine's turn
    const br = bodyRect(e);
    const cx = br.x + br.w / 2, cy = br.y + br.h / 2;
    ctx.translate(cx, cy);
    ctx.rotate(-(e.koAngle ?? 0));
    ctx.translate(-cx, -cy);
  }
  const feet = e.y + 16;
  ctx.translate(e.x, feet);
  ctx.scale(e.facing, 1);
  if (e.state === 'slide' && !e.defeated) ctx.rotate(Math.sin(t * 30) * 0.05);
  if (!e.defeated) {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 30, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  const clip = turtleClip(e, t);
  if (!(clip && ANIM.draw(ctx, clip, K))) ctx.drawImage(img, f.x, f.y, f.w, f.h, -f.ax * K, -f.h * K, f.w * K, f.h * K);
  ctx.restore();
  // a kicked shell leaves dust lines behind it (the dizzy pose has its own spiral eyes)
  if (e.state === 'slide' && !e.defeated) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    const d = -(e.slideDir ?? 1);
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      ctx.moveTo(e.x + d * (34 + k * 6), e.y + 6 - k * 7);
      ctx.lineTo(e.x + d * (54 + k * 8), e.y + 6 - k * 7);
      ctx.stroke();
    }
    ctx.restore();
  }
  return true;
}
