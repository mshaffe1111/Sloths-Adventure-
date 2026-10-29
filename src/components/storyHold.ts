/**
 * The let-go in the tower, played (2026-10-29 story report): the rules of the thumbs, kept out of StoryPlayer so they can be tested.
 *   grip   waiting for both thumbs (Pokey holds the wall; the thunder rolls)
 *   held   both thumbs down: a moment, then the second prompt
 *   lift   "Now lift one."
 *   reach  one thumb up: his hand comes off the wall toward the General. The thunder breaks; kept up through it, the song starts (the next
 *          picture). A thumb back down grabs the wall again and the scene waits: no fail, no timer, no words.
 */
export type HoldPhase = 'grip' | 'held' | 'lift' | 'reach';

export const LETGO = {
  /** both thumbs down this long before "Now lift one." */
  liftPromptMs: 900,
  /** one thumb up this long before the thunder breaks */
  breakMs: 1100,
  /** and kept up this long after it, for the song */
  afterBreakMs: 1600,
};

/** where the scene goes when the number of thumbs down changes */
export function holdStep(phase: HoldPhase, thumbs: number): { phase: HoldPhase } {
  if (phase === 'reach') return { phase: thumbs === 1 ? 'reach' : thumbs >= 2 ? 'held' : 'grip' };
  if (thumbs >= 2) return { phase: phase === 'grip' ? 'held' : phase };
  if (thumbs === 1) return { phase: phase === 'held' || phase === 'lift' ? 'reach' : 'grip' };
  return { phase: 'grip' };
}

/** the picture's shake (scene units) and the white of the lightning: a small roll every few seconds, and the break, hard */
export function thunderShake(ms: number, sinceBreak: number | null): { dx: number; dy: number; flash: number } {
  let amp = 0;
  let flash = 0;
  const roll = ms % 3400;
  if (roll < 500) amp = 2.6 * (1 - roll / 500);
  if (sinceBreak !== null && sinceBreak >= 0 && sinceBreak < 900) {
    amp = Math.max(amp, 10 * (1 - sinceBreak / 900));
    flash = sinceBreak < 260 ? 0.55 * (1 - sinceBreak / 260) : 0;
  }
  if (amp <= 0) return { dx: 0, dy: 0, flash };
  return { dx: Math.sin(ms * 0.11) * amp, dy: Math.cos(ms * 0.137) * amp * 0.6, flash };
}
