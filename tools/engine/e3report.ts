// E3's support check over every stage of every world (src/game/mixer/support.ts on terrain's own footing), layouts 1-2, Normal: per
// world, the pieces that never float with open air under their drawn body, and water pieces off drawn water. Writes
// tools/engine/e3known.json, the known list: a world's count may only shrink (a world clears it when the engine rebuilds it); a stage
// the engine builds from its spec must have none.
//   npx tsx tools/engine/e3report.ts [--check]
import fs from 'node:fs';
import '../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../../src/game/stageGenerator.ts';
import { supportCheck } from '../../src/game/mixer/support.ts';
import { specFor } from '../../src/game/mixer/stages.ts';
const per: Record<string, number> = {};
const byStage: Record<string, number> = {};
const kinds: Record<string, number> = {};
const spec: string[] = [];
const un: Record<string, number> = {};
for (const c of generateAllLevels().filter((l) => !l.secret)) for (const v of [1, 2]) {
  setLayoutVariant(v); const st: any = generateStage({ ...c, unlocked: true }, 'normal'); setLayoutVariant(null);
  const { breaches: b, unjudged: u } = supportCheck(st, c.worldIndex);
  un['W' + c.worldIndex] = (un['W' + c.worldIndex] ?? 0) + u.length;
  per['W' + c.worldIndex] = (per['W' + c.worldIndex] ?? 0) + b.length;
  byStage[c.id] = (byStage[c.id] ?? 0) + b.length;
  for (const x of b) kinds[`W${c.worldIndex} ${x.kind} (${x.drawn})`] = (kinds[`W${c.worldIndex} ${x.kind} (${x.drawn})`] ?? 0) + 1;
  if (specFor(c.id) && b.length) spec.push(`${c.id} layout ${v}: ${b.slice(0, 4).map((x) => `${x.kind} x ${Math.round(x.x)} (${x.drawn}, air ${x.air})`).join('; ')}`);
}
const FILE = new URL('./e3known.json', import.meta.url);
console.log('E3 support breaches, layouts 1-2, per world:', JSON.stringify(per));
console.log('not judged here (own art or set pieces, which draw their own supports), per world:', JSON.stringify(un));
console.log('by kind:'); for (const [k, n] of Object.entries(kinds).sort((a, b) => b[1] - a[1]).slice(0, 25)) console.log(`  ${n}  ${k}`);
if (spec.length) console.log('ENGINE-BUILT STAGES WITH BREACHES:\n  ' + spec.join('\n  '));
if (process.argv.includes('--check')) {
  const was = JSON.parse(fs.readFileSync(FILE, 'utf8')).perWorld as Record<string, number>;
  const grew = Object.keys(per).filter((w) => per[w] > (was[w] ?? 0));
  if (grew.length || spec.length) { console.log(`E3: FAIL (${grew.map((w) => `${w} ${was[w] ?? 0} -> ${per[w]}`).join(', ')}${spec.length ? '; engine-built stages breach' : ''})`); process.exit(1); }
  console.log('E3: PASS (no world grew; no engine-built stage breaches)');
} else fs.writeFileSync(FILE, JSON.stringify({ note: 'counts only shrink: tools/engine/e3report.ts --check', perWorld: per, unjudged: un, byStage }, null, 1) + '\n');
