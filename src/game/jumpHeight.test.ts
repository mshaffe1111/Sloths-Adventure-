/**
 * Audit A-02 (2026-11-11; EN-F): "jump height changes with frame time (92.3 to 101.0 px)". On the audit's base the loop handed update() a
 * dt of 22 to 50 ms, and gravity added before the move loses more height in a longer step, so a slow phone jumped lower than every
 * reach tool (realPlay.ts DT = 1/30) assumed. Since R-165.116 (a0760620) the loop plays whole 1/30 s steps whatever the frame time.
 * This plays the same held jump through the engine's OWN loop at 60 Hz, 30, 22, 20 and 15 fps and reads the apex after every update:
 * one height, the one the reach tools step (and so the margins they keep).
 */
import { makeEngine, standOn, step, type Eng } from './engineCoreHarness.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const floor = (e: Eng) => e.platforms.filter((p: any) => p.type === 'solid' && p.width >= 300 && !p.push).sort((a: any, b: any) => a.x - b.x)[1];

/** the height (px) a full held jump reaches when the loop is fed frames this many ms apart */
function apex(frameMs: number): number {
  const { e, input } = makeEngine('1-2');
  standOn(e, floor(e));
  step(e, 4);
  e.render = () => {};
  const y0 = e.player.y;
  let top = y0;
  let landed = false;
  const upd = e.update.bind(e);
  e.update = (dt: number) => {
    upd(dt);
    top = Math.min(top, e.player.y);
    if (e.player.grounded && top < y0 - 20) landed = true;
  };
  input.state.jumpPressed = true;
  input.state.jumpHeld = true;
  e.isRunning = true;
  e.isPaused = false;
  let now = 1000;
  e.lastRenderTime = now;
  e.acc = 0;
  for (let i = 0; i < 400 && !landed; i++) e.loop((now += frameMs));
  e.isRunning = false;
  assert.ok(landed, `he landed (frames ${frameMs} ms)`);
  return y0 - top;
}

test('A-02 a held jump reaches the same height at any frame rate, played through the real loop', () => {
  const at: Record<string, number> = { '60 Hz': apex(1000 / 60), '30 fps': apex(1000 / 30), '22 fps': apex(45), '20 fps': apex(50), '15 fps': apex(200 / 3) };
  const hs = Object.values(at);
  const spread = Math.max(...hs) - Math.min(...hs);
  assert.ok(spread < 0.01, `jump height by frame rate: ${Object.entries(at).map(([k, v]) => `${k}: ${v.toFixed(1)} px`).join('; ')}`);
});
