/**
 * The bounce TEACH is the bounce (POLISH-7, R-165.228; the lead's ruling 2, 11-14; POLISH-6 bounce-probe: at 209-214 px over the
 * mushroom's cap only a second press at the apex got him up, a hidden double). On every listed 1-1 layout, both settings, the game's own
 * build (RealPlay): each section that teaches the bounce is walked into from 80, 160 and 240 px before its mushroom, right held, no jump
 * pressed, and he must stand on the bank it lifts him to. Red at the old lip (BOUNCE_LIP, 237-245 over the floor), green at TEACH_LIP.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { RealPlay } from './realPlay.ts';
import { setDifficulty } from './difficulty.ts';
import { loadSeedList, provenSeeds } from './gen2/seedList.ts';
import { w1World } from './gen2/worlds/w1.ts';

const STAGE = '1-1';
const TEACHES = new Set(w1World().manifest.sections.filter((t) => t.teaches === 'bounce' && (t as { feel?: string[] }).feel?.includes(STAGE)).map((t) => t.id));
type P = { x: number; y: number; width: number; height: number; type: string };

/** the teach's mushroom, the floor under it and the bank it lifts to (the first solid past it whose top is over the cap) */
function teachAt(st: { platforms: P[]; gen2: { sections: Array<{ template: string; x0: number; x1: number }> } }) {
  return st.gen2.sections.filter((q) => TEACHES.has(q.template)).map((sec) => {
    const S = st.platforms;
    const mush = S.find((p) => p.type === 'bouncy' && p.x >= sec.x0 && p.x <= sec.x1)!;
    const floor = S.filter((p) => p.type === 'solid' && p.x <= mush.x && p.x + p.width >= mush.x + mush.width && p.y >= mush.y + mush.height - 8).sort((a, b) => a.y - b.y)[0];
    const bank = S.filter((p) => p.type === 'solid' && p.x > mush.x && p.x < mush.x + 400 && p.y < mush.y).sort((a, b) => a.x - b.x)[0];
    return { sec, mush, floor, bank };
  });
}

test(`the bounce teach is the bounce: ${STAGE}, every listed layout, both settings, walked onto the mushroom with no press, he stands on the bank`, async () => {
  assert.ok(TEACHES.size >= 1, 'a 1-1 section teaches the bounce');
  assert.ok(await loadSeedList(STAGE));
  const n = provenSeeds(STAGE).length;
  const bad: string[] = [];
  let walked = 0, worst = Infinity;
  for (const setting of ['normal', 'easy'] as const) {
    setDifficulty(setting);
    for (let v = 0; v < n; v++) {
      const look = new RealPlay(STAGE, v);
      for (const { sec, mush, floor, bank } of teachAt(look.stage as never)) {
        if (!floor || !bank) { bad.push(`${setting} layout ${v} ${sec.template}: no floor or bank found by the mushroom at x ${Math.round(mush.x)}`); continue; }
        const over = mush.y - bank.y;
        if (over > 150) bad.push(`${setting} layout ${v} ${sec.template}: the bank is ${Math.round(over)} px over the mushroom's cap (at most 150)`);
        for (const back of [80, 160, 240]) {
          const r = new RealPlay(STAGE, v) as unknown as { stand(x: number, y: number): void; frame(pad: Record<string, boolean>): void; p: { x: number; y: number; vy: number; grounded: boolean } };
          r.stand(mush.x - back, floor.y);
          let up = false, peak = Infinity;
          for (let t = 0; t < 150 && !up; t++) {
            r.frame({ right: true });
            peak = Math.min(peak, r.p.y);
            up = r.p.grounded && r.p.x > bank.x + 10 && Math.abs(r.p.y - bank.y) < 8;
          }
          walked++;
          worst = Math.min(worst, bank.y - peak);
          if (!up) bad.push(`${setting} layout ${v} ${sec.template}: walked from ${back} px back, not up (peak ${Math.round(peak - bank.y)} px from the bank top)`);
        }
      }
    }
  }
  setDifficulty('normal');
  assert.ok(walked > 0, 'some layout lays a bounce teach');
  assert.deepEqual(bad.slice(0, 12), [], `${bad.length} of ${walked} walks fail`);
});
