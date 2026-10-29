/**
 * Painted ocelot. Draws the ocelot from the pose atlas (Gemini sheets) instead of the code-drawn rig.
 *
 * Same idea as the other painted creatures (heroSprite, eagleSprite, snakeSprite, tayraSprite): a switch, not a replacement.
 * `?ocelot=sprite` / `?ocelot=classic` picks one for the session, `localStorage.sloth_ocelot = 'sprite'` keeps it, and
 * DEFAULT_SPRITE_OCELOT decides when nothing is set. It returns false while the atlas loads (or when switched off) and the
 * caller then draws the vector ocelot.
 *
 * It reads the state machine in predatorAI.ts: patrol -> leap (a 0.36 s pounce) -> recover. The pounce plays a gather, a rising
 * pose, one of three mid-air poses and a landing, timed to the same arc the AI flies, then a pinning pose and a skid.
 * Hit reactions follow the engine's stagger / recoil / knock-out fields.
 */
import type { Enemy } from './types.ts';
import { bodyFor } from './creatureRig.ts';
import { OCELOT_FRAMES } from './ocelotAtlasData.ts';
import { trackAtlas } from './atlasLoader.ts';
import { makeCreatureAnim } from './creatureAnim.ts';
import { OCELOT_ANIM, OCELOT_ANIM_UP, OCELOT_ANIM_URL, OCELOT_SEQ } from './ocelotAnimData.ts';

/** the moving ocelot (2026-10-25): its own poses brought to life with the motion model; the single poses draw while it loads */
const ANIM = makeCreatureAnim(OCELOT_ANIM_URL, OCELOT_ANIM, OCELOT_SEQ, OCELOT_ANIM_UP);
/** world units the animated walk covers in one full cycle */
const CYCLE = 84;

export const DEFAULT_SPRITE_OCELOT = true;
/** world units per atlas pixel */
const K = 0.40;
/** distance from the enemy's origin down to its feet, the same ground line the vector ocelot uses */
const GROUND = 19;
const WALK = ['walk_0', 'walk_1', 'walk_2', 'walk_3'];
/** world units travelled for one full walk cycle, so the feet do not skate */
const STRIDE = 36;
/** the AI's pounce lasts this long (predatorAI.ts) */
const LEAP_T = 0.36;
const AIR = ['air_a', 'air_b', 'air_c'];

let enabled: boolean | null = null;
export function ocelotSpriteEnabled(): boolean {
  if (enabled !== null) return enabled;
  let v = DEFAULT_SPRITE_OCELOT;
  try {
    const q = new URLSearchParams(location.search).get('ocelot');
    if (q === 'sprite') v = true;
    else if (q === 'classic') v = false;
    else if (localStorage.getItem('sloth_ocelot') === 'sprite') v = true;
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
  trackAtlas(img, new URL('../assets/enemies/ocelot-atlas.webp', import.meta.url).href, () => { ready = true; }, () => { atlas = null; }, () => { atlas = null; ready = false; });
}

interface SpriteRig {
  dist: number;
}

export function drawOcelotSprite(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number): boolean {
  if (!ocelotSpriteEnabled()) return false;
  load();
  if (!ready || !atlas) return false;

  const b = bodyFor('ocelotspr', enemy, time);
  if (!b.rig) b.rig = { dist: enemy.id * 7.1 } as SpriteRig;
  const r = b.rig as SpriteRig;
  const st = enemy.state ?? 'patrol';
  if (b.dt > 0 && st === 'patrol') r.dist += Math.abs(b.fv) * b.dt;

  const t = enemy.stateT ?? 0;
  let name: string;
  let airborne = false;
  if (enemy.defeated) name = 'tumble';
  else if ((enemy.recoil ?? 0) > 0.35) name = 'hurt';
  else if ((enemy.stagger ?? 0) > 0) name = Math.abs(enemy.knockVx ?? 0) > 70 ? 'knock' : 'dazed';
  else if (st === 'windup') name = 'gather';
  else if (st === 'leap') {
    const u = Math.min(1, t / LEAP_T);
    if (u < 0.12) name = 'gather';
    else if (u < 0.4) {
      name = 'rise';
      airborne = true;
    } else if (u < 0.78) {
      name = AIR[enemy.id % AIR.length];
      airborne = true;
    } else name = 'land';
  } else if (st === 'recover') name = t < 0.18 ? 'pin' : 'skid';
  else name = WALK[Math.floor((r.dist / STRIDE) * WALK.length) % WALK.length];
  const f = OCELOT_FRAMES[name];
  if (!f) return false;
  // the animated clip for the same moment (null keeps the single painted pose: the knock-out tumble and the knock-back)
  let clip: string | null = null;
  if (ANIM.ready() && name !== 'tumble' && name !== 'knock') {
    if (name === 'hurt') clip = ANIM.at('hurt', (1 - (enemy.recoil ?? 0)) / 0.65);
    else if (name === 'dazed') clip = ANIM.ping('dazed', time, 7);
    else if (st === 'windup') clip = ANIM.at('gather', t / 0.38);
    else if (st === 'leap') clip = ANIM.at('leap', t / LEAP_T);
    else if (st === 'recover') clip = ANIM.at('land', t / 0.4);
    else clip = ANIM.at('walk', (((r.dist / CYCLE) % 1) + 1) % 1);
  }

  // the shadow stays on the ground while the animal is in the air
  const lift = Math.max(0, (enemy.groundY ?? enemy.y) - enemy.y);

  ctx.save();
  ctx.translate(enemy.x, enemy.y + GROUND);
  // turning round squashes the body, but never to a razor-thin sliver
  ctx.scale(b.fs < 0 ? -Math.max(0.6, -b.fs) : Math.max(0.6, b.fs), 1);
  if (name !== 'tumble') {
    ctx.fillStyle = `rgba(0,0,0,${0.22 * (1 - Math.min(1, lift / 40))})`;
    ctx.beginPath();
    ctx.ellipse(-2, 1 + lift, 27 * (1 - Math.min(0.4, lift / 80)), 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (enemy.hitFlashTimer > 0) ctx.filter = 'brightness(2.2)';
  // in the air the engine already lifts the animal, so the pose hangs from its lowest paw instead of the painted ground line
  if (clip) {
    const c = OCELOT_ANIM[clip];
    if (airborne && c) ctx.translate(0, (c.ay - c.h) * (K / OCELOT_ANIM_UP));
    ANIM.draw(ctx, clip, K);
  } else {
    const ay = airborne ? f.h : f.ay;
    ctx.drawImage(atlas, f.x, f.y, f.w, f.h, -f.ax * K, -ay * K, f.w * K, f.h * K);
  }
  ctx.restore();
  return true;
}

/** the sheets this sprite draws from (sheetWarm.ts spriteSheets: asked for before the stage starts, not when it first comes on screen) */
export const OCELOT_SHEETS: readonly string[] = [new URL('../assets/enemies/ocelot-atlas.webp', import.meta.url).href];
/** start loading them now (the stage preload and the stage start; QA's mid-stage 'blank wait' lines, 2026-10-29) */
export function warmOcelotSprite(): void {
  if (ocelotSpriteEnabled()) load();
}
