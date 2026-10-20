/**
 * padControl — the maths of the floating thumb pad. Pure, so it can be tested without a screen.
 *
 * The pad appears under the thumb (the anchor). The thumb's offset from the anchor says what Pokey does:
 * sideways runs, down ducks, up jumps (and holds up, which is how trunks are climbed and ropes grabbed).
 */
export const PAD = {
  /** sideways offset before he runs */
  dead: 14,
  /** how far the knob may leave the anchor; past this the anchor follows, so reversing is instant */
  radius: 46,
  duckDy: 32,
  upDy: 38,
  /** a vertical move only counts when it is clearly more up/down than sideways, so running never ducks */
  vertical: 1,
} as const;

export interface PadIntent {
  move: 'left' | 'right' | 'none';
  duck: boolean;
  up: boolean;
}

export function padIntent(dx: number, dy: number): PadIntent {
  const move = dx > PAD.dead ? 'right' : dx < -PAD.dead ? 'left' : 'none';
  const vertical = Math.abs(dy) > Math.abs(dx) * PAD.vertical;
  return { move, duck: vertical && dy > PAD.duckDy, up: vertical && dy < -PAD.upDy };
}

/** drags the anchor along when the thumb runs past the pad's radius; returns the new anchor x */
export function followAnchor(anchorX: number, x: number): number {
  if (x - anchorX > PAD.radius) return x - PAD.radius;
  if (x - anchorX < -PAD.radius) return x + PAD.radius;
  return anchorX;
}

/** the knob is drawn clamped inside the ring */
export function clampKnob(dx: number, dy: number): { x: number; y: number } {
  const d = Math.hypot(dx, dy);
  if (d <= PAD.radius) return { x: dx, y: dy };
  const k = PAD.radius / d;
  return { x: dx * k, y: dy * k };
}
