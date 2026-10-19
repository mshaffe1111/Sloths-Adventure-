import type { LevelConfig } from './types.ts';
import { rollLayoutVariant } from './stageGenerator.ts';

/**
 * layoutMemory — a stage keeps the layout it was first played with.
 *
 * The first time you enter a stage it gets a random layout number, saved on the device. Every later visit (replaying
 * a cleared stage, coming back after leaving) uses the same number, so the stage is the same stage. A stage you have
 * never entered stays unrolled, so it is still a surprise. A New Game clears the numbers (they are part of the save).
 * The boss lairs and the secret stage have one designed layout and need no number.
 */
export const layoutKey = (id: string) => `sloth_layout_${id}`;

interface Mem {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
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
  const fresh = roll();
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
