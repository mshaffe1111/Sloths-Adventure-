// VARIETY-2 item 3 (R-165.198/.200): a fall asked of the node V19 makes climb is refused at graph time, by V19's name, before anything is
// laid; never laid against V19, never laid against the ask. On an up stage (1-1's brief: trend up) the node after a descent in the last
// third is mustRise (rolledGraph): the lay draws only sections that climb for it and V19 judges it ends above where the descent began.
// Planted: red before the refusal (the stage was built, the node marked rising over its ask, the ask named only after the lay).
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage } from './pipeline.ts';
import { w1World } from './worlds/w1.ts';
import { generateAllLevels } from '../worldsData.ts';

const W1 = w1World();
const cfg = generateAllLevels().find((l) => l.id === '1-1')!;
const kitOf = (code: string) => ({ ...W1, manifest: { ...W1.manifest, graphs: { ...W1.manifest.graphs!, list: [{ id: 'mix', archetype: 'sprint' as const, code }] } } });
const build = (code: string, seed: number) => buildGen2Stage({ config: cfg, kit: kitOf(code), seed, difficulty: 'normal' });

test("a '_' asked of the node after a late descent on 1-1 (V19's mustRise) is refused at graph time by V19's name, on every seed", () => {
  // (the combine after the late descent; and the signature after it, the node V19 makes climb whatever its job)
  for (const [code, job] of [['A P M R X R W R D_ C_ R S E', 'combine'], ['A P M R X R D_ S_ R E', 'signature']] as const) {
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      assert.throws(() => build(code, seed), (e: Error) => {
        assert.match(e.message, /^gen2 1-1: graph mix "/, `${code} seed ${seed}: ${e.message}`);
        assert.match(e.message, new RegExp(`node n\\d+ \\(${job}\\) asks shape _ \\(falling\\), but V19 makes it climb`), `${code} seed ${seed}: ${e.message}`);
        return true;
      }, `${code} seed ${seed}: built against V19 or against the ask`);
    }
  }
});

test("a '_' V19 does not overrule is never refused at graph time: the lay lays it or names the miss", () => {
  // (the descent in the middle third marks no node mustRise: the combine's fall is the lay's to keep or name; and with no descent at all)
  for (const code of ['A P M R X R D_ C_ R S E', 'A P M R X_ R W R S E']) {
    for (const seed of [1, 2, 3]) {
      const st = build(code, seed);
      assert.ok(!st.gen2.graph.nodes.some((n) => n.mustRise && n.asked?.shape === '_'), `${code} seed ${seed}: a '_' node is mustRise`);
      // (laid, or its miss named after the lay by nodeAsks.ts: never dropped)
      for (const n of st.gen2.graph.nodes.filter((q) => q.asked?.shape === '_')) {
        const secs = st.gen2.sections.filter((q) => q.node === n.id);
        assert.ok(secs.length, `${code} seed ${seed}: node ${n.id} laid no section`);
      }
    }
  }
});
