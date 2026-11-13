// A stage run's moments of play in the REAL engine (engine.ts `moments`, P13 11-12): a story line can wait on one (wayside.ts
// StageWay.on) instead of a place. The first animal of the stage's cast a punch sends off is 'cast:punch'; a trap's is 'cast:trap'.
// A punch that only shoves (mid-branch) is no moment. The arena is castEngine.test.ts's: a ledge, a branch with one Golden Tree Snake,
// a hive hung over it and its vine on the ledge, planted into a real engine.
import { makeEngine, standOn, step, type Eng } from './engineCoreHarness.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleBox } from './dropTrap.ts';
import { emptyGuideView } from './dotGuideView.ts';
import { dueLine, stageLine } from './wayside.ts';
import type { Enemy, Platform } from './types.ts';

const Y = 500;
const plat = (id: number, x: number, width: number): Platform => ({ id, x, y: Y, width, height: 40, type: 'solid' } as Platform);
const TRAP = { id: 1, kind: 'vine' as const, load: 'hive' as const, x: 560, y: Y, loadX: 820, loadY: Y - 210, landY: Y };
function arena(snake: Partial<Enemy>, traps: boolean): { e: Eng; input: ReturnType<typeof makeEngine>['input']; snake: Enemy } {
  const { e, input } = makeEngine('1-3', 'normal');
  const ledge = plat(9001, 200, 420), branch = plat(9002, 640, 360);
  e.platforms.length = 0;
  e.platforms.push(ledge, branch);
  const s = {
    id: 9500, type: 'snake', x: 820, y: Y - 14, vx: 0, vy: 0, width: 38, height: 22, hp: 1, maxHp: 1, facing: -1, patrolMinX: 660, patrolMaxX: 980,
    attackCooldown: 0, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0, ...snake,
  } as Enemy;
  e.enemies.length = 0;
  e.enemies.push(s);
  e.vines.length = 0;
  e.collectibles.length = 0;
  e.proto.cast = { kinds: ['snake'], traps: traps ? [{ ...TRAP }] : [] };
  e.startCast();
  e.checkpoint = { x: 260, y: Y };
  standOn(e, ledge, 260);
  e.player.hp = e.player.maxHp;
  return { e, input, snake: s };
}
const walkTo = (e: Eng, input: { state: { right: boolean; left: boolean } }, x: number) => {
  for (let i = 0; i < 300 && Math.abs(e.player.x - x) > 6; i++) { input.state.right = e.player.x < x; input.state.left = e.player.x > x; step(e, 1); }
  input.state.right = input.state.left = false;
};
const punch = (e: Eng, input: { state: { punchPressed: boolean } }, n = 14) => { input.state.punchPressed = true; step(e, 1); input.state.punchPressed = false; step(e, n); };
/** what Dot's guide reads (DotGuide.tsx -> wayside.ts dueLine), for 1-3's line, from the engine's own view */
const excuseMe = (e: Eng): string | undefined => {
  const v = e.guideView(emptyGuideView());
  return dueLine({ world: 1, mini: 3, ratio: 0.5, playedMs: 120_000, shownL: false, shownH: false, moments: v.moments })?.line.text;
};

test('no punch, no line: a stage run starts with no moments, and walking and waiting make none', () => {
  const { e, input } = arena({ x: 975, asleep: true }, false);
  assert.deepEqual(e.moments, []);
  walkTo(e, input, 600);
  step(e, 90);
  assert.deepEqual(e.moments, []);
  assert.equal(excuseMe(e), undefined, 'halfway, and no punch: Dot says nothing');
});

test('the first punch that sends a snake gliding: the moment, and Dot\'s "excuse me" is due', () => {
  const { e, input, snake } = arena({ x: 975, asleep: true }, false);
  walkTo(e, input, 930);
  e.player.facing = 1;
  punch(e, input);
  assert.ok(snake.kit!.leaving, 'the punch at the branch end sends it off');
  assert.deepEqual(e.moments, ['cast:punch']);
  assert.equal(excuseMe(e), stageLine(1, 3)!.text);
});

test('a punch that only shoves it (mid-branch) is no moment, and no line', () => {
  const { e, input, snake } = arena({ x: 760, patrolMinX: 660, patrolMaxX: 980 }, false);
  walkTo(e, input, 700);
  e.player.facing = 1;
  punch(e, input);
  assert.ok(!snake.kit!.leaving, 'shoved and dazed, not gone');
  assert.deepEqual(e.moments, []);
  assert.equal(excuseMe(e), undefined);
});

test('a trap is its own moment, never the punch\'s: the trap line stays the stage\'s own (castPlay said.trap), and "excuse me" waits', () => {
  const { e, input, snake } = arena({ patrolMinX: 760, patrolMaxX: 880 }, true);
  e.proto.cast.said = { trap: 'TRAP LINE' };
  const said: string[] = [];
  const guide = e.guide.bind(e);
  e.guide = (t: string, s: number) => { said.push(t); guide(t, s); };
  walkTo(e, input, handleBox(TRAP).x - 26);
  e.player.facing = 1;
  punch(e, input, 4);
  step(e, 70);
  assert.ok(snake.defeated);
  assert.deepEqual(e.moments, ['cast:trap']);
  assert.equal(excuseMe(e), undefined, 'the punch on the vine is not a punch on a snake');
  assert.ok(said.includes('TRAP LINE'));
});

test('a stage hint its data marks `teach` reaches Dot as the stage\'s own teach line (onGuide o.teach); a plain hint does not', () => {
  const { e, input } = arena({ x: 975, asleep: true }, true);
  const got: Array<[string, boolean]> = [];
  e.callbacks.onGuide = (text: string, _s: number, _p?: boolean, o?: { teach?: true }) => { if (text) got.push([text, !!o?.teach]); };
  e.proto.hints = [
    { x: 300, text: 'P13 plain hint words', pad: 'P13 plain hint words', keys: 'P13 plain hint words' },
    { x: 420, text: 'P13 teach hint words', pad: 'P13 teach hint words', keys: 'P13 teach hint words', teach: true },
  ];
  walkTo(e, input, 480);
  assert.deepEqual(got.filter(([t]) => t.startsWith('P13')), [['P13 plain hint words', false], ['P13 teach hint words', true]]);
});

test('the engine fires no stock foe lesson at a snake under a set drop trap; with the trap gone, it does', () => {
  for (const traps of [true, false]) {
    const { e, input } = arena({ x: 820, asleep: true, patrolMinX: 760, patrolMaxX: 880 }, traps);
    const lessons: string[] = [];
    e.callbacks.onLesson = (id: string) => lessons.push(id);
    walkTo(e, input, 600);
    step(e, 60);
    assert.equal(lessons.includes('foe'), !traps, traps ? 'under the hive: the trap tip\'s, not the punch lesson\'s' : 'a bare snake: the punch lesson');
  }
});
