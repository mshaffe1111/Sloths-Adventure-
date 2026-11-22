// ENG-27u: scan a stage sideways (915x412) for the black band down the right edge: Pokey put on the ground every ~600 px, the camera set
// as the game's does, a 1x shot each; the right 24 px strip's brightness (rows 15-55% of the height, the sky and backdrop) against the strip
// beside it. The toy (2-97, seed 6: ENG-27t's clip) is the control: the scan must find the band there.
//   PW=<playwright> node bandscan27u.mjs <port> <out dir>
import fs from 'node:fs';
import path from 'node:path';
const PWM = await import(process.env.PW ?? 'playwright');
const chromium = PWM.chromium ?? PWM.default.chromium;
const [port, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
for (const [id, s] of [['2-97', 6], ['2-7', undefined]]) {
  const p = await (await b.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 1 })).newPage();
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(3000);
  await p.evaluate(([id, s]) => (s === undefined ? window.__play(id) : window.__play(id, s)), [id, s]);
  await p.waitForTimeout(6000);
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(1000);
  const right = await p.evaluate((E) => { const e = eval(E); e.isPaused = true; return Math.max(...e.platforms.map((q) => q.x + q.width)); }, E);
  for (let x = 300; x < right; x += 600) {
    const info = await p.evaluate(([E, x]) => {
      const e = eval(E);
      for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
      const under = e.platforms.filter((q) => q.x <= x && q.x + q.width >= x).sort((a, b) => a.y - b.y)[0];
      e.player.x = x; e.player.y = (under?.y ?? e.player.y) - e.player.height; e.player.vx = 0; e.player.vy = 0;
      for (let i = 0; i < 90; i++) e.updateCamera(1 / 30);
      // (a paused engine draws one still and stops (engine.ts stillDrawn): clear it so the loop draws this place)
      e.stillDrawn = false;
      return { camX: Math.round(e.camera.x), viewR: Math.round(e.camera.x + e.camera.viewportWidth) };
    }, [E, x]);
    await p.waitForTimeout(300);
    const file = path.join(out, `scan-${id}-${String(x).padStart(5, '0')}.png`);
    await p.screenshot({ path: file });
    console.log(JSON.stringify({ id, x, ...info, file }));
  }
  await p.close();
}
await b.close();
