// VAR-19d probe: plainWalk.test.ts's flickUp (copied) at one face on a listed layout, logging where he goes each few frames.
// usage: npx tsx flick.ts <stage> <layout> <faceX> <lean 0|-1>
import '../../../../src/game/headlessDom.ts';
import { RealPlay } from '../../../../src/game/realPlay.ts';
const [stage, v, fx, lean] = [process.argv[2], Number(process.argv[3]), Number(process.argv[4]), Number(process.argv[5] ?? -1) as -1 | 0];
const sim: any = new RealPlay(stage, v);
sim.input.source = 'gesture';
const q = sim.platforms.find((p: any) => Math.abs(p.x - fx) < 2 && p.type === 'solid');
const floor = sim.platforms.filter((f: any) => f !== q && f.x <= q.x - 10 && f.x + f.width >= q.x - 10 && f.y > q.y).sort((a: any, b: any) => a.y - b.y)[0];
console.log(`face ${q.tag} x${q.x} top ${q.y}; floor ${floor.tag} ${floor.x}-${floor.x + floor.width} y${floor.y}`);
console.log('behind:', sim.platforms.filter((p: any) => p.x < q.x - 10 && p.x + p.width > q.x - 260 && p.y < floor.y + 200).map((p: any) => `${p.tag ?? p.type}@${Math.round(p.x)}-${Math.round(p.x + p.width)} y${Math.round(p.y)} h${Math.round(p.height)} ${p.type}`).join(' | '));
sim.stand(q.x - 70, floor.y); sim.p.facing = 1; sim.safe = false;
let hold = 0, flicked = false;
for (let i = 0; i < 90; i++) {
  const p = sim.p; let press = false;
  if (!flicked && p.grounded && p.x + 19 >= q.x - 3) { press = true; flicked = true; hold = 7; sim.input.state.jumpLean = lean; }
  sim.frame({ right: !flicked, press, jump: hold > 0 }); hold--;
  if (i % 4 === 0 || press) console.log(`f${i} x${Math.round(sim.p.x)} y${Math.round(sim.p.y)} g${sim.p.grounded ? 1 : 0} face${sim.p.facing} ${press ? 'PRESS' : ''}`);
  if (flicked && hold < 0 && sim.p.grounded) { console.log(`landed x${Math.round(sim.p.x)} y${Math.round(sim.p.y)} (top ${q.y}, floor ${floor.y})`); break; }
}
