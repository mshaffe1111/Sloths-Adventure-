/**
 * Content letter p, "pieces on a clock", a NOW letter (ENG-26c, readiness gap G1; the lead's ruling A, 11-21): a node that asks for p holds
 * a piece on a clock (a water wheel's bucket, a beat pad or snap stone, a ride on the beat), whatever its sections' type, or the roll
 * fails by name. Before it, every p node failed "Later: beat pieces on a clock" (2-6's four wheel nodes, on every roll of the draft row).
 */
import '../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { askMisses, CLOCK_LETTER, LATER_CONTENT, onClock, type LaidNode } from './nodeAsks.ts';
import { CONTENT_LETTERS } from './nodeLetters.ts';
import { buildGen2Stage } from './pipeline.ts';
import { generateAllLevels } from '../worldsData.ts';
import { kitLib26, STAGE_26 } from './worlds/w2Arc26.ts';

const node = (clocked: number): LaidNode => ({ id: 'n9', token: 'Wp1>', sections: [{ content: 'rope', double: false, dy: -300 }], enemies: [], finds: [], pickups: 0, clocked });

test("p is a NOW letter laid by a piece on a clock: a node with none fails by name, one with one passes", () => {
  assert.equal(CONTENT_LETTERS.p.key, 'now');
  assert.ok(!('p' in LATER_CONTENT), 'p is no longer Later');
  assert.ok(CLOCK_LETTER.has('p'));
  assert.deepEqual(askMisses({ content: 'p' }, node(0), []), [`node n9 "Wp1>": content 'p' (beat): no piece on a clock laid (a wheel's bucket, a beat pad or snap stone, a ride on the beat)`]);
  assert.deepEqual(askMisses({ content: 'p' }, node(1), []), []);
  // (a clock piece, by what the platform carries; a weight pad sinks under him, by no clock)
  assert.ok(onClock({ wheel: {} }) && onClock({ ride: {} }) && onClock({ pad: { by: 'beat' } }));
  assert.ok(!onClock({ pad: { by: 'weight' } }) && !onClock({}));
});

const cfg = generateAllLevels().find((c) => c.id === STAGE_26 && !c.secret)!;
const asks = (st: { gen2: { errors?: string[] } }) => (st.gen2.errors ?? []).filter((e) => e.startsWith('ask:'));

// (the plant: on the base, before CLOCK_LETTER, every one of these four nodes failed "Later: beat pieces on a clock", 24 of 24 rolls)
test("2-6's draft row: its four wheel nodes (T, X, W, S p) hold their wheels, both settings", () => {
  for (const d of ['normal', 'easy'] as const) {
    const st = buildGen2Stage({ config: cfg, kit: kitLib26(), seed: 1, difficulty: d });
    assert.deepEqual(asks(st), [], d);
  }
});
