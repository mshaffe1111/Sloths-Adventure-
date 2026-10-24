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

/** the service worker in charge changed while this copy was open (a newer one installed itself and took over: see `autoUpdate` in vite.config.ts) */
let workerReplaced = false;
try {
  const sw = typeof navigator !== 'undefined' ? navigator.serviceWorker : undefined;
  if (sw?.controller) sw.addEventListener('controllerchange', () => (workerReplaced = true));
} catch {
  /* no service workers here */
}

/**
 * Wait (a little) for the new build's service worker to take charge, so the reload below is served the new game from its cache.
 * True once it has; false when nothing new is coming (offline, no service worker, the server has nothing newer) or it is taking too long.
 */
async function newWorkerInCharge(timeoutMs: number): Promise<boolean> {
  if (workerReplaced) return true;
  const sw = navigator.serviceWorker;
  if (!sw || navigator.onLine === false) return false;
  try {
    const reg = await sw.getRegistration();
    if (!reg) return false;
    const changed = new Promise<boolean>((resolve) => {
      sw.addEventListener('controllerchange', () => resolve(true), { once: true });
      window.setTimeout(() => resolve(workerReplaced), timeoutMs);
    });
    if (!reg.installing && !reg.waiting) await reg.update().catch(() => {});
    if (workerReplaced) return true;
    if (!reg.installing && !reg.waiting) return false;
    return await changed;
  } catch {
    return false;
  }
}

let applying: Promise<void> | null = null;

/**
 * Swap this open copy for the newest build. The new build's service worker fetches only the files that changed (the rest it keeps from
 * the cache) and takes over by itself; this waits a moment for that and reloads, so the cached game stays whole and still opens with no
 * network. Only when an update was tried in the last few minutes and the old build came back anyway (the player pressing the button again)
 * is the service worker let go, so the reload comes straight from the server; even then the cached files are kept for it to reuse.
 * Progress lives in the browser's storage and is not touched.
 */
export function applyUpdate(): Promise<void> {
  // App.tsx asks again every couple of seconds while it waits for a calm moment: one swap at a time
  if (applying) return applying;
  applying = (async () => {
    const triedJustNow = !autoUpdateAllowed();
    try {
      sessionStorage.setItem(APPLIED_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    const ready = await newWorkerInCharge(15 * 1000);
    if (!ready && triedJustNow && navigator.onLine !== false) {
      try {
        const regs = (await navigator.serviceWorker?.getRegistrations?.()) ?? [];
        await Promise.all(regs.map((r) => r.unregister()));
      } catch {
        /* carry on */
      }
    }
    window.location.reload();
  })();
  return applying;
}

/**
 * The control test's big Refresh button (ControlTestGate.tsx): the sure way to the newest build, whatever the phone has kept. It lets the
 * service worker go, empties its caches, and reloads with a fresh address so no cache (the browser's, the phone's, the server's) can hand
 * back the old page. The #ctest part of the address is kept. A tester's iPhone sat on a day-old build through several runs (2026-10-23);
 * this is for that. It costs one full download of the game, so it is a button, never automatic.
 */
export async function hardRefresh(): Promise<void> {
  try {
    const regs = (await navigator.serviceWorker?.getRegistrations?.()) ?? [];
    await Promise.all(regs.map((r) => r.unregister()));
  } catch {
    /* carry on */
  }
  try {
    if (typeof caches !== 'undefined') await Promise.all((await caches.keys()).map((k) => caches.delete(k)));
  } catch {
    /* carry on */
  }
  const u = new URL(window.location.href);
  u.searchParams.set('fresh', String(Date.now()));
  window.location.replace(u.toString());
}
