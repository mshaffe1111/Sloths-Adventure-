/**
 * storyFlags — every "seen once" story flag's storage key, built in ONE place. saveFile.ts builds its allow-list from STORY_LETTERS,
 * so a flag added here is part of the save (a save file carries it, a New Game clears it) from its first commit; App.tsx reads and
 * writes the flags through these builders only (storyKeys.test.ts fails on a `sloth_story_` key written anywhere else).
 * Audit C-04 (2026-11-11): the "guardian's intro seen" flag was built in App.tsx and left off the hand-kept allow-list, so a New Game
 * kept it and the next adventure met the General with the two-line retry intro. C-01: the gate scene and the guardian's card shared
 * the letter `g`, so the scene after 10-9 marked the General's card as shown and no player in order ever saw it.
 */

import type { LevelConfig } from './types.ts';

/** one letter per flag; the number after it is the world (the guardian's card: 11 is Thornbark, the secret guardian) */
export const STORY_LETTERS = {
  /** a world's arrival story */
  world: 'w',
  /** the scene halfway through a world */
  mid: 'm',
  /** World 1's first note, after 1-1 */
  firstNote: 'n',
  /** a guardian's first-time card */
  card: 'g',
  /** a guardian's intro scene (a long one is shortened on the retries: storyBosses.ts RETRY_INTRO_LINES) */
  bossIntro: 'b',
  /** the scene at a world's gate, after its 9th stage (storyWorlds.ts WORLD_GATE); its own letter since save version 2 (C-01) */
  gate: 't',
} as const;
export type StoryFlag = keyof typeof STORY_LETTERS;

export const storyKey = (flag: StoryFlag, n: number) => `sloth_story_${STORY_LETTERS[flag]}${n}`;

/** the card's number for a guardian stage: its world, or Thornbark's slot for the secret stage */
export const SECRET_CARD_SLOT = 11;

export const worldStoryKey = (w: number) => storyKey('world', w);
export const midStoryKey = (w: number) => storyKey('mid', w);
export const FIRST_NOTE_KEY = storyKey('firstNote', 1);
export const guardianCardKey = (lvl: Pick<LevelConfig, 'secret' | 'worldIndex'>) => storyKey('card', lvl.secret ? SECRET_CARD_SLOT : lvl.worldIndex);
export const bossIntroKey = (w: number) => storyKey('bossIntro', w);
export const gateStoryKey = (w: number) => storyKey('gate', w);

/** the save allow-list entry for every story flag */
export const STORY_KEY = new RegExp(`^sloth_story_[${[...new Set(Object.values(STORY_LETTERS))].join('')}]\\d{1,2}$`);

/** the slice of a storage the move needs (saveFile.ts Store and a save file's data both give it) */
interface FlagStore {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
}

/**
 * Up to save version 1 (the game up to 0.9.6) a gate scene was kept under the card's `g<w>`, and only World 10 had a gate scene. The
 * gate scene plays after the world's 9th stage, before the guardian's stage opens, so in those games `g10` almost always means "the
 * gate scene was seen, the card was not" (the card was then skipped: C-01). The move keeps what the player saw (the gate scene does not
 * play again) and gives the card its first showing. (A game that reached 10-10 before the gate scene was marked, by the testers'
 * unlock or a phone that killed the app during the scene, sees the card once more: the one case the old key cannot tell apart.)
 */
const V1_GATE_WORLDS = [10];
export function moveV1GateFlags(store: FlagStore) {
  for (const w of V1_GATE_WORLDS) {
    const old = storyKey('card', w);
    if (store.getItem(old) !== '1') continue;
    store.setItem(gateStoryKey(w), '1');
    store.removeItem(old);
  }
}

/** set on a device once its own storage has had the move (a device setting: a New Game keeps it, a save file does not carry it) */
export const STORY_FLAGS_MOVED_KEY = 'sloth_story_flags_v2';

/** at launch: move this device's version-1 story flags once (a save file of version 1 is moved when it is read: saveFile.ts parseSave) */
export function moveStoredStoryFlags(store: FlagStore) {
  if (store.getItem(STORY_FLAGS_MOVED_KEY) === '1') return;
  moveV1GateFlags(store);
  store.setItem(STORY_FLAGS_MOVED_KEY, '1');
}
