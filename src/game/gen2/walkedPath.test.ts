/**
 * The ONE walked-path model (gen2/walkedSpan.ts; ENG-PETAL 11-14, R-165.246, R-165.263): the gen2 socket lay (pipeline.ts fillSockets)
 * and the petal fill (petals.ts fillGaps) both read it, on every stage of every world. ENG-16I's five classes of the petals 1-6's expert
 * left (reference/qa-reports/ENG-16I/bots/expert-petals-table.md), each planted RED on the old lay first:
 *   A. a piece he clears in the air on a PLAIN jump (no liana or ask beside it) is no walked span: its petals go on the next he walks;
 *   B. set down past the span by a plain jump's flight, or taken off before it at the testers' far take-off;
 *   C. never on a piece he stands on only after a miss (a soft pit's floor), never as a cleared piece's next;
 *   D. a narrow span is no span: every socket petal is inside the walked span of the piece under it, none skipped as "narrow";
 *   E. the fill lays its ledge trails only inside walked spans, and a stage whose brief says petals LOW gets no fill and no arc at all.
 * Planted: python3 reference/qa-reports/ENG-PETAL/planted.py (each fault back in turn: its test RED).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { walkedPiece, walkedSpan, jumpTouchdown, TAKEOFF_FAR, WALKED_MIN } from './walkedSpan.ts';
import { generateStage, setLayoutVariant, type GeneratedStage } from '../stageGenerator.ts';
import { generateAllLevels } from '../worldsData.ts';
import { petalPass } from '../petalPass.ts';
import { isPetal, type PetalOut } from '../petals.ts';
import { walkedStage } from '../petals.ts';
import { withSetting } from '../settingDials.ts';
import type { Platform, Vine } from '../types.ts';

const P = (id: number, x: number, y: number, width: number, extra: Partial<Platform> = {}): Platform => ({ id, x, y, width, height: 120, type: 'solid', ...extra } as Platform);
const L = (id: number, x: number, topY: number, bottomY: number): Vine =>
  ({ id, x, topY, bottomY, swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true } as Vine);

test('A: a rest between two plain jumps that a full run flies over is no walked span; its petals go on the next piece he walks', () => {
  withSetting('normal', () => {
    const a = P(1, 0, 600, 300), r = P(2, 360, 600, 220), c = P(3, 640, 600, 600);
    const st = { platforms: [a, r, c], vines: [], asks: [] };
    const ws = walkedSpan(r, st);
    assert.ok(ws.hi - ws.lo < WALKED_MIN, `the rest is cleared: a full jump off the bank sets him down at ${Math.round(ws.lo)}, he leaves by ${Math.round(ws.hi)}`);
    assert.equal(ws.next, c, 'the way off it sets him down on the bank ahead');
    assert.equal(walkedPiece(r, st)?.piece, c, 'a petal laid on the rest goes on the bank he walks');
  });
});

test('B: a wide ledge is walked from where a full jump sets him down to the testers\' far take-off before the next jump', () => {
  withSetting('normal', () => {
    const a = P(1, 0, 600, 300), p = P(2, 360, 600, 500), c = P(3, 880, 600, 400);
    const ws = walkedSpan(p, { platforms: [a, p, c], vines: [], asks: [] });
    assert.equal(Math.round(ws.lo), Math.round(300 + jumpTouchdown(0, 600, 600, false)), 'lo: the full jump off the bank\'s end');
    assert.ok(ws.lo > p.x + 60, `set down past the near end (${Math.round(ws.lo)})`);
    assert.equal(ws.hi, p.x + p.width - TAKEOFF_FAR, 'hi: the far take-off before the gap');
    // (walked on and off across seams, the span is the whole piece)
    const s1 = P(4, 0, 600, 300), s2 = P(5, 300, 600, 300), s3 = P(6, 600, 600, 300);
    assert.deepEqual(walkedSpan(s2, { platforms: [s1, s2, s3], vines: [], asks: [] }), { lo: 300, hi: 600 });
  });
});

test('C: a soft pit\'s floor is never a cleared perch\'s next piece, and a petal laid on it has no walked piece', () => {
  withSetting('normal', () => {
    // (a perch between two lianas over a pit; the pit's floor runs under the second liana to the bank)
    const a = P(1, 0, 600, 300), b = P(2, 560, 600, 60), floor = P(3, 640, 900, 620), c = P(4, 1260, 600, 400);
    const l1 = L(10, 420, 180, 600), l2 = L(11, 900, 180, 600);
    const away = (q: Platform) => q === floor;
    const st = { platforms: [a, b, floor, c], vines: [l1, l2], asks: [], away };
    const ws = walkedSpan(b, st);
    assert.notEqual(ws.next, floor, 'the cleared perch\'s next is never the pit\'s floor');
    assert.notEqual(walkedPiece(b, st)?.piece, floor, 'its petals never go to the floor');
    assert.equal(walkedPiece(floor, st), undefined, 'a petal laid on the floor itself has no walked piece');
  });
});

type Built = { platforms: Platform[]; vines: Vine[]; collectibles: Array<{ id: number; type: string; x: number; y: number }>; config: { id: string }; gen2: { brief?: { petals?: string } } };
const cfg = (id: string) => ({ ...generateAllLevels().find((l) => l.id === id)!, unlocked: true });
/** the stage the game plays (stageGenerator finishStage: the jump trails and petalPass run on it), the castBots layout `v` */
const played = (id: string, d: 'normal' | 'easy', v: number) => {
  setLayoutVariant(v);
  try { return generateStage(cfg(id), d) as unknown as Built; } finally { setLayoutVariant(null); }
};
const standing = (st: Built, c: { x: number; y: number }) => st.platforms.filter((p) => !p.broken && p.type !== 'bouncy' && c.x >= p.x && c.x <= p.x + p.width && p.y - c.y > 0 && p.y - c.y <= 60).sort((p, q) => p.y - q.y)[0];

const D_STAGES: Array<[string, number]> = [['1-6', 3], ['1-1', 2], ['1-7', 1], ['6-1', 1], ['7-3', 1], ['8-2', 1]];
test('D: gen2 stages of four worlds (1-6 layouts 1-3), both settings, as the game plays them: every standing petal (the lay\'s and the fill\'s) is inside the walked span of its piece, never on a miss piece', () => {
  for (const [id, n] of D_STAGES) for (const d of ['normal', 'easy'] as const) {
    for (let v = 1; v <= n; v++) {
      const st = played(id, d, v);
      const out: string[] = [];
      withSetting(d, () => {
        const ws = walkedStage(st as never);
        if (id === '1-6') assert.ok((ws.asks ?? []).length > 0, 'the played stage carries the asks it was laid with');
        for (const c of st.collectibles.filter((q) => isPetal(q as never, st as never))) {
          const p = standing(st, c);
          if (!p || (p.type !== 'solid' && p.type !== 'fragile')) continue;
          if (ws.away!(p)) { out.push(`petal ${c.id} x ${Math.round(c.x)} on a miss piece ${Math.round(p.x)}+${Math.round(p.width)} y ${p.y}`); continue; }
          const w = walkedSpan(p, ws);
          if (w.hi - w.lo < WALKED_MIN || c.x < w.lo - 2 || c.x > w.hi + 2) out.push(`petal ${c.id} x ${Math.round(c.x)} outside ${Math.round(w.lo)}-${Math.round(w.hi)} (piece ${Math.round(p.x)}+${Math.round(p.width)})`);
        }
      });
      assert.deepEqual(out, [], `${id} ${d} layout ${v}`);
    }
  }
});

test('E: a stage whose petal brief says LOW gets no fill after the lay, its arcs over jumps among them (R-165.263); without the brief the same stage does', () => {
  for (const id of ['1-6', '1-7']) {
    const st = played(id, 'normal', 1);
    assert.equal(st.gen2.brief?.petals, 'low', `${id}'s brief says low (data)`);
    // (every petal but the first taken off: the whole route is one long stretch with no trail)
    const bare = (brief: unknown) => {
      const first = st.collectibles.find((c) => c.type === 'flower')!;
      return { ...st, gen2: { ...st.gen2, brief }, collectibles: st.collectibles.filter((c) => c.type !== 'flower' || c === first).map((c) => ({ ...c })) } as unknown as GeneratedStage;
    };
    const low = bare(st.gen2.brief), any = bare(undefined);
    const out: PetalOut = {} as PetalOut;
    withSetting('normal', () => petalPass(low, out));
    assert.equal(out.filled ?? 0, 0, `${id}: no fill under a low brief`);
    const out2: PetalOut = {} as PetalOut;
    withSetting('normal', () => petalPass(any, out2));
    assert.ok((out2.filled ?? 0) > 0, `${id} without the brief: the fill lays petals (the gate is the brief's)`);
  }
});
