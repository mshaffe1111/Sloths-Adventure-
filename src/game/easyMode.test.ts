import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from './worldsData.ts';
import { generateStage } from './stageGenerator.ts';
import { validateStage, jumpOK } from './levelCheck.ts';
import { buildProtoStage, HAND_STAGES } from './protoStage.ts';
import { buildW2Stage, W2_STAGES } from './w2Stages.ts';
import { easyStage } from './easyMode.ts';

const levels = generateAllLevels().filter((l) => !l.secret);

/** what the validator says about a stage, without the parts that name ids or positions that Easy shifts */
const errs = (r: { ok: boolean; errors?: string[] }) => new Set((r.errors ?? []).map((e) => e.replace(/[\d.]+/g, '#')));

function check(id: string, normal: ReturnType<typeof generateStage>, easy: ReturnType<typeof generateStage>) {
  const before = errs(validateStage(normal));
  const after = validateStage(easy);
  const added = [...errs(after)].filter((e) => !before.has(e));
  assert.deepEqual(added, [], `${id}: Easy broke the stage: ${added.join('; ')}`);
}

test('easy: every generated stage is still a good stage on Easy', () => {
  for (const cfg of levels) {
    if (HAND_STAGES[cfg.id] || W2_STAGES[cfg.id]) continue;
    check(cfg.id, generateStage(cfg), easyStage(generateStage(cfg)));
  }
});

test('easy: every hand-built stage is still a good stage on Easy', () => {
  for (const cfg of levels) {
    const hand = HAND_STAGES[cfg.id];
    const w2 = W2_STAGES[cfg.id];
    if (!hand && !w2) continue;
    const build = () => (hand ? buildProtoStage(cfg, 1, hand) : buildW2Stage(cfg, 1, w2));
    check(cfg.id, build(), easyStage(build()));
  }
});

test('easy: fewer animals, a goal that still can be met, and a heart at every flag', () => {
  let before = 0, after = 0;
  for (const cfg of levels) {
    if (cfg.objectiveType === 'boss_lair') continue;
    const n = generateStage(cfg);
    const e = easyStage(generateStage(cfg));
    before += n.enemies.length;
    after += e.enemies.length;
    for (const t of new Set(n.enemies.map((x) => x.type))) assert.ok(e.enemies.some((x) => x.type === t), `${cfg.id}: keeps a ${t}`);
    if (cfg.objectiveType === 'purge' || cfg.objectiveType === 'gauntlet') {
      assert.ok(e.config.targetCount <= e.enemies.length && e.config.targetCount <= cfg.targetCount, `${cfg.id}: goal ${e.config.targetCount} of ${e.enemies.length}`);
    }
    for (const cp of e.checkpoints ?? []) {
      assert.ok(e.collectibles.some((c) => (c.type === 'heart' || c.type === 'super_heart') && Math.abs(c.x - cp.x) < 260 && Math.abs(c.y - cp.y) < 260), `${cfg.id}: heart at the flag at ${cp.x}`);
    }
  }
  assert.ok(after < before * 0.7, `animals ${before} -> ${after}`);
});

test('easy: a far jump over a drop gets a stone each side of it can reach with a single jump', () => {
  let stones = 0;
  for (const cfg of levels) {
    const n = generateStage(cfg);
    const e = easyStage(generateStage(cfg));
    const ids = new Set(n.platforms.map((p) => p.id));
    for (const s of e.platforms.filter((p) => !ids.has(p.id))) {
      stones++;
      assert.ok(e.platforms.some((p) => p !== s && jumpOK(p, s, false).ok), `${cfg.id}: stone at ${s.x} can be reached`);
    }
  }
  assert.ok(stones > 0, 'some stones were laid');
});
