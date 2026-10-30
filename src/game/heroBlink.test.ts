import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { BLINK_OFF_ALPHA, heroBlinkAlpha } from './heroBlink.ts';

test('AN-2: the blink runs on whole 30 fps frames, two shown and two faded, the same every time', () => {
  const p = { invincibleTimer: 2, activePowerUp: null };
  const seq = Array.from({ length: 16 }, (_, i) => heroBlinkAlpha(p, i / 30));
  assert.deepEqual(seq.map((a) => (a === 1 ? 'on' : 'off')).join(' '), 'on on off off on on off off on on off off on on off off');
  assert.ok(seq.every((a) => a === 1 || a === BLINK_OFF_ALPHA));
});

test('no blink when safe time is over, and none under the Solar shield (it glows instead)', () => {
  assert.equal(heroBlinkAlpha({ invincibleTimer: 0, activePowerUp: null }, 0.1), 1);
  for (let i = 0; i < 8; i++) assert.equal(heroBlinkAlpha({ invincibleTimer: 0.5, activePowerUp: 'invincible' }, i / 30), 1);
});

test('every hero drawing uses the one blink (no time * 24 left)', () => {
  const dir = path.resolve(import.meta.dirname);
  const bad = fs.readdirSync(dir).filter((f) => /^hero.*\.ts$/.test(f) && !f.endsWith('.test.ts')).filter((f) => /invincibleTimer > 0 && Math\.floor\(time/.test(fs.readFileSync(path.join(dir, f), 'utf8')));
  assert.deepEqual(bad, []);
});
