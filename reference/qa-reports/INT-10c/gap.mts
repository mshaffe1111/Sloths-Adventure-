const R = process.argv[2];
await import(R + '/src/game/headlessDom.ts');
const { generateAllLevels } = await import(R + '/src/game/worldsData.ts');
const { generateStage, setLayoutVariant } = await import(R + '/src/game/stageGenerator.ts');
const { withGoals } = await import(R + '/src/game/goals.ts');
const { isPetal } = await import(R + '/src/game/petals.ts');
for (const a of process.argv.slice(3)) {
  const [id, x0s, x1s] = a.split(':'); const x0 = +x0s, x1 = +x1s;
  const l = generateAllLevels().find((q: any) => q.id === id)!;
  setLayoutVariant(1);
  const st: any = withGoals(generateStage({ ...l, unlocked: true }, 'normal'));
  setLayoutVariant(null);
  const ps = st.collectibles.filter((c: any) => isPetal(c, st) && c.x > x0 && c.x < x1);
  const secs = (st.gen2?.sections ?? []).filter((s: any) => s.x1 > x0 && s.x0 < x1).map((s: any) => s.template).join(',');
  console.log(id, 'petals in gap', ps.length, JSON.stringify(ps.map((c: any) => [Math.round(c.x), Math.round(c.y)])).slice(0, 300), secs);
}
