/**
 * Audit A, input slice (2026-11-11; UNREVIEWED lead, confirmed by EN-F on b3e8db15): a held thumb goes dead at the stage start.
 *
 * What it proves: a thumb that is already steering when a stage is built goes dead, and stays dead until it is lifted and put down
 * again. App.tsx launchEngine mounts the touch controller at once (screen = 'playing', under the title card, whose veil takes no
 * touches), then, once the stage's sheets are in, calls inputEngine.clearAll() ("drop any direction left over from the last one").
 *   - Screen mode: TouchController wires `inputEngine.onCleared = () => G.cancelAll()`, which forgets every finger; the recogniser
 *     ignores moves from a finger it does not know (`move(): if (!f) return`), and only a touchstart brings one back.
 *   - Pad mode: PadController wires only onFocusLost, never onCleared, so PadInput still believes it is holding 'right' and (it only
 *     speaks when its direction changes) never says so again: pushing harder the same way does nothing.
 * Both are the same root: the stage start wipes a hold that is still really held, and nothing re-asserts it.
 *
 * Fixed looks like: after the stage-start clearAll(), the next move of a thumb that is still down and still pushing right runs him
 * right. (If the Pad's fix is a line in PadController.tsx that registers onCleared, mirror that line in `wirePad` below.)
 *
 * Run: npx tsx --test src/game/heldThumbAtStart.test.ts
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { InputEngine } from './inputEngine.ts';
import { TouchGestures } from './touchGestures.ts';
import { PadInput } from './padControl.ts';

/** the recogniser wired to the input as TouchController.tsx wires it (the sink, and the two hooks at lines 109-112) */
function wireScreen() {
  const inp = new InputEngine();
  const G = new TouchGestures(
    {
      move: (d) => inp.triggerTouchMove(d),
      duck: (on) => inp.triggerTouchDuck(on),
      jumpPress: (lean, slant) => inp.triggerTouchUp(lean ?? 0, undefined, slant ?? 0),
      jumpRelease: () => inp.releaseTouchUp(),
      punch: (hold) => inp.triggerTouchPunch(hold),
      punchCancel: () => inp.triggerTouchPunchCancel(),
      kick: (dir) => inp.triggerTouchKick(dir ?? 0),
      mega: () => inp.triggerTouchMega(),
      climb: (d) => inp.triggerTouchClimb(d),
      feedback: () => {},
    },
    () => 800,
    { assist: () => true, air: () => false, refined: () => true, kickNear: () => false, onVine: () => false },
  );
  inp.onFocusLost = () => G.cancelAll();
  inp.onCleared = () => G.restate();
  return { inp, G };
}

/** the Pad wired to the input as PadController.tsx wires it (onFocusLost, and onCleared since EN-F) */
function wirePad() {
  const inp = new InputEngine();
  const P = new PadInput(inp);
  inp.onFocusLost = () => P.padUp();
  inp.onCleared = () => P.restate();
  return { inp, P };
}

test('Screen mode: a thumb steering right under the title card still steers right once the stage is built', () => {
  const { inp, G } = wireScreen();
  // the thumb goes down on the steering half and slides right while the title card is up
  G.down(1, 200, 300, 1000);
  G.move(1, 230, 300, 1040);
  G.move(1, 260, 300, 1080);
  assert.equal(inp.state.right, true, 'it steers (before the stage is built)');
  inp.clearAll(); // App.tsx launchEngine, as the engine is built
  // the same thumb, still down, keeps sliding right
  G.move(1, 290, 300, 1300);
  G.move(1, 330, 300, 1340);
  assert.equal(inp.state.right, true, 'the thumb is still down and still sliding right, and nothing is held');
});

test('Pad mode: a thumb pushing the pad right under the title card still runs him right once the stage is built', () => {
  const { inp, P } = wirePad();
  P.pad(30, 0);
  assert.equal(inp.state.right, true, 'it steers (before the stage is built)');
  inp.clearAll(); // App.tsx launchEngine, as the engine is built
  P.pad(34, 0);
  P.pad(40, 2);
  assert.equal(inp.state.right, true, 'the pad is still pushed right, and nothing is held');
});

// the two harnesses above mirror the controllers' wiring: this keeps them honest (the controllers are React, with no DOM renderer here)
test('the controllers wire a stage-start clear to restate, as the harnesses above do', async () => {
  const fs = await import('node:fs');
  const touch = fs.readFileSync(new URL('../components/TouchController.tsx', import.meta.url), 'utf8');
  const pad = fs.readFileSync(new URL('../components/PadController.tsx', import.meta.url), 'utf8');
  assert.match(touch, /inputEngine\.onCleared = \(\) => G\.restate\(\);/);
  assert.match(pad, /inputEngine\.onCleared = \(\) => P\.restate\(\);/);
});
