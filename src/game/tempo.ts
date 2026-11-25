/**
 * tempo — the court's beat (reference/design/2-9.md NEW 1, R-165.449; ENG-29). A stage whose brief names a TEMPO keeps every clock it lays
 * on one bar: a liana's swing is the bar (physics.ts TIMED.period: Normal 2.85 s, Easy 3.3 s), the bar is `beats` beats (B = 0.7125 s Normal,
 * 0.825 s Easy), and every other clock is a whole number of beats with its phase on a beat: a river's log spacing and each log's knock
 * (river.ts logKnocks), a stage clock's period and offset (clock.ts: the snap stones' jaws, a beat pond's breath), and every liana's swing
 * locked to the bar (its swingPhase is the tempo's `lock`, never swingSetup's chain or golden share). Easy keeps the liana's bar: a stage
 * clock stretches by the tempo's own easyStretch, and a river's Easy numbers are its own data (a river's speed never stretches).
 *
 * `tempoFaults` names each clock that is off, in words (where it is, its numbers, the beat it misses). Pure (no canvas, no engine).
 */
import type { Platform, Vine } from './types.ts';
import type { ClockDef } from './stageKit.types.ts';
import { driftCycle, onRiver, type RiverZone } from './river.ts';
import { vinePeriod } from './physics.ts';

/** a stage's tempo (data: the stage's brief, gen2 GraphBrief.tempo) */
export interface TempoSpec {
  /** beats in a bar (the drum's count: ONE a BOOM, the rest a tok) */
  beats: number;
  /** the bar on Normal (s): one liana swing there and back (physics.ts TIMED.period on Normal) */
  bar: number;
  /** Easy's bar as a multiple of Normal's (>= 1; Easy is never faster): Easy keeps the liana's bar (TIMED.period on Easy) */
  easyStretch: number;
  /** the share of a swing (0..1) a liana is at on the bar's ONE: every liana of the stage carries it as its swingPhase */
  lock: number;
}

/** the bar on a setting (s) */
export const tempoBar = (t: TempoSpec, easy: boolean): number => t.bar * (easy ? t.easyStretch : 1);
/** one beat on a setting (s) */
export const tempoBeat = (t: TempoSpec, easy: boolean): number => tempoBar(t, easy) / t.beats;
/** how far a clock may miss a beat (s): the rows are designed numbers (228 px at 80 px/s is 2.85 s exactly), so this is rounding, not play */
export const TEMPO_EPS = 1e-3;

/** whole beats in `s` seconds, or null when `s` is not a whole number of beats (at least one) */
export function beatsIn(s: number, B: number): number | null {
  const n = Math.round(s / B);
  return n >= 1 && Math.abs(s - n * B) <= TEMPO_EPS ? n : null;
}
/** how far game time `t` lies from the nearest beat (s) */
export function offBeat(t: number, B: number): number {
  const r = ((t % B) + B) % B;
  return Math.min(r, B - r);
}
/** how far a swing phase lies from the lock (a share of a swing, 0..0.5) */
const phaseOff = (phase: number, lock: number): number => {
  const r = (((phase - lock) % 1) + 1) % 1;
  return Math.min(r, 1 - r);
};

const s3 = (s: number): string => s.toFixed(3).replace(/\.?0+$/, '');
const s4 = (s: number): string => s.toFixed(4).replace(/\.?0+$/, '');

type TempoStage = { platforms: readonly Platform[]; rivers?: readonly RiverZone[]; vines?: readonly Vine[]; clocks?: readonly ClockDef[] };

/**
 * Every clock of a laid stage that is off its tempo, in words. Rivers: a log every whole number of beats, each log's knock (its cycle's start,
 * river.ts logKnocks) on a beat. Lianas (a swinging one, not a still or climbing vine): its swing is the bar and its phase the lock. Stage
 * clocks: a period of whole beats, its offset on a beat, and Easy's stretch the tempo's own.
 */
export function tempoFaults(st: TempoStage, tempo: TempoSpec, easy: boolean): string[] {
  const out: string[] = [];
  const B = tempoBeat(tempo, easy);
  const bar = tempoBar(tempo, easy);
  const beat = `the beat ${s4(B)} s`;
  for (const r of st.rivers ?? []) {
    if (r.speed === 0 || r.open) continue;
    const logs = st.platforms.filter((p) => p.type === 'drift' && p.drift && onRiver(p.drift, r)).map((p) => p.drift!);
    if (!logs.length) continue;
    const d = logs[0];
    const T = driftCycle(d);
    const spacing = T / logs.length;
    const at = `the river at x ${Math.round(r.x0)}-${Math.round(r.x1)} (${d.speed} px/s, ${d.width} px logs, a log every ${s3(spacing)} s)`;
    const n = beatsIn(spacing, B);
    if (n === null) {
      out.push(`${at}: a log every ${s3(spacing)} s is not a whole number of beats (${beat}: ${s3(spacing / B)} beats)`);
      continue;
    }
    logs.forEach((q, i) => {
      // (log i's cycle starts, its knock, where (t + offset) is a whole cycle: t = -offset)
      const off = offBeat(-q.offset, B);
      if (off > TEMPO_EPS) out.push(`${at}: log ${i + 1}'s knock falls ${s3(off)} s off the beat`);
    });
  }
  for (const v of st.vines ?? []) {
    if (v.vineType === 'tree_climb' || !v.isSwingingVine || v.swingAmp === 0) continue;
    const at = `the liana at x ${Math.round(v.x)}`;
    const p = vinePeriod(v);
    if (Math.abs(p - bar) > TEMPO_EPS) out.push(`${at}: a swing of ${s3(p)} s is not the bar (${s3(bar)} s)`);
    if (v.swingPhase === undefined) out.push(`${at}: its swing is not locked to the bar (no phase; the lock is ${s3(tempo.lock)})`);
    else if (phaseOff(v.swingPhase, tempo.lock) * p > TEMPO_EPS) out.push(`${at}: its swing is not locked to the bar (phase ${s3(v.swingPhase)}, the lock ${s3(tempo.lock)})`);
  }
  for (const c of st.clocks ?? []) {
    const at = `the clock '${c.id}'`;
    if (Math.abs(c.easyStretch - tempo.easyStretch) > 1e-6) out.push(`${at}: Easy stretches it ${s3(c.easyStretch)}, not the bar's ${s3(tempo.easyStretch)}`);
    const k = easy ? c.easyStretch : 1;
    const period = c.phases.reduce((a, q) => a + q.seconds, 0) * k;
    if (beatsIn(period, B) === null) out.push(`${at}: a cycle of ${s3(period)} s is not a whole number of beats (${beat})`);
    const off = offBeat(c.offset * k, B);
    if (off > TEMPO_EPS) out.push(`${at}: its offset falls ${s3(off)} s off the beat`);
  }
  return out;
}

/**
 * Lay a stage's tempo (gen2's finish, the brief's `tempo`): every swinging liana swings the bar on this setting with its phase the lock (so
 * its ONE falls on every bar of game time, which the lianas keep after a flag resume: engine.ts vineClock is the game's clock, R-165.295),
 * then every clock is held to the bar. Returns what is off, in words (tempoFaults).
 */
export function layTempo(st: TempoStage & { vines?: Vine[] }, tempo: TempoSpec, easy: boolean): { problems: string[] } {
  for (const v of st.vines ?? []) {
    if (v.vineType === 'tree_climb' || !v.isSwingingVine || v.swingAmp === 0) continue;
    v.swingPeriod = tempoBar(tempo, easy);
    v.swingPhase = tempo.lock;
  }
  return { problems: tempoFaults(st, tempo, easy) };
}
