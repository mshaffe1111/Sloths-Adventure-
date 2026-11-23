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
import { readyDraft } from './draftReady.ts';
export { draftCheck, readied, readyDraft } from './draftReady.ts';

/** the environment variable a tool reads its draft from */
export const DRAFT_ENV = 'GEN2_DRAFT';

const want = process.env[DRAFT_ENV];
if (want) readyDraft(want);
