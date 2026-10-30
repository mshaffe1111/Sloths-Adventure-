/**
 * Pokey's safe-for-a-moment blink (polish report AN-2). It used to switch on time * 24, which a 30 fps loop samples unevenly (the
 * blink stuttered: 2 frames, then 1, then 2...). Now it runs on whole frames of the 30 fps loop: two frames shown, two at 0.3, the
 * same every time. While the Solar shield runs he does not blink at all: its gold aura (miloVariants.ts drawAuras) shows steadily,
 * so the shield reads as a power and not as being hurt.
 */
import type { PlayerState } from './types.ts';

/** the loop's frame rate (locked at 30 on purpose) */
const FPS = 30;
/** how see-through he is on an off frame */
export const BLINK_OFF_ALPHA = 0.3;

/** the alpha to multiply his drawing by now: 1, or BLINK_OFF_ALPHA on the off frames of the blink */
export function heroBlinkAlpha(p: Pick<PlayerState, 'invincibleTimer' | 'activePowerUp'>, time: number): number {
  if (!(p.invincibleTimer > 0) || p.activePowerUp === 'invincible') return 1;
  const frame = Math.floor(time * FPS + 1e-6);
  return (frame >> 1) & 1 ? BLINK_OFF_ALPHA : 1;
}
