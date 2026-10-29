/**
 * What Dot may say on "Tips" (Matt, 2026-10-29: "it feels like she's constantly nagging me... As soon as they run in, Dot tells exactly
 * how to do it"). On Tips she says only:
 *   - the first appearance of each mechanic, creature and hazard, once per save (a lesson, a first-time move tip, or a stage line marked
 *     below with the thing it introduces);
 *   - a warning about a new hazard, the first time (marked below with the thing it is about): the warnings that come again (each
 *     "Hide!" as the eagle passes) are reminders;
 *   - why an exit is locked (always);
 *   - help after real struggle: two deaths in the same spot, or two failed tries in a puzzle room (a nudge that points at the piece,
 *     never the move itself: that is for "Help").
 * Everything else (reminders, "Still N to collect!", "This way, Pokey!", lines a stage says again for a thing already taught, story
 * chatter in play) is for "Help" only, and nothing is said on a clock.
 *
 * Puzzles never give the answer on entry (polish report DOT-2): a puzzle's first line names the problem, and only struggle brings the
 * next one: a nudge that points at the piece, then (Help only, after more struggle) the move.
 */
import type { TopicId } from './dotGuide.ts';

/**
 * The stage lines (dotLinesData ids) that introduce a mechanic, a creature or a hazard, by the thing they introduce. Tips says the
 * first line about each thing, once per save; the others about it (a reminder in a later stage, the same thing in other words) are for
 * Help. A stage line not listed here is a reminder or chatter on Tips.
 */
export const FIRST_OF: Readonly<Record<string, string>> = {
  // World 1
  'hint.1-1.double': 'double',
  'hint.1-5.shiny': 'golden',
  'hint.1-6.log': 'pushLog',
  'eng.watch.hide.bush': 'watcher',
  'hint.1-7.hide': 'watcher',
  'eng.watch.seen.bush': 'watcherSeen',
  'hint.1-9.guard': 'guardSnake',
  // World 2
  'hint.2-1.upstream': 'upstream',
  'hint.2-2.upstream': 'upstream',
  'hint.2-2.pads': 'lilyPads',
  'hint.2-5.snappers': 'snapper',
  'hint.2-7.basket': 'basketLift',
  'hint.2-9.guards': 'spearGuard',
  // World 3
  'hint.3-1.dark': 'dark',
  'hint.3-1.spores': 'spores',
  'eng.glow.woke': 'glowworms',
  'hint.3-2.eyes': 'eyes',
  'eng.watch.hide.fern': 'eyes',
  'hint.3-3.prowler': 'prowler',
  'hint.3-3.jaguar': 'jaguar',
  'eng.vine.stir.ground': 'thornVine',
  'eng.vine.stir.swing': 'thornVineSwing',
  'hint.3-8.thorns': 'thornVineSwing',
  'hint.3-6.search': 'hushFern',
  'eng.fern.near': 'hushFern',
  'hint.3-9.shiny': 'golden',
  // World 4
  'hint.4-1.rocks': 'rocks',
  'hint.4-1.frond': 'frond',
  'w4.chime': 'chimes',
  'hint.4-2.head': 'headwind',
  'hint.4-3.push': 'fallPlug',
  'w4.fall': 'fallPlug',
  'hint.4-3.boulder': 'boulder',
  'hint.4-3.thiefWarn': 'thief',
  'w4.thief': 'thief',
  'hint.4-3.quiet': 'surge',
  'hint.4-3.comes': 'surge',
  'hint.4-4.knot': 'knot',
  'w4.knot': 'knot',
  'hint.4-5.hunting': 'sovereign',
  'hint.4-5.fall': 'veil',
  'w4.veil': 'veil',
  'eng.watch.hide.cliffs': 'veil',
  'w4.lookout': 'lookout',
  'hint.4-6.mist': 'mist',
  'hint.4-6.eaglets': 'eaglets',
  'w4.nestStir': 'eaglets',
  'hint.4-7.warm': 'warmAir',
  'hint.4-7.cave': 'caveDrop',
  'hint.4-7.grit': 'grit',
  'hint.4-8.guard': 'capuchin',
  'w4.guard': 'capuchin',
  'hint.4-8.knot': 'knot',
  'hint.4-8.tear': 'netting',
  // World 5 (its things, w5Lines.ts W5_THING_TIPS: a reminder of one is the same thing)
  'w5.still': 'stillness',
  'w5.chair': 'chair',
  'hint.5-2.rules': 'chair',
  'w5.cake': 'cake',
  'w5.ate': 'cake',
  'w5.butler': 'butler',
  'w5.pot': 'pot',
  'w5.thread': 'thread',
  'hint.5-2.doze': 'dozing',
  'w5.sheet': 'sheet',
  'w5.orchid': 'orchid',
  'w5.cocoon': 'cocoon',
  'w5.silk': 'silk',
  'hint.5-4.chain': 'silk',
  'w5.spider': 'spider',
  'w5.seamstress': 'seamstress',
};

/** the thing a stage line introduces (Tips says it once per save), or undefined for a reminder or chatter */
export function firstOf(lineId: string): string | undefined {
  return FIRST_OF[lineId];
}

/**
 * A puzzle's escalation (DOT-2): the line that names the problem (said on Help as he reaches it; on Tips only when the puzzle's thing
 * is brand new, `mech`), then on real struggle the nudge (both settings), then, after more struggle, the move (Help only).
 * Keyed by the approved line id of the puzzle's first line (a stage hint) or by `kit:<room id>` (a puzzle room, puzzlePlay.ts).
 */
export interface PuzzleSteps {
  /** the nudge: points at the piece, never says the move */
  nudge: string;
  /** the move itself (Help only, after more struggle) */
  move?: string;
  /** the thing this puzzle teaches for the first time (Tips says its first line once per save) */
  mech?: string;
  /** what she perches by for the nudge and the move */
  topic?: TopicId;
}

/** stage-hint puzzles (the hint's own line names the problem; dotLinesData has its new words) */
export const PUZZLE_STEPS: Readonly<Record<string, PuzzleSteps>> = {
  // 4-3, the pool: ride the log up first, then plug the fall
  'hint.4-3.pool': { nudge: 'That log floats. Could it lift you?', move: "Flick up twice from the log's near end.", topic: 'log' },
  // 4-3, the tide pool: the log at its highest is the way up
  'hint.4-3.lift': { nudge: 'The log rises while the water pours.', move: "Flick up twice when it's at the top.", topic: 'log' },
};

/** the lines that belong to a puzzle's later steps: they are never said as he walks up (the struggle watch says them) */
export const PUZZLE_LATER: ReadonlySet<string> = new Set(['hint.4-3.logJump', 'hint.4-3.logJump2']);

// ───────────────────────────── puzzle rooms' lines ─────────────────────────────

/** a puzzle room's line, by its words (puzzlePlay.ts notes each room's lines as it builds the room; Dot's guide reads them back) */
export interface RoomLine {
  step: 'name' | 'nudge' | 'move' | 'event';
  /** the thing the room teaches for the first time (RoomSpec.mech) */
  mech?: string;
}
const ROOM_LINES = new Map<string, RoomLine>();

/** which step a room's tip is (RoomTips key -> step) */
export const ROOM_STEP: Readonly<Record<string, RoomLine['step']>> = { enter: 'name', nudge: 'nudge', move: 'move' };

export function noteRoomLine(text: string, line: RoomLine): void {
  ROOM_LINES.set(text, line);
}
/** a puzzle room's line, by its words, or undefined for any other line */
export function roomLineOf(text: string): RoomLine | undefined {
  return ROOM_LINES.get(text);
}
