/**
 * Which guiding lines this device has already heard, per stage (Matt, 2026-10-23: Dot repeated "The petals go up" on a replay).
 * A stage tip or the goal line is said the first time a stage is played on this phone, and not again on replays or retries. The
 * lines that answer the moment (the late reminder, the sealed door) are not kept here: they are said whenever they apply.
 */
const key = (stageId: string) => `sloth_tips_${stageId}`;

function read(stageId: string): Set<string> {
  try {
    const raw = localStorage.getItem(key(stageId));
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

/** has this tip (named by `id`) already been said in this stage on this device? */
export function tipHeard(stageId: string, id: string): boolean {
  return read(stageId).has(id);
}

/** remember that this tip has been said */
export function markTipHeard(stageId: string, id: string): void {
  try {
    const s = read(stageId);
    if (s.has(id)) return;
    s.add(id);
    localStorage.setItem(key(stageId), JSON.stringify([...s]));
  } catch {
    /* no storage (a private window): the tip may be said again next time, which is harmless */
  }
}
