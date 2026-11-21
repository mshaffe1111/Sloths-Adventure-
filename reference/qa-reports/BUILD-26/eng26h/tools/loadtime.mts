// Load time of a listed stage as the game builds it (stageGenerator.ts: playFinish(listed, buildPlayStage(listed seed)), both settings,
// every listed seed. usage: npx tsx loadtime.ts <worktree> <stage> [reps]
const [root, id, repsS] = process.argv.slice(2);
const reps = Number(repsS ?? 1);
await import(`${root}/src/game/headlessDom.ts`);
const { generateAllLevels } = await import(`${root}/src/game/worldsData.ts`);
const SL = await import(`${root}/src/game/gen2/seedList.ts`);
const { playFinish } = await import(`${root}/src/game/gen2/listed.ts`);
const { listedRoll } = await import(`${root}/src/game/stageGenerator.ts`);
const cfg = generateAllLevels().find((l: any) => l.id === id)!;
if (!(await SL.loadSeedList(id))) throw new Error('list did not load');
const listed = listedRoll(cfg)!;
const seeds: number[] = [...SL.provenSeeds(id)];
const kit = listed.kit();
// warm
playFinish(listed, SL.buildPlayStage({ ...cfg, unlocked: true }, kit, seeds[0], 'normal'), 'normal');
const rows: string[] = [];
for (const d of ['normal', 'easy'] as const) {
  const ms: number[] = []; let fell = 0;
  for (const seed of seeds) {
    let best = Infinity;
    for (let r = 0; r < reps; r++) {
      const t0 = performance.now();
      const st: any = playFinish(listed, SL.buildPlayStage({ ...cfg, unlocked: true }, kit, seed, d), d);
      const t = performance.now() - t0; if (t < best) best = t;
      if (r === 0 && st.gen2?.proven) { fell++; rows.push(`${d} seed ${seed}: FELL to the search (used ${st.gen2.proven.used}, tried ${st.gen2.proven.tried})`); }
    }
    ms.push(best); rows.push(`${d} seed ${seed} ${best.toFixed(1)}`);
  }
  const s = [...ms].sort((a, b) => a - b), q = (p: number) => s[Math.min(s.length - 1, Math.ceil(p * s.length) - 1)];
  console.log(`${id} ${d}: n ${s.length}, p50 ${q(0.5).toFixed(1)} ms, p95 ${q(0.95).toFixed(1)} ms, max ${s[s.length - 1].toFixed(1)} ms, fell to search ${fell}`);
}
import('node:fs').then((fs) => fs.writeFileSync(`${process.env.OUT ?? '/dev/null'}`, rows.join('\n') + '\n'));
