/**
 * storyFlags — every "seen once" story flag's storage key, built in ONE place. saveFile.ts builds its allow-list from STORY_LETTERS,
 * so a flag added here is part of the save (a save file carries it, a New Game clears it) from its first commit; App.tsx reads and
 * writes the flags through these builders only (storyKeys.test.ts fails on a `sloth_story_` key written anywhere else).
 * Audit C-04 (2026-11-11): the "guardian's intro seen" flag was built in App.tsx and left off the hand-kept allow-list, so a New Game
 * kept it and the next adventure met the General with the two-line retry intro.
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
  /** the scene at a world's gate, after its 9th stage (storyWorlds.ts WORLD_GATE) */
  gate: 'g',
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
