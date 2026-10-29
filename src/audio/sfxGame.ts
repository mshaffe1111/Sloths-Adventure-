/**
 * The effects the review found missing or borrowed (polish report SN-3), made for this game and its music:
 *
 *   splash      falling into water: three versions, from a full plunge to a small dip (it used to be a whoosh and a punch)
 *   respawn     Pokey coming back after a lost life: a soft pop and two notes rising in the music's key (it used to be silent)
 *   bossAppear  a boss arriving: its roar, and a low in-key sting under it (cues.ts), also for the boss intro card (SN-10)
 *   landing     every landing, scaled by how fast he fell: a small hop lands softly, a long drop lands with weight (small hops were silent)
 *   puzzle      one sound for each kind of puzzle action, twelve of them (PUZZLE_SOUNDS), instead of the whoosh for six different things, the
 *               checkpoint sound for a reset and the player-hurt sound for a vine wrapping a log
 *
 * Built like the rest (sfx.ts): a body, a transient, some air, and the music's key where a note is played. Their notes are the classic
 * set's family (kalimba, marimba, soft bells, wood: Matt, 2026-10-29, the orchestral effects are out), softened so nothing pings. The
 * recorded Kenney layers (CC0, already shipped) are used where one fits, and every sound has a synthesized version that plays until they
 * have loaded.
 */
import type { AudioCore } from './core.ts';
import { NOTE_VOICES } from './instruments.ts';
import type { KeyInfo } from './music.ts';
import { midiHz } from './theory.ts';
import { degreeMidi, playCue } from './cues.ts';
import { soften } from './sfxOrch.ts';
import { runFx } from './sfx.ts';

type Fx = (core: AudioCore, key: KeyInfo, a?: number) => void;
const FLOOR = 0.0001;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

function bus(core: AudioCore, level: number, rev = 0): GainNode {
  const g = core.withReverb(core.sfx, rev);
  g.gain.value = level;
  return g;
}

function tone(core: AudioCore, dst: AudioNode, t: number, o: { f0: number; f1?: number; sweep?: number; peak: number; dec: number; attack?: number; type?: OscillatorType }) {
  const c = core.ctx;
  const a = o.attack ?? 0.004;
  const os = c.createOscillator();
  os.type = o.type ?? 'sine';
  os.frequency.setValueAtTime(Math.max(20, o.f0), t);
  if (o.f1 !== undefined) os.frequency.exponentialRampToValueAtTime(Math.max(20, o.f1), t + (o.sweep ?? o.dec));
  const g = c.createGain();
  g.gain.setValueAtTime(FLOOR, t);
  g.gain.linearRampToValueAtTime(o.peak, t + a);
  g.gain.exponentialRampToValueAtTime(FLOOR, t + a + o.dec);
  os.connect(g);
  g.connect(dst);
  os.start(t);
  os.stop(t + a + o.dec + 0.03);
}

function hiss(core: AudioCore, dst: AudioNode, t: number, o: { type: BiquadFilterType; f0: number; f1?: number; q?: number; peak: number; dec: number; attack?: number; pink?: boolean }) {
  const c = core.ctx;
  const a = o.attack ?? 0.003;
  const end = t + a + o.dec;
  const src = core.noiseSource(t, o.dec + a + 0.05, o.pink);
  const f = c.createBiquadFilter();
  f.type = o.type;
  f.frequency.setValueAtTime(o.f0, t);
  if (o.f1 !== undefined) f.frequency.exponentialRampToValueAtTime(Math.max(30, o.f1), end);
  f.Q.value = o.q ?? 0.8;
  const g = c.createGain();
  g.gain.setValueAtTime(FLOOR, t);
  g.gain.linearRampToValueAtTime(o.peak, t + a);
  g.gain.exponentialRampToValueAtTime(FLOOR, end);
  src.connect(f);
  f.connect(g);
  g.connect(dst);
}

/** a bubble: a short sine whose pitch rises as it closes, the sound water really makes */
function bubble(core: AudioCore, dst: AudioNode, t: number, hz: number, peak: number) {
  tone(core, dst, t, { f0: hz, f1: hz * rnd(1.4, 1.9), sweep: 0.05, peak, dec: rnd(0.04, 0.08), attack: 0.002 });
}

/** one of the recorded layers (false when it has not loaded: the synthesized layers carry the sound alone) */
function sample(core: AudioCore, dst: AudioNode, t: number, group: string, o: { gain?: number; rate?: number; lp?: number; hp?: number } = {}): boolean {
  const list = core.samples.get(group);
  if (!list?.length) return false;
  const c = core.ctx;
  const src = c.createBufferSource();
  src.buffer = list[Math.floor(Math.random() * list.length)];
  src.playbackRate.value = (o.rate ?? 1) * rnd(0.96, 1.04);
  let node: AudioNode = src;
  for (const [type, hz] of [['highpass', o.hp], ['lowpass', o.lp]] as const) {
    if (!hz) continue;
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.value = hz;
    node.connect(f);
    node = f;
  }
  const g = c.createGain();
  g.gain.value = o.gain ?? 1;
  node.connect(g);
  g.connect(dst);
  src.start(t);
  return true;
}

/** a note of the music's key on one of the game's own mallets (kalimba, marimba, soft bell: the classic family Matt plays with) */
function keyNote(core: AudioCore, dst: AudioNode, t: number, key: KeyInfo, voice: string, deg: number, near: number, len: number, vel: number) {
  NOTE_VOICES[voice]?.(core, soften(core, dst, 4200), t, midiHz(degreeMidi(key, deg, near)), len, vel);
}

/** the puzzle actions, in the order of the `puzzle` effect's argument (see PUZZLE_KIND for which engine event plays which) */
export const PUZZLE_SOUNDS = ['pick', 'drop', 'wrap', 'reset', 'press', 'lift', 'gate', 'lever', 'throw', 'chime', 'shift', 'solved'] as const;
export type PuzzleSound = (typeof PUZZLE_SOUNDS)[number];

/** the puzzle kits' event names (engine.ts sfx hooks) -> their sound */
export const PUZZLE_KIND: Record<string, PuzzleSound> = {
  pick: 'pick', trade: 'pick', munch: 'pick', sip: 'pick', cake: 'pick',
  drop: 'drop', land: 'drop', tray: 'drop', rock: 'drop',
  wrap: 'wrap', knot: 'wrap', unroll: 'wrap',
  reset: 'reset', lost: 'reset',
  press: 'press', noise: 'press', wiggle: 'press',
  lift: 'lift', bend: 'lift', frond: 'lift',
  gate: 'gate', bloom: 'gate',
  lever: 'lever', snap: 'lever', crack: 'lever',
  throw: 'throw', pop: 'throw',
  ring: 'chime', chime: 'chime', hum: 'chime',
  tilt: 'shift', sink: 'shift', stick: 'shift', tip: 'shift', pour: 'shift',
  free: 'solved', solved: 'solved',
};

/**
 * Each puzzle sound's level, measured (the loudest 400 ms of each, rendered: tools/audio/render.mjs) so that all twelve sit together: the
 * notes on the harp and glockenspiel came out 5-8 dB over the knocks and creaks.
 */
const PUZZLE_TRIM_DB: Partial<Record<PuzzleSound, number>> = { pick: -5, reset: -6.5, chime: -4.5, solved: -5 };

export const GAME_SFX: Record<string, Fx> = {
  /** into the water. a: 0 a full plunge (a fall), 1 a body-sized splash, 2 a small dip */
  splash(core, _key, a = 0) {
    const t = core.ctx.currentTime;
    const v = Math.max(0, Math.min(2, Math.round(a)));
    const size = [1, 0.7, 0.42][v];
    const d = bus(core, 0.72, 0.2);
    // the hit of the surface: a low thump and a dull slap
    tone(core, d, t, { f0: 120 * rnd(0.9, 1.1), f1: 48, dec: 0.12 + 0.12 * size, peak: 0.45 * size });
    hiss(core, d, t, { type: 'bandpass', f0: 900 * rnd(0.85, 1.15), f1: 260, q: 0.9, peak: 0.5 * size, dec: 0.18 + 0.25 * size, pink: true });
    // the spray thrown up and falling back
    hiss(core, d, t + 0.01, { type: 'highpass', f0: 2600, f1: 1400, peak: 0.22 * size, dec: 0.25 + 0.45 * size, attack: 0.02 });
    hiss(core, d, t + 0.12 * size, { type: 'bandpass', f0: 3500, q: 0.7, peak: 0.1 * size, dec: 0.35 * size + 0.1, attack: 0.08 });
    // the bubbles as it closes over
    const n = [9, 6, 4][v];
    for (let i = 0; i < n; i++) bubble(core, d, t + 0.05 + Math.random() * (0.25 + 0.4 * size), rnd(380, 1300) / Math.sqrt(size), 0.08 + 0.06 * Math.random());
    sample(core, d, t, 'cloth', { gain: 0.3 * size, rate: 0.7, lp: 2500 });
  },

  /** Pokey back after a lost life: air drawn in, a soft pop, the home note and its fifth above */
  respawn(core, key) {
    const t = core.ctx.currentTime;
    const d = bus(core, 0.55, 0.35);
    hiss(core, d, t, { type: 'bandpass', f0: 500, f1: 2600, q: 1.2, peak: 0.14, dec: 0.05, attack: 0.22 });
    tone(core, d, t + 0.24, { f0: 260, f1: 620, sweep: 0.04, peak: 0.3, dec: 0.07, attack: 0.002 });
    hiss(core, d, t + 0.24, { type: 'highpass', f0: 3000, peak: 0.08, dec: 0.04 });
    keyNote(core, d, t + 0.26, key, 'kalimba', 0, 67, 0.8, 0.7);
    keyNote(core, d, t + 0.36, key, 'kalimba', 4, 67, 0.9, 0.65);
    keyNote(core, d, t + 0.36, key, 'bell', 7, 79, 0.9, 0.3);
  },

  /** a boss arrives: its roar (a = its world), with a low sting in the music's key under it (cues.ts) */
  bossAppear(core, key, a = 0) {
    const t = core.ctx.currentTime;
    // the roar first, over the timpani roll, and the brass and gong land after it
    runFx('roar', core, key, Math.round(a));
    playCue(core, 'bossAppear', key, t + 0.15, 0.5);
  },

  /** a landing. a: 0..1, how fast he was falling (a small hop is ~0.1, a long drop 1): every landing has a sound, small ones soft */
  landing(core, key, a = 0.3) {
    const t = core.ctx.currentTime;
    const s = Math.max(0.05, Math.min(1, a));
    const d = bus(core, 0.75, 0.04);
    // feet into leaf litter: always
    if (!sample(core, d, t, 'stepGrass', { gain: 0.25 + 0.75 * s, rate: 1.15 - 0.3 * s, lp: 2500 + 4000 * s })) {
      hiss(core, d, t, { type: 'bandpass', f0: 1400 + 600 * s, q: 0.8, peak: 0.04 + 0.08 * s, dec: 0.05 + 0.05 * s, pink: true });
    }
    // the body's weight: grows with the fall
    tone(core, d, t, { f0: 105 * rnd(0.95, 1.05), f1: 52, dec: 0.06 + 0.12 * s, peak: 0.05 + 0.4 * s * s });
    hiss(core, d, t, { type: 'lowpass', f0: 1500, f1: 350, peak: 0.03 + 0.12 * s, dec: 0.06 + 0.1 * s, pink: true });
    if (s > 0.55) sample(core, d, t, 'softH', { gain: 0.6 * (s - 0.4), rate: 1.25 });
    // a long drop answers in the key: the low home note on the cellos, short and soft
    if (s > 0.75) keyNote(core, d, t, key, 'marimba', 0, 40, 0.35, 0.3 * s);
  },

  /** one puzzle action (a: its place in PUZZLE_SOUNDS) */
  puzzle(core, key, a = 0) {
    const t = core.ctx.currentTime;
    const kind = PUZZLE_SOUNDS[Math.max(0, Math.min(PUZZLE_SOUNDS.length - 1, Math.round(a)))];
    // (puzzle actions are frequent and the music under them is the quiet puzzle bed: they sit low, under the music's level)
    const d = bus(core, 0.55 * Math.pow(10, (PUZZLE_TRIM_DB[kind] ?? 0) / 20), 0.15);
    switch (kind) {
      case 'pick': // picked up: a soft grab and a little lift
        sample(core, d, t, 'cloth', { gain: 0.5, rate: 1.2 });
        keyNote(core, d, t + 0.03, key, 'kalimba', 4, 72, 0.4, 0.45);
        keyNote(core, d, t + 0.09, key, 'kalimba', 7, 72, 0.5, 0.4);
        break;
      case 'drop': // set down: a wooden knock
        sample(core, d, t, 'woodL', { gain: 0.8, rate: 0.9 });
        hiss(core, d, t, { type: 'bandpass', f0: 650, q: 2, peak: 0.5, dec: 0.08 });
        tone(core, d, t, { f0: 180, f1: 85, dec: 0.13, peak: 0.6 });
        break;
      case 'wrap': // a vine wrapping round: a creak of fibre pulled tight and a rustle
        sample(core, d, t, 'leather', { gain: 0.55, rate: 0.85 });
        sample(core, d, t + 0.1, 'creak', { gain: 0.35, rate: 1.1 });
        hiss(core, d, t, { type: 'bandpass', f0: 1100, f1: 2400, q: 1.5, peak: 0.08, dec: 0.3, attack: 0.08, pink: true });
        break;
      case 'reset': // back to the start: a reversed breath and three notes falling home
        hiss(core, d, t, { type: 'bandpass', f0: 2600, f1: 600, q: 1, peak: 0.1, dec: 0.05, attack: 0.25 });
        [4, 2, 0].forEach((deg, i) => keyNote(core, d, t + 0.18 + i * 0.09, key, 'kalimba', deg, 67, 0.5, 0.32));
        break;
      case 'press': // a plate or button: a click and a low thunk underneath
        sample(core, d, t, 'plank', { gain: 0.8, rate: 1.3, hp: 300 });
        tone(core, d, t + 0.01, { f0: 150, f1: 90, dec: 0.12, peak: 0.6 });
        hiss(core, d, t, { type: 'bandpass', f0: 2600, q: 3, peak: 0.35, dec: 0.025 });
        break;
      case 'lift': // something rising: a wooden creak and air rising with it
        sample(core, d, t, 'creak', { gain: 0.45, rate: 1.0 });
        hiss(core, d, t, { type: 'bandpass', f0: 500, f1: 1600, q: 1.2, peak: 0.09, dec: 0.35, attack: 0.12, pink: true });
        break;
      case 'gate': // a gate or a door of stone opening: a grinding rumble and the low home note
        hiss(core, d, t, { type: 'lowpass', f0: 380, f1: 180, peak: 0.3, dec: 0.7, attack: 0.08, pink: true });
        for (let i = 0; i < 6; i++) hiss(core, d, t + 0.05 + i * 0.1 + Math.random() * 0.04, { type: 'bandpass', f0: rnd(500, 900), q: 4, peak: 0.08, dec: 0.04 });
        keyNote(core, d, t + 0.1, key, 'marimba', 0, 43, 0.8, 0.4);
        break;
      case 'lever': // a lever thrown: a metal clack
        sample(core, d, t, 'metalM', { gain: 0.8, rate: 1.1 });
        hiss(core, d, t, { type: 'bandpass', f0: 1800, q: 5, peak: 0.45, dec: 0.07 });
        hiss(core, d, t + 0.09, { type: 'bandpass', f0: 2400, q: 4, peak: 0.25, dec: 0.04 });
        tone(core, d, t, { f0: 240, f1: 140, dec: 0.1, peak: 0.45 });
        break;
      case 'throw': // a light throw: a short, bright swish (not the attack whoosh)
        sample(core, d, t, 'swishK', { gain: 0.45, rate: 1.25, hp: 600 }) || hiss(core, d, t, { type: 'bandpass', f0: 900, f1: 3200, q: 1.4, peak: 0.12, dec: 0.12, attack: 0.03 });
        break;
      case 'chime': // a bell or ring answered: two notes of the key on the glockenspiel
        keyNote(core, d, t, key, 'bell', 4, 79, 0.8, 0.4);
        keyNote(core, d, t + 0.08, key, 'bell', 7, 79, 1, 0.38);
        break;
      case 'shift': // something tilts, sinks or settles: a soft wooden creak and a low settle
        sample(core, d, t, 'creak', { gain: 0.3, rate: 0.8 });
        tone(core, d, t + 0.05, { f0: 95, f1: 60, dec: 0.18, peak: 0.18 });
        hiss(core, d, t, { type: 'lowpass', f0: 900, f1: 300, peak: 0.06, dec: 0.2, pink: true });
        break;
      case 'solved': // the puzzle's goal reached: a harp run up the chord and the glockenspiel at the top
        [0, 2, 4, 7, 9].forEach((deg, i) => keyNote(core, d, t + i * 0.06, key, 'kalimba', deg, 62, 0.7, 0.38));
        keyNote(core, d, t + 0.3, key, 'bell', 9, 79, 1.2, 0.28);
        break;
    }
  },
};

/** play one of these effects (the Conductor's fx() finds them here) */
export function playGameFx(name: string, core: AudioCore, key: KeyInfo, arg?: number): boolean {
  const fn = GAME_SFX[name];
  if (!fn) return false;
  fn(core, key, arg);
  return true;
}
