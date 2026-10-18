/**
 * Audio core: the mixing desk every sound goes through.
 *
 *   sfx / music / ambience buses -> master -> compressor -> soft clipper -> speakers
 *   plus a shared reverb (generated room, no files) and a ping-pong delay that any voice can send to.
 *
 * Works on any BaseAudioContext, so the exact same graph runs live in the browser and offline in tests
 * (OfflineAudioContext renders a track to samples so it can be measured without speakers).
 */

export interface AudioCoreOptions {
  /** quality of the reverb tail in seconds */
  reverbSeconds?: number;
}

export class AudioCore {
  readonly ctx: BaseAudioContext;
  readonly master: GainNode;
  readonly sfx: GainNode;
  readonly music: GainNode;
  /** between the music bus and its filter: dips the music under stingers and dialogue */
  readonly musicDuck: GainNode;
  readonly amb: GainNode;
  /** low-pass on the music bus: closes when the game is paused (a muffled "underwater" feel) */
  readonly musicFilter: BiquadFilterNode;
  readonly reverbIn: GainNode;
  readonly delayIn: GainNode;
  private readonly delayL: DelayNode;
  private readonly delayR: DelayNode;
  readonly noise: AudioBuffer;
  readonly pinkNoise: AudioBuffer;
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
    clip.oversample = '2x';
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
    // levels: music sits under the effects so pickups and hits stay readable
    this.music.gain.value = 0.32;
    this.sfx.gain.value = 0.9;
    this.amb.gain.value = 0.6;
    this.sfx.connect(this.master);
    this.music.connect(this.musicDuck);
    this.musicDuck.connect(this.musicFilter);
    this.musicFilter.connect(this.master);
    this.amb.connect(this.master);

    // ---- reverb
    this.reverbIn = c.createGain();
    const conv = c.createConvolver();
    conv.buffer = makeImpulse(c, opts.reverbSeconds ?? 2.1);
    const revOut = c.createGain();
    revOut.gain.value = 0.9;
    this.reverbIn.connect(conv);
    conv.connect(revOut);
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
  withReverb(dst: AudioNode, level: number): GainNode {
    const g = this.ctx.createGain();
    g.connect(dst);
    if (level > 0) {
      const s = this.ctx.createGain();
      s.gain.value = level;
      g.connect(s);
      s.connect(this.reverbIn);
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
