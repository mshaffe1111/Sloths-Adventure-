/**
 * R-165.59: the tier bots are pinned two ways.
 *   1. Every mapped number equals its tester-profile field (tools/playtesters/profiles/tiers/<tier>.json, `all.<setting>`), every kept
 *      field equals FT_KID's (child) or FT_ADULT's (middle, expert), and each tuning field holds its calibrated value
 *      (reference/qa-reports/R-165.59/BOTS.md has the table).
 *   2. The calibration: the committed runs (reference/qa-reports/R-165.59/calibration-main.jsonl, the current 1-1, variants 1-40; the
 *      runs the bots were calibrated on, 0.9.5's 1-1, are calibration-0.9.5.jsonl: recommitted by INT-1-1 for C1's re-lay) re-judged
 *      give the committed table, and EVERY committed run (5 tiers and settings x variants 1-40: 200) replays exactly as committed, so a
 *      change to the bots, the engine or the stage that moves any run is caught here (R-165.317: a replay of three variants a tier missed
 *      child Easy variant 25's move on t-build-24c).
 *   npx tsx --test tools/inspect/tierBots.test.ts   (all 200 runs: minutes, timed in gates.yml)
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { FT_ADULT, FT_KID, type FirstTimer, type Q5 } from './firsttimer.ts';
import { BOTS, calibrate, loadProfile, runTier, type Calibration, type Setting, type Tier, type TierRun } from './tierBots.ts';

const tiersDir = path.join(import.meta.dirname, '../playtesters/profiles/tiers');
const prof = (tier: Tier) => JSON.parse(fs.readFileSync(path.join(tiersDir, `${tier}.json`), 'utf8'));
const q5 = (d: { p10: number; p25: number; p50: number; p75: number; p90: number }): Q5 => [d.p10, d.p25, d.p50, d.p75, d.p90];
const ms = (q: Q5): Q5 => q.map((v) => v / 1000) as Q5;
/** the share of a profile distribution under x (the same piecewise-linear curve drawQ samples) */
function shareUnder(q: Q5, x: number): number {
  const P = [0.1, 0.25, 0.5, 0.75, 0.9];
  const v0 = q[0] - ((q[1] - q[0]) * 0.1) / 0.15, v1 = q[4] + ((q[4] - q[3]) * 0.1) / 0.15;
  const xs = [v0, ...q, v1], us = [0, ...P, 1];
  if (x <= xs[0]) return 0;
  for (let i = 0; i < xs.length - 1; i++) if (x <= xs[i + 1]) return us[i] + ((x - xs[i]) / (xs[i + 1] - xs[i] || 1)) * (us[i + 1] - us[i]);
  return 1;
}
const KEPT = ['look', 'heed', 'stopReact', 'thumb', 'hold', 'upOnlyT', 'dblAt', 'hopFoe', 'hesitate', 'swap', 'drift', 'thumbSpeed', 'slip', 'slipFrames', 'release', 'releaseMax'] as const;
/** the calibrated tuning fields (BOTS.md "Tuning fields"): a change here is a re-calibration */
const TUNED: Record<string, Partial<FirstTimer>> = {
  'expert normal': { gapShare: 0.5, knowsDouble: true, readHold: 0.5, readDbl: 0.75, readGap: [0.4, 0.9], readAim: 0.5 },
  'middle normal': { gapShare: 0.5, knowsDouble: true, readHold: 0.5, readDbl: 0.75, readGap: [0.4, 0.9], readAim: 0.5 },
  'middle easy': { gapShare: 0.5, knowsDouble: true, readHold: 0.5, readDbl: 0.75, readGap: [0.4, 0.9], readAim: undefined },
  'child normal': { gapShare: undefined, knowsDouble: true, readHold: 0.5, readDbl: 0.5, readGap: [0, 0.9], readAim: undefined },
  'child easy': { gapShare: undefined, knowsDouble: true, readHold: 0.5, readDbl: 0.5, readGap: [0, 0.9], readAim: undefined },
};

for (const tier of ['child', 'middle', 'expert'] as Tier[]) {
  for (const setting of ['easy', 'normal'] as Setting[]) {
    const who = BOTS[tier][setting];
    if (!who) continue;
    test(`${tier} ${setting}: every mapped number is its profile field`, () => {
      const p = prof(tier);
      const a = p.all[setting];
      assert.equal(who.setting, setting);
      assert.deepEqual(who.holdQ, ms(q5(a.jumpHoldMs)), 'holdQ = jumpHoldMs');
      assert.deepEqual(who.aimQ, q5(a.groundPressToLipPx), 'aimQ = groundPressToLipPx');
      assert.equal(who.edgeAim, a.groundPressToLipPx.p50, 'edgeAim = groundPressToLipPx.p50');
      assert.equal(who.lateShare, a.latePressShareOfLipJumps, 'lateShare = latePressShareOfLipJumps');
      assert.deepEqual(who.lateQ, ms(q5(a.latePressAfterLeavingLedgeMs)), 'lateQ = latePressAfterLeavingLedgeMs');
      assert.equal(who.standShare, a.groundPressFromStandstillShare, 'standShare = groundPressFromStandstillShare');
      assert.deepEqual(who.standQ, ms(q5(a.steering.standStillMs)), 'standQ = steering.standStillMs');
      assert.deepEqual(who.dbl2Q, ms(q5(a.secondPressDelayMs)), 'dbl2Q = secondPressDelayMs');
      const firsts = a.jumpHoldMs.n - a.secondPressDelayMs.n - a.airPressWithoutFirstJump;
      assert.ok(Math.abs((who.dblShare ?? -1) - a.secondPressDelayMs.n / firsts) < 0.0015, `dblShare = secondPressDelayMs.n / first presses (${a.secondPressDelayMs.n / firsts})`);
      assert.deepEqual(who.steerQ, ms(q5(a.steering.moveHoldMs)), 'steerQ = steering.moveHoldMs');
      assert.deepEqual(who.gapQ, ms(q5(a.steering.moveGapMs)), 'gapQ = steering.moveGapMs');
      assert.equal(a.doubleUsedShare, 1, 'knowsDouble rests on doubleUsedShare 1.0');
      // upOnly: the share of jump flicks within 10 degrees of straight up (touch.<orientation>.jumpFlickOffVerticalDeg, by flick count)
      let n = 0, s = 0;
      for (const o of ['portrait', 'landscape']) {
        const d = p.touch?.[o]?.jumpFlickOffVerticalDeg;
        if (!d) continue;
        n += d.n;
        s += d.n * shareUnder(q5(d), 10);
      }
      assert.ok(Math.abs(who.upOnly - s / n) < 0.006, `upOnly ${who.upOnly} = flicks under 10 deg ${(s / n).toFixed(3)}`);
      assert.equal(who.short, 0, 'short: the two-frame taps are in holdQ');
      const base = tier === 'child' ? FT_KID : FT_ADULT;
      for (const k of KEPT) assert.deepEqual(who[k], base[k], `${k} kept from ${base.name}`);
      for (const [k, v] of Object.entries(TUNED[`${tier} ${setting}`])) assert.deepEqual((who as unknown as Record<string, unknown>)[k], v, `tuning field ${k}`);
    });
  }
}

const reportDir = path.join(import.meta.dirname, '../../reference/qa-reports/R-165.59');
const lines = fs.readFileSync(path.join(reportDir, 'calibration-main.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
const runs = lines.filter((l) => l.tier) as TierRun[];
const table = lines.filter((l) => l.calibration).map((l) => l.calibration) as Calibration[];

test('the committed calibration runs, judged again, give the committed table', () => {
  assert.ok(table.length >= 4, 'expert normal, middle easy, middle normal, child normal (and child easy, printed)');
  for (const c of table) {
    const rs = runs.filter((r) => r.tier === c.tier && r.setting === c.setting);
    if (c.checked) assert.ok(rs.length >= 40, `${c.tier} ${c.setting}: at least 40 runs (${rs.length})`);
    assert.deepEqual(calibrate(c.tier, c.setting, rs, loadProfile(c.tier, c.setting)!), c, `${c.tier} ${c.setting}`);
  }
});

/** every committed run that replays differently, each named with the fields that moved; `replay` is called once for every committed run */
function movedRuns(committed: readonly TierRun[], replay: (tier: Tier, setting: Setting, variant: number) => TierRun): string[] {
  const out: string[] = [];
  for (const want of committed) {
    const got = replay(want.tier, want.setting, want.variant) as unknown as Record<string, unknown>;
    const w = want as unknown as Record<string, unknown>;
    const fields = [...new Set([...Object.keys(w), ...Object.keys(got)])].filter((k) => !isDeepStrictEqual(w[k], got[k]));
    if (fields.length) out.push(`${want.tier} ${want.setting} variant ${want.variant}: ${fields.map((k) => `${k} ${JSON.stringify(w[k])} -> ${JSON.stringify(got[k])}`).join(', ')}`);
  }
  return out;
}

test('every tier and setting in the table has its 40 variants committed, once each', () => {
  for (const c of table) {
    const vs = runs.filter((r) => r.tier === c.tier && r.setting === c.setting).map((r) => r.variant).sort((a, b) => a - b);
    assert.deepEqual(vs, Array.from({ length: 40 }, (_, i) => i + 1), `${c.tier} ${c.setting}`);
  }
  assert.equal(runs.length, table.length * 40);
});

test('the replay check (planted, R-165.317): one moved run among 200, outside the first three variants, is named, and every run is replayed', () => {
  // (BUILD-24c's case: child Easy variant 25 finished 303.6 s, then 303.5 s; the old replay of variants 1-3 passed it)
  const asCommitted = (tier: Tier, setting: Setting, variant: number) => structuredClone(runs.find((r) => r.tier === tier && r.setting === setting && r.variant === variant)!);
  let calls = 0;
  const count = (tier: Tier, setting: Setting, variant: number) => (calls++, asCommitted(tier, setting, variant));
  assert.deepEqual(movedRuns(runs, count), []);
  assert.equal(calls, runs.length, 'every committed run is replayed');
  const moved = (tier: Tier, setting: Setting, variant: number) => {
    const r = asCommitted(tier, setting, variant) as unknown as Record<string, unknown>;
    if (tier === 'child' && setting === 'easy' && variant === 25) r.finishSeconds = (r.finishSeconds as number) - 0.1;
    return r as unknown as TierRun;
  };
  const named = movedRuns(runs, moved);
  assert.equal(named.length, 1, named.join('; '));
  assert.match(named[0], /^child easy variant 25: finishSeconds \d+(\.\d+)? -> \d+(\.\d+)?$/);
});

test('every committed run (all 200) replays exactly as committed', () => {
  const moved = movedRuns(runs, runTier);
  assert.deepEqual(moved, [], `${moved.length} of ${runs.length} runs moved: re-run the calibration and recommit calibration-main.jsonl (BOTS.md)\n${moved.join('\n')}`);
});
