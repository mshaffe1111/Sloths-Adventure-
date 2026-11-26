/** ENG-BOTSIM: which engine fields the snapshot copies (objects reached first through each), and the snapshot + restore time.
 *  `npx tsx tools/inspect/botsim/snapSize.ts [stage] [seed]` */
import { RealPlay } from '../../../src/game/realPlay.ts';
import { rng, freshPhone } from '../firsttimer.ts';
import { deepFork, snapshot, restore } from '../engineFork.ts';
const [id = '2-4', seedS = '35'] = process.argv.slice(2);
Math.random = rng(1);
freshPhone('easy');
const sim = new RealPlay(id, Number(seedS));
for (let i = 0; i < 240; i++) sim.frame({ right: true, jump: i % 45 < 5, press: i % 45 === 0 });
const e = sim.e as Record<string, unknown>;
const seen = new Map<object, unknown>();
const rows: Array<[string, number]> = [];
for (const k of Object.keys(e)) {
  const before = seen.size;
  deepFork({ v: e[k] }, undefined, seen);
  rows.push([k, seen.size - before - 1]);
}
rows.sort((a, b) => b[1] - a[1]);
console.log('total', seen.size, 'top:', rows.slice(0, 12).map(([k, n]) => `${k} ${n}`).join(', '));
let best = 1e9;
let rest = 1e9;
for (let i = 0; i < 20; i++) {
  const s = snapshot(e);
  best = Math.min(best, s.ms);
  rest = Math.min(rest, restore(e, s));
}
console.log(`snapshot ${best.toFixed(2)} ms, restore ${rest.toFixed(2)} ms (best of 20)`);
