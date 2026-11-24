// ENG-27u: the black band down the right edge of ENG-27t's sideways clip. Is it the toy's backdrop ending short, or the game's camera?
// Shoots the dev page sideways (915x412, 2x) at the right end of a stage: the toy (2-97, the clip's fixture) and the REAL 2-7, Pokey put
// at the stage's far right and the camera set on him as the game's does; logs the stage's width, the camera's view and the backdrop's
// right edge, and saves a still of each.
//   PW=<playwright> node band27u.mjs <port> <out dir> [seed]
import fs from 'node:fs';
import path from 'node:path';
const PWM = await import(process.env.PW ?? 'playwright');
const chromium = PWM.chromium ?? PWM.default.chromium;
const [port, out, seed = '6'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
const rows = [];
for (const [id, s] of [['2-97', Number(seed)], ['2-7', undefined]]) {
  const p = await (await b.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2 })).newPage();
  p.on('pageerror', (e) => console.log('ERR', id, e.message));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(3000);
  await p.evaluate(([id, s]) => (s === undefined ? window.__play(id) : window.__play(id, s)), [id, s]);
  await p.waitForTimeout(6000);
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(1500);
  for (const at of ['far', 'farLow']) {
    const info = await p.evaluate(([E, at]) => {
      const e = eval(E);
      e.isPaused = true;
      for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
      const st = e.currentStage ?? {};
      const W = st.width ?? st.length ?? e.stageWidth ?? e.levelWidth ?? null;
      // (the rightmost platform's right edge: where the laid stage ends)
      const right = Math.max(...e.platforms.map((q) => q.x + q.width));
      const floor = e.platforms.filter((q) => q.x + q.width >= right - 400).sort((a, b) => a.y - b.y)[at === 'far' ? 0 : e.platforms.filter((q) => q.x + q.width >= right - 400).length - 1];
      e.player.x = right - 60;
      e.player.y = (floor?.y ?? e.player.y) - e.player.height;
      e.player.vx = 0; e.player.vy = 0;
      for (let i = 0; i < 90; i++) e.updateCamera(1 / 30);
      const c = e.camera;
      const keys = Object.keys(st).filter((k) => /width|len|right|end|bound/i.test(k));
      const camKeys = Object.keys(c).filter((k) => /max|min|bound|limit|clamp|world|width/i.test(k));
      return { W, keys: Object.fromEntries(keys.map((k) => [k, st[k]])), cam: Object.fromEntries(camKeys.map((k) => [k, c[k]])), camX: Math.round(c.x), viewW: c.viewportWidth, viewR: Math.round(c.x + c.viewportWidth), right: Math.round(right), px: Math.round(e.player.x) };
    }, [E, at]);
    await p.waitForTimeout(400);
    const file = path.join(out, `band-${id}-${at}-sideways.png`);
    await p.screenshot({ path: file });
    rows.push({ id, at, ...info, file });
    console.log(JSON.stringify(rows.at(-1)));
  }
  await p.close();
}
await b.close();
fs.writeFileSync(path.join(out, 'band27u.json'), JSON.stringify(rows, null, 1));
