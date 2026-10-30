import test from 'node:test';
import assert from 'node:assert/strict';
import { FX_MIX, FX_REF, fxGain } from './sfxMix.ts';

test('SN-2: a remaining synthesized effect is levelled to the reference by its own loudness, then trimmed', () => {
  assert.ok(Math.abs(20 * Math.log10(fxGain('roar') / FX_MIX.roar) - (FX_REF - -15)) < 1e-9);
  assert.equal(fxGain('no-such-effect'), 1);
});
