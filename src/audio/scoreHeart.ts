/**
 * The warm pieces of the story score: the ones that carry the lullaby and the people who love it.
 *   meeca    the lullaby itself, as she sings it in a memory (6/8, D major)
 *   tender   a quiet happy memory: the lullaby a fourth higher in G, a music box above it, answered by Grandma
 *   sorrow   the lullaby with its light taken away: the very same notes under the relative minor's chords, a solo cello
 * Each is built from the motifs in motifs.ts; scoreKit.ts has the grid tools.
 */
import type { Theme } from './music.ts';
import { dyn, lullaby, LULLABY_CHORDS, LULLABY_ECHO, octave } from './motifs.ts';
import { chords, easeOut, lay, maskOf, melody, mrest, pattern, piece, prest, same, type Grid } from './scoreKit.ts';

/** "slow is not stopped" counted in 6/8, four bars: the climb, the second climb, the leading tone that hangs, and the tonic that arrives late */
export const GRANDMA_68 = ['1:4 2:2 3:6', '5:6 7:6', '7:10 r:2', "1':12"];
/** the chords under it (in G) */
const GRANDMA_68_CHORDS = ['G', 'Gmaj7', 'D', 'G'];

// ───────────────────────────────────────────── meeca ─────────────────────────────────────────────

/**
 * 30 bars of 6/8 at dotted-quarter 56 (about a minute): two bars of the harp rocking, the song sung bare (flute), sung again (clarinet,
 * a cello underneath), sung a third time with the strings and a flute above, then the first line once more, softly, and settling.
 * Every verse slows a little in its last two bars and then goes on again.
 */
export function meeca(): Theme {
  const g: Grid = { spb: 12, bars: 30 };
  const mr = mrest(g);
  const pr = prest(g);
  const MJ = [...LULLABY_CHORDS.major];
  const names = ['D', 'D', ...MJ, 'D', 'D/F#', 'Bm', 'A/C#', 'G', 'Em7', 'A', 'D', ...MJ, 'D', 'D', 'Dadd9', 'Dadd9'];
  const tempoMap = easeOut(30, 8, 2, 0.9, 2, 26);
  tempoMap[28] = 0.92;
  tempoMap[29] = 0.84;
  const song = (lv: number[]) => dyn(lullaby('68'), lv);
  const rock = 'R.t.f.O.f.t.';
  return piece({ id: 'score_meeca', bpm: 84, tonic: 'D4', scale: 'major', chords: names, grid: g, level: 0.95, tempoMap }, [
    // the cradle: a harp rocking one-two-three, four-five-six, all through
    pattern('harp', 'harp', 48, lay(g, pr, [0, same(29, rock)], [29, 'r...f...o...']), { gain: 0.4, rev: 0.42, dly: 0.1, pan: -0.2 }),
    // low notes underneath once the second verse begins
    pattern('bass', 'contra', 36, lay(g, pr, [10, same(16, 'R-----f-----')], [26, same(4, 'R-----------')]), { gain: 0.26, rev: 0.06, gate: [0.1, 0.4] }),
    // the strings: a warm bed under the second verse, and lower still under the third so that the violins' tune sits clear above them
    chords('strings', 'orchStrings', 45, 64, maskOf(g, [10, 17], [26, 29]), { gain: 0.22, rev: 0.6, voices: 3, gate: [0.2, 0.5] }),
    chords('stringsLow', 'orchStrings', 38, 55, maskOf(g, [18, 25]), { gain: 0.2, rev: 0.6, voices: 3, gate: [0.2, 0.5] }),
    chords('horns', 'orchBrass', 41, 60, maskOf(g, [18, 25]), { gain: 0.16, rev: 0.6, voices: 3, gate: [0.4, 0.75], lite: true }),
    // the song, three times: flute alone, clarinet, and the violins with a flute above and a cello below
    melody('verse1', 'flute', lay(g, mr, [2, song([4, 4, 5, 5, 6, 7, 5, 3])]), { gain: 0.72, rev: 0.4, dly: 0.12, legato: 1.02 }),
    melody('verse2', 'clarinet', lay(g, mr, [10, song([5, 5, 6, 6, 7, 8, 6, 4])]), { gain: 0.72, rev: 0.4, legato: 1.02 }),
    melody('verse3', 'violins', lay(g, mr, [18, song([6, 6, 7, 7, 8, 9, 7, 5])]), { gain: 0.7, rev: 0.5, legato: 1.02 }),
    melody('verse3Flute', 'flute', lay(g, mr, [18, octave(song([5, 5, 6, 6, 7, 8, 6, 4]), 1)]), { gain: 0.4, rev: 0.5, legato: 1.02, gate: [0.45, 0.8], lite: true }),
    melody('cello', 'cello', lay(g, mr, [10, octave(song([4, 4, 5, 5, 6, 6, 5, 3]), -1)]), { gain: 0.4, rev: 0.4, legato: 1.02, gate: [0.25, 0.55] }),
    // the first line again, and the last note
    melody('tag', 'flute', lay(g, mr, [26, [LULLABY_ECHO[0], LULLABY_ECHO[1], '1:12@2']]), { gain: 0.65, rev: 0.55, dly: 0.2, legato: 1.02 }),
  ]);
}

// ───────────────────────────────────────────── tender ─────────────────────────────────────────────

/**
 * A quiet happy memory. G major, 6/8, a little lighter than the song. 26 bars:
 *   2 bars   a harp
 *   8 bars   the lullaby, a clarinet on the tune and a music box two octaves above it
 *   8 bars   Grandma's phrase, "slow is not stopped": the cello says it, then the clarinet says it higher
 *   4 bars   the lullaby's first half again
 *   4 bars   its first line, a flute, and the last note
 */
export function tender(): Theme {
  const g: Grid = { spb: 12, bars: 26 };
  const mr = mrest(g);
  const pr = prest(g);
  // the lullaby's chords a fourth up (D->G, Bm->Em, A->D, G->C, Em->Am)
  const LU = ['G', 'G', 'Em', 'D', 'C', 'Am7', 'D', 'G'];
  const names = ['G', 'G', ...LU, ...GRANDMA_68_CHORDS, ...GRANDMA_68_CHORDS, ...LU.slice(0, 4), 'G', 'G', 'Gadd9', 'Gadd9'];
  const slow = new Map([[8, 0.95], [9, 0.9], [16, 0.95], [17, 0.9], [23, 0.93], [24, 0.86], [25, 0.8]]);
  const tempoMap = Array.from({ length: g.bars }, (_, i) => slow.get(i) ?? 1);
  const tune = dyn(lullaby('68'), [4, 4, 5, 5, 6, 6, 5, 3]);
  const grandma = dyn(GRANDMA_68, [5, 6, 6, 5]);
  const echo = octave(LULLABY_ECHO, 1);
  return piece({ id: 'score_tender', bpm: 78, tonic: 'G3', scale: 'major', chords: names, grid: g, level: 0.95, tempoMap }, [
    pattern('harp', 'harp', 55, lay(g, pr, [0, same(2, 'r...f...o...')], [2, same(20, 'r.t.f.o.f.t.')], [22, same(2, 'r...f...o...')]), { gain: 0.42, rev: 0.4, dly: 0.12, pan: -0.15 }),
    chords('strings', 'orchStrings', 48, 67, maskOf(g, [2, 25]), { gain: 0.22, rev: 0.6, voices: 3, gate: [0.1, 0.4] }),
    pattern('bass', 'cello', 36, lay(g, pr, [2, same(24, 'R-----f-----')]), { gain: 0.22, rev: 0.12, gate: [0.15, 0.4] }),
    // a clarinet sings the tune low and warm (and Grandma's phrase a second time, an octave up); a music box doubles the tune two octaves up, a half-remembered shimmer
    melody('clarinet', 'clarinet', lay(g, mr, [2, tune], [14, octave(grandma, 1)], [18, tune.slice(0, 4)]), { gain: 0.68, rev: 0.4, legato: 1.02 }),
    melody('musicBox', 'harp', lay(g, mr, [2, octave(tune, 2)], [18, octave(tune.slice(0, 4), 2)]), { gain: 0.3, rev: 0.55, dly: 0.25, pan: 0.25, gate: [0.1, 0.4], lite: true }),
    // Grandma: the cello first
    melody('grandma', 'cello', lay(g, mr, [10, grandma]), { gain: 0.62, rev: 0.4, legato: 1.02 }),
    melody('tag', 'flute', lay(g, mr, [22, [echo[0], echo[1], "1':12@2"]]), { gain: 0.55, rev: 0.55, dly: 0.2, legato: 1.02 }),
  ]);
}

// ───────────────────────────────────────────── sorrow ─────────────────────────────────────────────

/**
 * Grief. The lullaby's own notes are B minor's pentatonic scale, so under the relative minor's chords (B minor, F# minor, E minor, none of them
 * with a leading tone) it is the same song with the light gone. A solo cello an octave below, a harp that only sighs a rising chord once a bar,
 * a viola pad in the second verse, and one violin that cries out at the thorn. 24 bars, dotted-quarter 44.
 */
export function sorrow(): Theme {
  const g: Grid = { spb: 12, bars: 24 };
  const mr = mrest(g);
  const pr = prest(g);
  const LA = [...LULLABY_CHORDS.lament];
  // verse, verse, then a tag of Bm, F#m7, Em, Bm and two bars of nothing but the ring
  const names = ['Bm', 'Bm', ...LA, ...LA, 'Bm', 'F#m7', 'Em', 'Bm', 'Bm', 'Bm'];
  const slow = new Map([[8, 0.94], [9, 0.86], [16, 0.94], [17, 0.86], [20, 0.92], [21, 0.84], [22, 0.74], [23, 0.7]]);
  const tempoMap = Array.from({ length: g.bars }, (_, i) => slow.get(i) ?? 1);
  const v1 = dyn(lullaby('68'), [3, 3, 4, 4, 5, 6, 4, 2]);
  const v2 = dyn(lullaby('68'), [4, 4, 5, 5, 6, 8, 5, 3]);
  const sigh = 'R.t.f.o.....';
  const tag = ['1:4@3 2:2@2 3:6@3', '3:8@2 2:4@2', '3:6@2 2:6@1', '1:12@1'];
  return piece({ id: 'score_sorrow', bpm: 66, tonic: 'D4', scale: 'major', chords: names, grid: g, level: 1, tempoMap }, [
    pattern('harp', 'harp', 43, lay(g, pr, [0, same(24, sigh)]), { gain: 0.42, rev: 0.5, dly: 0.08, pan: -0.15 }),
    pattern('bass', 'contra', 33, lay(g, pr, [10, same(8, 'R-----------')], [18, same(2, 'R-----------')]), { gain: 0.3, rev: 0.08, gate: [0.1, 0.4] }),
    chords('violas', 'orchStrings', 45, 64, maskOf(g, [10, 23]), { gain: 0.22, rev: 0.65, voices: 3, gate: [0.15, 0.5] }),
    // the cello, an octave below the song
    melody('cello', 'cello', lay(g, mr, [2, octave(v1, -1)], [10, octave(v2, -1)], [18, octave(tag, -1)]), { gain: 0.55, rev: 0.45, legato: 1.03 }),
    // the one cry: a violin takes up the climb (the thorn, "slow the thorn that") an octave above the cello
    melody('cry', 'violins', lay(g, mr, [14, v2.slice(4, 6)]), { gain: 0.4, rev: 0.6, legato: 1.03, gate: [0.2, 0.5] }),
  ]);
}
