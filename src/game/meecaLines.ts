/**
 * meecaLines — every word of Meeca's stage (5-M, "On the March North", the first stage of World 5): her carvings, her own thoughts,
 * Flicker's words and his hints, the Butler's, Lieutenant Pell's, the title card and the ending. From reference/STORY-REVIEW-2026-10-27.md
 * ("4. Meeca's own stage": the five warnings word for word, "Last one. For Pokey.", every Pell line, the new ending in order, Flicker's
 * first line, "Hairpin. Good. Round and round.") and reference/VOICE.md (Meeca warm, quick, a little bossy; Pell over-polite, never a
 * contraction; the Queen's household polite-creepy; Flicker short and dry).
 *
 * Dot is not in this stage: she was a hill over, following a hibiscus. The tips are Meeca's own small thoughts, in a pink cloud
 * (meecaArt.ts drawThought), each under 10 words and naming the thumb move where they teach one. Flicker's hints come only when asked
 * (the pause menu's "Ask Flicker"), in steps, and never say the answer.
 *
 * Lines marked NEW below are not in the approved story: they need Matt's approval (listed in the build report).
 */

/** one warning she carves: an id, and the words a line each, as cut into the bark */
export interface MeecaWarning {
  id: string;
  lines: readonly string[];
}

/**
 * The five warnings, in the order she carves them, one per room, each learned the hard way just before (World 5's order: Pokey finds
 * them in 5-1, 5-2, 5-4 and 5-6 in this order). Word for word as approved.
 */
export const MEECA_WARNINGS: readonly MeecaWarning[] = [
  { id: 'sit', lines: ['POKEY.', "DON'T", 'SIT.', 'M.'] },
  { id: 'eat', lines: ["DON'T", 'EAT.', 'M.'] },
  { id: 'silk', lines: ['HANDS', 'OFF THE', 'SILK.', 'M.'] },
  { id: 'tea', lines: ['NO TEA.', 'BE', 'RUDE.', 'M.'] },
  { id: 'look', lines: ["DON'T", 'STOP TO', 'LOOK.', 'LOVE, M.'] },
];

/** her first trail mark, before the warnings (Flicker shows her the circle): her M and an arrow back the way she came. No words */
export const MEECA_MARK: MeecaWarning = { id: 'mark', lines: ['M.'] }; // (the arrow back is drawn beside it: meecaArt drawArrowMark)

/** the goal: every warning cut (the HUD's "M. 1/5") */
export const MEECA_GOAL = MEECA_WARNINGS.length;

export type Speaker = 'meeca' | 'flicker' | 'butler' | 'pell';
/** a line said in the stage: her thought (`teach` ones once per device), or Flicker's or the Butler's words in their own bubble */
export interface MeecaLine {
  id: string;
  who: Speaker;
  text: string;
  teach?: boolean;
}

/** what is said as the stage goes, by what calls it up (meecaPlay.ts says each when its moment comes) */
export const MEECA_SAY = {
  // ── the camp (NEW) ──
  /** the card has gone: the column asleep round the fire, and she gets up out of her place (NEW) */
  camp: { id: 'camp', who: 'meeca', text: 'All asleep. Soft feet. Go.' },
  /** at the first gully past the camp: the floor goes nowhere, the way on is up (Matt approved it, 2026-10-28) */
  high: { id: 'high', who: 'meeca', text: 'Too far to jump. The high way, then.', teach: true },
  /** past the camp, two paths that look the same (NEW) */
  lost: { id: 'lost', who: 'meeca', text: 'Out! ...Which way is back?' },
  /** Flicker's light blinks on (approved, word for word) */
  flicker: { id: 'flicker', who: 'flicker', text: "You're not from here. Nobody from here walks that loud." },
  /** at the first trunk, as Flicker shows the circle (approved, word for word) */
  carve: { id: 'carve', who: 'meeca', text: 'Hairpin. Good. Round and round.', teach: true },
  /** the last tree, Pell waiting (approved, word for word) */
  last: { id: 'last', who: 'meeca', text: 'Last one. For Pokey.' },
  /** at the moonflower, as it opens (NEW) */
  wonder: { id: 'wonder', who: 'meeca', text: 'Oh... look at it.' },
  /** the last room, in the dark: said by Flicker as she comes in (NEW) */
  shy: { id: 'shy', who: 'flicker', text: 'Stay in my light. The steps are shy.' },
  // ── QA batch 2026-10-29 (all approved by Matt, 2026-10-28) ──
  /** by the pinecone at the top of room 1's ledge, the first thing she can carry: picking up taught before room 2 needs it (new, needs
   * Matt's approval) */
  pick: { id: 'pick', who: 'meeca', text: 'A pinecone. Tap it to pick it up.', teach: true },
  /** a finger held still on the glass at a trunk (a hold carves nothing): Flicker shows the circle again (Matt approved, 2026-10-28) */
  carveHold: { id: 'carveHold', who: 'flicker', text: 'Not a poke. Draw circles on the bark.' },
  /**
   * Matt approved 2026-10-31 (QA that day): the carving's teaching and its "done". `carveDone*`: Flicker, as the last stroke
   * goes in; `carveHoldOk`: after three tries that carved nothing, a still finger held down carves too (the accessible way); `wallMark` /
   * `wallWarn`: she walks into a trunk she has not cut yet (said again each time, a few seconds apart).
   */
  carveDoneMark: { id: 'carveDoneMark', who: 'flicker', text: 'There. Your M. Now we can find the way back.' },
  carveDone: { id: 'carveDone', who: 'flicker', text: 'Cut deep. Pokey will see that.' },
  carveHoldOk: { id: 'carveHoldOk', who: 'flicker', text: 'Tricky? Then just hold your finger down.' },
  wallMark: { id: 'wallMark', who: 'flicker', text: 'Mark it first. Draw circles on the bark.' },
  wallWarn: { id: 'wallWarn', who: 'meeca', text: 'Wait. Pokey needs to know this one.' },
  /**
   * a plain walk into a step one hop climbs (a stump, the gully's stairs) stops her, and nothing taught the hop (QA 2026-10-29: "only
   * lifted hops move her"): her own thought, the first time she pushes into one, and again if she is still pushing (Matt approved,
   * 2026-10-28)
   */
  stepHop: { id: 'stepHop', who: 'meeca', text: 'Too tall to walk. Keep sliding and flick up!' },
  /** part-way along the trail after room 1, by its landmarks: she is not going round in circles (Matt approved, 2026-10-28) */
  trailA: { id: 'trailA', who: 'flicker', text: "Not going in circles. I'd know." },
  /** part-way along the trail after room 3 (Matt approved, 2026-10-28) */
  trailB: { id: 'trailB', who: 'flicker', text: "Older trees now. We're getting somewhere." },
} as const satisfies Record<string, MeecaLine>;

/**
 * Flicker's nudges (QA batch 2026-10-29, Matt approved, 2026-10-28): a room with no progress for about 20 s gets the first, about 40 s
 * the second, stronger one. They point at the piece, never say the whole answer, and are under ten words. `carve`: at a trunk, not
 * carving.
 */
export const FLICKER_NUDGES: Record<string, readonly [string, string]> = {
  carve: ['Trace a circle on the bark. Round and round.', 'Keep your finger going round, like stirring tea.'],
  sit: ["That chair's a trap. Look for something taller.", 'That young tree. Climb it right to the top.'],
  eat: ['Two plates. That beetle by the gate likes cake.', 'Leave a cake where that beetle can reach it.'],
  silk: ['See the knot up top? It holds the ladder.', 'Grab a pinecone. Stand under the knot. Flick up.'],
  tea: ["He won't move. His teapot, though... very full.", 'From the plank, tip the teapot over.'],
  look: ['Stay close. My light finds the steps.', 'Walk to each edge. Wait for my light.'],
};

/**
 * The rooms' lines (puzzleKit.ts RoomTips, said the first time each moment comes). Meeca's own unless a speaker is named. All NEW.
 * Each room's line on the way in says what is locked; the hard way's line is her finding out; none of them gives the answer.
 */
export const ROOM_LINES = {
  sit: {
    enter: 'Too high. A chair! Somebody thinks of everything.',
    chair: "It's holding me! Wiggle, wiggle!",
    climb: 'A sapling. Slide up to climb.',
    /** the practice pinecone at the top of the ledge, picked up (Matt approved, 2026-10-28) */
    hold: 'Flick up to throw. Tap to set down.',
  },
  eat: {
    enter: 'Two plates. One of me.',
    slept: 'One bite and out cold. Noted!',
    hold: 'Tap to set it down.',
  },
  silk: {
    enter: 'A rope. Test it first, Grandma says. Testing.',
    silk: 'Sticky! Let go, let go!',
    hold: 'Flick up to throw it.',
  },
  tea: {
    enter: { who: 'butler', text: 'Tea, Miss? It is always warm.' },
    polite: { who: 'butler', text: 'Another cup, then. I insist.' },
    polite2: { who: 'butler', text: 'Another cup, then. I insist.' },
    yawn: '*yawn* ...thank you.',
    tipped: { who: 'butler', text: 'Oh! Oh, the cloth. Oh dear.' },
  },
  look: {},
} as const;

/**
 * Flicker's hints, asked for from the pause menu (Matt: hints only on request, in steps, never the answer). Each room has two steps,
 * under 10 words, concrete. All NEW.
 */
export const FLICKER_HINTS: Record<string, readonly string[]> = {
  mark: ['Draw a circle on the bark.', 'Round and round, like stirring tea.'],
  sit: ['That chair looks comfy. Too comfy.', 'Young trees bend. Ever ridden one?'],
  eat: ['That beetle only ever thinks about cake.', 'Two plates. You can stand on one.'],
  silk: ["Don't grab anything that shines.", "That knot's silk too. Silk snaps."],
  tea: ["He won't move for manners.", 'Where would tea go, if it spilled?'],
  look: ['Stay in my light. The steps are shy.', "Something up there's waiting for light."],
  none: ["I'm just the light. You're doing fine."],
};

/** the title card over the opening (the game's chapter card, at night) */
export const MEECA_CARD = {
  kicker: 'WORLD 5 · MEECA',
  title: ['On the March', 'North'],
  sub: ['The Orchid Sanctuary, at night.', 'You are Meeca.'],
  tap: 'TAP TO BEGIN',
} as const;

/** one line of the ending scene, in the story box */
export interface MeecaSceneLine {
  who: 'Lieutenant Pell' | 'Meeca' | 'Flicker';
  text: string;
  /** what the picture does as the line comes: she turns round, caught; the blanket held out; the blanket round her */
  beat?: 'turn' | 'offer' | 'wrap' | 'small';
}

/**
 * The ending, in the approved order. It comes in two parts: Pell steps out while she stands looking at the moonflower (the first
 * three lines), then she carves the last warning on the tree by her while he waits, and then the rest. Every Pell line is the approved
 * one; Flicker says his very small.
 */
export const MEECA_ENDING_A: readonly MeecaSceneLine[] = [
  { who: 'Lieutenant Pell', text: 'Good evening, Miss.' },
  { who: 'Meeca', text: '...How long have you been there?', beat: 'turn' },
  { who: 'Lieutenant Pell', text: 'Since the first tree. I am sorry.' },
];
export const MEECA_ENDING_B: readonly MeecaSceneLine[] = [
  { who: 'Lieutenant Pell', text: 'I did not see any carving, Miss. I did not see anything.' },
  { who: 'Flicker', text: 'I was the light.', beat: 'small' },
  { who: 'Lieutenant Pell', text: 'It is cold tonight. Here.', beat: 'offer' },
  { who: 'Lieutenant Pell', text: 'It is not from the General.', beat: 'wrap' },
  { who: 'Meeca', text: 'Thank you, Pell.' },
  { who: 'Lieutenant Pell', text: 'Please do not thank me. It is embarrassing.' },
];
/** the whole ending, in order */
export const MEECA_ENDING: readonly MeecaSceneLine[] = [...MEECA_ENDING_A, ...MEECA_ENDING_B];

export const wordsIn = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
