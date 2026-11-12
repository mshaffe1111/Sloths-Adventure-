/**
 * Packet E12 item 5, the built stage's half: a stage whose world's `lessons` say an EARLIER stage taught the double carries the fact
 * (config.doubleTaught, set by gen2's planBudget, never by an id) and every reader of `doubleAllowed` counts the double on it: the
 * level check (validateStage), Easy's hold (easyMode) and the lay's link reach (jumpLinkGap). With no earlier lesson nothing counts it:
 * the same stage with the fact taken off is refused again. Planted red first: before the flag, 1-2 built from World 1's sections
 * carried nothing and the level check read every double gap on it as past reach.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { doubleAllowed, validateStage } from '../levelCheck.ts';
import { generateAllLevels } from '../worldsData.ts';
import { buildGen2Stage, jumpLinkGap, planBudget } from './pipeline.ts';
import { w1World } from './worlds/w1.ts';
import { W5_MANIFEST } from './worlds/w5.ts';
import { config12, kitLib12 } from '../../../tools/engine/library.ts';
import type { WorldManifest } from './types.ts';

const cfgOf = (id: string) => generateAllLevels().find((c) => c.id === id)!;
const withLessons = (lessons: Record<string, string> | undefined): WorldManifest => ({ ...kitLib12({}).manifest, lessons });

test('the old rule is unmoved: no double before mission 6 but on 1-1; the fact alone turns it on', () => {
  assert.equal(doubleAllowed({ worldIndex: 1, miniIndex: 1 }), true);
  for (const m of [2, 3, 4, 5]) assert.equal(doubleAllowed({ worldIndex: 1, miniIndex: m }), false, `1-${m}`);
  assert.equal(doubleAllowed({ worldIndex: 1, miniIndex: 6 }), true);
  assert.equal(doubleAllowed({ worldIndex: 1, miniIndex: 2, doubleTaught: true }), true);
});

test("the budget carries the fact only where an EARLIER stage's lesson taught the double", () => {
  const b = (lessons: Record<string, string> | undefined) => planBudget(config12({}), withLessons(lessons), 'normal').doubleTaught;
  assert.equal(b({ jump: '1-1', double: '1-1', bounce: '1-1' }), true, "1-2 after 1-1's lesson");
  assert.equal(b({ double: '1-2' }), undefined, 'the stage that teaches it is not after its own lesson');
  assert.equal(b({ double: '1-3' }), undefined, 'a later lesson');
  assert.equal(b({ bounce: '1-1' }), undefined, 'another move taught earlier does not teach the double');
  assert.equal(b(undefined), undefined, 'no lessons row');
});

test('nothing shipped gains the fact: World 1 ships no lessons row, and a stage the old rule already counts carries nothing new', () => {
  const M1 = w1World().manifest, M5 = W5_MANIFEST;
  for (let m = 1; m <= 9; m++) for (const d of ['normal', 'easy'] as const) assert.equal(planBudget(cfgOf(`1-${m}`), M1, d).doubleTaught, undefined, `1-${m} ${d}`);
  assert.equal(M5.lessons?.double, '5-1', "World 5's row names the double");
  for (const id of ['5-2', '5-7', '5-9']) assert.equal(planBudget(cfgOf(id), M5, 'normal').doubleTaught, undefined, id);
});

test("the lay's link reach reads it: 1-2 with the fact links what 1-6 links, without it a single jump's", () => {
  assert.equal(jumpLinkGap(0, 1, 2, true), jumpLinkGap(0, 1, 6));
  assert.ok(jumpLinkGap(0, 1, 2) < jumpLinkGap(0, 1, 2, true));
  assert.equal(jumpLinkGap(0, 1, 2), jumpLinkGap(0, 1, 2, false));
});

/** a level double gap planted in a built stage: its totem's bank, and everything at or past it, moved `gap` px on from the bank before
 *  it (1-2's designed arc lays no double gap of its own: chain.md §1, no double over thorns, and none on its banks) */
function doubleGapAtExit<T extends { exitTotemX: number; platforms: Array<{ x: number; y: number; width: number; type: string }>; collectibles: Array<{ x: number }>; checkpoints?: Array<{ x: number }> }>(st: T, gap: number): T {
  const out = st.platforms.filter((q) => q.type === 'solid' && q.x <= st.exitTotemX && q.x + q.width >= st.exitTotemX).sort((a, b) => a.y - b.y)[0];
  const on = (x: number) => (x >= out.x - 1 ? x + gap : x);
  return { ...st, exitTotemX: st.exitTotemX + gap, platforms: st.platforms.map((q) => ({ ...q, x: on(q.x) })), collectibles: st.collectibles.map((c) => ({ ...c, x: on(c.x) })), checkpoints: (st.checkpoints ?? []).map((c) => ({ ...c, x: on(c.x) })) };
}

test("1-2 (its designed arc) with its own id and 1-1's lessons carries the fact and passes the level check; a level double gap planted in it passes with the fact and is refused without it", () => {
  let needs = 0;
  for (const seed of [2, 3, 6, 7]) for (const difficulty of ['normal', 'easy'] as const) {
    const st = buildGen2Stage({ config: config12({}) as never, kit: kitLib12({}), seed, difficulty });
    const at = `seed ${seed} ${difficulty}`;
    assert.equal(st.config.doubleTaught, true, `${at}: the built stage does not carry the lesson`);
    assert.deepEqual(validateStage(st, { rooms: false }).errors, [], at);
    const planted = doubleGapAtExit(st, 200);
    assert.deepEqual(validateStage(planted, { rooms: false }).errors, [], `${at}: the planted double gap, with the fact`);
    const { doubleTaught: _d, ...bare } = planted.config;
    if (validateStage({ ...planted, config: bare }, { rooms: false }).errors.length) needs++;
  }
  assert.equal(needs, 8, 'a planted double gap was crossed without the lesson: the refusal without it was not tried');
});
