/**
 * A tap on Dot's card goes to the card, even while the card moves (R-165.201, INT-3 11-13).
 *
 * The card is a DOM box over the touch layer (dotGuide.css .dg-root z 34 > TouchController z 30), so a finger that lands on it never
 * reaches the gestures. But a perched card slides with the camera: at a mushroom bounce, a finger aimed at where the card WAS a moment
 * ago landed beside it on the touch layer and Pokey punched (FIX-A: 3 of 10 scripted 1-2 runs, reference/qa-reports/FIX-A/
 * tap-repeat-1-2.txt). A player aims at what they saw, which is up to a few frames old by the time the touch arrives.
 *
 * So the card's view (DotGuide.tsx) notes each box it draws the card in, and the touch layer (TouchController.tsx) asks, for each finger
 * that goes down, whether it is inside a box the card was in over the last TRAIL_MS. Such a finger is the card's: it never steers,
 * jumps or punches, and when it lifts the card is tapped (the card's own rules decide what a tap does: dotGuide.ts tap).
 * Pure: the node tests drive it with hand-made boxes and times.
 */

/** how far back a box counts: a reaction's worth of frames (about 9 at 30 fps); longer would eat a real jump or punch near a card */
export const TRAIL_MS = 300;
/** boxes kept: one a frame at up to 120 Hz over TRAIL_MS, with room */
const KEEP = 48;

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
  t: number;
}

export class CardTrail {
  private boxes: Box[] = [];
  private onTap: (() => void) | null = null;
  private claimed = new Set<number>();

  /** the card was drawn at (x, y), w x h CSS px, at time t (ms, performance.now's clock) */
  note(x: number, y: number, w: number, h: number, t: number): void {
    if (!(w > 0 && h > 0)) return;
    const last = this.boxes[this.boxes.length - 1];
    if (last && last.x === x && last.y === y && last.w === w && last.h === h) {
      last.t = t;
      return;
    }
    this.boxes.push({ x, y, w, h, t });
    if (this.boxes.length > KEEP) this.boxes.splice(0, this.boxes.length - KEEP);
  }

  /** the card is down (gone, replaced by nothing, the game paused): nothing is the card's any more */
  clear(): void {
    this.boxes.length = 0;
  }

  /** is (x, y) inside a box the card was drawn in during the last TRAIL_MS before `t`? */
  hit(x: number, y: number, t: number): boolean {
    for (let i = this.boxes.length - 1; i >= 0; i--) {
      const b = this.boxes[i];
      if (t - b.t > TRAIL_MS) break;
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return true;
    }
    return false;
  }

  /** what a tap on the card does (DotGuide.tsx sets it while it is mounted) */
  setTap(fn: (() => void) | null): void {
    this.onTap = fn;
  }

  /**
   * A finger went down at (x, y) at t: true when it is the card's (the touch layer then gives it to no gesture). Remembered by its
   * identifier until it lifts.
   */
  claim(id: number, x: number, y: number, t: number): boolean {
    // (a new finger reusing the number of one whose lift was never reported starts fresh)
    if (!this.hit(x, y, t)) {
      this.claimed.delete(id);
      return false;
    }
    this.claimed.add(id);
    return true;
  }

  /** the fingers still on the glass: any other claimed one lifted unseen and is let go without a tap (TouchController CT-16) */
  keepOnly(ids: readonly number[]): void {
    for (const id of [...this.claimed]) if (!ids.includes(id)) this.claimed.delete(id);
  }

  /** is this finger the card's (from claim until it lifts) */
  owns(id: number): boolean {
    return this.claimed.has(id);
  }

  /** a claimed finger lifted: the card is tapped. A cancelled one (a system gesture took it) is let go without a tap */
  release(id: number, tapped: boolean): void {
    if (!this.claimed.delete(id)) return;
    if (tapped) this.onTap?.();
  }
}

/** the one card on screen */
export const cardTrail = new CardTrail();
