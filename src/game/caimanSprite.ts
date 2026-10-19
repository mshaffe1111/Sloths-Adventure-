/**
 * Painted caiman. Draws the caiman from the pose atlas (Gemini sheets) instead of the code-drawn rig.
 *
 * Same idea as the other painted creatures: a switch, not a replacement. `?caiman=sprite` / `?caiman=classic` picks one for the
 * session, `localStorage.sloth_caiman = 'sprite'` keeps it, and DEFAULT_SPRITE_CAIMAN decides when nothing is set. It returns
 * false while the atlas loads (or when switched off) and the caller then draws the vector caiman.
 *
 * It reads the lunge in predatorAI.ts: patrol (walk) -> windup (rears and hisses) -> lunge -> bite (chomp) -> recover (gaping, open to
 * a stomp). Hit reactions follow the engine's stagger / recoil / knock-out fields; a knocked-out caiman flops over and then lies
 * belly-up.
 */
import type { Enemy } from './types.ts';
import { bodyFor } from './creatureRig.ts';
import { bodyRect } from './fight.ts';
import { CAIMAN_FRAMES } from './caimanAtlasData.ts';

export const DEFAULT_SPRITE_CAIMAN = false;
/** world units per atlas pixel */
const K = 0.58;
/** distance from the enemy's origin down to its belly, the same ground line the vector caiman uses */
const GROUND = 15;
/** how far ahead of the origin the snout reaches (the hurt box runs about 46 units forward) */
const NOSE = 46;
/** world units walked per 4-frame walk cycle */
const STRIDE = 30;
const WALK = ['walk_0', 'walk_1', 'walk_2', 'walk_3'];

let enabled: boolean | null = null;
export function caimanSpriteEnabled(): boolean {
  if (enabled !== null) return enabled;
  let v = DEFAULT_SPRITE_CAIMAN;
  try {
    const q = new URLSearchParams(location.search).get('caiman');
    if (q === 'sprite') v = true;
    else if (q === 'classic') v = false;
    else if (localStorage.getItem('sloth_caiman') === 'sprite') v = true;
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
  atlas.src = new URL('../assets/enemies/caiman-atlas.webp', import.meta.url).href;
}

interface SpriteRig {
  dist: number;
}

export function drawCaimanSprite(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number): boolean {
  if (!caimanSpriteEnabled()) return false;
  load();
  if (!ready || !atlas) return false;

  const b = bodyFor('caimanspr', enemy, time);
  if (!b.rig) b.rig = { dist: enemy.id * 5 } as SpriteRig;
  const r = b.rig as SpriteRig;
  const moving = Math.abs(b.fv) > 8;
  if (b.dt > 0 && moving) r.dist += Math.abs(b.fv) * b.dt;

  const st = enemy.state ?? 'patrol';
  const t = enemy.stateT ?? 0;
  let name: string;
  let sx = 1;
  let sy = 1;
  let lying = false;
  if (enemy.defeated) {
    // flops over (the engine spins it), then lies belly-up where it landed
    if (enemy.koLanded) {
      name = 'dead';
      lying = true;
    } else name = 'hurt';
  } else if ((enemy.recoil ?? 0) > 0.35) name = 'hurt';
  else if ((enemy.stagger ?? 0) > 0) name = Math.abs(enemy.knockVx ?? 0) > 70 ? 'hurt' : 'dazed';
  else if (st === 'windup') {
    name = t < 0.22 ? 'alert' : 'hiss';
    sy = 1 + 0.02 * Math.sin(time * 26 + enemy.id); // the tense tremble before the lunge
  } else if (st === 'lunge') name = t < 0.15 ? 'lunge' : 'snap';
  else if (st === 'bite') name = 'chomp';
  else if (st === 'recover') name = t < 0.5 ? 'bask' : 'stalk';
  else if (moving) name = WALK[Math.floor((r.dist / STRIDE) * WALK.length) % WALK.length];
  else name = 'stalk';
  const f = CAIMAN_FRAMES[name];
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
    ctx.ellipse(-18, 1, 54, 3.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (enemy.hitFlashTimer > 0) ctx.filter = 'brightness(2.2)';
  ctx.scale(sx, sy);
  const dx = name === 'dead' ? 0 : NOSE;
  ctx.drawImage(atlas, f.x, f.y, f.w, f.h, dx - f.ax * K, -f.ay * K, f.w * K, f.h * K);
  ctx.restore();
  return true;
}
