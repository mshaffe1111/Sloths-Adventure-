/**
 * The new player, rendered offline for the A/B comparisons: the recorded stems played by the game's own LoopPlayer through a game AudioCore
 * (recorded mode, master compressor and soft clip included), with the state and intensity changing along the same timeline as the live
 * render (live.ts).
 */
import { AudioCore } from '../../src/audio/core.ts';
import { LoopPlayer, type LoopManifest } from '../../src/audio/loops.ts';
import type { TimedChange } from './live.ts';

export interface PlayerSpec {
  seconds: number;
  id: string;
  intensity?: number;
  events?: TimedChange[];
  /** the manifest to play from, and where its files are served */
  manifest: LoopManifest;
  base: string;
  rate?: number;
}

export async function renderPlayer(spec: PlayerSpec): Promise<Float32Array> {
  const rate = spec.rate ?? 48000;
  const ctx = new OfflineAudioContext(2, Math.ceil(spec.seconds * rate), rate);
  const core = new AudioCore(ctx, { recorded: true });
  core.music.gain.value = 1;
  const player = new LoopPlayer(ctx, core.music, spec.manifest, (f) => spec.base + f);
  player.setIntensity(spec.intensity ?? 0.55, true);
  await player.load(spec.id);
  // (started at 0.05 s less the player's own 0.05 s lead, as the live render starts its piece at 0.05 s)
  void player.play(spec.id, 0);
  const events = [...(spec.events ?? [])].sort((a, b) => a.t - b.t);
  for (const e of events) {
    void ctx.suspend(Math.round(e.t * 10) / 10).then(() => {
      if (e.intensity !== undefined) player.setIntensity(e.intensity);
      if (e.state) player.setState(e.state);
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
