// The move ladder, measured: every stage of every world as the engine builds it (tools/validate/mechanics.ts's MECHS, the R-150.4 count),
// on a few layouts, in play order: where each mechanic first shows, and every stage it shows in after. The engine's ladder reads this.
//   npx tsx tools/engine/moveladder.ts [--layouts 4]   (writes tools/engine/moveladder.json)
import fs from 'node:fs';
import '../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { MECHS } from '../validate/mechanics.ts';
import { sim } from '../validate/play.ts';
const L = Number(process.argv[process.argv.indexOf('--layouts') + 1] || 4) || 4;
const stages = generateAllLevels().filter((c) => !c.secret).map((c) => c.id);
const at: Record<string, string[]> = {};
const fail: string[] = [];
for (const id of stages) {
  const seen = new Set<string>();
  for (let v = 1; v <= L; v++) {
    let s; try { s = sim(id, v, 'normal'); } catch (e) { fail.push(`${id}: ${String((e as Error).message).slice(0, 80)}`); break; }
    for (const m of MECHS) if (m.count(s.stage as any, s.e as any) > 0) seen.add(m.id);
  }
  for (const m of seen) (at[m] ??= []).push(id);
  process.stderr.write(`${id} `);
}
const rows = MECHS.map((m) => ({ id: m.id, label: m.label, first: at[m.id]?.[0] ?? null, stages: at[m.id] ?? [] })).filter((r) => r.first);
fs.writeFileSync(new URL('./moveladder.json', import.meta.url), JSON.stringify({ layouts: L, stages: stages.length, rows, fail }, null, 1) + '\n');
console.log(`\nmove ladder: ${stages.length} stages, ${L} layouts each; ${rows.length} mechanics in use; ${fail.length} stages could not build`);
for (const r of rows) console.log(`  ${r.label.padEnd(28)} first ${String(r.first).padEnd(6)} in ${r.stages.length} stages`);
for (const f of fail) console.log('  FAILED ' + f);
