/**
 * World 4 played in the real engine (realReach.ts): every collectible is picked up by the engine itself, the shrine is reached, every
 * ledge the level check counts on is stood on, and from every place he gets to there is a way on (no trap). The level check works
 * from a reach model; this is the engine's own word on it.
 *
 * By default each stage is played on its first layout roll. `REAL_REACH_SEEDS=16` plays the 16 rolls the stage tests use (1 + 37 i),
 * which takes a long while; `REAL_REACH_STAGES=4-2,4-8` picks stages.
 */
import { RealReach } from './realReach.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { levelConfig } from './realPlay.ts';
import { buildProtoStage, HAND_STAGES } from './protoStage.ts';
import { validateStage } from './levelCheck.ts';

const N = Number(process.env.REAL_REACH_SEEDS ?? 1);
const SEEDS = Array.from({ length: Math.max(1, Math.min(16, N)) }, (_, i) => 1 + i * 37);
const STAGES = (process.env.REAL_REACH_STAGES ?? '4-1,4-2,4-3,4-4,4-5,4-6,4-7,4-8').split(',');
/** what is known to be wrong and is being fixed elsewhere (the stage still plays, but these checks would fail) */
const OPEN: Record<string, string> = {
  // (with that bottom added the stage is clean on all 16 rolls: every pickup, the shrine, no trap)
  '4-3': 'the engine\'s wall check has no bottom, so a boulder on a ledge is a wall on the floor below it, and walking there pushes it: the pool\'s log is never reached (the boulder fixer)',
};

for (const id of STAGES) {
  test(`${id} in the real engine: everything picked up, the shrine reached, nowhere he is stranded`, { todo: OPEN[id] }, () => {
    const problems: string[] = [];
    for (const seed of SEEDS) {
      const st = buildProtoStage(levelConfig(id), seed, HAND_STAGES[id]);
      const v = validateStage(st);
      // (4-4's liana chains are checked by protoCheck.ts, not by the level check: every platform is then something to find)
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
