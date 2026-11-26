// npx tsx slot.mts <setting> <seed> x0,x1,y ... : slotUnder over the stage's wood (this tree's tower.ts), and the wood in the box
import path from 'node:path';
const root = process.cwd();
await import(path.join(root, 'src/game/headlessDom.ts'));
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts')); readyDraft('3-1');
const { generateAllLevels } = await import(path.join(root, 'src/game/worldsData.ts'));
const { generateStage, setLayoutVariant } = await import(path.join(root, 'src/game/stageGenerator.ts'));
const tw = await import(path.join(root, 'src/game/gen2/tower.ts'));
const [setting, seed, ...qs] = process.argv.slice(2);
setLayoutVariant(Number(seed));
const st = generateStage({ ...generateAllLevels().find((c: any) => c.id === '3-1' && !c.secret)!, unlocked: true }, setting);
setLayoutVariant(null);
for (const q of qs) {
  const [x0, x1, y] = q.split(',').map(Number);
  console.log('Q', q, 'slot', JSON.stringify(tw.slotUnder ? tw.slotUnder(st.platforms, x0, x1, y) : 'n/a'));
  console.log('  box', st.platforms.filter((p: any) => p.y > y - 60 && p.y < y + 330 && p.x < x1 + 120 && p.x + p.width > x0 - 120).map((p: any) => `#${p.id} ${Math.round(p.x)}-${Math.round(p.x + p.width)} y${Math.round(p.y)} ${p.type}${p.broken ? ' B' : ''} ${p.style ?? ''}`).join(', '));
}
