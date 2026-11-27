// probe (ENG-DOWNBOT): the raw draft roll's errors by name. TREE= [SET=easy] [SEEDS=5,6,7] GEN2_DRAFT=3-1 npx tsx <this> (normal)
const T = process.env.TREE!;
await import(`${T}/src/game/headlessDom.ts`);
const { readyDraft } = await import(`${T}/tools/engine/draft.ts`);
const { generateAllLevels } = await import(`${T}/src/game/worldsData.ts`);
const { buildGen2Stage } = await import(`${T}/src/game/gen2/pipeline.ts`);
const { LISTED } = await import(`${T}/src/game/gen2/listed.ts`);
readyDraft('3-1');
const cfg = generateAllLevels().find((c: any) => c.id === '3-1' && !c.secret)!;
for (const seed of (process.env.SEEDS ?? "1,2,3").split(",").map(Number)) {
  const st: any = buildGen2Stage({ config: cfg, kit: LISTED['3-1'].kit(), seed, difficulty: (process.env.SET ?? 'normal') as any });
  const e = st.gen2.errors ?? [];
  console.log(seed, e.length, e.slice(0, 3).map((x: string) => x.slice(0, 220)).join(' || '));
}
