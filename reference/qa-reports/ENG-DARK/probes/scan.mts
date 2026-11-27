// every roll 1-40 both settings: the [RCH] lines of the final lay (stderr captured per roll)
import path from 'node:path';
const root = process.cwd();
await import(path.join(root, 'src/game/headlessDom.ts'));
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts')); readyDraft('3-1');
const { generateAllLevels } = await import(path.join(root, 'src/game/worldsData.ts'));
const { generateStage, setLayoutVariant } = await import(path.join(root, 'src/game/stageGenerator.ts'));
const cfg = generateAllLevels().find((c: any) => c.id === '3-1' && !c.secret)!;
const orig = console.error; let buf: string[] = [];
console.error = (...a: any[]) => { buf.push(a.join(' ')); };
for (const setting of (process.env.SETS ?? 'normal,easy').split(',')) for (let s = 1; s <= 40; s++) {
  buf = []; setLayoutVariant(s); generateStage({ ...cfg, unlocked: true }, setting); setLayoutVariant(null);
  const seen = new Set<string>();
  for (const l of buf) if (l.startsWith('[RCH]') && !seen.has(l)) { seen.add(l); console.log(setting[0].toUpperCase(), s, l.slice(6)); }
}
