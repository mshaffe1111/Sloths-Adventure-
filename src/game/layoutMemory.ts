import type { LevelConfig } from './types.ts';
import { rollLayoutVariant } from './stageGenerator.ts';
import { isW1Stage, w1RollDistance } from './w1Sections.ts';

/**
 * layoutMemory — a stage keeps its layout until you clear it.
 *
 * The first time you enter a stage it gets a random layout number, saved on the device. Every visit until it is cleared
 * (a retry after losing, coming back after leaving) uses the same number, so the stage you are learning stays put. Clearing
 * it forgets the number (Matt's choice, 2026-10-23), so a replay of a cleared stage rolls a fresh layout. A New Game clears
 * the numbers too (they are part of the save).
 * The boss lairs and the secret stage have one designed layout and need no number.
 *
 * World 1 (the variety pass, 2026-10-28; ledger C-rows): a cleared stage keeps its last layout number as "p<n>" (the entry reads as
 * no layout, so the next visit still rolls fresh), and the fresh roll is kept away from it: a roll that repeats any of its section
 * versions (w1Sections.ts w1RollDistance, a cheap stand-in for the era tool's action 3-grams: the versions are what make those differ)
 * is rolled again, up to 24 times, and the farthest is kept. So a roll closer than 0.35 to the player's last one never comes back
 * while a farther one can be found, and the version they last played is not picked again.
 */
export const layoutKey = (id: string) => `sloth_layout_${id}`;

interface Mem {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem?(k: string): void;
}

function browserMem(): Mem | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

/** a saved layout number, or null when the stage has not been entered yet (or the entry is damaged) */
export function savedLayout(id: string, mem: Mem | null = browserMem()): number | null {
  try {
    const raw = mem?.getItem(layoutKey(id));
    const n = raw == null ? NaN : Number(raw);
    return Number.isInteger(n) && n >= 1 && n <= 1_000_000 ? n : null;
  } catch {
    return null;
  }
}

/**
 * The layout number to use on entering this stage. `?layout=fixed` and `?layout=N` (for testing) win and are never saved.
 * `roll` is injectable for tests.
 */
export function layoutForEntry(
  lvl: Pick<LevelConfig, 'id' | 'objectiveType' | 'secret'>,
  mem: Mem | null = browserMem(),
  roll: () => number | null = rollLayoutVariant,
  override: boolean = hasLayoutOverride(),
): number | null {
  if (override) return roll();
  if (lvl.objectiveType === 'boss_lair' || lvl.secret) return roll();
  const kept = savedLayout(lvl.id, mem);
  if (kept != null) return kept;
  const prev = isW1Stage(lvl.id) ? lastLayout(lvl.id, mem) : null;
  const fresh = prev != null ? awayFrom(lvl.id, prev, roll) : roll();
  if (fresh != null) {
    try {
      mem?.setItem(layoutKey(lvl.id), String(fresh));
    } catch {
      /* storage full or blocked: the layout simply is not remembered */
    }
  }
  return fresh;
}

function hasLayoutOverride(): boolean {
  try {
    return new URLSearchParams(window.location.search).get('layout') != null;
  } catch {
    return false;
  }
}

/** the stage was cleared: forget its layout, so the next visit rolls a fresh one (World 1 keeps it as the last one played, "p<n>") */
export function forgetLayout(id: string, mem: Mem | null = browserMem()): void {
  try {
    const n = savedLayout(id, mem);
    if (n != null && isW1Stage(id)) mem?.setItem(layoutKey(id), `p${n}`);
    else mem?.removeItem?.(layoutKey(id));
  } catch {
    /* storage blocked: the stage simply keeps its layout */
  }
}

/** the layout number a World 1 stage was last cleared with, or null */
export function lastLayout(id: string, mem: Mem | null = browserMem()): number | null {
  try {
    const raw = mem?.getItem(layoutKey(id));
    const n = raw && raw.startsWith('p') ? Number(raw.slice(1)) : NaN;
    return Number.isInteger(n) && n >= 1 && n <= 1_000_000 ? n : null;
  } catch {
    return null;
  }
}

/** how far a fresh roll should be from the last one (0..1, w1RollDistance), and the tries to find one that far */
export const AWAY = { min: 0.35, tries: 24 } as const;

/** a fresh roll as far from the last one played as can be found: every section version different, or else the farthest of the tries */
function awayFrom(id: string, prev: number, roll: () => number | null): number | null {
  let best = roll();
  if (best == null || !isW1Stage(id)) return best;
  let far = w1RollDistance(id, prev, best);
  for (let k = 1; k < AWAY.tries && far < 1; k++) {
    const c = roll();
    if (c == null) break;
    const d = w1RollDistance(id, prev, c);
    if (d > far) { best = c; far = d; }
  }
  return best;
}
