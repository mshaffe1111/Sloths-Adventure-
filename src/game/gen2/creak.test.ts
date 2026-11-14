/**
 * The creaky limb as ONE gen2 piece (creak.ts; packet B15 item 1): its look and hold by world data, required once taught, whole again on a
 * set-back. Each test is proven by a planted fault (reference/qa-reports/B15/REPORT.md lists them): the engine's hold read back to 1.1,
 * the lesson's limbs not marked free, the world's row taken out, crumbledWhole left out of a set-back.
 *   npx tsx --test src/game/gen2/creak.test.ts
 */
import '../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creakLimb, isCreak, needless, type LimbPlatform } from './creak.ts';
import { buildGen2Stage } from './pipeline.ts';
import { kitLib15, STAGE_15 } from './worlds/w1Arc15.ts';
import { W1_CREAK, w1World } from './worlds/w1.ts';
import { generateAllLevels } from '../worldsData.ts';
import { makeEngine, standOn, step } from '../engineCoreHarness.ts';
import type { Platform } from '../types.ts';

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any
const cfg = () => generateAllLevels().find((c) => c.id === STAGE_15 && !c.secret)! as Any;
const plat = (o: Partial<Platform> = {}): LimbPlatform => ({ id: 1, x: 0, y: 500, width: 130, height: 24, type: 'solid', style: 'moss_stone', ...o });

test('a creak piece becomes the world\'s creaky limb: fragile, its look and its hold by setting from the world row', () => {
  const M = w1World().manifest;
  const n = creakLimb(plat(), M, 'normal', false), e = creakLimb(plat(), M, 'easy', false);
  assert.equal(n.type, 'fragile');
  assert.equal(n.style, W1_CREAK.style);
  assert.equal(n.creak, W1_CREAK.hold.normal);
  assert.equal(e.creak, W1_CREAK.hold.easy);
  assert.ok(W1_CREAK.hold.easy > W1_CREAK.hold.normal, 'Easy holds longer: never harder than Normal');
  assert.ok(isCreak(n) && !needless(n), 'a limb after its lesson may be the way');
  assert.ok(needless(creakLimb(plat(), M, 'normal', true)), 'a limb before its lesson is over is never needed');
});

test('a world with no creaky limb row fails the roll by name, never a stand-in', () => {
  assert.throws(() => creakLimb(plat(), { world: 9, creak: undefined }, 'normal', false), /world 9, which has no creaky limb/);
});

test("World 7's ruin tiles stay never needed; a sound platform is never a limb", () => {
  assert.ok(needless(plat({ type: 'fragile', crumbleAfter: 0.6 })));
  assert.ok(!needless(plat()) && !isCreak(plat()));
});

test('on the built 1-5, every limb laid up to the end of the lesson\'s section is free (never needed), and every one after it is not', () => {
  for (const d of ['normal', 'easy'] as const) for (const seed of [1, 2, 3]) {
    const st: Any = buildGen2Stage({ config: cfg(), kit: kitLib15(), seed, difficulty: d });
    assert.deepEqual(st.gen2.errors ?? [], [], `seed ${seed} ${d}`);
    const lesson = st.gen2.sections.find((s: Any) => s.template === 'w1-15-creak-lesson');
    const limbs = st.platforms.filter(isCreak) as LimbPlatform[];
    assert.ok(limbs.length >= 10, `seed ${seed} ${d}: ${limbs.length} limbs`);
    for (const p of limbs) {
      assert.equal(p.creak, W1_CREAK.hold[d], `seed ${seed} ${d}: the limb at x ${p.x} holds ${p.creak}`);
      assert.equal(!!p.creakFree, p.x < lesson.x1, `seed ${seed} ${d}: the limb at x ${p.x} (the lesson ends at ${lesson.x1}) free ${!!p.creakFree}`);
    }
    assert.ok(limbs.some((p) => p.x >= lesson.x1), `seed ${seed} ${d}: no limb after the lesson`);
  }
});

test('the engine holds a limb its own `creak` seconds once he stands on it (not the 1.1 every fragile platform had), then drops it', () => {
  const { e } = makeEngine(STAGE_15, 'normal', 1);
  const limb = e.platforms.filter(isCreak).find((p: Platform) => !(p as LimbPlatform).creakFree && !(p as LimbPlatform).trapLoad)!;
  limb.creak = 0.5;
  standOn(e, limb, limb.x + limb.width / 2);
  let frames = 0;
  while (!limb.broken && frames < 90) { step(e, 1); frames++; }
  assert.ok(limb.broken, 'the limb never gave way');
  assert.ok(Math.abs(frames / 30 - 0.5) <= 0.1, `it gave way after ${(frames / 30).toFixed(2)} s, not its 0.5`);
});

test('a limb that gave way is whole again on a set-back (Matt 11-02: a required one is whole again when he respawns)', () => {
  const { e } = makeEngine(STAGE_15, 'normal', 1);
  const limb = e.platforms.filter(isCreak).find((p: Platform) => !(p as LimbPlatform).creakFree && !(p as LimbPlatform).trapLoad)!;
  standOn(e, limb, limb.x + limb.width / 2);
  for (let i = 0; i < 60 && !limb.broken; i++) step(e, 1);
  assert.ok(limb.broken, 'the limb never gave way');
  e.respawnAtCheckpoint();
  assert.equal(limb.broken, false, 'still gone after the set-back');
  assert.equal(limb.fragileTimer, undefined);
});

test('a creaky limb laid ACROSS a pit (a jump on, a jump off) has the pit under it too: one pit lip to lip; a sound bough keeps two', async () => {
  // (BUILD-17b: laid apart, each jump's gap had its own soft pit and the limb's own span had none; when it gave way he fell into nothing,
  // 1-7's beats 8 and 14. gen2/creak.ts: a limb "drops him to what is under it")
  const { layLocal, planBudget, rngFor } = await import('./pipeline.ts');
  const c = generateAllLevels().find((l) => l.id === '1-7')!;
  const M = w1World().manifest;
  const budget = planBudget(c, M, 'normal');
  const tpl = (creak: boolean) => ({
    id: 'creak-across-probe', name: 'a limb across a soft gap', archetypes: 'any', phases: ['sho'], difficulty: 3,
    pieces: [
      { key: 'a', shape: 'bank', w: [300, 300], place: { kind: 'start' } },
      { key: 'k', shape: 'branch', w: [150, 150], place: { kind: 'jump', after: 'a', dy: [0, 0], share: [0.3, 0.3], soft: true }, style: 'branch', landing: true, ...(creak ? { creak: true } : { main: true }) },
      { key: 'b', shape: 'bank', w: [300, 300], place: { kind: 'jump', after: 'k', dy: [0, 0], share: [0.3, 0.3], soft: true } },
    ],
    entry: { piece: 'a', kind: 'ground' }, exit: { piece: 'b', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: true,
  }) as unknown as Parameters<typeof layLocal>[0];
  for (const mirrored of [false, true]) {
    const L = layLocal(tpl(true), budget, rngFor(31, 0), mirrored, { pitDepth: M.pitDepth });
    const k = L.pieces.find((p) => p.key === 'k')!;
    const pits = L.gaps.filter((g) => g.pit);
    assert.equal(pits.length, 1, `mirrored ${mirrored}: one pit, not one a jump: ${JSON.stringify(L.gaps)}`);
    assert.ok(pits[0].x0 < k.x && pits[0].x1 > k.x + k.w && pits[0].soft && pits[0].shallow, `mirrored ${mirrored}: a shallow soft pit runs under the limb ${k.x}-${k.x + k.w}: ${JSON.stringify(pits[0])}`);
  }
  // planted: the same section with a SOUND bough (it never gives way): two jumps, two pits, nothing under the bough, as before
  const S = layLocal(tpl(false), budget, rngFor(31, 0), false, { pitDepth: M.pitDepth });
  assert.equal(S.gaps.filter((g) => g.pit).length, 2);
});

test('on the built 1-7, every creaky limb has ground under the whole of it (Normal, seeds 1-3; on Easy they are sound boughs)', async () => {
  const { RealPlay } = await import('../realPlay.ts');
  for (const seed of [1, 2, 3]) {
    const sim = new RealPlay('1-7', seed);
    const ps = sim.platforms as Platform[];
    const limbs = ps.filter((p) => isCreak(p));
    assert.ok(limbs.length >= 1, `seed ${seed}: 1-7 lays creaky limbs on Normal`);
    for (const l of limbs) {
      // (what he lands on when it gives way: a piece under it within a fall that is no fall, wide enough to cover it)
      const under = ps.filter((q) => q !== l && q.type !== 'fragile' && q.y > l.y && q.y <= l.y + 160 && q.x <= l.x + 1 && q.x + q.width >= l.x + l.width - 1);
      assert.ok(under.length, `seed ${seed}: the limb at x ${l.x} (${l.width} px) has nothing under the whole of it`);
    }
  }
});
