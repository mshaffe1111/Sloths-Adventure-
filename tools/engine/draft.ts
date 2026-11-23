/**
 * A DRAFT stage readied in a tool's process (ENG-W3a 11-23; the lead's ruling: "make the draft state general: any world's next stage can
 * be readied this way"). A draft row (src/game/gen2/worlds/stageTable.ts DRAFT_TABLE) is a stage's next build on gen2 while the game
 * still plays its live stage (hand-built, or the old section maker). GEN2_DRAFT=<id> in a tool's environment readies it for that process
 * and the processes it starts (castBots' children, addlevel's steps inherit the environment):
 *   - its row is installed as the listed row it becomes (listed.ts draftListed), so libstage, castBots and the game's own build roll it;
 *   - the hand-built plan that shadows it (protoStage.ts HAND_STAGES, w2Stages.ts W2_STAGES) is lifted, so the game's generateStage
 *     rolls it on gen2 as it will once it is listed (stageGenerator.ts listedRoll);
 *   - its config gets the row's travel (stagePlan.ts STAGE_PLAN's entry, read by worldsData.ts generateAllLevels), so the engine plays
 *     it the way it travels (stageModes.ts).
 * No seed list is written for a draft: the game's build rolls the seed it is handed. Nothing in the game imports this file. It must be
 * imported BEFORE anything that builds the levels at load (realPlay.ts `levels`): a tool imports it first, and readyDraft refuses a
 * process whose levels were built without the draft's travel (draftCheck).
 *   GEN2_DRAFT=3-1 npx tsx tools/engine/addlevel.ts 3-1
 */
import '../../src/game/headlessDom.ts';
import { draftRow } from '../../src/game/gen2/worlds/stageTable.ts';
import { draftListed, LISTED } from '../../src/game/gen2/listed.ts';
import { HAND_STAGES } from '../../src/game/protoStage.ts';
import { W2_STAGES } from '../../src/game/w2Stages.ts';
import { STAGE_PLAN } from '../../src/game/stagePlan.ts';
import type { LevelConfig } from '../../src/game/types.ts';

/** the environment variable a tool reads its draft from */
export const DRAFT_ENV = 'GEN2_DRAFT';

/** the draft this process readied (undefined: none) */
export let readied: string | undefined;

/**
 * Ready `id`'s draft in this process: its row in LISTED, its hand-built shadow lifted, its plan entry given the row's travel. Throws, by
 * name, for a stage with no draft row, or one already listed (a draft leaves DRAFT_TABLE in the commit that lists it).
 */
export function readyDraft(id: string): void {
  const row = draftRow(id);
  if (!row) throw new Error(`draft: ${id} has no draft row (src/game/gen2/worlds/stageTable.ts DRAFT_TABLE)`);
  if (Object.hasOwn(LISTED, id) && readied !== id) throw new Error(`draft: ${id} is already listed (STAGE_TABLE): a listed stage is no draft`);
  LISTED[id] = draftListed(id)!;
  delete HAND_STAGES[id];
  delete W2_STAGES[id];
  const [w, s] = id.split('-').map(Number);
  const spec = STAGE_PLAN[w]?.[s - 1];
  if (!spec) throw new Error(`draft: ${id} has no entry in src/game/stagePlan.ts`);
  if (row.travel) STAGE_PLAN[w][s - 1] = { ...spec, travel: row.travel };
  readied = id;
}

/** the draft's travel reached a config built in this process (a tool that built its levels before readyDraft ran plays the live travel) */
export function draftCheck(cfg: Pick<LevelConfig, 'id' | 'travel'>): void {
  const row = draftRow(cfg.id);
  if (readied === cfg.id && row?.travel && cfg.travel !== row.travel) throw new Error(`draft: ${cfg.id}'s config travels ${cfg.travel ?? 'right'}, its draft row ${row.travel}: import tools/engine/draft.ts first`);
}

const want = process.env[DRAFT_ENV];
if (want) readyDraft(want);
