/**
 * LV-9 (polish report 1, 2026-10-29): on every hand-built stage that runs across, no more than 4000 px between flags (the start and the
 * shrine counted), on Normal and Easy, layouts 1-3. Hand-built stages ran to 7-14k px with no flag (1-1 7048, 1-3 8019, 4-5 14289).
 * A flag added stands on a still solid ledge, with no animal close.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from './worldsData.ts';
import { HAND_STAGES, buildProtoStage } from './protoStage.ts';
import { W2_STAGES, buildW2Stage } from './w2Stages.ts';
import { FLAG_SPAN_MAX, capFlagSpans, easyStage } from './easyMode.ts';
import { withGoals } from './goals.ts';
import { SAFE_APPROACH } from './levelCheck.ts';
import type { GeneratedStage } from './stageGenerator.ts';

const across = generateAllLevels().filter((c) => !c.secret && (HAND_STAGES[c.id] || W2_STAGES[c.id]) && c.objectiveType !== 'ascent');
/**
 * The walk this test owes, derived from the hand tables themselves (the lead's ruling 4:43 PM ET 11-18, BUILD-24b: the floor was a number
 * edited each time a stage left for gen2: 30, 28, then 27 twice in one day (t-build-19, BUILD-24)). Every id in a hand table must be a
 * level (a stale entry is named), every one that runs across (not secret, not an ascent) is walked, and the walk is never empty. A stage
 * that leaves the tables for gen2 moves it with no number to edit; gen2's own verdict (rolledFlagBreaches) holds a rolled stage's flags.
 */
export function owedWalk(tables: ReadonlyArray<Record<string, unknown>>, levels: ReadonlyArray<{ id: string; secret?: unknown; objectiveType?: string }>): { owed: string[]; stale: string[] } {
  const byId = new Map(levels.map((c) => [c.id, c]));
  const ids = [...new Set(tables.flatMap((t) => Object.keys(t)))].sort();
  const stale = ids.filter((id) => !byId.has(id));
  const owed = ids.filter((id) => { const c = byId.get(id); return !!c && !c.secret && c.objectiveType !== 'ascent'; });
  return { owed, stale };
}
const build = (c: (typeof across)[number], lay: number): GeneratedStage => (HAND_STAGES[c.id] ? buildProtoStage(c, lay, HAND_STAGES[c.id]) : buildW2Stage(c, lay, W2_STAGES[c.id]));
const span = (st: GeneratedStage) => {
  const xs = [st.spawnX, ...(st.checkpoints ?? []).map((p) => p.x), st.exitTotemX].sort((a, b) => a - b);
  let m = 0;
  for (let i = 1; i < xs.length; i++) m = Math.max(m, xs[i] - xs[i - 1]);
  return m;
};

test('LV-9: no more than 4000 px between flags on any hand-built stage, layouts 1-3, Normal and Easy', () => {
  // (the stages it walks: 28 since the hand-built 2-1 and 2-2 left for gen2 (ENG-W2 11-14, on link #5 by INT-11), where a rolled stage's
  //  flags are held by gen2's own verdict, rolledFlagBreaches; it was 30. The walk is kept from going quietly empty: the
  //  floor now follows the hand tables, owedWalk)
  const { owed, stale } = owedWalk([HAND_STAGES, W2_STAGES], generateAllLevels());
  assert.deepEqual(stale, [], 'hand-table ids that are no level');
  assert.ok(owed.length > 0, 'the walk is empty');
  assert.deepEqual(across.map((c) => c.id).sort(), owed, 'the walk is every hand-built stage that runs across');
  let longest = 0;
  for (const c of across) {
    for (const lay of [1, 2, 3]) {
      const st = build(c, lay);
      const before = new Set((st.checkpoints ?? []).map((p) => `${p.x},${p.y}`));
      capFlagSpans(st);
      const m = span(st);
      longest = Math.max(longest, m);
      assert.ok(m <= FLAG_SPAN_MAX, `${c.id} layout ${lay}: ${Math.round(m)} px with no flag`);
      // a new flag stands on a still solid ledge, clear of the animals
      for (const f of st.checkpoints ?? []) {
        if (before.has(`${f.x},${f.y}`)) continue;
        const on = st.platforms.find((p) => f.x >= p.x && f.x <= p.x + p.width && Math.abs(p.y - f.y) < 1);
        assert.ok(on && on.type === 'solid' && !on.push && !on.broken, `${c.id} layout ${lay}: the flag at ${f.x} stands on nothing solid`);
        // a run-up to the water ahead (2-5: a flag 134 px short of the log river put Easy's first-timer back in the water again and again)
        for (const r of st.rivers ?? []) assert.ok(f.x <= r.x0 - 200 || f.x >= r.x1 + 40, `${c.id} layout ${lay}: the flag at ${f.x} is ${Math.round(r.x0 - f.x)} px short of the water`);
        for (const e of st.enemies) if (Math.abs(e.y - f.y) < 400 && e.type !== 'eagle') assert.ok(f.x < e.patrolMinX - SAFE_APPROACH || f.x > e.patrolMaxX + SAFE_APPROACH || Math.abs(e.y - f.y) >= 400, `${c.id} layout ${lay}: the flag at ${f.x} by a ${e.type}`);
      }
      if (lay === 1) {
        const easy = easyStage(withGoals(build(c, lay)) as never);
        capFlagSpans(easy);
        assert.ok(span(easy) <= FLAG_SPAN_MAX, `${c.id} Easy: ${Math.round(span(easy))} px with no flag`);
      }
    }
  }
  assert.ok(longest > 3000, 'the stages are long enough for this to mean something');
});

test('the walk owed is derived from the hand tables: a stale id is named, an empty walk and a lost stage are caught (planted)', () => {
  const levels = [{ id: 'a-1' }, { id: 'a-2', objectiveType: 'ascent' }, { id: 'a-3', secret: true }, { id: 'a-4' }];
  assert.deepEqual(owedWalk([{ 'a-1': 1, 'a-2': 1 }, { 'a-3': 1, 'a-4': 1 }], levels), { owed: ['a-1', 'a-4'], stale: [] });
  // (planted: an id no level has is stale; a table emptied by a move to gen2 owes nothing, so the test's own `owed.length > 0` is red)
  assert.deepEqual(owedWalk([{ 'a-1': 1, 'z-9': 1 }], levels).stale, ['z-9']);
  assert.deepEqual(owedWalk([{}, {}], levels).owed, []);
  // (planted: a walk that lost a stage the tables still hold differs from what is owed)
  assert.notDeepEqual(['a-1'], owedWalk([{ 'a-1': 1, 'a-4': 1 }], levels).owed);
});
