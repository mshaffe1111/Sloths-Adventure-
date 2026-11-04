/**
 * The beat stages' music (w1-rhythm, 2026-11-04; the lead: "for a beat-traced stage, stageMusic sets tempo = stageBpm / theme.bpm, so
 * whatever piece the session's salt picks, it plays at the stage's beat"). App.tsx rolls a new music salt every session, and the salt
 * picks the piece (1-2 used to play at 128-137 BPM across eight salts). The stage's platforms are traced on one beat
 * (src/game/beatTrace.ts), so every salt's piece must play at it.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { BEAT_ROOM, BEAT_STAGES, freeStageMusic, stageBeatBpm, stageMusic } from './scenes.ts';
import { themeById } from './themes.ts';
import { generateAllLevels } from '../game/worldsData.ts';

const levels = generateAllLevels();
const SALTS = [0, 1, 2, 3, 7, 42, 12345, 99999, 777777, 31337, 0x7ffffffe, 123456789, 2024, 555, 8, 9];

test('on every beat stage (1-1 to 1-5), every salt plays its piece at the stage beat, within 0.5 BPM and 6% of the piece', () => {
  const ids = [...BEAT_STAGES].sort();
  assert.deepEqual(ids, ['1-1', '1-2', '1-3', '1-4', '1-5']);
  for (const id of ids) {
    const l = levels.find((q) => q.id === id)!;
    const beat = stageBeatBpm(l.worldIndex, l.id, l.miniIndex, l.objectiveType);
    assert.ok(beat > 100, `${id}: beat ${beat}`);
    const pieces = new Set<string>();
    for (const salt of SALTS) {
      const m = stageMusic(l.worldIndex, l.id, l.miniIndex, salt, l.objectiveType);
      const th = themeById(m.id)!;
      const heard = th.bpm * (m.tempo ?? 1);
      assert.ok(Math.abs(heard - beat) <= 0.5, `${id} salt ${salt}: ${heard.toFixed(2)} BPM vs the beat ${beat.toFixed(2)}`);
      assert.ok(Math.abs((m.tempo ?? 1) - 1) <= BEAT_ROOM + 1e-9, `${id} salt ${salt}: stretched ${m.tempo}`);
      pieces.add(m.id);
    }
    // the salt still picks the piece: the music varies from session to session
    assert.ok(pieces.size >= 4, `${id}: only ${pieces.size} pieces over ${SALTS.length} salts`);
  }
});

test('every stage that is not built on the beat plays exactly as before (stageMusic is freeStageMusic, the old rule)', () => {
  let n = 0;
  for (const l of levels) {
    if (BEAT_STAGES.has(l.id)) continue;
    for (const salt of [0, 1, 777777]) {
      assert.deepEqual(stageMusic(l.worldIndex, l.id, l.miniIndex, salt, l.objectiveType), freeStageMusic(l.worldIndex, l.id, l.miniIndex, salt, l.objectiveType), l.id);
      n++;
    }
    assert.ok(Number.isNaN(stageBeatBpm(l.worldIndex, l.id, l.miniIndex, l.objectiveType)));
  }
  assert.ok(n > 200);
});
