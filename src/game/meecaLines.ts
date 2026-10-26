/**
 * meecaLines — every word of Meeca's stage (5-M, right after 5-5): her carvings, her own thoughts, Lieutenant Pell's few words, the
 * title card and the ending. From reference/STORY-REWRITE.md World 5 (Dot's five rules, the 5-1 carving, Meeca's hidden note about the
 * blanket) and reference/VOICE.md (Meeca warm, quick, a little bossy; Pell over-polite, apologizing inside his sentences, never a
 * contraction).
 *
 * There is no Dot in this stage. The tips are Meeca's own small thoughts, shown in a pink cloud (meecaArt.ts drawThought), each 8 words
 * or fewer and naming the thumb move where they teach one, the first time the thing comes up.
 */

/** one warning she carves: an id, and the words a line each, as cut into the bark */
export interface MeecaWarning {
  id: string;
  lines: readonly string[];
}

/**
 * The five warnings, in the order she carves them. The first is the one the player already read on the first tree of 5-1 (she only
 * finishes its "M." here); the other four are Dot's other rules, as Meeca would put them to Pokey. 5-6 shows them where she cut them.
 *   - DON'T EAT. the cakes (rule two), plain, the way she says it in the mock-ups;
 *   - NO TEA. BE RUDE. rule three; she knows he keeps his manners with everybody, even the scary ones, so she gives him permission;
 *   - HANDS OFF THE SILK. rule four, bossy the way a good host is bossy;
 *   - DON'T STOP TO LOOK. rule five (don't admire the silk), and the last one she gets to cut, so it is signed the way her notes are.
 */
export const MEECA_WARNINGS: readonly MeecaWarning[] = [
  { id: 'sit', lines: ['POKEY.', "DON'T", 'SIT.', 'M.'] },
  { id: 'eat', lines: ["DON'T", 'EAT.', 'M.'] },
  { id: 'tea', lines: ['NO TEA.', 'BE', 'RUDE.', 'M.'] },
  { id: 'silk', lines: ['HANDS', 'OFF THE', 'SILK.', 'M.'] },
  { id: 'look', lines: ["DON'T", 'STOP TO', 'LOOK.', 'LOVE, M.'] },
];

/** the goal: every warning cut (the HUD's "M. 1/5") */
export const MEECA_GOAL = MEECA_WARNINGS.length;

/** a thought she has: `teach` ones are said once per device (a replay does not teach again); the rest every time */
export interface MeecaThought {
  id: string;
  text: string;
  teach: boolean;
}

/** her thoughts, by what calls them up (meecaPlay.ts says each when its moment comes) */
export const MEECA_THOUGHTS = {
  /** the title card has gone: the 5-1 carving only wants its "M." (the hold-to-carve lesson; Matt's approved mock-up line) */
  carve: { id: 'carve', text: 'Hairpin. Good. Thumb on the trunk, and hold.', teach: true },
  /** the 5-1 carving is done and the column is waiting up ahead: her place is marked */
  rejoin: { id: 'rejoin', text: 'My place in line. Slide right to it.', teach: true },
  /** in line, the first time Pell's ring shows: the tell, before any look-back */
  ring: { id: 'ring', text: 'His ring fills, then he looks back.', teach: true },
  /** the column halts by the second tree with his back turned (Matt's approved mock-up line) */
  slip: { id: 'slip', text: "Okay. His back's turned. Slide out.", teach: true },
  /** out of line the first time a ring is nearly full */
  back: { id: 'back', text: "He'll turn. Slide back in line!", teach: true },
  /** the soldier ahead of Pell starts looking back too */
  two: { id: 'two', text: 'Two rings now. Watch them both.', teach: true },
  /** the first fern by a tree */
  fern: { id: 'fern', text: 'Fern. Slide down to hide in it.', teach: true },
  /** the tree with a branch: the carving is up there */
  climb: { id: 'climb', text: 'Up the tree. Slide up to climb.', teach: true },
  /** the last tree */
  last: { id: 'last', text: 'Last one. For Pokey.', teach: false },
} as const satisfies Record<string, MeecaThought>;

/** what she thinks when a guard walks her back (they take turns, so a second catch does not say the same thing) */
export const MEECA_CAUGHT: readonly string[] = ["Fine. I'm going. I'll try again.", 'Caught. Fine. That one again.', 'Not yet. Next time he looks away.'];

/** Pell, walking her back into line (said beside him, in his own small bubble) */
export const PELL_CATCH: readonly string[] = ['Back in line, please, Miss. I am sorry.', 'Miss Meeca. Please. I am sorry.', 'In line, Miss. I am very sorry.'];

/** the title card over the opening (the game's chapter card, in dusk violet) */
export const MEECA_CARD = {
  kicker: 'WORLD 5 · MEECA',
  title: ['Three days', 'earlier'],
  sub: ['The Orchid Sanctuary, at dusk.', 'You are Meeca.'],
  tap: 'TAP TO BEGIN',
} as const;

/** one line of the ending scene, in the story box */
export interface MeecaSceneLine {
  who: 'Lieutenant Pell' | 'Meeca';
  text: string;
  /** what the picture does as the line comes: Pell's gentle catch, the blanket held out, the blanket round her */
  beat?: 'catch' | 'offer' | 'wrap';
}

/**
 * The ending: Pell catches her at the last tree and puts his own blanket round her, the moment from her hidden note ("Pokey, Lieutenant
 * Pell brought me a blanket today. He said, 'It is not from the General.' I hadn't asked. I said thank you. He said, 'Please do not
 * thank me. It is embarrassing.'"). His second line is the one thing added: he saw the carving and will not say so, which is why Pokey
 * finds them all in 5-6 ("I think half of them are waiting for permission to stop").
 */
export const MEECA_ENDING: readonly MeecaSceneLine[] = [
  { who: 'Lieutenant Pell', text: 'Miss Meeca. I am sorry. You are out of line.', beat: 'catch' },
  { who: 'Lieutenant Pell', text: 'I did not see any carving, Miss. I did not see anything.' },
  { who: 'Lieutenant Pell', text: 'It is cold tonight. Here.', beat: 'offer' },
  { who: 'Lieutenant Pell', text: 'It is not from the General.', beat: 'wrap' },
  { who: 'Meeca', text: 'Thank you, Pell.' },
  { who: 'Lieutenant Pell', text: 'Please do not thank me. It is embarrassing.' },
];

export const wordsIn = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
