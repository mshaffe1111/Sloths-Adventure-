/**
 * The fun validator's core (fun-validator, PLAN-TO-80 Phase A.1; R-150.1 grown into the research's validator, R-150.4's table beside it).
 *
 * Every stage comes from the real engine (D19): RealPlay builds it the way the game does on entry (generateStage, withGoals, easyStage
 * on Easy; the layout number set as the player's roll), and the inspector's quick route and beats (tools/inspect/route.ts, beats.ts)
 * turn it into moves. Nothing here lays out a stage of its own.
 *
 * The move string (research 2026-11-04 §7, PLAN-TO-80 A.1): J jump, V vine (liana), B branch (breaking), W wind, S slow (webs, spores,
 * sleepy things), C climb, P puzzle, and the tags this game needs on top: M mushroom bounce, R rope, F fight (an animal on the way),
 * E eagle (or any watcher), D dark, X river or moving logs; J is a jump with a real fall under it and j a safe one (the inspector's
 * 'hop': a floor within 200 px under a gap under 200 px, route.ts), h a hop up a step (a bump in the walk, not a move of its own).
 */
import '../../src/game/headlessDom.ts';
import { RealPlay } from '../../src/game/realPlay.ts';
import { setDifficulty } from '../../src/game/difficulty.ts';
import { type Route } from '../inspect/route.ts';
import { pickRoute } from '../inspect/eraRoll.ts';
import { type Beat, type Sample } from '../inspect/beats.ts';
import type { Stage } from '../inspect/stages.ts';

export type Move = 'J' | 'j' | 'Q' | 'V' | 'B' | 'W' | 'S' | 'C' | 'P' | 'M' | 'R' | 'F' | 'E' | 'D' | 'X' | 'h' | 'Z';
export interface Step {
  m: Move;
  /** seconds from the start on the quick route's clock (the inspector's beat clock: movement plus fights and waits) */
  t: number;
  x: number;
  y: number;
  what: string;
}
export type Setting = 'normal' | 'easy';

/** what each move letter means, for the pages */
export const MOVE_NAMES: Record<Move, string> = {
  J: 'jump (a real fall under it)', j: 'safe hop over a gap', Q: "jump the level check can't confirm (usually a mushroom wall)", V: 'vine swing', B: 'breaking branch', W: 'wind', S: 'slow-down', C: 'climb', P: 'puzzle', M: 'mushroom bounce', R: 'rope',
  F: 'fight an animal', E: 'eagle / watcher', D: 'dark', X: 'river / moving logs', h: 'small hop', Z: 'other timed hazard',
};

/** a beat's move letter, from what the inspector says it is (beats.ts `what`), one to one */
export function moveOf(b: Pick<Beat, 'letter' | 'what' | 'count'>): Move | null {
  const w = b.what;
  if (b.count < 1) return null; // (an optional pickup arc off the route: not a move the stage asks for)
  if (/mushroom bounce/.test(w)) return 'M';
  if (/moving log|river/.test(w)) return 'X';
  if (/jump the level check cannot confirm/.test(w)) return 'Q';
  if (/^(jump over a gap|big jump up|long jump|leaf glide)/.test(w)) return 'J';
  if (/small hop/.test(w)) return 'j';
  if (/hop up a step/.test(w)) return 'h';
  if (/trunk or vine and climb/.test(w)) return 'C';
  if (/liana|basket lift|warm air/.test(w)) return 'V';
  if (/rope/.test(w)) return 'R';
  if (/crumbling|collapses behind/.test(w)) return 'B';
  if (/wind/.test(w)) return 'W';
  if (/web|spore|sleep|slow/.test(w)) return 'S';
  if (/eagle sweep|watching|eaglets|sleeping bats/.test(w)) return 'E';
  if (/dark/.test(w)) return 'D';
  if (b.letter === 'C') return 'F';
  if (b.letter === 'P') return 'P';
  if (b.letter === 'J') return 'J';
  if (b.letter === 'V') return 'V';
  return 'Z';
}

export interface Built {
  id: string;
  layout: number;
  setting: Setting;
  sim: RealPlay;
  stage: Stage;
  route: Route;
  samples: Sample[];
  beats: Beat[];
  total: number;
  steps: Step[];
}

/** the stage as the engine builds it on entry (D19), its quick route and its moves */
export function build(id: string, layout: number, setting: Setting): Built & { quick: Step[] } {
  setDifficulty(setting);
  const sim = new RealPlay(id, layout);
  const stage = sim.stage as Stage;
  return fromStage(id, layout, setting, sim, stage);
}

/**
 * the route, beats and moves of a stage already built (a bare fixture world goes through here too). The route is the inspector's own
 * choice (eraRoll.ts pickRoute): through the goal's pickups, animals or cages where the stage has a goal, so the moves are what a player
 * who meets the goal does. `quick`: the plain quick route to the shrine, kept to show what holding right alone asks.
 */
export function fromStage(id: string, layout: number, setting: Setting, sim: RealPlay, stage: Stage): Built & { quick: Step[] } {
  const pick = pickRoute(stage.config.objectiveType, stage);
  const { route, samples, br } = pick.used;
  const toSteps = (beats: readonly Beat[]) => {
    const steps: Step[] = [];
    for (const b of beats) {
      const m = moveOf(b);
      if (m) steps.push({ m, t: b.t, x: Math.round(b.x), y: Math.round(b.y), what: b.what });
    }
    return steps.sort((a, b) => a.t - b.t);
  };
  return { id, layout, setting, sim, stage, route, samples, beats: br.beats, total: br.total, steps: toSteps(br.beats), quick: toSteps(pick.quick.br.beats) };
}

/** the move string (small hops left out: they are walking with a bump in it, research §7's letters are the moves that count) */
export const moveString = (steps: readonly Step[]) => steps.filter((s) => s.m !== 'h').map((s) => s.m).join('');

// ---------------------------------------------------------------------------------------------------------------------------------
// Checks on the move list (pure)

/** research §1: no dead walk over 2.5 s (no move, small hops included as a bump that breaks it) */
export const DEAD_WALK = 2.5;
/**
 * the rest pad §0b.1 asks for after a rhythm group is not dead time (the quality supervisor, 2026-11-04): a gap straight after a group
 * (3 or more moves in the 6 s before it) has this many seconds taken off before it is judged
 */
export const REST_PAD = 2.5;
export interface DeadWalk { t0: number; t1: number; x0: number; x1: number; secs: number; pad: boolean }
/** the stretches of the route over DEAD_WALK s with no move at all, rest pads after a group taken off (start to first move and last to
 *  the shrine count) */
export function deadWalks(steps: readonly Step[], total: number, samples: readonly Sample[], limit = DEAD_WALK): DeadWalk[] {
  const ts = [0, ...steps.map((s) => s.t), total];
  const xAt = (t: number) => {
    // (the route's x at a time on the beat clock: near enough from the samples' movement clock for a page's "where")
    let best = samples[0];
    for (const s of samples) if (s.base <= t) best = s;
    return Math.round(best?.x ?? 0);
  };
  const out: DeadWalk[] = [];
  for (let i = 1; i < ts.length; i++) {
    const t0 = ts[i - 1], t1 = ts[i];
    const pad = steps.filter((s) => s.m !== 'h' && s.t <= t0 && s.t > t0 - 6).length >= 3;
    const secs = t1 - t0 - (pad ? REST_PAD : 0);
    if (secs > limit) out.push({ t0, t1, x0: xAt(t0), x1: xAt(t1), secs: +secs.toFixed(1), pad });
  }
  return out;
}

/** §0.3 and research §7: the same 4-move run more than 3 times in a stage, or a 3-move run back to back 3 or more times */
export const RUN4_MAX = 3;
export const RUN3_BACK = 3;
export interface RepeatFlag { kind: '4-run' | '3-back'; run: string; n: number; at: number[] }
export function repeats(str: string, steps: readonly Step[]): RepeatFlag[] {
  const moves = steps.filter((s) => s.m !== 'h');
  const out: RepeatFlag[] = [];
  // the same 4-move run, anywhere in the stage, counted without overlaps
  const seen = new Map<string, number[]>();
  for (let i = 0; i + 4 <= str.length; i++) {
    const k = str.slice(i, i + 4);
    const at = seen.get(k) ?? [];
    if (!at.length || i >= at[at.length - 1] + 4) at.push(i);
    seen.set(k, at);
  }
  for (const [run, at] of seen) if (at.length > RUN4_MAX && new Set(run).size > 1) out.push({ kind: '4-run', run, n: at.length, at: at.map((i) => moves[i].x) });
  // (a run of one move, JJJJ, is the same idea at its plainest: counted as a 3-run back to back below)
  // a 3-move run repeated back to back
  for (let i = 0; i + 3 <= str.length; ) {
    const k = str.slice(i, i + 3);
    let n = 1;
    while (str.slice(i + 3 * n, i + 3 * n + 3) === k) n++;
    if (n >= RUN3_BACK) {
      out.push({ kind: '3-back', run: k, n, at: [moves[i].x] });
      i += 3 * n;
    } else i++;
  }
  return out;
}

/**
 * the move 3-grams of a string, counted. A safe hop and a jump read as the same move here (a player feels both as "jump"; whether a miss
 * costs anything is the miss-cost check's job, mechanics.ts), so 1-2's safe hops and 1-1's jumps are compared as what they are.
 */
export function grams(str0: string, n = 3): Map<string, number> {
  const str = str0.replace(/[jQ]/g, 'J');
  const m = new Map<string, number>();
  for (let i = 0; i + n <= str.length; i++) m.set(str.slice(i, i + n), (m.get(str.slice(i, i + n)) ?? 0) + 1);
  return m;
}
export function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0, na = 0, nb = 0;
  for (const [k, v] of a) {
    na += v * v;
    dot += v * (b.get(k) ?? 0);
  }
  for (const v of b.values()) nb += v * v;
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}
/** research §1: each stage at least 45% different from the ones before it, so over this similarity is a flag */
export const SIMILAR_MAX = 0.55;

// ---------------------------------------------------------------------------------------------------------------------------------
// Pacing tags (research §1: I intro, F flow, P puzzle, T tight, R rest; never T-T or P-P; STAGE-RULES §0b.1 a rest between groups)

export type Pace = 'I' | 'F' | 'P' | 'T' | 'R';
export interface Stretch { tag: Pace; t0: number; t1: number; moves: string; perSec: number }
/** the window the pacing is read in (research §1 / §0b.1: rhythm groups last 5, 10, 15 or 20 s) */
export const PACE_WIN = 5;
/** moves a second from which a window is tight (Gemini's Normal density table tops out at 1.15 a second: STAGE-RULES §2 "Pacing") */
export const TIGHT_RATE = 1.15;
/** the opening windows are the stage's intro while they hold no more than this many moves a second, up to 15 s in */
export const INTRO_RATE = 0.8;
export const INTRO_SECS = 15;
/** §0b.1: a group lasts 5-20 s, then a rest */
export const GROUP_MAX = 20;
/** a tight burst longer than this is two tight bits in a row (research: never T-T; Gemini's bursts run 10-14 s on Normal) */
export const TIGHT_MAX = 15;

/** the stage read in PACE_WIN-second windows, each tagged, and runs of one tag joined into stretches */
export function pacing(steps: readonly Step[], total: number): Stretch[] {
  const moves = steps.filter((s) => s.m !== 'h');
  const wins: Stretch[] = [];
  for (let t0 = 0; t0 < total; t0 += PACE_WIN) {
    const t1 = Math.min(total, t0 + PACE_WIN);
    const inside = moves.filter((s) => s.t >= t0 && s.t < t1);
    const perSec = inside.length / Math.max(1, t1 - t0);
    const tag: Pace = inside.some((s) => s.m === 'P') ? 'P' : !inside.length ? 'R' : perSec > TIGHT_RATE ? 'T'
      : t1 <= INTRO_SECS && perSec <= INTRO_RATE && !wins.some((w) => w.tag !== 'I') ? 'I' : 'F';
    wins.push({ tag, t0, t1, moves: inside.map((s) => s.m).join(''), perSec });
  }
  const out: Stretch[] = [];
  for (const w of wins) {
    const l = out[out.length - 1];
    if (l && l.tag === w.tag) {
      l.t1 = w.t1;
      l.moves += w.moves;
    } else out.push({ ...w });
  }
  for (const s of out) s.perSec = +(s.moves.length / Math.max(1, s.t1 - s.t0)).toFixed(2);
  return out;
}

/** the pacing strip, one letter a window */
export const pacingStrip = (st: readonly Stretch[]) => st.map((s) => s.tag.repeat(Math.max(1, Math.round((s.t1 - s.t0) / PACE_WIN)))).join('');

export interface PaceFlag { what: string; t: number }
export function paceFlags(st: readonly Stretch[]): PaceFlag[] {
  const out: PaceFlag[] = [];
  for (const s of st) {
    const len = s.t1 - s.t0;
    if (s.tag === 'T' && len > TIGHT_MAX) out.push({ what: `a tight burst of ${Math.round(len)} s with no let-up (two tight bits in a row; research: never T-T)`, t: s.t0 });
    if ((s.tag === 'F' || s.tag === 'T') && len > GROUP_MAX) out.push({ what: `${Math.round(len)} s of moves with no rest (§0b.1: groups of 5-20 s, a rest between)`, t: s.t0 });
  }
  const groups = st.filter((s) => s.tag !== 'R');
  if (groups.length < 4) out.push({ what: `only ${groups.length} groups of moves (§0b.2: four parts, introduce, develop, twist, master)`, t: 0 });
  if (!st.some((s) => s.tag === 'T')) out.push({ what: 'never tight: no 5 s window asks for more than about one move a second (no burst, no climax)', t: 0 });
  if (!st.some((s) => s.tag === 'I')) out.push({ what: 'no gentle intro: the first 15 s already ask for more than 0.8 moves a second', t: 0 });
  const rests = st.filter((s) => s.tag === 'R');
  const restSecs = rests.reduce((a, s) => a + s.t1 - s.t0, 0);
  const total = st.length ? st[st.length - 1].t1 : 1;
  if (restSecs / total > 0.35) out.push({ what: `${Math.round((100 * restSecs) / total)}% of the stage is 5 s windows with no move at all`, t: 0 });
  return out;
}
