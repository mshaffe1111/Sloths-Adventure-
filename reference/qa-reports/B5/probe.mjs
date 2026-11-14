import { createRequire } from 'node:module';
import { E, openStage } from '../B2/world.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const b = await chromium.launch();
const { ctx, p } = await openStage(b, { id: '1-98', setting: 'normal', w: 412, h: 915 });
const r = await p.evaluate((E) => {
  const e = eval(E);
  const st = e.currentStage;
  const g0 = e.gameTime; const o = { g0, id: st.config.id, chase: st.chase?.stretches, rolling: (st.rolling || []).length, pieces: e.pieces.map((q) => q.kind), x0: e.player.x };
  e.isPaused = true;
  e.input.state.right = true;
  for (let i = 0; i < 30; i++) { e.input.state.right = true; e.update(1 / 30); }
  Object.assign(o, { vx: e.player.vx, grace: e.inputGrace, gt: e.gameTime, grounded: e.player.grounded, held: e.held, hold: e.holdT, frozen: e.frozen, card: e.stageCardT, wait: e.waitStage, ready: e.stageReady, irisOpen: e.irisOpen, guideHold: e.guideHold, x1: e.player.x, down: e.down, helpAsking: e.helpAsking, entrance: !!e.entrance, dotRun: !!e.dotRun, introT: e.introT, camx: e.camera.x, vw: e.camera.viewportWidth });
  return o;
}, E);
console.log(JSON.stringify(r));
await ctx.close(); await b.close();
