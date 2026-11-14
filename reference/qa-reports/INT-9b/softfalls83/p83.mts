// usage: npx tsx p83.ts <repo root>; prints 8-3 Normal layout <v> (default 2) platforms + heartFalls as JSON lines
const root = process.argv[2];
await import(root + '/src/game/headlessDom.ts');
const { generateStage, setLayoutVariant } = await import(root + '/src/game/stageGenerator.ts');
const { generateAllLevels } = await import(root + '/src/game/worldsData.ts');
const cfg = { ...generateAllLevels().find((l: { id: string }) => l.id === '8-3')!, unlocked: true };
setLayoutVariant(Number(process.argv[3] || 2));
const st = generateStage(cfg, 'normal') as { platforms: Record<string, unknown>[]; heartFalls?: unknown[]; gen2?: { falls?: unknown } };
setLayoutVariant(null);
for (const p of st.platforms) console.log(JSON.stringify(p));
console.log('HF ' + JSON.stringify(st.heartFalls ?? null));
console.log('FALLS ' + JSON.stringify(st.gen2?.falls ?? null));
