/**
 * The new HUD and Dot (beta): the hanging-vine HUD, Dot perched with her ring and arrow, and the thumb guides (Matt's picks, 2026-10-26).
 * Testers are live, so it is off by default on the real game and on by default in Matt's test link build (tools/testlink sets
 * `__NEW_LOOK_DEFAULT__`). A player's own choice in the pause menu wins either way.
 */
declare const __NEW_LOOK_DEFAULT__: boolean;

const KEY = 'sloth_new_look';

export const NEW_LOOK_DEFAULT: boolean = typeof __NEW_LOOK_DEFAULT__ !== 'undefined' ? __NEW_LOOK_DEFAULT__ : false;

function browserStore(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

export function newLookOn(store: Pick<Storage, 'getItem'> | null = browserStore()): boolean {
  try {
    const v = store?.getItem(KEY);
    if (v === '1') return true;
    if (v === '0') return false;
  } catch {
    /* ignore */
  }
  return NEW_LOOK_DEFAULT;
}

export function setNewLook(on: boolean, store: Pick<Storage, 'setItem'> | null = browserStore()): void {
  try {
    store?.setItem(KEY, on ? '1' : '0');
  } catch {
    /* ignore */
  }
}
