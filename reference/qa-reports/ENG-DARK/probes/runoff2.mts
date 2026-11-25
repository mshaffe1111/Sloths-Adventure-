// ENG-DARK box 14: per roll, the lights the run-off rule lays awake (awakeLights minus the cave mouth's), and the verdicts: darkLandings/
// darkGaps/darkFlags; then the same roll with those lights asleep again: the running step offs darkLandings names.
// GEN2_DRAFT=3-1 npx tsx <this> <from> <to>
import path from 'node:path';
const root = process.cwd();
await import(path.join(root, 'src/game/headlessDom.ts'));
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts'));
readyDraft('3-1');
const { awakeLights, darkFlags, darkGaps, darkLandings, darkRims, entryPieces } = await import(path.join(root, 'src/game/gen2/dark.ts'));
const { generateStage, setLayoutVariant } = await import(path.join(root, 'src/game/stageGenerator.ts'));
const { generateAllLevels } = await import(path.join(root, 'src/game/worldsData.ts'));
const [a, b] = process.argv.slice(2).map(Number);
let bad = 0, runLit = 0, total = 0, darks = 0, fullyLit = 0;
for (let seed = a; seed <= b; seed++) for (const d of ['normal', 'easy'] as const) {
  setLayoutVariant(seed);
  let st: any;
  try { st = generateStage({ ...generateAllLevels().find((c: any) => c.id === '3-1' && !c.secret)!, unlocked: true }, d); } finally { setLayoutVariant(null); }
  const v = [...darkLandings(st, d), ...darkGaps(st), ...darkFlags(st)];
  if (v.length) { bad++; for (const x of v) console.log(seed, d, 'VERDICT', x.slice(0, 220)); }
  const runL = new Set<any>();
  for (const z of st.zones ?? []) {
    if (z.kind !== 'dark' || !z.lights?.length) continue;
    total += z.lights.length; darks++; if (!z.lights.some((l: any) => l.sleep)) { fullyLit++; console.log(seed, d, 'FULLY LIT dark', z.x0, z.top); }
    const mouth = entryPieces(st.platforms, z);
    const m = new Set(darkRims({ platforms: st.platforms, zones: [z] }).filter((r: any) => r.light && mouth.has(r.piece)).map((r: any) => r.light));
    for (const l of awakeLights(st.platforms, z)) if (!m.has(l)) runL.add(l);
  }
  runLit += runL.size;
  const zones = (st.zones ?? []).map((z: any) => (z.kind !== 'dark' || !z.lights ? z : { ...z, lights: z.lights.map((l: any) => (runL.has(l) ? { ...l, sleep: true } : l)) }));
  const red = darkLandings({ ...st, zones }, d).filter((x: string) => x.includes('running'));
  console.log(seed, d, 'runWoken', runL.size, 'redWithout', red.length, red[0]?.slice(0, 260) ?? '');
}
console.log('rolls with a verdict', bad, 'run-woken lights', runLit, 'of', total, 'darks', darks, 'fully lit', fullyLit);
