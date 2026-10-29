/**
 * The score. Every piece of music in the game is written here as notation (see theory.ts / music.ts).
 *
 * Recurring melodies:
 *   Pokey's theme   - the lazy, bouncy hero tune (world 1, title, map, ending, and a minor version at dusk)
 *   Meeca's theme  - a tender waltz (the story's warm scenes)
 *   Iron-Claw's theme - a low, creeping minor motif (world 10, the final boss, storm scenes)
 *
 * Melody notation: scale degrees, "5:3 5:1 6:2" = degree 5 for 3 sixteenths, degree 5 for 1, degree 6 for 2.
 * Each bar must add up to 16 sixteenths (12 in 3/4); the unit test checks every bar of every theme.
 * A `null` bar is composed on the fly by the melody generator (in key, on the chord, repeatable).
 */
import type { DrumName, DrumTrack, Theme, Track } from './music.ts';
import { composeStory, themeFromId } from './composer.ts';
import { orchestrate, paceFromCode } from './orchestrate.ts';
import { scoreById } from './score.ts';

// ---------------------------------------------------------------------------------------------
// Shared tunes
// ---------------------------------------------------------------------------------------------

export { SLOMATT_A, IRON_CLAW } from './tunes.ts';
import { signatureById } from './signature.ts';
import { SLOMATT_A, IRON_CLAW } from './tunes.ts';

const nulls = (n: number) => Array.from({ length: n }, () => null);
/** an 8-bar tune followed by 8 composed bars (a 16-bar loop) */
const loop16 = (bars: string[]) => [...bars, ...nulls(16 - bars.length)];

const drum = (name: string, voice: DrumName, pats: string[], gain: number, gate?: [number, number], fill?: string, pan?: number): DrumTrack => ({
  kind: 'drums', name, voice, pats, gain, gate, fill, pan,
});

export const THEMES: Record<string, Theme> = {};

// ---------------------------------------------------------------------------------------------
// WORLDS
// ---------------------------------------------------------------------------------------------

// 1  Emerald Canopy - C major, easy and sunny: Pokey's theme on flute
THEMES.world1 = {
  id: 'world1',
  bpm: 108,
  tonic: 'C4',
  scale: 'major',
  delay: 0.75,
  chords: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G', 'Am', 'F', 'C', 'G', 'Am', 'Dm', 'G', 'G7'],
  tracks: [
    { kind: 'chords', name: 'pad', inst: 'pad', lo: 52, hi: 70, voices: 4, gain: 0.38, rev: 0.4 },
    { kind: 'pattern', name: 'bass', inst: 'bass', oct: 36, pats: ['R.-. ..r. ..f. r.-.', 'R... ..r. ..o. f...'], gain: 0.5, rev: 0.05 },
    { kind: 'melody', name: 'lead', inst: 'flute', altInst: 'marimba', bars: loop16(SLOMATT_A), gen: { lo: 64, hi: 81, density: 0.45 }, gain: 0.62, rev: 0.3, dly: 0.16 },
    { kind: 'pattern', name: 'arp', lite: true, inst: 'marimba', oct: 60, pats: ['r.t.f.t. r.t.f.t.'], gain: 0.4, rev: 0.25, dly: 0.12, gate: [0.1, 0.45] },
    drum('kick', 'softKick', ['x... .... x... ....', 'x... .... x... ..x.'], 0.7, [0.15, 0.4]),
    drum('shaker', 'shaker', ['.x.x .x.x .x.x .x.x'], 0.55, [0, 0.2]),
    drum('hat16', 'hat', ['x.x. x.x. x.x. x.xo'], 0.35, [0.55, 0.85]),
    drum('congaHi', 'congaHi', ['.... x... .... x.x.'], 0.5, [0.3, 0.55]),
    drum('congaLo', 'congaLo', ['..x. .... ..x. ....'], 0.5, [0.3, 0.55]),
    drum('snare', 'rim', ['.... x... .... x...'], 0.55, [0.5, 0.8], 'x... x... x.x. xxxx'),
  ],
};

// 2  Sunlit Riverbank - G major, lazy shuffle, harp ripples and a kalimba tune
THEMES.world2 = {
  id: 'world2',
  bpm: 100,
  tonic: 'G4',
  scale: 'major',
  swing8: 0.18,
  delay: 0.75,
  chords: ['G', 'Em', 'C', 'D', 'G', 'Bm', 'C', 'D', 'Em', 'C', 'G/B', 'Am', 'C', 'D', 'G', 'D'],
  tracks: [
    { kind: 'chords', name: 'pad', inst: 'pad', lo: 50, hi: 69, voices: 4, gain: 0.3, rev: 0.45 },
    { kind: 'pattern', name: 'harp', inst: 'harp', oct: 55, pats: ['r.t.f.t. r.t.f.t.', 'r.t.f.o. f.t.r.t.'], gain: 0.5, rev: 0.35, dly: 0.15, pan: -0.25, gate: [0, 0.35] },
    { kind: 'pattern', name: 'bass', inst: 'bass', oct: 36, pats: ['R... ..r. ..f. r...', 'R... ..r. R... ..f.'], gain: 0.5, rev: 0.05 },
    {
      kind: 'melody', name: 'lead', inst: 'kalimba', altInst: 'pluck', gen: { lo: 67, hi: 83, density: 0.4 }, gain: 0.7, rev: 0.35, dly: 0.18,
      bars: loop16([
        '3:2 5:2 1\':4 5:2 3:2 5:4',
        '6:2 5:2 3:4 2:2 3:2 5:4',
        '1\':3 7:1 6:2 5:2 6:4 r:4',
        '5:4 6:2 7:2 1\':8',
        '5:2 3:2 5:2 1\':2 3\':4 r:4',
        '3\':3 2\':1 1\':2 7:2 5:4 r:4',
        '4:2 6:2 1\':2 3\':2 2\':4 1\':4',
        '2\':4 1\':2 7:2 5:8',
      ]),
    },
    drum('brush', 'brush', ['.... x... .... x...'], 0.7, [0.1, 0.4]),
    drum('shaker', 'shaker', ['x.x. x.x. x.x. x.x.'], 0.5, [0.25, 0.5]),
    drum('wood', 'woodblock', ['.... .... x... ..o.', '..o. .... x... ....'], 0.5, [0.4, 0.7]),
    drum('kick', 'softKick', ['x... .... x... ....'], 0.65, [0.3, 0.55]),
  ],
};

// 3  Mossy Grotto - A minor, wide and dripping: bells in a big room
THEMES.world3 = {
  id: 'world3',
  bpm: 84,
  tonic: 'A4',
  scale: 'minor',
  delay: 0.75,
  chords: ['Am*2', 'F', 'G', 'Am*2', 'Dm', 'E', 'Am', 'F', 'G', 'Em', 'F', 'E*2', 'Am'],
  tracks: [
    { kind: 'chords', name: 'pad', inst: 'strings', lo: 45, hi: 66, voices: 4, gain: 0.3, rev: 0.6 },
    { kind: 'pattern', name: 'sub', inst: 'subBass', oct: 33, pats: ['R--- ---- ---- ----'], gain: 0.55, rev: 0.05 },
    {
      kind: 'melody', name: 'lead', inst: 'bell', gen: { lo: 69, hi: 88, density: 0.25 }, gain: 0.55, rev: 0.6, dly: 0.3,
      bars: [
        '1:6 3:2 5:4 3:4',
        '2:2 1:2 7,:4 1:8',
        '6,:4 1:4 3:4 1:4',
        '7,:4 2:4 4:4 2:4',
        '1:4 3:4 5:6 3:2',
        '5:2 4:2 3:4 1:8',
        '4:4 6:4 1\':4 6:4',
        '5:4 #7,:4 2:4 #7,:4',
        ...nulls(8),
      ],
    },
    { kind: 'pattern', name: 'drip', inst: 'kalimba', oct: 57, pats: ['r... t... f... t...', 'r... f... t... s...'], gain: 0.4, rev: 0.5, dly: 0.25, pan: 0.2, gate: [0.05, 0.4] },
    drum('wood', 'woodblock', ['.... .... .... o...', '..o. .... .... ....'], 0.45, [0.2, 0.5]),
    drum('heart', 'tom', ['x... .... .... ....'], 0.5, [0.45, 0.7]),
    drum('kick', 'softKick', ['x... .... x... ....'], 0.6, [0.55, 0.8]),
    drum('shaker', 'shaker', ['.... x... .... x...'], 0.4, [0.6, 0.9]),
  ],
};

// 4  Mist Cascades - F lydian, shimmering harps and glassy bells
THEMES.world4 = {
  id: 'world4',
  bpm: 96,
  tonic: 'F4',
  scale: 'lydian',
  delay: 0.75,
  chords: ['Fmaj7', 'G', 'Am', 'Fmaj7', 'Fmaj7', 'G', 'Am', 'C', 'Dm', 'G', 'Fmaj7', 'C', 'Dm', 'Am', 'G', 'C'],
  tracks: [
    { kind: 'chords', name: 'strings', inst: 'strings', lo: 53, hi: 72, voices: 4, gain: 0.3, rev: 0.55 },
    { kind: 'pattern', name: 'harp', inst: 'harp', oct: 58, pats: ['r.t.f.s.f.t.r.t.', 'r.t.f.t.s.f.t.f.'], gain: 0.5, rev: 0.45, dly: 0.2, pan: -0.3 },
    { kind: 'pattern', name: 'bass', inst: 'bass', oct: 36, pats: ['R... .... ..f. ....', 'R... ..r. .... f...'], gain: 0.5, rev: 0.05 },
    {
      kind: 'melody', name: 'lead', inst: 'bell', altInst: 'harp', gen: { lo: 72, hi: 91, density: 0.35 }, gain: 0.55, rev: 0.5, dly: 0.25, pan: 0.15,
      bars: loop16([
        '5:4 3:2 1\':2 7:4 5:4',
        '6:4 4:2 2:2 4:8',
        '3:4 5:4 7:4 5:4',
        '1\':6 7:2 5:4 3:4',
        '3:2 5:2 7:2 1\':2 3\':8',
        '2\':4 1\':2 7:2 6:8',
        '5:2 7:2 3\':4 7:4 5:4',
        '5:4 7:4 2\':4 5:4',
      ]),
    },
    drum('brush', 'brush', ['.... x... .... x...'], 0.6, [0.15, 0.45]),
    drum('shaker', 'shaker', ['x.x. x.x. x.x. x.x.'], 0.5, [0.35, 0.65]),
    drum('kick', 'softKick', ['x... .... x... ....', 'x... .... x... ..x.'], 0.65, [0.4, 0.65]),
    drum('hat', 'hat', ['..x. ..x. ..x. ..xo'], 0.4, [0.6, 0.9]),
  ],
};

// 5  Orchid Sanctuary - A major, a bright steel-pan calypso
THEMES.world5 = {
  id: 'world5',
  bpm: 118,
  tonic: 'A4',
  scale: 'major',
  swing8: 0.22,
  delay: 0.75,
  chords: ['A', 'F#m', 'D', 'E', 'A', 'F#m', 'D', 'E', 'Bm', 'E', 'A', 'F#m', 'D', 'E', 'A', 'E'],
  tracks: [
    { kind: 'chords', name: 'pad', inst: 'pad', lo: 52, hi: 71, voices: 4, gain: 0.26, rev: 0.35 },
    { kind: 'pattern', name: 'bass', inst: 'bass', oct: 33, pats: ['R... ..r. R... ..f.', 'R..r ..f. R... r...'], gain: 0.55, rev: 0.05 },
    {
      kind: 'melody', name: 'lead', inst: 'steelpan', altInst: 'kalimba', gen: { lo: 69, hi: 90, density: 0.5 }, gain: 0.6, rev: 0.3, dly: 0.2,
      bars: loop16([
        '5:2 5:2 6:2 5:2 3:4 1:4',
        '6:2 6:2 1\':2 6:2 3:4 r:4',
        '4:2 6:2 1\':2 6:2 4:4 r:4',
        '5:2 7:2 2\':2 7:2 5:4 r:4',
        '1\':2 3\':2 5\':2 3\':2 1\':4 5:4',
        '6:2 1\':2 3\':2 1\':2 6:8',
        '4:2 6:2 1\':2 6:2 4\':4 3\':4',
        '5:4 7:2 2\':2 5\':4 r:4',
      ]),
    },
    { kind: 'pattern', name: 'comp', lite: true, inst: 'marimba', oct: 57, pats: ['.... t..t .... t..t', '..t. ..f. ..t. ..f.'], gain: 0.4, rev: 0.2, gate: [0.15, 0.5] },
    drum('kick', 'softKick', ['x... .... x... ..x.', 'x... ..x. x... ....'], 0.7, [0.1, 0.35]),
    drum('clave', 'clave', ['x..x ..x. ..x. x...'], 0.55, [0.25, 0.55]),
    drum('congaHi', 'congaHi', ['.... x... .x.. x.x.'], 0.55, [0.3, 0.6]),
    drum('congaLo', 'congaLo', ['..x. .... ..x. .x..'], 0.55, [0.3, 0.6]),
    drum('shaker', 'shaker', ['x.xx x.xx x.xx x.xx'], 0.5, [0.2, 0.5]),
    drum('hat', 'ohat', ['..x. ..x. ..x. ..x.'], 0.4, [0.6, 0.9]),
    drum('snare', 'rim', ['.... x... .... x...'], 0.55, [0.5, 0.8], 'x... x... x.x. xxxx'),
  ],
};

// 6  Deep Mangrove - D dorian, a slow swamp shuffle with a plucked tune
THEMES.world6 = {
  id: 'world6',
  bpm: 92,
  tonic: 'D4',
  scale: 'dorian',
  swing: 0.28,
  delay: 0.75,
  chords: ['Dm*2', 'G*2', 'Dm', 'Am', 'C', 'G', 'Dm*2', 'G', 'Em7', 'Dm', 'C', 'Am*2'],
  tracks: [
    { kind: 'chords', name: 'strings', inst: 'strings', lo: 48, hi: 67, voices: 4, gain: 0.26, rev: 0.45, gate: [0, 0.4] },
    { kind: 'pattern', name: 'bass', inst: 'bass', oct: 33, pats: ['R..r ..R. .r.. f.r.', 'R... ..r. R... .f..'], gain: 0.6, rev: 0.05 },
    {
      kind: 'melody', name: 'lead', inst: 'pluck', altInst: 'marimba', gen: { lo: 62, hi: 81, density: 0.4 }, gain: 0.7, rev: 0.3, dly: 0.2,
      bars: loop16([
        '1:4 3:2 5:2 3:4 1:4',
        '7,:2 1:2 3:4 2:2 1:2 7,:4',
        '4:4 6:2 5:2 4:4 r:4',
        '1\':4 6:2 4:2 5:8',
        '1:2 1:2 3:2 5:2 1\':4 5:4',
        '5:4 7:2 2\':2 7:4 5:4',
        '7:4 2\':2 7:2 4:4 r:4',
        '6:4 4:4 1\':4 6:4',
      ]),
    },
    drum('wood', 'woodblock', ['.... x... .... x...', '.... x... ..x. x...'], 0.55, [0.1, 0.4]),
    drum('congaLo', 'congaLo', ['x... ..x. .... ..x.'], 0.55, [0.2, 0.5]),
    drum('shaker', 'shaker', ['x.x. x.x. x.x. x.x.'], 0.5, [0.2, 0.5]),
    drum('tom', 'tom', ['X... .... .... ....', 'X... .... ..o. ....'], 0.55, [0.35, 0.65]),
    drum('kick', 'softKick', ['x... .... x... ....'], 0.6, [0.45, 0.7]),
    drum('snare', 'rim', ['.... x... .... x...'], 0.55, [0.55, 0.85], 'x... x... x.x. xxxx'),
  ],
};

// 7  Ancient Ruins - E phrygian, temple drums, brass and a hidden choir
THEMES.world7 = {
  id: 'world7',
  bpm: 88,
  tonic: 'E4',
  scale: 'phrygian',
  delay: 0.75,
  chords: ['Em*2', 'F', 'Em', 'Em*2', 'F', 'Em', 'Am', 'Em', 'F', 'G', 'F', 'Em', 'D*2'],
  tracks: [
    { kind: 'chords', name: 'choir', inst: 'choir', lo: 52, hi: 71, voices: 3, gain: 0.35, rev: 0.6, gate: [0.1, 0.5] },
    { kind: 'chords', name: 'strings', inst: 'strings', lo: 40, hi: 62, voices: 3, gain: 0.3, rev: 0.45 },
    { kind: 'pattern', name: 'sub', inst: 'subBass', oct: 28, pats: ['R--- ---- ---. ....', 'R--- ---- r--- ....'], gain: 0.55, rev: 0.05 },
    {
      kind: 'melody', name: 'lead', inst: 'brass', altInst: 'softLead', gen: { lo: 64, hi: 79, density: 0.3 }, gain: 0.5, rev: 0.45, dly: 0.15,
      bars: loop16([
        '1:6 2:2 1:4 7,:4',
        '1:4 5:4 3:4 2:4',
        '2:6 4:2 6:4 4:4',
        '3:4 2:4 1:8',
        '5:4 5:2 6:2 5:4 3:4',
        '3:2 2:2 1:4 2:4 1:4',
        '4:4 6:4 1\':4 6:4',
        '5:8 3:4 2:4',
      ]),
    },
    drum('taiko', 'taiko', ['X... .... .... ..x.', 'X... .... x... ....'], 0.7, [0.1, 0.45]),
    drum('wood', 'woodblock', ['.... .... .... x...'], 0.4, [0.2, 0.5]),
    drum('tom', 'tom', ['.... .... x... ..x.', '.... ..x. x... ....'], 0.55, [0.4, 0.7]),
    drum('shaker', 'shaker', ['x.x. x.x. x.x. x.x.'], 0.45, [0.45, 0.75]),
    drum('snare', 'rim', ['.... x... .... x...'], 0.5, [0.65, 0.9], 'x... x... xxxx xxxx'),
  ],
};

// 8  Twilight Treetops - D lydian, slow and dreamy, fireflies of bells
THEMES.world8 = {
  id: 'world8',
  bpm: 80,
  tonic: 'D4',
  scale: 'lydian',
  delay: 0.75,
  chords: ['Dmaj7', 'E', 'Dmaj7', 'Bm', 'Dmaj7', 'E', 'F#m', 'A', 'Bm', 'A', 'Dmaj7', 'E', 'F#m', 'E', 'Bm', 'A'],
  tracks: [
    { kind: 'chords', name: 'strings', inst: 'strings', lo: 50, hi: 69, voices: 4, gain: 0.3, rev: 0.6 },
    { kind: 'chords', name: 'pad', inst: 'pad', lo: 45, hi: 64, voices: 3, gain: 0.22, rev: 0.5, gate: [0.3, 0.7] },
    { kind: 'pattern', name: 'bass', inst: 'subBass', oct: 33, pats: ['R--- ---. ..f. ....', 'R--- ---- ---- r---'], gain: 0.5, rev: 0.05 },
    {
      kind: 'melody', name: 'lead', inst: 'softLead', altInst: 'bell', gen: { lo: 66, hi: 86, density: 0.3 }, gain: 0.5, rev: 0.5, dly: 0.25,
      bars: loop16([
        '5:6 3:2 1\':4 7:4',
        '6:4 4:4 2:8',
        '1:2 3:2 5:2 7:2 1\':4 5:4',
        '6:4 5:2 3:2 1:8',
        '3\':4 1\':2 7:2 5:4 3:4',
        '2\':4 7:2 6:2 4:8',
        '3:4 5:4 7:4 5:4',
        '5:4 7:2 2\':2 1\':8',
      ]),
    },
    { kind: 'pattern', name: 'fireflies', lite: true, inst: 'kalimba', oct: 66, pats: ['r... .t.. ...f ....', '.... r... ..t. ....', 't... .... r... .f..'], gain: 0.4, rev: 0.55, dly: 0.35, pan: 0.3, gate: [0, 0.5] },
    drum('brush', 'brush', ['.... x... .... x...'], 0.55, [0.2, 0.5]),
    drum('kick', 'softKick', ['x... .... x... ....'], 0.6, [0.4, 0.65]),
    drum('shaker', 'shaker', ['x.x. x.x. x.x. x.x.'], 0.45, [0.5, 0.8]),
  ],
};

// 9  Volcanic Jungle - D phrygian, driving and hot, brass stabs over a pounding pulse
THEMES.world9 = {
  id: 'world9',
  bpm: 128,
  tonic: 'D4',
  scale: 'phrygian',
  delay: 0.75,
  chords: ['Dm*2', 'Eb', 'Dm', 'Dm*2', 'Eb', 'C', 'Gm', 'Dm', 'Bb', 'Eb', 'C', 'Dm*2', 'A'],
  tracks: [
    { kind: 'chords', name: 'strings', inst: 'strings', lo: 48, hi: 69, voices: 4, gain: 0.3, rev: 0.3 },
    { kind: 'pattern', name: 'bass', inst: 'synthBass', oct: 33, pats: ['R.R. R.r. R.R. f.r.', 'R.R. R.r. R.rR .f.r'], gain: 0.55, rev: 0.03 },
    {
      kind: 'melody', name: 'lead', inst: 'brass', altInst: 'softLead', gen: { lo: 62, hi: 81, density: 0.55 }, gain: 0.5, rev: 0.25, dly: 0.12,
      bars: loop16([
        '1:2 1:2 3:2 5:2 6:2 5:2 3:4',
        "1:2 1:2 3:2 5:2 1':6 r:2",
        "2:2 2:2 4:2 6:2 2':4 6:4",
        "1':4 7:2 6:2 5:4 r:4",
        '1:2 1:2 3:2 5:2 6:2 5:2 3:4',
        "5:2 6:2 5:2 3:2 1:4 3:4",
        "4:2 4:2 6:2 1':2 4':4 1':4",
        "5:4 #7:2 1':2 2':8",
      ]),
    },
    { kind: 'pattern', name: 'stabs', lite: true, inst: 'brass', oct: 55, pats: ['r... ..r. r... ..r.', 'r... ..t. r... ..f.'], gain: 0.35, rev: 0.2, len: 0.4, gate: [0.3, 0.7] },
    drum('kick', 'kick', ['X... X... X... X...', 'X... X... X... X..x'], 0.75, [0, 0.3]),
    drum('taiko', 'taiko', ['X... .... ..x. ....'], 0.65, [0.35, 0.7]),
    drum('snare', 'snare', ['.... X... .... X...'], 0.65, [0.2, 0.5], 'x.x. x.x. xxxx xxxx'),
    drum('hat', 'hat', ['x.xx x.xx x.xx x.xo'], 0.4, [0.3, 0.6]),
    { ...drum('ohat', 'ohat', ['..x. ..x. ..x. ..x.'], 0.35, [0.55, 0.85]), lite: true },
    drum('crash', 'crash', ['X... .... .... ....'], 0.45, [0.6, 0.95]),
  ],
};

// 10  Stormy Highlands Fortress - C minor, Iron-Claw's motif on low brass, slow thunder drums
THEMES.world10 = {
  id: 'world10',
  bpm: 120,
  tonic: 'C4',
  scale: 'minor',
  delay: 0.75,
  chords: ['Cm*2', 'Ab', 'G', 'Cm*2', 'Fm', 'G', 'Cm', 'Ab', 'Bb', 'G', 'Cm', 'Fm', 'G*2'],
  tracks: [
    { kind: 'chords', name: 'strings', inst: 'strings', lo: 45, hi: 67, voices: 4, gain: 0.34, rev: 0.4 },
    { kind: 'chords', name: 'choir', inst: 'choir', lo: 55, hi: 74, voices: 3, gain: 0.3, rev: 0.6, gate: [0.45, 0.9] },
    { kind: 'pattern', name: 'bass', inst: 'synthBass', oct: 36, pats: ['R.R. R.r. R.R. R.f.', 'R... R... R.r. f.r.'], gain: 0.55, rev: 0.03 },
    {
      kind: 'melody', name: 'lead', inst: 'brass', altInst: 'softLead', gen: { lo: 55, hi: 77, density: 0.4 }, gain: 0.5, rev: 0.4, dly: 0.12,
      bars: loop16([
        ...IRON_CLAW,
        '1:2 1:2 b2:2 1:2 3:4 1:4',
        '5:2 5:2 6:2 5:2 3:4 1:4',
        "4:4 6:4 1':4 6:4",
        "5:4 #7:2 2':2 4':4 2':4",
      ]),
    },
    drum('taiko', 'taiko', ['X... .... .... ..x.', 'X... .... x... ....'], 0.7, [0.05, 0.4]),
    drum('timp', 'timpani', ['.... .... X... ....'], 0.55, [0.3, 0.7]),
    drum('kick', 'kick', ['X... .... X... ....', 'X... .... X... ..x.'], 0.65, [0.35, 0.65]),
    drum('snare', 'snare', ['.... X... .... X...'], 0.6, [0.5, 0.8], 'x.x. x.x. xxxx xxxx'),
    drum('hat', 'hat', ['x.x. x.x. x.x. x.xo'], 0.4, [0.55, 0.9]),
    drum('crash', 'crash', ['X... .... .... ....'], 0.45, [0.7, 1]),
  ],
};

// ---------------------------------------------------------------------------------------------
// BOSSES: four flavours, faster and heavier than the worlds; the last carries Iron-Claw's motif
// ---------------------------------------------------------------------------------------------

interface BossSpec {
  id: string;
  bpm: number;
  tonic: string;
  scale: Theme['scale'];
  chords: string[];
  hook: string[];
  lead: 'brass' | 'softLead';
  alt: 'softLead' | 'steelpan' | 'pluck';
  gen: { lo: number; hi: number };
  choir?: boolean;
}

function bossTheme(s: BossSpec): Theme {
  const choirTrack: Track[] = s.choir ? [{ kind: 'chords', name: 'choir', inst: 'choir', lo: 55, hi: 74, voices: 3, gain: 0.3, rev: 0.55, gate: [0.3, 0.8] }] : [];
  return {
    id: s.id,
    bpm: s.bpm,
    tonic: s.tonic,
    scale: s.scale,
    delay: 0.75,
    level: 0.85,
    chords: s.chords,
    tracks: [
      { kind: 'chords', name: 'strings', inst: 'strings', lo: 45, hi: 69, voices: 3, gain: 0.34, rev: 0.3 },
      ...choirTrack,
      { kind: 'pattern', name: 'bass', inst: 'synthBass', oct: 33, pats: ['R.Rr R.Rr R.Rf R.r.', 'R.Rr R.Rr R.R. f.r.'], gain: 0.55, rev: 0.03 },
      { kind: 'melody', name: 'lead', inst: s.lead, altInst: s.alt, bars: loop16(s.hook), gen: { ...s.gen, density: 0.6 }, gain: 0.52, rev: 0.25, dly: 0.12 },
      { kind: 'pattern', name: 'arp', lite: true, inst: 'pluck', oct: 57, pats: ['r.t. f.t. r.t. f.t.', 't.f. r.f. t.f. r.s.'], gain: 0.3, rev: 0.15, dly: 0.1, pan: 0.2, gate: [0.4, 0.8] },
      drum('kick', 'kick', ['X... .... X... ..x.', 'X..x .... X... ....'], 0.8, [0, 0.2]),
      drum('taiko', 'taiko', ['X... .... .... ....', 'X... .... ..x. ....'], 0.65, [0.1, 0.45]),
      drum('snare', 'snare', ['.... X... .... X...'], 0.65, [0.1, 0.4], 'x.x. x.x. xxxx xxxx'),
      drum('hat', 'hat', ['x.xx x.xx x.xx x.xo'], 0.42, [0.3, 0.6]),
      drum('tom', 'tom', ['.... .... ..x. xx..'], 0.55, [0.55, 0.85]),
      { ...drum('ohat', 'ohat', ['..x. ..x. ..x. ..x.'], 0.35, [0.6, 0.9]), lite: true },
      drum('crash', 'crash', ['X... .... .... ....'], 0.5, [0.5, 0.9]),
    ],
  };
}

THEMES.bossA = bossTheme({
  id: 'bossA',
  bpm: 138,
  tonic: 'A4',
  scale: 'minor',
  chords: ['Am', 'Am', 'F', 'G', 'Am', 'Am', 'Dm', 'E', 'Am', 'F', 'G', 'Em', 'F', 'G', 'E', 'E'],
  hook: [
    '1:2 1:2 3:2 1:2 5:4 3:4',
    '1:2 1:2 3:2 1:2 6:4 5:4',
    '6:4 5:4 3:4 1:4',
    '7:4 5:4 2:4 7:4',
    "1':4 7:2 6:2 5:4 3:4",
    "3:2 5:2 1':4 7:2 6:2 5:4",
    "4:4 6:4 1':4 6:4",
    "5:4 #7:2 1':2 #7:4 5:4",
  ],
  lead: 'brass',
  alt: 'softLead',
  gen: { lo: 64, hi: 84 },
});

THEMES.bossB = bossTheme({
  id: 'bossB',
  bpm: 146,
  tonic: 'E4',
  scale: 'phrygian',
  chords: ['Em', 'Em', 'F', 'Em', 'Em', 'Em', 'F', 'G', 'Em', 'F', 'Em', 'D', 'Em', 'F', 'G', 'F'],
  hook: [
    '1:2 1:2 2:2 1:2 3:4 1:4',
    '1:2 1:2 2:2 1:2 5:4 3:4',
    '2:4 4:4 6:4 4:4',
    '5:4 3:4 2:4 1:4',
    "1':2 7:2 6:2 5:2 3:4 5:4",
    "1:2 3:2 5:2 3:2 1':8",
    "2':4 1':2 7:2 6:4 4:4",
    '3:4 5:4 7:4 5:4',
  ],
  lead: 'brass',
  alt: 'steelpan',
  gen: { lo: 60, hi: 82 },
});

THEMES.bossC = bossTheme({
  id: 'bossC',
  bpm: 152,
  tonic: 'D4',
  scale: 'minor',
  chords: ['Dm', 'Dm', 'Bb', 'C', 'Dm', 'Dm', 'Gm', 'A', 'Dm', 'Bb', 'C', 'Dm', 'Bb', 'Gm', 'A', 'A'],
  hook: [
    "1:3 1:1 3:2 5:2 1':4 5:4",
    '1:3 1:1 3:2 5:2 6:4 5:4',
    "6:4 1':4 3':4 1':4",
    '7:4 5:4 4:4 2:4',
    '5:2 5:2 6:2 5:2 3:4 1:4',
    "1:2 3:2 5:2 3:2 1':8",
    "4:4 6:4 1':4 6:4",
    "5:4 #7:4 2':4 #7:4",
  ],
  lead: 'brass',
  alt: 'pluck',
  gen: { lo: 62, hi: 84 },
  choir: true,
});

THEMES.bossFinal = bossTheme({
  id: 'bossFinal',
  bpm: 156,
  tonic: 'C4',
  scale: 'minor',
  chords: ['Cm', 'Cm', 'Ab', 'G', 'Cm', 'Cm', 'Fm', 'G', 'Cm', 'Ab', 'Bb', 'G', 'Cm', 'Fm', 'G', 'G'],
  hook: [
    ...IRON_CLAW,
    '1:2 1:2 b2:2 1:2 3:4 1:4',
    '5:2 5:2 6:2 5:2 3:4 1:4',
    "4:4 6:4 1':4 6:4",
    "5:4 #7:2 2':2 4':4 2':4",
  ],
  lead: 'brass',
  alt: 'softLead',
  gen: { lo: 55, hi: 79 },
  choir: true,
});

// ---------------------------------------------------------------------------------------------
// MENUS, MAP AND RESULTS
// ---------------------------------------------------------------------------------------------

// Title: Pokey's theme made grand, warm and unhurried
THEMES.title = {
  id: 'title',
  bpm: 100,
  tonic: 'C4',
  scale: 'major',
  delay: 0.75,
  chords: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G', 'Am', 'F', 'C', 'G', 'Am', 'Dm', 'G', 'G7'],
  tracks: [
    { kind: 'chords', name: 'strings', inst: 'strings', lo: 50, hi: 71, voices: 4, gain: 0.34, rev: 0.5 },
    { kind: 'pattern', name: 'harp', inst: 'harp', oct: 55, pats: ['r.t.f.t.o.f.t.f.', 'r.t.f.o.f.t.f.t.'], gain: 0.5, rev: 0.4, dly: 0.12, pan: -0.25 },
    { kind: 'pattern', name: 'bass', inst: 'subBass', oct: 36, pats: ['R--- ---. ..r. ....'], gain: 0.5, rev: 0.05 },
    { kind: 'melody', name: 'lead', inst: 'marimba', altInst: 'flute', bars: loop16(SLOMATT_A), gen: { lo: 64, hi: 84, density: 0.4 }, gain: 0.65, rev: 0.4, dly: 0.2 },
    { kind: 'pattern', name: 'sparkle', lite: true, inst: 'bell', oct: 72, pats: ['.... .... t... ....', '..r. .... .... f...'], gain: 0.35, rev: 0.6, dly: 0.3, pan: 0.3, gate: [0.2, 0.7] },
    { kind: 'chords', name: 'choir', inst: 'choir', lo: 55, hi: 72, voices: 3, gain: 0.26, rev: 0.6, gate: [0.5, 1] },
    drum('kick', 'softKick', ['x... .... x... ....'], 0.55, [0.3, 0.6]),
    drum('shaker', 'shaker', ['.x.x .x.x .x.x .x.x'], 0.5, [0.2, 0.5]),
    drum('rim', 'rim', ['.... x... .... x...'], 0.45, [0.5, 0.8]),
  ],
};

// World map: a jaunty "where next?" walking tune
THEMES.map = {
  id: 'map',
  bpm: 112,
  tonic: 'G4',
  scale: 'major',
  swing8: 0.14,
  delay: 0.75,
  chords: ['G', 'C', 'G', 'D', 'G', 'C', 'D', 'G', 'Em', 'C', 'G', 'D', 'Em', 'C', 'D', 'G'],
  tracks: [
    { kind: 'chords', name: 'pad', inst: 'pad', lo: 50, hi: 69, voices: 3, gain: 0.26, rev: 0.4 },
    { kind: 'pattern', name: 'bass', inst: 'bass', oct: 36, pats: ['R... ..r. R... ..f.', 'R.r. ..f. R... r...'], gain: 0.55, rev: 0.05 },
    {
      kind: 'melody', name: 'lead', inst: 'pluck', altInst: 'marimba', gen: { lo: 67, hi: 86, density: 0.45 }, gain: 0.7, rev: 0.3, dly: 0.2,
      bars: loop16([
        "1:2 3:2 5:2 3:2 1':4 5:4",
        "4:2 6:2 1':2 6:2 5:4 4:4",
        "3:2 5:2 7:2 5:2 3:4 1:4",
        "5:2 7:2 2':2 7:2 5:8",
        "1':3 7:1 5:2 3:2 5:4 r:4",
        "6:3 5:1 4:2 6:2 1':4 r:4",
        "7:2 2':2 5':2 2':2 7:2 5:2 2:4",
        "1':4 5:4 3:4 1:4",
      ]),
    },
    { kind: 'pattern', name: 'comp', lite: true, inst: 'marimba', oct: 57, pats: ['.... t..t .... t..t', '..t. ..f. ..t. ..f.'], gain: 0.4, rev: 0.2 },
    drum('kick', 'softKick', ['x... .... x... ....', 'x... .... x... ..x.'], 0.6, [0.1, 0.35]),
    drum('congaHi', 'congaHi', ['.... x... .x.. x.x.'], 0.5),
    drum('shaker', 'shaker', ['x.x. x.x. x.x. x.xx'], 0.5, [0.15, 0.4]),
    drum('rim', 'rim', ['.... x... .... x...'], 0.5, [0.4, 0.7]),
  ],
};

// Results: a short, warm, settled loop (stingers do the fanfare)
THEMES.results = {
  id: 'results',
  bpm: 84,
  tonic: 'F4',
  scale: 'major',
  delay: 0.75,
  chords: ['F', 'Dm', 'Bb', 'C', 'F', 'Am', 'Bb', 'C'],
  tracks: [
    { kind: 'chords', name: 'pad', inst: 'strings', lo: 53, hi: 72, voices: 4, gain: 0.32, rev: 0.5 },
    { kind: 'pattern', name: 'harp', inst: 'harp', oct: 53, pats: ['r.t.f.t. r.t.f.t.'], gain: 0.5, rev: 0.4, dly: 0.15 },
    { kind: 'pattern', name: 'bass', inst: 'subBass', oct: 36, pats: ['R--- ---- ..f. ....'], gain: 0.45, rev: 0.05 },
    {
      kind: 'melody', name: 'lead', inst: 'bell', altInst: 'kalimba', gen: { lo: 72, hi: 88, density: 0.3 }, gain: 0.5, rev: 0.5, dly: 0.25,
      bars: [
        "5:4 3:4 1':4 3':4",
        "6:6 5:2 3:4 1:4",
        "4:4 6:4 1':4 6:4",
        "7:4 5:4 2':8",
        "1':4 7:4 5:4 3:4",
        "3:4 5:4 1':8",
        "6:4 1':4 4':4 1':4",
        "5':8 2':8",
      ],
    },
    drum('brush', 'brush', ['.... x... .... x...'], 0.5, [0.4, 0.8]),
  ],
};

// Game over: slow, sad and short; Pokey's theme in minor, barely there
THEMES.gameover = {
  id: 'gameover',
  bpm: 60,
  tonic: 'A4',
  scale: 'minor',
  delay: 0.75,
  chords: ['Am', 'F', 'C', 'G'],
  tracks: [
    { kind: 'chords', name: 'pad', inst: 'strings', lo: 45, hi: 66, voices: 4, gain: 0.34, rev: 0.6 },
    { kind: 'melody', name: 'lead', inst: 'kalimba', bars: ['5:4 3:4 1:8', '6,:4 1:4 3:8', '1:4 3:4 5:8', '7,:4 2:4 4:8'], gain: 0.5, rev: 0.6, dly: 0.3 },
    { kind: 'pattern', name: 'sub', inst: 'subBass', oct: 33, pats: ['R--- ---- ---- ----'], gain: 0.45, rev: 0.05 },
  ],
};

// ---------------------------------------------------------------------------------------------
// STORY
// ---------------------------------------------------------------------------------------------

// The story scores are composed (see composer.ts): each one is a long form (32 to 44 bars at a slow tempo, a
// minute and a half or more before it turns over) that starts almost bare, builds layer by layer to a climax and
// settles again, so a cutscene never loops while you are still reading it.
THEMES.jennifur = composeStory('jennifur');
THEMES.storyDusk = composeStory('dusk');
THEMES.storyStorm = composeStory('storm');
THEMES.ending = composeStory('ending');

/** a piece by id: written (THEMES) or composed on demand ('gen-<world>-<seed>') */
/** which world's instrument flavour (see orchestrate.ts) each written non-world piece uses */
const FLAVOUR_OF: Record<string, number> = { bossA: 5, bossB: 7, bossC: 9, bossFinal: 10, title: 1, map: 2, results: 1, gameover: 3 };

/** 'world3~c' is the written world 3 theme dressed in the orchestra for a climbing stage; 'bossB~b', 'title~c' and the like work the same way (see orchestrate.ts) */
function orchestratedById(id: string): Theme | null {
  const m = /^([A-Za-z]+)(\d{0,2})~([a-z])$/.exec(id);
  const pace = m ? paceFromCode(m[3]) : null;
  const base = m ? THEMES[m[1] + m[2]] : undefined;
  if (!m || !pace || !base) return null;
  const world = m[1] === 'world' ? Number(m[2]) : FLAVOUR_OF[m[1]] ?? 1;
  return { ...orchestrate(base, { world, pace, seed: 0 }), id };
}
export const themeById = (id: string): Theme | null => THEMES[id] ?? signatureById(id) ?? themeFromId(id) ?? orchestratedById(id) ?? scoreById(id);

/** which theme plays for each world (1..10) and for its boss */
export const WORLD_THEME = (world: number) => `world${Math.max(1, Math.min(10, world))}`;
/** the boss follows the act: A the Trail, B the Cost, C the Iron Road, and the last world's own */
export const BOSS_THEME = (world: number) => (world >= 10 ? 'bossFinal' : world >= 8 ? 'bossC' : world >= 4 ? 'bossB' : 'bossA');
