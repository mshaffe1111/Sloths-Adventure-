/**
 * padControl — the maths of the floating thumb pad. Pure, so it can be tested without a screen.
 *
 * The pad appears under the thumb (the anchor). The thumb's offset from the anchor says what Pokey does:
 * sideways runs, down ducks, up jumps (and holds up, which is how trunks are climbed and ropes grabbed). On a trunk or a liana up and
 * down climb, and only the Jump button or a push well over leaps off (padLeap).
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
  /**
   * on a trunk or a liana: up or down this far (and more up/down than sideways) climbs, and never jumps (Matt's vine rule: straight up or
   * down always climbs). Pad up used to be a jump there, so pushing up again on a trunk leapt off and a liana let go (polish report CT-2)
   */
  climbDy: 20,
  /** on a trunk: a push steers (and, held 0.35 s, hops off) only this far sideways and twice as far across as up or down (CT-4) */
  vineSideDx: 40,
} as const;

/**
 * on a trunk or a liana: a push this far up (upDy) that leans 45 degrees or more over (as far across as up) leaps off that way (-1, 1);
 * 0 for anything else
 */
export function padLeap(dx: number, dy: number): -1 | 0 | 1 {
  if (dy > -PAD.upDy || Math.abs(dx) < -dy) return 0;
  return dx < 0 ? -1 : 1;
}

/** on a trunk or a liana: what a push climbs (-1 up, 1 down, 0 neither) */
export function padClimb(dx: number, dy: number): -1 | 0 | 1 {
  if (Math.abs(dy) <= Math.abs(dx) * PAD.vertical) return 0;
  return dy < -PAD.climbDy ? -1 : dy > PAD.climbDy ? 1 : 0;
}

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

/** the parts of the InputEngine the Pad drives (inputEngine.ts) */
export interface PadInputTarget {
  onVine: boolean;
  triggerTouchMove(d: 'left' | 'right' | 'none'): void;
  triggerTouchDuck(on: boolean): void;
  triggerTouchUp(lean?: -1 | 0 | 1): void;
  releaseTouchUp(): void;
  triggerTouchClimb(dir: -1 | 0 | 1): void;
  triggerHaptic(ms?: number): void;
}

/**
 * The Pad's thumb pad and Jump button, turned into input (PadController.tsx draws them and feeds this). Pure apart from the input it
 * drives, so the tests can play it against the real engine.
 */
export class PadInput {
  private move: 'left' | 'right' | 'none' = 'none';
  private duck = false;
  /** who holds Jump down: the pad pushed up, the Jump button */
  private jumpSrc = new Set<string>();

  constructor(private readonly inp: PadInputTarget) {}

  /** climbing a trunk or a liana (-1 up, 1 down) */
  private climb: -1 | 0 | 1 = 0;

  private jumpSet(src: string, on: boolean, lean: -1 | 0 | 1 = 0) {
    const s = this.jumpSrc;
    const before = s.size > 0;
    if (on) s.add(src);
    else s.delete(src);
    const after = s.size > 0;
    if (!before && after) {
      this.inp.triggerTouchUp(lean);
      this.inp.triggerHaptic(15);
    } else if (before && !after) this.inp.releaseTouchUp();
  }

  /** the thumb is (dx, dy) from the pad's anchor */
  private setClimb(d: -1 | 0 | 1) {
    if (d === this.climb) return;
    this.climb = d;
    this.inp.triggerTouchClimb(d);
  }

  pad(dx: number, dy: number) {
    const it = padIntent(dx, dy);
    // (on a trunk or a liana a thumb resting a little sideways is not a push to get off: CT-4)
    if (this.inp.onVine && !(Math.abs(dx) >= PAD.vineSideDx && Math.abs(dx) >= 2 * Math.abs(dy))) it.move = 'none';
    if (it.move !== this.move) {
      this.move = it.move;
      this.inp.triggerTouchMove(it.move);
    }
    if (this.inp.onVine) {
      // on a trunk or a liana: up and down climb; only a push well over (45 degrees, 38 px up) leaps, the way it leans
      if (this.duck) {
        this.duck = false;
        this.inp.triggerTouchDuck(false);
      }
      const leap = padLeap(dx, dy);
      this.setClimb(leap ? 0 : padClimb(dx, dy));
      this.jumpSet('pad', leap !== 0, leap);
      return;
    }
    this.setClimb(0);
    if (it.duck !== this.duck) {
      this.duck = it.duck;
      this.inp.triggerTouchDuck(it.duck);
    }
    this.jumpSet('pad', it.up);
  }

  /** the pad's thumb lifted */
  padUp() {
    this.move = 'none';
    this.duck = false;
    this.inp.triggerTouchMove('none');
    this.inp.triggerTouchDuck(false);
    this.setClimb(0);
    this.jumpSet('pad', false);
  }

  /** the Jump button pressed or let go */
  jumpButton(on: boolean) {
    // a press of the button is always a new jump press, even while the pad is held up (the second jump; or a leap off a trunk the pad
    // held up from before the grab): the pad holding Jump down swallowed it (polish report CT-26)
    if (on && this.jumpSrc.size > 0 && !this.jumpSrc.has('btn')) {
      this.jumpSrc.add('btn');
      this.inp.triggerTouchUp();
      this.inp.triggerHaptic(15);
      return;
    }
    this.jumpSet('btn', on);
  }
}
