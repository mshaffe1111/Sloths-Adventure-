// The drum's hits (drum.ts; reference/design/2-9.md NEW 2, ENG-29): ONE a BOOM, 2-4 a tok, every hit exactly on its beat over a minute on
// both settings (B 0.7125 s Normal, 0.825 s Easy), doubled in the twist; nothing scheduled twice across windows.
import test from 'node:test';
import assert from 'node:assert/strict';
import { DrumSchedule, drumHits, type DrumBeat, type DrumCue } from './drum.ts';

const NORMAL = { beats: 4, beat: 0.7125 };
const EASY = { beats: 4, beat: 0.825 };

test('drum: a minute of hits on both settings, each exactly on its beat, ONE a BOOM and 2-4 a tok', () => {
  for (const b of [NORMAL, EASY]) {
    const h = drumHits(b, 0, 60);
    assert.equal(h.length, Math.ceil(60 / b.beat - 1e-9));
    h.forEach((x, k) => {
      assert.ok(Math.abs(x.g - k * b.beat) < 1e-9, `hit ${k} at ${x.g}`);
      assert.equal(x.kind, k % 4 === 0 ? 'boom' : 'tok', `hit ${k}`);
    });
  }
});

test('drum: windows a frame apart schedule every hit once (none twice, none lost), and the twist doubles it', () => {
  const all: number[] = [];
  for (let t = 0; t < 60; t += 1 / 30) all.push(...drumHits(NORMAL, t, t + 1 / 30).map((x) => x.g));
  assert.deepEqual(all, drumHits(NORMAL, 0, 60).map((x) => x.g));
  const d = drumHits(NORMAL, 0, NORMAL.beat * 4, true);
  assert.equal(d.length, 8);
  assert.deepEqual(d.map((x) => x.kind), ['boom', 'tok', 'tok', 'tok', 'tok', 'tok', 'tok', 'tok']);
});

// ── the schedule on the audio clock (DrumSchedule; the lead's ruling: GAME TIME) ──
const FRAME = 1 / 30;
/** a run of engine steps on the audio clock: game time runs a frame a step, and stands through `downs` ([game time, steps standing]) */
type Drum = { step: (g: number, a: number) => { play: DrumCue[]; cut: boolean }; hold: (g: number, a: number) => boolean };
const scheduled = (b: DrumBeat): Drum => { const s = new DrumSchedule(); return { step: (g, a) => s.step(b, g, a), hold: (g, a) => s.hold(g, a) }; };
/** engine steps in the engine's order: the clock steps (unless he is down), the drum is called, and the step a life is lost the drum holds */
function play(b: DrumBeat, seconds: number, downs: Array<[number, number]> = [], drum: Drum = scheduled(b)) {
  const track: Array<{ a: number; g: number }> = [];
  const heard: DrumCue[] = [];
  // (a cut drops every hit not yet sounded at this audio moment)
  const cutAt = (a: number) => { for (let k = heard.length - 1; k >= 0; k--) if (heard[k].at > a) heard.splice(k, 1); };
  let g = 0, stand = 0, moved = false;
  for (let i = 0; g < seconds; i++) {
    const a = 1000 + i * FRAME;
    moved = false;
    if (stand > 0) stand--;
    else if (i > 0) { g += FRAME; moved = true; }
    track.push({ a, g });
    const r = drum.step(g, a);
    if (r.cut) cutAt(a);
    heard.push(...r.play);
    const d = moved ? downs.find(([at]) => g - FRAME < at && g >= at) : undefined;
    if (d) {
      stand = d[1];
      if (drum.hold(g, a)) cutAt(a);
    }
  }
  return { track, heard };
}
/** each heard hit against the audio moment the game reaches its beat (the logs' and lianas' clock), in words: none when every hit is within
 *  a frame of its beat, every beat heard once and none twice */
function drumOff(b: DrumBeat, r: ReturnType<typeof play>, until: number): string[] {
  const out: string[] = [];
  const audioOf = (g: number): number => {
    // (the moment the game first reaches g: a beat game time stands on is heard as the game reaches it, not when it runs again)
    if (r.track[0].g >= g) return r.track[0].a;
    for (let i = 1; i < r.track.length; i++) if (r.track[i].g >= g && r.track[i - 1].g < g) return r.track[i - 1].a + (g - r.track[i - 1].g);
    return NaN;
  };
  for (const h of r.heard) {
    const want = audioOf(h.g);
    if (!(Math.abs(h.at - want) <= FRAME + 1e-9)) out.push(`the ${h.kind} for the beat at game time ${h.g.toFixed(3)} s sounds ${(h.at - want).toFixed(3)} s off it`);
  }
  const beats = drumHits(b, 0, until).map((h) => h.g.toFixed(4));
  const got = r.heard.map((h) => h.g.toFixed(4));
  for (const g of beats) { const n = got.filter((q) => q === g).length; if (n !== 1) out.push(`the beat at game time ${g} s is heard ${n} times`); }
  return out;
}

test('drum on the audio clock: a minute on both settings, every hit within a frame of its beat, each heard once', () => {
  for (const b of [NORMAL, EASY]) assert.deepEqual(drumOff(b, play(b, 60), 59), [], `beat ${b.beat}`);
});

test('a lost life\'s down: game time stands 0.75 s mid-bar; nothing new sounds, and the next hit falls on the clocks\' next beat (no burst, no drift)', () => {
  for (const b of [NORMAL, EASY]) {
    // (a life lost a frame before a beat, and one mid-bar: 23 steps standing, engine.ts DOWN_SECS 0.75 s at the fixed step)
    for (const at of [10 * b.beat - 0.02, 21.5 * b.beat]) {
      const r = play(b, 40, [[at, 23]]);
      assert.deepEqual(drumOff(b, r, 39), [], `beat ${b.beat}, a life lost at game time ${at.toFixed(3)} s`);
      const after = r.heard.filter((h) => h.g >= at).sort((x, y) => x.at - y.at);
      const gaps = after.slice(1).map((h, i) => h.at - after[i].at);
      assert.ok(gaps.every((d) => d >= b.beat - FRAME), `no burst after the down: ${gaps.map((d) => d.toFixed(3))}`);
    }
  }
});

test('drum (planted RED): a drum that keeps WALL time through the down is named, off the clocks by the down', () => {
  const b = NORMAL;
  // (its hits every beat from the first on the audio clock, game time unread)
  const wall = (): Drum => { let to = 0; return { step: (_g, a) => { const h = drumHits(b, to, a - 1000 + DRUM_AHEAD_T).map((q) => ({ ...q, at: 1000 + q.g })); to = Math.max(to, a - 1000 + DRUM_AHEAD_T); return { play: h, cut: false }; }, hold: () => false }; };
  const r = play(b, 40, [[10 * b.beat + 0.3, 23]], wall());
  const f = drumOff(b, r, 30);
  assert.ok(f.length > 0);
  assert.match(f.join('; '), /the (boom|tok) for the beat at game time \d+\.\d+ s sounds -0\.7\d\d s off it/);
});
const DRUM_AHEAD_T = 2 / 30;

test('drum (planted RED): without the engine\'s hold the stand is seen a step late, and a hit due in that step sounds inside the down', () => {
  const b = EASY;
  const s = new DrumSchedule();
  const late: Drum = { step: (g, a) => s.step(b, g, a), hold: () => false };
  const f = drumOff(b, play(b, 20, [[10 * b.beat - 0.02, 23]], late), 19);
  assert.match(f.join('; '), /the tok for the beat at game time 8\.250 s sounds -0\.7\d\d s off it/);
});

// ---- the on-frame RED (ENG-29 NEW 2 (e)): the real loop (engine.ts loop) draws a frame every 1/30 s of wall time; a LATE frame comes one
// or two frames late and catches up in two or three steps in ONE audio moment. The truth: game time keeps wall time (the catch-up), so a
// hit at game time g is due at the audio clock's g + its start. A drum scheduled ON THE FRAME (at the step that passes its beat) lands a
// frame or more late; DrumSchedule's lookahead lands every hit on its beat; anchored on the step alone (no memory of the clocks' distance),
// a hit that enters the lookahead on a catch-up step's first step lands a frame late; two frames ahead, a 2-frame stall's hits land late.
type Sched = (b: DrumBeat, gameNow: number, audioNow: number) => Array<{ g: number; at: number }>;
const DT = 1 / 30;
const START = 5; // the audio clock's time as the stage starts
/** a minute of the loop with a late frame now and then (1, then 2 frames late, in turn); every hit sounded, with its g and audio time */
function loop(sched: Sched, b: DrumBeat, every = 7): Array<{ g: number; at: number }> {
  const out: Array<{ g: number; at: number }> = [];
  let late = 0;
  for (let f = 1; f <= 60 * 30; ) {
    const lag = f % every === 0 ? 1 + (late++ % 2) : 0;
    const audioNow = START + (f + lag) * DT;
    for (let k = 0; k <= lag; k++) out.push(...sched(b, (f + k) * DT, audioNow));
    f += lag + 1;
  }
  return out;
}
/** every hit not on its beat, in words (none: on the beat); and every beat from 1 s to 59 s sounded exactly once */
function offBeat(hits: Array<{ g: number; at: number }>, b: DrumBeat): string[] {
  const out: string[] = [];
  for (const h of hits) {
    const late = h.at - (START + h.g);
    if (Math.abs(late) > 1e-3) out.push(`the hit at game ${h.g.toFixed(4)} s sounds ${(late * 1000).toFixed(1)} ms ${late > 0 ? 'late' : 'early'}`);
  }
  const want = drumHits(b, 1, 59).map((x) => x.g.toFixed(6));
  const got = hits.filter((h) => h.g >= 1 - 1e-9 && h.g < 59 - 1e-9).map((h) => h.g.toFixed(6));
  if (got.join() !== want.join()) out.push(`${got.length} hits from 1 s to 59 s, ${want.length} beats`);
  return out;
}
const onFrame = (): Sched => {
  let last = 0;
  return (b, gameNow, audioNow) => {
    const h = drumHits(b, last, gameNow).map((x) => ({ g: x.g, at: audioNow }));
    last = gameNow;
    return h;
  };
};
const lookahead = (anchor?: number, ahead?: number): Sched => {
  const s = new DrumSchedule(anchor);
  return (b, gameNow, audioNow) => s.step(b, gameNow, audioNow, false, ahead).play;
};

test('drum on late frames: the schedule lands every hit on its beat on both settings; RED on the frame, and RED anchored on the step alone', () => {
  for (const b of [NORMAL, EASY]) {
    for (const every of [7, 3]) {
      assert.deepEqual(offBeat(loop(lookahead(), b, every), b), [], `the schedule, beat ${b.beat} s, a late frame every ${every}`);
      // (planted: on the frame, at the step that passes the beat: late, by name, a frame and more on the beats a late frame passes)
      const red = offBeat(loop(onFrame(), b, every), b);
      assert.ok(red.length > 0, 'on the frame is RED');
      assert.match(red[0], /^the hit at game \d+\.\d{4} s sounds \d+\.\d ms late$/);
      const worst = Math.max(...red.map((r) => Number(/sounds ([\d.]+) ms/.exec(r)?.[1] ?? 0)));
      assert.ok(worst >= DT * 1000, `on the frame, the worst is a frame or more late (${worst} ms)`);
      // (planted: the clocks' distance from the step alone: a hit entering on a catch-up's first step a frame late)
      const alone = offBeat(loop(lookahead(1), b, every), b);
      assert.ok(alone.length > 0 && alone.every((r) => / late$/.test(r)), `anchored on the step alone is RED: ${alone.length}`);
      // (planted: two frames ahead, as session 2 had it: a 2-frame stall's hits were never on the audio clock before it, so they sound late)
      const short = offBeat(loop(lookahead(undefined, 2 / 30), b, every), b);
      assert.ok(short.length > 0 && short.every((r) => / late$/.test(r)), `two frames ahead is RED: ${short.length}`);
    }
  }
});
