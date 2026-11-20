// ENG-26 probe: roll the wheel toys, print the faults and the wheel's laid layout (a QA probe: relative imports, D83)
import { toyStage, wheelsOf, type WheelToy } from '../../../tools/inspect/wheelToys.ts';
import { wheelFaults } from '../../../src/game/gen2/wheelLay.ts';
const rows = (process.argv[2] ?? 'teach,edge,top').split(',') as WheelToy[];
for (const row of rows) for (const d of ['normal', 'easy'] as const) for (let seed = 1; seed <= Number(process.argv[3] ?? 4); seed++) {
  try {
    const st = toyStage(row, seed, d, (process.env.FLOW ?? 'up') as 'up');
    const w = st.platforms.find((p) => p.wheel)?.wheel?.w;
    console.log(`${row} ${d} seed ${seed}: wheels ${wheelsOf(st)} errors ${JSON.stringify(st.gen2.errors ?? []).slice(0, 600)} faults ${JSON.stringify(wheelFaults(st, d))} ${w ? `axle (${Math.round(w.cx)}, ${Math.round(w.cy)}) way ${w.way}` : ''}`);
  } catch (e) { console.log(`${row} ${d} seed ${seed}: THROW ${(e as Error).message.slice(0, 400)}`); }
}
