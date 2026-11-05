// 1-1's end log (the long high log with the exit totem) at phone size, upright 412x915 and sideways 915x412, deviceScaleFactor 2, the
// engine paused once the camera has settled; prints the platforms near the totem, the camera and the scale for placing the bootprint.
//   npx vite --port=4301 --host=127.0.0.1 --strictPort &   BACK=260 node tools/art/boot11/endshot.mjs <out dir> [tag]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const [out, tag = 'end'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const BACK = +(process.env.BACK ?? 260);
const b = await chromium.launch();
for (const [w, h, o] of [[412, 915, 'up'], [915, 412, 'side']]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${process.env.PORT ?? 4301}/?lessons=off`);
  await p.waitForFunction(() => typeof window.__play === 'function', null, { timeout: 120000 });
  await p.evaluate(() => window.__play('1-1'));
  await p.waitForTimeout(12000);
  const info = await p.evaluate((BACK) => {
    const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
    const tx = e.currentStage.exitTotemX, x = tx - BACK;
    const under = e.platforms.filter((q) => x >= q.x && x <= q.x + q.width).sort((a, c) => a.y - c.y)[0];
    Object.assign(e.player, { x, y: under.y, vx: 0, vy: 0, grounded: true, climbing: false, facing: 1 });
    e.camCut = true;
    for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
    return { totem: [tx, e.currentStage.exitTotemY], under: [under.x, under.y, under.width, under.type], near: e.platforms.filter((q) => q.x < tx + 300 && q.x + q.width > tx - 900).map((q) => [Math.round(q.x), Math.round(q.y), Math.round(q.width), q.type]) };
  }, BACK);
  await p.waitForTimeout(2500);
  const cam = await p.evaluate(() => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; return { x: e.camera.x, y: e.camera.y, zoom: e.camera.zoom ?? e.zoom, vw: e.camera.viewportWidth, vh: e.camera.viewportHeight, px: e.player.x, py: e.player.y }; });
  await p.screenshot({ path: `${out}/${tag}-${o}.png` });
  console.log(o, JSON.stringify({ ...info, cam }));
  await p.close();
}
await b.close();
