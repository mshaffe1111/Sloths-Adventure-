/**
 * The walked span (walkedSpan.ts; ENG-16H 11-14, R-165.246): after the farthest the leap onto a piece sets him down and before the earliest
 * the jump off it leaves. Since the lead's ruling INT-10d (11-15) it decides only which petals the door counts (petals.ts markWalked),
 * never where they go; ENG-16H's 1-6 socket-lay case is walkedPath.test.ts D now (every standing petal on the played stage, both settings).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { walkedSpan, lianaTouchdown } from './walkedSpan.ts';
import { withSetting } from '../settingDials.ts';
import type { Platform, Vine } from '../types.ts';

const P = (id: number, x: number, y: number, width: number, height = 120): Platform => ({ id, x, y, width, height, type: 'solid' } as Platform);
const L = (id: number, x: number, topY: number, bottomY: number): Vine =>
  ({ id, x, topY, bottomY, swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true } as Vine);

test('a toy: a perch between two lianas is walked from where the let-go sets him down to where the hop catches the next one', () => {
  withSetting('normal', () => {
    const a = P(1, 0, 600, 300), b = P(2, 560, 600, 280), c = P(3, 1120, 600, 300);
    const l1 = L(10, 420, 180, 600), l2 = L(11, 980, 180, 600);
    const st = { platforms: [a, b, c], vines: [l1, l2], asks: [] };
    const td = lianaTouchdown(l1, b);
    assert.ok(td !== undefined && td > b.x + 20, `the let-go off the first liana sets him down past the perch's near end (${td})`);
    const ws = walkedSpan(b, st);
    assert.equal(ws.lo, td, 'lo: the farthest the let-go sets him down');
    assert.ok(ws.hi < b.x + b.width, `hi: the hop catches the next liana before the perch's end (${ws.hi})`);
    // (a petal at the socket's old share near the near end (t 0.05) is behind every landing: outside the span)
    assert.ok(b.x + 0.05 * b.width < ws.lo, 'the perch-only petal (t 0.05) lies behind where he lands');
    // (walked on and walked off, a bank's span is all of it)
    assert.deepEqual(walkedSpan(P(4, 0, 600, 300), { platforms: [], vines: [], asks: [] }), { lo: 0, hi: 300 });
  });
});
