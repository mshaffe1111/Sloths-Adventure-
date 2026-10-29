import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CALM, intensityLift, layerMix, layerTracks, roleOf, stepState, toneCutoff, type MusicState, type Role } from './adaptive.ts';
import { composeStage } from './composer.ts';
import { AudioCore } from './core.ts';
import { Playback } from './music.ts';
import { themeById, BOSS_THEME } from './themes.ts';
import { fakeCtx, type FakeParam } from './testCtx.ts';

const S = (s: Partial<MusicState>): MusicState => ({ ...CALM, ...s });
const ROLES: Role[] = ['lead', 'counter', 'perc', 'low', 'bed', 'stab', 'color', 'drive', 'shine', 'boss'];

test('calm: every part of the piece plays and no layer does', () => {
  for (const r of ROLES) assert.equal(layerMix(r, CALM), ['drive', 'shine', 'boss'].includes(r) ? 0 : 1, r);
});

test('each state moves the parts it should', () => {
  assert.equal(layerMix('drive', S({ danger: 1 })), 1, 'danger brings the drive in');
  assert.ok(intensityLift(S({ danger: 1 })) > 0);
  const puzzle = S({ puzzle: 1 });
  assert.ok(layerMix('lead', puzzle) <= 0.1 && layerMix('perc', puzzle) <= 0.1 && layerMix('drive', puzzle) === 0, 'a puzzle room rests the tune and drums');
  assert.equal(layerMix('bed', puzzle), 1, '...and keeps the held chords as its bed');
  const dark = S({ dark: 1 });
  assert.ok(layerMix('color', dark) <= 0.2 && layerMix('counter', dark) <= 0.2, 'the dark is thinner');
  assert.ok(toneCutoff(dark) < 2000 && toneCutoff(CALM) >= 18000, '...and lower');
  assert.equal(layerMix('shine', S({ exit: 1 })), 1, 'the exit lifts');
  assert.equal(layerMix('drive', S({ boss: 2 })), 1);
  assert.equal(layerMix('boss', S({ boss: 2 })), 0);
  assert.equal(layerMix('boss', S({ boss: 3 })), 1, "a boss's last phase brings everything");
  assert.equal(layerMix('perc', S({ mood: 'sad' })), 0, 'a sad beat has no drums');
  assert.ok(layerMix('drive', S({ mood: 'tense' })) > 0.3 && layerMix('lead', S({ mood: 'tense' })) < 0.5);
  assert.ok(layerMix('perc', S({ mood: 'warm' })) < 0.5 && layerMix('bed', S({ mood: 'warm' })) === 1);
});

test('the state moves a bar at a time: up quickly, down slowly, and never past where it is going', () => {
  let s = CALM;
  const want = S({ danger: 1 });
  s = stepState(s, want);
  assert.ok(s.danger >= 0.6 && s.danger < 1);
  for (let i = 0; i < 3; i++) s = stepState(s, want);
  assert.equal(s.danger, 1);
  const down = stepState(s, CALM);
  assert.ok(down.danger > 0.5, 'a danger lingers a bar after it has gone');
});

test('the layers are written from the piece itself: its tune for the shine, instruments it already plays for the drive', () => {
  const th = composeStage(4, 31337, 'run');
  const layers = layerTracks(th);
  for (const l of layers) assert.ok(l.layer, l.name);
  assert.ok(layers.some((l) => l.layer === 'drive') && layers.some((l) => l.layer === 'shine') && layers.some((l) => l.layer === 'boss'));
  const shine = layers.find((l) => l.name === 'lead+shine');
  assert.ok(shine && shine.kind === 'melody' && shine.genKey === 'lead', 'the violins double the tune, section by section');
  assert.equal(roleOf(th.tracks.find((t) => t.name === 'lead')!), 'lead');
});

/** every gate change the Playback scheduled for the tracks matching `pick`, after `from` seconds */
function gateCalls(pb: Playback, pick: (name: string) => boolean, from: number) {
  const tracks = (pb as unknown as { tracks: Array<{ spec: { name: string }; gate: { gain: FakeParam } }> }).tracks;
  return tracks.filter((t) => pick(t.spec.name)).flatMap((t) => t.gate.gain.calls.filter((c) => c.time >= from).map((c) => ({ ...c, name: t.spec.name })));
}

test('a state change crossfades on the bar line: the layer fades in over a beat or so, never jumps', () => {
  const ctx = fakeCtx();
  const core = new AudioCore(ctx, { lightRoom: true });
  const th = composeStage(1, 2024, 'run');
  const pb = new Playback(core, th, 0, undefined, false, { seed: 2024 });
  pb.setIntensity(0.4, true);
  const bar = (4 * 60) / th.bpm;
  pb.update(bar * 2.5);
  const asked = bar * 2.5;
  pb.setState({ danger: 1 });
  pb.update(bar * 6);
  const calls = gateCalls(pb, (n) => n.startsWith('drive'), asked - 0.5);
  assert.ok(calls.length > 0);
  for (const c of calls) {
    assert.equal(c.fn, 'target', `${c.name}: ${c.fn} is a jump`);
    assert.ok((c.tau ?? 0) >= 0.2, `${c.name}: a fade of ${c.tau}s is a cut`);
    // the bar lines: 0, bar, 2 bar ... (scheduled 20 ms early)
    const k = (c.time + 0.02) / bar;
    assert.ok(Math.abs(k - Math.round(k)) < 0.01, `${c.name}: changed at ${c.time.toFixed(3)}s, not on a bar line`);
  }
  assert.ok(calls.some((c) => c.value > 0.05), 'the drive came in');
  // and the piece did not restart or skip: the same Playback is still in its form
  assert.ok(pb.section.length > 0);
});

test('the stinger grid: a stinger waits for the next eighth note, but never long', () => {
  const ctx = fakeCtx();
  const core = new AudioCore(ctx, { lightRoom: true });
  const th = composeStage(3, 5, 'run');
  const pb = new Playback(core, th, 0, undefined, false, { seed: 5 });
  pb.update(3);
  const eighth = pb.beatDur / 2;
  for (const t of [1.01, 1.37, 2.2]) {
    const at = pb.gridAfter(t);
    assert.ok(at >= t && at - t <= 0.3);
    const k = at / eighth;
    assert.ok(Math.abs(k - Math.round(k)) < 0.01 || at === t, `${at} is off the grid`);
  }
});

test("a boss piece's phases build: phase 2 adds the drive, phase 3 the taiko and brass on top", () => {
  const ctx = fakeCtx();
  const core = new AudioCore(ctx, { lightRoom: true });
  const th = themeById(`${BOSS_THEME(5)}~b`)!;
  const pb = new Playback(core, th, 0, undefined, false, { seed: 1 });
  const bar = (4 * 60) / th.bpm;
  const level = (prefix: string, from: number) => {
    const c = gateCalls(pb, (n) => n.startsWith(prefix), from);
    return c.length ? Math.max(...c.map((x) => x.value)) : 0;
  };
  pb.setState({ boss: 1 }, true);
  pb.update(bar * 3);
  assert.equal(level('drive', 0), 0);
  pb.setState({ boss: 2 });
  pb.update(bar * 6);
  assert.ok(level('drive', bar * 3) > 0.05 && level('boss', bar * 3) === 0);
  pb.setState({ boss: 3 });
  pb.update(bar * 9);
  assert.ok(level('boss', bar * 6) > 0.05);
});

test("a boss fight past its first phase never drops into the arrangement's breakdown", () => {
  const ctx = fakeCtx();
  const core = new AudioCore(ctx, { lightRoom: true });
  const th = themeById(`${BOSS_THEME(5)}~b`)!;
  const pb = new Playback(core, th, 0, undefined, false, { seed: 0, startLoop: 2 });
  pb.setIntensity(0.9, true);
  pb.setState({ boss: 3 }, true);
  const bar = (4 * 60) / th.bpm;
  pb.update(bar * 4);
  // the breakdown pass rests the drums for its first bars: in a phase-3 fight they keep playing (their gates stay open)
  const drums = gateCalls(pb, (n) => /timp|bdrum|taiko|snare|kick/i.test(n), 0);
  assert.ok(drums.length > 0);
  const tracks = (pb as unknown as { tracks: Array<{ spec: { kind: string }; gate: { gain: FakeParam } }> }).tracks;
  assert.ok(tracks.some((t) => t.spec.kind === 'drums' && t.gate.gain.calls.some((c) => c.value > 0.05)));
});

