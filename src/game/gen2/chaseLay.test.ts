// B5 CHASE-LAY (ENGINE-678; 1-8.md NEW 1, 7): the job K lays a chase on any world's kit. Each test is red without chaseLay.ts and K out of
// LATER (nodeLetters.ts): a K graph was refused by V13, and no stage carried `chase` or a chase section.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { applyVerdicts, buildGen2Stage } from './pipeline.ts';
import { CHASE_LAY, chaseCap, chaseFloor, cutSections, layChase } from './chaseLay.ts';
import { checkCode, parseCode } from './nodeCode.ts';
import { mixKit } from './toyLegs.ts';
import { towerCfg } from './toyTower.ts';
import { w1World } from './worlds/w1.ts';
import { BRANCH_TILE } from '../protoStage.ts';
import { chaseLayProblems, sectionStretch } from '../chase.ts';
import { generateAllLevels } from '../worldsData.ts';
import { withTestStage } from './listed.ts';
import { JUDGED } from './reach.ts';
import { keptFoes } from './pipeline.ts';
import { packPlan, plantSeedList } from './seedList.ts';
import { RealPlay, withFixtureConfig } from '../realPlay.ts';
import { difficulty as getDifficulty, setDifficulty } from '../difficulty.ts';
import type { Gen2Stage, WorldKit } from './types.ts';
import type { LevelConfig, Platform } from '../types.ts';

const W1 = w1World();
/** a fixture stage, no stage of the game: World 1's real kit and 1-1's brief, late in the world (V13: never a world's first stage) */
const ID = '1-98';
const CFG: LevelConfig = { ...generateAllLevels().find((l) => l.id === '1-1')!, id: ID, miniIndex: 8 };
const CODE = 'A T P F R K R K R S E';
/** 1-1's brief for a chase stage: its lessons, trend and reach, with no fork added and no deal (the mix rules are 1-1's pool's, not the
 *  chase's: a fixture graph that 1-1's pool was never cut for fails them on most rolls) */
const BRIEF = { ...W1.manifest.graphs!.briefs['1-1'], branching: 'none' as const, deal: undefined };
const kitK = (code: string): WorldKit => {
  const G = W1.manifest.graphs!;
  // (1-1's own pool: the sections it feels and owns are the fixture's too)
  const sections = W1.manifest.sections.map((t) => (t.feel?.includes('1-1') ? { ...t, feel: [...t.feel, ID] } : t));
  const owns = W1.manifest.owns?.['1-1'] ? { owns: { ...W1.manifest.owns, [ID]: W1.manifest.owns['1-1'] } } : {};
  return { ...W1, manifest: { ...W1.manifest, sections, ...owns, graphs: { ...G, list: [{ id: 'k', archetype: 'sprint', code }], briefs: { ...G.briefs, [ID]: BRIEF } } } };
};
/** the fixture listed for the call, judged on 1-1's reach scope (reach.ts JUDGED), as 1-1's own rolls are */
const inFixture = <T,>(fn: () => T): T => withTestStage({ [ID]: { kit: () => kitK(CODE), seeds: [], scope: JUDGED['1-1'] } }, fn);
const SEEDS = Array.from({ length: 30 }, (_, i) => i + 1);
const build = (seed: number, difficulty: 'normal' | 'easy' = 'normal', code = CODE) => inFixture(() => buildGen2Stage({ config: CFG, kit: kitK(code), seed, difficulty }));
const chaseErr = (st: Gen2Stage) => st.gen2.errors.filter((e) => /^chase:|^flags:/.test(e));
const rolls = SEEDS.map((s) => ({ s, st: build(s) }));
const laid = rolls.filter((r) => r.st.chase && !chaseErr(r.st).length);
let easyLaid = 0;

test('K is a chase node now (out of LATER), still never in a world\'s first stage (V13)', () => {
  assert.deepEqual(checkCode(parseCode('A T K R S E'), { mini: 2 }).filter((e) => /^V13/.test(e)), []);
  assert.ok(checkCode(parseCode('A T K R S E'), { mini: 1 }).some((e) => /^V13.*chase never in a world's first stage/.test(e)));
});

test('the cut keeps his ground: contiguous branch sections, the same top and depth, the first is the piece itself', () => {
  assert.equal(CHASE_LAY.tile, BRANCH_TILE, "the lay's section is the long-branch sheet's (protoStage.ts BRANCH_TILE)");
  let id = 50;
  const p: Platform = { id: 7, x: 100, y: 600, width: 1000, height: 260, type: 'solid' };
  const cut = cutSections(p, () => ++id);
  assert.equal(cut[0], p, 'the first section IS the piece (every reference to it holds)');
  assert.equal(cut.length, 5);
  assert.equal(cut.reduce((a, q) => a + q.width, 0), 1000);
  cut.forEach((q, k) => {
    assert.equal(q.chase, true);
    assert.equal(q.y, 600);
    assert.equal(q.height, 260, 'the depth is kept: the same union of solids the verdicts judged');
    if (k) assert.equal(q.x, cut[k - 1].x + cut[k - 1].width, 'no gap, no overlap');
  });
  assert.equal(new Set(cut.map((q) => q.id)).size, 5);
  assert.equal(cutSections({ id: 1, x: 0, y: 0, width: 150, height: 40, type: 'solid' }, () => ++id).length, 1);
});

test('K lays a chase on World 1\'s kit: each K one stretch or more (each within the flag-span cap), only its route ground falls, a flag before every crack and none inside', () => {
  assert.ok(laid.length >= 2, `a chase is laid cleanly on ${laid.length} of ${SEEDS.length} rolls`);
  for (const { s, st } of laid) {
    const lay = st.chase!;
    const ks = st.gen2.graph.nodes.filter((n) => n.job === 'pressure');
    assert.ok(lay.stretches.length >= ks.length, `${s}: at least one stretch per K (a long K is split at a living fork)`);
    assert.deepEqual(chaseLayProblems(lay), [], `${s}`);
    for (const t of lay.stretches) assert.ok(t.end - t.start <= chaseCap() && t.end - t.start >= chaseFloor(), `${s}: a stretch of ${t.end - t.start} px (${chaseFloor()}-${chaseCap()}: the floor from the Normal row, the cap from the flag span)`);
    const chased = st.platforms.filter((p) => p.chase);
    assert.ok(chased.length >= lay.stretches.length * 3, `${s}: ${chased.length} branch sections`);
    for (const p of chased) {
      assert.ok(sectionStretch(lay, p.x, p.x + p.width) >= 0, `${s}: the section at x ${p.x} is on a stretch, never on a fork`);
      assert.ok(p.width <= CHASE_LAY.tile * 1.5, `${s}: the section at x ${p.x} is ${p.width} px (a branch section, not a whole piece)`);
    }
    // (every stretch breaks ground, and every fork has ground that never falls)
    lay.stretches.forEach((t, k) => {
      assert.ok(chased.some((p) => sectionStretch(lay, p.x, p.x + p.width) === k), `${s}: stretch ${k + 1} breaks some ground`);
      const next = lay.stretches[k + 1]?.start ?? st.exitTotemX;
      assert.ok(st.platforms.some((p) => !p.chase && p.type === 'solid' && p.x < next && p.x + p.width > t.end), `${s}: fork ${k + 1} has ground`);
    });
    const xs = (st.checkpoints ?? []).map((c) => c.x);
    lay.stretches.forEach((t, k) => {
      assert.ok(!xs.some((x) => x > t.start && x < t.end), `${s}: no flag inside ${t.start}-${t.end} (${xs})`);
      // (the first crack: a flag within flagBefore of it; every later one: a flag on its fork, after the stretch before it)
      const from = k ? lay.stretches[k - 1].end : t.start - CHASE_LAY.flagBefore;
      assert.ok(xs.some((x) => x <= t.start && x >= from), `${s}: a flag on the ground before the crack at ${t.start}, from x ${from} (${xs})`);
    });
    const sorted = [...xs].sort((a, b) => a - b);
    sorted.slice(1).forEach((x, k) => assert.ok(x - sorted[k] <= 4000, `${s}: flags ${sorted[k]} -> ${x} within Matt's 4,000 px`));
    // (Easy is Normal's plan laid under Easy's rules (its own gaps, so its own x): the same K nodes, each a stretch, or refused by name)
    const easy = build(s, 'easy');
    if (easy.chase && !chaseErr(easy).length) easyLaid++;
    if (easy.chase) assert.ok(easy.chase.stretches.length >= ks.length, `${s}: Easy lays at least one stretch per K`);
    else assert.ok(easy.gen2.errors.some((e) => /^chase: |^flags: /.test(e)), `${s}: Easy names why it lays none`);
  }
  // (the yield, ENG-B4: each stretch ends where the flag before it, standing where it really stands, reaches one after it; Easy carries
  // Normal's errors judged on Normal's LAID stage; a stale flag miss never stands. B3 laid 15 Normal / 23 Easy of these 30; B4 30 / 30)
  assert.ok(laid.length >= 27, `Normal lays a clean chase on ${laid.length} of ${SEEDS.length} rolls (at least 27)`);
  assert.ok(easyLaid >= 27, `Easy lays a clean chase on ${easyLaid} of the ${laid.length} Normal laid (at least 27)`);
});

test('a K roll that cannot hold the flag rule or a stretch is refused by name, and no stage without K changes', () => {
  // (the flag rule is Matt's (no span over 4,000 px, D49): a stretch plus its fork over it fails the roll, never a flag inside a stretch)
  // (every refusal names its rule; the hand-built lays below plant each refusal, and the yield above holds how few there are)
  const refused = rolls.filter((r) => chaseErr(r.st).length);
  for (const { s, st } of refused) assert.ok(chaseErr(st).every((e) => /^chase: |^flags: /.test(e)), `${s}: named (${chaseErr(st)})`);
  for (const { st } of refused.filter((r) => r.st.gen2.errors.some((e) => /^chase: /.test(e)))) assert.equal(st.chase, undefined, 'a refused lay lays nothing');
  // (a graph with no K: the brick does nothing)
  const plain = build(1, 'normal', 'A T P F R X R S E');
  assert.equal(plain.chase, undefined);
  assert.ok(!plain.platforms.some((p) => p.chase));
});

/** a stage the brick reads (graph nodes, sections, platforms, flags), built by hand: [job, x0, x1] per node */
function handStage(nodes: Array<[string, number, number]>, ground: Array<[number, number]> = nodes.map(([, a, b]) => [a, b])) {
  const platforms: Platform[] = ground.map(([a, b], i) => ({ id: i + 1, x: a, y: 600, width: b - a, height: 40, type: 'solid' }));
  const st = {
    config: { levelWidth: nodes.at(-1)![2] },
    spawnX: 140,
    platforms,
    checkpoints: [],
    gen2: { graph: { nodes: nodes.map(([job], i) => ({ id: `n${i + 1}`, job })) }, sections: nodes.map(([, x0, x1], i) => ({ uid: `s${i + 1}`, node: `n${i + 1}`, x0, x1 })) },
  } as unknown as Gen2Stage;
  // (a section's pieces: the ground whose middle lies in its node's span)
  const main = (uid: string) => {
    const [, x0, x1] = nodes[+uid.slice(1) - 1];
    return platforms.filter((p) => p.x + p.width / 2 >= x0 && p.x + p.width / 2 <= x1).map((platform) => ({ platform, main: true }));
  };
  return { st, main, before: JSON.stringify(platforms) };
}

test('a lay that cannot run is refused by name and lays nothing (too long with nowhere to stop, no fork, a short fork, no ground); a long K is split', () => {
  const cases: Array<[string, Array<[string, number, number]>, RegExp, Array<[number, number]>?]> = [
    ['too long', [['arrive', 0, 1000], ['pressure', 1000, 5200], ['rest', 5200, 6400], ['exit', 6400, 7000]], /n2 \(K\) runs 4200 px from x 1000 with no piece 300 px wide to stop on that the flag at x \d+ reaches within 4000 px/],
    ['no fork', [['arrive', 0, 1000], ['pressure', 1000, 3000], ['pressure', 3000, 5000], ['rest', 5000, 6000], ['exit', 6000, 7000]], /n2 \(K\) runs straight into n3 \(K\) with no living fork/],
    ['short fork', [['arrive', 0, 1000], ['pressure', 1000, 3000], ['rest', 3000, 3200], ['pressure', 3200, 5000], ['exit', 5000, 7000]], /the fork after n2 \(K\) is 200 px \(at least 300\)/],
    ['no ground', [['arrive', 0, 1000], ['pressure', 1000, 3000], ['rest', 3000, 4000], ['exit', 4000, 5000]], /stretch 1 \(n2\) has no plain ground to break/, [[0, 1000], [3000, 4000], [4000, 5000]]],
  ];
  for (const [name, nodes, want, ground] of cases) {
    const { st, main, before } = handStage(nodes, ground);
    const r = layChase(st, ground ? (uid) => main(uid).filter((q) => q.platform.x !== 1000) : main);
    assert.ok(r.problems.some((p) => want.test(p)), `${name}: ${r.problems}`);
    assert.equal(st.chase, undefined, `${name}: nothing laid`);
    if (name !== 'no ground') assert.equal(JSON.stringify(st.platforms), before, `${name}: the ground untouched`);
  }
  // (and a good one lays: two stretches, the flag before each crack on the ground before it)
  const { st, main } = handStage([['arrive', 0, 1600], ['pressure', 1600, 3800], ['rest', 3800, 4800], ['pressure', 4800, 7000], ['rest', 7000, 8000], ['exit', 8000, 8600]]);
  const r = layChase(st, main);
  assert.deepEqual(r.problems, []);
  assert.deepEqual(st.chase, { stretches: [{ start: 1600, end: 3800 }, { start: 4800, end: 7000 }] });
  assert.deepEqual(r.stretches.map((t) => t.flag! <= t.start && t.flag! >= t.start - CHASE_LAY.flagBefore), [true, true]);
  // (more, shorter stretches: a K node over the cap is split at a piece wide enough to stop on, which stays whole with a flag on it)
  const long = handStage([['arrive', 0, 1600], ['pressure', 1600, 7400], ['rest', 7400, 8400], ['exit', 8400, 9000]], [[0, 1600], [1600, 4000], [4000, 4400], [4400, 7400], [7400, 8400], [8400, 9000]]);
  const r2 = layChase(long.st, long.main);
  assert.deepEqual(r2.problems, []);
  assert.deepEqual(long.st.chase, { stretches: [{ start: 1600, end: 4000 }, { start: 4400, end: 7400 }] });
  assert.ok(!long.st.platforms.some((p) => p.chase && p.x >= 4000 && p.x < 4400), 'the stop piece never falls');
  assert.ok((long.st.checkpoints ?? []).some((c) => c.x >= 4000 && c.x <= 4400), 'and carries the flag before the next crack');
});

test('ENG-B4: a stretch ends where the flag before it really stands reaches a flag after it (the realised run-up), never under the floor; the finale after the last K is the last stretch', () => {
  // (the ground before the crack ends 400 px short of it, so its flag stands 480 px back: a K of 3,700 px fits the cap but its fork's
  // first spot is past that flag's 4,000 px. B3's lay laid one stretch and refused the roll ("no spot ... after the last stretch"); the
  // lay now ends the first stretch at the stop piece that flag reaches and runs the rest as a second stretch)
  const far = handStage([['arrive', 0, 1600], ['pressure', 1600, 5300], ['rest', 5300, 6300], ['exit', 6300, 7000]], [[0, 1200], [1600, 3000], [3000, 3400], [3400, 5300], [5300, 6300], [6300, 7000]]);
  const r = layChase(far.st, far.main);
  assert.deepEqual(r.problems, []);
  assert.deepEqual(far.st.chase, { stretches: [{ start: 1600, end: 3000 }, { start: 3400, end: 5300 }] });
  const xs = (far.st.checkpoints ?? []).map((c) => c.x).sort((a, b) => a - b);
  xs.slice(1).forEach((x, k) => assert.ok(x - xs[k] >= 900 && x - xs[k] <= 4000, `flags ${xs[k]} -> ${x}: Matt's span`));
  assert.ok(xs.some((x) => x >= 3000 && x <= 3400), `the stop piece carries the flag before the second crack (${xs})`);
  // (the floor: Normal's front reaches a stretch's first section under him only once he is behind x maxRun / base px in)
  assert.equal(chaseFloor(), 645);
  const short = handStage([['arrive', 0, 1600], ['pressure', 1600, 2100], ['rest', 2100, 3100], ['exit', 3100, 3700]]);
  assert.ok(layChase(short.st, short.main).problems.some((p) => /n2 \(K\) is 500 px, under the 645 px/.test(p)));
  assert.equal(short.st.chase, undefined);
  // (CHASE-FINISH: L after the last K is the last stretch, its front at the row's final burst (chase.ts planOf); none without an L)
  const fin = handStage([['arrive', 0, 1600], ['pressure', 1600, 3800], ['rest', 3800, 4800], ['finale', 4800, 7000], ['exit', 7000, 8000]]);
  assert.deepEqual(layChase(fin.st, fin.main).problems, []);
  assert.deepEqual(fin.st.chase, { stretches: [{ start: 1600, end: 3800 }, { start: 4800, end: 7000, last: true }] });
  assert.ok(fin.st.platforms.some((p) => p.chase && p.x >= 4800 && p.x < 7000), 'the finale\'s ground falls');
  const noFin = handStage([['arrive', 0, 1600], ['pressure', 1600, 3800], ['rest', 3800, 4800], ['exit', 4800, 6000]]);
  layChase(noFin.st, noFin.main);
  assert.ok(!noFin.st.chase!.stretches.some((t) => t.last), 'no finale: no last burst');
});

test('ENG-B4: the verdicts are judged afresh: a flag miss left by an earlier judgement never refuses a roll whose own flags pass', () => {
  inFixture(() => {
    const req = { config: CFG, kit: kitK(CODE), seed: laid[0].s, difficulty: 'normal' as const };
    const st = buildGen2Stage(req);
    assert.equal(st.gen2.flagMiss, undefined, 'a laid roll\'s flags pass');
    st.gen2.flagMiss = ['flags: a miss from before the lay'];
    applyVerdicts(st, req);
    assert.equal(st.gen2.flagMiss, undefined, 'the stale miss is gone');
  });
});

test('a second kit lays K by the same brick (the legs fixture): laid or refused by name, never a crash', () => {
  const cfg = towerCfg('5-95', 'sprint');
  let n = 0;
  for (const s of [1, 2, 3, 4, 5, 6]) {
    let st: Gen2Stage;
    try { st = buildGen2Stage({ config: cfg, kit: mixKit('5-95', 'A T K R K R S E'), seed: s, difficulty: 'normal' }); } catch (e) {
      assert.match((e as Error).message, /gen2 5-95/, `${s}: a refusal by name`);
      continue;
    }
    if (st.chase) {
      n++;
      assert.deepEqual(chaseLayProblems(st.chase), []);
      assert.ok(st.platforms.filter((p) => p.chase).every((p) => sectionStretch(st.chase!, p.x, p.x + p.width) >= 0));
    } else assert.ok(st.gen2.errors.some((e) => /^chase: /.test(e)) || !st.gen2.graph.nodes.some((q) => q.job === 'pressure'), `${s}: no chase and no named reason`);
  }
  assert.ok(n >= 1, `the legs fixture lays a chase on ${n} of 6 rolls`);
});

/** the engine's own stage start on the fixture: its seed planted as a proven list (the roll replayed as Play replays one), towerFly.ts's way */
function withChaseSim<T>(seed: number, setting: 'normal' | 'easy', fn: (sim: RealPlay) => T): T {
  return inFixture(() => {
    const st = buildGen2Stage({ config: CFG, kit: kitK(CODE), seed, difficulty: 'normal' });
    assert.deepEqual(st.gen2.errors, [], `seed ${seed} builds cleanly`);
    const dict: string[] = [];
    const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
    const undo = plantSeedList(ID, { dict, seeds: [seed], plans: [packed] });
    const was = getDifficulty();
    try {
      setDifficulty(setting);
      return withFixtureConfig(CFG, () => fn(new RealPlay(ID, seed)));
    } finally {
      setDifficulty(was);
      undo();
    }
  });
}

test('in play (the engine\'s own stage start): the chase piece runs it, the plain ground pass draws none of its sections, flags as laid', () => {
  // (the engine plays only a roll with no error at all: the first such chase roll on the walk; 1-1's own roll rules refuse most, none of
  // them the chase's: test 4 reads those)
  // (and on both settings, as a proven list keeps only a seed clean on both: seedList.ts)
  const both = (s: number, st: Gen2Stage) => !!st.chase && !st.gen2.errors.length && !build(s, 'easy').gen2.errors.length;
  let clean: { s: number; st: Gen2Stage } | undefined = laid.find((r) => both(r.s, r.st));
  for (let s = SEEDS.length + 1; !clean && s <= 200; s++) { const st = build(s); if (both(s, st)) clean = { s, st }; }
  assert.ok(clean, 'a roll with a chase builds wholly clean');
  const { s, st } = clean;
  const easy = build(s, 'easy');
  for (const setting of ['normal', 'easy'] as const) {
    withChaseSim(s, setting, (sim) => {
      const e = sim.e as unknown as { drawPlats: Platform[]; pieces: Array<{ kind: string }>; platforms: Platform[] };
      const held = sim.stage as Gen2Stage;
      // (Easy: Normal's plan laid under Easy's rules, the lay's own Easy build)
      const want = setting === 'normal' ? st : easy;
      assert.deepEqual(held.chase, want.chase, `${setting}: the stage the engine holds carries the lay`);
      const xs = (held.checkpoints ?? []).map((c) => c.x);
      // (Normal: exactly the lay's flags; Easy adds its own between them (easyMode.ts), never one inside a stretch)
      if (setting === 'normal') assert.deepEqual(xs, (want.checkpoints ?? []).map((c) => c.x), 'normal: no pass after the lay moved a flag');
      else for (const c of want.checkpoints ?? []) assert.ok(xs.includes(c.x), `easy: the lay's flag at ${c.x} stands`);
      for (const t of held.chase!.stretches) assert.ok(!xs.some((x) => x > t.start && x < t.end), `${setting}: no flag inside ${t.start}-${t.end} (${xs})`);
      const chased = e.platforms.filter((p) => p.chase);
      assert.ok(chased.length > 0);
      assert.ok(!e.drawPlats.some((p) => p.chase), `${setting}: drawPlats holds none of its ${chased.length} sections`);
      assert.ok(e.pieces.some((p) => p.kind === 'chase'), `${setting}: the chase piece started`);
    });
  }
});
