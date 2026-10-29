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
} as const satisfies Record<string, MeecaLine>;

/**
 * The rooms' lines (puzzleKit.ts RoomTips, said the first time each moment comes). Meeca's own unless a speaker is named. All NEW.
 * Each room's line on the way in says what is locked; the hard way's line is her finding out; none of them gives the answer.
 */
export const ROOM_LINES = {
  sit: {
    enter: 'Too high. Ooh, a chair. A step!',
    chair: "It's holding me! Wiggle, wiggle!",
    climb: 'A sapling. Slide up to climb.',
  },
  eat: {
    enter: 'Two plates. One of me.',
    slept: 'One bite and out cold. Noted!',
    hold: 'Tap to set it down.',
  },
  silk: {
    enter: 'A rope! Up I go.',
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
