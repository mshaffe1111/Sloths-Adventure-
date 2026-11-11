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
  config: { levelHeight: 2000 }, gen2: { nodes: [{ token: 'Tg2>', x0: 0 }] },
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
  assert.equal(union.length, 16);
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
test('reach.unflown cannot fail inside a flown scope: an unflown scope (Normal past 1-1) states it, with the arc names, in notJudged', () => {
  const v = judgeRoll({ stageId: '1-2', setting: 'normal', policy: 'per-gap', drops: [], asks: [ask('single-gap', 400)], routeGaps: [] } as Judged11, []);
  assert.equal(v.accepted, true, 'a 400 px gap is not judged where nothing was flown');
  for (const n of ['reach.unflown', ...ARC_VERDICTS]) assert.ok(v.notJudged.includes(n as VerdictName), n);
  for (const s of ['normal', 'easy'] as const) assert.ok(!roll(s, { asks: [ask('single-gap', 400)] }).notJudged.includes('reach.unflown'), `1-1 ${s}: flown`);
});

test('the verdict path holds no closed-form figure: reach.ts and verdicts.ts name none, and 1-1\'s envelope reads the bands', () => {
  for (const f of ['./verdicts.ts', './reach.ts']) {
    const code = fs.readFileSync(new URL(f, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
    assert.doesNotMatch(code, /reachJump|reachBounce|JUMP_RISE|DOUBLE_RISE|BOUNCE_REACH|TAKEOFF_SLACK|physics/, f);
  }
  for (const a of FLOWN_ARCS) assert.match(a.source, /^reach\.md §2 "/, a.move);
  // (1-1: the band, never maxGap's 229.8 / 203.6 or riseLimit's 143.7 / 113.9)
  const b = (difficulty: Difficulty) => ({ id: '1-1', margin: difficulty === 'easy' ? 0.65 : 0.82, riseShare: difficulty === 'easy' ? 0.84 : 1, difficulty });
  assert.equal(gapFor(0, true, b('normal')), 262);
  assert.equal(gapFor(0, false, b('normal')), 143);
  assert.equal(gapFor(0, false, b('easy')), 114);
  assert.equal(riseCap(true, 0.95, b('easy')), 132);
  assert.equal(riseCap(true, 0.95, b('easy'), true), 128);
  assert.equal(riseCap(false, 0.9, b('normal')), 80);
  assert.equal(gapEnvelope(true, 'easy'), 287, 'Easy has no double gap band: the flick from 70 px; band.out refuses it');
  assert.equal(riseEnvelope(true, 'normal'), (BANDS['double-teach-rise'].normal as { hi: number }).hi);
  // (outside 1-1: the closed form, exactly)
  for (const dy of [-120, -40, 0, 30, 90]) for (const dbl of [false, true]) {
    assert.equal(gapFor(dy, dbl, { ...b('normal'), id: '5-7' }), maxGap(dy, dbl, 0.82));
    assert.equal(riseCap(dbl, 0.95, { ...b('easy'), id: '7-1' }), riseLimit(dbl, 0.84) * 0.95);
  }
  // (levelCheck's jumpOK with the arcs: a 240 px level gap one jump at its best crosses, which the closed form says it can't)
  const a = P(1, 0, G, 300), c = P(2, 540, G, 300);
  assert.equal(jumpOK(a, c, false).ok, false);
  assert.equal(jumpOK(a, c, false, lesserArcs('normal')).ok, true);
  assert.equal(jumpOK(a, P(2, 600, G, 300), true, linkArcs('normal')).ok, false, 'a 300 px gap: past the double flick from 70 px, 283');
  assert.equal(jumpOK(a, P(2, 560, G, 300), true, linkArcs('normal')).ok, true, 'a 260 px gap: the double flick crosses');
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
