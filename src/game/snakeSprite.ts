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
import { SNAKE2_FRAMES } from './snake2AtlasData.ts';
import { trackAtlas } from './atlasLoader.ts';

export const DEFAULT_SPRITE_SNAKE = true;
/** world units per atlas pixel: the head is drawn about 18 units across */
const K = 18 / SNAKE_ATLAS_HEAD;
/** the second sheet (the attack poses) is drawn at its own, larger pixel size: its head is about 51 px across where the first sheet's is 75 */
const K2 = K * (78 / 51);
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
let atlas2: HTMLImageElement | null = null;
let ready2 = false;
function load() {
  if (typeof Image === 'undefined') return;
  if (!atlas) {
    const img = new Image();
    atlas = img;
    trackAtlas(img, new URL('../assets/enemies/snake-atlas.webp', import.meta.url).href, () => { ready = true; }, () => { atlas = null; }, () => { atlas = null; ready = false; });
  }
  if (!atlas2) {
    const img = new Image();
    atlas2 = img;
    trackAtlas(img, new URL('../assets/enemies/snake2-atlas.webp', import.meta.url).href, () => { ready2 = true; }, () => { atlas2 = null; }, () => { atlas2 = null; ready2 = false; });
  }
}

/**
 * Three kinds of tree snake, told apart by their id, so a stage of snakes does not all rear and lunge the same way. They move and hit
 * identically (predatorAI.ts); only the poses differ:
 *   0  the first sheet's rear-up, strike and recover
 *   1  the cobra: spreads its hood to warn, strikes with a fierce low head and snaps its tail as it recovers
 *   2  the coiler: winds up into a spiral, unwinds into a tall S, then strikes the same low way and sweeps its tail over
 */
export type SnakeKind = 'tree' | 'cobra' | 'coiler';
export const snakeKind = (id: number): SnakeKind => (['tree', 'cobra', 'coiler'] as const)[((id % 3) + 3) % 3];

/** the pose of a kind in a mode: which sheet, which frame. Pure, so a test can check every kind has every pose */
export function snakePose(kind: SnakeKind, mode: 'rear' | 'strike' | 'recover', t: number): { sheet: 1 | 2; name: string } {
  if (kind === 'tree') return { sheet: 1, name: mode };
  if (mode === 'rear') return kind === 'cobra' ? { sheet: 2, name: 'cobra' } : { sheet: 2, name: t < 0.19 ? 'coilup' : 'reared' };
  if (mode === 'strike') return { sheet: 2, name: 'crouch' };
  return { sheet: 2, name: kind === 'cobra' ? 'whip' : 'sweep' };
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
  const kind = ready2 ? snakeKind(enemy.id) : 'tree';

  const b = bodyFor('snakespr', enemy, time);
  if (!b.rig) b.rig = { mode: 'prowl', modeT: 0, clock: enemy.id * 1.7 } as SpriteRig;
  const r = b.rig as SpriteRig;

  if (b.dt > 0) {
    r.clock += PROWL_FPS * b.dt;
    r.modeT += b.dt;
    // the brain's own state when it has one (predatorAI.ts); otherwise the same isAttacking cycle as the vector snake
    if (enemy.state !== undefined) {
      const m: Mode = enemy.state === 'rear' ? 'rear' : enemy.state === 'strike' ? 'strike' : enemy.state === 'recover' ? 'recover' : 'prowl';
      if (m !== r.mode) {
        r.mode = m;
        r.modeT = 0;
      }
    } else if (enemy.isAttacking) {
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
  let sheet: 1 | 2 = 1;
  if (enemy.defeated) name = 'defeat';
  else if ((enemy.stagger ?? 0) > 0) name = 'dazed';
  else if ((enemy.recoil ?? 0) > 0.35) name = 'hurt';
  else if (r.mode === 'rear' || r.mode === 'strike' || r.mode === 'recover') {
    const pose = snakePose(kind, r.mode, r.modeT);
    name = pose.name;
    sheet = pose.sheet;
  } else name = PROWL[Math.floor(r.clock) % PROWL.length];
  const f = (sheet === 2 ? SNAKE2_FRAMES : SNAKE_FRAMES)[name];
  if (!f) return false;
  const img = sheet === 2 && atlas2 ? atlas2 : atlas;
  const k = sheet === 2 ? K2 : K;

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
  ctx.drawImage(img, f.x, f.y, f.w, f.h, -f.ax * k, -f.ay * k, f.w * k, f.h * k);
  ctx.restore();
  return true;
}

/** the sheets this sprite draws from (sheetWarm.ts spriteSheets: asked for before the stage starts, not when it first comes on screen) */
export const SNAKE_SHEETS: readonly string[] = [new URL('../assets/enemies/snake-atlas.webp', import.meta.url).href, new URL('../assets/enemies/snake2-atlas.webp', import.meta.url).href];
/** start loading them now (the stage preload and the stage start; QA's mid-stage 'blank wait' lines, 2026-10-29) */
export function warmSnakeSprite(): void {
  if (snakeSpriteEnabled()) load();
}
