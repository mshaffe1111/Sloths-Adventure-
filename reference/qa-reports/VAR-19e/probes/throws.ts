// VAR-19e probe: raw rolls of a listed stage (buildGen2Stage with the row's kit, no list), seeds a..b, both settings: which throw, and why.
// usage: npx tsx throws.ts <stage> <from> <to>
import '../../../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
import { listedStage } from '../../../../src/game/gen2/listed.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
const [id, a, b] = [process.argv[2], Number(process.argv[3]), Number(process.argv[4])];
const cfg = generateAllLevels().find((c) => c.id === id && !c.secret)!;
const row = listedStage(id)!;
let n = 0;
for (let seed = a; seed <= b; seed++) for (const d of ['normal', 'easy'] as const) {
  try { buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty: d }); } catch (err) { n++; console.log(`seed ${seed} ${d}: ${String((err as Error).message).slice(0, 300)}`); }
}
console.log(`${n} throws in seeds ${a}-${b} x 2`);
