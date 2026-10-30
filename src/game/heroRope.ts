/**
 * Pokey crossing a shimmy rope hand over hand (Matt's Gemini rope sheet, 2026-10-29: reference/prop-sheets/gemini-batch-2026-10-29/
 * pokey-rope-hand-over-hand.jpg). The sheet's own rope was cut out of the pictures (tools/art/rope/cut.py), so his paws close round the
 * game's painted rope, drawn behind him (ropeArt.ts). Each picture keeps where the rope runs through his grip and the middle of his
 * torso: the picture hangs with the grip exactly on the rope where it is drawn (with its give under him, PlayerState.hangDip) and the
 * body glides along level with his travel.
 *
 * Moving: the hand-over-hand frames, one cycle per ROPE_STRIDE of travel, so the paws keep pace with how fast he really goes (and stop
 * when he stops). The first frame of a creep is always the first of the cycle (both paws on the rope). Still: hanging by one paw, a
 * slow sway from the grip. Facing left mirrors him.
 */
import { trackAtlas } from './atlasLoader.ts';
import { HANG_DROP } from './rope.ts';
import { ROPE_CYCLE, ROPE_FRAMES, ROPE_STAND_PX, ROPE_STILL, ROPE_STRIDE_PX } from './heroRopeData.ts';
import type { PlayerState } from './types.ts';
import { heroBlinkAlpha } from './heroBlink.ts';

let img: HTMLImageElement | null = null;
let ready = false;
/** Pokey on a rope: his sheet (stagePreload.ts and sheetWarm.ts get it ready in a stage with ropes) */
export const HERO_ROPE_URL = new URL('../assets/hero/hero-rope.webp', import.meta.url).href;
/** start loading his rope sheet */
export function warmHeroRope() {
  load();
}
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(im, HERO_ROPE_URL, () => { ready = true; }, () => { img = null; });
}

/** world units per sheet px: his standing height in the sheet is the standing hero's (HERO_UNITS 66 x HERO_SPRITE_SCALE 1.35) */
export const ROPE_K = (66 * 1.35) / ROPE_STAND_PX;
/** how far along the rope one hand-over-hand cycle carries him (world units) */
export const ROPE_STRIDE = ROPE_STRIDE_PX * ROPE_K;

type Name = keyof typeof ROPE_FRAMES;
/** the picture for this moment: `travelled` is how far he has crept since this creep began (world units) */
export function ropeFrame(moving: boolean, travelled: number): Name {
  if (!moving) return ROPE_STILL;
  const n = ROPE_CYCLE.length;
  const i = Math.floor((Math.max(0, travelled) / ROPE_STRIDE) * n) % n;
  return ROPE_CYCLE[i];
}

/** the body's sway from the grip (radians): slow while he hangs still, a little rock with each reach while he creeps */
export function ropeSway(moving: boolean, travelled: number, time: number): number {
  if (!moving) return Math.sin(time * 2.2) * 0.05;
  return Math.sin((travelled / ROPE_STRIDE) * Math.PI * 2) * 0.035;
}

/**
 * Draw him hanging from the rope: his feet are at (p.x, p.y), the rope HANG_DROP above them (rope.ts), and it gives by p.hangDip under
 * his weight. `travelled`: how far this creep has gone (HeroEvents.ropeTravel). False until the sheet has loaded (the standard pose draws).
 */
export function drawRopeHang(ctx: CanvasRenderingContext2D, p: PlayerState, time: number, travelled: number): boolean {
  load();
  if (!ready || !img) return false;
  const moving = Math.abs(p.vx) > 10;
  const f = ROPE_FRAMES[ropeFrame(moving, travelled)];
  const k = ROPE_K;
  ctx.save();
  ctx.translate(p.x, p.y - HANG_DROP + (p.hangDip ?? 0));
  ctx.scale(p.facing, 1);
  ctx.rotate(ropeSway(moving, travelled, time));
  ctx.globalAlpha *= heroBlinkAlpha(p, time);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, f.x, f.y, f.w, f.h, -f.ax * k, -f.gy * k, f.w * k, f.h * k);
  ctx.restore();
  return true;
}
