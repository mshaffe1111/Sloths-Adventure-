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
  'w5.sway': 'orchid',
  'w5.cocoon': 'cocoon',
  'w5.silk': 'silk',
  'hint.5-4.chain': 'silk',
  'w5.spider': 'spider',
  'w5.seamstress': 'seamstress',
  'w5.hummed': 'hum',
  'w5.steam': 'pot',
  // World 6 (gen2: its lines have no rows, so they are keyed by their words)
  'Poison frog. Stomp it, never touch it.': 'poisonFrog',
  "The water's watching. Duck into the roots!": 'waterWatch',
  'A tayra! Quick, so punch it early.': 'tayra',
  'Mud! Cross while the tide is out.': 'tide',
  "The roots go dark. Stay in the firefly's light.": 'firefly',
  'Too high. Stay close to the firefly, Pokey.': 'firefly',
  'High water swells that root door shut.': 'w6water',
  // (the zones' first lines, engine.ts ZONE_LINE: the same things the stage hints teach, so each is said once)
  'Sticky webs! They slow you down.': 'web',
  'The tide rises and falls.': 'tide',
  'So dark. Follow the fireflies.': 'firefly',
  'Too dark to see. Stand still and listen...': 'dark',
  'These tiles crumble!': 'crumbleTiles',
  'Sleepy spores puff out here.': 'spores',
  'Gusts blow on a beat. Watch the leaves.': 'gusts',
  'Vents erupt on a beat.': 'vents',
  'Lightning strikes where the rods charge.': 'lightning',
  'Head-on it hides. Flick sideways to kick!': 'snapper',
  'Head-on he blocks. Flick sideways to kick!': 'spearGuard',
};

/**
 * The stage lines that are reminders of a thing taught before (by the thing): Help says a reminder only for a thing taught in an
 * earlier stage, never twice in one stage (Matt, 2026-10-29); Tips never. Keyed by the line's id, or its words when it has no row.
 * A line in neither table is about the moment ("That vine is too high"): Help says it, Tips does not.
 */
export const REMINDS_OF: Readonly<Record<string, string>> = {
  // World 1
  'hint.1-5.creaky': 'lesson:crumble',
  'hint.1-6.shiny': 'golden',
  'hint.1-7.ropeBush': 'watcher',
  'Hide! Into a bush!': 'watcher',
  // World 2
  'hint.2-1.deep': 'lesson:water',
  'hint.2-8.deep': 'lesson:water',
  'hint.2-5.row': 'snapper',
  'hint.2-5.kick': 'snapper',
  'hint.2-9.court': 'spearGuard',
  'hint.2-9.kick': 'spearGuard',
  // World 3
  'hint.3-2.dark': 'dark',
  'hint.3-2.fern': 'eyes',
  'Hide! Into a fern!': 'eyes',
  'hint.3-6.dark': 'glowworms',
  'hint.3-7.eyes': 'eyes',
  'hint.3-7.still': 'thornVine',
  'hint.3-7.search': 'hushFern',
  'hint.3-8.landing': 'thornVineSwing',
  'hint.3-8.leap': 'thornVineSwing',
  'hint.3-9.two': 'prowler',
  // World 4
  'hint.4-2.ride': 'chimes',
  'hint.4-2.turn': 'chimes',
  'hint.4-4.wind': 'chimes',
  'hint.4-9.wind': 'chimes',
  'hint.4-4.head': 'headwind',
  'hint.4-4.both': 'headwind',
  'hint.4-3.another': 'fallPlug',
  'hint.4-3.rocks': 'rocks',
  'hint.4-4.rocks': 'rocks',
  'hint.4-9.rocks': 'rocks',
  'hint.4-3.comes': 'surge',
  'hint.4-3.gap': 'surge',
  'hint.4-3.twoFalls': 'surge',
  'w4.surge': 'surge',
  'hint.4-3.monkey': 'thief',
  'hint.4-4.knotSeed': 'knot',
  'hint.4-9.knotSeed': 'knot',
  'hint.4-9.knot': 'knot',
  'hint.4-8.dotFirst': 'knot',
  'hint.4-5.shadow': 'sovereign',
  'Hide! Water or a bush!': 'veil',
  'hint.4-5.two': 'lookout',
  'w4.mist': 'mist',
  'hint.4-6.mist2': 'mist',
  'hint.4-9.mist': 'mist',
  'hint.4-6.eagletsMist': 'eaglets',
  'hint.4-7.cave2': 'caveDrop',
  'hint.4-7.turn': 'caveDrop',
  'hint.4-7.turn2': 'caveDrop',
  'hint.4-7.rock': 'warmAir',
  'hint.4-9.warm': 'warmAir',
  'hint.4-9.grit': 'grit',
  'hint.4-8.shiny': 'golden',
  'hint.4-8.guard2': 'capuchin',
  'hint.4-8.perch': 'capuchin',
  'w4.blowOff': 'capuchin',
  'hint.4-9.back': 'capuchin',
  'hint.4-9.edge': 'capuchin',
  'hint.4-9.pacing': 'capuchin',
  'hint.4-9.topGuard': 'capuchin',
  'hint.4-9.twoGuards': 'capuchin',
  'hint.4-9.guardRocks': 'capuchin',
};

/** the thing a line is about, for Help's once-a-stage rule: what it teaches, or what it reminds of */
export function thingOf(l: { key: string; mech?: string; move?: string; kind: string; source: string; skill?: string }): string | undefined {
  if (l.mech) return `mech:${l.mech}`;
  const id = l.key.startsWith('engine:') ? l.key.slice('engine:'.length) : l.key;
  const r = REMINDS_OF[id];
  if (r) return r.startsWith('lesson:') ? r : `mech:${r}`;
  if (l.source === 'lesson') return l.skill?.split(':').slice(0, 2).join(':');
  if (l.kind === 'teach' && l.move && l.source === 'engine') return `move:${l.move}`;
  return undefined;
}

/** the first time each kind of zone is close (engine.ts): in Dot's bubble, short and in normal case, not as words floating in the world */
export const ZONE_LINE: Readonly<Record<string, string>> = {
  web: 'Sticky webs! They slow you down.',
  tide: 'The tide rises and falls.',
  dark: 'So dark. Follow the fireflies.',
  darkStill: 'Too dark to see. Stand still and listen...',
  crumble: 'These tiles crumble!',
  spore: 'Sleepy spores puff out here.',
  wind: 'Gusts blow on a beat. Watch the leaves.',
  geyser: 'Vents erupt on a beat.',
  bolt: 'Lightning strikes where the rods charge.',
};

/** the Hush Fern, once its search has been taught: after he has walked past it twice (DOT-14) */
export const FERN_HMM = 'Hmm, that fern...';

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
  // 4-5, two lookouts: the second can't see behind the falls
  'hint.4-5.two': { nudge: "Behind the falls, she can't see you.", move: 'Knock the second fruit down from behind the falls.' },
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
