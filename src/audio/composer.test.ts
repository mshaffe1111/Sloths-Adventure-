/**
 * The composer writes music, so these tests play the part of a strict teacher: whatever seed it is given, the piece
 * must be in key, add up bar by bar, repeat its idea, put chord tones on the strong beats, close its phrases, stay
 * singable and be the same piece every time for the same seed. The story scores must also be long and must build.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { composeStage, composeStageFull, composeStory, chordName, themeFromId, stageThemeId, type StoryKind } from './composer.ts';
import { THEMES, themeById } from './themes.ts';
import { CHORD_VOICES, DRUM_VOICES, NOTE_VOICES } from './instruments.ts';
import { chordPcs, noteMidi, parseChord, parseDrums, parseMelodyBar, parsePattern, SCALES } from './theory.ts';
import type { Theme } from './music.ts';

const SEEDS = Array.from({ length: 40 }, (_, i) => 1 + i * 7919);

function checkNotation(th: Theme) {
  const spb = th.stepsPerBar ?? 16;
  const scale = SCALES[th.scale];
  assert.ok(scale, `scale ${th.scale}`);
  const chords = th.chords.map(parseChord);
  const loop = chords.reduce((n, c) => n + c.bars, 0);
  const names = new Set<string>();
  for (const tr of th.tracks) {
    assert.ok(!names.has(tr.name), `${th.id}: duplicate track ${tr.name}`);
    names.add(tr.name);
    assert.ok(tr.gain > 0 && tr.gain <= 1);
    if (tr.mask) assert.equal(tr.mask.length, loop, `${th.id}/${tr.name}: mask must cover the loop`);
    if (tr.gate) assert.ok(tr.gate[0] >= 0 && tr.gate[1] <= 1 && tr.gate[0] <= tr.gate[1]);
    if (tr.kind === 'drums') {
      assert.ok(DRUM_VOICES[tr.voice], tr.voice);
      for (const p of tr.pats) parseDrums(p, spb);
      if (tr.fill) parseDrums(tr.fill, spb);
    } else if (tr.kind === 'pattern') {
      assert.ok(NOTE_VOICES[tr.inst], tr.inst);
      for (const p of tr.pats) parsePattern(p, spb);
    } else if (tr.kind === 'chords') {
      assert.ok(CHORD_VOICES[tr.inst], tr.inst);
    } else {
      assert.ok(NOTE_VOICES[tr.inst], tr.inst);
      if (tr.altInst) assert.ok(NOTE_VOICES[tr.altInst]);
      assert.equal(loop % tr.bars.length, 0, `${th.id}/${tr.name}: ${tr.bars.length} bars in a ${loop}-bar loop`);
      for (const b of tr.bars) {
        if (b === null) assert.ok(tr.gen, 'null bar needs a generator range');
        else parseMelodyBar(b, noteMidi(th.tonic) + (tr.shift ?? 0), scale, spb);
      }
    }
  }
  return loop;
}

test('a composed stage is valid notation for every world and many seeds', () => {
  for (let w = 1; w <= 10; w++) {
    for (const seed of SEEDS) {
      const th = composeStage(w, seed);
      const loop = checkNotation(th);
      assert.equal(loop, 16, `${th.id}: a 16-bar form`);
      assert.ok(th.bpm >= 70 && th.bpm <= 140, `${th.id}: ${th.bpm} bpm`);
    }
  }
});

test('the lead melody is in key, singable, and mostly stepwise', () => {
  const ratios: number[] = [];
  for (let w = 1; w <= 10; w++) {
    for (const seed of SEEDS) {
      const { theme: th, info } = composeStageFull(w, seed);
      const tonic = noteMidi(th.tonic);
      const scale = SCALES[th.scale];
      const pcs = new Set(scale.map((s) => (tonic + s) % 12));
      const lead = th.tracks.find((t) => t.kind === 'melody' && t.name === 'lead');
      assert.ok(lead && lead.kind === 'melody');
      let prev: number | null = null;
      let leaps = 0;
      let moves = 0;
      for (let i = 0; i < lead.bars.length; i++) {
        const bar = parseMelodyBar(lead.bars[i]!, tonic, scale, 16);
        assert.equal(bar.reduce((n, x) => n + x.len, 0), 16, `${th.id} bar ${i}`);
        for (const n of bar) {
          if (n.midi === null) continue;
          assert.ok(pcs.has(n.midi % 12), `${th.id}: note ${n.midi} is not in ${info.key}`);
          assert.ok(n.midi >= 52 && n.midi <= 96, `${th.id}: ${n.midi} out of range`);
          if (prev !== null) {
            const d = Math.abs(n.midi - prev);
            moves++;
            if (d > 4) leaps++;
            assert.ok(d <= 10, `${th.id} bar ${i}: a leap of ${d} semitones`);
          }
          prev = n.midi;
        }
      }
      // Slomatt's own tune (when it is used) has its characteristic leaps; the composed ones should mostly move by step
      if (!info.hero) {
        ratios.push(leaps / moves);
        assert.ok(leaps / moves < 0.4, `${th.id}: ${leaps}/${moves} leaps`);
      }
    }
  }
  ratios.sort((a, b) => a - b);
  assert.ok(ratios[ratios.length >> 1] < 0.18, `median leap share ${ratios[ratios.length >> 1]}`);
});

test('strong beats land on chord tones', () => {
  let strong = 0;
  let good = 0;
  for (let w = 1; w <= 10; w++) {
    for (const seed of SEEDS) {
      const { theme: th, info } = composeStageFull(w, seed);
      if (info.hero) continue; // the hero's own tune carries its own harmony
      const tonic = noteMidi(th.tonic);
      const lead = th.tracks.find((t) => t.kind === 'melody' && t.name === 'lead');
      if (!lead || lead.kind !== 'melody') continue;
      lead.bars.forEach((b, i) => {
        const chord = parseChord(info.progression[i]);
        const pcs = chordPcs(chord);
        const bar = parseMelodyBar(b!, tonic, SCALES[th.scale], 16);
        for (const n of bar) {
          if (n.midi === null || (n.step !== 0 && n.step !== 8)) continue;
          strong++;
          if (pcs.includes(n.midi % 12)) good++;
        }
      });
    }
  }
  assert.ok(strong > 2000);
  assert.ok(good / strong >= 0.93, `${good}/${strong} strong-beat notes are chord tones`);
});

test('a tune states an idea, answers it, and repeats it (not a random walk)', () => {
  let answered = 0;
  let total = 0;
  for (let w = 1; w <= 10; w++) {
    for (const seed of SEEDS) {
      const { theme: th, info } = composeStageFull(w, seed);
      if (info.hero) continue;
      const lead = th.tracks.find((t) => t.kind === 'melody' && t.name === 'lead');
      if (!lead || lead.kind !== 'melody') continue;
      const rhythm = (s: string) => s.split(' ').map((t) => t.split(':')[1]).join(',');
      total++;
      // bar 2 answers bar 1 (same rhythm) and bar 5 restates it
      if (rhythm(lead.bars[0]!) === rhythm(lead.bars[1]!) && rhythm(lead.bars[0]!) === rhythm(lead.bars[4]!)) answered++;
    }
  }
  assert.equal(answered, total, 'every composed tune repeats its opening rhythm');
});

test('phrases close: a long final note on a stable note, and the loop turns over on the dominant side', () => {
  for (let w = 1; w <= 10; w++) {
    for (const seed of SEEDS) {
      const { theme: th, info } = composeStageFull(w, seed);
      if (info.hero) continue;
      const tonic = noteMidi(th.tonic);
      const scale = SCALES[th.scale];
      const lead = th.tracks.find((t) => t.kind === 'melody' && t.name === 'lead');
      if (!lead || lead.kind !== 'melody') continue;
      for (const bi of [3, 7, 15]) {
        const bar = parseMelodyBar(lead.bars[bi]!, tonic, scale, 16);
        const last = bar[bar.length - 1];
        assert.ok(last.midi !== null && last.len >= 4, `${th.id} bar ${bi} should end on a long note`);
        const chord = parseChord(info.progression[bi]);
        assert.ok(chordPcs(chord).includes((last.midi as number) % 12), `${th.id} bar ${bi}: closing note is not in ${chord.name}`);
      }
      // bar 8 (the last of A) closes on the tonic triad
      const endA = parseMelodyBar(lead.bars[7]!, tonic, scale, 16).slice(-1)[0].midi as number;
      const tonicTriad = [0, scale[2], scale[4]].map((x) => (x) % 12);
      assert.ok(tonicTriad.includes((endA - tonic + 120) % 12), `${th.id}: A section does not close on the tonic triad`);
    }
  }
});

test('the B section reaches higher than the A section', () => {
  let higher = 0;
  let total = 0;
  for (let w = 1; w <= 10; w++) {
    for (const seed of SEEDS) {
      const th = composeStage(w, seed);
      const lead = th.tracks.find((t) => t.kind === 'melody' && t.name === 'lead');
      if (!lead || lead.kind !== 'melody') continue;
      const tonic = noteMidi(th.tonic);
      const top = (from: number, to: number) => Math.max(...lead.bars.slice(from, to).flatMap((b) => parseMelodyBar(b!, tonic, SCALES[th.scale], 16)).map((n) => n.midi ?? 0));
      total++;
      if (top(8, 16) >= top(0, 8)) higher++;
      assert.ok(top(8, 16) >= top(0, 8) - 8, `${th.id}: B tops out ${top(0, 8) - top(8, 16)} semitones below A`);
    }
  }
  assert.ok(higher / total >= 0.85, `${higher}/${total}`);
});

test('it is deterministic, and different seeds give different music', () => {
  for (let w = 1; w <= 10; w++) {
    assert.deepEqual(composeStage(w, 12345), composeStage(w, 12345));
    const seen = new Set<string>();
    const keys = new Set<string>();
    const progs = new Set<string>();
    for (const seed of SEEDS) {
      const { theme, info } = composeStageFull(w, seed);
      const lead = theme.tracks.find((t) => t.kind === 'melody' && t.name === 'lead');
      seen.add(JSON.stringify(lead));
      keys.add(theme.tonic);
      progs.add(info.progression.join(' '));
    }
    assert.ok(seen.size >= 38, `world ${w}: ${seen.size}/40 different melodies`);
    assert.ok(keys.size >= 3, `world ${w}: ${keys.size} keys`);
    assert.ok(progs.size >= 10, `world ${w}: ${progs.size} chord progressions`);
  }
});

test('each world keeps its character', () => {
  const modeOf = (w: number) => composeStage(w, 99).scale;
  assert.equal(modeOf(1), 'major');
  assert.equal(modeOf(3), 'minor');
  assert.equal(modeOf(4), 'lydian');
  assert.equal(modeOf(6), 'dorian');
  assert.equal(modeOf(7), 'phrygian');
  assert.equal(modeOf(9), 'phrygian');
  // the sunny worlds are quicker than the dark ones, and the last worlds are the most driving
  const avg = (w: number) => SEEDS.reduce((n, s) => n + composeStage(w, s).bpm, 0) / SEEDS.length;
  assert.ok(avg(5) > avg(3) + 20);
  assert.ok(avg(9) > avg(8) + 30);
  // the grooves differ: world 9 has a kick and a snare, world 3 does not
  const voices = (w: number) => new Set(composeStage(w, 5).tracks.flatMap((t) => (t.kind === 'drums' ? [t.voice] : [])));
  assert.ok(voices(9).has('kick') && voices(9).has('snare'));
  assert.ok(!voices(3).has('kick') && !voices(3).has('snare'));
});

test('chord spelling follows the key', () => {
  assert.equal(chordName(0, 'major', 0), 'C');
  assert.equal(chordName(0, 'major', 5), 'Am');
  assert.equal(chordName(0, 'major', 4, { seventh: true }), 'G7');
  assert.equal(chordName(9, 'minor', 4), 'Em');
  assert.equal(chordName(9, 'minor', 4, { dom: true }), 'E');
  assert.equal(chordName(5, 'major', 3), 'Bb');
  assert.equal(chordName(2, 'phrygian', 1), 'Eb');
  assert.equal(chordName(5, 'lydian', 1), 'G');
  assert.equal(chordName(0, 'major', 6), 'Bdim');
});

test('a composed stage can be asked for by id', () => {
  const id = stageThemeId(7, 424242);
  assert.equal(id, 'gen-7-424242');
  assert.deepEqual(themeFromId(id), composeStage(7, 424242));
  assert.deepEqual(themeById(id), composeStage(7, 424242));
  assert.equal(themeFromId('world3'), null);
  assert.equal(themeFromId('gen-x-1'), null);
  assert.equal(themeById('jennifur'), THEMES.jennifur);
});

// ───────────────────────────── the story scores ─────────────────────────────

const KINDS: Array<[StoryKind, string]> = [['jennifur', 'jennifur'], ['dusk', 'storyDusk'], ['storm', 'storyStorm'], ['ending', 'ending']];

for (const [kind, id] of KINDS) {
  test(`${id}: a long, valid piece that builds from quiet to full and settles`, () => {
    const th = composeStory(kind);
    assert.equal(th.id, id);
    const loop = checkNotation(th);
    const spb = th.stepsPerBar ?? 16;
    const seconds = (loop * spb * 60) / (th.bpm * 4);
    assert.ok(loop >= 32 && loop <= 48, `${loop} bars`);
    assert.ok(seconds >= 90, `${id} lasts ${seconds.toFixed(0)} s before it turns over`);
    assert.ok(th.bpm <= 84, 'slow enough to feel heavy');
    // how many layers play in each bar
    const layers = Array.from({ length: loop }, (_, b) => th.tracks.filter((t) => (t.mask ? t.mask[b] === 'x' : true) && t.kind !== 'melody').length + th.tracks.filter((t) => t.kind === 'melody' && t.name.startsWith('lead') && t.bars[b % t.bars.length] !== `r:${spb}`).length);
    const open = Math.max(...layers.slice(0, 4));
    const peak = Math.max(...layers);
    const end = Math.max(...layers.slice(-3));
    assert.ok(peak >= open + 3, `${id}: it should grow (opens at ${open}, peaks at ${peak})`);
    assert.ok(end < peak, `${id}: it should settle after the climax`);
    assert.ok(new Set(layers).size >= 4, `${id}: at least four different densities`);
  });
}

test('the story scores use the recurring tunes', () => {
  const lead = (th: Theme) => th.tracks.filter((t) => t.kind === 'melody' && t.name.startsWith('lead')).flatMap((t) => (t.kind === 'melody' ? t.bars : []));
  assert.ok(lead(composeStory('dusk')).includes("5:3 5:1 6:2 5:2 3:4 r:4"), "Slomatt's theme in the vow");
  assert.ok(lead(composeStory('ending')).includes("5:3 5:1 6:2 5:2 3:4 r:4"), "Slomatt's theme in the ending");
  assert.ok(lead(composeStory('storm')).includes('1:3 b2:1 1:2 7,:2 1:4 r:4'), "Iron-Claw's motif in the storm");
});

test('the story scores are the same every time', () => {
  for (const [k] of KINDS) assert.deepEqual(composeStory(k), composeStory(k));
});
