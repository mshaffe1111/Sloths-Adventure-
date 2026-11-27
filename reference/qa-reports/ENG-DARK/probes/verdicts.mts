// the dark verdicts on the 3-1 draft's rolls (ENG-DARK-h): GEN2_DRAFT=3-1 npx tsx <this> <from> <to>: every darkLandings / darkGaps /
// darkFlags line, and per roll the lights laid awake (the cave mouth) and asleep
import path from 'node:path';
const root = process.cwd();
await import(path.join(root, 'src/game/headlessDom.ts'));
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts'));
readyDraft('3-1');
const { darkLandings, darkGaps, darkFlags } = await import(path.join(root, 'src/game/gen2/dark.ts'));
const { generateStage, setLayoutVariant } = await import(path.join(root, 'src/game/stageGenerator.ts'));
const { generateAllLevels } = await import(path.join(root, 'src/game/worldsData.ts'));
const [a, b] = process.argv.slice(2).map(Number);
const tot = { land: 0, gaps: 0, flags: 0, awake: 0, asleep: 0 }, rolls = { land: 0, gaps: 0, flags: 0 };
for (let seed = a; seed <= b; seed++) for (const d of ['normal', 'easy'] as const) {
  setLayoutVariant(seed);
  let st: any;
  try { st = generateStage({ ...generateAllLevels().find((c: any) => c.id === '3-1' && !c.secret)!, unlocked: true }, d); } finally { setLayoutVariant(null); }
  const L = darkLandings(st, d), g = darkGaps(st), fl = darkFlags(st);
  for (const x of L) console.log(seed, d, 'LAND', x.slice(0, 330));
  for (const x of g) console.log(seed, d, 'GAPS', x.slice(0, 200));
  for (const x of fl) console.log(seed, d, 'FLAG', x.slice(0, 200));
  for (const z of st.zones ?? []) if (z.kind === 'dark') for (const l of z.lights ?? []) if (l.id !== undefined) l.sleep ? tot.asleep++ : tot.awake++;
  tot.land += L.length; tot.gaps += g.length; tot.flags += fl.length;
  if (L.length) rolls.land++; if (g.length) rolls.gaps++; if (fl.length) rolls.flags++;
}
console.log('lines', JSON.stringify(tot), 'rolls named', JSON.stringify(rolls), 'of', (b - a + 1) * 2);
