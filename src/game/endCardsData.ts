/** The ending cards (S-7): their size and the part that must always be seen, and the run of them with the line under each. Pure data. */
/** the card's size, and the part of it that must always be seen */
export const CARD_W = 1920;
export const CARD_H = 1080;
export const CARD_SAFE_W = 1440;
export const CARD_SAFE_H = 880;

/** the run of cards, in order, and the line under each (approved 2026-10-29, the Queen's with the lead's tweak) */
export const END_CARDS: ReadonlyArray<readonly [key: string, line: string]> = [
  ['venom-fang', 'Pokey stops by on Thursdays. He always asks first.'],
  ['crocus-rex', 'He ferries the village across, three at a time. The crown is still crooked.'],
  ['shadow-prowler', 'He still sits on the ledge. Now somebody sits with him.'],
  ['sky-sovereign', 'She lets the wind lane run where it likes.'],
  ['tarantula-queen', 'Tea at four, every day. A guest always stays to the bottom of the cup.'],
  ['marsh-reaver', 'Lunch at noon, on a root by the path. He leaves half.'],
  ['stone-golem', 'He talks the slowest at the council now. The others wait.'],
  ['night-wing-monarch', 'Pokey told her how the dream ended. She wrote it down.'],
  ['magma-drake', 'Two cups. Both used.'],
  ['general', 'Every spring he plants a tree by the river. He takes his time.'],
  ['soldiers', "Pell took their measurements. They didn't need new coats. They just wanted to sit down."],
  ['squirrels', 'They put up a new sign. It says BACK ALREADY?'],
  ['gruntlewick', 'He has started a new warning. It is about Tuesday.'],
  ['mailman', 'His new package says NO HURRY. He is taking it very seriously.'],
  ['pell', 'The sign still hangs crooked. The shop is never empty.'],
  ['flicker', 'He stays at Pell\'s shop. The light over the counter is steady.'],
];
