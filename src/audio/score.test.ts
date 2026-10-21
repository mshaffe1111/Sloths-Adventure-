/**
 * The story's score is data, so it can be proven right without listening: every cue has a piece, every piece's notation adds up and
 * stays inside what its instrument can play, the motifs are the ones the story is about, and the pieces fit the conductor's rules.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { CUES, cueId, scoreById } from './score.ts';
import { themeById } from './themes.ts';
import { CHORD_VOICES, DRUM_VOICES, NOTE_VOICES } from './instruments.ts';
import { chordPcs, noteMidi, parseChord, parseDrums, parseMelodyBar, parsePattern, SCALES, type Chord } from './theory.ts';
import type { Theme } from './music.ts';
import { VOICE_RANGE } from './scoreKit.ts';

const loopBars = (th: Theme) => th.chords.map(parseChord).reduce((n, c) => n + c.bars, 0);

test('there is a piece for every cue, and the theme registry finds it', () => {
  assert.equal(CUES.length, 17);
  for (const cue of CUES) {
    const th = themeById(cueId(cue));
    assert.ok(th, `${cue} has a piece`);
    assert.equal(th.id, cueId(cue));
    assert.equal(scoreById(cueId(cue)), th, 'built once');
  }
  assert.equal(scoreById('score_nothing'), null);
  assert.equal(scoreById('jennifur'), null);
});

for (const cue of CUES) {
  test(`${cue}: the notation adds up and every instrument can play it`, () => {
    const th = themeById(cueId(cue))!;
    const spb = th.stepsPerBar ?? 16;
    const bars = loopBars(th);
    const tonic = noteMidi(th.tonic);
    const scale = SCALES[th.scale];
    assert.ok(scale, 'scale');
    assert.ok(th.still, 'a cue piece keeps its shape (no breakdown, no key lift)');
    assert.ok(bars >= 8 && bars <= 40, `${bars} bars`);
    assert.ok(th.bpm >= 36 && th.bpm <= 170, `${th.bpm} bpm`);
    if (th.tempoMap) {
      assert.equal(th.tempoMap.length, bars, 'tempoMap has a number for every bar');
      for (const x of th.tempoMap) assert.ok(x >= 0.6 && x <= 1.2, `tempo ${x}`);
    }
    const names = new Set<string>();
    for (const tr of th.tracks) {
      assert.ok(!names.has(tr.name), `duplicate track ${tr.name}`);
      names.add(tr.name);
      assert.ok(tr.gain > 0 && tr.gain <= 4, `${tr.name}: gain ${tr.gain}`);
      if (tr.gate) assert.ok(tr.gate[0] >= 0 && tr.gate[1] <= 1 && tr.gate[0] <= tr.gate[1], `${tr.name}: gate`);
      if (tr.mask) assert.equal(tr.mask.length, bars, `${tr.name}: a mask letter for every bar`);
      if (tr.kind === 'drums') {
        assert.ok(DRUM_VOICES[tr.voice], tr.voice);
        assert.equal(tr.pats.length, bars, `${tr.name}: a pattern for every bar`);
        for (const p of tr.pats) parseDrums(p, spb);
      } else if (tr.kind === 'pattern') {
        assert.ok(NOTE_VOICES[tr.inst], tr.inst);
        assert.equal(tr.pats.length, bars, `${tr.name}: a pattern for every bar`);
        for (const p of tr.pats) parsePattern(p, spb);
      } else if (tr.kind === 'chords') {
        assert.ok(CHORD_VOICES[tr.inst], tr.inst);
        assert.ok(tr.lo < tr.hi && tr.hi - tr.lo >= 8, `${tr.name}: register`);
      } else {
        assert.ok(NOTE_VOICES[tr.inst], tr.inst);
        assert.equal(tr.bars.length, bars, `${tr.name}: a melody bar for every bar`);
        const range = VOICE_RANGE[tr.inst];
        for (const b of tr.bars) {
          assert.ok(b !== null, `${tr.name}: every bar is written (a cue piece is never left to the generator)`);
          for (const n of parseMelodyBar(b, tonic + (tr.shift ?? 0), scale, spb)) {
            if (n.midi === null || !range) continue;
            assert.ok(n.midi >= range[0] && n.midi <= range[1], `${tr.name}: ${tr.inst} asked for MIDI ${n.midi}, which it plays well only between ${range[0]} and ${range[1]}`);
          }
        }
      }
    }
    // every chord of the loop is a real chord
    for (const c of th.chords) parseChord(c);
  });
}

/** the strong-beat notes of a melody (those that start on the first or the third beat of a bar) and how many of them are tones of the chord under them */
function strongBeatFit(th: Theme, trackName: string): { n: number; fit: number } {
  const spb = th.stepsPerBar ?? 16;
  const tonic = noteMidi(th.tonic);
  const scale = SCALES[th.scale];
  const chords = th.chords.map(parseChord);
  const perBar: Chord[] = [];
  for (const c of chords) for (let i = 0; i < c.bars; i++) perBar.push(c);
  const tr = th.tracks.find((t) => t.name === trackName);
  assert.ok(tr && tr.kind === 'melody', trackName);
  let n = 0;
  let fit = 0;
  tr.bars.forEach((b, bar) => {
    if (!b) return;
    const pcs = chordPcs(perBar[bar]);
    for (const note of parseMelodyBar(b, tonic + (tr.shift ?? 0), scale, spb)) {
      if (note.midi === null || note.step % (spb / 2) !== 0 || note.len < spb / 8) continue;
      n++;
      if (pcs.includes(((note.midi % 12) + 12) % 12)) fit++;
    }
  });
  return { n, fit };
}

test('tunes sit in their harmony: most strong-beat notes of the leads are tones of the chord under them', () => {
  const leads: Record<string, string[]> = {
    meeca: ['verse1', 'verse2', 'verse3'],
    tender: ['clarinet'],
    pokey: ['bassoon', 'clarinet', 'flute'],
    grandma: ['cello', 'clarinet'],
    journey: ['flute', 'clarinet', 'oboe', 'flute2'],
    triumph: ['violins'],
  };
  for (const [cue, names] of Object.entries(leads)) {
    const th = themeById(cueId(cue as (typeof CUES)[number]))!;
    for (const name of names) {
      const { n, fit } = strongBeatFit(th, name);
      assert.ok(n >= 6, `${cue}/${name}: ${n} strong-beat notes`);
      assert.ok(fit / n >= 0.6, `${cue}/${name}: only ${fit} of ${n} strong-beat notes are chord tones`);
    }
  }
});
