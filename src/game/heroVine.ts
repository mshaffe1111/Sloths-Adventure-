/**
 * Pokey holding a vine (Matt's vine-swing sheets, 2026-10-24): hanging still, swinging forward with his legs out ahead, and swinging back
 * with them trailing. Gemini drew a thin vine through his hands; it was taken out of the pictures (scratchpad/vine/vinecut.py), so his
 * hands close round the world's own painted liana, drawn behind him. Each picture keeps where his top hand grips and how the vine leant in
 * it, so it is turned to lie along the real vine whatever the swing's angle.
 */
import { trackAtlas } from './atlasLoader.ts';
import { VINE_FRAMES, VINE_BODY_PX } from './heroVineData.ts';
import type { PlayerState } from './types.ts';

let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(
    im,
    new URL('../assets/hero/hero-vine.webp', import.meta.url).href,
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
  // through the bottom of the swing he hangs straight; out at the ends his legs kick ahead going forward, and trail coming back
  if (Math.abs(angle) < 0.3) return 'still';
  return omega * facing > 0 || (Math.abs(omega) < 0.3 && angle * facing > 0) ? 'forward' : 'back';
}
/** how far the body swings in under the hands, from how the picture drew it (1 = straight under them, 0 = as drawn) */
const SETTLE = 0.5;

/**
 * Draw him hanging from the vine. The swing puts his feet at the end of `swingLength` along the vine (p.x, p.y); his hands are a body's
 * length further up the vine, and the picture turns about them. False until the sheet has loaded (the standard pose draws instead).
 */
export function drawVineHang(ctx: CanvasRenderingContext2D, p: PlayerState, alpha = 1): boolean {
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
  ctx.rotate(p.facing * (f.phi + SETTLE * (f.psi - f.phi)) - a);
  ctx.scale(p.facing, 1);
  if (p.invincibleTimer > 0 && Math.floor(performance.now() / 42) % 2 === 0) ctx.globalAlpha *= 0.55;
  if (alpha < 1) ctx.globalAlpha *= alpha;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, f.x, f.y, f.w, f.h, -f.gx * K, -f.gy * K, f.w * K, f.h * K);
  ctx.restore();
  return true;
}
