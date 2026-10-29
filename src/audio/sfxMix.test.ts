import test from 'node:test';
import assert from 'node:assert/strict';
import { FX_MIX, fxGain } from './sfxMix.ts';

test('SN-2: the mix: most effects trimmed 0.8-1.2, and the jump and the flower lowest', () => {
  const v = Object.entries(FX_MIX);
  const mid = v.filter(([, t]) => t >= 0.8 && t <= 1.2).length;
  assert.ok(mid / v.length >= 0.7, `${mid} of ${v.length} in 0.8-1.2`);
  const low = Math.min(...v.map(([, t]) => t));
  assert.equal(FX_MIX.jump, low);
  assert.equal(FX_MIX.flower, low);
  // each effect is levelled to the reference by its own measured loudness first: the loud recipes come down, the quiet ones up
  assert.ok(fxGain('shrine') < FX_MIX.shrine && fxGain('jump') > FX_MIX.jump);
  assert.equal(fxGain('no-such-effect'), 1);
});
