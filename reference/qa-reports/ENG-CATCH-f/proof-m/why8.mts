const ROOT = process.env.ROOT!;
await import(ROOT + '/src/game/headlessDom.ts');
const { generateAllLevels } = await import(ROOT + '/src/game/worldsData.ts');
const { generateStage, setLayoutVariant } = await import(ROOT + '/src/game/stageGenerator.ts');
const { easyStage } = await import(ROOT + '/src/game/easyMode.ts');
const { withGoals } = await import(ROOT + '/src/game/goals.ts');
const T = await import(ROOT + '/src/game/gen2/tower.ts');
const c = generateAllLevels().find((c: any) => c.id === '1-4');
for (const [setting, v, y] of [['easy', 6, 3662], ['easy', 9, 3325], ['normal', 6, 3662], ['normal', 6, 5345], ['easy', 5, 8275]] as const) {
  setLayoutVariant(v);
  const st: any = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal'));
  setLayoutVariant(null);
  const row = (st.platforms as any[]).filter((p) => p.y === y && p.type === 'solid').sort((a, b) => a.x - b.x).map((p) => `${p.id}:${p.x}-${p.x + p.width}/${p.style}${p.creak ? '/creak' : ''}${p.tag ? '/' + p.tag : ''}`);
  console.log(setting, v, y, row.join(' '), '| trimSeams(last call):', JSON.stringify(T.trimSeams), '| refused:', T.overlapRefused.length);
}
