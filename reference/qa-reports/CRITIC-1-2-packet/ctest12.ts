/**
 * ctest12.ts (the Critic): does the testers' control course move? It builds on stage 1-2's id (stageGenerator.ts CTEST_STAGE_ID), so any
 * rule keyed on '1-2' can move it, and lockall has no row for it. 8 seeds x 2 settings = 16 builds, each hashed (platforms, pickups,
 * foes, flags). Nothing in the game imports it.
 *   npx tsx reference/qa-reports/CRITIC-1-2-packet/ctest12.ts --record <file.json>   on the BASE, before the change
 *   npx tsx reference/qa-reports/CRITIC-1-2-packet/ctest12.ts --check <file.json>    on the head: prints "N of 16 builds differ", exit 1 if N > 0
 *   npx tsx reference/qa-reports/CRITIC-1-2-packet/ctest12.ts --widen                the attempt-2 finding: what adding '1-2' to EARLY_DOUBLE does (6 of 16)
 * To run it on another branch: git checkout origin/t-critic-1-2-packet -- reference/qa-reports/CRITIC-1-2-packet/ctest12.ts
 */
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import '../../../src/game/headlessDom.ts';
import { buildProtoStage } from '../../../src/game/protoStage.ts';
import { EARLY_DOUBLE } from '../../../src/game/levelCheck.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';

const cfg = generateAllLevels().find((c) => c.id === '1-2')!;
const sig = (st: { platforms: unknown; collectibles: unknown; enemies: unknown; checkpoints?: unknown }) => createHash('sha1').update(JSON.stringify([st.platforms, st.collectibles, st.enemies, st.checkpoints])).digest('hex').slice(0, 12);
const run = (): Record<string, string> => Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8].flatMap((seed) => [false, true].map((easy) => {
  let h: string;
  try { h = sig(buildProtoStage(cfg, seed, 'ctest', easy)); } catch (e) { h = 'THROWS ' + String(e).slice(0, 60); }
  return [`seed ${seed} ${easy ? 'easy' : 'normal'}`, h] as const;
})));
const diff = (a: Record<string, string>, b: Record<string, string>) => Object.keys(a).filter((k) => a[k] !== b[k]);
const arg = (k: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const rec = arg('--record'), chk = arg('--check');
if (rec) { fs.writeFileSync(rec, JSON.stringify(run(), null, 1)); console.log(`recorded 16 control-course builds to ${rec}`); }
else if (chk) {
  const base = JSON.parse(fs.readFileSync(chk, 'utf8')) as Record<string, string>;
  const d = diff(base, run());
  console.log(`control course: ${d.length} of ${Object.keys(base).length} builds differ from ${chk}${d.length ? ': ' + d.join(', ') : ''}`);
  process.exit(d.length ? 1 : 0);
} else if (process.argv.includes('--widen')) {
  const a = run();
  (EARLY_DOUBLE as Set<string>).add('1-2');
  const d = diff(a, run());
  console.log(`ctest course, 8 seeds x 2 settings, with EARLY_DOUBLE + 1-2: ${d.length} of 16 differ${d.length ? ' (' + d.join(', ') + ')' : ''}`);
} else for (const [k, v] of Object.entries(run())) console.log(k, v);
