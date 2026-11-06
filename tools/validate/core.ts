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
import { reachJump, TAKEOFF_SLACK } from '../../src/game/physics.ts';
import { type Beat, type Sample } from '../inspect/beats.ts';
import type { Stage } from '../inspect/stages.ts';

export type Move = 'J' | 'j' | 'U' | 'Q' | 'V' | 'B' | 'K' | 'W' | 'S' | 'C' | 'P' | 'M' | 'R' | 'F' | 'N' | 'O' | 'Y' | 'G' | 'E' | 'D' | 'X' | 'h' | 'Z';
export interface Step {
  m: Move;
  /** seconds from the start on the quick route's clock (the inspector's beat clock: movement plus fights and waits) */
  t: number;
  x: number;
  y: number;
  what: string;
  /** seconds a fight keeps him busy from this step on (an animal met: punched, kicked, stomped; the beat's own fight time) */
  fight?: number;
}
export type Setting = 'normal' | 'easy';

/** what each move letter means, for the pages */
export const MOVE_NAMES: Record<Move, string> = {
  J: 'jump (a real fall under it)', j: 'safe hop over a gap', U: 'jump twice (a gap or rise only the second jump covers)', Q: "jump the level check can't confirm", V: 'vine swing', B: 'breaking branch', K: 'the chase: the branch collapses behind him', W: 'wind', S: 'slow-down', C: 'climb', P: 'puzzle', M: 'mushroom bounce', R: 'rope',
  F: 'fight an animal', N: 'daze a snake, then stomp it (World 1)', O: 'kick a coiled boa to roll it (World 1)', Y: 'stomp vault off a snake (World 1)', G: 'a vine snake: punch it stiff, then climb its liana (World 1)', E: 'eagle / watcher', D: 'dark', X: 'river / moving logs', h: 'small hop', Z: 'other timed hazard',
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
  // (the chase's collapse is its own move, not a breaking branch: the quality supervisor, 11-04, 1-8's string read 114 B's while its
  // hazard table said "no breaking branches")
  if (/collapses behind/.test(w)) return 'K';
  if (/crumbling/.test(w)) return 'B';
  if (/wind/.test(w)) return 'W';
  if (/web|spore|sleep|slow/.test(w)) return 'S';
  if (/eagle sweep|watching|eaglets|sleeping bats/.test(w)) return 'E';
  if (/dark/.test(w)) return 'D';
  if (b.letter === 'C' && /\(vine snake: punched stiff\)/.test(w)) return 'G';
  if (b.letter === 'C' && /\(stomp vault\)/.test(w)) return 'Y';
  if (b.letter === 'C' && /\(dazed, then stomped\)/.test(w)) return 'N';
  if (b.letter === 'C' && /\(coiled: kicked to roll\)/.test(w)) return 'O';
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
  // (a jump the level check can't confirm, by what the stage data shows at it: a mushroom at the take-off is a bounce (M); a gap or a rise
  // only the second jump covers is a double jump (U: 1-1 teaches it, and the check doesn't allow it there); Q only for what is truly
  // unknown. The quality supervisor, 11-04, asked for M from the pieces; 1-1's turned out mostly double jumps, by their geometry)
  const shrooms = stage.platforms.filter((p) => p.type === 'bouncy' && !p.broken);
  // (World 1's mushroom pieces put the mushroom up to a run-up before the leap the check can't confirm: highLeaps, bounceWall)
  const mushroomAt = (x: number, y: number) => shrooms.some((p) => x >= p.x - 90 && x <= p.x + p.width + 250 && Math.abs(p.y - y) <= 60);
  const segAt = (x: number, y: number) => route.segs.find((g) => Math.abs(g.x0 - x) < 3 && Math.abs(g.y0 - y) < 3);
  const kindOfQ = (x: number, y: number): Move => {
    if (mushroomAt(x, y)) return 'M';
    const g = segAt(x, y);
    if (!g) return 'Q';
    // (or a mushroom under the leap's span: the route links the floor straight to the branch past it)
    const lo = Math.min(g.x0, g.x1), hi = Math.max(g.x0, g.x1);
    if (shrooms.some((p) => p.x + p.width >= lo - 20 && p.x <= hi + 20 && p.y >= Math.min(g.y0, g.y1) && p.y <= Math.max(g.y0, g.y1) + 40)) return 'M';
    const gap = Math.abs(g.x1 - g.x0), rise = g.y0 - g.y1;
    const one = reachJump(rise, false), two = reachJump(rise, true);
    const fits = (r: number) => r >= 0 && gap <= r * 0.97 - (gap > 0 ? TAKEOFF_SLACK : 0) + 1;
    if (!fits(one) && fits(two)) return 'U';
    if (fits(one)) return 'J';
    return 'Q';
  };
  const toSteps = (beats: readonly Beat[]) => {
    const steps: Step[] = [];
    for (const b of beats) {
      let m = moveOf(b);
      let what = b.what;
      if (m === 'Q') {
        m = kindOfQ(b.x, b.y);
        if (m === 'M') what = 'mushroom bounce (the level check takes it on trust)';
        else if (m === 'U') what = 'jump twice (the level check takes it on trust)';
        else if (m === 'J') what = 'jump (the level check takes it on trust)';
      }
      if (m) steps.push({ m, t: b.t, x: Math.round(b.x), y: Math.round(b.y), what, ...(b.letter === 'C' && b.dur > 0 ? { fight: b.dur } : {}) });
    }
    return steps.sort((a, b) => a.t - b.t);
  };
  return { id, layout, setting, sim, stage, route, samples, beats: br.beats, total: br.total, steps: toSteps(br.beats), quick: toSteps(pick.quick.br.beats) };
}

/** the move string (small hops left out: they are walking with a bump in it, research §7's letters are the moves that count) */
export const moveString = (steps: readonly Step[]) => steps.filter((s) => s.m !== 'h').map((s) => s.m).join('');
/** each move's way, in moveString's order: u (up), d (down) or f (flat), from where the next move starts (the same as rhythmTokens) */
export const moveDirs = (steps: readonly Step[]) => {
  const moves = steps.filter((s) => s.m !== 'h');
  return moves.map((s, i) => { const dy = moves[i + 1] ? moves[i + 1].y - s.y : 0; return dy < -15 ? 'u' : dy > 15 ? 'd' : 'f'; }).join('');
};

// ---------------------------------------------------------------------------------------------------------------------------------
// Checks on the move list (pure)

/** research §1: no dead walk over 2.5 s (no move, small hops included as a bump that breaks it) */
export const DEAD_WALK = 2.5;
/**
 * the rest pad §0b.1 asks for after a rhythm group is not dead time (the quality supervisor, 2026-11-04): a gap straight after a group
 * (3 or more moves in the 6 s before it) has this many seconds taken off before it is judged
 */
export const REST_PAD = 2.5;
export interface DeadWalk { t0: number; t1: number; x0: number; x1: number; secs: number; pad: boolean; busy: number }
/**
 * the route's moves that keep the thumb working the whole way (a climb, a rope, a swing, a glide): the time on them is not walking. A step
 * is where one starts, so without this a 3 s climb read as 3 s of walking (the quality supervisor, 2026-11-04: 1-4's 3.7 s "dead walks"
 * 228 px apart were its trunk climbs)
 */
const BUSY_KINDS = new Set(['climb', 'rope', 'swing', 'glide']);
/** seconds on the route's movement clock between t0 and t1 spent on a BUSY_KINDS move */
function busyBetween(samples: readonly Sample[], t0: number, t1: number): number {
  let busy = 0;
  for (let i = 0; i + 1 < samples.length; i++) {
    const a = samples[i], b = samples[i + 1];
    if (!a.seg || !BUSY_KINDS.has(a.seg.kind)) continue;
    const lo = Math.max(t0, a.base), hi = Math.min(t1, b.base);
    if (hi > lo) busy += hi - lo;
  }
  return busy;
}
/** the stretches of the route over DEAD_WALK s with no move at all, rest pads after a group taken off (start to first move and last to
 *  the shrine count), time climbing or on a rope taken off */
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
    // (a fight met at t0 is the player busy, not walking: the lead's ruling (b), 2026-11-05; 1-5's teach boa, a 2 s fight, read as a
    // dead walk after it)
    const fought = Math.min(t1 - t0, steps.filter((s) => s.t === t0).reduce((n, s) => n + (s.fight ?? 0), 0));
    const busy = busyBetween(samples, t0, t1) + fought;
    const secs = t1 - t0 - busy - (pad ? REST_PAD : 0);
    if (secs > limit) out.push({ t0, t1, x0: xAt(t0), x1: xAt(t1), secs: +secs.toFixed(1), pad, busy: +busy.toFixed(1) });
  }
  return out;
}

/** §0.3 and research §7: the same 4-move run more than 3 times in a stage, or a 3-move run back to back 3 or more times */
export const RUN4_MAX = 3;
export const RUN3_BACK = 3;
export interface RepeatFlag { kind: '4-run' | '3-back'; run: string; n: number; at: number[] }
/**
 * a beat-traced stage's moves as tokens a thumb tells apart (the lead's ruling, 2026-11-04): each move's letter, the note value since the
 * move before it on the stage's beat (q a quarter or less, h a half, w a whole or more) and which way it goes (u up, d down, f level, from
 * where it is to where the next move starts). A hop down on a half note and a jump up on a whole note are not the same move to a thumb.
 */
export function rhythmTokens(steps: readonly Step[], bpm: number): string[] {
  const moves = steps.filter((s) => s.m !== 'h');
  const beat = 60 / bpm;
  return moves.map((s, i) => {
    const dt = i ? (s.t - moves[i - 1].t) / beat : 4;
    const nv = dt < 1.5 ? 'q' : dt < 3 ? 'h' : 'w';
    const next = moves[i + 1];
    const dy = next ? next.y - s.y : 0;
    const dir = dy < -15 ? 'u' : dy > 15 ? 'd' : 'f';
    return `${s.m}${nv}${dir}`;
  });
}

/** `bpm`: a beat-traced stage's beat (its moves are counted as rhythm tokens, rhythmTokens); otherwise the letters alone */
export function repeats(str: string, steps: readonly Step[], bpm?: number): RepeatFlag[] {
  const moves = steps.filter((s) => s.m !== 'h');
  const toks = bpm ? rhythmTokens(steps, bpm) : [...str];
  const key = (i: number, n: number) => toks.slice(i, i + n).join(' ');
  const shown = (i: number, n: number) => str.slice(i, i + n);
  const out: RepeatFlag[] = [];
  // the same 4-move run, anywhere in the stage, counted without overlaps
  const seen = new Map<string, number[]>();
  for (let i = 0; i + 4 <= toks.length; i++) {
    const k = key(i, 4);
    const at = seen.get(k) ?? [];
    if (!at.length || i >= at[at.length - 1] + 4) at.push(i);
    seen.set(k, at);
  }
  for (const [k, at] of seen) if (at.length > RUN4_MAX && new Set(k.split(' ')).size > 1) out.push({ kind: '4-run', run: bpm ? k : shown(at[0], 4), n: at.length, at: at.map((i) => moves[i].x) });
  // (a run of one move, JJJJ, is the same idea at its plainest: counted as a 3-run back to back below)
  // a 3-move run repeated back to back
  for (let i = 0; i + 3 <= toks.length; ) {
    const k = key(i, 3);
    let n = 1;
    while (key(i + 3 * n, 3) === k && i + 3 * n + 3 <= toks.length) n++;
    if (n >= RUN3_BACK) {
      out.push({ kind: '3-back', run: bpm ? k : shown(i, 3), n, at: [moves[i].x] });
      i += 3 * n;
    } else i++;
  }
  return out;
}

/**
 * the move 3-grams of a string, counted. A hop (j), a jump (J) and a double jump (U) are three moves here: a thumb feels them
 * differently (the lead, 2026-11-04: folded into one, every jumping stage read as the same stage, and 1-1's pair, the jump and the
 * double, was invisible). Only a move the check can't name (Q) reads as a jump.
 */
export function grams(str0: string, n = 3, dirs?: string): Map<string, number> {
  const str = str0.replace(/Q/g, 'J');
  // (dirs, moveDirs: the way each move goes. A jump down onto a snap twig and a climb up onto a creaking limb are both B by letter, but a
  // thumb feels them apart; the lead's ruling (a), 2026-11-04: every stage's moves are compared letter and way together)
  const toks = dirs && dirs.length === str.length ? [...str].map((c, i) => c + dirs[i]) : [...str];
  const m = new Map<string, number>();
  for (let i = 0; i + n <= toks.length; i++) { const k = toks.slice(i, i + n).join(''); m.set(k, (m.get(k) ?? 0) + 1); }
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
/**
 * a burst, as the research defines it (STAGE-RULES §2 "Pacing", the lead's ruling 2026-11-05): on Normal 8-12 actions in 10-14 s, on
 * Easy 3-4 in 6-8 s. The old rule read tight only from 1.15 moves a second, the TOP of Normal's range, and asked it of Easy too, whose
 * whole range is 0.35-0.55 a second. `n` actions (no small step, no search) within `secs`
 */
export const BURST: Record<Setting, { n: number; secs: number }> = { normal: { n: 8, secs: 14 }, easy: { n: 3, secs: 8 } };
/** the stage holds a burst on its setting (BURST): `n` hard moves within `secs` anywhere */
export function hasBurst(steps: readonly Pick<Step, 'm' | 't'>[], setting: Setting): boolean {
  const { n, secs } = BURST[setting];
  const ts = steps.filter((s) => s.m !== 'h' && s.m !== 'P').map((s) => s.t).sort((a, b) => a - b);
  for (let i = 0; i + n - 1 < ts.length; i++) if (ts[i + n - 1] - ts[i] <= secs) return true;
  return false;
}
/** the dense finale a stage may end on (the lead, 2026-11-04): its last group may run tight for up to 20 s, the climax before the shrine */
export const FINALE_TIGHT_MAX = 20;

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
/**
 * a rest pad (STAGE-RULES §2 "Pacing", Gemini's density table): any stretch with no hard input of 1.0-1.2 s or more on Normal, 2.0-2.5 s on
 * Easy, wherever it falls. The lead, 2026-11-04: reading a rest only as an empty 5 s window on a fixed grid pushes builders to long dead
 * walks. A pad from the range's floor counts.
 */
export const REST_PAD_SECS: Record<Setting, number> = { normal: 1.0, easy: 2.0 };
/** the groups of moves between rest pads: [first move's t, last move's t] (small hops are not hard input) */
export function groupsOf(steps: readonly Pick<Step, 'm' | 't'>[], setting: Setting): Array<[number, number]> {
  const ts = steps.filter((s) => s.m !== 'h').map((s) => s.t).sort((a, b) => a - b);
  const out: Array<[number, number]> = [];
  for (const t of ts) {
    const l = out[out.length - 1];
    if (l && t - l[1] < REST_PAD_SECS[setting]) l[1] = t;
    else out.push([t, t]);
  }
  return out;
}

/**
 * pacing flags. truer with `moves` (the stage's steps and setting): a group runs from a rest pad to the next, wherever the pads fall
 * (groupsOf); otherwise, as the gate was built, a rest is a 5 s window with no move.
 */
export function paceFlags(st: readonly Stretch[], truer = true, moves?: { steps: readonly Pick<Step, 'm' | 't'>[]; setting: Setting }): PaceFlag[] {
  const out: PaceFlag[] = [];
  const pads = truer && moves ? groupsOf(moves.steps, moves.setting) : null;
  if (pads) for (const [a, b] of pads) if (b - a > GROUP_MAX) out.push({ what: `${Math.round(b - a)} s of moves with no rest pad of ${REST_PAD_SECS[moves!.setting]} s (§0b.1: groups of 5-20 s, a rest between)`, t: a });
  for (const [i, s] of st.entries()) {
    const len = s.t1 - s.t0;
    // (the last group of moves, nothing but rest after it to the shrine)
    const finale = truer && !st.slice(i + 1).some((q) => q.tag !== 'R');
    if (s.tag === 'T' && len > (finale ? FINALE_TIGHT_MAX : TIGHT_MAX)) out.push({ what: `a tight burst of ${Math.round(len)} s with no let-up (two tight bits in a row; research: never T-T)`, t: s.t0 });
    if (!pads && (s.tag === 'F' || s.tag === 'T') && len > GROUP_MAX) out.push({ what: `${Math.round(len)} s of moves with no rest (§0b.1: groups of 5-20 s, a rest between)`, t: s.t0 });
  }
  const groups = pads ?? st.filter((s) => s.tag !== 'R');
  if (groups.length < 4) out.push({ what: `only ${groups.length} groups of moves (§0b.2: four parts, introduce, develop, twist, master)`, t: 0 });
  // (tight: a 5 s window over about one move a second, or, on the truer rule, a burst as the research defines it for the setting)
  if (!st.some((s) => s.tag === 'T') && !(pads && hasBurst(moves!.steps, moves!.setting))) out.push({ what: pads ? `never tight: no burst (${BURST[moves!.setting].n} moves within ${BURST[moves!.setting].secs} s on ${moves!.setting}, research §2) and no 5 s window over about one move a second` : 'never tight: no 5 s window asks for more than about one move a second (no burst, no climax)', t: 0 });
  if (!st.some((s) => s.tag === 'I')) out.push({ what: 'no gentle intro: the first 15 s already ask for more than 0.8 moves a second', t: 0 });
  const rests = st.filter((s) => s.tag === 'R');
  const restSecs = rests.reduce((a, s) => a + s.t1 - s.t0, 0);
  const total = st.length ? st[st.length - 1].t1 : 1;
  if (restSecs / total > 0.35) out.push({ what: `${Math.round((100 * restSecs) / total)}% of the stage is 5 s windows with no move at all`, t: 0 });
  return out;
}
