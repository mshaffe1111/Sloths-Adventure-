/**
 * Dialogue "voices": every character gets a short, soft blip per spoken letter while their line types out
 * (the way Animal Crossing and Undertale do it). Pitch hops around a small scale so it sounds like speech
 * melody instead of a beep, and each character has their own timbre and register.
 */
import { AudioCore } from './core.ts';
import { midiHz } from './theory.ts';

interface Voice {
  base: number;
  /** semitone offsets the pitch hops between */
  hop: number[];
  type: OscillatorType;
  dec: number;
  peak: number;
  lp: number;
  /** share of breath noise mixed in (whispers, hisses) */
  breath?: number;
  /** pitch glide on each blip (1 = none, <1 falls) */
  glide?: number;
}

const PENT = [0, 2, 4, 7, 9];
const MINOR = [0, 3, 5, 7, 10];

const VOICES: Record<string, Voice> = {
  Narrator: { base: 53, hop: [0, 2, 4, 7], type: 'triangle', dec: 0.09, peak: 0.1, lp: 1200, glide: 0.99 },
  Slomatt: { base: 55, hop: PENT, type: 'triangle', dec: 0.075, peak: 0.16, lp: 1700, glide: 0.97 },
  Jennifur: { base: 67, hop: PENT, type: 'sine', dec: 0.085, peak: 0.16, lp: 4000, glide: 1.02 },
  'General Iron-Claw': { base: 38, hop: MINOR, type: 'sawtooth', dec: 0.09, peak: 0.13, lp: 700, glide: 0.95 },
  'Venom Fang': { base: 62, hop: MINOR, type: 'sawtooth', dec: 0.06, peak: 0.07, lp: 1500, breath: 0.9, glide: 0.98 },
  'Crocus Rex': { base: 41, hop: PENT, type: 'square', dec: 0.1, peak: 0.1, lp: 600, glide: 0.96 },
  'Shadow Prowler': { base: 50, hop: MINOR, type: 'triangle', dec: 0.08, peak: 0.08, lp: 1000, breath: 1.2, glide: 0.97 },
  'Sky Sovereign': { base: 66, hop: PENT, type: 'sawtooth', dec: 0.07, peak: 0.08, lp: 2600, glide: 1.03 },
  'Tarantula Queen': { base: 58, hop: MINOR, type: 'square', dec: 0.06, peak: 0.07, lp: 1800, breath: 0.4, glide: 0.99 },
  'Marsh Reaver': { base: 44, hop: MINOR, type: 'sawtooth', dec: 0.09, peak: 0.1, lp: 900, breath: 0.6, glide: 0.95 },
  'Stone Idol Golem': { base: 36, hop: [0, 7, 12], type: 'triangle', dec: 0.12, peak: 0.22, lp: 450, glide: 0.98 },
  'Night-Wing Monarch': { base: 60, hop: MINOR, type: 'triangle', dec: 0.09, peak: 0.1, lp: 1500, breath: 0.5, glide: 0.98 },
  'Magma Drake': { base: 36, hop: MINOR, type: 'sawtooth', dec: 0.1, peak: 0.12, lp: 650, glide: 0.95 },
};
const FALLBACK: Voice = { base: 48, hop: PENT, type: 'triangle', dec: 0.08, peak: 0.12, lp: 1400, glide: 0.98 };

/** one blip for a spoken character */
export function speechBlip(core: AudioCore, speaker: string, ch: string, index: number) {
  if (!/[A-Za-z0-9]/.test(ch)) return;
  if (index % 2 === 1) return; // every other letter: a calm rhythm
  const v = VOICES[speaker] ?? FALLBACK;
  const c = core.ctx;
  const t = c.currentTime + 0.005;
  // the letter picks the hop so the same word sounds the same every time
  const code = ch.toLowerCase().charCodeAt(0);
  const semis = v.hop[(code * 7 + index) % v.hop.length] + ((code % 3) - 1 === 1 ? 12 : 0);
  const hz = midiHz(v.base + semis) * (1 + (Math.random() - 0.5) * 0.02);
  const os = c.createOscillator();
  os.type = v.type;
  os.frequency.setValueAtTime(hz, t);
  os.frequency.exponentialRampToValueAtTime(hz * (v.glide ?? 1), t + v.dec);
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = v.lp;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(v.peak, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + v.dec);
  os.connect(lp);
  lp.connect(g);
  const dst = core.withReverb(core.sfx, 0.05);
  g.connect(dst);
  os.start(t);
  os.stop(t + v.dec + 0.03);
  if (v.breath) {
    const n = core.noiseSource(t, v.dec + 0.03, true);
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = Math.min(6000, hz * 4);
    bp.Q.value = 1.2;
    const ng = c.createGain();
    ng.gain.setValueAtTime(0.0001, t);
    ng.gain.linearRampToValueAtTime(v.peak * 0.8 * v.breath, t + 0.01);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + v.dec);
    n.connect(bp);
    bp.connect(ng);
    ng.connect(dst);
  }
}
