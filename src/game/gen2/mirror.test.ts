// No-mirror (the lead 12:57 PM, 11-06): a section is laid mirrored only when mirroring keeps what it is. Mirrored, a rising exit is a
// drop and a falling one a climb (FR9 step 2: an up stair laid backwards was a drop run), a climb's vine and bank face the wrong way, and a
// block's rise is a drop (11-06). So a section with a non-level exit (its laid exit more than 25 px off its entry, the clamp's tolerance:
// w1.test.ts), any climb, or any block is never mirrored, on every roll; it is gated on the 300 proven seeds (seedlist --check).
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage, layLocal, planBudget, rngFor } from './pipeline.ts';
import { w1World } from './worlds/w1.ts';
import { generateAllLevels } from '../worldsData.ts';

const c = generateAllLevels().find((l) => l.id === '1-1')!;
const kit = w1World();

test('gen2 1-1: no section with a non-level exit, a climb or a block is laid mirrored (24 seeds, both settings)', () => {
  const M = kit.manifest;
  const budget = planBudget(c, M, 'normal');
  const byId = new Map(M.sections.map((t) => [t.id, t]));
  const exitOf = new Map<string, number>();
  const exit = (id: string) => {
    if (!exitOf.has(id)) {
      const ys = [0, 1, 2].map((k) => { const L = layLocal(byId.get(id)!, budget, rngFor(7, k), false, { pitDepth: M.pitDepth }); return L.exit.y; }).sort((a, b) => a - b);
      exitOf.set(id, ys[1]);
    }
    return exitOf.get(id)!;
  };
  const bad: string[] = [];
  let mirrored = 0;
  for (let seed = 1; seed <= 24; seed++) for (const difficulty of ['normal', 'easy'] as const) {
    const g = buildGen2Stage({ config: c, kit, seed, difficulty });
    for (const s of g.gen2.sections) {
      if (!s.mirrored) continue;
      mirrored++;
      const t = byId.get(s.template);
      if (!t) continue;
      const why = [
        ...(Math.abs(exit(t.id)) > 25 ? [`exit ${Math.round(exit(t.id))} px`] : []),
        ...(t.content === 'climb' || [...t.pieces, ...(t.subBlocks ?? []).flatMap((b) => b.versions.flatMap((v) => v.pieces))].some((p) => p.shape === 'vine') ? ['a climb'] : []),
        ...([...t.pieces, ...(t.subBlocks ?? []).flatMap((b) => b.versions.flatMap((v) => v.pieces))].some((p) => !!p.block) ? ['a block'] : []),
      ];
      if (why.length) bad.push(`seed ${seed} ${difficulty}: ${t.id} laid mirrored (${why.join(', ')})`);
    }
  }
  assert.ok(mirrored > 0, 'no section was mirrored at all: the test would not see the rule');
  assert.deepEqual([...new Set(bad)].slice(0, 12), []);
});
