/**
 * World 5's lines for Dot: the first-time teaching tips for each piece of play (w5Kit W5_TEACH, said by w5Play.ts where the piece first
 * comes into view) and the stage hints of 5-1 and 5-2 (w5Stages.ts), each in the old look's words and in Matt's new-look style
 * (tips 8 words or fewer that name the thumb move, story lines 12 or fewer, touch words only). dotLines.ts adds these rows to the
 * approved set, so the new look swaps them in the same way; the old look keeps the old words.
 */
import type { DotLineRow } from './dotLinesData.ts';
import { W5_TEACH } from './w5Kit.ts';

/** a stage hint: where it is said, its words for the screen, the pad and the keys (old look), and its new-look line */
export interface W5Hint {
  stage: '5-1' | '5-2';
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
    text: 'Rules: don\'t sit, eat, drink, or touch the silk.', then: 'And don\'t admire it. It takes it as a compliment.',
  },
  // (before the first sleeper and the first thread: a sleeper wakes if he walks into it, and a thread's hum wakes them all)
  s52doze: {
    stage: '5-2', kind: 'move', old: 'Spiders, asleep on their webs. Let\'s keep it that way. Hop right over them',
    text: 'Sleeping spiders. Flick up over them. Shh.', gesture: 'flick-up', target: 'spider',
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
  s52all: { stage: '5-2', kind: 'info', old: 'Threads, cakes and chairs, all at once. Slow and steady, but never still', text: 'Slow and steady. But never, ever still.' },
  s52end: { stage: '5-2', kind: 'info', old: 'Nearly out of the garden. Keep moving', text: 'Nearly out. Keep moving.' },
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
  ['w5.sit', '', 'guide', 'move', T.sit, 'Slide left and right to shake it off.', null, 'slide', 'pokey'],
  ['w5.wrapped', '', 'guide', 'help', T.wrapped, 'Keep moving! Slide your thumb to wiggle free.', null, null, 'pokey'],
  ['w5.wrapGentle', '', 'guide', 'help', T.wrapGentle, 'Wake up, Pokey! Keep moving.', null, null, 'pokey'],
  ['w5.chair', '', 'guide', 'move', T.chair, 'Slide past the chairs. Never sit.', null, 'slide', 'soft chair'],
  ['w5.cake', '', 'guide', 'move', T.cake, 'Cakes make you slow! Flick up over them.', null, 'flick-up', 'cake'],
  ['w5.ate', '', 'guide', 'help', T.ate, 'That cake made you slow. It wears off.', null, null, 'pokey'],
  ['w5.butler', '', 'guide', 'move', T.butler, 'A butler! Tap to punch his tray away.', null, 'tap', 'tray'],
  ['w5.pot', '', 'guide', 'move', T.pot, 'Slide past the pot between puffs.', null, 'slide', 'teapot'],
  ['w5.steam', '', 'guide', 'help', T.steam, 'Sleepy steam! Go between the puffs.', null, null, 'pokey'],
  ['w5.thread', '', 'guide', 'move', T.thread, 'Flick up over the threads. Spiders listen.', null, 'flick-up', 'thread'],
  ['w5.hummed', '', 'guide', 'info', T.hummed, 'It hummed! Spiders coming!', null, null, 'spider'],
  ['w5.sheet', '', 'guide', 'move', T.sheet, 'Slide straight past the silk. Don\'t look.', null, 'slide', 'silk sheet'],
  ['w5.orchid', '', 'guide', 'move', T.orchid, 'Flick up while the orchid is open.', null, 'flick-up', 'orchid'],
  ['w5.cocoon', '', 'guide', 'move', T.cocoon, 'Tap the cocoon to punch it open.', null, 'tap', 'cocoon'],
  ['w5.silk', '', 'guide', 'move', T.silk, 'Flick up into the silk to swing.', null, 'flick-up', 'vine'],
  ['w5.spider', '', 'guide', 'move', T.spider, 'Tap to punch the spider, or stomp it.', null, 'tap', 'spider'],
  ['w5.step', '', 'guide', 'help', W5_STEP_HELP, 'Keep sliding forward as you flick up.', null, 'flick-up', 'step'],
];

/**
 * The first-time tips about World 5's THINGS (dotGuide.ts GuideLine.thing): each names a move he already knows (a flick, a tap), but
 * what it teaches is the thread, the cake, the tray. The new look says them even when that move was done earlier in the stage (it
 * dropped them unseen before: QA, 5-2, 2026-10-26), and "Just reminders" says each one the first time.
 */
export const W5_THING_TIPS: ReadonlySet<string> = new Set([
  'w5.chair', 'w5.cake', 'w5.ate', 'w5.butler', 'w5.pot', 'w5.thread', 'w5.sheet', 'w5.orchid', 'w5.cocoon', 'w5.silk', 'w5.spider',
  'hint.5-2.rules', 'hint.5-2.doze',
]);

const HINT_ROWS: DotLineRow[] = Object.entries(W5_HINTS).map(([id, h]) => {
  const w = h as W5Hint;
  return [`hint.${w.stage}.${id.slice(3)}`, w.stage, 'stage hint', w.kind, w.old, w.text, w.then ?? null, w.gesture ?? null, w.target ?? null];
});

/** every World 5 row, for dotLines.ts */
export const W5_DOT_LINES: readonly DotLineRow[] = [...TEACH_ROWS, ...HINT_ROWS];
