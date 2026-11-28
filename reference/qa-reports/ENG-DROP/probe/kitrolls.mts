// 3-1's kit rolls, 4 seeds x both settings, fingerprinted (ENG-DROP box 2): run with the tree's root as argv[2]
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
const root = process.argv[2];
const im = (p: string) => import(resolve(root, p));
await im('src/game/headlessDom.ts');
const { readied, readyDraft } = await im('tools/engine/draft.ts');
const D = '3-1';
if (readied !== D) readyDraft(D);
const { generateAllLevels } = await im('src/game/worldsData.ts');
const { buildGen2Stage } = await im('src/game/gen2/pipeline.ts');
const { LISTED } = await im('src/game/gen2/listed.ts');
const cfg = { ...generateAllLevels().find((c: any) => c.id === D && !c.secret)!, unlocked: true };
for (const difficulty of ['normal', 'easy'] as const) for (let seed = 1; seed <= 4; seed++) {
  const st = buildGen2Stage({ config: cfg, kit: LISTED[D].kit(), seed, difficulty });
  const fp = JSON.stringify({ p: st.platforms, e: st.enemies, s: st.gen2.sections.map((q: any) => [q.template, q.x0, q.x1]), er: st.gen2.errors ?? [], tw: !!st.gen2.tower });
  console.log(`${D} ${difficulty} seed ${seed}: ${createHash('sha256').update(fp).digest('hex').slice(0, 16)} plats ${st.platforms.length} errors ${(st.gen2.errors ?? []).length} sections ${st.gen2.sections.length}`);
}
