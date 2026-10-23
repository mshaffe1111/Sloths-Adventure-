/** Meeca's trail: the clue Pokey finds at the end of each stage number (1-9). `title` is the name of the find, `text` what he sees. */
const CLUES: Record<number, { title: string; text: string }> = {
  1: { title: "Meeca's Petal", text: 'A pink petal, pressed flat against the bark. She came this way.' },
  2: { title: 'Woven Ribbon', text: "A strand of Meeca's ribbon is caught on a branch. She left it there on purpose." },
  3: { title: 'A Helpful Friend', text: 'A marmoset points up the path. "The lady with the flower went that way," it says.' },
  4: { title: 'Talon Gouges', text: "Fresh claw marks on the bark. The General's patrol came through not long ago." },
  5: { title: 'Secret Carving', text: 'Under the leaves, small letters are cut into the trunk: POKEY. KEEP GOING. M.' },
  6: { title: 'Feathers in the Wind', text: 'Golden feathers lie along the trail. You are closing in.' },
  7: { title: 'Ancient Inscription', text: 'Words are cut into an old stone by the path: SLOW IS NOT STOPPED.' },
  8: { title: 'Echoing Voice', text: 'Far ahead, through the mist, someone is humming a tune you know.' },
  9: { title: 'Heavy Air', text: "The air feels heavier. This realm's guardian is close." },
};

export function getStageClue(levelId: string): { title: string; text: string } {
  const stage = Number(levelId.split('-')[1]) || 1;
  return CLUES[stage] ?? { title: 'Another Petal', text: "Meeca's trail leads on to the next realm." };
}
