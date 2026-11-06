/**
 * The fun validator's own tests (D15: test the measuring tool before trusting its numbers). Every check is run on a world built to fail it
 * and one built to pass it, before it scores a real stage. The play checks run in the real engine (realPlay.ts) on bare worlds.
 *   npx tsx --test tools/validate/validate.test.ts
 */
import '../../src/game/headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from '../../src/game/realPlay.ts';
import { newWatch } from '../../src/game/watcher.ts';
import { newChase } from '../../src/game/chase.ts';
import type { Platform } from '../../src/game/types.ts';
import { cosine, deadWalks, fromStage, grams, moveOf, moveString, pacing, paceFlags, repeats, SIMILAR_MAX, type Step } from './core.ts';
import { branchOutrunWith, cameraOn, chaseOutrunWith, eagleOutrunWith, towardShrine } from './play.ts';
import { hazardsScore, newScore, newThatCounts } from './score.ts';
import { artKey, lookAlike, lookOf } from './look.ts';
import { findRoute } from '../inspect/route.ts';
import { gatedFlags, judgeAgainst, keyOf, measure, truerBeside } from './funcheck.ts';
import { movesAlike } from './evaluate.ts';
import { fallBites, FALL_BITE_PX, pairsMet, waitAt, WAIT_MIN } from './mechanics.ts';
import { FINALE_TIGHT_MAX, groupsOf, REST_PAD_SECS, type Built, type Stretch } from './core.ts';
import { shapeAlike, tempoAlike, rhythmOf, templateFlags, unitsOf } from './variety.ts';
import type { StageEval } from './evaluate.ts';
import type { Stage } from '../inspect/stages.ts';

const G = 580;
const floor = (x0: number, x1: number, id = 1, y = G): Platform => ({ id, x: x0, y, width: x1 - x0, height: 200, type: 'solid', style: 'log' } as Platform);
/** a bare world in the real engine: these platforms, the exit at `exitX`, nothing else */
function bare(ps: Platform[], exitX: number, extra: (e: Record<string, any>) => void = () => {}): RealPlay {
  const r = new RealPlay('1-2', 1);
  r.bare(ps);
  const st = r.stage as Stage & Record<string, any>;
  Object.assign(st, { platforms: ps, vines: [], ropes: [], enemies: [], zones: [], checkpoints: [], trees: [], spawnX: 150, spawnY: G, exitTotemX: exitX, exitTotemY: G, proto: undefined, kit: undefined });
  st.collectibles = [{ id: 1, type: 'exit_totem', x: exitX, y: G, collected: false, bobPhase: 0 }];
  st.config = { ...st.config, objectiveType: 'sprint' };
  extra(r.e as Record<string, any>);
  return r;
}
const steps = (str: string, every = 1): Step[] => [...str].map((m, i) => ({ m: m as Step['m'], t: 2 + i * every, x: 100 + i * 100, y: G, what: m }));

// ---- the move letters ----
test('every beat the inspector names maps to its move letter', () => {
  const cases: Array<[string, string, string]> = [
    ['J', 'jump over a gap', 'J'], ['J', 'big jump up', 'J'], ['J', 'jump the level check cannot confirm (probably a puzzle piece)', 'Q'], ['h', 'small hop', 'j'], ['h', 'hop up a step', 'h'], ['J', 'mushroom bounce', 'M'],
    ['J', 'hop onto a moving log or platform', 'X'], ['V', 'grab a trunk or vine and climb', 'C'], ['V', 'swing on a liana', 'V'], ['V', 'shimmy along a rope', 'R'],
    ['Z', 'crumbling branch', 'B'], ['Z', 'the branch collapses behind him: keep running', 'K'], ['Z', 'wind gust', 'W'], ['Z', 'sticky web slows him', 'S'],
    ['P', 'puzzle room (seesaw)', 'P'], ['C', 'snake', 'F'], ['Z', 'eagle sweep: duck into a bush', 'E'], ['Z', 'darkness: wake the glowworms, find the way', 'D'],
    // (World 1's tricks, R-159.1: the inspector names them, beats.ts)
    ['C', 'snake (dazed, then stomped)', 'N'], ['C', 'boa (coiled: kicked to roll)', 'O'], ['C', 'snake (stomp vault)', 'Y'], ['C', 'snake (vine snake: punched stiff)', 'G'], ['C', 'boa', 'F'],
  ];
  for (const [letter, what, want] of cases) assert.equal(moveOf({ letter: letter as never, what, count: 1 }), want, what);
  assert.equal(moveOf({ letter: 'h', what: 'pickup arc over a gap (optional jump)', count: 0.5 }), null, 'an optional pickup arc is not a move');
});

// ---- dead walking ----
test('dead walk: a 4 s stretch with no move is flagged, 2 s stretches are not', () => {
  const bad: Step[] = [{ m: 'J', t: 1, x: 300, y: G, what: '' }, { m: 'J', t: 5, x: 1400, y: G, what: '' }, { m: 'J', t: 6.5, x: 1800, y: G, what: '' }];
  const good: Step[] = [{ m: 'J', t: 1, x: 300, y: G, what: '' }, { m: 'J', t: 3, x: 900, y: G, what: '' }, { m: 'J', t: 5, x: 1500, y: G, what: '' }];
  const samples = [{ x: 0, y: G, base: 0 }, { x: 2000, y: G, base: 7 }] as never;
  assert.equal(deadWalks(bad, 6.5, samples).length, 1);
  assert.equal(deadWalks(good, 6, samples).length, 0);
});

test('dead walk: a fight is the player busy, not walking (the lead\'s ruling (b), 2026-11-05: 1-5\'s teach boa, a 2 s fight, read as dead)', () => {
  const samples = [{ x: 0, y: G, base: 0 }, { x: 2000, y: G, base: 7 }] as never;
  // (each way: 4 s on from a 2 s fight is 2 s walking, no flag; the same 4 s on from a jump is a dead walk; a longer walk after a fight still is)
  const fought: Step[] = [{ m: 'O', t: 1, x: 300, y: G, what: 'boa (coiled: kicked to roll)', fight: 2 }, { m: 'J', t: 5, x: 800, y: G, what: '' }];
  const jumped: Step[] = [{ m: 'J', t: 1, x: 300, y: G, what: '' }, { m: 'J', t: 5, x: 1400, y: G, what: '' }];
  const far: Step[] = [{ m: 'O', t: 1, x: 300, y: G, what: 'boa (coiled: kicked to roll)', fight: 2 }, { m: 'J', t: 7, x: 1800, y: G, what: '' }];
  assert.equal(deadWalks(fought, 5, samples).filter((d) => d.t0 === 1).length, 0, 'the fight is not walking');
  assert.equal(deadWalks(jumped, 5, samples).filter((d) => d.t0 === 1).length, 1, 'the same gap after a jump is');
  assert.equal(deadWalks(far, 7, samples).filter((d) => d.t0 === 1).length, 1, 'a long walk on after a fight still is');
});

test('dead walk: time climbing a trunk or on a rope is not walking (1-4: its climbs read as 3.7 s dead walks)', () => {
  const two: Step[] = [{ m: 'C', t: 1, x: 300, y: G, what: '' }, { m: 'C', t: 5, x: 400, y: G - 300, what: '' }];
  const seg = (kind: string) => ({ kind }) as never;
  // (4 s between the two climbs: 3 of them up the trunk, 1 walking)
  const climbed = [{ x: 300, y: G, base: 0, seg: seg('walk') }, { x: 300, y: G, base: 1, seg: seg('climb') }, { x: 300, y: G - 300, base: 4, seg: seg('walk') }, { x: 400, y: G - 300, base: 5, seg: seg('walk') }, { x: 500, y: G - 300, base: 6, seg: seg('walk') }] as never;
  assert.equal(deadWalks(two, 6, climbed).filter((d) => d.t0 === 1).length, 0, 'a climb is not a dead walk');
  // (the same 4 s all on foot)
  const walked = [{ x: 300, y: G, base: 0, seg: seg('walk') }, { x: 1500, y: G, base: 6, seg: seg('walk') }] as never;
  assert.equal(deadWalks(two, 6, walked).filter((d) => d.t0 === 1).length, 1, 'the same gap walked is');
});

test('dead walk, in the real engine: a 1,500 px flat walk to the shrine reads as dead; gaps every 300 px do not', () => {
  const flat = bare([{ ...floor(100, 2000), height: 90 }], 1600);
  const fb = fromStage('fixture', 1, 'normal', flat, flat.stage as Stage);
  assert.ok(deadWalks(fb.steps, fb.total, fb.samples).some((d) => d.secs > 4), `flat: ${JSON.stringify(deadWalks(fb.steps, fb.total, fb.samples))}`);
  // (80 px gaps: the level check's own reach on the flat is 175 x 0.97 - 70 = 99.75 px, levelCheck.ts MARGIN, physics.ts TAKEOFF_SLACK)
  const ps: Platform[] = [];
  for (let k = 0; k < 8; k++) ps.push({ ...floor(100 + k * 280, 300 + k * 280, k + 1), height: 90 });
  const gaps = bare(ps, 2200);
  const gb = fromStage('fixture', 1, 'normal', gaps, gaps.stage as Stage);
  assert.ok(gb.steps.length >= 5, `gaps: ${moveString(gb.steps)}`);
  assert.equal(deadWalks(gb.steps, gb.total, gb.samples).filter((d) => d.t0 > 0.5 && d.t1 < gb.total - 0.5).length, 0, 'no dead walk between the gaps');
});

// ---- repeats and sameness ----
test('repeats: a hop-hop-jump run back to back is flagged; a varied string is not', () => {
  const bad = 'jjJjjJjjJjjJ';
  assert.ok(repeats(bad, steps(bad)).some((r) => r.kind === '3-back' && r.run === 'jjJ' && r.n === 4));
  const good = 'JVBjCMRJWSjP';
  assert.equal(repeats(good, steps(good)).length, 0);
  const four = 'JVBC' + 'M' + 'JVBC' + 'R' + 'JVBC' + 'S' + 'JVBC';
  assert.ok(repeats(four, steps(four)).some((r) => r.kind === '4-run' && r.run === 'JVBC' && r.n === 4), 'the same 4-move run four times');
});

test('similarity: the same moves in a new stage read alike; different moves do not', () => {
  const a = grams('jjJjjJjjJjjJVjjJ');
  assert.ok(cosine(a, grams('jjJjjJjjJVjjJjjJ')) > SIMILAR_MAX);
  assert.ok(cosine(a, grams('CRCVBWBSCMPMRV')) < SIMILAR_MAX);
});

test('similarity keeps the hop, the jump and the double jump apart (the lead, 2026-11-04: a thumb feels them differently)', () => {
  // (each way: the same jumps read alike; a run of hops against a run of jumps, or jumps against double jumps, does not)
  assert.ok(cosine(grams('JJJJJJJJMJJJJ'), grams('JJJJJJJJJMJJJ')) > SIMILAR_MAX, 'jumps against jumps: alike');
  assert.ok(cosine(grams('jjjjjjjjjjjj'), grams('JJJJJJJJJJJJ')) < SIMILAR_MAX, 'hops against jumps: not alike');
  assert.ok(cosine(grams('JUJUJUJUJUJU'), grams('JJJJJJJJJJJJ')) < SIMILAR_MAX, 'jump and double against plain jumps: not alike');
  // (a move the check can't name still reads as a jump)
  assert.ok(cosine(grams('JQJQJQJQ'), grams('JJJJJJJJ')) > 0.99);
});

test('similarity reads each move with its way, up, down or flat (the lead\'s ruling (a), 2026-11-04: a snap twig dropped onto and a limb climbed up to are both B)', () => {
  const s = 'BJBJBJBJBJBJ';
  // (each way: the same moves the same way read alike; the same letters going down against going up do not)
  assert.ok(cosine(grams(s, 3, 'dddddddddddd'), grams(s, 3, 'dddddddddddd')) > 0.99, 'the same moves the same way: alike');
  assert.ok(cosine(grams(s, 3, 'dddddddddddd'), grams(s, 3, 'uuuuuuuuuuuu')) < SIMILAR_MAX, 'down against up: not alike');
  assert.ok(cosine(grams(s, 3, 'dfdfdfdfdfdf'), grams(s, 3, 'dfdfdfdfdfdf')) > 0.99);
  assert.ok(cosine(grams(s, 3, 'dfdfdfdfdfdf'), grams(s, 3, 'ufufufufufuf')) < SIMILAR_MAX);
  // (no ways, or ways of the wrong length: the letters alone, as before)
  assert.deepEqual(grams(s, 3, 'dd'), grams(s));
  // (movesAlike reads the ways when a stage carries them)
  const a = { str: s, quick: s, sdir: 'dddddddddddd', qdir: 'dddddddddddd' };
  assert.ok(movesAlike(a, { ...a, sdir: 'uuuuuuuuuuuu', qdir: 'uuuuuuuuuuuu' }) < SIMILAR_MAX);
  assert.ok(movesAlike(a, { ...a }) > 0.99);
});

// ---- pacing ----
test('pacing: a burst as the research defines it is tight (the lead\'s ruling 2026-11-05: Normal 8 actions within 14 s, Easy 3 within 8 s)', () => {
  const at = (ts: number[]): Step[] => ts.map((t) => ({ m: 'J' as const, t, x: 0, y: G, what: '' }));
  const tight = (steps: Step[], setting: 'normal' | 'easy') => !paceFlags(pacing(steps, 120), true, { steps, setting }).some((f) => /never tight/.test(f.what));
  // (each way: 8 jumps 1.6 s apart, 11.2 s, are a Normal burst, and 7 are not; on Easy 3 jumps 3.5 s apart are a burst, 3 jumps 4.5 s apart are not)
  const spread = (n: number, gap: number, from = 20) => Array.from({ length: n }, (_, i) => from + i * gap);
  const quiet = spread(10, 6, 60);
  assert.ok(tight(at([...spread(8, 1.6), ...quiet]), 'normal'), 'Normal: 8 in 11.2 s');
  assert.ok(!tight(at([...spread(7, 1.6), ...quiet]), 'normal'), 'Normal: 7 is not a burst');
  assert.ok(tight(at([...spread(3, 3.5), ...quiet]), 'easy'), 'Easy: 3 in 7 s');
  assert.ok(!tight(at([...spread(3, 4.5), ...quiet]), 'easy'), 'Easy: 3 in 9 s is not');
  // (small steps and searches are no actions)
  assert.ok(!tight([...at(spread(4, 1.6)), ...spread(4, 1.6, 26.4).map((t) => ({ m: 'h' as const, t, x: 0, y: G, what: '' })), ...at(quiet)], 'normal'), 'steps are not actions');
});

test('pacing: a dense 5 s is tight, an empty 5 s a rest, a slow start an intro; a flat stage is flagged as never tight', () => {
  const dense: Step[] = Array.from({ length: 8 }, (_, i) => ({ m: 'J', t: 10 + i * 0.6, x: 0, y: G, what: '' }));
  const slow: Step[] = [{ m: 'j', t: 2, x: 0, y: G, what: '' }, { m: 'j', t: 7, x: 0, y: G, what: '' }];
  const p = pacing([...slow, ...dense], 30);
  assert.equal(p[0].tag, 'I');
  assert.ok(p.some((s) => s.tag === 'T'));
  assert.ok(p.some((s) => s.tag === 'R'));
  const flat = pacing(Array.from({ length: 40 }, (_, i) => ({ m: 'J' as const, t: i * 3, x: 0, y: G, what: '' })), 120);
  assert.ok(paceFlags(flat).some((f) => /never tight/.test(f.what)));
  assert.ok(paceFlags(flat).some((f) => /no rest/.test(f.what)));
});

// ---- breaking branches ----
const branchWorld = (crumble: number | undefined, w: number, more: Platform[] = []) => () => {
  const ps: Platform[] = [floor(0, 600, 1, 412), ...more];
  for (let k = 0; k < 4; k++) ps.push({ id: 10 + k, x: 680 + k * (w + 80), y: 412, width: w, height: 24, type: 'fragile', style: 'branch', ...(crumble !== undefined ? { crumbleAfter: crumble } : {}) } as Platform);
  ps.push(floor(680 + 4 * (w + 80), 680 + 4 * (w + 80) + 800, 20, 412));
  ps.push({ ...floor(0, 6000, 30, 900), height: 50 });
  return bare(ps, 680 + 4 * (w + 80) + 600);
};
test('branches: a run of today\'s 1.1 s branches is outrun by holding right; snap twigs (0.15 s) give way under him', () => {
  const today = branchOutrunWith(branchWorld(undefined, 180));
  assert.equal(today.length, 1);
  assert.equal(today[0].outrun, true, JSON.stringify(today[0]));
  const twigs = branchOutrunWith(branchWorld(0.15, 260));
  assert.equal(twigs[0].outrun, false, JSON.stringify(twigs[0]));
  assert.ok(twigs[0].underHim > 0);
  assert.equal(today[0].verdict, 'outrun');
  assert.equal(twigs[0].verdict, 'bites');
});

test('branches: a run holding right never gets across, with nothing giving way, is "not judged", never "bites" (1-6\'s label)', () => {
  // (a wall on the first branch, 400 px tall: holding right stops at it, before anything breaks under him)
  const walled = branchOutrunWith(branchWorld(undefined, 180, [{ id: 40, x: 760, y: 12, width: 60, height: 400, type: 'solid', style: 'moss_stone' } as Platform]));
  assert.equal(walled[0].underHim, 0, JSON.stringify(walled[0]));
  assert.equal(walled[0].verdict, 'not judged', JSON.stringify(walled[0]));
});

// ---- the eagle ----
const eagleWorld = (zone: { x0: number; x1: number; calm: [number, number]; freeFirst?: boolean }) => () =>
  bare([floor(0, 9000)], 8800, (e) => {
    e.proto = { watch: [zone], bushes: [], hints: [], covers: [], beats: [] };
    e.watch = newWatch();
  });
test('eagle: a short stretch with a long calm is outrun by holding right; a long stretch with a short calm catches him', () => {
  const short = eagleOutrunWith(eagleWorld({ x0: 400, x1: 1400, calm: [9, 11], freeFirst: true }));
  assert.equal(short!.zones[0].outrun, true, JSON.stringify(short!.zones[0]));
  const long = eagleOutrunWith(eagleWorld({ x0: 400, x1: 8000, calm: [2, 3] }));
  assert.equal(long!.zones[0].outrun, false, JSON.stringify(long!.zones[0]));
  assert.ok(long!.zones[0].hits > 0);
});

test('eagle: a hit after the 2 s screech reads as warned; a 0.1 s screech (no half second of shadow before the sweep) does not', () => {
  const fair = eagleOutrunWith(eagleWorld({ x0: 400, x1: 8000, calm: [2, 3] }));
  const fl = fair!.zones[0].hitLeads;
  assert.ok(fl.length > 0 && fl.every((h) => h.warned), JSON.stringify(fl));
  const sudden = eagleOutrunWith(eagleWorld({ x0: 400, x1: 8000, calm: [2, 3], warn: 0.1 }));
  const sl = sudden!.zones[0].hitLeads;
  assert.ok(sl.length > 0 && sl.some((h) => !h.warned), JSON.stringify(sl));
});

// ---- the chase ----
test('chase: on open ground holding right pulls away (outrun); a wall that stops him lets it catch him', () => {
  const plan = { start: 600, end: 5000, finalFrom: 4500 };
  const open = chaseOutrunWith(() => bare([floor(0, 6000)], 5800, (e) => {
    e.proto = { chase: plan, hints: [], covers: [], beats: [] };
    e.chase = newChase(plan);
  }));
  assert.equal(open!.outrun, true, JSON.stringify(open));
  const walled = chaseOutrunWith(() => bare([floor(0, 6000), { id: 2, x: 2000, y: G - 400, width: 60, height: 400, type: 'solid', style: 'moss_stone' } as Platform], 5800, (e) => {
    e.proto = { chase: plan, hints: [], covers: [], beats: [] };
    e.chase = newChase(plan);
  }));
  assert.equal(walled!.outrun, false, JSON.stringify(walled));
});

// ---- the camera, for the landing-in-view check ----
test("camera: upright shows a narrow view (a ledge 700 px ahead is off screen) and sideways a wide one (it is on)", () => {
  for (const [portrait, seen] of [[true, false], [false, true]] as const) {
    const r = bare([floor(0, 4000)], 3800);
    cameraOn(r, portrait);
    r.stand(1000, G);
    for (let i = 0; i < 60; i++) r.frame();
    const c = (r.e as Record<string, any>).camera;
    const on = 1700 >= c.x && 1700 <= c.x + c.viewportWidth;
    assert.equal(on, seen, `${portrait ? 'upright' : 'sideways'}: view ${Math.round(c.x)}..${Math.round(c.x + c.viewportWidth)}`);
  }
});

// ---- the quality supervisor's added checks (2026-11-04 review) ----
import { enemyJobs, missCost, tempoOf } from './mechanics.ts';

test('miss cost: a jump over open air costs a life; one over soft moss or ground below is a free retry', () => {
  const deep = bare([{ ...floor(100, 600), height: 90 }, { ...floor(680, 1400, 2), height: 90 }], 1300);
  const db = fromStage('fixture', 1, 'normal', deep, deep.stage as Stage);
  const dc = missCost(db).filter((x) => x.step.m === 'J');
  assert.ok(dc.length >= 1 && dc.every((x) => x.cost === 'life'), JSON.stringify(dc.map((x) => [x.step.m, x.cost])));
  const moss = bare([{ ...floor(100, 600), height: 90 }, { ...floor(680, 1400, 2), height: 90 }, { id: 3, x: 560, y: 710, width: 160, height: 60, type: 'solid', style: 'moss_stone' } as Platform], 1300);
  const mb = fromStage('fixture', 1, 'normal', moss, moss.stage as Stage);
  const mc = missCost(mb).filter((x) => 'Jj'.includes(x.step.m));
  assert.ok(mc.length >= 1 && mc.every((x) => x.cost === 'nothing'), JSON.stringify(mc.map((x) => [x.step.m, x.cost])));
  // (and on Easy a fall over open air is soft: a setback, not a life)
  const easy = fromStage('fixture', 1, 'easy', deep, deep.stage as Stage);
  assert.ok(missCost(easy).filter((x) => x.step.m === 'J').every((x) => x.cost === 'setback'));
});

test('enemy jobs: a snake where a jump lands is flagged; one in the middle of a long flat is not', () => {
  const ps = [{ ...floor(100, 600), height: 90 }, { ...floor(680, 2400, 2), height: 90 }];
  const snake = (x: number) => ({ id: 1, type: 'snake', x, y: G - 22, width: 38, height: 22, patrolMinX: x - 40, patrolMaxX: x + 40, hp: 1, maxHp: 1, defeated: false });
  for (const [x, near] of [[760, true], [1700, false]] as const) {
    const r = bare(ps, 2300);
    (r.stage as Stage).enemies = [snake(x) as never];
    const b = fromStage('fixture', 1, 'normal', r, r.stage as Stage);
    const job = enemyJobs(b).jobs[0];
    assert.equal(job.nearLanding !== null, near, `snake at ${x}: ${JSON.stringify(job)}`);
  }
  // (a vine snake where a jump lands is the liana he means to catch, not an ambush: never flagged)
  const r = bare(ps, 2300);
  (r.stage as Stage).enemies = [{ ...snake(760), trick: 'vine' } as never];
  const vb = fromStage('fixture', 1, 'normal', r, r.stage as Stage);
  assert.equal(enemyJobs(vb).jobs[0].nearLanding, null);
});

test('tempo: breaking branches are hurry, the eagle and waits are patience, a plain jump is neither', () => {
  assert.equal(tempoOf({ m: 'B', t: 0, x: 0, y: 0, what: 'crumbling branch' }), 'hurry');
  assert.equal(tempoOf({ m: 'E', t: 0, x: 0, y: 0, what: 'eagle sweep: duck into a bush' }), 'patience');
  assert.equal(tempoOf({ m: 'P', t: 0, x: 0, y: 0, what: 'stand still: the fern unrolls' }), 'patience');
  assert.equal(tempoOf({ m: 'J', t: 0, x: 0, y: 0, what: 'jump over a gap' }), null);
});

// ---- the score's hazard and "something new" rules (score.ts; the quality supervisor's review, 11-04) ----
test('hazards matter: a stage whose only hazard is outrun on every run scores 0 (1-5 read 5); one that bites on all scores 10', () => {
  assert.equal(hazardsScore(['breaking'], [{ kind: 'breaking', bite: 0 }]), 0);
  assert.equal(hazardsScore(['breaking'], [{ kind: 'breaking', bite: 1 }]), 10);
  // (an unseen chase, 1-8: bites on none)
  assert.equal(hazardsScore(['chase'], [{ kind: 'chase', bite: 0 }]), 0);
  // (no hazard at all: 0, no free points; hazards none of whose runs could be judged: left out)
  assert.equal(hazardsScore([], []), 0);
  assert.equal(hazardsScore(['breaking'], [{ kind: 'breaking', bite: null }]), null);
  // (the eagle hurting on 4 of 10 stretches: 4)
  assert.equal(hazardsScore(['eagle'], [{ kind: 'eagle', bite: 0.4 }]), 4);
});

test('something new: an outrun breaking branch the way to the shrine passes under is not new (1-5 read 10); one it needs and that bites is', () => {
  const adds = { moves: ['B'], pairs: ['branches+vines', 'jump+branches'], grams: 2 };
  // (outrun, and not on the shortest way to the shrine)
  assert.equal(newScore(adds, 'MJJUjC', new Set(['breaking']), ['breaking']), 0);
  // (outrun, though on the way)
  assert.equal(newScore(adds, 'MJBJUjC', new Set(['breaking']), ['breaking']), 0);
  // (on the way and biting)
  assert.equal(newScore(adds, 'MJBJUjC', new Set(), ['breaking']), 10);
  // (a new non-hazard move the way needs still counts beside a dead hazard)
  assert.equal(newScore({ moves: ['B', 'R'], pairs: [], grams: 0 }, 'JRBJ', new Set(['breaking']), ['breaking']), 10);
  assert.deepEqual(newThatCounts(adds, 'MJBJ', new Set(['breaking']), ['breaking']), { moves: [], pairs: [] });
});

// ---- looks the same (look.ts; the supervisor: 1-3 and 1-7 read 14% and 10% like 1-1 by moves while built of the same unit) ----
test('looks the same: two stages built of the same pieces and art read alike whatever their moves; different art reads apart', () => {
  const mk = (pieces: Array<[string, number]>, plats: Array<[string, string, number]>) => ({
    platforms: plats.map(([type, style, width], i) => ({ id: i, x: i * 300, y: G, width, height: 40, type, style })),
    meta: { pieces: pieces.map(([k, w], i) => ({ k, x0: i * 1000, x1: i * 1000 + w })) },
  }) as unknown as Stage;
  const a = lookOf(mk([['highrun', 900], ['rest', 300]], [['bouncy', '', 70], ['solid', 'branch', 200], ['solid', 'moss_stone', 600]]));
  const b = lookOf(mk([['highrun', 800], ['rest', 400]], [['bouncy', '', 70], ['solid', 'branch', 220], ['solid', 'moss_stone', 500]]));
  const c = lookOf(mk([['vines', 900], ['stumps', 300]], [['solid', 'log', 600], ['moving', 'raft', 200]]));
  assert.ok(lookAlike(a, b) > 0.9, `same unit: ${lookAlike(a, b)}`);
  assert.ok(lookAlike(a, c) < 0.2, `different: ${lookAlike(a, c)}`);
});

test('clumsy thumb: only jumps toward the shrine count against the floor (1-2\'s 0% jumps were hops back the way he came)', () => {
  const tries = [{ x: 3262, dir: -1 }, { x: 3262, dir: -1 }, { x: 3000, dir: 1 }, { x: 5000, dir: -1 }];
  const t = towardShrine(tries, 4000);
  assert.deepEqual(t.on.map((q) => q.x), [3000, 5000]);
  assert.equal(t.back, 2);
});

test('looks the same: the chase\'s sections and crowns are keyed by the art the engine draws them with, not an empty style (1-8 read 0-4%)', () => {
  assert.equal(artKey({ type: 'solid', chase: true }), 'chase:bough');
  assert.equal(artKey({ type: 'solid', crown: true }), 'chase:crown');
  assert.equal(artKey({ type: 'solid' }), 'solid:branch');
  assert.equal(artKey({ type: 'solid', style: 'moss_stone' }), 'solid:moss_stone');
});

// ---- the fun gate (funcheck.ts: World 1's structure flags may only shrink) ----
test('fun gate: a flag on more layouts than known, or a new one, fails as worse; fewer, or gone, fails until the entry is lowered; equal passes', () => {
  const m = (on: number[]) => new Map([['1-1|normal|dead walk', { stage: '1-1', setting: 'normal' as const, rule: 'dead walk', on, what: '3 s of walking' }]]);
  const known = [{ stage: '1-1', setting: 'normal' as const, rule: 'dead walk', layouts: 2, owner: 'test' }];
  assert.deepEqual(judgeAgainst(m([1, 2]), known), { worse: [], stale: [] });
  assert.equal(judgeAgainst(m([1, 2, 3]), known).worse.length, 1, 'worse');
  assert.equal(judgeAgainst(m([1]), known).stale.length, 1, 'better: lower it');
  assert.equal(judgeAgainst(new Map(), known).stale.length, 1, 'gone: delete it');
  assert.equal(judgeAgainst(m([1, 2]), []).worse.length, 1, 'new');
});

test('fun gate, in the real engine: World 1 layout 1 judged against its own counts passes; one entry less, it fails', () => {
  const now = measure(1);
  const known = [...now.values()].map((e) => ({ stage: e.stage, setting: e.setting, rule: e.rule, layouts: e.on.length, owner: 'test' }));
  assert.ok(known.length > 10);
  assert.deepEqual(judgeAgainst(now, known), { worse: [], stale: [] });
  const r = judgeAgainst(now, known.slice(1));
  assert.equal(r.worse.length, 1, JSON.stringify(r));
  assert.equal(keyOf(known[0]), [...now.keys()][0]);
});

// ---- no credit for pickups (STAGE-RULES §0c.5, Matt via the lead, 2026-11-04) ----
test('moves alike: the same terrain with its petals moved reads as alike (the terrain route decides); new terrain reads as new', () => {
  // (the goal routes differ only because the petals sit elsewhere; the quick routes, which no pickup moves, are the same)
  const a = { str: 'JJUJMJJCJ', quick: 'JJCJ' }, b = { str: 'JMMVJJJCJ', quick: 'JJCJ' };
  assert.equal(movesAlike(a, b), 1);
  // (new terrain: both routes differ)
  const c = { str: 'VVRRVVRR', quick: 'VRVR' };
  assert.ok(movesAlike(a, c) < 0.3, String(movesAlike(a, c)));
});

// ---- the lead's ruling, 2026-11-04: the truer rules gate rebuilt stages; the rest stay on the old rules, the truer count beside ----
test('gated flags: a rebuilt stage (listed, or built on the beat) is held to the truer rules; one not yet rebuilt to the old rules', () => {
  const f = (rule: string, what = '') => ({ rule, what, source: '' });
  // (the truer rules find this stage like an earlier one and with nothing new; the old ones, fooled by its petals, find only a dead walk)
  const ev = { id: '1-9', flags: [f('dead walk'), f('like an earlier stage'), f('nothing new')], oldFlags: [f('dead walk')], built: { stage: {} } } as unknown as StageEval;
  assert.deepEqual(gatedFlags(ev, ['1-1']).map((q) => q.rule), ['dead walk']);
  assert.deepEqual(gatedFlags(ev, ['1-9']).map((q) => q.rule), ['dead walk', 'like an earlier stage', 'nothing new']);
  // (and the other way: a stage the old rules flag but the truer ones clear keeps its old flag until it is rebuilt)
  const ev2 = { id: '1-7', flags: [], oldFlags: [f('like the stage before')], built: { stage: {} } } as unknown as StageEval;
  assert.deepEqual(gatedFlags(ev2, []).map((q) => q.rule), ['like the stage before']);
  assert.deepEqual(gatedFlags(ev2, ['1-7']), []);
  // (a stage built on the music's beat, w1Rhythm.ts, is rebuilt by itself: no list entry needed)
  const ev3 = { ...ev2, id: '1-2', built: { stage: { proto: { rhythm: { bpm: 88, nodes: [] } } } } } as unknown as StageEval;
  assert.deepEqual(gatedFlags(ev3, []), []);
});

test('truer beside: for a stage on the old rule, a move rule whose truer count differs is printed; rebuilt stages and other rules are not', () => {
  const m = (rows: Array<[string, string, number]>) => new Map(rows.map(([stage, rule, n]) => [keyOf({ stage, setting: 'normal', rule }), { stage, setting: 'normal' as const, rule, on: Array.from({ length: n }, (_, i) => i + 1), what: '' }]));
  const gated = m([['1-9', 'like an earlier stage', 10], ['1-9', 'dead walk', 3], ['1-2', 'nothing new', 4]]);
  const truer = m([['1-9', 'like an earlier stage', 12], ['1-9', 'nothing new', 16], ['1-9', 'dead walk', 3], ['1-2', 'nothing new', 9]]);
  const lines = truerBeside(gated, truer, ['1-2']);
  assert.equal(lines.length, 2, lines.join('\n'));
  assert.ok(lines.some((l) => l.includes('1-9 normal "like an earlier stage": gated on the old rule at 10 layouts, 12 by the truer rule')));
  assert.ok(lines.some((l) => l.includes('1-9 normal "nothing new": gated on the old rule at 0 layouts, 16 by the truer rule')));
});

// ---- the validator items, the lead 2026-11-04 (each a truer rule: rebuilt stages are gated on it) ----
test('nothing bites: a fall of over 200 px bites; a missed hop back onto the ground he left does not; a long way out of a pit bites', () => {
  const ground = { x: 0, y: 580, width: 4000 };
  // (from a branch at 335 down to the ground: 245 px lost)
  assert.equal(fallBites(ground, 335, 2000), true);
  assert.equal(fallBites(ground, 580 - FALL_BITE_PX + 10, 2000), false);
  // (a missed hop up a ledge: he lands back where he took off, however long the ground is)
  assert.equal(fallBites(ground, 580, 2000), false);
  // (a soft pit 130 down and 2400 wide, its banks at both ends: the way out is 1200 px off, over 4 s; with a step 60 px off it is a free
  // retry. And 130 down onto open ground, no banks around it, is the way on, not a pit: no bite)
  const pit = { x: 800, y: 710, width: 2400 }, banks = [{ x: 0, y: 580, width: 800 }, { x: 3200, y: 580, width: 800 }];
  assert.equal(fallBites(pit, 580, 2000, [pit, ...banks]), true);
  assert.equal(fallBites(pit, 580, 2000, [pit, ...banks, { x: 2060, y: 655, width: 70 }]), false);
  assert.equal(fallBites(pit, 580, 2000, [pit]), false);
});

test('tempo: a ride or a moving hop is patience only with a real wait (over 1 s); one always in reach is not patience', () => {
  const step: Step = { m: 'X', t: 10, x: 1000, y: 580, what: 'hop onto a moving log or platform' };
  const seg = (plat: Partial<Platform>, x1 = 1100) => ({ kind: 'timedHop', x0: 1000, y0: 580, x1, y1: 580, dt: 0.6, plat: { id: 2, x: x1, y: 580, width: 120, height: 24, type: 'moving', style: 'log', ...plat } });
  const B = (s: unknown) => ({ route: { segs: [s] } }) as unknown as Built;
  // (a short hop to a platform swaying 40 px: always in reach, no wait)
  const near = waitAt(B(seg({ moveRange: 40, moveSpeed: 1 })), step)!;
  assert.ok(near < 0.05, String(near));
  assert.equal(tempoOf(step, near), null);
  // (a long hop to a platform swaying 300 px, slowly: in reach only near its closest swing)
  const far = waitAt(B(seg({ moveRange: 300, moveSpeed: 0.5 }, 1290)), step)!;
  assert.ok(far > WAIT_MIN, String(far));
  assert.equal(tempoOf(step, far), 'patience');
  // (a basket lift that waits 1 s at each stop of an 8 s cycle: he waits about 3 s on average; one that waits 3.6 s of a 7.6 s cycle,
  // 0.1 s on its way, does not make him wait)
  const lift = (wait: number, speed: number) => ({ kind: 'lift', x0: 1000, y0: 580, x1: 1000, y1: 300, dt: 4, plat: { id: 3, x: 990, y: 580, width: 90, height: 20, type: 'moving', style: 'log', lift: { top: 300, bottom: 580, speed, wait, phase: 0 } } });
  const ride: Step = { m: 'V', t: 10, x: 1000, y: 580, what: 'ride the basket lift' };
  assert.equal(tempoOf(ride, waitAt(B(lift(1, 93.3)), ride)), 'patience');
  assert.equal(tempoOf(ride, waitAt(B(lift(3.6, 2800)), ride)), null);
  // (and with no wait known, a ride is no tempo at all)
  assert.equal(tempoOf(ride), null);
});

test('pacing: a dense finale may run tight for 15-20 s; the same burst mid-stage, or a 22 s finale, is flagged', () => {
  const st = (len: number, after: boolean): Stretch[] => [
    { tag: 'I', t0: 0, t1: 15, moves: 'JJ', perSec: 0.2 }, { tag: 'F', t0: 15, t1: 30, moves: 'JJJ', perSec: 0.3 }, { tag: 'R', t0: 30, t1: 35, moves: '', perSec: 0 },
    { tag: 'F', t0: 35, t1: 50, moves: 'JJJ', perSec: 0.3 }, { tag: 'R', t0: 50, t1: 55, moves: '', perSec: 0 },
    { tag: 'T', t0: 55, t1: 55 + len, moves: 'J'.repeat(len * 2), perSec: 2 },
    ...(after ? [{ tag: 'R' as const, t0: 55 + len, t1: 60 + len, moves: '', perSec: 0 }, { tag: 'F' as const, t0: 60 + len, t1: 75 + len, moves: 'JJ', perSec: 0.2 }] : [{ tag: 'R' as const, t0: 55 + len, t1: 60 + len, moves: '', perSec: 0 }]),
  ];
  const tight = (x: Stretch[], truer = true) => paceFlags(x, truer).filter((f) => /tight burst/.test(f.what)).length;
  assert.equal(tight(st(FINALE_TIGHT_MAX, false)), 0);
  assert.equal(tight(st(FINALE_TIGHT_MAX, false), false), 1, 'the old rule flags it');
  assert.equal(tight(st(FINALE_TIGHT_MAX, true)), 1, 'mid-stage');
  assert.equal(tight(st(FINALE_TIGHT_MAX + 5, false)), 1, 'too long a finale');
});

test('pairs: both things in one move; a plain jump is not run+jump, a trunk climb is not vines, a crumbling floor is not slow', () => {
  const mk = (steps: Step[], extra: Record<string, unknown> = {}, segs: unknown[] = []) => ({ steps, route: { segs }, stage: { vines: [{ x: 500, vineType: 'tree_climb' }, { x: 900, vineType: 'swing_liana' }], zones: [], ...extra } }) as unknown as Built;
  const J = (x: number, y = 580): Step => ({ m: 'J', t: 1, x, y, what: 'jump over a gap' });
  assert.deepEqual(pairsMet(mk([J(100), { m: 'C', t: 2, x: 500, y: 580, what: 'grab a trunk or vine and climb' }])), []);
  // (a jump onto a breaking branch: jump, branches and run in one move)
  const frag = { kind: 'jump', x0: 100, y0: 580, x1: 300, y1: 560, dt: 0.8, plat: { type: 'fragile' } };
  assert.deepEqual(pairsMet(mk([J(100)], {}, [frag])), ['run+jump', 'run+branches', 'jump+branches']);
  // (a jump in a wind zone: jump+wind; a jump on World 7's crumbling floor: jump+branches, never slow)
  assert.deepEqual(pairsMet(mk([J(100)], { zones: [{ kind: 'wind', x0: 0, x1: 300, top: 400, bottom: 700 }] })), ['jump+wind']);
  assert.deepEqual(pairsMet(mk([J(100)], { zones: [{ kind: 'crumble', x0: 0, x1: 300, top: 400, bottom: 700 }] })), ['jump+branches']);
  assert.deepEqual(pairsMet(mk([J(100)], { zones: [{ kind: 'web', x0: 0, x1: 300, top: 400, bottom: 700 }] })), ['jump+slow']);
});

test('templates (§0c.2-3): twice in a row, over twice a stage, and a repeat with the same numbers are flagged; a changed repeat is not', () => {
  const u = (template: string, params: string, x0: number) => ({ template, params, x0, x1: x0 + 500 });
  assert.equal(templateFlags([u('stumps', 'a', 0), u('snakes', 'b', 500), u('stumps', 'c', 1000)]).length, 0);
  assert.match(templateFlags([u('stumps', 'a', 0), u('stumps', 'b', 500)])[0].what, /twice in a row/);
  assert.ok(templateFlags([u('a', '1', 0), u('b', '1', 500), u('a', '2', 1000), u('c', '1', 1500), u('a', '3', 2000)]).some((f) => /3 times/.test(f.what)));
  assert.ok(templateFlags([u('a', 'same', 0), u('b', '1', 500), u('a', 'same', 1000)]).some((f) => /same numbers/.test(f.what)));
  // (a beat-built stage's nodes are its units: tag and pair the template, the bars, direction and tier its numbers; rests left out)
  const stage = { proto: { rhythm: { bpm: 96, nodes: [{ tag: 'F', pair: 'run+jump', tier: 'A', dir: 1, bars: ['x...x...'], x0: 0, x1: 400 }, { tag: 'R', pair: '', tier: 'A', dir: 1, bars: [], x0: 400, x1: 600 }, { tag: 'T', pair: 'jump+branches', tier: 'B', dir: -1, bars: ['x.o.x.o.'], x0: 600, x1: 1000 }] } } };
  assert.deepEqual(unitsOf(stage).map((q) => q.template), ['F run+jump', 'T jump+branches']);
  // (and an old stage's pieces, rests left out)
  assert.deepEqual(unitsOf({ meta: { pieces: [{ k: 'rest', x0: 0, x1: 400 }, { k: 'stumps', x0: 400, x1: 1500 }] } }).map((q) => q.template), ['stumps']);
});

test('tempo and map shape against the stage before: the same BPM and beat feel play alike; a climb is not a flat walk', () => {
  const r = (bpm: number, bars: string[]) => rhythmOf({ proto: { rhythm: { bpm, nodes: [{ bars }] } } });
  assert.equal(tempoAlike(r(92, ['x...x...', 'x.x.x...']), r(94, ['x...x...', 'x...x.x.'])), true);
  assert.equal(tempoAlike(r(92, ['x...x...']), r(110, ['x...x...'])), false, 'a different BPM');
  assert.equal(tempoAlike(r(92, ['x...x...']), r(92, ['.o...o..'])), false, 'off the beat');
  assert.equal(tempoAlike(r(92, ['x...']), null), false, 'an old stage has no beat to compare');
  const flat = Array(12).fill(0), climb = Array.from({ length: 12 }, (_, i) => i * 80);
  assert.equal(shapeAlike(flat, flat), 1);
  assert.ok(shapeAlike(flat, climb) < 0.2, String(shapeAlike(flat, climb)));
});

test('rests (STAGE-RULES §2 pacing, the lead 11-04): a pause of 1.0 s with no hard input is a rest on Normal wherever it falls; on Easy it takes 2.0 s', () => {
  const run = (from: number, to: number, every: number): Step[] => Array.from({ length: Math.floor((to - from) / every) + 1 }, (_, i) => ({ m: 'J' as const, t: from + i * every, x: 0, y: G, what: '' }));
  const noRest = (steps: Step[], setting: 'normal' | 'easy') => paceFlags(pacing(steps, 30), true, { steps, setting }).some((f) => /no rest/.test(f.what));
  // (a move every 0.6 s for 25 s, with a 1.5 s pause in the middle: no empty 5 s window, so the old grid saw no rest at all)
  const paused = [...run(0, 12, 0.6), ...run(13.5, 25, 0.6)];
  assert.equal(noRest(paused, 'normal'), false);
  assert.ok(paceFlags(pacing(paused, 30), false).some((f) => /no rest/.test(f.what)), 'the old grid flags it');
  assert.equal(groupsOf(paused, 'normal').length, 2);
  // (the same pause on Easy is under its 2.0 s pad: still one 25 s group)
  assert.equal(noRest(paused, 'easy'), true);
  assert.equal(REST_PAD_SECS.easy, 2);
  // (and a move every 0.8 s for 25 s with no pause at all is flagged on both)
  assert.equal(noRest(run(0, 25, 0.8), 'normal'), true);
  // (small hops are not hard input: a pause filled with them is still a rest)
  const hops = [...run(0, 12, 0.6), { m: 'h' as const, t: 12.6, x: 0, y: G, what: '' }, ...run(13.5, 25, 0.6)];
  assert.equal(noRest(hops, 'normal'), false);
});

// ---- w8-rope2 (R-159.1): rhythm-token repeats and vine snakes ----
// ---- repeats on a beat-traced stage (the lead, 2026-11-04): tokens carry their note value and direction ----
const at130 = (ms: ReadonlyArray<[string, number, number]>): Step[] => {
  // (each move: its letter, beats since the last one, and the height it ends at; 130 BPM)
  let t = 0;
  return ms.map(([m, beats, y], i) => { t += (beats * 60) / 130; return { m: m as Step['m'], t, x: 100 + i * 200, y, what: m }; });
};
test('repeat on a traced stage: the same four moves on the same notes the same way 4 times fail; the same letters on varied notes and heights pass', () => {
  const same: Array<[string, number, number]> = [];
  for (let k = 0; k < 5; k++) same.push(['J', 2, G], ['J', 2, G - 40], ['N', 1, G - 40], ['J', 2, G]);
  const s1 = at130(same);
  assert.ok(repeats(moveString(s1), s1, 130).some((r) => r.kind === '4-run'), 'a truly repetitive traced stage fails');
  const varied: Array<[string, number, number]> = [];
  const notes = [1, 2, 4, 2, 1, 4, 2, 2, 4, 1];
  const ys = [G, G - 40, G - 10, G - 70, G - 20, G - 60, G, G - 30, G - 80, G - 50];
  for (let k = 0; k < 20; k++) varied.push([['J', 'J', 'N', 'J'][k % 4], notes[(k * 3) % 10], ys[(k * 7) % 10]]);
  const s2 = at130(varied);
  assert.deepEqual(repeats(moveString(s2), s2, 130).filter((r) => r.kind === '4-run'), [], 'varied notes and heights are different moves to a thumb');
  // (the letters alone, as on an untraced stage, still read the varied one as the same four moves over and over)
  assert.ok(repeats(moveString(s2), s2).some((r) => r.kind === '4-run'), 'without the beat the letters repeat');
});

test('miss cost: a vine snake (G) bites a grab of its liana, a heart: a setback, never free', () => {
  const r = bare([{ ...floor(100, 2000), height: 90 }], 1900);
  const b = fromStage('fixture', 1, 'normal', r, r.stage as Stage);
  b.steps = [{ m: 'G', t: 1, x: 600, y: G, what: 'snake (vine snake: punched stiff)' }];
  const c = missCost(b);
  assert.equal(c.length, 1);
  assert.equal(c[0].cost, 'setback');
});

// ---- the route takes only the ways the game allows (the lead's ruling, 2026-11-04: 1-2's route fell through its bough, past the trunk
// at its end, and skipped 20 s of play) ----
const branch = (x0: number, x1: number, y: number, id: number, more: Partial<Platform> = {}): Platform => ({ id, x: x0, y, width: x1 - x0, height: 24, type: 'solid', style: 'branch', ...more } as Platform);
const onTop = (r: RealPlay, y: number) => Object.assign(r.stage as Stage & Record<string, any>, { spawnY: y });

test('route: down onto ground right under his own, he walks off an open end, never through it, and never through a trunk at the end', () => {
  // (a branch over the floor, a trunk at its right end: the only way down is off its left end)
  const r = bare([floor(0, 2400, 1), branch(100, 1400, 380, 2), { ...floor(1400, 1490, 3, 0), height: 420, style: 'moss_stone' }], 2200);
  onTop(r, 380);
  const route = findRoute(r.stage as Stage);
  const down = route.segs.filter((g) => g.y1 > g.y0 + 40);
  assert.ok(down.length >= 1, 'it gets down');
  for (const g of down) assert.ok(g.x0 <= 110, `down at x ${g.x0}: through the branch or past the trunk, not off its open left end`);
});

test('route: a jump down past ground in between lands on that ground first', () => {
  // (a ledge high up, the floor beyond a gap, and a ledge in between under the way down: he comes down onto the middle one)
  const r = bare([branch(100, 600, 280, 1), branch(640, 760, 430, 2), floor(700, 2400, 3)], 2200);
  onTop(r, 280);
  const route = findRoute(r.stage as Stage);
  assert.ok(route.segs.some((g) => g.y1 === 430), `the middle ledge is on the way: ${route.segs.map((g) => `${g.kind} ${Math.round(g.x0)},${g.y0}->${Math.round(g.x1)},${g.y1}`).join(' | ')}`);
});

test('route: a fall deeper than a fall zone allows, inside the zone, is a respawn, never the way down', () => {
  // (a branch over the floor, its right end inside a fall zone 150 px deep and 200 px over the floor: the way down is its left end)
  const r = bare([floor(0, 2400, 1), branch(100, 800, 380, 2)], 2200);
  onTop(r, 380);
  (r.stage as Stage & Record<string, any>).spawnX = 700;
  (r.stage as Stage & Record<string, any>).fallZones = [{ x0: 600, x1: 1000, depth: 150 }];
  const down = findRoute(r.stage as Stage).segs.filter((g) => g.y1 > g.y0 + 40);
  for (const g of down) assert.ok(g.x0 <= 110, `down at x ${g.x0}, inside the fall zone`);
  // (and without the zone the right end, the nearer way to the shrine, is taken: the fixture shows the zone is what moved it)
  delete (r.stage as Stage & Record<string, any>).fallZones;
  assert.ok(findRoute(r.stage as Stage).segs.some((g) => g.y1 > g.y0 + 40 && g.x0 >= 790), 'without the zone, off the right end');
});

test('beats: rotten wood that goes before a run gets across it is a hop; rotten wood that holds a run is walked', () => {
  const rot = (creak: number) => {
    const r = bare([floor(100, 600, 1), { ...floor(600, 760, 2), height: 24, type: 'fragile', style: 'branch', creak } as Platform, floor(760, 2200, 3)], 2000);
    return fromStage('fixture', 1, 'normal', r, r.stage as Stage).steps.filter((s) => /rotten wood/.test(s.what)).length;
  };
  assert.equal(rot(0.25), 1, 'a 160 px stretch that holds 0.25 s (0.56 s to run it) is a hop');
  assert.equal(rot(1.0), 0, 'one that holds 1 s is walked');
});
