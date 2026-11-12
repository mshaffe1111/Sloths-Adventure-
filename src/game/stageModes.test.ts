// Travel as a mode (ADR-003 kit step 2, GAME-MAP A2 + A3): the travel answers per direction, on their own and in the real engine.
//   npx tsx --test src/game/stageModes.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { MODES, travelSpan } from './stageModes.ts';
import { HelpLadder } from './helpLadder.ts';
import { RealPlay, levelConfig } from './realPlay.ts';
import { generateAllLevels } from './worldsData.ts';
import { SHRINE_STOP, ascentProgress } from './rules.ts';
import type { Travel } from './stageKit.types.ts';
import type { LevelConfig } from './types.ts';

const stage = { levelWidth: 5000, exit: { x: 4000, y: 300 }, spawn: { x: 140, y: 900 } };
const leftStage = { levelWidth: 5000, exit: { x: 400, y: 900 }, spawn: { x: 4800, y: 900 } };

test('right: the answers the engine gave before the mode (exit wall, flags, the bar from x 140, a piece passed at its far end)', () => {
  const m = MODES.right;
  assert.deepEqual(m.bounds(stage), { minX: 20, maxX: 4000 + SHRINE_STOP });
  assert.deepEqual(m.bounds({ ...stage, exit: { x: 0, y: 0 } }), { minX: 20, maxX: 4980 }, 'no shrine: the level wall');
  assert.equal(m.further({ x: 900, y: 0 }, { x: 800, y: 0 }), true);
  assert.equal(m.further({ x: 800, y: -500 }, { x: 800, y: 0 }), false, 'height says nothing in a run');
  assert.equal(m.progress(stage.spawn, stage.exit, { x: 140, y: 0 }), 0);
  assert.equal(m.progress(stage.spawn, stage.exit, { x: 140 + (4000 - 140) / 2, y: 0 }), 0.5);
  assert.equal(m.progress(stage.spawn, stage.exit, { x: 9999, y: 0 }), 1);
  assert.deepEqual(m.best({ x: 900, y: 5 }, { x: 600, y: 7 }), { x: 600, y: 7 }, "a run's bar follows him back (as before)");
  assert.equal(m.past({ x: 1000, y: 0 }, { from: 400, to: 1000 }), true);
  assert.equal(m.past({ x: 999, y: 0 }, { from: 400, to: 1000 }), false);
  assert.deepEqual(m.lead(), { dx: 1, dy: 0 });
});

test('left: the mirror of right, and the exit on the left does not pin him at the start', () => {
  const m = MODES.left;
  assert.deepEqual(m.bounds(leftStage), { minX: 400 - SHRINE_STOP, maxX: 4980 });
  assert.equal(m.further({ x: 700, y: 0 }, { x: 800, y: 0 }), true);
  assert.equal(m.further({ x: 900, y: 0 }, { x: 800, y: 0 }), false);
  assert.equal(m.progress(leftStage.spawn, leftStage.exit, { x: 4800, y: 0 }), 0);
  assert.equal(m.progress(leftStage.spawn, leftStage.exit, { x: 2600, y: 0 }), 0.5);
  assert.equal(m.progress(leftStage.spawn, leftStage.exit, { x: 0, y: 0 }), 1);
  assert.equal(m.past({ x: 400, y: 0 }, { from: 1000, to: 400 }), true);
  assert.equal(m.past({ x: 401, y: 0 }, { from: 1000, to: 400 }), false);
  assert.deepEqual(travelSpan(m, 400, 1000), { from: 1000, to: 400 }, 'a piece laid from 400 to 1000 is entered at 1000');
  assert.deepEqual(travelSpan(MODES.right, 400, 1000), { from: 400, to: 1000 });
  assert.deepEqual(m.lead(), { dx: -1, dy: 0 });
});

test('up and down: height decides, the walls are the level (down keeps the shrine wall on the far side from the start)', () => {
  const up = MODES.up, down = MODES.down;
  const tower = { levelWidth: 3200, exit: { x: 2345, y: 400 }, spawn: { x: 200, y: 7000 } };
  assert.deepEqual(up.bounds(tower), { minX: 20, maxX: 3180 });
  assert.equal(up.further({ x: 0, y: 500 }, { x: 900, y: 600 }), true);
  assert.equal(up.further({ x: 900, y: 600 }, { x: 0, y: 600 }), false);
  assert.deepEqual(up.best({ x: 5, y: 600 }, { x: 9, y: 700 }), { x: 5, y: 600 }, 'a drop back never lowers the best');
  for (const y of [7000, 7050, 3700, 400, 200]) assert.equal(up.progress(tower.spawn, tower.exit, { x: 0, y }), ascentProgress(7000, 400, y), `the old bar at y ${y}`);
  assert.equal(up.past({ x: 0, y: 500 }, { from: 900, to: 500 }), true);
  assert.equal(up.past({ x: 0, y: 501 }, { from: 900, to: 500 }), false);
  assert.deepEqual(up.lead(), { dx: 0, dy: -1 });
  const drop = { levelWidth: 19750, exit: { x: 19470, y: 10269 }, spawn: { x: 220, y: 400 } };
  assert.deepEqual(down.bounds(drop), { minX: 20, maxX: 19470 + SHRINE_STOP });
  assert.deepEqual(down.bounds({ ...drop, exit: { x: 100, y: 10269 } }), { minX: 100 - SHRINE_STOP, maxX: 19730 }, 'an exit left of the start walls the left');
  assert.equal(down.further({ x: 0, y: 700 }, { x: 900, y: 600 }), true);
  assert.equal(down.further({ x: 900, y: 500 }, { x: 0, y: 600 }), false);
  assert.deepEqual(down.best({ x: 5, y: 600 }, { x: 9, y: 500 }), { x: 5, y: 600 });
  assert.equal(down.progress(drop.spawn, drop.exit, { x: 0, y: 400 }), 0);
  assert.equal(down.progress(drop.spawn, drop.exit, { x: 0, y: (400 + 10269) / 2 }), 0.5);
  assert.equal(down.progress(drop.spawn, drop.exit, { x: 0, y: 99999 }), 1);
  assert.equal(down.past({ x: 0, y: 900 }, { from: 500, to: 900 }), true);
  assert.deepEqual(down.lead(), { dx: 0, dy: 1 });
  assert.equal(MODES.stay.travel, 'stay');
  for (const t of Object.keys(MODES) as Travel[]) assert.equal(MODES[t].travel, t);
});

test('the data: 4-7 reads down, every climb reads up, the rest name nothing (right); and the data agrees with what the builders lay', () => {
  for (const c of generateAllLevels()) {
    const want = c.id === '4-7' ? 'down' : c.objectiveType === 'ascent' ? 'up' : undefined;
    assert.equal(c.travel, want, c.id);
  }
  const drop = new RealPlay('4-7', 1);
  assert.equal(drop.e.mode, MODES.down);
  assert.equal(!!drop.e.proto?.w4?.descent, true, "4-7's builder still lays a way down");
  assert.equal(new RealPlay('1-1', 1).e.mode, MODES.right);
});

/** a real engine on a stage, the bar's ratio caught from the HUD callback */
function play(id: string, cfg?: LevelConfig) {
  const r = new RealPlay(id, 1, cfg);
  let ratio = NaN;
  r.e.callbacks.onProgressUpdate = (_c: number, _t: number, _s: number, _h: number, d: number) => { ratio = d; };
  return { r, bar: () => ratio };
}

test('right in the engine (1-1): the wall just past the shrine, a later flag replaces an earlier one and never the other way, the bar', () => {
  const { r, bar } = play('1-1');
  const st = r.stage, cps = st.checkpoints!;
  r.stand(cps[1].x, cps[1].y); r.frame();
  assert.deepEqual(r.e.checkpoint, { x: cps[1].x, y: cps[1].y });
  r.stand(cps[0].x, cps[0].y); r.frame();
  assert.deepEqual(r.e.checkpoint, { x: cps[1].x, y: cps[1].y }, 'the earlier flag, touched going back, is no respawn');
  assert.ok(Math.abs(bar() - (r.p.x - 140) / (st.exitTotemX - 140)) < 1e-9, 'the bar is his x from 140 to the shrine');
  r.fly(st.exitTotemX + 400, st.exitTotemY - 600); r.frame();
  assert.equal(r.p.x, st.exitTotemX + SHRINE_STOP);
});

test('down in the engine (4-7): a lower flag is further on wherever it stands, the bar counts the lowest ledge stood on', () => {
  const { r, bar } = play('4-7');
  const st = r.stage, byY = [...st.checkpoints!].sort((a, b) => a.y - b.y);
  r.stand(byY[2].x, byY[2].y); r.frame();
  assert.deepEqual(r.e.checkpoint, { x: byY[2].x, y: byY[2].y });
  r.stand(byY[0].x, byY[0].y); r.frame();
  assert.deepEqual(r.e.checkpoint, { x: byY[2].x, y: byY[2].y }, 'a higher flag never replaces a lower one');
  assert.ok(Math.abs(bar() - (byY[2].y - st.spawnY) / (st.exitTotemY - st.spawnY)) < 0.02, `the bar holds the lowest ledge (${bar()})`);
});

test('up in the engine (1-4): a higher flag is further on, the bar is the old climb bar, no wall at the door', () => {
  const { r, bar } = play('1-4');
  const st = r.stage, byY = [...st.checkpoints!].sort((a, b) => b.y - a.y);
  r.stand(byY[2].x, byY[2].y); r.frame();
  assert.deepEqual(r.e.checkpoint, { x: byY[2].x, y: byY[2].y });
  r.stand(byY[0].x, byY[0].y); r.frame();
  assert.deepEqual(r.e.checkpoint, { x: byY[2].x, y: byY[2].y });
  assert.ok(Math.abs(bar() - ascentProgress(st.spawnY, st.exitTotemY, byY[2].y)) < 0.02, `the bar holds the best height (${bar()})`);
  r.fly(st.config.levelWidth + 500, byY[2].y - 400); r.frame();
  assert.equal(r.p.x, st.config.levelWidth - 20);
});

test('left in the engine (a fixture only this test builds: 1-1 read leftward, its shrine moved to the left of the start)', () => {
  const { r, bar } = play('1-1', { ...levelConfig('1-1'), travel: 'left' });
  assert.equal(r.e.mode, MODES.left);
  const st = r.stage, cps = st.checkpoints!;
  const startX = cps[3].x, exitX = st.spawnX + 600;
  Object.assign(st, { spawnX: startX, spawnY: cps[3].y, exitTotemX: exitX });
  r.e.travelStart();
  r.e.checkpoint = { x: startX, y: cps[3].y };
  r.stand(cps[1].x, cps[1].y); r.frame();
  assert.deepEqual(r.e.checkpoint, { x: cps[1].x, y: cps[1].y }, 'a flag further left replaces the start');
  r.stand(cps[2].x, cps[2].y); r.frame();
  assert.deepEqual(r.e.checkpoint, { x: cps[1].x, y: cps[1].y }, 'a flag back to the right does not');
  assert.ok(Math.abs(bar() - (startX - r.p.x) / (startX - exitX)) < 1e-9, `the bar counts leftward (${bar()})`);
  r.fly(20, cps[0].y - 600); r.frame();
  assert.equal(r.p.x, exitX - SHRINE_STOP, 'the wall is just past the shrine on its left');
  r.fly(startX + 300, cps[3].y - 600); r.frame();
  assert.equal(r.p.x, startX + 300, 'and nothing pins him right of a left-hand exit');
});

test("the help ladder's past: a counted piece resets once he stands beyond it along the travel (right as before; left at its near end)", () => {
  const P = [{ k: 'a', x0: 1000, x1: 2000 }, { k: 'b', x0: 2000, x1: 3000 }];
  const right = new HelpLadder('easy', P);
  right.putBack(1500);
  assert.equal(right.count('a'), 1);
  right.stood({ x: 1999, y: 0 });
  assert.equal(right.count('a'), 1);
  right.stood({ x: 2000, y: 0 });
  assert.equal(right.count('a'), 0);
  const left = new HelpLadder('easy', P, undefined, undefined, MODES.left);
  left.putBack(2500);
  left.stood({ x: 2001, y: 0 });
  assert.equal(left.count('b'), 1, 'still inside the piece he is crossing leftward');
  left.stood({ x: 3500, y: 0 });
  assert.equal(left.count('b'), 1, 'standing to its right is behind it, not beyond it');
  left.stood({ x: 2000, y: 0 });
  assert.equal(left.count('b'), 0);
});
