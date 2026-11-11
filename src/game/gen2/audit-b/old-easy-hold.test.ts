/**
 * ENGINE AUDIT B (2026-11-11), the old generators' slice. FAILING ON PURPOSE: each test proves a finding; none fixes code.
 * Run: npx tsx --test src/game/gen2/audit-b/old-easy-hold.test.ts
 *
 * OLD-1  levelCheck.doubleAllowed keeps the double jump from 1-2..1-5 (EARLY_DOUBLE holds '1-1' only), though 1-1 teaches it and the
 *        hand-built 1-2, 1-3 and 1-5 need it: the game's own walk (validateStage, as easyStage / easyHoldSoften / the flag passes call it)
 *        does not reach their exits on most layouts.
 * OLD-2  So Easy's 70%-hold softening (easyMode.ts easyHoldSoften, doubleAllowed(stage.config)) never sees the double-jump ledges of
 *        1-3 and 1-5, and they keep jumps a 70% hold does not make (STAGE-RULES §2 "Easy jumps", Gemini G8).
 * OLD-3  The gate that should catch it (easyMode.test.ts:44-58) compares error KINDS of the 70% walk against the full walk, never
 *        asserts either walk is ok: where the full walk already fails with "exit platform # is not reachable", the 70% walk's same
 *        line is masked. This file asserts the walks themselves.
 * OLD-4  Easy's extra flags (easyMode.ts:497-515) are laid only on ledges the validator reaches; on a layout whose walk stops at a
 *        liana chain (the check never follows vine to vine, STAGE-RULES §6) Easy lays none past the stop. capFlagSpans (easyMode.ts:276-283)
 *        was patched for this blind spot; its sibling in easyStage was not.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from '../../worldsData.ts';
import { buildProtoStage, HAND_STAGES } from '../../protoStage.ts';
import { validateStage } from '../../levelCheck.ts';
import { easyStage } from '../../easyMode.ts';
import { EASY_HOLD } from '../../physics.ts';

const levels = generateAllLevels();
const cfgOf = (id: string) => levels.find((l) => l.id === id)!;
const exitLost = (r: { errors: string[] }) => r.errors.filter((e) => /exit platform .* is not reachable/.test(e));
/** the stage with the double jump counted (what capFlagSpans already does for these stages: easyMode.ts:275) */
const withDouble = <T extends { config: { miniIndex: number } }>(st: T): T => ({ ...st, config: { ...st.config, miniIndex: Math.max(6, st.config.miniIndex) } });

test('OLD-1: the game\'s own walk reaches the exit of hand-built 1-2, 1-3 and 1-5 on the pinned rolls 1-3 (it does once the double jump he has is counted)', () => {
  const bad: string[] = [];
  for (const id of ['1-2', '1-3', '1-5']) {
    for (const seed of [1, 2, 3]) {
      const st = buildProtoStage(cfgOf(id), seed, HAND_STAGES[id]);
      const asJudged = exitLost(validateStage(st)).length > 0;
      const counted = exitLost(validateStage(withDouble(st))).length > 0;
      if (asJudged) bad.push(`${id} roll ${seed}: exit unreachable as judged${counted ? ' (and with the double counted)' : ', reachable with the double counted'}`);
    }
  }
  assert.deepEqual(bad, [], bad.join('; '));
});

test('OLD-2/3: Easy 1-3 and 1-5 finish on a 70% hold on rolls 1-3 (the double jump counted, as the player has it)', () => {
  const bad: string[] = [];
  for (const id of ['1-3', '1-5']) {
    for (const seed of [1, 2, 3]) {
      const easy = withDouble(easyStage(buildProtoStage(cfgOf(id), seed, HAND_STAGES[id])));
      const full = exitLost(validateStage(easy)).length;
      const held = exitLost(validateStage(easy, { hold: EASY_HOLD })).length;
      if (!full && held) bad.push(`${id} roll ${seed}: the full jump finishes it, a 70% hold does not`);
    }
  }
  assert.deepEqual(bad, [], bad.join('; '));
});

test('OLD-4: Easy lays flags past the place the validator\'s walk stops (3-1, a layout with a liana chain)', () => {
  // (layout 20081: the walk stops at x 7369 of 27412, at the two lianas at x 7544 and 7892; Normal's flags leave runs up to 3543 px,
  // Easy's own rule is a flag in every run over FLAG_EVERY, 1800 px: layouts 1-3, whose walk finishes, get 9-12 Easy flags)
  const id = '3-1';
  const added = (seed: number) => {
    const normal = buildProtoStage(cfgOf(id), seed, HAND_STAGES[id]);
    const reach = new Set(validateStage(normal, { rooms: false }).reachableIds);
    const front = Math.max(...normal.platforms.filter((p) => reach.has(p.id)).map((p) => p.x + p.width));
    const before = new Set((normal.checkpoints ?? []).map((c) => Math.round(c.x)));
    const easy = easyStage(buildProtoStage(cfgOf(id), seed, HAND_STAGES[id]));
    const fresh = (easy.checkpoints ?? []).filter((c) => !before.has(Math.round(c.x)));
    return { front, exit: normal.exitTotemX, all: fresh.length, past: fresh.filter((c) => c.x > front).length };
  };
  const ok = added(1), stopped = added(20081);
  assert.ok(ok.front >= ok.exit - 200, `layout 1: the walk finishes (frontier ${Math.round(ok.front)} of ${Math.round(ok.exit)}) and Easy adds ${ok.all} flags`);
  assert.ok(stopped.front < stopped.exit - 200, 'layout 20081: the walk stops short (the liana chain)');
  assert.ok(stopped.past > 0, `layout 20081: Easy added ${stopped.all} flags, ${stopped.past} past x ${Math.round(stopped.front)} (the exit is at ${Math.round(stopped.exit)}); layout 1 got ${ok.all}`);
});
