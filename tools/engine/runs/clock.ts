// RUNS #48 #75 #77 #91: cp3-lengths.ts's quick clock (stageTime.ts modelAll(...).fast, MODEL_FAST) on 16 layouts (cp3-lengths uses 4),
// for any tree and any worlds, then each pair of neighbouring stages' difference on the median, (longer - shorter) / shorter.
//   npx tsx tools/engine/runs/clock.ts <tree root> <worlds e.g. 1-4>
const [root, wr] = process.argv.slice(2);
await import(root + '/src/game/headlessDom.ts');
const { generateAllLevels } = await import(root + '/src/game/worldsData.ts');
const { generateStage, setLayoutVariant } = await import(root + '/src/game/stageGenerator.ts');
const { easyStage } = await import(root + '/src/game/easyMode.ts');
const { withGoals } = await import(root + '/src/game/goals.ts');
const { modelAll } = await import(root + '/src/game/stageTime.ts');
const [w0, w1] = wr.split('-').map(Number);
const levels = generateAllLevels().filter((l: any) => !l.secret && +l.id.split('-')[0] >= w0 && +l.id.split('-')[0] <= (w1 ?? w0));
for (const setting of ['normal', 'easy'] as const) {
  const med: Array<[string, number, number, number]> = [];
  for (const c of levels) {
    const t: number[] = [];
    for (let v = 1; v <= 16; v++) { setLayoutVariant(v); try { const st = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal')); t.push(Math.round(modelAll(st as any).fast.total)); } catch { /* a build error is left out */ } finally { setLayoutVariant(null); } }
    t.sort((a, b) => a - b); med.push([c.id, t[t.length >> 1], t[0], t[t.length - 1]]);
  }
  console.log(`== ${setting}: quick clock (s), median (min-max) over 16 layouts, and the step to the next stage`);
  for (let i = 0; i < med.length; i++) {
    const [id, m, a, b] = med[i]; const n = med[i + 1];
    const step = n && n[0].split('-')[0] === id.split('-')[0] ? Math.round((Math.max(m, n[1]) / Math.min(m, n[1]) - 1) * 100) : null;
    console.log(`  ${id.padEnd(5)} ${m} (${a}-${b})` + (step !== null ? `   -> ${n[0]}: ${step}%` : ''));
  }
}
