/**
 * meecaCarved — what Meeca carved in her stage (5-M), kept with the game (saveFile.ts lists the key, so it goes with a save file, a
 * new game starts with none, and loading a save brings that game's back): each warning's words, and where along the sanctuary path she
 * cut it. 5-6 is the stage where Pokey finds them; it is not built yet, so this is its hook: `carvingsForPokey()` gives it the words in
 * the order she cut them, each with `along` (0 at the start of her stage, 1 at its end) for 5-6 to put on its own trees in the same order
 * and the same share of the way along, and `high` for the one cut up on a branch.
 */
export const CARVED_KEY = 'sloth_w5_carved';

export interface CarvedWarning {
  /** meecaLines.ts MEECA_WARNINGS id ('sit', 'eat', 'tea', 'silk', 'look') */
  id: string;
  lines: string[];
  /** how far along her stage she cut it, 0..1 */
  along: number;
  /** cut up on a branch (the fourth tree) */
  high: boolean;
  /** how many times a guard walked her back before it was done */
  caught: number;
}

export interface CarvedRecord {
  v: 1;
  carvings: CarvedWarning[];
  /** she cut every one, and the stage cleared */
  done: boolean;
}

type Store = Pick<Storage, 'getItem' | 'setItem'> | null;
function store(): Store {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

const IDS = new Set(['sit', 'eat', 'tea', 'silk', 'look']);

/** only a well-formed record counts; anything else is nothing carved */
export function parseCarved(raw: string | null): CarvedRecord {
  const none: CarvedRecord = { v: 1, carvings: [], done: false };
  if (!raw) return none;
  try {
    const o = JSON.parse(raw);
    if (!o || o.v !== 1 || !Array.isArray(o.carvings)) return none;
    const carvings: CarvedWarning[] = [];
    for (const c of o.carvings) {
      if (!c || typeof c.id !== 'string' || !IDS.has(c.id) || carvings.some((k) => k.id === c.id)) continue;
      if (!Array.isArray(c.lines) || !c.lines.every((l: unknown) => typeof l === 'string' && l.length <= 16) || c.lines.length > 6) continue;
      const along = Number(c.along);
      carvings.push({ id: c.id, lines: c.lines, along: Number.isFinite(along) ? Math.max(0, Math.min(1, along)) : 0, high: !!c.high, caught: Math.max(0, Math.min(99, Math.floor(Number(c.caught) || 0))) });
    }
    return { v: 1, carvings, done: !!o.done && carvings.length > 0 };
  } catch {
    return none;
  }
}

export function loadCarved(s: Store = store()): CarvedRecord {
  try {
    return parseCarved(s?.getItem(CARVED_KEY) ?? null);
  } catch {
    return parseCarved(null);
  }
}

function save(r: CarvedRecord, s: Store) {
  try {
    s?.setItem(CARVED_KEY, JSON.stringify(r));
  } catch {
    /* storage full or blocked: the carving still counts in this run */
  }
}

/** a warning was cut (a replay cuts it again: the newest place wins) */
export function recordCarving(c: CarvedWarning, s: Store = store()): CarvedRecord {
  const r = loadCarved(s);
  const next: CarvedRecord = { v: 1, carvings: [...r.carvings.filter((k) => k.id !== c.id), c], done: r.done };
  save(next, s);
  return next;
}

/** the stage cleared with every warning cut */
export function markCarvingsDone(s: Store = store()): CarvedRecord {
  const r = loadCarved(s);
  const next: CarvedRecord = { ...r, done: r.carvings.length > 0 };
  save(next, s);
  return next;
}

/**
 * The hook for 5-6 (not built yet): the warnings Meeca cut in this game, in the order they lie along the way (her first first), for
 * Pokey to find on the trees where she cut them. Empty until her stage has been played.
 */
export function carvingsForPokey(s: Store = store()): CarvedWarning[] {
  return [...loadCarved(s).carvings].sort((a, b) => a.along - b.along);
}
