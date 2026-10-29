/**
 * The phone's buzz (AN-9, polish report 1, 2026-10-29): the button presses had one (TouchController), and nothing that happens TO Pokey
 * did. Now a hurt, a hard landing, a boss's slam, a flag and a clear each have their own pattern, all behind the "Vibration" setting
 * (menuParts.tsx, on unless turned off, kept on the device). iPhone browsers ignore navigator.vibrate: there the on-screen feedback carries
 * it (CT-14), and the setting says so.
 */
type Mem = Pick<Storage, 'getItem' | 'setItem'>;
const KEY = 'sloth_haptics';
const store = (): Mem | null => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
};

let on: boolean | null = null;
export function hapticsOn(s: Pick<Storage, 'getItem'> | null = store()): boolean {
  if (on === null) {
    try {
      on = s?.getItem(KEY) !== 'off';
    } catch {
      on = true;
    }
  }
  return on;
}
export function setHaptics(v: boolean, s: Pick<Storage, 'setItem'> | null = store()): void {
  on = v;
  try {
    s?.setItem(KEY, v ? 'on' : 'off');
  } catch {
    /* storage blocked: the choice lasts for this visit */
  }
}

/** the patterns (ms: buzz, pause, buzz...) */
export const HAPTIC = {
  hurt: [40],
  hardLand: [20],
  bossSlam: [25, 30, 60],
  checkpoint: [15, 70, 15],
  clear: [30, 60, 30, 60, 90],
} as const;
export type HapticKind = keyof typeof HAPTIC;

/** can this browser buzz at all (not on an iPhone) */
export const canBuzz = (): boolean => typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

/** buzz `ms` (a number or a pattern), when the setting is on and the phone can */
export function vibrate(ms: number | readonly number[]): void {
  if (!hapticsOn() || !canBuzz()) return;
  try {
    navigator.vibrate(typeof ms === 'number' ? ms : [...ms]);
  } catch {
    /* ignore */
  }
}
export function buzz(kind: HapticKind): void {
  vibrate(HAPTIC[kind]);
}
