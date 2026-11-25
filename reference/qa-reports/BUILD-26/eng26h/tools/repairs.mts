const [root, id, seedsS, d] = process.argv.slice(2);
await import(`${root}/src/game/headlessDom.ts`);
const { generateAllLevels } = await import(`${root}/src/game/worldsData.ts`);
const { buildGen2Stage } = await import(`${root}/src/game/gen2/pipeline.ts`);
const { listedStage } = await import(`${root}/src/game/gen2/listed.ts`);
const cfg = generateAllLevels().find((l: any) => l.id === id)!;
for (const s of seedsS.split(',').map(Number)) {
  const st: any = buildGen2Stage({ config: { ...cfg, unlocked: true }, kit: listedStage(id)!.kit(), seed: s, difficulty: d });
  console.log(`seed ${s}: rerolls ${st.gen2.rerolls}, errors ${st.gen2.errors?.length ?? 0}, repairs ${st.gen2.repairs?.length}`);
  for (const r of st.gen2.repairs ?? []) console.log('   ', r.kind, r.section ?? '', String(r.note).slice(0, 230));
}
