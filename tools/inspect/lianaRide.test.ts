// npx tsx --test tools/inspect/lianaRide.test.ts   (CI: gates.yml, the engine tools' tests)
/**
 * The bot toys for a liana over a river (level.md rule 21, ENG-24; reference/design/2-4.md NEW 2), before 2-4 is laid: the toy stages of
 * lianaRiverToys.ts, rolled the game's way, played by the middle tier bot with the engine driven through the game's own InputEngine
 * (RealPlay.useRealInput: the touch layer's calls and its minimum hold, never FakeInput's bare press).
 *   - DROP ON A LOG (firsttimer.ts SKILLS.dropOnLog) on the design's widest relay row, gap280 (41% of let-gos land; Easy's twin `deep`):
 *     with the skill he lets go only when the let-go comes down on a log and crosses with no life lost (measured 11-18: 0 lives on each of
 *     variants 1-5, Normal); PLANTED: without it he lets go at the swing's forward end whatever the logs do (8 lives over the same five).
 *   - A VINE FROM A LOG (SKILLS.vineFromLog) on the catch toy (a liana no bank reaches, 320 px long, over `twin`; Easy's twin `long`): he
 *     rides a log under it and jumps up to it (measured: caught off a log in 4 of 5 variants on each setting); PLANTED: without it he
 *     rides the log to the bank every time (0 of 10).
 */
import '../../src/game/headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay, DT } from '../../src/game/realPlay.ts';
import type { Platform } from '../../src/game/types.ts';
import { PRESS_TRACE, SKILLS } from './firsttimer.ts';
import { fixtureSeed, lianaRun } from './lianaRiverToys.ts';

const VARIANTS = [1, 2, 3, 4, 5];
const at = (r: ReturnType<typeof lianaRun>, toy: string) => r.pieces.find((q) => q.id === `toy-liana-${toy}`);

test('the harness drives the engine through the real InputEngine: a Pad tap at a run is the real hop (0.43 s, 2-4.md R-165.284), never FakeInput\'s', () => {
  const air = (real: boolean) => {
    const r = new RealPlay('2-1', 1);
    r.bare([{ id: 1, x: 0, y: 800, width: 8000, height: 200, type: 'solid' } as Platform]);
    r.stand(600, 800);
    if (real) r.useRealInput(80);
    for (let i = 0; i < 40; i++) r.frame({ right: true });
    // (a tap: pressed, and lifted the next frame; InputEngine keeps the press its minimum hold from the take-off, FakeInput drops it)
    r.frame({ press: true, right: true });
    let f = 1;
    while (f < 90) { r.frame({ right: true }); f++; if (r.p.grounded) break; }
    return f * DT;
  };
  assert.ok(Math.abs(air(true) - 0.43) <= 0.04, `the real tap hop: ${air(true).toFixed(2)} s`);
  assert.ok(air(false) <= 0.34, `FakeInput's bare press: ${air(false).toFixed(2)} s (the short hop no thumb makes, 0.30 s)`);
});

test('DROP ON A LOG: on gap280 the middle bot lets go onto a log and loses no life; PLANTED: without the skill he drowns', () => {
  const seed = fixtureSeed('drop', 'gap280', ['normal', 'easy'], 'deep');
  assert.ok(seed !== null, 'no roll lays the gap280 drop toy clean');
  const lives = (on: boolean) => {
    const was = SKILLS.dropOnLog;
    SKILLS.dropOnLog = on;
    try {
      return VARIANTS.map((v) => {
        const r = lianaRun('drop', 'gap280', 'middle', 'normal', seed!, v, 'deep', { realInput: true });
        assert.equal(r.end, 'shrine', `v${v} ${on ? 'on' : 'off'}: ended ${r.end}`);
        if (on) assert.ok(r.ontoLog >= 1, `v${v}: no let-go came down on a log`);
        return at(r, 'drop')?.lives ?? 0;
      });
    } finally { SKILLS.dropOnLog = was; }
  };
  const on = lives(true), off = lives(false);
  assert.ok(on.reduce((a, b) => a + b, 0) <= 1, `with the skill: lives at the river ${on.join(',')}`);
  assert.ok(off.reduce((a, b) => a + b, 0) >= 4, `PLANTED, without it: lives ${off.join(',')} (measured 8 over five)`);
});

test('A VINE FROM A LOG: on the catch toy the middle bot jumps from the moving log to the liana; PLANTED: without the skill, never', () => {
  const seed = fixtureSeed('catch', 'twin', ['normal', 'easy'], 'long');
  assert.ok(seed !== null, 'no roll lays the catch toy clean');
  for (const setting of ['normal', 'easy'] as const) {
    const caught = (on: boolean) => {
      const was = SKILLS.vineFromLog;
      SKILLS.vineFromLog = on;
      try {
        return VARIANTS.map((v) => {
          const r = lianaRun('catch', 'twin', 'middle', setting, seed!, v, 'long', { realInput: true });
          assert.equal(r.end, 'shrine', `${setting} v${v} ${on ? 'on' : 'off'}: ended ${r.end}`);
          return r.fromLog;
        });
      } finally { SKILLS.vineFromLog = was; }
    };
    const on = caught(true), off = caught(false);
    assert.ok(on.filter((n) => n >= 1).length >= 4, `${setting}, with the skill: catches off a log ${on.join(',')}`);
    assert.deepEqual(off.filter((n) => n >= 1), [], `${setting}, PLANTED, without it: ${off.join(',')}`);
  }
});

test('the bot aims its presses at the frame they reach the engine (ENG-285, R-165.294: the drop aim read the vine and the logs one frame early): every decided press of the middle bot over the gap280 drop, both settings, lands on the game time it aimed at', () => {
  const seed = fixtureSeed('drop', 'gap280', ['normal', 'easy'], 'deep');
  assert.ok(seed !== null, 'no roll lays the gap280 drop toy clean');
  PRESS_TRACE.on = true;
  PRESS_TRACE.rows.length = 0;
  try {
    for (const setting of ['normal', 'easy'] as const) for (const v of [1, 2, 3]) lianaRun('drop', 'gap280', 'middle', setting, seed!, v, 'deep', { realInput: true });
    const rows = PRESS_TRACE.rows;
    assert.ok(rows.length >= 12, `decided presses traced: ${rows.length}`);
    const off = rows.filter((r) => Math.abs(r.got - r.want) > 1e-6);
    assert.deepEqual(off.map((r) => `aimed ${r.want.toFixed(3)}, reached ${r.got.toFixed(3)}`), [], `${off.length} of ${rows.length} presses reached the engine off the frame aimed`);
  } finally {
    PRESS_TRACE.on = false;
    PRESS_TRACE.rows.length = 0;
  }
});
