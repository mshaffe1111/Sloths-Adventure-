/**
 * The original, fully synthesized sound effects, kept as they were before the recorded-sample upgrade.
 * After listening to old and new side by side, a few sounds were better in their original form (a few pickups, the plain/fur/stone
 * light hits, some enemy defeats, the vine, the confirm/back taps...); `classicFor` in sfx.ts says which, and routes them here.
 * This file is self-contained and is not edited any more.
 */
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
import { classicGain } from './sfxMix.ts';
import { AudioCore, envelope } from './core.ts';
import { bell, congaHi, harp, kalimba, marimba, pluck, rim, steelpan, woodblock } from './instruments.ts';
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

const note = (core: AudioCore, voice: typeof bell, t: number, midi: number, vel: number, dst: AudioNode) => voice(core, dst, t, midiHz(midi), 0.3, vel);

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
  /** a soft springy hop: the pitch lifts, a breath of air under it. Four versions, and sometimes a small "hup" */
  jump(core) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.08);
    const j = jit(0.07);
    const [f0, f1, sw, nz] = byVar([
      [210, 430, 0.11, 0.1],
      [262, 560, 0.09, 0.07],
      [182, 340, 0.13, 0.16],
      [320, 520, 0.1, 0.05],
    ]);
    tone(core, { t, f0: f0 * j, f1: f1 * j, sweep: sw, dec: 0.15, peak: 0.34, dst: d });
    tone(core, { t, type: 'triangle', f0: f0 * 2 * j, f1: f1 * 2 * j, sweep: sw, dec: 0.09, peak: 0.09, dst: d });
    noise(core, { t, type: 'bandpass', f0: 700 + VAR * 150, f1: 1500 + VAR * 250, q: 0.9, peak: nz, dec: 0.12, dst: d, pink: true });
    if (VAR === 3) woodblock(core, d, t, 0.35);
    if (Math.random() < 0.3) grunt(core, d, t + 0.01, 'hup', 1, 0.6);
  },

  /** a second hop in mid-air: a flutter of leaves and two light notes in the key (four different pairs) */
  doubleJump(core, key) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.2);
    const [n1, n2] = byVar([[2, 3], [3, 4], [1, 3], [2, 5]]);
    noise(core, { t, type: 'bandpass', f0: 1200, f1: 4200, q: 1.2, peak: 0.14, dec: 0.2, dst: d });
    tone(core, { t, type: 'triangle', f0: 330 * jit(), f1: 700, dec: 0.13, peak: 0.2, dst: d });
    note(core, kalimba, t + 0.02, ladder(key, n1), 0.5, d);
    note(core, kalimba, t + 0.09, ladder(key, n2), 0.45, d);
    if (Math.random() < 0.45) grunt(core, d, t, 'hup', 1.15, 0.6);
  },

  /** a quick claw jab: whoosh into a knuckle thump with a bright snap. Four versions, and sometimes a "hah" */
  punch(core) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.06);
    const [body, air, snap] = byVar([[190, 1600, 3200], [235, 2100, 4000], [158, 1300, 2800], [210, 1800, 3600]]);
    noise(core, { t, type: 'bandpass', f0: air, f1: air / 3.8, q: 0.8, peak: 0.28, dec: 0.1, dst: d, pink: true });
    tone(core, { t: t + 0.035, f0: body * jit(), f1: 70, dec: 0.12, peak: 0.5, dst: d });
    noise(core, { t: t + 0.035, type: 'highpass', f0: snap, peak: 0.16, dec: 0.025, dst: d });
    // the fourth version is a quick double tap
    if (VAR === 3) tone(core, { t: t + 0.085, f0: body * 0.8, f1: 60, dec: 0.08, peak: 0.28, dst: d });
    if (Math.random() < 0.5) grunt(core, d, t, VAR % 2 ? 'hyah' : 'hah', 1, 0.7);
  },

  /** a heavy swing: deeper, slower, with a boom that rolls into the reverb. Always with a big shout */
  megaPunch(core) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.22);
    const k = byVar([1, 1.12, 0.9, 1.05]);
    noise(core, { t, type: 'bandpass', f0: 900 * k, f1: 220, q: 0.7, peak: 0.34, dec: 0.2, dst: d, pink: true });
    tone(core, { t: t + 0.06, f0: 140 * k, f1: 38, dec: 0.4, peak: 0.85, dst: d });
    noise(core, { t: t + 0.06, type: 'lowpass', f0: 3000, f1: 300, peak: 0.4, dec: 0.28, dst: d });
    noise(core, { t: t + 0.06, type: 'highpass', f0: 2500, peak: 0.2, dec: 0.04, dst: d });
    tone(core, { t: t + 0.06, type: 'triangle', f0: 880 * k, f1: 600, dec: 0.5, peak: 0.07, dst: d });
    grunt(core, d, t, 'hyah', 0.85 * (VAR === 2 ? 0.92 : 1), 0.95);
  },

  /** a kick: like the punch but lower and rounder. Four versions, often with a "hup" */
  kick(core) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.08);
    const [body, air] = byVar([[150, 900], [180, 1200], [126, 760], [160, 1000]]);
    noise(core, { t, type: 'bandpass', f0: air, f1: air / 3.5, q: 0.8, peak: 0.26, dec: 0.12, dst: d, pink: true });
    tone(core, { t: t + 0.04, f0: body * jit(), f1: 52, dec: 0.16, peak: 0.6, dst: d });
    noise(core, { t: t + 0.04, type: 'highpass', f0: 2600 + VAR * 300, peak: 0.12, dec: 0.03, dst: d });
    if (VAR === 2) tone(core, { t: t + 0.04, type: 'triangle', f0: 90, f1: 40, dec: 0.3, peak: 0.25, dst: d });
    if (Math.random() < 0.6) grunt(core, d, t, VAR % 2 ? 'hyah' : 'hup', 0.95, 0.7);
  },

  /** air only: a swish through leaves (rising, falling, airy or low) */
  whoosh(core) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.1);
    const [a0, a1, b0, b1] = byVar([[500, 2400, 2400, 700], [2600, 600, 700, 2200], [1400, 4200, 4200, 1800], [300, 1200, 1200, 380]]);
    noise(core, { t, type: 'bandpass', f0: a0, f1: a1, q: 0.8, peak: 0.2, dec: 0.12, attack: 0.05, dst: d, pink: true });
    noise(core, { t: t + 0.1, type: 'bandpass', f0: b0, f1: b1, q: 0.8, peak: 0.16, dec: 0.14, attack: 0.02, dst: d, pink: true });
  },

  /**
   * A hit. `a` packs how hard (bit 0) and what it landed on (a >> 1: fur, scale, chitin, feather, armor; 0 = generic).
   * Each material has its own sound, four versions each, and a long combo lifts the pitch and adds sparkle.
   */
  hit(core, key, a = 0) {
    const t = core.ctx.currentTime;
    const { heavy, material } = unpackHit(a);
    const d = out(core, heavy ? 0.25 : 0.1);
    const vj = byVar([1, 1.08, 0.93, 1.15]) * jit(0.03) * streakLift();
    const H = heavy ? 1.35 : 1;
    const boom = () => heavy && tone(core, { t, type: 'triangle', f0: 90, f1: 45, dec: 0.5, peak: 0.3, dst: d });
    const m: Material = material;
    // the materials are written for shape; this evens out how loud each one is
    d.gain.value *= { generic: 1, fur: 1, scale: 1.35, chitin: 1.8, feather: 1.45, armor: 1.15 }[m];
    if (m === 'fur') {
      // a dull thump into fur: soft, no crack
      tone(core, { t, f0: (heavy ? 115 : 155) * vj, f1: 45, dec: heavy ? 0.3 : 0.15, peak: 0.6 * H, dst: d });
      noise(core, { t, type: 'lowpass', f0: 1300, f1: 300, peak: 0.34 * H, dec: 0.14, dst: d, pink: true });
      noise(core, { t, type: 'highpass', f0: 3200, peak: 0.07, dec: 0.02, dst: d });
      boom();
    } else if (m === 'scale') {
      // a dry slap on scales
      tone(core, { t, f0: 250 * vj, f1: 90, dec: 0.1, peak: 0.45 * H, dst: d });
      noise(core, { t, type: 'bandpass', f0: 2800 * vj, q: 2.5, peak: 0.36, dec: 0.05, dst: d });
      noise(core, { t, type: 'highpass', f0: 4200, peak: 0.14, dec: 0.02, dst: d });
      if (heavy) tone(core, { t, f0: 100, f1: 40, dec: 0.3, peak: 0.45, dst: d });
    } else if (m === 'chitin') {
      // a crunchy shell
      tone(core, { t, f0: 270 * vj, f1: 110, dec: 0.06, peak: 0.3 * H, dst: d });
      const n = heavy ? 6 : 4;
      for (let i = 0; i < n; i++) noise(core, { t: t + i * 0.017 + Math.random() * 0.006, type: 'bandpass', f0: 1500 + Math.random() * 3000, q: 3, peak: 0.2, dec: 0.02, dst: d });
      woodblock(core, d, t, 0.5);
      boom();
    } else if (m === 'feather') {
      // a puff of feathers
      noise(core, { t, type: 'bandpass', f0: 3200, f1: 1500, q: 0.8, peak: 0.3 * H, dec: 0.18, dst: d, pink: true });
      tone(core, { t, f0: 205 * vj, f1: 90, dec: 0.1, peak: 0.28 * H, dst: d });
      noise(core, { t: t + 0.03, type: 'highpass', f0: 5000, peak: 0.08, dec: 0.15, attack: 0.03, dst: d });
      boom();
    } else if (m === 'armor') {
      // stone or iron: a clank with a ring
      tone(core, { t, f0: 185 * vj, f1: 60, dec: 0.2, peak: 0.55 * H, dst: d });
      [1, 2.76, 5.4, 8.93].forEach((r, i) => tone(core, { t, f0: 520 * r * vj, dec: 0.3 - i * 0.04, peak: 0.1 / (i + 1), dst: d }));
      noise(core, { t, type: 'highpass', f0: 3500, peak: 0.2, dec: 0.03, dst: d });
      boom();
    } else {
      tone(core, { t, f0: (heavy ? 130 : 180) * vj, f1: heavy ? 40 : 60, dec: heavy ? 0.32 : 0.16, peak: heavy ? 0.8 : 0.55, dst: d });
      noise(core, { t, type: 'highpass', f0: 2400, peak: heavy ? 0.28 : 0.2, dec: 0.035, dst: d });
      noise(core, { t, type: 'bandpass', f0: heavy ? 1100 : 1700, f1: 400, q: 0.9, peak: heavy ? 0.35 : 0.22, dec: heavy ? 0.22 : 0.12, dst: d });
      if (heavy) {
        for (let i = 0; i < 4; i++) noise(core, { t: t + 0.02 + i * 0.03, type: 'bandpass', f0: 600 + Math.random() * 1500, q: 2, peak: 0.12, dec: 0.05, dst: d });
        boom();
      }
    }
    streakSparkle(core, key, t, d);
  },

  /** pickup chime for flowers; the note climbs the key's triad ladder with the combo */
  flower(core, key, a = 0) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.3);
    const m = ladder(key, Math.min(7, Math.max(0, a)));
    note(core, marimba, t, m, 0.9, d);
    note(core, bell, t + 0.012, m + 12, 0.38, d);
    noise(core, { t, type: 'highpass', f0: 6000, peak: 0.05, dec: 0.04, dst: d });
  },

  /** a leaf: a small, dry pluck */
  leaf(core, key) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.15);
    note(core, kalimba, t, ladder(key, 1 + Math.floor(Math.random() * 3)) + 12, 0.7, d);
    noise(core, { t, type: 'bandpass', f0: 3500, q: 1.5, peak: 0.04, dec: 0.05, dst: d });
  },

  /** fruit: a juicy pop and a happy two-note */
  fruit(core, key) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.2);
    tone(core, { t, f0: 700, f1: 220, dec: 0.07, peak: 0.3, dst: d });
    noise(core, { t, type: 'bandpass', f0: 2200, q: 1.2, peak: 0.12, dec: 0.05, dst: d });
    note(core, steelpan, t + 0.04, ladder(key, 2), 0.6, d);
    note(core, steelpan, t + 0.1, ladder(key, 3), 0.6, d);
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
    if (a === 0) {
      noise(core, { t, type: 'bandpass', f0: 400, f1: 6000, q: 1, peak: 0.22, dec: 0.3, attack: 0.1, dst: d });
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
    noise(core, { t, type: 'bandpass', f0: 350, f1: 900, q: 3, peak: 0.16, dec: 0.12, dst: d });
    tone(core, { t, type: 'sawtooth', f0: 190 * jit(), f1: 240, dec: 0.1, peak: 0.07, dst: d, lp: 700 });
    woodblock(core, d, t + 0.02, 0.6);
    noise(core, { t: t + 0.04, type: 'bandpass', f0: 4200, q: 1, peak: 0.08, dec: 0.15, dst: d, pink: true });
  },

  /** bark under claws */
  climb(core) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.05);
    noise(core, { t, type: 'bandpass', f0: pick([700, 900, 1100]), q: 1.6, peak: 0.2, dec: 0.06, dst: d });
    tone(core, { t, f0: pick([130, 150, 170]), f1: 80, dec: 0.07, peak: 0.25, dst: d });
    noise(core, { t: t + 0.07, type: 'bandpass', f0: pick([800, 1000]), q: 1.6, peak: 0.12, dec: 0.05, dst: d });
  },

  /** a shrine wakes: a big open chord of bells, a deep drum and a long shimmer */
  shrine(core, key) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.6);
    for (const [i, n] of [0, 2, 3, 4, 5].entries()) note(core, bell, t + i * 0.08, ladder(key, n) - 12, 0.7, d);
    note(core, bell, t + 0.5, ladder(key, 6), 0.45, d);
    tone(core, { t, f0: 100, f1: 42, dec: 0.9, peak: 0.7, dst: d });
    noise(core, { t, type: 'lowpass', f0: 800, f1: 150, peak: 0.28, dec: 0.5, dst: d });
    noise(core, { t: t + 0.1, type: 'highpass', f0: 6000, peak: 0.1, dec: 1.4, attack: 0.5, dst: d });
    for (const [i, r] of [1, 1.5, 2, 3].entries()) tone(core, { t: t + 0.1, type: 'triangle', f0: midiHz(ladder(key, 0) - 12) * r * (1 + i * 0.0015), dec: 1.6, attack: 0.45, peak: 0.09, dst: d });
  },

  /** a relic: mysterious, falling then rising bells with a hollow boom */
  relic(core, key) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.7);
    tone(core, { t, f0: 70, f1: 35, dec: 1.1, peak: 0.55, dst: d });
    [4, 2, 0, 2, 4, 5, 7].forEach((n, i) => note(core, bell, t + 0.1 + i * 0.12, ladder(key, n), 0.5, d));
    noise(core, { t, type: 'bandpass', f0: 500, f1: 3500, q: 1, peak: 0.1, dec: 1, attack: 0.4, dst: d, pink: true });
  },

  /** a critter is saved: three happy chirps and a harp sparkle */
  critter(core, key) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.25);
    chirps(core, d, t, { n: 3, gap: 0.075, f0: 1500, f1: 2300, dec: 0.07, peak: 0.16 });
    note(core, harp, t + 0.22, ladder(key, 3), 0.5, d);
    note(core, harp, t + 0.3, ladder(key, 4), 0.5, d);
  },

  /**
   * An enemy falls. `a` is the enemy type's number (see ENEMY_ORDER): each animal has its own last sound
   * (hiss, screech, yowl, croak, skitter-crunch, pops). With no number it is a generic comic pop.
   */
  defeat(core, key, a = -1) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.2);
    const [n1, n2] = byVar([[3, 5], [2, 4], [3, 6], [4, 5]]);
    const chime = (vel = 1, at = 0.07) => {
      note(core, bell, t + at, ladder(key, n1), 0.4 * vel, d);
      note(core, bell, t + at + 0.07, ladder(key, n2), 0.35 * vel, d);
    };
    switch (Math.round(a)) {
      case 0: // snake: a hiss that pops
        noise(core, { t, type: 'highpass', f0: 7000, f1: 2500, peak: 0.3, dec: 0.22, dst: d });
        tone(core, { t, f0: 620 * jit(0.08), f1: 120, dec: 0.12, peak: 0.38, dst: d });
        noise(core, { t, type: 'bandpass', f0: 1500, q: 1, peak: 0.15, dec: 0.08, dst: d });
        chime();
        break;
      case 1: // eagle: a burst of feathers and a broken screech
        noise(core, { t, type: 'bandpass', f0: 3200, f1: 1400, q: 0.8, peak: 0.3, dec: 0.25, dst: d, pink: true });
        tone(core, { t, type: 'sawtooth', f0: 2600 * jit(0.06), f1: 900, dec: 0.2, peak: 0.14, dst: d, lp: 3200, attack: 0.01 });
        noise(core, { t: t + 0.05, type: 'highpass', f0: 6000, peak: 0.08, dec: 0.3, dst: d });
        chime(0.8);
        break;
      case 2:
      case 3: {
        // the cats: a yowl that falls away (the jaguar's is deeper)
        const big = Math.round(a) === 3;
        const f = (big ? 300 : 480) * jit(0.07);
        tone(core, { t, type: 'sawtooth', f0: f, f1: f * 0.45, dec: 0.32, peak: 0.2, dst: d, lp: 1500, attack: 0.02 });
        tone(core, { t, type: 'triangle', f0: f * 2, f1: f, dec: 0.25, peak: 0.08, dst: d });
        noise(core, { t, type: 'bandpass', f0: big ? 500 : 900, f1: 300, q: 1.2, peak: 0.22, dec: 0.25, dst: d });
        tone(core, { t, f0: 140, f1: 55, dec: 0.15, peak: 0.3, dst: d });
        chime(0.8);
        break;
      }
      case 4: // boa: a long deflating hiss and a soft thud
        noise(core, { t, type: 'highpass', f0: 3000, f1: 1200, peak: 0.26, dec: 0.35, attack: 0.02, dst: d });
        tone(core, { t, f0: 150, f1: 55, dec: 0.22, peak: 0.5, dst: d });
        noise(core, { t, type: 'lowpass', f0: 900, peak: 0.15, dec: 0.2, dst: d });
        chime(0.7);
        break;
      case 5: // caiman: a low bellow and a splash
        tone(core, { t, type: 'sawtooth', f0: 95, f1: 48, dec: 0.45, peak: 0.3, dst: d, lp: 420, attack: 0.03 });
        noise(core, { t, type: 'lowpass', f0: 1500, f1: 200, peak: 0.3, dec: 0.35, dst: d, pink: true });
        tone(core, { t, f0: 80, f1: 38, dec: 0.4, peak: 0.55, dst: d });
        chime(0.6);
        break;
      case 6: // tayra: chatter and a squeak
        chirps(core, d, t, { n: 5, gap: 0.035, f0: 2400, f1: 1500, dec: 0.04, peak: 0.13, type: 'square' });
        tone(core, { t: t + 0.04, f0: 600, f1: 150, dec: 0.1, peak: 0.25, dst: d });
        chime(0.9);
        break;
      case 7: // frog: a croak, a squelch and a bloop
        for (const o of [0, 0.075]) tone(core, { t: t + o, type: 'sawtooth', f0: 210 * jit(0.06), f1: 150, dec: 0.07, peak: 0.2, dst: d, lp: 700 });
        noise(core, { t: t + 0.06, type: 'bandpass', f0: 900, f1: 300, q: 1.5, peak: 0.22, dec: 0.14, dst: d });
        tone(core, { t: t + 0.12, f0: 500, f1: 180, dec: 0.08, peak: 0.2, dst: d });
        chime();
        break;
      case 8: // spider: a skitter, then a crunch
        for (let i = 0; i < 7; i++) noise(core, { t: t + i * 0.022 + Math.random() * 0.01, type: 'bandpass', f0: 4000 + Math.random() * 1500, q: 4, peak: 0.1, dec: 0.018, dst: d });
        noise(core, { t: t + 0.16, type: 'bandpass', f0: 1400, q: 2, peak: 0.3, dec: 0.07, dst: d });
        woodblock(core, d, t + 0.16, 0.7);
        tone(core, { t: t + 0.16, f0: 220, f1: 90, dec: 0.1, peak: 0.3, dst: d });
        chime(0.7, 0.2);
        break;
      case 9: // ants: a little cluster of pops
        for (let i = 0; i < 6; i++) tone(core, { t: t + i * 0.02 + Math.random() * 0.015, f0: 700 + Math.random() * 600, f1: 250, dec: 0.035, peak: 0.22, dst: d });
        noise(core, { t, type: 'bandpass', f0: 3000, q: 1, peak: 0.06, dec: 0.15, dst: d });
        chime(0.7);
        break;
      default:
        tone(core, { t, f0: 720 * jit(), f1: 130, dec: 0.13, peak: 0.4, dst: d });
        noise(core, { t, type: 'bandpass', f0: 1800, f1: 500, q: 1, peak: 0.25, dec: 0.14, dst: d });
        chime();
    }
    streakSparkle(core, key, t + 0.1, d);
  },

  /** Pokey is hurt: a thud, a falling "oof" in his voice and a sting (four pitches) */
  hurt(core) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.2);
    const k = byVar([1, 1.1, 0.9, 1.18]);
    tone(core, { t, f0: 120 * k, f1: 45, dec: 0.25, peak: 0.7, dst: d });
    tone(core, { t, type: 'sawtooth', f0: 380 * k, f1: 170, dec: 0.28, peak: 0.12, dst: d, lp: 1500 });
    tone(core, { t, type: 'triangle', f0: 255 * k, f1: 120, dec: 0.3, peak: 0.16, dst: d });
    noise(core, { t, type: 'highpass', f0: 2500, peak: 0.25, dec: 0.05, dst: d });
    noise(core, { t, type: 'bandpass', f0: 1200, f1: 300, peak: 0.25, dec: 0.2, dst: d });
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
      bp.frequency.value = 2600;
      bp.Q.value = 2.5;
      const g = core.ctx.createGain();
      envelope(g.gain, at, { a: 0.02, peak: 0.26, d: dur * 0.35, sustain: 0.1, hold: Math.max(0.01, dur - 0.2), r: 0.2 });
      os.connect(bp);
      bp.connect(g);
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
  land(core, _k, a = 0.3) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.05);
    const s = Math.max(0.15, Math.min(1, a));
    tone(core, { t, f0: 110 * jit(), f1: 55, dec: 0.1 + 0.08 * s, peak: 0.18 + 0.4 * s, dst: d });
    noise(core, { t, type: 'lowpass', f0: 1800, f1: 400, peak: 0.1 + 0.2 * s, dec: 0.08 + 0.08 * s, dst: d, pink: true });
  },

  /** a soft step: one leaf-crunch */
  step(core) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.03);
    noise(core, { t, type: 'bandpass', f0: pick([1200, 1500, 1800]), q: 0.9, peak: 0.06, dec: 0.05, dst: d, pink: true });
    tone(core, { t, f0: 95 * jit(), f1: 60, dec: 0.05, peak: 0.07, dst: d });
  },

  /** checkpoint reached: a bright three-note flourish */
  checkpoint(core, key) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.4);
    [0, 2, 3].forEach((n, i) => note(core, bell, t + i * 0.09, ladder(key, n), 0.7, d));
    note(core, marimba, t, ladder(key, 0) - 12, 0.7, d);
    noise(core, { t: t + 0.1, type: 'highpass', f0: 6500, peak: 0.07, dec: 0.4, dst: d });
  },

  /** an extra life: a quick fanfare */
  oneUp(core, key) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.35);
    [0, 2, 4, 3, 4, 5, 7].forEach((n, i) => note(core, steelpan, t + i * 0.065, ladder(key, n), 0.7, d));
    note(core, bell, t + 0.5, ladder(key, 7), 0.5, d);
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
      noise(core, { t, type: 'bandpass', f0: 4200 * pj, f1: 2600, q: 1.5, peak: 0.16, dec: byVar([0.3, 0.4, 0.24, 0.34]), attack: 0.04, dst: d });
      tone(core, { t, type: 'sawtooth', f0: 560 * pj, f1: byVar([380, 300, 440, 340]), dec: 0.28, peak: 0.07, dst: d, lp: 1500 });
    } else if (a === 1) {
      noise(core, { t, type: 'bandpass', f0: 700, f1: 2000, q: 0.9, peak: 0.2, dec: 0.15, dst: d, pink: true });
      tone(core, { t, type: 'sawtooth', f0: 420, f1: 300, dec: 0.18, peak: 0.12, dst: d, lp: 1400 });
    } else {
      tone(core, { t, f0: 120, f1: 55, dec: 0.15, peak: 0.45, dst: d });
      noise(core, { t, type: 'lowpass', f0: 1500, f1: 300, peak: 0.2, dec: 0.1, dst: d, pink: true });
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
      tone(core, { t, f0: 100, f1: 38, dec: 0.4, peak: 0.85, dst: d });
      noise(core, { t, type: 'lowpass', f0: 2200, f1: 250, peak: 0.4, dec: 0.25, dst: d });
      noise(core, { t, type: 'highpass', f0: 2500, peak: 0.18, dec: 0.04, dst: d });
    }
  },

  boaCall(core, _k, a = 0) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.2);
    if (a === 0) {
      // a long hiss with a rattle at the end
      const hd = byVar([0.5, 0.65, 0.4, 0.55]);
      noise(core, { t, type: 'highpass', f0: byVar([4800, 4200, 5400, 4600]), q: 0.7, peak: 0.24, dec: hd, attack: 0.08, dst: d });
      noise(core, { t, type: 'bandpass', f0: 7000, q: 1, peak: 0.1, dec: hd, attack: 0.1, dst: d });
    } else if (a === 1) {
      noise(core, { t, type: 'highpass', f0: 2500, f1: 7000, peak: 0.34, dec: 0.18, dst: d });
      tone(core, { t, f0: 400, f1: 150, dec: 0.12, peak: 0.12, dst: d });
    } else {
      tone(core, { t, f0: 140, f1: 70, dec: 0.12, peak: 0.4, dst: d });
      noise(core, { t, type: 'bandpass', f0: 1800, q: 2, peak: 0.2, dec: 0.05, dst: d });
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
      noise(core, { t, type: 'bandpass', f0: 2300, q: 2.2, peak: 0.55, dec: 0.045, dst: d });
      woodblock(core, d, t, 0.8);
      tone(core, { t, f0: 95, f1: 50, dec: 0.2, peak: 0.6, dst: d });
      noise(core, { t: t + 0.05, type: 'bandpass', f0: 1800, q: 2.2, peak: 0.25, dec: 0.04, dst: d });
    }
  },

  tayraCall(core, _k, a = 0) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.15);
    if (a === 0) {
      chirps(core, d, t, { n: byVar([5, 4, 6, 5]), gap: byVar([0.07, 0.085, 0.06, 0.075]), f0: 1700 * jit(0.1), f1: 2400, dec: 0.05, peak: 0.12, type: 'square' });
    } else if (a === 1) {
      noise(core, { t, type: 'bandpass', f0: 1200, f1: 3500, q: 1, peak: 0.28, dec: 0.2, dst: d, pink: true });
      chirps(core, d, t, { n: 2, gap: 0.05, f0: 2000, f1: 2800, dec: 0.05, peak: 0.1, type: 'square' });
    } else {
      tone(core, { t, f0: 150, f1: 70, dec: 0.1, peak: 0.35, dst: d });
      noise(core, { t, type: 'highpass', f0: 2600, peak: 0.16, dec: 0.04, dst: d });
    }
  },

  // ----------------------------------------------------------------- interface
  uiTap(core) {
    const t = core.ctx.currentTime;
    rim(core, out(core, 0.1), t, 0.9);
  },
  uiConfirm(core, key) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.25);
    note(core, marimba, t, ladder(key, 2), 0.8, d);
    note(core, marimba, t + 0.07, ladder(key, 3), 0.8, d);
  },
  uiBack(core, key) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.2);
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
  /** pause: the world dips under a soft descending sweep */
  pauseIn(core) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.2);
    noise(core, { t, type: 'lowpass', f0: 5000, f1: 300, q: 0.7, peak: 0.2, dec: 0.3, attack: 0.02, dst: d, pink: true });
    tone(core, { t, f0: 520, f1: 260, dec: 0.18, peak: 0.12, dst: d });
  },
  pauseOut(core) {
    const t = core.ctx.currentTime;
    const d = out(core, 0.2);
    noise(core, { t, type: 'lowpass', f0: 300, f1: 5000, q: 0.7, peak: 0.2, dec: 0.28, attack: 0.1, dst: d, pink: true });
    tone(core, { t, f0: 260, f1: 520, dec: 0.18, peak: 0.12, dst: d });
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
  jump: 1.45, doubleJump: 0.8, punch: 1.1, megaPunch: 0.6, kick: 1.1, whoosh: 3, fruit: 0.75, heart: 0.75, superHeart: 0.5,
  power: 0.55, vine: 2.5, climb: 2.2, shrine: 0.45, relic: 0.45, hurt: 1.1, eagle: 1.6, roar: 0.75, land: 1.6, step: 2.2, checkpoint: 0.55, oneUp: 0.55,
};


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
  TRIM = classicGain(name, TRIMS[name] ?? 1);
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
