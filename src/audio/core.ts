/**
 * Audio core: the mixing desk every sound goes through.
 *
 *   sfx / music / ambience buses -> master -> compressor -> soft clipper -> speakers
 *   plus a shared reverb (generated room, no files) and a ping-pong delay that any voice can send to.
 *
 * Works on any BaseAudioContext, so the exact same graph runs live in the browser and offline in tests
 * (OfflineAudioContext renders a track to samples so it can be measured without speakers).
 */

/** one recording of the orchestra: the note it was played at, and where its steady stretch begins (seconds; 0 = a one-shot with no loop) */
export interface OrchSample {
  buf: AudioBuffer;
  midi: number;
  loopStart: number;
  loopEnd: number;
}

export interface AudioCoreOptions {
  /** quality of the reverb tail in seconds */
  reverbSeconds?: number;
  /** the music hall's reverberation time in seconds */
  hallSeconds?: number;
  /** a phone: one light room built from short delays instead of the two big convolution rooms (see makeLightRoom) */
  lightRoom?: boolean;
}

export class AudioCore {
  readonly ctx: BaseAudioContext;
  readonly master: GainNode;
  readonly sfx: GainNode;
  readonly music: GainNode;
  /** between the music bus and its filter: dips the music under stingers and dialogue */
  readonly musicDuck: GainNode;
  /** after musicDuck: dips the music a few dB under speech (SN-7), on its own so a sting's deeper duck is never undone by a line */
  readonly speechDuck: GainNode;
  readonly amb: GainNode;
  /** low-pass on the music bus: closes when the game is paused (a muffled "underwater" feel) */
  readonly musicFilter: BiquadFilterNode;
  readonly reverbIn: GainNode;
  readonly delayIn: GainNode;
  /** the reverb and echo sends of each bus pass through these, so the Music and Effects volume also turns down the tails (they used to bypass it) */
  readonly sends: Record<'music' | 'sfx' | 'amb', GainNode>;
  readonly musicEchoSend: GainNode;
  private readonly delayL: DelayNode;
  private readonly delayR: DelayNode;
  readonly noise: AudioBuffer;
  readonly pinkNoise: AudioBuffer;
  /** the recorded sounds, by group ("punchM" -> its versions); empty until sampleLoader has run, and the effects work without them */
  readonly samples = new Map<string, AudioBuffer[]>();
  /** the recorded orchestra, by instrument ("cello" -> its notes, lowest first); filled on demand by orchLoader, and every voice falls back to a synthesized one without it */
  readonly orch = new Map<string, OrchSample[]>();
  /** adds weight to the music only: small phone speakers give nothing below ~150 Hz, so the body of the low instruments has to live above it */
  readonly musicBody: BiquadFilterNode;
  /** a slow phone: voices use fewer players per note (set by the conductor) */
  lite = false;
  /** a side tap on the final output, read by tests and the volume meter */
  readonly meter: AnalyserNode;

  constructor(ctx: BaseAudioContext, opts: AudioCoreOptions = {}) {
    this.ctx = ctx;
    const c = ctx;

    // ---- output chain
    this.master = c.createGain();
    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 14;
    comp.ratio.value = 3.5;
    comp.attack.value = 0.006;
    comp.release.value = 0.22;
    const makeup = c.createGain();
    makeup.gain.value = 1.25;
    const clip = c.createWaveShaper();
    clip.curve = softClipCurve();
    clip.oversample = opts.lightRoom ? 'none' : '2x';
    // tone: a little less low-mid mud, a little more air
    const lowCut = c.createBiquadFilter();
    lowCut.type = 'lowshelf';
    lowCut.frequency.value = 260;
    lowCut.gain.value = -3;
    const air = c.createBiquadFilter();
    air.type = 'highshelf';
    air.frequency.value = Math.min(3200, c.sampleRate / 2 - 500);
    air.gain.value = 5;
    this.master.connect(lowCut);
    lowCut.connect(air);
    air.connect(comp);
    comp.connect(makeup);
    makeup.connect(clip);
    clip.connect(c.destination);
    this.meter = c.createAnalyser();
    this.meter.fftSize = 2048;
    clip.connect(this.meter);

    // ---- buses
    this.sfx = c.createGain();
    this.music = c.createGain();
    this.musicDuck = c.createGain();
    this.amb = c.createGain();
    this.musicFilter = c.createBiquadFilter();
    this.musicFilter.type = 'lowpass';
    this.musicFilter.frequency.value = Math.min(20000, c.sampleRate / 2 - 100);
    this.musicFilter.Q.value = 0.5;
    this.musicBody = c.createBiquadFilter();
    this.musicBody.type = 'peaking';
    this.musicBody.frequency.value = 260;
    this.musicBody.Q.value = 0.7;
    this.musicBody.gain.value = 4.5;
    // levels: music sits under the effects so pickups and hits stay readable
    this.music.gain.value = 0.32;
    this.sfx.gain.value = 0.9;
    this.amb.gain.value = 0.6;
    this.sfx.connect(this.master);
    this.speechDuck = c.createGain();
    this.music.connect(this.musicDuck);
    this.musicDuck.connect(this.speechDuck);
    this.speechDuck.connect(this.musicFilter);
    // nothing below ~40 Hz can be heard on any speaker, but it uses up the compressor's headroom and makes the whole mix pump
    const musicHp = c.createBiquadFilter();
    musicHp.type = 'highpass';
    musicHp.frequency.value = 40;
    musicHp.Q.value = 0.5;
    this.musicFilter.connect(musicHp);
    musicHp.connect(this.musicBody);
    this.musicBody.connect(this.master);
    this.amb.connect(this.master);

    // ---- reverb
    this.reverbIn = c.createGain();
    const revOut = c.createGain();
    revOut.gain.value = 0.9;
    let room: [AudioNode, AudioNode];
    if (opts.lightRoom) {
      room = makeLightRoom(c, 2.3);
    } else {
      const conv = c.createConvolver();
      conv.buffer = makeImpulse(c, opts.reverbSeconds ?? 2.1);
      room = [conv, conv];
    }
    this.reverbIn.connect(room[0]);
    room[1].connect(revOut);
    revOut.connect(this.master);

    // ---- ping-pong delay (time follows the music tempo)
    this.delayIn = c.createGain();
    this.delayL = c.createDelay(1.5);
    this.delayR = c.createDelay(1.5);
    this.delayL.delayTime.value = 0.375;
    this.delayR.delayTime.value = 0.375;
    const fb = c.createGain();
    fb.gain.value = 0.34;
    const tone = c.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 3200;
    const merger = c.createChannelMerger(2);
    this.delayIn.connect(this.delayL);
    this.delayL.connect(tone);
    tone.connect(this.delayR);
    this.delayR.connect(fb);
    fb.connect(this.delayL);
    this.delayL.connect(merger, 0, 0);
    this.delayR.connect(merger, 0, 1);
    const dOut = c.createGain();
    dOut.gain.value = 0.55;
    merger.connect(dOut);
    dOut.connect(this.master);
    dOut.connect(this.reverbIn);

    this.sends = { music: c.createGain(), sfx: c.createGain(), amb: c.createGain() };
    this.sends.sfx.connect(this.reverbIn);
    this.sends.amb.connect(this.reverbIn);
    // the music has a hall of its own: a longer, darker room with the first reflections in it, so the orchestra sits on a stage instead of in a box.
    // A phone shares the light room instead: the two long convolution rooms were the heaviest work in the mix, and on a busy iPhone the whole sound
    // came through only in short bursts as each effect started, with near silence between (a tester's climb on 1-1, 2026-10-28)
    if (opts.lightRoom) {
      const hallOut = c.createGain();
      hallOut.gain.value = 0.85;
      this.sends.music.connect(hallOut);
      hallOut.connect(this.reverbIn);
    } else {
      const hall = c.createConvolver();
      hall.buffer = makeHall(c, opts.hallSeconds ?? 2.7);
      const hallOut = c.createGain();
      hallOut.gain.value = 0.85;
      this.sends.music.connect(hall);
      hall.connect(hallOut);
      hallOut.connect(this.master);
    }
    this.musicEchoSend = c.createGain();
    this.musicEchoSend.connect(this.delayIn);

    this.noise = makeNoise(c, 2.5, false);
    this.pinkNoise = makeNoise(c, 3.5, true);
  }

  /** delay time in seconds (a dotted eighth of the current tempo sounds best) */
  setDelayTime(sec: number) {
    const t = this.ctx.currentTime;
    this.delayL.delayTime.setTargetAtTime(sec, t, 0.05);
    this.delayR.delayTime.setTargetAtTime(sec, t, 0.05);
  }

  /** a looping/one-shot noise source starting at a random place so repeated hits never sound identical */
  noiseSource(t: number, dur: number, pink = false): AudioBufferSourceNode {
    const src = this.ctx.createBufferSource();
    src.buffer = pink ? this.pinkNoise : this.noise;
    src.loop = true;
    const off = Math.random() * (src.buffer.duration - 0.2);
    src.start(t, off);
    src.stop(t + dur);
    return src;
  }

  /** a gain node that feeds the reverb at `level` and goes straight to `dst` at 1 */
  withReverb(dst: AudioNode, level: number, bus: 'music' | 'sfx' | 'amb' = 'sfx'): GainNode {
    const g = this.ctx.createGain();
    g.connect(dst);
    if (level > 0) {
      const s = this.ctx.createGain();
      s.gain.value = level;
      g.connect(s);
      s.connect(this.sends[bus]);
    }
    return g;
  }
}

/** gentle tanh-like saturation so a loud mix rounds off instead of cracking */
function softClipCurve(): Float32Array<ArrayBuffer> {
  const n = 2048;
  const curve = new Float32Array(new ArrayBuffer(n * 4));
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    curve[i] = Math.tanh(x * 1.15) / Math.tanh(1.15);
  }
  return curve;
}

function makeNoise(ctx: BaseAudioContext, seconds: number, pink: boolean): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  if (!pink) {
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  } else {
    // Paul Kellet's economy pink filter
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856;
      b4 = 0.55 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.016898;
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
  }
  return buf;
}

/**
 * A light room for phones: four feedback delays (a Schroeder comb bank) with a low-pass in each loop, so the tail darkens as it fades, two to each
 * ear at different lengths so the sides differ. All of it runs on the sound thread in plain delays, gains and filters, a small fraction of what the
 * convolution rooms cost. `seconds` is the time for the tail to fall 60 dB. Returns the room's input and output.
 */
function makeLightRoom(c: BaseAudioContext, seconds: number): [AudioNode, AudioNode] {
  const input = c.createGain();
  input.gain.value = 0.32;
  const merger = c.createChannelMerger(2);
  const tone = c.createBiquadFilter();
  tone.type = 'highpass';
  tone.frequency.value = 180;
  input.connect(tone);
  [0.0297, 0.0371, 0.0411, 0.0437].forEach((len, i) => {
    const d = c.createDelay(0.1);
    d.delayTime.value = len;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 3400 - i * 300;
    // no bump at the corner (a Web Audio low-pass's Q is in dB and peaks by default): any gain above 1 in a feedback loop rings up forever
    lp.Q.value = -6;
    const fb = c.createGain();
    fb.gain.value = Math.pow(10, (-3 * len) / seconds);
    tone.connect(d);
    d.connect(lp);
    lp.connect(fb);
    fb.connect(d);
    lp.connect(merger, 0, i % 2);
  });
  return [input, merger];
}

/** a small lush room: decorrelated stereo noise with an exponential tail that gets darker as it fades */
function makeImpulse(ctx: BaseAudioContext, seconds: number): AudioBuffer {
  const sr = ctx.sampleRate;
  const len = Math.floor(sr * seconds);
  const buf = ctx.createBuffer(2, len, sr);
  const pre = Math.floor(sr * 0.012);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let lp = 0;
    for (let i = pre; i < len; i++) {
      const t = (i - pre) / sr;
      const env = Math.exp(-t * 3.1) * (1 - Math.exp(-t * 90));
      // darker over time: one-pole low-pass whose cutoff falls
      const a = Math.min(0.92, 0.28 + t * 0.55);
      lp = lp * a + (Math.random() * 2 - 1) * (1 - a);
      d[i] = lp * env * 2.6;
    }
  }
  return buf;
}

/**
 * A concert hall for the music: a pause before the room answers, a cluster of first reflections off the nearest walls (different in each ear),
 * then a long diffuse tail that falls faster in the highs than in the lows, as air and cloth soak up treble first. Levelled to carry the same energy as
 * the small room, so the music's reverb sends mean the same thing they did.
 */
function makeHall(ctx: BaseAudioContext, seconds: number): AudioBuffer {
  const sr = ctx.sampleRate;
  const len = Math.floor(sr * (seconds * 1.35));
  const buf = ctx.createBuffer(2, len, sr);
  const pre = Math.floor(sr * 0.026);
  // decay rates (per second) of the three bands: lows ring longest
  const kLow = 6.9 / (seconds * 1.25);
  const kMid = 6.9 / seconds;
  const kHigh = 6.9 / (seconds * 0.5);
  let seed = 90210;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    // first reflections: sixteen taps in the first 90 ms, each a little darker than the last
    for (let k = 0; k < 16; k++) {
      const at = pre + Math.floor(sr * (0.004 + (k / 16) * 0.09 + (rnd() * 0.5 + 0.5) * 0.004 + ch * 0.0017));
      const amp = (0.55 * Math.pow(0.86, k)) * (rnd() > 0 ? 1 : -1);
      let lp = 0;
      for (let j = 0; j < 40 && at + j < len; j++) {
        lp += (rnd() - lp) * Math.max(0.15, 0.7 - k * 0.04);
        d[at + j] += lp * amp * Math.exp(-j / 12);
      }
    }
    // the tail: three noise bands with their own decay
    let lo = 0, hi = 0, hiPrev = 0;
    for (let i = pre; i < len; i++) {
      const t = (i - pre) / sr;
      const w = rnd();
      lo += (w - lo) * 0.045; // below ~300 Hz
      hi = 0.75 * (hi + w - hiPrev); // above ~3 kHz
      hiPrev = w;
      const mid = w - lo - hi * 0.35;
      const onset = Math.min(1, t / 0.05);
      const swell = onset * onset * (3 - 2 * onset);
      d[i] += swell * (lo * 5.5 * Math.exp(-t * kLow) + mid * 0.8 * Math.exp(-t * kMid) + hi * 0.55 * Math.exp(-t * kHigh));
    }
  }
  // the same energy as the small room (see makeImpulse), so a send level means the same in both
  const ref = makeImpulse(ctx, 2.1);
  let eHall = 0;
  let eRef = 0;
  for (let ch = 0; ch < 2; ch++) {
    const a = buf.getChannelData(ch);
    const b = ref.getChannelData(ch);
    for (let i = 0; i < a.length; i++) eHall += a[i] * a[i];
    for (let i = 0; i < b.length; i++) eRef += b[i] * b[i];
  }
  const norm = Math.sqrt(eRef / Math.max(1e-9, eHall));
  for (let ch = 0; ch < 2; ch++) {
    const a = buf.getChannelData(ch);
    for (let i = 0; i < a.length; i++) a[i] *= norm;
  }
  return buf;
}

// ---------------------------------------------------------------------------------------------
// Envelope helper shared by every voice
// ---------------------------------------------------------------------------------------------

/** attack to `peak`, then fall exponentially toward `sustain` and release after `hold` seconds */
export function envelope(
  p: AudioParam,
  t: number,
  o: { a: number; peak: number; d?: number; sustain?: number; hold: number; r: number }
) {
  const floor = 0.0001;
  p.cancelScheduledValues(t);
  p.setValueAtTime(floor, t);
  p.linearRampToValueAtTime(Math.max(floor, o.peak), t + Math.max(0.002, o.a));
  const sus = Math.max(floor, o.sustain ?? o.peak);
  if (o.d !== undefined && sus < o.peak) p.setTargetAtTime(sus, t + o.a, o.d / 3);
  const end = t + Math.max(o.a + 0.001, o.hold);
  p.setTargetAtTime(floor, end, o.r / 4);
  return end + o.r;
}
