/**
 * saveSlots: three named explorers on one phone, each with their own game (Matt, 2026-11-04: "my wife wanted to start a new one, and
 * the only way to do that is to clear cache").
 *
 * How it works (the swap model): the game keeps reading and writing the same storage keys it always has. Those live keys ARE the
 * explorer who is playing now. Each explorer who is not playing is kept whole, as one JSON copy of their keys, under
 * `sloth_slot_data_<n>`. Changing explorer copies the player's keys out, clears them, and copies the next explorer's keys in. Nothing
 * else in the game has to know slots exist.
 *
 * Why this way (reference/menus/save-slots/PLAN.md):
 *  - today's single save needs no migration at all: it simply is slot 1 (its keys stay where they are, byte for byte);
 *  - an older version of the game installed over this one still plays the explorer who was playing, and never touches the copies
 *    (they match none of its patterns), so rolling back loses nothing;
 *  - a switch is journalled: the outgoing copy is written and read back before anything is cleared, the incoming copy is deleted last,
 *    and a switch cut off at any step is finished on the next start (recoverSlots).
 *
 * Which keys belong to an explorer and which to the phone is decided here, once (keyClass); a test scans the source tree so every
 * storage key the game uses is in one class or the other (saveSlots.test.ts).
 */
import { isSaveKey, summarize, type Store, type SaveSummary } from './saveFile.ts';
import { DOT_MEMORY } from './dotMemory.ts';

export const SLOT_COUNT = 3;
/** which slot is playing now (1-3); the phone's */
export const ACTIVE_KEY = 'sloth_slot_active';
/** the explorers' names and dates; the phone's */
export const META_KEY = 'sloth_slots';
/** a switch in progress (written before the player's keys are touched, deleted when the switch is complete) */
export const JOURNAL_KEY = 'sloth_slot_switch';
/** the whole copy of an explorer who is not playing now */
export const dataKey = (n: number) => `sloth_slot_data_${n}`;
/** the copy's own format; a copy made by a newer game is never opened, changed or erased by this one */
export const SLOT_DATA_VERSION = 1;
export const NAME_MAX = 14;

/** the phone's sound: shared by everyone who plays on it */
const SOUND = /^sloth_(music_vol|sfx_vol|game_muted)$/;
/**
 * Everything about one explorer's adventure that is NOT in the backup file's list (saveFile.ts ALLOWED) but is still theirs: Dot's
 * memory and help level, the golden seeds and Dot's silk they found, a stage cut off mid-run (flagResume), what Pokey's journal has
 * shown them, the guardians' intros already seen (story_b: a retry gets the short one), and the first-time teaching (a new explorer is a new person, so How to Play and the touch coach greet them too).
 */
const PLAYER_EXTRA = /^sloth_(story_b\d{1,2}|dot_help|seed_.+|dot_silk|flag_resume|journal_told|journal_looked|dot_skip_offered|howto_seen|coach_done)$/;
/**
 * How each person likes to play: controls, the two assists, jump help, screen shake, buzz and Dot's asides. Per explorer, so a left-
 * handed child and a parent each keep their own (waiting on Matt's word: PLAN.md question 1; moving them to the phone is this one line).
 */
const PERSON_SETTINGS = /^sloth_(ctl_(hand|side|style|sens)|assist_(lives|speed)|jump_help|shake|haptics|wayside_off)$/;
/** the phone's own: full screen, the slot list itself, performance and tester switches, the art previews, the update stamp */
const DEVICE =
  /^sloth_(slot_active|slots|slot_switch|slot_data_\d+|fullscreen|fs_tip|perf|show_touches|slowtip_shown|update_applied_at|test_unlock|ctest_name|polish|rim|venom|hero|boa|caiman|eagle|frog|harpy|jaguar|jennifur|ocelot|snake|spider|tayra|birds|butterflies|castles|flowers|leaves|plants)$/;

export type KeyClass = 'player' | 'device' | 'unknown';
export function keyClass(k: string): KeyClass {
  if (SOUND.test(k) || DEVICE.test(k)) return 'device';
  if (isSaveKey(k) || DOT_MEMORY.test(k) || PLAYER_EXTRA.test(k) || PERSON_SETTINGS.test(k)) return 'player';
  return 'unknown';
}
/** a key that moves with its explorer (an unknown key stays on the phone: worst case it is shared, never lost) */
export const isPlayerKey = (k: string) => keyClass(k) === 'player';

export interface SlotMeta {
  /** the name the explorer gave (empty: the slot is free) */
  name: string;
  /** when it was last played (ms) */
  playedAt: number;
}
export interface SlotCopy {
  v: number;
  data: Record<string, string>;
}
export interface SlotInfo {
  n: number;
  name: string;
  playing: boolean;
  /** nothing saved in it and no name */
  empty: boolean;
  /** made by a newer version of the game: shown, never opened or erased here */
  newer: boolean;
  summary: SaveSummary;
  /** the furthest stage reached ("3-4"), or null */
  furthest: string | null;
  playedAt: number;
}

const defaultName = (n: number) => `Explorer ${n}`;

export function readMeta(store: Store): SlotMeta[] {
  let raw: unknown = null;
  try {
    raw = JSON.parse(store.getItem(META_KEY) ?? 'null');
  } catch {
    raw = null;
  }
  const list = Array.isArray(raw) ? raw : [];
  return Array.from({ length: SLOT_COUNT }, (_, i) => {
    const m = list[i] as Partial<SlotMeta> | undefined;
    return { name: typeof m?.name === 'string' ? m.name.slice(0, NAME_MAX) : '', playedAt: typeof m?.playedAt === 'number' ? m.playedAt : 0 };
  });
}
function writeMeta(store: Store, meta: SlotMeta[]) {
  store.setItem(META_KEY, JSON.stringify(meta));
}

export function activeSlot(store: Store): number {
  const n = Number(store.getItem(ACTIVE_KEY));
  return Number.isInteger(n) && n >= 1 && n <= SLOT_COUNT ? n : 1;
}

/** the playing explorer's keys, as they are now */
export function livePlayerData(store: Store): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of store.keys()) if (isPlayerKey(k)) out[k] = store.getItem(k) ?? '';
  return out;
}

export function readCopy(store: Store, n: number): SlotCopy | null {
  const raw = store.getItem(dataKey(n));
  if (raw == null) return null;
  try {
    const o = JSON.parse(raw) as Partial<SlotCopy>;
    if (typeof o.v !== 'number' || !o.data || typeof o.data !== 'object') return { v: Number.MAX_SAFE_INTEGER, data: {} };
    return { v: o.v, data: o.data as Record<string, string> };
  } catch {
    // unreadable: treat as "not ours to touch" rather than as empty, so it is never overwritten by mistake
    return { v: Number.MAX_SAFE_INTEGER, data: {} };
  }
}

const hasProgress = (s: SaveSummary) => s.stagesCleared > 0 || s.stars > 0 || s.worldsStarted > 0;

function furthestStage(data: Record<string, string>): string | null {
  let best: { w: number; s: number } | null = null;
  for (const [k, v] of Object.entries(data)) {
    const m = /^sloth_lvl_(\d{1,2})-(\d{1,2})$/.exec(k);
    if (!m) continue;
    try {
      if (!JSON.parse(v)?.completed) continue;
    } catch {
      continue;
    }
    const w = Number(m[1]);
    const s = Number(m[2]);
    if (!best || w > best.w || (w === best.w && s > best.s)) best = { w, s };
  }
  return best ? `${best.w}-${best.s}` : null;
}

/** the three slots, for the "Who's playing?" card */
export function listSlots(store: Store): SlotInfo[] {
  const meta = readMeta(store);
  const on = activeSlot(store);
  return meta.map((m, i) => {
    const n = i + 1;
    const playing = n === on;
    const copy = playing ? { v: SLOT_DATA_VERSION, data: livePlayerData(store) } : readCopy(store, n);
    const newer = !!copy && copy.v > SLOT_DATA_VERSION;
    const data = newer || !copy ? {} : copy.data;
    const summary = summarize(data);
    const empty = !playing && !newer && !m.name && !hasProgress(summary);
    return { n, name: m.name || (playing || hasProgress(summary) ? defaultName(n) : ''), playing, empty, newer, summary, furthest: furthestStage(data), playedAt: m.playedAt };
  });
}

/** the name of the explorer playing now */
export const playingName = (store: Store) => listSlots(store).find((s) => s.playing)?.name ?? defaultName(1);

export function renameSlot(store: Store, n: number, name: string) {
  const meta = readMeta(store);
  meta[n - 1] = { ...meta[n - 1], name: cleanName(name) || defaultName(n) };
  writeMeta(store, meta);
}
/** a name as typed: trimmed, inner runs of space made one, cut to NAME_MAX */
export const cleanName = (s: string) => s.replace(/\s+/g, ' ').trim().slice(0, NAME_MAX);

export type SwitchResult = { ok: true } | { ok: false; reason: 'full' | 'newer' | 'same' };

/**
 * Change who is playing to slot `to`. The steps are ordered so a stop at any point loses nothing (PLAN.md "Kill at any step"):
 *  1. the playing explorer's keys are copied to their slot and read back (the phone being full stops it here, nothing changed);
 *  2. the journal is written; 3. their live keys are cleared; 4. the next explorer's copy is put in; 5. the active slot is set;
 *  6. the journal goes; 7. the next explorer's copy goes (the live keys are theirs now).
 * The page reloads afterwards (App.tsx), so every module reads the new explorer's keys from scratch.
 */
export function switchSlot(store: Store, to: number, now = Date.now()): SwitchResult {
  const from = activeSlot(store);
  if (to === from) return { ok: false, reason: 'same' };
  const incoming = readCopy(store, to);
  if (incoming && incoming.v > SLOT_DATA_VERSION) return { ok: false, reason: 'newer' };
  const out = JSON.stringify({ v: SLOT_DATA_VERSION, data: livePlayerData(store) } satisfies SlotCopy);
  try {
    store.setItem(dataKey(from), out);
    if (store.getItem(dataKey(from)) !== out) throw new Error('read-back');
    store.setItem(JOURNAL_KEY, JSON.stringify({ from, to }));
  } catch {
    // the phone is full: undo the half-written copy only if it is ours from this try (the old copy, if any, was already stale)
    try {
      store.removeItem(JOURNAL_KEY);
    } catch {
      /* nothing more to do */
    }
    return { ok: false, reason: 'full' };
  }
  const meta = readMeta(store);
  meta[from - 1] = { ...meta[from - 1], name: meta[from - 1].name || defaultName(from), playedAt: meta[from - 1].playedAt || now };
  meta[to - 1] = { ...meta[to - 1], playedAt: now };
  writeMeta(store, meta);
  finishSwitch(store, from, to);
  return { ok: true };
}

function finishSwitch(store: Store, from: number, to: number) {
  for (const k of store.keys()) if (isPlayerKey(k)) store.removeItem(k);
  const incoming = readCopy(store, to);
  if (incoming && incoming.v <= SLOT_DATA_VERSION) for (const [k, v] of Object.entries(incoming.data)) if (isPlayerKey(k)) store.setItem(k, v);
  store.setItem(ACTIVE_KEY, String(to));
  store.removeItem(JOURNAL_KEY);
  store.removeItem(dataKey(to));
  void from;
}

/**
 * At start, before anything reads the game: a switch cut off part way (the phone died, the app was swiped away) is finished. Only
 * steps 3-7 can be left over, and they are safe to run again: the outgoing copy was written and read back before the journal existed,
 * and the incoming copy is deleted last, so it is still there to put in.
 */
export function recoverSlots(store: Store): 'none' | 'finished' {
  const raw = store.getItem(JOURNAL_KEY);
  if (raw == null) return 'none';
  let j: { from?: number; to?: number } = {};
  try {
    j = JSON.parse(raw);
  } catch {
    j = {};
  }
  const ok = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= SLOT_COUNT;
  if (!ok(j.from) || !ok(j.to) || store.getItem(dataKey(j.from)) == null) {
    // a journal we can't trust: change nothing about the live keys, just drop it (the live keys are whoever was playing)
    store.removeItem(JOURNAL_KEY);
    return 'none';
  }
  finishSwitch(store, j.from, j.to);
  return 'finished';
}

/**
 * Erase one explorer who is NOT playing (the playing one is erased by New Game, which already offers the backup: NewGameDialog).
 * A copy made by a newer game is never erased here.
 */
export function eraseSlot(store: Store, n: number): boolean {
  if (n === activeSlot(store)) return false;
  const copy = readCopy(store, n);
  if (copy && copy.v > SLOT_DATA_VERSION) return false;
  store.removeItem(dataKey(n));
  const meta = readMeta(store);
  meta[n - 1] = { name: '', playedAt: 0 };
  writeMeta(store, meta);
  return true;
}

/** the first free slot, or null when all three are taken */
export const freeSlot = (store: Store) => listSlots(store).find((s) => s.empty)?.n ?? null;

/** an inactive explorer's keys, for a backup file made before erasing them */
export const slotData = (store: Store, n: number): Record<string, string> =>
  n === activeSlot(store) ? livePlayerData(store) : (readCopy(store, n)?.data ?? {});
