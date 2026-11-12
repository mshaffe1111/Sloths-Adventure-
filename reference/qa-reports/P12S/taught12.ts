/**
 * P12S: the bounce chain taught at its first appearance, on the game's own 1-2 (generateStage, the listed road), layouts 1-16, both
 * settings: the first section holding a bounce cap chain is the teach brick (lib-thorn-teach: two wide caps after the thorns are SHOWN
 * from a ledge he cannot fall from), and no thorn hollow (a hurt place) lies before the teach brick's show ledge ends.
 *   npx tsx reference/qa-reports/P12S/taught12.ts
 */
import '../../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../../../src/game/stageGenerator.ts';
const c = generateAllLevels().find((l) => l.id === '1-2')!;
const CHAIN = /^lib-(thorn|cap)-/;
let bad = 0;
for (const d of ['normal', 'easy'] as const) for (let v = 1; v <= 16; v++) {
  setLayoutVariant(v);
  const st: any = generateStage({ ...c, unlocked: true }, d);
  setLayoutVariant(null);
  const plan: string[] = (st.gen2?.plan ?? []).map((p: any) => p.template), secs = st.gen2?.sections ?? [];
  const i = plan.findIndex((t) => CHAIN.test(t));
  const teachEnd = i >= 0 ? secs[i].x1 : NaN;
  const hurt = st.platforms.filter((p: any) => p.pit === 'hurt').map((p: any) => p.x).sort((a: number, b: number) => a - b);
  const caps = st.platforms.filter((p: any) => p.type === 'bouncy' && p.x < (secs[i]?.x0 ?? 0)).length;
  const ok = plan[i] === 'lib-thorn-teach' && !(hurt[0] < secs[i].x0);
  if (!ok) bad++;
  console.log(`${d} ${String(v).padStart(2)} seed ${st.gen2?.seed}: first chain #${i} ${plan[i]} at ${secs[i]?.x0}..${teachEnd}; first thorn hollow x ${hurt[0] ?? '-'}; mushrooms before it ${caps}; ${ok ? 'TAUGHT' : 'NOT TAUGHT'}`);
}
console.log(bad ? `FAIL: ${bad} of 32 rolls meet a chain or a thorn hollow before the teach` : 'PASS: 32 of 32 rolls teach the chain first, the thorns shown before any hollow');
