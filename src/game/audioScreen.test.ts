/**
 * Audit C (audio) #2, #3, #5, 2026-11-11. `SoundEngine.screen()` (src/game/audio.ts) runs on EVERY screen change and unconditionally calls
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

const { sound } = await import('./audio.ts');
const { AudioCore } = await import('../audio/core.ts');
const { fakeCtx } = await import('../audio/testCtx.ts');
const { SFX } = await import('../audio/sfx.ts');
const { stingLength } = await import('../audio/stingers.ts');

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
