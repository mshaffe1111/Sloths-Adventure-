/**
 * lineFaults (gen2/lineFaults.ts): the builder's check on a stage whose little ones follow him home (2-3.md "gen2's check"). Each rule
 * passes the design's own numbers and refuses a plant one step past them; the two-heron window is flown with the game's own line.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { childCross, facesOn, lineFaults, LINE_RULE, safeWindow, type LineStage } from './lineFaults.ts';
import { W2_FOLLOW } from './worlds/w2.ts';
import type { Bush, WatchZone } from '../watcher.ts';
import type { Collectible, Platform, Vine } from '../types.ts';

const Y = 800;
const floor: Platform = { id: 1, x: 0, y: Y, width: 9000, height: 200, type: 'solid' } as Platform;
const reed = (x: number, w: number): Bush => ({ x, w, y: Y, kind: 'wide' });

/** clump A at 1000 (W wide), open mud G, clump B; one watched stretch over both (or two herons, the second `lag` s later) */
function crossing(W: number, G: number, herons: 1 | 2 = 1, lag = 3.2, more: Partial<LineStage> = {}): LineStage {
  const A = reed(1000, W);
  const B = reed(1000 + W + G, W);
  const z: WatchZone = { x0: 900, x1: B.x + W + 100, calm: [5, 5] };
  return { platforms: [floor], collectibles: [], exitTotemX: 8000, bushes: [A, B], watch: herons === 2 ? [z, { ...z, lag }] : [z], ...more };
}

/** the design's adult rules alone (the child's, R-165.363, judged on its own below) */
const CHILD = /calibrated child/;
const adult = (f: string[]) => f.filter((l) => !CHILD.test(l));

test('the design\'s clump to clump passes the adult rules: Normal W 260 over G 350 and 500 (one heron); Easy W 340 over G 350', () => {
  assert.deepEqual(adult(lineFaults(crossing(260, 350), W2_FOLLOW)), []);
  assert.deepEqual(adult(lineFaults(crossing(260, 500), W2_FOLLOW)), []);
  assert.deepEqual(adult(lineFaults(crossing(340, 350), W2_FOLLOW, true)), []);
});

/** a cage before the crossing for each little one he leads in (the line's tail is the row's gap x them) */
const leading = (n: number): Partial<LineStage> => ({ collectibles: Array.from({ length: n }, (_, i) => ({ type: 'cage', x: 100 + i * 50, y: Y - 60 }) as Collectible) });

test('R-165.363 planted: the calibrated child loses the line over 2-3\'s old lays (beat 4 G 400 with its boulder, 2 behind; beat 7 G 350 under two herons 3.2 s apart, 4 behind) and brings it over the new ones', () => {
  // (beat 4 as rolled on 11-20 (seed 5): W 300, G 400, the 50 px moss_stone boulder mid-mud, the heron's calm 5 s)
  const rock: Platform = { id: 2, x: 1442, y: Y - 50, width: 117, height: 50, type: 'solid' } as Platform;
  const old4 = crossing(300, 400, 1, 0, { ...leading(2), platforms: [floor, rock] });
  assert.match(lineFaults(old4, W2_FOLLOW).join('\n'), CHILD, 'beat 4 as it was');
  assert.match(lineFaults(old4, W2_FOLLOW).join('\n'), /a face at 14\d\d on the watched mud/);
  // (beat 7 as it was: two herons, the late calm 5 s, 3.2 s out of step)
  assert.match(lineFaults(crossing(300, 350, 2, 3.2, leading(4)), W2_FOLLOW).join('\n'), CHILD, 'beat 7 as it was');
  // (the clumps closer, no boulder: beat 4 at 200; beat 7 at 180 with the calm 8.5 s still out of step)
  assert.deepEqual(lineFaults(crossing(300, 200, 1, 0, leading(2)), W2_FOLLOW), []);
  const new7 = crossing(300, 180, 2, 3.2, leading(4));
  for (const z of new7.watch!) (z as { calm: [number, number] }).calm = [8.5, 9];
  assert.deepEqual(lineFaults(new7, W2_FOLLOW), []);
  // (and the gap alone does not do it under two herons at the short calm: the line cannot leave one clump at a child's pace)
  assert.match(lineFaults(crossing(300, 60, 2, 3.2, leading(4)), W2_FOLLOW).join('\n'), CHILD);
});

test('R-165.363: childCross flies the game\'s own line: the line\'s tail counts (one behind crosses what six cannot)', () => {
  const at = (G: number, n: number) => { const st = crossing(300, G, 1, 0); return childCross(W2_FOLLOW, false, st.watch!, st.bushes!, st.platforms, [], n); };
  assert.ok(at(400, 2), 'G 400, 2 behind: lost');
  assert.equal(at(150, 1), null, 'G 150, 1 behind: through');
  assert.ok(at(150, 6), 'G 150, 6 behind: the tail does not fit');
});

test('R-165.363 planted: a face on the watched mud is refused; the same rock in the reeds, or past the stretch, is not a mud face', () => {
  const at = (x: number): Platform => ({ id: 3, x, y: Y - 50, width: 110, height: 50, type: 'solid' }) as Platform;
  assert.deepEqual(facesOn([floor, at(1400)], 900, 2000), [1400]);
  const face = (x: number) => lineFaults(crossing(300, 200, 1, 0, { platforms: [floor, at(x)] }), W2_FOLLOW).filter((l) => /a face at/.test(l));
  assert.equal(face(1350).length, 1, 'on the mud');
  assert.deepEqual(face(1100), [], 'in the first clump');
  assert.deepEqual(face(2400), [], 'past the stretch');
});

test('planted: a clump under 260 px (Easy 340) is refused', () => {
  assert.match(lineFaults(crossing(220, 350), W2_FOLLOW).join('\n'), /220 px, under the 260 px/);
  assert.match(lineFaults(crossing(300, 350), W2_FOLLOW, true).join('\n'), /300 px, under the 340 px/);
});

test('planted: open mud over 500 px (Easy 350) is refused', () => {
  assert.match(lineFaults(crossing(260, 520), W2_FOLLOW).join('\n'), /520 px of open mud/);
  assert.match(lineFaults(crossing(340, 400), W2_FOLLOW, true).join('\n'), /400 px of open mud/);
});

test('a watched pond over 360 px is refused on both settings; 340 passes', () => {
  const wet = (G: number) => crossing(300, G, 1, 0, { safeWater: [{ x0: 1300, x1: 1300 + G, y: Y + 20 }] });
  assert.deepEqual(lineFaults(wet(340), W2_FOLLOW), []);
  assert.match(lineFaults(wet(400), W2_FOLLOW).join('\n'), /400 px of open pond/);
  assert.match(lineFaults({ ...wet(400), bushes: [reed(1000, 340), reed(1740, 340)] }, W2_FOLLOW, true).join('\n'), /open pond/);
});

test('two herons out of step (beat 7): G 350, the second 3.2 s later, leaves a safe window of 2.0 s or more; G 500 / 4.8 s is refused', () => {
  const ok = crossing(260, 350, 2, 3.2);
  const w = safeWindow(W2_FOLLOW, false, ok.bushes![0], ok.bushes![1], ok.watch!, ok.platforms);
  assert.ok(w >= LINE_RULE.window, `window ${w.toFixed(1)} s (the flight: 2.6 s)`);
  assert.deepEqual(adult(lineFaults(ok, W2_FOLLOW)), []);
  // (G 500 is over the two-heron mud limit, and its window is short too: the flight's 0.4 s)
  const bad = crossing(260, 500, 2, 4.8);
  const f = lineFaults(bad, W2_FOLLOW).join('\n');
  assert.match(f, /500 px of open mud .*two herons/);
  const wb = safeWindow(W2_FOLLOW, false, bad.bushes![0], bad.bushes![1], bad.watch!, bad.platforms);
  assert.ok(wb < LINE_RULE.window, `planted window ${wb.toFixed(1)} s`);
  assert.match(f, /longest safe time to leave/);
});

const post = (x: number, top: number): Vine => ({ id: 7, x, topY: top, bottomY: Y - 10, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb' }) as Vine;

test('a climb he comes back down from (the mooring post) passes; one whose top lets him off onto a ledge is refused', () => {
  const st: LineStage = { platforms: [floor], vines: [post(2000, Y - 300)], collectibles: [], exitTotemX: 8000 };
  assert.deepEqual(lineFaults(st, W2_FOLLOW), []);
  const ledge = { id: 9, x: 2040, y: Y - 280, width: 400, height: 30, type: 'solid' } as Platform;
  assert.match(lineFaults({ ...st, platforms: [floor, ledge] }, W2_FOLLOW).join('\n'), /lets him off onto other ground/);
  // (and a foot with no ground 60 px on: he cannot come down to the line)
  const short = { ...floor, width: 2030 } as Platform;
  assert.match(lineFaults({ ...st, platforms: [short] }, W2_FOLLOW).join('\n'), /no ground 60 px on/);
});

test('planted: a swing or a ride on the line\'s road is refused (they never swing or ride)', () => {
  const swing = { ...post(2000, Y - 400), vineType: 'swing_liana', isSwingingVine: true } as Vine;
  assert.match(lineFaults({ platforms: [floor], vines: [swing], collectibles: [], exitTotemX: 8000 }, W2_FOLLOW).join('\n'), /never swing/);
  const log = { id: 3, x: 3000, y: Y + 10, width: 120, height: 20, type: 'drift' } as Platform;
  assert.match(lineFaults({ platforms: [floor, log], collectibles: [], exitTotemX: 8000 }, W2_FOLLOW).join('\n'), /never ride/);
});

test('a cage drops its little one onto ground or splash-back water before the exit; nothing, deep water or past the exit is refused', () => {
  const cage = (x: number): Collectible => ({ id: x, x, y: Y - 300, type: 'cage', collected: false, critter: 'otter' }) as Collectible;
  const base: LineStage = { platforms: [floor], collectibles: [cage(2000)], exitTotemX: 8000 };
  assert.deepEqual(lineFaults(base, W2_FOLLOW), []);
  assert.deepEqual(lineFaults({ ...base, platforms: [{ ...floor, width: 1500 } as Platform], safeWater: [{ x0: 1500, x1: 2500, y: Y + 20 }] }, W2_FOLLOW), [], 'into the pond: it paddles');
  assert.match(lineFaults({ ...base, platforms: [{ ...floor, width: 1500 } as Platform] }, W2_FOLLOW).join('\n'), /drops into nothing/);
  assert.match(lineFaults({ ...base, platforms: [{ ...floor, width: 1500 } as Platform], deepWater: [{ x0: 1500, x1: 2500, y: Y + 20 }] }, W2_FOLLOW).join('\n'), /deep water/);
  assert.match(lineFaults({ ...base, exitTotemX: 1800 }, W2_FOLLOW).join('\n'), /past the exit/);
});
