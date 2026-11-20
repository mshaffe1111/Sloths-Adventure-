// ENG-26 probe: one toy roll's wheel, jetty, street, the platforms near it, and its faults (relative imports, D83)
import { toyStage, type WheelToy } from '../../../tools/inspect/wheelToys.ts';
import { wheelFaults } from '../../../src/game/gen2/wheelLay.ts';
const row = (process.argv[2] ?? 'teach') as WheelToy, seed = Number(process.argv[3] ?? 1), d = (process.argv[4] ?? 'normal') as 'normal';
const st = toyStage(row, seed, d);
const w = st.platforms.find((p) => p.wheel)!.wheel!.w;
console.log('wheel', JSON.stringify({ ...w }));
const near = st.platforms.filter((p) => !p.wheel && Math.abs(p.x + p.width / 2 - w.cx) < 900 && Math.abs(p.y - w.cy) < 700);
for (const p of near) console.log('plat', p.id, p.type, p.style ?? '', Math.round(p.x), Math.round(p.x + p.width), Math.round(p.y), p.height, p.tag ?? '');
console.log('rivers', JSON.stringify(st.rivers));
console.log('vines', JSON.stringify(st.vines.filter((v) => Math.abs(v.x - w.cx) < 900).map((v) => [v.x, v.topY, v.bottomY])));
console.log('faults', wheelFaults(st, d));
console.log('errors', (st.gen2.errors ?? []).slice(0, 4));
console.log('turns', JSON.stringify(st.gen2.tower?.turns));
