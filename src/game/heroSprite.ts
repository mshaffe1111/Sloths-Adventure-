/**
 * Painted hero. Draws Slomatt from the pose atlas (made from the Gemini pose sheet) instead of the code-drawn rig.
 *
 * It is a switch, not a replacement: `?hero=sprite` or `?hero=classic` in the address picks one for that session,
 * and `localStorage.sloth_hero = 'sprite'` keeps it. With nothing set, DEFAULT_SPRITE_HERO decides.
 * It returns false whenever it has no frame for the pose (climbing, vine swinging) or the atlas is still loading,
 * and the caller then draws the classic hero, so the game never shows nothing.
 */
import type { PlayerState } from './types.ts';
import { HERO_CLIMB, HERO_FRAMES, HERO_RUN, HERO_STAND_H, type HeroFrame } from './heroAtlasData.ts';
import { drawAuras } from './miloVariants.ts';
import { HeroEvents } from './heroEvents.ts';

export const DEFAULT_SPRITE_HERO = true;
/** how tall the standing hero is drawn, in world units: the classic hero is about 66 */
export const HERO_UNITS = 66;
/** how much bigger than the classic hero the painted one is drawn (the painted hero has smaller proportions of head) */
export const HERO_SPRITE_SCALE = 1.35;

let enabled: boolean | null = null;
export function heroSpriteEnabled(): boolean {
  if (enabled !== null) return enabled;
  let v = DEFAULT_SPRITE_HERO;
  try {
    const q = new URLSearchParams(location.search).get('hero');
    if (q === 'sprite') v = true;
    else if (q === 'classic') v = false;
    else if (localStorage.getItem('sloth_hero') === 'sprite') v = true;
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
  atlas.src = new URL('../assets/hero/hero-atlas.webp', import.meta.url).href;
}

/** the face portraits, for the HUD and dialogue (null until the atlas has loaded) */
export function heroFace(ctx: CanvasRenderingContext2D, name: string, x: number, y: number, size: number): boolean {
  if (!heroSpriteEnabled()) return false;
  load();
  const f = HERO_FRAMES[name];
  if (!ready || !atlas || !f) return false;
  ctx.drawImage(atlas, f.x, f.y, f.w, f.h, x, y, size, size);
  return true;
}

/** the run frames, ordered by the packing script so neighbouring poses are as alike as possible */
const RUN_CYCLE = HERO_RUN;
/** painted strides per walkCycle turn: 9 frames at the full walkCycle rate would outrun the 30 fps loop */
const STRIDE_RATE = 0.6;

// short-lived poses that are triggered by a change of state rather than a flag on the player (see heroEvents.ts)
const events = new HeroEvents();

/** the painted climb is one step per few pixels of height gained, so it follows the climbing speed */
const CLIMB_STEP_PX = 22;

function pick(p: PlayerState, time: number): { name: string; bob: number; byHand?: boolean } | null {
  if (p.isVineSwinging) return null;
  if (p.climbing) {
    if (!HERO_CLIMB.every((n) => HERO_FRAMES[n])) return null;
    const n = HERO_CLIMB.length;
    const i = (((Math.floor(-p.y / CLIMB_STEP_PX) % n) + n) % n);
    return { name: HERO_CLIMB[i], bob: 0, byHand: true };
  }
  if (events.isHurt(time) && HERO_FRAMES.hurt) return { name: 'hurt', bob: 0 };
  if (p.ducking) return { name: 'duck', bob: 0 };
  const reachNow = (v: number | undefined) => v === undefined || v > 0.25;
  if (p.kicking && reachNow(p.swingReach)) return { name: 'kick', bob: 0 };
  if (p.punching && p.attackType === 'mega' && HERO_FRAMES.mega && reachNow(p.swingReach)) return { name: 'mega', bob: 0 };
  if (p.punching) {
    // the swing's reach runs 0 (wind-up) -> up to 1 (arm out) -> back down (recoil); one painted frame per band
    const r = p.swingReach ?? 1;
    const name = r <= 0 ? 'guard' : r < 0.3 ? 'punch_rec' : r < 0.55 ? 'punch_2' : r < 0.8 ? 'punch_3' : r < 0.95 ? 'punch_4' : 'punch_5';
    return { name, bob: 0 };
  }
  if (!p.grounded) {
    if (p.isDoubleJumping || p.vy < 0) return { name: 'jump_up', bob: 0 };
    return { name: 'fall', bob: 0 };
  }
  if (events.isLanding(time) && HERO_FRAMES.land) return { name: 'land', bob: 0 };
  if (Math.abs(p.vx) > 10) {
    // one stride = one turn of walkCycle; the frames come from the run sheet, in the order the stride unfolds
    const u = ((((p.walkCycle * STRIDE_RATE) / (Math.PI * 2)) % 1) + 1) % 1;
    const name = RUN_CYCLE[Math.min(RUN_CYCLE.length - 1, Math.floor(u * RUN_CYCLE.length))];
    return { name, bob: -Math.abs(Math.sin(u * Math.PI * 2)) * 2.4 };
  }
  // standing: a slow breath, and a blink every few seconds
  const blink = time % 3.6 > 3.45;
  return { name: blink ? 'idle_blink' : 'idle_a', bob: Math.sin(time * 3.2) * 0.5 };
}

/** returns true if it drew the hero */
export function drawHeroSprite(ctx: CanvasRenderingContext2D, p: PlayerState, time: number): boolean {
  if (!heroSpriteEnabled()) return false;
  load();
  if (!ready || !atlas) return false;
  events.track(p, time);
  const choice = pick(p, time);
  if (!choice) return false;
  const f: HeroFrame | undefined = HERO_FRAMES[choice.name];
  if (!f) return false;
  const k = (HERO_UNITS * HERO_SPRITE_SCALE) / HERO_STAND_H;

  ctx.save();
  ctx.translate(p.x, p.y);
  if (p.grounded && !p.climbing && !p.isVineSwinging) {
    const sc = (1 / p.squashY) * (p.ducking ? 1.3 : 1.05) * HERO_SPRITE_SCALE;
    ctx.fillStyle = 'rgba(15,23,42,0.36)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 22 * sc, 5.5 * sc, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.scale(p.facing * p.squashX, p.squashY);
  if (p.isDoubleJumping) {
    const cy = -HERO_UNITS * HERO_SPRITE_SCALE * 0.42;
    ctx.translate(0, cy);
    ctx.rotate(p.somersaultAngle);
    ctx.translate(0, -cy);
  }
  if (p.invincibleTimer > 0 && Math.floor(time * 24) % 2 === 0) ctx.globalAlpha = 0.55;
  drawAuras(ctx, p, time);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(atlas, f.x, f.y, f.w, f.h, -(choice.byHand && f.hx !== undefined ? f.hx : f.ax) * k, -f.ay * k + choice.bob, f.w * k, f.h * k);
  ctx.restore();
  return true;
}
