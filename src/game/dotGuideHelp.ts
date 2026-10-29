/**
 * "Dot's help", the menu setting (the new look): how much she says.
 *   - Teach me: every tip.
 *   - Just reminders: no first-time teaching for a skill already seen on this phone; the goal, struggle help and the must-know lines.
 *   - Quiet: only the must-know lines (why an exit is locked, a sudden rule change) and the story lines the player opted into.
 * A device setting, like the sound and the controls. What has been taught is kept on the device too.
 */
import type { GuideLine } from './dotGuide.ts';

export type DotHelp = 'teach' | 'reminders' | 'quiet';
export const DOT_HELP_LABEL: Record<DotHelp, { name: string; blurb: string }> = {
  teach: { name: 'Teach me', blurb: 'Dot shows each new move once, right where you need it, and helps if you get stuck.' },
  reminders: { name: 'Just reminders', blurb: 'Dot skips moves you have seen before. She still says the goal and helps if you get stuck.' },
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

export function dotHelp(s: Pick<Storage, 'getItem'> | null = store()): DotHelp {
  try {
    const v = s?.getItem(HELP_KEY);
    return v === 'reminders' || v === 'quiet' ? v : 'teach';
  } catch {
    return 'teach';
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

/**
 * Does the setting let this line be said? `storyOn`: the "Story lines in stages" switch (story is not help, so it keeps its own switch;
 * the story lines only reach the guide when it is on).
 */
export function helpAllows(l: Pick<GuideLine, 'kind' | 'skill'>, help: DotHelp, seen: ReadonlySet<string>, storyOn = true): boolean {
  if (l.kind === 'story') return storyOn;
  if (l.kind === 'must') return true;
  if (help === 'quiet') return false;
  if (help === 'teach') return true;
  // Just reminders
  if (l.kind === 'danger' || l.kind === 'goal' || l.kind === 'struggle') return true;
  // first-time teaching only for what this phone has not seen yet; plain stage chatter and journal notes stay quiet
  if ((l.kind === 'teach' || l.kind === 'info') && l.skill) return !seen.has(l.skill);
  return false;
}

/**
 * "Skip tips" (Matt, 2026-10-26): one of Dot's tips carries a button that turns tips off ("Dot's help" to Quiet). It is offered once
 * per device, on her first tip from the second stage on (DOT-5, 2026-10-29: never on the first stage's coach lines, where a newcomer
 * tapping the bubble away turned Quiet on before learning to run), and only while the setting is still Teach me. A player who does
 * not tap it keeps Teach me. Quiet still says the must-know lines (why an exit is locked).
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
/** the first stage, whose coach lines teach the run and the jump: no Skip tips there */
export const FIRST_STAGE = '1-1';
/** does this line, just going up in stage `stageId`, carry the Skip tips button? (a tip from Dot; not a must-know line, a warning or a
 *  story; not in the first stage) */
export function offersSkip(l: Pick<GuideLine, 'kind' | 'who'>, help: DotHelp, stageId: string, s: Pick<Storage, 'getItem'> | null = store()): boolean {
  if (help !== 'teach' || stageId === FIRST_STAGE || l.who !== 'Dot') return false;
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
