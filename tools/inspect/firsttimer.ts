/**
 * The first-timer bot: a new player on a phone, played in the REAL engine (src/game/realPlay.ts runs engine.ts one 30 fps frame at a
 * time), on Easy and on Normal, for the pre-QA pass (Matt, 2026-10-28: "before we turn it over to the QA-ers, we're doing a first pass").
 * The route bots (jumps.ts) prove a stage can be finished by a good thumb; this one plays the way someone who has never seen the stage
 * does, and reports what such a player runs into first.
 *
 * How he plays:
 *   - He goes the way the stage leads (along the inspector's main route, route.ts: right on a run, up on a climb) and holds that way.
 *   - When he is stopped (a step, a wall) or comes to an edge, he tries a plain jump: a short flick up (the thumb is down 0.06-0.25 s,
 *     so the jump is often cut short), sometimes a little early or late at an edge, and now and then the flick goes straight up and the
 *     steer lets go for a moment. Never a run-up and never the full held jump; he never backs up to try again from further away.
 *   - He double jumps only at a spot where a single jump has already failed him.
 *   - He climbs straight up a trunk he touches when the way goes up (or when he is stopped beside it), lets go of a liana on the swing
 *     forward, and jumps off a rope at its end.
 *   - He does not know puzzles: at a puzzle room's entrance he stands a moment ("stopped at a puzzle", not a failure) and is then put
 *     past it, at the room's way on.
 *   - He knows nothing the stage has not told him: he hides from a watching eagle only once Dot's hide tip has been on screen, punches
 *     only once a tip or lesson has said to, glides only once told. Every reaction to a warning or a tip comes about a second late.
 *   - He picks up whatever lies in his way, and loses hearts and lives for real (respawning at the flag, continuing after a game over).
 *   - Stopped with no forward progress for 20 s (or falling back into the same spot 5 times), he is put a little further along the route
 *     (a "rescue", counted), so the rest of the stage is still played.
 *
 * Dot is followed as the phone shows her: every engine line, lesson and struggle line goes through the game's own guide queue
 * (dotGuide.ts GuideQueue with dotLines.ts engineGuideLine, the moves seen by dotGuideWatch.ts MoveWatch), so "when a tip is on screen"
 * is when the player could read it, not when the engine sent it. Story asides are left out.
 *
 * Nothing here changes the engine: it uses realPlay.ts's harness, puts back the engine's own lessonTick, watchForStuck, updateCamera,
 * loseLife and damagePlayer (the harness stubs them), and sizes the view to a phone held sideways (844 x 390).
 */
import { DT, RealPlay, levelConfig, type Pad } from '../../src/game/realPlay.ts';
import { GameEngine } from '../../src/game/engine.ts';
import { setDifficulty } from '../../src/game/difficulty.ts';
import { GuideQueue, type GuideLine, type MoveId, type TopicId } from '../../src/game/dotGuide.ts';
import { engineGuideLine } from '../../src/game/dotLines.ts';
import { lessonDotLine, type LessonId } from '../../src/game/lessons.ts';
import { MoveWatch, StruggleWatch, inDanger, type StruggleHelp } from '../../src/game/dotGuideWatch.ts';
import { emptyGuideView, type GuideView } from '../../src/game/dotGuideView.ts';
import { findTarget } from '../../src/game/dotGuidePerch.ts';

/** a move tip about one of these is over once none is in view (as DotGuide.tsx has it) */
const GONE_TOPICS = new Set<TopicId>(['trunk', 'vine', 'rope', 'log', 'foe']);
import type { Platform } from '../../src/game/types.ts';
import { findRoute } from './route.ts';
import { buildRoll } from './eraRoll.ts';
import { STAGE_SECONDS } from '../../src/game/protoStage.ts';
import { sampleRoute } from './beats.ts';
import type { Stage } from './stages.ts';

// a phone: the lessons and tips say "slide" and "flick", not keys (lessons.ts lessonInputMode reads pointer: coarse)
{
  const w = (globalThis as Record<string, any>).window;
  if (w) w.matchMedia = (q: string) => ({ matches: /coarse/.test(q), addEventListener() {}, removeEventListener() {} });
}

// ───────────────────────────── who plays ─────────────────────────────

/**
 * The thumb is modelled on Matt's Gemini research (reference/GEMINI-PCG-RESEARCH.md, part 3, "Stage B: Monte Carlo Noisy-Bot
 * Simulation" and the 4-channel "touch-fumble state machine"), tuned for a first-timer's plain flicks:
 *   - every press comes late (or now and then early) by the reaction noise: N(+90 ms, 65 ms) for the Easy kid, N(+30 ms, 30 ms) for the
 *     Normal adult;
 *   - the thumb stays down N(t, 80 ms) (kid) or N(t, 35 ms) (adult) around his idea of a jump, which is a flick, not the full held jump,
 *     and 8% (kid) / 3% (adult) of flicks are cut to a 2-frame tap (Channel 3);
 *   - 0.4 s (kid) / 0.2 s (adult) of hesitation before a punch, and 133-200 ms from a jump press to a tap (Channel 4, one thumb);
 *   - the steering thumb drifts outward ~N(+4, 2) px/s while he holds one way, capped where the game's anchor follows the thumb
 *     (Channel 1: the research says a floating anchor halves the error), and turning round costs the thumb's travel back across the
 *     dead zone and the drift (about 0.2-0.35 s for the kid, 0.1-0.2 s for the adult); now and then it slips into the dead zone;
 *   - lifting off to stop comes late by a log-normal 1-4 frames (kid) / 0-2 (adult) (Channel 2), so he runs on past where he meant to.
 */
export interface FirstTimer {
  name: 'KID' | 'ADULT';
  setting: 'easy' | 'normal';
  /** s at the stage start before he takes in anything (the goal card, finding his thumb): he holds the way on, nothing else */
  look: number;
  /** s from a warning or a tip on screen to acting on it (a human's ~1 s) */
  heed: number;
  /** s from being stopped dead to deciding to jump */
  stopReact: number;
  /** thumb latency on every press: N(mean, sd) s */
  thumb: [number, number];
  /** how long the thumb stays down on a flick: N(his idea of a jump, sd) s, never under 2 frames */
  hold: [number, number];
  /** chance a flick is cut to a 2-frame tap */
  short: number;
  /** chance a flick goes straight up and the steer lets go for a moment, and for how long (s) */
  upOnly: number;
  upOnlyT: [number, number];
  /** how far before an edge (px) he means to jump; the latency then moves it */
  edgeAim: number;
  /** the second flick comes when he is rising slower than this (px/s, negative is up): a range around the top of the jump */
  dblAt: [number, number];
  /** chance he jumps an animal walking at him (else he walks into it) */
  hopFoe: number;
  /** s he stops before a punch (or a pick-up) */
  hesitate: number;
  /** s from a jump press to the next tap at least (one thumb), a range */
  swap: [number, number];
  /**
   * Channel 1: the steering thumb drifts outward N(mean, sd) px/s while he holds one way (the game's anchor follows the thumb past
   * touchGestures.ts TUNING.reanchor, 30 px, so the drift never builds past that); turning round, the thumb travels back across the
   * dead zone (2 x TUNING.moveDead) and the drift at `thumbSpeed` px/s, with no steer meanwhile
   */
  drift: [number, number];
  thumbSpeed: number;
  /** and now and then (chance a second) it slips into the dead zone for a few frames anyway */
  slip: number;
  slipFrames: [number, number];
  /** Channel 2: frames of late lift-off when he means to stop: round(exp(N(mu, sd))), clipped to the range */
  release: [number, number];
  releaseMax: [number, number];
}
export const FT_KID: FirstTimer = {
  name: 'KID', setting: 'easy', look: 1.2, heed: 1.1, stopReact: 0.4, thumb: [0.09, 0.065], hold: [0.16, 0.08], short: 0.08, upOnly: 0.45,
  upOnlyT: [0.08, 0.2], edgeAim: 32, dblAt: [-260, 160], hopFoe: 0.55, hesitate: 0.4, swap: [0.133, 0.2], drift: [4, 2], thumbSpeed: 180,
  slip: 0.03, slipFrames: [3, 6], release: [0.7, 0.5], releaseMax: [1, 4],
};
export const FT_ADULT: FirstTimer = {
  name: 'ADULT', setting: 'normal', look: 0.8, heed: 0.9, stopReact: 0.3, thumb: [0.03, 0.03], hold: [0.2, 0.035], short: 0.03, upOnly: 0.25,
  upOnlyT: [0.06, 0.14], edgeAim: 22, dblAt: [-200, 90], hopFoe: 0.8, hesitate: 0.2, swap: [0.133, 0.2], drift: [4, 2], thumbSpeed: 320,
  slip: 0.01, slipFrames: [2, 3], release: [0, 0.5], releaseMax: [0, 2],
};

/** seeded random numbers (mulberry32): the same seed plays the same run */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const between = (r: () => number, [a, b]: [number, number]) => a + (b - a) * r();
/** a normal draw (Box-Muller) */
export const gauss = (r: () => number, [mu, sd]: [number, number]) => mu + sd * Math.sqrt(-2 * Math.log(Math.max(1e-9, r()))) * Math.cos(2 * Math.PI * r());
/** the thumb's hold on one flick */
export function flickHold(r: () => number, who: FirstTimer): number {
  if (r() < who.short) return 2 * DT;
  return Math.max(2 * DT, Math.min(0.45, gauss(r, who.hold)));
}

// ───────────────────────────── what he remembers about a spot ─────────────────────────────

/**
 * The jumps he tried at each spot (a spot: within 60 px across and 30 px up of where a jump first took off there), and how they went.
 * A spot where a single jump failed gets a double next time; a landing back at or below where he took off, with no progress, is a
 * fall back (the same spot twice is a loop).
 */
export class SpotMemory {
  private list: Array<{ x: number; y: number; singles: number; doubles: number; fails: number; deaths: number }> = [];
  private find(x: number, y: number) {
    return this.list.find((s) => Math.abs(s.x - x) < 60 && Math.abs(s.y - y) < 30);
  }
  private get(x: number, y: number) {
    let s = this.find(x, y);
    if (!s) this.list.push((s = { x, y, singles: 0, doubles: 0, fails: 0, deaths: 0 }));
    return s;
  }
  plan(x: number, y: number): 'single' | 'double' {
    const s = this.find(x, y);
    return s && s.fails > 0 ? 'double' : 'single';
  }
  /** a jump from (x, y) ended: `ok` when it got him on */
  result(x: number, y: number, kind: 'single' | 'double', ok: boolean): void {
    const s = this.get(x, y);
    if (kind === 'single') s.singles++;
    else s.doubles++;
    if (!ok) s.fails++;
  }
  /** he lost a life here (a drowning loop counts as falling back too) */
  died(x: number, y: number): number {
    const s = this.get(x, y);
    s.deaths++;
    return s.deaths;
  }
  fails(x: number, y: number): number {
    return this.find(x, y)?.fails ?? 0;
  }
  /** spots he fell back at (or died at) 2 or more times */
  loops(): Array<{ x: number; y: number; n: number; doubles: number; deaths: number }> {
    return this.list.filter((s) => s.fails + s.deaths >= 2).map((s) => ({ x: Math.round(s.x), y: Math.round(s.y), n: s.fails + s.deaths, doubles: s.doubles, deaths: s.deaths }));
  }
}

// ───────────────────────────── how far along the way he is ─────────────────────────────

export interface Pt { x: number; y: number }

/**
 * Progress along the route: the route's points every ~24 px, and which one he is nearest (looked for near the last one, so a route
 * that doubles back under itself does not jump ahead). `hi` is the furthest since he last came back to life.
 */
export class Progress {
  cur = 0;
  hi = 0;
  best = 0;
  constructor(readonly pts: Pt[]) {}
  private d(i: number, p: Pt) {
    const q = this.pts[i];
    return Math.abs(q.x - p.x) + Math.abs(q.y - p.y) * 0.7;
  }
  /** follow him: true when he got further than he has been since he came back */
  step(p: Pt): boolean {
    if (!this.pts.length) return false;
    let bi = this.cur, bd = this.d(this.cur, p);
    const lo = Math.max(0, this.cur - 25), hi = Math.min(this.pts.length - 1, this.cur + 40);
    for (let i = lo; i <= hi; i++) {
      const d = this.d(i, p);
      if (d < bd - 1e-6 || (Math.abs(d - bd) < 1e-6 && i > bi)) {
        bd = d;
        bi = i;
      }
    }
    if (bd < 160) this.cur = bi;
    const more = this.cur > this.hi;
    if (more) this.hi = this.cur;
    if (this.cur > this.best) this.best = this.cur;
    return more;
  }
  /** how far he stands from the point he is at along the way (0 with no route) */
  off(p: Pt): number {
    return this.pts.length ? this.d(this.cur, p) : 0;
  }
  /** after a respawn or a rescue: find him anywhere along the way */
  relocate(p: Pt, level = false): void {
    let bi = 0, bd = Infinity;
    // (`level`: after a fall, only the points about his height or below: the way back up starts where he can walk to)
    const ok = (i: number) => !level || this.pts[i].y >= p.y - 80;
    if (level && !this.pts.some((_, i) => ok(i))) level = false;
    for (let i = 0; i < this.pts.length; i++) {
      if (!ok(i)) continue;
      const d = this.d(i, p);
      if (d < bd) {
        bd = d;
        bi = i;
      }
    }
    this.cur = bi;
    this.hi = bi;
  }
  /** the point he heads for: the first one ahead that is more than `far` px from him */
  target(p: Pt, far = 90): Pt | null {
    if (!this.pts.length) return null;
    for (let i = this.cur; i < this.pts.length; i++) {
      const q = this.pts[i];
      if (Math.hypot(q.x - p.x, q.y - p.y) > far) return q;
    }
    return this.pts[this.pts.length - 1];
  }
  get share(): number {
    return this.pts.length ? this.best / (this.pts.length - 1) : 0;
  }
}

// ───────────────────────────── Dot, as the phone shows her ─────────────────────────────

export interface Shown {
  key: string;
  text: string;
  kind: string;
  source: string;
  topic?: TopicId;
  move?: MoveId;
  /** s of play it went up and came down (null: still up at the end) */
  t0: number;
  t1: number | null;
  why?: string;
  /** of the frames it was up, how many had what it is about out of reach (more than 400 px away), and how many had it near */
  far: number;
  near: number;
  /** its move had already been done in this run when it went up */
  doneBefore?: boolean;
}

/** Dot's guide for one run: the game's queue, fed what the engine, the lessons and the struggle watch send */
class DotShadow {
  /** (Worlds 1-4 have Dot toned down, as the app has her: dotGuide.ts CALM, components/dot/DotGuide.tsx) */
  readonly queue: GuideQueue;
  readonly moves = new MoveWatch();
  readonly struggle = new StruggleWatch();
  clock = 0;
  readonly shown: Shown[] = [];
  private open = new Map<number, Shown>();
  private prevLives = -1;
  private alive = { x: 0, y: 0, foe: false, falling: false };
  private restart = true;
  private prevJR = 0;
  constructor(readonly stageId: string) {
    const w = Number(stageId.split('-')[0]);
    this.queue = new GuideQueue(w >= 1 && w <= 4 && !/-D$/.test(stageId));
  }
  private say(l: GuideLine | null | undefined) {
    if (l) this.queue.push(l, this.clock);
  }
  engine(text: string, seconds: number, passed: boolean | undefined) {
    if (passed) {
      const l = engineGuideLine(text, this.stageId, { dot: true });
      if (l) this.queue.clear((q) => q.key === l.key, this.clock);
      return;
    }
    if (!text) {
      this.queue.clear((l) => l.source === 'engine' && l.kind === 'danger', this.clock);
      return;
    }
    this.say(engineGuideLine(text, this.stageId, { dot: true, ms: seconds * 1000 }));
  }
  lesson(id: LessonId, holding: boolean) {
    this.say(lessonDotLine(id, 'screen', holding));
  }
  private help(h: StruggleHelp | null, topic?: TopicId) {
    if (h) this.say({ key: h.key, text: h.text, kind: 'struggle', who: 'Dot', topic, source: 'struggle' });
  }
  /** one frame: `t` s of play, `far` says whether a topic's thing is out of reach now */
  tick(v: GuideView, t: number, far: (topic: TopicId | undefined) => boolean | null) {
    if (!v.hurt) this.clock += DT * 1000;
    this.moves.step(v);
    // (the struggle watch, as DotGuide.tsx perceive does it: two deaths at one spot, no progress for 15 s with a thumb down)
    if (this.prevLives < 0) this.prevLives = v.lives;
    if (this.restart) {
      this.struggle.restart(v.px, v.py);
      this.restart = false;
    }
    if (!v.boss) {
      if (v.hp > 0 && v.py < v.levelH - 10) {
        let foe = false;
        for (const en of v.enemies) if (!en.defeated && Math.abs(en.x - v.px) < 150 && Math.abs(en.y - v.py) < 160) foe = true;
        this.alive = { x: v.px, y: v.py, foe: foe || v.hurt, falling: !v.grounded && v.vy > 400 };
      }
      if (v.lives < this.prevLives) {
        const fell = this.alive.y > v.levelH - 140 || (this.alive.falling && !this.alive.foe);
        const h = this.struggle.death(this.alive.x, this.alive.y, fell ? 'fall' : this.alive.foe ? 'foe' : 'other');
        this.help(h, h?.cause === 'fall' ? 'gap' : h?.cause === 'foe' ? 'foe' : undefined);
        this.restart = true;
      }
      const jr = this.moves.count('jump') + this.moves.count('run') + this.moves.count('grab');
      if (jr !== this.prevJR) {
        this.prevJR = jr;
        this.struggle.otherMove();
      }
      this.help(this.struggle.step(DT * 1000, v.px, v.py, true));
    }
    this.prevLives = v.lives;
    const danger = !v.flight && (inDanger(v) || v.boss || v.chase);
    this.queue.tick(this.clock, { danger, hold: t < 1, moveCount: (m) => this.moves.count(m), swinging: v.swinging, gone: (l) => !!l.topic && GONE_TOPICS.has(l.topic) && !findTarget(l.topic, v) });
    for (const ev of this.queue.drain()) {
      const l = ev.show.line;
      if (ev.type === 'start') {
        const s: Shown = { key: l.key, text: l.text, kind: l.kind, source: l.source, topic: l.topic, move: l.move, t0: t, t1: null, far: 0, near: 0, doneBefore: !!l.move && this.moves.count(l.move) > 0 };
        this.shown.push(s);
        this.open.set(ev.show.n, s);
      } else {
        const s = this.open.get(ev.show.n);
        if (s) {
          s.t1 = t;
          s.why = ev.why;
          this.open.delete(ev.show.n);
        }
        if (l.next && (ev.why === 'done' || ev.why === 'read')) this.say(l.next);
      }
    }
    for (const s of this.open.values()) {
      const f = far(s.topic);
      if (f === true) s.far++;
      else if (f === false) s.near++;
    }
  }
  /** lines on screen now, and since when */
  up(): Shown[] {
    return [...this.open.values()];
  }
}

// ───────────────────────────── what the run reports ─────────────────────────────

export interface Harm {
  kind: 'hit' | 'life';
  t: number;
  x: number;
  y: number;
  cause: string;
  /** what hurt him was on the screen when it did (null: no one thing to see, a fall) */
  onScreen: boolean | null;
  /** he was heading for a bush, or down in one, when it hit */
  hiding?: boolean;
  /** the watching eagle: how far the nearest bush at his level was (px), and which of its passes this was */
  bush?: number | null;
  pass?: number;
}
export interface StuckSpot {
  x: number;
  y: number;
  t: number;
  /** s with no progress */
  dur: number;
  what: string;
  /** the face in front of him (px), or the dip he is in (px deep), when there is one */
  step: number | null;
  dip: number | null;
  /** at a puzzle or a piece the stage teaches (a knot, a still spot): stopped there, not a failure */
  puzzle: boolean;
  rescued: boolean;
}
export interface FirstHarm {
  cause: string;
  t: number;
  x: number;
  kind: 'hit' | 'life';
  /** Dot's first line on screen that teaches it, if any came before the end of the run */
  tip: { t: number; text: string } | null;
  /** the tip was up (for a reaction's worth) before the harm */
  ok: boolean;
}
export interface DotReport {
  heard: number;
  lines: Array<{ t: number; dur: number | null; text: string; kind: string; source: string }>;
  repeats: Array<{ text: string; n: number; at: number[] }>;
  /** a line started under 10 s after the one before it started */
  quick: Array<{ t: number; gap: number; text: string; after: string }>;
  /** up 20 s or more */
  long: Array<{ t: number; dur: number; text: string; outOfReach: boolean | null }>;
  /** a tip that teaches a move he had already done in this run */
  reteach: Array<{ t: number; text: string }>;
  /** lines of more than 10 words */
  wordy: Array<{ t: number; text: string; words: number }>;
}
/**
 * The rules the bot checks, by their names in reference/STAGE-RULES.md (section 2's rows and section 6's lessons), with the thresholds
 * used. A finding names the rule it breaks.
 */
export const RULES = {
  opening: { name: 'Opening seconds', ref: 'STAGE-RULES §2', rule: 'Nothing can hurt in the first ~3-5 s of plain walking; the first tip comes before the first hazard it teaches.', secs: 5 },
  plainWalk: { name: 'Plain walk', ref: 'STAGE-RULES §2', rule: 'No step, lip or dip that stops a plain walk dead; every dip has a one-jump way out; a jump into a face carries over its lip.', stuckSecs: 8, loops: 2 },
  eagle: { name: "1-7's eagle", ref: 'STAGE-RULES §6', rule: 'The first swoop must be a harmless warning; swoops come from on screen or with a clear tell; hiding works the way a thumb naturally does it.' },
  dot: { name: 'Dot pacing', ref: 'STAGE-RULES §6', rule: 'A gap of ~10-12 s between her lines (a warning just before a danger and a locked-exit explanation aside); no repeating a tip once done; no re-teaching moves already used; under 10 words.', gap: 10, words: 10, long: 20 },
  wayOn: { name: 'Way on', ref: 'first-timer bot', rule: 'A first-timer going the way the stage leads is never stopped 8 s with no progress (outside a puzzle).', stuckSecs: 8 },
  outcome: { name: 'First-timer outcome', ref: 'first-timer bot', rule: 'A first-timer reaches the shrine without losing lives over and over.', hitsPerMin: 2, livesPerMin: 0.6 },
  survival: { name: 'Hotspots (survival per jump)', ref: 'STAGE-RULES §2; Gemini Part 2 §8; GEMINI-LEDGER F3', rule: 'Every jump edge is crossed without a fall or a hit by 85% of tries on Easy, 70% on Normal (Worlds 1-5).' },
  window: { name: 'Minimum input window', ref: 'Gemini Part 2 §8; GEMINI-LEDGER F5', rule: 'No jump needs its press within less than 300 ms on Easy (9 frames), 167 ms on Normal (5 frames).' },
  stress: { name: 'Peak stress per burst', ref: 'Gemini Part 2 §8; GEMINI-LEDGER F5', rule: 'The risk of the jumps in one burst before a rest adds up to 2.5 at most on Easy, 5.5 on Normal.' },
  backtrack: { name: 'Backtracking ratio', ref: 'Gemini Part 2 §8; GEMINI-LEDGER F5', rule: 'The path is 1.0-1.25 times the straight line from start to shrine on Easy, 1.15-1.6 on Normal.' },
} as const;
export type RuleId = keyof typeof RULES;

export interface Flag {
  /** higher is worse */
  sev: number;
  kind: 'opening' | 'before-tip' | 'eagle' | 'stuck' | 'loop' | 'harm-rate' | 'unfinished' | 'dot-long' | 'dot-repeat' | 'dot-quick' | 'dot-reteach' | 'dot-words'
    | 'gate-survival' | 'gate-window' | 'gate-stress' | 'gate-backtrack';
  /** the rule it breaks (RULES) */
  rule: RuleId;
  x: number | null;
  t: number | null;
  what: string;
}
export interface FTRun {
  who: FirstTimer['name'];
  setting: FirstTimer['setting'];
  seed: number;
  end: 'shrine' | 'sealed door' | 'time' | 'stranded';
  /** s of play */
  time: number;
  x: number;
  /** how far along the route he got (0-1) */
  progress: number;
  goal: { got: number; need: number } | null;
  /** holding the way on from the first frame, no jumps: the first hit and life lost in 5 s */
  holdOn: { hit: Harm | null; life: Harm | null };
  /** hits and lives lost in the bot's own first 5 s */
  opening: Harm[];
  harms: Harm[];
  perMin: { hits: number; lives: number };
  gameOvers: number;
  firstHarm: FirstHarm[];
  stuck: StuckSpot[];
  loops: Array<{ x: number; y: number; n: number; doubles: number; deaths: number; what: string; step: number | null; dip: number | null; puzzle: boolean }>;
  /** times a face stopped his walk dead, and how many of those a first plain jump did not get over */
  stops: { n: number; firstJumpFailed: number; heights: number[] };
  puzzles: Array<{ id: string; x: number; t: number }>;
  rescues: number;
  dot: DotReport;
  flags: Flag[];
  /** every jump he tried (left out of the report: the gates are worked out from them) */
  tries: Try[];
  /** the steering thumb's turns, and the s of no steer they cost (reversal lag, GEMINI-LEDGER G7) */
  turns: { n: number; lag: number };
  /** path length over the straight line from spawn to shrine: the main route's, and the bot's own walk (when he got there) */
  backtrack: { route: number | null; bot: number | null };
  /** no route could be traced, so he headed straight for the shrine (his findings there say more about the bot than the stage) */
  noRoute: boolean;
  frames: number;
  ms: number;
}

// ───────────────────────────── reading Dot's lines ─────────────────────────────

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, '').replace(/\s+/g, ' ').trim();

/** Dot's lines, judged: repeats, lines too close together, lines up 20 s or more */
export function dotReport(shown: Shown[], end: number): DotReport {
  const lines = shown.map((s) => ({ t: +s.t0.toFixed(1), dur: s.t1 === null ? null : +(s.t1 - s.t0).toFixed(1), text: s.text, kind: s.kind, source: s.source }));
  const by = new Map<string, { text: string; at: number[] }>();
  for (const s of shown) {
    const k = norm(s.text);
    const e = by.get(k) ?? { text: s.text, at: [] };
    e.at.push(+s.t0.toFixed(1));
    by.set(k, e);
  }
  const repeats = [...by.values()].filter((e) => e.at.length > 1).map((e) => ({ text: e.text, n: e.at.length, at: e.at }));
  // (a warning just before a danger and a locked-exit explanation may come at once: STAGE-RULES §6)
  const exempt = (s: Shown) => s.kind === 'danger' || s.kind === 'must';
  const quick: DotReport['quick'] = [];
  for (let i = 1; i < shown.length; i++) {
    const gap = shown[i].t0 - shown[i - 1].t0;
    if (gap < RULES.dot.gap && !exempt(shown[i])) quick.push({ t: +shown[i].t0.toFixed(1), gap: +gap.toFixed(1), text: shown[i].text, after: shown[i - 1].text });
  }
  const long: DotReport['long'] = [];
  for (const s of shown) {
    const dur = (s.t1 ?? end) - s.t0;
    if (dur < RULES.dot.long) continue;
    const seen = s.far + s.near;
    long.push({ t: +s.t0.toFixed(1), dur: +dur.toFixed(1), text: s.text, outOfReach: seen ? s.far > s.near : null });
  }
  const reteach = shown.filter((s) => s.doneBefore && s.kind === 'teach').map((s) => ({ t: +s.t0.toFixed(1), text: s.text }));
  const words = (t: string) => (t.trim().match(/\S+/g) ?? []).length;
  const seenW = new Set<string>();
  const wordy: DotReport['wordy'] = [];
  for (const s of shown) {
    const n = words(s.text);
    if (n > RULES.dot.words && !seenW.has(s.text)) {
      seenW.add(s.text);
      wordy.push({ t: +s.t0.toFixed(1), text: s.text, words: n });
    }
  }
  return { heard: shown.length, lines, repeats, quick, long, reteach, wordy };
}

/** the words that teach how to deal with a cause of harm */
export function teaches(cause: string, s: Pick<Shown, 'text' | 'topic' | 'source' | 'key' | 'kind'>): boolean {
  // (the goal and the story are not teaching: "the river king's crown" says nothing about jumping the river)
  if (s.kind === 'goal' || s.kind === 'story') return false;
  const t = s.text.toLowerCase();
  if (cause === 'water' || cause === 'pit') return s.topic === 'gap' || s.topic === 'water' || s.topic === 'ledge' || s.topic === 'moving' || /\b(jump|flick up|leap|gap|water|river|edge|hop|log|raft|over)\b/.test(t);
  if (cause === 'watcher') return /\b(hide|bush|fern|waterfall)\b/.test(t);
  if (cause.startsWith('foe:')) {
    const type = cause.slice(4).toLowerCase();
    return s.topic === 'foe' || /lesson:foe/.test(s.key) || (type.length > 2 && t.includes(type.replace(/_/g, ' ')));
  }
  if (cause === 'rock' || cause.startsWith('hazard')) return /\b(rock|rocks|stone|falling|thorn|spike|spores?|careful|watch out|look up)\b/.test(t);
  return false;
}

/** for each kind of harm, the first time it happened against the first time Dot taught it (on screen a reaction's worth before) */
export function firstHarms(harms: Harm[], shown: Shown[], react: number): FirstHarm[] {
  const out: FirstHarm[] = [];
  const done = new Set<string>();
  for (const h of harms) {
    // (a life lost to a hit is judged by its first hit)
    if (done.has(h.cause)) continue;
    done.add(h.cause);
    const tip = shown.find((s) => teaches(h.cause, s));
    out.push({ cause: h.cause, t: +h.t.toFixed(1), x: Math.round(h.x), kind: h.kind, tip: tip ? { t: +tip.t0.toFixed(1), text: tip.text } : null, ok: !!tip && tip.t0 + react <= h.t });
  }
  return out;
}

// ───────────────────────────── the run ─────────────────────────────

type Eng = Record<string, any>;
const proto = GameEngine.prototype as unknown as Eng;
const PHONE = { w: 844, h: 390 };
/** FT_TRACE=1: every jump and how it went, on stderr */
const TRACE = typeof process !== 'undefined' && !!process.env.FT_TRACE;
/** FT_FRAMES=a,b: every frame between a and b s of play, on stderr */
const TRACE_FRAMES = typeof process !== 'undefined' && process.env.FT_FRAMES ? process.env.FT_FRAMES.split(",").map(Number) : null;

interface Jump {
  t0: number;
  x: number;
  y: number;
  cur: number;
  kind: 'single' | 'double';
  hold: number;
  upOnly: number;
  dir: -1 | 0 | 1;
  pressed2: boolean;
  dblAt: number;
  left: boolean;
  /** the face stop (stops[]) this jump answers */
  stop?: number;
  /** harms so far when it began */
  harms: number;
  running: boolean;
}

/** one jump he tried */
export interface Try {
  x: number;
  y: number;
  dir: -1 | 0 | 1;
  t0: number;
  t1: number;
  kind: 'single' | 'double';
  ok: boolean;
  /** hurt or killed during it */
  hurt: boolean;
  /** running when he took off (a jump over a gap or onto a ledge, not a hop from a standstill) */
  running: boolean;
  /** where an ok jump landed: the platform and his feet */
  land?: { id: number; x: number; y: number };
  hold: number;
}

export interface RunOptions {
  /** s of play at most */
  cap?: number;
  /** the route's points; default: the inspector's main route on the engine's own stage */
  route?: Pt[];
  /** stuck this long (s) without progress: put him further on */
  rescueAfter?: number;
  /** a phone held upright instead of sideways */
  portrait?: boolean;
  /** which run of several (a different thumb on the same layout) */
  trial?: number;
}

/** a fresh phone: no lessons, tips or settings from the last run (a first-timer's own lessons carry over within one pass) */
export function freshPhone(setting: FirstTimer['setting']) {
  try {
    localStorage.clear();
  } catch {
    /* none */
  }
  setDifficulty(setting);
}

export class FirstTimerRun {
  readonly sim: RealPlay;
  readonly e: Eng;
  readonly r: () => number;
  readonly prog: Progress;
  readonly mem = new SpotMemory();
  readonly dot: DotShadow;
  readonly harms: Harm[] = [];
  readonly stuck: StuckSpot[] = [];
  readonly puzzles: Array<{ id: string; x: number; t: number }> = [];
  private view = emptyGuideView();
  private jump: Jump | null = null;
  private lastLand = -1;
  private airFrom: { t: number; x: number; y: number; cur: number } | null = null;
  private blockedT = 0;
  private lastX = 0;
  /** a press he has decided on, and when the thumb gets there */
  private pending: { at: number; dir: -1 | 0 | 1; kind: 'single' | 'double'; off: boolean } | null = null;
  private punchAt: number | null = null;
  private swapGap = 0.15;
  private lastPress = -1;
  private lastSteer: -1 | 0 | 1 = 0;
  /** the way he last went */
  private way: -1 | 0 | 1 = 1;
  private travelUntil = -1;
  private driftUntil = -1;
  private releaseLeft = 0;
  private driftPx = 0;
  /** waiting at an edge for something drifting across since (s), or -1 */
  private edgeWait = -1;
  /** stopped on a small pad a beat after landing on it */
  private padPause: { until: number; id: number } | null = null;
  /** turns of the steering thumb, and the s of no steer they cost */
  turns = 0;
  turnLag = 0;
  /** every jump he tried: where, how it went, and the ground it was meant for */
  readonly tries: Try[] = [];
  /** how far he moved under his own steam (px; respawns and rescues are not moves) */
  walked = 0;
  /** the straight line from spawn to shrine, and the main route's length over it */
  direct = 0;
  routeRatio: number | null = null;
  /** the inspector traced no route: he headed straight for the shrine */
  noRoute = false;
  /** heading for a bush, or down in one, this frame */
  hiding = false;
  /** what was at each spot he fell back at */
  private whatAt: Array<{ x: number; y: number; what: string; step: number | null; dip: number | null; puzzle: boolean }> = [];
  /** where he last stood */
  private ground = { x: 0, y: 0 };
  /** every time a face stopped his walk dead: where, and how tall (px) */
  readonly stops: Array<{ x: number; y: number; h: number; t: number; ok?: boolean }> = [];
  /** the stop the next jump is the answer to */
  private nextStop: number | null = null;
  private foeSeen = new Map<number, boolean>();
  private stillT = 0;
  private hideFrom = -1;
  private warnSeenAt = -1;
  private swingT = 0;
  private ropeStill = 0;
  private climbStill = 0;
  /** s he has stood far off the way (after a fall) */
  private offRoute = 0;
  /** he was on a trunk last frame */
  private wasClimbing = false;
  /** s he has held up beside a trunk standing still, and till when he lets it be */
  private trunkUpT = 0;
  private trunkIgnoreUntil = -1;
  /** when he was last put past each puzzle room */
  private roomAt = new Map<number, number>();
  /** the trunk he is on, and whether climbing down it got him nowhere */
  private climbVine: unknown = null;
  private climbDown = false;
  private climbTurned = false;
  /** he was on a trunk when the last choice was made */
  private wasOnTrunk = false;
  /** how far he moved in the last frame */
  private moveX = 0;
  private moveY = 0;
  private lastY = 0;
  private visited = new Set<number>();
  private puzzleWait: { until: number; room: number } | null = null;
  private stillSpot: { until: number } | null = null;
  rescues = 0;
  gameOvers = 0;
  frames = 0;
  private lastCause = 'other';
  private stuckOpen: StuckSpot | null = null;
  private noProg = 0;
  end: FTRun['end'] = 'time';
  private goal: { got: number; need: number } | null = null;
  private sealedT = 0;
  private learned = new Set<string>();

  constructor(readonly id: string, readonly seed: number, readonly who: FirstTimer, readonly opts: RunOptions = {}) {
    this.r = rng(seed * 7919 + (opts.trial ?? 0) * 104723 + (who.name === 'KID' ? 1 : 2));
    this.sim = new RealPlay(id, seed);
    this.sim.safe = false;
    const e = (this.e = this.sim.e as Eng);
    // the engine's own lessons, stuck help and camera (the harness turns them off)
    for (const m of ['lessonTick', 'watchForStuck', 'updateCamera']) delete e[m];
    // a phone held sideways (or upright)
    const vw = opts.portrait ? PHONE.h : PHONE.w, vh = opts.portrait ? PHONE.w : PHONE.h;
    const c = e.canvas;
    c.getBoundingClientRect = () => ({ width: vw, height: vh, left: 0, top: 0 });
    e.resizeCanvas();
    this.dot = new DotShadow(id);
    e.callbacks.onGuide = (text: string, s: number, passed?: boolean) => this.dot.engine(text, s, passed);
    e.callbacks.onLesson = (lid: LessonId) => this.dot.lesson(lid, !!(this.sim.p.climbing || this.sim.p.isVineSwinging || this.sim.p.hanging));
    e.callbacks.onProgressUpdate = (cur: number, target: number) => {
      this.goal = { got: cur, need: target };
    };
    // real harm: hits and lives, with what did it
    e.damagePlayer = (amount: number, fromX?: number) => {
      const hp = this.sim.p.hp;
      const cause = this.causeNow();
      proto.damagePlayer.call(e, amount, fromX);
      if (this.sim.p.hp < hp) {
        this.lastCause = cause.cause;
        const h: Harm = { kind: 'hit', t: this.sim.t, x: this.sim.p.x, y: this.sim.p.y, cause: cause.cause, onScreen: cause.onScreen, hiding: this.hiding };
        if (cause.cause === 'watcher') {
          h.bush = this.bushNear();
          h.pass = this.e.watch?.passes;
        }
        this.harms.push(h);
      }
    };
    e.loseLife = (reason: 'water' | 'pit' | 'hurt') => {
      const p = this.sim.p;
      this.harms.push({ kind: 'life', t: this.sim.t, x: p.x, y: p.y, cause: reason === 'hurt' ? this.lastCause : reason, onScreen: null });
      const j = this.jump;
      if (j) this.tries.push({ x: j.x, y: j.y, dir: j.dir, t0: j.t0, t1: this.t, kind: j.kind, ok: false, hurt: true, running: j.running, hold: j.hold });
      const deaths = this.mem.died(this.ground.x, this.ground.y);
      if (!this.whatAt.some((w) => Math.abs(w.x - this.ground.x) < 60 && Math.abs(w.y - this.ground.y) < 30)) {
        this.whatAt.push({ x: this.ground.x, y: this.ground.y, what: `${reason === 'water' ? 'drowned' : reason === 'pit' ? 'fell' : 'lost a life'} going on from here`, step: null, dip: null, puzzle: false });
      }
      const best = this.prog.best;
      proto.loseLife.call(e, reason);
      this.respawned();
      if (deaths >= 3 && this.prog.best <= best) {
        // (the same death three times: it is noted as a loop, and he is put past it, so the rest of the stage is played)
        this.prog.hi = Math.max(this.prog.hi, this.progAt(p.x, p.y));
        if (!this.rescue()) this.end = 'stranded';
      }
    };
    let pts = opts.route;
    const st = this.sim.stage as Stage;
    this.direct = Math.hypot((st.exitTotemX || this.sim.p.x) - this.sim.p.x, (st.exitTotemY ?? this.sim.p.y) - this.sim.p.y);
    if (!pts) {
      let route = findRoute(st, []);
      // (the engine's own copy of a stage with puzzle rooms or Dot's pulley is changed as it loads, and the check cannot follow it: the
      // route is then traced on the stage as built, the same roll and setting, as the inspector traces it, round 5 2026-10-29)
      if (route.traced === 'failed') route = findRoute(buildRoll(levelConfig(this.id), this.seed, this.who.setting === 'easy'), []);
      pts = route.traced === 'failed' ? [] : sampleRoute(route).map((s) => ({ x: s.x, y: s.y }));
      // (no route the inspector can trace: the straight line from the spawn to the shrine gives him a way to head, and the run is marked)
      if (!pts.length && st.exitTotemX) {
        this.noRoute = true;
        const a = { x: this.sim.p.x, y: this.sim.p.y }, b = { x: st.exitTotemX, y: st.exitTotemY ?? a.y };
        const n = Math.max(2, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 24));
        pts = Array.from({ length: n + 1 }, (_, i) => ({ x: a.x + ((b.x - a.x) * i) / n, y: a.y + ((b.y - a.y) * i) / n }));
      }
      if (route.traced !== 'failed' && this.direct > 0) this.routeRatio = +(route.segs.reduce((a, g) => a + Math.hypot(g.x1 - g.x0, g.y1 - g.y0), 0) / this.direct).toFixed(2);
    }
    this.prog = new Progress(pts);
    this.prog.relocate(this.sim.p);
    this.lastX = this.sim.p.x;
    this.lastY = this.sim.p.y;
  }

  private respawned() {
    this.padPause = null;
    this.pending = null;
    this.punchAt = null;
    this.jump = null;
    this.airFrom = null;
    this.blockedT = 0;
    this.hideFrom = -1;
    this.prog.relocate(this.sim.p);
    this.closeStuck(false);
  }

  get t(): number {
    return this.sim.t;
  }

  /** what is hurting him right now, and whether it is on the screen */
  private causeNow(): { cause: string; onScreen: boolean | null } {
    const e = this.e, p = this.sim.p, cam = e.camera;
    const on = (x: number, y: number) => x >= cam.x - 10 && x <= cam.x + cam.viewportWidth + 10 && y >= cam.y - 40 && y <= cam.y + cam.viewportHeight + 40;
    if (e.proto?.watch && e.watch?.seen && e.watch.phase === 'pass') {
      const from = e.watchFrom as Pt | undefined;
      return { cause: 'watcher', onScreen: from ? on(from.x, from.y) : null };
    }
    let best: { e: any; d: number } | null = null;
    for (const m of e.enemies as any[]) {
      if (m.defeated) continue;
      const d = Math.hypot(m.x - p.x, (m.y ?? p.y) - p.y);
      if (d < 160 && (!best || d < best.d)) best = { e: m, d };
    }
    if (best) return { cause: `foe:${best.e.type}`, onScreen: on(best.e.x, best.e.y) };
    for (const h of e.hazards as any[]) if (Math.hypot(h.x - p.x, h.y - p.y) < 120) return { cause: `hazard:${h.type ?? 'thing'}`, onScreen: on(h.x, h.y) };
    for (const r of e.proto?.w4?.rocks ?? []) if (Math.abs(r.x - p.x) < 140) return { cause: 'rock', onScreen: on(r.x, p.y) };
    if (e.w5) return { cause: 'silk', onScreen: true };
    return { cause: 'other', onScreen: null };
  }

  // ── looking at the ground ──

  private solid(q: Platform) {
    return !q.broken;
  }
  /** a floor under x near his feet (from a little above to `down` px below) */
  floorAt(x: number, y: number, down = 40): Platform | null {
    for (const q of this.sim.platforms) {
      if (!this.solid(q)) continue;
      if (x >= q.x && x <= q.x + q.width && q.y >= y - 6 && q.y <= y + down) return q;
    }
    return null;
  }
  /** the face just in front of him (its height over his feet), or null */
  faceAhead(dir: -1 | 1, reach = 40): number | null {
    const p = this.sim.p;
    let best: number | null = null;
    for (const q of this.sim.platforms) {
      if (!this.solid(q) || q.type !== 'solid') continue;
      const near = dir > 0 ? q.x - (p.x + 22) : p.x - 22 - (q.x + q.width);
      if (near < -4 || near > reach) continue;
      if (q.y < p.y - 8 && q.y > p.y - 1200 && q.y + q.height > p.y - 4) {
        const h = p.y - q.y;
        if (best === null || h < best) best = h;
      }
    }
    return best;
  }
  /** how deep the dip he stands in is: the lower of the floors either side over him (px), or null */
  dipHere(): number | null {
    const p = this.sim.p;
    const top = (x: number) => {
      let y: number | null = null;
      for (const q of this.sim.platforms) if (this.solid(q) && x >= q.x && x <= q.x + q.width && q.y < p.y - 12 && q.y > p.y - 420) y = y === null ? q.y : Math.max(y, q.y);
      return y;
    };
    const l = top(p.x - 110), r = top(p.x + 110);
    if (l === null || r === null) return null;
    return Math.round(p.y - Math.max(l, r));
  }

  /**
   * Coming down over a small ledge or pad (under 220 px across), past its near quarter: he lets go of the steer to land on it (the
   * research's Channel 2: the lift-off then comes late, thumbify, so he may still run off its far side)
   */
  private overSmall(dir: -1 | 0 | 1): boolean {
    const p = this.sim.p;
    if (dir === 0 || p.vy < -60) return false;
    for (const q of this.sim.platforms) {
      if (q.broken || q.width >= 220 || p.x < q.x || p.x > q.x + q.width || q.y < p.y - 2 || q.y > p.y + 140) continue;
      if (dir * (p.x - (q.x + q.width / 2)) > -q.width * 0.25) return true;
    }
    return false;
  }

  /** how far the nearest bush at his level is (px), or null */
  bushNear(): number | null {
    const p = this.sim.p;
    let d: number | null = null;
    for (const b of this.e.proto?.bushes ?? []) {
      if (b.secret || b.hanging || Math.abs(b.y - this.ground.y) > 14) continue;
      const dd = Math.max(0, Math.abs(b.x + b.w / 2 - this.ground.x) - b.w / 2);
      if (d === null || dd < d) d = Math.round(dd);
    }
    return d;
  }

  /** what is at a spot, in words */
  describe(dir: -1 | 1): { what: string; step: number | null; dip: number | null; puzzle: boolean } {
    const p = this.sim.p, e = this.e;
    const step = this.faceAhead(dir, 60);
    const dip = this.dipHere();
    const parts: string[] = [];
    const puzzle = this.nearPuzzle(p.x, 220);
    if (puzzle) parts.push(puzzle);
    if (step !== null) parts.push(`a ${Math.round(step)} px ${step <= 75 ? 'waist-high step' : step <= 110 ? 'chest-high step' : 'wall'} ahead`);
    if (dip !== null) parts.push(`in a dip ${dip} px deep`);
    if (!this.floorAt(p.x + dir * 50, p.y, 40)) {
      let top: number | null = null;
      for (const q of this.sim.platforms) if (this.solid(q) && p.x + dir * 70 >= q.x && p.x + dir * 70 <= q.x + q.width && q.y > p.y + 30 && q.y < p.y + 500) top = top === null ? q.y : Math.min(top, q.y);
      parts.push(top === null ? 'an open drop ahead' : `a drop of ${Math.round(top - p.y)} px ahead`);
    }
    const st = this.sim.stage as any;
    const river = (st.rivers ?? []).find((rv: any) => p.x + dir * 120 > rv.x0 && p.x + dir * 120 < rv.x1);
    if (river) parts.push('water ahead');
    const foe = (e.enemies as any[]).find((m) => !m.defeated && Math.abs(m.x - p.x) < 200 && Math.abs(m.y - p.y) < 160);
    if (foe) parts.push(`a ${foe.type} near`);
    if (e.nearTreeVine) parts.push('a trunk beside him');
    if (this.sealed()) parts.push('the sealed shrine');
    const on = this.prog.target(p, 120);
    if (on && on.y < p.y - 60) parts.push(`the way on is ${Math.round(p.y - on.y)} px up`);
    else if (on && on.y > p.y + 60) parts.push(`the way on is ${Math.round(on.y - p.y)} px down`);
    if (p.hanging) parts.push('on a rope');
    if (p.climbing) parts.push('on a trunk');
    if (!parts.length) parts.push(p.grounded ? 'nothing in the way the bot can see' : 'in the air');
    return { what: parts.join(', '), step: step === null ? null : Math.round(step), dip, puzzle: !!puzzle };
  }

  /** a puzzle room or a piece Dot teaches near x */
  nearPuzzle(x: number, within: number): string | null {
    const e = this.e;
    for (const room of e.kit?.rooms ?? []) if (x > room.box.x0 - within && x < room.box.x1 + within) return `the puzzle "${room.spec.id.replace(/-\d+$/, '')}"`;
    const w4 = e.proto?.w4;
    for (const k of w4?.knots ?? []) if (x > k.x0 - within && x < k.x1 + within) return "Dot's knot";
    for (const s of w4?.patience ?? []) if (x > s.x0 - within && x < s.x1 + within) return `a still spot (${s.kind})`;
    for (const q of this.sim.platforms as Array<Platform & { pushSaved?: unknown }>) if ((q.push || q.pushSaved) && x > q.x - within && x < q.x + q.width + within) return 'a thing to push';
    for (const m of w4?.monkeys ?? []) if (m.job === 'trade' && Math.abs(m.x - x) < within) return "the capuchin's trade";
    return null;
  }

  private sealed(): boolean {
    const st = this.sim.stage as any;
    const exit = (this.sim.collectibles as any[]).find((c) => c.type === 'exit_totem');
    return !!exit?.isLocked && Math.abs(this.sim.p.x - st.exitTotemX) < 90;
  }

  /** how far the nearest thing a topic is about is from him (null: no such things to measure) */
  private far(topic: TopicId | undefined): boolean | null {
    if (!topic) return null;
    const p = this.sim.p, e = this.e;
    const xs: Pt[] = [];
    const things: Partial<Record<TopicId, () => void>> = {
      vine: () => this.sim.vines.forEach((v) => xs.push({ x: v.x, y: (v.topY + v.bottomY) / 2 })),
      trunk: () => this.sim.vines.forEach((v) => xs.push({ x: v.x, y: (v.topY + v.bottomY) / 2 })),
      rope: () => (this.sim.ropes as any[]).forEach((r) => xs.push({ x: (r.x0 + r.x1) / 2, y: r.y ?? p.y })),
      foe: () => (e.enemies as any[]).forEach((m) => !m.defeated && xs.push(m)),
      bush: () => (e.proto?.bushes ?? []).forEach((b: any) => xs.push({ x: b.x + b.w / 2, y: b.y })),
      puzzle: () => (e.kit?.rooms ?? []).forEach((room: any) => xs.push({ x: (room.box.x0 + room.box.x1) / 2, y: room.box.y1 })),
      petal: () => (this.sim.collectibles as any[]).forEach((c) => !c.collected && (c.type === 'flower' || c.type === 'leaf') && xs.push(c)),
      cage: () => (this.sim.collectibles as any[]).forEach((c) => !c.collected && c.type === 'cage' && xs.push(c)),
      log: () => this.sim.platforms.forEach((q) => q.push && xs.push({ x: q.x + q.width / 2, y: q.y })),
    };
    const f = things[topic];
    if (!f) return null;
    f();
    if (!xs.length) return true;
    let d = Infinity;
    for (const q of xs) d = Math.min(d, Math.hypot(q.x - p.x, (q.y - p.y) * 0.8));
    return d > 400;
  }

  /** what Dot has had on screen long enough for him to take in */
  private takeIn() {
    for (const s of [...this.dot.up(), ...this.dot.shown.slice(-4)]) {
      const upFor = (s.t1 ?? this.t) - s.t0;
      if (upFor < this.who.heed) continue;
      const t = s.text.toLowerCase();
      if (s.move) this.learned.add(s.move);
      if (/\b(hide|bush|fern)\b/.test(t) && /\b(down|slide|hold|duck|into|inside|behind)\b/.test(t)) this.learned.add('hide');
      if (/\b(punch|tap)\b/.test(t)) this.learned.add('punch');
      if (/\bkick\b/.test(t)) this.learned.add('kick');
      if (/\b(glide|leaf)\b/.test(t)) this.learned.add('glide');
      if (/\b(stand still|stay still|keep still|wait (here|for|under|on)|stand (on|under|here))\b/.test(t)) this.learned.add('still');
    }
  }

  // ── one frame ──

  /** what he means to do this frame (before the thumb's own fumbles) */
  private intend(): Pad {
    const sim = this.sim, p = sim.p, e = this.e, t = this.t, who = this.who;
    const tgt = this.prog.target(p);
    // which way: along the route; with no route, right
    let dir: -1 | 0 | 1 = 1;
    let up = false;
    if (tgt) {
      const dx = tgt.x - p.x, dy = tgt.y - p.y;
      dir = dx > 16 ? 1 : dx < -16 ? -1 : 0;
      up = dy < -40;
      if (dir === 0) {
        const far = this.prog.target(p, 200);
        if (far) dir = far.x > p.x + 16 ? 1 : far.x < p.x - 16 ? -1 : 0;
      }
      // (the way on is below, close across: he keeps going the way he was until he finds the edge, never turns back for it)
      if (dy > 40 && Math.abs(dx) < 120 && this.way !== 0) dir = this.way;
    }
    if (dir !== 0) this.way = dir;
    const fdir: -1 | 1 = dir === 0 ? (p.facing >= 0 ? 1 : -1) : dir;
    const side = (d: -1 | 0 | 1): Pad => (d > 0 ? { right: true } : d < 0 ? { left: true } : {});
    this.takeIn();
    this.hiding = false;

    // a puzzle room: stand at its entrance a moment, then on past it
    if (this.puzzleWait) {
      if (t < this.puzzleWait.until) return {};
      const room = e.kit.rooms[this.puzzleWait.room];
      this.puzzleWait = null;
      if (room.beyond) this.placeAt(room.beyond.x, room.beyond.y);
      return {};
    }
    for (const room of e.kit?.rooms ?? []) {
      // (a room he comes back to after a fall, its lift wound back down: worked again, as a person works it again, round 5 2026-10-29;
      // counted once)
      const again = this.visited.has(room.ri);
      if (again && t - (this.roomAt.get(room.ri) ?? -Infinity) < 12) continue;
      const b = room.box;
      if (p.x > b.x0 - 40 && p.x < b.x1 && p.y > b.y0 - 40 && p.y < b.y1 + 40 && p.grounded) {
        this.visited.add(room.ri);
        this.roomAt.set(room.ri, t);
        if (!again) this.puzzles.push({ id: room.spec.id, x: Math.round(p.x), t: +t.toFixed(1) });
        this.puzzleWait = { until: t + 3, room: room.ri };
        this.closeStuck(false);
        return {};
      }
    }

    // (he has just caught a trunk: a press he decided on before it is dropped, as a thumb that has gone to the climb does; one still on
    // its way threw him off halfway up, round 5 2026-10-29)
    if (p.climbing && !this.wasClimbing) this.pending = null;
    this.wasClimbing = !!p.climbing;
    // a press he has decided on comes when his thumb gets there (the reaction noise)
    if (this.pending && t >= this.pending.at && !this.jump) {
      const q = this.pending;
      this.pending = null;
      if (p.grounded || p.climbing || p.isVineSwinging || p.hanging || t - (this.airFrom?.t ?? t) < 0.4) return this.startJump(q.dir, q.kind, q.off);
    }

    // the watching eagle: once told how to hide, he heads for the nearest bush a second after its cry, and stays down until it has gone
    const w = e.proto?.watch ? e.watch : null;
    if (w) {
      if (w.phase === 'warn' && this.warnSeenAt < 0) this.warnSeenAt = t;
      if (w.phase === 'calm') this.warnSeenAt = -1;
      if (this.learned.has('hide') && this.warnSeenAt >= 0 && t >= this.warnSeenAt + who.heed && (w.phase === 'warn' || w.phase === 'pass') && !this.jump) {
        const bushes = (e.proto.bushes ?? []).filter((b: any) => !b.secret && !b.hanging && Math.abs(b.y - p.y) < 14);
        let best: any = null;
        for (const b of bushes) if (!best || Math.abs(b.x + b.w / 2 - p.x) < Math.abs(best.x + best.w / 2 - p.x)) best = b;
        if (best && Math.abs(best.x + best.w / 2 - p.x) < 600) {
          this.hiding = true;
          const cx = best.x + best.w / 2;
          if (p.x > best.x + 16 && p.x < best.x + best.w - 16 && p.grounded) return { down: true };
          return side(cx > p.x ? 1 : -1);
        }
      }
    }

    // a still spot Dot has explained: he stands there a while
    if (this.stillSpot) {
      if (t < this.stillSpot.until) return {};
      this.stillSpot = null;
    } else if (this.learned.has('still') && p.grounded && this.nearPuzzle(p.x, 0)?.startsWith('a still spot')) {
      this.stillSpot = { until: t + 6 };
      this.learned.delete('still');
      return {};
    }

    // a jump in progress: the thumb down for its hold, the steer back after a straight-up flick, a second flick near the top
    const j = this.jump;
    if (j) {
      const age = t - j.t0;
      const out: Pad = age < j.upOnly || this.overSmall(j.dir) ? {} : side(j.dir);
      if (age < j.hold) out.jump = true;
      if (j.kind === 'double' && !j.pressed2 && age > j.hold + DT && !p.grounded && p.vy > j.dblAt && p.jumpsLeft > 0) {
        j.pressed2 = true;
        out.press = true;
        out.jump = true;
        this.lastPress = t;
        j.hold = age + flickHold(this.r, who);
      }
      if (this.learned.has('glide') && e.skills?.has('glide') && !p.grounded && p.vy > 150 && age > 0.4) out.jump = true;
      return out;
    }

    // on a trunk: straight up to its top (down where the way goes down), then off it with a flick the way on
    if (p.climbing) {
      // (round 5, 2026-10-29: measured against lastY, which after() has already moved to where he is, this read 0 every frame, and he
      // flicked off every trunk about 90 px up: the tall climbs ran out the clock)
      const moved = Math.abs(this.moveY);
      this.climbStill = moved < 0.5 ? this.climbStill + DT : 0;
      // (the way up or down a trunk is chosen as he catches it and kept: chosen afresh every frame, it flipped with the point he
      // headed for, up one frame and down the next, at a trunk's foot for half a minute; and when it gets him nowhere, the other way,
      // once, before he flicks off, round 5 2026-10-29)
      if (this.climbVine !== e.nearTreeVine || !this.wasOnTrunk) {
        this.climbVine = e.nearTreeVine;
        this.climbDown = !!(tgt && tgt.y > p.y + 40 && Math.abs(tgt.x - p.x) < 60);
        this.climbTurned = false;
      }
      if (this.climbStill < 0.4) return this.climbDown ? { down: true } : { up: true };
      this.climbStill = 0;
      if (!this.climbTurned) {
        this.climbTurned = true;
        this.climbDown = !this.climbDown;
        return this.climbDown ? { down: true } : { up: true };
      }
      return this.decide(fdir, 'single', true, side(fdir));
    }
    // on a liana: pump the way on, let go on the swing forward
    if (p.isVineSwinging) {
      this.swingT += DT;
      const a = p.swingAngle ?? 0, om = p.swingAngularVelocity ?? 0;
      if (!this.pending && ((this.swingT > 1 && a * fdir > 0.3 && om * fdir > 0) || this.swingT > 7)) {
        this.swingT = 0;
        return this.decide(fdir, 'single', true, side(fdir));
      }
      return side(fdir);
    }
    this.swingT = 0;
    // on a rope: along it the way on, off at its end
    if (p.hanging) {
      this.ropeStill = Math.abs(this.moveX) < 0.5 ? this.ropeStill + DT : 0;
      if (this.ropeStill > 0.5 && !this.pending) {
        this.ropeStill = 0;
        return this.decide(fdir, 'single', true, side(fdir));
      }
      return side(fdir);
    }
    if (!p.grounded) {
      // in the air off a ledge he walked off: steer the way on; grab a trunk if he touches one on the way up
      const out = this.overSmall(fdir) ? {} : side(fdir);
      if (e.nearTreeVine && up) out.up = true;
      if (this.learned.has('glide') && e.skills?.has('glide') && p.vy > 150) out.jump = true;
      return out;
    }

    // on the ground
    // (the first moments of a stage: he holds the way on and takes nothing in yet)
    if (t < who.look) return side(dir || 1);
    // (a press on its way: he keeps going until it comes)
    if (this.pending) return side(this.pending.dir);
    // (just landed: the thumb comes back down before the next flick)
    if (t - this.lastLand < 0.1) {
      // (landed on a small pad or ledge: he stops on it a beat, then flicks on from where he stands if its edge is close)
      const here = this.floorAt(p.x, p.y, 6);
      if (here && here.width < 220 && !this.padPause) this.padPause = { until: t + between(this.r, [0.25, 0.5]), id: here.id };
      if (!this.padPause) return side(dir);
    }
    if (this.padPause) {
      const here = this.floorAt(p.x, p.y, 6);
      if (!here || here.id !== this.padPause.id) this.padPause = null;
      else if (t < this.padPause.until) return {};
      else {
        this.padPause = null;
        if (dir !== 0 && !this.floorAt(p.x + dir * 80, p.y, 40)) {
          const on = this.prog.target(p, 160);
          if (!(on && on.y > p.y + 50)) return this.decide(dir, this.mem.plan(p.x, p.y), false, side(dir));
        }
      }
    }
    // (getting ready to punch: a moment's hesitation, then the tap, never right on top of a jump press)
    if (this.punchAt !== null) {
      if (t < this.punchAt || t - this.lastPress < this.swapGap) return {};
      this.punchAt = null;
      return { punch: true };
    }
    // a trunk he is touching, and the way goes up (or he is stopped beside it): straight up
    // (holding up at the top of the trunk he just came up takes him nowhere: after a moment he lets the trunk be and goes on as on
    // open ground, a hop up to the ledge above, round 5 2026-10-29)
    this.trunkUpT = e.nearTreeVine && !p.climbing && p.grounded && Math.abs(this.moveY) < 0.5 ? this.trunkUpT + DT : 0;
    if (this.trunkUpT > 0.6) this.trunkIgnoreUntil = t + 2;
    if (e.nearTreeVine && t >= this.trunkIgnoreUntil && (up || this.blockedT > who.stopReact)) return { up: true };
    // stopped dead against something: a plain jump
    const moved = Math.abs(p.x - this.lastX);
    this.blockedT = moved < 0.8 && dir !== 0 && !p.pushing ? this.blockedT + DT : 0;
    if (this.blockedT >= who.stopReact) {
      this.blockedT = 0;
      const face = this.faceAhead(fdir, 30);
      if (face !== null) {
        this.stops.push({ x: p.x, y: p.y, h: face, t });
        this.nextStop = this.stops.length - 1;
      }
      return this.decide(fdir, this.mem.plan(p.x, p.y), false, side(dir));
    }
    // the way goes up right here (a ledge over him): jump for it
    if (up && dir === 0 && tgt && tgt.y < p.y - 60) return this.decide(fdir, this.mem.plan(p.x, p.y), false, {});
    if (dir !== 0) {
      // an edge coming: he means to jump `edgeAim` px before it (the thumb's latency moves it), unless the way on drops down
      const ahead = this.floorAt(p.x + dir * (22 + who.edgeAim), p.y, 40);
      if (!ahead) {
        const on = this.prog.target(p, 160);
        const drops = on && on.y > p.y + 50;
        // (a log or a lily pad drifting across the gap: he can see it, so he waits at the edge until it is near, up to 6 s)
        const here = this.floorAt(p.x, p.y, 6);
        if (!drops && here && here.type !== 'drift' && here.type !== 'moving') {
          const edgeX = dir > 0 ? here.x + here.width : here.x;
          const floats = this.sim.platforms.filter((q) => (q.type === 'drift' || q.type === 'moving') && !q.broken && Math.abs(q.y - p.y) < 70 && (dir > 0 ? q.x + q.width > edgeX && q.x < edgeX + 320 : q.x < edgeX && q.x + q.width > edgeX - 320));
          const near = floats.some((q) => (dir > 0 ? q.x - edgeX < 90 && q.x + q.width - edgeX > 40 : edgeX - (q.x + q.width) < 90 && edgeX - q.x > 40));
          if (floats.length && !near) {
            if (this.edgeWait < 0) this.edgeWait = t;
            if (t - this.edgeWait < 6) return {};
          }
        }
        this.edgeWait = -1;
        if (!drops) return this.decide(dir, this.mem.plan(p.x, p.y), false, side(dir));
      }
      // an animal walking at him: hop it (or punch it, once told how), or walk on into it
      for (const m of e.enemies as any[]) {
        if (m.defeated) continue;
        const dx = (m.x - p.x) * dir;
        if (dx < 20 || dx > 130 || Math.abs(m.y + 12 - p.y) > 60) continue;
        if (!this.foeSeen.has(m.id)) this.foeSeen.set(m.id, this.r() < who.hopFoe);
        if (this.learned.has('punch') && dx < 110) {
          this.punchAt = t + who.hesitate;
          this.swapGap = between(this.r, who.swap);
          return {};
        }
        if (this.foeSeen.get(m.id) && dx < 90) return this.decide(dir, 'single', false, side(dir));
      }
    }
    return side(dir);
  }

  /** he decides to flick: it comes after the thumb's latency (N(mean, sd); an early one comes at once) */
  private decide(dir: -1 | 0 | 1, kind: 'single' | 'double', off: boolean, meanwhile: Pad): Pad {
    const lag = gauss(this.r, this.who.thumb);
    if (lag <= DT / 2) return this.startJump(dir, kind, off);
    this.pending = { at: this.t + lag, dir, kind, off };
    return meanwhile;
  }

  /** the thumb's own fumbles on top of what he means: drift into the dead zone, travel when turning, a late lift-off */
  private thumbify(want: Pad): Pad {
    const who = this.who, t = this.t;
    const steer: -1 | 0 | 1 = want.right ? 1 : want.left ? -1 : 0;
    const out: Pad = { ...want };
    const drop = () => {
      delete out.right;
      delete out.left;
    };
    if (steer !== 0 && steer === this.lastSteer) this.driftPx = Math.min(30, this.driftPx + Math.max(0, gauss(this.r, who.drift)) * DT);
    if (steer !== 0 && this.lastSteer !== 0 && steer !== this.lastSteer) {
      const lag = (2 * 16 + this.driftPx) / who.thumbSpeed;
      this.travelUntil = t + lag;
      this.turns++;
      this.turnLag += lag;
      this.driftPx = 0;
    }
    if (steer !== 0 && this.r() < who.slip * DT) this.driftUntil = t + Math.round(between(this.r, who.slipFrames)) * DT;
    if (steer === 0 && this.lastSteer !== 0 && !want.press) {
      const [lo, hi] = who.releaseMax;
      this.releaseLeft = Math.max(lo, Math.min(hi, Math.round(Math.exp(gauss(this.r, who.release)))));
    }
    if (steer !== 0) this.releaseLeft = 0;
    if (t < this.travelUntil || t < this.driftUntil) drop();
    else if (steer === 0 && this.releaseLeft > 0 && !want.down) {
      this.releaseLeft--;
      if (this.lastSteer > 0) out.right = true;
      else out.left = true;
      return out;
    }
    this.lastSteer = steer;
    return out;
  }

  private pad(): Pad {
    const out = this.thumbify(this.intend());
    this.wasOnTrunk = !!this.sim.p.climbing;
    if (out.press) this.lastPress = this.t;
    return out;
  }

  /** a flick up: short, sometimes straight up for a moment; a second flick only where a single one failed before */
  private startJump(dir: -1 | 0 | 1, kind: 'single' | 'double', off: boolean): Pad {
    const p = this.sim.p, who = this.who;
    const hold = flickHold(this.r, who);
    const upOnly = !off && this.r() < who.upOnly ? between(this.r, who.upOnlyT) : 0;
    this.pending = null;
    this.jump = { t0: this.t, x: p.x, y: p.y, cur: this.prog.cur, kind, hold, upOnly, dir, pressed2: false, dblAt: between(this.r, who.dblAt), left: false, stop: this.nextStop ?? undefined, harms: this.harms.length, running: p.grounded && Math.abs(p.vx) > 150 };
    this.nextStop = null;
    const out: Pad = upOnly > 0 ? {} : dir > 0 ? { right: true } : dir < 0 ? { left: true } : {};
    out.press = true;
    out.jump = true;
    return out;
  }

  /** put him somewhere along the way (a puzzle passed, a rescue) */
  private placeAt(x: number, y: number) {
    const sim = this.sim;
    const lives = this.e.lives;
    sim.stand(x, y);
    this.e.lives = lives;
    this.e.checkpoint = { x, y };
    this.sim.p.invincibleTimer = 0;
    this.jump = null;
    this.airFrom = null;
    this.blockedT = 0;
    this.prog.relocate(sim.p);
  }

  /** the route point nearest a spot */
  private progAt(x: number, y: number): number {
    let bi = 0, bd = Infinity;
    this.prog.pts.forEach((q, i) => {
      const d = Math.abs(q.x - x) + Math.abs(q.y - y) * 0.7;
      if (d < bd) {
        bd = d;
        bi = i;
      }
    });
    return bi;
  }

  /** stuck too long: on to the next place to stand along the route, a little further on */
  private rescue(): boolean {
    const pts = this.prog.pts;
    const p = this.sim.p;
    for (let i = this.prog.hi + 4; i < pts.length; i++) {
      const q = pts[i];
      if (Math.hypot(q.x - p.x, q.y - p.y) < 160) continue;
      const f = this.floorAt(q.x, q.y - 2, 8);
      if (!f || f.type === 'fragile') continue;
      this.rescues++;
      if (this.stuckOpen) this.stuckOpen.rescued = true;
      this.closeStuck(true);
      this.placeAt(q.x, f.y);
      return true;
    }
    return false;
  }

  private closeStuck(_rescued: boolean) {
    this.stuckOpen = null;
    this.noProg = 0;
  }

  /** after a frame: landings, progress, stuck spots, game over */
  private after() {
    const sim = this.sim, p = sim.p, e = this.e, t = this.t;
    const more = this.prog.step(p);
    // landings: did the jump get him on?
    const held = p.climbing || p.isVineSwinging || p.hanging;
    if (!p.grounded && !held && !this.airFrom) this.airFrom = { t, x: p.x, y: p.y, cur: this.prog.cur };
    if ((p.grounded || held) && this.airFrom) {
      const j = this.jump;
      if (t - this.airFrom.t > 0.12) {
        this.lastLand = t;
        if (j) {
          // (a jump that took him on along the way but dropped him far under where he set off is a miss: he fell past the ledge,
          // round 5 2026-10-29; counted a success, the bot never tried the jump another way)
          const ok = held || p.y < j.y - 6 || (this.prog.cur > j.cur + 2 && p.y < j.y + 60);
          this.mem.result(j.x, j.y, j.kind, ok);
          const hurt = this.harms.length > j.harms;
          this.tries.push({ x: j.x, y: j.y, dir: j.dir, t0: j.t0, t1: t, kind: j.kind, ok: ok && !hurt, hurt, running: j.running, land: ok && p.grounded ? { id: this.e.standingOnId, x: p.x, y: p.y } : undefined, hold: j.hold });
          if (j.stop !== undefined && this.stops[j.stop].ok === undefined) this.stops[j.stop].ok = ok;
          if (!ok && !this.whatAt.some((w) => Math.abs(w.x - j.x) < 60 && Math.abs(w.y - j.y) < 30)) {
            const d = this.describe(j.dir === -1 ? -1 : 1);
            this.whatAt.push({ x: j.x, y: j.y, ...d });
          }
          if (TRACE) process.stderr.write(`  ${t.toFixed(2)} ${j.kind} from ${Math.round(j.x)},${Math.round(j.y)} hold ${j.hold.toFixed(2)} up ${j.upOnly.toFixed(2)} -> ${Math.round(p.x)},${Math.round(p.y)} ${ok ? 'ok' : 'FELL BACK'}\n`);
        }
      }
      this.airFrom = null;
      this.jump = null;
    }
    if (this.jump && !this.airFrom && t - this.jump.t0 > 0.5) {
      // (the flick never left the ground: a jump under a ceiling, or eaten)
      this.mem.result(this.jump.x, this.jump.y, this.jump.kind, false);
      this.jump = null;
    }
    // fallen off the way (a miss in a climb drops him to a branch or the floor far under where he was): once he stands there a moment,
    // he finds his place along the way again and heads back to the way up, as a person climbs back (round 5, 2026-10-29: the bot kept
    // heading for the point straight over his head, never walked back to the trunk, and the tall climbs ran out the clock)
    if (this.prog.off(p) > 260 && !held) {
      this.offRoute += DT;
      if (this.offRoute > 0.5 && p.grounded) {
        this.prog.relocate(p, true);
        this.offRoute = 0;
      }
    } else this.offRoute = 0;
    // stuck: no progress for 8 s (not while standing at a puzzle)
    if (more || this.puzzleWait || this.stillSpot) {
      if (this.stuckOpen && this.noProg >= 8) this.stuckOpen.dur = +this.noProg.toFixed(1);
      this.stuckOpen = null;
      this.noProg = 0;
    } else {
      this.noProg += DT;
      if (this.noProg >= 8 && !this.stuckOpen) {
        // (described where he stands; in the air mid-try, as the spot he keeps falling back to was)
        const g = this.ground;
        const w = p.grounded ? null : this.whatAt.find((q) => Math.abs(q.x - g.x) < 80 && Math.abs(q.y - g.y) < 40);
        const dir = (this.prog.target(p)?.x ?? p.x + 1) >= p.x ? 1 : -1;
        const d = w ?? (p.grounded ? this.describe(dir) : null);
        if (d) {
          const at = p.grounded ? p : g;
          this.stuckOpen = { x: Math.round(at.x), y: Math.round(at.y), t: +(t - this.noProg).toFixed(1), dur: 8, what: d.what, step: d.step, dip: d.dip, puzzle: d.puzzle, rescued: false };
          this.stuck.push(this.stuckOpen);
        }
      }
      if (this.stuckOpen) this.stuckOpen.dur = +this.noProg.toFixed(1);
      const fallbacks = this.mem.fails(p.x, p.y);
      if (this.noProg >= (this.opts.rescueAfter ?? 20) || (fallbacks >= 5 && this.noProg > 8.5)) {
        if (!this.rescue()) this.end = 'stranded';
      }
    }
    // out of lives: Continue, as a player does
    if (e.isGameOver && e.outOfLives) {
      this.gameOvers++;
      e.isRunning = true;
      e.continueFromCheckpoint();
      this.respawned();
    }
    // the sealed shrine: he stands at it a moment and gives up (the run ends there)
    if (this.sealed()) this.sealedT += DT;
    if (p.grounded) this.ground = { x: p.x, y: p.y };
    // (the frame's own movement, for the next frame's choices: by then lastX and lastY are where he already is)
    this.moveX = p.x - this.lastX;
    this.moveY = p.y - this.lastY;
    const step = Math.hypot(p.x - this.lastX, p.y - this.lastY);
    if (step < 100) this.walked += step;
    this.lastX = p.x;
    this.lastY = p.y;
  }

  /** the whole run, until the shrine, a sealed shrine, or the time cap */
  play(): this {
    // (three times the stage's own length where it has one (STAGE_SECONDS), as 360 s is for a two-minute stage: World 4's longer stages ran out of time at 360 s while
    // the bot was still making its way up, round 5 2026-10-29)
    const cap = this.opts.cap ?? Math.max(360, 3 * (STAGE_SECONDS[this.id] ?? 0));
    const e = this.e;
    while (this.t < cap) {
      const pad = this.pad();
      this.sim.frame(pad);
      if (TRACE_FRAMES && this.t > TRACE_FRAMES[0] && this.t < TRACE_FRAMES[1]) process.stderr.write(`    f ${this.t.toFixed(2)} ${Math.round(this.sim.p.x)},${Math.round(this.sim.p.y)} g${+this.sim.p.grounded} vx${Math.round(this.sim.p.vx)} pad ${JSON.stringify(pad)} on ${this.e.standingOnId}\n`);
      this.frames++;
      e.guideView(this.view);
      this.dot.tick(this.view, this.t, (tp) => this.far(tp));
      this.after();
      if (e.exitTotemReached) {
        this.end = 'shrine';
        break;
      }
      if (this.sealedT > 3) {
        this.end = 'sealed door';
        break;
      }
      if (this.end === 'stranded') break;
    }
    return this;
  }

  /** the faces that stopped his walk dead: one per spot, and whether the first plain jump there got him over */
  stopsReport(): FTRun['stops'] {
    const firsts: Array<{ x: number; y: number; h: number; ok?: boolean }> = [];
    for (const st of this.stops) if (!firsts.some((q) => Math.abs(q.x - st.x) < 60 && Math.abs(q.y - st.y) < 30)) firsts.push(st);
    return { n: firsts.length, firstJumpFailed: firsts.filter((q) => q.ok === false).length, heights: [...new Set(firsts.filter((q) => q.ok === false).map((q) => Math.round(q.h)))].sort((a, b) => a - b) };
  }

  loopsReport() {
    return this.mem.loops().map((l) => {
      const near = this.whatAt.find((w) => Math.abs(w.x - l.x) < 80 && Math.abs(w.y - l.y) < 40) ?? this.stuck.find((s) => Math.abs(s.x - l.x) < 160) ?? null;
      return { ...l, what: near?.what ?? '', step: near?.step ?? null, dip: near?.dip ?? null, puzzle: !!near?.puzzle };
    });
  }

  goalNow() {
    return this.goal;
  }
}

/** hold the way on from the very first frame for 5 s (no jumps at all): what costs a heart or a life before anyone could react */
export function holdOn(id: string, seed: number, who: FirstTimer): { hit: Harm | null; life: Harm | null } {
  // (on a fresh phone, and the phone as it was is put back after: this probe is not part of the player's own play)
  const saved = phoneState();
  freshPhone(who.setting);
  try {
    return holdOnHere(id, seed);
  } finally {
    restorePhone(saved);
    setDifficulty(who.setting);
  }
}

/** what the phone remembers (lessons seen, tips heard, settings) */
export function phoneState(): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k !== null) out.push([k, localStorage.getItem(k) ?? '']);
    }
  } catch {
    /* none */
  }
  return out;
}
export function restorePhone(st: Array<[string, string]>): void {
  try {
    localStorage.clear();
    for (const [k, v] of st) localStorage.setItem(k, v);
  } catch {
    /* none */
  }
}

function holdOnHere(id: string, seed: number): { hit: Harm | null; life: Harm | null } {
  const sim = new RealPlay(id, seed);
  sim.safe = false;
  const e = sim.e as Eng;
  sim.p.invincibleTimer = 0;
  let life: Harm | null = null;
  e.loseLife = (reason: string) => {
    life ??= { kind: 'life', t: +sim.t.toFixed(1), x: Math.round(sim.p.x), y: Math.round(sim.p.y), cause: reason === 'hurt' ? 'hit' : reason, onScreen: null };
    sim.died = true;
  };
  let hit: Harm | null = null;
  let hp = sim.p.hp;
  for (let i = 0; i < 5 * 30 && !sim.died; i++) {
    sim.frame({ right: true });
    if (sim.p.hp < hp && !hit) hit = { kind: 'hit', t: +sim.t.toFixed(1), x: Math.round(sim.p.x), y: Math.round(sim.p.y), cause: 'hit', onScreen: null };
    hp = sim.p.hp;
  }
  return { hit, life };
}

/** one stage, one setting: the run, judged */
export function firstTimer(id: string, seed: number, who: FirstTimer, opts: RunOptions & { fresh?: boolean; trial?: number } = {}): FTRun {
  const t0 = Date.now();
  const hold = holdOn(id, seed, who);
  if (opts.fresh !== false) freshPhone(who.setting);
  else setDifficulty(who.setting);
  // (the engine's own chances, the eagle's passes and the like, are seeded too: the same seed plays the same run)
  const mr = Math.random;
  Math.random = rng(seed * 104729 + (opts.trial ?? 0) * 31 + (who.name === 'KID' ? 3 : 5));
  let run: FirstTimerRun;
  try {
    run = new FirstTimerRun(id, seed, who, opts).play();
  } finally {
    Math.random = mr;
  }
  const end = run.t;
  const harms = run.harms.map((h) => ({ ...h, t: +h.t.toFixed(1), x: Math.round(h.x), y: Math.round(h.y) }));
  const mins = Math.max(0.25, end / 60);
  const shown = run.dot.shown;
  const dot = dotReport(shown, end);
  const fh = firstHarms(run.harms, shown, who.heed);
  const loops = run.loopsReport();
  const out: FTRun = {
    who: who.name,
    setting: who.setting,
    seed,
    end: run.end,
    time: +end.toFixed(1),
    x: Math.round(run.sim.p.x),
    progress: +run.prog.share.toFixed(3),
    goal: run.goalNow(),
    holdOn: hold,
    opening: harms.filter((h) => h.t < 5),
    harms,
    perMin: { hits: +(harms.filter((h) => h.kind === 'hit').length / mins).toFixed(2), lives: +(harms.filter((h) => h.kind === 'life').length / mins).toFixed(2) },
    gameOvers: run.gameOvers,
    firstHarm: fh,
    stuck: run.stuck,
    loops,
    stops: run.stopsReport(),
    puzzles: run.puzzles,
    rescues: run.rescues,
    dot,
    flags: [],
    tries: run.tries,
    noRoute: run.noRoute,
    turns: { n: run.turns, lag: +run.turnLag.toFixed(1) },
    backtrack: { route: run.routeRatio, bot: run.end === 'shrine' && run.direct > 0 && run.rescues === 0 ? +(run.walked / run.direct).toFixed(2) : null },
    frames: run.frames,
    ms: Date.now() - t0,
  };
  out.flags = flagsFor(out);
  return out;
}

/** what the run says needs looking at, worst first; each names the rule it breaks (RULES, from reference/STAGE-RULES.md) */
export function flagsFor(r: FTRun): Flag[] {
  const f: Flag[] = [];
  const add = (rule: RuleId, kind: Flag['kind'], sev: number, x: number | null, t: number | null, what: string) => f.push({ sev, kind, rule, x, t, what });
  const cause = (c: string) => (c === 'water' ? 'drowned' : c === 'pit' ? 'fell' : c === 'watcher' ? 'the watching eagle' : c.startsWith('foe:') ? `a ${c.slice(4)}` : c);
  const S = RULES.opening.secs;
  // Opening seconds: holding the way on from the first frame, and the bot's own first seconds
  if (r.holdOn.life) add('opening', 'opening', 100, r.holdOn.life.x, r.holdOn.life.t, `holding the way on from the start costs a life at ${r.holdOn.life.t} s (${cause(r.holdOn.life.cause)})`);
  else if (r.holdOn.hit) add('opening', 'opening', 85, r.holdOn.hit.x, r.holdOn.hit.t, `holding the way on from the start costs a heart at ${r.holdOn.hit.t} s`);
  for (const h of r.opening) add('opening', 'opening', h.kind === 'life' ? 95 : 80, h.x, h.t, `${h.kind === 'life' ? 'life lost' : 'hit'} in the first ${S} s (${cause(h.cause)}${h.onScreen === false ? ', from off screen' : ''})`);
  // ... and the first tip comes before the first hazard it teaches
  for (const h of r.firstHarm) {
    if (h.ok) continue;
    add('opening', 'before-tip', h.kind === 'life' ? 72 : 62, h.x, h.t, `${cause(h.cause)} ${h.kind === 'life' ? 'costs a life' : 'hits him'} at ${h.t} s; ${h.tip ? `Dot's tip that teaches it is on screen at ${h.tip.t} s ("${h.tip.text}")` : 'no tip of Dot teaches it'}`);
  }
  // 1-7's eagle: the first swoop must be harmless; swoops from on screen; hiding must work
  const eagle = r.harms.filter((h) => h.cause === 'watcher' && h.kind === 'hit');
  if (eagle.length) {
    const h = eagle[0];
    add('eagle', 'eagle', 68, h.x, h.t, `the watching eagle's first strike hurts (pass ${(h.pass ?? 0) + 1}, at ${h.t} s)${h.bush === null || h.bush === undefined ? ', no bush at his level' : h.bush > 150 ? `, the nearest bush ${h.bush} px away` : ''}${h.hiding ? ', while he was going for a bush' : ''}`);
    const off = eagle.filter((e) => e.onScreen === false).length;
    if (off) add('eagle', 'eagle', 64, null, null, `${off} of the eagle's ${eagle.length} strikes come from off screen`);
    const gaps = eagle.slice(1).map((e, i) => e.t - eagle[i].t);
    if (eagle.length > 1) add('eagle', 'eagle', 52 + Math.min(10, eagle.length), null, null, `the eagle hits him ${eagle.length} times (every ${Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length)} s on average; ${eagle.filter((e) => e.hiding).length} while he was hiding or going for a bush)`);
  }
  // Plain walk: a face or dip that stops a plain walk dead, a dip with no one-jump way out
  for (const l of r.loops) {
    // (a step or dip a jump should carry: waist to chest high; a taller face is a wall, a question of the way on)
    // (Plain walk: a dip (higher ground both sides) he cannot get out of, or a step up to chest height a plain jump does not carry; a
    // taller face on its own, or a fall, is a question of the way on)
    const dipOrStep = l.dip !== null || (l.step !== null && l.step <= 110);
    add(l.puzzle ? 'wayOn' : dipOrStep ? 'plainWalk' : 'wayOn', 'loop', (l.puzzle ? 30 : 50) + 4 * Math.min(6, l.n), l.x, null,
      `${l.deaths ? `lost ${l.deaths} lives${l.n > l.deaths ? ` and fell back ${l.n - l.deaths} times` : ''} at the same spot` : `fell back into the same spot ${l.n} times`} (${l.doubles} double jumps tried)${l.what ? `: ${l.what}` : ''}`);
  }
  if (r.stops.firstJumpFailed) add('plainWalk', 'stuck', 46, null, null, `${r.stops.firstJumpFailed} of the ${r.stops.n} faces that stopped his walk dead were not got over by his first plain jump (heights ${r.stops.heights.join(', ')} px)`);
  for (const s of r.stuck) {
    if (s.puzzle) continue;
    const plain = s.dip !== null || (s.step !== null && s.step <= 110);
    add(plain ? 'plainWalk' : 'wayOn', 'stuck', 44 + Math.min(16, s.dur / 2), s.x, s.t, `no progress for ${Math.round(s.dur)} s: ${s.what}${s.rescued ? ' (the bot was put further on)' : ''}`);
  }
  // the outcome
  if (r.noRoute) add('outcome', 'unfinished', 20, null, null, 'the inspector traced no route here, so the bot headed straight for the shrine: check this stage by hand');
  if (r.end !== 'shrine') add('outcome', 'unfinished', r.end === 'sealed door' ? 30 : 66, r.x, r.time, r.end === 'sealed door' ? `reached the shrine short of the goal (${r.goal?.got ?? '?'} of ${r.goal?.need ?? '?'})` : `did not reach the shrine (${r.end}, ${Math.round(r.progress * 100)}% along the way)`);
  const hits = r.harms.filter((h) => h.kind === 'hit').length, lives = r.harms.filter((h) => h.kind === 'life').length;
  if (r.perMin.hits > RULES.outcome.hitsPerMin || r.perMin.lives > RULES.outcome.livesPerMin) add('outcome', 'harm-rate', 40 + Math.min(15, r.perMin.lives * 10 + r.perMin.hits), null, null, `${hits} hits and ${lives} lives lost in ${Math.round(r.time)} s (${r.perMin.hits} hits, ${r.perMin.lives} lives a minute)${r.gameOvers ? `, ${r.gameOvers} game overs` : ''}`);
  // Dot pacing
  for (const l of r.dot.long) add('dot', 'dot-long', l.outOfReach ? 36 : 28, null, l.t, `"${l.text}" up ${Math.round(l.dur)} s${l.outOfReach ? ' with its thing out of reach' : ''}`);
  for (const p of r.dot.repeats) add('dot', 'dot-repeat', 20 + 2 * p.n, null, p.at[1], `"${p.text}" said ${p.n} times (at ${p.at.join(', ')} s)`);
  for (const p of r.dot.reteach) add('dot', 'dot-reteach', 24, null, p.t, `"${p.text}" teaches a move he had already done`);
  if (r.dot.quick.length) add('dot', 'dot-quick', 14 + Math.min(10, r.dot.quick.length), null, r.dot.quick[0].t, `${r.dot.quick.length} of her ${r.dot.heard} lines start under ${RULES.dot.gap} s after the one before (first at ${r.dot.quick[0].t} s: "${r.dot.quick[0].text}", ${r.dot.quick[0].gap} s after "${r.dot.quick[0].after}")`);
  for (const p of r.dot.wordy) add('dot', 'dot-words', 12, null, p.t, `"${p.text}" is ${p.words} words (under ${RULES.dot.words})`);
  return f.sort((a, b) => b.sev - a.sev);
}

// ───────────────────────────── the Gemini gates (Part 2 §8; GEMINI-LEDGER F3, F5) ─────────────────────────────

/** one jump edge: every try he made from one spot (60 px across, 30 px up), across all runs */
export interface Edge {
  x: number;
  y: number;
  tries: number;
  ok: number;
  /** survival rate: tries that got him on without a hit or a lost life */
  sr: number;
  /** first try (s) */
  t: number;
  /** the first good try, when there was one */
  good?: Try;
}

export function edgesOf(tries: Try[]): Edge[] {
  const out: Edge[] = [];
  for (const tr of [...tries].sort((a, b) => a.t0 - b.t0)) {
    let e = out.find((q) => Math.abs(q.x - tr.x) < 60 && Math.abs(q.y - tr.y) < 30);
    if (!e) out.push((e = { x: Math.round(tr.x), y: Math.round(tr.y), tries: 0, ok: 0, sr: 0, t: +tr.t0.toFixed(1) }));
    e.tries++;
    if (tr.ok) {
      e.ok++;
      e.good ??= tr;
    }
  }
  for (const e of out) e.sr = +(e.ok / e.tries).toFixed(2);
  return out;
}

/**
 * Peak consecutive stress: an edge's risk is the share of his tries there that failed or hurt (0-1); edges with less than a rest pad of
 * plain going between them (2.0 s Easy, 1.0 s Normal: the research's T_min_recovery) are one burst; the peak is the burst with the most.
 */
export function peakStress(edges: Edge[], rest: number): { peak: number; at: { x: number; t: number } | null; bursts: number } {
  const passed = edges.filter((e) => e.good).sort((a, b) => a.good!.t0 - b.good!.t0);
  let peak = 0, at: { x: number; t: number } | null = null, bursts = 0;
  let sum = 0, start: Edge | null = null, lastEnd = -1e9;
  for (const e of passed) {
    const g = e.good!;
    if (g.t0 - lastEnd > rest) {
      if (start) bursts++;
      sum = 0;
      start = e;
    }
    sum += 1 - e.sr;
    if (sum > peak) {
      peak = sum;
      at = { x: start!.x, t: +start!.good!.t0.toFixed(1) };
    }
    lastEnd = g.t1;
  }
  if (start) bursts++;
  return { peak: +peak.toFixed(2), at, bursts };
}

/**
 * The input window of a jump, in the real engine: from a short walk-up to where he took off, the press is moved a frame earlier or later
 * at a time (with his own flick and his own second flick) until it no longer lands where his good try did. The window is how many
 * frames work in a row around his own take-off, at 30 fps. Only jumps he took running (a gap, a ledge), on still ground to still ground
 * (a moving platform's timing is not the press's); the world around it (an animal walking) is as it is at that moment of a fresh run.
 */
export function inputWindows(id: string, seed: number, who: FirstTimer, edges: Edge[], max = 12): Array<{ x: number; y: number; frames: number; ms: number; wide: boolean }> {
  setDifficulty(who.setting);
  const sim = new RealPlay(id, seed);
  const still = (pid: number) => {
    const q = sim.platforms.find((pl) => pl.id === pid);
    return !!q && q.type !== 'moving' && q.type !== 'drift' && q.type !== 'fragile';
  };
  const floorAt = (x: number, y: number) => sim.platforms.find((q) => !q.broken && x >= q.x && x <= q.x + q.width && Math.abs(q.y - y) < 3);
  const out: Array<{ x: number; y: number; frames: number; ms: number; wide: boolean }> = [];
  const pick = edges.filter((e) => e.good && e.good.running && e.good.land && still(e.good.land.id) && e.good.dir !== 0).sort((a, b) => a.sr - b.sr || a.t - b.t).slice(0, max);
  for (const e of pick) {
    const g = e.good!;
    const dir = g.dir as -1 | 1;
    const from = floorAt(g.x, g.y);
    if (!from || !still(from.id)) continue;
    const run = Math.min(150, dir > 0 ? g.x - from.x - 4 : from.x + from.width - g.x - 4);
    if (run < 40) continue;
    const sx = g.x - dir * run;
    const side: Pad = dir > 0 ? { right: true } : { left: true };
    // frames of walking until he is where he took off
    sim.stand(sx, from.y);
    let n0 = 0;
    while (n0 < 45 && (sim.p.x - g.x) * dir < 0) {
      sim.frame(side);
      n0++;
    }
    const holdF = Math.max(2, Math.round(g.hold / DT));
    const tryAt = (n: number): boolean => {
      if (n < 1) return false;
      sim.stand(sx, from.y);
      for (let i = 0; i < n; i++) sim.frame(side);
      let air = false, pressed2 = false;
      for (let i = 0; i < 90; i++) {
        const pad: Pad = { ...side };
        if (i === 0) pad.press = true;
        if (i < holdF) pad.jump = true;
        if (g.kind === 'double' && !pressed2 && i > holdF && !sim.p.grounded && sim.p.vy > -80) {
          pressed2 = true;
          pad.press = true;
          pad.jump = true;
        }
        sim.frame(pad);
        if (sim.died) return false;
        if (!sim.p.grounded) air = true;
        else if (air) return sim.standingOn === g.land!.id || (Math.abs(sim.p.y - g.land!.y) < 6 && Math.abs(sim.p.x - g.land!.x) < 160);
      }
      return false;
    };
    if (!tryAt(n0)) continue; // (not reproduced from a fresh start: left out)
    let lo = 0, hi = 0;
    while (hi < 8 && tryAt(n0 + hi + 1)) hi++;
    while (lo < 10 && tryAt(n0 - lo - 1)) lo++;
    const frames = lo + hi + 1;
    out.push({ x: e.x, y: e.y, frames, ms: Math.round(frames * DT * 1000), wide: hi >= 8 || lo >= 10 });
  }
  return out;
}

export interface Gates {
  survival: { gate: number; edges: number; min: number | null; below: Array<{ x: number; y: number; sr: number; tries: number }> };
  window: { gate: number; measured: number; min: { x: number; ms: number } | null; below: Array<{ x: number; ms: number }> };
  stress: { gate: number; peak: number; at: { x: number; t: number } | null; bursts: number };
  backtrack: { gate: [number, number]; route: number | null; bot: number | null };
  turns: { n: number; lag: number };
}

/** the gates for one stage and setting, over all its runs */
export function gatesFor(setting: FirstTimer['setting'], tries: Try[], windows: Array<{ x: number; ms: number }>, route: number | null, bot: number | null, turns: { n: number; lag: number }): Gates {
  const G = GATES[setting];
  const edges = edgesOf(tries);
  // (the research flies 20 bots over each edge; with a few runs an edge needs 3 tries before its rate means anything)
  const counted = edges.filter((e) => e.tries >= 3);
  const below = counted.filter((e) => e.sr < G.survival).map((e) => ({ x: e.x, y: e.y, sr: e.sr, tries: e.tries }));
  const wmin = windows.length ? windows.reduce((a, b) => (b.ms < a.ms ? b : a)) : null;
  return {
    survival: { gate: G.survival, edges: counted.length, min: counted.length ? Math.min(...counted.map((e) => e.sr)) : null, below },
    window: { gate: G.windowMs, measured: windows.length, min: wmin ? { x: wmin.x, ms: wmin.ms } : null, below: windows.filter((w) => w.ms < G.windowMs).map((w) => ({ x: w.x, ms: w.ms })) },
    stress: { gate: G.stress, ...peakStress(edges, G.rest) },
    backtrack: { gate: G.backtrack, route, bot },
    turns,
  };
}

/** Part 2 §8's numbers (Normal's survival is for Worlds 1-5) */
export const GATES = {
  easy: { survival: 0.85, windowMs: 300, stress: 2.5, rest: 2.0, backtrack: [1.0, 1.25] as [number, number] },
  normal: { survival: 0.7, windowMs: 167, stress: 5.5, rest: 1.0, backtrack: [1.15, 1.6] as [number, number] },
} as const;

// ───────────────────────────── one stage, several runs ─────────────────────────────

export interface FTStage {
  id: string;
  who: FirstTimer['name'];
  setting: FirstTimer['setting'];
  seed: number;
  trials: number;
  /** each run (thumb seeds differ), without its tries */
  runs: Array<Omit<FTRun, 'tries'>>;
  gates: Gates;
  windows: Array<{ x: number; y: number; frames: number; ms: number; wide: boolean }>;
  /** the runs' findings, one per spot and kind, worst first, with how many runs had it */
  flags: Array<Flag & { runs: number }>;
  ms: number;
}

/** a stage on one setting: `trials` runs (the same layout, different thumbs), the gates over all of them, the findings merged */
export function firstTimerStage(id: string, seed: number, who: FirstTimer, o: RunOptions & { trials?: number; fresh?: boolean; windows?: number } = {}): FTStage {
  const t0 = Date.now();
  const n = Math.max(1, o.trials ?? 2);
  const runs: FTRun[] = [];
  // (every run starts from the phone as it was: what the first run learned, lessons seen and tips heard, is kept for the next stage)
  if (o.fresh !== false) freshPhone(who.setting);
  const before = phoneState();
  let after = before;
  for (let i = 0; i < n; i++) {
    restorePhone(before);
    runs.push(firstTimer(id, seed, who, { ...o, trial: i, fresh: false }));
    if (i === 0) after = phoneState();
  }
  restorePhone(after);
  const tries = runs.flatMap((r) => r.tries);
  const windows = o.windows === 0 ? [] : inputWindows(id, seed, who, edgesOf(tries), o.windows ?? 12);
  const done = runs.filter((r) => r.backtrack.bot !== null);
  const gates = gatesFor(who.setting, tries, windows, runs[0].backtrack.route, done.length ? +(done.reduce((a, r) => a + r.backtrack.bot!, 0) / done.length).toFixed(2) : null, {
    n: Math.round(runs.reduce((a, r) => a + r.turns.n, 0) / n),
    lag: +(runs.reduce((a, r) => a + r.turns.lag, 0) / n).toFixed(1),
  });
  // the findings: the same kind at the same spot (within 200 px) in several runs is one finding
  const merged: Array<Flag & { runs: number }> = [];
  runs.forEach((r) => {
    const mine = new Set<Flag & { runs: number }>();
    for (const f of r.flags) {
      const textKey = f.what.replace(/[\d.]+/g, '#');
      const m = merged.find((q) => !mine.has(q) && q.rule === f.rule && q.kind === f.kind && (f.x === null || q.x === null ? f.x === q.x && (f.x !== null || q.what.replace(/[\d.]+/g, '#') === textKey || f.kind.startsWith('dot') || f.kind === 'harm-rate' || f.kind === 'unfinished') : Math.abs(q.x - f.x) < 200));
      if (m) {
        m.runs++;
        mine.add(m);
        if (f.sev > m.sev) Object.assign(m, f, { runs: m.runs });
      } else {
        const q = { ...f, runs: 1 };
        merged.push(q);
        mine.add(q);
      }
    }
  });
  for (const f of gateFlags(gates, who.setting)) merged.push({ ...f, runs: n });
  const score = (f: Flag & { runs: number }) => f.sev * (0.6 + 0.4 * (f.runs / n));
  merged.sort((a, b) => score(b) - score(a));
  // (at most 4 of one kind: the rest are named in one line)
  const flags: Array<Flag & { runs: number }> = [];
  const byKind = new Map<string, Array<Flag & { runs: number }>>();
  for (const f of merged) {
    const k = `${f.rule}|${f.kind}`;
    const list = byKind.get(k) ?? [];
    list.push(f);
    byKind.set(k, list);
    if (list.length <= 4) flags.push(f);
  }
  for (const list of byKind.values()) {
    if (list.length <= 4) continue;
    const rest = list.slice(4);
    const xs = rest.map((f) => f.x).filter((x): x is number => x !== null);
    flags.push({ ...rest[0], sev: rest[0].sev - 5, x: null, t: null, what: `and ${rest.length} more like that${xs.length ? ` (x ${xs.slice(0, 8).join(', ')}${xs.length > 8 ? '...' : ''})` : ''}` });
  }
  flags.sort((a, b) => score(b) - score(a));
  return { id, who: who.name, setting: who.setting, seed, trials: n, runs: runs.map(({ tries: _t, ...r }) => r), gates, windows, flags, ms: Date.now() - t0 };
}

/** findings from the gates */
export function gateFlags(g: Gates, setting: FirstTimer['setting']): Flag[] {
  const f: Flag[] = [];
  const pct = (v: number) => `${Math.round(v * 100)}%`;
  for (const b of g.survival.below.slice(0, 6)) f.push({ sev: 40 + 20 * (1 - b.sr / g.survival.gate), kind: 'gate-survival', rule: 'survival', x: b.x, t: null, what: `a jump he gets over ${pct(b.sr)} of the time (${b.tries} tries; gate ${pct(g.survival.gate)} on ${setting === 'easy' ? 'Easy' : 'Normal'})` });
  for (const w of g.window.below.slice(0, 4)) f.push({ sev: 38 + Math.min(12, (g.window.gate - w.ms) / 20), kind: 'gate-window', rule: 'window', x: w.x, t: null, what: `a jump whose press works only within ${w.ms} ms (gate ${g.window.gate} ms)` });
  if (g.stress.peak > g.stress.gate) f.push({ sev: 36, kind: 'gate-stress', rule: 'stress', x: g.stress.at?.x ?? null, t: g.stress.at?.t ?? null, what: `a burst of jumps with stress ${g.stress.peak} before a rest (gate ${g.stress.gate})` });
  const r = g.backtrack.route;
  // (only too long a path is a finding: a straight run under Normal's 1.15 is shown, not flagged)
  if (r !== null && r > g.backtrack.gate[1] + 0.005) f.push({ sev: 18, kind: 'gate-backtrack', rule: 'backtrack', x: null, t: null, what: `the main route is ${r} times the straight line from start to shrine (gate ${g.backtrack.gate[0]}-${g.backtrack.gate[1]})` });
  return f;
}
