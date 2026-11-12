// PROOF-1 item 3: does every built 1-1 (Play's build, on its proven seeds) carry gen2.brief.teaches with 'double'?
// If not, the double's promises (teach.double-no-gap-after, teach.double-gap-unsafe) no longer run on it (promises11.ts gates them on the brief).
//   npx tsx reference/qa-reports/PROOF-1/fairness/briefcheck.ts
import '../../../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
import { provenSeeds, buildPlayStage } from '../../../../src/game/gen2/seedList.ts';
import { w1World } from '../../../../src/game/gen2/worlds/w1.ts';
import { FIRST_RUN_11 } from '../../../../src/game/gen2/firstRun11.ts';
const level = { ...generateAllLevels().find((l) => l.id === '1-1')!, unlocked: true };
const seeds = provenSeeds('1-1');
let n = 0, withDouble = 0, noBrief = 0;
const pick = [FIRST_RUN_11.seed, ...seeds.slice(0, 40)];
for (const s of pick) for (const d of ['normal', 'easy'] as const) {
  const st = buildPlayStage(level, w1World(), s, d) as { gen2?: { brief?: { teaches?: string[] } } };
  n++;
  const t = st.gen2?.brief?.teaches;
  if (!st.gen2?.brief) noBrief++;
  if (t?.includes('double')) withDouble++;
}
console.log(`1-1 builds: ${n}; with gen2.brief: ${n - noBrief}; brief teaches double: ${withDouble}`);
