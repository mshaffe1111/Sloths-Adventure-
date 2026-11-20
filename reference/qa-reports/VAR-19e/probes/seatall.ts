// R-165.327 probe (VAR-19e): seatBreaches (listRules.ts) on every listed seed of every listed stage, as Play builds and finishes it, both
// settings. usage: npx tsx seatall.ts [stage ...]  (none: every stage with a list)
import '../../../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
import { listedStage, playFinish } from '../../../../src/game/gen2/listed.ts';
import { loadSeedList, provenSeeds, buildPlayStage } from '../../../../src/game/gen2/seedList.ts';
import { PROVEN_INDEX } from '../../../../src/game/gen2/provenIndex.ts';
import { seatBreaches } from '../../../../tools/engine/listRules.ts';
const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(PROVEN_INDEX);
for (const id of ids) {
  const row = listedStage(id); if (!row) { console.log(`${id}: no row`); continue; }
  const cfg = generateAllLevels().find((c) => c.id === id && !c.secret)!;
  await loadSeedList(id);
  let n = 0; const lines: string[] = [];
  provenSeeds(id).forEach((seed, i) => { for (const d of ['normal', 'easy'] as const) {
    const st: any = playFinish(row, structuredClone(buildPlayStage(cfg, row.kit(), seed, d)), d);
    for (const l of seatBreaches(st, row.kit(), d)) { n++; lines.push(`  L${i + 1} seed ${seed}: ${l}`); }
  } });
  console.log(`${id}: ${provenSeeds(id).length} seeds, ${n} breaches`); for (const l of lines) console.log(l);
}
