/**
 * The walked-span petal lay (walkedSpan.ts; ENG-16H 11-14, R-165.246, the lead's packet item 1): a pickup socket's petals go inside its
 * piece's walked span, after the farthest the leap onto it sets him down and before the earliest the jump off it leaves; on a piece the
 * leap clears, on the next piece he walks. Planted: python3 reference/qa-reports/ENG-16H/planted-faults.py (the old lay, at the socket's
 * share of its piece: the 1-6 case goes RED).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { walkedSpan, lianaTouchdown, WALKED_MIN } from './walkedSpan.ts';
import { buildStage } from '../../../tools/engine/libstage.ts';
import { laidAsks } from './pipeline.ts';
import { withSetting } from '../settingDials.ts';
import { walkedStage } from '../petals.ts';
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

test('1-6 rolls 1-3, both settings: every socket petal is inside the walked span of the piece under it (a cleared piece holds none)', () => {
  for (const d of ['normal', 'easy'] as const) {
    for (let seed = 1; seed <= 3; seed++) {
      const st = buildStage('1-6', seed, d) as { platforms: Platform[]; vines: Vine[]; collectibles: Array<{ type: string; x: number; y: number }>; gen2: { fills: Array<{ role: string; x: number; socket: string; section: string }>; asks?: unknown } };
      // (the same walked stage the lay reads: its asks and its miss pieces, ENG-PETAL's one model)
      const laid = walkedStage(st as never);
      assert.ok((laid.asks ?? []).length === laidAsks(st as unknown as Parameters<typeof laidAsks>[0]).length);
      const out: string[] = [];
      withSetting(d, () => {
        for (const f of st.gen2.fills.filter((q) => q.role === 'pickup')) {
          const fl = st.collectibles.filter((c) => c.type === 'flower' && Math.abs(c.x - f.x) <= 40);
          for (const c of fl) {
            // (the piece it stands on: the top one of any stacked under it, 1-6 s6:f over s6:b)
            const under = st.platforms.filter((p) => c.x >= p.x && c.x <= p.x + p.width && c.y < p.y && c.y > p.y - 60).sort((p, q) => p.y - q.y)[0];
            if (!under) continue;
            const ws = walkedSpan(under, laid);
            if (ws.hi - ws.lo < WALKED_MIN) continue;
            if (c.x < ws.lo - 2 || c.x > ws.hi + 2) out.push(`${f.section}:${f.socket} petal x ${Math.round(c.x)} outside ${Math.round(ws.lo)}-${Math.round(ws.hi)} (piece ${Math.round(under.x)}+${Math.round(under.width)})`);
          }
        }
      });
      assert.deepEqual(out, [], `1-6 ${d} seed ${seed}`);
    }
  }
});
