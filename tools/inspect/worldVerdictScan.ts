// Which rolls a world's own verdicts newly refuse (R-165.537): each seed of a stage built twice through the real pipeline, once with its
// manifest's verdicts and once with them taken off; a roll clean without and refused with is named, by seed and setting, with its lines.
// Usage: npx tsx tools/inspect/worldVerdictScan.ts <stage> [seeds, default 1-60]   (a draft stage is readied as the tools ready it)
import '../../src/game/headlessDom.ts';
import { readyDraft } from '../engine/draft.ts';
import { draftListed, listedStage } from '../../src/game/gen2/listed.ts';
import { buildGen2Stage } from '../../src/game/gen2/pipeline.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import type { WorldKit } from '../../src/game/gen2/types.ts';

const [id = '3-1', span = '1-60'] = process.argv.slice(2);
const [a, b] = span.split('-').map(Number);
const row = listedStage(id) ?? (readyDraft(id), draftListed(id));
if (!row) throw new Error(`no row for ${id}`);
const cfg = { ...generateAllLevels().find((c) => c.id === id && !c.secret)!, unlocked: true };
const kit = row.kit();
const bare: WorldKit = { ...kit, manifest: { ...kit.manifest, verdicts: undefined } };
console.log(`${id}: its manifest's verdicts [${(kit.manifest.verdicts ?? []).join(', ')}], seeds ${a}-${b ?? a}`);
let refused = 0, clean = 0, both = 0;
for (let seed = a; seed <= (b ?? a); seed++) for (const difficulty of ['normal', 'easy'] as const) {
  const was = buildGen2Stage({ config: cfg, kit: bare, seed, difficulty }).gen2.errors;
  const now = buildGen2Stage({ config: cfg, kit, seed, difficulty }).gen2.errors;
  if (was.length) { both++; continue; }
  if (!now.length) { clean++; continue; }
  refused++;
  console.log(`NEWLY REFUSED ${id} seed ${seed} ${difficulty}: ${now.join(' | ')}`);
}
console.log(`counts: ${clean} clean both ways, ${refused} newly refused, ${both} refused already (by the roll's other checks)`);
