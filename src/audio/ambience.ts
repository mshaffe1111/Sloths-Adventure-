/**
 * Ambience: the sound of the place itself, under the music.
 *
 * Each world has a bed (a few layers of filtered noise that slowly breathe, like wind, water or rain) and a set of
 * random events (a bird, a drip, a frog, thunder) that fire at irregular intervals. Events pan around the stereo
 * field so the forest feels wide, and are thrown into the reverb so caves sound like caves.
 */
import { AudioCore } from './core.ts';
import { midiHz } from './theory.ts';

export type AmbientType =
  | 'gentle_breeze'
  | 'river_flow'
  | 'deep_cave'
  | 'waterfall'
  | 'tropical_birds'
  | 'swamp_croaks'
  | 'ancient_echo'
  | 'twilight_crickets'
  | 'volcanic_hum'
  | 'thunderstorm';

const FLOOR = 0.0001;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

interface Bed {
  pink: boolean;
  type: BiquadFilterType;
  f: number;
  q?: number;
  gain: number;
  /** slow swell: [rate Hz, depth 0..1 of the gain] */
  lfo?: [number, number];
}

interface AmbEvent {
  /** seconds between firings [min, max] */
  gap: [number, number];
  fire: (core: AudioCore, dst: AudioNode, t: number) => void;
}

interface AmbDef {
  beds: Bed[];
  /** a steady low sine (volcano, cave) */
  hum?: [hz: number, gain: number];
  events: AmbEvent[];
  /** reverb amount for the events */
  rev: number;
  /** overall loudness trim, measured so every place sits the same distance under the music */
  level: number;
}

// ---------------------------------------------------------------------------------------------
// One-shot sounds used by the events
// ---------------------------------------------------------------------------------------------

function pan(core: AudioCore, dst: AudioNode, p: number): GainNode {
  const g = core.ctx.createGain();
  const sp = core.ctx.createStereoPanner();
  sp.pan.value = p;
  g.connect(sp);
  sp.connect(dst);
  return g;
}

function blip(core: AudioCore, dst: AudioNode, t: number, o: { type?: OscillatorType; f0: number; f1?: number; dec: number; peak: number; attack?: number; vib?: [number, number] }) {
  const c = core.ctx;
  const os = c.createOscillator();
  os.type = o.type ?? 'sine';
  os.frequency.setValueAtTime(o.f0, t);
  if (o.f1) os.frequency.exponentialRampToValueAtTime(o.f1, t + o.dec);
  let lfo: OscillatorNode | null = null;
  if (o.vib) {
    lfo = c.createOscillator();
    lfo.frequency.value = o.vib[0];
    const lg = c.createGain();
    lg.gain.value = o.vib[1];
    lfo.connect(lg);
    lg.connect(os.frequency);
    lfo.start(t);
    lfo.stop(t + o.dec + 0.05);
  }
  const g = c.createGain();
  const a = o.attack ?? 0.006;
  g.gain.setValueAtTime(FLOOR, t);
  g.gain.linearRampToValueAtTime(o.peak, t + a);
  g.gain.exponentialRampToValueAtTime(FLOOR, t + a + o.dec);
  os.connect(g);
  g.connect(dst);
  os.start(t);
  os.stop(t + a + o.dec + 0.03);
}

function noiseBurst(core: AudioCore, dst: AudioNode, t: number, o: { type: BiquadFilterType; f0: number; f1?: number; q?: number; peak: number; dec: number; attack?: number; pink?: boolean }) {
  const c = core.ctx;
  const a = o.attack ?? 0.002;
  const src = core.noiseSource(t, o.dec + a + 0.05, o.pink);
  const f = c.createBiquadFilter();
  f.type = o.type;
  f.frequency.setValueAtTime(o.f0, t);
  if (o.f1) f.frequency.exponentialRampToValueAtTime(o.f1, t + a + o.dec);
  f.Q.value = o.q ?? 0.8;
  const g = c.createGain();
  g.gain.setValueAtTime(FLOOR, t);
  g.gain.linearRampToValueAtTime(o.peak, t + a);
  g.gain.exponentialRampToValueAtTime(FLOOR, t + a + o.dec);
  src.connect(f);
  f.connect(g);
  g.connect(dst);
}

/** a bird: one of four songs */
function bird(core: AudioCore, dst: AudioNode, t: number, kind = Math.floor(Math.random() * 4), peak = 0.07) {
  const d = pan(core, dst, rnd(-0.8, 0.8));
  const base = rnd(0.9, 1.15);
  if (kind === 0) {
    for (let i = 0; i < 3; i++) blip(core, d, t + i * 0.1, { f0: 2500 * base, f1: 3500 * base, dec: 0.06, peak });
  } else if (kind === 1) {
    blip(core, d, t, { f0: 3000 * base, f1: 3400 * base, dec: 0.45, peak: peak * 0.8, attack: 0.05, vib: [18, 260] });
  } else if (kind === 2) {
    blip(core, d, t, { f0: 1900 * base, dec: 0.2, peak, attack: 0.03 });
    blip(core, d, t + 0.26, { f0: 2400 * base, f1: 2250 * base, dec: 0.35, peak, attack: 0.03 });
  } else {
    for (let i = 0; i < 6; i++) blip(core, d, t + i * 0.055, { f0: (3300 + (i % 2) * 400) * base, f1: 2900 * base, dec: 0.03, peak: peak * 0.8 });
  }
}

const drip = (core: AudioCore, dst: AudioNode, t: number) => {
  const d = pan(core, dst, rnd(-0.6, 0.6));
  const f = rnd(1300, 2700);
  blip(core, d, t, { f0: f * 1.3, f1: f, dec: 0.22, peak: 0.09, attack: 0.002 });
  blip(core, d, t + 0.34, { f0: f * 1.25, f1: f * 0.95, dec: 0.2, peak: 0.035, attack: 0.002 });
};

const croak = (core: AudioCore, dst: AudioNode, t: number) => {
  const c = core.ctx;
  const d = pan(core, dst, rnd(-0.85, 0.85));
  const base = rnd(95, 150);
  const pulses = Math.floor(rnd(2, 5));
  for (let i = 0; i < pulses; i++) {
    const tt = t + i * 0.085;
    const os = c.createOscillator();
    os.type = 'sawtooth';
    os.frequency.setValueAtTime(base * 1.4, tt);
    os.frequency.exponentialRampToValueAtTime(base, tt + 0.06);
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = rnd(380, 520);
    bp.Q.value = 3;
    const g = c.createGain();
    g.gain.setValueAtTime(FLOOR, tt);
    g.gain.linearRampToValueAtTime(0.16, tt + 0.01);
    g.gain.exponentialRampToValueAtTime(FLOOR, tt + 0.075);
    os.connect(bp);
    bp.connect(g);
    g.connect(d);
    os.start(tt);
    os.stop(tt + 0.1);
  }
};

const cricket = (core: AudioCore, dst: AudioNode, t: number, hz: number) => {
  const d = pan(core, dst, rnd(-0.9, 0.9));
  const n = Math.floor(rnd(3, 6));
  for (let i = 0; i < n; i++) blip(core, d, t + i * 0.062, { f0: hz * rnd(0.99, 1.01), dec: 0.03, peak: 0.028, attack: 0.004 });
};

const thunder = (core: AudioCore, dst: AudioNode, t: number) => {
  const c = core.ctx;
  noiseBurst(core, dst, t, { type: 'bandpass', f0: 1400, f1: 300, q: 0.6, peak: 0.34, dec: 0.18 });
  noiseBurst(core, dst, t + 0.05, { type: 'lowpass', f0: 600, f1: 70, q: 0.7, peak: 0.55, dec: 3.2, attack: 0.15, pink: true });
  blip(core, dst, t + 0.1, { f0: 60, f1: 32, dec: 2.2, peak: 0.34, attack: 0.1 });
  // a second, further rumble
  noiseBurst(core, dst, t + rnd(0.7, 1.4), { type: 'lowpass', f0: 300, f1: 60, q: 0.7, peak: 0.25, dec: 2.2, attack: 0.3, pink: true });
  void c;
};

const gust = (core: AudioCore, dst: AudioNode, t: number) => {
  const d = pan(core, dst, rnd(-0.5, 0.5));
  noiseBurst(core, d, t, { type: 'bandpass', f0: 350, f1: 1100, q: 0.9, peak: 0.12, dec: rnd(1.4, 2.4), attack: 0.8, pink: true });
};

const plop = (core: AudioCore, dst: AudioNode, t: number) => {
  const d = pan(core, dst, rnd(-0.7, 0.7));
  const f = rnd(350, 700);
  blip(core, d, t, { f0: f * 0.6, f1: f * 1.8, dec: 0.09, peak: 0.1, attack: 0.002 });
};

// ---------------------------------------------------------------------------------------------
// The ten places
// ---------------------------------------------------------------------------------------------

const DEFS: Record<AmbientType, AmbDef> = {
  gentle_breeze: {
    level: 0.6,
    rev: 0.25,
    beds: [
      { pink: true, type: 'lowpass', f: 650, gain: 0.2, lfo: [0.07, 0.5] },
      { pink: true, type: 'bandpass', f: 1900, q: 0.6, gain: 0.05, lfo: [0.11, 0.6] },
    ],
    events: [
      { gap: [2.5, 7], fire: (c, d, t) => bird(c, d, t) },
      { gap: [6, 14], fire: (c, d, t) => bird(c, d, t, 2, 0.04) },
      { gap: [5, 11], fire: (c, d, t) => noiseBurst(c, d, t, { type: 'bandpass', f0: 4200, q: 0.8, peak: 0.04, dec: 0.5, attack: 0.15, pink: true }) },
    ],
  },
  river_flow: {
    level: 0.4,
    rev: 0.2,
    beds: [
      { pink: true, type: 'bandpass', f: 900, q: 0.4, gain: 0.28, lfo: [0.2, 0.25] },
      { pink: false, type: 'highpass', f: 3500, gain: 0.04, lfo: [0.35, 0.5] },
      { pink: true, type: 'lowpass', f: 220, gain: 0.12 },
    ],
    events: [
      { gap: [0.9, 3.2], fire: plop },
      { gap: [4, 9], fire: (c, d, t) => bird(c, d, t) },
    ],
  },
  deep_cave: {
    level: 0.5,
    rev: 0.9,
    hum: [48, 0.05],
    beds: [
      { pink: true, type: 'lowpass', f: 160, gain: 0.3, lfo: [0.05, 0.4] },
      { pink: true, type: 'bandpass', f: 420, q: 3, gain: 0.035, lfo: [0.08, 0.8] },
    ],
    events: [
      { gap: [1.2, 4.5], fire: drip },
      { gap: [11, 22], fire: (c, d, t) => noiseBurst(c, d, t, { type: 'lowpass', f0: 150, f1: 70, peak: 0.2, dec: 2.5, attack: 1, pink: true }) },
    ],
  },
  waterfall: {
    level: 0.22,
    rev: 0.35,
    beds: [
      { pink: false, type: 'bandpass', f: 2200, q: 0.3, gain: 0.2, lfo: [0.13, 0.12] },
      { pink: true, type: 'lowpass', f: 420, gain: 0.34 },
      { pink: false, type: 'highpass', f: 7000, gain: 0.04, lfo: [0.2, 0.4] },
    ],
    events: [
      { gap: [6, 13], fire: (c, d, t) => bird(c, d, t, 2, 0.04) },
      { gap: [3, 8], fire: (c, d, t) => noiseBurst(c, d, t, { type: 'highpass', f0: 5000, peak: 0.07, dec: 1.4, attack: 0.6 }) },
    ],
  },
  tropical_birds: {
    level: 1.3,
    rev: 0.3,
    beds: [
      { pink: true, type: 'lowpass', f: 520, gain: 0.08, lfo: [0.06, 0.5] },
      { pink: true, type: 'bandpass', f: 5400, q: 3, gain: 0.018, lfo: [6, 0.9] },
    ],
    events: [
      { gap: [0.6, 2.4], fire: (c, d, t) => bird(c, d, t, undefined, 0.08) },
      { gap: [1.6, 4], fire: (c, d, t) => bird(c, d, t, undefined, 0.06) },
      { gap: [9, 20], fire: (c, d, t) => blip(c, pan(c, d, rnd(-0.8, 0.8)), t, { f0: 420, f1: 660, dec: 0.25, peak: 0.07, attack: 0.04, vib: [9, 40] }) },
    ],
  },
  swamp_croaks: {
    level: 0.85,
    rev: 0.3,
    beds: [
      { pink: true, type: 'lowpass', f: 260, gain: 0.22, lfo: [0.05, 0.3] },
      { pink: true, type: 'bandpass', f: 4600, q: 4, gain: 0.022, lfo: [9, 0.9] },
    ],
    events: [
      { gap: [1.2, 3.6], fire: croak },
      { gap: [2, 6], fire: croak },
      { gap: [3, 9], fire: plop },
    ],
  },
  ancient_echo: {
    level: 0.65,
    rev: 0.9,
    beds: [
      { pink: true, type: 'bandpass', f: 280, q: 1.2, gain: 0.2, lfo: [0.06, 0.6] },
      { pink: true, type: 'lowpass', f: 90, gain: 0.26 },
    ],
    events: [
      { gap: [6, 13], fire: (c, d, t) => { const f = midiHz([57, 60, 64, 67, 69][Math.floor(Math.random() * 5)]); blip(c, d, t, { f0: f, dec: 2.6, peak: 0.06, attack: 0.01 }); blip(c, d, t, { f0: f * 2.76, dec: 1.2, peak: 0.02, attack: 0.01 }); } },
      { gap: [4, 10], fire: (c, d, t) => noiseBurst(c, pan(c, d, rnd(-0.7, 0.7)), t, { type: 'bandpass', f0: 1800, q: 3, peak: 0.05, dec: 0.12 }) },
      { gap: [8, 16], fire: gust },
    ],
  },
  twilight_crickets: {
    level: 1.4,
    rev: 0.3,
    beds: [{ pink: true, type: 'lowpass', f: 420, gain: 0.07, lfo: [0.07, 0.5] }],
    events: [
      { gap: [0.8, 1.5], fire: (c, d, t) => cricket(c, d, t, 4300) },
      { gap: [0.9, 1.7], fire: (c, d, t) => cricket(c, d, t, 4700) },
      { gap: [1, 2], fire: (c, d, t) => cricket(c, d, t, 5200) },
      {
        gap: [11, 22],
        fire: (c, d, t) => {
          const p = pan(c, d, rnd(-0.6, 0.6));
          blip(c, p, t, { f0: 430, f1: 390, dec: 0.28, peak: 0.07, attack: 0.05 });
          blip(c, p, t + 0.45, { f0: 410, f1: 330, dec: 0.5, peak: 0.07, attack: 0.05 });
        },
      },
    ],
  },
  volcanic_hum: {
    level: 0.35,
    rev: 0.5,
    hum: [42, 0.1],
    beds: [
      { pink: true, type: 'lowpass', f: 90, gain: 0.45, lfo: [0.08, 0.3] },
      { pink: true, type: 'bandpass', f: 900, q: 2, gain: 0.03, lfo: [0.2, 0.9] },
    ],
    events: [
      { gap: [0.2, 0.9], fire: (c, d, t) => noiseBurst(c, pan(c, d, rnd(-0.8, 0.8)), t, { type: 'bandpass', f0: rnd(1800, 4200), q: 2, peak: 0.07, dec: 0.012 }) },
      { gap: [6, 12], fire: (c, d, t) => noiseBurst(c, d, t, { type: 'highpass', f0: 1500, f1: 5000, peak: 0.1, dec: 2, attack: 0.5 }) },
      { gap: [9, 18], fire: (c, d, t) => { noiseBurst(c, d, t, { type: 'lowpass', f0: 240, f1: 50, peak: 0.5, dec: 1.8, attack: 0.04, pink: true }); blip(c, d, t, { f0: 55, f1: 30, dec: 1.4, peak: 0.3, attack: 0.03 }); } },
    ],
  },
  thunderstorm: {
    level: 0.28,
    rev: 0.7,
    beds: [
      { pink: false, type: 'highpass', f: 1800, gain: 0.1, lfo: [0.1, 0.2] },
      { pink: true, type: 'bandpass', f: 3500, q: 0.3, gain: 0.12 },
      { pink: true, type: 'bandpass', f: 520, q: 0.8, gain: 0.16, lfo: [0.09, 0.6] },
    ],
    events: [
      { gap: [6, 15], fire: thunder },
      { gap: [5, 12], fire: gust },
    ],
  },
};

/** every place that has a sound */
export const AMBIENT_TYPES = Object.keys(DEFS) as AmbientType[];

// ---------------------------------------------------------------------------------------------
// The player of all that
// ---------------------------------------------------------------------------------------------

interface Running {
  type: AmbientType;
  def: AmbDef;
  mix: GainNode;
  events: GainNode;
  sources: AudioScheduledSourceNode[];
  nodes: AudioNode[];
  nextAt: number[];
}

export class Ambience {
  private cur: Running | null = null;
  private readonly core: AudioCore;
  /** one-shot events that need the world quiet (low power) are skipped when true */
  lite = false;

  constructor(core: AudioCore) {
    this.core = core;
  }

  get type(): AmbientType | null {
    return this.cur?.type ?? null;
  }

  start(type: AmbientType, fade = 1.6) {
    if (this.cur?.type === type) return;
    this.stop(fade);
    const c = this.core.ctx;
    const def = DEFS[type];
    const now = c.currentTime;
    const mix = c.createGain();
    mix.gain.setValueAtTime(0, now);
    mix.gain.linearRampToValueAtTime(def.level, now + fade);
    mix.connect(this.core.amb);
    const events = this.core.withReverb(mix, def.rev);
    const run: Running = { type, def, mix, events, sources: [], nodes: [mix, events], nextAt: def.events.map((e) => now + rnd(0.5, e.gap[1])) };

    for (const b of def.beds) {
      const src = c.createBufferSource();
      src.buffer = b.pink ? this.core.pinkNoise : this.core.noise;
      src.loop = true;
      src.start(now, Math.random() * (src.buffer.duration - 0.1));
      const f = c.createBiquadFilter();
      f.type = b.type;
      f.frequency.value = Math.min(b.f, c.sampleRate / 2 - 200);
      f.Q.value = b.q ?? 0.7;
      const g = c.createGain();
      g.gain.value = b.gain;
      src.connect(f);
      f.connect(g);
      g.connect(mix);
      run.sources.push(src);
      run.nodes.push(f, g);
      if (b.lfo) {
        const lfo = c.createOscillator();
        lfo.frequency.value = b.lfo[0] * rnd(0.85, 1.15);
        const lg = c.createGain();
        lg.gain.value = b.gain * b.lfo[1];
        lfo.connect(lg);
        lg.connect(g.gain);
        lfo.start(now);
        run.sources.push(lfo);
        run.nodes.push(lg);
      }
    }
    if (def.hum) {
      const o = c.createOscillator();
      o.frequency.value = def.hum[0];
      const g = c.createGain();
      g.gain.value = def.hum[1];
      o.connect(g);
      g.connect(mix);
      o.start(now);
      run.sources.push(o);
      run.nodes.push(g);
    }
    this.cur = run;
  }

  /** schedule random events that fall before `until` */
  update(until: number) {
    const r = this.cur;
    if (!r) return;
    const now = this.core.ctx.currentTime;
    r.def.events.forEach((e, i) => {
      let guard = 0;
      while (r.nextAt[i] < until && guard++ < 8) {
        const t = Math.max(r.nextAt[i], now + 0.02);
        if (!(this.lite && e.gap[0] < 1)) e.fire(this.core, r.events, t);
        r.nextAt[i] += rnd(e.gap[0], e.gap[1]);
      }
    });
  }

  stop(fade = 0.8) {
    const r = this.cur;
    if (!r) return;
    this.cur = null;
    const c = this.core.ctx;
    const t = c.currentTime;
    r.mix.gain.cancelScheduledValues(t);
    r.mix.gain.setValueAtTime(r.mix.gain.value, t);
    r.mix.gain.linearRampToValueAtTime(0, t + fade);
    for (const s of r.sources) {
      try {
        s.stop(t + fade + 0.1);
      } catch {
        /* already stopped */
      }
    }
    // let the reverb tail die, then free the nodes
    setTimeout(() => {
      for (const n of r.nodes) {
        try {
          n.disconnect();
        } catch {
          /* gone */
        }
      }
    }, (fade + 3) * 1000);
  }
}
