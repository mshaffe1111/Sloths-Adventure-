/**
 * The log's knock (reference/design/2-1.md NEW 2; BUILD-21 step 1): one soft sound each time a drifting log slides out from under its bank,
 * read from the log's own cycle (river.ts logKnocks), so the beat is the river's spacing and no timer of its own; louder on Easy
 * (sfxRec.ts KNOCK_DB). Planted: each rule below names the fault that turns it red (no knock, a knock every step, Easy as quiet as Normal).
 */
import './headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { driftCycle, driftX, logKnocks, type DriftInfo } from './river.ts';
import { layRiver, riverBeat } from './gen2/riverLay.ts';
import { W2_RIVERS } from './gen2/worlds/w2.ts';
import { sound } from './audio.ts';
import { KNOCK_DB, recFor } from '../audio/sfxRec.ts';
import type { Platform } from './types.ts';

const { setDifficulty } = await import('./difficulty.ts');

const BANK = 580;
const bank = (id: number, x: number, w: number): Platform => ({ id, x, y: BANK, width: w, height: 90, type: 'solid', style: 'log' });

test('a log knocks once each time its front edge comes out from under its bank, and at no other time', () => {
  for (const row of [W2_RIVERS.ride, W2_RIVERS.back] as const) {
    let id = 1;
    const { logs } = layRiver(row, 1000, BANK, () => id++);
    const d = logs[0].drift as DriftInfo;
    const T = driftCycle(d);
    let knocks = 0;
    for (let t = 0; t < 3 * T; t += 1 / 30) {
      const k = logKnocks(d, t, t + 1 / 30);
      if (!k) continue;
      knocks += k;
      // (at the knock the log's front edge is at the lip it slides out from: x0 with him, x1 against him)
      const front = d.dir === 1 ? driftX(d, t + 1 / 30) + d.width : driftX(d, t + 1 / 30);
      const lip = d.dir === 1 ? d.x0 : d.x1;
      assert.ok(Math.abs(front - lip) <= row.speed / 30 + 1, `${row.dir}: knocked with its front ${front.toFixed(0)} px, the lip at ${lip}`);
    }
    assert.ok(knocks >= 2 && knocks <= 4, `${row.dir}: ${knocks} knocks over three crossings`);
  }
});

test("a river's logs knock on its beat: one every (log + gap) / speed s, the wait at the bank (riverLay riverBeat)", () => {
  let id = 1;
  const { logs } = layRiver(W2_RIVERS.ride, 1000, BANK, () => id++);
  const at: number[] = [];
  for (let t = 0; t < 30; t += 1 / 30) for (const l of logs) if (logKnocks(l.drift!, t, t + 1 / 30)) at.push(t);
  const beat = riverBeat(W2_RIVERS.ride);
  for (let i = 1; i < at.length; i++) assert.ok(Math.abs(at[i] - at[i - 1] - beat) <= 0.1, `knock ${i}: ${(at[i] - at[i - 1]).toFixed(2)} s after the last, the beat ${beat.toFixed(2)} s`);
  assert.ok(at.length >= Math.floor(30 / beat) - 1, `${at.length} knocks in 30 s`);
});

test('a clock that stands or runs back (a sluice) knocks nothing', () => {
  const d: DriftInfo = { x0: 0, x1: 900, dir: 1, speed: 70, width: 170, offset: 0, baseY: 0 };
  assert.equal(logKnocks(d, 5, 5), 0);
  assert.equal(logKnocks(d, 20, 1), 0);
});

/** the real engine at 30 fps, standing on the near bank of one log river in view: the knocks it plays in `seconds`, and their Easy flags */
function heard(difficulty: 'normal' | 'easy', seconds: number, view = true): boolean[] {
  setDifficulty(difficulty);
  const was = sound.playLogKnock;
  const out: boolean[] = [];
  (sound as { playLogKnock: (easy: boolean) => void }).playLogKnock = (easy: boolean) => void out.push(easy);
  try {
    const sim = new RealPlay('1-1', 1);
    let id = 10;
    const { logs } = layRiver(W2_RIVERS.ride, 1000, BANK, () => id++);
    const far = 1000 + (logs[0].drift!.x1 - logs[0].drift!.x0);
    sim.bare([bank(1, 0, 1000), ...logs, bank(2, far, 1000)]);
    sim.stand(800, BANK);
    // (the camera stands where it is put: the bank's lip in view, or 4,000 px away)
    Object.assign(sim.e.camera, { x: view ? 500 : 6000, y: BANK - 500 });
    sim.wait(seconds);
    return out;
  } finally {
    (sound as { playLogKnock: (easy: boolean) => void }).playLogKnock = was;
    setDifficulty('normal');
  }
}

test('in play: the engine knocks on the beat for a river in view, Normal soft and Easy loud; a river far off the screen is not heard', () => {
  const beat = riverBeat(W2_RIVERS.ride);
  const n = heard('normal', 12);
  assert.ok(n.length >= Math.floor(12 / beat) - 1 && n.length <= Math.ceil(12 / beat) + 1, `Normal: ${n.length} knocks in 12 s, the beat ${beat.toFixed(2)} s`);
  assert.ok(n.every((e) => e === false), 'Normal plays the soft knock');
  const e = heard('easy', 12);
  assert.ok(e.length === n.length && e.every((x) => x === true), `Easy: ${e.length} knocks, all loud`);
  assert.equal(heard('normal', 12, false).length, 0, 'a river 4,000 px off the screen is not heard');
});

test('the knock plays the recorded log thump, louder on Easy than on Normal, and soft on Normal', () => {
  const n = recFor('knock', 0)!, e = recFor('knock', 1)!;
  assert.equal(n.fx, 'log');
  assert.equal(e.fx, 'log');
  assert.ok(e.db! > n.db!, `Easy ${e.db} dB over Normal ${n.db} dB`);
  assert.ok(n.db! < 0, 'Normal is under the thump it borrows');
  assert.deepEqual([n.db, e.db], [KNOCK_DB.normal, KNOCK_DB.easy]);
});
