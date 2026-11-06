// A section's stage tags are read (the red team, 11-05): `feel`, the stages a section may be laid in (unset: any stage of its world), and
// `not`, what it must never serve, against the stage's own (manifest.owns). The pool is cut to them before anything is chosen, so no slot,
// loosened or not, can lay another stage's section. Planted: a toy section tagged for 5-9 only is never laid in 5-7; one whose `not`
// names what 5-7 owns is never laid there; and World 1's 1-2 pool holds only sections that name 1-2.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage, stagePool } from './pipeline.ts';
import { cfg, kit, manifest } from './toyWorld.ts';
import { w1World } from './worlds/w1.ts';
import type { SectionTemplate, WorldKit, WorldManifest } from './types.ts';

const base = manifest.sections.find((t) => t.id === 'toy-stumps')!;
const tagged = (id: string, more: Partial<SectionTemplate>): SectionTemplate => ({ ...base, id, weight: 50, phases: ['sho', 'ten', 'ketsu', 'ki', 'rest'], ...more });

test("a section tagged for another stage, or one whose `not` names this stage's own, is never laid", () => {
  const k: WorldKit = { ...kit, manifest: { ...manifest, owns: { '5-7': ['punch'] }, sections: [...manifest.sections, tagged('toy-for-59', { feel: ['5-9'] }), tagged('toy-no-punch', { not: ['punch'] }), tagged('toy-for-57', { feel: ['5-7'] })] } as WorldManifest };
  let mine = 0;
  for (const seed of Array.from({ length: 8 }, (_, i) => 5 + i * 31)) {
    const ids = buildGen2Stage({ config: cfg('5-7', 'stealth'), kit: k, seed, difficulty: 'normal' }).gen2.plan.map((p) => p.template);
    assert.ok(!ids.includes('toy-for-59'), `seed ${seed}: 5-9's section laid in 5-7`);
    assert.ok(!ids.includes('toy-no-punch'), `seed ${seed}: a section that must not serve punch laid in 5-7, which owns it`);
    mine += ids.filter((x) => x === 'toy-for-57').length;
  }
  assert.ok(mine > 0, "5-7's own tagged section was never laid: the test would not see the rule");
});

test("World 1's pool for 1-2 holds only sections that name 1-2; 1-1's holds only those that name 1-1", () => {
  const M = w1World().manifest;
  for (const id of ['1-1', '1-2']) {
    const pool = stagePool(M, id);
    assert.ok(pool.length > 0, `${id}: an empty pool`);
    for (const t of pool) assert.ok(!t.feel || t.feel.includes(id), `${id}: ${t.id} (feel ${t.feel}) is in its pool`);
    assert.ok(pool.length < M.sections.length || M.sections.every((t) => !t.feel || t.feel.includes(id)), `${id}: nothing was cut`);
  }
});
