/**
 * gen2/chaseLay — B5 CHASE-LAY (ENGINE-678; 1-8.md NEW 1 and 7; R-165.198: any world lays it by data): the job `K` lays a chase.
 *
 * Every `K` (pressure) node of a rolled graph is one STRETCH of the chase, from its first section's left edge to its last one's right
 * edge; whatever the graph lays after it, up to the next `K`, is its LIVING FORK: nothing there falls and the front stops at its edge
 * (chase.ts ChaseLay, run by pieces/chasePiece.ts). The stretch's route ground (the sections' main pieces, plain solid ones) is cut
 * into branch sections about CHASE_LAY.tile wide, each marked `chase`: the cut keeps every piece's top, edges and depth, so the ground
 * he walks is the same union of solids the verdicts judged; only the pieces that fall one by one are new.
 *
 * Flags by Matt's rules (STAGE-RULES:105-109, D49): the chase restarts at the last flag with the branch whole, so a flag inside a
 * stretch is taken out and every fork carries one, on its ground as close before the next crack as the 4,000 px span allows (the
 * respawn right before the hard part); the stage's flags are then judged again by the same verdict every rolled stage meets
 * (pipeline.ts rolledFlagBreaches, run after the lay in buildGen2Stage).
 *
 * A lay that cannot run is refused by name, never laid broken: chaseLayProblems (the piece's own check, chase.ts) and the lay's own
 * (a stretch over `CHASE_LAY.maxLen`, two stretches with no fork between them, a fork too short to stand on, a stretch with no ground
 * to break). Each problem is a roll error, so the seed fails and the proven walk moves on.
 */
import { chaseLayProblems, type ChaseLay, type ChaseStretch } from '../chase.ts';
import type { Platform } from '../types.ts';
import type { Gen2Stage } from './types.ts';
import { FLAG_SPAN, flagRuns, ROLLED_FLAGS } from './pipeline.ts';

export const CHASE_LAY = {
  /** a stretch is at most this long (px; 1-8.md: K "at most 4,000 px", about 14 s at a run) */
  maxLen: 4000,
  /** a fork must give him at least this much ground to stop on (px): about a body and a half each side of a stop */
  forkMin: 300,
  /** the branch sections a stretch's ground is cut into (px): the long-branch sheet's section, as the old 1-8 lays it (protoStage.ts
   *  BRANCH_TILE; a value here, so gen2 never loads the hand builder: chaseLay.test.ts pins them equal) */
  tile: 222,
  /** the first stretch's flag stands this far before its crack at most (px): the respawn within about 2 s of it (§0b.8); a later one
   *  stands on the fork before its crack, as close as Matt's span allows (ROLLED_FLAGS.max from the flag before) */
  flagBefore: 600,
} as const;

/** the job letter's job that lays a chase (nodeLetters.ts K) */
const PRESSURE = 'pressure';

/**
 * A piece the chase may break: plain solid ground, nothing with its own rule or its own painted object (a lift, a ride, a crumble, a
 * creak, a push, a pillar, a hollow, a lily, a drift, a boulder, steps, a post: anything with `art` but the world's painted kit ground)
 */
export function breakable(p: Platform): boolean {
  return p.type === 'solid' && p.width > 0 && !p.lift && !p.ride && p.crumbleAfter === undefined && p.creak === undefined && p.regrowAt === undefined
    && !p.push && !p.crown && !p.chaseTip && p.pillar === undefined && !p.hollow && !p.lily && !p.drift && (p.art === undefined || p.art === 'kit');
}

/** cut one piece into branch sections about `tile` wide, left to right; the first keeps the piece itself (its id and every reference) */
export function cutSections(p: Platform, nextId: () => number, tile: number = CHASE_LAY.tile): Platform[] {
  const n = Math.max(1, Math.round(p.width / tile));
  const w0 = Math.floor(p.width / n);
  const out: Platform[] = [];
  const x0 = p.x, width = p.width;
  for (let k = 0; k < n; k++) {
    const x = x0 + k * w0;
    const w = k === n - 1 ? x0 + width - x : w0;
    if (k === 0) {
      p.width = w;
      p.chase = true;
      out.push(p);
    } else out.push({ ...p, id: nextId(), x, width: w, chase: true });
  }
  return out;
}

export interface ChaseLaid {
  /** the lay, when the graph has a `K` (undefined: no chase, nothing done) */
  lay?: ChaseLay;
  /** what is wrong, by name (empty: laid) */
  problems: string[];
  /** each stretch's node, its fork after it and the flag just before its crack (x), for the report and the tests */
  stretches: Array<ChaseStretch & { node: string; fork: [number, number]; flag?: number }>;
}

/**
 * Lay the chase a rolled stage's graph asks for, in place: cut and mark the stretches' ground, set `st.chase`, move the flags to the
 * forks. `mainOf` names the route pieces each section laid (pipeline.ts keeps them from the lay); a stage whose graph has no `K` is
 * left untouched.
 */
export function layChase(st: Gen2Stage, mainOf: (uid: string) => readonly Platform[]): ChaseLaid {
  const nodes = st.gen2.graph.nodes;
  const ks = nodes.map((n, i) => ({ n, i })).filter((q) => q.n.job === PRESSURE);
  if (!ks.length) return { problems: [], stretches: [] };
  const problems: string[] = [];
  const secsOf = (id: string) => st.gen2.sections.filter((s) => s.node === id);
  const spanOf = (id: string): [number, number] | null => {
    const ss = secsOf(id);
    return ss.length ? [Math.min(...ss.map((s) => s.x0)), Math.max(...ss.map((s) => s.x1))] : null;
  };
  const out: ChaseLaid['stretches'] = [];
  ks.forEach(({ n, i }, k) => {
    const span = spanOf(n.id);
    if (!span) return void problems.push(`chase: ${n.id} (K) laid no section`);
    const [start, end] = span;
    if (end - start > CHASE_LAY.maxLen) problems.push(`chase: stretch ${k + 1} (${n.id}) is ${Math.round(end - start)} px long (at most ${CHASE_LAY.maxLen})`);
    // (its fork: every node after it up to the next K, or to the stage's end)
    const next = ks[k + 1];
    const after = nodes.slice(i + 1, next ? next.i : nodes.length);
    if (!after.length) problems.push(`chase: stretch ${k + 1} (${n.id}) runs straight into stretch ${k + 2} with no living fork between`);
    const forkEnd = next ? spanOf(next.n.id)?.[0] ?? end : st.config.levelWidth;
    if (after.length && forkEnd - end < CHASE_LAY.forkMin) problems.push(`chase: the fork after stretch ${k + 1} (${n.id}) is ${Math.round(forkEnd - end)} px (at least ${CHASE_LAY.forkMin})`);
    out.push({ start, end, node: n.id, fork: [end, forkEnd] });
  });
  if (problems.length) return { problems, stretches: out };
  // (the ground each stretch breaks: its sections' main pieces, plain solid, cut into branch sections)
  let id = Math.max(0, ...st.platforms.map((p) => p.id));
  const nextId = () => ++id;
  for (const [k, s] of out.entries()) {
    const ground = secsOf(s.node).flatMap((q) => mainOf(q.uid)).filter(breakable);
    const mid = (p: Platform) => p.x + p.width / 2;
    const mine = [...new Set(ground)].filter((p) => mid(p) >= s.start && mid(p) <= s.end);
    if (!mine.length) { problems.push(`chase: stretch ${k + 1} (${s.node}) has no plain ground to break`); continue; }
    for (const p of mine) {
      const at = st.platforms.indexOf(p);
      if (at < 0) { problems.push(`chase: stretch ${k + 1} (${s.node}): a route piece at x ${Math.round(p.x)} is not on the stage`); continue; }
      st.platforms.splice(at, 1, ...cutSections(p, nextId));
    }
  }
  const lay: ChaseLay = { stretches: out.map(({ start, end }) => ({ start, end })) };
  problems.push(...chaseLayProblems(lay).map((w) => `chase: ${w}`));
  if (problems.length) return { problems, stretches: out };
  // (flags: none inside a stretch, and one on the ground before every stretch's crack: the first within `flagBefore` of it, each later
  // one on the fork before it, as close to its crack as Matt's span (ROLLED_FLAGS.max from the flag before) allows; then one where he
  // reaches the fork after the last stretch. A rolled flag within ROLLED_FLAGS.min of these goes; the rest stand as the rolled rules put
  // them, and the verdict judges them all)
  const inside = (x: number) => out.some((s) => x > s.start && x < s.end);
  const placed: Array<{ x: number; y: number }> = [];
  for (const [k, s] of out.entries()) {
    const prev = placed.at(-1);
    const from = k ? out[k - 1].end : Math.max(0, s.start - CHASE_LAY.flagBefore - FLAG_SPAN.pad);
    const upTo = prev ? Math.min(s.start, prev.x + ROLLED_FLAGS.max) : s.start;
    const spot = latest(flagSpots(st.platforms, from, s.start), upTo);
    if (spot === null) { problems.push(`chase: no spot for a flag before stretch ${k + 1} (${s.node}) at x ${Math.round(s.start)} on the ground from x ${Math.round(from)}${prev ? ` within ${ROLLED_FLAGS.max} px of the flag at x ${prev.x}` : ''}`); continue; }
    s.flag = spot.x;
    placed.push(spot);
  }
  const last = out[out.length - 1];
  const tail = flagSpots(st.platforms, last.fork[0], last.fork[1]).sort((a, b) => a.x - b.x)[0];
  if (tail) placed.push(tail);
  const flags = (st.checkpoints ?? []).filter((c) => !inside(c.x) && !placed.some((p) => Math.abs(p.x - c.x) < ROLLED_FLAGS.min));
  flags.push(...placed.map((p) => ({ x: p.x, y: p.y, reached: false })));
  if (problems.length) return { problems, stretches: out };
  flags.sort((a, b) => a.x - b.x);
  st.checkpoints = flags;
  st.chase = lay;
  return { lay, problems, stretches: out };
}

/** the latest spot at or before x `upTo` (null: none) */
const latest = (spots: Array<{ x: number; y: number }>, upTo: number) => spots.filter((q) => q.x <= upTo).reduce<{ x: number; y: number } | null>((m, q) => (!m || q.x > m.x ? q : m), null);

/**
 * Every spot a flag may stand on the ground over [f0, f1]: its plain ground (never a chase section), clear of anything standing on it
 * (pipeline.ts flagRuns), a half pad from each edge, every 20 px.
 */
export function flagSpots(platforms: readonly Platform[], f0: number, f1: number): Array<{ x: number; y: number }> {
  const pad = FLAG_SPAN.pad / 2;
  const spots: Array<{ x: number; y: number }> = [];
  for (const g of platforms) {
    if (g.chase || !breakable(g) || g.x + g.width <= f0 || g.x >= f1) continue;
    for (const [a, b] of flagRuns(platforms, g, Math.max(g.x, f0) + pad, Math.min(g.x + g.width, f1) - pad)) {
      for (let x = Math.ceil(a); x <= b; x += 20) spots.push({ x, y: g.y });
      if (b >= a) spots.push({ x: Math.floor(b), y: g.y });
    }
  }
  return spots;
}
