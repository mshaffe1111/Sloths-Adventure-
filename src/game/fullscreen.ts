/**
 * Full screen (Matt, 2026-10-23: "I'd rather have it full screen"). The game asks for full screen on the first tap or key press,
 * in whichever way the device is held, and asks again on a later tap if the browser let it go, unless the player turned it off.
 * The corner button (and the Menu) turns it off or on, and that choice is kept on the device.
 *
 * A browser only allows full screen from inside a tap, so it cannot happen before the first one. iPhones let no web page go full
 * screen at all (only videos): there the game is full screen only when it is added to the Home Screen, and the button is hidden.
 */
import { enterWideMode, leaveWideMode } from './wideMode.ts';
import { nativeApp } from './appShell.ts';

const KEY = 'sloth_fullscreen';
const TIP_KEY = 'sloth_fs_tip';

type Doc = Document & { webkitFullscreenElement?: Element | null; webkitFullscreenEnabled?: boolean };

function store(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

/** the player wants full screen (the default) */
export function fullscreenWanted(s: Pick<Storage, 'getItem'> | null = store()): boolean {
  try {
    return s?.getItem(KEY) !== '0';
  } catch {
    return true;
  }
}
export function setFullscreenWanted(on: boolean, s: Pick<Storage, 'setItem' | 'removeItem'> | null = store()): void {
  try {
    if (on) s?.removeItem(KEY);
    else s?.setItem(KEY, '0');
  } catch {
    /* no storage: it just will not be remembered */
  }
}

/** this browser can put a page in full screen */
export function fullscreenSupported(): boolean {
  if (typeof document === 'undefined') return false;
  const d = document as Doc;
  return !!(d.fullscreenEnabled || d.webkitFullscreenEnabled);
}

/** launched from the Home Screen (or as an installed app): already without browser bars */
export function launchedAsApp(): boolean {
  // the Play Store app runs full screen by itself (MainActivity hides the bars), so it never offers the web full-screen switch
  if (nativeApp()) return true;
  try {
    // (a page put in full screen by the button also matches display-mode: fullscreen, so that only counts when no element is full screen)
    return (
      (matchMedia('(display-mode: fullscreen)').matches && !isFullscreen()) ||
      matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    );
  } catch {
    return false;
  }
}

export function isFullscreen(): boolean {
  if (typeof document === 'undefined') return false;
  const d = document as Doc;
  return !!(d.fullscreenElement || d.webkitFullscreenElement);
}

/** turn it on or off from the button, and remember the choice */
export function toggleFullscreen(): boolean {
  const on = !isFullscreen();
  setFullscreenWanted(on);
  if (on) enterWideMode();
  else leaveWideMode();
  return on;
}

/** an iPhone (or an iPad that cannot do it) in the browser: say once how to get full screen, by adding the game to the Home Screen */
export function homeScreenTipDue(): boolean {
  if (typeof navigator === 'undefined' || fullscreenSupported() || launchedAsApp()) return false;
  if (!/iPhone|iPod|iPad|Macintosh/.test(navigator.userAgent) || !('ontouchend' in document)) return false;
  try {
    return store()?.getItem(TIP_KEY) !== '1';
  } catch {
    return false;
  }
}
export function markHomeScreenTip(): void {
  try {
    store()?.setItem(TIP_KEY, '1');
  } catch {
    /* ignore */
  }
}

let armed = false;
/** from now on, a tap or a key press puts the game in full screen when the player wants it and it is not already */
export function armFullscreen(): void {
  if (armed || typeof window === 'undefined') return;
  armed = true;
  const go = (e: Event) => {
    if (!fullscreenWanted() || isFullscreen() || !fullscreenSupported() || launchedAsApp()) return;
    // the full-screen button handles its own tap (it would otherwise be undone by this one)
    if ((e.target as Element | null)?.closest?.('[data-fs-toggle]')) return;
    // Escape (and F11) is the player leaving full screen through the browser: never answer it by going straight back in
    if (e instanceof KeyboardEvent && (e.key === 'Escape' || e.key === 'F11' || e.repeat)) return;
    enterWideMode();
  };
  window.addEventListener('pointerup', go, true);
  window.addEventListener('keydown', go, true);
}
