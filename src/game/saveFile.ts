/**
 * saveFile — export and import of a whole game as one small file.
 *
 * Progress lives in the browser's storage (stars, cleared stages, seen stories, the secret, volume). The file is
 * a plain JSON copy of exactly those entries plus a version and a checksum, so a damaged or hand-edited file is
 * refused rather than half-loaded. Only entries whose names are on the allow-list are ever read or written.
 *
 * The screens decide WHEN this is allowed (title screen and world map only, never during a stage); this module
 * has no opinion about screens.
 */

export const SAVE_FORMAT = 'sloths-rainforest-adventures-save';
export const SAVE_VERSION = 1;
/** a real save is a few KB; anything much bigger is not one of ours */
export const MAX_SAVE_BYTES = 200_000;
/** one stage result or flag is tiny; the Trophy Room record grows with every trophy (about 30 characters each), so it gets more room */
const MAX_ENTRY_CHARS = 400;
const MAX_BADGE_ENTRY_CHARS = 12_000;
const entryLimit = (k: string) => (k === 'sloth_badges' ? MAX_BADGE_ENTRY_CHARS : MAX_ENTRY_CHARS);

/** the entries that make up a game */
const ALLOWED: RegExp[] = [
  /^sloth_lvl_(\d{1,2}|S)-\d{1,2}$/, // per-stage result
  /^sloth_layout_(\d{1,2}|S)-\d{1,2}$/, // the layout a stage was first played with (it stays the same)
  /^sloth_story_w\d{1,2}$/, // world intro seen
  /^sloth_secret_gate$/,
  /^sloth_thorn_heart$/,
  /^sloth_music_vol$/,
  /^sloth_sfx_vol$/,
  /^sloth_game_muted$/,
  /^sloth_badges$/, // the Trophy Room
  /^sloth_finds$/, // the notes, books and keepsakes found
  /^sloth_memories$/, // the flashbacks seen
  /^sloth_cosmetic$/, // which reward Slomatt wears
  /^sloth_lessons$/, // which first-time lessons have been shown (a New Game shows them again)
  /^sloth_coach_done$/, // the first-stage lesson has been given (a New Game gives it again)
];

export const isSaveKey = (k: string) => ALLOWED.some((re) => re.test(k));

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
    if (typeof v !== 'string' || v.length > entryLimit(k)) return { ok: false, reason: 'The save contains damaged entries.' };
    data[k] = v;
  }
  // the checksum covers what was written, so compare against the original data only if nothing was dropped
  const claimed = Object.entries(o.data).filter(([k]) => isSaveKey(k));
  if (claimed.length !== Object.keys(o.data).length) {
    /* unknown entries were present; fall through to compare on the kept ones below */
  }
  if (typeof o.checksum !== 'string' || (o.checksum !== checksum(data) && o.checksum !== checksum(o.data as Record<string, string>))) {
    return { ok: false, reason: 'The save is damaged or was edited (its checksum does not match).' };
  }
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
  return { ok: true, save: { format: SAVE_FORMAT, version: o.version, savedAt: typeof o.savedAt === 'string' ? o.savedAt : '', summary: summarize(data), data, checksum: checksum(data) } };
}

/** replace the current game with the one in the save */
export function applySave(store: Store, save: SaveFile) {
  for (const k of store.keys()) if (isSaveKey(k)) store.removeItem(k);
  for (const [k, v] of Object.entries(save.data)) store.setItem(k, v);
}

export function saveFileName(now = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `sloths-save-${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}.json`;
}

/** the settings that belong to the device, not to an adventure: a new game keeps them */
const KEEP_ON_NEW_GAME = /^sloth_(music_vol|sfx_vol|game_muted)$/;

/**
 * Start over: forget every stage result, the stories seen and the secret, but keep the sound settings.
 * With `skipStory` every world's story beat is marked as seen, so the game goes straight to play.
 */
export function resetProgress(store: Store, opts: { skipStory?: boolean } = {}) {
  for (const k of store.keys()) if (isSaveKey(k) && !KEEP_ON_NEW_GAME.test(k)) store.removeItem(k);
  if (opts.skipStory) for (let w = 1; w <= 10; w++) store.setItem(`sloth_story_w${w}`, '1');
}
