/**
 * World 9's swing art (w9SwingArt.ts): the lintel's middle pieces end for any span (a piece of a few px once never moved on, and the
 * page froze) and cover it with no gap, no two side by side alike.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { beamPieces } from './w9SwingArt.ts';

test('the lintel pieces: always finite, gapless, varied, for every span and height', () => {
  for (const h of [26, 30, 34, 36, 46]) {
    for (let x0 = -3; x0 < 40; x0 += 0.37) {
      for (let span = 0; span < 1400; span += 1.13) {
        const ps = beamPieces(x0, x0 + span, h, x0 * 3);
        assert.ok(ps.length < 200, `${x0} ${span} ${h}: ${ps.length} pieces`);
        for (let i = 1; i < ps.length; i++) {
          assert.ok(ps[i].x > ps[i - 1].x && ps[i].x <= ps[i - 1].x + ps[i - 1].w, 'onward, no gap');
          if (ps[i].w > 20 && ps[i - 1].w > 20) assert.ok(ps[i].off !== ps[i - 1].off || ps[i].w !== ps[i - 1].w || ps[i].flip !== ps[i - 1].flip, 'neighbours differ');
        }
      }
    }
  }
});
