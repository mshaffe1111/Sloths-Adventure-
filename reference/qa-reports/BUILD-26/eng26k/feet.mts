// Each shut gate on a built roll and the first wood within 450 px under it (ENG-26k: a copy of eng26j/gates.mts head that needs no walkOff,
// so it runs on trees before 8e21145f1). usage: npx tsx eng26k/feet.mts <tree> <stage> <seed,...> [normal,easy] (copy it into <tree> first)
const [tree, id, seedsS, dS] = process.argv.slice(2);
await import(`${tree}/src/game/headlessDom.ts`);
const { generateAllLevels } = await import(`${tree}/src/game/worldsData.ts`);
const { buildGen2Stage } = await import(`${tree}/src/game/gen2/pipeline.ts`);
const { listedStage } = await import(`${tree}/src/game/gen2/listed.ts`);
const T = await import(`${tree}/src/game/gen2/tower.ts`);
const cfg = generateAllLevels().find((l: any) => l.id === id)!;
for (const seed of seedsS.split(',').map(Number)) for (const d of (dS ?? 'normal,easy').split(',')) {
  const t0 = Date.now();
  const st: any = buildGen2Stage({ config: { ...cfg, unlocked: true }, kit: listedStage(id)!.kit(), seed, difficulty: d });
  const P = st.platforms;
  const gates = (st.gen2.tower?.sealed ?? []).map((g: number) => P.find((p: any) => p.id === g));
  console.log(`${id} seed ${seed} ${d}: errors ${(st.gen2.errors ?? []).length} gates ${gates.length}`);
  for (const g of gates) {
    const under = P.filter((p: any) => p !== g && p.y > g.y && p.y <= g.y + 450 && p.x < g.x + g.width + 200 && p.x + p.width > g.x - 200).sort((a: any, b: any) => a.y - b.y).slice(0, 3);
    console.log(`  gate ${g.x}-${g.x + g.width}@${g.y}: under ${under.map((p: any) => `${p.x}-${p.x + p.width}@${p.y}`).join(' ')}`);
  }
}
