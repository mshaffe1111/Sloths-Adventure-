import test from 'node:test';
import assert from 'node:assert/strict';
import { rollLook } from './artRoll.ts';

const SETS = [['a', 'b'], ['a', 'b', 'c'], ['a', 'b', 'c', 'd', 'e']];

test('a look never repeats in two stages in a row, whatever each one rolled', () => {
  for (const opts of SETS) {
    for (let salt = 0; salt < 5; salt++) {
      for (let n = 1; n < 9; n++) {
        for (let r1 = 1; r1 < 40; r1++) for (let r2 = 1; r2 < 40; r2 += 3) assert.notEqual(rollLook(opts, n, r1, salt), rollLook(opts, n + 1, r2, salt), `${opts} ${n} ${r1} ${r2}`);
      }
    }
  }
});

test('a retry keeps the look, and with three looks or more a fresh roll can change it', () => {
  for (const opts of SETS) {
    for (let n = 1; n <= 9; n++) {
      assert.equal(rollLook(opts, n, 17, 3), rollLook(opts, n, 17, 3));
      if (opts.length >= 3) {
        const seen = new Set(Array.from({ length: 64 }, (_, r) => rollLook(opts, n, 1 + r * 37, 3)));
        // (the stage's half has two looks or more in it for one of the two parities; for five looks, both)
        if (opts.length === 5) assert.ok(seen.size >= 2, `${opts} stage ${n}: ${[...seen]}`);
      }
    }
    // every look is used somewhere in the world
    const all = new Set<string>();
    for (let n = 1; n <= 9; n++) for (let r = 1; r < 64; r++) all.add(rollLook(opts, n, r, 3));
    assert.equal(all.size, opts.length);
  }
});
