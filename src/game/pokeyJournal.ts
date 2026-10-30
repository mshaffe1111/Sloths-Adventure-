/**
 * Pokey's journal (2026-10-29 story report, "Playing it like an RPG": approved word for word): one line per world in his own short, dry
 * voice, written when that world's guardian falls (World 10's, after the ending). It is the satchel's second page (Satchel.tsx).
 */
export const POKEY_JOURNAL: Record<number, string> = {
  1: "Left home. Dot says I forgot something. I didn't. I checked.",
  2: "The village is building me a raft. They agreed on the wood. I'll walk.",
  3: 'Dark in there. The glowworms helped. So did Dot. Loudly.',
  4: 'Fell off a ledge. Climbed back up. Dot held one claw the whole way.',
  5: 'Had tea with a spider. Good tea. Found out who the empty chair is for.',
  6: "We stopped for tea. It cost a night. Dot left. I'm going to keep writing in here like she didn't.",
  7: "A firefly sits on my strap. He doesn't say much. Found a photograph I didn't want to find.",
  8: "Dot came back. She won't sit down. Meeca knows who he is.",
  9: "A thousand steps tomorrow. I'm going to take them one at a time. There isn't another way.",
  10: 'Got there. Tea at four.',
};

/** the worlds whose page is written: the ones whose guardian (stage 10) has been beaten */
export function journalWritten(levels: readonly { worldIndex: number; miniIndex: number; completed: boolean }[]): number[] {
  return levels.filter((l) => l.miniIndex === 10 && l.completed).map((l) => l.worldIndex).sort((a, b) => a - b);
}
