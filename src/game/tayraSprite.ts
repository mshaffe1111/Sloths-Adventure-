/**
 * Painted tayra. Draws the tayra from the pose atlas (Gemini sheets) instead of the code-drawn rig.
 *
 * Same idea as heroSprite.ts, eagleSprite.ts and snakeSprite.ts: a switch, not a replacement. `?tayra=sprite` / `?tayra=classic`
 * picks one for the session, `localStorage.sloth_tayra = 'sprite'` keeps it, and DEFAULT_SPRITE_TAYRA decides when nothing is
 * set. It returns false while the atlas loads (or when switched off) and the caller then draws the vector tayra.
 *
 * It reads the same state machine the vector tayra does (predatorAI.ts): patrol -> alert (stands up to sniff) -> dash ->
 * recover (skid, then settle). Hit reactions follow the engine's stagger / recoil / knock-out fields.
 * Poses: a 7-frame walk loop driven by distance travelled, two alert poses, a four-frame gallop, skid, settle, hurt,
 * dazed, knocked back and the airborne tumble of a knock-out.
 */
import type { Enemy } from './types.ts';
import { bodyFor } from './creatureRig.ts';
import { TAYRA_FRAMES } from './tayraAtlasData.ts';

export const DEFAULT_SPRITE_TAYRA = false;
/** world units per atlas pixel (a walking tayra is about 85 units from nose to tail tip) */
const K = 0.33;
/** distance from the enemy's origin down to its feet, the same ground line the vector tayra uses */
const GROUND = 15;
const WALK = ['walk_1', 'walk_2', 'walk_3', 'walk_4', 'walk_5', 'walk_6', 'walk_7'];
/** world units travelled for one full walk cycle, so the feet do not skate */
const STRIDE = 34;
/** gather -> stretch -> gather -> stretch */
const GALLOP = ['dash_c', 'dash_a', 'dash_d', 'dash_b'];
const GALLOP_FPS = 15;

let enabled: boolean | null = null;
export function tayraSpriteEnabled(): boolean {
  if (enabled !== null) return enabled;
  let v = DEFAULT_SPRITE_TAYRA;
  try {
    const q = new URLSearchParams(location.search).get('tayra');
    if (q === 'sprite') v = true;
    else if (q === 'classic') v = false;
    else if (localStorage.getItem('sloth_tayra') === 'sprite') v = true;
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
  atlas.src = new URL('../assets/enemies/tayra-atlas.webp', import.meta.url).href;
}

interface SpriteRig {
  dist: number;
  gallop: number;
  lastState: string;
}

export function drawTayraSprite(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number): boolean {
  if (!tayraSpriteEnabled()) return false;
  load();
  if (!ready || !atlas) return false;

  const b = bodyFor('tayraspr', enemy, time);
  if (!b.rig) b.rig = { dist: enemy.id * 9.3, gallop: 0, lastState: 'patrol' } as SpriteRig;
  const r = b.rig as SpriteRig;
  const st = enemy.state ?? 'patrol';

  if (b.dt > 0) {
    if (st === 'patrol') r.dist += Math.abs(b.fv) * b.dt;
    if (st === 'dash') r.gallop += GALLOP_FPS * b.dt;
    else r.gallop = 0;
  }
  r.lastState = st;

  const t = enemy.stateT ?? 0;
  let name: string;
  let lift = 0;
  if (enemy.defeated) name = 'tumble';
  else if ((enemy.recoil ?? 0) > 0.35) name = 'hurt';
  else if ((enemy.stagger ?? 0) > 0) name = Math.abs(enemy.knockVx ?? 0) > 70 ? 'knock' : 'dazed';
  else if (st === 'alert') {
    name = t < 0.2 ? 'alert_a' : 'alert_b';
    lift = Math.sin(time * 16 + enemy.id) * 0.5; // sniffing
  } else if (st === 'dash') name = GALLOP[Math.floor(r.gallop) % GALLOP.length];
  else if (st === 'recover') name = t < 0.3 ? 'skid' : 'settle';
  else name = WALK[Math.floor((r.dist / STRIDE) * WALK.length) % WALK.length];
  const f = TAYRA_FRAMES[name];
  if (!f) return false;

  ctx.save();
  ctx.translate(enemy.x, enemy.y + GROUND);
  // turning round squashes the body, but never to a razor-thin sliver
  ctx.scale(b.fs < 0 ? -Math.max(0.6, -b.fs) : Math.max(0.6, b.fs), 1);
  // a soft shadow on the ground, so the animal sits on it
  if (name !== 'tumble') {
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.ellipse(-2, 1, 22, 3.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (enemy.hitFlashTimer > 0) ctx.filter = 'brightness(2.2)';
  ctx.drawImage(atlas, f.x, f.y, f.w, f.h, -f.ax * K, -f.ay * K + lift, f.w * K, f.h * K);
  ctx.restore();
  return true;
}
