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
  const f = tempoFaults(court(false, { ...COURT_ROW, speed: 82 }), COURT, false);
  assert.equal(f.length, 1, f.join('; '));
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
