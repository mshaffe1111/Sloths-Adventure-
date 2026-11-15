// petals held and the door (goals.ts withGoals: Normal 0.875 of what the stage holds) per castBots layout, as the game builds them
const root = process.argv[2];
await import(`${root}/src/game/headlessDom.ts`);
const { generateStage, setLayoutVariant } = await import(`${root}/src/game/stageGenerator.ts`);
const { generateAllLevels } = await import(`${root}/src/game/worldsData.ts`);
const { withGoals } = await import(`${root}/src/game/goals.ts`);
const { isPetal } = await import(`${root}/src/game/petals.ts`);
for (const id of ['1-6', '1-7']) {
  const rows: string[] = [];
  let sum = 0, n = 0;
  for (let v = 1; v <= 10; v++) {
    setLayoutVariant(v);
    const st: any = withGoals(generateStage({ ...generateAllLevels().find((l: any) => l.id === id)!, unlocked: true }, 'normal'));
    setLayoutVariant(null);
    const held = st.collectibles.filter((c: any) => isPetal(c, st)).length;
    rows.push(`${v}:${held}/${st.config.targetCount}`);
    sum += held; n++;
  }
  console.log(`${id} normal layouts 1-10 petals held/door: ${rows.join(' ')} (mean held ${(sum / n).toFixed(1)})`);
}
