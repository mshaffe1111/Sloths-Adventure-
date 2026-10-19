/**
 * Painted tree snake. Draws the snake from the pose atlas (Kling sheets) instead of the code-drawn rig.
 *
 * Same idea as heroSprite.ts and eagleSprite.ts: a switch, not a replacement. `?snake=sprite` / `?snake=classic` picks one
 * for the session, `localStorage.sloth_snake = 'sprite'` keeps it, and DEFAULT_SPRITE_SNAKE decides when nothing is set.
 * It returns false while the atlas loads (or when switched off) and the caller then draws the vector snake.
 *
 * It follows the same prowl -> rear -> strike -> recover cycle the vector snake uses, driven by the game's isAttacking flag,
 * so the lunge looks the same to the player and the hit box and timing are untouched.
 * Poses: a slither loop, the rear-up, the strike, the recover, a hurt flinch, a dazed wobble and the defeat.
 */
import type { Enemy } from './types.ts';
import { bodyFor } from './creatureRig.ts';
import { SNAKE_ATLAS_HEAD, SNAKE_FRAMES } from './snakeAtlasData.ts';

export const DEFAULT_SPRITE_SNAKE = false;
/** world units per atlas pixel: the head is drawn about 18 units across */
const K = 18 / SNAKE_ATLAS_HEAD;
/** where the belly line sits below the enemy's centre, so the snake rests on its branch */
const GROUND = 12;
/** the slither: one wave travelling down the body, looped */
const PROWL = ['slither_0', 'slither_1', 'slither_2', 'slither_3', 'slither_4'];
const PROWL_FPS = 7;

let enabled: boolean | null = null;
export function snakeSpriteEnabled(): boolean {
  if (enabled !== null) return enabled;
  let v = DEFAULT_SPRITE_SNAKE;
  try {
    const q = new URLSearchParams(location.search).get('snake');
    if (q === 'sprite') v = true;
    else if (q === 'classic') v = false;
    else if (localStorage.getItem('sloth_snake') === 'sprite') v = true;
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
  atlas.src = new URL('../assets/enemies/snake-atlas.webp', import.meta.url).href;
}

type Mode = 'prowl' | 'rear' | 'strike' | 'recover';
interface SpriteRig {
  mode: Mode;
  modeT: number;
  clock: number;
}

export function drawSnakeSprite(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number): boolean {
  if (!snakeSpriteEnabled()) return false;
  load();
  if (!ready || !atlas) return false;

  const b = bodyFor('snakespr', enemy, time);
  if (!b.rig) b.rig = { mode: 'prowl', modeT: 0, clock: enemy.id * 1.7 } as SpriteRig;
  const r = b.rig as SpriteRig;

  if (b.dt > 0) {
    r.clock += PROWL_FPS * b.dt;
    r.modeT += b.dt;
    // the same cycle as the vector snake: rear up, strike, recover, and again while the sloth stays close
    if (enemy.isAttacking) {
      if (r.mode === 'prowl') {
        r.mode = 'rear';
        r.modeT = 0;
      } else if (r.mode === 'rear' && r.modeT > 0.38) {
        r.mode = 'strike';
        r.modeT = 0;
      } else if (r.mode === 'strike' && r.modeT > 0.18) {
        r.mode = 'recover';
        r.modeT = 0;
      } else if (r.mode === 'recover' && r.modeT > 0.55) {
        r.mode = 'rear';
        r.modeT = 0;
      }
    } else if (r.mode !== 'prowl') {
      if (!(r.mode === 'strike' && r.modeT < 0.18)) {
        r.mode = 'prowl';
        r.modeT = 0;
      }
    }
  }

  let name: string;
  if (enemy.defeated) name = 'defeat';
  else if ((enemy.stagger ?? 0) > 0) name = 'dazed';
  else if ((enemy.recoil ?? 0) > 0.35) name = 'hurt';
  else if (r.mode === 'rear') name = 'rear';
  else if (r.mode === 'strike') name = 'strike';
  else if (r.mode === 'recover') name = 'recover';
  else name = PROWL[Math.floor(r.clock) % PROWL.length];
  const f = SNAKE_FRAMES[name];
  if (!f) return false;

  if (enemy.telegraphTimer > 0) {
    // the same red warning ring the code-drawn snake shows before it strikes
    ctx.save();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(enemy.x + 2 * (b.fs < 0 ? -1 : 1), enemy.y, 26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.translate(enemy.x, enemy.y + GROUND);
  ctx.scale(b.fs, 1);
  if (enemy.hitFlashTimer > 0) ctx.filter = 'brightness(2.4)';
  // a slow breath, so a snake that is waiting is never a still picture
  const breathe = r.mode === 'prowl' ? Math.sin(time * 5 + enemy.id) * 0.025 : 0;
  ctx.scale(1 - breathe, 1 + breathe);
  ctx.drawImage(atlas, f.x, f.y, f.w, f.h, -f.ax * K, -f.ay * K, f.w * K, f.h * K);
  ctx.restore();
  return true;
}
