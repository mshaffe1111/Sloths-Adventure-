/**
 * Which guiding lines this device has already heard, per stage (Matt, 2026-10-23: Dot repeated "The petals go up" on a replay).
 * A stage tip or the goal line is said the first time a stage is played on this phone, and not again on replays or retries. The
 * lines that answer the moment (the late reminder, the sealed door) are not kept here: they are said whenever they apply.
 *
 * A tip counts as heard only once it has been SHOWN (polish report DOT-1): the engine marks it sent (markTipHeard), which keeps it from
 * being sent again in this session, and Dot's guide confirms it (confirmHeard) once its bubble has been up GUIDE.minShowMs. A tip the
 * help setting dropped, or that waited in her queue until it was old news, is never written down, so a player who turns tips back on
 * (or plays on later) still hears it. 93 lines in Worlds 1-4 were lost for good before this.
 */
const key = (stageId: string) => `sloth_tips_${stageId}`;

/** sent this session but not yet shown (stage -> ids): not sent again now, not kept on the phone */
const sent = new Map<string, Set<string>>();
/** the tips just marked sent, waiting for the line the engine says next (bindSent) */
let pending: Array<{ stageId: string; id: string }> = [];
/** the engine's words of a line -> the tips it carries, until it is shown */
const byText = new Map<string, Array<{ stageId: string; id: string }>>();

function read(stageId: string): Set<string> {
  try {
    const raw = localStorage.getItem(key(stageId));
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

/** has this tip (named by `id`) already been said in this stage on this device (or sent already this session)? */
export function tipHeard(stageId: string, id: string): boolean {
  return !!sent.get(stageId)?.has(id) || read(stageId).has(id);
}

/** has this tip been shown on this device (kept on the phone, not just sent this session)? */
export function tipKept(stageId: string, id: string): boolean {
  return read(stageId).has(id);
}

/** the tip is being sent now: not again this session. It is kept on the phone once its line has been shown (confirmHeard). */
export function markTipHeard(stageId: string, id: string): void {
  let s = sent.get(stageId);
  if (!s) sent.set(stageId, (s = new Set()));
  s.add(id);
  pending.push({ stageId, id });
}

/** the engine says a line: the tips just marked sent belong to it */
export function bindSent(text: string): void {
  if (!pending.length) return;
  const list = byText.get(text) ?? [];
  list.push(...pending);
  byText.set(text, list);
  pending = [];
}

/** a line (in the engine's words) has been shown for its minimum time: its tips are heard, for good */
export function confirmHeard(text: string): void {
  const list = byText.get(text);
  if (!list) return;
  byText.delete(text);
  for (const { stageId, id } of list) keep(stageId, id);
}

/** write a tip down as heard straight away (a tip with no line: the engine's own memory of a moment) */
export function keep(stageId: string, id: string): void {
  try {
    const s = read(stageId);
    if (s.has(id)) return;
    s.add(id);
    localStorage.setItem(key(stageId), JSON.stringify([...s]));
  } catch {
    /* no storage (a private window): the tip may be said again next time, which is harmless */
  }
}

/** forget what this session sent (a New Game, "Hear Dot's tips again", the tests) */
export function forgetSent(): void {
  sent.clear();
  byText.clear();
  pending = [];
}

/** the lesson lines heard on this device, whichever stage said them (StageHint.firstOf: a lesson is said once per save) */
export const FIRST_OF_STAGE = 'first-of';
