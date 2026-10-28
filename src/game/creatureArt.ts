/**
 * The painted creature pictures the Jungle Journal shows. Each is the frame of the art the game draws that creature with today (its
 * clip sheet, its pose sheet or its atlas: the picks are tools/art/journal/frames.mts), copied small into one sheet,
 * journal-cards.webp (tools/art/journal/pack.py), so the page loads one 270 KB picture instead of the 13 to 64 MB clip sheets.
 */
import { JOURNAL_CARDS, JOURNAL_CARDS_SIZE, JOURNAL_CARDS_URL } from './journalCardsData.ts';

interface Frame {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface CreaturePicSpec {
  url: string;
  atlas: { w: number; h: number };
  frame: Frame;
}

/** by card: a predator's id, a road card's id, or guardian_<world> */
export const CREATURE_ART: Record<string, CreaturePicSpec> = Object.fromEntries(
  Object.entries(JOURNAL_CARDS).map(([id, frame]) => [id, { url: JOURNAL_CARDS_URL, atlas: JOURNAL_CARDS_SIZE, frame }]),
);
