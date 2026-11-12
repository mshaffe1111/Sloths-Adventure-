/**
 * The Android app, killed mid-stage (the phone ran low on memory, the player swiped it away, the battery died): the next time that stage
 * starts, Pokey starts at the last flag he reached instead of the beginning (Play Store job, 2026-10-30). The flag is written when he
 * reaches it, with what the run held there (HeldRun), and forgotten whenever the stage ends the normal way (cleared, restarted, left for
 * the map or the title), so only a run that was cut off comes back. A resume puts the run back as it was at the flag, or it does not
 * resume: a flag without its run (an older save) starts the stage at the beginning. A day later it is forgotten too: by then a fresh
 * start is what a player expects.
 */
type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const KEY = 'sloth_flag_resume';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

/** what the run held when he reached the flag (engine.ts heldRun / restoreRun) */
export interface HeldRun {
  /** the stage clock, the lives left and the score */
  t: number;
  lives: number;
  score: number;
  /** the stage's pickups taken and its animals beaten, by their place in the built stage */
  got: number[];
  beat: number[];
  /** the run's counters by name (the goal's and the stage report's), and the animals beaten and seen by kind */
  n: Record<string, number>;
  kills: Record<string, number>;
  seen: string[];
}

export interface SavedFlag {
  id: string;
  x: number;
  y: number;
  at: number;
  run: HeldRun;
}

function store(): Store | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export function saveFlag(id: string, x: number, y: number, run: HeldRun, now = Date.now(), s: Store | null = store()) {
  try {
    s?.setItem(KEY, JSON.stringify({ id, x: Math.round(x), y: Math.round(y), at: now, run } satisfies SavedFlag));
  } catch {
    /* storage full or blocked: the stage just starts at the beginning */
  }
}

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isIndexList = (v: unknown): v is number[] => Array.isArray(v) && v.every((i) => Number.isInteger(i) && i >= 0);
const isCounts = (v: unknown): v is Record<string, number> =>
  !!v && typeof v === 'object' && !Array.isArray(v) && Object.values(v).every((n) => isNum(n) && n >= 0);

function heldRun(v: unknown): HeldRun | null {
  const r = v as Partial<HeldRun> | null;
  if (!r || typeof r !== 'object') return null;
  if (!isNum(r.t) || r.t < 0 || !isNum(r.lives) || r.lives < 1 || !isNum(r.score)) return null;
  if (!isIndexList(r.got) || !isIndexList(r.beat) || !isCounts(r.n) || !isCounts(r.kills)) return null;
  if (!Array.isArray(r.seen) || !r.seen.every((k) => typeof k === 'string')) return null;
  return { t: r.t, lives: r.lives, score: r.score, got: r.got, beat: r.beat, n: r.n, kills: r.kills, seen: r.seen };
}

/** the flag to start this stage at, and the run it puts back, if the last run of this same stage was cut off at one (recently) */
export function flagFor(id: string, now = Date.now(), s: Store | null = store()): { x: number; y: number; run: HeldRun } | null {
  try {
    const raw = s?.getItem(KEY);
    if (!raw) return null;
    const f = JSON.parse(raw) as Partial<SavedFlag>;
    if (f.id !== id || typeof f.x !== 'number' || typeof f.y !== 'number' || typeof f.at !== 'number') return null;
    if (!(now - f.at >= 0 && now - f.at < MAX_AGE_MS)) return null;
    const run = heldRun(f.run);
    if (!run) return null;
    return { x: f.x, y: f.y, run };
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
