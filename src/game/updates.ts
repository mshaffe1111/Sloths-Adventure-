/**
 * Spotting a newer build of the game while an old one is open.
 *
 * The build writes `version.json` next to the game with the same stamp the game carries inside it (`BUILD_TIME`). A copy that was left open
 * asks for that file now and then (when the title shows, when the player comes back to the tab, every few minutes); if the stamp is not its own
 * a newer build has been published. This does not depend on the service worker noticing, so it also covers browsers and installs where that
 * is slow or missing. `applyUpdate` then swaps the open copy for the new build: App.tsx does it by itself at the title or the world map,
 * and the player can do it from a button (the title, the pause menu), since a stage in progress is never interrupted without being asked.
 */
import { BUILD_TIME } from './version.ts';

/** true when the published stamp is a different one from this copy's own (an empty stamp on either side means "cannot tell") */
export function versionDiffers(remote: unknown, local: string): boolean {
  return typeof remote === 'string' && remote !== '' && local !== '' && remote !== local;
}

let available = false;
const listeners = new Set<() => void>();

export function updateAvailable(): boolean {
  return available;
}
export function subscribeUpdate(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
/** note that a newer build exists (from the version file, or from the service worker installing one) */
export function markUpdateAvailable() {
  if (available) return;
  available = true;
  listeners.forEach((f) => f());
  try {
    window.dispatchEvent(new Event('sloth-update-ready'));
  } catch {
    /* no window */
  }
}

export type UpdateCheck = 'new' | 'same' | 'unknown';

/** asks the server which build is current. 'unknown' when offline, in a preview, or in a build with no stamp. */
export async function checkForUpdate(): Promise<UpdateCheck> {
  if (available) return 'new';
  if (!BUILD_TIME || typeof fetch === 'undefined') return 'unknown';
  try {
    const base = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/';
    const res = await fetch(`${base}version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return 'unknown';
    const body = (await res.json()) as { build?: unknown };
    if (typeof body.build !== 'string' || body.build === '') return 'unknown';
    if (versionDiffers(body.build, BUILD_TIME)) {
      markUpdateAvailable();
      // let the service worker fetch the new files too, so the reload below finds them
      navigator.serviceWorker?.getRegistration().then((r) => r?.update()).catch(() => {});
      return 'new';
    }
    return 'same';
  } catch {
    return 'unknown';
  }
}

const APPLIED_KEY = 'sloth_update_applied_at';
/**
 * Whether the page may reload by itself for an update. If it just did (this tab, in the last few minutes) and the old build still came back,
 * say a cached page, reloading again would loop: the button stays, the automatic reload waits.
 */
export function autoUpdateAllowed(now = Date.now()): boolean {
  try {
    const at = Number(sessionStorage.getItem(APPLIED_KEY));
    return !(at > 0 && now - at < 3 * 60 * 1000);
  } catch {
    return true;
  }
}

/**
 * Swap this open copy for the newest build. The old copy's cached files are cleared first, so the reload cannot be served the old game by the
 * service worker (which installs itself again on the way back in). Progress lives in the browser's storage and is not touched.
 */
export async function applyUpdate(): Promise<void> {
  try {
    sessionStorage.setItem(APPLIED_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
  try {
    const regs = (await navigator.serviceWorker?.getRegistrations?.()) ?? [];
    await Promise.all(regs.map((r) => r.unregister()));
  } catch {
    /* carry on */
  }
  try {
    const keys = (await globalThis.caches?.keys?.()) ?? [];
    await Promise.all(keys.map((k) => globalThis.caches.delete(k)));
  } catch {
    /* carry on */
  }
  window.location.reload();
}
