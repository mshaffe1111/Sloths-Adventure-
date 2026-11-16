// R-165.244 (TOOLS-1, 11-14): a liana flight's answer is the same whatever setting was asked before it in the same process. The level
// check keeps every flight's answer (levelCheck.ts FLIGHTS) and the flight reads the setting's swing (physics setTimedSwing: Easy's
// slower swing, wider sweet spot, longer grab); its key left the setting out, so a Normal build's landings were handed to the Easy build
// of the same seed after it (and back): castBots' 1-6 seed 1 Easy needed 73 petals after a Normal run, 82 alone (BUILD-16c). The plant:
// one dial-free liana over a row of ledges whose landings differ by setting; Easy asked AFTER Normal must equal Easy asked ALONE (a fresh
// process: nothing asked before it), and the two settings must really differ here, or the test proves nothing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { swingLandings } from './levelCheck.ts';
import { setTimedSwing, TIMED } from './physics.ts';
import type { Platform, Vine } from './types.ts';

const FROM: Platform = { id: 1, x: 0, y: 600, width: 200, height: 90, type: 'solid' };
const LEDGES: Platform[] = Array.from({ length: 12 }, (_, i) => ({ id: 10 + i, x: 380 + i * 60, y: 600 + (i % 3) * 40, width: 50, height: 90, type: 'solid' }));
const LIANA = { id: 7, x: 330, topY: 300, bottomY: 560, swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true } as Vine;

/** the flight's landings on a setting, as sorted [ledge id, lines] pairs (TIMED put back after) */
function landings(easy: boolean): Array<[number, number]> {
  const was = { ...TIMED };
  setTimedSwing(easy);
  try {
    return [...swingLandings(FROM, LIANA, 1, [FROM, ...LEDGES], 2000)].sort((a, b) => a[0] - b[0]);
  } finally {
    Object.assign(TIMED, was);
  }
}

// (the fresh process's own job: Easy alone, printed, then out before any test is set up)
if (process.env.FLIGHT_SETTING_ALONE) {
  console.log(`ALONE ${JSON.stringify(landings(process.env.FLIGHT_SETTING_ALONE === 'easy'))}`);
  process.exit(0);
}

/** a setting's landings asked in a fresh process, nothing asked before them */
function alone(setting: 'easy' | 'normal'): Array<[number, number]> {
  const r = spawnSync(process.execPath, ['--import', 'tsx', fileURLToPath(import.meta.url)], { env: { ...process.env, FLIGHT_SETTING_ALONE: setting }, encoding: 'utf8' });
  const line = r.stdout.split('\n').find((l) => l.startsWith('ALONE '));
  assert.ok(line, `the fresh process printed no answer: ${r.stderr.slice(0, 400)}`);
  return JSON.parse(line.slice(6));
}

test('a liana flight asked on Easy after Normal (and back) lands as it does asked alone', () => {
  const easyAlone = alone('easy');
  const normalAlone = alone('normal');
  // (the plant has teeth: the settings land differently on this liana)
  assert.notDeepEqual(easyAlone, normalAlone, 'the planted liana must land differently on the two settings');
  // A then B: Normal asked first in this process, then Easy, then Normal again
  const normalFirst = landings(false);
  const easyAfter = landings(true);
  const normalAfter = landings(false);
  assert.deepEqual(normalFirst, normalAlone, 'Normal asked first is Normal alone');
  assert.deepEqual(easyAfter, easyAlone, "Easy asked after Normal is Easy alone (not Normal's landings handed back)");
  assert.deepEqual(normalAfter, normalAlone, "Normal asked after Easy is Normal alone (not Easy's)");
});
