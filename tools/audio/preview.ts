/**
 * The offline renderer for the audio previews (tools/audio/render.mjs drives it in headless Chromium).
 *
 * It plays a piece exactly the way the live Conductor does (the same AudioCore, Playback, effects, stings and ambience, with the recorded
 * orchestra and effects loaded) inside an OfflineAudioContext, and fires the timeline's events at their times by suspending the render.
 * Nothing here ships with the game.
 */
import { AudioCore } from '../../src/audio/core.ts';
import { Playback } from '../../src/audio/music.ts';
import { runFx } from '../../src/audio/sfx.ts';
import { playSting } from '../../src/audio/stingers.ts';
import { Ambience, type AmbientType } from '../../src/audio/ambience.ts';
import { themeById } from '../../src/audio/themes.ts';
import { groupsFor, loadOrch, ALL_ORCH } from '../../src/audio/orchLoader.ts';
import { loadSamples } from '../../src/audio/sampleLoader.ts';
import * as M from '../../src/audio/music.ts';
import { playGameFx } from '../../src/audio/sfxGame.ts';
import { playCue, CUE_DUCK, type CueName } from '../../src/audio/cues.ts';

export interface PreviewEvent {
  t: number;
  intensity?: number;
  tempo?: number;
  /** the adaptive music state (only on builds that have it) */
  state?: Record<string, unknown>;
  fx?: string;
  arg?: number;
  sting?: string;
  /** an in-key stinger (only on builds that have it) */
  cue?: string;
  amb?: string | null;
  /** switch the music to another piece (crossfade) */
  music?: { id: string; seed?: number; tempo?: number; intensity?: number; form?: boolean };
}
export interface PreviewSpec {
  seconds: number;
  music?: { id: string; seed?: number; tempo?: number; intensity?: number; form?: boolean };
  events?: PreviewEvent[];
  lite?: boolean;
  /** start the piece this many bars in (to show a later section) */
  startBar?: number;
}

const RATE = 44100;
const TICK = 0.1;

async function render(spec: PreviewSpec): Promise<{ l: string; r: string; perf: Record<string, number> }> {
  const ctx = new OfflineAudioContext(2, Math.ceil(spec.seconds * RATE), RATE);
  const lite = spec.lite !== false;
  const core = new AudioCore(ctx, { lightRoom: lite });
  core.lite = lite;
  core.music.gain.value = 0.32;
  core.sfx.gain.value = 0.9;
  core.amb.gain.value = 0.6;
  await loadSamples(core);
  await loadOrch(core, ALL_ORCH);
  const amb = new Ambience(core);
  amb.lite = lite;
  let pb: M.Playback | null = null;
  const start = (m: NonNullable<PreviewSpec['music']>, at: number, fade: boolean) => {
    const theme = themeById(m.id);
    if (!theme) throw new Error('no theme ' + m.id);
    const p = new Playback(core, theme, at, undefined, fade, { seed: m.seed, tempo: m.tempo, form: m.form });
    p.liteMode = lite;
    p.setIntensity(m.intensity ?? 0.4, true);
    if (fade) p.out.gain.linearRampToValueAtTime((theme.level ?? 1) * 0.9, at + 1.4);
    return p;
  };
  if (spec.music) pb = start(spec.music, 0.05, false);
  const events = [...(spec.events ?? [])].sort((a, b) => a.t - b.t);
  let ei = 0;
  const any = (o: unknown) => o as Record<string, (...a: unknown[]) => unknown>;
  const fire = (e: PreviewEvent, now: number) => {
    if (e.intensity !== undefined) pb?.setIntensity(e.intensity);
    if (e.tempo !== undefined) pb?.setTempo(e.tempo);
    if (e.state && pb && any(pb).setState) any(pb).setState(e.state);
    if (e.music) {
      const old = pb;
      pb = start(e.music, now + 0.08, true);
      old?.retire(1.4);
    }
    if (e.amb !== undefined) {
      if (e.amb) amb.start(e.amb as AmbientType);
      else amb.stop();
    }
    const key = pb?.key() ?? { tonic: 60, scale: [0, 2, 4, 5, 7, 9, 11] };
    if (e.fx && !playGameFx(e.fx, core, key, e.arg)) runFx(e.fx, core, key, e.arg, { variant: Math.floor(Math.random() * 4) });
    if (e.sting) playSting(core, e.sting, now + 0.05);
    if (e.cue) {
      // as the Conductor does: on the music's next eighth, with the music dipped a little under it
      const t = pb ? pb.gridAfter(now + 0.03) : now;
      const dur = playCue(core, e.cue as CueName, key, t, pb?.beatDur ?? 0.5);
      const g = core.musicDuck.gain;
      g.cancelScheduledValues(now);
      g.setTargetAtTime(CUE_DUCK[e.cue as CueName], now, 0.04);
      g.setTargetAtTime(1, now + Math.max(0.2, dur * 0.6), 0.8 / 3);
    }
  };
  // the conductor's tick, every TICK seconds of the render
  const steps = Math.floor(spec.seconds / TICK);
  for (let i = 0; i < steps; i++) {
    const t = i * TICK;
    void ctx.suspend(t).then(() => {
      while (ei < events.length && events[ei].t <= t + 1e-6) fire(events[ei++], ctx.currentTime);
      pb?.update(ctx.currentTime + 0.6);
      amb.update(ctx.currentTime + 0.6);
      void ctx.resume();
    });
  }
  const t0 = performance.now();
  const buf = await ctx.startRendering();
  const ms = performance.now() - t0;
  const enc = (ch: Float32Array) => {
    const i16 = new Int16Array(ch.length);
    for (let i = 0; i < ch.length; i++) i16[i] = Math.max(-32768, Math.min(32767, Math.round(ch[i] * 32767)));
    const u8 = new Uint8Array(i16.buffer);
    let s = '';
    for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode(...u8.subarray(i, i + 0x8000));
    return btoa(s);
  };
  return { l: enc(buf.getChannelData(0)), r: enc(buf.getChannelData(1)), perf: { renderMs: ms, seconds: spec.seconds } };
}

(window as unknown as { renderPreview: typeof render }).renderPreview = render;
document.getElementById('s')!.textContent = 'ready';
