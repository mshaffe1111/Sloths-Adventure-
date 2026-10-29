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
const build = (c: (typeof across)[number], lay: number): GeneratedStage => (HAND_STAGES[c.id] ? buildProtoStage(c, lay, HAND_STAGES[c.id]) : buildW2Stage(c, lay, W2_STAGES[c.id]));
const span = (st: GeneratedStage) => {
  const xs = [st.spawnX, ...(st.checkpoints ?? []).map((p) => p.x), st.exitTotemX].sort((a, b) => a - b);
  let m = 0;
  for (let i = 1; i < xs.length; i++) m = Math.max(m, xs[i] - xs[i - 1]);
  return m;
};

test('LV-9: no more than 4000 px between flags on any hand-built stage, layouts 1-3, Normal and Easy', () => {
  assert.ok(across.length >= 30, `${across.length} stages`);
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
