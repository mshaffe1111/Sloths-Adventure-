const R = '/home/user/Sloths-Adventure-/src/game/';
await import(R + 'headlessDom.ts');
const { buildGen2Stage } = await import(R + 'gen2/pipeline.ts');
const { listedStage, worldFinish } = await import(R + 'gen2/listed.ts');
const { loadSeedList, provenSeeds } = await import(R + 'gen2/seedList.ts');
const { generateAllLevels } = await import(R + 'worldsData.ts');
const { goalCounts, withGoals } = await import(R + 'goals.ts');
const cfg = generateAllLevels().find((c: any) => c.id === '2-9' && !c.secret)!;
console.log('type', cfg.objectiveType, 'target', cfg.targetCount, 'countSet', cfg.countSet);
await loadSeedList('2-9');
const L = provenSeeds('2-9');
const row = listedStage('2-9')!;
const tally = new Map<string, number>();
for (const s of L) {
  const st = worldFinish(row)(buildGen2Stage({ config: cfg, kit: row.kit(), seed: s, difficulty: 'normal' }) as never, false, 'normal');
  const g = withGoals(st as never) as any;
  const n = goalCounts(g);
  const k = `goal ${g.config.targetCount} of animals ${n.animals} (easyGoal ${g.easyGoal})`;
  tally.set(k, (tally.get(k) ?? 0) + 1);
}
console.log(L.length, 'seeds', [...tally]);
