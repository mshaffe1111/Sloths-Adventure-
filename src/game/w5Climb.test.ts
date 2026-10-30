/**
 * 5-8 Up the Bloom Trees (protoStage.ts buildKapok, `bloom`): hand-built from the kapok climb in World 5's bloom trees (the lead's call,
 * 2026-10-29; Matt 2026-10-28: 5-8 stays hand-built). On 20 rolls, Normal and Easy as the game builds them: the check clean, 2:00 or more
 * for the inspector's quick player, only World 5's spiders (each listed for w5Play, each kept clear of the flags), no World 1 pieces
 * (squirrel rooms, golden seeds), nothing crumbling, the twilight and the garden's dressing. Its falls are w4Catch.test.ts's.
 */
import './headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateStage, setLayoutVariant, type GeneratedStage } from './stageGenerator.ts';
import { withGoals } from './goals.ts';
import { easyStage } from './easyMode.ts';
import { validateStage, SAFE_APPROACH } from './levelCheck.ts';
import { generateAllLevels } from './worldsData.ts';
import { HAND_STAGES, type ProtoExtras } from './protoStage.ts';
import { pickRoute } from '../../tools/inspect/eraRoll.ts';

const cfg = { ...generateAllLevels().find((l) => l.id === '5-8')!, unlocked: true };
type St = GeneratedStage & { proto: ProtoExtras };
const play = (v: number, easy: boolean): St => {
  setLayoutVariant(v);
  try {
    const st = withGoals(generateStage(cfg, easy ? 'easy' : 'normal'));
    return (easy ? easyStage(st) : st) as St;
  } finally {
    setLayoutVariant(null);
  }
};

test('5-8 is hand-built: the bloom-tree climb, not the old generator', () => {
  assert.equal(HAND_STAGES['5-8'], '5-8');
  const st = play(1, false);
  assert.equal(st.config.objectiveType, 'ascent');
  assert.equal(st.proto.w5?.mood, 'twilight');
  assert.ok((st.proto.w5?.decor?.length ?? 0) >= 12, 'the bloom trees are dressed');
});

test('20 rolls, Normal and Easy: the check clean, 2:00 or more, World 5 spiders only and clear of every flag, nothing of World 1, nothing crumbles', () => {
  let spiders = 0;
  for (let v = 1; v <= 20; v++) {
    for (const easy of [false, true]) {
      const st = play(v, easy);
      const at = `5-8 roll ${v} (${easy ? 'Easy' : 'Normal'})`;
      assert.deepEqual(validateStage(st).errors, [], at);
      const R = pickRoute('ascent', st as never);
      assert.ok(R.quick.time >= 120, `${at}: ${R.quick.time.toFixed(0)} s for the quick player`);
      const listed = new Set((st.proto.w5?.spiders ?? []).map((s) => s.id));
      for (const e of st.enemies) {
        assert.equal(e.type, 'spider', `${at}: a ${e.type}`);
        assert.ok(listed.has(e.id), `${at}: spider ${e.id} not listed for w5Play`);
        for (const c of st.checkpoints ?? []) if (Math.abs(c.y - e.y) < 400) assert.ok(Math.min(Math.abs(e.patrolMinX - c.x), Math.abs(e.patrolMaxX - c.x)) >= SAFE_APPROACH || e.patrolMaxX < c.x || e.patrolMinX > c.x, at);
      }
      if (!easy) spiders += st.enemies.length;
      assert.ok(!st.collectibles.some((c) => c.type === 'seed'), `${at}: a golden seed`);
      assert.ok(!(st as { kit?: { rooms: unknown[] } }).kit?.rooms?.length, `${at}: a puzzle room`);
      assert.ok(!st.platforms.some((p) => p.type === 'fragile'), `${at}: something crumbles`);
    }
  }
  assert.ok(spiders >= 25, `only ${spiders} spiders over 20 Normal rolls`);
});
