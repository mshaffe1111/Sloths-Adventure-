/**
 * clock — the one beat every timed thing in a stage reads (ADR-003 decision 4, GAME-MAP A14).
 *
 * Game time only: the engine's fixed step adds to it (engine.ts gameTime), so it pauses with the game and the same steps always give the
 * same beat. Nothing here reads the wall clock or rolls a number; a stage's offsets come from its brief.
 *
 * Two layers:
 *   - `cycleRead`: the walk under every timer. Rocks (rockfall.ts), zones (zones.ts: spores, wind, tide, geysers, bolts) and thorn
 *     vines (thornVine.ts) read it with their own lengths, and get the numbers they always got, bit for bit (clockMove.test.ts).
 *   - `ClockDef` (stageKit.types.ts) made ready by `beatOf` and read by `beatAt` / `stageClock`: named phases, a warning before anything
 *     that hurts (`checkClock`), an offset to stagger lanes, and Easy stretched, never faster.
 *
 * Pure (no canvas, no engine).
 */
import type { ClockDef, ClockId, ClockPhase, ClockState } from './stageKit.types.ts';

export type PhaseName = ClockPhase['name'];

/** where a moment falls in a cycle: which stretch, seconds into it, seconds into the cycle */
export interface CycleRead { index: number; into: number; at: number }

/** seconds into a cycle of `period` at game time t (a real place in the cycle before time 0 too) */
export const cyclePos = (t: number, offset: number, period: number): number => (((t + offset) % period) + period) % period;

/**
 * The walk: the first `n` stretches of `seconds` in order, and whatever is left of the period as one more (index n). A stretch ends at the
 * running sum of the lengths before it; time into a stretch is the cycle time less each earlier length in turn. That is exactly the
 * arithmetic the old timers each did by hand, so moving one here changes no number. Writes into `out` (no garbage on a frame).
 */
export function cycleRead(t: number, offset: number, period: number, seconds: ArrayLike<number>, n: number, out: CycleRead): CycleRead {
  const c = cyclePos(t, offset, period);
  let edge = 0;
  let into = c;
  let i = 0;
  for (; i < n; i++) {
    edge += seconds[i];
    if (c < edge) break;
    into -= seconds[i];
  }
  out.index = i;
  out.into = into;
  out.at = c;
  return out;
}

/** a ClockDef made ready to read on one setting */
export interface Beat {
  id: ClockId;
  /** the cycle's length (s): the sum of its phases */
  period: number;
  offset: number;
  names: readonly PhaseName[];
  seconds: readonly number[];
  /** where in the cycle each 'on' begins (s) */
  ons: readonly number[];
  /** Easy's stretch as applied (1 on Normal) */
  stretch: number;
}

/** what a running clock tells a piece on a frame: ClockState, plus the seconds a piece needs for a tell or a countdown */
export interface ClockRead extends ClockState {
  /** which phase of the cycle (0 = the first listed) */
  index: number;
  /** seconds into the phase, and seconds it has left */
  into: number;
  left: number;
  /** seconds until the next 'on' begins: 0 while one is on, Infinity when the clock has none */
  toOn: number;
}

/** ready a clock for a setting. Easy stretches every phase and the offset by `easyStretch` (so lanes keep their stagger); never below 1 */
export function beatOf(def: ClockDef, easy = false): Beat {
  const stretch = easy && def.easyStretch > 1 ? def.easyStretch : 1;
  const seconds = def.phases.map((p) => p.seconds * stretch);
  const ons: number[] = [];
  let period = 0;
  def.phases.forEach((p, i) => {
    if (p.name === 'on') ons.push(period);
    period += seconds[i];
  });
  return { id: def.id, period, offset: def.offset * stretch, names: def.phases.map((p) => p.name), seconds, ons, stretch };
}

const WALK: CycleRead = { index: 0, into: 0, at: 0 };
const QW = [0, 0];

/**
 * The shape the game's timers share (rocks, zones, thorn vines, eagle nests, teapots, surging falls, orchids): a first stretch (most
 * often the quiet one), a second (most often the warning), then the rest of the cycle (index 2). Each keeps its own lengths and its own
 * period. Returns the one shared read: take what you need from it before the next read.
 */
export function cycle3(t: number, offset: number, period: number, first: number, second: number): CycleRead {
  QW[0] = first;
  QW[1] = second;
  return cycleRead(t, offset, period, QW, 2, WALK);
}

/** read a ready clock at game time t. `shift` staggers one lane or piece (seconds on Normal; stretched with the clock on Easy) */
export function beatAt(b: Beat, t: number, shift = 0): ClockRead {
  const offset = b.offset + shift * b.stretch;
  const w = cycleRead(t, offset, b.period, b.seconds, b.seconds.length - 1, WALK);
  const phase = b.names[w.index];
  let toOn = phase === 'on' ? 0 : Infinity;
  if (phase !== 'on') for (const at of b.ons) toOn = Math.min(toOn, at >= w.at ? at - w.at : at + b.period - w.at);
  const len = b.seconds[w.index];
  return { phase, u: w.into / len, cycle: Math.floor((t + offset) / b.period), index: w.index, into: w.into, left: len - w.into, toOn };
}

/** read a clock straight from its definition (tests, the stage builder's checks; a running stage keeps its beats ready: stageClock) */
export const clockAt = (def: ClockDef, t: number, easy = false, shift = 0): ClockRead => beatAt(beatOf(def, easy), t, shift);

/**
 * What is wrong with a clock, in words (none = it may be used). The fairness rule lives here: an 'on' is always entered from a 'warn'
 * (the phase right before it, round the end of the cycle too), every phase has a real length, and Easy is never faster.
 */
export function checkClock(def: ClockDef): string[] {
  const bad: string[] = [];
  const ph = def.phases;
  if (!ph.length) return [`clock ${def.id}: no phases`];
  ph.forEach((p, i) => {
    if (!(p.seconds > 0) || !Number.isFinite(p.seconds)) bad.push(`clock ${def.id}: phase ${i} (${p.name}) needs seconds above 0`);
    if (p.name === 'on' && ph[(i + ph.length - 1) % ph.length].name !== 'warn') bad.push(`clock ${def.id}: phase ${i} is on with no warn right before it`);
  });
  if (!Number.isFinite(def.offset)) bad.push(`clock ${def.id}: offset must be a number`);
  if (!(def.easyStretch >= 1) || !Number.isFinite(def.easyStretch)) bad.push(`clock ${def.id}: easyStretch must be 1 or more (Easy is never faster)`);
  return bad;
}

/** a stage's clocks, running on the engine's fixed step: the one place game time turns into beats */
export interface StageClock {
  /** one fixed step of game time (the engine does not call it while paused) */
  step(dt: number): void;
  /** game time, s */
  time(): number;
  read(id: ClockId, shift?: number): ClockRead;
}

export function stageClock(defs: readonly ClockDef[], easy: boolean): StageClock {
  const beats = new Map(defs.map((d) => [d.id, beatOf(d, easy)]));
  let t = 0;
  return {
    step: (dt) => { t += dt; },
    time: () => t,
    read: (id, shift = 0) => {
      const b = beats.get(id);
      if (!b) throw new Error(`no clock named ${id} in this stage`);
      return beatAt(b, t, shift);
    },
  };
}
