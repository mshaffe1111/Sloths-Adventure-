/**
 * How each stage was actually played, for Pokey's journal (Matt, 2026-10-31: "after every level, it should have a note about how he played
 * it or what happened"). One small entry per stage, `sloth_play_<id>`, in the browser's storage and in save files (saveFile.ts).
 *
 * It keeps the FIRST clear as it happened (the journal is written that day and does not change), plus how many times the stage was
 * played and cleared, the best time, and the most stars. Saves from before this existed simply have no entries: the journal then
 * writes a plainer line for those stages (pokeyJournal.ts), so nothing breaks and nothing is lost.
 */
import type { StageStats } from './badges.ts';

export const PLAY_PREFIX = 'sloth_play_';
export const playKey = (id: string) => `${PLAY_PREFIX}${id}`;

/** the first clear, as it went */
export interface FirstClear {
  /** seconds */
  t: number;
  /** lives lost (falls and knock-outs) and hearts lost */
  ll: number;
  hl: number;
  /** flowers picked, of the stage's total */
  fl: number;
  ft: number;
  /** stars */
  st: number;
  /** predators knocked out, and the kind knocked out most (if any) */
  k: number;
  kt?: string;
  /** stomps in a row (best chain), friends freed, vines swung */
  ch: number;
  fr: number;
  sw: number;
  /** the finds of this stage held when it was cleared, and medals earned on this clear */
  fd: string[];
  md: string[];
  /** Easy or Normal */
  e?: 1;
  /** when (ms since 1970, rounded to the minute) */
  d: number;
}

export interface PlayRecord {
  v: 1;
  /** plays and clears */
  n: number;
  w: number;
  /** best time and most stars over all clears */
  bt?: number;
  bs?: number;
  first?: FirstClear;
}

const ID_RE = /^[a-z0-9_]{1,40}$/;
const num = (x: unknown, max = 1e7) => (typeof x === 'number' && isFinite(x) && x >= 0 ? Math.min(max, Math.round(x)) : 0);
const ids = (x: unknown, n: number) => (Array.isArray(x) ? x.filter((s): s is string => typeof s === 'string' && ID_RE.test(s)).slice(0, n) : []);

/** accept only a well-formed record; anything else reads as "never played" */
export function parsePlayRecord(raw: string | null): PlayRecord | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw);
    if (!o || typeof o !== 'object' || o.v !== 1) return null;
    const r: PlayRecord = { v: 1, n: num(o.n), w: num(o.w) };
    if (o.bt != null) r.bt = num(o.bt);
    if (o.bs != null) r.bs = num(o.bs, 3);
    const f = o.first;
    if (f && typeof f === 'object') {
      r.first = {
        t: num(f.t), ll: num(f.ll, 99), hl: num(f.hl, 999), fl: num(f.fl, 9999), ft: num(f.ft, 9999), st: num(f.st, 3),
        k: num(f.k, 9999), ch: num(f.ch, 999), fr: num(f.fr, 999), sw: num(f.sw, 9999), fd: ids(f.fd, 8), md: ids(f.md, 12), d: num(f.d, 1e14),
      };
      if (typeof f.kt === 'string' && ID_RE.test(f.kt)) r.first.kt = f.kt;
      if (f.e === 1) r.first.e = 1;
    }
    return r;
  } catch {
    return null;
  }
}

/** fold one run into the stage's record */
export function withRun(prev: PlayRecord | null, s: StageStats, extra: { finds: string[]; medals: string[]; now: number }): PlayRecord {
  const r: PlayRecord = prev ? { ...prev } : { v: 1, n: 0, w: 0 };
  r.n += 1;
  if (!s.win) return r;
  r.w += 1;
  const t = Math.round(s.timeSec);
  r.bt = r.bt ? Math.min(r.bt, t) : t;
  r.bs = Math.max(r.bs ?? 0, s.stars);
  if (!r.first) {
    let k = 0;
    let kt: string | undefined;
    let most = 0;
    for (const [type, n] of Object.entries(s.kills)) {
      k += n;
      if (n > most && ID_RE.test(type)) [most, kt] = [n, type];
    }
    r.first = {
      t, ll: s.livesLost, hl: s.heartsLost, fl: s.floraCollected, ft: s.floraTotal, st: s.stars, k, ch: s.maxStompChain, fr: s.freed ?? 0,
      sw: s.swings ?? 0, fd: extra.finds.filter((x) => ID_RE.test(x)).slice(0, 8), md: extra.medals.filter((x) => ID_RE.test(x)).slice(0, 12),
      d: Math.round(extra.now / 60000) * 60000,
    };
    if (kt) r.first.kt = kt;
    if (s.difficulty === 'easy') r.first.e = 1;
  }
  return r;
}

export function loadPlayRecord(id: string): PlayRecord | null {
  try {
    return parsePlayRecord(localStorage.getItem(playKey(id)));
  } catch {
    return null;
  }
}

/** every stage's record on this device */
export function loadPlayRecords(): Record<string, PlayRecord> {
  const out: Record<string, PlayRecord> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(PLAY_PREFIX)) continue;
      const r = parsePlayRecord(localStorage.getItem(k));
      if (r) out[k.slice(PLAY_PREFIX.length)] = r;
    }
  } catch {
    /* storage blocked: an empty journal, still readable */
  }
  return out;
}

export function savePlayRecord(id: string, r: PlayRecord) {
  try {
    localStorage.setItem(playKey(id), JSON.stringify(r));
  } catch {
    /* storage full or blocked: the journal falls back to its plain line for this stage */
  }
}
