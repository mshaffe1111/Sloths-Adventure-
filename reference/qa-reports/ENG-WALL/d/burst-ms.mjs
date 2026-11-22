// ENG-WALL-d: what a frame costs when every square in view is painted at once (C's second half), at 4x CPU (CDP throttle), DSF 2.
// Times e.render() (the whole draw, ms) on: the stage start's first frame (squares released, the dolly's first frame), a cold respawn
// (x 19900, 14800: first frame), and the fastest descent (x 18990, 40 frames: the worst). PERFORMANCE-RULES §1: no frame over 50 ms in
// play, 120 at a stage start.
//   node burst-ms.mjs <port> [upright|sideways] [rate=4]
const { chromium } = await import(process.env.PW ?? '/opt/node-tools/node_modules/playwright/index.mjs');
const [port, orient = 'upright', rate = '4'] = process.argv.slice(2);
const [W, H] = orient === 'upright' ? [412, 915] : [915, 412];
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 })).newPage();
p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto(`http://127.0.0.1:${port}/?lessons=off`); await p.waitForTimeout(3000);
await p.evaluate(() => window.__play('2-97', 1)); await p.waitForTimeout(6000);
await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(2000);
const cdp = await p.context().newCDPSession(p);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(rate) });
const res = await p.evaluate(async (E) => {
  const art = await import('/src/game/protoArt.ts');
  const e = eval(E); e.isPaused = true;
  const t = () => { const a = performance.now(); e.render(); return +(performance.now() - a).toFixed(1); };
  const place = (x, y, vy = 0) => { Object.assign(e.player, { x, y, vx: 0, vy, grounded: vy === 0, hanging: false, climbing: false, invincibleTimer: 9 }); };
  const settle = () => { e.camera.x = e.camera.targetX ?? e.camera.x; e.camera.y = e.camera.targetY ?? e.camera.y; };
  const out = {};
  for (let i = 0; i < 10; i++) e.render();
  out.settled = Math.max(t(), t(), t());
  place(e.currentStage.spawnX, e.currentStage.spawnY); for (let i = 0; i < 3; i++) e.update(1 / 30); settle();
  art.releaseGroundChunks(); e.introT = 1 / 30; e.applyZoom();
  out.start = [t(), t(), t()];
  e.introT = 99; e.applyZoom();
  for (const x of [19900, 14800]) {
    const under = e.platforms.filter((q) => x >= q.x && x <= q.x + q.width && !q.soil).sort((a, c) => c.y - a.y)[0];
    place(x, under ? under.y : 1500); for (let i = 0; i < 3; i++) { e.player.vx = 0; e.update(1 / 30); } settle();
    out[`cold ${x}`] = [t(), t(), t()];
  }
  place(18990, 600, 950);
  const d = []; for (let i = 0; i < 40; i++) { e.update(1 / 30); d.push(t()); }
  out.descent = { worst: Math.max(...d), over50: d.filter((v) => v > 50).length };
  return out;
}, E);
console.log(orient, `x${rate}`, JSON.stringify(res));
await b.close();
