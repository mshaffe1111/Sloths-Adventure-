/**
 * Easy's chase gap (ENG-B6; the lead's ruling 11-14 6:10 PM ET: on EASY every chase gap must be one the child bot clears on 3 of 3 seeds,
 * a lay rule in the chase brick): gen2/chaseLay.ts CHASE_LAY.easyGap and easyGapProblems, run by layChase on an Easy stage only. The
 * number is held to the bot in tools/inspect/chaseBots.test.ts. PLANTED: the same Easy roll laid with the rule off (no max) lays the gap.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import type { Platform } from '../types.ts';
import { CHASE_LAY, easyGapProblems, layChase } from './chaseLay.ts';
import type { Gen2Stage } from './types.ts';

const Y = 500;
const sec = (x: number, w: number, y = Y): Platform => ({ id: x, x, y, width: w, height: 400, type: 'solid', chase: true }) as Platform;
const LAY = { stretches: [{ start: 1000, end: 3000 }] };

test("Easy's chase gap: a gap up to CHASE_LAY.easyGap between a stretch's sections is laid; one past it is refused by name", () => {
  const at = (g: number) => [sec(1000, 600), sec(1600 + g, 600), sec(2200 + g, 600)];
  assert.deepEqual(easyGapProblems(LAY, at(CHASE_LAY.easyGap)), []);
  const bad = easyGapProblems(LAY, at(CHASE_LAY.easyGap + 10));
  assert.equal(bad.length, 1);
  assert.match(bad[0], new RegExp(`stretch 1 on Easy: a ${CHASE_LAY.easyGap + 10} px gap at x 1600, over Easy's ${CHASE_LAY.easyGap} px`));
  // (a raised section over another is no gap: the furthest reach so far is what a gap is measured from)
  assert.deepEqual(easyGapProblems(LAY, [sec(1000, 600), sec(1400, 300, Y - 60), sec(1600, 600)]), []);
  // (a log laid across the gap at their height closes it)
  assert.deepEqual(easyGapProblems(LAY, [...at(120), { id: 1, x: 1590, y: Y, width: 140, height: 40, type: 'solid' } as Platform]), []);
  // (PLANTED: the rule off, nothing refused)
  assert.deepEqual(easyGapProblems(LAY, at(140), Infinity), []);
});

test('layChase applies it on an Easy stage only: a stretch with a 100 px gap is refused by name on Easy, never on Normal (PLANTED: the same lay on Normal)', () => {
  const nodes: Array<[string, number, number]> = [['arrive', 0, 1000], ['pressure', 1000, 3000], ['rest', 3000, 4000], ['exit', 4000, 5000]];
  const lay = (difficulty: 'normal' | 'easy') => {
    // (chaseLay.test.ts's hand-built stage: its ground, with a 100 px gap on the stretch, and the stage's setting on its budget)
    const ground: Array<[number, number]> = [[0, 1000], [1000, 1800], [1900, 3000], [3000, 4000], [4000, 5000]];
    const platforms = ground.map(([a, b], i) => ({ id: i + 1, x: a, y: 600, width: b - a, height: 40, type: 'solid' }) as Platform);
    const st = {
      config: { levelWidth: 5000 }, spawnX: 140, platforms, checkpoints: [],
      gen2: { budget: { difficulty }, graph: { nodes: nodes.map(([job], i) => ({ id: `n${i + 1}`, job })) }, sections: nodes.map(([, x0, x1], i) => ({ uid: `s${i + 1}`, node: `n${i + 1}`, x0, x1 })) },
    } as unknown as Gen2Stage;
    const main = (uid: string) => {
      const [, x0, x1] = nodes[+uid.slice(1) - 1];
      return platforms.filter((p) => p.x + p.width / 2 >= x0 && p.x + p.width / 2 <= x1).map((platform) => ({ platform, main: true }));
    };
    return layChase(st, main).problems.filter((p) => / on Easy: a 100 px gap at x 1800, over Easy's/.test(p));
  };
  assert.equal(lay('easy').length, 1, 'Easy refuses it by name');
  assert.deepEqual(lay('normal'), [], 'Normal lays it');
});
