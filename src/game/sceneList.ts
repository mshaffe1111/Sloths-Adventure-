/**
 * Every cutscene in the game, in story order, for the satchel's Scenes page (Matt, 2026-10-31: "every video, every cutscene that we have
 * in the game needs to be in there where somebody can play it chronologically"). The prologue, then for each world its opener, the
 * halfway scene, the gate scene, the guardian's entrance and fall, and the scenes that follow it; then the ending, and Thornbark's.
 *
 * A scene unlocks by PROGRESS (the stages cleared), not only by having been watched, so a player who passed it before this list existed
 * gets it at once. A scene watched some other way (a flashback in the old Library) counts too.
 */
import { INTRO_PANELS } from './storyIntro.ts';
import { WORLD_GATE, WORLD_MID, WORLD_STORIES } from './storyWorlds.ts';
import { bossPanels, thornbarkPanels } from './storyBosses.ts';
import { victoryPanels } from './victoryScenes.ts';
import { AFTER_BOSS, MEMORIES, type MemoryId } from './storyChapters.ts';
import { endTagPanels, finalePanels } from './storyFinale.ts';
import { GUARDIANS, WORLD_NAMES } from './badges.ts';
import type { StoryPanel } from './story.ts';

export type SceneKind = 'prologue' | 'opener' | 'mid' | 'gate' | 'boss' | 'fall' | 'memory' | 'tower' | 'turn' | 'ending' | 'secret';

export interface SceneEntry {
  id: string;
  /** the world it belongs to (0: the prologue, 11: the ending and Thornbark) */
  world: number;
  kind: SceneKind;
  title: string;
  /** shown under a locked card: what to do to unlock it */
  hint: string;
  /** a memory id when the scene is one of the flashbacks or Tower scenes (so having watched it counts) */
  memory?: MemoryId;
}

/** what the list needs to know about the save */
export interface SceneProgress {
  /** stage ids cleared, like "3-10" */
  cleared: ReadonlySet<string>;
  memories: readonly MemoryId[];
  /** the Thorn Gate has been found / Thornbark freed */
  gateFound: boolean;
  thornHeart: boolean;
}

export interface SceneContext {
  finds: string[];
  thornHeart: boolean;
  bossName: (world: number) => string;
}

/** the Tower scenes (the General alone) and the turns of the plot, as opposed to Pokey's flashbacks */
const TOWER: ReadonlySet<MemoryId> = new Set(['map', 'tally', 'door']);

/** the whole list, in the order the story plays it */
export function sceneList(): SceneEntry[] {
  const out: SceneEntry[] = [{ id: 'prologue', world: 0, kind: 'prologue', title: 'The Prologue', hint: '' }];
  for (let w = 1; w <= 10; w++) {
    const name = WORLD_NAMES[w - 1];
    if (WORLD_STORIES[w]) out.push({ id: `open${w}`, world: w, kind: 'opener', title: w === 1 ? 'The First Note' : `Arriving: ${name.replace(/ Fortress$/, '')}`, hint: w === 1 ? 'Clear the first stage.' : `Reach World ${w}.` });
    if (WORLD_MID[w]) out.push({ id: `mid${w}`, world: w, kind: 'mid', title: `Halfway through ${name.replace(/ Fortress$/, '')}`, hint: `Clear stage ${w}-5.` });
    if (WORLD_GATE[w]) out.push({ id: `gate${w}`, world: w, kind: 'gate', title: 'The Fortress Gate', hint: `Clear stage ${w}-9.` });
    out.push({ id: `boss${w}`, world: w, kind: 'boss', title: GUARDIANS[w - 1], hint: `Reach the guardian of World ${w}.` });
    out.push({ id: `fall${w}`, world: w, kind: 'fall', title: `${GUARDIANS[w - 1]} Falls`, hint: `Beat the guardian of World ${w}.` });
    for (const m of AFTER_BOSS[w] ?? []) {
      const def = MEMORIES[m];
      out.push({ id: `mem_${m}`, world: w, kind: def.kind === 'memory' ? 'memory' : TOWER.has(m) ? 'tower' : 'turn', title: def.title, hint: def.hint, memory: m });
    }
    // World 8's dream plays inside its opener; it is listed on its own too, so it can be watched alone
    if (w === 8) out.push({ id: 'mem_promise', world: 8, kind: 'memory', title: MEMORIES.promise.title, hint: 'Reach World 8.', memory: 'promise' });
  }
  out.push({ id: 'ending', world: 11, kind: 'ending', title: 'Tea at Four', hint: 'Beat the guardian of World 10.' });
  out.push({ id: 'after', world: 11, kind: 'ending', title: 'After the End', hint: 'Beat the guardian of World 10.' });
  out.push({ id: 'thorn_in', world: 11, kind: 'secret', title: 'The Thorn Gate', hint: 'Find the hidden gate.' });
  out.push({ id: 'thorn_out', world: 11, kind: 'secret', title: 'Thornbark Freed', hint: 'Free what waits behind the hidden gate.' });
  return out;
}

const has = (p: SceneProgress, id: string) => p.cleared.has(id);
/** the world has been reached: its first stage is open (the guardian before it has fallen), World 1 always */
const reached = (p: SceneProgress, w: number) => w === 1 || has(p, `${w - 1}-10`) || [...p.cleared].some((id) => id.startsWith(`${w}-`));

/** whether a scene is open to watch */
export function sceneUnlocked(e: SceneEntry, p: SceneProgress): boolean {
  if (e.memory && p.memories.includes(e.memory)) return true;
  const w = e.world;
  switch (e.kind) {
    case 'prologue':
      return true;
    case 'opener':
      return w === 1 ? has(p, '1-1') : reached(p, w);
    case 'mid':
      return has(p, `${w}-5`) || has(p, `${w}-6`);
    case 'gate':
      return has(p, `${w}-9`);
    case 'boss':
      return has(p, `${w}-9`) || has(p, `${w}-10`);
    case 'fall':
    case 'tower':
    case 'turn':
      return has(p, `${w}-10`);
    case 'memory':
      return e.memory === 'promise' ? reached(p, 8) : has(p, `${w}-10`);
    case 'ending':
      return has(p, '10-10');
    case 'secret':
      return e.id === 'thorn_in' ? p.gateFound || p.thornHeart : p.thornHeart;
  }
}

/** the panels a scene plays */
export function scenePanels(e: SceneEntry, c: SceneContext): StoryPanel[] {
  const w = e.world;
  if (e.memory) return MEMORIES[e.memory].panels;
  switch (e.id) {
    case 'prologue':
      return INTRO_PANELS;
    case 'ending':
      return finalePanels(c.finds);
    case 'after':
      return endTagPanels(c.finds, c.thornHeart);
    case 'thorn_in':
      return thornbarkPanels('intro');
    case 'thorn_out':
      return thornbarkPanels('defeat');
  }
  switch (e.kind) {
    case 'opener':
      return WORLD_STORIES[w]?.panels ?? [];
    case 'mid':
      return WORLD_MID[w] ?? [];
    case 'gate':
      return WORLD_GATE[w] ?? [];
    case 'boss':
      return bossPanels(w, 'intro', c.bossName(w), false);
    case 'fall':
      return victoryPanels(w, c.bossName(w)) ?? bossPanels(w, 'defeat', c.bossName(w));
    default:
      return [];
  }
}

/** the scenes open to watch, in story order (for "Play all in order") */
export function unlockedScenes(p: SceneProgress): SceneEntry[] {
  return sceneList().filter((e) => sceneUnlocked(e, p));
}

/** a short label for each kind, for the card's corner */
export const KIND_LABEL: Record<SceneKind, string> = {
  prologue: 'Prologue',
  opener: 'A new world',
  mid: 'A note from Meeca',
  gate: 'Before the guardian',
  boss: 'The guardian appears',
  fall: 'Victory',
  memory: 'Flashback',
  tower: 'The Tower',
  turn: 'Story',
  ending: 'Ending',
  secret: 'Secret',
};
