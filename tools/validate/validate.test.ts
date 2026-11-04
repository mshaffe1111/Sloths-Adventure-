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
import { gatedFlags, judgeAgainst, keyOf, measure, truerBeside } from './funcheck.ts';
import { movesAlike } from './evaluate.ts';
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

// ---- the lead's ruling, 2026-11-04: the truer move rule gates rebuilt stages; the rest stay on the old rule, the truer count beside ----
test('gated flags: a rebuilt stage is held to the truer move rule; one not yet rebuilt to the old rule, its other rules unchanged', () => {
  const f = (rule: string, what = '') => ({ rule, what, source: '' });
  // (the truer rule finds this stage like an earlier one and with nothing new; the old rule, fooled by its petals, finds neither)
  const ev = { id: '1-9', flags: [f('dead walk'), f('like an earlier stage'), f('nothing new')], oldFlags: [] } as unknown as StageEval;
  assert.deepEqual(gatedFlags(ev, ['1-1']).map((q) => q.rule), ['dead walk']);
  assert.deepEqual(gatedFlags(ev, ['1-9']).map((q) => q.rule), ['dead walk', 'like an earlier stage', 'nothing new']);
  // (and the other way: a stage the old rule flags but the truer one clears keeps its old flag until it is rebuilt)
  const ev2 = { id: '1-7', flags: [], oldFlags: [f('like the stage before')] } as unknown as StageEval;
  assert.deepEqual(gatedFlags(ev2, []).map((q) => q.rule), ['like the stage before']);
  assert.deepEqual(gatedFlags(ev2, ['1-7']), []);
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
