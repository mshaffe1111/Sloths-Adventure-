// ONE's press margin on a locked court (ENG-29-f G6, the lead's ruling from the real engine's read: reference/qa-reports/ENG-29/REPORT.md,
// probes/oneMargin.ts): a press on the drum's ONE that lands is not enough (lockedDrops' `one` read true at every lock the engine swept);
// the press must sit INSIDE its run of landing presses with tempo.ts ONE_MARGIN to spare on each side, early and late (0.20 s Normal,
// 0.30 s Easy). On the tempo toy (worlds/w2TempoToy.ts) the model's margins move with the lock as the engine's did on 2-9's draft: GREEN
// at the toy's lock 0 (every court liana keeps the margin, gen2 clean, seeds 1-4, both settings); REFUSED by name at lock 0.06, where ONE
// still lands (`one` true: the old check passes it) but its late side is under the bar on both settings.
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGen2Stage } from './pipeline.ts';
import { withTestStage } from './listed.ts';
import { COURT_TEMPO, TEMPO_ID, tempoCfg, tempoKit, tempoRow, type TempoToyOpts } from './worlds/w2TempoToy.ts';
import { lockedLianas } from './riverLay.ts';
import { ONE_MARGIN, tempoFaults } from '../tempo.ts';

const build = (seed: number, difficulty: 'normal' | 'easy', o: TempoToyOpts = {}) =>
  withTestStage({ [TEMPO_ID]: tempoRow(o) }, () => buildGen2Stage({ config: tempoCfg(), kit: tempoKit(o), seed, difficulty }));
const at = (lock: number): TempoToyOpts => ({ tempo: { ...COURT_TEMPO, lock } });

test('the bar: Easy is never tighter than Normal; both at least 6 frames (0.20 s)', () => {
  assert.ok(ONE_MARGIN.easy >= ONE_MARGIN.normal);
  assert.ok(ONE_MARGIN.normal >= 0.2 - 1e-9);
});

test('one margin, GREEN: at the toy\'s lock every court liana\'s press on ONE keeps the bar early and late, gen2 clean, seeds 1-4, both settings', () => {
  for (const difficulty of ['normal', 'easy'] as const) for (let seed = 1; seed <= 4; seed++) {
    const where = `${difficulty} seed ${seed}`;
    const st = build(seed, difficulty);
    assert.deepEqual(st.gen2.errors, [], where);
    const L = lockedLianas(st, difficulty);
    assert.ok(L.length >= 3, `${where}: locked court lianas (${L.length})`);
    const need = ONE_MARGIN[difficulty];
    for (const { liana, drops } of L) {
      assert.ok(drops.one, `${where}: x ${Math.round(liana.x)} ONE lands`);
      assert.ok(drops.early >= need - 1e-3 && drops.late >= need - 1e-3, `${where}: x ${Math.round(liana.x)} keeps ${drops.early.toFixed(3)} / ${drops.late.toFixed(3)} s`);
      assert.ok(drops.early + drops.late + 1 / 30 <= drops.window + 1e-6, `${where}: x ${Math.round(liana.x)} the margins sit inside the run`);
    }
  }
});

test('one margin, REFUSED: at lock 0.06 ONE still lands (the old check is blind) but its late side is under the bar, named in gen2\'s errors, both settings', () => {
  for (const difficulty of ['normal', 'easy'] as const) for (const seed of [1, 2]) {
    const where = `${difficulty} seed ${seed}`;
    const st = build(seed, difficulty, at(0.06));
    const L = lockedLianas(st, difficulty);
    assert.ok(L.length >= 3 && L.every((q) => q.drops.one), `${where}: every press on ONE lands`);
    const short = L.filter((q) => q.drops.late < ONE_MARGIN[difficulty] - 1e-3);
    assert.ok(short.length >= 1, `${where}: a liana short of the late margin`);
    const errs = st.gen2.errors.join('; ');
    const need = difficulty === 'easy' ? '0\\.3 s a side Easy' : '0\\.2 s a side Normal';
    for (const q of short) assert.match(errs, new RegExp(`the liana at x ${Math.round(q.liana.x)} over the river at x \\d+-\\d+: a press on ONE keeps [\\d.]+ s late, under the ${need} needs \\(ONE's margin: [\\d.]+ s early / [\\d.]+ s late\\)`), where);
    assert.deepEqual(tempoFaults(st, { ...COURT_TEMPO, lock: 0.06 }, difficulty === 'easy').filter((f) => /ONE keeps/.test(f)).length >= 1, true, `${where}: tempoFaults names it`);
  }
});
