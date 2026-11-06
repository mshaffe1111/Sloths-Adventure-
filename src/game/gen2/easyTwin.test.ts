// Easy's twin versions (the designer's §8.7 amendment, 11-06: on Easy no double gap blocks, every double block a rise, its "easy-" twin
// with the same beats). A sub-block version names `easy: '<id>'`, the version Easy lays in its place; an `easyOnly` version is never
// drawn. Easy still lays Normal's plan (the plan keeps Normal's version), so Easy is Normal's stage with the gap a rise.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { chooseVersions, layLocal, planBudget, rngFor } from './pipeline.ts';
import { w1World } from './worlds/w1.ts';
import { generateAllLevels } from '../worldsData.ts';
import type { SectionTemplate } from './types.ts';
import { JUMP_RISE } from '../physics.ts';

const tpl: SectionTemplate = {
  id: 'twin-probe', name: 'a double gap, a rise on Easy', archetypes: 'any', phases: ['sho'], difficulty: 3,
  pieces: [{ key: 'a', shape: 'bank', w: [300, 300], place: { kind: 'start' } }],
  subBlocks: [{ id: 'd', versions: [
    { id: 'gap', easy: 'easy-gap', pieces: [{ key: 'b', shape: 'bank', w: [300, 300], place: { kind: 'double', after: 'a', gapPx: [195, 205] } }] },
    { id: 'easy-gap', easyOnly: true, pieces: [{ key: 'b', shape: 'bank', w: [300, 300], place: { kind: 'double', after: 'a', dy: [-140, -136], share: [0.2, 0.3] }, block: 'double' }] },
    { id: 'walk', pieces: [{ key: 'b', shape: 'bank', w: [300, 300], place: { kind: 'walk', after: 'a', dy: [0, 0] } }] },
  ] }],
  entry: { piece: 'a', kind: 'ground' }, exit: { piece: 'b', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false,
};

test('an easyOnly version is never drawn; Easy lays the twin in its version\'s place, Normal never does (planted: no twin hook)', () => {
  const seen = new Set<string>();
  for (let k = 0; k < 40; k++) seen.add(chooseVersions(tpl, rngFor(5, k)).d);
  assert.deepEqual([...seen].sort(), ['gap', 'walk']);
  assert.equal(chooseVersions(tpl, rngFor(1, 0), undefined, { d: 'gap' }, true).d, 'easy-gap', 'Easy, on Normal\'s plan');
  assert.equal(chooseVersions(tpl, rngFor(1, 0), undefined, { d: 'gap' }, false).d, 'gap');
  assert.equal(chooseVersions(tpl, rngFor(1, 0), undefined, { d: 'walk' }, true).d, 'walk', 'a version with no twin is kept on Easy');
});
test("laid: Normal's double gap is a 195-205 px gap; Easy's twin is the B2a rise, past a single's physical rise (Easy's double clamp, 113.9 px)", () => {
  const c = generateAllLevels().find((l) => l.id === '1-1')!;
  const M = w1World().manifest;
  const n = layLocal(tpl, planBudget(c, M, 'normal'), rngFor(9, 0), false, { versions: { d: 'gap' } });
  const e = layLocal(tpl, planBudget(c, M, 'easy'), rngFor(9, 0), false, { versions: { d: 'gap' } });
  assert.equal(n.gaps.length, 1);
  assert.ok(n.gaps[0].x1 - n.gaps[0].x0 >= 195 && n.gaps[0].x1 - n.gaps[0].x0 <= 205);
  // (Easy's margin 0.65 clamps a double's rise at 0.95 x 0.65 x DOUBLE_RISE = 113.9 px: still past a single's physical JUMP_RISE, 107.8)
  assert.ok(e.exit.y < -JUMP_RISE && e.exit.y >= -145, `Easy's exit ${e.exit.y}`);
  assert.ok(n.exit.y === 0, `Normal's exit ${n.exit.y}`);
  assert.equal(e.versions.d, 'easy-gap');
});
test('a twin that is not one of the versions fails by name', () => {
  const bad = { ...tpl, subBlocks: [{ id: 'd', versions: [{ ...tpl.subBlocks![0].versions[0], easy: 'nope' }] }] };
  assert.throws(() => chooseVersions(bad, rngFor(1, 0), undefined, undefined, true), /Easy twin nope is not one of its versions/);
});
