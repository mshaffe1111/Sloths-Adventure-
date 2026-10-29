import { test } from 'node:test';
import assert from 'node:assert/strict';
import { confettiPieces, CONFETTI_MS, CONFETTI_PIECES, CONFETTI_BURST } from './confetti.ts';

test('the confetti falls once, within 1.6 s, with a bigger burst at three stars (UI-3)', () => {
  assert.equal(CONFETTI_MS, 1600);
  assert.equal(confettiPieces(1).length, CONFETTI_PIECES);
  assert.equal(confettiPieces(2).length, 24);
  assert.ok(confettiPieces(3).length > 24);
  assert.equal(confettiPieces(3).length, CONFETTI_BURST);
  for (const p of [...confettiPieces(1), ...confettiPieces(3)]) {
    assert.ok(p.delay + p.fall <= CONFETTI_MS, 'every piece has landed by 1.6 s');
    assert.ok(p.x >= 0 && p.x <= 100);
  }
  assert.deepEqual(confettiPieces(2), confettiPieces(2), 'the same card throws the same pieces');
});
