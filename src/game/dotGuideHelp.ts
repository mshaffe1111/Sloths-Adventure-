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
 * "Skip tips" (Matt, 2026-10-26): Dot's very first tip on a phone carries a button that turns tips off ("Dot's help" to Quiet). It is
 * offered once per device, on the first tip she gives in a fresh game (nothing taught on this phone yet), and only while the setting is
 * still Teach me. A player who does not tap it keeps Teach me. Quiet still says the must-know lines (why an exit is locked).
 */
const SKIP_KEY = 'sloth_dot_skip_offered';
/** the words she says when it is tapped (about 2 s) */
export const SKIP_DONE = 'Tips off. Turn them back on in the Menu.';
export const SKIP_DONE_MS = 2200;

export function skipOffered(s: Pick<Storage, 'getItem'> | null = store()): boolean {
  try {
    return s?.getItem(SKIP_KEY) === '1';
  } catch {
    return true;
  }
}
/** does this line, just going up, carry the Skip tips button? (a tip from Dot; not a must-know line, a warning or a story) */
export function offersSkip(l: Pick<GuideLine, 'kind' | 'who'>, help: DotHelp, seen: ReadonlySet<string>, s: Pick<Storage, 'getItem'> | null = store()): boolean {
  if (help !== 'teach' || seen.size > 0 || l.who !== 'Dot') return false;
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
