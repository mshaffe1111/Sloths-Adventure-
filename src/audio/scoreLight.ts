/**
 * The bright and gentle pieces of the story score, each built from the leitmotifs in motifs.ts:
 *   pokey    "Slow and Steady" in F: a bassoon plodding it out over a pizzicato walk, a wry oboe answering in the rests
 *   bloom    the Heartbloom: a bud (a bare open fifth) that gains its ninth and its third as the music fills, until the lullaby rings from it
 *   grandma  "slow is not stopped": a cello and a clarinet climbing, the leading tone held, the tonic arriving late
 *   journey  the petal trail in D: the same little arpeggio on every chord of the scale, bright, forward, curious
 *   comedy   pizzicato and bassoon in A, and one wrong note held a beat too long for a laugh
 *   triumph  Pokey's theme in D with the whole orchestra
 * scoreKit.ts has the grid tools; a track's `gain` is its place in the mix (see VOICE_TRIM_DB).
 */
import type { Theme } from './music.ts';
import { DOT, dyn, GRANDMA, lullaby, octave, POKEY, stepBy } from './motifs.ts';
import { chords, drums, lay, maskOf, melody, mrest, pattern, piece, prest, same, type Grid } from './scoreKit.ts';

// ───────────────────────────────────────────── pokey ─────────────────────────────────────────────

/**
 * 32 bars of 4/4 at 88: the eight-bar tune four times. The bassoon plods it out an octave down, then a clarinet says it again over a harp with
 * an oboe answering in the rests, then a flute with the strings, then the low strings and a horn, slowing at the very end.
 */
export function pokey(): Theme {
  const g: Grid = { spb: 16, bars: 32 };
  const mr = mrest(g);
  const pr = prest(g);
  // the tune's own harmony (I V I IV I V IV I), moved to F
  const H = ['F', 'C', 'F', 'Bb', 'F', 'C', 'Bb', 'F'];
  const names = [...H, ...H, ...H, ...H];
  const tempoMap = Array.from({ length: g.bars }, (_, i) => (i === 30 ? 0.93 : i === 31 ? 0.84 : 1));
  const tune = dyn(POKEY, [6, 6, 7, 6, 7, 7, 6, 7]);
  // the rests at the end of bars 0 1 2 3 and 6 of the tune get a little answer: two notes falling a third, a raised eyebrow
  const wry = (a: string, b: string) => `r:12 ${a}:2@4 ${b}:2@4`;
  const answers = [wry('3', '1'), wry('2', '7,'), wry('3', '1'), wry('4', '6,'), mr, mr, wry('4', '6,'), mr];
  // a bassoon line under the clarinet: root and fifth, half notes
  const under = ['1,:8@5 5,:8@5', '5,:8@5 2,:8@5', '1,:8@5 3,:8@5', '4,:8@5 6,:8@5', '1,:8@5 5,:8@5', '5,:8@5 2,:8@5', '4,:8@5 1,:8@5', '1,:16@5'];
  return piece({ id: 'score_pokey', bpm: 88, tonic: 'F4', scale: 'major', chords: names, grid: g, level: 1, tempoMap }, [
    // the plod: root, fifth, root, fifth, one to a beat
    pattern('plod', 'celloStac', 41, same(32, 'R...f...r...f...'), { gain: 0.5, rev: 0.12 }),
    pattern('harp', 'harp', 53, lay(g, pr, [8, same(24, '..t...f...t...f.')]), { gain: 0.34, rev: 0.4, dly: 0.1, pan: -0.2, gate: [0.15, 0.45] }),
    chords('strings', 'orchStrings', 46, 65, maskOf(g, [16, 31]), { gain: 0.24, rev: 0.6, voices: 3, gate: [0.3, 0.6] }),
    chords('horn', 'orchBrass', 41, 58, maskOf(g, [24, 31]), { gain: 0.16, rev: 0.55, voices: 3, gate: [0.45, 0.8], lite: true }),
    // the tune: bassoon, clarinet, flute, and cello with the bassoon
    melody('bassoon', 'bassoon', lay(g, mr, [0, octave(tune, -1)]), { gain: 0.7, rev: 0.25, legato: 0.85 }),
    melody('clarinet', 'clarinet', lay(g, mr, [8, tune]), { gain: 0.68, rev: 0.3, dly: 0.08, legato: 0.88 }),
    melody('flute', 'flute', lay(g, mr, [16, tune]), { gain: 0.66, rev: 0.35, dly: 0.12, legato: 0.9 }),
    melody('cello', 'cello', lay(g, mr, [24, octave(tune, -1)]), { gain: 0.6, rev: 0.3, legato: 0.92 }),
    melody('bassoonLow', 'bassoon', lay(g, mr, [24, octave(tune, -1)]), { gain: 0.5, rev: 0.25, legato: 0.85 }),
    melody('under', 'bassoon', lay(g, mr, [8, under]), { gain: 0.45, rev: 0.25, legato: 0.98 }),
    melody('wry', 'oboe', lay(g, mr, [8, answers], [16, answers]), { gain: 0.34, rev: 0.4, legato: 0.8, pan: 0.2, gate: [0.1, 0.4] }),
    drums('triangle', 'triangle', lay(g, '................', [16, same(16, '....x.......x...')]), { gain: 0.26, gate: [0.4, 0.7] }),
  ]);
}

// ───────────────────────────────────────────── bloom ─────────────────────────────────────────────

/**
 * The Heartbloom grows with the music's intensity, and what grows is the lullaby's own opening: D, E, F# (1 2 3) is the root, the ninth and the third of a
 * D major chord. 24 bars of 4/4 at 56, D major.
 *   bud       a harp that plays only the root and the fifth, over and over: an open fifth that is neither major nor minor
 *   sprout    the ninth (a bell) comes in
 *   bloom     the third arrives (in the harp and the bell): it is a major chord, it is open; strings
 *   epic      the lullaby itself, high in the bells, with a flute
 *   ultimate  a choir and horns under it
 * Bars 0-7 are the growth; 8-15 and 16-23 are the lullaby, in the bells.
 */
export function bloom(): Theme {
  const g: Grid = { spb: 16, bars: 24 };
  const mr = mrest(g);
  const pr = prest(g);
  const grow = ['Dadd9', 'Dadd9', 'Gmaj7', 'Gmaj7', 'Bm7', 'Bm7', 'Aadd9', 'Aadd9'];
  const song = ['Dadd9', 'Dadd9', 'Bm7', 'Aadd9', 'Gmaj7', 'Em7', 'Aadd9', 'Dadd9'];
  const names = [...grow, ...song, ...song];
  const tempoMap = Array.from({ length: g.bars }, (_, i) => (i === 22 ? 0.93 : i === 23 ? 0.85 : 1));
  const tune = octave(lullaby('44'), 1);
  const rep = (n: number, ab: [string, string]) => Array.from({ length: n }, () => ab).flat();
  return piece({ id: 'score_bloom', bpm: 56, tonic: 'D4', scale: 'major', chords: names, grid: g, level: 1, tempoMap }, [
    // the bud: root and fifth
    pattern('bud', 'harp', 50, same(24, 'R.......f.......'), { gain: 0.42, rev: 0.5, dly: 0.12, pan: -0.15 }),
    // the sprout and the bloom: the ninth (chord tone 3) and the third (chord tone 1) join the harp
    pattern('sprout', 'harp', 62, same(24, '....s.......s...'), { gain: 0.3, rev: 0.55, dly: 0.2, pan: 0.2, gate: [0.15, 0.4] }),
    pattern('third', 'harp', 55, same(24, '..t.......t.....'), { gain: 0.32, rev: 0.5, dly: 0.1, pan: -0.25, gate: [0.35, 0.6] }),
    // the same growth in the bells, one note to two beats: 1 5 | 2 3 (D A E F#)
    melody('bellBud', 'bell', lay(g, mr, [0, rep(4, ['1:8@4 5:8@4', 'r:16'])]), { gain: 0.34, rev: 0.6, dly: 0.2, legato: 1 }),
    melody('bellSprout', 'bell', lay(g, mr, [0, rep(4, ['r:16', "2':8@4 r:8"])]), { gain: 0.34, rev: 0.6, dly: 0.2, legato: 1, gate: [0.2, 0.4] }),
    melody('bellBloom', 'bell', lay(g, mr, [0, rep(4, ['r:16', "r:8 3':8@5"])]), { gain: 0.36, rev: 0.6, dly: 0.2, legato: 1, gate: [0.4, 0.6] }),
    // the lullaby rings from it
    melody('song', 'bell', lay(g, mr, [8, dyn(tune, [4, 4, 5, 5, 5, 5, 4, 3])], [16, dyn(tune, [5, 5, 6, 6, 6, 6, 5, 4])]), { gain: 0.5, rev: 0.6, dly: 0.25, legato: 1, gate: [0.1, 0.35] }),
    melody('flute', 'flute', lay(g, mr, [16, dyn(tune, [4, 4, 5, 5, 6, 6, 5, 3])]), { gain: 0.34, rev: 0.55, legato: 1.02, gate: [0.55, 0.8], lite: true }),
    chords('strings', 'orchStrings', 45, 64, maskOf(g, [4, 23]), { gain: 0.2, rev: 0.65, voices: 3, gate: [0.4, 0.65] }),
    chords('choir', 'choir', 50, 69, maskOf(g, [8, 23]), { gain: 0.24, rev: 0.7, voices: 3, gate: [0.65, 0.9] }),
    chords('horns', 'orchBrass', 41, 58, maskOf(g, [16, 23]), { gain: 0.15, rev: 0.6, voices: 3, gate: [0.85, 1], lite: true }),
    drums('chime', 'triangle', lay(g, '................', [8, same(16, 'x...............')]), { gain: 0.2, gate: [0.5, 0.8] }),
    pattern('bass', 'cello', 38, lay(g, pr, [8, same(16, 'R---------------')]), { gain: 0.22, rev: 0.2, gate: [0.45, 0.7] }),
  ]);
}

// ───────────────────────────────────────────── grandma ─────────────────────────────────────────────

/**
 * "slow is not stopped". 16 bars of 4/4 at 66, G major. The cello says the phrase (the climb, the leading tone that hangs, the tonic that
 * arrives late) and the answer, a clarinet says it again an octave up, the violins and the cello say it together, and the last time the
 * leading tone is held for a bar and a half before the tonic comes.
 */
export function grandma(): Theme {
  const g: Grid = { spb: 16, bars: 16 };
  const mr = mrest(g);
  const pr = prest(g);
  const names = ['G', 'D', 'Em', 'C', 'G', 'D', 'Am7', 'D', 'G', 'D', 'Em', 'C', 'G', 'D', 'Gmaj7', 'Gadd9'];
  const tempoMap = Array.from({ length: g.bars }, (_, i) => (i === 7 ? 0.95 : i === 13 ? 0.94 : i === 14 ? 0.9 : i === 15 ? 0.82 : 1));
  const [m0, m1] = GRANDMA;
  // the answer that settles: down from the tonic (G F# E D), then the C chord's seventh and back to the ninth
  const answer1 = ["1':6@6 7:2@5 6:4@5 5:4@5", '4:8@6 3:4@5 5:4@4'];
  const answer2 = ["6':4@6 5':4@5 3':4@5 2':4@5", "5':8@5 2':8@4"];
  // the last statement: the climb, then the leading tone held for a whole bar, then some more, and the tonic arrives at the half of the next
  const late = [m0, '7:16@7', "7:6@6 r:2 1':8@9", '1:16@6'];
  return piece({ id: 'score_grandma', bpm: 66, tonic: 'G3', scale: 'major', chords: names, grid: g, level: 1, tempoMap }, [
    pattern('harp', 'harp', 43, same(16, 'r.t.f.t.r.t.f.t.'), { gain: 0.36, rev: 0.45, dly: 0.12, pan: -0.2 }),
    pattern('bass', 'contra', 31, same(16, 'R-------f-------'), { gain: 0.26, rev: 0.1, gate: [0.3, 0.55] }),
    chords('strings', 'orchStrings', 43, 62, maskOf(g, [4, 15]), { gain: 0.22, rev: 0.6, voices: 3, gate: [0.3, 0.6] }),
    // the cello says it
    melody('cello', 'cello', lay(g, mr, [0, [m0, m1, ...answer1]], [8, [m0, m1, ...answer1]], [12, late]), { gain: 0.66, rev: 0.4, legato: 1.02 }),
    // the clarinet says it an octave up, and the answer
    melody('clarinet', 'clarinet', lay(g, mr, [4, [...octave([m0, m1], 1), ...answer2]], [12, octave([m0], 1)]), { gain: 0.6, rev: 0.4, legato: 1.02 }),
    // the violins sing the phrase with the cello the third time
    melody('violins', 'violins', lay(g, mr, [8, octave([m0, m1], 1)], [12, octave([m0, '7:16@7', "7:6@6 r:2 1':8@9", '1:16@6'], 1)]), { gain: 0.5, rev: 0.5, legato: 1.02, gate: [0.45, 0.7] }),
    melody('flute', 'flute', lay(g, mr, [14, octave(["r:8 1':8@9", '1:16@6'], 1)]), { gain: 0.4, rev: 0.55, legato: 1.02, gate: [0.6, 0.85], lite: true }),
    drums('timp', 'timpani', lay(g, '................', [14, 'x...............'], [15, '................']), { gain: 0.3, gate: [0.6, 0.9] }),
  ]);
}

// ───────────────────────────────────────────── journey ─────────────────────────────────────────────

/** one bar of the bright little arpeggio (root third fifth third fifth octave) on the triad of scale degree `d` */
const arp = (d: number) => stepBy(['1:2 3:2 5:4 3:2 5:2 1\':4'], d - 1)[0];
/** the same notes in groups of three, three, three, three, two, two: the accent falls in different places */
const arp3 = (d: number) => stepBy(['1:3 3:3 5:3 3:3 5:2 1\':2'], d - 1)[0];

/**
 * The petal trail. 32 bars of 4/4 at 116, D major. The tune is one little arpeggio played on the chord of each bar (I V vi IV), the
 * second half a falling line; then the trail turns (the same arpeggio on vi IV I V, accented differently) and comes home.
 */
export function journey(): Theme {
  const g: Grid = { spb: 16, bars: 32 };
  const mr = mrest(g);
  const pr = prest(g);
  const A = ['D', 'A', 'Bm', 'G', 'D', 'A', 'G', 'A'];
  const B = ['Bm', 'G', 'D', 'A', 'Bm', 'G', 'A', 'A'];
  const names = [...A, ...A, ...B, ...A.slice(0, 7), 'D'];
  const tempoMap = Array.from({ length: g.bars }, (_, i) => (i === 30 ? 0.95 : i === 31 ? 0.88 : 1));
  const tuneA = [arp(1), arp(5), arp(6), arp(4), "3':6@7 2':2@6 1':4@7 5:4@6", '7:6@7 6:2@6 5:4@6 7:4@6', "6:4@7 1':4@7 4':8@8", "2':8@7 7:4@6 5:4@6"];
  const tuneB = [arp3(6), arp3(4), arp3(1), arp3(5), arp3(6), arp3(4), "5:4@7 7:4@7 2':8@8", "5:4@7 7:4@7 2':8@7"];
  const tuneEnd = [...tuneA.slice(0, 7), "1':16@8"];
  const soft = (bars: string[]) => bars.map((b) => b.replace(/@\d/g, '@5'));
  return piece({ id: 'score_journey', bpm: 116, tonic: 'D4', scale: 'major', chords: names, grid: g, level: 1, tempoMap }, [
    pattern('harp', 'harp', 50, same(32, 'r.t.f.t.r.t.f.t.'), { gain: 0.4, rev: 0.35, dly: 0.12, pan: -0.25 }),
    pattern('pizz', 'violinStac', 62, same(32, '..f...t...f...t.'), { gain: 0.3, rev: 0.25, pan: 0.25, gate: [0.15, 0.4] }),
    pattern('bass', 'celloStac', 38, same(32, 'R...r...f...r...'), { gain: 0.46, rev: 0.1 }),
    chords('strings', 'orchStrings', 45, 66, maskOf(g, [8, 31]), { gain: 0.22, rev: 0.55, voices: 3, gate: [0.3, 0.6] }),
    chords('horns', 'orchBrass', 41, 60, maskOf(g, [24, 31]), { gain: 0.15, rev: 0.5, voices: 3, gate: [0.5, 0.85], lite: true }),
    melody('flute', 'flute', lay(g, mr, [0, tuneA]), { gain: 0.66, rev: 0.3, dly: 0.12, legato: 0.92 }),
    melody('clarinet', 'clarinet', lay(g, mr, [8, tuneA]), { gain: 0.6, rev: 0.3, legato: 0.92 }),
    melody('descant', 'flute', lay(g, mr, [8, octave(soft(tuneA), 1)]), { gain: 0.28, rev: 0.4, dly: 0.16, legato: 0.9, gate: [0.35, 0.65], lite: true }),
    melody('oboe', 'oboe', lay(g, mr, [16, tuneB]), { gain: 0.62, rev: 0.3, legato: 0.9 }),
    melody('violins', 'violins', lay(g, mr, [16, soft(tuneB)]), { gain: 0.4, rev: 0.4, legato: 0.92, gate: [0.4, 0.7] }),
    melody('flute2', 'flute', lay(g, mr, [24, tuneEnd]), { gain: 0.64, rev: 0.3, dly: 0.12, legato: 0.92 }),
    melody('violins2', 'violins', lay(g, mr, [24, soft(tuneEnd)]), { gain: 0.44, rev: 0.4, legato: 0.92, gate: [0.3, 0.6] }),
    drums('timp', 'timpani', lay(g, '................', [16, same(16, 'x.......x.......')]), { gain: 0.32, gate: [0.5, 0.8] }),
    drums('tri', 'triangle', lay(g, '................', [8, same(24, '..x...x...x...x.')]), { gain: 0.18, gate: [0.45, 0.75] }),
  ]);
}

// ───────────────────────────────────────────── comedy ─────────────────────────────────────────────

/**
 * Light and bouncy: 32 bars of 4/4 at 126, A major. A pizzicato oom-pah and a clarinet with a tune of staccato eighths; the tune comes
 * round again on an oboe over a walking bassoon; and every time it nears its end it lands on a note a semitone off (A#, over an A chord)
 * and holds it a beat too long before it slips down to A. In the middle, a flute runs up and a bassoon answers with a low grunt, and Dot flutters by.
 */
export function comedy(): Theme {
  const g: Grid = { spb: 16, bars: 32 };
  const mr = mrest(g);
  const pr = prest(g);
  const A = ['A', 'A', 'D', 'E', 'A', 'D', 'E', 'A'];
  const call = ['A', 'A', 'D', 'D', 'E', 'E', 'A', 'A'];
  const names = [...A, ...A, ...call, ...A];
  const tempoMap = Array.from({ length: g.bars }, (_, i) => (i === 31 ? 0.9 : 1));
  const tune = dyn([
    '5:2 5:2 3:2 5:2 1\':4 r:4',
    '3:2 3:2 2:2 3:2 5:4 r:4',
    '6:2 6:2 4:2 6:2 1\':4 r:4',
    '7:2 7:2 5:2 7:2 2\':4 r:4',
    "1':2 7:2 1':2 3':2 5':4 3':4",
    "4':2 3':2 4':2 6:2 1':4 6:4",
    '5:2 7:2 2\':2 7:2 5:2 7:2 2\':4',
    "3':2 2':2 #1':8 1':2 r:2",
  ], [6, 6, 6, 6, 7, 6, 6, 7]);
  // the same tune with its wrong note, pushed along: the oboe plays the second time
  const run = (d: number) => stepBy(["1:2 2:2 3:2 4:2 5:2 4:2 3:2 2:2"], d - 1)[0];
  const grunt = (d: number) => stepBy(['r:8 1,:4 5,:4'], d - 1)[0];
  const up = (bar: string) => octave([bar], 1)[0];
  const callBars = [up(run(1)), grunt(1), up(run(4)), grunt(4), up(run(5)), grunt(5), up(run(1)), DOT[0]];
  return piece({ id: 'score_comedy', bpm: 126, tonic: 'A3', scale: 'major', chords: names, grid: g, level: 1, tempoMap }, [
    // oom-pah
    pattern('oom', 'celloStac', 40, same(32, 'R.......f.......'), { gain: 0.5, rev: 0.1 }),
    pattern('pah', 'violinStac', 64, same(32, '....tf......tf..'), { gain: 0.3, rev: 0.2, pan: 0.25 }),
    pattern('walk', 'bassoon', 43, lay(g, pr, [8, same(8, 'R.f.r.t.f.r.t.f.')], [24, same(8, 'R.f.r.t.f.r.t.f.')]), { gain: 0.4, rev: 0.15, len: 0.4, gate: [0.15, 0.4] }),
    melody('clarinet', 'clarinet', lay(g, mr, [0, tune]), { gain: 0.66, rev: 0.25, legato: 0.55 }),
    melody('oboe', 'oboe', lay(g, mr, [8, tune]), { gain: 0.62, rev: 0.25, legato: 0.55 }),
    melody('flute', 'flute', lay(g, mr, [16, callBars.map((b, i) => (i % 2 === 0 || i === 7 ? b : mr))]), { gain: 0.6, rev: 0.3, legato: 0.6 }),
    melody('bassoonCall', 'bassoon', lay(g, mr, [16, callBars.map((b, i) => (i % 2 === 1 && i !== 7 ? b : mr))]), { gain: 0.6, rev: 0.2, legato: 0.6 }),
    melody('flute2', 'flute', lay(g, mr, [24, octave(tune, 1)]), { gain: 0.6, rev: 0.3, legato: 0.55 }),
    melody('marimba', 'marimba', lay(g, mr, [24, tune]), { gain: 0.34, rev: 0.25, legato: 0.5, gate: [0.3, 0.6] }),
    drums('wood', 'woodblock', same(32, 'x...x...x...x...'), { gain: 0.24, gate: [0.5, 0.8] }),
    drums('tri', 'triangle', lay(g, '................', [8, same(24, '..x...x...x...x.')]), { gain: 0.16, gate: [0.4, 0.7] }),
  ]);
}

// ───────────────────────────────────────────── triumph ─────────────────────────────────────────────

/**
 * A win. Pokey's theme in D major with the whole orchestra: horns an octave below the violins, timpani, a harp running under it, then a
 * second time with the bells and a crash, and a broad closing cadence. 20 bars of 4/4 at 112.
 */
export function triumph(): Theme {
  const g: Grid = { spb: 16, bars: 20 };
  const mr = mrest(g);
  const pr = prest(g);
  const H = ['D', 'A', 'D', 'G', 'D', 'A', 'G', 'D'];
  const names = [...H, ...H, 'G', 'A', 'D', 'D'];
  const tempoMap = Array.from({ length: g.bars }, (_, i) => (i === 18 ? 0.92 : i === 19 ? 0.8 : 1));
  const tune = dyn(POKEY, [7, 7, 8, 7, 8, 8, 7, 8]);
  const tag = ["6:4@8 1':4@8 4':8@9", "7:4@8 2':4@8 5':8@9", "1':4@8 3':4@8 5':8@9", "1':16@9"];
  return piece({ id: 'score_triumph', bpm: 112, tonic: 'D4', scale: 'major', chords: names, grid: g, level: 1, tempoMap }, [
    chords('strings', 'orchStrings', 45, 66, maskOf(g, [0, 19]), { gain: 0.3, rev: 0.5, voices: 3, gate: [0.1, 0.4] }),
    chords('brass', 'orchBrass', 38, 58, maskOf(g, [8, 19]), { gain: 0.2, rev: 0.5, voices: 3, gate: [0.2, 0.55] }),
    pattern('bass', 'tuba', 35, same(20, 'R.......f.......'), { gain: 0.34, rev: 0.1 }),
    pattern('harp', 'harp', 50, same(20, 'r.t.f.o.f.t.r.t.'), { gain: 0.34, rev: 0.4, dly: 0.12, gate: [0.1, 0.4] }),
    // the theme: violins (and the clarinet) over horns an octave down
    melody('violins', 'violins', lay(g, mr, [0, tune], [8, tune], [16, tag]), { gain: 0.66, rev: 0.45, legato: 0.95 }),
    melody('horn', 'horn', lay(g, mr, [0, octave(tune, -1)], [8, octave(tune, -1)]), { gain: 0.58, rev: 0.4, legato: 0.92 }),
    melody('flute', 'flute', lay(g, mr, [8, octave(tune, 1)], [16, octave(tag, 1)]), { gain: 0.34, rev: 0.4, legato: 0.92, gate: [0.3, 0.6] }),
    melody('bells', 'bell', lay(g, mr, [8, octave(tune, 1)], [16, octave(tag, 1)]), { gain: 0.24, rev: 0.6, dly: 0.2, legato: 1, gate: [0.45, 0.75], lite: true }),
    drums('timp', 'timpani', lay(g, '................', [0, same(20, 'X.......x...x...')]), { gain: 0.5 }),
    drums('snare', 'snare', lay(g, '................', [4, same(12, '....x.......x.xx')], [16, same(3, '....x.......x.xx')]), { gain: 0.26, gate: [0.3, 0.6] }),
    drums('crash', 'crash', lay(g, '................', [8, 'X...............'], [16, 'X...............'], [19, 'X...............']), { gain: 0.34, gate: [0.2, 0.5] }),
    drums('tri', 'triangle', lay(g, '................', [8, same(8, '..x...x...x...x.')]), { gain: 0.16, gate: [0.45, 0.75] }),
  ]);
}
