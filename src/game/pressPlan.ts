/**
 * A press plan: the pads a bot plays VERBATIM from the next frame, judged first by flying them on the live engine (ENG-SIM step 2,
 * R-165.470; the spike R-165.462's prototype, reference/qa-reports/ENG-BOTSIM/proto-ci10-s2.patch on t-eng-botsim).
 *
 * The judge's model IS the engine: planFlies flies a plan through engineProbe's probe (the harness's own frame, everything put back), so
 * a bot that then plays the same pads from the same moment sees exactly what the probe saw (pressPlan.test.ts, the invariant: a press
 * drawn anywhere inside the judged spread ends as the probe said). A death ends a plan on the frame it came: the probe reports it, and
 * PlanPlayer drops the rest of a plan once a life is lost.
 */
import { probe, type ProbeSim } from './engineProbe.ts';
import { DT, type Pad } from './realPlay.ts';

type Eng = Record<string, any>;

export interface PressPlan {
  /** the pads, frame 1 = the next frame played */
  readonly pads: readonly Pad[];
  /** the frame of the plan's press (1-based; 0 when it presses nothing) */
  readonly press: number;
}

export interface PressPlanSpec {
  /** the frame the jump is pressed on (1-based, 1 = the next frame) */
  press: number;
  /** how long the jump is held from the press (s): held while (frame - press) * DT < hold */
  hold: number;
  /** the steer: -1 left, 1 right, 0 none */
  dir: -1 | 0 | 1;
  /** the first frame the steer is on the stick (1-based; his thumb still travelling before it); default the press frame */
  steerFrom?: number;
  /** frames after the press (the flight the plan covers) */
  after: number;
  /** before the press: the steer his thumb still holds for this many frames (as the bot's thumb leaves it), then none */
  tail?: { dir: -1 | 0 | 1; frames: number };
}

/** the pads of one press: before it, the thumb's tail then nothing; the steer from steerFrom; the jump pressed and held */
export function pressPlan(s: PressPlanSpec): PressPlan {
  const steerFrom = s.steerFrom ?? s.press;
  const pads: Pad[] = [];
  for (let j = 1; j <= s.press + s.after; j++) {
    const pad: Pad = {};
    const side = j >= steerFrom ? s.dir : j < s.press && s.tail && j <= s.tail.frames ? s.tail.dir : 0;
    if (side === 1) pad.right = true;
    else if (side === -1) pad.left = true;
    if (j === s.press) pad.press = pad.jump = true;
    else if (j > s.press && (j - s.press) * DT < s.hold - 1e-9) pad.jump = true;
    pads.push(pad);
  }
  return { pads, press: s.press };
}

export interface PlanFlight {
  /** the frame (1-based) the goal was met; -(frame) when it failed there, he died, or the plan ran out first */
  at: number;
  /** how a death in the flight came ('water', 'pit', 'soft', 'hurt', 'life'), or null */
  died: string | null;
  frames: number;
  ms: number;
}

/**
 * Fly `plan` on `sim`'s live engine and say where it gets him: `goal(e, frame)` after each frame says 'met', 'failed' or nothing (fly
 * on). Nothing is changed: the probe puts the engine, the module stores and the phone back.
 */
export function planFlies<P extends Pad>(sim: ProbeSim<P>, plan: PressPlan, goal: (e: Eng, frame: number) => 'met' | 'failed' | void): PlanFlight {
  let at = -plan.pads.length;
  let last = 0;
  const r = probe(sim, plan.pads as P[], (e, i) => {
    last = i + 1;
    const g = goal(e, i + 1);
    if (g === 'met') { at = i + 1; return 'stop'; }
    if (g === 'failed') { at = -(i + 1); return 'stop'; }
    return 0;
  });
  // (a death ends the plan on the frame it came)
  if (r.died) at = -last;
  return { at, died: r.died, frames: r.frames, ms: r.ms };
}

/**
 * The first window of `w` consecutive frames inside [lo, hi] at which `ok` holds: its first frame, or -1 when none. The plain scan's
 * answer, found by asking `ok` far less often: any such window holds exactly one frame of the lattice lo + w - 1 + j w, so those are
 * asked first and a yes is widened to its run (a judge that flies a plan per frame asks it once per flight; a refusal over fewer than
 * `w` frames asks nothing). pressPlan.test.ts pins it against the plain scan on every pattern up to 12 frames.
 */
export function firstWindow(lo: number, w: number, hi: number, ok: (frame: number) => boolean): number {
  for (let q = lo + w - 1; q <= hi; q += w) {
    if (!ok(q)) continue;
    let a = q, b = q;
    while (a > Math.max(lo, q - w + 1) && ok(a - 1)) a--;
    while (b - a + 1 < w && b < hi && ok(b + 1)) b++;
    if (b - a + 1 >= w) return a;
  }
  return -1;
}

/** a bot's plan in play: its pads one a frame, verbatim; a life lost since it was set drops the rest */
export class PlanPlayer {
  private pads: Pad[] = [];
  private lives = 0;
  /** plans set, and plans a life lost cut short */
  count = 0;
  cut = 0;

  get active(): boolean {
    return this.pads.length > 0;
  }

  /** play `plan` from the next frame, its first `end` frames (at least one); `lives` the lives he has now */
  set(plan: PressPlan, end: number, lives: number): void {
    this.pads = plan.pads.slice(0, Math.max(1, Math.min(plan.pads.length, end))).map((p) => ({ ...p }));
    this.lives = lives;
    this.count++;
  }

  /** the next pad, or null: no plan, played out, or a life lost since it was set */
  next(lives: number): Pad | null {
    if (!this.pads.length) return null;
    if (lives !== this.lives) {
      this.pads = [];
      this.cut++;
      return null;
    }
    return this.pads.shift()!;
  }

  drop(): void {
    this.pads = [];
  }
}
