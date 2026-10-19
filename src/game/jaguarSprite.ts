/**
 * Painted jaguar. Draws the jaguar from the pose atlas (Gemini sheets) instead of the code-drawn rig.
 *
 * Same idea as the other painted creatures: a switch, not a replacement. `?jaguar=sprite` / `?jaguar=classic` picks one for the
 * session, `localStorage.sloth_jaguar = 'sprite'` keeps it, and DEFAULT_SPRITE_JAGUAR decides when nothing is set. It returns
 * false while the atlas loads (or when switched off) and the caller then draws the vector jaguar.
 *
 * It reads the state machine in predatorAI.ts: patrol -> windup (a growl, then a crouch, the warning) -> leap (a 0.58 s pounce)
 * -> recover (it lands heavy and shakes it off). Hit reactions follow the engine's stagger / recoil / knock-out fields; a
 * knocked-out jaguar flops over and then lies belly-up.
 */
import type { Enemy } from './types.ts';
import { bodyFor } from './creatureRig.ts';
import { bodyRect } from './fight.ts';
import { JAGUAR_FRAMES } from './jaguarAtlasData.ts';

export const DEFAULT_SPRITE_JAGUAR = true;
/** world units per atlas pixel */
const K = 0.38;
/** distance from the enemy's origin down to its feet, the same ground line the vector jaguar uses */
const GROUND = 24;
const WALK = ['walk_0', 'walk_1', 'walk_2', 'walk_3', 'walk_4', 'walk_5', 'walk_6', 'walk_7'];
/** world units travelled for one full walk cycle, so the paws do not skate */
const STRIDE = 52;
/** the AI's pounce lasts this long (predatorAI.ts) */
const LEAP_T = 0.58;

let enabled: boolean | null = null;
export function jaguarSpriteEnabled(): boolean {
  if (enabled !== null) return enabled;
  let v = DEFAULT_SPRITE_JAGUAR;
  try {
    const q = new URLSearchParams(location.search).get('jaguar');
    if (q === 'sprite') v = true;
    else if (q === 'classic') v = false;
    else if (localStorage.getItem('sloth_jaguar') === 'sprite') v = true;
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
  atlas.src = new URL('../assets/enemies/jaguar-atlas.webp', import.meta.url).href;
}

interface SpriteRig {
  dist: number;
}

export function drawJaguarSprite(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number): boolean {
  if (!jaguarSpriteEnabled()) return false;
  load();
  if (!ready || !atlas) return false;

  const b = bodyFor('jaguarspr', enemy, time);
  if (!b.rig) b.rig = { dist: enemy.id * 11.3 } as SpriteRig;
  const r = b.rig as SpriteRig;
  const st = enemy.state ?? 'patrol';
  if (b.dt > 0 && st === 'patrol') r.dist += Math.abs(b.fv) * b.dt;

  const t = enemy.stateT ?? 0;
  let name: string;
  let airborne = false;
  let lying = false;
  let sink = 0;
  if (enemy.defeated) {
    // flops over (the engine spins it), then lies belly-up where it landed
    if (enemy.koLanded) {
      name = 'dead';
      lying = true;
    } else name = 'hurt';
  } else if ((enemy.recoil ?? 0) > 0.35) name = 'hurt';
  else if ((enemy.stagger ?? 0) > 0) name = Math.abs(enemy.knockVx ?? 0) > 70 ? 'knock' : 'dazed';
  else if (st === 'windup') {
    // a growl, then it sinks into the crouch it springs from
    name = t < 0.3 ? 'roar' : 'stalk';
    if (name === 'stalk') sink = Math.sin(time * 30) * 0.4; // the tremble before the spring
  } else if (st === 'leap') {
    const u = Math.min(1, t / LEAP_T);
    airborne = true;
    name = u < 0.35 ? 'rise' : u < 0.7 ? 'lunge' : 'pounce';
  } else if (st === 'recover') name = t < 0.4 ? 'pin' : 'settle';
  else name = WALK[Math.floor((r.dist / STRIDE) * WALK.length) % WALK.length];
  const f = JAGUAR_FRAMES[name];
  if (!f) return false;

  // the shadow stays on the ground while the animal is in the air
  const lift = Math.max(0, (enemy.groundY ?? enemy.y) - enemy.y);

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
  // turning round squashes the body, but never to a razor-thin sliver
  ctx.scale(b.fs < 0 ? -Math.max(0.6, -b.fs) : Math.max(0.6, b.fs), 1);
  if (!enemy.defeated) {
    ctx.fillStyle = `rgba(0,0,0,${0.24 * (1 - Math.min(1, lift / 50))})`;
    ctx.beginPath();
    ctx.ellipse(-2, 1 + lift, 28 * (1 - Math.min(0.4, lift / 100)), 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (enemy.hitFlashTimer > 0) ctx.filter = 'brightness(2.2)';
  // in the air the engine already lifts the animal, so the pose hangs from its lowest paw instead of the painted ground line
  const ay = airborne ? f.h : f.ay;
  ctx.drawImage(atlas, f.x, f.y, f.w, f.h, -f.ax * K, -ay * K + sink, f.w * K, f.h * K);
  ctx.restore();
  return true;
}
