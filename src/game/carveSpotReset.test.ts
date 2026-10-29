/**
 * CT-20 (polish report 1, 2026-10-29): the input lives for the whole app, and the carving spot was written only while Meeca's stage ran:
 * leaving her stage on a carving spot, later stages read curved swipes as circles. The engine writes it every frame now (false outside
 * her stage), and Dot's own stage clears the swing, bush and carving flags.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';

type Flags = { carveSpot?: boolean; onSwing: boolean; inCover: boolean };

test('CT-20: a stage after Meeca\'s reads no carving spot on its first frame', () => {
  const r = new RealPlay('1-2', 1);
  const input = (r.e as unknown as { input: Flags }).input;
  input.carveSpot = true;
  r.frame();
  assert.equal(input.carveSpot, false);
});

test('CT-20: Dot\'s flight clears the swing, bush and carving flags', () => {
  const r = new RealPlay('4-D', 1);
  const input = (r.e as unknown as { input: Flags }).input;
  Object.assign(input, { carveSpot: true, onSwing: true, inCover: true });
  r.frame();
  assert.deepEqual([input.carveSpot, input.onSwing, input.inCover], [false, false, false]);
});
