/**
 * gen2/rollLay — the rolling nuts and bouncing fruit of a laid chase, by its own ground (1-8.md NEW 2; R-165.198: any chase stage lays it
 * by data). Lifted from the dev fixture (chaseFixtureStage.ts layFixtureRolling, ENG-B5) by ENG-CL (6), so 1-8 and the fixture lay them
 * with ONE rule: the teach pair (a nut, then a fruit) on the ground before the first crack (1-8.md beats 1-2: Pitfall's log), then one
 * hazard to each run of unbroken ground on a stretch long enough for it, nut and fruit in turn (one threat at a time, 1-8.md).
 *
 * A hazard is laid only where its whole run-in is plain ground (rolling.ts runIn: no gap, no wall). A bare hop rock in a run-in is cleared
 * (World 1's ground carries one every 300-500 px); a rock something stands on (dressing, a creature: D16) is never moved, and no hazard is
 * laid there. Two hazards are kept far enough apart that the next is set off only once the last has passed (Easy's set-off, the farther).
 * Each is a teach or a heart by the stage's chase (rolling.ts rollTeaches: before the first crack, a bump; after it, a heart).
 *
 * Pure (no canvas, no engine, no stage ids): the world's look is data (World 1's: worlds/w1Cast.ts W1_ROLL).
 */
import type { ChaseLay } from '../chase.ts';
import { ROLL, rollAhead, rollGroundProblems, rollProblems, runIn, type RollKind, type RollSpec } from '../rolling.ts';
import type { Platform } from '../types.ts';

/** what a world lays its rolling hazards with (World 1: w1Cast.ts W1_ROLL) */
export interface RollLook {
  /** the nut's and the fruit's pace (px/s, under his run) and arc (px: the nut's rattle, the fruit's top) */
  low: { speed: number; bounce: number };
  high: { speed: number; bounce: number };
  /** a hazard needs this much unbroken ground before where it lands (px: from where it is set off, rollAhead, to its landing, and a
   *  little more), and `after` px past it */
  runNeed: number;
  after: number;
  /** two hazards on one run of ground are this far apart (px): one threat at a time */
  step: number;
  /** the least px from one hazard's drop to the next's, Normal and Easy (a stage's designed spacing). Unset: the next is set off only
   *  once the last has passed, Easy's set-off and a nut's radius (rollAhead on Easy + ROLL.lowR) */
  apart?: { normal: number; easy: number };
}

/** what the lay reads and writes of a stage */
export interface RollStage {
  chase?: ChaseLay;
  platforms: Platform[];
  proto?: unknown;
  enemies?: unknown;
}

/**
 * something stands on this rock: dressing whose foot is on its top, or a creature on it (D16). A pickup over a hop rock (World 1's reward
 * for the hop) stays where it is: a pickup in the air is an ordinary pickup
 */
export function carries(st: Pick<RollStage, 'proto' | 'enemies'>, w: { x: number; y: number; width: number }): boolean {
  const on = (x: number, y: number, tol = 12) => x >= w.x - 4 && x <= w.x + w.width + 4 && Math.abs(y - w.y) <= tol;
  const pr = st.proto as Record<string, Array<{ x: number; b: number }> | undefined> | undefined;
  for (const k of ['dress', 'decor', 'w3decor', 'kitDecor']) if ((pr?.[k] ?? []).some((q) => on(q.x, q.b))) return true;
  return ((st.enemies as Array<{ x: number; y: number; height: number; width: number }>) ?? []).some((e) => on(e.x + e.width / 2, e.y + e.height));
}

/**
 * The chase's hazards, by its own ground (see the head). Writes the cleared rocks off `st.platforms`; returns the hazards (the caller puts
 * them on the stage: `st.rolling`). A stage with no chase gets none.
 */
export function layRolling(st: RollStage, look: RollLook): RollSpec[] {
  const lay = st.chase;
  if (!lay?.stretches.length) return [];
  const spec = (kind: RollKind, dropX: number, teach: boolean): RollSpec => ({ kind, dropX: Math.round(dropX), ...(kind === 'low' ? look.low : look.high), teach });
  const out: RollSpec[] = [];
  const solid = st.platforms.filter((p) => p.type === 'solid' && p.width >= 40).sort((a, b) => a.x - b.x);
  // (runs of ground: platforms that meet edge to edge at one height; a rock or a step standing on a run does not break it)
  const runs: Array<{ x0: number; x1: number; y: number }> = [];
  for (const p of solid) {
    const on = runs.find((r) => Math.abs(p.y - r.y) < 2 && p.x <= r.x1 + 1 && p.x + p.width >= r.x0 - 1);
    if (on) on.x1 = Math.max(on.x1, p.x + p.width);
    else runs.push({ x0: p.x, x1: p.x + p.width, y: p.y });
  }
  runs.sort((a, b) => a.x0 - b.x0);
  const first = lay.stretches[0].start;
  // (spots along a stretch of ground [x0, x1): runNeed in, then every step while `after` is left past it)
  const spots = (x0: number, x1: number): number[] => {
    const at: number[] = [];
    for (let x = x0 + look.runNeed; x <= x1 - look.after; x += look.step) at.push(x);
    return at;
  };
  // (the teach pair: the last two spots before the crack, a nut then a fruit, each its own beat)
  const before = runs.flatMap((r) => spots(r.x0, Math.min(r.x1, first))).sort((a, b) => a - b).slice(-2);
  const teach: RollKind[] = before.length === 2 ? ['low', 'high'] : ['low'];
  before.forEach((x, i) => out.push(spec(teach[i], x, true)));
  let k = 0;
  for (const s of lay.stretches) {
    for (const r of runs) {
      const x0 = Math.max(r.x0, s.start), x1 = Math.min(r.x1, s.end);
      for (const x of spots(x0, x1)) out.push(spec(k++ % 2 ? 'high' : 'low', x, false));
    }
  }
  out.sort((a, b) => a.dropX - b.dropX);
  // (a spot whose run-in has a gap is not laid; a bare rock in a run-in is cleared, one something stands on keeps the spot empty: the
  // lay's own check, rolling.ts)
  const plain = out.filter((h) => {
    const r = runIn(h, st.platforms);
    if (r.land === null || r.gapAt !== null || r.walls.some((w) => carries(st, w))) return false;
    st.platforms = st.platforms.filter((p) => !r.walls.includes(p));
    return !rollGroundProblems([h], st.platforms).length;
  });
  return plain.filter((h, i) => i === 0 || h.dropX - plain[i - 1].dropX >= rollAhead(h, true) + ROLL.lowR);
}

/** the least px from one hazard's drop to the next's on this setting (RollLook.apart, else the set-off rule above) */
export function rollApart(h: RollSpec, look: RollLook, easy: boolean): number {
  return look.apart ? (easy ? look.apart.easy : look.apart.normal) : rollAhead(h, true) + ROLL.lowR;
}

/**
 * A stage's hazards as laid (buildGen2Stage runs it once the chase is laid, before the verdicts; ENG-CL (6), BUILD-18's shape): its
 * 'roll' sockets' fills (st.gen2.fills, role 'roll': the kind where the designer put it, at the world's pace and arc), or, when it lays
 * none and its world names a look, the chase's own ground (layRolling). Each is a teach or a heart by the chase (rolling.ts
 * rollTeaches). Then the checks, each by name: a socket on a world with no look, a hazard that cannot run fair (rollProblems), one whose
 * run-in is not plain ground (rollGroundProblems), two closer than `rollApart`. A problem is a roll error: the seed fails by name, never
 * a hazard laid unfair or dropped in silence.
 */
export function rollsOf(st: RollStage & { gen2: { fills: ReadonlyArray<{ role: string; what: string | null; x: number }> } }, look: RollLook | undefined, easy: boolean): { specs: RollSpec[]; problems: string[] } {
  const fills = st.gen2.fills.filter((f) => f.role === 'roll' && f.what);
  if (!fills.length) return { specs: look && st.chase?.stretches.length ? layRolling(st, look) : [], problems: [] };
  if (!look) return { specs: [], problems: [`rolling: ${fills.length} 'roll' socket(s) on a world with no rolls look (WorldManifest.rolls)`] };
  const specs = fills.map((f) => {
    const kind: RollKind = f.what === 'high' ? 'high' : 'low';
    return { kind, dropX: Math.round(f.x), ...(kind === 'low' ? look.low : look.high), ...(f.what !== 'low' && f.what !== 'high' ? { bad: f.what } : {}) };
  }).sort((a, b) => a.dropX - b.dropX);
  const problems = specs.filter((h) => 'bad' in h).map((h) => `rolling: a 'roll' socket at x ${h.dropX} names '${(h as { bad: string }).bad}' (low or high)`);
  const clean: RollSpec[] = specs.map(({ kind, dropX, speed, bounce }) => ({ kind, dropX, speed, bounce }));
  problems.push(...rollProblems(clean).map((m) => `rolling: ${m}`), ...rollGroundProblems(clean, st.platforms).map((m) => `rolling: ${m}`));
  clean.forEach((h, i) => {
    const prev = clean[i - 1];
    if (prev && h.dropX - prev.dropX < rollApart(h, look, easy)) problems.push(`rolling: ${prev.kind} at x ${prev.dropX} and ${h.kind} at x ${h.dropX} are ${h.dropX - prev.dropX} px apart, under ${Math.round(rollApart(h, look, easy))} (${easy ? 'Easy' : 'Normal'})`);
  });
  return { specs: clean, problems };
}
