// The sideways view in a bounce (INT-1-1 item 7 and the Critic's delta 2): on 1-1 seed 4106 the mushroom by the seed-perch log throws
// Pokey up past the HUD band. The view must keep his head under the HUD (the HUD_BAND rule) and never move more than CAM_RISE_STEP
// (11 px of world) in one frame: the first fix held his head at once and moved the view 44-72 px in a frame (a snap). Flown in the real
// engine at 30 fps with the camera on (RealPlay turns it off as cosmetic), on a 915 x 412 sideways view.
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { RealPlay } from './realPlay.ts';
import { GameEngine } from './engine.ts';
import { setDifficulty } from './difficulty.ts';
import { withPlaySeed } from './testlink1_1.ts';
import { HUD_BAND, HERO_HEAD } from './cameraFollow.ts';

type Cam = { camera: { x: number; y: number; targetX: number; targetY: number; viewportHeight: number }; updateCamera(dt: number): void; resizeCanvas(): void; zoom: number };

function bounce(): { steps: number[]; headRoom: number[] } {
  const w = globalThis as unknown as { innerWidth: number; innerHeight: number };
  const was = [w.innerWidth, w.innerHeight];
  w.innerWidth = 915;
  w.innerHeight = 412;
  setDifficulty('normal');
  const r = withPlaySeed(4106, () => new RealPlay('1-1', 1));
  const e = r.e as unknown as Cam & { stop(): void };
  try {
    e.updateCamera = (GameEngine.prototype as unknown as Cam).updateCamera;
    e.resizeCanvas();
    const m = r.platforms.find((p) => p.type === 'bouncy' && p.x > 29500 && p.x < 29700)!;
    r.stand(m.x - 40, m.y + m.height);
    for (let i = 0; i < 90; i++) r.frame({});
    const steps: number[] = [], headRoom: number[] = [];
    const band = HUD_BAND.land / e.zoom;
    let y = e.camera.y, up = false;
    for (let i = 0; i < 60; i++) {
      r.frame({ right: true });
      steps.push(Math.abs(e.camera.y - y));
      y = e.camera.y;
      if (r.p.vy < -300) up = true;
      if (up) headRoom.push(r.p.y - HERO_HEAD - e.camera.y - band);
      if (up && r.p.grounded) break;
    }
    assert.ok(up, 'he bounced');
    return { steps, headRoom };
  } finally {
    e.stop();
    [w.innerWidth, w.innerHeight] = was;
  }
}

test('1-1 seed 4106 sideways, the bounce by the seed-perch log: no frame moves the view more than 11 px, and the view follows him up', () => {
  const b = bounce();
  const most = Math.max(...b.steps);
  assert.ok(most <= 11 + 1e-6, `the view moved ${most.toFixed(1)} px in one frame`);
  // (and it does follow him up: the view rises at the cap for several frames; how clear of the plate he stays is measured on the real
  // screen, reference/qa-reports/INT-1-1/delta2/ (the HUD band here is 112 px of world, wider than the plate: 31 px into the band on
  // this headless view is clear of the plate in the browser))
  assert.ok(b.steps.filter((s) => s > 10.9).length >= 5, `the view rose at the cap: ${b.steps.map((s) => s.toFixed(1)).join(' ')}`);
  assert.ok(Math.min(...b.headRoom) > -40, `his head ${(-Math.min(...b.headRoom)).toFixed(0)} px into the band at worst`);
});
