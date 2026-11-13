/**
 * Travel as a mode (ADR-003 kit step 2): one StageMode per Travel, so the engine asks the mode which way is "further on" and never
 * reads the objective or a proto flag for it. A stage names its travel in its data (LevelConfig.travel; unset is 'right').
 * Each mode gives the answers the engine gave before it: a run's bar is his x from RUN_START to the shrine and follows him back, a
 * climb's bar is the best height at any moment (in the air, on a vine), a way down's bar is the lowest ledge he has stood on.
 */
import { SHRINE_STOP, ascentProgress } from './rules.ts';
import type { Mark, StageMode, Travel, TravelSpan } from './stageKit.types.ts';

/** a StageMode, and whether a frame in the air counts for `best` (only a way down waits for his feet: a fall is not progress) */
export interface TravelMode extends StageMode { readonly air: boolean }

/** where a run's bar starts (the engine's own number, kept so no bar moves; a leftward run measures from its start) */
const RUN_START = 140;
const EDGE = 20;
const unit = (n: number) => Math.max(0, Math.min(1, n));
type Bounds = StageMode['bounds'];
/** the level's walls, and just past the shrine on side `s` (1 right, -1 left, 0 the far side from the start) when there is a shrine */
const walls = (s: -1 | 0 | 1): Bounds => ({ levelWidth: w, exit, spawn }) => {
  const side = exit.x > 0 ? s || (exit.x < spawn.x ? -1 : 1) : 0;
  return { minX: side < 0 ? exit.x - SHRINE_STOP : EDGE, maxX: side > 0 ? exit.x + SHRINE_STOP : w - EDGE };
};
const level: Bounds = ({ levelWidth: w }) => ({ minX: EDGE, maxX: w - EDGE });
const now = (_prev: Mark, at: Mark): Mark => at;

const right: TravelMode = {
  travel: 'right', air: true, best: now,
  progress: (_s, exit, b) => Math.min(1, Math.max(0, b.x - RUN_START) / Math.max(1, exit.x - RUN_START)),
  further: (cp, cur) => cp.x > cur.x,
  past: (at, sp) => at.x >= sp.to,
  bounds: walls(1),
  lead: () => ({ dx: 1, dy: 0 }),
};
const left: TravelMode = {
  travel: 'left', air: true, best: now,
  progress: (s, exit, b) => unit((s.x - b.x) / Math.max(1, s.x - exit.x)),
  further: (cp, cur) => cp.x < cur.x,
  past: (at, sp) => at.x <= sp.to,
  bounds: walls(-1),
  lead: () => ({ dx: -1, dy: 0 }),
};
const up: TravelMode = {
  travel: 'up', air: true,
  best: (prev, at) => (at.y < prev.y ? at : prev),
  progress: (s, exit, b) => ascentProgress(s.y, exit.y, b.y),
  further: (cp, cur) => cp.y < cur.y,
  past: (at, sp) => at.y <= sp.to,
  bounds: level,
  lead: () => ({ dx: 0, dy: -1 }),
};
const down: TravelMode = {
  travel: 'down', air: false,
  best: (prev, at) => (at.y > prev.y ? at : prev),
  progress: (s, exit, b) => unit((b.y - s.y) / Math.max(1, exit.y - s.y)),
  further: (cp, cur) => cp.y > cur.y,
  past: (at, sp) => at.y >= sp.to,
  bounds: walls(0),
  lead: () => ({ dx: 0, dy: 1 }),
};

/** (a room or arena: nothing is further on; today no stage names it, a boss stage reads right as it always did) */
export const MODES: Record<Travel, TravelMode> = {
  right, left, up, down,
  stay: { ...right, travel: 'stay', best: (prev) => prev, progress: () => 0, further: () => false, past: () => false, bounds: level, lead: () => ({ dx: 0, dy: 0 }) },
};

/** his place along the travel: x in a run, y in a climb or a way down (the bots' "how far on", tools/inspect) */
export const along = (m: StageMode, at: Mark): number => (m.lead().dy ? at.y : at.x);
/** is place `a` along the travel at or past place `b`? */
export const reached = (m: StageMode, a: number, b: number): boolean => m.past({ x: a, y: a }, { from: b, to: b });

/** a stretch laid from `lo` to `hi` (x in a run, y in a climb or drop) as the travel crosses it: entered at `from`, left at `to` */
export const travelSpan = (m: StageMode, lo: number, hi: number): TravelSpan => (m.travel === 'left' || m.travel === 'up' ? { from: hi, to: lo } : { from: lo, to: hi });
