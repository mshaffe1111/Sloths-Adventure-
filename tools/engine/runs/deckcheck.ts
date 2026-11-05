// RUNS #43: every idea the mixer laid (meta.mix.explain) against its node's deck in the stage's spec (src/game/mixer/stages.ts), over
// 16 layouts x 2 settings of 1-1 and 1-5. A part of a "a + b" fork road must be in that road's deck. "crossings: ..." entries are the
// mixer's joins between roads, not draws. The teach's bank hops is the one allowed outside a deck (w1mix.ts's own guard).
import '../../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../../../src/game/stageGenerator.ts';
import { easyStage } from '../../../src/game/easyMode.ts';
import { withGoals } from '../../../src/game/goals.ts';
import { SPECS } from '../../../src/game/mixer/stages.ts';
const levels = generateAllLevels();
let draws = 0, bad = 0; const bads = new Map<string, number>();
for (const spec of SPECS) {
  const c = levels.find((l) => l.id === spec.id)!;
  for (const setting of ['normal', 'easy'] as const) for (let v = 1; v <= 16; v++) {
    setLayoutVariant(v);
    const st: any = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal'));
    setLayoutVariant(null);
    for (const e of st.meta.mix.explain as Array<{ node: number; job: string; idea: string; road?: 'high' | 'low' }>) {
      if (e.idea.startsWith('crossings')) continue;
      const n = (spec.nodes as any[])[e.node - 1];
      const deck: string[] = Array.isArray(n.deck) ? n.deck : e.road ? n.deck[e.road] : [...n.deck.high, ...n.deck.low];
      for (const part of e.idea.split(' + ')) {
        draws++;
        if (!deck.includes(part) && !(n.job.startsWith('teach') && part === 'bank hops')) { bad++; const k = `${spec.id} n${e.node} (${n.job}) drew "${part}" not in [${deck.join(', ')}]`; bads.set(k, (bads.get(k) ?? 0) + 1); }
      }
    }
  }
}
console.log(`deck check: ${draws} draws over ${SPECS.map((s) => s.id).join(', ')} x 16 layouts x 2 settings; ${bad} outside their node's deck`);
for (const [k, n] of bads) console.log(`  ${n} x ${k}`);
