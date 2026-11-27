// md5 of each 3-1 lay (rolls 1-40, both settings) from the tree in cwd; prints "setting seed hash"
import path from 'node:path'; import crypto from 'node:crypto';
const root = process.cwd();
await import(path.join(root, 'src/game/headlessDom.ts'));
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts')); readyDraft('3-1');
const { generateAllLevels } = await import(path.join(root, 'src/game/worldsData.ts'));
const { generateStage, setLayoutVariant } = await import(path.join(root, 'src/game/stageGenerator.ts'));
const cfg = generateAllLevels().find((c: any) => c.id === '3-1' && !c.secret)!;
for (const setting of ['normal', 'easy']) for (let s = 1; s <= 40; s++) {
  setLayoutVariant(s); const st = generateStage({ ...cfg, unlocked: true }, setting); setLayoutVariant(null);
  const h = crypto.createHash('md5').update(JSON.stringify([st.platforms.map((p: any) => [Math.round(p.x), Math.round(p.y), Math.round(p.width), Math.round(p.height), p.type]), (st.vines ?? []).map((v: any) => [Math.round(v.x), Math.round(v.topY), Math.round(v.bottomY)])])).digest('hex').slice(0, 8);
  console.log(setting, s, h);
}
