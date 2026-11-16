/**
 * A section that asks the bounce + air jump DECLARES it (SectionTemplate.needs 'bounce-air', data) and no stage's kit offers it until a
 * stage teaches the combo (the lead's ruling 11-15 3:02 PM ET, after FIX-21's bounce-alone cap): planBudget holds 'bounce-air' in a stage's
 * moves only where skills.ts comboGuaranteedAt says so, and the pool keeps a section only when its needs are in the moves. Any world, by data.
 * Planted: take 'bounce-air' out of a combo section's needs and the first test names it (RED); offer the combo untaught and the second does.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { layLocal, planBudget, rngFor } from './pipeline.ts';
import { cfg, manifest } from './toyWorld.ts';
import { W1_SECTIONS, w1World } from './worlds/w1.ts';
import { comboGuaranteedAt, missionOf } from '../skills.ts';
import { generateAllLevels } from '../worldsData.ts';
import type { Move } from './types.ts';

test('every W1 section whose lay moves with the bounce + air jump declares it (needs bounce-air)', () => {
  const nb = planBudget(cfg('1-1', 'stealth'), manifest, 'normal');
  const mk = (combo: boolean) => ({ ...nb, moves: ['walk', 'jump', 'double', ...(combo ? ['bounce-air'] : [])] as Move[] });
  const undeclared: string[] = [];
  let asks = 0;
  for (const s of W1_SECTIONS) {
    if (s.needs?.includes('rope')) continue;
    let moves = false;
    for (const v of s.subBlocks![0].versions) for (const seed of [1, 2, 3]) {
      const a = layLocal(s, mk(false), rngFor(seed), false, { versions: { body: v.id } });
      const b = layLocal(s, mk(true), rngFor(seed), false, { versions: { body: v.id } });
      if (Math.round(a.exit.y) !== Math.round(b.exit.y) || a.pieces.some((p, i) => Math.round(p.y) !== Math.round(b.pieces[i]?.y ?? NaN))) moves = true;
    }
    if (moves) asks++;
    if (moves && !s.needs?.includes('bounce-air')) undeclared.push(s.id);
  }
  assert.ok(asks > 0, 'no section asks the combo: the test proves nothing');
  assert.deepEqual(undeclared, [], 'sections that ask the combo without declaring it');
});

test('no World 1 stage holds the combo while no stage teaches it: its budget lacks bounce-air, so no combo section is in its pool or its built plan', () => {
  const kit = w1World();
  const combo = new Set(W1_SECTIONS.filter((s) => s.needs?.includes('bounce-air')).map((s) => s.id));
  for (const l of generateAllLevels().filter((x) => x.worldIndex === 1 && x.objectiveType !== 'boss_lair')) {
    const b = planBudget({ ...l, unlocked: true } as never, kit.manifest, 'normal');
    assert.equal(b.moves.includes('bounce-air'), comboGuaranteedAt('bounce-air', missionOf(l.id)), `${l.id}: the budget's combo follows comboGuaranteedAt`);
    if (!comboGuaranteedAt('bounce-air', missionOf(l.id))) {
      const offered = kit.manifest.sections.filter((t) => combo.has(t.id) && (t.needs ?? []).every((m) => b.moves.includes(m)));
      assert.deepEqual(offered.map((t) => t.id), [], `${l.id}: a combo section offered with the combo untaught`);
    }
  }
});
