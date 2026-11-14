/**
 * ENG-S4 SNAKE-LAY (gen2/snakeLay.ts): the vine snake and the false liana laid on a section's lianas by piece key, the 1-4 finish's
 * pattern; the lay throws when snakeFaults refuses the result (the level's top among them), so an unfair roll is never listed.
 * Planted: reference/qa-reports/ENG-S4/planted.out.txt M10-M12.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { laySnakes, snakeClock, type SnakeStage, type SnakeTable } from './snakeLay.ts';
import type { Vine } from '../types.ts';
import { isFalseLiana } from '../vineSnake.ts';

/** a liana hung `top` px under the level's top, 410 px long, tagged as section `uid`'s piece `key` */
const liana = (id: number, uid: string, key: string, top: number, x = 1000 * id): Vine =>
  ({ id, x, topY: top, bottomY: top + 410, vineType: 'swing_liana', isSwingingVine: true, swaySpeed: 1.1, swayPhase: 0, swingAmp: 0.5, swingPeriod: 2.85, tag: `${uid}:${key}` }) as Vine;

/** a toy built stage 900 tall: section s1 (a FAR gap) and s2 (the false liana's), their lianas hung `top` px down */
function stage(top: number): SnakeStage {
  return {
    config: { levelHeight: 900 },
    vines: [liana(1, 's1', 'l', top), liana(2, 's2', 'l', top), liana(3, 's2', 'f', top), liana(4, 's3', 'l', top)],
    gen2: { sections: [{ uid: 's1', template: 'far' }, { uid: 's2', template: 'false' }, { uid: 's3', template: 'riser' }] },
  };
}

/** 1-6.md's snakes: beat 7's from the anchor (a 7 s trip, the tell 0.6 s), beat 11's riser (none on Easy), beat 13's false liana */
const TABLE: SnakeTable = {
  beats: { 'snake-down': { period: 14, tell: 0.6, on: 7, easyStretch: 1.15 }, 'snake-up': { period: 9, tell: 0.6, on: 4 } },
  sections: {
    far: [{ liana: 'l', route: 'down-off', beat: 'snake-down' }],
    false: [{ liana: 'f', route: 'still' }],
    riser: [{ liana: 'l', route: 'up', beat: 'snake-up', reach: 0.7, easy: 'none' }],
  },
};

test('laySnakes puts each row\'s snake on its section\'s liana by piece key, lists each beat once, and makes the false liana hang still', () => {
  const st = laySnakes(stage(300), TABLE, false);
  const [far, plain, fake, riser] = st.vines;
  assert.deepEqual(far.snake, { route: 'down-off', clock: 'snake-down' });
  assert.equal(plain.snake, undefined, 'a liana no row names carries nothing');
  assert.ok(isFalseLiana(fake) && fake.swingAmp === 0, 'the false liana hangs still (its tell)');
  assert.deepEqual(riser.snake, { route: 'up', clock: 'snake-up', reach: 0.7 });
  assert.deepEqual(st.clocks!.map((c) => c.id).sort(), ['snake-down', 'snake-up']);
  assert.deepEqual(st.clocks!.find((c) => c.id === 'snake-down'), snakeClock('snake-down', TABLE.beats['snake-down']));
  // (a second stage lay on the same beat does not list it twice)
  const two = stage(300);
  two.gen2!.sections = [...two.gen2!.sections!, { uid: 's4', template: 'far' }];
  two.vines.push(liana(5, 's4', 'l', 300));
  assert.equal(laySnakes(two, TABLE, false).clocks!.filter((c) => c.id === 'snake-down').length, 1);
});

test('Easy: a row marked none is not laid (1-6.md: none rise on Easy); a row with Easy\'s own values lays those', () => {
  const st = laySnakes(stage(300), TABLE, true);
  assert.equal(st.vines[3].snake, undefined);
  assert.deepEqual(st.clocks!.map((c) => c.id), ['snake-down']);
  const t: SnakeTable = { ...TABLE, sections: { ...TABLE.sections, riser: [{ liana: 'l', route: 'up', beat: 'snake-up', reach: 0.7, easy: { route: 'down-off', beat: 'snake-down' } }] } };
  assert.deepEqual(laySnakes(stage(300), t, true).vines[3].snake, { route: 'down-off', clock: 'snake-down', reach: 0.7 });
});

test('the lay refuses what snakeFaults refuses: a snake from the anchor on a liana hung 124 px under the level\'s top (6-3\'s) is unseen, so the roll throws; a riser on the same liana is laid', () => {
  assert.throws(() => laySnakes(stage(124), TABLE, false), /hung 124 px under the level's top/);
  const up: SnakeTable = { beats: TABLE.beats, sections: { riser: TABLE.sections.riser } };
  assert.equal(laySnakes(stage(124), up, false).vines[3].snake?.route, 'up');
  // (a beat whose tell is under SNAKE.tell is refused too, by snakeBeatFaults)
  assert.throws(() => laySnakes(stage(300), { ...TABLE, beats: { ...TABLE.beats, 'snake-down': { period: 14, tell: 0.3, on: 7 } } }, false), /tell/);
});

test('the lay names what it cannot do: a piece the section did not lay (an untagged stage), a climbing vine, a beat not in the table, a beat quicker on Easy', () => {
  const st = stage(300);
  for (const v of st.vines) delete v.tag;
  assert.throws(() => laySnakes(st, TABLE, false), /laid no piece l \(is the stage's brief tagged\?\)/);
  const climb = stage(300);
  climb.vines[0].vineType = 'tree_climb';
  assert.throws(() => laySnakes(climb, TABLE, false), /is a climbing vine/);
  assert.throws(() => laySnakes(stage(300), { ...TABLE, beats: { 'snake-up': TABLE.beats['snake-up'] } }, false), /its beat snake-down is not in the table/);
  assert.throws(() => laySnakes(stage(300), { ...TABLE, beats: { ...TABLE.beats, 'snake-up': { ...TABLE.beats['snake-up'], easyStretch: 0.9 } } }, false), /quicker on Easy/);
});
