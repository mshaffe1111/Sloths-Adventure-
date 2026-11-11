/**
 * The tier bots on a stage (R-165.59): the child, middle and expert players from the testers' saved numbers (firsttimer.ts FT_CHILD,
 * FT_MIDDLE, FT_EXPERT and their _EASY twins), one JSON line a run, and with --calibrate their results set against the tier's own
 * (tools/playtesters/profiles/tiers/<tier>.json) with the R-165.59 tolerances, one JSON line a tier and setting.
 *   npx tsx tools/inspect/tierBots.ts --stage 1-1 --tiers child,middle,expert --seeds 1-40 --setting easy|normal|both [--calibrate]
 * A seed is a 1-1 VARIANT (RealPlay -> setLayoutVariant -> play11Seed -> provenSeedFor(n - 1)), not a gen2 seed.
 * Each tier plays only the settings its testers played (expert: Normal; middle: both; child: both, its one Easy run an outlier).
 * A rescue (the bot's put-on after 20 s stuck, which no player has) is counted per run: in a middle or expert run it is a calibration miss.
 */
import fs from 'node:fs';
import path from 'node:path';
import { firstTimer, FT_CHILD, FT_CHILD_EASY, FT_EXPERT, FT_MIDDLE, FT_MIDDLE_EASY, type FirstTimer } from './firsttimer.ts';
import { RealPlay } from '../../src/game/realPlay.ts';
import { setDifficulty } from '../../src/game/difficulty.ts';

export type Tier = 'child' | 'middle' | 'expert';
export type Setting = 'easy' | 'normal';
export const BOTS: Record<Tier, Partial<Record<Setting, FirstTimer>>> = {
  child: { normal: FT_CHILD, easy: FT_CHILD_EASY },
  middle: { normal: FT_MIDDLE, easy: FT_MIDDLE_EASY },
  expert: { normal: FT_EXPERT },
};

export interface TierRun {
  tier: Tier;
  setting: Setting;
  stage: string;
  variant: number;
  end: string;
  /** game time at the shrine (s), null when he did not get there */
  finishSeconds: number | null;
  lives: number;
  putbacks: number;
  rescues: number;
  secondPressMs: number[];
  /** the pieces he entered, in order, and in each the lives and put-backs (soft falls) it cost him */
  pieces: Array<{ id: string; lives: number; putbacks: number; seconds: number }>;
  stuck: Array<{ x: number; t: number; piece: string | null; what: string; rescued: boolean }>;
}

/** the gen2 pieces of a variant on a setting, left to right (stage.gen2.sections) */
export function piecesOf(stage: string, variant: number, setting: Setting): Array<{ id: string; x0: number; x1: number }> {
  setDifficulty(setting);
  const st = new RealPlay(stage, variant).stage as { gen2?: { sections?: Array<{ template: string; x0: number; x1: number }> } };
  return (st.gen2?.sections ?? []).map((s) => ({ id: s.template, x0: s.x0, x1: s.x1 }));
}
/** the piece at x: the last one starting at or before it (a join between two pieces belongs to the one before) */
export function pieceAt(pieces: Array<{ id: string; x0: number }>, x: number): string | null {
  let at: string | null = null;
  for (const p of pieces) if (p.x0 <= x) at = p.id;
  return at;
}

export function runTier(tier: Tier, setting: Setting, variant: number, stage = '1-1'): TierRun {
  const who = BOTS[tier][setting];
  if (!who) throw new Error(`no ${tier} bot on ${setting}`);
  const pieces = piecesOf(stage, variant, setting);
  // (the child tier's median finish is 444 s, over the first-timer's 360 s cap: a tier run has 20 minutes)
  const r = firstTimer(stage, variant, who, { cap: 1200 });
  const maxX = r.maxX ?? r.x;
  const entered = pieces.filter((p) => p.x0 <= maxX || r.end === 'shrine');
  const tally = entered.map((p) => ({ id: p.id, lives: 0, putbacks: 0, seconds: 0 }));
  // (seconds in each piece: his place every 0.5 s, as the profiles' pieces.<id>.seconds count time in a section's slice)
  for (const x of r.xTrace ?? []) {
    const row = tally.find((q) => q.id === pieceAt(pieces, x));
    if (row) row.seconds += 0.5;
  }
  const add = (x: number, k: 'lives' | 'putbacks') => {
    const id = pieceAt(pieces, x);
    const row = tally.find((q) => q.id === id);
    if (row) row[k]++;
  };
  for (const h of r.harms) if (h.kind === 'life') add(h.x, 'lives');
  for (const x of r.softFallXs ?? []) add(x, 'putbacks');
  return {
    tier, setting, stage, variant, end: r.end, finishSeconds: r.end === 'shrine' ? r.time : null,
    lives: r.harms.filter((h) => h.kind === 'life').length, putbacks: r.softFalls ?? 0, rescues: r.rescues, secondPressMs: r.secondPressMs ?? [],
    pieces: tally, stuck: r.stuck.map((s) => ({ x: s.x, t: s.t, piece: pieceAt(pieces, s.x), what: s.what, rescued: s.rescued })),
  };
}

// ───────────────────────────── calibration ─────────────────────────────

/** nearest-rank percentile, as the profiles have it */
export function pct(xs: number[], p: number): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.max(0, Math.ceil((p / 100) * s.length) - 1)];
}
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const r2 = (x: number | null) => (x === null ? null : Math.round(x * 100) / 100);

export interface TierProfile {
  finishSeconds: { p50: number };
  livesPerRun: number;
  putbacksPerRun: number;
  secondPressDelayMs: { p50: number };
  runsPlayed: number;
  pieces: Record<string, { runs: number; lives: number; putbacks: number; seconds?: { p50: number } }>;
}

/** seconds in each piece, bot vs tier (p50 over the runs that entered it), pieces with 5+ runs on both sides */
export function pieceSeconds(runs: TierRun[], prof: TierProfile): Array<{ id: string; tierRuns: number; tierP50: number; botRuns: number; botP50: number }> {
  const bot: Record<string, number[]> = {};
  for (const r of runs) for (const p of r.pieces) (bot[p.id] ??= []).push(p.seconds);
  return Object.entries(prof.pieces ?? {})
    .filter(([id, v]) => v.runs >= 5 && (bot[id]?.length ?? 0) >= 5 && v.seconds)
    .map(([id, v]) => ({ id, tierRuns: v.runs, tierP50: v.seconds!.p50, botRuns: bot[id].length, botP50: pct(bot[id], 50) as number }))
    .sort((a, b) => (a.id < b.id ? -1 : 1));
}
export function loadProfile(tier: Tier, setting: Setting, dir = path.join(import.meta.dirname, '../playtesters/profiles/tiers')): TierProfile | null {
  const j = JSON.parse(fs.readFileSync(path.join(dir, `${tier}.json`), 'utf8'));
  return j.all?.[setting] ?? null;
}

export interface Check { name: string; bot: number | string | null; tier: number | string | null; tol: string; pass: boolean }
export interface Calibration { tier: Tier; setting: Setting; runs: number; finished: number; rescues: number; checked: boolean; pass: boolean; checks: Check[] }

/** the top three pieces by rate (lives + put-backs a run that entered it), pieces with 5+ runs on both sides, ties by piece id */
export function topPieces(rates: Record<string, { runs: number; hurt: number }>, both: Set<string>): string[] {
  return Object.entries(rates)
    .filter(([id, v]) => v.runs >= 5 && both.has(id))
    .map(([id, v]) => ({ id, rate: v.hurt / v.runs }))
    .sort((a, b) => b.rate - a.rate || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .slice(0, 3)
    .map((q) => q.id);
}

/**
 * The R-165.59 checks: finish p50 within 12%; lives and put-backs a run (means) within max(30%, 0.3); the second press's delay p50 within
 * 25%; the top three pieces by rate, two of three the same; and no rescue in a middle or expert run. `checked` is false for the child on
 * Easy (one run, an outlier) and the result is printed only.
 */
export function calibrate(tier: Tier, setting: Setting, runs: TierRun[], prof: TierProfile): Calibration {
  const fin = runs.filter((r) => r.finishSeconds !== null).map((r) => r.finishSeconds as number);
  const checks: Check[] = [];
  const within = (name: string, bot: number | null, want: number, tol: number, tolName: string) =>
    checks.push({ name, bot: r2(bot), tier: want, tol: tolName, pass: bot !== null && Math.abs(bot - want) <= tol + 1e-9 });
  within('finishSeconds p50', pct(fin, 50), prof.finishSeconds.p50, 0.12 * prof.finishSeconds.p50, '12%');
  const lv = mean(runs.map((r) => r.lives)), pb = mean(runs.map((r) => r.putbacks));
  within('livesPerRun mean', lv, prof.livesPerRun, Math.max(0.3 * prof.livesPerRun, 0.3), 'max(30%, 0.3)');
  within('putbacksPerRun mean', pb, prof.putbacksPerRun, Math.max(0.3 * prof.putbacksPerRun, 0.3), 'max(30%, 0.3)');
  within('secondPressDelayMs p50', pct(runs.flatMap((r) => r.secondPressMs), 50), prof.secondPressDelayMs.p50, 0.25 * prof.secondPressDelayMs.p50, '25%');
  // pieces
  const bot: Record<string, { runs: number; hurt: number }> = {};
  for (const r of runs) for (const p of r.pieces) {
    const b = (bot[p.id] ??= { runs: 0, hurt: 0 });
    b.runs++;
    b.hurt += p.lives + p.putbacks;
  }
  const tierRates: Record<string, { runs: number; hurt: number }> = {};
  for (const [id, v] of Object.entries(prof.pieces ?? {})) tierRates[id] = { runs: v.runs, hurt: v.lives + v.putbacks };
  const both = new Set(Object.keys(bot).filter((id) => bot[id].runs >= 5 && (tierRates[id]?.runs ?? 0) >= 5));
  const tb = topPieces(bot, both), tt = topPieces(tierRates, both);
  const same = tb.filter((id) => tt.includes(id)).length;
  checks.push({ name: 'top three pieces', bot: tb.map((id) => `${id} ${r2(bot[id].hurt / bot[id].runs)}`).join(', '), tier: tt.map((id) => `${id} ${r2(tierRates[id].hurt / tierRates[id].runs)}`).join(', '), tol: '2 of 3 the same', pass: same >= Math.min(2, tt.length) });
  const rescues = runs.reduce((a, r) => a + r.rescues, 0);
  checks.push({ name: 'rescues', bot: rescues, tier: 0, tol: tier === 'child' ? 'printed (no player has one)' : 'none (a rescue is a miss)', pass: tier === 'child' || rescues === 0 });
  const checked = !(tier === 'child' && setting === 'easy');
  return { tier, setting, runs: runs.length, finished: fin.length, rescues, checked, pass: checked && checks.every((c) => c.pass), checks };
}

// ───────────────────────────── the command ─────────────────────────────

const range = (s: string) => s.split(',').flatMap((p) => { const [a, b] = p.split('-').map(Number); return Array.from({ length: (b ?? a) - a + 1 }, (_, i) => a + i); });
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const arg = (k: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
  const stage = arg('--stage') ?? '1-1';
  const tiers = (arg('--tiers') ?? 'child,middle,expert').split(',') as Tier[];
  const seeds = range(arg('--seeds') ?? '1-40');
  const want = arg('--setting') ?? 'both';
  const settings: Setting[] = want === 'both' ? ['easy', 'normal'] : [want as Setting];
  const cal = process.argv.includes('--calibrate');
  const out: Calibration[] = [];
  for (const tier of tiers) for (const setting of settings) {
    if (!BOTS[tier][setting]) continue;
    const runs: TierRun[] = [];
    for (const v of seeds) {
      try {
        const r = runTier(tier, setting, v, stage);
        runs.push(r);
        console.log(JSON.stringify(r));
      } catch (err) {
        console.log(JSON.stringify({ tier, setting, stage, variant: v, error: String(err).slice(0, 300) }));
      }
    }
    if (cal) {
      const prof = loadProfile(tier, setting);
      if (prof) {
        out.push(calibrate(tier, setting, runs, prof));
        console.log(JSON.stringify({ pieceSeconds: { tier, setting, rows: pieceSeconds(runs, prof) } }));
      }
    }
  }
  for (const c of out) console.log(JSON.stringify({ calibration: c }));
}
