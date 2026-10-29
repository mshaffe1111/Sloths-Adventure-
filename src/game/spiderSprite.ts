/**
 * Painted spider. Draws the canopy spiderling (the Tarantula Queen's brood) from the pose atlas (Gemini sheets) instead of the
 * code-drawn rig.
 *
 * Same idea as the other painted creatures: a switch, not a replacement. `?spider=sprite` / `?spider=classic` picks one for the
 * session, `localStorage.sloth_spider = 'sprite'` keeps it, and DEFAULT_SPRITE_SPIDER decides when nothing is set. It returns false
 * while the atlas loads (or when switched off, or for a spider hanging on a thread) and the caller then draws the vector spider.
 *
 * The spiderling just scuttles at Pokey, so the poses are: a squash when it lands from the canopy, the walk cycle (driven by
 * distance walked), fangs out when it is on top of him, an idle when it stands, and the usual hit reactions.
 */
import type { Enemy } from './types.ts';
import { bodyFor } from './creatureRig.ts';
import { SPIDER_FRAMES } from './spiderAtlasData.ts';
import { trackAtlas } from './atlasLoader.ts';

export const DEFAULT_SPRITE_SPIDER = true;
/** world units per atlas pixel */
const K = 0.46;
/** distance from the enemy's origin down to its feet (the floor sits 12 below the hurt box centre) */
const GROUND = 12;
/** world units walked per full 8-frame walk cycle */
const STRIDE = 44;
const WALK = ['walk_0', 'walk_1', 'walk_2', 'walk_3', 'walk_4', 'walk_5', 'walk_6', 'walk_7'];
/** it is on top of Pokey when the horizontal gap is this small */
const BITE_RANGE = 46;
const LAND_T = 0.22;

let enabled: boolean | null = null;
export function spiderSpriteEnabled(): boolean {
  if (enabled !== null) return enabled;
  let v = DEFAULT_SPRITE_SPIDER;
  try {
    const q = new URLSearchParams(location.search).get('spider');
    if (q === 'sprite') v = true;
    else if (q === 'classic') v = false;
    else if (localStorage.getItem('sloth_spider') === 'sprite') v = true;
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
  trackAtlas(img, new URL('../assets/enemies/spider-atlas.webp', import.meta.url).href, () => { ready = true; }, () => { atlas = null; }, () => { atlas = null; ready = false; });
}

interface SpriteRig {
  dist: number;
}

export function drawSpiderSprite(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number, playerX?: number): boolean {
  if (!spiderSpriteEnabled()) return false;
  if (!(enemy as unknown as { noThread?: boolean }).noThread) return false; // a spider on a thread keeps its vector art
  load();
  if (!ready || !atlas) return false;

  const b = bodyFor('spiderspr', enemy, time);
  if (!b.rig) b.rig = { dist: enemy.id * 7 } as SpriteRig;
  const r = b.rig as SpriteRig;
  const moving = Math.abs(b.fv) > 10;
  if (b.dt > 0 && moving) r.dist += Math.abs(b.fv) * b.dt;

  let name: string;
  let sy = 1;
  let sx = 1;
  if (enemy.defeated) name = 'dead';
  else if ((enemy.recoil ?? 0) > 0.35) name = 'hurt';
  else if ((enemy.stagger ?? 0) > 0) name = 'dizzy';
  else if (enemy.animTimer < LAND_T) {
    // just dropped in from the canopy: a squash that springs back
    name = 'land';
    const u = enemy.animTimer / LAND_T;
    sy = 0.86 + 0.14 * u;
    sx = 1.1 - 0.1 * u;
  } else if (playerX !== undefined && Math.abs(playerX - enemy.x) < BITE_RANGE) {
    // fangs out, snapping about
    name = Math.floor(time * 7 + enemy.id) % 2 === 0 ? 'attack' : 'alert';
  } else if (moving) name = WALK[Math.floor((r.dist / STRIDE) * WALK.length) % WALK.length];
  else name = Math.floor(time * 0.5 + enemy.id) % 2 === 0 ? 'idle_a' : 'idle_b';
  const f = SPIDER_FRAMES[name];
  if (!f) return false;

  ctx.save();
  ctx.translate(enemy.x, enemy.y + GROUND);
  ctx.scale(b.fs < 0 ? -Math.max(0.6, -b.fs) : Math.max(0.6, b.fs), 1);
  if (!enemy.defeated) {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 1, 24, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.scale(sx, sy);
  ctx.drawImage(atlas, f.x, f.y, f.w, f.h, -f.ax * K, -f.ay * K, f.w * K, f.h * K);
  ctx.restore();
  return true;
}

/** the sheets this sprite draws from (sheetWarm.ts spriteSheets: asked for before the stage starts, not when it first comes on screen) */
export const SPIDER_SHEETS: readonly string[] = [new URL('../assets/enemies/spider-atlas.webp', import.meta.url).href];
/** start loading them now (the stage preload and the stage start; QA's mid-stage 'blank wait' lines, 2026-10-29) */
export function warmSpiderSprite(): void {
  if (spiderSpriteEnabled()) load();
}
