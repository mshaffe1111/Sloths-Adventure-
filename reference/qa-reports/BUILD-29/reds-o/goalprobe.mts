// lists, per hand-built stage of Worlds 1-4, the goal-band row groundwork.test.ts:71 checks (run from a tree's src/game)
const root = process.argv[2];
const g = await import(root + '/src/game/goals.ts');
const p = await import(root + '/src/game/protoStage.ts');
const w = await import(root + '/src/game/w2Stages.ts');
const d = await import(root + '/src/game/worldsData.ts');
for (const c of d.generateAllLevels().filter((c: any) => c.worldIndex <= 4 && c.objectiveType !== 'boss_lair')) {
  const hand = p.HAND_STAGES[c.id] ? p.buildProtoStage(c, 1, p.HAND_STAGES[c.id]) : w.W2_STAGES[c.id] ? w.buildW2Stage(c, 1, w.W2_STAGES[c.id]) : null;
  if (!hand) continue;
  const st = g.withGoals(hand);
  const n = g.goalCounts(st);
  const t = c.objectiveType;
  const have = t === 'harvest' ? n.petals : t === 'rescue' ? n.rescuable : t === 'purge' || t === 'gauntlet' ? n.animals : 0;
  console.log(c.id, t, `goal ${st.config.targetCount} of ${have}`, have ? 'CHECKED' : 'skipped (have 0)', JSON.stringify(n));
}
