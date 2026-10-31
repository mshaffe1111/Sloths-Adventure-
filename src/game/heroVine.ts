/**
 * Pokey holding a vine (Matt's vine-swing sheets, 2026-10-24): hanging still, swinging forward with his legs out ahead, and swinging back
 * with them trailing. Gemini drew a thin vine through his hands; it was taken out of the pictures (scratchpad/vine/vinecut.py), so his
 * hands close round the world's own painted liana, drawn behind him. Each picture keeps where his top hand grips and how the vine leant in
 * it, so it is turned to lie along the real vine whatever the swing's angle.
 */
import { trackAtlas } from './atlasLoader.ts';
import { VINE_FRAMES, VINE_BODY_PX } from './heroVineData.ts';
import type { PlayerState } from './types.ts';
import { heroBlinkAlpha } from './heroBlink.ts';
import { drawSheet } from './sheetBake.ts';

let img: HTMLImageElement | null = null;
let ready = false;
/** Pokey hanging from a liana: his sheet (stagePreload.ts and sheetWarm.ts get it ready before he first grabs one) */
export const HERO_VINE_URL = new URL('../assets/hero/hero-vine.webp', import.meta.url).href;
/** start loading his hanging sheet */
export function warmHeroVine() {
  load();
}
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(
    im,
    HERO_VINE_URL,
    () => {
      ready = true;
    },
    () => {
      img = null;
    },
  );
}

/** grip to toes while hanging, in world units: the standing hero's height and a bit (his arms are up over his head) */
export const VINE_HANG = 102;
const K = VINE_HANG / VINE_BODY_PX;

/** which picture for this moment of the swing */
export function vinePose(angle: number, omega: number, facing: 1 | -1): keyof typeof VINE_FRAMES {
  // through the bottom of the swing he hangs straight; out at the ends his legs kick ahead going forward, and trail coming back, passing
  // through the in-between on the way (it jumped straight from hanging to the full kick at 0.3 rad: pokey-anim, 2026-10-31)
  const a = Math.abs(angle);
  if (a < VINE_STILL) return 'still';
  const fwd = omega * facing > 0 || (Math.abs(omega) < 0.3 && angle * facing > 0);
  if (a < VINE_FULL) return fwd ? 'stillfwd' : 'stillback';
  return fwd ? 'forward' : 'back';
}
/** out to here (radians) he hangs straight; beyond VINE_FULL he is in the full kick or trail; between, the in-between */
export const VINE_STILL = 0.15;
export const VINE_FULL = 0.4;
/** how far the body swings in under the hands, from how the picture drew it (1 = straight under them, 0 = as drawn) */
const SETTLE = 0.5;
/**
 * The body trails behind the swing, turning about his hands (radians per rad/s of swing, and the most it trails): a hanging body lags
 * the vine it holds, so his legs sweep after it and catch up at the ends (the lead's list, 2026-10-31: "a body that follows the arc").
 * Positive omega carries his feet to the right, so they lag to the left: a positive (clockwise) turn about the grip.
 */
export const VINE_TRAIL = 0.11;
export const VINE_TRAIL_MAX = 0.22;
/** pure: how far the body trails behind the swing (radians, world sense: positive swings his feet left) */
export function vineTrail(omega: number): number {
  return Math.max(-VINE_TRAIL_MAX, Math.min(VINE_TRAIL_MAX, omega * VINE_TRAIL));
}

/**
 * Draw him hanging from the vine. The swing puts his feet at the end of `swingLength` along the vine (p.x, p.y); his hands are a body's
 * length further up the vine, and the picture turns about them. False until the sheet has loaded (the standard pose draws instead).
 */
export function drawVineHang(ctx: CanvasRenderingContext2D, p: PlayerState, alpha = 1, time = performance.now() / 1000): boolean {
  load();
  if (!ready || !img) return false;
  const a = p.swingAngle ?? 0;
  const f = VINE_FRAMES[vinePose(a, p.swingAngularVelocity ?? 0, p.facing)];
  const gx = p.x - Math.sin(a) * VINE_HANG;
  const gy = p.y - Math.cos(a) * VINE_HANG;
  ctx.save();
  ctx.translate(gx, gy);
  // the picture's vine leans phi; turned by (phi - a) it lies along the real vine (mirrored, by (-phi - a)). Then the body swings part
  // of the way in under the hands, the way a hanging body does (the pictures drew it leaning out to one side of the vine)
  ctx.rotate(p.facing * (f.phi + SETTLE * (f.psi - f.phi)) - a + vineTrail(p.swingAngularVelocity ?? 0));
  ctx.scale(p.facing, 1);
  // the hurt blink, on the game's clock like every other pose (heroSprite.ts): it ran on the wall clock here, so it kept flickering
  // under a pause or a lesson and fell out of step with the 30 fps frames, and a still frame could catch him half see-through on the vine
  ctx.globalAlpha *= heroBlinkAlpha(p, time);
  if (alpha < 1) ctx.globalAlpha *= alpha;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  drawSheet(ctx, img, f.x, f.y, f.w, f.h, -f.gx * K, -f.gy * K, f.w * K, f.h * K);
  ctx.restore();
  return true;
}
