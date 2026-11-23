// 2-3's played stage (playFinish) read by lineFaults, both settings (BUILD-23)
import { buildStage } from '../libstage.ts';
import { listedStage, playFinish } from '../../../src/game/gen2/listed.ts';
import { lineFaults } from '../../../src/game/gen2/lineFaults.ts';
import { W2_FOLLOW } from '../../../src/game/gen2/worlds/w2.ts';
const [a, b] = (process.argv[2] ?? '1-3').split('-').map(Number);
for (let s = a; s <= b; s++) for (const d of ['normal', 'easy'] as const) {
  const st: any = playFinish(listedStage('2-3')!, buildStage('2-3', s, d), d);
  const safeWater = (st.rivers ?? []).filter((r: any) => r.safe).map((r: any) => ({ x0: r.x0, x1: r.x1, y: r.surfaceY }));
  const deepWater = (st.rivers ?? []).filter((r: any) => !r.safe).map((r: any) => ({ x0: r.x0, x1: r.x1, y: r.surfaceY }));
  const f = lineFaults({ platforms: st.platforms, vines: st.vines, ropes: st.ropes, collectibles: st.collectibles, exitTotemX: st.exitTotemX, bushes: st.proto.bushes, watch: st.proto.watch, safeWater, deepWater, dir: 1 }, W2_FOLLOW, d === 'easy');
  const cages = st.collectibles.filter((c: any) => c.type === 'cage').map((c: any) => `${c.critter}@${Math.round(c.x)},${Math.round(c.y)}`);
  console.log(s, d, 'follow', !!st.proto.follow, 'cages', cages.join(' '), 'zones', st.proto.watch.map((z: any) => `${z.x0}-${z.x1}${z.lag ? ' lag' + z.lag : ''}${z.freeFirst ? ' free' : ''}`).join(' '), 'rivers', (st.rivers ?? []).length, 'FAULTS', f.length ? f.join(' | ') : 'none');
}
