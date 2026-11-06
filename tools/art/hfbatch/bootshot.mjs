// Stills for bootreview.py (2026-11-05): the real game at a stage's end, layout 1, Normal, upright 412x915 and sideways 915x412,
// the engine paused and stepped (stills.mjs's way), the camera snapped to its target. Serve a dev build (NODE_ENV=development npx vite
// build --outDir <dist>; python3 -m http.server 4377 in it), then: STAGE=1-5 BACK=450 NAME=bank15 node tools/art/hfbatch/bootshot.mjs <out dir>
// (Pokey stands BACK px before the shrine; the platforms near it, the camera and the zoom are printed for bootreview.py's CAMS)
const { chromium } = await import('/opt/node-tools/node_modules/playwright/index.mjs');
const port = 4377, out = process.argv[2];
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })).newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(2500);
  await p.evaluate((st) => window.__play(st, 1), process.env.STAGE ?? '1-1');
  await p.waitForTimeout(4000);
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(6000);
  const info = await p.evaluate(([E, BACK]) => {
    const e = eval(E);
    e.isPaused = true;
    const x = e.currentStage.exitTotemX - BACK;
    const under = e.platforms.filter((q) => !q.broken && q.type !== 'bouncy' && x >= q.x && x <= q.x + q.width).sort((a, c) => Math.abs(a.y - 580) - Math.abs(c.y - 580))[0];
    Object.assign(e.player, { x, y: under ? under.y : 580, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 0 });
    for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
    for (let i = 0; i < 200; i++) e.update(1 / 30); Object.assign(e.player, { vx: 0 }); e.camera.x = e.camera.targetX; e.camera.y = e.camera.targetY;
    e.clearGuide?.();
    e.render();
    return { plats: e.platforms.filter((q) => q.x < e.currentStage.exitTotemX + 300 && q.x + q.width > e.currentStage.exitTotemX - 700).map((q) => [q.x, q.y, q.width, q.type]), totem: e.currentStage.exitTotemX, cam: e.camera, py: e.player.y, ground: under && { x: under.x, y: under.y, w: under.width }, zoom: e.zoom ?? e.camera?.zoom, cw: e.canvas?.width, ch: e.canvas?.height };
  }, [E, +(process.env.BACK || 300)]);
  console.log(tag, JSON.stringify(info));
  await p.screenshot({ path: `${out}/${process.env.NAME ?? "end"}-${tag}.png` });
  await p.context().close();
}
await b.close();
