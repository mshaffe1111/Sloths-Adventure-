/**
 * Pokey's Journal — How to Play that fills in as you play (Matt, 2026-10-24: "completely overhaul the how to play so that, as we
 * continue to go through, it brings in the new moves and the concepts"; he chose chapters by kind of move, mystery pages for what is
 * still to come, and Pokey doing each move on a loop).
 *
 * A page is one move or idea. It starts locked and opens the moment the game has taught it: a lesson card seen (lessons.ts), a tip
 * Dot has said in a stage (tipMemory.ts), a skill learned (skills.ts), a stage cleared, or a find picked up. All of that is already
 * kept on the device, so the journal needs no save of its own beyond which pages have been looked at (for the NEW badge) and which
 * have been announced (for the note during play).
 *
 * Every page has its moves for each kind of controls (touch screen, thumb pad, keyboard), so it always speaks to the player's own way
 * of playing.
 */
import { LESSONS, lessonsSeen, type InputMode, type LessonId, type LessonLine } from './lessons.ts';
import { learnedSkills, type SkillId } from './skills.ts';
import { tipHeard } from './tipMemory.ts';
import { loadFinds } from './finds.ts';

export type ChapterId = 'moving' | 'fighting' | 'climbing' | 'sneaking' | 'dangers' | 'finding';

export const CHAPTERS: Array<{ id: ChapterId; name: string }> = [
  { id: 'moving', name: 'Moving' },
  { id: 'fighting', name: 'Fighting' },
  { id: 'climbing', name: 'Climb & swing' },
  { id: 'sneaking', name: 'Sneaking' },
  { id: 'dangers', name: 'Dangers' },
  { id: 'finding', name: 'Finding things' },
];

/** the little scene each page plays (JournalDemo.tsx) */
export type DemoId =
  | 'run' | 'jump' | 'double' | 'duck' | 'gap' | 'glide'
  | 'punch' | 'kick' | 'mega' | 'stomp' | 'nostomp' | 'bird' | 'big' | 'boss'
  | 'climb' | 'swing' | 'bounce' | 'shimmy'
  | 'hide' | 'sleepers'
  | 'water' | 'crumble' | 'moving' | 'collapse' | 'drops'
  | 'shrine' | 'goals' | 'heart' | 'power' | 'flag' | 'cage' | 'finds' | 'ferns';

/** Pokey's pose on the page's tile (a still from the same sprite) */
export type PoseId = 'stand' | 'run' | 'jump' | 'duck' | 'punch' | 'kick' | 'climb' | 'hang' | 'swing';

/** what opens a page: any one of these */
export interface Unlock {
  always?: boolean;
  lesson?: LessonId[];
  /** a tip Dot says in a stage, by its id there (tipMemory.ts) */
  tip?: Array<[string, string]>;
  /** a stage cleared */
  cleared?: string[];
  skill?: SkillId;
  /** a find picked up (finds.ts ids) */
  found?: (ids: string[]) => boolean;
}

export interface JournalPage {
  id: string;
  chapter: ChapterId;
  title: string;
  /** one or two sentences, the same for every kind of controls */
  intro: string;
  lines: Record<InputMode, LessonLine[]>;
  demo: DemoId;
  pose: PoseId;
  open: Unlock;
  /** on the locked page: where it is learned, and Dot's riddle */
  where: string;
  riddle: string;
}

const same = (l: LessonLine[]): Record<InputMode, LessonLine[]> => ({ screen: l, pad: l, keys: l });
/** a lesson card's own lines and intro, so the journal and the card never disagree */
const fromLesson = (id: LessonId) => ({ intro: LESSONS[id].intro, lines: LESSONS[id].lines });

/** a Dot tip from a hand-built stage (protoStage.ts hints are kept as `tip:<their text>`) */
const tip = (stage: string, text: string): [string, string] => [stage, `tip:${text}`];

export const PAGES: JournalPage[] = [
  // ───────────── Moving ─────────────
  {
    id: 'run', chapter: 'moving', title: 'Run', demo: 'run', pose: 'run', open: { always: true }, where: '', riddle: '',
    intro: 'Pokey runs whichever way you steer, and turns around in a moment.',
    lines: {
      screen: [{ glyph: 'run', how: 'Put your thumb down anywhere and slide sideways', what: 'Run', sub: 'slide the other way to turn around. Lift your thumb to stop' }],
      pad: [{ how: 'Pad ← →', what: 'Run', sub: 'the pad appears wherever your thumb lands on its side of the screen' }],
      keys: [{ how: 'A D or ← →', what: 'Run' }],
    },
  },
  {
    id: 'jump', chapter: 'moving', title: 'Jump', demo: 'jump', pose: 'jump', open: { always: true }, where: '', riddle: '',
    intro: 'Hop up onto logs and stumps, and over little gaps.',
    lines: {
      screen: [
        { glyph: 'up', how: 'A quick flick up', what: 'Jump', sub: 'standing still or running' },
        { glyph: 'jump', how: 'Slide up and across, in one move', what: 'Run and jump', sub: 'keep sliding forward in the air to go far' },
      ],
      pad: [{ how: 'Jump button', what: 'Jump', sub: 'hold it for a higher jump' }],
      keys: [{ how: 'W, ↑ or Space', what: 'Jump', sub: 'hold it for a higher jump' }],
    },
  },
  {
    id: 'double', chapter: 'moving', title: 'Double jump', demo: 'double', pose: 'jump',
    open: { lesson: ['gap'], tip: [tip('1-1', 'Flick up again in the air to jump twice')], cleared: ['1-1'] },
    where: 'Learned in World 1', riddle: 'One jump is good. What would be better?',
    intro: 'Jump again while you are still in the air. It carries you a little further, for gaps that are just too wide.',
    lines: {
      screen: [
        { glyph: 'up', how: 'Flick up again in the air', what: 'Jump again', sub: 'it pushes you forward the way you face' },
      ],
      pad: [{ how: 'Press Jump again in the air', what: 'Jump again' }],
      keys: [{ how: 'Press Space again in the air', what: 'Jump again' }],
    },
  },
  {
    id: 'duck', chapter: 'moving', title: 'Duck', demo: 'duck', pose: 'duck', open: { always: true }, where: '', riddle: '',
    intro: 'Get low. A low duck slips under a diving bird, and it is how you hide in a bush.',
    lines: {
      screen: [{ glyph: 'down', how: 'Slide down', what: 'Duck', sub: 'keep your thumb there to stay low' }],
      pad: [{ how: 'Pad ↓', what: 'Duck' }],
      keys: [{ how: 'S or ↓', what: 'Duck' }],
    },
  },
  {
    id: 'gap', chapter: 'moving', title: 'Jump a gap', demo: 'gap', pose: 'run', open: { lesson: ['gap'] },
    where: 'Learned in World 1', riddle: 'Watch your step!',
    ...fromLesson('gap'),
  },
  {
    id: 'glide', chapter: 'moving', title: 'Leaf glide', demo: 'glide', pose: 'jump', open: { skill: 'glide' },
    where: 'Learned in World 4', riddle: 'Something to do with leaves, and a very long way down.',
    intro: 'Open a big leaf as you fall and drift down slowly, a long way out over the drop.',
    lines: {
      screen: [
        { glyph: 'up', how: 'Jump, then keep your thumb up as you fall', what: 'Open the leaf' },
        { glyph: 'run', how: 'Slide left and right', what: 'Steer while you drift' },
        { glyph: 'down', how: 'Lift your thumb or slide down', what: 'Drop normally' },
      ],
      pad: [{ how: 'Hold Jump as you start to fall', what: 'Open the leaf' }, { how: 'Pad ← →', what: 'Steer while you drift' }, { how: 'Let go of Jump', what: 'Drop normally' }],
      keys: [{ how: 'Hold Space as you start to fall', what: 'Open the leaf' }, { how: 'A D or ← →', what: 'Steer while you drift' }, { how: 'Let go of Space', what: 'Drop normally' }],
    },
  },

  // ───────────── Fighting ─────────────
  {
    id: 'punch', chapter: 'fighting', title: 'Punch', demo: 'punch', pose: 'punch', open: { always: true }, where: '', riddle: '',
    intro: 'Pokey\'s Claw Punch. A few quick ones in a row make a combo.',
    lines: {
      screen: [{ glyph: 'tap', how: 'Tap beside a foe', what: 'Punch', sub: 'tap again for the next punch. In the air, a tap is a jump kick' }],
      pad: [{ how: 'Punch button', what: 'Punch' }],
      keys: [{ how: 'J or Z', what: 'Punch' }],
    },
  },
  {
    id: 'kick', chapter: 'fighting', title: 'Kick', demo: 'kick', pose: 'kick', open: { lesson: ['foe'] },
    where: 'Learned in World 1', riddle: 'Hands are busy? Try your feet.',
    intro: 'A kick hits harder than a punch and reaches a little further.',
    lines: {
      screen: [{ glyph: 'flick', how: 'A quick flick ← or →', what: 'Kick', sub: 'he kicks the way you flick' }],
      pad: [{ how: 'Kick button', what: 'Kick' }],
      keys: [{ how: 'K or X', what: 'Kick' }],
    },
  },
  {
    id: 'mega', chapter: 'fighting', title: 'Mega punch', demo: 'mega', pose: 'punch', open: { lesson: ['foe'] },
    where: 'Learned in World 1', riddle: 'Wind up... and...',
    intro: 'Slower to throw, but it hits hardest of all. Good for big animals and bosses.',
    lines: {
      screen: [{ glyph: 'hold', how: 'Press and hold', what: 'Mega punch', sub: 'let go to throw it' }],
      pad: [{ how: 'Hold the Punch button', what: 'Mega punch' }],
      keys: [{ how: 'L or Shift', what: 'Mega punch' }],
    },
  },
  {
    id: 'stomp', chapter: 'fighting', title: 'Stomp', demo: 'stomp', pose: 'jump', open: { lesson: ['foe'] },
    where: 'Learned in World 1', riddle: 'Look out below!',
    intro: 'Land on a foe\'s head to beat it, and bounce off.',
    lines: same([{ how: 'Jump and come down on its head', what: 'Stomp', sub: 'most foes can be stomped' }]),
  },
  {
    id: 'nostomp', chapter: 'fighting', title: 'Not this one!', demo: 'nostomp', pose: 'punch', open: { lesson: ['nostomp'] },
    where: 'Coming up on your travels', riddle: 'Some foes do not like being stood on.',
    ...fromLesson('nostomp'),
  },
  {
    id: 'bird', chapter: 'fighting', title: 'Swooping birds', demo: 'bird', pose: 'duck', open: { lesson: ['eagle'] },
    where: 'Coming up on your travels', riddle: 'Keep an eye on the sky.',
    ...fromLesson('eagle'),
  },
  {
    id: 'big', chapter: 'fighting', title: 'Big animals', demo: 'big', pose: 'kick', open: { lesson: ['tough'] },
    where: 'Learned in World 1', riddle: 'Some foes take more than one hit.',
    ...fromLesson('tough'),
  },
  {
    id: 'boss', chapter: 'fighting', title: 'Boss fights', demo: 'boss', pose: 'punch', open: { tip: [['1-10', 'boss:start']], cleared: ['1-10'] },
    where: 'At the end of World 1', riddle: 'Every world has a ruler.',
    intro: 'Every world ends with a boss. It always warns you before it attacks: get out of the way, then hit it while it is open.',
    lines: same([
      { how: 'Watch for the warning', what: 'Get out of the way', sub: 'a flash, a rear back, a line on the floor' },
      { how: 'When it is dazed or its weak spot glows', what: 'Hit it' },
    ]),
  },

  // ───────────── Climb & swing ─────────────
  {
    id: 'climb', chapter: 'climbing', title: 'Climb a tree', demo: 'climb', pose: 'climb', open: { lesson: ['climb'] },
    where: 'Learned in World 1', riddle: 'Sloths are very good at this.',
    ...fromLesson('climb'),
  },
  {
    id: 'swing', chapter: 'climbing', title: 'Swing on a liana', demo: 'swing', pose: 'swing', open: { lesson: ['swing'] },
    where: 'Learned in World 1', riddle: 'Hold on tight, then let go at just the right moment.',
    ...fromLesson('swing'),
  },
  {
    id: 'bounce', chapter: 'climbing', title: 'Bouncy mushrooms', demo: 'bounce', pose: 'jump', open: { lesson: ['bounce'] },
    where: 'Coming up on your travels', riddle: 'Boing!',
    ...fromLesson('bounce'),
  },
  {
    id: 'shimmy', chapter: 'climbing', title: 'Shimmy rope', demo: 'shimmy', pose: 'hang', open: { skill: 'shimmy' },
    where: 'Learned by clearing 1-3', riddle: 'Hand over hand, all the way across.',
    intro: 'Grab a rope and creep across, hand over hand. Ropes stretch over gaps you could never jump.',
    lines: {
      screen: [
        { glyph: 'up', how: 'Flick up into the rope', what: 'Grab on' },
        { glyph: 'run', how: 'Slide left or right', what: 'Shimmy along' },
        { glyph: 'down', how: 'Slide down, then flick up', what: 'Let go' },
      ],
      pad: [{ how: 'Jump up into the rope', what: 'Grab on' }, { how: 'Pad ← →', what: 'Shimmy along' }, { how: 'Pad ↓ and Jump', what: 'Let go' }],
      keys: [{ how: 'Jump up into the rope', what: 'Grab on' }, { how: 'A D or ← →', what: 'Shimmy along' }, { how: 'S or ↓ and Space', what: 'Let go' }],
    },
  },

  // ───────────── Sneaking ─────────────
  {
    id: 'hide', chapter: 'sneaking', title: 'Hide in a bush', demo: 'hide', pose: 'duck',
    open: { tip: [tip('1-7', 'An eagle is watching. Slide down inside a bush to hide'), ['1-7', 'watch:hide']], cleared: ['1-7'] },
    where: 'Learned in World 1', riddle: 'Dot knows a good trick for hiding from soldiers.',
    intro: 'When the eagle screeches, its shadow is coming. Get inside a bush and keep low until it has gone by.',
    lines: {
      screen: [
        { glyph: 'down', how: 'Slide down inside a bush', what: 'Hide' },
        { glyph: 'up', how: 'Hang inside a bush on a rope', what: 'Hide up high too' },
      ],
      pad: [{ how: 'Pad ↓ inside a bush', what: 'Hide' }, { how: 'Hang inside a bush on a rope', what: 'Hide up high too' }],
      keys: [{ how: 'S or ↓ inside a bush', what: 'Hide' }, { how: 'Hang inside a bush on a rope', what: 'Hide up high too' }],
    },
  },
  {
    id: 'sleepers', chapter: 'sneaking', title: 'Sleeping snakes', demo: 'sleepers', pose: 'punch',
    open: { tip: [tip('1-3', 'Hop up beside the sleeping snake and tap to punch it')], cleared: ['1-3'] },
    where: 'Learned in World 1', riddle: 'Shh... zzz...',
    intro: 'Some snakes are fast asleep. Creep up and hit first. Get too close and they wake up.',
    lines: {
      screen: [{ glyph: 'tap', how: 'Get beside it and tap', what: 'Punch it before it wakes' }],
      pad: [{ how: 'Get beside it, press Punch', what: 'Punch it before it wakes' }],
      keys: [{ how: 'Get beside it, press J', what: 'Punch it before it wakes' }],
    },
  },

  // ───────────── Dangers ─────────────
  {
    id: 'water', chapter: 'dangers', title: 'Water', demo: 'water', pose: 'jump', open: { lesson: ['water'] },
    where: 'Coming up in World 2', riddle: 'Sloths can swim, but not here.',
    ...fromLesson('water'),
  },
  {
    id: 'crumble', chapter: 'dangers', title: 'Crumbling branches', demo: 'crumble', pose: 'run', open: { lesson: ['crumble'] },
    where: 'Learned in World 1', riddle: 'Creak...',
    ...fromLesson('crumble'),
  },
  {
    id: 'moving', chapter: 'dangers', title: 'Moving platforms', demo: 'moving', pose: 'stand', open: { lesson: ['moving'] },
    where: 'Coming up on your travels', riddle: 'Wait for it...',
    ...fromLesson('moving'),
  },
  {
    id: 'collapse', chapter: 'dangers', title: 'The collapsing branch', demo: 'collapse', pose: 'run',
    open: { tip: [tip('1-8', 'This branch goes on and on')], cleared: ['1-8'] },
    where: 'Found in World 1', riddle: 'Do not look back. Just run!',
    intro: 'Some branches break apart behind you. Keep moving and it can never catch you. If it does, you lose a heart and go back to the last flag.',
    lines: same([{ how: 'Keep going, do not stop', what: 'Stay ahead of it' }]),
  },
  {
    id: 'drops', chapter: 'dangers', title: 'Snakes from above', demo: 'drops', pose: 'punch',
    open: { tip: [['1-9', 'ring:go']], cleared: ['1-9'] },
    where: 'Found in World 1', riddle: 'Something is up in the canopy.',
    intro: 'Sometimes snakes drop out of the trees and block the way. Beat every one of them and the way opens.',
    lines: same([{ how: 'Punch and kick them all', what: 'Open the way' }]),
  },

  // ───────────── Finding things ─────────────
  {
    id: 'shrine', chapter: 'finding', title: 'The exit shrine', demo: 'shrine', pose: 'stand', open: { lesson: ['shrine'], cleared: ['1-1'] },
    where: 'Found in World 1', riddle: 'Every stage ends at one.',
    ...fromLesson('shrine'),
  },
  {
    id: 'goals', chapter: 'finding', title: 'Petals and goals', demo: 'goals', pose: 'run', open: { lesson: ['fruit'], cleared: ['1-2'] },
    where: 'Learned in World 1', riddle: 'Meeca left something behind.',
    intro: 'Some stages ask for something first: petals to gather, or snakes to beat. The yellow count at the top right shows how many. The shrine opens when you have enough.',
    lines: same([{ how: 'Watch the yellow count', what: 'Get enough, then reach the shrine' }]),
  },
  {
    id: 'heart', chapter: 'finding', title: 'Hearts', demo: 'heart', pose: 'stand', open: { lesson: ['heart'] },
    where: 'Found in World 1', riddle: 'Feeling a bit hurt?',
    ...fromLesson('heart'),
  },
  {
    id: 'power', chapter: 'finding', title: 'Power-ups', demo: 'power', pose: 'run', open: { lesson: ['power'] },
    where: 'Found in World 1', riddle: 'A little boost.',
    ...fromLesson('power'),
  },
  {
    id: 'flag', chapter: 'finding', title: 'Flags', demo: 'flag', pose: 'run', open: { lesson: ['checkpoint'] },
    where: 'Found in World 1', riddle: 'Halfway there!',
    ...fromLesson('checkpoint'),
  },
  {
    id: 'cage', chapter: 'finding', title: 'Friends in cages', demo: 'cage', pose: 'punch', open: { lesson: ['cage'] },
    where: 'Coming up in World 2', riddle: 'Someone needs your help.',
    ...fromLesson('cage'),
  },
  {
    id: 'finds', chapter: 'finding', title: 'Dot\'s finds', demo: 'finds', pose: 'stand', open: { lesson: ['idol'], found: (f) => f.length > 0 },
    where: 'Found in World 1', riddle: 'Something shiny, far away...',
    intro: 'Each world hides a note from Meeca, a keepsake and a photo book. Look high up and in out-of-the-way places. You can read them in the Library.',
    lines: same([{ how: 'Touch the glowing flower', what: 'Take the find' }]),
  },
  {
    id: 'ferns', chapter: 'finding', title: 'Hidden in the ferns', demo: 'ferns', pose: 'duck',
    open: { found: (f) => f.some((id) => /_(keepsake|book)$/.test(id)), cleared: ['1-5'] },
    where: 'Found in World 1', riddle: 'All ferns look alike. Or do they?',
    intro: 'Some finds are tucked inside a Hush Fern. Crouch beside it and wait a moment while Pokey searches.',
    lines: {
      screen: [{ glyph: 'down', how: 'Slide down beside the fern and hold', what: 'Search it' }],
      pad: [{ how: 'Hold Pad ↓ beside the fern', what: 'Search it' }],
      keys: [{ how: 'Hold S or ↓ beside the fern', what: 'Search it' }],
    },
  },
];

export const PAGE_BY_ID: Record<string, JournalPage> = Object.fromEntries(PAGES.map((p) => [p.id, p]));

// ───────────── what is open ─────────────

/** everything the unlock rules read, gathered once (so the rules are pure and testable) */
export interface Progress {
  lessons: ReadonlySet<string>;
  tipHeard: (stage: string, id: string) => boolean;
  cleared: (stage: string) => boolean;
  skills: ReadonlySet<string>;
  finds: string[];
}

export function isOpen(p: JournalPage, g: Progress): boolean {
  const o = p.open;
  if (o.always) return true;
  if (o.lesson?.some((l) => g.lessons.has(l))) return true;
  if (o.tip?.some(([s, id]) => g.tipHeard(s, id))) return true;
  if (o.cleared?.some((s) => g.cleared(s))) return true;
  if (o.skill && g.skills.has(o.skill)) return true;
  if (o.found?.(g.finds)) return true;
  return false;
}

function clearedOnDevice(stage: string): boolean {
  try {
    const raw = localStorage.getItem(`sloth_lvl_${stage}`);
    return !!raw && !!JSON.parse(raw)?.completed;
  } catch {
    return false;
  }
}

/** this device's progress, now. `?journal=all` opens every page (for trying it out) */
export function deviceProgress(): Progress {
  let all = false;
  try {
    all = new URLSearchParams(location.search).get('journal') === 'all';
  } catch {
    /* no window */
  }
  if (all) return { lessons: new Set(Object.keys(LESSONS)), tipHeard: () => true, cleared: () => true, skills: new Set(['shimmy', 'glide']), finds: ['w1_note', 'w1_keepsake'] };
  return { lessons: lessonsSeen(), tipHeard, cleared: clearedOnDevice, skills: learnedSkills(), finds: loadFinds() };
}

export function openPages(g: Progress = deviceProgress()): Set<string> {
  return new Set(PAGES.filter((p) => isOpen(p, g)).map((p) => p.id));
}

// ───────────── looked at, and announced ─────────────

const LOOKED = 'sloth_journal_looked';
const TOLD = 'sloth_journal_told';

function readSet(key: string): Set<string> | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    const v = JSON.parse(raw);
    return new Set(Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []);
  } catch {
    return null;
  }
}
function writeSet(key: string, s: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...s]));
  } catch {
    /* no storage: badges and notes may repeat, which is harmless */
  }
}

/** a page is NEW until its page has been opened once (the pages everyone starts with are never NEW) */
export function isNew(id: string, open: ReadonlySet<string>): boolean {
  if (!open.has(id) || PAGE_BY_ID[id]?.open.always) return false;
  return !(readSet(LOOKED)?.has(id) ?? false);
}
export function markLooked(id: string) {
  const s = readSet(LOOKED) ?? new Set<string>();
  if (s.has(id)) return;
  s.add(id);
  writeSet(LOOKED, s);
}

/**
 * Pages opened since they were last announced, to show the "new page" note during play, and remember them as announced.
 * The first time on a device (an older save meeting the journal) everything already open is taken as announced, so nobody gets a
 * flood of notes; those pages still show NEW in the journal.
 */
export function takeNewlyOpened(open: ReadonlySet<string> = openPages()): JournalPage[] {
  const told = readSet(TOLD);
  if (told === null) {
    writeSet(TOLD, new Set(open));
    return [];
  }
  const fresh = PAGES.filter((p) => open.has(p.id) && !told.has(p.id) && !p.open.always);
  if (fresh.length) {
    for (const p of fresh) told.add(p.id);
    writeSet(TOLD, told);
  }
  return fresh;
}

/** pages of a chapter, in order */
export function chapterPages(ch: ChapterId): JournalPage[] {
  return PAGES.filter((p) => p.chapter === ch);
}
