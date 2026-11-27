// The court's TEMPO check (tempo.ts; reference/design/2-9.md NEW 1, R-165.449, ENG-29): a river laid by the real layRiver with the design's
// `court` row (Normal 80 px/s, 156 px logs, 72 px gaps: a log every 2.85 s, one a bar; Easy 70/159/72: 3.3 s), a liana locked to the bar
// and a stage clock of one bar keep the tempo on both settings; RED by name with one row's speed 80 -> 82, with the liana unlocked (or
// swinging its own period), with a log's knock off the beat, and with a clock off its beats or stretched otherwise on Easy.
import test from 'node:test';
import assert from 'node:assert/strict';
import { layRiver, type RiverRow } from './gen2/riverLay.ts';
import { tempoBar, tempoBeat, tempoFaults, type TempoSpec } from './tempo.ts';
import type { ClockDef } from './stageKit.types.ts';
import type { Platform, Vine } from './types.ts';
import type { Wheel } from './wheel.ts';

/** the court's tempo as the design writes it: one liana swing (2.85 s Normal, 3.3 s Easy) is a bar of four */
const COURT: TempoSpec = { beats: 4, bar: 2.85, easyStretch: 3.3 / 2.85, lock: 0 };
const COURT_ROW: RiverRow = { dir: 1, speed: 80, logW: 156, gap: 72, logs: 3 };
const COURT_EASY: RiverRow = { dir: 1, speed: 70, logW: 159, gap: 72, logs: 3 };

function court(easy: boolean, row = easy ? COURT_EASY : COURT_ROW, liana: Partial<Vine> = {}, clock: Partial<ClockDef> = {}) {
  let id = 1;
  const R = layRiver(row, 1000, 500, () => id++);
  const vine: Vine = { id: 99, x: 1400, topY: 100, bottomY: 510, isSwingingVine: true, vineType: 'swing_liana', swingPeriod: tempoBar(COURT, easy), swingPhase: COURT.lock, ...liana } as Vine;
  const jaws: ClockDef = { id: 'jaws', phases: [{ name: 'off', seconds: 0.7125 * 2 }, { name: 'warn', seconds: 0.7125 }, { name: 'on', seconds: 0.7125 }], offset: 0, easyStretch: COURT.easyStretch, ...clock };
  return { platforms: R.logs as Platform[], rivers: [R.zone], vines: [vine], clocks: [jaws] };
}

test('tempo: the court row, a locked liana and a bar-long clock keep the beat on both settings (B 0.7125 s Normal, 0.825 s Easy)', () => {
  assert.ok(Math.abs(tempoBeat(COURT, false) - 0.7125) < 1e-9 && Math.abs(tempoBeat(COURT, true) - 0.825) < 1e-9);
  for (const easy of [false, true]) assert.deepEqual(tempoFaults(court(easy), COURT, easy), [], easy ? 'easy' : 'normal');
});

test('tempo (planted): one row\'s speed 80 -> 82 is off the beat, named by its river and numbers', () => {
  // (an off-beat row also drifts under its locked liana, so ONE's margin can fall short too: ENG-29-f G6 names that as its own fault)
  const all = tempoFaults(court(false, { ...COURT_ROW, speed: 82 }), COURT, false);
  const f = all.filter((q) => !/a press on ONE keeps/.test(q));
  assert.equal(f.length, 1, all.join('; '));
  assert.match(f[0], /^the river at x 1000-\d+ \(82 px\/s, 156 px logs, a log every 2\.78 s\): a log every 2\.78 s is not a whole number of beats \(the beat 0\.7125 s/);
  // (and the Normal row on Easy: Easy keeps the liana's bar, so the river's Easy numbers are its own data, never Normal's stretched)
  assert.match(tempoFaults(court(true, COURT_ROW), COURT, true).join('; '), /a log every 2\.85 s is not a whole number of beats \(the beat 0\.825 s/);
});

test('tempo (planted): a liana unlocked, or swinging its own period, is named', () => {
  assert.match(tempoFaults(court(false, undefined, { swingPhase: 0.618034 }), COURT, false).join('; '), /the liana at x 1400: its swing is not locked to the bar \(phase 0\.618, the lock 0\)/);
  assert.match(tempoFaults(court(false, undefined, { swingPhase: undefined }), COURT, false).join('; '), /the liana at x 1400: its swing is not locked to the bar \(no phase/);
  assert.match(tempoFaults(court(true, undefined, { swingPeriod: 2.85 }), COURT, true).join('; '), /the liana at x 1400: a swing of 2\.85 s is not the bar \(3\.3 s\)/);
  // (a still or climbing vine has no swing to lock)
  assert.deepEqual(tempoFaults(court(false, undefined, { swingAmp: 0, swingPhase: 0.3 }), COURT, false), []);
});

test('tempo (planted): a log\'s knock off the beat, and a clock off its beats or stretched otherwise on Easy, are named', () => {
  const st = court(false);
  st.platforms[1].drift!.offset += 0.2;
  assert.match(tempoFaults(st, COURT, false).join('; '), /log 2's knock falls 0\.2 s off the beat/);
  assert.match(tempoFaults(court(false, undefined, undefined, { offset: 0.3 }), COURT, false).join('; '), /the clock 'jaws': its offset falls 0\.3 s off the beat/);
  assert.match(tempoFaults(court(false, undefined, undefined, { phases: [{ name: 'off', seconds: 2 }, { name: 'on', seconds: 0.7125 }] }), COURT, false).join('; '), /the clock 'jaws': a cycle of 2\.71[23] s is not a whole number of beats/);
  assert.match(tempoFaults(court(true, undefined, undefined, { easyStretch: 1.5 }), COURT, true).join('; '), /the clock 'jaws': Easy stretches it 1\.5, not the bar's 1\.158/);
});

/** a piece on the clock 'jaws': a snap stone (bites on four) with its wave's stagger, or a breathing pad (sinks and rises) */
const onJaws = (x: number, shift: number, on?: 'bites'): Platform =>
  ({ id: 500 + x, x, y: 500, width: 80, height: 20, type: 'solid', pad: { by: 'beat', clock: 'jaws', look: 'snap', ...(on ? { on } : {}), ...(shift ? { shift } : {}) } }) as Platform;

test('tempo: a wave\'s stones a whole beat apart keep the beat; a stagger off the beat, and a BREATHING row, are named (ENG-29b)', () => {
  for (const easy of [false, true]) {
    const st = court(easy);
    st.platforms.push(onJaws(2000, 0, 'bites'), onJaws(2110, -0.7125, 'bites'), onJaws(2220, -1.425, 'bites'));
    assert.deepEqual(tempoFaults(st, COURT, easy), [], `${easy ? 'easy' : 'normal'}: a wave a count of one beat later each`);
  }
  const off = court(false);
  off.platforms.push(onJaws(2000, -0.890625, 'bites'));
  assert.match(tempoFaults(off, COURT, false).join('; '), /the snap stone at x 2000 \(clock 'jaws'\): its stagger of -0\.891 s puts its bite 0\.178 s off the beat/);
  // (on Easy the stagger stretches with its clock: still off by the same share of a beat)
  assert.match(tempoFaults(off, COURT, true).join('; '), /the snap stone at x 2000 \(clock 'jaws'\): its stagger of -0\.891 s puts its bite 0\.206 s off the beat/);
  const breath = court(false);
  breath.platforms.push(onJaws(2000, 0));
  assert.match(tempoFaults(breath, COURT, false).join('; '), /the breathing pad at x 2000 \(clock 'jaws'\): a breathing row is turned at every put-back \(breathAim\.ts\)/);
});

test('tempo: the wheel (2-6\'s noria, 2-9.md: one bucket a bar) keeps the beat; another rim or speed, or its buckets off the beat, are named (ENG-29b)', () => {
  const wheel = (o: Partial<Wheel> = {}): Platform[] => {
    const w: Wheel = { cx: 3000, cy: 300, R: 180, N: 6, W: 70, V: 66.14, way: 1, ...o };
    return Array.from({ length: w.N }, (_, i) => ({ id: 900 + i, x: 0, y: 0, width: w.W, height: 14, type: 'solid', wheel: { w, i } }) as Platform);
  };
  const on = (easy: boolean, o?: Partial<Wheel>) => { const st = court(easy); st.platforms.push(...wheel(o)); return tempoFaults(st, COURT, easy); };
  assert.deepEqual(on(false), [], 'Normal R180 N6 V 66.14: a bucket every 2.85 s');
  assert.deepEqual(on(true, { R: 160, V: 50.77 }), [], 'Easy R160 V 50.77: a bucket every 3.3 s, Easy\'s own row');
  assert.match(on(false, { R: 170 }).join('; '), /the wheel at x 3000 \(R 170, 6 buckets, 66\.14 px\/s, a bucket every 2\.692 s\): a bucket every 2\.692 s is not a whole number of beats/);
  assert.match(on(false, { phase: 0.5 }).join('; '), /the wheel at x 3000 .*: its buckets pass the bottom 0\.\d+ s off the beat/);
});
