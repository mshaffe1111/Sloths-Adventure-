// VAR-19d probe: lureLay.ts lureFaults (the engine's own lure rule) on EVERY listed stage's every listed seed, as Play builds it, both
// settings. usage: npx tsx lureall.ts [stageId ...]
import '../../../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
import { listedStage, playFinish } from '../../../../src/game/gen2/listed.ts';
import { PROVEN_INDEX } from '../../../../src/game/gen2/provenIndex.ts';
import { loadSeedList, provenSeeds, buildPlayStage } from '../../../../src/game/gen2/seedList.ts';
import { lureFaults } from '../../../../src/game/gen2/lureLay.ts';
const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(PROVEN_INDEX);
for (const id of ids) {
  const cfg = generateAllLevels().find((c) => c.id === id && !c.secret)!;
  const row = listedStage(id)!;
  await loadSeedList(id);
  let bad = 0, posts = 0, n = 0;
  for (const seed of provenSeeds(id)) for (const d of ['normal', 'easy'] as const) {
    const st: any = playFinish(row, structuredClone(buildPlayStage(cfg, row.kit(), seed, d)), d);
    n++; posts += st.proto?.cast?.lures?.length ?? 0;
    const f = lureFaults({ enemies: st.enemies, platforms: st.platforms, cast: st.proto?.cast }, cfg.worldIndex);
    if (f.length) { bad++; if (bad <= 4) console.log(`  ${id} seed ${seed} ${d}: ${f.join(' | ')}`); }
  }
  console.log(`${id}: ${bad} of ${n} builds faulted; ${posts} lure posts in all`);
}
