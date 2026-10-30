/**
 * The Android app, killed mid-stage (the phone ran low on memory, the player swiped it away, the battery died): the next time that stage
 * starts, Pokey starts at the last flag he reached instead of the beginning (Play Store job, 2026-10-30). The flag is written when he
 * reaches it and forgotten whenever the stage ends the normal way (cleared, restarted, left for the map or the title), so only a run that
 * was cut off comes back. A day later it is forgotten too: by then a fresh start is what a player expects.
 */
type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const KEY = 'sloth_flag_resume';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export interface SavedFlag {
  id: string;
  x: number;
  y: number;
  at: number;
}

function store(): Store | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export function saveFlag(id: string, x: number, y: number, now = Date.now(), s: Store | null = store()) {
  try {
    s?.setItem(KEY, JSON.stringify({ id, x: Math.round(x), y: Math.round(y), at: now } satisfies SavedFlag));
  } catch {
    /* storage full or blocked: the stage just starts at the beginning */
  }
}

/** the flag to start this stage at, if the last run of this same stage was cut off at one (recently) */
export function flagFor(id: string, now = Date.now(), s: Store | null = store()): { x: number; y: number } | null {
  try {
    const raw = s?.getItem(KEY);
    if (!raw) return null;
    const f = JSON.parse(raw) as Partial<SavedFlag>;
    if (f.id !== id || typeof f.x !== 'number' || typeof f.y !== 'number' || typeof f.at !== 'number') return null;
    if (!(now - f.at >= 0 && now - f.at < MAX_AGE_MS)) return null;
    return { x: f.x, y: f.y };
  } catch {
    return null;
  }
}

export function clearFlag(s: Store | null = store()) {
  try {
    s?.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
