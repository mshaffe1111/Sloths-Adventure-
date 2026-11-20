import '../../../src/game/headlessDom.ts';
import { firstTimer } from '../../inspect/firsttimer.ts';
import { CAST_BOTS } from '../../inspect/castBots.ts';
import { onSnapper, snapperSeed, SNAPPER_ID } from '../../inspect/snapToys.ts';
const seed = snapperSeed('snapper');
for (const [bot, setting] of [['child','normal'],['child','easy'],['kid','normal'],['kid','easy'],['middle','normal'],['middle','easy'],['expert','normal'],['adult','normal'],['adult','easy']] as const) {
  const out: string[] = [];
  for (const v of [1,2,3,4,5,6]) {
    let side = 0, past = 0, farLand = 0, prevPh = '', kickSide = 0, bonks = 0, approachSide = 0;
    const r = onSnapper('snapper', seed, setting, () => firstTimer(SNAPPER_ID, v, CAST_BOTS[bot][setting]!, { cap: 600, onFrame: (sim: any) => {
      const p = sim.p, c = sim.e.cast; const m = c?.members.find((q: any) => q.e.kitBeat); if (!m) return;
      const ph = m.s.phase;
      if (ph !== 'stunned' && Math.abs(m.s.x - p.x) < 200 && p.grounded) approachSide = Math.sign(p.x - m.s.x);
      if (ph === 'stunned' && prevPh !== 'stunned') { side = approachSide; bonks++; }
      if (ph === 'stunned' && side) { past = Math.max(past, (m.s.x - p.x) * side); if (p.grounded && (p.x - m.s.x) * side < 0) farLand = 1; }
      if (m.cleared && !kickSide && side) kickSide = Math.sign(p.x - m.s.x) === side ? 1 : -1;
      prevPh = ph;
    } }));
    out.push(`v${v}:${r.cast?.cleared?.kick ? 'K' : '-'} b${bonks} past${Math.round(past)}${farLand ? ' FAR' : ''}`);
  }
  console.log(bot, setting, out.join(' | '));
}
