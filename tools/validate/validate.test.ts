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
import { branchOutrunWith, cameraOn, chaseOutrunWith, eagleOutrunWith } from './play.ts';
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
    ['J', 'jump over a gap', 'J'], ['J', 'big jump up', 'J'], ['h', 'small hop', 'j'], ['h', 'hop up a step', 'h'], ['J', 'mushroom bounce', 'M'],
    ['J', 'hop onto a moving log or platform', 'X'], ['V', 'grab a trunk or vine and climb', 'C'], ['V', 'swing on a liana', 'V'], ['V', 'shimmy along a rope', 'R'],
    ['Z', 'crumbling branch', 'B'], ['Z', 'the branch collapses behind him: keep running', 'B'], ['Z', 'wind gust', 'W'], ['Z', 'sticky web slows him', 'S'],
    ['P', 'puzzle room (seesaw)', 'P'], ['C', 'snake', 'F'], ['Z', 'eagle sweep: duck into a bush', 'E'], ['Z', 'darkness: wake the glowworms, find the way', 'D'],
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

// ---- pacing ----
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
const branchWorld = (crumble: number | undefined, w: number) => () => {
  const ps: Platform[] = [floor(0, 600, 1, 412)];
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
});

test('tempo: breaking branches are hurry, the eagle and waits are patience, a plain jump is neither', () => {
  assert.equal(tempoOf({ m: 'B', t: 0, x: 0, y: 0, what: 'crumbling branch' }), 'hurry');
  assert.equal(tempoOf({ m: 'E', t: 0, x: 0, y: 0, what: 'eagle sweep: duck into a bush' }), 'patience');
  assert.equal(tempoOf({ m: 'P', t: 0, x: 0, y: 0, what: 'stand still: the fern unrolls' }), 'patience');
  assert.equal(tempoOf({ m: 'J', t: 0, x: 0, y: 0, what: 'jump over a gap' }), null);
});
