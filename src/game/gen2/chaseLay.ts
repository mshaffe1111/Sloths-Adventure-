/**
 * gen2/chaseLay — B5 CHASE-LAY (ENGINE-678; 1-8.md NEW 1 and 7; R-165.198: any world lays it by data): the job `K` lays a chase.
 *
 * Every `K` (pressure) node of a rolled graph is one STRETCH of the chase, from its first section's left edge to its last one's right
 * edge; whatever the graph lays after it, up to the next `K`, is its LIVING FORK: nothing there falls and the front stops at its edge
 * (chase.ts ChaseLay, run by pieces/chasePiece.ts). The stretch's ground (its sections' own pieces, plain solid ones) is cut
 * into branch sections about CHASE_LAY.tile wide, each marked `chase`: the cut keeps every piece's top, edges and depth, so the ground
 * he walks is the same union of solids the verdicts judged; only the pieces that fall one by one are new.
 *
 * Flags by Matt's rules (STAGE-RULES:105-109, D49): the chase restarts at the last flag with the branch whole, so a flag inside a
 * stretch is taken out and every fork carries one, on its ground as close before the next crack as the 4,000 px span allows (the
 * respawn right before the hard part); the stage's flags are then judged again by the same verdict every rolled stage meets
 * (pipeline.ts rolledFlagBreaches, run after the lay in buildGen2Stage).
 *
 * A lay that cannot run is refused by name, never laid broken: chaseLayProblems (the piece's own check, chase.ts) and the lay's own
 * (a K node over the cap with nowhere to stop, two K nodes with no fork between them, a fork too short to stand on, a stretch with no
 * ground to break). Each problem is a roll error, so the seed fails and the proven walk moves on.
 */
import { chaseLayProblems, type ChaseLay, type ChaseStretch } from '../chase.ts';
import type { Platform } from '../types.ts';
import type { Gen2Stage } from './types.ts';
import { FLAG_SPAN, flagRuns, ROLLED_FLAGS } from './pipeline.ts';

export const CHASE_LAY = {
  /** a fork must give him at least this much ground to stop on (px): about a body and a half each side of a stop */
  forkMin: 300,
  /** the branch sections a stretch's ground is cut into (px): the long-branch sheet's section, as the old 1-8 lays it (protoStage.ts
   *  BRANCH_TILE; a value here, so gen2 never loads the hand builder: chaseLay.test.ts pins them equal) */
  tile: 222,
  /** the first stretch's flag stands this far before its crack at most (px): the respawn within about 2 s of it (§0b.8); a later one
   *  stands on the fork before its crack, as close as Matt's span allows (ROLLED_FLAGS.max from the flag before) */
  flagBefore: 600,
} as const;

/**
 * The longest a stretch may run (px), DERIVED from Matt's flag span, never a number of its own (the lead's ruling 11-14, D49: his rule
 * wins over the design's "K at most 4,000 px"): the flag before a stretch stands on the ground before its crack and the next one on the
 * fork after it, each at least half a flag pad off that ground's edge (FLAG_SPAN.pad / 2), and no two flags stand more than
 * ROLLED_FLAGS.max apart. So the run from one fork to the next, its run-up included, fits the span when the stretch is at most this.
 */
export const chaseCap = (): number => ROLLED_FLAGS.max - FLAG_SPAN.pad;

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
 * forks. `piecesOf` names each section's own pieces and which are the route's (pipeline.ts keeps them from the lay); a stage whose
 * graph has no `K` is left untouched.
 */
export function layChase(st: Gen2Stage, piecesOf: (uid: string) => ReadonlyArray<{ platform: Platform; main: boolean }>): ChaseLaid {
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
  const cap = chaseCap();
  ks.forEach(({ n, i }, k) => {
    const span = spanOf(n.id);
    if (!span) return void problems.push(`chase: ${n.id} (K) laid no section`);
    // (more, shorter stretches: a K node longer than the cap is split where a plain piece wide enough to stop on lies; that piece is a
    // living fork (nothing on it falls, a flag stands on it), and the next stretch cracks behind him as he leaves it)
    // (a stop is on the route: only a main piece)
    const ground = [...new Set(secsOf(n.id).flatMap((q) => piecesOf(q.uid)).filter((q) => q.main).map((q) => q.platform).filter(breakable))].sort((a, b) => a.x - b.x);
    let s0 = span[0];
    while (span[1] - s0 > cap) {
      const fork = ground.filter((p) => p.x > s0 && p.x - s0 <= cap && p.width >= CHASE_LAY.forkMin && p.x + p.width < span[1]).at(-1);
      if (!fork) return void problems.push(`chase: ${n.id} (K) runs ${Math.round(span[1] - s0)} px from x ${Math.round(s0)} with no piece ${CHASE_LAY.forkMin} px wide to stop on within the ${cap} px cap (Matt's flag span)`);
      out.push({ start: s0, end: fork.x, node: n.id, fork: [fork.x, fork.x + fork.width] });
      s0 = fork.x + fork.width;
    }
    // (the node's last stretch, and its fork: every node after it up to the next K, or to the stage's end)
    const next = ks[k + 1];
    const after = nodes.slice(i + 1, next ? next.i : nodes.length);
    if (!after.length) problems.push(`chase: ${n.id} (K) runs straight into ${next!.n.id} (K) with no living fork between`);
    const forkEnd = next ? spanOf(next.n.id)?.[0] ?? span[1] : st.config.levelWidth;
    if (after.length && forkEnd - span[1] < CHASE_LAY.forkMin) problems.push(`chase: the fork after ${n.id} (K) is ${Math.round(forkEnd - span[1])} px (at least ${CHASE_LAY.forkMin})`);
    out.push({ start: s0, end: span[1], node: n.id, fork: [span[1], forkEnd] });
  });
  if (problems.length) return { problems, stretches: out };
  // (the ground each stretch breaks: its sections' own pieces, plain solid, cut into branch sections; a log beside the route falls with
  // it too. Never a section's seam (a pit's floor and steps, laid under the branch): that stays as the pit's ground, under the fall)
  let id = Math.max(0, ...st.platforms.map((p) => p.id));
  const nextId = () => ++id;
  for (const [k, s] of out.entries()) {
    const ground = secsOf(s.node).flatMap((q) => piecesOf(q.uid)).map((q) => q.platform).filter(breakable);
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
  // (flags by Matt's rules (STAGE-RULES:105-109, D49; ROLLED_FLAGS): none inside a stretch. Walking right, each flag stands on route
  // ground outside every stretch, ROLLED_FLAGS.min to .max from the one before: before each crack the latest such spot (the respawn as
  // close to the crack as the span allows; the first crack's within `flagBefore`), on a fork too long for one flag one more where the
  // span needs it, and one where he reaches the fork after the last stretch. The rolled flags from the first chase flag to that one
  // go; the rest stand; the verdict judges them all)
  const inside = (x: number) => out.some((s) => x > s.start && x < s.end);
  const route = new Set(st.gen2.sections.flatMap((q) => piecesOf(q.uid)).filter((q) => q.main).map((q) => q.platform));
  const spotsIn = (a: number, b: number) => flagSpots(st.platforms, a, b, route).filter((q) => !inside(q.x));
  const { min, max, first: fromSpawn } = ROLLED_FLAGS;
  const rolled = (st.checkpoints ?? []).filter((c) => !inside(c.x)).sort((a, b) => a.x - b.x);
  const placed: Array<{ x: number; y: number }> = [];
  // (the first crack: the latest rolled flag (or the spawn) a spot within flagBefore of the crack can follow within the span)
  const s1 = out[0];
  const before = [...rolled.filter((c) => c.x < s1.start).map((c) => ({ x: c.x, gap: min })), { x: st.spawnX, gap: fromSpawn }].sort((a, b) => b.x - a.x);
  let keepTo = -Infinity;
  for (const c of before) {
    const spot = latest(spotsIn(s1.start - CHASE_LAY.flagBefore - FLAG_SPAN.pad, s1.start).filter((q) => q.x >= c.x + c.gap), Math.min(s1.start, c.x + max));
    if (spot) { keepTo = c.x; placed.push(spot); s1.flag = spot.x; break; }
  }
  if (!placed.length) problems.push(`chase: no spot for a flag within ${CHASE_LAY.flagBefore} px before stretch 1 (${s1.node}) at x ${Math.round(s1.start)} that the flags before it reach within ${max} px`);
  // (each later crack, on the fork before it; an extra flag on the fork while the span needs one)
  for (const [k, s] of out.entries()) {
    if (!k || problems.length) continue;
    const spots = spotsIn(out[k - 1].end, s.start);
    const best = latest(spots, s.start);
    for (let f = placed.at(-1)!; ; ) {
      const spot = latest(spots.filter((q) => q.x >= f.x + min), Math.min(s.start, f.x + max));
      if (!spot) { problems.push(`chase: no spot for a flag on the fork before stretch ${k + 1} (${s.node}) at x ${Math.round(s.start)} within ${max} px of the flag at x ${f.x}`); break; }
      placed.push(spot);
      // (the crack's flag: the latest spot, or the one the span allowed when no further flag fits between it and the crack)
      if (spot.x === best?.x || !spots.some((q) => q.x >= spot.x + min && q.x <= s.start)) { s.flag = spot.x; break; }
      f = spot;
    }
  }
  // (the fork after the last stretch: where he reaches it, within the span)
  const last = out[out.length - 1];
  const f = placed.at(-1);
  const tail = f && spotsIn(last.fork[0], last.fork[1]).filter((q) => q.x >= f.x + min && q.x <= f.x + max).sort((a, b) => a.x - b.x)[0];
  if (f && !problems.length && !tail) problems.push(`chase: no spot for a flag on the fork after the last stretch (${last.node}) within ${max} px of the flag at x ${f.x}`);
  if (tail) placed.push(tail);
  const lastChase = placed.at(-1)?.x ?? Infinity;
  const flags = rolled.filter((c) => c.x <= keepTo || c.x >= lastChase + min);
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
 * Every spot a flag may stand on the ground over [f0, f1]: its plain ground (never a chase section; only `grounds` when given: the
 * route's own pieces, never a pit's floor), clear of anything standing on it (pipeline.ts flagRuns), a half pad from each edge, every 20 px.
 */
export function flagSpots(platforms: readonly Platform[], f0: number, f1: number, grounds?: ReadonlySet<Platform>): Array<{ x: number; y: number }> {
  const pad = FLAG_SPAN.pad / 2;
  const spots: Array<{ x: number; y: number }> = [];
  for (const g of platforms) {
    if (g.chase || !breakable(g) || (grounds && !grounds.has(g)) || g.x + g.width <= f0 || g.x >= f1) continue;
    for (const [a, b] of flagRuns(platforms, g, Math.max(g.x, f0) + pad, Math.min(g.x + g.width, f1) - pad)) {
      for (let x = Math.ceil(a); x <= b; x += 20) spots.push({ x, y: g.y });
      if (b >= a) spots.push({ x: Math.floor(b), y: g.y });
    }
  }
  return spots;
}
