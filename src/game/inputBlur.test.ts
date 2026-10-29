/**
 * A window blur while a finger is on the glass (QA 2026-10-28, session 347v: Facebook's in-app browser on an iPhone blurred the page
 * 100-130 ms into every touch, the blur dropped every held input and the recogniser's fingers, and Pokey never moved in 37 s). The steer
 * must survive that blur; a blur with no finger down, or a page that is really hidden, still lets go of everything.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

// a bare window and document that keep their listeners, so the test can send the events the browser would
type Fn = (e: unknown) => void;
const on = new Map<string, Set<Fn>>();
const target = (name: string) => ({
  addEventListener: (t: string, f: Fn) => (on.get(`${name}:${t}`) ?? on.set(`${name}:${t}`, new Set()).get(`${name}:${t}`)!).add(f),
  removeEventListener: (t: string, f: Fn) => on.get(`${name}:${t}`)?.delete(f),
});
const send = (key: string, e: unknown = {}) => {
  for (const f of on.get(key) ?? []) f(e);
};
const g = globalThis as unknown as Record<string, unknown>;
g.window ??= { ...target('window'), setTimeout, clearTimeout };
const doc = { ...target('document'), hidden: false };
g.document ??= doc;

const { InputEngine } = await import('./inputEngine.ts');
const { TouchGestures } = await import('./touchGestures.ts');

function rig() {
  const inp = new InputEngine();
  const said: string[] = [];
  const ges = new TouchGestures(
    {
      move: (d) => (said.push(`move ${d}`), inp.triggerTouchMove(d)),
      duck: (o) => inp.triggerTouchDuck(o),
      jumpPress: () => inp.triggerTouchUp(),
      jumpRelease: () => inp.releaseTouchUp(),
      punch: () => inp.triggerTouchPunch(),
      kick: (d) => inp.triggerTouchKick(d ?? 0),
      mega: () => inp.triggerTouchMega(),
      feedback: () => {},
    },
    () => 440,
  );
  // (as TouchController.tsx wires it)
  inp.onFocusLost = () => ges.cancelAll();
  inp.onCleared = () => ges.cancelAll();
  return { inp, ges, said };
}

test('a blur 100 ms into a slide (a finger still down, the page still showing) keeps the steer', () => {
  const { inp, ges, said } = rig();
  let kept = 0;
  inp.onBlurKept = () => kept++;
  let now = 1000;
  send('window:touchstart', { touches: [{}] });
  ges.down(-458, 150, 469, now);
  for (let x = 150; x <= 230; x += 20) ges.move(-458, x, 468, (now += 30));
  assert.ok(inp.state.right, 'steering right');
  send('window:blur');
  assert.ok(inp.state.right && ges.active, 'the blur let go of nothing');
  assert.equal(kept, 1);
  // he keeps running for the rest of the slide, and stops when the finger lifts
  for (let x = 232; x <= 240; x += 4) ges.move(-458, x, 468, (now += 30));
  assert.ok(inp.state.right);
  send('window:touchend', { touches: [] });
  ges.up(-458, 240, 468, (now += 30));
  assert.ok(!inp.state.right);
  assert.deepEqual(said.filter((s) => s === 'move none').length, 1, 'one stop, at the lift');
  inp.destroy();
});

test('a blur with no finger down still lets go of every held input (a key held down never sends its key-up)', () => {
  const { inp } = rig();
  inp.triggerTouchMove('right');
  send('window:blur');
  assert.ok(!inp.state.right);
  inp.destroy();
});

test('a page that is really going away (hidden) lets go even with a finger down', () => {
  const { inp, ges } = rig();
  send('window:touchstart', { touches: [{}] });
  ges.down(1, 150, 300, 1000);
  for (let x = 150; x <= 230; x += 20) ges.move(1, x, 300, 1000 + x);
  assert.ok(inp.state.right);
  doc.hidden = true;
  send('window:blur');
  assert.ok(!inp.state.right && !ges.active);
  doc.hidden = false;
  inp.destroy();
});

test('the finger count follows the browser, and destroy() takes its listeners away', () => {
  const inp = new InputEngine();
  send('window:touchstart', { touches: [{}, {}] });
  assert.equal(inp.touchesDown, 2);
  send('window:touchend', { touches: [{}] });
  send('window:touchcancel', { touches: [] });
  assert.equal(inp.touchesDown, 0);
  const before = ['touchstart', 'touchend', 'touchcancel', 'blur'].map((t) => on.get(`window:${t}`)?.size ?? 0);
  inp.destroy();
  const after = ['touchstart', 'touchend', 'touchcancel', 'blur'].map((t) => on.get(`window:${t}`)?.size ?? 0);
  assert.deepEqual(after, before.map((n) => n - 1));
});
