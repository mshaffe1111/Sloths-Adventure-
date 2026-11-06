// stage.ts --roll is fail-closed (the red team's RT-ENGINE #1: its child processes graded the mixer's 1-1): a child given the pick builds
// the picked roll and says so; one run without the pick builds 1-1's Play (gen2 from the proven list, not the roll's seed) and no roll, which stage.ts reads as a FAIL.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { roll11Seed } from './testlink1_1.ts';

const dump = (env: Record<string, string>) => {
  const d = spawnSync('npx', ['tsx', 'tools/engine/runs/dump.ts', process.cwd(), 'probe', '1-1', '1'], { encoding: 'utf8', maxBuffer: 1 << 28, env: { ...process.env, ...env } });
  return JSON.parse(d.stdout) as Array<{ setting: string; roll: string | null; gen2Seed: number | null }>;
};

test('the dump child builds the picked roll and reports its seed; without the pick (planted) it reports no roll and another seed, a FAIL for stage.ts', () => {
  const picked = dump({ STAGE_ROLL: 'B' });
  assert.equal(picked.length, 2);
  for (const r of picked) assert.deepEqual([r.roll, r.gen2Seed], ['B', roll11Seed('B')], r.setting);
  const unpicked = dump({ STAGE_ROLL: '' });
  for (const r of unpicked) { assert.equal(r.roll, null, r.setting); assert.notEqual(r.gen2Seed, roll11Seed('B'), `${r.setting}: not the roll's seed`); }
});

test('an unknown roll is refused, never a silent fallback to the mixer', async () => {
  const { applyRollEnv } = await import('./testlink1_1.ts');
  await assert.rejects(applyRollEnv({ STAGE_ROLL: 'D' }), /A, B or C/);
  assert.equal(await applyRollEnv({}), null);
});
