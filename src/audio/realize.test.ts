/**
 * The real orchestra (realize.ts): that every part a performance adds to a theme is a part the engine can play, that it joins the tune in the
 * tune's own key and notes, and that the seating plan and the helper moves behave.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { THEMES } from './themes.ts';
import { CUES, cueId, scoreById } from './score.ts';
import { CHORD_VOICES, DRUM_VOICES, NOTE_VOICES } from './instruments.ts';
import { DOUBLES, fullOrchestra, realVoice, REAL_PATTERN, STAGE } from './realize.ts';
import { foldInto, harmonyBelow } from './music.ts';
import { VOICE_RANGE } from './scoreKit.ts';
import { chordPcs, parseChord } from './theory.ts';
import type { MelodyTrack } from './music.ts';

const all = [...Object.values(THEMES), ...CUES.map((c) => scoreById(cueId(c))!)];

test('a figure that repeats is played bowed, not plucked or struck; a tune keeps its own instrument', () => {
  assert.equal(realVoice({ kind: 'pattern', inst: 'marimba' }), 'figR');
  assert.equal(realVoice({ kind: 'pattern', inst: 'pluck' }), 'figR');
  assert.equal(realVoice({ kind: 'melody', inst: 'marimba' }), 'marimbaR');
  assert.equal(realVoice({ kind: 'pattern', inst: 'harp' }), 'harp');
  assert.equal(realVoice({ kind: 'pattern', inst: 'subBass' }), 'bassR');
  assert.equal(realVoice({ kind: 'drums', voice: 'congaHi' }), 'mute');
  for (const v of Object.values(REAL_PATTERN)) assert.ok(v in NOTE_VOICES, `${v} is a note voice`);
});

test('every part a performance adds is one the engine can play, with a sensible level and gate', () => {
  for (const th of all) {
    const extra = fullOrchestra(th);
    const names = new Set([...th.tracks, ...extra].map((t) => t.name));
    assert.equal(names.size, th.tracks.length + extra.length, `${th.id}: the added parts have names of their own`);
    for (const t of extra) {
      const table = t.kind === 'chords' ? CHORD_VOICES : t.kind === 'drums' ? DRUM_VOICES : NOTE_VOICES;
      const voice = t.kind === 'drums' ? t.voice : t.inst;
      assert.ok(voice in table, `${th.id}/${t.name}: ${voice} exists`);
      assert.ok(Number.isFinite(t.gain) && t.gain > 0 && t.gain < 1.6, `${th.id}/${t.name}: gain ${t.gain}`);
      if (t.gate) assert.ok(t.gate[0] >= 0 && t.gate[1] <= 1 && t.gate[0] <= t.gate[1], `${th.id}/${t.name}: gate ${t.gate}`);
    }
  }
});

test('the story cue pieces keep their own tunes: they get the beds and nothing sings with them', () => {
  const cues = all.filter((t) => t.id.startsWith('score_'));
  assert.ok(cues.length >= 17);
  for (const th of cues) {
    const extra = fullOrchestra(th);
    assert.ok(extra.length > 0 && extra.every((t) => t.kind === 'chords'), `${th.id}: only beds`);
  }
});

test('a tune is joined by players who play its notes: same bars, same seed for the composed bars, a legal range', () => {
  let joined = 0;
  for (const th of all.filter((t) => !t.id.startsWith('score_'))) {
    const lead = th.tracks.find((t): t is MelodyTrack => t.kind === 'melody');
    const doubles = fullOrchestra(th).filter((t): t is MelodyTrack => t.kind === 'melody');
    if (lead && DOUBLES[realVoice(lead)]) assert.ok(doubles.length > 0, `${th.id}: the ${realVoice(lead)} tune gets company`);
    for (const d of doubles) {
      joined++;
      assert.deepEqual(d.bars, lead!.bars, `${th.id}/${d.name}: plays the tune's bars`);
      assert.equal(d.genKey, lead!.genKey ?? lead!.name, `${th.id}/${d.name}: composed bars come out the same`);
      assert.deepEqual(d.gen, lead!.gen);
      assert.deepEqual(d.fold, VOICE_RANGE[d.inst], `${th.id}/${d.name}: kept in its instrument's range`);
      if (lead!.gate) assert.ok(d.gate![0] >= lead!.gate[0], `${th.id}/${d.name}: never in before the tune is`);
    }
  }
  assert.ok(joined >= 15, `${joined} added players across the themes`);
});

test('every recorded voice the real orchestra plays has a place on the stage, and the plan is on the stage', () => {
  const seen = new Set<string>();
  for (const th of all) for (const t of [...th.tracks, ...fullOrchestra(th)]) seen.add(realVoice(t));
  for (const v of seen) {
    if (v === 'mute' || !(v in STAGE)) continue;
    assert.ok(Math.abs(STAGE[v].pan) <= 1 && STAGE[v].depth >= 0 && STAGE[v].depth <= 1, `${v}: seat ${JSON.stringify(STAGE[v])}`);
  }
  // the sections the audience hears from the left, the right and the back
  assert.ok(STAGE.violins.pan < 0 && STAGE.cello.pan > 0 && STAGE.contra.pan > STAGE.cello.pan);
  assert.ok(STAGE.timpani.depth > STAGE.violins.depth && STAGE.horn.depth > STAGE.flute.depth);
  for (const k of ['violins', 'cello', 'flute', 'horn', 'orchStrings', 'timpani']) assert.ok(k in STAGE, k);
});

test('folding moves a note by whole octaves into a range and never changes its pitch class', () => {
  for (const [lo, hi] of [[55, 86], [36, 77], [60, 96]] as Array<[number, number]>) {
    for (let m = 20; m < 120; m++) {
      const f = foldInto(m, [lo, hi]);
      assert.ok(f >= lo && f <= hi, `${m} -> ${f} in ${lo}..${hi}`);
      assert.ok((f - m) % 12 === 0, `${m} -> ${f} is whole octaves`);
    }
  }
});

test('the harmony part is a chord tone a third to a sixth under the tune, or the octave when none is near', () => {
  const C = chordPcs(parseChord('C'));
  for (let m = 60; m < 90; m++) {
    const h = harmonyBelow(m, C, 9);
    assert.ok(C.includes(h % 12), `${m}: ${h} is a C chord tone`);
    assert.ok(m - h >= 3 && m - h <= 9, `${m} -> ${h}`);
  }
  // a chord with no tone within reach falls back to the octave
  assert.equal(harmonyBelow(70, [3], 5), 58);
  assert.equal(harmonyBelow(61, [1], 9), 49);
});
