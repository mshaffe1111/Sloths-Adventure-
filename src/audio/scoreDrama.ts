/**
 * The dark, tense and large pieces of the story score, each built from the leitmotifs in motifs.ts (nothing here is a new tune):
 *   hush     almost nothing: a bare open fifth held under a lonely clarinet that sings the lullaby's first line and, much later, its last
 *   dread    low strings and a slow heartbeat; the creeping flat second of the Iron-Claw figure; the General's march only hinted, never played through
 *   war      the Iron March: the lullaby in the minor, counted square, slow, on trombone and timpani and tuba. It is the General's song with its lights out
 *   chase    driving low strings and a galloping pulse; Pokey's tune (cut short, breathless) tries to get out and the iron figure keeps catching it
 *   reveal   a suspended chord that turns (the sus4 falls to the flat third, the chord of the march); the lullaby is sung and its last notes are withheld
 *   resolve  Pokey's tune, small and steady in a cello; Grandma's four rising notes climbing under it; then both together, brave and growing
 *   mercy    the Iron March slowly unlocking into the major lullaby: the same notes, the sixth rising back first (the thorn), then the third, then the lilt
 *   finale   the whole lullaby in the major with the Heartbloom growing from its bare seed to its widest chord; tender and large, not a fanfare
 * scoreKit.ts has the grid tools; a track's `gain` is its place in the mix (see VOICE_TRIM_DB). Nothing in the foreground of these pieces is a bell
 * or a pluck: the voices are strings, woodwinds, low brass and soft timpani, and the harp stays low.
 */
import type { Theme } from './music.ts';
import { dyn, GRANDMA, IRON_FIGURE, lullaby, octave, POKEY, POKEY_BREATHLESS, stepBy } from './motifs.ts';
import { chords, drums, lay, maskOf, melody, mrest, pattern, piece, prest, same, type Grid } from './scoreKit.ts';

/** the Iron March's tune: the lullaby in the minor, counted square (declared in D harmonic minor, so the third and the sixth are already flat) */
const MARCH = lullaby('sq', { scale: 'harmonicMinor', mode: 'minor' });

// ───────────────────────────────────────────── hush ─────────────────────────────────────────────

/**
 * 12 bars of 4/4 at 44. A bare open fifth, D and A with no third (neither glad nor sad), held by the strings at the edge of hearing under a low
 * double bass note. A single clarinet sings the lullaby's first line (bars 2-3), is quiet for a long time, and sings its last line (bars 8-9),
 * the very last note barely there. The middle of the song is missing, as it is from a memory.
 */
export function hush(): Theme {
  const g: Grid = { spb: 16, bars: 12 };
  const mr = mrest(g);
  const pr = prest(g);
  const names = ['D5', 'D5', 'D5', 'D5', 'D5', 'D5', 'D5', 'D5', 'A5', 'D5', 'D5', 'D5'];
  const tempoMap = Array.from({ length: g.bars }, (_, i) => (i === 3 ? 0.94 : i === 9 ? 0.9 : i === 10 ? 0.84 : i === 11 ? 0.8 : 1));
  const song = lullaby('44');
  const first = dyn(song.slice(0, 2), [2, 2]);
  const last = dyn(song.slice(6, 8), [2, 1]);
  return piece({ id: 'score_hush', bpm: 44, tonic: 'D4', scale: 'major', chords: names, grid: g, level: 1, tempoMap }, [
    // the held fifth, and a bass note under it
    chords('hold', 'orchStrings', 45, 62, maskOf(g, [0, 11]), { gain: 0.07, rev: 0.7, voices: 2 }),
    pattern('floor', 'contra', 38, same(12, 'R---------------'), { gain: 0.1, rev: 0.1 }),
    // the lullaby, a line at the start and a line at the end
    melody('voice', 'clarinet', lay(g, mr, [2, first], [8, last]), { gain: 0.15, rev: 0.6, dly: 0.1, legato: 1.03 }),
  ]);
}

// ───────────────────────────────────────────── dread ─────────────────────────────────────────────

/**
 * Something is coming. 16 bars of 4/4 at 50, D harmonic minor. A double bass on the root, a bed of low strings, a slow heartbeat in the timpani.
 * A cello creeps the Iron-Claw figure (D, the flat second E-flat leaning on it, D, the leading tone below, D). From bar 4 a low horn hints at the
 * March, two bars of it over D minor and later four over the March's own chords (Dm, Dm, B-flat, A), and stops: the General is not here yet.
 * A single thin violin holds the flat second high above, and the double bass walks a slow stalking pizzicato once the threat is close.
 */
export function dread(): Theme {
  const g: Grid = { spb: 16, bars: 16 };
  const mr = mrest(g);
  const pr = prest(g);
  const names = ['Dm', 'Dm', 'Eb', 'Dm', 'Dm', 'Dm', 'Bb', 'A', 'Dm', 'Dm', 'Eb', 'Dm', 'Dm', 'Dm', 'Bb', 'A'];
  const tempoMap = Array.from({ length: g.bars }, (_, i) => (i === 15 ? 0.94 : 1));
  const creep = dyn(IRON_FIGURE, [3, 3]);
  const high = ["b2'':16@2", "b2'':16@3"];
  return piece({ id: 'score_dread', bpm: 50, tonic: 'D3', scale: 'harmonicMinor', chords: names, grid: g, level: 1, tempoMap }, [
    pattern('pedal', 'contra', 34, same(16, 'R---------------'), { gain: 0.5, rev: 0.08 }),
    chords('bed', 'orchStrings', 38, 57, maskOf(g, [0, 15]), { gain: 0.2, rev: 0.6, voices: 3 }),
    drums('heart', 'timpani', same(16, 'x..o............'), { gain: 0.34 }),
    // the creeping figure, twice, in the cello
    melody('creep', 'cello', lay(g, mr, [0, creep], [2, creep], [8, creep], [10, creep]), { gain: 0.5, rev: 0.4, legato: 1.0 }),
    // the March, hinted: two bars, and later four, and then it stops
    melody('hint', 'horn', lay(g, mr, [4, dyn(MARCH.slice(0, 2), [3, 3])], [12, dyn(MARCH.slice(0, 4), [3, 3, 4, 4])]), { gain: 0.5, rev: 0.5, legato: 0.92, gate: [0.15, 0.4] }),
    // the thin high note above it all
    melody('thin', 'violins', lay(g, mr, [6, same(2, high[0])], [14, same(2, high[1])]), { gain: 0.26, rev: 0.7, legato: 1.02, gate: [0.25, 0.5], lite: true }),
    pattern('stalk', 'contraPizz', 38, lay(g, pr, [4, same(4, 'R.........R.....')], [12, same(4, 'R.........R.....')]), { gain: 0.34, rev: 0.2, gate: [0.3, 0.55], lite: true }),
    drums('heart2', 'timpani', same(16, '........o.......'), { gain: 0.28, gate: [0.4, 0.6] }),
  ]);
}

// ───────────────────────────────────────────── war ─────────────────────────────────────────────

/**
 * The Iron March. 16 bars of 4/4 at 64, D minor: the lullaby's eight bars, square, twice. Trombone (and then the horn with it) low on the tune, the tuba
 * on the beat, timpani on one and three with a drum that does not hurry, brass chords under it, a snare tramp and a cello-stac step as the
 * piece fills. Heavy and slow, never loud for the sake of it; the second time round a viola line leans on the flat second above.
 */
export function war(): Theme {
  const g: Grid = { spb: 16, bars: 16 };
  const mr = mrest(g);
  const pr = prest(g);
  const HM = ['Dm', 'Dm', 'Bb', 'A', 'Gm', 'Em7b5', 'A', 'Dm'];
  const names = [...HM, ...HM];
  const tempoMap = Array.from({ length: g.bars }, (_, i) => (i === 7 ? 0.95 : i === 15 ? 0.92 : 1));
  const tune = dyn(MARCH, [6, 6, 6, 7, 7, 7, 7, 6]);
  const tune2 = dyn(MARCH, [7, 7, 7, 8, 8, 8, 8, 7]);
  return piece({ id: 'score_war', bpm: 64, tonic: 'D4', scale: 'harmonicMinor', chords: names, grid: g, level: 1, tempoMap }, [
    chords('brass', 'orchBrass', 38, 57, maskOf(g, [0, 15]), { gain: 0.2, rev: 0.5, voices: 3 }),
    pattern('tuba', 'tuba', 34, lay(g, pr, [0, same(8, 'R.......r.......')], [8, same(8, 'R...r...R...r...')]), { gain: 0.44, rev: 0.1 }),
    drums('timp', 'timpani', same(16, 'X.......x.......'), { gain: 0.46 }),
    drums('bdrum', 'bassDrum', lay(g, '................', [8, same(8, 'X...............')]), { gain: 0.34, gate: [0.45, 0.65] }),
    drums('snare', 'snare', lay(g, '................', [8, same(8, '............o.x.')]), { gain: 0.2, gate: [0.5, 0.7] }),
    pattern('step', 'celloStac', 38, lay(g, pr, [4, same(12, 'R...r...R...r...')]), { gain: 0.34, rev: 0.12, gate: [0.35, 0.55] }),
    drums('gong', 'gong', lay(g, '................', [0, 'o...............'], [8, 'x...............']), { gain: 0.26, gate: [0.3, 0.5] }),
    // the tune: trombone alone, then trombone and horn on it, and the violas above
    melody('trombone', 'trombone', lay(g, mr, [0, octave(tune, -1)], [8, octave(tune2, -1)]), { gain: 0.56, rev: 0.3, legato: 0.88 }),
    melody('horn', 'horn', lay(g, mr, [8, octave(tune2, -1)]), { gain: 0.36, rev: 0.3, legato: 0.88, gate: [0.4, 0.6] }),
    melody('violas', 'violas', lay(g, mr, [8, tune2]), { gain: 0.32, rev: 0.4, legato: 0.9, gate: [0.55, 0.75], lite: true }),
  ]);
}

// ───────────────────────────────────────────── chase ─────────────────────────────────────────────

/**
 * Run. 24 bars of 4/4 at 152, D harmonic minor, in three eight-bar rounds. Staccato cellos drive in eighths over a pizzicato bass on the beat,
 * timpani on the beat with a roll in the fourth bar of every four, a snare on two and four. Pokey's tune, cut short and breathless, is carried
 * by the bassoon, then the clarinet, then the oboe and flute, then clarinet and oboe together; every time it nears its end the iron figure (D, E-flat, D,
 * C#, D) falls on it from the horns and the tune has to start again. In the last four bars it trips twice and gives up on a held low D.
 */
export function chase(): Theme {
  const g: Grid = { spb: 16, bars: 24 };
  const mr = mrest(g);
  // every four bars of the tune (D minor, the dominant, D minor or B-flat, G minor) are harmonized as its notes lean; the last round ends on the tonic
  const A = ['Dm', 'A', 'Dm', 'Gm', 'Dm', 'A', 'Dm', 'Gm'];
  const B = ['Dm', 'A', 'Bb', 'Gm', 'Dm', 'A', 'Bb', 'Gm'];
  const C = ['Dm', 'A', 'Bb', 'Gm', 'Dm', 'Dm', 'A', 'Dm'];
  const names = [...A, ...B, ...C];
  const tempoMap = Array.from({ length: g.bars }, (_, i) => (i === 22 ? 0.94 : i === 23 ? 0.8 : 1));
  const breath = dyn(POKEY_BREATHLESS, [6, 6, 7, 6]);
  const breathHi = dyn(POKEY_BREATHLESS, [7, 7, 8, 7]);
  // the iron figure at speed (D, E-flat, D, C#, D), begun where the tune has its rest and finished as the tune starts again
  const iron = ['r:10 1:2@6 b2:2@6 1:2@6', '7,:4@6 1:6@7 r:6'];
  // the last four bars: the tune again, it trips, it tries once more, and gives up
  const trip = [
    '5:2@6 5:2@6 6:2@6 5:2@6 3:2@6 r:6',
    '5:2@6 5:2@5 6:2@5 5:2@5 3:2@4 5:2@4 3:2@3 r:2',
    '5:2@5 6:2@4 5:2@4 3:2@3 2:4@3 r:4',
    '1,:12@4 r:4',
  ];
  return piece({ id: 'score_chase', bpm: 152, tonic: 'D4', scale: 'harmonicMinor', chords: names, grid: g, level: 1, tempoMap }, [
    pattern('drive', 'celloStac', 38, same(24, 'R.r.R.r.R.r.R.r.'), { gain: 0.21, rev: 0.1 }),
    pattern('bass', 'contraPizz', 34, same(24, 'R...R...R...R...'), { gain: 0.3, rev: 0.1 }),
    chords('strings', 'orchStrings', 43, 64, maskOf(g, [0, 23]), { gain: 0.17, rev: 0.45, voices: 3 }),
    chords('stabs', 'orchBrass', 41, 58, maskOf(g, [8, 23]), { gain: 0.24, rev: 0.4, voices: 3, stabs: same(24, '......x.......x.'), stabLen: 2, gate: [0.5, 0.8], lite: true }),
    drums('timp', 'timpani', same(24, 'X...x...X...x...'), { gain: 0.34, fill: 'xxxxxxxxxxxxXXXX' }),
    drums('snare', 'snare', lay(g, '................', [4, same(20, '....x.......x...')]), { gain: 0.2, gate: [0.45, 0.75] }),
    drums('crash', 'crash', lay(g, '................', [8, 'X...............'], [16, 'X...............']), { gain: 0.22, gate: [0.5, 0.8] }),
    // Pokey's tune, breathless: round one in the bassoon then the clarinet, round two in the oboe then the flute, round three clarinet and oboe, then it trips
    melody('bassoon', 'bassoon', lay(g, mr, [0, octave(breath, -1)]), { gain: 1.2, rev: 0.2, legato: 0.85 }),
    melody('clarinet', 'clarinet', lay(g, mr, [4, breath], [16, breath], [20, trip]), { gain: 1.15, rev: 0.25, legato: 0.85 }),
    melody('oboe', 'oboe', lay(g, mr, [8, breathHi], [16, breathHi]), { gain: 0.95, rev: 0.25, legato: 0.85 }),
    melody('flute', 'flute', lay(g, mr, [12, breathHi]), { gain: 0.95, rev: 0.3, legato: 0.85 }),
    // the iron figure keeps catching it
    melody('iron', 'horn', lay(g, mr, ...[3, 7, 11, 15, 19].map((b): [number, string[]] => [b, octave(iron, -1)])), { gain: 0.4, rev: 0.3, legato: 0.85 }),
  ]);
}

// ───────────────────────────────────────────── reveal ─────────────────────────────────────────────

/**
 * A secret turns over. 14 bars of 4/4 at 50, D major. Two bars of suspended chords (D sus2, then sus4) over a low harp and a bass note; then the lullaby
 * is sung by a clarinet, but only as far as its climb ("slow the thorn", bar 7): its last two bars, the fall home, are withheld (bars 8-9 are an A sus4
 * that resolves to A and no further). Then the chord turns: G minor where the song had G major, and B-flat, the March's own chord; a cello tries the
 * fall ("that holds you...") and stops on the second note of the scale without ever landing on the tonic. The loop ends hanging on A.
 */
export function reveal(): Theme {
  const g: Grid = { spb: 16, bars: 14 };
  const mr = mrest(g);
  const names = ['Dsus2', 'Dsus4', 'Dsus2', 'D', 'Bm7', 'A', 'G', 'Em7', 'Asus4', 'A', 'Gm', 'Bb', 'Asus4', 'A'];
  const tempoMap = Array.from({ length: g.bars }, (_, i) => (i === 7 ? 0.94 : i === 8 ? 0.9 : i === 9 ? 0.86 : i === 11 ? 0.92 : i === 13 ? 0.88 : 1));
  const song = lullaby('44');
  const sung = dyn(song.slice(0, 6), [3, 3, 4, 4, 5, 5]);
  const sungFlute = dyn(song.slice(4, 6), [3, 3]);
  // the fall, begun and left hanging on the second note of the scale
  const fall = ['5,:4@4 5,:4@4 2:8@5', 'r:16'];
  return piece({ id: 'score_reveal', bpm: 50, tonic: 'D4', scale: 'major', chords: names, grid: g, level: 1, tempoMap }, [
    chords('pad', 'orchStrings', 43, 64, maskOf(g, [0, 13]), { gain: 0.22, rev: 0.65, voices: 3 }),
    pattern('harp', 'harp', 43, same(14, 'r...t...f...t...'), { gain: 0.3, rev: 0.5, dly: 0.12, pan: -0.2 }),
    pattern('bass', 'contra', 36, same(14, 'R---------------'), { gain: 0.3, rev: 0.1 }),
    melody('voice', 'clarinet', lay(g, mr, [2, sung]), { gain: 0.66, rev: 0.45, dly: 0.1, legato: 1.03 }),
    // a flute takes up the climb with the clarinet, in its warm low register
    melody('flute', 'flute', lay(g, mr, [6, sungFlute]), { gain: 0.34, rev: 0.55, legato: 1.03, gate: [0.45, 0.7], lite: true }),
    melody('cello', 'cello', lay(g, mr, [10, fall]), { gain: 0.56, rev: 0.5, legato: 1.0 }),
    chords('horns', 'orchBrass', 41, 58, maskOf(g, [10, 13]), { gain: 0.16, rev: 0.6, voices: 3, gate: [0.4, 0.65], lite: true }),
    drums('roll', 'timpani', lay(g, '................', [9, '........oooooooo'], [10, 'X...............']), { gain: 0.3, gate: [0.35, 0.6] }),
  ]);
}

// ───────────────────────────────────────────── resolve ─────────────────────────────────────────────

/**
 * Pokey decides to keep going. 24 bars of 4/4 at 84, G major, in three rounds of eight that grow:
 *   small     Pokey's tune alone in a cello over a soft timpani step, a bassoon plodding under it
 *   climbing  Grandma's four rising notes ("slow is not stopped") climb in a clarinet and a viola, each time from a higher step of the scale
 *   brave     Pokey's tune in a clarinet over a horn, with the four rising notes as a quick flick in each of its rests, and the strings behind
 * (a scene that enters at a higher intensity hears the strings already in the first round)
 */
export function resolve(): Theme {
  const g: Grid = { spb: 16, bars: 24 };
  const mr = mrest(g);
  const pr = prest(g);
  const H = ['G', 'D', 'G', 'C', 'G', 'D', 'C', 'G'];
  const CLIMB = ['G', 'D', 'Em7', 'Bm', 'D', 'D7', 'G', 'D'];
  const names = [...H, ...CLIMB, ...H];
  const tempoMap = Array.from({ length: g.bars }, (_, i) => (i === 7 ? 0.95 : i === 15 ? 0.94 : i === 22 ? 0.94 : i === 23 ? 0.82 : 1));
  const tune = dyn(POKEY, [5, 5, 6, 5, 6, 6, 5, 6]);
  const tuneUp = dyn(POKEY, [6, 6, 7, 6, 7, 7, 6, 7]);
  // Grandma's phrase climbing: from the tonic, from the third, from the fifth, and the last one an octave up from the tonic
  const [g0, g1] = GRANDMA;
  const climb = [...stepBy([g0, g1], 0), ...stepBy([g0, g1], 2), ...stepBy([g0, g1], 4), ...octave([g0, g1], 1)];
  // in the rests of Pokey's tune (bars 0-3, the last four steps) the four rising notes as a flick: 1 2 3 5 from the chord's root (G, D, G, C)
  const flick = (steps: number) => stepBy(['1:1@6 2:1@6 3:1@7 5:1@8'], steps)[0];
  const flicked = tuneUp.map((b, i) => (i < 4 ? `${b.replace(/ r:4$/, '')} ${flick([0, 4, 0, 3][i])}` : b));
  return piece({ id: 'score_resolve', bpm: 84, tonic: 'G3', scale: 'major', chords: names, grid: g, level: 1, tempoMap }, [
    pattern('step', 'celloStac', 31, same(24, 'R...f...r...f...'), { gain: 0.42, rev: 0.12 }),
    drums('timp', 'timpani', same(24, 'o.......o.......'), { gain: 0.34 }),
    pattern('harp', 'harp', 43, lay(g, pr, [8, same(16, 'r.t.f.t.r.t.f.t.')]), { gain: 0.3, rev: 0.4, dly: 0.1, pan: -0.2, gate: [0.3, 0.55] }),
    chords('stringsEarly', 'orchStrings', 43, 64, maskOf(g, [0, 7]), { gain: 0.2, rev: 0.55, voices: 3, gate: [0.55, 0.8] }),
    chords('strings', 'orchStrings', 43, 64, maskOf(g, [8, 23]), { gain: 0.22, rev: 0.55, voices: 3, gate: [0.25, 0.5] }),
    chords('horns', 'orchBrass', 38, 57, maskOf(g, [16, 23]), { gain: 0.17, rev: 0.5, voices: 3, gate: [0.5, 0.75], lite: true }),
    // small: the cello says the tune
    melody('cello', 'cello', lay(g, mr, [0, tune], [16, octave(tune, -1)]), { gain: 0.66, rev: 0.3, legato: 0.9 }),
    melody('bassoon', 'bassoon', lay(g, mr, [4, octave(tune, -1).slice(4)]), { gain: 0.4, rev: 0.25, legato: 0.88, gate: [0.3, 0.55] }),
    // climbing: Grandma's four notes in a clarinet and a viola
    melody('climb', 'clarinet', lay(g, mr, [8, climb]), { gain: 0.66, rev: 0.4, legato: 1.0 }),
    melody('viola', 'violas', lay(g, mr, [8, climb]), { gain: 0.38, rev: 0.5, legato: 1.0, gate: [0.4, 0.65], lite: true }),
    // brave: the tune up in the clarinet with the flicks, a horn on it, and a flute an octave above it (nothing here goes higher than A5)
    melody('clarinet', 'clarinet', lay(g, mr, [16, flicked]), { gain: 0.66, rev: 0.35, legato: 0.9 }),
    melody('horn', 'horn', lay(g, mr, [16, octave(tune, -1)]), { gain: 0.42, rev: 0.3, legato: 0.9, gate: [0.45, 0.7] }),
    melody('flute', 'flute', lay(g, mr, [16, octave(tuneUp, 1)]), { gain: 0.3, rev: 0.45, legato: 0.9, gate: [0.55, 0.8], lite: true }),
    drums('timpBrave', 'timpani', lay(g, '................', [16, same(8, 'X.......x.......')]), { gain: 0.3, gate: [0.45, 0.7] }),
  ]);
}

// ───────────────────────────────────────────── mercy ─────────────────────────────────────────────

/**
 * The armour opens. 28 bars of 4/4 at 64 (the March's own tempo), in D. The same eight bars of the lullaby, each time a little more free:
 *   bars 0-7    the Iron March: the lullaby in the minor, square, a trombone low on it, timpani on one and three, a tuba, brass chords. At the thorn
 *               (bar 4) the sixth rises back (B-flat to B), the chords turn to G and E minor for two bars and one violin holds that B like light through a
 *               crack; the iron half closes (A, then the long D), but on the last bar the violin's note falls a step to the third, F-sharp, and the chord is D major
 *   bars 8-15   the lullaby with its third risen and its lilt back (the dotted rhythm of the song), still low: a horn takes the tune from the
 *               trombone, a cello under it; the drum has become a soft heartbeat
 *   bars 16-23  the lullaby in the major, as sung: violins and a clarinet on the tune, a flute with them, the horn and the cello under, a harp, the choir
 *   bars 24-27  the first line once more, softly, and the last chord is a bare fifth on the D that the march and the song share, so the loop can begin again
 */
export function mercy(): Theme {
  const g: Grid = { spb: 16, bars: 28 };
  const mr = mrest(g);
  const pr = prest(g);
  const IRON = ['Dm', 'Dm', 'Bb', 'A', 'G', 'Em', 'A', 'D'];
  const GLAD = ['D', 'D', 'Bm', 'A', 'G', 'Em', 'A', 'D'];
  const WARM = ['Dadd9', 'D', 'Bm7', 'Aadd9', 'Gmaj7', 'Em7', 'A', 'Dadd9'];
  const names = [...IRON, ...GLAD, ...WARM, 'Dadd9', 'Gmaj7', 'Dadd9', 'D5'];
  const tempoMap = Array.from({ length: g.bars }, (_, i) => (i === 7 ? 0.9 : i === 15 ? 0.94 : i === 22 ? 0.94 : i === 23 ? 0.9 : i === 25 ? 0.92 : i === 26 ? 0.84 : i === 27 ? 0.76 : 1));
  const minor = lullaby('sq', { mode: 'minor' });
  const sq = lullaby('sq');
  const lilt = lullaby('44');
  // pass one: the March, with the sixth risen back from bar 4 (B instead of B-flat); the third is still flat
  const pass1 = dyn([...minor.slice(0, 4), ...sq.slice(4)], [6, 6, 6, 7, 7, 7, 6, 6]);
  const pass2 = dyn(lilt, [4, 4, 5, 5, 5, 6, 5, 4]);
  const pass3 = dyn(lilt, [6, 6, 7, 7, 7, 8, 7, 5]);
  const tag = [dyn([lilt[0]], [3])[0], dyn([lilt[1]], [3])[0], '1:16@2', 'r:16'];
  // the light through the crack: the risen sixth (B) held over the thorn, then the risen third (F-sharp) on the last bar of the march
  const light = [...same(2, '6:16@3'), mrest(g), '3:16@4'];
  return piece({ id: 'score_mercy', bpm: 64, tonic: 'D4', scale: 'major', chords: names, grid: g, level: 1, tempoMap }, [
    // iron: the brass chords, the tuba, the timpani that becomes a heartbeat, one gong
    chords('brass', 'orchBrass', 38, 57, maskOf(g, [0, 11]), { gain: 0.2, rev: 0.5, voices: 3 }),
    pattern('tuba', 'tuba', 34, lay(g, pr, [0, same(8, 'R.......r.......')]), { gain: 0.44, rev: 0.1 }),
    drums('timp', 'timpani', lay(g, '................', [0, same(7, 'X.......x.......')], [7, 'X...............'], [8, same(8, 'o.......o.......')], [16, same(8, 'o...............')]), { gain: 0.46 }),
    drums('gong', 'gong', lay(g, '................', [4, 'x...............'], [8, 'o...............']), { gain: 0.24, gate: [0.3, 0.5] }),
    // the tune: trombone (iron), horn (warm, same register), violins and clarinet (the song as sung)
    melody('trombone', 'trombone', lay(g, mr, [0, octave(pass1, -1)]), { gain: 0.56, rev: 0.3, legato: 0.9 }),
    melody('ironHorn', 'horn', lay(g, mr, [0, octave(pass1, -1)]), { gain: 0.3, rev: 0.3, legato: 0.9, gate: [0.45, 0.7], lite: true }),
    melody('light', 'violins', lay(g, mr, [4, light]), { gain: 0.34, rev: 0.7, legato: 1.03 }),
    melody('horn', 'horn', lay(g, mr, [8, octave(pass2, -1)], [16, octave(pass3, -1)]), { gain: 0.46, rev: 0.35, legato: 1.02 }),
    melody('cello', 'cello', lay(g, mr, [8, octave(pass2, -1)], [16, octave(pass3, -1)]), { gain: 0.34, rev: 0.4, legato: 1.02 }),
    melody('clarinet', 'clarinet', lay(g, mr, [12, pass2.slice(4)], [16, pass3]), { gain: 0.42, rev: 0.4, legato: 1.03, gate: [0.3, 0.55] }),
    melody('violins', 'violins', lay(g, mr, [16, pass3]), { gain: 0.47, rev: 0.5, legato: 1.03 }),
    melody('flute', 'flute', lay(g, mr, [16, pass3]), { gain: 0.26, rev: 0.55, legato: 1.03, gate: [0.5, 0.8], lite: true }),
    melody('tag', 'flute', lay(g, mr, [24, tag]), { gain: 0.46, rev: 0.6, dly: 0.15, legato: 1.03 }),
    // warmth arriving: strings from the third rising, a harp and the choir for the song
    chords('strings', 'orchStrings', 43, 64, maskOf(g, [8, 27]), { gain: 0.2, rev: 0.6, voices: 3, gate: [0.15, 0.4] }),
    chords('stringsHi', 'orchStrings', 55, 76, maskOf(g, [16, 27]), { gain: 0.16, rev: 0.65, voices: 3, gate: [0.45, 0.75], lite: true }),
    chords('choir', 'choir', 50, 69, maskOf(g, [16, 27]), { gain: 0.2, rev: 0.7, voices: 3, gate: [0.6, 0.9], lite: true }),
    pattern('bass', 'cello', 36, lay(g, pr, [8, same(16, 'R-------f-------')]), { gain: 0.28, rev: 0.15 }),
    pattern('pedal', 'contra', 34, lay(g, pr, [24, same(4, 'R---------------')]), { gain: 0.32, rev: 0.1 }),
    pattern('harp', 'harp', 43, lay(g, pr, [16, same(8, 'r.t.f.o.f.t.r.t.')], [24, same(3, 'r...f...o...f...')]), { gain: 0.3, rev: 0.45, dly: 0.12, pan: -0.2, gate: [0.3, 0.55] }),
  ]);
}

// ───────────────────────────────────────────── finale ─────────────────────────────────────────────

/**
 * The guardians come home. 28 bars of 4/4 at 60, D major: the lullaby in its broad form, three times, and a coda. The piece opens already as the
 * song (a scene reaches this cue at the top of its intensity and is heard for a few panels at most), and the Heartbloom grows inside its first
 * bars exactly as it does in the bloom piece: the first chord is the bare fifth D-A (the bud), the tune climbs D, E, F-sharp (the root, the ninth
 * and the third of D) and the chord of bar 1 is D add9, the bloom. Then:
 *   bars 0-7    the song in the violins and clarinet, the cello under it, horns and strings, a harp
 *   bars 8-15   the same with a horn on the tune, a flute with the violins, the wide strings
 *   bars 16-23  everything: the deep strings and the choir under it, the timpani and a gong
 *   bars 24-27  Grandma's four rising notes, the leading tone that waits and the tonic that arrives at last, on the widest Heartbloom chord there is
 *               (D add9 across four octaves: choir, strings, horns and the double bass)
 */
export function finale(): Theme {
  const g: Grid = { spb: 16, bars: 28 };
  const mr = mrest(g);
  const pr = prest(g);
  const S = ['Dadd9', 'D', 'Bm7', 'Aadd9', 'Gmaj7', 'Em7', 'A', 'Dadd9'];
  // the first bar is the bare fifth (the bud), the second adds the ninth
  const names = ['D5', 'Dadd9', ...S.slice(2), ...S, ...S, 'Dadd9', 'A', 'Dadd9', 'Dadd9'];
  const tempoMap = Array.from({ length: g.bars }, (_, i) => (i === 7 || i === 15 ? 0.95 : i === 23 ? 0.92 : i === 25 ? 0.9 : i === 26 ? 0.84 : i === 27 ? 0.7 : 1));
  const song = lullaby('44');
  const s1 = dyn(song, [5, 5, 6, 6, 6, 7, 6, 4]);
  const s2 = dyn(song, [6, 6, 7, 7, 7, 8, 7, 5]);
  const s3 = dyn(song, [7, 7, 8, 8, 8, 9, 8, 5]);
  const [g0, g1] = GRANDMA;
  const coda = [g0, g1, '1:16@9', '1:16@5'];
  const cadence = ["1':16@9", "1':16@5"];
  return piece({ id: 'score_finale', bpm: 60, tonic: 'D4', scale: 'major', chords: names, grid: g, level: 1, tempoMap }, [
    // the bud, and what grows from it
    chords('strings', 'orchStrings', 43, 64, maskOf(g, [0, 27]), { gain: 0.2, rev: 0.6, voices: 3 }),
    chords('stringsWide', 'orchStrings', 62, 86, maskOf(g, [8, 27]), { gain: 0.14, rev: 0.65, voices: 3, gate: [0.3, 0.6], lite: true }),
    chords('deep', 'orchStrings', 36, 52, maskOf(g, [16, 27]), { gain: 0.18, rev: 0.5, voices: 3, gate: [0.55, 0.8] }),
    chords('horns', 'orchBrass', 41, 60, maskOf(g, [0, 27]), { gain: 0.15, rev: 0.55, voices: 3, gate: [0.35, 0.65], lite: true }),
    chords('choir', 'choir', 50, 74, maskOf(g, [16, 27]), { gain: 0.2, rev: 0.7, voices: 3, gate: [0.7, 0.9], lite: true }),
    pattern('bass', 'cello', 36, same(28, 'R-------f-------'), { gain: 0.28, rev: 0.15 }),
    pattern('pedal', 'contra', 34, same(28, 'R---------------'), { gain: 0.28, rev: 0.1, gate: [0.3, 0.55] }),
    pattern('harp', 'harp', 43, lay(g, pr, [0, same(26, 'r.t.f.o.f.t.r.t.')], [26, same(2, 'r...f...o...f...')]), { gain: 0.3, rev: 0.45, dly: 0.12, pan: -0.2, gate: [0.2, 0.5] }),
    // the song, three times
    melody('violins', 'violins', lay(g, mr, [0, s1], [8, s2], [16, s3]), { gain: 0.46, rev: 0.5, legato: 1.03 }),
    melody('clarinet', 'clarinet', lay(g, mr, [0, s1], [16, s3]), { gain: 0.38, rev: 0.4, legato: 1.03 }),
    melody('cello', 'cello', lay(g, mr, [0, octave(s1, -1)], [8, octave(s2, -1)], [16, octave(s3, -1)]), { gain: 0.3, rev: 0.4, legato: 1.03 }),
    melody('flute', 'flute', lay(g, mr, [8, s2], [16, s3]), { gain: 0.26, rev: 0.55, legato: 1.03, gate: [0.35, 0.65], lite: true }),
    melody('hornTune', 'horn', lay(g, mr, [8, octave(s2, -1)], [16, octave(s3, -1)]), { gain: 0.3, rev: 0.4, legato: 1.03, gate: [0.3, 0.6] }),
    // the coda: Grandma's four rising notes and the tonic that arrives at last
    melody('coda', 'clarinet', lay(g, mr, [24, coda]), { gain: 0.44, rev: 0.45, legato: 1.03 }),
    melody('codaViolins', 'violins', lay(g, mr, [24, [g0, g1]], [26, cadence]), { gain: 0.46, rev: 0.5, legato: 1.03 }),
    melody('codaFlute', 'flute', lay(g, mr, [26, cadence]), { gain: 0.28, rev: 0.55, legato: 1.03, gate: [0.3, 0.6], lite: true }),
    drums('timp', 'timpani', lay(g, '................', [8, 'x...............'], [16, 'X...x...........'], [24, 'X...............'], [26, 'X...............'], [27, 'o...............']), { gain: 0.4 }),
    drums('gong', 'gong', lay(g, '................', [16, 'o...............'], [26, 'x...............']), { gain: 0.2, gate: [0.4, 0.6] }),
  ]);
}
