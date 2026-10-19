import test from 'node:test';
import assert from 'node:assert/strict';
import { missionOf, skillsFrom, skillGuaranteedAt, newlyLearned, SKILLS } from './skills.ts';
import { generateAllLevels } from './worldsData.ts';
import { generateStage, setLayoutVariant } from './stageGenerator.ts';
import { validateStage } from './levelCheck.ts';

test('missionOf puts stages in game order', () => {
  assert.equal(missionOf('1-1'), 1);
  assert.equal(missionOf('1-3'), 3);
  assert.equal(missionOf('2-5'), 15);
  assert.equal(missionOf('nonsense'), 0);
});

test('skills come from cleared stages only', () => {
  assert.equal(skillsFrom(() => false).size, 0);
  assert.ok(skillsFrom((id) => id === '1-3').has('shimmy'));
  assert.ok(!skillsFrom((id) => id === '1-2').has('shimmy'));
});

test('a skill is guaranteed only from its required stage on, which is after the stage that teaches it', () => {
  for (const s of SKILLS) {
    assert.ok(missionOf(s.requiredFromStage) > missionOf(s.unlockedBy), `${s.id}: required stage comes after the teacher`);
    assert.equal(skillGuaranteedAt(s.id, missionOf(s.requiredFromStage) - 1), false);
    assert.equal(skillGuaranteedAt(s.id, missionOf(s.requiredFromStage)), true);
  }
});

test('newlyLearned fires once, on the teaching stage', () => {
  assert.equal(newlyLearned('1-3', new Set()).length, 1);
  assert.equal(newlyLearned('1-3', new Set(['shimmy'])).length, 0);
  assert.equal(newlyLearned('1-2', new Set()).length, 0);
});

test('no stage needs a rope before the skill is guaranteed, and every stage stays beatable', () => {
  let ropes = 0;
  for (const lvl of generateAllLevels()) {
    for (const variant of [0, 1, 2, 3]) {
      setLayoutVariant(variant);
      const stage = generateStage(lvl);
      const at = missionOf(lvl.id);
      for (const r of stage.ropes ?? []) {
        ropes++;
        if (!skillGuaranteedAt('shimmy', at)) assert.ok(!r.required, `${lvl.id} v${variant}: rope required before the skill is taught`);
      }
      const res = validateStage(stage);
      assert.equal(res.ok, true, `${lvl.id} v${variant}: ${res.errors.slice(0, 3).join('; ')}`);
    }
  }
  setLayoutVariant(null);
  assert.ok(ropes > 0, 'ropes do appear somewhere');
});

test('the validator refuses a required rope in a stage entered before the skill is taught', () => {
  const lvl = generateAllLevels().find((l) => l.id === '1-2')!;
  const stage = generateStage(lvl);
  const p = stage.platforms.filter((q) => !q.broken);
  const a = p[1];
  const b = p[2];
  stage.ropes = [{ id: 999, x0: a.x + a.width - 40, x1: b.x + 40, y: Math.min(a.y, b.y) - 146, required: true } as never];
  const res = validateStage(stage);
  assert.equal(res.ok, false);
  assert.ok(res.errors.some((e) => /rope #999/.test(e)), res.errors.join('; '));
});
