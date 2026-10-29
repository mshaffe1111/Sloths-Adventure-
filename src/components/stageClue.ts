/** Meeca's trail: the clue Pokey finds at the end of each stage number (1-9). `title` is the name of the find, `text` what he sees. */
const CLUES: Record<number, { title: string; text: string }> = {
  1: { title: "Meeca's Petal", text: 'A pink petal, pressed flat against the bark. She came this way.' },
  2: { title: 'Woven Ribbon', text: "A strand of Meeca's ribbon is caught on a branch. She left it there on purpose." },
  3: { title: 'A Helpful Friend', text: 'A marmoset points up the path. "The lady with the flower went that way," it says.' },
  4: { title: 'Talon Gouges', text: "Fresh claw marks on the bark. The General's patrol came through not long ago." },
  // (not Meeca's carving: she carves only in World 5, where Dot is stunned she carved at all. Story review SR-40)
  5: { title: 'Bent Grass', text: 'A path of bent grass, too neat to be the wind.' },
  6: { title: 'Feathers in the Wind', text: 'Golden feathers along the trail, all pointing the same way.' },
  7: { title: 'Ancient Inscription', text: 'Words are cut into an old stone by the path: SLOW IS NOT STOPPED.' },
  8: { title: 'Echoing Voice', text: 'Far ahead, through the mist, someone is humming a tune you know.' },
  9: { title: 'Heavy Air', text: 'The air goes heavy and still. Even the birds have stopped.' },
};

export function getStageClue(levelId: string): { title: string; text: string } {
  // Dot's netting flight (extraStages.ts): no clue of Meeca's on the way, just the note delivered
  if (levelId === '4-D') return { title: 'Still Here', text: "Meeca's note came out through the gap as wide as a folded letter. A white feather stayed behind on the thorns." };
  const [world, stage] = levelId.split('-').map(Number);
  // World 5: one of her real carvings, a warning (SR-40); World 10: no marmoset in the General's tower
  if (world === 5 && stage === 5) return { title: 'Secret Carving', text: "Small letters cut into the trunk: POKEY. DON'T SIT. M." };
  if (world === 10 && stage === 3) return { title: 'A Ribbon Bow', text: 'A scrap of pink ribbon, tied to the railing in a bow.' };
  return CLUES[stage || 1] ?? { title: 'Another Petal', text: "Meeca's trail leads on to the next realm." };
}
