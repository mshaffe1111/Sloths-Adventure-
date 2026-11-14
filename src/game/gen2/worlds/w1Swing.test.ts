// World 1's lianas and the grip dial (ENGINE-678 A1 SWING-W1): planted tests. Red without the dial (pipeline gripsOf, the swing lay
// carrying `grip`, lianaBand's cache key) or without withSwing; proven on World 1's kit (1-6) and World 6's (6-3), both settings.
import test from 'node:test';
import assert from 'node:assert/strict';
import { jumpLinkGap, layLocal, lianaBand, lianaRelease, planBudget, rngFor, VINE } from '../pipeline.ts';
import { gripsOf, swingLandings } from '../../levelCheck.ts';
import { pressWindow, type AirBody } from '../../physics.ts';
import { LIANA, type LianaSwing, type WorldKit } from '../types.ts';
import { generateAllLevels } from '../../worldsData.ts';
import { w1World } from './w1.ts';
import { w6Kit } from './w6.ts';
import { W1_LIANA_GAP, W1_SWING_SECTIONS, withSwing } from './w1Swing.ts';

// 1-6.md's measured liana: 420 px long, the ledge it leaves 400 px under its anchor; the perch level with that ledge, `near` px past
// the anchor (SHORT at most 430, LONG 480-500, FAR 530-560)
const LIANA_16 = { x: 0, topY: 0, bottomY: 420 };
const win = (near: number, d: 'normal' | 'easy', grip?: LianaSwing['grip']) =>
  lianaRelease(LIANA_16, { amp: VINE.amp, period: VINE.period[d], ...(grip ? { grip } : {}) }, { x: near, y: 400, w: 300 }, d);

test('the grip dial: a liana\'s reach is checked at the holds its row names (pressWindow grips), both settings', () => {
  // no dial: exactly pressWindow's own two low holds, so every liana laid before the dial keeps its window (and every lock)
  assert.equal(gripsOf(undefined, 420), undefined);
  const hits = (c: AirBody, _t: number, prevY: number) => c.vy >= 0 && prevY <= 400 + 14 && c.y >= 400 && c.x > 500 + 10 && c.x < 500 + 300;
  assert.equal(win(500, 'normal'), pressWindow({ ...LIANA_16, swingAmp: VINE.amp, swingPeriod: VINE.period.normal, swingPhase: 0 }, hits) / 1000);
  for (const d of ['normal', 'easy'] as const) {
    const need = LIANA.window[d];
    // FAR: only the foot flies it. The two low holds' worse (0.7) falls short; the 'low' dial checks the foot alone
    const far = d === 'normal' ? 540 : 500;
    assert.ok(win(far, d) < need, `${d} ${far} px: the default holds already fly a FAR gap (${win(far, d)} s): the test proves nothing`);
    assert.ok(win(far, d, 'low') >= need, `${d} ${far} px: the foot's window ${win(far, d, 'low')} s is under ${need} s`);
    // LONG: the low holds fly it, the top does not (1-6.md: "top 0 ms"): a 'high' liana is never laid over it
    const long = d === 'normal' ? 500 : 480;
    assert.ok(win(long, d) >= need && win(long, d, 'high') === 0, `${d} ${long} px: LONG from the low holds ${win(long, d)} s, from the top ${win(long, d, 'high')} s`);
    // SHORT: the top still flies it, so every hold does ("climb high, then let go")
    assert.ok(win(430, d, 'high') >= need, `${d}: SHORT from the top ${win(430, d, 'high')} s`);
  }
  // 'high' is the highest hold he can take (SWING.minLen down it), whatever the liana's length
  assert.deepEqual(gripsOf('high', 420), [80 / 420]);
  assert.deepEqual(gripsOf('low', 420), [0.95]);
});

test('a perch band is flown at its liana\'s own grip: a cached window of another grip is never reused', () => {
  // the same liana and ledge, its band asked at the top first (cached), then at the foot: the foot's band reaches a FAR perch, the
  // top's never past a SHORT one (1-6.md: top 0 ms at 480 px). A cache that forgot the grip handed the foot the top's windows
  const from = { x: -480, y: 400, w: 300 };
  const band = (grip?: LianaSwing['grip']) => lianaBand(from, LIANA_16, { amp: VINE.amp, period: VINE.period.normal, ...(grip ? { grip } : {}) }, 0, 300, LIANA.window.normal, -Infinity, 'normal', true);
  const high = band('high')!;
  const low = band('low')!;
  const plain = band()!;
  assert.ok(high[1] < 460, `the top's band reaches ${high[1]} px`);
  assert.ok(low[1] >= 520, `the foot's band reaches only ${low[1]} px: the top's cached windows were reused`);
  // and the plain band (no dial) is the level check's of every liana before it: unchanged
  assert.ok(plain[1] < low[1]);
});

const all = generateAllLevels();
const KITS: Array<[string, WorldKit]> = [['1-6', withSwing(w1World())], ['6-3', withSwing(w6Kit(3))]];

test('withSwing adds the swing move by data; World 1\'s own manifest keeps its moves, so 1-1..1-5 build as before', () => {
  assert.deepEqual(w1World().manifest.moves, ['double']);
  assert.ok(withSwing(w1World()).manifest.moves.includes('swing'));
  const w6 = w6Kit(3);
  assert.equal(withSwing(w6), w6, 'a kit that has the swing already is returned as it was');
});

test('World 1\'s liana rows lay on World 1\'s and World 6\'s kits: the grip rides the row to the liana, its perch flies at that grip and lies past every jump', () => {
  for (const [id, kit] of KITS) {
    const cfg = { ...all.find((l) => l.id === id)!, unlocked: true };
    for (const d of ['normal', 'easy'] as const) {
      const b = planBudget(cfg, kit.manifest, d);
      for (const t of W1_SWING_SECTIONS) {
        const gap = t.id.replace('w1-liana-', '') as keyof typeof W1_LIANA_GAP;
        for (let i = 1; i <= 4; i++) {
          const L = layLocal(t, b, rngFor(i));
          const [a, l, p] = ['a', 'l', 'b'].map((k) => L.pieces.find((q) => q.key === k)!);
          const sw = l.hang!.swing!;
          assert.equal(sw.grip, W1_LIANA_GAP[gap].grip, `${id} ${d} ${t.id} roll ${i}: the row's grip did not reach the liana`);
          const w = lianaRelease({ x: l.x, topY: l.y, bottomY: l.y + l.h }, sw, { x: p.x, y: p.y, w: p.w }, d);
          assert.ok(w >= LIANA.window[d], `${id} ${d} ${t.id} roll ${i}: a ${w} s window at its grip`);
          // (the lay records it before the pieces are rounded to whole px: one frame either way)
          assert.ok(Math.abs(l.hang!.window! - w) <= 1 / 30 + 1e-9, `the window the lay records (${l.hang!.window}) is not the one at its grip (${w})`);
          assert.ok(p.x - (a.x + a.w) > jumpLinkGap(a.y - p.y, b.world, b.stage, b.doubleTaught), `${id} ${d} ${t.id} roll ${i}: a jump crosses it`);
          // the anchor 400-420 px over the bough it leaves (1-6.md's liana)
          assert.ok(a.y - l.y >= 400 && a.y - l.y <= 420);
        }
      }
    }
  }
});

test('the level check flies a liana with a grip dial as the engine plays it (opt-in): a FAR gap links from the foot, never without the dial or past his reach', () => {
  // 1-6.md's FAR gap: the perch 540 px past the anchor, level with the ledge he left (400 px under the anchor, the liana 420 long)
  const near = { id: -1, x: -480, y: 400, width: 300, height: 90, type: 'solid' as const };
  const lines = (gap: number, grip?: 'low' | 'high', dbl = true) => {
    const v = { id: 1, x: 0, topY: 0, bottomY: 420, swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana' as const, isSwingingVine: true, ...(grip ? { grip } : {}) };
    const far = { id: -2, x: gap, y: 400, width: 300, height: 90, type: 'solid' as const };
    return swingLandings(near, v, 1, [near, far], 1e9, dbl).get(-2) ?? 0;
  };
  // with the dial, from the foot with the double: linked (6 lines: a 200 ms press window)
  assert.ok(lines(540, 'low') >= 6, `FAR from the foot: ${lines(540, 'low')} lines`);
  // without the dial: the plain check of every liana before it, which never flew a hold or the double, still refuses it
  assert.equal(lines(540), 0, 'without the dial the plain check is unchanged');
  // past the foot's measured reach (1-6.md: foot + double 591-607 px), refused even with the dial; and with no double (a stage before it
  // is taught), the foot alone does not reach a FAR gap
  assert.equal(lines(640, 'low'), 0, 'past his reach');
  assert.equal(lines(540, 'low', false), 0, 'no double, no FAR');
  // the top ('high') links a SHORT gap and not a FAR one
  assert.ok(lines(420, 'high') >= 6 && lines(540, 'high') === 0);
  // the other way round: the same gap mirrored is the same answer
  const v = { id: 1, x: 0, topY: 0, bottomY: 420, swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana' as const, isSwingingVine: true, grip: 'low' as const };
  const back = { id: -1, x: 180, y: 400, width: 300, height: 90, type: 'solid' as const };
  const farL = { id: -2, x: -540 - 300, y: 400, width: 300, height: 90, type: 'solid' as const };
  assert.equal(swingLandings(back, v, -1, [back, farL], 1e9, true).get(-2) ?? 0, lines(540, 'low'));
});
