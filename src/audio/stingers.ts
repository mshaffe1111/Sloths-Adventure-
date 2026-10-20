/**
 * Stingers: short pieces of written music for big moments (victory, defeat, a boss arriving).
 * They are notated exactly like the themes, and play over the top while the music underneath ducks.
 */
import { AudioCore } from './core.ts';
import { CHORD_VOICES, DRUM_VOICES, NOTE_VOICES } from './instruments.ts';
import type { ChordInstName, DrumName, NoteInstName } from './music.ts';
import { midiHz, noteMidi, parseChord, parseMelodyBar, SCALES, voiceLead } from './theory.ts';

interface Line {
  inst: NoteInstName;
  bars: string[];
  gain: number;
  rev?: number;
}

interface Sting {
  bpm: number;
  tonic: string;
  scale: keyof typeof SCALES;
  /** a chord per bar */
  chords: string[];
  chordInst: ChordInstName;
  chordGain: number;
  lines: Line[];
  hits: Array<{ voice: DrumName; bar: number; step: number; vel: number }>;
}

/** timpani/tom roll from `from` to `to` (16th steps within one bar), growing louder */
const roll = (voice: DrumName, bar: number, from: number, to: number, v0 = 0.3, v1 = 1): Sting['hits'] =>
  Array.from({ length: to - from }, (_, i) => ({ voice, bar, step: from + i, vel: v0 + ((v1 - v0) * i) / Math.max(1, to - from - 1) }));

export const STINGS: Record<string, Sting> = {
  /** level complete: a bright C major fanfare */
  victory: {
    bpm: 132,
    tonic: 'C4',
    scale: 'major',
    chords: ['C', 'G', 'C'],
    chordInst: 'strings',
    chordGain: 0.7,
    lines: [
      { inst: 'brass', gain: 0.8, rev: 0.3, bars: ['5:3 5:1 5:2 1\':6 r:4', '7:3 5:1 7:2 2\':6 r:4', '3\':3 2\':1 1\':12'] },
      { inst: 'bell', gain: 0.5, rev: 0.5, bars: ['r:16', 'r:16', "3'':3 2'':1 1'':12"] },
      { inst: 'harp', gain: 0.8, rev: 0.4, bars: ['1:2 3:2 5:2 1\':2 3\':2 5\':2 3\':2 1\':2', '7,:2 2:2 5:2 7:2 2\':2 7:2 5:2 2:2', "1:2 3:2 5:2 1':2 3':2 5':2 1'':4"] },
    ],
    hits: [
      { voice: 'timpani', bar: 0, step: 0, vel: 1 },
      { voice: 'timpani', bar: 0, step: 8, vel: 0.8 },
      { voice: 'timpani', bar: 1, step: 0, vel: 0.9 },
      { voice: 'timpani', bar: 2, step: 0, vel: 1 },
      { voice: 'crash', bar: 2, step: 0, vel: 0.9 },
      { voice: 'shaker', bar: 0, step: 4, vel: 0.8 },
      { voice: 'shaker', bar: 0, step: 12, vel: 0.8 },
    ],
  },

  /** a boss falls: longer, bigger, with a drum roll and a choir under the brass */
  bossVictory: {
    bpm: 120,
    tonic: 'C4',
    scale: 'major',
    chords: ['C', 'F', 'G', 'C'],
    chordInst: 'choir',
    chordGain: 0.8,
    lines: [
      { inst: 'brass', gain: 0.85, rev: 0.35, bars: ['r:8 5:3 5:1 5:4', "1':6 5:2 7:4 5:4", "2':6 7:2 2':4 4':4", "3':4 2':4 1':8"] },
      { inst: 'bell', gain: 0.5, rev: 0.55, bars: ['r:16', 'r:16', 'r:16', "5'':4 4'':4 3'':8"] },
      { inst: 'harp', gain: 0.8, rev: 0.4, bars: ['r:8 1:2 3:2 5:2 1\':2', '4:2 6:2 1\':2 4\':2 6\':2 4\':2 1\':2 6:2', '5:2 7:2 2\':2 5\':2 7\':2 5\':2 2\':2 7:2', "1:2 3:2 5:2 1':2 3':2 5':2 1'':4"] },
    ],
    hits: [
      ...roll('timpani', 0, 0, 8, 0.25, 1),
      { voice: 'timpani', bar: 1, step: 0, vel: 1 },
      { voice: 'timpani', bar: 2, step: 0, vel: 0.9 },
      { voice: 'timpani', bar: 3, step: 0, vel: 1 },
      { voice: 'taiko', bar: 3, step: 0, vel: 1 },
      { voice: 'crash', bar: 3, step: 0, vel: 1 },
      { voice: 'shaker', bar: 1, step: 0, vel: 0.7 },
      { voice: 'shaker', bar: 1, step: 8, vel: 0.7 },
    ],
  },

  /** defeat: Pokey's theme falls apart in A minor */
  defeat: {
    bpm: 66,
    tonic: 'A4',
    scale: 'minor',
    chords: ['Am', 'F', 'Am'],
    chordInst: 'strings',
    chordGain: 0.8,
    lines: [
      { inst: 'softLead', gain: 0.7, rev: 0.5, bars: ['5:4 3:4 2:2 1:2 7,:4', '6,:6 7,:2 6,:8', '1:16'] },
      { inst: 'kalimba', gain: 0.5, rev: 0.6, bars: ['r:16', '3:4 r:12', '5:4 3:4 1:8'] },
    ],
    hits: [
      { voice: 'timpani', bar: 0, step: 0, vel: 0.9 },
      { voice: 'tom', bar: 1, step: 0, vel: 0.5 },
      { voice: 'timpani', bar: 2, step: 0, vel: 0.6 },
    ],
  },

  /** a boss appears: a low drum roll and a dark brass hit */
  bossAppear: {
    bpm: 100,
    tonic: 'C3',
    scale: 'minor',
    chords: ['Cm', 'Cm'],
    chordInst: 'choir',
    chordGain: 0.9,
    lines: [
      { inst: 'brass', gain: 0.8, rev: 0.5, bars: ['r:8 1:2 b2:2 1:4', '1:16'] },
      { inst: 'subBass', gain: 0.9, rev: 0.1, bars: ['r:8 1,:8', '1,:16'] },
    ],
    hits: [
      ...roll('timpani', 0, 0, 8, 0.2, 0.9),
      { voice: 'taiko', bar: 0, step: 8, vel: 1 },
      { voice: 'crash', bar: 0, step: 8, vel: 0.8 },
    ],
  },

  /** the whole forest exhales: a short warm resolve (new world reached) */
  worldReached: {
    bpm: 96,
    tonic: 'F4',
    scale: 'major',
    chords: ['F', 'C'],
    chordInst: 'strings',
    chordGain: 0.6,
    lines: [
      { inst: 'bell', gain: 0.7, rev: 0.6, bars: ["1':4 3':4 5':8", "7:4 2':4 1':8"] },
      { inst: 'harp', gain: 0.7, rev: 0.4, bars: ['1:2 3:2 5:2 1\':2 3\':2 1\':2 5:2 3:2', '5,:2 7,:2 2:2 5:2 7:2 5:2 2:2 7,:2'] },
    ],
    hits: [{ voice: 'timpani', bar: 0, step: 0, vel: 0.7 }],
  },
};

/** length of a sting in seconds */
export function stingLength(name: string): number {
  const s = STINGS[name];
  if (!s) return 0;
  return (60 / s.bpm) * 4 * s.chords.length + 1.2;
}

/** play a sting starting at `t`; returns how long it lasts (the music ducks for that time) */
export function playSting(core: AudioCore, name: string, t: number): number {
  const s = STINGS[name];
  if (!s) return 0;
  const c = core.ctx;
  const stepDur = 60 / s.bpm / 4;
  const barDur = stepDur * 16;
  const tonic = noteMidi(s.tonic);
  const scale = SCALES[s.scale];

  // everything goes through the sfx bus (never ducked)
  const bus = c.createGain();
  bus.gain.value = 0.42; // loud enough to lead, but still under the limiter
  bus.connect(core.sfx);

  let voicing: number[] | null = null;
  s.chords.forEach((name, i) => {
    const ch = parseChord(name);
    voicing = voiceLead(voicing, ch, 50, 70, 4);
    const hz = voicing.map(midiHz);
    const g = core.withReverb(bus, 0.4);
    CHORD_VOICES[s.chordInst](core, g, t + i * barDur, hz, barDur - 0.05, s.chordGain);
  });

  for (const line of s.lines) {
    const voice = NOTE_VOICES[line.inst];
    const dst = core.withReverb(bus, line.rev ?? 0.3);
    line.bars.forEach((bar, bi) => {
      for (const n of parseMelodyBar(bar, tonic, scale, 16)) {
        if (n.midi === null) continue;
        voice(core, dst, t + bi * barDur + n.step * stepDur, midiHz(n.midi), n.len * stepDur * 0.95, line.gain);
      }
    });
  }

  const drumDst = core.withReverb(bus, 0.25);
  for (const h of s.hits) DRUM_VOICES[h.voice](core, drumDst, t + h.bar * barDur + h.step * stepDur, h.vel);
  return barDur * s.chords.length + 1.2;
}
