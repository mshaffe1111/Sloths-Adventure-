// 1-3 "Branch Snakes" laid test-side from the piece library, held (W1C-lay, tools/engine/library13.ts): 1-3's brief (a purge, its cast
// the snake, its twist drop traps) rolled from World 1's EXISTING sections picked by need, World 1's cast rows and trap pairs
// (gen2/worlds/w1Cast.ts) and the drop-trap bricks. Tool-side: nothing the game ships sets these rows.
//   npx tsx --test tools/engine/library13.test.ts          (about half a minute)
import test from 'node:test';
import assert from 'node:assert/strict';
import { CAST_13, TRAP_LINE, TWISTS, REFUSE_13, UNDER, config13, kitLib13, poolReport, roll, stageIdOf, type Roll13 } from './library13.ts';
import { NEW_STOOD_IN, WAY_DOWN } from './library.ts';
import { buildGen2Stage, stagePool } from '../../src/game/gen2/pipeline.ts';
type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any
import { w1World } from '../../src/game/gen2/worlds/w1.ts';
import { W1_CAST_CREATURES, W1_CAST_SAID, W1_TRAP_PAIRS } from '../../src/game/gen2/worlds/w1Cast.ts';

const O = { flown: true };
/** pinned: these seeds roll clean on both settings (120 of them were measured, 11-12: 119 clean a setting) */
const SEEDS = [1, 2, 3, 4, 5, 6];
const rolls: Record<'normal' | 'easy', Roll13[]> = { normal: SEEDS.map((s) => roll(s, 'normal', O)), easy: SEEDS.map((s) => roll(s, 'easy', O)) };
const each = (f: (r: Roll13, name: string) => void) => { for (const d of ['normal', 'easy'] as const) rolls[d].forEach((r, i) => f(r, `seed ${SEEDS[i]} ${d}`)); };

test("1-1's and 1-2's kits are untouched: World 1 holds no creature, and its sections are its own but for a feel tag", () => {
  const W = w1World().manifest, M = kitLib13(O).manifest, own = new Map(W.sections.map((t) => [t.id, t]));
  assert.equal(W.creatures.length, 0);
  assert.equal(W.pairs.length, 0, 'World 1 gained a pair');
  assert.equal(W.props.some((p) => p.id.startsWith('trap-')), false, 'World 1 gained a trap prop');
  for (const t of M.sections.filter((q) => own.has(q.id))) {
    const { feel: _f, ...a } = t, { feel: _g, ...b } = own.get(t.id)!;
    assert.deepEqual(a, b, `${t.id}: a World 1 section was re-cut`);
  }
  assert.equal(M.sections.length - own.size, TWISTS.length + NEW_STOOD_IN.length + WAY_DOWN.length);
  assert.ok(stagePool(M, stageIdOf(O)).filter((t) => own.has(t.id)).length >= 50, "World 1's sections serve by need");
  assert.deepEqual(poolReport(O).out.filter((q) => q.why === 'refused: '), [], 'a section is out with no reason named');
});

test("the cast rows are w1Cast.ts's, plus the short-patch rows and the top-up tag; a pair's sockets stand 85-130 px apart", () => {
  for (const c of W1_CAST_CREATURES) { const { tags: _t, ...a } = CAST_13.find((q) => q.id === c.id)!, { tags: _u, ...b } = c; assert.deepEqual(a, b, c.id); }
  assert.deepEqual(CAST_13.filter((c) => c.tags?.includes('topup')).map((c) => c.id), ['snake'], 'only the awake snake tops a purge up');
  assert.ok(CAST_13.every((c) => c.enemy === 'snake'));
  for (const p of W1_TRAP_PAIRS) assert.deepEqual([p.minApart, p.maxApart], [85, 130], p.id);
});

test('a clean roll on both settings: no throw, no error, the lesson and a signature gallery in each, a purge laid to its quota', () => {
  each((r, name) => {
    assert.equal(r.thrown, undefined, `${name}: ${r.thrown}`);
    assert.deepEqual(r.errors, [], name);
    assert.ok(r.plan.includes('lib-trap-teach') && r.plan.some((t) => t.startsWith('lib-trap-gallery')), `${name}: ${r.plan.join(' ')}`);
    assert.ok(r.snakes.length >= (name.endsWith('easy') ? 8 : 12), `${name}: ${r.snakes.length} snakes`);
    assert.ok(r.seconds! >= 120 && r.fast! >= 120, `${name}: ${r.seconds} s typical, ${r.fast} s fast (a stage takes 2 minutes)`);
  });
});

test("the stage carries its cast: proto.cast.kinds is ['snake'], and Dot says the story keeper's line once", () => {
  assert.equal(kitLib13(O).manifest.tips!.traps, TRAP_LINE);
  // (her line for the first trap sprung rides on the built stage, from World 1's own data: the builder keeps it with the cast)
  const built: Any = buildGen2Stage({ config: config13(O) as Any, kit: kitLib13(O) as Any, seed: SEEDS[0], difficulty: 'normal' });
  assert.deepEqual(built.proto.cast.said, W1_CAST_SAID);
  assert.equal(W1_CAST_SAID.trap, 'Off he glides, not a scratch, just very offended!', "the story keeper's words, verbatim");
  each((r, name) => {
    assert.deepEqual(r.kinds, ['snake'], name);
    assert.deepEqual(r.said.filter((m) => m === 'traps'), ['traps'], name);
    assert.deepEqual(r.said.filter((m) => REFUSE_13.some((x) => m.startsWith(x))), [], `${name}: a line or prop the stage refuses came with a shape`);
  });
});

test('the first snake of the stage is asleep on both settings, under the lesson hive', () => {
  each((r, name) => {
    assert.equal(r.firstAsleep, true, `${name}: the first snake, at x ${r.snakes[0]?.x}, is awake`);
    const lesson = r.traps.find((t) => t.section === 'lib-trap-teach');
    assert.ok(lesson?.snake?.asleep && lesson.snake.x === r.snakes[0].x && lesson.load === 'hive' && lesson.kind === 'vine', `${name}: ${JSON.stringify(lesson)}`);
  });
});

test("every trap has its handle and a snake under it, at the phone's numbers", () => {
  each((r, name) => {
    assert.ok(r.traps.length >= 2, `${name}: ${r.traps.length} traps`);
    assert.ok(r.traps.length <= r.loads, name);
    for (const t of r.traps) {
      assert.ok(Number.isFinite(t.x) && Number.isFinite(t.y), `${name}: trap ${t.id} has no handle`);
      assert.ok(t.snake && Math.abs(t.snake.x - t.loadX) <= UNDER, `${name}: trap ${t.id} at x ${t.loadX} hangs over nothing`);
      assert.ok(t.snake.patrol[0] <= t.loadX && t.snake.patrol[1] >= t.loadX, `${name}: trap ${t.id}'s load is off its snake's patrol ${t.snake.patrol}`);
    }
    for (const d of r.reach) assert.ok(d >= 140 && d <= 190, `${name}: a handle ${d} px from its hung load (140-190)`);
    for (const d of r.clear) assert.ok(d >= 105, `${name}: a handle ${d} px from a snake's patrol (its strike is 105)`);
    for (const w of r.patrolW) assert.ok(w >= 100 && w <= 135, `${name}: a trapped snake's patrol is ${w} px`);
    for (const d of r.patrolFar) assert.ok(d <= 170, `${name}: a trapped snake walks ${d} px from its load (the scare is 170)`);
  });
  assert.ok(rolls.normal.every((r) => r.traps.some((t) => t.snake && !t.snake.asleep)), 'a Normal roll with no trap over an awake snake');
});

test('arming: with w1Cast.ts\'s emitters alone Easy hangs loads over branches its 60% cut emptied; armed, such a load is no trap', () => {
  const raw = SEEDS.map((s) => roll(s, 'easy', { ...O, rawTraps: true }));
  assert.ok(raw.reduce((n, r) => n + r.noSnake, 0) > 0, 'the raw emitters left no load over nothing on these seeds: the reason for arming is gone, look again');
  assert.equal(rolls.easy.reduce((n, r) => n + r.noSnake + r.noHandle, 0), 0);
  raw.forEach((r, i) => assert.equal(r.traps.length - r.noSnake, rolls.easy[i].traps.length, `seed ${SEEDS[i]}: arming changed more than the empty loads`));
});

test('the plain-view rule is the builder\'s own: a pickup laid in front of a hung load refuses the roll by name', () => {
  // (the same roll with one petal planted under its first trap's load, built again through the real builder)
  const kit = kitLib13(O);
  const k2 = { ...kit, emit: { ...kit.emit, 'trap-hive': (f: Any, p: Any, out: Any) => { kit.emit!['trap-hive'](f, p, out); out.collectibles.push({ id: 99000 + out.collectibles.length, type: 'flower', x: f.x + 60, y: f.y - 34, collected: false, bobPhase: 0 }); } } };
  const st: Any = buildGen2Stage({ config: config13(O) as Any, kit: k2 as Any, seed: SEEDS[0], difficulty: 'normal' });
  assert.ok(st.gen2.errors.some((e: string) => e.startsWith('trap.hidden')), st.gen2.errors.join(' | '));
  const clean: Any = buildGen2Stage({ config: config13(O) as Any, kit: kit as Any, seed: SEEDS[0], difficulty: 'normal' });
  assert.deepEqual(clean.gen2.errors.filter((e: string) => e.startsWith('trap.')), [], 'and the roll as laid has no trap fault');
});
