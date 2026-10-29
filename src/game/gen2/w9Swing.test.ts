/**
 * World 9's chain sections (gen2/worlds/w9Swing.ts), each laid alone on 30 rolls, Normal and Easy, and 9-3 "Ember Canopy" built through
 * buildGen2Stage on 20 raw rolls a setting (on the stand-in kit until w9Game.ts lands: w9SwingHarness.ts): every roll passes levelCheck,
 * the quick route swings on every chain (none is walked under through its pit or jumped past), the quick player takes 2:00 or more,
 * nothing crumbles, nothing stands in the opening five seconds, flags are close enough, and Normal's falls are the lava (deadly) while
 * Easy's are all soft.
 */
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateStage } from '../levelCheck.ts';
import { MODEL_TYPICAL, walkSpeed } from '../stageTime.ts';
import { buildGen2Stage, FLAG_SPAN, layLocal, maxGap, planBudget, rngFor } from './pipeline.ts';
import type { Gen2Stage } from './types.ts';
import { cfg9, w9StandIn } from './w9SwingHarness.ts';
import { RAISE, W9_SWING_SECTIONS } from './worlds/w9Swing.ts';
import { pickRoute } from '../../../tools/inspect/eraRoll.ts';

const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);

test('the chain sections: laid in their own space (600-1700 px, 370 more a chain), level at their ends, hops a third of a jump or so, never mirrored', () => {
  for (const d of ['normal', 'easy'] as const) {
    const budget = planBudget(cfg9('9-3', 'vine_runner'), w9StandIn(3, d).manifest, d);
    for (const s of W9_SWING_SECTIONS) {
      const keys = new Set(s.pieces.map((p) => p.key));
      for (const k of s.sockets) assert.ok(keys.has(k.on), `${s.id}.${k.id} sits on a piece it has`);
      assert.equal(s.mirrorable, false, s.id);
      assert.ok(s.id.startsWith('w9s-'), s.id);
      for (let r = 1; r <= 30; r++) {
        const L = layLocal(s, budget, rngFor(r));
        const chains = L.pieces.filter((p) => p.shape === 'liana').length;
        assert.ok(chains >= 1, s.id);
        assert.ok(L.width >= 600 && L.width <= 1700 + 370 * chains, `${s.id} ${d}: ${L.width} px`);
        assert.ok(Math.abs(L.exit.y - s.exitDy) <= 25, `${s.id} ${d}: exitDy ${s.exitDy}, laid ${L.exit.y}`);
        const swung = (g: { x0: number; x1: number }) => L.pieces.some((p) => p.shape === 'liana' && p.x >= g.x0 - 1 && p.x <= g.x1 + 1);
        for (const g of L.gaps) if (!swung(g)) assert.ok(g.x1 - g.x0 <= Math.max(60, maxGap(0, false, budget.margin) * 0.45) + 1, `${s.id}: a ${g.x1 - g.x0} px hop`);
        // (a perch in front of a lower ledge is 190 px or more: levelCheck's jump links pass through a narrow perch's face, World 8's lesson)
        for (const p of s.pieces) {
          if (p.place.kind !== 'land') continue;
          const lp = L.pieces.find((q) => q.key === p.key)!;
          const next = L.pieces.find((q) => q.shape === 'bank' && Math.abs(q.x - (lp.x + lp.w)) < 2 && q.y > lp.y);
          if (next) assert.ok(lp.w >= 190, `${s.id}: the perch ${p.key} is ${lp.w} px in front of a lower ledge`);
        }
      }
    }
  }
  assert.equal(RAISE, -80);
});

const cache = new Map<string, Gen2Stage>();
const build = (seed: number, difficulty: 'easy' | 'normal') => {
  const k = `${seed}:${difficulty}`;
  if (!cache.has(k)) cache.set(k, buildGen2Stage({ config: cfg9('9-3', 'vine_runner'), kit: w9StandIn(3, difficulty), seed, difficulty }));
  return cache.get(k)!;
};

test('9-3 on 20 raw rolls, Normal and Easy: levelCheck, every chain swung, 2:00 or more, nothing crumbles, a quiet opening, flags close enough, the lava only on Normal', () => {
  const seen = new Set<string>();
  for (const difficulty of ['normal', 'easy'] as const) {
    for (const seed of SEEDS) {
      const st = build(seed, difficulty);
      const at = `9-3 seed ${seed} (${difficulty})`;
      assert.deepEqual(validateStage(st).errors, [], at);
      const R = pickRoute('vine_runner', st as never);
      assert.notEqual(R.used.route.traced, 'failed', at);
      assert.ok(R.quick.time >= 120, `${at}: ${R.quick.time.toFixed(0)} s for the quick player`);
      const swings = R.used.route.segs.filter((s) => s.kind === 'swing');
      const chains = st.vines.filter((v) => v.vineType === 'swing_liana');
      assert.ok(chains.length >= 4, `${at}: ${chains.length} chains`);
      for (const v of chains) assert.ok(swings.some((s) => Math.min(s.x0, s.x1) <= v.x + 40 && Math.max(s.x0, s.x1) >= v.x - 40), `${at}: the chain at ${v.x} is never swung`);
      assert.ok(!st.platforms.some((p) => p.type === 'fragile'), `${at}: nothing crumbles`);
      const open = st.spawnX + 5 * walkSpeed(MODEL_TYPICAL) - 60;
      for (const e of st.enemies) assert.ok(e.patrolMinX > open, `${at}: a ${e.type} ${e.patrolMinX - st.spawnX} px in`);
      const xs = [st.spawnX, ...(st.checkpoints ?? []).map((c) => c.x).sort((a, b) => a - b), st.exitTotemX];
      for (let k = 1; k < xs.length; k++) assert.ok(xs[k] - xs[k - 1] <= FLAG_SPAN.max, `${at}: ${xs[k] - xs[k - 1]} px with no flag`);
      const kinds = new Set((st.gen2.falls ?? []).map((f) => f.kind));
      if (difficulty === 'easy') assert.deepEqual([...kinds], ['soft'], `${at}: a deadly fall on Easy`);
      else assert.ok(kinds.has('void'), `${at}: no lava on Normal`);
      for (const s of st.gen2.sections) if (s.template.startsWith('w9s-')) seen.add(s.template);
    }
  }
  // (every section is laid somewhere in the 40 rolls)
  for (const s of W9_SWING_SECTIONS) assert.ok(seen.has(s.id), `${s.id} never laid`);
});
