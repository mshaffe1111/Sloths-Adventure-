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
 *   - A tap is always a punch (in the air, a jump kick): every jump is the finger moving up (Matt, 2026-10-25, undoing the control test's
 *     tap-jump: a tap had jumped whenever nothing was close enough to hit).
 *   - A tap that lands right after the steering finger was lifted is treated as re-planting the thumb, not a punch.
 *   - Sideways drift while steering never ducks, and a sloppy flick up while steering is forgiven.
 *
 * Jump help (jumpHelp.ts, on by default) adds, for the second jump:
 *   - in the air with a second jump to spare, a short, slow slide up is that jump;
 *   - the steering thumb itself can jump again with a short down-and-up wiggle, so one finger is enough;
 *   - a finger that is not steering and slides up (at any speed) is a jump, where it used to need a fast flick and otherwise did nothing;
 *   - a thumb put down in the air a moment ago (on either half) that goes mostly up is that jump on the same short rise (freshAirFlick);
 *   - a thumb whose flick jumped and that stays on the glass jumps again on a sink and a flick up (airAgain).
 * On a vine, a liana or a trunk, a whole touch that is one quick stroke up and over lets go when it lifts, however far over (vineFlickMs).
 *
 * Pure logic: times are passed in, outputs go to a sink. The unit tests drive it with scripted fingers.
 */

export interface GestureSink {
  move(dir: 'left' | 'right' | 'none'): void;
  duck(on: boolean): void;
  /**
   * a jump. `lean`: the flick behind it leaned 20 degrees or more off straight up, this way (-1 left, 1 right); 0 or unset when it went
   * (nearly) straight up. Off a vine or a trunk he leaps the way it leaned (engine.ts leapDir).
   */
  jumpPress(lean?: -1 | 0 | 1): void;
  jumpRelease(): void;
  punch(): void;
  kick(dir?: -1 | 1): void;
  mega(): void;
  /** hold climbing up (-1), down (1) or stop (0) on a vine or trunk, with no jump and no duck (refined controls) */
  climb?(dir: -1 | 0 | 1): void;
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
  /** a steering thumb's duck must be going down this steeply over its last 150 ms (down / across): 1 is 45 degrees … */
  duckSlant: 1,
  /** … and 2 (63 degrees) while running, when the thumb sweeps about as it turns */
  duckSlantRun: 2,
  /** how far back (ms) that slant is measured: a sweep that ends going straight down is still a sweep */
  duckTrailMs: 300,
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
  /**
   * a tap that begins this soon after the steering finger lifted is the thumb bouncing back onto the glass, not a punch. It was 190 ms,
   * and replaying the control test's fingers through these rules showed it ate one tap in seven: run up to a snake, let go, tap. A
   * thumb that is really put back down to steer stays down, so it is never a tap anyway (2026-10-25)
   */
  replantMs: 50,
  /**
   * a short touch that drifts sideways a little is still a tap, though it nudged a step first: a thumb tap on a phone often slides
   * 15 to 30 px. In the recordings those touches were followed by another tap exactly as often as clean taps were (people mash punch),
   * and two in three of them did nothing (2026-10-25)
   */
  nudgeTapPx: 30,
  nudgeTapMs: 250,
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
  /**
   * on a vine (refined): a slide up this far off straight is a leap off, not a climb (tan of the angle: 0.36 is 20 degrees). It was 0.7
   * (35 degrees), so a thumb flicking "up and forward" the way the swing card says, about 27 degrees over, climbed instead (2026-10-25)
   */
  vineLeapSlant: 0.36,
  /**
   * a jump's flick that leans this far off straight up (tan of the angle: 0.364 is 20 degrees) carries its lean to the game, and a let-go
   * from a vine or a trunk leaps that way. It used to follow his facing or the held steer whatever the flick did, so after a pump to the
   * right a flick up and LEFT leaped right, and a flick up and right while he faced left threw him backward (QA, 2026-10-26)
   */
  leanSlant: 0.364,
  /**
   * … and go no more than this far sideways for each px it rises (1.2 is 50 degrees over): a mostly sideways or downward slide on a vine,
   * a liana or a rope steers and never lets go. A thumb pumping a swing left and right bows up at the end of each stroke, and those bows
   * (and a quick sideways stroke, which used to be a leap of its own on a swing) let go of the liana 90 times in Matt's swing-stage test,
   * 2026-10-26: "Jump accidentally a lot when I'm trying to collect petals." Steph's flicks up and forward lean 5 to 41 degrees (p10 to
   * p90), and her quickest ones about 47: 45 degrees lost three of her 48 real let-goes, 50 loses none.
   */
  vineLeapMaxSlant: 1.2,
  /** the leap's rise must happen within this long (ms): a slow creep up and over is climbing, not a flick */
  vineLeapMs: 160,
  /**
   * on a vine, a liana or a trunk: a whole touch that is one quick stroke up and over, put down and lifted within this long (ms), lets go
   * when it lifts, however far over it leans (only not straight up: vineLeapSlant). Matt's flicks off a liana (control test, 2026-10-26
   * and 27, sideways phone) went 55 to 80 degrees over, e.g. 290 px across and 110 up in 200 ms, and lifted at once: every one was read as
   * pumping the swing (over vineLeapMaxSlant), climbed him to the top of the vine instead, and he was stuck there "flicking wildly"
   * (31 of them in three sessions). A thumb pumping a swing stays on the glass for half a second and more, and turns round.
   */
  vineFlickMs: 480,
  /** … rising at least this far (px) … */
  vineFlickRise: 30,
  /** … at no less than this speed over the whole touch (px per ms) */
  vineFlickSpeed: 0.4,
  /** a second jump that has just fired locks the next for this long (the engine needs a frame to know it was used) */
  airLockMs: 160,
  /**
   * a lone finger on the right half used to wait 210 ms before it could start the run, so every run started from that side lagged by
   * six frames. Now a clearly sideways slide starts the run after this long (and this far), and if the finger then lifts like a flick it
   * is still the kick it always was.
   */
  earlyDragMs: 60,
  earlyDragPx: 18,
  /**
   * the steering thumb's flick up, measured from its last low point (it drifts down the glass while it steers): a rise of jumpDy at this
   * speed (px per ms) or more, that goes up at least this far for each px across (0.6: up to about 59 degrees over), within this long
   */
  riseSpeed: 0.35,
  riseSlant: 0.6,
  riseMs: 220,
  /** with nothing to kick, a quick flick that rises at least this far for each px across is a jump (0.4: up to about 68 degrees over) */
  flickJumpSlant: 0.4,
  /**
   * the intent lock: while the steering thumb is flicking up (rising at least `lockSpeed` px per ms over its last `lockTrailMs`, at least
   * `lockSlant` px up for each px across), and for `lockAfterJumpMs` after its jump, the run keeps its way: no stop, no turn. A thumb's
   * flick arcs back toward the palm, and that arc used to read as a stop or a turn on the very frame he took off (polish report CT-11)
   */
  lockSpeed: 0.3,
  lockSlant: 1.5,
  lockTrailMs: 60,
  lockAfterJumpMs: 120,
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
   * was meant to start a run (in all 27 of those the finger stayed down afterwards and wanted to run). On a vine or a trunk, vertical
   * slides climb and only a slide up that leans 20 to 50 degrees lets go (onVine, vineSteer); every jump press says which way its flick
   * leaned (GestureSink.jumpPress), and a let-go leaps that way. Unset = the old rules.
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
   * he is on a swinging vine (not a trunk): with refined controls the other thumb's quick sideways flick there lets go and leaps that way
   * (its lean goes with the press). The steering thumb's sideways slides only steer the swing.
   */
  onSwing?(): boolean;
  /**
   * he is hanging from a shimmy rope. With refined controls the steering thumb's sideways slide there only creeps along it: a hop off
   * needs a slide that is clearly up, and a drop a slide that is clearly down (a long sideways creep that drifted used to do both)
   */
  onRope?(): boolean;
  /**
   * he stands inside a bush or fern that hides him from a watcher (1-7's eagle, 3-2's eyes, 4-5's Sovereign). There a slide down hides
   * him even while the thumb is still running: QA's thumb ran into the bush and slid down without lifting, and only a lift and a fresh
   * slide down ducked (2026-10-28). The running duck's stricter slant (meant to keep a rolling thumb from stopping him dead) is off there.
   */
  inCover?(): boolean;
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
  /** the last DUCK_TRAIL_MS of the path (a duck must be going down over it, not across: duckDown) */
  trail: { t: number; x: number; y: number }[];
  tapT0: number;
  /** after a jump: the highest the thumb has been, and the lowest since (for the wiggle that jumps again) */
  pk: number;
  tr: number;
  /** began as an undecided finger and took over the steering early: a flick on lifting is still a kick */
  early: boolean;
  /** this finger already threw its mega punch while resting; it may still go on to steer */
  megaDone: boolean;
  /**
   * the low point the thumb last rose from (its y and x, and when the rise began): a steering thumb that drifted down the glass and
   * then flicks up is measured from there, not from where it was planted (riseFrom)
   */
  lowY: number;
  lowX: number;
  riseT0: number;
  /** all the sideways travel since it went down (a pumping stroke turns round; a flick goes one way) */
  sx: number;
  /** it went down while he was in the air with a second jump to spare (he may land before the flick is through) */
  airDown: boolean;
  /** where the thumb sank to after a jump (with tr): a consumed finger's wiggle measures its lean from here */
  trX: number;
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
  /** refined controls are on and he is hanging from a rope */
  private rope(): boolean {
    return !!this.env?.refined?.() && !!this.env.onRope?.();
  }
  /**
   * the finger's movement over its last moments (up to ~150 ms): how far across and down, over how long, and `sx`, how far it travelled
   * sideways in all (a thumb pumping left and right turns round at the top of its stroke, so across and back can add up to nothing)
   */
  private recent(f: Finger): { mx: number; my: number; ms: number; sx: number } {
    const h = f.hist;
    let sx = 0;
    for (let i = 1; i < h.length; i++) sx += Math.abs((h[i].x ?? f.x) - (h[i - 1].x ?? f.x));
    sx += Math.abs(f.x - (h[h.length - 1].x ?? f.x));
    return { mx: f.x - (h[0].x ?? f.x), my: f.y - h[0].y, ms: Math.max(1, this.now - h[0].t), sx };
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
  /** which way a flick that moved `dx` across while rising `rise` px leans: 0 unless it is 20 degrees or more off straight up */
  private leanOf(dx: number, rise: number): -1 | 0 | 1 {
    if (Math.abs(dx) < 4 || Math.abs(dx) < Math.max(0, rise) * TUNING.leanSlant) return 0;
    return dx < 0 ? -1 : 1;
  }
  /** a jump the finger asked for: `air` marks it as the second jump, so another cannot fire on its heels; `lean`, which way it leaned */
  private fireJump(f: Finger, air: boolean, lean: -1 | 0 | 1 = 0) {
    if (f.role !== 'mover') f.consumed = true;
    else this.lockUntil = this.now + TUNING.lockAfterJumpMs;
    f.jumped = true;
    f.pk = f.y;
    f.tr = f.y;
    f.trX = f.x;
    if (air) this.lastAir = this.now;
    this.sink.feedback('jump');
    this.sink.jumpPress(lean);
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
    const f: Finger = { id, role: 'pending', x0: x, y0: y, x, y, t0: t, ax: x, ay: y, consumed: false, jumped: false, ducked: false, hist: [{ t, y, x }], trail: [{ t, x, y }], tapT0: t, pk: y, tr: y, early: false, megaDone: false, lowY: y, lowX: x, riseT0: NaN, sx: 0, airDown: this.canAir(), trX: x };
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
    // the low point a rise starts from: the thumb going down (or holding) moves it; a rise that dawdles starts again from where it is
    const lastT = f.hist[f.hist.length - 1].t;
    if (y >= f.y || !(t - f.riseT0 <= TUNING.riseMs)) {
      f.lowY = f.y;
      f.lowX = f.x;
      f.riseT0 = y < f.y ? Math.max(lastT, t - 34) : NaN;
    }
    if (y >= f.lowY) {
      f.lowY = y;
      f.lowX = x;
      f.riseT0 = NaN;
    }
    f.sx += Math.abs(x - f.x);
    f.x = x;
    f.y = y;
    f.hist.push({ t, y, x });
    while (f.hist.length > 2 && t - f.hist[0].t > 150) f.hist.shift();
    f.trail.push({ t, x, y });
    while (f.trail.length > 2 && t - f.trail[0].t > TUNING.duckTrailMs) f.trail.shift();
    if (f.role === 'mover') this.steer(f);
    else if (f.role === 'pending' || f.role === 'action') this.judge(f, t, false);
    else if (f.role === 'ignored') this.palmFlick(f, t);
  }

  /**
   * the rise of a quick flick up from the thumb's last low point: how far up, how far across, and how fast (px per ms). 0 when it is not
   * rising now.
   */
  private riseFrom(f: Finger): { rise: number; across: number; speed: number } {
    if (!Number.isFinite(f.riseT0)) return { rise: 0, across: 0, speed: 0 };
    const rise = f.lowY - f.y;
    return { rise, across: f.x - f.lowX, speed: rise / Math.max(1, this.now - f.riseT0) };
  }

  /**
   * A finger put down close to the steering thumb is ignored (the same hand's knuckle or palm). But one that flicks up, quick and clear,
   * is a thumb jumping: one-thumb players steer and then flick from right beside where they steer (QA v200, 320 x 782 upright: "a flick
   * with the thumb still steering gets eaten"). A palm never sweeps up 34 px in a quarter of a second.
   */
  private palmFlick(f: Finger, t: number) {
    if (f.consumed || t - f.t0 > TUNING.flickLiftMs) return;
    const dx = f.x - f.x0;
    const rise = f.y0 - f.y;
    if (rise >= TUNING.jumpDy && rise >= Math.abs(dx) * TUNING.riseSlant && rise / Math.max(1, t - f.t0) >= TUNING.flickLiftSpeed) {
      f.role = 'action';
      f.consumed = true;
      this.fireJump(f, this.canAir(), this.leanOf(dx, rise));
    }
  }

  up(id: number, x: number, y: number, t: number) {
    this.now = t;
    const f = this.fingers.get(id);
    if (!f) return;
    f.x = x;
    f.y = y;
    this.fingers.delete(id);
    if (f.role === 'mover') {
      // a last look: a flick whose rise ended as it lifted (BEFORE the release below, so the jump it presses is released too)
      if (!f.jumped && !f.ducked) this.moverFlickOnLift(f, t);
      const travel = Math.hypot(f.x - f.x0, f.y - f.y0);
      const nudge = this.heldDir !== 'none' && travel <= TUNING.nudgeTapPx && t - f.t0 <= TUNING.nudgeTapMs && Math.abs(f.x - f.x0) >= Math.abs(f.y - f.y0);
      const stillTap = !f.jumped && !f.ducked && ((this.heldDir === 'none' && travel <= TUNING.tapPx && t - f.tapT0 <= TUNING.tapMs) || nudge);
      const wasReplant = f.tapT0 - this.lastMoverUp < TUNING.replantMs;
      // only a finger that really steered or jumped counts as a "thumb that was just lifted". A finger that merely tapped must not:
      // otherwise every tap in a quick run of taps on the left half would look like a re-plant of the one before, and be eaten
      const wasTap = stillTap;
      this.setDir('none');
      this.setClimb(0);
      // (only when it was ducking: a "duck off" on every lift filled the play log with duck toggles that never were, QA's 279)
      if (this.duckOn) {
        this.duckOn = false;
        this.sink.duck(false);
      }
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
      if (stillTap && !wasReplant) this.tapAct();
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
      // re-planting the thumb right after steering is not a punch: only if it began after the lift AND near it
      const replant = f.tapT0 >= this.lastMoverUp && f.tapT0 - this.lastMoverUp < TUNING.replantMs &&
        Math.hypot(f.x0 - this.lastMoverUpX, f.y0 - this.lastMoverUpY) < 100;
      if (replant) return;
      this.tapAct();
    }
  }

  /**
   * A steering finger lifting: was the whole touch a flick that the moves alone did not catch?
   *  - On a vine, a liana or a trunk: one quick stroke up and over (vineFlickMs) lets go, however far over it leans; straight up still
   *    only climbs.
   *  - In the air with a second jump to spare: a fresh touch that rose airUpPx, mostly up, is the second jump, as it is for any other
   *    finger (judge). The steering thumb needed airJumpDy (28 px) there, and Matt's short second flicks (18 to 27 px up in a tenth of a
   *    second, control test 2026-10-26) did nothing, or punched.
   */
  private moverFlickOnLift(f: Finger, t: number) {
    const dx = f.x - f.x0;
    const rise = f.y0 - f.y;
    const el = Math.max(1, t - f.t0);
    if (this.vine()) {
      if (
        el <= TUNING.vineFlickMs && rise >= TUNING.vineFlickRise && Math.abs(dx) >= rise * TUNING.vineLeapSlant &&
        f.sx <= Math.abs(dx) * 1.3 && Math.hypot(dx, rise) / el >= TUNING.vineFlickSpeed
      ) {
        this.setClimb(0);
        this.fireJump(f, false, this.leanOf(dx, rise));
      }
      return;
    }
    if (this.freshAirFlick(f, el, dx, rise)) this.fireJump(f, true, this.leanOf(dx, rise));
  }

  /** a steering finger put down in the air a moment ago that has risen a second jump's worth, mostly up (not a sideways steer) */
  private freshAirFlick(f: Finger, el: number, dx: number, rise: number): boolean {
    if (f.jumped || el > TUNING.flickLiftMs || this.vine() || this.rope()) return false;
    if (!(this.canAir() || (f.airDown && this.now - this.lastAir > TUNING.airLockMs))) return false;
    return rise >= TUNING.airUpPx && rise >= Math.abs(dx) * 0.85;
  }

  /**
   * a finger (not the steering one) whose flick already jumped and that stays on the glass: sinking back a little and flicking up again
   * is the second jump. It used to be spent until lifted, so a thumb that flicked twice without leaving the glass jumped once.
   */
  private airAgain(f: Finger) {
    if (f.y < f.pk && f.tr - f.pk < TUNING.pumpDown) {
      // still on the way up: the peak follows the thumb
      f.pk = f.y;
      f.tr = f.y;
      f.trX = f.x;
      return;
    }
    if (f.y > f.tr) {
      f.tr = f.y;
      f.trX = f.x;
      return;
    }
    const up = f.tr - f.y;
    if (this.canAir() && f.tr - f.pk >= TUNING.pumpDown && up >= TUNING.pumpUp && up >= Math.abs(f.x - f.trX) * 0.85) {
      this.fireJump(f, true, this.leanOf(f.x - f.trX, up));
    }
  }

  /** a tap: always a punch (the fight turns one in the air into a jump kick) */
  private tapAct() {
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

  /** the steering thumb's run keeps its way until then (its jump a moment ago: the intent lock) */
  private lockUntil = -1e9;
  /** the steering thumb is flicking up right now (the intent lock): quick, and mostly up, over its last moments */
  private flickingUp(f: Finger): boolean {
    let r0 = f.hist[f.hist.length - 1];
    for (let i = f.hist.length - 1; i >= 0; i--) {
      if (this.now - f.hist[i].t > TUNING.lockTrailMs) break;
      r0 = f.hist[i];
    }
    const rise = r0.y - f.y;
    const el = this.now - r0.t;
    return el > 0 && rise >= 6 && rise / el >= TUNING.lockSpeed && rise >= Math.abs(f.x - (r0.x ?? f.x)) * TUNING.lockSlant;
  }

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
    // the intent lock: a running thumb flicking up (or that has just jumped) keeps the run's way; the anchor comes along, so the thumb's arc
    // back toward the palm is not read as a stop or a turn once the lock ends either
    if (this.heldDir !== 'none' && !this.vine() && (this.now < this.lockUntil || this.flickingUp(f))) {
      const s = this.heldDir === 'right' ? 1 : -1;
      if (dx * s < TUNING.moveDead) {
        f.ax = f.x - s * TUNING.moveDead;
        dx = s * TUNING.moveDead;
      }
    }
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
    // on a rope a duck is letting go: it takes a thumb that is moving clearly down now, not one creeping along that has drifted low
    const rope = this.rope();
    const rc = rope ? this.recent(f) : null;
    const ropeDown = !rc || (rc.my > 0 && rc.my >= rc.sx);
    // (and the thumb must be going down, not across: `dx` above is held to the steering anchor's 30 px, so a long diagonal swipe,
    // turning round, read as "more down than sideways" and ducked. Replaying Cheddarbob's fingers (iPhone 393x658, one finger): his
    // duck-ons came from swipes down and across as he turned, 138 px left and 115 down. Over the last 300 ms a duck now has to be
    // mostly down: steeper than 45 degrees standing, than 63 degrees while running. The sideways part is all the sideways travel in that
    // time, so a thumb that ran one way and swept back the other, ending about where it was, is not "straight down")
    let across = 0;
    for (let i = 1; i < f.trail.length; i++) across += Math.abs(f.trail[i].x - f.trail[i - 1].x);
    const downNow = f.y - f.trail[0].y >= across * (running ? TUNING.duckSlantRun : TUNING.duckSlant);
    const cover = !!this.env?.inCover?.();
    const wantDuck = this.duckOn
      ? dy > TUNING.duckDy * 0.6 && !(running && Math.abs(dx) > dy && !cover)
      : cover
        ? dy > TUNING.duckDy * 0.8 && dy > Math.abs(dx) * 0.6
        : dy > startDy && dy > Math.abs(dx) * (running ? 1 : 0.6) && ropeDown && downNow;
    if (wantDuck !== this.duckOn) {
      this.duckOn = wantDuck;
      this.sink.duck(wantDuck);
      // hysteresis: out of a duck, the next one needs a fresh slide down from here, so a thumb wobbling about the line never flickers
      // him up and down (the anchor was where the thumb first went down, and a small slide back down crossed it again)
      if (!wantDuck) f.ay = f.y;
    }
    // a jump needs an upward SPEED (or a really long push): a thumb that slowly creeps up while running, or comes back
    // from a deep duck, is not a jump
    const h0 = f.hist[0];
    const vUp = f.hist.length > 1 ? (h0.y - f.y) / Math.max(1, f.hist[f.hist.length - 1].t - h0.t) : 0;
    const dyJ = f.y - Math.min(f.ay, f.y0); // after a deep duck the anchor sits low: coming back to where the thumb landed is not a jump
    // in the air with a second jump to spare, a shorter slide is enough
    const air = this.canAir();
    const jdy = air ? TUNING.airJumpDy : TUNING.jumpDy;
    // (and a thumb put down in the air a moment ago that goes mostly up is a flick: the same short rise as any other finger's)
    if (this.freshAirFlick(f, this.now - f.t0, f.x - f.x0, f.y0 - f.y)) {
      this.fireJump(f, true, this.leanOf(f.x - f.x0, f.y0 - f.y));
      return;
    }
    // (on a rope a jump is letting go: the thumb must be moving clearly up now, not sweeping along it with a bow in the stroke)
    const ropeUp = !rc || (rc.my < 0 && rc.sx <= -rc.my * TUNING.vineLeapMaxSlant);
    // (and a quick flick up from wherever the thumb has drifted to is a jump too: a thumb steering for a while rolls down the glass,
    // and its flick up then never got back above where it was planted, so the jump was eaten, QA v200 at 5-3's steps)
    const q = this.riseFrom(f);
    const quick = !f.jumped && !this.duckOn && q.rise >= jdy && q.speed >= TUNING.riseSpeed && q.rise >= Math.abs(q.across) * TUNING.riseSlant && ropeUp;
    if (dyJ < -jdy && !f.jumped && (vUp >= 0.15 || dyJ < -jdy * 2) && ropeUp) {
      this.fireJump(f, air);
    } else if (quick) {
      // (the anchor moves down to the low point, so the thumb held up there keeps the jump held, and the wiggle for the second works)
      f.ay = f.lowY;
      this.fireJump(f, air, this.leanOf(q.across, q.rise));
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
   * as long as it stays there; the anchor follows the finger so moving back the other way turns round at once. A quick slide up that
   * leans over by 20 to 50 degrees is a jump, the way Pokey leaves a vine (near-vertical always climbs), and he leaps the way it leans,
   * whatever the steer was a moment before (the end of a pump to the right, then a flick up and left: left). Sideways is steering, on a trunk
   * and on a swinging liana alike: a slide left or right pumps the swing, however quick, and never lets go (it used to be a leap on a
   * swing when it was quick, and Matt's thumb, pumping for petals, let go of the liana again and again, 2026-10-26).
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
    // the last ~150 ms of movement: a quick flick up and over (not straight up, not mostly sideways) jumps off
    // (the slant is measured on all the sideways travel in that time, so a pumping stroke that turns round as it bows up is not a flick)
    const { mx, my, ms, sx } = this.recent(f);
    const rise = -my;
    if (!f.jumped && rise > TUNING.jumpDy && ms <= TUNING.vineLeapMs && Math.abs(mx) >= rise * TUNING.vineLeapSlant && sx <= rise * TUNING.vineLeapMaxSlant) {
      this.setClimb(0);
      this.fireJump(f, false, this.leanOf(mx, rise));
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
    if (f.consumed) {
      if (f.jumped && !lifting) this.airAgain(f);
      return false;
    }
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
          this.fireJump(f, this.canAir(), this.leanOf(dx, -dy));
        } else {
          f.ducked = true;
          this.sink.feedback('duck');
          this.sink.duck(true);
        }
        return true;
      }
      if (ax >= TUNING.flickPx && !upish && ax >= ay && ax / el >= sp) {
        if (this.noKick()) {
          // on a swinging vine, the other thumb's quick sideways flick lets go and leaps the way it was flicked
          if (this.vine() && this.env?.onSwing?.() && f.role === 'action') {
            f.consumed = true;
            this.fireJump(f, false, dx < 0 ? -1 : 1);
            return true;
          }
          // nothing to kick, and the flick rises as it goes: the other thumb's flick up and well over is a jump (a flick 55 degrees over
          // did nothing at all, QA v200: "a flick must always jump")
          if (f.role === 'action' && !this.vine() && dy < 0 && ay >= 24 && ay >= ax * TUNING.flickJumpSlant) {
            f.consumed = true;
            this.fireJump(f, this.canAir(), dx < 0 ? -1 : 1);
            return true;
          }
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
        this.fireJump(f, air, this.leanOf(dx, -dy));
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
