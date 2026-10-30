/**
 * The game as the Android app (Play Store job, 2026-10-29). Two different questions:
 *   storeBuild()   was this bundle built for the store (`npm run build:store`, VITE_STORE_BUILD=1)? Then nothing that can send data
 *                  is in it (the control test's recorder and collector: playRecorder.ts), no service worker, no update check
 *                  (Matt: "nothing trackable at all"); tools/store/checkStoreBuild.mjs fails the build if any of it slips in.
 *   nativeApp()    is this page running inside the app's WebView (Capacitor) right now? Then the web-only buttons (install, save to
 *                  desktop, download the save file, the fullscreen switch) are hidden, and the Android back button is handled.
 */
type Env = { VITE_STORE_BUILD?: string };

export function storeBuild(): boolean {
  try {
    return (import.meta as unknown as { env?: Env }).env?.VITE_STORE_BUILD === '1';
  } catch {
    // (no import.meta.env outside a Vite build: the unit tests)
    return false;
  }
}

export function nativeApp(): boolean {
  try {
    const cap = (globalThis as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    return !!cap?.isNativePlatform?.();
  } catch {
    return false;
  }
}
