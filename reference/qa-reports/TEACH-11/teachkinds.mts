// TEACH-11: the hint lines laid as teach lines on a tree, per stage (lockall's builds: layouts 1-4, both settings), for a base/head diff.
//   cd <tree> && npx tsx <this file> <tree> 1-1,5-9,...   prints "stage | line" for each teach-marked hint text
const T = process.argv[2];
const ids = process.argv[3].split(',');
await import(T + '/src/game/headlessDom.ts');
const { generateAllLevels } = await import(T + '/src/game/worldsData.ts');
const { generateStage, setLayoutVariant } = await import(T + '/src/game/stageGenerator.ts');
const { setDifficulty } = await import(T + '/src/game/difficulty.ts');
const out = new Set<string>();
for (const c of generateAllLevels().filter((l: { id: string }) => ids.includes(l.id))) {
  for (const d of ['normal', 'easy'] as const) for (let v = 1; v <= 4; v++) {
    setDifficulty(d);
    setLayoutVariant(v);
    try {
      const st = generateStage(c);
      for (const h of st.proto?.hints ?? []) if (h.teach) out.add(`${c.id} | ${h.text}`);
    } catch { /* a stage that does not build is lockall's */ }
  }
}
setLayoutVariant(null);
setDifficulty('normal');
for (const l of [...out].sort()) console.log(l);
