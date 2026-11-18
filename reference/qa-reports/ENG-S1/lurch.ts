// the camera's largest step per frame through a widened swing and the landing, upright (the real engine, swingCam.test.ts's setup)
import { RealPlay } from '../../../src/game/realPlay.ts';
import { GameEngine } from '../../../src/game/engine.ts';
for (const [w, h] of [[412, 915], [390, 844]]) {
  const r = new RealPlay('1-3', 1); const e: any = r.e;
  e.updateCamera = (GameEngine.prototype as any).updateCamera.bind(e);
  const L = (id: number, x: number, width: number) => ({ id, x, y: 700, width, height: 200, type: 'solid' });
  const vine: any = { id: 9, x: 1300, topY: 300, bottomY: 710, vineType: 'swing_liana', isSwingingVine: true, swaySpeed: 1.1, swayPhase: 0 };
  r.bare([L(1, 0, 1100), L(2, 1720, 120), L(3, 2400, 2000)] as any, [vine]);
  e.enemies = []; e.currentStage.config = { ...e.currentStage.config, levelHeight: 900 };
  e.viewCssW = w; e.viewCssH = h; e.introT = 99; e.applyZoom();
  r.swing(vine, { angle: -0.4, omega: 0.5, len: 400 });
  let lx = e.camera.x, ly = e.camera.y, most = 0, mostY = 0;
  for (let i = 0; i < 10; i++) r.frame({ right: true });
  lx = e.camera.x; ly = e.camera.y;
  for (let i = 0; i < 240; i++) { r.frame({ right: true }); most = Math.max(most, Math.abs(e.camera.x - lx)); mostY = Math.max(mostY, Math.abs(e.camera.y - ly)); lx = e.camera.x; ly = e.camera.y; }
  // a real release on the first frame that sees the perch, then the flight and the landing (no teleport)
  for (let i = 0; i < 200; i++) { if ((r.p.swingAngularVelocity ?? 0) > 0 && r.p.x + 414 >= 1840) break; r.frame({ right: true }); }
  lx = e.camera.x; ly = e.camera.y;
  let most2 = 0, most2y = 0, landed = -1;
  for (let i = 0; i < 120; i++) { r.frame(i === 0 ? { press: true, jump: true, right: true } : i < 4 ? { jump: true, right: true } : {}); if (landed < 0 && r.p.grounded) landed = i; most2 = Math.max(most2, Math.abs(e.camera.x - lx)); most2y = Math.max(most2y, Math.abs(e.camera.y - ly)); lx = e.camera.x; ly = e.camera.y; }
  console.log(`  released, landed at frame ${landed} on x ${Math.round(r.p.x)} (perch 1720-1840), flight+landing+ease-in max step x ${most2.toFixed(1)} y ${most2y.toFixed(1)}, zoom back ${e.zoom.toFixed(3)}`);
  console.log(`${w}x${h}: swing max step x ${most.toFixed(1)} y ${mostY.toFixed(1)} px/frame; after landing x ${most2.toFixed(1)}`);
}
