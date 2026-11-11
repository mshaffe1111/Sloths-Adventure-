/**
 * The C1 re-lay's judge (R-165.72, the C1 packet's done-item 7): the passed tier bots (tierBots.ts, t-bots-tiers@42c83a77) over 1-1's
 * variants on the CURRENT checkout, the five tier and setting rows, set against the A1 baseline (R-165.59 calibration-a1.jsonl):
 *   - rescues: none in a middle or expert run (a rescue is the bot's put-on after 20 s stuck, which no player has);
 *   - put-backs a run, per tier and setting, outside the double-test pieces (DOUBLE_TEST_PIECES): no higher than the baseline's;
 *   - lives, counted with the engine's REAL loseLife (RealPlay stubs it, realPlay.ts:141; firsttimer.ts replaces the stub with a wrapper
 *     that calls GameEngine.prototype.loseLife, firsttimer.ts:935-946; this tool wraps that prototype method too, so each life is one real
 *     engine call, its reason named): 0 on Normal;
 *   - length: the EXPERT tier's minimum finish over all the variants, each setting it has a bot for, at least 120 s, 100 s on a climb
 *     (STAGE-RULES.md:68 "Climbs count 20 s short"; eraRoll.ts isClimb, the one definition);
 *   - every run builds and plays (an error is a FAIL, never skipped);
 *   - the per-piece table: runs that entered each piece, put-backs and lives a run there, seconds p50, candidate against baseline.
 *
 *   npx tsx tools/inspect/c1judge.ts [--baseline reference/qa-reports/R-165.59/calibration-a1.jsonl] [--seeds 1-40]
 *     [--rows expert:normal,middle:easy,middle:normal,child:easy,child:normal] [--out runs.jsonl] [--pieces all|<tier:setting>]
 *
 * It refuses to run without the passed bots: the checkout must contain t-bots-tiers@42c83a77 (attempt 1, 164e4cf8, failed its
 * calibration). Exit code 0 when every check passes, 1 when one fails, 2 when it refuses.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { runTier, pct, type Setting, type Tier, type TierRun } from './tierBots.ts';
import { GameEngine } from '../../src/game/engine.ts';

/** the tier bots' passed head (the lead, 11-11: "the tier bots PASSED at t-bots-tiers@42c83a77"), and the attempt that did not pass */
export const BOTS_PASSED = '42c83a77';
export const BOTS_FAILED = '164e4cf8';
export const ROWS: ReadonlyArray<readonly [Tier, Setting]> = [['expert', 'normal'], ['middle', 'easy'], ['middle', 'normal'], ['child', 'easy'], ['child', 'normal']];
export const LENGTH = { minSeconds: 120, climbShort: 20 } as const;
/**
 * The pieces that lay the double TEST gap on Normal (w1.ts DOUBLE_TEST 253-256, after a practice gap): the C1 Critic upheld PUSHBACK 2
 * (11-11): the extra put-backs there are the designed test, so put-backs are judged outside them (INT-1-1 item 6). Read from w1.ts: the
 * packet named four; the code lays the test gap in five (w1-high-step-twist's `t X` version is the fifth), all five are left out.
 */
export const DOUBLE_TEST_PIECES: readonly string[] = ['w1-dip-double-teach', 'w1-double-teach', 'w1-bank-double-teach', 'w1-two-answers', 'w1-high-step-twist'];
/** a run's put-backs outside the double-test pieces */
export const putbacksOutside = (r: TierRun): number => r.putbacks - r.pieces.filter((p) => DOUBLE_TEST_PIECES.includes(p.id)).reduce((a, p) => a + p.putbacks, 0);

/** why the judge will not run on this checkout, or null: the passed bots must be in it, and HEAD is never the failed attempt */
export function refusal(head: string, hasPassed: boolean): string | null {
  if (head.startsWith(BOTS_FAILED)) return `HEAD is ${BOTS_FAILED} (the tier bots' attempt 1, which failed its calibration): judge on a checkout that contains t-bots-tiers@${BOTS_PASSED}`;
  if (!hasPassed) return `this checkout does not contain the passed tier bots (t-bots-tiers@${BOTS_PASSED}): merge origin/t-bots-tiers at or after it first`;
  return null;
}

/** a judged run: the bot's run, and each real loseLife's reason in it */
export type JudgedRun = TierRun & { causes?: string[] };
export interface Row {
  tier: Tier; setting: Setting; runs: number; finished: number; errors: string[];
  rescues: number; baseRescues: number | null;
  putbacksPerRun: number; basePutbacksPerRun: number | null;
  /** put-backs a run outside DOUBLE_TEST_PIECES (the check reads these), candidate and baseline */
  outsidePerRun: number; baseOutsidePerRun: number | null;
  lives: number; causes: Record<string, number>; baseLives: number | null;
  finishMin: number | null; finishP50: number | null; baseFinishMin: number | null; baseFinishP50: number | null;
  checks: Array<{ name: string; pass: boolean; why: string }>;
}
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const r2 = (x: number) => Math.round(x * 100) / 100;

/** one row against its baseline (the baseline's runs of the same tier and setting; none: the comparisons say so and fail) */
export function judgeRow(tier: Tier, setting: Setting, runs: JudgedRun[], errors: string[], base: TierRun[], climb: boolean): Row {
  const fin = runs.filter((r) => r.finishSeconds !== null).map((r) => r.finishSeconds as number);
  const bfin = base.filter((r) => r.finishSeconds !== null).map((r) => r.finishSeconds as number);
  const causes: Record<string, number> = {};
  for (const r of runs) for (const c of r.causes ?? []) causes[c] = (causes[c] ?? 0) + 1;
  const row: Row = {
    tier, setting, runs: runs.length, finished: fin.length, errors,
    rescues: runs.reduce((a, r) => a + r.rescues, 0), baseRescues: base.length ? base.reduce((a, r) => a + r.rescues, 0) : null,
    putbacksPerRun: r2(mean(runs.map((r) => r.putbacks))), basePutbacksPerRun: base.length ? r2(mean(base.map((r) => r.putbacks))) : null,
    outsidePerRun: r2(mean(runs.map(putbacksOutside))), baseOutsidePerRun: base.length ? r2(mean(base.map(putbacksOutside))) : null,
    lives: runs.reduce((a, r) => a + r.lives, 0), causes, baseLives: base.length ? base.reduce((a, r) => a + r.lives, 0) : null,
    finishMin: fin.length ? Math.min(...fin) : null, finishP50: pct(fin, 50), baseFinishMin: bfin.length ? Math.min(...bfin) : null, baseFinishP50: pct(bfin, 50),
    checks: [],
  };
  const C = row.checks;
  C.push({ name: 'every run plays', pass: errors.length === 0 && runs.length > 0, why: errors.length ? `${errors.length} errors: ${errors[0].slice(0, 160)}` : `${runs.length} runs` });
  if (tier !== 'child') C.push({ name: 'no rescues (middle, expert)', pass: runs.length > 0 && row.rescues === 0, why: `${row.rescues} (baseline ${row.baseRescues ?? 'none'})` });
  // (outside the double-test pieces, both sides read the same way; the whole-run numbers are printed beside it)
  C.push({ name: 'put-backs a run <= baseline', pass: runs.length > 0 && row.baseOutsidePerRun !== null && row.outsidePerRun <= row.baseOutsidePerRun + 1e-9, why: `${row.outsidePerRun} vs ${row.baseOutsidePerRun ?? 'no baseline row'} outside the double tests (whole run ${row.putbacksPerRun} vs ${row.basePutbacksPerRun ?? '-'})` });
  if (setting === 'normal') C.push({ name: 'lives 0 on Normal (real loseLife)', pass: runs.length > 0 && row.lives === 0, why: `${row.lives}${row.lives ? ` (${Object.entries(causes).map(([k, n]) => `${k} ${n}`).join(', ')})` : ''}` });
  if (tier === 'expert') {
    const floor = LENGTH.minSeconds - (climb ? LENGTH.climbShort : 0);
    // (every variant must finish for its minimum to be the stage's: an unfinished run is no length at all)
    C.push({ name: `expert minimum finish >= ${floor} s${climb ? ' (a climb)' : ''}`, pass: row.finishMin !== null && fin.length === runs.length && row.finishMin >= floor, why: `min ${row.finishMin ?? '-'} s over ${fin.length} of ${runs.length} finished (baseline min ${row.baseFinishMin ?? '-'})` });
  }
  return row;
}

/** the per-piece table of one row: each piece's runs, put-backs and lives a run that entered it, seconds p50; candidate | baseline */
export function pieceTable(runs: TierRun[], base: TierRun[]): string[] {
  const agg = (rs: TierRun[]) => {
    const m: Record<string, { runs: number; pb: number; lives: number; secs: number[] }> = {};
    for (const r of rs) for (const p of r.pieces) {
      const a = (m[p.id] ??= { runs: 0, pb: 0, lives: 0, secs: [] });
      a.runs++; a.pb += p.putbacks; a.lives += p.lives; a.secs.push(p.seconds);
    }
    return m;
  };
  const c = agg(runs), b = agg(base);
  const ids = [...new Set([...Object.keys(c), ...Object.keys(b)])].sort((x, y) => (c[y]?.pb ?? 0) / (c[y]?.runs || 1) - (c[x]?.pb ?? 0) / (c[x]?.runs || 1) || (x < y ? -1 : 1));
  const cell = (a: (typeof c)[string] | undefined) => (a ? `${a.runs} | ${r2(a.pb / a.runs)} | ${r2(a.lives / a.runs)} | ${pct(a.secs, 50)}` : '- | - | - | -');
  return ['| piece | runs | put-backs/run | lives/run | s p50 | base runs | base put-backs/run | base lives/run | base s p50 |', '|---|---|---|---|---|---|---|---|---|', ...ids.map((id) => `| ${id} | ${cell(c[id])} | ${cell(b[id])} |`)];
}

/** the baseline's runs (calibration-a1.jsonl: one run a line, then the summary lines, which carry no `pieces`) */
export function loadRuns(file: string): TierRun[] {
  return fs.readFileSync(file, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l)).filter((j) => j.tier && Array.isArray(j.pieces));
}

// ───────────────────────────── the command ─────────────────────────────
const range = (s: string) => s.split(',').flatMap((p) => { const [a, b] = p.split('-').map(Number); return Array.from({ length: (b ?? a) - a + 1 }, (_, i) => a + i); });
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const arg = (k: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
  const root = path.join(import.meta.dirname, '../..');
  const git = (...a: string[]) => { try { return execFileSync('git', a, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { return null; } };
  const head = git('rev-parse', 'HEAD') ?? '';
  const why = refusal(head, git('merge-base', '--is-ancestor', BOTS_PASSED, 'HEAD') !== null);
  if (why) { console.error(`c1judge refuses: ${why}`); process.exit(2); }
  const baseFile = arg('--baseline') ?? path.join(root, 'reference/qa-reports/R-165.59/calibration-a1.jsonl');
  const base = loadRuns(baseFile);
  const seeds = range(arg('--seeds') ?? '1-40');
  const rows = arg('--rows') ? arg('--rows')!.split(',').map((s) => s.split(':') as [Tier, Setting]) : ROWS;
  const outFile = arg('--out');
  const showPieces = arg('--pieces') ?? 'all';
  // (written as it goes, synchronously: the command ends with process.exit, which would cut a stream short)
  if (outFile) fs.writeFileSync(outFile, '');
  const out = outFile ? { write: (l: string) => fs.appendFileSync(outFile, l) } : null;

  // (each real loseLife's reason, as the engine is asked it: the bot's wrapper calls this prototype method, firsttimer.ts:946)
  const P = GameEngine.prototype as unknown as { loseLife: (reason: string) => unknown };
  const real = P.loseLife;
  let causes: string[] = [];
  P.loseLife = function (this: unknown, reason: string) { causes.push(reason); return real.call(this, reason); };

  // (a climb, STAGE-RULES.md:68: the stage as the engine builds it, eraRoll.ts isClimb)
  let climb = false;
  try {
    const { isClimb } = await import('./eraRoll.ts');
    const { RealPlay, levelConfig } = await import('../../src/game/realPlay.ts');
    climb = isClimb(levelConfig('1-1'), new RealPlay('1-1', seeds[0]).stage as never);
  } catch (e) { console.log(`(climb: the stage did not build, judged as no climb, the stricter floor: ${String(e).slice(0, 120)})`); }

  console.log(`c1judge: HEAD ${head.slice(0, 8)}, bots ${BOTS_PASSED} in it, baseline ${path.relative(root, baseFile)} (${base.length} runs), variants ${arg('--seeds') ?? '1-40'}, 1-1 ${climb ? 'a climb (100 s floor)' : 'not a climb (120 s floor)'}`);
  const judged: Row[] = [];
  const tables: Array<[string, string[]]> = [];
  for (const [tier, setting] of rows) {
    const runs: JudgedRun[] = [], errors: string[] = [];
    const t0 = Date.now();
    for (const v of seeds) {
      causes = [];
      try {
        const r: JudgedRun = { ...runTier(tier, setting, v, '1-1'), causes };
        if (r.lives !== causes.length) errors.push(`v${v}: the bot counted ${r.lives} lives, the engine's loseLife was called ${causes.length} times`);
        runs.push(r);
        out?.write(JSON.stringify(r) + '\n');
      } catch (err) {
        errors.push(`v${v}: ${String(err).slice(0, 300)}`);
        out?.write(JSON.stringify({ tier, setting, stage: '1-1', variant: v, error: String(err).slice(0, 300) }) + '\n');
      }
    }
    const b = base.filter((r) => r.tier === tier && r.setting === setting);
    const row = judgeRow(tier, setting, runs, errors, b, climb);
    judged.push(row);
    out?.write(JSON.stringify({ c1judge: row }) + '\n');
    if (showPieces === 'all' || showPieces === `${tier}:${setting}`) tables.push([`${tier} ${setting}`, pieceTable(runs, b)]);
    console.log(`  ${tier} ${setting}: ${runs.length} runs, ${errors.length} errors, ${Math.round((Date.now() - t0) / 1000)} s`);
  }

  console.log('\n| tier | setting | runs | finished | rescues (base) | put-backs/run outside the double tests (base); whole run | lives (base), kinds | finish min / p50 (base) | verdict |');
  console.log('|---|---|---|---|---|---|---|---|---|');
  for (const r of judged) {
    const kinds = Object.entries(r.causes).map(([k, n]) => `${k} ${n}`).join(', ');
    console.log(`| ${r.tier} | ${r.setting} | ${r.runs} | ${r.finished} | ${r.rescues} (${r.baseRescues ?? '-'}) | ${r.outsidePerRun} (${r.baseOutsidePerRun ?? '-'}); ${r.putbacksPerRun} (${r.basePutbacksPerRun ?? '-'}) | ${r.lives} (${r.baseLives ?? '-'})${kinds ? `, ${kinds}` : ''} | ${r.finishMin ?? '-'} / ${r.finishP50 ?? '-'} (${r.baseFinishMin ?? '-'} / ${r.baseFinishP50 ?? '-'}) | ${r.checks.every((c) => c.pass) ? 'PASS' : 'FAIL'} |`);
  }
  if (!rows.some(([t, s]) => t === 'expert' && s === 'easy')) console.log('\n(length on Easy: there is no expert Easy bot, the expert testers played no Easy runs, tierBots.ts BOTS; the Easy minimum is the middle row\'s, printed above)');
  console.log('\nchecks:');
  for (const r of judged) for (const c of r.checks) console.log(`  ${c.pass ? 'PASS' : 'FAIL'} ${r.tier} ${r.setting}: ${c.name}: ${c.why}`);
  for (const [name, t] of tables) console.log(`\nper piece, ${name} (sorted by put-backs a run):\n${t.join('\n')}`);
  const pass = judged.every((r) => r.checks.every((c) => c.pass));
  console.log(`\nC1 done-item 7: ${pass ? 'PASS' : 'FAIL'}`);
  process.exit(pass ? 0 : 1);
}
