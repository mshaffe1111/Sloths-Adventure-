import { nativeApp } from './appShell.ts';

type AudioFocus = { want(o: { on: boolean }): Promise<void> };
// (held in a wrapper, never as the promise's value: a Capacitor plugin is a Proxy that answers `then`; see appShell.ts keepScreenOn)
let focusPlugin: Promise<{ plugin: AudioFocus }> | null = null;
/**
 * The Android app: whether the game wants Android's audio focus (sound on) or lets it go (muted), so a muted game never stops the
 * player's own music (PLAY-STORE-RULES §4). Asking again while the game holds it does nothing; AudioFocusPlugin.java answers with the
 * page's 'sloth-audio-focus' event ("back" when granted, "lost" when refused).
 */
export function wantAudioFocus(on: boolean) {
  if (!nativeApp()) return;
  focusPlugin ??= import('@capacitor/core').then(({ registerPlugin }) => ({ plugin: registerPlugin<AudioFocus>('AudioFocus') }));
  void focusPlugin.then(({ plugin }) => plugin.want({ on })).catch(() => {});
}
