/**
 * Loads the recorded sounds (src/assets/sfx/<group>_<n>.mp3, free CC0 packs by Kenney, see CREDITS.txt there) and decodes them into the
 * audio core. It lives in its own file because only the browser can resolve the asset URLs: tests and the offline renderer
 * that never call it simply get an empty sample bank, and every effect falls back to its synthesized version.
 */
import type { AudioCore } from './core.ts';

const files = import.meta.glob('../assets/sfx/*.mp3', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

/** "punchM_3.mp3" -> group "punchM", position 3 */
function parseName(path: string): { group: string; i: number } | null {
  const m = /\/([A-Za-z]+)_(\d+)\.mp3$/.exec(path);
  return m ? { group: m[1], i: Number(m[2]) } : null;
}

/** the bytes behind a url; a data: url (the single-file preview build) is decoded directly, since a page may not be allowed to fetch it */
async function bytesOf(url: string): Promise<ArrayBuffer> {
  if (url.startsWith('data:')) {
    const bin = atob(url.slice(url.indexOf(',') + 1));
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out.buffer;
  }
  return (await fetch(url)).arrayBuffer();
}

const loading = new WeakMap<AudioCore, Promise<void>>();

/** fetch and decode every recorded sound once (safe to call again: it only runs the first time for a core) */
export function loadSamples(core: AudioCore): Promise<void> {
  const have = loading.get(core);
  if (have) return have;
  const job = (async () => {
    const jobs = Object.entries(files).map(async ([path, url]) => {
      const n = parseName(path);
      if (!n) return;
      try {
        const buf = await core.ctx.decodeAudioData(await bytesOf(url));
        const list = core.samples.get(n.group) ?? [];
        list[n.i] = buf;
        core.samples.set(n.group, list);
      } catch {
        /* a sound that will not decode is simply missing: its effect uses the synthesized layers */
      }
    });
    await Promise.all(jobs);
    // close any gaps so a group is always a dense list
    for (const [g, list] of core.samples) core.samples.set(g, list.filter(Boolean));
  })();
  loading.set(core, job);
  return job;
}

/** for the offline renderer and tests: load from in-memory data instead of URLs */
export async function loadSamplesFrom(core: AudioCore, data: Record<string, ArrayBuffer>): Promise<void> {
  for (const [path, bytes] of Object.entries(data)) {
    const n = parseName('/' + path);
    if (!n) continue;
    const buf = await core.ctx.decodeAudioData(bytes.slice(0));
    const list = core.samples.get(n.group) ?? [];
    list[n.i] = buf;
    core.samples.set(n.group, list);
  }
  for (const [g, list] of core.samples) core.samples.set(g, list.filter(Boolean));
}
