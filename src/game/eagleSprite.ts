/**
 * Painted Harpy Eagle. Draws the eagle from the pose atlas (Kling sheets) instead of the code-drawn rig.
 *
 * Same idea as heroSprite.ts: a switch, not a replacement. `?eagle=sprite` / `?eagle=classic` picks one for the
 * session, `localStorage.sloth_eagle = 'sprite'` keeps it, and DEFAULT_SPRITE_EAGLE decides when nothing is set.
 * It returns false while the atlas loads (or when switched off) and the caller then draws the vector eagle,
 * so the game never shows nothing.
 *
 * Poses so far: the wing loop (patrol, hover, climb), a warning pose, a three-frame dive and a talons-out strike.
 * The shriek with an open beak and the hit reactions will join when those sheets arrive.
 */
import type { Enemy } from './types.ts';
import { bodyFor, clamp, damp, Spring } from './creatureRig.ts';
import { EAGLE_FLAP, EAGLE_FRAMES } from './eagleAtlasData.ts';

export const DEFAULT_SPRITE_EAGLE = true;
/** world units per atlas pixel: the eye is about 27 px across in the atlas, so this makes the eye about 12 units */
const K = 0.44;
/** where the eye sits relative to the enemy's centre (x is forward), so the body fills the hit box */
const EYE_DX = 12;
const EYE_DY = -4;
/** the dive: wings up as it tips over, then swept back and head-down, then talons out for the strike */
const DIVE_FRAMES = ['dive_c', 'dive_b', 'dive_a'];
const STRIKE_FRAME = 'swoop';
/** wings spread and crest up, held while it warns */
const FLARE_FRAME = 'flare';

let enabled: boolean | null = null;
export function eagleSpriteEnabled(): boolean {
  if (enabled !== null) return enabled;
  let v = DEFAULT_SPRITE_EAGLE;
  try {
    const q = new URLSearchParams(location.search).get('eagle');
    if (q === 'sprite') v = true;
    else if (q === 'classic') v = false;
    else if (localStorage.getItem('sloth_eagle') === 'sprite') v = true;
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
  atlas = new Image();
  atlas.onload = () => {
    ready = true;
  };
  atlas.src = new URL('../assets/enemies/eagle-atlas.webp', import.meta.url).href;
}

interface SpriteRig {
  clock: number;
  pitch: Spring;
  diveT: number;
}

export function drawEagleSprite(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number): boolean {
  if (!eagleSpriteEnabled()) return false;
  load();
  if (!ready || !atlas) return false;

  const b = bodyFor('eaglespr', enemy, time);
  if (!b.rig) b.rig = { clock: enemy.id * 3.1, pitch: new Spring(0), diveT: 0 } as SpriteRig;
  const r = b.rig as SpriteRig;

  const phase = enemy.swoopPhase;
  const flare = phase === 'telegraph' || (enemy.telegraphTimer > 0 && phase !== 'swoop');
  const dive = !flare && (phase === 'swoop' || enemy.isAttacking);
  const hover = phase === 'hover';
  const fps = hover ? 20 : phase === 'ascend' ? 18 : 14;

  if (b.dt > 0) {
    r.clock += fps * b.dt;
    r.diveT = dive ? r.diveT + b.dt : 0;
    const bias = hover ? -0.28 : flare ? -0.15 : 0;
    // the dive frames are already drawn nose-down, so they take only a little of the velocity tilt
    const target = clamp(Math.atan2(b.vy, Math.abs(b.fv) + 25) * 0.85, -0.7, 0.9) * (dive ? 0.25 : 1) + bias;
    r.pitch.step(target, 70, 11, b.dt);
  }

  let name: string;
  if (dive) name = enemy.isAttacking && r.diveT > 0.3 ? STRIKE_FRAME : DIVE_FRAMES[Math.min(DIVE_FRAMES.length - 1, Math.floor(r.diveT / 0.12))];
  else if (flare) name = FLARE_FRAME;
  else name = EAGLE_FLAP[Math.floor(r.clock) % EAGLE_FLAP.length];
  const f = EAGLE_FRAMES[name];
  if (!f) return false;

  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.scale(b.fs, 1);
  if (enemy.hitFlashTimer > 0) ctx.filter = 'brightness(2.4)';

  if (hover) {
    // the same "it is open to a hit" ring the code-drawn eagle shows
    ctx.save();
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -6, 40, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = 'bold 12px sans-serif';
    for (let k = 0; k < 3; k++) {
      const a = time * 5 + (k * Math.PI * 2) / 3;
      ctx.fillText('✨', 16 + Math.cos(a) * 22, -16 + Math.sin(a) * 12);
    }
    ctx.restore();
  }

  ctx.save();
  ctx.translate(EYE_DX, EYE_DY + (flare ? Math.sin(time * 70) * 1.2 : 0));
  ctx.rotate(r.pitch.x);
  ctx.drawImage(atlas, f.x, f.y, f.w, f.h, -f.ax * K, -f.ay * K, f.w * K, f.h * K);
  ctx.restore();

  if (flare) {
    // the warning the code-drawn eagle gives before a swoop: an orange ring and a red "!", drawn over the wings
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.95)';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.save();
    ctx.scale(b.fs < 0 ? -1 : 1, 1); // keep the "!" the right way round when the eagle faces left
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(16, -56, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', 16, -56);
    ctx.restore();
  }
  ctx.restore();
  return true;
}
