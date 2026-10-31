/**
 * The look-alike measure (STAGE-RULES §2 "Sameness": no two stages of a world share a 20 s stretch that plays alike). One measure,
 * imported by the 200-roll tool (era.ts, eraRoll.ts) and by seed curation (tools/gen2/curate.ts `--apart`); never mirror it.
 *
 * The first measure (analyze.ts `windows`) compared 20 s windows of the seven action letters (h J V C Z P, W for walking). Its alphabet
 * was too small: every swing or creek stretch is "JVVJVhV" to it, so in World 6 every roll of 6-3 matched 6-1 and 98% of 6-4 matched
 * 6-2 (2026-10-29). A player tells those stretches apart by what each move is, not only which letter: a hop up a step against a
 * second jump over water, a liana against a climb, a caiman against a frog, the dark against the tide. So each beat carries a kind
 * (its letter, then what it is), and two beats of one letter cost a share of a full swap by how much they differ:
 *
 * - jumps and hops: the size (a small hop / a jump / a jump that needs the second press / a glide, a bounce, a moving landing),
 *   the height (up a step, level, down) and what is under the gap (a floor to land on, or water or a pit that costs a life);
 * - swings and climbs: liana, climb, rope, lift, warm air; a liana by its height and what is under it, like a jump;
 * - animals: by kind (a caiman is not a frog);
 * - timed hazards and the mechanic in play: by kind (dark, tide, wind, crumbling, watched stretches...);
 * - puzzles: by kind (a puzzle room by its room).
 *
 * Swapping letters costs Gemini's matrix (reference/GEMINI-PCG-RESEARCH.md Part 3 §2.A): the weight difference, plus 1.5 between
 * categories (a jump against a swing), never more than deleting one and inserting the other. Inserting or deleting a beat costs its
 * weight; the distance is the weighted edit distance over the heavier window's weight, as before. Walks stay in the windows as W
 * (0.2 each 1.5 s), so a stretch with long walks between its beats reads apart from a packed one (the rhythm).
 *
 * The threshold (`LOOK.alike`, 0.30) was set by judgement on window pairs of Worlds 1-6 (reference/prop-sheets/qa-notes/lookalike/:
 * README.md, pairs.json; lookalike.test.ts holds them): every pair judged alike sits under it, every pair judged different over it,
 * with 0.28-0.32 the grey band where the two kinds of pair meet.
 */
import { JUMP_RISE, reachJump } from '../../src/game/physics.ts';
import type { Beat, Letter } from './beats.ts';
import { WEIGHT } from './beats.ts';
import type { Seg } from './route.ts';
import type { Stage } from './stages.ts';

export const LOOK = {
  /** two 20 s windows closer than this play alike (set from the calibration pairs, 2026-10-29; Gemini's first guess was 0.28 on the
   *  letters alone) */
  alike: 0.3,
  /** a window: 20 s, one starting every 2 s; one whose beats (walks left out) weigh under 6 is mostly walking and is not compared */
  span: 20,
  step: 2,
  minWeight: 6,
  /** seconds of walking per W */
  walk: 1.5,
};

/** a beat's kind: its letter, then what it is ("J|second|up|w": a jump up over water that needs the second press; "C|caiman") */
export type Kind = string;

/** the share of a full swap two beats of one letter cost when only these parts differ */
const PART = {
  /** a jump's, hop's or liana's size, height and what is under it */
  size: 0.35,
  height: 0.25,
  under: 0.4,
  /** two different animals, hazards, swings or puzzles */
  other: { C: 0.6, Z: 0.8, V: 0.7, P: 0.8, h: 0.5, J: 0.5, W: 0 } as Record<Letter, number>,
};

/** Gemini's categories: walking, jumps, world moves (swings, climbs), animals, timed hazards, puzzles */
const CAT: Record<Letter, number> = { W: 0, h: 1, J: 1, V: 2, C: 3, Z: 4, P: 5 };

const UNDER = 260;

/** what lies under a jump from (x0, y0) to (x1, y1): 's' a floor to land on, 'w' water, 'p' a pit */
function underOf(st: Stage, s: Seg): 's' | 'w' | 'p' {
  const lo = Math.min(s.x0, s.x1), hi = Math.max(s.x0, s.x1);
  if (hi - lo < 40) return 's';
  const low = Math.max(s.y0, s.y1);
  const floor = st.platforms.some((q) => q !== s.from && q !== s.plat && !q.broken && q.x < hi - 10 && q.x + q.width > lo + 10 && q.y > low && q.y < low + UNDER);
  if (floor) return 's';
  return st.waterY !== undefined ? 'w' : 'p';
}

/** a move's kind: what a player feels (a hop up a step, a long second jump over water, a liana) */
export function moveKind(st: Stage, s: Seg, glideHeld: boolean): Kind | null {
  const rise = s.y0 - s.y1;
  const height = rise > 40 ? 'up' : rise < -60 ? 'down' : 'level';
  const gap = Math.abs(s.x1 - s.x0);
  switch (s.kind) {
    case 'hop': return `h|hop|${height}|s`;
    case 'jump': {
      const second = rise > JUMP_RISE - 6 || gap > reachJump(rise, false);
      return `J|${second ? 'second' : gap < 150 && Math.abs(rise) < 60 ? 'short' : 'jump'}|${height}|${underOf(st, s)}`;
    }
    case 'bounce': return `J|bounce|${height}|${underOf(st, s)}`;
    // (World 9's rafts and logs, lift.ts `bob`: their own kind, apart from a drifting log's)
    case 'timedHop': {
      const bob = s.plat?.lift?.bob ?? s.from?.lift?.bob;
      return `J|${bob ? `bob-${bob}` : 'moving'}|${height}|${underOf(st, s)}`;
    }
    case 'glide': return `J|${glideHeld ? 'glide' : 'jump'}|${height}|${underOf(st, s)}`;
    case 'presumed': return `J|jump|${height}|s`;
    case 'climb': return s.note === 'grab' ? 'V|climb' : null;
    case 'swing': return `V|liana|${height}|${underOf(st, s)}`;
    case 'rope': return 'V|rope';
    case 'lift': return s.plat?.lift?.bob === 'piston' ? 'V|piston' : 'V|lift';
    case 'draft': return 'V|draft';
    default: return null;
  }
}

/** a beat's kind: its own (a move's, beats.ts) or what it says, without the repeats and the numbers ("snake (asleep)" -> "snake") */
export function kindOf(b: Pick<Beat, 'letter' | 'what' | 'k'>): Kind {
  if (b.k) return b.k;
  if (b.letter === 'h') return 'h|arc|level|s';
  const what = b.what
    .replace(/^ring wave \d+: /, '')
    .replace(/\s*\((again|asleep|optional|optional jump)\)/g, '')
    .replace(/\bpuzzle room \(([^)]*?)[-_]?\d*\)/, 'room $1')
    // (the part after a colon is how to deal with it, except a patience spot's: the fern and the mist are two things)
    .replace(/^stand still: /, 'stand still, ')
    .split(':')[0]
    .trim();
  return `${b.letter}|${what}`;
}

// ---- the cost of swapping one kind for another ----

const codes = new Map<Kind, number>();
const parts: Array<{ l: Letter; w: number; f: string[] }> = [];
const subCache = new Map<number, number>();

/** a number per kind (in this process: kinds travel between processes as strings) */
function code(k: Kind): number {
  let c = codes.get(k);
  if (c === undefined) {
    c = codes.size;
    codes.set(k, c);
    const f = k.split('|');
    const l = f[0] as Letter;
    parts.push({ l, w: WEIGHT[l] ?? 1, f: f.slice(1) });
  }
  return c;
}

/** swapping kind a for kind b */
export function swapCost(a: Kind, b: Kind): number {
  return sub(code(a), code(b));
}

function sub(a: number, b: number): number {
  if (a === b) return 0;
  const key = a < b ? a * 65536 + b : b * 65536 + a;
  const hit = subCache.get(key);
  if (hit !== undefined) return hit;
  const A = parts[a], B = parts[b];
  let c: number;
  if (A.l !== B.l) {
    // Gemini's matrix: the weight difference, plus 1.5 between categories; never more than a delete and an insert
    c = Math.min(Math.abs(A.w - B.w) + (CAT[A.l] === CAT[B.l] ? 0 : 1.5), A.w + B.w);
  } else if (A.f.length === 3 && B.f.length === 3) {
    // a jump, a hop or a liana: [move, height, under] (the size is the move: a hop, a short jump, a jump, a second jump, a glide...)
    const share = (A.f[0] !== B.f[0] ? PART.size : 0) + (A.f[1] !== B.f[1] ? PART.height : 0) + (A.f[2] !== B.f[2] ? PART.under : 0);
    c = Math.min(1, share) * A.w;
  } else {
    c = PART.other[A.l] * A.w;
  }
  subCache.set(key, c);
  return c;
}

// ---- windows ----

export interface LookWin {
  /** the window's start (s) */
  t: number;
  /** its beats' kinds in order, walks as "W" */
  s: Kind[];
  /** their summed weight */
  w: number;
}

/** the beats as kinds in order, with a W for every 1.5 s of walking between them (analyze.ts actionTokens, with each beat's kind) */
export function lookTokens(beats: Beat[], total: number): Array<{ k: Kind; l: Letter; t: number }> {
  const out: Array<{ k: Kind; l: Letter; t: number }> = [];
  let end = 0;
  const walks = (t0: number, t1: number) => {
    const n = Math.floor((t1 - t0) / LOOK.walk);
    for (let i = 0; i < n; i++) out.push({ k: 'W', l: 'W', t: t0 + i * LOOK.walk });
  };
  for (const b of beats) {
    walks(end, b.t);
    out.push({ k: kindOf(b), l: b.letter, t: b.t });
    end = Math.max(end, b.t + b.dur + b.act);
  }
  walks(end, total);
  return out;
}

/** 20 s windows, one every 2 s (a mostly-walking one left out: two quiet stretches always look alike, and dead time is its own rule) */
export function lookWindows(beats: Beat[], total: number): LookWin[] {
  const toks = lookTokens(beats, total);
  const out: LookWin[] = [];
  for (let t = 0; t + LOOK.span <= Math.max(total, LOOK.span); t += LOOK.step) {
    const s = toks.filter((x) => x.t >= t && x.t < t + LOOK.span);
    const w = s.reduce((sum, x) => sum + WEIGHT[x.l], 0);
    if (w - WEIGHT.W * s.filter((x) => x.l === 'W').length >= LOOK.minWeight) out.push({ t, s: s.map((x) => x.k), w });
  }
  return out;
}

/** the weighted edit distance between two windows' beats, over the heavier window's weight (0 the same, 1 nothing in common) */
export function lookDistance(a: LookWin, b: LookWin): number {
  const A = a.s.map(code), B = b.s.map(code);
  const n = A.length, m = B.length;
  let prev = new Float64Array(m + 1);
  let cur = new Float64Array(m + 1);
  for (let j = 1; j <= m; j++) prev[j] = prev[j - 1] + parts[B[j - 1]].w;
  for (let i = 1; i <= n; i++) {
    const wa = parts[A[i - 1]].w;
    cur[0] = prev[0] + wa;
    for (let j = 1; j <= m; j++) {
      cur[j] = Math.min(prev[j - 1] + sub(A[i - 1], B[j - 1]), prev[j] + wa, cur[j - 1] + parts[B[j - 1]].w);
    }
    [prev, cur] = [cur, prev];
  }
  return prev[m] / Math.max(a.w, b.w);
}

export interface Closest { d: number; ta: number; tb: number; sa: string; sb: string }

/**
 * The closest pair of windows between two stages (or two rolls). With `below`, it stops at the first pair under it (enough to know
 * the two are alike). The weight difference over the heavier weight is a lower bound on the distance (a swap never costs less than
 * the weight difference), so pairs that can't beat the best so far are skipped.
 */
export function closestLook(a: LookWin[], b: LookWin[], below?: number): Closest | null {
  let best: Closest | null = null;
  for (const x of a) for (const y of b) {
    if (best && Math.abs(x.w - y.w) / Math.max(x.w, y.w) >= best.d) continue;
    const d = lookDistance(x, y);
    if (!best || d < best.d) {
      best = { d, ta: x.t, tb: y.t, sa: x.s.join(' '), sb: y.s.join(' ') };
      if (below !== undefined && d < below) return best;
    }
  }
  return best;
}

/** two stages' (or rolls') windows share a 20 s stretch that plays alike */
export const looksAlike = (a: LookWin[], b: LookWin[], below = LOOK.alike) => {
  const c = closestLook(a, b, below);
  return !!c && c.d < below;
};
