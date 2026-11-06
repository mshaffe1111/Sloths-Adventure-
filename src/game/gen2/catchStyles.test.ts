// The catch boughs' looks (the porter's ask for the designer's Round 11, 11-06: among thin landings, branch at most 30% a roll; one 1-1
// build had 21 branch of 48, most of them the catches the pipeline lays under its ledge gaps): floorRoll.catchStyles cycles their style in
// the order laid; absent, every catch is a branch, as before.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage } from './pipeline.ts';
import { w1World } from './worlds/w1.ts';
import { generateAllLevels } from '../worldsData.ts';
import type { WorldKit } from './types.ts';

const c = generateAllLevels().find((l) => l.id === '1-1')!;
const catchesOf = (kit: WorldKit, seed: number) =>
  buildGen2Stage({ config: c, kit, seed, difficulty: 'normal' }).platforms.filter((p) => (p as { catch?: boolean }).catch).sort((a, b) => a.x - b.x).map((p) => p.style);

test("floorRoll.catchStyles ['log', 'branch'] alternates the catches; absent, every catch is a branch (planted: all branch)", () => {
  const base = w1World();
  const FR = base.manifest.floorRoll!;
  const plain: WorldKit = { ...base, manifest: { ...base.manifest, floorRoll: { ...FR, catchStyles: undefined } } };
  const alt: WorldKit = { ...base, manifest: { ...base.manifest, floorRoll: { ...FR, catchStyles: ['log', 'branch'] } } };
  let seen = 0;
  for (const seed of [2, 3, 4, 5]) {
    const a = catchesOf(plain, seed);
    assert.ok(a.every((s) => s === 'branch'), `seed ${seed}: ${a.join(',')}`);
    const b = catchesOf(alt, seed);
    seen += b.length;
    if (b.length >= 2) assert.ok(b.includes('log') && b.includes('branch'), `seed ${seed}: ${b.join(',')}`);
  }
  assert.ok(seen >= 4, `${seen} catches laid: the test would not see the rule`);
});
