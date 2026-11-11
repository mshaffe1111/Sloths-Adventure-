/**
 * Audit C (audio), 2026-11-11. `SoundEngine.screen()` (src/game/audio.ts) runs on EVERY screen change and unconditionally calls
 * `setPaused(screen === 'paused')` and `storyMusic('keep')`. Three things it steps on:
 *   1. the sting's music duck (the same gain the pause uses): the Game Over card releases the defeat sting's duck 11 s early;
 *   2. the "stage is paused" state: the satchel opened FROM the pause menu is not 'paused', so the low-health heartbeat starts in it;
 *   3. the story's own hand on the music: a story whose first picture asks for silence gets the music back at once.
 * Each test asserts the CORRECT behaviour and fails today.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const g = globalThis as unknown as Record<string, unknown>;
g.window ??= { setTimeout: () => 0, clearTimeout: () => {}, addEventListener: () => {}, location: { search: '' } };
g.localStorage ??= { getItem: () => null, setItem: () => {} };
g.document ??= { hidden: false, addEventListener: () => {} };

const { sound } = await import('../../../../src/game/audio.ts');
const { AudioCore } = await import('../../../../src/audio/core.ts');
const { fakeCtx } = await import('../../../../src/audio/testCtx.ts');
const { SFX } = await import('../../../../src/audio/sfx.ts');
const { stingLength } = await import('../../../../src/audio/stingers.ts');

/** an AudioParam that really follows its automation (set / setTarget / cancel), so a test can ask what the level IS at a time */
function simParam(initial = 1) {
  type Ev = { fn: 'set' | 'target'; v: number; t: number; tau: number };
  let evs: Ev[] = [];
  const p = {
    value: initial,
    setValueAtTime(v: number, t: number) {
      evs.push({ fn: 'set', v, t, tau: 0 });
      return p;
    },
    setTargetAtTime(v: number, t: number, tau: number) {
      evs.push({ fn: 'target', v, t, tau });
      return p;
    },
    linearRampToValueAtTime(v: number, t: number) {
      evs.push({ fn: 'set', v, t, tau: 0 });
      return p;
    },
    cancelScheduledValues(t: number) {
      evs = evs.filter((e) => e.t < t);
      return p;
    },
    at(T: number): number {
      const list = [...evs].sort((a, b) => a.t - b.t);
      let val = initial;
      for (let i = 0; i < list.length; i++) {
        const e = list[i];
        if (e.t > T) break;
        const end = Math.min(T, list[i + 1]?.t ?? Infinity);
        if (e.fn === 'set') val = e.v;
        else val = e.v + (val - e.v) * Math.exp(-(end - e.t) / Math.max(1e-6, e.tau));
      }
      return val;
    },
  };
  return p;
}

type Inner = { core: unknown; muted: boolean; paused: boolean; tick: () => void; nextHeartbeat: number };
function wire() {
  const ctx = fakeCtx();
  const core = new AudioCore(ctx, { recorded: true });
  const duck = simParam();
  const story = simParam();
  (core.musicDuck as unknown as { gain: unknown }).gain = duck;
  (core.storyLevel as unknown as { gain: unknown }).gain = story;
  const c = (sound as unknown as { c: Inner }).c;
  c.core = core;
  c.muted = false;
  c.nextHeartbeat = 0;
  return { ctx, core, duck, story, c };
}

test('the Game Over card does not release the defeat sting\'s duck (the sting is 12 s long; the card comes 0.75 s in)', () => {
  const { ctx, duck } = wire();
  sound.screen('playing', 1, false, '1-1');
  ctx.currentTime = 100;
  sound.playDefeat(); // engine.ts loseLife, on the last life
  const hold = stingLength('defeat') - 1.6; // conductor.ts sting(): the music stays down this long
  assert.ok(hold > 8, `the defeat sting holds the music down ${hold.toFixed(1)} s`);
  assert.ok(duck.at(100.5) < 0.2, 'ducked under the sting');
  // DOWN_SECS (0.75 s) later the Game Over card goes up: App.tsx's screen effect
  ctx.currentTime = 100.75;
  sound.screen('game_over', 1, false, '1-1');
  const level = duck.at(104);
  assert.ok(level < 0.2, `3 s into a 12 s sting the music is still ducked (it is at ${level.toFixed(2)} of full)`);
});

test('a stage paused under the satchel (opened from the pause menu) stays paused for the sound: no low-health heartbeat', () => {
  const { ctx, c } = wire();
  let beats = 0;
  const was = SFX.heartbeat;
  SFX.heartbeat = () => {
    beats++;
  };
  try {
    sound.screen('playing', 1, false, '1-3');
    sound.setLowHealth(true); // engine.ts updateSound: last life, last heart
    ctx.currentTime = 10;
    sound.screen('paused', 1, false, '1-3');
    c.tick();
    assert.equal(beats, 0, 'no heartbeat under the pause menu');
    // Pause menu -> Satchel: the engine is only paused (screenFlow.ts stageHeld), nothing has told the sound otherwise
    ctx.currentTime = 12;
    sound.screen('satchel', 1, false, '1-3');
    c.tick();
    assert.equal(beats, 0, 'no heartbeat in the satchel over a paused stage');
  } finally {
    SFX.heartbeat = was;
    sound.setLowHealth(false);
  }
});

test('a story whose first picture asks for silence keeps it: the screen change that mounted the story does not undo it', () => {
  const { ctx, story } = wire();
  ctx.currentTime = 50;
  // the mount commit of the finale: StoryPlayer's effect runs first (a child's effects run before its parent's) ...
  sound.storyMusic('silence'); // StoryPlayer.tsx:167, the finale's first line (storyDirect.ts: 'The General lay in the rubble' -> silence)
  // ... then App.tsx's [screen] effect
  sound.screen('ending_story', 10, false, '10-10');
  const level = story.at(55);
  assert.ok(level < 0.05, `5 s into the silent picture the story's music level is ${level.toFixed(2)} (asked for 0)`);
});

test('back from the satchel, the pause menu still plays the stage\'s own tune (SN-6), not the satchel\'s loop', () => {
  wire();
  sound.screen('playing', 1, false, '1-3', 3, 7, 'sprint');
  const stage = sound.debug().scene;
  assert.ok(stage && stage !== 'menu', `the stage's piece: ${stage}`);
  sound.screen('paused', 1, false, '1-3', 3, 7, 'sprint');
  assert.equal(sound.debug().scene, stage, 'the stage tune goes on under the pause menu');
  sound.screen('satchel', 1, false, '1-3', 3, 7, 'sprint'); // Pause menu -> Satchel
  sound.screen('paused', 1, false, '1-3', 3, 7, 'sprint'); // Back
  assert.equal(sound.debug().scene, stage, 'and still does after a look in the satchel');
});
