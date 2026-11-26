/**
 * ENG-BOTSIM item 1: can the engine be flown N frames ahead under a candidate pad, deterministically, without touching the live run?
 * `npx tsx tools/inspect/botsim/forkProbe.ts [stage] [seed] [setting] [seconds]`
 * A: the copy (forkSim: a deep copy, stepped on its own): equal to the live flight? the live run untouched? (it is NOT: closures)
 * B: snapshot + fly the live engine + restore (probe): (1) the whole reachable graph prints the same after; (2) the probe's flight equals
 *    the live flight frame by frame; (3) two runs of the same inputs, one probed 45 frames ahead EVERY 3rd frame, are equal at the end.
 */
import { RealPlay } from '../../../src/game/realPlay.ts';
import { rng, freshPhone } from '../firsttimer.ts';
import { forkSim, stepFork, probe, graphPrint } from '../engineFork.ts';

const [id = '2-4', seedS = '35', setting = 'easy', secsS = '30'] = process.argv.slice(2);
const pad = (i: number) => ({ right: i % 200 < 150, left: i % 200 >= 170, jump: i % 37 < 6, press: i % 37 === 0 });
const cand = Array.from({ length: 45 }, (_, k) => ({ right: true, jump: k < 5, press: k === 0 }));
const row = (e: Record<string, any>) => [e.player.x, e.player.y, e.player.vx, e.player.vy].map((v: number) => v.toFixed(4)).join(' ');
const make = () => {
  Math.random = rng(1);
  freshPhone(setting as 'easy');
  return new RealPlay(id, Number(seedS));
};
const sim = make();
for (let i = 0; i < 30 * 8; i++) sim.frame(pad(i));
// A: the copy
{
  const before = JSON.stringify([sim.e.gameTime, row(sim.e)]);
  const f = forkSim(sim);
  for (const p of cand) stepFork(f, p);
  console.log(`A copy: live time moved by the copy's flight: ${before !== JSON.stringify([sim.e.gameTime, row(sim.e)])} (the clock's closure)`);
}
// B1, B2
const g0 = graphPrint(sim.e);
const pr = probe(sim.e, cand, (e) => row(e));
const g1 = graphPrint(sim.e);
console.log(`B1 graph print equal after a probe: ${g0 === g1} (${g0.length} chars)`);
const live: string[] = [];
const sim2 = make();
for (let i = 0; i < 30 * 8; i++) sim2.frame(pad(i));
for (const p of cand) { sim2.frame(p); live.push(row(sim2.e)); }
const d = pr.rows.findIndex((r, k) => r !== live[k]);
console.log(`B2 probe flight vs live flight: first differing frame ${d} of ${pr.rows.length}${d >= 0 ? ` probe ${pr.rows[d]} live ${live[d]}` : ''}`);
// B3: a long run probed every 3rd frame vs the same run never probed
const N = 30 * Number(secsS);
const a = make();
let ms = 0;
let n = 0;
for (let i = 0; i < N; i++) {
  if (i % 3 === 0) {
    const r = probe(a.e, cand, (e) => e.player.x as number);
    ms += r.ms;
    n++;
  }
  a.frame(pad(i));
}
const endA = row(a.e);
const printA = graphPrint(a.e);
const b = make();
for (let i = 0; i < N; i++) b.frame(pad(i));
console.log(`B3 ${N} frames, ${n} probes of 45 frames: end equal ${endA === row(b.e)}, graph equal ${printA === graphPrint(b.e)} (${endA} | ${row(b.e)})`);
const t0 = performance.now();
const printB = graphPrint(b.e);
for (let i = 0; i < 90; i++) b.frame(pad(i));
console.log(`cost: a probe of 45 frames ${(ms / n).toFixed(2)} ms mean (${n} probes); a live frame ${((performance.now() - t0) / 90).toFixed(3)} ms`);
if (process.env.DIFF) {
  const x = printA.split(' ');
  const y = printB.split(' ');
  const k = x.findIndex((v, i) => v !== y[i]);
  console.log('first graph difference at token', k, 'of', x.length, y.length, '| a:', x.slice(Math.max(0, k - 12), k + 6).join(' '), '| b:', y.slice(Math.max(0, k - 12), k + 6).join(' '));
}
