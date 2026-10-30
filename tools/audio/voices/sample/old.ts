// the game's old story voice (src/audio/speech.ts before story-delivery): an oscillator blip on every other letter. Kept here only so the
// sample page can play the old and the new side by side.
const midiHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
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
  Pokey: { base: 55, hop: PENT, type: 'triangle', dec: 0.075, peak: 0.16, lp: 1700, glide: 0.97 },
  Meeca: { base: 67, hop: PENT, type: 'sine', dec: 0.085, peak: 0.16, lp: 4000, glide: 1.02 },
  Dot: { base: 79, hop: PENT, type: 'sine', dec: 0.05, peak: 0.12, lp: 5000, glide: 1.04 },
  Grandma: { base: 57, hop: [0, 2, 4, 7, 9, 12], type: 'triangle', dec: 0.1, peak: 0.12, lp: 1500, glide: 0.99 },
  'Lieutenant Pell': { base: 45, hop: PENT, type: 'square', dec: 0.08, peak: 0.07, lp: 800, glide: 0.96 },
  'General Iron-Claw': { base: 38, hop: MINOR, type: 'sawtooth', dec: 0.09, peak: 0.13, lp: 700, glide: 0.95 },
  // Meeca's grandfather before the iron: the General's voice, softened
  Grandfather: { base: 41, hop: PENT, type: 'triangle', dec: 0.1, peak: 0.13, lp: 900, glide: 0.97 },
  Thornbark: { base: 40, hop: [0, 3, 7, 10], type: 'sawtooth', dec: 0.11, peak: 0.1, lp: 600, breath: 0.5, glide: 0.96 },
  'Venom Fang': { base: 62, hop: MINOR, type: 'sawtooth', dec: 0.06, peak: 0.07, lp: 1500, breath: 0.9, glide: 0.98 },
  'Crocus Rex': { base: 41, hop: PENT, type: 'square', dec: 0.1, peak: 0.1, lp: 600, glide: 0.96 },
  'Shadow Prowler': { base: 50, hop: MINOR, type: 'triangle', dec: 0.08, peak: 0.08, lp: 1000, breath: 1.2, glide: 0.97 },
  'Sky Sovereign': { base: 66, hop: PENT, type: 'sawtooth', dec: 0.07, peak: 0.08, lp: 2600, glide: 1.03 },
  'Tarantula Queen': { base: 58, hop: MINOR, type: 'square', dec: 0.06, peak: 0.07, lp: 1800, breath: 0.4, glide: 0.99 },
  'Marsh Reaver': { base: 44, hop: MINOR, type: 'sawtooth', dec: 0.09, peak: 0.1, lp: 900, breath: 0.6, glide: 0.95 },
  'Stone Idol Golem': { base: 36, hop: [0, 7, 12], type: 'triangle', dec: 0.12, peak: 0.22, lp: 450, glide: 0.98 },
  'Night-Wing Monarch': { base: 60, hop: MINOR, type: 'triangle', dec: 0.09, peak: 0.1, lp: 1500, breath: 0.5, glide: 0.98 },
  'Magma Drake': { base: 36, hop: MINOR, type: 'sawtooth', dec: 0.1, peak: 0.12, lp: 650, glide: 0.95 },
  // Flicker, the firefly: small, high, short and dry
  Flicker: { base: 74, hop: [0, 2, 7], type: 'sine', dec: 0.035, peak: 0.08, lp: 4200, glide: 1.0 },
  Squirrel: { base: 76, hop: PENT, type: 'square', dec: 0.04, peak: 0.07, lp: 3200, glide: 1.05 },
};
const FALLBACK: Voice = { base: 48, hop: PENT, type: 'triangle', dec: 0.08, peak: 0.12, lp: 1400, glide: 0.98 };


export function oldBlip(c: AudioContext, dst: AudioNode, speaker: string, ch: string, index: number) {
  if (!/[A-Za-z0-9]/.test(ch)) return;
  if (index % 2 === 1) return;
  const v = VOICES[speaker] ?? FALLBACK;
  const t = c.currentTime + 0.005;
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
  g.connect(dst);
  os.start(t);
  os.stop(t + v.dec + 0.03);
}
