import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clipLength, frameAt, timeline, type Cast } from './clipPlayer.ts';
import { MEECA_CAST, POKEY_CAST } from './titleCast.ts';

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

test("the title casts: each rests on its looping idle and plays its moments now and then, starting each from the idle's first frame", () => {
  for (const cast of [POKEY_CAST, MEECA_CAST]) {
    const segs = timeline(cast, 11, 240);
    const idle = cast.clips[cast.idle];
    assert.ok(idle.loop, 'the idle loops');
    const turn = idle.frames.length / idle.fps;
    for (const s of segs.filter((x) => x.clip === cast.idle).slice(0, -1)) {
      const turns = (s.end - s.start) / turn;
      assert.ok(Math.abs(turns - Math.round(turns)) < 1e-6, 'an idle stretch is whole turns of its loop');
    }
    const moments = segs.filter((s) => s.clip !== cast.idle);
    assert.ok(moments.length >= 240 / 16 && moments.length <= 240 / 5, `${moments.length} moments in four minutes`);
    for (const c of Object.values(cast.clips)) {
      assert.ok(cast.sheets[c.sheet], `${c.sheet} is a sheet of the cast`);
      for (const f of c.frames) assert.ok(f.ax > 0 && f.ax < f.w && f.ay > f.h * 0.9 && f.ay <= f.h, 'the feet are at the bottom of the frame');
    }
  }
});

test('the moment they share comes every 25 to 40 s, only while both rest on their idles, never cutting a single moment short', async () => {
  const { sharedMoments } = await import('./clipPlayer.ts');
  const { PAIR_LAUGH } = await import('./titleCast.ts');
  const a = { cast: POKEY_CAST, segs: timeline(POKEY_CAST, 17, 600) };
  const b = { cast: MEECA_CAST, segs: timeline(MEECA_CAST, 5, 600) };
  const len = PAIR_LAUGH.clip.frames.length / PAIR_LAUGH.clip.fps;
  const wins = sharedMoments(a, b, len, PAIR_LAUGH.gap, 9, 600);
  assert.ok(wins.length >= 600 / 50 && wins.length <= 600 / 25, `${wins.length} shared moments in ten minutes`);
  for (const [s, e] of wins) {
    for (const x of [a, b]) {
      const over = x.segs.filter((g) => g.end > s && g.start < e);
      assert.ok(over.every((g) => g.clip === x.cast.idle), 'nobody is in a single moment during it');
    }
  }
  for (let i = 1; i < wins.length; i++) assert.ok(wins[i][0] - wins[i - 1][1] >= PAIR_LAUGH.gap[0] - 1e-9);
});
