/**
 * touchCoach — the first-stage lesson for a brand-new touch player.
 *
 * On stage 1-1 of a game with no progress, it tells them in two steps what the screen does: slide a thumb to run, then, at the first
 * ledge or gap, slide up and sideways together to run and jump. It watches what the hero does and moves on by itself; it never
 * pauses the game and never asks for anything. Once the first jump is made it says well done, remembers on the device, and is gone.
 *
 * Pure logic (times and positions in, a step out), so the unit tests can drive it. The engine feeds it; the app draws it
 * (components/CoachOverlay.tsx).
 */
import type { ControlStyle } from './controlPrefs.ts';

/** what the player is being shown: slide to run, slide to jump, well done, or nothing */
export type CoachStep = 'run' | 'jump' | 'nice' | null;

export const COACH = {
  /** a moment to take in the scene before the first hint */
  startDelay: 1.1,
  /** px of running that count as having learned to run */
  runDone: 150,
  /** show the jump hint this far before the first thing that needs a jump */
  jumpLead: 300,
  /** if the stage offers nothing to jump for this far, ask for a jump anyway */
  jumpFallback: 900,
  /** how long the well done stays */
  niceFor: 2.2,
  /** a rise (a ledge to hop up onto) counts as something to jump for when it is this tall … */
  riseMin: 20,
  /** … and no taller than a jump can manage */
  riseMax: 110,
  /** a hole in the ground this wide counts */
  gapMin: 30,
} as const;

const KEY = 'sloth_coach_done';

export function coachDone(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return true; // storage blocked: never nag
  }
}
export function markCoachDone() {
  try {
    localStorage.setItem(KEY, '1');
  } catch {
    /* ignore */
  }
}

/** true when the device has saved any stage result: a returning player does not need the lesson */
function hasProgress(): boolean {
  try {
    for (let i = 0; i < localStorage.length; i++) if ((localStorage.key(i) ?? '').startsWith('sloth_lvl_')) return true;
  } catch {
    return true;
  }
  return false;
}

/**
 * Whether to teach on this stage: stage 1-1, a touch screen, a first game, and not already taught. `?coach=1` forces it on (for trying it out),
 * `?coach=0` off.
 */
export function coachWanted(levelId: string, secret: unknown): boolean {
  if (secret || levelId !== '1-1') return false;
  let q: string | null = null;
  try {
    q = new URLSearchParams(window.location.search).get('coach');
  } catch {
    /* no window */
  }
  if (q === '0') return false;
  if (q === '1') return true;
  if (coachDone() || hasProgress()) return false;
  try {
    return !!window.matchMedia?.('(pointer: coarse)').matches;
  } catch {
    return false;
  }
}

export interface CoachPlatform {
  x: number;
  y: number;
  width: number;
}

/**
 * Where, ahead of the hero, the first thing is that needs a jump: the left edge of the first ledge to hop up onto, or of the first hole in the ground.
 * `groundY` is where he starts (the height of the ground under his feet).
 */
export function firstJumpSpot(plats: readonly CoachPlatform[], startX: number, groundY: number): number | null {
  const ps = plats.filter((p) => p.x + p.width > startX).sort((a, b) => a.x - b.x);
  let best: number | null = null;
  let edge = startX; // how far the ground runs unbroken
  for (const p of ps) {
    const rise = groundY - p.y;
    if (p.x > edge + COACH.gapMin && Math.abs(rise) < COACH.riseMax && (best === null || edge < best)) best = edge;
    if (rise >= COACH.riseMin && rise <= COACH.riseMax && p.x >= startX && (best === null || p.x < best)) best = p.x;
    if (Math.abs(rise) < COACH.riseMin) edge = Math.max(edge, p.x + p.width);
    if (best !== null && p.x > best + 400) break;
  }
  return best;
}

export class TouchCoach {
  step: CoachStep = null;
  private t = 0;
  private startX: number | null = null;
  private spot: number | null = null;
  private learnedRun = false;
  private niceAt = 0;
  private finished = false;
  readonly style: ControlStyle;

  constructor(style: ControlStyle, private onChange: (s: CoachStep) => void, private onDone: () => void) {
    this.style = style;
  }

  /** the engine calls this once, with the stage's ground */
  setCourse(startX: number, spot: number | null) {
    this.startX = startX;
    this.spot = spot;
  }

  private set(s: CoachStep) {
    if (s === this.step) return;
    this.step = s;
    this.onChange(s);
  }

  get done(): boolean {
    return this.finished;
  }

  /** `x` the hero's position, `jumped` true on the frame a jump starts */
  update(dt: number, x: number, jumped: boolean) {
    if (this.finished) return;
    this.t += dt;
    if (this.startX === null) this.startX = x;
    const travelled = Math.abs(x - this.startX);

    if (this.step === 'nice') {
      if (this.t - this.niceAt >= COACH.niceFor) this.finish();
      return;
    }
    if (jumped) {
      // he jumped before being asked to (or in answer to the hint): well done, and the lesson is over
      this.niceAt = this.t;
      this.set(this.step === 'jump' ? 'nice' : null);
      if (this.step === null) this.finish();
      return;
    }
    if (!this.learnedRun) {
      if (travelled >= COACH.runDone) {
        this.learnedRun = true;
        this.set(null);
      } else if (this.t >= COACH.startDelay) this.set('run');
      return;
    }
    if (this.step !== 'jump') {
      const at = this.spot !== null ? this.spot - COACH.jumpLead : this.startX + COACH.jumpFallback;
      if (x >= at) this.set('jump');
    }
  }

  private finish() {
    this.finished = true;
    this.set(null);
    this.onDone();
  }
}
