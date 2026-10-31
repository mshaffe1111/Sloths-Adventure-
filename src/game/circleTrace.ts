/**
 * circleTrace — the circle gesture for Meeca's carving (5-M: "Hairpin. Good. Round and round."): a finger tracing round and round on
 * the glass. Pure, so the tests can draw circles, lines and flicks through it.
 *
 * It only listens while she stands at a carving spot (the engine says so: InputEngine.carveSpot), so it never fights the normal touch
 * controls anywhere else. Even there a finger starts as an ordinary slide; once it has turned far enough (TURN_ON, about 120 degrees of
 * steady turning) it is a circle: from then on every bit of turning it does is carving (radians, handed to the engine), and the finger
 * is taken from the slide and flick recogniser (TouchController.tsx), so it does not walk her off the spot or jump.
 *
 * Turning is measured as the change of direction between successive bits of the finger's path (each at least STEP px long), so a
 * straight slide, a flick or a zigzag (which turns one way, then back) never adds up to a circle.
 */
export const TRACE = {
  /** a bit of the path shorter than this (CSS px) is not measured (a shaking finger) */
  step: 5,
  /**
   * turning this far, one way, makes it a circle (radians). (QA 2026-10-31: made more forgiving for a real phone, small and uneven
   * circles with either thumb: was 120 degrees, 6 px bits and a 75 degree corner that started the count again)
   */
  turnOn: (100 * Math.PI) / 180,
  /** a single change of direction bigger than this is a corner (a zigzag's point, a flick turning back), not a curve: it does not count */
  corner: (100 * Math.PI) / 180,
} as const;

interface Finger {
  x: number;
  y: number;
  /** the direction of the last bit (radians), or NaN before there is one */
  dir: number;
  /** signed turning so far (radians) */
  turn: number;
  circling: boolean;
}

export class CircleTrace {
  private fingers = new Map<number, Finger>();

  down(id: number, x: number, y: number) {
    this.fingers.set(id, { x, y, dir: NaN, turn: 0, circling: false });
  }

  /** the finger moved: returns how far it traced round a circle this move (radians, 0 until it is circling) */
  move(id: number, x: number, y: number): number {
    const f = this.fingers.get(id);
    if (!f) return 0;
    const dx = x - f.x, dy = y - f.y;
    if (Math.hypot(dx, dy) < TRACE.step) return 0;
    const dir = Math.atan2(dy, dx);
    f.x = x;
    f.y = y;
    if (Number.isNaN(f.dir)) {
      f.dir = dir;
      return 0;
    }
    let d = dir - f.dir;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    f.dir = dir;
    if (Math.abs(d) > TRACE.corner) {
      // a corner: a zigzag or a flick turning back, never part of a circle (it adds nothing; a tight bit of a wobbly circle is skipped
      // over, and the turning either side of it still counts)
      return 0;
    }
    if (!f.circling) {
      // (turning the other way starts the count again)
      f.turn = Math.sign(d) === Math.sign(f.turn) || f.turn === 0 ? f.turn + d : d;
      if (Math.abs(f.turn) >= TRACE.turnOn) {
        f.circling = true;
        return Math.abs(f.turn);
      }
      return 0;
    }
    return Math.abs(d);
  }

  /** is this finger tracing a circle now */
  circling(id: number): boolean {
    return !!this.fingers.get(id)?.circling;
  }

  up(id: number) {
    this.fingers.delete(id);
  }

  clear() {
    this.fingers.clear();
  }
}
