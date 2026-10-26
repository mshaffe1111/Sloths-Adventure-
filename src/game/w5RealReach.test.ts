/**
 * World 5 played in the real engine (realReach.ts), as World 4 is (w4RealReach.test.ts): every collectible is picked up by the engine
 * itself, the shrine is reached, every ledge the level check counts on is stood on, and from every place he gets to there is a way on
 * (no trap). The silk, the chairs' tug, the cakes and the spiders all run as they do in play (the harness keeps him from being hurt).
 *
 * By default each stage is played on its first layout roll. `REAL_REACH_SEEDS=16` plays the 16 rolls the stage tests use (1 + 37 i),
 * which takes a long while; `REAL_REACH_STAGES=5-2` picks stages.
 */
import { RealReach } from './realReach.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { levelConfig } from './realPlay.ts';
import { buildProtoStage, HAND_STAGES } from './protoStage.ts';
import { validateStage } from './levelCheck.ts';

const N = Number(process.env.REAL_REACH_SEEDS ?? 1);
const SEEDS = Array.from({ length: Math.max(1, Math.min(16, N)) }, (_, i) => 1 + i * 37);
const STAGES = (process.env.REAL_REACH_STAGES ?? '5-1,5-2,5-3,5-4,5-5').split(',').filter((s) => s.startsWith('5-'));

for (const id of STAGES) {
  test(`${id} in the real engine: everything picked up, the shrine reached, nowhere he is stranded`, () => {
    const problems: string[] = [];
    for (const seed of SEEDS) {
      const st = buildProtoStage(levelConfig(id), seed, HAND_STAGES[id]);
      const v = validateStage(st);
      const claimed = new Set(v.ok ? v.reachableIds : st.platforms.map((p) => p.id));
      const rr = new RealReach(id, seed, { claimed });
      const r = rr.search();
      if (!r.exitReached) problems.push(`seed ${seed}: the shrine is never reached`);
      for (const c of r.missed) problems.push(`seed ${seed}: ${c.type} #${c.id} at (${Math.round(c.x)}, ${Math.round(c.y)}) is never picked up`);
      for (const a of r.traps) problems.push(`seed ${seed}: stranded at ${a.key}${a.kind === 'p' ? ` (x ${Math.round(a.a!)}..${Math.round(a.b!)}, y ${a.y})` : ''}`);
      if (v.ok) {
        const lost = [...claimed].filter((pid) => !r.platforms.has(pid) && !rr.buried(pid));
        for (const pid of lost) {
          const p = st.platforms.find((q) => q.id === pid)!;
          problems.push(`seed ${seed}: the level check reaches platform ${pid} (x ${Math.round(p.x)}..${Math.round(p.x + p.width)}, y ${p.y}), the engine never does`);
        }
      }
    }
    assert.deepEqual(problems, []);
  });
}
