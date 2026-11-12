/**
 * saveFile — export and import of a whole game as one small file.
 *
 * Progress lives in the browser's storage (stars, cleared stages, seen stories, the secret, the golden seeds). The file is
 * a plain JSON copy of exactly those entries plus a version and a checksum, so a damaged or hand-edited file is
 * refused rather than half-loaded. Only entries whose names are on the allow-list are ever read or written.
 *
 * The screens decide WHEN this is allowed (title screen and world map only, never during a stage); this module
 * has no opinion about screens.
 */
import { reloadDifficulty } from './difficulty.ts';
import { DOT_MEMORY, forgetDotSession } from './dotMemory.ts';
import { FIRST_NOTE_KEY, STORY_KEY, midStoryKey, moveV1GateFlags, worldStoryKey } from './storyFlags.ts';

export const SAVE_FORMAT = 'sloths-rainforest-adventures-save';
/** 2: the gate scene has its own story flag (storyFlags.ts C-01); a version-1 file's flags are moved as it is read */
export const SAVE_VERSION = 2;
/** a real save is a few KB; anything much bigger is not one of ours */
export const MAX_SAVE_BYTES = 200_000;
/**
 * one limit for every entry, far over the biggest the game writes (the Trophy Room, about 4 KB with everything earned):
 * saveRoundTrip.test.ts fills every key through its writer at its largest and keeps each under half of this. R-165.117: per-key
 * guesses (400 characters) refused the game's own file once 5-M was cleared or 34 things were found.
 */
export const MAX_ENTRY_CHARS = 16_000;

/**
 * Every key the game keeps in storage is one of three kinds (audit C saves #8: the lists were kept by hand and new keys landed on
 * none, so a New Game left them and a file never carried them; storageKeys.test.ts fails on a key in src that is on no list):
 *  - a game entry (ALLOWED): part of the adventure: a save file carries it, a New Game clears it;
 *  - this adventure on this phone (ON_THIS_PHONE): a New Game clears it, a save file does not carry it;
 *  - the device's own (everything else: controls, sound, help shown once per device, tester and debug switches): neither.
 */

/** the entries that make up a game */
export const ALLOWED: RegExp[] = [
  /^sloth_lvl_(\d{1,2}|S)-(\d{1,2}|[DM])$/, // per-stage result (and the extra stages, extraStages.ts: Dot's flight 4-D, Meeca's 5-M)
  /^sloth_play_(\d{1,2}|S)-(\d{1,2}|[DM])$/, // how a stage was played, for Pokey's journal (playRecords.ts; older games drop it unread)
  /^sloth_layout_(\d{1,2}|S)-(\d{1,2}|[DM])$/, // the layout a stage was first played with (it stays the same)
  STORY_KEY, // every "seen once" story flag (storyFlags.ts STORY_LETTERS: built there, so a new flag cannot be left off)
  /^sloth_way_\d{1,2}-\d{1,2}$/, // which in-stage asides have been heard (so a new game hears them again; the on/off switch is a device setting, not here)
  /^sloth_secret_gate$/,
  /^sloth_thorn_heart$/,
  /^sloth_seed_(\d{1,2}|S)-(\d{1,2}|[DM])_\w{1,24}$/, // the golden seeds found, per stage (protoStage.ts: a secret again in a new game)
  /^sloth_badges$/, // the Trophy Room
  /^sloth_finds$/, // the notes, books and keepsakes found
  /^sloth_memories$/, // the flashbacks seen
  /^sloth_cosmetic$/, // which reward Pokey wears
  /^sloth_difficulty$/, // Easy or Normal, picked at New Game (difficulty.ts)
  /^sloth_ease_in$/, // the stages played since a switch from Easy to Normal, while Easy's help fades out (difficulty.ts, LV-7)
  /^sloth_w5_cakes$/, // whether any cake was eaten in World 5 (w5Kit.ts: the Queen's line, and the badge for eating none)
  /^sloth_w5_carved$/, // what Meeca carved in her stage, and where (meecaCarved.ts: 5-6 shows it to Pokey)
  // sloth_coach_done, sloth_hint_v3 and sloth_howto_seen are NOT here on purpose: a help message is shown once per device. The sound
  // settings belong to the device too: a loaded file does not change this phone's mute or volumes (they were in the file up to 0.9.6;
  // an old file's are dropped as it is read)
];

/**
 * this adventure on this phone: a New Game clears these, a save file does not carry them. Dot's memory (her tips, the lessons, what she
 * has taught: dotMemory.ts), so a new adventure is taught again (Matt, 2026-10-29: tips once per save), and her help setting (a new save
 * starts on Help for Easy and Tips for Normal, dotGuideHelp.ts dotHelp); the stage a killed run comes back at (flagResume.ts); the
 * journal pages looked at and announced (movesJournal.ts: a new adventure's pages are new again)
 */
export const ON_THIS_PHONE: RegExp[] = [DOT_MEMORY, /^sloth_dot_help$/, /^sloth_flag_resume$/, /^sloth_journal_(told|looked)$/];

export const isSaveKey = (k: string) => ALLOWED.some((re) => re.test(k));
/** a key a New Game clears: a game entry, or this adventure on this phone */
export const isAdventureKey = (k: string) => isSaveKey(k) || ON_THIS_PHONE.some((re) => re.test(k));

export interface SaveFile {
  format: typeof SAVE_FORMAT;
  version: number;
  savedAt: string;
  summary: SaveSummary;
  data: Record<string, string>;
  checksum: string;
}

export interface SaveSummary {
  stagesCleared: number;
  stars: number;
  worldsStarted: number;
  secret: boolean;
}

/** a tiny storage interface so tests can use a Map */
export interface Store {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
  keys(): string[];
}

export function browserStore(): Store {
  return {
    getItem: (k) => localStorage.getItem(k),
    setItem: (k, v) => localStorage.setItem(k, v),
    removeItem: (k) => localStorage.removeItem(k),
    keys: () => {
      const out: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k) out.push(k);
      }
      return out;
    },
  };
}

/** FNV-1a over the sorted entries: catches truncation and accidental edits (not a security feature) */
export function checksum(data: Record<string, string>): string {
  let h = 0x811c9dc5;
  for (const k of Object.keys(data).sort()) {
    const s = `${k}=${data[k]};`;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
  }
  return h.toString(16).padStart(8, '0');
}

export function summarize(data: Record<string, string>): SaveSummary {
  let stagesCleared = 0;
  let stars = 0;
  const worlds = new Set<string>();
  for (const [k, v] of Object.entries(data)) {
    const m = /^sloth_lvl_(\d{1,2}|S)-\d{1,2}$/.exec(k);
    if (!m) continue;
    try {
      const o = JSON.parse(v);
      if (o && o.completed) stagesCleared++;
      if (o && typeof o.stars === 'number') stars += Math.max(0, Math.min(3, o.stars | 0));
      if (m[1] !== 'S') worlds.add(m[1]);
    } catch {
      /* skip */
    }
  }
  return { stagesCleared, stars, worldsStarted: worlds.size, secret: data['sloth_thorn_heart'] === '1' };
}

export function buildSave(store: Store, now = new Date()): SaveFile {
  const data: Record<string, string> = {};
  for (const k of store.keys()) {
    if (!isSaveKey(k)) continue;
    const v = store.getItem(k);
    if (v !== null) data[k] = v;
  }
  return { format: SAVE_FORMAT, version: SAVE_VERSION, savedAt: now.toISOString(), summary: summarize(data), data, checksum: checksum(data) };
}

export type ParseResult = { ok: true; save: SaveFile } | { ok: false; reason: string };

export function parseSave(text: string): ParseResult {
  if (text.length > MAX_SAVE_BYTES) return { ok: false, reason: 'That file is too big to be a Sloths save.' };
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'That file is not a readable save (it is not valid JSON).' };
  }
  if (!raw || typeof raw !== 'object') return { ok: false, reason: 'That file is not a Sloths save.' };
  const o = raw as Partial<SaveFile>;
  if (o.format !== SAVE_FORMAT) return { ok: false, reason: 'That file is not a Sloths Rainforest Adventures save.' };
  if (typeof o.version !== 'number' || o.version > SAVE_VERSION) return { ok: false, reason: 'That save was made by a newer version of the game.' };
  if (!o.data || typeof o.data !== 'object' || Array.isArray(o.data)) return { ok: false, reason: 'The save has no game data.' };
  const data: Record<string, string> = {};
  for (const [k, v] of Object.entries(o.data)) {
    if (!isSaveKey(k)) continue; // silently drop anything that is not ours
    if (typeof v !== 'string' || v.length > MAX_ENTRY_CHARS) return { ok: false, reason: 'The save contains damaged entries.' };
    data[k] = v;
  }
  // the checksum covers what was written: the kept entries, or the whole data when the file carried entries that are not ours
  if (typeof o.checksum !== 'string' || (o.checksum !== checksum(data) && o.checksum !== checksum(o.data as Record<string, string>))) {
    return { ok: false, reason: 'The save is damaged or was edited (its checksum does not match).' };
  }
  if (o.version < 2) moveV1GateFlags({ getItem: (k) => data[k] ?? null, setItem: (k, v) => void (data[k] = v), removeItem: (k) => void delete data[k] });
  // stage results must be well-formed
  for (const [k, v] of Object.entries(data)) {
    if (k.startsWith('sloth_lvl_')) {
      try {
        const lv = JSON.parse(v);
        if (!lv || typeof lv !== 'object') throw new Error('x');
      } catch {
        return { ok: false, reason: `Stage result ${k.replace('sloth_lvl_', '')} is damaged.` };
      }
    }
  }
  return { ok: true, save: { format: SAVE_FORMAT, version: SAVE_VERSION, savedAt: typeof o.savedAt === 'string' ? o.savedAt : '', summary: summarize(data), data, checksum: checksum(data) } };
}

/**
 * replace the current game with the one in the save, all or nothing (PLAY-STORE-RULES §6.8, a full phone): the file's entries are
 * written over the phone's first, and the phone's own entries the file does not have are removed only once every write has gone in.
 * When a write throws, what was written is taken back (the added entries first, which frees the room to put back the old values) and
 * the error goes on to the caller (SaveLoadDialog says it could not load), so the phone keeps the game it had.
 */
export function applySave(store: Store, save: SaveFile) {
  const before = new Map<string, string>();
  for (const k of store.keys()) {
    if (!isSaveKey(k)) continue;
    const v = store.getItem(k);
    if (v !== null) before.set(k, v);
  }
  const written: string[] = [];
  try {
    for (const [k, v] of Object.entries(save.data)) {
      written.push(k);
      store.setItem(k, v);
    }
  } catch (e) {
    for (const k of written) if (!before.has(k)) store.removeItem(k);
    for (const k of written) {
      const old = before.get(k);
      if (old === undefined) continue;
      try {
        store.setItem(k, old);
      } catch {
        /* the storage takes nothing more: the rest is put back */
      }
    }
    throw e;
  }
  for (const k of before.keys()) if (!(k in save.data)) store.removeItem(k);
  // what the replaced game did on this phone goes with it, as at a New Game (Dot's memory, the run flag, the journal marks)
  for (const k of store.keys()) if (!isSaveKey(k) && isAdventureKey(k)) store.removeItem(k);
  forgetDotSession();
  reloadDifficulty();
}

export function saveFileName(now = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `sloths-save-${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}.json`;
}

/**
 * Start over: forget every stage result, the stories seen and the secret, but keep the sound settings.
 * With `skipStory` every world's story beat is marked as seen, so the game goes straight to play.
 */
export function resetProgress(store: Store, opts: { skipStory?: boolean } = {}) {
  for (const k of store.keys()) if (isAdventureKey(k)) store.removeItem(k);
  forgetDotSession();
  reloadDifficulty();
  if (opts.skipStory) {
    for (let w = 1; w <= 10; w++) {
      store.setItem(worldStoryKey(w), '1');
      store.setItem(midStoryKey(w), '1');
    }
    store.setItem(FIRST_NOTE_KEY, '1');
  }
}
