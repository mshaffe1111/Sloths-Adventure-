/**
 * Stingers: short pieces of written music for big moments (victory, defeat, a boss arriving) and, in STORY_STINGS, for the beats of a cutscene.
 * They are notated exactly like the themes, and play over the top while the music underneath ducks.
 */
import { AudioCore } from './core.ts';
import { CHORD_VOICES, DRUM_VOICES, NOTE_VOICES } from './instruments.ts';
import type { ChordInstName, DrumName, NoteInstName } from './music.ts';
import { midiHz, noteMidi, parseChord, parseMelodyBar, SCALES, voiceLead } from './theory.ts';
import type { StorySting } from '../game/story.ts';

export interface Line {
  inst: NoteInstName;
  bars: string[];
  gain: number;
  rev?: number;
}

export interface Sting {
  bpm: number;
  tonic: string;
  scale: keyof typeof SCALES;
  /** a chord per bar */
  chords: string[];
  chordInst: ChordInstName;
  /** 0 = no chord under the lines */
  chordGain: number;
  lines: Line[];
  hits: Array<{ voice: DrumName; bar: number; step: number; vel: number }>;
  /** sixteenths in each bar (default 16; a story sting is one short bar of 8 or 12) */
  steps?: 8 | 12 | 16;
  /** seconds the last sound is left to ring after the last bar (default 1.2); when set, the last chord is held into it */
  tail?: number;
  /** level of the whole sting on the effects bus (default 0.42) */
  level?: number;
  /** where the music underneath is dipped to while it sounds, as a share of its level (default 0.12) */
  duck?: number;
  /** the MIDI range the chord is voiced in (default 50-70) */
  range?: [number, number];
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

/**
 * The stings of the story: one short, soft piece of written music for each StorySting, played once as a picture appears (see StoryPlayer).
 * Each is one bar of 8 or 12 sixteenths with a short ring-out (1 to 3 seconds in all), built from the story's own motifs, and made of strings,
 * woodwinds, low brass and soft timpani; none is a bell or a pluck. They sit well under the music's level and dip it only a little.
 */
export const STORY_STINGS: Record<StorySting, Sting> = {
  /** Grandma's four rising notes with the leading tone held and no tonic to answer it: the question is left open */
  cliffhanger: {
    bpm: 96, tonic: 'D4', scale: 'major', steps: 12, tail: 1.0, level: 0.3, duck: 0.4,
    chords: ['A'], chordInst: 'orchStrings', chordGain: 0.5, range: [43, 64],
    lines: [{ inst: 'clarinet', gain: 0.8, rev: 0.5, bars: ['1:2 2:2 3:2 5:2 7:4'] }],
    hits: [{ voice: 'timpani', bar: 0, step: 8, vel: 0.3 }],
  },

  /** a suspended fourth that falls, not to the third of the song but to the flat third of the march: the secret turns dark */
  reveal: {
    bpm: 104, tonic: 'D4', scale: 'major', steps: 8, tail: 0.6, level: 0.3, duck: 0.4,
    chords: ['Dsus4', 'Bb'], chordInst: 'orchStrings', chordGain: 0.5, range: [43, 64],
    lines: [{ inst: 'clarinet', gain: 0.8, rev: 0.5, bars: ['5:4 4:4', 'b3:8'] }],
    hits: [{ voice: 'timpani', bar: 1, step: 0, vel: 0.3 }],
  },

  /** a wink: a clarinet runs up three notes and a bassoon answers low, all of it under a second */
  laugh: {
    bpm: 150, tonic: 'A3', scale: 'major', steps: 8, tail: 0.5, level: 0.22, duck: 0.75,
    chords: ['A'], chordInst: 'orchStrings', chordGain: 0, range: [43, 64],
    lines: [
      { inst: 'clarinet', gain: 0.6, rev: 0.25, bars: ["3:1 5:1 3':2 r:4"] },
      { inst: 'bassoon', gain: 0.6, rev: 0.2, bars: ['r:4 5,:1 1,:3'] },
    ],
    hits: [],
  },

  /** a blow: the iron figure's flat second leaned on once by the low brass, a timpani, a taiko and a gong */
  blow: {
    bpm: 100, tonic: 'D3', scale: 'minor', steps: 8, tail: 0.9, level: 0.34, duck: 0.35,
    chords: ['Dm'], chordInst: 'orchBrass', chordGain: 0.7, range: [38, 57],
    lines: [{ inst: 'trombone', gain: 0.8, rev: 0.3, bars: ['1:4 b2:2 1:2'] }],
    hits: [
      { voice: 'timpani', bar: 0, step: 0, vel: 1 },
      { voice: 'taiko', bar: 0, step: 0, vel: 0.7 },
      { voice: 'gong', bar: 0, step: 0, vel: 0.35 },
    ],
  },

  /** the Heartbloom opening: the bud's root and fifth, the ninth, then the third, in a clarinet with a flute on the last two, a harp low behind them and the strings swelling under */
  bloom: {
    bpm: 104, tonic: 'D4', scale: 'major', steps: 12, tail: 1.0, level: 0.3, duck: 0.45,
    chords: ['Dadd9'], chordInst: 'orchStrings', chordGain: 0.55, range: [43, 66],
    lines: [
      { inst: 'clarinet', gain: 0.7, rev: 0.45, bars: ["1:3 5:3 2':3 3':3"] },
      { inst: 'harp', gain: 0.3, rev: 0.45, bars: ["1:3 5:3 2':3 3':3"] },
      { inst: 'flute', gain: 0.5, rev: 0.5, bars: ["r:6 2':3 3':3"] },
    ],
    hits: [],
  },

  /** the lights go out: a cello leans from the tonic to its flat second over a double bass and a timpani, in the dark of the minor */
  darkness: {
    bpm: 88, tonic: 'D3', scale: 'harmonicMinor', steps: 12, tail: 0.8, level: 0.3, duck: 0.35,
    chords: ['Dm'], chordInst: 'orchStrings', chordGain: 0.6, range: [38, 57],
    lines: [
      { inst: 'cello', gain: 0.7, rev: 0.4, bars: ['1:6 b2:6'] },
      { inst: 'contra', gain: 0.8, rev: 0.1, bars: ['1,:12'] },
    ],
    hits: [
      { voice: 'timpani', bar: 0, step: 0, vel: 0.5 },
      { voice: 'timpani', bar: 0, step: 6, vel: 0.3 },
    ],
  },

  /** a great gate: a timpani roll that grows, a horn opening on the bare fifth (D to A) and a gong where it swings wide */
  door: {
    bpm: 80, tonic: 'D3', scale: 'minor', steps: 12, tail: 0.7, level: 0.32, duck: 0.4,
    chords: ['Dm'], chordInst: 'orchBrass', chordGain: 0.5, range: [38, 57],
    lines: [{ inst: 'horn', gain: 0.7, rev: 0.4, bars: ['1:4 5:8'] }],
    hits: [...roll('timpani', 0, 0, 6, 0.15, 0.6), { voice: 'gong', bar: 0, step: 6, vel: 0.5 }],
  },

  /** a cello alone sings the last line of the lullaby ("that holds you under": A A E D) over the lament's chord, B minor */
  heartbreak: {
    bpm: 80, tonic: 'D3', scale: 'major', steps: 12, tail: 0.7, level: 0.3, duck: 0.4,
    chords: ['Bm'], chordInst: 'orchStrings', chordGain: 0.45, range: [43, 62],
    lines: [{ inst: 'cello', gain: 0.85, rev: 0.5, bars: ['5:3 5:1 2:4 1:4'] }],
    hits: [],
  },

  /** small and brave, not a fanfare: the first line of Pokey's tune in horn and violins, one timpani, and D major */
  triumph: {
    bpm: 112, tonic: 'D4', scale: 'major', steps: 12, tail: 1.0, level: 0.32, duck: 0.45,
    chords: ['D'], chordInst: 'orchStrings', chordGain: 0.6, range: [43, 66],
    lines: [
      { inst: 'horn', gain: 0.75, rev: 0.4, bars: ['5,:2 5,:2 6,:2 5,:2 1:4'] },
      { inst: 'violins', gain: 0.6, rev: 0.5, bars: ["5:2 5:2 6:2 5:2 1':4"] },
    ],
    hits: [
      { voice: 'timpani', bar: 0, step: 0, vel: 0.8 },
      { voice: 'timpani', bar: 0, step: 8, vel: 0.6 },
    ],
  },
};

/** every story sting there is */
export const STORY_STING_NAMES = Object.keys(STORY_STINGS) as StorySting[];

/** a sting by name, whichever table it is in */
const stingNamed = (name: string): Sting | undefined => STINGS[name] ?? STORY_STINGS[name as StorySting];

/** how long a bar of a sting lasts, in seconds */
const barSeconds = (s: Sting) => (60 / s.bpm / 4) * (s.steps ?? 16);

/** where the music is dipped to under a sting (a share of its level) */
export const stingDuck = (name: string): number => stingNamed(name)?.duck ?? 0.12;

/** the voices a sting plays (instruments and drums), so the recordings they need can be fetched before it is first heard */
export function stingVoices(name: string): string[] {
  const s = stingNamed(name);
  if (!s) return [];
  return [...new Set<string>([...(s.chordGain > 0 ? [s.chordInst] : []), ...s.lines.map((l) => l.inst), ...s.hits.map((h) => h.voice)])];
}

/** length of a sting in seconds */
export function stingLength(name: string): number {
  const s = stingNamed(name);
  if (!s) return 0;
  return barSeconds(s) * s.chords.length + (s.tail ?? 1.2);
}

/** play a sting starting at `t`; returns how long it lasts (the music ducks for that time) */
export function playSting(core: AudioCore, name: string, t: number): number {
  const s = stingNamed(name);
  if (!s) return 0;
  const c = core.ctx;
  const steps = s.steps ?? 16;
  const stepDur = 60 / s.bpm / 4;
  const barDur = stepDur * steps;
  const tail = s.tail ?? 1.2;
  const tonic = noteMidi(s.tonic);
  const scale = SCALES[s.scale];

  // everything goes through the sfx bus (never ducked)
  const bus = c.createGain();
  bus.gain.value = s.level ?? 0.42; // loud enough to lead, but still under the limiter
  bus.connect(core.sfx);

  let voicing: number[] | null = null;
  if (s.chordGain > 0) {
    s.chords.forEach((name, i) => {
      const ch = parseChord(name);
      voicing = voiceLead(voicing, ch, s.range?.[0] ?? 50, s.range?.[1] ?? 70, 4);
      const hz = voicing.map(midiHz);
      const g = core.withReverb(bus, 0.4);
      // a story sting holds its last chord into the ring-out
      const extra = s.tail !== undefined && i === s.chords.length - 1 ? tail * 0.5 : 0;
      CHORD_VOICES[s.chordInst](core, g, t + i * barDur, hz, barDur - 0.05 + extra, s.chordGain);
    });
  }

  for (const line of s.lines) {
    const voice = NOTE_VOICES[line.inst];
    const dst = core.withReverb(bus, line.rev ?? 0.3);
    line.bars.forEach((bar, bi) => {
      for (const n of parseMelodyBar(bar, tonic, scale, steps)) {
        if (n.midi === null) continue;
        voice(core, dst, t + bi * barDur + n.step * stepDur, midiHz(n.midi), n.len * stepDur * 0.95, line.gain);
      }
    });
  }

  const drumDst = core.withReverb(bus, 0.25);
  for (const h of s.hits) DRUM_VOICES[h.voice](core, drumDst, t + h.bar * barDur + h.step * stepDur, h.vel);
  return barDur * s.chords.length + tail;
}
