/**
 * 5-6 "Where She Ran" as the game plays it (worlds/w5Run.ts): every shipped roll, Normal and Easy, built through the game's own entry
 * (generateStage, withGoals, easyStage). Each roll holds her two hiding places (the dip and the bough) once; five or six messages, each
 * one of Meeca's carvings with its trunk and her words, no two alike, in her order (the trail mark first); the goal is reachable
 * (levelCheck); 2:00 or more for the inspector's quick player; nothing hurts in the first 5 s; only World 5's own animals; nothing
 * crumbles; flags close enough. And her words follow her save: what she cut in 5-M, in the order she cut it.
 */
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateStage, setLayoutVariant, type GeneratedStage } from '../stageGenerator.ts';
import { easyStage } from '../easyMode.ts';
import { withGoals } from '../goals.ts';
import { validateStage } from '../levelCheck.ts';
import { walkSpeed, MODEL_TYPICAL } from '../stageTime.ts';
import { generateAllLevels } from '../worldsData.ts';
import { MEECA_MARK, MEECA_WARNINGS } from '../meecaLines.ts';
import type { LevelConfig } from '../types.ts';
import { GEN2_STAGES } from './game.ts';
import { FLAG_SPAN } from './pipeline.ts';
import { GEN2_SEEDS } from './seeds.ts';
import type { Gen2Stage } from './types.ts';
import { runWords, W5_RUN_REQUIRED } from './worlds/w5Run.ts';
import { pickRoute } from '../../../tools/inspect/eraRoll.ts';

const levels = generateAllLevels();
const lv = (id: string): LevelConfig => ({ ...levels.find((l) => l.id === id)!, unlocked: true });
type Played = GeneratedStage & { gen2?: Gen2Stage['gen2']; proto?: Gen2Stage['proto'] };

function played(variant: number, easy: boolean): Played {
  setLayoutVariant(variant);
  try {
    const st = withGoals(generateStage(lv('5-6'), easy ? 'easy' : 'normal'));
    return (easy ? easyStage(st) : st) as Played;
  } finally {
    setLayoutVariant(null);
  }
}
const cache = new Map<string, Played>();
const each = (f: (st: Played, at: string) => void) => {
  for (let i = 0; i < (GEN2_SEEDS['5-6']?.seeds.length ?? 0); i++) {
    for (const easy of [false, true]) {
      const k = `${i}:${easy}`;
      if (!cache.has(k)) cache.set(k, played(i, easy));
      f(cache.get(k)!, `5-6 roll ${i} (${easy ? 'Easy' : 'Normal'})`);
    }
  }
};

test('5-6 is gen2: 16 shipped rolls, curated on the kit the game builds with, no old-generator seed', () => {
  assert.equal(GEN2_SEEDS['5-6']?.seeds.length, 16);
  assert.equal(GEN2_SEEDS['5-6'].kit, GEN2_STAGES['5-6'].kitName);
  assert.equal(lv('5-6').targetCount, 5);
});

test("every shipped roll: her hiding places once, five or six of her carvings, all different, in her order, the goal reachable", () => {
  const order = [MEECA_MARK.lines, ...MEECA_WARNINGS.map((w) => w.lines)].map((l) => l.join(' '));
  each((st, at) => {
    for (const r of W5_RUN_REQUIRED['5-6']) assert.equal(st.gen2!.sections.filter((s) => s.template === r.section).length, 1, `${at}: ${r.section} once`);
    const msgs = st.collectibles.filter((c) => c.type === 'relic').sort((a, b) => a.x - b.x);
    assert.ok(msgs.length >= 5 && msgs.length <= 6, `${at}: ${msgs.length} messages`);
    assert.ok(msgs.every((c) => c.carving !== undefined), `${at}: a message that is not a carving`);
    const carv = [...(st.proto!.w5!.carvings ?? [])].sort((a, b) => a.x - b.x);
    assert.equal(carv.length, msgs.length, at);
    msgs.forEach((c, i) => assert.ok(Math.abs(carv[i].x - c.x) < 1 && carv[i].trunk, `${at}: message ${i} has no trunk`));
    const said = carv.map((c) => c.lines.join(' '));
    assert.equal(new Set(said).size, said.length, `${at}: two carvings alike`);
    // (in her order: the default one before her stage is played, the trail mark dropped when only five stand)
    assert.deepEqual(said, order.slice(order.length - said.length), at);
    assert.deepEqual(validateStage(st).errors, [], at);
    assert.ok(st.config.targetCount <= msgs.length, `${at}: a goal of ${st.config.targetCount} with ${msgs.length} messages`);
  });
});

test('every shipped roll: 2:00 or more, nothing hurts in the first 5 s, World 5 animals only, nothing crumbles, flags close enough', () => {
  const ws = walkSpeed(MODEL_TYPICAL);
  each((st, at) => {
    const R = pickRoute(st.config.objectiveType, st as never);
    assert.notEqual(R.used.route.traced, 'failed', at);
    assert.ok(R.quick.time >= 120, `${at}: ${R.quick.time.toFixed(0)} s for the quick player`);
    const open = st.spawnX + 5 * ws - 60;
    for (const e of st.enemies) {
      assert.equal(e.type, 'spider', `${at}: a ${e.type} in World 5`);
      assert.ok(e.patrolMinX > open, `${at}: a spider ${e.patrolMinX - st.spawnX} px in`);
    }
    assert.ok(!st.platforms.some((p) => p.type === 'fragile'), `${at}: nothing crumbles`);
    const xs = [st.spawnX, ...(st.checkpoints ?? []).map((c) => c.x).sort((a, b) => a - b), st.exitTotemX];
    for (let k = 1; k < xs.length; k++) assert.ok(xs[k] - xs[k - 1] <= FLAG_SPAN.max, `${at}: ${xs[k] - xs[k - 1]} px with no flag`);
  });
});

test("her words follow her save: what she cut, in the order she cut it, the rest after in her default order", () => {
  const store = new Map<string, string>();
  const ls = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) };
  const g = globalThis as { localStorage?: unknown };
  const before = g.localStorage;
  g.localStorage = ls;
  try {
    assert.deepEqual(runWords()[1], [...MEECA_WARNINGS[0].lines], 'nothing cut: her default order');
    ls.setItem('sloth_w5_carved', JSON.stringify({ v: 1, done: false, carvings: [
      { id: 'tea', lines: ['NO TEA.', 'BE', 'RUDE.', 'M.'], along: 0.2, high: false, caught: 0 },
      { id: 'sit', lines: ['POKEY.', "DON'T", 'SIT.', 'M.'], along: 0.6, high: false, caught: 1 },
    ] }));
    const w = runWords().map((l) => l.join(' '));
    assert.deepEqual(w.slice(0, 3), ['M.', 'NO TEA. BE RUDE. M.', "POKEY. DON'T SIT. M."]);
    assert.equal(w.length, 6);
    assert.equal(new Set(w).size, 6);
  } finally {
    g.localStorage = before;
  }
});
