/**
 * Painted poison-dart frog. Draws the frog from the pose atlas (Gemini sheets) instead of the code-drawn rig.
 *
 * Same idea as the other painted creatures: a switch, not a replacement. `?frog=sprite` / `?frog=classic` picks one for the
 * session, `localStorage.sloth_frog = 'sprite'` keeps it, and DEFAULT_SPRITE_FROG decides when nothing is set. It returns false
 * while the atlas loads (or when switched off) and the caller then draws the vector frog.
 *
 * The frog keeps its own hop clock (sit -> crouch -> hop -> land, the same timings as the vector frog), because the engine only
 * slides it sideways. While it sits it now and then snaps its tongue, puffs its throat or looks up. Hit reactions follow the
 * engine's stagger / recoil / knock-out fields.
 */
import type { Enemy } from './types.ts';
import { bodyFor } from './creatureRig.ts';
import { FROG_FRAMES } from './frogAtlasData.ts';
import { trackAtlas } from './atlasLoader.ts';

export const DEFAULT_SPRITE_FROG = true;
/** world units per atlas pixel */
const K = 0.38;
/** distance from the enemy's origin down to its feet (the vector frog's ground) */
const GROUND = 14;
const HOP = 0.56;
const CROUCH = 0.17;
const LAND = 0.2;
/** how high the hop goes, in world units */
const LIFT = 17;

let enabled: boolean | null = null;
export function frogSpriteEnabled(): boolean {
  if (enabled !== null) return enabled;
  let v = DEFAULT_SPRITE_FROG;
  try {
    const q = new URLSearchParams(location.search).get('frog');
    if (q === 'sprite') v = true;
    else if (q === 'classic') v = false;
    else if (localStorage.getItem('sloth_frog') === 'sprite') v = true;
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
  trackAtlas(img, new URL('../assets/enemies/frog-atlas.webp', import.meta.url).href, () => { ready = true; }, () => { atlas = null; }, () => { atlas = null; ready = false; });
}

type Phase = 'idle' | 'crouch' | 'air' | 'land';
interface SpriteRig {
  phase: Phase;
  t: number;
  wait: number;
}

export function drawFrogSprite(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number): boolean {
  if (!frogSpriteEnabled()) return false;
  load();
  if (!ready || !atlas) return false;

  const b = bodyFor('frogspr', enemy, time);
  if (!b.rig) b.rig = { phase: 'idle', t: 0, wait: 0.8 + ((enemy.id * 0.6180339) % 1) * 1.4 } as SpriteRig;
  const r = b.rig as SpriteRig;
  const stunned = enemy.defeated || (enemy.stagger ?? 0) > 0 || (enemy.recoil ?? 0) > 0.35;
  if (b.dt > 0) {
    if (stunned) {
      r.phase = 'idle';
      r.t = 0;
    } else {
      r.t += b.dt;
      if (r.phase === 'idle' && r.t > r.wait) {
        r.phase = 'crouch';
        r.t = 0;
      } else if (r.phase === 'crouch' && r.t > CROUCH) {
        r.phase = 'air';
        r.t = 0;
      } else if (r.phase === 'air' && r.t > HOP) {
        r.phase = 'land';
        r.t = 0;
      } else if (r.phase === 'land' && r.t > LAND) {
        r.phase = 'idle';
        r.t = 0;
        r.wait = 0.9 + ((time * 7.31 + enemy.id * 3.3) % 1) * 1.8;
      }
    }
  }

  let name: string;
  let lift = 0;
  let sy = 1;
  if (enemy.defeated) name = 'dead';
  else if ((enemy.recoil ?? 0) > 0.35) name = 'hurt';
  else if ((enemy.stagger ?? 0) > 0) name = Math.abs(enemy.knockVx ?? 0) > 70 ? 'slide' : 'dizzy';
  else if (r.phase === 'crouch') name = 'prep';
  else if (r.phase === 'air') {
    const u = Math.min(1, r.t / HOP);
    lift = Math.sin(u * Math.PI) * LIFT;
    name = u < 0.3 ? 'high' : u < 0.72 ? 'hop' : 'hopl';
  } else if (r.phase === 'land') name = 'land';
  else {
    // sitting about: a tongue flick now and then, a throat puff, a glance up
    const c = (time + enemy.id * 1.7) % 6.8;
    name = c < 0.3 ? 'tongue' : c > 3.2 && c < 4.1 ? 'vocal' : c > 5.2 && c < 6 ? 'alert' : 'idle';
    sy = 1 + Math.sin(time * 5 + enemy.id) * 0.012;
  }
  const f = FROG_FRAMES[name];
  if (!f) return false;

  ctx.save();
  ctx.translate(enemy.x, enemy.y + GROUND);
  ctx.scale(b.fs < 0 ? -Math.max(0.6, -b.fs) : Math.max(0.6, b.fs), 1);
  if (!enemy.defeated) {
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.ellipse(0, 1, 18 - lift * 0.25, 3.6 - lift * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (enemy.hitFlashTimer > 0) ctx.filter = 'brightness(2.2)';
  ctx.translate(0, -lift);
  ctx.scale(1, sy);
  ctx.drawImage(atlas, f.x, f.y, f.w, f.h, -f.ax * K, -f.ay * K, f.w * K, f.h * K);
  ctx.restore();
  return true;
}
