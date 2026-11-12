// 1-3 "Branch Snakes" laid test-side from the piece library, held (W1C-lay, tools/engine/library13.ts): 1-3's brief (a purge, its cast
// the snake, its twist drop traps) rolled from World 1's EXISTING sections picked by need, World 1's cast rows and trap pairs
// (gen2/worlds/w1Cast.ts) and the drop-trap bricks. Tool-side: nothing the game ships sets these rows.
//   npx tsx --test tools/engine/library13.test.ts          (about half a minute)
import test from 'node:test';
import assert from 'node:assert/strict';
import { CAST_13, LINES_13, MISSION_13, TWISTS, REFUSE_13, UNDER, config13, kitLib13, poolReport, roll, stageIdOf, type Roll13 } from './library13.ts';
import { NEW_STOOD_IN } from './library.ts';
import { buildGen2Stage, missionGraph, planBudget, stagePool } from '../../src/game/gen2/pipeline.ts';
type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any
import { w1World } from '../../src/game/gen2/worlds/w1.ts';
import { W1_CAST_CREATURES, W1_CAST_SAID, W1_TRAP_PAIRS } from '../../src/game/gen2/worlds/w1Cast.ts';

const O = { flown: true };
/** pinned: these seeds roll clean on both settings (120 of them were measured, 11-12: 119 clean a setting) */
const SEEDS = [1, 2, 3, 4, 5, 6];
const rolls: Record<'normal' | 'easy', Roll13[]> = { normal: SEEDS.map((s) => roll(s, 'normal', O)), easy: SEEDS.map((s) => roll(s, 'easy', O)) };
const each = (f: (r: Roll13, name: string) => void) => { for (const d of ['normal', 'easy'] as const) rolls[d].forEach((r, i) => f(r, `seed ${SEEDS[i]} ${d}`)); };

test("1-1's and 1-2's kits are untouched, and 1-3's pool is its own arc: its seven beats, and of World 1's library only the quiet between them", () => {
  const W = w1World().manifest, M = kitLib13(O).manifest, own = new Map(W.sections.map((t) => [t.id, t]));
  assert.equal(W.creatures.length, 0);
  assert.equal(W.pairs.length, 0, 'World 1 gained a pair');
  for (const t of M.sections.filter((q) => own.has(q.id))) {
    const { feel: _f, ...mine } = t, { feel: _g, ...theirs } = own.get(t.id)!;
    assert.deepEqual(mine, theirs, `${t.id}: a World 1 section was changed`);
    assert.ok(t.jobs!.every((j) => ['arrive', 'rest', 'exit'].includes(j)), `${t.id} is not a quiet section: it would bring another level's lesson into this one (LEVEL-BAR A3)`);
  }
  assert.deepEqual(TWISTS.map((t) => `${t.id}:${t.jobs!.join('/')}`), ['lib-13-lesson:teach', 'lib-13-again:practise', 'lib-13-stone-stair:flow', 'lib-13-other-way:test', 'lib-13-perch:twist', 'lib-13-gallery:signature', 'lib-13-finale:combine'], 'one brick a beat, one job a brick');
  assert.equal(M.sections.length - M.sections.filter((q) => own.has(q.id)).length, TWISTS.length + NEW_STOOD_IN.length);
  assert.deepEqual(poolReport(O).out.filter((q) => q.why === 'refused: '), [], 'a section is out with no reason named');
});

test("the cast rows are w1Cast.ts's, plus the short-patch rows and the top-up tag; a pair's sockets stand 85-130 px apart", () => {
  for (const c of W1_CAST_CREATURES) { const { tags: _t, ...a } = CAST_13.find((q) => q.id === c.id)!, { tags: _u, ...b } = c; assert.deepEqual(a, b, c.id); }
  assert.deepEqual(CAST_13.filter((c) => c.tags?.includes('topup')).map((c) => c.id), ['snake'], 'only the awake snake tops a purge up');
  assert.ok(CAST_13.every((c) => c.enemy === 'snake'));
  for (const p of W1_TRAP_PAIRS) assert.deepEqual([p.minApart, p.maxApart], [85, 130], p.id);
});

test('every roll is the designed level, on both settings: no throw, no error, the arc beat for beat, a purge laid to its quota, three minutes', () => {
  each((r, name) => {
    assert.equal(r.thrown, undefined, `${name}: ${r.thrown}`);
    assert.deepEqual(r.errors, [], name);
    // EVERY roll is the designed level (reference/design/1-3.md; LEVEL-BAR E13): the same thirteen beats in the same order
    const beat = (t: string) => (t.startsWith('lib-13-') ? t.slice(7) : TWISTS.length && /^w1-|^new-/.test(t) ? 'quiet' : t);
    assert.deepEqual(r.plan.map(beat), ['quiet', 'lesson', 'again', 'stone-stair', 'quiet', 'other-way', 'quiet', 'perch', 'quiet', 'gallery', 'quiet', 'finale', 'quiet'], name);
    assert.ok(r.snakes.length >= (name.endsWith('easy') ? 8 : 12), `${name}: ${r.snakes.length} snakes`);
    assert.ok(r.seconds! >= 120 && r.fast! >= 120, `${name}: ${r.seconds} s typical, ${r.fast} s fast (a stage takes 2 minutes)`);
  });
});

test("the stage carries its cast: proto.cast.kinds is ['snake'], and Dot says the story keeper's line once", () => {
  assert.deepEqual(LINES_13, { traps: 'See that hive? Punch the vine, down it comes!', 'traps.then': "Don't worry, it only gives him a fright.", bare: 'No vine? Walk him to the end of his branch.' }, "the story keeper's words, verbatim");
  for (const [id, words] of Object.entries(LINES_13)) assert.equal(kitLib13(O).manifest.tips![id], words);
  assert.equal(MISSION_13, 'Clear the branches. Shake a vine and the snakes glide off.');
  // (her line for the first trap sprung rides on the built stage, from World 1's own data: the builder keeps it with the cast)
  const built: Any = buildGen2Stage({ config: config13(O) as Any, kit: kitLib13(O) as Any, seed: SEEDS[0], difficulty: 'normal' });
  assert.deepEqual(built.proto.cast.said, W1_CAST_SAID);
  assert.equal(W1_CAST_SAID.trap, 'Off he glides, not a scratch, just very offended!', "the story keeper's words, verbatim");
  each((r, name) => {
    assert.deepEqual(r.kinds, ['snake'], name);
    // (the keeper's three lines, each once, in the level's order: the lesson's two at its flag, then the bare branch's)
    assert.deepEqual(r.said.filter((m) => m in LINES_13), ['traps', 'traps.then', 'bare'], name);
    assert.deepEqual(r.said.filter((m) => REFUSE_13.some((x) => m.startsWith(x))), [], `${name}: a line or prop the stage refuses came with a shape`);
  });
});

test('the first snake of the stage is asleep on both settings, under the lesson hive', () => {
  each((r, name) => {
    assert.equal(r.firstAsleep, true, `${name}: the first snake, at x ${r.snakes[0]?.x}, is awake`);
    const lesson = r.traps.find((t) => t.section === 'lib-13-lesson');
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

test('the arc is dealt the same on every seed: the lesson and its practice on the ground, the stair and the perch a climb, the two no-trap beats a hazard', () => {
  const kit = kitLib13(O), cfg = config13(O) as Any;
  const M = { ...kit.manifest, sections: stagePool(kit.manifest, cfg.id) } as Any;
  const want = 'teach:ground practise:ground flow:climb test:hazard twist:climb combine:hazard';
  for (let seed = 1; seed <= 40; seed++) {
    const g = missionGraph(planBudget(cfg, M, 'normal'), M, seed);
    assert.equal(g.nodes.filter((n) => n.content).map((n) => `${n.job}:${n.content}`).join(' '), want, `seed ${seed}`);
    assert.deepEqual(g.nodes.map((n) => n.job), ['arrive', 'teach', 'practise', 'flow', 'rest', 'test', 'rest', 'twist', 'rest', 'signature', 'rest', 'combine', 'exit'], `seed ${seed}: the arc's order`);
  }
});

test('Normal runs hotter and asks for one real jump; Easy is the same level, flat and gentler', () => {
  const awake = (r: Roll13, from: number, to: number) => r.snakes.filter((q) => q.x >= from && q.x < to && !q.asleep).length;
  SEEDS.forEach((seed, k) => {
    const n: Any = buildGen2Stage({ config: config13(O) as Any, kit: kitLib13(O) as Any, seed, difficulty: 'normal' });
    const e: Any = buildGen2Stage({ config: config13(O) as Any, kit: kitLib13(O) as Any, seed, difficulty: 'easy' });
    const sec = (st: Any, id: string) => st.gen2.sections.find((q: Any) => q.template === id);
    const rn = rolls.normal[k];
    assert.equal(rn.snakes.filter((q) => q.asleep).length, 4, `seed ${seed}: Normal's sleepers are the lesson's, the two at the bare branches' ends and the gallery's middle one`);
    for (const [id, want] of [['lib-13-perch', 2], ['lib-13-gallery', 2], ['lib-13-finale', 2]] as const) { const q = sec(n, id); assert.equal(awake(rn, q.x0, q.x1), want, `seed ${seed}: ${id} holds ${want} awake snakes on Normal`); }
    // (the one jump that matters: a gap in Normal's finale and nowhere else in the level; none at all on Easy)
    const gaps = (st: Any, q: Any): number[] => (st.gen2.drops ?? []).filter((d: Any) => d.x0 >= q.x0 && d.x1 <= q.x1).map((d: Any) => Math.round(d.x1 - d.x0));
    const all = (st: Any): number => (st.gen2.drops ?? []).length;
    const hops = gaps(n, sec(n, 'lib-13-finale'));
    assert.ok(hops.length === 1 && hops[0] >= 90 && hops[0] <= 110, `seed ${seed}: one hop of 90-110 px in Normal's finale (${hops.join(' ')})`);
    assert.deepEqual(gaps(e, sec(e, 'lib-13-finale')), [], `seed ${seed}: Easy's finale is flat`);
    // (the seams between sections and World 1's own rest banks lay a few soft dips of their own: the level's bricks lay no other)
    for (const id of TWISTS.map((t) => t.id).filter((t) => t !== 'lib-13-finale')) assert.deepEqual(gaps(n, sec(n, id)), [], `seed ${seed}: ${id} is level on Normal`);
    void all;
  });
});
