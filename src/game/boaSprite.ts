/**
 * Painted boa. Draws the boa from the pose atlas (Gemini sheet) instead of the code-drawn rig.
 *
 * Same idea as the other painted creatures: a switch, not a replacement. `?boa=sprite` / `?boa=classic` picks one for the
 * session, `localStorage.sloth_boa = 'sprite'` keeps it, and DEFAULT_SPRITE_BOA decides when nothing is set. It returns false
 * while the atlas loads (or when switched off) and the caller then draws the vector boa.
 *
 * It reads the ambush in predatorAI.ts: coil -> rear (head up, the warning) -> strike -> bite -> recover. The attack pose is
 * stretched along its length while it strikes, so the head reaches as far as the hit box does. Hit reactions follow the engine's
 * stagger / recoil / knock-out fields; a knocked-out boa flops over and then lies belly-up.
 */
import type { Enemy } from './types.ts';
import { bodyFor } from './creatureRig.ts';
import { bodyRect } from './fight.ts';
import { BOA_FRAMES } from './boaAtlasData.ts';
import { trackAtlas } from './atlasLoader.ts';
import { makeCreatureAnim } from './creatureAnim.ts';
import { BOA_ANIM, BOA_ANIM_UP, BOA_ANIM_URL, BOA_SEQ } from './boaAnimData.ts';
import { drawSheet } from './sheetBake.ts';

/** the boa's moving moments (2026-10-25): its stagger and its coiled breathing, made with the motion model from its own poses */
const ANIM = makeCreatureAnim(BOA_ANIM_URL, BOA_ANIM, BOA_SEQ, BOA_ANIM_UP);

export const DEFAULT_SPRITE_BOA = true;
/** world units per atlas pixel */
const K = 0.4;
/** distance from the enemy's origin down to its belly, the same ground line the vector boa uses */
const GROUND = 16;
const SLITHER = ['slither_0', 'slither_1', 'slither_2'];
const SLITHER_FPS = 7;
/** how much longer the attack pose is drawn at full reach (predatorAI: the head runs out to about 128 units) */
const REACH_STRETCH = 1.35;

let enabled: boolean | null = null;
export function boaSpriteEnabled(): boolean {
  if (enabled !== null) return enabled;
  let v = DEFAULT_SPRITE_BOA;
  try {
    const q = new URLSearchParams(location.search).get('boa');
    if (q === 'sprite') v = true;
    else if (q === 'classic') v = false;
    else if (localStorage.getItem('sloth_boa') === 'sprite') v = true;
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
  trackAtlas(img, new URL('../assets/enemies/boa-atlas.webp', import.meta.url).href, () => { ready = true; }, () => { atlas = null; }, () => { atlas = null; ready = false; });
}

interface SpriteRig {
  clock: number;
}

const ease = (u: number) => {
  const c = Math.max(0, Math.min(1, u));
  return c * c * (3 - 2 * c);
};

export function drawBoaSprite(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number): boolean {
  if (!boaSpriteEnabled()) return false;
  load();
  if (!ready || !atlas) return false;

  const b = bodyFor('boaspr', enemy, time);
  if (!b.rig) b.rig = { clock: enemy.id * 1.3 } as SpriteRig;
  const r = b.rig as SpriteRig;
  const moving = Math.abs(b.fv) > 10;
  if (b.dt > 0 && moving) r.clock += SLITHER_FPS * b.dt;

  const st = enemy.state ?? 'coil';
  const t = enemy.stateT ?? 0;
  let name: string;
  let sx = 1;
  let sy = 1;
  let lying = false;
  let clip: string | null = null;
  if (enemy.defeated) {
    // flops over (the engine spins it), then lies belly-up where it landed
    if (enemy.koLanded) {
      name = 'dead';
      lying = true;
    } else name = 'hurt_b';
  } else if ((enemy.recoil ?? 0) > 0.35) name = 'hurt_b';
  else if ((enemy.stagger ?? 0) > 0) {
    name = 'hurt_a';
    if (ANIM.ready()) clip = ANIM.ping('dazed', time + enemy.id, 10);
  }
  else if (st === 'rear') {
    name = 'alert';
    sy = 1 + 0.035 * Math.sin(time * 18 + enemy.id); // the tense tremble before the strike
  } else if (st === 'strike') {
    name = t < 0.07 ? 'lunge' : 'attack';
    if (name === 'attack') sx = 1 + (REACH_STRETCH - 1) * ease((t - 0.07) / 0.13);
  } else if (st === 'bite') {
    name = 'attack';
    sx = REACH_STRETCH;
  } else if (st === 'recover') {
    if (t < 0.2) {
      name = 'attack';
      sx = REACH_STRETCH - (REACH_STRETCH - 1.1) * ease(t / 0.2);
    } else name = t < 0.5 ? 'lunge' : 'coil';
  } else if (moving) name = SLITHER[Math.floor(r.clock) % SLITHER.length];
  else {
    // waiting, coiled: now and then it lifts its head to look about
    name = (time + enemy.id * 1.7) % 6.3 < 1.1 ? 'alert' : 'coil';
    if (name === 'coil') {
      if (ANIM.ready()) clip = ANIM.ping('coil', time + enemy.id, 5);
      else sy = 1 + 0.02 * Math.sin(time * 2.2 + enemy.id); // slow breathing
    }
  }
  const f = BOA_FRAMES[name];
  if (!f) return false;

  ctx.save();
  if (lying) {
    // the knock-out spin ends belly-up already in the painted pose, so undo the engine's rotation
    const br = bodyRect(enemy);
    const cx = br.x + br.w / 2;
    const cy = br.y + br.h / 2;
    ctx.translate(cx, cy);
    ctx.rotate(-(enemy.koAngle ?? 0));
    ctx.translate(-cx, -cy);
  }
  ctx.translate(enemy.x, enemy.y + GROUND);
  ctx.scale(b.fs < 0 ? -Math.max(0.6, -b.fs) : Math.max(0.6, b.fs), 1);
  if (!enemy.defeated) {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 1, 34 * sx, 3.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.scale(sx, sy);
  if (!(clip && ANIM.draw(ctx, clip, K))) drawSheet(ctx, atlas, f.x, f.y, f.w, f.h, -f.ax * K, -f.ay * K, f.w * K, f.h * K);
  ctx.restore();
  return true;
}

/** the sheets this sprite draws from (sheetWarm.ts spriteSheets: asked for before the stage starts, not when it first comes on screen) */
export const BOA_SHEETS: readonly string[] = [new URL('../assets/enemies/boa-atlas.webp', import.meta.url).href];
/** start loading them now (the stage preload and the stage start; QA's mid-stage 'blank wait' lines, 2026-10-29) */
export function warmBoaSprite(): void {
  if (boaSpriteEnabled()) load();
}
