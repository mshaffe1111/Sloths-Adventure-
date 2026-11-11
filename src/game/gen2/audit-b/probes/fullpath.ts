// the stage the GAME plays (generateStage: buildPlayStage + w1Finish + hearts + finishStage + addDress), every listed seed, both settings
import '../../../headlessDom.ts';
import { generateStage } from '../../../stageGenerator.ts';
import { withPlaySeed } from '../../../testlink1_1.ts';
import { validateAsJudged } from '../../../levelCheck.ts';
import { PROVEN_SEEDS } from '../../../gen2/provenSeeds.ts';
import { generateAllLevels } from '../../../worldsData.ts';
const cfg = { ...generateAllLevels().find((l) => l.id === '1-1')!, unlocked: true };
const seeds = PROVEN_SEEDS['1-1'].seeds;
let thrown = 0, bad = 0, walked = 0, n = 0; const ex: string[] = []; const errKinds = new Map<string, number>();
const t0 = Date.now(); let slow = 0;
for (const seed of seeds) for (const d of ['normal', 'easy'] as const) {
  n++;
  try {
    const t = Date.now();
    const st = withPlaySeed(seed, () => generateStage(cfg, d)) as ReturnType<typeof generateStage> & { gen2?: { seed: number; proven?: unknown; errors?: string[]; repairs?: unknown[] } };
    slow = Math.max(slow, Date.now() - t);
    if (st.gen2?.proven) { walked++; ex.push(`seed ${seed} ${d}: played another seed ${JSON.stringify(st.gen2.proven)}`); }
    const v = validateAsJudged(st);
    if (!v.ok) { bad++; for (const e of v.errors) { const k = e.replace(/[0-9]+/g, '#'); errKinds.set(k, (errKinds.get(k) ?? 0) + 1); } if (ex.length < 8) ex.push(`seed ${seed} ${d}: ${v.errors.slice(0, 2).join(' | ')}`); }
  } catch (e) { thrown++; if (ex.length < 8) ex.push(`seed ${seed} ${d} THREW: ${(e as Error).message.slice(0, 200)}`); }
}
console.log(`${n} builds in ${((Date.now() - t0) / 1000).toFixed(0)} s (slowest ${slow} ms): threw ${thrown}, fell back to another seed ${walked}, fail the level check as played ${bad}`);
console.log([...errKinds].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, c]) => `  ${c}x ${k}`).join('\n'));
console.log(ex.join('\n'));
