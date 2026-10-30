/**
 * The music recorder (tools/music/record.mjs drives it in headless Chromium). Not shipped.
 *
 * It plays a piece exactly as the old live Conductor did (the same AudioCore, Playback and recorded orchestra, the full arrangement and the
 * full hall) inside an OfflineAudioContext, one stem at a time: a stem is the piece with only some of its parts heard (Playback's `stem`
 * option), every part still scheduled as if all played, so the stems line up to the sample and add up to the whole.
 *
 * A loop: the piece is played from its start to a bar line (for a chained stage piece, the start of an A section, so coming round is
 * a turn the chain itself takes), nothing is scheduled after it, the render runs on for the tails (the hall, the echo, the last notes'
 * release), and those tails are folded back onto the loop's start, as the end of the loop rings on into its next pass. What comes out is
 * one period of the music: it plays round with no seam.
 */
import { AudioCore } from '../../src/audio/core.ts';
import { Playback } from '../../src/audio/music.ts';
import { themeById } from '../../src/audio/themes.ts';
import { ALL_ORCH, loadOrch } from '../../src/audio/orchLoader.ts';
import { loadSamples } from '../../src/audio/sampleLoader.ts';
import type { Role } from '../../src/audio/adaptive.ts';
import { renderPreview, type PreviewSpec } from './live.ts';
import { renderPlayer, type PlayerSpec } from './playerRender.ts';

export const RATE = 48000;
/** how long the render runs past the loop's end for the tails to die away */
const TAIL = 7;
/** where the piece starts in the render */
const START = 0.05;

export interface PieceSpec {
  id: string;
  seed?: number;
  tempo?: number;
  form?: boolean;
  /** the intensity the stems are played at (the game moves the whole piece's level with its own) */
  intensity?: number;
  /** the loop should last at least this long (seconds) */
  target: number;
  /** and at most this long (the decoded stems' memory: loops.ts DECODE_RATE) */
  max?: number;
}

export interface LoopPlan {
  /** seconds from the start of the piece to the end of the loop */
  length: number;
  bars: number;
  bpm: number;
  /** seconds per beat (the game's in-key cues land on the beat grid) */
  beat: number;
  /** the sections the loop passes through, in order */
  sections: string[];
  key: { tonic: number; scale: number[] };
  stepsPerBar: number;
}

let ready: Promise<void> | null = null;
const banks = new Map<number, AudioCore>();
/** every core needs its own orchestra bank (decoded once per rate: the buffers are shared between contexts) */
async function coreFor(ctx: BaseAudioContext): Promise<AudioCore> {
  const core = new AudioCore(ctx, { lightRoom: false });
  core.lite = false;
  core.music.gain.value = 0.32;
  // the stems are the music as it reaches the master, before the master's compressor and soft clip (the game's master still has them)
  core.master.disconnect();
  core.master.connect(ctx.destination);
  const bank = banks.get(ctx.sampleRate);
  if (bank) {
    for (const [k, v] of bank.orch) core.orch.set(k, v);
    for (const [k, v] of bank.samples) core.samples.set(k, v);
  } else {
    await loadSamples(core);
    await loadOrch(core, ALL_ORCH);
    banks.set(ctx.sampleRate, core);
  }
  return core;
}

/** where the loop ends: scheduled dry (no sound is rendered) to see the bar lines and the sections */
async function plan(spec: PieceSpec): Promise<LoopPlan> {
  const theme = themeById(spec.id);
  if (!theme) throw new Error('no theme ' + spec.id);
  const ctx = new OfflineAudioContext(2, 128, RATE);
  const core = new AudioCore(ctx, { lightRoom: true });
  const bars: Array<{ bar: number; t: number; section: string | null }> = [];
  const pb = new Playback(core, theme, START, undefined, false, {
    seed: spec.seed, tempo: spec.tempo, form: spec.form, stem: () => false, onBar: (bar, t, section) => bars.push({ bar, t, section }),
  });
  pb.setIntensity(spec.intensity ?? 0.55, true);
  const chained = pb.chunks.length > 0;
  const spb = theme.stepsPerBar ?? 16;
  let endBar: number;
  if (chained) {
    const max = spec.max ?? spec.target * 2;
    pb.update(START + max + 30);
    // the first A section from the target on (no longer than the most); else the last section start under the most
    const fits = (b: (typeof bars)[number]) => b.section !== null && b.t - START <= max;
    const pick =
      bars.find((b) => fits(b) && b.t - START >= spec.target && b.section!.startsWith('A')) ??
      [...bars].reverse().find((b) => fits(b) && b.t - START >= spec.target * 0.6);
    if (!pick) throw new Error('no loop point for ' + spec.id);
    endBar = pick.bar;
  } else {
    // a piece that goes round its loop is dressed differently on each of four passes (Playback.phaseOf): the loop is all four,
    // unless the piece is a still one (always dressed the same)
    // (or two, or one, to stay under the most: two passes come round from the answer to the statement, as the piece does)
    const max = spec.max ?? Infinity;
    while (!bars.some((b) => b.bar === pb.loopBars)) pb.update((bars.length ? bars[bars.length - 1].t : START) + 30);
    const pass = bars.find((b) => b.bar === pb.loopBars)!.t - START;
    const passes = theme.still ? 1 : [4, 2, 1].find((n) => n * pass <= max) ?? 1;
    endBar = pb.loopBars * passes;
    while (!bars.some((b) => b.bar === endBar)) pb.update((bars.length ? bars[bars.length - 1].t : START) + 30);
  }
  const end = bars.find((b) => b.bar === endBar)!;
  const sections: string[] = [];
  for (const b of bars) if (b.bar < endBar && b.section) sections.push(b.section);
  pb.dispose();
  return {
    length: end.t - START, bars: endBar, bpm: theme.bpm * (spec.tempo ?? 1), beat: 60 / (theme.bpm * Math.max(0.8, Math.min(1.25, spec.tempo ?? 1))),
    sections, key: pb.key(), stepsPerBar: spb,
  };
}

/** one stem of a piece, as one seamless period of `plan.length` seconds (interleaved stereo) */
async function stem(spec: PieceSpec, p: LoopPlan, roles: Role[]): Promise<Float32Array> {
  const theme = themeById(spec.id)!;
  const end = START + p.length;
  const ctx = new OfflineAudioContext(2, Math.ceil((end + TAIL) * RATE), RATE);
  const core = await coreFor(ctx);
  const want = new Set(roles);
  const pb = new Playback(core, theme, START, undefined, false, { seed: spec.seed, tempo: spec.tempo, form: spec.form, stem: (r) => want.has(r) });
  pb.setIntensity(spec.intensity ?? 0.55, true);
  for (let t = 0; t < end; t += 0.1) {
    void ctx.suspend(t).then(() => {
      // (nothing that begins at or after the loop's end: that is the next pass, and it comes from the loop's own start)
      pb.update(Math.min(ctx.currentTime + 0.6, end - 1e-4));
      void ctx.resume();
    });
  }
  const buf = await ctx.startRendering();
  const s0 = Math.round(START * RATE);
  const n = Math.round(p.length * RATE);
  const out = new Float32Array(n * 2);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    // every sample of the render, folded onto one period: whatever rang on past the loop's end lands on its start, and the few
    // milliseconds a humanized first note sounds before the loop's start land on its end
    for (let j = 0; j < d.length; j++) {
      const i = (((j - s0) % n) + n) % n;
      out[i * 2 + c] += d[j];
    }
  }
  return out;
}

const b64 = (f: Float32Array) => {
  const u8 = new Uint8Array(f.buffer, f.byteOffset, f.byteLength);
  let s = '';
  for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode(...u8.subarray(i, i + 0x8000));
  return btoa(s);
};

async function record(spec: PieceSpec, stems: Record<string, Role[]>) {
  await (ready ??= Promise.resolve());
  const p = await plan(spec);
  const out: Record<string, string> = {};
  const peaks: Record<string, number> = {};
  for (const [name, roles] of Object.entries(stems)) {
    const s = await stem(spec, p, roles);
    let pk = 0;
    for (let i = 0; i < s.length; i++) pk = Math.max(pk, Math.abs(s[i]));
    peaks[name] = pk;
    out[name] = b64(s);
  }
  return { plan: p, stems: out, peaks };
}

async function live(spec: PreviewSpec) {
  const r = await renderPreview(spec);
  return { data: b64(r) };
}

async function player(spec: PlayerSpec) {
  const r = await renderPlayer(spec);
  return { data: b64(r) };
}

Object.assign(window, { recordPiece: record, planPiece: plan, renderLive: live, renderPlayer: player });
document.getElementById('s')!.textContent = 'ready';
