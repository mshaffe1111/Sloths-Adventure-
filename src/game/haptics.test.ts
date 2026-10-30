/**
 * AN-9 (polish report 1, 2026-10-29): a buzz for a hurt (40 ms), a hard landing (20 ms), a boss's slam (a 60 ms pattern), a flag (two short
 * pulses) and a clear, all behind the Vibration setting; the button presses' buzz obeys it too.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const buzzed: unknown[] = [];
const g = globalThis as unknown as Record<string, unknown>;
const mem = new Map<string, string>();
g.localStorage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v) };
Object.defineProperty(globalThis, 'navigator', { value: { vibrate: (p: unknown) => (buzzed.push(p), true) }, configurable: true });
const { HAPTIC, buzz, hapticsOn, setHaptics, vibrate } = await import('./haptics.ts');

test('AN-9: each moment has its pattern, and the setting turns every buzz off', () => {
  assert.deepEqual(HAPTIC.hurt, [40]);
  assert.deepEqual(HAPTIC.hardLand, [20]);
  assert.equal(HAPTIC.bossSlam.at(-1), 60);
  assert.equal(HAPTIC.checkpoint.filter((_, i) => i % 2 === 0).length, 2, 'two short pulses');
  assert.ok(HAPTIC.clear.length >= 3);
  assert.equal(hapticsOn(), false, 'off unless turned on');
  buzz('hurt');
  vibrate(15);
  assert.equal(buzzed.length, 0, 'nothing until turned on');
  setHaptics(true);
  buzz('hurt');
  vibrate(15);
  assert.deepEqual(buzzed, [[40], 15]);
  setHaptics(false);
  buzz('clear');
  vibrate(15);
  assert.equal(buzzed.length, 2, 'nothing while off');
  assert.equal(mem.get('sloth_haptics'), 'off', 'kept on the device');
  setHaptics(true);
  buzz('checkpoint');
  assert.equal(buzzed.length, 3);
});
