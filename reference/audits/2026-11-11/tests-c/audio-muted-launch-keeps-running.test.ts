/**
 * Audit C (audio), 2026-11-11. Muting in a session suspends the audio context 350 ms later (conductor.ts setMuted), and coming back
 * from the background while muted leaves it suspended (onVisibility). But a player who STARTS the game muted (the saved setting) in a
 * place where sound needs no tap (the Android app: Capacitor's WebView sets setMediaPlaybackRequiresUserGesture(false), so a new
 * AudioContext is 'running' at once) gets a context that nobody ever suspends: the sound thread runs, and the stage music is fetched,
 * decoded (35 MB) and played into a master gain of 0, for the whole session.
 * Asserts the rule the code itself states (muted => the context is suspended); fails today.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { fakeCtx } from '../../../../src/audio/testCtx.ts';

const g = globalThis as unknown as Record<string, unknown>;
let made: (ReturnType<typeof fakeCtx> & { suspended: number; resumed: number }) | null = null;
function AC() {
  const ctx = fakeCtx() as ReturnType<typeof fakeCtx> & Record<string, unknown> & { suspended: number; resumed: number };
  // the app's WebView: no tap needed, the context runs from the start
  ctx.state = 'running';
  ctx.suspended = 0;
  ctx.resumed = 0;
  ctx.suspend = () => {
    ctx.suspended++;
    ctx.state = 'suspended';
    return Promise.resolve();
  };
  ctx.resume = () => {
    ctx.resumed++;
    ctx.state = 'running';
    return Promise.resolve();
  };
  ctx.close = () => Promise.resolve();
  made = ctx;
  return ctx;
}
g.window = { AudioContext: AC, setTimeout, clearTimeout, addEventListener: () => {}, dispatchEvent: () => true, location: { search: '' } };
g.Event ??= class {};
g.document = { hidden: false, addEventListener: () => {} };
// the player muted the game on an earlier visit
g.localStorage = { getItem: (k: string) => (k === 'sloth_game_muted' ? 'true' : null), setItem: () => {} };

const { Conductor } = await import('../../../../src/audio/conductor.ts');

test('a game started muted (where sound needs no tap) suspends its audio context, as muting mid-session does', async () => {
  const c = new Conductor();
  assert.equal(c.muted, true, 'the saved setting');
  c.unlock(); // the page's own call at load (game/audio.ts: window.setTimeout(() => this.c.unlock(), 0))
  assert.ok(made, 'the context was made');
  c.unlock(true); // and a first tap
  await new Promise((r) => setTimeout(r, 500)); // (setMuted waits 350 ms before it suspends)
  const timer = (c as unknown as { timer: ReturnType<typeof setInterval> | null }).timer;
  if (timer) clearInterval(timer);
  assert.equal(made!.state, 'suspended', `muted from the start, the context is '${made!.state}' (suspend() called ${made!.suspended} times)`);
});
