/** Wide mode: take the whole screen when play starts. */

/** go fullscreen (the browser bars go away). Safe to call anywhere; it only works inside a tap. */
export function enterWideMode() {
  try {
    const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };
    if (document.fullscreenElement) return;
    const req = el.requestFullscreen?.bind(el) ?? el.webkitRequestFullscreen?.bind(el);
    // navigationUI hides the Android gesture bar hint
    const r = req?.({ navigationUI: 'hide' } as FullscreenOptions) as Promise<void> | undefined;
    r?.catch(() => {});
  } catch {
    /* iPhone Safari has no fullscreen for pages; an installed app already is */
  }
}

export function leaveWideMode() {
  try {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
  } catch {
    /* ignore */
  }
}
