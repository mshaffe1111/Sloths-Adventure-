/**
 * The falling limb as a drop-trap load (dropTrap.ts limbGone/limbFaults, castPlay.ts limbGone, engine.ts on a limb giving way; w1Cast.ts
 * World 1's emitter; packet B15 item 2), and her marks as a gen2 goal (pipeline's objective 'mark', goals.ts marks, stagePlan.ts words and
 * the keeper's locked-exit line). Each proven by a planted fault (reference/qa-reports/B15/REPORT.md).
 *   npx tsx --test src/game/limbTrap.test.ts
 */
import './headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { limbGone, newTrap, shake, stepTrap, trapFaults, TRAP } from './dropTrap.ts';
import type { TrapPost } from './castPlay.types.ts';
import { makeEngine, standOn, step } from './engineCoreHarness.ts';
import { GOAL_SHARE, goalHave, marksHeld, normalGoal } from './goals.ts';
import { countWord, goalLine, SEALED_LINES, sealedLine } from './stagePlan.ts';
import { LINES_15, STAGE_15 } from './gen2/worlds/w1Arc15.ts';
import { goalInfo } from '../components/hud/goalInfo.ts';
import { RealPlay } from './realPlay.ts';

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any
const LIMB: TrapPost = { id: 1, kind: 'limb', load: 'limb', limb: 7, w: 130, x: 1000, y: 400, loadX: 1000, loadY: 424, landY: 565 };
const snake = (x0: number, x1: number, y = 565) => ({ x: (x0 + x1) / 2, y, patrolMinX: x0, patrolMaxX: x1 });

test('a limb trap has no handle: a blow never lets it go; its limb giving way does, at once (the creak was the tell), and it lands', () => {
  const s = newTrap(LIMB);
  assert.equal(shake(s), true, 'shake is the vine\'s path; the cast never calls it for a limb (castPlay.strike skips it)');
  const t = newTrap(LIMB);
  assert.equal(limbGone(t), true);
  assert.equal(t.phase, 'falling');
  assert.equal(limbGone(t), false, 'a limb already falling is not let go again');
  let landed = false;
  for (let i = 0; i < 60 && !landed; i++) landed = stepTrap(t, 1 / 30);
  assert.ok(landed && (t.phase as string) === 'down' && t.y === LIMB.landY);
  assert.equal(limbGone(newTrap({ ...LIMB, kind: 'vine', load: 'hive' })), false, 'a vine trap is never let go by a limb');
});

test('a limb trap is laid only where it comes down BESIDE an animal, never on one, and never with no limb', () => {
  assert.deepEqual(trapFaults([LIMB], [], [snake(1120, 1330)]), [], 'a snake 55 px past its end: beside');
  assert.match(trapFaults([LIMB], [], [snake(1300, 1500)]).join(), /over-nothing/, `${TRAP.scare} px is the farthest it chases`);
  assert.match(trapFaults([LIMB], [], [snake(980, 1200)]).join(), /limb-on/, 'its span over the patch: it would land on him');
  assert.match(trapFaults([{ ...LIMB, limb: undefined }], [], [snake(1120, 1330)]).join(), /no-limb/);
});

test('on the real 1-5, he rides the den\'s limb down: it falls as the load and the snake it lands beside glides off; he is not hurt', () => {
  for (const d of ['normal', 'easy'] as const) {
    const { e } = makeEngine(STAGE_15, d, 1);
    const tr = e.cast.traps.find((q: Any) => q.post.kind === 'limb');
    assert.ok(tr, `${d}: no falling limb`);
    const limb = e.platforms.find((p: Any) => p.id === tr.post.limb)!;
    const den = e.enemies.find((q: Any) => Math.abs(q.y + 11 - tr.post.landY) < 40 && Math.min(Math.abs(q.patrolMinX - tr.post.loadX), Math.abs(q.patrolMaxX - tr.post.loadX)) <= TRAP.scare);
    assert.ok(den, `${d}: no snake beside where the limb lands`);
    const hp = e.player.hp, foot = tr.post.landY - den.y;
    standOn(e, limb, limb.x + limb.width / 2);
    let fell = false;
    for (let i = 0; i < 120; i++) { step(e, 1); if (tr.phase === 'down') { fell = true; break; } }
    assert.ok(fell, `${d}: the limb never came down`);
    // (it glides down to the ground and away along it, never INTO it: on flat ground it went 150 px into the soil, B15 stills 11-13)
    const floor = tr.post.landY;
    let deepest = -Infinity;
    for (let i = 0; i < 30; i++) { step(e, 1); if (!den.defeated) deepest = Math.max(deepest, den.y + foot - floor); }
    assert.ok(deepest <= 1, `${d}: the snake glided ${Math.round(deepest)} px into the ground`);
    assert.ok(den.kit.leaving || den.kit.phase === 'gone' || den.defeated, `${d}: the snake beside it stayed (${den.kit.phase})`);
    assert.equal(e.player.hp, hp, `${d}: he was hurt riding it down`);
  }
});

test('her marks are a gen2 goal: every mark a section holds is laid, the goal is four in five of them on Normal and 65% of that on Easy', () => {
  const { e } = makeEngine(STAGE_15, 'normal', 1);
  const st = e.currentStage as Any;
  const n = marksHeld(st);
  assert.ok(n >= 14, `${n} marks`);
  assert.equal(st.config.objectiveType, 'relic_hunt');
  assert.equal(goalHave(st), n);
  assert.equal(normalGoal(st), Math.round(n * GOAL_SHARE.marks));
  assert.equal(st.config.targetCount, Math.round(n * GOAL_SHARE.marks));
  assert.ok(st.easyGoal <= Math.round(st.config.targetCount * 0.65) + 1, `Easy asks ${st.easyGoal}`);
  // (a search with no marks keeps its own count: World 3's keepsakes)
  assert.equal(goalHave({ ...st, collectibles: st.collectibles.filter((c: Any) => !c.mark) }), null);
});

test("the HUD counts her marks, and Dot explains the locked exit in the keeper's words", () => {
  const g = goalInfo({ id: STAGE_15, worldIndex: 1, miniIndex: 5, objectiveType: 'relic_hunt', targetCount: 13 } as Any);
  assert.match(g.line, /13 marks/);
  assert.deepEqual(g.icon, { kind: 'drawn', name: 'carving' }, "her mark is Meeca's carved bark, never the stone idol");
  assert.equal(countWord(1, 'relic_hunt'), 'marks');
  assert.equal(goalLine('start', 1, 'relic_hunt', 3), 'Find 3 marks to open the sanctuary');
  assert.equal(sealedLine(1, 'relic_hunt'), LINES_15.sealed, 'the locked exit is the keeper\'s line');
  assert.equal(goalLine('sealed', 1, 'relic_hunt', 2), 'Sealed: find 2 more marks to open it', 'goalLine keeps its own words');
  assert.equal(sealedLine(3, 'relic_hunt'), null);
  assert.equal(SEALED_LINES['1:relic_hunt'], "We missed some of her marks. They're back there!");
  assert.equal(goalLine('sealed', 3, 'relic_hunt', 2), 'Sealed: find 2 more keepsakes to open it', 'every other search keeps its own words');
});

test("the engine says the keeper's line at 1-5's sealed door, not the counting line (engine.ts: stagePlan sealedLine before goalLine)", () => {
  const sim = new RealPlay(STAGE_15, 1);
  const st = sim.stage as unknown as { exitTotemX: number; platforms: Array<{ x: number; y: number; width: number; height: number }> };
  const e = sim.e as unknown as { stageHint: { text: string } | null; stop?: () => void };
  const ground = st.platforms.filter((q) => st.exitTotemX >= q.x && st.exitTotemX <= q.x + q.width && q.height > 30).sort((a, b) => a.y - b.y)[0];
  sim.stand(st.exitTotemX - 140, ground.y);
  // (Dot's own lines queued at the start take her banner first: each is taken down as it shows, so the door's line can come; it shows
  //  only while she says nothing else, engine.ts)
  const seen = new Set<string>();
  for (let i = 0; i < 300 && !seen.has(LINES_15.sealed); i++) {
    e.stageHint = null;
    sim.frame({ right: true });
    if (e.stageHint?.text) seen.add(e.stageHint.text);
  }
  assert.ok(seen.has(LINES_15.sealed), `at the sealed door Dot said: ${[...seen].join(' / ')}`);
  assert.ok(![...seen].some((t) => t.startsWith('Sealed:')), 'the counting line, not the keeper\'s');
  e.stop?.();
});
