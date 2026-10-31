/**
 * Worlds 8-10's safe start (WIP-6): the first SAFE_START px from the spawn of every running stage are plain ground, with no pit, zone,
 * river or animal (an animal's patch or a flier's sky included), so a new player who just runs right keeps his lives. Before the fix 210
 * of 324 builds had something there, and running right from the start of 8-2, 9-3 and 10-1 lost a life in the first 5 seconds every time.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from './worldsData.ts';
import { generateStage, setLayoutVariant, SAFE_START } from './stageGenerator.ts';
import type { GeneratedStage } from './stageGenerator.ts';

/** what stands in the first SAFE_START px of a stage (empty: safe) */
function inTheStart(st: GeneratedStage & { zones?: Array<{ x0: number; kind: string }>; rivers?: Array<{ x0: number }>; spawnY?: number }): string[] {
  const sx = st.spawnX, to = sx + SAFE_START, out: string[] = [];
  for (const z of st.zones ?? []) if (z.x0 < to) out.push(`zone ${z.kind}@${Math.round(z.x0)}`);
  for (const r of st.rivers ?? []) if (r.x0 < to) out.push(`river@${Math.round(r.x0)}`);
  for (const e of st.enemies) if (Math.min(e.x, e.patrolMinX ?? e.x) < to) out.push(`${e.type}@${Math.round(e.x)}`);
  // the ground runs unbroken from the spawn to the end of the safe start
  const y = st.spawnY ?? 0;
  let x = sx;
  for (const p of st.platforms.filter((q) => q.type !== 'fragile' && q.type !== 'bouncy' && q.y >= y - 400 && q.y <= y + 60).sort((a, b) => a.x - b.x)) {
    if (p.x > x + 1) break;
    x = Math.max(x, p.x + p.width);
  }
  if (x < to) out.push(`the ground ends at ${Math.round(x)}`);
  return out;
}

test('Worlds 8-10: nothing that hurts in the first 1,300 px of a running stage, on every layout and both difficulties', () => {
  const stages = generateAllLevels().filter((l) => l.worldIndex >= 8 && !l.secret && l.objectiveType !== 'boss_lair' && l.objectiveType !== 'ascent');
  assert.ok(stages.length >= 20);
  const bad: string[] = [];
  for (const cfg of stages) {
    for (const seed of [null, 1, 2]) {
      for (const diff of ['normal', 'easy'] as const) {
        setLayoutVariant(seed);
        const st = generateStage({ ...cfg, unlocked: true }, diff);
        setLayoutVariant(null);
        const what = inTheStart(st as never);
        if (what.length) bad.push(`${cfg.id} layout ${seed ?? 'designed'} ${diff}: ${what.join(', ')}`);
      }
    }
  }
  assert.deepEqual(bad, []);
});
