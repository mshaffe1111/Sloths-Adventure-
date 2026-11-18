/**
 * A roll the caller's judge refuses by a PLACE (a slot: the quiet line names one) is repaired by swapping that slot's section out; a
 * section refused that way twice is banned from the stage's later rolls (pipeline.ts swapOut, bans[-1]). On a designed arc (one brick
 * per beat) that ban can leave a later fresh roll with no section for the beat, and the build THREW "no section fits node ...: the pool
 * is spent", crashing seedlist --check and any relist (INT-11 11-15: 2-1's quiet line at beat X, every listed seed). The rule: a search
 * whose own bans spend the pool REFUSES the roll (its errors say why), never throws. Any stage; proven on 2-1 and 1-8 (designed arcs).
 *   npx tsx --test src/game/gen2/refuseNotThrow.test.ts
 */
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGen2Stage } from './pipeline.ts';
import { listedStage } from './listed.ts';
import { generateAllLevels } from '../worldsData.ts';

for (const id of ['2-1', '1-8']) {
  test(`${id}: a judge that refuses the same section by its slot on every roll gets a refused stage back, never a throw (planted)`, () => {
    const row = listedStage(id)!;
    const cfg = generateAllLevels().find((l) => l.id === id)!;
    let target: string | undefined;
    // (the planted judge: the section laid second, refused by its slot whatever roll it is in, as the quiet line refuses a place)
    const also = (st: { gen2: { sections: Array<{ template: string }> } }) => {
      target ??= st.gen2.sections[1].template;
      const slot = st.gen2.sections.findIndex((s) => s.template === target);
      return slot >= 0 ? [{ line: `planted: ${target} refused here`, slot }] : [];
    };
    let st: ReturnType<typeof buildGen2Stage> | undefined;
    assert.doesNotThrow(() => { st = buildGen2Stage({ config: cfg as never, kit: row.kit(), seed: 1, difficulty: 'normal', also: also as never }); });
    assert.ok(st!.gen2.errors.length > 0, 'the refused roll comes back with its errors');
  });
}
