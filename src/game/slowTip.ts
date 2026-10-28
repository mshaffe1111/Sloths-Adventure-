/**
 * slowTip — a one-time tip for a phone that cannot run the game smoothly (Matt, 2026-10-28). Sally's phone ran at 1-3 fps for 52
 * minutes, most likely inside an app's own browser (Facebook's), which can draw without the graphics chip.
 *
 * Shown once per device, never again after OK:
 *   - at the title, when the page is opened inside an app (Facebook, Instagram, ...): those browsers are the usual cause;
 *   - in play, when the picture is already at its lightest and still under 10 frames a second for 15 seconds of play.
 * The tip only suggests; it never stops the game.
 */
import { inAppOf } from './deviceInfo.ts';

/** a frame gap this long or longer is under 10 frames a second */
export const SLOW_GAP_MS = 100;
/** this much play that slow, at the lightest picture, before the tip */
export const SLOW_FOR_MS = 15000;
const SHOWN_KEY = 'sloth_slowtip_shown';

export function slowTipShown(): boolean {
  try {
    return localStorage.getItem(SHOWN_KEY) === '1';
  } catch {
    return false;
  }
}

export function markSlowTipShown() {
  try {
    localStorage.setItem(SHOWN_KEY, '1');
  } catch {
    /* private mode: it may show again next time, which is harmless */
  }
}

/** the tip's words for this browser: which app it is in, and the browser to open instead */
export function slowTipText(ua: string): string {
  const browser = /iPhone|iPad/.test(ua) ? 'Safari' : 'Chrome';
  const app = inAppOf(ua);
  if (app) return `You're playing inside ${app}. For smooth play, open this page in ${browser}: tap the ⋯ menu and choose "Open in browser".`;
  return `This browser is struggling to keep up. For smooth play, try the game in ${browser}.`;
}

/** counts slow play at the lightest picture; `feed` says true once, when the tip is due */
export class SlowWatch {
  private ms = 0;
  private fired = false;

  /** one frame: its real gap, the governor's last window average, and whether the picture is already at its lightest */
  feed(gapMs: number, avgMs: number, lightest: boolean): boolean {
    if (this.fired) return false;
    if (!lightest || avgMs < SLOW_GAP_MS) {
      this.ms = 0;
      return false;
    }
    this.ms += Math.min(gapMs, 1000);
    if (this.ms < SLOW_FOR_MS) return false;
    this.fired = true;
    return true;
  }
}
