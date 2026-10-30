import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CALM, type MusicState } from './adaptive.ts';
import { stemLevel, STEM_ROLES, type LoopManifest, type StemName } from './loops.ts';
import { recordingFor, stageOf } from './recordings.ts';
import { sceneForScreen, sceneForPanel, meecaStageMusic } from './scenes.ts';
import { CUES } from './score.ts';
import { generateAllLevels } from '../game/worldsData.ts';
import MANIFEST from '../assets/music/manifest.json' with { type: 'json' };

const S = (s: Partial<MusicState>): MusicState => ({ ...CALM, ...s });

test('calm: the piece plays whole and no layer does', () => {
  for (const s of ['mix', 'bed', 'beat', 'top'] as StemName[]) assert.equal(stemLevel(s, CALM), 1, s);
  for (const s of ['drive', 'shine', 'dark', 'boss'] as StemName[]) assert.equal(stemLevel(s, CALM), 0, s);
});

test('each state moves the stems as it moved the parts', () => {
  const danger = S({ danger: 1 });
  assert.equal(stemLevel('drive', danger), 1, 'danger brings the drive in');
  assert.ok(stemLevel('top', danger) < 0.2, 'and the tune gives way to it');
  assert.equal(stemLevel('bed', danger), 1);
  assert.equal(stemLevel('shine', S({ exit: 1 })), 1, 'the exit brings the shine in');
  const dark = S({ dark: 1 });
  assert.equal(stemLevel('dark', dark), 1);
  assert.equal(stemLevel('top', dark), 0, 'the dark takes the tune and the figures away');
  assert.ok(stemLevel('beat', dark) < 0.2);
  const puzzle = S({ puzzle: 1 });
  assert.ok(stemLevel('bed', puzzle) > 0.7, 'a puzzle keeps the held chords');
  assert.ok(stemLevel('beat', puzzle) < 0.15, 'and rests the drums');
  assert.equal(stemLevel('drive', S({ boss: 2 })), 1, "a boss's second phase brings the drive in");
  assert.equal(stemLevel('boss', S({ boss: 2 })), 0);
  assert.equal(stemLevel('boss', S({ boss: 3 })), 1, 'its third the boss layer');
});

test('every role is in exactly one of the stems a stage records, and the mix holds every non-layer role', () => {
  const stage: StemName[] = ['bed', 'beat', 'top', 'drive', 'shine', 'dark', 'boss'];
  const seen = stage.flatMap((s) => STEM_ROLES[s]);
  assert.equal(new Set(seen).size, seen.length);
  assert.deepEqual([...STEM_ROLES.mix].sort(), [...STEM_ROLES.bed, ...STEM_ROLES.beat, ...STEM_ROLES.top].sort());
});

const M: LoopManifest = {
  pieces: { signature: {} as never, 'stage-w3-s-0': {} as never, 'stage-w3-r-0': {} as never, 'stage-w3-r-1': {} as never },
  stages: { 'w3-s': ['stage-w3-s-0'], 'w3-r': ['stage-w3-r-0', 'stage-w3-r-1'] },
};

test('a stage piece is known by its world and pace', () => {
  assert.deepEqual(stageOf('gen-3-12345-s'), { world: 3, pace: 's' });
  assert.deepEqual(stageOf('world2s-999'), { world: 2, pace: 'r' });
  assert.equal(stageOf('signature'), null);
  assert.equal(stageOf('bossA~b'), null);
});

test("a piece plays its own recording; a stage's composition one of its world's, for its pace, by the roll", () => {
  assert.equal(recordingFor(M, 'signature'), 'signature');
  assert.equal(recordingFor(M, 'gen-3-77-s', 5), 'stage-w3-s-0');
  assert.equal(recordingFor(M, 'gen-3-77-r', 4), 'stage-w3-r-0');
  assert.equal(recordingFor(M, 'gen-3-77-r', 5), 'stage-w3-r-1');
  assert.equal(recordingFor(M, 'gen-3-77-c', 5), 'stage-w3-r-1', 'a pace the world has no recording for: its runs');
  assert.equal(recordingFor(M, 'nothing'), null);
});

test('every piece the game can ask for has a recording (the screens, every stage at any roll, every boss, the story)', () => {
  const m = MANIFEST as unknown as LoopManifest;
  const missing = new Set<string>();
  const want = (id: string | undefined, seed?: number) => {
    if (id && !recordingFor(m, id, seed)) missing.add(id);
  };
  for (const screen of ['title', 'trophy', 'victory', 'game_over', 'story_ending']) want(sceneForScreen(screen, 1, false)?.id);
  for (let w = 1; w <= 10; w++) want(sceneForScreen('world_map', w, false)?.id);
  for (const l of generateAllLevels()) {
    for (const salt of [0, 1, 99991, 0x7ffffff]) {
      const s = sceneForScreen('playing', l.worldIndex, l.objectiveType === 'boss_lair', l.id, l.miniIndex, salt, l.objectiveType);
      want(s?.id, s?.seed);
    }
  }
  want(meecaStageMusic().id);
  for (const cue of CUES) want(sceneForPanel({ chapter: 'X', scene: { world: 1, mood: '' }, cue }).id);
  const chapters = ['PROLOGUE', 'MEMORY', 'THE SONG', 'THE REVEAL', 'THE MERCY', 'THE STORM', 'THE VOW', 'VICTORY', 'EPILOGUE', 'THE END', 'Other'];
  for (let w = 1; w <= 10; w++) {
    for (const ch of [...chapters, `WORLD ${w}`, 'BOSS']) for (const mood of ['', 'storm', 'dusk', 'glow', 'night']) want(sceneForPanel({ chapter: ch, scene: { world: w, mood } }).id);
  }
  assert.deepEqual([...missing], []);
});

test('the manifest is whole: every stem file it names exists, and every loop is longer than a few bars', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const dir = path.resolve(import.meta.dirname, '../assets/music');
  const m = MANIFEST as unknown as LoopManifest;
  for (const [name, p] of Object.entries(m.pieces)) {
    assert.ok(p.length > 8 && p.bars >= 4, name);
    for (const f of Object.values(p.stems)) {
      assert.ok(fs.existsSync(path.join(dir, f!)), f);
      assert.ok(fs.statSync(path.join(dir, f!)).size < 4 * 1024 * 1024, `${f} over the 4 MiB gate`);
    }
  }
  for (const list of Object.values(m.stages)) for (const n of list) assert.ok(m.pieces[n], n);
});
