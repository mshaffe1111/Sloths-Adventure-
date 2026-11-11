// writes the first-run layout for a seed: its proven plan replayed (as Play does), both settings' locks hashed as seedlist --check does
import '../../../src/game/headlessDom.ts';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { buildGen2Stage } from '../../../src/game/gen2/pipeline.ts';
import { w1World } from '../../../src/game/gen2/worlds/w1.ts';
import { provenPlan, stageParts } from '../../../src/game/gen2/seedList.ts';
const seed = Number(process.argv[2]);
const cfg = generateAllLevels().find((l) => l.id === '1-1')!;
const r = provenPlan('1-1', seed)!;
if (!r) throw new Error('not listed');
const L: any = { stageId: '1-1', seed, plan: r.plan, rerolls: r.rerolls ?? 0, foes: r.foes ?? [], lock: {} };
for (const difficulty of ['normal', 'easy'] as const) {
  const st = buildGen2Stage({ config: cfg, kit: w1World(), seed, difficulty, replay: { seed, plan: L.plan, rerolls: L.rerolls, foes: L.foes } });
  if (st.gen2.errors?.length) throw new Error(`${difficulty}: ${st.gen2.errors[0]}`);
  L.lock[difficulty] = createHash('sha256').update(JSON.stringify(stageParts(st))).digest('hex').slice(0, 16);
}
const file = new URL('../../../src/game/gen2/firstRun11.ts', import.meta.url).pathname;
const t = fs.readFileSync(file, 'utf8');
fs.writeFileSync(file, t.slice(0, t.indexOf('export const FIRST_RUN_11')) + `export const FIRST_RUN_11: FirstRunLayout = ${JSON.stringify(L)};\n`);
console.log(JSON.stringify(L.lock), L.plan.length, L.rerolls, JSON.stringify(L.foes).slice(0, 100));
