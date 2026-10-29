/**
 * Each world's own STYLE (Matt, 2026-10-29: "world to world, it sounds exactly the same... basically the exact same loop with a different
 * tempo"). Before this, every world went through one composer style and one orchestration pass with different settings. Now each world has
 * its own meter and tempo band, its own drum and bass patterns, its own accompaniment figures and texture, and its own amount of orchestra,
 * so two worlds cannot sound alike. Matt's reference is Donkey Kong Country's genre-per-world grooves (the drums and bass carry the
 * identity; the ambient worlds really are ambient) with Ori's emotional orchestra (a cinematic mood per area, a lead that sings).
 *
 * The brief, world by world (the lead, 2026-10-29; Matt can steer):
 *   1 Canopy          bright, bouncy jungle groove: hand drums and shaker, a marimba ostinato, the flute's tune
 *   2 River           a lazy calypso lilt: plucked bass, the clarinet, harp ripples
 *   3 Grotto          cave ambient, no drums: slow 6/8 harp arpeggios, glockenspiel droplets, a low cello drone; sparse and echoing
 *   4 Falls           soaring: the horn over rolling strings, wide and airy
 *   5 Orchids & silk  sly, creeping pizzicato in the minor, the oboe's tune, a spidery tick of a rhythm
 *   6 Mangrove        murky, comic-tense swamp: the bassoon over plucked double bass and a heavy off-beat
 *   7 Ruins           solemn and ancient: the solo cello, a gong, the marimba as stone percussion, slow and free
 *   8 Treetops        a dreamy lullaby in three: violins, glockenspiel, soft and floating
 *   9 Volcano         a driving march: trombone and tuba, timpani and snare
 *   10 Fortress       grand and dark: slow, pounding taiko and timpani, low brass (measured: with the full orchestra's bright beds it
 *                     came out next to the Falls, so it keeps only the low ones)
 *
 * Patterns: drums x X o (hit, accent, ghost); figures r t f s o (root, third, fifth, seventh, octave; capital = accent, '-' holds);
 * one string per bar, 16 steps for 4/4 and 12 for 6/8 or 3/4.
 */
import type { ChordInstName, DrumName, NoteInstName } from './music.ts';

export interface StyleDrum {
  voice: DrumName;
  pats: string[];
  gain: number;
  /** comes in with the music's fullness (default: always) */
  gate?: [number, number];
  /** played every Nth bar only ('x...' = the first of four) */
  mask?: string;
  /** the bar before the end of every four */
  fill?: string;
}

export interface StyleFigure {
  name: string;
  inst: NoteInstName;
  oct: number;
  pats: string[];
  gain: number;
  len?: number;
  gate?: [number, number];
  pan?: number;
  rev?: number;
}

export interface StyleChords {
  name: string;
  inst: ChordInstName;
  lo: number;
  hi: number;
  gain: number;
  voices?: number;
  /** re-struck instead of held (one pattern per bar) */
  stabs?: string[];
  stabLen?: number;
  gate?: [number, number];
  rev?: number;
}

export interface Style {
  /** 16 = 4/4; 12 = 6/8 (or 3/4) */
  meter: 16 | 12;
  bpm: [number, number];
  swing?: number;
  swing8?: number;
  /** how busy the tune is */
  dens: 'sparse' | 'normal' | 'busy';
  /** chords last two bars (the slow, ambient worlds) */
  slow: number;
  drums: StyleDrum[];
  bass: StyleFigure;
  /** the accompaniment: figures and chords that make the world's texture */
  figures: StyleFigure[];
  chords: StyleChords[];
  /** how much of the full orchestra joins (realize.ts fullOrchestra): its beds under everything and the players doubling the tune */
  orch: 'full' | 'light' | 'none';
  /** a countermelody (composed) on this instrument, from this fullness */
  counter?: { inst: NoteInstName; gate: [number, number] };
  /** the bar-by-bar speed of a free, rubato world (cycled) */
  tempoMap?: number[];
  /** master level, so every world plays about as loud (measured) */
  level?: number;
  /** the stage's speed may be nudged by what it is about (a run, a climb...) by at most this share */
  paceRoom: number;
}

export const STYLES: Record<number, Style> = {
  // 1 Canopy: a bouncy jungle groove. Kick and congas, a shaker on every sixteenth, plucked bass that skips, a marimba ostinato
  1: {
    meter: 16, bpm: [126, 134], dens: 'busy', slow: 0, orch: 'light', paceRoom: 0.03,
    drums: [
      { voice: 'kickJ', pats: ['X... ..x. X... ....', 'X... ..x. X..x ....'], gain: 0.62 },
      { voice: 'handHi', pats: ['..x. x..x ..x. x.x.', '..x. x..x ..xx .x..'], gain: 0.55 },
      { voice: 'handLo', pats: ['x... ..x. .x.. ..x.', 'x... ..x. .x.. x...'], gain: 0.55 },
      { voice: 'shakerJ', pats: ['xoxo xoxo xoxo xoxo'], gain: 0.4 },
      { voice: 'woodJ', pats: ['.... x... .... x...'], gain: 0.35, fill: 'x.x. x.x. xxx. x.x.' },
    ],
    bass: { name: 'bass', inst: 'contraPizz', oct: 36, pats: ['R..r ..R. R..r ..f.', 'R..r ..R. f..t ..r.'], gain: 0.8, len: 0.6 },
    figures: [{ name: 'marimba', inst: 'marimbaR', oct: 60, pats: ['r.t. f.t. o.t. f.t.', 'r.t. f.o. f.t. r.t.'], gain: 0.42, pan: 0.25, rev: 0.25 }],
    chords: [{ name: 'skank', inst: 'orchStrings', lo: 55, hi: 74, voices: 3, gain: 0.3, stabs: ['..x. ..x. ..x. ..x.'], stabLen: 1, rev: 0.2 }],
    counter: { inst: 'clarinet', gate: [0.45, 0.8] },
  },
  // 2 River: a lazy calypso lilt (swung eighths): the 3-3-2 of a hand drum, a clave, a plucked bass that leans, harp ripples
  2: {
    meter: 16, bpm: [94, 102], swing8: 0.32, dens: 'normal', slow: 0.1, orch: 'light', paceRoom: 0.03,
    drums: [
      { voice: 'handLo', pats: ['x..x ..x. x..x ..x.'], gain: 0.6 },
      { voice: 'handHi', pats: ['.... x... .... x.x.', '..x. x... ..x. x...'], gain: 0.45 },
      { voice: 'claveJ', pats: ['x..x ..x. ..x. x...'], gain: 0.35 },
      { voice: 'shakerJ', pats: ['.x.x .x.x .x.x .x.x'], gain: 0.32 },
    ],
    bass: { name: 'bass', inst: 'contraPizz', oct: 36, pats: ['R... ..r. ..f. r.r.', 'R... ..r. f... t.f.'], gain: 0.8, len: 0.8 },
    figures: [
      { name: 'ripple', inst: 'harp', oct: 60, pats: ['rtfo tfr. .... ....', '.... .... rtfo tfr.'], gain: 0.38, pan: -0.35, rev: 0.45 },
      { name: 'strum', inst: 'harpSoft', oct: 55, pats: ['..r. ..t. ..f. ..t.'], gain: 0.34, pan: 0.3, rev: 0.25 },
    ],
    // (strings, not a woodwind choir: the strings are loaded with every piece, the bassoon would be loaded for this alone)
    chords: [{ name: 'pad', inst: 'orchStrings', lo: 55, hi: 74, voices: 3, gain: 0.18, rev: 0.5, gate: [0.3, 0.7] }],
    counter: { inst: 'flute', gate: [0.45, 0.8] },
  },
  // 3 Grotto: cave ambient in a slow 6/8. No drums at all: the harp's arpeggios, glockenspiel droplets, a low cello drone, a lot of room
  3: {
    meter: 12, bpm: [66, 74], dens: 'sparse', slow: 1, orch: 'none', paceRoom: 0,
    drums: [],
    bass: { name: 'drone', inst: 'cello', oct: 36, pats: ['R--- ---- ----'], gain: 0.5, len: 1 },
    figures: [
      { name: 'arp', inst: 'harp', oct: 55, pats: ['r.t.f. o.f.t.', 'r.f.o. t.o.f.'], gain: 0.45, rev: 0.7, pan: -0.25 },
      { name: 'drops', inst: 'glockR', oct: 79, pats: ['.... .... o...', '.... .f.. ....', '.... .... ....'], gain: 0.16, rev: 0.8, pan: 0.45 },
    ],
    chords: [{ name: 'air', inst: 'orchStrings', lo: 50, hi: 69, voices: 3, gain: 0.16, rev: 0.8 }],
  },
  // 4 Falls: soaring. The horn over strings that roll in sixteenths, held basses, timpani swelling under it all: wide and airy
  4: {
    meter: 16, bpm: [84, 92], dens: 'sparse', slow: 0.3, orch: 'full', paceRoom: 0.02,
    drums: [
      { voice: 'timpani', pats: ['X... .... .... ....', 'X... .... x... ....'], gain: 0.5 },
      { voice: 'bassDrum', pats: ['.... .... .... X...'], gain: 0.35, gate: [0.4, 0.8] },
      { voice: 'crash', pats: ['X... .... .... ....'], gain: 0.25, mask: 'x.......x.......' },
    ],
    bass: { name: 'bass', inst: 'contra', oct: 33, pats: ['R--- ---- r--- ----'], gain: 0.62, len: 1 },
    figures: [{ name: 'rolling', inst: 'violinStac', oct: 62, pats: ['rtfo ftrt fotf rtfo', 'rtfo tfrf otfr tfot'], gain: 0.36, pan: -0.3, rev: 0.4 }],
    chords: [{ name: 'strings', inst: 'orchStrings', lo: 48, hi: 74, voices: 4, gain: 0.36, rev: 0.6 }],
    counter: { inst: 'flute', gate: [0.3, 0.7] },
  },
  // 5 Orchids and silk: sly and creeping. Pizzicato on the off-beats, a spidery ticking rim, a bass that tiptoes
  5: {
    meter: 16, bpm: [100, 108], dens: 'normal', slow: 0.15, orch: 'light', paceRoom: 0.03,
    drums: [
      { voice: 'rimJ', pats: ['.x.. x.x. .x.. x..x', '.x.. x.x. .x.x ..x.'], gain: 0.42 },
      { voice: 'handLo', pats: ['x... .... x... ....'], gain: 0.4 },
      { voice: 'woodJ', pats: ['.... .... .... ..x.'], gain: 0.3 },
    ],
    bass: { name: 'bass', inst: 'contraPizz', oct: 36, pats: ['R... .r.. ..f. .r..', 'R... .r.. f... t...'], gain: 0.75, len: 0.4 },
    figures: [
      { name: 'pizz', inst: 'violinStac', oct: 60, pats: ['..t. ..f. .t.. f...', '..f. .t.. ..o. .f..'], gain: 0.4, pan: -0.3, rev: 0.3 },
      { name: 'creep', inst: 'celloStac', oct: 48, pats: ['r... t... r... f...'], gain: 0.3, pan: 0.3 },
    ],
    chords: [],
    counter: { inst: 'clarinet', gate: [0.5, 0.85] },
  },
  // 6 Mangrove: murky and comic-tense. A heavy off-beat (kick and a dull clap on 2 and 4), plucked double bass, horns grunting off the beat
  6: {
    meter: 16, bpm: [86, 94], swing8: 0.12, dens: 'sparse', slow: 0.2, orch: 'light', paceRoom: 0.02,
    drums: [
      { voice: 'kickJ', pats: ['X... ..x. X... ....', 'X... ..x. x..X ....'], gain: 0.62 },
      { voice: 'tomJ', pats: ['.... X... .... X...'], gain: 0.5 },
      { voice: 'woodJ', pats: ['..x. ..x. ..x. ..x.'], gain: 0.3 },
    ],
    bass: { name: 'bass', inst: 'contraPizz', oct: 33, pats: ['R..R ..r. R... f.r.', 'R... ..r. R..f ..t.'], gain: 0.85, len: 0.5 },
    figures: [{ name: 'grunt', inst: 'hornStac', oct: 48, pats: ['..r. ..t. ..f. ..t.', '..r. .... ..f. ..r.'], gain: 0.42, pan: 0.25 }],
    chords: [{ name: 'murk', inst: 'orchLow', lo: 33, hi: 50, voices: 2, gain: 0.3, rev: 0.4 }],
    counter: { inst: 'clarinet', gate: [0.5, 0.85] },
  },
  // 7 Ruins: solemn and ancient, slow and free. A gong, the marimba struck low like stone, a low choir of winds, held basses
  7: {
    meter: 16, bpm: [64, 72], dens: 'sparse', slow: 1, orch: 'light', paceRoom: 0,
    tempoMap: [1, 0.97, 1.02, 0.94, 1, 0.98, 1.03, 0.9],
    drums: [
      { voice: 'gong', pats: ['X... .... .... ....'], gain: 0.36, mask: 'x...x...x...x...' },
      { voice: 'taiko', pats: ['X... .... .... ....', '.... .... X... ....'], gain: 0.4 },
      // a slow frame drum, like a heartbeat in a stone hall
      { voice: 'handLo', pats: ['X... ...x X... ....', 'X... ...x X..x ....'], gain: 0.5 },
    ],
    bass: { name: 'bass', inst: 'contra', oct: 33, pats: ['R--- ---- ---- ----'], gain: 0.55, len: 1 },
    figures: [{ name: 'stone', inst: 'marimbaR', oct: 48, pats: ['r... .... .... t...', 'r... .... f... ....'], gain: 0.5, rev: 0.6 }],
    chords: [{ name: 'choir', inst: 'orchWinds', lo: 50, hi: 69, voices: 3, gain: 0.24, rev: 0.7 }],
  },
  // 8 Treetops: a dreamy lullaby in three. An oom-pah-pah harp waltz, a music box (the glockenspiel) turning over the top, soft strings,
  // a whisper of shaker
  8: {
    meter: 12, bpm: [84, 92], dens: 'sparse', slow: 0.3, orch: 'light', paceRoom: 0,
    drums: [{ voice: 'shakerJ', pats: ['.... o.o. o.o.'], gain: 0.28 }],
    bass: { name: 'bass', inst: 'harpSoft', oct: 43, pats: ['R... .... ....'], gain: 0.55, len: 1 },
    figures: [
      { name: 'waltz', inst: 'harp', oct: 60, pats: ['.... t... t...', '.... f... f...'], gain: 0.4, pan: -0.3, rev: 0.45 },
      { name: 'musicbox', inst: 'glockR', oct: 79, pats: ['r.t.f. o.f.t.', 'o.f.t. r.t.f.'], gain: 0.13, pan: 0.4, rev: 0.6 },
    ],
    chords: [{ name: 'strings', inst: 'orchStrings', lo: 52, hi: 72, voices: 3, gain: 0.24, rev: 0.7 }],
    counter: { inst: 'flute', gate: [0.45, 0.85] },
  },
  // 9 Volcano: a driving march. Snare, timpani and bass drum on every beat, tuba, brass punches
  9: {
    meter: 16, bpm: [112, 120], dens: 'normal', slow: 0, orch: 'full', paceRoom: 0.03,
    drums: [
      { voice: 'snare', pats: ['x.xx x.x. x.xx x.x.', 'x.x. x.xx x.x. xxxx'], gain: 0.5 },
      { voice: 'bassDrum', pats: ['X... X... X... X...'], gain: 0.5 },
      { voice: 'timpani', pats: ['X... x... X... x...'], gain: 0.5 },
      { voice: 'crash', pats: ['X... .... .... ....'], gain: 0.25, mask: 'x...x...x...x...' },
    ],
    bass: { name: 'bass', inst: 'tuba', oct: 33, pats: ['R... r... R... f...', 'R... f... R... r...'], gain: 0.7, len: 0.7 },
    figures: [],
    chords: [{ name: 'brass', inst: 'orchBrass', lo: 43, hi: 64, voices: 3, gain: 0.42, stabs: ['X... ..x. X... ..x.', 'X... ..x. ..x. X...'], stabLen: 2, rev: 0.3 }],
  },
  // 10 Fortress: grand and dark. Slow and heavy: taiko and timpani pounding eighths, low brass, cellos hammering underneath
  10: {
    meter: 16, bpm: [78, 84], dens: 'sparse', slow: 0.2, orch: 'light', paceRoom: 0.02,
    drums: [
      { voice: 'taiko', pats: ['X.x. X.x. X.x. X.xx', 'X.x. X.x. X..x X.X.'], gain: 0.72 },
      { voice: 'tomJ', pats: ['.... .... .... xxxx', '.... .... ..x. x.x.'], gain: 0.4 },
      { voice: 'timpani', pats: ['X... .... X... ..x.'], gain: 0.55 },
      { voice: 'crash', pats: ['X... .... .... ....'], gain: 0.28, mask: 'x...x...x...x...' },
    ],
    bass: { name: 'bass', inst: 'tuba', oct: 31, pats: ['R--- ---- R--- ----'], gain: 0.62, len: 1 },
    figures: [{ name: 'hammer', inst: 'celloStac', oct: 43, pats: ['R.rr R.rr R.rr R.rr', 'R.rr R.rr R.rR .rR.'], gain: 0.5, pan: 0.2 }],
    chords: [{ name: 'brass', inst: 'orchBrass', lo: 33, hi: 55, voices: 4, gain: 0.5, rev: 0.45 }],
  },
};
