// gen2/legs.ts: the leg marks, the legs of a graph, a column's frame and walls, and the mirror that makes a left leg (R-165.196).
import test from 'node:test';
import assert from 'node:assert/strict';
import type { Platform, Rope, Vine } from '../types.ts';
import type { Zone } from '../zones.ts';
import { columnFrame, columnWalls, legMarks, legsOf, mixed, reflectLeg, WALL, type LegLaid } from './legs.ts';
import { parseCode } from './nodeCode.ts';
import { TOWER } from './tower.ts';

test('legs: a code with no mark reads as it always did, and names no travel', () => {
  const code = 'A T P F[Pb2^+|Pg1]< R X R S E';
  const m = legMarks(code);
  assert.equal(m.code, code);
  assert.equal(m.marked, false);
  assert.deepEqual(m.travel, new Array(9).fill(undefined));
  assert.equal(parseCode(m.code).length, 9);
});

test('legs: a mark sets the travel of every node after it, to the next mark; the code left parses as nodes', () => {
  const m = legMarks('A P /D D D /R P F[Pb2^+|Pg1]< R /U U U /L X R S E');
  assert.equal(m.marked, true);
  assert.equal(m.code, 'A P D D P F[Pb2^+|Pg1]< R U U X R S E');
  assert.deepEqual(m.travel, [undefined, undefined, 'down', 'down', 'right', 'right', 'right', 'up', 'up', 'left', 'left', 'left', 'left']);
  assert.equal(parseCode(m.code).length, m.travel.length);
  // (planted: a mark that is not one is refused by name, never read as a node)
  assert.throws(() => legMarks('A /X P E'), /"\/X" is not a leg mark/);
});

test('legs: a graph\'s legs are its runs of one travel; one right leg is a run, one up leg a tower, anything else is mixed', () => {
  const t = (...ts: Array<'right' | 'left' | 'up' | 'down' | undefined>) => ts.map((travel) => ({ travel }));
  assert.deepEqual(legsOf(t(undefined, undefined, 'down', 'down', 'right', 'up'), 'right'), [
    { travel: 'right', from: 0, to: 2 }, { travel: 'down', from: 2, to: 4 }, { travel: 'right', from: 4, to: 5 }, { travel: 'up', from: 5, to: 6 },
  ]);
  assert.equal(mixed(legsOf(t(undefined, undefined), 'right')), false);
  assert.equal(mixed(legsOf(t(undefined, undefined), 'up')), false);
  assert.equal(mixed(legsOf(t(undefined, 'right'), 'right')), false);
  assert.equal(mixed(legsOf(t(undefined, 'up'), 'right')), true);
  assert.equal(mixed(legsOf(t('left', 'left'), 'right')), true);
});

test('legs: a column begins where he stands and lies ahead of him, whichever way he heads', () => {
  assert.deepEqual(columnFrame('down', 3000, 1, 1280), { x0: 3000, x1: 4280 });
  assert.deepEqual(columnFrame('down', 3000, -1, 1280), { x0: 1720, x1: 3000 });
  // (going up the vine stands on the ledge he leaves: the column takes its tip in)
  const back = TOWER.wall + TOWER.vineIn;
  assert.deepEqual(columnFrame('up', 3000, 1, 1280), { x0: 3000 - back, x1: 3000 - back + 1280 });
  assert.deepEqual(columnFrame('up', 3000, -1, 1280), { x0: 3000 + back - 1280, x1: 3000 + back });
});

test('legs: a column\'s walls stand top to floor, open only at the doorways, each a storey\'s clearance high', () => {
  const frame = { x0: 1000, x1: 2280 };
  // (an ascent entered bottom-left at y 900 and left top-right at y 300)
  const walls = columnWalls(frame, 300, 900, [{ side: -1, y: 900 }, { side: 1, y: 300 }]);
  const left = walls.filter((w) => w.x < frame.x0), right = walls.filter((w) => w.x >= frame.x1);
  assert.deepEqual(left, [{ x: 1000 - WALL.w, y: 300 - WALL.over, w: WALL.w, h: 900 - TOWER.clear - (300 - WALL.over), what: 'wall' }]);
  // (the wall he leaves over ends at the ledge he leaves by: nothing stands over the doorway but open sky under `over`)
  assert.deepEqual(right, [{ x: 2280, y: 300, w: WALL.w, h: 600, what: 'wall' }]);
  // (no doorway: a whole wall each side; planted: a doorway mid-wall leaves wall over it and under it)
  assert.equal(columnWalls(frame, 300, 900, []).length, 2);
  const mid = columnWalls(frame, 300, 900, [{ side: 1, y: 600 }]).filter((w) => w.x >= frame.x1);
  assert.deepEqual(mid.map((w) => [w.y, w.y + w.h]), [[300 - WALL.over, 600 - TOWER.clear], [600, 900]]);
});

const plat = (id: number, x: number, y: number, width: number): Platform => ({ id, x, y, width, height: 24, type: 'solid' }) as Platform;
const vine = (id: number, x: number): Vine => ({ id, x, topY: 100, bottomY: 300, swaySpeed: 1, swayPhase: 0, vineType: 'tree_climb' });

test('legs: a left leg is the right leg in a mirror: every x turned about the line, widths and heights kept, hands swapped', () => {
  const a = plat(1, 5000, 500, 200), b = plat(2, 5300, 440, 120);
  const v = vine(1, 5290);
  const rope: Rope = { id: 1, x0: 5200, x1: 5300, y: 420, g0: 500, g1: 440, required: false };
  const zone = { kind: 'wind', x0: 5100, x1: 5400, top: 300, bottom: 500, baseY: 500, dir: 1, period: 4, warn: 1, active: 2, offset: 0, force: 100, emit: [5150], lights: [{ x: 5350, y: 400, r: 80 }] } as Zone;
  const laid: LegLaid = {
    platforms: [a, b], vines: [v], ropes: [rope], zones: [zone],
    gaps: [{ x0: 5200, x1: 5300 }], asks: [{ x0: 5200, x1: 5300 }], heartFalls: [{ x0: 5210, x1: 5290 }],
    sections: [{ uid: 's1', entry: { x: 5000, y: 500 }, exit: { x: 5420, y: 440 }, x0: 5000, x1: 5420, vines: [{ vine: v, gap: [5200, 5300] }], sockets: [{ x: 5360 }], beats: [{ x: 5200 }] }],
  };
  // (the leg was laid from x 5000 on; he stands at x 1000: the mirror line puts its entry there)
  const sum = 5000 + 1000;
  reflectLeg(laid, sum);
  assert.deepEqual([a.x, a.width, a.y], [800, 200, 500]);
  assert.deepEqual([b.x, b.width, b.y], [580, 120, 440]);
  assert.equal(v.x, 710, 'a vine shared by the stage and its section is turned once, not twice');
  assert.deepEqual([rope.x0, rope.x1, rope.g0, rope.g1], [700, 800, 440, 500]);
  assert.deepEqual([zone.x0, zone.x1, zone.dir, zone.emit, zone.lights?.[0].x], [600, 900, -1, [850], 650]);
  assert.deepEqual(laid.gaps[0], { x0: 700, x1: 800 });
  assert.deepEqual(laid.heartFalls[0], { x0: 710, x1: 790 });
  const q = laid.sections[0];
  assert.deepEqual([q.entry.x, q.exit.x, q.x0, q.x1, q.vines[0].gap, q.sockets[0].x, q.beats[0].x], [1000, 580, 580, 1000, [700, 800], 640, 800]);
  // (twice is where it began: the mirror loses nothing)
  reflectLeg(laid, sum);
  assert.deepEqual([a.x, b.x, v.x, rope.x0, rope.g0, zone.dir, q.entry.x, q.x0, q.x1], [5000, 5300, 5290, 5200, 500, 1, 5000, 5000, 5420]);
});

test('legs: what the mirror cannot turn yet is refused by name, never laid wrong', () => {
  const liana = { ...vine(1, 100), vineType: 'swing_liana' } as Vine;
  const none = { platforms: [], ropes: [], zones: [], gaps: [], asks: [], heartFalls: [] };
  assert.throws(() => reflectLeg({ ...none, vines: [liana], sections: [] }, 0), /a liana in a leg laid left/);
  assert.throws(() => reflectLeg({ ...none, vines: [], sections: [{ uid: 's4', entry: { x: 0, y: 0 }, exit: { x: 0, y: 0 }, x0: 0, x1: 0, vines: [], sockets: [], beats: [], room: {} }] }, 0), /s4 holds a puzzle room/);
});
