/**
 * A stage ROW not yet on the seed list, planted the way Play rolls a listed row (ENG-26f, lifted out of rowWheels.ts withPlantedRow, where
 * it ran inside withTestStage): its row in the table (listed.ts LISTED: its kit and its world's finish), a one-seed list packed from the
 * roll (seedList.ts plantSeedList), and a hand-built stage of the same id put aside (it is routed before any listed row). Returns the undo.
 * Two callers: the bots (rowWheels.ts withPlantedRow, undone after the run) and a DEV page (draftRoute.mjs: the dev server serves this
 * file to the page, so the real game plays the draft row; nothing in src imports it, so no shipped build holds it).
 */
import { LISTED } from '../../src/game/gen2/listed.ts';
import { buildGen2Stage, keptFoes } from '../../src/game/gen2/pipeline.ts';
import { hasSeedList, packPlan, plantSeedList } from '../../src/game/gen2/seedList.ts';
import type { WorldKit } from '../../src/game/gen2/types.ts';
import { W2_STAGES } from '../../src/game/w2Stages.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';

/** a row as listed.ts takes it: its stage id, its kit and its world's finish */
export interface PlantedRow {
  stage: string;
  kit: () => WorldKit;
  world: (s: never, sq: never, d: 'easy' | 'normal') => unknown;
}

/** `row` planted as the one listed roll of its stage at `seed`; the returned function puts everything back */
export function plantRow(row: PlantedRow, seed: number): () => void {
  const cfg = generateAllLevels().find((c) => c.id === row.stage && !c.secret);
  if (!cfg) throw new Error(`plantRow: no stage ${row.stage}`);
  if (Object.hasOwn(LISTED, row.stage) || hasSeedList(row.stage)) throw new Error(`plantRow: ${row.stage} is already listed`);
  const kit = row.kit();
  const st = buildGen2Stage({ config: cfg, kit, seed, difficulty: 'normal' });
  const dict: string[] = [];
  const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
  LISTED[row.stage] = { kit: () => kit, world: row.world as never };
  const undoList = plantSeedList(row.stage, { dict, seeds: [seed], plans: [packed] });
  const hands = W2_STAGES as Record<string, unknown>;
  const had = row.stage in hands, hand = hands[row.stage];
  delete hands[row.stage];
  return () => {
    undoList();
    delete LISTED[row.stage];
    if (had) hands[row.stage] = hand;
  };
}
