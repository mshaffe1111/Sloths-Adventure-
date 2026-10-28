import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clipLength, frameAt, timeline, type Cast } from './clipPlayer.ts';
import { POKEY_CAST, meecaStandIn } from './titleCast.ts';

const F = { x: 0, y: 0, w: 10, h: 10, ax: 5, ay: 10 };
const SHOW: Cast = {
  sheets: { s: 'x.webp' },
  clips: {
    idle: { sheet: 's', frames: [F, F, F, F], fps: 8, loop: true },
    wave: { sheet: 's', frames: [F, F, F, F, F, F], fps: 12, next: 'smile' },
    smile: { sheet: 's', frames: [F, F, F], fps: 6 },
    cheer: { sheet: 's', frames: [F, F, F, F, F, F, F, F], fps: 10 },
  },
  idle: 'idle',
  moments: ['wave', 'cheer'],
  gap: [6, 10],
  height: 10,
};

test('the idle loops; a moment comes every 6 to 10 s, plays once, and chains back to the idle', () => {
  const segs = timeline(SHOW, 7, 300);
  assert.equal(segs[0].clip, 'idle');
  for (let i = 1; i < segs.length; i++) assert.ok(Math.abs(segs[i].start - segs[i - 1].end) < 1e-9, 'no gaps or overlaps');
  for (const s of segs.filter((x) => x.clip === 'idle')) {
    const d = s.end - s.start;
    if (s !== segs[segs.length - 1]) assert.ok(d >= 6 - 1e-9 && d <= 10 + 1e-9, `idle stretch ${d}`);
  }
  // a wave is always followed by its smile, then the idle
  segs.forEach((s, i) => {
    if (s.clip === 'wave') {
      assert.equal(segs[i + 1]?.clip ?? 'smile', 'smile');
      if (segs[i + 2]) assert.equal(segs[i + 2].clip, 'idle');
      assert.ok(Math.abs(s.end - s.start - clipLength(SHOW.clips.wave)) < 1e-9);
    }
  });
  assert.ok(segs.some((s) => s.clip === 'wave') && segs.some((s) => s.clip === 'cheer'), 'both moments get their turn');
  // never the same moment twice running
  const moments = segs.filter((s) => SHOW.moments.includes(s.clip)).map((s) => s.clip);
  for (let i = 1; i < moments.length; i++) assert.notEqual(moments[i], moments[i - 1]);
});

test('the same seed gives the same timeline; another seed another one', () => {
  assert.deepEqual(timeline(SHOW, 3, 120), timeline(SHOW, 3, 120));
  assert.notDeepEqual(timeline(SHOW, 3, 120), timeline(SHOW, 4, 120));
});

test('frames: the idle goes round, a moment holds on its last frame, nothing is out of range', () => {
  const segs = timeline(SHOW, 1, 200);
  for (let t = 0; t < 200; t += 0.037) {
    const { clip, frame } = frameAt(SHOW, segs, t);
    assert.ok(frame >= 0 && frame < SHOW.clips[clip].frames.length, `${clip} ${frame} at ${t}`);
  }
  assert.equal(frameAt(SHOW, segs, 0.13).frame, 1);
  assert.equal(frameAt(SHOW, segs, 0.5).frame, 0, 'the idle loop has come round');
});

test('the stand-in casts play the frames there are: Pokey and Meeca rest on their idle and blink now and then', () => {
  for (const cast of [POKEY_CAST, meecaStandIn('x' as unknown as CanvasImageSource, 100, 200, 50, 198, 190)]) {
    const segs = timeline(cast, 11, 120);
    const blinks = segs.filter((s) => s.clip === 'blink');
    assert.ok(blinks.length >= 120 / 7 && blinks.length <= 120 / 2.5, `${blinks.length} blinks in two minutes`);
    for (const b of blinks) assert.ok(b.end - b.start < 0.2, 'a blink is quick');
    assert.equal(frameAt(cast, segs, 0.5).clip, 'idle');
    for (const c of Object.values(cast.clips)) assert.ok(cast.sheets[c.sheet], `${c.sheet} is a sheet of the cast`);
  }
});
