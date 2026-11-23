// ENG-HUD27b: run on a tree with 2-7 (t-build-27-wip) and judged flipped: npx tsx reference/qa-reports/ENG-HUD27/errs27.ts 1-12
// every 2-7 roll (layouts given), both settings, with judged flipped: the verdict lines and the water lines laid
import '../../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../../../src/game/stageGenerator.ts';
import { easyStage } from '../../../src/game/easyMode.ts';
import { withGoals } from '../../../src/game/goals.ts';
const [a, b] = (process.argv[2] ?? '1-12').split('-').map(Number);
const c = generateAllLevels().find((l) => l.id === '2-7')!;
let bad = 0;
for (const setting of ['normal', 'easy'] as const) for (let v = a; v <= b; v++) {
  setLayoutVariant(v);
  let st: any;
  try { st = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal')); }
  catch (e) { console.log(setting, v, 'ERROR', String((e as Error).message).slice(0, 160)); bad++; setLayoutVariant(null); continue; }
  setLayoutVariant(null);
  const verd = Object.values(st.gen2?.verdicts ?? {}).flatMap((x: any) => (x && !x.accepted ? x.failed.map((f: any) => `${f.name} (${f.setting}): ${f.line}`) : []));
  const unw = verd.filter((l: string) => l.startsWith('drop.unwarned'));
  if (unw.length) bad++;
  const water = (st.gen2.fills ?? []).filter((f: any) => f.what === 'water').map((f: any) => `${f.x}@${f.y}`).join(' ');
  const warned = (st.gen2.drops ?? []).filter((d: any) => d.warn?.dotLine).map((d: any) => `${Math.round(d.x0)}..${Math.round(d.x1)}@${Math.round(d.lipY)}`).join(' ');
  console.log(setting, v, 'judged', Object.keys(st.gen2?.verdicts ?? {}).join('/'), 'unwarned', JSON.stringify(unw), 'other', verd.length - unw.length, '| lines', water, '| warned', warned);
}
console.log('rolls with drop.unwarned or an error:', bad);
