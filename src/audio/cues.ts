/**
 * Stingers in key: the short phrases the orchestra plays over the stage music at the moments that matter (a checkpoint, a first discovery,
 * a secret, a last heart, a boss appearing). Unlike the written stings (stingers.ts, which are in a key of their own) these are built on the
 * music's key and chord as it is playing and placed on its beat (Conductor.cue), so they sound like the band answering, not a sound effect
 * dropped on top. The checkpoint one is SN-3's "real checkpoint stinger": about a second, bright, in key.
 *
 * Each returns how long it rings, so the music can dip a little under it.
 */
import type { AudioCore } from './core.ts';
import { CHORD_VOICES, DRUM_VOICES, NOTE_VOICES } from './instruments.ts';
import type { KeyInfo } from './music.ts';
import { midiHz } from './theory.ts';

export type CueName = 'checkpoint' | 'discovery' | 'secret' | 'lowHealth' | 'bossAppear';
export const CUE_NAMES: CueName[] = ['checkpoint', 'discovery', 'secret', 'lowHealth', 'bossAppear'];

/** where the music dips to while a cue sounds (a share of its level) */
export const CUE_DUCK: Record<CueName, number> = { checkpoint: 0.7, discovery: 0.55, secret: 0.6, lowHealth: 0.75, bossAppear: 0.3 };

/**
 * A cue never fetches recordings of its own: on a phone every instrument decoded is memory (all the cues' instruments together are about
 * 28 MB), so each voice a cue asks for is played by the first of its stand-ins that the music playing has already loaded (the glockenspiel,
 * timpani, cymbal and bass drum always are; see orchLoader.groupsFor).
 */
const STAND_INS: Record<string, Array<[voice: string, group: string]>> = {
  harp: [['harp', 'harp'], ['figR', 'violinStac'], ['figR', 'celloStac'], ['glockR', 'glock']],
  glockR: [['glockR', 'glock']],
  flute: [['flute', 'flute'], ['oboe', 'oboe'], ['clarinet', 'clarinet'], ['violins', 'violins'], ['horn', 'horn'], ['glockR', 'glock']],
  violins: [['violins', 'violins'], ['violas', 'violas'], ['flute', 'flute'], ['clarinet', 'clarinet'], ['oboe', 'oboe']],
  cello: [['cello', 'cello'], ['bassR', 'contra'], ['bassoon', 'bassoon']],
  horn: [['horn', 'horn'], ['trombone', 'trombone'], ['cello', 'cello'], ['bassoon', 'bassoon']],
  triangle: [['triangle', 'triangle']],
  gong: [['gong', 'gong'], ['crash', 'cymbal']],
  timpani: [['timpani', 'timp']],
};

/** the voice that plays a cue's part with what is loaded (null: nothing loaded can, and the part is left out) */
export function standIn(voice: string, loaded: (group: string) => boolean): string | null {
  const list = STAND_INS[voice];
  if (!list) return voice;
  for (const [v, g] of list) if (loaded(g)) return v;
  // nothing loaded at all (a test, or the first moment of the game): the voice's own synthesized stand-in plays
  return loaded('glock') ? null : voice;
}

/**
 * A scale degree of the key as MIDI: degree 0 is the tonic, 7 the octave above; `near` puts the tonic in the octave at or just below it.
 */
export function degreeMidi(key: KeyInfo, d: number, near: number): number {
  const sc = key.scale;
  const pc = ((key.tonic % 12) + 12) % 12;
  const base = near - ((near - pc) % 12 + 12) % 12;
  const o = Math.floor(d / sc.length);
  const k = ((d % sc.length) + sc.length) % sc.length;
  return base + sc[k] + 12 * o;
}

/** the notes of every cue as (seconds after the start, voice, MIDI, length, velocity): pure, so a test can check they are in key */
export interface CueNote {
  at: number;
  voice: string;
  midi: number;
  len: number;
  vel: number;
}
export interface CuePlan {
  notes: CueNote[];
  chords: Array<{ at: number; voice: string; midi: number[]; len: number; vel: number }>;
  hits: Array<{ at: number; voice: string; vel: number }>;
  length: number;
}

export function cuePlan(name: CueName, key: KeyInfo, beat: number): CuePlan {
  const b = Math.max(0.3, Math.min(0.75, beat));
  const s = b / 4; // a sixteenth
  const d = (deg: number, near: number) => degreeMidi(key, deg, near);
  const notes: CueNote[] = [];
  const chords: CuePlan['chords'] = [];
  const hits: CuePlan['hits'] = [];
  switch (name) {
    case 'checkpoint': {
      // a bright rising arpeggio on the harp, the glockenspiel catching its top, a short swell of strings on the home chord: about a second
      [0, 2, 4, 7].forEach((deg, i) => notes.push({ at: i * s, voice: 'harp', midi: d(deg, 67), len: 0.6, vel: 0.75 + 0.05 * i }));
      notes.push({ at: 3 * s, voice: 'glockR', midi: d(7, 79), len: 0.8, vel: 0.5 });
      notes.push({ at: 4 * s, voice: 'glockR', midi: d(9, 79), len: 0.8, vel: 0.42 });
      chords.push({ at: 0, voice: 'orchStrings', midi: [d(0, 55), d(4, 60), d(7, 67), d(9, 72)], len: 0.85, vel: 0.5 });
      hits.push({ at: 0, voice: 'triangle', vel: 0.35 });
      return { notes, chords, hits, length: 1.1 };
    }
    case 'discovery': {
      // the flute climbs to the octave over a harp sweep, a held home chord under it: "look at that"
      [4, 5, 6].forEach((deg, i) => notes.push({ at: i * 2 * s, voice: 'flute', midi: d(deg, 72), len: 2 * s * 0.95, vel: 0.7 }));
      notes.push({ at: 6 * s, voice: 'flute', midi: d(7, 72), len: 0.8, vel: 0.8 });
      [0, 2, 4, 7, 9, 11].forEach((deg, i) => notes.push({ at: i * 0.045, voice: 'harp', midi: d(deg, 60), len: 1, vel: 0.55 }));
      notes.push({ at: 6 * s, voice: 'glockR', midi: d(7, 84), len: 1, vel: 0.4 });
      chords.push({ at: 0, voice: 'orchStrings', midi: [d(0, 50), d(2, 57), d(4, 64), d(7, 69)], len: 6 * s + 0.8, vel: 0.45 });
      return { notes, chords, hits, length: 6 * s + 1.1 };
    }
    case 'secret': {
      // a sparkle up the chord on the glockenspiel and harp in turn, then the high home note left to shimmer
      const run = [0, 2, 4, 7, 9, 11, 14];
      run.forEach((deg, i) => notes.push({ at: i * s, voice: i % 2 ? 'harp' : 'glockR', midi: d(deg, 72), len: 0.5, vel: 0.55 + 0.04 * i }));
      notes.push({ at: run.length * s, voice: 'glockR', midi: d(14, 84), len: 1.4, vel: 0.6 });
      notes.push({ at: run.length * s, voice: 'violins', midi: d(7, 72), len: 0.9, vel: 0.35 });
      hits.push({ at: run.length * s, voice: 'triangle', vel: 0.5 });
      return { notes, chords, hits, length: run.length * s + 1.5 };
    }
    case 'lowHealth': {
      // the cellos low, the note under the home note and back, twice, like a held breath; a soft timpani under each
      for (let i = 0; i < 2; i++) {
        const t0 = i * 2 * b;
        notes.push({ at: t0, voice: 'cello', midi: d(-1, 48), len: b * 0.9, vel: 0.6 });
        notes.push({ at: t0 + b, voice: 'cello', midi: d(0, 48), len: b * 0.95, vel: 0.5 });
        hits.push({ at: t0, voice: 'timpani', vel: 0.35 });
      }
      return { notes, chords, hits, length: 4 * b + 0.6 };
    }
    case 'bossAppear': {
      // a low brass chord and the gong, the horns falling from the fifth to the home note, a timpani roll that swells into it
      for (let i = 0; i < 8; i++) hits.push({ at: i * s * 0.75, voice: 'timpani', vel: 0.25 + 0.08 * i });
      const at = 6 * s;
      hits.push({ at, voice: 'gong', vel: 0.8 });
      chords.push({ at, voice: 'orchBrass', midi: [d(0, 38), d(4, 45), d(7, 50), d(9, 55)], len: 1.6, vel: 0.85 });
      notes.push({ at: at + 2 * b, voice: 'horn', midi: d(4, 55), len: b * 0.9, vel: 0.75 });
      notes.push({ at: at + 3 * b, voice: 'horn', midi: d(0, 55), len: b * 1.8, vel: 0.85 });
      notes.push({ at, voice: 'cello', midi: d(0, 36), len: 2.2, vel: 0.7 });
      return { notes, chords, hits, length: at + 3 * b + 1.6 };
    }
  }
}

/** play a cue at `t` on the effects bus; returns how long it rings */
export function playCue(core: AudioCore, name: CueName, key: KeyInfo, t: number, beat: number): number {
  const plan = cuePlan(name, key, beat);
  const bus = core.ctx.createGain();
  bus.gain.value = name === 'bossAppear' ? 0.44 : 0.42;
  bus.connect(core.sfx);
  const dst = core.withReverb(bus, 0.4);
  const loaded = (g: string) => core.orch.has(g);
  for (const n of plan.notes) {
    const v = standIn(n.voice, loaded);
    if (v) NOTE_VOICES[v]?.(core, dst, t + n.at, midiHz(n.midi), n.len, n.vel);
  }
  for (const c of plan.chords) CHORD_VOICES[c.voice]?.(core, dst, t + c.at, c.midi.map(midiHz), c.len, c.vel);
  for (const h of plan.hits) {
    const v = standIn(h.voice, loaded);
    if (v) DRUM_VOICES[v]?.(core, dst, t + h.at, h.vel);
  }
  return plan.length;
}
