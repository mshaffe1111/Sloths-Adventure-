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
 * Jump help (jumpHelp.ts, on by default) adds, for the second jump:
 *   - in the air with a second jump to spare, a TAP anywhere is that jump (it used to be a punch), and so is a short, slow slide up;
 *   - the steering thumb itself can jump again with a short down-and-up wiggle, so one finger is enough;
 *   - a finger that is not steering and slides up (at any speed) is a jump, where it used to need a fast flick and otherwise did nothing.
 *
 * Pure logic: times are passed in, outputs go to a sink. The unit tests drive it with scripted fingers.
 */

export interface GestureSink {
  move(dir: 'left' | 'right' | 'none'): void;
  duck(on: boolean): void;
  jumpPress(): void;
  jumpRelease(): void;
  punch(): void;
  kick(dir?: -1 | 1): void;
  mega(): void;
  /** hold climbing up (-1), down (1) or stop (0) on a vine or trunk, with no jump and no duck (refined controls) */
  climb?(dir: -1 | 0 | 1): void;
  /** a tap that jumps because there was nothing to hit (refined controls, tapJump): a full jump. Unset = jumpPress then jumpRelease */
  tapJump?(): void;
  /** a label for the little pill on screen, plus haptics */
  feedback(kind: 'jump' | 'duck' | 'punch' | 'kick' | 'mega'): void;
}

export const TUNING = {
  /** px of drag from the anchor before the hero runs */
  moveDead: 16,
  /** the steering anchor follows the finger beyond this, so reversing direction is instant */
  reanchor: 30,
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
  /** a thumb that started steering at once (left half) and lifts like a flick must be clearly faster than a nudge to count as a kick */
  steerFlickSpeed: 0.5,
  /** … and be mostly along one axis */
  flickAxis: 1.4,
  /** an undecided finger resolves as a drag (steering) after this long if it has moved */
  decideMs: 210,
  /** movement needed for that */
  dragPx: 18,
  tapMs: 420,
  tapPx: 22,
  holdMs: 460,
  holdPx: 20,
  /** a tap that begins this soon after the steering finger lifted is a re-plant, not a punch */
  replantMs: 190,
  /** a second finger this close to the steering finger is probably the same hand */
  palmPx: 70,
  /** the right half starts here (fraction of the width); left of it steers at once */
  splitAt: 0.5,

  // ---- jump help ----
  /** a finger that is not steering and slides up this far is a jump, at any speed (it used to need a fast flick, and a slow slide did nothing) */
  slideUpPx: 30,
  /** in the air with a second jump to spare: an upward move this far (mostly up) is that jump … */
  airUpPx: 16,
  /** … and the steering thumb jumps again on this shorter slide, … */
  airJumpDy: 28,
  /** … or on a wiggle: down this far, then up this far, no faster than this (px per ms) */
  pumpDown: 12,
  pumpUp: 20,
  pumpSpeed: 0.1,
  /** a second jump that has just fired locks the next for this long (the engine needs a frame to know it was used) */
  airLockMs: 160,
  /**
   * a lone finger on the right half used to wait 210 ms before it could start the run, so every run started from that side lagged by
   * six frames. Now a clearly sideways slide starts the run after this long (and this far), and if the finger then lifts like a flick it
   * is still the kick it always was.
   */
  earlyDragMs: 60,
  earlyDragPx: 18,
} as const;

/** what the recogniser may ask the game: is jump help on, and is he in the air with a second jump to spare */
export interface GestureEnv {
  assist(): boolean;
  air(): boolean;
  /** false while a mega punch is still cooling down: a held thumb then waits instead of announcing a punch that cannot happen */
  megaReady?(): boolean;
  /**
   * Refined controls (the control test's answer, 2026-10-23): a sideways flick only kicks when something is there to kick. The recorded
   * testers threw 85 kicks and 80 of them had no animal within 250 px: a steering thumb lifting quickly, or a quick sideways swipe that
   * was meant to start a run (in all 27 of those the finger stayed down afterwards and wanted to run). Unset = the old rules.
   */
  refined?(): boolean;
  /** an animal, the boss or a cage is close enough to kick (asked only when refined) */
  kickNear?(): boolean;
  /**
   * he is on a vine or a trunk (climbing or swinging). With refined controls, straight up and down there always CLIMB: up is never a
   * jump and down is never a duck (Jen's index finger on a vine kept making him jump). Only a diagonal slide up jumps off.
   */
  onVine?(): boolean;
  /**
   * Refined controls, second round (the control test, 2026-10-24): a tap with nothing near enough to hit is a JUMP, standing or swinging
   * (swinging, that jump is the leap off the vine). Beginners tap to jump: one tester's first run threw 150 punches at nothing, 79 of
   * them hanging on a vine trying to let go and 72 at the foot of a stump trying to get up it. With a foe or a cage in reach a tap
   * still punches, and swipes are untouched.
   */
  tapJump?(): boolean;
}

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
  /** recent (t,y) samples for the vertical-speed gate */
  hist: { t: number; y: number; x?: number }[];
  tapT0: number;
  /** after a jump: the highest the thumb has been, and the lowest since (for the wiggle that jumps again) */
  pk: number;
  tr: number;
  /** began as an undecided finger and took over the steering early: a flick on lifting is still a kick */
  early: boolean;
  /** this finger already threw its mega punch while resting; it may still go on to steer */
  megaDone: boolean;
}

export class TouchGestures {
  private fingers = new Map<number, Finger>();
  private lastMoverUp = -1e9;
  private lastMoverUpX = 0;
  private lastMoverUpY = 0;
  private heldDir: 'left' | 'right' | 'none' = 'none';

  private sink: GestureSink;
  private width: () => number;
  private env: GestureEnv | undefined;
  /** the time of the latest event, for the rules that run from inside steer() */
  private now = 0;
  private lastAir = -1e9;

  constructor(sink: GestureSink, width: () => number, env?: GestureEnv) {
    this.sink = sink;
    this.width = width;
    this.env = env;
  }

  /** refined controls are on and he is on a vine or trunk: vertical slides climb */
  private vine(): boolean {
    return !!this.env?.refined?.() && !!this.env.onVine?.();
  }
  private climbDir: -1 | 0 | 1 = 0;
  private setClimb(d: -1 | 0 | 1) {
    if (d === this.climbDir) return;
    this.climbDir = d;
    this.sink.climb?.(d);
  }

  /** refined controls are on and nothing is near enough to kick: a sideways flick is a run, not a kick */
  private noKick(): boolean {
    return !!this.env?.refined?.() && !(this.env.kickNear?.() ?? true);
  }

  private assistOn(): boolean {
    return !!this.env && this.env.assist();
  }
  /** in the air with a second jump to spare (and none just used) */
  private canAir(): boolean {
    return !!this.env && this.env.assist() && this.env.air() && this.now - this.lastAir > TUNING.airLockMs;
  }
  /** a jump the finger asked for: `air` marks it as the second jump, so another cannot fire on its heels */
  private fireJump(f: Finger, air: boolean) {
    if (f.role !== 'mover') f.consumed = true;
    f.jumped = true;
    f.pk = f.y;
    f.tr = f.y;
    if (air) this.lastAir = this.now;
    this.sink.feedback('jump');
    this.sink.jumpPress();
  }

  private mover(): Finger | undefined {
    for (const f of this.fingers.values()) if (f.role === 'mover') return f;
    return undefined;
  }
  /** another undecided or action finger is down besides `f` */
  private actorOther(f: Finger): boolean {
    for (const o of this.fingers.values()) if (o !== f && (o.role === 'action' || o.role === 'pending')) return true;
    return false;
  }
  private actor(): Finger | undefined {
    for (const f of this.fingers.values()) if (f.role === 'action' || f.role === 'pending') return f;
    return undefined;
  }

  down(id: number, x: number, y: number, t: number) {
    this.now = t;
    if (this.fingers.has(id)) return;
    const f: Finger = { id, role: 'pending', x0: x, y0: y, x, y, t0: t, ax: x, ay: y, consumed: false, jumped: false, ducked: false, hist: [{ t, y, x }], tapT0: t, pk: y, tr: y, early: false, megaDone: false };
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
    this.now = t;
    const f = this.fingers.get(id);
    if (!f) return;
    f.x = x;
    f.y = y;
    f.hist.push({ t, y, x });
    while (f.hist.length > 2 && t - f.hist[0].t > 150) f.hist.shift();
    if (f.role === 'mover') this.steer(f);
    else if (f.role === 'pending' || f.role === 'action') this.judge(f, t, false);
  }

  up(id: number, x: number, y: number, t: number) {
    this.now = t;
    const f = this.fingers.get(id);
    if (!f) return;
    f.x = x;
    f.y = y;
    this.fingers.delete(id);
    if (f.role === 'mover') {
      const stillTap = !f.jumped && !f.ducked && this.heldDir === 'none' && Math.hypot(f.x - f.x0, f.y - f.y0) <= TUNING.tapPx && t - f.tapT0 <= TUNING.tapMs;
      const wasReplant = f.tapT0 - this.lastMoverUp < TUNING.replantMs;
      // only a finger that really steered or jumped counts as a "thumb that was just lifted". A finger that merely tapped must not:
      // otherwise every tap in a quick run of taps on the left half would look like a re-plant of the one before, and be eaten
      const wasTap = !f.jumped && !f.ducked && Math.hypot(f.x - f.x0, f.y - f.y0) <= TUNING.tapPx && t - f.tapT0 <= TUNING.tapMs && this.heldDir === 'none';
      this.setDir('none');
      this.setClimb(0);
      this.duckOn = false;
      this.sink.duck(false);
      if (f.jumped) this.sink.jumpRelease();
      // a finger that started the run and lifts like a flick was a kick all along: quick, long, sideways, then off the glass. This holds
      // on the left half too, where the run starts at once and a flick used to leave only a stutter (speed decides, not the side)
      const edx = f.x - f.x0;
      const eel = Math.max(1, t - f.t0);
      const flicked = !this.noKick() && !f.jumped && !f.ducked && eel <= TUNING.flickLiftMs && Math.abs(edx) >= TUNING.flickPx && Math.abs(edx) >= Math.abs(f.y - f.y0) && Math.abs(edx) / eel >= (f.early ? TUNING.flickLiftSpeed : TUNING.steerFlickSpeed);
      if (flicked) {
        this.sink.feedback('kick');
        this.sink.kick(edx < 0 ? -1 : 1);
      }
      if (stillTap && this.canAir()) {
        // in the air with a second jump to spare, a tap is that jump (and a thumb put down in the air is not a re-plant: it is a tap)
        this.lastAir = t;
        this.sink.feedback('jump');
        this.sink.jumpPress();
        this.sink.jumpRelease();
      } else if (stillTap && !wasReplant) this.tapAct();
      if (!wasTap && !flicked) {
        this.lastMoverUp = t;
        this.lastMoverUpX = f.x;
        this.lastMoverUpY = f.y;
      }
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
    const was = f.consumed;
    // a last look: a flick that ended before it was judged (BEFORE releasing, so what it presses is released too)
    const acted = !was && this.judge(f, t, true);
    if (f.jumped) this.sink.jumpRelease();
    if (f.ducked) this.sink.duck(false);
    if (was || acted) return;
    const dist = Math.hypot(f.x - f.x0, f.y - f.y0);
    if (dist <= TUNING.tapPx && t - f.tapT0 <= TUNING.tapMs) {
      if (this.canAir()) {
        // in the air with a second jump to spare: a tap is that jump, not a punch
        this.lastAir = t;
        this.sink.feedback('jump');
        this.sink.jumpPress();
        this.sink.jumpRelease();
        return;
      }
      // re-planting the thumb right after steering is not a punch: only if it began after the lift AND near it
      const replant = f.tapT0 >= this.lastMoverUp && f.tapT0 - this.lastMoverUp < TUNING.replantMs &&
        Math.hypot(f.x0 - this.lastMoverUpX, f.y0 - this.lastMoverUpY) < 100;
      if (replant) return;
      this.tapAct();
    }
  }

  /** a tap on the ground or a vine: a punch when something is in reach, else (refined controls) a jump */
  private tapAct() {
    if (this.env?.refined?.() && this.env.tapJump?.()) {
      this.sink.feedback('jump');
      if (this.sink.tapJump) this.sink.tapJump();
      else {
        this.sink.jumpPress();
        this.sink.jumpRelease();
      }
      return;
    }
    this.sink.feedback('punch');
    this.sink.punch();
  }

  /** a finger that was cancelled (not lifted): let go of what it held, and judge nothing */
  cancelFinger(id: number, t: number) {
    const f = this.fingers.get(id);
    if (!f) return;
    if (f.role === 'mover') this.setClimb(0);
    this.fingers.delete(id);
    if (f.jumped) this.sink.jumpRelease();
    if (f.ducked) this.sink.duck(false);
    if (f.role === 'mover') {
      this.setDir('none');
      this.duckOn = false;
      this.sink.duck(false);
      const a = this.actor();
      if (a && !a.consumed) {
        a.role = 'pending';
        a.x0 = a.x;
        a.y0 = a.y;
        a.t0 = t;
        a.tapT0 = t;
      }
    }
  }

  cancelAll() {
    this.setClimb(0);
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
    this.now = t;
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

    if (this.vine()) {
      this.vineSteer(f);
      return;
    }
    if (this.climbDir !== 0) this.setClimb(0); // off the vine now (at the top, or let go): the climb is over
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
    // a jump needs an upward SPEED (or a really long push): a thumb that slowly creeps up while running, or comes back
    // from a deep duck, is not a jump
    const h0 = f.hist[0];
    const vUp = f.hist.length > 1 ? (h0.y - f.y) / Math.max(1, f.hist[f.hist.length - 1].t - h0.t) : 0;
    const dyJ = f.y - Math.min(f.ay, f.y0); // after a deep duck the anchor sits low: coming back to where the thumb landed is not a jump
    // in the air with a second jump to spare, a shorter slide is enough
    const air = this.canAir();
    const jdy = air ? TUNING.airJumpDy : TUNING.jumpDy;
    if (dyJ < -jdy && !f.jumped && (vUp >= 0.15 || dyJ < -jdy * 2)) {
      this.fireJump(f, air);
    } else if (dy > -TUNING.jumpDy * 0.4 && f.jumped) {
      f.jumped = false;
      this.sink.jumpRelease();
    } else if (f.jumped && this.assistOn()) {
      // one finger can jump twice: after a jump the thumb tracks its peak and the lowest it sank since, and a short wiggle
      // (down a little, then up a little) in the air is the second jump
      // the speed up over the last moments only: over 150 ms the way down is still in the sum, and a wiggle looks as if it went nowhere
      let r0 = f.hist[0];
      for (let i = f.hist.length - 1; i >= 0; i--) {
        r0 = f.hist[i];
        if (this.now - r0.t >= 60) break;
      }
      const vNow = (r0.y - f.y) / Math.max(1, this.now - r0.t);
      if (air && f.tr - f.pk >= TUNING.pumpDown && f.y < f.tr - TUNING.pumpUp && vNow >= TUNING.pumpSpeed) {
        this.lastAir = this.now;
        f.pk = f.y;
        f.tr = f.y;
        this.sink.feedback('jump');
        this.sink.jumpPress();
      } else if (f.y < f.pk && f.tr - f.pk < TUNING.pumpDown) {
        // still on the way up (not yet sunk): the peak follows the thumb
        f.pk = f.y;
        f.tr = f.y;
      } else if (f.y > f.tr) f.tr = f.y;
    }
  }
  private duckOn = false;

  /**
   * On a vine or trunk (refined): the finger is a joystick for climbing. Above where it was planted = climb up, below = climb down, held
   * as long as it stays there; the anchor follows the finger so moving back the other way turns round at once. A slide that goes up AND
   * clearly sideways (diagonal) is the only jump, the way Pokey leaves a vine.
   */
  private vineSteer(f: Finger) {
    if (this.duckOn) {
      this.duckOn = false;
      this.sink.duck(false);
    }
    let dy = f.y - f.ay;
    const reach = 40;
    if (dy > reach) {
      f.ay = f.y - reach;
      dy = reach;
    } else if (dy < -reach) {
      f.ay = f.y + reach;
      dy = -reach;
    }
    // the last ~120 ms of movement: a diagonal flick up jumps off
    const h0 = f.hist[0];
    const mx = f.x - (h0.x ?? f.x);
    const my = f.y - h0.y;
    if (!f.jumped && my < -TUNING.jumpDy && Math.abs(mx) >= Math.abs(my) * 0.7) {
      this.setClimb(0);
      this.fireJump(f, false);
      return;
    }
    if (f.jumped && dy > -TUNING.jumpDy * 0.4) {
      f.jumped = false;
      this.sink.jumpRelease();
    }
    this.setClimb(dy < -16 ? -1 : dy > 16 ? 1 : 0);
  }

  // ───────────────────────────── flicks, taps, holds, and undecided fingers ─────────────────────────────

  /** returns true if the finger did something this call */
  private judge(f: Finger, t: number, lifting: boolean): boolean {
    if (f.consumed) return false;
    const dx = f.x - f.x0;
    const dy = f.y - f.y0;
    const el = Math.max(1, t - f.t0);
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);

    // on a vine or trunk (refined): a lone finger that moves takes over at once as the climbing finger; nothing vertical is a jump or duck
    if (this.vine() && !lifting && f.role === 'pending' && !this.mover() && Math.hypot(dx, dy) >= 12) {
      f.role = 'mover';
      f.ax = f.x0;
      f.ay = f.y0;
      this.steer(f);
      return true;
    }
    // a flick is fast: recognised at once if it is very fast, or when the finger lifts soon after a quick sweep
    const window = lifting ? TUNING.flickLiftMs : TUNING.decideMs + 40;
    if (el <= window) {
      const sp = lifting ? TUNING.flickLiftSpeed : TUNING.flickSpeed;
      const upish = dy < 0 && ay >= ax * 0.85;
      if (ay >= TUNING.flickPx * 0.9 && (upish || (dy > 0 && ay >= ax)) && ay / el >= sp * 0.75) {
        f.consumed = true;
        if (dy < 0) {
          this.fireJump(f, this.canAir());
        } else {
          f.ducked = true;
          this.sink.feedback('duck');
          this.sink.duck(true);
        }
        return true;
      }
      if (ax >= TUNING.flickPx && !upish && ax >= ay && ax / el >= sp) {
        if (this.noKick()) {
          // nothing to kick: a lone finger flicking sideways wants to run that way, so it steers from where it began
          if (f.role === 'pending' && !this.mover() && !lifting) {
            f.role = 'mover';
            f.early = true;
            f.ax = f.x0;
            f.ay = f.y0;
            this.steer(f);
            return true;
          }
          return false;
        }
        f.consumed = true;
        this.sink.feedback('kick');
        this.sink.kick(dx < 0 ? -1 : 1);
        return true;
      }
    }

    // jump help: a finger that is not steering and goes UP is a jump, fast or not. In the air with a second jump to spare a short move
    // is enough; on the ground it takes a proper slide (a slow slide up by a second finger used to do nothing at all)
    if (dy < 0 && this.assistOn()) {
      const air = this.canAir();
      // on the ground only for a finger beside a steering thumb: a lone finger that slides up slowly is about to steer, and takes that path
      if ((air || f.role === 'action') && ay >= (air ? TUNING.airUpPx : TUNING.slideUpPx) && ay >= ax * 0.85) {
        this.fireJump(f, air);
        return true;
      }
    }

    if (lifting) return false;

    // jump help: a lone undecided finger that is clearly sliding sideways starts the run now, not 210 ms from now
    if (f.role === 'pending' && this.assistOn() && !this.mover() && el >= TUNING.earlyDragMs && ax >= TUNING.earlyDragPx && ax >= ay * 1.2 && !this.actorOther(f)) {
      f.role = 'mover';
      f.early = true;
      f.ax = f.x0;
      f.ay = f.y0;
      this.steer(f);
      return true;
    }

    // undecided and now clearly a drag: this finger steers (only a pending one, and only if nobody else does)
    if (f.role === 'pending' && el > TUNING.decideMs && Math.hypot(dx, dy) > TUNING.dragPx && !this.mover()) {
      f.role = 'mover';
      f.ax = f.x0;
      f.ay = f.y0;
      this.steer(f);
      return true;
    }
    // a long drag by an action finger while steering is going on elsewhere is just a wobble: let it be
    // a still finger held down: mega (but not while the last one is still cooling down: the thumb waits, and it goes off the moment it can)
    if (!f.megaDone && el >= TUNING.holdMs && Math.hypot(dx, dy) <= TUNING.holdPx) {
      if (this.env?.megaReady && !this.env.megaReady()) return false;
      f.megaDone = true;
      // a lone thumb that was only resting is not used up: if it then slides, it steers (it used to be stuck, unable to steer until lifted)
      if (f.role !== 'pending') f.consumed = true;
      this.sink.feedback('mega');
      this.sink.mega();
      return true;
    }
    return false;
  }
}
