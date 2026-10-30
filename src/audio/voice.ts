/**
 * The story's voices (story-delivery, Matt 2026-10-30): each character's babble, made by tools/audio/voices/synth.py, one small mp3 a
 * voice (src/assets/voices/<slug>.mp3, 7-15 KB) holding its takes with silence between. A story loads the voices of the people in it as
 * it opens (`loadVoices`); each file is decoded once (at 24 kHz where the browser allows: sfxRecLoader.ts) and cut at its silences.
 * `playSyllable` plays one take on the effects bus, so the mute and the effects volume govern it like any other sound. Until a voice has
 * arrived its lines are simply silent.
 */
import type { AudioCore } from './core.ts';
import { bytesOf } from './sampleLoader.ts';
import { decode } from './sfxRecLoader.ts';
import type { Syllable } from './voiceLine.ts';
import { cutTakes } from './voiceCut.ts';

const files = import.meta.glob('../assets/voices/*.mp3', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const urlOf = (slug: string) => Object.entries(files).find(([p]) => p.endsWith(`/${slug}.mp3`))?.[1];

const bank = new Map<string, AudioBuffer[]>();
const loading = new Map<string, Promise<void>>();

/** fetch and decode these voices (once each) */
export function loadVoices(core: AudioCore, slugs: Iterable<string>): Promise<void> {
  const jobs: Promise<void>[] = [];
  for (const slug of slugs) {
    let p = loading.get(slug);
    if (!p) {
      const url = urlOf(slug);
      p = url
        ? bytesOf(url)
            .then((b) => decode(core, b))
            .then((buf) => void bank.set(slug, cutTakes(core.ctx, buf)))
            .catch(() => {
              loading.delete(slug);
            })
        : Promise.resolve();
      loading.set(slug, p);
    }
    jobs.push(p);
  }
  return Promise.all(jobs).then(() => undefined);
}

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
