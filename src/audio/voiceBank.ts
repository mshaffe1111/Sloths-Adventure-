/**
 * The story's voices once decoded (voice.ts fills it), and one syllable played from them: no file lists, so the conductor and the tests
 * can import it without Vite.
 */
import type { AudioCore } from './core.ts';
import type { Syllable } from './voiceLine.ts';

/** each voice's takes, by slug */
export const bank = new Map<string, AudioBuffer[]>();

export const voiceReady = (slug: string) => (bank.get(slug)?.length ?? 0) > 0;

/** one syllable of a voice, now; returns its length (s), 0 when the voice has not arrived */
export function playSyllable(core: AudioCore, slug: string, s: Syllable, gain = 1): number {
  const takes = bank.get(slug);
  if (!takes?.length) return 0;
  const buf = takes[s.take % takes.length];
  const c = core.ctx;
  const t = c.currentTime + 0.005;
  const src = c.createBufferSource();
  src.buffer = buf;
  // (a hair of jitter so a repeated word is never a copy)
  const rate = Math.pow(2, (s.semis + (Math.random() - 0.5) * 0.3) / 12);
  src.playbackRate.value = rate;
  const g = c.createGain();
  g.gain.value = gain * Math.pow(10, s.db / 20);
  src.connect(g);
  g.connect(core.withReverb(core.sfx, 0.06));
  src.start(t);
  return buf.duration / rate;
}
