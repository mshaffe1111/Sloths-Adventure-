/**
 * The recorded music: every piece the game plays was recorded once, offline, by its own orchestra (tools/music/record.mjs plays the score
 * with the old live engine and writes the result here), so the game only plays loops back. Nothing is composed or scheduled while a stage
 * runs: no timer, no notes, no new audio nodes per note.
 *
 * A piece is a few stems that loop together, sample for sample:
 *   bed    the held chords and the bass          beat   the drums and the chord stabs
 *   top    the tune, the countermelody, the figures
 *   drive  the danger layer                       shine  the exit layer
 *   dark   the dark-zone layer                    boss   a boss fight's last-phase layer
 *   mix    everything but the layers in one (the pieces whose parts never move apart: menus, the story, the results)
 * and the game's state (adaptive.ts) mixes them with gain alone, by the same rules the live parts followed (layerMix), on the next bar
 * line, rising quickly and falling slowly. The dark also closes the treble (toneCutoff) with one filter.
 *
 * Each file holds one period of its stem with a short guard either side (the end of the loop before it, its start after it), so wherever a
 * decoder puts the first sample, the stretch the player loops is exactly one period: no seam.
 */
import { CALM, layerMix, toneCutoff, type MusicState, type Role } from './adaptive.ts';

export type StemName = 'mix' | 'bed' | 'beat' | 'top' | 'drive' | 'shine' | 'dark' | 'boss';

/** the roles (adaptive.ts) each stem holds: the recorder plays these parts into it */
export const STEM_ROLES: Record<StemName, Role[]> = {
  mix: ['lead', 'counter', 'perc', 'low', 'bed', 'stab', 'color'],
  bed: ['bed', 'low'],
  beat: ['perc', 'stab'],
  top: ['lead', 'counter', 'color'],
  drive: ['drive'],
  shine: ['shine'],
  dark: ['dark'],
  boss: ['boss'],
};

/** how much of a stem each of its roles is (what is heard of it), for weighing their mixes into one level */
const WEIGHT: Partial<Record<Role, number>> = { lead: 3, bed: 3, perc: 3, low: 2, color: 1.5, counter: 1, stab: 1 };

/** how loud (0..1) a stem plays in a state: its roles' own levels (adaptive.ts layerMix), weighted by how much of the stem each is */
export function stemLevel(stem: StemName, s: MusicState): number {
  let sum = 0;
  let w = 0;
  for (const r of STEM_ROLES[stem]) {
    const k = WEIGHT[r] ?? 1;
    sum += k * layerMix(r, s);
    w += k;
  }
  return w ? sum / w : 0;
}

/** one recorded piece, as the manifest (src/assets/music/manifest.json) lists it */
export interface LoopPiece {
  /** file name (in src/assets/music) of each stem */
  stems: Partial<Record<StemName, string>>;
  /** seconds of guard before the loop starts in each file */
  guard: number;
  /** the loop's length in seconds */
  length: number;
  bars: number;
  /** seconds per beat */
  beat: number;
  stepsPerBar: number;
  key: { tonic: number; scale: number[] };
  /** the intensity the stems were played at */
  intensity: number;
  /** the piece's own level (Theme.level) */
  level: number;
}

export interface LoopManifest {
  pieces: Record<string, LoopPiece>;
  /** a stage's music by world and pace: the recorded pieces it may play ("w3-s" -> ids) */
  stages: Record<string, string[]>;
}

/** where the stems are fetched from (the game: the bundled files; the tools: anything) */
export type StemSource = (file: string) => string | undefined;

/** how long the seam's blend lasts (seconds) */
export const SEAM_BLEND = 0.02;

/**
 * The seam, smoothed: a lossy file's loop end and loop start are coded apart, so the step from its last sample back to its first carries
 * the two codings' small differences, a tick under a quiet drone. The guard before the loop holds the same music as the loop's end, coded
 * as the run-up to the loop's start, so the loop's last moments are blended into it: the last sample played is then the one the coder put
 * right before the first.
 */
export function smoothSeam(d: Float32Array, rate: number, guard: number, length: number, blend = SEAM_BLEND) {
  const g = Math.round(guard * rate);
  const n = Math.round(length * rate);
  const m = Math.min(Math.round(blend * rate), g);
  if (g + n > d.length || m < 2) return;
  for (let k = 0; k < m; k++) {
    const w = (k + 1) / m;
    const i = g + n - m + k;
    d[i] = d[i] * (1 - w) + d[g - m + k] * w;
  }
}

/**
 * The rate each stem is decoded at. A decoded stem is raw 32-bit sound, so the rate is its memory: a minute of stereo is 11.5 MB at
 * 24 kHz and 23 MB at 48. The old live orchestra already played its pitched instruments from 24 kHz recordings with their tops filtered
 * under 13 kHz (orchLoader.ts decodeRate), so the stems of them lose nothing at 24 kHz; the drums, the cymbals and the bells (the beat,
 * the shine, the one-stem pieces) keep 32 kHz, which holds everything up to 16 kHz.
 */
export const DECODE_RATE: Record<StemName, number> = { mix: 32000, bed: 24000, beat: 32000, top: 24000, drive: 24000, shine: 32000, dark: 24000, boss: 32000 };

interface Loaded {
  id: string;
  piece: LoopPiece;
  bufs: Partial<Record<StemName, AudioBuffer>>;
}

/** a piece that is playing */
interface Voice {
  id: string;
  piece: LoopPiece;
  out: GainNode;
  tone: BiquadFilterNode;
  gains: Partial<Record<StemName, GainNode>>;
  srcs: AudioBufferSourceNode[];
  /** audio time of the loop's start */
  t0: number;
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/**
 * How the whole piece swells with the intensity and the state (as the live piece did: Playback.beginBar). A puzzle room and the dark also
 * lowered the intensity the live parts' gates read (adaptive.ts intensityLift), thinning the piece about 2 dB and 1 dB more than their
 * stems' own levels do: measured against the live render (tools/music/ab.mjs), and taken off the whole here.
 */
export function pieceGain(p: LoopPiece, k: number, s: MusicState) {
  const swell = (1 + 0.4 * s.exit + 0.25 * s.danger) * (1 - 0.2 * s.puzzle - 0.1 * s.dark);
  return ((0.74 + 0.26 * k) / (0.74 + 0.26 * p.intensity)) * swell;
}

export class LoopPlayer {
  private readonly ctx: BaseAudioContext;
  private readonly dest: AudioNode;
  private readonly manifest: LoopManifest;
  private readonly source: StemSource;
  private voice: Voice | null = null;
  private state: MusicState = CALM;
  private intensity = 0.4;
  /** decoded pieces: the one playing and at most one ahead (the phones' memory) */
  private readonly decoded = new Map<string, Promise<Loaded | null>>();
  private ahead: string | null = null;
  private readonly decoders = new Map<number, BaseAudioContext | null>();
  /** the piece asked for last (a slow load must not start a piece that was asked away in the meantime) */
  private want: string | null = null;

  constructor(ctx: BaseAudioContext, dest: AudioNode, manifest: LoopManifest, source: StemSource) {
    this.ctx = ctx;
    this.dest = dest;
    this.manifest = manifest;
    this.source = source;
  }

  has(id: string) {
    return !!this.manifest.pieces[id];
  }

  /** the piece playing (or about to) */
  get playing(): string | null {
    return this.voice?.id ?? null;
  }

  get piece(): LoopPiece | null {
    return this.voice?.piece ?? null;
  }

  /** an offline context at `rate`, only for decoding (a buffer plays in any context: its source resamples it as it plays) */
  private decodeCtx(rate: number): BaseAudioContext | null {
    if (!this.decoders.has(rate)) {
      let d: BaseAudioContext | null = null;
      try {
        if (this.ctx.sampleRate > rate && typeof OfflineAudioContext !== 'undefined') d = new OfflineAudioContext(1, 1, rate);
      } catch {
        d = null;
      }
      this.decoders.set(rate, d);
    }
    return this.decoders.get(rate)!;
  }

  private async decode(bytes: ArrayBuffer, rate: number): Promise<AudioBuffer> {
    const low = this.decodeCtx(rate);
    if (low) {
      try {
        return await low.decodeAudioData(bytes.slice(0));
      } catch {
        /* this browser will not decode at that rate: the context's own it is */
      }
    }
    return this.ctx.decodeAudioData(bytes);
  }

  /** fetch and decode a piece's stems (once; shared by every caller) */
  load(id: string): Promise<Loaded | null> {
    let job = this.decoded.get(id);
    if (job) return job;
    const piece = this.manifest.pieces[id];
    if (!piece) return Promise.resolve(null);
    job = (async () => {
      const bufs: Loaded['bufs'] = {};
      await Promise.all(
        (Object.entries(piece.stems) as Array<[StemName, string]>).map(async ([stem, file]) => {
          const url = this.source(file);
          if (!url) throw new Error('missing stem ' + file);
          const res = await fetch(url);
          if (!res.ok) throw new Error(`${file}: ${res.status}`);
          const buf = await this.decode(await res.arrayBuffer(), DECODE_RATE[stem]);
          for (let c = 0; c < buf.numberOfChannels; c++) smoothSeam(buf.getChannelData(c), buf.sampleRate, piece.guard, piece.length);
          bufs[stem] = buf;
        }),
      );
      return { id, piece, bufs };
    })().catch(() => {
      this.decoded.delete(id);
      return null;
    });
    this.decoded.set(id, job);
    return job;
  }

  /** decode a piece ahead of time (the one most likely to be asked for next); only one is held ahead */
  prefetch(id: string | null) {
    this.ahead = id && this.has(id) ? id : null;
    this.release();
    if (this.ahead) void this.load(this.ahead);
  }

  /** let go of every decoded piece but the one playing (or wanted) and the one ahead */
  private release() {
    for (const id of [...this.decoded.keys()]) if (id !== this.want && id !== this.voice?.id && id !== this.ahead) this.decoded.delete(id);
  }

  /** play a piece (crossfading from the one playing over `fade` seconds); null fades to silence */
  async play(id: string | null, fade = 1.4, restart = false): Promise<void> {
    if (id === this.want && !restart && (this.voice?.id === id || id === null)) return;
    this.want = id;
    if (!id) {
      this.stopVoice(fade);
      this.release();
      return;
    }
    const loaded = await this.load(id);
    if (this.want !== id || !loaded) return;
    if (this.voice?.id === id && !restart) return;
    const had = !!this.voice;
    this.stopVoice(fade);
    this.voice = this.startVoice(loaded, this.ctx.currentTime + 0.05, had);
    if (this.ahead === id) this.ahead = null;
    this.release();
  }

  private startVoice(l: Loaded, at: number, fadeIn: boolean): Voice {
    const c = this.ctx;
    const p = l.piece;
    const out = c.createGain();
    const tone = c.createBiquadFilter();
    tone.type = 'lowpass';
    tone.Q.value = 0.5;
    tone.frequency.value = toneCutoff(this.state);
    out.connect(tone);
    tone.connect(this.dest);
    const level = p.level * pieceGain(p, this.intensity, this.state);
    if (fadeIn) {
      out.gain.setValueAtTime(0, at);
      out.gain.setTargetAtTime(level, at, 0.6);
    } else out.gain.value = level;
    const gains: Voice['gains'] = {};
    const srcs: AudioBufferSourceNode[] = [];
    for (const [stem, buf] of Object.entries(l.bufs) as Array<[StemName, AudioBuffer]>) {
      const g = c.createGain();
      g.gain.value = stemLevel(stem, this.state);
      g.connect(out);
      const s = c.createBufferSource();
      s.buffer = buf;
      s.loop = true;
      s.loopStart = p.guard;
      s.loopEnd = p.guard + p.length;
      s.connect(g);
      s.start(at, p.guard);
      gains[stem] = g;
      srcs.push(s);
    }
    return { id: l.id, piece: p, out, tone, gains, srcs, t0: at };
  }

  private stopVoice(fade: number) {
    const v = this.voice;
    this.voice = null;
    if (!v) return;
    const t = this.ctx.currentTime;
    v.out.gain.cancelScheduledValues(t);
    v.out.gain.setValueAtTime(v.out.gain.value, t);
    v.out.gain.linearRampToValueAtTime(0, t + Math.max(0.02, fade));
    const end = t + Math.max(0.02, fade) + 0.05;
    for (const s of v.srcs) s.stop(end);
    v.srcs[0].onended = () => {
      try {
        v.tone.disconnect();
        v.out.disconnect();
      } catch {
        /* already gone */
      }
    };
  }

  /** seconds per bar of the piece playing */
  private get barDur() {
    const p = this.voice?.piece;
    return p ? p.length / Math.max(1, p.bars) : 2;
  }

  /** the next bar line of the piece playing (the live parts answered the game on the bar line) */
  nextBar(t = this.ctx.currentTime): number {
    const v = this.voice;
    if (!v) return t;
    const bar = this.barDur;
    const pos = (((t - v.t0) % v.piece.length) + v.piece.length) % v.piece.length;
    return t + (bar - (pos % bar)) % bar;
  }

  setIntensity(k: number, snap = false) {
    const prev = this.intensity;
    this.intensity = clamp01(k);
    const v = this.voice;
    if (!v) return;
    const g = v.out.gain;
    const t = this.ctx.currentTime;
    const want = v.piece.level * pieceGain(v.piece, this.intensity, this.state);
    if (snap) g.setTargetAtTime(want, t, 0.05);
    // quicker up than down (Playback.beginBar)
    else g.setTargetAtTime(want, Math.max(t, this.nextBar() - 0.02), this.intensity > prev ? 0.9 : 2.5);
  }

  /** the game's state: the stems follow it from the next bar line, rising quickly and falling slowly */
  setState(s: Partial<MusicState>, snap = false) {
    const before = this.state;
    this.state = { ...this.state, ...s };
    const v = this.voice;
    if (!v) return;
    const t = this.ctx.currentTime;
    const at = snap ? t : Math.max(t, this.nextBar() - 0.02);
    const bar = this.barDur;
    for (const [stem, g] of Object.entries(v.gains) as Array<[StemName, GainNode]>) {
      const to = stemLevel(stem, this.state);
      const from = stemLevel(stem, before);
      if (Math.abs(to - from) < 1e-4 && !snap) continue;
      // (the live state moved 70% of the way each bar going up and 40% coming down: adaptive.ts stepState)
      g.gain.cancelScheduledValues(at);
      g.gain.setTargetAtTime(to, at, snap ? 0.02 : to > from ? bar * 0.8 : bar * 2);
    }
    v.tone.frequency.setTargetAtTime(toneCutoff(this.state), at, snap ? 0.02 : 0.35 + bar * 0.5);
    v.out.gain.setTargetAtTime(v.piece.level * pieceGain(v.piece, this.intensity, this.state), at, 0.6);
  }

  /** the music's key (the effects play in it) */
  key(): LoopPiece['key'] | null {
    return this.voice?.piece.key ?? null;
  }

  get beatDur(): number {
    return this.voice?.piece.beat ?? 0.5;
  }

  /** the first point of the music's grid (every `steps` sixteenths) at or after `t`, never more than `most` seconds away (as Playback.gridAfter) */
  gridAfter(t: number, steps = 2, most = 0.3): number {
    const v = this.voice;
    if (!v) return t;
    const step = (v.piece.beat / 4) * steps;
    const pos = t - v.t0;
    const next = v.t0 + Math.ceil(pos / step - 1e-6) * step;
    return next - t > most ? t : Math.max(t, next);
  }

  /** stop everything now and let go of every decoded piece */
  dispose() {
    this.want = null;
    this.ahead = null;
    this.stopVoice(0.02);
    this.decoded.clear();
  }
}
