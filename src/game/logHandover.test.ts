// npx tsx --test src/game/logHandover.test.ts
/**
 * A log hands its rider over to the bank it slides under, whether it CARRIES him there or he WALKS along it there (FIX-21, 11-15).
 * engine.ts's drift loop stepped a rider up onto the bank only when the log's own slide took his x past the river's end; a rider who walked
 * along the log into the bank went past it on his own step, where the hidden part of the log is no floor (onFloor), and dropped into the
 * water at the bank's foot: 2-1 Normal kid seed 4, the last river, three lives at x 30,971 (FT_FRAMES 148.7-150: on log 134 at 30,973,
 * then off it falling at 30,992, the bank's top 28 px over him). Built on the real 2-1 (RealPlay: the game's own build and engine), any
 * river that runs with him, both ways of reaching the bank.
 */
import './headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import type { Platform } from './types.ts';

type Lives = { lives: number };
/** a log of a river running `dir`, wait until its leading end is 30-80 px under the far bank, then stand him on it `back` px short of it */
function onLogAtBank(rp: RealPlay, dir: 1 | -1, back: number): { log: Platform; end: number } {
  const logs = rp.platforms.filter((q) => q.type === 'drift' && q.drift?.dir === dir);
  assert.ok(logs.length, `2-1 lays a river running ${dir}`);
  // (he waits on the start bank, out of the way, while the river runs)
  const sp = { x: rp.p.x, y: rp.p.y };
  for (let i = 0; i < 30 * 60; i++) {
    for (const q of logs) {
      const d = q.drift!;
      const lead = dir > 0 ? q.x + q.width - d.x1 : d.x0 - q.x;
      if (lead > 30 && lead < 80) {
        const end = dir > 0 ? d.x1 : d.x0;
        rp.stand(end - dir * back, q.y);
        return { log: q, end };
      }
    }
    rp.stand(sp.x, sp.y);
    rp.frame({});
  }
  throw new Error('no log reached the far bank in 60 s');
}

for (const [how, pad] of [['carried (standing)', {}], ['walking along the log', { right: true }]] as const) {
  test(`2-1: a log running with him hands him onto the far bank, ${how}`, () => {
    for (const seed of [4, 2]) {
      const rp = new RealPlay('2-1', seed);
      const e = rp.e as unknown as Lives;
      const { end } = onLogAtBank(rp, 1, 70);
      const lives = e.lives;
      // (until he is 20 px onto the bank: walking on, he would walk off a reed islet into the next river)
      for (let i = 0; i < 60 && rp.p.x < end + 20; i++) rp.frame(pad);
      rp.frame({});
      const on = rp.platforms.find((q) => q.id === rp.standingOn);
      assert.equal(e.lives, lives, `seed ${seed}: no life lost (he is at ${Math.round(rp.p.x)},${Math.round(rp.p.y)})`);
      assert.ok(rp.p.grounded && on && on.type === 'solid' && rp.p.x > end, `seed ${seed}: on the far bank (at ${Math.round(rp.p.x)},${Math.round(rp.p.y)} on ${on?.type ?? 'nothing'})`);
    }
  });
}
