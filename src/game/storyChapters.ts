/**
 * The scenes that play once between the stages: flashbacks (the old days, warm and faded), the turns of the plot that get a scene of their own,
 * and the mid-world scenes where Dot brings Meeca's latest note. The scripts are in storyMemories.ts and storyWorlds.ts, the ending in
 * storyFinale.ts; this file says which scene plays when, remembers which ones the player has seen, and lists them for the Library.
 */
import type { StoryPanel } from './story.ts';
import { GARDEN, GATES, BLESSING, HORN, PHOTOGRAPH, PROMISE_PANELS, SEAM, SEALED, STORM, TEA, WAITING } from './storyMemories.ts';

export { finalePanels } from './storyFinale.ts';
export { PROMISE_PANELS } from './storyMemories.ts';

// ───────────── the scenes ─────────────

export type MemoryId =
  | 'waiting' | 'horn' | 'garden' | 'tea' | 'sealed' | 'storm' | 'photograph' | 'promise' | 'seam' | 'blessing' | 'gates';

export interface MemoryDef {
  id: MemoryId;
  title: string;
  /** shown on the locked card in the Library */
  hint: string;
  /** a flashback of the old days, or a scene of the present */
  kind: 'memory' | 'scene';
  panels: StoryPanel[];
}

export const MEMORIES: Record<MemoryId, MemoryDef> = {
  waiting: { id: 'waiting', title: 'The Waiting', hint: 'Beat the guardian of World 2.', kind: 'memory', panels: WAITING },
  horn: { id: 'horn', title: 'The Horn', hint: 'Beat the guardian of World 3.', kind: 'scene', panels: HORN },
  garden: { id: 'garden', title: "Grandma's Garden", hint: 'Beat the guardian of World 4.', kind: 'memory', panels: GARDEN },
  tea: { id: 'tea', title: 'Tea with the Queen', hint: 'Beat the guardian of World 5.', kind: 'scene', panels: TEA },
  sealed: { id: 'sealed', title: 'The Sealed Note', hint: 'Beat the guardian of World 6.', kind: 'scene', panels: SEALED },
  storm: { id: 'storm', title: 'The Singing Storm', hint: 'Beat the guardian of World 6.', kind: 'memory', panels: STORM },
  photograph: { id: 'photograph', title: 'The Photograph', hint: 'Beat the guardian of World 7.', kind: 'scene', panels: PHOTOGRAPH },
  promise: { id: 'promise', title: 'The Promise', hint: 'Rest a while in World 8.', kind: 'memory', panels: PROMISE_PANELS },
  seam: { id: 'seam', title: 'The Lieutenant', hint: 'Beat the guardian of World 8.', kind: 'scene', panels: SEAM },
  blessing: { id: 'blessing', title: 'The Blessing', hint: 'Beat the guardian of World 9.', kind: 'memory', panels: BLESSING },
  gates: { id: 'gates', title: 'The Open Gates', hint: 'Beat the guardian of World 9.', kind: 'scene', panels: GATES },
};

export const MEMORY_ORDER: MemoryId[] = ['waiting', 'horn', 'garden', 'tea', 'sealed', 'storm', 'photograph', 'promise', 'seam', 'blessing', 'gates'];

/** which scenes play, in this order, the first time each world's guardian goes down (World 8's dream plays inside its world card) */
export const AFTER_BOSS: Partial<Record<number, MemoryId[]>> = {
  2: ['waiting'], 3: ['horn'], 4: ['garden'], 5: ['tea'], 6: ['sealed', 'storm'], 7: ['photograph'], 8: ['seam'], 9: ['blessing', 'gates'],
};

/** the next scene still to play after a guardian falls (and after the one just seen, when `after` is given) */
export function nextAfterBoss(world: number, seen: MemoryId[], after?: MemoryId): MemoryId | undefined {
  const list = AFTER_BOSS[world] ?? [];
  const from = after ? list.indexOf(after) + 1 : 0;
  return list.slice(from).find((id) => !seen.includes(id));
}

// ───────────── which memories have been seen (kept in the browser, and in save files) ─────────────

export const MEMORIES_KEY = 'sloth_memories';

export function parseMemories(raw: string | null): MemoryId[] {
  if (!raw) return [];
  try {
    const o = JSON.parse(raw);
    if (!o || typeof o !== 'object' || o.v !== 1 || !Array.isArray(o.seen)) return [];
    return MEMORY_ORDER.filter((id) => o.seen.includes(id));
  } catch {
    return [];
  }
}

export function loadMemories(): MemoryId[] {
  try {
    return parseMemories(localStorage.getItem(MEMORIES_KEY));
  } catch {
    return [];
  }
}

/** the list with this memory added, in story order (the same list when it was already there) */
export function withMemory(seen: MemoryId[], id: MemoryId): MemoryId[] {
  return seen.includes(id) ? seen : MEMORY_ORDER.filter((m) => m === id || seen.includes(m));
}

export function saveMemories(seen: MemoryId[]) {
  try {
    localStorage.setItem(MEMORIES_KEY, JSON.stringify({ v: 1, seen }));
  } catch {
    /* storage full or blocked: the memory still plays */
  }
}

