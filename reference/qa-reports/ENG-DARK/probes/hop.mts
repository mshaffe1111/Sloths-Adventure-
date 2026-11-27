// a hop rim's step-off light (ENG-DARK-k): GEN2_DRAFT=3-1 npx tsx <this> <seed> <normal|easy> <rimX> <rimY>: the rim, its landing,
// the lights near its step-off landing and near the rims of the piece it lands on
import path from 'node:path';
const root = process.cwd();
await import(path.join(root, 'src/game/headlessDom.ts'));
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts'));
readyDraft('3-1');
const { darkRims } = await import(path.join(root, 'src/game/gen2/dark.ts'));
const { generateStage, setLayoutVariant } = await import(path.join(root, 'src/game/stageGenerator.ts'));
const { generateAllLevels } = await import(path.join(root, 'src/game/worldsData.ts'));
const [seed, d, rx, ry] = [Number(process.argv[2]), process.argv[3] as 'normal' | 'easy', Number(process.argv[4]), Number(process.argv[5])];
setLayoutVariant(seed);
let st: any;
try { st = generateStage({ ...generateAllLevels().find((c: any) => c.id === '3-1' && !c.secret)!, unlocked: true }, d); } finally { setLayoutVariant(null); }
for (const r of darkRims(st)) if (Math.abs(r.x - rx) < 3 && Math.abs(r.y - ry) < 3) console.log('rim', r.x, r.y, 'dir', r.dir, 'drop', r.drop, 'land', JSON.stringify(r.land), 'light', JSON.stringify(r.light));
for (const z of st.zones ?? []) if (z.kind === 'dark') for (const l of z.lights ?? []) if (Math.abs(l.x - rx) < 320 && Math.abs(l.y - ry) < 320) console.log('light', JSON.stringify(l));
