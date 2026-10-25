/**
 * Painted Night Harpy: a dark ground bruiser drawn from the pose atlas (Gemini sheets).
 *
 * Same idea as tayraSprite.ts: a switch, not a replacement. `?harpy=sprite` / `?harpy=classic` picks one for the session,
 * `localStorage.sloth_harpy = 'sprite'` keeps it, and DEFAULT_SPRITE_HARPY decides when nothing is set. It returns false while the
 * atlas loads (or when switched off) and the caller then draws the plain vector fallback below.
 *
 * It reads the state machine in predatorAI.ts: patrol (a lean-and-hunch walk) -> crouch (it tenses, then folds down: the warning)
 * -> slide (a long low charge) -> stomp (it pops up, wings out) -> quake (it lands; a shockwave runs along the ground) ->
 * recover (dizzy: the moment to strike). Hit reactions follow the engine's stagger / recoil / knock-out fields.
 */
import type { Enemy } from './types.ts';
import { bodyFor } from './creatureRig.ts';
import { HARPY_FRAMES } from './harpyAtlasData.ts';
import { HARPY, harpyShockReach } from './predatorAI.ts';
import { trackAtlas } from './atlasLoader.ts';

export const DEFAULT_SPRITE_HARPY = true;
/** world units per atlas pixel: an upright harpy stands about 70 units tall */
const K = 0.42;
/** distance from the enemy's origin down to its feet, the same ground line as FEET.harpy */
const GROUND = 16;
/** world units travelled for one lean-and-hunch step, so the feet do not skate */
const STRIDE = 34;

let enabled: boolean | null = null;
export function harpySpriteEnabled(): boolean {
  if (enabled !== null) return enabled;
  let v = DEFAULT_SPRITE_HARPY;
  try {
    const q = new URLSearchParams(location.search).get('harpy');
    if (q === 'sprite') v = true;
    else if (q === 'classic') v = false;
    else if (localStorage.getItem('sloth_harpy') === 'sprite') v = true;
  } catch {
    /* no window or storage: keep the default */
  }
  enabled = v;
  return v;
}

let atlas: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (atlas || typeof Image === 'undefined') return;
  const img = new Image();
  atlas = img;
  trackAtlas(img, new URL('../assets/enemies/harpy-atlas.webp', import.meta.url).href, () => { ready = true; }, () => { atlas = null; }, () => { atlas = null; ready = false; });
}

/** which frame the harpy shows. Pure, so a test can check every state has a pose that exists in the atlas */
export function harpyPose(state: string, t: number, step: number, hurt: 'none' | 'hurt' | 'dazed' | 'defeated' = 'none'): string {
  if (hurt === 'defeated') return 'tumble';
  if (hurt === 'hurt') return 'hurt';
  if (hurt === 'dazed') return 'dizzy';
  switch (state) {
    case 'crouch':
      return t < HARPY.crouch * 0.4 ? 'tense' : 'crouch';
    case 'slide':
      return t < 0.08 ? 'slideShut' : 'slide';
    case 'stomp':
      return t < 0.1 ? 'pop' : 'lift';
    case 'quake':
      return t < 0.14 ? 'stomp' : 'stomp2';
    case 'recover':
      return 'dizzy';
    default:
      return Math.floor(step) % 2 === 0 ? 'walkB' : 'tense';
  }
}

interface SpriteRig {
  dist: number;
}

/** the wave the stomp sends along the ground: a low dome of dust that runs out both ways (drawn relative to the feet) */
function drawShockwave(ctx: CanvasRenderingContext2D, t: number) {
  const reach = harpyShockReach(t);
  const fade = Math.max(0, 1 - t / HARPY.quake);
  ctx.save();
  // the dome is as tall as the hit box (15), so what you see is what hurts
  ctx.fillStyle = `rgba(160,140,205,${(0.42 * fade).toFixed(3)})`;
  ctx.beginPath();
  ctx.ellipse(0, 0, reach, 15, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.lineCap = 'round';
  ctx.strokeStyle = `rgba(30,20,60,${(0.55 * fade).toFixed(3)})`;
  ctx.lineWidth = 5.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, reach, 15, 0, Math.PI, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = `rgba(240,232,255,${(0.95 * fade).toFixed(3)})`;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

/** three little stars circling its head while it is dizzy */
function drawDizzyStars(ctx: CanvasRenderingContext2D, time: number, headY: number) {
  ctx.save();
  ctx.fillStyle = '#fde047';
  for (let i = 0; i < 3; i++) {
    const a = time * 5 + (i * Math.PI * 2) / 3;
    const x = Math.cos(a) * 20;
    const y = headY + Math.sin(a) * 5;
    ctx.beginPath();
    for (let k = 0; k < 5; k++) {
      const r = k % 2 === 0 ? 4 : 1.7;
      const ang = -Math.PI / 2 + (k * Math.PI) / 5 * 2;
      ctx.lineTo(x + Math.cos(ang) * r, y + Math.sin(ang) * r);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function hurtKind(enemy: Enemy): 'none' | 'hurt' | 'dazed' | 'defeated' {
  if (enemy.defeated) return 'defeated';
  if ((enemy.recoil ?? 0) > 0.35) return 'hurt';
  if ((enemy.stagger ?? 0) > 0) return 'dazed';
  return 'none';
}

export function drawHarpySprite(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number): boolean {
  if (!harpySpriteEnabled()) return false;
  load();
  if (!ready || !atlas) return false;

  const b = bodyFor('harpyspr', enemy, time);
  if (!b.rig) b.rig = { dist: enemy.id * 11.7 } as SpriteRig;
  const r = b.rig as SpriteRig;
  const st = enemy.state ?? 'patrol';
  if (b.dt > 0 && st === 'patrol') r.dist += Math.abs(b.fv) * b.dt;

  const t = enemy.stateT ?? 0;
  const hk = hurtKind(enemy);
  const name = harpyPose(st, t, r.dist / STRIDE, hk);
  const f = HARPY_FRAMES[name];
  if (!f) return false;

  ctx.save();
  const groundDy = (enemy.groundY ?? enemy.y) - enemy.y; // how far above its ground it is (the stomp hop)
  ctx.translate(enemy.x, enemy.y + GROUND);
  // a soft shadow stays on the ground while it hops
  if (name !== 'tumble') {
    const air = Math.max(0, -groundDy);
    ctx.fillStyle = `rgba(0,0,0,${(0.24 * Math.max(0.35, 1 - air / 90)).toFixed(3)})`;
    ctx.beginPath();
    ctx.ellipse(0, groundDy, 26 - air * 0.12, 3.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (st === 'quake' && !enemy.defeated) {
    ctx.save();
    ctx.translate(0, groundDy);
    drawShockwave(ctx, t);
    ctx.restore();
  }
  // turning round squashes the body, but never to a razor-thin sliver
  ctx.scale(b.fs < 0 ? -Math.max(0.6, -b.fs) : Math.max(0.6, b.fs), 1);
  if (name === 'dizzy' && !enemy.defeated) ctx.rotate(Math.sin(time * 7 + enemy.id) * 0.05);
  // the warning crouch trembles, so it reads as "something is about to happen"
  if (st === 'crouch' && hk === 'none') ctx.translate(Math.sin(time * 70) * 1.4, 0);
  if (enemy.hitFlashTimer > 0) ctx.filter = 'brightness(2.2)';
  ctx.drawImage(atlas, f.x, f.y, f.w, f.h, -f.ax * K, -f.ay * K, f.w * K, f.h * K);
  ctx.restore();

  if (name === 'dizzy' && !enemy.defeated) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y + GROUND);
    drawDizzyStars(ctx, time, -f.h * K + 4);
    ctx.restore();
  }
  return true;
}

/** the plain stand-in while the atlas loads: a dark bird-shaped body with a pale crest and a beak */
export function drawHarpyFallback(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number): void {
  const b = bodyFor('harpyvec', enemy, time);
  const st = enemy.state ?? 'patrol';
  const low = st === 'crouch' || st === 'slide';
  ctx.save();
  ctx.translate(enemy.x, enemy.y + GROUND);
  ctx.scale(b.fs < 0 ? -Math.max(0.6, -b.fs) : Math.max(0.6, b.fs), 1);
  ctx.fillStyle = '#1e2740';
  ctx.beginPath();
  ctx.ellipse(0, low ? -14 : -24, low ? 30 : 20, low ? 12 : 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e9e4ee';
  ctx.beginPath();
  ctx.arc(low ? 20 : 8, low ? -18 : -42, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c0762a';
  ctx.beginPath();
  ctx.moveTo(low ? 28 : 15, low ? -18 : -42);
  ctx.lineTo(low ? 38 : 25, low ? -15 : -38);
  ctx.lineTo(low ? 28 : 15, low ? -13 : -36);
  ctx.fill();
  ctx.restore();
}
