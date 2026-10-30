/**
 * Sound effects. Every effect is built from a few layers, the way game audio is made:
 *
 *   body       the pitched or thumping core of the sound
 *   transient  a very short click or snap that makes it feel hit, not just played
 *   air        filtered noise that gives it motion and texture
 *   tail       reverb or a ringing note that lets it breathe
 *
 * Pitches are randomised a few percent each time, so ten jumps in a row never sound like one sample repeated.
 * Pickups are locked to the key of the music that is playing, so collecting things plays along with the song.
 */
import { AudioCore, envelope } from './core.ts';
import { congaHi, marimba, type NoteVoice } from './instruments.ts';
import { fxGain } from './sfxMix.ts';
import type { KeyInfo } from './music.ts';
import { roarPitch } from './combat.ts';
import { midiHz } from './theory.ts';

const FLOOR = 0.0001;
const jit = (amt = 0.05) => 1 + (Math.random() * 2 - 1) * amt;

// ---------------------------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------------------------

interface ToneOpts {
  t: number;
  type?: OscillatorType;
  f0: number;
  /** pitch at the end of the sweep */
  f1?: number;
  /** seconds to reach f1 (default = decay) */
  sweep?: number;
  peak: number;
  attack?: number;
  dec: number;
  dst: AudioNode;
  lp?: number;
  detune?: number;
}

function tone(core: AudioCore, o: ToneOpts) {
  const c = core.ctx;
  const a = o.attack ?? 0.004;
  const end = o.t + a + o.dec;
  const os = c.createOscillator();
  os.type = o.type ?? 'sine';
  os.frequency.setValueAtTime(Math.max(20, o.f0), o.t);
  if (o.f1 !== undefined) os.frequency.exponentialRampToValueAtTime(Math.max(20, o.f1), o.t + (o.sweep ?? o.dec));
  if (o.detune) os.detune.value = o.detune;
  const g = c.createGain();
  g.gain.setValueAtTime(FLOOR, o.t);
  g.gain.linearRampToValueAtTime(o.peak, o.t + a);
  g.gain.exponentialRampToValueAtTime(FLOOR, end);
  let node: AudioNode = os;
  if (o.lp) {
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = o.lp;
    os.connect(f);
    node = f;
  }
  node.connect(g);
  g.connect(o.dst);
  os.start(o.t);
  os.stop(end + 0.03);
}

interface NoiseOpts {
  t: number;
  type: BiquadFilterType;
  f0: number;
  f1?: number;
  q?: number;
  peak: number;
  attack?: number;
  dec: number;
  dst: AudioNode;
  pink?: boolean;
}

function noise(core: AudioCore, o: NoiseOpts) {
  const c = core.ctx;
  const a = o.attack ?? 0.002;
  const end = o.t + a + o.dec;
  const src = core.noiseSource(o.t, o.dec + a + 0.05, o.pink);
  const f = c.createBiquadFilter();
  f.type = o.type;
  f.frequency.setValueAtTime(o.f0, o.t);
  if (o.f1 !== undefined) f.frequency.exponentialRampToValueAtTime(Math.max(30, o.f1), end);
  f.Q.value = o.q ?? 0.8;
  const g = c.createGain();
  g.gain.setValueAtTime(FLOOR, o.t);
  g.gain.linearRampToValueAtTime(o.peak, o.t + a);
  g.gain.exponentialRampToValueAtTime(FLOOR, end);
  src.connect(f);
  f.connect(g);
  g.connect(o.dst);
}

interface SampleOpts {
  gain?: number;
  /** playback speed: also raises the pitch (1 = as recorded). Light hits play faster so phone speakers can reproduce them */
  rate?: number;
  lp?: number;
  hp?: number;
  /** saturation: adds harmonics to the low thump so it can be heard on small speakers (0 = none) */
  sat?: number;
  pan?: number;
}

const satCurves = new Map<number, Float32Array<ArrayBuffer>>();
function satCurve(k: number): Float32Array<ArrayBuffer> {
  let c = satCurves.get(k);
  if (!c) {
    c = new Float32Array(new ArrayBuffer(1024 * 4));
    for (let i = 0; i < 1024; i++) {
      const x = (i / 1023) * 2 - 1;
      c[i] = Math.tanh(x * k) / Math.tanh(k);
    }
    satCurves.set(k, c);
  }
  return c;
}

const lastPick = new Map<string, number>();
/**
 * Play one recording from a group ("punchM" has five versions; it never plays the same one twice in a row).
 * Returns false when the group is not loaded yet, and the effect then relies on its synthesized layers.
 */
function smp(core: AudioCore, dst: AudioNode, t: number, group: string, o: SampleOpts = {}): boolean {
  const list = core.samples.get(group);
  if (!list || list.length === 0) return false;
  let i = Math.floor(Math.random() * list.length);
  const last = lastPick.get(group);
  if (list.length > 1 && i === last) i = (i + 1 + Math.floor(Math.random() * (list.length - 1))) % list.length;
  lastPick.set(group, i);
  const c = core.ctx;
  const src = c.createBufferSource();
  src.buffer = list[i];
  src.playbackRate.value = (o.rate ?? 1) * jit(0.04);
  let node: AudioNode = src;
  const chain = (n: AudioNode) => {
    node.connect(n);
    node = n;
  };
  if (o.hp) {
    const f = c.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = o.hp;
    chain(f);
  }
  if (o.sat) {
    const w = c.createWaveShaper();
    w.curve = satCurve(o.sat);
    w.oversample = '2x';
    chain(w);
  }
  if (o.lp) {
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = o.lp;
    chain(f);
  }
  const g = c.createGain();
  g.gain.value = o.gain ?? 1;
  chain(g);
  if (o.pan && 'createStereoPanner' in c) {
    const p = c.createStereoPanner();
    p.pan.value = o.pan;
    chain(p);
  }
  node.connect(dst);
  src.start(t);
  return true;
}

/** a sound made of a quick chain of short chirps (birds, critters, tayra chatter) */
function chirps(core: AudioCore, dst: AudioNode, t: number, o: { n: number; gap: number; f0: number; f1: number; dec: number; peak: number; type?: OscillatorType }) {
  for (let i = 0; i < o.n; i++) {
    const j = jit(0.06);
    tone(core, { t: t + i * o.gap, type: o.type ?? 'sine', f0: o.f0 * j, f1: o.f1 * j, dec: o.dec, peak: o.peak, dst, attack: 0.006 });
  }
}

/** the n-th rung of a rising triad ladder in the music's key (0 = tonic, 2 = fifth, 3 = octave ...) */
export function ladder(key: KeyInfo, n: number, low = 72): number {
  const idx = [0, 2, 4, 7, 9, 11, 14, 16][Math.max(0, Math.min(7, n))];
  const base = low + (((key.tonic - low) % 12) + 12) % 12;
  return base + key.scale[idx % 7] + 12 * Math.floor(idx / 7);
}

const note = (core: AudioCore, voice: NoteVoice, t: number, midi: number, vel: number, dst: AudioNode) => {
  voice(core, dst, t, midiHz(midi), 0.3, vel);
};

// ---------------------------------------------------------------------------------------------
// Variation: which version of an effect plays and how long the combo is (set by runFx for the duration of a call)
// ---------------------------------------------------------------------------------------------

/** 0..3: which of an effect's alternate versions to play; the Conductor never repeats the same one twice in a row */
let VAR = 0;
/** hits landed in a row within about a second: sweetens the hit sounds */
let STREAK = 0;
const byVar = <T,>(a: T[]): T => a[VAR % a.length];


// ---------------------------------------------------------------------------------------------
// The effects. `a` is an optional argument (combo count, power-up kind, strength ...)
// ---------------------------------------------------------------------------------------------

export type Fx = (core: AudioCore, key: KeyInfo, a?: number) => void;

/** per-effect loudness trim (set by runFx): the layered recipes are written for shape, this evens out loudness */
let TRIM = 1;
const out = (core: AudioCore, rev = 0) => {
  const g = core.withReverb(core.sfx, rev);
  g.gain.value = TRIM;
  return g;
};

export const SFX: Record<string, Fx> = {






















  /**
   * A boss roar. `a` is the world (1..10): each world's boss has its own pitch and voice, and some add a layer
   * (a hiss tail, stone grinding, fire, a metallic ring). The calls differ a little every time too.
   */
  roar(core, _k, a = 0) {
    const t = core.ctx.currentTime;
    const w = Math.round(a);
    const sc = roarPitch(w) * jit(0.05);
    const d = out(core, 0.5);
    const dur = 0.95;
    const os = core.ctx.createOscillator();
    os.type = 'sawtooth';
    os.frequency.setValueAtTime(95 * sc, t);
    os.frequency.linearRampToValueAtTime(130 * sc, t + 0.2);
    os.frequency.exponentialRampToValueAtTime(55 * sc, t + dur);
    const fm = core.ctx.createOscillator();
    fm.frequency.value = 28 * byVar([1, 1.35, 0.8, 1.15]) / Math.sqrt(sc);
    const fg = core.ctx.createGain();
    fg.gain.value = 22 * sc;
    fm.connect(fg);
    fg.connect(os.frequency);
    const lp = core.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(500 * Math.sqrt(sc), t);
    lp.frequency.linearRampToValueAtTime(1300 * Math.sqrt(sc), t + 0.25);
    lp.frequency.exponentialRampToValueAtTime(300 * Math.sqrt(sc), t + dur);
    lp.Q.value = 3;
    const g = core.ctx.createGain();
    envelope(g.gain, t, { a: 0.05, peak: 0.55, d: 0.3, sustain: 0.3, hold: dur - 0.25, r: 0.3 });
    os.connect(lp);
    lp.connect(g);
    g.connect(d);
    os.start(t);
    fm.start(t);
    os.stop(t + dur + 0.4);
    fm.stop(t + dur + 0.4);
    tone(core, { t, f0: 70 * sc, f1: 30 * sc, dec: 1.0, peak: 0.5, dst: d });
    noise(core, { t, type: 'bandpass', f0: 600 * sc, f1: 300 * sc, q: 0.7, peak: 0.22, dec: dur, attack: 0.1, dst: d, pink: true });
    if (w === 1) {
      noise(core, { t: t + 0.3, type: 'highpass', f0: 4500, peak: 0.2, dec: 0.6, attack: 0.25, dst: d });
    } else if (w === 7) {
      noise(core, { t, type: 'bandpass', f0: 180, f1: 90, q: 4, peak: 0.35, dec: 0.9, dst: d });
      for (let i = 0; i < 5; i++) noise(core, { t: t + 0.08 + i * 0.13 + Math.random() * 0.04, type: 'bandpass', f0: 300, q: 3, peak: 0.2, dec: 0.08, dst: d });
    } else if (w === 9) {
      noise(core, { t, type: 'bandpass', f0: 1800, q: 0.6, peak: 0.3, dec: 0.9, attack: 0.15, dst: d, pink: true });
      for (let i = 0; i < 10; i++) noise(core, { t: t + Math.random() * 0.9, type: 'highpass', f0: 4000, peak: 0.15, dec: 0.02, dst: d });
    } else if (w === 10) {
      for (const r of [1, 2.7, 5.0]) tone(core, { t: t + 0.05, f0: 420 * r * jit(0.01), dec: 1.4, peak: 0.06 / r ** 0.5, attack: 0.01, dst: d });
      noise(core, { t, type: 'highpass', f0: 5000, peak: 0.12, dec: 0.1, dst: d });
    }
  },





  /** low health: two soft heartbeats */
  heartbeat(core) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.05);
    tone(core, { t, f0: 70, f1: 45, dec: 0.16, peak: 0.45, dst: d });
    tone(core, { t: t + 0.18, f0: 62, f1: 42, dec: 0.18, peak: 0.34, dst: d });
  },

  // ----------------------------------------------------------------- predators (a: 0 telegraph, 1 launch, 2 impact)
  ocelotCall(core, _k, a = 0) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.15);
    const pj = jit(0.1);
    if (a === 0) {
      noise(core, { t, type: 'bandpass', f0: 2900 * pj, f1: 1800, q: 1.1, peak: 0.2, dec: byVar([0.3, 0.4, 0.24, 0.34]), attack: 0.04, dst: d });
      tone(core, { t, type: 'sawtooth', f0: 560 * pj, f1: byVar([380, 300, 440, 340]), dec: 0.28, peak: 0.07, dst: d, lp: 1500 });
    } else if (a === 1) {
      noise(core, { t, type: 'bandpass', f0: 700, f1: 2000, q: 0.9, peak: 0.2, dec: 0.15, dst: d, pink: true });
      tone(core, { t, type: 'sawtooth', f0: 420, f1: 300, dec: 0.18, peak: 0.12, dst: d, lp: 1400 });
    } else {
      smp(core, d, t, 'softH', { gain: 0.9, rate: 1.4, sat: 3 });
      tone(core, { t, f0: 120, f1: 55, dec: 0.15, peak: 0.35, dst: d });
      noise(core, { t, type: 'lowpass', f0: 1500, f1: 300, peak: 0.15, dec: 0.1, dst: d, pink: true });
    }
  },

  jaguarCall(core, _k, a = 0) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.3);
    if (a === 0) {
      // a low rolling growl
      const pj = jit(0.1);
      const os = core.ctx.createOscillator();
      os.type = 'sawtooth';
      os.frequency.setValueAtTime(75 * pj, t);
      os.frequency.linearRampToValueAtTime(95 * pj, t + 0.3);
      os.frequency.exponentialRampToValueAtTime(60 * pj, t + 0.7);
      const tr = core.ctx.createOscillator();
      tr.frequency.value = byVar([24, 18, 30, 22]);
      const tg = core.ctx.createGain();
      tg.gain.value = 18;
      tr.connect(tg);
      tg.connect(os.frequency);
      const lp = core.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 650;
      lp.Q.value = 2.5;
      const g = core.ctx.createGain();
      envelope(g.gain, t, { a: 0.08, peak: 0.4, d: 0.2, sustain: 0.22, hold: byVar([0.45, 0.6, 0.35, 0.5]), r: 0.2 });
      os.connect(lp);
      lp.connect(g);
      g.connect(d);
      os.start(t);
      tr.start(t);
      os.stop(t + 1);
      tr.stop(t + 1);
      noise(core, { t, type: 'bandpass', f0: 400, q: 0.8, peak: 0.1, dec: 0.7, attack: 0.15, dst: d, pink: true });
    } else if (a === 1) {
      noise(core, { t, type: 'bandpass', f0: 300, f1: 1500, q: 0.8, peak: 0.3, dec: 0.28, dst: d, pink: true });
      tone(core, { t, type: 'sawtooth', f0: 220, f1: 110, dec: 0.3, peak: 0.2, dst: d, lp: 900 });
    } else {
      smp(core, d, t, 'punchH', { gain: 1.0, rate: 1.1, sat: 3 });
      smp(core, d, t, 'mining', { gain: 0.5, rate: 1.4, sat: 2.5 });
      tone(core, { t, f0: 100, f1: 38, dec: 0.4, peak: 0.6, dst: d });
      noise(core, { t, type: 'lowpass', f0: 2200, f1: 250, peak: 0.3, dec: 0.25, dst: d });
    }
  },

  boaCall(core, _k, a = 0) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.2);
    if (a === 0) {
      // a long hiss with a rattle at the end
      const hd = byVar([0.5, 0.65, 0.4, 0.55]);
      noise(core, { t, type: 'bandpass', f0: byVar([3000, 2600, 3400, 2800]), q: 0.55, peak: 0.8, dec: hd, attack: 0.08, dst: d, pink: true });
      noise(core, { t, type: 'bandpass', f0: 1300, q: 0.7, peak: 0.4, dec: hd, attack: 0.1, dst: d, pink: true });
    } else if (a === 1) {
      noise(core, { t, type: 'bandpass', f0: 1800, f1: 4200, q: 0.6, peak: 2.2, dec: 0.18, dst: d, pink: true });
      tone(core, { t, f0: 400, f1: 150, dec: 0.12, peak: 0.12, dst: d });
    } else {
      smp(core, d, t, 'softH', { gain: 1.0, rate: 1.25, sat: 3 });
      tone(core, { t, f0: 140, f1: 70, dec: 0.12, peak: 0.3, dst: d });
      noise(core, { t, type: 'bandpass', f0: 1500, q: 1.4, peak: 0.1, dec: 0.05, dst: d });
    }
  },

  caimanCall(core, _k, a = 0) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.25);
    if (a === 0) {
      // a bubbly, rumbling hiss
      const pj = jit(0.1);
      tone(core, { t, type: 'sawtooth', f0: 55 * pj, f1: 48 * pj, dec: byVar([0.5, 0.65, 0.4, 0.55]), peak: 0.28, dst: d, lp: 300, attack: 0.1 });
      noise(core, { t, type: 'bandpass', f0: 300 * pj, f1: 600, q: 1.5, peak: 0.16, dec: 0.5, attack: 0.1, dst: d, pink: true });
    } else if (a === 1) {
      noise(core, { t, type: 'lowpass', f0: 1000, f1: 3000, peak: 0.22, dec: 0.2, dst: d, pink: true });
    } else {
      // jaws slam: a wooden clack and a thud
      smp(core, d, t, 'woodH', { gain: 1.0, rate: 1.3, sat: 2 });
      smp(core, d, t, 'punchH', { gain: 0.8, rate: 1.1, sat: 3 });
      noise(core, { t, type: 'bandpass', f0: 2000, q: 1.6, peak: 0.3, dec: 0.045, dst: d });
      tone(core, { t, f0: 95, f1: 50, dec: 0.2, peak: 0.6, dst: d });
      noise(core, { t: t + 0.05, type: 'bandpass', f0: 1800, q: 2.2, peak: 0.25, dec: 0.04, dst: d });
    }
  },

  tayraCall(core, _k, a = 0) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.15);
    if (a === 0) {
      chirps(core, d, t, { n: byVar([5, 4, 6, 5]), gap: byVar([0.07, 0.085, 0.06, 0.075]), f0: 1700 * jit(0.1), f1: 2400, dec: 0.05, peak: 0.22, type: 'triangle' });
    } else if (a === 1) {
      noise(core, { t, type: 'bandpass', f0: 1200, f1: 3500, q: 1, peak: 0.28, dec: 0.2, dst: d, pink: true });
      chirps(core, d, t, { n: 2, gap: 0.05, f0: 2000, f1: 2800, dec: 0.05, peak: 0.1, type: 'square' });
    } else {
      smp(core, d, t, 'punchM', { gain: 0.9, rate: 1.6, sat: 3 });
      tone(core, { t, f0: 150, f1: 70, dec: 0.1, peak: 0.3, dst: d });
      noise(core, { t, type: 'highpass', f0: 2600, peak: 0.08, dec: 0.04, dst: d });
    }
  },

  // ----------------------------------------------------------------- interface
  // (the swoops run between the home note and its octave in the music's key, so pausing and resuming sit in the stage's music)
  /** the first beat of a level */
  levelStart(core, key) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.35);
    congaHi(core, d, t, 0.7);
    [0, 2, 4].forEach((n, i) => note(core, marimba, t + 0.05 + i * 0.1, ladder(key, n), 0.8, d));
  },
};

export type SfxName = keyof typeof SFX;


/** which version of the effect to play and how long the combo is: both change the sound a little */
export interface FxVariation {
  /** 0..3 */
  variant?: number;
  /** hits landed in a row */
  streak?: number;
}

/** play an effect with its loudness trim */

export function runFx(name: string, core: AudioCore, key: KeyInfo, arg?: number, v: FxVariation = {}) {
  const fn = SFX[name];
  if (!fn) return;
  TRIM = fxGain(name);
  VAR = Math.max(0, Math.floor(v.variant ?? 0));
  STREAK = Math.max(0, Math.floor(v.streak ?? 0));
  try {
    fn(core, key, arg);
  } finally {
    TRIM = 1;
    VAR = 0;
    STREAK = 0;
  }
}
