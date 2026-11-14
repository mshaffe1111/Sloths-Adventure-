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
import { CHASE_ROWS, chaseLayProblems, type ChaseLay, type ChaseStretch } from '../chase.ts';
import { PHYS } from '../physics.ts';
import type { Platform } from '../types.ts';
import type { Gen2Stage } from './types.ts';
import { FLAG_SPAN, flagRuns, HARD_JOBS, lethalSpans, rolledFlagBreaches, ROLLED_FLAGS } from './pipeline.ts';
import { JOB_OF } from './nodeCode.ts';

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

/** the job letter's job that lays a chase (nodeLetters.ts K), and the finale (L) that is its last stretch after the last K */
const PRESSURE = 'pressure';
const FINALE = 'finale';

/**
 * The shortest a stretch may run (px), DERIVED from the Normal row (chase.ts): the front sets off `behind` px back as he passes the
 * stretch's start and runs at `base` while he runs at his top speed, so its first section falls under him only once he is
 * behind x maxRun / base px in (520 x 285 / 230 = 644). A shorter stretch is over before anything falls (B3: a 150 px one on Easy):
 * no stretch at all. A K node shorter than this is refused by name; a split never leaves one (the short rest joins its fork).
 */
export const chaseFloor = (): number => Math.ceil((CHASE_ROWS.normal.behind * PHYS.maxRun) / CHASE_ROWS.normal.base);

type Spot = { x: number; y: number };

/** the hard nodes a rolled stage's flags are judged before (pipeline.ts applyVerdicts reads them the same way) */
const hardAt = (st: Gen2Stage) => (st.gen2.nodes ?? []).filter((q) => HARD_JOBS.has(JOB_OF[q.token[0] as keyof typeof JOB_OF] ?? '')).map((q, i) => ({ id: `${q.token} #${i + 1}`, x0: q.x0 }));

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
  const floor = chaseFloor();
  const { min, max, first: fromSpawn } = ROLLED_FLAGS;
  // (flags by Matt's rules (STAGE-RULES:105-109, D49; ROLLED_FLAGS): none inside a stretch; each on route ground outside every stretch,
  // ROLLED_FLAGS.min to .max from the one before. They are walked WITH the stretches, left to right, so each stretch ends where the flag
  // before its crack, standing where it really stands (the realised run-up, B3's refusals: 245 px+ seen), reaches a flag on the ground
  // after it. Before the first crack the latest spot within `flagBefore`; on a fork the latest spot before the next crack, with one
  // more where the span needs it; one where he reaches the fork after the last stretch. The rolled flags between go; the rest stand;
  // the verdict judges them all, after the lay)
  const route = new Set(st.gen2.sections.flatMap((q) => piecesOf(q.uid)).filter((q) => q.main).map((q) => q.platform));
  const spotsIn = (a: number, b: number) => flagSpots(st.platforms, a, b, route).filter((q) => !out.some((s) => q.x > s.start && q.x < s.end));
  const reach = (f: Spot, ss: Spot[]) => ss.filter((q) => q.x >= f.x + min && q.x <= f.x + max);
  const rolled = [...(st.checkpoints ?? [])].sort((a, b) => a.x - b.x);
  const placed: Spot[] = [];
  let keepTo = -Infinity;
  /** the stage's flags with the chase's `ps`: the rolled ones outside every stretch up to the first crack's and from the min past the last
   *  chase flag on, and the chase's own */
  const flagsWith = (ps: readonly Spot[]) => {
    const lastChase = ps.at(-1)?.x ?? Infinity;
    const keep = rolled.filter((c) => !out.some((t) => c.x > t.start && c.x < t.end) && (c.x <= keepTo || c.x >= lastChase + min));
    return [...keep, ...ps.map((p) => ({ x: p.x, y: p.y, reached: false }))].sort((a, b) => a.x - b.x);
  };
  // (CHASE-FINISH: the finale after the last K is the chase's last stretch, its front at its row's final burst)
  const lastK = ks[ks.length - 1].i;
  const fin = nodes.findIndex((q, i) => i > lastK && q.job === FINALE);
  const chased = fin < 0 ? ks : [...ks, { n: nodes[fin], i: fin }];
  plan: for (const [k, { n, i }] of chased.entries()) {
    const span = spanOf(n.id);
    if (!span) { problems.push(`chase: ${n.id} (${n.job === FINALE ? 'L' : 'K'}) laid no section`); break; }
    const tag = `${n.id} (${n.job === FINALE ? 'L' : 'K'})`;
    if (span[1] - span[0] < floor) { problems.push(`chase: ${tag} is ${Math.round(span[1] - span[0])} px, under the ${floor} px a stretch needs before its first section falls under him`); break; }
    // (its fork: every node after it up to the next chased node, or to the stage's end)
    const next = chased[k + 1];
    const after = nodes.slice(i + 1, next ? next.i : nodes.length);
    if (!after.length) { problems.push(`chase: ${tag} runs straight into ${next!.n.id} (K) with no living fork between`); break; }
    const forkEnd = next ? spanOf(next.n.id)?.[0] ?? span[1] : st.config.levelWidth;
    if (forkEnd - span[1] < CHASE_LAY.forkMin) { problems.push(`chase: the fork after ${tag} is ${Math.round(forkEnd - span[1])} px (at least ${CHASE_LAY.forkMin})`); break; }
    const ground = [...new Set(secsOf(n.id).flatMap((q) => piecesOf(q.uid)).filter((q) => q.main).map((q) => q.platform).filter(breakable))].sort((a, b) => a.x - b.x);
    let s0 = span[0];
    if (!k) {
      // (the first crack: the latest rolled flag (or the spawn) a spot within flagBefore of the crack can follow within the span. A
      // rolled flag just short of the min before the node (B3's last refusals: one about 1,000 px before it) leaves no such spot; then
      // the crack sets off at the end of one of the node's own route pieces instead, its flag on that piece: the ground before the
      // crack stays whole, the rest of the node is the stretch, at least the floor long)
      const before = [...rolled.filter((c) => c.x < span[0]).map((c) => ({ x: c.x, gap: min })), { x: st.spawnX, gap: fromSpawn }].sort((a, b) => b.x - a.x);
      const cracks = [span[0], ...ground.map((p) => p.x + p.width).filter((x) => x > span[0] && span[1] - x >= floor)];
      crack: for (const at of cracks) {
        for (const c of before) {
          const spot = latest(spotsIn(at - CHASE_LAY.flagBefore - FLAG_SPAN.pad / 2, at).filter((q) => q.x >= at - CHASE_LAY.flagBefore && q.x >= c.x + c.gap), Math.min(at, c.x + max));
          if (spot) { keepTo = c.x; placed.push(spot); s0 = at; break crack; }
        }
      }
      if (!placed.length) { problems.push(`chase: no spot for a flag within ${CHASE_LAY.flagBefore} px before stretch 1 (${n.id}) at x ${Math.round(span[0])} that the flags before it reach within ${max} px`); break; }
    }
    let f = placed[placed.length - 1];
    // (more, shorter stretches: the node's ground runs on as one stretch while the flag before it reaches a flag on the ground after
    // it and the cap holds; past that it is split at a plain route piece forkMin+ wide, a living fork that flag reaches (nothing on it
    // falls, a flag stands on it, the next stretch cracks behind him as he leaves it), each stretch at least the floor long)
    for (;;) {
      if (span[1] - s0 <= cap && reach(f, spotsIn(span[1], forkEnd)).length) {
        out.push({ start: s0, end: span[1], node: n.id, fork: [span[1], forkEnd], flag: f.x });
        break;
      }
      const stops = ground.filter((p) => p.width >= CHASE_LAY.forkMin && p.x - s0 >= floor && p.x - s0 <= cap && p.x + p.width < span[1] && reach(f, spotsIn(p.x, p.x + p.width)).length);
      // (one that leaves the rest of the node a stretch of its own, else the furthest: the short rest is no stretch and joins its fork)
      const stop = stops.filter((p) => span[1] - (p.x + p.width) >= floor).at(-1) ?? stops.at(-1);
      if (!stop) { problems.push(`chase: ${tag} runs ${Math.round(span[1] - s0)} px from x ${Math.round(s0)} with no piece ${CHASE_LAY.forkMin} px wide to stop on that the flag at x ${f.x} reaches within ${max} px (Matt's flag span; a stretch ${floor}-${cap} px)`); break plan; }
      const rest = span[1] - (stop.x + stop.width) < floor;
      out.push({ start: s0, end: stop.x, node: n.id, fork: [stop.x, rest ? forkEnd : stop.x + stop.width], flag: f.x });
      f = latest(reach(f, spotsIn(stop.x, stop.x + stop.width)), Infinity)!;
      placed.push(f);
      if (rest) break;
      s0 = stop.x + stop.width;
    }
    if (!next) {
      // (the fork after the last stretch: where he reaches it, within the span, chosen by the verdict that judges every rolled stage's
      // flags (pipeline.ts rolledFlagBreaches, D19): the first spot (or a rolled flag already in reach, none added) whose flags, with the
      // rolled ones after it that keep the min, break no rule; else the first spot. B3's last refusals were the rolled flags a first
      // spot knocked out: the exit's and a signature's)
      const tails: Array<Spot | null> = reach(f, spotsIn(out[out.length - 1].end, forkEnd)).sort((a, b) => a.x - b.x);
      if (!tails.length) { problems.push(`chase: no spot for a flag on the fork after the last stretch (${n.id}) within ${max} px of the flag at x ${f.x}`); break; }
      const r1 = rolled.find((c) => c.x >= f.x + min && !out.some((t) => c.x > t.start && c.x < t.end));
      if (r1 && r1.x <= f.x + max) tails.unshift(null);
      const breaks = (q: Spot | null) => rolledFlagBreaches({ ...st, checkpoints: flagsWith(q ? [...placed, q] : placed) }, hardAt(st), lethalSpans(st, st.gen2.falls ?? [])).length;
      const tail = tails.find((q) => !breaks(q)) ?? tails.find((q) => q !== null) ?? null;
      if (tail) placed.push(tail);
      break;
    }
    // (the fork before the next crack: its latest spot, with a flag between while the span needs one)
    const spots = spotsIn(out[out.length - 1].end, forkEnd);
    const best = latest(spots, forkEnd);
    for (;;) {
      const spot = latest(reach(f, spots), Infinity);
      if (!spot) { problems.push(`chase: no spot for a flag on the fork before stretch ${out.length + 1} (${next.n.id}) at x ${Math.round(forkEnd)} within ${max} px of the flag at x ${f.x}`); break plan; }
      placed.push(spot);
      if (spot.x === best?.x || !spots.some((q) => q.x >= spot.x + min && q.x <= forkEnd)) break;
      f = spot;
    }
  }
  if (problems.length) return { problems, stretches: out };
  if (fin >= 0) out[out.length - 1].last = true;
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
  const lay: ChaseLay = { stretches: out.map(({ start, end, last }) => (last ? { start, end, last } : { start, end })) };
  problems.push(...chaseLayProblems(lay).map((w) => `chase: ${w}`));
  if (problems.length) return { problems, stretches: out };
  // (every planned flag still stands on ground that never falls, after the cut)
  for (const q of placed) {
    if (!st.platforms.some((p) => !p.chase && p.y === q.y && p.x <= q.x && q.x <= p.x + p.width)) problems.push(`chase: the flag at x ${q.x} stands on a section that falls`);
  }
  if (problems.length) return { problems, stretches: out };
  const flags = flagsWith(placed);
  // (after the chase, the rolled pass's own span rule again (pipeline.ts, its fill: every span past its cap, `last` before the exit, gets
  // a flag at the furthest spot in reach that keeps the min from both neighbours): what the rolled pass laid there for flags the chase
  // moved is made up, never left short (B3's last refusals: the last flag 5,218 px from the exit))
  const from = placed.at(-1)?.x ?? Infinity;
  const lethal = lethalSpans(st, st.gen2.falls ?? []);
  const capOf = (a: number, b: number) => (lethal.some(([l0, l1]) => l1 > a && l0 < b) ? ROLLED_FLAGS.lethal : max);
  // (its spots as the rolled pass's: any route piece's top, an exit log's too, never a section that falls)
  const fill = flagSpots(st.platforms, from, st.exitTotemX, route, true).filter((q) => !out.some((t) => q.x > t.start && q.x < t.end));
  for (let guard = 0; guard < 20; guard++) {
    const xs = [...flags.map((c) => c.x).filter((x) => x >= from), st.exitTotemX];
    let k = -1;
    for (let i = 1; i < xs.length; i++) if (xs[i] - xs[i - 1] > (i === xs.length - 1 ? Math.min(ROLLED_FLAGS.last, capOf(xs[i - 1], xs[i])) : capOf(xs[i - 1], xs[i]))) { k = i; break; }
    if (k < 0) break;
    const a = xs[k - 1], b = xs[k], end = k === xs.length - 1;
    const hi = Math.min(a + (end ? Math.min(ROLLED_FLAGS.last, capOf(a, b)) : capOf(a, b)) - 20, end ? b : b - min);
    const spot = latest(fill.filter((q) => q.x >= a + min), hi);
    if (!spot) break;
    flags.push({ x: spot.x, y: spot.y, reached: false });
    flags.sort((p, q) => p.x - q.x);
  }
  flags.sort((a, b) => a.x - b.x);
  st.checkpoints = flags;
  st.chase = lay;
  return { lay, problems, stretches: out };
}

/** the latest spot at or before x `upTo` (null: none) */
const latest = (spots: Array<{ x: number; y: number }>, upTo: number) => spots.filter((q) => q.x <= upTo).reduce<{ x: number; y: number } | null>((m, q) => (!m || q.x > m.x ? q : m), null);

/**
 * Every spot a flag may stand on the ground over [f0, f1]: its plain ground (any ground with `anyGround`; never a chase section; only
 * `grounds` when given: the route's own pieces, never a pit's floor), clear of anything standing on it (pipeline.ts flagRuns), a half pad from each edge, every 20 px.
 */
export function flagSpots(platforms: readonly Platform[], f0: number, f1: number, grounds?: ReadonlySet<Platform>, anyGround = false): Array<{ x: number; y: number }> {
  const pad = FLAG_SPAN.pad / 2;
  const spots: Array<{ x: number; y: number }> = [];
  for (const g of platforms) {
    if (g.chase || (!anyGround && !breakable(g)) || (grounds && !grounds.has(g)) || g.x + g.width <= f0 || g.x >= f1) continue;
    for (const [a, b] of flagRuns(platforms, g, Math.max(g.x, f0) + pad, Math.min(g.x + g.width, f1) - pad)) {
      for (let x = Math.ceil(a); x <= b; x += 20) spots.push({ x, y: g.y });
      if (b >= a) spots.push({ x: Math.floor(b), y: g.y });
    }
  }
  return spots;
}
