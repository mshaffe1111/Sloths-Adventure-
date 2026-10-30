/**
 * sentrySprite — World 7's Stone Sentry (7-5 Stone Sentries), from the Hugging Face creature batch (src/assets/w6to10/creatures/sentry:
 * idle, walk, attack, hurt and defeat clips, anchored at the middle of the feet). A sentry fights as the prowler it stands in for (an
 * `ocelot` enemy: patrol, wind-up, lunge, recover, so its brain, its score and every check stay the ones already proven) and only looks
 * like a sentry (Enemy.look). Its painted eyes and chest rune get a soft cyan glow, a light source in the dim halls, nothing more.
 *
 * drawSentrySprite returns false until its sheets have loaded, and the caller draws the prowler.
 */
import { trackAtlas } from './atlasLoader.ts';
import { bodyFor } from './creatureRig.ts';
import type { Enemy } from './types.ts';
import { SENTRY_FRAMES, SENTRY_SEQ, type SentryFrame } from './sentryAnimData.ts';
import { drawSheet } from './sheetBake.ts';

export const SENTRY_URLS = [new URL('../assets/w6to10/creatures/sentry-anim-0.webp', import.meta.url).href, new URL('../assets/w6to10/creatures/sentry-anim-1.webp', import.meta.url).href] as const;
const FRAMES: Record<string, SentryFrame> = SENTRY_FRAMES;
const SEQ = SENTRY_SEQ;
/** the drawn height of a standing sentry (world px): a head taller than Pokey, its collider (w7.ts) a little inside it */
export const SENTRY_H = 96;
const K = SENTRY_H / 381;
/** how far a stride carries it (px), one walk cycle */
const CYCLE = 150;
/** where its eyes and its chest rune are, from the middle of its feet, in the clip's pixels (facing right) */
const EYES = { x: 27, y: -220 };
const RUNE = { x: 37, y: -110 };

const imgs: Array<HTMLImageElement | null> = [null, null];
const ready = [false, false];
function load(i: number) {
  if (imgs[i] || typeof Image === 'undefined') return;
  const im = new Image();
  imgs[i] = im;
  trackAtlas(im, SENTRY_URLS[i], () => (ready[i] = true), () => (imgs[i] = null), () => ((imgs[i] = null), (ready[i] = false)));
}
/** whether both sheets have loaded (starts the loads) */
export function sentryReady(): boolean {
  load(0);
  load(1);
  return ready[0] && ready[1];
}

const at = (seq: string, p: number) => {
  const s = SEQ[seq] ?? SEQ.idle;
  return s[Math.max(0, Math.min(s.length - 1, Math.floor(p * s.length)))];
};

/** one soft glow, a light source (additive, faded at its rim) */
function glow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(120, 240, 255, ${a})`);
  g.addColorStop(1, 'rgba(120, 240, 255, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

/** the sentry for an enemy whose look is 'sentry' (its body is an ocelot's: the clip follows its state) */
export function drawSentrySprite(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number): boolean {
  if (!sentryReady()) return false;
  const b = bodyFor('sentry', enemy, time);
  const rig = (b.rig ??= { dist: enemy.id * 7.1 }) as { dist: number };
  const st = enemy.state ?? 'patrol';
  if (b.dt > 0 && st === 'patrol') rig.dist += Math.abs(b.fv) * b.dt;
  const t = enemy.stateT ?? 0;
  let name: string;
  if (enemy.defeated) name = at('defeat', Math.min(1, enemy.koTimer / 0.9));
  else if ((enemy.recoil ?? 0) > 0.35) name = at('hurt', 1 - (enemy.recoil ?? 0));
  else if (st === 'windup') name = at('attack', Math.min(0.45, (t / 0.38) * 0.45));
  else if (st === 'leap') name = at('attack', 0.45 + Math.min(0.4, t * 0.8));
  else if (st === 'recover') name = at('attack', 0.85 + Math.min(0.15, t * 0.4));
  else if (Math.abs(b.fv) < 4) name = SEQ.idle[Math.floor(time * 8) % SEQ.idle.length];
  else name = at('walk', (((rig.dist / CYCLE) % 1) + 1) % 1);
  const f = FRAMES[name];
  if (!f) return false;
  const img = imgs[f.s];
  if (!img) return false;
  const feet = enemy.y + enemy.height / 2;
  ctx.save();
  ctx.translate(enemy.x, feet);
  ctx.scale(b.fs < 0 ? -Math.max(0.6, -b.fs) : Math.max(0.6, b.fs), 1);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 1, 30, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // (the hit flash is the engine's, around every animal: hurtFlash.ts, AN-6)
  drawSheet(ctx, img, f.x, f.y, f.w, f.h, -f.ax * K, -f.ay * K, f.w * K, f.h * K);
  // (the eyes and the rune glow softly, a little brighter as it winds up; out once it is beaten)
  if (!enemy.defeated) {
    const a = 0.32 + (st === 'windup' ? 0.25 : 0) + 0.06 * Math.sin(time * 3 + enemy.id);
    ctx.globalCompositeOperation = 'lighter';
    glow(ctx, EYES.x * K, EYES.y * K, 26, a);
    glow(ctx, RUNE.x * K, RUNE.y * K, 22, a * 0.8);
  }
  ctx.restore();
  return true;
}
