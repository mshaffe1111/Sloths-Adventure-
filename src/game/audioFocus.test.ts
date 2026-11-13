/**
 * Audit C (audio) #1, 2026-11-11: Android's audio focus. PLAY-STORE-RULES §4: "Ask for it when sound starts, let go when it stops".
 * The app asked for focus on every resume, muted or not (a muted game stopped the player's podcast), never asked again after a
 * permanent loss while the game stayed in front (no tap brought the sound back), and said nothing when a request was refused (the
 * page played over a call). The page now tells the native side whether it wants sound (AudioFocusPlugin.java `want`), and a tap
 * while the focus is lost asks again.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const g = globalThis as unknown as Record<string, unknown>;
g.window ??= { setTimeout: () => 0, clearTimeout: () => {}, addEventListener: () => {}, location: { search: '' } };
g.localStorage ??= { getItem: () => null, setItem: () => {} };
g.document ??= { hidden: false, addEventListener: () => {} };

const { sound } = await import('./audio.ts');

type Front = { focus: (on: boolean) => void; onInput: (fromTap: boolean) => void };
function spy() {
  const asked: boolean[] = [];
  (sound as unknown as Front).focus = (on) => void asked.push(on);
  return asked;
}

test('muting lets go of the audio focus, and unmuting asks for it again', () => {
  const asked = spy();
  const was = sound.isMuted;
  try {
    if (sound.isMuted) sound.toggleMute();
    asked.length = 0;
    sound.toggleMute(); // muted
    assert.deepEqual(asked, [false], 'muted: the player\'s own music may play');
    sound.toggleMute(); // sound on
    assert.deepEqual(asked, [false, true], 'sound on: the game asks for the focus');
  } finally {
    if (sound.isMuted !== was) sound.toggleMute();
  }
});

test('after the focus is lost for good, the next tap on the game asks for it again (a key press too); muted, it does not', () => {
  const asked = spy();
  const was = sound.isMuted;
  try {
    if (sound.isMuted) sound.toggleMute();
    sound.appHidden(true, 'focus'); // another app took it: Android sends no gain after a permanent loss
    asked.length = 0;
    (sound as unknown as Front).onInput(true);
    assert.deepEqual(asked, [true], 'a tap on the game asks for the focus again');
    sound.appHidden(false, 'focus');
    asked.length = 0;
    (sound as unknown as Front).onInput(true);
    assert.deepEqual(asked, [], 'while the game holds the focus a tap asks for nothing');
    sound.appHidden(true, 'focus');
    sound.toggleMute(); // muted
    asked.length = 0;
    (sound as unknown as Front).onInput(true);
    assert.deepEqual(asked, [], 'a muted game never asks for the focus');
  } finally {
    sound.appHidden(false, 'focus');
    if (sound.isMuted !== was) sound.toggleMute();
  }
});

test('the native side asks for the focus on resume only when the page wants sound, and says "lost" when a request is refused', () => {
  const dir = new URL('../../android/app/src/main/java/com/mshaffe1111/slothadventure/', import.meta.url);
  const main = readFileSync(new URL('MainActivity.java', dir), 'utf8');
  assert.ok(!/requestAudioFocus/.test(main), 'MainActivity no longer asks for the focus on every resume');
  assert.match(main, /registerPlugin\(AudioFocusPlugin\.class\)/, 'the focus plugin is registered');
  const plugin = readFileSync(new URL('AudioFocusPlugin.java', dir), 'utf8');
  const resume = /void handleOnResume\(\)\s*\{([\s\S]*?)\n {4}\}/.exec(plugin)?.[1] ?? '';
  assert.match(resume, /if \(wanted\)/, 'on resume: only when the page wants sound');
  assert.match(plugin, /granted \? "back" : "lost"/, 'a refused request tells the page the sound is not its own');
});
