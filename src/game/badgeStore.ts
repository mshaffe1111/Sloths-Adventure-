/** Where the Trophy Room keeps its record: one small JSON entry in the browser's storage (and in save files). */
import { emptyCounters, emptyStore, type BadgeCounters, type BadgeStore } from './badges.ts';

export const BADGE_KEY = 'sloth_badges';
export const COSMETIC_KEY = 'sloth_cosmetic';

/** accept only a well-formed record; anything else is treated as empty */
export function parseBadgeStore(raw: string | null): BadgeStore {
  if (!raw) return emptyStore();
  try {
    const o = JSON.parse(raw);
    if (!o || typeof o !== 'object' || o.v !== 1) return emptyStore();
    const num = (x: unknown) => (typeof x === 'number' && isFinite(x) && x >= 0 ? x : 0);
    const rec = (x: unknown): Record<string, number> => {
      const out: Record<string, number> = {};
      if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) if (/^[a-z0-9_]{1,40}$/.test(k)) out[k] = num(v);
      return out;
    };
    return {
      v: 1,
      earned: rec(o.earned),
      kills: rec(o.kills),
      seen: Array.isArray(o.seen) ? o.seen.filter((s: unknown) => typeof s === 'string' && /^[a-z0-9_]{1,40}$/.test(s)).slice(0, 40) : [],
      // (counters added later are missing from older saves: they start at zero)
      counters: Object.fromEntries(Object.keys(emptyCounters()).map((k) => [k, num(o.counters?.[k])])) as unknown as BadgeCounters,
      quiet: Array.isArray(o.quiet) ? o.quiet.filter((s: unknown) => typeof s === 'string' && /^\d{1,2}-[0-9A-Z]{1,2}$/.test(s)).slice(0, 200) : [],
    };
  } catch {
    return emptyStore();
  }
}

export function loadBadgeStore(): BadgeStore {
  try {
    return parseBadgeStore(localStorage.getItem(BADGE_KEY));
  } catch {
    return emptyStore();
  }
}

export function saveBadgeStore(s: BadgeStore) {
  try {
    localStorage.setItem(BADGE_KEY, JSON.stringify(s));
  } catch {
    /* storage full or blocked: badges still count for this session */
  }
}

export type Cosmetic = 'none' | 'berry' | 'golden' | 'moonlight';
export interface CosmeticChoice {
  coat: Cosmetic;
  trail: boolean;
}

export function loadCosmetic(): CosmeticChoice {
  try {
    const o = JSON.parse(localStorage.getItem(COSMETIC_KEY) || 'null');
    const coat = ['berry', 'golden', 'moonlight'].includes(o?.coat) ? o.coat : 'none';
    return { coat, trail: o?.trail === true };
  } catch {
    return { coat: 'none', trail: false };
  }
}

export function saveCosmetic(c: CosmeticChoice) {
  try {
    localStorage.setItem(COSMETIC_KEY, JSON.stringify(c));
  } catch {
    /* ignore */
  }
}
