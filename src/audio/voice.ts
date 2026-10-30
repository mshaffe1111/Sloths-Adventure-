/**
 * The story's voices (story-delivery, Matt 2026-10-30): each character's babble, made by tools/audio/voices/synth.py, one small mp3 a
 * voice (src/assets/voices/<slug>.mp3, 7-15 KB) holding its takes with silence between. A story loads the voices of the people in it as
 * it opens (`loadVoices`); each file is decoded once (at 24 kHz where the browser allows: sfxRecLoader.ts) and cut at its silences.
 * voiceBank.ts `playSyllable` plays one take on the effects bus, so the mute and the effects volume govern it like any other sound. Until a voice has
 * arrived its lines are simply silent. (Loaded on demand by the conductor, like the other recordings: the file lists here are Vite's.)
 */
import type { AudioCore } from './core.ts';
import { bytesOf } from './sampleLoader.ts';
import { decode } from './sfxRecLoader.ts';
import { bank } from './voiceBank.ts';
import { cutTakes } from './voiceCut.ts';

const files = import.meta.glob('../assets/voices/*.mp3', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const urlOf = (slug: string) => Object.entries(files).find(([p]) => p.endsWith(`/${slug}.mp3`))?.[1];

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

