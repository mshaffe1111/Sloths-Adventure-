/**
 * World 5's lines for Dot: the first-time teaching tips for each piece of play (w5Kit W5_TEACH, said by w5Play.ts where the piece first
 * comes into view) and the stage hints of 5-1, 5-2 and 5-3 (w5Stages.ts), each in the old look's words and in Matt's new-look style
 * (tips 8 words or fewer that name the thumb move, story lines 12 or fewer, touch words only). dotLines.ts adds these rows to the
 * approved set, so the new look swaps them in the same way; the old look keeps the old words.
 */
import type { DotLineRow } from './dotLinesData.ts';
import type { GuideWho } from './dotGuide.ts';
import { W5_TEACH } from './w5Kit.ts';

/** a stage hint: where it is said, its words for the screen, the pad and the keys (old look), and its new-look line */
export interface W5Hint {
  stage: '5-1' | '5-2' | '5-3' | '5-4' | '5-5';
  kind: DotLineRow[3];
  old: string;
  pad?: string;
  keys?: string;
  text: string | null;
  then?: string | null;
  gesture?: string | null;
  target?: string | null;
}

export const W5_HINTS = {
  // ── 5-1 The Loveliest Place ──
  s51start: { stage: '5-1', kind: 'info', old: 'The loveliest place on the whole road. Keep running, Pokey, and don\'t stop', text: 'The loveliest place on the road. Don\'t stop.' },
  s51carving: { stage: '5-1', kind: 'story', old: 'Meeca carved that. With a hairpin, on the move. She\'s so resourceful', text: 'She carved it with a hairpin. So resourceful.' },
  s51table: { stage: '5-1', kind: 'story', old: 'A table set for two. That\'s very polite. That\'s what makes it scary', text: 'Very polite. That\'s what makes it scary.' },
  s51petals: { stage: '5-1', kind: 'info', old: 'Petals all along the high branches. Take them on the run', text: 'Petals up high. Take them on the run.' },
  // (the second jump, taught where it is first needed: the first gap one jump cannot cross. Everything before it is one jump high)
  s51double: {
    stage: '5-1', kind: 'move', old: 'A wide gap. Flick up again in the air to jump twice', pad: 'A wide gap. Press Jump again in the air',
    keys: 'A wide gap. Press Space again in the air', text: 'Wide gap! Flick up again midair.', gesture: 'double-jump', target: 'far side of the gap',
  },
  s51guests: { stage: '5-1', kind: 'story', old: 'All those wrapped-up chairs. Those were guests. They sat down', text: 'Those were guests. They sat down.' },
  s51end: { stage: '5-1', kind: 'info', old: 'Nearly through the garden. Don\'t slow down now', text: 'Nearly through. Don\'t slow down now.' },
  // ── 5-2 Don't Sit ──
  // (the rules are the stage's mechanics, not a story aside: said at once, not after a story line's wait. QA, 2026-10-26)
  s52rules: {
    stage: '5-2', kind: 'info',
    old: 'Rules. Don\'t sit. Don\'t eat anything. Don\'t drink anything. Don\'t touch the silk. Don\'t admire the silk. It takes it as a compliment',
    text: 'Don\'t sit. That\'s the one on the tree.',
  },
  // (before the first sleeper and the first thread: a sleeper wakes if he walks into it, and a thread's hum wakes them all)
  s52doze: {
    stage: '5-2', kind: 'info', old: 'Spiders, asleep on their webs. Let\'s keep it that way. Hop right over them',
    text: 'Sleeping spiders. Shh.', target: 'spider',
  },
  // (before the first stump only the second jump climbs, in each stage)
  s51tall: {
    stage: '5-1', kind: 'move', old: 'A tall stump. Flick up, then flick up again in the air to climb it', pad: 'A tall stump. Jump, then press Jump again in the air',
    keys: 'A tall stump. Jump, then press Space again in the air', text: 'Tall stump! Flick up again midair.', gesture: 'double-jump', target: 'top of the stump',
  },
  s52tall: {
    stage: '5-2', kind: 'move', old: 'Tall stumps again. Flick up, then flick up again in the air to climb them', pad: 'Tall stumps again. Jump, then press Jump again in the air',
    keys: 'Tall stumps again. Jump, then press Space again in the air', text: 'Tall stumps. Flick up again midair.', gesture: 'double-jump', target: 'top of the stump',
  },
  // (5-2's first wide gap: the second jump again, a reminder)
  s52double: {
    stage: '5-2', kind: 'move', old: 'Another wide gap. Flick up again in the air to jump twice', pad: 'Another wide gap. Press Jump again in the air',
    keys: 'Another wide gap. Press Space again in the air', text: 'Another wide one. Flick up again midair.', gesture: 'double-jump', target: 'far side of the gap',
  },
  s52chair: { stage: '5-2', kind: 'story', old: 'Don\'t even think about sitting. You\'d be a chair, Pokey. You\'d be, forever, a very still chair', text: 'You\'d be a chair. Forever, a very still chair.' },
  s52all: { stage: '5-2', kind: 'info', old: 'Threads, cakes and chairs, all at once. Slow and steady, but never still', text: 'Keep going. Don\'t stop anywhere soft.' },
  s52end: { stage: '5-2', kind: 'info', old: 'Nearly out of the garden. Keep moving', text: 'Nearly out. Keep moving.' },
  // ── 5-3 Closing Orchids ──
  // (the story's "barely afternoon, and the orchids were already closing": said at the start, before the first orchid)
  s53start: {
    stage: '5-3', kind: 'info', old: 'It\'s barely afternoon, Pokey, and the orchids are closing already. Get the flowers before they shut',
    text: 'Barely afternoon, and they\'re closing already.',
  },
  // (halfway on: the orchids stay open for less of their beat from here, the stage's "closing early")
  s53sooner: {
    stage: '5-3', kind: 'info', old: 'They\'re shutting sooner and sooner. Go the moment one opens, and don\'t stand there waiting',
    text: 'They shut sooner now.',
  },
  s53end: { stage: '5-3', kind: 'info', old: 'The last of the orchids. Nearly through, Pokey', text: 'The last orchids. Nearly through.' },
  // ── 5-4 Silk Bridges (dusk: the light going as the orchids close) ──
  s54start: {
    stage: '5-4', kind: 'info', old: 'It\'s getting late, Pokey, and the orchids are closing. Swing across on the silk, and don\'t stop',
    text: 'Getting late. Silk lines ahead.',
  },
  // (Dot's fifth rule, before the first silk sheet: the sheet's own tip, "Slide straight past the silk", follows as it comes into view.
  // It names the silk: QA found "And don't admire it" unclear, the "it" naming nothing)
  s54admire: {
    stage: '5-4', kind: 'info', old: 'Rule five. Don\'t admire the silk. It takes it as a compliment, and then it keeps you',
    text: 'Rule five. Don\'t admire the silk.',
  },
  // (before the first chain of two: let go at the front of the swing, and the next line is there to catch)
  s54chain: {
    stage: '5-4', kind: 'move', old: 'Two silk lines in a row. Flick up at the front of the swing, and catch the next one',
    text: null, gesture: 'flick-up', target: 'vine',
  },
  // (before the first high bridge: the branches up, and the branch under it that catches a miss)
  s54high: {
    stage: '5-4', kind: 'info', old: 'A silk bridge, way up high. Hop up the branches. If you miss a line, there\'s a branch below to catch you',
    text: 'Silk way up high. A branch catches misses.',
  },
  s54end: { stage: '5-4', kind: 'info', old: 'Nearly across. Don\'t look back at the silk', text: 'Nearly across. Don\'t look back at it.' },
} as const satisfies Record<string, W5Hint>;

/**
 * World 5's help at a step one jump climbs, when he keeps hopping straight up beside it and landing back where he was (engine.ts, the
 * stuck-helper's low-step watch): a short flick with the thumb lifted carries him nowhere (QA, 5-1, 2026-10-26)
 */
export const W5_STEP_HELP = 'Keep your thumb sliding forward as you flick up. That lands you on top';
export const W5_STEP_HELP_PAD = 'Keep pushing forward as you press Jump. That lands you on top';
export const W5_STEP_HELP_KEYS = 'Keep holding forward as you press Space. That lands you on top';

const T = W5_TEACH;
/** the first-time tips (said anywhere in World 5, so no stage) */
const TEACH_ROWS: DotLineRow[] = [
  ['w5.still', '', 'guide', 'move', T.still, 'Don\'t stop! Silk creeps up. Slide on.', null, 'slide', 'pokey'],
  ['w5.sit', '', 'guide', 'move', T.sit, 'Slide left and right to shake it off.', null, 'slide', 'pokey'],
  ['w5.wrapped', '', 'guide', 'help', T.wrapped, 'Keep moving! Slide your thumb to wiggle free.', null, null, 'pokey'],
  ['w5.wrapGentle', '', 'guide', 'help', T.wrapGentle, 'Wake up, Pokey! Keep sliding along.', null, null, 'pokey'],
  ['w5.chair', '', 'guide', 'info', T.chair, 'Soft chairs. They keep whoever sits.', null, null, 'soft chair'],
  ['w5.cake', '', 'guide', 'info', T.cake, 'Cakes make you slow!', null, null, 'cake'],
  ['w5.ate', '', 'guide', 'help', T.ate, 'That cake made you slow. Keep sliding.', null, null, 'pokey'],
  ['w5.butler', '', 'guide', 'info', T.butler, 'A butler! He won\'t let you by.', null, null, 'tray'],
  ['w5.pot', '', 'guide', 'info', T.pot, 'That teapot puffs sleepy steam.', null, null, 'teapot'],
  ['w5.steam', '', 'guide', 'help', T.steam, 'Sleepy steam! Slide past between puffs.', null, null, 'pokey'],
  ['w5.thread', '', 'guide', 'info', T.thread, 'Threads! The spiders listen to them.', null, null, 'thread'],
  ['w5.hummed', '', 'guide', 'info', T.hummed, 'It hummed! Spiders coming!', null, null, 'spider'],
  ['w5.sheet', '', 'guide', 'info', T.sheet, 'The silk sheets catch whoever looks.', null, null, 'silk sheet'],
  ['w5.orchid', '', 'guide', 'info', T.orchid, 'Orchids! They close, then open again.', null, null, 'orchid'],
  ['w5.cocoon', '', 'guide', 'info', T.cocoon, 'Somebody\'s in there!', null, null, 'cocoon'],
  ['w5.silk', '', 'guide', 'move', T.silk, 'Flick up into the silk to swing.', 'Then flick up and forward to let go.', 'flick-up', 'vine'],
  ['w5.spider', '', 'guide', 'info', T.spider, 'Spiders! These ones are soft.', null, null, 'spider'],
  ['w5.seamstress', '', 'guide', 'info', T.seamstress, 'The Seamstress. She sews whoever she sees.', null, null, 'seamstress'],
  ['w5.laced', '', 'guide', 'help', T.laced, 'She saw you looking! Slide left and right.', null, null, 'pokey'],
  ['w5.step', '', 'guide', 'help', W5_STEP_HELP, 'Keep sliding forward as you flick up.', null, 'flick-up', 'step'],
];

/**
 * The first-time tips about World 5's THINGS (dotGuide.ts GuideLine.thing): each names a move he already knows (a flick, a tap), but
 * what it teaches is the thread, the cake, the tray. The new look says them even when that move was done earlier in the stage (it
 * dropped them unseen before: QA, 5-2, 2026-10-26), and "Just reminders" says each one the first time.
 */
export const W5_THING_TIPS: ReadonlySet<string> = new Set([
  // (the stillness rule, before the silk: "slide" is a move every player has done, so as a plain move tip a phone that had run before
  // would drop it. The silk's own line, once it is on him, is a warning and always said. QA v198)
  'w5.still',
  'w5.chair', 'w5.cake', 'w5.ate', 'w5.butler', 'w5.pot', 'w5.thread', 'w5.sheet', 'w5.orchid', 'w5.cocoon', 'w5.silk', 'w5.spider',
  'w5.seamstress', 'hint.5-2.rules', 'hint.5-2.doze', 'hint.5-4.chain',
]);

const HINT_ROWS: DotLineRow[] = Object.entries(W5_HINTS).map(([id, h]) => {
  const w = h as W5Hint;
  return [`hint.${w.stage}.${id.slice(3)}`, w.stage, 'stage hint', w.kind, w.old, w.text, w.then ?? null, w.gesture ?? null, w.target ?? null];
});

// ───────────────────────────── 5-5 Caught in Silk: the pouch scene ─────────────────────────────

/** one line of a scene played in a stage: who says it, and the words (each its own bubble, 12 words or fewer) */
export interface W5SceneLine {
  id: string;
  who: GuideWho;
  text: string;
  /** seconds after the line before it was said (default: its reading time and a breath); "A minute later" waits longer */
  after?: number;
}

/**
 * The pouch (reference/STORY-REWRITE.md, World 5, "The pouch (halfway through the world)"), played in 5-5 at the rest branch where the
 * orchids hang in rows: a short beat in play, not a cutscene. The script's lines as written, the narration in the past tense as the
 * petal's (wayside.ts "Petal", the narrator). Changed only where the 12-word line rule forces it:
 *   - "They stopped to rest on a branch where the orchids hung in rows" (13 words) loses "on a branch" (the branch is the picture);
 *   - Dot's long line (26 words) is said in three bubbles, every word kept, the last trailing off as she stops;
 *   - "Dot let go of the pouch. A minute later her wing was back on it." (14) is two, the second a while after the first.
 * Meeca's own stage, "On the March North", comes first in World 5, before 5-1 (Matt, 2026-10-27/28; meecaStage.ts, extraStages.ts).
 */
export const W5_POUCH: readonly W5SceneLine[] = [
  { id: 'n1', who: 'Petal', text: 'They stopped to rest where the orchids hung in rows.' },
  { id: 'n2', who: 'Petal', text: 'Pokey stood, because the note said so.' },
  { id: 'n3', who: 'Petal', text: 'Dot touched the pouch at her side. Then she touched it again.' },
  { id: 'p1', who: 'Pokey', text: 'You keep checking that pouch.' },
  { id: 'd1', who: 'Dot', text: 'It\'s a thing. It isn\'t for you.' },
  { id: 'p2', who: 'Pokey', text: 'Who\'s it for?' },
  { id: 'd2', who: 'Dot', text: 'Somebody I\'m scared of.' },
  { id: 'p3', who: 'Pokey', text: 'The General?' },
  { id: 'd3', who: 'Dot', text: 'It\'s not him I\'m scared of.' },
  { id: 'd4', who: 'Dot', text: 'It\'s what it says, and what he does when he reads it,' },
  { id: 'd5', who: 'Dot', text: 'and that I... that I took so—' },
  { id: 'n4', who: 'Petal', text: 'She stopped.' },
  { id: 'p4', who: 'Pokey', text: 'Then give it to him when you\'re ready. Not before.' },
  { id: 'd6', who: 'Dot', text: 'And what if it\'s too late by then?' },
  { id: 'p5', who: 'Pokey', text: 'Slow isn\'t stopped.' },
  { id: 'd7', who: 'Dot', text: 'Is that true, or is that just something you say?' },
  { id: 'p6', who: 'Pokey', text: 'I don\'t know yet. It hasn\'t been wrong.' },
  { id: 'n5', who: 'Petal', text: 'Dot let go of the pouch.' },
  { id: 'n6', who: 'Petal', text: 'A minute later her wing was back on it.', after: 15 },
];

const sceneId = (l: W5SceneLine) => `scene.5-5.pouch.${l.id}`;
// (a stage hint's surface, so the guide swaps them by their words as it does every engine line; the old words are the new ones)
const POUCH_ROWS: DotLineRow[] = W5_POUCH.map((l) => [sceneId(l), '5-5', 'stage hint', 'story', l.text, l.text, null, null, null]);

/** who says each scene line (dotLines.ts engineGuideLine: the engine hands over only words, and a scene has more than Dot in it) */
export const W5_SPEAKERS: ReadonlyMap<string, GuideWho> = new Map(W5_POUCH.map((l) => [sceneId(l), l.who]));
/** the scene's lines follow one another with a breath between, not a story aside's long wait (dotGuide.ts GuideLine.scene) */
export const W5_SCENE_IDS: ReadonlySet<string> = new Set(W5_POUCH.map(sceneId));

/** every World 5 row, for dotLines.ts */
export const W5_DOT_LINES: readonly DotLineRow[] = [...TEACH_ROWS, ...HINT_ROWS, ...POUCH_ROWS];
