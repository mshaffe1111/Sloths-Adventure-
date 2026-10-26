/**
 * The input engine after a pause, a card or a new stage (2026-10-25): what resume() holds for him, the count of fresh inputs that ends
 * the respawn pause, and the touch recogniser forgetting its fingers when every input is dropped. Also: the listeners it adds are all
 * taken away again by destroy().
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

// a bare window and document, counting listeners (the engine only adds and removes them here)
const live = new Map<string, number>();
const target = (name: string) => ({
  addEventListener: (t: string) => live.set(`${name}:${t}`, (live.get(`${name}:${t}`) ?? 0) + 1),
  removeEventListener: (t: string) => live.set(`${name}:${t}`, (live.get(`${name}:${t}`) ?? 0) - 1),
});
const g = globalThis as unknown as Record<string, unknown>;
g.window ??= { ...target('window'), setTimeout, clearTimeout };
g.document ??= { ...target('document'), hidden: false };

const { InputEngine } = await import('./inputEngine.ts');
const { TouchGestures } = await import('./touchGestures.ts');

test('carry: after a pause in mid-air, Jump and the steering stay held until a fresh input takes over', () => {
  const inp = new InputEngine();
  inp.carry(true, 1);
  assert.ok(inp.state.jumpHeld && inp.state.right && !inp.state.left && inp.carrying);
  // the first fresh touch (any decision of the recogniser) gives it back, then does what it says
  inp.triggerTouchMove('left');
  assert.ok(!inp.carrying && !inp.state.jumpHeld && inp.state.left && !inp.state.right);
  inp.destroy();
});

test('carry: the engine can take it back (he landed), and it never takes away what the player holds himself', () => {
  const inp = new InputEngine();
  inp.carry(true, 0);
  inp.dropCarry();
  assert.ok(!inp.state.jumpHeld && !inp.carrying);
  inp.carry(false, 0);
  assert.ok(!inp.carrying, 'nothing held, nothing carried');
  inp.destroy();
});

test('every fresh input is counted (the respawn pause ends at the first new one)', () => {
  const inp = new InputEngine();
  const m0 = inp.moves;
  inp.triggerTouchUp();
  inp.triggerTouchPunch();
  inp.triggerTouchMove('right');
  assert.equal(inp.moves, m0 + 3);
  inp.destroy();
});

test('dropping every input also makes the touch recogniser forget its fingers (or a held thumb steered nothing)', () => {
  const inp = new InputEngine();
  const ges = new TouchGestures(
    {
      move: (d) => inp.triggerTouchMove(d),
      duck: (on) => inp.triggerTouchDuck(on),
      jumpPress: () => inp.triggerTouchUp(),
      jumpRelease: () => inp.releaseTouchUp(),
      punch: () => inp.triggerTouchPunch(),
      kick: (d) => inp.triggerTouchKick(d ?? 0),
      mega: () => inp.triggerTouchMega(),
      feedback: () => {},
    },
    () => 844,
  );
  inp.onCleared = () => ges.cancelAll();
  let now = 1000;
  ges.down(1, 150, 300, now);
  for (let x = 150; x <= 230; x += 20) ges.move(1, x, 300, (now += 30));
  assert.ok(inp.state.right);
  inp.clearAll();
  assert.ok(!inp.state.right && !ges.active, 'the old finger is forgotten');
  // a new touch steers at once
  ges.down(2, 150, 300, (now += 100));
  for (let x = 150; x <= 230; x += 20) ges.move(2, x, 300, (now += 30));
  assert.ok(inp.state.right, 'the next touch is not ignored');
  inp.destroy();
});

test('the input engine takes away every listener it added', () => {
  const before = new Map(live);
  const inp = new InputEngine();
  inp.destroy();
  for (const [k, n] of live) assert.equal(n, before.get(k) ?? 0, k);
});
