/**
 * The orchestral sound-effect set (opt-in, off until switched on: `?sfx=orch`, or the menu; `localStorage.sloth_sfx = 'orch'` keeps it).
 *
 * The effects were built from bells, a steel pan, a kalimba, glass "tinks" and a sparkle of high noise, which is a different family
 * from the music (strings, woodwinds, horns, harp, timpani). So the bright little ping on every pickup and hit came from instruments the
 * music never plays. With this set on:
 *
 *   - every bell, kalimba, steel pan and marimba note in the effects is played by an instrument of the music's own orchestra instead
 *     (the same recordings), a different one on each of an effect's four versions, so a run of flowers is no longer one ping repeated;
 *   - the glass and bell recordings and the very high hiss are left out;
 *   - each animal's defeat ends in its own little falling figure on its own instrument, in the key of the music that is playing;
 *   - a few everyday sounds (the jump, the landing) get a soft, key-locked pluck underneath.
 *
 * Nothing here changes the game, only what it sounds like. The old recipes stay as they were and the switch brings them back.
 */
import { clarinet, bassoon, celloStac, contraPizz, flute, harp, horn, hornStac, oboe, timpani, trombone, tuba, violinStac } from './instruments.ts';
import type { AudioCore } from './core.ts';
import type { NoteVoice, DrumVoice } from './instruments.ts';
import type { KeyInfo } from './music.ts';
import { midiHz } from './theory.ts';

const softened = new WeakMap<AudioNode, AudioNode>();
/**
 * A gentle low-pass in front of `dst` for the orchestral notes of an effect. The plucked strings and the harp are recorded bright (they are
 * brightest when played hard, which is how an effect plays them), and that brightness is the ping; this takes the edge off without dulling
 * the body of the note. One filter per effect, however many notes it plays.
 */
export function soften(core: AudioCore, dst: AudioNode, hz = 2800): AudioNode {
  let f = softened.get(dst);
  if (!f) {
    const lp = core.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = hz;
    lp.Q.value = 0.55;
    lp.connect(dst);
    softened.set(dst, lp);
    f = lp;
  }
  return f;
}

export const DEFAULT_ORCH_SFX = false;

let enabled: boolean | null = null;
export function orchSfxEnabled(): boolean {
  if (enabled !== null) return enabled;
  let v = DEFAULT_ORCH_SFX;
  try {
    const q = new URLSearchParams(location.search).get('sfx');
    if (q === 'orch' || q === '1') v = true;
    else if (q === 'classic' || q === '0') v = false;
    else if (localStorage.getItem('sloth_sfx') === 'orch') v = true;
    else if (localStorage.getItem('sloth_sfx') === 'classic') v = false;
  } catch {
    /* no window or storage: stay off */
  }
  enabled = v;
  return v;
}
/** the menu switch: applies at once and is remembered on the device */
export function setOrchSfxPref(on: boolean) {
  enabled = on;
  try {
    localStorage.setItem('sloth_sfx', on ? 'orch' : 'classic');
  } catch {
    /* storage blocked: it just will not be remembered */
  }
}

/** the recorded instruments this set draws on (orchLoader names): fetched when the set is switched on */
export const ORCH_SFX_GROUPS = ['violinStac', 'celloStac', 'hornStac', 'contraPizz', 'harp', 'flute', 'oboe', 'clarinet', 'bassoon', 'horn', 'trombone', 'tuba', 'timp'];

/** effects whose "keep the old one" recipe is built on bells and marimba: with this set on they take the new recipe, whose notes are swapped */
export const CLASSIC_WITH_BELLS = new Set(['checkpoint', 'uiConfirm', 'uiBack', 'flower', 'power', 'defeat', 'tayraCall']);

export type MalletKind = 'bell' | 'kalimba' | 'steelpan' | 'marimba';

interface Swap {
  voice: NoteVoice;
  /** semitones to move the note, before it is folded into the voice's comfortable range */
  shift: number;
  /** how loud, against the mallet it replaces */
  gain: number;
}

/**
 * Which orchestral voice stands in for a mallet, on each of the effect's four versions. Every list mixes a plucked voice (a short, soft
 * note), a woodwind and a string, so the four versions differ in colour and not only in pitch.
 */
const SWAPS: Record<MalletKind, Swap[]> = {
  // the sparkle on top of a pickup: a harp pluck, a pizzicato violin, a flute, a harp again an octave down
  bell: [
    { voice: harp, shift: 0, gain: 0.8 },
    { voice: violinStac, shift: 0, gain: 0.85 },
    { voice: flute, shift: 0, gain: 0.6 },
    { voice: harp, shift: -12, gain: 0.85 },
  ],
  // a thumb-piano pluck: plucked strings and a clarinet
  kalimba: [
    { voice: violinStac, shift: 0, gain: 0.85 },
    { voice: celloStac, shift: 0, gain: 0.9 },
    { voice: clarinet, shift: 0, gain: 0.6 },
    { voice: hornStac, shift: 0, gain: 0.85 },
  ],
  // the round "bloop": woodwinds and a soft horn
  steelpan: [
    { voice: clarinet, shift: 0, gain: 0.65 },
    { voice: hornStac, shift: 0, gain: 0.85 },
    { voice: oboe, shift: -12, gain: 0.55 },
    { voice: bassoon, shift: 12, gain: 0.7 },
  ],
  // the warm wooden note: cello and horn staccato, a pizzicato violin an octave down, a harp
  marimba: [
    { voice: celloStac, shift: 0, gain: 0.9 },
    { voice: hornStac, shift: 0, gain: 0.85 },
    { voice: violinStac, shift: -12, gain: 0.85 },
    { voice: harp, shift: 0, gain: 0.8 },
  ],
};

/** the comfortable range of a note in an effect: nothing above G5, so nothing reaches the thin top of the spectrum where the ping lives */
const HIGH = 79;
const LOW = 48;
export function fold(midi: number): number {
  let m = midi;
  while (m > HIGH) m -= 12;
  while (m < LOW) m += 12;
  return m;
}

/** the voice, pitch and loudness that play a mallet note in the orchestral set (variant 0..3: which version of the effect is playing) */
export function swapMallet(kind: MalletKind, variant: number, midi: number): { voice: NoteVoice; midi: number; gain: number } {
  const list = SWAPS[kind];
  const s = list[((Math.floor(variant) % list.length) + list.length) % list.length];
  return { voice: s.voice, midi: fold(midi + s.shift), gain: s.gain };
}

/** recordings and noise that read as a ping: left out of the orchestral set */
const PINGY_SAMPLES = new Set(['uiGlass', 'glassL', 'bellH', 'tinM', 'metalH', 'metalM', 'coins']);
export const isPingySample = (group: string) => PINGY_SAMPLES.has(group);
/** a sparkle of noise or a tone this high is air and glitter, not body: left out */
export const PING_FLOOR_HZ = 4800;

// ---------------------------------------------------------------------------------------------
// The animals
// ---------------------------------------------------------------------------------------------

/** a scale degree (0 = the tonic, 7 = the octave above it, negative = below) of the music's key, at or above MIDI note `low` */
export function degree(key: KeyInfo, d: number, low: number): number {
  const base = low + (((key.tonic - low) % 12) + 12) % 12;
  const i = ((d % 7) + 7) % 7;
  return base + key.scale[i] + 12 * Math.floor(d / 7);
}

interface Figure {
  voice: NoteVoice;
  /** lowest note of the instrument's friendly range, as a MIDI number */
  low: number;
  /** scale degrees, then the gap between notes in seconds, the length of each note and how hard */
  steps: number[];
  gap: number;
  len: number;
  vel: number;
  /** a drum or gong under the first note */
  under?: { voice: DrumVoice; vel: number };
}

/**
 * What each animal's defeat ends on, indexed like ENEMY_ORDER in combat.ts (snake, eagle, ocelot, jaguar, boa, caiman, tayra, frog, spider,
 * ant, boss). Every figure ends lower than it starts (the animal is beaten); the instrument and the speed are the animal's.
 */
export const ANIMAL_FIGURES: Figure[] = [
  /* snake */ { voice: clarinet, low: 55, steps: [4, 2, 0], gap: 0.075, len: 0.16, vel: 0.55 },
  /* eagle */ { voice: oboe, low: 69, steps: [4, 2], gap: 0.16, len: 0.26, vel: 0.5 },
  /* ocelot */ { voice: bassoon, low: 50, steps: [4, 2, 0], gap: 0.07, len: 0.12, vel: 0.65 },
  /* jaguar */ { voice: trombone, low: 43, steps: [3, 0], gap: 0.2, len: 0.34, vel: 0.6, under: { voice: timpani, vel: 0.5 } },
  /* boa */ { voice: tuba, low: 38, steps: [2, 0], gap: 0.3, len: 0.5, vel: 0.65 },
  /* caiman */ { voice: tuba, low: 41, steps: [3, 0], gap: 0.24, len: 0.42, vel: 0.6, under: { voice: timpani, vel: 0.4 } },
  /* tayra */ { voice: clarinet, low: 62, steps: [4, 5, 4, 2], gap: 0.06, len: 0.1, vel: 0.5 },
  /* frog */ { voice: bassoon, low: 46, steps: [3, 0], gap: 0.09, len: 0.12, vel: 0.65 },
  /* spider */ { voice: violinStac, low: 55, steps: [5, 4, 2, 0], gap: 0.05, len: 0.08, vel: 0.7 },
  /* ant */ { voice: celloStac, low: 52, steps: [2, 0], gap: 0.06, len: 0.08, vel: 0.6 },
  /* boss */ { voice: horn, low: 41, steps: [4, 2, 0], gap: 0.22, len: 0.4, vel: 0.65, under: { voice: timpani, vel: 0.6 } },
];
/** an animal we have not met: the plucked violin figure */
const FALLBACK: Figure = { voice: violinStac, low: 60, steps: [4, 2, 0], gap: 0.07, len: 0.1, vel: 0.65 };

export function figureFor(animal: number): Figure {
  const i = Math.round(animal);
  return i >= 0 && i < ANIMAL_FIGURES.length ? ANIMAL_FIGURES[i] : FALLBACK;
}

/** play an animal's defeat figure into `dst` starting at `t`; returns when it ends */
export function playFigure(core: Parameters<NoteVoice>[0], dst: AudioNode, t: number, key: KeyInfo, animal: number, level = 1): number {
  const f = figureFor(animal);
  const to = soften(core, dst);
  let at = t;
  f.steps.forEach((d, i) => {
    const m = fold(degree(key, d, f.low));
    f.voice(core, to, at, midiHz(m), f.len, f.vel * level * (1 - i * 0.06));
    at += f.gap;
  });
  if (f.under) f.under.voice(core, to, t, f.under.vel * level);
  return at + f.len;
}

/** a soft, key-locked pluck for an everyday sound: a hop's push-off (a pizzicato on the tonic or fifth) */
export function hopNote(core: Parameters<NoteVoice>[0], dst: AudioNode, t: number, key: KeyInfo, variant: number, vel = 0.5) {
  const steps = [0, 2, 4, 2];
  const voices: NoteVoice[] = [celloStac, violinStac, hornStac, violinStac];
  const v = ((Math.floor(variant) % 4) + 4) % 4;
  voices[v](core, soften(core, dst), t, midiHz(fold(degree(key, steps[v], v === 1 || v === 3 ? 57 : 48))), 0.1, vel);
}

/** the weight of a hard landing: a low pizzicato double-bass on the tonic */
export function landNote(core: Parameters<NoteVoice>[0], dst: AudioNode, t: number, key: KeyInfo, strength: number) {
  contraPizz(core, dst, t, midiHz(degree(key, 0, 33)), 0.2, Math.min(1, 0.4 + strength * 0.5));
}
