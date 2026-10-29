/**
 * w9Scratch — World 9 while authoring (DESIGN.md B12 step 7): build N rolls of each World 9 gen2 stage, Normal and Easy, and print
 * per stage: throws, levelCheck failures, the inspector's quick time, the longest quiet stretch, the quiet share and the rolls' diversity.
 *   npx tsx tools/gen2/w9Scratch.ts [--stages 9-1,9-4] [--rolls 10]
 */
import '../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { buildGen2Stage, checkStage } from '../../src/game/gen2/pipeline.ts';
import { w9Finish } from '../../src/game/gen2/worlds/w9.ts';
import { W9_GAME_STAGES, w9GameKit } from '../../src/game/gen2/worlds/w9Game.ts';
import { pickRoute } from '../inspect/eraRoll.ts';
import { actionTokens, cosine, deadTime, EASY_GAP, NORMAL_GAP, profile } from '../inspect/analyze.ts';

const arg = (k: string) => {
  const i = process.argv.indexOf(k);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const stages = (arg('--stages')?.split(',') ?? [...W9_GAME_STAGES]) as string[];
const rolls = Number(arg('--rolls') ?? 10);
const LEVELS = generateAllLevels();
for (const id of stages) {
  const config = LEVELS.find((c) => c.id === id)!;
  const profs: Array<ReturnType<typeof profile>> = [];
  const rows: string[] = [];
  const fails = new Map<string, number>();
  for (const difficulty of ['normal', 'easy'] as const) {
    for (let seed = 1; seed <= rolls; seed++) {
      try {
        const st = w9Finish(buildGen2Stage({ config, kit: w9GameKit(config.miniIndex, difficulty), seed, difficulty }));
        const errs = checkStage(st, st.gen2.budget).errors;
        for (const e of errs) fails.set(e.replace(/\d+/g, '#'), (fails.get(e.replace(/\d+/g, '#')) ?? 0) + 1);
        const R = pickRoute(st.config.objectiveType, st as never);
        const { br, samples, route } = R.used;
        const dn = deadTime(br.beats, br.total, difficulty === 'easy' ? EASY_GAP : NORMAL_GAP, samples);
        const longest = Math.max(0, ...dn.list.map((d) => d.counted));
        if (process.argv.includes('--detail') && difficulty === 'normal')
          for (const d of dn.list) {
            const sec = st.gen2.sections.find((q) => d.x0 >= q.x0 - 1 && d.x0 <= q.x1 + 1);
            rows.push(`     quiet ${d.sec.toFixed(1)}s x ${d.x0.toFixed(0)}-${d.x1.toFixed(0)} in ${sec?.template ?? '?'}`);
          }
        if (difficulty === 'normal') profs.push(profile(actionTokens(br.beats, br.total)));
        const zones = (st.zones ?? []).filter((z) => z.kind === 'geyser').length;
        rows.push(`${difficulty[0]}${seed}: ${errs.length ? 'FAIL' : 'ok'} quick ${R.quick.time.toFixed(0)}s quiet ${longest.toFixed(1)}s ${((dn.total / br.total) * 100).toFixed(0)}% route ${route.traced} foes ${st.enemies.length} geysers ${zones} secs ${st.gen2.sections.map((s) => s.template.replace('w9-', '')).join(' ')}`);
      } catch (e) {
        rows.push(`${difficulty[0]}${seed}: THROW ${(e as Error).message.slice(0, 200)}`);
      }
    }
  }
  let s = 0;
  let k = 0;
  for (let i = 0; i < profs.length; i++) for (let j = i + 1; j < profs.length; j++) (s += 1 - cosine(profs[i], profs[j])), k++;
  console.log(`== ${id} diversity ${(s / Math.max(1, k)).toFixed(3)}`);
  for (const r of rows) console.log('  ' + r);
  for (const [e, n] of fails) console.log(`  x${n} ${e}`);
}
