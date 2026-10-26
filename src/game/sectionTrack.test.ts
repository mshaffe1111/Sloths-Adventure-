/**
 * The recorder's stretch label (sectionTrack.ts): Matt's swing-stage log flipped 'Develop' and 'Twist' five times in 2 s while he swung
 * across the line between them. Each stretch is now entered once.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SECTION_HYST, SectionTrack, type Beat } from './sectionTrack.ts';
import { buildProtoStage } from './protoStage.ts';
import type { LevelConfig } from './types.ts';

const BEATS: Beat[] = [
  [0, 1000, 'Learn'],
  [1000, 2400, 'Develop'],
  [2400, 3600, 'Twist'],
  [3600, 5000, 'Finish'],
];

/** every label change the recorder would log, at 30 frames a second */
function entries(path: (t: number) => { x: number; swing?: boolean }, secs: number) {
  const tr = new SectionTrack();
  const out: string[] = [];
  let last = '';
  for (let f = 0; f <= secs * 30; f++) {
    const t = f / 30;
    const { x, swing } = path(t);
    const s = tr.update(BEATS, x, t, swing);
    if (s && s !== last) out.push(s);
    last = s;
  }
  return out;
}

test('section: jitter and swinging across a line between two stretches enter each once, not back and forth', () => {
  // walking up to the line and jittering about it (the 2 s in the log): 30 px either side, five times a second
  const jitter = entries((t) => ({ x: t < 3 ? 1500 + t * 290 : 2400 + 30 * Math.sin(t * 2 * Math.PI * 2.5) }), 6);
  assert.deepEqual(jitter, ['Develop'], 'never Twist while within 40 px of the line');
  // swinging on a liana whose middle hangs over the line, 150 px either side, period 1.9 s, for eight swings; then he lets go forward
  const swing = entries((t) => (t < 2 ? { x: 1800 + t * 300 } : t < 17 ? { x: 2400 + 150 * Math.sin(((t - 2) * 2 * Math.PI) / 1.9), swing: true } : { x: 2400 + (t - 17) * 300 }), 20);
  assert.deepEqual(swing, ['Develop', 'Twist'], 'the swing decides nothing; where he lands does');
  // a quick dip back over the line (under 0.5 s) after entering does not re-enter the stretch before
  const dip = entries((t) => ({ x: t < 4 ? 2200 + t * 100 : t < 4.3 ? 2380 : 2700 }), 6);
  assert.deepEqual(dip, ['Develop', 'Twist']);
  // really walking back counts
  const back = entries((t) => ({ x: t < 4 ? 2200 + t * 100 : 2600 - (t - 4) * 200 }), 8);
  assert.deepEqual(back, ['Develop', 'Twist', 'Develop']);
  assert.ok(SECTION_HYST.px >= 40 && SECTION_HYST.sec >= 0.5);
});

test('section: a straight run through the swing stage, walking or running, enters every stretch once and in order', () => {
  const cfg = {
    worldIndex: 1, miniIndex: 6, id: '1-6', name: 'First Lianas', objectiveType: 'vine_runner', targetCount: 1, timeLimit: 270,
    levelWidth: 16100, levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
  } as LevelConfig;
  const st = buildProtoStage(cfg, 7, 'proto');
  const beats = st.proto!.beats;
  const end = beats[beats.length - 1][1];
  for (const speed of [200, 420]) {
    const tr = new SectionTrack();
    const got: string[] = [];
    for (let f = 0; f * speed / 30 < end; f++) {
      const s = tr.update(beats, (f * speed) / 30, f / 30);
      if (s !== got[got.length - 1]) got.push(s);
    }
    assert.deepEqual(got, beats.map((b) => b[2]), `at ${speed} px/s`);
  }
});
