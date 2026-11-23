/**
 * A page's draft (tools/engine/draftshoot.mjs): loaded before the game's entry, it readies the draft the page names (globalThis
 * __GEN2_DRAFT, set before any script runs) as draft.ts readies a tool's, so the game's own build plays it. Nothing in the game imports it.
 */
import { readyDraft } from './draftReady.ts';

const id = (globalThis as { __GEN2_DRAFT?: string }).__GEN2_DRAFT;
if (id) readyDraft(id);
