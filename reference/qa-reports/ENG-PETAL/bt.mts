const root = process.argv[2];
await import(`${root}/src/game/headlessDom.ts`);
const { generateStage, setLayoutVariant } = await import(`${root}/src/game/stageGenerator.ts`);
const { generateAllLevels } = await import(`${root}/src/game/worldsData.ts`);
const cfg = { ...generateAllLevels().find((l: any) => l.id === '1-1')!, unlocked: true };
const t: number[] = [];
for (let v = 1; v <= 24; v++) { setLayoutVariant(v); const a = performance.now(); generateStage(cfg, 'normal'); t.push(performance.now() - a); setLayoutVariant(null); }
t.sort((a, b) => a - b);
console.log(root.split('/').pop(), '1-1 normal build ms p50', t[12].toFixed(0), 'p95', t[22].toFixed(0));
