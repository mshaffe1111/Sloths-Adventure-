/**
 * World 7's swing and climb sections (gen2/worlds/w7Swing.ts), each laid alone on 30 rolls, Normal and Easy, and built into the stages that
 * take them (7-5, 7-9) through buildGen2Stage on 20 rolls with World 7's own kit (w7GameKit) and these sections folded in: each section is
 * 600-1700 px (+370 a liana), level at its ends, its hops half a jump at most; every roll passes levelCheck, is long enough, nothing of
 * these sections crumbles, and the first climb of a stage is the one with Pokey's line.
 */
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { MODEL_FAST, modelStage } from '../stageTime.ts';
import { checkStage, layLocal, maxGap, planBudget, rngFor } from './pipeline.ts';
import { buildW7, cfg7, SWING_STAGES } from './w7Harness.ts';
import { W7_MANIFEST } from './worlds/w7.ts';
import { W7_SWING_SECTIONS, W7_VINES, W7S_STAGES, withW7Swing } from './worlds/w7Swing.ts';

const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);
const MINE = new Set(W7_SWING_SECTIONS.map((s) => s.id));

test('the sections: each is laid in its own space, 600-1700 px (+370 a liana), level at its ends, its hops half a jump at most', () => {
  for (const d of ['normal', 'easy'] as const) {
    const budget = planBudget(cfg7('7-5'), W7_MANIFEST, d);
    for (const s of W7_SWING_SECTIONS) {
      const keys = new Set(s.pieces.map((p) => p.key));
      for (const k of s.sockets) assert.ok(keys.has(k.on), `${s.id}.${k.id} sits on a piece it has`);
      for (let r = 1; r <= 30; r++) {
        const L = layLocal(s, budget, rngFor(r));
        const lianas = L.pieces.filter((p) => p.shape === 'liana').length;
        assert.ok(L.width >= 600 && L.width <= 1700 + 370 * lianas, `${s.id}: ${L.width} px`);
        assert.ok(Math.abs(L.exit.y - s.exitDy) <= 25, `${s.id}: exitDy ${s.exitDy}, laid ${L.exit.y}`);
        const swung = (g: { x0: number; x1: number }) => L.pieces.some((p) => p.shape === 'liana' && p.x >= g.x0 - 1 && p.x <= g.x1 + 1);
        for (const g of L.gaps) if (!swung(g)) assert.ok(g.x1 - g.x0 <= Math.max(60, maxGap(0, false, budget.margin) * 0.5) + 1, `${s.id}: a ${g.x1 - g.x0} px hop`);
        // (a liana section is never mirrored, nor one with a tip: its line must come before what it teaches)
        if (s.pieces.some((p) => p.shape === 'liana') || s.sockets.some((k) => k.role === 'tip')) assert.equal(s.mirrorable, false, s.id);
      }
    }
  }
  // (the brown vines: the first climb of a stage teaches them with Pokey's line, w7.ts W7_TIPS; every other climb waits for it)
  assert.ok(W7_MANIFEST.tips?.[W7_VINES], "Pokey's line for the brown vines");
  assert.deepEqual(W7_SWING_SECTIONS.filter((s) => s.teaches === W7_VINES).map((s) => s.id), ['w7s-vine-wall']);
  for (const s of W7_SWING_SECTIONS) if (s.pieces.some((p) => p.shape === 'vine') && s.teaches !== W7_VINES) assert.ok(s.uses?.includes(W7_VINES), `${s.id} uses the brown vines`);
  // (nothing here crumbles: World 7's crumbling floors are w7Ground's, never required)
  for (const s of W7_SWING_SECTIONS) assert.ok(!s.zones?.length && !s.pieces.some((p) => p.crumble), `${s.id}: nothing crumbles`);
  // (only the halls take them; the other stages' kits are unchanged)
  for (let st = 1; st <= 9; st++) {
    const k = withW7Swing({ manifest: W7_MANIFEST }, st);
    assert.equal(k.manifest.sections.filter((s) => MINE.has(s.id)).length, W7S_STAGES.includes(st) ? W7_SWING_SECTIONS.length : 0, `7-${st}`);
  }
});

for (const id of SWING_STAGES) {
  test(`${id} with the swing sections on 20 rolls, Normal and Easy: levelCheck passes, long enough, swings drawn, the first climb taught`, () => {
    let swings = 0;
    for (const difficulty of ['normal', 'easy'] as const) {
      for (const seed of SEEDS) {
        const st = buildW7(id, seed, difficulty);
        assert.deepEqual(checkStage(st, st.gen2.budget).errors, [], `${difficulty} ${seed}`);
        const fast = modelStage(st, MODEL_FAST).total;
        assert.ok(fast >= st.gen2.budget.seconds.fastFloor && fast >= 120, `${difficulty} ${seed}: fast ${fast.toFixed(0)} s`);
        // (a climb before the lesson would be untaught: the first vine section is the one that teaches it)
        const climbs = st.gen2.sections.filter((s) => W7_SWING_SECTIONS.find((t) => t.id === s.template)?.pieces.some((p) => p.shape === 'vine'));
        if (climbs.length) assert.equal(climbs[0].template, 'w7s-vine-wall', `${difficulty} ${seed}: the first climb is the taught one`);
        swings += st.vines.filter((v) => v.vineType === 'swing_liana').length;
      }
    }
    // (the halls' rolls hold lianas: the sections are drawn, not only listed)
    assert.ok(swings >= 20, `${id}: ${swings} lianas in 40 rolls`);
  });
}
