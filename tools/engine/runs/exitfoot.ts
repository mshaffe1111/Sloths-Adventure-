// RUNS #120: the exit gate's drawn footprint (stageArt.ts drawGateArt: GATE_H 250 px tall, width from its frame's aspect,
// stageArtData.ts GATE_FRAMES) against the piece it stands on (the top under exitTotemX at exitTotemY), 16 layouts x 2 settings.
import '../../../src/game/headlessDom.ts';
import { GATE_FRAMES } from '../../../src/game/stageArtData.ts';
import { GATE_H } from '../../../src/game/stageArt.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../../../src/game/stageGenerator.ts';
import { easyStage } from '../../../src/game/easyMode.ts';
import { withGoals } from '../../../src/game/goals.ts';
const g = (GATE_FRAMES as any)[1] ?? Object.values(GATE_FRAMES as any)[0];
const f = g.shut; const W = Math.round(GATE_H * f.w / f.h);
console.log(`W1 gate drawn ${W} x ${GATE_H} px (frame ${f.w}x${f.h})`);
for (const id of (process.env.IDS ?? '1-1,1-5').split(',')) {
  const c = generateAllLevels().find((l) => l.id === id)!;
  for (const s of ['normal', 'easy'] as const) {
    const res: string[] = []; let ok = 0;
    for (let v = 1; v <= 16; v++) {
      setLayoutVariant(v);
      const st: any = s === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal'));
      setLayoutVariant(null);
      const x = st.exitTotemX, y = st.exitTotemY;
      const p = st.platforms.find((q: any) => !q.decorative && x >= q.x && x <= q.x + q.width && Math.abs(q.y - y) < 8);
      const l = p ? Math.round(x - p.x) : -1, r = p ? Math.round(p.x + p.width - x) : -1;
      const fits = p && l >= W / 2 && r >= W / 2; ok += fits ? 1 : 0;
      if (v <= 3 || !fits) res.push(`L${v}: on ${p ? `${p.style ?? p.type} ${Math.round(p.width)} px (room left ${l}, right ${r})` : 'NOTHING'}${fits ? '' : ' OVERHANGS'}`);
    }
    console.log(`${id} ${s}: the gate's ${W} px foot fits on its piece on ${ok}/16 layouts; ${res.join('; ')}`);
  }
}
