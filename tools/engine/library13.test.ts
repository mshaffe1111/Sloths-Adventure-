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
import { W1_KIT, W1_SECTIONS, w1World } from '../../src/game/gen2/worlds/w1.ts';
import { EXIT_13, QUIET_OWN_13, STAGE_13 } from '../../src/game/gen2/worlds/w1Arc13.ts';
import { STAGE_PLAN } from '../../src/game/stagePlan.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { GOAL_SHARE, easyFloor } from '../../src/game/goals.ts';
const w1BriefOf11 = () => W1_KIT.graphs.briefs['1-1'];
import { W1_CAST_CREATURES, W1_CAST_SAID, W1_TRAP_EMIT, W1_TRAP_PAIRS, armedTraps } from '../../src/game/gen2/worlds/w1Cast.ts';
import { TRUNK_TIE, trunkScale } from '../../src/game/castArt.ts';
import { W1_TRAP_FRAMES, W1_TRAP_MEASURES } from '../../src/game/w1TrapsData.ts';

// (the SHIPPED kit under 1-3's own id. Until 11-12 afternoon these rolls were filed under 1-1's id to borrow its flown rows; 1-3's
//  pieces are its own now (`own`) and no other id's pool holds them. Its row is not marked `judged` yet (P13's): these rolls lay to
//  the unflown reach; marked, they are as clean, tried 11-12)
const O = {};
/** the eight beat bricks' ids */
const ARC_IDS = new Set(TWISTS.map((t) => t.id));
/** pinned: these seeds roll clean on both settings (120 of them were measured, 11-12: 119 clean a setting) */
const SEEDS = [1, 2, 3, 4, 5, 6];
const rolls: Record<'normal' | 'easy', Roll13[]> = { normal: SEEDS.map((s) => roll(s, 'normal', O)), easy: SEEDS.map((s) => roll(s, 'easy', O)) };
const each = (f: (r: Roll13, name: string) => void) => { for (const d of ['normal', 'easy'] as const) rolls[d].forEach((r, i) => f(r, `seed ${SEEDS[i]} ${d}`)); };

test("in World 1's SHIPPED kit 1-3's pool is its own, every piece: its eight beats, its arrival, its four rests and its exit, and nothing of World 1's library; 1-1's pool is as it was", () => {
  const M = w1World().manifest;
  const pool13 = stagePool(M, STAGE_13).map((t) => t.id).sort();
  assert.deepEqual(pool13, [...TWISTS.map((t) => t.id), EXIT_13.id, ...QUIET_OWN_13.map((t) => t.id)].sort());
  // (funcheck read 1-3 as "an earlier stage" while its links were World 1's meadow and fern bank: none is in its pool, and no stage
  //  but 1-3 has one of 1-3's)
  assert.equal(stagePool(M, STAGE_13).filter((t) => W1_SECTIONS.some((q) => q.id === t.id)).length, 0, "a World 1 library section is in 1-3's pool");
  assert.ok(pool13.every((id) => id.startsWith('w1-13-')));
  // (and none of 1-3's pieces is in another stage's pool, a stage PICKED BY NEED included: `own`. The test-side 1-2 picks World 1's
  //  whole library by need, and took 1-3's exit, rope and hollow, for its own: doubleTaught.test went red on it)
  assert.ok(stagePool(M, STAGE_13).every((t) => t.own), "one of 1-3's pieces is not marked its own");
  const picked = { ...M, graphs: { ...M.graphs!, briefs: { ...M.graphs!.briefs, '1-2': { ...w1BriefOf11(), pick: {} } } } };
  assert.deepEqual(stagePool(picked as Any, '1-2').filter((t) => t.id.startsWith('w1-13-')).map((t) => t.id), [], "a stage picked by need holds 1-3's pieces");
  assert.ok(stagePool(picked as Any, '1-2').length > 40, 'the pick itself still holds the library');
  assert.deepEqual(QUIET_OWN_13.map((t) => `${t.id}:${t.jobs!.join('/')}:${t.phases.join('/')}`), ['w1-13-root-arrival:arrive:start', 'w1-13-long-log:rest:rest', 'w1-13-twin-logs:rest:rest', 'w1-13-root-dip:rest:rest', 'w1-13-root-hump:rest:rest'], 'one arrival, and a rest of its own for each of the four breaths');
  // nothing in a quiet piece can hurt: it holds no animal socket and no trap, only petals
  for (const t of QUIET_OWN_13) for (const v of t.subBlocks![0].versions) assert.ok(v.sockets!.every((k) => k.role === 'pickup'), `${t.id}/${v.id}: a quiet piece holds more than petals`);
  assert.deepEqual(TWISTS.map((t) => `${t.id}:${t.jobs!.join('/')}`), ['w1-13-lesson:teach', 'w1-13-again:practise', 'w1-13-stone-stair:flow', 'w1-13-other-way:test', 'w1-13-perch:twist', 'w1-13-gallery:signature', 'w1-13-two-snakes:reward', 'w1-13-finale:combine'], 'one brick a beat, one job a brick');
  // (1-1: the same sections as World 1's own table, each unchanged but for its tag list; none of 1-3's among them)
  const own = new Map(W1_SECTIONS.map((t) => [t.id, t]));
  const pool11 = stagePool(M, '1-1');
  assert.deepEqual(pool11.map((t) => t.id), W1_SECTIONS.filter((t) => t.feel.includes('1-1')).map((t) => t.id));
  for (const t of pool11) { const { feel: _f, ...mine } = t, { feel: _g, ...theirs } = own.get(t.id)!; assert.deepEqual(mine, theirs, `${t.id}: a World 1 section was changed`); }
  assert.deepEqual(M.graphs!.list.filter((g) => g.archetype !== 'purge').map((g) => g.id), ['sprint-A', 'sprint-B', 'sprint-C', 'sprint-D'], "1-1's graphs");
  assert.deepEqual(M.graphs!.briefs['1-1'], w1BriefOf11(), "1-1's brief");
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
    // EVERY roll is the designed level (reference/design/1-3.md; LEVEL-BAR E13): the same fourteen beats in the same order
    const beat = (t: string) => (ARC_IDS.has(t) ? t.slice('w1-13-'.length) : /^w1-|^new-/.test(t) ? 'quiet' : t);
    assert.deepEqual(r.plan.map(beat), ['quiet', 'lesson', 'again', 'stone-stair', 'quiet', 'other-way', 'quiet', 'perch', 'quiet', 'gallery', 'quiet', 'two-snakes', 'finale', 'quiet'], name);
    assert.ok(r.snakes.length >= (name.endsWith('easy') ? 10 : 12), `${name}: ${r.snakes.length} snakes`);
    assert.ok(r.seconds! >= 120 && r.fast! >= 120, `${name}: ${r.seconds} s typical, ${r.fast} s fast (a stage takes 2 minutes)`);
  });
});

test("the stage carries its cast: proto.cast.kinds is ['snake'], and Dot says the story keeper's line once", () => {
  assert.deepEqual(LINES_13, { traps: 'Snake napping under a hive ahead! Punch the vine!', 'traps.then': "Don't worry, it only gives him a fright.", bare: 'No vine? Walk him to the end of his branch.' }, "the story keeper's words, verbatim");
  // (the kit says the keeper's words: the lesson as ONE card, its two lines together, the lead 11-12; the bare branch's as it is)
  assert.equal(kitLib13(O).manifest.tips!.traps, `${LINES_13.traps} ${LINES_13['traps.then']}`);
  // (the card's exact words, the keeper's: what a player reads at the lesson's flag, where the hive is not on screen yet)
  assert.equal(kitLib13(O).manifest.tips!.traps, "Snake napping under a hive ahead! Punch the vine! Don't worry, it only gives him a fright.");
  assert.equal(kitLib13(O).manifest.tips!.bare, LINES_13.bare);
  assert.equal(MISSION_13, 'Shake every vine, and off the snakes glide.');
  // (and it is the line the game shows for the stage: stagePlan.ts holds its own copy, menu code that imports no stage kit)
  assert.equal(STAGE_PLAN[1][2].name, 'Branch Snakes');
  assert.equal(STAGE_PLAN[1][2].desc, MISSION_13, "the stage plan's mission line is the keeper's");
  // (her line for the first trap sprung rides on the built stage, from World 1's own data: the builder keeps it with the cast)
  const built: Any = buildGen2Stage({ config: config13(O) as Any, kit: kitLib13(O) as Any, seed: SEEDS[0], difficulty: 'normal' });
  assert.deepEqual(built.proto.cast.said, W1_CAST_SAID);
  assert.equal(W1_CAST_SAID.trap, 'Off he glides, not a scratch, just very offended!', "the story keeper's words, verbatim");
  each((r, name) => {
    assert.deepEqual(r.kinds, ['snake'], name);
    // (the keeper's lines, each once, in the level's order: the lesson's card (both its lines) at its flag, then the bare branch's;
    //  the lesson's second line is never a tip of its own, where it could be lost when he walks straight on to the handle)
    assert.deepEqual(r.said.filter((m) => m in LINES_13), ['traps', 'bare'], name);
    assert.deepEqual(r.said.filter((m) => REFUSE_13.some((x) => m.startsWith(x))), [], `${name}: a line or prop the stage refuses came with a shape`);
  });
});

test('the first snake of the stage is asleep on both settings, under the lesson hive', () => {
  each((r, name) => {
    assert.equal(r.firstAsleep, true, `${name}: the first snake, at x ${r.snakes[0]?.x}, is awake`);
    const lesson = r.traps.find((t) => t.section === 'w1-13-lesson');
    assert.ok(lesson?.snake?.asleep && lesson.snake.x === r.snakes[0].x && lesson.load === 'hive' && lesson.kind === 'vine', `${name}: ${JSON.stringify(lesson)}`);
    // a sleeper lies at the end of its patch nearest the vine, on both settings: its load comes down a coil's width BESIDE it, never
    // on it (nobody is hurt), and from the vine the whole of it is on an upright screen. (Seated by the kit's spawn hook; the
    // builder's fill follows it, or Easy reads the sleeper as dropped and lays none)
    for (const t of r.traps) if (t.snake?.asleep && t.section !== 'w1-13-two-snakes') {
      const off = t.loadX - t.snake.x;
      assert.ok(off >= 55 && off <= 70, `${name}: a sleeper ${off} px before its load's line (55-70: the load lands beside it) (${t.section})`);
      assert.ok(t.snake.x - t.x >= 105, `${name}: a sleeper ${t.snake.x - t.x} px from its vine (105 or more: outside its strike)`);
    }
    // the two snakes on a log (F13): one load, both asleep, one coil each side of where it lands and touching neither (a coil's 19 px
    // and a load's 30), the near one outside the vine's strike, the far one whole on an upright screen from the vine (214 px or less)
    const two = r.traps.filter((t) => t.section === 'w1-13-two-snakes');
    assert.equal(two.length, 1, `${name}: the pair's one trap`);
    const [a, b] = two[0].under;
    assert.ok(two[0].under.length === 2 && a.asleep && b.asleep, `${name}: ${JSON.stringify(two[0].under)}`);
    assert.ok(two[0].loadX - a.x >= 50 && b.x - two[0].loadX >= 50, `${name}: the load at ${two[0].loadX} between coils at ${a.x} and ${b.x} (50 px or more from each)`);
    assert.ok(a.x - two[0].x >= 105 && b.x - two[0].x <= 214, `${name}: coils ${a.x - two[0].x} and ${b.x - two[0].x} px from the vine (105 or more; 214 or less)`);
    assert.ok(r.traps.filter((t) => t.snake?.asleep).length >= 2, `${name}: the lesson's and the gallery's sleepers`);
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
      // (C8, a must: from where he stands to shake the vine an upright phone shows 270 px past the handle; a snake is 36 px either
      //  side of its middle, so the far end of its patrol is no more than 230 px from the vine and the snake is whole on screen
      //  wherever it paces. At 232 px its head was cut at the screen's edge)
      const far = Math.max(Math.abs(t.snake.patrol[0] - t.x), Math.abs(t.snake.patrol[1] - t.x));
      assert.ok(far <= 230, `${name}: trap ${t.id}: its snake paces ${Math.round(far)} px from the vine (230 or less: whole on an upright screen)`);
    }
    for (const d of r.reach) assert.ok(d >= 140 && d <= 190, `${name}: a handle ${d} px from its hung load (140-190)`);
    for (const d of r.clear) assert.ok(d >= 105, `${name}: a handle ${d} px from a snake's patrol (its strike is 105)`);
    for (const w of r.patrolW) assert.ok(w >= 100 && w <= 135, `${name}: a trapped snake's patrol is ${w} px`);
    for (const d of r.patrolFar) assert.ok(d <= 170, `${name}: a trapped snake walks ${d} px from its load (the scare is 170)`);
  });
  assert.ok(rolls.normal.every((r) => r.traps.some((t) => t.snake && !t.snake.asleep)), 'a Normal roll with no trap over an awake snake');
});

test('arming: a load is a trap only when an animal of the cast stands under it; the trap is hung over the middle of that animal\'s patch', () => {
  // (the hooks themselves, on a bare sink: Easy's count cut once emptied four of 1-3's nine trapped branches and the raw emitters hung
  //  a hive over each; since the trap's own snake stays on Easy (Socket.easy 'stay') no roll shows it, so the rule is held here)
  const snake = W1_CAST_CREATURES.find((c) => c.id === 'snake-trapped')!;
  const lay = (animalAt: number | null, kind = 'snake') => {
    const { emit, spawn } = armedTraps();
    const out: Any = { proto: {} };
    emit['trap-hive']({ x: 1110, y: 500 } as Any, {} as Any, out);
    emit['trap-vine']({ x: 1000, y: 500 } as Any, {} as Any, out);
    if (animalAt !== null) spawn({ type: kind, x: animalAt, y: 500 - (snake.footY ?? snake.h / 2), patrolMinX: 1110, patrolMaxX: 1232 } as Any, snake, out);
    return (out.proto.cast?.traps ?? []) as Array<{ x: number; loadX: number; load: string; kind: string }>;
  };
  assert.deepEqual(lay(null), [], 'a load over an empty branch is no trap');
  assert.deepEqual(lay(1232, 'squirrel'), [], 'nor is one over an animal that is not of the cast');
  const [t] = lay(1232);
  assert.ok(t, 'the snake under the load arms it');
  assert.equal(t.x, 1000);
  assert.equal(t.loadX, 1171, 'hung over the middle of its patch, not at the load socket');
  // (raw, the same lay hangs the hive whether or not anything is under it)
  const raw: Any = { proto: {} };
  W1_TRAP_EMIT['trap-hive']({ x: 1110, y: 500 } as Any, {} as Any, raw);
  W1_TRAP_EMIT['trap-vine']({ x: 1000, y: 500 } as Any, {} as Any, raw);
  assert.equal(raw.proto.cast.traps.length, 1);
  // and on the rolls: every load hung is armed, on both settings
  each((r, name) => assert.equal(r.noSnake + r.noHandle, 0, name));
});

test('Easy keeps every trap: the snake under a load stays on Easy, softened (Socket.easy stay), and Easy is still never the harder', () => {
  SEEDS.forEach((seed, i) => {
    const n = rolls.normal[i], e = rolls.easy[i];
    assert.equal(e.traps.length, n.traps.length, `seed ${seed}: Easy ${e.traps.length} traps, Normal ${n.traps.length}`);
    assert.ok(e.traps.length >= 9, `seed ${seed}: ${e.traps.length} traps`);
    assert.ok(e.snakes.length < n.snakes.length, `seed ${seed}: Easy ${e.snakes.length} snakes, Normal ${n.snakes.length}: the bare ones are still cut`);
  });
});

test("Dot's trap line is a TEACH line, and she says it three seconds of walking before the first vine, on both settings", () => {
  // (P13's bots, 11-12: said 232 px before the handle, a first-timer walking 265 px a second had passed the vine before he had read it)
  for (const d of ['normal', 'easy'] as const) for (const seed of SEEDS) {
    const st: Any = buildGen2Stage({ config: generateAllLevels().find((l) => l.id === STAGE_13 && !l.secret)! as Any, kit: w1World() as Any, seed, difficulty: d });
    const hint = st.proto.hints.find((h: Any) => h.text === `${LINES_13.traps} ${LINES_13['traps.then']}`);
    assert.ok(hint, `seed ${seed} ${d}: the lesson's card is laid, both its lines on it`);
    assert.ok(!st.proto.hints.some((h: Any) => h.text === LINES_13['traps.then']), `seed ${seed} ${d}: the second line is never a tip alone`);
    assert.equal(hint.teach, true, `seed ${seed} ${d}: a teach line (WorldManifest.teachTips)`);
    const first = [...st.proto.cast.traps].sort((a: Any, b: Any) => a.x - b.x)[0];
    assert.ok(first.x - hint.x >= 800, `seed ${seed} ${d}: her line is ${Math.round(first.x - hint.x)} px before the first vine (800 and more: 3 s at a walk)`);
    assert.ok(first.x - hint.x <= 1100, `seed ${seed} ${d}: and not a screen and more early (${Math.round(first.x - hint.x)} px)`);
    // nothing can hurt him between her line and the vine: no animal stands before the first trap's own
    assert.equal(st.enemies.filter((e: Any) => e.x < first.x).length, 0, `seed ${seed} ${d}: an animal before the first vine`);
  }
});

test('the way out: one rope before the totem, a try-it and never the way, a vine between two living trees on its banks; its hollow is one hop deep, so he can walk through it and back', () => {
  // (clearing 1-3 TEACHES Shimmy Rope: on a first visit he cannot grab it. A required rope would strand him; so would a deep hollow
  //  with steps out the far side only, in a purge: the adult bot arrived owing four snakes, dropped in, and could not go back)
  for (const d of ['normal', 'easy'] as const) for (const seed of SEEDS) {
    const st: Any = buildGen2Stage({ config: generateAllLevels().find((l) => l.id === STAGE_13 && !l.secret)! as Any, kit: w1World() as Any, seed, difficulty: d });
    assert.equal(st.ropes.length, 1, `seed ${seed} ${d}: ${st.ropes.length} ropes`);
    const r = st.ropes[0];
    assert.equal(r.required, false, `seed ${seed} ${d}: the rope is required`);
    assert.ok(r.x1 < st.exitTotemX && st.exitTotemX - r.x1 < 1400, `seed ${seed} ${d}: it is the last thing before the totem (${Math.round(st.exitTotemX - r.x1)} px)`);
    assert.ok(st.enemies.every((e: Any) => e.x < r.x0), `seed ${seed} ${d}: no animal at or past the rope`);
    // the hollow under it: one floor, wall to wall, a hop under the two lips and no deeper; nothing else down there
    const under = st.platforms.filter((p: Any) => p.x >= r.x0 && p.x + p.width <= r.x1 && p.y > r.g0);
    assert.equal(under.length, 1, `seed ${seed} ${d}: ${under.length} pieces in the hollow (a floor and no steps)`);
    const depth = under[0].y - r.g0;
    assert.ok(depth >= 40 && depth <= 62, `seed ${seed} ${d}: the hollow is ${Math.round(depth)} px deep (40-62: a tap climbs out of it, PIT.wade)`);
    assert.equal(r.g0, r.g1, `seed ${seed} ${d}: its two lips are level`);
    // (and the rope knows where its ledges are: its ends are the tops of the two ledges it hangs between, on every roll, a roll the
    //  builder shifted down to fit under the camera's top included; they were left 34 px up on such a roll)
    const lip = (x: number) => st.platforms.filter((p: Any) => p.x <= x && p.x + p.width >= x && p.y < under[0].y).sort((a: Any, b: Any) => b.y - a.y)[0];
    assert.equal(lip(r.x0 + 1)?.y, r.g0, `seed ${seed} ${d}: the rope's near end is not on its ledge's top`);
    assert.equal(lip(r.x1 - 1)?.y, r.g1, `seed ${seed} ${d}: the rope's far end is not on its ledge's top`);
    // (a vine between two living trees, World 1's look (the lead, 11-12: posts and a rope are a made thing). Nothing floats: each
    //  tree's whole foot stands on its own bank, at about its usual size, and the far tree stands clear of the totem)
    assert.equal(r.look, 'vine', `seed ${seed} ${d}: the way out's rope is not drawn as a vine`);
    const T = W1_TRAP_MEASURES.trunk, usual = W1_TRAP_FRAMES.trunk.units / W1_TRAP_FRAMES.trunk.h;
    for (const [x, g, reach] of [[r.x0, r.g0, 1], [r.x1, r.g1, -1]] as const) {
      const k = trunkScale(r.y, g);
      assert.ok(Math.abs(k / usual - 1) <= 0.1, `seed ${seed} ${d}: a tree at ${(k / usual).toFixed(2)} of its usual size`);
      const foot = x - reach * (TRUNK_TIE.x - T.foot[0]) * k;
      const bank = lip(x - reach)!;
      assert.ok(foot - (T.footW / 2) * k >= bank.x && foot + (T.footW / 2) * k <= bank.x + bank.width, `seed ${seed} ${d}: the tree's foot ${Math.round(foot - (T.footW / 2) * k)}-${Math.round(foot + (T.footW / 2) * k)} is off its bank ${bank.x}-${bank.x + bank.width}`);
    }
    assert.ok(st.exitTotemX - (r.x1 + TRUNK_TIE.back * trunkScale(r.y, r.g1)) >= 40, `seed ${seed} ${d}: the far tree stands in front of the totem`);
  }
});

test('the goal is every vine: Matt\'s share of the animals (three in four) comes to the snakes the vines send gliding on Normal, so a child who shakes every vine never walks back', () => {
  // (the lead's ruling, 11-12: the level's idea is that he does not have to fight; the bare logs' snakes are his choice. It holds by
  //  the counts themselves, with no number set for this stage anywhere: 12 vines, the pair's one sending two, 13 snakes, and 4 bare
  //  ones, 17 in all (F13: the goal sign counts snakes, so "every trap" is the 13 they clear, never 12, which would sit under Matt's 75%))
  SEEDS.forEach((seed, k) => {
    const n = rolls.normal[k], e = rolls.easy[k];
    assert.equal(n.traps.length, 12, `seed ${seed}: ${n.traps.length} traps on Normal`);
    const cleared = new Set(n.traps.flatMap((t) => t.under.map((q) => q.x))).size;
    assert.equal(Math.round(n.snakes.length * GOAL_SHARE.defeat), cleared, `seed ${seed}: the goal ${Math.round(n.snakes.length * GOAL_SHARE.defeat)} of ${n.snakes.length} snakes; every vine clears ${cleared}`);
    // the lesson holds two sleepers under two hives (hers, then his own first try), beat 2 a hive and then a stone on a tendril
    const at = (id: string) => n.traps.filter((t) => t.section === id).map((t) => `${t.kind}-${t.load}${t.snake?.asleep ? '-asleep' : ''}`);
    assert.deepEqual(at('w1-13-lesson'), ['vine-hive-asleep', 'vine-hive-asleep'], `seed ${seed}`);
    assert.deepEqual(at('w1-13-again'), ['vine-hive', 'tendril-stone'], `seed ${seed}`);
    // Easy: every trap too, and its goal (65% of what it holds) is under its traps
    assert.equal(e.traps.length, 12, `seed ${seed}: ${e.traps.length} traps on Easy`);
    assert.ok(easyFloor(e.snakes.length) <= e.traps.length, `seed ${seed}: Easy's goal ${easyFloor(e.snakes.length)} of ${e.snakes.length}`);
  });
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
  // (the two snakes on a log are the graph's reward job, H: no content type, outside the deal's mix, its order held below)
  const want = 'teach:ground practise:ground flow:climb test:hazard twist:climb combine:hazard';
  for (let seed = 1; seed <= 40; seed++) {
    const g = missionGraph(planBudget(cfg, M, 'normal'), M, seed);
    assert.equal(g.nodes.filter((n) => n.content).map((n) => `${n.job}:${n.content}`).join(' '), want, `seed ${seed}`);
    assert.deepEqual(g.nodes.map((n) => n.job), ['arrive', 'teach', 'practise', 'flow', 'rest', 'test', 'rest', 'twist', 'rest', 'signature', 'rest', 'reward', 'combine', 'exit'], `seed ${seed}: the arc's order`);
  }
});

test('Normal runs hotter and asks for one real jump; Easy is the same level, flat and gentler', () => {
  const awake = (r: Roll13, from: number, to: number) => r.snakes.filter((q) => q.x >= from && q.x < to && !q.asleep).length;
  SEEDS.forEach((seed, k) => {
    const n: Any = buildGen2Stage({ config: config13(O) as Any, kit: kitLib13(O) as Any, seed, difficulty: 'normal' });
    const e: Any = buildGen2Stage({ config: config13(O) as Any, kit: kitLib13(O) as Any, seed, difficulty: 'easy' });
    const sec = (st: Any, id: string) => st.gen2.sections.find((q: Any) => q.template === id);
    const rn = rolls.normal[k];
    assert.equal(rn.snakes.filter((q) => q.asleep).length, 7, `seed ${seed}: Normal's sleepers are the lesson's two (hers, then "now you"), the two at the bare branches' ends, the gallery's middle one and the two snakes on a log`);
    for (const [id, want] of [['w1-13-perch', 2], ['w1-13-gallery', 2], ['w1-13-finale', 2]] as const) { const q = sec(n, id); assert.equal(awake(rn, q.x0, q.x1), want, `seed ${seed}: ${id} holds ${want} awake snakes on Normal`); }
    // (the one jump that matters: a gap in Normal's finale and nowhere else in the level; none at all on Easy)
    const gaps = (st: Any, q: Any): number[] => (st.gen2.drops ?? []).filter((d: Any) => d.x0 >= q.x0 && d.x1 <= q.x1).map((d: Any) => Math.round(d.x1 - d.x0));
    const all = (st: Any): number => (st.gen2.drops ?? []).length;
    const hops = gaps(n, sec(n, 'w1-13-finale'));
    assert.ok(hops.length === 1 && hops[0] >= 90 && hops[0] <= 110, `seed ${seed}: one hop of 90-110 px in Normal's finale (${hops.join(' ')})`);
    assert.deepEqual(gaps(e, sec(e, 'w1-13-finale')), [], `seed ${seed}: Easy's finale is flat`);
    // (the seams between sections and World 1's own rest banks lay a few soft dips of their own: the level's bricks lay no other)
    for (const id of TWISTS.map((t) => t.id).filter((t) => t !== 'w1-13-finale')) assert.deepEqual(gaps(n, sec(n, id)), [], `seed ${seed}: ${id} is level on Normal`);
    void all;
  });
});

test('the shipped kit rolls 1-3 under its own id: the same arc, clean on both settings (not yet the verdicts\' clean: it has no flown rows of its own)', () => {
  for (const seed of SEEDS) for (const d of ['normal', 'easy'] as const) {
    const r = roll(seed, d, {});
    assert.equal(r.thrown, undefined, `seed ${seed} ${d}: ${r.thrown}`);
    assert.deepEqual(r.errors, [], `seed ${seed} ${d}`);
    assert.deepEqual(r.plan.filter((t) => ARC_IDS.has(t)).map((t) => t.slice('w1-13-'.length)), ['lesson', 'again', 'stone-stair', 'other-way', 'perch', 'gallery', 'two-snakes', 'finale'], `seed ${seed} ${d}`);
    assert.equal(r.plan.length, 14, `seed ${seed} ${d}`);
    assert.equal(r.plan[r.plan.length - 1], EXIT_13.id);
  }
});

test("the seed list's quiet line holds on the game's own roll: nowhere on 1-3 are 4 s or more with nothing to do (Normal, seeds 1-6)", async () => {
  // (P13 and F13, 11-12: the stair's way down and every rest were 4-11 s of plain walking (a step down and a 25 px log are no hop),
  //  so no seed could be listed. Each piece now has a root hop near both ends and every few hundred px, and ends level)
  await import('../../src/game/headlessDom.ts');
  const { RealPlay } = await import('../../src/game/realPlay.ts');
  const { setDifficulty } = await import('../../src/game/difficulty.ts');
  const { quietOf } = await import('./listRules.ts');
  const { QUIET_MAX } = await import('../../src/game/gen2/seedList.ts');
  setDifficulty('normal');
  for (const seed of SEEDS) {
    const st = new RealPlay(STAGE_13, seed).stage as Any;
    const q = quietOf(st.config, st);
    assert.ok(q.quiet <= QUIET_MAX, `seed ${seed}: ${q.quiet} s with nothing to do at x ${Math.round(q.x)} (the list's line: ${QUIET_MAX} s)`);
  }
});

test("every quiet piece of 1-3's own keeps a root hop near both ends and every few hundred px (the quiet line, by the pieces themselves)", () => {
  // (the roll test above sees the worst stretch of six seeds; this holds every version of every rest and the arrival, whatever lies
  //  next to it: before its first hop up and from its last hop up to its end at most 520 px each, so two pieces joined stay under
  //  4 s, and at most 1,100 px between two hops (4 s at a walk: the seed list's line, QUIET_MAX). A step down and a log lying on a bank
  //  are walked, not hopped. (World 1's FR10 asks 850 px inside a section: the arrival's root-steps is 960, named in F13's report)
  const UPS = (p: Any) => p.shape !== 'block' && Array.isArray(p.place?.dy) && p.place.dy[1] < -40;
  for (const t of QUIET_OWN_13) for (const v of t.subBlocks![0].versions) {
    const ps = [t.pieces[0], ...v.pieces].filter((p: Any) => p.shape !== 'block');
    const w = (p: Any) => (Array.isArray(p.w) ? p.w[1] : p.w) as number;
    const ups = ps.map((p, i) => (UPS(p) ? i : -1)).filter((i) => i >= 0);
    assert.ok(ups.length >= 1, `${t.id}/${v.id}: no hop at all`);
    const run = (a: number, b: number) => ps.slice(a, b).reduce((s, p) => s + w(p), 0);
    assert.ok(run(0, ups[0]) <= 520, `${t.id}/${v.id}: ${run(0, ups[0])} px before its first hop`);
    assert.ok(run(ups[ups.length - 1], ps.length) <= 520, `${t.id}/${v.id}: ${run(ups[ups.length - 1], ps.length)} px from its last hop to its end`);
    for (let k = 1; k < ups.length; k++) assert.ok(run(ups[k - 1], ups[k]) <= 1100, `${t.id}/${v.id}: ${run(ups[k - 1], ups[k])} px between two hops`);
  }
});
