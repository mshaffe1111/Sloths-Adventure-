/**
 * SN-2: renders each game effect offline (OfflineAudioContext, through the whole master chain) so its loudness can be measured
 * (tools/audio/sfx_render.mjs drives it in Chromium and tools/audio/sfx_loudness.py measures). Not part of the game.
 */
import { AudioCore } from '../../../src/audio/core.ts';
import { runFx, SFX } from '../../../src/audio/sfx.ts';
import { bytesOf } from '../../../src/audio/sampleLoader.ts';

const files = import.meta.glob('../../../src/assets/sfx/*.mp3', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const KEY = { tonic: 60, scale: [0, 2, 4, 5, 7, 9, 11] };
const SR = 48000;

async function render(name: string, variant: number, arg?: number): Promise<Float32Array> {
  const ctx = new OfflineAudioContext(1, SR * 2.5, SR);
  const core = new AudioCore(ctx);
  for (const [path, url] of Object.entries(files)) {
    const m = /\/([A-Za-z]+)_(\d+)\.mp3$/.exec(path);
    if (!m) continue;
    const buf = await ctx.decodeAudioData(await bytesOf(url));
    const list = core.samples.get(m[1]) ?? [];
    list[Number(m[2])] = buf;
    core.samples.set(m[1], list);
  }
  for (const [g, list] of core.samples) core.samples.set(g, list.filter(Boolean));
  runFx(name, core, KEY as never, arg, { variant, streak: 0 });
  const out = await ctx.startRendering();
  return out.getChannelData(0);
}

(window as unknown as Record<string, unknown>).renderFx = async (name: string, variant: number, arg?: number) => {
  const d = await render(name, variant, arg);
  // to base64 (float32 little-endian)
  const u8 = new Uint8Array(d.buffer.slice(0));
  let s = '';
  for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode(...u8.subarray(i, i + 0x8000));
  return btoa(s);
};
(window as unknown as Record<string, unknown>).fxNames = Object.keys(SFX);
