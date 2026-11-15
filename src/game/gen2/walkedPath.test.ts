/**
 * The ONE walked-path model (gen2/walkedSpan.ts; ENG-PETAL 11-14, R-165.246, R-165.263), restated to the lead's ruling INT-10d 11-15: the
 * model decides WHICH petals the door counts (petals.ts markWalked, Collectible.walked; goals.ts goalCounts), never WHERE they go (placing
 * by it stripped 13 stages, 6-2 73 -> 5: the socket lay and the fill lay as main does). ENG-16I's five classes of the petals 1-6's expert
 * left (reference/qa-reports/ENG-16I/bots/expert-petals-table.md), each now a petal the door does not count:
 *   A. a piece every run touches is path, its whole top walked (ruling A); a piece a full run's plain jump clears outright has no span;
 *   B. set down past the span by a plain jump's flight, or taken off before it at the testers' far take-off;
 *   C. a piece he stands on only after a miss (a soft pit's floor) is never a cleared piece's next, and no petal on it is counted;
 *   D. on the played stage, every standing petal is counted exactly when it is inside its piece's walked span on a piece off no miss;
 *   E. a stage whose brief says petals LOW gets no fill and no arc at all (a brief by data, kept).
 * F (planted): a stage with petals off the walked path: the door's count leaves them out; with the exclusion switched off the share asks
 * for more than every run passes (sealed). G: placement is main's again (6-2 holds main's 73).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { walkedSpan, jumpTouchdown, TAKEOFF_FAR, WALKED_MIN } from './walkedSpan.ts';
import { generateStage, setLayoutVariant, type GeneratedStage } from '../stageGenerator.ts';
import { generateAllLevels } from '../worldsData.ts';
import { petalPass } from '../petalPass.ts';
import { isPetal, markWalked, walkedStage, type PetalOut } from '../petals.ts';
import { goalCounts, normalGoal, onCrumbling } from '../goals.ts';
import { withSetting } from '../settingDials.ts';
import type { Platform, Vine } from '../types.ts';

const P = (id: number, x: number, y: number, width: number, extra: Partial<Platform> = {}): Platform => ({ id, x, y, width, height: 120, type: 'solid', ...extra } as Platform);
const L = (id: number, x: number, topY: number, bottomY: number): Vine =>
  ({ id, x, topY, bottomY, swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true } as Vine);

/** the door's verdict on a petal laid 34 px over `on` at x on a toy (petals.ts markWalked on a stage of just these pieces) */
const counted = (st: { platforms: Platform[]; vines: Vine[]; asks: unknown[]; away?: (q: Platform) => boolean }, on: Platform, x: number): boolean => {
  const fl = { id: 1, type: 'flower' as const, x, y: on.y - 34, collected: false, bobPhase: 0 } as { id: number; type: 'flower'; x: number; y: number; collected: boolean; bobPhase: number; walked?: boolean };
  const stage = { config: { id: 'toy', worldIndex: 1, miniIndex: 1, objectiveType: 'harvest' }, platforms: st.platforms, vines: st.vines, collectibles: [fl], heartFalls: on === st.platforms.find((q) => st.away?.(q)) ? [{ x0: on.x, x1: on.x + on.width, soft: true }] : undefined } as never;
  markWalked(stage);
  return fl.walked !== false;
};

// (restated to the lead's ruling A, 11-15 1:41 PM ET (INT-10c): a piece every run TOUCHES is path. ENG-PETAL's first test read this rest as
// cleared (no span, its petals moved on); but no plain jump clears it, so every run sets down on it and leaves at once: its whole top is
// walked and its petals stay. The model's purpose holds: a piece a full run's jump clears outright has no span (A2), no petal in the air)
test('A: a rest between two plain jumps that every run touches and leaves at once is path: its whole top is walked, its petals count (ruling A)', () => {
  withSetting('normal', () => {
    const a = P(1, 0, 600, 300), r = P(2, 360, 600, 220), c = P(3, 640, 600, 600);
    const st = { platforms: [a, r, c], vines: [], asks: [] };
    const ws = walkedSpan(r, st);
    assert.deepEqual([ws.lo, ws.hi], [r.x, r.x + r.width], 'the whole rest is walked');
    assert.equal(counted(st, r, r.x + 110), true, 'a petal laid on the rest is one the door counts');
  });
});

test("A2: a rest a full run's plain jump clears outright is no walked span: a petal laid on it stays there and is never counted", () => {
  withSetting('normal', () => {
    const a = P(1, 0, 600, 300), r = P(2, 330, 600, 40), c = P(3, 400, 600, 600);
    const st = { platforms: [a, r, c], vines: [], asks: [] };
    const ws = walkedSpan(r, st);
    assert.ok(ws.hi - ws.lo < WALKED_MIN, `the rest is cleared (${Math.round(ws.lo)}-${Math.round(ws.hi)})`);
    assert.equal(counted(st, r, r.x + 20), false, 'a petal on the cleared rest is not counted by the door');
    assert.equal(counted(st, c, c.x + 300), true, 'a petal on the bank he walks is');
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

test('C: a soft pit\'s floor is never a cleared perch\'s next piece, and a petal laid on it is never counted', () => {
  withSetting('normal', () => {
    // (a perch between two lianas over a pit; the pit's floor runs under the second liana to the bank)
    const a = P(1, 0, 600, 300), b = P(2, 560, 600, 60), floor = P(3, 640, 900, 620), c = P(4, 1260, 600, 400);
    const l1 = L(10, 420, 180, 600), l2 = L(11, 900, 180, 600);
    const away = (q: Platform) => q === floor;
    const st = { platforms: [a, b, floor, c], vines: [l1, l2], asks: [], away };
    const ws = walkedSpan(b, st);
    assert.notEqual(ws.next, floor, 'the cleared perch\'s next is never the pit\'s floor');
    assert.equal(counted(st, floor, floor.x + 300), false, 'a petal laid on the floor itself is not counted');
  });
});

type Built = { platforms: Platform[]; vines: Vine[]; collectibles: Array<{ id: number; type: string; x: number; y: number; walked?: boolean; arc?: true }>; config: { id: string }; gen2: { brief?: { petals?: string } } };
const cfg = (id: string) => ({ ...generateAllLevels().find((l) => l.id === id)!, unlocked: true });
/** the stage the game plays (stageGenerator finishStage: the jump trails and petalPass run on it), the castBots layout `v` */
const played = (id: string, d: 'normal' | 'easy', v: number) => {
  setLayoutVariant(v);
  try { return generateStage(cfg(id), d) as unknown as Built; } finally { setLayoutVariant(null); }
};
const crumbling = (st: Built) => st.collectibles.filter((c) => (c.type === 'flower' || c.type === 'leaf') && c.walked !== false && !c.arc && onCrumbling(c, st.platforms)).length;
const standing = (st: Built, c: { x: number; y: number }) => st.platforms.filter((p) => !p.broken && p.type !== 'bouncy' && c.x >= p.x && c.x <= p.x + p.width && p.y - c.y > 0 && p.y - c.y <= 60).sort((p, q) => p.y - q.y)[0];

const D_STAGES: Array<[string, number]> = [['1-6', 3], ['1-1', 2], ['1-7', 1], ['6-1', 1], ['7-3', 1], ['8-2', 1]];
test('D: gen2 stages of four worlds (1-6 layouts 1-3), both settings, as the game plays them: the door counts a standing petal exactly when it is inside the walked span of its piece, never on a miss piece', () => {
  for (const [id, n] of D_STAGES) for (const d of ['normal', 'easy'] as const) {
    for (let v = 1; v <= n; v++) {
      const st = played(id, d, v);
      const out: string[] = [];
      withSetting(d, () => {
        const ws = walkedStage(st as never);
        if (id === '1-6') assert.ok((ws.asks ?? []).length > 0, 'the played stage carries the asks it was laid with');
        for (const c of st.collectibles.filter((q) => q.type === 'flower' || q.type === 'leaf')) {
          if (typeof c.walked !== 'boolean') { out.push(`petal ${c.id} x ${Math.round(c.x)} carries no walked verdict`); continue; }
          const p = standing(st, c);
          if (!p || (p.type !== 'solid' && p.type !== 'fragile')) continue;
          const w = walkedSpan(p, ws);
          const want = !ws.away!(p) && w.hi - w.lo >= WALKED_MIN && c.x >= w.lo - 2 && c.x <= w.hi + 2;
          if (c.walked !== want) out.push(`petal ${c.id} x ${Math.round(c.x)} walked ${c.walked}, the span says ${want} (${Math.round(w.lo)}-${Math.round(w.hi)}, piece ${Math.round(p.x)}+${Math.round(p.width)})`);
        }
      });
      assert.deepEqual(out, [], `${id} ${d} layout ${v}`);
    }
  }
});

// (F, planted: the door's exclusion. Every run passes the petals marked walked; a share of those is what the door asks. With the exclusion
//  switched off (the marks ignored: the old count), the share is of every petal, more than every run passes: the sealed door ENG-PETAL saw)
test('F: 1-6 layouts 1-3 (Normal) hold petals off the walked path; the door asks only a share of the walked ones; switched off, it asks more than every run passes (sealed)', () => {
  for (let v = 1; v <= 3; v++) {
    const st = played('1-6', 'normal', v);
    const all = st.collectibles.filter((c) => c.type === 'flower' || c.type === 'leaf');
    const off = all.filter((c) => c.walked === false);
    assert.ok(off.length > 0, `1-6 layout ${v}: no petal off the walked path (the toy proves nothing)`);
    // (what every run passes: the petals the door counts, goalCounts; a run that takes just those meets the goal)
    const have = goalCounts(st as never).petals;
    assert.equal(have, all.filter((c) => c.walked !== false && !c.arc).length - crumbling(st), `1-6 layout ${v}: the count is the walked petals`);
    const goal = normalGoal(st as never)!;
    assert.ok(goal <= have, `1-6 layout ${v}: the goal ${goal} is within the ${have} every run passes`);
    // (the plant: the marks ignored, the goal is a share of every petal: more than every run passes)
    const sealed = normalGoal({ ...st, collectibles: st.collectibles.map((c) => ({ ...c, walked: undefined })) } as never)!;
    assert.ok(sealed > have, `1-6 layout ${v}: switched off, the share asks ${sealed} of the ${have} every run passes (${off.length} off the path)`);
  }
});

// (G: placement is main's again. 6-2 layout 1 Normal holds main 73e7bed0's 73 petals: the walked-span lay had left 5, INT-10c 83)
test('G: placement is main\'s lay: 6-2 layout 1 Normal holds main\'s 73 petals', () => {
  const st = played('6-2', 'normal', 1);
  assert.equal(st.collectibles.filter((c) => isPetal(c as never, st as never)).length, 73);
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
