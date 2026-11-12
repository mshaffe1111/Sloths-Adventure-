// The roll verdicts (R-165.61, ADR-001, packet E0a): a planted 1-1 roll that fails by EACH name that can fail in a flown scope, and one
// that passes; reach.unflown stated in an unflown scope's notJudged; the old closed-form figures gone from the verdict path; and outside
// THE BOUNDARY (5-7, a World 7 stage) the build is main's, byte for byte, with every name notJudged.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import '../headlessDom.ts';
import { ALL_VERDICTS, ARC_VERDICTS, firstRunVerdicts, judgeRoll, NOT_JUDGED_ALL, type Judged11 } from './verdicts.ts';
import { APEX, BANDS, BODY_H, FLOWN_ARCS, gapEnvelope, lesserArcs, linkArcs, riseEnvelope } from './reach.ts';
import { PROMISES_11 } from './promises11.ts';
import { gapFor, maxGap, riseCap, riseLimit } from './pipeline.ts';
import { jumpOK } from '../levelCheck.ts';
import { buildGen2ForGame, GEN2_STAGES } from './game.ts';
import { generateAllLevels } from '../worldsData.ts';
import type { Difficulty } from '../difficulty.ts';
import type { Platform } from '../types.ts';
import type { Drop, JudgedStage, RollVerdict, SectionKind, VerdictName } from './verdicts.types.ts';

const G = 600;
const P = (id: number, x: number, y: number, width: number, height = 300): Platform => ({ id, x, y, width, height, type: 'solid', style: 'moss_stone' });
/** a clean 1-1 built stage: one floor, a teach node, and after it a 260 px gap with ground 200 px under it (only the double crosses) */
const builtClean = () => ({
  platforms: [P(1, 0, G, 1000), P(2, 1260, G, 1000), P(3, 1000, G + 200, 260)],
  config: { levelHeight: 2000 }, gen2: { nodes: [{ token: 'Tg2>', x0: 0 }], brief: { teaches: ['double'] } }, // (its brief teaches the double, as 1-1's: the double's promises run by the brief)
});
type Ask = JudgedStage['asks'][number];
const ask = (kind: SectionKind, figure: number, over: Partial<Ask> = {}): Ask =>
  ({ section: 's1', kind, x0: 400, x1: 400 + (kind.endsWith('gap') ? figure : 80), figure, move: kind.startsWith('single') ? 'single-flick' : kind.startsWith('double') ? 'double-flick' : 'bounce-air', headroom: 9999, ...over });
const soft = (x0: number, x1: number): Drop => ({ x0, x1, lipY: G, ends: { kind: 'floor', y: G + 200 }, look: 'ground' });
function roll(setting: Difficulty, over: Partial<Judged11> & { built?: unknown } = {}): RollVerdict {
  const st = { stageId: '1-1', setting, policy: 'no-lethal', drops: [soft(1000, 1260)], asks: [], routeGaps: [[1000, 1260]], built: builtClean(), ...over } as Judged11;
  return judgeRoll(st, PROMISES_11);
}
const names = (v: RollVerdict) => (v.accepted ? [] : v.failed.map((f) => f.name));
/** a planted roll refused by `name` (shown), its clean twin accepted */
function planted(name: VerdictName, setting: Difficulty, over: Partial<Judged11> & { built?: unknown }, t: { diagnostic: (s: string) => void }) {
  const v = roll(setting, over);
  assert.equal(v.accepted, false, `${name}: the planted roll is accepted`);
  assert.ok(names(v).includes(name), `${name}: refused by ${names(v).join(', ')}`);
  if (!v.accepted) t.diagnostic(`red: ${v.failed.filter((f) => f.name === name).map((f) => `${f.name}: ${f.line}`).join(' | ')}`);
}

test('the clean planted 1-1 roll is accepted on both settings, nothing left unjudged but the first run (judged on its layout)', () => {
  for (const s of ['normal', 'easy'] as const) {
    const v = roll(s, { asks: [ask('single-gap', 100), ask('double-teach-rise', s === 'easy' ? 130 : 138)] });
    assert.deepEqual(names(v), [], `${s}: ${names(v)}`);
    assert.equal(v.accepted, true);
    assert.deepEqual(v.notJudged, s === 'normal' ? ['first-run.drift'] : ['first-run.drift', 'teach.double-no-gap-after', 'teach.double-gap-unsafe']);
  }
});

test('ALL_VERDICTS is the union, in order, read off verdicts.types.ts', () => {
  const src = fs.readFileSync(new URL('./verdicts.types.ts', import.meta.url), 'utf8');
  const union = [...src.slice(src.indexOf('export type VerdictName'), src.indexOf('export interface Measure')).matchAll(/\| '([a-z0-9.-]+)'/g)].map((m) => m[1]);
  assert.deepEqual([...ALL_VERDICTS], union);
  assert.equal(union.length, 17);
});

test('arc.single-gap-over: Easy 140 px is past a flick from 70 px (132); Normal 150 past the 143 band rule', (t) => {
  planted('arc.single-gap-over', 'easy', { asks: [ask('single-gap', 140)] }, t);
  planted('arc.single-gap-over', 'normal', { asks: [ask('single-gap', 150)] }, t);
  assert.deepEqual(names(roll('easy', { asks: [ask('single-gap', 110)] })), []);
});
test('arc.single-rise-over: a 120 px single rise is over the flick climb (117, thin)', (t) => {
  planted('arc.single-rise-over', 'normal', { asks: [ask('single-rise', 120)] }, t);
});
test('block.lesser-passes: a 200 px "double" gap one jump crosses (246); a 120 px "double" rise one jump climbs (123); a 212 px bounce lip a bounce alone climbs (223)', (t) => {
  planted('block.lesser-passes', 'normal', { asks: [ask('double-test-gap', 200)] }, t);
  planted('block.lesser-passes', 'easy', { asks: [ask('double-teach-rise', 120)] }, t);
  planted('block.lesser-passes', 'normal', { asks: [ask('bounce-teach', 212)] }, t);
});
test('block.spare-thin: a 126 px double rise, 3 px over one jump\'s 123, under the 5 px spare', (t) => {
  planted('block.spare-thin', 'easy', { asks: [ask('double-teach-rise', 126)] }, t);
});
test('block.taught-fails: a 300 px double gap past the double flick from 70 px (283); a 330 px bounce lip past bounce + air jump (317)', (t) => {
  planted('block.taught-fails', 'normal', { asks: [ask('double-test-gap', 300)] }, t);
  planted('block.taught-fails', 'easy', { asks: [ask('bounce-air-test', 330)] }, t);
});
test('band.out: over, under, and a band that is none (Easy\'s double gap)', (t) => {
  planted('band.out', 'normal', { asks: [ask('double-teach-rise', 142)] }, t);
  planted('band.out', 'easy', { asks: [ask('bounce-teach', 228)] }, t);
  planted('band.out', 'easy', { asks: [ask('double-test-gap', 256)] }, t);
  assert.deepEqual(names(roll('normal', { asks: [ask('double-test-gap', 256)] })), [], 'Normal 256: inside 252-262');
});
test('headroom.cuts-arc: a bough 120 px over a single gap\'s take-off (needs 97.2 + 48)', (t) => {
  planted('headroom.cuts-arc', 'normal', { asks: [ask('single-gap', 100, { headroom: 120 })] }, t);
  assert.equal(APEX['single-flick'].px + BODY_H.px, 145.2);
  assert.deepEqual(names(roll('normal', { asks: [ask('single-gap', 100, { headroom: 146 })] })), []);
});
test('floor.unmarked: a floorless gap World 1 reads as water, outside a soft zone', (t) => {
  const b = builtClean();
  planted('floor.unmarked', 'easy', { built: { ...b, platforms: [...b.platforms, P(9, 2600, G, 400)] }, routeGaps: [], drops: [] }, t);
});
test('drop.lethal-in-no-lethal: a water drop on 1-1 (warned, drawn as water)', (t) => {
  const water: Drop = { x0: 1000, x1: 1300, lipY: G, ends: { kind: 'life', cause: 'water' }, look: 'water-art', warn: { dotLine: 'Careful!', leadPx: 480, sign: true } };
  planted('drop.lethal-in-no-lethal', 'normal', { drops: [water] }, t);
  assert.ok(!names(roll('normal', { drops: [water], policy: 'per-gap' })).length, 'the same drop on a per-gap stage is fair');
});
test('drop.unwarned: a lethal drop with no Dot line, and one with no sign', (t) => {
  const bare = { x0: 1000, x1: 1300, lipY: G, ends: { kind: 'life', cause: 'void' }, look: 'void-dark' } as unknown as Drop;
  planted('drop.unwarned', 'normal', { drops: [bare], policy: 'per-gap' }, t);
  planted('drop.unwarned', 'easy', { drops: [{ ...bare, warn: { dotLine: 'Careful!', leadPx: 480, sign: false } } as unknown as Drop], policy: 'per-gap' }, t);
});
test('drop.look-lies: a soft drop painted as water; a lethal drop drawn as ground', (t) => {
  planted('drop.look-lies', 'normal', { drops: [{ ...soft(1000, 1300), look: 'water-art' } as unknown as Drop] }, t);
  planted('drop.look-lies', 'easy', { policy: 'per-gap', drops: [{ x0: 1000, x1: 1300, lipY: G, ends: { kind: 'life', cause: 'void' }, look: 'ground', warn: { dotLine: 'x', leadPx: 1, sign: true } } as unknown as Drop] }, t);
});
test('drop.untyped: a gap on the route with no Drop record', (t) => {
  planted('drop.untyped', 'normal', { drops: [], routeGaps: [[1000, 1300]] }, t);
});
test('teach.double-no-gap-after and teach.double-gap-unsafe (Normal only, by the registry\'s settings)', (t) => {
  const b = builtClean();
  planted('teach.double-no-gap-after', 'normal', { built: { ...b, platforms: [P(1, 0, G, 1000), P(2, 1200, G, 1000), P(3, 1000, G + 200, 200)] } }, t);
  planted('teach.double-gap-unsafe', 'normal', { built: { ...b, platforms: [P(1, 0, G, 1000), P(2, 1260, G, 1000)] }, routeGaps: [], drops: [] }, t);
  const easy = roll('easy', { built: { ...b, platforms: [P(1, 0, G, 1000), P(2, 1200, G, 1000), P(3, 1000, G + 200, 200)] } });
  assert.ok(!names(easy).includes('teach.double-no-gap-after') && easy.notJudged.includes('teach.double-no-gap-after'), 'Easy: stated, not judged');
});
test("hazard.untaught: a hurt drop before the end of its lesson's showing piece (both settings); after it, clean (the whole rule: hurtFloor.test.ts)", (t) => {
  // (the gap at 1000..1260 as a hollow with a hurt floor, a heart drop with its own look; packet E12 item 2)
  const hollow = { x0: 1000, x1: 1260, lipY: G, ends: { kind: 'heart', to: 'take-off' }, look: 'hurt-art' } as unknown as Drop;
  const b = builtClean();
  const at = (shown: number) => ({ drops: [hollow], built: { ...b, spawnX: 0, gen2: { ...b.gen2, hurt: { lesson: 'spikes', clearStart: 900, shown } } } });
  for (const s of ['normal', 'easy'] as const) {
    planted('hazard.untaught', s, at(1100), t);
    assert.deepEqual(names(roll(s, at(1000))), [], `${s}: shown first, the roll is clean`);
  }
});
test('first-run.drift: the fixed layout built against its recorded lock', (t) => {
  const layout = { seed: 7, lock: { normal: 'aaa', easy: 'bbb' } };
  assert.deepEqual(firstRunVerdicts(layout, { normal: 'aaa', easy: 'bbb' }), []);
  const v = firstRunVerdicts(layout, { normal: 'aaa', easy: 'ccc' });
  assert.deepEqual(v.map((x) => [x.name, x.setting]), [['first-run.drift', 'easy']]);
  t.diagnostic(`red: ${v[0].line}`);
});
test('every name that can fail in a flown scope has a planted roll above (the union less reach.unflown)', () => {
  const src = fs.readFileSync(new URL(import.meta.url), 'utf8');
  for (const n of ALL_VERDICTS.filter((x) => x !== 'reach.unflown')) assert.ok(src.includes(`planted('${n}'`) || (n === 'first-run.drift' && src.includes('firstRunVerdicts(layout')), n);
});
test('reach.unflown cannot fail inside a flown scope: an unflown scope (Normal on a stage never flown) states it, with the arc names, in notJudged', () => {
  const v = judgeRoll({ stageId: '1-4', setting: 'normal', policy: 'per-gap', drops: [], asks: [ask('single-gap', 400)], routeGaps: [] } as Judged11, []);
  assert.equal(v.accepted, true, 'a 400 px gap is not judged where nothing was flown');
  for (const n of ['reach.unflown', ...ARC_VERDICTS]) assert.ok(v.notJudged.includes(n as VerdictName), n);
  for (const s of ['normal', 'easy'] as const) assert.ok(!roll(s, { asks: [ask('single-gap', 400)] }).notJudged.includes('reach.unflown'), `1-1 ${s}: flown`);
});

test('the verdict path holds no closed-form figure: reach.ts and verdicts.ts name none, and 1-1\'s envelope reads the bands', () => {
  for (const f of ['./verdicts.ts', './reach.ts']) {
    const code = fs.readFileSync(new URL(f, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
    assert.doesNotMatch(code, /reachJump|reachBounce|JUMP_RISE|DOUBLE_RISE|BOUNCE_REACH|TAKEOFF_SLACK|physics/, f);
  }
  for (const a of FLOWN_ARCS) assert.match(a.source, /^(reach\.md §2|chain\.md §1) "/, a.move);
  // (1-1: the band, never maxGap's 229.8 / 203.6 or riseLimit's 143.7 / 113.9)
  const b = (difficulty: Difficulty) => ({ id: '1-1', margin: difficulty === 'easy' ? 0.65 : 0.82, riseShare: difficulty === 'easy' ? 0.84 : 1, difficulty });
  assert.equal(gapFor(0, true, b('normal')), 262);
  assert.equal(gapFor(0, false, b('normal')), 143);
  assert.equal(gapFor(0, false, b('easy')), 114);
  assert.equal(riseCap(true, 0.95, b('easy')), 132);
  assert.equal(riseCap(true, 0.95, b('easy'), true), 128);
  assert.equal(riseCap(false, 0.9, b('normal')), 80);
  assert.equal(gapEnvelope(true, 'easy', '1-1'), 287, 'Easy has no double gap band: the flick from 70 px; band.out refuses it');
  assert.equal(riseEnvelope(true, 'normal'), (BANDS['double-teach-rise'].normal as { hi: number }).hi);
  // (outside 1-1: the closed form, exactly)
  for (const dy of [-120, -40, 0, 30, 90]) for (const dbl of [false, true]) {
    assert.equal(gapFor(dy, dbl, { ...b('normal'), id: '5-7' }), maxGap(dy, dbl, 0.82));
    assert.equal(riseCap(dbl, 0.95, { ...b('easy'), id: '7-1' }), riseLimit(dbl, 0.84) * 0.95);
  }
  // (levelCheck's jumpOK with the arcs: a 240 px level gap one jump at its best crosses, which the closed form says it can't)
  const a = P(1, 0, G, 300), c = P(2, 540, G, 300);
  assert.equal(jumpOK(a, c, false).ok, false);
  assert.equal(jumpOK(a, c, false, lesserArcs('normal', '1-1')).ok, true);
  assert.equal(jumpOK(a, P(2, 600, G, 300), true, linkArcs('normal', '1-1')).ok, false, 'a 300 px gap: past the double flick from 70 px, 283');
  assert.equal(jumpOK(a, P(2, 560, G, 300), true, linkArcs('normal', '1-1')).ok, true, 'a 260 px gap: the double flick crosses');
});

// (main's 0.9.5 build of these, layout 1, hashed on origin/main@181d2846 before E0's first change: platforms, falls, errors and plan;
// and the whole gen2 less the two new fields)
const MAIN: Record<string, [string, string]> = {
  '5-7 normal': ['8e6918d86d5b8c49', '1dde0c0b03ee194f'], '5-7 easy': ['c21d7034579fa414', '62b97ff493ad4d78'],
  '7-1 normal': ['f8a654ca25181450', '47c0b9f0e96ceb9e'], '7-1 easy': ['ddbb0b767ba92e8b', '0b61ef8ebb835d41'],
};
const h = (x: unknown) => createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
for (const id of ['5-7', '7-1']) {
  test(`${id} (outside THE BOUNDARY) builds as on main and carries every verdict as notJudged, with its drops`, () => {
    assert.ok(GEN2_STAGES[id], `${id} is a gen2 stage`);
    for (const d of ['normal', 'easy'] as const) {
      const st = buildGen2ForGame(generateAllLevels().find((l) => l.id === id)!, d, 1);
      const { verdicts, drops, ...g } = st.gen2;
      assert.deepEqual([h({ platforms: st.platforms, falls: st.gen2.falls, errors: st.gen2.errors, plan: st.gen2.plan }), h(g)], MAIN[`${id} ${d}`], `${id} ${d}`);
      assert.deepEqual(verdicts?.[d], NOT_JUDGED_ALL(d));
      assert.equal(drops?.length, st.gen2.falls?.length ?? 0, 'one Drop per fall');
      assert.ok(!st.gen2.errors.some((e) => e.startsWith('verdict ')));
    }
  });
}

// ───────────────────────── attempt 2: the Critic's three verdict bugs and the lead's finish reach (each planted red first) ─────────────────────────
import { classify, headroomOf } from './verdicts.ts';
import { layLocal, planBudget, rngFor } from './pipeline.ts';
import { w1World } from './worlds/w1.ts';
import { finishReach } from '../stageGenerator.ts';
import { fixPickups } from '../flowerReach.ts';
import type { SectionTemplate } from './types.ts';
import type { GeneratedStage } from '../stageGenerator.ts';

const c11 = generateAllLevels().find((l) => l.id === '1-1')!;
const W1 = w1World().manifest;
const riseTpl = (shape: 'bank' | 'branch'): SectionTemplate => ({
  id: 'rise-probe', name: 'one double rise', archetypes: 'any', phases: ['sho'], difficulty: 3,
  pieces: [
    { key: 'a', shape: 'bank', w: [300, 300], place: { kind: 'start' } },
    { key: 'b', shape, w: [300, 300], place: { kind: 'double', after: 'a', dy: [-140, -136], share: [0.2, 0.25], soft: true } as never },
  ],
  entry: { piece: 'a', kind: 'ground' }, exit: { piece: 'b', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false,
});
const risesOf = (shape: 'bank' | 'branch', d: Difficulty) => Array.from({ length: 16 }, (_, k) => {
  const L = layLocal(riseTpl(shape), planBudget(c11, W1, d), rngFor(31, k), false, { pitDepth: W1.pitDepth });
  const a = L.pieces.find((p) => p.key === 'a')!, b = L.pieces.find((p) => p.key === 'b')!;
  return a.y - b.y;
});
test('a bank is a block: Normal\'s D bank lays 136-140 and Easy\'s 128-132 (the block rows); a branch lip keeps the thin rows', () => {
  for (const [d, lo, hi] of [['normal', 136, 140], ['easy', 128, 132]] as const) {
    const r = risesOf('bank', d);
    assert.ok(r.every((x) => x >= lo && x <= hi), `${d} bank: ${r.join(', ')} not all in ${lo}-${hi}`);
  }
  assert.ok(risesOf('branch', 'normal').every((x) => x <= 134), 'a thin lip on Normal stays in its 128-134 row');
  // (and the ask says so: a bank landing is not thin)
  const L = layLocal(riseTpl('bank'), planBudget(c11, W1, 'normal'), rngFor(31, 0), false, { pitDepth: W1.pitDepth });
  assert.equal(L.asks?.[0]?.thin, false);
});

test('headroom: only a solid piece 50 px or taller over the take-off and the flight cuts the arc; a bough, or a bank over the landing, does not', () => {
  const a = { x0: 1000, x1: 1200, yTake: G, yLand: G };
  const bough = { ...P(9, 1050, G - 84, 120), height: 24 };
  assert.equal(headroomOf(a, [P(1, 0, G, 1000), P(2, 1200, G, 600), bough]), 9999, 'a 24 px bough is no ceiling');
  const overLanding = { ...P(9, 1200, G - 160, 200), height: 60 };
  assert.equal(headroomOf(a, [P(1, 0, G, 1000), P(2, 1200, G, 600), overLanding]), 9999, 'a bank over the landing is the next step, not a ceiling');
  const roof = { ...P(9, 1080, G - 180, 80), height: 60 };
  assert.equal(headroomOf(a, [P(1, 0, G, 1000), P(2, 1200, G, 600), roof]), 120, 'a block over the flight: 120 px clear');
  const overTakeoff = { ...P(9, 940, G - 180, 50), height: 60 };
  assert.equal(headroomOf(a, [P(1, 0, G, 1000), P(2, 1200, G, 600), overTakeoff]), 120, 'a block over the take-off run (70 px before the lip)');
});

test('classify: a "double" place whose figure fits the single band is a single section; a declared double block stays a block', () => {
  const stone = { x0: 0, x1: 170, yTake: G, yLand: G - 60, move: 'double' as const, thin: false, key: 's', section: 's1' };
  assert.deepEqual(classify(stone, false, 'normal'), { kind: 'single-rise', figure: 60 });
  assert.deepEqual(classify({ ...stone, yLand: G - 70 }, false, 'easy'), { kind: 'double-teach-rise', figure: 70 }, 'Easy: 70 is over the single band 63');
  assert.deepEqual(classify({ ...stone, yLand: G, x1: 120 }, false, 'normal'), { kind: 'single-gap', figure: 120 });
  assert.deepEqual(classify({ ...stone, block: 'double' }, false, 'normal'), { kind: 'double-teach-rise', figure: 60 }, 'a declared block is judged as one');
});

test('1-1\'s finish reach (stageGenerator finishReach): the far bank of a 256 px gap is on the route, and its flower stays', () => {
  const st = {
    config: c11, trees: [], vines: [], ropes: [], enemies: [], boss: null, checkpoints: [],
    platforms: [P(1, 0, G, 600), P(2, 856, G, 700)],
    collectibles: [{ id: 1, x: 1200, y: G - 40, type: 'flower', collected: false }],
    spawnX: 100, spawnY: G, exitTotemX: 1450, exitTotemY: G,
    // (a stage gen2 built carries its gen2 record: the arcs judge a BUILT stage, never an id alone, reach.ts builtOnArcs)
    gen2: { budget: { difficulty: 'normal' } },
  } as unknown as GeneratedStage;
  assert.ok(!finishReach({ ...st, gen2: undefined } as unknown as GeneratedStage, 'normal').includes(2), "1-1's id on a stage gen2 did not build: the closed form");
  for (const d of ['normal', 'easy'] as const) {
    const ids = finishReach(st, d);
    assert.ok(ids.includes(2), `${d}: the far bank is reached (${ids})`);
    const items = st.collectibles.map((q) => ({ ...q }));
    fixPickups({ platforms: st.platforms, vines: [], ropes: [], glide: false, onRoute: new Set(ids) } as never, items);
    assert.deepEqual([items[0].x, items[0].y], [1200, G - 40], `${d}: the flower stays`);
  }
  assert.ok(!finishReach({ ...st, config: { ...c11, id: '1-4' } } as GeneratedStage, 'normal').includes(2), 'outside the judged table: the closed form, as before');
});

// ───────────────────────── attempt 3: floorless false positives and the petal pass's reach (each planted red first) ─────────────────────────
import { floorlessGaps } from './promises11.ts';
import { buildGen2Stage } from './pipeline.ts';
import { unreachablePickups } from '../petalPass.ts';

const overlaps = (gs: Array<[number, number]>, x0: number, x1: number) => gs.filter(([a, b]) => a < x1 && b > x0);
test('floorless (the lead\'s ruling, 11-11): a slot is closed only by a solid piece at its lip level (top within 10 px, or one plugging the lip) across its width with no floor under it to pass in by; seed 172\'s deck is a real hole, seed 476\'s stone plugs its slot, seed 323\'s 23 px opening is no drop', () => {
  // (changed, INT-1-1: the three seeds' raw rolls were re-laid by C1, so each case is planted: the pieces E0a's roll laid there (d2748131,
  // buildGen2Stage Normal), and a wide bank at that stage's ground line (its banks' commonest top), which findW1Pits reads as the ground
  // band. Each plant is red without the piece that decides it)
  const bank = (y: number) => ({ ...P(900, 10000, y, 6000), height: 500 });
  const S = (id: number, x: number, y: number, width: number, height: number, style: 'moss_stone' | 'branch' | 'log' = 'moss_stone', extra: object = {}) => ({ id, x, y, width, height, type: 'solid' as const, style, ...extra });
  const s476 = [bank(951), S(108, 22195, 882, 263, 615), S(109, 22518, 743, 340, 754), S(122, 22458, 811, 60, 120)];
  assert.deepEqual(overlaps(floorlessGaps({ platforms: s476 }), 22458, 22518), [], 'seed 476 x22458..22518: stone 122 (811-931) plugs the 882 lip');
  assert.ok(overlaps(floorlessGaps({ platforms: s476.filter((q) => q.id !== 122) }), 22458, 22518).length > 0, 'planted: without the stone the slot is a fall');
  const s172 = [bank(1099), S(142, 30201, 747, 306, 1097), S(143, 30507, 821, 277, 1023), S(146, 30784, 906, 110, 120), S(147, 30894, 838, 256, 24, 'branch'), S(148, 31150, 838, 685, 24, 'log'), S(149, 30754, 928, 190, 24, 'branch', { catch: true }), S(150, 31835, 838, 560, 1006)];
  assert.ok(overlaps(floorlessGaps({ platforms: s172 }), 30784, 31835).length > 0, 'seed 172 x30784..31835: off block 146 (906) he goes under the 838 deck: a real hole');
  // (seed 323 x27200..27273: branch 128 (top 1005) leaves a 23 px opening to log 127; an opening under his body width is no drop: the
  // lead's second line on the ruling, 11-11)
  const s323 = [bank(1071), S(119, 26656, 899, 430, 24, 'branch'), S(121, 26869, 1042, 185, 24, 'log'), S(123, 27086, 983, 114, 120), S(124, 27200, 915, 306, 24, 'branch'), S(127, 27273, 1051, 214, 24, 'log'), S(128, 27056, 1005, 194, 24, 'branch', { catch: true })];
  assert.deepEqual(overlaps(floorlessGaps({ platforms: s323 }), 27200, 27273), [], 'seed 323: a 23 px opening, not a fall');
  assert.ok(overlaps(floorlessGaps({ platforms: s323.filter((q) => q.id !== 128) }), 27200, 27273).length > 0, 'planted: without branch 128 the slot is a fall');
  // (planted: a piece at lip level closes the slot to 23 px; the same piece with a lower floor beside it under the slot does not)
  const atLip = [P(1, 0, G, 1000), P(2, 1073, G, 1000), { ...P(3, 900, G + 4, 150), height: 24 }];
  assert.deepEqual(floorlessGaps({ platforms: atLip }), [], 'closed at lip level to 23 px');
  // (the deck case is asserted on seed 172 itself: a planted copy is merged into the ground by w1Pits and finds no slot at all)
  assert.deepEqual(floorlessGaps({ platforms: [P(1, 0, G, 1000), P(2, 1060, G, 1000), { ...P(3, 990, G - 70, 80), height: 120 }] }), [], 'a plug across the lip');
  assert.equal(floorlessGaps({ platforms: [P(1, 0, G, 1000), P(2, 1060, G, 1000)] }).length, 1, 'a bare 60 px slot is a fall');
  // (the Critic, fc1efb3b: a bough near the HIGHER lip, 98 px over the lower one: he walks under it from the lower lip and drops)
  const bough = [{ ...P(1, 0, 882, 1000), height: 300 }, { ...P(2, 1060, 743, 1000), height: 400 }, { ...P(3, 1000, 760, 60), height: 24, style: 'branch' as const }];
  assert.equal(floorlessGaps({ platforms: bough }).length, 1, 'a bough he passes under from the lower lip closes nothing');
});

test('the petal pass on 1-1 judges reach with the flown arcs: a flower past a 256 px gap is not out of reach; outside 1-1 as before', () => {
  for (const d of ['normal', 'easy'] as const) {
    const st = {
      config: c11, trees: [], vines: [], ropes: [], enemies: [], boss: null, checkpoints: [],
      platforms: [P(1, 0, G, 600), P(2, 856, G, 700)],
      collectibles: [{ id: 7, x: 1200, y: G - 40, type: 'flower', collected: false }],
      spawnX: 100, spawnY: G, exitTotemX: 450, exitTotemY: G, gen2: { budget: { difficulty: d } },
    } as unknown as GeneratedStage;
    assert.deepEqual([...unreachablePickups(st)], [], `${d}: the flower past the gap is reachable`);
    assert.deepEqual([...unreachablePickups({ ...st, config: { ...c11, id: '1-4' } } as GeneratedStage)], [7], `${d}: 1-4 (never flown), closed form, as before`);
  }
});

test('block.spare-thin prints its spare rounded as its measure is (4.6 prints 5, never 4)', () => {
  const v = roll('easy', { asks: [ask('double-teach-rise', 127.6)] });
  const f = v.accepted ? undefined : v.failed.find((x) => x.name === 'block.spare-thin');
  assert.ok(f, 'spare-thin');
  assert.match(f!.line, /: 5 px over/);
  assert.equal(f!.measure?.measured, 128);
});
