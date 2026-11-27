// ENG-QUIET toys: deadTime (analyze.ts:24) on hand-made beats, as the model stands and under the proposed clock cap (a wait on a VISIBLE and
// AUDIBLE clock counts busy for at most one period of that clock; the rest of it is quiet). P = 2.85 s (2-9's bar).  npx tsx <this>
import { deadTime, NORMAL_GAP } from '../../../../tools/inspect/analyze.ts';
const P = 2.85, samples = [{ base: 0, x: 0, y: 0 }] as any;
const beat = (base: number, act: number, dur = 0) => ({ base, t: 0, dur, act, x: 0, y: 0, letter: 'J', count: 1, what: '' });
const clock = (bs: any[]) => { let d = 0; return bs.map((b) => { const o = { ...b, t: b.base + d }; d += b.dur; return o; }); };
const q = (bs: any[], total: number) => deadTime(clock(bs) as any, total, NORMAL_GAP, samples).longest.toFixed(2);
// each toy: a hop, a wait of W s, the press (a 0.4 s move), 1 s walk off. Three ways the model can hold the wait:
const toy = (name: string, W: number, isClock: boolean) => {
  const total = 0.3 + W + 0.4 + 1;
  const inDt = q([beat(0, 0.3), beat(0.3 + W, 0.4)], total);              // inside a move's time (route.ts wheel / lianaDrop): quiet now
  const asDur = q([beat(0, 0.3), beat(0.3, 0.4, W)], total);              // as a beat's dur (surging falls, Dot's knot): busy now, uncapped
  const cap = isClock ? Math.min(W, P) : 0;                                // the proposal: busy for at most one period, only on a clock
  const prop = q([beat(0, 0.3), beat(0.3, cap), beat(0.3 + W, 0.4)], total);
  console.log(`${name.padEnd(34)} wait ${W.toFixed(2)} s | now, in a move's time: quiet ${inDt} | now, as a dur: quiet ${asDur} | PROPOSED: quiet ${prop} -> ${Number(prop) > 4 ? 'OVER 4 s' : 'ok'}`);
};
toy('one-bar clock wait (count to ONE)', P, true);
toy('3-bar idle wait on the clock', 3 * P, true);
toy('plain stand, no clock, 1 bar long', P, false);
toy('plain stand, no clock, 4.5 s', 4.5, false);
