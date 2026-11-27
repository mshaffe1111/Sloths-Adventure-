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
import { courtFalls, courtLands, fallOnLog, letGoFall, lockedLianas } from './riverLay.ts';
import { driftX, type DriftInfo } from '../river.ts';
import type { PressLaunch } from '../physics.ts';
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

// (ENG-29-h, the lead's ruling 2: the model is never looser than the engine.) The hole the engine read found on 2-9's draft (x14389 grip
// 0.95, the press j +4: reference/qa-reports/ENG-29/probes/oneMarginR-hole-x14389-g0.95-j4.txt): the engine's own launch (its first
// flight frame's state, from the trace; engine frames 0-18 flown released reproduce the engine to 0.02 px), a log 127.5 px long drifting
// right at 140 px/s, its top at 798. Released (the engine read's input, the child's hold ending before the top) his feet go through the
// top on frame 18 at x 14600.35 and his middle is 0.45 px short of the log's end: the water. Held through the flight (letGoFall's), the
// float keeps him over the top a frame longer, and frame 19's crossing 9 px on takes the log. The court's catch (courtLands) needs both.
test('the court\'s catch is never looser than the engine: the traced log-end press lands only if it lands released too', () => {
  const l: PressLaunch = { x: 14388.75, y: 727.48, vx: 502.7, vy: -499.4, t: -1 / 30, px: 14372, py: 744.1, pt: -1 / 30 };
  const base = { x0: 14224, x1: 14894.5, dir: 1 as const, speed: 140, width: 127.5, baseY: 798 };
  // (the log's left end at 14614 on frame 18, as he crosses: 0.45 px past his middle's reach, 14600.35 + 13.2)
  const off = (14614 - base.x0 + base.width) / base.speed - 18 / 30;
  const log: DriftInfo = { ...base, offset: off } as DriftInfo;
  assert.ok(Math.abs(driftX(log, 18 / 30) - 14614) < 1e-6);
  const held = letGoFall(l, log), free = letGoFall(l, log, 0);
  assert.equal(fallOnLog(free, [log], 0, false), false, 'released: the water (the engine)');
  assert.equal(fallOnLog(held, [log], 0, false), true, 'held: the log end (the model\'s float)');
  assert.equal(courtLands(courtFalls(l, log), [log], 0, false), false, 'the court\'s catch refuses it, as the engine does');
});
