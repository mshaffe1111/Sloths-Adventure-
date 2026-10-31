import { storeBuild } from './appShell.ts';

/**
 * The worlds still waiting on their rebuild (Matt, 2026-10-29): they stay playable, and their world map card carries a small
 * "New look coming soon" tag. Each world's rebuild, when it merges, takes its own number out of this list, and its tag goes with it.
 * The store build never shows it (UI-20: Play's review reads a "coming soon" as an unfinished app, PLAY-STORE-RULES.md §3).
 */
// (World 8's rebuild merged with its release, 2026-10-31: its tag goes)
export const NEW_LOOK_SOON: readonly number[] = [9, 10];

export const newLookSoon = (world: number, store = storeBuild()): boolean => !store && NEW_LOOK_SOON.includes(world);
