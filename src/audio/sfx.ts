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
import { runFx as runClassic } from './sfxClassic.ts';
import { AudioCore, envelope } from './core.ts';
import { bell, congaHi, harp, kalimba, marimba, pluck, rim, steelpan, woodblock, type NoteVoice } from './instruments.ts';
import { CLASSIC_WITH_BELLS, hopNote, isPingySample, landNote, orchSfxEnabled, PING_FLOOR_HZ, playFigure, soften, swapMallet, type MalletKind } from './sfxOrch.ts';
import type { KeyInfo } from './music.ts';
import { unpackHit, roarPitch, streakStage, type Material } from './combat.ts';
import { midiHz } from './theory.ts';

const FLOOR = 0.0001;
const jit = (amt = 0.05) => 1 + (Math.random() * 2 - 1) * amt;
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

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
  if (ORCH && o.type === 'highpass' && o.f0 >= PING_FLOOR_HZ) return; // the glitter on top: air, not body
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
  if (ORCH && isPingySample(group)) return false;
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

/** the orchestral set (sfxOrch.ts) is on for the effect being played: set by runFx for the duration of a call */
let ORCH = false;
const MALLETS = new Map<NoteVoice, MalletKind>([[bell, 'bell'], [kalimba, 'kalimba'], [steelpan, 'steelpan'], [marimba, 'marimba'], [pluck, 'kalimba']]);
const note = (core: AudioCore, voice: NoteVoice, t: number, midi: number, vel: number, dst: AudioNode) => {
  const kind = ORCH ? MALLETS.get(voice) : undefined;
  if (kind) {
    // a bell or a marimba is played by one of the music's own instruments instead (a different one on each version of the effect)
    const sw = swapMallet(kind, VAR, midi);
    sw.voice(core, soften(core, dst), t, midiHz(sw.midi), 0.3, vel * sw.gain);
    return;
  }
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

export type GruntKind = 'hup' | 'hah' | 'hyah' | 'oof';
const GRUNTS: Record<GruntKind, { f0: number; f1: number; dur: number; a: [number, number]; b: [number, number]; breath: number; peak: number }> = {
  hup: { f0: 150, f1: 118, dur: 0.1, a: [380, 330], b: [900, 800], breath: 0.4, peak: 1 },
  hah: { f0: 165, f1: 112, dur: 0.17, a: [720, 650], b: [1200, 1050], breath: 1, peak: 1 },
  hyah: { f0: 185, f1: 125, dur: 0.21, a: [320, 800], b: [2300, 1250], breath: 0.9, peak: 1.1 },
  oof: { f0: 140, f1: 80, dur: 0.26, a: [520, 410], b: [900, 740], breath: 0.7, peak: 1.2 },
};

/**
 * Pokey's voice: a buzzing throat tone pushed through two vowel-shaped filters (formants), plus a breath of noise.
 * It is a short, friendly effort sound, not a word.
 */
export function grunt(core: AudioCore, dst: AudioNode, t: number, kind: GruntKind, pitch = 1, level = 1) {
  const c = core.ctx;
  const p = GRUNTS[kind];
  const f0 = p.f0 * pitch * jit(0.07);
  const end = t + p.dur;
  const os = c.createOscillator();
  os.type = 'sawtooth';
  os.frequency.setValueAtTime(f0, t);
  os.frequency.exponentialRampToValueAtTime(f0 * (p.f1 / p.f0), end);
  const env = c.createGain();
  env.gain.setValueAtTime(FLOOR, t);
  env.gain.linearRampToValueAtTime(0.5 * p.peak * level, t + 0.014);
  env.gain.exponentialRampToValueAtTime(FLOOR, end + 0.02);
  const formants: Array<[[number, number], number, number]> = [[p.a, 5, 2.2], [p.b, 7, 1.4]];
  for (const [fr, q, gain] of formants) {
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = q;
    bp.frequency.setValueAtTime(fr[0], t);
    bp.frequency.linearRampToValueAtTime(fr[1], end);
    const g = c.createGain();
    g.gain.value = gain;
    os.connect(bp);
    bp.connect(g);
    g.connect(env);
  }
  env.connect(dst);
  os.start(t);
  os.stop(end + 0.05);
  noise(core, { t, type: 'bandpass', f0: p.b[0], f1: p.b[1], q: 1.2, peak: 0.07 * p.breath * level, dec: p.dur * 0.8, attack: 0.01, dst });
}

/** a small sparkle that grows with the combo: a bell at 3 hits, a harp run at 5, a shimmer at 8 */
function streakSparkle(core: AudioCore, key: KeyInfo, t: number, dst: AudioNode) {
  const stage = streakStage(STREAK);
  if (stage === 0) return;
  const base = Math.min(5, STREAK - 2);
  note(core, bell, t + 0.03, ladder(key, base), 0.12, dst);
  if (stage >= 2) {
    note(core, harp, t + 0.06, ladder(key, base - 1) + 12, 0.15, dst);
    note(core, harp, t + 0.11, ladder(key, base + 1), 0.15, dst);
  }
  if (stage >= 3) {
    note(core, bell, t + 0.16, ladder(key, 7), 0.14, dst);
    noise(core, { t: t + 0.04, type: 'highpass', f0: 6500, peak: 0.035, dec: 0.45, attack: 0.05, dst });
  }
}

/** pitch lift for the thump of a hit as the combo grows (about a semitone per hit, up to 6) */
const streakLift = () => Math.pow(2, Math.min(6, Math.max(0, STREAK - 1)) / 12);

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
  /** a soft springy hop: the pitch lifts, a push off the ground and a rustle of leaves. Four versions, and sometimes a small "hup" */
  jump(core, key) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.08);
    const j = jit(0.07);
    const [f0, f1, sw, nz] = byVar([
      [210, 430, 0.11, 0.1],
      [262, 560, 0.09, 0.07],
      [182, 340, 0.13, 0.16],
      [320, 520, 0.1, 0.05],
    ]);
    tone(core, { t, f0: f0 * j, f1: f1 * j, sweep: sw, dec: 0.15, peak: 0.28, dst: d });
    tone(core, { t, type: 'triangle', f0: f0 * 2 * j, f1: f1 * 2 * j, sweep: sw, dec: 0.09, peak: 0.07, dst: d });
    noise(core, { t, type: 'bandpass', f0: 700 + VAR * 150, f1: 1500 + VAR * 250, q: 0.9, peak: nz * 0.7, dec: 0.12, dst: d, pink: true });
    smp(core, d, t, 'stepGrass', { gain: 0.55, rate: 1.25, sat: 2 });
    smp(core, d, t + 0.01, 'cloth', { gain: 0.2, rate: 1.4 + VAR * 0.08, hp: 500, lp: 5000 });
    if (ORCH) hopNote(core, d, t + 0.01, key, VAR, 0.4);
    else if (VAR === 3) woodblock(core, d, t, 0.35);
    if (Math.random() < 0.3) grunt(core, d, t + 0.01, 'hup', 1, 0.6);
  },

  /** a second hop in mid-air: a flutter of leaves and two light notes in the key (four different pairs) */
  doubleJump(core, key) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.2);
    const [n1, n2] = byVar([[2, 3], [3, 4], [1, 3], [2, 5]]);
    smp(core, d, t, 'swishK', { gain: 0.5, rate: 1.4 + VAR * 0.06, hp: 700, lp: 5000 });
    smp(core, d, t, 'cloth', { gain: 0.3, rate: 1.7, hp: 900, lp: 5200 });
    tone(core, { t, type: 'triangle', f0: 330 * jit(), f1: 700, dec: 0.13, peak: 0.14, dst: d });
    note(core, kalimba, t + 0.02, ladder(key, n1), 0.5, d);
    note(core, kalimba, t + 0.09, ladder(key, n2), 0.45, d);
    if (Math.random() < 0.45) grunt(core, d, t, 'hup', 1.15, 0.6);
  },

  /**
   * Leaf Glide: a big leaf catching the air. `a` = 0 as it opens (an airy unfurling rustle), 1 = a small flutter now and then while drifting,
   * 2 = as it folds away (a short soft settle). Only rustle and air: no notes, so it sits under the music instead of competing with it.
   */
  glide(core, _key, a = 0) {
    const t = core.ctx.currentTime;
    const phase = Math.round(a);
    const d = out(core, 0.1);
    const j = jit(0.1);
    if (phase === 1) {
      // two or three little papery flaps, never the same twice
      const n = 2 + Math.floor(Math.random() * 2);
      for (let k = 0; k < n; k++) {
        const at = t + k * (0.045 + Math.random() * 0.03);
        noise(core, { t: at, type: 'bandpass', f0: (2300 + Math.random() * 1700) * j, f1: 1500, q: 2.2, peak: 0.07 - k * 0.012, dec: 0.05, dst: d, pink: true });
      }
      noise(core, { t, type: 'highpass', f0: 4200, peak: 0.02, dec: 0.16, attack: 0.04, dst: d, pink: true });
      return;
    }
    if (phase === 2) {
      noise(core, { t, type: 'bandpass', f0: 3000 * j, f1: 1100, q: 0.8, peak: 0.11, attack: 0.012, dec: 0.17, dst: d, pink: true });
      smp(core, d, t, 'cloth', { gain: 0.18, rate: 1.0, hp: 600, lp: 3600 });
      return;
    }
    // opening: the leaf unfurls, a rising rustle with a breath of air on top
    noise(core, { t, type: 'bandpass', f0: 1200 * j, f1: 3400, q: 0.7, peak: 0.17, attack: 0.07, dec: 0.3, dst: d, pink: true });
    noise(core, { t: t + 0.03, type: 'highpass', f0: 4800, peak: 0.05, dec: 0.28, attack: 0.08, dst: d, pink: true });
    smp(core, d, t, 'cloth', { gain: 0.34, rate: 1.15 + VAR * 0.04, hp: 800, lp: 5000 });
    smp(core, d, t + 0.02, 'swishK', { gain: 0.16, rate: 0.9, hp: 900, lp: 4200 });
  },

  /** a quick claw jab: a swish of air, a solid thump with a crack on top. Four versions, and sometimes a "hah" */
  punch(core) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.06);
    const [body, air, snap] = byVar([[190, 1600, 3200], [235, 2100, 4000], [158, 1300, 2800], [210, 1800, 3600]]);
    noise(core, { t, type: 'bandpass', f0: air, f1: air / 3.8, q: 0.8, peak: 0.16, dec: 0.1, dst: d, pink: true });
    smp(core, d, t, 'cloth', { gain: 0.4, rate: 1.5 + VAR * 0.07, hp: 450, lp: 4200 });
    const at = t + 0.035;
    smp(core, d, at, 'punchM', { gain: 1.0, rate: 1.55 + VAR * 0.06, sat: 3 });
    smp(core, d, at, 'genL', { gain: 0.45, rate: 1.9, sat: 2 });
    tone(core, { t: at, f0: body * jit(), f1: 70, dec: 0.12, peak: 0.32, dst: d });
    noise(core, { t: at, type: 'highpass', f0: snap, peak: 0.1, dec: 0.025, dst: d });
    // the fourth version is a quick double tap
    if (VAR === 3) {
      tone(core, { t: t + 0.085, f0: body * 0.8, f1: 60, dec: 0.08, peak: 0.2, dst: d });
      smp(core, d, t + 0.085, 'softM', { gain: 0.5, rate: 1.8, sat: 2 });
    }
    if (Math.random() < 0.5) grunt(core, d, t, VAR % 2 ? 'hyah' : 'hah', 1, 0.7);
  },

  /** a heavy swing: deeper and slower, a stone-crushing thud and a boom that rolls into the reverb. Always with a big shout */
  megaPunch(core) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.22);
    const k = byVar([1, 1.12, 0.9, 1.05]);
    noise(core, { t, type: 'bandpass', f0: 900 * k, f1: 220, q: 0.7, peak: 0.24, dec: 0.2, dst: d, pink: true });
    smp(core, d, t, 'cloth', { gain: 0.6, rate: 0.85 * k, hp: 250, lp: 3500 });
    const at = t + 0.06;
    smp(core, d, at, 'punchH', { gain: 1.0, rate: 1.1 * k, sat: 3.5 });
    smp(core, d, at, 'mining', { gain: 0.55, rate: 1.5 * k, sat: 2.5 });
    smp(core, d, at, 'woodH', { gain: 0.4, rate: 1.6, sat: 2 });
    tone(core, { t: at, f0: 140 * k, f1: 38, dec: 0.4, peak: 0.7, dst: d });
    noise(core, { t: at, type: 'lowpass', f0: 3000, f1: 300, peak: 0.3, dec: 0.28, dst: d });
    noise(core, { t: at, type: 'highpass', f0: 2500, peak: 0.12, dec: 0.04, dst: d });
    tone(core, { t: at, type: 'triangle', f0: 880 * k, f1: 600, dec: 0.5, peak: 0.05, dst: d });
    grunt(core, d, t, 'hyah', 0.85 * (VAR === 2 ? 0.92 : 1), 0.95);
  },

  /** a kick: like the punch but lower and rounder, with a thud of the foot. Four versions, often with a "hup" */
  kick(core) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.08);
    const [body, air] = byVar([[150, 900], [180, 1200], [126, 760], [160, 1000]]);
    noise(core, { t, type: 'bandpass', f0: air, f1: air / 3.5, q: 0.8, peak: 0.16, dec: 0.12, dst: d, pink: true });
    smp(core, d, t, 'cloth', { gain: 0.4, rate: 1.1 + VAR * 0.06, hp: 300, lp: 3800 });
    const at = t + 0.04;
    smp(core, d, at, 'softH', { gain: 0.9, rate: 1.35 + VAR * 0.05, sat: 3 });
    smp(core, d, at, 'woodL', { gain: 0.5, rate: 1.7, sat: 2 });
    tone(core, { t: at, f0: body * jit(), f1: 52, dec: 0.16, peak: 0.4, dst: d });
    noise(core, { t: at, type: 'highpass', f0: 2600 + VAR * 300, peak: 0.08, dec: 0.03, dst: d });
    if (VAR === 2) tone(core, { t: at, type: 'triangle', f0: 90, f1: 40, dec: 0.3, peak: 0.2, dst: d });
    if (Math.random() < 0.6) grunt(core, d, t, VAR % 2 ? 'hyah' : 'hup', 0.95, 0.7);
  },

  /** air only: a swish through leaves (rising, falling, airy or low), now made from a recorded swoosh */
  whoosh(core) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.1);
    const [a0, a1, b0, b1] = byVar([[500, 2400, 2400, 700], [2600, 600, 700, 2200], [1200, 3000, 3000, 1500], [300, 1200, 1200, 380]]);
    smp(core, d, t, 'cloth', { gain: 0.8, rate: byVar([1.2, 0.95, 1.5, 0.75]), hp: 250, lp: byVar([4500, 3600, 5000, 2800]) });
    noise(core, { t, type: 'bandpass', f0: a0, f1: a1, q: 0.8, peak: 0.1, dec: 0.12, attack: 0.05, dst: d, pink: true });
    noise(core, { t: t + 0.1, type: 'bandpass', f0: b0, f1: b1, q: 0.8, peak: 0.08, dec: 0.14, attack: 0.02, dst: d, pink: true });
  },

  /**
   * A hit. `a` packs how hard (bit 0) and what it landed on (a >> 1: fur, scale, chitin, feather, armor; 0 = generic).
   * Each material is built from real recordings (soft thump, wood, glass, cloth, metal, stone) with a small synthesized body under them;
   * a long combo lifts the pitch and adds sparkle.
   */
  hit(core, key, a = 0) {
    const t = core.ctx.currentTime;
    const { heavy, material } = unpackHit(a);
    const d = out(core, heavy ? 0.25 : 0.1);
    const vj = byVar([1, 1.08, 0.93, 1.15]) * jit(0.03) * streakLift();
    const H = heavy ? 1.35 : 1;
    const boom = () => heavy && tone(core, { t, type: 'triangle', f0: 90, f1: 45, dec: 0.5, peak: 0.25, dst: d });
    const m: Material = material;
    // the materials are written for shape; this evens out how loud each one is
    d.gain.value *= { generic: 1, fur: 1, scale: 1, chitin: 1, feather: 1, armor: 1 }[m];
    if (m === 'fur') {
      // a dull thump into fur: soft, no crack
      smp(core, d, t, heavy ? 'softH' : 'softM', { gain: 1.0, rate: (heavy ? 1.15 : 1.5) * vj, sat: 3 });
      smp(core, d, t, 'cloth', { gain: heavy ? 0.45 : 0.3, rate: 1.1 * vj, hp: 300, lp: 3200 });
      tone(core, { t, f0: (heavy ? 115 : 155) * vj, f1: 45, dec: heavy ? 0.3 : 0.15, peak: 0.4 * H, dst: d });
      noise(core, { t, type: 'lowpass', f0: 1300, f1: 300, peak: 0.2 * H, dec: 0.14, dst: d, pink: true });
      boom();
    } else if (m === 'scale') {
      // a dry slap on scales
      smp(core, d, t, 'woodL', { gain: 1.0, rate: 1.5 * vj, sat: 2.5 });
      smp(core, d, t, heavy ? 'punchH' : 'punchM', { gain: 0.6, rate: 1.7 * vj, sat: 3 });
      smp(core, d, t, 'tinM', { gain: 0.22, rate: 1.6 * vj, lp: 3200 });
      tone(core, { t, f0: 250 * vj, f1: 90, dec: 0.1, peak: 0.32 * H, dst: d });
      noise(core, { t, type: 'bandpass', f0: 2400 * vj, q: 2, peak: 0.16, dec: 0.05, dst: d });
      if (heavy) tone(core, { t, f0: 100, f1: 40, dec: 0.3, peak: 0.4, dst: d });
    } else if (m === 'chitin') {
      // a crunchy shell: wood cracking with a glassy fleck
      smp(core, d, t, 'woodL', { gain: 0.9, rate: 1.9 * vj, sat: 2.5 });
      smp(core, d, t + 0.005, 'plank', { gain: 0.5, rate: 1.8 * vj, sat: 2 });
      smp(core, d, t + 0.012, 'glassL', { gain: 0.32, rate: 1.4 * vj, lp: 3600 });
      const n = heavy ? 5 : 3;
      for (let i = 0; i < n; i++) noise(core, { t: t + i * 0.017 + Math.random() * 0.006, type: 'bandpass', f0: 1400 + Math.random() * 1800, q: 3, peak: 0.1, dec: 0.02, dst: d });
      tone(core, { t, f0: 270 * vj, f1: 110, dec: 0.06, peak: 0.25 * H, dst: d });
      boom();
    } else if (m === 'feather') {
      // a puff of feathers: cloth and a soft thump, nothing sharp
      smp(core, d, t, 'cloth', { gain: 0.95, rate: 1.15 * vj, hp: 250, lp: 4200 });
      smp(core, d, t, 'softM', { gain: 0.65, rate: 1.5 * vj, sat: 2.5 });
      noise(core, { t, type: 'bandpass', f0: 2200, f1: 1100, q: 0.8, peak: 0.12 * H, dec: 0.18, dst: d, pink: true });
      tone(core, { t, f0: 205 * vj, f1: 90, dec: 0.1, peak: 0.22 * H, dst: d });
      boom();
    } else if (m === 'armor') {
      // stone or iron: a clank with a ring
      smp(core, d, t, heavy ? 'metalH' : 'metalM', { gain: 0.9, rate: 1.25 * vj, sat: 2 });
      smp(core, d, t, heavy ? 'plateH' : 'plateM', { gain: 0.8, rate: 1.7 * vj, sat: 3 });
      if (heavy) smp(core, d, t, 'mining', { gain: 0.6, rate: 1.4 * vj, sat: 2.5 });
      tone(core, { t, f0: 185 * vj, f1: 60, dec: 0.2, peak: 0.4 * H, dst: d });
      [1, 2.76, 5.4].forEach((r, i) => tone(core, { t, f0: 480 * r * vj, dec: 0.3 - i * 0.05, peak: 0.07 / (i + 1), dst: d }));
      boom();
    } else {
      smp(core, d, t, 'genL', { gain: 0.8, rate: 1.7 * vj, sat: 2.5 });
      smp(core, d, t, heavy ? 'punchH' : 'punchM', { gain: heavy ? 1.0 : 0.85, rate: (heavy ? 1.2 : 1.55) * vj, sat: 3 });
      tone(core, { t, f0: (heavy ? 130 : 180) * vj, f1: heavy ? 40 : 60, dec: heavy ? 0.32 : 0.16, peak: heavy ? 0.6 : 0.4, dst: d });
      noise(core, { t, type: 'highpass', f0: 2400, peak: heavy ? 0.16 : 0.1, dec: 0.035, dst: d });
      noise(core, { t, type: 'bandpass', f0: heavy ? 1100 : 1700, f1: 400, q: 0.9, peak: heavy ? 0.25 : 0.14, dec: heavy ? 0.22 : 0.12, dst: d });
      if (heavy) {
        smp(core, d, t, 'mining', { gain: 0.45, rate: 1.5 * vj, sat: 2.5 });
        boom();
      }
    }
    streakSparkle(core, key, t, d);
  },

  /** pickup chime for flowers; the note climbs the key's triad ladder with the combo, but stays in a friendly range (it used to climb into a shriek) */
  flower(core, key, a = 0) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.3);
    const n = Math.min(5, Math.max(0, a));
    const m = ladder(key, n, 64);
    note(core, marimba, t, m, 0.8, d);
    note(core, bell, t + 0.012, m + 12, 0.22 - n * 0.015, d);
    // a real glass "tink" gives the front of the note some sparkle, and a soft pluck rounds it off
    smp(core, d, t, 'uiGlass', { gain: 0.3, rate: 1 + n * 0.04, hp: 700, lp: 4800 });
    smp(core, d, t, 'uiPluck', { gain: 0.45, rate: 1 + n * 0.05, lp: 4000 });
    noise(core, { t, type: 'highpass', f0: 6000, peak: 0.03, dec: 0.04, dst: d });
  },

  /** a leaf: a small, dry pluck and a rustle */
  leaf(core, key) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.15);
    note(core, kalimba, t, ladder(key, 1 + Math.floor(Math.random() * 3), 66) + 12, 0.7, d);
    smp(core, d, t, 'cloth', { gain: 0.22, rate: 1.7, hp: 900, lp: 5000 });
    noise(core, { t, type: 'bandpass', f0: 3500, q: 1.5, peak: 0.03, dec: 0.05, dst: d });
  },

  /** fruit: a juicy pop and a happy two-note */
  fruit(core, key) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.2);
    smp(core, d, t, 'uiDrop', { gain: 0.8, rate: 1.15, sat: 2 });
    tone(core, { t, f0: 700, f1: 220, dec: 0.07, peak: 0.2, dst: d });
    note(core, steelpan, t + 0.04, ladder(key, 2, 66), 0.6, d);
    note(core, steelpan, t + 0.1, ladder(key, 3, 66), 0.6, d);
  },

  /** a heart: warm and rising, with a soft heartbeat under it */
  heart(core, key) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.35);
    note(core, harp, t, ladder(key, 0) - 5, 0.8, d);
    note(core, harp, t + 0.11, ladder(key, 2) - 5, 0.8, d);
    note(core, bell, t + 0.2, ladder(key, 3), 0.4, d);
    tone(core, { t, f0: 90, f1: 55, dec: 0.2, peak: 0.35, dst: d });
    tone(core, { t: t + 0.15, f0: 80, f1: 50, dec: 0.2, peak: 0.28, dst: d });
  },

  /** a big heart: a full rising arpeggio, a shimmer and a choir-like swell */
  superHeart(core, key) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.5);
    for (let i = 0; i < 6; i++) note(core, harp, t + i * 0.07, ladder(key, i) - 5, 0.75, d);
    note(core, bell, t + 0.45, ladder(key, 5), 0.5, d);
    noise(core, { t, type: 'bandpass', f0: 2000, f1: 9000, q: 1, peak: 0.1, dec: 0.6, attack: 0.3, dst: d });
    for (const [i, r] of [1, 1.5, 2].entries()) tone(core, { t: t + 0.1, type: 'triangle', f0: midiHz(ladder(key, 0) - 12) * r * (1 + i * 0.002), dec: 0.9, attack: 0.25, peak: 0.1, dst: d });
  },

  /** power-ups: 0 speed (zip), 1 invincible (shine), 2 magnet (hum) */
  power(core, key, a = 0) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.3);
    smp(core, d, t, 'powerUp', { gain: 0.4, rate: 1, lp: 3600 });
    if (a === 0) {
      noise(core, { t, type: 'bandpass', f0: 400, f1: 5000, q: 1, peak: 0.16, dec: 0.3, attack: 0.1, dst: d });
      for (let i = 0; i < 5; i++) note(core, pluck, t + i * 0.045, ladder(key, i % 5) + 12, 0.55, d);
    } else if (a === 1) {
      for (const [i, n] of [0, 2, 3, 5].entries()) {
        note(core, bell, t + i * 0.09, ladder(key, n), 0.6, d);
        tone(core, { t: t + i * 0.09, type: 'sawtooth', f0: midiHz(ladder(key, n) - 12), dec: 0.35, peak: 0.1, dst: d, lp: 1800 });
      }
      noise(core, { t: t + 0.1, type: 'highpass', f0: 7000, peak: 0.1, dec: 0.5, attack: 0.2, dst: d });
    } else {
      tone(core, { t, type: 'sawtooth', f0: 80, f1: 240, sweep: 0.4, dec: 0.5, peak: 0.2, dst: d, lp: 900 });
      for (let i = 0; i < 3; i++) tone(core, { t: t + 0.12 + i * 0.1, f0: 520 + i * 90, f1: 1040 + i * 180, dec: 0.12, peak: 0.16, dst: d });
      note(core, bell, t + 0.35, ladder(key, 2), 0.5, d);
    }
  },

  /** grabbing a vine: a rope tightening, wood creaking, leaves shaking */
  vine(core) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.12);
    smp(core, d, t, 'creak', { gain: 0.75, rate: 1.25, hp: 200, lp: 3200 });
    smp(core, d, t, 'leather', { gain: 0.5, rate: 1.0, lp: 3500 });
    smp(core, d, t + 0.02, 'woodL', { gain: 0.45, rate: 1.4, sat: 2 });
    noise(core, { t, type: 'bandpass', f0: 350, f1: 900, q: 3, peak: 0.1, dec: 0.12, dst: d });
    tone(core, { t, type: 'sawtooth', f0: 190 * jit(), f1: 240, dec: 0.1, peak: 0.05, dst: d, lp: 700 });
    noise(core, { t: t + 0.04, type: 'bandpass', f0: 3000, q: 1, peak: 0.04, dec: 0.15, dst: d, pink: true });
  },

  /** bark under claws: one soft grip per hand. It plays over and over while he climbs, so it is a gentle rustle with no
   *  pitched thunk or hard click: the old one, five times a second, sounded like the audio skipping (an iPhone tester had to
   *  turn the sound off, 2026-10-27) */
  climb(core) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.05);
    smp(core, d, t, 'leather', { gain: 0.32, rate: 0.9 + Math.random() * 0.25, lp: 2200 });
    smp(core, d, t + 0.015, 'woodL', { gain: 0.16, rate: 1.05 + Math.random() * 0.2, lp: 1800 });
    noise(core, { t, type: 'bandpass', f0: pick([600, 750, 900]), q: 0.9, peak: 0.05, dec: 0.12, attack: 0.02, dst: d, pink: true });
  },

  /** a shrine wakes: a big open chord of bells, a deep drum and a long shimmer */
  shrine(core, key) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.6);
    for (const [i, n] of [0, 2, 3, 4, 5].entries()) note(core, bell, t + i * 0.08, ladder(key, n) - 12, 0.7, d);
    note(core, bell, t + 0.5, ladder(key, 6), 0.45, d);
    smp(core, d, t, 'bellH', { gain: 0.5, rate: 0.9, lp: 6000 });
    smp(core, d, t, 'punchH', { gain: 0.7, rate: 1.0, sat: 3 });
    tone(core, { t, f0: 100, f1: 42, dec: 0.9, peak: 0.55, dst: d });
    noise(core, { t, type: 'lowpass', f0: 800, f1: 150, peak: 0.22, dec: 0.5, dst: d });
    noise(core, { t: t + 0.1, type: 'highpass', f0: 6000, peak: 0.1, dec: 1.4, attack: 0.5, dst: d });
    for (const [i, r] of [1, 1.5, 2, 3].entries()) tone(core, { t: t + 0.1, type: 'triangle', f0: midiHz(ladder(key, 0) - 12) * r * (1 + i * 0.0015), dec: 1.6, attack: 0.45, peak: 0.09, dst: d });
  },

  /** a relic: mysterious, falling then rising bells with a hollow boom */
  relic(core, key) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.7);
    smp(core, d, t, 'mining', { gain: 0.6, rate: 1.0, sat: 3 });
    tone(core, { t, f0: 70, f1: 35, dec: 1.1, peak: 0.45, dst: d });
    [4, 2, 0, 2, 4, 5, 7].forEach((n, i) => note(core, bell, t + 0.1 + i * 0.12, ladder(key, n), 0.5, d));
    noise(core, { t, type: 'bandpass', f0: 500, f1: 3500, q: 1, peak: 0.1, dec: 1, attack: 0.4, dst: d, pink: true });
  },

  /** a critter is saved: three happy chirps and a harp sparkle */
  critter(core, key) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.25);
    chirps(core, d, t, { n: 3, gap: 0.075, f0: 1200, f1: 1800, dec: 0.07, peak: 0.12, type: 'triangle' });
    smp(core, d, t, 'uiPluck', { gain: 0.3, rate: 1.4, lp: 4500 });
    note(core, harp, t + 0.22, ladder(key, 3), 0.5, d);
    note(core, harp, t + 0.3, ladder(key, 4), 0.5, d);
  },

  /**
   * An enemy falls. `a` is the enemy type's number (see ENEMY_ORDER): each animal has its own last sound
   * (hiss, cry, yowl, croak, skitter-crunch, pops). They share a recorded body (a thump or a crunch) so they land with weight,
   * and the animal voices are kept soft: no more thin, high shrieks. With no number it is a generic comic pop.
   */
  defeat(core, key, a = -1) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.2);
    const [n1, n2] = byVar([[3, 5], [2, 4], [3, 6], [4, 5]]);
    const chime = (vel = 1, at = 0.07) => {
      if (ORCH) {
        // the animal's own figure on its own instrument, in the key of the music
        playFigure(core, d, t + at, key, a, vel);
        return;
      }
      note(core, bell, t + at, ladder(key, n1), 0.4 * vel, d);
      note(core, bell, t + at + 0.07, ladder(key, n2), 0.35 * vel, d);
    };
    const vj = jit(0.05);
    switch (Math.round(a)) {
      case 0: // snake: a short, soft hiss that pops
        smp(core, d, t, 'softM', { gain: 0.8, rate: 1.6 * vj, sat: 3 });
        smp(core, d, t, 'swishD', { gain: 0.45, rate: 1.3, hp: 1500, lp: 5200 });
        noise(core, { t, type: 'bandpass', f0: 4200, f1: 2200, q: 0.7, peak: 0.1, dec: 0.2, dst: d });
        tone(core, { t, f0: 480 * jit(0.08), f1: 120, dec: 0.12, peak: 0.3, dst: d });
        chime();
        break;
      case 1: // eagle: a burst of feathers and a short, round cry
        smp(core, d, t, 'cloth', { gain: 0.9, rate: 1.2 * vj, hp: 250, lp: 4200 });
        smp(core, d, t, 'softM', { gain: 0.6, rate: 1.4 * vj, sat: 2.5 });
        tone(core, { t, type: 'sawtooth', f0: 1500 * jit(0.06), f1: 600, dec: 0.2, peak: 0.1, dst: d, lp: 2400, attack: 0.012 });
        noise(core, { t: t + 0.03, type: 'bandpass', f0: 2200, f1: 1100, q: 0.8, peak: 0.12, dec: 0.25, dst: d, pink: true });
        chime(0.8);
        break;
      case 2:
      case 3: {
        // the cats: a yowl that falls away (the jaguar's is deeper)
        const big = Math.round(a) === 3;
        const f = (big ? 280 : 400) * jit(0.07);
        smp(core, d, t, big ? 'punchH' : 'punchM', { gain: 0.75, rate: (big ? 1.2 : 1.5) * vj, sat: 3 });
        tone(core, { t, type: 'sawtooth', f0: f, f1: f * 0.45, dec: 0.32, peak: 0.16, dst: d, lp: 1200, attack: 0.02 });
        tone(core, { t, type: 'triangle', f0: f * 2, f1: f, dec: 0.25, peak: 0.06, dst: d });
        noise(core, { t, type: 'bandpass', f0: big ? 500 : 800, f1: 300, q: 1.2, peak: 0.16, dec: 0.25, dst: d });
        tone(core, { t, f0: 140, f1: 55, dec: 0.15, peak: 0.28, dst: d });
        chime(0.8);
        break;
      }
      case 4: // boa: a long, low deflating breath and a soft thud
        smp(core, d, t, 'softH', { gain: 0.9, rate: 1.3, sat: 3 });
        noise(core, { t, type: 'bandpass', f0: 2600, f1: 1000, q: 0.6, peak: 0.12, dec: 0.38, attack: 0.03, dst: d, pink: true });
        tone(core, { t, f0: 150, f1: 55, dec: 0.22, peak: 0.45, dst: d });
        noise(core, { t, type: 'lowpass', f0: 900, peak: 0.15, dec: 0.2, dst: d });
        chime(0.7);
        break;
      case 5: // caiman: a low bellow and a splash
        smp(core, d, t, 'punchH', { gain: 0.8, rate: 1.1, sat: 3 });
        smp(core, d, t + 0.02, 'swishD', { gain: 0.35, rate: 0.9, hp: 300, lp: 3000 });
        tone(core, { t, type: 'sawtooth', f0: 95, f1: 48, dec: 0.45, peak: 0.26, dst: d, lp: 420, attack: 0.03 });
        noise(core, { t, type: 'lowpass', f0: 1500, f1: 200, peak: 0.26, dec: 0.35, dst: d, pink: true });
        tone(core, { t, f0: 80, f1: 38, dec: 0.4, peak: 0.45, dst: d });
        chime(0.6);
        break;
      case 6: // tayra: chatter and a squeak
        smp(core, d, t, 'punchM', { gain: 0.65, rate: 1.7 * vj, sat: 3 });
        chirps(core, d, t, { n: 4, gap: 0.04, f0: 1700, f1: 1100, dec: 0.04, peak: 0.07, type: 'triangle' });
        tone(core, { t: t + 0.04, f0: 520, f1: 150, dec: 0.1, peak: 0.22, dst: d });
        chime(0.9);
        break;
      case 7: // frog: a croak, a squelch and a bloop
        smp(core, d, t, 'uiDrop', { gain: 0.7, rate: 0.9, sat: 2 });
        smp(core, d, t, 'softM', { gain: 0.6, rate: 1.5, sat: 3 });
        for (const o of [0, 0.075]) tone(core, { t: t + o, type: 'sawtooth', f0: 210 * jit(0.06), f1: 150, dec: 0.07, peak: 0.16, dst: d, lp: 700 });
        noise(core, { t: t + 0.06, type: 'bandpass', f0: 900, f1: 300, q: 1.5, peak: 0.18, dec: 0.14, dst: d });
        chime();
        break;
      case 8: // spider: a skitter, then a crunch
        for (let i = 0; i < 6; i++) noise(core, { t: t + i * 0.022 + Math.random() * 0.01, type: 'bandpass', f0: 3200 + Math.random() * 1200, q: 3, peak: 0.07, dec: 0.018, dst: d });
        smp(core, d, t + 0.16, 'woodL', { gain: 0.9, rate: 1.8, sat: 2.5 });
        smp(core, d, t + 0.16, 'plank', { gain: 0.5, rate: 1.9, sat: 2 });
        noise(core, { t: t + 0.16, type: 'bandpass', f0: 1400, q: 2, peak: 0.2, dec: 0.07, dst: d });
        tone(core, { t: t + 0.16, f0: 220, f1: 90, dec: 0.1, peak: 0.26, dst: d });
        chime(0.7, 0.2);
        break;
      case 9: // ants: a little cluster of pops
        for (let i = 0; i < 6; i++) smp(core, d, t + i * 0.02 + Math.random() * 0.015, 'uiTick', { gain: 0.3, rate: 0.9 + Math.random() * 0.6, hp: 400, lp: 4500 });
        for (let i = 0; i < 4; i++) tone(core, { t: t + i * 0.02 + Math.random() * 0.015, f0: 650 + Math.random() * 450, f1: 250, dec: 0.035, peak: 0.16, dst: d });
        chime(0.7);
        break;
      default:
        smp(core, d, t, 'punchM', { gain: 0.8, rate: 1.55 * vj, sat: 3 });
        tone(core, { t, f0: 650 * jit(), f1: 130, dec: 0.13, peak: 0.3, dst: d });
        noise(core, { t, type: 'bandpass', f0: 1500, f1: 500, q: 1, peak: 0.18, dec: 0.14, dst: d });
        chime();
    }
    streakSparkle(core, key, t + 0.1, d);
  },

  /** Pokey is hurt: a thud, a falling "oof" in his voice and a sting (four pitches) */
  hurt(core) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.2);
    const k = byVar([1, 1.1, 0.9, 1.18]);
    smp(core, d, t, 'softH', { gain: 0.9, rate: 1.2 * k, sat: 3 });
    smp(core, d, t, 'genL', { gain: 0.4, rate: 1.4 * k, sat: 2 });
    tone(core, { t, f0: 120 * k, f1: 45, dec: 0.25, peak: 0.5, dst: d });
    tone(core, { t, type: 'sawtooth', f0: 380 * k, f1: 170, dec: 0.28, peak: 0.1, dst: d, lp: 1500 });
    tone(core, { t, type: 'triangle', f0: 255 * k, f1: 120, dec: 0.3, peak: 0.14, dst: d });
    noise(core, { t, type: 'highpass', f0: 2500, peak: 0.12, dec: 0.05, dst: d });
    noise(core, { t, type: 'bandpass', f0: 1200, f1: 300, peak: 0.18, dec: 0.2, dst: d });
    grunt(core, d, t + 0.02, 'oof', k, 1);
  },

  /** an eagle's cry: four different calls (long, rising-falling, a quick pair, and a rough low one) */
  eagle(core) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.45);
    const cry = (at: number, dur: number, pts: Array<[number, number]>, vib: number) => {
      const os = core.ctx.createOscillator();
      os.type = 'sawtooth';
      pts.forEach(([f, hz], i) => {
        if (i === 0) os.frequency.setValueAtTime(hz, at);
        else os.frequency.linearRampToValueAtTime(hz, at + f * dur);
      });
      const vo = core.ctx.createOscillator();
      vo.frequency.value = vib;
      const vg = core.ctx.createGain();
      vg.gain.value = 180;
      vo.connect(vg);
      vg.connect(os.frequency);
      const bp = core.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1900;
      bp.Q.value = 1.4;
      const lpf = core.ctx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.value = 3200;
      lpf.Q.value = 0.5;
      const g = core.ctx.createGain();
      envelope(g.gain, at, { a: 0.03, peak: 0.2, d: dur * 0.35, sustain: 0.1, hold: Math.max(0.01, dur - 0.2), r: 0.25 });
      os.connect(bp);
      bp.connect(lpf);
      lpf.connect(g);
      g.connect(d);
      os.start(at);
      vo.start(at);
      os.stop(at + dur + 0.3);
      vo.stop(at + dur + 0.3);
    };
    switch (VAR % 4) {
      case 0:
        cry(t, 0.55, [[0, 2000], [0.22, 3300], [1, 1500]], 38);
        break;
      case 1:
        cry(t, 0.7, [[0, 2200], [0.2, 3500], [0.45, 1700], [0.7, 3000], [1, 1400]], 34);
        break;
      case 2:
        cry(t, 0.24, [[0, 2600], [0.3, 3600], [1, 1900]], 42);
        cry(t + 0.28, 0.26, [[0, 2800], [0.3, 3800], [1, 1700]], 42);
        break;
      default:
        cry(t, 0.6, [[0, 1500], [0.15, 2400], [1, 1100]], 55);
        noise(core, { t, type: 'bandpass', f0: 2200, q: 1.2, peak: 0.08, dec: 0.5, attack: 0.05, dst: d });
    }
  },

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

  /** footfall on the ground. `a` is 0..1 how hard (a landing) */
  land(core, key, a = 0.3) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.05);
    const s = Math.max(0.15, Math.min(1, a));
    smp(core, d, t, 'stepGrass', { gain: 0.5 + 0.7 * s, rate: 0.95 - 0.15 * s, sat: 2.5 });
    if (s > 0.45) smp(core, d, t, 'softH', { gain: 0.65 * s, rate: 1.3, sat: 3 });
    tone(core, { t, f0: 110 * jit(), f1: 55, dec: 0.1 + 0.08 * s, peak: 0.12 + 0.3 * s, dst: d });
    noise(core, { t, type: 'lowpass', f0: 1800, f1: 400, peak: 0.06 + 0.14 * s, dec: 0.08 + 0.08 * s, dst: d, pink: true });
    if (ORCH && s > 0.45) landNote(core, d, t, key, s);
  },

  /** a soft step: one footfall in grass and leaves */
  step(core) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.03);
    smp(core, d, t, 'stepGrass', { gain: 0.7, rate: 1.1 + Math.random() * 0.15, sat: 1.8 });
    noise(core, { t, type: 'bandpass', f0: pick([1200, 1500, 1800]), q: 0.9, peak: 0.03, dec: 0.05, dst: d, pink: true });
    tone(core, { t, f0: 95 * jit(), f1: 60, dec: 0.05, peak: 0.04, dst: d });
  },

  /** checkpoint reached: a bright three-note flourish */
  checkpoint(core, key) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.4);
    [0, 2, 3].forEach((n, i) => note(core, bell, t + i * 0.09, ladder(key, n), 0.7, d));
    note(core, marimba, t, ladder(key, 0) - 12, 0.7, d);
    smp(core, d, t + 0.05, 'coins', { gain: 0.35, rate: 1.0, lp: 6000 });
  },

  /** an extra life: a quick fanfare */
  oneUp(core, key) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.35);
    [0, 2, 4, 3, 4, 5, 7].forEach((n, i) => note(core, steelpan, t + i * 0.065, ladder(key, n), 0.7, d));
    note(core, bell, t + 0.5, ladder(key, 7), 0.5, d);
    smp(core, d, t, 'pep', { gain: 0.4, rate: 1.0, lp: 6000 });
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
  uiTap(core) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.1);
    // the orchestral set takes the edge off the click: a lower, rounder tick and no rim shot
    if (ORCH) smp(core, d, t, 'uiClick', { gain: 0.9, rate: 0.8, lp: 3200 });
    else {
      smp(core, d, t, 'uiClick', { gain: 0.9, rate: 1.0 });
      rim(core, d, t, 0.35);
    }
  },
  uiConfirm(core, key) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.25);
    smp(core, d, t, 'uiSelect', { gain: 0.5, rate: 1.0, lp: 6000 });
    note(core, marimba, t, ladder(key, 2), 0.8, d);
    note(core, marimba, t + 0.07, ladder(key, 3), 0.8, d);
  },
  uiBack(core, key) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.2);
    smp(core, d, t, 'uiBack', { gain: 0.45, rate: 1.0, lp: 6000 });
    note(core, marimba, t, ladder(key, 3), 0.7, d);
    note(core, marimba, t + 0.07, ladder(key, 1), 0.7, d);
  },
  /** star reveal on the results screen: `a` = which star (0..2) */
  star(core, key, a = 0) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.5);
    const m = ladder(key, 2 + a * 2);
    note(core, bell, t, m, 0.8, d);
    note(core, bell, t + 0.02, m + 12, 0.4, d);
    note(core, harp, t, m - 12, 0.6, d);
    tone(core, { t, f0: 100, f1: 60, dec: 0.3, peak: 0.35, dst: d });
    noise(core, { t, type: 'highpass', f0: 6000, peak: 0.08, dec: 0.5, dst: d });
  },
  // (the swoops run between the home note and its octave in the music's key, so pausing and resuming sit in the stage's music)
  pauseIn(core, key) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.2);
    smp(core, d, t, 'uiClose', { gain: 0.7, rate: 1.0, lp: 6000 });
    noise(core, { t, type: 'lowpass', f0: 4000, f1: 300, q: 0.7, peak: 0.12, dec: 0.3, attack: 0.02, dst: d, pink: true });
    tone(core, { t, f0: midiHz(ladder(key, 3, 55)), f1: midiHz(ladder(key, 0, 55)), dec: 0.18, peak: 0.08, dst: d });
  },
  pauseOut(core, key) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.2);
    smp(core, d, t, 'uiOpen', { gain: 0.7, rate: 1.0, lp: 6000 });
    noise(core, { t, type: 'lowpass', f0: 300, f1: 4000, q: 0.7, peak: 0.12, dec: 0.28, attack: 0.1, dst: d, pink: true });
    tone(core, { t, f0: midiHz(ladder(key, 0, 55)), f1: midiHz(ladder(key, 3, 55)), dec: 0.18, peak: 0.08, dst: d });
  },
  /** the first beat of a level */
  levelStart(core, key) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.35);
    congaHi(core, d, t, 0.7);
    [0, 2, 4].forEach((n, i) => note(core, marimba, t + 0.05 + i * 0.1, ladder(key, n), 0.8, d));
  },
};

export type SfxName = keyof typeof SFX;

/** loudness trims measured offline so that frequent sounds sit low and big moments sit high without clipping */
const TRIMS: Record<string, number> = {
  jump: 1.45, doubleJump: 0.67, glide: 1.0, punch: 0.32, megaPunch: 0.42, kick: 0.35, whoosh: 0.41, hit: 0.85, flower: 1.45, fruit: 0.75, heart: 0.75, superHeart: 0.5,
  power: 0.55, vine: 0.58, climb: 0.7, shrine: 0.45, relic: 0.45, hurt: 0.76, eagle: 2.0, roar: 0.75, land: 0.83, step: 0.88, checkpoint: 0.55, oneUp: 0.55,
};


/** which version of the effect to play and how long the combo is: both change the sound a little */
export interface FxVariation {
  /** 0..3 */
  variant?: number;
  /** hits landed in a row */
  streak?: number;
}

/** play an effect with its loudness trim */
/**
 * Sounds that stayed in their original, fully synthesized version after the old-versus-new listening test.
 * (Everything else uses the new recipes with the recorded layers.)
 */
export function classicFor(name: string, arg: number | undefined, streak: number): boolean {
  const a = arg ?? 0;
  switch (name) {
    case 'checkpoint':
    case 'vine':
    case 'uiConfirm':
    case 'uiBack':
      return true;
    case 'flower':
      return Math.round(a) === 3;
    case 'power':
      return Math.round(a) === 1;
    case 'land':
      return (arg ?? 0.3) < 0.6;
    case 'hit': {
      const { heavy, material } = unpackHit(a);
      if (heavy) return false;
      if (material === 'generic') return streak < 3;
      return material === 'fur' || material === 'armor';
    }
    case 'defeat':
      return ![0, 1, 2, 4, 7, 9].includes(Math.round(arg ?? -1));
    case 'tayraCall':
      return Math.round(a) >= 1;
    default:
      return false;
  }
}

export function runFx(name: string, core: AudioCore, key: KeyInfo, arg?: number, v: FxVariation = {}) {
  const fn = SFX[name];
  if (!fn) return;
  const orch = orchSfxEnabled();
  if (!(orch && CLASSIC_WITH_BELLS.has(name)) && classicFor(name, arg, Math.max(0, Math.floor(v.streak ?? 0)))) {
    runClassic(name, core, key, arg, v);
    return;
  }
  TRIM = TRIMS[name] ?? 1;
  ORCH = orch;
  VAR = Math.max(0, Math.floor(v.variant ?? 0));
  STREAK = Math.max(0, Math.floor(v.streak ?? 0));
  try {
    fn(core, key, arg);
  } finally {
    TRIM = 1;
    VAR = 0;
    STREAK = 0;
    ORCH = false;
  }
}
