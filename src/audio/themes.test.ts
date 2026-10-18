/**
 * Every piece of music is data, so it can be proven correct without listening:
 * bars add up, tunes stay in key, patterns parse, the generator behaves, and each theme's tracks reference real instruments.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { THEMES, WORLD_THEME, BOSS_THEME } from './themes.ts';
import { CHORD_VOICES, DRUM_VOICES, NOTE_VOICES } from './instruments.ts';
import {
  chordPcs,
  generateMelodyBar,
  noteMidi,
  parseChord,
  parseDrums,
  parseMelodyBar,
  parsePattern,
  rng,
  SCALES,
  voiceLead,
} from './theory.ts';

const ids = Object.keys(THEMES);

test('there is music for every world, boss and scene', () => {
  for (let w = 1; w <= 10; w++) {
    assert.ok(THEMES[WORLD_THEME(w)], `world ${w}`);
    assert.ok(THEMES[BOSS_THEME(w)], `boss ${w}`);
  }
  for (const id of ['title', 'map', 'results', 'gameover', 'jennifur', 'storyDusk', 'storyStorm', 'ending']) assert.ok(THEMES[id], id);
});

for (const id of ids) {
  test(`${id}: notation is valid and in tune`, () => {
    const th = THEMES[id];
    const spb = th.stepsPerBar ?? 16;
    const tonic = noteMidi(th.tonic);
    const scale = SCALES[th.scale];
    assert.ok(scale, 'scale exists');
    const chords = th.chords.map(parseChord);
    const loopBars = chords.reduce((n, c) => n + c.bars, 0);
    assert.ok(loopBars >= 4 && loopBars <= 16, `loop of ${loopBars} bars`);
    assert.ok(th.bpm >= 56 && th.bpm <= 170);
    const names = new Set<string>();
    for (const tr of th.tracks) {
      assert.ok(!names.has(tr.name), `duplicate track name ${tr.name}`);
      names.add(tr.name);
      assert.ok(tr.gain > 0 && tr.gain <= 1, `${tr.name} gain`);
      if (tr.gate) assert.ok(tr.gate[0] >= 0 && tr.gate[1] <= 1 && tr.gate[0] <= tr.gate[1], `${tr.name} gate`);
      if (tr.kind === 'drums') {
        assert.ok(DRUM_VOICES[tr.voice], `drum voice ${tr.voice}`);
        for (const p of tr.pats) parseDrums(p, spb);
        if (tr.fill) parseDrums(tr.fill, spb);
      } else if (tr.kind === 'pattern') {
        assert.ok(NOTE_VOICES[tr.inst], `instrument ${tr.inst}`);
        for (const p of tr.pats) parsePattern(p, spb);
      } else if (tr.kind === 'chords') {
        assert.ok(CHORD_VOICES[tr.inst], `chord voice ${tr.inst}`);
        assert.ok(tr.lo < tr.hi);
      } else {
        assert.ok(NOTE_VOICES[tr.inst], `instrument ${tr.inst}`);
        if (tr.altInst) assert.ok(NOTE_VOICES[tr.altInst]);
        assert.ok(tr.bars.length === loopBars || tr.bars.length < loopBars, `melody longer than loop in ${tr.name}`);
        assert.ok(loopBars % tr.bars.length === 0 || tr.bars.length === loopBars, `melody ${tr.name}: ${tr.bars.length} bars don't divide a ${loopBars}-bar loop`);
        tr.bars.forEach((b, i) => {
          if (b !== null) parseMelodyBar(b, tonic + (tr.shift ?? 0), scale, spb);
          else assert.ok(tr.gen, `null bar ${i} but no generator range`);
        });
      }
    }
  });

  test(`${id}: hand-written melody stays mostly in its key and in a singable range`, () => {
    const th = THEMES[id];
    const tonic = noteMidi(th.tonic);
    const scalePcs = new Set(SCALES[th.scale].map((s) => (tonic + s) % 12));
    for (const tr of th.tracks) {
      if (tr.kind !== 'melody') continue;
      let total = 0;
      let outside = 0;
      for (const b of tr.bars) {
        if (!b) continue;
        for (const n of parseMelodyBar(b, tonic, SCALES[th.scale], th.stepsPerBar ?? 16)) {
          if (n.midi === null) continue;
          total++;
          if (!scalePcs.has(n.midi % 12)) outside++;
          assert.ok(n.midi >= 36 && n.midi <= 96, `${tr.name} note ${n.midi} out of range`);
        }
      }
      // a few chromatic notes (leading tones, the flat second) are deliberate
      if (total) assert.ok(outside / total <= 0.2, `${id}/${tr.name}: ${outside}/${total} notes outside the key`);
    }
  });
}

test('generated melodies stay in key, in range and never leap wildly', () => {
  const scalePcs = SCALES.major.map((s) => (60 + s) % 12);
  const chord = parseChord('Am');
  let prev = 72;
  for (let seed = 1; seed <= 200; seed++) {
    const bar = generateMelodyBar({ scalePcs, chordPcs: chordPcs(chord), prev, lo: 64, hi: 84, rand: rng(seed), phraseBar: seed % 4, density: 0.45 });
    const total = bar.reduce((n, x) => n + x.len, 0);
    assert.equal(total, 16, `seed ${seed}`);
    for (const n of bar) {
      assert.ok(n.midi !== null && n.midi >= 64 && n.midi <= 84);
      assert.ok(scalePcs.includes((n.midi as number) % 12), 'in key');
    }
    for (let i = 1; i < bar.length; i++) assert.ok(Math.abs((bar[i].midi as number) - (bar[i - 1].midi as number)) <= 9, 'leap');
    prev = bar[bar.length - 1].midi as number;
  }
});

test('the generator is repeatable: same seed, same tune', () => {
  const o = { scalePcs: SCALES.minor.map((s) => (57 + s) % 12), chordPcs: chordPcs(parseChord('Dm')), prev: 69, lo: 60, hi: 84, phraseBar: 1 };
  const a = generateMelodyBar({ ...o, rand: rng(99) });
  const b = generateMelodyBar({ ...o, rand: rng(99) });
  assert.deepEqual(a, b);
});

test('pad voicings move smoothly between chords', () => {
  let prev: number[] | null = null;
  for (const name of ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G7']) {
    const v = voiceLead(prev, parseChord(name), 52, 70, 4);
    assert.ok(v.every((m) => m >= 40 && m <= 82), `${name} voicing ${v}`);
    if (prev) {
      const jump = Math.max(...v.map((m) => Math.min(...prev!.map((p) => Math.abs(p - m)))));
      assert.ok(jump <= 7, `${name}: a voice jumps ${jump} semitones`);
    }
    prev = v;
  }
});
