// npx tsx tagat.mts <setting> <seed> x,y [x,y...]  -> the tag of the piece under each point (run in the tree's cwd)
import path from 'node:path';
const root = process.cwd();
await import(path.join(root, 'src/game/headlessDom.ts'));
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts'));
readyDraft('3-1');
const { generateAllLevels } = await import(path.join(root, 'src/game/worldsData.ts'));
const { generateStage, setLayoutVariant } = await import(path.join(root, 'src/game/stageGenerator.ts'));
const [setting, seed, ...pts] = process.argv.slice(2);
setLayoutVariant(Number(seed));
const st = generateStage({ ...generateAllLevels().find((c: any) => c.id === '3-1' && !c.secret)!, unlocked: true }, setting);
setLayoutVariant(null);

const turns = st.gen2.tower.turns as Array<{ x: number; from: number; to: number }>;
const secs = st.gen2.sections as Array<{ uid: string; template: string }>;
console.log('PLAN', secs.map((q) => q.template.replace('w3-', '')).join(' '), 'TURNS', turns.map((t) => t.to).join(' '));
for (const q of pts) {
  const [x, y] = q.split(',').map(Number);
  const floor = turns.filter((t) => t.to <= y + 6).length;
  const under = st.platforms.filter((p: any) => x >= p.x - 2 && x <= p.x + p.width + 2 && Math.abs(p.y - y) <= 6);
  console.log('AT', setting, seed, q, 'floor', floor, under.map((p: any) => `${Math.round(p.x)}-${Math.round(p.x + p.width)} w${Math.round(p.width)} ${p.style ?? ''}`).join(' | ') || 'NONE');
  const tr = (st.vines ?? []).filter((t: any) => Math.abs(t.x - x) < 120 && t.topY - 40 < y && t.bottomY + 40 > y);
  console.log('   near', tr.map((t: any) => JSON.stringify(Object.fromEntries(Object.entries(t).filter(([k, v]) => typeof v !== 'object').map(([k, v]) => [k, typeof v === 'number' ? Math.round(v) : v])))).join(' ').slice(0, 400));
  const below = st.platforms.filter((p: any) => p.y > y - 120 && p.y < y + 320 && p.x < x + 300 && p.x + p.width > x - 300).map((p: any) => `#${p.id} ${Math.round(p.x)}-${Math.round(p.x + p.width)} y${Math.round(p.y)} h${p.height} ${p.style ?? ''}`);
  console.log('   below', below.join(', '));
}
