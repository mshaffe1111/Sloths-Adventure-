const ROOT = process.env.ROOT!;
await import(ROOT + '/src/game/headlessDom.ts');
const { generateAllLevels } = await import(ROOT + '/src/game/worldsData.ts');
const { generateStage, setLayoutVariant } = await import(ROOT + '/src/game/stageGenerator.ts');
const T = await import(ROOT + '/src/game/gen2/tower.ts');
const c = generateAllLevels().find((c: any) => c.id === '1-4');
for (const [set, lay] of [['easy', 6], ['normal', 6], ['easy', 11], ['normal', 15]] as const) {
  setLayoutVariant(lay);
  const st: any = generateStage({ ...c, unlocked: true }, set);
  console.log(set, lay, 'plats', st.platforms.length, 'trimSeams(last call):', JSON.stringify(T.trimSeams));
}
