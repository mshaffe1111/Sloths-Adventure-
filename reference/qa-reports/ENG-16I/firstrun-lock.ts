// ENG-16I (R-165.246): 1-1's fixed first run (gen2/firstRun11.ts) built on both settings exactly as `seedlist 1-1 --check` builds it
// (firstRunBreaches: buildGen2Stage with its replay; seedList.ts stageParts, hashed), with each part's own hash, so two heads can be
// diffed part by part. Run from the root of the tree under test (it imports that tree's engine):
//   npx tsx reference/qa-reports/ENG-16I/firstrun-lock.ts [out.json]
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import '../../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { buildGen2Stage } from '../../../src/game/gen2/pipeline.ts';
import { listedStage } from '../../../src/game/gen2/listed.ts';
import { stageParts } from '../../../src/game/gen2/seedList.ts';
import { FIRST_RUN_11 as L } from '../../../src/game/gen2/firstRun11.ts';

const h = (s: string, n = 16) => createHash('sha256').update(s).digest('hex').slice(0, n);
const cfg = generateAllLevels().find((l) => l.id === '1-1')!;
const row = listedStage('1-1')!;
const out: Record<string, { whole: string; recorded: string; parts: Record<string, string>; collectibles?: unknown }> = {};
for (const difficulty of ['normal', 'easy'] as const) {
  const st = buildGen2Stage({ config: cfg, kit: row.kit(), seed: L.seed, difficulty, replay: { seed: L.seed, plan: L.plan, rerolls: L.rerolls, foes: L.foes } });
  const parts = stageParts(st);
  out[difficulty] = { whole: h(JSON.stringify(parts)), recorded: L.lock[difficulty], parts: Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, h(v, 12)])) };
  const pk = (st as unknown as { collectibles?: Array<{ x: number; y: number }> }).collectibles ?? [];
  out[difficulty].collectibles = pk;
  console.log(`${difficulty}: builds ${out[difficulty].whole}, recorded ${L.lock[difficulty]} ${out[difficulty].whole === L.lock[difficulty] ? 'SAME' : 'DRIFT'}; collectibles ${pk.length}`);
}
if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
