// AUDIT-B (2026-11-11, ENGINE-AUDIT-B.md B-02). FAILING ON PURPOSE.
// gen2 1-1 cannot lay a stage that keeps its own rules: of fresh seeds, about 1 in 60 is clean on both settings (and the proven list's
// 200 seeds span 769..61616: about 1 in 300 once the quiet line and the squirrels are held too). The list is made by throwing the rest
// away (tools/engine/seedlist.ts tries `want * 200` seeds). The floor here, 1 in 5, is far under what "beatable by construction"
// (pipeline.ts header) promises and still fails. The refusals by name: probes/yield.ts.
// Run: npx tsx --test src/game/gen2/audit-b/w1-yield.test.ts   (about 15 s)
import test from 'node:test';
import assert from 'node:assert/strict';
import '../../headlessDom.ts';
import { buildGen2Stage } from '../pipeline.ts';
import { w1World } from '../worlds/w1.ts';
import { cfg11 } from './relay.ts';

test('B-02: at least 1 fresh 1-1 seed in 5 lays cleanly on both settings (seeds 50001-50060)', () => {
  const why = new Map<string, number>();
  let clean = 0;
  for (let seed = 50001; seed <= 50060; seed++) {
    const errs = buildGen2Stage({ config: cfg11(), kit: w1World(), seed, difficulty: 'easy' }).gen2.errors ?? [];
    if (!errs.length) { clean++; continue; }
    const k = /^V19b/.test(errs[0]) ? 'V19b: the end is not above the bough window' : /^pool short/.test(errs[0]) ? 'pool short: no section left for a node' : /^verdict (\S+)/.exec(errs[0])?.[0] ?? errs[0].slice(0, 40);
    why.set(k, (why.get(k) ?? 0) + 1);
  }
  assert.ok(clean >= 12, `${clean} of 60 fresh seeds are clean; refused first by: ${[...why].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${n}x ${k}`).join('; ')}`);
});
