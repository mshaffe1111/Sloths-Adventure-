/**
 * The stage-cleared card's timeline (polish report UI-2 and AN-11): the card lifts in, then score, time and flowers count up together
 * over COUNT_MS with an ease-out and a soft tick every TICK_MS (TICK_MAX at most), a chime as the counts land, and only then the stars
 * drop in one by one. A tap anywhere skips to the end; with motion turned down everything shows at its final value at once.
 */
/** the card's lift-in (cleared.css clr-in) */
export const CARD_IN_MS = 420;
/**
 * the counts start a beat after the card has landed, and just after the opening timpani hit of the victory sting (which plays as the
 * card lands, at 420 ms: StatusModals.tsx CARD_LANDS_MS, polish A2's SN-5), so the first ticks never sit on that hit; the rest of the ticks run softly under the brass
 */
export const COUNT_START_MS = 650;
export const COUNT_MS = 800;
export const TICK_MS = 50;
export const TICK_MAX = 16;
/** the stars land after the counts, one every STAR_GAP_MS */
export const STARS_START_MS = COUNT_START_MS + COUNT_MS + 140;
export const STAR_GAP_MS = 280;
/** the medal row comes in after the last star */
export const medalsAtMs = (stars: number) => STARS_START_MS + Math.max(0, stars - 1) * STAR_GAP_MS + 420;

/** ease-out cubic: fast at first, settling onto the final number */
export const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

/** how far through the count (0..1) at `ms` after the card opened */
export function countProgress(ms: number): number {
  return easeOut((ms - COUNT_START_MS) / COUNT_MS);
}

/** a value part way through its count: whole numbers only, and never past the final one */
export const countValue = (final: number, p: number) => Math.min(final, Math.round(final * Math.min(1, Math.max(0, p))));

/** when the ticks sound (ms after the card opened): every TICK_MS through the count, TICK_MAX at most, none for a count of nothing */
export function tickTimes(final: number): number[] {
  if (final <= 0) return [];
  const n = Math.min(TICK_MAX, Math.floor(COUNT_MS / TICK_MS));
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(COUNT_START_MS + i * TICK_MS);
  return out;
}

/** when each earned star lands (ms after the card opened) */
export const starTimes = (stars: number) => Array.from({ length: Math.max(0, stars) }, (_, i) => STARS_START_MS + i * STAR_GAP_MS);
