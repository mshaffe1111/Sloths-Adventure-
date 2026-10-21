/**
 * How the score meets the story: which piece a panel asks for and how full it plays, which sting a panel fires and when, and that the nine
 * stings (stingers.ts, STORY_STINGS) are real, short, soft music made of the story's own tunes. The pieces themselves are tested in
 * score.test.ts and scoreDrama.test.ts.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { CUE_INTENSITY, sceneForPanel, stingDue } from './scenes.ts';
import { CUES, cueId } from './score.ts';
import { themeById } from './themes.ts';
import { STINGS, STORY_STINGS, STORY_STING_NAMES, stingDuck, stingLength, stingVoices } from './stingers.ts';
import { CHORD_VOICES, DRUM_VOICES, NOTE_VOICES } from './instruments.ts';
import { VOICE_RANGE } from './scoreKit.ts';
import { GRANDMA, lullaby, parseBar, POKEY } from './motifs.ts';
import { noteMidi, parseChord, parseMelodyBar, SCALES } from './theory.ts';
import {
  BOSS_STORIES, ENDING_PANELS, INTRO_PANELS, WORLD_MID, WORLD_STORIES, bossPanels, thornbarkPanels,
  type StoryCue, type StoryPanel, type StorySting,
} from '../game/story.ts';
import { MEMORIES } from '../game/storyChapters.ts';
import { finalePanels } from '../game/storyFinale.ts';
import { FINDS } from '../game/finds.ts';

const STING_NAMES: StorySting[] = ['cliffhanger', 'reveal', 'laugh', 'blow', 'bloom', 'darkness', 'door', 'heartbreak', 'triumph'];

/** every panel of the story, wherever it plays */
function everyPanel(): StoryPanel[] {
  const all: StoryPanel[] = [...INTRO_PANELS, ...ENDING_PANELS];
  for (const s of Object.values(WORLD_STORIES)) all.push(...s.panels);
  for (const p of Object.values(WORLD_MID)) all.push(...p);
  for (const m of Object.values(MEMORIES)) all.push(...m.panels);
  for (let w = 1; w <= 10; w++) {
    const boss = BOSS_STORIES[w].intro[0].speaker;
    all.push(...bossPanels(w, 'intro', boss), ...bossPanels(w, 'defeat', boss));
  }
  all.push(...thornbarkPanels('intro'), ...thornbarkPanels('defeat'));
  return all;
}

const mk = (chapter: string, extra: Partial<StoryPanel> = {}) => ({ chapter, scene: { world: 3, mood: 'day' }, ...extra });

// ───────────────────────────────────────────── which piece, how full ─────────────────────────────────────────────

test('a panel that names a cue plays that cue\'s own piece, at the cue\'s own fullness unless the script says otherwise', () => {
  for (const cue of CUES) {
    const s = sceneForPanel(mk('PROLOGUE', { cue }));
    assert.equal(s.id, cueId(cue), `${cue} plays its piece, whatever the chapter`);
    assert.ok(themeById(s.id), `${cue}: the piece exists`);
    assert.equal(s.intensity, CUE_INTENSITY[cue]);
    assert.equal(s.seed, undefined);
    assert.equal(s.tempo, undefined);
  }
  assert.equal(sceneForPanel(mk('WORLD 4 · SOMEWHERE', { cue: 'dread', intensity: 0.8 })).intensity, 0.8, 'the script\'s intensity wins');
  assert.equal(sceneForPanel(mk('X', { cue: 'dread', intensity: 0 })).intensity, 0, 'and a zero is a zero, not "unset"');
  assert.equal(sceneForPanel(mk('X', { cue: 'dread', intensity: 7 })).intensity, 1, 'clamped');
  assert.equal(sceneForPanel(mk('X', { cue: 'dread', intensity: -2 })).intensity, 0);
  assert.equal(sceneForPanel(mk('X', { cue: 'dread', intensity: Number.NaN })).intensity, CUE_INTENSITY.dread, 'a bad number falls back to the default');
});

test('two panels with the same cue play the same piece (so it carries on rather than restarting), whatever their fullness', () => {
  const a = sceneForPanel(mk('WORLD 1 · A', { cue: 'sorrow', intensity: 0.2 }));
  const b = sceneForPanel(mk('WORLD 9 · B', { cue: 'sorrow', intensity: 0.9 }));
  assert.equal(a.id, b.id);
  assert.notEqual(a.intensity, b.intensity);
});

test('a panel with no cue is scored as it always was (chapter and mood)', () => {
  assert.deepEqual(sceneForPanel(mk('PROLOGUE')), { id: 'jennifur', intensity: 0.5 });
  assert.deepEqual(sceneForPanel(mk('THE STORM')), { id: 'storyStorm', intensity: 0.6 });
  assert.deepEqual(sceneForPanel({ chapter: 'X', scene: { world: 1, mood: 'night' } }), { id: 'world8~c', intensity: 0.15 });
  assert.deepEqual(sceneForPanel(mk('EPILOGUE')), { id: 'ending', intensity: 0.7 });
});

test('the default fullness of each cue fits what it is: the hush and the dread are low, the chase and the finale high, all in range', () => {
  assert.deepEqual(Object.keys(CUE_INTENSITY).sort(), [...CUES].sort(), 'a number for every cue and for nothing else');
  for (const [cue, v] of Object.entries(CUE_INTENSITY)) assert.ok(v >= 0 && v <= 1, `${cue}: ${v}`);
  for (const cue of ['hush', 'dread', 'reveal', 'tender', 'sorrow'] as StoryCue[]) assert.ok(CUE_INTENSITY[cue] <= 0.4, `${cue} is a quiet one`);
  for (const cue of ['chase', 'finale', 'triumph', 'war'] as StoryCue[]) assert.ok(CUE_INTENSITY[cue] >= 0.6, `${cue} is a full one`);
  assert.equal(Math.min(...Object.values(CUE_INTENSITY)), CUE_INTENSITY.hush, 'the hush is the quietest of all');
});

test('every panel of the story has music that exists, and the script\'s cues and stings are all ones the score can play', () => {
  const all = [...everyPanel(), ...finalePanels(FINDS.map((f) => f.id))];
  assert.ok(all.length > 400, `${all.length} panels`);
  let cued = 0;
  const cuesUsed = new Set<string>();
  const stingsUsed = new Set<string>();
  for (const p of all) {
    const s = sceneForPanel(p);
    assert.ok(themeById(s.id), `${p.chapter}: ${s.id}`);
    assert.ok(s.intensity >= 0 && s.intensity <= 1, `${p.chapter}: intensity ${s.intensity}`);
    if (p.cue) {
      cued++;
      cuesUsed.add(p.cue);
      assert.equal(s.id, cueId(p.cue));
      assert.ok(CUES.includes(p.cue), `unknown cue ${p.cue}`);
    }
    if (p.sting) {
      stingsUsed.add(p.sting);
      assert.ok(STORY_STINGS[p.sting], `${p.chapter}: no sting called ${p.sting}`);
    }
  }
  assert.ok(cued / all.length > 0.8, `${cued} of ${all.length} panels name a cue`);
  assert.ok(cuesUsed.size >= 14, `${cuesUsed.size} of ${CUES.length} cues are used by the script`);
  assert.deepEqual([...stingsUsed].sort(), [...STING_NAMES].sort(), 'the script uses every sting there is, and only those');
});

// ───────────────────────────────────────────── when the sting fires ─────────────────────────────────────────────

test('a sting waits for the title card to go and for the picture to begin showing its words, and a changed panel\'s first pass never fires it', () => {
  // the first pass for a new panel still holds the last panel's card and typing state
  assert.equal(stingDue({ fresh: true, wantsCard: true, cardUp: false, shown: 40, textLength: 40 }), false, 'a chapter opener (stale: no card yet)');
  assert.equal(stingDue({ fresh: true, wantsCard: false, cardUp: false, shown: 40, textLength: 55 }), false, 'a plain panel (stale: the old text counts as shown)');
  assert.equal(stingDue({ fresh: true, wantsCard: false, cardUp: false, shown: 0, textLength: 0 }), true, 'a picture with no words has nothing to wait for');
  assert.equal(stingDue({ fresh: true, wantsCard: true, cardUp: false, shown: 0, textLength: 0 }), false, 'but it still waits for its card');
  // after that
  assert.equal(stingDue({ fresh: false, wantsCard: true, cardUp: true, shown: 0, textLength: 40 }), false, 'the card is up');
  assert.equal(stingDue({ fresh: false, wantsCard: true, cardUp: true, shown: 12, textLength: 40 }), false, 'the card is up, whatever is typed');
  assert.equal(stingDue({ fresh: false, wantsCard: true, cardUp: false, shown: 0, textLength: 40 }), false, 'the card has gone, the picture is fading in');
  assert.equal(stingDue({ fresh: false, wantsCard: true, cardUp: false, shown: 1, textLength: 40 }), true, 'the first letter');
  assert.equal(stingDue({ fresh: false, wantsCard: false, cardUp: false, shown: 40, textLength: 40 }), true, 'the whole line at once (tapped through)');
  assert.equal(stingDue({ fresh: false, wantsCard: false, cardUp: false, shown: 0, textLength: 0 }), true);
  assert.equal(stingDue({ fresh: false, wantsCard: true, cardUp: true, shown: 0, textLength: 0 }), false);
});

// ───────────────────────────────────────────── the stings themselves ─────────────────────────────────────────────

test('there is a sting for each of the nine names the script can use, and the old stingers are still there', () => {
  assert.deepEqual([...STORY_STING_NAMES].sort(), [...STING_NAMES].sort());
  assert.deepEqual(Object.keys(STORY_STINGS).sort(), [...STING_NAMES].sort());
  for (const old of ['victory', 'defeat', 'bossVictory', 'bossAppear']) assert.ok(STINGS[old], old);
  // one table does not shadow the other: the story's own 'reveal' and 'triumph' are not the stingers' names, and both tables are searched
  for (const name of STING_NAMES) {
    assert.ok(stingLength(name) > 0, name);
    assert.ok(stingVoices(name).length > 0, name);
  }
  assert.equal(stingLength('nothing'), 0);
  assert.deepEqual(stingVoices('nothing'), []);
  assert.equal(stingDuck('victory'), 0.12, 'the old stingers still dip the music to a tenth');
  assert.equal(stingDuck('nothing'), 0.12);
});

test('the story stings are valid notation, between one and three seconds, and gentle', () => {
  const PINGY = new Set(['bell', 'kalimba', 'marimba', 'steelpan', 'pluck', 'softLead', 'brass', 'synthBass', 'bass', 'subBass']);
  for (const name of STING_NAMES) {
    const s = STORY_STINGS[name];
    const steps = s.steps ?? 16;
    assert.ok([8, 12, 16].includes(steps), `${name}: ${steps} steps`);
    const tonic = noteMidi(s.tonic);
    assert.ok(SCALES[s.scale], `${name}: scale`);
    for (const c of s.chords) parseChord(c);
    assert.ok(CHORD_VOICES[s.chordInst], `${name}: ${s.chordInst}`);
    assert.ok(s.chordGain >= 0 && s.chordGain <= 1, `${name}: chord gain`);
    if (s.range) assert.ok(s.range[0] < s.range[1] && s.range[1] - s.range[0] >= 12, `${name}: range`);
    for (const line of s.lines) {
      assert.ok(NOTE_VOICES[line.inst], `${name}: ${line.inst}`);
      assert.ok(!PINGY.has(line.inst), `${name}: ${line.inst} is a ping, not a voice of the orchestra`);
      assert.ok(line.gain > 0 && line.gain <= 1, `${name}/${line.inst}: gain`);
      assert.equal(line.bars.length, s.chords.length, `${name}/${line.inst}: a bar for every chord`);
      for (const b of line.bars) {
        assert.equal(parseBar(b).reduce((n, t) => n + t.len, 0), steps, `${name}/${line.inst}: "${b}" adds up to ${steps}`);
        const range = VOICE_RANGE[line.inst];
        for (const n of parseMelodyBar(b, tonic, SCALES[s.scale], steps)) {
          if (n.midi === null) continue;
          assert.ok(n.midi <= 81, `${name}/${line.inst}: MIDI ${n.midi} is above A5`);
          if (range) assert.ok(n.midi >= range[0] && n.midi <= range[1], `${name}/${line.inst}: MIDI ${n.midi} is outside ${range}`);
        }
      }
      // the harp is only ever a soft bed
      if (line.inst === 'harp') assert.ok(line.gain <= 0.4, `${name}: harp at ${line.gain}`);
    }
    // the loudest line is a sustained voice
    const lead = [...s.lines].sort((a, b) => b.gain - a.gain)[0];
    assert.notEqual(lead.inst, 'harp', `${name}: the harp does not lead`);
    for (const h of s.hits) {
      assert.ok(DRUM_VOICES[h.voice], `${name}: ${h.voice}`);
      assert.ok(!['triangle', 'clave', 'woodblock', 'hat', 'ohat', 'shaker', 'rim'].includes(h.voice), `${name}: ${h.voice} is a tick`);
      assert.ok(h.bar >= 0 && h.bar < s.chords.length && h.step >= 0 && h.step < steps && h.vel > 0 && h.vel <= 1, `${name}: hit ${JSON.stringify(h)}`);
    }
    const len = stingLength(name);
    assert.ok(len >= 0.8 && len <= 3.1, `${name}: ${len.toFixed(2)} s`);
    assert.ok((s.level ?? 0.42) <= 0.4, `${name}: level ${s.level}`);
    assert.ok(stingDuck(name) >= 0.25 && stingDuck(name) <= 0.8, `${name}: the music dips to ${stingDuck(name)}`);
    // every voice it plays is one the orchestra can be fetched for ahead of time
    const voices = stingVoices(name);
    for (const line of s.lines) assert.ok(voices.includes(line.inst), `${name}: ${line.inst} is warmed`);
    for (const h of s.hits) assert.ok(voices.includes(h.voice), `${name}: ${h.voice} is warmed`);
    assert.equal(voices.includes(s.chordInst), s.chordGain > 0, `${name}: the chord voice is warmed only if it sounds`);
  }
});

test('the stings are made of the story\'s tunes', () => {
  const degs = (bar: string) => parseBar(bar).filter((t) => !t.rest).map((t) => `${t.acc}${t.deg}`);
  const line = (name: StorySting, inst: string, bar = 0) => STORY_STINGS[name].lines.find((l) => l.inst === inst)!.bars[bar];

  // cliffhanger: Grandma's four rising notes, then the leading tone, and the tonic that should answer it never comes
  const grandma = parseBar(GRANDMA[0]).filter((t) => !t.rest).map((t) => `${t.acc}${t.deg}`);
  assert.deepEqual(degs(line('cliffhanger', 'clarinet')), [...grandma, '7']);
  assert.ok(!degs(line('cliffhanger', 'clarinet')).slice(1).includes('1'), 'it never arrives home');

  // reveal: a suspended fourth that falls to the flat third (the minor chord of the march)
  assert.deepEqual(STORY_STINGS.reveal.chords, ['Dsus4', 'Bb']);
  assert.deepEqual(STORY_STINGS.reveal.lines[0].bars.flatMap(degs), ['5', '4', 'b3']);

  // blow: the Iron-Claw figure's flat second, leaned on, and the three biggest drums together on the first beat
  assert.deepEqual(degs(line('blow', 'trombone')), ['1', 'b2', '1']);
  const first = STORY_STINGS.blow.hits.filter((h) => h.bar === 0 && h.step === 0).map((h) => h.voice).sort();
  assert.deepEqual(first, ['gong', 'taiko', 'timpani']);

  // bloom: the bud's root and fifth, then the ninth and the third, over D add 9
  assert.deepEqual(degs(line('bloom', 'clarinet')), ['1', '5', '2', '3']);
  assert.equal(STORY_STINGS.bloom.chords[0], 'Dadd9');

  // darkness: the tonic leaning on its flat second in the minor, with the bass under it
  assert.deepEqual(degs(line('darkness', 'cello')), ['1', 'b2']);
  assert.equal(STORY_STINGS.darkness.scale, 'harmonicMinor');
  assert.match(STORY_STINGS.darkness.chords[0], /m$/);

  // door: a timpani roll that grows, a horn opening on the bare fifth, and the gong where the gate swings wide
  assert.deepEqual(degs(line('door', 'horn')), ['1', '5']);
  const roll = STORY_STINGS.door.hits.filter((h) => h.voice === 'timpani');
  assert.ok(roll.length >= 4 && roll.every((h, i) => i === 0 || h.vel > roll[i - 1].vel), 'the roll grows');
  const gong = STORY_STINGS.door.hits.find((h) => h.voice === 'gong')!;
  assert.ok(gong.step >= roll[roll.length - 1].step, 'the gong comes as the roll ends');

  // heartbreak: the last line of the lullaby ("that holds you under": A A E D), alone in a cello over the lament's chord
  const lilt = lullaby('44');
  const lastLine = [...lilt.slice(6)].flatMap((b) => parseBar(b).filter((t) => !t.rest).map((t) => t.deg));
  assert.deepEqual(parseBar(line('heartbreak', 'cello')).filter((t) => !t.rest).map((t) => t.deg), lastLine);
  assert.equal(STORY_STINGS.heartbreak.lines.length, 1, 'alone');
  assert.equal(STORY_STINGS.heartbreak.chords[0], 'Bm');

  // triumph: small and brave, not a fanfare: the first notes of Pokey's tune, a single pair of timpani, major
  const pokey = parseBar(POKEY[0]).filter((t) => !t.rest).map((t) => t.deg).slice(0, 4);
  assert.deepEqual(parseBar(line('triumph', 'horn')).filter((t) => !t.rest).map((t) => t.deg).slice(0, 4), pokey);
  assert.deepEqual(parseBar(line('triumph', 'violins')).filter((t) => !t.rest).map((t) => t.deg).slice(0, 4), pokey);
  assert.equal(STORY_STINGS.triumph.scale, 'major');
  assert.ok(STORY_STINGS.triumph.hits.length <= 2 && STORY_STINGS.triumph.hits.every((h) => h.voice === 'timpani'));

  // laugh: the shortest and the quietest, no chord at all
  const lens = STING_NAMES.map((n) => stingLength(n));
  assert.equal(stingLength('laugh'), Math.min(...lens));
  assert.equal(STORY_STINGS.laugh.chordGain, 0);
  assert.equal(Math.min(...STING_NAMES.map((n) => STORY_STINGS[n].level ?? 0.42)), STORY_STINGS.laugh.level);
});
