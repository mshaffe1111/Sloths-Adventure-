// darkLandings on the 3-1 draft's rolls (ENG-DARK-f): GEN2_DRAFT=3-1 npx tsx <this> <from> <to>
import path from 'node:path';
const root = process.cwd();
await import(path.join(root, 'src/game/headlessDom.ts'));
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts'));
readyDraft('3-1');
const { darkLandings, darkStop } = await import(path.join(root, 'src/game/gen2/dark.ts'));
const { generateStage, setLayoutVariant } = await import(path.join(root, 'src/game/stageGenerator.ts'));
const { generateAllLevels } = await import(path.join(root, 'src/game/worldsData.ts'));
const [a, b] = process.argv.slice(2).map(Number);
console.log('stop normal', darkStop('normal').toFixed(1), 'easy', darkStop('easy').toFixed(1));
let n = 0;
for (let seed = a; seed <= b; seed++) for (const d of ['normal', 'easy'] as const) {
  setLayoutVariant(seed);
  let st;
  try { st = generateStage({ ...generateAllLevels().find((c: any) => c.id === '3-1' && !c.secret)!, unlocked: true }, d); } finally { setLayoutVariant(null); }
  const f = darkLandings(st, d);
  if (f.length) { n++; for (const x of f) console.log(seed, d, x); }
}
console.log('rolls failing', n);
