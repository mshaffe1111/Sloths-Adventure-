// usage: npx tsx why.ts <worktree> <stage> <seed> <difficulty>: a seed's own build's errors (no replay), and its first towers
const [root, id, seedS, d] = process.argv.slice(2);
await import(`${root}/src/game/headlessDom.ts`);
const { generateAllLevels } = await import(`${root}/src/game/worldsData.ts`);
const { buildGen2Stage } = await import(`${root}/src/game/gen2/pipeline.ts`);
const { listedStage } = await import(`${root}/src/game/gen2/listed.ts`);
const cfg = generateAllLevels().find((l: any) => l.id === id)!;
const t0 = performance.now();
const st: any = buildGen2Stage({ config: { ...cfg, unlocked: true }, kit: listedStage(id)!.kit(), seed: Number(seedS), difficulty: d });
console.log(`build ${(performance.now() - t0).toFixed(0)} ms; size ${st.config.levelWidth}x${st.config.levelHeight}; errors:`, JSON.stringify(st.gen2.errors ?? []).slice(0, 1500));
