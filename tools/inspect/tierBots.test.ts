/**
 * R-165.59: the tier bots are pinned two ways.
 *   1. Every mapped number equals its tester-profile field (tools/playtesters/profiles/tiers/<tier>.json, `all.<setting>`), every kept
 *      field equals FT_KID's (child) or FT_ADULT's (middle, expert), and each tuning field holds its calibrated value
 *      (reference/qa-reports/R-165.59/BOTS.md has the table).
 *   2. The calibration: the committed runs (reference/qa-reports/R-165.59/calibration-main.jsonl, the current 1-1, variants 1-40; the
 *      runs the bots were calibrated on, 0.9.5's 1-1, are calibration-0.9.5.jsonl: recommitted by INT-1-1 for C1's re-lay) re-judged
 *      give the committed table, and a short replay of three variants per tier and setting gives exactly the committed lines, so a change
 *      to the bots, the engine or the stage that moves a run is caught here.
 *   npx tsx --test tools/inspect/tierBots.test.ts   (about 40 s)
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
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

test('three variants a tier and setting replay exactly as committed', () => {
  for (const c of table) {
    for (const v of [1, 2, 3]) {
      const want = runs.find((r) => r.tier === c.tier && r.setting === c.setting && r.variant === v);
      assert.ok(want, `${c.tier} ${c.setting} variant ${v} committed`);
      assert.deepEqual(runTier(c.tier, c.setting, v), want, `${c.tier} ${c.setting} variant ${v}`);
    }
  }
});
