/**
 * R-165.125 (Matt, 11-11: "the sound is too loud, especially the sound effects... Even when I adjust the sound bars, it doesn't make much
 * difference until it's almost off"). Two causes, both pinned here:
 *  1. the sliders were linear gain: half way is only -6 dB, and the top half all sounds loud;
 *  2. they acted BEFORE the master compressor (threshold -18 dB, ratio 3.5), which squeezes a cut above its threshold to under a third.
 * Fixed: each slider step is the same number of decibels (a 40 dB taper, 0 = off), and the overall level, the louder slider, is applied
 * AFTER the compressor and limiter, so nothing undoes it; the quieter slider sets the balance before the compressor, as a mix does.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sliderGain, busLevels, SLIDER_RANGE_DB, DEFAULT_SFX, DEFAULT_MUSIC } from './volumeCurve.ts';

const db = (g: number) => 20 * Math.log10(g);

test('R-165.125 every slider step is the same number of decibels, top to bottom, and 0 is off', () => {
  assert.equal(sliderGain(0), 0);
  assert.equal(sliderGain(1), 1);
  for (let k = 1; k < 10; k++) {
    const step = db(sliderGain((k + 1) / 10)) - db(sliderGain(k / 10));
    assert.ok(Math.abs(step - SLIDER_RANGE_DB / 10) < 0.01, `the tenth from ${k * 10}% to ${k * 10 + 10}% is ${step.toFixed(2)} dB`);
  }
  // half way is well down (the old linear bar: -6 dB, "not much difference")
  assert.ok(db(sliderGain(0.5)) <= -18, `half way is ${db(sliderGain(0.5)).toFixed(1)} dB`);
  // and the bottom step is quiet but not silent
  assert.ok(sliderGain(0.05) > 0 && db(sliderGain(0.05)) < -35);
});

test('R-165.125 the overall level (the louder slider) is applied after the dynamics; the other sets the balance before them', () => {
  // both at half: the whole cut is after the compressor, the mix into it is untouched
  const half = busLevels(0.5, 0.5);
  assert.ok(Math.abs(db(half.out) - db(sliderGain(0.5))) < 1e-9 && half.music === 1 && half.sfx === 1);
  // music full, effects half: nothing after, the effects cut before (the balance)
  const bal = busLevels(1, 0.5);
  assert.equal(bal.out, 1);
  assert.ok(Math.abs(db(bal.sfx) - db(sliderGain(0.5))) < 1e-9 && bal.music === 1);
  // each bus's level overall is its own slider's gain, whichever way it is split
  for (const [m, s] of [[0.3, 0.8], [0.8, 0.3], [1, 1], [0.6, 0.6]] as const) {
    const l = busLevels(m, s);
    assert.ok(Math.abs(l.out * l.music - sliderGain(m)) < 1e-12 && Math.abs(l.out * l.sfx - sliderGain(s)) < 1e-12);
  }
  // both off: silent, no division by zero
  assert.deepEqual(busLevels(0, 0), { out: 0, music: 0, sfx: 0 });
});

test('R-165.125 a new game starts both lower than the top (Matt: the music "a little too loud", the effects clearly lower than it)', () => {
  assert.ok(DEFAULT_MUSIC < 1 && DEFAULT_MUSIC >= 0.85, `music default ${DEFAULT_MUSIC}`);
  assert.ok(DEFAULT_SFX < DEFAULT_MUSIC && DEFAULT_SFX > 0.5, `effects default ${DEFAULT_SFX}`);
  // in dB on the bar: the music a little down, the effects clearly further
  const mDb = 20 * Math.log10(sliderGain(DEFAULT_MUSIC)), sDb = 20 * Math.log10(sliderGain(DEFAULT_SFX));
  assert.ok(mDb <= -3 && mDb >= -6 && sDb <= mDb - 3, `music ${mDb.toFixed(1)} dB, effects ${sDb.toFixed(1)} dB`);
});
