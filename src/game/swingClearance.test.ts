/**
 * The height-aware swing clearance and its lay rule (the lead's ruling (b), 11-14 4:42 PM ET, R-165.246; ENG-16G).
 *
 * physics.ts swingClearance measured two vines foot to foot: both feet at the front of their swings, as if both hung the full length.
 * A short vine hung high beside a long liana was held as far off as a long one, and the lay never asked at all: 1-6's false liana (a
 * still snake, ~160 px) hung 78-85 px in front of its real liana (420 px, swinging 0.45), its rope across Pokey's body as he swung
 * (vineSelfSwing.test.ts went red on the new 1-6, rolls 1-3). Now the measure is taken height by height (every depth he can hang,
 * SWING.minLen to the foot, his body and the margin, against the other vine's rope there), and pipeline.ts clearSwings lays every
 * section's vines clear by it.
 *
 * Planted both ways: the 78 px pair is RED; the same pair laid clear is GREEN (the old foot-to-foot measure called it RED by 96 px);
 * a swinging pair of one top and one length reads exactly as before, and no pair reads stricter than before. The lay: every roll of
 * 1-6's false-liana and gorge sections, both settings, lays clear (RED with clearSwings taken out: the false liana stays 78-85 px in).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { SWING_CLEAR, swingClearance, swingReach, vineAmp, type SwingVine } from './physics.ts';
import { layLocal, planBudget, rngFor } from './gen2/pipeline.ts';
import { kitLib16 } from './gen2/worlds/w1Arc16.ts';
import { generateAllLevels } from './worldsData.ts';

const vine = (x: number, topY: number, bottomY: number, swingAmp: number): SwingVine => ({ x, topY, bottomY, swingAmp });
/** the measure before ENG-16G: both feet at the front of their swings */
const footToFoot = (a: SwingVine, b: SwingVine) => Math.abs(b.x - a.x) - swingReach(a) - swingReach(b) - SWING_CLEAR.body - SWING_CLEAR.margin;

// 1-6 roll 1 on t-build-16 68e4bce1 (vineSelfSwing's failing pair, pasted from the stage): the false liana and its real liana
const FALSE_78 = vine(38624, 469, 638, 0);
const REAL = vine(38702, 472, 892, 0.45);

test('swing clearance: the false liana 78 px in front of a 420 px liana swinging 0.45 is RED (its rope crosses his body as he swings)', () => {
  assert.ok(swingClearance(FALSE_78, REAL) < 0, `${swingClearance(FALSE_78, REAL).toFixed(1)} px`);
  assert.ok(swingClearance(REAL, FALSE_78) < 0, 'either way round');
});

test('swing clearance: the same false liana laid clear (137 px in front) is GREEN, height by height; foot to foot read it 96 px RED', () => {
  const clear = { ...FALSE_78, x: 38565 };
  assert.ok(swingClearance(clear, REAL) >= 0, `${swingClearance(clear, REAL).toFixed(1)} px`);
  assert.ok(footToFoot(clear, REAL) < -90, `the old measure: ${footToFoot(clear, REAL).toFixed(1)} px`);
  // (and a still vine hung below the liana's reach, short and high, needs only his body and the margin)
  assert.equal(swingClearance(vine(1000, 100, 200, 0), vine(1060, 100, 520, 0.45)) >= 0, false, '60 px: inside his body and the liana\'s upper rope');
  assert.ok(swingClearance(vine(1000, 100, 160, 0), vine(1130, 100, 520, 0.45)) >= 0, '130 px off a 60 px vine: clear');
});

test('swing clearance: a swinging pair of one top and one length reads exactly as before; no pair reads stricter than before', () => {
  let n = 0;
  for (const L of [160, 300, 420]) {
    for (const amp of [0.2, 0.3, 0.45]) {
      for (const dx of [150, 250, 400]) {
        const a = vine(0, 100, 100 + L, amp), b = vine(dx, 100, 100 + L, amp * 0.8);
        assert.ok(Math.abs(swingClearance(a, b) - footToFoot(a, b)) < 1e-9, `L ${L} amp ${amp} dx ${dx}`);
        n++;
      }
    }
  }
  for (const dTop of [-200, -60, 0, 30, 150]) {
    for (const [La, Lb] of [[160, 420], [420, 160], [300, 310]]) {
      for (const [aa, ab] of [[0, 0.45], [0.45, 0], [0.3, 0.25]]) {
        const a = vine(0, 100, 100 + La, aa), b = vine(200, 100 + dTop, 100 + dTop + Lb, ab);
        const c = swingClearance(a, b);
        assert.ok(c >= footToFoot(a, b) - 1e-9, `dTop ${dTop} L ${La}/${Lb} amp ${aa}/${ab}: ${c.toFixed(1)} < foot to foot ${footToFoot(a, b).toFixed(1)}`);
        n++;
      }
    }
  }
  // (1-6's chain, roll 1, pasted: two swinging lianas sized by chainAmp to exactly clear foot to foot, 14 px apart at the top)
  const c1 = vine(12081, 400, 810, 0.244), c2 = vine(12329, 386, 796, 0.244);
  assert.ok(Math.abs(swingClearance(c1, c2) - footToFoot(c1, c2)) < 1e-9, 'the chain reads as before');
  assert.ok(n > 50);
});

test('swing clearance: two vines that share no depth (one hung wholly under the other\'s reach) never meet', () => {
  assert.equal(swingClearance(vine(0, 100, 200, 0.45), vine(10, 400, 700, 0.45)), Infinity);
});

for (const difficulty of ['normal', 'easy'] as const) {
  test(`swing clearance lay (${difficulty}): every roll of 1-6's false liana and gorge lays its vines clear of every swing (pipeline.ts clearSwings)`, () => {
    const c = generateAllLevels().find((l) => l.id === '1-6')!;
    const M = kitLib16().manifest;
    const tpls = M.sections.filter((t) => /false-liana|gorge/.test(t.id));
    assert.ok(tpls.length >= 2, tpls.map((t) => t.id).join());
    const bad: string[] = [];
    let pairs = 0;
    for (const tpl of tpls) {
      for (let seed = 1; seed <= 40; seed++) {
        const L = layLocal(tpl, planBudget(c, M, difficulty), rngFor(seed, 0));
        const vs = L.pieces.filter((p) => p.hang).map((p) => ({ key: p.key, v: vine(p.x, p.y, p.y + p.h, p.hang!.kind === 'vine' ? 0 : p.hang!.swing?.amp ?? 0.45) }));
        for (let i = 0; i < vs.length; i++) {
          for (let j = i + 1; j < vs.length; j++) {
            if (vineAmp(vs[i].v) === 0 && vineAmp(vs[j].v) === 0) continue;
            const cl = swingClearance(vs[i].v, vs[j].v);
            if (!Number.isFinite(cl)) continue;
            pairs++;
            if (cl < 0) bad.push(`${tpl.id} roll ${seed}: ${vs[i].key} and ${vs[j].key} ${cl.toFixed(0)} px`);
          }
        }
        const f = L.pieces.find((p) => p.key === 'f');
        assert.ok(f && f.hang?.swing?.amp === 0, `${tpl.id} roll ${seed}: the false liana is laid still`);
      }
    }
    assert.ok(pairs >= tpls.length * 40, `${pairs} pairs (one or more a roll)`);
    assert.deepEqual(bad, []);
  });
}
