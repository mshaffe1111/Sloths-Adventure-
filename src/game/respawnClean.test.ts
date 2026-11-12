/**
 * Audit A-14 (2026-11-11; EN-F): state a respawn did not clear. The life-lost beat freezes update(), so whatever was under way when he
 * went down was carried to the flag: a punch or kick half thrown swung on at the flag (and could hit whatever stands there), and the
 * coyote time of the ground he lost let him take a "ground" jump in mid-air as he appeared. realPlay.ts's place() already cleared these
 * for the bots; the game itself did not. (Latched presses: inputEngine.ts dropPresses, ghostPress.test.ts.)
 */
import { makeEngine, standOn, step } from './engineCoreHarness.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('A-14 an attack under way and the coyote time of the ground he lost are not carried to the flag', () => {
  const { e, input } = makeEngine('1-2');
  const pl = e.platforms.filter((p: any) => p.type === 'solid' && p.width >= 300 && !p.push).sort((a: any, b: any) => a.x - b.x)[1];
  standOn(e, pl);
  step(e, 3);
  input.state.punchPressed = true;
  step(e, 1);
  input.state.punchPressed = false;
  assert.ok(e.atk, 'a punch is under way');
  e.loseLife('hurt');
  let n = 0;
  while (e.down && n++ < 60) step(e, 1);
  assert.equal(e.down, null, 'the beat ended: he is at the flag');
  assert.equal(e.atk, null, 'the punch he was throwing as he went down swings on at the flag');
  assert.equal(e.atkQueue, null, 'a queued attack waits at the flag');
  assert.equal(e.coyoteTimer, 0, 'the coyote time of the ground he lost came with him to the flag');
});
