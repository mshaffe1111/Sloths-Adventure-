// Which laid stage tips does Normal's DEFAULT setting (Tips) drop on a fresh device (ENG-JETTY item 3, 11-23; D50)? Every listed stage,
// its first proven seed, both settings, played the way the game builds it (RealPlay): each StageHint is put through Dot's guide as the
// engine would send it (dotLines.ts engineGuideLine, its teach / story flags) and Tips' rule (dotGuideHelp.ts helpAllows, nothing seen yet).
// A dropped line is chatter to Tips: fine for a reminder, wrong for a once-only story beat (mark it in the world's storyTips).
//   npx tsx reference/qa-reports/ENG-JETTY/storyTipScan.ts            every listed stage
//   npx tsx reference/qa-reports/ENG-JETTY/storyTipScan.ts 2-5,2-7    those stages
import '../../../src/game/headlessDom.ts';
import { RealPlay } from '../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
import { LISTED } from '../../../src/game/gen2/listed.ts';
import { provenSeeds } from '../../../src/game/gen2/seedList.ts';
import { engineGuideLine } from '../../../src/game/dotLines.ts';
import { helpAllows } from '../../../src/game/dotGuideHelp.ts';
import type { StageHint } from '../../../src/game/protoStage.ts';

const only = process.argv[2]?.split(',');
const ids = Object.keys(LISTED).filter((id) => !only || only.includes(id)).sort();
let dropped = 0;
for (const id of ids) {
  const seed = provenSeeds(id)[0] ?? 1;
  const lines = new Map<string, string[]>();
  for (const d of ['normal', 'easy'] as const) {
    setDifficulty(d);
    const r = new RealPlay(id, seed);
    const hints = (r.e as unknown as { proto?: { hints?: StageHint[] } }).proto?.hints ?? [];
    for (const h of hints) {
      const l = engineGuideLine(h.text, id, { dot: true, teach: h.teach, who: h.story });
      if (!l || helpAllows(l, 'reminders', new Set(), true)) continue;
      const k = `${l.kind}${l.move ? ` move:${l.move}` : ''} | ${h.text}`;
      lines.set(k, [...(lines.get(k) ?? []), d]);
    }
  }
  for (const [k, ds] of lines) {
    dropped++;
    console.log(`${id} seed ${seed} (${ds.join('+')}) | ${k}`);
  }
}
setDifficulty('normal');
console.log(`storyTipScan: ${dropped} laid tip line(s) dropped on Tips (Normal's default) over ${ids.length} listed stage(s)`);
