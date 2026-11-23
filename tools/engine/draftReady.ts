/**
 * The draft readying itself (tools/engine/draft.ts, ENG-W3a 11-23): no node global, so a page loads it too (tools/engine/draftshoot.mjs
 * puts it before the game's own entry, draftBoot.ts). Nothing in the game imports it.
 */
import { draftRow } from '../../src/game/gen2/worlds/stageTable.ts';
import { draftListed, LISTED } from '../../src/game/gen2/listed.ts';
import { HAND_STAGES } from '../../src/game/protoStage.ts';
import { W2_STAGES } from '../../src/game/w2Stages.ts';
import { STAGE_PLAN } from '../../src/game/stagePlan.ts';
import type { LevelConfig } from '../../src/game/types.ts';

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
