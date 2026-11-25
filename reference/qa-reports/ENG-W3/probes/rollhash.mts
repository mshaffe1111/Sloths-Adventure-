// probe (ENG-DOWNBOT): one line per drafted 3-1 roll, a hash of its wood and vines (to count the rolls a lay change touches).
// TREE=<worktree> [N=24] GEN2_DRAFT=3-1 npx tsx <this>
import { createHash } from 'node:crypto';
const T = process.env.TREE!;
await import(`${T}/src/game/headlessDom.ts`);
const { readyDraft } = await import(`${T}/tools/engine/draft.ts`);
const { generateAllLevels } = await import(`${T}/src/game/worldsData.ts`);
const { buildGen2Stage } = await import(`${T}/src/game/gen2/pipeline.ts`);
const { LISTED } = await import(`${T}/src/game/gen2/listed.ts`);
readyDraft('3-1');
const cfg = generateAllLevels().find((c: any) => c.id === '3-1' && !c.secret)!;
for (const d of ['normal', 'easy']) for (let seed = 1; seed <= Number(process.env.N ?? 24); seed++) {
  const st: any = buildGen2Stage({ config: cfg, kit: LISTED['3-1'].kit(), seed, difficulty: d });
  const key = JSON.stringify([st.platforms.map((p: any) => [p.type, p.x, p.y, p.width]), st.vines.map((v: any) => [v.x, v.topY, v.bottomY])]);
  console.log(`${d} ${seed} ${createHash('sha1').update(key).digest('hex').slice(0, 10)} errors=${(st.gen2.errors ?? []).length}`);
}
