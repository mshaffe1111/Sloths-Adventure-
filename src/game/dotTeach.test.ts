// A stage's own TEACH line (P13 11-12, the lead's ruling): its data says so (StageHint.teach), and Dot's queue then (a) lets it wait for
// a clear moment and keeps it up its full reading time, never cut by a stock lesson; (b) a stock foe lesson leaves an animal under a set
// drop trap to that line. 1-3's trap tip was cut after 1.5 s by "Tap to punch it when it's close." (a stock lesson fired by the sleeping
// snake under the first hive), or held back until it was old news: most first-timer bots never saw it. No stage id here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GuideQueue, CALM, readMs, type GuideLine, type TickEnv } from './dotGuide.ts';
import { TEACH_WAIT_MS, engineGuideLine } from './dotLines.ts';
import { lessonDotLine, pickLesson, type LessonScene } from './lessons.ts';
import { scares } from './dropTrap.ts';

const TIP = 'Shake the vine by the branch and the hive drops on whoever sleeps under it.';
const env = (): TickEnv => ({ danger: false, moveCount: () => 0 });
/** a calm queue (Worlds 1-4), the tip from the engine at 9 s, the stock foe lesson 2 s after it; what is up, every 100 ms, to 40 s */
function run(teach: boolean): Array<string | null> {
  const q = new GuideQueue(true);
  const tip = engineGuideLine(TIP, '9-9', { dot: true, ms: 3600, teach })!;
  const foe = lessonDotLine('foe', 'screen', false) as GuideLine;
  const out: Array<string | null> = [];
  for (let t = 0; t <= 40000; t += 100) {
    if (t === 9000) q.push(tip, t);
    if (t === 11000) q.push(foe, t);
    out.push(q.tick(t, env())?.line.key ?? null);
  }
  return out;
}
const upFor = (keys: Array<string | null>, key: string) => keys.filter((k) => k === key).length * 100;

test('the data makes it a teach line that may wait a minute for a clear moment; without it, a plain line, old news in 9 s', () => {
  const t = engineGuideLine(TIP, '9-9', { dot: true, ms: 3600, teach: true })!;
  assert.equal(t.kind, 'teach');
  assert.equal(t.waitMs, TEACH_WAIT_MS);
  const i = engineGuideLine(TIP, '9-9', { dot: true, ms: 3600 })!;
  assert.equal(i.kind, 'info');
});

test('a teach line stays its full reading time: the stock lesson that comes 2 s later waits behind it, never cuts it', () => {
  const key = engineGuideLine(TIP, '9-9', { dot: true })!.key;
  const teach = run(true);
  assert.ok(upFor(teach, key) >= readMs(TIP), `up ${upFor(teach, key)} ms, its reading time ${readMs(TIP)}`);
  assert.ok(teach.lastIndexOf(key) < teach.indexOf(lessonDotLine('foe', 'screen', false)!.key), 'the stock lesson after it');
  // (the planted contrast: the same words as a plain line are cut by the lesson once up its 1.5 s minimum)
  assert.ok(upFor(run(false), key) < readMs(TIP), 'a plain line is cut short: the defect');
});

test('a teach line waits through a long line already up, where a plain line would be dropped as old news', () => {
  for (const teach of [true, false]) {
    const q = new GuideQueue(true);
    const tip = engineGuideLine(TIP, '9-9', { dot: true, teach })!;
    // (a long story exchange holds the screen: a scene line up its reading time, then the tip's turn)
    const long: GuideLine = { key: 'long', text: 'One. Two. Three. Four. Five. Six. Seven. Eight. Nine. Ten. Eleven. Twelve. Thirteen. Fourteen. Fifteen. Sixteen. Seventeen. Eighteen. Nineteen. Twenty. Twenty-one.', kind: 'must', who: 'Dot', source: 'engine' };
    let shown = false;
    for (let t = CALM.startMs; t <= 60000; t += 100) {
      if (t === CALM.startMs) q.push(long, t);
      if (t === CALM.startMs + 200) q.push(tip, t);
      if (q.tick(t, env())?.line.key === tip.key) shown = true;
    }
    assert.equal(shown, teach, teach ? 'the teach line is said once the screen is clear' : 'the plain line went unsaid');
  }
});

test('the stock foe lesson leaves an animal under a set drop trap to the stage\'s own teach line, and comes at a bare one', () => {
  const trap = { id: 1, kind: 'vine' as const, load: 'hive' as const, x: 560, y: 500, loadX: 820, loadY: 290, landY: 500 };
  const set = { post: trap, phase: 'set' };
  const ownTeach = (e: { x: number; y: number }) => set.phase === 'set' && scares(trap, e.x, e.y);
  const scene = (snakeX: number, withTeach: boolean): LessonScene => ({
    px: snakeX - 150, py: 500, view: { x0: snakeX - 400, x1: snakeX + 400, y0: 100, y1: 700 },
    enemies: [{ type: 'snake', x: snakeX, y: 486, defeated: false }], collectibles: [], vines: [], platforms: [], checkpoints: [], rivers: [],
    ...(withTeach ? { ownTeach } : {}),
  });
  assert.equal(pickLesson(scene(820, false), new Set()), 'foe', 'without the rule: the stock lesson at the trapped sleeper (the defect)');
  assert.equal(pickLesson(scene(820, true), new Set()), null, 'the snake under the hive is the trap tip\'s');
  assert.equal(pickLesson(scene(1400, true), new Set()), 'foe', 'a bare snake, no trap over it: the stock lesson as before');
  set.phase = 'down';
  assert.equal(pickLesson(scene(820, true), new Set()), 'foe', 'a trap already sprung covers nothing');
});
