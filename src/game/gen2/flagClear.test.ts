// R-165.156 (D12 11-12: 72 of 205 flags on 1-2 and 47 of 196 on shipped 1-1 stood on a mushroom or a root): the rolled-flag pass took the
// furthest spot on a wide bank, often the floor mushroom at a chain's lip or a stone on the bank. A flag's spot is a run of its bank clear
// of everything standing on it (pipeline.ts flagRuns, FLAG_FOOT: the painted flag and Pokey's body where he respawns), and the flag
// verdict names a flag that stands in one (rolledFlagBreaches). Planted: a bank with a mushroom on it; then every rolled stage, both
// settings, 8 seeds: no flag stands in a piece, and Matt's flag rule (a flag before every hard node, no span over its cap) still holds.
// The section pass (flagSpot and the span split: 1-2, 1-3, Worlds 5-8) is R-165.156's next packet: moving its flags re-lays curated seeds.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage, FLAG_FOOT, flagRuns, HARD_JOBS, lethalSpans, rolledFlagBreaches, standsOnFlag } from './pipeline.ts';
import { JOB_OF } from './nodeCode.ts';
import { generateAllLevels } from '../worldsData.ts';
import { STAGE_TABLE } from './worlds/stageTable.ts';
import { listedStage } from './listed.ts';
import type { Platform } from '../types.ts';

const plat = (id: number, x: number, y: number, width: number, height: number, type: Platform['type'] = 'solid'): Platform => ({ id, x, y, width, height, type });

test('a flag spot is a run of its bank clear of what stands on it (planted: a floor mushroom and a stone on one bank)', () => {
  const bank = plat(1, 1000, 900, 1200, 200);
  const cap = plat(2, 1500, 870, 70, 30, 'bouncy'); // a floor mushroom: its foot on the bank's top
  const stone = plat(3, 1900, 846, 146, 56); // a stone sunk 2 px into the bank
  const bough = plat(4, 1450, 600, 300, 40); // a bough high over the bank stands on nothing
  const all = [bank, cap, stone, bough];
  assert.ok(FLAG_FOOT.left >= 10 && FLAG_FOOT.right >= 50, `the footprint ${JSON.stringify(FLAG_FOOT)} covers the post and Pokey's body`);
  const runs = flagRuns(all, bank, 1080, 2120);
  assert.deepEqual(runs, [[1080, 1500 - FLAG_FOOT.right], [1570 + FLAG_FOOT.left, 1900 - FLAG_FOOT.right], [2046 + FLAG_FOOT.left, 2120]]);
  for (const [a, b] of runs) for (const x of [a, (a + b) / 2, b]) assert.equal(standsOnFlag(all, bank, x), undefined, `x ${x} is clear`);
  assert.equal(standsOnFlag(all, bank, 1520), cap, 'on the mushroom');
  assert.equal(standsOnFlag(all, bank, 1500 - FLAG_FOOT.right + 1), cap, 'its pennant over the mushroom');
  assert.equal(standsOnFlag(all, bank, 1950), stone, 'in the stone');
  // (the verdict names it, on a stage that carries its pieces; a stage without them is judged as before)
  const st = { spawnX: 140, exitTotemX: 3000, checkpoints: [{ x: 1520, y: 900 }, { x: 2100, y: 900 }], platforms: all };
  assert.match(rolledFlagBreaches(st).join(';'), /the flag at x 1520 stands in a bouncy piece at x 1500-1570/);
  assert.equal(rolledFlagBreaches(st).filter((b) => /stands in/.test(b)).length, 1, 'the flag at 2100 is clear');
  assert.equal(rolledFlagBreaches({ ...st, platforms: undefined }).filter((b) => /stands in/.test(b)).length, 0);
});

/** the flags of a built stage that stand in a piece on their ground, by name */
const standing = (tag: string, st: { checkpoints?: Array<{ x: number; y: number }>; platforms: Platform[] }): string[] =>
  (st.checkpoints ?? []).flatMap((c) => {
    const ground = st.platforms.find((p) => p.y === c.y && p.x <= c.x && p.x + p.width >= c.x);
    if (!ground) return [`${tag}: the flag at x ${c.x} has no ground`];
    const q = standsOnFlag(st.platforms, ground, c.x);
    return q ? [`${tag}: the flag at x ${c.x} stands in a ${q.type} ${q.style ?? ''} at x ${q.x}`] : [];
  });

test('every rolled stage: no flag stands in a mushroom, root or stone, and the flag rule holds (8 seeds, both settings)', () => {
  const levels = generateAllLevels();
  const bad: string[] = [];
  let flags = 0, builds = 0, judged = 0;
  for (const id of Object.keys(STAGE_TABLE)) {
    const row = listedStage(id)!;
    const config = levels.find((l) => l.id === id)!;
    if (!row.kit().manifest.graphs?.briefs?.[id]) continue; // (the section pass, 1-2, 1-3, Worlds 5-8: R-165.156's own packet, with curation)
    for (let seed = 1; seed <= 8; seed++) for (const difficulty of ['normal', 'easy'] as const) {
      let st: ReturnType<typeof buildGen2Stage>;
      try { st = buildGen2Stage({ config, kit: row.kit(), seed, difficulty }); } catch { continue; } // (a seed that lays no stage: the list walks past it)
      builds++;
      if (st.gen2.errors?.some((e) => e.startsWith('flags:'))) continue; // a roll its flags cannot fit fails by name, never ships
      judged++;
      flags += (st.checkpoints ?? []).length;
      bad.push(...standing(`${id} seed ${seed} ${difficulty}`, st));
      const hard = (st.gen2.nodes ?? []).filter((q) => HARD_JOBS.has(JOB_OF[q.token[0] as keyof typeof JOB_OF] ?? '')).map((q, i) => ({ id: `${q.token} #${i + 1}`, x0: q.x0 }));
      for (const b of rolledFlagBreaches(st, hard, lethalSpans(st, st.gen2.falls ?? []))) bad.push(`${id} seed ${seed} ${difficulty}: ${b}`);
    }
  }
  // (a roll whose flags cannot fit fails by name and is rolled again: most must still lay them, or the rule is failing rolls, not placing)
  assert.ok(judged >= 0.8 * builds && flags >= 100, `${judged} of ${builds} builds laid their flags (${flags} flags)`);
  assert.deepEqual(bad.slice(0, 12), [], `${bad.length} misses`);
});
