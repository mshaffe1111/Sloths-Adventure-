/**
 * The eight dramatic pieces of the score (scoreDrama.ts) are built from the story's own tunes, so what makes each of them what it is can be
 * checked in the notes: the right motif is in the right voice at the right bar, the harmony under a tune is one the tune can stand on, the
 * pieces keep clear of the high, plinky voices, and the quiet ones are quiet. (The general contract of every cue is in score.test.ts.)
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { cueId, scoreById } from './score.ts';
import type { StoryCue } from '../game/story.ts';
import { dyn, GRANDMA, IRON_FIGURE, lullaby, octave, parseBar, POKEY, POKEY_BREATHLESS, stepBy } from './motifs.ts';
import { chordPcs, noteMidi, parseChord, parseMelodyBar, SCALES, type Chord } from './theory.ts';
import type { MelodyTrack, Theme } from './music.ts';

const NEW: StoryCue[] = ['hush', 'dread', 'war', 'chase', 'reveal', 'resolve', 'mercy', 'finale'];
const th = (cue: StoryCue): Theme => {
  const t = scoreById(cueId(cue));
  assert.ok(t, cue);
  return t;
};

/** the March: the lullaby in the minor, counted square (the same as scoreDrama.ts builds it) */
const MARCH = lullaby('sq', { scale: 'harmonicMinor', mode: 'minor' });

/** one bar of notation without its dynamics marks: the pitches and the lengths alone */
const bare = (bar: string) => parseBar(bar).map((t) => (t.rest ? `r:${t.len}` : `${t.acc}${t.deg}@${t.oct}:${t.len}`)).join(' ');
const bareAll = (bars: string[]) => bars.map(bare);
const isRest = (bar: string | null) => bar === null || parseBar(bar).every((t) => t.rest);

function track(t: Theme, name: string): MelodyTrack {
  const tr = t.tracks.find((x) => x.name === name);
  assert.ok(tr && tr.kind === 'melody', `${t.id} has a melody track ${name}`);
  return tr;
}
/** the written bars of a melody track from bar `from` for `n` bars */
const bars = (t: Theme, name: string, from: number, n: number) => track(t, name).bars.slice(from, from + n) as string[];
/** the chord under each bar of a piece */
function chordsPerBar(t: Theme): Chord[] {
  const out: Chord[] = [];
  for (const c of t.chords.map(parseChord)) for (let i = 0; i < c.bars; i++) out.push(c);
  return out;
}
/** seconds from the start of a piece to the start of a bar (the tempo map included) */
function secondsTo(t: Theme, bar: number): number {
  const spb = t.stepsPerBar ?? 16;
  let s = 0;
  for (let i = 0; i < bar; i++) s += ((60 / (t.bpm * (t.tempoMap?.[i] ?? 1))) / 4) * spb;
  return s;
}
const totalSeconds = (t: Theme) => secondsTo(t, chordsPerBar(t).length);
/** every note a melody track plays, with the bar it starts in */
function notesOf(t: Theme, tr: MelodyTrack) {
  const spb = t.stepsPerBar ?? 16;
  const out: { midi: number; bar: number; step: number; len: number }[] = [];
  tr.bars.forEach((b, bar) => {
    if (!b) return;
    for (const n of parseMelodyBar(b, noteMidi(t.tonic) + (tr.shift ?? 0), SCALES[t.scale], spb)) if (n.midi !== null) out.push({ midi: n.midi, bar, step: n.step, len: n.len });
  });
  return out;
}
/** how many strong-beat notes (those that start a half-bar and last at least an eighth of it) of a melody are tones of the chord under them */
function strongBeatFit(t: Theme, name: string): { n: number; fit: number } {
  const spb = t.stepsPerBar ?? 16;
  const perBar = chordsPerBar(t);
  let n = 0;
  let fit = 0;
  for (const note of notesOf(t, track(t, name))) {
    if (note.step % (spb / 2) !== 0 || note.len < spb / 8) continue;
    n++;
    if (chordPcs(perBar[note.bar]).includes(((note.midi % 12) + 12) % 12)) fit++;
  }
  return { n, fit };
}

test('the eight pieces are written in the keys and at the speeds of what they are', () => {
  const want: Record<string, { tonic: string; scale: string; bpm: [number, number] }> = {
    hush: { tonic: 'D4', scale: 'major', bpm: [36, 50] },
    dread: { tonic: 'D3', scale: 'harmonicMinor', bpm: [40, 60] },
    war: { tonic: 'D4', scale: 'harmonicMinor', bpm: [54, 76] },
    chase: { tonic: 'D4', scale: 'harmonicMinor', bpm: [140, 170] },
    reveal: { tonic: 'D4', scale: 'major', bpm: [40, 60] },
    resolve: { tonic: 'G3', scale: 'major', bpm: [72, 100] },
    mercy: { tonic: 'D4', scale: 'major', bpm: [54, 76] },
    finale: { tonic: 'D4', scale: 'major', bpm: [52, 72] },
  };
  for (const cue of NEW) {
    const t = th(cue);
    const w = want[cue];
    assert.equal(t.tonic, w.tonic, `${cue} tonic`);
    assert.equal(t.scale, w.scale, `${cue} scale`);
    assert.ok(t.bpm >= w.bpm[0] && t.bpm <= w.bpm[1], `${cue}: ${t.bpm} bpm`);
  }
  // the lullaby's D is the root of everything but the one piece in G, which is the key Pokey's own tune is written in
  assert.deepEqual(NEW.filter((c) => th(c).tonic.startsWith('G')), ['resolve']);
});

test('each piece sounds within the first dozen seconds, and none is longer than two minutes', () => {
  for (const cue of NEW) {
    const t = th(cue);
    const first = Math.min(...t.tracks.filter((x): x is MelodyTrack => x.kind === 'melody').map((x) => Math.max(0, x.bars.findIndex((b) => !isRest(b)))));
    assert.ok(secondsTo(t, first) <= 12, `${cue}: the first tune note is at ${secondsTo(t, first).toFixed(1)} s`);
    const total = totalSeconds(t);
    assert.ok(total >= 28 && total <= 125, `${cue}: ${total.toFixed(1)} s`);
  }
});

test('nothing in these pieces is a bell, a pluck or a mallet, and no melody goes above A5', () => {
  const PINGY = new Set(['bell', 'kalimba', 'marimba', 'steelpan', 'pluck', 'softLead', 'brass', 'synthBass']);
  for (const cue of NEW) {
    const t = th(cue);
    for (const tr of t.tracks) {
      if (tr.kind === 'drums') {
        assert.ok(!['triangle', 'clave', 'woodblock', 'hat', 'ohat', 'shaker', 'rim'].includes(tr.voice), `${cue}/${tr.name}: ${tr.voice} is a tick, not a drum of the orchestra`);
        continue;
      }
      assert.ok(!PINGY.has(tr.inst), `${cue}/${tr.name}: ${tr.inst}`);
      // the harp is a low bed, never out in front
      if (tr.inst === 'harp') assert.ok(tr.gain <= 0.4, `${cue}/${tr.name}: harp at gain ${tr.gain}`);
      if (tr.kind === 'melody') {
        for (const n of notesOf(t, tr)) assert.ok(n.midi <= 81, `${cue}/${tr.name}: MIDI ${n.midi} in bar ${n.bar}`);
      }
    }
  }
});

test('every piece keeps its tune in voices that every phone plays: a melody that is neither gated away nor optional', () => {
  for (const cue of NEW) {
    const t = th(cue);
    const sure = t.tracks.filter((x): x is MelodyTrack => x.kind === 'melody' && !x.gate && !x.lite);
    assert.ok(sure.length >= 1, `${cue}: a melody that is always there`);
    // and the always-there line is not a whisper next to the beds
    if (cue !== 'hush') assert.ok(Math.max(...sure.map((x) => x.gain)) >= 0.5, `${cue}: loudest sure melody ${Math.max(...sure.map((x) => x.gain))}`);
  }
});

test('hush is almost nothing: no drums, no loud voice, the lullaby sung once at the start and once at the end, the middle gone', () => {
  const t = th('hush');
  assert.ok(t.tracks.every((x) => x.kind !== 'drums'), 'no drums');
  for (const tr of t.tracks) assert.ok(tr.gain <= 0.2, `${tr.name}: gain ${tr.gain}`);
  assert.ok(t.tracks.reduce((s, x) => s + x.gain, 0) <= 0.45, 'all voices together are a whisper');
  const song = lullaby('44');
  const v = track(t, 'voice');
  assert.deepEqual(bareAll(bars(t, 'voice', 2, 2)), bareAll(song.slice(0, 2)), 'the first line at bar 2');
  assert.deepEqual(bareAll(bars(t, 'voice', 8, 2)), bareAll(song.slice(6, 8)), 'the last line at bar 8');
  for (const i of [0, 1, 4, 5, 6, 7, 10, 11]) assert.ok(isRest(v.bars[i]), `bar ${i} is silent`);
  // the chord is a bare fifth (no third: neither glad nor sad) in every bar
  for (const c of t.chords) assert.match(c, /^[DA]5$/, c);
  // and it slows to a stop
  assert.ok(t.tempoMap![t.tempoMap!.length - 1] < 0.9);
});

test('dread: the cello creeps the Iron-Claw figure, the March is only hinted, and the piece never plays it through', () => {
  const t = th('dread');
  for (const at of [0, 2, 8, 10]) assert.deepEqual(bareAll(bars(t, 'creep', at, 2)), bareAll(IRON_FIGURE), `creep at bar ${at}`);
  // the figure's own shape: the tonic, the flat second leaning on it, back, the leading tone below, home
  const toks = parseBar(IRON_FIGURE[0]).filter((x) => !x.rest);
  assert.deepEqual(toks.map((x) => `${x.acc}${x.deg}`), ['1', 'b2', '1', '7', '1']);
  assert.deepEqual(bareAll(bars(t, 'hint', 4, 2)), bareAll(MARCH.slice(0, 2)), 'two bars of the March at bar 4');
  assert.deepEqual(bareAll(bars(t, 'hint', 12, 4)), bareAll(MARCH.slice(0, 4)), 'four bars of it at bar 12');
  const played = track(t, 'hint').bars.filter((b) => !isRest(b)).length;
  assert.equal(played, 6, 'six bars of the eight');
  assert.ok(played < MARCH.length, 'never the whole tune');
  // the hint sits on D minor and on the March's own first chords
  assert.deepEqual(t.chords.slice(12, 16), ['Dm', 'Dm', 'Bb', 'A']);
  const { n, fit } = strongBeatFit(t, 'hint');
  assert.ok(fit / n >= 0.7, `hint: ${fit}/${n}`);
  // a heartbeat in the drum and nothing bright
  const heart = t.tracks.find((x) => x.name === 'heart');
  assert.ok(heart && heart.kind === 'drums' && heart.voice === 'timpani');
});

test('war: the March, whole, twice, low in the trombone, with the timpani on one and three', () => {
  const t = th('war');
  const low = octave(MARCH, -1);
  assert.deepEqual(bareAll(bars(t, 'trombone', 0, 8)), bareAll(low), 'first time');
  assert.deepEqual(bareAll(bars(t, 'trombone', 8, 8)), bareAll(low), 'second time');
  assert.deepEqual(bareAll(bars(t, 'horn', 8, 8)), bareAll(low), 'the horn joins the second time');
  // it is the lullaby with its third and sixth lowered (D harmonic minor does that): F and B-flat are in the tune, F-sharp and B are not
  const tonic = noteMidi(t.tonic);
  const pcs = new Set(notesOf(t, track(t, 'trombone')).map((n) => (((n.midi - tonic) % 12) + 12) % 12));
  assert.ok(pcs.has(3) && pcs.has(8), [...pcs].join(' '));
  assert.ok(!pcs.has(4) && !pcs.has(9), 'no major third or sixth');
  const timp = t.tracks.find((x) => x.name === 'timp');
  assert.ok(timp && timp.kind === 'drums');
  for (const p of timp.pats) assert.equal(p, 'X.......x.......', 'beats one and three');
  const fit = strongBeatFit(t, 'trombone');
  assert.ok(fit.fit / fit.n >= 0.8, `trombone: ${fit.fit}/${fit.n}`);
  // slow and heavy: a march, not a rush
  assert.ok(t.bpm <= 70);
});

test('chase: Pokey\'s tune cut short and breathless, passed from voice to voice, caught by the iron figure, and every round is harmonized as the tune leans', () => {
  const t = th('chase');
  const breath = bareAll(POKEY_BREATHLESS);
  assert.deepEqual(bareAll(bars(t, 'bassoon', 0, 4)), bareAll(octave(POKEY_BREATHLESS, -1)), 'bassoon at bar 0, an octave down');
  for (const [name, at] of [['clarinet', 4], ['clarinet', 16], ['oboe', 8], ['oboe', 16], ['flute', 12]] as const) {
    assert.deepEqual(bareAll(bars(t, name, at, 4)), breath, `${name} at bar ${at}`);
  }
  // the tune is shorter than Pokey's (each phrase breaks off), and it was cut from it: the first three notes of each phrase are Pokey's
  const full = parseBar(POKEY[0]).filter((x) => !x.rest).slice(0, 3).map((x) => `${x.acc}${x.deg}`);
  const cut = parseBar(POKEY_BREATHLESS[0]).filter((x) => !x.rest).slice(0, 3).map((x) => `${x.acc}${x.deg}`);
  assert.deepEqual(cut, full);
  // the iron figure falls on it at the end of every four bars: D, E-flat, D, C-sharp, D
  const hits = track(t, 'iron').bars.map((b, i) => (isRest(b) ? -1 : i)).filter((i) => i >= 0);
  assert.deepEqual(hits, [3, 4, 7, 8, 11, 12, 15, 16, 19, 20]);
  const shape = parseBar(track(t, 'iron').bars[3]!).filter((x) => !x.rest).map((x) => `${x.acc}${x.deg}`);
  assert.deepEqual(shape, ['1', 'b2', '1']);
  // in the last four bars the tune trips twice and gives up on a held low tonic
  const last = parseBar(track(t, 'clarinet').bars[23]!).filter((x) => !x.rest);
  assert.deepEqual(last.map((x) => `${x.deg}@${x.oct}:${x.len}`), ['1@-1:12']);
  for (const name of ['bassoon', 'clarinet', 'oboe', 'flute']) {
    const f = strongBeatFit(t, name);
    assert.ok(f.fit / f.n >= 0.75, `${name}: ${f.fit}/${f.n} strong-beat notes on chord tones`);
  }
  // a run, and a driving low string under it
  assert.ok(t.bpm >= 140);
  const drive = t.tracks.find((x) => x.name === 'drive');
  assert.ok(drive && drive.kind === 'pattern' && drive.inst === 'celloStac');
});

test('reveal: the lullaby is sung up to its climb, its last two bars are withheld, and the fall stops on the second note, hanging', () => {
  const t = th('reveal');
  const song = lullaby('44');
  assert.deepEqual(bareAll(bars(t, 'voice', 2, 6)), bareAll(song.slice(0, 6)), 'six bars of the song');
  for (let i = 8; i < 14; i++) assert.ok(isRest(track(t, 'voice').bars[i]), `the voice is silent in bar ${i}`);
  // the song's last two bars are exactly what is not sung: the fall home to the tonic
  assert.ok(!bareAll(track(t, 'voice').bars as string[]).includes(bare(song[7])), 'the final bar of the song is never sung');
  // the cello begins the fall and stops on the second degree, never the first
  const cello = notesOf(t, track(t, 'cello'));
  const tonic = noteMidi(t.tonic);
  const lastNote = cello[cello.length - 1];
  assert.equal(lastNote.midi - tonic, 2, 'the last note is the second of the scale (one tone above the tonic)');
  assert.ok(cello.every((n) => (n.midi - tonic) % 12 !== 0), 'the cello never lands on the tonic');
  // the harmony: begins hanging (suspended), turns to the march's chords (G minor, B-flat), and ends on the dominant
  assert.deepEqual(t.chords.slice(0, 2), ['Dsus2', 'Dsus4']);
  assert.ok(t.chords.includes('Gm') && t.chords.includes('Bb'));
  assert.equal(t.chords[t.chords.length - 1], 'A');
  // the song itself is sung in tune with its chords
  const f = strongBeatFit(t, 'voice');
  assert.ok(f.fit / f.n >= 0.7, `voice: ${f.fit}/${f.n}`);
});

test('resolve: Pokey\'s tune alone in the cello, Grandma\'s four rising notes climbing from higher steps, then the tune brave with the four notes as a flick', () => {
  const t = th('resolve');
  const cello = track(t, 'cello');
  assert.deepEqual(bareAll(bars(t, 'cello', 0, 8)), bareAll(POKEY), 'round one: Pokey\'s tune, in the cello');
  assert.deepEqual(bareAll(bars(t, 'cello', 16, 8)), bareAll(octave(POKEY, -1)), 'round three: the tune again, an octave lower');
  for (let i = 8; i < 16; i++) assert.ok(isRest(cello.bars[i]), `the cello waits in bar ${i}`);
  // round two climbs: the phrase starts on the tonic, the third, the fifth, then the tonic an octave up
  const climb = bars(t, 'climb', 8, 8);
  const starts = [0, 2, 4, 6].map((i) => {
    const first = parseBar(climb[i]).find((x) => !x.rest)!;
    return first.deg + 7 * first.oct;
  });
  assert.deepEqual(starts, [1, 3, 5, 8]);
  assert.deepEqual(bareAll(climb.slice(0, 2)), bareAll(stepBy(GRANDMA, 0)), 'the first climb is Grandma\'s phrase as written');
  // the phrase it climbs is Grandma's: four rising notes, then the leading tone held
  const g0 = parseBar(GRANDMA[0]).filter((x) => !x.rest).map((x) => x.deg);
  assert.deepEqual(g0, [1, 2, 3, 5]);
  assert.equal(parseBar(GRANDMA[1]).find((x) => !x.rest)!.deg, 7);
  // round three: in each of the tune's first four rests a quick flick of four rising notes
  const brave = bars(t, 'clarinet', 16, 8);
  for (let i = 0; i < 4; i++) {
    const tail = parseBar(brave[i]).filter((x) => !x.rest).slice(-4).map((x) => x.deg + 7 * x.oct);
    assert.ok(tail[0] < tail[1] && tail[1] < tail[2] && tail[2] < tail[3], `the flick in bar ${i}: ${tail}`);
    assert.ok(parseBar(brave[i]).filter((x) => !x.rest).slice(-4).every((x) => x.len === 1), `the flick is four sixteenths in bar ${i}`);
  }
  for (const name of ['cello', 'climb', 'clarinet', 'horn']) {
    const f = strongBeatFit(t, name);
    assert.ok(f.fit / f.n >= 0.8, `${name}: ${f.fit}/${f.n}`);
  }
  // the strings are already there for a scene that comes in at the top (a second pad covers the first round at high intensity)
  const early = t.tracks.find((x) => x.name === 'stringsEarly');
  assert.ok(early && early.gate && early.gate[0] >= 0.5);
});

test('mercy: the March unlocks into the lullaby: the sixth rises first, then the third, then the lilt, and the tune ends on the D the two songs share', () => {
  const t = th('mercy');
  const minor = lullaby('sq', { mode: 'minor' });
  const sq = lullaby('sq');
  const lilt = lullaby('44');
  const flats = (bs: string[]) => new Set(bs.flatMap((b) => parseBar(b).filter((x) => !x.rest && x.acc === 'b').map((x) => x.deg)));
  const tb = (a: number, n: number) => bars(t, 'trombone', a, n);
  assert.deepEqual(bareAll(tb(0, 4)), bareAll(octave(minor.slice(0, 4), -1)), 'bars 0-3 are the March');
  assert.deepEqual(bareAll(tb(4, 4)), bareAll(octave(sq.slice(4), -1)), 'bars 4-7 have the sixth risen back (the thorn)');
  assert.ok(flats(tb(0, 4)).has(3), 'the third is flat at first');
  assert.ok(flats(tb(0, 4)).has(6), 'and so is the sixth');
  assert.equal(flats(tb(4, 4)).size, 0, 'then nothing is flat');
  // the light through the crack: a violin holds the risen sixth over the thorn, then the risen third on the last bar of the march
  const lightDeg = (bar: number) => parseBar(track(t, 'light').bars[bar]!).filter((x) => !x.rest).map((x) => `${x.acc}${x.deg}`);
  assert.deepEqual([lightDeg(4), lightDeg(5), lightDeg(7)], [['6'], ['6'], ['3']]);
  // second pass: the lilt (the song's own dotted rhythm) in the horn and cello, low; third pass: the song as sung, in violins and clarinet
  assert.deepEqual(bareAll(bars(t, 'horn', 8, 8)), bareAll(octave(lilt, -1)));
  assert.deepEqual(bareAll(bars(t, 'cello', 8, 8)), bareAll(octave(lilt, -1)));
  assert.deepEqual(bareAll(bars(t, 'violins', 16, 8)), bareAll(lilt));
  assert.deepEqual(bareAll(bars(t, 'clarinet', 16, 8)), bareAll(lilt));
  // chords: minor and then major, and the march's B-flat gives way to B minor
  assert.deepEqual(t.chords.slice(0, 3), ['Dm', 'Dm', 'Bb']);
  assert.equal(t.chords[7], 'D', 'the iron half closes on D major, not D minor');
  assert.equal(t.chords[10], 'Bm');
  assert.equal(t.chords[t.chords.length - 1], 'D5', 'the loop ends on the bare fifth that both songs share');
  // the timpani changes from a march to a heartbeat
  const timp = t.tracks.find((x) => x.name === 'timp');
  assert.ok(timp && timp.kind === 'drums');
  assert.equal(timp.pats[0], 'X.......x.......');
  assert.equal(timp.pats[8], 'o.......o.......');
  for (const name of ['trombone', 'horn', 'cello', 'violins']) {
    const f = strongBeatFit(t, name);
    assert.ok(f.fit / f.n >= 0.75, `${name}: ${f.fit}/${f.n}`);
  }
});

test('finale: the song three times, the bud first, the tune climbing D E F-sharp over the bloom, and Grandma\'s phrase at last arriving on the tonic', () => {
  const t = th('finale');
  const lilt = bareAll(lullaby('44'));
  for (const at of [0, 8, 16]) assert.deepEqual(bareAll(bars(t, 'violins', at, 8)), lilt, `the song at bar ${at}`);
  assert.deepEqual(bareAll(bars(t, 'clarinet', 0, 8)), lilt);
  assert.deepEqual(bareAll(bars(t, 'clarinet', 16, 8)), lilt);
  // the bud: the first chord is a bare fifth, the second adds the ninth, and the tune's first three notes are the root, the ninth and the third
  assert.deepEqual(t.chords.slice(0, 2), ['D5', 'Dadd9']);
  const first3 = parseBar(bars(t, 'violins', 0, 1)[0]).filter((x) => !x.rest).slice(0, 3).map((x) => x.deg);
  assert.deepEqual(first3, [1, 2, 3]);
  // the coda: Grandma's two bars (four rising notes, the leading tone that waits), then the tonic, held, and a softer one
  assert.deepEqual(bareAll(bars(t, 'coda', 24, 2)), bareAll(GRANDMA));
  const cadence = parseBar(track(t, 'coda').bars[26]!).filter((x) => !x.rest);
  assert.deepEqual(cadence.map((x) => `${x.deg}@${x.oct}:${x.len}`), ['1@0:16'], 'the tonic arrives, and holds a whole bar');
  assert.equal(t.chords[t.chords.length - 1], 'Dadd9', 'on the full bloom chord');
  // the widest chord: choir, deep strings and horns come in by the third time through
  for (const name of ['deep', 'choir']) {
    const tr = t.tracks.find((x) => x.name === name);
    assert.ok(tr && tr.kind === 'chords' && tr.mask, name);
    assert.equal(tr.mask.indexOf('x'), 16, `${name} waits for the third time through`);
  }
  for (const name of ['violins', 'clarinet', 'cello']) {
    const f = strongBeatFit(t, name);
    assert.ok(f.fit / f.n >= 0.8, `${name}: ${f.fit}/${f.n}`);
  }
  // it is not a fanfare: slow, and its percussion is two soft drums and a gong
  assert.ok(t.bpm <= 66);
  assert.ok(t.tracks.filter((x) => x.kind === 'drums').every((x) => x.kind === 'drums' && ['timpani', 'gong'].includes(x.voice)));
});

test('the pieces share one tonal world: the March is the lullaby\'s notes with the third and sixth lowered, and nothing else', () => {
  const song = lullaby('sq');
  const degs = (bs: string[]) => bs.flatMap((b) => parseBar(b).filter((x) => !x.rest).map((x) => x.deg + 7 * x.oct));
  assert.deepEqual(degs(MARCH), degs(song), 'the same scale degrees, bar for bar');
  // written the other way (in the major with flats marked) the lowered degrees are only the third and the sixth
  const marked = lullaby('sq', { mode: 'minor' });
  const lowered = marked.flatMap((b) => parseBar(b).filter((x) => x.acc === 'b').map((x) => x.deg));
  assert.ok(lowered.length > 0 && lowered.every((d) => d === 3 || d === 6), `lowered degrees: ${lowered}`);
  // sounding: every note of the March is the lullaby's note, or the lullaby's note a semitone down on a third or a sixth
  const sound = (bs: string[], scale: keyof typeof SCALES) => bs.flatMap((b) => parseMelodyBar(b, noteMidi('D4'), SCALES[scale], 16)).filter((n) => n.midi !== null).map((n) => n.midi as number);
  const major = sound(song, 'major');
  const minor = sound(MARCH, 'harmonicMinor');
  const degAt = song.flatMap((b) => parseBar(b).filter((x) => !x.rest).map((x) => x.deg));
  assert.equal(major.length, minor.length);
  major.forEach((m, i) => {
    const d = m - minor[i];
    assert.ok(d === 0 || (d === 1 && (degAt[i] === 3 || degAt[i] === 6)), `note ${i}: degree ${degAt[i]} is ${d} semitones lower`);
  });
  assert.ok(major.some((m, i) => m !== minor[i]), 'and it is not simply the same tune');
  // dyn leaves pitches and lengths alone
  assert.deepEqual(bareAll(dyn(MARCH, [3, 3, 3, 3, 3, 3, 3, 3])), bareAll(MARCH));
});
