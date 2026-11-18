/**
 * beat — the stage beat any hazard subscribes to (Matt, 11-13 10:26 AM ET: build what many levels need; the world map has 20 of 90
 * stages on "one clock": pods, snap-jaw stones, sinking pads, rolling nuts, lifts, always with a warning).
 *
 * The beat itself is clock.ts's (ADR-003 decision 4): a stage lists its beats as data (`GeneratedStage.clocks`, each a ClockDef: named
 * phases 'off' / 'warn' / 'on' / 'rest' with their seconds, an offset, Easy's stretch, checkClock's rule that every 'on' comes out of a
 * 'warn'), and the engine runs them on game time (engine.ts: `beatClock` at stage start). A hazard SUBSCRIBES by naming a beat and its
 * lane's stagger (`OnBeat`), and each frame reads where it is (`StageClock.read(clock, shift)`: its phase, how far through, seconds left,
 * seconds to the next 'on'). Pieces on one beat stay in step; the stagger keeps lanes apart, stretched with the beat on Easy.
 *
 * The API (B14, R-165.177 / 1-4.md piece 3; pods are its first user, podfall.ts):
 *   - `beatDef(id, period, tell, on, easyStretch, offset?)`  a hazard's beat: quiet, then a `tell`-second warning, then `on` seconds
 *     of the thing itself, every `period` seconds (Easy: every phase times `easyStretch`, never faster);
 *   - `beatClock(defs, easy, t)`  the engine's StageClock for a stage's beats, at game time t;
 *   - `OnBeat`  what a subscriber carries: `{ clock, shift? }`;
 *   - `warnsIn(def, sub, easy, t0, t1)`  the game times its warnings start in [t0, t1);
 *   - `beatFaults(defs, subs, rule, easy)`  the fairness checks every stage builder runs: each beat passes checkClock and has a warning
 *     at least `rule.tellMin` long; subscribers seen together (within `rule.seen` px) never start their warnings within `rule.apart`
 *     seconds of each other (World 1: one thing at a time), over a whole common cycle; a subscriber's beat exists.
 *
 * Pure (no canvas, no engine, no stage ids).
 */
import { beatOf, checkClock, stageClock, type StageClock } from './clock.ts';
import type { ClockDef, ClockId } from './stageKit.types.ts';

/** a piece on a stage beat: which beat, and its lane's stagger (s on Normal; Easy stretches it with the beat) */
export interface OnBeat {
  clock: ClockId;
  shift?: number;
}

/** a hazard's beat: quiet, a `tell`-second warning, `on` seconds of the thing, every `period` s; Easy times `easyStretch` */
export function beatDef(id: ClockId, period: number, tell: number, on: number, easyStretch = 1, offset = 0): ClockDef {
  const off = period - tell - on;
  return { id, phases: [{ name: 'off', seconds: off }, { name: 'warn', seconds: tell }, { name: 'on', seconds: on }], offset, easyStretch };
}

/** the engine's clock for a stage's beats, standing at game time `t` (a new stage's clock keeps the game's time) */
export function beatClock(defs: readonly ClockDef[], easy: boolean, t = 0): StageClock {
  const c = stageClock(defs, easy);
  c.seek(t);
  return c;
}

/** the seconds into its cycle a beat's warning starts (the first 'warn' phase), or null when it has none */
export function warnAt(def: ClockDef, easy: boolean): number | null {
  const b = beatOf(def, easy);
  let at = 0;
  for (let i = 0; i < b.names.length; i++) {
    if (b.names[i] === 'warn') return at;
    at += b.seconds[i];
  }
  return null;
}

/** the game times a subscriber's warnings start in [t0, t1) (clock.ts cyclePos: cycle k starts at k * period - offset - shift) */
export function warnsIn(def: ClockDef, sub: OnBeat, easy: boolean, t0: number, t1: number): number[] {
  const b = beatOf(def, easy);
  const w = warnAt(def, easy);
  if (w === null || !(b.period > 0)) return [];
  const lead = b.offset + (sub.shift ?? 0) * b.stretch;
  const out: number[] = [];
  for (let k = Math.floor((t0 + lead) / b.period) - 1; ; k++) {
    const at = k * b.period - lead + w;
    if (at >= t1) break;
    if (at >= t0) out.push(at);
  }
  return out;
}

/** how long a beat's warning is (s, on the setting), or 0 */
export function warnLength(def: ClockDef, easy: boolean): number {
  const b = beatOf(def, easy);
  let n = 0;
  for (let i = 0; i < b.names.length; i++) if (b.names[i] === 'warn') n += b.seconds[i];
  return n;
}

/** a subscriber as the fairness check sees it: its beat, an id for the words, and where it is (x; and the heights it spans) */
export interface BeatSeen extends OnBeat {
  id: string;
  x: number;
  y0: number;
  y1: number;
}

/** the fairness rule a stage's beats are checked against */
export interface BeatRule {
  /** a warning's least length (s, Normal; Easy's is longer by its stretch) */
  tellMin: number;
  /** no two warnings seen together start within this long (s) */
  apart: number;
  /** two subscribers this near across (px) and sharing heights are seen together */
  seen: number;
}

/** What is wrong with a stage's beats and their subscribers, in words (none: they may be laid). See the header */
export function beatFaults(defs: readonly ClockDef[], subs: readonly BeatSeen[], rule: BeatRule, easy = false): string[] {
  const out: string[] = [];
  const byId = new Map(defs.map((d) => [d.id, d]));
  for (const d of defs) {
    out.push(...checkClock(d));
    if (warnAt(d, easy) === null) out.push(`beat ${d.id}: no warning`);
    else if (warnLength(d, false) < rule.tellMin - 1e-6) out.push(`beat ${d.id}: its warning is ${warnLength(d, false)} s, under ${rule.tellMin} s`);
  }
  for (const s of subs) if (!byId.has(s.clock)) out.push(`${s.id}: its beat ${s.clock} is not in the stage`);
  for (let i = 0; i < subs.length; i++) {
    for (let j = i + 1; j < subs.length; j++) {
      const a = subs[i], b = subs[j];
      const da = byId.get(a.clock), db = byId.get(b.clock);
      if (!da || !db || Math.abs(a.x - b.x) > rule.seen || a.y1 < b.y0 || b.y1 < a.y0) continue;
      const span = 4 * Math.max(beatOf(da, easy).period, beatOf(db, easy).period);
      const ta = warnsIn(da, a, easy, 0, span), tb = warnsIn(db, b, easy, 0, span);
      if (ta.some((x) => tb.some((y) => Math.abs(x - y) < rule.apart - 1e-6))) out.push(`${a.id} and ${b.id}: their warnings start within ${rule.apart} s`);
    }
  }
  return out;
}
