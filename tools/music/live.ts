/**
 * The old live music, rendered offline for the A/B comparisons: the piece played by the Playback through a whole game AudioCore (its master
 * compressor and soft clip included), with the game's state and intensity changing along a timeline, as the old Conductor drove it.
 */
import { AudioCore } from '../../src/audio/core.ts';
import { Playback } from '../../src/audio/music.ts';
import { themeById } from '../../src/audio/themes.ts';
import { ALL_ORCH, loadOrch } from '../../src/audio/orchLoader.ts';
import { loadSamples } from '../../src/audio/sampleLoader.ts';
import type { MusicState } from '../../src/audio/adaptive.ts';

export interface TimedChange {
  t: number;
  intensity?: number;
  state?: Partial<MusicState>;
}
export interface PreviewSpec {
  seconds: number;
  music: { id: string; seed?: number; tempo?: number; intensity?: number; form?: boolean };
  events?: TimedChange[];
  /** the phone arrangement (lite) and the light room: what the phones played */
  lite?: boolean;
  rate?: number;
}

export async function renderPreview(spec: PreviewSpec): Promise<Float32Array> {
  const rate = spec.rate ?? 48000;
  const ctx = new OfflineAudioContext(2, Math.ceil(spec.seconds * rate), rate);
  const lite = !!spec.lite;
  const core = new AudioCore(ctx, { lightRoom: lite });
  core.lite = lite;
  core.music.gain.value = 0.32;
  await loadSamples(core);
  await loadOrch(core, ALL_ORCH);
  const m = spec.music;
  const pb = new Playback(core, themeById(m.id)!, 0.05, undefined, false, { seed: m.seed, tempo: m.tempo, form: m.form });
  pb.liteMode = lite;
  pb.setIntensity(m.intensity ?? 0.55, true);
  const events = [...(spec.events ?? [])].sort((a, b) => a.t - b.t);
  let ei = 0;
  for (let t = 0; t < spec.seconds; t += 0.1) {
    void ctx.suspend(Math.round(t * 10) / 10).then(() => {
      while (ei < events.length && events[ei].t <= ctx.currentTime + 1e-6) {
        const e = events[ei++];
        if (e.intensity !== undefined) pb.setIntensity(e.intensity);
        if (e.state) pb.setState(e.state);
      }
      pb.update(ctx.currentTime + 0.6);
      void ctx.resume();
    });
  }
  const buf = await ctx.startRendering();
  const l = buf.getChannelData(0);
  const r = buf.getChannelData(1);
  const out = new Float32Array(l.length * 2);
  for (let i = 0; i < l.length; i++) {
    out[i * 2] = l[i];
    out[i * 2 + 1] = r[i];
  }
  return out;
}
