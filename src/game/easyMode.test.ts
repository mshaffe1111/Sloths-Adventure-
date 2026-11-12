import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from './worldsData.ts';
import { generateStage } from './stageGenerator.ts';
import { listedStage } from './gen2/listed.ts';
import { validateStage, jumpOK, easyHoldCheck } from './levelCheck.ts';
import { buildProtoStage, HAND_STAGES } from './protoStage.ts';
import { buildW2Stage, W2_STAGES } from './w2Stages.ts';
import { costsHere, easyStage } from './easyMode.ts';
import { isGen2Stage } from './gen2/game.ts';

const levels = generateAllLevels().filter((l) => !l.secret);
/** a stage on Easy as the engine builds it: a gen2 stage (5-7, 5-9) is laid for Easy by its own pipeline, the rest made gentler here */
// (a gen2 stage, 5-7 and the rest, and 1-1 whose Play is gen2 (stageGenerator.ts), is laid for Easy by the pipeline itself)
const gen2Built = (cfg: (typeof levels)[number]) => isGen2Stage(cfg) || !!(generateStage(cfg) as { gen2?: unknown }).gen2;
const easyOf = (cfg: (typeof levels)[number]) => easyStage(gen2Built(cfg) ? generateStage(cfg, 'easy') : generateStage(cfg));

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
    check(cfg.id, generateStage(cfg), easyOf(cfg));
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

test('easy: no stage needs a full-hold jump on Easy, on rolls 1-3 (Gemini G8, a ~70% hold climbs and crosses all of it)', () => {
  for (const seed of [1, 2, 3]) {
    for (const cfg of levels) {
      if (cfg.objectiveType === 'boss_lair') continue;
      const hand = HAND_STAGES[cfg.id];
      const w2 = W2_STAGES[cfg.id];
      // (a generated stage is the same on every roll)
      if (!hand && !w2 && seed > 1) continue;
      const easy = hand ? easyStage(buildProtoStage(cfg, seed, hand)) : w2 ? easyStage(buildW2Stage(cfg, seed, w2)) : easyOf(cfg);
      const full = errs(validateStage(easy));
      const added = [...errs({ ok: false, errors: easyHoldCheck(easy) })].filter((e) => !full.has(e));
      assert.deepEqual(added, [], `${cfg.id} roll ${seed}: only a full-hold jump reaches it on Easy: ${added.join('; ')}`);
    }
  }
});

test('easy: fewer animals, a goal that still can be met, and a heart at every flag', () => {
  let before = 0, after = 0;
  for (const cfg of levels) {
    if (cfg.objectiveType === 'boss_lair') continue;
    const n = generateStage(cfg);
    const e = easyOf(cfg);
    before += n.enemies.length;
    after += e.enemies.length;
    for (const t of new Set(n.enemies.map((x) => x.type))) assert.ok(e.enemies.some((x) => x.type === t), `${cfg.id}: keeps a ${t}`);
    if (cfg.objectiveType === 'purge' || cfg.objectiveType === 'gauntlet') {
      assert.ok(e.config.targetCount <= e.enemies.length && e.config.targetCount <= cfg.targetCount, `${cfg.id}: goal ${e.config.targetCount} of ${e.enemies.length}`);
    }
    const heartAt = (cp: { x: number; y: number }) => e.collectibles.some((c) => (c.type === 'heart' || c.type === 'super_heart') && Math.abs(c.x - cp.x) < 260 && Math.abs(c.y - cp.y) < 260);
    // (H1, hearts follow risk (Matt 11-05, "a heart only after real risk"; the lead 11-06: gen2 only; the lead 11-12, P12S: by the rule,
    // never by a stage's name): a listed gen2 stage where nothing costs anything on this setting (gen2 1-1; 1-2 on Easy, its thorn
    // hollows soft) has no heart at its flags; every other stage keeps one at each. The planted case below proves it both ways)
    const h1 = !!listedStage(cfg.id) && !!(e as { gen2?: unknown }).gen2 && !costsHere(e);
    for (const cp of e.checkpoints ?? []) assert.equal(heartAt(cp), !h1, `${cfg.id}: ${h1 ? 'no heart (H1)' : 'heart'} at the flag at ${cp.x}`);
  }
  assert.ok(after < before * 0.7, `animals ${before} -> ${after}`);
});

test('H1 both ways, planted: a listed stage with nothing that costs on Easy has no flag hearts; give the same build one real cost and every flag gets its heart', () => {
  const cfg = levels.find((l) => !!listedStage(l.id) && costsHere(generateStage(l, 'normal')) && !costsHere(generateStage(l, 'easy')));
  assert.ok(cfg, 'a listed stage that costs on Normal and nothing on Easy (1-2: its thorn hollows soft on Easy)');
  const heartAt = (st: ReturnType<typeof easyStage>, cp: { x: number; y: number }) => st.collectibles.some((c) => (c.type === 'heart' || c.type === 'super_heart') && Math.abs(c.x - cp.x) < 260 && Math.abs(c.y - cp.y) < 260);
  const calm = easyStage(generateStage(cfg, 'easy'));
  assert.ok((calm.checkpoints ?? []).length > 2);
  assert.deepEqual((calm.checkpoints ?? []).filter((cp) => heartAt(calm, cp)).map((cp) => cp.x), [], `${cfg.id} Easy: nothing costs, so no flag heart`);
  // (the planted cost: one hurt hollow made a real fall, as Normal's are)
  const st = generateStage(cfg, 'easy') as ReturnType<typeof generateStage> & { heartFalls?: Array<{ soft?: boolean }> };
  assert.ok(st.heartFalls?.length, 'the fixture has hurt hollows');
  st.heartFalls![0].soft = false;
  const hurt = easyStage(st);
  assert.ok(costsHere(hurt));
  for (const cp of hurt.checkpoints ?? []) assert.ok(heartAt(hurt, cp), `${cfg.id} Easy with a real cost: a heart at the flag at ${cp.x}`);
});

test('easy: a far jump over a drop gets a stone each side of it can reach with a single jump', () => {
  let stones = 0;
  for (const cfg of levels) {
    // (a gen2 stage lays no stones: its Easy jumps are sized from Easy's margin, with soft pits, by the pipeline: gen2/game.test.ts)
    if (gen2Built(cfg)) continue;
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
