/**
 * The stage-cleared confetti (polish report UI-3): the pieces fall once, over CONFETTI_MS, then are gone; three stars throw a bigger
 * burst. Laid out from a fixed seed, so the same card always throws the same handful (and the test can count them).
 */
export const CONFETTI_MS = 1600;
export const CONFETTI_PIECES = 24;
export const CONFETTI_BURST = 36;

export interface ConfettiPiece {
  kind: 'star' | 'leaf' | 'dot';
  colour: string;
  /** where it starts across the screen, 0-100 (%) */
  x: number;
  /** how far it drifts sideways on the way down (vw) */
  drift: number;
  /** when it sets off and how long it falls (ms): delay + fall never past CONFETTI_MS */
  delay: number;
  fall: number;
  spin: number;
  size: number;
}

const COLOURS = ['#fbbf24', '#34d399', '#f472b6', '#fde68a', '#60a5fa'];

export function confettiPieces(stars: number): ConfettiPiece[] {
  const n = stars >= 3 ? CONFETTI_BURST : CONFETTI_PIECES;
  let s = 7 + stars * 101;
  const r = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const out: ConfettiPiece[] = [];
  for (let i = 0; i < n; i++) {
    const delay = Math.round(r() * 380);
    const fall = Math.round(Math.min(CONFETTI_MS - delay, 1050 + r() * 550));
    out.push({
      kind: (['star', 'leaf', 'dot'] as const)[i % 3],
      colour: COLOURS[i % COLOURS.length],
      // (spread across the whole width, a little more toward the middle on a three-star burst)
      x: Math.round((stars >= 3 ? 50 + (r() - 0.5) * 96 : 4 + r() * 92) * 10) / 10,
      drift: Math.round((r() - 0.5) * 18 * 10) / 10,
      delay,
      fall,
      spin: Math.round((r() < 0.5 ? -1 : 1) * (240 + r() * 480)),
      size: Math.round(10 + r() * (stars >= 3 ? 10 : 7)),
    });
  }
  return out;
}
