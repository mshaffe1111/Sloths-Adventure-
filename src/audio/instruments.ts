/**
 * Synthesised instruments. Everything is built from oscillators, filtered noise and envelopes, so there
 * are no audio files to download and every voice can be re-tuned in code.
 *
 *   NoteVoice   one note:          (core, dst, time, hz, seconds, velocity, params?)
 *   ChordVoice  a held chord:      (core, dst, time, hz[], seconds, velocity, params?)
 *   DrumVoice   one hit:           (core, dst, time, velocity)
 */
import { AudioCore, envelope } from './core.ts';
import { brassSection, drum as sampledDrum, plucked, stringSection, sustained } from './orchVoices.ts';

export type NoteVoice = (core: AudioCore, dst: AudioNode, t: number, hz: number, dur: number, vel: number) => void;
export type ChordVoice = (core: AudioCore, dst: AudioNode, t: number, hz: number[], dur: number, vel: number) => void;
export type DrumVoice = (core: AudioCore, dst: AudioNode, t: number, vel: number) => void;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const FLOOR = 0.0001;

function osc(c: BaseAudioContext, type: OscillatorType, hz: number, t: number, stop: number, detuneCents = 0) {
  const o = c.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(hz, t);
  if (detuneCents) o.detune.setValueAtTime(detuneCents, t);
  o.start(t);
  o.stop(stop);
  return o;
}

/** percussive decay: instant attack, exponential fall. returns the time the sound has fully died */
function pluckEnv(p: AudioParam, t: number, peak: number, decay: number, attack = 0.003) {
  p.cancelScheduledValues(t);
  p.setValueAtTime(FLOOR, t);
  p.linearRampToValueAtTime(peak, t + attack);
  p.setTargetAtTime(FLOOR, t + attack, decay / 4);
  return t + attack + decay * 1.5;
}

// ---------------------------------------------------------------------------------------------
// Struck / plucked tuned instruments (additive: a few inharmonic partials with their own decay)
// ---------------------------------------------------------------------------------------------

type Partials = Array<[ratio: number, gain: number, decay: number]>;

function struck(core: AudioCore, dst: AudioNode, t: number, hz: number, vel: number, partials: Partials, baseDecay: number, peak: number) {
  const c = core.ctx;
  const stop = t + baseDecay * 1.6 + 0.05;
  const out = c.createGain();
  out.gain.value = 1;
  out.connect(dst);
  for (const [ratio, g, dec] of partials) {
    const f = hz * ratio;
    if (f > 16000) continue;
    const o = osc(c, 'sine', f, t, stop);
    const gn = c.createGain();
    pluckEnv(gn.gain, t, peak * vel * g, baseDecay * dec);
    o.connect(gn);
    gn.connect(out);
  }
}

/** warm wooden mallet: low notes ring, high notes click */
export const marimba: NoteVoice = (core, dst, t, hz, _d, vel) => {
  const dec = 0.16 + 0.9 * clamp((1000 - hz) / 900, 0, 1);
  struck(core, dst, t, hz, vel, [[1, 1, 1], [3.99, 0.3, 0.32], [9.2, 0.07, 0.1]], dec, 0.5);
};

/** thumb piano / music box: glassy, inharmonic, lasts a while */
export const kalimba: NoteVoice = (core, dst, t, hz, _d, vel) => {
  struck(core, dst, t, hz, vel, [[1, 1, 1], [2.76, 0.28, 0.35], [5.4, 0.1, 0.14]], 1.15, 0.42);
};

/** celesta / glockenspiel bell */
export const bell: NoteVoice = (core, dst, t, hz, _d, vel) => {
  struck(core, dst, t, hz, vel, [[1, 1, 1], [2.4, 0.38, 0.6], [5.95, 0.22, 0.32], [8.1, 0.09, 0.18]], 1.9, 0.34);
};

/** steel-pan-like: bright fundamental with a strong octave */
export const steelpan: NoteVoice = (core, dst, t, hz, _d, vel) => {
  struck(core, dst, t, hz, vel, [[1, 1, 1], [2, 0.55, 0.7], [3.01, 0.22, 0.4], [4.2, 0.08, 0.2]], 0.55, 0.42);
};

/** nylon-string guitar / harp pluck: filtered saw whose brightness falls as it rings */
export const pluck: NoteVoice = (core, dst, t, hz, _d, vel) => {
  const c = core.ctx;
  const dec = 0.45 + 0.5 * clamp((600 - hz) / 500, 0, 1);
  const stop = t + dec * 1.7;
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.Q.value = 0.7;
  lp.frequency.setValueAtTime(Math.min(9000, hz * 9), t);
  lp.frequency.setTargetAtTime(Math.max(400, hz * 1.6), t, 0.09);
  const g = c.createGain();
  pluckEnv(g.gain, t, 0.38 * vel, dec);
  const o1 = osc(c, 'sawtooth', hz, t, stop);
  const o2 = osc(c, 'triangle', hz * 2, t, stop, 3);
  const g2 = c.createGain();
  g2.gain.value = 0.35;
  o1.connect(lp);
  o2.connect(g2);
  g2.connect(lp);
  lp.connect(g);
  g.connect(dst);
};

/** harp: pure and bright */
const harpSynth: NoteVoice = (core, dst, t, hz, _d, vel) => {
  const c = core.ctx;
  const dec = 0.9 + 0.8 * clamp((500 - hz) / 450, 0, 1);
  const stop = t + dec * 1.6;
  const g = c.createGain();
  pluckEnv(g.gain, t, 0.36 * vel, dec, 0.002);
  const o1 = osc(c, 'triangle', hz, t, stop);
  const o2 = osc(c, 'sine', hz * 2, t, stop);
  const g2 = c.createGain();
  pluckEnv(g2.gain, t, 0.16 * vel, dec * 0.35, 0.002);
  o1.connect(g);
  o2.connect(g2);
  g2.connect(g);
  g.connect(dst);
};

// ---------------------------------------------------------------------------------------------
// Sustained voices
// ---------------------------------------------------------------------------------------------

/** breathy wooden flute with a late vibrato */
const fluteSynth: NoteVoice = (core, dst, t, hz, dur, vel) => {
  const c = core.ctx;
  const hold = Math.max(0.12, dur);
  const stop = t + hold + 0.25;
  const g = c.createGain();
  envelope(g.gain, t, { a: 0.06, peak: 0.34 * vel, d: 0.2, sustain: 0.26 * vel, hold, r: 0.16 });
  const o1 = osc(c, 'sine', hz, t, stop);
  const o2 = osc(c, 'triangle', hz * 2, t, stop);
  const g2 = c.createGain();
  g2.gain.value = 0.16;
  // vibrato fades in after the note has started
  const lfo = osc(c, 'sine', 5.3, t, stop);
  const lg = c.createGain();
  lg.gain.setValueAtTime(0, t);
  lg.gain.linearRampToValueAtTime(hz * 0.006, t + Math.min(0.5, hold * 0.8));
  lfo.connect(lg);
  lg.connect(o1.frequency);
  lg.connect(o2.frequency);
  o1.connect(g);
  o2.connect(g2);
  g2.connect(g);
  // breath
  const n = core.noiseSource(t, hold + 0.3);
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = Math.min(9000, hz * 3);
  bp.Q.value = 1.1;
  const ng = c.createGain();
  envelope(ng.gain, t, { a: 0.04, peak: 0.07 * vel, d: 0.12, sustain: 0.025 * vel, hold, r: 0.14 });
  n.connect(bp);
  bp.connect(ng);
  ng.connect(g);
  g.connect(dst);
};

/** soft synth lead: detuned triangles + a little saw; for tender melodies */
export const softLead: NoteVoice = (core, dst, t, hz, dur, vel) => {
  const c = core.ctx;
  const hold = Math.max(0.1, dur);
  const stop = t + hold + 0.3;
  const g = c.createGain();
  envelope(g.gain, t, { a: 0.03, peak: 0.28 * vel, d: 0.25, sustain: 0.2 * vel, hold, r: 0.2 });
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = clamp(hz * 5, 900, 5200);
  const lfo = osc(c, 'sine', 5, t, stop);
  const lg = c.createGain();
  lg.gain.setValueAtTime(0, t);
  lg.gain.linearRampToValueAtTime(7, t + 0.4);
  lfo.connect(lg);
  for (const d of [-6, 6]) {
    const o = osc(c, 'triangle', hz, t, stop, d);
    lg.connect(o.detune);
    o.connect(lp);
  }
  const s = osc(c, 'sawtooth', hz, t, stop);
  const sg = c.createGain();
  sg.gain.value = 0.2;
  s.connect(sg);
  sg.connect(lp);
  lp.connect(g);
  g.connect(dst);
};

/** brass section stab / swell: saw pair with a filter that blooms */
export const brass: NoteVoice = (core, dst, t, hz, dur, vel) => {
  const c = core.ctx;
  const hold = Math.max(0.1, dur);
  const stop = t + hold + 0.25;
  const g = c.createGain();
  envelope(g.gain, t, { a: 0.045, peak: 0.3 * vel, d: 0.2, sustain: 0.22 * vel, hold, r: 0.14 });
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.Q.value = 1.2;
  lp.frequency.setValueAtTime(hz * 1.2, t);
  lp.frequency.setTargetAtTime(clamp(hz * 7, 1500, 5000), t, 0.05);
  lp.frequency.setTargetAtTime(clamp(hz * 3.5, 900, 2600), t + 0.2, 0.25);
  for (const d of [-5, 5]) {
    const o = osc(c, 'sawtooth', hz, t, stop, d);
    o.connect(lp);
  }
  lp.connect(g);
  g.connect(dst);
};

/** plucky sine+saw bass. The filter stays open enough, and an octave-up layer is added, so the note is still heard on a phone speaker, which gives almost nothing below 150 Hz */
export const bass: NoteVoice = (core, dst, t, hz, dur, vel) => {
  const c = core.ctx;
  const hold = Math.max(0.08, dur * 0.92);
  const stop = t + hold + 0.15;
  const g = c.createGain();
  envelope(g.gain, t, { a: 0.008, peak: 0.55 * vel, d: 0.3, sustain: 0.38 * vel, hold, r: 0.09 });
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.Q.value = 1.6;
  lp.frequency.setValueAtTime(clamp(hz * 14, 900, 2600), t);
  lp.frequency.setTargetAtTime(clamp(hz * 6, 420, 1100), t, 0.08);
  const o1 = osc(c, 'sawtooth', hz, t, stop);
  const o2 = osc(c, 'sine', hz, t, stop);
  const o3 = osc(c, 'triangle', hz * 2, t, stop);
  const g1 = c.createGain();
  g1.gain.value = 0.6;
  const g3 = c.createGain();
  g3.gain.value = 0.42;
  o1.connect(lp);
  lp.connect(g1);
  g1.connect(g);
  o2.connect(g);
  o3.connect(g3);
  g3.connect(g);
  g.connect(dst);
};

/** round sub bass for deep, simple lines */
export const subBass: NoteVoice = (core, dst, t, hz, dur, vel) => {
  const c = core.ctx;
  const hold = Math.max(0.1, dur * 0.95);
  const stop = t + hold + 0.2;
  const g = c.createGain();
  envelope(g.gain, t, { a: 0.015, peak: 0.6 * vel, hold, r: 0.12 });
  const o1 = osc(c, 'sine', hz, t, stop);
  const o2 = osc(c, 'triangle', hz * 2, t, stop);
  const g2 = c.createGain();
  g2.gain.value = 0.5;
  // a third partial a fifth above that: the low note is then heard as a pitch even where the speaker cannot reproduce it
  const o3 = osc(c, 'sine', hz * 3, t, stop);
  const g3 = c.createGain();
  g3.gain.value = 0.22;
  o1.connect(g);
  o2.connect(g2);
  g2.connect(g);
  o3.connect(g3);
  g3.connect(g);
  g.connect(dst);
};

/** driving synth bass (saw + square through a resonant filter) for the faster worlds */
export const synthBass: NoteVoice = (core, dst, t, hz, dur, vel) => {
  const c = core.ctx;
  const hold = Math.max(0.06, dur * 0.85);
  const stop = t + hold + 0.12;
  const g = c.createGain();
  envelope(g.gain, t, { a: 0.006, peak: 0.45 * vel, d: 0.18, sustain: 0.32 * vel, hold, r: 0.07 });
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.Q.value = 5;
  lp.frequency.setValueAtTime(clamp(hz * 14, 900, 3000), t);
  lp.frequency.setTargetAtTime(clamp(hz * 5, 340, 1200), t, 0.09);
  const o1 = osc(c, 'sawtooth', hz, t, stop);
  const o2 = osc(c, 'square', hz * 0.5, t, stop);
  const g2 = c.createGain();
  g2.gain.value = 0.5;
  o1.connect(lp);
  o2.connect(g2);
  g2.connect(lp);
  lp.connect(g);
  g.connect(dst);
};

// ---------------------------------------------------------------------------------------------
// Chord voices (pads, strings, choir)
// ---------------------------------------------------------------------------------------------

/** warm analog pad: detuned saws through a slowly opening low-pass */
export const pad: ChordVoice = (core, dst, t, hzs, dur, vel) => {
  const c = core.ctx;
  const atk = Math.min(0.9, dur * 0.4);
  const rel = 0.9;
  const stop = t + dur + rel + 0.1;
  const g = c.createGain();
  envelope(g.gain, t, { a: atk, peak: 0.16 * vel, hold: dur, r: rel });
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.Q.value = 0.6;
  lp.frequency.setValueAtTime(500, t);
  lp.frequency.linearRampToValueAtTime(1500, t + atk + dur * 0.3);
  hzs.forEach((hz, i) => {
    for (const d of [-8, 8]) {
      const o = osc(c, 'sawtooth', hz, t, stop, d + (i % 2 ? 2 : -2));
      o.connect(lp);
    }
  });
  const sub = osc(c, 'sine', hzs[0] / 2, t, stop);
  const sg = c.createGain();
  sg.gain.value = 0.7;
  sub.connect(sg);
  sg.connect(lp);
  lp.connect(g);
  g.connect(dst);
};

/** string ensemble: two detuned saws per note with a shared vibrato (the beating between them is the ensemble) */
export const strings: ChordVoice = (core, dst, t, hzs, dur, vel) => {
  const c = core.ctx;
  const atk = Math.min(0.35, dur * 0.35);
  const rel = 0.6;
  const stop = t + dur + rel + 0.1;
  const g = c.createGain();
  envelope(g.gain, t, { a: atk, peak: 0.14 * vel, hold: dur, r: rel });
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 3000;
  lp.Q.value = 0.4;
  const lfo = osc(c, 'sine', 5.1, t, stop);
  const lg = c.createGain();
  lg.gain.value = 9;
  lfo.connect(lg);
  hzs.forEach((hz) => {
    for (const d of [-9, 9]) {
      const o = osc(c, 'sawtooth', hz, t, stop, d);
      lg.connect(o.detune);
      o.connect(lp);
    }
  });
  lp.connect(g);
  g.connect(dst);
};

/** vowel "aah" choir: saws pushed through two formant filters */
export const choir: ChordVoice = (core, dst, t, hzs, dur, vel) => {
  const c = core.ctx;
  const atk = Math.min(0.7, dur * 0.45);
  const rel = 0.9;
  const stop = t + dur + rel + 0.1;
  const g = c.createGain();
  envelope(g.gain, t, { a: atk, peak: 0.2 * vel, hold: dur, r: rel });
  const mix = c.createGain();
  const lfo = osc(c, 'sine', 5, t, stop);
  const lg = c.createGain();
  lg.gain.value = 10;
  lfo.connect(lg);
  hzs.slice(0, 3).forEach((hz) => {
    for (const d of [-9, 9]) {
      const o = osc(c, 'sawtooth', hz, t, stop, d);
      lg.connect(o.detune);
      o.connect(mix);
    }
  });
  [[730, 5, 1], [1090, 7, 0.7], [2440, 9, 0.25]].forEach(([f, q, a]) => {
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = f;
    bp.Q.value = q;
    const bg = c.createGain();
    bg.gain.value = a;
    mix.connect(bp);
    bp.connect(bg);
    bg.connect(g);
  });
  g.connect(dst);
};

// ---------------------------------------------------------------------------------------------
// Drums & percussion
// ---------------------------------------------------------------------------------------------

function noiseHit(core: AudioCore, dst: AudioNode, t: number, o: { type: BiquadFilterType; f: number; q?: number; peak: number; decay: number; attack?: number }) {
  const c = core.ctx;
  const n = core.noiseSource(t, o.decay * 1.8 + 0.05);
  const f = c.createBiquadFilter();
  f.type = o.type;
  f.frequency.value = o.f;
  f.Q.value = o.q ?? 0.8;
  const g = c.createGain();
  pluckEnv(g.gain, t, o.peak, o.decay, o.attack ?? 0.001);
  n.connect(f);
  f.connect(g);
  g.connect(dst);
}

function dropTone(core: AudioCore, dst: AudioNode, t: number, o: { from: number; to: number; sweep: number; peak: number; decay: number; type?: OscillatorType }) {
  const c = core.ctx;
  const stop = t + o.decay * 1.7;
  const os = osc(c, o.type ?? 'sine', o.from, t, stop);
  os.frequency.setValueAtTime(o.from, t);
  os.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t + o.sweep);
  const g = c.createGain();
  pluckEnv(g.gain, t, o.peak, o.decay, 0.002);
  os.connect(g);
  g.connect(dst);
}

export const kick: DrumVoice = (core, dst, t, vel) => {
  dropTone(core, dst, t, { from: 150, to: 46, sweep: 0.12, peak: 0.95 * vel, decay: 0.3 });
  noiseHit(core, dst, t, { type: 'highpass', f: 2500, peak: 0.4 * vel, decay: 0.012 });
};
export const softKick: DrumVoice = (core, dst, t, vel) => {
  dropTone(core, dst, t, { from: 110, to: 52, sweep: 0.1, peak: 0.75 * vel, decay: 0.26 });
};
const snareSynth: DrumVoice = (core, dst, t, vel) => {
  noiseHit(core, dst, t, { type: 'bandpass', f: 1900, q: 0.7, peak: 1.1 * vel, decay: 0.17 });
  dropTone(core, dst, t, { from: 220, to: 150, sweep: 0.07, peak: 0.4 * vel, decay: 0.11, type: 'triangle' });
};
export const rim: DrumVoice = (core, dst, t, vel) => {
  noiseHit(core, dst, t, { type: 'bandpass', f: 1800, q: 2, peak: 0.7 * vel, decay: 0.03 });
  dropTone(core, dst, t, { from: 520, to: 430, sweep: 0.02, peak: 0.22 * vel, decay: 0.04, type: 'triangle' });
};
export const brush: DrumVoice = (core, dst, t, vel) => {
  noiseHit(core, dst, t, { type: 'bandpass', f: 3600, q: 0.5, peak: 0.6 * vel, decay: 0.13, attack: 0.025 });
};
export const hat: DrumVoice = (core, dst, t, vel) => {
  noiseHit(core, dst, t, { type: 'highpass', f: 7200, q: 0.5, peak: 0.55 * vel, decay: 0.045 });
};
export const ohat: DrumVoice = (core, dst, t, vel) => {
  noiseHit(core, dst, t, { type: 'highpass', f: 6500, q: 0.5, peak: 0.5 * vel, decay: 0.22 });
};
export const shaker: DrumVoice = (core, dst, t, vel) => {
  noiseHit(core, dst, t, { type: 'bandpass', f: 5600, q: 1.1, peak: 0.6 * vel, decay: 0.06, attack: 0.012 });
};
export const congaHi: DrumVoice = (core, dst, t, vel) => {
  dropTone(core, dst, t, { from: 430, to: 300, sweep: 0.05, peak: 0.75 * vel, decay: 0.2 });
  noiseHit(core, dst, t, { type: 'bandpass', f: 1500, q: 1.5, peak: 0.12 * vel, decay: 0.02 });
};
export const congaLo: DrumVoice = (core, dst, t, vel) => {
  dropTone(core, dst, t, { from: 300, to: 205, sweep: 0.06, peak: 0.8 * vel, decay: 0.24 });
  noiseHit(core, dst, t, { type: 'bandpass', f: 1000, q: 1.5, peak: 0.1 * vel, decay: 0.02 });
};
export const clave: DrumVoice = (core, dst, t, vel) => {
  dropTone(core, dst, t, { from: 2500, to: 2350, sweep: 0.01, peak: 0.26 * vel, decay: 0.06 });
};
export const woodblock: DrumVoice = (core, dst, t, vel) => {
  dropTone(core, dst, t, { from: 1450, to: 1300, sweep: 0.02, peak: 0.3 * vel, decay: 0.07, type: 'triangle' });
};
export const tom: DrumVoice = (core, dst, t, vel) => {
  dropTone(core, dst, t, { from: 190, to: 105, sweep: 0.14, peak: 0.6 * vel, decay: 0.4 });
};
const taikoSynth: DrumVoice = (core, dst, t, vel) => {
  dropTone(core, dst, t, { from: 105, to: 50, sweep: 0.2, peak: 0.95 * vel, decay: 0.8 });
  noiseHit(core, dst, t, { type: 'lowpass', f: 900, q: 0.7, peak: 0.35 * vel, decay: 0.1 });
};
const timpaniSynth: DrumVoice = (core, dst, t, vel) => {
  dropTone(core, dst, t, { from: 118, to: 98, sweep: 0.25, peak: 0.8 * vel, decay: 1.4 });
  dropTone(core, dst, t, { from: 180, to: 150, sweep: 0.2, peak: 0.25 * vel, decay: 0.8 });
};
const crashSynth: DrumVoice = (core, dst, t, vel) => {
  noiseHit(core, dst, t, { type: 'highpass', f: 3400, q: 0.5, peak: 0.85 * vel, decay: 1.6 });
};
/** reversed-cymbal style rise into a downbeat */
export const riser: DrumVoice = (core, dst, t, vel) => {
  const c = core.ctx;
  const n = core.noiseSource(t, 1.8);
  const f = c.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.setValueAtTime(800, t);
  f.frequency.exponentialRampToValueAtTime(7000, t + 1.6);
  const g = c.createGain();
  g.gain.setValueAtTime(FLOOR, t);
  g.gain.exponentialRampToValueAtTime(0.6 * vel, t + 1.6);
  g.gain.linearRampToValueAtTime(FLOOR, t + 1.65);
  n.connect(f);
  f.connect(g);
  g.connect(dst);
};


// ---------------------------------------------------------------------------------------------
// The recorded orchestra (see orchVoices.ts and orchLoader.ts). Each has a synthesized stand-in until it has loaded.
// ---------------------------------------------------------------------------------------------

export const cello: NoteVoice = sustained('cello', { copies: 3, a: 0.13, r: 0.4, gain: 0.85, bright: [2400, 9000] }, bass);
export const contra: NoteVoice = sustained('contra', { a: 0.1, r: 0.32, gain: 0.95, bright: [1400, 5500] }, subBass);
export const violins: NoteVoice = sustained('violins', { copies: 4, a: 0.17, r: 0.45, gain: 0.55, bright: [2600, 9500] }, softLead);
export const violas: NoteVoice = sustained('violas', { copies: 3, a: 0.15, r: 0.42, gain: 0.65, bright: [2400, 8500] }, softLead);
export const horn: NoteVoice = sustained('horn', { copies: 3, a: 0.07, r: 0.32, gain: 0.8, bright: [1500, 6500] }, brass);
export const trombone: NoteVoice = sustained('trombone', { copies: 2, a: 0.07, r: 0.3, gain: 0.75, bright: [1300, 5500] }, brass);
export const tuba: NoteVoice = sustained('tuba', { a: 0.09, r: 0.3, gain: 0.9, bright: [1000, 3800] }, bass);
export const celloStac: NoteVoice = plucked('celloStac', { gain: 0.95, ring: 0.3, damp: 0.14, bright: [3000, 10000] }, pluck);
export const violinStac: NoteVoice = plucked('violinStac', { gain: 0.8, ring: 0.2, damp: 0.1, bright: [3500, 11000] }, pluck);
export const hornStac: NoteVoice = plucked('hornStac', { gain: 0.85, ring: 0.36, damp: 0.16, bright: [1800, 7000] }, brass);
export const contraPizz: NoteVoice = plucked('contraPizz', { gain: 1.1, ring: 0.8, damp: 0.25, bright: [1600, 6000] }, bass);

export const harp: NoteVoice = plucked('harp', { gain: 0.95, ring: 1.8, damp: 0.5, bright: [3500, 10000] }, harpSynth);
export const flute: NoteVoice = sustained('flute', { copies: 2, a: 0.07, r: 0.25, gain: 0.85, bright: [2800, 9500] }, fluteSynth);
export const oboe: NoteVoice = sustained('oboe', { copies: 2, a: 0.06, r: 0.25, gain: 0.8, bright: [2400, 8000] }, softLead);
export const clarinet: NoteVoice = sustained('clarinet', { copies: 2, a: 0.06, r: 0.25, gain: 0.85, bright: [2200, 7500] }, softLead);
export const bassoon: NoteVoice = sustained('bassoon', { copies: 2, a: 0.07, r: 0.28, gain: 0.9, bright: [1800, 6000] }, bass);
export const snare: DrumVoice = sampledDrum('snare', { gain: 0.9, by: 'vel', jitter: 0.02 }, snareSynth);
export const triangle: DrumVoice = sampledDrum('triangle', { gain: 0.55, by: 'random', jitter: 0.01, ring: 1.6 }, rim);

export const orchStrings: ChordVoice = stringSection(strings, { cello, violas, violins });
export const orchBrass: ChordVoice = brassSection(pad, { horn, trombone });

export const taiko: DrumVoice = sampledDrum('bdrum', { gain: 1.0, by: 'vel', jitter: 0.015 }, taikoSynth, (core, dst, t, vel) =>
  dropTone(core, dst, t, { from: 90, to: 46, sweep: 0.14, peak: 0.28 * vel, decay: 0.5 })
);
export const bassDrum: DrumVoice = sampledDrum('bdrum', { gain: 1.0, by: 'vel', jitter: 0.01 }, taikoSynth);
export const timpani: DrumVoice = sampledDrum('timp', { gain: 1.0, by: 'random', jitter: 0.03, only: [1, 2, 3, 4] }, timpaniSynth);
export const crash: DrumVoice = sampledDrum('cymbal', { gain: 0.8, by: 'random', jitter: 0.02, ring: 2.4 }, crashSynth);
export const gong: DrumVoice = sampledDrum('gong', { gain: 0.9, by: 'vel', jitter: 0.01 }, crashSynth);

// ---- what the music plays in place of the synthesized voices (see realize.ts): all of them recordings, each with its stand-in

/** a real marimba (the recordings run F2 to C7) */
export const marimbaR: NoteVoice = plucked('marimba', { gain: 0.95, ring: 1.0, damp: 0.35, bright: [3000, 9500] }, marimba);
/** a real glockenspiel: it only sounds above G5, so a note written lower rings an octave up (or two) */
export const glockR: NoteVoice = (core, dst, t, hz, dur, vel) => {
  let h = hz;
  while (h < 784) h *= 2;
  plucked('glock', { gain: 0.8, ring: 2.6, damp: 0.7, bright: [4500, 13000] }, bell)(core, dst, t, h, dur, vel);
};
/** the low line: always a bowed double bass, and a short note is let ring a little (a plucked or clipped bass note repeated every eighth is a "boop") */
export const bassR: NoteVoice = (core, dst, t, hz, dur, vel) => contra(core, dst, t, hz, Math.max(dur, 0.34), vel * 0.92);
/** a figure that repeats (an arpeggio, a pulse): bowed short notes, as strings play an ostinato, in place of a plucked or struck note that pings */
export const figR: NoteVoice = (core, dst, t, hz, dur, vel) => {
  const m = 69 + 12 * Math.log2(hz / 440);
  (m < 55 ? celloStac : violinStac)(core, dst, t, m > 86 ? hz / 2 : hz, dur, vel * 0.8);
};
/** a harp played softly, for arpeggios: rounder and quieter than the harp's own bright pluck, so a figure that repeats does not ping */
export const harpSoft: NoteVoice = plucked('harp', { gain: 0.78, ring: 1.5, damp: 0.5, bright: [1500, 4200] }, harpSynth);
/** the woodwinds as a choir: each note of the chord goes to the instrument that sits in its register, a little apart as the players would be */
export const orchWinds: ChordVoice = (core, dst, t, hzs, dur, vel) => {
  const share = 0.9 / Math.sqrt(Math.max(1, hzs.length) / 2);
  hzs.forEach((hz, i) => {
    const m = 69 + 12 * Math.log2(hz / 440);
    const v = m < 55 ? bassoon : m < 74 ? clarinet : flute;
    v(core, dst, t + 0.007 * i + Math.random() * 0.01, hz, dur, vel * share);
  });
};
/** the bottom of the orchestra under a chord: the double basses on its lowest note and the cellos on the next one up */
export const orchLow: ChordVoice = (core, dst, t, hzs, dur, vel) => {
  const sorted = [...hzs].sort((a, b) => a - b);
  if (!sorted.length) return;
  contra(core, dst, t + Math.random() * 0.01, sorted[0], dur, vel * 0.9);
  if (sorted.length > 1) cello(core, dst, t + 0.012 + Math.random() * 0.01, sorted[1], dur, vel * 0.5);
};
/** a rim click or a woodblock, played as the snare drum's quietest hit */
export const snareSoft: DrumVoice = (core, dst, t, vel) => snare(core, dst, t, vel * 0.3);
/** nothing: hi-hats and shakers have no place in an orchestra */
export const mute: DrumVoice = () => {};

export const NOTE_VOICES: Record<string, NoteVoice> = {
  marimba, kalimba, bell, steelpan, pluck, harp, flute, softLead, brass, bass, subBass, synthBass,
  cello, contra, violins, violas, horn, trombone, tuba, celloStac, violinStac, hornStac, contraPizz, oboe, clarinet, bassoon,
  marimbaR, glockR, bassR, harpSoft, figR,
};
export const CHORD_VOICES: Record<string, ChordVoice> = { pad, strings, choir, orchStrings, orchBrass, orchWinds, orchLow };
export const DRUM_VOICES: Record<string, DrumVoice> = {
  kick, softKick, snare, rim, brush, hat, ohat, shaker, congaHi, congaLo, clave, woodblock, tom, taiko, timpani, crash, riser, bassDrum, gong, triangle,
  snareSoft, mute,
};
