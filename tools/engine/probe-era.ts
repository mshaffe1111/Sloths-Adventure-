// R-164.11 probe: what changes between rolls of a mixed stage, on era's own measure (eraRoll.measureRoll's action profile)
import '../../src/game/headlessDom.ts';
import { measureRoll } from '../inspect/eraRoll.ts';
import { rollVariants } from '../inspect/era.ts';
import { cosine } from '../inspect/analyze.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
const levels = new Map(generateAllLevels().map((c) => [c.id, c]));
for (const id of (process.argv[2] ?? '1-1,1-5').split(',')) {
  const vs = rollVariants(6);
  const rs = vs.map((v) => measureRoll(levels.get(id)!, v));
  const profs = rs.map((r) => new Map(r.prof));
  let d = 0, n = 0; for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) { d += 1 - cosine(profs[i], profs[j]); n++; }
  console.log(`${id}: diversity ${(d / n).toFixed(4)} over ${rs.length} rolls`);
  for (const r of rs) {
    const mix = Object.entries((r as any).mix ?? {}).map(([k, v]) => `${k}${v}`).join(' ');
    const top = [...r.prof].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([g, w]) => `${g}:${(w as number).toFixed(1)}`).join(' ');
    console.log(`  v${String(r.variant ?? '').padEnd(7)} mix ${mix.padEnd(40)} top 3-grams ${top}`);
  }
}
