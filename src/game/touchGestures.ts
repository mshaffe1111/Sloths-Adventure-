/**
 * touchGestures — turns raw finger events into game intents, with forgiveness built in.
 *
 * There are no on-screen buttons, so one screen has to carry run, jump, duck, punch, kick and mega. The old rules
 * split the screen in half and read every sideways drag on the right half as a kick, so anyone who steered with
 * the "wrong" thumb, or whose thumb drifted across the middle, threw kick after kick. These rules are built around
 * what a thumb is actually doing:
 *
 *   - A FLICK (fast, short) is an attack or a jump. A DRAG (slower, longer) is steering. Speed decides, not the side.
 *   - A touch on the left half steers at once. A touch on the right half waits a beat to see if it is a flick, a
 *     tap or the start of a drag; if it turns out to be a drag it becomes the steering finger.
 *   - Only one finger steers. A second finger is the action finger: tap = punch, flick = kick or jump, hold = mega.
 *   - A tap that lands right after the steering finger was lifted is treated as re-planting the thumb, not a punch.
 *   - Sideways drift while steering never ducks, and a sloppy flick up while steering is forgiven.
 *
 * Pure logic: times are passed in, outputs go to a sink. The unit tests drive it with scripted fingers.
 */

export interface GestureSink {
  move(dir: 'left' | 'right' | 'none'): void;
  duck(on: boolean): void;
  jumpPress(): void;
  jumpRelease(): void;
  punch(): void;
  kick(): void;
  mega(): void;
  /** a label for the little pill on screen, plus haptics */
  feedback(kind: 'jump' | 'duck' | 'punch' | 'kick' | 'mega'): void;
}

export const TUNING = {
  /** px of drag from the anchor before the hero runs */
  moveDead: 16,
  /** the steering anchor follows the finger beyond this, so reversing direction is instant */
  reanchor: 60,
  /** px up / down from the vertical anchor for jump / duck while steering */
  jumpDy: 34,
  duckDy: 42,
  /** a flick must cover this many px … */
  flickPx: 46,
  /** … at no less than this speed (px per ms) to count the moment it happens … */
  flickSpeed: 0.8,
  /** … or this speed if the finger then lifts within `flickLiftMs` (the usual thumb flick: quick out, quick off) */
  flickLiftSpeed: 0.25,
  flickLiftMs: 250,
  /** … and be mostly along one axis */
  flickAxis: 1.4,
  /** an undecided finger resolves as a drag (steering) after this long if it has moved */
  decideMs: 210,
  /** movement needed for that */
  dragPx: 18,
  tapMs: 230,
  tapPx: 14,
  holdMs: 460,
  holdPx: 12,
  /** a tap that begins this soon after the steering finger lifted is a re-plant, not a punch */
  replantMs: 190,
  /** a second finger this close to the steering finger is probably the same hand */
  palmPx: 70,
  /** the right half starts here (fraction of the width); left of it steers at once */
  splitAt: 0.5,
} as const;

type Role = 'mover' | 'pending' | 'action' | 'ignored';

interface Finger {
  id: number;
  role: Role;
  x0: number;
  y0: number;
  x: number;
  y: number;
  t0: number;
  /** steering anchors */
  ax: number;
  ay: number;
  /** a flick, hold or mega already happened: lifting must not also punch */
  consumed: boolean;
  jumped: boolean;
  ducked: boolean;
}

export class TouchGestures {
  private fingers = new Map<number, Finger>();
  private lastMoverUp = -1e9;
  private heldDir: 'left' | 'right' | 'none' = 'none';

  private sink: GestureSink;
  private width: () => number;

  constructor(sink: GestureSink, width: () => number) {
    this.sink = sink;
    this.width = width;
  }

  private mover(): Finger | undefined {
    for (const f of this.fingers.values()) if (f.role === 'mover') return f;
    return undefined;
  }
  private actor(): Finger | undefined {
    for (const f of this.fingers.values()) if (f.role === 'action' || f.role === 'pending') return f;
    return undefined;
  }

  down(id: number, x: number, y: number, t: number) {
    if (this.fingers.has(id)) return;
    const f: Finger = { id, role: 'pending', x0: x, y0: y, x, y, t0: t, ax: x, ay: y, consumed: false, jumped: false, ducked: false };
    const m = this.mover();
    if (m) {
      // a second finger: ignore it if it is practically on top of the steering thumb
      if (Math.hypot(x - m.x, y - m.y) < TUNING.palmPx) f.role = 'ignored';
      else if (this.actor()) f.role = 'ignored';
      else f.role = 'action';
    } else if (this.actor()) {
      // another undecided finger is down already; a left-side touch takes over steering
      if (x < this.width() * TUNING.splitAt) f.role = 'mover';
      else f.role = 'ignored';
    } else if (x < this.width() * TUNING.splitAt) {
      f.role = 'mover';
    }
    this.fingers.set(id, f);
  }

  move(id: number, x: number, y: number, t: number) {
    const f = this.fingers.get(id);
    if (!f) return;
    f.x = x;
    f.y = y;
    if (f.role === 'mover') this.steer(f);
    else if (f.role === 'pending' || f.role === 'action') this.judge(f, t, false);
  }

  up(id: number, x: number, y: number, t: number) {
    const f = this.fingers.get(id);
    if (!f) return;
    f.x = x;
    f.y = y;
    this.fingers.delete(id);
    if (f.role === 'mover') {
      this.setDir('none');
      this.duckOn = false;
      this.sink.duck(false);
      if (f.jumped) this.sink.jumpRelease();
      this.lastMoverUp = t;
      // a finger that was waiting becomes undecided afresh so it can take over steering
      const a = this.actor();
      if (a && !a.consumed) {
        a.role = 'pending';
        a.x0 = a.x;
        a.y0 = a.y;
        a.t0 = t;
      }
      return;
    }
    if (f.role === 'ignored') return;
    if (f.jumped) this.sink.jumpRelease();
    if (f.ducked) this.sink.duck(false);
    if (f.consumed) return;
    // a last look: a flick that ended before it was judged
    if (this.judge(f, t, true)) return;
    const dist = Math.hypot(f.x - f.x0, f.y - f.y0);
    if (dist <= TUNING.tapPx && t - f.t0 <= TUNING.tapMs) {
      // re-planting the thumb right after steering is not a punch
      if (f.t0 - this.lastMoverUp < TUNING.replantMs) return;
      this.sink.feedback('punch');
      this.sink.punch();
    }
  }

  cancelAll() {
    for (const f of this.fingers.values()) {
      if (f.jumped) this.sink.jumpRelease();
    }
    this.fingers.clear();
    this.setDir('none');
    this.duckOn = false;
    this.sink.duck(false);
    this.sink.jumpRelease();
  }

  /** call a few times a second while any finger is down: drives holds and undecided fingers that stopped moving */
  tick(t: number) {
    for (const f of this.fingers.values()) {
      if (f.role === 'pending' || f.role === 'action') this.judge(f, t, false);
    }
  }

  get active(): boolean {
    return this.fingers.size > 0;
  }

  // ───────────────────────────── steering ─────────────────────────────

  private setDir(d: 'left' | 'right' | 'none') {
    if (d === this.heldDir) return;
    this.heldDir = d;
    this.sink.move(d);
  }

  private steer(f: Finger) {
    let dx = f.x - f.ax;
    if (dx > TUNING.reanchor) {
      f.ax = f.x - TUNING.reanchor;
      dx = TUNING.reanchor;
    } else if (dx < -TUNING.reanchor) {
      f.ax = f.x + TUNING.reanchor;
      dx = -TUNING.reanchor;
    }
    // hysteresis: starting needs the full dead zone, stopping needs the finger well back inside it
    const stop = TUNING.moveDead * 0.6;
    if (this.heldDir === 'none') this.setDir(dx > TUNING.moveDead ? 'right' : dx < -TUNING.moveDead ? 'left' : 'none');
    else if (this.heldDir === 'right') this.setDir(dx < stop ? (dx < -TUNING.moveDead ? 'left' : 'none') : 'right');
    else this.setDir(dx > -stop ? (dx > TUNING.moveDead ? 'right' : 'none') : 'left');

    // vertical: the anchor drifts after the finger so a slow slide down or up never piles up into a jump or duck
    let dy = f.y - f.ay;
    if (dy > 70) {
      f.ay = f.y - 70;
      dy = 70;
    } else if (dy < -70) {
      f.ay = f.y + 70;
      dy = -70;
    }
    // sideways drift while steering hard should not duck: it needs to be clearly downward. A thumb that is running
    // tends to roll downward on the glass, and a duck stops the hero dead, so while running it takes a bigger, more
    // downward push to duck, and once ducking, easing the thumb back up or out sideways lets the hero run again.
    const running = this.heldDir !== 'none';
    const startDy = running ? TUNING.duckDy * 1.45 : TUNING.duckDy;
    const wantDuck = this.duckOn
      ? dy > TUNING.duckDy * 0.6 && !(running && Math.abs(dx) > dy)
      : dy > startDy && dy > Math.abs(dx) * (running ? 1 : 0.6);
    if (wantDuck !== this.duckOn) {
      this.duckOn = wantDuck;
      this.sink.duck(wantDuck);
    }
    if (dy < -TUNING.jumpDy && !f.jumped) {
      f.jumped = true;
      this.sink.feedback('jump');
      this.sink.jumpPress();
    } else if (dy > -TUNING.jumpDy * 0.4 && f.jumped) {
      f.jumped = false;
      this.sink.jumpRelease();
    }
  }
  private duckOn = false;

  // ───────────────────────────── flicks, taps, holds, and undecided fingers ─────────────────────────────

  /** returns true if the finger did something this call */
  private judge(f: Finger, t: number, lifting: boolean): boolean {
    if (f.consumed) return false;
    const dx = f.x - f.x0;
    const dy = f.y - f.y0;
    const el = Math.max(1, t - f.t0);
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);

    // a flick is fast: recognised at once if it is very fast, or when the finger lifts soon after a quick sweep
    const window = lifting ? TUNING.flickLiftMs : TUNING.decideMs + 40;
    if (el <= window) {
      const sp = lifting ? TUNING.flickLiftSpeed : TUNING.flickSpeed;
      if (ay >= TUNING.flickPx * 0.9 && ay > ax * TUNING.flickAxis && ay / el >= sp * 0.75) {
        f.consumed = true;
        if (dy < 0) {
          f.jumped = true;
          this.sink.feedback('jump');
          this.sink.jumpPress();
        } else {
          f.ducked = true;
          this.sink.feedback('duck');
          this.sink.duck(true);
        }
        return true;
      }
      if (ax >= TUNING.flickPx && ax > ay * TUNING.flickAxis && ax / el >= sp) {
        f.consumed = true;
        this.sink.feedback('kick');
        this.sink.kick();
        return true;
      }
    }

    if (lifting) return false;

    // undecided and now clearly a drag: this finger steers (only a pending one, and only if nobody else does)
    if (f.role === 'pending' && el > TUNING.decideMs && Math.hypot(dx, dy) > TUNING.dragPx && !this.mover()) {
      f.role = 'mover';
      f.ax = f.x0;
      f.ay = f.y0;
      this.steer(f);
      return true;
    }
    // a long drag by an action finger while steering is going on elsewhere is just a wobble: let it be
    // a still finger held down: mega
    if (el >= TUNING.holdMs && Math.hypot(dx, dy) <= TUNING.holdPx) {
      f.consumed = true;
      this.sink.feedback('mega');
      this.sink.mega();
      return true;
    }
    return false;
  }
}
