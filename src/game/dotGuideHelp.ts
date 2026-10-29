/**
 * "Dot's help", the menu setting (the new look): how much she says (Matt, 2026-10-29: she was "constantly nagging").
 *   - Help (stored as 'teach'): for new players. Every tip, each new move where it is needed, and the next step of a puzzle after more
 *     struggle. Still calm: one line at a time, 10 s apart, never the answer on walking in.
 *   - Tips (stored as 'reminders'): each new thing once per save, the warnings the first time, why an exit is locked, and help only
 *     after real struggle (dotTips.ts). 30 s at least between lines that can wait.
 *   - Quiet: only the must-know lines (why an exit is locked, a sudden rule change) and the story lines the player opted into.
 * A device setting, like the sound and the controls. What has been taught is kept in the save (a New Game teaches it again).
 */
import type { GuideLine } from './dotGuide.ts';

export type DotHelp = 'teach' | 'reminders' | 'quiet';
export const DOT_HELP_LABEL: Record<DotHelp, { name: string; blurb: string }> = {
  teach: { name: 'Help', blurb: 'Dot shows each new move, and helps more when you are stuck.' },
  reminders: { name: 'Tips', blurb: 'Dot explains each new thing once, and helps if you struggle.' },
  quiet: { name: 'Quiet', blurb: 'Dot only speaks when she must, such as why an exit is locked.' },
};

type Mem = Pick<Storage, 'getItem' | 'setItem'>;
const HELP_KEY = 'sloth_dot_help';
const SEEN_KEY = 'sloth_dot_seen';
const store = (): Mem | null => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
};

/**
 * the setting: what the player picked, or by the difficulty picked at New Game (Matt, 2026-10-29): Help on Easy (the newcomer's pick),
 * Tips on Normal
 */
export function dotHelp(s: Pick<Storage, 'getItem'> | null = store()): DotHelp {
  try {
    const v = s?.getItem(HELP_KEY);
    if (v === 'teach' || v === 'reminders' || v === 'quiet') return v;
    return s?.getItem('sloth_difficulty') === 'easy' ? 'teach' : 'reminders';
  } catch {
    return 'reminders';
  }
}
export function setDotHelp(v: DotHelp, s: Pick<Storage, 'setItem'> | null = store()): void {
  try {
    s?.setItem(HELP_KEY, v);
  } catch {
    /* ignore */
  }
}

/** the skills Dot has taught (or seen done) on this phone */
export function seenSkills(s: Pick<Storage, 'getItem'> | null = store()): Set<string> {
  try {
    const raw = s?.getItem(SEEN_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}
export function markSkillSeen(skill: string, s: Mem | null = store()): void {
  try {
    if (!s) return;
    const cur = seenSkills(s);
    if (cur.has(skill)) return;
    cur.add(skill);
    s.setItem(SEEN_KEY, JSON.stringify([...cur]));
  } catch {
    /* ignore */
  }
}

/**
 * The moves this phone has done in a stage (Dot toned down, Matt 2026-10-28): a stage tip that teaches one of them again (climbing in
 * World 2 to someone who climbed all of World 1) is not said in a later stage. Not the crouch (a bush or a fern to hide in is a thing
 * of its own, taught where it first appears) nor the push (a log). The first-time lessons are per device already (lessons.ts).
 */
const MOVES_KEY = 'sloth_dot_moves';
export const UNCUT_MOVES: ReadonlySet<string> = new Set(['crouch', 'push']);
export function movesDone(s: Pick<Storage, 'getItem'> | null = store()): Set<string> {
  try {
    const raw = s?.getItem(MOVES_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}
export function markMoveDone(move: string, s: Mem | null = store()): void {
  try {
    if (!s) return;
    const cur = movesDone(s);
    if (cur.has(move)) return;
    cur.add(move);
    s.setItem(MOVES_KEY, JSON.stringify([...cur]));
  } catch {
    /* ignore */
  }
}
/** a stage tip (not a first-time lesson, not the first stage's coach, not a thing's tip) for a move done in an earlier stage */
export function knownMoveTip(l: Pick<GuideLine, 'kind' | 'move' | 'thing' | 'source'>, before: ReadonlySet<string>): boolean {
  return l.kind === 'teach' && !!l.move && !l.thing && l.source === 'engine' && !UNCUT_MOVES.has(l.move) && before.has(l.move);
}

/** the skill that says a Tips line has been taught (seen once, it is not said again on Tips) */
type TipsLine = Pick<GuideLine, 'kind'> & Partial<Pick<GuideLine, 'skill' | 'mech' | 'step' | 'key' | 'move' | 'thing' | 'source'>>;
export function tipsSkill(l: TipsLine): string | undefined {
  if (l.mech) return `mech:${l.mech}`;
  return l.skill;
}

/**
 * Does the setting let this line be said? `storyOn`: the "Story lines in stages" switch (story is not help, so it keeps its own switch;
 * the story lines only reach the guide when it is on).
 */
export function helpAllows(l: TipsLine, help: DotHelp, seen: ReadonlySet<string>, storyOn = true): boolean {
  // (the wayside story beats keep their own switch; a stage's own story chatter in play is for Help)
  if (l.kind === 'story') return storyOn && (l.source === 'story' || help === 'teach');
  if (l.kind === 'must') return true;
  if (help === 'quiet') return false;
  // (the shrine opening: the other half of why an exit is locked, on Tips too)
  if (l.key === 'goal:done') return true;
  // (a puzzle's move itself is only ever for Help, and only after struggle)
  if (l.step === 'move') return help === 'teach';
  if (help === 'teach') return true;
  // Tips (dotTips.ts): a nudge after real struggle; help after two deaths in one spot (not the clock's stuck help, not the kicks)
  if (l.step === 'nudge') return true;
  if (l.kind === 'struggle') return l.source === 'struggle' && !!l.key?.startsWith('struggle:death');
  // a puzzle's first line only when its thing is brand new; its other moments are chatter
  if (l.step) return !!l.mech && !seen.has(`mech:${l.mech}`);
  // the first time: a lesson, the first stage's coach, a move never done, a new thing, a warning
  const k = tipsSkill(l);
  // (a warning only when it is about a new hazard: the same warning again, each time the eagle passes, is a reminder)
  if (l.kind === 'danger' && !l.mech) return false;
  if (l.source === 'lesson' || l.source === 'coach' || l.mech || l.thing) return !!k && !seen.has(k);
  if (l.kind === 'teach' && l.move) return !!k && !seen.has(k);
  // reminders, the goal again, chatter, journal notes
  return false;
}

/**
 * "Skip tips" (Matt, 2026-10-26): one of Dot's first tips on a phone carries a button that turns tips off ("Dot's help" to Quiet). It is
 * offered once per device, on her first tip after the first stage (never on 1-1's coach lines: DOT-5). A player who does not tap it
 * keeps the setting. Quiet still says the must-know lines (why an exit is locked).
 */
const SKIP_KEY = 'sloth_dot_skip_offered';
/** the words she says when it is tapped (about 2 s) */
export const SKIP_DONE = 'Tips off. Turn them back on in the Menu.';
export const SKIP_DONE_MS = 2200;
/**
 * the button only takes a tap once the bubble has been up this long (ms), and only a touch that went down on the button itself:
 * Dot's first tip comes in the opening seconds, while the thumb is busy with the game, and a tap meant for a punch or a jump that
 * landed on it turned a first-timer's teaching off (QA: Cheddarbob played on Quiet from his first second). Until then the button
 * is faded and lets the touch through to the game.
 */
export const SKIP_ARM_MS = 1200;
/** does this press of Skip tips count? (`shownMs`: how long the bubble has been up; `downHere`: the touch began on the button;
 *  `keyboard`: pressed with a key, which is always on purpose) */
export function skipTapCounts(shownMs: number, downHere: boolean, keyboard = false): boolean {
  if (keyboard) return true;
  return downHere && shownMs >= SKIP_ARM_MS;
}

export function skipOffered(s: Pick<Storage, 'getItem'> | null = store()): boolean {
  try {
    return s?.getItem(SKIP_KEY) === '1';
  } catch {
    return true;
  }
}
/** does this line, just going up, carry the Skip tips button? (a tip from Dot; not a must-know line, a warning or a story) */
export function offersSkip(l: Pick<GuideLine, 'kind' | 'who'> & Partial<Pick<GuideLine, 'source'>>, help: DotHelp, stageId: string, s: Pick<Storage, 'getItem'> | null = store()): boolean {
  // (not on the first stage's coach lines: a newcomer tapping the bubble away turned tips off before learning to run, DOT-5)
  if (help === 'quiet' || l.who !== 'Dot' || l.source === 'coach' || stageId === '1-1') return false;
  if (l.kind !== 'teach' && l.kind !== 'info' && l.kind !== 'goal' && l.kind !== 'struggle') return false;
  return !skipOffered(s);
}
export function markSkipOffered(s: Pick<Storage, 'setItem'> | null = store()): void {
  try {
    s?.setItem(SKIP_KEY, '1');
  } catch {
    /* ignore */
  }
}
/** the button was tapped: tips off (Quiet) */
export function skipTips(s: Pick<Storage, 'setItem'> | null = store()): DotHelp {
  setDotHelp('quiet', s);
  markSkipOffered(s);
  return 'quiet';
}
