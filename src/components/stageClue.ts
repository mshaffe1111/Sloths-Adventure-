/** Jennifur's trail: the clue Slomatt finds at the end of each stage number (1-9). `title` is the name of the find, `text` what he sees. */
const CLUES: Record<number, { title: string; text: string }> = {
  1: { title: "Jennifur's Petal", text: "A fresh pink petal from Jennifur's flower drifts by. She passed this way!" },
  2: { title: 'Woven Ribbon', text: "Jennifur's hand-woven vine ribbon is caught on a branch. She left it as a trail for Slomatt!" },
  3: { title: 'A Helpful Friend', text: "A chirping marmoset points onward: 'The lady with the flower went that way!'" },
  4: { title: 'Talon Gouges', text: "Fresh harpy-eagle claw marks on the bark show which way General Iron-Claw's patrol flew!" },
  5: { title: 'Secret Carving', text: "Hidden under thick leaves, Jennifur carved a note on the trunk: 'Slomatt, I know you will save me!'" },
  6: { title: 'Feathers in the Wind', text: 'Golden feathers litter the trail, proof that you are closing in on Jennifur!' },
  7: { title: 'Ancient Inscription', text: "The stone idol reads: 'True courage and sharp claws shall shatter the tyrant's cage.'" },
  8: { title: 'Echoing Voice', text: 'Through the mist you hear Jennifur calling your name from somewhere ahead!' },
  9: { title: 'Heavy Air', text: "The air feels heavier. This realm's guardian is close. Get ready!" },
};

export function getStageClue(levelId: string): { title: string; text: string } {
  const stage = Number(levelId.split('-')[1]) || 1;
  return CLUES[stage] ?? { title: 'Another Petal', text: "Jennifur's trail leads on to the next realm!" };
}
