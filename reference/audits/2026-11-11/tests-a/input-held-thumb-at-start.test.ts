/**
 * AUDIT 2026-11-11, slice input-lifecycle. PROOF TEST: fails today.
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
 * Run: npx tsx --test reference/audits/2026-11-11/tests-a/input-held-thumb-at-start.test.ts
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../../../../src/game/headlessDom.ts';
import { InputEngine } from '../../../../src/game/inputEngine.ts';
import { TouchGestures } from '../../../../src/game/touchGestures.ts';
import { PadInput } from '../../../../src/game/padControl.ts';

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
  inp.onCleared = () => G.cancelAll();
  return { inp, G };
}

/** the Pad wired to the input as PadController.tsx wires it (line 67: onFocusLost only) */
function wirePad() {
  const inp = new InputEngine();
  const P = new PadInput(inp);
  inp.onFocusLost = () => P.padUp();
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
