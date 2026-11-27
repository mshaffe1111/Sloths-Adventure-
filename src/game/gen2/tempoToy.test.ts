// The court's TEMPO on a REAL row (reference/design/2-9.md NEW 1, R-165.449; ENG-29b; level.md rule 23): the toy row (worlds/w2TempoToy.ts:
// 2-4's kit cut to its first drop and drop-ride-drop, every river on World 2's `court` row, a pond of snap stones counted in the court's
// beats, under a brief with the court's tempo) built by gen2 through withTestStage. GREEN on seeds 1-4, both settings: no stage error, the
// tempo check clean, every liana locked to the bar. RED, each by name: the court's speed 80 -> 82 and a stone row off the beat (its bar,
// its wave's stagger) in gen2's own errors; a liana unlocked and the stones' clock moved off the beat, by the check gen2 runs; and the same
// stage laid WITHOUT the tempo fails it (the lay is what keeps the beat). The let-go on ONE (ENG-29d): every court liana's press on the drum's
// ONE lands its logs (riverLay lockedDrops, the one pairing a locked court plays); RED by name with the lock at 0.15 of a bar.
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGen2Stage } from './pipeline.ts';
import { withTestStage } from './listed.ts';
import { COURT_PADS, COURT_STONES, COURT_TEMPO, TEMPO_ID, tempoCfg, tempoKit, tempoRow, type TempoToyOpts } from './worlds/w2TempoToy.ts';
import { W2_RIVERS } from './worlds/w2.ts';
import { tempoFaults } from '../tempo.ts';
import { lockedLianas } from './riverLay.ts';

const build = (seed: number, difficulty: 'normal' | 'easy', o: TempoToyOpts = {}) =>
  withTestStage({ [TEMPO_ID]: tempoRow(o) }, () => buildGen2Stage({ config: tempoCfg(), kit: tempoKit(o), seed, difficulty }));
const lianas = (st: ReturnType<typeof build>) => (st.vines ?? []).filter((v) => v.isSwingingVine && v.vineType !== 'tree_climb' && v.swingAmp !== 0);
const courts = (st: ReturnType<typeof build>) => (st.rivers ?? []).filter((r) => r.speed !== 0 && !r.open);

test('tempo toy: GREEN on seeds 1-4, both settings: no stage error, the tempo clean, every liana on the bar at the lock, the court and its stones laid', () => {
  for (const difficulty of ['normal', 'easy'] as const) for (let seed = 1; seed <= 4; seed++) {
    const at = `${difficulty} seed ${seed}`;
    const st = build(seed, difficulty);
    assert.deepEqual(st.gen2.errors, [], at);
    assert.deepEqual(tempoFaults(st, COURT_TEMPO, difficulty === 'easy'), [], at);
    assert.deepEqual(st.tempo, COURT_TEMPO, `${at}: the built stage carries its tempo (the drum's)`);
    const L = lianas(st);
    assert.ok(L.length >= 3, `${at}: lianas over the court (${L.length})`);
    for (const v of L) assert.equal(v.swingPhase, COURT_TEMPO.lock, `${at}: the liana at x ${Math.round(v.x)} is locked`);
    assert.ok(courts(st).length >= 3, `${at}: court rivers (${courts(st).length})`);
    assert.ok(st.clocks?.some((c) => c.id === 'snap-court'), `${at}: the stones' clock`);
    assert.ok(st.platforms.some((p) => p.pad?.on === 'bites'), `${at}: the snap stones`);
  }
});

test('tempo toy (planted): the court\'s speed 80 -> 82 is named in gen2\'s errors, by its river and numbers', () => {
  const st = build(1, 'normal', { court: { ...W2_RIVERS.court, speed: 82 } });
  assert.match(st.gen2.errors.join('; '), /the river at x \d+-\d+ \(82 px\/s, 156 px logs, a log every 2\.78 s\): a log every 2\.78 s is not a whole number of beats \(the beat 0\.7125 s/);
});

test('tempo toy (planted): a stone row off the beat, by its bar or by its wave\'s stagger, is named in gen2\'s errors', () => {
  const bar = build(1, 'normal', { stones: { ...COURT_STONES, snap: { count: 0.75 } } });
  assert.match(bar.gen2.errors.join('; '), /the clock 'snap-court': a cycle of 3 s is not a whole number of beats/);
  // (a count of 1.25 beats: a bar of five whole beats, but the wave's second stone bites 1.25 beats after the first)
  const wave = build(1, 'normal', { stones: { ...COURT_STONES, snap: { count: 0.890625, wave: true } } });
  assert.match(wave.gen2.errors.join('; '), /the snap stone at x \d+ \(clock 'snap-court'\): its stagger of -0\.891 s puts its bite 0\.178 s off the beat/);
});

test('tempo toy (planted): a liana unlocked after the lay, and the stones\' clock moved off a beat, fail the check gen2 runs, by name', () => {
  const st = build(2, 'normal');
  const v = lianas(st)[1];
  v.swingPhase = 0.618;
  assert.match(tempoFaults(st, COURT_TEMPO, false).join('; '), new RegExp(`the liana at x ${Math.round(v.x)}: its swing is not locked to the bar \\(phase 0\\.618, the lock 0\\)`));
  const e = build(2, 'easy');
  e.clocks!.find((c) => c.id === 'snap-court')!.offset = 0.3;
  assert.match(tempoFaults(e, COURT_TEMPO, true).join('; '), /the clock 'snap-court': its offset falls 0\.347 s off the beat/);
});

test('tempo toy (planted): the same stage laid WITHOUT the tempo fails the check: the lay is what locks the lianas', () => {
  const st = build(1, 'normal', { tempo: null });
  assert.equal(st.tempo, undefined);
  assert.match(tempoFaults(st, COURT_TEMPO, false).join('; '), /the liana at x \d+: its swing is not locked to the bar/);
});

test('tempo toy: every court liana\'s press on ONE lands its logs, seeds 1-4, both settings; RED by name, in gen2\'s errors, with the lock at 0.15 of a bar', () => {
  for (const difficulty of ['normal', 'easy'] as const) for (const seed of [1, 2, 3, 4]) {
    const L = lockedLianas(build(seed, difficulty), difficulty);
    assert.ok(L.length >= 3, `${difficulty} seed ${seed}: the court's lianas over logs (${L.length})`);
    assert.deepEqual(L.filter((q) => !q.drops.one).map((q) => Math.round(q.liana.x)), [], `${difficulty} seed ${seed}: a press on ONE lands`);
  }
  // (planted: ONE moved to 0.15 of the swing, near its forward end, where a press drops him short of the logs)
  const tempo = { ...COURT_TEMPO, lock: 0.15 };
  for (const difficulty of ['normal', 'easy'] as const) {
    const st = build(2, difficulty, { tempo });
    assert.match(st.gen2.errors.join('; '), /the liana at x \d+ over the river at x \d+-\d+: a press on ONE misses its logs on every bar \(locked: \d+% of a bar's presses land, the longest run [\d.]+ s\)/, difficulty);
  }
});

test('tempo toy, the run-pitch pads (COURT_PADS): 4 small pads 190 px a beat, gen2 clean on seeds 1-4, both settings (a weight pad\'s count is no stage clock); RED: the row breathing on a beat is named', () => {
  for (const difficulty of ['normal', 'easy'] as const) for (const seed of [1, 2, 3, 4]) {
    const st = build(seed, difficulty, { pads: COURT_PADS });
    assert.deepEqual(st.gen2.errors, [], `${difficulty} seed ${seed}`);
    const pads = st.platforms.filter((p) => p.pad?.by === 'weight').sort((a, b) => a.x - b.x);
    assert.equal(pads.length, 4, `${difficulty} seed ${seed}: the row`);
    pads.forEach((p, i) => { assert.equal(p.width, 130); if (i) assert.equal(p.x - pads[i - 1].x, 190, `${difficulty} seed ${seed}: pad ${i + 1} a beat on`); });
  }
  // (planted: the same row breathing on a beat, whose breath every put-back turns to meet him)
  const st = build(1, 'normal', { pads: { ...COURT_PADS, by: 'beat', beat: { up: 1.8, shiver: 0.6, under: 0.6 } } });
  assert.match(st.gen2.errors.join('; '), /the breathing pad at x \d+ \(clock '[^']+'\): a breathing row is turned at every put-back/);
});
