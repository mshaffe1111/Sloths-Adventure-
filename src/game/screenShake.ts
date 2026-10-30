/**
 * The screen shake (polish report AN-10): a smooth wobble that dies away, not a random jump every frame. The offset follows a few
 * slow sine waves at unrelated rates (so it never repeats a pattern you can see), scaled by trauma squared, so a big hit kicks
 * hard and settles quickly. A setting turns it down or off; a phone that asks for reduced motion starts at Gentle.
 */
export type ShakeLevel = 'full' | 'gentle' | 'off';

const KEY = 'sloth_shake';
const SCALE: Record<ShakeLevel, number> = { full: 1, gentle: 0.35, off: 0 };

let level: ShakeLevel | null = null;
export function shakeLevel(): ShakeLevel {
  if (level) return level;
  let v: ShakeLevel = 'full';
  try {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) v = 'gentle';
    const s = localStorage.getItem(KEY);
    if (s === 'full' || s === 'gentle' || s === 'off') v = s;
  } catch {
    /* no storage: the default */
  }
  return (level = v);
}
export function setShakeLevel(v: ShakeLevel): void {
  level = v;
  try {
    localStorage.setItem(KEY, v);
  } catch {
    /* kept for this visit only */
  }
}

/**
 * The shake's offset in world units at game time `t` (s) for this much trauma (0..1): at most `max` across, smooth from frame to
 * frame, and nothing at all with no trauma or the setting off.
 */
export function shakeOffset(trauma: number, t: number, max = 16, scale = SCALE[shakeLevel()]): { x: number; y: number } {
  const k = Math.max(0, Math.min(1, trauma));
  const mag = k * k * max * 0.5 * scale;
  if (mag < 0.01) return { x: 0, y: 0 };
  // (three waves per axis, about 3.5 to 6.5 swings a second: quick enough to read as a shake, and well under the 15 a second that 30 fps
  // can show, so it never breaks up into jumps)
  const x = 0.5 * Math.sin(t * 22.3) + 0.3 * Math.sin(t * 31.9 + 1.3) + 0.2 * Math.sin(t * 40.7 + 2.1);
  const y = 0.5 * Math.sin(t * 25.1 + 0.7) + 0.3 * Math.sin(t * 34.3 + 2.9) + 0.2 * Math.sin(t * 38.9 + 4.2);
  return { x: x * mag, y: y * mag };
}
