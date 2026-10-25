/**
 * The river king's guard (2-9): Matt's royal snapper, upright with a reed-bound spear. He shares the snapper's brain (predatorAI.ts, with
 * `royal` set), so his poses follow its states: marching, the wind-up (spear overhead), the jab, open after the jab, blocking a blow to
 * the front, staggering back from a kick, sitting dazed, and knocked flat. The origin is his feet's middle on the ground, 14 under e.y.
 */
import type { Enemy } from './types.ts';
import { trackAtlas } from './atlasLoader.ts';
import { GUARD_FRAMES, GUARD_STAND_H } from './guardAtlasData.ts';
import { GUARD, TURTLE } from './predatorAI.ts';
import { makeCreatureAnim } from './creatureAnim.ts';
import { GUARD_ANIM, GUARD_ANIM_UP, GUARD_ANIM_URL, GUARD_SEQ } from './guardAnimData.ts';

/** the moving guard (2026-10-25): his own poses brought to life with the motion model; the single poses draw while it loads */
const ANIM = makeCreatureAnim(GUARD_ANIM_URL, GUARD_ANIM, GUARD_SEQ, GUARD_ANIM_UP);

/** the animated frame for this moment, or null to keep the single painted pose (flinching, blocking, sitting dazed, knocked out) */
function guardClip(e: Enemy, t: number): string | null {
  if (!ANIM.ready() || e.defeated || e.hitFlashTimer > 0.05) return null;
  const st = e.state ?? 'patrol';
  const u = e.stateT ?? 0;
  if (st === 'windup') return ANIM.at('tell', u / GUARD.windup);
  if (st === 'snap') return ANIM.at('jab', u / TURTLE.snap);
  if (st === 'recover') return ANIM.at('after', u / GUARD.recover);
  if (st === 'slide') return ANIM.at('hit', u / 0.6);
  if (st === 'shell' || st === 'peek' || st === 'dizzy') return null;
  return Math.abs(e.vx) > 3 ? ANIM.loop('march', t + e.id * 0.3, 12) : ANIM.ping('stand', t + e.id, 6);
}

let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(im, new URL('../assets/enemies/guard-atlas.webp', import.meta.url).href, () => { ready = true; }, () => { img = null; });
}

/** world units per atlas pixel: the standing guard is drawn 80 units tall (Pokey is about 48): a big, proud guard */
const K = 80 / GUARD_STAND_H;

export type GuardPose = keyof typeof GUARD_FRAMES;

/** which painted pose for this moment */
export function guardPose(e: Enemy, t: number): GuardPose {
  const st = e.state ?? 'patrol';
  const u = e.stateT ?? 0;
  if (e.defeated) return e.koLanded ? 'ko' : Math.floor(t * 8) % 2 ? 'tumble' : 'fly1';
  if (e.hitFlashTimer > 0.05) return 'hit2';
  if (st === 'windup') return 'tell';
  if (st === 'snap') return u < 0.08 ? 'jab1' : 'jab2';
  if (st === 'recover') return 'after';
  if (st === 'shell') return 'push';
  if (st === 'peek') return 'ready';
  if (st === 'slide') return Math.floor(t * 7) % 2 ? 'hit1' : 'stagger';
  if (st === 'dizzy') return Math.floor(t * 2) % 2 ? 'sit1' : 'sit2';
  if (Math.abs(e.vx) > 3) return Math.floor(t * 3.2 + e.id) % 2 ? 'march' : 'stand';
  return 'stand';
}

/** the painted guard, or false until the sheet has loaded */
export function drawGuardSprite(ctx: CanvasRenderingContext2D, e: Enemy, t: number): boolean {
  load();
  if (!ready || !img) return false;
  const f = GUARD_FRAMES[guardPose(e, t)];
  ctx.save();
  if (e.defeated && e.koLanded) {
    // the knock-out spin ends already lying flat in the painted pose: undo the engine's turn about his middle
    ctx.translate(e.x, e.y - 20);
    ctx.rotate(-(e.koAngle ?? 0));
    ctx.translate(-e.x, -(e.y - 20));
  }
  ctx.translate(e.x, e.y + 14);
  ctx.scale(e.facing, 1);
  if (!e.defeated) {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  const clip = guardClip(e, t);
  if (!(clip && ANIM.draw(ctx, clip, K))) ctx.drawImage(img, f.x, f.y, f.w, f.h, -f.ax * K, -f.h * K, f.w * K, f.h * K);
  ctx.restore();
  return true;
}
