/**
 * gen2/rollLay (ENG-CL (6), BUILD-18's shape 8:26 PM 11-14): a chase stage's rolling nuts and fruit laid by the PIPELINE, once its chase
 * is laid: each 'roll' socket {kind, on, t} where the designer put it, at the world's pace (WorldManifest.rolls), checked by name; with
 * no 'roll' socket on the stage and a look, by the chase's own ground (the dev fixture's rule, lifted). Red before: no 'roll' role, the
 * pipeline laid no hazard, and the fixture and 1-8 each carried their own copy.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage } from './pipeline.ts';
import { layRolling, rollApart, rollsOf } from './rollLay.ts';
import { W1_ROLL } from './worlds/w1Cast.ts';
import { buildChaseFixtureStage, CHASE_FIXTURE_CODE, chaseFixtureKit, chaseFixtureLevel } from '../chaseFixtureStage.ts';
import { rollGroundProblems, rollProblems } from '../rolling.ts';
import type { Gen2Stage, WorldKit } from './types.ts';

const CFG = { ...chaseFixtureLevel(), id: '1-1' };
/** the fixture's kit with a nut socket on every section's entry piece, halfway along, and the world's look (or none) */
function socketKit(look = true): WorldKit {
  const K = chaseFixtureKit(CHASE_FIXTURE_CODE, '1-1');
  const sections = K.manifest.sections.map((t) => ({ ...t, sockets: [...t.sockets, { id: 'cl-roll', role: 'roll' as const, roll: 'low' as const, on: t.entry.piece, t: 0.5 }] }));
  return { ...K, manifest: { ...K.manifest, sections, ...(look ? { rolls: W1_ROLL } : {}) } };
}
const rollFills = (st: Gen2Stage) => st.gen2.fills.filter((f) => f.role === 'roll' && f.what);

test("rollLay: each 'roll' socket is a hazard where the designer put it, at the world's pace; any it cannot lay fair is a roll error by name; the judge sees them", () => {
  for (const difficulty of ['normal', 'easy'] as const) {
    for (const seed of [1, 2, 3]) {
      const at = `${difficulty} seed ${seed}`;
      const judged: number[] = [];
      const st = buildGen2Stage({ config: CFG, kit: socketKit(), seed, difficulty, also: (s) => { judged.push(s.rolling?.length ?? 0); return []; } });
      const fills = rollFills(st);
      assert.ok(fills.length >= 3, `${at}: ${fills.length} roll sockets filled`);
      const rl = st.rolling ?? [];
      // (every hazard is a socket's, none by ground: the stage names its own)
      assert.deepEqual(rl.map((h) => h.dropX), fills.map((f) => Math.round(f.x)).sort((a, b) => a - b), `${at}: the hazards are the sockets'`);
      assert.ok(rl.every((h) => h.kind === 'low' && h.speed === W1_ROLL.low.speed && h.bounce === W1_ROLL.low.bounce), `${at}: the world's nut`);
      // (each fault is named among the roll's errors, never laid in silence)
      const want = [...rollProblems(rl), ...rollGroundProblems(rl, st.platforms)].map((m) => `rolling: ${m}`);
      rl.forEach((h, i) => { if (i && h.dropX - rl[i - 1].dropX < rollApart(h, W1_ROLL, difficulty === 'easy')) want.push(`rolling: ${rl[i - 1].kind} at x ${rl[i - 1].dropX} and`); });
      for (const w of want) assert.ok(st.gen2.errors.some((e) => e.startsWith(w)), `${at}: "${w}" is a roll error`);
      assert.ok(judged.length && judged.every((n) => n > 0), `${at}: the judge was handed the hazards (${judged.join(', ')})`);
    }
  }
});

test("rollLay: a 'roll' socket on a world with no rolls look is refused by name, and nothing is laid", () => {
  const st = buildGen2Stage({ config: CFG, kit: socketKit(false), seed: 1, difficulty: 'normal' });
  assert.ok(!st.rolling?.length, 'no hazard laid');
  assert.ok(st.gen2.errors.some((e) => /^rolling: \d+ 'roll' socket\(s\) on a world with no rolls look/.test(e)), st.gen2.errors.join('; '));
});

test('rollLay: with no roll socket, the look lays them by the chase\'s own ground (the fixture), and a stage with no chase gets none', () => {
  for (const difficulty of ['normal', 'easy'] as const) {
    for (const seed of [1, 2, 3]) {
      const st = buildChaseFixtureStage(chaseFixtureLevel(), seed, difficulty);
      assert.ok((st.rolling ?? []).length >= 3, `${difficulty} seed ${seed}: ${st.rolling?.length} hazards by ground`);
    }
  }
  const none = rollsOf({ platforms: [], gen2: { fills: [] } }, W1_ROLL, false);
  assert.deepEqual(none, { specs: [], problems: [] });
  assert.deepEqual(layRolling({ platforms: [] }, W1_ROLL), []);
});
